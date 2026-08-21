/**
 * Multi-step inquiry flows — ported verbatim from Jim's soflo-site.html
 * prototype.
 *
 * Every question, option label, sub-text, eye-label, and key is Jim's
 * reviewed copy. Do not add, drop, or reword. Changes to question wording
 * go through Jim, not through this file.
 */

export interface FlowStep {
  key: string;
  eye: string;
  q: string;
  sub?: string;
  type:
    | "single"
    | "multi"
    | "slider"
    | "building"
    | "country"
    | "contact"
    | "consent";
  options?: [label: string, desc: string][];
  min?: number;
  max?: number;
  step?: number;
  start?: number;
  /** Show WhatsApp field + same-as-phone checkbox on the contact step. */
  whatsapp?: boolean;
  /** Show association/company field on the contact step. */
  company?: boolean;
}

export interface Flow {
  tag: string;
  intent: string;
  title: string;
  desc: string;
  steps: FlowStep[];
}

const contactStep: FlowStep = {
  key: "contact",
  eye: "Last step",
  q: "Where should we send this?",
  sub: "An email or a phone number \u2014 whichever you\u2019d rather be reached on. One is enough.",
  type: "contact",
};

const consentStep: FlowStep = {
  key: "consent",
  eye: "Before you send",
  q: "Before you send this",
  type: "consent",
};

