import React, { useState, useEffect } from 'react';
import { View, Button, FlatList, Text, TouchableOpacity } from 'react-native';
import RNFS from 'react-native-fs';

const CustomFilePicker = ({ directoryPath, onSelect }) => {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    async function loadFiles() {
      try {
        const result = await RNFS.readDir(directoryPath);
        setFiles(result);
      } catch (error) {
        console.error('Error reading directory:', error);
      }
    }

    loadFiles();
  }, [directoryPath]);

  const handleFileSelect = (file) => {
    onSelect(file);
  };

  return (
    <View>
      <FlatList
        data={files}
        keyExtractor={(item) => item.path}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleFileSelect(item)}>
            <Text>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default CustomFilePicker;
