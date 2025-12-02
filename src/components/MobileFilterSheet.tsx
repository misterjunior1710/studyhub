import { Filter, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MobileFilterSheetProps {
  selectedCountry: string | null;
  selectedSubject: string | null;
  selectedGrade: string | null;
  selectedStream: string | null;
  onCountryChange: (country: string | null) => void;
  onSubjectChange: (subject: string | null) => void;
  onGradeChange: (grade: string | null) => void;
  onStreamChange: (stream: string | null) => void;
  onClearAll: () => void;
}

const MobileFilterSheet = ({
  selectedCountry,
  selectedSubject,
  selectedGrade,
  selectedStream,
  onCountryChange,
  onSubjectChange,
  onGradeChange,
  onStreamChange,
  onClearAll,
}: MobileFilterSheetProps) => {
  const [open, setOpen] = useState(false);

  const countries = ["United States", "United Kingdom", "India", "Canada", "Australia", "Germany", "France", "Spain", "Italy", "Netherlands", "Sweden", "Poland", "Switzerland", "Belgium", "Austria"];
  const subjects = ["Mathematics", "Physics", "Chemistry", "Biology", "Computer Science", "English", "General", "Career Advice", "Finance", "Technology", "Business", "Personal Development"];
  const grades = ["Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12", "Undergraduate", "Postgraduate", "Adult (18+)", "Working Professional"];
  const streams = ["CBSE", "IGCSE", "IB", "AP", "A-Levels", "GCSE", "State Board", "Cambridge", "Edexcel", "German Abitur", "French Baccalauréat", "Dutch VWO", "Not Applicable", "Self-Learning", "Professional Development"];

  const activeFiltersCount = [selectedCountry, selectedSubject, selectedGrade, selectedStream].filter(Boolean).length;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="lg:hidden relative">
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {activeFiltersCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <SheetHeader className="p-4 border-b border-border">
          <SheetTitle className="text-left">Filters</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="p-4 space-y-4">
            <Collapsible defaultOpen>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-2 h-auto">
                  <span className="font-medium">Country</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 pt-2">
                {countries.map((country) => (
                  <Button
                    key={country}
                    variant={selectedCountry === country ? "secondary" : "ghost"}
                    className="w-full justify-start text-sm"
                    onClick={() => onCountryChange(selectedCountry === country ? null : country)}
                  >
                    {country}
                  </Button>
                ))}
              </CollapsibleContent>
            </Collapsible>

            <Collapsible defaultOpen>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-2 h-auto">
                  <span className="font-medium">Subject</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 pt-2">
                {subjects.map((subject) => (
                  <Button
                    key={subject}
                    variant={selectedSubject === subject ? "secondary" : "ghost"}
                    className="w-full justify-start text-sm"
                    onClick={() => onSubjectChange(selectedSubject === subject ? null : subject)}
                  >
                    {subject}
                  </Button>
                ))}
              </CollapsibleContent>
            </Collapsible>

            <Collapsible defaultOpen>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-2 h-auto">
                  <span className="font-medium">Grade</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 pt-2">
                {grades.map((grade) => (
                  <Button
                    key={grade}
                    variant={selectedGrade === grade ? "secondary" : "ghost"}
                    className="w-full justify-start text-sm"
                    onClick={() => onGradeChange(selectedGrade === grade ? null : grade)}
                  >
                    {grade}
                  </Button>
                ))}
              </CollapsibleContent>
            </Collapsible>

            <Collapsible defaultOpen>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-2 h-auto">
                  <span className="font-medium">Stream</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 pt-2">
                {streams.map((stream) => (
                  <Button
                    key={stream}
                    variant={selectedStream === stream ? "secondary" : "ghost"}
                    className="w-full justify-start text-sm"
                    onClick={() => onStreamChange(selectedStream === stream ? null : stream)}
                  >
                    {stream}
                  </Button>
                ))}
              </CollapsibleContent>
            </Collapsible>
          </div>
        </ScrollArea>
        <div className="p-4 border-t border-border">
          <Button variant="outline" className="w-full" onClick={onClearAll}>
            Clear All Filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileFilterSheet;
