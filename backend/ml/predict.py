import sys
import json
import joblib
import pandas as pd
import numpy as np
import os
import shap

def main():
    try:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        reg_roi = joblib.load(os.path.join(base_dir, 'artifacts', 'roi_model.pkl'))
        reg_price = joblib.load(os.path.join(base_dir, 'artifacts', 'price_model.pkl'))
        scaler = joblib.load(os.path.join(base_dir, 'artifacts', 'scaler.pkl'))
        le_loc = joblib.load(os.path.join(base_dir, 'artifacts', 'le_loc.pkl'))
        le_type = joblib.load(os.path.join(base_dir, 'artifacts', 'le_type.pkl'))
        explainer_roi = joblib.load(os.path.join(base_dir, 'artifacts', 'explainer_roi.pkl'))
        
        stats_path = os.path.join(base_dir, 'artifacts', 'locality_stats.csv')
        locality_stats = pd.read_csv(stats_path)
        
        feature_names = ['locality', 'property_type', 'demand_indicator', 'market_volatility_score', 'property_liquidity']

        if len(sys.argv) > 1:
            input_data = json.loads(sys.argv[1])
        else:
            input_data = {"locality": "Andheri West", "plot_size": 10000, "recommendations": ["Commercial Office", "Apartment"]}
            
        locality = input_data.get('locality', 'Andheri West')
        plot_size = float(input_data.get('plot_size', 5000))
        recommendations = input_data.get('recommendations', ['Apartment'])
        
        try:
            loc_encoded = le_loc.transform([locality])[0]
        except ValueError:
            loc_encoded = locality_stats['locality_encoded'].mode()[0]
            
        stats_row = locality_stats[locality_stats['locality_encoded'] == loc_encoded]
        if stats_row.empty:
            stats_row = locality_stats.median()
        else:
            stats_row = stats_row.iloc[0]
            
        demand = stats_row['demand_indicator']
        volatility = stats_row['market_volatitlity_score']
        liquidity = stats_row['property_liquidity_index']
        
        results = []
        
        for rec in recommendations:
            res_val = rec if isinstance(rec, str) else rec.get('type', 'Apartment')
            is_commercial = any(x in res_val.lower() for x in ['commercial', 'office', 'retail', 'shop', 'multiplex'])
            
            fsi = 5.0 if is_commercial else 2.5
            cost_per_sqft = 5000 if is_commercial else 3000
            
            try:
                if is_commercial:
                    type_str = 'Studio Apartment' 
                else:
                    type_str = 'Apartment' if 'apartment' in res_val.lower() else 'Villa'
                    
                type_encoded = le_type.transform([type_str])[0]
            except Exception:
                type_encoded = 0
                
            X_input = pd.DataFrame([{
                'locality_encoded': loc_encoded,
                'type_encoded': type_encoded,
                'demand_indicator': demand,
                'market_volatitlity_score': volatility,
                'property_liquidity_index': liquidity
            }])
            
            X_scaled = scaler.transform(X_input)
            
            roi = reg_roi.predict(X_scaled)[0]
            price_per_sqft = reg_price.predict(X_scaled)[0]
            
            # Apply Mumbai Builder Logic
            saleable_area = plot_size * fsi
            total_revenue = saleable_area * price_per_sqft
            construction_cost = saleable_area * cost_per_sqft
            net_profit = total_revenue - construction_cost
            
            # SHAP Insight Extractor
            shap_vals = explainer_roi.shap_values(X_scaled)[0] 
            best_feat_idx = np.argmax(shap_vals)
            best_feat_name = feature_names[best_feat_idx]
            best_feat_val = shap_vals[best_feat_idx]
            
            explanation = f"Locality's '{best_feat_name.replace('_', ' ')}' positively drove +{best_feat_val:.1f}% to the predicted ROI."
            
            results.append({
                "type": res_val,
                "projected_fsi": fsi,
                "predicted_price_sqft": round(float(price_per_sqft), 2),
                "total_revenue_cr": round(float(total_revenue) / 10000000, 2),
                "net_profit_cr": round(float(net_profit) / 10000000, 2),
                "expected_roi_percentage": round(float(roi), 2),
                "shap_explanation": explanation
            })

        print(json.dumps(results))

    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
