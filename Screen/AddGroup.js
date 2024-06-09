import React, { useState, useEffect } from 'react';
import { StyleSheet, Keyboard, Text, View, Dimensions, TextInput, StatusBar, Image, SafeAreaView, Pressable, Button, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { CustomButton } from '../components/CustomButton';
import { db } from '../components/config';
import { getDocs, query, where, collection, addDoc, updateDoc, orderBy, getDoc, doc, arrayUnion } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient'
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';


const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;

export default function AddGroup({navigation, route}) {
  const storage = getStorage();
  //Color palete : https://colorhunt.co/palette/1b262c0f4c753282b8bbe1fa

  //state & hook initiation
  const [groupName, setGroupName] = useState("");
  const [groupDesc, setgroupDesc] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [listTeam, setListTeam] = useState([]);
  const [newGroupId, setnewGroupId] = useState("");
  const [error, setError] = useState({});

  //session get data
  const {idSession} = route.params;
  const {username} = route.params
  
  
  
  useEffect(() => {
    console.log(idSession)
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [selectedImage, newGroupId]);

  const validateForm =()=> {
    let error = {};
    if(!groupName) error.groupName = "group name is required";
    if(!groupDesc) error.groupDesc = "group desc is required";
    if (!selectedImage) error.image = "no image selected";
     
    setError(error);
    return Object.keys(error).length === 0;

  }
  //camera and picture setting
  const openCamera = async () => {
    let permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      alert('Permission to access camera is required!');
      return;
    }
    
    console.log('Launching Camera...');
    let result = await ImagePicker.launchCameraAsync();
  
    if (!result.canceled) {
      const imageUriString = result.assets[0].uri.toString();
      setSelectedImage(imageUriString);
    }
   
  };
  
  const openGallery = async () => {
    let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert('Permission to access media library is required!');
      return;
    }
  
    console.log('Launching image library...');
    let result = await ImagePicker.launchImageLibraryAsync();
  
    if (!result.canceled) {
      const imageUriString = result.assets[0].uri.toString();
      setSelectedImage(imageUriString);
     
    }
  };
  //insert newGroup id to listteam field in user
  // const insertIdGrouptoUser = async (newGroupId) => {
  //   const collectionRef = collection(db, 'user');
  //   const docRef = doc(collectionRef, idSession);
  
  //   try {
  //     const docSnapShot = await getDoc(docRef);
  //     if (docSnapShot.exists()) {
  //       const userData = docSnapShot.data();
  //       const updatedListTeam = [...userData.listTeam, newGroupId];
  //       await updateDoc(docRef, { listTeam: updatedListTeam });
  //       console.log("Group ID inserted successfully.");
  //     } else {
  //       console.log("No such document!");
  //     }
  //   } catch (error) {
  //     console.error("Error inserting group ID:", error);
  //   }
  // };

  const addListTeam = async(newGroupId) => {
    try {
      const userRef = doc(db, 'user', idSession)
      await updateDoc(userRef, {
        listTeam: arrayUnion(newGroupId)
      })
    }catch(error){
      console.log(error)
    }
  }

  //create group
  const createGroup = async () => {
    if(validateForm()){
      try {
      if (!selectedImage) {
        console.error("No image selected");
        return;
      }
  
      const imageRef = ref(storage, `GroupProfilePictures/${groupName}_${new Date().getTime()}.jpg`);
      const response = await fetch(selectedImage);
      const blob = await response.blob();
  
      const metadata = {
        contentType: blob.type,
      };
  
      await uploadBytes(imageRef, blob, metadata).then((snapshot) => {
        console.log("Uploaded a blob or file!");
      });
  
      const imageUrl = await getDownloadURL(imageRef);
  
      const docRef = await addDoc(collection(db, "groupChat"), {
       groupName : groupName,
       groupDesc : groupDesc,
       groupImage : imageUrl,
       member : [idSession],
       chat : [],
       creatorId : idSession,
       creatorUsername : username,
      });

      addListTeam(docRef.id)
    
      //console.log(docRef.id)
      setnewGroupId(docRef.id)
      setGroupName("");
      setgroupDesc("");
      setSelectedImage(null);
      
      // Navigate to main screen dan passing data newGroupId
      navigation.navigate("MainScreen", {idSession : idSession});
    } catch (error) {
      console.error("Error registering user:", error);
    }
    }
       
  };

    
  return (
   
    <View style={styles.container} >
       
      <LinearGradient 
        colors={['#1B262C', '#0F4C75']} 
        start={{x: 0.5, y: 0.5}} 
        end={{x: 1, y: 1}} // Modify the end point to adjust the angle
        style={styles.bgGradient}
      >
        
        <View style={styles.content}>
          <View style={styles.formContainer}>
            {/* images */}
            <View style={styles.imageContainer}>
              <View style={styles.images}>
                {selectedImage? (
                  <Image style={styles.image} source={{ uri: selectedImage }} />
                ) : (
                  <Text></Text>
                )}
              </View>
              <Pressable style={isKeyboardVisible ?(styles.cameraIcon) : (styles.cameraIcon2)} onPress={openCamera}>
                <Image style = {styles.cameraImage}source={require('../assets/camera.png')} />
              </Pressable>
              <Pressable onPress={openGallery}>
                <Text style={  styles.galleryText}>Add picture from gallery</Text>
              </Pressable>
              {error.image ? (<Text style={styles.errorText}>{error.image}</Text>) : null}
            </View>

            {/* form */}
            <TextInput style={styles.inputStyle} placeholder='Group Name'  value={groupName} onChangeText={setGroupName}/>
            {error.groupName ? (<Text style={styles.errorText}>{error.groupName}</Text>) : null}
            <TextInput style={styles.inputStyle} placeholder='Description' value={groupDesc} onChangeText={setgroupDesc}/>
            {error.groupDesc ? (<Text style={styles.errorText}>{error.groupDesc}</Text>) : null}
            <View style={styles.buttonContainer}>
              <CustomButton title={"Cancel"} textColor={"#5a84a1"} backgroundColor={"#294354"} width={'40%'} height={50} borderRadius={10} onPress={()=>{ navigation.navigate("MainScreen", {idSession : idSession});}} />
              <CustomButton title={"Create"} textColor={"#294354"} backgroundColor={"#5a84a1"} width={'40%'} height={50} borderRadius={10} onPress={()=>{createGroup()}} />
            </View>
          </View>
        </View>
        
      </LinearGradient>
    </View>
  );
}


  


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  
  },
  bgGradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  formContainer: {
    width: '100%',
    height: '75%',
    borderWidth: 0,
    borderColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingTop: 10,
    flexDirection: 'column',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: 'black',
    
  },
  inputStyle: {
    width: '100%',
    height: 40,
    borderWidth: 2,
    borderRadius: 10,
    borderColor: '#fff',
    paddingLeft: 10,
    paddingVertical: 3,
    fontSize: 14,
    color: '#fff',
    fontWeight: '400',
  },
  imageContainer: {
    width: '100%',
    height: '35%',
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent', // Remove background color or set to 'transparent'
  },
  images: {
    backgroundColor: 'white',
    height: 120,
    width: 120,
    borderRadius: 150,
    overflow: 'hidden',
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 5,
  },
  galleryText: {
    marginTop: 10,
    color: 'white',
    fontSize: 18,
    textDecorationLine: 'underline',
  },
  cameraIcon: {
    position: 'absolute',
    zIndex: 10,
    width: 45,
    height: 45,
    backgroundColor: '#5a84a1', // Make sure this color is consistent
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 150,
    bottom: 25,
    right: 120,
  },
  cameraIcon2: {
    position: 'absolute',
    zIndex: 10,
    width: 45,
    height: 45,
    backgroundColor: '#5a84a1', // Make sure this color is consistent
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 150,
    bottom: 58,
    right: 120,
  },
  cameraImage: {
    width: 25,
    height: 25,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  errorText: {
    color :"#1B262C",
    marginBottom : 5,
    marginTop: -5,
    marginLeft: 3
  },
});

