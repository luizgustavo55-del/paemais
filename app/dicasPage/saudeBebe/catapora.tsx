import BemEstarTemplate from "@/src/components/bemEstarTemplate";
import React from "react";

export default function Catapora() {
  return (
    <BemEstarTemplate
      badge="Doenças de Pele"
      titulo="Catapora"
      secoes={[
        {
          titulo: "Resumo",
          icone: "sparkles-outline",
          cor: "#7050b3",
          texto:
            "Catapora, ou varicela, é uma doença viral contagiosa que causa bolinhas e bolhas na pele, geralmente com coceira. A vacinação ajuda a prevenir formas graves.",
        },
        {
          titulo: "Sintomas",
          icone: "list-outline",
          cor: "#ff5ea8",
          lista: [
            "Manchas vermelhas na pele.",
            "Bolhinhas com líquido.",
            "Crostas conforme as lesões secam.",
            "Coceira.",
            "Febre.",
            "Cansaço.",
            "Falta de apetite.",
            "Dor de cabeça em algumas crianças.",
          ],
        },
        {
          titulo: "Transmissão",
          icone: "people-outline",
          cor: "#ffb300",
          texto:
            "A catapora se espalha facilmente pelo contato com secreções respiratórias ou com o líquido das bolhas. A criança deve evitar contato com outras pessoas até orientação adequada.",
        },
        {
          titulo: "Cuidados",
          icone: "home-outline",
          cor: "#00c48c",
          lista: [
            "Evitar coçar para reduzir risco de infecção.",
            "Manter unhas curtas e limpas.",
            "Dar banhos mornos.",
            "Usar roupas leves.",
            "Oferecer líquidos.",
            "Usar medicamentos apenas com orientação.",
          ],
        },
        {
          titulo: "Atenção",
          icone: "warning-outline",
          cor: "#ff5ea8",
          lista: [
            "Não usar aspirina em crianças.",
            "Procure atendimento se houver febre alta ou persistente.",
            "Procure atendimento se as lesões ficarem muito vermelhas, inchadas ou com pus.",
            "Bebês pequenos, gestantes e pessoas com imunidade baixa precisam de orientação rápida.",
          ],
        },
        {
          titulo: "Prevenção",
          icone: "shield-checkmark-outline",
          cor: "#7050b3",
          texto:
            "A vacinação é uma das principais formas de prevenção e ajuda a reduzir o risco de doença grave.",
        },
      ]}
    />
  );
}
