<template>
  <div class="general-row">
    <div class="general-row-name">{{ name }}</div>
    <div style="display: flex; flex-wrap: wrap;">
      <template v-for="(group, i) in gradeGroups">
        <div v-for="(grade, j) in group" :key="i * 100 + j">
          <Counter
              ref="counters"
              :start-value="values[i][j]"
              :highlight="gradeGroups[i][j].highlight"
              :correct="countersCorrect[i][j]"
              :disabled="!edit"
              :null-available="nullAvailable"
              :max="99"
              @input="counterChange(i, j, $event)"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<script>

import errorMessages from "@/errorMessages";
import Vue from "vue";
import Counter from "@/components/Counter";

export default {
  name: 'Summary',
  components: { Counter },
  props: {
    'id': { type: Number, default: -1 },
    'name': { type: String, default: "" },
    'errorName': { type: String, default: "" },
    'gradeGroups': { type: Array, default: () => [] },
    'values': { type: Array, default: () => [] },
    'edit': { type: Boolean, default: false },
    'mins': { type: Array, default: undefined },
    'maxs': { type: Array, default: undefined },
    'nullAvailable': { type: Boolean, default: false },
    'oninput': { type: Function, default: undefined }
  },
  data() {
    return {
      messages: [],
      correct: false,
      countersCorrect: this.gradeGroups.map((group) => Array(group.length).fill(true)),
    }
  },
  mounted() {
    this.validate();
  },
  methods: {
    counterChange(i, j, val) {
      if (this.oninput === undefined) {
        Vue.set(this.values[i], j, val)
      } else {
        this.oninput(i, j, val);
      }
      this.$nextTick(this.validate);
    },
    validate() {
      this.correct = true;
      this.countersCorrect.forEach((group) => group.forEach((v, i) => Vue.set(group, i, true)));
      this.messages = [];
      for (const [i, valueGroup] of this.values.entries()) {
        for (const [j, value] of valueGroup.entries()) {
          let bad = false;
          if (value === null) {
            bad = true;
            this.messages.push(errorMessages.SUMMARY_NULL(this.errorName, this.gradeGroups[i][j].name))
          } else if (this.mins !== undefined && value < this.mins[i][j]) {
            bad = true;
            this.messages.push(errorMessages.SUMMARY_TOO_SMALL(this.errorName, this.gradeGroups[i][j].name))
          } else if (this.maxs !== undefined && value > this.maxs[i][j]) {
            bad = true;
            this.messages.push(errorMessages.SUMMARY_TOO_BIG(this.errorName, this.gradeGroups[i][j].name))
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
