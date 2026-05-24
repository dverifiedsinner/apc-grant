import React, { useState, useEffect } from "react";
import { 
  Sparkles, ShieldCheck, ShieldAlert, Award, Copy, CheckCircle2, User, Banknote, 
  CreditCard, RefreshCw, Send, ArrowUpRight, TrendingUp, Bell, Smartphone, Star, FileText, Download, QrCode,
  Camera, Fingerprint, Check, Upload, Image, Eye, BookOpen
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { NIGERIAN_BANKS, NIGERIAN_STATES, DEFAULT_GRANT_CONFIGS } from "../data";
import { User as UserType, Payment, Withdrawal, AppNotification } from "../types";
import APCLogo from "./APCLogo";

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
  paystackPublicKey?: string;
}

const QUIZ_QUESTIONS = [
  {
    q: "What does the abbreviation APC mean in Nigerian politics?",
    options: [
      "All Progressives Congress",
      "Alliance for Patriotic Citizens",
      "African Peoples Congress",
      "Action Progressive Coalition"
    ],
    correct: "All Progressives Congress"
  },
  {
    q: "Which administrative central core holds the national social 'Renewed Hope' agenda?",
    options: [
      "Federal Government of Nigeria",
      "Central Bank Administration",
      "Collation of United Parties",
      "Ministry of Youth Sports"
    ],
    correct: "Federal Government of Nigeria"
  },
  {
    q: "What is the official currency of the Federal Republic of Nigeria?",
    options: [
      "Naira",
      "Kwanza",
      "Cedi",
      "Pound Sterling"
    ],
    correct: "Naira"
  },
  {
    q: "Which age cohort qualifies for the highest calibrated grant allocation of ₦750,000?",
    options: [
      "Elderly Bracket (46-65 Yrs)",
      "Youth Bracket (17-25 Yrs)",
      "Adult Bracket (26-35 Yrs)",
      "Mid-Career Bracket (36-45 Yrs)"
    ],
    correct: "Elderly Bracket (46-65 Yrs)"
  }
];

