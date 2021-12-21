import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import {
  BaseSyntheticEvent,
  createContext,
  ReactNode,
  useContext,
} from "react";
import toast from "react-hot-toast";
import { db } from "../Config/firebase";
import { AuthContext } from "./Auth";

interface FirestoreConxtextProps {
  findTopicById: (id: string) => Promise<Post>;
  createComment: (
    commentBody: string,
    topicId: string,
    currentStatus: boolean
  ) => Promise<void>;
  createTopic: (body: string) => Promise<void>;
  changeStatus: (
    topicId: string,
    currentStatus: boolean,
    e: Event | BaseSyntheticEvent
  ) => Promise<void>;
  deleteTopic: (
    topicId: string,
    e: Event | BaseSyntheticEvent
  ) => Promise<void>;
  likeTopic: (
    userId: string | undefined,
    topicId: string,
    e: Event | BaseSyntheticEvent,
    currentStatus: boolean
  ) => Promise<void>;
  dislikeTopic: (
    userId: string | undefined,
    topicId: string,
    e: Event | BaseSyntheticEvent,
    currentStatus: boolean
  ) => Promise<void>;
}

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

interface FirestoreContextProviderProps {
  children: ReactNode;
}

export const FirestoreContext = createContext({} as FirestoreConxtextProps);

export default function FirestoreContextProvider({
  children,
}: FirestoreContextProviderProps) {
  const { user } = useContext(AuthContext);

  async function findTopicById(id: string) {
    const postRef = doc(db, "Topics", id);

    const postRaw = await getDoc(postRef);

    const post: Post = { id: postRaw.id, data: postRaw.data() } as Post;

    return post;
  }

  async function changeStatus(
    topicId: string,
    currentStatus: boolean,
    e: Event | BaseSyntheticEvent
  ) {
    e.stopPropagation();

    await updateDoc(doc(db, "Topics", topicId), {
      end: !currentStatus,
    });
  }

  async function createComment(
    commentBody: string,
    topicId: string,
    currentStatus: boolean
  ) {
    if (currentStatus) {
      toast.error("Tópico já encerrado");
      return;
    }

    if (!user) {
      toast.error("Se registre para fazer um comentário");
      return;
    }

    if (!commentBody) {
      toast.error("Escreva algo no seu comentário!");
      return;
    }

    const comentario = {
      author: {
        id: user.id,
        name: user.name,
        photo: user.avatar,
      },
      content: commentBody,
      timestamp: new Date().toISOString(),
    };

    try {
      await updateDoc(doc(db, "Topics", topicId), {
        comentarios: arrayUnion(comentario),
      }).then(() => toast.dismiss());

      toast.success("Comentário postado!");
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function createTopic(postBody: string) {
    if (!user) {
      toast.error("Se registre para criar um tópico");
      return;
    }

    if (!postBody) {
      toast.error("Escreva algo no seu tópico!");
      return;
    }

    try {
      await addDoc(collection(db, "Topics"), {
        author: {
          id: user?.id,
          name: user?.name,
          photo: user?.avatar,
        },
        body: postBody,
        end: false,
        likes: [],
        dislikes: [],
        timestamp: new Date().toISOString(),
        comentarios: [],
      }).then(() => {
        toast.dismiss();
      });

      toast.success("Tópico criado com sucesso!");
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.message);
    }
  }

  async function deleteTopic(topicId: string, e: Event | BaseSyntheticEvent) {
    e.stopPropagation();

    await deleteDoc(doc(db, "Topics", topicId))
      .then(() => toast.success("Tópico deletado com sucesso!"))
      .catch((e) => toast.error(e.message));
  }

  async function likeTopic(
    userId: string | undefined,
    topicId: string,
    e: Event | BaseSyntheticEvent,
    currentStatus: boolean
  ) {
    e.stopPropagation();

    if (currentStatus) {
      toast.error("Tópico já encerrado");
      return;
    }

    if (!userId) {
      toast.error("Se registre para dar up nesse tópico");
      return;
    }

    const post = (await (
      await getDoc(doc(db, "Topics", topicId))
    ).data()) as PostProps;

    if (post.likes.includes(userId)) {
      await updateDoc(doc(db, "Topics", topicId), {
        likes: arrayRemove(userId),
      }).catch((e) => toast.error(e.message));
    } else {
      await updateDoc(doc(db, "Topics", topicId), {
        likes: arrayUnion(userId),
        dislikes: arrayRemove(userId),
      }).catch((e) => toast.error(e.message));
    }
  }

  async function dislikeTopic(
    userId: string | undefined,
    topicId: string,
    e: Event | BaseSyntheticEvent,
    currentStatus: boolean
  ) {
    e.stopPropagation();

    if (currentStatus) {
      toast.error("Tópico já encerrado");
      return;
    }

    if (!userId) {
      toast.error("Se registre para dar down nesse tópico");
      return;
    }

    const post = (await (
      await getDoc(doc(db, "Topics", topicId))
    ).data()) as PostProps;

    if (post.dislikes.includes(userId)) {
      await updateDoc(doc(db, "Topics", topicId), {
        dislikes: arrayRemove(userId),
      }).catch((e) => toast.error(e.message));
    } else {
      await updateDoc(doc(db, "Topics", topicId), {
        likes: arrayRemove(userId),
        dislikes: arrayUnion(userId),
      }).catch((e) => toast.error(e.message));
    }
  }

  return (
    <FirestoreContext.Provider
      value={{
        changeStatus,
        createTopic,
        findTopicById,
        createComment,
        deleteTopic,
        likeTopic,
        dislikeTopic,
      }}
    >
      {children}
    </FirestoreContext.Provider>
  );
}
