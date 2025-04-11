
export type TechSkill = {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced';
};

export type UserProfile = {
  id: string;
  name: string;
  title: string;
  location: string;
  avatar: string;
  bio: string;
  skills: TechSkill[];
  lookingFor: string[];
  githubUrl?: string;
  availability: 'full-time' | 'part-time' | 'weekends' | 'evenings';
};

export const users: UserProfile[] = [
  {
    id: "1",
    name: "Alex Chen",
    title: "Full Stack Developer",
    location: "San Francisco, CA",
    avatar: "https://i.pravatar.cc/150?img=32",
    bio: "Passionate about React, TypeScript and cloud architecture. Looking for pair programming partners for open-source projects.",
    skills: [
      { name: "React", level: "advanced" },
      { name: "TypeScript", level: "advanced" },
      { name: "Node.js", level: "intermediate" },
      { name: "AWS", level: "intermediate" }
    ],
    lookingFor: ["Open Source", "Pair Programming", "Mentoring"],
    githubUrl: "https://github.com",
    availability: "evenings"
  },
  {
    id: "2",
    name: "Jordan Taylor",
    title: "Frontend Developer",
    location: "Berlin, Germany",
    avatar: "https://i.pravatar.cc/150?img=29",
    bio: "UI/UX enthusiast with a passion for creating beautiful, accessible web experiences. Looking to collaborate on creative projects.",
    skills: [
      { name: "React", level: "advanced" },
      { name: "CSS/SASS", level: "advanced" },
      { name: "Figma", level: "intermediate" },
      { name: "JavaScript", level: "advanced" }
    ],
    lookingFor: ["Design Systems", "Accessibility", "Mentee"],
    availability: "part-time"
  },
  {
    id: "3",
    name: "Sam Rodriguez",
    title: "Backend Engineer",
    location: "Austin, TX",
    avatar: "https://i.pravatar.cc/150?img=59",
    bio: "Systems architect specializing in high-performance distributed systems. Interested in finding collaborators for a new open-source project.",
    skills: [
      { name: "Go", level: "advanced" },
      { name: "Python", level: "intermediate" },
      { name: "Kubernetes", level: "advanced" },
      { name: "Database Design", level: "advanced" }
    ],
    lookingFor: ["Open Source", "Systems Design", "Mentoring"],
    githubUrl: "https://github.com",
    availability: "weekends"
  },
  {
    id: "4",
    name: "Priya Patel",
    title: "Mobile Developer",
    location: "Toronto, Canada",
    avatar: "https://i.pravatar.cc/150?img=41",
    bio: "Experienced in React Native and Flutter. Looking for teammates to build a new social app concept in the health & wellness space.",
    skills: [
      { name: "React Native", level: "advanced" },
      { name: "Flutter", level: "intermediate" },
      { name: "JavaScript", level: "advanced" },
      { name: "Firebase", level: "intermediate" }
    ],
    lookingFor: ["Startup", "Mobile Apps", "Health Tech"],
    availability: "full-time"
  },
  {
    id: "5",
    name: "Marcus Johnson",
    title: "DevOps Engineer",
    location: "London, UK",
    avatar: "https://i.pravatar.cc/150?img=53",
    bio: "Infrastructure specialist focused on automation and CI/CD. Want to connect with frontend devs to build full-stack side projects.",
    skills: [
      { name: "Docker", level: "advanced" },
      { name: "Terraform", level: "advanced" },
      { name: "AWS", level: "advanced" },
      { name: "GitHub Actions", level: "intermediate" }
    ],
    lookingFor: ["DevOps", "Automation", "Cloud Projects"],
    githubUrl: "https://github.com",
    availability: "evenings"
  },
  {
    id: "6",
    name: "Emma Wilson",
    title: "ML Engineer",
    location: "Seattle, WA",
    avatar: "https://i.pravatar.cc/150?img=13",
    bio: "Working on NLP and computer vision projects. Looking to collaborate with web developers to build AI-powered applications.",
    skills: [
      { name: "Python", level: "advanced" },
      { name: "TensorFlow", level: "advanced" },
      { name: "Data Science", level: "advanced" },
      { name: "JavaScript", level: "beginner" }
    ],
    lookingFor: ["AI Projects", "Web Integration", "Learning Frontend"],
    availability: "weekends"
  }
];

export const availabilityOptions = ["full-time", "part-time", "weekends", "evenings"];

export const techOptions = [
  "React", "TypeScript", "JavaScript", "Node.js", "Python", "Go", 
  "Ruby", "Java", "C#", "PHP", "Rust", "Kotlin", "Swift", 
  "AWS", "Azure", "Google Cloud", "Firebase", "Docker", "Kubernetes",
  "GraphQL", "REST", "CSS", "HTML", "Flutter", "React Native", "Angular", "Vue"
];

export const collaborationOptions = [
  "Open Source", "Pair Programming", "Mentoring", "Mentee", 
  "Startup", "Side Project", "Learning", "Teaching",
  "Code Review", "Design Systems", "AI Projects", "Mobile Apps"
];
