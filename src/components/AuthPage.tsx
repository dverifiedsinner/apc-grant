import React, { useState } from "react";
import { 
  Sparkles, ShieldAlert, KeyRound, Mail, User as UserIcon, Phone, Map, 
  ArrowRight, ShieldCheck, Eye, EyeOff, ClipboardCheck, Sparkle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { NIGERIAN_STATES, DEFAULT_GRANT_CONFIGS } from "../data";
import { User, GrantConfig } from "../types";

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

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");

  // Live calculation states (Register)
  const [calculatedAge, setCalculatedAge] = useState<number | null>(null);
  const [matchedConfig, setMatchedConfig] = useState<GrantConfig | null>(null);

  // Handle Date of Birth Change and Live Age Calculation
  const handleDobChange = (dateVal: string) => {
    setDob(dateVal);
    if (!dateVal) {
      setCalculatedAge(null);
      setMatchedConfig(null);
      return;
    }

    const birthDate = new Date(dateVal);
    const today = new Date("2026-05-20"); // Fixed system current local time from guidelines
    
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
      // Safe fallback for very high ages
      const fallback = DEFAULT_GRANT_CONFIGS[DEFAULT_GRANT_CONFIGS.length - 1];
      setMatchedConfig(fallback);
    }
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (formType === "login") {
      // Retrieve users from localStorage or fall back to seeds
      const storedUsersRaw = localStorage.getItem("apc_grants_users");
      let usersList: User[] = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];

      // Include initial seeds
      if (usersList.length === 0) {
        // Seeds are handled outside or compiled here
        const { SEED_USERS } = require("../data");
        usersList = SEED_USERS;
      }

      // Check credentials
      const foundUser = usersList.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() || u.phone === email
      );

      if (foundUser) {
        onAuthSuccess(foundUser);
        onNavigate("dashboard");
      } else {
        setErrorMsg("Verify your Email or Phone Number. If you don't have an account, click 'Register'.");
      }
    } else {
      // Registration Action
      if (calculatedAge === null || calculatedAge < 17) {
        setErrorMsg("Citizens must be aged 17 or above to be eligible for the APC Social Intervention Grant.");
        return;
      }

      if (!fullName || !dob || !phone || !email || !state || !password) {
        setErrorMsg("Please populate all the required citizenship variables.");
        return;
      }

      // Quick email verification
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setErrorMsg("Please submit a valid electronic email address.");
        return;
      }

      // Phone formatting check
      if (phone.length < 8) {
        setErrorMsg("Enterprise core expects a valid Nigerian phone number.");
        return;
      }

      // Read users from localStorage
      const storedUsersRaw = localStorage.getItem("apc_grants_users");
      const usersList: User[] = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];

      if (usersList.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
        setErrorMsg("An active grant file with this email already exists inside our archives.");
        return;
      }

      // Create new User profile
      const newUser: User = {
        id: `user-${Date.now()}`,
        fullName,
        dob,
        age: calculatedAge,
        phone,
        email,
        state,
        password,
        grantAmount: matchedConfig ? matchedConfig.grantAmount : 0,
        membershipFee: matchedConfig ? matchedConfig.membershipFee : 0,
        membershipStatus: "unpaid",
        withdrawalStatus: "not_requested",
        referralCode: fullName.substring(0, 4).toUpperCase() + Math.floor(10 + Math.random() * 90),
        referredBy: referralCode.trim() || undefined,
        referralsCount: 0,
        createdAt: new Date().toISOString()
      };

      // Append user to database
      usersList.push(newUser);
      localStorage.setItem("apc_grants_users", JSON.stringify(usersList));

      // Post-signup: Increment referral numbers if set
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

      onAuthSuccess(newUser);
      onNavigate("dashboard");
    }
  };

  return (
    <div className="bg-slate-950 min-h-[calc(100vh-64px)] py-12 flex items-center justify-center relative overflow-hidden font-sans">
      
      {/* Background ambience */}
      <div className="absolute top-[10%] left-[20%] w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[10%] right-[20%] w-72 h-72 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-5xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* Left Informative Column: Explaining user perks */}
        <div className="lg:col-span-5 text-left space-y-6 hidden lg:block">
          <div className="flex items-center space-x-2 text-emerald-400">
            <Sparkle className="w-5 h-5" />
            <span className="font-bold font-mono text-[10px] uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 border border-emerald-550/20 rounded">
              Secure Onboarding
            </span>
          </div>
          
          <h2 className="text-3xl font-black text-white leading-tight">
            The Direct Financial Link for <span className="text-emerald-400">Nigerian Citizens</span>
          </h2>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-xs font-bold text-emerald-400 font-mono mt-0.5 flex-shrink-0">
                1
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Age-Scale Grant Allocation</h4>
                <p className="text-xs text-slate-400 mt-0.5">Your grant size increases dynamically (₦180,000 to ₦750,000) mapped to your verified cohort.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-xs font-bold text-red-400 font-mono mt-0.5 flex-shrink-0">
                2
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">APC Membership Card Verify</h4>
                <p className="text-xs text-slate-400 mt-0.5">Secure payment activates your central digital card with interactive QR encryption to verify identity audits.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-xs font-bold text-emerald-400 font-mono mt-0.5 flex-shrink-0">
                3
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Withdraw Directly with Clearing</h4>
                <p className="text-xs text-slate-400 mt-0.5">Submit your official account, and await immediate administrator credit approval directly to your commercial bank.</p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-850 pt-4 flex items-center space-x-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Encrypted with AES-256 standard cyber clearance levels.</span>
          </div>
        </div>

        {/* Right Active Form Card */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
          
          {/* Header tabs inside card */}
          <div className="flex border-b border-slate-850 mb-6 font-semibold">
            <button
              onClick={() => {
                setFormType("login");
                setErrorMsg(null);
              }}
              className={`w-1/2 pb-3.5 text-center text-sm border-b-2 transition-colors ${
                formType === "login" 
                  ? "border-emerald-500 text-white font-extrabold" 
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setFormType("register");
                setErrorMsg(null);
              }}
              className={`w-1/2 pb-3.5 text-center text-sm border-b-2 transition-colors ${
                formType === "register" 
                  ? "border-emerald-500 text-white font-extrabold" 
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              Apply / Register
            </button>
          </div>

          <h3 className="text-lg font-bold text-white mb-1">
            {formType === "login" ? "Welcome back, Citizen!" : "Create Official Grant File"}
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            {formType === "login" 
              ? "Gain secure entrance to your dashboard to complete card activation and check withdrawals." 
              : "Verify your parameters accurately to claim your designated political empowerment aid."}
          </p>

          <AnimatePresence mode="wait">
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-950/20 border border-red-500/30 text-red-200 p-3 rounded-lg text-xs mb-4 flex items-start space-x-2"
              >
                <ShieldAlert className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                <span>{errorMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4 text-left text-xs font-sans">
            {formType === "login" ? (
              // Login Fields
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-350 font-bold uppercase tracking-wider mb-1.5 font-mono">
                    Email Address or Phone Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. citizen@gmail.com or 080..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3 pl-9 text-white focus:outline-none focus:border-emerald-500 text-sm"
                    />
                    <Mail className="absolute left-3 top-3.5 text-slate-500 w-4 h-4" />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-355 font-bold uppercase tracking-wider mb-1.5 font-mono">
                    Security Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3 pl-9 pr-10 text-white focus:outline-none focus:border-emerald-500 text-sm"
                    />
                    <KeyRound className="absolute left-3 top-3.5 text-slate-500 w-4 h-4" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // Registration Fields
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1 font-mono">
                      Full Name (Match Bank Account Name)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Amina Musa"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3 pl-9 text-white focus:outline-none focus:border-emerald-500 text-xs"
                      />
                      <UserIcon className="absolute left-3 top-3 text-slate-500 w-3.5 h-3.5" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1 font-mono">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      required
                      value={dob}
                      onChange={(e) => handleDobChange(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-emerald-500 text-xs text-slate-200 font-mono"
                    />
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
                      <div className="flex justify-between items-center font-mono">
                        <span>Calculated Age: <strong className="text-white">{calculatedAge} Years</strong></span>
                        <span>Eligibility status Map:</span>
                      </div>
                      
                      {calculatedAge >= 17 ? (
                        <div className="mt-2 flex justify-between items-end border-t border-slate-850 pt-2 font-sans">
                          <div>
                            <p className="text-[10px] text-slate-400">Assign bracket:</p>
                            <p className="font-bold text-white text-xs">{matchedConfig?.minAge}-{matchedConfig?.maxAge} Bracket</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-slate-400">Allocated Grant Value:</p>
                            <p className="font-black text-emerald-400 text-sm">₦{matchedConfig?.grantAmount.toLocaleString()}</p>
                          </div>
                        </div>
                      ) : (
                        <p className="mt-1 text-slate-400">Error: Applicants must be at least 17. The program currently prohibits enrollments under this age.</p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1 font-mono">
                      Phone Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                        placeholder="e.g. 08031234567"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3 pl-9 text-white focus:outline-none focus:border-emerald-500 text-xs font-mono"
                      />
                      <Phone className="absolute left-3 top-3 text-slate-500 w-3.5 h-3.5" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1 font-mono">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. name@gmail.com"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3 pl-9 text-white focus:outline-none focus:border-emerald-500 text-xs"
                      />
                      <Mail className="absolute left-3 top-3 text-slate-500 w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1 font-mono">
                      State of Residence (Nigeria)
                    </label>
                    <select
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3 text-slate-200 focus:outline-none focus:border-emerald-500 text-xs"
                    >
                      <option value="">-- Choose State --</option>
                      {NIGERIAN_STATES.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1 font-mono">
                      Referral Code (Optional)
                    </label>
                    <input
                      type="text"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                      placeholder="e.g. AISHA34"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-emerald-500 text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1.5 font-mono">
                    Secure Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3 pr-10 text-white focus:outline-none focus:border-emerald-500 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2 text-slate-400 hover:text-slate-200 focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full mt-2 flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-600 space-x-1 to-emerald-700 hover:from-emerald-500 hover:to-emerald-500 text-white font-black py-3 rounded-xl shadow-lg transition-transform hover:-translate-y-0.5 cursor-pointer text-sm"
            >
              <span>
                {formType === "login" ? "Sign In to Control Center" : "Accept Allocation & Register"}
              </span>
              <ArrowRight className="w-4 h-4 text-emerald-100" />
            </button>
          </form>

          {/* Quick instructions to bypass login during demo */}
          <div className="bg-slate-950 border border-slate-850/60 p-3 rounded-lg text-[10px] mt-6 text-slate-500 flex justify-between items-center text-left">
            <span>
              💡 <strong>Demo tip:</strong> To register as fresh, choose Apply tab. To simulate registered admin logs, click "Simulate Admin" in top bar!
            </span>
          </div>

        </div>
      </div>

    </div>
  );
}
