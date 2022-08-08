const excel = require('excel4node');
const fs = require('fs');

/* 0 -> A, 25 -> Z, 26 -> AA ... */
function num2col(n) {
  let ans = '';
  for (n++; n-- > 0; n = (n - (n % 26)) / 26) {
    ans = String.fromCharCode((n % 26) + 65) + ans;
  }
  return ans;
}

function cell(x, y) {
  return `${num2col(y - 1)}${x}`
}

function range(x1, y1, x2, y2) {
  return `${cell(x1, y1)}:${cell(x2, y2)}`
}

function formulaLine(ws, gn, cl, label, f, labelCallback = () => {}) {
  for (let i = 0; i < gn; ++i) {
    f(ws.cell(cl, 3 + i), i);
  }
  labelCallback(ws.cell(cl, 1, cl, 2, true).string(label));
  return cl + 1;
}

function flatten2(arr) {
  return arr.reduce((r, el) => [...r, ...el], []);
}

function create_xlsx(alldata, callback) {
  const wb = new excel.Workbook({
    defaultFont: {
      size: 9,
      name: 'Calibri',
      color: '#000000',
    },
  });
  const style = wb.createStyle({
    alignment: {
      vertical: 'center',
      wrapText: true
    },
    border: {
      left: { style: 'thin', color: '#000000' },
      right: { style: 'thin', color: '#000000' },
      top: { style: 'thin', color: '#000000' },
      bottom: { style: 'thin', color: '#000000' }
    },
    font: {
      size: 'none'
    }
  })
  const scenter = wb.createStyle({ alignment: { horizontal: 'center' } });
  const sbold = wb.createStyle({ font: { bold: true } });
  const srot90 = wb.createStyle({ alignment: { textRotation: 90 } })
  const sgray = wb.createStyle({
    fill: {
      fgColor: "#CCCCCC",
      type: 'pattern',
      patternType: 'solid'
    }
  });
  const srequired = wb.createStyle({
    fill: {
      fgColor: "#c6e0b4",
      type: 'pattern',
      patternType: 'solid'
    }
  });
  const sadvanced = wb.createStyle({
    fill: {
      fgColor: "#79dcff",
      type: 'pattern',
      patternType: 'solid'
    }
  });
  if (alldata.length === 0) {
    wb.addWorksheet();
  }
  for (const data of alldata) {
    const ws = wb.addWorksheet(data.template.config.name);

    data.gradeGroups.reverse();
    data.obligatoryPlan.forEach((category) => category.forEach((subject) => subject.reverse()));
    data.formativePlan.hours.reverse();
    data.formativePlan.categories.forEach((category) => category.subjects.forEach((subject) => subject.plan.reverse()));

    const gradeGroups = flatten2(data.gradeGroups);
    const gn = gradeGroups.length;
    ws.column(1).setWidth(28);
    ws.column(2).setWidth(56);
    ws.column(3 + gn).setWidth(16);
    ws.row(2).setHeight(34);
    ws.row(3).setHeight(80);
    ws.row(4).setHeight(75);
    ws.cell(1, 1, 1, 3 + gn, true).string(data.template.config.title).style(scenter);
    ws.cell(2, 1, 5, 1, true).string('Предметные области').style(scenter);
    ws.cell(2, 2, 5, 2, true).string('Учебные предметы, курсы').style(scenter);
    if (gn > 0)
      ws.cell(2, 3, 2, 2 + gn, true).string('Количество часов в неделю').style(scenter);
    ws.cell(2, 3 + gn, 5, 3 + gn, true).string('Формы промежуточной аттестации').style(scenter);
    for (const [i, grade] of gradeGroups.entries()) {
      ws.column(3 + i).setWidth(6);
      ws.cell(5, 3 + i).number(grade.name).style(scenter);
      const profiles = grade.profile.length === 3 ? [grade.profile[2]] : grade.profile.filter(x => x);
      if (profiles.length === 1) {
        ws.cell(3, 3 + i, 4, 3 + i, true).string(profiles[0]).style(srot90).style(scenter);
      } else {
        ws.cell(4, 3 + i).string(profiles[0]).style(srot90).style(scenter);
        ws.cell(3, 3 + i).string(profiles[1]).style(srot90).style(scenter);
      }
    }
    ws.cell(6, 1, 6, 2 + gn, true).string('Обязательная часть').style(sgray).style(sbold);
    let cl = 7;
    for (const category of data.template.categories) {
      const n = category.subjects.length;
      // const flag = n === 1 && category.subjects[0].name === category.name;
      const flag = false;
      ws.cell(cl, 1, cl + n - 1, 1 + flag, true).string(category.name);
      for (const [i, subject] of category.subjects.entries()) {
        ws.cell(cl + i, 2).string(subject.name).style(subject.required ? srequired : {});
      }
      cl += n;
    }
    cl = 7;
    let sub = 0;
    for (const [i, category] of data.obligatoryPlan.entries()) {
      let not_module = cl;
      for (let j = 1; j <= category.length; ++j) {
        if (j === category.length || !data.template.categories[i].subjects[j].is_module) {
          for (let gi = 0; gi < gn; ++gi) {
            ws.cell(not_module, 3 + gi, cl + j - 1, 3 + gi, true);
          }
          not_module = cl + j;
        }
      }

      for (const [j, subject] of category.entries()) {
        if (!data.template.categories[i].subjects[j].is_module) {
          for (const [gi, val] of flatten2(subject).entries()) {
            if (val.value !== 0) {
              ws.cell(cl, 3 + gi).number(val.value).style(scenter);
            }
            if (val.advanced) {
              ws.cell(cl, 3 + gi).style(sadvanced);
            }
          }
        }
        cl += 1;
        sub += 1;
      }
    }
    cl = formulaLine(ws, gn, cl, "Итого (количество часов обязательной части)", (c, i) => {
      c.formula(`SUM(${range(cl - sub, i + 3, cl - 1, i + 3)})`).style(scenter).style(sbold);
    }, (c) => c.style(sbold))

    ws.cell(cl, 1, cl, 2 + gn, true).string("Часть, формируемая участниками образовательных отношений").style(sgray).style(sbold);
    cl += 1;
    const formativeStart = cl;

    const formativeSubjects = {};
    for (const category of data.formativePlan.categories.values()) {
      for (const subject of category.subjects.values()) {
        const plan = flatten2(subject.plan);
        if (subject.newName in formativeSubjects)
          formativeSubjects[subject.newName].forEach((_, i, self) => self[i] += plan[i]);
        else {
          formativeSubjects[subject.newName] = plan.slice();
        }
      }
    }
    for (const [subject, values] of Object.entries(formativeSubjects)) {
      ws.cell(cl, 1, cl, 2, true).string(subject);
      for (const [i, val] of values.entries()) {
        if (val !== 0) {
          ws.cell(cl, 3 + i).number(val).style(scenter);
        }
      }
      cl += 1;
    }

    if (data.formativePlan.subjects.length > 0) {
      const start = cl;
      for (const subject of data.formativePlan.subjects) {
        ws.cell(cl, 1, cl, 2, true).string(subject);
        cl += 1;
      }
      for (const [i, val] of flatten2(data.formativePlan.hours).entries()) {
        const c = ws.cell(start, 3 + i, cl - 1, 3 + i, true);
        if (val !== 0) {
          c.number(val).style(scenter);
        }
      }
    }
    if (formativeStart !== cl) {
      cl = formulaLine(ws, gn, cl, "Итого (количество часов формируемой части)", (c, i) => {
        c.formula(`SUM(${range(formativeStart, i + 3, cl - 1, i + 3)})`).style(scenter).style(sbold);
      }, (c) => c.style(sbold))
    } else {
      cl = formulaLine(ws, gn, cl, "Итого (количество часов формируемой части)", (c) => {
        c.number(0).style(scenter).style(sbold);
      }, (c) => c.style(sbold))
    }

    ws.cell(cl, 1, cl, 2 + gn, true).string("Сводка").style(sgray).style(sbold);
    cl += 1;
    cl = formulaLine(ws, gn, cl, "Итого недельная нагрузка", (c, i) => {
      c.formula(`${cell(formativeStart - 2, i + 3)} + ${cell(cl - 2, i + 3)}`).style(scenter);
    })
    cl = formulaLine(ws, gn, cl, "Максимальная учебная недельная нагрузка", (c, i) => {
      c.number(gradeGroups[i].max_hours_per_week).style(scenter);
    })
    cl = formulaLine(ws, gn, cl, "Количество учебных недель", (c, i) => {
      if (gradeGroups[i].weeknum !== null) {
        c.number(gradeGroups[i].weeknum).style(scenter);
      } else {
        c.style(scenter);
      }
    })
    cl = formulaLine(ws, gn, cl, "Количество часов за год по учебному плану", (c, i) => {
      c.formula(`${cell(cl - 3, i + 3)} * ${cell(cl - 1, i + 3)}`).style(scenter);
    })
    ws.cell(cl, 1, cl, 2, true).string("Итого на уровень образования");
    if (gn > 0)
      ws.cell(cl, 3, cl, 2 + gn, true).formula(`SUM(${range(cl - 1, 3, cl - 1, 2 + gn)})`).style(scenter);
    cl += 1;

    ws.cell(6, 3 + gn, cl - 1, 3 + gn, true).string(data.template.config.attestation)
        .style(scenter).style({ font: { size: 7 } })

    for (let i = 0; i < cl - 1; ++i) {
      for (let j = 0; j < 3 + gn; ++j) {
        ws.cell(i + 1, j + 1).style(style);
      }
    }
    ws.cell(cl, 1, cl, 2 + gn, true).string(
        `Не менее ${data.template.config.hours_total_min} и не более ${data.template.config.hours_total_max} часов`
    );
    cl += 1;
    ws.cell(cl, 1, cl, 2 + gn, true).string('Обязательные предметы').style(srequired);
    cl += 1;
    ws.cell(cl, 1, cl, 2 + gn, true).string('Углублённые предметы').style(sadvanced);
  }

  if (!fs.existsSync('./tmp')) {
    fs.mkdirSync('./tmp');
  }

  const tempFilename = './tmp/~$tmp.xlsx'
  wb.write(tempFilename, () => callback(tempFilename));
}

export default {
  'xlsx': create_xlsx
}
