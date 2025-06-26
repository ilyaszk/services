import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black text-gray-900 dark:text-white">
      <div className="relative py-20 md:py-32 flex-grow flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden z-0">
          <div className="absolute -top-[20%] -left-[15%] w-[50%] h-[80%] rounded-full bg-[#1e40af]/10 dark:bg-[#1e40af]/20 blur-[120px]"></div>
          <div className="absolute top-[10%] -right-[15%] w-[50%] h-[70%] rounded-full bg-[#8b5cf6]/10 dark:bg-[#8b5cf6]/20 blur-[120px]"></div>
        </div>
        <div className="relative z-10">
          <Loader2 className="h-16 w-16 animate-spin text-[#0ea5e9]" />
        </div>
      </div>
    </div>
  );
}
