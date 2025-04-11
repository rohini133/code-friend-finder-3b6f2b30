
import { Code2, Heart } from "lucide-react";

const Footer = () => {
  const year = new Date().getFullYear();
  
  return (
    <footer className="py-8 border-t bg-white">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Code2 className="h-5 w-5 text-codepurple-600" />
            <span className="font-bold text-lg font-mono gradient-text">CodeFriendFinder</span>
          </div>
          
          <div className="text-sm text-muted-foreground mb-4 md:mb-0">
            <ul className="flex flex-wrap justify-center gap-x-6">
              <li><a href="#" className="hover:text-codepurple-600 transition-colors">Home</a></li>
              <li><a href="#" className="hover:text-codepurple-600 transition-colors">Find Developers</a></li>
              <li><a href="#" className="hover:text-codepurple-600 transition-colors">Projects</a></li>
              <li><a href="#" className="hover:text-codepurple-600 transition-colors">Community</a></li>
              <li><a href="#" className="hover:text-codepurple-600 transition-colors">About</a></li>
            </ul>
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <span>Made with</span>
            <Heart className="h-3.5 w-3.5 mx-1 text-red-500 fill-red-500" />
            <span>© {year} CodeFriendFinder</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
