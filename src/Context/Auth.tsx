import React, { createContext, ReactNode, useEffect, useState } from "react";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { Google, auth, db } from "../Config/firebase";
import toast from "react-hot-toast";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";

interface AuthContexTypes {
  user: User | undefined;
  singInWithGoogle: () => Promise<void>;
  singOut: () => Promise<void>;
}

interface User {
  id: string;
  name: string;
  avatar: string;
}

interface AuthContextProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext({} as AuthContexTypes);

export default function AuthContextProvider(props: AuthContextProviderProps) {
  const [user, setUser] = useState<User>();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const { displayName, photoURL, uid } = user;

        setUser({
          id: uid,
          name: displayName!,
          avatar: photoURL!,
        });
      }
    });
  }, []);

  async function singInWithGoogle() {
    signInWithPopup(auth, Google)
      .then(async (response) => {
        const user = response.user;

        const userRef = collection(db, "Users");

        const qUser = query(userRef, where("id", "==", user.uid));

        const existUser = await getDocs(qUser);

        if (existUser.empty) {
          await addDoc(collection(db, "Users"), {
            id: user.uid,
            name: user.displayName,
            photo: user.photoURL,
          }).catch((e) => toast.error(e.message));
        }
      })
      .catch((error) => {
        toast.error(error.message);
      });
  }

  async function singOut() {
    signOut(auth)
      .then(() => {
        setUser(undefined);

        toast.success("Logout feito com sucesso");
      })
      .catch((error) => {
        toast.error(error.message);
      });
  }

  return (
    <AuthContext.Provider value={{ user, singInWithGoogle, singOut }}>
      {props.children}
    </AuthContext.Provider>
  );
}
