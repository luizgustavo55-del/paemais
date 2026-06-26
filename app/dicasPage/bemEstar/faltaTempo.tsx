import BemEstarTemplate from "@/src/components/bemEstarTemplate";
import React from "react";

export default function FaltaTempo() {
  return (
    <BemEstarTemplate
      badge="Autocuidado"
      titulo="Falta de Tempo para Si Mesmo"
      secoes={[
        {
          titulo: "Resumo",
          icone: "time-outline",
          cor: "#7050b3",
          texto:
            "Depois da chegada de um filho, muitos pais e mães sentem que deixaram de existir como indivíduos. A rotina passa a girar em torno da criança, da casa e das responsabilidades.",
        },
        {
          titulo: "Como isso aparece?",
          icone: "person-outline",
          cor: "#ff5ea8",
          lista: [
            "Não conseguir descansar sem culpa.",
            "Sentir falta de hobbies e momentos pessoais.",
            "Viver apenas resolvendo demandas dos outros.",
            "Ter dificuldade para cuidar da própria saúde.",
            "Sentir que perdeu parte da própria identidade.",
          ],
        },
        {
          titulo: "Por que é importante?",
          icone: "heart-outline",
          cor: "#00c48c",
          texto:
            "Cuidar de si não é egoísmo. Pais e mães que conseguem ter pequenos momentos de pausa tendem a lidar melhor com o estresse da rotina.",
        },
        {
          titulo: "Comece pequeno",
          icone: "leaf-outline",
          cor: "#ffb300",
          lista: [
            "Reserve 10 minutos para respirar ou tomar banho com calma.",
            "Faça uma caminhada curta, se possível.",
            "Escute uma música que você gosta.",
            "Peça ajuda para ter um pequeno intervalo.",
            "Escolha uma atividade simples só sua na semana.",
          ],
        },
        {
          titulo: "Sem culpa",
          icone: "happy-outline",
          cor: "#7050b3",
          texto:
            "Ter um tempo para si não diminui o amor pelo filho. Pelo contrário, ajuda a recarregar energia para cuidar melhor.",
        },
        {
          titulo: "Sinal de atenção",
          icone: "alert-circle-outline",
          cor: "#ff5ea8",
          texto:
            "Se a falta de tempo vier acompanhada de tristeza profunda, isolamento, irritação constante ou sensação de esgotamento, procure apoio.",
        },
      ]}
    />
  );
}
