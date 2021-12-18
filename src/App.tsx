import './styles/global.scss'
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home"
import Header from "./components/Header"
import AuthContextProvider from './Context/Auth';
import {Toaster} from "react-hot-toast"
import Footer from './components/footer';
import FirestoreContextProvider from './Context/Firestore';
import Post from './pages/Post';

export default function App() {
  return (
    <Router>
      <Toaster/>
      <AuthContextProvider>
        <FirestoreContextProvider>
          <Header/>
          <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="post/:id" element={<Post/>}/>
          </Routes>
          {/* <Footer/> */}
        </FirestoreContextProvider>
      </AuthContextProvider>
    </Router>
  )
}
