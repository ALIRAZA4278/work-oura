"use client";

import Link from "next/link";
import { Search, Briefcase, Users, TrendingUp, ArrowRight, CheckCircle, Star, Globe, Shield, Zap } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

export default function Home() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const [showLoginError, setShowLoginError] = useState(false);

  const handlePostJob = (e) => {
    e.preventDefault();
    if (!isSignedIn) {
      setShowLoginError(true);
      setTimeout(() => setShowLoginError(false), 3000);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-32 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24 xl:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            {/* Left Column - Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-100 text-blue-800 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6">
                <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                #1 Job Platform
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4 sm:mb-6">
                Find Your
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  Dream Job
                </span>
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 leading-relaxed">
                Connect with top companies worldwide and discover opportunities that match your skills.
                Join millions of professionals who found their perfect career.
              </p>
              
              {showLoginError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 font-medium">Please log in or sign up before posting a job.</p>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
                <Link
                  href="/jobs"
                  className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm sm:text-base font-semibold rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Browse Jobs
                  <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
                <button
                  onClick={handlePostJob}
                  className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 text-black text-sm sm:text-base font-semibold rounded-lg sm:rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300"
                >
                  Post a Job
                </button>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs sm:text-sm text-gray-500">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 mr-1.5 sm:mr-2" />
                  1M+ Job Seekers
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 mr-1.5 sm:mr-2" />
                  50K+ Companies
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 mr-1.5 sm:mr-2" />
                  100% Secure
                </div>
              </div>
            </div>

            {/* Right Column - Visual */}
            <div className="relative hidden lg:block">
              {/* Main illustration container */}
              <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl p-8 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="bg-white rounded-2xl p-6 space-y-4">
                  {/* Mock job cards */}
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">Senior Developer</h4>
                      <p className="text-sm text-gray-500">TechCorp • Remote</p>
                    </div>
                    <div className="text-blue-600 font-semibold">$120k</div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">Product Manager</h4>
                      <p className="text-sm text-gray-500">StartupXYZ • New York</p>
                    </div>
                    <div className="text-blue-600 font-semibold">$140k</div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
                    <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">UI/UX Designer</h4>
                      <p className="text-sm text-gray-500">Design Studio • Remote</p>
                    </div>
                    <div className="text-blue-600 font-semibold">$95k</div>
                  </div>
                </div>
                
                {/* Floating elements */}
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-indigo-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <Star className="w-8 h-8 text-white" />
                </div>
                
                <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Why Choose JobBoard?
            </h2>
          </div>

          <div className="space-y-12 sm:space-y-16 lg:space-y-20">
            {/* Feature 1 - Quality Jobs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
              <div className="relative">
                {/* Quality Jobs Illustration */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="w-full h-64 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center relative">
                      {/* Computer Screen */}
                      <div className="bg-gray-800 rounded-lg p-3 w-48 h-32 relative">
                        <div className="bg-white rounded-md h-full flex flex-col">
                          <div className="bg-blue-600 h-2 rounded-t-md"></div>
                          <div className="flex-1 p-2 space-y-1">
                            <div className="bg-gray-200 h-2 rounded w-3/4"></div>
                            <div className="bg-gray-200 h-2 rounded w-1/2"></div>
                            <div className="bg-blue-200 h-2 rounded w-2/3"></div>
                          </div>
                        </div>
                      </div>
                      {/* Person Figure */}
                      <div className="absolute right-4 bottom-4">
                        <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                        <div className="w-6 h-12 bg-purple-600 rounded-lg mx-auto mt-1"></div>
                        <div className="flex space-x-1 mt-1">
                          <div className="w-2 h-6 bg-gray-700 rounded"></div>
                          <div className="w-2 h-6 bg-gray-700 rounded"></div>
                        </div>
                      </div>
                      {/* Magnifying Glass */}
                      <div className="absolute top-4 left-4">
                        <div className="w-12 h-12 border-4 border-blue-600 rounded-full relative">
                          <div className="absolute -bottom-2 -right-2 w-4 h-1 bg-blue-600 rounded rotate-45"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Decorative elements */}
                  <div className="absolute top-4 right-4 w-8 h-8 bg-blue-400 rounded-full opacity-30"></div>
                  <div className="absolute bottom-6 left-6 w-6 h-6 bg-indigo-400 rounded-full opacity-40"></div>
                  <div className="absolute top-12 right-12 w-4 h-4 bg-blue-300 rounded-full opacity-50"></div>
                </div>
              </div>


              <div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">QUALITY JOBS</h3>
                <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                  Test interfaces, interaction flows, iconography and more, to help you create intuitive and delightful experiences for your users.
                </p>
              </div>
            </div>

            {/* Feature 2 - Easy Applications */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
              <div className="lg:order-2 relative">
                {/* Easy Applications Illustration */}
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-3xl p-8 relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="w-full h-64 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center relative">
                      {/* Mobile Phone */}
                      <div className="bg-gray-800 rounded-xl p-2 w-32 h-56 relative">
                        <div className="bg-white rounded-lg h-full flex flex-col">
                          <div className="bg-purple-600 h-8 rounded-t-lg flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                          <div className="flex-1 p-2 space-y-2">
                            {[1,2,3,4,5].map((item) => (
                              <div key={item} className="flex items-center space-x-2">
                                <div className="w-4 h-4 bg-blue-300 rounded-full"></div>
                                <div className="flex-1 space-y-1">
                                  <div className="bg-gray-200 h-1 rounded w-full"></div>
                                  <div className="bg-gray-100 h-1 rounded w-2/3"></div>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="bg-purple-600 h-6 rounded-b-lg flex items-center justify-center">
                            <div className="w-3 h-3 bg-white rounded-full"></div>
                          </div>
                        </div>
                      </div>
                      {/* Person with phone */}
                      <div className="absolute right-8 bottom-8">
                        <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
                        <div className="w-8 h-16 bg-blue-600 rounded-lg mx-auto mt-1 relative">
                          <div className="absolute -right-2 top-2 w-3 h-6 bg-gray-800 rounded"></div>
                        </div>
                        <div className="flex space-x-1 mt-1">
                          <div className="w-2 h-8 bg-gray-700 rounded"></div>
                          <div className="w-2 h-8 bg-gray-700 rounded"></div>
                        </div>
                      </div>
                      {/* Floating icons */}
                      <div className="absolute top-6 left-8 w-6 h-6 bg-purple-400 rounded-lg opacity-60"></div>
                      <div className="absolute top-16 right-4 w-4 h-4 bg-blue-400 rounded-full opacity-70"></div>
                    </div>
                  </div>
                  {/* Decorative elements */}
                  <div className="absolute top-4 left-4 w-6 h-6 bg-purple-400 rounded-full opacity-30"></div>
                  <div className="absolute bottom-4 right-4 w-8 h-8 bg-blue-400 rounded-full opacity-40"></div>
                  <div className="absolute top-16 left-12 w-4 h-4 bg-purple-300 rounded-full opacity-50"></div>
                </div>
              </div>


              <div className="lg:order-1">
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">EASY APPLICATIONS</h3>
                <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                  Fine-tune landing pages, messaging, and creative, helping you optimise conversion rates on marketing campaigns and product launches.
                </p>
              </div>
            </div>

            {/* Feature 3 - Career Growth */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
              <div className="relative">
                {/* Career Growth Illustration */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="w-full h-64 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center relative">
                      {/* Growth Chart */}
                      <div className="relative w-48 h-32">
                        {/* Chart bars */}
                        <div className="absolute bottom-0 left-4 w-6 h-12 bg-blue-400 rounded-t"></div>
                        <div className="absolute bottom-0 left-12 w-6 h-16 bg-blue-500 rounded-t"></div>
                        <div className="absolute bottom-0 left-20 w-6 h-20 bg-blue-600 rounded-t"></div>
                        <div className="absolute bottom-0 left-28 w-6 h-24 bg-purple-600 rounded-t"></div>
                        
                        {/* Arrow */}
                        <div className="absolute top-4 right-8 w-12 h-1 bg-purple-600 transform rotate-12">
                          <div className="absolute -right-1 -top-1 w-0 h-0 border-l-4 border-b-2 border-t-2 border-l-purple-600 border-b-transparent border-t-transparent"></div>
                        </div>
                        
                        {/* Dollar sign */}
                        <div className="absolute top-2 left-2 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          $
                        </div>
                      </div>
                      
                      {/* Person jumping */}
                      <div className="absolute right-4 bottom-4">
                        <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                        <div className="w-6 h-12 bg-blue-600 rounded-lg mx-auto mt-1 transform -rotate-12"></div>
                        <div className="flex space-x-2 mt-1 transform rotate-12">
                          <div className="w-2 h-6 bg-gray-700 rounded transform -rotate-45"></div>
                          <div className="w-2 h-6 bg-gray-700 rounded transform rotate-45"></div>
                        </div>
                        {/* Arms up */}
                        <div className="absolute top-8 -left-2 w-2 h-4 bg-gray-700 rounded transform -rotate-45"></div>
                        <div className="absolute top-8 -right-2 w-2 h-4 bg-gray-700 rounded transform rotate-45"></div>
                      </div>
                    </div>
                  </div>
                  {/* Decorative elements */}
                  <div className="absolute top-6 right-6 w-6 h-6 bg-blue-400 rounded-full opacity-30"></div>
                  <div className="absolute bottom-8 left-8 w-8 h-8 bg-purple-400 rounded-full opacity-40"></div>
                  <div className="absolute top-12 left-16 w-4 h-4 bg-blue-300 rounded-full opacity-50"></div>
                </div>
              </div>


              <div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">CAREER GROWTH</h3>
                <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                  Ensure you&apos;re delivering the right features to the right customers by validating product concepts with your target audience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 opacity-50"></div>
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Trusted by Millions Worldwide
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600">
              Join the largest professional network and accelerate your career
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            <div className="text-center group">
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group-hover:border-blue-200">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-700 mb-1 sm:mb-2">
                  10K+
                </div>
                <div className="text-gray-600 font-medium text-xs sm:text-sm lg:text-base">Active Jobs</div>
                <div className="w-full h-1.5 sm:h-2 bg-blue-100 rounded-full mt-2 sm:mt-3 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>

            <div className="text-center group">
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group-hover:border-indigo-200">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-700 mb-1 sm:mb-2">
                  5K+
                </div>
                <div className="text-gray-600 font-medium text-xs sm:text-sm lg:text-base">Companies</div>
                <div className="w-full h-1.5 sm:h-2 bg-indigo-100 rounded-full mt-2 sm:mt-3 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>

            <div className="text-center group">
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group-hover:border-purple-200">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-700 mb-1 sm:mb-2">
                  50K+
                </div>
                <div className="text-gray-600 font-medium text-xs sm:text-sm lg:text-base">Job Seekers</div>
                <div className="w-full h-1.5 sm:h-2 bg-purple-100 rounded-full mt-2 sm:mt-3 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>

            <div className="text-center group">
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group-hover:border-blue-200">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-700 mb-1 sm:mb-2">
                  95%
                </div>
                <div className="text-gray-600 font-medium text-xs sm:text-sm lg:text-base">Success Rate</div>
                <div className="w-full h-1.5 sm:h-2 bg-blue-100 rounded-full mt-2 sm:mt-3 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Trust badges */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 opacity-60">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Verified Companies</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Secure Platform</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-indigo-500" />
              <span className="text-sm font-medium text-gray-700">5-Star Rated</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700"></div>

        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-80 h-80 bg-white rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob"></div>
          <div className="absolute -bottom-32 -left-40 w-80 h-80 bg-white rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-xs sm:text-sm font-medium mb-6 sm:mb-8">
              <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              Join Today
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight px-4">
              Ready to Take the Next Step in Your
              <span className="block text-blue-300">Career Journey?</span>
            </h2>

            <p className="text-base sm:text-lg lg:text-xl text-blue-100 mb-8 sm:mb-12 leading-relaxed max-w-2xl mx-auto px-4">
              Join millions of professionals who have found their dream jobs through our platform.
              Your perfect opportunity is waiting for you.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-4">
              <Link
                href="/jobs"
                className="group w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-white text-blue-600 text-sm sm:text-base font-bold rounded-lg sm:rounded-xl hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-xl"
              >
                Browse 100K+ Jobs
                <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>

              <button
                onClick={handlePostJob}
                className="group w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-transparent border-2 border-white text-white text-sm sm:text-base font-bold rounded-lg sm:rounded-xl hover:bg-white hover:text-blue-600 transition-all duration-300"
              >
                Post Your Job

              </button>
            </div>

            {/* Additional CTA elements */}
            <div className="mt-8 sm:mt-12 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-white/80 px-4">
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                <span className="text-xs sm:text-sm">100% Free to Join</span>
              </div>
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                <span className="text-xs sm:text-sm">No Hidden Fees</span>
              </div>
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                <span className="text-xs sm:text-sm">Instant Access</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
