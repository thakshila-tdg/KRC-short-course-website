// Converts MongoDB documents into the JSON shape the React frontend expects:
// an "id" field (string) instead of "_id", no "__v", snake_case field names.

export function serialize(doc) {
  if (!doc) return doc
  const obj = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc }
  if (obj._id !== undefined) {
    obj.id = String(obj._id)
    delete obj._id
  }
  delete obj.__v
  return obj
}

export const serializeMany = (docs) => docs.map(serialize)

// Courses are returned with both snake_case and camelCase names,
// because different frontend pages use different styles.
export function serializeCourse(doc) {
  const c = serialize(doc)
  return {
    ...c,
    feeNum: c.fee_num,
    shortDescription: c.short_description,
    fallbackImage: c.fallback_image,
    careerPaths: c.career_paths,
    paymentAccount: c.payment_account,
    sourceUrl: c.source_url
  }
}
