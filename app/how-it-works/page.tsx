"use client";

import { motion } from "framer-motion";
import { 
  Brain, 
  Video, 
  Sparkles, 
  ChevronRight,
  CheckCircle,
  TrendingUp,
  FileText,
  Palette,
  Target,
  Zap,
  Users,
  BarChart,
  Upload,
  Clock,
  Shield
} from "lucide-react";
import Link from "next/link";
import AgentPulse from "@/components/AgentPulse";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

const HowItWorksPage = () => {
  const [activeStep, setActiveStep] = useState(0);

  // Auto-rotate through steps
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const steps = [
    {
      number: "01",
      title: "Share Your Video",
      description: "Simply paste your YouTube video URL into AgentTube. Our AI agent immediately begins analyzing your content.",
      icon: Upload,
      color: "from-blue-500 to-purple-500",
      details: [
        "Instant YouTube integration",
        "No downloads required",
        "Secure processing"
      ]
    },
    {
      number: "02",
      title: "AI Deep Analysis",
      description: "Your personal AI agent performs comprehensive analysis using advanced machine learning to understand every aspect of your video.",
      icon: Brain,
      color: "from-purple-500 to-pink-500",
      details: [
        "Content structure analysis",
        "Engagement metrics",
        "Trend identification"
      ]
    },
    {
      number: "03",
      title: "Get Actionable Insights",
      description: "Receive personalized recommendations, generated assets, and strategic insights to elevate your content.",
      icon: TrendingUp,
      color: "from-pink-500 to-red-500",
      details: [
        "Custom thumbnails",
        "SEO-optimized titles",
        "Viral recreation scripts"
      ]
    }
  ];

  const features = [
    {
      title: "Smart Transcription",
      description: "Get word-perfect transcriptions with timestamps for captions, blogs, or content repurposing.",
      icon: FileText,
      gradient: "from-blue-500 to-cyan-500",
      benefits: ["Auto-generated subtitles", "Blog post creation", "Quote extraction"]
    },
    {
      title: "Thumbnail Generation",
      description: "AI creates eye-catching thumbnails designed to maximize click-through rates.",
      icon: Palette,
      gradient: "from-purple-500 to-pink-500",
      benefits: ["A/B testing ready", "Brand consistent", "High CTR optimization"]
    },
    {
      title: "Title Optimization",
      description: "Generate compelling, SEO-friendly titles that capture attention and rank higher.",
      icon: Target,
      gradient: "from-green-500 to-emerald-500",
      benefits: ["Keyword optimization", "Emotional triggers", "Search ranking boost"]
    },
    {
      title: "Viral Script Blueprint",
      description: "Detailed shot-by-shot breakdowns to recreate successful video formats.",
      icon: Video,
      gradient: "from-orange-500 to-red-500",
      benefits: ["Camera angles", "Timing sequences", "Editing techniques"]
    },
    {
      title: "AI Strategy Agent",
      description: "Your personal content strategist providing tailored advice and creative ideas.",
      icon: Sparkles,
      gradient: "from-indigo-500 to-purple-500",
      benefits: ["Content planning", "Trend analysis", "Growth tactics"]
    },
    {
      title: "Performance Analytics",
      description: "Deep insights into what makes your content work and how to improve it.",
      icon: BarChart,
      gradient: "from-teal-500 to-blue-500",
      benefits: ["Engagement metrics", "Retention analysis", "Competitor comparison"]
    }
  ];

  const benefits = [
    {
      title: "Save Hours of Work",
      description: "Automate tedious tasks and focus on creating",
      icon: Clock
    },
    {
      title: "Grow Your Channel",
      description: "Data-driven insights to increase views and subscribers",
      icon: Users
    },
    {
      title: "Stay Ahead of Trends",
      description: "AI identifies what's working before it goes viral",
      icon: TrendingUp
    },
    {
      title: "Professional Quality",
      description: "Studio-grade thumbnails and optimized content",
      icon: Shield
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="container mx-auto max-w-6xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="flex justify-center mb-6">
              <div className="relative">
                <AgentPulse size="large" color="blue" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              How <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">AgentTube</span> Works
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transform your YouTube content with AI-powered insights. Our intelligent agent analyzes, optimizes, and helps you create viral-worthy videos.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Three Simple Steps to <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Content Excellence</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our AI agent handles the complex analysis while you focus on creating amazing content
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = activeStep === index;
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                  onClick={() => setActiveStep(index)}
                  className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                    isActive ? 'border-purple-400 shadow-xl scale-105' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {/* Step number */}
                  <div className={`absolute -top-4 left-6 px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r ${step.color} text-white`}>
                    Step {step.number}
                  </div>

                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${step.color} p-3 mb-4 text-white`}>
                    <Icon className="w-full h-full" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-gray-600 mb-4">{step.description}</p>

                  {/* Details */}
                  <ul className="space-y-2">
                    {step.details.map((detail, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-500">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                        {detail}
                      </li>
                    ))}
                  </ul>

                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeStep"
                      className="absolute inset-0 border-2 border-purple-500 rounded-2xl -z-10"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Powerful Features for <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Content Creators</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Every tool you need to analyze, optimize, and elevate your YouTube content
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="group relative p-6 bg-white rounded-xl border border-gray-200 hover:shadow-xl transition-all duration-300"
                >
                  {/* Gradient overlay on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 rounded-xl transition-opacity`}></div>

                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.gradient} p-2.5 text-white mb-4`}>
                    <Icon className="w-full h-full" />
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{feature.description}</p>

                  {/* Benefits */}
                  <ul className="space-y-1">
                    {feature.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-center text-xs text-gray-500">
                        <Zap className="w-3 h-3 mr-1.5 text-yellow-500" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Creators Choose <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">AgentTube</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center">
                    <Icon className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="font-bold mb-2">{benefit.title}</h3>
                  <p className="text-sm text-gray-600">{benefit.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Content?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of creators using AI to grow their channels
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
                  Start Analyzing
                  <ChevronRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="/past-videos">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  View Past Analysis
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

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
      `}</style>
    </div>
  );
};

export default HowItWorksPage;