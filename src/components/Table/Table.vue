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
            :highlight="highlight"
            :plan="plan[i]"
            @validate="validate(i, $event)"
        />
      </v-expansion-panels>
    </div>
  </div>
</template>

<script>

import Category from "@/components/Table/Category";
import { unique, isEqual } from "@/gradeProcessing";
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
    highlight: { type: Array, default: () => [] },
  },
  data() {
    return {
      panels: [...Array(this.categories.length).keys()],
      messagesSubject: {},
      messagesCategory: {},
      incorrectSubjects: {},
      correctSubjects: {},
    }
  },
  methods: {
    validate(i, j) {
      const rules = this.rules.filter((r) =>
          i === undefined || r.subjects.some((s) => s[0] === i && s[1] === j)
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
            this.addGradeIds(rule, gradesCoordinates);
            const badKeys = [
              ...(rule.advanced && !advanced ? ['ADVANCED'] : []),
              ...(rule.min > value ? ['MIN'] : []),
              ...(rule.max !== undefined && rule.max < value ? ['MAX'] : [])
            ];
            if (badKeys.length > 0) {
              this.addMessage(
                  rule,
                  {
                    key: 'RULE_OBLIGATORY_UNIVERSAL',
                    args: [ruleGrades, ruleSubjects, badKeys, rule.min, rule.max],
                    grades: gradesCoordinates.map(g => g.toString())
                  },
                  gradesCoordinates
              );
            }
            // if (rule.advanced && !advanced)
            //   this.addMessage(rule, errorMessages.ALL_ADVANCED(ruleGrades, ruleSubjects), gradesCoordinates);
            // if (rule.min > value)
            //   this.addMessage(rule, errorMessages.RULE_TO_SMALL(ruleGrades, ruleSubjects, rule.min), gradesCoordinates);
            // if (rule.max !== undefined && rule.max < value)
            //   this.addMessage(rule, errorMessages.RULE_TO_BIG(ruleGrades, ruleSubjects, rule.max), gradesCoordinates);
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
            this.addGradeIds(rule, gradesCoordinates);
            const matching = bipartiteMatching(ruleGrades.length, Object.keys(subj2num).length, edges);
            if (matching.length !== ruleGrades.length) {
              this.addMessage(
                  rule,
                  {
                    key: 'DIFFERENT_SUBJECTS',
                    args: [ruleGrades, rule.mins],
                    grades: gradesCoordinates.map(g => g.toString())
                  },
                  gradesCoordinates
              )
            }
          }
        }
      }
      this.sendMessages();
    },
    addGradeIds(rule, gradeIds) {
      for (const sub of rule.subjects) {
        this.correctSubjects[sub] ||= [];
        this.correctSubjects[sub].push(...gradeIds);
      }
    },
    addMessage(rule, message, gradeIds) {
      if (rule.subjects.length === 1) {
        this.messagesSubject[rule.subjects[0]] ||= [];
        this.messagesSubject[rule.subjects[0]].push(message);
      } else {
        this.messagesCategory[rule.subjects[0][0]] ||= [];
        this.messagesCategory[rule.subjects[0][0]].push(message);
      }
      for (const sub of rule.subjects) {
        this.incorrectSubjects[sub] ||= [];
        this.incorrectSubjects[sub].push(...gradeIds);
      }
    },
    sendMessages() {
      for (const [subj, msgs] of Object.entries(this.messagesSubject)) {
        const [cat, sub] = subj.split(',').map(x => parseInt(x));
        this.$refs.categories[cat].$refs.subjects[sub].addMessages(...msgs);
      }
      for (const [cat, msgs] of Object.entries(this.messagesCategory)) {
        this.$refs.categories[cat].addMessages(...msgs);
      }
      for (const subj of Object.keys(this.correctSubjects)) {
        const [cat, sub] = subj.split(',').map(x => parseInt(x));
        const incorrect = (this.incorrectSubjects[subj] || []).filter(unique);
        const correct = this.correctSubjects[subj].filter(unique).filter(a => !incorrect.some(b => isEqual(a, b)));
        this.$refs.categories[cat].$refs.subjects[sub].setCorrectness(true, ...correct);
        this.$refs.categories[cat].$refs.subjects[sub].setCorrectness(false, ...incorrect);
      }
      this.messagesSubject = {};
      this.messagesCategory = {};
      this.correctSubjects = {};
      this.incorrectSubjects = {};
    },
  }
}
</script>
