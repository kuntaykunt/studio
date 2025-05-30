
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Storybook, StoryPage } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { ArrowLeft, BookOpen, Users, Video, AlertTriangle, Loader2 } from 'lucide-react';
import Link from 'next/link';

// Placeholder data - in a real app, this would come from a database or state management
const placeholderStorybooks: Storybook[] = [
  {
    id: '1',
    title: 'The Little Bear and The Forest Friends',
    originalPrompt: 'A story about a little bear who makes new friends in the forest.',
    childAge: 5,
    voiceGender: 'female',
    rewrittenStoryText: 'Once upon a time, in a cozy forest, lived a little bear named Barnaby. He had fluffy brown fur and a very curious nose. One sunny morning, Barnaby woke up with a happy wiggle. "Today is a good day for an adventure!" he thought.\n\nHe tiptoed out of his cozy cave and into the bright green forest. Birds were singing, and colorful butterflies fluttered by. Barnaby saw a little squirrel with a bushy tail scampering up a tree. "Hello!" called Barnaby. The squirrel peeked down, chattering a friendly reply.',
    pages: [
      { pageNumber: 1, text: 'Once upon a time, in a cozy forest, lived a little bear named Barnaby. He had fluffy brown fur and a very curious nose. One sunny morning, Barnaby woke up with a happy wiggle. "Today is a good day for an adventure!" he thought.', imageUrl: 'https://placehold.co/600x400.png', imageMatchesText: true, videoUrl: 'data:video/mp4;base64,mock-video-1' },
      { pageNumber: 2, text: 'He tiptoed out of his cozy cave and into the bright green forest. Birds were singing, and colorful butterflies fluttered by. Barnaby saw a little squirrel with a bushy tail scampering up a tree. "Hello!" called Barnaby. The squirrel peeked down, chattering a friendly reply.', imageUrl: 'https://placehold.co/600x400.png', imageMatchesText: true, videoUrl: 'data:video/mp4;base64,mock-video-2' },
    ],
    createdAt: new Date(Date.now() - 86400000 * 2),
  },
  {
    id: '2',
    title: 'Adventures in Space',
    originalPrompt: 'A young astronaut travels to a new planet.',
    childAge: 7,
    voiceGender: 'male',
    rewrittenStoryText: 'Zoom! Captain Stella blasted off in her shiny spaceship, leaving the blue Earth far behind. Her mission: to explore the mysterious Planet Floopy-doo. Through the spaceship window, stars twinkled like scattered diamonds. "Wow!" whispered Stella, her eyes wide with excitement.\n\nAfter a long journey, Planet Floopy-doo appeared. It was covered in purple grass and giant, bouncy mushrooms! Stella landed her ship gently. "Time to explore!" she declared, putting on her space helmet.',
    pages: [
      { pageNumber: 1, text: 'Zoom! Captain Stella blasted off in her shiny spaceship, leaving the blue Earth far behind. Her mission: to explore the mysterious Planet Floopy-doo. Through the spaceship window, stars twinkled like scattered diamonds. "Wow!" whispered Stella, her eyes wide with excitement.', imageUrl: 'https://placehold.co/600x400.png', imageMatchesText: false, videoUrl: 'data:video/mp4;base64,mock-video-3' },
      { pageNumber: 2, text: 'After a long journey, Planet Floopy-doo appeared. It was covered in purple grass and giant, bouncy mushrooms! Stella landed her ship gently. "Time to explore!" she declared, putting on her space helmet.', imageUrl: 'https://placehold.co/600x400.png', imageMatchesText: true, videoUrl: 'data:video/mp4;base64,mock-video-4' },
    ],
    createdAt: new Date(Date.now() - 86400000 * 5),
  },
];


