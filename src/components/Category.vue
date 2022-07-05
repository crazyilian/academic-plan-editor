<template>
  <v-expansion-panel>
    <v-expansion-panel-header
        disable-icon-rotate
        :class="{
                'error-category': !correct,
                'correct-category': correct
            }"
    >
      <div style="display: flex; justify-content: space-between; align-items: center; width: calc(100% - 24px)">
        <div style="width: 43%; display: inline-block; word-wrap: break-word" class="subject-name">{{ name }}</div>
        <Message container-style="margin-left: 12px; margin-right: 32px; min-width: 0" :messages="messages"/>
        <div style="">{{ comment }}</div>
      </div>
      <template #actions>
        <v-icon v-if="correct" color="teal">mdi-check</v-icon>
        <v-icon v-else color="error">mdi-alert-circle</v-icon>
      </template>
    </v-expansion-panel-header>
    <v-expansion-panel-content>
      <Subject
          v-for="(sub, i) in subjects"
          :id="i"
          :key="i"
          v-bind="sub"
          ref="subjects"
          :grades="grades"
          :grade-highlight="gradeHighlight"
          @validate="validate"
      />
    </v-expansion-panel-content>
  </v-expansion-panel>
</template>

<script>

import Subject from "@/components/Subject";
import Message from "@/components/Message";
import errorMessages from "@/errorMessages";

export default {
  name: 'Category',
  components: { Message, Subject },
  props: {
    'id': { type: Number, default: -1 },
    'name': { type: String, default: "" },
    'subjects': { type: Array, default: () => [] },
    'grades': { type: Array, default: () => [] },
    'gradeHighlight': { type: Array, default: () => [] }
  },
  data() {
    return {
      header: this.name,
      messages: [],
      comment: "",
      correct: false
    }
  },
  methods: {
    validate() {
      this.correct = true;
      this.messages = [];
      let includedCount = 0;
      for (let i = 0; i < this.subjects.length; ++i) {
        const sub = this.$refs['subjects'][i];
        if (sub.checkbox)
          includedCount += 1;
        this.correct &= sub.correct;
        // this.messages.push(...sub.messages)
      }
      this.messages = [...new Set(this.messages)];
      if (includedCount === 0 && this.subjects.length > 1) {
        this.messages.push(errorMessages.ONE_SUBJ_PER_CATEG)
        this.correct = false;
      }
    }
  }
}
</script>

<style>

/* .correct-category styles */

.v-expansion-panels.v-expansion-panels--focusable .correct-category.v-expansion-panel-header--active:hover::before {
  opacity: 0.04 !important;
}

.v-expansion-panels.v-expansion-panels--focusable .correct-category.v-expansion-panel-header--active::before {
  opacity: 0.0 !important;
}

.correct-category {
  background-color: #efe;
}


/* .error-category styles */

.v-expansion-panels.v-expansion-panels--focusable .error-category.v-expansion-panel-header--active:hover::before {
  opacity: 0.04 !important;
}

.v-expansion-panels.v-expansion-panels--focusable .error-category.v-expansion-panel-header--active::before {
  opacity: 0.0 !important;
}

.error-category {
  background-color: #fee;
}

/* other */

.v-expansion-panel-content__wrap {
  padding-bottom: 12px !important;
  padding-top: 8px !important;
}

.v-expansion-panel--active > .v-expansion-panel-header {
  min-height: 48px !important;
}

</style>