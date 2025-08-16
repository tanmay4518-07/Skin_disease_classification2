import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras import layers, models, callbacks
import os

# ================================================================
# Dataset path
base_dir = "IMG_CLASSES"

IMG_SIZE = (256, 256)
BATCH_SIZE = 32
WARMUP_EPOCHS = 15
FINE_TUNE_EPOCHS = 25
INIT_LR = 1e-4
FINE_TUNE_LR = 1e-5

# ================================================================
# Data augmentation
train_datagen = ImageDataGenerator(
    rescale=1./255,
    rotation_range=15,
    width_shift_range=0.1,
    height_shift_range=0.1,
    zoom_range=0.1,
    horizontal_flip=True,
    validation_split=0.1
)

val_datagen = ImageDataGenerator(
    rescale=1./255,
    validation_split=0.1
)

train_generator = train_datagen.flow_from_directory(
    base_dir,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    subset='training',
    shuffle=True
)

val_generator = val_datagen.flow_from_directory(
    base_dir,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    subset='validation',
    shuffle=False
)

# ================================================================
# Cosine decay LR
def cosine_decay_schedule(initial_lr, total_epochs):
    return tf.keras.optimizers.schedules.CosineDecay(
        initial_learning_rate=initial_lr,
        decay_steps=total_epochs * len(train_generator),
        alpha=0.01
    )

# ================================================================
# Model checkpoint
os.makedirs("checkpoints", exist_ok=True)
checkpoint_cb = callbacks.ModelCheckpoint(
    filepath="checkpoints/epoch_{epoch:02d}_valacc_{val_accuracy:.4f}.h5",
    save_best_only=False,
    save_weights_only=False,
    verbose=1
)

# ================================================================
# Base model
base_model = MobileNetV2(
    weights='imagenet',
    include_top=False,
    input_shape=(IMG_SIZE[0], IMG_SIZE[1], 3)
)
base_model.trainable = False

# Head
model = models.Sequential([
    base_model,
    layers.GlobalAveragePooling2D(),
    layers.Dropout(0.3),
    layers.Dense(256, activation='relu'),
    layers.Dropout(0.3),
    layers.Dense(train_generator.num_classes, activation='softmax')
])

# ================================================================
# Warm-up training
print("🔥 Warm-up training...")
optimizer_warmup = tf.keras.optimizers.Adam(
    learning_rate=cosine_decay_schedule(INIT_LR, WARMUP_EPOCHS)
)
model.compile(
    optimizer=optimizer_warmup,
    loss='categorical_crossentropy',
    metrics=['accuracy']
)
model.fit(
    train_generator,
    epochs=WARMUP_EPOCHS,
    validation_data=val_generator,
    callbacks=[checkpoint_cb]
)

# ================================================================
# Fine-tuning
print("🎯 Fine-tuning...")
base_model.trainable = True
optimizer_ft = tf.keras.optimizers.Adam(
    learning_rate=cosine_decay_schedule(FINE_TUNE_LR, FINE_TUNE_EPOCHS)
)
model.compile(
    optimizer=optimizer_ft,
    loss='categorical_crossentropy',
    metrics=['accuracy']
)
model.fit(
    train_generator,
    epochs=FINE_TUNE_EPOCHS,
    validation_data=val_generator,
    callbacks=[checkpoint_cb]
)
