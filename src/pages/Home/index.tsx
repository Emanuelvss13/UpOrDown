import style from "./style.module.scss";
import { useContext, useEffect, useState } from "react";
import { FirestoreContext } from "../../Context/Firestore";
import PostContent from "../../components/Post";
import { useNavigate } from "react-router-dom";

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

export default function Home() {
  const [postBody, setPostBody] = useState("");

  const [posts, setPosts] = useState<Post[]>([]);

  const { createPost, allPosts } = useContext(FirestoreContext);

  useEffect(() => {
    setPosts(allPosts);
  }, [allPosts]);

  return (
    <div className={style.Container}>
      <div className={style.CreatePostContainer}>
        <textarea
          onChange={({ target }) => setPostBody(target.value)}
          value={postBody}
          placeholder="Escreva um topico!"
          rows={5}
        />
        <button onClick={() => createPost(postBody)}>Postar</button>
      </div>

      <div className={style.PostContentContainer}>
        {posts.length > 0
          ? posts.map((post) => (
              <PostContent
                post={post}
                key={post.id}
              />
            ))
          : "Nenhum pos ainda :("}
      </div>
    </div>
  );
}
