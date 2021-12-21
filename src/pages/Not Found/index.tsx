import { Link } from "react-router-dom";
import style from "./style.module.scss";
import notFound from "../../Assets/notFound.json";
import { Player } from "@lottiefiles/react-lottie-player";
import { useEffect, useRef } from "react";

export default function NotFound() {
  const player = useRef<Player>(null);

  useEffect(() => {
    player.current?.setPlayerSpeed(1);
  }, []);
  return (
    <div className={style.Container}>
      <Player
        ref={player}
        autoplay
        loop
        src={notFound}
        style={{ width: "600px" }}
      />

      <Link to="/">Página não encontrada, voltar para home.</Link>
    </div>
  );
}
