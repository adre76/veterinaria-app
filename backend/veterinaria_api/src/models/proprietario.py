from flask_sqlalchemy import SQLAlchemy
from src.models.user import db

class Proprietario(db.Model):
    __tablename__ = 'proprietarios'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(255), nullable=False)
    telefone = db.Column(db.String(20), nullable=False)
    endereco = db.Column(db.Text, nullable=False)
    observacao = db.Column(db.Text)
    
    # Relacionamento com animais
    animais = db.relationship('Animal', backref='proprietario_ref', lazy=True)
    
    def __repr__(self):
        return f'<Proprietario {self.nome}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'telefone': self.telefone,
            'endereco': self.endereco,
            'observacao': self.observacao
        }

