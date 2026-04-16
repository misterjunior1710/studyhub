import { Filter, ChevronDown, ChevronUp } from "lucide-react";
import { COUNTRIES, getFilterSubjects, getFilterGrades, getFilterStreams } from "@/lib/constants";
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
import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

const MOBILE_FILTER_STATE_KEY = "studyhub-mobile-filter-collapse-state";

interface FilterCollapseState {
  country: boolean;
  subject: boolean;
  grade: boolean;
  stream: boolean;
}

const getInitialState = (): FilterCollapseState => {
  try {
    const saved = localStorage.getItem(MOBILE_FILTER_STATE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // Ignore localStorage errors
  }
  // Default: all collapsed
  return { country: false, subject: false, grade: false, stream: false };
};

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
  const [openState, setOpenState] = useState<FilterCollapseState>(getInitialState);

  const countries = COUNTRIES;
  const subjects = getFilterSubjects();
  const grades = getFilterGrades();
  const streams = getFilterStreams();

  const activeFiltersCount = [selectedCountry, selectedSubject, selectedGrade, selectedStream].filter(Boolean).length;

  // Persist state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(MOBILE_FILTER_STATE_KEY, JSON.stringify(openState));
    } catch {
      // Ignore localStorage errors
    }
  }, [openState]);

  const toggleFilter = (key: keyof FilterCollapseState) => {
    setOpenState((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleClearAll = () => {
    // Collapse all filters
    setOpenState({ country: false, subject: false, grade: false, stream: false });
    onClearAll();
  };

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
            <Collapsible open={openState.country} onOpenChange={() => toggleFilter("country")}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-2 h-auto">
                  <span className="font-medium">Country</span>
                  {openState.country ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
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

            <Collapsible open={openState.subject} onOpenChange={() => toggleFilter("subject")}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-2 h-auto">
                  <span className="font-medium">Subject</span>
                  {openState.subject ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
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

            <Collapsible open={openState.grade} onOpenChange={() => toggleFilter("grade")}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-2 h-auto">
                  <span className="font-medium">Grade</span>
                  {openState.grade ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
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

            <Collapsible open={openState.stream} onOpenChange={() => toggleFilter("stream")}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-2 h-auto">
                  <span className="font-medium">Stream</span>
                  {openState.stream ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
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
          <Button variant="outline" className="w-full" onClick={handleClearAll}>
            Clear All Filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileFilterSheet;
