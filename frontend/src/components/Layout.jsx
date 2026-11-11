import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  RiFacebookFill,
  RiYoutubeFill,
  RiLinkedinFill,
  RiInstagramFill,
  RiTwitterXFill,
  RiUserFill,
  RiMenuLine,
  RiCloseLine,
  RiPhoneFill,
  RiMailFill,
  RiMapPinFill,
  RiBankCardFill,
  RiArrowRightSLine,
  RiArrowDownSLine,
  RiLogoutBoxRLine,
  RiDashboardLine
} from 'react-icons/ri'
import { mainNav, topLinks, footerAbout, footerLinksPrimary, footerLinksSecondary, categories, regionalCentres } from '../data/site'
import { Button } from './ui'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'

function getInitials(name) {
  if (!name) return 'U'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function UserDropdown({ user, onLogout, variant = 'dark' }) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)
  const displayName = user?.name || user?.fullName || user?.full_name || user?.email?.split('@')[0] || 'User'
  const initials = getInitials(displayName)

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const buttonClasses =
    variant === 'dark'
      ? 'flex items-center gap-1.5 rounded-lg bg-white/10 border border-white/15 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-white/20 transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-orange'
      : 'flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-bold text-brand-navy hover:bg-gray-100 hover:border-gray-300 transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-orange'

  const avatarSize = variant === 'dark' ? 'h-4 w-4 text-[9px]' : 'h-6 w-6 text-[10px]'

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={`User menu for ${displayName}`}
        className={buttonClasses}
      >
        <span className={`flex ${avatarSize} items-center justify-center rounded-full bg-brand-orange font-extrabold text-white shrink-0`}>
          {initials}
        </span>
        <span className="max-w-[110px] xl:max-w-[150px] truncate" title={displayName}>
          {displayName}
        </span>
        <RiArrowDownSLine
          size={variant === 'dark' ? 13 : 15}
          className={`transition-transform duration-150 ${open ? 'rotate-180 text-brand-orange' : variant === 'dark' ? 'text-gray-300' : 'text-gray-400'}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 mt-1.5 w-56 rounded-xl bg-white shadow-xl border border-gray-100 py-1.5 z-[100] text-gray-800 animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="px-3.5 py-2.5 border-b border-gray-100">
            <p className="text-xs font-bold text-brand-navy truncate" title={displayName}>
              {displayName}
            </p>
            <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
            <span className="mt-1 inline-block rounded-md bg-brand-mist px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-brand-navy border border-brand-navy/10">
              {user?.role === 'admin' ? 'Lecturer' : 'Student'}
            </span>
          </div>

          <div className="py-1">
            {user?.role === 'admin' ? (
              <Link
                to="/admin/dashboard"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-brand-mist hover:text-brand-navy transition"
              >
                <RiDashboardLine size={15} className="text-brand-orange shrink-0" />
                <span>Lecturer Dashboard</span>
              </Link>
            ) : (
              <Link
                to="/student/portal"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-brand-mist hover:text-brand-navy transition"
              >
                <RiDashboardLine size={15} className="text-brand-orange shrink-0" />
                <span>Student Portal</span>
              </Link>
            )}
          </div>

          <div className="border-t border-gray-100 pt-1">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false)
                onLogout()
              }}
              className="flex w-full items-center gap-2 px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition text-left cursor-pointer focus:outline-none focus:bg-red-50"
            >
              <RiLogoutBoxRLine size={15} className="text-red-500 shrink-0" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const socials = [
  { icon: RiFacebookFill, label: 'Facebook', href: 'https://www.facebook.com/ousl/' },
  { icon: RiYoutubeFill, label: 'YouTube', href: 'https://www.youtube.com/@OuAcLk/' },
  { icon: RiLinkedinFill, label: 'LinkedIn', href: 'https://www.linkedin.com/school/the-open-university-of-sri-lanka/' },
  { icon: RiInstagramFill, label: 'Instagram', href: 'https://www.instagram.com/ousl_official/' },
  { icon: RiTwitterXFill, label: 'X', href: 'https://twitter.com/ousl_official' },
]

const Socials = () => (
  <div className="flex items-center gap-1.5">
    {socials.map(({ icon: Icon, label, href }) => (
      <a
        key={label}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-gray-300 transition hover:bg-brand-orange hover:text-white"
      >
        <Icon size={14} />
      </a>
    ))}
  </div>
)

const TopBar = () => {
  const { lang, setLang, t } = useLanguage()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/', { replace: true })
  }

  return (
    <div className="hidden bg-brand-navy border-b border-white/10 text-xs text-gray-200 lg:block">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-5 py-2">
        {/* Contact & Key Links */}
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-4 text-[11px] text-gray-300">
            <a
              href="tel:+94112881000"
              className="flex items-center gap-1.5 hover:text-brand-orange transition whitespace-nowrap"
            >
              <RiPhoneFill size={13} className="text-brand-orange" />
              <span>+94 11 2881000</span>
            </a>
            <span className="text-white/20">•</span>
            <a
              href="mailto:pio@ou.ac.lk"
              className="flex items-center gap-1.5 hover:text-brand-orange transition whitespace-nowrap"
            >
              <RiMailFill size={13} className="text-brand-orange" />
              <span>pio@ou.ac.lk</span>
            </a>
          </div>

          <div className="h-3.5 w-px bg-white/20" />

          <nav className="flex items-center gap-3.5 text-[11px]" aria-label="Quick Links">
            <Link to="/library" className="text-gray-300 hover:text-brand-orange transition whitespace-nowrap">
              {t('library')}
            </Link>
            <span className="text-white/20">•</span>
            <Link to="/resources" className="text-gray-300 hover:text-brand-orange transition whitespace-nowrap">
              {t('downloads')}
            </Link>
            <span className="text-white/20">•</span>
            <Link to="/compare" className="text-gray-300 hover:text-brand-orange transition whitespace-nowrap">
              {t('compare')}
            </Link>
          </nav>
        </div>

        {/* Socials, Trilingual Switcher & Portals */}
        <div className="flex items-center gap-4">
          <Socials />

          <div className="h-3.5 w-px bg-white/20" />

          {/* Trilingual Switcher */}
          <div className="flex items-center gap-1 rounded-lg bg-white/10 p-0.5 text-[10px] font-bold">
            <button
              onClick={() => setLang('en')}
              className={`px-2 py-0.5 rounded transition ${lang === 'en' ? 'bg-brand-orange text-white' : 'text-gray-300 hover:text-white'
                }`}
              title="English"
            >
              EN
            </button>
            <button
              onClick={() => setLang('si')}
              className={`px-2 py-0.5 rounded transition ${lang === 'si' ? 'bg-brand-orange text-white' : 'text-gray-300 hover:text-white'
                }`}
              title="සිංහල"
            >
              සිං
            </button>
            <button
              onClick={() => setLang('ta')}
              className={`px-2 py-0.5 rounded transition ${lang === 'ta' ? 'bg-brand-orange text-white' : 'text-gray-300 hover:text-white'
                }`}
              title="தமிழ்"
            >
              த
            </button>
          </div>

          <div className="h-3.5 w-px bg-white/20" />

          <div className="flex items-center gap-2.5">
            {user?.role === 'admin' ? (
              <Link
                to="/admin/dashboard"
                className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 border border-white/15 px-3 py-1 text-[11px] font-bold text-white hover:bg-brand-orange hover:border-brand-orange transition whitespace-nowrap"
              >
                Lecturer Dashboard
              </Link>
            ) : (
              <Link
                to="/student/portal"
                className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 border border-white/15 px-3 py-1 text-[11px] font-bold text-white hover:bg-brand-orange hover:border-brand-orange transition whitespace-nowrap"
              >
                {t('studentPortal')}
              </Link>
            )}

            {user ? (
              <UserDropdown user={user} onLogout={handleLogout} variant="dark" />
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-orange hover:text-white transition whitespace-nowrap pl-1"
              >
                <RiUserFill size={14} /> {t('signIn')}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const Header = () => {
  const [open, setOpen] = useState(false)
  const { lang, setLang, t } = useLanguage()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    setOpen(false)
    await logout()
    navigate('/', { replace: true })
  }

  const navItems = [
    { to: '/', label: t('home') },
    { to: '/short-courses', label: t('shortCourses') },
    { to: '/courses', label: t('diplomas') },
    { to: '/student', label: t('studentLife') },
    { to: '/staff', label: t('facultyStaff') },
    { to: '/about', label: t('aboutOusl') },
    { to: '/contact', label: t('contact') },
  ]

  const link = ({ isActive }) =>
    `whitespace-nowrap border-b-2 py-1 ${lang !== 'en' ? 'text-[10px] px-0.5' : 'text-xs xl:text-sm px-1 xl:px-1.5'} font-bold transition duration-150 ${isActive ? 'border-brand-red text-brand-red' : 'border-transparent text-brand-navy hover:text-brand-red'}`

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm w-full">
      <div className="mx-auto flex max-w-[1280px] w-full items-center justify-between gap-2 xl:gap-4 px-4 sm:px-5 py-3">
        <Link to="/" className="flex items-center gap-2.5 sm:gap-3 shrink-0 whitespace-nowrap">
          <img
            src="/images/ousl-logo.png"
            alt="The Open University of Sri Lanka Crest Logo"
            className="h-12 w-10 sm:h-14 sm:w-12 object-contain shrink-0"
          />
          <div className="flex flex-col whitespace-nowrap">
            <span className="text-[10px] sm:text-xs font-bold leading-tight text-brand-navy tracking-tight whitespace-nowrap">
              ශ්‍රී ලංකා විවෘත විශ්වවිද්‍යාලය
            </span>
            <span className="text-[9px] sm:text-[10px] font-semibold leading-tight text-gray-600 whitespace-nowrap">
              இலங்கை திறந்த பல்கலைக்கழகம்
            </span>
            <span className="text-xs sm:text-sm font-extrabold leading-tight text-brand-red tracking-tight uppercase whitespace-nowrap">
              The Open University of Sri Lanka
            </span>
            <span className="text-[8px] sm:text-[9.5px] font-bold text-brand-orange uppercase tracking-wider whitespace-nowrap">
              Short Courses & Continuing Professional Development
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className={`hidden items-center ${lang !== 'en' ? 'justify-center gap-2' : 'justify-center gap-1 xl:gap-2.5 2xl:gap-4'} lg:flex min-w-0 flex-1`} aria-label="Main Navigation">
          {navItems.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.to === '/'} className={link}>
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex shrink-0">
          <Button
            to="/apply"
            variant="primary"
            className={`whitespace-nowrap shrink-0 py-2 ${lang !== 'en' ? 'text-[10px] px-2.5' : 'text-xs xl:text-sm px-4 xl:px-5 py-2.5'}`}
          >
            {t('applyNow')}
          </Button>
        </div>

        {/* Mobile menu trigger */}
        <button
          className="rounded-lg p-2 text-brand-navy hover:bg-gray-100 lg:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation menu"
          aria-expanded={open}
        >
          {open ? <RiCloseLine size={28} /> : <RiMenuLine size={28} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div className="border-t border-gray-200 bg-white px-5 py-6 shadow-xl lg:hidden">
          <nav className="flex flex-col gap-4 font-semibold text-brand-navy" aria-label="Mobile Navigation">
            {/* Mobile Trilingual Selector */}
            <div className="flex gap-2 pb-3 border-b border-gray-100">
              <button
                onClick={() => setLang('en')}
                className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition ${lang === 'en' ? 'bg-brand-orange text-white' : 'bg-gray-100 text-gray-700'
                  }`}
              >
                English
              </button>
              <button
                onClick={() => setLang('si')}
                className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition ${lang === 'si' ? 'bg-brand-orange text-white' : 'bg-gray-100 text-gray-700'
                  }`}
              >
                සිංහල
              </button>
              <button
                onClick={() => setLang('ta')}
                className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition ${lang === 'ta' ? 'bg-brand-orange text-white' : 'bg-gray-100 text-gray-700'
                  }`}
              >
                தமிழ்
              </button>
            </div>

            {navItems.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between border-b border-gray-100 pb-2 text-base"
              >
                {n.label}
                <RiArrowRightSLine size={20} className="text-gray-400" />
              </NavLink>
            ))}
            <div className="mt-4 flex flex-col gap-3">
              <Button to="/apply" variant="primary" onClick={() => setOpen(false)}>
                {t('applyForShortCourse')}
              </Button>
              {user?.role === 'admin' ? (
                <Button to="/admin/dashboard" variant="navy" onClick={() => setOpen(false)}>
                  Lecturer Dashboard
                </Button>
              ) : (
                <Button to="/student/portal" variant="navy" onClick={() => setOpen(false)}>
                  {t('studentPortal')}
                </Button>
              )}

              {user ? (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-orange text-[11px] font-extrabold text-white shrink-0">
                      {getInitials(user?.name || user?.fullName || user?.full_name || user?.email?.split('@')[0] || 'U')}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-brand-navy truncate">
                        {user?.name || user?.fullName || user?.full_name || user?.email?.split('@')[0] || 'User'}
                      </p>
                      <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 transition cursor-pointer"
                  >
                    <RiLogoutBoxRLine size={15} />
                    Sign Out
                  </button>
                </div>
              ) : (
                <Button to="/login" variant="outline" onClick={() => setOpen(false)}>
                  <RiUserFill size={15} className="mr-1" /> {t('signIn')}
                </Button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

const Footer = () => {
  const { lang, setLang, t } = useLanguage()

  return (
    <footer className="bg-brand-navy text-white">
      <div className="mx-auto max-w-[1280px] px-5 pt-16 pb-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Col 1: About University */}
          <div>
            <div className="flex items-center gap-3">
              <img src="/images/ousl-logo.png" alt="OUSL Logo" className="h-14 w-12 object-contain brightness-110" />
              <div>
                <h3 className="text-base font-extrabold leading-tight text-white">
                  The Open University of Sri Lanka
                </h3>
                <p className="text-xs text-brand-orange font-semibold">
                  Established under Act No. 16 of 1978
                </p>
              </div>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-gray-300">
              Sri Lanka&rsquo;s only national state university dedicated to Open and Distance Learning (ODL). Offering recognized degrees, diplomas, and career-oriented short courses across all 9 provinces.
            </p>
            <div className="mt-5 space-y-2 text-xs text-gray-300">
              <p className="flex items-start gap-2">
                <RiMapPinFill size={16} className="mt-0.5 shrink-0 text-brand-orange" />
                <span>P.O. Box 21, Nawala, Nugegoda 10250, Sri Lanka</span>
              </p>
              <p className="flex items-center gap-2">
                <RiPhoneFill size={16} className="shrink-0 text-brand-orange" />
                <span>(+94) 11 2881000 / 070 2067058</span>
              </p>
              <p className="flex items-center gap-2">
                <RiMailFill size={16} className="shrink-0 text-brand-orange" />
                <span>pio@ou.ac.lk / ithelpdesk@ou.ac.lk</span>
              </p>
            </div>
          </div>

          {/* Col 2: Short Course Categories */}
          <div>
            <h4 className="mb-4 text-sm font-extrabold uppercase tracking-wider text-brand-orange">
              {t('popularDisciplines')}
            </h4>
            <ul className="space-y-2.5 text-xs">
              {categories.map((c) => (
                <li key={c}>
                  <Link
                    to={`/short-courses?category=${encodeURIComponent(c)}`}
                    className="flex items-center gap-1.5 text-gray-300 transition hover:text-brand-orange"
                  >
                    <RiArrowRightSLine size={14} className="text-brand-orange" />
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Regional Centres Network */}
          <div>
            <h4 className="mb-4 text-sm font-extrabold uppercase tracking-wider text-brand-orange">
              {t('regionalCentresTitle')}
            </h4>
            <ul className="space-y-2 text-xs text-gray-300">
              {regionalCentres.map((r) => (
                <li key={r.id} className="flex justify-between items-center border-b border-white/5 pb-1">
                  <Link to="/regional-centres" className="hover:text-brand-orange transition">
                    {r.name.replace('Regional Centre', 'RC')}
                  </Link>
                  <span className="text-[10px] text-gray-400 font-mono">{r.phone.split('/')[0].trim()}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Payments & Connect */}
          <div>
            <h4 className="mb-4 text-sm font-extrabold uppercase tracking-wider text-brand-orange">
              {t('feeDeposit')}
            </h4>
            <div className="rounded-xl bg-white/10 p-3.5 text-xs text-gray-200">
              <p className="flex items-center gap-2 font-bold text-white">
                <RiBankCardFill className="text-brand-orange" size={18} />
                {t('bocAccount')}
              </p>
              <p className="mt-1">{t('accountNo')}</p>
              <p className="text-[11px] text-gray-400">{t('branchName')}</p>
              <p className="mt-2 text-[11px] leading-tight text-gray-300">
                {t('payDesc')}
              </p>
            </div>

            <div className="mt-5">
              <h5 className="mb-2 text-xs font-bold uppercase tracking-wider text-white">
                {t('officialSocials')}
              </h5>
              <Socials />
            </div>

            <div className="mt-5">
              <h5 className="mb-2 text-xs font-bold uppercase tracking-wider text-white">
                {t('trilingualPortal')}
              </h5>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setLang('en')}
                  className={`rounded px-2.5 py-1 text-xs font-bold transition ${lang === 'en'
                    ? 'border border-brand-orange bg-brand-orange/20 text-brand-orange'
                    : 'border border-white/20 text-gray-300 hover:bg-white/10'
                    }`}
                >
                  English (EN)
                </button>
                <button
                  type="button"
                  onClick={() => setLang('si')}
                  className={`rounded px-2.5 py-1 text-xs font-bold transition ${lang === 'si'
                    ? 'border border-brand-orange bg-brand-orange/20 text-brand-orange'
                    : 'border border-white/20 text-gray-300 hover:bg-white/10'
                    }`}
                >
                  සිංහල (SIN)
                </button>
                <button
                  type="button"
                  onClick={() => setLang('ta')}
                  className={`rounded px-2.5 py-1 text-xs font-bold transition ${lang === 'ta'
                    ? 'border border-brand-orange bg-brand-orange/20 text-brand-orange'
                    : 'border border-white/20 text-gray-300 hover:bg-white/10'
                    }`}
                >
                  தமிழ் (TA)
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-center text-xs text-gray-400">
          <nav aria-label="Footer Primary Navigation" className="mb-2.5 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs">
            {footerLinksPrimary.map((item) => (
              <Link key={item.label} to={item.to} className="hover:text-white transition">
                {item.label}
              </Link>
            ))}
          </nav>
          <nav aria-label="Footer Secondary Navigation" className="mb-3.5 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-gray-400">
            {footerLinksSecondary.map((item) => (
              <Link key={item.label} to={item.to} className="hover:text-white transition">
                {item.label}
              </Link>
            ))}
          </nav>
          <p>
            &copy; {new Date().getFullYear()} The Open University of Sri Lanka. All Rights Reserved. State University Recognized by University Grants Commission (UGC).
          </p>
        </div>
      </div>
    </footer>
  )
}

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-gray-800 antialiased selection:bg-brand-orange selection:text-white">
      <TopBar />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
