"use client";

import AgentPulse from "@/components/AgentPulse";
import YoutubeVideoForm from "@/components/YoutubeVideoForm";
import {
  Brain,
  Image as ImageIcon,
  MessageSquare,
  Sparkles,
  Video,
  ChevronRight,
  Star,
  TrendingUp,
} from "lucide-react";
import { useState, useEffect } from "react";

const steps = [
  {
    title: "Connect Your Content",
    description: "Share your YouTube video URL and let your agent get to work",
    icon: Video,
  },
  {
    title: "AI Agent Analysis",
    description: "Your personal agent analyzes every aspect of your content",
    icon: Brain,
  },
  {
    title: "Receive Intelligence",
    description: "Get actionable insights and strategic recommendations",
    icon: MessageSquare,
  },
];

const features = [
  {
    title: "AI Analysis",
    description:
      "Get deep insights into your video content with our advanced AI analysis. Understand viewer engagement and content quality.",
    icon: Brain,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    highlight: "trending",
  },
  {
    title: "Smart Transcription",
    description:
      "Get accurate transcriptions of your videos. Perfect for creating subtitles, blog posts, or repurposing content.",
    icon: MessageSquare,
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
  },
  {
    title: "Thumbnail Generation",
    description:
      "Generate eye-catching thumbnails using AI. Boost your click-through rates with compelling visuals.",
    icon: ImageIcon,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    highlight: "popular",
  },
  {
    title: "Title Generation",
    description:
      "Create attention-grabbing, SEO-optimized titles for your videos using AI. Maximize views with titles that resonate with your audience.",
    icon: MessageSquare,
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-600",
  },
  {
    title: "Shot Script",
    description:
      "Get detailed, step-by-step instructions to recreate viral videos. Learn shooting techniques, angles, and editing tips from successful content.",
    icon: Video,
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
  },
  {
    title: "Discuss with Your AI Agent",
    description:
      "Engage in deep conversations about your content strategy, brainstorm ideas, and unlock new creative possibilities with your AI agent companion.",
    icon: Sparkles,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    highlight: "new",
  },
];

// Animation hook for elements entering viewport
const useIntersectionObserver = () => {
  const [observedElements, setObservedElements] = useState({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setObservedElements((prev) => ({
            ...prev,
            [(entry.target as HTMLElement).dataset.id]: entry.isIntersecting,
          }));
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll("[data-id]").forEach((el) => {
      observer.observe(el);
    });

    return () => {
      document.querySelectorAll("[data-id]").forEach((el) => {
        observer.unobserve(el);
      });
    };
  }, []);

  return observedElements;
};

