<template>
  <div class="rounded-lg pb-1 general-table pl-2 pt-1">
    <v-expansion-panels v-model="panels" accordion focusable multiple class="rounded-0">
      <Section
          :id="0"
          name="Обязательная часть"
          :grades="grades"
          :grade-highlight="gradeHighlight"
          :data-raw="[{name: 'Час / нед', values: obligatory(), edit: false}]"
      />
      <Section
          :id="1"
          name="Формируемая часть"
          :grades="grades"
          :grade-highlight="gradeHighlight"
          :data-raw="[{name: 'Час / нед', values: formative(), edit: false}]"
      />
      <Section
          :id="2"
          name="Недельная нагрузка"
          error-name="Недельная нагрузка"
          :grades="grades"
          :grade-highlight="gradeHighlight"
          :data-raw="[{name: 'Час / нед', values: perweek(), edit: false},
                      {type: 'max', values: perweekmax()}]"
      />
      <Section
          :id="3"
          name="Учебных недель"
          error-name="Количество учебных недель"
          :grades="grades"
          :grade-highlight="gradeHighlight"
          :data-raw="[{name: 'Итого', values: weeknum, edit: true}]"
      />
      <Section
          :id="4"
          name="По учебному плану"
          :grades="grades"
          :grade-highlight="gradeHighlight"
          :data-raw="[{name: 'Час / год', values: peryear(), edit: false}]"
      />
      <Section
          :id="5"
          name="На уровень образования"
          error-name="Количество часов в год на уровень образования"
          :grades="eduGrade"
          :grade-highlight="eduGradeHighlight"
          :data-raw="[{name: 'Час / год', values: edu(), edit: false},
                      {type: 'min', values: edumin()},
                      {type: 'max', values: edumax()}]"
      />
    </v-expansion-panels>
  </div>
</template>

<script>

/*


Обязательная часть
 - Часов в неделю

Формируемвя часть
 - Часов в неделю

Недельная нагрузка
 - Часов в неделю
 - Максимум

Учебных недель
 - Итого

По учебному плану
 - Часов в год

На уровень образования
 - Часов в год
 - Минимум
 - Максимум


 */

import Section from "@/components/GeneralTable/Section";

export default {
  name: "GeneralTable",
  components: { Section },
  props: {
    grades: { type: Array, default: () => [] },
    gradeHighlight: { type: Array, default: () => [] },
    obligatoryPlan: { type: Array, default: () => [] },
    formativePlan: { type: Array, default: () => [] },
    config: { type: Object, default: () => {} }
  },
  data() {
    return {
      panels: [...Array(6).keys()],
      weeknum: Array(this.grades.length).fill(null),
      eduGrade: [{}],
      eduGradeHighlight: [false],
    }
  },
  methods: {
    obligatory() {
      return this.obligatoryPlan.reduce((r, x) => r.concat(x)).reduce((a, b) => a.map((r, i) => r + b[i]))
    },
    formative() {
      if (this.formativePlan.length === 0) {
        return Array(this.grades.length).fill(0);
      }
      return this.formativePlan.reduce((r, x) => r.concat(x)).reduce((a, b) => a.map((r, i) => r + b[i]))
    },
    perweek() {
      const a = this.obligatory();
      const b = this.formative();
      return a.map((r, i) => r + b[i]);
    },
    perweekmax() {
      return this.grades.map((g) => g.max_hours_per_week);
    },
    peryear() {
      const a = this.perweek();
      const w = this.weeknum;
      return a.map((r, i) => r * w[i]);
    },
    edu() {
      const a = this.peryear();
      return [a.reduce((r, x) => r + x)];
    },
    edumin() {
      return [this.config.hours_total_min];
    },
    edumax() {
      return [this.config.hours_total_max];
    },
  }
}
</script>

<style>

.general-table {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: scroll;
}


</style>
