import {Route, Routes, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Home } from './pages/Home';
import { NavBar } from './components/nav-bar/NavBar';
import { Miner } from './pages/Miner';
import Login from "./pages/Login";
import Register from "./pages/Register";
import { Admin } from "./pages/Admin";
import './App.css';
import Pagetest from "./pages/Pagetest";
import Aos from 'aos'
import "aos/dist/aos.css"
import { useEffect } from "react";
import Dashtest from "./pages/Dashtest";
import Spinner from "./pages/Spinner";
import { getUserProfile } from "./api/profile";
import { loginSuccess } from "./redux/userReducer";
import { useDispatch } from "react-redux";

function App() {
  const dispatch = useDispatch()

  useEffect(() => {
    Aos.init({duration:1000});
  }, [])

  useEffect(() => {
    //should work on a more effectife way to do this, but we can keep this as a temporal solution
    getProfile()
  }, [dispatch])

  const getProfile = async () => {
    try {
      const data = await getUserProfile()
      console.log(data)
      dispatch(loginSuccess(data.data))
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="app">
      <NavBar/>
      <div className='app-container'>
        <Routes>
        <Route path="/" element={<Home/>}/>
          <Route path="/mining" element={<Miner/>}/>
          <Route path="/dashboard" element={<Dashtest/>}/>
          <Route path="/login" element={<Login/>}/>
          <Route path="/register" element={<Register/>}/>
          <Route path="/controller" element={<Admin/>}/>
          <Route path="test" element={<Pagetest />} />
          <Route path="spinner" element={<Spinner />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
