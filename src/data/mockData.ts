import {
  StudentProfile,
  StudyDocument,
  ScheduleItem,
  LibraryItem,
  LawQuestion,
  StudySession,
} from '../types';

export const initialProfile: StudentProfile = {
  name: 'Estudante de Direito',
  examTarget: '48º Exame de Ordem (OAB 48)',
  targetExamDate: '2027-01-10', // Prova em 10/01/2027
  dailyGoalHours: 4,
  totalStudyHours: 0,
  platformTitle: 'LexStudy',
  platformSubtitle: 'Plataforma Jurídica',
  platformIcon: 'scale',
};

// Base Zero: Inicia limpo para o estudante construir seus próprios fichamentos
export const initialDocuments: StudyDocument[] = [];

// Base Zero: Inicia limpo para o estudante definir seu próprio cronograma de estudos
export const initialSchedule: ScheduleItem[] = [];

// Base Zero: Inicia limpo para o estudante compor seu próprio acervo de doutrina e leis
export const initialLibrary: LibraryItem[] = [];

// Banco Oficial Completo OAB FGV: 50 questões categorizadas e com gabarito comentado
export const initialQuestions: LawQuestion[] = [
  {
    id: 'q-1',
    subject: 'Ética Profissional (OAB)',
    topic: 'Prerrogativas do Advogado',
    examOrigin: 'OAB 45 - FGV',
    question:
      'Determinada autoridade policial, sob pretexto de que o inquérito corre em segredo de justiça, recusa acesso aos autos ao advogado constituído pelo investigado preso. Diante do Estatuto da Advocacia e da Súmula Vinculante 14 do STF, a conduta da autoridade:',
    options: [
      { id: 'a', text: 'É lícita, pois o sigilo decretado afasta o acesso do defensor a quaisquer elementos informativos antes do relatório final.' },
      { id: 'b', text: 'É ilícita, pois é direito do defensor ter amplo acesso aos elementos de prova já documentados que digam respeito ao exercício do direito de defesa.' },
      { id: 'c', text: 'É lícita apenas se o advogado não possuir procuração expressa com poderes para atuar perante a corregedoria de polícia.' },
      { id: 'd', text: 'É ilícita, permitindo que o advogado tenha acesso inclusive a diligências policiais sigilosas ainda em andamento.' },
    ],
    correctOptionId: 'b',
    explanation:
      'A Súmula Vinculante 14 e o Art. 7º, XIV do EAOAB garantem ao defensor acesso aos elementos de prova já documentados em procedimento investigatório que digam respeito ao exercício do direito de defesa.',
  },
  {
    id: 'q-2',
    subject: 'Direito Constitucional',
    topic: 'Controle Concentrado de Constitucionalidade',
    examOrigin: 'OAB 44 - FGV',
    question:
      'Determinada confederação sindical pretende ajuizar Ação Direta de Inconstitucionalidade (ADI) perante o Supremo Tribunal Federal contra lei estadual. Sobre a legitimidade ativa para a propositura:',
    options: [
      { id: 'a', text: 'A confederação sindical é legitimada universal e não precisa demonstrar pertinência temática.' },
      { id: 'b', text: 'A confederação sindical é legitimada especial, necessitando demonstrar a pertinência temática entre a norma impugnada e seus fins institucionais.' },
      { id: 'c', text: 'Confederações sindicais não têm legitimidade ativa perante o STF, cabendo o ajuizamento exclusivamente ao Conselho Federal da OAB.' },
      { id: 'd', text: 'A confederação só pode propor ADI perante o Tribunal de Justiça do respectivo estado.' },
    ],
    correctOptionId: 'b',
    explanation:
      'O Art. 103, IX da CF/88 qualifica a confederação sindical ou entidade de classe de âmbito nacional como legitimada especial, exigindo a demonstração de pertinência temática com seus objetivos estatutários.',
  },
  {
    id: 'q-3',
    subject: 'Direito Penal',
    topic: 'Excludentes de Ilicitude',
    examOrigin: 'OAB 43 - FGV',
    question:
      'Carlos, segurança de uma loja, ao presenciar um ladrão armado fugindo após roubar um celular, dispara um tiro contra as pernas do criminoso que não representava mais ameaça letal iminente. Carlos:',
    options: [
      { id: 'a', text: 'Agirá sempre amparado pelo estrito cumprimento do dever legal.' },
      { id: 'b', text: 'Poderá responder pelo excesso culposo ou doloso caso ultrapasse os limites da moderação da legítima defesa.' },
      { id: 'c', text: 'Estará acobertado por excludente de culpabilidade absoluta pela inexigibilidade de conduta diversa.' },
      { id: 'd', text: 'Cometeu crime culposo imprevisível, ficando isento de pena.' },
    ],
    correctOptionId: 'b',
    explanation:
      'Nos termos do Art. 23, parágrafo único do Código Penal, o agente em qualquer das hipóteses de excludente de ilicitude responderá pelo excesso doloso ou culposo.',
  },
  {
    id: 'q-4',
    subject: 'Processo Penal',
    topic: 'Prisão em Flagrante e Audiência de Custódia',
    examOrigin: 'OAB 44 - FGV',
    question:
      'Em audiência de custódia realizada no prazo de 24 horas após a prisão em flagrante por roubo simples, o magistrado verifica que o auto é formalmente perfeito, mas o réu é primário, com bons antecedentes e residência fixa. O juiz deverá:',
    options: [
      { id: 'a', text: 'Relaxar a prisão em razão da primariedade do autuado.' },
      { id: 'b', text: 'Converter compulsoriamente o flagrante em prisão preventiva sem possibilidade de cautelares.' },
      { id: 'c', text: 'Conceder liberdade provisória, com ou sem a imposição de medidas cautelares diversas da prisão.' },
      { id: 'd', text: 'Remeter os autos imediatamente para manifestação do Tribunal de Justiça.' },
    ],
    correctOptionId: 'c',
    explanation:
      'Art. 310, III do CPP: ao receber o auto de prisão em flagrante, o juiz deverá conceder liberdade provisória, com ou sem fiança, se ausentes os requisitos da prisão preventiva.',
  },
  {
    id: 'q-5',
    subject: 'Direito Civil',
    topic: 'Responsabilidade Civil e Danos Morais',
    examOrigin: 'OAB 45 - FGV',
    question:
      'Em contrato de transporte aéreo nacional, ocorre extravio definitivo de bagagem contendo bens de uso pessoal do passageiro. Diante da jurisprudência consolidada do STF e do Código de Defesa do Consumidor:',
    options: [
      { id: 'a', text: 'A indenização por danos materiais é limitada tarifariamente pelas Convenções de Varsóvia e Montreal, mas os danos morais não se sujeitam à referida limitação.' },
      { id: 'b', text: 'O Código de Defesa do Consumidor prevalece irrestritamente sobre qualquer tratado internacional em voos nacionais e internacionais.' },
      { id: 'c', text: 'Não cabe indenização por dano moral em caso de extravio de bagagem de acordo com o STF.' },
      { id: 'd', text: 'A indenização total não pode exceder o valor pago pelo bilhete aéreo.' },
    ],
    correctOptionId: 'a',
    explanation:
      'O STF fixou no Tema 210 de Repercussão Geral que a indenização material sujeita-se aos limites das Convenções internacionais, porém os danos morais submetem-se ao regime geral do Código Civil e CDC, sem tarifação.',
  },
  {
    id: 'q-6',
    subject: 'Processo Civil',
    topic: 'Tutelas Provisórias de Urgência',
    examOrigin: 'OAB 46 - FGV',
    question:
      'A tutela de urgência antecipada requerida em caráter antecedente, se concedida pelo juiz e não impugnada pelo réu mediante recurso de agravo de instrumento:',
    options: [
      { id: 'a', text: 'Será extinta sem resolução de mérito, devendo o autor propor nova ação.' },
      { id: 'b', text: 'Torna-se estável, o processo é extinto e qualquer das partes pode ajuizar ação para rever ou invalidar a tutela no prazo de 2 anos.' },
      { id: 'c', text: 'Produz coisa julgada material automática e imutável.' },
      { id: 'd', text: 'Exige obrigatoriamente a apresentação de contestação no prazo comum de 15 dias para evitar a revelia.' },
    ],
    correctOptionId: 'b',
    explanation:
      'Art. 304 do CPC: a tutela antecipada concedida em caráter antecedente torna-se estável se da decisão não for interposto o respectivo recurso, extinguindo-se o processo sem resolução do mérito e abrindo prazo decadencial de 2 anos para revisão.',
  },
  {
    id: 'q-7',
    subject: 'Direito Administrativo',
    topic: 'Poderes Administrativos e Ato Administrativo',
    examOrigin: 'OAB 43 - FGV',
    question:
      'Prefeito municipal revoga licença para construir regularmente expedida a particular que já havia iniciado as obras de sua residência, fundamentando apenas em critério de conveniência política superveniente. Esse ato do prefeito:',
    options: [
      { id: 'a', text: 'É plenamente legítimo, pois os atos administrativos são sempre discricionários e revogáveis a qualquer tempo.' },
      { id: 'b', text: 'É ilícito, pois a licença é ato administrativo unilateral e vinculado, gerando direito adquirido à edificação quando cumpridos os requisitos legais.' },
      { id: 'c', text: 'É ato de anulação tácita, prescindindo de contraditório e ampla defesa.' },
      { id: 'd', text: 'Encontra respaldo no princípio da supremacia absoluta do interesse político do governante.' },
    ],
    correctOptionId: 'b',
    explanation:
      'A licença é ato vinculado e definitivo. Uma vez preenchidos os requisitos pelo administrado, surge direito subjetivo, não cabendo revogação arbitrária (Súmula 473 STF e doutrina clássica de Direito Administrativo).',
  },
  {
    id: 'q-8',
    subject: 'Direito Tributário',
    topic: 'Imunidades Tributárias Constitucionais',
    examOrigin: 'OAB 45 - FGV',
    question:
      'Imóvel de propriedade de entidade religiosa tradicional que se encontra locado a empresa privada comercial, com todo o valor dos aluguéis comprovadamente revertido para os fins essenciais do templo religioso:',
    options: [
      { id: 'a', text: 'Perde integralmente a imunidade de IPTU por estar na posse direta de sociedade mercantil com fins lucrativos.' },
      { id: 'b', text: 'Mantém a imunidade de IPTU, conforme enunciado da Súmula Vinculante 52 do Supremo Tribunal Federal.' },
      { id: 'c', text: 'Submete-se ao regime de isenção tributária revogável por lei ordinária municipal.' },
      { id: 'd', text: 'Gera direito à isenção de ITBI, mas não afasta a incidência do IPTU.' },
    ],
    correctOptionId: 'b',
    explanation:
      'Súmula Vinculante 52 STF: Ainda que alugado a terceiros, permanece imune ao IPTU o imóvel pertencente a qualquer das entidades referidas pelo art. 150, VI, c, da CF, desde que o valor dos aluguéis seja aplicado nas atividades essenciais.',
  },
  {
    id: 'q-9',
    subject: 'Direito do Trabalho',
    topic: 'Jornada de Trabalho e Horas Extras',
    examOrigin: 'OAB 44 - FGV',
    question:
      'Empregado sujeito ao regime da CLT realiza habitualmente jornada extraordinária de 2 horas suplementares por dia. Nos termos da legislação trabalhista e da Súmula 376 do TST:',
    options: [
      { id: 'a', text: 'A habitualidade do trabalho extraordinário descaracteriza o acordo de compensação de jornada em qualquer hipótese.' },
      { id: 'b', text: 'As horas extras habituais integram o salário do empregado para todos os efeitos legais, inclusive reflexos em 13º salário, férias e FGTS.' },
      { id: 'c', text: 'A prestação de horas extras habituais converte o contrato por prazo determinado em prazo indeterminado automaticamente.' },
      { id: 'd', text: 'O valor da hora extra deve ser pago sem acréscimo se houver compensação no prazo de dois anos.' },
    ],
    correctOptionId: 'b',
    explanation:
      'Súmula 376, II do TST: O valor das horas extras habitualmente prestadas integra o cálculo dos haveres trabalhistas, repercutindo em repouso remunerado, férias com 1/3, 13º salário e aviso prévio indenizado.',
  },
  {
    id: 'q-10',
    subject: 'Processo do Trabalho',
    topic: 'Recursos Trabalhistas e Depósito Recursal',
    examOrigin: 'OAB 42 - FGV',
    question:
      'Empresa em processo de recuperação judicial interpõe Recurso Ordinário em face de sentença condenatória na Justiça do Trabalho. Em relação ao depósito recursal e às custas:',
    options: [
      { id: 'a', text: 'É isenta do recolhimento do depósito recursal, mas não é dispensada do pagamento das custas processuais.' },
      { id: 'b', text: 'Deve recolher integralmente o depósito recursal e as custas sob pena de deserção imediata.' },
      { id: 'c', text: 'Fica isenta tanto das custas quanto do depósito recursal de forma incondicionada.' },
      { id: 'd', text: 'Recolhe o depósito recursal reduzido pela metade e goza de prazo dobrado para recorrer.' },
    ],
    correctOptionId: 'a',
    explanation:
      'Art. 899, § 10 da CLT: São isentos do depósito recursal os beneficiários da justiça gratuita, as entidades filantrópicas e as empresas em recuperação judicial (mantida a exigência de custas, salvo gratuidade).',
  },
  {
    id: 'q-11',
    subject: 'Direitos Humanos',
    topic: 'Pacto de San José da Costa Rica e Prisão Civil',
    examOrigin: 'OAB 46 - FGV',
    question:
      'Sobre a prisão civil do depositário infiel no ordenamento jurídico brasileiro à luz do Pacto de San José da Costa Rica:',
    options: [
      { id: 'a', text: 'Permanece plenamente válida em contratos de alienação fiduciária em garantia.' },
      { id: 'b', text: 'É ilícita em qualquer hipótese, consoante a Súmula Vinculante 25 do STF.' },
      { id: 'c', text: 'Foi revogada expressamente por emenda constitucional promulgada em 2004.' },
      { id: 'd', text: 'Exige ordem emanada exclusivamente de tribunal de segunda instância.' },
    ],
    correctOptionId: 'b',
    explanation:
      'Súmula Vinculante 25 STF: É ilícita a prisão civil de depositário infiel, qualquer que seja a modalidade do depósito, prevalecendo a eficácia supralegal do Art. 7º, 7 da CADH.',
  },
  {
    id: 'q-12',
    subject: 'Direito Empresarial',
    topic: 'Sociedade Limitada e Desconsideração da Personalidade',
    examOrigin: 'OAB 43 - FGV',
    question:
      'Para a aplicação da desconsideração da personalidade jurídica no âmbito das relações mercantis cíveis tradicionais (regra geral do Código Civil):',
    options: [
      { id: 'a', text: 'Basta o mero estado de insolvência ou inadimplemento contratual da sociedade empresária (teoria menor).' },
      { id: 'b', text: 'Exige-se a caracterização de abuso da personalidade jurídica, caracterizado pelo desvio de finalidade ou pela confusão patrimonial (teoria maior).' },
      { id: 'c', text: 'É vedada a desconsideração inversa da personalidade jurídica.' },
      { id: 'd', text: 'Atinge automaticamente o patrimônio pessoal de todos os sócios, independentemente de participação na fraude.' },
    ],
    correctOptionId: 'b',
    explanation:
      'Art. 50 do Código Civil (com redação da Lei 13.874/19): adota-se a Teoria Maior, exigindo cabal demonstração do desvio de finalidade ou da confusão patrimonial dolosa.',
  },
  {
    id: 'q-13',
    subject: 'Ética Profissional (OAB)',
    topic: 'Incompatibilidades e Impedimentos',
    examOrigin: 'OAB 46 - FGV',
    question:
      'Mariana, advogada com inscrição regular na OAB, é nomeada para exercer o cargo de Secretária Municipal de Finanças e Tributação. Nos termos do Estatuto da Advocacia (Lei 8.906/94):',
    options: [
      { id: 'a', text: 'Mariana permanece com capacidade postulatória plena, bastando não advogar contra o próprio município.' },
      { id: 'b', text: 'O cargo acarreta impedimento relativo apenas para a cobrança judicial de dívida ativa municipal.' },
      { id: 'c', text: 'O cargo acarreta incompatibilidade com a advocacia, mesmo em causa própria, durante todo o período em que exercer a função de ordenadora de despesas.' },
      { id: 'd', text: 'Mariana pode advogar exclusivamente no âmbito da Justiça Federal e perante os Tribunais Superiores.' },
    ],
    correctOptionId: 'c',
    explanation:
      'Art. 28, III do EAOAB: A advocacia é incompatível com as atividades de ocupantes de cargos ou funções de direção ou chefia em órgãos da administração pública com competência de lançamento, arrecadação ou fiscalização de tributos.',
  },
  {
    id: 'q-14',
    subject: 'Ética Profissional (OAB)',
    topic: 'Honorários Advocatícios e Cláusula Quota Litis',
    examOrigin: 'OAB 44 - FGV',
    question:
      'O advogado Roberto ajustou com seu cliente contrato de prestação de serviços com cláusula de êxito (quota litis). Em relação à fixação dessa cláusula, o Código de Ética e Disciplina da OAB estabelece que:',
    options: [
      { id: 'a', text: 'A cláusula quota litis é vedada em qualquer hipótese no direito brasileiro.' },
      { id: 'b', text: 'Os honorários quota litis não podem ser superiores às vantagens auferidas pelo próprio constituinte.' },
      { id: 'c', text: 'Os honorários sucumbenciais compensam obrigatoriamente a verba contratual quota litis.' },
      { id: 'd', text: 'O advogado pode reter para si a totalidade do crédito executado até o adimplemento integral da verba.' },
    ],
    correctOptionId: 'b',
    explanation:
      'Art. 50 do CED OAB: Na hipótese da adoção de cláusula quota litis, os honorários devem ser necessariamente representados por pecúnia e, somados aos de sucumbência, não podem ser superiores às vantagens advindas a favor do constituinte.',
  },
  {
    id: 'q-15',
    subject: 'Direito Constitucional',
    topic: 'Remédios Constitucionais - Mandado de Segurança',
    examOrigin: 'OAB 45 - FGV',
    question:
      'Candidato aprovado dentro do número de vagas previstas em edital de concurso público não é nomeado até o término do prazo de validade do certame. Para assegurar sua posse, ajuíza Mandado de Segurança. Diante da jurisprudência do STF (Tema 161 RG):',
    options: [
      { id: 'a', text: 'O candidato possui apenas mera expectativa de direito, não cabendo mandado de segurança.' },
      { id: 'b', text: 'O candidato tem direito subjetivo à nomeação, ressalvadas situações excepcionais gravíssimas e supervenientes justificadas pela Administração.' },
      { id: 'c', text: 'O mandado de segurança exige instrução probatória pericial para apurar o orçamento municipal.' },
      { id: 'd', text: 'O prazo decadencial para o mandado de segurança é de 5 anos contados da homologação do concurso.' },
    ],
    correctOptionId: 'b',
    explanation:
      'STF Tema 161 (Repercussão Geral): O candidato aprovado em concurso público dentro do número de vagas previsto no edital possui direito subjetivo à nomeação, admitindo-se recusa apenas em situações supervenientes, imprevisíveis, graves e necessárias.',
  },
  {
    id: 'q-16',
    subject: 'Direito Penal',
    topic: 'Teoria do Erro - Erro de Tipo e Erro de Proibição',
    examOrigin: 'OAB 46 - FGV',
    question:
      'Ao sair de uma concorrida audiência pública no Fórum, Pedro leva consigo, por engano, um notebook idêntico ao seu que estava sobre a mesa de outro colega. A conduta de Pedro caracteriza:',
    options: [
      { id: 'a', text: 'Erro de proibição direto escusável, que isenta de pena.' },
      { id: 'b', text: 'Erro de tipo essencial, que exclui o dolo, permitindo punição por culpa se previsto em lei (inexistindo furto culposo).' },
      { id: 'c', text: 'Crime consumado de apropriação indébita com causa de aumento.' },
      { id: 'd', text: 'Crime impossível por ineficácia absoluta do meio.' },
    ],
    correctOptionId: 'b',
    explanation:
      'Art. 20 do Código Penal: O erro sobre elemento constitutivo do tipo legal de crime exclui o dolo, mas permite a punição por crime culposo, se previsto em lei. Como não há previsão de furto culposo, o fato é atípico.',
  },
  {
    id: 'q-17',
    subject: 'Processo Penal',
    topic: 'Recursos no Processo Penal - Apelação e Princípios',
    examOrigin: 'OAB 45 - FGV',
    question:
      'Em recurso de apelação interposto exclusivamente pela defesa contra sentença que condenou o réu a 4 anos de reclusão em regime semiaberto, o Tribunal de Justiça agrava a pena para 6 anos em regime fechado, sob o argumento de que a matéria penal é de ordem pública. Essa decisão do Tribunal:',
    options: [
      { id: 'a', text: 'É válida, pois os Tribunais de Justiça possuem competência recursal plena e soberana.' },
      { id: 'b', text: 'Viola o princípio que veda a reformatio in pejus (Art. 617 do CPP), sendo nula a majoração penal sem recurso da acusação.' },
      { id: 'c', text: 'É lícita apenas se houver concordância expressa do Ministério Público em segundo grau.' },
      { id: 'd', text: 'Exige apenas a comprovação de que o réu era reincidente específico.' },
    ],
    correctOptionId: 'b',
    explanation:
      'Art. 617 do CPP: O tribunal não pode agravar a pena quando somente o réu houver apelado da sentença (vedação da reformatio in pejus).',
  },
  {
    id: 'q-18',
    subject: 'Direito Civil',
    topic: 'Prescrição e Decadência no Código Civil',
    examOrigin: 'OAB 44 - FGV',
    question:
      'A respeito das regras que regem a prescrição e a decadência no Código Civil de 2002, assinale a alternativa correta:',
    options: [
      { id: 'a', text: 'Os prazos prescricionais podem ser alterados ou dilatados por convenção das partes em contrato civil.' },
      { id: 'b', text: 'A prescrição pode ser interrompida mais de uma vez pelo mesmo credor durante o curso da obrigação.' },
      { id: 'c', text: 'Os prazos de prescrição não correm entre cônjuges na constância da sociedade conjugal e contra os incapazes absolutos.' },
      { id: 'd', text: 'A renúncia da prescrição pode ser manifestada antes de consumado o prazo prescricional legal.' },
    ],
    correctOptionId: 'c',
    explanation:
      'Art. 197, I e Art. 198, I do Código Civil: Não corre a prescrição entre os cônjuges na constância da sociedade conjugal e contra os menores de 16 anos. Os prazos prescricionais não podem ser alterados por acordo (Art. 192).',
  },
  {
    id: 'q-19',
    subject: 'Processo Civil',
    topic: 'Agravo de Instrumento e Tema 988 do STJ',
    examOrigin: 'OAB 46 - FGV',
    question:
      'O juiz de primeiro grau profere decisão interlocutória indeferindo pedido de redistribuição do ônus da prova com base na inversão do CDC. Inconformada, a parte pretende interpor Agravo de Instrumento. Nos termos do Código de Processo Civil:',
    options: [
      { id: 'a', text: 'O rol do Art. 1.015 do CPC é taxativo e não admite recurso algum contra indeferimento probatório.' },
      { id: 'b', text: 'A decisão é expressamente agravável com base no Art. 1.015, XI do CPC (redistribuição do ônus da prova).' },
      { id: 'c', text: 'Caberá exclusivamente mandado de segurança contra ato judicial com efeito suspensivo.' },
      { id: 'd', text: 'A matéria somente poderá ser suscitada em ação rescisória após o trânsito em julgado.' },
    ],
    correctOptionId: 'b',
    explanation:
      'Art. 1.015, XI do CPC: Cabe agravo de instrumento contra decisões interlocutórias que versarem sobre redistribuição do ônus da prova nos termos do art. 373, § 1º.',
  },
  {
    id: 'q-20',
    subject: 'Direito Administrativo',
    topic: 'Improbidade Administrativa (Lei 14.230/2021)',
    examOrigin: 'OAB 45 - FGV',
    question:
      'Com o advento das alterações promovidas pela Lei nº 14.230/2021 na Lei de Improbidade Administrativa (Lei nº 8.429/92), sobre o elemento subjetivo para a configuração de ato de improbidade:',
    options: [
      { id: 'a', text: 'Admite-se a modalidade culposa exclusivamente nos atos que causam prejuízo ao erário (Art. 10).' },
      { id: 'b', text: 'Exige-se a demonstração de dolo específico em todas as modalidades de atos de improbidade administrativa, tendo sido revogada a modalidade culposa.' },
      { id: 'c', text: 'A mera negligência no manejo de verba orçamentária continua configurando improbidade de pleno direito.' },
      { id: 'd', text: 'O dolo eventual basta para condenar o gestor público à perda dos direitos políticos.' },
    ],
    correctOptionId: 'b',
    explanation:
      'Art. 1º, §§ 1º e 2º da Lei 8.429/92 (redação pela Lei 14.230/21): Consideram-se atos de improbidade apenas as condutas dolosas tipificadas em lei, exigindo a vontade livre e consciente de alcançar o resultado ilícito (dolo específico).',
  },
  {
    id: 'q-21',
    subject: 'Direito Tributário',
    topic: 'Lançamento por Homologação e Decadência (Art. 150, §4º CTN)',
    examOrigin: 'OAB 44 - FGV',
    question:
      'Contribuinte de ICMS apura e recolhe pontualmente tributo a menor em determinado mês, sem prática de qualquer dolo, fraude ou simulação. O Fisco Estadual constata a diferença 4 anos após o pagamento. O prazo de decadência para constituir o crédito remanescente:',
    options: [
      { id: 'a', text: 'Submete-se à regra do Art. 150, §4º do CTN (5 anos contados da ocorrência do fato gerador).' },
      { id: 'b', text: 'Conta-se do primeiro dia do exercício seguinte àquele em que o lançamento poderia ter sido efetuado (Art. 173, I).' },
      { id: 'c', text: 'É imprescritível por se tratar de receita tributária constitucionalmente vinculada.' },
      { id: 'd', text: 'Extinguiu-se no prazo de 2 anos pelo instituto da remissão tácita.' },
    ],
    correctOptionId: 'a',
    explanation:
      'Havendo pagamento antecipado em tributo sujeito a lançamento por homologação e ausente fraude/dolo, a decadência rege-se pelo Art. 150, § 4º do CTN (5 anos contados do fato gerador). Súmula 555 do STJ.',
  },
  {
    id: 'q-22',
    subject: 'Direito do Trabalho',
    topic: 'Terceirização de Serviços e Tema 725 do STF',
    examOrigin: 'OAB 46 - FGV',
    question:
      'Indústria farmacêutica contrata empresa prestadora de serviços para terceirizar integralmente seu laboratório central de formulação química (atividade-fim). Conforme a tese fixada pelo STF no Tema 725 (Repercussão Geral):',
    options: [
      { id: 'a', text: 'A terceirização de atividade-fim permanece nula de pleno direito, gerando vínculo empregatício direto com a tomadora.' },
      { id: 'b', text: 'É lícita a terceirização de qualquer atividade, meio ou fim, respondendo a empresa tomadora de forma subsidiária pelas obrigações trabalhistas.' },
      { id: 'c', text: 'A empresa tomadora responderá com solidariedade automática, mesmo adimplente a prestadora.' },
      { id: 'd', text: 'Apenas empresas estatais e autarquias podem terceirizar suas atividades finalísticas.' },
    ],
    correctOptionId: 'b',
    explanation:
      'STF Tema 725: É lícita a terceirização de qualquer atividade, meio ou fim, respondendo subsidiariamente a empresa tomadora pelas obrigações trabalhistas da prestadora.',
  },
  {
    id: 'q-23',
    subject: 'Direito Ambiental',
    topic: 'Princípios do Direito Ambiental - Precaução e Prevenção',
    examOrigin: 'OAB 43 - FGV',
    question:
      'Diante da ausência de certeza científica absoluta sobre os impactos nocivos ao lençol freático decorrentes da instalação de um novo aterro químico industrial, o órgão ambiental indefere a licença prévia. A decisão fundamenta-se expressamente no princípio ambiental da:',
    options: [
      { id: 'a', text: 'Prevenção, aplicável quando os riscos e impactos científicos são plenamente certos e mensuráveis.' },
      { id: 'b', text: 'Precaução, que impõe medidas de contenção ou abstenção mesmo diante da incerteza científica sobre o perigo de dano grave ou irreversível.' },
      { id: 'c', text: 'Função socioeconômica prioritária da propriedade privada.' },
      { id: 'd', text: 'Ubiquidade territorial da poluição industrial.' },
    ],
    correctOptionId: 'b',
    explanation:
      'Princípio da Precaução: Havendo ameaça de danos graves ou irreversíveis, a ausência de certeza científica absoluta não deve ser utilizada como razão para postergar medidas eficazes de proteção ambiental.',
  },
  {
    id: 'q-24',
    subject: 'Direito Empresarial',
    topic: 'Títulos de Crédito - Aval e Endosso',
    examOrigin: 'OAB 45 - FGV',
    question:
      'Na nota promissória, a respeito dos institutos cambiários do aval e da fiança civil, assinale a afirmativa correta:',
    options: [
      { id: 'a', text: 'O avalista goza do benefício de ordem patrimonial em face do devedor principal avalizado.' },
      { id: 'b', text: 'O aval é garantia autônoma e substancialmente independente, subsistindo mesmo se a obrigação do devedor principal for nula por vício diverso de forma.' },
      { id: 'c', text: 'O aval parcial em títulos regidos pela Lei Uniforme de Genebra (LUG) é terminantemente proibido.' },
      { id: 'd', text: 'O endosso tardio ou póstumo gera os mesmos efeitos da cessão de crédito apenas se registrado em cartório.' },
    ],
    correctOptionId: 'b',
    explanation:
      'Art. 32 da LUG e Art. 899, § 2º do Código Civil: O aval é obrigação cambial autônoma e independente. A nulidade da obrigação avalizada só prejudica o aval se decorrer de vício formal intrínseco do título.',
  },
  {
    id: 'q-25',
    subject: 'Ética Profissional (OAB)',
    topic: 'Publicidade na Advocacia e Provimento 205/2021 CFCF',
    examOrigin: 'OAB 46 - FGV',
    question:
      'Escritório de advocacia promove anúncios patrocinados na internet com caráter meramente informativo sobre novidades legislativas do Direito Sucessório, sem mercantilização, sem divulgação de valores e sem promessa de resultado. Nos termos do Provimento nº 205/2021 do CFOAB:',
    options: [
      { id: 'a', text: 'A publicidade é ilícita, pois toda forma de patrocínio ou impulsionamento em redes sociais é infração ética.' },
      { id: 'b', text: 'É permitida a publicidade ativa e o impulsionamento de publicações com conteúdo meramente informativo, mantida a sobriedade e vedada a captação indevida de clientela.' },
      { id: 'c', text: 'Apenas advogados com mais de dez anos de inscrição originária podem impulsionar publicações informativas.' },
      { id: 'd', text: 'A veiculação de matéria jurídica na internet é restrita aos canais oficiais da OAB.' },
    ],
    correctOptionId: 'b',
    explanation:
      'Provimento CFOAB nº 205/2021: É permitido o impulsionamento de publicações nas redes sociais com conteúdo meramente informativo, mantida a moderação e vedada a captação de clientes ou promessa de êxito.',
  },
  {
    id: 'q-26',
    subject: 'Ética Profissional (OAB)',
    topic: 'Desagravo Público',
    examOrigin: 'OAB 44 - FGV',
    question:
      'O advogado Vinicius é publicamente ofendido em audiência de instrução por membro do Ministério Público no exercício de sua atividade profissional. Diante do Estatuto da Advocacia e da OAB (Lei 8.906/94):',
    options: [
      { id: 'a', text: 'O desagravo público depende de prévia autorização judicial do juiz presidente da audiência.' },
      { id: 'b', text: 'O desagravo público é direito do advogado ofendido no exercício da profissão ou em razão dela, podendo ser promovido de ofício ou a requerimento pelo Conselho competente da OAB.' },
      { id: 'c', text: 'Cabe exclusivamente ação de indenização por danos morais perante a Justiça Comum, sendo vedado ato de desagravo corporativo.' },
      { id: 'd', text: 'O desagravo público só pode ser concedido se houver condenação criminal prévia do ofensor com trânsito em julgado.' },
    ],
    correctOptionId: 'b',
    explanation:
      'Art. 7º, XVII do EAOAB: É direito do advogado ser desagravado publicamente, quando ofendido no exercício da profissão ou em razão dela, por decisão do Conselho competente da OAB.',
  },
  {
    id: 'q-27',
    subject: 'Ética Profissional (OAB)',
    topic: 'Infrações Disciplinares e Suspensão',
    examOrigin: 'OAB 45 - FGV',
    question:
      'Advogado regularmente inscrito recusa-se reiteradamente, sem justa causa, a prestar contas de quantias recebidas de seu constituinte após acordo judicial transitado em julgado. Nos termos do EAOAB:',
    options: [
      { id: 'a', text: 'Comete infração disciplinar punível com censura conversível em advertência secreta.' },
      { id: 'b', text: 'Pratica infração disciplinar punível com suspensão do exercício profissional, que perdura até a efetiva prestação de contas ao constituinte.' },
      { id: 'c', text: 'Fica sujeito exclusivamente a penalidade de multa civil, mantida a regularidade de sua carteira profissional.' },
      { id: 'd', text: 'A OAB não tem competência para apreciar a conduta por se tratar de matéria civil estrita.' },
    ],
    correctOptionId: 'b',
    explanation:
      'Art. 34, XXI c/c Art. 37, I e § 2º do EAOAB: A recusa injustificada em prestar contas configura infração disciplinar sancionada com suspensão, a qual perdura até que seja satisfeita a dívida ou prestadas as contas.',
  },
  {
    id: 'q-28',
    subject: 'Ética Profissional (OAB)',
    topic: 'Sociedade Unipessoal de Advocacia',
    examOrigin: 'OAB 46 - FGV',
    question:
      'A respeito da Sociedade Unipessoal de Advocacia regulamentada pela Lei nº 13.247/2016 que alterou o Estatuto da OAB:',
    options: [
      { id: 'a', text: 'O advogado titular pode integrar simultaneamente mais de uma sociedade de advogados na mesma base territorial da Seccional.' },
      { id: 'b', text: 'Nenhum advogado pode integrar mais de uma sociedade de advogados ou constituir mais de uma sociedade unipessoal com sede na mesma base territorial.' },
      { id: 'c', text: 'A sociedade unipessoal adquire personalidade jurídica com o registro de seus atos constitutivos na Junta Comercial do Estado.' },
      { id: 'd', text: 'É admitida a participação de sócio leigo que exerça atividade administrativa no quadro societário.' },
    ],
    correctOptionId: 'b',
    explanation:
      'Art. 15, § 4º do EAOAB: Nenhum advogado pode integrar mais de uma sociedade de advogados, constituir mais de uma sociedade unipessoal ou integrar simultaneamente ambas com sede na mesma área do Conselho Seccional.',
  },
  {
    id: 'q-29',
    subject: 'Direito Constitucional',
    topic: 'Processo Legislativo - Medidas Provisórias',
    examOrigin: 'OAB 45 - FGV',
    question:
      'O Presidente da República edita Medida Provisória sobre matéria de Direito Penal com a finalidade de agravar a pena de determinado delito patrimonial. À luz da Constituição Federal de 1988:',
    options: [
      { id: 'a', text: 'A medida provisória é válida se aprovada pelo Congresso Nacional no prazo improrrogável de 60 dias.' },
      { id: 'b', text: 'É expressamente vedada a edição de medidas provisórias sobre matéria relativa a direito penal, direito processual penal e processual civil (Art. 62, §1º, I, b da CF).' },
      { id: 'c', text: 'Apenas o Supremo Tribunal Federal pode vetar a medida provisória antes de sua apreciação pela Câmara.' },
      { id: 'd', text: 'O Presidente pode editar medida provisória penal desde que haja relevância e urgência reconhecidas por decreto.' },
    ],
    correctOptionId: 'b',
    explanation:
      'Art. 62, § 1º, I, b da CF/88: É terminantemente vedada a edição de medidas provisórias sobre matéria relativa a direito penal, processual penal e processual civil.',
  },
  {
    id: 'q-30',
    subject: 'Direito Constitucional',
    topic: 'Direitos Políticos e Inelegibilidade Reflexa',
    examOrigin: 'OAB 44 - FGV',
    question:
      'Prefeito municipal no exercício do segundo mandato consecutivo tem seu cônjuge com pretensão de concorrer ao cargo de Vereador no mesmo município. Conforme o Art. 14, § 7º da CF/88 e a Súmula Vinculante 18 do STF:',
    options: [
      { id: 'a', text: 'O cônjuge é plenamente elegível em qualquer hipótese por se tratar de cargos em poderes distintos.' },
      { id: 'b', text: 'O cônjuge é inelegível no território de jurisdição do titular, salvo se já for titular de mandato eletivo e candidato à reeleição.' },
      { id: 'c', text: 'A dissolução da sociedade conjugal durante o curso do mandato afasta imediatamente a inelegibilidade reflexa.' },
      { id: 'd', text: 'A inelegibilidade reflexa alcança apenas parentes consanguíneos, não incidindo sobre cônjuges.' },
    ],
    correctOptionId: 'b',
    explanation:
      'Art. 14, § 7º da CF/88 e Súmula Vinculante 18: São inelegíveis, no território de jurisdição do titular, o cônjuge e os parentes até o segundo grau, salvo se já titulares de mandato eletivo e candidatos à reeleição. A dissolução do casamento no curso do mandato não elide a inelegibilidade.',
  },
  {
    id: 'q-31',
    subject: 'Direito Penal',
    topic: 'Concurso de Pessoas - Cooperação Dolosamente Distinta',
    examOrigin: 'OAB 46 - FGV',
    question:
      'Lucas e Tiago combinam a prática de furto em residência. Lucas fica na calçada vigiando enquanto Tiago entra no imóvel. Inesperadamente, Tiago encontra o morador e, sem o conhecimento de Lucas, dispara um tiro matando a vítima para roubar o relógio. Nos termos do Art. 29, § 2º do Código Penal:',
    options: [
      { id: 'a', text: 'Lucas responderá compulsoriamente por latrocínio consumado com a mesma pena de Tiago.' },
      { id: 'b', text: 'Se a participação de Lucas foi dolosamente voltada a crime menos grave (furto), ser-lhe-á aplicada a pena deste, aumentada até metade caso fosse previsível o resultado mais grave.' },
      { id: 'c', text: 'Ambos serão absolvidos por excesso de terceiro na execução.' },
      { id: 'd', text: 'Lucas responderá apenas por omissão de socorro culposa.' },
    ],
    correctOptionId: 'b',
    explanation:
      'Art. 29, § 2º do Código Penal: Se algum dos concorrentes quis participar de crime menos grave, ser-lhe-á aplicada a pena deste; essa pena será aumentada até metade se o resultado mais grave era previsível.',
  },
  {
    id: 'q-32',
    subject: 'Direito Penal',
    topic: 'Crimes contra a Administração Pública - Concussão',
    examOrigin: 'OAB 43 - FGV',
    question:
      'Fiscal de posturas municipais exige, para si, diretamente, em razão do cargo público, o pagamento de R$ 3.000,00 de um comerciante para não embargar suas atividades. A conduta do agente tipifica o crime de:',
    options: [
      { id: 'a', text: 'Corrupção passiva (Art. 317 CP).' },
      { id: 'b', text: 'Concussão (Art. 316 CP), em razão do núcleo do tipo exigir vantagem indevida.' },
      { id: 'c', text: 'Prevaricação dolosa (Art. 319 CP).' },
      { id: 'd', text: 'Advocacia administrativa (Art. 321 CP).' },
    ],
    correctOptionId: 'b',
    explanation:
      'Art. 316 do Código Penal: Exigir, para si ou para outrem, direta ou indiretamente, vantagem indevida em razão da função configura Concussão (diferente da corrupção passiva, que consiste em solicitar ou receber).',
  },
  {
    id: 'q-33',
    subject: 'Processo Penal',
    topic: 'Provas Ilícitas por Derivação',
    examOrigin: 'OAB 45 - FGV',
    question:
      'Agentes policiais violam domicílio sem autorização judicial e sem situação de flagrância, encontrando papéis que revelam a chave de um armário em terminal rodoviário onde havia entorpecentes. Sobre a prova obtida no armário:',
    options: [
      { id: 'a', text: 'É plenamente válida por se tratar de apreensão em local público.' },
      { id: 'b', text: 'É ilícita por derivação (teoria dos frutos da árvore envenenada), devendo ser desentranhada, salvo se provada fonte independente ou descoberta inevitável (Art. 157, §1º CPP).' },
      { id: 'c', text: 'Pode ser convalidada se o Ministério Público oferecer denúncia fundamentada.' },
      { id: 'd', text: 'A ilicitude alcança exclusivamente o flagrante, preservando o valor probatório pericial.' },
    ],
    correctOptionId: 'b',
    explanation:
      'Art. 157, § 1º do CPP: São inadmissíveis as provas ilícitas e as derivadas das ilícitas, salvo quando não evidenciado o nexo de causalidade ou quando as derivadas puderem ser obtidas por fonte independente.',
  },
  {
    id: 'q-34',
    subject: 'Processo Penal',
    topic: 'Acordo de Não Persecução Penal (ANPP)',
    examOrigin: 'OAB 44 - FGV',
    question:
      'Em investigação por crime de furto simples (pena mínima de 1 ano, sem violência ou grave ameaça), o indiciado confessa formal e circunstanciadamente os fatos perante o Ministério Público. Conforme o Art. 28-A do CPP:',
    options: [
      { id: 'a', text: 'O ANPP é expressamente vedado em crimes patrimoniais de qualquer espécie.' },
      { id: 'b', text: 'O Ministério Público poderá propor o ANPP desde que a infração tenha pena mínima inferior a 4 anos e a medida seja necessária e suficiente para reprovação e prevenção do crime.' },
      { id: 'c', text: 'A celebração do acordo gera reincidência imediata na ficha de antecedentes do investigado.' },
      { id: 'd', text: 'O acordo homologado dispensa qualquer cumprimento de condições estipuladas.' },
    ],
    correctOptionId: 'b',
    explanation:
      'Art. 28-A do CPP: Não sendo caso de arquivamento e tendo o investigado confessado formal e circunstancialmente a prática de infração penal sem violência ou grave ameaça e com pena mínima inferior a 4 anos, o MP poderá propor o ANPP.',
  },
  {
    id: 'q-35',
    subject: 'Direito Civil',
    topic: 'Sucessão Legítima e Concorrência do Cônjuge',
    examOrigin: 'OAB 45 - FGV',
    question:
      'João falece deixando dois filhos e sua cônjuge Maria, casada pelo regime da comunhão parcial de bens. Deixou patrimônio comum adquirido na constância da união e um apartamento particular adquirido antes do casamento. Na sucessão de João:',
    options: [
      { id: 'a', text: 'Maria herda em concorrência com os filhos sobre todos os bens comuns e particulares de forma igualitária.' },
      { id: 'b', text: 'Maria é meeira dos bens comuns e concorre com os descendentes como herdeira exclusivamente sobre os bens particulares deixados pelo autor da herança.' },
      { id: 'c', text: 'O cônjuge casado na comunhão parcial nunca concorre com descendentes sucessores.' },
      { id: 'd', text: 'Os filhos herdam a totalidade do patrimônio particular sem qualquer participação da viúva.' },
    ],
    correctOptionId: 'b',
    explanation:
      'Art. 1.829, I do Código Civil e jurisprudência pacífica do STJ: Na comunhão parcial de bens, o cônjuge sobrevivo concorre com os descendentes apenas quanto aos bens particulares do de cujus, pois nos bens comuns já possui a meação.',
  },
  {
    id: 'q-36',
    subject: 'Direito Civil',
    topic: 'Usucapião Especial Urbana',
    examOrigin: 'OAB 43 - FGV',
    question:
      'Cidadão possui como sua, sem interrupção e sem oposição, por 5 anos, área urbana de 180 m², utilizando-a para moradia de sua família, não sendo proprietário de outro imóvel urbano ou rural. Conforme o Art. 1.240 do Código Civil:',
    options: [
      { id: 'a', text: 'Adquire o domínio pela usucapião especial urbana, benefício que não pode ser reconhecido ao mesmo possuidor mais de uma vez.' },
      { id: 'b', text: 'Exige-se justo título registrado em cartório imobiliário.' },
      { id: 'c', text: 'O prazo legal da usucapião urbana é de 10 anos ininterruptos.' },
      { id: 'd', text: 'Imóveis inferiores a 250 m² não admitem usucapião constitucional.' },
    ],
    correctOptionId: 'a',
    explanation:
      'Art. 1.240 do Código Civil: Aquele que possuir como sua área urbana de até 250 m², por cinco anos ininterruptamente e sem oposição, utilizando-a para moradia familiar, adquirir-lhe-á o domínio, desde que não seja proprietário de outro imóvel urbano ou rural. Esse direito não é concedido mais de uma vez.',
  },
  {
    id: 'q-37',
    subject: 'Processo Civil',
    topic: 'Cumprimento de Sentença e Multa do Art. 523',
    examOrigin: 'OAB 46 - FGV',
    question:
      'Em cumprimento definitivo de sentença condenatória de quantia certa, o devedor regularmente intimado deixa transcorrer in albis o prazo de 15 dias sem efetuar o pagamento. Conforme o Código de Processo Civil:',
    options: [
      { id: 'a', text: 'O débito é acrescido de multa de 10% e honorários de 10%, iniciando-se o prazo de 15 dias para impugnação independentemente de penhora.' },
      { id: 'b', text: 'O processo é arquivado provisoriamente com baixa na distribuição.' },
      { id: 'c', text: 'A impugnação do executado exige caução em dinheiro correspondente a 50% do débito.' },
      { id: 'd', text: 'Os honorários de execução excluem a incidência de qualquer penalidade monetária.' },
    ],
    correctOptionId: 'a',
    explanation:
      'Art. 523, § 1º c/c Art. 525 do CPC: Não ocorrendo pagamento voluntário no prazo de 15 dias, o débito é acrescido de multa de 10% e honorários de 10%. Transcorrido esse prazo, inicia-se o prazo de 15 dias para impugnação independentemente de nova penhora.',
  },
  {
    id: 'q-38',
    subject: 'Processo Civil',
    topic: 'Gratuidade da Justiça para Pessoa Jurídica',
    examOrigin: 'OAB 44 - FGV',
    question:
      'Sociedade limitada comercial com fins lucrativos formula pedido de gratuidade de justiça alegando grave crise financeira. Conforme o enunciado da Súmula 481 do STJ:',
    options: [
      { id: 'a', text: 'A pessoa jurídica tem direito à gratuidade mediante simples afirmação na petição inicial.' },
      { id: 'b', text: 'Faz jus ao benefício da justiça gratuita a pessoa jurídica com ou sem fins lucrativos que demonstrar sua impossibilidade de arcar com os encargos processuais.' },
      { id: 'c', text: 'É vedada a concessão de gratuidade a qualquer pessoa jurídica no direito processual brasileiro.' },
      { id: 'd', text: 'A concessão restringe-se exclusivamente a entidades filantrópicas de utilidade pública.' },
    ],
    correctOptionId: 'b',
    explanation:
      'Súmula 481 do STJ: Faz jus ao benefício da justiça gratuita a pessoa jurídica com ou sem fins lucrativos que demonstrar sua impossibilidade de arcar com os encargos processuais.',
  },
  {
    id: 'q-39',
    subject: 'Direito Administrativo',
    topic: 'Responsabilidade Civil Objetiva do Estado',
    examOrigin: 'OAB 45 - FGV',
    question:
      'Ponte pública mantida por autarquia de trânsito estadual colapsa por falha de manutenção periódica comprovada, danificando veículos de cidadãos que passavam no local. A responsabilidade do ente público:',
    options: [
      { id: 'a', text: 'É subjetiva, dependendo da prova da conduta culposa individualizada de cada servidor.' },
      { id: 'b', text: 'É objetiva fundamentada na teoria do risco administrativo (Art. 37, § 6º da CF/88), bastando comprovação do dano e do nexo causal com o serviço público.' },
      { id: 'c', text: 'Fica afastada por configurar caso fortuito de força maior.' },
      { id: 'd', text: 'É subsidiária em face da empresa que construiu a ponte há 30 anos.' },
    ],
    correctOptionId: 'b',
    explanation:
      'Art. 37, § 6º da Constituição Federal: As pessoas jurídicas de direito público e as de direito privado prestadoras de serviços públicos responderão pelos danos que seus agentes causarem a terceiros, assegurado o regresso (Teoria do Risco Administrativo).',
  },
  {
    id: 'q-40',
    subject: 'Direito Administrativo',
    topic: 'Licitações - Diálogo Competitivo (Lei 14.133/21)',
    examOrigin: 'OAB 46 - FGV',
    question:
      'Nos termos da Nova Lei de Licitações (Lei nº 14.133/21), a modalidade licitatória destinada à contratação de soluções complexas em que a Administração realiza diálogos com licitantes previamente selecionados com critérios objetivos para desenvolver alternativas técnicas viáveis denomina-se:',
    options: [
      { id: 'a', text: 'Concurso Público.' },
      { id: 'b', text: 'Diálogo Competitivo.' },
      { id: 'c', text: 'Tomada de Preços Especial.' },
      { id: 'd', text: 'Leilão Eletrônico.' },
    ],
    correctOptionId: 'b',
    explanation:
      'Art. 6º, XLII da Lei 14.133/2021: Diálogo competitivo é a modalidade de licitação para contratação de obras, serviços e compras em que a Administração Pública dialoga com licitantes previamente selecionados para encontrar alternativas e soluções técnicas inovadoras.',
  },
  {
    id: 'q-41',
    subject: 'Direito Tributário',
    topic: 'Responsabilidade de Sócios e Súmula 430 STJ',
    examOrigin: 'OAB 45 - FGV',
    question:
      'Sociedade limitada deixa de pagar tributo declarado devido a dificuldades no fluxo de caixa no exercício. A Procuradoria Fazendária requer o redirecionamento imediato da execução contra o administrador. Conforme a Súmula 430 do STJ:',
    options: [
      { id: 'a', text: 'O inadimplemento da obrigação tributária pela sociedade não gera, por si só, a responsabilidade solidária do sócio-gerente.' },
      { id: 'b', text: 'O sócio-administrador responde objetiva e automaticamente por toda dívida tributária empresarial.' },
      { id: 'c', text: 'A responsabilidade do sócio prescinde de prova de fraude ou excesso de poderes.' },
      { id: 'd', text: 'O não recolhimento de tributo presume dissolução irregular automática.' },
    ],
    correctOptionId: 'a',
    explanation:
      'Súmula 430 do STJ: O inadimplemento da obrigação tributária pela sociedade não gera, por si só, a responsabilidade solidária do sócio-gerente, sendo indispensável a prática de atos com excesso de mandato, infração à lei ou dissolução irregular.',
  },
  {
    id: 'q-42',
    subject: 'Direito Tributário',
    topic: 'Anterioridade Nonagesimal e Contribuições Sociais',
    examOrigin: 'OAB 44 - FGV',
    question:
      'Lei federal publicada no mês de dezembro institui nova contribuição social voltada à Seguridade Social. Nos termos do Art. 195, § 6º da Constituição Federal:',
    options: [
      { id: 'a', text: 'Deve respeitar tanto a anterioridade de exercício quanto a noventena cumulativamente.' },
      { id: 'b', text: 'Submete-se apenas à anterioridade nonagesimal (noventena), podendo ser cobrada após 90 dias da publicação da lei instituidora.' },
      { id: 'c', text: 'Gera efeitos fiscais imediatos a partir do primeiro dia útil subsequente.' },
      { id: 'd', text: 'Exige lei complementar de iniciativa privativa da Mesa do Senado.' },
    ],
    correctOptionId: 'b',
    explanation:
      'Art. 195, § 6º da CF/88: As contribuições sociais de seguridade social só poderão ser exigidas após decorridos noventa dias da data da publicação da lei que as houver instituído ou modificado, não se lhes aplicando a anterioridade do exercício.',
  },
  {
    id: 'q-43',
    subject: 'Direito do Trabalho',
    topic: 'Teletrabalho e Equipamentos Tecnológicos',
    examOrigin: 'OAB 46 - FGV',
    question:
      'Empregado contratado para regime de teletrabalho (home office) utiliza seu próprio notebook pessoal e rede doméstica para trabalhar. Conforme os Arts. 75-A a 75-F da CLT:',
    options: [
      { id: 'a', text: 'As disposições sobre responsabilidade pelo fornecimento e reembolso de despesas de infraestrutura devem ser estipuladas em contrato escrito e tais reembolsos não integram a remuneração.' },
      { id: 'b', text: 'Os reembolsos de infraestrutura integram o salário para fins de FGTS e recolhimento previdenciário.' },
      { id: 'c', text: 'O regime de teletrabalho impede qualquer presença física nas instalações da empresa tomadora.' },
      { id: 'd', text: 'A modalidade home office só é admitida para cargos de diretoria executiva.' },
    ],
    correctOptionId: 'a',
    explanation:
      'Art. 75-D da CLT: A responsabilidade pela aquisição, manutenção ou fornecimento de equipamentos e infraestrutura, bem como o reembolso de despesas comprovadas, deve constar de contrato escrito e não integra a remuneração.',
  },
  {
    id: 'q-44',
    subject: 'Direito do Trabalho',
    topic: 'Estabilidade Provisória da Gestante e Aviso Prévio',
    examOrigin: 'OAB 45 - FGV',
    question:
      'Empregada toma ciência de sua gravidez durante o curso do aviso prévio indenizado. O empregador nega direito à garantia de emprego. Conforme o Art. 10, II, b do ADCT e a jurisprudência sumulada do TST:',
    options: [
      { id: 'a', text: 'A confirmação da gravidez no curso do aviso prévio trabalhado ou indenizado garante estabilidade provisória desde a concepção até 5 meses após o parto.' },
      { id: 'b', text: 'A estabilidade gestacional exige aviso prévio trabalhado, não se aplicando ao aviso indenizado.' },
      { id: 'c', text: 'A ausência de comunicação prévia antes da rescisão afasta toda proteção constitucional.' },
      { id: 'd', text: 'A gestante deve ter mais de 1 ano de vínculo para ter direito à indenização substitutiva.' },
    ],
    correctOptionId: 'a',
    explanation:
      'Súmula 244, III do TST e Art. 391-A da CLT: A confirmação do estado de gravidez advindo no curso do contrato de trabalho, ainda que durante o prazo do aviso prévio trabalhado ou indenizado, garante à empregada a estabilidade provisória.',
  },
  {
    id: 'q-45',
    subject: 'Processo do Trabalho',
    topic: 'Revelia e Presença de Advogado (Art. 844 CLT)',
    examOrigin: 'OAB 44 - FGV',
    question:
      'Em audiência inicial na Justiça do Trabalho, a reclamada não comparece nem envia preposto credenciado, mas seu advogado comparece portando procuração válida e contestação com documentos. Conforme o Art. 844, § 5º da CLT:',
    options: [
      { id: 'a', text: 'O juiz deve desconsiderar totalmente a presença do advogado e recusar a contestação.' },
      { id: 'b', text: 'Ainda que ausente o reclamado, presente o advogado na audiência, serão aceitos a contestação e os documentos eventualmente apresentados.' },
      { id: 'c', text: 'O processo deve ser extinto sem exame do mérito de plano.' },
      { id: 'd', text: 'A revelia é afastada apenas se o advogado for sócio cotista da reclamada.' },
    ],
    correctOptionId: 'b',
    explanation:
      'Art. 844, § 5º da CLT: Ainda que ausente o reclamado, presente o advogado na audiência, serão aceitos a contestação e os documentos eventualmente apresentados, analisando o magistrado a matéria fática sob o contraditório.',
  },
  {
    id: 'q-46',
    subject: 'Direitos Humanos',
    topic: 'Eficácia das Decisões da Corte Interamericana',
    examOrigin: 'OAB 46 - FGV',
    question:
      'O Estado brasileiro é condenado em sentença definitiva pela Corte Interamericana de Direitos Humanos ao pagamento de indenização a vítimas de violações de garantias fundamentais. Sobre a eficácia dessa sentença no Brasil:',
    options: [
      { id: 'a', text: 'A sentença da Corte IDH possui força executiva imediata e dispensa homologação perante o Superior Tribunal de Justiça (STJ).' },
      { id: 'b', text: 'Depende de prévia ação homologatória perante o plenário do STF.' },
      { id: 'c', text: 'Possui caráter meramente opinativo, cabendo ao Congresso Nacional ratificar a indenização.' },
      { id: 'd', text: 'A decisão internacional não pode vincular verbas do orçamento público federal.' },
    ],
    correctOptionId: 'a',
    explanation:
      'Art. 68 do Pacto de San José da Costa Rica (CADH) e jurisprudência do STJ: A sentença da Corte IDH que determinar indenização compensatória é título executivo judicial diretamente exequível contra o Estado, dispensando homologação pelo STJ.',
  },
  {
    id: 'q-47',
    subject: 'Direito Empresarial',
    topic: 'Ordem de Pagamento dos Créditos na Falência',
    examOrigin: 'OAB 45 - FGV',
    question:
      'Em falência decretada, acerca da ordem legal de preferência de pagamento dos credores concorrentes estipulada pelo Art. 83 da Lei nº 11.101/2005:',
    options: [
      { id: 'a', text: 'Os créditos trabalhistas (limitados a 150 salários-mínimos por credor) e os decorrentes de acidentes de trabalho têm preferência sobre os créditos reais, tributários e quirografários.' },
      { id: 'b', text: 'Os créditos quirografários são pagos antes dos créditos com garantia real.' },
      { id: 'c', text: 'Créditos tributários municipais e estaduais têm prioridade sobre acidentes de trabalho.' },
      { id: 'd', text: 'Os credores subordinados recebem concomitantemente com os trabalhistas.' },
    ],
    correctOptionId: 'a',
    explanation:
      'Art. 83, I da Lei 11.101/2005: A classificação dos créditos na falência obedece à ordem legal, encabezada pelos créditos derivados da legislação trabalhista (até 150 salários-mínimos por credor) e de acidentes de trabalho, seguidos dos créditos com garantia real e tributários.',
  },
  {
    id: 'q-48',
    subject: 'Direito do Consumidor',
    topic: 'Fato do Produto e Prazo Prescricional (Art. 12 CDC)',
    examOrigin: 'OAB 46 - FGV',
    question:
      'Aparelho televisor novo adquirido por consumidor explode na tomada durante o uso comum, provocando lesões corporais e incêndio na sala. Diante do Código de Defesa do Consumidor:',
    options: [
      { id: 'a', text: 'Trata-se de mero vício do produto com prazo decadencial de 90 dias.' },
      { id: 'b', text: 'Trata-se de fato do produto (acidente de consumo), respondendo o fabricante objetivamente, com prazo prescricional de 5 anos para pretensão indenizatória (Art. 27 CDC).' },
      { id: 'c', text: 'O fabricante só responde se houver culpa dolosa na linha de produção.' },
      { id: 'd', text: 'O comerciante responde primariamente mesmo identificado claramente o fabricante.' },
    ],
    correctOptionId: 'b',
    explanation:
      'Art. 12 e Art. 27 do CDC: O defeito de segurança que causa danos à integridade física do consumidor caracteriza fato do produto (acidente de consumo). A responsabilidade do fabricante é objetiva e prescreve em 5 anos a pretensão à reparação.',
  },
  {
    id: 'q-49',
    subject: 'Direito Ambiental',
    topic: 'Responsabilidade Civil Ambiental e Teoria do Risco Integral',
    examOrigin: 'OAB 44 - FGV',
    question:
      'Empresa mineradora causa rompimento de barragem de rejeitos que atinge bacia hidrográfica regional. A mineradora alega que chuvas excepcionais configuraram caso fortuito para afastar seu dever reparatório. Conforme o Art. 14, § 1º da Lei 6.938/81 e a jurisprudência pacífica do STJ:',
    options: [
      { id: 'a', text: 'A responsabilidade civil por dano ambiental é objetiva informada pela Teoria do Risco Integral, não admitindo excludentes como caso fortuito ou força maior para elidir o dever de indenizar.' },
      { id: 'b', text: 'O caso fortuito ou força maior exclui a responsabilidade patrimonial da empresa poluidora.' },
      { id: 'c', text: 'A obrigação reparatória exige demonstração de imperícia dos engenheiros responsáveis.' },
      { id: 'd', text: 'A responsabilidade ambiental no Brasil é subjetiva com inversão do ônus da prova.' },
    ],
    correctOptionId: 'a',
    explanation:
      'Art. 14, § 1º da Lei 6.938/81 e Tema 999 STF / Súmula 618 STJ: A responsabilidade por dano ambiental é objetiva e fundamentada na Teoria do Risco Integral, sendo inaplicáveis excludentes de culpa de terceiro, caso fortuito ou força maior.',
  },
  {
    id: 'q-50',
    subject: 'Filosofia do Direito',
    topic: 'Positivismo Jurídico e Hans Kelsen',
    examOrigin: 'OAB 46 - FGV',
    question:
      'Na célebre obra "Teoria Pura do Direito", o jurista Hans Kelsen fundamenta a ciência jurídica em bases epistemológicas autônomas. Segundo a teoria kelseniana:',
    options: [
      { id: 'a', text: 'O Direito confunde-se necessariamente com o Direito Natural e com ideais morais transcendentais.' },
      { id: 'b', text: 'A validade da norma jurídica advém de seu fundamento em norma hierarquicamente superior até a Norma Fundamental hipotética (Grundnorm), depurando a ciência do Direito de elementos morais e sociológicos.' },
      { id: 'c', text: 'Apenas normas aprovadas por referendo popular direto possuem imperatividade jurídica.' },
      { id: 'd', text: 'As leis que contrariam o senso comum perdem a vigência de forma automática.' },
    ],
    correctOptionId: 'b',
    explanation:
      'Hans Kelsen postula a pureza metodológica da ciência do Direito, separando o juízo normativo (dever-ser) da moral e dos fatos sociológicos. A validade jurídica assenta-se na estrutura escalonada das normas (Stufenbau), culminando na Norma Fundamental (Grundnorm).',
  },
];

export const initialSessions: StudySession[] = [];
