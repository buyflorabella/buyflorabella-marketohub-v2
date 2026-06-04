import { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { useFeatureFlags } from '../contexts/FeatureFlagsContext';
import { useLocation, useRouteLoaderData } from 'react-router';

interface Survey {
  title: string;
  description: string;
  answers: string[];
}

interface SurveyData {
  [key: string]: {
    surveyId: number,
    answered: boolean
  }
}

const initialSurveyState: SurveyData = {
  '/password': {
    surveyId: 1,
    answered: false,
  },
  '/': {
    surveyId: 1,
    answered: false,
  },
  '/learn': {
    surveyId: 1,
    answered: false,
  },
}

export default function SurveyPopup() {
  const { features } = useRouteLoaderData('root');
  const { flags } = useFeatureFlags();
  const [isVisible, setIsVisible] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [selectedSurvey, setSelectedSurvey] = useState<number | undefined>();
  const [surveyData, setSurveyData] = useState(initialSurveyState);

  const location = useLocation();

  useEffect(() => {
    if (location) {
      const surveyForPage = surveyData[location.pathname];
      if (surveyForPage?.surveyId && !surveyForPage?.answered) {
        setSelectedSurvey(surveyForPage?.surveyId);
      } else {
        setSelectedSurvey(undefined);
      }
    }
  }, [location, surveyData]);

  const API_BASE = 'https://survey-server.boardmansgame.com/api.php';

  const loadSurvey = useCallback(async () => {
    try {
      if (!selectedSurvey) {
        return;
      }
      const response = await fetch(`${API_BASE}?action=get_survey&id=${selectedSurvey}`);
      const data = await response.json();
      setSurvey({
        title: data.title || 'Survey',
        description: data.description || '',
        answers: data.answers || []
      });
      setIsVisible(true);
    } catch (error) {
      console.error(error);
      setSurvey({
        title: 'Survey unavailable',
        description: 'Please try again later.',
        answers: []
      });
    }
  }, [selectedSurvey]);

  useEffect(() => {
    if (!features.surveysEnabled && !flags.surveyPopup) {
      return;
    }

    const timer = setTimeout(() => {
      loadSurvey();
    }, 2000);

    return () => clearTimeout(timer);
  }, [features, loadSurvey, flags, selectedSurvey]);

  const submitResponse = async (answer: string, type: string) => {
    try {
      await fetch(`${API_BASE}?action=submit_response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit_response',
          survey_id: selectedSurvey,
          answer,
          type
        })
      });
    } catch (error) {
      console.error('Failed to submit response:', error);
    }

    if (type === 'answer') {
      setShowThankYou(true);
    } else {
      setIsVisible(false);
    }

    const aux = {...surveyData};
    aux[location.pathname].answered = true;
    if (features.surveySingleAnswer) {
      Object.keys(initialSurveyState).forEach((page) => {
        aux[page].answered = true;
      })
    }
    setSurveyData(aux);
  };

  const handleClose = () => {
    submitResponse('abandoned', 'close');
  };

  const handleAnswer = (answer: string) => {
    submitResponse(answer, 'answer');
  };

  if ((!features.surveysEnabled && !flags.surveyPopup) || !isVisible) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ display: isVisible ? 'flex' : 'none' }}
    >
      <div className="relative bg-[#f5f5f0] border-2 border-[#7cb342] text-gray-900 rounded-2xl max-w-md w-full shadow-2xl animate-fade-in">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-[#7cb342] transition-colors z-10"
          aria-label="Close survey"
        >
          <X className="w-5 h-5" />
        </button>

        {!showThankYou ? (
          <div className="p-8 text-center">
            <div className="mb-6">
              <div className="inline-block bg-[#7cb342]/10 border border-[#7cb342]/30 px-4 py-2 rounded-full mb-4">
                <span className="text-[#7cb342] font-semibold text-xs tracking-wide">QUICK SURVEY</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {survey?.title || 'Loading...'}
              </h2>
              {survey?.description && (
                <p className="text-gray-600 text-sm leading-relaxed">
                  {survey.description}
                </p>
              )}
            </div>

            <div className="space-y-3 mb-4">
              {survey?.answers.map((answer, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(answer)}
                  className="w-full px-6 py-3 bg-[#7cb342] hover:bg-[#689f38] text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {answer}
                </button>
              ))}
            </div>

            <p className="text-xs text-gray-500 italic">
              Choose one... your answer helps us know you better.
            </p>

            <div className="absolute bottom-2 left-3 text-[10px] text-gray-400">
              ID: {selectedSurvey}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-[#7cb342] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Thank you!</h2>
              <p className="text-gray-600 mb-6">
                We appreciate you taking our survey.
              </p>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="w-full px-6 py-3 bg-[#7cb342] hover:bg-[#689f38] text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
