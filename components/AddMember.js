import { useState } from 'react';
import { View, Modal, TextInput, Button, StyleSheet, Text } from 'react-native';
import { CustomButton } from './CustomButton';
import { getDocs, query, where, collection, addDoc, onSnapshot, orderBy, getDoc, doc, Timestamp,updateDoc, FieldValue, arrayUnion } from 'firebase/firestore';
import { db } from './config';

const AddMember = ({ visible, onClose, groupId }) => {
const [memberId, setMemberId] = useState("");
const [name, setName] = useState('');
const [error, setError] = useState({});

const validateForm =()=> {
  let error = {};
  if(!name) error.name = "name is required";
  
  setError(error);
  return Object.keys(error).length === 0;

}

const handleSubmit = async() => {
  if(validateForm()){
     try {
        const docRef = doc(db, 'groupChat', groupId );
        
        const querySnapshot = await getDocs(query(collection(db, 'user'), where("username", "==", name)));      
        if (!querySnapshot.empty) {
            setMemberId(querySnapshot.docs[0].id);  
          } else {
            console.log("username tidak ditemukan");
          }
        await updateDoc(docRef, {
        member: arrayUnion(memberId)
        });
        const docUserRef = doc(db, 'user', memberId);
        await updateDoc(docUserRef, {
            listTeam: arrayUnion(groupId)
            });

        setName("");
    } catch (error) {
        console.log(error)
    }
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
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={name}
            onChangeText={setName}
            
          />
           {error.name && <Text style={styles.errorText}>{error.name}</Text>}
          {/* Add more TextInput fields for other form inputs */}
          <CustomButton title={"Add Member"} onPress={()=>{handleSubmit()}} borderRadius={10} backgroundColor={'#a7e3f2'}  />
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
  },
  input: {
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  errorText: {
    color :"#1B262C",
    marginBottom : "12"
  },
});

export default AddMember;
