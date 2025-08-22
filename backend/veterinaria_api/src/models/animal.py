from flask_sqlalchemy import SQLAlchemy
from src.models.user import db
from datetime import datetime

class Animal(db.Model):
    __tablename__ = 'animais'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(255), nullable=False)
    raca = db.Column(db.String(255), nullable=False)
    observacao = db.Column(db.Text)
    data_nascimento = db.Column(db.Date, nullable=False)
    proprietario_id = db.Column(db.Integer, db.ForeignKey('proprietarios.id'), nullable=False)
    
    # Relacionamento com consultas
    consultas = db.relationship('Consulta', backref='animal_ref', lazy=True)
    
    def __repr__(self):
        return f'<Animal {self.nome}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'raca': self.raca,
            'observacao': self.observacao,
            'data_nascimento': self.data_nascimento.strftime('%d/%m/%Y') if self.data_nascimento else None,
            'proprietario_id': self.proprietario_id,
            'proprietario_nome': self.proprietario_ref.nome if self.proprietario_ref else None
        }

