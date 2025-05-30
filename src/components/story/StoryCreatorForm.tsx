
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StoryCreationFormData, storyCreationSchema, StoryPage } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, FileText, Image as ImageIcon, Video, AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import { childSafeStoryGeneration, ChildSafeStoryGenerationInput } from '@/ai/flows/child-safe-story-generation';
import { generateStoryImages, GenerateStoryImagesInput } from '@/ai/flows/image-generation';
import { generateVideoClip, GenerateVideoClipInput } from '@/ai/flows/video-clip-generation';
import { Progress } from "@/components/ui/progress";

type GenerationStep = 'initial' | 'storyGenerated' | 'imagesGenerated' | 'videosGenerated';

export default function StoryCreatorForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<GenerationStep>('initial');
  
  const [rewrittenStory, setRewrittenStory] = useState<string | null>(null);
  const [storyPages, setStoryPages] = useState<StoryPage[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);

  const form = useForm<StoryCreationFormData>({
    resolver: zodResolver(storyCreationSchema),
    defaultValues: {
      storyPrompt: '',
      childAge: 5,
      voiceGender: 'female',
    },
  });

  async function handleChildSafeStoryGeneration(data: StoryCreationFormData) {
    setIsLoading(true);
    setOverallProgress(10);
    try {
      const input: ChildSafeStoryGenerationInput = {
        storyText: data.storyPrompt,
        childAge: data.childAge,
      };
      toast({ title: "Generating child-safe story...", description: "Our AI is crafting a special version for your child." });
      const result = await childSafeStoryGeneration(input);
      setOverallProgress(33);
      setRewrittenStory(result.rewrittenStory);
      setCurrentStep('storyGenerated');
      toast({ title: "Story Generated!", description: "The child-safe story is ready. Review it, then we'll generate images!" });
    } catch (error) {
      console.error("Error generating child-safe story:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to generate story. Please try again." });
      setOverallProgress(0);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleImageGeneration() {
    if (!rewrittenStory || !form.getValues('childAge')) return;
    setIsLoading(true);
    
    const pagesText = rewrittenStory.split('\\n\\n').map(text => text.trim()).filter(text => text.length > 0);
    if (pagesText.length === 0) {
      toast({ variant: "destructive", title: "Error", description: "Rewritten story is empty or could not be split into pages. Try a longer story or ensure paragraphs are separated by double line breaks." });
      setIsLoading(false);
      return;
    }

    const initialPages: StoryPage[] = pagesText.map((text, index) => ({
      pageNumber: index + 1,
      text: text,
      isLoadingImage: true,
      dataAiHint: `page ${index + 1} content` // Generic hint, can be improved
    }));
    setStoryPages(initialPages);
    setOverallProgress(40);

    try {
      const input: GenerateStoryImagesInput = {
        storyPages: pagesText.map(text => ({ pageText: text })),
        childAge: form.getValues('childAge'),
      };
      toast({ title: "Generating images...", description: `Our AI artists are drawing pictures for ${pagesText.length} page(s).` });
      
      const results = await generateStoryImages(input);
      setOverallProgress(66);
      
      const updatedPages = results.map((result, index) => ({
        pageNumber: index + 1,
        text: result.pageText,
        imageUrl: result.imageUrl,
        imageMatchesText: result.imageMatchesText,
        isLoadingImage: false,
        dataAiHint: `page ${index + 1} illustration` // Update hint
      }));
      setStoryPages(updatedPages);
      setCurrentStep('imagesGenerated');
      toast({ title: "Images Generated!", description: `Beautiful images are ready for your story. Next: video placeholders!` });

    } catch (error) {
      console.error("Error generating images:", error);
      toast({ variant: "destructive", title: "Error Generating Images", description: "Failed to generate all images. Please try again or check individual pages." });
      setStoryPages(initialPages.map(p => ({ ...p, isLoadingImage: false }))); 
      setOverallProgress(33); 
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVideoGeneration() {
    if (storyPages.length === 0 || !form.getValues('childAge') || !form.getValues('voiceGender')) return;
    setIsLoading(true);
    setOverallProgress(70);

    setStoryPages(prevPages => prevPages.map(p => ({ ...p, isLoadingVideo: true })));

    toast({ title: "Generating Video Placeholders...", description: "Setting up placeholder video clips for each page. Actual video generation is a feature in development." });

    const videoPromises = storyPages.map(async (page, index) => {
      if (!page.imageUrl) {
        // If no image, still mark as not loading video but don't attempt to generate
        return { ...page, isLoadingVideo: false, videoUrl: undefined };
      }

      const input: GenerateVideoClipInput = {
        imageDataUri: page.imageUrl, 
        storyText: page.text,
        voiceGender: form.getValues('voiceGender'),
        childAge: form.getValues('childAge'),
      };
      
      try {
        const result = await generateVideoClip(input);
         // Increment progress more granularly
        setOverallProgress(prev => Math.min(100, prev + (30 / storyPages.filter(p => p.imageUrl).length)));
        return { ...page, videoUrl: result.videoDataUri, isLoadingVideo: false };
      } catch (videoError) {
        console.error(`Error generating video placeholder for page ${page.pageNumber}:`, videoError);
        toast({ variant: "destructive", title: `Video Placeholder Error (Page ${page.pageNumber})`, description: "Could not generate video placeholder for this page." });
        return { ...page, isLoadingVideo: false, videoUrl: undefined }; // Ensure videoUrl is undefined on error
      }
    });

    try {
      const updatedPagesWithVideos = await Promise.all(videoPromises);
      setStoryPages(updatedPagesWithVideos);
      setCurrentStep('videosGenerated');
      setOverallProgress(100);
      toast({ title: "Video Placeholders Ready!", description: "Placeholder video clips have been added for pages with images. Actual video generation is a feature in development." });
    } catch (error) {
       console.error("Error during video placeholder generation process:", error);
       toast({ variant: "destructive", title: "Video Placeholder Generation Failed", description: "An unexpected error occurred while processing video placeholders." });
       setStoryPages(prevPages => prevPages.map(p => ({ ...p, isLoadingVideo: false })));
       setOverallProgress(66); // Revert progress to image generation complete
    } finally {
      setIsLoading(false);
    }
  }

  const renderCurrentStepContent = () => {
    switch (currentStep) {
      case 'initial':
        return (
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Generate Child-Safe Story
          </Button>
        );
      case 'storyGenerated':
        return (
          <Card className="mt-6 bg-background/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText /> Rewritten Story</CardTitle>
              <CardDescription>Here is the child-safe version of your story. Review it, then click below to generate images for each page.</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap font-sans text-sm p-4 bg-muted rounded-md max-h-96 overflow-y-auto border">{rewrittenStory}</pre>
            </CardContent>
            <CardFooter>
              <Button onClick={handleImageGeneration} className="w-full bg-primary hover:bg-primary/90" disabled={isLoading || !rewrittenStory}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImageIcon className="mr-2 h-4 w-4" />}
                Generate Images for Story Pages
              </Button>
            </CardFooter>
          </Card>
        );
      case 'imagesGenerated':
      case 'videosGenerated':
        return (
          <div className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileText /> Story with Media</CardTitle>
                <CardDescription>
                  Your story pages with generated images{currentStep === 'videosGenerated' && ' and video placeholders'}.
                  {currentStep === 'imagesGenerated' && ' Next, generate video placeholders.'}
                  {currentStep === 'videosGenerated' && ' All generation steps complete!'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {storyPages.map((page) => (
                  <Card key={page.pageNumber} className="p-4 bg-muted/50">
                    <h3 className="font-semibold text-lg mb-2 text-primary">Page {page.pageNumber}</h3>
                    <p className="text-foreground/80 mb-3">{page.text}</p>
                    
                    {page.isLoadingImage && <div className="flex items-center text-sm text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating image...</div>}
                    {page.imageUrl && !page.isLoadingImage && (
                      <div className="my-2">
                        <Image src={page.imageUrl} alt={`Story page ${page.pageNumber} illustration`} width={300} height={200} className="rounded-md shadow-sm border object-cover" data-ai-hint={page.dataAiHint || "story page"} />
                        {!page.imageMatchesText && (
                           <p className="text-xs text-destructive mt-1 flex items-center"><AlertTriangle className="h-3 w-3 mr-1"/> AI flagged this image as potentially not matching the text.</p>
                        )}
                      </div>
                    )}
                    {!page.imageUrl && !page.isLoadingImage && <p className="text-sm text-muted-foreground">No image for this page.</p>}


                    {currentStep === 'videosGenerated' && page.imageUrl && ( // Only show video section if image exists
                      <>
                        {page.isLoadingVideo && <div className="flex items-center text-sm text-muted-foreground mt-2"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating video placeholder...</div>}
                        {page.videoUrl && !page.isLoadingVideo && (
                           <div className="mt-2">
                             <p className="text-sm font-medium">Video Clip:</p>
                             <div className="w-full max-w-xs aspect-video bg-foreground/10 rounded-md flex items-center justify-center text-muted-foreground border">
                               <Video className="h-12 w-12" />
                               <span className="ml-2">Video Placeholder</span>
                             </div>
                             <p className="text-xs text-muted-foreground mt-1 break-all">Mock video URI: {page.videoUrl.substring(0,50)}...</p>
                             <p className="text-xs text-muted-foreground mt-1">Note: Actual video generation is a feature in development. This is a placeholder.</p>
                           </div>
                        )}
                        {!page.videoUrl && !page.isLoadingVideo && <p className="text-sm text-muted-foreground mt-2">No video placeholder for this page.</p>}
                      </>
                    )}
                  </Card>
                ))}
              </CardContent>
              {currentStep === 'imagesGenerated' && (
                 <CardFooter>
                    <Button onClick={handleVideoGeneration} className="w-full bg-primary hover:bg-primary/90" disabled={isLoading || storyPages.length === 0 || !storyPages.some(p => p.imageUrl)}>
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Video className="mr-2 h-4 w-4" />}
                      Generate Video Placeholders
                    </Button>
                  </CardFooter>
              )}
            </Card>
            {currentStep === 'videosGenerated' && (
                <Button onClick={() => {
                    form.reset();
                    setRewrittenStory(null);
                    setStoryPages([]);
                    setCurrentStep('initial');
                    setOverallProgress(0);
                    toast({ title: "New Story Started", description: "The form has been reset. Let's create another magical tale!" });
                }} variant="outline" className="w-full">
                    Start a New Story
                </Button>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleChildSafeStoryGeneration)} className="space-y-8">
        {currentStep === 'initial' && (
          <>
            <FormField
              control={form.control}
              name="storyPrompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="storyPrompt" className="text-lg font-semibold">Your Story Idea</FormLabel>
                  <FormControl>
                    <Textarea
                      id="storyPrompt"
                      placeholder="e.g., A brave little knight goes on a quest to find a friendly dragon... Try to describe a few different scenes or events!"
                      rows={6}
                      className="text-base"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Describe the story you want to create. The AI will rewrite it to be child-safe. Use double line breaks (press Enter twice) to separate ideas for different pages.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="childAge"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="childAge" className="text-lg font-semibold">Child&apos;s Age</FormLabel>
                    <FormControl>
                      <Input id="childAge" type="number" min="1" max="12" className="text-base" {...field} onChange={(e) => field.onChange(parseInt(e.target.value,10) || 0)} />
                    </FormControl>
                    <FormDescription>
                      This helps the AI tailor the story&apos;s complexity and themes.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="voiceGender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold">Voiceover Gender (for videos)</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex items-center space-x-4 pt-2"
                      >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="female" id="female" />
                          </FormControl>
                          <Label htmlFor="female" className="font-normal text-base">Female</Label>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="male" id="male" />
                          </FormControl>
                          <Label htmlFor="male" className="font-normal text-base">Male</Label>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormDescription>
                      Choose the voice for video narration placeholders.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </>
        )}
        
        {isLoading && overallProgress > 0 && (
            <div className="space-y-2 pt-4">
                <Label className="text-sm text-muted-foreground">Generation Progress: {currentStep === 'initial' ? 'Generating Story...' : currentStep === 'storyGenerated' ? 'Generating Images...' : 'Generating Video Placeholders...'}</Label>
                <Progress value={overallProgress} className="w-full" />
                <p className="text-xs text-muted-foreground text-center">{Math.round(overallProgress)}% complete</p>
            </div>
        )}

        {renderCurrentStepContent()}
      </form>
    </Form>
  );
}
