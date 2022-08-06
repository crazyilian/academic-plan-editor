<template>
  <div class="general-row">
    <div class="general-row-name">{{ name }}</div>
    <div style="display: flex; flex-wrap: wrap; flex-direction: row-reverse">
      <div v-for="(group, i) in gradeGroups" :key="group[0].id" style="display: flex">
        <div v-for="(grade, j) in group" :key="grade.id">
          <Counter
              ref="counters"
              :start-value="values[i][j]"
              :highlight="highlight[i][j]"
              :correct="countersCorrect[i][j]"
              :disabled="!edit"
              :null-available="nullAvailable"
              :max="99"
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
    name: { type: String, default: "" },
    errorName: { type: String, default: "" },
    gradeGroups: { type: Array, default: () => [] },
    values: { type: Array, default: () => [] },
    edit: { type: Boolean, default: false },
    mins: { type: Array, default: undefined },
    maxs: { type: Array, default: undefined },
    nullAvailable: { type: Boolean, default: false },
    onedit: { type: Function, default: undefined },
    highlight: { type: Array, default: () => [] }
  },
  data() {
    return {
      messages: [],
      correct: false,
      countersCorrect: fillShape2(this.gradeGroups, () => true),
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
      for (const [i, valueGroup] of [...this.values.entries()].reverse()) {
        for (const [j, value] of valueGroup.entries()) {
          let bad = false;
          if (value === null) {
            bad = true;
            this.messages.push([-1, i, { key: 'SUMMARY_NULL', args: [this.errorName, this.gradeGroups[i][j].name] }])
          } else if (this.mins !== undefined && value < this.mins[i][j]) {
            bad = true;
            this.messages.push([-2, i, { key: 'SUMMARY_TOO_SMALL', args: [this.errorName, this.gradeGroups[i][j].name] }])
          } else if (this.maxs !== undefined && value > this.maxs[i][j]) {
            bad = true;
            this.messages.push([-3, i, { key: 'SUMMARY_TOO_BIG', args: [this.errorName, this.gradeGroups[i][j].name] }])
          }
          if (bad) {
            this.correct = false;
            Vue.set(this.countersCorrect[i], j, false);
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
}

.general-row-name {
  flex-grow: 1;
}

</style>
