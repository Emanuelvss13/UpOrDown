import style from "./style.module.scss"
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../Context/Auth";
import {ReactComponent as Up} from "../../Assets/up.svg"
import {ReactComponent as Down} from "../../Assets/down.svg"
import { FirestoreContext } from "../../Context/Firestore";

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

  const {createPost, allPosts, likePost, dislikePost} = useContext(FirestoreContext)

  useEffect(() => {
    setPosts(allPosts)
  }, [allPosts])

  return (
    <div className={style.Container}>
      <div className={style.CreatePostContainer} >
        <textarea
          onChange={({target}) => setPostBody(target.value)}
          value={postBody}
          placeholder="Escreva um topico!"
          rows={5}
        />
        <button onClick={() => createPost(postBody)} >Postar</button>
      </div>

      <div className={style.PostContentContainer} >
        {posts.length > 0 ?
          posts.map(post => (
            <div className={style.PostContainer} key={post.id}>
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
                  <p>{post.data.body}</p>
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
