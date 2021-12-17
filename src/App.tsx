import './styles/global.scss'
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home"
import Header from "./components/Header"
import AuthContextProvider from './Context/Auth';
import {Toaster} from "react-hot-toast"

export default function App() {
  return (
    <Router>
      <Toaster/>
      <AuthContextProvider>
        <Header/>
        <Routes>
          <Route path="/" element={<Home/>} />
        </Routes>
      </AuthContextProvider>
    </Router>
  )
}
