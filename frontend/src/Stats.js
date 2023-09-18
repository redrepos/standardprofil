import { ArrowUpOutlined } from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "./config.js";
import ReactECharts from "echarts-for-react";
import { Col, Row, Card, Statistic, Button } from "antd";
import standardprofil from './standardprofil.png';


const Stats = () => {

  const [delivredEntreePercentage, setDelivredEntreePercentage] = useState(0)
  const [delivredSortiePercentage, setDelivredSortiePercentage] = useState(0)
  const [option, setOption] = useState({
    legend: {
      data: ["Entree", "Sortie"],
    },
    xAxis: {
      data: ["Traité", "En cours"],
    },
    yAxis: {},
    barWidth: 30,
    color: ["#323b91", "#e53b2e"],
    series: []
  });

  const fetchData = async () => {
    axios
      .get(`${API_URL}/demandes_matiere_premiere`)
      .then((response) => {
      
        const undelivredEntree = response.data.filter(
          (e) => e.typedemouvement === "entree" && e.livree === false
        );
        const undelivredSortie = response.data.filter(
          (s) => s.typedemouvement === "sortie" && s.livree === false
        );


        
        const delivredSortie = response.data.filter(
          (s) => s.typedemouvement === "sortie" && s.livree === true
        );

        const delivredEntree = response.data.filter(
          (s) => s.typedemouvement === "entree" && s.livree === true
        );

        setDelivredEntreePercentage(undelivredEntree.length * 100 / (delivredEntree.length + undelivredEntree.length ) )
        setDelivredSortiePercentage(undelivredSortie.length * 100 / (delivredSortie.length + undelivredSortie.length ))
        setOption({
          ...option,
          series: [
            {
              name: "Entree",
              type: "bar",
              stack: "value",
              data: [delivredEntree.map(item => item.quantite).length, undelivredEntree.map(item => item.quantite).length ],
            },
            {
              name: "Sortie",
              type: "bar",
              stack: "value",
              data: [ delivredSortie.map(item => item.quantite).length, undelivredSortie.map(item => item.quantite).length ],
            },
          ]
        });

      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };




  const [downloadedFile, setDownloadedFile] = useState(null);

  const handleDownloadClick = async () => {
    try {
      // Make an Axios GET request to the server to download the file
      const response = await axios.get(`${API_URL}/demandes_matiere_premiere_rapport`, {
        responseType: 'blob', // Set the response type to 'blob' to handle binary data
      });
      // Create a blob from the response data
      const blob = new Blob([response.data]);
      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);
      // Create an anchor element and trigger a click to download the file
      const a = document.createElement('a');
      a.href = url;
      a.download = 'rapport_de_demande_des_matieres.xlsx'; // Set the desired file name
      document.body.appendChild(a);
      a.click();

      // Clean up by revoking the URL
      window.URL.revokeObjectURL(url);

      // Optionally, store the downloaded file data in state or perform other actions
      setDownloadedFile(blob);
    } catch (error) {
      console.error('Error downloading the file:', error);
    }
  };


  useEffect(() => {
    fetchData(); 
    const intervalId = setInterval(fetchData, 3000);
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        margin: "50px auto",
        maxWidth:"900px",
        minWidth:"300px"
      }}
    >
      <div style={{ width:"80%", display:"flex" }}>
        <img src={standardprofil} alt="Standard profil logo" style={{width:"200px", paddingBottom:"50px", margin:"0 auto"}} />
      </div>
      <div style={{marginBottom:"25px", width:"80%", display:"flex", justifyContent:"flex-end"}}>
        <Button type="primary" style={{ background: "linear-gradient(90deg, rgba(253,35,7,0.5772890951119217) 0%, rgba(43,60,144,0.5467880057873029) 100%)"}} onClick={handleDownloadClick}>
          Telecharger le rapport
        </Button>
      </div>
      <div
        style={{
          width: "80%",
          maxWidth: "800px",
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Card bordered={false}>
              <Statistic
                title="Entree"
                value={delivredEntreePercentage}
                precision={2}
                valueStyle={{
                  color: "#323b91",
                }}
                prefix={<ArrowUpOutlined />}
                suffix="%"
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card bordered={false}>
              <Statistic
                title="Sortie"
                value={delivredSortiePercentage}
                precision={2}
                valueStyle={{
                  color: "#e53b2e",
                }}
                prefix={<ArrowUpOutlined />}
                suffix="%"
              />
            </Card>
          </Col>
        </Row>
      </div>
      <div
        style={{
          maxWidth: "800px",
          width: "80%",
          marginTop: "30px",
          backgroundColor: "white",
          boxShadow:
            "0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)",
          borderRadius: "10px",
          padding: "25px",
        }}
      >
        <ReactECharts option={option} style={{ height: "400px" }} />
      </div>
      
    </div>
  );
};

export default Stats;
