
import { Heart, Activity, ArrowRight, Stethoscope, Brain, Shield } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="medical-bg min-h-screen">
      <div className="glass-effect min-h-screen">
        <nav className="bg-white/90 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center">
                <Stethoscope className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">MediAssist AI</span>
              </div>
              <div className="flex items-center space-x-4">
                <button className="text-gray-600 hover:text-gray-900">About</button>
                <button className="text-gray-600 hover:text-gray-900">Services</button>
                <button className="text-gray-600 hover:text-gray-900">Contact</button>
                <button
                  onClick={onGetStarted}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center space-y-8 mb-20">
            <div className="inline-block p-3 bg-blue-100 rounded-full">
              <Heart className="h-12 w-12 text-blue-600" />
            </div>
            <h1 className="text-6xl font-bold text-gray-900 leading-tight">
              Your Personal
              <span className="text-blue-600"> AI-Powered</span>
              <br />
              Health Assistant
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Get instant, personalized medical recommendations powered by advanced AI technology.
              Your health journey begins with accurate, reliable guidance.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={onGetStarted}
                className="inline-flex items-center px-8 py-4 text-lg font-medium text-white bg-blue-600 rounded-full hover:bg-blue-700 transform hover:scale-105 transition-all shadow-lg"
              >
                Start Your Health Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              <button className="inline-flex items-center px-8 py-4 text-lg font-medium text-blue-600 bg-white rounded-full hover:bg-blue-50 transform hover:scale-105 transition-all shadow-lg">
                Learn More
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-20">
            <div className="feature-card bg-white p-8 rounded-2xl shadow-lg">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Brain className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Smart Analysis</h3>
              <p className="text-gray-600">
                Our AI system analyzes your symptoms using advanced machine learning algorithms for accurate diagnosis suggestions.
              </p>
            </div>
            <div className="feature-card bg-white p-8 rounded-2xl shadow-lg">
              <div className="bg-rose-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Shield className="h-8 w-8 text-rose-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Safe & Secure</h3>
              <p className="text-gray-600">
                Your health data is protected with enterprise-grade security. We prioritize your privacy and confidentiality.
              </p>
            </div>
            <div className="feature-card bg-white p-8 rounded-2xl shadow-lg">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Activity className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">24/7 Availability</h3>
              <p className="text-gray-600">
                Get instant health recommendations anytime, anywhere. Our system is always ready to assist you.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Trusted by Healthcare Professionals
            </h2>
            <div className="grid md:grid-cols-4 gap-8">
              <div className="flex flex-col items-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">58%</div>
                <div className="text-gray-600">Accuracy Rate</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">50K+</div>
                <div className="text-gray-600">Users Helped</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
                <div className="text-gray-600">Availability</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">100+</div>
                <div className="text-gray-600">Health Conditions</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;