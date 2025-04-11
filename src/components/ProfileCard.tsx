
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Github, MapPin, Clock } from "lucide-react";
import { type UserProfile, type TechSkill } from "@/data/users";
import { cn } from "@/lib/utils";

const SkillBadge = ({ skill }: { skill: TechSkill }) => {
  const getSkillColor = (level: TechSkill['level']) => {
    switch (level) {
      case 'beginner':
        return 'bg-slate-100 text-slate-700 hover:bg-slate-200';
      case 'intermediate':
        return 'bg-codeblue-100 text-codeblue-700 hover:bg-codeblue-200';
      case 'advanced':
        return 'bg-codepurple-100 text-codepurple-700 hover:bg-codepurple-200';
      default:
        return 'bg-slate-100 text-slate-700 hover:bg-slate-200';
    }
  };

  return (
    <Badge variant="outline" className={cn("rounded-full font-normal", getSkillColor(skill.level))}>
      {skill.name}
    </Badge>
  );
};

const ProfileCard = ({ profile }: { profile: UserProfile }) => {
  return (
    <Card className="overflow-hidden code-card">
      <div className="h-24 bg-gradient-to-r from-codeblue-500 to-codepurple-500" />
      <CardContent className="pt-0 relative px-6">
        <div className="flex flex-col items-center -mt-12 mb-4">
          <img 
            src={profile.avatar} 
            alt={profile.name}
            className="w-24 h-24 rounded-full border-4 border-white shadow-sm"
          />
          <h3 className="mt-4 text-xl font-bold">{profile.name}</h3>
          <p className="text-sm text-muted-foreground">{profile.title}</p>
          
          <div className="flex items-center mt-2 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 mr-1" />
            <span>{profile.location}</span>
          </div>
          
          <div className="flex items-center mt-1 text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5 mr-1" />
            <span>Available: {profile.availability.replace('-', ' ')}</span>
          </div>
        </div>
        
        <div className="mt-4">
          <p className="text-sm mb-4">{profile.bio}</p>
          
          <div className="mb-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">SKILLS</p>
            <div className="flex flex-wrap gap-1.5">
              {profile.skills.map((skill, index) => (
                <SkillBadge key={index} skill={skill} />
              ))}
            </div>
          </div>
          
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">LOOKING FOR</p>
            <div className="flex flex-wrap gap-1.5">
              {profile.lookingFor.map((item, index) => (
                <Badge key={index} variant="secondary" className="rounded-full font-normal">
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex gap-2 border-t bg-muted/20 px-6 py-4">
        <Button className="w-full bg-gradient-to-r from-codeblue-600 to-codepurple-600 hover:from-codeblue-700 hover:to-codepurple-700">
          Connect
        </Button>
        {profile.githubUrl && (
          <Button variant="outline" size="icon">
            <Github className="h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ProfileCard;
