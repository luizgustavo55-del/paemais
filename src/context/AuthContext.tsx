import { auth, db, firestore } from "@/src/services/firebase";
import { get, ref } from "firebase/database";
import { doc, getDoc } from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";

type UserType = {
  uid: string;
  email: string;
  tipo: "pai" | "gestante";
};

type AuthContextType = {
  user: UserType | null;
  setUser: (user: UserType | null) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: any) {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const gestanteDocRef = doc(firestore, "usuarios", firebaseUser.uid);
        const gestanteSnap = await getDoc(gestanteDocRef);

        if (gestanteSnap.exists()) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || "",
            tipo: "gestante",
          });
          setLoading(false);
          return;
        }

        const paiRef = ref(db, `usuarios/${firebaseUser.uid}`);
        const paiSnap = await get(paiRef);

        if (paiSnap.exists()) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || "",
            tipo: "pai",
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error(error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth precisa estar dentro do AuthProvider");
  }

  return context;
}
