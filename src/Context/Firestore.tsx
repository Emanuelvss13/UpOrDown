import { addDoc, arrayRemove, arrayUnion, collection, doc, getDoc, getDocs, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore"
import { BaseSyntheticEvent, createContext, ReactNode, useContext, useEffect, useState } from "react"
import toast from "react-hot-toast"
import { db } from "../Config/firebase"
import { AuthContext } from "./Auth"

interface FirestoreConxtextProps {
  allPosts: Post[];
  findPostById: (id: string) => Promise<Post>;
  createPost: (body: string) => Promise<void>;
  likePost: (userId: string | undefined, postId: string, e: Event | BaseSyntheticEvent) => Promise<void>;
  dislikePost: (userId: string | undefined, postId: string, e: Event | BaseSyntheticEvent) => Promise<void>;
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

  async function findPostById(id: string){

    const postRef = doc(db, "Posts", id)

    const postRaw = await getDoc(postRef)

    const post: Post = { id: postRaw.id, data: postRaw.data() } as Post

    return post
    
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
      })

      toast.success("Post criado com sucesso!")
    } catch (error: any) {
      toast.dismiss()
      toast.error(error.message)
    }
  }

  async function likePost(userId: string | undefined, postId: string, e: Event | BaseSyntheticEvent){

    e.stopPropagation()

    if(!userId){
      toast.error("Se registre para dar up nesse post")
      return
    }

    await updateDoc(doc(db, "Posts", postId), {
      likes: arrayUnion(userId),
      dislikes: arrayRemove(userId)
    }).catch(e => toast.error(e.message))
  }

  async function dislikePost(userId: string | undefined, postId: string, e: Event | BaseSyntheticEvent){

    e.stopPropagation()

    if(!userId){
      toast.error("Se registre para dar down nesse post")
      return
    }

    await updateDoc(doc(db, "Posts", postId), {
      likes: arrayRemove(userId),
      dislikes: arrayUnion(userId)
    }).catch(e => toast.error(e.message))
  }

  return (
    <FirestoreContext.Provider value={{ allPosts, createPost, findPostById, likePost, dislikePost }} >
      {children}
    </FirestoreContext.Provider>
  )
}