export default function ViewStorybookPage() {
  const router = useRouter();
  const params = useParams();
  const storybookId = params.id as string;
  
  const [storybook, setStorybook] = useState<Storybook | null | undefined>(undefined); // undefined for loading state

  useEffect(() => {
    if (storybookId) {
      // Simulate fetching storybook data
      setTimeout(() => {
        const foundStorybook = placeholderStorybooks.find(sb => sb.id === storybookId);
        setStorybook(foundStorybook || null);
      }, 500);
    }
  }, [storybookId]);

  if (storybook === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!storybook) {
    return (
      <div className="text-center py-12">
        <BookOpen className="mx-auto h-24 w-24 text-destructive mb-6" />
        <h1 className="text-4xl font-bold mb-4">Storybook Not Found</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Oops! We couldn&apos;t find the storybook you&apos;re looking for.
        </p>
        <Button asChild>
          <Link href="/storybooks">
            <ArrowLeft className="mr-2 h-5 w-5" /> Back to Library
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Button variant="outline" onClick={() => router.push('/storybooks')} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Library
      </Button>

      <Card className="shadow-xl overflow-hidden">
        <CardHeader className="bg-primary/10 border-b p-6">
          <CardTitle className="text-3xl md:text-4xl font-bold text-primary">{storybook.title}</CardTitle>
          <CardDescription className="text-base text-primary/80 flex items-center gap-2 pt-1">
            <Users className="h-5 w-5" /> For ages {storybook.childAge} and up
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <h2 className="text-2xl font-semibold mb-4 text-foreground/90">Full Story Text</h2>
          <pre className="whitespace-pre-wrap font-sans text-base p-4 bg-muted rounded-md max-h-[400px] overflow-y-auto border">
            {storybook.rewrittenStoryText || "No full story text available."}
          </pre>
        </CardContent>
      </Card>

      <h2 className="text-3xl font-bold tracking-tight text-center text-primary mt-12 mb-8">
        Story Pages
      </h2>

      {storybook.pages.length > 0 ? (
        <div className="space-y-10">
          {storybook.pages.map((page) => (
            <Card key={page.pageNumber} className="shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl">
              <CardHeader className="bg-secondary/30">
                <CardTitle className="text-2xl text-secondary-foreground">Page {page.pageNumber}</CardTitle>
              </CardHeader>
              <CardContent className="p-6 grid md:grid-cols-2 gap-6 items-start">
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-foreground/80">Page Text:</h3>
                  <p className="text-base leading-relaxed text-foreground/90">{page.text}</p>
                </div>
                <div className="space-y-4">
                  {page.imageUrl && (
                    <div>
                       <h3 className="text-lg font-semibold mb-2 text-foreground/80">Illustration:</h3>
                      <Image
                        src={page.imageUrl}
                        alt={`Illustration for page ${page.pageNumber}`}
                        width={400}
                        height={260}
                        className="rounded-lg border shadow-md object-cover"
                        data-ai-hint="story illustration"
                      />
                      {!page.imageMatchesText && (
                        <p className="text-xs text-destructive mt-1 flex items-center"><AlertTriangle className="h-3 w-3 mr-1"/> AI flagged this image as potentially not matching the text.</p>
                      )}
                    </div>
                  )}
                  {page.videoUrl && (
                    <div>
                       <h3 className="text-lg font-semibold mb-2 text-foreground/80">Video Clip:</h3>
                       <div className="w-full max-w-xs aspect-video bg-foreground/10 rounded-md flex items-center justify-center text-muted-foreground border">
                           <Video className="h-12 w-12" />
                           <span className="ml-2">Video Placeholder</span>
                       </div>
                       <p className="text-xs text-muted-foreground mt-1 break-all">Mock video URI: {page.videoUrl.substring(0,50)}...</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-10">
          <CardContent>
            <p className="text-lg text-muted-foreground">No pages available for this storybook.</p>
          </CardContent>
        </Card>
      )}
       <div className="mt-12 text-center">
         <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
           <Link href="/storybooks/create">
             <BookOpen className="mr-2 h-5 w-5" /> Create Another Story
           </Link>
         </Button>
       </div>
    </div>
  );
}

