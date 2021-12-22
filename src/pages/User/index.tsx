import {
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PostContent from "../../components/Topic";
import { db } from "../../Config/firebase";
import style from "./style.module.scss";

interface UserProps {
  id: string;
  name: string;
  photo: string;
}

interface ComentariosProps {
  author: AuthorPost;
  photo: string;
  content: string;
}

interface AuthorPost {
  id: string;
  name: string;
  photo: string;
}

interface PostProps {
  author: AuthorPost;
  body: string;
  end: boolean;
  likes: string[];
  dislikes: string[];
  timestamp: string;
  comentarios: ComentariosProps[];
}

interface Post {
  data: PostProps;
  id: string;
}

export default function User() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [user, setUser] = useState<UserProps>();
  const [topics, setTopics] = useState<Post[]>();
  const [postQuery, setPostQuery] = useState(0);
  const [noPost, setNoPost] = useState(false);
  const [filter, setFilter] = useState(0);

  useEffect(() => {
    if (id) {
      const userRef = collection(db, "Users");

      const qUser = query(userRef, where("id", "==", id));

      getDocs(qUser).then((data) => {
        if (data.docs.length === 0) {
          navigate("/");
        }

        data.docs.map((user) => setUser(user.data() as UserProps));
      });

      const postRef = collection(db, "Topics");

      let qPost;

      switch (postQuery) {
        case 1:
          qPost = query(postRef, where("likes", "array-contains", id));
          break;
        case 2:
          qPost = query(postRef, where("dislikes", "array-contains", id));
          break;
        default:
          qPost = query(postRef, where("author.id", "==", id));
      }

      const unsubscribe = onSnapshot(qPost, (querySnapshot) => {
        setNoPost(querySnapshot.empty);
        const topicsRaw = querySnapshot.docs.map((doc) => ({
          data: doc.data(),
          id: doc.id,
        })) as Post[];

        let topics;

        switch (filter) {
          case 1:
            topics = topicsRaw.filter((post) => post.data.end === false);
            break;
          case 2:
            topics = topicsRaw.filter((post) => post.data.end === true);
            break;
          default:
            topics = topicsRaw;
            break;
        }

        setTopics(topics);
      });

      return () => {
        unsubscribe();
      };
    }
  }, [filter, id, navigate, postQuery]);

  return (
    <div className={style.Container}>
      {user && (
        <div className={style.UserContainer}>
          <div className={style.userInfo}>
            <img src={user.photo} alt="foto do usuário" />
            <p className={style.userName}>{user.name}</p>

            <p
              className={
                postQuery === 0 ? style.myTopicsActive : style.myTopics
              }
              onClick={() => setPostQuery(0)}
            >
              Tópicos
            </p>
            <p
              className={postQuery === 1 ? style.myLikesActive : style.myLikes}
              onClick={() => setPostQuery(1)}
            >
              Up&rsquo;s
            </p>
            <p
              className={
                postQuery === 2 ? style.myDislikesActive : style.myDislikes
              }
              onClick={() => setPostQuery(2)}
            >
              Down&rsquo;s
            </p>

            <span>
              {topics?.length}{" "}
              {topics && topics.length > 1 ? ` Tópicos` : `Tópico`}
            </span>
          </div>
        </div>
      )}

      <div className={style.TopicsContainer}>
        {noPost ? (
          <div className={style.noContent}>
            <p>Nenhum Tópico Encontrado</p>
          </div>
        ) : (
          <>
            <div className={style.userPageActions}>
              <p
                className={filter === 1 ? style.activeSelected : style.active}
                onClick={() => setFilter(1)}
              >
                Ativos
              </p>
              <p
                className={filter === 0 ? style.allSelected : style.all}
                onClick={() => setFilter(0)}
              >
                Todos
              </p>
              <p
                className={filter === 2 ? style.closedSelected : style.closed}
                onClick={() => setFilter(2)}
              >
                Encerrados
              </p>
            </div>

            {topics && topics.length > 0 ? (
              topics?.map((topic) => (
                <PostContent key={topic.id} topic={topic} />
              ))
            ) : (
              <div className={style.noContent} style={{height: "50%"}} >
                <p>Nenhum Tópico Encontrado</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
