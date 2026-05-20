import React, { useState } from "react";
import { 
  Users, Banknote, ShieldCheck, HelpCircle, ArrowUpRight, TrendingUp, Sparkles, 
  Settings, Send, Search, Bell, Filter, Edit3, Save, X, ThumbsUp, ThumbsDown, Check, RefreshCw,
  CreditCard, Key
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { NIGERIAN_STATES } from "../data";
import { User, Withdrawal, Payment, AppNotification, GrantConfig } from "../types";

interface AdminDashboardProps {
  users: User[];
  onUpdateUser: (updatedUser: User) => void;
  payments: Payment[];
  withdrawals: Withdrawal[];
  onApproveWithdrawal: (withdrawalId: string) => void;
  onRejectWithdrawal: (withdrawalId: string) => void;
  grantConfigs: GrantConfig[];
  onUpdateGrantConfigs: (updatedConfigs: GrantConfig[]) => void;
  onBroadcastNotification: (title: string, message: string, role: string) => void;
  paystackPublicKey?: string;
  onUpdatePaystackPublicKey?: (key: string) => void;
}

export default function AdminDashboard({
  users,
  onUpdateUser,
  payments,
  withdrawals,
  onApproveWithdrawal,
  onRejectWithdrawal,
  grantConfigs,
  onUpdateGrantConfigs,
  onBroadcastNotification,
  paystackPublicKey = "",
  onUpdatePaystackPublicKey = () => {}
}: AdminDashboardProps) {

  // Navigation tabs inside Admin
  const [adminTab, setAdminTab] = useState<"statistics" | "users" | "payouts" | "configuration" | "broadcast">("statistics");
  
  // Searching & Filtering Users
  const [searchQuery, setSearchQuery] = useState("");
  const [filterState, setFilterState] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Configuration editing states
  const [editingConfigId, setEditingConfigId] = useState<string | null>(null);
  const [editAmt, setEditAmt] = useState<number>(0);
  const [editFee, setEditFee] = useState<number>(0);

  // Paystack Backoffice Config editing states
  const [localPubKey, setLocalPubKey] = useState(paystackPublicKey);
  const [keySaveSuccess, setKeySaveSuccess] = useState(false);

  React.useEffect(() => {
    setLocalPubKey(paystackPublicKey);
  }, [paystackPublicKey]);

  // Broadcast Notification Form
  const [bcTitle, setBcTitle] = useState("");
  const [bcMessage, setBcMessage] = useState("");
  const [bcRole, setBcRole] = useState<"system" | "grant" | "payment" | "withdrawal">("system");
  const [bcSuccess, setBcSuccess] = useState(false);

  // Stats Computations
  const totalUsersCount = users.length;
  const totalGrantAllocated = users.reduce((acc, curr) => acc + curr.grantAmount, 0);
  const totalVerifiedPayments = payments.reduce((acc, curr) => acc + curr.amount, 0);
  const pendingWithdrawalsCount = withdrawals.filter(w => w.status === "pending").length;
  const totalDisbursedCash = withdrawals.filter(w => w.status === "approved").reduce((acc, curr) => acc + curr.amount, 0);

  // Compute State distributions for visual bar charts
  const stateTallies: { [key: string]: number } = {};
  users.forEach((u) => {
    stateTallies[u.state] = (stateTallies[u.state] || 0) + 1;
  });
  const distributedStates = Object.entries(stateTallies)
    .sort((a, b) => b[1] - a[1]) // Sort highest count first
    .slice(0, 5); // Take top 5

  // Users filter output
  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.phone.includes(searchQuery);
    const matchesState = filterState === "" || u.state === filterState;
    const matchesStatus = filterStatus === "" || u.membershipStatus === filterStatus;
    
    return matchesSearch && matchesState && matchesStatus;
  });

  // Handle saving the grant parameters
  const handleSaveConfig = (id: string) => {
    const updated = grantConfigs.map((config) => {
      if (config.id === id) {
        return { ...config, grantAmount: editAmt, membershipFee: editFee };
      }
      return config;
    });
    onUpdateGrantConfigs(updated);
    setEditingConfigId(null);
  };

  // Handle transmitting notification announcements
  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (bcTitle && bcMessage) {
      onBroadcastNotification(bcTitle, bcMessage, bcRole);
      setBcSuccess(true);
      setTimeout(() => {
        setBcTitle("");
        setBcMessage("");
        setBcSuccess(false);
      }, 3000);
    }
  };

  return (
    <div className="bg-slate-950 text-slate-100 min-h-[calc(100vh-64px)] font-sans">
      
      {/* Control Room Header */}
      <div className="bg-slate-900 border-b border-rose-950/40 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <div className="flex items-center space-x-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
              <h1 className="text-lg font-black tracking-tight uppercase text-white">Central Grant Command</h1>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">Disbursement Clearing Authority • Federal Republic of Nigeria</p>
          </div>

          {/* Quick Submenu Controls */}
          <div className="flex flex-wrap gap-2 text-xs font-bold leading-normal font-sans">
            {[
              { id: "statistics", label: "Executive Desk" },
              { id: "users", label: "Citizen Registry" },
              { id: "payouts", label: "Clearing Desk" },
              { id: "configuration", label: "Grant Matrix" },
              { id: "broadcast", label: "Broadcast Office" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setAdminTab(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-lg border text-[11px] transition-all font-semibold ${
                  adminTab === tab.id
                    ? "bg-red-650 border-red-500 font-black text-white shadow-lg shadow-red-900/20"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left">
        <AnimatePresence mode="wait">
          
          {/* VIEW 1: EXECUTIVE STATISTICS & ANALYTICS DESK */}
          {adminTab === "statistics" && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              
              {/* Executive Grid Stats Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl relative">
                  <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500 font-mono">Total Registrations</span>
                  <div className="mt-2.5 flex items-baseline space-x-1">
                    <p className="text-2xl font-black font-mono text-white">{totalUsersCount}</p>
                    <span className="text-[10px] text-slate-400">Citizens</span>
                  </div>
                  <p className="text-[9px] text-slate-500 mt-2">Active records inside electronic filing database.</p>
                </div>

                <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl relative">
                  <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500 font-mono">Assigned Aid Value</span>
                  <div className="mt-2.5">
                    <p className="text-2xl font-black font-mono text-white">₦{totalGrantAllocated.toLocaleString()}</p>
                  </div>
                  <p className="text-[9px] text-slate-500 mt-2">Sum of allocated budgets computed on DOB brackets.</p>
                </div>

                <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl relative">
                  <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500 font-mono">Verified Card Yield</span>
                  <div className="mt-2.5 leading-normal">
                    <p className="text-2xl font-black font-mono text-emerald-400">₦{totalVerifiedPayments.toLocaleString()}</p>
                  </div>
                  <p className="text-[9px] text-slate-500 mt-2">Total secure compliance fees verifying identity.</p>
                </div>

                <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl relative">
                  <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500 font-mono">Disbursement Clearing</span>
                  <div className="mt-2.5">
                    <p className="text-2xl font-black font-mono text-amber-500">₦{totalDisbursedCash.toLocaleString()}</p>
                  </div>
                  <p className="text-[9px] text-slate-500 mt-2">{pendingWithdrawalsCount} payout tasks currently outstanding.</p>
                </div>

              </div>

              {/* Main Analytics: State distributions with gorgeous custom bar grids */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* State Census Graph */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                  <h3 className="font-extrabold text-sm text-white uppercase tracking-wider font-mono mb-6">Top Constituent State Distribution</h3>
                  
                  {distributedStates.length === 0 ? (
                    <p className="text-xs text-slate-550 text-center py-12">No state records catalogued yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {distributedStates.map(([stateName, count]) => {
                        const pct = Math.round((count / totalUsersCount) * 100);
                        return (
                          <div key={stateName} className="space-y-1 text-xs">
                            <div className="flex justify-between items-baseline font-semibold">
                              <span className="text-slate-200 text-xs font-bold">{stateName} State</span>
                              <span className="text-slate-400 font-mono">{count} Enrollees ({pct}%)</span>
                            </div>
                            <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-850">
                              <div 
                                className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full rounded-full transition-all duration-1000" 
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Direct payment gateway feed log summaries */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative">
                  <h3 className="font-extrabold text-sm text-white uppercase tracking-wider font-mono mb-4">Central Payment Clearing Ledger</h3>
                  
                  <div className="space-y-2 max-h-[220px] overflow-y-auto">
                    {payments.length === 0 ? (
                      <p className="text-xs text-slate-550 py-12 text-center font-mono">No identity verification payments found.</p>
                    ) : (
                      payments.slice().reverse().map((pay) => (
                        <div key={pay.id} className="bg-slate-950/80 border border-slate-850 text-[10px] p-3 rounded-lg flex items-center justify-between font-mono">
                          <div>
                            <p className="font-bold text-slate-200">{pay.userFullName}</p>
                            <span className="text-[9px] text-slate-500 uppercase tracking-widest">{pay.paymentType} • Code Ref: {pay.reference}</span>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-emerald-400">+₦{pay.amount.toLocaleString()}</p>
                            <p className="text-[8px] text-slate-600">{new Date(pay.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

            </motion.div>
          )}

          {/* VIEW 2: ACTIVE CITIZEN REGISTRY */}
          {adminTab === "users" && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
                
                {/* Search & Filters */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-b border-slate-850 pb-5 mb-5 select-none text-[11px] font-sans">
                  <div className="relative w-full md:w-2/5">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search citizen names, emails, phone numbers..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-8 pr-3 text-white focus:outline-none focus:border-red-500 font-sans text-xs"
                    />
                    <Search className="absolute left-2.5 top-2.5 text-slate-500 w-3.5 h-3.5" />
                  </div>

                  <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    <select
                      value={filterState}
                      onChange={(e) => setFilterState(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-2 text-slate-400 focus:outline-none focus:border-red-500"
                    >
                      <option value="">All States</option>
                      {NIGERIAN_STATES.map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>

                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-2 text-slate-400 focus:outline-none focus:border-red-500"
                    >
                      <option value="">All Membership Status</option>
                      <option value="unpaid">Unpaid / Action Needed</option>
                      <option value="pending">Auditing Link</option>
                      <option value="paid">Active IDs Verified</option>
                    </select>
                  </div>
                </div>

                {/* Table list */}
                <div className="overflow-x-auto text-[11px]">
                  {filteredUsers.length === 0 ? (
                    <p className="text-center text-slate-500 font-mono py-16">No citizens corresponding to queries.</p>
                  ) : (
                    <table className="w-full text-left font-mono text-[10.5px]">
                      <thead>
                        <tr className="border-b border-slate-850 text-slate-500 uppercase tracking-widest text-[9.5px]">
                          <th className="py-2.5 px-2">Citizen Name</th>
                          <th className="py-2.5 px-2">Age / State</th>
                          <th className="py-2.5 px-2">Contact Link</th>
                          <th className="py-2.5 px-2">Grant Allocation</th>
                          <th className="py-2.5 px-2">APC Members card</th>
                          <th className="py-2.5 px-2">Disbursement</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850 text-slate-350">
                        {filteredUsers.slice().reverse().map((u) => (
                          <tr key={u.id}>
                            <td className="py-3 px-2 font-bold text-white capitalize">{u.fullName}</td>
                            <td className="py-3 px-2">{u.age} Yrs • {u.state}</td>
                            <td className="py-3 px-2 font-sans">{u.email} • {u.phone}</td>
                            <td className="py-3 px-2 font-bold text-emerald-400">₦{u.grantAmount.toLocaleString()}</td>
                            <td className="py-3 px-2">
                              {u.membershipStatus === "paid" ? (
                                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold px-1.5 py-0.5 rounded font-bold uppercase">
                                  VERIFIED ({u.membershipId})
                                </span>
                              ) : u.membershipStatus === "pending" ? (
                                <span className="bg-amber-500/10 text-amber-500 border border-amber-550/20 text-[9px] px-1.5 py-0.5 rounded uppercase animate-puls">Pending review</span>
                              ) : (
                                <span className="bg-slate-950 text-slate-500 text-[9px] px-1.5 py-0.5 rounded uppercase font-bold">Unpaid</span>
                              )}
                            </td>
                            <td className="py-3 px-2 uppercase">
                              {u.withdrawalStatus === "approved" && (
                                <span className="text-emerald-400 font-bold">DISBURSED</span>
                              )}
                              {u.withdrawalStatus === "pending" && (
                                <span className="text-amber-500 font-bold animate-pulse">PENDING REVIEW</span>
                              )}
                              {u.withdrawalStatus === "not_requested" && (
                                <span className="text-slate-500">NO CASHOUT</span>
                              )}
                              {u.withdrawalStatus === "rejected" && (
                                <span className="text-red-500 font-bold">REJECTED</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

              </div>
            </motion.div>
          )}

          {/* VIEW 3: SECURE CLEARING DESK (WITHDRAWALS APPROVALS SYSTEM) */}
          {adminTab === "payouts" && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
                <div className="border-b border-slate-850 pb-4 mb-6">
                  <h3 className="text-lg font-black text-white">Central Disbursement Signature Board</h3>
                  <p className="text-xs text-slate-400">Review, approve, or deny outstanding inter-bank cashout claims.</p>
                </div>

                <div className="space-y-3.5 max-h-[440px] overflow-y-auto">
                  {withdrawals.length === 0 ? (
                    <p className="text-xs text-slate-550 py-16 text-center font-mono">No withdrawal historical files are filed.</p>
                  ) : (
                    withdrawals.slice().reverse().map((wt) => {
                      const isPending = wt.status === "pending";
                      return (
                        <div 
                          key={wt.id} 
                          className={`p-4 rounded-2xl border text-xs font-mono font-sans flex flex-col sm:flex-row items-center justify-between gap-6 transition-all ${
                            isPending 
                              ? "bg-slate-950 border-amber-500/40 shadow-md ring-1 ring-amber-500/20" 
                              : "bg-slate-950/40 border-slate-850"
                          }`}
                        >
                          <div className="text-left font-mono leading-relaxed space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-white uppercase text-base">{wt.userFullName}</span>
                              <span className="bg-slate-900 text-slate-500 text-[8.5px] font-bold uppercase rounded px-1.5 py-0.5">
                                UserID Ref: {wt.userId.substring(0, 10)}...
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 text-[10px] text-slate-400">
                              <p>Bank: <strong className="text-slate-300 font-sans">{wt.bankName}</strong></p>
                              <p>NUBAN No: <strong className="text-slate-300 font-bold">{wt.accountNumber}</strong></p>
                              <p>Recipient Name: <strong className="text-slate-300 uppercase">{wt.accountName}</strong></p>
                              <p>Sum Filed: <strong className="text-emerald-400 font-bold">₦{wt.amount.toLocaleString()}</strong></p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            {isPending ? (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => onApproveWithdrawal(wt.id)}
                                  className="bg-emerald-600 hover:bg-emerald-555 text-white font-bold py-1.5 px-3.5 rounded-lg text-xs font-bold font-sans flex items-center space-x-1 shadow cursor-pointer"
                                >
                                  <Check className="w-3.5 h-3.5 mr-0.5" />
                                  <span>Approve payout</span>
                                </button>
                                <button
                                  onClick={() => onRejectWithdrawal(wt.id)}
                                  className="bg-red-950 border border-red-500 text-red-300 hover:bg-red-900 hover:text-white font-bold py-1.5 px-3.5 rounded-lg text-xs font-sans cursor-pointer"
                                >
                                  <span>Deny</span>
                                </button>
                              </div>
                            ) : (
                              <span className={`px-3 py-1 rounded font-bold tracking-wide uppercase text-[9px] font-mono border ${
                                wt.status === "approved" 
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25" 
                                  : "bg-red-500/10 text-red-400 border-red-500/25"
                              }`}>
                                {wt.status === "approved" ? "DISBURSED COMPLETED" : "DENIED FILE"}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

              </div>
            </motion.div>
          )}

          {/* VIEW 4: GRAN_CONFIG DETAILS EDITOR */}
          {adminTab === "configuration" && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="border-b border-slate-850 pb-4 mb-4">
                  <h3 className="text-lg font-black text-white">Federal Grant Bracket Configuration</h3>
                  <p className="text-xs text-slate-400">Dynamically update authorized funding allocations and compliance fee parameters.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    ⚙️ Modify the operational grant tiers here. Adjusting the values below automatically recalibrates the portal calculations. Newly registered citizens will lock-in the updated configuration parameters in real-time.
                  </p>
                </div>

                <div className="space-y-4">
                  {grantConfigs.map((cfg) => {
                    const isEditing = editingConfigId === cfg.id;
                    return (
                      <div 
                        key={cfg.id} 
                        className="bg-slate-950 border border-slate-850 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-5 text-xs font-mono"
                      >
                        <div className="text-left space-y-1">
                          <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                            Age Tier Category
                          </span>
                          <h4 className="font-extrabold text-sm text-white mt-1.5">{cfg.minAge === 41 ? "41+ Years" : `${cfg.minAge}–${cfg.maxAge} Years`} Bracket</h4>
                        </div>

                        {isEditing ? (
                          <div className="flex flex-wrap gap-4 items-end w-full md:w-auto">
                            <div className="w-36">
                              <label className="block text-[8px] text-slate-500 uppercase tracking-widest mb-1 font-mono">Grant Amount (₦)</label>
                              <input
                                type="text"
                                value={editAmt}
                                onChange={(e) => setEditAmt(parseInt(e.target.value.replace(/\D/g, "")) || 0)}
                                className="w-full bg-slate-900 border border-slate-850 py-1.5 px-2 rounded text-white text-xs font-bold font-mono focus:outline-none focus:border-red-500"
                              />
                            </div>
                            <div className="w-36">
                              <label className="block text-[8px] text-slate-500 uppercase tracking-widest mb-1 font-mono">Compliance Fee (₦)</label>
                              <input
                                type="text"
                                value={editFee}
                                onChange={(e) => setEditFee(parseInt(e.target.value.replace(/\D/g, "")) || 0)}
                                className="w-full bg-slate-900 border border-slate-850 py-1.5 px-2 rounded text-white text-xs font-bold font-mono focus:outline-none focus:border-red-500"
                              />
                            </div>
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => handleSaveConfig(cfg.id)}
                                className="p-1.5 bg-emerald-600 hover:bg-emerald-555 rounded text-white text-xs"
                                title="Save parameter"
                              >
                                <Save className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setEditingConfigId(null)}
                                className="p-1.5 bg-slate-850 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                                title="Cancel parameter change"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-8 justify-between w-full md:w-auto leading-normal">
                            <div className="text-left md:text-right font-mono">
                              <p className="text-[8px] text-slate-505 uppercase tracking-wider">Authorized Grant:</p>
                              <p className="font-extrabold text-sm text-white">₦{cfg.grantAmount.toLocaleString()}</p>
                            </div>
                            <div className="text-left md:text-right font-mono">
                              <p className="text-[8px] text-slate-505 uppercase tracking-wider">Verification Fee:</p>
                              <p className="font-extrabold text-sm text-red-400">₦{cfg.membershipFee.toLocaleString()}</p>
                            </div>
                            <button
                              onClick={() => {
                                setEditingConfigId(cfg.id);
                                setEditAmt(cfg.grantAmount);
                                setEditFee(cfg.membershipFee);
                              }}
                              className="p-2 border border-slate-800 hover:border-red-500 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                              title="Edit parameter values"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

              </div>

              {/* PAYMENT GATEWAY CONFIGURATION */}
              <div id="payment-gateway-config" className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6 mt-6">
                <div className="border-b border-slate-850 pb-4">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 bg-[#008751]/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                      <Key className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono">Nigerian Payment Gateway Settlement</h3>
                      <p className="text-xs text-slate-400">Integrate real online checkouts via the corporate Paystack SDK.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 font-sans text-xs">
                  <p className="text-slate-400 leading-relaxed">
                    By submitting your secure Paystack API keys, you link the citizen verification fee payment portal directly to your company settling account. Citizens will be prompted with the official inline checkout dialog powered by Paystack POP technology.
                  </p>

                  <div className="bg-slate-950 border border-slate-850 p-5 rounded-2xl space-y-4">
                    <div className="space-y-2">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-xs gap-1">
                        <label className="font-extrabold text-[#008751] uppercase tracking-wider font-mono text-[10px]">
                          Paystack Public Key (Live or Test)
                        </label>
                        <span className="text-[10px] text-slate-500 font-sans italic">
                          Begins with <code className="bg-slate-900 px-1.5 py-0.5 rounded text-amber-500 font-mono">pk_test_</code> or <code className="bg-slate-900 px-1.5 py-0.5 rounded text-emerald-500 font-mono">pk_live_</code>
                        </span>
                      </div>
                      
                      <div className="flex gap-2.5">
                        <div className="relative flex-grow">
                          <input
                            type="text"
                            value={localPubKey}
                            onChange={(e) => {
                              setLocalPubKey(e.target.value.trim());
                              setKeySaveSuccess(false);
                            }}
                            placeholder="e.g. pk_test_23df45..."
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-white font-mono text-xs focus:outline-none focus:border-[#008751] focus:bg-slate-950 shadow-inner"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            onUpdatePaystackPublicKey(localPubKey);
                            setKeySaveSuccess(true);
                            setTimeout(() => setKeySaveSuccess(false), 3000);
                          }}
                          className="flex items-center space-x-2 bg-[#008751] hover:bg-[#007345] text-white font-extrabold px-6 py-3 rounded-xl cursor-pointer shadow-sm transition-all text-xs uppercase tracking-wide shrink-0"
                        >
                          <Save className="w-4 h-4 text-white" />
                          <span>Save Key</span>
                        </button>
                      </div>

                      {keySaveSuccess && (
                        <p className="text-[10.5px] text-emerald-400 font-bold font-mono animate-pulse pt-1">
                          ✓ Key saved and updated across all online portals successfully!
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl text-[11px] text-slate-400 leading-relaxed space-y-1.5 font-sans">
                    <p className="font-bold text-white uppercase text-[10px] tracking-wider font-mono mb-1 text-slate-300">
                      💡 Operational Instructions:
                    </p>
                    <p>
                      1. Create your developer account or log in at <a href="https://dashboard.paystack.com" target="_blank" rel="noopener noreferrer" className="text-[#008751] font-bold hover:underline">dashboard.paystack.com</a>.
                    </p>
                    <p>
                      2. Go to <strong className="text-slate-200">Settings</strong> &gt; <strong className="text-slate-200">API Keys &amp; Webhooks</strong> on the sidebar.
                    </p>
                    <p>
                      3. Copy the <strong className="text-emerald-400 font-mono">Public Key</strong> (starting with <code className="text-amber-500">pk_test_</code> for staging/testing or <code className="text-emerald-500">pk_live_</code> for official collections).
                    </p>
                    <p>
                      4. Paste the public key in the field above to go live. Leaving it empty automatically defaults citizens to a pre-activated high-fidelity staging environment.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* VIEW 5: BROADCAST / SYSTEM ALERTS CENTER */}
          {adminTab === "broadcast" && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
                <div className="border-b border-slate-850 pb-4 mb-6">
                  <h3 className="text-lg font-black text-white">Central Citizen Broadcaster</h3>
                  <p className="text-xs text-slate-400">Publish global announcements directly into all registered citizen notification panels.</p>
                </div>

                {bcSuccess ? (
                  <div className="bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 p-4 rounded-xl text-xs space-y-2">
                    <p className="font-bold">Transmission Complete!</p>
                    <p>Alert injected. Every enrollee logged onto the network has received the official decree.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSendBroadcast} className="space-y-4 text-xs font-sans text-left">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-300 font-bold uppercase tracking-wider mb-2 font-mono">Alert Subject Title</label>
                        <input
                          type="text"
                          required
                          value={bcTitle}
                          onChange={(e) => setBcTitle(e.target.value)}
                          placeholder="e.g. Identity Audits Warning"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-red-500 text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-slate-300 font-bold uppercase tracking-wider mb-2 font-mono">Notification Group Classification</label>
                        <select
                          value={bcRole}
                          onChange={(e) => setBcRole(e.target.value as any)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3 text-slate-200 focus:outline-none focus:border-red-500 text-sm"
                        >
                          <option value="system">🚨 System Alerts Directive</option>
                          <option value="grant">💰 Grant Allocation Notice</option>
                          <option value="payment">💳 Identity Verification Confirmation</option>
                          <option value="withdrawal">💵 Bank Cashout Approved Announcement</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1 font-mono">Transmission message body</label>
                      <textarea
                        required
                        rows={4}
                        value={bcMessage}
                        onChange={(e) => setBcMessage(e.target.value)}
                        placeholder="Type alert contents here..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-red-500 text-sm resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="flex items-center justify-center space-x-2 bg-gradient-to-r from-red-650 to-red-650 hover:bg-red-500 text-white font-extrabold px-6 py-3 rounded-lg text-xs uppercase cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Release Broadcast Alert</span>
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}
