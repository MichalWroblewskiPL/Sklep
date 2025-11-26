import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { User as FirebaseUser } from "firebase/auth";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

type Address = {
  street: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
};

export interface AppUser {
  uid: string;
  email: string | null;
  role: string;
  firstName?: string;
  lastName?: string;
  address?: Address;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          // 🔥 POBIERAMY CUSTOM CLAIMS — TU JEST PRAWDZIWA ROLA
          const tokenResult = await firebaseUser.getIdTokenResult();
          const claimRole = tokenResult.claims.role;

          // 🔥 POBIERAMY DANE Z FIRESTORE
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);

          let firestoreData: any = userDoc.exists() ? userDoc.data() : {};

          const selectedRole =
            claimRole || firestoreData.role || "user"; // priorytet: TOKEN → FIRESTORE → user

          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            role: selectedRole,
            firstName: firestoreData.firstName || "",
            lastName: firestoreData.lastName || "",
            address: firestoreData.address || {
              street: "",
              city: "",
              postalCode: "",
              country: "",
              phone: "",
            },
          });
        } catch (err) {
          console.error("Błąd pobierania danych użytkownika:", err);

          // fallback — minimalny user
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            role: "user",
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
