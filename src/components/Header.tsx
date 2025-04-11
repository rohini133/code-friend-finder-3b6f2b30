
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Search,
  Code2,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="w-full py-4 px-4 md:px-8 border-b bg-white/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="container flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Code2 className="h-6 w-6 text-codepurple-600" />
          <span className="font-bold text-xl font-mono gradient-text">CodeFriendFinder</span>
        </div>
        
        {!isMobile ? (
          <>
            <nav className="flex items-center space-x-8">
              <a href="#" className="text-sm font-medium hover:text-codepurple-600 transition-colors">Home</a>
              <a href="#" className="text-sm font-medium hover:text-codepurple-600 transition-colors">Find Devs</a>
              <a href="#" className="text-sm font-medium hover:text-codepurple-600 transition-colors">Projects</a>
              <a href="#" className="text-sm font-medium hover:text-codepurple-600 transition-colors">About</a>
            </nav>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" className="rounded-full">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-codeblue-600 to-codepurple-600 hover:from-codeblue-700 hover:to-codepurple-700">
                Sign Up
              </Button>
            </div>
          </>
        ) : (
          <Button variant="ghost" size="icon" onClick={toggleMenu}>
            <Menu className="h-5 w-5" />
          </Button>
        )}
        
        {/* Mobile Menu */}
        <div className={cn(
          "fixed inset-0 bg-white z-50 flex flex-col p-5 transition-transform duration-300",
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        )}>
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center space-x-2">
              <Code2 className="h-6 w-6 text-codepurple-600" />
              <span className="font-bold text-xl font-mono gradient-text">CodeFriendFinder</span>
            </div>
            <Button variant="ghost" size="icon" onClick={toggleMenu}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <nav className="flex flex-col space-y-6 text-center">
            <a href="#" className="text-base font-medium py-2 hover:text-codepurple-600 transition-colors">Home</a>
            <a href="#" className="text-base font-medium py-2 hover:text-codepurple-600 transition-colors">Find Devs</a>
            <a href="#" className="text-base font-medium py-2 hover:text-codepurple-600 transition-colors">Projects</a>
            <a href="#" className="text-base font-medium py-2 hover:text-codepurple-600 transition-colors">About</a>
          </nav>
          
          <div className="mt-auto flex flex-col space-y-3 pt-6">
            <Button variant="outline" className="w-full">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            <Button className="w-full bg-gradient-to-r from-codeblue-600 to-codepurple-600 hover:from-codeblue-700 hover:to-codepurple-700">
              Sign Up
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
