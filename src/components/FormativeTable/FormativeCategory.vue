<template>
  <v-expansion-panel class="category-panel">
    <v-expansion-panel-header
        disable-icon-rotate
        :class="{ 'error-category': !correct }"
        class="category"
    >
      <div style="display: flex; justify-content: space-between; align-items: center; width: calc(100% - 24px)">
        <div style="width: 38%; display: inline-block; word-wrap: break-word" class="subject-name">{{ name }}</div>
        <Message
            container-style="width: 62%; margin-left: 12px; margin-right: 32px; min-width: 0"
            :messages="messages"
        />
      </div>
      <template #actions>
        <v-icon v-if="correct" color="teal">mdi-check</v-icon>
        <v-icon v-else color="error">mdi-alert-circle</v-icon>
      </template>
    </v-expansion-panel-header>
    <v-expansion-panel-content>
      <FormativeSubject
          v-for="(sub, i) in subjects"
          :key="gradeGroups.length + '|' + i"
          v-bind="sub"
          ref="subjects"
          :grade-groups="gradeGroups"
          :highlight="highlight"
          :profile="profile"
          :num="i + 1"
          @validate="validate(i)"
          @change-name="changeName(i, $event)"
          @set-correct="setCorrect(i, $event)"
      />
    </v-expansion-panel-content>
  </v-expansion-panel>
</template>

<script>

import Message from "@/components/Table/Message";
import FormativeSubject from "@/components/FormativeTable/FormativeSubject";
import Vue from "vue";

export default {
  name: 'FormativeCategory',
  components: { FormativeSubject, Message },
  props: {
    name: { type: String, default: "" },
    subjects: { type: Array, default: () => [] },
    gradeGroups: { type: Array, default: () => [] },
    profile: { type: Array, default: () => [] },
    highlight: { type: Array, default: () => [] }
  },
  data() {
    return {
      messages: {},
      subjectCorrect: this.subjects.map(() => true),
    }
  },
  computed: {
    correct() {
      return this.subjectCorrect.every(s => s);
    },
  },
  methods: {
    setCorrect(i, val) {
      Vue.set(this.subjectCorrect, i, val);
    },
    validate(i) {
      this.$emit('validate', i);
    },
    addMessage(ruleId, groupId, message) {
      const key = JSON.stringify([ruleId, groupId]);
      if (message === undefined)
        Vue.delete(this.messages, key);
      else
        Vue.set(this.messages, key, message);
    },
    changeName(i, name) {
      Vue.set(this.subjects[i], 'newName', name);
    }
  }
}
</script>

<style>

</style>
