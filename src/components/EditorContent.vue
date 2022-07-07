<template>
  <div style="min-width: 0; width: 100%; height: 100%; display: flex">
    <div
        class="px-2 py-0"
        style="min-width: 0; width: 66%; display: flex; flex-direction: column; height: 100%; flex-grow: 1"
    >
      <div style="display: flex; justify-content: space-between">
        <h3 class="px-4">{{ template.config.name }}</h3>
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
          :plan="obligatoryPlan"
      />
    </div>
    <!--        <div style="height: 100%; width: 35%" class="pl-1">-->
    <div style="height: 100%; width: 34%; border-left: dashed 2px gray;" class="pl-1">
      <GeneralTable
          ref="generalTable"
          :obligatory-plan="obligatoryPlan"
          :formative-plan="formativePlan"
          :grade-highlight="gradeHighlight"
          :grades="template.grades"
          :config="template.config"
      />
    </div>
  </div>
</template>

<script>

import Table from "@/components/Table/Table";
import GradeTitle from "@/components/GradeTitle";
import Vue from "vue";
import GeneralTable from "@/components/GeneralTable/GeneralTable";

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
      plan.push(Array.from(category.subjects, () => Array(this.template.grades.length).fill(0)));
    }
    return {
      gradeHighlight: Array(this.template.grades.length).fill(false),
      obligatoryPlan: plan,
      formativePlan: []
    };
  },
  methods: {
    highlightGrade(i, flag) {
      Vue.set(this.gradeHighlight, i, flag);
    },
  }
};
</script>
