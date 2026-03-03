import { useState, useEffect } from 'react';

export type Size = string;

export interface SizeData {
  importCost: number | '';
  sellingPrice: number | '';
  
  packagingCost?: number | '';
  otherCost?: number | '';
  expectedPrice?: number | '';
  
  isFixedFeeEnabled?: boolean;
  fixedFeePercent?: number | '';
  isPaymentFeeEnabled?: boolean;
  paymentFeePercent?: number | '';
  isServiceFeeEnabled?: boolean;
  serviceFeePercent?: number | '';
  
  adsMode?: 'percent' | 'cpc';
  adsPercent?: number | '';
  adsCpc?: number | '';
  adsConversionRate?: number | '';
  
  returnRate?: number | '';
  returnCostPerOrder?: number | '';
  extraShippingCost?: number | '';
  
  targetMode?: 'percent' | 'fixed';
  targetMarginPercent?: number | '';
  targetProfitFixed?: number | '';
}

export interface AppState {
  language: 'en' | 'vi';
  sizes: Record<Size, SizeData>;
  selectedSize: Size;
  shopeeCommissionPercent: number | '';
  paymentFeePercent: number | '';
  fixedFee: number | '';
  adsCostPerOrder: number | '';
  shippingCost: number | '';
  
  roasRevenue: number | '';
  roasAdsSpend: number | '';

  fsOriginalPrice: number | '';
  fsDiscountPercent: number | '';
  fsShopeeSupportPercent: number | '';
  fsSellerSupportPercent: number | '';

  targetProfitVnd: number | '';
  targetMarginPercent: number | '';
  priceCalcMode: 'profit' | 'margin';
}

const DEFAULT_STATE: AppState = {
  language: 'vi',
  sizes: {},
  selectedSize: '',
  shopeeCommissionPercent: '',
  paymentFeePercent: '',
  fixedFee: '',
  adsCostPerOrder: '',
  shippingCost: '',
  
  roasRevenue: '',
  roasAdsSpend: '',

  fsOriginalPrice: '',
  fsDiscountPercent: '',
  fsShopeeSupportPercent: '',
  fsSellerSupportPercent: '',

  targetProfitVnd: '',
  targetMarginPercent: '',
  priceCalcMode: 'profit',
};

export function useAppStore() {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('shopee-profit-master-state-v3');
    if (saved) {
      try {
        return { ...DEFAULT_STATE, ...JSON.parse(saved) };
      } catch (e) {
        return DEFAULT_STATE;
      }
    }
    return DEFAULT_STATE;
  });

  useEffect(() => {
    localStorage.setItem('shopee-profit-master-state-v3', JSON.stringify(state));
  }, [state]);

  const updateState = (updates: Partial<AppState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const updateSizeData = (size: Size, data: Partial<SizeData>) => {
    setState((prev) => ({
      ...prev,
      sizes: {
        ...prev.sizes,
        [size]: { ...prev.sizes[size], ...data },
      },
    }));
  };

  const addSize = (size: string) => {
    if (!size || state.sizes[size]) return;
    setState((prev) => ({
      ...prev,
      sizes: { 
        ...prev.sizes, 
        [size]: { 
          importCost: '', 
          sellingPrice: '',
          packagingCost: '',
          otherCost: '',
          expectedPrice: '',
          isFixedFeeEnabled: true,
          fixedFeePercent: 4,
          isPaymentFeeEnabled: true,
          paymentFeePercent: 4,
          isServiceFeeEnabled: false,
          serviceFeePercent: 5,
          adsMode: 'percent',
          adsPercent: 10,
          adsCpc: 1000,
          adsConversionRate: 2,
          returnRate: 5,
          returnCostPerOrder: 30000,
          extraShippingCost: 0,
          targetMode: 'percent',
          targetMarginPercent: 20,
          targetProfitFixed: 50000,
        } 
      },
      selectedSize: prev.selectedSize === '' ? size : prev.selectedSize,
    }));
  };

  const removeSize = (size: string) => {
    setState((prev) => {
      const newSizes = { ...prev.sizes };
      delete newSizes[size];
      const remainingSizes = Object.keys(newSizes);
      return {
        ...prev,
        sizes: newSizes,
        selectedSize: prev.selectedSize === size ? (remainingSizes[0] || '') : prev.selectedSize,
      };
    });
  };

  const resetState = () => setState(DEFAULT_STATE);

  return { state, updateState, updateSizeData, resetState, addSize, removeSize };
}