export const FLOWS: Record<string, Flow> = {
  finance: {
    tag: "Finance a purchase",
    intent: "finance",
    title: "Finance a purchase",
    desc: "You\u2019re buying and need a loan on this building.",
    steps: [
      {
        key: "building",
        eye: "The building",
        q: "Which building are you looking at?",
        sub: "Name, address, or ZIP \u2014 whatever you have.",
        type: "building",
      },
      {
        key: "stage",
        eye: "Where you are",
        q: "Where are you in the process?",
        type: "single",
        options: [
          ["Just starting", "Getting a feel for what I can afford"],
          ["Found a unit", "I have a specific unit in mind"],
          ["Making an offer", "About to write or negotiate"],
          ["Under contract", "Clock is already running"],
        ],
      },
      {
        key: "purpose",
        eye: "The purchase",
        q: "How will you use it?",
        type: "single",
        options: [
          ["Primary home", ""],
          ["Second home", ""],
          ["Investment / rental", ""],
        ],
      },
      {
        key: "price",
        eye: "Budget",
        q: "Roughly what price range?",
        sub: "A ballpark is fine \u2014 slide to your comfort zone.",
        type: "slider",
        min: 200000,
        max: 8000000,
        step: 50000,
        start: 900000,
      },
      {
        key: "down",
        eye: "Financing",
        q: "How much are you planning to put down?",
        sub: "The building can change what\u2019s possible here \u2014 that\u2019s exactly what we\u2019ll check.",
        type: "single",
        options: [
          ["Under 10%", ""],
          ["10\u201320%", ""],
          ["20\u201325%", ""],
          ["25% or more", ""],
          ["Not sure yet", ""],
        ],
      },
      {
        key: "preapp",
        eye: "Financing",
        q: "Have you been pre-approved yet?",
        type: "single",
        options: [
          ["Yes", ""],
          ["Started, not finished", ""],
          ["Not yet", ""],
        ],
      },
      {
        key: "timeline",
        eye: "Timing",
        q: "When are you hoping to close?",
        type: "single",
        options: [
          ["0\u201330 days", ""],
          ["1\u20133 months", ""],
          ["3\u20136 months", ""],
          ["Just exploring", ""],
        ],
      },
      {
        key: "worry",
        eye: "Optional",
        q: "Anything about the building already on your mind?",
        sub: "Optional \u2014 helps us point you to the right person.",
        type: "multi",
        options: [
          ["Special assessment", ""],
          ["Reserves / budget", ""],
          ["Insurance", ""],
          ["Litigation", ""],
          ["Nothing specific", ""],
        ],
      },
      contactStep,
      consentStep,
    ],
  },

  "foreign-national": {
    tag: "Foreign-national loan",
    intent: "foreign-national",
    title: "Foreign-national loan",
    desc: "You\u2019re buying without U.S. credit or income history.",
    steps: [
      {
        key: "building",
        eye: "The building",
        q: "Which building are you looking at?",
        sub: "Name, address, or ZIP. Still deciding? Tell us the city.",
        type: "building",
      },
      {
        key: "country",
        eye: "About you",
        q: "What country do you live in?",
        type: "country",
      },
      {
        key: "ushistory",
        eye: "About you",
        q: "Do you have any U.S. credit or income history?",
        sub: "Either is fine \u2014 these programs are built for buyers who don\u2019t.",
        type: "single",
        options: [
          ["Yes, some", ""],
          ["No, none", ""],
          ["Not sure", ""],
        ],
      },
      {
        key: "usbank",
        eye: "About you",
        q: "Do you have a U.S. bank account?",
        type: "single",
        options: [
          ["Yes", ""],
          ["Opening one soon", ""],
          ["Not yet", ""],
        ],
      },
      {
        key: "purpose",
        eye: "The purchase",
        q: "How will you use the property?",
        type: "single",
        options: [
          ["Second home", ""],
          ["Investment / rental", ""],
          ["Future primary home", ""],
        ],
      },
      {
        key: "price",
        eye: "Budget",
        q: "Roughly what price range?",
        sub: "A ballpark is fine.",
        type: "slider",
        min: 300000,
        max: 10000000,
        step: 50000,
        start: 1200000,
      },
      {
        key: "down",
        eye: "Financing",
        q: "How much can you put down?",
        sub: "Non-resident programs commonly start around 35% down \u2014 this sets expectations, not terms.",
        type: "single",
        options: [
          ["Around 25%", ""],
          ["Around 35%", ""],
          ["40% or more", ""],
          ["Not sure yet", ""],
        ],
      },
      {
        key: "timeline",
        eye: "Timing",
        q: "When are you hoping to buy?",
        type: "single",
        options: [
          ["0\u20133 months", ""],
          ["3\u20136 months", ""],
          ["6\u201312 months", ""],
          ["Just exploring", ""],
        ],
      },
      {
        key: "language",
        eye: "Almost done",
        q: "Preferred language?",
        type: "single",
        options: [
          ["English", ""],
          ["Spanish", ""],
          ["Portuguese", ""],
          ["Other", ""],
        ],
      },
      { ...contactStep, whatsapp: true },
      consentStep,
    ],
  },

  sell: {
    tag: "Sell my unit",
    intent: "sell",
    title: "Sell my unit",
    desc: "You own here and want to list.",
    steps: [
      {
        key: "building",
        eye: "Your building",
        q: "Which building is your unit in?",
        sub: "Name, address, or ZIP.",
        type: "building",
      },
      {
        key: "ownership",
        eye: "Your unit",
        q: "How is the unit held?",
        type: "single",
        options: [
          ["I own it outright", ""],
          ["Still paying a mortgage", ""],
          ["Held in a trust or LLC", ""],
          ["Inherited it", ""],
        ],
      },
      {
        key: "stage",
        eye: "Where you are",
        q: "Where are you in the process?",
        type: "single",
        options: [
          ["Just curious on value", ""],
          ["Getting ready to list", ""],
          ["Interviewing agents now", ""],
        ],
      },
      {
        key: "flags",
        eye: "The building",
        q: "Is your building dealing with any of these?",
        sub: "Flagged buildings sell differently \u2014 this routes you to the right specialist. Pick any.",
        type: "multi",
        options: [
          ["Special assessment", ""],
          ["Pending / failed inspection", ""],
          ["Insurance trouble", ""],
          ["Litigation", ""],
          ["None that I know of", ""],
        ],
      },
      {
        key: "unit",
        eye: "Your unit",
        q: "What size is the unit?",
        type: "single",
        options: [
          ["Studio / 1 bed", ""],
          ["2 bed", ""],
          ["3 bed", ""],
          ["4+ bed", ""],
        ],
      },
      {
        key: "timeline",
        eye: "Timing",
        q: "When are you hoping to sell?",
        type: "single",
        options: [
          ["As soon as possible", ""],
          ["1\u20133 months", ""],
          ["3\u20136 months", ""],
          ["Just testing the water", ""],
        ],
      },
      contactStep,
      consentStep,
    ],
  },

  "check-building": {
    tag: "Check a building",
    intent: "check-building",
    title: "Check a building",
    desc: "You want a professional to look past the public record.",
    steps: [
      {
        key: "building",
        eye: "The building",
        q: "Which building do you want looked at?",
        sub: "Name, address, or ZIP.",
        type: "building",
      },
      {
        key: "relationship",
        eye: "About you",
        q: "What\u2019s your connection to it?",
        type: "single",
        options: [
          ["Buying here", ""],
          ["Considering an offer", ""],
          ["I own here", ""],
          ["Renting / thinking of buying", ""],
          ["Just researching", ""],
        ],
      },
      {
        key: "concerns",
        eye: "What to check",
        q: "What would you most want answered?",
        sub: "Pick any \u2014 the things the public record can\u2019t fully show.",
        type: "multi",
        options: [
          ["Will a lender finance it", ""],
          ["Reserves & financial health", ""],
          ["Special assessments", ""],
          ["Insurance", ""],
          ["Litigation", ""],
          ["Inspection / milestone status", ""],
          ["Rental rules", ""],
        ],
      },
      {
        key: "unit",
        eye: "Context",
        q: "Is this about a specific unit?",
        type: "single",
        options: [
          ["Yes, under contract", ""],
          ["Yes, one I\u2019m considering", ""],
          ["No, whole-building question", ""],
        ],
      },
      {
        key: "timeline",
        eye: "Timing",
        q: "How soon do you need answers?",
        type: "single",
        options: [
          ["This week", ""],
          ["This month", ""],
          ["No particular rush", ""],
        ],
      },
      contactStep,
      consentStep,
    ],
  },

  board: {
    tag: "I\u2019m on a condo board",
    intent: "board",
    title: "I\u2019m on a condo board",
    desc: "Your building needs its FHA, VA or lender standing sorted out.",
    steps: [
      {
        key: "building",
        eye: "Your association",
        q: "Which building do you represent?",
        sub: "Name, address, or ZIP.",
        type: "building",
      },
      {
        key: "role",
        eye: "Your role",
        q: "What\u2019s your role?",
        type: "single",
        options: [
          ["Board president", ""],
          ["Treasurer", ""],
          ["Board member", ""],
          ["Property manager (CAM)", ""],
          ["Association attorney", ""],
        ],
      },
      {
        key: "needs",
        eye: "What to sort out",
        q: "What needs sorting out?",
        sub: "Pick any.",
        type: "multi",
        options: [
          ["FHA approval or renewal", ""],
          ["VA approval", ""],
          ["Conventional lender standing", ""],
          ["Reserve study", ""],
          ["Off a lender\u2019s ineligible list", ""],
          ["Not sure where we stand", ""],
        ],
      },
      {
        key: "trigger",
        eye: "Context",
        q: "What\u2019s prompting this now?",
        type: "single",
        options: [
          ["Buyers can\u2019t get financing", ""],
          ["An approval is expiring", ""],
          ["A lender flagged us", ""],
          ["Proactive planning", ""],
        ],
      },
      {
        key: "size",
        eye: "The building",
        q: "How many units in the building?",
        type: "single",
        options: [
          ["Under 25", ""],
          ["25\u2013100", ""],
          ["100\u2013300", ""],
          ["300+", ""],
        ],
      },
      {
        key: "urgency",
        eye: "Timing",
        q: "How urgent is it?",
        type: "single",
        options: [
          ["Deals are stalled now", ""],
          ["Planning ahead", ""],
          ["Just gathering information", ""],
        ],
      },
      { ...contactStep, company: true },
      consentStep,
    ],
  },

  preconstruction: {
    tag: "Preconstruction \u00b7 top 10",
    intent: "preconstruction",
    title: "Get your top 10 buildings",
    desc: "A shortlist chosen to your budget and criteria.",
    steps: [
      {
        key: "area",
        eye: "Where",
        q: "Which areas interest you?",
        sub: "Pick any \u2014 Miami-Dade and Broward neighborhoods.",
        type: "multi",
        options: [
          ["Brickell", ""],
          ["Edgewater / Midtown", ""],
          ["Miami Beach / South Beach", ""],
          ["Sunny Isles / Bal Harbour", ""],
          ["Coral Gables / Coconut Grove", ""],
          ["Fort Lauderdale", ""],
          ["Pompano / Hollywood", ""],
          ["Open to suggestions", ""],
        ],
      },
      {
        key: "purpose",
        eye: "The purchase",
        q: "What\u2019s the purchase for?",
        type: "single",
        options: [
          ["Primary home", ""],
          ["Second home", ""],
          ["Investment / rental", ""],
        ],
      },
      {
        key: "str",
        eye: "Investment",
        q: "Do you want short-term rental to be allowed?",
        sub: "Airbnb / VRBO. Some projects allow it, some don\u2019t \u2014 we track which.",
        type: "single",
        options: [
          ["Yes, important", ""],
          ["Nice to have", ""],
          ["Not needed", ""],
        ],
      },
      {
        key: "price",
        eye: "Budget",
        q: "Roughly what price range?",
        sub: "A ballpark is fine.",
        type: "slider",
        min: 300000,
        max: 10000000,
        step: 50000,
        start: 1200000,
      },
      {
        key: "delivery",
        eye: "Timing",
        q: "When would you want delivery?",
        type: "single",
        options: [
          ["Already delivered / ready", ""],
          ["Within ~1 year", ""],
          ["1\u20133 years out", ""],
          ["No preference", ""],
        ],
      },
      {
        key: "finance",
        eye: "Financing",
        q: "Will you finance or pay cash?",
        type: "single",
        options: [
          ["Financing", ""],
          ["Cash", ""],
          ["Not sure yet", ""],
        ],
      },
      {
        key: "visit",
        eye: "The tour",
        q: "Planning to visit, or prefer remote first?",
        type: "single",
        options: [
          ["Planning a visit", ""],
          ["Remote video tours first", ""],
          ["Both", ""],
        ],
      },
      {
        key: "language",
        eye: "Almost done",
        q: "Preferred language?",
        type: "single",
        options: [
          ["English", ""],
          ["Spanish", ""],
          ["Portuguese", ""],
          ["Other", ""],
        ],
      },
      { ...contactStep, whatsapp: true },
      consentStep,
    ],
  },
};
