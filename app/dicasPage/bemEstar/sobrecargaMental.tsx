import React from "react";
import BemEstarTemplate from "@/src/components/bemEstarTemplate";

export default function SobrecargaMental() {
  return (
    <BemEstarTemplate
      badge="Bem-estar Familiar"
      titulo="Sobrecarga Mental de Pais e Mães"
      secoes={[
        {
          titulo: "Resumo",
          icone: "brain-outline" as any,
          cor: "#7050b3",
          texto:
            "Sobrecarga mental acontece quando uma pessoa fica responsável por lembrar, planejar, organizar e resolver quase tudo da rotina familiar, mesmo quando outras pessoas também ajudam nas tarefas.",
        },
        {
          titulo: "Como aparece?",
          icone: "list-outline",
          cor: "#ff5ea8",
          lista: [
            "Pensar em consultas, vacinas e horários.",
            "Controlar compras, alimentação e roupas.",
            "Lembrar datas, compromissos e pendências.",
            "Organizar a rotina da criança e da casa.",
            "Sentir que a mente nunca descansa.",
          ],
        },
        {
          titulo: "Por que pesa tanto?",
          icone: "help-circle-outline",
          cor: "#ffb300",
          texto:
            "A sobrecarga não está apenas em fazer tarefas, mas em precisar lembrar de tudo o tempo inteiro. Isso gera cansaço emocional e sensação de estar sempre devendo algo.",
        },
        {
          titulo: "Como dividir melhor?",
          icone: "people-outline",
          cor: "#00c48c",
          lista: [
            "Conversar sobre responsabilidades de forma clara.",
            "Dividir tarefas completas, não apenas pequenas ajudas.",
            "Criar uma lista visível da rotina da casa.",
            "Definir quem cuida de cada compromisso.",
            "Evitar centralizar todas as decisões em uma só pessoa.",
          ],
        },
        {
          titulo: "Frase importante",
          icone: "chatbubble-ellipses-outline",
          cor: "#7050b3",
          texto:
            "Ajudar é diferente de compartilhar responsabilidade. A família funciona melhor quando todos participam do cuidado e da organização.",
        },
        {
          titulo: "Quando buscar apoio?",
          icone: "heart-outline",
          cor: "#ff5ea8",
          texto:
            "Se a sobrecarga estiver gerando crises de ansiedade, tristeza, irritação constante ou conflitos frequentes, conversar com um profissional pode ajudar.",
        },
      ]}
    />
  );
}