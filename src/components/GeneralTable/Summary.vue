<template>
  <div class="general-row">
    <div class="general-row-name">{{ name }}</div>
    <div style=" display: flex; flex-wrap: wrap;">
      <div v-for="(grade, i) in grades" :key="i">
        <Counter
            ref="counters"
            :start-value="values[i]"
            :highlight="gradeHighlight[i]"
            :correct="countersCorrect[i]"
            :disabled="!edit"
            :null-available="nullAvailable"
            :max="99"
            @input="counterChange(i)"
        />
      </div>
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
    'grades': { type: Array, default: () => [] },
    'gradeHighlight': { type: Array, default: () => [] },
    'values': { type: Array, default: () => [] },
    'edit': { type: Boolean, default: false },
    'mins': { type: Array, default: () => [] },
    'maxs': { type: Array, default: () => [] },
    'nullAvailable': { type: Boolean, default: false },
  },
  data() {
    return {
      messages: [],
      correct: false,
      countersCorrect: Array(this.grades.length).fill(true),
    }
  },
  mounted() {
    this.validate();
    console.log(this.name);
    console.log(this.mins);
    console.log(this.maxs);
  },
  methods: {
    counterChange(i) {
      // FIXME: do emits, not mutations of props. But it somehow works without warnings :)
      Vue.set(this.values, i, this.$refs.counters[i].value)
      this.validate();
    },
    validate() {
      this.correct = true;
      for (const i of this.countersCorrect.keys()) {
        Vue.set(this.countersCorrect, i, true);
      }
      this.messages = [];
      for (const [i, value] of this.values.entries()) {
        let bad = false;
        if (value === null) {
          bad = true;
          this.messages.push(errorMessages.SUMMARY_NULL(this.errorName, this.grades[i].name))
        } else if (this.mins.length > 0 && value < this.mins[i]) {
          bad = true;
          this.messages.push(errorMessages.SUMMARY_TOO_SMALL(this.errorName, this.grades[i].name))
        } else if (this.maxs.length > 0 && value > this.maxs[i]) {
          bad = true;
          this.messages.push(errorMessages.SUMMARY_TOO_BIG(this.errorName, this.grades[i].name))
        }
        if (bad) {
          this.correct = false;
          Vue.set(this.countersCorrect, i, false);
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
