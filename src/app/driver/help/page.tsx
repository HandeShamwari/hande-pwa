'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { 
  ArrowLeft, 
  HelpCircle,
  MessageCircle,
  Phone,
  Mail,
  FileText,
  ChevronRight,
  ChevronDown,
  DollarSign,
  Car,
  Shield,
  CreditCard,
  MapPin,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import type { RootState } from '@/store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const faqs = [
  {
    category: 'Subscription',
    icon: DollarSign,
    questions: [
      {
        q: 'How does the $1/day subscription work?',
        a: 'You pay $1 daily to access rider requests. This replaces the traditional commission model - you keep 100% of your earnings from each ride.',
      },
      {
        q: 'What if I don\'t pay for a day?',
        a: 'If your subscription expires, you won\'t receive new ride requests. You can reactivate anytime by paying the daily fee.',
      },
      {
        q: 'Can I pay for multiple days at once?',
        a: 'Yes! You can pay for 1, 3, 7, or 30 days in advance to ensure uninterrupted service.',
      },
    ],
  },
  {
    category: 'Rides & Earnings',
    icon: Car,
    questions: [
      {
        q: 'How do I accept a ride?',
        a: 'When you\'re online and a rider requests a trip nearby, you\'ll receive a notification. Tap to view details and accept within 30 seconds.',
      },
      {
        q: 'How much can I earn?',
        a: 'You keep 100% of the fare. Earnings depend on trip distance, time, and local demand. The app calculates fair prices based on distance.',
      },
      {
        q: 'When do I get paid?',
        a: 'Cash rides are paid directly by riders. For wallet payments, earnings are added to your driver wallet and can be withdrawn anytime.',
      },
    ],
  },
  {
    category: 'Safety',
    icon: Shield,
    questions: [
      {
        q: 'What safety features are available?',
        a: 'Features include: ride tracking shared with trusted contacts, in-app emergency button, rider verification, and trip recording.',
      },
      {
        q: 'What if I feel unsafe during a ride?',
        a: 'Use the emergency button in the app which alerts local authorities and your emergency contacts. You can also end the trip early.',
      },
    ],
  },
  {
    category: 'Vehicle & Documents',
    icon: FileText,
    questions: [
      {
        q: 'What documents do I need?',
        a: 'You need: valid driver\'s license, vehicle registration, insurance, a clear profile photo, and photos of your vehicle.',
      },
      {
        q: 'How long does verification take?',
        a: 'Documents are typically reviewed within 24-48 hours. You\'ll receive a notification once approved.',
      },
    ],
  },
];

export default function DriverHelpPage() {
  const router = useRouter();
  const { isAuthenticated, userType } = useSelector((state: RootState) => state.auth);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    if (userType === 'rider') {
      router.replace('/rider');
      return;
    }
  }, [isAuthenticated, userType, router]);

  const toggleFaq = (id: string) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gray-bg">
      {/* Header */}
      <div className="bg-primary px-4 pt-12 pb-8 safe-area-top">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-xl font-semibold text-white">Help & Support</h1>
        </div>
        <p className="text-white/80">How can we help you today?</p>
      </div>

      {/* Contact Options */}
      <div className="px-4 -mt-4">
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-3">CONTACT US</h3>
          <div className="grid grid-cols-3 gap-3">
            <ContactButton
              icon={<MessageCircle size={20} className="text-primary" />}
              label="Chat"
              onClick={() => router.push('/driver/support')}
            />
            <ContactButton
              icon={<Phone size={20} className="text-primary" />}
              label="Call"
              onClick={() => window.location.href = 'tel:+263780000000'}
            />
            <ContactButton
              icon={<Mail size={20} className="text-primary" />}
              label="Email"
              onClick={() => window.location.href = 'mailto:support@hande.co.zw'}
            />
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-4">
        <Card className="overflow-hidden">
          <QuickAction
            icon={<AlertTriangle size={20} className="text-danger" />}
            label="Report a Problem"
            description="Issues with your account or rides"
            onClick={() => router.push('/driver/support?type=problem')}
          />
          <QuickAction
            icon={<CreditCard size={20} className="text-accent" />}
            label="Payment Issues"
            description="Questions about earnings or fees"
            onClick={() => router.push('/driver/support?type=payment')}
          />
          <QuickAction
            icon={<MapPin size={20} className="text-info" />}
            label="Trip Problems"
            description="Issues with a specific ride"
            onClick={() => router.push('/driver/support?type=trip')}
          />
        </Card>
      </div>

      {/* FAQs */}
      <div className="px-4 pb-8">
        <h3 className="text-sm font-medium text-gray-500 mb-3 px-1">FREQUENTLY ASKED QUESTIONS</h3>
        
        {faqs.map((category) => (
          <div key={category.category} className="mb-4">
            <Card className="overflow-hidden">
              <div className="flex items-center gap-3 p-4 border-b border-gray-100">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <category.icon size={16} className="text-primary" />
                </div>
                <h4 className="font-medium text-dark">{category.category}</h4>
              </div>
              
              {category.questions.map((faq, index) => {
                const id = `${category.category}-${index}`;
                const isExpanded = expandedFaq === id;
                return (
                  <div key={index} className="border-b border-gray-100 last:border-b-0">
                    <button
                      onClick={() => toggleFaq(id)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
                    >
                      <span className="text-dark pr-4">{faq.q}</span>
                      <ChevronDown
                        size={20}
                        className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {isExpanded && (
                      <div className="px-4 pb-4">
                        <p className="text-gray-600 text-sm">{faq.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </Card>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 pb-8">
        <Card className="p-4 bg-gray-50">
          <p className="text-center text-sm text-gray-500">
            Need more help?{' '}
            <a href="https://hande.co.zw/help" className="text-primary font-medium">
              Visit our Help Center <ExternalLink size={12} className="inline" />
            </a>
          </p>
        </Card>
      </div>
    </div>
  );
}

function ContactButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
    >
      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
        {icon}
      </div>
      <span className="text-sm font-medium text-dark">{label}</span>
    </button>
  );
}

function QuickAction({
  icon,
  label,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
    >
      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
        {icon}
      </div>
      <div className="flex-1 text-left">
        <p className="font-medium text-dark">{label}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <ChevronRight size={20} className="text-gray-400" />
    </button>
  );
}
