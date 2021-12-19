import React, { createContext, ReactNode, useEffect, useState } from "react";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { Google, auth } from "../Config/firebase";
import toast from "react-hot-toast";

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
    onAuthStateChanged(auth, user => {

      if(user){
        const { displayName, photoURL, uid} = user

        setUser({
          id: uid,
          name: displayName!,
          avatar: photoURL!
        })
      }
    })
  }, [])

  async function singInWithGoogle() {
    signInWithPopup(auth, Google)
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
