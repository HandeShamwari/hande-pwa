'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { RootState } from '@/store';

const faqs = [
  {
    category: 'Subscription',
    icon: '💵',
    questions: [
      { q: 'How does the $1/day subscription work?', a: 'You pay $1 daily to access rider requests. This replaces the traditional commission model - you keep 100% of your earnings from each ride.' },
      { q: "What if I don't pay for a day?", a: "If your subscription expires, you won't receive new ride requests. You can reactivate anytime by paying the daily fee." },
      { q: 'Can I pay for multiple days at once?', a: 'Yes! You can pay for 1, 3, 7, or 30 days in advance to ensure uninterrupted service.' },
    ],
  },
  {
    category: 'Rides & Earnings',
    icon: '🚗',
    questions: [
      { q: 'How do I accept a ride?', a: "When you're online and a rider requests a trip nearby, you'll receive a notification. Tap to view details and accept within 30 seconds." },
      { q: 'How much can I earn?', a: 'You keep 100% of the fare. Earnings depend on trip distance, time, and local demand. The app calculates fair prices based on distance.' },
      { q: 'When do I get paid?', a: 'Cash rides are paid directly by riders. For wallet payments, earnings are added to your driver wallet and can be withdrawn anytime.' },
    ],
  },
  {
    category: 'Safety',
    icon: '🛡️',
    questions: [
      { q: 'What safety features are available?', a: 'Features include: ride tracking shared with trusted contacts, in-app emergency button, rider verification, and trip recording.' },
      { q: 'What if I feel unsafe during a ride?', a: 'Use the emergency button in the app which alerts local authorities and your emergency contacts. You can also end the trip early.' },
    ],
  },
  {
    category: 'Vehicle & Documents',
    icon: '📄',
    questions: [
      { q: 'What documents do I need?', a: "You need: valid driver's license, vehicle registration, insurance, a clear profile photo, and photos of your vehicle." },
      { q: 'How long does verification take?', a: "Documents are typically reviewed within 24-48 hours. You'll receive a notification once approved." },
    ],
  },
];

export default function DriverHelpPage() {
  const router = useRouter();
  const { isAuthenticated, userType } = useSelector((state: RootState) => state.auth);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) { router.replace('/login'); return; }
    if (userType === 'rider') { router.replace('/rider'); return; }
  }, [isAuthenticated, userType, router]);

  const toggleFaq = (id: string) => setExpandedFaq(expandedFaq === id ? null : id);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="px-6 pt-14 pb-4 safe-area-top">
        <button onClick={() => router.back()} className="text-black font-medium">← Back</button>
        <h1 className="text-xl font-semibold text-black mt-4">Help & Support</h1>
        <p className="text-gray-500 mt-1">How can we help you today?</p>
      </div>

      <div className="px-6 mb-4">
        <div className="bg-gray-100 rounded-xl p-4">
          <p className="text-sm text-gray-500 mb-3">Contact Us</p>
          <div className="grid grid-cols-3 gap-3">
            <button onClick={() => router.push('/driver/support')} className="flex flex-col items-center gap-2 p-3 bg-white rounded-xl">
              <span className="text-2xl">💬</span><span className="text-sm font-medium text-black">Chat</span>
            </button>
            <button onClick={() => window.location.href = 'tel:+263780000000'} className="flex flex-col items-center gap-2 p-3 bg-white rounded-xl">
              <span className="text-2xl">📞</span><span className="text-sm font-medium text-black">Call</span>
            </button>
            <button onClick={() => window.location.href = 'mailto:support@hande.co.zw'} className="flex flex-col items-center gap-2 p-3 bg-white rounded-xl">
              <span className="text-2xl">✉️</span><span className="text-sm font-medium text-black">Email</span>
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 mb-4">
        <div className="bg-gray-100 rounded-xl overflow-hidden">
          <button onClick={() => router.push('/driver/support?type=problem')} className="w-full flex items-center gap-4 p-4">
            <span className="text-xl">⚠️</span>
            <div className="flex-1 text-left"><p className="font-medium text-black">Report a Problem</p><p className="text-sm text-gray-500">Issues with your account or rides</p></div>
            <ChevronRight size={20} className="text-gray-400" />
          </button>
          <button onClick={() => router.push('/driver/support?type=payment')} className="w-full flex items-center gap-4 p-4 border-t border-gray-200">
            <span className="text-xl">💳</span>
            <div className="flex-1 text-left"><p className="font-medium text-black">Payment Issues</p><p className="text-sm text-gray-500">Questions about earnings or fees</p></div>
            <ChevronRight size={20} className="text-gray-400" />
          </button>
          <button onClick={() => router.push('/driver/support?type=trip')} className="w-full flex items-center gap-4 p-4 border-t border-gray-200">
            <span className="text-xl">📍</span>
            <div className="flex-1 text-left"><p className="font-medium text-black">Trip Problems</p><p className="text-sm text-gray-500">Issues with a specific ride</p></div>
            <ChevronRight size={20} className="text-gray-400" />
          </button>
        </div>
      </div>

      <div className="px-6 pb-8 flex-1">
        <p className="text-sm text-gray-500 mb-3">Frequently Asked Questions</p>
        {faqs.map((category) => (
          <div key={category.category} className="mb-4">
            <div className="bg-gray-100 rounded-xl overflow-hidden">
              <div className="flex items-center gap-3 p-4 border-b border-gray-200">
                <span className="text-xl">{category.icon}</span>
                <h4 className="font-medium text-black">{category.category}</h4>
              </div>
              {category.questions.map((faq, index) => {
                const id = `${category.category}-${index}`;
                const isExpanded = expandedFaq === id;
                return (
                  <div key={index} className="border-b border-gray-200 last:border-b-0">
                    <button onClick={() => toggleFaq(id)} className="w-full flex items-center justify-between p-4 text-left">
                      <span className="text-black pr-4">{faq.q}</span>
                      <ChevronDown size={20} className={`text-gray-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                    {isExpanded && <div className="px-4 pb-4"><p className="text-gray-600 text-sm">{faq.a}</p></div>}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="px-6 pb-8">
        <div className="bg-gray-100 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-500">Need more help? <a href="https://hande.co.zw/help" className="text-primary font-medium">Visit our Help Center</a></p>
        </div>
      </div>
    </div>
  );
}
