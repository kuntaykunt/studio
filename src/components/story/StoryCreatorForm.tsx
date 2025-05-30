
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StoryCreationFormData, storyCreationSchema, StoryPage, Storybook } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, FileText, Image as ImageIcon, AlertTriangle, Save, Mic, Film, Palette } from 'lucide-react';
import Image from 'next/image';
import { childSafeStoryGeneration, ChildSafeStoryGenerationInput } from '@/ai/flows/child-safe-story-generation';
import { generateStoryImages, GenerateStoryImagesInput } from '@/ai/flows/image-generation';
import { generateVoiceover, GenerateVoiceoverInput, GenerateVoiceoverOutput } from '@/ai/flows/voice-generation';
import { generateAnimation, GenerateAnimationInput } from '@/ai/flows/animation-generation';
import { Progress } from "@/components/ui/progress";
import { useAuth } from '@/contexts/AuthContext';
import { addStorybook } from '@/lib/firebase/firestoreService';
import { useRouter } from 'next/navigation';

type GenerationStep = 'initial' | 'storyGenerated' | 'imagesGenerated' | 'voiceoversGenerated' | 'animationsGenerated' | 'saved';

function getCharLimitPerPage(age: number): number {
  if (age <= 3) return 100;
  if (age <= 6) return 200;
  if (age <= 9) return 300;
  return 400;
}

function splitStoryIntoPagesBasedOnCharLimit(fullStory: string, childAge: number): string[] {
  const charLimit = getCharLimitPerPage(childAge);
  const pages: string[] = [];
  let currentStorySegment = fullStory.trim();

  while (currentStorySegment.length > 0) {
    if (currentStorySegment.length <= charLimit) {
      pages.push(currentStorySegment);
      break;
    }

    let splitPoint = -1;
    // Prefer splitting at double newlines (paragraph breaks)
    for (let i = Math.min(charLimit, currentStorySegment.length -1) ; i > 0; i--) {
      if (currentStorySegment[i] === '\n' && i > 0 && currentStorySegment[i-1] === '\n') {
        splitPoint = i + 1; // Keep the newline as part of the previous page or ensure it's not the start of the next
        break;
      }
    }
     // If no double newline, try sentence endings
    if (splitPoint === -1) {
      for (let i = Math.min(charLimit, currentStorySegment.length -1); i > 0; i--) {
        if (['.', '!', '?'].includes(currentStorySegment[i]) && (i + 1 < currentStorySegment.length && currentStorySegment[i+1] === ' ')) {
          splitPoint = i + 2; // Split after the space following sentence end
          break;
        }
      }
    }
    // If still no good split point, try the last space within the limit
    if (splitPoint === -1) {
      splitPoint = currentStorySegment.lastIndexOf(' ', charLimit);
    }
    // If no space found (very long word or no spaces), force split at charLimit
    if (splitPoint === -1 || splitPoint === 0) {
      splitPoint = charLimit;
    }

    let pageText = currentStorySegment.substring(0, splitPoint).trim();
    if (pageText.length > 0) { // Ensure no empty pages are added
        pages.push(pageText);
    }
    currentStorySegment = currentStorySegment.substring(splitPoint).trimStart();
  }

  return pages.filter(p => p.length > 0); // Final filter for any empty pages due to trimming logic
}


