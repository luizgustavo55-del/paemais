import AsyncStorage from '@react-native-async-storage/async-storage';
import { AMBIENTE } from '@/src/constants/config';
import { getData, saveData, clearData } from '@/src/services/database';
import { auth } from '@/src/services/firebase'; 
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  deleteUser as deleteFirebaseUser 
} from 'firebase/auth';

let userLocal: any = null;

export const getCurrentUser = async () => {
  if (AMBIENTE === 'nuvem') {
    const user = auth.currentUser;
    return user ? { uid: user.uid, email: user.email } : null;
  } else {
    const userString = await AsyncStorage.getItem('@user_logado');
    return userString ? JSON.parse(userString) : null;
  }
};

export const signUp = async (email: string, senha: string, tipo: string = "gestante") => {
  if (AMBIENTE === 'nuvem') {
    const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
    const user = userCredential.user;
    return { uid: user.uid, email: user.email, tipo };
  } else {
    userLocal = { uid: "123-local", email, tipo };
    await AsyncStorage.setItem('@user_logado', JSON.stringify(userLocal));
    return userLocal;
  }
};

export const signIn = async (email: string, senha: string) => {
  if (AMBIENTE === 'nuvem') {
    const userCredential = await signInWithEmailAndPassword(auth, email, senha);
    const user = userCredential.user;
    const userData = await getData(user.uid);
    return { uid: user.uid, email: user.email, tipo: userData?.user?.tipo };
  } else {
    const userString = await AsyncStorage.getItem('@user_logado');
    const userLocal = userString ? JSON.parse(userString) : { uid: "123-local", email, tipo: "gestante" };
    await AsyncStorage.setItem('@user_logado', JSON.stringify(userLocal));
    return userLocal;
  }
};

export const logout = async () => {
  if (AMBIENTE === 'nuvem') {
    await signOut(auth);
  } else {
    await AsyncStorage.removeItem('@user_logado');
  }
};

export const deleteUserAccount = async () => {
  if (AMBIENTE === 'nuvem') {
    const user = auth.currentUser;
    if (user) {
      await deleteFirebaseUser(user);
    }
  } else {
    await AsyncStorage.removeItem('@user_logado');
  }
};
