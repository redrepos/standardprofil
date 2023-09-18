import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "antd";
import "./Home.css";
import standardprofil from './standardprofil.png';

const Home = () => {
  const navigate = useNavigate();
  const handleCardClick = (name) => {
    navigate(name);
  };
  const data = [
    {
      title: "Demande de matiere premiere",
      url: "matierep",
    },

    {
      title: "Communication",
      url: "communication",
    },
    {
      title: "Statistique",
      url: "stats",
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100%",
        paddingLeft: "15%",
        paddingRight:"15%",
        flexDirection:"column"
      }}>
      <div style={{ width:"100%", display:"flex" }}>
        <img src={standardprofil} alt="Standard profil logo" style={{width:"200px", paddingBottom:"50px", margin:"0 auto"}} />
      </div>
      <div className="grid-container">
      {data.map((index, button) => (
          
          <Button

            onClick={() => handleCardClick(index.url)}
            className="grid-item"
            key={button}
          >
            <span
              style={{
                textAlign: "center",
                color: "white",
                maxWidth: "140px",
                wordBreak: "break-word",
                overflowWrap: "break-word",
                whiteSpace: "pre-line",
                fontSize: "18px",
                fontFamily: "sans-serif",
              }}
            >
              {index.title}
            </span>
          </Button>
      ))}

      </div>
      
       
    </div>
  );
};

export default Home;
