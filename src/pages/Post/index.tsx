import { BaseSyntheticEvent, useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PostContent from "../../components/Post";
import { FirestoreContext } from "../../Context/Firestore";
import style from "./style.module.scss";
import send from "../../Assets/send.png";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../Config/firebase";

interface Author {
  id: string
  name: string;
  photo: string;
}

interface ComentariosProps {
  author: Author;
  photo: string;
  content: string;
}

interface PostProps {
  author: Author;
  body: string;
  end: boolean;
  likes: string[];
  dislikes: string[];
  timestamp: string;
  comentarios: ComentariosProps[];
}

interface PostType {
  data: PostProps;
  id: string;
}

export default function Post() {
  const { createComment } = useContext(FirestoreContext);

  const { id } = useParams();

  const navigate = useNavigate();

  const [post, setPost] = useState<PostType>();

  const [commentBody, setCommentBody] = useState("");

  function toUserAccount(e: Event | BaseSyntheticEvent, userId: string){

    e.stopPropagation()

    navigate(`/user/${userId}`)
  }

  useEffect(() => {
    if (id) {
      const unsubscribe = onSnapshot(doc(db, "Topics", id), (doc) => {
        if (!doc.exists()) {
          navigate("/");
        }

        const data = doc.data() as PostProps;

        setPost({ data: data, id: id });
      });

      return () => {
        unsubscribe();
      };
    } else {
      navigate("/");
    }
  }, [id, navigate]);

  return (
    <div className={style.Container}>
      <div className={style.PostContainer}>
        {post && <PostContent topic={post} scroll />}
      </div>
      <div className={style.CommentsContainer}>
        <div className={style.header}>
          <h3>Comentários</h3>
        </div>
        <div className={style.content}>
          {post?.data.comentarios.reverse().map((comment) => (
            <div className={style.CommentContainer}>
              <div className={style.authorPhoto}>
                <img
                  src={comment.author.photo}
                  alt="foto de um usuário que fez um comentário"
                />
              </div>
              <div className={style.CommentText}>
                <p className={style.author} onClick={(e) => toUserAccount(e, comment.author.id)} >{comment.author.name}</p>
                <span>{comment.content}</span>
              </div>
            </div>
          ))}
        </div>
        <div className={style.InputContainer}>
          <div>
            <input
              value={commentBody}
              onChange={({ target }) => setCommentBody(target.value)}
              placeholder="Digite um comentário..."
            />
          </div>
          <div
            className={style.inputButton}
            onClick={() => {
              createComment(commentBody, post!.id, post!.data.end);
              setCommentBody("");
            }}
          >
            <img src={send} alt="Enviar comentário" />
          </div>
        </div>
      </div>
    </div>
  );
}
