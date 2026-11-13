export interface ServiceItem {
  id: string;
  number: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  deliverables: string[];
  image: string;
  category: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  location: string;
  category: 'Residential' | 'Turnkey & Interiors' | 'Commercial';
  areaSqFt: number;
  durationMonths: number;
  summary: string;
  image: string;
}

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  projectType: string;
  quote: string;
}

export const BRAND_INFO = {
  name: 'Briicks Properties',
  tagline: 'Rising Above',
  phoneDisplay: '+91 96008 10952',
  phoneHref: 'tel:+919600810952',
  email: 'briicksbricks.properties@outlook.com',
  address: '1st Floor, 1, 30th St, O Block, Annanagar East, Chennai, Tamil Nadu 600102',
  startingRate: 2350,
};

export const HERO_MEDIA = {
  background: '/src/assets/images/hero_construction_team_1794546314488.jpg',
  aboutVilla: '/src/assets/images/about_modern_villa_1794546314304.jpg',
  structuralSite: '/src/assets/images/service_structural_site_1794546315373.jpg',
  turnkeyInterior: '/src/assets/images/service_turnkey_interior_1794546314964.jpg',
  commercialHub: '/src/assets/images/project_commercial_hub_1794546315328.jpg',
};

export const ABOUT_HIGHLIGHTS = [
  {
    title: '10-Year Structural Warranty',
    detail: 'Guaranteed structural durability backed by documented material grading.',
  },
  {
    title: '1-Year Free Maintenance',
    detail: 'Complimentary post-handover support covering plumbing, electrical, and finishes.',
  },
  {
    title: 'On-Time Delivery',
    detail: 'Milestone-tracked site execution schedules with weekly client progress logs.',
  },
  {
    title: 'Zero Cost Overruns',
    detail: 'Locked transparent bill of quantities before site mobilization begins.',
  },
  {
    title: 'Structural & Architectural Planning',
    detail: 'Seismic-compliant structural engineering integrated with modern floor plans.',
  },
  {
    title: 'Certified Soil Testing',
    detail: 'Geotechnical borehole analysis to verify foundation stability before excavation.',
  },
];

export const SERVICES: ServiceItem[] = [
  {
    id: 'new-constructions',
    number: '01',
    title: 'New Constructions',
    category: 'Residential & Commercial',
    shortDesc:
      'Crafting durable and aesthetically pleasing structures for homes, offices, and industrial spaces.',
    fullDesc:
      'End-to-end civil construction engineered for longevity in Chennai’s coastal climate. Every slab, column, and masonry course undergoes strict curing and grade verification.',
    deliverables: [
      'Geotechnical soil testing and foundation engineering',
      'Fe-550D steel reinforcement and ready-mix concrete pours',
      '200+ quality assurance checkpoints per floor',
    ],
    image: '/src/assets/images/service_structural_site_1794546315373.jpg',
  },
  {
    id: 'turnkey-house-construction',
    number: '02',
    title: 'Turnkey House Construction',
    category: 'Design to Handover',
    shortDesc:
      'Briicks Properties offers turnkey houses with fully completed interiors—ensuring a seamless experience from design to handover.',
    fullDesc:
      'A single-contract build solution starting at ₹2,350/sq.ft where our architects, structural engineers, and interior craftsmen manage approvals, procurement, construction, and final styling.',
    deliverables: [
      'Architectural 3D elevation and Vaastu-aligned layouts',
      'Complete electrical, plumbing, waterproofing, and tiling',
      'Ready-to-move-in key handover with 10-year warranty',
    ],
    image: '/src/assets/images/about_modern_villa_1794546314304.jpg',
  },
  {
    id: 'interior-design-works',
    number: '03',
    title: 'Interior Design & Works',
    category: 'Bespoke Spaces',
    shortDesc:
      'Transform interiors into functional and visually captivating spaces tailored to your preferences.',
    fullDesc:
      'Custom modular kitchens, precision woodwork, false ceilings, architectural lighting, and natural stone finishes crafted to balance daily ergonomics with timeless aesthetics.',
    deliverables: [
      'Space-optimized modular kitchen and wardrobe joinery',
      'Concealed ambient lighting and acoustic ceiling detailing',
      'Moisture-resistant BWP plywood and branded hardware',
    ],
    image: '/src/assets/images/service_turnkey_interior_1794546314964.jpg',
  },
  {
    id: 'building-renovations',
    number: '04',
    title: 'Building Renovations',
    category: 'Modernization',
    shortDesc:
      'Specializing in plumbing, electrical work, and all types of renovation needs to breathe new life into your spaces.',
    fullDesc:
      'Comprehensive structural retrofitting, facade uplifts, concealed MEP rewiring, dampness remediation, and floor extensions for older residential and commercial buildings.',
    deliverables: [
      'Complete concealed plumbing and electrical upgrades',
      'Structural waterproofing and exterior elevation redesign',
      'Minimal-disruption phased renovation execution',
    ],
    image: '/src/assets/images/project_commercial_hub_1794546315328.jpg',
  },
  {
    id: 'structural-planning',
    number: '05',
    title: 'Structural Planning',
    category: 'Core Engineering',
    shortDesc:
      'Engineering the safety, stability, and longevity of your construction projects with precision and lasting structures.',
    fullDesc:
      'Load-bearing analysis, column-beam framing optimization, and seismic detailing tailored to your plot’s soil bearing capacity and future vertical expansion plans.',
    deliverables: [
      'Soil bearing test interpretation and footing sizing',
      'Bar bending schedules and structural working drawings',
      'Site reinforcement inspection prior to every concrete pour',
    ],
    image: '/src/assets/images/service_structural_site_1794546315373.jpg',
  },
  {
    id: 'architectural-planning',
    number: '06',
    title: 'Architectural Planning',
    category: 'Spatial Design',
    shortDesc:
      'Innovative designs and solid engineering ensure the safety and aesthetics of your projects.',
    fullDesc:
      'Climate-responsive floor plans, natural cross-ventilation strategies, CMDA/corporation sanction drawings, and photorealistic 3D exterior elevations.',
    deliverables: [
      '2D working floor plans and furniture placement layouts',
      '3D exterior elevation renders and material moodboards',
      'Sanction-ready municipal approval documentation',
    ],
    image: '/src/assets/images/about_modern_villa_1794546314304.jpg',
  },
  {
    id: 'joint-venture',
    number: '07',
    title: 'Joint Venture',
    category: 'Landowner Partnerships',
    shortDesc:
      'Briicks Properties offers joint venture services, partnering with landowners for profitable and hassle-free property development.',
    fullDesc:
      'Transparent equity and area-sharing development partnerships for urban landowners in Chennai—turning underutilized plots into high-value residential or mixed-use assets.',
    deliverables: [
      'Feasibility study, FSI maximization, and valuation modeling',
      '100% capital deployment, approvals, and marketing',
      'Clear legal milestones and guaranteed handover timelines',
    ],
    image: '/src/assets/images/project_commercial_hub_1794546315328.jpg',
  },
];

