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
        setTopics(topicsRaw);
      });

      return () => {
        unsubscribe();
      };
    }
  }, [id, navigate, postQuery]);

  return (
    <div className={style.Container}>
      {user && (
        <div className={style.UserContainer}>
          <div className={style.userInfo}>
            <img src={user.photo} alt="" />
            <p className={style.userName}>{user.name}</p>

            <p
              className={
                postQuery === 0 ? style.myTopicsActive : style.myTopics
              }
              onClick={() => setPostQuery(0)}
            >
              Meus Tópicos
            </p>
            <p
              className={postQuery === 1 ? style.myLikesActive : style.myLikes}
              onClick={() => setPostQuery(1)}
            >
              Meus Up&rsquo;s
            </p>
            <p
              className={
                postQuery === 2 ? style.myDislikesActive : style.myDislikes
              }
              onClick={() => setPostQuery(2)}
            >
              Meus Down&rsquo;s
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
          topics?.map((topic) => <PostContent key={topic.id} topic={topic} />)
        )}
      </div>
    </div>
  );
}
