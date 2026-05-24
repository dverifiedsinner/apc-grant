import React, { useState } from "react";
import { 
  Sparkles, ShieldAlert, KeyRound, Mail, User as UserIcon, Phone, Map, 
  ArrowRight, ShieldCheck, Eye, EyeOff, ClipboardCheck, Sparkle,
  ArrowLeft, Upload, Camera, BookOpen, Award, FileText, Check, Users, MapPin, Milestone
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { NIGERIAN_STATES, DEFAULT_GRANT_CONFIGS, SEED_USERS } from "../data";
import { User, GrantConfig } from "../types";
import APCLogo from "./APCLogo";

interface AuthPageProps {
  initialForm?: "login" | "register";
  onAuthSuccess: (user: User) => void;
  onNavigate: (view: string) => void;
}

export default function AuthPage({
  initialForm = "login",
  onAuthSuccess,
  onNavigate
}: AuthPageProps) {
  const [formType, setFormType] = useState<"login" | "register">(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Registration step tracker
  const [regStep, setRegStep] = useState(1);

  // --- Step States ---
  // Step 1: Email Address
  const [email, setEmail] = useState("");

  // Step 2: Bio Data
  const [lastName, setLastName] = useState("");
  const [otherNames, setOtherNames] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [state, setState] = useState("");
  const [lga, setLga] = useState("");
  const [homeAddress, setHomeAddress] = useState("");
  const [dob, setDob] = useState("");
  const [password, setPassword] = useState("admin123");
  const [referralCode, setReferralCode] = useState("");

  // Step 3: Educational Background
  const [highestQualification, setHighestQualification] = useState("");
  const [yearAcquired, setYearAcquired] = useState("");
  const [schoolName, setSchoolName] = useState("");

  // Step 4: Citizenship Identification
  const [idType, setIdType] = useState("");
  const [idNumber, setIdNumber] = useState("");

  // Step 5: File Upload
  const [passportPhoto, setPassportPhoto] = useState<string>("");
  const [passportPhotoName, setPassportPhotoName] = useState<string>("");
  const [ninDoc, setNinDoc] = useState<string>("");
  const [ninDocName, setNinDocName] = useState<string>("");
  const [certDoc, setCertDoc] = useState<string>("");
  const [certDocName, setCertDocName] = useState<string>("");

  // Live calculation states (Register)
  const [calculatedAge, setCalculatedAge] = useState<number | null>(null);
  const [matchedConfig, setMatchedConfig] = useState<GrantConfig | null>(null);

  // Tabs toggle helper
  const handleTabChange = (type: "login" | "register") => {
    setFormType(type);
    setErrorMsg(null);
    setRegStep(1);
    if (type === "register") {
      setEmail("");
    } else {
      setEmail("denacchy@gmail.com");
    }
  };

  // DOB change age + cohort calculations
  const handleDobChange = (dateVal: string) => {
    setDob(dateVal);
    if (!dateVal) {
      setCalculatedAge(null);
      setMatchedConfig(null);
      return;
    }

    const birthDate = new Date(dateVal);
    const today = new Date("2026-05-20"); // Fixed system time constraint
    
    let calculated = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      calculated--;
    }

    setCalculatedAge(calculated);

    if (calculated < 17) {
      setMatchedConfig(null);
      return;
    }

    const matched = DEFAULT_GRANT_CONFIGS.find(
      config => calculated >= config.minAge && calculated <= config.maxAge
    );
    if (matched) {
      setMatchedConfig(matched);
    } else {
      const fallback = DEFAULT_GRANT_CONFIGS[DEFAULT_GRANT_CONFIGS.length - 1];
      setMatchedConfig(fallback);
    }
  };

  // File to base64 reader helper
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string) => void,
    nameSetter: (name: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      nameSetter(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // --- Nav Validations ---
  const validateStep1 = () => {
    setErrorMsg(null);
    if (!email.trim()) {
      setErrorMsg("Please enter your electronic email address.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg("Please submit a valid electronic email address.");
      return false;
    }
    const storedUsersRaw = localStorage.getItem("apc_grants_users");
    const usersList: User[] = storedUsersRaw ? JSON.parse(storedUsersRaw) : SEED_USERS;
    if (usersList.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      setErrorMsg("An active grant file with this email already exists inside our archives.");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    setErrorMsg(null);
    if (!lastName.trim()) {
      setErrorMsg("Last Name is required.");
      return false;
    }
    if (!otherNames.trim()) {
      setErrorMsg("Other Name is required.");
      return false;
    }
    if (!phone.trim()) {
      setErrorMsg("Mobile Phone Number is required.");
      return false;
    }
    if (phone.length < 8) {
      setErrorMsg("Please enter a valid mobile number.");
      return false;
    }
    if (!gender) {
      setErrorMsg("Please select your Gender.");
      return false;
    }
    if (!state) {
      setErrorMsg("Please select your State of Origin.");
      return false;
    }
    if (!lga.trim()) {
      setErrorMsg("Please specify your Local Government Area (LGA).");
      return false;
    }
    if (!homeAddress.trim()) {
      setErrorMsg("Please write your Home Address.");
      return false;
    }
    if (!dob) {
      setErrorMsg("Date of Birth is required.");
      return false;
    }
    if (calculatedAge === null || calculatedAge < 17) {
      setErrorMsg("Citizens must be aged 17 or above to register for this political allocation.");
      return false;
    }
    if (!password || password.length < 5) {
      setErrorMsg("Please select a secure password (with at least 5 character length).");
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    setErrorMsg(null);
    if (!highestQualification) {
      setErrorMsg("Please select your highest academic qualification.");
      return false;
    }
    if (!yearAcquired.trim()) {
      setErrorMsg("Please enter the year the certification was acquired.");
      return false;
    }
    if (!schoolName.trim()) {
      setErrorMsg("Please indicate the name of the school attended.");
      return false;
    }
    return true;
  };

  const validateStep4 = () => {
    setErrorMsg(null);
    if (!idType) {
      setErrorMsg("Please select your identification means.");
      return false;
    }
    if (!idNumber.trim()) {
      setErrorMsg("Kindly specify the document identification status number.");
      return false;
    }
    return true;
  };

  const validateStep5 = () => {
    setErrorMsg(null);
    if (!passportPhoto) {
      setErrorMsg("Passport photograph upload is required to verify physical identity.");
      return false;
    }
    if (!ninDoc) {
      setErrorMsg("National Identification Number document upload is required for verification.");
      return false;
    }
    if (!certDoc) {
      setErrorMsg("Qualification certification upload is mandatory to bind credential claims.");
      return false;
    }
    return true;
  };

  const handleNextBtn = () => {
    if (regStep === 1 && validateStep1()) setRegStep(2);
    else if (regStep === 2 && validateStep2()) setRegStep(3);
    else if (regStep === 3 && validateStep3()) setRegStep(4);
    else if (regStep === 4 && validateStep4()) setRegStep(5);
  };

  const handlePrevBtn = () => {
    setErrorMsg(null);
    if (regStep > 1) {
      setRegStep(prev => prev - 1);
    }
  };

  // Main Submit (Process Login or Step 5 Registration Completion)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (formType === "login") {
      const storedUsersRaw = localStorage.getItem("apc_grants_users");
      let usersList: User[] = storedUsersRaw ? JSON.parse(storedUsersRaw) : SEED_USERS;

      const foundUser = usersList.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() || u.phone === email
      );

      if (email.toLowerCase() === "denacchy@gmail.com") {
        const adminUser = foundUser || {
          id: "admin-user",
          fullName: "System Admin (Denacchy)",
          dob: "1980-01-01",
          age: 46,
          phone: "08011112222",
          email: "denacchy@gmail.com",
          state: "FCT Abuja",
          grantAmount: 0,
          membershipFee: 0,
          membershipStatus: "paid" as const,
          withdrawalStatus: "not_requested" as const,
          referralCode: "ADMIN",
          referralsCount: 0,
          createdAt: new Date().toISOString()
        };

        if (!foundUser) {
          usersList.push(adminUser);
          localStorage.setItem("apc_grants_users", JSON.stringify(usersList));
        }

        onAuthSuccess(adminUser);
        onNavigate("admin");
        return;
      }

      if (foundUser) {
        onAuthSuccess(foundUser);
        onNavigate("dashboard");
      } else {
        setErrorMsg("Verify your Email or Phone Number. If you don't have an account, click 'Apply / Register' above first.");
      }
    } else {
      // Step 5 Submit Verification
      if (!validateStep5()) return;

      const storedUsersRaw = localStorage.getItem("apc_grants_users");
      const usersList: User[] = storedUsersRaw ? JSON.parse(storedUsersRaw) : SEED_USERS;

      // Double check in memory database email checks
      if (usersList.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
        setErrorMsg("An active grant file with this email already exists inside our archives.");
        return;
      }

      setShowConfirmModal(true);
    }
  };

  const handleFinalRegisterSubmit = () => {
    setShowConfirmModal(false);
    const storedUsersRaw = localStorage.getItem("apc_grants_users");
    const usersList: User[] = storedUsersRaw ? JSON.parse(storedUsersRaw) : SEED_USERS;

    // Double check email duplicate
    if (usersList.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      setErrorMsg("An active grant file with this email already exists inside our archives.");
      return;
    }

    const compositeFullName = `${lastName.trim()} ${otherNames.trim()}`;
    const finalAge = calculatedAge !== null ? calculatedAge : 25;

    const newUser: User = {
      id: `user-${Date.now()}`,
      fullName: compositeFullName,
      dob,
      age: finalAge,
      phone,
      email,
      state,
      password,
      grantAmount: matchedConfig ? matchedConfig.grantAmount : 0,
      membershipFee: matchedConfig ? matchedConfig.membershipFee : 0,
      membershipStatus: "unpaid",
      withdrawalStatus: "not_requested",
      referralCode: lastName.substring(0, 4).toUpperCase() + Math.floor(10 + Math.random() * 90),
      referredBy: referralCode.trim() || undefined,
      referralsCount: 0,
      
      // Custom multi-step outputs
      lastName,
      otherNames,
      gender,
      lga,
      homeAddress,
      highestQualification,
      yearAcquired,
      schoolName,
      idType,
      idNumber,
      passportPhoto,
      ninDoc,
      certDoc,

      createdAt: new Date().toISOString()
    };

    usersList.push(newUser);
    localStorage.setItem("apc_grants_users", JSON.stringify(usersList));

    // Handle referrals tracking code
    if (newUser.referredBy) {
      const referralCodeUpper = newUser.referredBy.toUpperCase();
      const updatedUsersList = usersList.map(u => {
        if (u.referralCode.toUpperCase() === referralCodeUpper) {
          return { ...u, referralsCount: u.referralsCount + 1 };
        }
        return u;
      });
      localStorage.setItem("apc_grants_users", JSON.stringify(updatedUsersList));
    }

    // Direct dashboard to register an immediate active focus tab on the examination center
    localStorage.setItem("apc_just_registered", "true");

    onAuthSuccess(newUser);
    onNavigate("dashboard");
  };

  const isStep5 = formType === "register" && regStep === 5;

  return (
    <div className="bg-slate-950 min-h-[calc(100vh-64px)] py-12 flex items-center justify-center relative overflow-hidden font-sans">
      
      {/* Background radial effects */}
      <div className="absolute top-[10%] left-[20%] w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[10%] right-[20%] w-72 h-72 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-5xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
        
        {/* Left Information Sidebar Column */}
        <div className="lg:col-span-12 xl:col-span-5 text-left space-y-6 hidden xl:block xl:sticky xl:top-8">
          <div className="flex items-center space-x-3 text-emerald-400">
            <APCLogo className="w-14 h-14 shadow-xl" />
            <div>
              <div className="flex items-center space-x-1.5 bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/20 rounded">
                <Sparkle className="w-3.5 h-3.5 animate-pulse" />
                <span className="font-bold font-mono text-[9px] uppercase tracking-widest text-emerald-400">
                  Renewed Hope Portal
                </span>
              </div>
            </div>
          </div>
          
          <h2 className="text-3xl font-black text-white leading-tight">
            National Social <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-200">Empowerment Desk</span>
          </h2>

          <div className="space-y-4 text-slate-300">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-xs font-bold text-emerald-400 font-mono mt-0.5 flex-shrink-0">
                1
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Prerequisite Verification</h4>
                <p className="text-xs text-slate-400 mt-0.5">Please populate and upload authentic documents. Handlers review and sign off biometric matches recursively.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-xs font-bold text-emerald-400 font-mono mt-0.5 flex-shrink-0">
                2
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Calibrated Disbursements</h4>
                <p className="text-xs text-slate-400 mt-0.5">Disbursements ranging from ₦180,000 to ₦750,000 instantly map to citizens based on academic credentials and legal birth records.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-xs font-bold text-emerald-400 font-mono mt-0.5 flex-shrink-0">
                3
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Direct Commercial Payouts</h4>
                <p className="text-xs text-slate-400 mt-0.5">Central database distributes your approved financial aid directly to the commercial bank logs submitted in records.</p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-850 pt-4 flex items-center space-x-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Secured database architecture with instant cloud node validations.</span>
          </div>
        </div>

        {/* Right Active Form Card (With conditional visual theme transitions!) */}
        <div id="auth-form-container" className={`col-span-12 xl:col-span-7 rounded-3xl p-6 sm:p-8 shadow-2xl relative transition-all duration-300 border w-full ${
          isStep5
            ? "bg-white text-slate-900 border-slate-200"
            : "bg-slate-900 text-white border-slate-800/80"
        }`}>
          
          {/* Header tabs inside card */}
          <div className={`flex border-b mb-6 font-semibold transition-all ${
            isStep5 ? "border-slate-200" : "border-slate-850"
          }`}>
            <button
              type="button"
              onClick={() => handleTabChange("login")}
              className={`w-1/2 pb-3.5 text-center text-sm border-b-2 transition-colors cursor-pointer ${
                formType === "login" 
                  ? "border-emerald-500 text-emerald-500 font-extrabold" 
                  : isStep5
                  ? "border-transparent text-slate-400 hover:text-slate-600"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => handleTabChange("register")}
              className={`w-1/2 pb-3.5 text-center text-sm border-b-2 transition-colors cursor-pointer ${
                formType === "register" 
                  ? "border-emerald-500 font-extrabold text-emerald-500" 
                  : isStep5
                  ? "border-transparent text-slate-400 hover:text-slate-600"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              Apply / Register
            </button>
          </div>
          
          <div className="flex items-center space-x-3 mb-4 xl:hidden">
            <APCLogo className="w-10 h-10 shadow-md" />
            <div>
              <p className={`font-extrabold text-xs tracking-tight ${isStep5 ? "text-slate-900" : "text-white"}`}>APC GRANTS HUB</p>
              <p className="text-[9px] text-slate-500 font-mono">Federal Republic of Nigeria</p>
            </div>
          </div>

          <h3 className={`text-lg font-black mb-1 ${isStep5 ? "text-slate-900" : "text-white"}`}>
            {formType === "login" 
              ? "Welcome back, Citizen!" 
              : `Create Official Grant File (Step ${regStep}/5)`}
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            {formType === "login" 
              ? "Gain secure entrance to your dashboard to complete card activation and check withdrawals." 
              : regStep === 1 
              ? "Enter your primary email address to initialize your secure file logs."
              : regStep === 2 
              ? "Complete your official bio-data parameters exactly as they show on certificates."
              : regStep === 3 
              ? "Provide your highest level of academic qualifications for verification records."
              : regStep === 4 
              ? "Link your official identification card to bind your legal citizen status."
              : "Upload documents to complete submission. Photos must show clean focus."}
          </p>

          {/* Stepper tracker bar */}
          {formType === "register" && (
            <div className="mb-6">
              <div className="flex items-center justify-between font-mono text-[9px] font-bold">
                {[1, 2, 3, 4, 5].map((step) => (
                  <div key={step} className="flex flex-col items-center flex-1">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono transition-all mb-1 ${
                      regStep === step
                        ? "bg-[#008751] text-white ring-4 ring-emerald-500/20"
                        : regStep > step
                        ? "bg-[#008751] text-white"
                        : isStep5
                        ? "bg-slate-200 text-slate-400"
                        : "bg-slate-800 text-slate-500"
                    }`}>
                      {step}
                    </div>
                    <span className={`hidden sm:inline font-mono uppercase tracking-tight text-[8px] ${
                      regStep === step
                        ? "text-[#008751] font-extrabold"
                        : "text-slate-400"
                    }`}>
                      {step === 1 && "Start"}
                      {step === 2 && "Bio"}
                      {step === 3 && "Edu"}
                      {step === 4 && "ID"}
                      {step === 5 && "Files"}
                    </span>
                  </div>
                ))}
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
                <div 
                  className="bg-[#008751] h-full transition-all duration-300"
                  style={{ width: `${(regStep / 5) * 100}%` }}
                />
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-50 border border-red-200 text-[#D10000] p-3 rounded-lg text-xs mb-4 flex items-start space-x-2"
              >
                <ShieldAlert className="w-4 h-4 text-[#D10000] mt-0.5 flex-shrink-0" />
                <span className="font-medium text-left">{errorMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4 text-left text-xs font-sans">
            <AnimatePresence mode="wait">
              {formType === "login" ? (
                // --- LOGIN VIEW ---
                <motion.div
                  key="login-content"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-slate-450 font-bold uppercase tracking-wider mb-1.5 font-mono text-[10px]">
                      Email Address or Phone Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. denacchy@gmail.com"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 pl-9 text-white focus:outline-none focus:border-emerald-500 text-sm"
                      />
                      <Mail className="absolute left-3 top-3.5 text-slate-500 w-4 h-4" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-450 font-bold uppercase tracking-wider mb-1.5 font-mono text-[10px]">
                      Security Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 pl-9 pr-10 text-white focus:outline-none focus:border-emerald-500 text-sm"
                      />
                      <KeyRound className="absolute left-3 top-3.5 text-slate-500 w-4 h-4" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-200 focus:outline-none cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                // --- MULTI-STEP REGISTER VIEW ---
                <motion.div
                  key={`register-step-${regStep}`}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  style={{ width: "100%" }}
                  className="space-y-4"
                >
                  {/* STEP 1: Email Onboarding */}
                  {regStep === 1 && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1.5 font-mono text-[10.5px]">
                          Citizen Email Address
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="e.g. name@gmail.com"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 pl-10 text-white focus:outline-none focus:border-emerald-500 text-sm"
                          />
                          <Mail className="absolute left-3.5 top-3.5 text-slate-500 w-4 h-4" />
                        </div>
                        <p className="text-[10px] text-slate-500 mt-2">
                          We will initialize your official secure file under this email address. Please make sure it is actively accessible.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: Bio Data */}
                  {regStep === 2 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1 font-mono text-[9.5px]">
                            Last Name
                          </label>
                          <input
                            type="text"
                            required
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="e.g. Ibrahim"
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-emerald-500 text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1 font-mono text-[9.5px]">
                            Other Name
                          </label>
                          <input
                            type="text"
                            required
                            value={otherNames}
                            onChange={(e) => setOtherNames(e.target.value)}
                            placeholder="e.g. Chisom Usman"
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-emerald-500 text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1 font-mono text-[9.5px]">
                            Mobile Number (Phone)
                          </label>
                          <input
                            type="text"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                            placeholder="e.g. 08031234567"
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-emerald-500 text-xs font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1 font-mono text-[9.5px]">
                            Gender
                          </label>
                          <select
                            required
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3 text-slate-200 focus:outline-none focus:border-emerald-500 text-xs"
                          >
                            <option value="">-- Select Gender --</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1 font-mono text-[9.5px]">
                            State of Origin
                          </label>
                          <select
                            required
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3 text-slate-200 focus:outline-none focus:border-emerald-500 text-xs"
                          >
                            <option value="">-- State --</option>
                            {NIGERIAN_STATES.map((st) => (
                              <option key={st} value={st}>{st}</option>
                            ))}
                          </select>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1 font-mono text-[9.5px]">
                            Local Government
                          </label>
                          <input
                            type="text"
                            required
                            value={lga}
                            onChange={(e) => setLga(e.target.value)}
                            placeholder="e.g. Ikeja Local Govt"
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-emerald-500 text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1 font-mono text-[9.5px]">
                          Home Address
                        </label>
                        <input
                          type="text"
                          required
                          value={homeAddress}
                          onChange={(e) => setHomeAddress(e.target.value)}
                          placeholder="e.g. Plot 12, Secretariat Crescent, Garki"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-emerald-500 text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1 font-mono text-[9.5px]">
                            Date of Birth
                          </label>
                          <input
                            type="date"
                            required
                            value={dob}
                            onChange={(e) => handleDobChange(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-emerald-500 text-xs text-slate-250 font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1 font-mono text-[9.5px]">
                            Referral Code (Optional)
                          </label>
                          <input
                            type="text"
                            value={referralCode}
                            onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                            placeholder="e.g. CHISOM45"
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-emerald-500 text-xs font-mono"
                          />
                        </div>
                      </div>

                      {/* Security Password input so they can login back anytime */}
                      <div>
                        <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1 font-mono text-[9.5px]">
                          Choose Security Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter login password"
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3 pr-10 text-white focus:outline-none focus:border-emerald-500 text-xs font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 focus:outline-none cursor-pointer"
                          >
                            {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      {/* Simulated allocation banner based on Age computation */}
                      <AnimatePresence>
                        {dob && calculatedAge !== null && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className={`p-3.5 rounded-xl border text-xs ${
                              calculatedAge >= 17 
                                ? "bg-slate-950 border-emerald-500/40 text-emerald-300" 
                                : "bg-red-950/20 border-red-500/30 text-red-200"
                            }`}
                          >
                            <div className="flex justify-between items-center font-mono text-[10px]">
                              <span>Calculated Age: <strong className="text-white">{calculatedAge} Years</strong></span>
                              <span>Eligibility Status:</span>
                            </div>
                            
                            {calculatedAge >= 17 ? (
                              <div className="mt-2 flex justify-between items-end border-t border-slate-850 pt-2 font-sans">
                                <div>
                                  <p className="text-[10px] text-slate-400">Approved cohort bracket:</p>
                                  <p className="font-bold text-white text-xs">{matchedConfig?.minAge}-{matchedConfig?.maxAge} Bracket</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-[10px] text-slate-400">Allocated Grant Value:</p>
                                  <p className="font-black text-emerald-400 text-sm">₦{matchedConfig?.grantAmount.toLocaleString()}</p>
                                </div>
                              </div>
                            ) : (
                              <p className="mt-1 text-slate-450 italic">Error: Applicants must be at least 17 years old to trigger national allocation files.</p>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* STEP 3: Educational Background */}
                  {regStep === 3 && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1.5 font-mono text-[9.5px]">
                          Highest academic qualification
                        </label>
                        <select
                          required
                          value={highestQualification}
                          onChange={(e) => setHighestQualification(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3 text-slate-200 focus:outline-none focus:border-emerald-500 text-xs"
                        >
                          <option value="">-- Choose Highest Qualification --</option>
                          <option value="None">None</option>
                          <option value="M.Sc">M.Sc</option>
                          <option value="M.Ar">M.Ar</option>
                          <option value="B.Sc">B.Sc</option>
                          <option value="B.Ar">B.Ar</option>
                          <option value="B.Ed.">B.Ed.</option>
                          <option value="h.n.d">h.n.d</option>
                          <option value="N.C.E">N.C.E</option>
                          <option value="ND">ND</option>
                          <option value="S.S.C.E">S.S.C.E</option>
                          <option value="F.S.L.C">F.S.L.C</option>
                          <option value="Others">Others</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1.5 font-mono text-[9.5px]">
                          Year certification was acquired
                        </label>
                        <input
                          type="text"
                          required
                          value={yearAcquired}
                          onChange={(e) => setYearAcquired(e.target.value.replace(/\D/g, ""))}
                          placeholder="e.g. 2020"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-emerald-500 text-xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1.5 font-mono text-[9.5px]">
                          Name of School
                        </label>
                        <input
                          type="text"
                          required
                          value={schoolName}
                          onChange={(e) => setSchoolName(e.target.value)}
                          placeholder="e.g. University of Lagos or Technical High School"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-emerald-500 text-xs"
                        />
                      </div>
                    </div>
                  )}

                  {/* STEP 4: Citizenship Identification */}
                  {regStep === 4 && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1.5 font-mono text-[9.5px]">
                          Means of identification
                        </label>
                        <select
                          required
                          value={idType}
                          onChange={(e) => setIdType(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3 text-slate-200 focus:outline-none focus:border-emerald-500 text-xs"
                        >
                          <option value="">-- Choose ID Type --</option>
                          <option value="NIN">NIN</option>
                          <option value="INTERNATIONAL PASSPORT">INTERNATIONAL PASSPORT</option>
                          <option value="DRIVERS LICENCE">DRIVERS LICENCE</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1.5 font-mono text-[9.5px]">
                          Document number
                        </label>
                        <input
                          type="text"
                          required
                          value={idNumber}
                          onChange={(e) => setIdNumber(e.target.value)}
                          placeholder="e.g. 11-digit NIN or Passport Booklet ID..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-emerald-500 text-xs font-mono"
                        />
                      </div>
                    </div>
                  )}

                  {/* STEP 5: File Upload (Pristine White Background & Green Button styling) */}
                  {regStep === 5 && (
                    <div className="space-y-6 text-slate-800">
                      
                      {/* Passport Photograph Section */}
                      <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 relative">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#008751] font-mono">
                              PASSPORT UPLOAD SECTION
                            </span>
                            <p className="text-[10px] text-slate-500 text-left">Upload a clean face-front passport image.</p>
                          </div>
                          {passportPhoto && (
                            <span className="inline-flex items-center justify-center p-0.5 bg-emerald-100 text-[#008751] rounded-full border border-emerald-300">
                              <Check className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-4">
                          <label className="cursor-pointer shrink-0">
                            <span className="inline-flex items-center space-x-1 px-3 py-2 border border-slate-300 bg-white rounded-lg hover:bg-slate-100 transition-all text-[11px] font-bold text-slate-700">
                              <Camera className="w-3.5 h-3.5 text-[#008751]" />
                              <span>Select Passport Image</span>
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleFileChange(e, setPassportPhoto, setPassportPhotoName)}
                            />
                          </label>
                          <span className="text-[10px] text-slate-500 truncate font-mono max-w-[180px] text-left block">
                            {passportPhotoName || "No file selected"}
                          </span>
                        </div>

                        {passportPhoto && (
                          <div className="mt-3">
                            <img
                              src={passportPhoto}
                              alt="Passport preview"
                              className="w-14 h-14 rounded-lg object-cover border border-slate-300 shadow-sm"
                            />
                          </div>
                        )}
                      </div>

                      {/* National Identification Number Upload Section */}
                      <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 relative">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#008751] font-mono">
                              NATIONAL IDENTIFICATION NUMBER UPLOAD SECTION
                            </span>
                            <p className="text-[10px] text-slate-500 text-left">Attach slip details or legal ID card document.</p>
                          </div>
                          {ninDoc && (
                            <span className="inline-flex items-center justify-center p-0.5 bg-emerald-100 text-[#008751] rounded-full border border-emerald-300">
                              <Check className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-4">
                          <label className="cursor-pointer shrink-0">
                            <span className="inline-flex items-center space-x-1 px-3 py-2 border border-slate-300 bg-white rounded-lg hover:bg-slate-100 transition-all text-[11px] font-bold text-slate-700">
                              <Upload className="w-3.5 h-3.5 text-[#008751]" />
                              <span>Select National ID card File</span>
                            </span>
                            <input
                              type="file"
                              accept="image/*,.pdf"
                              className="hidden"
                              onChange={(e) => handleFileChange(e, setNinDoc, setNinDocName)}
                            />
                          </label>
                          <span className="text-[10px] text-slate-500 truncate font-mono max-w-[180px] text-left block">
                            {ninDocName || "No file selected"}
                          </span>
                        </div>
                      </div>

                      {/* Certification Upload Section */}
                      <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 relative">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#008751] font-mono">
                              CERTIFICATION UPLOAD SECTION
                            </span>
                            <p className="text-[10px] text-slate-500 text-left">Upload credentials matching your qualification claims.</p>
                          </div>
                          {certDoc && (
                            <span className="inline-flex items-center justify-center p-0.5 bg-emerald-100 text-[#008751] rounded-full border border-emerald-300">
                              <Check className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-4">
                          <label className="cursor-pointer shrink-0">
                            <span className="inline-flex items-center space-x-1 px-3 py-2 border border-slate-300 bg-white rounded-lg hover:bg-slate-100 transition-all text-[11px] font-bold text-slate-700">
                              <FileText className="w-3.5 h-3.5 text-[#008751]" />
                              <span>Select Certification File</span>
                            </span>
                            <input
                              type="file"
                              accept="image/*,.pdf"
                              className="hidden"
                              onChange={(e) => handleFileChange(e, setCertDoc, setCertDocName)}
                            />
                          </label>
                          <span className="text-[10px] text-slate-500 truncate font-mono max-w-[180px] text-left block">
                            {certDocName || "No file selected"}
                          </span>
                        </div>
                      </div>

                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation buttons wrapper */}
            {formType === "login" ? (
              // Login submit button
              <button
                type="submit"
                className="w-full mt-4 flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-500 text-white font-black py-3 rounded-xl shadow-lg transition-transform hover:-translate-y-0.5 cursor-pointer text-sm"
              >
                <span>Sign In to Control Center</span>
                <ArrowRight className="w-4 h-4 text-emerald-100" />
              </button>
            ) : (
              // Multi-step pagination navigation buttons
              <div className="flex items-center justify-between space-x-4 pt-4 mt-4 border-t border-slate-800/20">
                {regStep > 1 && (
                  <button
                    type="button"
                    onClick={handlePrevBtn}
                    className={`px-4 py-2.5 rounded-xl border font-bold text-xs flex items-center space-x-1.5 cursor-pointer transition-colors ${
                      isStep5
                        ? "border-slate-300 bg-white hover:bg-slate-100 text-slate-700"
                        : "border-slate-750 bg-slate-950/40 hover:bg-slate-800 text-slate-300"
                    }`}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                )}

                {regStep < 5 ? (
                  // Next buttons
                  <button
                    type="button"
                    onClick={handleNextBtn}
                    className="ml-auto px-5 py-2.5 bg-[#008751] hover:bg-[#007345] text-white font-black rounded-xl text-xs flex items-center space-x-1.5 shadow-md cursor-pointer transition-all hover:shadow-lg active:scale-97"
                  >
                    <span>Next Step</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  // Step 5 Green Submit button
                  <button
                    type="submit"
                    className="ml-auto px-6 py-2.5 bg-[#008751] hover:bg-[#007345] text-white font-black rounded-xl text-xs flex items-center space-x-1.5 shadow-md cursor-pointer transition-all hover:shadow-lg active:scale-95"
                  >
                    <span>Save & Complete Registration</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-100" />
                  </button>
                )}
              </div>
            )}
          </form>

          {/* Quick Demo Assist */}
          <div className={`border p-3 rounded-xl text-[10px] mt-6 flex justify-between items-center text-left ${
            isStep5 
              ? "bg-slate-50 border-slate-200 text-slate-500" 
              : "bg-slate-950 border-slate-850/60 text-slate-500"
          }`}>
            <span>
              💡 <strong>Demo Guidance:</strong> Fill in parameters to simulate real citizen record setups. Choose "Sign In" with <strong>denacchy@gmail.com</strong> or click "Simulate Admin" at the top navbar.
            </span>
          </div>

        </div>
      </div>

      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl border border-slate-200 relative overflow-hidden text-slate-900"
            >
              {/* Top alert line */}
              <div className="absolute top-0 inset-x-0 h-1 bg-red-500" />
              
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3 text-red-500">
                <ShieldAlert className="w-6 h-6" />
              </div>
              
              <h3 className="text-lg font-black text-slate-900 mb-1 tracking-tight">
                ARE YOU SURE?
              </h3>
              
              <p className="text-slate-500 text-xs mb-6 px-1 italic">
                you will not be able to make any correction once its submitted
              </p>
              
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  id="btn-confirm-submit"
                  onClick={handleFinalRegisterSubmit}
                  className="w-full py-2.5 bg-[#008751] hover:bg-[#007345] text-white font-black rounded-lg text-xs uppercase tracking-wide shadow cursor-pointer transition-all"
                >
                  yes, submit application
                </button>
                <button
                  type="button"
                  id="btn-confirm-cancel"
                  onClick={() => setShowConfirmModal(false)}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs cursor-pointer transition-all"
                >
                  back
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
