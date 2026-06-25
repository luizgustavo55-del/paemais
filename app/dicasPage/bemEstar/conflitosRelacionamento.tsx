import React from "react";
import BemEstarTemplate from "@/src/components/bemEstarTemplate";

export default function ConflitosRelacionamento() {
  return (
    <BemEstarTemplate
      badge="Relações Familiares"
      titulo="Conflitos no Relacionamento"
      secoes={[
        {
          titulo: "Resumo",
          icone: "heart-dislike-outline",
          cor: "#7050b3",
          texto:
            "A maternidade e a paternidade podem mudar a dinâmica do relacionamento. O cansaço, a falta de tempo, as preocupações e a divisão de tarefas podem gerar conflitos.",
        },
        {
          titulo: "Por que os conflitos aumentam?",
          icone: "help-circle-outline",
          cor: "#ff5ea8",
          texto:
            "Com uma criança, a rotina muda e o casal pode ter menos tempo para conversar, descansar e cuidar da relação. Pequenas tensões acabam crescendo quando não são faladas com calma.",
        },
        {
          titulo: "Situações comuns",
          icone: "chatbubbles-outline",
          cor: "#ffb300",
          lista: [
            "Discussões sobre divisão de tarefas.",
            "Sensação de falta de apoio.",
            "Cansaço e irritação acumulados.",
            "Dificuldade para conversar sem brigar.",
            "Falta de momentos como casal.",
          ],
        },
        {
          titulo: "Como conversar melhor",
          icone: "chatbubble-ellipses-outline",
          cor: "#00c48c",
          lista: [
            "Escolha um momento mais calmo para falar.",
            "Evite começar a conversa com acusações.",
            "Fale sobre o que você sente e precisa.",
            "Escute o outro sem interromper.",
            "Procurem combinar ações práticas, não só promessas.",
          ],
        },
        {
          titulo: "O que evitar",
          icone: "close-circle-outline",
          cor: "#ff5ea8",
          lista: [
            "Discutir no auge da raiva.",
            "Usar silêncio como punição.",
            "Comparar o parceiro com outras pessoas.",
            "Diminuir o cansaço do outro.",
            "Ignorar problemas que se repetem.",
          ],
        },
        {
          titulo: "Quando buscar ajuda?",
          icone: "medkit-outline",
          cor: "#7050b3",
          texto:
            "Se as brigas forem frequentes, houver humilhação, medo, agressividade ou sensação de insegurança, é importante buscar apoio profissional ou rede de proteção.",
        },
      ]}
    />
  );
}