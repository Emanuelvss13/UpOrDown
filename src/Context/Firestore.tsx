import { addDoc, arrayRemove, arrayUnion, collection, deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore"
import { BaseSyntheticEvent, createContext, ReactNode, useContext} from "react"
import toast from "react-hot-toast"
import { db } from "../Config/firebase"
import { AuthContext } from "./Auth"

interface FirestoreConxtextProps {
  findPostById: (id: string) => Promise<Post>;
  createComment: (commentBody: string, postId: string) => Promise<void>;
  createPost: (body: string) => Promise<void>;
  deletePost: (postId: string, e: Event | BaseSyntheticEvent) => Promise<void>;
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

  const {user} = useContext(AuthContext)

  async function findPostById(id: string){

    const postRef = doc(db, "Posts", id)

    const postRaw = await getDoc(postRef)

    const post: Post = { id: postRaw.id, data: postRaw.data() } as Post

    return post
    
  }

  async function createComment(commentBody: string, postId: string){
    
    if(!user){
      toast.error("Se registre para fazer um comentário")
      return 
    }

    if(!commentBody){
      toast.error("Escreva algo no seu comentário!")
      return
    }


    const comentario = {
      author:{
        id: user.id,
        name: user.name,
        photo: user.avatar
      },
      content: commentBody,
      timestamp: new Date().toISOString()
    }

    try {

      toast.loading("Postando...")

      await updateDoc(doc(db, "Posts", postId), {
        comentarios: arrayUnion(comentario)
      }).then(() => toast.dismiss())

      toast.success("Comentário postado!")
      
    } catch (e: any) {
      toast.error(e.message)
    }

  }

  async function createPost(postBody: string){
    
    if(!user){
      toast.error("Se registre para criar um post")
      return 
    }

    if(!postBody){
      toast.error("Escreva algo no seu post!")
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

  async function deletePost(postId: string, e: Event | BaseSyntheticEvent){

    e.stopPropagation()

    await deleteDoc(doc(db, "Posts", postId))
    .then(() => toast.success("Post deletado com sucesso!"))
    .catch(e => toast.error(e.message))

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
    <FirestoreContext.Provider value={{ createPost, findPostById, createComment, deletePost, likePost, dislikePost }} >
      {children}
    </FirestoreContext.Provider>
  )
}
