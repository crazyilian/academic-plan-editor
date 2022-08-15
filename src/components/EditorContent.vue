<template>
  <div style="min-width: 0; width: 100%; height: 100%; display: flex">
    <div
        class="pl-2 py-0"
        style="min-width: 0; width: 100%; display: flex; flex-direction: column; height: 100%; flex-grow: 1"
    >
      <div class="pl-2" style="width: 100%; display: flex; flex-direction: column; gap: 4px;">
        <div class="fullname-container ml-2">
          <EditableText
              style="flex-grow: 1"
              class="hover-background"
              :value="template.config.title"
              :editing="editingFullname"
              @change="changeFullname"
              @span-click="editFullname"
          />
          <div style="margin-left: 8px; margin-right: -8px">
            <v-btn
                class="rounded-r-0 px-2"
                style="min-width: 0"
                :color="generalTableCorrect ? 'teal' : 'error'"
                dark
                @click="switchGeneralTable"
            >
              <div style="text-transform: none" class="pr-2">Сводка</div>
              <v-icon v-if="generalTableCorrect">mdi-check</v-icon>
              <v-icon v-else>mdi-alert-circle</v-icon>
            </v-btn>
          </div>
        </div>
        <HorizontalResizeBar>
          <div style="display: flex; justify-content: space-between; flex-grow: 1; min-height: 0; margin-right: 16px">
            <div class="pb-3 switch-btn-container">
              <v-btn
                  class="switch-btn"
                  color="accent"
                  dark
                  depressed
                  :outlined="pageNum === 0"
                  @click="setPageNum(0)"
              >
                <span>Обязательная часть</span>
              </v-btn>
              <v-btn
                  class="switch-btn"
                  color="accent"
                  dark
                  depressed
                  :outlined="pageNum === 1"
                  @click="setPageNum(1)"
              >
                <span>Формируемая часть</span>
              </v-btn>
            </div>
            <div style="display: flex; align-items: center">
              <ProfileMenu
                  :grades="template.grades"
                  @add-group="addGroup($event, true)"
              />
              <BarGradeGroups
                  ref="barGradeGroups"
                  class="ml-1 mr-2"
                  :grade-groups="gradeGroups"
                  @remove-group="removeGroup"
                  @highlight="setHighlight(...$event)"
              />
            </div>
          </div>
        </HorizontalResizeBar>
      </div>
      <v-window v-model="pageNum" style="width: 100%; height: 100%">
        <v-window-item style="width: 100%; height: 100%" eager>
          <Table
              ref="table"
              :categories="template.categories"
              :rules="template.rulesObligatory"
              :grades="template.grades"
              :grade-groups="gradeGroups"
              :highlight="highlight"
              :plan="obligatoryPlan"
          />
        </v-window-item>
        <v-window-item style="width: 100%; height: 100%" eager>
          <FormativeTable
              ref="formativeTable"
              :grade-groups="gradeGroups"
              :plan="formativePlan"
              :rules="template.rulesFormative"
              :grades="template.grades"
          />
        </v-window-item>
      </v-window>
    </div>
    <v-navigation-drawer
        v-model="showGeneralTable"
        absolute
        right
        temporary
        style="width: 70%"
        class="general-table-drawer"
    >
      <div style="width: 100%; display: flex; justify-content: space-between; margin-bottom: 4px" class="mt-2">
        <div class="fullname-container ml-6" style="display: flex; align-items: center; min-width: 0">
          <span style="overflow: hidden; white-space: nowrap">Общие сведения об Учебном плане</span>
        </div>
        <v-btn
            class="rounded-r-0 px-2 ml-4"
            style="min-width: 0"
            :color="generalTableCorrect ? 'teal' : 'error'"
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
          :grades="template.grades"
          :ready="generalTableReady"
          @set-correct="generalTableCorrect = $event"
          @highlight="setHighlight(...$event)"
          @remove-group="removeGroup"
          @add-group="addGroup($event, false)"
      />
    </v-navigation-drawer>
  </div>
</template>

<script>

import Table from "@/components/Table/Table";
import BarGradeGroups from "@/components/Grades/BarGradeGroups";
import Vue from "vue";
import GeneralTable from "@/components/GeneralTable/GeneralTable";
import FormativeTable from "@/components/FormativeTable/FormativeTable";
import EditableText from "@/components/EditableText";
import HorizontalResizeBar from "@/components/HorizontalResizeBar";
import ProfileMenu from "@/components/Grades/ProfileMenu";
import {
  isEqualProfile,
  getProfileFormativeCategory,
  fillShape2,
  getGroupProfile,
  getObligatoryDefaultValues,
  getFormativeDefaultValues
} from "@/gradeProcessing";

