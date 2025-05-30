
"use client"; // For useState and client-side interactions eventually

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, PlusCircle, Clock, Users, Edit3, Trash2, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { Storybook } from '@/lib/types'; // Assuming types.ts is created
import { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';

// Placeholder data - replace with actual data fetching later
const placeholderStorybooks: Storybook[] = [
  {
    id: '1',
    title: 'The Little Bear and The Forest Friends',
    originalPrompt: 'A story about a little bear who makes new friends in the forest.',
    childAge: 5,
    voiceGender: 'female',
    rewrittenStoryText: 'Once upon a time, in a cozy forest, lived a little bear named Barnaby...',
    pages: [
      { pageNumber: 1, text: 'Barnaby woke up one sunny morning.', imageUrl: 'https://placehold.co/300x200.png', imageMatchesText: true, dataAiHint: "bear forest" },
      { pageNumber: 2, text: 'He decided to explore the woods.', imageUrl: 'https://placehold.co/300x200.png', imageMatchesText: true, dataAiHint: "forest path" },
    ],
    createdAt: new Date(Date.now() - 86400000 * 2), // 2 days ago
  },
  {
    id: '2',
    title: 'Adventures in Space',
    originalPrompt: 'A young astronaut travels to a new planet.',
    childAge: 7,
    voiceGender: 'male',
    rewrittenStoryText: 'Zoom! Captain Stella blasted off in her spaceship...',
    pages: [
      { pageNumber: 1, text: 'Stella looked out at the stars.', imageUrl: 'https://placehold.co/300x200.png', imageMatchesText: true, dataAiHint: "space stars" },
    ],
    createdAt: new Date(Date.now() - 86400000 * 5), // 5 days ago
  },
];


export default function StorybookLibraryPage() {
  const [storybooks, setStorybooks] = useState<Storybook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [storyToDelete, setStoryToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate fetching data
    setTimeout(() => {
      setStorybooks(placeholderStorybooks);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleDeleteStory = (id: string) => {
    setStorybooks((prevStorybooks) => prevStorybooks.filter(story => story.id !== id));
    toast({
      title: "Story Deleted",
      description: "The storybook has been removed from your library.",
    });
    setStoryToDelete(null); // Close dialog
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight text-primary">My Storybooks</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="shadow-lg animate-pulse">
              <div className="w-full h-40 bg-muted rounded-t-lg"></div>
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded w-full mb-1"></div>
                <div className="h-4 bg-muted rounded w-5/6"></div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="h-8 bg-muted rounded w-20"></div>
                <div className="h-8 bg-muted rounded w-20"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }


  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight text-primary">My Storybooks</h1>
        <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Link href="/storybooks/create">
            <PlusCircle className="mr-2 h-5 w-5" /> Create New Story
          </Link>
        </Button>
      </div>

      {storybooks.length === 0 ? (
        <Card className="text-center py-12 shadow-lg">
          <CardHeader>
            <BookOpen className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <CardTitle className="text-2xl">No Storybooks Yet!</CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              It looks like your library is empty. Why not create your first magical story?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link href="/storybooks/create">
                <PlusCircle className="mr-2 h-5 w-5" /> Start Your First Story
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {storybooks.map((story) => (
            <Card key={story.id} className="flex flex-col justify-between shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div>
                {story.pages[0]?.imageUrl && (
                  <div className="relative w-full h-40 rounded-t-lg overflow-hidden">
                    <Image 
                      src={story.pages[0].imageUrl} 
                      alt={story.title} 
                      layout="fill" 
                      objectFit="cover"
                      data-ai-hint={story.pages[0].dataAiHint || "storybook cover"} 
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-xl truncate" title={story.title}>{story.title}</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground flex items-center gap-4">
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" /> Age {story.childAge}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {story.createdAt.toLocaleDateString()}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground/80 line-clamp-3">
                    {story.originalPrompt}
                  </p>
                </CardContent>
              </div>
              <CardFooter className="flex justify-end gap-2 border-t pt-4">
                <Button variant="ghost" size="sm" title="Edit Story (Not Implemented)">
                  <Edit3 className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" title="Delete Story" className="text-destructive hover:text-destructive/80 hover:bg-destructive/10" onClick={() => setStoryToDelete(story.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  {storyToDelete === story.id && (
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to delete this story?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the storybook &quot;{story.title}&quot;.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setStoryToDelete(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteStory(story.id)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  )}
                </AlertDialog>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/storybooks/${story.id}`}>View Story</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
