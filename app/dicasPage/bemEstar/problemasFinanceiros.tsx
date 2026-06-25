import React from "react";
import BemEstarTemplate from "@/src/components/bemEstarTemplate";

export default function ProblemasFinanceiros() {
  return (
    <BemEstarTemplate
      badge="Organização Familiar"
      titulo="Problemas de Organização Financeira"
      secoes={[
        {
          titulo: "Resumo",
          icone: "wallet-outline",
          cor: "#7050b3",
          texto:
            "A chegada de uma criança aumenta gastos e muda prioridades. Fraldas, consultas, remédios, alimentação, transporte e imprevistos podem deixar a família preocupada com dinheiro.",
        },
        {
          titulo: "Principais dificuldades",
          icone: "alert-circle-outline",
          cor: "#ff5ea8",
          lista: [
            "Não saber exatamente quanto entra e quanto sai.",
            "Gastar com urgências sem planejamento.",
            "Comprar por impulso para tentar compensar culpa ou cansaço.",
            "Não separar gastos fixos, variáveis e emergenciais.",
            "Falta de conversa clara entre o casal ou família.",
          ],
        },
        {
          titulo: "Primeiro passo",
          icone: "create-outline",
          cor: "#00c48c",
          texto:
            "Anote todos os gastos por alguns dias. Antes de cortar despesas, é importante entender para onde o dinheiro está indo.",
        },
        {
          titulo: "Como organizar",
          icone: "checkbox-outline",
          cor: "#ffb300",
          lista: [
            "Liste renda mensal e gastos fixos.",
            "Separe despesas da criança.",
            "Defina prioridades reais.",
            "Crie uma pequena reserva, mesmo que comece com pouco.",
            "Evite comparar sua realidade com a de outras famílias.",
          ],
        },
        {
          titulo: "Conversa em família",
          icone: "people-outline",
          cor: "#7050b3",
          texto:
            "Problemas financeiros ficam mais pesados quando viram silêncio ou acusação. Conversar com calma ajuda a dividir decisões e encontrar soluções possíveis.",
        },
        {
          titulo: "Importante",
          icone: "bulb-outline",
          cor: "#ff5ea8",
          texto:
            "Organização financeira não é sobre ter muito dinheiro. É sobre enxergar melhor a realidade, reduzir sustos e planejar o que for possível.",
        },
      ]}
    />
  );
}