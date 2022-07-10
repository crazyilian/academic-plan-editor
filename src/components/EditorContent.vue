<template>
  <div style="min-width: 0; width: 100%; height: 100%; display: flex">
    <div
        class="px-2 py-0"
        style="min-width: 0; width: 66%; display: flex; flex-direction: column; height: 100%; flex-grow: 1"
    >
      <div class="px-4" style="width: 100%; display: flex; flex-direction: column; gap: 8px">
        <h3 style="word-wrap: break-word">{{ template.config.name }}</h3>
        <div style="display: flex; justify-content: space-between">
          <div style="display: flex; align-items: flex-end" class="pb-3">
            <v-btn
                class="switch-btn"
                color="#525252"
                dark
                depressed
                @click="pageNum = 1 - pageNum"
            >
              <span>{{ pageNum === 0 ? 'Обязательная часть' : 'Формируемая часть' }}</span>
            </v-btn>
          </div>
          <GradeTitle
              style="margin-right: 24px"
              :grades="template.grades"
              @highlight-grade="highlightGrade"
          />
        </div>
      </div>
      <v-window v-model="pageNum" style="width: 100%; height: 100%">
        <v-window-item style="width: 100%; height: 100%">
          <Table
              ref="table"
              :categories="template.categories"
              :grades="template.grades"
              :grade-highlight="gradeHighlight"
              :plan="obligatoryPlan"
          />
        </v-window-item>
        <v-window-item style="width: 100%; height: 100%">
          <FormativeTable
              ref="formativeTable"
              :grades="template.grades"
              :grade-highlight="gradeHighlight"
              :plan="formativePlan"
          />
        </v-window-item>
      </v-window>
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
          :weeknum="weeknum"
      />
    </div>
  </div>
</template>

<script>

import Table from "@/components/Table/Table";
import GradeTitle from "@/components/GradeTitle";
import Vue from "vue";
import GeneralTable from "@/components/GeneralTable/GeneralTable";
import FormativeTable from "@/components/FormativeTable/FormativeTable";

export default {
  name: 'EditorContent',
  components: {
    FormativeTable,
    GeneralTable,
    GradeTitle,
    Table
  },

  props: {
    template: { type: Object, default: () => ({}) },
    obligatoryPlan: { type: Array, default: () => [] },
    formativePlan: { type: Object, default: () => ({}) },
    weeknum: { type: Array, default: () => [] },
  },

  data() {
    const n = this.template.grades.length;
    if (Object.keys(this.formativePlan).length === 0) {
      for (const [i, category] of this.template.categories.entries()) {
        Vue.set(this.obligatoryPlan, i,
            Array.from(category.subjects, () => Array(n).fill(0))
        );
      }
      Vue.set(this.formativePlan, 'hours', Array(n).fill(0));
      Vue.set(this.formativePlan, 'subjects', []);
      for (let i = 0; i < n; ++i) {
        Vue.set(this.weeknum, i, null);
      }
    }
    return {
      gradeHighlight: Array(n).fill(false),
      pageNum: 0,
    };
  },
  methods: {
    highlightGrade(i, flag) {
      Vue.set(this.gradeHighlight, i, flag);
    },
  }
};
</script>
<style>

.switch-btn {
  text-transform: none !important;
  width: 100% !important;
  font-size: 10pt !important;
  font-weight: normal !important;
  height: auto !important;
  padding: 4px 8px !important;
  min-height: 32px;
}

.switch-btn > span {
  white-space: break-spaces !important;
  word-wrap: break-word !important;
  width: 100%;
}

.switch-btn > span > span {
  width: 100%;
}

</style>
