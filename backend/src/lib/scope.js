import Course from '../models/Course.js'

// Instructors only work with the courses assigned to them.
// Admins and super admins are not restricted.

export async function getScope(user) {
  if (user.role !== 'instructor') return { restricted: false }
  const courses = await Course.find({ instructors: user.id }).sort({ order: 1 }).lean()
  const slugs = courses.map((c) => c.slug)
  const titles = courses.map((c) => c.title)
  return { restricted: true, courses, slugs, titles, names: [...titles, ...slugs] }
}

// Mongo filter selecting the enrollments that belong to the scope's courses
export function enrollmentFilterFor(scope) {
  if (!scope.restricted) return {}
  return {
    $or: [
      { course_slug: { $in: scope.slugs } },
      { title: { $in: scope.titles } },
      { course_code: { $in: scope.slugs } }
    ]
  }
}

export const ownsCourse = (scope, course) => !scope.restricted || scope.slugs.includes(course.slug)
export const nameInScope = (scope, name) => !scope.restricted || scope.names.includes(name)
