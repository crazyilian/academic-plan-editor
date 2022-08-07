<template>
  <div class="general-row">
    <div class="general-row-name">{{ name }}</div>
    <div style="display: flex; flex-wrap: wrap; flex-direction: row-reverse">
      <div v-for="(group, i) in gradeGroups" :key="group[0].id" style="display: flex">
        <div v-for="(grade, j) in group" :key="grade.id">
          <Counter
              ref="counters"
              :start-value="values[i][j]"
              :correct="countersCorrect[i][j]"
              :disabled="!edit"
              :null-available="nullAvailable"
              :max="99"
              :hide="(hide[i] || [])[j]"
              @input="counterChange(i, j, $event)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import Vue from "vue";
import Counter from "@/components/Counter";
import { fillShape2 } from "@/gradeProcessing";

export default {
  name: 'Summary',
  components: { Counter },
  props: {
    id: { type: Number, default: -1 },
    name: { type: String, default: "" },
    errorName: { type: String, default: "" },
    gradeGroups: { type: Array, default: () => [] },
    values: { type: Array, default: () => [] },
    edit: { type: Boolean, default: false },
    mins: { type: Array, default: undefined },
    maxs: { type: Array, default: undefined },
    nullAvailable: { type: Boolean, default: false },
    onedit: { type: Function, default: undefined },
    hide: { type: Array, default: () => [] }
  },
  data() {
    return {
      messages: [],
      correct: false,
      countersCorrect: fillShape2(this.gradeGroups, () => true),
    }
  },
  watch: {
    values() {
      this.validate();
    }
  },
  mounted() {
    this.validate();
  },
  methods: {
    counterChange(i, j, val) {
      if (this.onedit === undefined) {
        Vue.set(this.values[i], j, val)
      } else {
        this.onedit(i, j, val);
      }
      this.$nextTick(this.validate);
    },
    validate() {
      this.correct = true;
      this.countersCorrect.forEach((group) => group.forEach((v, i) => Vue.set(group, i, true)));
      this.messages = [];
      for (const [i, valueGroup] of this.values.entries()) {
        const curMessages = [
          { id: -100 - this.id, key: 'SUMMARY_NULL', gradeIds: [] },
          { id: -200 - this.id, key: 'SUMMARY_TOO_SMALL', gradeIds: [] },
          { id: -300 - this.id, key: 'SUMMARY_TOO_BIG', gradeIds: [] },
        ];
        for (const [j, value] of valueGroup.entries()) {
          let bad = false;
          if (value === null) {
            bad = true;
            curMessages[0].gradeIds.push(j);
          } else if (this.mins !== undefined && value < this.mins[i][j]) {
            bad = true;
            curMessages[1].gradeIds.push(j);
          } else if (this.maxs !== undefined && value > this.maxs[i][j]) {
            bad = true;
            curMessages[2].gradeIds.push(j);
          }
          if (bad) {
            this.correct = false;
            Vue.set(this.countersCorrect[i], j, false);
          }
        }
        for (const error of curMessages) {
          if (error.gradeIds.length > 0) {
            const grades = error.gradeIds.map(j => this.gradeGroups[i][j]);
            this.messages.push([error.id, i, { key: error.key, args: [this.errorName, grades] }]);
          } else {
            this.messages.push([error.id, i, undefined]);
          }
        }
      }
      this.$emit('validate');
    },
  }
}
</script>

<style>

.general-row {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  flex-wrap: wrap;
  min-height: 32px;
}

.general-row-name {
  flex-grow: 1;
}

</style>
