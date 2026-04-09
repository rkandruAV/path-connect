import { create } from 'zustand';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthState {
  user: FirebaseUser | null;
  loading: boolean;
  initialized: boolean;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  initialized: false,
  initialize: () => {
    if (useAuthStore.getState().initialized) return;
    set({ initialized: true });
    onAuthStateChanged(auth, (user) => {
      set({ user, loading: false });
    });
  },
}));
