# First Time Setup Guide
Welcome to the BrickIQ Local Installation branch. Please follow these exact steps chronologically to pull down the code safely and launch both application servers natively on a completely isolated laptop!

*Pre-requisites: You must have [Node.js](https://nodejs.org/en) and [Python](https://www.python.org/downloads/) installed prior to running these routines.*

---

### Step 1: Download the Project
1. Create a blank folder anywhere on the laptop (e.g., on the Desktop) and call it `BrickIQ-Project`.
2. Open **VSCode** and go to `File -> Open Folder` to select that completely empty folder you just made.
3. In the top VSCode menu, click **Terminal -> New Terminal**. 
4. Run this exact command to pull the code securely from GitHub:
   ```shell
   git clone https://github.com/shiahah/brickIQ.git
   ```
5. Move your terminal *into* the newly downloaded repository folder:
   ```shell
   cd brickIQ
   ```

### Step 2: Configure the API Keys (Critical!)
Because we securely blocked GitHub from stealing your private keys, the `.env` file is purposely missing from the repository footprint. You logically must reinstall it to grant the backend AI capabilities natively!
1. In the VSCode file explorer on the left, right-click inside the `backend` folder and choose **New File**.
2. Name the file exactly **`.env`** (Don't forget the dot!).
3. Open it and copy/paste your master keys exactly like this (you'll need to locate your actual connection strings):
```env
PORT=5000
MONGO_URI=your_mongo_database_url_here
JWT_SECRET=any_random_text_string
GROQ_API_KEY=your_groq_api_key_here
GOOGLE_PLACES_API_KEY=your_google_api_key_here
```

### Step 3: Install the Backend (Node & Machine Learning APIs)
We need to install the server controls and the Python XGBoost Mathematical engines inside the `backend` directory cleanly.
1. Still in your terminal, move into the backend folder:
   ```shell
   cd backend
   ```
2. Install the standard Node controllers:
   ```shell
   npm install
   ```
3. Set up a secure Python environment to download the ML architecture (like `pandas`, `xgboost`, and `shap`). Run these three lines one by one carefully depending on your OS architecture:

   **For Windows:**
   ```shell
   python -m venv venv
   .\venv\Scripts\activate
   pip install -r ..\requirements.txt
   ```
   
   **For Mac/Linux:**
   ```shell
   python3 -m venv venv
   source venv/bin/activate
   pip install -r ../requirements.txt
   ```

### Step 4: Install the Frontend (React UI & Leaflet Routing)
1. Inside VSCode, look right above the terminal panel and click the small **`+`** icon. This explicitly forces open a **second, completely separate terminal**.
2. Inside this *new* terminal, move exactly into the frontend React directory:
   ```shell
   cd frontend
   ```
3. Intialize the visual UI plugins. *(We must use the legacy flag to ensure the Maps install safely without 18.2 peer dependency conflicts!)*:
   ```shell
   npm install --legacy-peer-deps
   ```

### Step 5: Boot Up The Platform Integrations!
To spin the application natively, you must power on both the Frontend DOM node and the Backend server simultaneously across both isolated terminals.

1. **In Terminal 1 (Backend):** Go to that terminal tab (`cd backend`) and execute:
   ```shell
   node index.js
   ```
   *(It will eventually print "Server running" and "Connected to MongoDB").*

2. **In Terminal 2 (Frontend):** Navigate back to the other terminal tab (`cd frontend`) and spin Vite locally:
   ```shell
   npm start
   ```

The application will automatically inject and run inside your browser at **`localhost:3000`** with Demand-Gap intelligence completely working flawlessly!
