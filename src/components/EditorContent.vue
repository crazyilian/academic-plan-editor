<template>
  <v-container
      class="px-4 py-0"
      style="min-width: 0; max-width: 100%; display: flex; flex-direction: column; height: 100%"
  >
    <div style="display: flex; justify-content: space-between">
      <h3 class="px-2">{{ template.name }}</h3>
      <div style="margin-right: 40px; display: flex;">
        <div
            v-for="(grade, i) in template.grades"
            :key="i"
            class="pb-3"
            style="width: 48px; display: flex; align-items: flex-end; justify-content: center"
            @mouseover="highlightGrade(i, true)"
            @mouseleave="highlightGrade(i, false)"
        >
          <div class="grade-name">{{ grade.name }}</div>
        </div>
      </div>
    </div>
    <Table :categories="template.categories" :grades="template.grades" :grade-highlight="gradeHighlight"/>
  </v-container>
</template>

<script>

import Table from "@/components/Table";
import Vue from "vue";

export default {
  name: 'EditorContent',
  components: {
    Table
  },

  props: {
    template: { type: Object, default: () => {} }
  },

  data() {
    return {
      gradeHighlight: Array(this.template.grades.length).fill(false)
    };
  },
  methods: {
    highlightGrade(i, flag) {
      Vue.set(this.gradeHighlight, i, flag);
    }
  }
};
</script>
<style>

.grade-name {
  font-weight: bold;
  font-size: 11pt;
  word-wrap: break-word;
  white-space: pre-line;
  text-align: center;
  width: 100%;
}

</style>
