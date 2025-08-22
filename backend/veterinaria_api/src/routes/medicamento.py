from flask import Blueprint, request, jsonify
from src.models.user import db
from src.models.medicamento import Medicamento

medicamento_bp = Blueprint('medicamento', __name__)

@medicamento_bp.route('/medicamentos', methods=['GET'])
def get_medicamentos():
    medicamentos = Medicamento.query.all()
    return jsonify([medicamento.to_dict() for medicamento in medicamentos])

@medicamento_bp.route('/medicamentos/<int:id>', methods=['GET'])
def get_medicamento(id):
    medicamento = Medicamento.query.get_or_404(id)
    return jsonify(medicamento.to_dict())

@medicamento_bp.route('/medicamentos', methods=['POST'])
def create_medicamento():
    data = request.get_json()
    
    if not data or not all(k in data for k in ('nome', 'laboratorio', 'apresentacao', 'valor_compra', 'margem_lucro')):
        return jsonify({'error': 'Dados incompletos'}), 400
    
    valor_compra = float(data['valor_compra'])
    margem_lucro = float(data['margem_lucro'])
    valor_venda = valor_compra + (valor_compra * margem_lucro / 100)
    
    medicamento = Medicamento(
        nome=data['nome'],
        laboratorio=data['laboratorio'],
        apresentacao=data['apresentacao'],
        valor_compra=valor_compra,
        margem_lucro=margem_lucro,
        valor_venda=valor_venda
    )
    
    db.session.add(medicamento)
    db.session.commit()
    
    return jsonify(medicamento.to_dict()), 201

@medicamento_bp.route('/medicamentos/<int:id>', methods=['PUT'])
def update_medicamento(id):
    medicamento = Medicamento.query.get_or_404(id)
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'Dados não fornecidos'}), 400
    
    medicamento.nome = data.get('nome', medicamento.nome)
    medicamento.laboratorio = data.get('laboratorio', medicamento.laboratorio)
    medicamento.apresentacao = data.get('apresentacao', medicamento.apresentacao)
    
    if 'valor_compra' in data or 'margem_lucro' in data:
        valor_compra = float(data.get('valor_compra', medicamento.valor_compra))
        margem_lucro = float(data.get('margem_lucro', medicamento.margem_lucro))
        valor_venda = valor_compra + (valor_compra * margem_lucro / 100)
        
        medicamento.valor_compra = valor_compra
        medicamento.margem_lucro = margem_lucro
        medicamento.valor_venda = valor_venda
    
    db.session.commit()
    
    return jsonify(medicamento.to_dict())

@medicamento_bp.route('/medicamentos/<int:id>', methods=['DELETE'])
def delete_medicamento(id):
    medicamento = Medicamento.query.get_or_404(id)
    db.session.delete(medicamento)
    db.session.commit()
    
    return jsonify({'message': 'Medicamento deletado com sucesso'})

