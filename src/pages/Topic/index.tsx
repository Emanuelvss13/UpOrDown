import { BaseSyntheticEvent, useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Topic from "../../components/Topic";
import { FirestoreContext } from "../../Context/Firestore";
import style from "./style.module.scss";
import send from "../../Assets/send.png";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../Config/firebase";
import { ReactComponent as Trash } from "../../Assets/trash.svg";
import { AuthContext } from "../../Context/Auth";

interface Author {
  id: string;
  name: string;
  photo: string;
}

interface ComentariosProps {
  author: Author;
  photo: string;
  content: string;
}

interface TopicProps {
  author: Author;
  body: string;
  end: boolean;
  likes: string[];
  dislikes: string[];
  timestamp: string;
  comentarios: ComentariosProps[];
}

interface TopicType {
  data: TopicProps;
  id: string;
}

export default function TopicPage() {
  const { createComment, deleteComment } = useContext(FirestoreContext);

  const { user } = useContext(AuthContext);

  const { id } = useParams();

  const navigate = useNavigate();

  const [topic, setTopic] = useState<TopicType>();

  const [commentBody, setCommentBody] = useState("");

  function toUserAccount(e: Event | BaseSyntheticEvent, userId: string) {
    e.stopPropagation();

    navigate(`/user/${userId}`);
  }

  useEffect(() => {
    if (id) {
      const unsubscribe = onSnapshot(doc(db, "Topics", id), (doc) => {
        if (!doc.exists()) {
          navigate("/");
        }

        const data = doc.data() as TopicProps;

        data.comentarios.reverse();

        setTopic({ data: data, id: id });
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
        {topic && <Topic topic={topic} scroll />}
      </div>
      <div className={style.CommentsContainer}>
        <div className={style.header}>
          <h3>Coment??rios</h3>
        </div>
        <div className={style.content}>
          {topic?.data.comentarios.sort().map((comment, index) => (
            <div className={style.CommentContainer} key={index}>
              <div className={style.authorPhoto}>
                <img
                  src={comment.author.photo}
                  alt="foto de um usu??rio que fez um coment??rio"
                />
              </div>
              <div className={style.commentContent}>
                <div className={style.commentAction}>
                  <p
                    className={style.author}
                    onClick={(e) => toUserAccount(e, comment.author.id)}
                  >
                    {comment.author.name}
                  </p>

                  {user?.id === comment.author.id ? (
                    <Trash
                      className={style.trash}
                      onClick={() => deleteComment(id!, comment)}
                    />
                  ) : (
                    ""
                  )}
                </div>

                <div className={style.CommentText}>
                  <span>{comment.content}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className={style.InputContainer}>
          <div>
            <input
              value={commentBody}
              onChange={({ target }) => setCommentBody(target.value)}
              placeholder="Digite um coment??rio..."
            />
          </div>
          <div
            className={style.inputButton}
            onClick={() => {
              createComment(commentBody, topic!.id, topic!.data.end);
              setCommentBody("");
            }}
          >
            <img src={send} alt="Enviar coment??rio" />
          </div>
        </div>
      </div>
    </div>
  );
}
