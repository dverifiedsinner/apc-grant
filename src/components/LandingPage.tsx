import React, { useState, useEffect } from "react";
import { 
  Sparkles, ShieldCheck, ArrowRight, BookOpen, Users, Banknote, HelpCircle, 
  Send, HeartHandshake, MapPin, Calendar, CheckCircle2, UserCheck, Smartphone, Search
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { FAQ_ITEMS, TESTIMONIALS, LIVE_FEED_INITIAL, NIGERIAN_STATES } from "../data";
import APCLogo from "./APCLogo";

interface LandingPageProps {
  onNavigate: (view: string) => void;
  onSelectAgeBracket?: (age: number) => void;
}

export default function LandingPage({ onNavigate }: LandingPageProps) {
  // Stats and Estimator State
  const [testAge, setTestAge] = useState<string>("");
  const [estimatedGrant, setEstimatedGrant] = useState<{ amount: number; fee: number; group: string } | null>(null);
  
  // Contact Form State
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactSuccess, setContactSuccess] = useState(false);

  // Live Feed State
  const [liveFeeds, setLiveFeeds] = useState(LIVE_FEED_INITIAL);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Auto incremental live-feed simulation
  useEffect(() => {
    const nigerianFirstNames = [
      "Ibrahim", "Amina", "Chinedu", "Olumide", "Ngozi", "Bello", "Chimezie", "Kelechi", 
      "Funmi", "Yusuf", "Zainab", "Oluwaseun", "Halima", "Korede", "Sani", "Efe", "Damilola"
    ];
    const nigerianLastNames = [
      "A.", "B.", "O.", "K.", "E.", "Y.", "S.", "M.", "N.", "H.", "T.", "F.", "G.", "W."
    ];
    const feedAmounts = ["₦180,000", "₦250,000", "₦350,000", "₦500,000", "₦750,000"];

    const interval = setInterval(() => {
      const randomName = `${nigerianFirstNames[Math.floor(Math.random() * nigerianFirstNames.length)]} ${nigerianLastNames[Math.floor(Math.random() * nigerianLastNames.length)]}`;
      const randomState = NIGERIAN_STATES[Math.floor(Math.random() * NIGERIAN_STATES.length)];
      const randomAmount = feedAmounts[Math.floor(Math.random() * feedAmounts.length)];
      
      const newFeed = {
        id: `lf-${Date.now()}`,
        name: randomName,
        state: randomState,
        amount: randomAmount,
        time: "Just now"
      };

      setLiveFeeds(prev => [newFeed, ...prev.slice(0, 5)]);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  // Handle live age estimation
  const handleEstimateAge = (val: string) => {
    setTestAge(val);
    if (!val) {
      setEstimatedGrant(null);
      return;
    }
    const age = parseInt(val);
    if (isNaN(age) || age < 17) {
      setEstimatedGrant({ amount: 0, fee: 0, group: "Ineligible (Under 17)" });
      return;
    }

    if (age >= 17 && age <= 20) {
      setEstimatedGrant({ amount: 180000, fee: 10000, group: "Youth Associate (17–20 Years)" });
    } else if (age >= 21 && age <= 25) {
      setEstimatedGrant({ amount: 250000, fee: 15000, group: "Youth Vanguard (21–25 Years)" });
    } else if (age >= 26 && age <= 30) {
      setEstimatedGrant({ amount: 350000, fee: 20000, group: "Strategic Professional (26–30 Years)" });
    } else if (age >= 31 && age <= 40) {
      setEstimatedGrant({ amount: 500000, fee: 30000, group: "National Builder (31–40 Years)" });
    } else {
      setEstimatedGrant({ amount: 750000, fee: 50000, group: "Demographic Leader (41+ Years)" });
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (contactName && contactEmail && contactMessage) {
      setContactSuccess(true);
      setTimeout(() => {
        setContactName("");
        setContactEmail("");
        setContactMessage("");
        setContactSuccess(false);
      }, 3500);
    }
  };

  return (
    <div className="bg-slate-50 text-slate-800 min-h-screen font-sans selection:bg-[#008751]/20 selection:text-[#008751]">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-24 border-b border-slate-200">
        {/* Dynamic lights for political visual appeal */}
        <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-[#008751]/10 via-[#D10000]/5 to-transparent blur-3xl rounded-full" />
        <div className="absolute top-[20%] right-[10%] w-72 h-72 bg-[#008751]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-[10%] left-[5%] w-96 h-96 bg-[#D10000]/5 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 text-left space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <APCLogo className="w-16 h-16 shadow-lg shrink-0" />
                <div className="space-y-1.5">
                  <div className="inline-flex items-center space-x-2 bg-white px-3.5 py-1.5 rounded-full border border-[#008751]/25 text-xs text-[#008751] font-mono shadow-sm">
                    <CheckCircle2 className="w-4 h-4 text-[#008751] animate-pulse" />
                    <span>OFFICIAL EMPOWERMENT DECREE: EM-2026-NGR</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono tracking-wider ml-1">ALL PROGRESSIVES CONGRESS • FEDERAL SECRETARIAT</p>
                </div>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
                Empowering the Future, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#008751] to-[#D10000]">
                  Securing the Nation
                </span>
              </h1>

              <p className="text-slate-600 antialiased text-base sm:text-lg max-w-xl">
                The APC Grants Platform delivers transparent financial disbursements of up to 
                <span className="text-[#008751] font-extrabold font-mono"> ₦750,000</span> directly to your bank account based on your verified age cohort. Over 
                <span className="text-[#D10000] font-extrabold font-mono font-bold"> ₦4.8 Billion</span> distributed.
              </p>

              {/* Dynamic live statistics summary */}
              <div className="grid grid-cols-3 gap-4 border-y border-slate-200 py-4 max-w-lg font-mono">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold font-black text-[#008751]">₦4.81B+</h3>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-sans">Disbursed Aid</p>
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold font-black text-slate-800">42,590+</h3>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-sans">Beneficiaries</p>
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold font-black text-[#D10000]">36 + FCT</h3>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-sans">States Covered</p>
                </div>
              </div>

              {/* Actions Section */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 max-w-md">
                <button
                  onClick={() => onNavigate("register")}
                  className="flex items-center justify-center space-x-2 bg-[#008751] hover:bg-[#007345] text-white font-bold px-6 py-3.5 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  <span>Apply for Grant Allocation</span>
                  <ArrowRight className="w-5 h-5 text-emerald-100" />
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById("faq-section");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="flex items-center justify-center border border-slate-300 hover:border-[#008751] text-slate-700 hover:text-[#008751] px-5 py-3.5 rounded-lg text-sm font-semibold hover:bg-slate-100 transition-all"
                >
                  How It Works
                </button>
              </div>

              {/* Citizen warning about security */}
              <p className="text-[11px] text-slate-500 italic">
                * APC membership verification card is strictly required to process automatic withdrawals and prevent cyber-clones. Standard compliance fees apply.
              </p>
            </div>

            {/* Right Estimator & Live Feeds Column */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Quick Eligibility Estimator widget */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative">
                <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/5 rounded-bl-full border-l border-b border-red-500/10" />
                
                <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                  <UserCheck className="w-5 h-5 text-[#008751]" />
                  <span>Check Your Grant Allocation</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  Input your age below to instantly calculate your official federal allocation bracket.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 font-mono">
                      Your Age (Minimum 17 Years)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={testAge}
                        onChange={(e) => handleEstimateAge(e.target.value.replace(/\D/g, ""))}
                        placeholder="e.g. 24"
                        className="w-full bg-slate-50 border border-slate-250 rounded-lg py-3 px-4 text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:border-[#008751] text-lg transition-colors"
                      />
                      <Calendar className="absolute right-3.5 top-3.5 text-slate-400 w-5 h-5" />
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {estimatedGrant && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-slate-50 border border-[#008751]/10 rounded-xl p-4 space-y-2"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] uppercase font-bold tracking-widest text-[#008751] bg-[#008751]/10 px-2 py-0.5 rounded border border-[#008751]/20">
                              {estimatedGrant.group}
                            </span>
                            <p className="text-xs text-slate-550 mt-1">APC Allocated Value:</p>
                          </div>
                          {estimatedGrant.amount > 0 && (
                            <span className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                              ₦{estimatedGrant.amount.toLocaleString()}
                            </span>
                          )}
                        </div>

                        {estimatedGrant.amount > 0 ? (
                          <div className="border-t border-slate-200/60 pt-2 flex justify-between items-center text-xs">
                            <span className="text-slate-500">Membership card fee:</span>
                            <span className="font-bold text-[#D10000] font-mono">₦{estimatedGrant.fee.toLocaleString()}</span>
                          </div>
                        ) : (
                          <p className="text-xs text-[#D10000] italic">Citizens under 17 years are not eligible for this allocation cycle.</p>
                        )}

                        {estimatedGrant.amount > 0 && (
                          <button
                            onClick={() => onNavigate("register")}
                            className="w-full mt-3 flex items-center justify-center space-x-1 bg-[#008751] hover:bg-[#007345] text-white text-xs font-bold py-2 rounded-lg transition-all cursor-pointer"
                          >
                            <span>Lock-in My Allocation</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Dynamic Live Withdrawal Ticker (Recent Beneficiary Feed) */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="flex h-3 w-3 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#008751] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-[#008751]"></span>
                    </span>
                    <h4 className="text-xs font-bold text-slate-700 font-mono tracking-wide uppercase">Live Disbursement Feed</h4>
                  </div>
                  <span className="text-[10px] text-slate-500 uppercase font-mono">Instant Payouts</span>
                </div>

                <div className="space-y-2 max-h-[190px] overflow-hidden relative">
                  <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                  
                  <AnimatePresence initial={false}>
                    {liveFeeds.map((feed) => (
                      <motion.div
                        key={feed.id}
                        initial={{ opacity: 0, height: 0, y: -10 }}
                        animate={{ opacity: 1, height: "auto", y: 0 }}
                        exit={{ opacity: 0, height: 0, y: 15 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex justify-between items-center text-xs"
                      >
                        <div className="flex items-center space-x-2">
                          <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center border border-slate-200 text-[10px] font-bold text-[#008751] font-mono">
                            NG
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{feed.name}</p>
                            <span className="text-[10px] text-slate-500 flex items-center">
                              <MapPin className="w-2.5 h-2.5 text-[#D10000] mr-0.5" />
                              {feed.state} State
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-bold text-[#008751]">{feed.amount}</p>
                          <p className="text-[9px] text-slate-400 font-mono">{feed.time}</p>
                        </div>
                      </motion.div>
                    ))}
                  </  AnimatePresence>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* About APC Grants Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex bg-[#D10000]/10 text-[#D10000] px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase border border-[#D10000]/20">
              National Social Intervention
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              The Official Renewed Hope <br />
              Grant Initiative
            </h2>
            <div className="h-1.5 w-24 bg-gradient-to-r from-[#008751] via-slate-250 to-[#D10000] rounded" />
            
            <p className="text-slate-600">
              The All Progressives Congress (APC) remains dedicated to improving human capital indexes, elevating small entrepreneurs, encouraging civic enrollment, and direct local financial development. 
            </p>
            <p className="text-slate-500 text-sm">
              Through direct banking integrations and age-calibrated algorithms, we bypass intermediaries to distribute designated state-backed funds right to verified accounts. This program acts as a national economic catalyst designed to reduce youth unemployment and empower community leaders across Nigeria.
            </p>

            <ul className="grid grid-cols-2 gap-3 font-semibold text-xs text-slate-700">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#008751]" />
                <span>Transparent payouts</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#008751]" />
                <span>Validated identity framework</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#008751]" />
                <span>Re-loadable Referral Bonus</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#008751]" />
                <span>36 States active support</span>
              </li>
            </ul>
          </div>

          {/* Graphical showcase of trust */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#008751]/5 to-[#D10000]/5 rounded-2xl filter blur-xl" />
            <div className="relative bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm overflow-hidden">
              <div className="absolute -top-12 -right-12 w-44 h-44 bg-[#008751]/5 rounded-full blur-2xl" />
              
              <div className="flex items-center space-x-3 mb-6">
                <ShieldCheck className="w-10 h-10 text-[#008751]" />
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Guaranteed Integrity</h3>
                  <p className="text-xs text-slate-500 font-mono">Verified Citizen disbursement system</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">Disbursement Status</p>
                    <p className="text-sm font-bold text-slate-800 mt-1">Platform Integrity Audited</p>
                  </div>
                  <span className="bg-[#008751]/10 text-[#008751] border border-[#008751]/20 text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase">
                    Secure C-196
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">Membership Enrollment</p>
                    <p className="text-sm font-bold text-slate-800 mt-1">Unique APC Card ID Generation</p>
                  </div>
                  <span className="bg-[#D10000]/10 text-[#D10000] border border-[#D10000]/20 text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase">
                    Anti-Clone
                  </span>
                </div>

                <div className="text-xs text-slate-500 border-t border-slate-150 pt-4 flex justify-between items-center font-mono">
                  <span>Authorized by:</span>
                  <span className="font-bold text-slate-600">APC Federal Committee</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 bg-white border-y border-slate-200 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto space-y-4 mb-16">
            <span className="text-xs font-bold font-mono text-[#008751] uppercase tracking-widest bg-[#008751]/10 px-3 py-1 rounded-full border border-[#008751]/20">
              Workflow Protocol
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              The 4-Step Disbursement Process
            </h2>
            <p className="text-slate-600 text-sm">
              We have engineered a structured citizenship financial aid flow. Fill your details, allocate based on age, activate your political identity, and request instant bank withdrawal.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Portal Registration",
                desc: "Provide your authentic Full Name, Date of Birth, Email, active Phone, and State of Residence to secure your portal slot.",
                icon: Users,
                color: "emerald"
              },
              {
                step: "02",
                title: "Automatic Assignment",
                desc: "Our automated age engine computes your exact age and links you directly to the designated grant bracket (up to ₦750,000).",
                icon: Calendar,
                color: "amber"
              },
              {
                step: "03",
                title: "APC ID Acquisition",
                desc: "Purchase your official APC Membership ID Card. This acts as visual security protocol and blocks artificial bots.",
                icon: ShieldCheck,
                color: "red"
              },
              {
                step: "04",
                title: "Withdrawal to Bank",
                desc: "Enter your bank details (Account Name, Number, and commercial Bank) and submit your funds directly into credit clearing.",
                icon: Banknote,
                color: "emerald"
              }
            ].map((node, idx) => {
              const Icon = node.icon;
              return (
                <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-left relative overflow-hidden group hover:border-[#008751]/50 transition-colors shadow-sm">
                  <div className="absolute top-2 right-4 text-4xl sm:text-5xl font-black font-mono text-slate-200/50 group-hover:text-[#008751]/10 transition-colors">
                    {node.step}
                  </div>
                  <div className="relative z-10 space-y-4 mt-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white border border-slate-250">
                      <Icon className="w-5 h-5 text-[#008751]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{node.title}</h4>
                      <p className="text-slate-500 text-xs mt-2 leading-relaxed">{node.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Grant Categories (Age Brackets) */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-2xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-bold font-mono text-[#D10000] uppercase tracking-widest bg-[#D10000]/10 px-3 py-1 rounded-full border border-[#D10000]/15">
            Allocation Matrix
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
            Age Bracket & Membership Scales
          </h2>
          <p className="text-slate-500 text-sm">
            Fund allocations are tailored to match each age cohort’s unique requirements. Higher age ranges reflect demographic dependency levels.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {[
            { range: "17–20 Years", grant: "₦180,000", fee: "₦10,000", title: "Youth Associate" },
            { range: "21–25 Years", grant: "₦250,050", fee: "₦15,000", title: "Youth Vanguard", highlight: true },
            { range: "26–30 Years", grant: "₦350,000", fee: "₦20,000", title: "Strategic Professional" },
            { range: "31–40 Years", grant: "₦500,000", fee: "₦30,000", title: "National Builder" },
            { range: "41+ Years", grant: "₦750,000", fee: "₦50,000", title: "Demographic Leader" }
          ].map((item, index) => (
            <div 
              key={index} 
              className={`rounded-2xl p-6 border text-left relative overflow-hidden transition-all duration-300 transform hover:-translate-y-1 shadow-sm ${
                item.highlight 
                  ? "bg-white border-[#008751] shadow-md ring-1 ring-[#008751]/30" 
                  : "bg-white border-slate-200"
              }`}
            >
              {item.highlight && (
                <div className="absolute top-0 right-0 bg-[#008751] text-white font-black text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-bl-lg font-mono">
                  POPULAR
                </div>
              )}
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#008751] block mb-1 font-mono">
                {item.title}
              </span>
              <h4 className="text-lg font-black text-slate-900">{item.range}</h4>
              <div className="my-5">
                <span className="text-[10px] text-slate-500 block font-mono font-bold">GRANT ALLOCATION</span>
                <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">{item.grant}</span>
              </div>
              <div className="border-t border-slate-100 pt-4 flex justify-between items-center text-xs text-slate-550">
                <span className="text-slate-500">ID Verification fee:</span>
                <span className="font-bold font-mono text-[#D10000]">{item.fee}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-slate-100/35 border-y border-slate-200 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        <div className="max-w-2xl mx-auto text-center space-y-4 mb-16">
          <span className="text-xs font-bold font-mono text-amber-800 uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            Citizen Stories
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
            Testimonials from verified beneficiaries
          </h2>
          <p className="text-slate-500 text-sm">
            Thousands of Nigerians from Lagos to Kano have successfully enrolled, verified, and received their disbursements. Hear their stories.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TESTIMONIALS.map((item, index) => (
            <div key={index} className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col justify-between space-y-4 relative overflow-hidden shadow-sm group">
              <div className="absolute -top-10 -left-10 w-24 h-24 bg-[#008751]/5 rounded-full blur-xl group-hover:bg-[#008751]/10 transition-colors" />
              
              <div className="space-y-3 relative z-10">
                <div className="flex items-center space-x-2">
                  {[...Array(5)].map((_, i) => (
                    <Sparkles key={i} className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  ))}
                </div>
                <p className="text-slate-600 text-xs italic leading-relaxed">"{item.text}"</p>
              </div>

              <div className="flex items-center space-x-3 pt-4 border-t border-slate-105 relative z-10 font-sans">
                <img 
                  src={item.avatar} 
                  alt={item.name} 
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full object-cover border border-[#008751]/30" 
                />
                <div>
                  <h4 className="font-bold text-slate-800 text-xs">{item.name}</h4>
                  <div className="flex items-center text-[10px] text-slate-500 mt-0.5">
                    <span className="font-mono text-[#008751] font-semibold mr-1">{item.amount}</span>
                    <span>• {item.state}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq-section" className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        <div className="text-center space-y-4 mb-16">
          <span className="text-xs font-bold font-mono text-[#008751] uppercase tracking-widest bg-[#008751]/10 px-3 py-1 rounded-full border border-[#008751]/15">
            Support Resources
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-550 text-sm">
            Everything you need to know about the eligibility criteria, card purchase processing, and bank disbursements.
          </p>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <div 
                key={index} 
                className="bg-white border border-slate-200 rounded-xl overflow-hidden transition-all duration-200 shadow-sm"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none"
                >
                  <span className="font-bold text-slate-800 text-sm sm:text-base pr-4">
                    {faq.question}
                  </span>
                  <HelpCircle className={`w-5 h-5 text-[#008751] flex-shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-slate-600 text-xs sm:text-sm border-t border-slate-100 leading-relaxed font-sans">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-slate-100/25 border-t border-slate-200 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          <div className="space-y-6">
            <span className="text-xs font-bold font-mono text-[#008751] uppercase tracking-widest bg-[#008751]/10 px-3 py-1 rounded-full border border-[#008751]/20">
              Citizens Desk
            </span>
            <h2 className="text-3xl font-black text-slate-900">Contact Our Team</h2>
            <p className="text-slate-550 text-sm leading-relaxed">
              Have specific questions regarding a pending payment or registration discrepancy? Our support desk manages active communication with the central advisory panel. Send an inquiry or visit our central registry office.
            </p>

            <div className="space-y-4 font-mono text-xs">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-[#D10000] mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">Registry Headquarters</h4>
                  <p className="text-slate-550 mt-1">APC National Secretariat, Plot 40 Blantyre Street, Wuse 2, Abuja, FCT, Nigeria</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Smartphone className="w-5 h-5 text-[#008751] mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">Citizen Hotline</h4>
                  <p className="text-slate-550 mt-1">+234 (0) 803 123 4567, +234 (0) 815 999 8888</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 mb-4">Send a message</h3>
            
            {contactSuccess ? (
              <div className="bg-emerald-50 border border-emerald-500/20 text-[#008751] p-4 rounded-xl text-xs space-y-2">
                <p className="font-bold">Message Transmitted Successfully!</p>
                <p>The citizen support agent has logged your message. We will respond back via email shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4 text-xs font-sans">
                <div>
                  <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1 font-mono">Full Name</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 text-slate-900 focus:outline-none focus:border-[#008751] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1 font-mono">Email Address</label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 text-slate-900 focus:outline-none focus:border-[#008751] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1 font-mono">Inquiry Message</label>
                  <textarea
                    required
                    rows={3}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Describe your inquiry..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 text-slate-900 focus:outline-none focus:border-[#008751] text-sm resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center space-x-2 bg-[#008751] hover:bg-[#007345] text-white font-bold py-3 rounded-lg transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Transmit Message</span>
                </button>
              </form>
            )}
          </div>

        </div>
      </section>

      {/* Dynamic CTA Board */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-[#008751]/5 via-[#D10000]/5 to-transparent blur-3xl pointer-events-none" />
        <div className="bg-white border border-slate-250 rounded-3xl p-8 sm:p-12 relative z-10 space-y-6 shadow-sm">
          <HeartHandshake className="w-12 h-12 text-[#008751] mx-auto animate-bounce" />
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900">Secure Your Financial Citizen Right</h2>
          <p className="text-slate-600 max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
            The Renewed Hope disbursement budget is designated. Delaying your registration may schedule your payout to the next central fiscal quarter. Register right away.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 max-w-xs sm:max-w-md mx-auto pt-4">
            <button
              onClick={() => onNavigate("register")}
              className="bg-[#008751] hover:bg-[#007345] text-white font-extrabold px-6 py-3.5 rounded-lg shadow cursor-pointer"
            >
              Get Started Now
            </button>
            <button
              onClick={() => onNavigate("login")}
              className="border border-slate-300 text-slate-700 px-6 py-3.5 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-all"
            >
              Sign In to Dashboard
            </button>
          </div>
        </div>
      </section>

      {/* Unified Federal Footer */}
      <footer className="border-t border-slate-200 bg-slate-100/90 py-12 text-slate-500 text-xs text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex justify-center space-x-6 text-slate-600 font-semibold">
            <span className="cursor-pointer hover:text-[#008751]">Terms &amp; Conditions</span>
            <span>•</span>
            <span className="cursor-pointer hover:text-[#008751]">Privacy Policy</span>
            <span>•</span>
            <span className="cursor-pointer hover:text-[#008751]">Refund Policy</span>
            <span>•</span>
            <span className="cursor-pointer hover:text-[#008751]">Eligibility Disclaimers</span>
          </div>
          <p className="max-w-md mx-auto leading-relaxed text-[11px] text-slate-500">
            APC Grants is a socio-economic national outreach. All transactions are catalogued under the Ministry of Budget and Economic Planning. Membership fee covers credential identification issuance and infrastructure protection audits.
          </p>
          <p className="font-mono text-[10px] text-slate-400">
            © 2026 All Progressives Congress Social Intervention Platform. All Rights Reserved.
          </p>
        </div>
      </footer>

    </div>
  );
}
