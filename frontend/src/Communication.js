import React, { useEffect, useState } from "react";
import { Table, Tag, notification } from "antd";
import axios from "axios";
import API_URL from "./config.js";
import standardprofil from './standardprofil.png';
import sound from "./notification.wav"


const Communication = () => {
  const [sortie, setSortie] = useState([]);
  const [entree, setEntree] = useState([]);
  const [state, setState] = useState(true);

  const [data, setData] = useState([]);

  const columns = [
    {
      title: "Reference",
      dataIndex: "reference",
      key: "reference",
      render: (text) => (
        <span style={{ fontFamily: "sans-serif", fontWeight: "bold" }}>
          {text}
        </span>
      ),
    },
    { title: "Projet", dataIndex: "projet", key: "projet" },
    { title: "Type", dataIndex: "type", key: "type" },
    {
      title: "Type de Movement",
      dataIndex: "typedemouvement",
      key: "typedemouvement",
      render: (text) => {
        let color = "#e53b2e";
        if (text === "entree") {
          color = "#2b3c90";
        }
        return (
          <Tag bordered={true} color={color} key={text}>
            {text.toUpperCase()}
          </Tag>
        );
      },
    },
    { title: "Quantité", dataIndex: "quantite", key: "quantite" },
  ];

 
  const fetchData = async () => {
    axios
      .get(`${API_URL}/demandes_matiere_premiere`)
      .then((response) => {
        const entrees = response.data.filter(
          (e) => e.typedemouvement === "entree" && e.livree === false
        );
        const sorties = response.data.filter(
          (s) => s.typedemouvement === "sortie" && s.livree === false
        );
        setState(false);
        setData((prev) => {
          const newMouvement = response.data.filter(
            (item2) => !prev.some((item1) => item1.id === item2.id)
          );

          if (newMouvement.length) {
            newMouvement.map((nm) => {
              if (nm.livree === false) {
                new Audio(sound).play()
                notification.info({
                  message: nm.reference,
                  description: "Nouveau mouvement de matiere premiere",
                });
              }
            });
            
          }
          return response.data;
        });
        setEntree(entrees);
        setSortie(sorties);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  useEffect(() => {
    fetchData(); // Fetch data immediately when component mounts

    const intervalId = setInterval(fetchData, 3000);

    //Clean up the interval when the component unmounts
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div
      style={{
        paddingTop: "50px",
        paddingLeft: "15%",
        paddingRight: "15%",
      }}
    >
       <div style={{ width:"100%", display:"flex" }}>
        <img src={standardprofil} alt="Standard profil logo" style={{width:"200px", paddingBottom:"20px", margin:"0 auto"}} />
      </div>
      <br></br>
      <h2 style={{ color: "#2b3c90" }}>Entree</h2>
      <div
        style={{
          boxShadow:
            "0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)",
          borderRadius: "10px",
        }}
      >
        <Table
          loading={state}
          size="large"
          dataSource={entree}
          columns={columns}
          pagination={false}
          rowKey="id"
          bordered
        />
      </div>
      <div style={{ height: "40px" }}></div>
      <h2 style={{ color: "#e53b2e" }}>Sortie</h2>
      <div
        style={{
          boxShadow:
            "0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)",
          borderRadius: "10px",
        }}
      >
        <Table
          loading={state}
          size="large"
          dataSource={sortie}
          columns={columns}
          pagination={false}
          rowKey="id"
          bordered
        />
      </div>
    </div>
  );
};

export default Communication;
