import * as xlsx from 'xlsx';
import fs from "fs-extra";

/*

[
  {
    config: {
      title: "Учебный план Среднего Общего Образования (10-11 классы)",
      name: "УП СОО (10-11 классы)",
      attestation: "",
      hours_total_min: 2170,
      hours_total_max: 2590
    },
    grades: [
      {
        name: 10,
        profile: ["Инженерный", "Космический"],
        max_hours_per_week: 34,
        index: 0,
      },
      ...
    ],
    categories: [
      {
        name: "Русский язык и литература",
        index: 0,
        subjects: [
          {
            name: "Русский язык",
            required: true,
            can_advanced: true,
            is_module: false,
            index: 0
          },
          ...
        ]
      },
      ...
    ],
    rulesObligatory: [
      {
        grades: [0],
        subjects: [[0, 2]],
        advanced: true,
        min: 3,
        max: 4,
        mins: undefined
      },
      ...
    ],
    rulesFormative: [
      {
        grades: [3, 4],
        subjects: ["Геоинформатика"],
        advanced: false,
        min: 2,
        max: undefined,
        mins: undefined
      },
      ...
    ],
  },
  ...
]

 */

/* A->0, B->1, Z->25, AA->26 etc. */
function col2num(s) {
  let ans = 0;
  for (let i = 0; i < s.length; i++) {
    ans = ans * 26 + s.charCodeAt(i) - 64;
  }
  return ans - 1;
}

/* A4 -> [0, 3, 'A4'] -- Note that the 1-up row count in the label is changed to a 0-up index. */
function parseCell(s) {
  const m = s.match(/([A-Z]+)([0-9]+)/);
  if (m !== null) {
    return [col2num(m[1]), Number(m[2]) - 1, m[0]];
  }
}

function tabulate(sheet) {
  const [mxCol, mxRow] = parseCell(sheet['!ref'].split(':')[1])
  const rows = iota(1, mxRow + 2).map(() => iota(1, mxCol + 2).map(() => ({ val: "", bg: undefined })));
  Object.keys(sheet).map(parseCell).filter((x) => (x !== undefined)).forEach(function (parsed_key) {
    const key = parsed_key[2];
    const col = parsed_key[0];
    const row = parsed_key[1];
    const val = sheet[key].w || sheet[key].v || "";
    const bg = (sheet[key].s.fgColor || {}).rgb;
    rows[row][col] = { val, bg };
  });
  sheet['!merges'].forEach(function (r) {
    const x0 = r.s.r;
    const y0 = r.s.c;
    const x1 = r.e.r;
    const y1 = r.e.c;
    for (let x = x0; x <= x1; ++x) {
      for (let y = y0; y <= y1; ++y) {
        rows[x][y] = { merge: [x0, y0, x1, y1], ...rows[x0][y0] }
      }
    }
  });
  return rows;
}

function strEq(s, ...arr) {
  return arr.map(s => s.trim().toLowerCase()).includes(s.trim().toLowerCase());
}

function splitTable(vals, table) {
  const res = [];
  let x = 0;
  for (const [i, val] of vals.entries()) {
    while (!strEq(table[x][0].val, val)) x++;
    const S = x;
    while (!strEq(table[x][0].val, vals[i + 1] || "", "")) x++;
    const F = x;
    res.push([S, F]);
  }
  return res;
}

function iota(s, f) {
  return Array.from(Array(f - s + 1), (_, i) => i + s);
}

function mrg(table, x, y) {
  return table[x][y].merge || [x, y, x, y];
}

function parseCellVal(s_) {
  const s = s_.trim();
  if (/^\d+$/.test(s)) {
    return { min: parseInt(s) };
  } else if (/^\d+-\d+$/.test(s)) {
    const [min, max] = s.split('-').map(x => parseInt(x));
    return { min, max };
  } else {
    return { mins: s.split(',').map(x => parseInt(x)) }
  }
}

