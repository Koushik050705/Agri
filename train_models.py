import os

# --- INSTRUCTIONS ---
# 1. Ensure you have Python installed.
# 2. Open a terminal and run: pip install tensorflow tensorflowjs kaggle numpy pillow
# 3. Fill in your Kaggle username below (the key is already pasted).
# 4. Run `python train_models.py`. Note: This downloads ~1GB of data and may take 1+ hours to train.

os.environ['KAGGLE_USERNAME'] = "YOUR_KAGGLE_USERNAME_HERE" 
os.environ['KAGGLE_KEY'] = "c0d87542418bc30c4f1b233f8a149f42" # Token provided

import tensorflow as tf
import kaggle
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D
from tensorflow.keras.models import Model
import shutil

print("Downloading Datasets from Kaggle...")
kaggle.api.authenticate()

# 1. Download PlantVillage dataset
kaggle.api.dataset_download_files('emmarex/plantdisease', path='./plant_data', unzip=True)
# 2. Download Soil dataset
kaggle.api.dataset_download_files('bhavikjikadara/soil-classification-dataset', path='./soil_data', unzip=True)

print("Datasets Downloaded. Starting Training...")

# Set up paths
crop_data_dir = './plant_data/PlantVillage'
soil_data_dir = './soil_data/Soil_types/Soil_types'

def train_and_export_model(data_dir, output_dir, img_size=(224, 224), epochs=10):
    datagen = ImageDataGenerator(validation_split=0.2, rescale=1./255)
    train_gen = datagen.flow_from_directory(
        data_dir, target_size=img_size, batch_size=32, class_mode='categorical', subset='training')
    val_gen = datagen.flow_from_directory(
        data_dir, target_size=img_size, batch_size=32, class_mode='categorical', subset='validation')

    num_classes = len(train_gen.class_indices)
    
    base_model = MobileNetV2(weights='imagenet', include_top=False, input_shape=(224, 224, 3))
    base_model.trainable = False # Transfer learning
    
    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = Dense(128, activation='relu')(x)
    predictions = Dense(num_classes, activation='softmax')(x)
    
    model = Model(inputs=base_model.input, outputs=predictions)
    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
    
    print(f"Training Model on {data_dir} for {epochs} epochs...")
    model.fit(train_gen, validation_data=val_gen, epochs=epochs)
    
    print("Saving and Exporting to TF.js format...")
    tf.saved_model.save(model, f"{output_dir}_saved_model")
    
    os.system(f"tensorflowjs_converter --input_format=tf_saved_model {output_dir}_saved_model {output_dir}")
    print(f"Exported to {output_dir}")
    
    with open(f"{output_dir}/classes.txt", "w") as f:
        for cls_name in sorted(train_gen.class_indices.keys()):
            f.write(f"{cls_name}\n")
            
    print(f"Classes saved to {output_dir}/classes.txt")

# Create public output paths 
os.makedirs("public/models/crop_model", exist_ok=True)
os.makedirs("public/models/soil_model", exist_ok=True)

# Train Crop Model
train_and_export_model(crop_data_dir, "public/models/crop_model", epochs=5)

# Train Soil Model
train_and_export_model(soil_data_dir, "public/models/soil_model", epochs=15)

# Cleanup heavy dataset zips and directories to save space
shutil.rmtree("./plant_data")
shutil.rmtree("./soil_data")
print("All Done! Your Models are in 'public/models' ready for AgriVision.")
