import BemEstarTemplate from "@/src/components/bemEstarTemplate";
import React from "react";

export default function Pneumonia() {
  return (
    <BemEstarTemplate
      badge="Respiratório"
      titulo="Pneumonia"
      secoes={[
        {
          titulo: "Resumo",
          icone: "medical-outline",
          cor: "#7050b3",
          texto:
            "Pneumonia é uma infecção nos pulmões. Pode ser causada por vírus, bactérias ou outros agentes. Em crianças, precisa de atenção porque pode evoluir com dificuldade respiratória.",
        },
        {
          titulo: "Sintomas possíveis",
          icone: "list-outline",
          cor: "#ff5ea8",
          lista: [
            "Tosse persistente.",
            "Febre.",
            "Respiração rápida.",
            "Cansaço.",
            "Dor no peito ou barriga.",
            "Falta de apetite.",
            "Dificuldade para mamar ou beber.",
            "Chiado ou esforço respiratório.",
          ],
        },
        {
          titulo: "Sinais respiratórios importantes",
          icone: "eye-outline",
          cor: "#ffb300",
          lista: [
            "Costelas afundando ao respirar.",
            "Narinas abrindo muito.",
            "Gemência.",
            "Lábios arroxeados.",
            "Respiração muito rápida.",
            "Criança não consegue falar, mamar ou brincar como antes.",
          ],
        },
        {
          titulo: "Cuidados",
          icone: "home-outline",
          cor: "#00c48c",
          lista: [
            "Oferecer líquidos.",
            "Manter repouso.",
            "Seguir corretamente o tratamento prescrito.",
            "Não usar antibiótico sem prescrição.",
            "Evitar fumaça de cigarro e ambientes fechados.",
          ],
        },
        {
          titulo: "Quando procurar urgência?",
          icone: "warning-outline",
          cor: "#ff5ea8",
          lista: [
            "Dificuldade para respirar.",
            "Lábios ou dedos arroxeados.",
            "Sonolência extrema.",
            "Febre persistente ou muito alta.",
            "Recusa de líquidos ou mamadas.",
            "Piora rápida do estado geral.",
          ],
        },
      ]}
    />
  );
}