export default function Home() {
  const observedElements = useIntersectionObserver();
  const [isHovered, setIsHovered] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-5xl opacity-10 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-5xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-5xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      {/* Hero Section */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <div className="flex flex-col items-center gap-12 text-center mb-16">
            <div className="relative">
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-500 to-purple-600 blur-3xl opacity-20 rounded-full transform -translate-y-1/2 scale-150"></div>
              <AgentPulse size="large" color="blue" />
            </div>

            <h1 
              data-id="hero-title" 
              className={`text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-6 transition-all duration-1000 ${
                observedElements["hero-title"] 
                  ? "opacity-100 translate-y-0" 
                  : "opacity-0 translate-y-12"
              }`}
            >
              Meet Your Personal{" "}
              <span className="relative">
                <span className="bg-gradient-to-r from-blue-600 via-purple-500 to-blue-400 bg-clip-text text-transparent">
                  AI Content Agent
                </span>
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-blue-400 opacity-50" viewBox="0 0 100 30">
                  <path d="M0,20 Q50,5 100,20" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </span>
            </h1>

            <p 
              data-id="hero-desc" 
              className={`text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto transition-all duration-1000 delay-300 ${
                observedElements["hero-desc"] 
                  ? "opacity-100 translate-y-0" 
                  : "opacity-0 translate-y-12"
              }`}
            >
              Transform your video content with AI-powered analysis,
              transcription, and insights. Get started in seconds.
            </p>

            <div 
              data-id="hero-form" 
              className={`w-full max-w-3xl mx-auto transition-all duration-1000 delay-500 ${
                observedElements["hero-form"] 
                  ? "opacity-100 translate-y-0" 
                  : "opacity-0 translate-y-12"
              }`}
            >
              <div className="p-1 bg-gradient-to-r from-blue-600 via-purple-500 to-blue-400 rounded-2xl shadow-xl">
                <div className="bg-white p-6 sm:p-8 rounded-xl">
                  <YoutubeVideoForm />
                </div>
              </div>
            </div>
          </div>

          {/* Trusted by section */}
          <div 
            data-id="trusted-by" 
            className={`mt-20 text-center transition-all duration-1000 delay-700 ${
              observedElements["trusted-by"] 
                ? "opacity-100 translate-y-0" 
                : "opacity-0 translate-y-12"
            }`}
          >
            <p className="text-gray-500 uppercase text-sm font-semibold tracking-wider mb-6">Trusted by content creators worldwide</p>
            <div className="flex flex-wrap justify-center gap-8 items-center opacity-70">
              {["YouTube", "TikTok", "Instagram", "Twitch", "LinkedIn"].map((platform) => (
                <div key={platform} className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 mr-2"></div>
                  <span className="text-gray-800 font-medium">{platform}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 sm:py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-50 z-0"></div>
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <div 
            data-id="features-title" 
            className={`text-center mb-16 transition-all duration-1000 ${
              observedElements["features-title"] 
                ? "opacity-100 translate-y-0" 
                : "opacity-0 translate-y-12"
            }`}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Powerful Features</span> for Content Creators
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI-powered tools help you create better content, faster
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  data-id={`feature-${index}`}
                  className={`relative group transition-all duration-700 delay-${index * 100} ${
                    observedElements[`feature-${index}`] 
                      ? "opacity-100 translate-y-0" 
                      : "opacity-0 translate-y-12"
                  }`}
                  onMouseEnter={() => setIsHovered(index)}
                  onMouseLeave={() => setIsHovered(null)}
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                  <div className="relative bg-white p-8 rounded-xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                    {feature.highlight && (
                      <div className="absolute top-3 right-3">
                        {feature.highlight === "new" && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            New
                          </span>
                        )}
                        {feature.highlight === "popular" && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <Star className="w-3 h-3 mr-1" />
                            Popular
                          </span>
                        )}
                        {feature.highlight === "trending" && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Trending
                          </span>
                        )}
                      </div>
                    )}
                    
                    <div
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${feature.iconBg} transition-transform duration-300 ${
                        isHovered === index ? "scale-110" : ""
                      }`}
                    >
                      <Icon className={`w-8 h-8 ${feature.iconColor}`} />
                    </div>

                    <h3 className="text-xl font-bold mb-3 text-gray-900">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 flex-grow">
                      {feature.description}
                    </p>
                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <a
                        href="#"
                        className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800 transition-colors"
                      >
                        Learn more
                        <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works sections */}
      <section className="py-24 sm:py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white z-0"></div>
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <div 
            data-id="steps-title" 
            className={`text-center mb-16 transition-all duration-1000 ${
              observedElements["steps-title"] 
                ? "opacity-100 translate-y-0" 
                : "opacity-0 translate-y-12"
            }`}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Meet Your AI Agent in <span className="text-blue-600">3 Simple Steps</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Getting started is effortless and takes less than a minute
            </p>
          </div>

          <div className="relative">
            {/* Connecting line */}
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 hidden md:block -translate-y-1/2 z-0"></div>
            
            <div className="grid md:grid-cols-3 gap-8 md:gap-12 relative z-10">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div
                    key={index}
                    data-id={`step-${index}`}
                    className={`relative transition-all duration-700 delay-${index * 200} ${
                      observedElements[`step-${index}`] 
                        ? "opacity-100 translate-y-0" 
                        : "opacity-0 translate-y-12"
                    }`}
                  >
                    <div className="text-center p-8 rounded-2xl bg-white shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 h-full">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg relative z-20">
                        <span className="absolute inset-0 rounded-full bg-blue-600 animate-ping opacity-20"></span>
                        <Icon className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold mb-4 text-gray-900">
                        {`${index + 1}. ${step.title}`}
                      </h3>
                      <p className="text-gray-600">{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 sm:py-32 relative bg-gray-50">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-100 rounded-full opacity-50 blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-100 rounded-full opacity-50 blur-3xl"></div>
        </div>
        <div 
          className="container mx-auto px-4 max-w-6xl relative z-10"
          data-id="testimonials" 
        >
          <div className={`text-center mb-16 transition-all duration-1000 ${
              observedElements["testimonials"] 
                ? "opacity-100 translate-y-0" 
                : "opacity-0 translate-y-12"
            }`}>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Loved by Content Creators
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See what our users are saying about their experience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div 
                key={i}
                data-id={`testimonial-${i}`} 
                className={`bg-white p-8 rounded-2xl shadow-xl border border-gray-100 transition-all duration-700 delay-${i * 200} ${
                  observedElements[`testimonial-${i}`] 
                    ? "opacity-100 translate-y-0" 
                    : "opacity-0 translate-y-12"
                }`}
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {["J", "S", "M"][i-1]}
                  </div>
                  <div className="ml-4">
                    <h4 className="font-bold text-gray-900">
                      {["Jamie Smith", "Sarah Johnson", "Michael Chen"][i-1]}
                    </h4>
                    <p className="text-gray-500 text-sm">
                      {["YouTube Creator", "Content Strategist", "Video Producer"][i-1]}
                    </p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600">
                  {[
                    "This AI agent completely transformed my content strategy. The insights and recommendations are spot-on and have helped me grow my channel significantly.",
                    "The thumbnail and title generation features alone are worth it. I've seen a 40% increase in click-through rates since I started using this tool.",
                    "Being able to discuss content ideas with my AI agent has been a game-changer. It's like having a creative partner available 24/7."
                  ][i-1]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section 
        className="py-24 sm:py-32 relative"
        data-id="cta-section"
      >
        <div className={`container mx-auto px-4 max-w-5xl transition-all duration-1000 ${
            observedElements["cta-section"] 
              ? "opacity-100 translate-y-0" 
              : "opacity-0 translate-y-12"
          }`}>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl blur-lg opacity-90 transform -rotate-1"></div>
            <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-grid-white/10 bg-grid"></div>
              <div className="relative p-12 sm:p-16 text-center">
                <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6">
                  Ready to Meet Your AI Content Agent?
                </h2>
                <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                  Join creators leveraging AI to unlock content insights and take your content to the next level
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button className="px-8 py-4 bg-white text-blue-600 font-bold rounded-xl shadow-xl hover:bg-gray-50 transition-all hover:shadow-2xl transform hover:-translate-y-1">
                    Get Started Now
                  </button>
                  <button className="px-8 py-4 bg-blue-700 bg-opacity-30 text-white font-bold rounded-xl border border-white border-opacity-20 hover:bg-opacity-40 transition-all">
                    See Demo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0 flex items-center">
              <AgentPulse size="small" color="white" />
              <span className="ml-2 text-xl font-bold">AI Content Agent</span>
            </div>
            <div className="flex gap-6">
              {["About", "Features", "Pricing", "Blog", "Contact"].map((item) => (
                <a key={item} href="#" className="text-gray-400 hover:text-white transition-colors">
                  {item}
                </a>
              ))}
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-gray-400 text-sm text-center">
            © {new Date().getFullYear()} AI Content Agent. All rights reserved.
          </div>
        </div>
      </footer>
      
      {/* CSS for animations */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .bg-grid {
          mask-image: linear-gradient(to bottom, transparent, black, black, transparent);
        }
        .bg-grid-white\\/10 {
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(255 255 255 / 0.1)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e");
        }
      `}</style>
    </div>
  );
}