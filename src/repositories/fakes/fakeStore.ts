import type { Activity, ActivityKind } from '@/models/Activity';
import type { FinancialStatus, VisitStatus } from '@/models/Client';
import type { Product } from '@/models/Product';
import type { Promoter } from '@/models/Promoter';
import type { QuestionnaireAnswers } from '@/models/Questionnaire';
import type { Ruptura, RupturaSeverity } from '@/models/Ruptura';
import type { VisitOutcome, VisitReason } from '@/models/Visit';
import type { Coordinates } from '@/shared/utils/geo';

/**
 * Estado em memória compartilhado por todos os `Fake*Repository` (modo
 * mock, ver `docs/DECISIONS.md` item 17). Um único módulo/singleton para
 * que uma mutação feita por um repositório (ex.: check-in) seja visível
 * pelos outros (ex.: Dashboard) — como um backend real se comportaria,
 * só que sem rede e sem persistir entre reinícios do app.
 */

interface FakeVisit {
  id: string;
  promoterId: string;
  clientId: string;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string | null;
  status: VisitStatus;
  checkedInAt: string | null;
  checkedOutAt: string | null;
  reason: VisitReason | null;
  outcome: VisitOutcome | null;
}

interface FakeClient {
  id: string;
  erpCode: string;
  cnpj: string;
  legalName: string;
  tradeName: string;
  email: string;
  phone: string;
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  creditLimit: number;
  rating: number | null;
  latitude: number;
  longitude: number;
  financialStatus: FinancialStatus;
}

function dateOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function timeToday(hh: number, mm: number, offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  d.setHours(hh, mm, 0, 0);
  return d.toISOString();
}

export const FAKE_PROMOTER: Promoter = {
  id: 'P001',
  fullName: 'João Pereira (dados fictícios)',
  email: 'joao.avert@lynkzdistribuidora.com.br',
  phone: '(99) 98111-2201',
  supplier: 'AVERT',
  isActive: true,
};

export const fakeClients: FakeClient[] = [
  {
    id: 'C001',
    erpCode: 'ERP20001',
    cnpj: '12.345.678/0001-90',
    legalName: 'PET AMIGO COMERCIO DE PRODUTOS VETERINARIOS LTDA',
    tradeName: 'Pet Amigo',
    email: 'contato@petamigo.com.br',
    phone: '(99) 3524-1180',
    address: 'Av. Getúlio Vargas, 1204',
    neighborhood: 'Centro',
    city: 'Imperatriz',
    state: 'MA',
    creditLimit: 15000,
    rating: 4,
    latitude: -4.95395,
    longitude: -47.518666,
    financialStatus: 'compliant',
  },
  {
    id: 'C002',
    erpCode: 'ERP20002',
    cnpj: '23.456.789/0001-01',
    legalName: 'CASA DO PET EIRELI',
    tradeName: 'Casa do Pet',
    email: 'financeiro@casadopet.com.br',
    phone: '(99) 3532-4477',
    address: 'Rua das Acácias, 88',
    neighborhood: 'Nova Conquista',
    city: 'Açailândia',
    state: 'MA',
    creditLimit: 8000,
    rating: 3,
    latitude: -5.350312,
    longitude: -47.474662,
    financialStatus: 'delinquent',
  },
  {
    id: 'C003',
    erpCode: 'ERP20003',
    cnpj: '34.567.890/0001-12',
    legalName: 'VET CENTER LTDA ME',
    tradeName: 'Vet Center',
    email: 'compras@vetcenter.com.br',
    phone: '(63) 3411-7722',
    address: 'Av. Bernardo Sayão, 350',
    neighborhood: 'Setor Central',
    city: 'Araguaína',
    state: 'TO',
    creditLimit: 22000,
    rating: 5,
    latitude: -6.553675,
    longitude: -47.40998,
    financialStatus: 'compliant',
  },
  {
    id: 'C004',
    erpCode: 'ERP20004',
    cnpj: '45.678.901/0001-23',
    legalName: 'MUNDO ANIMAL LTDA',
    tradeName: 'Mundo Animal',
    email: 'mundoanimal@gmail.com',
    phone: '(99) 3551-2290',
    address: 'Rua dos Ipês, 512',
    neighborhood: 'Bom Jesus',
    city: 'Grajaú',
    state: 'MA',
    creditLimit: 5000,
    rating: null,
    latitude: -7.5467300000000002,
    longitude: -46.050988,
    financialStatus: 'compliant',
  },
  {
    id: 'C005',
    erpCode: 'ERP20005',
    cnpj: '56.789.012/0001-34',
    legalName: 'PET VIDA COMERCIO DE PRODUTOS VETERINARIOS LTDA',
    tradeName: 'Pet Vida',
    email: 'atendimento@petvida.com.br',
    phone: '(94) 3324-5567',
    address: 'Av. Antônio Maia, 977',
    neighborhood: 'Nova Marabá',
    city: 'Marabá',
    state: 'PA',
    creditLimit: 12000,
    rating: 4,
    latitude: -5.81464,
    longitude: -46.142943,
    financialStatus: 'compliant',
  },
];

