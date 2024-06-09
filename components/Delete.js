import { useState } from 'react';
import { View, Modal, TextInput, Button, StyleSheet, Text } from 'react-native';
import { CustomButton } from './CustomButton';
import { arrayRemove, getDoc, doc, Timestamp,updateDoc, FieldValue, arrayUnion } from 'firebase/firestore';
import { db } from './config';

const DeleteChat = ({ visible, onClose, timestamp, close, groupId }) => {
const [memberId, setMemberId] = useState("");
const [name, setName] = useState('');
const [chatObject, setChatObject] = useState({});



const Delete = async() => {
    
    try {
        const docRef = doc(db, 'groupChat', groupId );
        const groupChatDoc = await getDoc(docRef);
        if (groupChatDoc.exists()) {
            const chatArray = groupChatDoc.data().chat;
            const index = chatArray.findIndex((chat) => chat.timestamp === timestamp);
            const object = chatArray.find((chat) => chat.timestamp === timestamp)
            if (index !== -1) {
            
            await updateDoc(docRef, {
                chat: arrayRemove(object),
            });
            console.log('deleted')
            visible = false;
            } else {
              console.log('Chat object not found in the array');
              return null;
            }
          } else {
            console.log('Group chat not found');
            return null;
          }

        
        console.log('Chat object removed from the array');
        close();
    } catch (error) {
        console.log(error)
    }
}
 

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.formContainer}>
          <Text style={styles.confirmtext}>Hapus Pesan Ini ?</Text> 
          {/* Add more TextInput fields for other form inputs */}
          <View style = {styles.buttonContainer}>
            <CustomButton title={"Cancel"} onPress={close} borderRadius={10} backgroundColor={'#a7e3f2'}  />
            <CustomButton title={"Hapus"} onPress={()=>{Delete()}} borderRadius={10} backgroundColor={'#a7e3f2'}  />
            
          </View>
          
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0)',
  },
  formContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    borderWidth: 1
  },
  input: {
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  buttonContainer: {
    width:'100%',
    flexDirection: 'row',
    paddingTop: 20,
    gap: 4,
    justifyContent: 'space-evenly'
  },
  confirmtext : {
    width: '100%',
   fontSize: 16,
   fontWeight: '600',
    textAlign: 'center'
  }
});

export default DeleteChat;
