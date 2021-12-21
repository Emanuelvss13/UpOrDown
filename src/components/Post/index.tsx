import style from "./style.module.scss";

import { ReactComponent as Up } from "../../Assets/up.svg";
import { ReactComponent as Down } from "../../Assets/down.svg";
import { ReactComponent as Trash } from "../../Assets/trash.svg";
import { ReactComponent as Change } from "../../Assets/change.svg";
import { BaseSyntheticEvent, useContext } from "react";
import { FirestoreContext } from "../../Context/Firestore";
import { AuthContext } from "../../Context/Auth";
import { useNavigate } from "react-router-dom";

interface ComentariosProps {
  author: AuthorPost
  photo: string
  content: string
}

interface PostContentProps {
  post: Post;
  scroll?: boolean
}

interface AuthorPost {
  id?: string;
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

export default function PostContent({ post, scroll }: PostContentProps) {

  const { user } = useContext(AuthContext);

  const { likePost, dislikePost, deletePost, changeStatus } = useContext(FirestoreContext);

  const navigate = useNavigate();

  function toPostDetailsPage(){
    
    navigate(`/post/${post.id}`)
    
  }

  function toUserAccount(e: Event | BaseSyntheticEvent){

    e.stopPropagation()

    navigate(`/user/${post.data.author.id}`)
  }

  return (
    <div
      className={style.PostContainer}
      style={scroll ? {cursor: 'default'} : {cursor: 'pointer'}}
      key={post.id}
      onClick={toPostDetailsPage}
    >
      <div className={style.header}>
        <div>
          <img src={post.data.author.photo} alt="foto do autor" />
          <p onClick={(e) => toUserAccount(e)} >{post.data.author.name}</p>
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
        <p>{post.data.comentarios.length} comentários</p>

        {post.data.author.id === user?.id && (
          <div className={style.actions} >
            <Trash className={style.trash} onClick={(e) => deletePost(post.id, e)} />
            <Change className={style.change} onClick={(e) => changeStatus(post.id, post.data.end, e)} />
          </div>
        )}
      </div>
      <div className={scroll ? style.contentOne : style.content}>
        <div className={scroll ? style.postOne : style.postBody}>
          <p>{post.data.body}</p>
        </div>
        <div className={style.actions}>
          <div>
            <Up
              className={post.data.likes.includes(user?.id || "") ? style.upSelected : style.up}
              onClick={(e) => likePost(user?.id, post.id, e, post.data.end)}
            />
            <p>{post.data.likes.length}</p>
          </div>
          <div>
            <Down
              className={post.data.dislikes.includes(user?.id || "") ? style.downSelected : style.down}
              onClick={(e) => dislikePost(user?.id, post?.id, e, post.data.end )}
            />
            <p>{post.data.dislikes.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