export const KEY_FEATURES = [
  'Comprehensive Construction Services',
  '200+ Quality Assurance Checks Per Floor',
  'Expert Interior Design & Custom Joinery',
  'Plumbing & Electrical Excellence',
  'Innovative Structural Planning',
  'Creative Architectural Designs',
  'Customer-Focused Transparent Reporting',
  'Mandatory Soil Testing & Foundation Audit',
];

export const WHY_CHOOSE_POINTS = [
  {
    title: 'Comprehensive One-Stop Services',
    description:
      'From soil testing and architectural planning to construction, interior design, and renovation, one accountable team handles every stage.',
  },
  {
    title: '10-Year Structural Building Warranty',
    description:
      'Guaranteed structural durability with documented steel, cement, and concrete cube-test compliance for lasting peace of mind.',
  },
  {
    title: '1-Year Free Post-Handover Maintenance',
    description:
      'Every new construction we complete includes twelve months of complimentary maintenance support.',
  },
  {
    title: 'Zero Cost Overruns Guarantee',
    description:
      'Fixed stage-wise pricing protects your budget from unexpected material spikes or hidden site variations.',
  },
  {
    title: 'On-Time Milestone Delivery',
    description:
      'Structured engineering schedules keep brickwork, curing, MEP rough-ins, and finishing strictly on calendar.',
  },
];

export interface StatMetric {
  id: string;
  target: number;
  suffix: string;
  value: string;
  label: string;
  detail: string;
}

export const STATS: StatMetric[] = [
  {
    id: 'projects-completed',
    target: 70,
    suffix: '+',
    value: '70+',
    label: 'Projects Completed',
    detail: 'Villas, Apartments & Commercial Blocks',
  },
  {
    id: 'happy-clients',
    target: 100,
    suffix: '+',
    value: '100+',
    label: 'Happy Clients',
    detail: 'Backed by 10-Year Structural Warranty',
  },
  {
    id: 'square-feet-built',
    target: 350,
    suffix: 'K+',
    value: '350K+',
    label: 'Square Feet Built',
    detail: '200+ QA Checks Verified Per Floor',
  },
  {
    id: 'years-experience',
    target: 15,
    suffix: '+',
    value: '15+',
    label: 'Years of Experience',
    detail: 'CMDA Sanctions to Turnkey Handover',
  },
];

