function isEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function unique(array, propertyName) {
  return array.filter((e, i) => array.findIndex(a => isEqual(a[propertyName], e[propertyName])) === i);
}

function allNumbers(grades) {
  const all_numbers = unique(grades, 'name').map(g => g.name);
  all_numbers.sort((a, b) => a - b);
  return all_numbers;
}


function getDefaultGroup(grades) {
  const all_numbers = allNumbers(grades);
  const group = all_numbers.map(name => grades.find(el => el.name === name));
  return group;
}

function getProfileGroup(grades, profile) {
  const default_group = getDefaultGroup(grades);
  const prof_grades = [...grades.filter(g => isEqual(g.profile, profile)), ...default_group];
  const group = default_group.map(grade => prof_grades.filter(g => g.name === grade.name)[0])
  return group;
}


function getProfileAreas(grades) {
  let profiles = unique(grades, 'profile').map(g => g.profile);

  const areas = [{ [profiles[0][0]]: profiles[0] }];
  profiles = profiles.slice(1);

  const usual_profiles = profiles.filter(p => p.length === 1).reduce((o, p) => ({ ...o, [p[0]]: p }), {});
  if (Object.keys(usual_profiles).length > 0) areas.push(usual_profiles);
  profiles = profiles.filter(p => p.length !== 1);

  const project_profiles_list = profiles.filter(p => p.length === 2);
  const project_profiles = unique(project_profiles_list, 0).map(p => p[0]).map(x => {
    const second = project_profiles_list.filter(p => p[0] === x).map(p => p[1]);
    if (isEqual(second, [""])) return { [x]: [x, ""] }
    return { [x]: second.reduce((o, y) => ({ ...o, [y]: [x, y] }), {}) };
  }).reduce((o, a) => ({ ...o, ...a }), {});
  if (Object.keys(project_profiles).length > 0) areas.push(project_profiles);
  profiles = profiles.filter(p => p.length !== 2);

  return areas;
}

function addGroupToPlan(plan, ...groups) {
  return groups.reduce((p, group) => p.map(c => c.map(s => [...s, group.map(() => ({
    'value': 0,
    'advanced': false
  }))])), plan);
}


// const fs = require('fs-extra');
// const template = fs.readJsonSync('../kek2.json');
//
// const res = getProfileAreas(template.grades);
// console.log(res)

export {
  allNumbers,
  getDefaultGroup,
  getProfileGroup,
  getProfileAreas,
  addGroupToPlan
}
