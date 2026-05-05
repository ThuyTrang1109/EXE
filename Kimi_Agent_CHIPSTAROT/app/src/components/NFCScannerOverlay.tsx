import { useState, useEffect } from 'react';
import { validateAndActivateNFCChip } from '@/lib/supabase';

interface NFCScannerOverlayProps {
  onSuccess: (credits: number, nfcTagId?: string) => void;
  onClose: () => void;
  userId?: string; // [FIX #2] Cần userId để validate chip
}

export default function NFCScannerOverlay({ onSuccess, onClose, userId }: NFCScannerOverlayProps) {
  const [status, setStatus] = useState<'idle' | 'scanning' | 'validating' | 'success' | 'error'>('scanning');
  const [errorMsg, setErrorMsg] = useState('');

  // [FIX #2] Hàm xử lý sau khi đọc được Tag ID — validate trước khi cộng credits
  const handleTagDetected = async (tagId: string) => {
    setStatus('validating');

    const { valid, creditsBonus, error } = await validateAndActivateNFCChip(
      userId || 'demo',
      tagId
    );

    if (!valid) {
      setStatus('error');
      setErrorMsg(error || 'Chip NFC không hợp lệ.');
      return;
    }

    setStatus('success');
    setTimeout(() => onSuccess(creditsBonus, tagId), 1500);
  };

  useEffect(() => {
    let isMounted = true;

    // 1. Real Web NFC Integration (Chrome Android only)
    const startRealScan = async () => {
      try {
        if ('NDEFReader' in window) {
          const ndef = new (window as any).NDEFReader();
          await ndef.scan();
          ndef.onreading = (event: any) => {
            if (!isMounted || status === 'success' || status === 'validating') return;
            const detectedTagId = event.serialNumber as string | undefined;
            console.log('NFC Tag detected!', detectedTagId);
            if (detectedTagId) handleTagDetected(detectedTagId);
          };
        }
      } catch (error) {
        console.warn('Web NFC not supported or permission denied', error);
      }
    };

    startRealScan();

    // [FIX #4] Chỉ chạy Simulation trong môi trường DEV — Tắt hoàn toàn trong Production
    // Điều này ngăn việc người dùng nhận lượt miễn phí đơn giản bằng cách vào URL có ?tagId=
    let timer: ReturnType<typeof setTimeout> | null = null;
    if (import.meta.env.DEV) {
      timer = setTimeout(() => {
        if (!isMounted || status === 'success' || status === 'validating') return;
        const simTagId = `SIM-${Date.now().toString(36).toUpperCase()}`;
        handleTagDetected(simTagId);
      }, 3500);
    }

    return () => {
      isMounted = false;
      if (timer) clearTimeout(timer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-purple-900/40 backdrop-blur-md" onClick={status === 'scanning' ? onClose : undefined} />

      {/* Modal */}
      <div className="relative bg-white rounded-[40px] p-8 max-w-sm w-full shadow-2xl overflow-hidden border border-white/50 text-center">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 via-orange-500 to-purple-600" />
        
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="mb-8 mt-4 relative flex justify-center">
          {/* Pulsing rings */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`w-32 h-32 bg-purple-100 rounded-full animate-ping opacity-20 ${status !== 'scanning' ? 'hidden' : ''}`} />
            <div className={`w-48 h-48 bg-purple-200 rounded-full animate-ping opacity-10 delay-300 ${status !== 'scanning' ? 'hidden' : ''}`} />
          </div>

          {/* Animation container */}
          <div className="w-48 h-48 bg-gradient-to-br from-yellow-50 to-purple-50 rounded-full flex items-center justify-center border border-purple-100 shadow-inner relative z-10">
            {status === 'scanning' && (
              <div className="relative">
                <div className="text-6xl animate-bounce">📱</div>
                <div className="absolute -right-4 -top-4 text-4xl animate-pulse">🐣</div>
                <div className="absolute inset-0 border-4 border-dashed border-purple-200 rounded-full animate-[spin_10s_linear_infinite]" />
              </div>
            )}
            {status === 'validating' && (
              <div className="text-5xl animate-spin">⌛</div>
            )}
            {status === 'success' && (
              <div className="text-6xl animate-[scale_0.5s_ease-out]">✅</div>
            )}
            {status === 'error' && (
              <div className="text-6xl">❌</div>
            )}
          </div>
        </div>

        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          {status === 'scanning' && 'Đang chờ chạm...'}
          {status === 'validating' && 'Đang xác thực chip...'}
          {status === 'success' && 'Thành công!'}
          {status === 'error' && 'Không thể kích hoạt'}
        </h3>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed px-4">
          {status === 'scanning' && 'Vui lòng đưa móc khóa CHIPSTAROT lại gần vùng cảm biến NFC phía sau điện thoại của bạn.'}
          {status === 'validating' && 'Đang kiểm tra tính hợp lệ của chip NFC...'}
          {status === 'success' && 'Đã nhận diện Thẻ NFC thành công! Bạn được tặng lượt bốc bài trong 6 tháng miễn phí. Chúc mừng! 🎉'}
          {status === 'error' && <span className="text-red-500 font-semibold">{errorMsg}</span>}
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
        {status === 'error' && (
          <button onClick={onClose} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-6 py-2 rounded-xl text-sm transition-all">
            Đóng
          </button>
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
