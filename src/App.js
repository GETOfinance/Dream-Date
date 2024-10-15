import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Profile from './component/Profile';
import Userdashboard from './component/Userdashboard';
import Matchprofile from './component/Matchprofile';
import SearchProfile from './component/SearchProfile';
import Home from './component/Home';


function App() {
  return (
    <div className="App">
        <BrowserRouter>
          <Routes>
            <Route exact path="/" element={<Home />} />
            <Route exact path="/Profile"   element={<Profile />} />
            <Route exact path="/Matchprofile"   element={<Matchprofile />} />
            <Route exact path="/Userdashboard"   element={<Userdashboard />} />
            <Route exact path="/Searchprofile"   element={<SearchProfile />} />
          </Routes>
        </BrowserRouter>
       

     
    </div>
  );
}

export default App;
