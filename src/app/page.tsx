
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, ShieldCheck, ImageIcon, VideoIcon, Wand2, BookHeart } from 'lucide-react';

const features = [
  {
    icon: ShieldCheck,
    title: 'Child-Safe Story Generation',
    description: 'Our AI rewrites stories to be age-appropriate and safe for your little ones, ensuring a worry-free experience.',
    image: 'https://placehold.co/600x400.png',
    aiHint: 'child safety',
  },
  {
    icon: ImageIcon,
    title: 'AI-Powered Image Generation',
    description: 'Bring stories to life with unique, AI-generated illustrations for every page, perfectly matching the narrative.',
    image: 'https://placehold.co/600x400.png',
    aiHint: 'storybook illustration',
  },
  {
    icon: VideoIcon,
    title: 'Engaging Video Clips',
    description: 'Transform story pages into short, animated video clips with professional voiceovers, captivating young imaginations.',
    image: 'https://placehold.co/600x400.png',
    aiHint: 'kids animation',
  },
  {
    icon: Wand2,
    title: 'Interactive Storytelling',
    description: 'Create a truly immersive reading experience with interactive elements and choices that adapt to your child.',
    image: 'https://placehold.co/600x400.png',
    aiHint: 'interactive learning',
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center text-center space-y-16 py-8 md:py-12">
      {/* Hero Section */}
      <section className="w-full max-w-4xl px-4">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-primary">
          Welcome to StoryTime Studio!
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-foreground/80 max-w-2xl mx-auto">
          Craft magical, personalized, and child-safe stories with the power of AI. Generate captivating text, enchanting images, and delightful videos for an unforgettable storytelling experience.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
          <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg transform hover:scale-105 transition-transform duration-200">
            <Link href="/storybooks/create">Start Creating Stories</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="shadow-md">
            <Link href="/signup">Sign Up Now</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full max-w-6xl px-4">
        <h2 className="text-3xl font-bold tracking-tight mb-12">
          Why Choose <span className="text-primary">StoryTime Studio</span>?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="text-left overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <div className="relative w-full h-48 sm:h-60">
                <Image
                  src={feature.image}
                  alt={feature.title}
                  layout="fill"
                  objectFit="cover"
                  data-ai-hint={feature.aiHint}
                />
              </div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <feature.icon className="h-7 w-7 text-primary" />
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-foreground/70">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full max-w-4xl px-4">
        <h2 className="text-3xl font-bold tracking-tight mb-10">
          Simple Steps to Magical Stories
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-left">
          {[
            { num: 1, title: "Input Your Idea", desc: "Share your story concept and your child's age.", icon: Wand2 },
            { num: 2, title: "AI Crafts the Magic", desc: "Watch as AI generates safe text, vivid images, and charming videos.", icon: CheckCircle },
            { num: 3, title: "Share and Enjoy", desc: "Delight your child with a unique, personalized storybook.", icon: BookHeart },
          ].map(step => (
            <div key={step.num} className="flex flex-col items-center sm:items-start p-6 bg-card rounded-lg shadow-lg">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground mb-4">
                <step.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-foreground/70 text-sm">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="w-full max-w-4xl px-4 py-12 bg-primary/10 rounded-lg shadow-inner">
        <h2 className="text-3xl font-bold tracking-tight text-primary">
          Ready to Create Unforgettable Memories?
        </h2>
        <p className="mt-4 text-lg text-foreground/80 max-w-xl mx-auto">
          Join StoryTime Studio today and unlock a world of imagination for your child.
        </p>
        <Button asChild size="lg" className="mt-8 bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg transform hover:scale-105 transition-transform duration-200">
          <Link href="/storybooks/create">Get Started for Free</Link>
        </Button>
      </section>
    </div>
  );
}
