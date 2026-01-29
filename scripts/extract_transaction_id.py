import sys
import os
import json
import logging
import base64
import io
import requests
from dotenv import load_dotenv

# Configure logging to stderr
logging.basicConfig(level=logging.ERROR, stream=sys.stderr, format='%(asctime)s - %(levelname)s - %(message)s')

try:
    import pdfplumber
    from PIL import Image
except ImportError as e:
    print(json.dumps({"error": f"Missing dependency: {str(e)}", "details": "Please run: pip install pdfplumber pillow requests python-dotenv"}))
    sys.exit(1)

# Load environment variables
load_dotenv()
load_dotenv(".env.local") 

API_KEY = os.getenv("GEMINI_API_KEY")

MODELS_TO_TRY = [
    "gemini-2.0-flash",
    "gemini-2.5-flash",
    "gemini-2.0-flash-001"
]

def call_gemini_api(content_parts, model_name):
    if not API_KEY:
         raise ValueError("GEMINI_API_KEY not found in environment variables")
    
    # Construct URL: ensure 'models/' prefix is handled correctly
    # If model_name already has 'models/', don't add it.
    if model_name.startswith("models/"):
        model_id = model_name
    else:
        model_id = f"models/{model_name}"

    url = f"https://generativelanguage.googleapis.com/v1beta/{model_id}:generateContent?key={API_KEY}"
    headers = {'Content-Type': 'application/json'}
    
    payload = {
        "contents": [{
            "parts": content_parts
        }],
        "generationConfig": {
            "response_mime_type": "application/json"
        }
    }
    
    response = requests.post(url, headers=headers, json=payload)
    
    if response.status_code != 200:
        error_details = response.text
        try:
            error_json = response.json()
            error_details = error_json.get('error', {}).get('message', response.text)
        except:
            pass
        raise Exception(f"Model {model_name} failed ({response.status_code}): {error_details}")

    return response.json()

def extract_text_from_pdf(pdf_path: str) -> str:
    text_content = ""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text_content += page_text + "\n"
    except Exception as e:
        logging.error(f"PDF processing error: {e}")
        raise
    
    return text_content.strip()

def get_transaction_id(content, is_image=False):
    prompt_text = """
    You are a financial data extraction assistant.
    Your goal is to extract the **UPI Transaction ID**.

    RULES:
    1. **PRIORITY**: Look for a 12-digit numeric ID labeled "UPI transaction ID" or "UPI Ref No". This is the target.
    2. **AVOID**: Do NOT return "Google transaction ID" (often alphanumeric like 'CIC...') unless it is the *only* ID present.
    3. If both a UPI ID (12 digits) and a Google ID are visible, **return the UPI ID**.
    4. Return strictly valid JSON with a single key: "transaction_id".
    5. If no ID is found, return { "transaction_id": null }.
    """
    
    parts = [{"text": prompt_text}]
    
    if is_image:
        # Content is PIL Image -> Convert to Base64
        buffered = io.BytesIO()
        content.save(buffered, format="JPEG")
        img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
        
        parts.append({
            "inline_data": {
                "mime_type": "image/jpeg",
                "data": img_str
            }
        })
    else:
        # Content is text string
        parts.append({"text": content})

    last_error = None
    
    # Retry Loop
    for model in MODELS_TO_TRY:
        try:
            logging.info(f"Trying model: {model}")
            result = call_gemini_api(parts, model)
            
            # If success, extract and return
            try:
                candidate = result['candidates'][0]['content']['parts'][0]['text']
                # Basic validation that it's not empty
                if candidate:
                    return candidate
            except (KeyError, IndexError, TypeError):
                # If structure is wrong, maybe try next model? Or just fail?
                # Usually if structure is wrong, model failed to follow instructions.
                # Let's keep trying other models.
                logging.warning(f"Model {model} returned invalid structure: {json.dumps(result)}")
                continue

        except Exception as e:
            logging.warning(f"Model {model} failed: {e}")
            last_error = e
            continue
    
    # If all failed
    if last_error:
        raise Exception(f"All models failed. Last error: {last_error}")
    raise Exception("Extraction failed with all models.")

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No file path provided"}))
        sys.exit(1)

    file_path = sys.argv[1]

    if not os.path.exists(file_path):
        print(json.dumps({"error": "File not found"}))
        sys.exit(1)

    try:
        file_ext = os.path.splitext(file_path)[1].lower()
        gemini_response_text = ""

        if file_ext == ".pdf":
            extracted_text = extract_text_from_pdf(file_path)
            if not extracted_text:
                print(json.dumps({"error": "PDF is empty or scanned. Text extraction failed.", "scanned_pdf": True}))
                sys.exit(0)
            gemini_response_text = get_transaction_id(extracted_text, is_image=False)

        elif file_ext in [".jpg", ".jpeg", ".png", ".webp", ".heic"]:
            try:
                img = Image.open(file_path)
            except Exception as e:
                print(json.dumps({"error": "Invalid image file", "details": str(e)}))
                sys.exit(1)
            gemini_response_text = get_transaction_id(img, is_image=True)

        else:
            print(json.dumps({"error": "Unsupported file format"}))
            sys.exit(1)

        if not gemini_response_text:
             print(json.dumps({"error": "Empty response from AI"}))
             sys.exit(1)

        # Cleanup and Parse
        clean_json = gemini_response_text.replace("```json", "").replace("```", "").strip()
        
        try:
            data = json.loads(clean_json)
            # Ensure we print valid JSON to stdout
            print(json.dumps(data)) 
        except json.JSONDecodeError:
            print(json.dumps({"error": "Failed to parse AI response", "raw_response": clean_json}))

    except Exception as e:
        logging.error(f"script error: {e}")
        print(json.dumps({"error": "Internal script error", "details": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
