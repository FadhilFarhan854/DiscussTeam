import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions, TextInput, StatusBar, SafeAreaView, Pressable, Image, useColorScheme, Appearance} from 'react-native';
import { CustomButton } from '../components/CustomButton';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../components/config';
import { LinearGradient } from 'expo-linear-gradient'
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";


const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

export default function Register({navigation}) {
  const storage = getStorage();
  useEffect(() => {
    Appearance.setColorScheme('dark');
  const subscription = Appearance.addChangeListener(({ colorScheme }) => {
    setColorScheme(colorScheme);
  });
  // Get the initial color scheme of the device
  setColorScheme(Appearance.getColorScheme());
  // Clean up the subscription when the component unmounts
  return () => {
    subscription.remove();
  };
  }, []);
 
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [error, setError] = useState({});

  const [listTeam, setlistTeam] = useState([]);
  const [colorScheme, setColorScheme] = useState('light');

  const validateForm =()=> {
    let error = {};
    if(!username) error.username = "name is required";
    if(!email) error.email = "email is required";
    if(!password) error.password = "password is required";
    if (!selectedImage) error.image = "no image selected";
     
    setError(error);
    return Object.keys(error).length === 0;

  }
  const register = async () => {

    if(validateForm()){
      try {
      // if (!selectedImage) {
      //   setError({image: "no image selected"})
      //   console.error("No image selected");
      //   return;
      // }
  
      const imageRef = ref(storage, `profilePictures/${username}_${new Date().getTime()}.jpg`);
      const response = await fetch(selectedImage);
      const blob = await response.blob();
  
      // Set the MIME menjadi blob
      const metadata = {
        contentType: blob.type,
      };
  
      await uploadBytes(imageRef, blob, metadata).then((snapshot) => {
        console.log("Uploaded a blob or file!");
      });
  
      const imageUrl = await getDownloadURL(imageRef);
      

      // Add user details to Firestore
      await addDoc(collection(db, "user"), {
        username: username,
        password: password,
        email: email,
        profilePicture: imageUrl,
        listTeam: [],
      });
  
      // Reset form fields
      setPassword("");
      setUsername("");
      setEmail("");
      setSelectedImage(null);
  
      // Navigate to login or any other screen
      navigation.navigate("Login");
    } catch (error) {
      console.error("Error registering user:", error);
    }
    }
    
  };
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

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient 
        colors={['#1B262C', '#0F4C75']} 
        start={{x: 0.5, y: 0.5}} 
        end={{x: 1, y: 1}} // Modify the end point to adjust the angle
        style={styles.bgGradient}
      >
        <Text style={{ fontWeight: 'bold', fontSize: 60, color: "white", marginBottom: 100 }}>Sign up</Text>
                
        <StatusBar style="auto" />
        <View style={styles.loginCard}>
          <View style={styles.imageContainer}>
            <View style={styles.images}>
              {selectedImage ? (
                <Image style={styles.image} source={{ uri: selectedImage }} />
              ) : (
                <Text></Text>
              )}
            </View>
            <Pressable style={isKeyboardVisible ? styles.cameraIcon : styles.cameraIcon2} onPress={openCamera}>
              <Image style={styles.cameraImage} source={require('../assets/camera.png')} />
            </Pressable>
            <Pressable onPress={openGallery}>
              <Text style={styles.galleryText}>Add picture from gallery</Text>
            </Pressable>
            {error.image ? (<Text style={styles.errorText}>{error.image}</Text>) : null}
          </View>

          <LinearGradient 
          colors={['#66758c', '#66758c']} 
          start={{x:0, y: 0}} 
          end={{x: 1, y: 1}} // Modify the end point to adjust the angle
          style={styles.innerCard}
          >
          
            <TextInput style={styles.inputs} value={username} onChangeText={setUsername} placeholder='Username' />
            {error.username ? (<Text style={styles.errorText}>{error.username}</Text>) : null}
            <TextInput style={styles.inputs} value={email} onChangeText={setEmail} placeholder='Email' />
            {error.email ? (<Text style={styles.errorText}>{error.email}</Text>) : null}
            <TextInput secureTextEntry style={styles.inputs} value={password} onChangeText={setPassword} placeholder='Password' />
            {error.password ? (<Text style={styles.errorText}>{error.password}</Text>) : null}
            <CustomButton
              title={'Sign up'}
              textColor={"white"}
              backgroundColor={"black"}
              borderRadius={10}
              width={windowWidth * 0.8}
              onPress={() => { register()}}
            />
            <Text>have an account? <Pressable onPress={() => {navigation.navigate('Login')}} ><Text style={{ textDecorationLine: 'underline' }}>Login</Text></Pressable></Text>
          
          </LinearGradient>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'white', // Set background color to white for light mode
  },
  loginCard: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    height: windowHeight * 0.65,
    width: windowWidth,
  },
  innerCard: {
    borderTopRightRadius: 25,
    borderTopLeftRadius: 25,
    height: windowHeight * 0.65,
    width: windowWidth * 0.9,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 30,
    paddingTop: 100,
    backgroundColor: 'white', // Set background color to white for light mode
  },
  inputs: {
    marginBottom: 5,
    width: windowWidth * 0.8,
    borderWidth: 2,
    borderRadius: 10,
    borderColor: "black",
    height: 50,
    paddingLeft: 20,
    fontSize: 18,
    paddingRight: 5,
    color: 'black'
  },
  bgGradient: {
    flex: 1,
    paddingHorizontal: 5,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  imageContainer: {
    width: '100%',
    height: '35%',
    position: 'absolute',
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent', 
    top: -80
  },
  images: {
    backgroundColor: '#0F4C75',
    height: 120,
    width: 120,
    borderRadius: 150,
    overflow: 'hidden',
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
    bottom: 15,
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
    bottom: 45,
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
  galleryText: {
    marginTop: 1,
    color: 'black',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  errorText: {
    color :"#1B262C",
    marginBottom : 5,
    marginTop: -5
  },
});
