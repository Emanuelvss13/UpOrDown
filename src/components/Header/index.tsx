import style from "./style.module.scss";
import { AuthContext } from "../../Context/Auth";
import { BaseSyntheticEvent, useContext } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  const { user, singInWithGoogle, singOut } = useContext(AuthContext);

  function toUserAccount(e: Event | BaseSyntheticEvent){

    e.stopPropagation()

    navigate(`/user/${user?.id}`)
  }

  return (
    <header className={style.Container}>
      <p onClick={() => navigate("/")} className={style.logo}>
        UpOrDown
      </p>

      {user ? (
        <div className={style.LoggedUser}>
          <img src={user.avatar} alt="foto do usuário" />
          <p onClick={(e) => toUserAccount(e)} >{user.name}</p>
          <button className={style.ActionButton} onClick={singOut}>
            Logout
          </button>
        </div>
      ) : (
        <button className={style.ActionButton} onClick={singInWithGoogle}>
          Login
        </button>
      )}
    </header>
  );
}
