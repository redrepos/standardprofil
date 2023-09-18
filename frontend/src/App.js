import React from 'react';
import Matierep from './Matierep';
import Stats from './Stats';
import Communication from './Communication';
import Home from './Home';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';


const App = () => {
  return (
    <div>   
      <Router>
        <Routes>
          <Route exact path="/" element={<Home/>}/>
          <Route exact path="/matierep" element={<Matierep/>}/>
          <Route exact path="/stats" element={<Stats/>}/>
          <Route exact path="/communication" element={<Communication/>}/>
        </Routes>
    </Router>
    </div>
    
  );
};

export default App;
