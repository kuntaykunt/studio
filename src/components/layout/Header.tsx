
"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BookHeart, Home, Library, LogIn, UserPlus, LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const mainNavLinks = [
  // { href: '/', label: 'Home', icon: Home }, // Home link is now only the logo for unauthenticated users
  { href: '/storybooks', label: 'My Storybooks', icon: Library },
];

const authLinks = [
  { href: '/login', label: 'Login', icon: LogIn },
  { href: '/signup', label: 'Sign Up', icon: UserPlus },
];

export default function Header() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout, loading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      // Router push is handled by AuthContext logout
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Logout Failed",
        description: "Could not log you out. Please try again.",
      });
    }
  };

  if (loading) {
    return (
      <header className="bg-card shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary hover:text-primary/90 transition-colors">
            <BookHeart className="h-8 w-8" />
            StoryTime Studio
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-card shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary hover:text-primary/90 transition-colors">
          <BookHeart className="h-8 w-8" />
          StoryTime Studio
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4">
          {isAuthenticated && (
            <Link
              href="/"
              className={cn(
                "text-sm sm:text-base font-medium transition-colors hover:text-primary",
                pathname === "/" ? "text-primary" : "text-foreground/70"
              )}
            >
              <Home className="h-4 w-4 inline sm:hidden" />
              <span className="hidden sm:inline">Home</span>
            </Link>
          )}
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
              <>
                {user?.displayName && <span className="text-sm text-muted-foreground hidden md:inline">Hi, {user.displayName}!</span>}
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Logout</span>
                </Button>
              </>
            ) : (
              authLinks.map((link) => (
                <Button 
                  key={link.href} 
                  asChild 
                  variant={pathname === link.href ? "default" : "ghost"} 
                  size="sm"
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
