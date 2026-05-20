import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import LandingPage from "./components/LandingPage";
import AuthPage from "./components/AuthPage";
import UserDashboard from "./components/UserDashboard";
import AdminDashboard from "./components/AdminDashboard";
import { User, Withdrawal, Payment, AppNotification, GrantConfig } from "./types";
import { 
  SEED_USERS, SEED_WITHDRAWALS, SEED_PAYMENTS, SEED_NOTIFICATIONS, DEFAULT_GRANT_CONFIGS 
} from "./data";
import { 
  isSupabaseConfigured, 
  syncUserToSupabase, 
  syncPaymentToSupabase, 
  syncWithdrawalToSupabase, 
  syncNotificationToSupabase, 
  fetchAllUsersFromSupabase 
} from "./lib/supabaseClient";

export default function App() {
  
  // High-level App Routing state
  const [currentView, setCurrentView] = useState<string>("home");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);

  // Core local states (Simulating back-end database)
  const [users, setUsers] = useState<User[]>(() => {
    const raw = localStorage.getItem("apc_grants_users");
    return raw ? JSON.parse(raw) : SEED_USERS;
  });

  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>(() => {
    const raw = localStorage.getItem("apc_grants_withdrawals");
    return raw ? JSON.parse(raw) : SEED_WITHDRAWALS;
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    const raw = localStorage.getItem("apc_grants_payments");
    return raw ? JSON.parse(raw) : SEED_PAYMENTS;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const raw = localStorage.getItem("apc_grants_notifications");
    return raw ? JSON.parse(raw) : SEED_NOTIFICATIONS;
  });

  const [grantConfigs, setGrantConfigs] = useState<GrantConfig[]>(() => {
    const raw = localStorage.getItem("apc_grants_configs");
    return raw ? JSON.parse(raw) : DEFAULT_GRANT_CONFIGS;
  });

  // Cloud sync startup: Dynamic fetch from Supabase if active
  useEffect(() => {
    const syncFromCloud = async () => {
      if (isSupabaseConfigured()) {
        try {
          const cloudUsers = await fetchAllUsersFromSupabase();
          if (cloudUsers && cloudUsers.length > 0) {
            setUsers(cloudUsers);
            console.log("Supabase Connection Live: Sync'd users down successfully.");
          }
        } catch (e) {
          console.warn("Skipped initial Supabase sync due to setup mode:", e);
        }
      }
    };
    syncFromCloud();
  }, []);

  // Track state changes to localStorage
  useEffect(() => {
    localStorage.setItem("apc_grants_users", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem("apc_grants_withdrawals", JSON.stringify(withdrawals));
  }, [withdrawals]);

  useEffect(() => {
    localStorage.setItem("apc_grants_payments", JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem("apc_grants_notifications", JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem("apc_grants_configs", JSON.stringify(grantConfigs));
  }, [grantConfigs]);


  // NAVIGATION LOGIC
  const handleNavigate = (view: string) => {
    setCurrentView(view);
    // Smooth scroll safety
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // AUTHENTICATION LOGIC
  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    // Automatically match updated user parameters if state was edited (e.g. they had withdrawals approved in Admin view)
    const refreshed = users.find(u => u.id === user.id) || user;
    setCurrentUser(refreshed);
    
    // Auto sync user referrals counts and allocations
    setUsers(prev => prev.map(u => u.id === refreshed.id ? refreshed : u));
  };

  // Re-sync current logged bundle to state if administrative approvals happen
  useEffect(() => {
    if (currentUser) {
      const liveUser = users.find(u => u.id === currentUser.id);
      if (liveUser) {
        setCurrentUser(liveUser);
      }
    }
  }, [users, currentUser?.id]);

  const handleLogout = () => {
    setCurrentUser(null);
    handleNavigate("home");
  };

  // TOGGLING ADMIN SIMULATION OVERLAY
  const handleToggleAdmin = () => {
    const previousMode = isAdminMode;
    setIsAdminMode(!previousMode);
    
    if (!previousMode) {
      // Switched to Admin View
      setCurrentView("admin");
    } else {
      // Switched back to citizen user role
      if (currentUser) {
        setCurrentView("dashboard");
      } else {
        setCurrentView("home");
      }
    }
  };


  // DATABASE HANDLERS
  
  // Update a single User's profile variables
  const handleUpdateUser = (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (currentUser && currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
    if (isSupabaseConfigured()) {
      syncUserToSupabase(updatedUser).catch(err => console.error("User dual-sync failed:", err));
    }
  };

  // Add a card membership payment transaction
  const handleAddPayment = (newPayment: Payment) => {
    setPayments(prev => [...prev, newPayment]);

    // Construct matching notification card
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      userId: newPayment.userId,
      title: "APC Members Card Active",
      message: `Your identity payment of ₦${newPayment.amount.toLocaleString()} has cleared. Member ID card is fully configured.`,
      role: "payment",
      read: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [notif, ...prev]);

    if (isSupabaseConfigured()) {
      syncPaymentToSupabase(newPayment).catch(err => console.error("Payment sync failed:", err));
      syncNotificationToSupabase(notif).catch(err => console.error("Notification sync failed:", err));
      
      // Sync the user's updated unpaid/paid state as well
      const matchUser = users.find(u => u.id === newPayment.userId);
      if (matchUser) {
        syncUserToSupabase({ ...matchUser, membershipStatus: "paid" }).catch(console.error);
      }
    }
  };

  // Add a withdrawal claim request
  const handleAddWithdrawal = (newWithdrawal: Withdrawal) => {
    setWithdrawals(prev => [...prev, newWithdrawal]);

    // Construct withdrawal notification alert
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      userId: newWithdrawal.userId,
      title: "Payout Claim Lodged",
      message: `Direct cash application of ₦${newWithdrawal.amount.toLocaleString()} is filed under clearing logs.`,
      role: "withdrawal",
      read: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [notif, ...prev]);

    if (isSupabaseConfigured()) {
      syncWithdrawalToSupabase(newWithdrawal).catch(err => console.error("Withdrawal sync failed:", err));
      syncNotificationToSupabase(notif).catch(err => console.error("Withdrawal log notifications failed:", err));
      
      const matchUser = users.find(u => u.id === newWithdrawal.userId);
      if (matchUser) {
        syncUserToSupabase({ ...matchUser, withdrawalStatus: "pending" }).catch(console.error);
      }
    }
  };

  // ADMINISTRATIVE CONTROLS: AUTHORIZE WITHDRAWALS
  const handleApproveWithdrawal = (withdrawalId: string) => {
    // 1. Approve withdrawal ticket inside Ledger
    let targetUserId = "";
    let amountDisbursed = 0;

    setWithdrawals(prev => prev.map(w => {
      if (w.id === withdrawalId) {
        targetUserId = w.userId;
        amountDisbursed = w.amount;
        const updatedW = { ...w, status: "approved" as const };
        if (isSupabaseConfigured()) {
          syncWithdrawalToSupabase(updatedW).catch(console.error);
        }
        return updatedW;
      }
      return w;
    }));

    // 2. Clear withdrawal variables inside corresponding user accounts
    if (targetUserId) {
      setUsers(prev => prev.map(u => {
        if (u.id === targetUserId) {
          const updatedU = { ...u, withdrawalStatus: "approved" as const };
          if (isSupabaseConfigured()) {
            syncUserToSupabase(updatedU).catch(console.error);
          }
          return updatedU;
        }
        return u;
      }));

      // 3. Dispatch system notifications to users notification centers
      const notif: AppNotification = {
        id: `notif-${Date.now()}`,
        userId: targetUserId,
        title: "Federal Grant Disbursed 🎉",
        message: `Clearance approved! The sum of ₦${amountDisbursed.toLocaleString()} has been released electronically and credited to your commercial account.`,
        role: "withdrawal",
        read: false,
        createdAt: new Date().toISOString()
      };
      setNotifications(prev => [notif, ...prev]);
      if (isSupabaseConfigured()) {
        syncNotificationToSupabase(notif).catch(console.error);
      }
    }
  };

  // ADMINISTRATIVE CONTROLS: REJECT WITHDRAWAL
  const handleRejectWithdrawal = (withdrawalId: string) => {
    let targetUserId = "";

    setWithdrawals(prev => prev.map(w => {
      if (w.id === withdrawalId) {
        targetUserId = w.userId;
        const updatedW = { ...w, status: "rejected" as const };
        if (isSupabaseConfigured()) {
          syncWithdrawalToSupabase(updatedW).catch(console.error);
        }
        return updatedW;
      }
      return w;
    }));

    if (targetUserId) {
      setUsers(prev => prev.map(u => {
        if (u.id === targetUserId) {
          // Revert so they can enter a valid corrected account number
          const updatedU = { ...u, withdrawalStatus: "rejected" as const };
          if (isSupabaseConfigured()) {
            syncUserToSupabase(updatedU).catch(console.error);
          }
          return updatedU;
        }
        return u;
      }));

      const notif: AppNotification = {
        id: `notif-${Date.now()}`,
        userId: targetUserId,
        title: "Disbursement Rejected 🛑",
        message: `Inter-bank verification flagged your account name match as invalid. Visit withdrawal desk to submit valid details.`,
        role: "withdrawal",
        read: false,
        createdAt: new Date().toISOString()
      };
      setNotifications(prev => [notif, ...prev]);
      if (isSupabaseConfigured()) {
        syncNotificationToSupabase(notif).catch(console.error);
      }
    }
  };

  // Mark in-app notification read
  const handleMarkNotificationRead = (notifId: string) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
  };

  // Broadcast announcement alert (Admin)
  const handleBroadcastNotification = (title: string, message: string, role: string) => {
    const notif: AppNotification = {
      id: `bc-${Date.now()}`,
      userId: "all",
      title,
      message,
      role: role as any,
      read: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [notif, ...prev]);
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 antialiased selection:bg-[#008751]/20 selection:text-[#008751] flex flex-col justify-between">
      
      {/* Dynamic Header navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        currentUser={currentUser}
        onLogout={handleLogout}
        isAdmin={isAdminMode}
        onToggleAdmin={handleToggleAdmin}
      />

      {/* Primary Dynamic App Switchboard router */}
      <main className="flex-grow">
        {currentView === "home" && (
          <LandingPage onNavigate={handleNavigate} />
        )}

        {currentView === "faq" && (
          <div className="py-12">
            <LandingPage onNavigate={handleNavigate} />
          </div>
        )}

        {(currentView === "login" || currentView === "register") && (
          <AuthPage
            initialForm={currentView as any}
            onAuthSuccess={handleAuthSuccess}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === "dashboard" && currentUser && (
          <UserDashboard
            currentUser={currentUser}
            onUpdateUser={handleUpdateUser}
            payments={payments}
            onAddPayment={handleAddPayment}
            withdrawals={withdrawals}
            onAddWithdrawal={handleAddWithdrawal}
            notifications={notifications}
            onMarkNotificationRead={handleMarkNotificationRead}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === "admin" && (
          <AdminDashboard
            users={users}
            onUpdateUser={handleUpdateUser}
            payments={payments}
            withdrawals={withdrawals}
            onApproveWithdrawal={handleApproveWithdrawal}
            onRejectWithdrawal={handleRejectWithdrawal}
            grantConfigs={grantConfigs}
            onUpdateGrantConfigs={setGrantConfigs}
            onBroadcastNotification={handleBroadcastNotification}
          />
        )}
      </main>

    </div>
  );
}
