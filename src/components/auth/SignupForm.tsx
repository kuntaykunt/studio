
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SignupFormData, signupSchema } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import type { FirebaseError } from 'firebase/app';

export default function SignupForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const router = useRouter();

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(data: SignupFormData) {
    setIsLoading(true);
    try {
      await signup(data);
      toast({
        title: "Signup Successful!",
        description: "Your account has been created. Welcome to StoryTime Studio!",
      });
      router.push('/storybooks'); // Redirect after successful signup
    } catch (error) {
      const firebaseError = error as FirebaseError;
      let errorMessage = "An unexpected error occurred during signup.";
      if (firebaseError.code === 'auth/email-already-in-use') {
        errorMessage = "This email is already registered. Try logging in.";
      } else if (firebaseError.code === 'auth/weak-password') {
        errorMessage = "The password is too weak. Please choose a stronger password.";
      } else if (firebaseError.code === 'auth/invalid-email') {
        errorMessage = "The email address is not valid.";
      }
      console.error('Signup error:', firebaseError);
      toast({
        variant: "destructive",
        title: "Signup Failed",
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="name">Full Name</FormLabel>
              <FormControl>
                <Input id="name" placeholder="Your Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
              <FormControl>
                <Input id="confirmPassword" type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Sign Up
        </Button>
      </form>
    </Form>
  );
}
