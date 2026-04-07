export type DocumentoEstrutura = {
  nomeDocumento: string;
  nomeAlternativo?: string[];
  titulosObrigatorios: string[];
  camposObrigatorios: string[];
  camposOpcionais?: string[];
  elementosVisuaisObrigatorios?: string[];
  padroes?: {
    tamanhoPagina?: string;
    cores?: string[];
    assinatura?: boolean;
    hologramas?: boolean;
    codigoBarras?: boolean;
    qrCode?: boolean;
  };
};

export const documentosEstrutura: DocumentoEstrutura[] = [
  {
    nomeDocumento: "RG",
    nomeAlternativo: ["Carteira de Identidade", "Registro Geral"],
    titulosObrigatorios: ["Carteira de Identidade", "Registro Geral"],
    camposObrigatorios: ["Nome", "Número do RG", "Data de Nascimento"],
    camposOpcionais: ["CPF", "Nome da mãe", "UF", "Órgão emissor"],
    elementosVisuaisObrigatorios: ["Foto", "Assinatura", "Filiação"],
    padroes: {
      tamanhoPagina: "A7 (horizontal)",
      cores: ["azul", "branco", "preto"],
      assinatura: true,
      hologramas: true,
    },
  },
  {
    nomeDocumento: "CPF",
    nomeAlternativo: ["Cadastro de Pessoas Físicas"],
    titulosObrigatorios: ["Cadastro de Pessoas Físicas", "CPF"],
    camposObrigatorios: ["Nome", "Número do CPF"],
    camposOpcionais: ["Data de Nascimento", "Inscrição"],
    padroes: {
      cores: ["verde", "branco", "preto"],
      codigoBarras: true,
    },
  },
  {
    nomeDocumento: "CNH",
    nomeAlternativo: ["Carteira Nacional de Habilitação"],
    titulosObrigatorios: ["Carteira Nacional de Habilitação", "CNH"],
    camposObrigatorios: ["Nome", "Número de Registro", "Categoria", "Validade"],
    camposOpcionais: ["CPF", "Data de Nascimento", "CNH"],
    elementosVisuaisObrigatorios: ["Foto", "Assinatura"],
    padroes: {
      cores: ["laranja", "branco", "preto"],
      qrCode: true,
      hologramas: true,
    },
  },
  {
    nomeDocumento: "Passaporte",
    nomeAlternativo: ["Passaporte Brasileiro"],
    titulosObrigatorios: ["Passaporte", "Brasão", "Brasil"],
    camposObrigatorios: ["Número de Passaporte", "Nome", "Data de Nascimento"],
    camposOpcionais: ["Filiação", "Naturalidade"],
    elementosVisuaisObrigatorios: ["Foto", "Assinatura", "Brasão"],
    padroes: {
      tamanhoPagina: "A5",
      cores: ["vinho", "dourado", "branco"],
      hologramas: true,
    },
  },
  {
    nomeDocumento: "Cartão CNPJ",
    nomeAlternativo: ["CNPJ"],
    titulosObrigatorios: ["Cadastro Nacional da Pessoa Jurídica", "CNPJ"],
    camposObrigatorios: ["Razão Social", "Número do CNPJ"],
    camposOpcionais: ["Data de Inscrição"],
  },
  {
    nomeDocumento: "Certidão de Nascimento",
    nomeAlternativo: ["Registro de Nascimento"],
    titulosObrigatorios: ["Cartório", "Registro de Nascimento"],
    camposObrigatorios: ["Nome", "Data de Nascimento", "Filiação"],
    elementosVisuaisObrigatorios: ["Brasão", "Assinatura do Cartorário"],
  },
  {
    nomeDocumento: "Certificado Médico",
    nomeAlternativo: ["Atestado Médico", "Atestado"],
    titulosObrigatorios: ["Certificado", "Atestado Médico"],
    camposObrigatorios: [
      "Nome do Paciente",
      "Data",
      "Nome do Médico",
      "CRM",
      "Diagnóstico ou Motivo",
    ],
    elementosVisuaisObrigatorios: ["Carimbo CRMB", "Assinatura do Médico"],
    padroes: {
      cores: ["branco", "preto"],
    },
  },
  {
    nomeDocumento: "Contrato",
    nomeAlternativo: ["Acordo", "Termo"],
    titulosObrigatorios: ["Contrato", "Acordo"],
    camposObrigatorios: ["Título do contrato", "Partes envolvidas", "Data"],
    camposOpcionais: ["Assinaturas", "Assinado digitalmente"],
  },
];
