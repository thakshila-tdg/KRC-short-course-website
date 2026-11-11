import { Link } from 'react-router-dom'
import {
  RiBankFill,
  RiGroupFill,
  RiMapPinFill,
  RiGraduationCapFill,
  RiCompass3Fill,
  RiGitMergeFill,
  RiFocus2Fill,
  RiTimeLine,
  RiAwardFill,
  RiCalendarEventFill,
  RiArrowRightLine,
  RiBookOpenFill,
  RiCommunityFill,
  RiCheckDoubleFill
} from 'react-icons/ri'
import {
  BannerSlider,
  SearchCard,
  SectionHeader,
  CourseCard,
  VideoPlayer,
  CtaBlock,
  Button,
  Badge
} from '../components/ui'
import {
  categories,
  faculties,
  newsArticles,
  upcomingEvents,
  regionalCentres,
  leadership
} from '../data/site'
import { allShortCourses } from '../data/coursesData'

const stats = [
  { icon: RiBankFill, value: 'State University', label: 'Chartered under Act No. 16 of 1978' },
  { icon: RiGroupFill, value: '40,000+ Students', label: 'Active learners island-wide' },
  { icon: RiMapPinFill, value: '9 Regional Centres', label: '& 19 Study Centres across 9 provinces' },
  { icon: RiGraduationCapFill, value: '60+ Short Courses', label: 'Industry & career focused certificates' },
]

const steps = [
  {
    icon: RiCompass3Fill,
    step: '01',
    title: 'Explore & Choose',
    text: 'Browse through 60+ short courses across 6 faculties. Filter by delivery mode, duration, and fee structure.',
  },
  {
    icon: RiGitMergeFill,
    step: '02',
    title: 'Apply Online',
    text: 'Submit your personal details and pay course fees securely via Bank of Ceylon (BOC) voucher or online card.',
  },
  {
    icon: RiFocus2Fill,
    step: '03',
    title: 'Learn Flexibly',
    text: 'Access digital course materials on OUSL Moodle LMS and attend weekend interactive day schools at your nearest centre.',
  },
  {
    icon: RiAwardFill,
    step: '04',
    title: 'Earn Credentials',
    text: 'Complete continuous assessments and receive an official, recognized certificate issued by The Open University of Sri Lanka.',
  },
]

