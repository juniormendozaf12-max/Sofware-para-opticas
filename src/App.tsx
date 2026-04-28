/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { BrowserRouter, HashRouter, Routes, Route, Navigate } from 'react-router-dom';

// file:// necesita HashRouter; http(s):// usa BrowserRouter
const Router = window.location.protocol === 'file:' ? HashRouter : BrowserRouter;
import { UserProfile } from './types';
import { seedDatabase, preloadCriticalData } from './lib/services';
import { setEstablecimiento } from './lib/supabase';
import Layout from './components/Layout';
import type { DoctorProfile } from './components/LoginScreen';

// Lazy-load ALL heavy components — only loaded when needed
const Dashboard = lazy(() => import('./components/Dashboard'));
const SplashScreen = lazy(() => import('./components/SplashScreen'));
const Patients = lazy(() => import('./components/Patients'));
const PatientProfile = lazy(() => import('./components/PatientProfile'));
const NewConsultation = lazy(() => import('./components/NewConsultation'));
const Inventory = lazy(() => import('./components/Inventory'));
const Sales = lazy(() => import('./components/Sales'));
const GamingZone = lazy(() => import('./components/GamingZone'));
const LoginScreen = lazy(() => import('./components/LoginScreen'));

const DEMO_SESSION_KEY = 'oa_demo_user';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [showSplash, setShowSplash] = useState(() => {
    // Solo mostrar splash una vez por sesión
    return !sessionStorage.getItem('oa_splash_shown');
  });

  const handleSplashFinish = useCallback(() => {
    sessionStorage.setItem('oa_splash_shown', '1');
    setShowSplash(false);
  }, []);

  useEffect(() => {
    const demoSession = localStorage.getItem(DEMO_SESSION_KEY);
    if (demoSession) {
      try {
        const parsed = JSON.parse(demoSession);
        setUser(parsed);
        // Restore establecimiento from saved user
        if (parsed.establecimiento) {
          setEstablecimiento(parsed.establecimiento);
        }
        // Preload data immediately so Dashboard has warm cache
        preloadCriticalData();
        setLoading(false);
        return;
      } catch { /* corrupted — fall through */ }
    }

    let unsubscribe: (() => void) | null = null;
    Promise.all([
      import('./lib/firebase'),
      import('firebase/firestore'),
    ]).then(([fb, firestore]) => {
      unsubscribe = fb.onAuthStateChanged(fb.auth, async (firebaseUser: any) => {
        if (firebaseUser) {
          try {
            const userDocRef = firestore.doc(fb.db, 'users', firebaseUser.uid);
            const userDoc = await firestore.getDoc(userDocRef);
            if (userDoc.exists()) {
              setUser(userDoc.data() as UserProfile);
            } else {
              const newUser: UserProfile = {
                uid: firebaseUser.uid,
                name: firebaseUser.displayName || 'Optometrista',
                email: firebaseUser.email || '',
                role: firebaseUser.email === 'juniormendozaf12@gmail.com' ? 'admin' : 'optometrist',
                photoURL: firebaseUser.photoURL || undefined,
              };
              await firestore.setDoc(userDocRef, newUser);
              setUser(newUser);
            }
            seedDatabase().catch(() => {});
          } catch { }
        }
        setLoading(false);
      });
    }).catch(() => {
      setLoading(false);
    });

    return () => { if (unsubscribe) unsubscribe(); };
  }, []);

  // ─── Login handlers ───

  const handleSelectStore = (storeId: string) => {
    setEstablecimiento(storeId);
    setSelectedStore(storeId);
  };

  const handleDoctorLogin = (storeId: string, doctor: DoctorProfile) => {
    setEstablecimiento(storeId);
    const demoUser: UserProfile = {
      uid: doctor.uid,
      name: doctor.name,
      email: doctor.email,
      role: doctor.role,
      establecimiento: storeId,
    };
    localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(demoUser));
    setUser(demoUser);
    // Preload data immediately so cache is warm before Dashboard renders
    preloadCriticalData();
    seedDatabase().catch(() => {});
  };

  const handleGoogleLogin = async () => {
    setLoginError('');
    try {
      const { auth, signInWithPopup, googleProvider } = await import('./lib/firebase');
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      const code = error?.code || '';
      if (code === 'auth/unauthorized-domain') {
        setLoginError('Dominio no autorizado. Usa ingreso directo.');
      } else {
        setLoginError('Error con Google. Usa ingreso directo.');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(DEMO_SESSION_KEY);
    import('./lib/firebase').then(({ auth, signOut }) => {
      signOut(auth).catch(() => {});
    }).catch(() => {});
    setUser(null);
    setSelectedStore(null);
  };

  // ─── Render ───

  const lazyFallback = null; // native-splash in index.html handles loading state

  const renderContent = () => {
    if (loading) return null; // native-splash visible

    if (!user) {
      return (
        <Suspense fallback={null}>
          <LoginScreen
            selectedStore={selectedStore}
            loginError={loginError}
            onSelectStore={handleSelectStore}
            onDoctorLogin={handleDoctorLogin}
            onGoogleLogin={handleGoogleLogin}
            onBack={() => setSelectedStore(null)}
          />
        </Suspense>
      );
    }

    return (
      <Router>
        <Routes>
          {/* Gaming Zone — Fullscreen immersive experience */}
          <Route path="/gaming" element={<Suspense fallback={lazyFallback}><GamingZone /></Suspense>} />

          {/* Main app with Layout */}
          <Route path="/*" element={
            <Layout user={user} onLogout={handleLogout}>
              <Suspense fallback={lazyFallback}>
                <Routes>
                  <Route path="/" element={<Dashboard user={user} />} />
                  <Route path="/patients" element={<Patients />} />
                  <Route path="/patients/new" element={<Patients />} />
                  <Route path="/patients/:id" element={<PatientProfile />} />
                  <Route path="/new-consultation/:patientId" element={<NewConsultation />} />
                  <Route path="/inventory" element={<Inventory />} />
                  <Route path="/sales" element={<Sales user={user} />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </Suspense>
            </Layout>
          } />
        </Routes>
      </Router>
    );
  };

  return (
    <>
      {renderContent()}
      {/* Splash overlay — renders on top, doesn't block content loading */}
      {showSplash && <Suspense fallback={null}><SplashScreen onFinish={handleSplashFinish} /></Suspense>}
    </>
  );
}
