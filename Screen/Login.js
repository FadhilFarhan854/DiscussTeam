import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions, TextInput, StatusBar, SafeAreaView, Pressable, Appearance, } from 'react-native';
import { CustomButton } from '../components/CustomButton';
import { db } from '../components/config';
import { getDocs, query, where, collection, documentId } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient'

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;
const whiteColor = 'rgba(255, 255, 255, 1)';

export default function Logins({navigation}) {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState({});
  const [id, setId] = useState("");
  const [colorScheme, setColorScheme] = useState('light');
 

  useEffect(() => {
    if (id !== "") {
      console.log(id);
      navigation.navigate("MainScreen", { idSession: id}); 
      setId("");

    }
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
  }, [id]);
  
  const login = async () => {
    // const usersRef = collection(db, "user");
    // const q = query(usersRef, where("username", "==", username), where("password", "==", password));
    // const querySnapshot = await getDocs(q);
    const querySnapshot = await getDocs(query(collection(db, "user"), where("username", "==", username), where("password", "==", password)));
  
    if (querySnapshot.empty) {
      console.log("Invalid username or password");
      setError({ login: "Invalid username or password" });
    } else {
      getDocumentId("user");     
    }
  }
  
  const getDocumentId = async (document) => {
    const querySnapshot = await getDocs(query(collection(db, document), where("username", "==", username), where("password", "==", password)));
  
    if (!querySnapshot.empty) {
      setId(querySnapshot.docs[0].id);
    
      
    } else {
      console.log("data kosong");
    }
  }
 
 

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient 
        colors={['#1B262C', '#0F4C75']} 
        start={{x: 0.5, y: 0.5}} 
        end={{x: 1, y: 1}} // Modify the end point to adjust the angle
        style={styles.bgGradient}
      >
      <Text style={{ fontWeight: 'bold', fontSize: 60, color: "white" }}>Login</Text>
      <StatusBar style="auto" />
      <View style={styles.loginCard}>

      <LinearGradient 
        colors={['#66758c', '#66758c']} 
        start={{x: 0.5, y: 0.5}} 
        end={{x: 1, y: 1}}  
        style={styles.innerCard}>

          <TextInput style={styles.inputs} value={username} onChangeText={setUsername} placeholder='Username' />
      
          <TextInput secureTextEntry style={styles.inputs} value={password} onChangeText={setPassword} placeholder='Password' />
          {error.login && <Text style={styles.errorText}>{error.login}</Text>}
          <CustomButton
            title={'Login'}
            textColor={"white"}
            backgroundColor={"black"}
            borderRadius={10}
            width={windowWidth * 0.8}
            onPress={() => { login()}}
          />
          <Text >don't have an account? <Pressable onPress={() => { navigation.navigate('Register') }} ><Text style={{ textDecorationLine: 'underline' }}>Register now</Text></Pressable></Text>
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
  },
  loginCard: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    height: windowHeight * 0.65,
    width: windowWidth,
  
  },
  innerCard: {
    backgroundColor : 'white',
    borderTopRightRadius: 25,
    borderTopLeftRadius: 25,
    height: windowHeight * 0.65,
    width: windowWidth * 0.9,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 30
  },
  inputs: {
    marginBottom: 10,
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
  bgGradient : {
    flex : 1,
    paddingHorizontal: 5,
    justifyContent: 'flex-end',
    alignItems: 'center',
    
  },
  errorText: {
    color :"#1B262C",
    marginBottom : "12"
  },
});
