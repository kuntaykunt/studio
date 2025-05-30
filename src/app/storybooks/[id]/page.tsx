
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Storybook } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { ArrowLeft, BookOpen, Users, AlertTriangle, Loader2, ShieldAlert, Mic, Film, Download } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getStorybookById } from '@/lib/firebase/firestoreService';
import { useToast } from '@/hooks/use-toast';
import type { Timestamp } from 'firebase/firestore';

const PLACEHOLDER_ANIMATION_URI_PREFIX = 'data:video/mp4;base64,placeholder-video-animation'; // More specific prefix
const PLACEHOLDER_AUDIO_PREFIXES = [
    'data:audio/wav;base64,placeholder-audio', 
    'data:audio/mp3;base64,placeholder-audio'
];


export default function ViewStorybookPage() {
  const router = useRouter();
  const params = useParams();
  const storybookId = params.id as string;
  
  const [storybook, setStorybook] = useState<Storybook | null | undefined>(undefined); 
  const [error, setError] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      toast({ title: "Access Denied", description: "Please log in to view this storybook.", variant: "destructive" });
      router.push('/login');
      return;
    }

    if (storybookId && user) {
      const fetchStorybook = async () => {
        try {
          const fetchedStorybook = await getStorybookById(storybookId, user.uid);
          if (fetchedStorybook) {
             setStorybook({
              ...fetchedStorybook,
              createdAt: (fetchedStorybook.createdAt as Timestamp)?.toDate ? (fetchedStorybook.createdAt as Timestamp).toDate() : new Date(fetchedStorybook.createdAt as string | number | Date),
            });
          } else {
            setError("Storybook not found or you don't have permission to view it.");
            setStorybook(null); 
          }
        } catch (err) {
          console.error("Error fetching storybook:", err);
          setError((err as Error).message || "Failed to load storybook details.");
          setStorybook(null);
        }
      };
      fetchStorybook();
    }
  }, [storybookId, user, authLoading, router, toast]);

  const handleDownloadAudio = (audioDataUri: string, pageNumber: number) => {
    const link = document.createElement('a');
    link.href = audioDataUri;
    
    let extension = '.wav'; // Default extension
    const mimeMatch = audioDataUri.match(/^data:(audio\/[^;]+);/);
    if (mimeMatch && mimeMatch[1]) {
        const mimeType = mimeMatch[1];
        if (mimeType === 'audio/mpeg') extension = '.mp3';
        else if (mimeType === 'audio/ogg') extension = '.ogg';
        else if (mimeType === 'audio/aac') extension = '.aac';
        // Add other common audio types if needed
    }
    
    link.download = `StoryPage_${pageNumber}_Voiceover${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (storybook === undefined || authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
     return (
      <div className="text-center py-12">
        <ShieldAlert className="mx-auto h-24 w-24 text-destructive mb-6" />
        <h1 className="text-4xl font-bold mb-4">Error Loading Storybook</h1>
        <p className="text-xl text-muted-foreground mb-8">
          {error}
        </p>
        <Button asChild>
          <Link href="/storybooks">
            <ArrowLeft className="mr-2 h-5 w-5" /> Back to Library
          </Link>
        </Button>
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
           <CardDescription className="text-xs text-primary/70 pt-1">
            Created on: {storybook.createdAt instanceof Date ? storybook.createdAt.toLocaleDateString() : 'N/A'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold mb-2 text-foreground/80">Original Prompt:</h3>
          <p className="text-sm p-3 bg-muted/50 rounded-md border mb-4 whitespace-pre-wrap">{storybook.originalPrompt}</p>
          
          {storybook.storyStyleDescription && (
            <>
              <h3 className="text-xl font-semibold mb-2 text-foreground/80">Visual Style:</h3>
              <p className="text-sm p-3 bg-muted/50 rounded-md border mb-4 whitespace-pre-wrap">{storybook.storyStyleDescription}</p>
            </>
          )}

          <h2 className="text-2xl font-semibold mb-4 text-foreground/90">Full Story Text (Rewritten)</h2>
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
          {storybook.pages.map((page) => {
            // Check if voiceoverUrl is defined and then if it starts with any placeholder prefixes
            const isPlaceholderAudio = !page.voiceoverUrl || PLACEHOLDER_AUDIO_PREFIXES.some(prefix => page.voiceoverUrl?.startsWith(prefix));
            // Check if animationUrl is defined and then if it starts with the placeholder prefix
            const isPlaceholderAnimation = !page.animationUrl || page.animationUrl?.startsWith(PLACEHOLDER_ANIMATION_URI_PREFIX);
            
            // For debugging the download button visibility:
            // if (page.pageNumber === 1) { // Log for the first page only
            //   console.log(`Page ${page.pageNumber} - voiceoverUrl: ${page.voiceoverUrl}, isPlaceholderAudio: ${isPlaceholderAudio}`);
            // }

            return (
              <Card key={page.pageNumber} className="shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl">
                <CardHeader className="bg-secondary/30">
                  <CardTitle className="text-2xl text-secondary-foreground">Page {page.pageNumber}</CardTitle>
                </CardHeader>
                <CardContent className="p-6 grid md:grid-cols-2 gap-6 items-start">
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-foreground/80">Page Text (Original):</h3>
                    <p className="text-base leading-relaxed text-foreground/90 whitespace-pre-wrap">{page.text}</p>
                    {page.transformedDialogue && (
                      <details className="mt-3 text-sm">
                          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">View Dialogue Script Used for TTS</summary>
                          <pre className="mt-1 p-2 bg-muted/50 rounded-md whitespace-pre-wrap border text-xs text-foreground/70 max-h-48 overflow-y-auto">{page.transformedDialogue}</pre>
                      </details>
                    )}
                  </div>
                  <div className="space-y-6"> 
                    {page.imageUrl ? (
                      <div>
                         <h3 className="text-lg font-semibold mb-2 text-foreground/80">Illustration:</h3>
                        <Image
                          src={page.imageUrl}
                          alt={`Illustration for page ${page.pageNumber}`}
                          width={400}
                          height={300}
                          className="rounded-lg border shadow-md object-cover"
                          data-ai-hint={page.dataAiHint || "story illustration"}
                        />
                        {!page.imageMatchesText && (
                          <p className="text-xs text-destructive mt-1 flex items-center"><AlertTriangle className="h-3 w-3 mr-1"/> AI flagged this image as potentially not matching the text.</p>
                        )}
                      </div>
                    ) : (
                       <div>
                         <h3 className="text-lg font-semibold mb-2 text-foreground/80">Illustration:</h3>
                         <div className="w-full aspect-[4/3] bg-muted rounded-lg flex items-center justify-center text-muted-foreground border">
                           <ImageIcon className="h-12 w-12 opacity-50" />
                           <span className="ml-2">No image generated</span>
                         </div>
                       </div>
                    )}
                    
                    {page.voiceoverUrl && !isPlaceholderAudio ? (
                       <div>
                         <h3 className="text-lg font-semibold mb-2 text-foreground/80 flex items-center gap-1"><Mic className="h-5 w-5" /> Voiceover:</h3>
                         <div className="flex flex-col gap-2">
                           <audio controls src={page.voiceoverUrl} className="w-full h-10">
                              Your browser does not support the audio element.
                           </audio>
                           <Button
                             variant="outline"
                             size="sm"
                             onClick={() => handleDownloadAudio(page.voiceoverUrl!, page.pageNumber)}
                             className="self-start"
                           >
                             <Download className="mr-2 h-4 w-4" />
                             Download Voiceover
                           </Button>
                         </div>
                      </div>
                    ) : (
                       <div>
                         <h3 className="text-lg font-semibold mb-2 text-foreground/80 flex items-center gap-1"><Mic className="h-5 w-5" /> Voiceover:</h3>
                         <div className="flex flex-col items-start p-3 border rounded-lg bg-muted/50 text-sm">
                            <div className="flex items-center text-primary mb-1">
                               <Loader2 className="h-4 w-4 animate-spin mr-2" />
                               <span>Processing voiceover...</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Actual voice generation is in development or encountered an issue. This is a placeholder.
                            </p>
                         </div>
                       </div>
                    )}

                     {page.animationUrl && page.imageUrl ? ( 
                      <div>
                         <h3 className="text-lg font-semibold mb-2 text-foreground/80 flex items-center gap-1"><Film className="h-5 w-5"/> Animation:</h3>
                         {isPlaceholderAnimation ? (
                           <div className="flex flex-col items-start p-3 border rounded-lg bg-muted/50 text-sm">
                              <div className="flex items-center text-primary mb-1">
                                 <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                 <span>Animation processing...</span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                  Actual animation generation is a feature in development. This is a placeholder.
                              </p>
                           </div>
                         ) : (
                           // This block would render a real video if isPlaceholderAnimation were false
                           <div className="w-full max-w-xs aspect-video bg-foreground/10 rounded-md flex items-center justify-center text-muted-foreground border">
                               <Film className="h-12 w-12" />
                               <span className="ml-2">Animation Content (Not Placeholder)</span> 
                           </div>
                         )}
                      </div>
                    ) : (
                       page.imageUrl && ( // Only show "no animation" if there was an image to animate
                         <div>
                           <h3 className="text-lg font-semibold mb-2 text-foreground/80 flex items-center gap-1"><Film className="h-5 w-5"/> Animation:</h3>
                            <div className="flex flex-col items-start p-3 border rounded-lg bg-muted/50 text-sm">
                                <p className="text-xs text-muted-foreground">
                                    Animation placeholder not set or feature in development.
                                </p>
                            </div>
                         </div>
                       )
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
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
