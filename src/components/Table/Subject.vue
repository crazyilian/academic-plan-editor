<template>
  <div
      style="display: flex; justify-content: space-between; align-items: center; width: 100%"
      :class="{ 'error-subject': !correct }" class="subject"
  >
    <v-tooltip bottom :disabled="!required" :open-delay="500">
      <template #activator="{ on, attrs} ">
        <div v-bind="attrs" v-on="on">
          <v-checkbox
              v-model="checkbox"
              :disabled="required"
              class="pr-4 py-0 ma-0"
              :color="!correct ? 'red' : 'teal'"
              @change="checkboxChange"
          />
        </div>
      </template>
      <div class="pa-2" style="text-align: center">Обязательный<br>предмет</div>
    </v-tooltip>

    <div style="min-width: 0; width: 40%; display: inline-block; word-wrap: break-word" class="subject-name">{{ name }}</div>
    <Message container-style="width: 60%; margin-left: 24px; margin-right: 24px; min-width: 20px" :messages="messages"/>
    <Counter
        v-for="(grade, i) in grades"
        :id="i"
        :key="i"
        ref="counters"
        :correct="countersCorrect[i]"
        :highlight="gradeHighlight[i]"
        @input="counterChange(i)"
    />
  </div>
</template>

<script>

import Counter from "@/components/Counter";
import Message from "@/components/Table/Message";
import errorMessages from "@/errorMessages";
import Vue from "vue";

export default {
  name: 'Subject',
  components: { Message, Counter },
  props: {
    'id': { type: Number, default: -1 },
    'name': { type: String, default: "" },
    'required': { type: Boolean, default: false },
    'grades': { type: Array, default: () => [] },
    'gradeHighlight': { type: Array, default: () => [] },
    'plan': { type: Array, default: () => [] }
  },
  data() {
    return {
      checkbox: this.required,
      messages: [],
      correct: false,
      countersCorrect: Array(this.grades.length).fill(true),
    }
  },
  mounted() {
    this.validate();
  },
  methods: {
    getSumHours() {
      return this.plan.reduce((r, e) => r + e, 0)
    },
    counterChange(i) {
      // FIXME: do emits, not mutations of props. But it somehow works without warnings :)
      Vue.set(this.plan, i, this.$refs.counters[i].value)
      const sumHours = this.getSumHours();
      this.checkbox = (sumHours > 0) || this.required;
      this.validate();
    },
    checkboxChange() {
      if (!this.checkbox) {
        for (let i = 0; i < this.grades.length; ++i)
          this.$refs.counters[i].reset();
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

.subject:not(.error-subject) .v-input--checkbox.v-input--is-disabled i {
  color: #9bc99b !important;
}

.error-subject .subject-name {
  color: red;
}

</style>
