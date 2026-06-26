import BemEstarTemplate from "@/src/components/BemEstarTemplate";
import React from "react";

export default function TrabalhoFamilia() {
  return (
    <BemEstarTemplate
      badge="Rotina Familiar"
      titulo="Equilibrar Trabalho e Família"
      secoes={[
        {
          titulo: "Resumo",
          icone: "briefcase-outline",
          cor: "#7050b3",
          texto:
            "Conciliar trabalho, casa, filhos, relacionamento e vida pessoal pode ser uma das partes mais difíceis da maternidade e da paternidade. Muitas famílias sentem que estão sempre correndo e nunca dando conta de tudo.",
        },
        {
          titulo: "Por que é tão difícil?",
          icone: "help-circle-outline",
          cor: "#ff5ea8",
          texto:
            "O trabalho exige produtividade, horários e responsabilidade. A família exige presença, cuidado e atenção emocional. Quando essas demandas se acumulam, pais e mães podem sentir culpa, cansaço e pressão constante.",
        },
        {
          titulo: "Dificuldades comuns",
          icone: "alert-circle-outline",
          cor: "#ffb300",
          lista: [
            "Sentir culpa por trabalhar demais.",
            "Sentir culpa por não produzir como antes.",
            "Levar preocupações do trabalho para casa.",
            "Não conseguir descansar nos momentos livres.",
            "Ter dificuldade para separar horários.",
            "Sentir que está falhando em todos os lugares.",
          ],
        },
        {
          titulo: "Organização possível",
          icone: "calendar-outline",
          cor: "#00c48c",
          lista: [
            "Defina prioridades do dia, não uma lista impossível.",
            "Separe horários para trabalho, casa e descanso quando possível.",
            "Use agenda ou lembretes para compromissos importantes.",
            "Combine responsabilidades com quem divide a rotina.",
            "Prepare algumas coisas com antecedência, sem buscar perfeição.",
            "Aceite que alguns dias serão apenas o básico possível.",
          ],
        },
        {
          titulo: "Conversas importantes",
          icone: "chatbubbles-outline",
          cor: "#7050b3",
          texto:
            "Quando possível, converse com o parceiro, familiares ou rede de apoio sobre divisão de tarefas. No trabalho, se houver abertura, explique necessidades específicas da fase familiar que você está vivendo.",
        },
        {
          titulo: "A culpa não deve guiar tudo",
          icone: "heart-outline",
          cor: "#ff5ea8",
          texto:
            "Trabalhar não significa amar menos. Precisar de ajuda não significa incapacidade. Ter limites não significa falta de compromisso. A família precisa de presença, mas também precisa de adultos minimamente descansados.",
        },
        {
          titulo: "Pequenos vínculos no dia a dia",
          icone: "happy-outline",
          cor: "#00c48c",
          lista: [
            "Fazer uma refeição juntos quando possível.",
            "Conversar alguns minutos sem celular.",
            "Criar um ritual antes de dormir.",
            "Abraçar, brincar ou ler algo curto.",
            "Valorizar qualidade de presença, não apenas quantidade de tempo.",
          ],
        },
        {
          titulo: "Sinais de sobrecarga",
          icone: "pulse-outline",
          cor: "#ffb300",
          lista: [
            "Cansaço constante.",
            "Irritação frequente.",
            "Esquecimentos recorrentes.",
            "Sensação de estar sempre atrasado.",
            "Dificuldade para sentir prazer em momentos familiares.",
          ],
        },
        {
          titulo: "Lembrete importante",
          icone: "bulb-outline",
          cor: "#7050b3",
          texto:
            "Equilíbrio não significa fazer tudo perfeitamente. Muitas vezes, equilíbrio é ajustar expectativas, dividir responsabilidades e reconhecer o que é possível em cada fase.",
        },
      ]}
    />
  );
}
