import React from "react";
import BemEstarTemplate from "@/src/components/bemEstarTemplate";

export default function AuxilioMaternidade() {
  return (
    <BemEstarTemplate
      badge="Auxílios e Direitos"
      titulo="Auxílio Maternidade"
      secoes={[
        {
          titulo: "Resumo",
          icone: "wallet-outline",
          cor: "#7050b3",
          texto:
            "O Auxílio Maternidade é conhecido oficialmente como Salário-Maternidade. É um benefício pago pelo INSS em situações de afastamento por nascimento de filho, adoção, guarda judicial para fins de adoção ou aborto não criminoso.",
        },

        {
          titulo: "Nome correto",
          icone: "information-circle-outline",
          cor: "#ff5ea8",
          texto:
            "Muitas pessoas chamam de Auxílio Maternidade, mas o nome usado pelo INSS é Salário-Maternidade. Em buscas oficiais, esse é o termo mais indicado.",
        },

        {
          titulo: "Para que serve?",
          icone: "heart-outline",
          cor: "#00c48c",
          texto:
            "O benefício ajuda a garantir renda durante o período em que a pessoa precisa se afastar das atividades por causa do nascimento, adoção, guarda para adoção ou situação prevista em lei.",
        },

        {
          titulo: "Quem pode solicitar?",
          icone: "people-outline",
          cor: "#7050b3",
          lista: [
            "Pessoa empregada.",
            "Empregada doméstica.",
            "Trabalhadora avulsa.",
            "Contribuinte individual.",
            "MEI, quando cumprir os requisitos aplicáveis.",
            "Segurada facultativa.",
            "Pessoa desempregada que ainda mantenha qualidade de segurada.",
            "Pessoa que adota ou obtém guarda judicial para fins de adoção.",
          ],
        },

        {
          titulo: "Situações atendidas",
          icone: "document-text-outline",
          cor: "#ffb300",
          lista: [
            "Nascimento de filho.",
            "Adoção.",
            "Guarda judicial para fins de adoção.",
            "Aborto não criminoso.",
            "Outras situações previstas nas regras do INSS.",
          ],
        },

        {
          titulo: "INSS",
          icone: "business-outline",
          cor: "#7050b3",
          texto:
            "O INSS é o órgão responsável por analisar pedidos de Salário-Maternidade em muitas situações. Dependendo do tipo de vínculo de trabalho, o procedimento pode variar.",
        },

        {
          titulo: "Empregada com carteira assinada",
          icone: "briefcase-outline",
          cor: "#00c48c",
          texto:
            "Quem trabalha com carteira assinada pode ter regras específicas sobre solicitação e pagamento. Em muitos casos, a empresa participa do processo conforme a legislação trabalhista e previdenciária.",
        },

        {
          titulo: "MEI",
          icone: "storefront-outline",
          cor: "#ff5ea8",
          texto:
            "A pessoa MEI pode ter direito ao Salário-Maternidade se estiver enquadrada nas regras previdenciárias. É importante verificar a situação das contribuições e consultar os canais oficiais do INSS.",
        },

        {
          titulo: "Desempregada",
          icone: "person-outline",
          cor: "#7050b3",
          texto:
            "A pessoa desempregada pode ter direito se ainda mantiver a qualidade de segurada. Essa condição depende da relação anterior com a Previdência e do tempo desde a última contribuição.",
        },

        {
          titulo: "Adoção",
          icone: "home-outline",
          cor: "#00c48c",
          texto:
            "O Salário-Maternidade também pode ser solicitado em caso de adoção ou guarda judicial para fins de adoção, respeitando as regras aplicáveis ao benefício.",
        },

        {
          titulo: "Documentos comuns",
          icone: "file-tray-full-outline",
          cor: "#ffb300",
          lista: [
            "Documento de identificação.",
            "CPF.",
            "Certidão de nascimento da criança.",
            "Termo de guarda ou adoção, quando for o caso.",
            "Documentos de contribuição, quando necessário.",
            "Carteira de trabalho ou documentos do vínculo, quando aplicável.",
            "Informações solicitadas pelo Meu INSS.",
          ],
        },

        {
          titulo: "Como solicitar?",
          icone: "phone-portrait-outline",
          cor: "#7050b3",
          texto:
            "A solicitação pode ser feita pelos canais oficiais do INSS, como o Meu INSS. Em caso de dúvida, a pessoa pode buscar orientação pelo próprio atendimento do INSS.",
        },

        {
          titulo: "Meu INSS",
          icone: "apps-outline",
          cor: "#00c48c",
          texto:
            "O Meu INSS permite solicitar benefícios, acompanhar pedidos, enviar documentos e consultar informações previdenciárias. Use sempre canais oficiais.",
        },

        {
          titulo: "Atenção aos dados",
          icone: "warning-outline",
          cor: "#ff5ea8",
          lista: [
            "Confira se CPF e dados pessoais estão corretos.",
            "Verifique se os documentos estão legíveis.",
            "Acompanhe o pedido após enviar.",
            "Responda exigências dentro do prazo, se houver.",
            "Guarde comprovantes e protocolos.",
          ],
        },

        {
          titulo: "Diferença entre licença e benefício",
          icone: "git-compare-outline",
          cor: "#7050b3",
          texto:
            "Licença-maternidade é o afastamento do trabalho. Salário-Maternidade é o benefício financeiro. Eles se relacionam, mas não são exatamente a mesma coisa.",
        },

        {
          titulo: "Golpes",
          icone: "shield-checkmark-outline",
          cor: "#ffb300",
          texto:
            "Cuidado com mensagens prometendo liberação imediata mediante pagamento. Use apenas canais oficiais e não envie documentos pessoais por links suspeitos.",
        },

        {
          titulo: "Quando pedir orientação?",
          icone: "help-circle-outline",
          cor: "#00c48c",
          lista: [
            "Quando o pedido for negado.",
            "Quando houver dúvida sobre qualidade de segurada.",
            "Quando existirem contribuições em atraso.",
            "Quando houver adoção ou guarda judicial.",
            "Quando o vínculo de trabalho tiver situação diferente.",
            "Quando o sistema solicitar documentos adicionais.",
          ],
        },

        {
          titulo: "Organização antes do pedido",
          icone: "checkbox-outline",
          cor: "#7050b3",
          lista: [
            "Separe documentos pessoais.",
            "Tenha certidão de nascimento ou documento equivalente.",
            "Verifique acesso ao Meu INSS.",
            "Atualize dados de contato.",
            "Anote protocolo do pedido.",
            "Acompanhe a análise regularmente.",
          ],
        },

        {
          titulo: "Mensagem final",
          icone: "bulb-outline",
          cor: "#ff5ea8",
          texto:
            "O Salário-Maternidade é um direito importante para proteger a renda no período de chegada ou acolhimento de uma criança. Conferir as regras oficiais e manter documentos organizados facilita o processo.",
        },
      ]}
      linkTitulo="Consultar fonte oficial"
      linkTexto="Acesse informações oficiais do Governo Federal sobre o Salário-Maternidade."
      linkUrl="https://www.gov.br/pt-br/servicos/solicitar-salario-maternidade-urbano"
    />
  );
}