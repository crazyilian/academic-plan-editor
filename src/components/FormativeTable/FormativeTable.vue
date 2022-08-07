<template>
  <div style="height: 100%; overflow-y: scroll;" class="pl-2 pb-1 show-scrollbar">
    <div style="display: flex; flex-direction: column; justify-content: center" class="ma-0">
      <v-expansion-panels :value="panels" accordion focusable multiple class="rounded-0" @change="modelChange">
        <FormativeCategory
            v-for="(category, i) in plan.categories"
            :key="JSON.stringify(category.profile)"
            v-bind="category"
            ref="categories"
            :grade-groups="gradeGroups"
            @validate="validate(i, $event)"
        />
        <FormativeLastCategory ref="lastCategory" :grade-groups="gradeGroups" :plan="plan"/>
      </v-expansion-panels>
    </div>
  </div>
</template>

<script>

import FormativeLastCategory from "@/components/FormativeTable/FormativeLastCategory";
import FormativeCategory from "@/components/FormativeTable/FormativeCategory";
import bipartiteMatching from "bipartite-matching";
import { getFormativeSubjectName } from "@/gradeProcessing";

export default {
  name: 'FormativeTable',
  components: { FormativeCategory, FormativeLastCategory },
  props: {
    gradeGroups: { type: Array, default: () => [] },
    plan: { type: Object, default: () => ({}) },
    rules: { type: Array, default: () => [] },
    grades: { type: Array, default: () => [] },
  },
  data() {
    return {
      panels: [...Array(this.plan.categories.length + 1).keys()],
      changeShapeFlag: false,
      categoryId: undefined,
    }
  },
  watch: {
    plan: {
      handler() {
        this.panels = [...Array(this.plan.categories.length + 1).keys()];
        this.changeShapeFlag = true;
        this.$nextTick(() => this.changeShapeFlag = false);
      },
      deep: true
    },
  },
  methods: {
    modelChange(newPanels) {
      if (!this.changeShapeFlag) {
        this.panels = newPanels;
        return;
      }
      this.panels = structuredClone(this.panels);
      this.changeShapeFlag = false;
    },
    validate(i, j) {
      this.categoryId = i;
      const curCat = this.plan.categories[this.categoryId];
      const rules = this.rules.filter((r) =>
          r.subjects.some((s) => s === curCat.subjects[j].name)
          && JSON.stringify(this.grades[r.grades[0]].profile) === JSON.stringify(curCat.profile)
      );
      for (const rule of rules) {
        const ruleGrades = rule.grades.map(i => this.grades[i]);
        const ruleSubjects = rule.subjects.map(nm => getFormativeSubjectName(curCat.subjects.find((s) => s.name === nm)));
        const groupIds = this.gradeGroups.reduce((inds, group, i) => {
          if (ruleGrades.every((g) => group.some((grade) => grade.index === g.index))) {
            inds.push(i);
          }
          return inds;
        }, []);
        for (const groupId of groupIds) {
          const group = this.gradeGroups[groupId];
          const gradesCoordinates = [];

          if (rule.mins === undefined) {
            let value = 0;
            for (const grade of ruleGrades) {
              const gradeId = group.findIndex((g) => grade.index === g.index);
              gradesCoordinates.push([groupId, gradeId]);
              for (const subj of rule.subjects) {
                const planSubj = curCat.subjects.find((s) => s.name === subj).plan;
                const planVal = planSubj[groupId][gradeId];
                value += planVal;
              }
            }
            const badKeys = [
              ...(rule.min > value ? ['MIN'] : []),
              ...(rule.max !== undefined && rule.max < value ? ['MAX'] : [])
            ];
            if (badKeys.length > 0) {
              this.sendMessage(
                  rule, groupId,
                  {
                    key: 'RULE_UNIVERSAL',
                    args: [ruleGrades, ruleSubjects, badKeys, rule.min, rule.max, false],
                    grades: gradesCoordinates.map(g => g.toString())
                  },
                  gradesCoordinates, false
              );
            } else {
              this.sendMessage(rule, groupId, undefined, gradesCoordinates, true);
            }
          } else {
            const edges = [];
            const subj2num = {};
            const gradesCoordinates = [];
            for (const [i, grade] of ruleGrades.entries()) {
              const gradeId = group.findIndex((g) => grade.index === g.index);
              gradesCoordinates.push([groupId, gradeId]);
              for (const subj of rule.subjects) {
                const planSubj = curCat.subjects.find((s) => s.name === subj).plan;
                const planVal = planSubj[groupId][gradeId];
                if (planVal >= rule.mins[i]) {
                  if (!(subj in subj2num))
                    subj2num[subj] = Object.keys(subj2num).length;
                  edges.push([i, subj2num[subj]]);
                }
              }
            }
            const matching = bipartiteMatching(ruleGrades.length, Object.keys(subj2num).length, edges);
            if (matching.length !== ruleGrades.length) {
              this.sendMessage(
                  rule, groupId,
                  {
                    key: 'DIFFERENT_SUBJECTS',
                    args: [ruleGrades, rule.mins, false],
                    grades: gradesCoordinates.map(g => g.toString())
                  },
                  gradesCoordinates, false
              )
            } else {
              this.sendMessage(rule, groupId, undefined, gradesCoordinates, true);
            }
          }
        }
      }
    },
    getSubjectIdByName(name) {
      return this.plan.categories[this.categoryId].subjects.findIndex((s) => s.name === name);
    },
    sendMessage(rule, groupId, message, gradeIds, correct) {
      for (const name of rule.subjects) {
        const j = this.getSubjectIdByName(name);
        this.$refs.categories[this.categoryId].$refs.subjects[j].setCorrectness(correct, rule.id, gradeIds);
      }
      if (rule.subjects.length === 1) {
        const j = this.getSubjectIdByName(rule.subjects[0]);
        this.$refs.categories[this.categoryId].$refs.subjects[j].addMessage(rule.id, groupId, message);
      } else {
        this.$refs.categories[this.categoryId].addMessage(rule.id, groupId, message);
      }
    }
  }
}
</script>
<style>

</style>