export default function StoryCreatorForm() {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState<GenerationStep>('initial');

  const [originalPromptText, setOriginalPromptText] = useState<string>('');
  const [rewrittenStory, setRewrittenStory] = useState<string | null>(null);
  const [storyPages, setStoryPages] = useState<StoryPage[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);

  const form = useForm<StoryCreationFormData>({
    resolver: zodResolver(storyCreationSchema),
    defaultValues: {
      title: '',
      storyPrompt: '',
      childAge: 5,
      voiceGender: 'female',
      storyStyleDescription: '',
    },
  });

  useEffect(() => {
    if (!authLoading && !user && currentStep !== 'initial') {
      toast({ variant: "destructive", title: "Authentication Required", description: "Please log in to create stories." });
      router.push('/login');
    }
  }, [user, authLoading, currentStep, router, toast]);

  async function handleChildSafeStoryGeneration(data: StoryCreationFormData) {
    if (!user) {
      toast({ variant: "destructive", title: "Not Logged In", description: "You must be logged in to generate a story." });
      return;
    }
    setIsLoading(true);
    setOverallProgress(10);
    setOriginalPromptText(data.storyPrompt);
    try {
      const input: ChildSafeStoryGenerationInput = {
        storyText: data.storyPrompt,
        childAge: data.childAge,
      };
      toast({ title: "Generating child-safe story...", description: "Our AI is crafting a special version for your child." });
      const result = await childSafeStoryGeneration(input);
      setOverallProgress(25);

      if (result.rewrittenStory.startsWith("Error: AI could not generate")) {
         toast({ variant: "destructive", title: "Story Generation Issue", description: result.rewrittenStory });
         setRewrittenStory(null);
         setCurrentStep('initial');
         setOverallProgress(0);
         setIsLoading(false);
         return;
      }
      setRewrittenStory(result.rewrittenStory);
      setCurrentStep('storyGenerated');
      toast({ title: "Story Generated!", description: "The child-safe story is ready. Next: images!" });
    } catch (error) {
      console.error("Error generating child-safe story:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to generate story. Please try again." });
      setOverallProgress(0);
      setCurrentStep('initial');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleImageGeneration() {
    if (!rewrittenStory || !form.getValues('childAge')) return;
    setIsLoading(true);

    const pagesText = splitStoryIntoPagesBasedOnCharLimit(rewrittenStory, form.getValues('childAge'));

    if (pagesText.length === 0) {
      toast({ variant: "destructive", title: "Error", description: "Rewritten story is empty or could not be split into pages." });
      setIsLoading(false);
      setOverallProgress(25);
      return;
    }

    const initialPages: StoryPage[] = pagesText.map((text, index) => ({
      pageNumber: index + 1,
      text: text,
      isLoadingImage: true,
      dataAiHint: text.substring(0, 50).split(' ').slice(0,2).join(' ').toLowerCase() || `scene ${index + 1}`
    }));
    setStoryPages(initialPages);
    setOverallProgress(30);

    try {
      const input: GenerateStoryImagesInput = {
        storyPages: pagesText.map(text => ({ pageText: text })),
        childAge: form.getValues('childAge'),
        storyStyleDescription: form.getValues('storyStyleDescription'),
      };
      toast({ title: "Generating images...", description: `Our AI artists are drawing pictures for ${pagesText.length} page(s).` });

      const results = await generateStoryImages(input);
      setOverallProgress(50);

      const updatedPages = results.map((result, index) => ({
        pageNumber: index + 1,
        text: result.pageText,
        imageUrl: result.imageUrl,
        imageMatchesText: result.imageMatchesText,
        isLoadingImage: false,
        dataAiHint: initialPages[index].dataAiHint
      }));
      setStoryPages(updatedPages);
      setCurrentStep('imagesGenerated');
      toast({ title: "Images Generated!", description: `Beautiful images are ready. Next: voiceovers!` });

    } catch (error) {
      console.error("Error generating images:", error);
      toast({ variant: "destructive", title: "Error Generating Images", description: (error as Error).message || "Failed to generate all images." });
      setStoryPages(initialPages.map(p => ({ ...p, isLoadingImage: false }))); // Mark all as not loading
      setOverallProgress(25); // Revert progress
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVoiceoverGeneration() {
    if (storyPages.length === 0 || !form.getValues('childAge') || !form.getValues('voiceGender')) return;
    setIsLoading(true);
    setOverallProgress(55);
    setStoryPages(prevPages => prevPages.map(p => ({ ...p, isLoadingVoiceover: true })));
    toast({ title: "Generating Voiceovers...", description: "AI is preparing voiceovers for each page." });

    const voiceoverPromises = storyPages.map(async (page) => {
      const input: GenerateVoiceoverInput = {
        storyText: page.text, // Original page text for dialogue transformation
        voiceGender: form.getValues('voiceGender'),
        childAge: form.getValues('childAge'),
      };
      try {
        const result: GenerateVoiceoverOutput = await generateVoiceover(input);
        return { ...page, voiceoverUrl: result.audioDataUri, transformedDialogue: result.transformedDialogue, isLoadingVoiceover: false };
      } catch (voiceError) {
        console.error(`Error generating voiceover for page ${page.pageNumber}:`, voiceError);
        return { ...page, isLoadingVoiceover: false, voiceoverUrl: undefined, transformedDialogue: `Narrator: ${page.text}` }; // Fallback dialogue
      }
    });

    try {
      const updatedPagesWithVoiceovers = await Promise.all(voiceoverPromises);
      setStoryPages(updatedPagesWithVoiceovers);
      setOverallProgress(75);
      setCurrentStep('voiceoversGenerated');
      toast({ title: "Voiceovers Generated!", description: "Next: animations!" });
    } catch (error) {
       console.error("Error during voiceover generation process:", error);
       toast({ variant: "destructive", title: "Voiceover Generation Failed", description: (error as Error).message || "An unexpected error occurred during batch voiceover generation." });
       setStoryPages(prevPages => prevPages.map(p => ({ ...p, isLoadingVoiceover: false })));
       setOverallProgress(50);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAnimationGeneration() {
    if (storyPages.length === 0 || !form.getValues('childAge')) return;
    setIsLoading(true);
    setOverallProgress(80);
    setStoryPages(prevPages => prevPages.map(p => ({ ...p, isLoadingAnimation: true })));
    toast({ title: "Preparing Animations...", description: "Animation placeholders are being set up." });

    const animationPromises = storyPages.map(async (page) => {
      if (!page.imageUrl) {
        // No image, so no animation can be based on it.
        return { ...page, isLoadingAnimation: false, animationUrl: undefined };
      }
      const input: GenerateAnimationInput = {
        imageDataUri: page.imageUrl, // This is required
        storyText: page.text,
        childAge: form.getValues('childAge'),
      };
      try {
        // This flow currently returns a placeholder.
        const result = await generateAnimation(input);
        return { ...page, animationUrl: result.animationDataUri, isLoadingAnimation: false };
      } catch (animError) {
        console.error(`Error 'generating' animation placeholder for page ${page.pageNumber}:`, animError);
        return { ...page, isLoadingAnimation: false, animationUrl: undefined };
      }
    });

    try {
      const updatedPagesWithAnimations = await Promise.all(animationPromises);
      setStoryPages(updatedPagesWithAnimations);
      setOverallProgress(100);
      setCurrentStep('animationsGenerated');
      toast({ title: "Animations Ready (Placeholders)!", description: "Your story is complete with all elements. You can now save it." });
    } catch (error) {
       console.error("Error during animation placeholder setup:", error);
       toast({ variant: "destructive", title: "Animation Setup Failed", description: (error as Error).message || "An unexpected error occurred." });
       setStoryPages(prevPages => prevPages.map(p => ({ ...p, isLoadingAnimation: false })));
       setOverallProgress(75);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSaveStorybook() {
    if (!user) {
      toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to save." });
      return;
    }
    if (!rewrittenStory || storyPages.length === 0 || !originalPromptText) {
       toast({ variant: "destructive", title: "Incomplete Story", description: "Cannot save, generation steps incomplete." });
      return;
    }
    setIsSaving(true);
    try {
      const formData = form.getValues();
      const storybookToSave: Omit<Storybook, 'id' | 'userId' | 'createdAt'> = {
        title: formData.title,
        originalPrompt: originalPromptText,
        childAge: formData.childAge,
        voiceGender: formData.voiceGender,
        storyStyleDescription: formData.storyStyleDescription,
        rewrittenStoryText: rewrittenStory,
        pages: storyPages.map(p => ({
            pageNumber: p.pageNumber,
            text: p.text, 
            transformedDialogue: p.transformedDialogue, 
            imageUrl: p.imageUrl,
            imageMatchesText: p.imageMatchesText,
            voiceoverUrl: p.voiceoverUrl,
            animationUrl: p.animationUrl,
            dataAiHint: p.dataAiHint,
        })),
      };

      await addStorybook(user.uid, storybookToSave);
      toast({ title: "Storybook Saved!", description: `"${formData.title}" added to library. Redirecting...` });
      setCurrentStep('saved');
      router.push('/storybooks');
    } catch (error) {
      console.error("Error saving storybook:", error);
      toast({ variant: "destructive", title: "Save Failed", description: (error as Error).message || "Could not save." });
    } finally {
      setIsSaving(false);
    }
  }

  const resetFormAndState = () => {
    form.reset();
    setRewrittenStory(null);
    setStoryPages([]);
    setCurrentStep('initial');
    setOverallProgress(0);
    setOriginalPromptText('');
    toast({ title: "New Story Started", description: "Form reset. Let's create!" });
  };

  const renderCurrentStepContent = () => {
    if (authLoading) {
      return <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /> <span className="ml-2">Loading user...</span></div>;
    }
     if (!user && currentStep !== 'initial') {
        return (
            <Card className="mt-6 text-center">
                <CardHeader><CardTitle>Please Log In</CardTitle><CardDescription>Log in to create stories.</CardDescription></CardHeader>
                <CardContent><Button onClick={() => router.push('/login')}>Go to Login</Button></CardContent>
            </Card>
        );
    }

    switch (currentStep) {
      case 'initial':
        return (
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading || !user || authLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Generate Child-Safe Story
          </Button>
        );
      case 'storyGenerated':
        return (
          <Card className="mt-6 bg-background/50">
            <CardHeader><CardTitle className="flex items-center gap-2"><FileText /> Rewritten Story</CardTitle><CardDescription>Review the story, then generate images.</CardDescription></CardHeader>
            <CardContent><pre className="whitespace-pre-wrap font-sans text-sm p-4 bg-muted rounded-md max-h-96 overflow-y-auto border">{rewrittenStory}</pre></CardContent>
            <CardFooter>
              <Button onClick={handleImageGeneration} className="w-full bg-primary hover:bg-primary/90" disabled={isLoading || !rewrittenStory}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImageIcon className="mr-2 h-4 w-4" />}
                Generate Images
              </Button>
            </CardFooter>
          </Card>
        );
      case 'imagesGenerated':
      case 'voiceoversGenerated':
      case 'animationsGenerated':
        return (
          <div className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileText /> Story Preview</CardTitle>
                <CardDescription>
                  {currentStep === 'imagesGenerated' && 'Images generated. Next: voiceovers.'}
                  {currentStep === 'voiceoversGenerated' && 'Voiceovers generated. Next: animations.'}
                  {currentStep === 'animationsGenerated' && 'All elements ready. Review and save!'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {storyPages.map((page) => (
                  <Card key={page.pageNumber} className="p-4 bg-muted/50">
                    <h3 className="font-semibold text-lg mb-2 text-primary">Page {page.pageNumber}</h3>
                    <p className="text-foreground/80 mb-1 whitespace-pre-wrap">Original Text: {page.text}</p>
                    {page.transformedDialogue && (
                        <details className="mb-3 text-xs">
                            <summary className="cursor-pointer text-muted-foreground hover:text-foreground">View Dialogue Script Used for TTS</summary>
                            <pre className="mt-1 p-2 bg-foreground/5 rounded-md whitespace-pre-wrap border text-foreground/70 max-h-32 overflow-y-auto">{page.transformedDialogue}</pre>
                        </details>
                    )}

                    {page.isLoadingImage && <div className="flex items-center text-sm text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating image...</div>}
                    {page.imageUrl && !page.isLoadingImage && (
                      <div className="my-2">
                        <Image src={page.imageUrl} alt={`Page ${page.pageNumber} illustration`} width={300} height={200} className="rounded-md shadow-sm border object-cover" data-ai-hint={page.dataAiHint || "story page"} />
                        {!page.imageMatchesText && <p className="text-xs text-destructive mt-1 flex items-center"><AlertTriangle className="h-3 w-3 mr-1"/> AI flagged image match.</p>}
                      </div>
                    )}
                    {!page.imageUrl && !page.isLoadingImage && <p className="text-sm text-destructive">Image generation failed for this page.</p>}

                    {(currentStep === 'voiceoversGenerated' || currentStep === 'animationsGenerated') && (
                      <>
                        {page.isLoadingVoiceover && <div className="flex items-center text-sm text-muted-foreground mt-2"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating voiceover...</div>}
                        {page.voiceoverUrl && !page.isLoadingVoiceover && (
                           <div className="mt-2">
                             <p className="text-sm font-medium flex items-center gap-1"><Mic className="h-4 w-4"/> Voiceover:</p>
                             {page.voiceoverUrl.startsWith('data:audio') ? (
                                <audio controls src={page.voiceoverUrl} className="w-full h-10 mt-1">Your browser does not support the audio element.</audio>
                             ) : (
                               <div className="w-full p-2 bg-foreground/5 rounded-md text-muted-foreground border text-xs">Voiceover processing or failed. URI: {page.voiceoverUrl.substring(0,100)}...</div>
                             )}
                             {(page.voiceoverUrl.includes('placeholder-audio') || !page.voiceoverUrl.startsWith('data:audio')) &&
                               <p className="text-xs text-muted-foreground mt-1">Actual voice generation is in development. This is a placeholder or an error occurred.</p>}
                           </div>
                        )}
                        {!page.voiceoverUrl && !page.isLoadingVoiceover && <p className="text-sm text-muted-foreground mt-2">No voiceover generated for this page.</p>}
                      </>
                    )}

                    {currentStep === 'animationsGenerated' && page.imageUrl && (
                      <>
                        {page.isLoadingAnimation && <div className="flex items-center text-sm text-muted-foreground mt-2"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Setting up animation...</div>}
                        {page.animationUrl && !page.isLoadingAnimation && (
                           <div className="mt-2">
                             <p className="text-sm font-medium flex items-center gap-1"><Film className="h-4 w-4"/> Animation:</p>
                             <div className="w-full max-w-xs aspect-video bg-foreground/10 rounded-md flex flex-col items-center justify-center text-muted-foreground border p-2">
                               <Film className="h-10 w-10 mb-1" /> 
                               <span className="text-xs text-center">Animation feature in development. Placeholder set.</span>
                             </div>
                           </div>
                        )}
                         {!page.animationUrl && !page.isLoadingAnimation && page.imageUrl && <p className="text-sm text-muted-foreground mt-2">No animation placeholder set.</p>}
                      </>
                    )}
                    {!page.imageUrl && currentStep === 'animationsGenerated' && (
                         <p className="text-sm text-muted-foreground mt-2"><Film className="inline h-4 w-4 mr-1"/>Animation skipped (no image).</p>
                    )}
                  </Card>
                ))}
              </CardContent>
              {currentStep === 'imagesGenerated' && (
                 <CardFooter>
                    <Button onClick={handleVoiceoverGeneration} className="w-full bg-primary hover:bg-primary/90" disabled={isLoading || storyPages.length === 0}>
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mic className="mr-2 h-4 w-4" />}
                      Generate Voiceovers
                    </Button>
                  </CardFooter>
              )}
              {currentStep === 'voiceoversGenerated' && (
                 <CardFooter>
                    <Button onClick={handleAnimationGeneration} className="w-full bg-primary hover:bg-primary/90" disabled={isLoading || storyPages.length === 0}>
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Film className="mr-2 h-4 w-4" />}
                      Setup Animations (Placeholders)
                    </Button>
                  </CardFooter>
              )}
               {currentStep === 'animationsGenerated' && (
                 <CardFooter className="flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                    <Button onClick={handleSaveStorybook} className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90" disabled={isSaving || isLoading || storyPages.length === 0}>
                      {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      Save Storybook
                    </Button>
                     <Button onClick={resetFormAndState} variant="outline" className="w-full sm:w-auto">
                        Create Another Story
                    </Button>
                  </CardFooter>
              )}
            </Card>
          </div>
        );
         case 'saved':
            return (
                <Card className="mt-6 text-center">
                    <CardHeader><CardTitle>Storybook Saved!</CardTitle><CardDescription>Redirecting to library...</CardDescription></CardHeader>
                    <CardContent><Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" /></CardContent>
                </Card>
            );
      default:
        return null;
    }
  };

  const getProgressLabel = () => {
    if (isSaving) return 'Saving Storybook...';
    switch(currentStep) {
        case 'initial': return 'Generating Story...';
        case 'storyGenerated': return 'Generating Images...';
        case 'imagesGenerated': return 'Generating Voiceovers...';
        case 'voiceoversGenerated': return 'Setting Up Animations...';
        default: return 'Processing...';
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleChildSafeStoryGeneration)} className="space-y-8">
        {(currentStep === 'initial') && (
          <>
            <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem><FormLabel htmlFor="title" className="text-lg font-semibold">Story Title</FormLabel><FormControl><Input id="title" placeholder="e.g., The Brave Little Knight" className="text-base" {...field} /></FormControl><FormDescription>Give your story a catchy title!</FormDescription><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="storyPrompt" render={({ field }) => (
                <FormItem><FormLabel htmlFor="storyPrompt" className="text-lg font-semibold">Your Story Idea</FormLabel><FormControl><Textarea id="storyPrompt" placeholder="Describe scenes or events. AI will rewrite and split into pages." rows={6} className="text-base" {...field} /></FormControl><FormDescription>AI will rewrite for child-safety and page division.</FormDescription><FormMessage /></FormItem>
            )}/>
             <FormField control={form.control} name="storyStyleDescription" render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="storyStyleDescription" className="text-lg font-semibold flex items-center gap-2">
                    <Palette className="h-5 w-5 text-muted-foreground"/>
                    Visual Style (Optional)
                  </FormLabel>
                  <FormControl><Textarea id="storyStyleDescription" placeholder="e.g., 'Cute cartoon style, main character is a small brown bear with a blue hat' or 'Impressionistic watercolor paintings of magical forests'" rows={3} className="text-base" {...field} /></FormControl>
                  <FormDescription>Describe the desired art style or main character to help maintain image consistency.</FormDescription>
                  <FormMessage />
                </FormItem>
            )}/>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField control={form.control} name="childAge" render={({ field }) => (
                  <FormItem><FormLabel htmlFor="childAge" className="text-lg font-semibold">Child&apos;s Age</FormLabel><FormControl><Input id="childAge" type="number" min="1" max="12" className="text-base" {...field} onChange={(e) => field.onChange(parseInt(e.target.value,10) || 0)} /></FormControl><FormDescription>Tailors complexity, page length, themes.</FormDescription><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="voiceGender" render={({ field }) => (
                  <FormItem><FormLabel className="text-lg font-semibold">Voiceover Gender</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex items-center space-x-4 pt-2">
                        <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="female" id="female" /></FormControl><Label htmlFor="female" className="font-normal text-base">Female</Label></FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="male" id="male" /></FormControl><Label htmlFor="male" className="font-normal text-base">Male</Label></FormItem>
                  </RadioGroup></FormControl><FormDescription>For voiceover placeholders.</FormDescription><FormMessage /></FormItem>
              )}/>
            </div>
          </>
        )}

        {(isLoading || isSaving) && overallProgress > 0 && currentStep !== 'saved' && (
            <div className="space-y-2 pt-4">
                <Label className="text-sm text-muted-foreground">{getProgressLabel()}</Label>
                <Progress value={isSaving ? 50 : overallProgress} className="w-full" />
                <p className="text-xs text-muted-foreground text-center">{Math.round(isSaving ? 50 : overallProgress)}% complete</p>
            </div>
        )}

        {renderCurrentStepContent()}
      </form>
    </Form>
  );
}

