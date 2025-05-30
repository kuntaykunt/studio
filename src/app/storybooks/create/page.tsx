
import StoryCreatorForm from '@/components/story/StoryCreatorForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2 } from 'lucide-react';

export default function CreateStoryPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <Card className="shadow-xl">
        <CardHeader className="text-center border-b pb-6">
          <Wand2 className="mx-auto h-12 w-12 text-primary mb-3" />
          <CardTitle className="text-3xl font-bold text-primary">Create a New Story</CardTitle>
          <CardDescription className="text-lg">
            Let&apos;s craft a magical adventure for your child! Fill in the details below.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-8">
          <StoryCreatorForm />
        </CardContent>
      </Card>
    </div>
  );
}
