import style from "./style.module.scss"
import { AuthContext } from "../../Context/Auth"
import { useContext } from "react"

export default function Home() {

  const {user, singInWithGoogle, singOut} = useContext(AuthContext)

  return (
    <header className={style.Container}>
      <p className={style.logo} >UpOrDown</p>

      {user ? 
        <div className={style.LoggedUser} >
          <img src={user.avatar} alt="foto do usuário"/>
          <p>{user.name}</p>
          <button className={style.ActionButton} onClick={singOut} >Logout</button>
        </div>
        : 
        <button className={style.ActionButton} onClick={singInWithGoogle} >Login</button>
      }

      
    </header>
  )
}
