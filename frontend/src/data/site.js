import { allShortCourses } from './coursesData'

export const mainNav = [
  { label: 'Home', to: '/' },
  { label: 'Short Courses', to: '/short-courses' },
  { label: 'Diplomas', to: '/courses' },
  { label: 'Student Life', to: '/student' },
  { label: 'Faculty & Staff', to: '/staff' },
]

export const topLinks = [
  { label: 'About OUSL', to: '/about' },
  { label: 'Compare Courses', to: '/compare' },
  { label: 'Resources & Downloads', to: '/resources' },
  { label: 'Library Network', to: '/library' },
  { label: 'Events & Intakes', to: '/events' },
  { label: 'News & Media', to: '/news' },
  { label: 'Contact Us', to: '/contact' },
]

export const footerLinksPrimary = [
  { label: 'About OUSL', to: '/about' },
  { label: 'Chancellor & Leadership', to: '/leadership' },
  { label: 'How ODL Works', to: '/how-odl-works' },
  { label: 'Regional Centres Network', to: '/regional-centres' },
  { label: 'Student Support Services', to: '/student-support' },
  { label: 'Library System', to: '/library' },
  { label: 'Careers & Opportunities', to: '/careers' },
  { label: 'News & Announcements', to: '/news' },
]

export const footerLinksSecondary = [
  { label: 'Contact & Inquiries', to: '/contact' },
  { label: 'Terms of Use', to: '/terms' },
  { label: 'Privacy & Cookie Statement', to: '/privacy' },
  { label: 'Right to Information (RTI)', to: '/rti' },
]

export const footerAbout = [
  ...footerLinksPrimary,
  ...footerLinksSecondary,
]

export const categories = [
  'Business & Management',
  'IT & Computing',
  'Health Sciences',
  'Natural Sciences & Agriculture',
  'Education & Teaching',
  'Languages & Communication',
  'Law & Social Sciences',
]

// Fallback courses list referencing the authentic OUSL short courses
export const courses = allShortCourses.slice(0, 12).map((c) => ({
  id: c.id,
  slug: c.slug,
  title: c.title,
  category: c.category,
  date: c.intake,
  image: c.image || c.fallbackImage,
  duration: c.duration,
  fee: c.fee,
  mode: c.mode,
  faculty: c.faculty,
  shortDescription: c.shortDescription,
}))

export const diplomas = [
  {
    slug: 'higher-diploma-data-security-technology',
    title: 'Higher National Diploma in Data Security Technology',
    faculty: 'Faculty of Engineering Technology',
    duration: '2 Years',
    fee: 'Rs. 120,000',
    mode: 'Blended',
    image: '/images/faculty-eng.jpg',
    description: 'Specialized diploma in network security, cyber defense, digital forensics, and enterprise security frameworks.'
  },
  {
    slug: 'bsc-information-technology',
    title: 'BSc in Information Technology Pathway Diploma',
    faculty: 'Faculty of Natural Sciences',
    duration: '3 Years',
    fee: 'Rs. 165,000',
    mode: 'Blended',
    image: '/images/hero-home.jpg',
    description: 'Comprehensive curriculum in software development, cloud computing, database design, and algorithmic thinking.'
  },
  {
    slug: 'diploma-food-science-technology',
    title: 'Diploma in Food Science & Technology',
    faculty: 'Faculty of Natural Sciences',
    duration: '1 Year',
    fee: 'Rs. 75,000',
    mode: 'On-site & Lab',
    image: '/images/faculty-sci.jpg',
    description: 'Practical training in food processing, microbial analysis, safety compliance (HACCP/ISO), and sensory evaluation.'
  },
  {
    slug: 'diploma-in-management',
    title: 'Diploma in Management & Business Administration',
    faculty: 'Faculty of Management Studies',
    duration: '1 Year',
    fee: 'Rs. 65,000',
    mode: 'Online',
    image: '/images/faculty-mgmt.jpg',
    description: 'Essential business management principles, organizational behavior, marketing strategy, and financial analytics.'
  },
  {
    slug: 'diploma-in-english-language-teaching',
    title: 'Diploma in Teaching English as a Second Language (TESL)',
    faculty: 'Faculty of Education',
    duration: '1 Year',
    fee: 'Rs. 60,000',
    mode: 'Blended',
    image: '/images/faculty-edu.jpg',
    description: 'Methodologies for modern language education, classroom management, lesson planning, and communicative testing.'
  },
  {
    slug: 'diploma-in-nursing-leadership',
    title: 'Diploma in Advanced Nursing & Clinical Care',
    faculty: 'Faculty of Health Sciences',
    duration: '18 Months',
    fee: 'Rs. 95,000',
    mode: 'Blended & Clinical',
    image: '/images/faculty-health.jpg',
    description: 'Comprehensive clinical competencies, health systems management, evidence-based care, and patient ethics.'
  },
]

