import requests
import os
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
load_dotenv(".env.local") 

API_KEY = os.getenv("GEMINI_API_KEY")

def list_models():
    if not API_KEY:
        print("Error: GEMINI_API_KEY not found.")
        return

    url = f"https://generativelanguage.googleapis.com/v1beta/models?key={API_KEY}"
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        models = response.json()
        if 'models' in models:
            for model in models['models']:
                print(model['name'])
        else:
            print("No models found in response:", response.text)
    except Exception as e:
        print(f"Error listing models: {e}")
        if 'response' in locals():
             print(response.text)

if __name__ == "__main__":
    list_models()
