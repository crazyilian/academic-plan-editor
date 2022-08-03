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
          :key="gradeGroups.length * 100 + i"
          v-bind="sub"
          ref="subjects"
          :grade-groups="gradeGroups"
          :plan="plan[i]"
          :class="{'display-none': sub.is_module}"
          @validate="validate"
      />
    </v-expansion-panel-content>
  </v-expansion-panel>
</template>

<script>

import Subject from "@/components/Table/Subject";
import Message from "@/components/Table/Message";
import errorMessages from "@/errorMessages";

export default {
  name: 'Category',
  components: { Message, Subject },
  props: {
    'id': { type: Number, default: -1 },
    'name': { type: String, default: "" },
    'subjects': { type: Array, default: () => [] },
    'gradeGroups': { type: Array, default: () => [] },
    'plan': { type: Array, default: () => [] }
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

      for (const [gi] of this.gradeGroups.entries()) {
        let includedCount = 0;
        for (let i = 0; i < this.subjects.length; ++i) {
          if (this.subjects[i].is_module) {
            continue;
          }
          const sub = this.$refs.subjects[i];
          if (sub.getSumHoursGroup(gi) > 0)
            includedCount += 1;
          this.correct &= sub.correct;
        }
        if (includedCount === 0 && this.subjects.length > 1) {
          this.messages.push(errorMessages.ONE_SUBJ_PER_CATEG)
          this.correct = false;
        }
      }
    }
  }
}
</script>

<style>

/* correct category styles */

.v-expansion-panels.v-expansion-panels--focusable .category:not(.error-category).v-expansion-panel-header--active:hover::before {
  opacity: 0.08 !important;
}

.v-expansion-panels.v-expansion-panels--focusable .category:not(.error-category).v-expansion-panel-header--active::before {
  opacity: 0.0 !important;
}

.category:not(.error-category) {
  background-color: #efe;
}


/* .error-category styles */

.v-expansion-panels.v-expansion-panels--focusable .error-category.v-expansion-panel-header--active:hover::before {
  opacity: 0.08 !important;
}

.v-expansion-panels.v-expansion-panels--focusable .error-category.v-expansion-panel-header--active::before {
  opacity: 0.0 !important;
}

.error-category {
  background-color: #fee;
}

/* other */

.v-expansion-panel-content__wrap {
  padding: 8px 8px 12px 16px !important;
}

.v-expansion-panel--active > .v-expansion-panel-header {
  min-height: 48px !important;
}

</style>
