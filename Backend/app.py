from __init__ import create_app
from flask_cors import CORS
from flask import request, jsonify
import numpy as np
import pandas as pd
import pickle
import os
import difflib
from config import Config

app = create_app()

# Configure CORS - simpler configuration
CORS(app)

# Import routes after app initialization
from user import routes

# load databasedataset===================================
class Recommendation:
    def __init__(self, input_symptoms):
        # Modify how we handle input symptoms
        if isinstance(input_symptoms, str):
            # Split by comma and clean up each symptom
            self.input_symptoms = [
                symptom.strip().lower().replace(' ', '_') 
                for symptom in input_symptoms.split(',')
                if symptom.strip()
            ]
        else:
            self.input_symptoms = [input_symptoms]

        print("Processed input symptoms:", self.input_symptoms)  # Debug log

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
        
        # Clean up datasets
        if "Unnamed: 0" in self.dataset_precautions.columns:
            self.dataset_precautions = self.dataset_precautions.drop(columns=["Unnamed: 0"], axis=1)
        
        self.disease = self.predict()
    
    def find_closest_symptom(self, symptom):
        """
        Find the closest matching symptom in our dataset.
        """
        # Clean up the input symptom
        symptom = symptom.strip().lower()
        # Replace underscores with spaces for matching
        symptom = symptom.replace('_', ' ')
        
        print(f"Finding match for symptom: {symptom}")  # Debug log
        #print(f"Available columns: {self.columns}")  # Debug log
        
        # Get matches with a cutoff of 0.6 (adjust this value if needed)
        matches = difflib.get_close_matches(symptom, self.columns, n=1, cutoff=0.6)
        
        if matches:
            print(f"Found match: {matches[0]} for input: {symptom}")  # Debug log
            return matches[0]
        else:
            print(f"No match found for: {symptom}")  # Debug log
            return None

    def predict(self):
        try:
            if not self.input_symptoms or all(not s for s in self.input_symptoms):
                print("No valid symptoms provided")
                return None

            input_vector = np.zeros(len(self.columns))
            matched_symptoms = []

            for symptom in self.input_symptoms:
                if not symptom:  # Skip empty symptoms
                    continue
                
                matched_symptom = self.find_closest_symptom(symptom)
                if matched_symptom:
                    index = np.where(self.columns == matched_symptom)[0][0]
                    input_vector[index] = 1
                    matched_symptoms.append(f"Matched '{symptom}' to '{matched_symptom}'")
                else:
                    print(f"Warning: Could not find close match for symptom '{symptom}'")

            if not matched_symptoms:
                print("No symptoms could be matched")
                return None

            print("Matched symptoms:", matched_symptoms)  # Debug log
            
            # Use shape parameter instead of newshape
            input_vector = np.reshape(input_vector, shape=(1, -1))
            prediction = self.le.inverse_transform(self.model.predict(input_vector))[0]
            print(f"Predicted disease: {prediction}")
            return prediction
            
        except Exception as e:
            print(f"Error in predict method: {str(e)}")
            import traceback
            traceback.print_exc()
            return None
    
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
        """
        Get precautions for a specific disease.
        """
        if self.disease not in self.dataset_precautions["Disease"].values:
            return ["No specific precautions found for this condition"]
            
        precaution_data = self.dataset_precautions[self.dataset_precautions["Disease"] == self.disease].iloc[:, 1:].values[0]
        return self.clean_list_data(precaution_data)



@app.route('/predict', methods=['POST'])
def predict():
    try:
        print("\n=== New Prediction Request ===")
        print("Received request headers:", request.headers)
        raw_data = request.get_data()
        print("Raw request data:", raw_data.decode('utf-8'))

        if not request.is_json:
            print("Request is not JSON")
            return jsonify({
                'error': 'Content-Type must be application/json'
            }), 415

        data = request.get_json()
        print("Parsed JSON data:", data)
        
        if not data or 'symptoms' not in data:
            print("No symptoms in request data")
            return jsonify({
                'error': 'No symptoms provided in request'
            }), 400

        symptoms = data.get('symptoms', '').strip()
        additional_info = data.get('additional_info', '').strip()
        print(f"Extracted symptoms: {symptoms}")
        print(f"Additional info: {additional_info}")
        
        if not symptoms:
            print("Empty symptoms string")
            return jsonify({
                'error': 'Empty symptoms string provided'
            }), 400

        # Split symptoms by comma and clean them
        symptom_list = [s.strip() for s in symptoms.split(',') if s.strip()]
        print("Processed symptom list:", symptom_list)
        
        if not symptom_list:
            print("No valid symptoms after processing")
            return jsonify({
                'error': 'No valid symptoms found after processing'
            }), 400

        try:
            recommendation = Recommendation(symptoms)
            
            if not recommendation.disease:
                print("Could not predict disease")
                return jsonify({
                    'error': 'Could not predict disease from provided symptoms'
                }), 500
                
            response_data = {
                'predicted_disease': recommendation.disease,
                'description': recommendation.get_description(),
                'medications': recommendation.get_medication(),
                'diet': recommendation.get_diet(),
                'precautions': recommendation.get_precautions()
            }

            print("Sending response:", response_data)
            return jsonify(response_data)
            
        except Exception as model_error:
            print("Error in model prediction:", str(model_error))
            import traceback
            traceback.print_exc()
            return jsonify({
                'error': f'Error in model prediction: {str(model_error)}'
            }), 500

    except Exception as e:
        print("Error occurred:", str(e))
        import traceback
        traceback.print_exc()
        return jsonify({
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True)