import BemEstarTemplate from "@/src/components/BemEstarTemplate";
import React from "react";

export default function Otite() {
  return (
    <BemEstarTemplate
      badge="Doenças Comuns"
      titulo="Otite"
      secoes={[
        {
          titulo: "Resumo",
          icone: "medical-outline",
          cor: "#7050b3",
          texto:
            "Otite é uma inflamação ou infecção no ouvido. Pode acontecer após resfriados, gripes ou congestão nasal, e é comum em crianças pequenas.",
        },
        {
          titulo: "Sintomas possíveis",
          icone: "list-outline",
          cor: "#ff5ea8",
          lista: [
            "Dor de ouvido.",
            "Febre.",
            "Irritabilidade.",
            "Choro ao deitar.",
            "Puxar ou mexer muito na orelha.",
            "Dificuldade para dormir.",
            "Saída de secreção pelo ouvido.",
            "Redução temporária da audição.",
          ],
        },
        {
          titulo: "Em bebês pequenos",
          icone: "alert-circle-outline",
          cor: "#ffb300",
          texto:
            "Bebês nem sempre conseguem mostrar onde dói. Irritabilidade intensa, febre, recusa de mamadas e choro ao deitar podem aparecer.",
        },
        {
          titulo: "Cuidados",
          icone: "home-outline",
          cor: "#00c48c",
          lista: [
            "Não pingar nada no ouvido sem orientação.",
            "Não usar cotonete dentro do ouvido.",
            "Manter a criança hidratada.",
            "Seguir medicação apenas se prescrita.",
            "Retornar ao serviço de saúde se houver piora.",
          ],
        },
        {
          titulo: "Quando procurar atendimento?",
          icone: "warning-outline",
          cor: "#ff5ea8",
          lista: [
            "Febre alta.",
            "Dor intensa.",
            "Secreção saindo do ouvido.",
            "Bebê menor de 6 meses com suspeita de dor de ouvido.",
            "Inchaço atrás da orelha.",
            "Sonolência, rigidez na nuca ou piora importante.",
          ],
        },
      ]}
    />
  );
}
