from flask_sqlalchemy import SQLAlchemy
from src.models.user import db

class Medicamento(db.Model):
    __tablename__ = 'medicamentos'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(255), nullable=False)
    laboratorio = db.Column(db.String(255), nullable=False)
    apresentacao = db.Column(db.String(50), nullable=False)  # caixa, ampola, comprimido
    valor_compra = db.Column(db.Numeric(10, 2), nullable=False)
    margem_lucro = db.Column(db.Numeric(5, 2), nullable=False)  # percentual
    valor_venda = db.Column(db.Numeric(10, 2), nullable=False)
    
    def __repr__(self):
        return f'<Medicamento {self.nome}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'laboratorio': self.laboratorio,
            'apresentacao': self.apresentacao,
            'valor_compra': float(self.valor_compra),
            'margem_lucro': float(self.margem_lucro),
            'valor_venda': float(self.valor_venda)
        }

