import React from 'react';
import { useAppStore } from '@/src/store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Label } from './ui/Label';
import { Input } from './ui/Input';
import { formatCurrency, cn } from '@/src/lib/utils';
import { translations } from '@/src/locales/translations';

export function FlashSaleSimulator() {
  const { state, updateState } = useAppStore();
  const t = translations[state.language];

  const fsOriginalPrice = Number(state.fsOriginalPrice) || 0;
  const fsDiscountPercent = Number(state.fsDiscountPercent) || 0;
  const fsShopeeSupportPercent = Number(state.fsShopeeSupportPercent) || 0;
  const fsSellerSupportPercent = Number(state.fsSellerSupportPercent) || 0;

  const finalPrice = fsOriginalPrice * (1 - fsDiscountPercent / 100);
  const shopeeSupportAmount = fsOriginalPrice * (fsShopeeSupportPercent / 100);
  const sellerSupportAmount = fsOriginalPrice * (fsSellerSupportPercent / 100);
  
  // The seller receives the final price + shopee support
  // But wait, if discount is 10%, and seller support is 10%, shopee support is 0%
  // The seller loss amount is just the seller support amount.
  const sellerLossAmount = sellerSupportAmount;
  
  // Remaining profit calculation based on selected size
  const selectedData = state.sizes[state.selectedSize] || { importCost: 0, sellingPrice: 0 };
  const importCost = Number(selectedData.importCost) || 0;
  const shopeeCommissionPercent = Number(state.shopeeCommissionPercent) || 0;
  const paymentFeePercent = Number(state.paymentFeePercent) || 0;
  const fixedFee = Number(state.fixedFee) || 0;
  const adsCostPerOrder = Number(state.adsCostPerOrder) || 0;
  const shippingCost = Number(state.shippingCost) || 0;

  const shopeeFee = finalPrice * (shopeeCommissionPercent / 100);
  const paymentFee = finalPrice * (paymentFeePercent / 100);
  const totalFee = shopeeFee + paymentFee + fixedFee;
  
  // Real profit = Final Price + Shopee Support - Total Fee - Import Cost - Ads Cost - Shipping Cost
  const remainingProfit = finalPrice + shopeeSupportAmount - totalFee - importCost - adsCostPerOrder - shippingCost;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.flashSaleSimulator}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t.originalPrice} ({t.vnd})</Label>
              <Input
                type="number"
                value={state.fsOriginalPrice}
                onChange={(e) => updateState({ fsOriginalPrice: e.target.value === '' ? '' : Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t.discount} (%)</Label>
              <Input
                type="number"
                value={state.fsDiscountPercent}
                onChange={(e) => updateState({ fsDiscountPercent: e.target.value === '' ? '' : Number(e.target.value) })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t.shopeeSupport} (%)</Label>
                <Input
                  type="number"
                  value={state.fsShopeeSupportPercent}
                  onChange={(e) => updateState({ fsShopeeSupportPercent: e.target.value === '' ? '' : Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t.sellerSupport} (%)</Label>
                <Input
                  type="number"
                  value={state.fsSellerSupportPercent}
                  onChange={(e) => updateState({ fsSellerSupportPercent: e.target.value === '' ? '' : Number(e.target.value) })}
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6 space-y-4 border dark:border-slate-800 flex flex-col justify-center">
            <div className="flex justify-between items-center py-2 border-b dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">{t.finalPrice}</span>
              <span className="font-mono font-medium">{formatCurrency(finalPrice)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">{t.sellerLossAmount}</span>
              <span className="font-mono font-medium text-red-500">-{formatCurrency(sellerLossAmount)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">{t.remainingProfit} ({t.size} {state.selectedSize})</span>
              <span className={cn("font-mono font-medium", remainingProfit > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
                {formatCurrency(remainingProfit)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
