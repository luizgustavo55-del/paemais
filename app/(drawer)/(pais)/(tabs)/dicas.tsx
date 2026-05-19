import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// 🔥 Firebase
import { auth, db } from "@/src/services/firebase";
import { onValue, push, ref, remove, update } from "firebase/database";

type Meta = {
  id: string;
  texto: string;
  concluida: boolean;
  dataConclusao: string;
};

export default function DicasScreen() {
  const [aba, setAba] = useState("rotina");
  const router = useRouter();

  const [metas, setMetas] = useState<Meta[]>([]);
  const [novaMeta, setNovaMeta] = useState("");
  const [editandoId, setEditandoId] = useState<string | null>(null);

  // 📅 SEMANA ATUAL
  const getSemanaAtual = () => {
    const hoje = new Date();

    const primeiroDia = new Date(hoje.setDate(hoje.getDate() - hoje.getDay()));

    return `semana_${primeiroDia.toISOString().split("T")[0]}`;
  };

  const semanaAtual = getSemanaAtual();

  // 🔄 BUSCAR METAS
  useEffect(() => {
    const user = auth.currentUser;

    if (!user) return;

    const metasRef = ref(db, `metasSemana/${user.uid}/${semanaAtual}`);

    const unsubscribe = onValue(metasRef, (snapshot) => {
      const data = snapshot.val();

      if (data) {
        const lista: Meta[] = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));

        setMetas(lista);
      } else {
        setMetas([]);
      }
    });

    return () => unsubscribe();
  }, [semanaAtual]);

  // ➕ SALVAR
  const salvarMeta = () => {
    const user = auth.currentUser;

    if (!user || !novaMeta.trim()) return;

    if (editandoId) {
      update(ref(db, `metasSemana/${user.uid}/${semanaAtual}/${editandoId}`), {
        texto: novaMeta,
      });

      setEditandoId(null);
    } else {
      push(ref(db, `metasSemana/${user.uid}/${semanaAtual}`), {
        texto: novaMeta,
        concluida: false,
        dataConclusao: "",
      });
    }

    setNovaMeta("");
  };

  // ❌ EXCLUIR
  const excluirMeta = (id: string) => {
    const user = auth.currentUser;

    if (!user) return;

    remove(ref(db, `metasSemana/${user.uid}/${semanaAtual}/${id}`));
  };

  // ✏️ EDITAR
  const editarMeta = (meta: Meta) => {
    setNovaMeta(meta.texto);
    setEditandoId(meta.id);
  };

  // ✔️ CONCLUIR
  const concluirMeta = (meta: Meta) => {
    const user = auth.currentUser;

    if (!user) return;

    const hoje = new Date();

    const dataFormatada = `${String(hoje.getDate()).padStart(2, "0")}/${String(
      hoje.getMonth() + 1,
    ).padStart(2, "0")}/${hoje.getFullYear()}`;

    update(ref(db, `metasSemana/${user.uid}/${semanaAtual}/${meta.id}`), {
      concluida: !meta.concluida,
      dataConclusao: !meta.concluida ? dataFormatada : "",
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dicas</Text>

      <Text style={styles.subtitle}>
        Informações úteis para você e seu bebê
      </Text>

      {/* TABS */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={aba === "rotina" ? styles.tabActive : styles.tab}
          onPress={() => setAba("rotina")}
        >
          <Text
            style={aba === "rotina" ? styles.tabActiveText : styles.tabText}
          >
            Autocuidado
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={aba === "auxilios" ? styles.tabActive : styles.tab}
          onPress={() => setAba("auxilios")}
        >
          <Text
            style={aba === "auxilios" ? styles.tabActiveText : styles.tabText}
          >
            Auxílios
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={aba === "bebe" ? styles.tabActive : styles.tab}
          onPress={() => setAba("bebe")}
        >
          <Text style={aba === "bebe" ? styles.tabActiveText : styles.tabText}>
            Bebê
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        {/* ROTINA + SAÚDE */}
        {aba === "rotina" && (
          <>
            {/* METAS */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Metas da Semana</Text>
              </View>

              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  placeholder="Digite uma meta..."
                  placeholderTextColor="#777"
                  value={novaMeta}
                  onChangeText={setNovaMeta}
                />

                <TouchableOpacity style={styles.plusBtn} onPress={salvarMeta}>
                  <Ionicons name="save" size={18} color="#fff" />
                </TouchableOpacity>

                {editandoId && (
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => {
                      setNovaMeta("");
                      setEditandoId(null);
                    }}
                  >
                    <Ionicons name="close" size={18} color="#fff" />
                  </TouchableOpacity>
                )}
              </View>

              {metas.map((meta) => (
                <View key={meta.id} style={styles.item}>
                  <TouchableOpacity onPress={() => concluirMeta(meta)}>
                    <Ionicons
                      name={meta.concluida ? "checkbox" : "square-outline"}
                      size={22}
                      color="#7050b3"
                    />
                  </TouchableOpacity>

                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.itemText,
                        meta.concluida && styles.itemDone,
                      ]}
                    >
                      {meta.texto}
                    </Text>

                    {meta.concluida && (
                      <Text style={styles.dataText}>
                        Concluído em: {meta.dataConclusao}
                      </Text>
                    )}
                  </View>

                  <TouchableOpacity onPress={() => editarMeta(meta)}>
                    <Ionicons name="create-outline" size={20} color="#555" />
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => excluirMeta(meta.id)}>
                    <Ionicons name="trash-outline" size={20} color="red" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* ORGANIZAÇÃO */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Dicas de organização</Text>

              <View style={styles.listContainer}>
                <TouchableOpacity
                  style={styles.tipBox}
                  activeOpacity={0.8}
                  onPress={() => router.push("/dicasPage/docDica")}
                >
                  <View style={styles.tipRow}>
                    <View
                      style={[
                        styles.iconCircle,
                        { backgroundColor: "#ece3ff" },
                      ]}
                    >
                      <Ionicons
                        name="folder-open-outline"
                        size={22}
                        color="#7050b3"
                      />
                    </View>

                    <View style={styles.textContainer}>
                      <Text style={styles.tipTitle}>
                        Organização de Documentos
                      </Text>

                      <Text style={styles.tipText} numberOfLines={1}>
                        Veja dicas de organização de documentos
                      </Text>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#7050b3"
                    />
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* SAÚDE */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Saúde e Bem-estar</Text>

              <View style={styles.listContainer}>
                <TouchableOpacity
                  style={styles.tipBox}
                  onPress={() => router.push("/dicasPage/bemEstar/cansacoSono")}
                >
                  <View style={styles.tipRow}>
                    <View
                      style={[
                        styles.iconCircle,
                        { backgroundColor: "#ffc2e8" },
                      ]}
                    >
                      <Ionicons name="moon-outline" size={20} color="#28174c" />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.tipTitle}>
                        Cansaço extremo e falta de sono
                      </Text>

                      <Text style={styles.tipText}>
                        Noites mal dormidas acumulam estresse, irritação e
                        desgaste físico.
                      </Text>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#7050b3"
                    />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.tipBox}
                  onPress={() =>
                    router.push("/dicasPage/bemEstar/sobrecargaMental")
                  }
                >
                  <View style={styles.tipRow}>
                    <View
                      style={[
                        styles.iconCircle,
                        { backgroundColor: "#ece3ff" },
                      ]}
                    >
                      <Ionicons
                        name="medkit-outline"
                        size={20}
                        color="#7050b3"
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.tipTitle}>Sobrecarga mental</Text>

                      <Text style={styles.tipText}>
                        Consultas, vacinas, contas, rotina e tarefas podem gerar
                        grande desgaste emocional.
                      </Text>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#7050b3"
                    />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.tipBox}
                  onPress={() =>
                    router.push("/dicasPage/bemEstar/problemasFinanceiros")
                  }
                >
                  <View style={styles.tipRow}>
                    <View
                      style={[
                        styles.iconCircle,
                        { backgroundColor: "#b390d8" },
                      ]}
                    >
                      <Ionicons name="cash-outline" size={20} color="#fff" />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.tipTitle}>Problemas financeiros</Text>

                      <Text style={styles.tipText}>
                        Fraldas, alimentação, roupas e medicamentos aumentam os
                        gastos da família.
                      </Text>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#7050b3"
                    />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.tipBox}
                  onPress={() =>
                    router.push("/dicasPage/bemEstar/conflitosRelacionamento")
                  }
                >
                  <View style={styles.tipRow}>
                    <View
                      style={[
                        styles.iconCircle,
                        { backgroundColor: "#7050b3" },
                      ]}
                    >
                      <Ionicons name="people-outline" size={20} color="#fff" />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.tipTitle}>
                        Conflitos no relacionamento
                      </Text>

                      <Text style={styles.tipText}>
                        O cansaço e a divisão de tarefas podem gerar discussões
                        e desgaste no casal.
                      </Text>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#7050b3"
                    />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.tipBox}
                  onPress={() => router.push("/dicasPage/bemEstar/faltaTempo")}
                >
                  <View style={styles.tipRow}>
                    <View
                      style={[
                        styles.iconCircle,
                        { backgroundColor: "#d7c2ff" },
                      ]}
                    >
                      <Ionicons name="time-outline" size={20} color="#7050b3" />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.tipTitle}>
                        Falta de tempo para si mesmos
                      </Text>

                      <Text style={styles.tipText}>
                        Muitos pais deixam descanso, lazer e autocuidado em
                        segundo plano.
                      </Text>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#7050b3"
                    />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.tipBox}
                  onPress={() =>
                    router.push("/dicasPage/bemEstar/pressaoSocial")
                  }
                >
                  <View style={styles.tipRow}>
                    <View
                      style={[
                        styles.iconCircle,
                        { backgroundColor: "#ffc2e8" },
                      ]}
                    >
                      <Ionicons
                        name="chatbubbles-outline"
                        size={20}
                        color="#28174c"
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.tipTitle}>
                        Pressão social e julgamentos
                      </Text>

                      <Text style={styles.tipText}>
                        Familiares e internet frequentemente opinam sobre a
                        criação dos filhos.
                      </Text>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#7050b3"
                    />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.tipBox}
                  onPress={() =>
                    router.push("/dicasPage/bemEstar/ansiedadeMedo")
                  }
                >
                  <View style={styles.tipRow}>
                    <View
                      style={[
                        styles.iconCircle,
                        { backgroundColor: "#ece3ff" },
                      ]}
                    >
                      <Ionicons
                        name="alert-circle-outline"
                        size={20}
                        color="#7050b3"
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.tipTitle}>
                        Ansiedade e medo constante
                      </Text>

                      <Text style={styles.tipText}>
                        Preocupações com saúde, segurança e desenvolvimento da
                        criança são comuns.
                      </Text>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#7050b3"
                    />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.tipBox}
                  onPress={() =>
                    router.push("/dicasPage/bemEstar/isolamentoSocial")
                  }
                >
                  <View style={styles.tipRow}>
                    <View
                      style={[
                        styles.iconCircle,
                        { backgroundColor: "#b390d8" },
                      ]}
                    >
                      <Ionicons
                        name="people-circle-outline"
                        size={20}
                        color="#fff"
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.tipTitle}>Isolamento social</Text>

                      <Text style={styles.tipText}>
                        A falta de tempo e energia pode afastar os pais da vida
                        social.
                      </Text>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#7050b3"
                    />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.tipBox}
                  onPress={() =>
                    router.push("/dicasPage/bemEstar/trabalhoFamilia")
                  }
                >
                  <View style={styles.tipRow}>
                    <View
                      style={[
                        styles.iconCircle,
                        { backgroundColor: "#7050b3" },
                      ]}
                    >
                      <Ionicons
                        name="briefcase-outline"
                        size={20}
                        color="#fff"
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.tipTitle}>
                        Equilibrar trabalho e família
                      </Text>

                      <Text style={styles.tipText}>
                        Conciliar carreira, estudos e filhos pode causar culpa e
                        estresse.
                      </Text>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#7050b3"
                    />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.tipBox}
                  activeOpacity={0.8}
                  onPress={() =>
                    router.push("/dicasPage/bemEstar/mudancaRotina")
                  }
                >
                  <View style={styles.tipRow}>
                    <View
                      style={[
                        styles.iconCircle,
                        {
                          backgroundColor: "#ede3ff",
                        },
                      ]}
                    >
                      <Ionicons
                        name="refresh-outline"
                        size={22}
                        color="#7050b3"
                      />
                    </View>

                    <View style={styles.textContainer}>
                      <Text style={styles.tipTitle} numberOfLines={1}>
                        Mudança de identidade e rotina
                      </Text>

                      <Text style={styles.tipText} numberOfLines={1}>
                        A chegada do filho transforma totalmente a rotina.
                      </Text>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#7050b3"
                    />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        {/* AUXÍLIOS */}
        {aba === "auxilios" && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Auxílios disponíveis</Text>

            <View style={styles.listContainer}>
              <TouchableOpacity
                style={styles.tipBox}
                onPress={() => router.push("/dicasPage/marcoLegal")}
              >
                <View style={styles.tipRow}>
                  <View
                    style={[styles.iconCircle, { backgroundColor: "#ece3ff" }]}
                  >
                    <Ionicons
                      name="document-text-outline"
                      size={20}
                      color="#7050b3"
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.tipTitle}>
                      Marco Legal da Primeira Infância
                    </Text>

                    <Text style={styles.tipText}>
                      Lei voltada ao desenvolvimento infantil.
                    </Text>
                  </View>

                  <Ionicons name="chevron-forward" size={20} color="#7050b3" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.tipBox}
                onPress={() => router.push("/dicasPage/cadUnico")}
              >
                <View style={styles.tipRow}>
                  <View
                    style={[styles.iconCircle, { backgroundColor: "#ffc2e8" }]}
                  >
                    <Ionicons name="people-outline" size={20} color="#28174c" />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.tipTitle}>Cadastro Único</Text>

                    <Text style={styles.tipText}>
                      Entenda como funciona o CadÚnico.
                    </Text>
                  </View>

                  <Ionicons name="chevron-forward" size={20} color="#7050b3" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.tipBox}
                onPress={() => router.push("/dicasPage/redeAlyne")}
              >
                <View style={styles.tipRow}>
                  <View
                    style={[styles.iconCircle, { backgroundColor: "#b390d8" }]}
                  >
                    <Ionicons name="heart-outline" size={20} color="#fff" />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.tipTitle}>Rede Alyne</Text>

                    <Text style={styles.tipText}>
                      Atendimento humanizado para mães.
                    </Text>
                  </View>

                  <Ionicons name="chevron-forward" size={20} color="#7050b3" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.tipBox}
                onPress={() => router.push("/dicasPage/bolsaFamilia")}
              >
                <View style={styles.tipRow}>
                  <View
                    style={[styles.iconCircle, { backgroundColor: "#7050b3" }]}
                  >
                    <Ionicons name="cash-outline" size={20} color="#fff" />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.tipTitle}>Bolsa Família</Text>

                    <Text style={styles.tipText}>
                      Verifique seu direito ao benefício.
                    </Text>
                  </View>

                  <Ionicons name="chevron-forward" size={20} color="#7050b3" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.tipBox}
                onPress={() => router.push("/dicasPage/auxMaternidade")}
              >
                <View style={styles.tipRow}>
                  <View
                    style={[styles.iconCircle, { backgroundColor: "#d7c2ff" }]}
                  >
                    <Ionicons name="medkit-outline" size={20} color="#7050b3" />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.tipTitle}>Auxílio Maternidade</Text>

                    <Text style={styles.tipText}>
                      Benefício para mães do INSS.
                    </Text>
                  </View>

                  <Ionicons name="chevron-forward" size={20} color="#7050b3" />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* BEBÊ */}
        {aba === "bebe" && (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Cuidados com o Bebê</Text>

              <View style={styles.listContainer}>
                {/* SONO */}
                <TouchableOpacity
                  style={styles.tipBox}
                  onPress={() => router.push("/dicasPage/saudeBebe/sonoBebe")}
                >
                  <View style={styles.tipRow}>
                    <View
                      style={[
                        styles.iconCircle,
                        { backgroundColor: "#7050b3" },
                      ]}
                    >
                      <Ionicons name="moon-outline" size={20} color="#fff" />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.tipTitle}>Sono do bebê</Text>

                      <Text style={styles.tipText} numberOfLines={1}>
                        Dicas para melhorar o sono do bebê.
                      </Text>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#7050b3"
                    />
                  </View>
                </TouchableOpacity>

                {/* AMAMENTAÇÃO */}
                <TouchableOpacity
                  style={styles.tipBox}
                  onPress={() =>
                    router.push("/dicasPage/saudeBebe/amamentacao")
                  }
                >
                  <View style={styles.tipRow}>
                    <View
                      style={[
                        styles.iconCircle,
                        { backgroundColor: "#ffc2e8" },
                      ]}
                    >
                      <Ionicons
                        name="water-outline"
                        size={20}
                        color="#28174c"
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.tipTitle}>Amamentação</Text>

                      <Text style={styles.tipText} numberOfLines={2}>
                        Saiba mais sobre aleitamento materno.
                      </Text>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#7050b3"
                    />
                  </View>
                </TouchableOpacity>

                {/* RESFRIADO */}
                <TouchableOpacity
                  style={styles.tipBox}
                  onPress={() => router.push("/dicasPage/saudeBebe/resfriado")}
                >
                  <View style={styles.tipRow}>
                    <View
                      style={[
                        styles.iconCircle,
                        { backgroundColor: "#d7c2ff" },
                      ]}
                    >
                      <Ionicons
                        name="thermometer-outline"
                        size={20}
                        color="#7050b3"
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.tipTitle}>Resfriado comum</Text>

                      <Text style={styles.tipText} numberOfLines={2}>
                        Coriza, tosse e febre baixa são comuns.
                      </Text>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#7050b3"
                    />
                  </View>
                </TouchableOpacity>

                {/* GRIPE */}
                <TouchableOpacity
                  style={styles.tipBox}
                  onPress={() => router.push("/dicasPage/saudeBebe/gripe")}
                >
                  <View style={styles.tipRow}>
                    <View
                      style={[
                        styles.iconCircle,
                        { backgroundColor: "#7050b3" },
                      ]}
                    >
                      <Ionicons name="medkit-outline" size={20} color="#fff" />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.tipTitle}>Gripe</Text>

                      <Text style={styles.tipText} numberOfLines={2}>
                        Pode causar febre alta e muito cansaço.
                      </Text>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#7050b3"
                    />
                  </View>
                </TouchableOpacity>

                {/* BRONQUIOLITE */}
                <TouchableOpacity
                  style={styles.tipBox}
                  onPress={() =>
                    router.push("/dicasPage/saudeBebe/bronquiolite")
                  }
                >
                  <View style={styles.tipRow}>
                    <View
                      style={[
                        styles.iconCircle,
                        { backgroundColor: "#ffc2e8" },
                      ]}
                    >
                      <Ionicons
                        name="fitness-outline"
                        size={20}
                        color="#28174c"
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.tipTitle}>Bronquiolite</Text>

                      <Text style={styles.tipText} numberOfLines={2}>
                        Pode causar chiado e dificuldade para respirar.
                      </Text>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#7050b3"
                    />
                  </View>
                </TouchableOpacity>

                {/* OTITE */}
                <TouchableOpacity
                  style={styles.tipBox}
                  onPress={() => router.push("/dicasPage/saudeBebe/otite")}
                >
                  <View style={styles.tipRow}>
                    <View
                      style={[
                        styles.iconCircle,
                        { backgroundColor: "#ece3ff" },
                      ]}
                    >
                      <Ionicons name="ear-outline" size={20} color="#7050b3" />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.tipTitle}>Otite</Text>

                      <Text style={styles.tipText} numberOfLines={2}>
                        Infecção no ouvido comum na infância.
                      </Text>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#7050b3"
                    />
                  </View>
                </TouchableOpacity>

                {/* GASTROENTERITE */}
                <TouchableOpacity
                  style={styles.tipBox}
                  onPress={() =>
                    router.push("/dicasPage/saudeBebe/gastroenterite")
                  }
                >
                  <View style={styles.tipRow}>
                    <View
                      style={[
                        styles.iconCircle,
                        { backgroundColor: "#b390d8" },
                      ]}
                    >
                      <Ionicons name="medical-outline" size={20} color="#fff" />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.tipTitle}>Gastroenterite</Text>

                      <Text style={styles.tipText} numberOfLines={2}>
                        Pode causar vômitos e desidratação.
                      </Text>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#7050b3"
                    />
                  </View>
                </TouchableOpacity>

                {/* PNEUMONIA */}
                <TouchableOpacity
                  style={styles.tipBox}
                  onPress={() => router.push("/dicasPage/saudeBebe/pneumonia")}
                >
                  <View style={styles.tipRow}>
                    <View
                      style={[
                        styles.iconCircle,
                        { backgroundColor: "#7050b3" },
                      ]}
                    >
                      <Ionicons name="heart-outline" size={20} color="#fff" />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.tipTitle}>Pneumonia</Text>

                      <Text style={styles.tipText} numberOfLines={2}>
                        Infecção pulmonar que exige atenção.
                      </Text>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#7050b3"
                    />
                  </View>
                </TouchableOpacity>

                {/* AMIGDALITE */}
                <TouchableOpacity
                  style={styles.tipBox}
                  onPress={() => router.push("/dicasPage/saudeBebe/amigdalite")}
                >
                  <View style={styles.tipRow}>
                    <View
                      style={[
                        styles.iconCircle,
                        { backgroundColor: "#ffc2e8" },
                      ]}
                    >
                      <Ionicons
                        name="medkit-outline"
                        size={20}
                        color="#28174c"
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.tipTitle}>Amigdalite</Text>

                      <Text style={styles.tipText} numberOfLines={2}>
                        Dor de garganta e febre são comuns.
                      </Text>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#7050b3"
                    />
                  </View>
                </TouchableOpacity>

                {/* CATAPORA */}
                <TouchableOpacity
                  style={styles.tipBox}
                  onPress={() => router.push("/dicasPage/saudeBebe/catapora")}
                >
                  <View style={styles.tipRow}>
                    <View
                      style={[
                        styles.iconCircle,
                        { backgroundColor: "#d7c2ff" },
                      ]}
                    >
                      <Ionicons name="bug-outline" size={20} color="#7050b3" />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.tipTitle}>Catapora</Text>

                      <Text style={styles.tipText} numberOfLines={2}>
                        Bolinhas vermelhas e coceira pelo corpo.
                      </Text>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#7050b3"
                    />
                  </View>
                </TouchableOpacity>

                {/* CONJUNTIVITE */}
                <TouchableOpacity
                  style={styles.tipBox}
                  onPress={() =>
                    router.push("/dicasPage/saudeBebe/conjuntivite")
                  }
                >
                  <View style={styles.tipRow}>
                    <View
                      style={[
                        styles.iconCircle,
                        { backgroundColor: "#ece3ff" },
                      ]}
                    >
                      <Ionicons name="eye-outline" size={20} color="#7050b3" />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.tipTitle}>Conjuntivite</Text>

                      <Text style={styles.tipText} numberOfLines={2}>
                        Vermelhidão e secreção nos olhos.
                      </Text>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#7050b3"
                    />
                  </View>
                </TouchableOpacity>

                {/* DERMATITE */}
                <TouchableOpacity
                  style={styles.tipBox}
                  onPress={() =>
                    router.push("/dicasPage/saudeBebe/dermatiteFralda")
                  }
                >
                  <View style={styles.tipRow}>
                    <View
                      style={[
                        styles.iconCircle,
                        { backgroundColor: "#b390d8" },
                      ]}
                    >
                      <Ionicons name="body-outline" size={20} color="#fff" />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.tipTitle}>Dermatite de fralda</Text>

                      <Text style={styles.tipText} numberOfLines={2}>
                        Irritação causada pelo uso da fralda.
                      </Text>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#7050b3"
                    />
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* DESENVOLVIMENTO INFANTIL */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Desenvolvimento Infantil</Text>

              <View style={styles.listContainer}>
                {/* AUTISMO */}
                <TouchableOpacity
                  style={styles.tipBox}
                  onPress={() =>
                    router.push("/dicasPage/desenvolvimento/autismo")
                  }
                >
                  <View style={styles.tipRow}>
                    <View
                      style={[
                        styles.iconCircle,
                        { backgroundColor: "#7050b3" },
                      ]}
                    >
                      <Ionicons name="happy-outline" size={20} color="#fff" />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.tipTitle}>
                        Transtorno do Espectro Autista
                      </Text>

                      <Text style={styles.tipText} numberOfLines={2}>
                        Alterações na fala, interação e comportamento.
                      </Text>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#7050b3"
                    />
                  </View>
                </TouchableOpacity>

                {/* PARALISIA CEREBRAL */}
                <TouchableOpacity
                  style={styles.tipBox}
                  onPress={() =>
                    router.push("/dicasPage/desenvolvimento/paralisiaCerebral")
                  }
                >
                  <View style={styles.tipRow}>
                    <View
                      style={[
                        styles.iconCircle,
                        { backgroundColor: "#ffc2e8" },
                      ]}
                    >
                      <Ionicons name="walk-outline" size={20} color="#28174c" />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.tipTitle}>Paralisia Cerebral</Text>

                      <Text style={styles.tipText} numberOfLines={2}>
                        Alterações motoras e dificuldade de coordenação.
                      </Text>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#7050b3"
                    />
                  </View>
                </TouchableOpacity>

                {/* EPILEPSIA */}
                <TouchableOpacity
                  style={styles.tipBox}
                  onPress={() =>
                    router.push("/dicasPage/desenvolvimento/epilepsia")
                  }
                >
                  <View style={styles.tipRow}>
                    <View
                      style={[
                        styles.iconCircle,
                        { backgroundColor: "#d7c2ff" },
                      ]}
                    >
                      <Ionicons
                        name="flash-outline"
                        size={20}
                        color="#7050b3"
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.tipTitle}>Epilepsia</Text>

                      <Text style={styles.tipText} numberOfLines={2}>
                        Convulsões e episódios de ausência.
                      </Text>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#7050b3"
                    />
                  </View>
                </TouchableOpacity>

                {/* TDAH */}
                <TouchableOpacity
                  style={styles.tipBox}
                  onPress={() => router.push("/dicasPage/desenvolvimento/tdah")}
                >
                  <View style={styles.tipRow}>
                    <View
                      style={[
                        styles.iconCircle,
                        { backgroundColor: "#ece3ff" },
                      ]}
                    >
                      <Ionicons name="bulb-outline" size={20} color="#7050b3" />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.tipTitle}>TDAH</Text>

                      <Text style={styles.tipText} numberOfLines={2}>
                        Agitação, impulsividade e dificuldade de atenção.
                      </Text>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#7050b3"
                    />
                  </View>
                </TouchableOpacity>

                {/* ATRASO GLOBAL */}
                <TouchableOpacity
                  style={styles.tipBox}
                  onPress={() =>
                    router.push("/dicasPage/desenvolvimento/atrasoGlobal")
                  }
                >
                  <View style={styles.tipRow}>
                    <View
                      style={[
                        styles.iconCircle,
                        { backgroundColor: "#7050b3" },
                      ]}
                    >
                      <Ionicons name="time-outline" size={20} color="#fff" />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.tipTitle}>
                        Atraso Global do Desenvolvimento
                      </Text>

                      <Text style={styles.tipText} numberOfLines={2}>
                        Atrasos na fala, movimento e interação.
                      </Text>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#7050b3"
                    />
                  </View>
                </TouchableOpacity>

                {/* SÍNDROME DE DOWN */}
                <TouchableOpacity
                  style={styles.tipBox}
                  onPress={() =>
                    router.push("/dicasPage/desenvolvimento/sindromeDown")
                  }
                >
                  <View style={styles.tipRow}>
                    <View
                      style={[
                        styles.iconCircle,
                        { backgroundColor: "#ffc2e8" },
                      ]}
                    >
                      <Ionicons
                        name="people-outline"
                        size={20}
                        color="#28174c"
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.tipTitle}>Síndrome de Down</Text>

                      <Text style={styles.tipText} numberOfLines={2}>
                        Desenvolvimento motor e cognitivo mais lento.
                      </Text>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#7050b3"
                    />
                  </View>
                </TouchableOpacity>

                {/* PERDA AUDITIVA */}
                <TouchableOpacity
                  style={styles.tipBox}
                  onPress={() =>
                    router.push("/dicasPage/desenvolvimento/perdaAuditiva")
                  }
                >
                  <View style={styles.tipRow}>
                    <View
                      style={[
                        styles.iconCircle,
                        { backgroundColor: "#d7c2ff" },
                      ]}
                    >
                      <Ionicons name="ear-outline" size={20} color="#7050b3" />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.tipTitle}>Perda Auditiva</Text>

                      <Text style={styles.tipText} numberOfLines={2}>
                        Pode causar atraso na fala e comunicação.
                      </Text>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#7050b3"
                    />
                  </View>
                </TouchableOpacity>

                {/* DEFICIÊNCIA VISUAL */}
                <TouchableOpacity
                  style={styles.tipBox}
                  onPress={() =>
                    router.push("/dicasPage/desenvolvimento/deficienciaVisual")
                  }
                >
                  <View style={styles.tipRow}>
                    <View
                      style={[
                        styles.iconCircle,
                        { backgroundColor: "#ece3ff" },
                      ]}
                    >
                      <Ionicons name="eye-outline" size={20} color="#7050b3" />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.tipTitle}>Deficiência Visual</Text>

                      <Text style={styles.tipText} numberOfLines={2}>
                        Dificuldade para enxergar objetos e rostos.
                      </Text>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#7050b3"
                    />
                  </View>
                </TouchableOpacity>

                {/* HIPOTIREOIDISMO */}
                <TouchableOpacity
                  style={styles.tipBox}
                  onPress={() =>
                    router.push("/dicasPage/desenvolvimento/hipotireoidismo")
                  }
                >
                  <View style={styles.tipRow}>
                    <View
                      style={[
                        styles.iconCircle,
                        { backgroundColor: "#b390d8" },
                      ]}
                    >
                      <Ionicons name="medkit-outline" size={20} color="#fff" />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.tipTitle}>
                        Hipotireoidismo Congênito
                      </Text>

                      <Text style={styles.tipText} numberOfLines={2}>
                        Pode atrasar crescimento e desenvolvimento.
                      </Text>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#7050b3"
                    />
                  </View>
                </TouchableOpacity>

                {/* DISTROFIA MUSCULAR */}
                <TouchableOpacity
                  style={styles.tipBox}
                  onPress={() =>
                    router.push("/dicasPage/desenvolvimento/distrofiaMuscular")
                  }
                >
                  <View style={styles.tipRow}>
                    <View
                      style={[
                        styles.iconCircle,
                        { backgroundColor: "#7050b3" },
                      ]}
                    >
                      <Ionicons name="fitness-outline" size={20} color="#fff" />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.tipTitle}>Distrofia Muscular</Text>

                      <Text style={styles.tipText} numberOfLines={2}>
                        Fraqueza muscular e dificuldade para andar.
                      </Text>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#7050b3"
                    />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: "#7050b3",
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },

  subtitle: {
    color: "#ece3ff",
    marginBottom: 18,
    marginTop: 4,
  },

  tabs: {
    flexDirection: "row",
    backgroundColor: "#ffffff22",
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
  },

  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
  },

  tabActive: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderRadius: 12,
    alignItems: "center",
  },

  tabText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },

  tabActiveText: {
    color: "#28174c",
    fontWeight: "bold",
    fontSize: 12,
  },

  card: {
    backgroundColor: "#b390d8",
    borderRadius: 22,
    padding: 18,
    marginBottom: 20,
    shadowColor: "#28174cca",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },

  cardHeader: {
    marginBottom: 10,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#28174c",
    marginBottom: 12,
  },

  inputRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 15,
  },

  input: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 14,
    color: "#000",
  },

  plusBtn: {
    backgroundColor: "#7050b3",
    padding: 12,
    borderRadius: 12,
  },

  cancelBtn: {
    backgroundColor: "#ff6b6b",
    padding: 12,
    borderRadius: 12,
  },

  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
    backgroundColor: "#ece3ff",
    padding: 12,
    borderRadius: 14,
  },

  itemText: {
    color: "#28174c",
    fontSize: 15,
  },

  itemDone: {
    textDecorationLine: "line-through",
    opacity: 0.6,
  },

  dataText: {
    fontSize: 11,
    color: "#555",
    marginTop: 2,
  },

  listContainer: {
    gap: 14,
  },

  tipBox: {
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderLeftWidth: 5,
    borderLeftColor: "#7050b3",
    minHeight: 88,
    justifyContent: "center",
  },

  tipTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#28174c",
    marginBottom: 4,
  },

  tipText: {
    fontSize: 12,
    color: "#555",
  },

  tipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  iconCircle: {
    width: 45,
    height: 45,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
});
