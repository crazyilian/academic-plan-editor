<template>
  <div style="display: flex; flex-direction: column; min-height: 0" class="pl-2">
    <HorizontalResizeBar>
      <div style="display: flex; justify-content: flex-end">
        <BarGradeGroups
            style="margin-right: 24px; min-height: 44px;"
            :grade-groups="gradeGroups"
            :highlight="highlight"
        />
      </div>
    </HorizontalResizeBar>
    <div class="general-table show-scrollbar">
      <v-expansion-panels v-model="panels" accordion focusable multiple class="rounded-0">
        <Section
            :id="0"
            ref="s0"
            name="Обязательная часть"
            :grade-groups="gradeGroups"
            :highlight="highlight"
            :data-raw="[{name: 'Часов в неделю', values: obligatory, edit: false}]"
        />
        <Section
            :id="1"
            ref="s1"
            name="Формируемая часть"
            :grade-groups="gradeGroups"
            :highlight="highlight"
            :data-raw="[{name: 'Часов в неделю', values: formative, edit: false}]"
        />
        <Section
            :id="2"
            ref="s2"
            name="Недельная нагрузка"
            error-name="Недельная нагрузка"
            :grade-groups="gradeGroups"
            :highlight="highlight"
            :data-raw="[{name: 'Часов в неделю', values: perweek, edit: false},
                      {type: 'max', values: perweekmax}]"
        />
        <Section
            :id="3"
            ref="s3"
            name="Учебных недель"
            error-name="Количество учебных недель"
            :grade-groups="gradeGroups"
            :highlight="highlight"
            :data-raw="[{name: 'Итого', values: weeknum, edit: true, onedit: weeknumChange}]"
        />
        <Section
            :id="4"
            ref="s4"
            name="По учебному плану"
            :grade-groups="gradeGroups"
            :highlight="highlight"
            :data-raw="[{name: 'Часов в год', values: peryear, edit: false}]"
        />
        <Section
            :id="5"
            ref="s5"
            name="На уровень образования"
            error-name="Количество часов в год на уровень образования"
            :grade-groups="gradeGroups.map((group) => [{ id: group[0].id }])"
            :highlight="highlight.map((group) => [group.some(x => x)])"
            :data-raw="[{name: 'Часов в год', values: edu, edit: false},
                      {type: 'min', values: edumin},
                      {type: 'max', values: edumax}]"
        />
      </v-expansion-panels>
    </div>
  </div>
</template>

<script>

import Section from "@/components/GeneralTable/Section";
import BarGradeGroups from "@/components/Grades/BarGradeGroups";
import Vue from "vue";
import { fillShape2 } from "@/gradeProcessing";
import HorizontalResizeBar from "@/components/HorizontalResizeBar";

export default {
  name: "GeneralTable",
  components: { HorizontalResizeBar, BarGradeGroups, Section },
  props: {
    gradeGroups: { type: Array, default: () => [] },
    obligatoryPlan: { type: Array, default: () => [] },
    formativePlan: { type: Object, default: () => ({}) },
    config: { type: Object, default: () => ({}) },
    highlight: { type: Array, default: () => [] }
  },
  data() {
    return {
      panels: [...Array(6).keys()],
    }
  },
  computed: {
    obligatory() {
      return this.obligatoryPlan.reduce((r, x) => r.concat(x)).reduce((r, v) => r.map((r1, i) => r1.map((r2, j) => r2 + v[i][j].value)), fillShape2(this.gradeGroups, () => 0));
    },
    formative() {
      return this.formativePlan.categories.reduce((r, x) => r.concat(x.subjects), []).reduce((r, v) => r.map((r1, i) => r1.map((r2, j) => r2 + v.plan[i][j])), this.formativePlan.hours);
    },
    perweek() {
      const a = this.obligatory;
      const b = this.formative;
      return a.map((r1, i) => r1.map((r2, j) => r2 + b[i][j]))
    },
    perweekmax() {
      return this.gradeGroups.map((group) => group.map((grade) => grade.max_hours_per_week));
    },
    peryear() {
      const a = this.perweek;
      return a.map((r1, i) => r1.map((r2, j) => r2 * this.gradeGroups[i][j].weeknum))
    },
    edu() {
      const a = this.peryear;
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
    }
  },
  methods: {
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
