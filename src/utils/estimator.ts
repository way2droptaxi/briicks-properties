export type PackageTierId = 'essential' | 'turnkey_plus' | 'signature';

export interface PackageTier {
  id: PackageTierId;
  name: string;
  ratePerSqFt: number;
  summary: string;
  specs: string[];
}

export const PACKAGE_TIERS: PackageTier[] = [
  {
    id: 'essential',
    name: 'Essential Build',
    ratePerSqFt: 2350,
    summary: 'Core structural construction starting at ₹2,350/sq.ft with standard architectural finishes.',
    specs: [
      'Fe-550D Steel & ISI Grade Cement',
      '200+ QA checks per floor',
      '10-Year Structural Warranty',
    ],
  },
  {
    id: 'turnkey_plus',
    name: 'Turnkey Plus',
    ratePerSqFt: 2650,
    summary: 'Complete construction with upgraded vitrified flooring, modular kitchen basics, and waterproofing.',
    specs: [
      'Everything in Essential Build',
      'UPVC windows & Jaguar-class sanitaryware',
      '1-Year Free Maintenance included',
    ],
  },
  {
    id: 'signature',
    name: 'Signature Luxury',
    ratePerSqFt: 3100,
    summary: 'Bespoke architectural elevation, Italian marble/wood finishes, and full custom interior joinery.',
    specs: [
      'Custom 3D facade & designer interiors',
      'Concealed VRV/lighting provisions',
      'Dedicated Senior Project Engineer',
    ],
  },
];

export interface EstimatorInput {
  areaSqFt: number;
  floors: number;
  tierId: PackageTierId;
  includeSoilAndStructural: boolean;
  includeInteriorDesign: boolean;
}

export interface EstimatorResult {
  areaSqFt: number;
  floors: number;
  tier: PackageTier;
  baseConstructionCost: number;
  engineeringAddonCost: number;
  interiorAddonCost: number;
  totalEstimatedCost: number;
  effectiveRatePerSqFt: number;
  qualityCheckpoints: number;
  estimatedMonths: number;
  milestones: { label: string; percentage: number; amount: number }[];
}

export function clampArea(areaSqFt: number): number {
  if (!Number.isFinite(areaSqFt)) return 1000;
  return Math.min(25000, Math.max(600, Math.round(areaSqFt)));
}

export function clampFloors(floors: number): number {
  if (!Number.isFinite(floors)) return 1;
  return Math.min(5, Math.max(1, Math.round(floors)));
}

export function calculateConstructionEstimate(input: EstimatorInput): EstimatorResult {
  const areaSqFt = clampArea(input.areaSqFt);
  const floors = clampFloors(input.floors);
  const tier = PACKAGE_TIERS.find((t) => t.id === input.tierId) ?? PACKAGE_TIERS[0];

  const baseConstructionCost = areaSqFt * tier.ratePerSqFt;
  // Soil test & structural planning flat engineering fee scales modestly for multi-story builds
  const engineeringAddonCost = input.includeSoilAndStructural ? 45000 + (floors - 1) * 15000 : 0;
  // Interior design add-on estimated at ₹450/sq.ft when requested on top of structural package
  const interiorAddonCost = input.includeInteriorDesign ? areaSqFt * 450 : 0;

  const totalEstimatedCost = baseConstructionCost + engineeringAddonCost + interiorAddonCost;
  const effectiveRatePerSqFt = Math.round(totalEstimatedCost / areaSqFt);
  const qualityCheckpoints = floors * 200;
  const estimatedMonths = Math.max(6, Math.min(24, 5 + floors * 2 + (areaSqFt > 4000 ? 2 : 0)));

  const milestones = [
    { label: 'Design, Soil Test & Foundation', percentage: 20, amount: Math.round(totalEstimatedCost * 0.2) },
    { label: 'Superstructure & Roof Slabs', percentage: 35, amount: Math.round(totalEstimatedCost * 0.35) },
    { label: 'Brickwork, Plaster & MEP Rough-In', percentage: 25, amount: Math.round(totalEstimatedCost * 0.25) },
    { label: 'Finishes, QA Sign-off & Handover', percentage: 20, amount: totalEstimatedCost - Math.round(totalEstimatedCost * 0.2) - Math.round(totalEstimatedCost * 0.35) - Math.round(totalEstimatedCost * 0.25) },
  ];

  return {
    areaSqFt,
    floors,
    tier,
    baseConstructionCost,
    engineeringAddonCost,
    interiorAddonCost,
    totalEstimatedCost,
    effectiveRatePerSqFt,
    qualityCheckpoints,
    estimatedMonths,
    milestones,
  };
}

