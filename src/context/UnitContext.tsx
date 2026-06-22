import { auth, firestore } from "@/src/services/firebase";
import { doc, getDoc } from "firebase/firestore";
import React, { createContext, useContext, useEffect, useState } from "react";

export type SistemaUnidade = "metrico" | "imperial";

interface UnitContextData {
  unidadeAtual: SistemaUnidade;
  mudarUnidade: (unidade: SistemaUnidade) => void;
}

const UnitContext = createContext<UnitContextData>({} as UnitContextData);

export function UnitProvider({ children }: { children: React.ReactNode }) {
  const [unidadeAtual, setUnidadeAtual] = useState<SistemaUnidade>("metrico");

  useEffect(() => {
    const carregarPreferencia = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const docRef = doc(firestore, "usuarios", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && docSnap.data().configuracoes?.sistemaUnidade) {
          setUnidadeAtual(docSnap.data().configuracoes.sistemaUnidade);
        }
      } catch (error) {
        console.log("Erro ao carregar sistema de unidades:", error);
      }
    };
    carregarPreferencia();
  }, []);

  const mudarUnidade = (unidade: SistemaUnidade) => {
    setUnidadeAtual(unidade);
  };

  return (
    <UnitContext.Provider value={{ unidadeAtual, mudarUnidade }}>
      {children}
    </UnitContext.Provider>
  );
}

export function useUnit() {
  return useContext(UnitContext);
}
