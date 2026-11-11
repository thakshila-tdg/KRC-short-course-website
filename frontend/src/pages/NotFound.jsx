import { Link } from 'react-router-dom'
import { RiHome4Fill, RiSearchLine, RiArrowRightLine } from 'react-icons/ri'
import { Button } from '../components/ui'

export default function NotFound() {
  return (
    <section className="mx-auto max-w-[1280px] px-5 py-24 text-center">
      <span className="rounded-full bg-brand-red/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-red">
        404 — Page Not Found
      </span>
      <h1 className="mt-4 text-4xl font-extrabold text-brand-navy md:text-6xl">
        Looking for a Short Course?
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-base text-gray-600 leading-relaxed">
        The page you requested could not be located on the OUSL portal. You might have clicked an outdated link or mistyped the URL.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Button to="/" variant="primary">
          Return to Homepage
        </Button>
        <Button to="/short-courses" variant="outline">
          Browse All 60+ Short Courses
        </Button>
        <Button to="/contact" variant="light">
          Contact Admission Desk
        </Button>
      </div>

      <div className="mx-auto mt-12 max-w-md rounded-2xl bg-brand-mist/50 p-6 border border-gray-200 text-xs text-gray-500">
        <p className="font-semibold text-brand-navy">Common Helpful Links:</p>
        <div className="mt-3 flex flex-wrap justify-center gap-4">
          <Link to="/about" className="text-brand-orange hover:underline font-bold">About OUSL</Link>
          <Link to="/courses" className="text-brand-orange hover:underline font-bold">Diplomas</Link>
          <Link to="/events" className="text-brand-orange hover:underline font-bold">Intakes & Events</Link>
          <Link to="/student/portal" className="text-brand-orange hover:underline font-bold">Student Portal</Link>
        </div>
      </div>
    </section>
  )
}

