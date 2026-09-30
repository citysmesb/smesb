"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const slides = [
  "/smesb/shafal/images/Remittance-Loan-Brochure.jpeg",
  "/smesb/shafal/images/Image-100.jpg",
  "/smesb/shafal/images/Image-103.jpg",
  "/smesb/shafal/images/Image-107.jpg"
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  useEffect(() => {
    if (localStorage.getItem("shafal_logged_in")) {
      window.location.href = "/smesb/shafal/";
    } else {
      setIsAuthChecking(false);
    }
  }, []);


  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 800)); localStorage.setItem("shafal_logged_in", "true"); router.push("/");
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 400)); 
    localStorage.setItem("shafal_logged_in", "guest"); 
    router.push("/");
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  return (
    <div className="h-screen w-full overflow-hidden flex bg-slate-50 font-sans text-slate-900">
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes panImage {
          0% { transform: scale(1) translate(0, 0); }
          50% { transform: scale(1.08) translate(-1%, -1%); }
          100% { transform: scale(1) translate(0, 0); }
        }
        .animate-pan-image {
          animation: panImage 25s ease-in-out infinite;
        }
      `}} />

      {/* LEFT PANE: Premium Photographic Branding (SLIDESHOW) */}
      <div className="hidden lg:flex lg:w-[55%] relative h-full bg-slate-950 overflow-hidden">
        
        <div className="absolute inset-0 z-0">
            {slides.map((src, idx) => (
                <div 
                    key={src}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                >
                    <img 
                        src={src} 
                        alt="Shafal Project Background" 
                        className="w-full h-full object-cover animate-pan-image"
                        loading={idx === 0 ? "eager" : "lazy"}
                        fetchPriority={idx === 0 ? "high" : "auto"}
                    />
                </div>
            ))}
        </div>
        
        {/* Subtle, highly professional gradient overlays for perfect text contrast without ruining the image */}
        <div className="absolute inset-0 bg-slate-900/40 z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent z-10"></div>
        
        <div className="relative z-20 flex flex-col justify-end pb-24 px-16 xl:px-24 w-full h-full">
            <div className="w-12 h-1.5 bg-blue-600 mb-8"></div>
            <h1 className="text-5xl xl:text-7xl font-black text-white tracking-tight leading-tight mb-6">
                Shafal
            </h1>
            <p className="text-slate-200 text-lg xl:text-xl font-medium max-w-2xl leading-relaxed border-l-2 border-blue-500/50 pl-5">
                Beneficiary Management & Indicator Tracking Portal
            </p>
        </div>
      </div>

      {/* RIGHT PANE: Robust Enterprise Shell */}
      <div className="w-full lg:w-[45%] h-full flex flex-col bg-slate-50 relative overflow-hidden">
        
        {/* Scrollable Form Container */}
        <div className="flex-1 overflow-hidden flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-6">
            
            <div className="w-full max-w-[440px] mx-auto">
                
                {/* Clean, integrated logos layout (Increased Sizes) */}
                <div className="flex items-center justify-between gap-4 mb-8 h-12 sm:h-14">
                    <img src="/smesb/shafal/images/City-Bank-Logo.png" alt="City Bank" className="h-full object-contain object-left" />
                    <div className="w-px h-8 bg-slate-300 shrink-0 self-center"></div>
                    <img src="/smesb/shafal/images/Swiss-Embassy-Logo.png" alt="Swiss Embassy" className="h-full object-contain" />
                    <div className="w-px h-8 bg-slate-300 shrink-0 self-center"></div>
                    <img src="/smesb/shafal/images/uncdf-logo.png" alt="UNCDF" className="h-full object-contain object-right scale-105" />
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                    
                    <div className="p-6 sm:p-8 flex-1">
                        <div className="mb-6">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-1">Welcome Back</h2>
                            <p className="text-sm text-slate-500 font-medium">Please sign in to access your portal</p>
                        </div>

                        <form className="space-y-4" onSubmit={handleSubmit}>
                            {error && (
                                <div className="text-red-600 text-sm font-semibold bg-red-50 p-3 rounded-xl border border-red-100 flex items-start">
                                    <svg className="w-5 h-5 mr-2 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    {error}
                                </div>
                            )}
                            
                            <div className="space-y-1">
                                <label className="block text-[13px] font-bold text-slate-700">Email address</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="appearance-none block w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    placeholder="xyz@shafal.org"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="block text-[13px] font-bold text-slate-700">Password</label>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none block w-full px-4 py-3 bg-white border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    placeholder="••••••••"
                                />
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex justify-center items-center py-3.5 px-4 rounded-lg shadow-sm text-[15px] font-bold text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Authenticating...' : 'Sign In'}
                                </button>
                            </div>
                        </form>
                    </div>
                    
                    <div className="bg-slate-50 px-8 py-6 border-t border-slate-200">
                        <div className="text-center space-y-4">
                            <p className="text-[13px] text-slate-500 font-medium">Just exploring the dashboard?</p>
                            <button
                                type="button"
                                onClick={handleGuestLogin}
                                disabled={loading}
                                className="w-full flex justify-center items-center py-3 px-4 rounded-lg border-2 border-slate-200 bg-white shadow-sm text-[14px] font-bold text-slate-700 hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group"
                            >
                                <svg className="w-5 h-5 mr-2 text-slate-400 group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                View as a Guest
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

