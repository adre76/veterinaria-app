from flask import Blueprint, request, jsonify
from src.models.user import db
from src.models.proprietario import Proprietario

proprietario_bp = Blueprint('proprietario', __name__)

@proprietario_bp.route('/proprietarios', methods=['GET'])
def get_proprietarios():
    proprietarios = Proprietario.query.all()
    return jsonify([proprietario.to_dict() for proprietario in proprietarios])

@proprietario_bp.route('/proprietarios/<int:id>', methods=['GET'])
def get_proprietario(id):
    proprietario = Proprietario.query.get_or_404(id)
    return jsonify(proprietario.to_dict())

@proprietario_bp.route('/proprietarios', methods=['POST'])
def create_proprietario():
    data = request.get_json()
    
    if not data or not all(k in data for k in ('nome', 'telefone', 'endereco')):
        return jsonify({'error': 'Dados incompletos'}), 400
    
    proprietario = Proprietario(
        nome=data['nome'],
        telefone=data['telefone'],
        endereco=data['endereco'],
        observacao=data.get('observacao', '')
    )
    
    db.session.add(proprietario)
    db.session.commit()
    
    return jsonify(proprietario.to_dict()), 201

@proprietario_bp.route('/proprietarios/<int:id>', methods=['PUT'])
def update_proprietario(id):
    proprietario = Proprietario.query.get_or_404(id)
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'Dados não fornecidos'}), 400
    
    proprietario.nome = data.get('nome', proprietario.nome)
    proprietario.telefone = data.get('telefone', proprietario.telefone)
    proprietario.endereco = data.get('endereco', proprietario.endereco)
    proprietario.observacao = data.get('observacao', proprietario.observacao)
    
    db.session.commit()
    
    return jsonify(proprietario.to_dict())

@proprietario_bp.route('/proprietarios/<int:id>', methods=['DELETE'])
def delete_proprietario(id):
    proprietario = Proprietario.query.get_or_404(id)
    db.session.delete(proprietario)
    db.session.commit()
    
    return jsonify({'message': 'Proprietário deletado com sucesso'})

