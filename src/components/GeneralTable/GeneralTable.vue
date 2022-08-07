<template>
  <div style="display: flex; flex-direction: column; min-height: 0">
    <HorizontalResizeBar>
      <div style="display: flex; justify-content: flex-end; align-items: center">
        <ProfileMenu
            :grades="grades"
            @add-group="$emit('add-group', $event)"
        />
        <BarGradeGroups
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
            :grade-groups="gradeGroups.map((group) => [{ id: group[0].id, profile: group.slice(-1)[0].profile }])"
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
import { fillShape2 } from "@/gradeProcessing";
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
      panels: [...Array(6).keys()],
      correctSections: Array(6).fill(true),
      correct: true,
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
        { type: 'max', values: this.perweekmax }
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
