import { useState, useEffect } from 'react';

interface NFCScannerOverlayProps {
  onSuccess: (credits: number, nfcTagId?: string) => void;
  onClose: () => void;
}

export default function NFCScannerOverlay({ onSuccess, onClose }: NFCScannerOverlayProps) {
  const [status, setStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('scanning');

  useEffect(() => {
    let detectedTagId: string | undefined;

    // 1. Real Web NFC Integration (Chrome Android only)
    const startRealScan = async () => {
      try {
        if ('NDEFReader' in window) {
          const ndef = new (window as any).NDEFReader();
          await ndef.scan();
          ndef.onreading = (event: any) => {
            detectedTagId = event.serialNumber as string | undefined;
            console.log('NFC Tag detected!', detectedTagId);
            setStatus('success');
            setTimeout(() => onSuccess(10, detectedTagId), 1500);
          };
        }
      } catch (error) {
        console.warn('Web NFC not supported or permission denied', error);
      }
    };

    startRealScan();

    // 2. Simulation fallback for unsupported devices / desktop
    const timer = setTimeout(() => {
      if (status !== 'success') {
        // Generate a pseudo-unique tag ID for demo tracking
        const simTagId = `SIM-${Date.now().toString(36).toUpperCase()}`;
        setStatus('success');
        setTimeout(() => onSuccess(10, simTagId), 1500);
      }
    }, 3500);

    return () => {
      clearTimeout(timer);
    };
  }, [onSuccess, status]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-purple-900/40 backdrop-blur-md" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-[40px] p-8 max-w-sm w-full shadow-2xl overflow-hidden border border-white/50 text-center">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 via-orange-500 to-purple-600" />
        
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="mb-8 mt-4 relative flex justify-center">
          {/* Pulsing rings */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`w-32 h-32 bg-purple-100 rounded-full animate-ping opacity-20 ${status === 'success' ? 'hidden' : ''}`} />
            <div className={`w-48 h-48 bg-purple-200 rounded-full animate-ping opacity-10 delay-300 ${status === 'success' ? 'hidden' : ''}`} />
          </div>

          {/* Animation container */}
          <div className="w-48 h-48 bg-gradient-to-br from-yellow-50 to-purple-50 rounded-full flex items-center justify-center border border-purple-100 shadow-inner relative z-10">
            {status === 'scanning' ? (
              <div className="relative">
                <div className="text-6xl animate-bounce">📱</div>
                <div className="absolute -right-4 -top-4 text-4xl animate-pulse">🐣</div>
                <div className="absolute inset-0 border-4 border-dashed border-purple-200 rounded-full animate-[spin_10s_linear_infinite]" />
              </div>
            ) : (
              <div className="text-6xl animate-[scale_0.5s_ease-out]">✅</div>
            )}
          </div>
        </div>

        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          {status === 'scanning' ? 'Đang chờ chạm...' : 'Thành công!'}
        </h3>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed px-4">
          {status === 'scanning' 
            ? 'Vui lòng đưa móc khóa CHIPSTAROT lại gần vùng cảm biến NFC phía sau điện thoại của bạn.' 
            : 'Đã nhận diện Thẻ NFC thành công! Bạn được tặng 3 lượt/ngày trong 6 tháng miễn phí. Chúc mừng! 🎉'}
        </p>

        {status === 'scanning' && (
          <div className="flex flex-col gap-3">
             <div className="flex items-center justify-center gap-2 text-xs font-bold text-purple-600 bg-purple-50 py-2 rounded-xl">
               <span className="relative flex h-2 w-2">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
               </span>
               SẴN SÀNG QUÉT
             </div>
             <button onClick={onClose} className="text-gray-400 text-xs font-medium hover:underline">Hủy bỏ</button>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scale {
          0% { transform: scale(0); }
          80% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
      `}} />
    </div>
  );
}
