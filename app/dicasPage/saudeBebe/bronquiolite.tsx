import BemEstarTemplate from "@/src/components/bemEstarTemplate";
import React from "react";

export default function Bronquiolite() {
  return (
    <BemEstarTemplate
      badge="Respiratório"
      titulo="Bronquiolite"
      secoes={[
        {
          titulo: "Resumo",
          icone: "medical-outline",
          cor: "#7050b3",
          texto:
            "A bronquiolite é uma infecção dos pequenos canais de ar dos pulmões, comum em bebês e crianças pequenas. Muitas vezes começa como um resfriado e pode evoluir com tosse, chiado e dificuldade para respirar.",
        },
        {
          titulo: "Sintomas",
          icone: "list-outline",
          cor: "#ff5ea8",
          lista: [
            "Nariz escorrendo.",
            "Tosse.",
            "Febre em alguns casos.",
            "Chiado no peito.",
            "Respiração rápida.",
            "Dificuldade para mamar ou beber.",
            "Irritabilidade ou cansaço.",
          ],
        },
        {
          titulo: "Cuidados em casa",
          icone: "home-outline",
          cor: "#00c48c",
          lista: [
            "Oferecer mamadas ou líquidos em pequenas quantidades e com frequência.",
            "Lavar o nariz com soro fisiológico se orientado.",
            "Manter o bebê em ambiente ventilado.",
            "Evitar fumaça, poeira e perfumes fortes.",
            "Observar a respiração de perto.",
          ],
        },
        {
          titulo: "O que observar na respiração",
          icone: "eye-outline",
          cor: "#ffb300",
          lista: [
            "Respiração muito rápida.",
            "Costelas afundando ao respirar.",
            "Batimento de asa do nariz.",
            "Gemência ou esforço para respirar.",
            "Pausas na respiração.",
            "Lábios ou dedos arroxeados.",
          ],
        },
        {
          titulo: "Quando procurar atendimento?",
          icone: "warning-outline",
          cor: "#ff5ea8",
          lista: [
            "Dificuldade para respirar.",
            "Bebê não consegue mamar.",
            "Poucas fraldas molhadas.",
            "Sonolência excessiva.",
            "Lábios arroxeados.",
            "Bebê muito pequeno, prematuro ou com doença cardíaca/pulmonar.",
          ],
        },
      ]}
    />
  );
}
