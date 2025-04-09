import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Award, Clock, Shield, Users, CheckCircle } from 'lucide-react';
import Button from '../components/ui/Button';

const Home = () => {
  return (
    <div className="space-y-20 font-sans">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 bg-gradient-to-br from-indigo-700 via-purple-600 to-blue-500 rounded-3xl text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
        <div className="container mx-auto px-6 text-center relative z-10 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight drop-shadow-lg">
            Elevate Your Exam Experience
          </h1>
          <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto leading-relaxed opacity-90">
            A cutting-edge platform designed for seamless exam creation, management, and delivery.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link to="/register">
              <Button 
                size="large" 
                variant="secondary" 
                className="bg-white text-indigo-700 font-bold hover:bg-indigo-100 transition-all duration-300 shadow-lg transform hover:-translate-y-1"
              >
                Start Now
              </Button>
            </Link>
            <Link to="/login">
              <Button 
                size="large" 
                variant="outline" 
                className="bg-transparent border-2 border-white text-white hover:bg-white/20 transition-all duration-300 shadow-lg transform hover:-translate-y-1"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-800 animate-fade-up">Why Choose Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { icon: Shield, title: "Secure Testing", desc: "AI-powered proctoring with tab-switching detection and robust security protocols." },
              { icon: Clock, title: "Live Monitoring", desc: "Real-time insights into student progress and exam analytics." },
              { icon: CheckCircle, title: "Smart Grading", desc: "Automated scoring for efficiency, with manual review options." }
            ].map((feature, index) => (
              <div 
                key={index}
                className="group relative bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-6 mx-auto group-hover:bg-indigo-200 transition-colors duration-300">
                    <feature.icon className="h-8 w-8 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-800 text-center">{feature.title}</h3>
                  <p className="text-gray-600 text-center leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gradient-to-r from-gray-50 to-blue-50 rounded-3xl">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-800 animate-fade-up">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { step: 1, title: "Craft Exams", desc: "Design custom exams with diverse question types and precise settings." },
              { step: 2, title: "Take Exams", desc: "Securely access and complete exams with an intuitive interface." },
              { step: 3, title: "View Results", desc: "Instant feedback and downloadable certificates for achievements." }
            ].map((step, index) => (
              <div 
                key={index} 
                className="flex flex-col items-center text-center group animate-fade-up"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mb-6 shadow-md group-hover:bg-indigo-700 transition-colors duration-300">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed max-w-xs">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* User Types */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-800 animate-fade-up">Built for Everyone</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { icon: Users, title: "Students", items: ["Access exams anywhere", "Instant results", "Track progress", "Earn certificates"] },
              { icon: BookOpen, title: "Examiners", items: ["Create custom exams", "Manage question banks", "Monitor in real-time", "Review answers"] },
              { icon: Award, title: "Admins", items: ["Oversee users", "Manage exams", "View analytics", "Customize settings"] }
            ].map((user, index) => (
              <div 
                key={index}
                className="bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-gray-100 hover:border-indigo-200 transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="flex items-center mb-6">
                  <user.icon className="h-10 w-10 text-indigo-600 mr-4" />
                  <h3 className="text-2xl font-semibold text-gray-800">{user.title}</h3>
                </div>
                <ul className="space-y-4">
                  {user.items.map((item, i) => (
                    <li key={i} className="flex items-center text-gray-600">
                      <span className="text-green-500 mr-3">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
        <div className="container mx-auto px-6 relative z-10">
          <h2 className="text-4xl font-bold mb-6 drop-shadow-lg animate-fade-up">Ready to Transform Your Exams?</h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto opacity-90 animate-fade-up" style={{ animationDelay: '150ms' }}>
            Join a thriving community of learners and educators today.
          </p>
          <Link to="/register">
            <Button 
              size="large" 
              variant="secondary" 
              className="bg-white text-indigo-700 font-bold hover:bg-indigo-100 transition-all duration-300 shadow-lg transform hover:-translate-y-1 animate-fade-up"
              style={{ animationDelay: '300ms' }}
            >
              Join Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;