export const faculties = [
  {
    id: 'engineering',
    name: 'Faculty of Engineering Technology',
    shortName: 'Engineering',
    dean: 'Prof. N. S. Weerakoon',
    departments: ['Electrical & Computer Engineering', 'Civil Engineering', 'Mechanical Engineering', 'Textile & Apparel Technology', 'Agricultural & Plantation Engineering'],
    image: '/images/faculty-eng.jpg',
    description: 'Pioneering practical engineering training, CAD/BIM technologies, computer networking, and industrial innovation through flexible distance models.',
    coursesCount: 14
  },
  {
    id: 'management',
    name: 'Faculty of Management Studies',
    shortName: 'Management',
    dean: 'Prof. V. Sivalogathasan',
    departments: ['Marketing Management', 'Human Resource Management', 'Accounting & Finance', 'Organizational Studies'],
    image: '/images/faculty-mgmt.jpg',
    description: 'Empowering future leaders, entrepreneurs, and corporate professionals with real-world business acumen, analytics, and accounting prowess.',
    coursesCount: 12
  },
  {
    id: 'health',
    name: 'Faculty of Health Sciences',
    dean: 'Prof. B. S. S. De Silva',
    shortName: 'Health Sciences',
    departments: ['Nursing', 'Pharmacy', 'Medical Laboratory Sciences', 'Basic Sciences'],
    image: '/images/faculty-health.jpg',
    description: 'Advancing healthcare excellence across Sri Lanka through specialized nursing, dispensing optics, palliative care, and pharmacology programmes.',
    coursesCount: 8
  },
  {
    id: 'natural-sciences',
    name: 'Faculty of Natural Sciences',
    dean: 'Prof. G. W. A. Rohan Fernando',
    shortName: 'Natural Sciences',
    departments: ['Botany', 'Chemistry', 'Mathematics', 'Physics', 'Zoology'],
    image: '/images/faculty-sci.jpg',
    description: 'Fostering scientific inquiry and practical laboratory acumen in molecular biology, gene technology, urban agriculture, and cosmetic science.',
    coursesCount: 9
  },
  {
    id: 'education',
    name: 'Faculty of Education',
    dean: 'Prof. F. M. Nawastheen',
    shortName: 'Education',
    departments: ['Early Childhood & Primary Education', 'Secondary & Tertiary Education', 'Special Education'],
    image: '/images/faculty-edu.jpg',
    description: 'Shaping educators and academic administrators through inclusive teaching practices, school management, and educational research methods.',
    coursesCount: 7
  },
  {
    id: 'humanities',
    name: 'Faculty of Humanities & Social Sciences',
    dean: 'Prof. S. R. S. N. Sudasinghe',
    shortName: 'Humanities & Social Sciences',
    departments: ['Language Studies', 'Legal Studies', 'Social Studies'],
    image: '/images/faculty-hss.jpg',
    description: 'Championing multilingualism, legal literacy, media production, and social safeguards for human-centered societal development.',
    coursesCount: 10
  },
]

