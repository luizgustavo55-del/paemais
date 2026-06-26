import BemEstarTemplate from "@/src/components/BemEstarTemplate";
import React from "react";

export default function Conjuntivite() {
  return (
    <BemEstarTemplate
      badge="Olhos"
      titulo="Conjuntivite"
      secoes={[
        {
          titulo: "Resumo",
          icone: "eye-outline",
          cor: "#7050b3",
          texto:
            "Conjuntivite é a inflamação da conjuntiva, a membrana que cobre parte dos olhos. Pode ser viral, bacteriana, alérgica ou causada por irritação.",
        },
        {
          titulo: "Sintomas",
          icone: "list-outline",
          cor: "#ff5ea8",
          lista: [
            "Olhos vermelhos.",
            "Lacrimejamento.",
            "Coceira.",
            "Inchaço nas pálpebras.",
            "Secreção.",
            "Olhos grudados ao acordar.",
            "Sensação de areia nos olhos.",
          ],
        },
        {
          titulo: "Como evitar transmissão",
          icone: "shield-checkmark-outline",
          cor: "#00c48c",
          lista: [
            "Lavar as mãos com frequência.",
            "Evitar coçar os olhos.",
            "Não compartilhar toalhas, fronhas ou panos.",
            "Limpar secreções com cuidado.",
            "Trocar fronhas e toalhas com frequência.",
          ],
        },
        {
          titulo: "Cuidados",
          icone: "home-outline",
          cor: "#ffb300",
          lista: [
            "Não usar colírios sem orientação.",
            "Fazer limpeza com gaze ou algodão limpo e água filtrada ou soro, se orientado.",
            "Evitar contato próximo com outras crianças se houver secreção intensa.",
            "Observar se há dor forte ou alteração na visão.",
          ],
        },
        {
          titulo: "Quando procurar atendimento?",
          icone: "warning-outline",
          cor: "#ff5ea8",
          lista: [
            "Dor forte nos olhos.",
            "Sensibilidade intensa à luz.",
            "Alteração da visão.",
            "Inchaço importante.",
            "Bebê recém-nascido com secreção ocular.",
            "Sintomas que pioram ou não melhoram.",
          ],
        },
      ]}
    />
  );
}
