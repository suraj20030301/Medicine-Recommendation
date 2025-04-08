import React, { useState } from 'react';
import { ArrowLeft, Stethoscope, LogOut, Activity, Heart, Brain, Pill, Apple, FileText, CheckCircle2, Shield } from 'lucide-react';

interface PredictionPageProps {
  onBack: () => void;
  onLogout: () => void;
}

interface Symptom {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

const commonSymptoms: Symptom[] = [
  { 
    id: 'fever',
    name: 'Fever',
    icon: <Activity className="h-5 w-5" />,
    description: 'High body temperature above 38°C (100.4°F)'
  },
  { 
    id: 'headache',
    name: 'Headache',
    icon: <Brain className="h-5 w-5" />,
    description: 'Pain or discomfort in the head region'
  },
  { 
    id: 'cough',
    name: 'Cough',
    icon: <Activity className="h-5 w-5" />,
    description: 'Persistent coughing, either dry or with phlegm'
  },
  { 
    id: 'fatigue',
    name: 'Fatigue',
    icon: <Activity className="h-5 w-5" />,
    description: 'Feeling of tiredness or exhaustion'
  },
  { 
    id: 'sore-throat',
    name: 'Sore Throat',
    icon: <Activity className="h-5 w-5" />,
    description: 'Pain or irritation in the throat'
  },
  { 
    id: 'chest-pain',
    name: 'Chest Pain',
    icon: <Heart className="h-5 w-5" />,
    description: 'Discomfort or pain in the chest area'
  },
];

interface Analysis {
  title: string;
  description: string;
  status: 'pending' | 'complete';
}

interface RecommendationCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  bgColor: string;
  borderColor: string;
  textColor: string;
  hoverBg: string;
}

const recommendationCategories: RecommendationCategory[] = [
  { 
    id: 'disease', 
    title: 'Disease', 
    icon: <Activity className="h-6 w-6" />, 
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-700',
    hoverBg: 'hover:bg-amber-100'
  },
  { 
    id: 'description', 
    title: 'Description', 
    icon: <FileText className="h-6 w-6" />, 
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    hoverBg: 'hover:bg-blue-100'
  },
  { 
    id: 'medications', 
    title: 'Medications', 
    icon: <Pill className="h-6 w-6" />, 
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    textColor: 'text-rose-700',
    hoverBg: 'hover:bg-rose-100'
  },
  { 
    id: 'precautions',
    title: 'Precautions',
    icon: <Shield className="h-6 w-6" />,
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-700',
    hoverBg: 'hover:bg-emerald-100'
  },
  { 
    id: 'diet', 
    title: 'Diet', 
    icon: <Apple className="h-6 w-6" />,
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-700',
    hoverBg: 'hover:bg-yellow-100'
  }
];

