import React, { useRef } from 'react';
import { PricingAnalyzer } from './PricingAnalyzer';
import { ROASCalculator } from './ROASCalculator';
import { FlashSaleSimulator } from './FlashSaleSimulator';
import { Button } from './ui/Button';
import { Download, Moon, Sun, RefreshCw, FileSpreadsheet } from 'lucide-react';
import { useAppStore } from '@/src/store/useStore';
import { translations } from '@/src/locales/translations';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export function Dashboard() {
  const [isDarkMode, setIsDarkMode] = React.useState(() => {
    return document.documentElement.classList.contains('dark');
  });
  const { state, updateState, resetState } = useAppStore();
  const dashboardRef = useRef<HTMLDivElement>(null);
  const t = translations[state.language];

  const toggleDarkMode = () => {
    const isDark = document.documentElement.classList.toggle('dark');
    setIsDarkMode(isDark);
  };

  const exportToPDF = async () => {
    if (!dashboardRef.current) return;
    
    try {
      const canvas = await html2canvas(dashboardRef.current, {
        scale: 2,
        backgroundColor: isDarkMode ? '#020617' : '#ffffff',
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('shopee-profit-master.pdf');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF. Please try again.');
    }
  };

  const exportToCSV = () => {
    const sizes = Object.keys(state.sizes);
    if (sizes.length === 0) {
      alert('Không có dữ liệu để xuất.');
      return;
    }

    const headers = [
      'Tên SP/Kích thước',
      'Giá nhập',
      'Phí đóng gói',
      'Phí khác',
      'Giá bán dự kiến',
      'Phí Shopee (%)',
      'Chi phí Ads (%)',
      'Tỷ lệ hoàn (%)',
      'Phí hoàn/đơn',
      'Lợi nhuận mục tiêu'
    ];

    const rows = sizes.map(size => {
      const data = state.sizes[size];
      return [
        size,
        data.importCost || 0,
        data.packagingCost || 0,
        data.otherCost || 0,
        data.expectedPrice || 0,
        (data.isFixedFeeEnabled ? (Number(data.fixedFeePercent) || 0) : 0) + 
        (data.isPaymentFeeEnabled ? (Number(data.paymentFeePercent) || 0) : 0) + 
        (data.isServiceFeeEnabled ? (Number(data.serviceFeePercent) || 0) : 0),
        data.adsMode === 'percent' ? (data.adsPercent || 0) : 'Tính theo CPC',
        data.returnRate || 0,
        data.returnCostPerOrder || 0,
        data.targetMode === 'percent' ? `${data.targetMarginPercent || 0}%` : `${data.targetProfitFixed || 0} VNĐ`
      ].join(',');
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "shopee-profit-data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 p-4 md:p-8 font-sans transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-blue-950 dark:text-blue-400">
              {t.appTitle}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              {t.appSubtitle}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => updateState({ language: state.language === 'en' ? 'vi' : 'en' })} className="gap-2 font-semibold">
              {state.language === 'en' ? '🇻🇳 VI' : '🇬🇧 EN'}
            </Button>
            <Button variant="outline" size="sm" onClick={resetState} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              {t.reset}
            </Button>
            <Button variant="outline" size="sm" onClick={exportToCSV} className="gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={exportToPDF} className="gap-2">
              <Download className="w-4 h-4" />
              PDF
            </Button>
            <Button variant="outline" size="icon" onClick={toggleDarkMode}>
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <div ref={dashboardRef} className="space-y-8">
          <PricingAnalyzer />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-8">
              <ROASCalculator />
            </div>
            <div className="space-y-8">
              <FlashSaleSimulator />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
