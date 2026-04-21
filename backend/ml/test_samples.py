import subprocess
import json
import os

def run_samples():
    samples = [
        {"city": "Gurgaon", "sector": "Sector 84", "bedrooms": 3, "bathrooms": 3, "age": 5, "carpet_sqft": 2000},
        {"city": "Mumbai", "sector": "Andheri West", "bedrooms": 2, "bathrooms": 2, "age": 10, "carpet_sqft": 800},
        {"city": "Hyderabad", "sector": "Gachibowli", "bedrooms": 4, "bathrooms": 4, "age": 2, "carpet_sqft": 3000},
        {"city": "Kolkata", "sector": "Rajarhat", "bedrooms": 3, "bathrooms": 2, "age": 7, "carpet_sqft": 1500},
        {"city": "Mumbai", "sector": "Bandra East", "bedrooms": 1, "bathrooms": 1, "age": 15, "carpet_sqft": 500}
    ]

    out = "\n## 5 Sample Model Predictions\n\n"
    venv_python = os.path.join("..", "venv", "Scripts", "python.exe")
    
    for s in samples:
        enc = json.dumps(s)
        res = subprocess.run([venv_python, "predict.py", enc], capture_output=True, text=True)
        
        try:
            parsed = json.loads(res.stdout.strip())
            pretty_out = json.dumps(parsed, indent=2)
        except:
            pretty_out = res.stdout.strip()
            
        out += f"**Input Configuration:**\n```json\n{json.dumps(s, indent=2)}\n```\n**Model Output:**\n```json\n{pretty_out}\n```\n\n---\n"
        
    with open("samples.md", "w") as f:
        f.write(out)

if __name__ == "__main__":
    run_samples()
