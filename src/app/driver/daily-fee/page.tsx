'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { 
  ArrowLeft, 
  DollarSign,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  CreditCard,
  Smartphone
} from 'lucide-react';
import type { RootState } from '@/store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
      await loadData(); // Refresh status
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
          <h1 className="text-xl font-semibold text-white">Daily Fee</h1>
        </div>

        {/* Status Card */}
        <Card className={`${status?.isPaid ? 'bg-white/10' : 'bg-accent/20'} backdrop-blur border-white/20`}>
          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${status?.isPaid ? 'bg-primary' : 'bg-accent'}`}>
                {status?.isPaid ? (
                  <CheckCircle size={28} className="text-white" />
                ) : (
                  <AlertCircle size={28} className="text-dark" />
                )}
              </div>
              <div>
                <p className="text-white/70 text-sm">Subscription Status</p>
                <p className="text-xl font-bold text-white">
                  {status?.isPaid ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>
            
            {status?.isPaid && status.paidUntil && (
              <div className="flex items-center gap-2 text-white/80">
                <Calendar size={16} />
                <span>Valid until {new Date(status.paidUntil).toLocaleDateString()}</span>
              </div>
            )}
            
            {status?.daysRemaining !== undefined && status.daysRemaining > 0 && (
              <p className="text-white/70 mt-2">{status.daysRemaining} days remaining</p>
            )}
          </div>
        </Card>
      </div>

      {/* Content */}
      <div className="p-4 -mt-4">
        {error && (
          <Card className="p-4 bg-danger/10 border-danger/20 mb-4">
            <p className="text-danger text-sm">{error}</p>
          </Card>
        )}

        {/* Pay Fee Card */}
        <Card className="p-6 mb-4">
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
            <p className="text-sm font-medium text-gray-700 mb-3">Select days to pay</p>
            <div className="grid grid-cols-4 gap-2">
              {[1, 3, 7, 30].map((days) => (
                <button
                  key={days}
                  onClick={() => setSelectedDays(days)}
                  className={`py-3 rounded-lg border text-center transition-colors ${
                    selectedDays === days
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-gray-200 text-gray-600'
                  }`}
                >
                  <span className="text-lg font-bold">{days}</span>
                  <span className="text-xs block">{days === 1 ? 'day' : 'days'}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-6">
            <span className="text-gray-600">Total</span>
            <span className="text-2xl font-bold text-dark">${selectedDays}</span>
          </div>

          {/* Payment Methods */}
          <div className="space-y-3 mb-6">
            <p className="text-sm font-medium text-gray-700">Payment Method</p>
            <button className="w-full flex items-center gap-4 p-4 border border-primary bg-primary/5 rounded-lg">
              <Smartphone size={24} className="text-primary" />
              <div className="text-left">
                <p className="font-medium text-dark">EcoCash</p>
                <p className="text-sm text-gray-500">Pay from your mobile wallet</p>
              </div>
            </button>
          </div>

          <Button 
            fullWidth 
            onClick={handlePayFee}
            disabled={isPaying}
          >
            {isPaying ? 'Processing...' : `Pay $${selectedDays}`}
          </Button>
        </Card>

        {/* Benefits */}
        <Card className="p-4 mb-4 bg-primary/5 border-primary/20">
          <h3 className="font-medium text-dark mb-3">Why $1/day?</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center gap-2">
              <CheckCircle size={16} className="text-primary" />
              Keep 100% of your ride earnings
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle size={16} className="text-primary" />
              No percentage commission taken
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle size={16} className="text-primary" />
              Fair pricing for riders
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle size={16} className="text-primary" />
              Support local drivers
            </li>
          </ul>
        </Card>

        {/* Payment History */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-3 px-1">PAYMENT HISTORY</h3>
          {history.length === 0 ? (
            <Card className="p-6 text-center">
              <Clock size={32} className="mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500 text-sm">No payments yet</p>
            </Card>
          ) : (
            <Card>
              {history.map((payment, index) => (
                <PaymentItem key={payment.id} payment={payment} showDivider={index > 0} />
              ))}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function PaymentItem({ payment, showDivider }: { payment: DailyFeePayment; showDivider: boolean }) {
  return (
    <div className={`flex items-center justify-between p-4 ${showDivider ? 'border-t border-gray-100' : ''}`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
          <DollarSign size={18} className="text-primary" />
        </div>
        <div>
          <p className="font-medium text-dark">{payment.days} day{payment.days > 1 ? 's' : ''} subscription</p>
          <p className="text-sm text-gray-500">{new Date(payment.paidAt).toLocaleDateString()}</p>
        </div>
      </div>
      <span className="font-semibold text-dark">${payment.amount}</span>
    </div>
  );
}