export const regionalCentres = [
  {
    id: 'colombo',
    name: 'Colombo Regional Centre (Nawala)',
    province: 'Western Province',
    address: 'The Open University of Sri Lanka, P.O. Box 21, Nawala, Nugegoda 10250',
    phone: '+94 11 2881000 / +94 11 2881256',
    email: 'crc@ou.ac.lk',
    hours: 'Monday – Saturday: 8:30 AM – 4:30 PM',
    facilities: ['Main Examination Hall', 'Central Library', 'Computer Labs', 'Engineering Workshops', 'Health Centre', 'Audio-Visual Studio', 'Cafeteria', 'Student Advisory Service'],
    students: '21,000+ Enrolled',
    mapUrl: 'https://maps.google.com/?q=The+Open+University+of+Sri+Lanka+Nawala'
  },
  {
    id: 'kandy',
    name: 'Kandy Regional Centre',
    province: 'Central Province',
    address: 'Polgolla, Kandy 20250',
    phone: '+94 81 2494444 / +94 81 2494083',
    email: 'krc@ou.ac.lk',
    hours: 'Tuesday – Saturday: 8:30 AM – 4:30 PM',
    facilities: ['Science & Computer Laboratories', 'Regional Library', 'Multi-purpose Auditorium', 'Day School Lecture Rooms', 'Video Conferencing Facility'],
    students: '5,500+ Enrolled',
    mapUrl: 'https://maps.google.com/?q=Open+University+Polgolla+Kandy'
  },
  {
    id: 'matara',
    name: 'Matara Regional Centre',
    province: 'Southern Province',
    address: 'Nupe, Matara 81000',
    phone: '+94 41 2222932 / +94 41 2222114',
    email: 'mrc@ou.ac.lk',
    hours: 'Tuesday – Saturday: 8:30 AM – 4:30 PM',
    facilities: ['Computer Training Centre', 'Regional Library & E-Learning Unit', 'Day School Rooms', 'Counseling Service'],
    students: '4,000+ Enrolled',
    mapUrl: 'https://maps.google.com/?q=Open+University+Nupe+Matara'
  },
  {
    id: 'jaffna',
    name: 'Jaffna Regional Centre',
    province: 'Northern Province',
    address: 'Brown Road, Kokuvil, Jaffna 40000',
    phone: '+94 21 2223380 / +94 21 2222472',
    email: 'jrc@ou.ac.lk',
    hours: 'Tuesday – Saturday: 8:30 AM – 4:30 PM',
    facilities: ['Modern IT Laboratory', 'Science Practicum Labs', 'Full Lending Library', 'Online Testing Centre'],
    students: '3,800+ Enrolled',
    mapUrl: 'https://maps.google.com/?q=Open+University+Kokuvil+Jaffna'
  },
  {
    id: 'anuradhapura',
    name: 'Anuradhapura Regional Centre',
    province: 'North Central Province',
    address: 'Jayanthi Mawatha, Anuradhapura 50000',
    phone: '+94 25 2222871 / +94 25 2234475',
    email: 'arc@ou.ac.lk',
    hours: 'Tuesday – Saturday: 8:30 AM – 4:30 PM',
    facilities: ['Computer Centre', 'Regional Library', 'Lecture Halls', 'Agriculture Practicum Link'],
    students: '2,900+ Enrolled',
    mapUrl: 'https://maps.google.com/?q=Open+University+Jayanthi+Mawatha+Anuradhapura'
  },
  {
    id: 'batticaloa',
    name: 'Batticaloa Regional Centre',
    province: 'Eastern Province',
    address: 'New Road, Batticaloa 30000',
    phone: '+94 65 2222264 / +94 65 2224430',
    email: 'brc@ou.ac.lk',
    hours: 'Tuesday – Saturday: 8:30 AM – 4:30 PM',
    facilities: ['Multimedia Resource Centre', 'Library', 'Day School Auditorium', 'Registration Desk'],
    students: '2,500+ Enrolled',
    mapUrl: 'https://maps.google.com/?q=Open+University+New+Road+Batticaloa'
  },
  {
    id: 'badulla',
    name: 'Badulla Regional Centre',
    province: 'Uva Province',
    address: 'Bandaranayake Road, Badulla 90000',
    phone: '+94 55 2228842 / +94 55 2230190',
    email: 'bdrc@ou.ac.lk',
    hours: 'Tuesday – Saturday: 8:30 AM – 4:30 PM',
    facilities: ['Computer Facility', 'Regional Lending Library', 'Day School Classrooms', 'Student Help Desk'],
    students: '2,200+ Enrolled',
    mapUrl: 'https://maps.google.com/?q=Open+University+Bandaranayake+Road+Badulla'
  },
  {
    id: 'kurunegala',
    name: 'Kurunegala Regional Centre',
    province: 'North Western Province',
    address: 'Negombo Road, Malkaduwawa, Kurunegala 60000',
    phone: '+94 37 2223473 / +94 37 2220862',
    email: 'kurc@ou.ac.lk',
    hours: 'Tuesday – Saturday: 8:30 AM – 4:30 PM',
    facilities: ['State-of-the-art Computer Lab', 'Regional Library', 'Day School Lecture Theatres', 'Conference Room'],
    students: '3,400+ Enrolled',
    mapUrl: 'https://maps.google.com/?q=Open+University+Malkaduwawa+Kurunegala'
  },
  {
    id: 'ratnapura',
    name: 'Ratnapura Regional Centre',
    province: 'Sabaragamuwa Province',
    address: 'Hidellana, Ratnapura 70000',
    phone: '+94 45 2228660 / +94 45 2229598',
    email: 'rrc@ou.ac.lk',
    hours: 'Tuesday – Saturday: 8:30 AM – 4:30 PM',
    facilities: ['E-Learning Laboratory', 'Regional Library Network', 'Day School Classrooms', 'Career Guidance Counter'],
    students: '2,600+ Enrolled',
    mapUrl: 'https://maps.google.com/?q=Open+University+Hidellana+Ratnapura'
  },
]

