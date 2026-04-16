import { useState, useEffect } from "react";
import { COUNTRIES, getFilterSubjects, getFilterGrades, getFilterStreams } from "@/lib/constants";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const FILTER_STATE_KEY = "studyhub-filter-collapse-state";

interface FilterCollapseState {
  country: boolean;
  subject: boolean;
  grade: boolean;
  stream: boolean;
}

const getInitialState = (): FilterCollapseState => {
  try {
    const saved = localStorage.getItem(FILTER_STATE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // Ignore localStorage errors
  }
  // Default: all collapsed
  return { country: false, subject: false, grade: false, stream: false };
};

interface FilterSidebarProps {
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

const FilterSidebar = ({
  selectedCountry,
  selectedSubject,
  selectedGrade,
  selectedStream,
  onCountryChange,
  onSubjectChange,
  onGradeChange,
  onStreamChange,
  onClearAll,
}: FilterSidebarProps) => {
  const [openState, setOpenState] = useState<FilterCollapseState>(getInitialState);

  const countries = COUNTRIES;
  const subjects = getFilterSubjects();
  const grades = getFilterGrades();
  const streams = getFilterStreams();

  // Persist state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(FILTER_STATE_KEY, JSON.stringify(openState));
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
    <aside className="w-72 shrink-0 border-r border-border bg-card p-3 space-y-2">
      <div>
        <h2 className="text-lg font-semibold mb-3">Filters</h2>
      </div>

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
        <CollapsibleContent className="space-y-0.5 pt-1">
          {countries.map((country) => (
            <Button
              key={country}
              variant={selectedCountry === country ? "secondary" : "ghost"}
              className="w-full justify-start text-sm h-8"
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
        <CollapsibleContent className="space-y-0.5 pt-1">
          {subjects.map((subject) => (
            <Button
              key={subject}
              variant={selectedSubject === subject ? "secondary" : "ghost"}
              className="w-full justify-start text-sm h-8"
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
        <CollapsibleContent className="space-y-0.5 pt-1">
          {grades.map((grade) => (
            <Button
              key={grade}
              variant={selectedGrade === grade ? "secondary" : "ghost"}
              className="w-full justify-start text-sm h-8"
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
        <CollapsibleContent className="space-y-0.5 pt-1">
          {streams.map((stream) => (
            <Button
              key={stream}
              variant={selectedStream === stream ? "secondary" : "ghost"}
              className="w-full justify-start text-sm h-8"
              onClick={() => onStreamChange(selectedStream === stream ? null : stream)}
            >
              {stream}
            </Button>
          ))}
        </CollapsibleContent>
      </Collapsible>

      <div className="pt-3 border-t border-border">
        <Button variant="outline" className="w-full" onClick={handleClearAll}>
          Clear All Filters
        </Button>
      </div>
    </aside>
  );
};

export default FilterSidebar;
