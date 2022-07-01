<template>
  <div
      style="display: flex; justify-content: space-between; align-items: center; width: 100%"
      :class="{
        'correct-subject': correct,
        'error-subject': !correct
      }"
  >
    <v-checkbox
        v-model="checkbox"
        :disabled="required"
        class="pr-4 py-0 ma-0"
        :color="!correct ? 'red' : 'teal'"
        @change="checkboxChange"
    />
      <div style="width: 20%; display: inline-block" class="subject-name">{{ name }}</div>
      <Message container-style="width: 80%; margin-left: 24px; margin-right: 24px; min-width: 0" :messages="messages"/>
    <Counter
        v-for="(grade, i) in grades"
        :id="i"
        :key="i"
        ref="counter"
        :correct="countersCorrect[i]"
        @input="counterChange"
    />
  </div>
</template>

<script>

import Counter from "@/components/Counter";
import Message from "@/components/Message";
import errorMessages from "@/errorMessages";

export default {
  name: 'Subject',
  components: { Message, Counter },
  props: {
    'id': { type: Number, default: -1 },
    'name': { type: String, default: "" },
    'required': { type: Boolean, default: false },
    'grades': { type: Array, default: () => [] },
  },
  data() {
    return {
      checkbox: this.required,
      messages: [],
      correct: true,
      countersCorrect: Array(this.grades.length).fill(true),
    }
  },
  mounted() {
    this.validate();
  },
  methods: {
    getSumHours() {
      let sumHours = 0;
      for (let i = 0; i < this.grades.length; ++i)
        sumHours += this.$refs.counter[i].value;
      return sumHours;
    },
    counterChange() {
      const sumHours = this.getSumHours();
      this.checkbox = (sumHours > 0) || this.required;
      this.validate();
    },
    checkboxChange() {
      if (!this.checkbox) {
        for (let i = 0; i < this.grades.length; ++i)
          this.$refs.counter[i].reset();
      }
      this.validate();
    },
    validate() {
      this.correct = true;
      this.countersCorrect.fill(true);
      this.messages = [];

      const sumHours = this.getSumHours();
      if (this.checkbox && sumHours === 0) {
        this.messages.push(errorMessages.NO_ZERO_HOURS);
        this.countersCorrect.fill(false);
        this.correct = false;
      }

      this.$emit('validate');
    },
  }
}
</script>

<style>

/* checkbox styles */

.v-input--checkbox .v-messages {
  display: none;
}

.v-input--checkbox .v-input--selection-controls__ripple, .v-input--checkbox .v-input__slot, .v-input--checkbox .v-input--selection-controls__input {
  margin: 0 !important;
}

.v-input--checkbox .v-input--selection-controls__ripple {
  left: -5px !important;
  top: -5px !important;
}

/* other */

.error-subject .v-input--checkbox i {
  color: red !important;
}

.error-subject .v-input--checkbox.v-input--is-disabled i {
  color: #d39292 !important;
}

.correct-subject .v-input--checkbox.v-input--is-disabled i {
  color: #9bc99b !important;
}

.error-subject .subject-name {
  color: red;
}

</style>