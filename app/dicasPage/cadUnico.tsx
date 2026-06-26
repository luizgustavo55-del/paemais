import React from "react";
import BemEstarTemplate from "@/src/components/bemEstarTemplate";

export default function CadUnico() {
  return (
    <BemEstarTemplate
      badge="Auxílios e Direitos"
      titulo="Cadastro Único"
      secoes={[
        {
          titulo: "Resumo",
          icone: "id-card-outline",
          cor: "#7050b3",
          texto:
            "O Cadastro Único, também chamado de CadÚnico, é uma ferramenta usada pelo Governo Federal para identificar e conhecer melhor as famílias de baixa renda no Brasil. Ele reúne informações sobre moradia, renda, composição familiar, escolaridade, trabalho e outras condições importantes.",
        },

        {
          titulo: "Para que serve?",
          icone: "help-circle-outline",
          cor: "#ff5ea8",
          texto:
            "O CadÚnico não é um benefício em dinheiro. Ele é uma porta de entrada para vários programas sociais. Estar inscrito não garante automaticamente o recebimento de todos os auxílios, mas permite que a família seja analisada conforme as regras de cada programa.",
        },

        {
          titulo: "Por que é importante para famílias?",
          icone: "people-outline",
          cor: "#00c48c",
          texto:
            "Para famílias com crianças pequenas, gestantes ou pessoas em situação de vulnerabilidade, o CadÚnico ajuda o poder público a entender a realidade familiar e direcionar políticas públicas, benefícios e acompanhamentos sociais.",
        },

        {
          titulo: "Quem pode se cadastrar?",
          icone: "person-add-outline",
          cor: "#7050b3",
          lista: [
            "Famílias de baixa renda.",
            "Famílias que precisam acessar programas sociais.",
            "Famílias com crianças, gestantes, idosos ou pessoas com deficiência.",
            "Pessoas que moram sozinhas e se enquadram nos critérios sociais.",
            "Famílias em situação de vulnerabilidade social.",
            "Famílias acompanhadas por serviços da assistência social.",
          ],
        },

        {
          titulo: "Onde fazer o cadastro?",
          icone: "location-outline",
          cor: "#ffb300",
          texto:
            "O cadastro geralmente é feito presencialmente em um posto de atendimento do Cadastro Único ou no CRAS do município. A prefeitura é responsável por organizar esse atendimento local.",
        },

        {
          titulo: "CRAS",
          icone: "home-outline",
          cor: "#00c48c",
          texto:
            "O CRAS é o Centro de Referência de Assistência Social. Ele costuma ser o principal local para orientação sobre CadÚnico, Bolsa Família e outros serviços socioassistenciais.",
        },

        {
          titulo: "Documentos importantes",
          icone: "document-text-outline",
          cor: "#7050b3",
          lista: [
            "CPF do responsável familiar.",
            "Documento de identificação dos membros da família.",
            "Comprovante de residência, quando houver.",
            "Certidão de nascimento ou casamento, quando houver.",
            "Carteira de trabalho, se houver.",
            "Comprovante de matrícula escolar das crianças, se solicitado.",
            "Documentos que ajudem a comprovar a composição da família.",
          ],
        },

        {
          titulo: "Responsável familiar",
          icone: "person-circle-outline",
          cor: "#ff5ea8",
          texto:
            "Normalmente uma pessoa da família fica responsável por prestar as informações. É importante que ela conheça bem a rotina, os moradores da casa, a renda familiar e as despesas principais.",
        },

        {
          titulo: "Informações registradas",
          icone: "clipboard-outline",
          cor: "#00c48c",
          lista: [
            "Endereço da família.",
            "Quantidade de pessoas na casa.",
            "Dados de cada membro da família.",
            "Renda familiar.",
            "Escolaridade.",
            "Situação de trabalho.",
            "Características da moradia.",
            "Existência de pessoas com deficiência.",
            "Outras informações sociais relevantes.",
          ],
        },

        {
          titulo: "Atualização do cadastro",
          icone: "sync-outline",
          cor: "#7050b3",
          texto:
            "Manter o CadÚnico atualizado é essencial. Mudanças de endereço, renda, escola, nascimento de criança, falecimento, separação, casamento ou alteração na composição familiar devem ser informadas.",
        },

        {
          titulo: "Quando atualizar?",
          icone: "calendar-outline",
          cor: "#ffb300",
          lista: [
            "Quando nascer um bebê.",
            "Quando alguém sair ou entrar na casa.",
            "Quando mudar de endereço.",
            "Quando mudar a renda da família.",
            "Quando a criança trocar de escola.",
            "Quando houver alteração de telefone.",
            "Quando solicitado pelo município ou pelo governo.",
          ],
        },

        {
          titulo: "CadÚnico e Bolsa Família",
          icone: "cash-outline",
          cor: "#00c48c",
          texto:
            "O Bolsa Família usa informações do CadÚnico para avaliar famílias que podem receber o benefício. Por isso, dados incorretos ou desatualizados podem dificultar o acesso ao programa.",
        },

        {
          titulo: "CadÚnico e gestantes",
          icone: "heart-outline",
          cor: "#ff5ea8",
          texto:
            "Gestantes em famílias de baixa renda devem manter seus dados atualizados, pois alguns programas consideram a presença de gestante na família para acompanhamento social, saúde e benefícios específicos.",
        },

        {
          titulo: "CadÚnico e crianças",
          icone: "happy-outline",
          cor: "#7050b3",
          texto:
            "Crianças pequenas precisam estar corretamente registradas na composição familiar. Isso ajuda no acesso a políticas de proteção, renda, saúde, educação e assistência social.",
        },

        {
          titulo: "Cuidados importantes",
          icone: "warning-outline",
          cor: "#ffb300",
          lista: [
            "Não omita informações sobre renda.",
            "Não informe endereço falso.",
            "Não deixe de incluir membros da família que moram na casa.",
            "Guarde comprovantes e documentos importantes.",
            "Atualize o cadastro sempre que houver mudança.",
            "Procure o CRAS em caso de dúvida.",
          ],
        },

        {
          titulo: "O que o CadÚnico não faz?",
          icone: "close-circle-outline",
          cor: "#ff5ea8",
          lista: [
            "Não garante automaticamente qualquer benefício.",
            "Não substitui análise de cada programa social.",
            "Não elimina a necessidade de manter dados atualizados.",
            "Não deve ser feito com informações falsas.",
            "Não é um cartão de pagamento.",
          ],
        },

        {
          titulo: "Como consultar?",
          icone: "phone-portrait-outline",
          cor: "#7050b3",
          texto:
            "Quem já está inscrito pode consultar informações como NIS, código familiar, situação cadastral e data da última atualização por canais oficiais do Cadastro Único.",
        },

        {
          titulo: "Dica para famílias",
          icone: "bulb-outline",
          cor: "#00c48c",
          texto:
            "Antes de ir ao atendimento, organize os documentos da família e anote informações importantes, como renda, escola das crianças, endereço completo e telefone atualizado.",
        },

        {
          titulo: "Mensagem final",
          icone: "shield-checkmark-outline",
          cor: "#7050b3",
          texto:
            "O Cadastro Único é uma forma de tornar a realidade da família visível para as políticas públicas. Para quem cuida de crianças, manter esse cadastro correto pode ser um passo importante de proteção e acesso a direitos.",
        },
      ]}
      linkTitulo="Consultar fonte oficial"
      linkTexto="Acesse informações oficiais do Governo Federal sobre o Cadastro Único."
      linkUrl="https://www.gov.br/pt-br/servicos/inscrever-se-no-cadastro-unico-para-programas-sociais-do-governo-federal"
    />
  );
}