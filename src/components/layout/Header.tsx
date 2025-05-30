
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BookHeart, Home, Library, LogIn, UserPlus } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/storybooks', label: 'My Storybooks', icon: Library },
  // Add more authenticated links later if needed, e.g. /dashboard
];

const authLinks = [
  { href: '/login', label: 'Login', icon: LogIn },
  { href: '/signup', label: 'Sign Up', icon: UserPlus },
];


export default function Header() {
  const pathname = usePathname();

  // A simple check for authentication state (replace with actual auth logic)
  const isAuthenticated = false; 

  return (
    <header className="bg-card shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary hover:text-primary/90 transition-colors">
          <BookHeart className="h-8 w-8" />
          StoryTime Studio
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4">
          {navLinks.map((link) => (
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
              <Button variant="outline" size="sm" onClick={() => alert('Logout logic here')}>
                Logout
              </Button>
            ) : (
              authLinks.map((link) => (
                <Button key={link.href} asChild variant={pathname === link.href ? "default" : "ghost"} size="sm">
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