function parseSheet(sh, name) {
  const template = {
    config: { name: name, },
    grades: [],
    categories: [],
    rulesObligatory: [],
    rulesFormative: [],
  }
  const table = tabulate(sh);
  // const N = table.length;
  const M = table[0].length;
  for (let y = 3; y < M; ++y) {
    const x = 2;
    if (table[x][y].val === "") break;
    template.grades.push({
      index: template.grades.length,
      name: parseInt(table[x][y].val),
      profile: [
        table[x - 1][y].val,
        ...(table[x - 2][y].val ? [table[x - 2][y].val.replace(/^-$/, '')] : [])
      ]
    })
  }
  const [OB, FO, CO, BG] = splitTable([
    "Обязательная часть",
    "Часть, формируемая участниками образовательных отношений",
    "Общие данные учебного плана",
    "Цвета ячеек"
  ], table)
  //////////////////////////////////////////////////////////////////////// COLORS
  const colors = {};
  for (let x = BG[0] + 1; x < BG[1]; ++x) {
    const val = table[x][0].val;
    const col = table[x][0].bg;
    if (strEq(val, 'обязательные предметы и часы')) {
      colors.required = col;
    } else if (strEq(val, 'обязательные углубленные предметы')) {
      colors.advanced = col;
    } else if (strEq(val, 'обязательные предметы')) {
      colors.required_subj = col;
    }
  }
  //////////////////////////////////////////////////////////////////////// OBLIGATORY
  const subjCoor = [];
  {
    let x = OB[0] + 1;
    while (x !== OB[1]) {
      const last = mrg(table, x, 0)[2];
      template.categories.push({
        index: template.categories.length,
        name: table[x][0].val,
        subjects: [],
      });
      const subjects = template.categories[template.categories.length - 1].subjects;
      for (let xx = x; xx <= last; ++xx) {
        const name = table[xx][1].val;
        subjects.push({
          index: subjects.length,
          name: name,
          required: table[xx][1].bg === colors.required_subj,
          can_advanced: strEq(table[xx][2].val, "Б или У"),
          is_module: name.toLowerCase().startsWith('учебный модуль:')
        });
        subjCoor.push([template.categories.length - 1, subjects.length - 1]);
      }
      x = last + 1;
    }
  }
  //////////////////////////////////////////////////////////////////////// CONFIG
  {
    let x = CO[0] + 1;
    while (x !== CO[1]) {
      const val = table[x][0].val;
      if (strEq(val, 'Суммарное количество часов')) {
        for (let y = 1; y <= 2; ++y) {
          if (strEq(table[x][y].val, 'Минимум')) {
            template.config.hours_total_min = parseInt(table[x + 1][y].val);
          } else if (strEq(table[x][y].val, 'Максимум')) {
            template.config.hours_total_max = parseInt(table[x + 1][y].val);
          }
        }
        x += 2;
      } else if (strEq(val, 'Максимальное количество часов')) {
        for (let y = 1; table[x][y].val !== ""; ++y) {
          template.grades.filter(g => g.name === parseInt(table[x][y].val)).forEach(g => {
            g.max_hours_per_week = parseInt(table[x + 1][y].val);
          })
        }
        x += 2;
      } else if (strEq(val, 'Промежуточная аттестация')) {
        template.config.attestation = table[x][1].val;
        x += 1;
      } else if (strEq(val, 'Заголовок')) {
        template.config.title = table[x][1].val;
        x += 1;
      }
    }
  }
  //////////////////////////////////////////////////////////////////////// OBLIGATORY TABLE
  for (let x = OB[0] + 1; x < OB[1]; ++x) {
    for (let y = 3; y < 3 + template.grades.length; ++y) {
      if (mrg(table, x, y)[0] !== x || mrg(table, x, y)[1] !== y) {
        continue;
      }
      if (table[x][y].bg === undefined && table[x][y].val === "") {
        continue;
      }
      const val = parseCellVal(table[x][y].val || "1");
      template.rulesObligatory.push({
        grades: iota(y - 3, mrg(table, x, y)[3] - 3),
        subjects: iota(x - OB[0] - 1, mrg(table, x, y)[2] - OB[0] - 1).map(i => subjCoor[i]),
        advanced: table[x][y].bg === colors.advanced,
        ...val
      });
    }
  }
  //////////////////////////////////////////////////////////////////////// FORMATIVE TABLE
  for (let x = FO[0] + 1; x < FO[1]; ++x) {
    for (let y = 3; y < 3 + template.grades.length; ++y) {
      if (mrg(table, x, y)[0] !== x || mrg(table, x, y)[1] !== y) {
        continue;
      }
      if (table[x][y].bg === undefined && table[x][y].val === "") {
        continue;
      }
      const val = parseCellVal(table[x][y].val || "1");
      template.rulesFormative.push({
        grades: iota(y - 3, mrg(table, x, y)[3] - 3),
        subjects: iota(x, mrg(table, x, y)[2]).map(i => table[i][0].val),
        advanced: table[x][y].bg === colors.advanced,
        ...val
      });
    }
  }
  return template;
}

export function parseTable(filename) {
  const wb = xlsx.read(fs.readFileSync(filename), { cellStyles: true });
  const templates = [];
  for (const [name, sh] of Object.entries(wb.Sheets)) {
    templates.push(parseSheet(sh, name));
  }
  return templates;
}


// console.log(JSON.stringify(parseTable('extraResources/plan-templates/table.xlsx')))
