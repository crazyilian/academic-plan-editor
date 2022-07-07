function lower(s) {
  return s.toLowerCase();
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function profile(s) {
  if (s === undefined) {
    return "";
  } else {
    return ` у профиля "${s}"`
  }
}

export default {
  "NO_ZERO_HOURS": "По включённому в план предмету должно быть выбрано ненулевое количество учебных часов",
  "ONE_SUBJ_PER_CATEG": "Должен быть выбран хотя бы один учебный предмет из предметной области",
  "SUMMARY_TOO_SMALL": (name, grade) => `${capitalize(name)}${profile(grade)} меньше, чем разрешено`,
  "SUMMARY_TOO_BIG": (name, grade) => `${capitalize(name)}${profile(grade)} больше, чем разрешено`,
  "SUMMARY_NULL": (name, grade) => `Не указано ${lower(name)}${profile(grade)}`,
}
