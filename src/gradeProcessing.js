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
      .map(grade => ({ ...grade, id: useGlobalGradeId() }));
  return group;
}

function getProfileGroup(grades, profile, update = false) {
  const default_group = getDefaultGroup(grades);
  const prof_grades = [...grades.filter(g => isEqualProfile(g.profile, profile)), ...default_group];
  const group = default_group.map(grade => prof_grades.filter(g => g.name === grade.name)[0])
  const res = structuredClone(group).map(grade => ({ ...grade, weeknum: null, id: useGlobalGradeId() }));
  if (update)
    return res.map(grade => ({...grade, profile: profile }));
  return res;
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

  menu.push({ type: 'divider' }, {
    type: 'value',
    name: 'Свой профиль...',
    data: [grades[0].profile[0], null, 'Название профиля']
  })

  return menu;
}

function fillShape2(gradeGroups, mp) {
  return gradeGroups.map((group, i) => group.map((grade, j) => mp(i, j, group, grade)));
}

function setGlobalGradeId(val) {
  gradeId = val;
}

function getGlobalGradeId() {
  return gradeId;
}

function useGlobalGradeId() {
  return gradeId += 1;
}

function getProfileFormativeCategory(rules_, group, gradeGroups) {
  const profile = group.slice(-1)[0].profile;
  const rules = rules_.filter(rule => group.some(grade => rule.grades.includes(grade.index)));
  const subjects = rules.reduce((s, r) => [...s, ...r.subjects], []).filter(unique);
  if (subjects.length === 0) {
    return undefined;
  }
  const category = {
    name: `Особенности профиля "${profile.filter(s => s).join(': ')}"`,
    profile: structuredClone(profile),
    subjects: subjects.map(s => ({
      name: s,
      newName: s,
      plan: fillShape2(gradeGroups, () => 0)
    }))
  };
  return category;
}

function getFormativeSubjectName(subject) {
  const name = subject.name === subject.newName ? subject.name : `${subject.newName} (${subject.name})`;
  return { name: name };
}

function planType(grade) {
  if (grade.name <= 4)
    return '1-4';
  if (grade.name <= 9)
    return '5-9';
  return '10-11';
}

function getGroupProfile(group) {
  return group.slice(-1)[0].profile;
}

function parseProfile(profile) {
  if (profile.length === 3) {  // custom profile
    return {
      first: profile[2],
      last: profile[2],
      pretty: profile[2]
    };
  }
  return {
    first: profile[0],
    last: profile.filter(s => s).slice(-1)[0],
    pretty: profile.filter(s => s).join(': ')
  }
}

function isEqualProfile(p1_, p2_) {
  const p1 = p1_.length === 3 ? [p1_[0]] : p1_;
  const p2 = p2_.length === 3 ? [p2_[0]] : p2_;
  return isEqual(p1, p2);
}

export {
  allNumbers,
  getDefaultGroup,
  getProfileGroup,
  getProfileMenu,
  fillShape2,
  unique,
  isEqual,
  setGlobalGradeId,
  getGlobalGradeId,
  useGlobalGradeId,
  getProfileFormativeCategory,
  getFormativeSubjectName,
  planType,
  getGroupProfile,
  parseProfile,
  isEqualProfile
}