export function formatINR(amount: number): string {
  const safe = Number.isFinite(amount) ? Math.round(amount) : 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(safe);
}

export const ALLOWED_APPOINTMENT_SERVICES = [
  'New Construction',
  'New Constructions',
  'Turnkey House Construction',
  'Interior Design & Works',
  'Building Renovations',
  'Structural Planning',
  'Architectural Planning',
  'Joint Venture',
] as const;

export const APPOINTMENT_LIMITS = {
  nameMin: 2,
  nameMax: 100,
  emailMin: 5,
  emailMax: 160,
  phoneMin: 7,
  phoneMax: 25,
  messageMax: 1500,
} as const;

export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export interface ConsultationFormValues {
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
}

export type ConsultationFormErrors = Partial<Record<keyof ConsultationFormValues, string>>;

export function sanitizeConsultationValues(values: ConsultationFormValues): ConsultationFormValues {
  const normalizedService =
    values.service.trim() === 'New Constructions'
      ? 'New Constructions'
      : values.service.trim();

  return {
    name: values.name.trim().slice(0, APPOINTMENT_LIMITS.nameMax),
    email: values.email.trim().toLowerCase().slice(0, APPOINTMENT_LIMITS.emailMax),
    phone: values.phone.trim().slice(0, APPOINTMENT_LIMITS.phoneMax),
    service: normalizedService,
    message: values.message.trim().slice(0, APPOINTMENT_LIMITS.messageMax),
  };
}

export function validateConsultationForm(values: ConsultationFormValues): ConsultationFormErrors {
  const errors: ConsultationFormErrors = {};
  const trimmedName = values.name.trim();
  const trimmedEmail = values.email.trim();
  const trimmedPhone = values.phone.trim();
  const trimmedService = values.service.trim();
  const trimmedMessage = values.message.trim();

  if (trimmedName.length < APPOINTMENT_LIMITS.nameMin) {
    errors.name = 'Please enter your full name (at least 2 characters).';
  } else if (trimmedName.length > APPOINTMENT_LIMITS.nameMax) {
    errors.name = `Full name must be ${APPOINTMENT_LIMITS.nameMax} characters or fewer.`;
  }

  if (
    trimmedEmail.length < APPOINTMENT_LIMITS.emailMin ||
    trimmedEmail.length > APPOINTMENT_LIMITS.emailMax ||
    !EMAIL_REGEX.test(trimmedEmail)
  ) {
    errors.email = 'Please provide a valid email address.';
  }

  const digits = trimmedPhone.replace(/\D/g, '');
  if (
    trimmedPhone.length < APPOINTMENT_LIMITS.phoneMin ||
    trimmedPhone.length > APPOINTMENT_LIMITS.phoneMax ||
    digits.length < 10 ||
    digits.length > 13
  ) {
    errors.phone = 'Please enter a valid 10-digit phone number.';
  }

  if (
    !trimmedService ||
    !ALLOWED_APPOINTMENT_SERVICES.includes(
      trimmedService as (typeof ALLOWED_APPOINTMENT_SERVICES)[number]
    )
  ) {
    errors.service = 'Please select a valid construction service.';
  }

  if (trimmedMessage.length > APPOINTMENT_LIMITS.messageMax) {
    errors.message = `Project details must be ${APPOINTMENT_LIMITS.messageMax} characters or fewer.`;
  }

  return errors;
}

export function validateNewsletterEmail(email: string): boolean {
  const trimmed = email.trim();
  return (
    trimmed.length >= APPOINTMENT_LIMITS.emailMin &&
    trimmed.length <= APPOINTMENT_LIMITS.emailMax &&
    EMAIL_REGEX.test(trimmed)
  );
}

export function generateReferenceCode(): string {
  return `BP-${String(Math.floor(100000 + Math.random() * 899999))}`;
}

