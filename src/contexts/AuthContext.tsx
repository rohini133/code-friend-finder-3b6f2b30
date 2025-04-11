
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

// Define fixed users for the system
const USERS = [
  {
    username: "rohini25",
    password: "Rohini@123",
    role: "admin",
    name: "Rohini Satale"
  },
  {
    username: "balaji12",
    password: "Balaji@25",
    role: "cashier",
    name: "Balaji Wagh"
  }
];

interface AuthContextType {
  isLoggedIn: boolean;
  userRole: string | null;
  userName: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuthAccess: (requiredRole?: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is logged in on component mount
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    const role = localStorage.getItem("userRole");
    const name = localStorage.getItem("username");
    
    setIsLoggedIn(loggedIn);
    setUserRole(role);
    setUserName(name);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // Find user with matching credentials
    const user = USERS.find(
      u => u.username === username && u.password === password
    );
    
    if (user) {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userRole", user.role);
      localStorage.setItem("username", user.name);
      setIsLoggedIn(true);
      setUserRole(user.role);
      setUserName(user.name);
      
      toast({
        title: "Login Successful",
        description: `Welcome back, ${user.name}!`,
      });
      
      return true;
    }
    
    toast({
      variant: "destructive",
      title: "Login Failed",
      description: "Invalid username or password. Please try again.",
    });
    
    return false;
  };

  const logout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userRole");
    localStorage.removeItem("username");
    setIsLoggedIn(false);
    setUserRole(null);
    setUserName(null);
    navigate("/login");
  };

  const checkAuthAccess = (requiredRole?: string) => {
    if (!isLoggedIn) return false;
    if (!requiredRole) return true;
    
    // If required role is "admin", only admins can access
    if (requiredRole === "admin" && userRole !== "admin") return false;
    
    // Cashiers should not have access to inventory, product details, and admin panel
    // Also restrict access to dashboard statistics
    if (userRole === "cashier" && (
      requiredRole === "inventory" || 
      requiredRole === "products" || 
      requiredRole === "admin" ||
      requiredRole === "sales_statistics"
    )) {
      return false;
    }
    
    return true;
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, userRole, userName, login, logout, checkAuthAccess }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
