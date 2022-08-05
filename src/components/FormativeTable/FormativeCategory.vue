<template>
  <v-expansion-panel class="category-panel">
    <v-expansion-panel-header
        disable-icon-rotate
        :class="{ 'error-category': !correct() }"
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
        <v-icon v-if="correct()" color="teal">mdi-check</v-icon>
        <v-icon v-else color="error">mdi-alert-circle</v-icon>
      </template>
    </v-expansion-panel-header>
    <v-expansion-panel-content>
      <FormativeSubject
          v-for="(sub, i) in subjects"
          :key="gradeGroups.length * 100 + i"
          v-bind="sub"
          ref="subjects"
          :grade-groups="gradeGroups"
          :highlight="highlight"
          :class="{'display-none': sub.is_module}"
          :profile="profile"
          :num="i + 1"
          @validate="validate(i)"
          @change-name="changeName(i, $event)"
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
      messages: [],
      selfCorrect: true,
    }
  },
  methods: {
    correct() {
      return this.selfCorrect && (this.$refs.subjects || []).every(s => s.correct);
    },
    validate(i) {
      this.selfCorrect = true;
      this.messages = [];
      this.$emit('validate', i);
    },
    addMessages(...messages) {
      this.$nextTick(() => {
        this.messages.push(...messages);
      })
    },
    changeName(i, name) {
      Vue.set(this.subjects[i], 'newName', name);
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
