import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { userService } from '../lib/firestore';

interface AuthUser extends User {
  role?: string;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userData = await userService.getById(user.uid);
        setUser({ ...user, role: userData?.role });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading };
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();
      if (user) {
        const userData = await userService.getById(user.uid);
        resolve({ ...user, role: userData?.role });
      } else {
        resolve(null);
      }
    }, reject);
  });
}
