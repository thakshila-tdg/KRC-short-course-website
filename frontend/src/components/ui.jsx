import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  RiSearchLine,
  RiArrowRightDoubleLine,
  RiHome4Fill,
  RiArrowRightSLine,
  RiTimeLine,
  RiMoneyDollarCircleLine,
  RiCalendarLine,
  RiGraduationCapLine,
  RiPlayFill,
  RiArrowLeftSLine,
  RiBuildingLine,
  RiCompass3Fill,
  RiFocus2Fill,
  RiGitMergeFill,
  RiGraduationCapFill
} from 'react-icons/ri'

const variants = {
  primary: 'bg-brand-orange text-white hover:brightness-95 shadow-md',
  outline: 'border-2 border-brand-orange text-brand-orange hover:bg-brand-orange/10',
  light: 'bg-white text-brand-navy hover:bg-gray-100 shadow-md',
  navy: 'bg-brand-navy text-white hover:bg-brand-navy/90 shadow-md',
  red: 'bg-brand-red text-white hover:brightness-95 shadow-md',
}

export function Button({ to, variant = 'primary', className = '', children, ...rest }) {
  const cls = `inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 font-semibold transition duration-200 ${variants[variant]} ${className}`
  if (to && to.startsWith('#')) {
    return (
      <a
        href={to}
        onClick={(e) => {
          e.preventDefault()
          const el = document.querySelector(to)
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' })
          }
        }}
        className={cls}
        {...rest}
      >
        {children}
      </a>
    )
  }
  return to
    ? <Link to={to} className={cls} {...rest}>{children}</Link>
    : <button className={cls} {...rest}>{children}</button>
}

