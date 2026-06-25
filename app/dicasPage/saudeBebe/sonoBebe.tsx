import React from "react";
import BemEstarTemplate from "@/src/components/bemEstarTemplate";

export default function SonoBebe() {
  return (
    <BemEstarTemplate
      badge="Cuidados com o Bebê"
      titulo="Sono do Bebê"
      secoes={[
        {
          titulo: "Resumo",
          icone: "moon-outline",
          cor: "#7050b3",
          texto:
            "O sono do bebê muda bastante nos primeiros meses de vida. É comum que o bebê acorde várias vezes para mamar, buscar conforto ou porque ainda está aprendendo a diferenciar dia e noite.",
        },
        {
          titulo: "Sono seguro",
          icone: "shield-checkmark-outline",
          cor: "#00c48c",
          lista: [
            "Coloque o bebê para dormir de barriga para cima.",
            "Use colchão firme e superfície plana.",
            "Evite travesseiros, cobertores soltos, almofadas e bichos de pelúcia no berço.",
            "Evite dormir com o bebê em sofá ou poltrona.",
            "Mantenha o bebê em ambiente arejado e sem excesso de roupas.",
          ],
        },
        {
          titulo: "O que é normal?",
          icone: "help-circle-outline",
          cor: "#ff5ea8",
          lista: [
            "Recém-nascidos acordam muitas vezes.",
            "Alguns bebês trocam o dia pela noite no começo.",
            "Picos de crescimento podem aumentar despertares.",
            "Dentição, fome, frio, calor ou fralda suja podem atrapalhar o sono.",
            "Cada bebê tem seu próprio ritmo.",
          ],
        },
        {
          titulo: "Rotina do sono",
          icone: "calendar-outline",
          cor: "#ffb300",
          lista: [
            "Criar uma sequência simples antes de dormir.",
            "Diminuir luzes e barulhos à noite.",
            "Evitar muita agitação perto do horário de dormir.",
            "Fazer banho, troca, amamentação e canção calma, se funcionar para a família.",
            "Repetir a rotina com paciência, sem esperar resultado imediato.",
          ],
        },
        {
          titulo: "Sonecas",
          icone: "time-outline",
          cor: "#7050b3",
          texto:
            "As sonecas são importantes para o desenvolvimento e ajudam o bebê a não chegar exausto à noite. Um bebê muito cansado pode ter mais dificuldade para dormir.",
        },
        {
          titulo: "Quando observar melhor?",
          icone: "alert-circle-outline",
          cor: "#ff5ea8",
          lista: [
            "Roncos fortes e frequentes.",
            "Pausas respiratórias.",
            "Bebê muito molinho ou difícil de acordar.",
            "Dificuldade para respirar.",
            "Febre, recusa alimentar ou piora do estado geral.",
          ],
        },
        {
          titulo: "Para os pais",
          icone: "heart-outline",
          cor: "#00c48c",
          texto:
            "A privação de sono também afeta os cuidadores. Sempre que possível, dividam turnos, aceitem ajuda e reduzam cobranças. Cuidar de quem cuida também é parte do cuidado com o bebê.",
        },
      ]}
    />
  );
}