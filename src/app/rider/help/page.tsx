'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
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
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="px-6 pt-14 pb-4 safe-area-top">
        <button onClick={() => router.back()} className="text-black font-medium">
          ← Back
        </button>
        <h1 className="text-xl font-semibold text-black mt-4">Help & Support</h1>
      </div>

      {/* Search */}
      <div className="px-6 mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for help..."
          className="w-full px-4 py-4 bg-gray-100 rounded-xl text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Quick Contact */}
      <div className="px-6 mb-4">
        <div className="flex gap-3">
          <button 
            onClick={() => window.open('tel:+263780000000')}
            className="flex-1 bg-gray-100 rounded-xl p-4 text-center"
          >
            <p className="font-medium text-black">Call</p>
          </button>
          <button 
            onClick={() => window.open('mailto:support@hande.co.zw')}
            className="flex-1 bg-gray-100 rounded-xl p-4 text-center"
          >
            <p className="font-medium text-black">Email</p>
          </button>
        </div>
      </div>

      {/* FAQs */}
      <div className="px-6 flex-1">
        <p className="text-sm text-gray-500 mb-2">Frequently Asked Questions</p>
        <div className="space-y-2">
          {filteredFaqs.map((faq, index) => (
            <div key={index} className="bg-gray-100 rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                className="w-full p-4 text-left flex items-center justify-between"
              >
                <span className="font-medium text-black pr-2">{faq.question}</span>
                <span className="text-gray-400">{expandedFaq === index ? '−' : '+'}</span>
              </button>
              {expandedFaq === index && (
                <div className="px-4 pb-4">
                  <p className="text-sm text-gray-600">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
          {filteredFaqs.length === 0 && (
            <div className="bg-gray-100 rounded-xl p-6 text-center">
              <p className="text-gray-500">No results found</p>
            </div>
          )}
        </div>
      </div>

      {/* Contact Info */}
      <div className="px-6 py-8 text-center">
        <p className="text-sm text-gray-500">Need more help?</p>
        <p className="text-sm text-gray-600 mt-1">
          support@hande.co.zw · +263 78 000 0000
        </p>
      </div>
    </div>
  );
}
