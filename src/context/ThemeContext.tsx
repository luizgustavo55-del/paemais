import { theme as staticTheme } from "@/src/constants/theme"; // Importa o estático como base
import { auth, firestore } from "@/src/services/firebase";
import { doc, getDoc } from "firebase/firestore";
import React, { createContext, useContext, useEffect, useState } from "react";

const fontSizes = {
  pequeno: { text: 14, subtitle: 20, title: 26 },
  padrao: { ...staticTheme.texts },
  grande: { text: 22, subtitle: 28, title: 36 },
};

export type TamanhoOpcao = "pequeno" | "padrao" | "grande";

interface ThemeContextData {
  theme: {
    colors: typeof staticTheme.colors;
    texts: typeof staticTheme.texts;
  };
  mudarTamanhoFonte: (tamanho: TamanhoOpcao) => void;
  tamanhoAtual: TamanhoOpcao;
}

const ThemeContext = createContext<ThemeContextData>({} as ThemeContextData);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [tamanhoAtual, setTamanhoAtual] = useState<TamanhoOpcao>("padrao");

  useEffect(() => {
    const carregarPreferencia = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const docRef = doc(firestore, "usuarios", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && docSnap.data().configuracoes?.tamanhoFonte) {
          setTamanhoAtual(docSnap.data().configuracoes.tamanhoFonte);
        }
      } catch (error) {
        console.log("Erro ao carregar tamanho da fonte:", error);
      }
    };
    carregarPreferencia();
  }, []);

  const mudarTamanhoFonte = (tamanho: TamanhoOpcao) => {
    setTamanhoAtual(tamanho);
  };

  const dynamicTheme = {
    colors: staticTheme.colors,
    texts: fontSizes[tamanhoAtual],
  };

  return (
    <ThemeContext.Provider
      value={{ theme: dynamicTheme, mudarTamanhoFonte, tamanhoAtual }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