export const studyCentres = [
  { town: 'Ambalangoda', district: 'Galle', phone: '+94 91 2258585' },
  { town: 'Ampara', district: 'Ampara', phone: '+94 63 2222052' },
  { town: 'Bandarawela', district: 'Badulla', phone: '+94 57 2223533' },
  { town: 'Galle', district: 'Galle', phone: '+94 91 2244154' },
  { town: 'Gampaha', district: 'Gampaha', phone: '+94 33 2234579' },
  { town: 'Hambantota', district: 'Hambantota', phone: '+94 47 2221290' },
  { town: 'Hatton', district: 'Nuwara Eliya', phone: '+94 51 2223848' },
  { town: 'Kalutara', district: 'Kalutara', phone: '+94 34 2226270' },
  { town: 'Kegalle', district: 'Kegalle', phone: '+94 35 2222501' },
  { town: 'Kilinochchi', district: 'Kilinochchi', phone: '+94 21 2285680' },
  { town: 'Kuliyapitiya', district: 'Kurunegala', phone: '+94 37 2283073' },
  { town: 'Mannar', district: 'Mannar', phone: '+94 23 2222923' },
  { town: 'Monaragala', district: 'Monaragala', phone: '+94 55 2276863' },
  { town: 'Mullaitivu', district: 'Mullaitivu', phone: '+94 21 2290070' },
  { town: 'Polonnaruwa', district: 'Polonnaruwa', phone: '+94 27 2225798' },
  { town: 'Puttalam', district: 'Puttalam', phone: '+94 32 2266820' },
  { town: 'Trincomalee', district: 'Trincomalee', phone: '+94 26 2224590' },
  { town: 'Vavuniya', district: 'Vavuniya', phone: '+94 24 2222990' },
  { town: 'Matale', district: 'Matale', phone: '+94 66 2222540' },
]

export const leadership = {
  chancellor: {
    name: 'Dr. M. A. Upali Mampitiya',
    title: 'Chancellor of The Open University of Sri Lanka',
    image: '/images/chancellor-silhouette.jpg',
    bio: 'Dr. M. A. Upali Mampitiya is the 6th Chancellor of The Open University of Sri Lanka, appointed by the President of Sri Lanka. A prominent scholar and educator with extensive leadership experience across higher education policy and university governance.',
    quote: 'Open and Distance Learning at OUSL has transformed the educational landscape of Sri Lanka by breaking geographical, economic, and institutional boundaries. Our short courses empower learners of all backgrounds to acquire practical competencies, foster innovation, and actively contribute to the nation’s socioeconomic progress.'
  },
  viceChancellor: {
    name: 'Senior Prof. P.M.C. Thilakerathne',
    title: 'Vice-Chancellor of The Open University of Sri Lanka',
    image: '/images/vice-chancellor-silhouette.jpg',
    bio: 'Senior Professor P.M.C. Thilakerathne oversees all academic, administrative, and strategic development of OUSL. Under his visionary guidance, the university has expanded digital learning infrastructures, modernized course syllabi, and established nationwide industry partnerships.',
    quote: 'At OUSL, our commitment is unwavering: ensuring that every ambitious individual in Sri Lanka and abroad can access high-quality university-level education without disrupting their professional and personal commitments.'
  }
}

