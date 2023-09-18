from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from psycopg2 import IntegrityError
from sqlalchemy import create_engine, text
from pydantic import BaseModel
from models import Base
from sqlalchemy.orm import Session
from datetime import datetime
import uvicorn
import pandas as pd
import subprocess
import io
import os

from datetime import timedelta


# Create the FastAPI app
app = FastAPI()


# Setting up cors policy
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#DB connection
# DB_HOST="192.168.1.114"
# DB_USER="postgres"
# DB_PASSWORD="doumi2023"
# DB_NAME="prod"


DB_HOST = os.getenv("DB_HOST")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_NAME = os.getenv("DB_NAME")

engine = create_engine('postgresql://'+DB_USER+':'+DB_PASSWORD+'@'+DB_HOST+':5432/'+DB_NAME)
session = Session(bind=engine)

class DemandeDeMatierePremiereModel(BaseModel):
    id : int = None
    reference: str
    projet: str
    type: str
    typedemouvement: str
    quantite: int
    datededemande: str = None
    datedereception: str = None
    livree: bool
    livraison: str = None

class MatierePremiere:
    def __init__(self, id, reference, projet, type):
        self.id = id
        self.reference = reference
        self.projet = projet
        self.type = type


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(engine)


@app.get("/")
def root():
    return {"message": "API Version 1.0"}


@app.get("/matiere_premieres_excel")
def create_matiere_premiere():
    matierepremiere="matierepremiere.xlsx"
    df=pd.read_excel(matierepremiere)
    matierepremieres = []

    for index, row in df.iterrows():
        mp = MatierePremiere(row['id'], row['reference'], row['projet'], row['type'])
        matierepremieres.append(mp)

    return matierepremieres

@app.get("/demandes_matiere_premiere")
def fetch_matiere_premieres():
    query = text("SELECT reference, projet, type, typedemouvement, quantite, datededemande, datedereception, livree, id, livraison FROM demandematierepremiere;")
    entries = session.execute(query).fetchall()
    matiere_premiere_list = [
        DemandeDeMatierePremiereModel(
            reference=entry[0],
            projet=entry[1],
            type=entry[2],
            typedemouvement=entry[3],
            quantite=entry[4],
            datededemande=entry[5],
            datedereception=entry[6],
            livree=entry[7],
            id=entry[8],
            livraison=entry[9]
        )
        for entry in entries
    ]
    session.close()
    return matiere_premiere_list


@app.post("/demande_matiere_premiere")
def create_demande_matiere_premiere( d: DemandeDeMatierePremiereModel):
    try:
        query = """INSERT INTO demandematierepremiere (reference, projet, type, typedemouvement, quantite, datededemande, datedereception, livree, livraison)
        VALUES (:reference, :projet, :type, :typedemouvement, :quantite, :datededemande, :datedereception, :livree, :livraison )"""
        dd = datetime.now()
        datedemande = str(dd.replace(microsecond=0))
        datereception = ""
        livraison = ""

        values = {"reference": d.reference, "projet": d.projet, "type":d.type, "typedemouvement": d.typedemouvement, "quantite":d.quantite, "datededemande":datedemande, "datedereception": datereception, "livree": d.livree, "livraison": livraison}
        session.execute(text(query), values)
        session.commit()
        session.close()
    except IntegrityError:
        return {"error": "Error creating MatierePremiere entry"}
    except Exception as e:
        return {"error": str(e)}
    return {"message": "Demande de MatierePremiere created successfully."}
    

@app.put("/demande_matiere_premiere/{demande_id}")
def delete_demande_matiere_premiere( demande_id: int):
    try:

        livraison = "En retard"
        query = text("SELECT datededemande FROM demandematierepremiere WHERE id = :demande_id;")
        entry = session.execute(query, {"demande_id": demande_id}).fetchone()
        session.commit()
    
        dd = entry[0]
        tdd = datetime.strptime(dd,'%Y-%m-%d %H:%M:%S')

        dr = datetime.now()
        datereception = dr.replace(microsecond=0)

        #claculer le retard
        delivery_time = datereception - tdd
        print(delivery_time)
        # temps pour la lovraison
        min_delivery_time = timedelta(minutes=5)
        if delivery_time < min_delivery_time:
            livraison = "En avance"
            print(livraison, delivery_time)
        else:
            print(livraison, delivery_time)
            livraison = "En retard"

        dat = str(datereception)
        query = text("UPDATE demandematierepremiere SET livree = true, livraison = :livraison, datedereception = :dat WHERE id = :demande_id")
        session.execute(query, {"demande_id": demande_id, "livraison": livraison, "dat": dat})
        session.commit()
        
    except Exception as e:
        return {"error": str(e)}
    return {"message": "Demande de MatierePremiere updated successfully."}


@app.delete("/delete_demande_matiere_premiere/{demande_id}")
def delete_demande_matiere_premiere( demande_id: int):
    try:
        query = text("DELETE FROM demandematierepremiere WHERE id = :demande_id")
        session.execute(query, {"demande_id": demande_id})
        session.commit()
        session.close()
    except Exception as e:
        return {"error": str(e)}
    return {"message": "Demande de MatierePremiere deleted successfully."}


@app.get("/demandes_matiere_premiere_rapport")
def fetch_matiere_premieres():
    query = text("SELECT id, reference, projet, type, typedemouvement, quantite, datededemande, datedereception, livree, livraison FROM demandematierepremiere;")
    entries = session.execute(query).fetchall()
    session.close()

    # Create an in-memory Excel file
    df = pd.DataFrame(entries)
    excel_buffer = io.BytesIO()
    df.to_excel(excel_buffer, index=False, sheet_name='rapport')

    # Set the appropriate response headers
    response = Response(content=excel_buffer.getvalue())
    response.headers["Content-Disposition"] = "attachment; filename=output.xlsx"
    response.headers["Content-Type"] = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

    return response


@app.on_event("shutdown")
async def shutdown():
    await session.disconnect()


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)




