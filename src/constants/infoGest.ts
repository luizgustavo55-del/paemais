// 🔹 Tipagem de cada semana
type Semana = {
  tamanho: string;
  peso: string;
  fruta: string;
  emoji: string;
  desenvolvimento: string;
  curiosidades: string[];
    orgaos?: string[];
};
export const dadosSemanas: Record<number, Semana> ={
  1: {
    tamanho: "0 cm",
    peso: "0 g",
    fruta: "Nenhuma",
    emoji: "🩸",
    desenvolvimento: "Início do ciclo menstrual, ainda não há gravidez.",
    curiosidades: [
      "A contagem da gravidez começa aqui.",
      "Ainda não existe embrião.",
      "O corpo começa a se preparar para uma possível gestação."
    ]
  },
  2: {
    tamanho: "0 cm",
    peso: "0 g",
    fruta: "Óvulo",
    emoji: "🥚",
    desenvolvimento: "A ovulação ocorre e o corpo se prepara para a fecundação.",
    curiosidades: [
      "O óvulo é liberado.",
      "É o período de maior fertilidade.",
      "O revestimento do útero engrossa para receber o embrião."
    ]
  },
  3: {
    tamanho: "0.1 mm",
    peso: "0 g",
    fruta: "Grão de baunilha",
    emoji: "✨",
    desenvolvimento: "A fecundação ocorre e o zigoto começa a se dividir rapidamente.",
    curiosidades: [
      "O DNA do bebê (cor dos olhos, cabelo, sexo) já está definido.",
      "O embrião viaja pelas trompas até o útero.",
      "Ainda não há sintomas perceptíveis de gravidez."
    ]
  },
  4: {
    tamanho: "0.2 mm",
    peso: "0 g",
    fruta: "Semente de papoula",
    emoji: "🌱",
    desenvolvimento: "Ocorre a implantação no útero. Oficialmente grávida!",
    curiosidades: [
      "O teste de farmácia já pode dar positivo.",
      "Início da formação do saco gestacional e placenta.",
      "Você pode sentir cólicas leves de nidação."
    ]
  },
  5: {
    tamanho: "2 mm",
    peso: "< 1 g",
    fruta: "Semente de maçã",
    emoji: "🍎",
    desenvolvimento: "O tubo neural, o coração e outros órgãos começam a se formar.",
    curiosidades: [
      "O coraçãozinho começa a bater.",
      "O sistema nervoso está em pleno desenvolvimento.",
      "Os primeiros sintomas, como enjoos e cansaço, podem aparecer."
    ]
  },
  6: {
    tamanho: "5 mm",
    peso: "< 1 g",
    fruta: "Ervilha",
    emoji: "🫛",
    desenvolvimento: "Desenvolvimento rápido do cérebro, sistema nervoso e traços faciais.",
    curiosidades: [
      "O coração bate a cerca de 150 vezes por minuto.",
      "Pequenos brotos que formarão braços e pernas surgem.",
      "Os olhos e ouvidos começam a tomar forma."
    ]
  },
  7: {
    tamanho: "1 cm",
    peso: "1 g",
    fruta: "Mirtilo",
    emoji: "🫐",
    desenvolvimento: "As articulações dos braços e pernas começam a se formar.",
    curiosidades: [
      "O cérebro cresce rapidamente, gerando novas células por minuto.",
      "Os rins estão prontos para começar a trabalhar.",
      "O cordão umbilical já formou uma conexão forte com você."
    ]
  },
  8: {
    tamanho: "1.6 cm",
    peso: "1 g",
    fruta: "Framboesa",
    emoji: "🍓",
    desenvolvimento: "Inicia-se a fase de transição de embrião para feto.",
    curiosidades: [
      "Dedos das mãos e dos pés começam a se separar.",
      "As pálpebras estão se formando sobre os olhos.",
      "O bebê faz pequenos movimentos espasmódicos (imperceptíveis)."
    ]
  },
  9: {
    tamanho: "2.3 cm",
    peso: "2 g",
    fruta: "Uva verde",
    emoji: "🍇",
    desenvolvimento: "Agora oficialmente um feto! Todos os órgãos essenciais estão no lugar.",
    curiosidades: [
      "A cauda embrionária desapareceu completamente.",
      "Os músculos começam a se desenvolver.",
      "O formato do rosto fica mais humano."
    ]
  },
  10: {
    tamanho: "3.1 cm",
    peso: "4 g",
    fruta: "Morango",
    emoji: "🍓",
    desenvolvimento: "Ossos e cartilagens começam a se solidificar.",
    curiosidades: [
      "O coração está totalmente formado e batendo forte.",
      "Os dentes começam a se formar sob as gengivas.",
      "As unhas começam a surgir."
    ]
  },
  11: {
    tamanho: "4.1 cm",
    peso: "7 g",
    fruta: "Figo",
    emoji: "🍈",
    desenvolvimento: "Os órgãos genitais começam a se diferenciar rapidamente.",
    curiosidades: [
      "A cabeça do bebê representa quase metade do tamanho do corpo.",
      "Os folículos capilares estão se desenvolvendo.",
      "Ele já consegue abrir e fechar as mãos e engolir."
    ]
  },
  12: {
    tamanho: "5.4 cm",
    peso: "14 g",
    fruta: "Limão",
    emoji: "🍋",
    desenvolvimento: "Fim do primeiro trimestre! Os órgãos passam a amadurecer.",
    curiosidades: [
      "Os rins do bebê já começam a produzir urina.",
      "Os reflexos se tornam mais rápidos.",
      "O risco de aborto espontâneo diminui significativamente."
    ]
  },
  13: {
    tamanho: "7.4 cm",
    peso: "23 g",
    fruta: "Pêssego",
    emoji: "🍑",
    desenvolvimento: "Início do segundo trimestre. O corpo começa a crescer mais rápido que a cabeça.",
    curiosidades: [
      "As impressões digitais começam a se formar nas pontinhas dos dedos.",
      "Os intestinos, que cresciam no cordão umbilical, movem-se para o abdômen.",
      "Suas cordas vocais começam a se desenvolver."
    ]
  },
  14: {
    tamanho: "8.7 cm",
    peso: "43 g",
    fruta: "Kiwi",
    emoji: "🥝",
    desenvolvimento: "O bebê ganha mais proporção e a tireoide começa a funcionar.",
    curiosidades: [
      "Ele já faz expressões faciais (finge sorrir, franzir a testa).",
      "Pode começar a chupar o dedo no útero.",
      "Uma penugem fina chamada lanugo começa a cobrir o corpo."
    ]
  },
  15: {
    tamanho: "10.1 cm",
    peso: "70 g",
    fruta: "Maçã",
    emoji: "🍎",
    desenvolvimento: "Os ossos ficam mais duros e retêm mais cálcio.",
    curiosidades: [
      "O bebê consegue ouvir sons abafados (seu coração, digestão).",
      "As pernas já são maiores que os braços.",
      "Os olhos estão se movendo para a frente do rosto."
    ]
  },
  16: {
    tamanho: "11.6 cm",
    peso: "100 g",
    fruta: "Abacate",
    emoji: "🥑",
    desenvolvimento: "Músculos das costas ganham força, permitindo que o bebê endireite a cabeça.",
    curiosidades: [
      "Pode ser possível sentir os primeiros movimentos (como 'borboletas').",
      "O couro cabeludo começa a desenhar o padrão do cabelo.",
      "O coração bombeia cerca de 23 litros de sangue por dia."
    ]
  },
  17: {
    tamanho: "13 cm",
    peso: "140 g",
    fruta: "Pera",
    emoji: "🍐",
    desenvolvimento: "Formação da cartilagem que depois se transformará em osso.",
    curiosidades: [
      "O bebê começa a acumular gordura corporal para se manter aquecido.",
      "Ele já possui um padrão de sono e vigília.",
      "O cordão umbilical está mais espesso e forte."
    ]
  },
  18: {
    tamanho: "14.2 cm",
    peso: "190 g",
    fruta: "Batata-doce",
    emoji: "🍠",
    desenvolvimento: "Os nervos estão se cobrindo de mielina, acelerando a comunicação com o cérebro.",
    curiosidades: [
      "Ele pode se assustar com barulhos altos do lado de fora.",
      "Meninas já têm o útero e as trompas de Falópio no lugar.",
      "Os movimentos ficam cada vez mais evidentes."
    ]
  },
  19: {
    tamanho: "15.3 cm",
    peso: "240 g",
    fruta: "Manga",
    emoji: "🥭",
    desenvolvimento: "O corpo é coberto por uma substância branca e espessa chamada vérnix caseoso.",
    curiosidades: [
      "O vérnix protege a pele do bebê do líquido amniótico.",
      "Os sentidos (paladar, audição, visão) desenvolvem-se rapidamente.",
      "Os rins produzem urina regularmente."
    ]
  },
  20: {
    tamanho: "16.4 cm",
    peso: "300 g",
    fruta: "Banana",
    emoji: "🍌",
    desenvolvimento: "Metade da gestação! Crescimento contínuo e desenvolvimento muscular.",
    curiosidades: [
      "As unhas chegam até as pontas dos dedos.",
      "O bebê pode reconhecer a sua voz com mais clareza.",
      "Geralmente é nesta fase que se faz o exame morfológico."
    ]
  },
  21: {
    tamanho: "26.7 cm",
    peso: "360 g",
    fruta: "Cenoura",
    emoji: "🥕",
    desenvolvimento: "O cérebro cresce muito e os movimentos passam a ser fortes e coordenados.",
    curiosidades: [
      "Agora os médicos passam a medir o bebê da cabeça aos pés (por isso o salto no tamanho!).",
      "Ele engole bastante líquido amniótico para treinar o sistema digestivo.",
      "Sobrancelhas e cílios já estão presentes."
    ]
  },
  22: {
    tamanho: "27.8 cm",
    peso: "430 g",
    fruta: "Mamão",
    emoji: "🍈",
    desenvolvimento: "Olhos e lábios estão formados. O desenvolvimento do pâncreas continua.",
    curiosidades: [
      "Ele já percebe a claridade da luz através da sua pele.",
      "Pode começar a ter picos de atividade em horários específicos.",
      "O aperto de mão do bebê já é consideravelmente forte."
    ]
  },
  23: {
    tamanho: "28.9 cm",
    peso: "500 g",
    fruta: "Milho",
    emoji: "🌽",
    desenvolvimento: "Os pulmões começam a produzir surfactante, substância essencial para respirar fora do útero.",
    curiosidades: [
      "O bebê já parece um recém-nascido, só que mais fininho.",
      "Os vasos sanguíneos nos pulmões estão se desenvolvendo.",
      "O cérebro e a audição estão muito mais conectados."
    ]
  },
  24: {
    tamanho: "30 cm",
    peso: "600 g",
    fruta: "Romã",
    emoji: "🍎",
    desenvolvimento: "O ouvido interno (responsável pelo equilíbrio) se desenvolve completamente.",
    curiosidades: [
      "Ele sabe quando está de cabeça para baixo ou para cima.",
      "O bebê pode ter soluços, que você sentirá como pequenos espasmos.",
      "A pele ainda é fina e translúcida."
    ]
  },
  25: {
    tamanho: "34.6 cm",
    peso: "660 g",
    fruta: "Couve-flor",
    emoji: "🥦",
    desenvolvimento: "Os capilares (vasos sanguíneos minúsculos) estão se formando sob a pele.",
    curiosidades: [
      "O cabelo do bebê está ganhando cor e textura.",
      "Ele já consegue fechar as mãos em punhos.",
      "As vias respiratórias inferiores dos pulmões começam a se desenvolver."
    ]
  },
  26: {
    tamanho: "35.6 cm",
    peso: "760 g",
    fruta: "Alface",
    emoji: "🥬",
    desenvolvimento: "A rede de nervos nos ouvidos do bebê está mais sensível e desenvolvida.",
    curiosidades: [
      "Ele pode começar a responder ativamente a músicas.",
      "Os olhos do bebê começam a se abrir parcialmente.",
      "Os padrões de ondas cerebrais já se assemelham aos de um recém-nascido."
    ]
  },
  27: {
    tamanho: "36.6 cm",
    peso: "875 g",
    fruta: "Couve-rábano",
    emoji: "🧅",
    desenvolvimento: "Final do segundo trimestre. O cérebro está altamente ativo.",
    curiosidades: [
      "O bebê consegue regular sua própria temperatura corporal.",
      "Pode chupar o dedo com frequência para se acalmar.",
      "Ele reconhece a diferença entre a voz da mãe e do pai."
    ]
  },
  28: {
    tamanho: "37.6 cm",
    peso: "1 kg",
    fruta: "Berinjela grande",
    emoji: "🍆",
    desenvolvimento: "Início do terceiro trimestre! O sistema nervoso central assume o controle das funções.",
    curiosidades: [
      "O bebê pisca os olhos de forma ritmada e tem cílios formados.",
      "O acúmulo de gordura corporal atinge 2% a 3%.",
      "Pode sonhar durante o sono (sono REM)."
    ]
  },
  29: {
    tamanho: "38.6 cm",
    peso: "1.2 kg",
    fruta: "Abóbora menina",
    emoji: "🎃",
    desenvolvimento: "Músculos e pulmões continuam amadurecendo rapidamente para o nascimento.",
    curiosidades: [
      "A pele do bebê começa a ficar mais lisa conforme a gordura se acumula.",
      "O esqueleto endurece a cada dia, consumindo mais cálcio da mãe.",
      "A cabeça cresce para acomodar o rápido desenvolvimento cerebral."
    ]
  },
  30: {
    tamanho: "39.9 cm",
    peso: "1.3 kg",
    fruta: "Repolho grande",
    emoji: "🥗",
    desenvolvimento: "O bebê cresce em ritmo acelerado e ocupa a maior parte do saco amniótico.",
    curiosidades: [
      "O espaço diminui, então os movimentos parecem mais apertados (menos chutes amplos, mais empurrões).",
      "A medula óssea assumiu a produção de glóbulos vermelhos.",
      "Ele consegue enxergar a luz do lado de fora caso incida sobre a barriga."
    ]
  },
  31: {
    tamanho: "41.1 cm",
    peso: "1.5 kg",
    fruta: "Coco",
    emoji: "🥥",
    desenvolvimento: "As conexões cerebrais continuam a se multiplicar a um ritmo impressionante.",
    curiosidades: [
      "O bebê passa grande parte do tempo dormindo profundamente.",
      "Os cinco sentidos estão em pleno funcionamento.",
      "O acúmulo de gordura agora faz braços e pernas ficarem mais gordinhos."
    ]
  },
  32: {
    tamanho: "42.4 cm",
    peso: "1.7 kg",
    fruta: "Abacaxi",
    emoji: "🍍",
    desenvolvimento: "As unhas das mãos e pés estão completamente formadas.",
    curiosidades: [
      "Quase todos os bebês já estão de cabeça para baixo nesta fase.",
      "Os ossos do crânio permanecem maleáveis para facilitar o parto.",
      "Ele já pratica a respiração usando o líquido amniótico."
    ]
  },
  33: {
    tamanho: "43.7 cm",
    peso: "1.9 kg",
    fruta: "Melão Cantaloupe",
    emoji: "🍈",
    desenvolvimento: "O sistema imunológico do bebê fortalece com a transferência de anticorpos da mãe.",
    curiosidades: [
      "Ele está engolindo muito líquido amniótico para preparar o sistema digestório.",
      "O líquido amniótico atinge seu volume máximo.",
      "Os olhos ficam abertos durante a fase de vigília."
    ]
  },
  34: {
    tamanho: "45 cm",
    peso: "2.1 kg",
    fruta: "Melão amarelo",
    emoji: "🟡",
    desenvolvimento: "O sistema nervoso central e os pulmões continuam a amadurecer rapidamente.",
    curiosidades: [
      "O vernix caseoso começa a ficar mais espesso.",
      "Os testículos dos meninos geralmente descem para o escroto nesta fase.",
      "Fica mais difícil para ele se virar; os movimentos são cutucadas fortes."
    ]
  },
  35: {
    tamanho: "46.2 cm",
    peso: "2.4 kg",
    fruta: "Mamão Papaia",
    emoji: "🥭",
    desenvolvimento: "Crescimento focado em ganhar peso. Cerca de 200g a 250g por semana.",
    curiosidades: [
      "Os rins estão totalmente desenvolvidos.",
      "O fígado já consegue processar alguns resíduos.",
      "A maioria dos bebês já fixou a posição final de nascimento."
    ]
  },
  36: {
    tamanho: "47.4 cm",
    peso: "2.6 kg",
    fruta: "Melão de inverno",
    emoji: "🍈",
    desenvolvimento: "Com os pulmões praticamente prontos, o bebê se prepara para a chegada.",
    curiosidades: [
      "A digestão está pronta para processar o leite materno.",
      "Ele perde a penugem (lanugo) e o excesso de vérnix.",
      "A cabeça pode começar a se encaixar na região pélvica da mãe."
    ]
  },
  37: {
    tamanho: "48.6 cm",
    peso: "2.9 kg",
    fruta: "Acelga",
    emoji: "🥬",
    desenvolvimento: "Bebê considerado \"termo precoce\". Totalmente capaz de viver fora do útero com segurança.",
    curiosidades: [
      "Ele continua a acumular cerca de 14 gramas de gordura por dia.",
      "Coordena com perfeição os movimentos de sugar e engolir.",
      "O líquido amniótico começa a diminuir levemente."
    ]
  },
  38: {
    tamanho: "49.8 cm",
    peso: "3.1 kg",
    fruta: "Abóbora grande",
    emoji: "🎃",
    desenvolvimento: "Todos os sistemas de órgãos estão desenvolvidos e em pleno funcionamento.",
    curiosidades: [
      "As cordas vocais já estão maduras para o primeiro choro.",
      "O cérebro continua a criar redes neurais complexas.",
      "As unhas podem estar compridas a ponto de ele se arranhar sem querer."
    ]
  },
  39: {
    tamanho: "50.7 cm",
    peso: "3.3 kg",
    fruta: "Melancia pequena",
    emoji: "🍉",
    desenvolvimento: "Desenvolvimento físico concluído. Ele aguarda o sinal químico que inicia o trabalho de parto.",
    curiosidades: [
      "O peito do bebê se sobressai um pouco devido aos hormônios da mãe.",
      "A placenta continua fornecendo anticorpos para o pós-parto.",
      "A pele perdeu o tom rosado e ganhou uma cor mais espessa e pálida."
    ]
  },
  40: {
    tamanho: "51.2 cm",
    peso: "3.5 kg",
    fruta: "Jaca",
    emoji: "🍈",
    desenvolvimento: "Pronto para o nascimento! O bebê já possui os reflexos necessários para mamar.",
    curiosidades: [
      "Chegou o fim oficial da gestação (embora alguns bebês fiquem até a 41ª/42ª semana).",
      "Ao nascer, ele chorará para expandir os pulmões.",
      "Você finalmente conhecerá o rosto do seu bebê!"
    ]
  }
};
