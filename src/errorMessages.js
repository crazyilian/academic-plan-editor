function lower(s) {
  return s.toLowerCase();
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function enumerate(arr, last = 'и') {
  if (arr.length === 0)
    return "";
  if (arr.length === 1)
    return arr[0];
  return arr.slice(0, -1).join(', ') + ` ${last} ` + arr.slice(-1)[0];
}

function enumerateNum(arr) {
  if (!arr.every((e, i) => arr.indexOf(e) === i) || arr.length === 1)
    return enumerate(arr);
  const min = Math.min(...arr);
  const max = Math.max(...arr);
  if (max - min + 1 !== arr.length)
    return enumerate(arr);
  return `${min}-${max}`;
}

function gradesFormat(grades) {
  const names = grades.map(g => g.name);
  return (grades.length > 1 ? 'Классы' : 'Класс') + (names[0] === undefined ? '' : ' ') + enumerateNum(names);
}

function gradesOfProfile(grades, isprofile = true) {
  if (!isprofile)
    return gradesFormat(grades);
  const profile = grades.slice(-1)[0].profile.filter(s => s).join(': ');
  return gradesFormat(grades) + ` профиля "${profile}"`;
}

function gradesOfProfileNeed(grades, isprofile = true) {
  return gradesOfProfile(grades, isprofile) + (grades.length > 1 ? " должны" : " должен");
}

function gradesOfProfileNeedSubjects(grades, subjects, isprofile = true) {
  const names = subjects.map(s => `"${s.name}"`);
  let res = gradesOfProfileNeed(grades, isprofile)
  res += ' изучать';
  res += names.length > 1 ? " предметы" : " предмет";
  res += ` ${enumerate(names, 'или')}`;
  return res;
}

function ofGradesFormat(grades) {
  const names = grades.map(g => g.name);
  const empty = names.some(n => n === undefined)
  return (grades.length > 1 || empty ? ' у классов' : ' у класса') + (empty ? '' : ` ${enumerateNum(names)}`);
}

function ofGradesOfProfile(grades, isprofile = true) {
  if (!isprofile)
    return ofGradesFormat(grades);
  const profile = grades.slice(-1)[0].profile.filter(s => s).join(': ');
  return ofGradesFormat(grades) + ` профиля "${profile}"`;
}

const errorObligatory = {
  "NO_ZERO_IN_REQUIRED": (grades) => {
    return gradesOfProfileNeed(grades) + ' изучать обязательный предмет';
  },
  "ONE_SUBJ_PER_CATEG": (grades) => {
    return gradesOfProfileNeed(grades) + ' изучать хотя бы 1 предмет из предметной области';
  },
  "RULE_UNIVERSAL": (grades, subjects, keys, min, max, isprofile = true) => {
    const NEED = keys.reduce((o, v) => ({ ...o, [v]: true }), {});
    let res = gradesOfProfileNeedSubjects(grades, subjects, isprofile);
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
  "DIFFERENT_SUBJECTS": (grades, mins, isprofile = true) => {
    const res = gradesOfProfileNeed(grades, isprofile);
    return res + ` изучать разные предметы не менее ${enumerate(mins)} часов в неделю соответственно`;
  }
};


const errorFormative = {};


const errorGeneral = {
  "SUMMARY_TOO_SMALL": (name, grades) => `${capitalize(name)}${ofGradesOfProfile(grades)} меньше, чем разрешено`,
  "SUMMARY_TOO_BIG": (name, grades) => `${capitalize(name)}${ofGradesOfProfile(grades)} больше, чем разрешено`,
  "SUMMARY_NULL": (name, grades) => `Не указано ${lower(name)}${ofGradesOfProfile(grades)}`,
};


const errorMessages = { ...errorObligatory, ...errorFormative, ...errorGeneral };


export {
  errorObligatory,
  errorFormative,
  errorGeneral,
  errorMessages
}
