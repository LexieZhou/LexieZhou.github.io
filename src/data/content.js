export const news = [
  {
    date: 'Mar 2026',
    text: 'Won Best Creative Award & Most Popular Award at the UCSD Creative Lab AI Hackathon (Trae × Z.ai)!',
    highlight: true,
  },
  {
    date: 'Apr 2025',
    text: 'Joining UCSD to pursue a MSCS degree starting Fall 2025!',
  },
  {
    date: 'Jul 2024',
    text: 'Oral presentation at FSE\'24 in Porto de Galinhas, Brazil!',
  },
  {
    date: 'May 2024',
    text: 'Received the Wong Shek-Yung Student Enrichment Awards.',
  },
]

export const publications = [
  {
    title: 'DECIDE: Knowledge-Based Version Incompatibility Detection in Deep Learning Stacks',
    href: 'https://arxiv.org/abs/2408.02133',
    authors: ['Zihan Zhou', 'Zhongkai Zhao', 'Bonan Kou', 'Tianyi Zhang'],
    venue: 'ACM FSE 2024 · Demonstrations',
  },
]

export const experience = [
  {
    role: 'Machine Learning Engineer Intern',
    company: 'PayPal',
    companyUrl: 'https://www.paypal.com/',
    location: 'Shanghai, China',
    dates: 'Jun 2025 – Sep 2025',
  },
  {
    role: 'R&D Intern',
    company: 'Momenta',
    companyUrl: 'https://www.momenta.ai/',
    location: 'Suzhou, China',
    dates: 'Feb 2025 – Jun 2025',
  },
  {
    role: 'Research Assistant',
    company: 'Dept of CS, HKU',
    companyUrl: 'https://www.cs.hku.hk/',
    location: 'Hong Kong',
    dates: 'May 2023 – Jun 2024',
    note: 'Supervised by Prof. Chuan Wu',
    noteUrl: 'https://i.cs.hku.hk/~cwu/',
  },
  {
    role: 'Research Assistant',
    company: 'Dept of CS, Purdue University',
    companyUrl: 'https://www.cs.purdue.edu/',
    location: 'USA',
    dates: 'May 2023 – Oct 2023',
    note: 'Supervised by Prof. Tianyi Zhang',
    noteUrl: 'https://tianyi-zhang.github.io/',
  },
  {
    role: 'Full-Stack Developer',
    company: 'SLR Lab, HKU',
    companyUrl: 'https://slrlab.edu.hku.hk/',
    location: 'Hong Kong',
    dates: 'Oct 2022 – Nov 2022',
  },
  {
    role: 'Data Analyst',
    company: 'TVB',
    companyUrl: 'https://www.tvb.com/',
    location: 'Hong Kong',
    dates: 'Jul 2022 – Aug 2022',
  },
]

export const education = [
  {
    institution: 'University of California, San Diego',
    institutionUrl: 'https://cse.ucsd.edu/',
    degree: 'M.S. Computer Science and Engineering',
    dates: 'Sep 2025 – Jun 2027',
  },
  {
    institution: 'The University of Hong Kong',
    institutionUrl: 'https://www.hku.hk/',
    degree: 'B.Eng. Computer Science',
    dates: 'Sep 2020 – Jun 2025',
  },
]

export const projects = [
  {
    title: 'Orbit',
    tag: 'UCSD Creative Lab AI Hackathon · 2026',
    category: 'Full-Stack',
    image: '/img/projects/Orbit.png',
    href: 'https://zhongjun-frank-fu.github.io/San-Diego-Creative-Lab-Website/',
    github: 'https://github.com/LexieZhou/Orbit',
    paper: 'https://docs.google.com/presentation/d/1cYMQHt2GMwanb4vJCuu3yZgVp3sUWnM_uoONESgBMzw/edit?usp=sharing',
    paperLabel: 'Presentation',
    description:
      'A full-stack web app for tracking meaningful interactions with people you care about. Visualize your relationship graph, explore your memory map, and get smart reminders before connections fade. Won Best Creativity Award and Most Popular Award.',
  },
  {
    title: 'CodeRAG',
    tag: 'PayPal · 2025',
    category: 'AI / ML',
    image: '/img/projects/CodeRAG.png',
    description:
      'An agentic RAG framework for code understanding integrating multi-source retrieval and iterative refinement. Preserves code structure through AST-aware chunking and models cross-file relationships using a code knowledge graph.',
  },
  {
    title: 'AR Laparoscopy Surgery Training System',
    tag: 'CAMP Lab, TUM · 2024',
    category: 'CV & AR',
    image: '/img/projects/AR_Laparoscopy.png',
    paper: 'https://drive.google.com/file/d/1jNjgB0UhMdu8MdODKJ0ZqKMiEg4siTfI/view?usp=sharing',
    paperLabel: 'Paper',
    description:
      'An AR simulation-based training system integrating 3D phantom interaction and synchronized 2D augmented laparoscopy visualization. Provides augmented laparoscopic view, interactive phantom operation, and contextual guidance.',
  },
  {
    title: 'DECIDE',
    tag: 'Purdue University · 2023',
    category: 'Full-Stack',
    image: '/img/projects/Decide.png',
    github: 'https://github.com/LexieZhou/Decide',
    paper: 'https://arxiv.org/abs/2408.02133',
    paperLabel: 'Paper',
    description:
      'An interactive web tool visualizing a weighted knowledge graph of 2,376 version incompatibilities extracted from Stack Overflow. Lets users check library compatibility and find relevant references.',
  },
  {
    title: '2D to 3D Furniture Reconstruction',
    tag: 'HKU · 2023',
    category: 'CV & AR',
    image: '/img/projects/2Dto3D.png',
    description:
      'An optimized pipeline to generate 3D furniture models from single 2D images. Users can upload furniture and wall images to create customized 3D virtual classrooms.',
  },
  {
    title: 'FoodPrint',
    tag: 'HKU · 2023',
    category: 'Full-Stack',
    image: '/img/projects/Foodprint.png',
    github: 'https://github.com/LexieZhou/FoodPrint',
    paper: 'https://innoacademy.engg.hku.hk/foodprint/',
    paperLabel: 'Demo',
    description:
      'An AI-powered iOS diet assistant app featuring a dynamic fasting timer, image-based calorie calculator, diet and weight tracker, and a personalized LLM-powered chatbot diet instructor.',
  },
]

export const skills = [
  {
    label: 'Languages',
    items: ['Python', 'JavaScript', 'Java', 'C/C++', 'Swift', 'SQL', 'React', 'Node.js', 'Express.js', 'Django'],
  },
  {
    label: 'AI & ML',
    items: ['PyTorch', 'LangChain', 'LangGraph', 'LlamaIndex', 'RAG', 'OpenAI API', 'Hugging Face', 'Prompt Engineering'],
  },
  {
    label: 'Tools',
    items: ['Git', 'Docker', 'Figma', 'Firebase', 'PostgreSQL', 'MongoDB', 'Tableau', 'Unity', 'Xcode'],
  },
]
