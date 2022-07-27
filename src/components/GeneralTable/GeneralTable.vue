<template>
  <div style="display: flex; flex-direction: column; min-height: 0" class="pl-2">
    <div style="display: flex; justify-content: flex-end; border-bottom: solid thin gray;">
      <GradeTitle
          style="margin-right: 24px; min-height: 44px;"
          :grades-groups="gradeGroups"
          @highlight-grade="(i, j, flag) => $emit('highlight-grade', i, j, flag)"
      />
    </div>
    <div class="general-table">
      <v-expansion-panels v-model="panels" accordion focusable multiple class="rounded-0">
        <Section
            :id="0"
            ref="s0"
            name="Обязательная часть"
            :grade-groups="gradeGroups"
            :data-raw="[{name: 'Час / нед', values: obligatory(), edit: false}]"
        />
        <Section
            :id="1"
            ref="s1"
            name="Формируемая часть"
            :grade-groups="gradeGroups"
            :data-raw="[{name: 'Час / нед', values: formative(), edit: false}]"
        />
        <Section
            :id="2"
            ref="s2"
            name="Недельная нагрузка"
            error-name="Недельная нагрузка"
            :grade-groups="gradeGroups"
            :data-raw="[{name: 'Час / нед', values: perweek(), edit: false},
                      {type: 'max', values: perweekmax()}]"
        />
        <Section
            :id="3"
            ref="s3"
            name="Учебных недель"
            error-name="Количество учебных недель"
            :grade-groups="gradeGroups"
            :data-raw="[{name: 'Итого', values: weeknum(), edit: true, oninput: weeknumChange}]"
        />
        <Section
            :id="4"
            ref="s4"
            name="По учебному плану"
            :grade-groups="gradeGroups"
            :data-raw="[{name: 'Час / год', values: peryear(), edit: false}]"
        />
        <Section
            :id="5"
            ref="s5"
            name="На уровень образования"
            error-name="Количество часов в год на уровень образования"
            :grade-groups="gradeGroups.map((group) => [{highlight: group.reduce((r, grade) => r || grade.highlight, false)}])"
            :data-raw="[{name: 'Час / год', values: edu(), edit: false},
                      {type: 'min', values: edumin()},
                      {type: 'max', values: edumax()}]"
        />
      </v-expansion-panels>
    </div>
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
import GradeTitle from "@/components/GradeTitle";
import Vue from "vue";

export default {
  name: "GeneralTable",
  components: { GradeTitle, Section },
  props: {
    gradeGroups: { type: Array, default: () => [] },
    obligatoryPlan: { type: Array, default: () => [] },
    formativePlan: { type: Object, default: () => ({}) },
    config: { type: Object, default: () => ({}) }
  },
  data() {
    return {
      panels: [...Array(6).keys()],
    }
  },
  methods: {
    obligatory() {
      return this.obligatoryPlan.reduce((r, x) => r.concat(x)).reduce((r, v) => r.map((r1, i) => r1.map((r2, j) => r2 + v[i][j].value)), this.gradeGroups.map((group) => Array(group.length).fill(0)));
    },
    formative() {
      return this.gradeGroups.map((group) => Array(group.length).fill(0));
    },
    perweek() {
      const a = this.obligatory();
      const b = this.formative();
      return a.map((r1, i) => r1.map((r2, j) => r2 + b[i][j]))
    },
    perweekmax() {
      return this.gradeGroups.map((group) => group.map((grade) => grade.max_hours_per_week));
    },
    peryear() {
      const a = this.perweek();
      return a.map((r1, i) => r1.map((r2, j) => r2 * this.gradeGroups[i][j].weeknum))
    },
    edu() {
      const a = this.peryear();
      return a.map((group) => [group.reduce((r, x) => r + x)]);
    },
    edumin() {
      return this.gradeGroups.map(() => [this.config.hours_total_min]);
    },
    edumax() {
      return this.gradeGroups.map(() => [this.config.hours_total_max]);
    },
    weeknum() {
      return this.gradeGroups.map((group) => group.map((grade) => grade.weeknum));
    },
    weeknumChange(i, j, val) {
      Vue.set(this.gradeGroups[i][j], 'weeknum', val);
    },
    correct() {
      const sections = ['s0', 's1', 's2', 's3', 's4', 's5'];
      let correct = true;
      for (const s of sections) {
        correct &&= this.$refs[s].correct;
      }
      return correct;
    }
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
  padding-bottom: 4px !important;
}

</style>
