import { useContext, useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import PostContent from "../../components/Post"
import { FirestoreContext } from "../../Context/Firestore"
import style from "./style.module.scss"

import send from "../../Assets/send.png"

interface Author {
  name: string;
  photo: string;
}

interface ComentariosProps {
  author: Author
  photo: string
  content: string
}

interface PostProps {
  author: Author;
  body: string;
  end: boolean;
  likes: string[];
  dislikes: string[];
  timestamp: string; 
  comentarios: ComentariosProps[]
}

interface PostType {
  data: PostProps;
  id: string;
}

export default function Post() {

  const {createComment} = useContext(FirestoreContext)

  const {id} = useParams()

  const navigate = useNavigate()

  const [post, setPost] = useState<PostType>()

  const [commentBody, setCommentBody] = useState("")

  const {findPostById} = useContext(FirestoreContext)

  useEffect(() => {

    if(id){
      findPostById(id).then(response => setPost(response as PostType)).catch(() => navigate("/"))
    }
  }, [findPostById, id, navigate])

  return (
    <div className={style.Container}>
      <div className={style.PostContainer} >
        {post && <PostContent post={post} scroll />}
      </div>
      <div className={style.CommentsContainer} >
        <div className={style.header} >
          <h3>Comentários</h3>
        </div>
        <div className={style.content} >
          {post?.data.comentarios.map(comment => (
            <div className={style.CommentContainer} >
              <div className={style.authorPhoto} >
                <img src={comment.author.photo} alt="foto de um usuário que fez um comentário" />
              </div>
              <div className={style.CommentText} >
                <p>{comment.author.name}</p>
                <span>{comment.content}</span>
              </div>
            </div>
          ))}
        </div>
        <div className={style.InputContainer}>
          <div>
            <input
              value={commentBody}
              onChange={({target}) => setCommentBody(target.value)}
              placeholder="Digite um comentário..."
            />
          </div>
            <div className={style.inputButton} onClick={() => createComment(commentBody, post!.id)} >
              <img src={send} alt="Enviar comentário" />
            </div>
        </div>
      </div>
    </div>
  )
}
