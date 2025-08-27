from flask import Blueprint, request, jsonify
from src.models.proprietario import Proprietario
from src.models.user import db # Importar db do user.py ou de um arquivo de configuração central

proprietario_bp = Blueprint("proprietario", __name__)

@proprietario_bp.route("/proprietarios", methods=["GET"])
def get_proprietarios():
    proprietarios = Proprietario.query.all()
    return jsonify([p.to_dict() for p in proprietarios])

@proprietario_bp.route("/proprietarios", methods=["POST"])
def add_proprietario():
    data = request.get_json()
    new_proprietario = Proprietario(
        nome=data["nome"],
        telefone=data["telefone"],
        endereco=data["endereco"],
        observacao=data.get("observacao")
    )
    db.session.add(new_proprietario)
    db.session.commit()
    return jsonify(new_proprietario.to_dict()), 201

@proprietario_bp.route("/proprietarios/<int:id>", methods=["DELETE"])
def delete_proprietario(id):
    proprietario = Proprietario.query.get_or_404(id)
    db.session.delete(proprietario)
    db.session.commit()
    return jsonify({"message": "Proprietário excluído com sucesso"})


