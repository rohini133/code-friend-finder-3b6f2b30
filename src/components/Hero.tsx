
import { Button } from "@/components/ui/button";
import { Search, Users, Code, Sparkles } from "lucide-react";

const Hero = () => {
  return (
    <div className="py-16 md:py-24 px-4">
      <div className="container max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Find Your Perfect 
          <span className="gradient-text"> Coding Partner</span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto">
          Connect with developers who share your interests, tech stack, and availability. 
          Build projects, learn together, and grow your network.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Button className="bg-gradient-to-r from-codeblue-600 to-codepurple-600 hover:from-codeblue-700 hover:to-codepurple-700 text-white px-8 py-6 h-auto text-base">
            <Search className="h-5 w-5 mr-2" />
            Find Developers
          </Button>
          <Button variant="outline" className="px-8 py-6 h-auto text-base">
            Create Your Profile
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-6 rounded-lg bg-white border shadow-sm">
            <div className="bg-codeblue-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <Users className="h-6 w-6 text-codeblue-700" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Find Your Match</h3>
            <p className="text-muted-foreground">Connect with developers who have complementary skills and interests.</p>
          </div>
          
          <div className="p-6 rounded-lg bg-white border shadow-sm">
            <div className="bg-codepurple-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <Code className="h-6 w-6 text-codepurple-700" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Build Together</h3>
            <p className="text-muted-foreground">Collaborate on projects, solve coding challenges, or pair program.</p>
          </div>
          
          <div className="p-6 rounded-lg bg-white border shadow-sm">
            <div className="bg-gradient-to-r from-codeblue-100 to-codepurple-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-6 w-6 text-codeblue-700" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Grow Skills</h3>
            <p className="text-muted-foreground">Learn from others, share knowledge, and level up your coding abilities.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