export default {
  name: 'EditorContent',
  components: {
    ProfileMenu,
    HorizontalResizeBar,
    EditableText,
    FormativeTable,
    GeneralTable,
    BarGradeGroups,
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
      highlight: fillShape2(this.gradeGroups, () => false),
      generalTableCorrect: true,
    };
  },
  computed: {
    groupStart() {
      return this.gradeGroups.reduce((r, group) => [...r, r[r.length - 1] + group.length], [0]);
    }
  },
  mounted() {
    this.generalTableReady = true;  // this fixes rendering issues with content of navigation drawer
  },
  methods: {
    correct() {
      return this.generalTableCorrect && this.$refs.table.correct() && this.$refs.formativeTable.correct();
    },
    editFullname() {
      this.editingFullname = true;
    },
    changeFullname(newName) {
      Vue.set(this.template.config, 'title', newName);
      this.editingFullname = false;
    },
    switchGeneralTable() {
      this.showGeneralTable = !this.showGeneralTable;
    },
    addGroup(group, main) {
      const profile = getGroupProfile(group);
      const n = this.gradeGroups.length;

      Vue.set(this.gradeGroups, n, group);

      this.obligatoryPlan.forEach((category, i) => category.forEach((subject, j) => {
        Vue.set(subject, n,
            getObligatoryDefaultValues([i, j], group, this.template.rulesObligatory, this.template.categories));
      }));

      Vue.set(this.formativePlan.hours, n, Array(group.length).fill(0));

      this.formativePlan.categories.forEach((category) => category.subjects.forEach((subject) => {
        Vue.set(subject.plan, n,
            getFormativeDefaultValues(subject.name, group, this.template.rulesFormative));
      }))
      if (!this.formativePlan.categories.some((category) => isEqualProfile(category.profile, profile))) {
        const category = getProfileFormativeCategory(this.template.rulesFormative, group, this.gradeGroups);
        if (category !== undefined) {
          Vue.set(this.formativePlan.categories, this.formativePlan.categories.length, category);
        }
      }

      this.highlight = fillShape2(this.gradeGroups, () => false);
      if (profile.length === 3) {
        this.$nextTick(() => {
          const barGradeGroups = main ? this.$refs.barGradeGroups : this.$refs.generalTable.$refs.barGradeGroups;
          const newGroup = barGradeGroups.$refs.groups.slice(-1)[0];
          newGroup.editGroupName();
        })
      }
    },
    removeGroup(i) {
      const profile = getGroupProfile(this.gradeGroups[i]);
      Vue.delete(this.gradeGroups, i);
      this.obligatoryPlan.forEach((category) => category.forEach((subject) => {
        Vue.delete(subject, i)
      }))
      Vue.delete(this.formativePlan.hours, i);
      this.formativePlan.categories.forEach((category) => category.subjects.forEach((subject) => {
        Vue.delete(subject.plan, i);
      }))
      if (!this.gradeGroups.some((group) => isEqualProfile(getGroupProfile(group), profile))) {
        const ind = this.formativePlan.categories.findIndex((category) => isEqualProfile(category.profile, profile));
        if (ind !== -1) {
          Vue.delete(this.formativePlan.categories, ind);
        }
      }
      this.highlight = fillShape2(this.gradeGroups, () => false);
    },
    setHighlight(i, j, flag) {
      const ij = this.groupStart[i] + j;
      if (this.$refs.table !== undefined) {
        this.$refs.table.$refs.categories.forEach((cat) => cat.$refs.subjects.forEach((subj) => subj.$refs.counters[ij].highlight = flag));
      }
      if (this.$refs.formativeTable !== undefined) {
        if (this.$refs.formativeTable.$refs.categories !== undefined) {
          this.$refs.formativeTable.$refs.categories.forEach((cat) => cat.$refs.subjects.forEach((subj) => subj.$refs.counters[ij].highlight = flag));
        }
        this.$refs.formativeTable.$refs.lastCategory.$refs.counters[ij].highlight = flag;
      }
      if (this.$refs.generalTable !== undefined) {
        ['s0', 's1', 's2', 's3', 's4', 's6'].forEach((s) => this.$refs.generalTable.$refs[s].$refs.summaries.forEach((sum) => sum.$refs.counters[ij].highlight = flag))
        this.$refs.generalTable.$refs.s5.$refs.summaries.forEach((sum) => sum.$refs.counters[this.groupStart[i]].highlight = flag);
      }
    },
    setPageNum(i) {
      this.pageNum = i;
      setTimeout(() => {
        this.$refs.formativeTable.$refs.categories.forEach((category) => category.$refs.subjects.forEach((subject) => subject.$refs.editableName.updateSize()));
      }, 100)
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
