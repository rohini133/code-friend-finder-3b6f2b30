
import { useState } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProfileCard from "@/components/ProfileCard";
import SearchFilters from "@/components/SearchFilters";
import Footer from "@/components/Footer";
import { users, type UserProfile } from "@/data/users";

const Index = () => {
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>(users);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (filters: {
    query: string;
    skills: string[];
    lookingFor: string[];
    availability: string | null;
  }) => {
    setIsSearching(true);
    
    const results = users.filter(user => {
      // Filter by search query
      if (filters.query) {
        const query = filters.query.toLowerCase();
        const matchesName = user.name.toLowerCase().includes(query);
        const matchesTitle = user.title.toLowerCase().includes(query);
        const matchesLocation = user.location.toLowerCase().includes(query);
        const matchesBio = user.bio.toLowerCase().includes(query);
        const matchesSkills = user.skills.some(skill => 
          skill.name.toLowerCase().includes(query)
        );
        
        if (!(matchesName || matchesTitle || matchesLocation || matchesBio || matchesSkills)) {
          return false;
        }
      }
      
      // Filter by skills
      if (filters.skills.length > 0) {
        const hasSkill = user.skills.some(skill => 
          filters.skills.includes(skill.name)
        );
        if (!hasSkill) return false;
      }
      
      // Filter by looking for
      if (filters.lookingFor.length > 0) {
        const hasLookingFor = user.lookingFor.some(item => 
          filters.lookingFor.includes(item)
        );
        if (!hasLookingFor) return false;
      }
      
      // Filter by availability
      if (filters.availability) {
        if (user.availability !== filters.availability) return false;
      }
      
      return true;
    });
    
    setFilteredUsers(results);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      {!isSearching && <Hero />}
      
      <main className="flex-grow py-8 px-4 container max-w-6xl">
        <SearchFilters onSearch={handleSearch} />
        
        {isSearching && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">
              {filteredUsers.length} Developer{filteredUsers.length !== 1 ? 's' : ''} Found
            </h2>
            <p className="text-muted-foreground mb-6">
              Connect with developers who match your search criteria
            </p>
          </div>
        )}
        
        {filteredUsers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {filteredUsers.map(user => (
              <ProfileCard key={user.id} profile={user} />
            ))}
          </div>
        ) : (
          isSearching && (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">No matches found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search filters to find more developers
              </p>
            </div>
          )
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
