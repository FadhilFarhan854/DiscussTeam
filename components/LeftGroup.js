import { useState, useEffect } from 'react';
import { View, Modal, TextInput, Button, StyleSheet, Text } from 'react-native';
import { CustomButton } from './CustomButton';
import { arrayRemove, getDocs, query, where, collection, addDoc, onSnapshot, orderBy, getDoc, doc, Timestamp,updateDoc, FieldValue, arrayUnion } from 'firebase/firestore';
import { db } from './config';
import { ref, getStorage, uploadBytes, getDownloadURL } from 'firebase/storage';

const LeftGroup = ({ visible, onClose, timestamp, close, groupId, userId, navigation }) => {

const [listMember, setListMember] = useState([]);
const [listGroup, setlistGroup] = useState([]);

useEffect(() => {
  getGroupInfo();
  getDeletedMemberInfo();
  
}, []);

const getGroupInfo = async () => {
  try {
    const collectionRef = collection(db, 'groupChat');
    const docRef = doc(collectionRef, groupId);
    const docSnapShot = await getDoc(docRef);

    if (docSnapShot.exists()) {
      const data = docSnapShot.data();
      if (data) {
        setListMember(data.member);
      } else {
        console.log("No data found in the document!");
      }
    } else {
      console.log("No such document!");
    }
  } catch (error) {
    console.error(error);
  }

}

const getDeletedMemberInfo = async () => {
  try {
    const collectionRef = collection(db, 'user');
    const docRef = doc(collectionRef, userId);
    const docSnapShot = await getDoc(docRef);

    if (docSnapShot.exists()) {
      const data = docSnapShot.data();
      if (data) {
        setlistGroup(data.listTeam);
      } else {
        console.log("No data found in the document!");
      }
    } else {
      console.log("No such document!");
    }
  } catch (error) {
    console.error(error);
  }


}

const updateArrayLocal = (arrays, value) => {
  
  const newArrays = [...arrays]; // create a new array

  for (let index = 0; index < newArrays.length; index++) {
    if (newArrays[index] === value) {
      newArrays.splice(index, 1);
      break; // Exit the loop after removing the first matching element
    }
  }

  console.log(newArrays)
  return newArrays;
};

const updateArrayDb = async ()=> {
  try {
    const groupChatRef = doc(db, 'groupChat', groupId );
    await updateDoc(groupChatRef, {
      member: arrayRemove(userId),
  });

    const userRef = doc(db, 'user', userId);
    await updateDoc(userRef, {
      listTeam: arrayRemove(groupId),
  });
    

  } catch (error) {
    console.log(error)
  }
  navigation.navigate("MainScreen", {idSession: userId});
}

const leftGroup = () => {
  // update listMember dan listGroup di database dengan value dari array local
  // tutup popup nya
  setlistGroup(updateArrayLocal(listGroup, groupId));
  setListMember(updateArrayLocal(listMember, userId));
  // console.log(listGroup);
  // console.log(listMember);


  close();
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
          
          <Text style={styles.confirmtext}>Ingin Meninggalkan Group ini ?</Text> 
          <Text style={styles.confirmtextDesc}>Jika anda keluar dari group maka semua pesan dan history chat akan hilang dari perangkat anda</Text> 
          <View style = {styles.buttonContainer}>
            <CustomButton title={"Cancel"} onPress={close} borderRadius={10} backgroundColor={'#a7e3f2'}  />
            <CustomButton title={"Keluar"} onPress={()=>{updateArrayDb()}} borderRadius={10} backgroundColor={'#a7e3f2'}  />
            
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
  },
  confirmtextDesc : {
    width: '100%',
   fontSize: 12,
   fontWeight: '600',
    textAlign: 'center'
  }
});

export default LeftGroup;
