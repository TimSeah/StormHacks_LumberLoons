import { BlurFade } from "@/components/ui/blur-fade";
import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDownIcon } from "lucide-react";
import React from "react";
import { Link } from "react-router";
import TopNavigation from "../components/TopNavigation";
import { useAuth } from "../contexts/AuthContext";

const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopNavigation />

      {/* Hero Section - ~60% screen height */}
      <section className="h-[60vh] min-h-[500px] flex items-center justify-center relative">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto">
            <BlurFade inView>
              <h1 className="text-5xl font-bold mb-8 text-foreground">
                Carrie is around whe you need someone to talk to.
              </h1>
            </BlurFade>

            <BlurFade inView delay={0.1}>
              <p className="text-xl text-muted-foreground mb-12">
                Talk with carrie whenever you need that emotional support.
              </p>
            </BlurFade>

            <BlurFade inView delay={0.2}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {isAuthenticated ? (
                  <Link
                    to="/home"
                    className="inline-flex items-center justify-center px-8 py-3 bg-accent text-accent-foreground rounded-full font-medium hover:bg-accent/90 transition-colors"
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/auth"
                      className="inline-flex items-center justify-center px-8 py-3 bg-accent text-accent-foreground rounded-full font-medium hover:bg-accent/90 transition-colors"
                    >
                      Get Started
                    </Link>
                    <Link
                      to="/auth"
                      className="inline-flex items-center justify-center px-8 py-3 border border-accent text-accent rounded-full font-medium hover:bg-accent/10 transition-colors"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </BlurFade>
          </div>
        </div>
        {/* <Ripple className="-translate-y-20 opacity-80" /> */}
      </section>

      {/* Features Section */}
      <section className="py-20 bg-surface">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-card p-8 rounded-lg border">
              <h3 className="text-2xl font-semibold mb-4">AI Companion</h3>
              <p className="text-muted-foreground">
                Engage with an intelligent AI that understands your emotions and
                provides thoughtful responses.
              </p>
            </div>
            <div className="bg-card p-8 rounded-lg border">
              <h3 className="text-2xl font-semibold mb-4">24/7 Support</h3>
              <p className="text-muted-foreground">
                Available whenever you need someone to talk to, providing
                consistent emotional support.
              </p>
            </div>
            <div className="bg-card p-8 rounded-lg border">
              <h3 className="text-2xl font-semibold mb-4">Privacy First</h3>
              <p className="text-muted-foreground">
                Your conversations are private and secure, ensuring a safe space
                for expression.
              </p>
            </div>
            <div className="bg-card p-8 rounded-lg border">
              <h3 className="text-2xl font-semibold mb-4">Personalized</h3>
              <p className="text-muted-foreground">
                Learns your preferences and adapts to provide more meaningful
                interactions over time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12">
              Frequently Asked Questions
            </h2>

            <Accordion.Root type="single" collapsible className="space-y-4">
              <Accordion.Item value="item-1" className="border rounded-lg">
                <Accordion.Header>
                  <Accordion.Trigger className="flex w-full items-center justify-between p-6 text-left text-lg font-medium hover:bg-muted/50 transition-colors">
                    How does Carrie work?
                    <ChevronDownIcon className="h-5 w-5 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content className="px-6 pb-6 text-muted-foreground">
                  Carrie uses advanced AI technology to understand and respond
                  to your emotional needs through natural conversation.
                </Accordion.Content>
              </Accordion.Item>

              <Accordion.Item value="item-2" className="border rounded-lg">
                <Accordion.Header>
                  <Accordion.Trigger className="flex w-full items-center justify-between p-6 text-left text-lg font-medium hover:bg-muted/50 transition-colors">
                    Is my data secure?
                    <ChevronDownIcon className="h-5 w-5 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content className="px-6 pb-6 text-muted-foreground">
                  Yes, we prioritize your privacy. All conversations are
                  encrypted and stored securely with strict access controls.
                </Accordion.Content>
              </Accordion.Item>

              <Accordion.Item value="item-3" className="border rounded-lg">
                <Accordion.Header>
                  <Accordion.Trigger className="flex w-full items-center justify-between p-6 text-left text-lg font-medium hover:bg-muted/50 transition-colors">
                    Can Carrie replace professional therapy?
                    <ChevronDownIcon className="h-5 w-5 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content className="px-6 pb-6 text-muted-foreground">
                  Carrie is designed to complement, not replace, professional
                  mental health services. For serious concerns, please consult a
                  licensed professional.
                </Accordion.Content>
              </Accordion.Item>

              <Accordion.Item value="item-4" className="border rounded-lg">
                <Accordion.Header>
                  <Accordion.Trigger className="flex w-full items-center justify-between p-6 text-left text-lg font-medium hover:bg-muted/50 transition-colors">
                    How much does it cost?
                    <ChevronDownIcon className="h-5 w-5 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content className="px-6 pb-6 text-muted-foreground">
                  We offer both free and premium plans. The free plan includes
                  basic conversations, while premium unlocks advanced features
                  and unlimited usage.
                </Accordion.Content>
              </Accordion.Item>
            </Accordion.Root>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t bg-surface">
        <div className="container mx-auto px-4">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2026 Carrie. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
