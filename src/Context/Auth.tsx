import React, { createContext, ReactNode, useEffect, useState } from 'react'
import { getAuth, signInWithPopup, signOut } from "firebase/auth";
import {Google} from '../Config/firebase'
import toast from 'react-hot-toast';

interface AuthContexTypes {
  user: User | undefined;
  singInWithGoogle: () => Promise<void>
  singOut: () => Promise<void>
}

interface User {
  id: string,
  name: string,
  avatar: string
}

interface AuthContextProviderProps {
  children: ReactNode
}

export const AuthContext = createContext({} as AuthContexTypes)

export default function AuthContextProvider(props: AuthContextProviderProps) {

  const [user, setUser] = useState<User>()

  const auth = getAuth();

  useEffect(() => {
    const authChange = auth.onAuthStateChanged(user => {

      if(user){
        const { displayName, photoURL, uid} = user

        setUser({
          id: uid,
          name: displayName!,
          avatar: photoURL!
        })
      }
    })

    return () => {
      authChange()
    }

  }, [auth, user])

  async function singInWithGoogle(){
    
    signInWithPopup(auth, Google)
      .then((result) => {
       
        const user = result.user;
        
        console.log(user)
        
      }).catch((error) => {
        toast.error(error.message)
      });
  }

  async function singOut(){
    signOut(auth).then(() => {

      setUser(undefined)

      toast.success("Logout feito com sucesso")
    })
    .catch((error) => {
      toast.error(error.message)
    })
  }

  return(
    <AuthContext.Provider value={ {user, singInWithGoogle, singOut }}>
      {props.children}
    </AuthContext.Provider>
  )

}
