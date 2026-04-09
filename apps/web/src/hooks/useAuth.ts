import { useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';

const googleProvider = new GoogleAuthProvider();

export function useAuth() {
  const { user, loading, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  const login = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  };

  const register = async (email: string, password: string, role: 'mentor' | 'mentee') => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await api.post('/users', {
      firebaseUid: result.user.uid,
      email: result.user.email,
      role,
    });
    return result.user;
  };

  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  };

  const logout = () => signOut(auth);

  return { user, loading, login, register, loginWithGoogle, logout };
}