export const Badge = ({ children, color = 'bg-brand-mist text-brand-navy', className = '' }) => (
  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${color} ${className}`}>
    {children}
  </span>
)

export const SectionHeader = ({ title, sub, center }) => (
  <div className={`mb-10 max-w-3xl ${center ? 'mx-auto text-center' : ''}`}>
    <span className={`mb-3 block h-1.5 w-20 rounded-full bg-brand-orange ${center ? 'mx-auto' : ''}`} />
    <h2 className="text-3xl font-extrabold tracking-tight text-brand-navy md:text-4xl">{title}</h2>
    {sub && <p className="mt-3 text-lg leading-relaxed text-gray-600">{sub}</p>}
  </div>
)

export const Hero = ({ image, overlay = 'bg-brand-navy/70', className = '', children }) => (
  <section
    className="relative isolate overflow-hidden bg-brand-navy text-white"
    style={image ? { backgroundImage: `url(${image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
  >
    <div className={`absolute inset-0 -z-10 ${overlay}`} />
    <div className={`mx-auto max-w-[1280px] px-5 ${className}`}>{children}</div>
  </section>
)

export function SearchCard({ className = '' }) {
  const [q, setQ] = useState('')
  const [category, setCategory] = useState('')
  const navigate = useNavigate()

  const submit = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (category) params.set('category', category)
    navigate(`/short-courses?${params.toString()}`)
  }

  return (
    <div className={`overflow-hidden rounded-3xl bg-white shadow-2xl ${className}`}>
      <form onSubmit={submit} className="bg-brand-navy p-6 md:p-8">
        <label htmlFor="course-search" className="mb-3 block text-lg font-bold text-white">
          Find Your Ideal Short Course
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex flex-1 items-center rounded-xl bg-white px-3 py-1">
            <RiSearchLine className="text-gray-400" size={22} />
            <input
              id="course-search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by topic, e.g., Python, Marketing, Nursing, AutoCAD..."
              className="min-w-0 flex-1 px-3 py-2 text-gray-800 outline-none placeholder:text-gray-400"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-xl bg-white/10 px-4 py-3 font-medium text-white outline-none border border-white/20 sm:w-56"
          >
            <option value="" className="text-gray-900">All Disciplines</option>
            <option value="Business & Management" className="text-gray-900">Business & Management</option>
            <option value="IT & Computing" className="text-gray-900">IT & Computing</option>
            <option value="Health Sciences" className="text-gray-900">Health Sciences</option>
            <option value="Natural Sciences & Agriculture" className="text-gray-900">Natural Sciences & Agriculture</option>
            <option value="Education & Teaching" className="text-gray-900">Education & Teaching</option>
            <option value="Languages & Communication" className="text-gray-900">Languages & Communication</option>
            <option value="Law & Social Sciences" className="text-gray-900">Law & Social Sciences</option>
          </select>
          <button
            type="submit"
            className="flex items-center justify-center gap-2 rounded-xl bg-brand-orange px-6 py-3.5 font-bold text-white transition hover:brightness-95 shadow-md"
          >
            Search
          </button>
        </div>
      </form>
      <div className="flex flex-wrap items-center justify-between gap-4 bg-brand-mist px-6 py-4 text-sm font-semibold">
        <span className="text-gray-600">Popular Searches: Python, Marketing Analytics, Wound Care, AutoCAD, Revit</span>
        <Link to="/short-courses" className="flex items-center gap-1 text-brand-red hover:underline">
          <RiArrowRightDoubleLine size={20} /> View All 60+ Programmes
        </Link>
      </div>
    </div>
  )
}

export function CourseCard({ course }) {
  const [imgSrc, setImgSrc] = useState(course.image || course.fallbackImage || '/images/hero-home.jpg')

  const modeBadgeColor = {
    'Online': 'bg-emerald-100 text-emerald-800 border-emerald-300',
    'On-site': 'bg-blue-100 text-blue-800 border-blue-300',
    'Blended': 'bg-amber-100 text-amber-800 border-amber-300',
  }[course.mode] || 'bg-gray-100 text-gray-800 border-gray-300'

  return (
    <div className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div>
        <div className="relative aspect-[16/10] overflow-hidden bg-brand-mist">
          <img
            src={imgSrc}
            alt={course.title}
            onError={() => setImgSrc(course.fallbackImage || '/images/hero-home.jpg')}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-brand-navy/90 px-3 py-1 text-xs font-semibold text-white shadow backdrop-blur-sm">
              {course.category}
            </span>
            <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold shadow ${modeBadgeColor}`}>
              {course.mode || 'Blended'}
            </span>
          </div>
        </div>

        <div className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-red">
            {course.intake || course.date || 'Next Intake: 2026'}
          </p>
          <Link to={`/short-courses/${course.slug}`}>
            <h3 className="mt-2 text-lg font-bold leading-snug text-brand-navy group-hover:text-brand-orange transition line-clamp-2">
              {course.title}
            </h3>
          </Link>
          <p className="mt-2 text-xs font-medium text-gray-500 line-clamp-1">
            {course.faculty || 'Open University of Sri Lanka'}
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3 text-xs font-medium text-gray-600">
            <span className="flex items-center gap-1.5">
              <RiTimeLine className="text-brand-orange" size={16} />
              {course.duration || '4 Months'}
            </span>
            <span className="flex items-center gap-1.5 font-bold text-brand-navy text-sm">
              <RiMoneyDollarCircleLine className="text-brand-orange" size={18} />
              {course.fee || 'Rs. 20,000'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 border-t border-gray-100 bg-gray-50/50 p-4">
        <Link
          to={`/short-courses/${course.slug}`}
          className="flex-1 rounded-xl border border-gray-300 bg-white py-2.5 text-center text-sm font-semibold text-brand-navy transition hover:bg-gray-100"
        >
          Details
        </Link>
        <Link
          to={`/apply?course=${encodeURIComponent(course.slug)}`}
          className="flex-1 rounded-xl bg-brand-orange py-2.5 text-center text-sm font-semibold text-white transition hover:brightness-95 shadow-sm"
        >
          Apply Now
        </Link>
      </div>
    </div>
  )
}

export function BannerSlider() {
  const slides = [
    {
      image: '/images/hero-home.jpg',
      badge: 'State University of Sri Lanka • Established 1980',
      title: 'Short Courses. Real Credentials. Flexible Learning.',
      sub: 'Upgrade your career with 60+ industry-recognized short courses and diplomas delivered through open and distance learning across 9 Regional Centres.',
      cta1: { label: 'Explore Short Courses', to: '/short-courses' },
      cta2: { label: 'Apply Online', to: '/apply' },
    },
    {
      image: '/images/news-convocation.jpg',
      badge: 'Recognised University Qualifications',
      title: 'Learn at Your Own Pace, From Anywhere in Sri Lanka',
      sub: 'Weekend day schools, interactive digital LMS (Moodle), and expert academic mentorship designed for ambitious working adults and school leavers.',
      cta1: { label: 'Compare Programmes', to: '/compare' },
      cta2: { label: 'View Faculties', to: '#faculties' },
    },
    {
      image: '/images/faculty-eng.jpg',
      badge: 'BOC Nawala Account No. 7417821',
      title: 'Affordable Education with Flexible Installment Options',
      sub: 'Enrol in top high-demand fields: Python, Marketing Analytics, Wound Care Nursing, Revit Architecture, AI in Education, and Languages.',
      cta1: { label: 'Check 2026 Intakes', to: '/events' },
      cta2: { label: 'Contact Help Desk', to: '/contact' },
    },
  ]

  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [slides.length])

  return (
    <div className="relative min-h-[560px] overflow-hidden bg-brand-navy text-white md:min-h-[620px]">
      {slides.map((s, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-1000 ${idx === current ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
          style={{ backgroundImage: `url(${s.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/95 via-brand-navy/80 to-transparent" />
          <div className="relative mx-auto flex h-full max-w-[1280px] flex-col justify-center px-5 py-20">
            <span className="mb-4 inline-block w-fit rounded-full bg-brand-orange/90 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow">
              {s.badge}
            </span>
            <h1 className="max-w-3xl text-4xl font-extrabold leading-tight tracking-tight md:text-6xl text-white">
              {s.title}
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-gray-200 leading-relaxed">
              {s.sub}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button to={s.cta1.to} variant="primary" className="text-base px-8 py-4">
                {s.cta1.label}
              </Button>
              <Button to={s.cta2.to} variant="outline" className="text-base border-white text-white hover:bg-white/10 px-8 py-4">
                {s.cta2.label}
              </Button>
            </div>
          </div>
        </div>
      ))}

      {/* Controls */}
      <button
        onClick={() => setCurrent((prev) => (prev - 1 + slides.length) % slides.length)}
        aria-label="Previous slide"
        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-3 text-white backdrop-blur-sm transition hover:bg-black/70"
      >
        <RiArrowLeftSLine size={28} />
      </button>
      <button
        onClick={() => setCurrent((prev) => (prev + 1) % slides.length)}
        aria-label="Next slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-3 text-white backdrop-blur-sm transition hover:bg-black/70"
      >
        <RiArrowRightSLine size={28} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-2.5 rounded-full transition-all ${i === current ? 'w-8 bg-brand-orange' : 'w-2.5 bg-white/50'}`}
          />
        ))}
      </div>
    </div>
  )
}

export function VideoPlayer({ videoId = 'XHbtiY7-FXg', title = 'The Open University of Sri Lanka Official Introduction' }) {
  const [playing, setPlaying] = useState(false)

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-3xl bg-black shadow-2xl">
      {playing ? (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full border-0"
        />
      ) : (
        <div
          className="relative h-full w-full cursor-pointer bg-cover bg-center"
          style={{ backgroundImage: 'url(/images/video-banner.jpg)' }}
          onClick={() => setPlaying(true)}
        >
          <div className="absolute inset-0 bg-brand-navy/40 transition group-hover:bg-brand-navy/20" />
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white">
            <button
              aria-label="Play OUSL promotional video"
              className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-orange text-white shadow-2xl transition duration-300 hover:scale-110"
            >
              <RiPlayFill size={40} className="ml-1" />
            </button>
            <h3 className="mt-4 text-2xl font-bold tracking-tight text-white drop-shadow">
              Watch OUSL Campus & Distance Learning Overview
            </h3>
            <p className="mt-2 text-sm text-gray-200 drop-shadow">
              Discover Sri Lanka's Premier Open University • Click to Play Official Video
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export const Breadcrumb = ({ trail = [] }) => (
  <nav aria-label="Breadcrumb" className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-2 px-5 py-5 text-sm font-medium text-brand-navy">
    <Link to="/" aria-label="Home" className="flex items-center gap-1 hover:text-brand-orange">
      <RiHome4Fill size={18} /> Home
    </Link>
    {trail.map((t, idx) => (
      <span key={idx} className="flex items-center gap-2">
        <RiArrowRightSLine size={18} className="text-gray-400" />
        {t.to ? (
          <Link to={t.to} className="hover:text-brand-orange">{t.label}</Link>
        ) : (
          <span className="font-semibold text-brand-red">{t.label || t}</span>
        )}
      </span>
    ))}
  </nav>
)

export const CtaBlock = () => (
  <section className="bg-brand-navy py-16 text-center text-white">
    <div className="mx-auto max-w-[1280px] px-5">
      <span className="rounded-full bg-brand-orange/20 border border-brand-orange/40 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-orange">
        Take The Next Step Today
      </span>
      <h2 className="mt-4 text-3xl font-extrabold md:text-5xl">Ready to Upgrade Your Career?</h2>
      <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-300">
        Choose from over 60 industry-aligned short courses offered by the Open University of Sri Lanka. Enrol online or visit any regional centre.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Button to="/apply" variant="primary" className="text-base px-8 py-4">
          Apply for Intake 2026
        </Button>
        <Button to="/short-courses" variant="outline" className="text-base border-white text-white hover:bg-white/10 px-8 py-4">
          Explore All 60+ Courses
        </Button>
        <Button to="/contact" variant="light" className="text-base px-8 py-4">
          Contact Admission Desk
        </Button>
      </div>
    </div>
  </section>
)
