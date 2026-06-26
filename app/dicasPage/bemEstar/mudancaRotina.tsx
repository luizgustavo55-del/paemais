import BemEstarTemplate from "@/src/components/bemEstarTemplate";
import React from "react";

export default function MudancaRotina() {
  return (
    <BemEstarTemplate
      badge="Adaptação Familiar"
      titulo="Mudanças de Rotina e Identidade"
      secoes={[
        {
          titulo: "Resumo",
          icone: "refresh-outline",
          cor: "#7050b3",
          texto:
            "A chegada de um filho transforma a rotina e também a forma como pais e mães se enxergam. A vida passa a ter novos horários, novas prioridades e novas responsabilidades.",
        },
        {
          titulo: "O que muda na rotina?",
          icone: "time-outline",
          cor: "#ff5ea8",
          lista: [
            "Sono e descanso ficam mais interrompidos.",
            "Os horários passam a depender das necessidades da criança.",
            "Tarefas simples podem demorar mais.",
            "A casa pode ficar mais desorganizada.",
            "Planos precisam ser adaptados com mais frequência.",
            "O tempo para si mesmo pode diminuir bastante.",
          ],
        },
        {
          titulo: "O que muda por dentro?",
          icone: "person-outline",
          cor: "#7050b3",
          texto:
            "Muitas pessoas sentem que não são mais as mesmas depois da maternidade ou paternidade. Isso pode trazer alegria, mas também estranhamento, saudade da vida anterior e dúvidas sobre a própria identidade.",
        },
        {
          titulo: "Sentimentos comuns",
          icone: "heart-circle-outline",
          cor: "#ffb300",
          lista: [
            "Saudade da antiga rotina.",
            "Culpa por sentir falta da liberdade anterior.",
            "Medo de não se reconhecer mais.",
            "Orgulho por cuidar de uma nova vida.",
            "Cansaço por estar sempre disponível.",
            "Vontade de retomar sonhos e projetos pessoais.",
          ],
        },
        {
          titulo: "Isso é normal?",
          icone: "help-circle-outline",
          cor: "#00c48c",
          texto:
            "Sim. Amar um filho não impede que você sinta falta de partes da sua vida antiga. A adaptação à nova identidade de mãe ou pai pode levar tempo e não acontece igual para todo mundo.",
        },
        {
          titulo: "Como se adaptar melhor",
          icone: "leaf-outline",
          cor: "#7050b3",
          lista: [
            "Crie uma rotina flexível, não perfeita.",
            "Aceite que algumas fases são temporárias.",
            "Converse sobre o que mudou para você.",
            "Mantenha pequenos hábitos que lembram quem você é.",
            "Inclua momentos simples de autocuidado.",
            "Divida responsabilidades sempre que possível.",
          ],
        },
        {
          titulo: "Identidade além da maternidade ou paternidade",
          icone: "sparkles-outline",
          cor: "#ff5ea8",
          texto:
            "Ser mãe ou pai passa a fazer parte da sua identidade, mas não precisa apagar todo o resto. Você continua tendo gostos, sonhos, limites, necessidades e história própria.",
        },
        {
          titulo: "Quando a mudança pesa demais",
          icone: "medkit-outline",
          cor: "#ffb300",
          texto:
            "Se a sensação de perda de identidade vier com tristeza profunda, irritação intensa, isolamento, ansiedade constante ou vontade de sumir, procure apoio profissional.",
        },
        {
          titulo: "Lembrete importante",
          icone: "bulb-outline",
          cor: "#7050b3",
          texto:
            "Você não precisa voltar a ser exatamente quem era antes. Também não precisa se perder completamente. Aos poucos, uma nova versão sua pode ser construída com mais cuidado e acolhimento.",
        },
      ]}
    />
  );
}
