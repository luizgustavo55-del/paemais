import React from "react";
import BemEstarTemplate from "@/src/components/bemEstarTemplate";

export default function Amigdalite() {
  return (
    <BemEstarTemplate
      badge="Garganta"
      titulo="Amigdalite"
      secoes={[
        {
          titulo: "Resumo",
          icone: "medical-outline",
          cor: "#7050b3",
          texto:
            "Amigdalite é a inflamação das amígdalas, estruturas localizadas no fundo da garganta. Pode ser causada por vírus ou bactérias.",
        },
        {
          titulo: "Sintomas",
          icone: "list-outline",
          cor: "#ff5ea8",
          lista: [
            "Dor de garganta.",
            "Febre.",
            "Dificuldade para engolir.",
            "Mau hálito.",
            "Amígdalas vermelhas ou inchadas.",
            "Placas brancas ou pus em alguns casos.",
            "Ínguas no pescoço.",
            "Recusa alimentar em crianças pequenas.",
          ],
        },
        {
          titulo: "Viral ou bacteriana?",
          icone: "help-circle-outline",
          cor: "#ffb300",
          texto:
            "Nem toda amigdalite precisa de antibiótico. Muitas são virais e melhoram com cuidados de suporte. A avaliação profissional ajuda a diferenciar os casos.",
        },
        {
          titulo: "Cuidados",
          icone: "home-outline",
          cor: "#00c48c",
          lista: [
            "Oferecer líquidos.",
            "Preferir alimentos mais macios se houver dor.",
            "Evitar alimentos muito ácidos ou irritantes.",
            "Não usar antibiótico sem prescrição.",
            "Seguir o tratamento indicado até o fim, se houver prescrição.",
          ],
        },
        {
          titulo: "Quando procurar atendimento?",
          icone: "warning-outline",
          cor: "#ff5ea8",
          lista: [
            "Dificuldade para respirar.",
            "Dificuldade para engolir saliva.",
            "Baba excessiva.",
            "Dor muito intensa.",
            "Febre persistente.",
            "Piora rápida.",
            "Criança pequena recusando líquidos.",
          ],
        },
      ]}
    />
  );
}