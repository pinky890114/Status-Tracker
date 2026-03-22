import React, { useState, useEffect } from 'react';
import { WifiOff, Lock } from 'lucide-react';
import { collection, doc, onSnapshot, setDoc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { db, auth } from './src/firebase';
import { APP_ID } from './constants';
import { Commission, AdminUser, CommissionFormData } from './types';
import ClientView from './components/ClientView';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  
  // Determine initial view based on URL path
  const [view, setView] = useState<'client' | 'admin'>(() => {
    try {
      if (typeof window !== 'undefined' && window.location.pathname === '/admin') {
        return 'admin';
      }
    } catch (e) {
      // Ignore security errors when accessing location
    }
    return 'client';
  });

  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [isAcceptingCommissions, setIsAcceptingCommissions] = useState(true);
  
  // Admin Authentication State
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);

  // --- Handle Browser Navigation (Back/Forward) ---
  useEffect(() => {
    const handlePopState = () => {
      try {
        if (window.location.pathname === '/admin') {
          setView('admin');
        } else {
          setView('client');
        }
      } catch (e) {
        setView('client');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // --- Auth State ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
      
      if (currentUser) {
        // Sync user to Firestore
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const role = currentUser.email?.toLowerCase() === 'pinky890114@gmail.com' ? 'admin' : 'client';
          
          await setDoc(userDocRef, {
            uid: currentUser.uid,
            email: currentUser.email,
            name: currentUser.displayName || '使用者',
            role: role
          }, { merge: true });

          if (view === 'admin') {
            setCurrentAdmin({
              name: currentUser.displayName || '管理員',
              ownerId: currentUser.uid
            });
          }
        } catch (error) {
          console.error("User sync failed:", error);
        }
      }
    });
    return () => unsubscribe();
  }, [view]);

  // --- Data Sync (Firestore) ---
  useEffect(() => {
    if (!isAuthReady) return;

    // Listen to commissions
    const q = query(collection(db, 'commissions'), orderBy('createdAt', 'desc'));
    const unsubscribeCommissions = onSnapshot(q, (snapshot) => {
      const data: Commission[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as Commission);
      });
      setCommissions(data);
      setGlobalError(null); // Clear error on success
    }, (error) => {
      if (error.message.includes('insufficient permissions')) {
        setGlobalError("權限不足：您的帳號沒有管理員權限。");
      } else {
        setGlobalError(`讀取資料失敗: ${error.message}`);
      }
      console.error('Firestore Error: ', error);
    });

    // Listen to config
    const unsubscribeConfig = onSnapshot(doc(db, 'config', 'main'), (docSnap) => {
      if (docSnap.exists()) {
        setIsAcceptingCommissions(docSnap.data().isAcceptingCommissions ?? true);
      }
    }, (error) => {
      // Config error is less critical but still log it
      console.error('Config Error: ', error);
    });

    return () => {
      unsubscribeCommissions();
      unsubscribeConfig();
    };
  }, [isAuthReady]);

  // Helper for safe navigation
  const safePushState = (path: string) => {
    try {
      window.history.pushState({}, '', path);
    } catch (e) {
      console.warn("History pushState failed (security restriction):", e);
    }
  };

  // --- Actions ---
  
  // Switch to Admin View
  const handleSwitchToAdmin = () => {
    safePushState('/admin');
    setView('admin');
    if (user) {
      setCurrentAdmin({
        name: user.displayName || '管理員', 
        ownerId: user.uid
      });
    }
  };

  const handleAdminLoginSuccess = (admin: AdminUser) => {
    setCurrentAdmin(admin);
    setView('admin'); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Switch to Client View (Logout)
  const handleAdminLogout = async () => {
    try {
      await signOut(auth);
      setCurrentAdmin(null);
      safePushState('/');
      setView('client');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleBackToClient = () => {
    setView('client');
    safePushState('/');
  };

  const handleAddCommission = async (data: CommissionFormData) => {
    const targetOwnerId = currentAdmin?.ownerId || data.ownerId;
    let targetOwnerName = currentAdmin?.name;
    if (!targetOwnerName) {
      targetOwnerName = data.type === 'FLOWING_SAND' ? '蘇沐' : '沈梨';
    }

    if (!data.clientId || !targetOwnerId) throw new Error("缺少必要資訊");
    
    const uniqueDocId = `${targetOwnerId}_${data.clientId}`;

    const newCommission: Commission = {
      ...data,
      clientId: data.clientId,
      id: uniqueDocId, 
      ownerId: targetOwnerId,
      ownerName: targetOwnerName,
      updatedAt: Date.now(),
      createdAt: Date.now()
    };

    try {
      await setDoc(doc(db, 'commissions', uniqueDocId), newCommission);
      
      // Send Telegram Notification via Server-side API (more secure and reliable)
      const typeLabel = data.type === 'FLOWING_SAND' ? '流麻' : '截圖';
      const message = `🎉 收到新的委託訂單！
${data.title ? `📌 委託標題：${data.title}\n` : ''}
👤 客戶暱稱：${data.clientName}
🆔 委託 ID：${data.clientId}
🎨 委託類型：${typeLabel}
💰 委託金額：${data.price ? '$' + data.price : '未填寫'}
📅 截止日期：${data.deadline || '未填寫'}

📞 聯絡方式：
${data.contactInfo || '無'}

📝 客戶需求備註：
${data.description || '無'}`;

      try {
        const response = await fetch('/api/notify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message }),
        });
        
        if (!response.ok) {
          const errData = await response.json();
          console.error("Telegram notification failed (via server):", errData);
        } else {
          console.log("Telegram notification sent successfully (via server)!");
        }
      } catch (fetchErr) {
        console.error("Telegram notification error (via server):", fetchErr);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `commissions/${uniqueDocId}`);
    }
  };

  const handleUpdateCommission = async (id: string, data: CommissionFormData) => {
    try {
      await updateDoc(doc(db, 'commissions', id), {
        ...data,
        updatedAt: Date.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `commissions/${id}`);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: number) => {
    try {
      await updateDoc(doc(db, 'commissions', id), {
        status: newStatus,
        updatedAt: Date.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `commissions/${id}`);
    }
  };

  const handleUpdateProductionNote = async (id: string, note: string) => {
    try {
      await updateDoc(doc(db, 'commissions', id), {
        productionNote: note,
        updatedAt: Date.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `commissions/${id}`);
    }
  };

  const handleUpdateDeliveryUrl = async (id: string, url: string) => {
    try {
      await updateDoc(doc(db, 'commissions', id), {
        deliveryUrl: url,
        updatedAt: Date.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `commissions/${id}`);
    }
  };

  const handleUpdateDeadline = async (id: string, deadline: string) => {
    try {
      await updateDoc(doc(db, 'commissions', id), {
        deadline,
        updatedAt: Date.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `commissions/${id}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!id) {
      alert("錯誤：無效的委託 ID");
      return;
    }

    try {
      await deleteDoc(doc(db, 'commissions', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `commissions/${id}`);
    }
  };

  const handleToggleAcceptingCommissions = async () => {
    try {
      await setDoc(doc(db, 'config', 'main'), {
        isAcceptingCommissions: !isAcceptingCommissions
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'config/main');
    }
  };

  // --- Render Logic ---
  const renderMainContent = () => {
    if (view === 'client') {
      return (
        <ClientView 
          commissions={commissions} 
          onRequestSubmit={handleAddCommission}
          isAcceptingCommissions={isAcceptingCommissions}
        />
      );
    }

    if (!currentAdmin) {
      return <AdminLogin onLogin={handleAdminLoginSuccess} />;
    }

    return (
      <AdminDashboard 
        key={currentAdmin.ownerId}
        currentAdmin={currentAdmin}
        commissions={commissions}
        isAcceptingCommissions={isAcceptingCommissions}
        onToggleAccepting={handleToggleAcceptingCommissions}
        onLogout={handleAdminLogout}
        onBackToClient={handleBackToClient}
        onAdd={handleAddCommission}
        onUpdate={handleUpdateCommission}
        onDelete={handleDelete}
        onUpdateStatus={handleUpdateStatus}
        onUpdateProductionNote={handleUpdateProductionNote}
        onUpdateDeadline={handleUpdateDeadline}
        onUpdateDeliveryUrl={handleUpdateDeliveryUrl}
      />
    );
  };

  return (
    <div className="min-h-screen bg-[#F9F5F0] text-[#5C4033] font-sans p-4 md:p-8">
      <main className="max-w-2xl mx-auto pb-20 pt-4">
        {globalError && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-center gap-2 font-bold animate-in slide-in-from-top duration-300">
            <WifiOff size={20} />
            {globalError}
          </div>
        )}
        {renderMainContent()}
      </main>

      <footer className="max-w-4xl mx-auto mt-16 text-center text-[#A67C52]/60 pb-10">
          <div className="text-sm font-bold tracking-[0.2em] uppercase">
            <p>委託進度追蹤系統</p>
            <div className="mt-3 flex justify-center items-center gap-2 text-lg text-[#A67C52]">
                <span>© Shen_LI</span>
            </div>
          </div>
          
          {view === 'client' && (
            <div className="mt-8 border-t border-[#D6C0B3]/50 pt-4 flex justify-center">
              <button 
                onClick={handleSwitchToAdmin}
                className="group flex items-center gap-1.5 p-3 rounded-full hover:bg-[#F2EFE9] transition-all cursor-pointer"
                title="前往後台"
              >
                <Lock size={16} className="text-[#D6C0B3] group-hover:text-[#A67C52] transition-colors" />
              </button>
            </div>
          )}
        </footer>
    </div>
  );
}