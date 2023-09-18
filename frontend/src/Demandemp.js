import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import API_URL from './config.js';
import {
  Button,
  Tag,
  Steps,
  message,
  Statistic,
  notification
} from "antd";

import sound from "./notification.wav"

const Demandemp = ({ data }) => {

  const { Countdown } = Statistic;
  const [timeLeft, setTimeLeft] = useState( Date.now() + 1000 * 60 * 1  );
  const [messageApi, contextHolder] = message.useMessage();
  // to confirm an order
  const steps = [
    {
      title: "Demandé",
    },
    {
      title: "Reçu",
    },
  ];
  const [current, setCurrent] = useState(1);
  const next = () => {
    setCurrent(current + 1);
  };
  const prev = () => {
    setCurrent(current - 1);
  };
  const items = steps.map((item) => ({
    key: item.title,
    title: item.title,
  }));

  const handleDelete = (id) => {
    try {
      console.log("deleting", id)
      axios.put(`${API_URL}/demande_matiere_premiere/${id}`)
      .then((response)=>{
        setCurrent(1)
        messageApi.open({
          type: 'success',
          content: 'Demande de matiere confirmée',
          duration: 4,
        });
      }).catch((error)=>{
       console.log(error)
        messageApi.open({
          type: 'error',
          content: 'Echec de confirmation',
          duration: 4,
        });
      });

    } catch (error) {
      console.error("Error deleting:", error);
    }
  };


  const handleCountdownFinish = (ref) => {
    console.log(reference)
    notification.info({
      message: reference,
      description: "Demande de matiere non livrée",
    });

    new Audio(sound).play()
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    if(timeLeft === 0) {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [timeLeft]);

  const reference = data.reference
  return (

    <>
      <div>
         {contextHolder}
        <div
          style={{
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            display: "flex",
            padding: "20px",
            marginBottom: "15px",
            justifyContent: "space-between",
            width: "100%",
            backgroundColor:"white",
            borderRadius: "7px"
          }}
          key={data.id}
        >
          <div>

            {" "}
            {data.typedemouvement === "entree" ? (
              <>
                <Tag bordered={true} color="#2b3c90">
                  {data.typedemouvement}
                </Tag>
                <span style={{ fontWeight: "bold", fontSize: "14px" }}>
                  {data.reference}
                </span>
              </>
            ) : (
              <>
                <Tag bordered={true} color="#e53b2e">
                  {data.typedemouvement}
                </Tag>
                <span style={{ fontWeight: "bold", fontSize: "14px" }}>
                  {data.reference}
                </span>
              </>
            )}
          </div>

          <Steps
            current={current}
            items={items}
            style={{ marginRight: "14px", width: "300px" }}
            size="small"
          />

          <div style={{display:"flex"}}>
          <Countdown
            value={timeLeft}
            valueStyle={{fontSize: 16, color: "#e43b2e"}}
            format="mm:ss"
            suffix={<Button onClick={() => setTimeLeft(Date.now() + 1000 * 60 * 1)}>Restart</Button>}
            onFinish={ () => handleCountdownFinish(reference) }

          />
            {current < steps.length && (
              <Button style={{
                margin: "0 8px",
              }} type="primary" onClick={() => next()}>
                Confirmer
              </Button>
            )}
            {current === steps.length && (
              <Button style={{
                margin: "0 8px",
              }} type="primary" onClick={ ( ) => handleDelete(data.id)}>
                Done
              </Button>
            )}
            {current > 1 && (
              <Button
                style={{
                  margin: "0 8px",
                }}
                onClick={() => prev()}
              >
                Annuler
              </Button>
            )}

          </div>
        </div>
      </div>
    </>


  );
};

export default Demandemp;
