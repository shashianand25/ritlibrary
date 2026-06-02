export const years = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

export const branchGroups = {
  "1st Year": [
    { label: "CS (CSE, ISE, AIML, AIDS, Cyber)", value: "cs" },
    { label: "Electronics (ECE, ETE, EIE, MLE)", value: "electronics" },
    { label: "Electrical (EEE)", value: "electrical" },
    { label: "Civil", value: "civil" },
    { label: "Mechanical (ME, IEM, CH, AE)", value: "mech" },
  ],
  "2nd Year": [
    "CSE", "ISE", "CI", "AIML", "AIDS", "CY", "ECE", "ETE", "EIE", "EEE", "MLE", "CV", "ME", "IEM", "CH", "AE",
  ].map(b => ({ label: b, value: b.toLowerCase() })),
  "3rd Year": [
    "CSE", "ISE", "AIML", "AIDS", "CY", "ECE", "ETE", "EIE", "EEE", "MLE", "CV", "ME", "IEM", "CH", "AE",
  ].map(b => ({ label: b, value: b.toLowerCase() })),
};

export const sectionCountsByBranch = {
  cse: 4,
  ise: 3,
  ci: 1,
  aiml: 1,
  aids: 1,
  cy: 1,
  ece: 3,
  ete: 1,
  eie: 1,
  eee: 1,
  mle: 1,
  cv: 1,
  me: 2,
  iem: 1,
  ch: 1,
  ae: 1,
};

export const semesterGroups = {
  "1st Year": ["1st Sem", "2nd Sem"],
  "2nd Year": ["3rd Sem", "4th Sem"],
  "3rd Year": ["5th Sem", "6th Sem"],
};

export const examTypesList = ["CIE1", "CIE2", "SEE"];

export const electiveOptions = {
  esc: [
    { label: "C Programming", value: "esc_cp" },
    { label: "Civil", value: "esc_civil" },
    { label: "Electrical", value: "esc_elec" },
    { label: "Electronics", value: "esc_ece" },
    { label: "Mechanical", value: "esc_mech" },
  ],
  plc: [
    { label: "C++", value: "plc_cpp" },
    { label: "Java", value: "plc_java" },
    { label: "Python", value: "plc_python" },
    { label: "Web Programming", value: "plc_web" },
  ],
  etc: [
    { label: "Cyber Security", value: "etc_cyber" },
    { label: "Green Building", value: "etc_green" },
    { label: "IoT", value: "etc_iot" },
    { label: "Solar Energy", value: "etc_solar" },
  ],
};

// Always dark — no light mode
export const COLORS = {
  primary:    "#66713f",
  secondary:  "#A3E635",
  accent:     "#4A5D73",
  background: "#0F0F0F",
  surface:    "#1A1A1A",
  text:       "#F3F4F6",
};
