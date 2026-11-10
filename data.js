const OFICINA = {
  nome: "RevNissan",
  slogan: "Revisão especializada para o seu Nissan",
  whatsapp: "5500000000000", // DDI + DDD + número, só dígitos
  validadePrecos: "30/11/2026",
  parcelasMax: 10,
};

// tipo: suv | sedan | hatch | pickup | ev  (define o desenho do carro)
// precos: valor da revisão por etapa (10k, 20k, 30k, 40k, 50k, 60k)
const MODELOS = [
  { id: "kait",        nome: "Nissan Kait",        tipo: "suv",    cor: "#c8102e", anos: [2026, 2027],            motores: ["1.6"],         precos: [885, 1333, 997, 1781, 997, 1557] },
  { id: "kicks",       nome: "Nissan Kicks",       tipo: "suv",    cor: "#b5121b", anos: [2026, 2027],            motores: ["1.0 T"],       precos: [1018, 1445, 1109, 1893, 1109, 1669] },
  { id: "versa",       nome: "Nissan Versa",       tipo: "sedan",  cor: "#8a8d91", anos: [2021, 2022, 2023, 2024, 2025, 2026], motores: ["1.6"], precos: [773, 1221, 885, 1669, 885, 1445] },
  { id: "frontier",    nome: "Nissan Frontier",    tipo: "pickup", cor: "#3a3d42", anos: [2023, 2024, 2025, 2026], motores: ["2.3 Bi-Turbo Diesel"], precos: [1557, 2229, 1669, 2901, 1669, 2565] },
  { id: "kicks-old",   nome: "Nissan Kicks 2016-2024", tipo: "suv", cor: "#e0e0e0", anos: [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024], motores: ["1.6"], precos: [773, 1221, 885, 1669, 885, 1445] },
  { id: "sentra",      nome: "Sentra",             tipo: "sedan",  cor: "#1f3a5f", anos: [2023, 2024, 2025, 2026], motores: ["2.0"], precos: [997, 1445, 1109, 1893, 1109, 1669] },
  { id: "kicks-play",  nome: "Nissan Kicks Play",  tipo: "suv",    cor: "#f2f2f2", anos: [2025, 2026],            motores: ["1.6"],         precos: [773, 1221, 885, 1669, 885, 1445] },
  { id: "leaf",        nome: "Nissan Leaf",        tipo: "ev",     cor: "#2b6cb0", anos: [2020, 2021, 2022, 2023, 2024], motores: ["Elétrico"], precos: [437, 661, 437, 885, 437, 661] },
  { id: "march",       nome: "Nissan March",       tipo: "hatch",  cor: "#d64545", anos: [2014, 2015, 2016, 2017, 2018, 2019, 2020], motores: ["1.0", "1.6"], precos: [661, 997, 773, 1445, 773, 1221] },
  { id: "v-drive",     nome: "Nissan V-Drive",     tipo: "sedan",  cor: "#9aa0a6", anos: [2020, 2021, 2022, 2023], motores: ["1.0", "1.6"], precos: [661, 997, 773, 1445, 773, 1221] },
  { id: "tiida",       nome: "Nissan Tiida",       tipo: "hatch",  cor: "#4a5568", anos: [2008, 2009, 2010, 2011, 2012, 2013], motores: ["1.8"], precos: [661, 997, 773, 1445, 773, 1221] },
  { id: "livina",      nome: "Nissan Livina",      tipo: "hatch",  cor: "#718096", anos: [2010, 2011, 2012, 2013, 2014], motores: ["1.6", "1.8"], precos: [661, 997, 773, 1445, 773, 1221] },
  { id: "gran-livina", nome: "Nissan Gran Livina", tipo: "hatch",  cor: "#2d3748", anos: [2010, 2011, 2012, 2013, 2014], motores: ["1.8"], precos: [661, 997, 773, 1445, 773, 1221] },
  { id: "x-gear",      nome: "Nissan Livina X-Gear", tipo: "hatch", cor: "#b7791f", anos: [2010, 2011, 2012, 2013, 2014], motores: ["1.6", "1.8"], precos: [661, 997, 773, 1445, 773, 1221] },
  { id: "altima",      nome: "Nissan Altima",      tipo: "sedan",  cor: "#1a202c", anos: [2008, 2009, 2010, 2011, 2012], motores: ["2.5"], precos: [997, 1445, 1109, 1893, 1109, 1669] },
];

const ETAPAS = [
  { km: 10000, meses: 12 },
  { km: 20000, meses: 24 },
  { km: 30000, meses: 36 },
  { km: 40000, meses: 48 },
  { km: 50000, meses: 60 },
  { km: 60000, meses: 72 },
];

// Itens por etapa. "a partir de" = índice da etapa (0 = 10 mil km).
// "cada" = repete a cada N etapas a partir do início.
const ITENS_SUBSTITUIDOS = [
  { nome: "Óleo do motor (especificação do manual)", cada: 1 },
  { nome: "Filtro de óleo", cada: 1 },
  { nome: "Anel de vedação do bujão", cada: 1 },
  { nome: "Filtro de ar do motor", cada: 1 },
  { nome: "Filtro de combustível", cada: 1, semEV: true },
  { nome: "Filtro do ar-condicionado", cada: 2 },
  { nome: "Fluido de freio", cada: 2 },
  { nome: "Velas de ignição", cada: 4, semEV: true, semDiesel: true },
  { nome: "Correia de acessórios", cada: 6, semEV: true },
];

const ITENS_INSPECIONADOS = [
  "Líquido de arrefecimento (nível e vazamentos)",
  "Fluido de freio e embreagem (nível e vazamentos)",
  "Direção assistida (fluido, linhas e folgas)",
  "Fluido da transmissão (nível e vazamentos)",
  "Pastilhas, discos e demais componentes do freio",
  "Suspensão, amortecedores e coifas",
  "Pneus (calibragem, desgaste e rodízio)",
  "Travas, dobradiças e trava do capô",
  "Freio de estacionamento e embreagem (folga e curso)",
  "Bateria e sistema elétrico",
  "Iluminação externa e palhetas",
];
