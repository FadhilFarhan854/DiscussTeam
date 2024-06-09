import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions, TextInput, StatusBar, SafeAreaView, Pressable, Button, FlatList, Image, Appearance} from 'react-native';
import { CustomButton } from '../components/CustomButton';
import { db } from '../components/config';
import { getDocs, query, where, collection, addDoc, onSnapshot, orderBy, doc, getDoc, DocumentSnapshot } from 'firebase/firestore';
import {LinearGradient} from 'expo-linear-gradient'
import AsyncStorage from '@react-native-async-storage/async-storage';


const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;


export default function MainScreen({navigation, route}) {
  const {idSession} = route.params;
  const [sessionId, setSessionId] = useState("");
  const [colorScheme, setColorScheme] = useState('light');
  const [image, setImage] = useState(" ");
  const [userName, setUserName] = useState("");
  const [listTeam, setListTeam] = useState([]);
  const [showedGroup, setShowedGroup] = useState([]);
  const{newGroupid} = route.params;


 useEffect(() => {

  getDataSession();
  getDataGroup();
  
  Appearance.setColorScheme('dark');
  const subscription = Appearance.addChangeListener(({ colorScheme }) => {
    setColorScheme(colorScheme);
  });
 
  setColorScheme(Appearance.getColorScheme());
  
  return () => {
    subscription.remove();
  };
 }, [listTeam]);

 const getDataGroup = async () => {
  const collectionRef = collection(db, 'groupChat');
  const showedGroupArr = [];

  //diganti pake local storage -> key = id, value = showedGroupAr
  //buat for loop, if !idExist 
  //masukin ke showed group

  for (let index = 0; index < listTeam.length; index++) {
    const element = listTeam[index];
    const docRef = doc(collectionRef, element);

    const docSnapShot = await getDoc(docRef);

    if (docSnapShot.exists()) {
      showedGroupArr.push({
        groupTitle: docSnapShot.data().groupName,
        groupId: docRef.id,
        groupImage: docSnapShot.data().groupImage,
        groupDesc: docSnapShot.data().groupDesc,
        creator: docSnapShot.data().creatorUsername,
      });
    } else {
      console.log("No such document!");
    }
  }

  // Setelah mendapatkan data grup terbaru, perbarui state showedGroup
  setShowedGroup(showedGroupArr);
};
const getDataSession = async () => {
  const collectionRef = collection(db, 'user');
  const docRef = doc(collectionRef, idSession)

  getDoc(docRef).then((docSnapShot)=>{
    if(docSnapShot.exists()){
      setImage(docSnapShot.data().profilePicture);
      setUserName(docSnapShot.data().username);
      setSessionId(docRef.id)
      setListTeam(docSnapShot.data().listTeam)
      
    }else{
      console.log("No such document!")
    }
  })
}


  return (
    <View style={styles.container} >
      <LinearGradient 
      colors={['#1B262C', '#0F4C75']} 
      start={{x: 0.5, y: 0.5}} 
      end={{x: 1, y: 1}}
      style={styles.bgGradient}
    >
      <View style={styles.content}>
        <View style= {styles.profilePicture}>
        <Image style={styles.image} source={{ uri: image }} />
        </View>

        <View>
          <Text style = {styles.welcomeText}>Welcome, {userName} !</Text>
        </View>

        <FlatList
        style ={{marginBottom: 20}}
        data={showedGroup}
        renderItem={({item})=>{
          return(
        <Pressable onPress={()=>{navigation.navigate("Roomchat", {idGroup : item.groupId, sessionId: sessionId, userName: userName})}} style={styles.outerCard}>
          <View style={styles.card}>
            <View style={styles.leftSection}>
              <Text numberOfLines={1} style={styles.text}>{item.groupTitle}</Text>
              <Text numberOfLines={1} style={styles.creatorText}>Created by : {item.creator}</Text>  
            </View>
            <View>
              <Text style={styles.dateText}>08/05/2024</Text>
            </View>
          </View>   
          <View style={styles.imagesContainer}>
              <View style={styles.outerimage}>
                <Image style={styles.image} source={{ uri: item.groupImage }} />
              </View>          
          </View>
        
        </Pressable>
          )
        }}

        />

        
        
        <CustomButton title={"add disscussion"} backgroundColor={'#234054'} textColor={'#fff'} borderRadius={10} width={'100%'}onPress={() => { navigation.navigate("AddGroup", { idSession: sessionId, username: userName }) }}
 />
        
      </View>

    </LinearGradient>
      
     
    </View>
  );

  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'flex-end',
   
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  bgGradient : {
    flex: 1,
    paddingBottom: 10
  },
  background: {
    flex: 1,
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 300,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    
    paddingTop : StatusBar.currentHeight,
    paddingHorizontal: 10
  },
  text: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    width: '100%',
    overflow: 'hidden',
   
  },
  creatorText: {
    marginTop: 3,
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
    width: '100%',
    overflow: 'hidden',
  
  },
  dateText : {
    marginTop: 3,
    color: 'white',
    fontSize: 15,
    
    width: '100%',
    overflow: 'hidden',
  },
  card :{
    width: '65%',
    justifyContent:'space-between'
  },
  outerCard : {
    backgroundColor: '#234054',
    width: '100%',
    height: 150,
    borderColor: '#4e6473',
    borderWidth: 1,
    borderRadius: 10,
    padding: 5,
    flexDirection: 'row',
    marginBottom: 20
    
  },
  imagesContainer : {
    width: '35%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white',
    
  },
  leftSection : {
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  profilePicture : {
    backgroundColor: '#0F4C75',
    height: 120,
    width: 120,
    borderRadius: 150,
    overflow: 'hidden',
    marginBottom: 20
  },
  welcomeText : {
    fontSize : 24,
    marginBottom : 24,
    fontWeight : 'bold',
    color:'white'
    
  },
  outerimage : {
    backgroundColor: 'white',
    width: 80,
    height: 80,
    borderRadius: 150,
    overflow: 'hidden'
  },
  innerImage: {
   
  }
});
