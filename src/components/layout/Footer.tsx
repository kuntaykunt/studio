
export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-card border-t border-border/50 py-6 text-center">
      <div className="container mx-auto px-4">
        <p className="text-sm text-muted-foreground">
          &copy; {currentYear} StoryTime Studio. All rights reserved.
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Made with ❤️ for the Agent Development Kit Hackathon.
        </p>
      </div>
    </footer>
  );
}
