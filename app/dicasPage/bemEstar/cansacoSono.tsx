import BemEstarTemplate from "@/src/components/BemEstarTemplate";
import React from "react";

export default function CansacoSono() {
  return (
    <BemEstarTemplate
      badge="Bem-estar Familiar"
      titulo="Cansaço e Falta de Sono na Maternidade"
      secoes={[
        {
          titulo: "Resumo",
          icone: "moon-outline",
          cor: "#7050b3",
          texto:
            "A chegada de um bebê muda completamente a rotina de sono da família. Acordar várias vezes durante a noite, amamentar, trocar fraldas e lidar com choros pode causar cansaço físico e emocional.",
        },
        {
          titulo: "Por que acontece?",
          icone: "help-circle-outline",
          cor: "#ff5ea8",
          texto:
            "Nos primeiros meses, o bebê ainda está criando seu ritmo de sono. Além disso, pais e mães costumam ficar em estado de alerta, o que dificulta descansar mesmo quando há oportunidade.",
        },
        {
          titulo: "Sinais de alerta",
          icone: "alert-circle-outline",
          cor: "#ffb300",
          lista: [
            "Irritabilidade frequente.",
            "Dificuldade para se concentrar.",
            "Sensação de exaustão mesmo após dormir.",
            "Choro fácil ou sensação de sobrecarga.",
            "Falta de energia para tarefas simples.",
          ],
        },
        {
          titulo: "O que pode ajudar?",
          icone: "heart-outline",
          cor: "#00c48c",
          lista: [
            "Dormir quando o bebê dormir, quando for possível.",
            "Dividir tarefas com outra pessoa da casa.",
            "Evitar tentar fazer tudo sozinho.",
            "Reduzir cobranças sobre casa perfeitamente organizada.",
            "Pedir ajuda para familiares ou rede de apoio.",
          ],
        },
        {
          titulo: "Para lembrar",
          icone: "bulb-outline",
          cor: "#7050b3",
          texto:
            "Cansaço não significa fraqueza. Cuidar de um bebê exige muito do corpo e da mente. Descanso também faz parte do cuidado com a criança.",
        },
        {
          titulo: "Quando procurar ajuda?",
          icone: "medkit-outline",
          cor: "#ff5ea8",
          texto:
            "Se o cansaço vier acompanhado de tristeza intensa, ansiedade constante, raiva fora do comum ou pensamentos de desistência, procure apoio profissional.",
        },
      ]}
    />
  );
}
