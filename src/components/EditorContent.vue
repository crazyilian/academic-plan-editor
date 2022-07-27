<template>
  <div style="min-width: 0; width: 100%; height: 100%; display: flex">
    <div
        class="px-2 py-0"
        style="min-width: 0; width: 100%; display: flex; flex-direction: column; height: 100%; flex-grow: 1"
    >
      <div class="pl-2 ml-2 pr-4" style="width: calc(100% - 8px); display: flex; flex-direction: column; gap: 8px; border-bottom: solid thin gray">
        <div class="fullname-container">
          <EditableText
              class="hover-background"
              :value="template.config.title"
              :editing="editingFullname"
              @change="changeFullname"
              @span-click="editFullname"
          />
          <div style="margin-left: 8px; margin-right: -32px">
            <v-btn
                class="rounded-r-0 px-2"
                style="min-width: 0"
                :color="generalTableCorrect() ? 'teal' : 'error'"
                dark
                @click="switchGeneralTable"
            >
              <div style="text-transform: none" class="pr-2">Сводка</div>
              <v-icon v-if="generalTableCorrect()">mdi-check</v-icon>
              <v-icon v-else>mdi-alert-circle</v-icon>
            </v-btn>
          </div>
        </div>
        <div style="display: flex; justify-content: space-between">
          <div class="pb-3 switch-btn-container">
            <v-btn
                class="switch-btn"
                color="#525252"
                dark
                depressed
                :outlined="pageNum === 0"
                @click="pageNum = 0"
            >
              <span>Обязательная часть</span>
            </v-btn>
            <v-btn
                class="switch-btn"
                color="#525252"
                dark
                depressed
                :outlined="pageNum === 1"
                @click="pageNum = 1"
            >
              <span>Формируемая часть</span>
            </v-btn>
          </div>
          <GradeTitle
              style="margin-right: 8px"
              :grades-groups="gradeGroups"
              @highlight-grade="highlightGrade"
          />
        </div>
      </div>
      <v-window v-model="pageNum" style="width: 100%; height: 100%">
        <v-window-item style="width: 100%; height: 100%">
          <Table
              ref="table"
              :categories="template.categories"
              :grade-groups="gradeGroups"
              :plan="obligatoryPlan"
          />
        </v-window-item>
        <v-window-item style="width: 100%; height: 100%">
          <FormativeTable
              ref="formativeTable"
              :grade-groups="gradeGroups"
              :plan="formativePlan"
          />
        </v-window-item>
      </v-window>
    </div>
    <!--        <div style="height: 100%; width: 35%" class="pl-1">-->
    <v-navigation-drawer
        v-model="showGeneralTable"
        absolute
        right
        temporary
        style="width: 70%"
        class="general-table-drawer"
    >
      <div style="width: 100%; display: flex; justify-content: space-between" class="mt-2 mb-3">
        <div class="fullname-container ml-6" style="display: flex; align-items: center; min-width: 0">
          <span style="overflow: hidden; white-space: nowrap">Общие сведения об Учебном плане</span>
        </div>
        <v-btn
            class="rounded-r-0 px-2 ml-4"
            style="min-width: 0"
            :color="generalTableCorrect() ? 'teal' : 'error'"
            dark
            @click="switchGeneralTable"
        >
          <div style="text-transform: none" class="pr-2">Закрыть</div>
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>
      <GeneralTable
          ref="generalTable"
          :obligatory-plan="obligatoryPlan"
          :formative-plan="formativePlan"
          :grade-groups="gradeGroups"
          :config="template.config"
          :ready="generalTableReady"
          @highlight-grade="highlightGrade"
      />
    </v-navigation-drawer>
  </div>
</template>

<script>

import Table from "@/components/Table/Table";
import GradeTitle from "@/components/GradeTitle";
import Vue from "vue";
import GeneralTable from "@/components/GeneralTable/GeneralTable";
import FormativeTable from "@/components/FormativeTable/FormativeTable";
import EditableText from "@/components/EditableText";

export default {
  name: 'EditorContent',
  components: {
    EditableText,
    FormativeTable,
    GeneralTable,
    GradeTitle,
    Table
  },

  props: {
    template: { type: Object, default: () => ({}) },
    gradeGroups: { type: Array, default: () => [] },
    obligatoryPlan: { type: Array, default: () => [] },
    formativePlan: { type: Object, default: () => ({}) },
  },

  data() {
    return {
      pageNum: 0,
      editingFullname: false,
      showGeneralTable: false,
      generalTableReady: false,
    };
  },
  mounted() {
    this.generalTableReady = true;  // this fixes rendering issues with content of navigation drawer
  },
  methods: {
    highlightGrade(i, j, flag) {
      Vue.set(this.gradeGroups[i][j], 'highlight', flag);
    },
    editFullname() {
      this.editingFullname = true;
    },
    changeFullname(newName) {
      Vue.set(this.template.config, 'title', newName);
      this.editingFullname = false;
    },
    generalTableCorrect() {
      return this.$refs.generalTable !== undefined && this.$refs.generalTable.correct();
    },
    switchGeneralTable() {
      this.showGeneralTable = !this.showGeneralTable;
    }
  }
};
</script>
<style>

.switch-btn-container {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  flex-grow: 1;
  max-width: 370px;
  min-width: 0;
}

.switch-btn {
  text-transform: none !important;
  width: calc(50% - 10px) !important;
  font-size: 10pt !important;
  font-weight: normal !important;
  height: auto !important;
  padding: 4px 8px !important;
  min-height: 32px;
  min-width: 0 !important;
}

.switch-btn > span {
  /*white-space: break-spaces !important;*/
  /*word-wrap: break-word !important;*/
  width: 100%;
  min-width: 0;
}

.switch-btn > span > span {
  text-overflow: ellipsis;
  width: 100%;
  overflow: hidden;
  min-width: 0;
}

.fullname-container, .fullname-container .v-input {
  display: flex;
  font-size: 1.17rem !important;
  font-weight: bold;
}

.general-table-drawer .v-navigation-drawer__content {
  overflow: hidden !important;
  display: flex;
  flex-direction: column;
}

</style>
