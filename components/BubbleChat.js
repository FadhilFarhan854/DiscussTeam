import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { useState } from 'react';
import { Audio } from 'expo-av';

const BubbleChat = ({ message, isSender, senderName, onLongPress, openDialog, date, type, uriDb }) => {
  const [isPlay, setIsPlay] = useState(false);
  const [sound, setSound] = useState(null);

  const playRecording = async () => {
    if (sound) {
      await sound.unloadAsync();
    }
    const { sound } = await Audio.Sound.createAsync({ uri: uriDb });
    setSound(sound);
    setIsPlay(true);
    sound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
    await sound.playAsync();
  };

  const stopPlay = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
    }
    setIsPlay(false);
  };

  const onPlaybackStatusUpdate = (status) => {
    if (status.didJustFinish) {
      setIsPlay(false);
      setSound(null);
    }
  };

  if (type === 'sound') {
    return (
      <Pressable onLongPress={onLongPress}>
        <View style={[styles.container, isSender ? styles.senderSoundContainer : styles.receiverSoundContainer]}>
          <Text style={styles.name}>{senderName}</Text>
          <Pressable onPress={isPlay ? stopPlay : playRecording}>
            <Image style={styles.imageButton} source={isPlay ? require('../assets/stop-button.png') : require('../assets/play-button-arrowhead.png')} />
          </Pressable>
          <Text style={styles.date}>{date}</Text>
        </View>
      </Pressable>
    );
  } else {
    return (
      <Pressable onLongPress={onLongPress}>
        <View style={[styles.container, isSender ? styles.senderContainer : styles.receiverContainer]}>
          <Text style={styles.name}>{senderName}</Text>
          <Text style={styles.message}>{message}</Text>
          <Text style={styles.date}>{date}</Text>
        </View>
      </Pressable>
    );
  }
};

const styles = StyleSheet.create({
  imageButton: {
    width: 20,
    height: 20,
    marginVertical: 3,
  },
  container: {
    maxWidth: '80%',
    padding: 10,
    paddingTop: 5,
    borderRadius: 10,
    marginBottom: 10,
  },
  senderContainer: {
    alignSelf: 'flex-end',
    backgroundColor: '#a7e3f2',
  },
  receiverContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
  },
  message: {
    fontSize: 16,
    color: '#000000',
  },
  name: {
    fontSize: 12,
    color: '#000000',
    fontWeight: '500',
  },
  date: {
    fontSize: 12,
    color: '#000000',
  },
  senderSoundContainer: {
    alignSelf: 'flex-end',
    backgroundColor: '#a7e3f2',
  },
  receiverSoundContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
  },
});

export default BubbleChat;
