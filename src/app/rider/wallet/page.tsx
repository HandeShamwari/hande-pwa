'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { LoadingScreen } from '@/components/ui/loading';
import { paymentsService, Wallet as WalletType, PaymentHistory } from '@/lib/services';

export default function RiderWalletPage() {
  const router = useRouter();
  const { isAuthenticated, userType } = useSelector((state: RootState) => state.auth);
  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [history, setHistory] = useState<PaymentHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    if (userType === 'driver') {
      router.replace('/driver/earnings');
      return;
    }
    loadData();
  }, [isAuthenticated, userType, router]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [walletData, historyData] = await Promise.all([
        paymentsService.getWallet(),
        paymentsService.getPaymentHistory(20),
      ]);
      setWallet(walletData);
      setHistory(historyData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load wallet data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const typeLabels: Record<string, string> = {
    trip_payment: 'Trip Payment',
    wallet_topup: 'Added Funds',
    daily_fee: 'Daily Fee',
    payout: 'Payout',
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="px-6 pt-14 pb-4 safe-area-top">
        <button onClick={() => router.back()} className="text-black font-medium">
          ← Back
        </button>
        <h1 className="text-xl font-semibold text-black mt-4">Wallet</h1>
      </div>

      {/* Balance Card */}
      <div className="px-6 mb-6">
        <div className="bg-gray-100 rounded-xl p-6 text-center">
          <p className="text-sm text-gray-500 mb-1">Available Balance</p>
          <p className="text-4xl font-bold text-black">
            ${wallet?.balance?.toFixed(2) || '0.00'}
          </p>
        </div>
      </div>

      {/* Add Funds Button */}
      <div className="px-6 mb-6">
        <button className="w-full py-4 bg-primary text-white font-semibold rounded-xl">
          Add Funds
        </button>
      </div>

      {/* Transaction History */}
      <div className="px-6 flex-1">
        <h3 className="text-sm text-gray-500 mb-3">Recent Transactions</h3>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        {history.length === 0 ? (
          <div className="bg-gray-100 rounded-xl p-8 text-center">
            <p className="text-gray-500">No transactions yet</p>
          </div>
        ) : (
          <div className="bg-gray-100 rounded-xl overflow-hidden">
            {history.map((item, index) => (
              <div 
                key={item.id} 
                className={`flex items-center justify-between p-4 ${index > 0 ? 'border-t border-gray-200' : ''}`}
              >
                <div>
                  <p className="text-black font-medium">{typeLabels[item.type] || item.type}</p>
                  <p className="text-sm text-gray-500">{formatDate(item.createdAt)}</p>
                </div>
                <p className={`font-semibold ${item.type === 'wallet_topup' ? 'text-primary' : 'text-black'}`}>
                  {item.type === 'wallet_topup' ? '+' : '-'}${item.amount.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="h-8" />
    </div>
  );
}
