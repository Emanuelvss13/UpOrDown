import style from "./style.module.scss";
import { useContext, useEffect, useState } from "react";
import { FirestoreContext } from "../../Context/Firestore";
import Topic from "../../components/Topic";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../../Config/firebase";

interface CommentsProps {
  author: AuthorTopic;
  photo: string;
  content: string;
}

interface AuthorTopic {
  id?: string;
  name: string;
  photo: string;
}

interface TopicProps {
  author: AuthorTopic;
  body: string;
  end: boolean;
  likes: string[];
  dislikes: string[];
  timestamp: string;
  comentarios: CommentsProps[];
}

interface TopicData {
  data: TopicProps;
  id: string;
}

export default function Home() {
  const [postBody, setPostBody] = useState<string>();

  const [topics, setTopics] = useState<TopicData[]>([]);

  const { createTopic } = useContext(FirestoreContext);

  const [postQuery, setPostQuery] = useState(0);

  useEffect(() => {
    const postRef = collection(db, "Topics");

    const q = query(postRef, orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const topicsRaw = querySnapshot.docs.map((doc) => ({
        data: doc.data(),
        id: doc.id,
      })) as TopicData[];

      switch (postQuery) {
        case 1:
          topicsRaw
            .sort(
              (a: TopicData, b: TopicData) =>
                a.data.likes.length - b.data.likes.length
            )
            .reverse();
          break;
        case 2:
          topicsRaw
            .sort(
              (a: TopicData, b: TopicData) =>
                a.data.dislikes.length - b.data.dislikes.length
            )
            .reverse();
          break;
        case(3):
          topicsRaw
            .reverse();
          break;
      }

      setTopics(topicsRaw);
    });

    return () => {
      unsubscribe();
    };
  }, [postQuery]);

  return (
    <div className={style.Container}>
      <div className={style.CreatePostContainer}>
        <textarea
          onChange={({ target }) => setPostBody(target.value)}
          value={postBody}
          placeholder="Escreva um tópico!"
          rows={5}
        />
        <button
          onClick={() => {
            createTopic(postBody!);
            setPostBody("");
          }}
        >
          Postar
        </button>
      </div>

      <div className={style.PostContentContainer}>
        <div className={style.query}>
          <p
            className={
              postQuery === 0 ? style.NewsTopicsActive : style.NewsTopics
            }
            onClick={() => setPostQuery(0)}
          >
            Mais novos
          </p>
          <p
            className={
              postQuery === 3 ? style.mostOldestActive : style.mostOldest
            }
            onClick={() => setPostQuery(3)}
          >
           Mais antigos
          </p>
          <p
            className={
              postQuery === 1 ? style.mostLikedActive : style.mostLiked
            }
            onClick={() => setPostQuery(1)}
          >
            Mais up&rsquo;s
          </p>
          <p
            className={
              postQuery === 2 ? style.mostDislikedActive : style.mostDisliked
            }
            onClick={() => setPostQuery(2)}
          >
            Mais down&rsquo;s
          </p>
        </div>
        {topics.length > 0 ? (
          topics.map((topic: TopicData) => (
            <Topic topic={topic} key={topic.id} />
          ))
        ) : (
          <div className={style.LoadingContainer}></div>
        )}
      </div>
    </div>
  );
}
