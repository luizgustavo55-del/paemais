import BemEstarTemplate from "@/src/components/bemEstarTemplate";
import React from "react";

export default function IsolamentoSocial() {
  return (
    <BemEstarTemplate
      badge="Rede de Apoio"
      titulo="Isolamento Social na Maternidade e Paternidade"
      secoes={[
        {
          titulo: "Resumo",
          icone: "people-outline",
          cor: "#7050b3",
          texto:
            "Depois da chegada de uma criança, muitos pais e mães acabam se afastando de amigos, familiares e atividades sociais. A rotina muda, o cansaço aumenta e sair de casa pode parecer muito mais difícil.",
        },
        {
          titulo: "Por que o isolamento acontece?",
          icone: "help-circle-outline",
          cor: "#ff5ea8",
          texto:
            "O isolamento pode surgir pela falta de tempo, pela vergonha de pedir ajuda, pelo medo de julgamentos, pela exaustão ou pela sensação de que ninguém entende o que você está vivendo.",
        },
        {
          titulo: "Sinais de isolamento",
          icone: "alert-circle-outline",
          cor: "#ffb300",
          lista: [
            "Evitar conversar com outras pessoas.",
            "Sentir que perdeu contato com amigos.",
            "Passar muitos dias sem sair de casa.",
            "Sentir solidão mesmo estando com o bebê.",
            "Achar que ninguém entenderia seus sentimentos.",
            "Responder mensagens apenas quando está no limite.",
          ],
        },
        {
          titulo: "Por que isso pesa?",
          icone: "sad-outline",
          cor: "#7050b3",
          texto:
            "A falta de contato social pode aumentar a sensação de tristeza, ansiedade e esgotamento. Pais e mães também precisam de escuta, companhia e acolhimento.",
        },
        {
          titulo: "Como se aproximar aos poucos",
          icone: "chatbubble-ellipses-outline",
          cor: "#00c48c",
          lista: [
            "Envie uma mensagem simples para alguém de confiança.",
            "Convide alguém para uma visita curta.",
            "Participe de grupos de mães, pais ou cuidadores.",
            "Faça pequenas saídas, como uma caminhada curta.",
            "Converse com outras famílias que vivem fases parecidas.",
            "Aceite ajuda sem se sentir culpado.",
          ],
        },
        {
          titulo: "Rede de apoio não precisa ser grande",
          icone: "heart-outline",
          cor: "#ff5ea8",
          texto:
            "Uma rede de apoio pode ser formada por poucas pessoas, desde que sejam respeitosas e confiáveis. Pode ser um familiar, amigo, vizinho, profissional de saúde ou grupo comunitário.",
        },
        {
          titulo: "Cuidado com comparações",
          icone: "eye-off-outline",
          cor: "#7050b3",
          texto:
            "Nas redes sociais, muitas famílias mostram apenas momentos bonitos. Isso pode aumentar a sensação de solidão ou fracasso. Lembre-se: toda família enfrenta dificuldades que nem sempre aparecem nas fotos.",
        },
        {
          titulo: "Quando ligar o alerta?",
          icone: "medkit-outline",
          cor: "#ff5ea8",
          texto:
            "Se o isolamento vier junto de tristeza profunda, falta de vontade de viver, medo constante, irritação extrema ou sensação de abandono, procure ajuda profissional ou uma pessoa de confiança imediatamente.",
        },
        {
          titulo: "Lembrete importante",
          icone: "bulb-outline",
          cor: "#ffb300",
          texto:
            "Você não precisa viver essa fase sozinho. A criança precisa de cuidado, mas quem cuida também precisa ser cuidado.",
        },
      ]}
    />
  );
}
