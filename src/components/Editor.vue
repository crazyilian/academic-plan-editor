<template>
  <div style="display: flex; height: 100%">
    <div style="height: 100%; width: 17%">
      <EditorTabs
          v-model="activeTab"
          :tabs-templates="project.tabs.map(e => e.template)"
          :templates="templates"
          @close-tab="closeTab"
          @add-tab="addTab"
      />
    </div>
    <div style="width: 83%; min-width: 0">
      <div
          v-for="(d, i) in project.tabs"
          :key="JSON.stringify(d.config) + `;${i}`"
          style="height: 100%"
          :class="{ 'display-none': i !== activeTab }"
      >
        <EditorContent ref="editorContent" v-bind="d"/>
      </div>
    </div>
  </div>
</template>

<script>


import EditorContent from "@/components/EditorContent";
import EditorTabs from "@/components/EditorTabs";
import Vue from "vue";
import { addGroupToPlan, getProfileGroup, fillShape2, getProfileFormativeCategory } from "@/gradeProcessing";

export default {
  name: 'Editor',
  components: { EditorTabs, EditorContent },
  props: {
    templates: { type: Array, default: () => [] },
    project: { type: Object, default: () => ({}) }
  },
  data() {
    return {
      activeTab: 0,
    }
  },
  mounted() {
    window.ipcRenderer.handle.exportProject((event, options) => {
      if (this.project === undefined) {
        window.ipcRenderer.messageBox({
          'type': 'warning',
          'title': 'Сохранение...',
          'message': 'Вы не выбрали проект для сохранения',
          'detail': 'Чтобы сохранить, откройте существующий или создайте новый проект'
        });
        return;
      }
      window.ipcRenderer.exportProject({
        type: options.type,
        project: this.project
      });
    });
  },
  methods: {
    closeTab(i) {
      Vue.delete(this.project.tabs, i);
      if (this.activeTab > 0 && this.activeTab >= this.project.tabs.length) {
        this.activeTab = this.project.tabs.length - 1;
      }
    },
    addTab(i) {
      const template = structuredClone(this.templates[i]);
      const default_grades = getProfileGroup(template.grades, []);
      const gradeGroups = [default_grades];

      let obligatoryPlan = template.categories.map(c => c.subjects.map(() => []));
      obligatoryPlan = addGroupToPlan(obligatoryPlan, ...gradeGroups)

      const formativeDefaultCategory = getProfileFormativeCategory(template.rulesFormative, default_grades, gradeGroups);

      let formativePlan = {
        hours: fillShape2(gradeGroups, () => 0),
        subjects: [],
        categories: formativeDefaultCategory !== undefined ? [formativeDefaultCategory] : [],
      }

      Vue.set(this.project.tabs, this.project.tabs.length, {
        template: structuredClone(this.templates[i]),
        gradeGroups: gradeGroups,
        obligatoryPlan: obligatoryPlan,
        formativePlan: formativePlan,
      })
      this.activeTab = this.project.tabs.length - 1;
    },
  }
}
</script>
