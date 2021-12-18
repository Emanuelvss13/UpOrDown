import style from "./style.module.scss";

import { ReactComponent as Up } from "../../Assets/up.svg";
import { ReactComponent as Down } from "../../Assets/down.svg";
import { useContext } from "react";
import { FirestoreContext } from "../../Context/Firestore";
import { AuthContext } from "../../Context/Auth";
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

interface PostContentProps {
  post: Post;
  scroll?: boolean
}

export default function PostContent({ post, scroll }: PostContentProps) {

  const { user } = useContext(AuthContext);

  const { likePost, dislikePost } = useContext(FirestoreContext);

  const navigate = useNavigate();

  function toPostDetailsPage(){

    if(!window.location.pathname.includes("post")){
      navigate(`post/${post.id}`)
    }
    
  }

  return (
    <div
      className={style.PostContainer}
      key={post.id}
      onClick={toPostDetailsPage}
    >
      <div className={style.header}>
        <div>
          <img src={post.data.author.photo} alt="foto do autor" />
          <p>{post.data.author.name}</p>
        </div>
        <p>
          {new Date(post.data.timestamp).toLocaleDateString("pt-BR", {
            timeZone: "UTC",
          })}
        </p>
        {post.data.end ? (
          <p className={style.off}>Encerrado</p>
        ) : (
          <p className={style.on}>Ativo</p>
        )}
      </div>
      <div className={scroll ? style.contentOne : style.content}>
        <div className={scroll ? style.postOne : style.postBody}>
          <p>{post.data.body}</p>
        </div>
        <div className={style.actions}>
          <div>
            <Up
              className={style.up}
              onClick={(e) => likePost(user?.id, post.id, e)}
            />
            <p>{post.data.likes.length}</p>
          </div>
          <div>
            <Down
              className={style.down}
              onClick={(e) => dislikePost(user?.id, post?.id, e)}
            />
            <p>{post.data.dislikes.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
