// Client-side extraction of study materials for Nova AI.
// Text-bearing formats (PDF, DOCX, PPTX, TXT) are extracted to plain text.
// Images are returned as data URLs to be sent as multimodal content.

import JSZip from "jszip";
import mammoth from "mammoth";

// pdfjs-dist v5 ESM build
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as pdfjsLib from "pdfjs-dist/build/pdf.mjs";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import pdfWorker from "pdfjs-dist/build/pdf.worker.mjs?url";
(pdfjsLib as any).GlobalWorkerOptions.workerSrc = pdfWorker;

export const MAX_FILE_BYTES = 15 * 1024 * 1024; // 15MB
export const MAX_TEXT_CHARS = 60_000; // per file

export const ACCEPTED_MIME =
  "image/png,image/jpeg,image/jpg,image/webp,application/pdf,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-powerpoint,application/msword";

export const ACCEPTED_EXT_LABEL = "PDF, DOCX, PPTX, TXT, PNG, JPG";

export type AttachmentImage = { name: string; dataUrl: string; mimeType: string };

export interface ExtractedContent {
  texts: { name: string; text: string }[];
  images: AttachmentImage[];
  errors: { name: string; reason: string }[];
}

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });

const extractPdf = async (file: File): Promise<string> => {
  const buf = await file.arrayBuffer();
  const doc = await (pdfjsLib as any).getDocument({ data: buf }).promise;
  const pages: string[] = [];
  const max = Math.min(doc.numPages, 50);
  for (let i = 1; i <= max; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const text = content.items.map((it: any) => it.str).join(" ");
    pages.push(text);
    if (pages.join("\n").length > MAX_TEXT_CHARS) break;
  }
  return pages.join("\n\n");
};

const extractDocx = async (file: File): Promise<string> => {
  const buf = await file.arrayBuffer();
  const res = await mammoth.extractRawText({ arrayBuffer: buf });
  return res.value;
};

const extractPptx = async (file: File): Promise<string> => {
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const slideFiles = Object.keys(zip.files)
    .filter((n) => /^ppt\/slides\/slide\d+\.xml$/.test(n))
    .sort((a, b) => {
      const na = parseInt(a.match(/slide(\d+)/)?.[1] ?? "0", 10);
      const nb = parseInt(b.match(/slide(\d+)/)?.[1] ?? "0", 10);
      return na - nb;
    });
  const out: string[] = [];
  for (let i = 0; i < slideFiles.length; i++) {
    const xml = await zip.files[slideFiles[i]].async("text");
    // Pull text from <a:t>…</a:t> nodes
    const matches = xml.match(/<a:t[^>]*>([\s\S]*?)<\/a:t>/g) ?? [];
    const text = matches
      .map((m) => m.replace(/<a:t[^>]*>|<\/a:t>/g, ""))
      .join(" ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
    out.push(`Slide ${i + 1}: ${text}`);
    if (out.join("\n").length > MAX_TEXT_CHARS) break;
  }
  return out.join("\n");
};

const truncate = (s: string) =>
  s.length > MAX_TEXT_CHARS ? s.slice(0, MAX_TEXT_CHARS) + "\n…[truncated]" : s;

export const extractFiles = async (files: File[]): Promise<ExtractedContent> => {
  const result: ExtractedContent = { texts: [], images: [], errors: [] };

  for (const file of files) {
    try {
      if (file.size > MAX_FILE_BYTES) {
        result.errors.push({ name: file.name, reason: "File exceeds 15MB" });
        continue;
      }
      const mime = file.type;
      const lower = file.name.toLowerCase();

      if (mime.startsWith("image/")) {
        const dataUrl = await fileToDataUrl(file);
        result.images.push({ name: file.name, dataUrl, mimeType: mime || "image/png" });
        continue;
      }
      if (mime === "application/pdf" || lower.endsWith(".pdf")) {
        const text = await extractPdf(file);
        result.texts.push({ name: file.name, text: truncate(text) });
        continue;
      }
      if (lower.endsWith(".docx") || mime.includes("wordprocessingml")) {
        const text = await extractDocx(file);
        result.texts.push({ name: file.name, text: truncate(text) });
        continue;
      }
      if (lower.endsWith(".pptx") || mime.includes("presentationml")) {
        const text = await extractPptx(file);
        result.texts.push({ name: file.name, text: truncate(text) });
        continue;
      }
      if (mime.startsWith("text/") || lower.endsWith(".txt") || lower.endsWith(".md")) {
        const text = await file.text();
        result.texts.push({ name: file.name, text: truncate(text) });
        continue;
      }
      result.errors.push({ name: file.name, reason: "Unsupported file type" });
    } catch (e: any) {
      console.error("[extractFiles]", file.name, e);
      result.errors.push({ name: file.name, reason: e?.message ?? "Could not read file" });
    }
  }

  return result;
};

export const buildAttachmentsPrompt = (texts: { name: string; text: string }[]): string => {
  if (texts.length === 0) return "";
  return (
    "\n\n--- Attached study materials ---\n" +
    texts
      .map((t) => `\n[File: ${t.name}]\n${t.text.trim() || "(no extractable text)"}`)
      .join("\n") +
    "\n--- End attachments ---"
  );
};
