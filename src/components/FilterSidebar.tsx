import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";

const FilterSidebar = () => {
  const countries = ["United States", "United Kingdom", "India", "Canada", "Australia"];
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
              variant="ghost"
              className="w-full justify-start text-sm"
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
              variant="ghost"
              className="w-full justify-start text-sm"
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
              variant="ghost"
              className="w-full justify-start text-sm"
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
              variant="ghost"
              className="w-full justify-start text-sm"
            >
              {stream}
            </Button>
          ))}
        </CollapsibleContent>
      </Collapsible>

      <div className="pt-4 border-t border-border">
        <Button variant="outline" className="w-full">
          Clear All Filters
        </Button>
      </div>
    </aside>
  );
};

export default FilterSidebar;
