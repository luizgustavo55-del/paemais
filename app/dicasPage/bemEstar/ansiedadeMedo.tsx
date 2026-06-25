import React from "react";
import BemEstarTemplate from "@/src/components/bemEstarTemplate";

export default function AnsiedadeMedo() {
  return (
    <BemEstarTemplate
      badge="Bem-estar Emocional"
      titulo="Ansiedade e Medo na Maternidade"
      secoes={[
        {
          titulo: "Resumo",
          icone: "heart-outline",
          cor: "#7050b3",
          texto:
            "A maternidade pode trazer muito amor, mas também inseguranças, dúvidas e medos. É comum sentir ansiedade diante das novas responsabilidades, principalmente quando tudo parece depender de você.",
        },
        {
          titulo: "Por que isso acontece?",
          icone: "help-circle-outline",
          cor: "#ff5ea8",
          texto:
            "A chegada de um bebê muda o corpo, a rotina, o sono, as relações e a forma como a mãe se enxerga. Além disso, existe uma cobrança social muito forte para que a mãe saiba tudo, dê conta de tudo e esteja sempre bem.",
        },
        {
          titulo: "Medos comuns",
          icone: "alert-circle-outline",
          cor: "#ffb300",
          lista: [
            "Medo de não ser uma boa mãe.",
            "Medo de o bebê adoecer.",
            "Medo de fazer algo errado nos cuidados.",
            "Medo de não conseguir descansar nunca mais.",
            "Medo de perder sua própria identidade.",
            "Medo de ser julgada por outras pessoas.",
          ],
        },
        {
          titulo: "Sinais de ansiedade",
          icone: "pulse-outline",
          cor: "#7050b3",
          lista: [
            "Pensamentos acelerados.",
            "Dificuldade para relaxar.",
            "Sensação de aperto no peito.",
            "Choro frequente ou sem motivo claro.",
            "Preocupação constante com o bebê.",
            "Irritabilidade ou sensação de estar no limite.",
            "Dificuldade para dormir mesmo quando o bebê dorme.",
          ],
        },
        {
          titulo: "O que pode ajudar?",
          icone: "leaf-outline",
          cor: "#00c48c",
          lista: [
            "Falar sobre o que sente com alguém de confiança.",
            "Evitar se comparar com outras mães.",
            "Diminuir a cobrança por perfeição.",
            "Aceitar ajuda prática, como comida, limpeza ou cuidado com o bebê.",
            "Criar pequenos momentos de pausa durante o dia.",
            "Respirar devagar quando sentir que está entrando em crise.",
          ],
        },
        {
          titulo: "Respiração simples",
          icone: "flower-outline",
          cor: "#ff5ea8",
          texto:
            "Quando a ansiedade vier forte, tente inspirar pelo nariz contando até 4, segurar por 2 segundos e soltar o ar lentamente contando até 6. Repita algumas vezes. Isso não resolve tudo, mas pode ajudar o corpo a sair do estado de alerta.",
        },
        {
          titulo: "Você não precisa dar conta de tudo",
          icone: "people-outline",
          cor: "#7050b3",
          texto:
            "Cuidar de uma criança deve ser uma responsabilidade compartilhada. Sempre que possível, converse com o parceiro, familiares ou pessoas próximas para dividir tarefas e aliviar a carga emocional.",
        },
        {
          titulo: "Quando procurar ajuda?",
          icone: "medkit-outline",
          cor: "#ff5ea8",
          texto:
            "Procure apoio profissional se a ansiedade estiver muito intensa, atrapalhando seu sono, sua alimentação, sua relação com o bebê ou sua vontade de viver. Pedir ajuda é um ato de cuidado, não de fraqueza.",
        },
        {
          titulo: "Lembrete importante",
          icone: "bulb-outline",
          cor: "#ffb300",
          texto:
            "Sentir medo não significa que você não ama seu filho. Muitas vezes, o medo aparece justamente porque você se importa muito. O importante é não enfrentar tudo sozinha.",
        },
      ]}
    />
  );
}