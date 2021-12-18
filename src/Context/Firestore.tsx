import { addDoc, arrayRemove, arrayUnion, collection, doc, getDocs, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore"
import { createContext, ReactNode, useContext, useEffect, useState } from "react"
import toast from "react-hot-toast"
import { db } from "../Config/firebase"
import { AuthContext } from "./Auth"

interface FirestoreConxtextProps {
  allPosts: Post[];
  createPost: (body: string) => Promise<void>;
  likePost: (userId: string | undefined, postId: string) => Promise<void>;
  dislikePost: (userId: string | undefined, postId: string) => Promise<void>;
}

interface Author {
  name: string;
  photo: string;
}

interface PostProps {
  author: Author;
  body: string;
  end: boolean;
  likes: string[];
  dislikes: string[];
  timestamp: string; 
}

interface Post {
  data: PostProps;
  id: string;
}

interface FirestoreContextProviderProps {
  children: ReactNode;
}

export const FirestoreContext = createContext({} as FirestoreConxtextProps) 

export default function FirestoreContextProvider({children}: FirestoreContextProviderProps) {

  const [allPosts, setAllPosts] = useState<Post[]>([])

  const {user} = useContext(AuthContext)

  
  useEffect(() => {
    const postRef = collection(db, "Posts")

    const q = query(postRef, orderBy("timestamp", "desc"))

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const postsRaw = querySnapshot.docs.map(doc => ({ data: doc.data(), id: doc.id })) as Post[]

      setAllPosts(postsRaw)

    })

    return () => {
      unsubscribe()
    }

  }, [])

  async function getPosts(){

    

    

    

    
  }

  async function createPost(postBody: string){

    if(!user){
      toast.error("Se registre para criar um tópico")
      return 
    }

    try {

      toast.loading("Postando...")

      await addDoc(collection(db, "Posts"), {
        author:{
          id: user?.id,
          name: user?.name,
          photo: user?.avatar           
        },
        body: postBody,
        end: false,
        likes: [],
        dislikes: [],
        timestamp: new Date().toISOString(),
        comentarios: []
      }).then(() => {
        toast.dismiss()
        getPosts()
      })

      toast.success("Post criado com sucesso!")
    } catch (error: any) {
      toast.dismiss()
      toast.error(error.message)
    }
  }

  async function likePost(userId: string | undefined, postId: string){

    if(!userId){
      toast.error("Se registre para dar up nesse post")
      return
    }

    await updateDoc(doc(db, "Posts", postId), {
      likes: arrayUnion(userId),
      dislikes: arrayRemove(userId)
    }).then(() => getPosts())
  }

  async function dislikePost(userId: string | undefined, postId: string){

    if(!userId){
      toast.error("Se registre para dar down nesse post")
      return
    }

    await updateDoc(doc(db, "Posts", postId), {
      likes: arrayRemove(userId),
      dislikes: arrayUnion(userId)
    }).then(() => getPosts())
  }

  return (
    <FirestoreContext.Provider value={{ allPosts, createPost, likePost, dislikePost }} >
      {children}
    </FirestoreContext.Provider>
  )
}
