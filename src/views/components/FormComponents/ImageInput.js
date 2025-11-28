import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  ActivityIndicator,
  PermissionsAndroid,Platform
} from "react-native";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import AppText from "../AppText";
import Icon from "../ImageComponent/IconComponent";

function ImageInput({ onChangeImage, currentCount }) {
  const [uploading, setUploading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  async function requestCameraPermission() {
  if (Platform.OS === "android") {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  return true; 
}

async function requestGalleryPermission() {
  if (Platform.OS === "android") {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  return true;
}
  const handlePickImageFromGallery = async() => {

    setUploading(true);
    launchImageLibrary(
      {
        mediaType: "mixed",
        selectionLimit: Math.max(1, 10 - currentCount), // remaining slots
      },
      (response) => {
        setUploading(false);
        setModalVisible(false);

        if (!response.didCancel && !response.errorCode && response.assets?.length) {
          const files = response.assets.map((asset) => ({
            uri: asset.uri,
            type: asset.type?.startsWith("video") ? "video" : "image",
          }));

          files.forEach((file) => onChangeImage(file));
        }
      }
    );
  };

  const handlePickImageFromCamera = async() => {
       const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert("Permission Required", "Camera permission is needed to capture photos.");
      return;
    }
    setUploading(true);

    launchCamera(
      {
        mediaType: "photo", // ✅ fixed (camera does not support "mixed")
        saveToPhotos: true,
      },
      (response) => {
        setUploading(false);
        setModalVisible(false);

        if (!response.didCancel && !response.errorCode && response.assets?.length) {
          const asset = response.assets[0];
          onChangeImage({
            uri: asset.uri,
            type: asset.type?.startsWith("video") ? "video" : "image",
          });
        }
      }
    );
  };

  return (
    <>
      <TouchableOpacity
        style={styles.container}
        onPress={() => setModalVisible(true)}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator size="small" color="#999" />
        ) : (
          <Icon name="camera" size={36} color="#999" />
        )}
      </TouchableOpacity>

      {/* Custom Centered Popup Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.backdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContainer}>
                <AppText style={styles.title}>Upload Media</AppText>

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
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 100,
    height: 100,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "70%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  optionButton: {
    width: "100%",
    backgroundColor: "#ecf0f1",
    padding: 12,
    marginVertical: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  optionText: {
    fontSize: 16,
    color: "#333",
  },
});

export default ImageInput;
