from flask import Blueprint, jsonify
from user.models import User
from auth import token_required

user_bp = Blueprint('user', __name__)

@user_bp.route('/api/auth/signup', methods=['POST'])
def signup():
    return User().signup()

@user_bp.route('/user/signout')
def signout():
  return User().signout()

@user_bp.route('/api/auth/login', methods=['POST'])
def login():
    return User().login()

@user_bp.route('/api/user/profile', methods=['GET'])
@token_required
def get_profile(current_user):
    return User().get_profile(current_user['_id'])

@user_bp.route('/api/auth/verify-token', methods=['GET'])
@token_required
def verify_token(current_user):
    return jsonify({
        'user': {
            'id': current_user['_id'],
            'name': current_user['name'],
            'email': current_user['email']
        }
    }), 200