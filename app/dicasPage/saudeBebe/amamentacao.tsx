import BemEstarTemplate from "@/src/components/BemEstarTemplate";
import React from "react";

export default function Amamentacao() {
  return (
    <BemEstarTemplate
      badge="Alimentação do Bebê"
      titulo="Amamentação"
      secoes={[
        {
          titulo: "Resumo",
          icone: "heart-outline",
          cor: "#7050b3",
          texto:
            "A amamentação oferece alimento, proteção imunológica, vínculo e conforto. Apesar de natural, nem sempre é fácil no início. Dor, insegurança, pega incorreta e cansaço são dificuldades comuns e podem melhorar com orientação.",
        },
        {
          titulo: "Benefícios para o bebê",
          icone: "shield-checkmark-outline",
          cor: "#00c48c",
          lista: [
            "Fornece nutrientes adequados para cada fase.",
            "Ajuda na proteção contra infecções.",
            "Favorece vínculo emocional.",
            "Contribui para desenvolvimento da boca e face.",
            "Ajuda na hidratação e nutrição.",
            "Pode reduzir riscos de algumas doenças na infância.",
          ],
        },
        {
          titulo: "Benefícios para quem amamenta",
          icone: "body-outline",
          cor: "#ff5ea8",
          lista: [
            "Ajuda o útero a voltar ao tamanho normal no pós-parto.",
            "Pode reduzir sangramentos após o parto.",
            "Fortalece vínculo com o bebê.",
            "Pode trazer praticidade por estar sempre disponível.",
            "Pode reduzir riscos de algumas doenças ao longo da vida.",
          ],
        },
        {
          titulo: "Livre demanda",
          icone: "time-outline",
          cor: "#ffb300",
          texto:
            "Na livre demanda, o bebê mama quando sente necessidade, sem horários rígidos. Nos primeiros meses, isso pode acontecer muitas vezes ao dia e também durante a noite.",
        },
        {
          titulo: "Sinais de fome",
          icone: "notifications-outline",
          cor: "#7050b3",
          lista: [
            "Virar a cabeça procurando o peito.",
            "Levar as mãos à boca.",
            "Fazer movimentos de sucção.",
            "Ficar inquieto.",
            "Chorar, que costuma ser um sinal mais tardio de fome.",
          ],
        },
        {
          titulo: "Boa pega",
          icone: "checkmark-circle-outline",
          cor: "#00c48c",
          lista: [
            "Boca bem aberta.",
            "Lábios virados para fora.",
            "Queixo encostado na mama.",
            "Nariz livre para respirar.",
            "Mais aréola visível acima da boca do que abaixo.",
            "Sucção ritmada, sem dor intensa.",
          ],
        },
        {
          titulo: "Posições para amamentar",
          icone: "accessibility-outline",
          cor: "#ff5ea8",
          lista: [
            "Tradicional: bebê de frente para a mãe, barriga com barriga.",
            "Invertida: bebê apoiado ao lado do corpo, útil em alguns casos.",
            "Deitada de lado: pode ajudar no descanso, com segurança.",
            "Cavalinho: bebê mais sentado, pode ajudar em refluxo ou pega difícil.",
            "O importante é mãe e bebê estarem confortáveis.",
          ],
        },
        {
          titulo: "Dor ao amamentar",
          icone: "alert-circle-outline",
          cor: "#ffb300",
          texto:
            "Um desconforto leve no começo pode acontecer, mas dor forte, fissuras, sangramento ou machucados não devem ser tratados como normais. Geralmente indicam necessidade de ajustar pega ou posição.",
        },
        {
          titulo: "Fissuras e machucados",
          icone: "medical-outline",
          cor: "#ff5ea8",
          lista: [
            "Verifique a pega do bebê.",
            "Evite puxar o bebê do peito sem quebrar o vácuo.",
            "Mantenha os mamilos secos e arejados quando possível.",
            "Procure orientação se houver dor intensa ou feridas persistentes.",
          ],
        },
        {
          titulo: "Ingurgitamento mamário",
          icone: "water-outline",
          cor: "#7050b3",
          texto:
            "Quando as mamas ficam muito cheias, duras e doloridas, pode haver dificuldade para o bebê pegar. Amamentar com frequência e retirar um pouco de leite antes da mamada pode ajudar, mas febre ou dor intensa precisam de avaliação.",
        },
        {
          titulo: "Mastite",
          icone: "thermometer-outline",
          cor: "#ff5ea8",
          texto:
            "Mastite pode causar dor, vermelhidão, calor na mama, mal-estar e febre. Precisa de orientação profissional, pois em alguns casos pode ser necessário tratamento específico.",
        },
        {
          titulo: "Como saber se o bebê mama bem?",
          icone: "happy-outline",
          cor: "#00c48c",
          lista: [
            "Bebê parece satisfeito após algumas mamadas.",
            "Ganha peso conforme avaliação do pediatra.",
            "Molha fraldas ao longo do dia.",
            "Tem sucção eficiente.",
            "A mãe não sente dor intensa durante toda a mamada.",
          ],
        },
        {
          titulo: "Ordenha e armazenamento",
          icone: "cube-outline",
          cor: "#7050b3",
          lista: [
            "Lave bem as mãos antes de retirar leite.",
            "Use recipiente limpo e próprio para armazenamento.",
            "Identifique com data e horário.",
            "Siga orientação de serviço de saúde sobre tempo de conservação.",
            "Evite aquecer leite materno diretamente no fogo ou micro-ondas.",
          ],
        },
        {
          titulo: "Volta ao trabalho",
          icone: "briefcase-outline",
          cor: "#ffb300",
          lista: [
            "Planeje a rotina de ordenha com antecedência.",
            "Converse sobre pausas para retirada do leite.",
            "Teste formas de oferecer leite ao bebê antes do retorno.",
            "Mantenha rede de apoio informada sobre armazenamento e oferta.",
          ],
        },
        {
          titulo: "Alimentação de quem amamenta",
          icone: "nutrition-outline",
          cor: "#00c48c",
          texto:
            "Não existe uma dieta perfeita para todas as pessoas. Em geral, manter boa hidratação, alimentação variada e descanso quando possível ajuda. Restrições alimentares só devem ser feitas com orientação profissional.",
        },
        {
          titulo: "Uso de medicamentos",
          icone: "medkit-outline",
          cor: "#7050b3",
          texto:
            "Muitos medicamentos são compatíveis com amamentação, mas é importante consultar profissional de saúde antes de usar remédios, chás, suplementos ou produtos sem orientação.",
        },
        {
          titulo: "Quando buscar ajuda?",
          icone: "alert-circle-outline",
          cor: "#ff5ea8",
          lista: [
            "Bebê não ganha peso adequadamente.",
            "Poucas fraldas molhadas.",
            "Sonolência excessiva ou dificuldade para mamar.",
            "Dor forte ao amamentar.",
            "Febre, calafrios ou vermelhidão intensa na mama.",
            "Fissuras profundas ou sangramento persistente.",
            "Sensação de que não consegue continuar sozinha.",
          ],
        },
        {
          titulo: "Lembrete importante",
          icone: "bulb-outline",
          cor: "#ffb300",
          texto:
            "Amamentar não deve ser uma experiência solitária. Banco de leite humano, equipe de saúde, consultoria de amamentação e rede de apoio podem ajudar muito.",
        },
      ]}
    />
  );
}
