from flask import Flask, jsonify, request, session, redirect
from passlib.hash import pbkdf2_sha256
from auth import db, create_token
import uuid

class User:

  def start_session(self, user):
    del user['password']
    session['logged_in'] = True
    session['user'] = user
    return jsonify(user), 200

  def signup(self):
    try:
      data = request.get_json()
      
      # Validate input
      if not all(key in data for key in ['name', 'email', 'password']):
        return jsonify({'error': 'Missing required fields'}), 400

      # Create the user object
      user = {
        "_id": uuid.uuid4().hex,
        "name": data['name'],
        "email": data['email'],
        "password": pbkdf2_sha256.encrypt(data['password'])
      }

      # Check for existing email address
      if db.users.find_one({"email": user['email']}):
        return jsonify({'error': 'Email address already in use'}), 400

      # Insert the user
      if db.users.insert_one(user):
        # Create access token
        token = create_token(user['_id'])
        return jsonify({
          'token': token,
          'user': {
            'id': user['_id'],
            'name': user['name'],
            'email': user['email']
          }
        }), 200

      return jsonify({'error': 'Signup failed'}), 400
    
    except Exception as e:
      return jsonify({'error': str(e)}), 500
  
  def signout(self):
    session.clear()
    return redirect('/')
  
  def login(self):
    try:
      data = request.get_json()

      # Validate input
      if not all(key in data for key in ['email', 'password']):
        return jsonify({'error': 'Missing required fields'}), 400

      user = db.users.find_one({"email": data['email']})

      if user and pbkdf2_sha256.verify(data['password'], user['password']):
        token = create_token(user['_id'])
        return jsonify({
          'token': token,
          'user': {
            'id': user['_id'],
            'name': user['name'],
            'email': user['email']
          }
        }), 200

      return jsonify({'error': 'Invalid login credentials'}), 401

    except Exception as e:
      return jsonify({'error': str(e)}), 500

  def get_profile(self, user_id):
    try:
      user = db.users.find_one({"_id": user_id})
      if user:
        return jsonify({
          'user': {
            'id': user['_id'],
            'name': user['name'],
            'email': user['email']
          }
        }), 200
      return jsonify({'error': 'User not found'}), 404
    
    except Exception as e:
      return jsonify({'error': str(e)}), 500