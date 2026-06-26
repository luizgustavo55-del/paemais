import React from "react";
import BemEstarTemplate from "@/src/components/bemEstarTemplate";

export default function BolsaFamilia() {
  return (
    <BemEstarTemplate
      badge="Auxílios e Direitos"
      titulo="Bolsa Família"
      secoes={[
        {
          titulo: "Resumo",
          icone: "cash-outline",
          cor: "#7050b3",
          texto:
            "O Bolsa Família é um programa de transferência de renda voltado a famílias em situação de pobreza. Além de ajudar financeiramente, o programa também se conecta a áreas como saúde, educação e assistência social.",
        },

        {
          titulo: "Objetivo do programa",
          icone: "heart-outline",
          cor: "#ff5ea8",
          texto:
            "O objetivo é apoiar famílias vulneráveis, reduzir a pobreza e fortalecer o acesso a direitos básicos, como alimentação, escola, vacinação, acompanhamento de saúde e proteção social.",
        },

        {
          titulo: "Quem pode ter direito?",
          icone: "people-outline",
          cor: "#00c48c",
          texto:
            "A regra principal envolve a renda por pessoa da família. Também é necessário que a família esteja inscrita no Cadastro Único com dados corretos e atualizados.",
        },

        {
          titulo: "Renda por pessoa",
          icone: "calculator-outline",
          cor: "#7050b3",
          texto:
            "Para entender a renda por pessoa, some todos os rendimentos mensais da família e divida pelo número de moradores da casa. Essa conta ajuda a verificar se a família se enquadra nos critérios do programa.",
        },

        {
          titulo: "Exemplo simples",
          icone: "information-circle-outline",
          cor: "#ffb300",
          texto:
            "Se uma família recebe R$ 1.000 por mês e tem 5 pessoas morando na mesma casa, a renda por pessoa é R$ 200. Esse cálculo é importante para programas sociais.",
        },

        {
          titulo: "Cadastro Único",
          icone: "id-card-outline",
          cor: "#00c48c",
          texto:
            "Estar no Cadastro Único é essencial para que a família possa ser avaliada. Porém, estar cadastrada não significa entrada automática no Bolsa Família, pois o programa segue regras e disponibilidade de seleção.",
        },

        {
          titulo: "Famílias com crianças",
          icone: "happy-outline",
          cor: "#ff5ea8",
          texto:
            "Famílias com crianças pequenas podem ter acompanhamento especial em saúde e educação. Por isso, é importante manter os dados das crianças atualizados no CadÚnico.",
        },

        {
          titulo: "Famílias com gestantes",
          icone: "heart-circle-outline",
          cor: "#7050b3",
          texto:
            "Gestantes devem informar essa condição no atendimento de saúde e manter acompanhamento pré-natal. A presença de gestante na família pode ser considerada em benefícios e acompanhamentos específicos.",
        },

        {
          titulo: "Condicionalidades",
          icone: "checkbox-outline",
          cor: "#00c48c",
          texto:
            "As condicionalidades são compromissos nas áreas de saúde e educação. Elas ajudam a garantir que crianças, adolescentes e gestantes sejam acompanhados pelos serviços públicos.",
        },

        {
          titulo: "Na saúde",
          icone: "medkit-outline",
          cor: "#7050b3",
          lista: [
            "Manter vacinação das crianças em dia.",
            "Acompanhar crescimento e desenvolvimento infantil.",
            "Realizar pré-natal quando houver gestante.",
            "Comparecer aos acompanhamentos solicitados pela unidade de saúde.",
            "Informar mudanças importantes à equipe de saúde.",
          ],
        },

        {
          titulo: "Na educação",
          icone: "school-outline",
          cor: "#ffb300",
          lista: [
            "Manter crianças e adolescentes matriculados.",
            "Acompanhar frequência escolar.",
            "Informar mudanças de escola.",
            "Conversar com a escola quando houver faltas frequentes.",
            "Manter dados escolares atualizados no CadÚnico quando solicitado.",
          ],
        },

        {
          titulo: "Pagamento",
          icone: "card-outline",
          cor: "#00c48c",
          texto:
            "O pagamento costuma seguir calendário definido pelo governo, geralmente relacionado ao Número de Identificação Social, o NIS. A família deve consultar canais oficiais para conferir datas e situação do benefício.",
        },

        {
          titulo: "NIS",
          icone: "document-text-outline",
          cor: "#7050b3",
          texto:
            "O NIS é um número de identificação usado em programas sociais. Ele pode ser consultado nos canais oficiais do CadÚnico ou em documentos relacionados aos benefícios sociais.",
        },

        {
          titulo: "Atualização cadastral",
          icone: "sync-outline",
          cor: "#ff5ea8",
          texto:
            "Mudanças na renda, endereço, escola, nascimento de bebê ou composição familiar devem ser atualizadas no CadÚnico. Isso evita problemas na análise ou manutenção do benefício.",
        },

        {
          titulo: "Possíveis motivos de bloqueio",
          icone: "warning-outline",
          cor: "#ffb300",
          lista: [
            "Cadastro desatualizado.",
            "Informações inconsistentes.",
            "Renda acima do limite permitido.",
            "Falta de acompanhamento de saúde ou educação.",
            "Mudança familiar não informada.",
            "Solicitação de revisão pelo governo.",
          ],
        },

        {
          titulo: "O que fazer em caso de dúvida?",
          icone: "help-circle-outline",
          cor: "#7050b3",
          lista: [
            "Procurar o CRAS.",
            "Consultar o aplicativo oficial, quando disponível.",
            "Verificar a situação do CadÚnico.",
            "Conferir se os dados da família estão corretos.",
            "Evitar confiar em mensagens sem fonte oficial.",
          ],
        },

        {
          titulo: "Golpes e cuidados",
          icone: "shield-checkmark-outline",
          cor: "#ff5ea8",
          texto:
            "Desconfie de mensagens prometendo liberação imediata, links suspeitos ou pedidos de pagamento para receber benefício. Serviços públicos como CadÚnico e Bolsa Família não devem exigir pagamento para cadastro.",
        },

        {
          titulo: "Organização familiar",
          icone: "calendar-outline",
          cor: "#00c48c",
          texto:
            "Guarde documentos, acompanhe calendário, mantenha vacinação e frequência escolar em dia e atualize o cadastro sempre que a realidade da família mudar.",
        },

        {
          titulo: "Mensagem final",
          icone: "bulb-outline",
          cor: "#7050b3",
          texto:
            "O Bolsa Família pode ser um apoio importante para famílias com crianças. Para evitar problemas, mantenha o Cadastro Único atualizado e acompanhe os compromissos de saúde e educação.",
        },
      ]}
      linkTitulo="Consultar fonte oficial"
      linkTexto="Acesse informações oficiais do Governo Federal sobre o Bolsa Família."
      linkUrl="https://www.gov.br/mds/pt-br/acoes-e-programas/bolsa-familia"
    />
  );
}