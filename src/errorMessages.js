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

function enumerate(arr, last = 'и') {
  if (arr.length === 0)
    return "";
  if (arr.length === 1)
    return arr[0];
  return arr.slice(0, -1).join(', ') + ` ${last} ` + arr.slice(-1)[0];
}

function enumerateNum(arr) {
  if (!arr.every((e, i) => arr.indexOf(e) === i))
    return enumerate(arr);
  const min = Math.min(...arr);
  const max = Math.max(...arr);
  if (max - min + 1 !== arr.length)
    return enumerate(arr);
  return `${min}-${max}`;
}

function gradesFormat(grades) {
  return grades.length > 1 ? `Классы ${enumerateNum(grades.map(g => g.name))}` : `Класс ${grades[0].name}`;
}

function gradesOfProfile(grades) {
  const profile = grades.slice(-1)[0].profile.filter(s => s).join(': ');
  return gradesFormat(grades) + ` профиля "${profile}"`;
}

function gradesOfProfileNeed(grades) {
  return gradesOfProfile(grades) + (grades.length > 1 ? " должны" : " должен");
}

function gradesOfProfileNeedSubjects(grades, subjects) {
  const names = subjects.map(s => `"${s.name}"`);
  let res = gradesOfProfileNeed(grades)
  res += ' изучать';
  res += names.length > 1 ? " предметы" : " предмет";
  res += ` ${enumerate(names, 'или')}`;
  return res;
}

export default {
  "NO_ZERO_IN_REQUIRED": (grades) => {
    let res = gradesOfProfileNeed(grades);
    res += ` изучать обязательный предмет`;
    return res;
  },
  "ONE_SUBJ_PER_CATEG": (grades) => {
    let res = gradesOfProfileNeed(grades);
    res += ` изучать хотя бы 1 предмет из предметной области`;
    return res;
  },
  "SUMMARY_TOO_SMALL": (name, grade) => `${capitalize(name)}${profile(grade)} меньше, чем разрешено`,
  "SUMMARY_TOO_BIG": (name, grade) => `${capitalize(name)}${profile(grade)} больше, чем разрешено`,
  "SUMMARY_NULL": (name, grade) => `Не указано ${lower(name)}${profile(grade)}`,
  "RULE_OBLIGATORY_UNIVERSAL": (grades, subjects, keys, min, max) => {
    const NEED = keys.reduce((o, v) => ({ ...o, [v]: true }), {});
    let res = gradesOfProfileNeedSubjects(grades, subjects);
    const msgs = [];
    if (NEED.ADVANCED) {
      msgs.push('углублённо');
    }
    const hoursMin = `${min % 10 === 1 && min % 100 !== 11 ? 'часа' : 'часов'} в неделю`
    const hoursMax = `${max % 10 === 1 && max % 100 !== 11 ? 'часа' : 'часов'} в неделю`
    if (NEED.MIN) {
      msgs.push(`не менее ${min} ${hoursMin}`)
    } else if (NEED.MAX) {
      msgs.push(`не более ${max} ${hoursMax}`)
    }
    res += ` ${enumerate(msgs)}`;
    return res;
  },

  "DIFFERENT_SUBJECTS": (grades, mins) => {
    let res = gradesOfProfileNeed(grades);
    res += ` изучать разные предметы не менее ${enumerate(mins)} часов в неделю соответственно`;
    return res;
  }
}
