'use client';

import { AlertCircle, Clock } from 'lucide-react';
import type { DailyFee } from '@/store/slices/driverSlice';
import { Button } from '@/components/ui/button';

interface DailyFeeAlertProps {
  dailyFee: DailyFee;
  onPayNow: () => void;
}

export function DailyFeeAlert({ dailyFee, onPayNow }: DailyFeeAlertProps) {
  const isGracePeriod = dailyFee.graceEndsAt !== undefined;
  const hasPenalty = dailyFee.penalty && dailyFee.penalty > 0;

  // Calculate time remaining in grace period
  let graceTimeRemaining = '';
  if (dailyFee.graceEndsAt) {
    const graceEnd = new Date(dailyFee.graceEndsAt);
    const now = new Date();
    const hoursRemaining = Math.max(0, Math.floor((graceEnd.getTime() - now.getTime()) / (1000 * 60 * 60)));
    graceTimeRemaining = `${hoursRemaining}h remaining`;
  }

  return (
    <div className={`mb-4 p-4 rounded-xl ${
      hasPenalty ? 'bg-danger/10' : isGracePeriod ? 'bg-accent/10' : 'bg-accent/10'
    }`}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          hasPenalty ? 'bg-danger/20' : 'bg-accent/20'
        }`}>
          {hasPenalty ? (
            <AlertCircle size={20} className="text-danger" />
          ) : (
            <Clock size={20} className="text-accent" />
          )}
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-dark">
            {hasPenalty 
              ? 'Daily Fee Overdue' 
              : isGracePeriod 
                ? 'Daily Fee Due Soon' 
                : 'Daily Fee Required'}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {hasPenalty
              ? `Pay $${(dailyFee.amount + (dailyFee.penalty || 0)).toFixed(2)} (includes $${dailyFee.penalty?.toFixed(2)} penalty)`
              : isGracePeriod
                ? `Pay within ${graceTimeRemaining} to avoid penalty`
                : `Pay $${dailyFee.amount.toFixed(2)} to go online`}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div>
          <span className="text-2xl font-bold price-highlight">
            ${hasPenalty 
              ? (dailyFee.amount + (dailyFee.penalty || 0)).toFixed(2) 
              : dailyFee.amount.toFixed(2)}
          </span>
          {!hasPenalty && (
            <span className="text-sm text-gray-500 ml-2">per day</span>
          )}
        </div>
        <Button 
          size="sm" 
          variant={hasPenalty ? 'danger' : 'secondary'}
          onClick={onPayNow}
        >
          Pay Now
        </Button>
      </div>

      {/* Info text */}
      <p className="text-xs text-gray-500 mt-3">
        Keep 100% of your fares. No commissions, just <span className="price-highlight font-semibold">$1</span>/day.
      </p>
    </div>
  );
}
