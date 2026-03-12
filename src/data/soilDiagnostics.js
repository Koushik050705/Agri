export const soilDiagnostics = {
  "soil_saline": {
    "type": "Saline Soil",
    "issue": "High Salt Concentration",
    "recommendation": "Leach the soil with good quality water. Use gypsum to neutralize salts. Plant salt-tolerant crops like Mustard or Barley.",
    "features": [0.8, 0.4, 0.2], // [Color, Texture, Moisture]
    "ideal_crops": "Mustard, Barley, Sugar Beet",
    "ph_range": "8.5 - 10.0"
  },
  "soil_clay_healthy": {
    "type": "Clay Soil",
    "issue": "Healthy (Heavy)",
    "recommendation": "Soil is rich but prone to waterlogging. Add organic matter (compost) to improve structure and drainage.",
    "features": [0.3, 0.9, 0.8],
    "ideal_crops": "Rice, Wheat, Sugarcane",
    "ph_range": "6.0 - 7.0"
  },
  "soil_sandy_dry": {
    "type": "Sandy Soil",
    "issue": "Moisture Deficiency",
    "recommendation": "Soil drains too fast. Use mulching to retain moisture and add vermicompost to increase water-holding capacity.",
    "features": [0.6, 0.2, 0.1],
    "ideal_crops": "Watermelon, Groundnut, Cactus",
    "ph_range": "5.5 - 6.5"
  },
  "soil_nitrogen_low": {
    "type": "Loamy Soil",
    "issue": "Nitrogen Deficiency",
    "recommendation": "Apply Urea (NPK 46-0-0) or grow leguminous crops like Moong or Soybean to naturally fix nitrogen.",
    "features": [0.4, 0.5, 0.5],
    "ideal_crops": "Corn, Cotton, Vegetables",
    "ph_range": "6.5 - 7.5"
  },
  "soil_fungal_growth": {
    "type": "Black Soil",
    "issue": "Soil-borne Fungal Infection",
    "recommendation": "Solarize the soil by covering with plastic sheets in summer. Apply Trichoderma viride bio-fungicide before next planting.",
    "features": [0.1, 0.7, 0.6],
    "ideal_crops": "Cotton, Soybean, Groundnut",
    "ph_range": "7.2 - 8.5"
  },
  "soil_acidic": {
    "type": "Red Soil",
    "issue": "High Acidity (Low pH)",
    "recommendation": "Apply agricultural lime (calcium carbonate) to raise pH. Avoid acidic fertilizers like Ammonium Sulfate.",
    "features": [0.9, 0.5, 0.4],
    "ideal_crops": "Tea, Coffee, Rubber",
    "ph_range": "4.5 - 5.5"
  }
};
