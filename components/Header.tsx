"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AgentPulse from "./AgentPulse";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { motion } from "framer-motion";
import { Brain, ChevronDown } from "lucide-react";

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Navigation links
  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Pricing", href: "#pricing" },
  ];

  return (
    <header 
      className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "py-2 bg-white/90 backdrop-blur-md shadow-md" 
          : "py-4 bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Left - Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full opacity-70 blur-sm group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <AgentPulse size="small" color="blue" />
              </div>
            </div>
            <div className="relative overflow-hidden">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-500 to-blue-400 bg-clip-text text-transparent">
                AgentTube
              </h1>
              <motion.div 
                className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 transform translate-x-full"
                initial={false}
                animate={{ translateX: ['-100%', '0%', '0%', '100%'] }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  repeatDelay: 2
                }}
              />
            </div>
          </Link>

          {/* Middle - Navigation (Hidden on mobile) */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href}>
                <div className="relative px-4 py-2 rounded-lg text-gray-700 hover:text-gray-900 font-medium transition-colors group">
                  {link.name}
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
                </div>
              </Link>
            ))}
            <div className="relative group px-4 py-2 rounded-lg text-gray-700 hover:text-gray-900 font-medium transition-colors cursor-pointer">
              <div className="flex items-center">
                Resources
                <ChevronDown className="ml-1 w-4 h-4 transition-transform group-hover:rotate-180" />
              </div>
              
              {/* Dropdown menu */}
              <div className="absolute left-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-left">
                <div className="p-2">
                  {[
                    {name: "Documentation", icon: Brain},
                    {name: "Tutorials", icon: Brain},
                    {name: "Blog", icon: Brain},
                  ].map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <Link href="#" key={index}>
                        <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                            <Icon className="w-3 h-3 text-blue-600" />
                          </div>
                          <span className="text-sm text-gray-700">{item.name}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </nav>

          {/* Right side - Auth */}
          <div className="flex items-center gap-3">
            <SignedIn>
              <Link href="/manage-plan">
                <Button
                  variant="outline"
                  className="relative group overflow-hidden border-blue-200 hover:border-blue-400 transition-colors duration-300"
                >
                  <span className="relative z-10 font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Manage Plan
                  </span>
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-100 to-purple-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                </Button>
              </Link>

              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-0 group-hover:opacity-70 blur-sm transition-opacity duration-300"></div>
                <div className="relative p-0.5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600">
                  <div className="p-1.5 w-9 h-9 flex items-center justify-center rounded-full bg-white">
                    <UserButton afterSignOutUrl="/" />
                  </div>
                </div>
              </div>
            </SignedIn>

            <SignedOut>
              <SignInButton mode="modal">
                <Button
                  className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  <span className="relative z-10">Sign In</span>
                  <span className="absolute inset-0 h-full w-full bg-white/20 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                </Button>
              </SignInButton>
            </SignedOut>
          </div>

          {/* Mobile menu button */}
          <button 
            className="md:hidden flex flex-col w-6 h-5 justify-between"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span className={`w-full h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`w-full h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all ${menuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
            <span className={`w-full h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </button>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden transition-all duration-300 overflow-hidden ${
          menuOpen ? 'max-h-96 py-4' : 'max-h-0'
        }`}>
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href} onClick={() => setMenuOpen(false)}>
                <div className="px-3 py-2 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-50 font-medium transition-colors">
                  {link.name}
                </div>
              </Link>
            ))}
            <div className="px-3 py-2 rounded-lg text-gray-700 font-medium">
              Resources
            </div>
            <div className="pl-6 flex flex-col gap-2">
              {["Documentation", "Tutorials", "Blog"].map((item, index) => (
                <Link href="#" key={index} onClick={() => setMenuOpen(false)}>
                  <div className="px-3 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 text-sm transition-colors">
                    {item}
                  </div>
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;