from flask import Blueprint, request, jsonify
from src.models.user import db
from src.models.consulta import Consulta
from datetime import datetime
import json

consulta_bp = Blueprint('consulta', __name__)

@consulta_bp.route('/consultas', methods=['GET'])
def get_consultas():
    consultas = Consulta.query.all()
    return jsonify([consulta.to_dict() for consulta in consultas])

@consulta_bp.route('/consultas/<int:id>', methods=['GET'])
def get_consulta(id):
    consulta = Consulta.query.get_or_404(id)
    return jsonify(consulta.to_dict())

@consulta_bp.route('/consultas', methods=['POST'])
def create_consulta():
    data = request.get_json()
    
    if not data or not all(k in data for k in ('animal_id',)):
        return jsonify({'error': 'Dados incompletos'}), 400
    
    data_consulta = datetime.utcnow().date()
    if 'data_consulta' in data and data['data_consulta']:
        try:
            data_consulta = datetime.strptime(data['data_consulta'], '%d/%m/%Y').date()
        except ValueError:
            return jsonify({'error': 'Formato de data inválido. Use dd/mm/aaaa'}), 400
    
    # Processar medicamentos e procedimentos
    medicamentos_procedimentos = ''
    if 'medicamentos_procedimentos' in data:
        if isinstance(data['medicamentos_procedimentos'], dict):
            medicamentos_procedimentos = json.dumps(data['medicamentos_procedimentos'])
        else:
            medicamentos_procedimentos = data['medicamentos_procedimentos']
    
    consulta = Consulta(
        data_consulta=data_consulta,
        animal_id=data['animal_id'],
        observacoes=data.get('observacoes', ''),
        medicamentos_procedimentos=medicamentos_procedimentos
    )
    
    db.session.add(consulta)
    db.session.commit()
    
    return jsonify(consulta.to_dict()), 201

@consulta_bp.route('/consultas/<int:id>', methods=['PUT'])
def update_consulta(id):
    consulta = Consulta.query.get_or_404(id)
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'Dados não fornecidos'}), 400
    
    consulta.animal_id = data.get('animal_id', consulta.animal_id)
    consulta.observacoes = data.get('observacoes', consulta.observacoes)
    
    if 'data_consulta' in data:
        try:
            consulta.data_consulta = datetime.strptime(data['data_consulta'], '%d/%m/%Y').date()
        except ValueError:
            return jsonify({'error': 'Formato de data inválido. Use dd/mm/aaaa'}), 400
    
    if 'medicamentos_procedimentos' in data:
        if isinstance(data['medicamentos_procedimentos'], dict):
            consulta.medicamentos_procedimentos = json.dumps(data['medicamentos_procedimentos'])
        else:
            consulta.medicamentos_procedimentos = data['medicamentos_procedimentos']
    
    db.session.commit()
    
    return jsonify(consulta.to_dict())

@consulta_bp.route('/consultas/<int:id>', methods=['DELETE'])
def delete_consulta(id):
    consulta = Consulta.query.get_or_404(id)
    db.session.delete(consulta)
    db.session.commit()
    
    return jsonify({'message': 'Consulta deletada com sucesso'})

