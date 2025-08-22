from flask_sqlalchemy import SQLAlchemy
from src.models.user import db
from datetime import datetime

class Consulta(db.Model):
    __tablename__ = 'consultas'
    
    id = db.Column(db.Integer, primary_key=True)
    data_consulta = db.Column(db.Date, nullable=False, default=datetime.utcnow().date)
    animal_id = db.Column(db.Integer, db.ForeignKey('animais.id'), nullable=False)
    observacoes = db.Column(db.Text)
    medicamentos_procedimentos = db.Column(db.Text)  # JSON string com medicamentos e procedimentos
    
    def __repr__(self):
        return f'<Consulta {self.id} - {self.data_consulta}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'data_consulta': self.data_consulta.strftime('%d/%m/%Y') if self.data_consulta else None,
            'animal_id': self.animal_id,
            'animal_nome': self.animal_ref.nome if self.animal_ref else None,
            'proprietario_nome': self.animal_ref.proprietario_ref.nome if self.animal_ref and self.animal_ref.proprietario_ref else None,
            'observacoes': self.observacoes,
            'medicamentos_procedimentos': self.medicamentos_procedimentos
        }

