<template>
  <div style="height: 100%; overflow-y: scroll;" class="pl-2 pt-0 pb-1 show-scrollbar">
    <div style="display: flex; flex-direction: column; justify-content: center" class="ma-0">
      <v-expansion-panels v-model="panels" accordion focusable multiple class="rounded-0">
        <Category
            v-for="(category, i) in categories"
            v-bind="category"
            :key="i"
            ref="categories"
            :grade-groups="gradeGroups"
            :plan="plan[i]"
            @validate="validate(i, $event)"
        />
      </v-expansion-panels>
    </div>
  </div>
</template>

<script>

import Category from "@/components/Table/Category";
import bipartiteMatching from "bipartite-matching"

export default {
  name: 'Table',
  components: { Category },
  props: {
    categories: { type: Array, default: () => [] },
    gradeGroups: { type: Array, default: () => [] },
    plan: { type: Array, default: () => [] },
    rules: { type: Array, default: () => [] },
    grades: { type: Array, default: () => [] },
  },
  data() {
    return {
      panels: [...Array(this.categories.length).keys()],
    }
  },
  methods: {
    validate(i, j) {
      const rules = this.rules.filter((r) =>
          r.subjects.some((s) => s[0] === i && s[1] === j)
      );
      for (const rule of rules) {
        const ruleGrades = rule.grades.map(i => this.grades[i]);
        const ruleSubjects = rule.subjects.map(ij => this.categories[ij[0]].subjects[ij[1]]);
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
            let advanced = true;
            let value = 0;
            for (const grade of ruleGrades) {
              const gradeId = group.findIndex((g) => grade.index === g.index);
              gradesCoordinates.push([groupId, gradeId]);
              for (const subj of rule.subjects) {
                const planSubj = this.plan[subj[0]][subj[1]];
                const planVal = planSubj[groupId][gradeId];
                advanced &&= planVal.advanced;
                value += planVal.value;
              }
            }

            const badKeys = [
              ...(rule.advanced && !advanced ? ['ADVANCED'] : []),
              ...(rule.min > value ? ['MIN'] : []),
              ...(rule.max !== undefined && rule.max < value ? ['MAX'] : [])
            ];
            if (badKeys.length > 0) {
              this.sendMessage(
                  rule, groupId,
                  {
                    key: 'RULE_UNIVERSAL',
                    args: [ruleGrades, ruleSubjects, badKeys, rule.min, rule.max],
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
                const planSubj = this.plan[subj[0]][subj[1]];
                const planVal = planSubj[groupId][gradeId];
                if (!rule.advanced || planVal.advanced) {
                  if (planVal.value >= rule.mins[i]) {
                    if (!(subj in subj2num))
                      subj2num[subj] = Object.keys(subj2num).length;
                    edges.push([i, subj2num[subj]]);
                  }
                }
              }
            }
            const matching = bipartiteMatching(ruleGrades.length, Object.keys(subj2num).length, edges);
            if (matching.length !== ruleGrades.length) {
              this.sendMessage(
                  rule, groupId,
                  {
                    key: 'DIFFERENT_SUBJECTS',
                    args: [ruleGrades, rule.mins],
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
    sendMessage(rule, groupId, message, gradeIds, correct) {
      for (const [i, j] of rule.subjects) {
        this.$refs.categories[i].$refs.subjects[j].setCorrectness(correct, rule.id, gradeIds);
      }
      if (rule.subjects.length === 1) {
        this.$refs.categories[rule.subjects[0][0]].$refs.subjects[rule.subjects[0][1]].addMessage(rule.id, groupId, message);
      } else {
        this.$refs.categories[rule.subjects[0][0]].addMessage(rule.id, groupId, message);
      }
    }
  }
}
</script>
