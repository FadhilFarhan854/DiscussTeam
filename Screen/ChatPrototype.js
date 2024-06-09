import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions, TextInput, StatusBar, SafeAreaView, Pressable, Button, FlatList} from 'react-native';
import { CustomButton } from '../components/CustomButton';
import { db } from '../components/config';
import { getDocs, query, where, collection, addDoc, onSnapshot, orderBy } from 'firebase/firestore';

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;

export default function ChatProtoype({navigation, route}) {
  const {idSession} = route.params;
  const [message, setMessage] = useState("");
  const [listMessage, setListMessage] = useState([]);
  const sender = idSession;
  const receiver = "Jgs0Bziz9OZAFy1jhgMy"
  // const [receiver, setreceiver] = useState("");
  

  useEffect(() => {
    let initialReceiver = "";
    
  
    // setreceiver(initialReceiver); // Atur nilai receiver sebelum query pertama
  
    const unsubscribe = onSnapshot(
      query(
        collection(db, "chatTest"),
        where("sender", "in", [sender, receiver]),
        where("receiver", "in", [sender, receiver])
      ),
      (snapshot) => {
        const messages = snapshot.docs.map((doc) => doc.data());
        messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        setListMessage(messages);
      }
    );
  
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [sender]); 

  // const getMessage = async () => {
  //   try {
  //     const querySnapshot = await getDocs(query(collection(db, "chatTest"), where("sender", "==", sender), where("receiver", "==", receiver)));
  //     const messages = querySnapshot.docs.map(doc => doc.data());
  //     setListMessage(messages);
  //   } catch (error) {
  //     console.error("Error fetching messages:", error);
  //   }
  // }
  
  const sendMessage = async () => {
    try {
      await addDoc(collection(db, "chatTest"), {
        message: message,
        sender: sender,
        receiver: receiver,
        timestamp: new Date().toISOString()
      });
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }
  
  

  return (
    <SafeAreaView style={styles.container}>

      <FlatList 
        data={listMessage}
        renderItem={({ item }) => (
          <View style={styles.postContainer}>
            <Text>{item.message}</Text>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
      <View style = {styles.inputContainer}>
        <TextInput style = {styles.inputField} placeholder='Message' value= {message} onChangeText={setMessage} />
        <Button title={"send message"} onPress={()=> {sendMessage()}}
      />
      </View>
     
    </SafeAreaView>
  );

  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'flex-end',
    padding: 20,
  },
  loginCard: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    height: windowHeight * 0.65,
    width: windowWidth,
    borderWidth: 1,
  },
  innerCard: {
    backgroundColor: "white",
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
    paddingRight: 5
  },
  inputContainer: {
    width: '100%',
    padding: 16,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "black",
    
  },
  inputField: {
    flexDirection:"column",
    height: 40,
    
    padding: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "black",

  },

  postContiner: {
    
    flex: 1,
    borderWidth: 1,
    borderColor :"black",
    padding: 3,
    marginBottom : 20,
    borderRadius: 10
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },

});
