import React, { useState, useEffect } from "react";
import "./Matierep.css";
import Demandemp from "./Demandemp";
import axios from "axios";
import API_URL from './config.js';
import {
  Form,
  Input,
  Select,
  Radio,
  Button,
} from "antd";
import standardprofil from './standardprofil.png';

const { Option } = Select;


const Matierep = () => {
  

  const [matiereMremieres, setMatiereMremieres] = useState([]);
  const [demandeMatiereMremieres, setDemandeMatiereMremieres] = useState([]);

  const matiereType=["Produit fini", "Composant", "Perfil", "Emballage"]

  const [uniqueProjetValues, setuniqueProjetValues] = useState([]); 

  const [selectedProjectRefs, setSelectedProjectRefs] = useState([]); 

  const [form] = Form.useForm();
  const handleReset = () => {
    form.resetFields();
  };
  const onSubmit = (values) => {
    console.log(values)
    //const projet = matiereMremieres.find((obj) => obj["ref"] === values["ref"]);
    const projet = values["projet"];
    const quantite = values["quantite"];
    const reference = values["reference"];
    const typedemouvement = values["typedemouvement"];
    const type = values["type"];

    const data = {
      reference: String(reference),
      projet: String(projet),
      type: String(type),
      typedemouvement: String(typedemouvement),
      quantite: parseInt(quantite),
      livree: false,
    };
    axios
      .post(`${API_URL}/demande_matiere_premiere`, data)
      .then((response) => {
        console.log(response.data);
        
      })
      .catch((error) => {
        console.error("Error adding order to database: ", error);
      });
    handleReset();
  };

  useEffect(() => {

      axios
      .get(`${API_URL}/matiere_premieres_excel`)
      .then((response) => {
        setMatiereMremieres(response.data);
        console.log(response.data);
        const tempprojet = new Set(response.data.map(item => item.projet))
        setuniqueProjetValues([...tempprojet])
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
      
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      axios
        .get(`${API_URL}/demandes_matiere_premiere`)
        .then((response) => {
          setDemandeMatiereMremieres(response.data);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    };

    fetchData(); // Initial fetch

    const intervalId = setInterval(fetchData, 2000); // Fetch every 5 seconds

    return () => {
      clearInterval(intervalId); // Clean up the interval when the component unmounts
    };
  }, []);


  return (
    <div id="container">
      <div style={{ width:"100%", display:"flex" }}>
        <img src={standardprofil} alt="Standard profil logo" style={{width:"200px", paddingBottom:"50px", margin:"0 auto"}} />
      </div>
      <h2>Liste des demandes non reçues</h2>

      {demandeMatiereMremieres.map((e) => {
        return e.livree === false ? <Demandemp data={e} key={e.id}></Demandemp> : "";
      })}

      <h2 style={{marginTop:"60px"}}>Formulaire de demande</h2>
      <div
        style={{
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          marginBottom: "16px",
          display: "flex",
          padding: "36px",
          borderRadius: "10px",
          backgroundColor:"white"
        }}
      >
        {" "}
        <Form form={form} onFinish={onSubmit}>
          <Form.Item
            name="projet"
            label="Projet"
            rules={[{ required: true, message: "Please select a line!" }]}
          >
            <Select placeholder="Choisir un projet" onSelect={(e)=>{ setSelectedProjectRefs(matiereMremieres.filter(item => item.projet === e ))}}>
              {uniqueProjetValues.map((item) => (
                <Option key={item} value={item}>
                  {item}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="reference"
            label="Reference"
            rules={[{ required: true, message: "Please select a line!" }]}
          >
            <Select placeholder="Choisir un reference">

              {selectedProjectRefs.map((item) => (
                <Option key={item.id} value={item.reference}>
                  {item.reference}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="quantite"
            label="Quantite"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Input type="number" min={1} />
          </Form.Item>
          <Form.Item
            name="type"
            label="Type"
            rules={[{ required: true, message: "Please select a line!" }]}
          >
            <Select placeholder="Choisir un type">
              {matiereType.map((item) => (
                <Option key={item} value={item}>
                  {item}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Type de mouvement"
            name="typedemouvement"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Radio.Group>
              <Radio value="entree">Entree</Radio>
              <Radio value="sortie">Sortie</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Matierep;
