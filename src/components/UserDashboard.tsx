import React, { useState, useEffect } from "react";
import { 
  Sparkles, ShieldCheck, ShieldAlert, Award, Copy, CheckCircle2, User, Banknote, 
  CreditCard, RefreshCw, Send, ArrowUpRight, TrendingUp, Bell, Smartphone, Star, FileText, Download, QrCode,
  Camera, Fingerprint, Check
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { NIGERIAN_BANKS } from "../data";
import { User as UserType, Payment, Withdrawal, AppNotification } from "../types";

interface UserDashboardProps {
  currentUser: UserType;
  onUpdateUser: (updatedUser: UserType) => void;
  payments: Payment[];
  onAddPayment: (payment: Payment) => void;
  withdrawals: Withdrawal[];
  onAddWithdrawal: (withdrawal: Withdrawal) => void;
  notifications: AppNotification[];
  onMarkNotificationRead: (notifId: string) => void;
  onNavigate: (view: string) => void;
}

export default function UserDashboard({
  currentUser,
  onUpdateUser,
  payments,
  onAddPayment,
  withdrawals,
  onAddWithdrawal,
  notifications,
  onMarkNotificationRead,
  onNavigate
}: UserDashboardProps) {
  
  // Dashboard states
  const [activeTab, setActiveTab] = useState<"overview" | "payment" | "withdrawal" | "referrals" | "history">("overview");
  const [copiedCode, setCopiedCode] = useState(false);
  const [cardDownloading, setCardDownloading] = useState(false);
  const [notifBellOpen, setNotifBellOpen] = useState(false);

  // Checkout gateway states
  const [paymentMethod, setPaymentMethod] = useState<"card" | "bank_transfer" | "ussd" | "wallet">("card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [ussdBank, setUssdBank] = useState("");
  const [mobileWalletNumber, setMobileWalletNumber] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [latestPaymentRef, setLatestPaymentRef] = useState("");
  const [latestPaymentTime, setLatestPaymentTime] = useState("");

  // Withdrawal States
  const [wtBank, setWtBank] = useState("");
  const [wtAccountNumber, setWtAccountNumber] = useState("");
  const [wtAccountName, setWtAccountName] = useState("");
  const [resolvingAccount, setResolvingAccount] = useState(false);
  const [resolvedName, setResolvedName] = useState<string | null>(null);
  const [withdrawalLoading, setWithdrawalLoading] = useState(false);
  const [withdrawalError, setWithdrawalError] = useState<string | null>(null);
  const [withdrawalSuccess, setWithdrawalSuccess] = useState(false);

  // NIN & Face Verification States
  const [ninInput, setNinInput] = useState("");
  const [ninLoading, setNinLoading] = useState(false);
  const [ninVerificationError, setNinVerificationError] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [faceScanning, setFaceScanning] = useState(false);
  const [faceScanSuccess, setFaceScanSuccess] = useState(false);
  const [faceVerificationError, setFaceVerificationError] = useState<string | null>(null);
  const [biometricScore, setBiometricScore] = useState<number | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  // Copy referral code to clipboard
  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentUser.referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // NIN Verification lookup simulation
  const handleVerifyNin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNin = ninInput.replace(/\s/g, "");
    if (cleanNin.length !== 11 || isNaN(Number(cleanNin))) {
      setNinVerificationError("NIMC verification expects an exact 11-digit numeric National Identification Number.");
      return;
    }

    setNinLoading(true);
    setNinVerificationError(null);

    setTimeout(() => {
      setNinLoading(false);
      // Saved NIN to user, prompting them to proceed onto live biometrics
      const updatedUser: UserType = {
        ...currentUser,
        nin: cleanNin,
        ninVerified: false // Needs face matching match to confirm authenticity
      };
      onUpdateUser(updatedUser);
    }, 1800);
  };

  // Start Camera media source for Biometric face validation
  const startCamera = async () => {
    setFaceVerificationError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraStream(stream);
      setCameraActive(true);
    } catch (err) {
      console.warn("Device webcam disabled or context sandboxed:", err);
      // Soft-trigger cameraActive for simulated fallback so interface is fully functional
      setCameraActive(true);
    }
  };

  // Stop video media tracks
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setCameraActive(false);
  };

  // Release camera resource when navigating away
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  // Run face structure scanning and points tracker
  const handleStartFaceScan = () => {
    if (faceScanning) return;
    setFaceScanning(true);
    setFaceVerificationError(null);

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      if (currentProgress >= 100) {
        clearInterval(interval);
        setFaceScanning(false);
        setFaceScanSuccess(true);
        const matchIndex = +(95.2 + Math.random() * 4.3).toFixed(2);
        setBiometricScore(matchIndex);

        // Commit verified identity status to user state profile
        const updatedUser: UserType = {
          ...currentUser,
          ninVerified: true,
          faceVerified: true,
          faceVerificationScore: matchIndex,
          faceVerificationImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250&auto=format&fit=crop"
        };
        onUpdateUser(updatedUser);
        stopCamera();
      }
    }, 200);
  };

  // Simulate Flutterwave/Paystack Checkout Payment Gateway
  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentLoading(true);

    setTimeout(() => {
      setPaymentLoading(false);
      setPaymentSuccess(true);

      // Create Payment object
      const paymentRef = `REF_APC_${Math.floor(10000000 + Math.random() * 90000000)}`;
      const formattedTime = new Date().toLocaleString("en-NG", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });

      setLatestPaymentRef(paymentRef);
      setLatestPaymentTime(formattedTime);

      const newPayment: Payment = {
        id: `p-${Date.now()}`,
        userId: currentUser.id,
        userFullName: currentUser.fullName,
        amount: currentUser.membershipFee,
        paymentType: paymentMethod,
        reference: paymentRef,
        status: "completed",
        createdAt: new Date().toISOString()
      };

      // Generate visual unique APC ID
      const newMembershipId = `APC-NG-${Math.floor(100000 + Math.random() * 900000)}`;

      // Update local state database via parameters
      onAddPayment(newPayment);

      const updatedUser: UserType = {
        ...currentUser,
        membershipStatus: "paid",
        membershipId: newMembershipId
      };
      
      onUpdateUser(updatedUser);

      // Trigger automatic welcome notifications for verify
      setTimeout(() => {
        setActiveTab("overview");
        setPaymentSuccess(false);
      }, 5000); // 5 sec to let them audit the print receipt

    }, 2200);
  };

  // Trigger real-time bank resolution hook
  useEffect(() => {
    if (wtAccountNumber.length === 10 && wtBank) {
      setResolvingAccount(true);
      setResolvedName(null);
      
      const timer = setTimeout(() => {
        setResolvingAccount(false);
        // Resolve to user's registered name to match standard Nigeria NIBSS instant payment validation
        setResolvedName(currentUser.fullName.toUpperCase());
        setWtAccountName(currentUser.fullName);
      }, 1500);

      return () => clearTimeout(timer);
    } else {
      setResolvedName(null);
      setWtAccountName("");
    }
  }, [wtAccountNumber, wtBank, currentUser.fullName]);

  // Handle bank payout submission
  const handleWithdrawalRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawalError(null);

    if (currentUser.membershipStatus !== "paid") {
      setWithdrawalError("Access Denied: APC Membership ID Card must be fully paid and verified before withdrawing.");
      return;
    }

    if (!wtBank || wtAccountNumber.length !== 10) {
      setWithdrawalError("Please provide a valid 10-digit Nigerian NUBAN account number and select your commercial Bank.");
      return;
    }

    setWithdrawalLoading(true);

    setTimeout(() => {
      setWithdrawalLoading(false);
      setWithdrawalSuccess(true);

      const newWithdrawal: Withdrawal = {
        id: `w-${Date.now()}`,
        userId: currentUser.id,
        userFullName: currentUser.fullName,
        bankName: wtBank,
        accountNumber: wtAccountNumber,
        accountName: wtAccountName || currentUser.fullName,
        amount: currentUser.grantAmount,
        status: "pending",
        createdAt: new Date().toISOString()
      };

      onAddWithdrawal(newWithdrawal);

      const updatedUser: UserType = {
        ...currentUser,
        withdrawalStatus: "pending",
        bankName: wtBank,
        accountNumber: wtAccountNumber,
        accountName: wtAccountName || currentUser.fullName
      };
      onUpdateUser(updatedUser);

      setTimeout(() => {
        setActiveTab("overview");
        setWithdrawalSuccess(false);
        // Clear forms
        setWtBank("");
        setWtAccountNumber("");
      }, 3500);

    }, 2500);
  };

  // Safe checks for user-specific transactions
  const userWithdrawals = withdrawals.filter(w => w.userId === currentUser.id);
  const userPayments = payments.filter(p => p.userId === currentUser.id);
  const userNotifications = notifications.filter(n => n.userId === "all" || n.userId === currentUser.id);
  const unreadNotifs = userNotifications.filter(n => !n.read);

  return (
    <div className="bg-slate-50 text-slate-800 min-h-[calc(100vh-64px)] font-sans select-none">
      
      {/* Dynamic Subheader - Citizen welcome banner */}
      <div className="bg-white border-b border-slate-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 text-[#008751] font-bold text-sm">
              {currentUser.fullName.split(" ").map(n => n[0]).join("")}
            </div>
            <div className="text-left">
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-extrabold text-slate-900">Welcome, {currentUser.fullName}</h2>
                <span className="flex h-2 w-2 rounded-full bg-[#008751]" />
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                Cohort: {currentUser.age} Yrs • State File: {currentUser.state} State
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Notification system */}
            <div className="relative">
              <button
                onClick={() => setNotifBellOpen(!notifBellOpen)}
                className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 relative"
              >
                <Bell className="w-4.5 h-4.5" />
                {unreadNotifs.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 bg-[#D10000] text-white items-center justify-center text-[9px] rounded-full font-black animate-bounce font-mono">
                    {unreadNotifs.length}
                  </span>
                )}
              </button>

              {/* Notification Center Dropdown */}
              <AnimatePresence>
                {notifBellOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2.5 w-80 bg-white border border-slate-200 rounded-xl shadow-lg p-4 z-50 overflow-hidden text-left"
                  >
                    <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
                      <h4 className="font-bold text-slate-800 text-xs">Citizen Notifications</h4>
                      <span className="text-[9px] uppercase font-mono font-bold bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded">
                        Recent Logs
                      </span>
                    </div>

                    <div className="space-y-2.5 mt-3 max-h-60 overflow-y-auto w-full">
                      {userNotifications.length === 0 ? (
                        <p className="text-[11px] text-slate-400 py-6 text-center">No security logs recorded yet.</p>
                      ) : (
                        userNotifications.map((notif) => (
                          <div 
                            key={notif.id} 
                            onClick={() => {
                              onMarkNotificationRead(notif.id);
                            }}
                            className={`p-2.5 rounded-lg border text-[11px] cursor-pointer transition-colors ${
                              notif.read 
                                ? "bg-slate-50/50 border-slate-150 text-slate-400" 
                                : "bg-white border-[#008751]/20 text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <span className="font-bold text-slate-800 pr-2 leading-tight">{notif.title}</span>
                              {!notif.read && <span className="h-2 w-2 bg-[#008751] rounded-full flex-shrink-0 mt-1" />}
                            </div>
                            <p className="text-slate-500 mt-1 leading-normal text-[10px]">{notif.message}</p>
                            <span className="text-[8px] text-slate-400 font-mono mt-1.5 block">
                              {new Date(notif.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quick action button mapping */}
            <button
              onClick={() => {
                if (currentUser.membershipStatus === "paid") {
                  setActiveTab("withdrawal");
                } else {
                  setActiveTab("payment");
                }
              }}
              className="bg-[#008751] hover:bg-[#007345] text-white font-black px-4.5 py-2 rounded-lg text-xs tracking-wide shadow-sm flex items-center space-x-1"
            >
              <Banknote className="w-3.5 h-3.5" />
              <span>Withdraw Grant</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Vertical Menu / Profile Overview sidebar */}
          <div className="lg:col-span-1 space-y-6 text-left">
            
            {/* Nav Menu */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-1.5">
              {[
                { tab: "overview", label: "Citizen Hub", icon: User },
                { tab: "payment", label: "APC ID Card", icon: CreditCard },
                { tab: "withdrawal", label: "Withdrawal Desk", icon: Banknote },
                { tab: "referrals", label: "Referral Center", icon: TrendingUp },
                { tab: "history", label: "Financial Logs", icon: FileText }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.tab}
                    onClick={() => {
                      setActiveTab(item.tab as any);
                      setWithdrawalError(null);
                    }}
                    className={`w-full flex items-center space-x-3.5 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
                      activeTab === item.tab
                        ? "bg-[#008751] font-black text-white shadow"
                        : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Referral Dashboard Widget */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 text-amber-600">
                <Star className="w-4.5 h-4.5" />
                <h4 className="font-bold text-xs uppercase tracking-wider font-mono">Affiliate Program</h4>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Refer other citizens! Earn a premium <span className="text-[#008751] font-extrabold">₦5,000</span> bonus for every verified citizen registration using your code.
              </p>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 flex items-center justify-between">
                <span className="font-mono text-[#008751] font-bold text-xs tracking-wider">{currentUser.referralCode}</span>
                <button
                  onClick={handleCopyCode}
                  className="p-1 rounded bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 border border-slate-200 transition-colors"
                  title="Copy Code"
                >
                  {copiedCode ? <span className="text-[10px] text-[#008751] font-bold font-mono">Copied</span> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex justify-between items-center text-[10px] border-t border-slate-200 pt-3 text-slate-500 font-mono">
                <span>Successful Referrals:</span>
                <span className="font-bold text-slate-800 text-xs">{currentUser.referralsCount} Citizens</span>
              </div>
            </div>

          </div>

          {/* Right Main Focus Area */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
                         {/* TAB 1: OVERVIEW */}
              {activeTab === "overview" && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6 text-left"
                >
                  
                  {/* Financial Status Banner */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Grant Balance Card */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 relative overflow-hidden shadow-sm">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-[#008751]/5 rounded-bl-full" />
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 font-mono">My Grant Allocation</span>
                        <span className="bg-[#008751]/10 text-[#008751] text-[10px] font-mono px-2 py-0.5 rounded font-black">
                          Approved
                        </span>
                      </div>
                      <div className="mt-4">
                        <p className="text-3xl font-black font-mono tracking-tight text-slate-900 mb-1">
                          ₦{currentUser.grantAmount.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-slate-500 font-sans">calibrated to your {currentUser.age}-year cohort age bracket.</p>
                      </div>
                    </div>

                    {/* Verification Status */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 relative overflow-hidden shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 font-mono">Membership Audit</span>
                        {currentUser.membershipStatus === "paid" ? (
                          <span className="bg-[#008751]/10 text-[#008751] text-[9px] font-mono px-2 py-0.5 rounded border border-[#008751]/20 font-bold uppercase">
                            verified
                          </span>
                        ) : (
                          <span className="bg-amber-50 text-amber-700 text-[9px] font-mono px-2 py-0.5 rounded border border-amber-200 font-bold uppercase animate-pulse">
                            Action Outstanding
                          </span>
                        )}
                      </div>
                      <div className="mt-4">
                        <div className="flex items-center space-x-2">
                          {currentUser.membershipStatus === "paid" ? (
                            <ShieldCheck className="w-7 h-7 text-[#008751]" />
                          ) : (
                            <ShieldAlert className="w-7 h-7 text-amber-600 animate-bounce" />
                          )}
                          <div>
                            <p className="text-sm font-bold text-slate-800">
                              {currentUser.membershipStatus === "paid" ? "Identity Verified" : "Card Activation Pending"}
                            </p>
                            <p className="text-[10px] text-slate-500 font-mono">
                              {currentUser.membershipStatus === "paid" ? `ID: ${currentUser.membershipId}` : `Card Fee: ₦${currentUser.membershipFee.toLocaleString()}`}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Withdrawal status tracker */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 relative overflow-hidden shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 font-mono">Disbursement Flow</span>
                        {currentUser.withdrawalStatus === "pending" && (
                          <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase animate-pulse">
                            Clearing
                          </span>
                        )}
                        {currentUser.withdrawalStatus === "approved" && (
                          <span className="bg-[#008751]/10 text-[#008751] border border-[#008751]/20 text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase">
                            Disbursed
                          </span>
                        )}
                        {currentUser.withdrawalStatus === "not_requested" && (
                          <span className="bg-slate-100 text-slate-600 text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase">
                            Available
                          </span>
                        )}
                      </div>
                      
                      <div className="mt-4 text-xs font-sans">
                        {currentUser.withdrawalStatus === "not_requested" && (
                          <div>
                            <p className="font-bold text-slate-800">Funds Ready for Payout</p>
                            <button
                              onClick={() => {
                                if (currentUser.membershipStatus === "paid") {
                                  setActiveTab("withdrawal");
                                } else {
                                  setActiveTab("payment");
                                }
                              }}
                              className="text-[10px] text-[#008751] hover:text-[#007345] font-bold underline mt-1 block flex items-center space-x-1"
                            >
                              <span>Initiate Bank payout</span>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                        {currentUser.withdrawalStatus === "pending" && (
                          <div>
                            <p className="font-bold text-amber-700">Pending Admin Signature</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">Disbursement typically credits your account within 12-24 hours.</p>
                          </div>
                        )}
                        {currentUser.withdrawalStatus === "approved" && (
                          <div>
                            <p className="font-bold text-[#008751]">Direct credit complete</p>
                            <p className="text-[10px] text-slate-500 mt-0.5 font-mono">{currentUser.bankName} Account: ...{currentUser.accountNumber?.slice(-4)}</p>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* National NIN & Biometric Facial Verification Hub */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/[0.02] rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2.5 bg-[#008751]/10 text-[#008751] rounded-2xl border border-[#008751]/20">
                          <Fingerprint className="w-5 h-5 animate-pulse" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-xs text-slate-900 tracking-tight uppercase">National Biometric Audit Suite</h3>
                          <p className="text-[9px] text-slate-500 font-mono">NIMC HIGH-SECURITY DIRECT LINK Desk</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {(currentUser.ninVerified && currentUser.faceVerified) ? (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase flex items-center space-x-1">
                            <span className="inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping mr-1" />
                            <span>Verified Citizen</span>
                          </span>
                        ) : (
                          <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase animate-pulse">
                            Security Assessment Pending
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Step-by-Step Security Wizard */}
                    {!(currentUser.nin) ? (
                      /* STEP 1: BIND CITIZEN NIN */
                      <div className="space-y-4 max-w-lg">
                        <div className="space-y-1.5">
                          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-tight font-mono">Step 1: Link your National Identity Number (NIN)</h4>
                          <p className="text-[11px] text-slate-500 leading-relaxed">
                            Federal regulations require linking your valid 11-digit NIN. Linking your NIN ensures each citizen is restricted to a single verified account file, completely eliminating multiple accounts fraud and Sybil double-dipping on government funds.
                          </p>
                        </div>

                        <form onSubmit={handleVerifyNin} className="flex flex-col sm:flex-row gap-3 items-end">
                          <div className="flex-grow w-full text-left">
                            <label className="block text-[8px] text-slate-500 font-bold uppercase font-mono mb-1">
                              11-Digit NIMC Identifier
                            </label>
                            <input
                              type="text"
                              required
                              maxLength={11}
                              value={ninInput}
                              onChange={(e) => setNinInput(e.target.value.replace(/\D/g, ""))}
                              placeholder="38290184491"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-800 font-mono text-xs focus:outline-none focus:border-[#008751] focus:bg-white"
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={ninLoading}
                            className="bg-[#008751] hover:bg-[#007345] text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center space-x-1 whitespace-nowrap cursor-pointer disabled:opacity-50"
                          >
                            {ninLoading ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1" />
                                <span>Verifying...</span>
                              </>
                            ) : (
                              <span>Verify NIN Record</span>
                            )}
                          </button>
                        </form>
                        {ninVerificationError && (
                          <p className="text-[10px] text-red-600 font-semibold">{ninVerificationError}</p>
                        )}
                      </div>
                    ) : !currentUser.faceVerified ? (
                      /* STEP 2: FACE ID BIOMETRIC SCANNING */
                      <div className="space-y-4">
                        <div className="space-y-1 max-w-lg">
                          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-tight font-mono">Step 2: Biometric Facial Match Scan</h4>
                          <p className="text-[11px] text-slate-500 leading-relaxed">
                            NIN: <strong className="font-mono text-[#008751]">{currentUser.nin?.substring(0,3)}*****{currentUser.nin?.slice(-3)}</strong> linked successfully. Now, verify ownership of this NIN record by conducting a live biometric selfie analysis to guarantee you are not creating a synthetic clone profile.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                          
                          {/* Face Scanner Feed Window */}
                          <div className="md:col-span-5 bg-slate-950 aspect-video md:aspect-square rounded-2xl overflow-hidden border border-slate-950 flex flex-col items-center justify-center relative shadow-inner min-h-[180px]">
                            {cameraActive ? (
                              <div className="w-full h-full relative flex items-center justify-center">
                                {/* Simulated Interactive Overlay */}
                                <div className="absolute inset-0 border border-[#008751]/30 rounded-2xl pointer-events-none" />
                                <div className="absolute inset-4 border border-dashed border-emerald-500/20 rounded-full animate-spin pointer-events-none" style={{ animationDuration: '20s' }} />
                                
                                {/* Dynamic Scanning bar overlay */}
                                {faceScanning && (
                                  <div className="absolute left-0 right-0 h-0.5 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse" style={{ top: '40%' }} />
                                )}

                                {/* Target guidelines */}
                                <div className="absolute top-2 left-2 text-[#008751] font-mono text-[7px] space-y-0.5 pointer-events-none">
                                  <p>AGC: AUTO_GAIN</p>
                                  <p>LOCK: SCAN_READY</p>
                                  <p>FPS: 30</p>
                                </div>

                                <div className="absolute bottom-2 right-2 text-red-500 font-mono text-[7px] animate-pulse">
                                  ● REC BIOMETRICS
                                </div>

                                {/* Simulated Face Grid Dots */}
                                <div className="absolute w-20 h-20 border border-[#008751]/30 rounded-full flex items-center justify-center pointer-events-none">
                                  <div className="absolute w-2 h-2 bg-[#008751] rounded-full animate-ping" />
                                  <span className="w-1.5 h-1.5 bg-[#008751] rounded-full" />
                                  <span className="absolute top-2 left-4 text-[#008751] text-[6px]">T: 0.98</span>
                                  <span className="absolute bottom-2 right-4 text-[#008751] text-[6px]">M: Match</span>
                                </div>

                                {/* Standard video stream backup block */}
                                <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center text-slate-500 text-[10px] space-y-1 p-4 text-center">
                                  <Camera className="w-6 h-6 text-emerald-500 animate-pulse" />
                                  <span className="font-mono text-[8px] text-emerald-500">BIOMETRIC FIELD ACQUIRED</span>
                                  <span className="text-slate-400">Position your face inside the bounding scope and secure room lighting</span>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center p-6 space-y-3">
                                <Camera className="w-8 h-8 text-slate-705 mx-auto" />
                                <div className="space-y-1">
                                  <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-widest font-mono">Biometrics Stream Offline</span>
                                  <span className="block text-[9px] text-slate-500 leading-tight font-sans">Webcam access required to start facial matches</span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Control desk column */}
                          <div className="md:col-span-7 space-y-3.5 text-left">
                            <div className="space-y-1">
                              <span className="text-[9px] text-amber-700 bg-amber-500/10 px-2 py-0.5 rounded font-mono font-bold uppercase">
                                Biometric Action Required
                              </span>
                              <h5 className="font-bold text-xs text-slate-800">Align face inside biometric window</h5>
                              <p className="text-[10px] text-slate-550 leading-normal font-sans">
                                Ensure your room has good ambient lighting. You will be prompted to hold steady for a brief 3-second live structure scanning mapping index.
                              </p>
                            </div>

                            <div className="flex gap-2.5">
                              {!cameraActive ? (
                                <button
                                  onClick={startCamera}
                                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-4 rounded-xl text-xs cursor-pointer flex items-center space-x-1"
                                >
                                  <Camera className="w-3.5 h-3.5 mr-1" />
                                  <span>Activate Webcam</span>
                                </button>
                              ) : (
                                <>
                                  <button
                                    onClick={handleStartFaceScan}
                                    disabled={faceScanning}
                                    className="bg-[#008751] hover:bg-[#007345] text-white font-bold py-2.5 px-4 rounded-xl text-xs cursor-pointer flex items-center space-x-1 disabled:opacity-50"
                                  >
                                    {faceScanning ? (
                                      <>
                                        <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1" />
                                        <span>Capturing mesh...</span>
                                      </>
                                    ) : (
                                      <>
                                        <Fingerprint className="w-3.5 h-3.5 mr-1" />
                                        <span>Launch Biometric Scan</span>
                                      </>
                                    )}
                                  </button>

                                  <button
                                    onClick={stopCamera}
                                    className="bg-slate-205 hover:bg-slate-300 text-slate-700 font-bold py-2 px-3 rounded-xl text-xs cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                          
                        </div>
                      </div>
                    ) : (
                      /* STEP 3: BOTH COMPLETED AND BIOMETRIC LOCK CLEARED */
                      <div className="bg-emerald-500/[0.02] border border-emerald-500/10 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-center animate-fade-in text-xs font-sans">
                        
                        <div className="md:col-span-8 flex items-start space-x-3 text-left">
                          <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-xl border border-emerald-500/15 flex-shrink-0 mt-0.5">
                            <ShieldCheck className="w-5 h-5 animate-pulse" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-extrabold text-slate-950 uppercase tracking-tight">Identity Anti-Fraud Security audit: Approved</h4>
                            <p className="text-[10.5px] text-slate-500 leading-normal font-sans">
                              Excellent! National Identity database mapping confirms your unique biometric profile and legal NIN identifier matches perfectly.
                            </p>
                            
                            <div className="grid grid-cols-2 gap-3 pt-2 font-mono text-[9px] text-slate-500 text-left">
                              <div>
                                <span>Linked NIN: </span>
                                <strong className="text-slate-850">*********{(currentUser.nin || "38290184491").slice(-2)}</strong>
                              </div>
                              <div>
                                <span>Biometric Conformance: </span>
                                <strong className="text-emerald-700">{currentUser.faceVerificationScore || "98.4"}% Match</strong>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="md:col-span-4 justify-end flex">
                          <div className="flex flex-col items-center bg-white border border-slate-200 rounded-xl px-4 py-2 text-center shadow-xs">
                            <span className="text-[8px] uppercase text-slate-400 font-bold font-mono">STATUS ENVELOPE</span>
                            <span className="text-[10px] font-black font-mono text-emerald-600">NIMC-PASSED</span>
                          </div>
                        </div>

                      </div>
                    )}

                  </div>

                  {/* Core Interactive Portal for Unpaid Actions */}
                  {currentUser.membershipStatus !== "paid" && (
                    <div className="bg-gradient-to-tr from-[#008751]/5 via-white to-[#D10000]/5 border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-sm">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-[#008751]/5 rounded-full blur-2xl pointer-events-none" />
                      
                      <div className="space-y-3 max-w-lg">
                        <div className="inline-flex bg-red-50 text-[#D10000] font-bold border border-red-100 px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-widest font-mono">
                          Integrity Constraint Outstanding
                        </div>
                        <h3 className="text-lg font-black text-slate-900">Purchase APC Membership ID to Release Funds</h3>
                        <p className="text-slate-600 text-xs leading-relaxed">
                          Standard digital identity governance requires an active APC registration card. Security protocols mandate this card to bind your legal name, lock down automated spam bots, and permit direct bank withdrawals of your <strong>₦{currentUser.grantAmount.toLocaleString()}</strong> allocation.
                        </p>
                        <div className="flex items-center space-x-4 border-t border-slate-100 pt-3 text-[10px] text-slate-500 font-mono">
                          <span>Required Fee: <strong className="text-[#008751] text-xs">₦{currentUser.membershipFee.toLocaleString()}</strong></span>
                          <span>•</span>
                          <span>Audit level: High Priority</span>
                        </div>
                      </div>

                      <button
                        onClick={() => setActiveTab("payment")}
                        className="bg-[#008751] hover:bg-[#007345] text-white font-black px-6 py-3.5 rounded-xl shadow flex items-center space-x-1.5 flex-shrink-0 animate-pulse text-xs uppercase tracking-wide cursor-pointer"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Acquire ID Card Now</span>
                      </button>
                    </div>
                  )}

                  {/* DISPLAY MOUNTED APC CARD IF PAID */}
                  {currentUser.membershipStatus === "paid" && (
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                      
                      {/* Polished HTML APC Digital Identification card layout */}
                      <div className="md:col-span-3 bg-gradient-to-b from-slate-900 to-slate-950 text-slate-100 border border-slate-950 rounded-3xl p-6 text-left relative overflow-hidden shadow-lg">
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#008751]/10 via-transparent to-[#D10000]/10 pointer-events-none" />
                        
                        {/* Card Header styling */}
                        <div className="flex justify-between items-start border-b border-white/10 pb-4 mb-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#008751] via-white to-[#D10000] p-0.5">
                              <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center text-[10px] font-black text-[#008751]">
                                APC
                              </div>
                            </div>
                            <div>
                              <h4 className="font-extrabold text-white text-xs tracking-tight">NATIONAL EMPOWERMENT NETWORK</h4>
                              <p className="text-[8px] text-slate-400 font-mono">Digital Membership Register</p>
                            </div>
                          </div>
                          <span className="bg-[#008751]/20 text-[#008751] border border-[#008751]/30 rounded font-mono font-bold text-[8px] px-1.5 py-0.5">
                            CIVIC MEMBER
                          </span>
                        </div>

                        {/* Card body representing identity data */}
                        <div className="grid grid-cols-3 gap-4 items-center">
                          <div className="col-span-2 space-y-3 font-mono text-[10px]">
                            <div>
                              <p className="text-[8px] text-slate-400">CITIZEN FULL NAME</p>
                              <p className="text-white font-bold tracking-wide uppercase">{currentUser.fullName}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <p className="text-[8px] text-slate-400">MEMBER ID NUMBER</p>
                                <p className="text-[#008751] font-bold">{currentUser.membershipId}</p>
                              </div>
                              <div>
                                <p className="text-[8px] text-slate-400">COHORT AGE / STATE</p>
                                <p className="text-slate-300 font-bold uppercase">{currentUser.age} Yrs / {currentUser.state}</p>
                              </div>
                            </div>

                            <div className="pt-2 border-t border-white/10 flex items-center space-x-1.5">
                              <ShieldCheck className="w-3.5 h-3.5 text-[#008751]" />
                              <span className="text-[8px] text-slate-400 font-mono">SECURE QR AUDITED • ACTIVE REGISTRY</span>
                            </div>
                          </div>

                          {/* Graphical representation of QR code */}
                          <div className="col-span-1 bg-white p-2 text-center rounded-xl border border-slate-700 shadow-sm flex flex-col items-center justify-center space-y-1">
                            <QrCode className="w-14 h-14 text-slate-950" />
                            <span className="text-[6px] text-slate-600 font-bold uppercase tracking-wider font-mono">Verified ID</span>
                          </div>
                        </div>

                        <div className="mt-5 pt-3.5 border-t border-white/10 flex justify-between items-center text-[10px] text-slate-400 font-mono">
                          <button
                            onClick={() => {
                              setCardDownloading(true);
                              setTimeout(() => setCardDownloading(false), 2000);
                            }}
                            className="text-[#008751] hover:text-[#007345] flex items-center space-x-1 font-bold bg-white border border-slate-200 px-3 py-1 rounded transition-colors cursor-pointer"
                          >
                            <Download className="w-3 h-3 text-[#008751]" />
                            <span>{cardDownloading ? "Downloading..." : "Download PDF"}</span>
                          </button>
                          <span>ID Verified in: 2026</span>
                        </div>

                      </div>

                      {/* Cashout board explaining withdrawal eligibility */}
                      <div className="md:col-span-2 bg-white border border-slate-200 rounded-3xl p-5 flex flex-col justify-between text-left space-y-4 shadow-sm">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-1.5 text-[#008751]">
                            <CheckCircle2 className="w-4 h-4" />
                            <h4 className="font-bold text-xs uppercase tracking-wider font-mono">Identity Audits Completed!</h4>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-normal">
                            Your APC Card is active and registered. Your grant balance of <strong>₦{currentUser.grantAmount.toLocaleString()}</strong> is fully unlocked and ready for settlement clearing.
                          </p>
                        </div>

                        <div className="space-y-2 border-y border-slate-100 py-3 font-mono text-[10px] text-slate-500">
                          <div className="flex justify-between">
                            <span>Grant Status:</span>
                            <span className="font-bold text-[#008751] uppercase text-xs text-right">UNLOCKED</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Disbursement Fee:</span>
                            <span className="font-bold text-[#008751] text-xs text-right">FREE (₦0)</span>
                          </div>
                        </div>

                        <button
                          onClick={() => setActiveTab("withdrawal")}
                          className="w-full bg-[#008751] hover:bg-[#007345] text-white font-extrabold py-3 rounded-xl shadow-sm text-xs uppercase tracking-widest text-center cursor-pointer flex items-center justify-center space-x-1"
                        >
                          <Send className="w-3 h-3 mr-1" />
                          <span>Enter Bank &amp; Cashout</span>
                        </button>
                      </div>

                    </div>
                  )}

                  {/* Frequently Asked Section Mini-Widget for User */}
                  <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-3 shadow-sm">
                    <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider font-mono">Recent disbursement instructions</h4>
                    <ul className="space-y-2 text-[11px] text-slate-500">
                      <li className="flex items-start space-x-2">
                        <span className="text-[#008751] font-bold mt-0.5">•</span>
                        <span>Ensure your designated bank account name corresponds exactly to your APC Grants profile name to satisfy Nigerian central settlement verification standards.</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-[#008751] font-bold mt-0.5">•</span>
                        <span>Do not attempt to use another citizen's APC card reference; audits will flag transactions immediately as duplicate.</span>
                      </li>
                    </ul>
                  </div>

                </motion.div>
              )}

              {/* TAB 2: ACTIVE ID CARD PAYMENT PORTAL */}
              {activeTab === "payment" && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6 text-left"
                >
                  
                  {currentUser.membershipStatus === "paid" ? (
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center space-y-4 shadow-sm">
                      <div className="w-12 h-12 bg-[#008751]/10 rounded-full flex items-center justify-center text-[#008751] mx-auto border border-[#008751]/20">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">Payment Verified successfully!</h3>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Your central APC card is fully active. Member ID: <strong>{currentUser.membershipId}</strong>. You are cleared to initiate immediate bank cashouts.
                      </p>
                      <button
                        onClick={() => setActiveTab("overview")}
                        className="bg-[#008751] hover:bg-[#007345] text-white font-bold py-2 px-5 rounded-lg text-xs cursor-pointer"
                      >
                        Return to Hub
                      </button>
                    </div>
                  ) : (
                    // PAYMENT FORM SIMULATING FLUTTERWAVE GATEWAY
                    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                      
                      {/* Paystack/Flutterwave visual header */}
                      <div className="bg-slate-50 px-6 py-5 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-7 h-7 bg-[#008751] rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0">
                            P
                          </div>
                          <div>
                            <h4 className="font-extrabold text-sm text-slate-900 tracking-tight">APC SECURE PAYMENT GATEWAY</h4>
                            <p className="text-[9px] text-slate-500 font-mono">Powered by Federal Settlement Platform</p>
                          </div>
                        </div>
                        <div className="text-left sm:text-right font-mono text-xs">
                          <span className="text-slate-500 block text-[9px] uppercase font-sans">Verification Amount Due</span>
                          <span className="font-black text-[#008751] text-sm">₦{currentUser.membershipFee.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Payment Method Selector Grid */}
                      <div className="p-3 bg-slate-50 border-b border-slate-200">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-bold text-[10px] md:text-xs">
                          {[
                            { id: "card", label: "Debit Card", icon: CreditCard },
                            { id: "bank_transfer", label: "Bank Transfer", icon: RefreshCw },
                            { id: "ussd", label: "USSD Code", icon: Smartphone },
                            { id: "wallet", label: "Digital Wallet", icon: Award }
                          ].map((m) => {
                            const Icon = m.icon;
                            const selected = paymentMethod === m.id;
                            return (
                              <button
                                key={m.id}
                                type="button"
                                onClick={() => setPaymentMethod(m.id as any)}
                                className={`py-2.5 px-2 flex flex-col sm:flex-row items-center justify-center gap-2 rounded-xl transition-all cursor-pointer border ${
                                  selected 
                                    ? "bg-[#008751] text-white border-[#008751] shadow-sm font-extrabold" 
                                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
                                }`}
                                style={{ minHeight: "44px" }}
                              >
                                <Icon className={`w-3.5 h-3.5 ${selected ? "text-white" : "text-[#008751]"}`} />
                                <span className="tracking-tight">{m.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Dynamic Gateway Views inside portal */}
                      <div className="p-6 sm:p-8 text-xs font-sans bg-white">
                        
                        {paymentSuccess ? (
                          <div className="py-6 text-center space-y-6 bg-white animate-fade-in max-w-md mx-auto">
                            <div className="w-14 h-14 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-600 mx-auto border border-emerald-500/20 shadow-sm relative">
                              <CheckCircle2 className="w-8 h-8 animate-bounce" />
                              <span className="absolute top-0 right-0 p-1 bg-emerald-500 text-white rounded-full text-[6px] font-bold">100%</span>
                            </div>
                            
                            <div className="space-y-1">
                              <h4 className="text-base font-black text-slate-900 tracking-tight">Identity Token Payment Settled</h4>
                              <p className="text-[10px] text-slate-500 font-mono">ID CARD STATUS: ACTIVE / PROVISIONED</p>
                            </div>

                            {/* Federal Transaction Receipt Container */}
                            <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 text-left font-mono text-[10px] space-y-2.5 relative">
                              <div className="absolute top-2 right-2 flex space-x-0.5 opacity-30">
                                <div className="w-1 h-3 bg-slate-900" />
                                <div className="w-0.5 h-3 bg-slate-900" />
                                <div className="w-1.5 h-3 bg-slate-900" />
                                <div className="w-0.5 h-3 bg-slate-900" />
                              </div>

                              <div className="border-b border-dashed border-slate-200 pb-2 flex justify-between uppercase">
                                <span className="text-slate-400">Merchant:</span>
                                <span className="text-slate-800 font-semibold">APC Federal Settlement</span>
                              </div>
                              
                              <div className="flex justify-between">
                                <span className="text-slate-400">Payer Name:</span>
                                <span className="text-slate-800 font-bold uppercase">{currentUser.fullName}</span>
                              </div>
                              
                              <div className="flex justify-between">
                                <span className="text-slate-400">Reference No:</span>
                                <span className="text-emerald-700 font-bold select-all tracking-wider">{latestPaymentRef || "REF-APC-GEN7764"}</span>
                              </div>

                              <div className="flex justify-between">
                                <span className="text-slate-400">Payment channel:</span>
                                <span className="text-slate-800 uppercase font-bold">{paymentMethod.replace("_", " ")} Gateway</span>
                              </div>

                              <div className="flex justify-between">
                                <span className="text-slate-400">Settled On:</span>
                                <span className="text-slate-800 font-bold">{latestPaymentTime || new Date().toLocaleString()}</span>
                              </div>

                              <div className="border-t border-dashed border-slate-200 pt-2.5 flex justify-between text-xs font-bold font-mono">
                                <span className="text-slate-600">Total Cleared:</span>
                                <span className="text-emerald-600 font-extrabold text-[#008751]">₦{currentUser.membershipFee.toLocaleString()}</span>
                              </div>
                            </div>

                            <p className="text-[10px] text-slate-400 leading-normal bg-amber-500/5 px-2 py-1.5 border border-amber-500/10 rounded-lg max-w-xs mx-auto">
                              ⚠️ Your membership card is ready. Secure system is returning you in a moment to complete automatic activation...
                            </p>
                          </div>
                        ) : (
                          <form onSubmit={handleProcessPayment} className="space-y-5 text-left bg-white text-xs font-sans animate-fade-in">
                            
                            {/* CARD SUBMETHOD */}
                            {paymentMethod === "card" && (
                              <div className="space-y-4 font-sans">
                                <div>
                                  <label className="block text-slate-600 font-bold uppercase tracking-wider mb-1 font-mono">
                                    Card Number (16 Digits)
                                  </label>
                                  <input
                                    type="text"
                                    required
                                    maxLength={19}
                                    value={cardNumber}
                                    onChange={(e) => {
                                      // Formatting cards spacing automatically
                                      const val = e.target.value.replace(/\D/g, "");
                                      const spacedVal = val.replace(/(.{4})/g, "$1 ").trim();
                                      setCardNumber(spacedVal);
                                    }}
                                    placeholder="5399 4812 9012 3844"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 text-slate-800 focus:outline-none focus:border-[#008751] focus:bg-white font-mono text-sm shadow-inner"
                                  />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-slate-600 font-bold uppercase tracking-wider mb-1 font-mono">
                                      Expiry Date
                                    </label>
                                    <input
                                      type="text"
                                      required
                                      maxLength={5}
                                      value={cardExpiry}
                                      onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, "");
                                        if (val.length >= 2) {
                                          setCardExpiry(val.substring(0, 2) + "/" + val.substring(2, 4));
                                        } else {
                                          setCardExpiry(val);
                                        }
                                      }}
                                      placeholder="MM/YY"
                                      className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 text-slate-800 focus:outline-none focus:border-[#008751] focus:bg-white font-mono text-sm shadow-inner"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-slate-600 font-bold uppercase tracking-wider mb-1 font-mono">
                                      CVV Code (3 Digits)
                                    </label>
                                    <input
                                      type="password"
                                      required
                                      maxLength={3}
                                      value={cardCvv}
                                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                                      placeholder="901"
                                      className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 text-slate-800 focus:outline-none focus:border-[#008751] focus:bg-white font-mono text-sm shadow-inner"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* BANK TRANSFER SUBMETHOD */}
                            {paymentMethod === "bank_transfer" && (
                              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4 font-mono text-[11px]">
                                <div className="space-y-1.5 leading-relaxed text-slate-600">
                                  <p>To verify via Direct Bank transfer, send the exact sum of <strong>₦{currentUser.membershipFee.toLocaleString()}</strong> to the designated Providus Bank settlement account below:</p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-200 pt-4 leading-normal">
                                  <div>
                                    <p className="text-[9px] text-slate-500 font-bold uppercase">BANK NAME</p>
                                    <p className="text-slate-800 font-black text-xs uppercase font-sans">Providus Bank PLC</p>
                                  </div>
                                  <div>
                                    <p className="text-[9px] text-slate-500 font-bold uppercase font-mono">ACCOUNT NUMBER</p>
                                    <div className="flex items-center space-x-2">
                                      <p className="text-[#008751] font-black text-sm tracking-wider">1029482910</p>
                                      <button 
                                        type="button" 
                                        onClick={() => navigator.clipboard.writeText("1029482910")}
                                        className="text-slate-500 hover:text-slate-850 cursor-pointer"
                                      >
                                        <Copy className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-[9px] text-slate-500 font-bold uppercase">ACCOUNT HOLDER NAME</p>
                                    <p className="text-slate-800 font-extrabold text-[10px] font-sans">APC GRANTS CENTRAL SETTLEMENT</p>
                                  </div>
                                  <div>
                                    <p className="text-[9px] text-slate-500 font-bold uppercase">TRANSACTION REFERENCE</p>
                                    <p className="text-amber-700 font-black tracking-widest text-[10.5px]">REF-APC-DEMO-{currentUser.fullName.split(" ")[0].toUpperCase()}</p>
                                  </div>
                                </div>

                                <p className="text-[9.5px] text-slate-400 italic border-t border-slate-200 pt-3 font-sans">
                                  * Once your commercial bank reports successful settlement, click the button below to authorize immediate central verification mapping.
                                </p>
                              </div>
                            )}

                            {/* USSD DIAL CODE SUBMETHOD */}
                            {paymentMethod === "ussd" && (
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-slate-600 font-bold uppercase tracking-wider mb-2 font-mono">
                                    Select Your Mobile Bank Provider
                                  </label>
                                  <select
                                    required
                                    value={ussdBank}
                                    onChange={(e) => setUssdBank(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 text-slate-700 focus:outline-none focus:border-[#008751] focus:bg-white cursor-pointer"
                                  >
                                    <option value="">-- Choose Provider Bank --</option>
                                    <option value="gtb">Guaranty Trust Bank (GTB) (*737#)</option>
                                    <option value="zenith">Zenith Bank (*966#)</option>
                                    <option value="access">Access Bank (*901#)</option>
                                    <option value="uba">United Bank for Africa (UBA) (*919#)</option>
                                    <option value="firstbank">First Bank of Nigeria (*894#)</option>
                                  </select>
                                </div>

                                {ussdBank && (
                                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 font-mono text-center space-y-1.5 font-bold">
                                    <p className="text-[10px] text-slate-500">Dial the code below on your registered mobile lines to clear payment:</p>
                                    <p className="text-lg font-black text-[#008751] tracking-wider">
                                      {ussdBank === "gtb" && `*737*1*2*1029482910*${currentUser.membershipFee}#`}
                                      {ussdBank === "zenith" && `*966*3*${currentUser.membershipFee}*1029482910#`}
                                      {ussdBank === "access" && `*901*2*1029482910*${currentUser.membershipFee}#`}
                                      {ussdBank === "uba" && `*919*8*1029482910*${currentUser.membershipFee}#`}
                                      {ussdBank === "firstbank" && `*894*${currentUser.membershipFee}*1029482910#`}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* MOBILE DIGITAL WALLET */}
                            {paymentMethod === "wallet" && (
                              <div className="space-y-4 text-left">
                                <div>
                                  <label className="block text-slate-600 font-bold uppercase tracking-wider mb-1.5 font-mono">
                                    Verified OPay / Paga Phone Number
                                  </label>
                                  <input
                                    type="text"
                                    required
                                    value={mobileWalletNumber}
                                    onChange={(e) => setMobileWalletNumber(e.target.value.replace(/\D/g, ""))}
                                    placeholder="e.g. 08067890123"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 text-slate-800 focus:outline-none focus:border-[#008751] focus:bg-white font-mono text-sm shadow-inner"
                                  />
                                </div>
                                <p className="text-[10px] text-slate-500">A payment push check will be transmitted directly to your mobile wallet provider app.</p>
                              </div>
                            )}

                            {/* Secure action button */}
                            <button
                              type="submit"
                              disabled={paymentLoading}
                              className="w-full mt-4 flex items-center justify-center space-x-2 bg-[#008751] hover:bg-[#007345] text-white font-black py-3 rounded-xl disabled:opacity-50 cursor-pointer text-xs uppercase tracking-wide shadow-sm"
                            >
                              {paymentLoading ? (
                                <span className="flex items-center space-x-2">
                                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                                  <span>Authorizing Security Settlement...</span>
                                </span>
                              ) : (
                                <span>
                                  {paymentMethod === "bank_transfer" ? "Authorize Bank Transfer Verification" : `Complete Security Verification (₦${currentUser.membershipFee.toLocaleString()})`}
                                </span>
                              )}
                            </button>
                            
                            <div className="text-center font-mono text-[9px] text-slate-400 uppercase tracking-widest pt-2 flex items-center justify-center space-x-1.5">
                              <ShieldCheck className="w-3.5 h-3.5 text-[#008751]" />
                              <span>256-bit bank level SSL secure socket layers</span>
                            </div>

                          </form>
                        )}
                        
                      </div> 
                      </div>

                    )}

                </motion.div>
              )}

              {/* TAB 3: SECURE WITHDRAWAL DRAWER PORTAL */}
              {activeTab === "withdrawal" && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6 text-left"
                >
                  
                  {currentUser.membershipStatus !== "paid" ? (
                    // OUTSTANDING CONSTRAINT WARNING
                    <div className="bg-white border border-red-250 rounded-2xl p-6 text-center space-y-4 shadow-sm">
                      <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-650 mx-auto border border-red-200">
                        <ShieldAlert className="w-5 h-5" />
                      </div>
                      <h3 className="text-base font-extrabold text-red-750">Withdrawal Blocked: Verification Card Unpaid</h3>
                      <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                        To protect federal funds from automated cyber-clones, you are strictly required to purchase your official APC physical or digital Membership ID template before money release.
                      </p>
                      <button
                        onClick={() => setActiveTab("payment")}
                        className="bg-[#008751] hover:bg-[#007345] text-white font-extrabold py-2 px-5 rounded-lg text-xs cursor-pointer"
                      >
                        Acquire Registration ID Now
                      </button>
                    </div>
                  ) : (!currentUser.ninVerified || !currentUser.faceVerified) ? (
                    // OUTSTANDING IDENTITY SECURITY PROTOCOL BLOCK
                    <div className="bg-white border border-amber-300 rounded-2xl p-6 text-center space-y-4 shadow-sm">
                      <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 mx-auto border border-amber-200">
                        <Fingerprint className="w-5 h-5 animate-pulse" />
                      </div>
                      <h3 className="text-base font-extrabold text-amber-900">Withdrawal on Hold: Identity Biometrics Missing</h3>
                      <p className="text-xs text-slate-650 max-w-sm mx-auto leading-relaxed">
                        Anti-fraud security protocols require connecting your valid 11-digit NIN and doing a Live Facial Verification scan to secure payments against double-allocations and duplicate accounts.
                      </p>
                      <button
                        onClick={() => setActiveTab("overview")}
                        className="bg-[#007345] hover:bg-[#005e38] text-white font-extrabold py-2 px-5 rounded-lg text-xs cursor-pointer uppercase font-mono tracking-wider shadow-sm"
                      >
                        Complete NIN &amp; Biometrics Verification
                      </button>
                    </div>
                  ) : (
                    // WITHDRAWAL CASHOUT FORM
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-[#008751]/5 rounded-bl-full" />
                      
                      <div className="flex border-b border-slate-200 pb-4 mb-6 justify-between items-center">
                        <div>
                          <h3 className="text-lg font-black text-slate-900">Federal Disbursement Clearing Window</h3>
                          <p className="text-xs text-slate-500">Direct instant payout mapping desk.</p>
                        </div>
                        <span className="bg-[#008751]/10 text-[#008751] border border-[#008751]/20 rounded font-mono font-bold text-[9px] px-2 py-0.5">
                          ACTIVE CANAL
                        </span>
                      </div>

                      {withdrawalError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs mb-4 flex items-start space-x-2">
                          <ShieldAlert className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                          <span>{withdrawalError}</span>
                        </div>
                      )}

                      {withdrawalSuccess ? (
                        <div className="py-8 text-center space-y-4">
                          <div className="w-14 h-14 bg-[#008751]/10 rounded-full flex items-center justify-center text-[#008751] mx-auto border border-[#008751]/20">
                            <CheckCircle2 className="w-7 h-7" />
                          </div>
                          <h4 className="text-lg font-black text-slate-900">Withdrawal Application Submitted!</h4>
                          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                            Your cashout claim of <strong className="text-slate-900 font-extrabold">₦{currentUser.grantAmount.toLocaleString()}</strong> has been submitted to the National Grants Clearing Committee. Payout typically credits your account within 12-24 hours. Check Financial Logs tab daily.
                          </p>
                        </div>
                      ) : (
                        currentUser.withdrawalStatus === "pending" || currentUser.withdrawalStatus === "approved" ? (
                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center space-y-4 shadow-inner">
                            <h4 className="text-base font-bold text-slate-900">Active Withdrawal in progress</h4>
                            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                              {currentUser.withdrawalStatus === "pending" 
                                ? `You have an active withdrawal request of ₦${currentUser.grantAmount.toLocaleString()} pending administrative signature clearance.`
                                : `Congratulations! Your grant payout of ₦${currentUser.grantAmount.toLocaleString()} has been fully disbursed and cleared into account ...${currentUser.accountNumber?.slice(-4)}`
                              }
                            </p>
                            <button
                              onClick={() => setActiveTab("history")}
                              className="bg-white border border-slate-250 text-slate-650 hover:text-slate-900 hover:bg-slate-100 transition-all px-4 py-2 rounded-lg text-xs font-bold font-mono cursor-pointer shadow-sm"
                            >
                              Check Financial Logs
                            </button>
                          </div>
                        ) : (
                          <form onSubmit={handleWithdrawalRequest} className="space-y-4 text-left font-sans text-xs">
                            
                            {/* Summary visual indicator */}
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex justify-between items-center text-xs font-mono shadow-inner">
                              <div>
                                <span className="text-[10px] text-slate-500 block uppercase font-sans">Available Grant Sum</span>
                                <span className="font-black text-slate-900 text-base">₦{currentUser.grantAmount.toLocaleString()}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-[10px] text-slate-500 block uppercase font-sans">Membership Record</span>
                                <span className="font-bold text-[#008751] tracking-wider text-[11px]">{currentUser.membershipId}</span>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-slate-650 font-bold uppercase tracking-wider mb-2 font-mono">
                                  Commercial Bank Name
                                </label>
                                <select
                                  required
                                  value={wtBank}
                                  onChange={(e) => setWtBank(e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 text-slate-705 focus:outline-none focus:border-[#008751] focus:bg-white cursor-pointer"
                                >
                                  <option value="">-- Choose Commercial Bank --</option>
                                  {NIGERIAN_BANKS.map((b) => (
                                    <option key={b} value={b}>{b}</option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="block text-slate-650 font-bold uppercase tracking-wider mb-2 font-mono">
                                  10-Digit NUBAN Account Number
                                </label>
                                <div className="relative">
                                  <input
                                    type="text"
                                    required
                                    maxLength={10}
                                    value={wtAccountNumber}
                                    onChange={(e) => setWtAccountNumber(e.target.value.replace(/\D/g, ""))}
                                    placeholder="e.g. 0123456789"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 text-slate-800 focus:outline-none focus:border-[#008751] focus:bg-white font-mono tracking-widest text-sm shadow-inner"
                                  />
                                  <Banknote className="absolute right-3.5 top-3 text-slate-400 w-4.5 h-4.5" />
                                </div>
                              </div>
                            </div>

                            {/* Dynamic resolution panel */}
                            <AnimatePresence>
                              {resolvingAccount && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="bg-slate-50 p-3 rounded-lg flex items-center justify-center space-x-2 text-slate-500 border border-slate-200"
                                >
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#008751]" />
                                  <span className="font-mono text-[10px]">Resolving electronic banking account name...</span>
                                </motion.div>
                              )}

                              {resolvedName && !resolvingAccount && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="bg-emerald-50 border border-emerald-250 p-3.5 rounded-lg text-emerald-800 flex justify-between items-center"
                                >
                                  <div>
                                    <span className="text-[8px] text-slate-500 font-mono uppercase">Verified Account Legal Beneficiary</span>
                                    <p className="text-[#008751] font-extrabold font-mono uppercase text-xs tracking-wide">{resolvedName}</p>
                                  </div>
                                  <CheckCircle2 className="w-5 h-5 text-[#008751]" />
                                </motion.div>
                              )}
                            </AnimatePresence>

                            <button
                              type="submit"
                              disabled={withdrawalLoading}
                              className="w-full mt-4 flex items-center justify-center space-x-2 bg-[#008751] hover:bg-[#007345] text-white font-black py-3 rounded-xl disabled:opacity-50 cursor-pointer text-xs uppercase tracking-wide shadow-sm"
                            >
                              {withdrawalLoading ? (
                                <span className="flex items-center space-x-2">
                                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                                  <span>Locking clearing registers...</span>
                                </span>
                              ) : (
                                <span>Authorize Direct Bank Withdrawal</span>
                              )}
                            </button>

                            <div className="text-center font-mono text-[9px] text-slate-400 uppercase tracking-widest pt-2">
                              🛡️ Standard Nigerian Inter-Bank Cleared (NIBSS Standard)
                            </div>

                          </form>
                        )
                      )}

                    </div>
                  )}

                </motion.div>
              )}

              {/* TAB 4: REFERRAL CENTER LISTINGS & BENEFITS */}
              {activeTab === "referrals" && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6 text-left"
                >
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                      <div>
                        <h3 className="text-lg font-black text-slate-900">Constituency Advocate Dashboard</h3>
                        <p className="text-xs text-slate-500">Invite neighbors and claim premium financial milestones.</p>
                      </div>
                      <Award className="w-8 h-8 text-amber-600 animate-pulse" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      <div className="space-y-4">
                        <h4 className="font-bold text-slate-800 text-sm">How it works:</h4>
                        <ol className="space-y-2.5 text-[11px] text-slate-600 list-decimal pl-4">
                          <li>Share your electronic invitation reference key.</li>
                          <li>When a civic attendee enters your key at enrollment, the portal links them as your affiliate citizen.</li>
                          <li>Upon completion of their APC Membership Card active verification audit, you accrue a premium <strong>₦5,000</strong> payout bonus.</li>
                        </ol>

                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex justify-between items-center shadow-inner">
                          <div>
                            <span className="text-[9px] text-slate-500 uppercase font-mono block">YOUR AFFILIATE RECRUITMENT KEY</span>
                            <span className="text-base font-extrabold text-[#008751] tracking-widest font-mono">{currentUser.referralCode}</span>
                          </div>
                          <button
                            onClick={handleCopyCode}
                            className="bg-white border border-slate-250 text-slate-700 hover:text-slate-900 hover:bg-slate-100 px-4 py-2 rounded-lg text-xs font-mono font-bold cursor-pointer shadow-sm transition-all"
                          >
                            {copiedCode ? "Copied" : "Copy Key"}
                          </button>
                        </div>
                      </div>

                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 relative overflow-hidden shadow-inner">
                        <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider font-mono">My Affiliate Statistics</h4>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-sm">
                            <span className="text-[8px] text-slate-500 font-mono uppercase">Invited Citizens</span>
                            <p className="text-2xl font-black font-mono text-slate-900 mt-1">{currentUser.referralsCount}</p>
                          </div>
                          <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-sm">
                            <span className="text-[8px] text-slate-500 font-mono uppercase">Earned Accrual Bonus</span>
                            <p className="text-2xl font-black font-mono text-[#008751] mt-1">₦{(currentUser.referralsCount * 5000).toLocaleString()}</p>
                          </div>
                        </div>

                        {/* Interactive milestone levels */}
                        <div className="space-y-2 pt-3 border-t border-slate-200 text-[10px] font-sans">
                          <p className="font-bold text-slate-500 uppercase tracking-widest text-[9px] font-mono">Citizen Benchmark Level:</p>
                          <div className="flex justify-between font-mono">
                            <span>Community Agent Badge:</span>
                            <span className={`font-bold uppercase ${currentUser.referralsCount >= 3 ? "text-[#008751]" : "text-amber-600"}`}>
                              {currentUser.referralsCount >= 3 ? "UNLOCKED" : "Lacks 3 Referrals"}
                            </span>
                          </div>
                        </div>

                      </div>

                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 5: TRANSACTION HISTORY & LOGS */}
              {activeTab === "history" && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6 text-left"
                >
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
                    <div className="flex border-b border-slate-200 pb-4 mb-6 justify-between items-center">
                      <div>
                        <h3 className="text-lg font-black text-slate-900">Central Ledger Logs</h3>
                        <p className="text-xs text-slate-500">Complete legal trace index of your financial intervention file.</p>
                      </div>
                      <span className="bg-slate-50 font-mono text-slate-500 border border-slate-200 text-[9px] px-2 py-0.5 rounded uppercase">
                        ReadOnly Audited
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left font-mono text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 text-[10px] text-slate-500 uppercase tracking-wider">
                            <th className="py-3 px-2">Timestamp</th>
                            <th className="py-3 px-2">Log Action</th>
                            <th className="py-3 px-2">Payment Category</th>
                            <th className="py-3 px-2">Sum</th>
                            <th className="py-3 px-2 text-right">Progress Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-[11px] text-slate-600">
                          
                          {/* 1. Registration initial event */}
                          <tr>
                            <td className="py-3 px-2 text-slate-400">{new Date(currentUser.createdAt).toLocaleDateString()}</td>
                            <td className="font-bold text-slate-800 py-3 px-2">Account Initiation Approved</td>
                            <td className="py-3 px-2 text-slate-500">National Grants Portal Enrollee</td>
                            <td className="py-3 px-2 text-[#008751] font-bold">+₦{currentUser.grantAmount.toLocaleString()}</td>
                            <td className="py-3 px-2 text-right">
                              <span className="bg-[#008751]/10 text-[#008751] px-2 py-0.5 rounded border border-[#008751]/20 text-[9px]">Verified</span>
                            </td>
                          </tr>

                          {/* 2. Membership Fee Payment event */}
                          {userPayments.map(p => (
                            <tr key={p.id}>
                              <td className="py-3 px-2 text-slate-400">{new Date(p.createdAt).toLocaleDateString()}</td>
                              <td className="font-bold text-slate-800 py-3 px-2">APC Members Card Activation</td>
                              <td className="py-3 px-2 text-slate-500 uppercase">{p.paymentType} Payment • Ref: {p.reference.substring(0, 12)}...</td>
                              <td className="py-3 px-2 text-red-650 font-bold">-₦{p.amount.toLocaleString()}</td>
                              <td className="py-3 px-2 text-right">
                                <span className="bg-[#008751]/10 text-[#008751] px-2 py-0.5 rounded border border-[#008751]/20 text-[9px] uppercase">{p.status}</span>
                              </td>
                            </tr>
                          ))}

                          {/* 3. Withdrawal event if present */}
                          {userWithdrawals.map(w => (
                            <tr key={w.id}>
                              <td className="py-3 px-2 text-slate-400">{new Date(w.createdAt).toLocaleDateString()}</td>
                              <td className="font-bold text-slate-800 py-3 px-2">Direct Bank cashout</td>
                              <td className="py-3 px-2 text-slate-500">{w.bankName} (...{w.accountNumber.slice(-4)})</td>
                              <td className="py-3 px-2 text-slate-700 font-bold">-₦{w.amount.toLocaleString()}</td>
                              <td className="py-3 px-2 text-right">
                                {w.status === "pending" && (
                                  <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200 text-[9px] uppercase animate-pulse">Pending Auth</span>
                                )}
                                {w.status === "approved" && (
                                  <span className="bg-[#008751]/10 text-[#008751] px-2 py-0.5 rounded border border-[#008751]/20 text-[9px] uppercase">Disbursed</span>
                                )}
                                {w.status === "rejected" && (
                                  <span className="bg-red-50 text-red-650 px-2 py-0.5 rounded border border-red-200 text-[9px] uppercase">Rejected</span>
                                )}
                              </td>
                            </tr>
                          ))}

                        </tbody>
                      </table>
                    </div>

                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

        </div>
      </div>

    </div>
  );
}
