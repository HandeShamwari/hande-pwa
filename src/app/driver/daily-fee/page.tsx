'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { Check, AlertCircle, Calendar } from 'lucide-react';
import type { RootState } from '@/store';
import { LoadingScreen } from '@/components/ui/loading';
import { driverService, DailyFeeStatus, DailyFeePayment } from '@/lib/services';

export default function DriverDailyFeePage() {
  const router = useRouter();
  const { isAuthenticated, userType } = useSelector((state: RootState) => state.auth);
  const [status, setStatus] = useState<DailyFeeStatus | null>(null);
  const [history, setHistory] = useState<DailyFeePayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDays, setSelectedDays] = useState(1);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    if (userType === 'rider') {
      router.replace('/rider');
      return;
    }
    loadData();
  }, [isAuthenticated, userType, router]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [statusData, historyData] = await Promise.all([
        driverService.getDailyFeeStatus(),
        driverService.getDailyFeeHistory(20),
      ]);
      setStatus(statusData);
      setHistory(historyData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load subscription data');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayFee = async () => {
    try {
      setIsPaying(true);
      const payment = await driverService.payDailyFee(selectedDays);
      setHistory([payment, ...history]);
      await loadData();
      setSelectedDays(1);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Payment failed');
    } finally {
      setIsPaying(false);
    }
  };

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
        <h1 className="text-xl font-semibold text-black mt-4">Daily Fee</h1>
      </div>

      {/* Status Card */}
      <div className="px-6 mb-4">
        <div className={`rounded-xl p-6 ${status?.isPaid ? 'bg-primary' : 'bg-gray-100'}`}>
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center ${status?.isPaid ? 'bg-white/20' : 'bg-gray-200'}`}>
              {status?.isPaid ? (
                <Check size={28} className="text-white" />
              ) : (
                <AlertCircle size={28} className="text-gray-500" />
              )}
            </div>
            <div>
              <p className={`text-sm ${status?.isPaid ? 'text-white/70' : 'text-gray-500'}`}>Subscription Status</p>
              <p className={`text-xl font-bold ${status?.isPaid ? 'text-white' : 'text-black'}`}>
                {status?.isPaid ? 'Active' : 'Inactive'}
              </p>
            </div>
          </div>
          
          {status?.isPaid && status.paidUntil && (
            <div className={`flex items-center gap-2 ${status?.isPaid ? 'text-white/80' : 'text-gray-500'}`}>
              <Calendar size={16} />
              <span>Valid until {new Date(status.paidUntil).toLocaleDateString()}</span>
            </div>
          )}
          
          {status?.daysRemaining !== undefined && status.daysRemaining > 0 && (
            <p className="text-white/70 mt-2">{status.daysRemaining} days remaining</p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 flex-1">
        {error && (
          <div className="bg-red-50 rounded-xl p-4 mb-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Pay Fee Card */}
        <div className="bg-gray-100 rounded-xl p-6 mb-4">
          <div className="text-center mb-6">
            <p className="text-gray-500 text-sm mb-1">Daily Fee</p>
            <div className="flex items-baseline justify-center">
              <span className="text-5xl font-bold text-accent">$1</span>
              <span className="text-xl text-gray-500 ml-1">/day</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              No commission. Keep 100% of your earnings.
            </p>
          </div>

          {/* Day Selector */}
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-3">Select days to pay</p>
            <div className="grid grid-cols-4 gap-2">
              {[1, 3, 7, 30].map((days) => (
                <button
                  key={days}
                  onClick={() => setSelectedDays(days)}
                  className={`py-3 rounded-xl text-center transition-colors ${
                    selectedDays === days
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  <span className="text-lg font-bold">{days}</span>
                  <span className="text-xs block">{days === 1 ? 'day' : 'days'}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between p-4 bg-white rounded-xl mb-6">
            <span className="text-gray-600">Total</span>
            <span className="text-2xl font-bold text-black">${selectedDays}</span>
          </div>

          {/* Payment Method */}
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-3">Payment Method</p>
            <div className="bg-white rounded-xl p-4 flex items-center gap-4 border-2 border-primary">
              <span className="text-2xl">📱</span>
              <div>
                <p className="font-medium text-black">EcoCash</p>
                <p className="text-sm text-gray-500">Pay from your mobile wallet</p>
              </div>
            </div>
          </div>

          <button 
            onClick={handlePayFee}
            disabled={isPaying}
            className="w-full py-4 bg-primary text-white font-semibold rounded-xl disabled:opacity-50"
          >
            {isPaying ? 'Processing...' : `Pay $${selectedDays}`}
          </button>
        </div>

        {/* Benefits */}
        <div className="bg-primary/10 rounded-xl p-4 mb-4">
          <h3 className="font-medium text-black mb-3">Why $1/day?</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center gap-2">
              <Check size={16} className="text-primary" />
              Keep 100% of your ride earnings
            </li>
            <li className="flex items-center gap-2">
              <Check size={16} className="text-primary" />
              No percentage commission taken
            </li>
            <li className="flex items-center gap-2">
              <Check size={16} className="text-primary" />
              Fair pricing for riders
            </li>
            <li className="flex items-center gap-2">
              <Check size={16} className="text-primary" />
              Support local drivers
            </li>
          </ul>
        </div>

        {/* Payment History */}
        <div>
          <p className="text-sm text-gray-500 mb-3">Payment History</p>
          {history.length === 0 ? (
            <div className="bg-gray-100 rounded-xl p-6 text-center">
              <p className="text-gray-500 text-sm">No payments yet</p>
            </div>
          ) : (
            <div className="bg-gray-100 rounded-xl overflow-hidden">
              {history.map((payment, index) => (
                <div key={payment.id} className={`flex items-center justify-between p-4 ${index > 0 ? 'border-t border-gray-200' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                      <span className="text-lg">💵</span>
                    </div>
                    <div>
                      <p className="font-medium text-black">{payment.days} day{payment.days > 1 ? 's' : ''} subscription</p>
                      <p className="text-sm text-gray-500">{new Date(payment.paidAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className="font-semibold text-black">${payment.amount}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="h-8" />
    </div>
  );
}
