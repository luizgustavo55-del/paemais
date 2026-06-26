import BemEstarTemplate from "@/src/components/BemEstarTemplate";
import React from "react";

export default function Gastroenterite() {
  return (
    <BemEstarTemplate
      badge="Doenças Comuns"
      titulo="Gastroenterite"
      secoes={[
        {
          titulo: "Resumo",
          icone: "water-outline",
          cor: "#7050b3",
          texto:
            "Gastroenterite é uma inflamação do estômago e intestino, geralmente causada por vírus. Pode provocar diarreia, vômitos, dor abdominal e febre.",
        },
        {
          titulo: "Sintomas",
          icone: "list-outline",
          cor: "#ff5ea8",
          lista: [
            "Diarreia.",
            "Vômitos.",
            "Dor ou cólica abdominal.",
            "Febre.",
            "Náusea.",
            "Perda de apetite.",
            "Cansaço.",
          ],
        },
        {
          titulo: "Maior risco",
          icone: "alert-circle-outline",
          cor: "#ffb300",
          texto:
            "O principal risco é a desidratação, especialmente em bebês pequenos, crianças com vômitos repetidos ou diarreia intensa.",
        },
        {
          titulo: "Sinais de desidratação",
          icone: "warning-outline",
          cor: "#ff5ea8",
          lista: [
            "Pouca urina ou fraldas secas por muitas horas.",
            "Boca seca.",
            "Choro sem lágrimas.",
            "Olhos fundos.",
            "Moleza ou sonolência incomum.",
            "Irritabilidade intensa.",
            "Sede excessiva.",
          ],
        },
        {
          titulo: "Cuidados em casa",
          icone: "home-outline",
          cor: "#00c48c",
          lista: [
            "Oferecer líquidos em pequenas quantidades e com frequência.",
            "Manter amamentação.",
            "Usar soro de reidratação oral se orientado.",
            "Evitar refrigerantes e sucos muito doces.",
            "Não dar remédio para prender intestino sem orientação.",
            "Lavar bem as mãos para evitar transmissão.",
          ],
        },
        {
          titulo: "Quando procurar atendimento?",
          icone: "medical-outline",
          cor: "#7050b3",
          lista: [
            "Bebê menor de 6 meses.",
            "Sinais de desidratação.",
            "Sangue nas fezes.",
            "Vômitos persistentes.",
            "Febre alta.",
            "Dor abdominal forte ou localizada.",
            "Criança muito sonolenta ou sem reação.",
          ],
        },
      ]}
    />
  );
}