export const instructors = [
  {
    id: '1',
    name: 'Prof. N. S. Weerakoon',
    role: 'Department heads',
    faculty: 'Faculty of Engineering Technology',
    topic: 'AutoCAD, Revit Architecture & Engineering Systems',
    quote: 'Practical design expertise and hands-on computer-aided engineering are cornerstones of sustainable modern infrastructure development.',
    image: '/images/faculty-eng.jpg',
    email: 'deaneng@ou.ac.lk'
  },
  {
    id: '2',
    name: 'Prof. V. Sivalogathasan',
    role: 'Department heads',
    faculty: 'Faculty of Management Studies',
    topic: 'Marketing Analytics, Strategic HRM & Digital Business',
    quote: 'Actionable data analytics and progressive management practices are vital for any enterprise striving for competitiveness.',
    image: '/images/faculty-mgmt.jpg',
    email: 'deanmgt@ou.ac.lk'
  },
  {
    id: '3',
    name: 'Prof. B. S. S. De Silva',
    role: 'Department heads',
    faculty: 'Faculty of Health Sciences',
    topic: 'Wound Care Nursing, Palliative Care & Clinical Practices',
    quote: 'Compassionate, evidence-based healthcare education saves lives and raises the clinical standards across our hospital networks.',
    image: '/images/faculty-health.jpg',
    email: 'deanhealth@ou.ac.lk'
  },
  {
    id: '4',
    name: 'Dr. Nimali Perera',
    role: 'Instructors',
    faculty: 'Faculty of Natural Sciences',
    topic: 'Molecular Biology, Gene Technology & Cosmetic Science',
    quote: 'Laboratory science must translate into practical industrial applications and community health solutions.',
    image: '/images/faculty-sci.jpg',
    email: 'nperera@ou.ac.lk'
  },
  {
    id: '5',
    name: 'Prof. F. M. Nawastheen',
    role: 'Department heads',
    faculty: 'Faculty of Education',
    topic: 'Educational Leadership, School Management & Special Needs Education',
    quote: 'Great teaching is about cultivating critical curiosity and inclusive environments where every learner thrives.',
    image: '/images/faculty-edu.jpg',
    email: 'deanedu@ou.ac.lk'
  },
  {
    id: '6',
    name: 'Ms. Sachini De Alwis',
    role: 'Instructors',
    faculty: 'Faculty of Engineering Technology',
    topic: 'Software Test Automation, Python & Web Engineering',
    quote: 'Writing clean code and rigorous automated test suites bridges the gap between classroom theory and global tech standards.',
    image: '/images/faculty-eng.jpg',
    email: 'sdealwis@ou.ac.lk'
  },
]

export const newsArticles = [
  {
    slug: '37th-general-convocation-ousl',
    title: '37th General Convocation Celebrates Over 4,500 Graduates at BMICH',
    date: '28 October 2026',
    category: 'University News',
    image: '/images/news-convocation.jpg',
    summary: 'The Open University of Sri Lanka conferred degrees, postgraduate diplomas, and short course professional certificates to thousands of accomplished learners.',
    content: 'The 37th General Convocation of The Open University of Sri Lanka was ceremonially held at the Bandaranaike Memorial International Conference Hall (BMICH), Colombo. Chancellor Dr. M. A. Upali Mampitiya and Vice-Chancellor Senior Prof. P.M.C. Thilakerathne presided over the sessions, honoring undergraduate, postgraduate, and professional short course achievers.'
  },
  {
    slug: 'guest-lecture-prof-arumugam',
    title: 'Distinguished Guest Lecture by Eminent Indian Professor S. Arumugam',
    date: '15 September 2026',
    category: 'Academic Lectures',
    image: '/images/news-lecture.jpg',
    summary: 'Department of Mathematics and Natural Sciences hosted a high-impact symposium on graph theory and algorithmic applications in modern machine learning.',
    content: 'Prof. S. Arumugam, internationally acclaimed mathematician and researcher, delivered a special address to faculty members and postgraduate students at the Nawala Campus auditorium, highlighting contemporary research frontiers and international collaboration avenues.'
  },
  {
    slug: 'ousl-art-circle-exhibition',
    title: 'OUSL Art Circle Launches Annual National Student Cultural & Visual Arts Festival',
    date: '12 August 2026',
    category: 'Student Life',
    image: '/images/news-art.jpg',
    summary: 'Celebrating the diverse artistic and cultural talents of open learning students from all 9 provinces across Sri Lanka.',
    content: 'The OUSL Art Circle inaugurated its annual exhibition at the Colombo Regional Centre, presenting student artworks, traditional crafts, dramatic recitals, and musical presentations reflecting the vibrant pluralism of the university community.'
  },
  {
    slug: 'neda-brain-into-business',
    title: 'NEDA & OUSL Partner to Launch "Brain Into Business" Entrepreneurship Acceleration',
    date: '24 July 2026',
    category: 'Partnerships',
    image: '/images/faculty-mgmt.jpg',
    summary: 'National Enterprise Development Authority joins forces with OUSL Management Studies to mentor 250 emerging small-business innovators.',
    content: 'Through this national initiative, short course graduates in Entrepreneurship and Small Business receive specialized seed mentorship, financial consulting, and direct market linkage via regional development hubs.'
  }
]

