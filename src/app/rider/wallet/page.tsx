'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { 
  ArrowLeft, 
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  Clock,
  DollarSign
} from 'lucide-react';
import type { RootState } from '@/store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
          <h1 className="text-xl font-semibold text-white">Wallet</h1>
        </div>

        {/* Balance Card */}
        <Card className="bg-white/10 backdrop-blur border-white/20">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Wallet size={24} className="text-white" />
              </div>
              <div>
                <p className="text-white/70 text-sm">Available Balance</p>
                <p className="text-3xl font-bold text-white">
                  ${wallet?.balance?.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>
            
            <Button 
              className="w-full bg-white text-primary hover:bg-white/90"
              onClick={() => {/* TODO: Add funds modal */}}
            >
              <Plus size={18} className="mr-2" />
              Add Funds
            </Button>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="px-4 -mt-4">
        <Card className="p-4">
          <div className="grid grid-cols-3 gap-4">
            <QuickAction icon={<CreditCard size={20} />} label="Cards" onClick={() => {}} />
            <QuickAction icon={<Clock size={20} />} label="History" onClick={() => {}} />
            <QuickAction icon={<DollarSign size={20} />} label="Promos" onClick={() => {}} />
          </div>
        </Card>
      </div>

      {/* Transaction History */}
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-500 mb-3 px-1">RECENT TRANSACTIONS</h3>
        
        {error && (
          <Card className="p-4 bg-danger/10 border-danger/20 mb-4">
            <p className="text-danger text-sm">{error}</p>
          </Card>
        )}

        {history.length === 0 ? (
          <Card className="p-8 text-center">
            <Clock size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-dark mb-2">No transactions</h3>
            <p className="text-gray-500 text-sm">Your payment history will appear here</p>
          </Card>
        ) : (
          <Card>
            {history.map((item, index) => (
              <TransactionItem 
                key={item.id} 
                transaction={item} 
                showDivider={index > 0}
              />
            ))}
          </Card>
        )}
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

function TransactionItem({ 
  transaction, 
  showDivider 
}: { 
  transaction: PaymentHistory; 
  showDivider: boolean;
}) {
  const isCredit = transaction.type === 'wallet_topup';
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const typeLabels: Record<string, string> = {
    trip_payment: 'Trip Payment',
    wallet_topup: 'Added Funds',
    daily_fee: 'Daily Fee',
    payout: 'Payout',
  };

  return (
    <div className={`flex items-center gap-4 p-4 ${showDivider ? 'border-t border-gray-100' : ''}`}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isCredit ? 'bg-primary/10' : 'bg-danger/10'}`}>
        {isCredit ? (
          <ArrowDownLeft size={20} className="text-primary" />
        ) : (
          <ArrowUpRight size={20} className="text-danger" />
        )}
      </div>
      <div className="flex-1">
        <p className="font-medium text-dark">{typeLabels[transaction.type] || transaction.type}</p>
        <p className="text-sm text-gray-500">{formatDate(transaction.createdAt)}</p>
      </div>
      <p className={`font-semibold ${isCredit ? 'text-primary' : 'text-dark'}`}>
        {isCredit ? '+' : '-'}${transaction.amount.toFixed(2)}
      </p>
    </div>
  );
}
