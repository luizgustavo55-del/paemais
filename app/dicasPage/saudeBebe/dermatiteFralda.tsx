import BemEstarTemplate from "@/src/components/bemEstarTemplate";
import React from "react";

export default function DermatiteFralda() {
  return (
    <BemEstarTemplate
      badge="Pele do Bebê"
      titulo="Dermatite de Fralda"
      secoes={[
        {
          titulo: "Resumo",
          icone: "bandage-outline",
          cor: "#7050b3",
          texto:
            "Dermatite de fralda é uma irritação na pele coberta pela fralda. Pode ocorrer pelo contato prolongado com urina e fezes, calor, atrito, produtos irritantes ou infecção por fungos.",
        },
        {
          titulo: "Sinais comuns",
          icone: "list-outline",
          cor: "#ff5ea8",
          lista: [
            "Vermelhidão na região da fralda.",
            "Pele sensível ao toque.",
            "Ardência ou choro durante a troca.",
            "Pequenas bolinhas ou áreas irritadas.",
            "Piora em dobrinhas ou áreas de atrito.",
          ],
        },
        {
          titulo: "Cuidados principais",
          icone: "home-outline",
          cor: "#00c48c",
          lista: [
            "Trocar fraldas com frequência.",
            "Limpar suavemente com água ou produto sem perfume e sem álcool.",
            "Secar sem esfregar.",
            "Deixar a pele respirar sem fralda por alguns minutos.",
            "Usar creme de barreira, se indicado.",
            "Evitar talco e produtos perfumados.",
          ],
        },
        {
          titulo: "Prevenção",
          icone: "shield-checkmark-outline",
          cor: "#ffb300",
          lista: [
            "Não deixar fralda suja por muito tempo.",
            "Usar fralda de tamanho adequado.",
            "Evitar roupas muito apertadas.",
            "Manter a pele limpa e seca.",
            "Observar se algum produto novo irritou a pele.",
          ],
        },
        {
          titulo: "Pode ser fungo?",
          icone: "help-circle-outline",
          cor: "#7050b3",
          texto:
            "Quando a assadura é persistente, muito vermelha, com pontinhos ao redor ou piora apesar dos cuidados, pode haver infecção por fungo. Nesses casos, é importante avaliação profissional.",
        },
        {
          titulo: "Quando procurar atendimento?",
          icone: "warning-outline",
          cor: "#ff5ea8",
          lista: [
            "Feridas abertas.",
            "Bolhas.",
            "Sangramento.",
            "Pus.",
            "Febre.",
            "Rash que não melhora após alguns dias de cuidado.",
            "Bebê muito irritado ou com dor intensa.",
          ],
        },
      ]}
    />
  );
}
