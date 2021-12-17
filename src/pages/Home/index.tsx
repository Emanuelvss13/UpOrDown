import style from "./style.module.scss"
import { collection, getDocs, addDoc, updateDoc, DocumentData, doc, arrayUnion, arrayRemove } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { db } from "../../Config/firebase";
import {toast} from "react-hot-toast"
import { AuthContext } from "../../Context/Auth";
import {ReactComponent as Up} from "../../Assets/up.svg"
import {ReactComponent as Down} from "../../Assets/down.svg"

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
  data: PostProps
  id: string;
}

export default function Home() {

  const {user} = useContext(AuthContext)

  const [postBody, setPostBody] = useState("")

  const [posts, setPosts] = useState<Post[]>([])

  async function getPosts(){

    const query = await getDocs(collection(db, "Posts"));

    const postsRaw = query.docs.map(doc => ({ data: doc.data(), id: doc.id })) as Post[]

    setPosts(postsRaw)
  }

  async function createPost(){

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
    }

    await updateDoc(doc(db, "Posts", postId), {
      likes: arrayUnion(userId),
      dislikes: arrayRemove(userId)
    }).then(() => getPosts())
  }

  async function dislikePost(userId: string | undefined, postId: string){

    if(!userId){
      toast.error("Se registre para dar down nesse post")
    }

    console.log(postId, userId)
    await updateDoc(doc(db, "Posts", postId), {
      likes: arrayRemove(userId),
      dislikes: arrayUnion(userId)
    }).then(() => getPosts())
  }

  useEffect(() => {
    getPosts()
  }, [])

  return (
    <div className={style.Container}>
      <div className={style.CreatePostContainer} >
        <textarea
          onChange={({target}) => setPostBody(target.value)}
          value={postBody}
          placeholder="Escreva um topico!"
          rows={5}
        />
        <button onClick={createPost} >Postar</button>
      </div>

      <div className={style.PostContentContainer} >
        {posts.length > 0 ?
          posts.map(post => (
            <div className={style.PostContainer} key={post.id}>
              {console.log(post.id)}
              <div className={style.header} >
                <div>
                  <img src={post.data.author.photo} alt="foto do autor" />
                  <p>{post.data.author.name}</p>
                </div>
                <p >{new Date(post.data.timestamp).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</p>
                {post.data.end ? <p className={style.off} >Encerrado</p> : <p className={style.on} >Ativo</p>}
              </div>
              <div className={style.content} >
                <div className={style.postBody} >
                  <p onClick={() => console.log(post.id)} >{post.data.body}</p>
                </div>
                <div className={style.actions} >
                  <div>
                    <Up className={style.up} onClick={() => likePost(user?.id, post.id)} />
                    <p>{post.data.likes.length}</p>
                  </div>
                  <div>
                    <Down className={style.down} onClick={() => dislikePost(user?.id, post?.id)} />
                    <p>{post.data.dislikes.length}</p>
                  </div>
                </div>
              </div>
            </div>
          )) 
        : 
        "Nenhum pos ainda :("}  
      </div>
    </div>
  )
}
