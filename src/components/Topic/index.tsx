import style from "./style.module.scss";

import { ReactComponent as Up } from "../../Assets/up.svg";
import { ReactComponent as Down } from "../../Assets/down.svg";
import { ReactComponent as Trash } from "../../Assets/trash.svg";
import { ReactComponent as Change } from "../../Assets/change.svg";
import { ReactComponent as Message } from "../../Assets/message.svg";
import { BaseSyntheticEvent, memo, useContext } from "react";
import { FirestoreContext } from "../../Context/Firestore";
import { AuthContext } from "../../Context/Auth";
import { useNavigate } from "react-router-dom";

interface CommentsProps {
  author: AuthorTopic;
  photo: string;
  content: string;
}

interface TopicContentProps {
  topic: TopicData;
  scroll?: boolean;
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

function Topic({ topic, scroll }: TopicContentProps) {
  const { user } = useContext(AuthContext);

  const { likeTopic, dislikeTopic, deleteTopic, changeStatus } =
    useContext(FirestoreContext);

  const navigate = useNavigate();

  function toPostDetailsPage() {
    navigate(`/topic/${topic.id}`);
  }

  function toUserAccount(e: Event | BaseSyntheticEvent) {
    e.stopPropagation();

    navigate(`/user/${topic.data.author.id}`);
  }

  return (
    <div
      className={style.PostContainer}
      style={scroll ? { cursor: "default" } : { cursor: "pointer" }}
      key={topic.id}
      onClick={toPostDetailsPage}
    >
      <div className={style.header}>
        <div className={style.user}>
          <img src={topic.data.author.photo} alt="foto do autor" />
          <div>
            <p onClick={(e) => toUserAccount(e)}>{topic.data.author.name}</p>
            <span>
              {new Date(topic.data.timestamp).toLocaleDateString("pt-BR", {
                timeZone: "UTC",
              })}
              {" às "}
              {new Date(topic.data.timestamp).getHours()}:
              {new Date(topic.data.timestamp).getMinutes() < 10 ? "0" : "" }
              {new Date(topic.data.timestamp).getMinutes()}
            </span>
          </div>
        </div>

        {topic.data.end ? (
          <p className={style.off}>Encerrado</p>
        ) : (
          <p className={style.on}>Ativo</p>
        )}

        {topic.data.author.id === user?.id && (
          <div className={style.actionsHeader}>
            <Trash
              className={style.trash}
              onClick={(e) => deleteTopic(topic.id, e)}
            />
            <Change
              className={style.change}
              onClick={(e) => changeStatus(topic.id, topic.data.end, e)}
            />
          </div>
        )}
      </div>
      <div className={scroll ? style.contentOne : style.content}>
        <div className={scroll ? style.postOne : style.postBody}>
          <p>{topic.data.body}</p>
        </div>
        <div className={style.actions}>
          <div>
            <Up
              className={
                topic.data.likes.includes(user?.id || "")
                  ? style.upSelected
                  : style.up
              }
              onClick={(e) => likeTopic(user?.id, topic.id, e, topic.data.end)}
            />
            <p>{topic.data.likes.length}</p>
          </div>
          <div>
            <Down
              className={
                topic.data.dislikes.includes(user?.id || "")
                  ? style.downSelected
                  : style.down
              }
              onClick={(e) =>
                dislikeTopic(user?.id, topic?.id, e, topic.data.end)
              }
            />
            <p>{topic.data.dislikes.length}</p>
          </div>
        </div>
      </div>
      <div className={style.footer}>
        <Message />
        <p className={style.comment}>
          {" "}
          {topic.data.comentarios.length}{" "}
          {topic.data.comentarios.length > 1 ? "comentários" : "comentário"}
        </p>
      </div>
    </div>
  );
}

export default memo(Topic)