export const CHENNAI_SERVICE_ZONES = [
  {
    id: 'office',
    label: 'Briicks HQ (Anna Nagar East)',
    searchQuery: '1st Floor, 1, 30th St, O Block, Annanagar East, Chennai, Tamil Nadu 600102',
    serviceNote: 'Senior Engineering Consultation & Material Gallery',
  },
  {
    id: 'kilpauk',
    label: 'Kilpauk',
    searchQuery: 'Kilpauk, Chennai, Tamil Nadu',
    serviceNote: 'Turnkey Duplexes & Interior Renovation Zone',
  },
  {
    id: 'adyar',
    label: 'Adyar',
    searchQuery: 'Adyar, Chennai, Tamil Nadu',
    serviceNote: 'Coastal-Grade RCC Residential & Villa Builds',
  },
  {
    id: 'mogappair',
    label: 'Mogappair West',
    searchQuery: 'Mogappair West, Chennai, Tamil Nadu',
    serviceNote: 'Commercial Hubs & Joint Venture Developments',
  },
] as const;

export const PROJECTS: ProjectItem[] = [
  {
    id: 'anna-nagar-villa',
    title: 'O-Block Contemporary Residence',
    location: 'Anna Nagar East, Chennai',
    category: 'Residential',
    areaSqFt: 3450,
    durationMonths: 11,
    summary:
      'G+2 cantilevered concrete and terracotta-brick villa featuring courtyard cross-ventilation and a 10-year structural warranty.',
    image: '/src/assets/images/about_modern_villa_1794546314304.jpg',
  },
  {
    id: 'kilpauk-turnkey',
    title: 'Kilpauk Turnkey Duplex & Interiors',
    location: 'Kilpauk, Chennai',
    category: 'Turnkey & Interiors',
    areaSqFt: 2800,
    durationMonths: 10,
    summary:
      'Full turnkey build from soil testing to bespoke teakwood joinery, Italian marble flooring, and concealed lighting.',
    image: '/src/assets/images/service_turnkey_interior_1794546314964.jpg',
  },
  {
    id: 'mogappair-commercial',
    title: 'Mogappair Commercial & Retail Hub',
    location: 'Mogappair West, Chennai',
    category: 'Commercial',
    areaSqFt: 8200,
    durationMonths: 14,
    summary:
      'Joint-venture commercial complex engineered with high-load flat slabs, glass facade glazing, and basement parking.',
    image: '/src/assets/images/project_commercial_hub_1794546315328.jpg',
  },
  {
    id: 'adyar-structural-frame',
    title: 'Adyar Multi-Unit Residential Block',
    location: 'Adyar, Chennai',
    category: 'Residential',
    areaSqFt: 6400,
    durationMonths: 13,
    summary:
      'Precision RCC multi-story apartment block delivered ahead of schedule with 200+ quality checks verified on every slab.',
    image: '/src/assets/images/service_structural_site_1794546315373.jpg',
  },
];

export const TESTIMONIALS: TestimonialItem[] = [
  {
    id: 'pranav',
    name: 'Pranav Kumar',
    role: 'Homeowner',
    projectType: 'Turnkey Residence',
    quote:
      'Very good planning and execution—the process from initial viewing to moving in was smooth and stress-free. I strongly recommend Briicks Properties.',
  },
  {
    id: 'manjunath',
    name: 'Manjunath N',
    role: 'Residential Client',
    projectType: 'New Construction',
    quote:
      'My experience with Briicks Properties has been wonderful. Their team has always been quick to resolve any site queries—very satisfied with the outcome.',
  },
  {
    id: 'sindhu',
    name: 'Sindhu Jaya',
    role: 'Homeowner',
    projectType: 'Construction & Interiors',
    quote:
      'Thank you for the great execution of our project and interior designing with high quality in an affordable way, and for helping us at every step of construction.',
  },
  {
    id: 'jaya',
    name: 'Jaya Prabhu',
    role: 'Property Owner',
    projectType: 'Custom Villa Build',
    quote:
      'Thoroughly impressed with the exceptional service provided by Briicks Properties. Their team of experts delivered our project on time and within budget.',
  },
  {
    id: 'sathyavathi',
    name: 'Sathyavathi',
    role: 'Homeowner',
    projectType: 'Turnkey House Construction',
    quote:
      'Briicks Properties truly cares about their clients. Their team took the time to understand our unique needs and delivered a personalized home that exceeded our expectations.',
  },
];

export const BUILD_PROCESS_STEPS = [
  {
    step: '01',
    title: 'Soil Test & Feasibility',
    description:
      'On-site borehole soil inspection, plot survey, and fixed-budget bill of quantities with zero hidden escalations.',
  },
  {
    step: '02',
    title: 'Architectural & Structural Engineering',
    description:
      'Vaastu-compliant floor plans, 3D elevation previews, and seismic-safe structural framing drawings.',
  },
  {
    step: '03',
    title: '200+ QA Checks Per Floor',
    description:
      'Stage-by-stage verification of steel, concrete cubes, plumbing pressure tests, and curing cycles.',
  },
  {
    step: '04',
    title: 'Turnkey Handover & 10-Yr Warranty',
    description:
      'Completed interiors, deep-cleaned handover, 1-year free maintenance, and 10-year structural warranty.',
  },
];
