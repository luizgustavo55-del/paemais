import BemEstarTemplate from "@/src/components/bemEstarTemplate";
import React from "react";

export default function ResfriadoComum() {
  return (
    <BemEstarTemplate
      badge="Doenças Comuns"
      titulo="Resfriado Comum"
      secoes={[
        {
          titulo: "Resumo",
          icone: "cloudy-outline",
          cor: "#7050b3",
          texto:
            "O resfriado comum é uma infecção viral leve das vias respiratórias. É muito frequente em bebês e crianças pequenas, especialmente quando começam a conviver com outras crianças.",
        },
        {
          titulo: "Sintomas comuns",
          icone: "list-outline",
          cor: "#ff5ea8",
          lista: [
            "Nariz escorrendo ou entupido.",
            "Espirros.",
            "Tosse leve.",
            "Febre baixa em alguns casos.",
            "Irritabilidade.",
            "Menor apetite.",
            "Sono mais agitado.",
          ],
        },
        {
          titulo: "Cuidados em casa",
          icone: "home-outline",
          cor: "#00c48c",
          lista: [
            "Oferecer líquidos ou mamadas com frequência.",
            "Lavar o nariz com soro fisiológico, se orientado.",
            "Manter o ambiente ventilado.",
            "Evitar fumaça, poeira e cheiros fortes.",
            "Deixar a criança descansar.",
          ],
        },
        {
          titulo: "O que evitar",
          icone: "close-circle-outline",
          cor: "#ffb300",
          lista: [
            "Usar antibiótico sem prescrição.",
            "Usar remédios de tosse ou gripe sem orientação.",
            "Forçar alimentação.",
            "Expor a criança a fumaça de cigarro.",
          ],
        },
        {
          titulo: "Quando procurar atendimento?",
          icone: "alert-circle-outline",
          cor: "#ff5ea8",
          lista: [
            "Bebê menor de 3 meses com febre.",
            "Respiração rápida ou difícil.",
            "Chiado no peito.",
            "Lábios arroxeados.",
            "Recusa persistente de líquidos ou mamadas.",
            "Sonolência excessiva.",
            "Piora após alguns dias.",
          ],
        },
      ]}
    />
  );
}
