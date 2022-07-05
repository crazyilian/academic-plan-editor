<template>
  <div style="min-width: 0; width: 100%; height: 100%; display: flex">
    <div
        class="px-4 py-0"
        style="min-width: 0; width: 73%; display: flex; flex-direction: column; height: 100%; flex-grow: 1"
    >
      <div style="display: flex; justify-content: space-between">
        <h3 class="px-2">{{ template.name }}</h3>
        <GradeTitle
            style="margin-right: 40px"
            :grades="template.grades"
            @highlight-grade="highlightGrade"
        />
      </div>
      <Table
          ref="table"
          :categories="template.categories"
          :grades="template.grades"
          :grade-highlight="gradeHighlight"
          :plan="plan"
      />
      <!--            <div style="width: 100%; height: 100%; background-color: red"/>-->
    </div>
    <div style="background-color: black; height: 100%; width: 3px" class="rounded-pill"/>
    <div style="height: 100%; width: 27%">
      <GeneralTable :plan="plan"/>
    </div>
  </div>
</template>

<script>

import Table from "@/components/Table";
import GradeTitle from "@/components/GradeTitle";
import Vue from "vue";
import GeneralTable from "@/components/GeneralTable";

export default {
  name: 'EditorContent',
  components: {
    GeneralTable,
    GradeTitle,
    Table
  },

  props: {
    template: { type: Object, default: () => {} }
  },

  data() {
    const plan = [];
    for (const category of this.template.categories) {
      const categoryData = [];
      // eslint-disable-next-line no-unused-vars
      for (const subject of category.subjects) {
        const subjectData = Array(this.template.grades.length).fill(0);
        categoryData.push(subjectData);
      }
      plan.push(categoryData);
    }
    return {
      gradeHighlight: Array(this.template.grades.length).fill(false),
      plan: plan,
    };
  },
  methods: {
    highlightGrade(i, flag) {
      Vue.set(this.gradeHighlight, i, flag);
    },
  }
};
</script>