export default function UserDashboard({
  currentUser,
  onUpdateUser,
  payments,
  onAddPayment,
  withdrawals,
  onAddWithdrawal,
  notifications,
  onMarkNotificationRead,
  onNavigate,
  paystackPublicKey = ""
}: UserDashboardProps) {
  
  // Dashboard states
  const [activeTab, setActiveTab] = useState<"overview" | "payment" | "withdrawal" | "referrals" | "history" | "exam">(() => {
    const justReg = localStorage.getItem("apc_just_registered") === "true";
    if (justReg) {
      localStorage.removeItem("apc_just_registered");
      return "exam";
    }
    return "overview";
  });
  const [copiedCode, setCopiedCode] = useState(false);
  const [cardDownloading, setCardDownloading] = useState(false);
  const [notifBellOpen, setNotifBellOpen] = useState(false);

  // Examination interactive center states
  const [examState, setExamState] = useState<"not_started" | "testing" | "grading" | "submitted">(() => {
    return (localStorage.getItem(`apc_exam_state_${currentUser.id}`) as any) || "not_started";
  });
  const [quizQuestionIndex, setQuizQuestionIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<string[]>([]);
  const [examTimeLeft, setExamTimeLeft] = useState(60);
  const [examScoreValue, setExamScoreValue] = useState<number | null>(() => {
    const cachedVal = localStorage.getItem(`apc_exam_score_${currentUser.id}`);
    return cachedVal ? Number(cachedVal) : null;
  });
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // Examination fee validation & redirect flows
  const [verifyEmailInput, setVerifyEmailInput] = useState("");
  const [emailVerifyError, setEmailVerifyError] = useState<string | null>(null);
  const [examPayStage, setExamPayStage] = useState(false);

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

  // Bank Transfer and Verification States
  const [senderAccountName, setSenderAccountName] = useState(() => currentUser.transferAccountName || "");
  const [receiptImage, setReceiptImage] = useState<string | null>(() => currentUser.transferReceiptImage || null);
  const [receiptFileName, setReceiptFileName] = useState(() => currentUser.transferReceiptImage ? "APC_Grant_Transfer_Receipt.png" : "");
  const [showValidationPopup, setShowValidationPopup] = useState(false);
  const [validationLoading, setValidationLoading] = useState(false);

  // Paystack Integration States
  const [useRealPaystack, setUseRealPaystack] = useState(true);
  const [paystackCustomKey, setPaystackCustomKey] = useState("");
  const [paystackError, setPaystackError] = useState<string | null>(null);
  const [paystackSdkLoaded, setPaystackSdkLoaded] = useState(false);

  // Load Paystack dynamic script
  useEffect(() => {
    if (typeof window !== "undefined") {
      const existingScript = document.getElementById("paystack-inline-js");
      if (existingScript) {
        setPaystackSdkLoaded(true);
        return;
      }
      const script = document.createElement("script");
      script.id = "paystack-inline-js";
      script.src = "https://js.paystack.co/v1/inline.js";
      script.async = true;
      script.onload = () => {
        setPaystackSdkLoaded(true);
        console.log("Paystack SDK loaded successfully.");
      };
      script.onerror = () => {
        console.warn("Paystack load blocked. Operating in offline simulation mode.");
      };
      document.body.appendChild(script);
    }
  }, []);

  // Launch live Paystack popover transaction
  const handlePaystackWebCheckout = () => {
    setPaystackError(null);
    setPaymentLoading(true);

    // Read Key configuration (Custom override > Admin Dashboard Configured > Environment public key > Fallback default test sandbox key)
    const envKey = (import.meta as any).env?.VITE_PAYSTACK_PUBLIC_KEY;
    const publicKey = paystackCustomKey.trim() || paystackPublicKey.trim() || envKey || "pk_test_fc8ad45b8813fa2ef69e1507f35443fa92e85740";

    try {
      if (!(window as any).PaystackPop) {
        setPaystackError("Paystack SDK is not loaded. Please verify your internet connection or use the offline simulator checkout.");
        setPaymentLoading(false);
        return;
      }

      const handler = (window as any).PaystackPop.setup({
        key: publicKey,
        email: currentUser.email || "citizen@goverment-settlement.ng",
        amount: currentUser.membershipFee * 100, // Paystack works in kobo
        currency: "NGN",
        ref: `REF_PAYSTACK_${Math.floor(10000000 + Math.random() * 90000000)}`,
        callback: function (response: any) {
          const paymentRef = response.reference || `REF_PS_${Math.floor(10000000 + Math.random() * 90000000)}`;
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
            paymentType: "card",
            reference: paymentRef,
            status: "completed",
            createdAt: new Date().toISOString()
          };

          const newMembershipId = `APC-NG-${Math.floor(100000 + Math.random() * 900000)}`;
          onAddPayment(newPayment);

          const updatedUser: UserType = {
            ...currentUser,
            membershipStatus: "paid",
            membershipId: newMembershipId
          };
          onUpdateUser(updatedUser);

          setPaymentLoading(false);
          setPaymentSuccess(true);

          // Force view return after receipt reading time
          setTimeout(() => {
            setActiveTab("overview");
            setPaymentSuccess(false);
          }, 5000);
        },
        onClose: function () {
          setPaymentLoading(false);
          setPaystackError("Payment dismissed by the payer before completion.");
        }
      });

      handler.openIframe();
    } catch (err: any) {
      console.error("Paystack system failure:", err);
      setPaystackError(`Gateway failed: ${err?.message || "Invalid setup configuration."}. Try using offline simulator mode below.`);
      setPaymentLoading(false);
    }
  };

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

  const handleDownloadApplicationPDF = () => {
    setDownloadingPdf(true);

    try {
      const canvas = document.createElement("canvas");
      canvas.width = 800;
      canvas.height = 1100;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not acquire canvas context");

      // Set elegant layout base background
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Centered large transparent watermark
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(-Math.PI / 6);
      ctx.fillStyle = "rgba(0, 135, 81, 0.03)";
      ctx.font = "bold 90px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("APC RENEWED HOPE", 0, 0);
      ctx.restore();

      // Top Header Banners
      ctx.fillStyle = "#008751";
      ctx.font = "bold 26px Arial, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("RENEWED HOPE NATIONAL SOCIAL GRANT PROGRAMME", canvas.width / 2, 55);

      ctx.fillStyle = "#F97316";
      ctx.font = "bold 13px Arial, system-ui, sans-serif";
      ctx.fillText("FEDERAL REPUBLIC OF NIGERIA • ALL PROGRESSIVES CONGRESS DRIVES", canvas.width / 2, 75);

      // Horizontal Divider Line in matching Green
      ctx.fillStyle = "#008751";
      ctx.fillRect(50, 92, canvas.width - 100, 3);

      // Main Left Header
      ctx.textAlign = "left";
      ctx.fillStyle = "#008751";
      ctx.font = "bold 20px Arial, system-ui, sans-serif";
      ctx.fillText("Applicant Information Summary", 50, 145);

      // Setup coordinates for technical descriptors list
      const tx = 50;
      let ty = 190;

      // Passport Frame Top Right Alignment
      const xp = 620;
      const yp = 145;
      const wp = 130;
      const hp = 150;

      if (currentUser.passportPhoto) {
        const img = new Image();
        img.onload = () => {
          try {
            ctx.drawImage(img, xp, yp, wp, hp);
            continueDrawing();
          } catch (e) {
            drawFallbackAvatar();
          }
        };
        img.onerror = () => {
          drawFallbackAvatar();
        };
        img.src = currentUser.passportPhoto;
      } else {
        drawFallbackAvatar();
      }

      function drawFallbackAvatar() {
        ctx.fillStyle = "#F1F5F9";
        ctx.fillRect(xp, yp, wp, hp);
        ctx.strokeStyle = "#CBD5E1";
        ctx.lineWidth = 1;
        ctx.strokeRect(xp, yp, wp, hp);

        ctx.fillStyle = "#94A3B8";
        ctx.beginPath();
        ctx.arc(xp + wp / 2, yp + hp / 2 - 15, 26, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(xp + wp / 2, yp + hp + 20, 50, Math.PI, 0);
        ctx.fill();

        ctx.fillStyle = "#475569";
        ctx.font = "bold 9px Arial, system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("PASSPORT PHOTO", xp + wp / 2, yp + hp - 15);
        continueDrawing();
      }

      function continueDrawing() {
        ctx.textAlign = "left";

        const formatDobText = (dobStr?: string) => {
          if (!dobStr) return "31 December 1997";
          try {
            const months = [
              "January", "February", "March", "April", "May", "June",
              "July", "August", "September", "October", "November", "December"
            ];
            const date = new Date(dobStr);
            if (isNaN(date.getTime())) return dobStr;
            return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
          } catch (e) {
            return dobStr || "31 December 1997";
          }
        };

        const appStateSymbol = (currentUser.state || "LA").substring(0, 2).toUpperCase();
        const shortId = (currentUser.id || "APP-401").split("-")[1]?.substring(0, 6).toUpperCase() || "94810";
        const applicantIdNum = `APC/FGN/${appStateSymbol}/${shortId}`;

        const docTypeLabel = currentUser.idType === "NIN" 
          ? "National Identification Number" 
          : (currentUser.idType || "National Identification Number");

        const details = [
          { label: "Applicant ID:", value: applicantIdNum },
          { label: "Full Name:", value: currentUser.fullName.toUpperCase() },
          { label: "Email:", value: currentUser.email.toLowerCase() },
          { label: "Gender:", value: currentUser.gender || "Male" },
          { label: "Date of Birth:", value: formatDobText(currentUser.dob) },
          { label: "State of Origin:", value: currentUser.state || "Anambra" },
          { label: "LGA of Origin:", value: currentUser.lga || "Nnewi-North" },
          { label: "Mobile Number:", value: currentUser.phone || "08146592675" },
          { label: "Home Address:", value: currentUser.homeAddress || "imt campus 1, independence layout enugu north, enugu" },
          { label: "Qualification:", value: currentUser.highestQualification || "N.D." },
          { label: "Qualification Year:", value: currentUser.yearAcquired || "2022" },
          { label: "School Name:", value: currentUser.schoolName || "Institute of Management and Technology Enugu" },
          { label: "Document Type:", value: docTypeLabel },
          { label: "Document Number:", value: currentUser.idNumber || "47902548769" },
          { label: "Examination Score:", value: examScoreValue !== null ? `${examScoreValue}% Marks` : "Awaiting Result" }
        ];

        details.forEach((det) => {
          // Key text (bold Green aligned on the left)
          ctx.fillStyle = "#008751";
          ctx.font = "bold 13px Arial, system-ui, sans-serif";
          ctx.fillText(det.label, 50, ty);

          // Value text (slate-800)
          ctx.fillStyle = "#1E293B";
          ctx.font = "normal 13px Arial, system-ui, sans-serif";

          const valText = det.value;
          const maxValueWidth = 380; // keep it within bounded columns cleanly

          if (ctx.measureText(valText).width > maxValueWidth) {
            const words = valText.split(" ");
            let line1 = "";
            let line2 = "";
            for (let w of words) {
              if (ctx.measureText(line1 + w + " ").width < maxValueWidth) {
                line1 += w + " ";
              } else {
                line2 += w + " ";
              }
            }
            ctx.fillText(line1.trim(), 230, ty);
            if (line2.trim()) {
              ty += 16;
              ctx.fillText(line2.trim(), 230, ty);
            }
          } else {
            ctx.fillText(valText, 230, ty);
          }

          ty += 25; // elegant layout line height
        });

        // Barcode Drawing Block
        ctx.strokeStyle = "#000000";
        ctx.fillStyle = "#000000";
        ctx.lineWidth = 1.5;
        let bx = 50;
        const by = ty + 15;
        const bh = 50;

        ctx.font = "bold 10px monospace";
        ctx.textAlign = "center";
        ctx.fillText(applicantIdNum, 170, by + bh + 15);

        ctx.textAlign = "left";
        for (let i = 0; i < 60; i++) {
          const w = (i % 3 === 0) ? 3.2 : (i % 2 === 0) ? 1.6 : 1.1;
          const space = (i % 4 === 0) ? 3.5 : (i % 3 === 0) ? 2 : 1.2;
          ctx.fillRect(bx, by, w, bh);
          bx += w + space;
        }

        // Notice Block Alerts matching reference image
        const noteY = by + bh + 45;
        if (examScoreValue === null) {
          ctx.fillStyle = "#DC2626"; // Note in red
          ctx.font = "bold 13px Arial, system-ui, sans-serif";
          ctx.fillText("NOTE: You have not yet taken your examination.", 50, noteY);

          ctx.fillStyle = "#4B5563"; // details
          ctx.font = "normal 12px Arial, system-ui, sans-serif";
          ctx.fillText("Please take your examination as soon as possible so that your application can be moved to the next stage.", 50, noteY + 20);
        } else {
          ctx.fillStyle = "#15803D"; // Note in green
          ctx.font = "bold 13px Arial, system-ui, sans-serif";
          ctx.fillText("NOTE: Assessment finished. Clearance eligibility has been achieved.", 50, noteY);

          ctx.fillStyle = "#4B5563"; // details
          ctx.font = "normal 12px Arial, system-ui, sans-serif";
          ctx.fillText("Your examination screening has been completed. Credentials have been verified and submitted for physical screening.", 50, noteY + 20);
        }

        // Centered Small Footer Text
        const now = new Date();
        const pad = (num: number) => num.toString().padStart(2, '0');
        const formattedGenDate = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} at ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

        ctx.fillStyle = "#9CA3AF"; // Gray text
        ctx.font = "normal 10px Arial, system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`Generated on ${formattedGenDate}`, canvas.width / 2, 1050);

        // Link and Trigger download
        const link = document.createElement("a");
        link.download = `APC_Grant_Application_Slip_${currentUser.fullName.replace(/\s+/g, "_")}.png`;
        link.href = canvas.toDataURL("image/png");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setDownloadingPdf(false);
      }
    } catch (err) {
      console.error(err);
      setDownloadingPdf(false);
    }
  };

  // CARD PASSPORT PHOTO STATES & HANDLERS
  const [idCameraActive, setIdCameraActive] = useState(false);
  const [idCameraStream, setIdCameraStream] = useState<MediaStream | null>(null);
  const [showPhotoModifier, setShowPhotoModifier] = useState(false);
  const [idPhotoScanning, setIdPhotoScanning] = useState(false);

  // USER PROFILE EDITING STATES & HANDLERS
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [profileName, setProfileName] = useState(currentUser.fullName);
  const [profilePhone, setProfilePhone] = useState(currentUser.phone);
  const [profileDob, setProfileDob] = useState(currentUser.dob);
  const [profileState, setProfileState] = useState(currentUser.state);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState("");
  const [profileErrorMsg, setProfileErrorMsg] = useState("");

  // Keep profile editor states in sync with current user state shifts
  useEffect(() => {
    setProfileName(currentUser.fullName);
    setProfilePhone(currentUser.phone);
    setProfileDob(currentUser.dob);
    setProfileState(currentUser.state);
  }, [currentUser.fullName, currentUser.phone, currentUser.dob, currentUser.state]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccessMsg("");
    setProfileErrorMsg("");

    if (!profileName.trim()) {
      setProfileErrorMsg("Citizen Full Name cannot be left blank.");
      return;
    }
    if (!profilePhone.trim()) {
      setProfileErrorMsg("Phone number is required for verification alerts.");
      return;
    }
    if (!profileDob) {
      setProfileErrorMsg("Please select a valid date of birth.");
      return;
    }

    // Calculate age automatically using dob and 2026-05-20 as current system time
    const birthDate = new Date(profileDob);
    const today = new Date("2026-05-20");
    let calAge = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      calAge--;
    }

    if (calAge < 17) {
      setProfileErrorMsg("Citizens must be aged 17 or above to be eligible for the grant.");
      return;
    }

    // Determine the corresponding grant allocation bracket and membership fee
    const matchedConfig = DEFAULT_GRANT_CONFIGS.find(
      config => calAge >= config.minAge && calAge <= config.maxAge
    ) || DEFAULT_GRANT_CONFIGS[DEFAULT_GRANT_CONFIGS.length - 1];

    const updatedUser = {
      ...currentUser,
      fullName: profileName.trim(),
      phone: profilePhone.trim(),
      dob: profileDob,
      age: calAge,
      state: profileState,
      // Synchronize grant configuration variables
      grantAmount: matchedConfig ? matchedConfig.grantAmount : currentUser.grantAmount,
      membershipFee: matchedConfig ? matchedConfig.membershipFee : currentUser.membershipFee
    };

    onUpdateUser(updatedUser);
    setProfileSuccessMsg("Citizen profile details updated successfully!");
    setTimeout(() => {
      setProfileSuccessMsg("");
    }, 4000);
  };

  const AVATAR_PRESETS = [
    {
      name: "Strategic Vanguard",
      url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120" fill="none"><rect width="100" height="120" fill="%230F172A"/><circle cx="50" cy="45" r="22" fill="%23008751"/><ellipse cx="50" cy="100" rx="35" ry="25" fill="%23D10000"/><circle cx="50" cy="42" r="16" fill="%23FFD3B6"/><ellipse cx="50" cy="98" rx="28" ry="18" fill="%23F8FAFC"/><rect x="42" y="80" width="16" height="24" fill="%23FFD3B6"/></svg>`
    },
    {
      name: "Democratic Leader",
      url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120" fill="none"><rect width="100" height="120" fill="%230B0F19"/><circle cx="50" cy="45" r="22" fill="%23D10000"/><ellipse cx="50" cy="100" rx="35" ry="25" fill="%23008751"/><circle cx="50" cy="42" r="16" fill="%23E2E8F0"/><ellipse cx="50" cy="98" rx="28" ry="18" fill="%2338BDF8"/><rect x="42" y="80" width="16" height="24" fill="%23E2E8F0"/></svg>`
    },
    {
      name: "Civic Planner",
      url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120" fill="none"><rect width="100" height="120" fill="%231E293B"/><circle cx="50" cy="45" r="22" fill="%23008751"/><ellipse cx="50" cy="100" rx="35" ry="25" fill="%23D10000"/><circle cx="50" cy="42" r="15" fill="%23E2E8F0"/><path d="M 38 43 L 50 25 L 62 43 Z" fill="%230F172A"/><ellipse cx="50" cy="98" rx="28" ry="18" fill="%23F1F5F9"/></svg>`
    },
    {
      name: "National Vanguard",
      url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120" fill="none"><rect width="100" height="120" fill="%23334155"/><circle cx="50" cy="42" r="16" fill="%23FFD3B6"/><ellipse cx="50" cy="96" rx="30" ry="20" fill="%231E40AF"/><path d="M 32 30 C 32 20, 68 20, 68 30 Z" fill="%231E293B"/></svg>`
    }
  ];

  const startIdCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      setIdCameraStream(stream);
      setIdCameraActive(true);
    } catch (err) {
      console.error("ID card camera access failed:", err);
      // Fallback
      setIdCameraActive(true);
    }
  };

  const stopIdCamera = () => {
    if (idCameraStream) {
      idCameraStream.getTracks().forEach(track => track.stop());
      setIdCameraStream(null);
    }
    setIdCameraActive(false);
  };

  const captureIdPhoto = () => {
    setIdPhotoScanning(true);
    setTimeout(() => {
      // Create offscreen canvas for webcam capture size
      const snapCanvas = document.createElement("canvas");
      snapCanvas.width = 300;
      snapCanvas.height = 360;
      const snapCtx = snapCanvas.getContext("2d");
      
      if (snapCtx) {
        // Find existing video tag if webcam was successfully mounted
        const videoElement = document.getElementById("id-webcam-video") as HTMLVideoElement | null;
        if (videoElement && idCameraStream) {
          try {
            snapCtx.drawImage(videoElement, 0, 0, 300, 360);
          } catch {
            drawBeautifulWebcamFallback(snapCtx);
          }
        } else {
          drawBeautifulWebcamFallback(snapCtx);
        }
        
        const capturedBase64 = snapCanvas.toDataURL("image/png");
        onUpdateUser({
          ...currentUser,
          faceVerificationImage: capturedBase64
        });
      }

      setIdPhotoScanning(false);
      stopIdCamera();
    }, 1500);
  };

  const drawBeautifulWebcamFallback = (ctx: CanvasRenderingContext2D) => {
    const w = 300;
    const h = 360;
    // Draw pretty background
    const gr = ctx.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, "#008751");
    gr.addColorStop(1, "#0A0F1D");
    ctx.fillStyle = gr;
    ctx.fillRect(0, 0, w, h);
    
    // Silhouette outline
    ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
    ctx.beginPath();
    ctx.arc(w / 2, h * 0.35, w * 0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(w / 2, h + 20, w * 0.45, Math.PI, Math.PI * 2);
    ctx.fill();

    // Verification security stamp watermark
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, w - 40, h - 40);
  };

  const drawEpicPresetPassport = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    portraitUrl: string
  ) => {
    // 1. Fill beautiful elegant local modern background with Light Blue sky tint
    const portraitGrad = ctx.createLinearGradient(x, y, x, y + h);
    portraitGrad.addColorStop(0, "#F0F9FF"); // light blue sky base
    portraitGrad.addColorStop(1, "#E0F2FE"); // sky gradient bottom
    ctx.fillStyle = portraitGrad;
    ctx.fillRect(x, y, w, h);

    // 2. Add gorgeous background circular starburst or rays in light blue
    ctx.strokeStyle = "rgba(0, 173, 239, 0.15)";
    ctx.lineWidth = 1;
    const cx = x + w / 2;
    const cy = y + h * 0.4;
    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 12) {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * w * 0.6, cy + Math.sin(angle) * h * 0.6);
      ctx.stroke();
    }

    // Draw a soft sun or halo behind the head
    const isRedTheme = portraitUrl.includes("fill='%23D10000'") || portraitUrl.includes("Democratic Leader") || portraitUrl.includes("Strategic Vanguard");
    ctx.fillStyle = isRedTheme ? "rgba(209, 0, 0, 0.08)" : "rgba(0, 173, 239, 0.08)";
    ctx.beginPath();
    ctx.arc(cx, cy, w * 0.35, 0, Math.PI * 2);
    ctx.fill();

    // 3. Draw human silhouette shoulders
    // Draw jacket/shoulder paths
    ctx.fillStyle = "#0F172A"; // elegant dark charcoal clothing
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.42, y + h);
    ctx.quadraticCurveTo(cx - w * 0.35, y + h * 0.65, cx - w * 0.15, y + h * 0.62);
    ctx.lineTo(cx + w * 0.15, y + h * 0.62);
    ctx.quadraticCurveTo(cx + w * 0.35, y + h * 0.65, cx + w * 0.42, y + h);
    ctx.closePath();
    ctx.fill();

    // Draw neck
    ctx.fillStyle = "#E2E8F0"; // sleek soft silhouette skin tone or neutral layout
    ctx.fillRect(cx - w * 0.1, y + h * 0.48, w * 0.2, h * 0.18);

    // Draw inner shirt collar (V-neck)
    ctx.fillStyle = "#FFFFFF"; // clean white collar
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.08, y + h * 0.62);
    ctx.lineTo(cx, y + h * 0.72);
    ctx.lineTo(cx + w * 0.08, y + h * 0.62);
    ctx.closePath();
    ctx.fill();

    // Draw elegant red or light blue tie/sash across shirt
    ctx.fillStyle = isRedTheme ? "#D10000" : "#00ADEF"; // Red or Light Blue tie
    ctx.beginPath();
    ctx.moveTo(cx - 6, y + h * 0.68);
    ctx.lineTo(cx + 6, y + h * 0.68);
    ctx.lineTo(cx + 10, y + h * 0.95);
    ctx.lineTo(cx - 10, y + h * 0.95);
    ctx.closePath();
    ctx.fill();

    // Draw modern circular graphic head
    ctx.fillStyle = "#CBD5E1"; // light modern grey head outline or clean mask outline
    ctx.beginPath();
    ctx.arc(cx, cy, w * 0.22, 0, Math.PI * 2);
    ctx.fill();

    // Draw a beautiful hair/cap silhouette on head
    ctx.fillStyle = "#1E293B"; // Dark slate hair
    if (portraitUrl.includes("Strategic Vanguard")) {
      // Draw cap
      ctx.beginPath();
      ctx.arc(cx, cy - 2, w * 0.22, Math.PI, 0);
      ctx.rect(cx - w * 0.22, cy - 10, w * 0.44, 8);
      ctx.fill();
    } else {
      // Draw classic sweep hair
      ctx.beginPath();
      ctx.arc(cx, cy - 4, w * 0.22, Math.PI * 1.15, Math.PI * 1.85);
      ctx.quadraticCurveTo(cx, cy - w * 0.3, cx - w * 0.22, cy - 4);
      ctx.closePath();
      ctx.fill();
    }

    // Add clean glass/glow lines inside portrait frame
    ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w * 0.35, y);
    ctx.lineTo(x, y + h * 0.35);
    ctx.closePath();
    ctx.fill();
  };

  const downloadIDCardPNG = async () => {
    setCardDownloading(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 640;
      canvas.height = 400;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // 1. Draw rounded card background slate colors (elegant classic white card)
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, 640, 400);

      // Subtle light blue and rose radial/linear gradient background glow 
      const bgGrad = ctx.createLinearGradient(0, 0, 640, 400);
      bgGrad.addColorStop(0, "#FFFFFF");
      bgGrad.addColorStop(0.5, "#F8FAFC");
      bgGrad.addColorStop(1, "#E0F2FE"); // beautiful light blue base
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 640, 400);

      // Classic security grid background pattern in low opacity Light Blue
      ctx.strokeStyle = "rgba(0, 173, 239, 0.05)";
      ctx.lineWidth = 1;
      for (let i = 0; i < 640; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 400);
        ctx.stroke();
      }
      for (let j = 0; j < 400; j += 20) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(640, j);
        ctx.stroke();
      }

      // --- Futuristic High-Tech/Digital Watermarks ---
      
      // Fine concentric light blue safety lines
      ctx.strokeStyle = "rgba(0, 173, 239, 0.06)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(480, 200, 180, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(480, 200, 140, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(480, 200, 70, 0, Math.PI * 2);
      ctx.stroke();

      // Digital micro-text background sequence
      ctx.fillStyle = "rgba(0, 173, 239, 0.12)";
      ctx.font = "bold 6.5px monospace";
      ctx.textAlign = "left";
      ctx.fillText("01010110 01000101 01010010 01001001 01000110 01001001 01000101 01000100", 225, 114);
      ctx.fillText("APC BIOMETRIC EMBEDDED CHAIN VERIFICATION // CLOUD INTERACTIVE REGISTER", 225, 303);
      ctx.fillText("NIMC VERIFIED IDENTITY APPLICANT // RENEWED HOPE GRANT CLEARING OK", 225, 314);

      // Guilloche safety wavy line patterns (representing standard bank/passport design specs)
      ctx.strokeStyle = "rgba(209, 0, 0, 0.035)"; // Super light red waving security band
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let wx = 40; wx <= 600; wx += 4) {
        const wy = 230 + Math.sin(wx * 0.02) * 12 + Math.cos(wx * 0.04) * 6;
        if (wx === 40) ctx.moveTo(wx, wy);
        else ctx.lineTo(wx, wy);
      }
      ctx.stroke();
      
      ctx.strokeStyle = "rgba(0, 173, 239, 0.05)"; // Super light blue waving security band
      ctx.beginPath();
      for (let wx = 40; wx <= 600; wx += 4) {
        const wy = 240 + Math.cos(wx * 0.02) * 12 + Math.sin(wx * 0.03) * 6;
        if (wx === 40) ctx.moveTo(wx, wy);
        else ctx.lineTo(wx, wy);
      }
      ctx.stroke();

      // 2. Dual Side Ribbon of Light Blue and Red representing national pride
      ctx.fillStyle = "#00ADEF"; // Light Blue vertical ribbon
      ctx.fillRect(15, 15, 12, 370);
      ctx.fillStyle = "#D10000"; // Red vertical ribbon
      ctx.fillRect(27, 15, 12, 370);

      // Draw top horizontal ribbon matching
      ctx.fillStyle = "#D10000"; // Red top ribbon
      ctx.fillRect(15, 15, 610, 8);
      ctx.fillStyle = "#00ADEF"; // Light Blue top ribbon band
      ctx.fillRect(15, 23, 610, 4);

      // 3. Draw APC Logo in the header
      const logoX = 90;
      const logoY = 65;
      const logoR = 24;
      
      ctx.save();
      ctx.beginPath();
      ctx.arc(logoX, logoY, logoR, 0, Math.PI * 2);
      ctx.clip();
      
      // Left vertical Green slice
      ctx.fillStyle = "#008751";
      ctx.fillRect(logoX - logoR, logoY - logoR, logoR, logoR * 1.3);
      // Middle vertical White slice
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(logoX, logoY - logoR, logoR * 0.45, logoR * 1.3);
      // Right vertical Blue slice
      ctx.fillStyle = "#00ADEF";
      ctx.fillRect(logoX + logoR * 0.45, logoY - logoR, logoR * 0.65, logoR * 1.3);
      // Lower Red banner
      ctx.fillStyle = "#D10000";
      ctx.fillRect(logoX - logoR, logoY + logoR * 0.3, logoR * 2, logoR * 0.85);
      
      // Text "APC"
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 11px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("APC", logoX, logoY + logoR * 0.8);

      // Broom bunch
      ctx.strokeStyle = "#8B5A2B";
      ctx.lineWidth = 1.2;
      ctx.fillStyle = "#D10000";
      ctx.beginPath();
      ctx.arc(logoX, logoY - 2, 2, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.beginPath();
      ctx.moveTo(logoX, logoY + 4);
      ctx.lineTo(logoX - 7, logoY - 12);
      ctx.moveTo(logoX, logoY + 4);
      ctx.lineTo(logoX, logoY - 14);
      ctx.moveTo(logoX, logoY + 4);
      ctx.lineTo(logoX + 7, logoY - 12);
      ctx.stroke();

      ctx.restore();

      // Logo sky-blue trim
      ctx.strokeStyle = "#00ADEF";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(logoX, logoY, logoR, 0, Math.PI * 2);
      ctx.stroke();

      // 4. Upper Header Placement (Elegant classic black and red typography)
      ctx.fillStyle = "#0F172A"; // Elegant deep charcoal 
      ctx.font = "900 16px system-ui, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("ALL PROGRESSIVES CONGRESS", 128, 56);

      ctx.fillStyle = "#D10000"; // Red highlight text
      ctx.font = "bold 9px monospace";
      ctx.fillText("NATIONAL EMPOWERMENT REGISTER • CIVIC REGISTERED MEMBER", 128, 73);

      // Top Modern Rounded Badge
      ctx.fillStyle = "#F0F9FF"; // Soft blue background
      ctx.strokeStyle = "#38BDF8"; // Light Blue border
      ctx.lineWidth = 1;
      const bX = 485;
      const bY = 40;
      const bW = 120;
      const bH = 26;
      const bR = 6;
      ctx.beginPath();
      ctx.moveTo(bX + bR, bY);
      ctx.lineTo(bX + bW - bR, bY);
      ctx.quadraticCurveTo(bX + bW, bY, bX + bW, bY + bR);
      ctx.lineTo(bX + bW, bY + bH - bR);
      ctx.quadraticCurveTo(bX + bW, bY + bH, bX + bW - bR, bY + bH);
      ctx.lineTo(bX + bR, bY + bH);
      ctx.quadraticCurveTo(bX, bY + bH, bX, bY + bH - bR);
      ctx.lineTo(bX, bY + bR);
      ctx.quadraticCurveTo(bX, bY, bX + bR, bY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#0284C7"; // Light Blue text
      ctx.font = "900 8.5px monospace";
      ctx.textAlign = "center";
      ctx.fillText("SECURE CITIZEN", bX + bW / 2, bY + 16);

      // Horizontal line divider
      ctx.strokeStyle = "rgba(0, 173, 239, 0.2)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(45, 100);
      ctx.lineTo(605, 100);
      ctx.stroke();

      // 5. User Profiles Row Draws with high contrast design mapping
      const textX = 225;
      const textY = 135;
      const gapY = 43;

      const profileParams = [
        { title: "CITIZEN FULL NAME", data: currentUser.fullName.toUpperCase(), hue: "#0F172A", style: "bold 13px system-ui, sans-serif" },
        { title: "MEMBERSHIP REGISTER ID", data: currentUser.membershipId || "APC-NG-000000", hue: "#0284C7", style: "bold 13px monospace" },
        { title: "COHORT AUDIT / STATE", data: `${currentUser.age} YEARS OLD / ${currentUser.state.toUpperCase()} STATE`, hue: "#1E293B", style: "bold 11px system-ui, sans-serif" },
        { title: "PLATFORM INTEGRITY STATUS", data: "APPROVED SECURITY RECORD • DIGITAL CHECK PASSED", hue: "#475569", style: "8px monospace" }
      ];

      profileParams.forEach((item, index) => {
        ctx.textAlign = "left";
        ctx.fillStyle = "#D10000"; // Red labels for beautiful high contrast
        ctx.font = "bold 7.5px monospace";
        ctx.fillText(item.title, textX, textY + index * gapY);

        ctx.fillStyle = item.hue;
        ctx.font = item.style;
        ctx.fillText(item.data, textX, textY + index * gapY + 16);
      });

      // 6. QR Code Draws with Light Blue background and frame outline
      const sz = 105;
      const qX = 490;
      const qY = 135;

      ctx.fillStyle = "#F8FAFC";
      ctx.strokeStyle = "rgba(0, 173, 239, 0.25)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(qX - 6, qY - 6, sz + 12, sz + 12, 8) : ctx.rect(qX - 6, qY - 6, sz + 12, sz + 12);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(qX, qY, sz, sz);
      
      ctx.fillStyle = "#0F172A";
      const drawFinder = (px: number, py: number) => {
        ctx.fillRect(px, py, 28, 28);
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(px + 4, py + 4, 20, 20);
        ctx.fillStyle = "#0F172A";
        ctx.fillRect(px + 8, py + 8, 12, 12);
      };

      drawFinder(qX + 6, qY + 6);
      drawFinder(qX + 71, qY + 6);
      drawFinder(qX + 6, qY + 71);

      ctx.fillStyle = "#0F172A";
      for (let r = 0; r < 21; r++) {
        for (let c = 0; c < 21; c++) {
          if ((r < 7 && c < 7) || (r < 7 && c > 13) || (r > 13 && c < 7)) continue;
          const seed = Math.sin(r * 12.9 + c * 78.2) * 43758;
          if ((seed - Math.floor(seed)) > 0.44) {
            ctx.fillRect(qX + 6 + c * 4.4, qY + 6 + r * 4.4, 4.4, 4.4);
          }
        }
      }

      ctx.fillStyle = "#F1F5F9";
      ctx.fillRect(qX + 6, qY + 93, 93, 9);
      ctx.fillStyle = "#D10000"; // Red Text for NIMC QR indication
      ctx.font = "900 6px monospace";
      ctx.textAlign = "center";
      ctx.fillText("NIMC QR AUDITED", qX + sz / 2, qY + 100);

      // 7. Red Bottom Secure Base Tape representing national emblem
      ctx.fillStyle = "#D10000";
      ctx.fillRect(15, 345, 610, 38);

      // Thin light blue topper band on ribbon
      ctx.fillStyle = "#00ADEF";
      ctx.fillRect(15, 345, 610, 3);

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "900 8.2px monospace";
      ctx.textAlign = "center";
      ctx.fillText("RENEWED HOPE NATIONAL SOCIAL EMPOWERMENT REGISTER", 320, 368);

      // 8. Load User Portrait image or procedural canvas preset silhouette
      const imgX = 55;
      const imgY = 120;
      const imgW = 135;
      const imgH = 180;

      const isSvgPreset = currentUser.faceVerificationImage && currentUser.faceVerificationImage.startsWith("data:image/svg+xml");

      if (isSvgPreset) {
        // Redraw preset completely using local context vectors, ensuring 0% canvas taint!
        drawEpicPresetPassport(ctx, imgX, imgY, imgW, imgH, currentUser.faceVerificationImage);
      } else if (currentUser.faceVerificationImage) {
        const img = new window.Image();
        // Base64 user images are fully safe. Let's add crossOrigin just in case
        img.crossOrigin = "anonymous";
        img.src = currentUser.faceVerificationImage;
        await new Promise<void>((resolve) => {
          img.onload = () => {
            ctx.save();
            ctx.beginPath();
            ctx.rect(imgX, imgY, imgW, imgH);
            ctx.clip();
            ctx.drawImage(img, imgX, imgY, imgW, imgH);
            ctx.restore();
            resolve();
          };
          img.onerror = () => {
            drawFallbackSilhouette(ctx, imgX, imgY, imgW, imgH);
            resolve();
          };
        });
      } else {
        drawFallbackSilhouette(ctx, imgX, imgY, imgW, imgH);
      }

      // Draw modern dual-colored border line for the passport portrait
      ctx.strokeStyle = "#38BDF8"; // Sky Blue outer ring
      ctx.lineWidth = 3.5;
      ctx.strokeRect(imgX, imgY, imgW, imgH);

      ctx.strokeStyle = "#D10000"; // Red inner safety line
      ctx.lineWidth = 1;
      ctx.strokeRect(imgX + 3.5, imgY + 3.5, imgW - 7, imgH - 7);

      // Corner Passport stamp in Light Blue / Red
      ctx.save();
      ctx.translate(imgX + 22, imgY + 14);
      ctx.rotate(-Math.PI / 12);
      ctx.fillStyle = "#D10000"; // Elegant red stamp background
      ctx.fillRect(-22, -8, 44, 14);
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 0.8;
      ctx.strokeRect(-22, -8, 44, 14);
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 6.5px monospace";
      ctx.textAlign = "center";
      ctx.fillText("APPROVED", 0, 1.5);
      ctx.restore();

      // Trigger automatic high quality PNG download
      const dUrl = canvas.toDataURL("image/png");
      const aElem = document.createElement("a");
      aElem.download = `APC_Membership_${currentUser.fullName.replace(/\s+/g, "_")}.png`;
      aElem.href = dUrl;
      document.body.appendChild(aElem);
      aElem.click();
      document.body.removeChild(aElem);
    } catch (err) {
      console.error("ID card image builder error:", err);
    } finally {
      setCardDownloading(false);
    }
  };

  const drawFallbackSilhouette = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
    const slGrad = ctx.createLinearGradient(x, y, x, y + h);
    slGrad.addColorStop(0, "#F0F9FF"); // Light Blue base
    slGrad.addColorStop(1, "#E0F2FE");
    ctx.fillStyle = slGrad;
    ctx.fillRect(x, y, w, h);

    // Silhouette neck/head outlines
    ctx.fillStyle = "rgba(0, 173, 239, 0.15)";
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h * 0.38, w * 0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h + 15, w * 0.45, Math.PI, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#D10000"; // Red text details
    ctx.font = "bold 8px monospace";
    ctx.textAlign = "center";
    ctx.fillText("PHOTO PORTRAIT", x + w / 2, y + h - 25);
    ctx.fillText("REQUIRED", x + w / 2, y + h - 14);
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

        // Capture a real snapshot selfie if webcam is active and video is playing
        let selfieBase64 = "";
        const videoElement = document.getElementById("biometric-webcam-video") as HTMLVideoElement | null;
        if (videoElement && cameraStream) {
          try {
            const snapCanvas = document.createElement("canvas");
            snapCanvas.width = 300;
            snapCanvas.height = 300;
            const snapCtx = snapCanvas.getContext("2d");
            if (snapCtx) {
              const vWidth = videoElement.videoWidth || 300;
              const vHeight = videoElement.videoHeight || 300;
              const size = Math.min(vWidth, vHeight);
              const xStart = (vWidth - size) / 2;
              const yStart = (vHeight - size) / 2;
              
              // Mirror the image to match standard selfie mirror view
              snapCtx.translate(300, 0);
              snapCtx.scale(-1, 1);
              
              snapCtx.drawImage(videoElement, xStart, yStart, size, size, 0, 0, 300, 300);
              selfieBase64 = snapCanvas.toDataURL("image/png");
            }
          } catch (err) {
            console.warn("Face biometric snapshot capture failed:", err);
          }
        }

        // Beautiful default fallback picture if stream capture failed or was mocked
        if (!selfieBase64) {
          selfieBase64 = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250&auto=format&fit=crop";
        }

        // Commit verified identity status to user state profile
        const updatedUser: UserType = {
          ...currentUser,
          ninVerified: true,
          faceVerified: true,
          faceVerificationScore: matchIndex,
          faceVerificationImage: selfieBase64
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

  // Process Direct Bank Transfer validation
  const handleValidatePaymentTransfers = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!senderAccountName.trim()) {
      alert("Please enter the sender's account name used for the transfer.");
      return;
    }
    if (!receiptImage && !receiptFileName) {
      alert("Please upload your payment transfer receipt.");
      return;
    }

    setValidationLoading(true);
    setTimeout(() => {
      setValidationLoading(false);
      
      const updatedUser: UserType = {
        ...currentUser,
        membershipStatus: "pending",
        transferAccountName: senderAccountName,
        transferReceiptImage: receiptImage || undefined,
      };
      
      onUpdateUser(updatedUser);
      setShowValidationPopup(true);
    }, 1500);
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
                { tab: "exam", label: "Examination Center", icon: Award },
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
                                {cameraStream ? (
                                  <video
                                    id="biometric-webcam-video"
                                    autoPlay
                                    playsInline
                                    muted
                                    ref={(el) => {
                                      if (el && cameraStream) {
                                        el.srcObject = cameraStream;
                                      }
                                    }}
                                    className="w-full h-full object-cover scale-x-[-1]"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center text-slate-500 text-[10px] space-y-1 p-4 text-center">
                                    <Camera className="w-6 h-6 text-emerald-500 animate-pulse" />
                                    <span className="font-mono text-[8px] text-emerald-500">BIOMETRIC FIELD ACQUIRED</span>
                                    <span className="text-slate-400">Position your face inside the bounding scope and secure room lighting</span>
                                  </div>
                                )}
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
                            
                            {currentUser.faceVerificationImage && (
                              <div className="pt-3 flex items-center space-x-3 border-t border-slate-100 mt-2">
                                <span className="font-mono text-[9px] text-slate-500">Captured Selfie Profile:</span>
                                <div className="relative">
                                  <img
                                    src={currentUser.faceVerificationImage}
                                    alt="Face verification selfie"
                                    className="w-10 h-10 rounded-full object-cover border-2 border-emerald-505 shadow-sm"
                                  />
                                  <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 border border-white">
                                    <Check className="w-2 h-2" />
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    onUpdateUser({
                                      ...currentUser,
                                      faceVerified: false,
                                      faceVerificationScore: undefined,
                                      faceVerificationImage: undefined
                                    });
                                  }}
                                  className="text-[9px] text-[#D10000] hover:text-[#b80000] underline uppercase tracking-tight font-mono font-bold cursor-pointer transition-colors ml-2"
                                >
                                  Retake Selfie
                                </button>
                              </div>
                            )}
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
                        <h3 className="text-lg font-black text-slate-900">Complete Examination Clearance to Access Funds</h3>
                        <p className="text-slate-600 text-xs leading-relaxed">
                          National safety protocols mandate the completion of a civic eligibility screening and associated smart remote-proctoring fee clearance. Settle your qualification-based fee to activate grading indexation servers, secure your profile biometrics, and permit direct bank withdrawals of your <strong>₦{currentUser.grantAmount.toLocaleString()}</strong> allocation.
                        </p>
                        <div className="flex items-center space-x-4 border-t border-slate-100 pt-3 text-[10px] text-slate-500 font-mono">
                          <span>Required Exam Fee: <strong className="text-[#008751] text-xs">₦{(currentUser.membershipFee || 2000).toLocaleString()}</strong></span>
                          <span>•</span>
                          <span>Audit level: High Priority</span>
                        </div>
                      </div>

                      <button
                        onClick={() => setActiveTab("exam")}
                        className="bg-[#008751] hover:bg-[#007345] text-white font-black px-6 py-3.5 rounded-xl shadow flex items-center space-x-1.5 flex-shrink-0 animate-pulse text-xs uppercase tracking-wide cursor-pointer"
                      >
                        <Award className="w-4 h-4" />
                        <span>Settle Fee & Take Exam</span>
                      </button>
                    </div>
                  )}

                  {/* DISPLAY MOUNTED APC CARD IF PAID */}
                  {currentUser.membershipStatus === "paid" && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                        
                        {/* Polished HTML APC Digital Identification card layout (Red, White, and Light Blue Classic Modern styling) */}
                        <div className="md:col-span-3 bg-white text-slate-900 border border-slate-200/80 rounded-3xl p-6 text-left relative overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500 group">
                          {/* Top ribbons representing national party values */}
                          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#D10000] z-20" />
                          <div className="absolute top-1.5 left-0 right-0 h-1 bg-[#00ADEF] z-20" />
                          
                          {/* Side security ribbons */}
                          <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-[#00ADEF] opacity-75 hidden sm:block z-20" />
                          <div className="absolute top-0 bottom-0 left-1.5 w-1 bg-[#D10000] opacity-75 hidden sm:block z-20" />

                          {/* 1. Cyber Dot Mesh Grid Layer */}
                          <div className="absolute inset-0 bg-[radial-gradient(#00ADEF18_1.2px,transparent_1.2px)] [background-size:14px_14px] pointer-events-none opacity-90 z-0" />
                          
                          {/* 2. Atmospheric Cyber Neon Gradients in Red and Light Blue */}
                          <div className="absolute -right-16 -top-16 w-80 h-80 bg-[#00ADEF]/8 rounded-full blur-3xl pointer-events-none z-0 mix-blend-multiply animate-pulse" />
                          <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-[#D10000]/4 rounded-full blur-3xl pointer-events-none z-0 mix-blend-multiply" />
                          
                          {/* 3. Holographic Security Wave lines (custom pure CSS/SVG layout) */}
                          <div className="absolute inset-x-0 bottom-12 h-16 pointer-events-none opacity-10 z-0 select-none">
                            <svg className="w-full h-full" viewBox="0 0 400 60" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M0,10 C150,55 250,5 400,35 L400,60 L0,60 Z" fill="none" stroke="#00ADEF" strokeWidth="1.2" />
                              <path d="M0,25 C120,5 280,45 400,10 L400,60 L0,60 Z" fill="none" stroke="#D10000" strokeWidth="0.8" />
                            </svg>
                          </div>

                          {/* 4. Binary floating background security data telemetry */}
                          <div className="absolute left-[34%] top-[24%] text-[5.5px] font-mono text-[#00ADEF]/20 tracking-wider pointer-events-none leading-relaxed select-none uppercase hidden sm:block z-0">
                            01010110 01000101 01010010 01001001 01000101 01000100 <br/>
                            APC NETWORK SECURITY CODE: #NG-282-99B <br/>
                            NIMC DATALINK ACCESS CHECK: COMPLETED STATUS STATUS_OK // 256-BIT SECURE
                          </div>

                          {/* Card Header styling */}
                          <div className="flex justify-between items-start border-b border-sky-100 pb-4 mb-4 mt-2 relative z-10 bg-white/60 backdrop-blur-[1px] p-2 rounded-xl">
                            <div className="flex items-center space-x-3">
                              <APCLogo className="w-10 h-10 shadow-md shrink-0 border-2 border-sky-100 rounded-full p-0.5 bg-white transition-transform duration-300 group-hover:scale-110" />
                              <div>
                                <h4 className="font-extrabold text-slate-950 text-xs tracking-tight">ALL PROGRESSIVES CONGRESS</h4>
                                <p className="text-[7.5px] text-[#D10000] font-sans font-black tracking-widest uppercase">NATIONAL EMPOWERMENT REGISTER</p>
                              </div>
                            </div>
                            <span className="bg-sky-50 text-[#0284C7] border border-sky-200 rounded-lg font-mono font-black text-[8px] px-2.5 py-0.5 shadow-sm">
                              SECURE CITIZEN
                            </span>
                          </div>

                          {/* Card body representing identity data with portrait photo */}
                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                            
                            {/* Passport Portrait Area */}
                            <div className="sm:col-span-4 flex justify-center">
                              <div className="relative w-24 h-32 bg-sky-50 rounded-xl overflow-hidden border-2 border-[#00ADEF] p-1 shadow-md hover:scale-103 transition-transform duration-300">
                                {currentUser.faceVerificationImage ? (
                                  <div className="w-full h-full rounded-lg overflow-hidden relative">
                                    <img 
                                      src={currentUser.faceVerificationImage} 
                                      alt="Citizen Portrait" 
                                      className="w-full h-full object-cover"
                                      referrerPolicy="no-referrer"
                                    />
                                    <div className="absolute inset-0 border border-[#D10000]/20 rounded-md pointer-events-none" />
                                  </div>
                                ) : (
                                  <div className="w-full h-full flex flex-col items-center justify-center text-sky-400 font-mono text-[8px] text-center p-2 bg-gradient-to-b from-sky-50 to-sky-100">
                                    <User className="w-8 h-8 text-sky-500 mb-1" />
                                    <span className="text-[#D10000] font-bold">NO PHOTO</span>
                                    <span className="text-[#D10000] font-bold">ASSIGNED</span>
                                  </div>
                                )}
                                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 bg-[#D10000] text-white text-[6.5px] font-black uppercase py-0.5 px-2 rounded-full shadow-sm animate-pulse whitespace-nowrap">
                                  APPROVED
                                </div>
                              </div>
                            </div>

                            {/* Text Info Columns */}
                            <div className="sm:col-span-5 space-y-2.5 font-sans text-left">
                              <div>
                                <p className="text-[7.5px] text-[#D10000] font-bold font-mono tracking-wider">CITIZEN FULL NAME</p>
                                <p className="text-slate-900 font-black tracking-wide uppercase text-xs truncate">{currentUser.fullName}</p>
                              </div>

                              <div>
                                <p className="text-[7.5px] text-[#D10000] font-bold font-mono tracking-wider">MEMBER REGISTER ID</p>
                                <p className="text-[#0284C7] font-black text-xs font-mono tracking-wider">{currentUser.membershipId}</p>
                              </div>

                              <div className="grid grid-cols-2 gap-1.5">
                                <div>
                                  <p className="text-[7.5px] text-[#D10000] font-bold font-mono tracking-wider">COHORT AGE</p>
                                  <p className="text-slate-700 font-bold text-[10px] truncate">{currentUser.age} Yrs old</p>
                                </div>
                                <div>
                                  <p className="text-[7.5px] text-[#D10000] font-bold font-mono tracking-wider">STATE FLAG</p>
                                  <p className="text-slate-700 font-extrabold text-[10px] uppercase truncate">{currentUser.state}</p>
                                </div>
                              </div>

                              <div className="pt-2 border-t border-sky-105 flex items-center space-x-1.5">
                                <ShieldCheck className="w-3.5 h-3.5 text-[#0284C7]" />
                                <span className="text-[7.5px] text-slate-500 font-bold font-mono">SECURE DIGITAL SYSTEM</span>
                              </div>
                            </div>

                            {/* Standard Verified QR to mimic NIMC auditing with Light Blue theme styling */}
                            <div className="sm:col-span-3 bg-slate-50 p-2 rounded-2xl border border-sky-100 flex flex-col items-center justify-center space-y-1 shrink-0 shadow-inner">
                              <QrCode className="w-12 h-12 text-slate-900" />
                              <span className="text-[6.5px] text-[#D10000] font-extrabold uppercase tracking-wider font-mono">NIMC SCAN ID</span>
                            </div>

                          </div>

                          {/* Footer with actions */}
                          <div className="mt-5 pt-3.5 border-t border-sky-100 flex justify-between items-center text-[10px] text-slate-500 font-mono">
                            <button
                              onClick={downloadIDCardPNG}
                              disabled={cardDownloading}
                              className="text-white hover:bg-sky-600 flex items-center space-x-1.5 font-bold bg-[#00ADEF] px-4 py-1.8 rounded-xl transition-all cursor-pointer shadow-sm active:scale-97"
                            >
                              <Download className="w-3.5 h-3.5 text-white" />
                              <span>{cardDownloading ? "Generating PNG..." : "Download Official ID"}</span>
                            </button>
                            <span className="text-[9px] font-black text-[#D10000]">RENEWED HOPE 2026</span>
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

                      {/* Customize Card Portrait Panel */}
                      <div className="bg-white border border-slate-200 rounded-3xl p-5 text-left shadow-sm">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-sm tracking-tight flex items-center gap-1.5">
                              <Camera className="w-4 h-4 text-[#008751]" />
                              Personalize ID Card Portrait Picture
                            </h4>
                            <p className="text-[11px] text-slate-500">Provide your custom picture to display inside the printable Membership ID.</p>
                          </div>
                          <button
                            onClick={() => setShowPhotoModifier(!showPhotoModifier)}
                            className="w-full sm:w-auto px-4 py-2 bg-[#008751]/10 hover:bg-[#008751]/20 text-[#008751] text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-1 shrink-0"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>{showPhotoModifier ? "Hide Portal Control" : "Toggle Portal Control"}</span>
                          </button>
                        </div>

                        <AnimatePresence>
                          {showPhotoModifier && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                                
                                {/* Camera & File Upload panel */}
                                <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-150">
                                  <h5 className="font-bold text-slate-800 text-[10.5px] uppercase tracking-wider font-mono">Upload File or Take Selfie</h5>
                                  
                                  <div className="flex flex-col sm:flex-row gap-3">
                                    {/* File Picker */}
                                    <label className="flex-1 bg-white hover:bg-slate-50 border border-dashed border-slate-300 rounded-xl p-4 text-center flex flex-col items-center justify-center cursor-pointer transition-colors">
                                      <Upload className="w-6 h-6 text-[#008751] mb-1.5" />
                                      <span className="text-[11px] font-bold text-slate-705">Select File</span>
                                      <span className="text-[8px] text-slate-400 mt-0.5">JPG / PNG files</span>
                                      <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                              onUpdateUser({
                                                ...currentUser,
                                                faceVerificationImage: reader.result as string
                                              });
                                            };
                                            reader.readAsDataURL(file);
                                          }
                                        }}
                                      />
                                    </label>

                                    {/* Camera Stream Widget */}
                                    {!idCameraActive ? (
                                      <button
                                        type="button"
                                        onClick={startIdCamera}
                                        className="flex-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center transition-colors cursor-pointer"
                                      >
                                        <Camera className="w-6 h-6 text-slate-500 mb-1.5" />
                                        <span className="text-[11px] font-bold text-slate-705">Webcam Live</span>
                                        <span className="text-[8px] text-slate-404 mt-0.5">Take snapshot</span>
                                      </button>
                                    ) : (
                                      <div className="flex-1 border border-[#008751]/20 rounded-xl p-3 bg-slate-900 text-center flex flex-col justify-between">
                                        <div className="w-full aspect-video bg-black rounded overflow-hidden relative flex items-center justify-center mb-2">
                                          {idCameraStream ? (
                                            <video
                                              id="id-webcam-video"
                                              autoPlay
                                              playsInline
                                              muted
                                              ref={(el) => {
                                                if (el && idCameraStream) {
                                                  el.srcObject = idCameraStream;
                                                }
                                              }}
                                              className="w-full h-full object-cover scale-x-[-1]"
                                            />
                                          ) : (
                                            <span className="text-[9px] text-emerald-500 animate-pulse font-mono flex items-center gap-1">
                                              <RefreshCw className="w-3 h-3 animate-spin" /> Preparing stream...
                                            </span>
                                          )}
                                        </div>
                                        <div className="flex gap-2 w-full">
                                          <button
                                            type="button"
                                            onClick={captureIdPhoto}
                                            disabled={idPhotoScanning}
                                            className="flex-1 bg-[#008751] hover:bg-[#007345] text-white text-[9px] font-bold py-1.5 rounded uppercase cursor-pointer"
                                          >
                                            {idPhotoScanning ? "Snapping..." : "Capture"}
                                          </button>
                                          <button
                                            type="button"
                                            onClick={stopIdCamera}
                                            className="bg-slate-700 hover:bg-slate-600 text-white text-[9px] font-bold py-1.5 px-3 rounded uppercase cursor-pointer"
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Smart Presets Widget */}
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150 flex flex-col justify-between space-y-3">
                                  <div>
                                    <h5 className="font-bold text-slate-850 text-[10.5px] uppercase tracking-wider font-mono">Select Civic Avatar Preset</h5>
                                    <p className="text-[10px] text-slate-500 leading-normal mt-0.5">Choose a pre-assembled highly polished citizen avatar profile if you do not wish to share your face.</p>
                                  </div>

                                  <div className="grid grid-cols-2 gap-2">
                                    {AVATAR_PRESETS.map((preset, idx) => (
                                      <button
                                        key={idx}
                                        type="button"
                                        onClick={() => {
                                          onUpdateUser({
                                            ...currentUser,
                                            faceVerificationImage: preset.url
                                          });
                                        }}
                                        className="flex items-center space-x-2 bg-white hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-250 p-2 rounded-xl text-left scale-100 active:scale-95 transition-all cursor-pointer shadow-xs"
                                      >
                                        <img
                                          src={preset.url}
                                          alt={preset.name}
                                          className="w-8 h-10 rounded bg-slate-100 shrink-0 border border-slate-200"
                                          referrerPolicy="no-referrer"
                                        />
                                        <div>
                                          <p className="text-[9px] font-extrabold text-slate-800 leading-none">{preset.name}</p>
                                          <p className="text-[7.5px] text-slate-400 font-mono mt-0.5">Use Preset</p>
                                        </div>
                                      </button>
                                    ))}
                                  </div>
                                </div>

                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Edit Citizen Profile Section */}
                      <div className="bg-white border border-slate-200 rounded-3xl p-5 text-left shadow-sm">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-sm tracking-tight flex items-center gap-1.5">
                              <User className="w-4 h-4 text-[#008751]" />
                              Edit Citizen Profile Details
                            </h4>
                            <p className="text-[11px] text-slate-500">Update your official full name, contact phone number, date of birth, and state of origin.</p>
                          </div>
                          <button
                            onClick={() => setShowProfileEdit(!showProfileEdit)}
                            className="w-full sm:w-auto px-4 py-2 bg-[#008751]/10 hover:bg-[#008751]/20 text-[#008751] text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-1 shrink-0"
                          >
                            <User className="w-3.5 h-3.5" />
                            <span>{showProfileEdit ? "Close Profile Form" : "Manage Profile Details"}</span>
                          </button>
                        </div>

                        <AnimatePresence>
                          {showProfileEdit && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                            >
                              <form onSubmit={handleSaveProfile} className="space-y-4 pt-1">
                                {profileErrorMsg && (
                                  <div className="p-3 bg-red-50 border border-red-200 text-[#D10000] rounded-xl text-xs font-semibold">
                                    {profileErrorMsg}
                                  </div>
                                )}
                                {profileSuccessMsg && (
                                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-[#008751] rounded-xl text-xs font-bold">
                                    {profileSuccessMsg}
                                  </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {/* Full name input */}
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 font-mono">
                                      Citizen Full Name
                                    </label>
                                    <input
                                      type="text"
                                      value={profileName}
                                      onChange={(e) => setProfileName(e.target.value)}
                                      placeholder="e.g. Ibrahim Musa"
                                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-slate-900 font-sans focus:outline-none focus:border-[#008751] text-xs transition-colors"
                                    />
                                    <p className="text-[9px] text-slate-400 mt-1">Must match the registered name on your commercial bank account.</p>
                                  </div>

                                  {/* Phone number input */}
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 font-mono">
                                      Phone Number
                                    </label>
                                    <input
                                      type="text"
                                      value={profilePhone}
                                      onChange={(e) => setProfilePhone(e.target.value)}
                                      placeholder="e.g. +234 803 123 4567"
                                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-slate-900 font-mono focus:outline-none focus:border-[#008751] text-xs transition-colors"
                                    />
                                    <p className="text-[9px] text-slate-400 mt-1">Required for real-time disbursement SMS and verification status alerts.</p>
                                  </div>

                                  {/* Date of Birth input */}
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 font-mono">
                                      Date of Birth
                                    </label>
                                    <input
                                      type="date"
                                      value={profileDob}
                                      onChange={(e) => setProfileDob(e.target.value)}
                                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-slate-900 font-mono focus:outline-none focus:border-[#008751] text-xs transition-colors"
                                    />
                                    <p className="text-[9px] text-slate-400 mt-1">Determines your age bracket. Grants are calibrated automatically according to your age.</p>
                                  </div>

                                  {/* State origin selection */}
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 font-mono">
                                      State of Origin / Residence
                                    </label>
                                    <select
                                      value={profileState}
                                      onChange={(e) => setProfileState(e.target.value)}
                                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-slate-900 font-sans focus:outline-none focus:border-[#008751] text-xs transition-colors"
                                    >
                                      {NIGERIAN_STATES.map((state) => (
                                        <option key={state} value={state}>
                                          {state}
                                        </option>
                                      ))}
                                    </select>
                                    <p className="text-[9px] text-slate-400 mt-1">Your registered state represents the jurisdiction of fund dispersal.</p>
                                  </div>
                                </div>

                                <div className="flex justify-end pt-2">
                                  <button
                                    type="submit"
                                    className="px-5 py-2.5 bg-[#008751] hover:bg-[#007345] text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-97 cursor-pointer"
                                  >
                                    Save Profile Changes
                                  </button>
                               </div>
                              </form>
                            </motion.div>
                          )}
                        </AnimatePresence>
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

              {/* TAB: EXAMINATION CENTER & SLIP DESK */}
              {activeTab === "exam" && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6 text-left"
                >
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                    {/* TOP TEXT */}
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-[#008751] flex items-center justify-center text-white shrink-0">
                        <Award className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-tight leading-normal mb-1">
                          take your examinaation so your application can proceed
                        </h3>
                        <p className="text-[11px] text-slate-500 leading-normal">
                          All registered citizens must take this screening test. Once completed, your application score will show, and your official grant clearing slip will be updated.
                        </p>
                      </div>
                    </div>

                    {/* QUIZ ENGINE AND STATUS */}
                    {currentUser.membershipStatus !== "paid" ? (
                      <div className="border border-slate-200 rounded-xl p-6 bg-slate-50 space-y-6">
                        {!examPayStage ? (
                          /* PHASE 1: EMAIL VERIFICATION SCREEN */
                          <div className="space-y-4 text-center py-4">
                            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-emerald-600">
                              <User className="w-6 h-6" />
                            </div>
                            <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wide">
                              Phase 1: Registered Identity Check
                            </h3>
                            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                              Under the social safety guidelines, candidate examinations and smart live proctoring require immediate ID validation. Please paste your registered email below to proceed.
                            </p>

                            <div className="max-w-md mx-auto space-y-3 mt-2 font-sans">
                              {emailVerifyError && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs font-bold text-center">
                                  {emailVerifyError}
                                </div>
                              )}
                              <div className="flex flex-col text-left space-y-1">
                                <label className="text-[10px] font-bold uppercase text-slate-400 font-mono">Registered Email Address</label>
                                <input
                                  type="email"
                                  value={verifyEmailInput}
                                  onChange={(e) => {
                                    setVerifyEmailInput(e.target.value);
                                    setEmailVerifyError(null);
                                  }}
                                  placeholder="Enter your registered email"
                                  className="w-full bg-white border border-slate-300 rounded-lg px-4.5 py-3 text-xs focus:ring-1 focus:ring-[#008751] focus:border-[#008751] outline-none transition"
                                />
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  if (!verifyEmailInput.trim()) {
                                    setEmailVerifyError("Error: Registered email address is required.");
                                    return;
                                  }
                                  if (verifyEmailInput.trim().toLowerCase() !== currentUser.email.toLowerCase()) {
                                    setEmailVerifyError("Error: The entered email does not match your registered citizenship profile. Please try again.");
                                    return;
                                  }
                                  setExamPayStage(true);
                                }}
                                className="w-full py-3 bg-[#008751] hover:bg-[#007345] text-white font-black rounded-lg text-xs shadow transition-all cursor-pointer uppercase tracking-wider"
                              >
                                Next Step
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* PHASE 2: ASSESSMENT CLEARANCE (PAYMENT SCREEN) */
                          <div className="space-y-6">
                            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                              <button
                                type="button"
                                onClick={() => setExamPayStage(false)}
                                className="text-slate-500 hover:text-slate-800 text-xs font-bold flex items-center space-x-1"
                              >
                                <span>← Back to Identity Check</span>
                              </button>
                              <span className="bg-[#008751]/10 text-[#008751] text-[10px] font-bold font-mono px-2 py-0.5 rounded-full uppercase">
                                Phase 2: Payment Gateway
                              </span>
                            </div>

                            <div className="space-y-4">
                              <h4 className="font-extrabold text-[#008751] text-xs uppercase tracking-wide">
                                Examination Proctoring & Setup Fee Statement
                              </h4>
                              <p className="text-xs text-slate-500 leading-relaxed">
                                Under the social safety framework, your unique examination access fee is calculated based on your Highest Scholastic Qualification. Minimum qualification of F.S.C.L is required to unlock examinations.
                              </p>

                              <div className="bg-white border border-slate-200 rounded-xl p-4.5 space-y-2.5">
                                <div className="flex justify-between items-center text-xs text-slate-500 border-b border-slate-100 pb-2">
                                  <span>Applicant Name:</span>
                                  <strong className="text-slate-800 uppercase font-bold">{currentUser.fullName}</strong>
                                </div>
                                <div className="flex justify-between items-center text-xs text-slate-500 border-b border-slate-100 pb-2">
                                  <span>Academic Qualification:</span>
                                  <strong className="text-slate-800 uppercase font-black">{currentUser.highestQualification || "S.S.C.E"}</strong>
                                </div>
                                <div className="flex justify-between items-center text-xs text-slate-500 border-b border-slate-100 pb-2">
                                  <span>Approved Cohort Disbursement:</span>
                                  <strong className="text-[#008751] font-extrabold">₦{(currentUser.grantAmount || 180000).toLocaleString()}</strong>
                                </div>
                                <div className="flex justify-between items-center text-xs text-slate-500 pt-1">
                                  <span className="font-bold text-slate-700">Exam Setup & Proctoring Fee:</span>
                                  <strong className="text-[#008751] font-black text-sm">₦{(currentUser.membershipFee || 2000).toLocaleString()}</strong>
                                </div>
                              </div>

                              {/* Interactive Payment Gateway Box */}
                              <div className="bg-white border border-slate-200 rounded-xl p-4.5 relative space-y-4">
                                <p className="text-[10px] font-bold uppercase text-slate-400 font-mono tracking-wider">Select Payment Protocol</p>
                                <div className="grid grid-cols-4 gap-2">
                                  {(["card", "bank_transfer", "ussd", "wallet"] as const).map((method) => (
                                    <button
                                      key={method}
                                      type="button"
                                      onClick={() => setPaymentMethod(method)}
                                      className={`p-2.5 border rounded-lg text-center text-[10px] font-black uppercase transition-all whitespace-nowrap cursor-pointer ${
                                        paymentMethod === method
                                          ? "border-[#008751] bg-[#008751]/5 text-[#008751]"
                                          : "border-slate-200 hover:bg-slate-50 text-slate-500"
                                      }`}
                                    >
                                      {method.replace("_", " ")}
                                    </button>
                                  ))}
                                </div>

                                {paymentMethod === "card" && (
                                  <div className="space-y-3 pt-2">
                                    <div className="flex flex-col text-left space-y-1">
                                      <label className="text-[9px] font-bold text-slate-400 font-mono uppercase">Standard Debit Card Number</label>
                                      <input
                                        type="text"
                                        maxLength={19}
                                        placeholder="5399 2145 7780 1204"
                                        value={cardNumber}
                                        onChange={(e) => setCardNumber(e.target.value)}
                                        className="w-full bg-slate-50 text-slate-800 border-slate-200 rounded p-2 text-xs focus:ring-1 focus:ring-[#008751] outline-none"
                                      />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                      <div className="flex flex-col text-left space-y-1">
                                        <label className="text-[9px] font-bold text-slate-400 font-mono uppercase">Expiry Month/Yr</label>
                                        <input
                                          type="text"
                                          placeholder="MM/YY"
                                          maxLength={5}
                                          value={cardExpiry}
                                          onChange={(e) => setCardExpiry(e.target.value)}
                                          className="bg-slate-50 text-slate-800 border-slate-200 rounded p-2 text-xs focus:ring-1 focus:ring-[#008751] outline-none"
                                        />
                                      </div>
                                      <div className="flex flex-col text-left space-y-1">
                                        <label className="text-[9px] font-bold text-slate-400 font-mono uppercase">CVV Security Code</label>
                                        <input
                                          type="password"
                                          maxLength={3}
                                          placeholder="***"
                                          value={cardCvv}
                                          onChange={(e) => setCardCvv(e.target.value)}
                                          className="bg-slate-50 text-slate-800 border-slate-200 rounded p-2 text-xs focus:ring-1 focus:ring-[#008751] outline-none"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {paymentMethod === "bank_transfer" && (
                                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs text-slate-600">
                                    <p className="font-bold text-slate-800">Direct Paystack FGN Settlement Pool:</p>
                                    <p>Bank: <strong className="text-slate-800 font-mono">Providus Bank</strong></p>
                                    <p>Account Number: <strong className="text-slate-800 font-mono text-sm">9047192837</strong></p>
                                    <p>Recipient: <strong className="text-[#008751] font-mono">APC GRANTS PROCTOR SETTLEMENTS</strong></p>
                                    <p className="text-[10px] text-slate-400 italic font-mono pt-1">Transfer the exact fee amount. Smart proctor links synchronize automatically within minutes.</p>
                                  </div>
                                )}

                                {paymentMethod === "ussd" && (
                                  <div className="space-y-2 text-xs col-span-4 text-left">
                                    <label className="text-[9px] font-bold text-slate-400 font-mono uppercase">Select Institution Code</label>
                                    <select
                                      value={ussdBank}
                                      onChange={(e) => setUssdBank(e.target.value)}
                                      className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs focus:ring-1 focus:ring-[#008751]"
                                    >
                                      <option value="">-- Choose Bank --</option>
                                      <option value="gt">GTBank (*737*)</option>
                                      <option value="access">Access Bank (*901*)</option>
                                      <option value="zenith">Zenith Bank (*966*)</option>
                                      <option value="uba">UBA Bank (*919*)</option>
                                    </select>
                                    {ussdBank && (
                                      <div className="p-3 bg-amber-50 text-amber-800 rounded font-mono text-center text-xs font-bold leading-normal border border-amber-200">
                                        Dial: <span className="underline select-all">*966*000*8471#</span> to process payment securely.
                                      </div>
                                    )}
                                  </div>
                                )}

                                {paymentMethod === "wallet" && (
                                  <div className="flex flex-col text-left space-y-1">
                                    <label className="text-[9px] font-bold text-slate-400 font-mono uppercase">OPay or PalmPay Registered Number</label>
                                    <input
                                      type="text"
                                      placeholder="08146592675"
                                      value={mobileWalletNumber}
                                      onChange={(e) => setMobileWalletNumber(e.target.value)}
                                      className="bg-slate-50 text-slate-800 border-slate-200 rounded p-2 text-xs focus:ring-1 focus:ring-[#008751] outline-none col-span-4"
                                    />
                                  </div>
                                )}

                                <button
                                  type="button"
                                  disabled={paymentLoading}
                                  onClick={() => {
                                    setPaymentLoading(true);
                                    setTimeout(() => {
                                      setPaymentLoading(false);
                                      const updated = {
                                        ...currentUser,
                                        membershipStatus: "paid" as const
                                      };
                                      onUpdateUser(updated);
                                      const successToast = document.createElement("div");
                                      successToast.className = "fixed bottom-5 right-5 z-50 bg-[#008751] text-white px-5 py-3 rounded-xl shadow-lg border border-[#006f40] text-xs font-bold flex items-center space-x-2 animate-bounce";
                                      successToast.innerHTML = `<span>✓ Exam Access Token Activated successfully! Settle in, your exam environment is fully loaded.</span>`;
                                      document.body.appendChild(successToast);
                                      setTimeout(() => successToast.remove(), 4000);
                                    }, 2000);
                                  }}
                                  className="w-full py-3 bg-[#008751] hover:bg-[#007345] text-white font-extrabold rounded-lg text-xs shadow cursor-pointer transition uppercase tracking-wider flex items-center justify-center space-x-2"
                                >
                                  {paymentLoading ? (
                                    <>
                                      <div className="w-4.5 h-4.5 border-2 border-white/25 border-t-white rounded-full animate-spin" />
                                      <span>Initializing Flutterwave Secure checkout...</span>
                                    </>
                                  ) : (
                                    <>
                                      <CreditCard className="w-4 h-4" />
                                      <span>Complete Proctor Verification (Pay ₦{(currentUser.membershipFee || 2000).toLocaleString()})</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* PAID QUIZ WORKFLOW */
                      <>
                        {examState === "not_started" && (
                          <div className="border border-dashed border-slate-300 rounded-xl p-6 text-center bg-slate-50 space-y-4 font-sans">
                            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-emerald-600">
                              <BookOpen className="w-6 h-6" />
                            </div>
                            <h4 className="font-bold text-slate-900 text-xs uppercase font-mono tracking-wider">Citizenship Eligibility Test (4 Questions)</h4>
                            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                              This test validates your basic comprehension of Nigerian civic parameters. It takes less than 2 minutes. Click below to initialize.
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setExamState("testing");
                                setQuizQuestionIndex(0);
                                setQuizAnswers([]);
                                localStorage.setItem(`apc_exam_state_${currentUser.id}`, "testing");
                              }}
                              className="px-6 py-2.5 bg-[#008751] hover:bg-[#007345] text-white font-extrabold rounded-lg text-xs shadow-md cursor-pointer transition-all uppercase tracking-wide"
                            >
                              Initialize Test Environment
                            </button>
                          </div>
                        )}

                        {examState === "testing" && (
                          <div className="border border-slate-200 rounded-xl p-5 bg-slate-50 relative space-y-4">
                            <div className="flex justify-between items-center bg-white px-3 py-1.5 rounded border border-slate-100">
                              <span className="text-[9.5px] font-mono text-slate-500 font-bold uppercase">
                                Question {quizQuestionIndex + 1} of {QUIZ_QUESTIONS.length}
                              </span>
                              <span className="text-[10px] font-mono font-black text-emerald-600 flex items-center space-x-1 animate-pulse">
                                <span>⏱ Smart Proctor Active</span>
                              </span>
                            </div>

                            <div className="space-y-4">
                              <p className="font-bold text-slate-800 text-xs">
                                {QUIZ_QUESTIONS[quizQuestionIndex].q}
                              </p>

                              <div className="grid grid-cols-1 gap-2.5">
                                {QUIZ_QUESTIONS[quizQuestionIndex].options.map((opt) => {
                                  const isSelected = quizAnswers[quizQuestionIndex] === opt;
                                  return (
                                    <button
                                      type="button"
                                      key={opt}
                                      onClick={() => {
                                        const updated = [...quizAnswers];
                                        updated[quizQuestionIndex] = opt;
                                        setQuizAnswers(updated);
                                      }}
                                      className={`w-full text-left p-3 rounded-lg border text-xs font-medium cursor-pointer transition-all ${
                                        isSelected
                                          ? "bg-[#008751] text-white border-[#008751] font-extrabold"
                                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
                                      }`}
                                    >
                                      {opt}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            <div className="flex justify-between items-center border-t border-slate-200 pt-3">
                              {quizQuestionIndex > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setQuizQuestionIndex(prev => prev - 1)}
                                  className="px-3 py-1.5 bg-white border border-slate-300 rounded text-[11px] font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                                >
                                  Prev
                                </button>
                              )}
                              
                              {quizQuestionIndex < QUIZ_QUESTIONS.length - 1 ? (
                                <button
                                  type="button"
                                  disabled={!quizAnswers[quizQuestionIndex]}
                                  onClick={() => setQuizQuestionIndex(prev => prev + 1)}
                                  className="ml-auto px-4 py-1.5 bg-[#008751] hover:bg-[#007345] text-white rounded text-[11px] font-black cursor-pointer disabled:opacity-40"
                                >
                                  Next Question
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  disabled={!quizAnswers[quizQuestionIndex]}
                                  onClick={() => {
                                    setExamState("grading");
                                    localStorage.setItem(`apc_exam_state_${currentUser.id}`, "grading");
                                    setTimeout(() => {
                                      let correctCount = 0;
                                      QUIZ_QUESTIONS.forEach((q, idx) => {
                                        if (quizAnswers[idx] === q.correct) {
                                          correctCount++;
                                        }
                                      });
                                      const finalScore = Math.round((correctCount / QUIZ_QUESTIONS.length) * 100);
                                      setExamScoreValue(finalScore);
                                      setExamState("submitted");
                                      localStorage.setItem(`apc_exam_state_${currentUser.id}`, "submitted");
                                      localStorage.setItem(`apc_exam_score_${currentUser.id}`, finalScore.toString());
                                    }, 1500);
                                  }}
                                  className="ml-auto px-5 py-2 bg-[#008751] hover:bg-[#007345] text-white rounded text-[11px] font-black tracking-wide uppercase shadow cursor-pointer disabled:opacity-40"
                                >
                                  Submit Exam Answers
                                </button>
                              )}
                            </div>
                          </div>
                        )}

                        {examState === "grading" && (
                          <div className="border border-slate-200 rounded-xl p-8 bg-slate-50 text-center space-y-4 animate-pulse">
                            <div className="w-8 h-8 border-3 border-[#008751]/20 border-t-[#008751] rounded-full animate-spin mx-auto" />
                            <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-widest font-mono">Grading Examination Script...</h4>
                            <p className="text-[10px] text-slate-500">Connecting social liaison server nodes to register biometrics scores.</p>
                          </div>
                        )}

                        {examState === "submitted" && (
                          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center space-y-3 font-sans animate-fade-in">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-[#008751] text-sm font-black">
                              ✓
                            </div>
                            <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wide">Screening Assessment Submitted!</h4>
                            <p className="text-[11px] text-slate-600 leading-relaxed max-w-sm mx-auto">
                              Eligibility screening validated successfully. Your scores have been assigned. See credentials below.
                            </p>
                          </div>
                        )}
                      </>
                    )}

                    {/* OFFICIAL APPLICATION SLIP DISPLAY CARD (With Passport details) */}
                    <div id="applicant-examination-slip" className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm text-xs font-sans">
                      <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <APCLogo className="w-8 h-8" />
                          <div className="text-left">
                            <h4 className="font-black text-[11px] uppercase tracking-wide leading-none">FEDERAL REPUBLIC OF NIGERIA</h4>
                            <span className="text-[8.5px] text-emerald-400 font-mono font-bold uppercase tracking-widest block mt-1">National Social Grant File Slip</span>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <span className="bg-[#008751]/20 text-[#008751] border border-[#008751]/35 px-1.5 py-0.5 rounded text-[9px] font-mono uppercase font-black">
                            STATUS: REGISTERED
                          </span>
                        </div>
                      </div>

                      <div className="p-5 bg-white grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                        {/* LEFT: Passport Section */}
                        <div className="md:col-span-3 flex flex-col items-center space-y-2 shrink-0">
                          <div className="w-32 h-36 bg-slate-50 border border-slate-300 rounded-xl p-1 shrink-0 overflow-hidden shadow-sm">
                            {currentUser.passportPhoto ? (
                              <img
                                src={currentUser.passportPhoto}
                                alt="Applicant Passport"
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center text-slate-400">
                                <User className="w-8 h-8" />
                                <span className="text-[8px] font-bold font-mono uppercase mt-1">NO PHOTO</span>
                              </div>
                            )}
                          </div>
                          <span className="text-[8.5px] text-slate-400 font-mono uppercase font-black">Official Passport</span>
                        </div>

                        {/* RIGHT: Citizen bio details */}
                        <div className="md:col-span-9 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 font-medium text-slate-700 text-left">
                          <div>
                            <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider block font-mono">APPLICATION NUMBER:</span>
                            <span className="font-black text-slate-900 font-mono text-xs">
                              APC/FGN/{(currentUser.state || "LA").substring(0, 2).toUpperCase()}/{(currentUser.id || "APP-401").split("-")[1]?.substring(0, 6).toUpperCase() || "94810"}
                            </span>
                          </div>

                          <div>
                            <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider block font-mono">STATE OF ORIGIN:</span>
                            <span className="font-extrabold text-slate-900 text-xs">{currentUser.state}</span>
                          </div>

                          <div>
                            <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider block font-mono">LOCAL GOVERNMENT AREA:</span>
                            <span className="font-extrabold text-slate-900 text-xs">{currentUser.lga || "Secretariat South"}</span>
                          </div>

                          <div>
                            <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider block font-mono">GENDER SPECIFICATION:</span>
                            <span className="font-extrabold text-slate-900 text-xs">{currentUser.gender || "Not Indicated"}</span>
                          </div>

                          <div>
                            <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider block font-mono">CALCULATED AGE STATUS:</span>
                            <span className="font-extrabold text-slate-900 text-xs">{currentUser.age} YEARS OLD</span>
                          </div>

                          <div>
                            <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider block font-mono">COHORT BRACKET:</span>
                            <span className="text-[#008751] font-black text-xs font-mono">₦{(currentUser.grantAmount || 180000).toLocaleString()} OUTREACH ALLOC</span>
                          </div>
                        </div>
                      </div>

                      {/* ASSESSMENT STATS DIVIDER */}
                      <div className="border-t border-slate-150 p-4 bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4 text-left">
                        {/* SCORE AND STATUS LABELS */}
                        <div>
                          <p className="text-[9px] text-slate-400 uppercase font-mono tracking-wide font-black">examination score</p>
                          <p className="text-sm font-extrabold text-slate-900 mt-0.5 font-mono">
                            {examScoreValue !== null ? `${examScoreValue}% Marks` : "Awaiting Result"}
                          </p>
                        </div>

                        <div>
                          <p className="text-[9px] text-slate-400 uppercase font-mono tracking-wide font-black">Clearing Status</p>
                          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-700 text-[10px] font-black font-mono mt-0.5 uppercase tracking-wide">
                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping shrink-0" />
                            <span>awaiting result</span>
                          </span>
                        </div>

                        {/* PDF DOWNLOAD BUTTON */}
                        <button
                          type="button"
                          id="pdf-download-btn"
                          disabled={downloadingPdf}
                          onClick={handleDownloadApplicationPDF}
                          className="w-full sm:w-auto px-4.5 py-2.5 bg-[#008751] hover:bg-[#007345] text-white font-black text-xs rounded-xl flex items-center justify-center space-x-1.5 shadow-sm hover:shadow active:scale-97 cursor-pointer transition-all disabled:opacity-50"
                        >
                          {downloadingPdf ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin shrink-0" />
                              <span>Generating PDF Document Slip...</span>
                            </>
                          ) : (
                            <>
                              <Download className="w-3.5 h-3.5 text-emerald-100" />
                              <span>Download Application PDF</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

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
                            <div className="flex items-center space-x-2">
                              <h4 className="font-extrabold text-sm text-slate-900 tracking-tight">APC SECURE PAYMENT GATEWAY</h4>
                              <span className="bg-emerald-100 text-[#008751] text-[8px] font-black px-1.5 py-0.5 rounded-full border border-emerald-300 animate-pulse">
                                ● REAL-TIME ACTIVE
                              </span>
                            </div>
                            <p className="text-[9px] text-slate-500 font-mono">Secured Online Settlement powered by Paystack POP Engine</p>
                          </div>
                        </div>
                        <div className="text-left sm:text-right font-mono text-xs">
                          <span className="text-slate-500 block text-[9px] uppercase font-sans">Verification Amount Due</span>
                          <span className="font-black text-[#008751] text-sm">₦{currentUser.membershipFee.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Active Gateway Selection Toggles with prominence on Paystack */}
                      <div className="px-6 pt-5 grid grid-cols-2 gap-3 bg-slate-50 border-b border-slate-200">
                        <button
                          type="button"
                          onClick={() => setUseRealPaystack(true)}
                          className={`pb-3 text-[11px] font-extrabold uppercase tracking-tight font-sans text-center border-b-2 transition-all cursor-pointer relative ${
                            useRealPaystack 
                              ? "border-[#008751] text-[#008751]" 
                              : "border-transparent text-slate-400 hover:text-slate-650"
                          }`}
                        >
                          ⚡ Paystack SDK (Active)
                          <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#008751] text-white text-[7px] font-bold px-1.5 py-0.2 rounded-full scale-90">
                            OFFICIAL
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setUseRealPaystack(false)}
                          className={`pb-3 text-[11px] font-extrabold uppercase tracking-tight font-sans text-center border-b-2 transition-all cursor-pointer ${
                            !useRealPaystack 
                              ? "border-[#008751] text-[#008751]" 
                              : "border-transparent text-slate-400 hover:text-slate-650"
                          }`}
                        >
                          🛠️ Sandbox Simulator
                        </button>
                      </div>

                      {/* Payment Method Selector Grid - Visible only in Simulator Mode */}
                      {!useRealPaystack && (
                        <div className="p-3 bg-slate-50 border-b border-slate-200 animate-fade-in">
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
                      )}

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
                                <span className="text-slate-800 uppercase font-bold">{useRealPaystack ? "Paystack SDK Gateway" : `${paymentMethod.replace("_", " ")} Simulator`}</span>
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
                        ) : useRealPaystack ? (
                          /* REAL INTERACTIVE PAYSTACK CHECKOUT GATEWAY */
                          <div className="space-y-6 text-left max-w-md mx-auto py-2 font-sans animate-fade-in">
                            <div className="bg-emerald-500/[0.02] border border-emerald-500/10 rounded-2xl p-5 space-y-4">
                              <div className="flex items-start space-x-3">
                                <div className="p-2.5 bg-[#008751]/10 text-emerald-600 rounded-xl border border-emerald-500/20 mt-0.5 shrink-0">
                                  <ShieldCheck className="w-5 h-5 text-[#008751]" />
                                </div>
                                <div className="space-y-1">
                                  <h4 className="font-extrabold text-slate-900 uppercase text-xs tracking-tight">Direct Paystack Client Settlement</h4>
                                  <p className="text-[11px] text-slate-500 leading-normal">
                                    Initiates the official secure checkout widget. Paystack allows cleared settlements through multiple methods: MasterCard, Visa, USSD, and secure commercial bank channels.
                                  </p>
                                </div>
                              </div>

                              <div className="border-t border-slate-150 pt-4 space-y-4 font-sans">
                                <div>
                                  <label className="block text-[9px] text-slate-500 font-bold uppercase font-mono mb-1">
                                    Integration Diagnostics
                                  </label>
                                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[10px] space-y-2 font-mono">
                                    <div className="flex items-center justify-between">
                                      <span className="text-slate-400">Paystack SDK State:</span>
                                      {paystackSdkLoaded ? (
                                        <span className="bg-emerald-100 text-[#008751] px-1.5 py-0.5 font-bold rounded text-[8.5px] border border-emerald-200">
                                          ✓ ACTIVE LOADED
                                        </span>
                                      ) : (
                                        <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 font-bold rounded text-[8.5px] animate-pulse">
                                          LOADING SDK...
                                        </span>
                                      )}
                                    </div>

                                    <div className="flex items-center justify-between">
                                      <span className="text-slate-400">Backoffice Admin Key:</span>
                                      {paystackPublicKey ? (
                                        <span className="bg-emerald-100 text-teal-800 px-1.5 py-0.5 font-bold rounded text-[8.5px] border border-teal-200">
                                          ✓ SET (SAVED)
                                        </span>
                                      ) : (
                                        <span className="bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded text-[8.5px]">
                                          NOT CONFIGURED
                                        </span>
                                      )}
                                    </div>

                                    <div className="flex items-center justify-between">
                                      <span className="text-slate-400">Env Variable Key:</span>
                                      {(import.meta as any).env?.VITE_PAYSTACK_PUBLIC_KEY ? (
                                        <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 font-bold rounded text-[8.5px]">
                                          ✓ DETECTED (API SECURE)
                                        </span>
                                      ) : (
                                        <span className="bg-amber-100 text-amber-700 px-1.5 py-0.5 font-bold rounded text-[8.5px]">
                                          MOCK FALLBACK WORKING
                                        </span>
                                      )}
                                    </div>

                                    <div className="flex items-center justify-between border-t border-slate-200/60 pt-2 mt-1 font-sans">
                                      <span className="font-semibold text-slate-600 font-mono text-[9px] uppercase">Active Checkout Key:</span>
                                      <span className="text-[#008751] font-extrabold text-[10px] uppercase">
                                        {paystackCustomKey.trim() 
                                          ? "⚡ Temporary Override Key" 
                                          : paystackPublicKey.trim() 
                                            ? "🏛️ Saved Admin Platform Key" 
                                            : (import.meta as any).env?.VITE_PAYSTACK_PUBLIC_KEY 
                                              ? "🔒 Global Environment Key" 
                                              : "🧪 Default Sandbox Sandbox Key"}
                                      </span>
                                    </div>

                                    <p className="text-[9.5px] text-slate-400 leading-normal font-sans pt-1">
                                      {paystackCustomKey.trim() 
                                        ? "Your custom overriding key is loaded for this payment."
                                        : paystackPublicKey.trim() 
                                          ? "Checkout will settle into the platform's Admin-configured account." 
                                          : (import.meta as any).env?.VITE_PAYSTACK_PUBLIC_KEY 
                                            ? "Checkout will settle through the VITE_PAYSTACK_PUBLIC_KEY env variable." 
                                            : "No official key is set yet. We are automatically falling back to Paystack's official secure sandbox test environment with zero setup."}
                                    </p>
                                  </div>
                                </div>

                                <div>
                                  <div className="flex justify-between items-center mb-1">
                                    <label className="block text-[9.5px] text-slate-600 font-bold uppercase font-mono">
                                      Temporary Public Key
                                    </label>
                                    <span className="text-[8px] text-slate-400 font-sans italic hover:underline cursor-help">
                                      Optional for Dev sandbox
                                    </span>
                                  </div>
                                  <input
                                    type="text"
                                    value={paystackCustomKey}
                                    onChange={(e) => setPaystackCustomKey(e.target.value.trim())}
                                    placeholder="e.g. pk_test_..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-slate-800 font-mono text-[11px] focus:outline-none focus:border-[#008751] focus:bg-white placeholder-slate-400 shadow-inner"
                                  />
                                </div>
                              </div>
                            </div>

                            {paystackError && (
                              <div className="text-[10px] text-red-600 font-bold leading-relaxed bg-red-50/80 px-3.5 py-2.5 border border-red-200 rounded-xl font-mono">
                                <p className="font-extrabold uppercase mb-0.5">⚠️ Transact-Error:</p>
                                <p className="font-normal">{paystackError}</p>
                              </div>
                            )}

                            <button
                              type="button"
                              onClick={handlePaystackWebCheckout}
                              disabled={paymentLoading}
                              className="w-full flex items-center justify-center space-x-2 bg-[#008751] hover:bg-[#007345] text-white font-black py-4 rounded-xl disabled:opacity-50 cursor-pointer text-xs uppercase tracking-wider shadow-sm transition-all"
                            >
                              {paymentLoading ? (
                                <span className="flex items-center space-x-2">
                                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                                  <span>Authorizing Paystack Gateway...</span>
                                </span>
                              ) : (
                                <span className="flex items-center space-x-1.5">
                                  <CreditCard className="w-4 h-4 mr-0.5" />
                                  <span>Pay ₦{currentUser.membershipFee.toLocaleString()} via Paystack Pop</span>
                                </span>
                              )}
                            </button>

                            <div className="text-center font-mono text-[9px] text-slate-400 uppercase tracking-widest pt-1 flex items-center justify-center space-x-1.5">
                              <ShieldCheck className="w-3.5 h-3.5 text-[#008751]" />
                              <span>Secured powered by Paystack POP technology</span>
                            </div>
                          </div>
                        ) : (
                          /* SIMULATED GATEWAYS */
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
                                    className="w-full bg-slate-50 border border-[#slate-200] rounded-lg py-2.5 px-3 text-slate-800 focus:outline-none focus:border-[#008751] focus:bg-white font-mono text-sm shadow-inner"
                                  />
                                </div>
                                <p className="text-[10px] text-slate-500">A payment push check will be transmitted directly to your mobile wallet provider app.</p>
                              </div>
                            )}

                            {/* Secure action button */}
                            <button
                              type="submit"
                              disabled={paymentLoading}
                              className="w-full mt-4 flex items-center justify-center space-x-2 bg-[#008751] hover:bg-[#007345] text-white font-black py-3.5 rounded-xl disabled:opacity-50 cursor-pointer text-xs uppercase tracking-wide shadow-sm"
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
                    <div className="bg-white border border-red-200 rounded-2xl p-6 text-center space-y-4 shadow-sm">
                      <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-650 mx-auto border border-red-200">
                        <ShieldAlert className="w-5 h-5" />
                      </div>
                      <h3 className="text-base font-extrabold text-red-750">Withdrawal Blocked: Examination Clearance Outstanding</h3>
                      <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                        To protect social safety funds, you are strictly required to clear your smart proctoring examination fee and complete your civic eligibility test before requesting disbursement.
                      </p>
                      <button
                        onClick={() => setActiveTab("exam")}
                        className="bg-[#008751] hover:bg-[#007345] text-white font-extrabold py-2 px-5 rounded-lg text-xs cursor-pointer"
                      >
                        Go to Examination Center
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
