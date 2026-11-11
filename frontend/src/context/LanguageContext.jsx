import { createContext, useContext, useState, useEffect } from 'react'

export const translations = {
  en: {
    // TopBar
    generalPhone: 'General: +94 11 2881000',
    inquiriesEmail: 'pio@ou.ac.lk',
    library: 'Library',
    downloads: 'Downloads',
    compare: 'Compare Courses',
    studentPortal: 'Student Portal',
    signIn: 'Sign In',

    // Header Navigation
    home: 'Home',
    shortCourses: 'Short Courses',
    diplomas: 'Diplomas',
    studentLife: 'Student Life',
    facultyStaff: 'Faculty & Staff',
    aboutOusl: 'About OUSL',
    contact: 'Contact',
    applyNow: 'Apply Now',

    // Footer & Common
    trilingualPortal: 'Trilingual Portal',
    officialSocials: 'Official Social Media',
    feeDeposit: 'Fee Deposit & Verification',
    bocAccount: 'Bank of Ceylon (BOC)',
    accountNo: 'Account No: 7417821',
    branchName: 'Branch: Nawala Branch',
    payDesc: 'Pay at any BOC branch or upload transfer receipt during online application.',
    regionalCentresTitle: 'Regional Centres (9)',
    popularDisciplines: 'Popular Disciplines',
    allRightsReserved: 'All rights reserved. The Open University of Sri Lanka, Nawala, Nugegoda.',

    // Quick Actions
    applyForShortCourse: 'Apply for Short Course',
  },
  si: {
    // TopBar
    generalPhone: 'සාමාන්‍ය: +94 11 2881000',
    inquiriesEmail: 'pio@ou.ac.lk',
    library: 'පුස්තකාලය',
    downloads: 'බාගැනීම්',
    compare: 'සංසන්දනය',
    studentPortal: 'ශිෂ්‍ය ද්වාරය',
    signIn: 'පුරනය වන්න',

    // Header Navigation
    home: 'මුල් පිටුව',
    shortCourses: 'කෙටි පාඨමාලා',
    diplomas: 'ඩිප්ලෝමා',
    studentLife: 'ශිෂ්‍ය ජීවිතය',
    facultyStaff: 'කාර්ය මණ්ඩලය',
    aboutOusl: 'OUSL ගැන',
    contact: 'සම්බන්ධ වන්න',
    applyNow: 'අයදුම් කරන්න',

    // Footer & Common
    trilingualPortal: 'ත්‍රෛභාෂා ද්වාරය',
    officialSocials: 'නිල සමාජ මාධ්‍ය',
    feeDeposit: 'පාඨමාලා ගාස්තු ගෙවීම්',
    bocAccount: 'ලංකා බැංකුව (BOC)',
    accountNo: 'ගිණුම් අංකය: 7417821',
    branchName: 'ශාඛාව: නාවල ශාඛාව',
    payDesc: 'ඕනෑම ලංකා බැංකු ශාඛාවකින් ගෙවන්න හෝ ඔන්ලයින් රිසිට්පත යොමු කරන්න.',
    regionalCentresTitle: 'ප්‍රාදේශීය මධ්‍යස්ථාන (9)',
    popularDisciplines: 'ජනප්‍රිය විෂය ක්ෂේත්‍රයන්',
    allRightsReserved: 'සියලුම හිමිකම් ඇවිරිණි. ශ්‍රී ලංකා විවෘත විශ්වවිද්‍යාලය, නාවල, නුගේගොඩ.',

    // Quick Actions
    applyForShortCourse: 'අයදුම් කරන්න',
  },
  ta: {
    // TopBar
    generalPhone: 'பொது: +94 11 2881000',
    inquiriesEmail: 'pio@ou.ac.lk',
    library: 'நூலகம்',
    downloads: 'பதிவிறக்கம்',
    compare: 'ஒப்பீடு',
    studentPortal: 'மாணவர் போர்டல்',
    signIn: 'உள்நுழைக',

    // Header Navigation
    home: 'முகப்பு',
    shortCourses: 'குறுகிய கற்கைகள்',
    diplomas: 'பட்டயங்கள்',
    studentLife: 'மாணவர் வாழ்வு',
    facultyStaff: 'பணியாளர்கள்',
    aboutOusl: 'OUSL பற்றி',
    contact: 'தொடர்புக்கு',
    applyNow: 'விண்ணப்பி',

    // Footer & Common
    trilingualPortal: 'மும்மொழி போர்டல்',
    officialSocials: 'அதிகாரப்பூர்வ சமூக ஊடகங்கள்',
    feeDeposit: 'கட்டண வைப்பு & சரிபார்ப்பு',
    bocAccount: 'இலங்கை வங்கி (BOC)',
    accountNo: 'கணக்கு எண்: 7417821',
    branchName: 'கிளை: நாவல கிளை',
    payDesc: 'எந்தவொரு இலங்கை வங்கிக் கிளையிலும் செலுத்தலாம் அல்லது ரசீதை பதிவேற்றலாம்.',
    regionalCentresTitle: 'பிராந்திய நிலையங்கள் (9)',
    popularDisciplines: 'பிரபலமான துறைகள்',
    allRightsReserved: 'அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை. இலங்கை திறந்த பல்கலைக்கழகம், நாவல, நுகேகொட.',

    // Quick Actions
    applyForShortCourse: 'விண்ணப்பிக்கவும்',
  }
}

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem('portal_lang') || 'en'
    } catch {
      return 'en'
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('portal_lang', lang)
      document.documentElement.lang = lang
    } catch {}
  }, [lang])

  const t = (key) => {
    return translations[lang]?.[key] || translations.en[key] || key
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    return {
      lang: 'en',
      setLang: () => {},
      t: (k) => translations.en[k] || k,
    }
  }
  return context
}

