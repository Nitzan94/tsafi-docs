import React, { useEffect, useState } from 'react';
import { 
  Cloud, 
  Sparkles, 
  Shield, 
  Zap,
  X,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const WELCOME_V2_SHOWN_KEY = 'tsafi-welcome-v2-shown';

export const WelcomeV2Modal: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Check if welcome modal was already shown
    const wasShown = localStorage.getItem(WELCOME_V2_SHOWN_KEY);
    if (!wasShown) {
      setIsVisible(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem(WELCOME_V2_SHOWN_KEY, 'true');
    setIsVisible(false);
  };

  const features = [
    {
      icon: <Cloud className="h-12 w-12 text-blue-500" />,
      title: 'גיבוי ענן אוטומטי',
      description: 'כל הנתונים שלך מגובים אוטומטית ל-Google Drive בהצפנה מתקדמת',
      highlight: 'לא תאבדי עוד מידע!'
    },
    {
      icon: <Shield className="h-12 w-12 text-green-500" />,
      title: 'אבטחה מתקדמת',
      description: 'הצפנת AES-256 רפואית מבטיחה שרק את יכולה לגשת לנתונים',
      highlight: 'פרטיות מלאה מובטחת'
    },
    {
      icon: <Zap className="h-12 w-12 text-purple-500" />,
      title: 'סנכרון חכם',
      description: 'עובדת ממספר מחשבים? הנתונים מתעדכנים בכל המכשירים',
      highlight: 'גמישות מרבית בעבודה'
    },
    {
      icon: <Sparkles className="h-12 w-12 text-orange-500" />,
      title: 'ממשק משופר',
      description: 'ממשק חדש ומשופר עם הודעות בזמן אמת על מצב הסנכרון',
      highlight: 'חווית משתמש מעולה'
    }
  ];

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-t-2xl">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-10 w-10" />
            </div>
            <h1 className="text-3xl font-bold mb-2">
              ברוכה הבאה לגרסה 2.0! 🎉
            </h1>
            <p className="text-blue-100 text-lg">
              הכירי את התכונות החדשות שישפרו את העבודה שלך
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Current Feature */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              {features[currentStep].icon}
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {features[currentStep].title}
            </h2>
            
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-4">
              <p className="text-purple-700 font-semibold text-lg">
                {features[currentStep].highlight}
              </p>
            </div>
            
            <p className="text-gray-600 text-lg leading-relaxed">
              {features[currentStep].description}
            </p>
          </div>

          {/* Progress Dots */}
          <div className="flex justify-center gap-2 mb-8">
            {features.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`
                  w-3 h-3 rounded-full transition-all
                  ${index === currentStep 
                    ? 'bg-blue-600 w-8' 
                    : 'bg-gray-300 hover:bg-gray-400'
                  }
                `}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className={`
                px-4 py-2 rounded-lg font-medium transition-colors
                ${currentStep === 0 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-blue-600 hover:bg-blue-50'
                }
              `}
            >
              ← הקודם
            </button>

            <div className="text-sm text-gray-500">
              {currentStep + 1} מתוך {features.length}
            </div>

            {currentStep < features.length - 1 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                הבא <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <Link
                to="/settings"
                onClick={handleClose}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-colors flex items-center gap-2"
              >
                <Cloud className="h-4 w-4" />
                הגדר עכשיו
              </Link>
            )}
          </div>

          {/* Bottom CTA */}
          {currentStep === features.length - 1 && (
            <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <h3 className="font-bold text-gray-800">
                  מוכנה להתחיל?
                </h3>
              </div>
              <p className="text-gray-600 mb-4">
                ההגדרה לוקחת פחות מדקה והנתונים הקיימים שלך יישארו בטוחים
              </p>
              <div className="flex gap-3">
                <Link
                  to="/settings"
                  onClick={handleClose}
                  className="flex-1 bg-blue-600 text-white text-center py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  התחבר ל-Google Drive
                </Link>
                <button
                  onClick={handleClose}
                  className="px-4 py-3 text-gray-600 hover:text-gray-800 font-medium"
                >
                  אולי מאוחר יותר
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};