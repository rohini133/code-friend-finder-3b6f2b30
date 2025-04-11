
import { useState } from "react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Filter, Search } from "lucide-react";
import { 
  techOptions, 
  collaborationOptions, 
  availabilityOptions
} from "@/data/users";

interface SearchFiltersProps {
  onSearch: (filters: {
    query: string;
    skills: string[];
    lookingFor: string[];
    availability: string | null;
  }) => void;
}

const SearchFilters = ({ onSearch }: SearchFiltersProps) => {
  const [query, setQuery] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedCollaborations, setSelectedCollaborations] = useState<string[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<string | null>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const handleAddSkill = (skill: string) => {
    if (!selectedSkills.includes(skill)) {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSelectedSkills(selectedSkills.filter(s => s !== skill));
  };

  const handleAddCollaboration = (collab: string) => {
    if (!selectedCollaborations.includes(collab)) {
      setSelectedCollaborations([...selectedCollaborations, collab]);
    }
  };

  const handleRemoveCollaboration = (collab: string) => {
    setSelectedCollaborations(selectedCollaborations.filter(c => c !== collab));
  };

  const handleSearch = () => {
    onSearch({
      query,
      skills: selectedSkills,
      lookingFor: selectedCollaborations,
      availability: selectedAvailability
    });
  };

  const handleClearAll = () => {
    setQuery("");
    setSelectedSkills([]);
    setSelectedCollaborations([]);
    setSelectedAvailability(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search developers by name, skill, or location..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="whitespace-nowrap"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {(selectedSkills.length > 0 || selectedCollaborations.length > 0 || selectedAvailability) && (
              <Badge className="ml-2 bg-codepurple-600 hover:bg-codepurple-600">
                {selectedSkills.length + selectedCollaborations.length + (selectedAvailability ? 1 : 0)}
              </Badge>
            )}
          </Button>
          <Button onClick={handleSearch} className="bg-codeblue-600 hover:bg-codeblue-700">
            Search
          </Button>
        </div>
      </div>

      {isFiltersOpen && (
        <div className="space-y-4 pt-3 border-t">
          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium">Tech Skills</h4>
              <Select onValueChange={handleAddSkill}>
                <SelectTrigger className="w-[200px] h-8 text-xs">
                  <SelectValue placeholder="Add a skill" />
                </SelectTrigger>
                <SelectContent>
                  {techOptions.map(tech => (
                    <SelectItem key={tech} value={tech} disabled={selectedSkills.includes(tech)}>
                      {tech}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {selectedSkills.map(skill => (
                <Badge key={skill} variant="secondary" className="rounded-full gap-1">
                  {skill}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-destructive" 
                    onClick={() => handleRemoveSkill(skill)}
                  />
                </Badge>
              ))}
              {selectedSkills.length === 0 && (
                <span className="text-xs text-muted-foreground">No skills selected</span>
              )}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium">Looking for</h4>
              <Select onValueChange={handleAddCollaboration}>
                <SelectTrigger className="w-[200px] h-8 text-xs">
                  <SelectValue placeholder="Add collaboration type" />
                </SelectTrigger>
                <SelectContent>
                  {collaborationOptions.map(collab => (
                    <SelectItem key={collab} value={collab} disabled={selectedCollaborations.includes(collab)}>
                      {collab}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {selectedCollaborations.map(collab => (
                <Badge key={collab} variant="secondary" className="rounded-full gap-1">
                  {collab}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-destructive" 
                    onClick={() => handleRemoveCollaboration(collab)}
                  />
                </Badge>
              ))}
              {selectedCollaborations.length === 0 && (
                <span className="text-xs text-muted-foreground">No collaboration types selected</span>
              )}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium">Availability</h4>
              {selectedAvailability && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 text-xs px-2 text-muted-foreground"
                  onClick={() => setSelectedAvailability(null)}
                >
                  Clear
                </Button>
              )}
            </div>
            <Select 
              value={selectedAvailability || ""} 
              onValueChange={(value) => setSelectedAvailability(value || null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select availability" />
              </SelectTrigger>
              <SelectContent>
                {availabilityOptions.map(option => (
                  <SelectItem key={option} value={option}>
                    {option.replace('-', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="ghost" size="sm" onClick={handleClearAll}>
              Clear all filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilters;
