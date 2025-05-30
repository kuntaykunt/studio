
"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BookHeart, Home, Library, LogIn, UserPlus, LogOut } from 'lucide-react';
import { useState } from 'react';

const mainNavLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/storybooks', label: 'My Storybooks', icon: Library },
];

const authLinks = [
  { href: '/login', label: 'Login', icon: LogIn },
  { href: '/signup', label: 'Sign Up', icon: UserPlus },
];


export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  
  // Simulate authentication state
  // In a real app, this would come from an auth provider/context
  const [isAuthenticated, setIsAuthenticated] = useState(false); 

  const handleLogout = () => {
    setIsAuthenticated(false);
    router.push('/');
    // Add any actual logout logic here (e.g., clearing tokens)
  };

  // This is a placeholder to simulate login for demonstration of header changes.
  // Real login happens on the login page.
  const handleLoginSimulate = () => {
    setIsAuthenticated(true);
     // router.push('/storybooks'); // Optionally navigate after simulated login from header
  };


  return (
    <header className="bg-card shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary hover:text-primary/90 transition-colors">
          <BookHeart className="h-8 w-8" />
          StoryTime Studio
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4">
          {isAuthenticated && mainNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm sm:text-base font-medium transition-colors hover:text-primary",
                pathname === link.href ? "text-primary" : "text-foreground/70"
              )}
            >
              <link.icon className="h-4 w-4 inline sm:hidden" />
              <span className="hidden sm:inline">{link.label}</span>
            </Link>
          ))}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Logout</span>
              </Button>
            ) : (
              authLinks.map((link) => (
                <Button 
                  key={link.href} 
                  asChild 
                  variant={pathname === link.href ? "default" : "ghost"} 
                  size="sm"
                  // onClick={link.href === '/login' ? handleLoginSimulate : undefined} // Example of simulating login from header
                >
                  <Link href={link.href} className="flex items-center gap-1">
                    <link.icon className="h-4 w-4" />
                    <span className="hidden md:inline">{link.label}</span>
                  </Link>
                </Button>
              ))
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
