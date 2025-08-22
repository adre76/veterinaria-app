from flask import Blueprint, request, jsonify
from src.models.user import db
from src.models.animal import Animal
from datetime import datetime

animal_bp = Blueprint('animal', __name__)

@animal_bp.route('/animais', methods=['GET'])
def get_animais():
    animais = Animal.query.all()
    return jsonify([animal.to_dict() for animal in animais])

@animal_bp.route('/animais/<int:id>', methods=['GET'])
def get_animal(id):
    animal = Animal.query.get_or_404(id)
    return jsonify(animal.to_dict())

@animal_bp.route('/animais', methods=['POST'])
def create_animal():
    data = request.get_json()
    
    if not data or not all(k in data for k in ('nome', 'raca', 'data_nascimento', 'proprietario_id')):
        return jsonify({'error': 'Dados incompletos'}), 400
    
    try:
        data_nascimento = datetime.strptime(data['data_nascimento'], '%d/%m/%Y').date()
    except ValueError:
        return jsonify({'error': 'Formato de data inválido. Use dd/mm/aaaa'}), 400
    
    animal = Animal(
        nome=data['nome'],
        raca=data['raca'],
        observacao=data.get('observacao', ''),
        data_nascimento=data_nascimento,
        proprietario_id=data['proprietario_id']
    )
    
    db.session.add(animal)
    db.session.commit()
    
    return jsonify(animal.to_dict()), 201

@animal_bp.route('/animais/<int:id>', methods=['PUT'])
def update_animal(id):
    animal = Animal.query.get_or_404(id)
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'Dados não fornecidos'}), 400
    
    animal.nome = data.get('nome', animal.nome)
    animal.raca = data.get('raca', animal.raca)
    animal.observacao = data.get('observacao', animal.observacao)
    animal.proprietario_id = data.get('proprietario_id', animal.proprietario_id)
    
    if 'data_nascimento' in data:
        try:
            animal.data_nascimento = datetime.strptime(data['data_nascimento'], '%d/%m/%Y').date()
        except ValueError:
            return jsonify({'error': 'Formato de data inválido. Use dd/mm/aaaa'}), 400
    
    db.session.commit()
    
    return jsonify(animal.to_dict())

@animal_bp.route('/animais/<int:id>', methods=['DELETE'])
def delete_animal(id):
    animal = Animal.query.get_or_404(id)
    db.session.delete(animal)
    db.session.commit()
    
    return jsonify({'message': 'Animal deletado com sucesso'})

