import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

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
  const countries = ["United States", "United Kingdom", "India", "Canada", "Australia", "Germany", "France", "Spain", "Italy", "Netherlands", "Sweden", "Poland", "Switzerland", "Belgium", "Austria"];
  const subjects = ["Mathematics", "Physics", "Chemistry", "Biology", "Computer Science", "English"];
  const grades = ["Grade 9", "Grade 10", "Grade 11", "Grade 12", "Undergraduate"];
  const streams = ["CBSE", "IGCSE", "IB", "AP", "A-Levels", "State Board"];

  return (
    <aside className="w-72 shrink-0 border-r border-border bg-card p-4 space-y-4">
      <div>
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
      </div>

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

      <div className="pt-4 border-t border-border">
        <Button variant="outline" className="w-full" onClick={onClearAll}>
          Clear All Filters
        </Button>
      </div>
    </aside>
  );
};

export default FilterSidebar;
