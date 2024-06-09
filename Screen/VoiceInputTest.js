import { useState, useEffect } from 'react';
import { View, StyleSheet, Button, Text } from 'react-native';
import { Audio } from 'expo-av';

export default function VoiceInputTest() {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedUri, setRecordedUri] = useState(null);
  const [sound, setSound] = useState(null);

  useEffect(() => {
    async function prepareRecording() {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need permission to record audio');
        return;
      }
    }

    prepareRecording();

    return () => {
      if (recording) {
        recording.stopAndUnloadAsync();
      }

      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  async function startRecording() {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need permission to record audio');
      return;
    }

    const newRecording = new Audio.Recording();
    await newRecording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
    setRecording(newRecording);

    setIsRecording(true);
    setRecordedUri(null);
    await newRecording.startAsync();
  }

  async function stopRecording() {
    setIsRecording(false);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecordedUri(uri);
    console.log('Recorded audio URI:', uri);
  }

  async function playRecording() {
    const { sound } = await Audio.Sound.createAsync({ uri: recordedUri });
    setSound(sound);

    await sound.playAsync();
  }

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <Button title="Start Recording" onPress={startRecording} disabled={isRecording} />
        <Button title="Stop Recording" onPress={stopRecording} disabled={!isRecording} />
      </View>
      {recordedUri && (
        <View style={styles.playbackContainer}>
          <Text>Recorded audio:</Text>
          <Button title="Play Recording" onPress={playRecording} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  playbackContainer: {
    marginTop: 20,
  },
});
