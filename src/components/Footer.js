"use client";

import Link from "next/link";
import Image from "next/image";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram,
  ArrowRight,
  Heart,
  Globe,
  Users,
  TrendingUp,
  Shield,
  Star
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-gray-900 text-white overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        <div className="absolute -bottom-32 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
      </div>

      {/* Main Footer Content */}
      <div className="relative">
        {/* Top Section */}
        <div className="border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
              {/* Left Side - CTA */}
              <div className="text-center lg:text-left">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
                  Ready to find your
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                    dream job?
                  </span>
                </h3>
                <p className="text-gray-400 text-base sm:text-lg mb-4 sm:mb-6">
                  Join thousands of professionals who have already found their perfect career match.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                  <Link
                    href="/jobs"
                    className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
                  >
                    Browse Jobs
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center px-6 py-3 bg-transparent border-2 border-gray-600 text-gray-300 font-semibold rounded-lg hover:border-blue-500 hover:text-white transition-all duration-300"
                  >
                    Post a Job
                  </Link>
                </div>
              </div>

              {/* Right Side - Stats */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                <div className="text-center p-4 sm:p-6 bg-gray-800/50 rounded-lg sm:rounded-xl backdrop-blur-sm">
                  <div className="text-2xl sm:text-3xl font-bold text-blue-400 mb-1 sm:mb-2">10K+</div>
                  <div className="text-gray-400 text-xs sm:text-base">Active Jobs</div>
                </div>
                <div className="text-center p-4 sm:p-6 bg-gray-800/50 rounded-lg sm:rounded-xl backdrop-blur-sm">
                  <div className="text-2xl sm:text-3xl font-bold text-purple-400 mb-1 sm:mb-2">5K+</div>
                  <div className="text-gray-400 text-xs sm:text-base">Companies</div>
                </div>
                <div className="text-center p-4 sm:p-6 bg-gray-800/50 rounded-lg sm:rounded-xl backdrop-blur-sm">
                  <div className="text-2xl sm:text-3xl font-bold text-indigo-400 mb-1 sm:mb-2">50K+</div>
                  <div className="text-gray-400 text-xs sm:text-base">Job Seekers</div>
                </div>
                <div className="text-center p-4 sm:p-6 bg-gray-800/50 rounded-lg sm:rounded-xl backdrop-blur-sm">
                  <div className="text-2xl sm:text-3xl font-bold text-blue-400 mb-1 sm:mb-2">95%</div>
                  <div className="text-gray-400 text-xs sm:text-base">Success Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Links Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-3 mb-6">
                <Image
                  src="/Workoura Logo.png"
                  alt="Workoura"
                  width={140}
                  height={40}
                  className="h-8 w-auto brightness-0 invert"
                />
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Your trusted partner in connecting talent with opportunity. 
                We&apos;re revolutionizing the way people find their dream careers.
              </p>
              
              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-gray-400">
                  <Mail className="w-4 h-4 text-blue-400" />
                  <span>support@workoura.com</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-400">
                  <Phone className="w-4 h-4 text-blue-400" />
                  <span>+92 3212865058</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-400">
                  <MapPin className="w-4 h-4 text-blue-400" />
                  <span>Pakistan, karachi</span>
                </div>
              </div>
            </div>

            {/* For Job Seekers */}
            <div>
              <h3 className="text-lg font-semibold mb-6 flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-400" />
                For Job Seekers
              </h3>
              <ul className="space-y-3">
                  <li>
                  <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center group">
                    <ArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    Profile
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center group">
                    <ArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    About 
                  </Link>
                </li>
                <li>
                  <Link href="/jobs" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center group">
                    <ArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    Browse Jobs
                  </Link>
                </li>
                <li>
                  <Link href="/companies" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center group">
                    <ArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    Companies
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center group">
                    <ArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    My Applications
                  </Link>
                </li>
              
              </ul>
            </div>

            {/* For Employers */}
            <div>
              <h3 className="text-lg font-semibold mb-6 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-purple-400" />
                For Employers
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center group">
                    <ArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    Post Jobs
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center group">
                    <ArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    Manage Jobs
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center group">
                    <ArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    View Applications
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center group">
                    <ArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    Pricing Plans
                  </Link>
                </li>
                <li>
                  <Link href="/employer-guide" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center group">
                    <ArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    Employer Guide
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-lg font-semibold mb-6 flex items-center">
                <Globe className="w-5 h-5 mr-2 text-indigo-400" />
                Company
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/about" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center group">
                    <ArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center group">
                    <ArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center group">
                    <ArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center group">
                    <ArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center group">
                    <ArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center group">
                    <ArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0 gap-4">
              {/* Copyright */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-1 sm:gap-2 text-gray-400 text-xs sm:text-sm">
                <span>&copy; {currentYear} Workoura.</span>
                <span className="hidden sm:inline">Made with</span>
                <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                <span className="hidden sm:inline">for job seekers worldwide.</span>
              </div>

              {/* Trust Badges */}
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="flex items-center gap-1.5 sm:gap-2 text-gray-400">
                  <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                  <span className="text-xs sm:text-sm">SSL Secured</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 text-gray-400">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
                  <span className="text-xs sm:text-sm">Trusted by 1M+</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-3 sm:gap-4">
                <Link 
                  href="https://www.facebook.com/ali.farooq.1447342" 
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors duration-300 group"
                >
                  <Facebook className="w-5 h-5 text-gray-400 group-hover:text-white" />
                </Link>
                <Link 
                  href="https://x.com/AliFaro45370063" 
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-400 transition-colors duration-300 group"
                >
                  <Twitter className="w-5 h-5 text-gray-400 group-hover:text-white" />
                </Link>
                <Link 
                  href="https://www.linkedin.com/in/ali-raza-4a5762282/" 
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors duration-300 group"
                >
                  <Linkedin className="w-5 h-5 text-gray-400 group-hover:text-white" />
                </Link>
                <Link 
                  href="https://www.instagram.com/its_zyrox_x/" 
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 transition-all duration-300 group"
                >
                  <Instagram className="w-5 h-5 text-gray-400 group-hover:text-white" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
