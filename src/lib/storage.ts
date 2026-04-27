import { supabase } from "@/integrations/supabase/client";

export const getStoragePathFromUrl = (url: string, bucket: string) => {
  const marker = `/${bucket}/`;
  const markerIndex = url.indexOf(marker);
  if (markerIndex >= 0) {
    return decodeURIComponent(url.slice(markerIndex + marker.length).split("?")[0]);
  }

  const objectMarker = `/object/public/${bucket}/`;
  const objectIndex = url.indexOf(objectMarker);
  if (objectIndex >= 0) {
    return decodeURIComponent(url.slice(objectIndex + objectMarker.length).split("?")[0]);
  }

  return url.includes("/") ? null : url;
};

export const createPostFileSignedUrl = async (fileUrlOrPath: string, expiresIn = 60 * 60) => {
  const path = getStoragePathFromUrl(fileUrlOrPath, "post-files");
  if (!path) return null;

  const { data, error } = await supabase.storage
    .from("post-files")
    .createSignedUrl(path, expiresIn);

  if (error) {
    console.error("Failed to create post file signed URL:", error);
    return null;
  }

  return data.signedUrl;
};
