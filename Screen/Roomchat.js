import React, { useState, useEffect } from 'react';
import { StyleSheet, Text,TouchableOpacity, View, Dimensions, TextInput, StatusBar, SafeAreaView, Pressable, Button, FlatList, Image } from 'react-native';
import { CustomButton } from '../components/CustomButton';
import { db } from '../components/config';
import { getDocs, query, where, collection, addDoc, onSnapshot, orderBy, getDoc, doc, Timestamp,updateDoc, FieldValue, arrayUnion } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import BubbleChat from '../components/BubbleChat';
import AddMember from '../components/AddMember';
import DeleteChat from '../components/Delete';
import LeftGroup from '../components/LeftGroup';
import { Audio } from 'expo-av';
import { ref, getStorage, uploadBytes, getDownloadURL } from 'firebase/storage';


const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;

export default function Roomchat({ navigation, route }) {
  const { idGroup } = route.params;
  const { sessionId } = route.params;
  const {userName} = route.params;
  const [groupTitle, setGroupTitle] = useState('');
  const [groupImage, setGroupImage] = useState('');
  const [listMember, setListMember] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chat, setChat] = useState('');
  const [chatObject, setChatObject] = useState({});
  const [listChat, setListChat] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [DeleteChats, setdeleteChats] = useState(false);
  const [timeStamp, setTimeStamp] = useState();
  const [leftGroup, setLeftGroup] = useState(false);
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedUri, setRecordedUri] = useState(null);
  const [sound, setSound] = useState(null);
  const storage = getStorage();
  const [error, setError] = useState({});
  

  useEffect(() => {
    getGroupInfo();
    
  }, [idGroup, sessionId, chat, listChat]);

  const validateForm =()=> {
    let error = {};
    if(!chat) error.chat = "name is required";
    
    setError(error);
    return Object.keys(error).length === 0;

  }


  const getGroupInfo = async () => {
    try {
      const collectionRef = collection(db, 'groupChat');
      const docRef = doc(collectionRef, idGroup);
      const docSnapShot = await getDoc(docRef);

      if (docSnapShot.exists()) {
        setGroupImage(docSnapShot.data().groupImage);
        setGroupTitle(docSnapShot.data().groupName);
        setListChat(docSnapShot.data().chat);
        setListMember(docSnapShot.data().member)
      } else {
        console.log("No such document!");
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const sendmessage = async () => {
    if(validateForm()){
      try {
      const groupChatRef = doc(db, 'groupChat', idGroup);
      const chatObject = {
        type : 'text',
        message : chat,
        sender: userName,
        idSender: sessionId,
        timestamp: new Date().toISOString()
      };
      setChat("");
      await updateDoc(groupChatRef, {
        chat: arrayUnion(chatObject)
      });
  
      
      setChatObject({});
  
    } catch (error) {
      console.log(error)
    }
    }
    
  };

  function formatDateAndHour(dateTimeString, offset) {
    const dateObj = new Date(dateTimeString);

    // Get current hours and add the offset
    const localHours = dateObj.getHours() + offset;
    dateObj.setHours(localHours);

    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(dateObj.getDate()).padStart(2, '0');
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}`;
    const formattedTime = `${hours}:${minutes}`;

    return `${formattedDate} ${formattedTime}`;
}


  const openModal = () => {
    setModalVisible(!modalVisible)
  }
  const openDelete = () => {
    setdeleteChats(!DeleteChats)
  }
  const openLeftGroup = () => {
    setLeftGroup(!leftGroup)
  }

  //voice record
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
    sendSoundmessage(uri);
  }

  async function playRecording() {
    const { sound } = await Audio.Sound.createAsync({ uri: recordedUri });
    setSound(sound);

    await sound.playAsync();
  }

  const sendSoundmessage = async (uriSound) => {
    
    try {
      const VnRef = ref(storage, `VnSound/${userName}_${new Date().getTime()}.3gp`);
      const response  = await fetch(uriSound);
      const blob = await response.blob();

      const metadata = {
        contentType: blob.type,
      }
      await uploadBytes(VnRef, blob, metadata).then((snapshot) => {
        console.log("Sound Uploaded");
      });

      const UrlSound = await getDownloadURL(VnRef)
      
      const groupChatRef = doc(db, 'groupChat', idGroup);
      const chatObject = {
        type : 'sound',
        uri : UrlSound,
        sender: userName,
        idSender: sessionId,
        timestamp: new Date().toISOString()
      };
  
      await updateDoc(groupChatRef, {
        chat: arrayUnion(chatObject)
      });
  
      setChat("");
      setChatObject({});
  
    } catch (error) {
      console.log(error)
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1B262C', '#0F4C75']} 
        start={{ x: 0.5, y: 0.5 }}
        end={{ x: 1, y: 1 }}
        style={styles.bgGradient}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text>Loading...</Text>
          </View>
        ) : (
          <>
            <View style={styles.header}>
               
              <Pressable onPress={()=>openLeftGroup()}>
                <Text>Left Group</Text> 
              </Pressable>
              <LeftGroup visible={leftGroup} navigation={navigation} onClose={openLeftGroup} close={openLeftGroup} groupId={idGroup} userId={sessionId}></LeftGroup>
              
              <Text style={styles.groupName}>{groupTitle}</Text>
                        
              <Pressable onPress={()=>openModal()}>
                <Text>Add member</Text>
              </Pressable>    
              <AddMember visible={modalVisible} onClose={openModal} groupId={idGroup} />
                      
            </View>
            <View style={styles.chatContainer}>
              <FlatList 
                data={listChat}
                renderItem={({ item }) => (
                <BubbleChat  message={item.message} type={item.type} uriDb={item.uri} senderName={item.sender} date={formatDateAndHour(item.timestamp, 0)}  isSender={item.idSender === sessionId}  onLongPress={() => {
                  openDelete();
                  setTimeStamp(item.timestamp);
                }}
                />                
                )}                
              />             
              <DeleteChat visible={DeleteChats} timestamp={timeStamp} onClose={openDelete} close={openDelete} groupId={idGroup} ></DeleteChat>
              

            </View>
            <View style={styles.inputContainer}>
              <View style={styles.messageContainer}>
                <TextInput style={styles.textInput} value={chat} onChangeText={setChat} />
                <Pressable style={styles.image} onPress={() => sendmessage()}>
                  <Image style={styles.image} source={require('../assets/send.png')}  />
                </Pressable>             
              </View>
              <View>
                <TouchableOpacity style= {styles.micContainer} onPressIn={()=>{startRecording()}} onPressOut={()=>{stopRecording()}} activeOpacity={0.7} >
                  <Image style = {styles.micImage} source={require('../assets/microphone.png')} />
                </TouchableOpacity>
              </View>
            </View>
            
          </>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'flex-end',
    
  },
  bgGradient : {
    flex: 1,
    padding: 20,
    paddingHorizontal: 5,
    justifyContent: 'flex-end',
    alignItems: 'flex-end'
  },
  messageContainer: {
    backgroundColor: '#ffff',
    width: '88%',
    borderRadius: 15,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000',
    paddingHorizontal: 10,
    overflow: 'hidden',
    
    flexDirection: 'row'
  },
  textInput:{
  
    width: '90%',
    height: '100%',
    fontSize: 20,
  },
  image: {
    height : 20,
    width: 20
  },
  chatContainer : {
  width: '100%',
  paddingTop: 80,
  
  },
  header : {
    width: windowWidth,
    height: 50,
    backgroundColor: '#a7e3f2',
    position: 'absolute',
    top: 0,
    flexDirection: 'row',
    paddingLeft: 10,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 15
  },
  groupName: {
    fontSize: 20,
    fontWeight: '500',
  },
  inputContainer :{
    flexDirection: 'row',
    width: '100%',
    gap: 2
    
  },
  micContainer : {
    padding : 0,
    borderRadius : 150,
    overflow: 'hidden',
    backgroundColor: '#a7e3f2',
    height: 45,
    width: 45,
    
    justifyContent:'center',
    alignItems: 'center'
  },
  micImage : {
    width: 27,
    height: 27
  }
  
  

  

});
