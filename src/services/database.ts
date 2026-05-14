import AsyncStorage from "@react-native-async-storage/async-storage";

import { AMBIENTE } from "@/src/constants/config";

// 🔥 FIREBASE
import { db } from "@/src/services/firebase";

// 🔥 REALTIME DATABASE
import { get, ref, remove, update } from "firebase/database";

/* =========================
   SALVAR DADOS
========================= */
export const saveData = async (uid: string, data: any): Promise<boolean> => {
  try {
    // 🔥 REALTIME DATABASE
    if (AMBIENTE === "nuvem") {
      const userRef = ref(db, `usuarios/${uid}`);

      // 🔥 Faz merge dos dados
      await update(userRef, data);
    }

    // 🔥 LOCAL
    else {
      await AsyncStorage.setItem(`@user_${uid}`, JSON.stringify(data));
    }

    return true;
  } catch (error) {
    console.log("Erro ao salvar dados:", error);

    return false;
  }
};

/* =========================
   BUSCAR DADOS
========================= */
export const getData = async (uid: string): Promise<any | null> => {
  try {
    // 🔥 REALTIME DATABASE
    if (AMBIENTE === "nuvem") {
      const userRef = ref(db, `usuarios/${uid}`);

      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        return snapshot.val();
      }

      return null;
    }

    // 🔥 LOCAL
    else {
      const data = await AsyncStorage.getItem(`@user_${uid}`);

      if (data) {
        return JSON.parse(data);
      }

      return null;
    }
  } catch (error) {
    console.log("Erro ao buscar dados:", error);

    return null;
  }
};

/* =========================
   ATUALIZAR DADOS
========================= */
export const updateData = async (
  uid: string,
  newData: any,
): Promise<boolean> => {
  try {
    const currentData = (await getData(uid)) || {};

    const updatedData = {
      ...currentData,
      ...newData,
    };

    return await saveData(uid, updatedData);
  } catch (error) {
    console.log("Erro ao atualizar dados:", error);

    return false;
  }
};

/* =========================
   LIMPAR DADOS
========================= */
export const clearData = async (uid: string): Promise<boolean> => {
  try {
    // 🔥 REALTIME DATABASE
    if (AMBIENTE === "nuvem") {
      await remove(ref(db, `usuarios/${uid}`));
    }

    // 🔥 LOCAL
    else {
      await AsyncStorage.removeItem(`@user_${uid}`);
    }

    return true;
  } catch (error) {
    console.log("Erro ao limpar dados:", error);

    return false;
  }
};
