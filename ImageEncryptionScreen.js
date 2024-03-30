import React, { useState } from 'react';
import { View, Alert, Button, Text, ActivityIndicator, StyleSheet } from 'react-native';
import ImageCropPicker from 'react-native-image-crop-picker';
import RNFS from 'react-native-fs';
import CryptoJS from 'react-native-crypto-js';
import DocumentPicker from 'react-native-document-picker';

const ImageEncryptionScreen = () => {
  const [loading, setLoading] = useState(false);

  const selectImage = async () => {
    try {
      setLoading(true); // Show loading indicator
      const image = await ImageCropPicker.openPicker({
        mediaType: 'photo',
      });
      const imagePath = image.path;
      const encryptedImageData = await encryptImage(imagePath);
      await saveEncryptedDataToTxt(encryptedImageData);
      // Delete the image from the temporary cache folder
      await RNFS.unlink(imagePath);
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'Failed to select image.'); // Wrap text within Alert.alert
    } finally {
      setLoading(false); // Hide loading indicator
    }
  };

  const encryptImage = async (imagePath) => {
    try {
      const imageContent = await RNFS.readFile(imagePath, 'base64');
      const encryptedImageContent = CryptoJS.AES.encrypt(imageContent, 'veeru').toString();
      return encryptedImageContent;
    } catch (error) {
      console.error('Error encrypting image:', error);
      throw error;
    }
  };

  const saveEncryptedDataToTxt = async (encryptedData) => {
    try {
      const directoryPath = `${RNFS.ExternalDirectoryPath}/Encrypted`;
      const currentDate = new Date();
      const fileName = `${currentDate.getTime()}.txt`;
      const filePath = `${directoryPath}/${fileName}`;

      const directoryExists = await RNFS.exists(directoryPath);
      if (!directoryExists) {
        await RNFS.mkdir(directoryPath);
      }

      await RNFS.writeFile(filePath, encryptedData, 'utf8');
      console.log('Encrypted data saved to:', filePath);
      Alert.alert('Success', `Saved as ${fileName}`);
    } catch (error) {
      console.error('Error saving encrypted data:', error);
      Alert.alert('Error', 'Failed to save encrypted data.'); // Wrap text within Alert.alert
    }
  };

  const decryptTxtFile = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });
      console.log('Document Picker Response:', res);
      const { uri, name } = res[0];

      console.log(res);

      setLoading(true);

      const encryptedData = await RNFS.readFile(uri, 'utf8'); // Read encrypted data from selected file

      // Ensure encryptedData is not undefined
      if (!encryptedData) {
        throw new Error('Encrypted data is undefined or empty.');
      }

      // Decrypt data
      const decryptedImageContent = CryptoJS.AES.decrypt(encryptedData, 'veeru').toString(CryptoJS.enc.Utf8);
      // Ensure decrypted data is not empty
      if (!decryptedImageContent) {
        throw new Error('Decrypted data is empty.');
      }

      // Save decrypted data as an image
      await saveDecryptedImage(decryptedImageContent, name.split('.')[0]);
    } catch (error) {
      console.error('Error decrypting data:', error);
      Alert.alert('Error', 'Failed to decrypt data. Please ensure the file contains valid encrypted data.'); // Show an error message to the user
    } finally {
      setLoading(false);
    }
  };


  const saveDecryptedImage = async (decryptedImageData, imageName) => {
    try {
      const imagePath = `${RNFS.ExternalDirectoryPath}/Decrypted`; // Define file path

      const imagePathExists = await RNFS.exists(imagePath);
      if (!imagePathExists) {
        await RNFS.mkdir(imagePath);
      }

      const filePath = `${imagePath}/${imageName}.jpg`;

      await RNFS.writeFile(filePath, decryptedImageData, 'base64'); // Write decrypted image data to file
      console.log('Decrypted image saved to:', filePath);
      // Provide feedback to the user or trigger the next action
      Alert.alert('Success', `Saved as ${filePath}`);
    } catch (error) {
      console.error('Error saving decrypted image:', error);
      // Handle error appropriately
    }
  };

  return (
    <View style={styles.container}>
      <Text>
        {loading && <ActivityIndicator size="large" color="#0000ff" />} {/* Show loading indicator */}
      </Text>
      <Button title="Encrypt" onPress={selectImage} color="#000000"/>
      <View style={styles.gap}></View>
      <Button title="Decrypt" onPress={decryptTxtFile} color="#000000"/>
    </View>
  );

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FBF4F4',
  },
  gap: {
    marginVertical: 10,
  },
});

export default ImageEncryptionScreen;
