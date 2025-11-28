import React from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import ImageCropPicker from 'react-native-image-crop-picker';
import AppText from '../AppText';

const ImagePickerModal = ({ visible, onClose, onImagePicked }) => {
  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'This app needs access to your camera to take photos.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  // ✅ Pick from gallery with crop
  const handlePickImageFromGallery = async () => {
    try {
      const image = await ImageCropPicker.openPicker({
        width: 400,
        height: 400,
        cropping: true, // opens crop UI
        compressImageQuality: 0.8,
        mediaType: 'photo',
        includeBase64: false,
      });
      onImagePicked(image);
      onClose();
    } catch (error) {
      if (error.message?.includes('cancelled')) return;
      console.error('Gallery Error:', error);
    }
  };

  // ✅ Capture from camera with crop
  const handlePickImageFromCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    try {
      const image = await ImageCropPicker.openCamera({
        width: 400,
        height: 400,
        cropping: true,
        compressImageQuality: 0.8,
        mediaType: 'photo',
      });
      onImagePicked(image);
      onClose();
    } catch (error) {
      if (error.message?.includes('cancelled')) return;
      console.error('Camera Error:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              <AppText style={styles.title}>Pick an Image</AppText>

              <TouchableOpacity
                style={styles.optionButton}
                onPress={handlePickImageFromGallery}
              >
                <AppText style={styles.optionText}>Choose from Gallery</AppText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.optionButton}
                onPress={handlePickImageFromCamera}
              >
                <AppText style={styles.optionText}>Use Camera</AppText>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default ImagePickerModal;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  optionButton: {
    width: '100%',
    backgroundColor: '#ecf0f1',
    padding: 12,
    marginVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
});
