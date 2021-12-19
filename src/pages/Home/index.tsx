import style from "./style.module.scss";
import { useContext, useEffect, useState } from "react";
import { FirestoreContext } from "../../Context/Firestore";
import PostContent from "../../components/Post";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../../Config/firebase";

interface AuthorHome {
  id: string;
  name: string;
  photo: string;
}

interface PostProps {
  author: AuthorHome;
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

export default function Home() {
  const [postBody, setPostBody] = useState<string>();

  const [posts, setPosts] = useState<Post[]>([]);

  const { createPost } = useContext(FirestoreContext);

  useEffect(() => {
    const postRef = collection(db, "Posts");

    const q = query(postRef, orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const postsRaw = querySnapshot.docs.map((doc) => ({
        data: doc.data(),
        id: doc.id,
      })) as Post[];

      setPosts(postsRaw);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div className={style.Container}>
      <div className={style.CreatePostContainer}>
        <textarea
          onChange={({ target }) => setPostBody(target.value)}
          value={postBody}
          placeholder="Escreva um post!"
          rows={5}
        />
        <button onClick={() => createPost(postBody!)}>Postar</button>
      </div>

      <div className={style.PostContentContainer}>
        {posts.length > 0 ? (
          posts.map((post: any) => <PostContent post={post} key={post.id} />)
        ) : (
          <div className={style.LoadingContainer} >

          </div>
        )}
      </div>
    </div>
  );
}
