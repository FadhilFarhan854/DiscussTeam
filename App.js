import { Dimensions} from 'react-native';
import Logins from './Screen/Login';
import Register from './Screen/Register';
import MainScreen from './Screen/MainScreen';
import ChatProtoype from './Screen/ChatPrototype';
import AddGroup from './Screen/AddGroup';
import VoiceInputTest from './Screen/VoiceInputTest';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Roomchat from './Screen/Roomchat';



//emulator -avd Pixel_6_Pro_API_34

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;
export default function App() {
  const Stack = createNativeStackNavigator();
  return (
    
  <NavigationContainer>
    <Stack.Navigator>
      
      <Stack.Screen name="Login" options={{ headerShown: false }} component={Logins} />
      <Stack.Screen name="VoiceTest" options={{ headerShown: false }} component={VoiceInputTest} />

      <Stack.Screen name="Roomchat" options={{ headerShown: false }} component={Roomchat} />
      <Stack.Screen name="AddGroup" options={{ headerShown: false }} component={AddGroup} />
      <Stack.Screen name="MainScreen" options={{ headerShown: false }} component={MainScreen} />
     
      
      <Stack.Screen name="ChatProto" options={{ headerShown: false }} component={ChatProtoype} />
      
     
      <Stack.Screen name="Register" options={{ headerShown: false }} component={Register} />
    </Stack.Navigator>
  </NavigationContainer>
   
  );
}


