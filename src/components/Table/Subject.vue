<template>
  <div
      style="display: flex; justify-content: space-between; align-items: center; width: 100%"
      :class="{ 'error-subject': !correct }" class="subject"
  >
    <v-tooltip bottom :open-delay="500">
      <template #activator="{ on, attrs} ">
        <div v-bind="attrs" v-on="on">
          <v-checkbox
              v-model="checkbox"
              :disabled="true"
              class="pr-4 py-0 ma-0 checkbox-subj"
              :color="!correct ? 'red' : 'teal'"
          />
        </div>
      </template>
      <div v-if="required" class="pa-2" style="text-align: center">Обязательный<br>предмет</div>
      <div v-else class="pa-2" style="text-align: center">Не обязательный<br>предмет</div>
    </v-tooltip>

    <div style="min-width: 0; width: 40%; display: inline-block; word-wrap: break-word" class="subject-name">
      {{ name }}
    </div>
    <Message container-style="width: 60%; margin-left: 24px; margin-right: 24px; min-width: 20px" :messages="messages"/>
    <div style="display: flex; flex-direction: row-reverse">
      <div v-for="(group, i) in gradeGroups" :key="group[0].id" style="display: flex">
        <Counter
            v-for="(grade, j) in group"
            :key="grade.id"
            ref="counters"
            :correct="countersCorrect[i][j]"
            :highlight="grade.highlight"
            :start-value="plan[i][j].value"
            :checkbox="plan[i][j].advanced"
            :max="99"
            :show-checkbox="can_advanced"
            :show-label="can_advanced"
            @input="counterChange(i, j, $event)"
            @checkbox-change="setAdvanced(i, j, $event)"
        />
      </div>
    </div>
  </div>
</template>

<script>

import Counter from "@/components/Counter";
import Message from "@/components/Table/Message";
import errorMessages from "@/errorMessages";
import Vue from "vue";
import { fillShape2 } from "@/gradeProcessing";

export default {
  name: 'Subject',
  components: { Message, Counter },
  props: {
    'id': { type: Number, default: -1 },
    'name': { type: String, default: "" },
    'required': { type: Boolean, default: false },
    'gradeGroups': { type: Array, default: () => [] },
    'plan': { type: Array, default: () => [] },
    // eslint-disable-next-line vue/prop-name-casing
    'can_advanced': { type: Boolean, default: true },
  },
  data() {
    return {
      checkbox: this.required,
      messages: [],
      correct: false,
      countersCorrect: fillShape2(this.gradeGroups, () => true),
    }
  },
  watch: {
    gradeGroups: {
      handler() {
        this.countersCorrect = fillShape2(this.gradeGroups, () => true);
        this.validate();
      },
      deep: true
    },
  },
  mounted() {
    this.validate();
  },
  methods: {
    getSumHoursGroup(i) {
      return this.plan[i].reduce((r, e) => r + e.value, 0);
    },
    counterChange(i, j, value) {
      Vue.set(this.plan[i][j], 'value', value)
      this.validate();
    },
    setAdvanced(i, j, adv) {
      Vue.set(this.plan[i][j], 'advanced', Boolean(adv));
    },
    validate() {
      this.correct = true;
      this.countersCorrect.forEach((group) => group.forEach((v, i) => Vue.set(group, i, true)));
      this.messages = [];

      for (const [i] of this.gradeGroups.entries()) {
        const sumHours = this.getSumHoursGroup(i);
        if (this.required && sumHours === 0) {
          this.messages.push(errorMessages.NO_ZERO_HOURS);
          this.countersCorrect[i].forEach((v, j) => Vue.set(this.countersCorrect[i], j, false))
          this.correct = false;
        }
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

.error-subject .checkbox-subj i {
  color: red !important;
}

.error-subject .checkbox-subj.v-input--is-disabled i {
  color: #d39292 !important;
}

.subject:not(.error-subject) .checkbox-subj.v-input--is-disabled i {
  color: #9bc99b !important;
}

.error-subject .subject-name {
  color: red;
}

</style>