function PredictionPage({ onBack, onLogout }: PredictionPageProps) {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [backendData, setBackendData] = useState<{
    predicted_disease: string;
    description: string;
    medications: string;
    diet: string;
    precautions: string[];
  } | null>(null);
  const [analyses, setAnalyses] = useState<Analysis[]>([
    {
      title: 'Symptom Analysis',
      description: 'Analyzing reported symptoms',
      status: 'pending'
    },
    {
      title: 'Pattern Recognition',
      description: 'Identifying potential conditions',
      status: 'pending'
    },
    {
      title: 'Treatment Recommendation',
      description: 'Generating personalized advice',
      status: 'pending'
    }
  ]);

  const handleSymptomToggle = (symptomId: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptomId)
        ? prev.filter(id => id !== symptomId)
        : [...prev, symptomId]
    );
  };

  const handlePredict = async () => {
    setIsAnalyzing(true);
    setShowCategories(false);
    setSelectedCategory(null);
    setRecommendation(null);
    setBackendData(null);

    try {
      // Format symptoms as a comma-separated string
      const symptomsString = selectedSymptoms
        .map(id => {
          const symptom = commonSymptoms.find(s => s.id === id);
          return symptom?.name.toLowerCase().replace(/\s+/g, '_');
        })
        .filter(Boolean)
        .join(',');

      console.log('Sending symptoms:', symptomsString); // Debug log

      // Make API call to Flask backend
      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          symptoms: symptomsString
        })
      });

      console.log('Response status:', response.status); // Debug log

      // Get the response text first
      const responseText = await response.text();
      console.log('Raw response:', responseText); // Debug log

      let data;
      try {
        // Try to parse the response as JSON
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        throw new Error(`Invalid response from server: ${responseText.substring(0, 100)}...`);
      }

      if (!response.ok) {
        console.error('API error response:', data);
        throw new Error(`Failed to get prediction: ${data.error || response.status}`);
      }

      // Validate the response data structure
      if (!data.predicted_disease) {
        console.error('Missing predicted_disease in response:', data);
        throw new Error('Invalid response format: missing predicted_disease');
      }

      console.log('Parsed data:', data); // Debug log
      
      setBackendData(data);
      
      // Update analyses with real data from backend
      setAnalyses(prev => prev.map(analysis => ({
        ...analysis,
        status: 'complete'
      })));

      // Show categories and set initial recommendation
      setShowCategories(true);
      setSelectedCategory('disease');
      setRecommendation(data.predicted_disease);

    } catch (error: any) {
      console.error('Error getting prediction:', error);
      // Show error message to user with more details
      setRecommendation(`Error: ${error?.message || 'Unknown error occurred'}`);
      setShowCategories(false);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    if (!backendData) return;

    setSelectedCategory(categoryId);
    setRecommendation(null); // Clear previous recommendation while formatting
    
    switch (categoryId) {
      case 'disease':
        setRecommendation(`Predicted Disease: ${backendData.predicted_disease}`);
        break;
      case 'description':
        setRecommendation(`Description:\n${backendData.description}`);
        break;
      case 'medications':
        let medsDisplay = "Recommended Medications:\n";
        if (Array.isArray(backendData.medications)) {
          medsDisplay += backendData.medications.map((med, i) => `${i + 1}. ${med}`).join('\n');
        } else {
          medsDisplay += backendData.medications;
        }
        setRecommendation(medsDisplay);
        break;
      case 'precautions':
        let precautionsDisplay = "Recommended Precautions:\n";
        if (Array.isArray(backendData.precautions)) {
          precautionsDisplay += backendData.precautions.map((p, i) => `${i + 1}. ${p}`).join('\n');
        } else {
          precautionsDisplay += backendData.precautions || "No specific precautions available";
        }
        setRecommendation(precautionsDisplay);
        break;
      case 'diet':
        let dietDisplay = "Recommended Diet:\n";
        if (Array.isArray(backendData.diet)) {
          dietDisplay += backendData.diet.map((d, i) => `${i + 1}. ${d}`).join('\n');
        } else {
          dietDisplay += backendData.diet;
        }
        setRecommendation(dietDisplay);
        break;
      default:
        setRecommendation('No recommendation available for this category.');
    }
  };

  const canPredict = selectedSymptoms.length > 0 || additionalInfo.trim().length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm">
          <button
            onClick={onBack}
            className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Home
          </button>
          <button
            onClick={onLogout}
            className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5 mr-2" />
            Logout
          </button>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex items-center mb-8">
            <div className="bg-blue-100 p-3 rounded-full">
              <Stethoscope className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-2xl font-bold text-gray-900">AI Health Assistant</h2>
              <p className="text-gray-600">Get personalized health recommendations</p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-blue-500" />
                Select your symptoms
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {commonSymptoms.map(symptom => (
                  <button
                    key={symptom.id}
                    onClick={() => handleSymptomToggle(symptom.id)}
                    className={`relative p-4 rounded-xl border transition-all duration-200 ${
                      selectedSymptoms.includes(symptom.id)
                        ? 'bg-blue-50 border-blue-200 shadow-inner'
                        : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md'
                    }`}
                  >
                    {selectedSymptoms.includes(symptom.id) && (
                      <div className="absolute -top-2 -right-2">
                        <CheckCircle2 className="h-5 w-5 text-blue-500" />
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      {symptom.icon}
                      <span className={selectedSymptoms.includes(symptom.id) ? 'text-blue-700 font-medium' : 'text-gray-700'}>
                        {symptom.name}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">{symptom.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
              <label htmlFor="additional-info" className="block text-lg font-medium text-gray-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-500" />
                Additional Information
              </label>
              <textarea
                id="additional-info"
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                className="w-full h-32 p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                placeholder="Please describe any other symptoms or relevant information..."
              />
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              handlePredict();
            }} className="space-y-6">
              <button
                type="submit"
                disabled={!canPredict}
                className={`w-full py-4 rounded-xl text-white font-medium transition-all duration-200 ${
                  canPredict
                    ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                Get Recommendation
              </button>
            </form>

            {isAnalyzing && (
              <div className="space-y-4 bg-gray-50 rounded-xl p-6 border border-gray-100">
                {analyses.map((analysis, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className={`h-4 w-4 rounded-full transition-colors duration-500 ${
                      analysis.status === 'complete' 
                        ? 'bg-green-500 animate-pulse' 
                        : 'bg-gray-200'
                    }`} />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{analysis.title}</p>
                      <p className="text-sm text-gray-500">{analysis.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showCategories && (
              <div className="space-y-6 bg-gray-50 rounded-xl p-6 border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Brain className="h-6 w-6 mr-2 text-blue-500" />
                  AI System Results
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {recommendationCategories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryClick(category.id)}
                      className={`p-4 rounded-xl border transition-all duration-200 ${
                        selectedCategory === category.id
                          ? `${category.bgColor} ${category.borderColor} ${category.textColor} shadow-inner`
                          : `bg-white border-gray-200 ${category.hoverBg} hover:shadow-md`
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <div className={`p-2 rounded-full ${category.bgColor} ${category.textColor}`}>
                          {category.icon}
                        </div>
                        <span className="font-medium">{category.title}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {recommendation && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
                <div className={`p-4 ${recommendationCategories.find(c => c.id === selectedCategory)?.bgColor} ${recommendationCategories.find(c => c.id === selectedCategory)?.textColor}`}>
                  <h3 className="text-lg font-medium flex items-center">
                    {recommendationCategories.find(c => c.id === selectedCategory)?.icon}
                    <span className="ml-2">{recommendationCategories.find(c => c.id === selectedCategory)?.title} Recommendation</span>
                  </h3>
                </div>
                <div className="p-6">
                  <p className="text-gray-800 whitespace-pre-line">{recommendation}</p>
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-sm text-blue-800 font-medium flex items-center">
                      <Activity className="h-5 w-5 mr-2" />
                      This is a preliminary recommendation. Please consult with a healthcare professional for proper medical advice.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PredictionPage;