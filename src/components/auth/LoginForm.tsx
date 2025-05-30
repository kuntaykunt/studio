
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginFormData, loginSchema } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import type { FirebaseError } from 'firebase/app';

export default function LoginForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(data: LoginFormData) {
    setIsLoading(true);
    try {
      await login(data);
      toast({
        title: "Login Successful!",
        description: "Welcome back! Redirecting to your storybooks...",
      });
      router.push('/storybooks'); 
    } catch (error) {
      const firebaseError = error as FirebaseError;
      let errorMessage = "An unexpected error occurred during login.";
      if (firebaseError.code === 'auth/user-not-found' || firebaseError.code === 'auth/wrong-password' || firebaseError.code === 'auth/invalid-credential') {
        errorMessage = "Invalid email or password. Please try again.";
      } else if (firebaseError.code === 'auth/invalid-email') {
        errorMessage = "The email address is not valid.";
      }
      console.error('Login error:', firebaseError);
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="email">Email Address</FormLabel>
              <FormControl>
                <Input id="email" type="email" placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="password">Password</FormLabel>
              <FormControl>
                <Input id="password" type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Log In
        </Button>
      </form>
    </Form>
  );
}
