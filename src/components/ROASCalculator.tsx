import React from 'react';
import { useAppStore } from '@/src/store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Label } from './ui/Label';
import { Input } from './ui/Input';
import { formatCurrency, cn } from '@/src/lib/utils';
import { translations } from '@/src/locales/translations';

export function ROASCalculator() {
  const { state, updateState } = useAppStore();
  const t = translations[state.language];

  const roasRevenue = Number(state.roasRevenue) || 0;
  const roasAdsSpend = Number(state.roasAdsSpend) || 0;
  const roas = roasAdsSpend > 0 ? roasRevenue / roasAdsSpend : 0;
  
  // Break-even ROAS based on selected size's margin
  const selectedData = state.sizes[state.selectedSize] || { importCost: 0, sellingPrice: 0 };
  const sellingPrice = Number(selectedData.sellingPrice) || 0;
  const importCost = Number(selectedData.importCost) || 0;
  const shopeeCommissionPercent = Number(state.shopeeCommissionPercent) || 0;
  const paymentFeePercent = Number(state.paymentFeePercent) || 0;
  const fixedFee = Number(state.fixedFee) || 0;
  const shippingCost = Number(state.shippingCost) || 0;

  const shopeeFee = sellingPrice * (shopeeCommissionPercent / 100);
  const paymentFee = sellingPrice * (paymentFeePercent / 100);
  const totalFee = shopeeFee + paymentFee + fixedFee;
  
  const maxAdsSpendPerItem = sellingPrice - totalFee - importCost - shippingCost;
  const breakEvenRoas = maxAdsSpendPerItem > 0 ? sellingPrice / maxAdsSpendPerItem : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.roasCalculator}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t.revenue} ({t.vnd})</Label>
              <Input
                type="number"
                value={state.roasRevenue}
                onChange={(e) => updateState({ roasRevenue: e.target.value === '' ? '' : Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t.adsSpend} ({t.vnd})</Label>
              <Input
                type="number"
                value={state.roasAdsSpend}
                onChange={(e) => updateState({ roasAdsSpend: e.target.value === '' ? '' : Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6 space-y-4 border dark:border-slate-800 flex flex-col justify-center">
            <div className="flex justify-between items-center py-2 border-b dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">{t.currentRoas}</span>
              <span className="font-mono font-bold text-xl">{roas.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">{t.breakEvenRoas} ({t.size} {state.selectedSize})</span>
              <span className="font-mono font-medium">{breakEvenRoas > 0 ? breakEvenRoas.toFixed(2) : 'N/A'}</span>
            </div>
            
            <div className={cn(
              "mt-4 p-4 rounded-lg flex flex-col items-center justify-center space-y-1",
              roas >= breakEvenRoas && breakEvenRoas > 0 ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
            )}>
              <span className="text-sm font-medium uppercase tracking-wider opacity-80">{t.status}</span>
              <span className="text-xl font-bold">
                {roas >= breakEvenRoas && breakEvenRoas > 0 ? t.profitable : t.losingMoney}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
