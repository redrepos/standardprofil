from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import func

# Create a base class for declarative models
Base = declarative_base()


class DemandeDeMatierePremiere(Base):
    __tablename__ = 'demandematierepremiere'

    id = Column(Integer, primary_key=True, autoincrement=True)
    reference = Column(String(25))
    projet = Column(String(255))
    type = Column(String(255)) 
    typedemouvement = Column(String(255)) # entree ou sortie
    quantite = Column(Integer) 
    datededemande = Column(String(255))
    datedereception = Column(String(255))
    livree = Column(Boolean)
    livraison = Column(String(255))


    