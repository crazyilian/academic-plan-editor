const excel = require('excel4node');
const fs = require('fs');

function cell(x, y) {
  return `${"ABCDEFGHIJKLMNOPQRSTUVWXYZ"[y - 1]}${x}`
}

function range(x1, y1, x2, y2) {
  return `${cell(x1, y1)}:${cell(x2, y2)}`
}

function formulaLine(ws, gn, cl, label, f) {
  ws.cell(cl, 1, cl, 2, true).string(label)
  for (let i = 0; i < gn; ++i) {
    f(ws.cell(cl, 3 + i), i);
  }
  return cl + 1;
}

function create_xlsx(alldata, callback) {
  const wb = new excel.Workbook({
    defaultFont: {
      size: 8,
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
  const sgray = wb.createStyle({
    fill: {
      fgColor: "#CCCCCC",
      type: 'pattern',
      patternType: 'solid'
    }
  });
  if (alldata.length === 0) {
    wb.addWorksheet();
  }
  for (const data of alldata) {
    const ws = wb.addWorksheet(data.template.config.name);
    const gn = data.template.grades.length;
    ws.column(1).setWidth(25);
    ws.column(2).setWidth(50);
    ws.column(3 + gn).setWidth(13);
    ws.row(2).setHeight(30.6);
    ws.row(3).setHeight(105);
    ws.row(4).setHeight(30.6);
    ws.cell(1, 1, 1, 3 + gn, true).string(data.template.config.title).style(scenter);
    ws.cell(2, 1, 4, 1, true).string('Предметные области').style(scenter);
    ws.cell(2, 2, 4, 2, true).string('Учебные предметы, курсы').style(scenter);
    ws.cell(2, 3, 2, 2 + gn, true).string('Количество часов в неделю').style(scenter);
    ws.cell(2, 3 + gn, 4, 3 + gn, true).string('Формы промежуточной аттестации').style(scenter);
    for (const [i, grade] of data.template.grades.entries()) {
      ws.column(3 + i).setWidth(6);
      ws.cell(3, 3 + i).string(grade.description).style({ alignment: { textRotation: 90 } }).style(scenter);
      ws.cell(4, 3 + i).string(grade.name).style(scenter);
    }

    ws.cell(5, 1, 5, 2 + gn, true).string('Обязательная часть').style(sbold);
    let cl = 6;
    for (const category of data.template.categories) {
      const n = category.subjects.length;
      const flag = n === 1 && category.subjects[0].name === category.name;
      ws.cell(cl, 1, cl + n - 1, 1 + flag, true).string(category.name).style(sbold);
      for (const [i, subject] of category.subjects.entries()) {
        ws.cell(cl + i, 2).string(subject.name).style(subject.required ? sgray : {}).style(sbold);
      }
      cl += n;
    }
    cl = 6;
    let sub = 0;
    for (const category of data.obligatoryPlan) {
      for (const subject of category) {
        for (const [gi, val] of subject.entries()) {
          if (val !== 0) {
            ws.cell(cl, 3 + gi).number(val).style(scenter).style(sbold);
          }
        }
        cl += 1;
        sub += 1;
      }
    }
    cl = formulaLine(ws, gn, cl, "Итого (количество часов обязательной части)", (c, i) => {
      c.formula(`SUM(${range(cl - sub, i + 3, cl - 1, i + 3)})`).style(scenter);
    })

    ws.cell(cl, 1, cl, 2 + gn, true).string("Часть, формируемая участниками образовательных отношений").style(sbold);
    cl += 1;
    let start = cl;
    if (data.formativePlan.subjects.length > 0) {
      for (const subject of data.formativePlan.subjects) {
        ws.cell(cl, 1, cl, 2, true).string(subject).style(sbold);
        cl += 1;
      }
      for (const [i, val] of data.formativePlan.hours.entries()) {
        const c = ws.cell(start, 3 + i, cl - 1, 3 + i, true);
        if (val !== 0) {
          c.number(val).style(scenter).style(sbold);
        }
      }
      cl = formulaLine(ws, gn, cl, "Итого (количество часов формируемой части)", (c, i) => {
        c.formula(`SUM(${range(start, i + 3, cl - 1, i + 3)})`).style(scenter);
      })
    } else {
      cl = formulaLine(ws, gn, cl, "Итого (количество часов формируемой части)", (c, i) => {
        c.number(data.formativePlan.hours[i]).style(scenter);
      })
    }

    ws.cell(6, 3 + gn, cl - 2, 3 + gn, true).string(data.template.config.attestation)
        .style(scenter).style({ font: { size: 7 } })


    cl = formulaLine(ws, gn, cl, "Итого недельная нагрузка", (c, i) => {
      c.formula(`${cell(start - 2, i + 3)} + ${cell(cl - 1, i + 3)}`).style(scenter);
    })
    cl = formulaLine(ws, gn, cl, "Максимальная учебная недельная нагрузка", (c, i) => {
      c.number(data.template.grades[i].max_hours_per_week).style(scenter).style(sgray);
    })
    cl = formulaLine(ws, gn, cl, "Количество учебных недель", (c, i) => {
      if (typeof data.weeknum[i] === 'number') {
        c.number(data.weeknum[i]).style(scenter);
      } else {
        c.style(scenter);
      }
    })
    cl = formulaLine(ws, gn, cl, "Количество часов за год по учебному плану", (c, i) => {
      c.formula(`${cell(cl - 3, i + 3)} * ${cell(cl - 1, i + 3)}`).style(scenter);
    })
    ws.cell(cl - 5, 3 + gn, cl - 1, 3 + gn, true);
    ws.cell(cl, 1, cl, 2, true).string("Итого на уровень образования");
    ws.cell(cl, 3, cl, 2 + gn, true).formula(`SUM(${range(cl - 1, 3, cl - 1, 2 + gn)})`).style(scenter);
    cl += 1;

    for (let i = 0; i < cl - 1; ++i) {
      for (let j = 0; j < 3 + gn; ++j) {
        ws.cell(i + 1, j + 1).style(style);
      }
    }
    ws.cell(cl, 1, cl, 2 + gn, true).string(
        `не менее ${data.template.config.hours_total_min} и не более ${data.template.config.hours_total_max} часов`
    )
    cl += 1;
    ws.cell(cl, 1, cl, 2 + gn, true).string('обязательные предметы').style(sgray);
  }

  if (!fs.existsSync('./tmp')){
    fs.mkdirSync('./tmp');
  }

  const tempFilename = './tmp/~$tmp.xlsx'
  wb.write(tempFilename, () => callback(tempFilename));
}

export default {
  'xlsx': create_xlsx
}
