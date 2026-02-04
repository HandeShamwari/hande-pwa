'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { 
  ArrowLeft, 
  HelpCircle,
  MessageCircle,
  FileText,
  Phone,
  Mail,
  ChevronRight,
  ChevronDown,
  Search,
  AlertCircle
} from 'lucide-react';
import type { RootState } from '@/store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingScreen } from '@/components/ui/loading';

const faqs = [
  {
    question: "How do I request a ride?",
    answer: "Open the app, enter your destination in the search bar, select your pickup location, and tap 'Request Ride'. A nearby driver will be matched with you."
  },
  {
    question: "How is the fare calculated?",
    answer: "Fares are calculated based on distance and estimated time. Unlike other apps, Hande has NO surge pricing - you pay the same fair rate anytime."
  },
  {
    question: "What payment methods are accepted?",
    answer: "We accept cash, EcoCash, OneMoney, and card payments. You can add your preferred payment method in the Wallet section."
  },
  {
    question: "How do I cancel a ride?",
    answer: "You can cancel a ride before the driver arrives by tapping the trip details and selecting 'Cancel Trip'. Cancellation fees may apply if cancelled after driver accepts."
  },
  {
    question: "What makes Hande different?",
    answer: "Hande charges drivers only $1/day instead of taking 25% commission. This means drivers earn more, and riders get better service with fair pricing."
  },
  {
    question: "How do emergency contacts work?",
    answer: "Add trusted contacts who can receive your live location during rides. Go to Emergency Contacts in the menu to set them up."
  },
];

export default function RiderHelpPage() {
  const router = useRouter();
  const { isAuthenticated, userType } = useSelector((state: RootState) => state.auth);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    if (userType === 'driver') {
      router.replace('/driver/help');
      return;
    }
    setIsLoading(false);
  }, [isAuthenticated, userType, router]);

  const filteredFaqs = faqs.filter(
    faq => 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-bg">
      {/* Header */}
      <div className="bg-primary px-4 pt-12 pb-8 safe-area-top">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-xl font-semibold text-white">Help & Support</h1>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for help..."
            className="w-full pl-12 pr-4 py-3 bg-white rounded-xl text-dark placeholder-gray-400"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 -mt-4">
        <Card className="p-4">
          <div className="grid grid-cols-3 gap-4">
            <QuickAction
              icon={<MessageCircle size={20} />}
              label="Chat"
              onClick={() => {}}
            />
            <QuickAction
              icon={<Phone size={20} />}
              label="Call"
              onClick={() => window.open('tel:+263780000000')}
            />
            <QuickAction
              icon={<Mail size={20} />}
              label="Email"
              onClick={() => window.open('mailto:support@hande.co.zw')}
            />
          </div>
        </Card>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Report Issue */}
        <Card className="p-4 mb-4 bg-accent/10 border-accent/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center">
              <AlertCircle size={24} className="text-accent" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-dark">Report an issue</p>
              <p className="text-sm text-gray-600">Had a problem with a recent trip?</p>
            </div>
            <Button size="sm" onClick={() => {}}>
              Report
            </Button>
          </div>
        </Card>

        {/* FAQs */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-3 px-1">
            FREQUENTLY ASKED QUESTIONS
          </h3>
          <Card>
            {filteredFaqs.map((faq, index) => (
              <FaqItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                isExpanded={expandedFaq === index}
                onToggle={() => setExpandedFaq(expandedFaq === index ? null : index)}
                showDivider={index > 0}
              />
            ))}
            {filteredFaqs.length === 0 && (
              <div className="p-6 text-center">
                <HelpCircle size={32} className="mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500 text-sm">No results found</p>
              </div>
            )}
          </Card>
        </div>

        {/* Contact Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 mb-2">Need more help?</p>
          <p className="text-sm text-gray-600">
            Email us at{' '}
            <a href="mailto:support@hande.co.zw" className="text-primary font-medium">
              support@hande.co.zw
            </a>
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Call us at{' '}
            <a href="tel:+263780000000" className="text-primary font-medium">
              +263 78 000 0000
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

function QuickAction({ 
  icon, 
  label, 
  onClick 
}: { 
  icon: React.ReactNode; 
  label: string; 
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors"
    >
      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
        {icon}
      </div>
      <span className="text-sm text-dark">{label}</span>
    </button>
  );
}

function FaqItem({
  question,
  answer,
  isExpanded,
  onToggle,
  showDivider,
}: {
  question: string;
  answer: string;
  isExpanded: boolean;
  onToggle: () => void;
  showDivider: boolean;
}) {
  return (
    <div className={showDivider ? 'border-t border-gray-100' : ''}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <span className="font-medium text-dark pr-4">{question}</span>
        <ChevronDown 
          size={20} 
          className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>
      {isExpanded && (
        <div className="px-4 pb-4">
          <p className="text-sm text-gray-600 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}