export default function Home() {
  // Top 6 featured courses
  const featuredCourses = allShortCourses.filter((c) => c.featured).slice(0, 6)

  return (
    <>
      {/* 1. Hero Banner Slider with real OUSL imagery */}
      <BannerSlider />

      {/* 2. Search & Discovery Card */}
      <section className="relative z-10 -mt-14 mx-auto max-w-[1240px] px-5">
        <SearchCard />
      </section>

      {/* 3. University Credibility Stats Bar */}
      <section className="border-b border-gray-200 bg-white py-12">
        <div className="mx-auto grid max-w-[1280px] grid-cols-2 gap-8 px-5 lg:grid-cols-4">
          {stats.map(({ icon: Icon, value, label }) => (
            <div key={value} className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-mist text-brand-navy shadow-sm">
                <Icon size={32} />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-brand-navy">{value}</h3>
                <p className="text-xs text-gray-500 font-medium">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. About OUSL with Embedded Video */}
      <section className="mx-auto max-w-[1280px] px-5 py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="rounded-full bg-brand-red/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-brand-red">
              About The Open University of Sri Lanka
            </span>
            <h2 className="mt-4 text-3xl font-extrabold text-brand-navy md:text-4xl leading-tight">
              Pioneering Lifelong Distance Education for Over Four Decades
            </h2>
            <p className="mt-4 text-base leading-relaxed text-gray-600">
              Established in 1980 under the Universities Act No. 16 of 1978, The Open University of Sri Lanka (OUSL) is the country&rsquo;s premier and only national state university dedicated to Open and Distance Learning (ODL). OUSL enjoys the same legal status and academic recognition as all other conventional state universities under the University Grants Commission (UGC).
            </p>
            <p className="mt-3 text-base leading-relaxed text-gray-600">
              Our short courses are carefully developed by academic faculties to provide practical, immediate, career-enhancing skills to working adults, school leavers, and professionals without requiring them to leave their jobs or hometowns.
            </p>

            <div className="mt-6 border-l-4 border-brand-orange bg-brand-mist p-4 rounded-r-xl">
              <p className="italic text-sm text-brand-navy font-medium">
                &ldquo;{leadership.viceChancellor.quote}&rdquo;
              </p>
              <p className="mt-2 text-xs font-bold text-brand-red">
                — {leadership.viceChancellor.name}, {leadership.viceChancellor.title}
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <Button to="/about" variant="navy">
                Learn More About OUSL
              </Button>
              <Button to="/short-courses" variant="outline">
                Browse All Short Courses
              </Button>
            </div>
          </div>

          <div>
            <VideoPlayer videoId="XHbtiY7-FXg" title="The Open University of Sri Lanka Video Introduction" />
            <p className="mt-3 text-center text-xs text-gray-500 font-medium">
              Official OUSL Campus & Distance Learning Overview • Video Courtesy of OUSL Educational Technology
            </p>
          </div>
        </div>
      </section>

      {/* 5. Featured Short Courses Grid */}
      <section className="bg-brand-mist/50 py-20 border-y border-gray-200">
        <div className="mx-auto max-w-[1280px] px-5">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <SectionHeader
              title="Featured Short Courses for 2026"
              sub="Explore our most popular career-advancing short programmes. Verified university certificates with flexible weekend schedules and online learning."
            />
            <Link
              to="/short-courses"
              className="flex items-center gap-1.5 font-bold text-brand-red hover:text-brand-navy transition mb-10 shrink-0"
            >
              View all 60+ courses <RiArrowRightLine size={18} />
            </Link>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {featuredCourses.map((c) => (
              <CourseCard key={c.slug} course={c} />
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button to="/short-courses" variant="primary" className="text-base px-10 py-4">
              Explore All 60+ Short Courses
            </Button>
          </div>
        </div>
      </section>

      {/* 6. How Open & Distance Learning Works */}
      <section className="mx-auto max-w-[1280px] px-5 py-20">
        <SectionHeader
          title="How It Works: Your Journey to Certification"
          sub="Our streamlined 4-step process ensures a seamless learning journey from admission to graduation."
          center
        />

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ icon: Icon, step, title, text }) => (
            <div
              key={step}
              className="relative flex flex-col items-center rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm transition hover:shadow-lg"
            >
              <span className="absolute -top-4 rounded-full bg-brand-orange px-3.5 py-1 text-xs font-extrabold text-white shadow">
                STEP {step}
              </span>
              <div className="mt-4 flex h-20 w-20 items-center justify-center rounded-full bg-brand-mist text-brand-red">
                <Icon size={40} />
              </div>
              <h3 className="mt-6 text-xl font-bold text-brand-navy">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Academic Faculties Showcase */}
      <section id="faculties" className="bg-white py-20 border-t border-gray-200 scroll-mt-20">
        <div className="mx-auto max-w-[1280px] px-5">
          <SectionHeader
            title="Faculties of Study"
            sub="Short courses at OUSL are designed and accredited by the academic boards of our six prominent faculties."
          />

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {faculties.map((f) => (
              <div
                key={f.id}
                className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-300 hover:shadow-xl"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
                  <img
                    src={f.image}
                    alt={f.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/90 via-brand-navy/30 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4">
                    <span className="text-xs font-bold text-brand-orange uppercase tracking-wider">
                      {f.coursesCount} Courses Available
                    </span>
                    <h3 className="text-lg font-bold text-white drop-shadow">{f.name}</h3>
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-xs font-semibold text-gray-500">Dean: {f.dean}</p>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600 line-clamp-3">
                    {f.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {f.departments.slice(0, 2).map((d) => (
                      <span key={d} className="rounded bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600 font-medium">
                        {d}
                      </span>
                    ))}
                  </div>
                  <Link
                    to={`/short-courses?category=${encodeURIComponent(f.name.replace('Faculty of ', ''))}`}
                    className="mt-5 flex items-center gap-1.5 text-sm font-bold text-brand-red hover:text-brand-navy transition"
                  >
                    Explore Faculty Courses <RiArrowRightLine size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Browse by Discipline Categories */}
      <section className="bg-brand-mist/50 py-20 border-y border-gray-200">
        <div className="mx-auto max-w-[1280px] px-5">
          <SectionHeader
            title="Discover Courses by Discipline"
            sub="Find programs aligned with your professional aspirations and industry background."
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((c) => (
              <Link
                key={c}
                to={`/short-courses?category=${encodeURIComponent(c)}`}
                className="group flex items-center justify-between rounded-2xl bg-white p-6 shadow-sm border border-gray-200 transition duration-200 hover:-translate-y-1 hover:border-brand-orange hover:shadow-md"
              >
                <div>
                  <h4 className="text-base font-bold text-brand-navy group-hover:text-brand-orange transition">
                    {c}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">Accredited short courses</p>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-mist text-brand-navy group-hover:bg-brand-orange group-hover:text-white transition">
                  <RiArrowRightLine size={18} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 9. News & Announcements and Upcoming Events */}
      <section className="mx-auto max-w-[1280px] px-5 py-20">
        <div className="grid gap-16 lg:grid-cols-2">
          {/* News column */}
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="block h-1.5 w-16 rounded-full bg-brand-orange mb-2" />
                <h3 className="text-2xl font-extrabold text-brand-navy">Latest News & Updates</h3>
              </div>
              <Link to="/news" className="text-xs font-bold text-brand-red hover:underline flex items-center gap-1">
                All News <RiArrowRightLine size={14} />
              </Link>
            </div>

            <div className="space-y-6">
              {newsArticles.slice(0, 3).map((item) => (
                <div key={item.slug} className="flex gap-4 items-start border-b border-gray-100 pb-5">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-24 w-28 shrink-0 rounded-xl object-cover bg-gray-100"
                  />
                  <div>
                    <div className="flex items-center gap-2 text-xs text-brand-red font-semibold">
                      <span>{item.date}</span>
                      <span>•</span>
                      <span className="text-gray-500">{item.category}</span>
                    </div>
                    <Link to={`/news/${item.slug}`}>
                      <h4 className="mt-1 text-base font-bold text-brand-navy hover:text-brand-orange transition line-clamp-2">
                        {item.title}
                      </h4>
                    </Link>
                    <p className="mt-1 text-xs text-gray-600 line-clamp-2">{item.summary}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Events column */}
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="block h-1.5 w-16 rounded-full bg-brand-orange mb-2" />
                <h3 className="text-2xl font-extrabold text-brand-navy">Upcoming Events & Intakes</h3>
              </div>
              <Link to="/events" className="text-xs font-bold text-brand-red hover:underline flex items-center gap-1">
                Full Calendar <RiArrowRightLine size={14} />
              </Link>
            </div>

            <div className="space-y-4">
              {upcomingEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-brand-navy"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-brand-red">
                    <span className="rounded bg-brand-red/10 px-2.5 py-0.5">{evt.category}</span>
                    <span className="flex items-center gap-1 text-gray-500">
                      <RiCalendarEventFill size={14} /> {evt.date}
                    </span>
                  </div>
                  <h4 className="mt-2 text-base font-bold text-brand-navy">{evt.title}</h4>
                  <p className="mt-1 text-xs text-gray-600">{evt.description}</p>
                  <p className="mt-2 text-[11px] font-semibold text-gray-500">
                    📍 {evt.location} • ⏰ {evt.time}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 10. Regional Centres Island-Wide Presence */}
      <section className="bg-brand-navy text-white py-16">
        <div className="mx-auto max-w-[1280px] px-5">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-brand-orange">
              Island-Wide Network
            </span>
            <h2 className="mt-3 text-3xl font-extrabold md:text-4xl text-white">
              Study Near You: 9 Regional Centres Across Sri Lanka
            </h2>
            <p className="mt-3 text-sm text-gray-300">
              You never have to travel far. Attend day schools, sit for examinations, and access computer labs at our regional hubs.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {regionalCentres.map((r) => (
              <div
                key={r.id}
                className="rounded-2xl bg-white/5 border border-white/10 p-5 transition hover:bg-white/10"
              >
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-base text-white">{r.name}</h4>
                  <span className="text-[11px] font-bold text-brand-orange bg-brand-orange/20 px-2 py-0.5 rounded">
                    {r.province}
                  </span>
                </div>
                <p className="mt-2 text-xs text-gray-300">{r.address}</p>
                <p className="mt-2 text-xs font-mono text-gray-200">📞 {r.phone}</p>
                <p className="mt-1 text-xs text-gray-400">✉️ {r.email}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/regional-centres"
              className="inline-flex items-center gap-2 text-sm font-bold text-brand-orange hover:underline"
            >
              View All 19 Study Centres & Directions <RiArrowRightLine size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* 11. Final Call To Action */}
      <CtaBlock />
    </>
  )
}
