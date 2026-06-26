import BemEstarTemplate from "@/src/components/BemEstarTemplate";
import React from "react";

export default function Gripe() {
  return (
    <BemEstarTemplate
      badge="Doenças Comuns"
      titulo="Gripe"
      secoes={[
        {
          titulo: "Resumo",
          icone: "thermometer-outline",
          cor: "#7050b3",
          texto:
            "A gripe é uma infecção respiratória causada pelo vírus influenza. Pode ser mais intensa que um resfriado e causar febre alta, dor no corpo, cansaço e tosse.",
        },
        {
          titulo: "Sintomas comuns",
          icone: "pulse-outline",
          cor: "#ff5ea8",
          lista: [
            "Febre.",
            "Tosse.",
            "Dor de garganta.",
            "Nariz escorrendo ou entupido.",
            "Cansaço intenso.",
            "Dor no corpo.",
            "Dor de cabeça.",
            "Em crianças, pode haver vômitos ou diarreia.",
          ],
        },
        {
          titulo: "Cuidados",
          icone: "home-outline",
          cor: "#00c48c",
          lista: [
            "Manter repouso.",
            "Oferecer líquidos com frequência.",
            "Manter alimentação leve, sem forçar.",
            "Controlar febre apenas com remédio indicado por profissional.",
            "Evitar contato com outras crianças enquanto houver sintomas fortes.",
          ],
        },
        {
          titulo: "Prevenção",
          icone: "shield-checkmark-outline",
          cor: "#ffb300",
          lista: [
            "Vacinação anual contra influenza, conforme orientação do calendário.",
            "Lavar as mãos com frequência.",
            "Evitar contato próximo com pessoas gripadas.",
            "Cobrir boca e nariz ao tossir ou espirrar.",
            "Manter ambientes ventilados.",
          ],
        },
        {
          titulo: "Sinais de urgência",
          icone: "warning-outline",
          cor: "#ff5ea8",
          lista: [
            "Dificuldade para respirar.",
            "Lábios ou rosto arroxeados.",
            "Costelas marcando ao respirar.",
            "Desidratação.",
            "Sonolência extrema ou confusão.",
            "Convulsão.",
            "Febre que melhora e depois volta pior.",
            "Bebê menor de 3 meses com febre.",
          ],
        },
      ]}
    />
  );
}
