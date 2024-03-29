<template>
  <div style="display: flex; flex-direction: column; min-height: 0">
    <HorizontalResizeBar>
      <div style="display: flex; justify-content: flex-end; align-items: center">
        <ProfileMenu
            :grades="grades"
            @add-group="$emit('add-group', $event)"
        />
        <BarGradeGroups
            ref="barGradeGroups"
            style="margin-right: 24px; min-height: 44px;"
            :grade-groups="gradeGroups"
            @remove-group="$emit('remove-group', $event)"
            @highlight="$emit('highlight', $event)"
        />
      </div>
    </HorizontalResizeBar>
    <div class="general-table show-scrollbar">
      <v-expansion-panels v-model="panels" accordion focusable multiple class="rounded-0">
        <Section
            :id="6"
            ref="s6"
            :style="{display: curPlanType === '10-11' ? 'block' : 'none'}"
            name="Количество углублённых предметов"
            error-name="Количество углублённых предметов"
            :grade-groups="gradeGroups"
            :data-raw="section6"
            @set-correct="setCorrect(...$event)"
        />
        <Section
            :id="0"
            ref="s0"
            name="Обязательная часть"
            :grade-groups="gradeGroups"
            :data-raw="section0"
            @set-correct="setCorrect(...$event)"
        />
        <Section
            :id="1"
            ref="s1"
            name="Формируемая часть"
            :grade-groups="gradeGroups"
            :data-raw="section1"
            @set-correct="setCorrect(...$event)"
        />
        <Section
            :id="2"
            ref="s2"
            name="Недельная нагрузка"
            error-name="Недельная нагрузка"
            :grade-groups="gradeGroups"
            :data-raw="section2"
            @set-correct="setCorrect(...$event)"
        />
        <Section
            :id="3"
            ref="s3"
            name="Учебных недель"
            error-name="Количество учебных недель"
            :grade-groups="gradeGroups"
            :data-raw="section3"
            @set-correct="setCorrect(...$event)"
        />
        <Section
            :id="4"
            ref="s4"
            name="По учебному плану"
            :grade-groups="gradeGroups"
            :data-raw="section4"
            @set-correct="setCorrect(...$event)"
        />
        <Section
            :id="5"
            ref="s5"
            name="На уровень образования"
            error-name="Количество часов в год на уровень образования"
            :grade-groups="gradeGroups"
            :hide="section5Hidden"
            :data-raw="section5"
            @set-correct="setCorrect(...$event)"
        />
      </v-expansion-panels>
    </div>
  </div>
</template>

<script>

import Section from "@/components/GeneralTable/Section";
import BarGradeGroups from "@/components/Grades/BarGradeGroups";
import Vue from "vue";
import { fillShape2, planType, isEqualProfile } from "@/gradeProcessing";
import HorizontalResizeBar from "@/components/HorizontalResizeBar";
import ProfileMenu from "@/components/Grades/ProfileMenu";

export default {
  name: "GeneralTable",
  components: { ProfileMenu, HorizontalResizeBar, BarGradeGroups, Section },
  props: {
    gradeGroups: { type: Array, default: () => [] },
    obligatoryPlan: { type: Array, default: () => [] },
    formativePlan: { type: Object, default: () => ({}) },
    config: { type: Object, default: () => ({}) },
    grades: { type: Array, default: () => [] },
  },
  data() {
    return {
      panels: [...Array(7).keys()],
      correctSections: Array(7).fill(true),
      correct: true,
      curPlanType: this.gradeGroups.length > 0 ? planType(this.gradeGroups[0][0]) : undefined
    }
  },
  computed: {
    section5Hidden() {
      return fillShape2(this.gradeGroups, (i, j) => j !== 0);
    },

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
      if (this.gradeGroups.every((group) => group.every((grade) => grade.max_hours_per_week === null)))
        return undefined;
      return this.gradeGroups.map((group) => group.map((grade) => grade.max_hours_per_week));
    },
    peryear() {
      const perweek = this.perweek;
      const weeknum = this.weeknum;
      return perweek.map((r1, i) => r1.map((r2, j) => r2 * weeknum[i][j]))
    },
    edu() {
      const a = this.peryear;
      return a.map((group) => [group.reduce((r, x) => r + x), ...Array(group.length - 1).fill(0)]);
    },
    edumin() {
      return this.gradeGroups.map((group) => [this.config.hours_total_min, ...Array(group.length - 1).fill(0)]);
    },
    edumax() {
      return this.gradeGroups.map((group) => [this.config.hours_total_max, ...Array(group.length - 1).fill(0)]);
    },
    weeknum() {
      return this.gradeGroups.map((group) => group.map((grade) => grade.weeknum || null));
    },
    advancedCount() {
      return this.obligatoryPlan.reduce((r, x) => r.concat(x)).reduce((r, v) => r.map((r1, i) => r1.map((r2, j) => r2 + v[i][j].advanced)), fillShape2(this.gradeGroups, () => 0));
    },
    advancedCountMin() {
      return fillShape2(this.gradeGroups, (i, j, group, grade) =>
          this.curPlanType === '10-11' && !isEqualProfile(grade.profile, this.grades[0].profile) ? 3 : 0
      )
    },


    section0() {
      return [{ name: 'Часов в неделю', values: this.obligatory, edit: false }];
    },
    section1() {
      return [{ name: 'Часов в неделю', values: this.formative, edit: false }];
    },
    section2() {
      return [
        { name: 'Часов в неделю', values: this.perweek, edit: false },
        ...(this.perweekmax !== undefined ? [{ type: 'max', values: this.perweekmax }] : [])
      ];
    },
    section3() {
      return [{ name: 'Итого', values: this.weeknum, edit: true, onedit: this.weeknumChange }]
    },
    section4() {
      return [{ name: 'Часов в год', values: this.peryear, edit: false }];
    },
    section5() {
      return [
        { name: 'Часов в год', values: this.edu, edit: false },
        { type: 'min', values: this.edumin },
        { type: 'max', values: this.edumax }
      ];
    },
    section6() {
      return [
        { name: 'Итого', values: this.advancedCount, edit: false },
        { type: 'min', values: this.advancedCountMin }
      ]
    }

  },
  methods: {
    weeknumChange(i, j, val) {
      Vue.set(this.gradeGroups[i][j], 'weeknum', val);
    },
    setCorrect(i, val) {
      this.correctSections[i] = val;
      this.correct = this.correctSections.every(c => c);
      this.$emit('set-correct', this.correct);
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
  padding-bottom: 4px !important;
}

</style>
