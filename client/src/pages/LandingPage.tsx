import { Link } from 'react-router-dom';
import {
  Code2,
  MessageSquare,
  Users,
  BookOpen,
  GitBranch,
  Shield,
  ArrowRight,
  Star,
} from 'lucide-react';

const features = [
  {
    icon: Code2,
    title: 'Developer Profiles',
    description:
      'Showcase your skills, experience, and portfolio with a rich Markdown-powered profile that stands out.',
  },
  {
    icon: MessageSquare,
    title: 'Technical Discussions',
    description:
      'Share knowledge through Markdown posts, engage in threaded comments, and build your reputation.',
  },
  {
    icon: Users,
    title: 'Connect & Follow',
    description:
      'Follow developers who inspire you, build your network, and stay updated with their latest work.',
  },
  {
    icon: BookOpen,
    title: 'Mentorship',
    description:
      'Learn from experienced developers or give back to the community by becoming a mentor.',
  },
  {
    icon: GitBranch,
    title: 'Real-time Messaging',
    description:
      'Chat with other developers in real-time. Discuss projects, share ideas, and collaborate.',
  },
  {
    icon: Shield,
    title: 'Privacy Controls',
    description:
      'Granular privacy settings let you control who can message you, see your email, or request mentorship.',
  },
];

const techStack = [
  'React 19',
  'TypeScript',
  'Express 5',
  'MongoDB',
  'Socket.IO',
  'Tailwind CSS',
  'Redux Toolkit',
  'RTK Query',
  'Zod',
  'Node.js',
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navbar */}
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Code2 className="h-6 w-6" />
            <span className="text-lg font-semibold">GitConnect</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link
              to="/developers"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              Developers
            </Link>
            <Link
              to="/login"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-1.5 text-sm font-medium transition-colors"
            >
              Sign up
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b">
        <div className="mx-auto max-w-6xl px-4 py-24 text-center">
          <div className="bg-muted/50 mb-6 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs">
            <Star className="h-3 w-3" />
            The developer network
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Where developers
            <br />
            <span className="text-primary">connect and grow</span>
          </h1>
          <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg">
            GitConnect is a professional social platform for developers. Share knowledge, find
            mentors, and build meaningful connections with developers worldwide.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              to="/register"
              className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium transition-colors"
            >
              Get started
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/developers"
              className="border-input hover:bg-muted inline-flex items-center gap-2 rounded-lg border px-6 py-2.5 text-sm font-medium transition-colors"
            >
              Browse developers
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Everything you need to grow as a developer
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Tools designed for technical professionals
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="hover:border-primary/30 rounded-lg border p-6 transition-colors"
              >
                <div className="bg-primary/10 mb-4 inline-flex rounded-lg p-2.5">
                  <feature.icon className="text-primary h-5 w-5" />
                </div>
                <h3 className="mb-2 text-sm font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="border-b py-20">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Built with modern technology
          </h2>
          <p className="text-muted-foreground mb-10 mt-2 text-sm">
            Production-grade stack powering the developer network
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {techStack.map((tech) => (
              <span
                key={tech}
                className="bg-secondary text-secondary-foreground rounded-lg px-4 py-2 text-sm font-medium"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Ready to join the network?
          </h2>
          <p className="text-muted-foreground mx-auto mb-8 mt-2 max-w-md text-sm">
            Create your developer profile, share your knowledge, and connect with peers.
          </p>
          <Link
            to="/register"
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium transition-colors"
          >
            Create your account
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <div className="flex items-center justify-center gap-2 text-sm">
            <Code2 className="h-4 w-4" />
            <span className="text-muted-foreground">GitConnect &mdash; The developer network</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
