import React from 'react';
import { Link } from 'react-router-dom';
import { Rocket, Brain, Globe, UserCheck, Settings, FileCheck } from 'lucide-react';
import Button from '../components/ui/Button';

const Home = () => {
  return (
    <div className="font-sans bg-gradient-to-br from-[#0d1117] to-[#1f2937] text-white min-h-screen space-y-28">

      {/* Hero Section */}
      <section className="relative py-28 px-6 overflow-hidden bg-[#1f1f1f] rounded-b-[6rem] shadow-xl">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-indigo-700 opacity-20 blur-3xl rounded-full animate-pulse"></div>
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-pink-600 opacity-20 blur-3xl rounded-full animate-pulse"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="text-6xl font-extrabold tracking-tight leading-tight mb-6 animate-fade-in">
            Revolutionize Your Exams
          </h1>
          <p className="text-xl text-gray-300 mb-10 animate-fade-in delay-200">
            From creation to evaluation, manage exams with cutting-edge tools and intuitive controls.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6 animate-fade-in delay-300">
            <Link to="/register">
              <Button className="bg-pink-600 hover:bg-pink-500 transition shadow-md text-lg font-bold px-6 py-3 rounded-full">
                Start Free
              </Button>
            </Link>
            <Link to="/login">
              <Button className="bg-transparent border border-white hover:bg-white/10 transition text-lg px-6 py-3 rounded-full">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-24 bg-[#111827] rounded-t-[6rem]">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold mb-4">Why Choose Us?</h2>
          <p className="text-gray-400">Next-gen tools to elevate your assessment experience</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
          {[ 
            { icon: Rocket, title: "Lightning Fast Setup", desc: "Deploy exams in minutes with smart templates and auto-import." },
            { icon: Brain, title: "Intelligent Evaluation", desc: "AI-based grading with manual override and insights." },
            { icon: Globe, title: "Global Access", desc: "Reach students across the globe with zero hassle and full reliability." },
          ].map((feature, i) => (
            <div 
              key={i} 
              className="bg-[#1f2937] p-8 rounded-3xl transform hover:-translate-y-2 transition duration-300 shadow-lg hover:shadow-xl"
            >
              <feature.icon className="h-12 w-12 mb-4 text-pink-500" />
              <h3 className="text-2xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Workflow Section */}
      <section className="px-6 py-24 bg-gradient-to-br from-[#1a1a1a] to-[#0f172a]">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold mb-4">Your Workflow, Simplified</h2>
          <p className="text-gray-400">Three steps to seamless exams</p>
        </div>
        <div className="flex flex-col md:flex-row justify-center items-stretch gap-12 max-w-6xl mx-auto">
          {[
            { step: "01", title: "Design", desc: "Build custom exams with drag & drop UI and question banks." },
            { step: "02", title: "Conduct", desc: "Deliver exams securely via any device, anywhere." },
            { step: "03", title: "Evaluate", desc: "Analyze performance instantly with actionable insights." },
          ].map((item, i) => (
            <div 
              key={i} 
              className="bg-[#1e293b] rounded-[2rem] p-8 text-center transform hover:scale-105 transition duration-300"
            >
              <div className="text-4xl font-bold text-indigo-400 mb-4">{item.step}</div>
              <h3 className="text-2xl mb-2 font-semibold">{item.title}</h3>
              <p className="text-gray-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* User Roles Section */}
      <section className="px-6 py-24 bg-[#0f172a] rounded-b-[6rem]">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold mb-4">Who Uses This Platform?</h2>
          <p className="text-gray-400">From learners to leaders—everyone wins</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
          {[
            { icon: UserCheck, title: "Students", points: ["Fast results", "Exam archives", "Progress reports"] },
            { icon: FileCheck, title: "Instructors", points: ["Question banks", "Smart scoring", "Live monitoring"] },
            { icon: Settings, title: "Admins", points: ["User management", "Reports & control", "Audit logs"] },
          ].map((role, i) => (
            <div 
              key={i} 
              className="bg-[#1f2937] p-8 rounded-3xl shadow-md hover:shadow-xl transition duration-300"
            >
              <role.icon className="h-10 w-10 mb-4 text-pink-400" />
              <h3 className="text-xl font-semibold mb-4">{role.title}</h3>
              <ul className="text-gray-300 space-y-2">
                {role.points.map((pt, j) => (
                  <li key={j} className="flex items-center">
                    <span className="text-green-400 mr-2">✔</span>{pt}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="px-6 py-28 bg-[#111827] text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold mb-6 animate-fade-in">Ready to Transform Your Exam Experience?</h2>
          <p className="text-gray-400 text-lg mb-10 animate-fade-in delay-200">
            Discover a better way to test, learn, and grow.
          </p>
          <Link to="/register">
            <Button className="bg-pink-600 hover:bg-pink-500 text-white px-8 py-4 rounded-full text-lg font-bold shadow-md animate-fade-in delay-300">
              Get Started
            </Button>
          </Link>
          <p className="mt-6 text-gray-500 text-sm animate-fade-in delay-500">
            Already have an account?{' '}
            <Link to="/login" className="text-pink-300 hover:underline">
              Sign in here
            </Link>
          </p>
        </div>
      </section>

    </div>
  );
};

export default Home;