export const fakeVisits: FakeVisit[] = [
  {
    id: 'V001',
    promoterId: 'P001',
    clientId: 'C001',
    scheduledDate: dateOffset(0),
    scheduledTime: '09:00:00',
    status: 'scheduled',
    checkedInAt: null,
    checkedOutAt: null,
    reason: null,
    outcome: null,
  },
  {
    id: 'V002',
    promoterId: 'P001',
    clientId: 'C002',
    scheduledDate: dateOffset(0),
    scheduledTime: '10:30:00',
    status: 'scheduled',
    checkedInAt: null,
    checkedOutAt: null,
    reason: null,
    outcome: null,
  },
  {
    id: 'V003',
    promoterId: 'P001',
    clientId: 'C003',
    scheduledDate: dateOffset(0),
    scheduledTime: '14:00:00',
    status: 'scheduled',
    checkedInAt: null,
    checkedOutAt: null,
    reason: null,
    outcome: null,
  },
  {
    id: 'V004',
    promoterId: 'P001',
    clientId: 'C004',
    scheduledDate: dateOffset(-1),
    scheduledTime: '11:00:00',
    status: 'completed',
    checkedInAt: timeToday(11, 5, -1),
    checkedOutAt: timeToday(11, 47, -1),
    reason: 'routine',
    outcome: 'completed',
  },
];

export const fakeProducts: Product[] = [
  {
    id: 'PR-AVT-001',
    internalCode: 'AVT0001',
    eanCode: '7890001001006',
    supplier: 'AVERT',
    name: 'ARTROTABS VET X 30 COMP',
    category: 'Condroprotetor',
    isActive: true,
  },
  {
    id: 'PR-AVT-008',
    internalCode: 'AVT0008',
    eanCode: '7890008001009',
    supplier: 'AVERT',
    name: 'CANINUS PROTEIN BAR DISP X 16',
    category: 'Petisco',
    isActive: true,
  },
  {
    id: 'PR-AVT-009',
    internalCode: 'AVT0009',
    eanCode: '7890009001008',
    supplier: 'AVERT',
    name: 'CISTIMICIN VET 20 COMP X 30',
    category: 'Medicamento',
    isActive: true,
  },
];

interface FakeActivity extends Activity {
  visitId: string;
}

interface FakeRuptura extends Ruptura {
  clientId: string;
}

export const fakeActivities: FakeActivity[] = [];
export const fakeQuestionnaires = new Map<string, QuestionnaireAnswers>();
export const fakeRupturas: FakeRuptura[] = [];

let activitySeq = 0;
let rupturaSeq = 0;

export const fakeStore = {
  findClient(clientId: string): FakeClient | undefined {
    return fakeClients.find((c) => c.id === clientId);
  },

  visitsForPromoter(promoterId: string): FakeVisit[] {
    return fakeVisits.filter((v) => v.promoterId === promoterId);
  },

  findActiveVisit(promoterId: string): FakeVisit | undefined {
    return fakeVisits.find((v) => v.promoterId === promoterId && v.status === 'in_progress');
  },

  checkIn(visitId: string, _coords: Coordinates, occurredAt: string): void {
    const visit = fakeVisits.find((v) => v.id === visitId);
    if (!visit) return;
    visit.status = 'in_progress';
    visit.checkedInAt = occurredAt;
  },

  checkOut(
    visitId: string,
    _coords: Coordinates,
    occurredAt: string,
    reason: VisitReason,
    outcome: VisitOutcome,
  ): void {
    const visit = fakeVisits.find((v) => v.id === visitId);
    if (!visit) return;
    visit.status = 'completed';
    visit.checkedOutAt = occurredAt;
    visit.reason = reason;
    visit.outcome = outcome;
  },

  addActivity(input: { visitId: string; kind: ActivityKind; photoCount: number }): Activity {
    const activity: FakeActivity = {
      id: `fake-activity-${(activitySeq += 1)}`,
      visitId: input.visitId,
      kind: input.kind,
      status: 'completed',
      photoCount: input.photoCount,
    };
    fakeActivities.push(activity);
    return activity;
  },

  activitiesForVisit(visitId: string): Activity[] {
    return fakeActivities.filter((a) => a.visitId === visitId);
  },

  setQuestionnaire(visitId: string, answers: QuestionnaireAnswers): void {
    fakeQuestionnaires.set(visitId, answers);
  },

  getQuestionnaire(visitId: string): QuestionnaireAnswers | null {
    return fakeQuestionnaires.get(visitId) ?? null;
  },

  addRuptura(input: {
    clientId: string;
    productId: string;
    productName: string;
    severity: RupturaSeverity;
    quantityMissing: number;
    photoCount: number;
    reportedAt: string;
  }): Ruptura {
    const ruptura: FakeRuptura = {
      id: `fake-ruptura-${(rupturaSeq += 1)}`,
      clientId: input.clientId,
      productId: input.productId,
      productName: input.productName,
      severity: input.severity,
      quantityMissing: input.quantityMissing,
      photoCount: input.photoCount,
      reportedAt: input.reportedAt,
      status: 'pending',
    };
    fakeRupturas.push(ruptura);
    return ruptura;
  },

  rupturasForClient(clientId: string): Ruptura[] {
    return fakeRupturas.filter((r) => r.clientId === clientId);
  },
};
