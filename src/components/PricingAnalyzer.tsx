import React, { useState } from 'react';
import { useAppStore, Size } from '@/src/store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Label } from './ui/Label';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { formatCurrency, formatPercent, cn } from '@/src/lib/utils';
import { translations } from '@/src/locales/translations';
import { Plus, Trash2, Package, ShoppingBag, Megaphone, Truck, Target, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';

export function PricingAnalyzer() {
  const { state, updateState, updateSizeData, addSize, removeSize } = useAppStore();
  const [newSize, setNewSize] = useState('');
  const sizes: Size[] = Object.keys(state.sizes);
  const t = translations[state.language];

  const selectedData = state.sizes[state.selectedSize];

  const handleAddSize = () => {
    if (newSize.trim()) {
      addSize(newSize.trim());
      setNewSize('');
    }
  };

  if (!selectedData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Phân Tích Chiến Lược Giá</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-2 max-w-md">
            <Input 
              value={newSize} 
              onChange={(e) => setNewSize(e.target.value)} 
              placeholder={t.newSizeName}
              onKeyDown={(e) => e.key === 'Enter' && handleAddSize()}
            />
            <Button onClick={handleAddSize} className="shrink-0 gap-2">
              <Plus className="w-4 h-4" />
              {t.addSize}
            </Button>
          </div>
          <div className="text-center py-8 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed dark:border-slate-800">
            {t.pleaseAddSize}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Inputs
  const importCost = Number(selectedData.importCost) || 0;
  const packagingCost = Number(selectedData.packagingCost) || 0;
  const otherCost = Number(selectedData.otherCost) || 0;
  const expectedPrice = Number(selectedData.expectedPrice) || 0;

  const isFixedFeeEnabled = selectedData.isFixedFeeEnabled ?? true;
  const fixedFeePercent = isFixedFeeEnabled ? (Number(selectedData.fixedFeePercent) || 0) : 0;
  
  const isPaymentFeeEnabled = selectedData.isPaymentFeeEnabled ?? true;
  const paymentFeePercent = isPaymentFeeEnabled ? (Number(selectedData.paymentFeePercent) || 0) : 0;
  
  const isServiceFeeEnabled = selectedData.isServiceFeeEnabled ?? false;
  const serviceFeePercent = isServiceFeeEnabled ? (Number(selectedData.serviceFeePercent) || 0) : 0;

  const totalShopeeFeePercent = fixedFeePercent + paymentFeePercent + serviceFeePercent;

  const adsMode = selectedData.adsMode || 'percent';
  const adsPercentInput = Number(selectedData.adsPercent) || 0;
  const adsCpc = Number(selectedData.adsCpc) || 0;
  const adsConversionRate = Number(selectedData.adsConversionRate) || 0;

  const returnRate = Number(selectedData.returnRate) || 0;
  const returnCostPerOrder = Number(selectedData.returnCostPerOrder) || 0;
  const extraShippingCost = Number(selectedData.extraShippingCost) || 0;

  const targetMode = selectedData.targetMode || 'percent';
  const targetMarginPercent = Number(selectedData.targetMarginPercent) || 0;
  const targetProfitFixed = Number(selectedData.targetProfitFixed) || 0;

  // Calculations
  const totalProductCost = importCost + packagingCost + otherCost + extraShippingCost;
  
  // Calculate Return Loss per successful order
  // If return rate is R, for every 100 orders, R are returned, 100-R are successful.
  // Total return cost = R * returnCostPerOrder
  // Return cost distributed per successful order = (R * returnCostPerOrder) / (100 - R)
  const returnLossPerSuccessOrder = returnRate < 100 ? (returnRate * returnCostPerOrder) / (100 - returnRate) : 0;
  
  const totalCostBeforeFees = totalProductCost + returnLossPerSuccessOrder;

  // Calculate Minimum Price
  let minPrice = 0;
  let actualAdsPercent = 0;
  let targetProfitPercent = 0;

  if (targetMode === 'percent') {
    targetProfitPercent = targetMarginPercent;
  }

  if (adsMode === 'percent') {
    actualAdsPercent = adsPercentInput;
    const totalDeductionPercent = totalShopeeFeePercent + actualAdsPercent + targetProfitPercent;
    
    if (totalDeductionPercent < 100) {
      if (targetMode === 'percent') {
        minPrice = totalCostBeforeFees / (1 - totalDeductionPercent / 100);
      } else {
        minPrice = (totalCostBeforeFees + targetProfitFixed) / (1 - (totalShopeeFeePercent + actualAdsPercent) / 100);
      }
    }
  } else {
    // CPC Mode
    // Ads Cost = CPC / ConversionRate
    // Ads% = (CPC / ConversionRate) / Price
    // Price = TotalCost + ShopeeFee(Price) + AdsCost + TargetProfit(Price)
    const adsCostFixed = adsConversionRate > 0 ? (adsCpc / (adsConversionRate / 100)) : 0;
    
    if (targetMode === 'percent') {
      const totalDeductionPercent = totalShopeeFeePercent + targetProfitPercent;
      if (totalDeductionPercent < 100) {
        minPrice = (totalCostBeforeFees + adsCostFixed) / (1 - totalDeductionPercent / 100);
      }
    } else {
      if (totalShopeeFeePercent < 100) {
        minPrice = (totalCostBeforeFees + adsCostFixed + targetProfitFixed) / (1 - totalShopeeFeePercent / 100);
      }
    }
    
    if (minPrice > 0) {
      actualAdsPercent = (adsCostFixed / minPrice) * 100;
    }
  }

  // Use Expected Price for analysis if provided, otherwise use Min Price
  const analysisPrice = expectedPrice > 0 ? expectedPrice : minPrice;
  
  // Recalculate based on analysisPrice
  const shopeeFeeAmount = analysisPrice * (totalShopeeFeePercent / 100);
  let adsCostAmount = 0;
  if (adsMode === 'percent') {
    adsCostAmount = analysisPrice * (adsPercentInput / 100);
    actualAdsPercent = adsPercentInput;
  } else {
    adsCostAmount = adsConversionRate > 0 ? (adsCpc / (adsConversionRate / 100)) : 0;
    actualAdsPercent = analysisPrice > 0 ? (adsCostAmount / analysisPrice) * 100 : 0;
  }

  const netProfit = analysisPrice - totalCostBeforeFees - shopeeFeeAmount - adsCostAmount;
  const roi = totalCostBeforeFees > 0 ? (netProfit / totalCostBeforeFees) * 100 : 0;
  const actualMargin = analysisPrice > 0 ? (netProfit / analysisPrice) * 100 : 0;

  // Break-even Ads (Max Ads Cost before losing money)
  const maxAdsCost = analysisPrice - totalCostBeforeFees - shopeeFeeAmount;
  const breakEvenAdsPercent = analysisPrice > 0 ? (maxAdsCost / analysisPrice) * 100 : 0;

  const updateField = (field: keyof SizeData, value: any) => {
    updateSizeData(state.selectedSize, { [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Size Management Header */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="flex gap-2 max-w-md w-full">
              <Input 
                value={newSize} 
                onChange={(e) => setNewSize(e.target.value)} 
                placeholder={t.newSizeName}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSize()}
              />
              <Button onClick={handleAddSize} className="shrink-0 gap-2">
                <Plus className="w-4 h-4" />
                {t.addSize}
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {sizes.map(size => (
                <div key={size} className="flex items-center">
                  <button
                    onClick={() => updateState({ selectedSize: size })}
                    className={cn(
                      "py-2 px-3 rounded-l-md text-sm font-medium transition-colors border",
                      state.selectedSize === size 
                        ? "bg-blue-900 text-white border-blue-900 dark:bg-blue-600 dark:border-blue-600" 
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 dark:bg-slate-950 dark:text-slate-300 dark:border-slate-800 dark:hover:bg-slate-900"
                    )}
                  >
                    {size}
                  </button>
                  <button
                    onClick={() => removeSize(size)}
                    className={cn(
                      "py-2 px-2 rounded-r-md text-sm transition-colors border border-l-0",
                      state.selectedSize === size
                        ? "bg-blue-900 text-white border-blue-900 hover:bg-red-500 hover:border-red-500 dark:bg-blue-600 dark:border-blue-600 dark:hover:bg-red-600 dark:hover:border-red-600"
                        : "bg-white text-slate-400 border-slate-200 hover:bg-red-50 hover:text-red-500 dark:bg-slate-950 dark:border-slate-800 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                    )}
                    title={t.delete}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Inputs */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 1. Thông tin sản phẩm */}
          <Card>
            <CardHeader className="pb-3 border-b dark:border-slate-800">
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-500" />
                Thông tin sản phẩm
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Giá nhập / Giá xưởng (VNĐ)</Label>
                <Input type="number" value={selectedData.importCost} onChange={(e) => updateField('importCost', e.target.value === '' ? '' : Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>Chi phí đóng gói (VNĐ)</Label>
                <Input type="number" value={selectedData.packagingCost} onChange={(e) => updateField('packagingCost', e.target.value === '' ? '' : Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>Chi phí phát sinh khác (VNĐ)</Label>
                <Input type="number" value={selectedData.otherCost} onChange={(e) => updateField('otherCost', e.target.value === '' ? '' : Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label className="text-blue-600 dark:text-blue-400 font-semibold">Giá bán dự kiến (Tùy chọn)</Label>
                <Input type="number" placeholder="Để trống để tự tính" value={selectedData.expectedPrice} onChange={(e) => updateField('expectedPrice', e.target.value === '' ? '' : Number(e.target.value))} className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10" />
              </div>
            </CardContent>
          </Card>

          {/* 2. Phí Shopee */}
          <Card>
            <CardHeader className="pb-3 border-b dark:border-slate-800">
              <CardTitle className="text-lg flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-orange-500" />
                Phí Shopee ({totalShopeeFeePercent}%)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="flex items-center gap-4">
                <input type="checkbox" checked={isFixedFeeEnabled} onChange={(e) => updateField('isFixedFeeEnabled', e.target.checked)} className="w-4 h-4 rounded border-slate-300" />
                <div className="flex-1 space-y-1">
                  <Label>Phí cố định (%)</Label>
                  <Input type="number" step="0.1" disabled={!isFixedFeeEnabled} value={selectedData.fixedFeePercent} onChange={(e) => updateField('fixedFeePercent', e.target.value === '' ? '' : Number(e.target.value))} />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <input type="checkbox" checked={isPaymentFeeEnabled} onChange={(e) => updateField('isPaymentFeeEnabled', e.target.checked)} className="w-4 h-4 rounded border-slate-300" />
                <div className="flex-1 space-y-1">
                  <Label>Phí thanh toán (%)</Label>
                  <Input type="number" step="0.1" disabled={!isPaymentFeeEnabled} value={selectedData.paymentFeePercent} onChange={(e) => updateField('paymentFeePercent', e.target.value === '' ? '' : Number(e.target.value))} />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <input type="checkbox" checked={isServiceFeeEnabled} onChange={(e) => updateField('isServiceFeeEnabled', e.target.checked)} className="w-4 h-4 rounded border-slate-300" />
                <div className="flex-1 space-y-1">
                  <Label>Phí dịch vụ (Freeship/Hoàn xu) (%)</Label>
                  <Input type="number" step="0.1" disabled={!isServiceFeeEnabled} value={selectedData.serviceFeePercent} onChange={(e) => updateField('serviceFeePercent', e.target.value === '' ? '' : Number(e.target.value))} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3. Quảng cáo */}
          <Card>
            <CardHeader className="pb-3 border-b dark:border-slate-800">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-purple-500" />
                  Quảng cáo
                </CardTitle>
                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                  <button
                    className={cn("px-3 py-1 text-xs font-medium rounded-md transition-colors", adsMode === 'percent' ? "bg-white dark:bg-slate-900 shadow-sm text-purple-700 dark:text-purple-400" : "text-slate-500")}
                    onClick={() => updateField('adsMode', 'percent')}
                  >
                    Theo %
                  </button>
                  <button
                    className={cn("px-3 py-1 text-xs font-medium rounded-md transition-colors", adsMode === 'cpc' ? "bg-white dark:bg-slate-900 shadow-sm text-purple-700 dark:text-purple-400" : "text-slate-500")}
                    onClick={() => updateField('adsMode', 'cpc')}
                  >
                    Theo CPC
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {adsMode === 'percent' ? (
                <div className="space-y-2">
                  <Label>% Ads trên doanh thu</Label>
                  <Input type="number" step="0.1" value={selectedData.adsPercent} onChange={(e) => updateField('adsPercent', e.target.value === '' ? '' : Number(e.target.value))} />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>CPC trung bình (VNĐ)</Label>
                    <Input type="number" value={selectedData.adsCpc} onChange={(e) => updateField('adsCpc', e.target.value === '' ? '' : Number(e.target.value))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Tỷ lệ chuyển đổi (%)</Label>
                    <Input type="number" step="0.1" value={selectedData.adsConversionRate} onChange={(e) => updateField('adsConversionRate', e.target.value === '' ? '' : Number(e.target.value))} />
                  </div>
                </div>
              )}
              <div className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                % Ads thực tế ước tính: <span className="font-semibold text-purple-600 dark:text-purple-400">{actualAdsPercent.toFixed(2)}%</span>
              </div>
            </CardContent>
          </Card>

          {/* 4. Vận chuyển & Hoàn hàng */}
          <Card>
            <CardHeader className="pb-3 border-b dark:border-slate-800">
              <CardTitle className="text-lg flex items-center gap-2">
                <Truck className="w-5 h-5 text-teal-500" />
                Vận chuyển & Hoàn hàng
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Tỷ lệ hoàn hàng (%)</Label>
                <Input type="number" step="0.1" value={selectedData.returnRate} onChange={(e) => updateField('returnRate', e.target.value === '' ? '' : Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>Phí mất khi hoàn (VNĐ)</Label>
                <Input type="number" value={selectedData.returnCostPerOrder} onChange={(e) => updateField('returnCostPerOrder', e.target.value === '' ? '' : Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>Ship vượt khung (VNĐ)</Label>
                <Input type="number" value={selectedData.extraShippingCost} onChange={(e) => updateField('extraShippingCost', e.target.value === '' ? '' : Number(e.target.value))} />
              </div>
            </CardContent>
          </Card>

          {/* 5. Mục tiêu lợi nhuận */}
          <Card>
            <CardHeader className="pb-3 border-b dark:border-slate-800">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="w-5 h-5 text-rose-500" />
                  Mục tiêu lợi nhuận
                </CardTitle>
                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                  <button
                    className={cn("px-3 py-1 text-xs font-medium rounded-md transition-colors", targetMode === 'percent' ? "bg-white dark:bg-slate-900 shadow-sm text-rose-700 dark:text-rose-400" : "text-slate-500")}
                    onClick={() => updateField('targetMode', 'percent')}
                  >
                    Theo %
                  </button>
                  <button
                    className={cn("px-3 py-1 text-xs font-medium rounded-md transition-colors", targetMode === 'fixed' ? "bg-white dark:bg-slate-900 shadow-sm text-rose-700 dark:text-rose-400" : "text-slate-500")}
                    onClick={() => updateField('targetMode', 'fixed')}
                  >
                    Cố định
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {targetMode === 'percent' ? (
                <div className="space-y-2">
                  <Label>% Lợi nhuận mong muốn</Label>
                  <Input type="number" step="0.1" value={selectedData.targetMarginPercent} onChange={(e) => updateField('targetMarginPercent', e.target.value === '' ? '' : Number(e.target.value))} />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Lợi nhuận cố định / đơn (VNĐ)</Label>
                  <Input type="number" value={selectedData.targetProfitFixed} onChange={(e) => updateField('targetProfitFixed', e.target.value === '' ? '' : Number(e.target.value))} />
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Right Column: Advanced Analysis Results */}
        <div className="lg:col-span-5 space-y-6">
          
          <Card className="bg-slate-900 text-white border-slate-800 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <TrendingUp className="w-32 h-32" />
            </div>
            <CardHeader className="pb-2 relative z-10">
              <CardTitle className="text-slate-300 font-medium text-sm uppercase tracking-wider">
                {expectedPrice > 0 ? 'Kết quả với Giá Dự Kiến' : 'Giá Bán Đề Xuất Tối Thiểu'}
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 space-y-6">
              <div>
                <div className="text-4xl md:text-5xl font-bold font-mono text-emerald-400">
                  {formatCurrency(Math.ceil(analysisPrice))}
                </div>
                {expectedPrice > 0 && expectedPrice < minPrice && (
                  <div className="mt-2 flex items-center gap-1 text-red-400 text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    Thấp hơn giá tối thiểu ({formatCurrency(Math.ceil(minPrice))})
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                <div>
                  <div className="text-slate-400 text-sm mb-1">Lợi nhuận / đơn</div>
                  <div className={cn("text-2xl font-bold font-mono", netProfit > 0 ? "text-emerald-400" : "text-red-400")}>
                    {formatCurrency(netProfit)}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 text-sm mb-1">Biên lợi nhuận</div>
                  <div className={cn("text-2xl font-bold font-mono", actualMargin > 0 ? "text-emerald-400" : "text-red-400")}>
                    {actualMargin.toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 text-sm mb-1">ROI (Tỷ suất LN)</div>
                  <div className={cn("text-2xl font-bold font-mono", roi > 0 ? "text-emerald-400" : "text-red-400")}>
                    {roi.toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 text-sm mb-1">Điểm hòa vốn Ads</div>
                  <div className="text-2xl font-bold font-mono text-blue-400">
                    {breakEvenAdsPercent.toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Status Bar */}
              <div className={cn(
                "p-3 rounded-lg flex items-center gap-2 font-medium",
                netProfit <= 0 ? "bg-red-500/20 text-red-300" : 
                actualMargin < 10 ? "bg-yellow-500/20 text-yellow-300" : 
                "bg-emerald-500/20 text-emerald-300"
              )}>
                {netProfit <= 0 ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                {netProfit <= 0 ? "ĐANG LỖ - Cần điều chỉnh giá hoặc chi phí!" : 
                 actualMargin < 10 ? "BIÊN MỎNG - Rủi ro cao khi chạy Ads mạnh" : 
                 "LỢI NHUẬN TỐT - Sẵn sàng scale!"}
              </div>
            </CardContent>
          </Card>

          {/* Chi tiết chi phí */}
          <Card>
            <CardHeader className="pb-3 border-b dark:border-slate-800">
              <CardTitle className="text-base">Phân tích chi phí chi tiết</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Tổng vốn (SP + Đóng gói + Khác)</span>
                <span className="font-mono font-medium">{formatCurrency(totalProductCost)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Khấu hao hoàn hàng / đơn</span>
                <span className="font-mono font-medium text-orange-500">{formatCurrency(returnLossPerSuccessOrder)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Phí Shopee ({totalShopeeFeePercent}%)</span>
                <span className="font-mono font-medium text-red-500">-{formatCurrency(shopeeFeeAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Chi phí Ads ({actualAdsPercent.toFixed(1)}%)</span>
                <span className="font-mono font-medium text-red-500">-{formatCurrency(adsCostAmount)}</span>
              </div>
              <div className="pt-2 border-t dark:border-slate-800 flex justify-between font-medium">
                <span>Tổng chi phí / đơn</span>
                <span className="font-mono">{formatCurrency(totalCostBeforeFees + shopeeFeeAmount + adsCostAmount)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Lợi nhuận khi scale */}
          <Card>
            <CardHeader className="pb-3 border-b dark:border-slate-800">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                Dự phóng lợi nhuận khi Scale
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {[100, 500, 1000].map(orders => (
                <div key={orders} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-12 text-center font-bold text-slate-700 dark:text-slate-300">{orders}</div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider">Đơn</div>
                  </div>
                  <div className={cn("font-mono font-bold text-lg", netProfit > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400")}>
                    {formatCurrency(netProfit * orders)}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Chiến lược giá */}
          <Card>
            <CardHeader className="pb-3 border-b dark:border-slate-800">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-500" />
                Phân tích Chiến lược (What-if)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {/* Giảm giá 5% */}
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border dark:border-slate-800">
                <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Nếu giảm giá bán 5%:</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-slate-500">Giá mới</div>
                    <div className="font-mono font-medium">{formatCurrency(analysisPrice * 0.95)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Lợi nhuận mới</div>
                    <div className={cn("font-mono font-medium", (netProfit - analysisPrice * 0.05) > 0 ? "text-emerald-500" : "text-red-500")}>
                      {formatCurrency(netProfit - analysisPrice * 0.05 * (1 - totalShopeeFeePercent/100 - (adsMode === 'percent' ? actualAdsPercent/100 : 0)))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tăng Ads 20% */}
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border dark:border-slate-800">
                <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Nếu chi phí Ads tăng 20%:</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-slate-500">Chi phí Ads mới</div>
                    <div className="font-mono font-medium text-red-500">{formatCurrency(adsCostAmount * 1.2)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">ROI mới</div>
                    <div className={cn("font-mono font-medium", (netProfit - adsCostAmount * 0.2) > 0 ? "text-emerald-500" : "text-red-500")}>
                      {totalCostBeforeFees > 0 ? (((netProfit - adsCostAmount * 0.2) / totalCostBeforeFees) * 100).toFixed(1) : 0}%
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
