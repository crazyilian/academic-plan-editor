<template>
  <v-container
      class="px-4 py-0"
      style="min-width: 0; max-width: 100%; display: flex; flex-direction: column; height: 100%"
  >
    <div style="display: flex; justify-content: space-between">
      <h3 class="px-2">{{ template.name }}</h3>
      <GradeTitle style="margin-right: 40px" :grades="template.grades" @highlight-grade="highlightGrade"/>
    </div>
    <Table :categories="template.categories" :grades="template.grades" :grade-highlight="gradeHighlight"/>
  </v-container>
</template>

<script>

import Table from "@/components/Table";
import GradeTitle from "@/components/GradeTitle";
import Vue from "vue";

export default {
  name: 'EditorContent',
  components: {
    GradeTitle,
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
