from flask import Blueprint, request, jsonify, session

auth_bp = Blueprint('auth', __name__)

# Credenciais fixas conforme solicitado
USUARIO_FIXO = 'liviavet'
SENHA_FIXA = 'Gorete00'

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not all(k in data for k in ('usuario', 'senha')):
        return jsonify({'error': 'Usuário e senha são obrigatórios'}), 400
    
    if data['usuario'] == USUARIO_FIXO and data['senha'] == SENHA_FIXA:
        session['logged_in'] = True
        session['usuario'] = data['usuario']
        return jsonify({'message': 'Login realizado com sucesso', 'usuario': data['usuario']}), 200
    else:
        return jsonify({'error': 'Credenciais inválidas'}), 401

@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.pop('logged_in', None)
    session.pop('usuario', None)
    return jsonify({'message': 'Logout realizado com sucesso'}), 200

@auth_bp.route('/check-auth', methods=['GET'])
def check_auth():
    if session.get('logged_in'):
        return jsonify({'authenticated': True, 'usuario': session.get('usuario')}), 200
    else:
        return jsonify({'authenticated': False}), 200

