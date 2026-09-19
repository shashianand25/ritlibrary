export const years = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

export const branchGroups = {
  '1st Year': [
    { label: 'CS (CSE, ISE, AIML, AIDS, Cyber)', value: 'cs' },
    { label: 'Electronics (ECE, ETE, EIE, MLE)', value: 'electronics' },
    { label: 'Electrical (EEE)', value: 'electrical' },
    { label: 'Civil', value: 'civil' },
    { label: 'Mechanical (ME, IEM, CH, AE)', value: 'mech' },
  ],
  '2nd Year': [
    'CSE',
    'ISE',
    'CI',
    'AIML',
    'AIDS',
    'CY',
    'ECE',
    'ETE',
    'EIE',
    'EEE',
    'MLE',
    'CV',
    'ME',
    'IEM',
    'CH',
    'AE',
  ].map((b) => ({ label: b, value: b.toLowerCase() })),
  '3rd Year': [
    'CSE',
    'ISE',
    'AIML',
    'AIDS',
    'CY',
    'ECE',
    'ETE',
    'EIE',
    'EEE',
    'MLE',
    'CV',
    'ME',
    'IEM',
    'CH',
    'AE',
  ].map((b) => ({ label: b, value: b.toLowerCase() })),
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
  '1st Year': ['1st Sem', '2nd Sem'],
  '2nd Year': ['3rd Sem', '4th Sem'],
  '3rd Year': ['5th Sem', '6th Sem'],
};

export const examTypesList = ['CIE1', 'CIE2', 'SEE'];

export const electiveOptions = {
  esc: [
    { label: 'Building Sciences and Mechanics', value: 'ESC131', code: 'ESC131/231' },
    { label: 'Introduction to Electrical Engineering', value: 'ESC132', code: 'ESC132/232' },
    {
      label: 'Introduction to Electronics & Communication Engineering',
      value: 'ESC133',
      code: 'ESC133/233',
    },
    { label: 'Introduction to Mechanical Engineering', value: 'ESC134', code: 'ESC134/234' },
    { label: 'Essentials of Information Technology', value: 'ESC135', code: 'ESC135/235' },
  ],
  // 5th Sem CSE Electives
  program_elective_course_1: [
    { label: 'Secure Programming', value: 'CSE551', code: 'CSE551' },
    { label: 'Computer Graphics and Virtual Reality', value: 'CSE552', code: 'CSE552' },
    { label: 'Advanced Algorithms', value: 'CSE554', code: 'CSE554' },
    { label: 'Object Oriented Analysis and Design', value: 'CSE556', code: 'CSE556' },
    { label: 'Big Data Analytics', value: 'CSE557', code: 'CSE557' },
  ],
  ability_enhancement_course_v: [
    { label: 'NoSQL', value: 'CSAEC59', code: 'CSAEC59' },
    { label: 'Prompt Engineering', value: 'CSAEC510', code: 'CSAEC510' },
  ],
  // 6th Sem CSE Electives
  program_elective_course_2: [
    { label: 'Introduction to Deep Learning', value: 'CSE631', code: 'CSE631' },
    { label: 'Software Defined Networks', value: 'CSE632', code: 'CSE632' },
    { label: 'Linux Kernel Programming', value: 'CSE633', code: 'CSE633' },
    { label: 'Cryptography and Network Security', value: 'CSE636', code: 'CSE636' },
    { label: 'Distributed Systems', value: 'CSE637', code: 'CSE637' },
  ],
  program_elective_course_3: [
    { label: 'Wireless Sensor Networks', value: 'CSE642', code: 'CSE642' },
    { label: 'Natural Language Processing', value: 'CSE643', code: 'CSE643' },
    { label: 'Advanced DBMS', value: 'CSE644', code: 'CSE644' },
    { label: 'Edge AI and Automation', value: 'CSE645', code: 'CSE645' },
    { label: 'Block chain and Distributed App Development', value: 'CSE646', code: 'CSE646' },
  ],
  institutional_open_elective_1: [
    { label: 'Mobile Application Development', value: 'CSOE02', code: 'CSOE02' },
    { label: 'Full Stack Development', value: 'CSOE04', code: 'CSOE04' },
    { label: 'Object Oriented Programming with C++', value: 'CSOE05', code: 'CSOE05' },
    {
      label: 'Introduction to Artificial Intelligence and Machine Learning',
      value: 'CSOE09',
      code: 'CSOE09',
    },
    { label: 'Introduction to Big Data Analytics', value: 'CSOE10', code: 'CSOE10' },
    { label: 'Project Management with Git', value: 'CSOE12', code: 'CSOE12' },
  ],
};

// Branch-scoped aliases for forward-compatibility
electiveOptions.cse_program_elective_course_1 = electiveOptions.program_elective_course_1;
electiveOptions.cse_ability_enhancement_course_v = electiveOptions.ability_enhancement_course_v;
electiveOptions.cse_program_elective_course_2 = electiveOptions.program_elective_course_2;
electiveOptions.cse_program_elective_course_3 = electiveOptions.program_elective_course_3;
electiveOptions.cse_institutional_open_elective_1 = electiveOptions.institutional_open_elective_1;

// Always dark — no light mode
export const COLORS = {
  primary: '#66713f',
  secondary: '#A3E635',
  accent: '#4A5D73',
  background: '#0F0F0F',
  surface: '#1A1A1A',
  text: '#F3F4F6',
};

export const COLLEGE_PYQ_DRIVE_URL =
  'https://drive.google.com/drive/folders/1FDy6mEK5kV3Jost-dsjdoZUoTHowq2om';

