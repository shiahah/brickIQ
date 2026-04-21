import pandas as pd
import numpy as np
from xgboost import XGBRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
import joblib
import os
import shap

def load_and_preprocess():
    print("Loading datasets...")
    filepath = '../../dataset/mumbai_house_data.csv'
    
    try:
        df = pd.read_csv(filepath)
    except Exception as e:
        print(f"Error loading {filepath}: {e}")
        return None, None, None, None, None, None

    def calc_price(row):
        p = float(row['price'])
        if row['price_unit'] == 'Cr':
            return p * 10000000
        elif row['price_unit'] == 'L':
            return p * 100000
        return p
    
    df = df.dropna(subset=['price', 'price_unit', 'area', 'locality', 'type', 'expected_roi(%)', 'demand_indicator', 'market_volatitlity_score'])
    
    df['price_rs'] = df.apply(calc_price, axis=1)
    df['area_num'] = pd.to_numeric(df['area'], errors='coerce')
    df = df.dropna(subset=['area_num'])
    df = df[df['area_num'] > 0]
    
    df['price_per_sqft'] = df['price_rs'] / df['area_num']
    
    le_loc = LabelEncoder()
    df['locality_encoded'] = le_loc.fit_transform(df['locality'].astype(str))
    
    le_type = LabelEncoder()
    df['type_encoded'] = le_type.fit_transform(df['type'].astype(str))
    
    # Fill any remaining NAs
    df['property_liquidity_index'] = df['property_liquidity_index'].fillna(df['property_liquidity_index'].median())
    
    X = df[['locality_encoded', 'type_encoded', 'demand_indicator', 'market_volatitlity_score', 'property_liquidity_index']]
    y_roi = df['expected_roi(%)']
    y_price = df['price_per_sqft']
    
    # Save a locality dictionary for predict.py to pull average stats from
    locality_stats = df.groupby('locality_encoded')[['demand_indicator', 'market_volatitlity_score', 'property_liquidity_index']].median().reset_index()
    
    return X, y_roi, y_price, le_loc, le_type, locality_stats

def train_models():
    X, y_roi, y_price, le_loc, le_type, locality_stats = load_and_preprocess()
    
    if X is None:
        return
        
    print("Scaling features...")
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    print("Training XGBoost Regressor for ROI...")
    X_train_r, X_test_r, y_train_r, y_test_r = train_test_split(X_scaled, y_roi, test_size=0.2, random_state=42)
    reg_roi = XGBRegressor(n_estimators=100, max_depth=5, learning_rate=0.1, reg_lambda=2.0)
    reg_roi.fit(X_train_r, y_train_r)
    print(f"ROI Regressor Test R2 Score: {reg_roi.score(X_test_r, y_test_r):.4f}")
    
    print("Training XGBoost Regressor for Price Per Sqft...")
    X_train_p, X_test_p, y_train_p, y_test_p = train_test_split(X_scaled, y_price, test_size=0.2, random_state=42)
    reg_price = XGBRegressor(n_estimators=100, max_depth=5, learning_rate=0.1, reg_lambda=2.0)
    reg_price.fit(X_train_p, y_train_p)
    print(f"Price Regressor Test R2 Score: {reg_price.score(X_test_p, y_test_p):.4f}")

    print("Saving models and SHAP explainer...")
    os.makedirs('artifacts', exist_ok=True)
    
    explainer_roi = shap.TreeExplainer(reg_roi)
    
    joblib.dump(reg_roi, 'artifacts/roi_model.pkl')
    joblib.dump(reg_price, 'artifacts/price_model.pkl')
    joblib.dump(scaler, 'artifacts/scaler.pkl')
    joblib.dump(le_loc, 'artifacts/le_loc.pkl')
    joblib.dump(le_type, 'artifacts/le_type.pkl')
    joblib.dump(explainer_roi, 'artifacts/explainer_roi.pkl')
    locality_stats.to_csv('artifacts/locality_stats.csv', index=False)
    print("Saved successfully in artifacts/")

if __name__ == '__main__':
    train_models()
