import React, { useState } from 'react';
import { ArrowLeft, Stethoscope, LogOut, Activity, Heart, Brain } from 'lucide-react';

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
  result?: string;
}

function PredictionPage({ onBack, onLogout }: PredictionPageProps) {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [prediction, setPrediction] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
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
    setPrediction(null);

    // Simulate analysis process
    for (let i = 0; i < analyses.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAnalyses(prev => prev.map((analysis, index) => ({
        ...analysis,
        status: index <= i ? 'complete' : 'pending'
      })));
    }

    // Mock predictions with more detailed information
    const mockPredictions = [
      {
        condition: "Common Cold",
        medications: ["Acetaminophen (500mg every 6 hours)", "Decongestant nasal spray"],
        advice: "Rest well and stay hydrated. Avoid strenuous activities for 2-3 days.",
        warning: "Seek medical attention if symptoms worsen or fever persists for more than 3 days."
      },
      {
        condition: "Seasonal Allergies",
        medications: ["Cetirizine (10mg once daily)", "Nasal corticosteroid spray"],
        advice: "Avoid known allergens and keep windows closed during high pollen counts.",
        warning: "If breathing becomes difficult, seek immediate medical attention."
      },
      {
        condition: "Influenza",
        medications: ["Ibuprofen (400mg every 6 hours)", "Oseltamivir if within 48 hours of symptoms"],
        advice: "Get plenty of rest and fluids. Keep warm and avoid contact with others.",
        warning: "Contact your healthcare provider if you experience severe chest pain or difficulty breathing."
      }
    ];
    
    const randomPrediction = mockPredictions[Math.floor(Math.random() * mockPredictions.length)];
    
    setTimeout(() => {
      setPrediction(
        `Based on your symptoms, you might have ${randomPrediction.condition}.\n\n` +
        `Recommended medications:\n${randomPrediction.medications.join("\n")}\n\n` +
        `Advice: ${randomPrediction.advice}\n\n` +
        `Important: ${randomPrediction.warning}`
      );
      setIsAnalyzing(false);
    }, 500);
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <button
            onClick={onBack}
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Home
          </button>
          <button
            onClick={onLogout}
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <LogOut className="h-5 w-5 mr-2" />
            Logout
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center mb-6">
            <Stethoscope className="h-8 w-8 text-blue-500 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Symptom Checker</h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Select your symptoms:</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {commonSymptoms.map(symptom => (
                  <button
                    key={symptom.id}
                    onClick={() => handleSymptomToggle(symptom.id)}
                    className={`p-4 rounded-lg border ${
                      selectedSymptoms.includes(symptom.id)
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'border-gray-200 hover:border-blue-500'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      {symptom.icon}
                      <span>{symptom.name}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{symptom.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="additional-info" className="block text-lg font-medium text-gray-900 mb-3">
                Additional Information:
              </label>
              <textarea
                id="additional-info"
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Please provide any additional symptoms or relevant information..."
              />
            </div>

            <button
              onClick={handlePredict}
              disabled={selectedSymptoms.length === 0 || isAnalyzing}
              className="w-full py-4 px-6 text-lg font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isAnalyzing ? 'Analyzing...' : 'Get Recommendation'}
            </button>

            {isAnalyzing && (
              <div className="space-y-4">
                {analyses.map((analysis, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className={`h-4 w-4 rounded-full ${
                      analysis.status === 'complete' 
                        ? 'bg-green-500' 
                        : 'bg-gray-200'
                    }`} />
                    <div>
                      <p className="font-medium text-gray-900">{analysis.title}</p>
                      <p className="text-sm text-gray-500">{analysis.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {prediction && (
              <div className="mt-6 p-6 bg-green-50 rounded-lg border border-green-200">
                <h3 className="text-lg font-medium text-green-900 mb-2">Recommendation:</h3>
                <p className="text-green-800 whitespace-pre-line">{prediction}</p>
                <p className="mt-4 text-sm text-green-700 font-medium">
                  Note: This is a preliminary recommendation. Please consult with a healthcare professional for proper medical advice.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PredictionPage;