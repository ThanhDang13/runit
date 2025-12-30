import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@web/components/ui/button";
import { Card, CardContent } from "@web/components/ui/card";
import { Badge } from "@web/components/ui/badge";
import { ScrollArea } from "@web/components/ui/scroll-area";
import {
  Code2,
  Trophy,
  Users,
  Zap,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Target,
  Brain,
  GitBranch
} from "lucide-react";
import { Spotlight } from "@web/components/ui/spotlight";
import TextShift from "@web/components/text-shift";
import { EncryptedText } from "@web/components/ui/encrypted-text";

export const Route = createFileRoute("/_u/")({
  component: Home
});

const FEATURES = [
  {
    icon: Code2,
    title: "Multi-Language Support",
    description:
      "Write code in Python, JavaScript, Java, and C++. Switch languages seamlessly with our intelligent editor.",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10"
  },
  {
    icon: Zap,
    title: "Instant Execution",
    description:
      "Run your code in real-time and get immediate feedback. No waiting, no setup required.",
    color: "text-yellow-600 dark:text-yellow-400",
    bg: "bg-yellow-500/10"
  },
  {
    icon: Trophy,
    title: "Smart Judge System",
    description:
      "Advanced test case validation with detailed feedback on time complexity and memory usage.",
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-500/10"
  },
  {
    icon: Target,
    title: "Curated Problems",
    description:
      "From beginner to expert level, our problems are designed to build your skills progressively.",
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-500/10"
  },
  {
    icon: Brain,
    title: "Learn & Improve",
    description:
      "Detailed explanations, hints, and solution approaches to help you understand algorithms better.",
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-500/10"
  },
  {
    icon: Users,
    title: "Community Driven",
    description:
      "Join thousands of developers, share solutions, and participate in weekly contests.",
    color: "text-pink-600 dark:text-pink-400",
    bg: "bg-pink-500/10"
  }
];

const STATS = [
  { label: "Active Users", value: "10K+", icon: Users },
  { label: "Problems", value: "500+", icon: Code2 },
  { label: "Solutions", value: "50K+", icon: CheckCircle2 },
  { label: "Contests", value: "Weekly", icon: Trophy }
];

function Home() {
  return (
    <ScrollArea className="h-full">
      <div className="min-h-full">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b">
          <Spotlight
            fill="hsl(var(--primary) / 0.08)"
            className="-top-40 left-0 md:-top-20 md:left-60"
          />

          <div className="relative container mx-auto max-w-6xl px-4 py-20 md:py-32">
            <div className="mx-auto max-w-3xl text-center">
              {/* Badge */}
              <Badge variant="secondary" className="mb-6 gap-1.5 px-3 py-1">
                <Sparkles className="h-3 w-3" />
                Practice. Learn. Excel.
              </Badge>

              {/* Heading */}
              <h1 className="mb-6 text-center text-4xl font-bold tracking-tight md:text-6xl">
                <EncryptedText
                  text="Master Algorithms"
                  encryptedClassName="text-primary/50"
                  revealedClassName="text-primary dark:text-primary"
                  revealDelayMs={80}
                />
                <span className="mt-4 block">
                  <EncryptedText
                    text="THROUGH PRACTICE"
                    encryptedClassName="text-primary/50"
                    revealedClassName="text-primary dark:text-primary"
                    revealDelayMs={120}
                  />
                </span>
              </h1>

              {/* Description */}
              <p className="text-muted-foreground mb-10 text-lg md:text-xl">
                <EncryptedText
                  text="Solve coding challenges, compete in contests, and sharpen your problem-solving
                skills with our interactive platform."
                  encryptedClassName="text-primary/50"
                  revealedClassName="text-primary dark:text-primary"
                  revealDelayMs={60}
                />
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button size="lg" className="gap-2" asChild>
                  <Link to="/problem-list">
                    Start Solving
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Link to="/contests">
                  <Button variant="outline" size="lg" className="gap-2">
                    <Trophy className="h-4 w-4" />
                    View Contests
                  </Button>
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-20 grid grid-cols-2 gap-4 md:grid-cols-4">
              {STATS.map((stat) => (
                <Card key={stat.label} className="border-muted/50">
                  <CardContent className="flex flex-col items-center gap-2 p-6">
                    <stat.icon className="text-muted-foreground h-5 w-5" />
                    <div className="text-center">
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <div className="text-muted-foreground text-xs">{stat.label}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-muted/30 border-b py-20">
          <div className="container mx-auto max-w-6xl px-4">
            {/* Section Header */}
            <div className="mb-12 text-center">
              <Badge variant="outline" className="mb-4">
                Features
              </Badge>
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                Everything you need to succeed
              </h2>
              <p className="text-muted-foreground mx-auto max-w-2xl">
                Our platform is built with developers in mind, providing all the tools you need to
                improve your coding skills.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature) => (
                <Card
                  key={feature.title}
                  className="group hover:border-primary/50 transition-all hover:shadow-md"
                >
                  <CardContent className="p-6">
                    <div className={`mb-4 inline-flex rounded-lg p-3 ${feature.bg}`}>
                      <feature.icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="border-b py-20">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="mb-12 text-center">
              <Badge variant="outline" className="mb-4">
                How It Works
              </Badge>
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">Simple. Effective. Fun.</h2>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <StepCard
                number="1"
                title="Choose a Problem"
                description="Browse our collection of coding challenges organized by difficulty and topic."
                icon={Target}
              />
              <StepCard
                number="2"
                title="Write Your Solution"
                description="Use our powerful code editor with syntax highlighting and autocomplete."
                icon={Code2}
              />
              <StepCard
                number="3"
                title="Submit & Learn"
                description="Get instant feedback, compare solutions, and track your progress over time."
                icon={CheckCircle2}
              />
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20">
          <div className="container mx-auto max-w-4xl px-4 text-center">
            <div className="from-primary/10 via-background to-background rounded-2xl border bg-linear-to-br p-12">
              <Trophy className="text-primary mx-auto mb-6 h-12 w-12" />
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                Ready to level up your skills?
              </h2>
              <p className="text-muted-foreground mb-8 text-lg">
                Join our community of developers and start solving problems today. No credit card
                required.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button size="lg" className="gap-2" asChild>
                  <Link to="/problem-list">
                    Get Started Free
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/submissions">View Submissions</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </ScrollArea>
  );
}

interface StepCardProps {
  number: string;
  title: string;
  description: string;
  icon: React.ElementType;
}

function StepCard({ number, title, description, icon: Icon }: StepCardProps) {
  return (
    <div className="relative">
      <div className="mb-4 flex items-center gap-4">
        <div className="bg-primary text-primary-foreground flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold">
          {number}
        </div>
        <Icon className="text-muted-foreground h-6 w-6" />
      </div>
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
