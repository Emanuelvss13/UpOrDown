import style from "./style.module.scss"
import Logo from '../../Assets/logo.png'
import { AuthContext } from "../../Context/Auth"
import { useContext } from "react"

export default function Home() {

  const {user, singInWithGoogle, singOut} = useContext(AuthContext)

  return (
    <header className={style.Container}>
      <img src={Logo}/>

      {user ? 
        <div>
          <img src={user.avatar}/>
          {user.name}
          <button onClick={singOut} >Logout</button>
        </div>
        : 
        <button className={style.LoginButton} onClick={singInWithGoogle} >Login</button>
      }

      
    </header>
  )
}
