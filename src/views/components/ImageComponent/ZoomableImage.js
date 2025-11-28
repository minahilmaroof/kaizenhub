import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import Ionicons from './IconComponent';

const { width } = Dimensions.get('window');
const ZoomableImage = ({ uri, style, placeholder, resizeMode = 'contain' }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const placeholderSource =
    typeof placeholder === 'number' ? placeholder : { uri: placeholder };

  const imageSource = uri ? { uri } : placeholderSource; // 👈 use placeholder if no uri

  const images = uri ? [{ url: uri }] : [];

  return (
    <>
      {/* Thumbnail */}
      <TouchableOpacity onPress={() => uri && setModalVisible(true)}>
        <Image
          source={imageSource} // 👈 always show something
          style={style}
          resizeMode={resizeMode}
        />
      </TouchableOpacity>

      {/* Modal Preview */}
      {uri && (
        <Modal
          visible={modalVisible}
          transparent
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalBackground}>
            <ImageViewer
              imageUrls={images}
              enableSwipeDown
              onSwipeDown={() => setModalVisible(false)}
              onCancel={() => setModalVisible(false)}
              renderHeader={() => (
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <View style={styles.closeIconCircle}>
                    <Ionicons name="close" size={24} color="white" />
                  </View>
                </TouchableOpacity>
              )}
              backgroundColor="transparent"
              saveToLocalByLongPress={false}
              renderIndicator={() => null}
              renderImage={props => (
                <View style={styles.previewContainer}>
                  <Image
                    {...props}
                    style={{
                      width: width - 40,
                      height: 400,
                      resizeMode: 'contain',
                    }}
                  />
                </View>
              )}
            />
          </View>
        </Modal>
      )}
    </>
  );
};


const styles = StyleSheet.create({
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    padding: 5,
  },
  closeIconCircle: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 5,
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.80)',
  },
});

export default ZoomableImage;
