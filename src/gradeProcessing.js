let gradeId = 0;

function isEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function unique(el, i, self) {
  return self.findIndex(a => isEqual(a, el)) === i;
}

function allNumbers(grades) {
  const all_numbers = grades.map(g => g.name).filter(unique);
  all_numbers.sort((a, b) => a - b);
  return all_numbers;
}


function getDefaultGroup(grades) {
  const all_numbers = allNumbers(grades);
  const group = all_numbers.map(name => grades.find(el => el.name === name))
      .map(grade => ({ ...grade, id: gradeId += 1 }));
  return group;
}

function getProfileGroup(grades, profile) {
  const default_group = getDefaultGroup(grades);
  const prof_grades = [...grades.filter(g => isEqual(g.profile, profile)), ...default_group];
  const group = default_group.map(grade => prof_grades.filter(g => g.name === grade.name)[0])
  return structuredClone(group).map(grade => ({ ...grade, highlight: false, weeknum: null, id: gradeId += 1 }));
}


function getProfileMenu(grades) {
  let profiles = grades.map(g => g.profile).filter(unique);
  const menu = [{
    type: 'value',
    name: profiles[0][0],
    data: profiles[0],
  }];
  profiles = profiles.slice(1);

  const usual_profiles = profiles.filter(p => p.length === 1).map((p) => ({
    type: 'value',
    name: p[0],
    data: p,
  }));
  if (Object.keys(usual_profiles).length > 0) {
    menu.push({ type: 'divider' }, ...usual_profiles)
  }
  profiles = profiles.filter(p => p.length !== 1);

  const project_profiles_list = profiles.filter(p => p.length === 2);
  const project_profiles = project_profiles_list.map((p) => p[0]).filter(unique).map(p0 => {
    const second = project_profiles_list.filter(p => p[0] === p0).map(p => p[1]);
    if (isEqual(second, [""])) {
      return {
        type: 'value',
        name: p0,
        data: [p0, ""]
      }
    }
    return {
      type: 'menu',
      name: p0,
      data: second.map(p1 => ({
        type: 'value',
        name: p1,
        data: [p0, p1],
      }))
    };
  });
  if (Object.keys(project_profiles).length > 0) {
    menu.push({ type: 'divider' }, {
      type: 'menu',
      name: 'Класс проекта',
      data: project_profiles,
    });
  }
  profiles = profiles.filter(p => p.length !== 2);

  return menu;
}

function addGroupToPlan(plan, ...groups) {
  return groups.reduce((p, group) => p.map(c => c.map(s => [...s, group.map(() => ({
    'value': 0,
    'advanced': false
  }))])), plan);
}

function fillShape2(gradeGroups, mp) {
  return gradeGroups.map((group, i) => group.map((grade, j) => mp(i, j, group, grade)));
}

function isEqualGrade(g1, g2) {
  return g1.name === g2.name && isEqual(g1.profile, g2.profile);
}

function setGlobalGradeId(val) {
  gradeId = val;
}

function getGlobalGradeId() {
  return gradeId;
}

export {
  allNumbers,
  getDefaultGroup,
  getProfileGroup,
  getProfileMenu,
  addGroupToPlan,
  fillShape2,
  isEqualGrade,
  unique,
  isEqual,
  setGlobalGradeId,
  getGlobalGradeId
}
