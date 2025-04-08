from flask import Flask, request, render_template, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
import pickle
import os
import difflib

# flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# load databasedataset===================================
class Recommendation:
    def __init__(self, input_symptoms):
        if "," in input_symptoms:
            self.input_symptoms = input_symptoms.split(",")
        else:
            self.input_symptoms = [input_symptoms]

        # Use relative paths instead of hardcoded paths
        current_dir = os.path.dirname(os.path.abspath(__file__))
        
        # Load model files
        self.model = pickle.load(open(os.path.join(current_dir, "model.pkl"), "rb"))
        self.le = pickle.load(open(os.path.join(current_dir, "encoder.pkl"), "rb"))  
        self.columns = pickle.load(open(os.path.join(current_dir, "col.pkl"), "rb"))
        
        # Load dataset files
        self.dataset_diets = pd.read_csv(os.path.join(current_dir, "data sets", "diets.csv"))
        self.dataset_description = pd.read_csv(os.path.join(current_dir, "data sets", "description.csv"))
        self.dataset_medication = pd.read_csv(os.path.join(current_dir, "data sets", "medications.csv"))
        self.dataset_precautions = pd.read_csv(os.path.join(current_dir, "data sets", "precautions_df.csv"))
        self.dataset_workout = pd.read_csv(os.path.join(current_dir, "data sets", "workout_df.csv"))
        
        # Clean up datasets
        if "Unnamed: 0" in self.dataset_precautions.columns:
            self.dataset_precautions = self.dataset_precautions.drop(columns=["Unnamed: 0"], axis=1)
        
        if self.dataset_workout.shape[1] > 2:
            self.dataset_workout = self.dataset_workout.iloc[:, 2:]

        self.disease = self.predict()
    
    def find_closest_symptom(self, symptom):
        # Replace underscores with spaces for matching
        symptom = symptom.replace('_', ' ')
        # Get matches with a cutoff of 0.6 (adjust this value if needed)
        matches = difflib.get_close_matches(symptom, self.columns, n=1, cutoff=0.6)
        return matches[0] if matches else None

    def predict(self):
        input_vector = np.zeros(len(self.columns))
        for symptom in self.input_symptoms:
            matched_symptom = self.find_closest_symptom(symptom)
            if matched_symptom:
                index = np.where(self.columns == matched_symptom)[0][0]
                input_vector[index] = 1
                print(f"Matched '{symptom}' to '{matched_symptom}'")
            else:
                print(f"Warning: Could not find close match for symptom '{symptom}'")

        # Use shape parameter instead of newshape
        input_vector = np.reshape(input_vector, shape=(1, -1))
        return self.le.inverse_transform(self.model.predict(input_vector))[0]
    
    def clean_list_data(self, data):
        if isinstance(data, (list, np.ndarray)):
            return [str(item).strip() for item in data if item is not None and str(item).lower() != 'nan']
        elif isinstance(data, str):
            if data.startswith('[') and data.endswith(']'):
                try:
                    import ast
                    parsed = ast.literal_eval(data)
                    if isinstance(parsed, list):
                        return [str(item).strip() for item in parsed if item is not None]
                except:
                    pass
            return [data.strip()]
        return []

    def get_diet(self):
        if self.disease not in self.dataset_diets["Disease"].values:
            return ["No diet info found"]
        diet_data = self.dataset_diets[self.dataset_diets["Disease"] == self.disease].iloc[:, 1:].values[0][0]
        return self.clean_list_data(diet_data)
    
    def get_description(self):
        if self.disease not in self.dataset_description["Disease"].values:
            return "No description found"
        return str(self.dataset_description[self.dataset_description["Disease"] == self.disease].iloc[:, 1:].values[0][0])
    
    def get_medication(self):
        if self.disease not in self.dataset_medication["Disease"].values:
            return ["No medication info found"]
        med_data = self.dataset_medication[self.dataset_medication["Disease"] == self.disease].iloc[:, 1:].values[0][0]
        return self.clean_list_data(med_data)
    
    def get_precautions(self):
        if self.disease not in self.dataset_precautions["Disease"].values:
            return ["No precautions found"]
        precaution_data = self.dataset_precautions[self.dataset_precautions["Disease"] == self.disease].iloc[:, 1:].values[0]
        return self.clean_list_data(precaution_data)
    
    def get_workout(self):
        if self.disease not in self.dataset_workout["disease"].values:
            return ["No workout info found"]
        workout_data = self.dataset_workout[self.dataset_workout["disease"] == self.disease].iloc[:, 1:].values[0][0]
        return self.clean_list_data(workout_data)

@app.route("/")
def index():
    return render_template("index.html")

@app.route('/predict', methods=['POST'])
def predict():
    try:
        print("Received request headers:", request.headers)
        print("Received request data:", request.get_data())

        if not request.is_json:
            print("Request is not JSON")
            return jsonify({
                'error': 'Content-Type must be application/json'
            }), 415

        data = request.get_json()
        print("Parsed JSON data:", data)
        
        if not data or 'symptoms' not in data:
            return jsonify({
                'error': 'No symptoms provided'
            }), 400

        symptoms = data['symptoms']
        print("Processing symptoms:", symptoms)
        
        recommendation = Recommendation(symptoms)
        
        response_data = {
            'predicted_disease': recommendation.disease,
            'description': recommendation.get_description(),
            'medications': recommendation.get_medication(),
            'diet': recommendation.get_diet(),
            'precautions': recommendation.get_precautions(),
            'workout': recommendation.get_workout()
        }

        print("Sending response:", response_data)
        return jsonify(response_data)

    except Exception as e:
        print("Error occurred:", str(e))
        import traceback
        traceback.print_exc()
        return jsonify({
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True)