export const upcomingEvents = [
  {
    id: 1,
    title: 'Short Courses 2026/27 Intake 02 Applications Deadline',
    date: '15 November 2026',
    time: '11:59 PM (Online)',
    location: 'Online Application Portal / Regional Centres',
    category: 'Admissions',
    description: 'Final date for submission of application forms and BOC payment slips for Marketing Analytics, Python, AutoCAD, and Wound Care Nursing.'
  },
  {
    id: 2,
    title: 'Open Virtual Day: Explore 60+ Career Short Courses',
    date: '22 November 2026',
    time: '10:00 AM – 1:00 PM',
    location: 'Live on Zoom & YouTube @OuAcLk',
    category: 'Orientation',
    description: 'Meet course coordinators, ask questions on syllabus and fee installment plans, and discover career opportunities across all 6 faculties.'
  },
  {
    id: 3,
    title: 'Hands-on Day School: Practical Molecular Biology & Gene Technology',
    date: '05 December 2026',
    time: '9:00 AM – 4:00 PM',
    location: 'Central Laboratories Complex, Nawala Campus',
    category: 'Day School',
    description: 'Practical lab session covering DNA extraction, gel electrophoresis, and PCR amplification protocols for enrolled candidates.'
  },
  {
    id: 4,
    title: 'Annual Research Conference on Open & Distance Learning (ODL 2026)',
    date: '18 December 2026',
    time: '8:30 AM – 5:00 PM',
    location: 'Senate Hall, OUSL Main Administration Building',
    category: 'Conference',
    description: 'Academics from Sri Lanka, India, Malaysia, and the Commonwealth of Learning assemble to present research on digital higher education pedagogy.'
  }
]

export const faqs = [
  {
    question: 'How do I apply for an OUSL short course?',
    answer: 'You can apply directly online through our website using the "Apply Now" button. Select your desired course, fill in your personal details, and upload or enter your Bank of Ceylon payment slip reference. Alternatively, visit any of our 9 Regional Centres or 19 Study Centres island-wide to collect and submit a printed application.'
  },
  {
    question: 'How can I pay the course fee?',
    answer: 'Course fees can be paid in cash at any branch of Bank of Ceylon (BOC) island-wide using the special OUSL deposit voucher to Account No. 7417821 (Nawala Branch). You can also pay securely online via our debit/credit card gateway during the application process.'
  },
  {
    question: 'Can I study while continuing full-time employment?',
    answer: 'Yes! All OUSL short courses are designed specifically for working adults, busy students, and practitioners. Delivery formats include fully online asynchronous modules, weekend interactive day schools, and evening lectures.'
  },
  {
    question: 'Will I receive a recognized university certificate?',
    answer: 'Yes. Upon successful completion of course coursework and evaluations, you will receive an official Certificate of Competence issued by The Open University of Sri Lanka, bearing the university seal and recognized across both public and private sectors.'
  },
  {
    question: 'Where can I attend practical sessions and laboratory classes?',
    answer: 'Practical sessions and day schools are held at our Colombo Regional Centre (Nawala) as well as selected regional centres such as Kandy, Matara, Jaffna, Anuradhapura, Kurunegala, and Batticaloa.'
  },
  {
    question: 'Are installment payment plans available for short courses?',
    answer: 'Yes. Several short courses and all diploma programmes offer flexible installment payment schemes so that the fee can be settled in manageable stages across the duration of study.'
  }
]
