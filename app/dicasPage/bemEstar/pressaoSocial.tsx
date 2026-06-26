import BemEstarTemplate from "@/src/components/bemEstarTemplate";
import React from "react";

export default function PressaoSocial() {
  return (
    <BemEstarTemplate
      badge="Bem-estar Familiar"
      titulo="Pressão Social na Maternidade"
      secoes={[
        {
          titulo: "Resumo",
          icone: "megaphone-outline",
          cor: "#7050b3",
          texto:
            "A pressão social aparece quando mães e pais sentem que precisam seguir padrões impostos por familiares, redes sociais, conhecidos ou pela sociedade sobre como criar, cuidar, trabalhar e se comportar.",
        },
        {
          titulo: "De onde vem a pressão?",
          icone: "people-outline",
          cor: "#ff5ea8",
          lista: [
            "Comentários de familiares.",
            "Comparações com outras mães e pais.",
            "Redes sociais mostrando rotinas perfeitas.",
            "Opiniões sobre amamentação, parto, sono e alimentação.",
            "Cobrança para dar conta da casa, trabalho e criança.",
            "Frases que diminuem o cansaço dos pais.",
          ],
        },
        {
          titulo: "Frases comuns",
          icone: "chatbubble-ellipses-outline",
          cor: "#ffb300",
          lista: [
            "Na minha época era diferente.",
            "Você está acostumando mal.",
            "Mãe de verdade dá conta.",
            "Você deveria estar feliz o tempo todo.",
            "Esse bebê chora porque você pega demais.",
            "Você trabalha demais ou trabalha de menos.",
          ],
        },
        {
          titulo: "Como isso afeta?",
          icone: "sad-outline",
          cor: "#7050b3",
          texto:
            "A pressão social pode gerar culpa, ansiedade, insegurança e sensação de fracasso. Muitas pessoas passam a duvidar das próprias escolhas mesmo quando estão fazendo o melhor dentro da própria realidade.",
        },
        {
          titulo: "Como se proteger",
          icone: "shield-checkmark-outline",
          cor: "#00c48c",
          lista: [
            "Filtre conselhos que não respeitam sua realidade.",
            "Evite comparar sua rotina com imagens perfeitas da internet.",
            "Confie mais em profissionais do que em palpites aleatórios.",
            "Converse com pessoas que acolhem em vez de julgar.",
            "Defina limites para comentários invasivos.",
          ],
        },
        {
          titulo: "Limites saudáveis",
          icone: "hand-left-outline",
          cor: "#ff5ea8",
          texto:
            "Você pode agradecer uma opinião sem seguir o que foi dito. Cuidar da sua família também envolve proteger sua saúde emocional de julgamentos constantes.",
        },
        {
          titulo: "Redes sociais",
          icone: "phone-portrait-outline",
          cor: "#7050b3",
          lista: [
            "Lembre que muitos conteúdos mostram apenas recortes.",
            "Pare de seguir perfis que aumentam sua culpa.",
            "Busque conteúdos realistas e acolhedores.",
            "Evite medir sua maternidade ou paternidade por curtidas.",
            "Descanse da internet quando ela pesar demais.",
          ],
        },
        {
          titulo: "Lembrete final",
          icone: "heart-outline",
          cor: "#00c48c",
          texto:
            "Não existe uma família perfeita. Existe uma família real, com limites, tentativas, erros, aprendizados e amor possível dentro da própria realidade.",
        },
      ]}
    />
  );
}
