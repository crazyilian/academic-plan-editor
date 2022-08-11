<template>
  <div style="display: flex; height: 100%">
    <div style="height: 100%; width: 17%">
      <EditorTabs
          v-model="activeTab"
          :tabs="project.tabs"
          :templates="templates"
          @close-tab="closeTab"
          @add-tab="addTab"
      />
    </div>
    <div style="width: 83%; min-width: 0">
      <div
          v-for="(d, i) in project.tabs"
          :key="d.id"
          style="height: 100%"
          :class="{ 'display-none': i !== activeTab }"
      >
        <EditorContent ref="editorContent" v-bind="d"/>
      </div>

      <div
          :class="{'display-none': project.tabs.length > 0}"
          style="display: flex; justify-content: center; align-items: flex-start; width: 100%; height: 100%;"
      >
        <div style="width: 50%" class="elevation-5 pa-3 mt-6 rounded">
          <p>
            Чтобы создать учебный план, нажмите на кнопку <i>"Создать УП"</i> в левом меню, а затем выберите нужный уровень
            образования.
          </p>
          <p>
            Чтобы сохранить проект как таблицу <i>.xlsx</i>, нажмите на кнопку <i>"Проект"</i> в левом верхнем углу, а затем выберите
            опцию <i>"Сохранить как"</i>.
          </p>
</div>
    </div>
  </div>
</div>
</template>

<script>


import EditorContent from "@/components/EditorContent";
import EditorTabs from "@/components/EditorTabs";
import Vue from "vue";
import { getProfileGroup, fillShape2, getProfileFormativeCategory, useGlobalGradeId } from "@/gradeProcessing";

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
    window.ipcRenderer.handle.exportProject(async (event, options) => {
      if (this.project === undefined) {
        await window.ipcRenderer.messageBox({
          'type': 'warning',
          'title': 'Сохранение...',
          'message': 'Вы не выбрали проект для сохранения',
          'detail': 'Чтобы сохранить, откройте существующий или создайте новый проект.'
        });
        return;
      }
      if (this.project.tabs.length === 0 && options.type === 'xlsx') {
        await window.ipcRenderer.messageBox({
          'type': 'warning',
          'title': 'Сохранение...',
          'message': 'Вы не создали ни одного учебного плана',
          'detail': 'Чтобы сохранить проект как таблицу .xlsx, создайте хотя бы один учебный план.'
        });
        return;
      }
      if (!this.correct()) {
        const buttonId = await window.ipcRenderer.messageBox({
          'type': 'question',
          'title': 'Сохранение...',
          'message': 'Один из учебных планов не соответсвует критериям. Всё равно сохранить проект?',
          'detail': 'Несоответствия критериям выделены красным с объяснением ошибки.',
          'buttons': ['Да', 'Нет'],
          'cancelId': 1,
          'defaultId': 0,
          'noLink': true,
        });
        const save = [true, false][buttonId];
        if (!save)
          return;
      }
      window.ipcRenderer.exportProject({
        type: options.type,
        project: this.project
      });
    });
  },
  methods: {
    correct() {
      return this.$refs.editorContent === undefined || this.$refs.editorContent.every(e => e.correct());
    },
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

      const obligatoryPlan = template.categories.map(c => c.subjects.map((s) => fillShape2(gradeGroups, () => ({
        value: s.required ? 1 : 0,
        advanced: false
      }))));

      const formativeDefaultCategory = getProfileFormativeCategory(template.rulesFormative, default_grades, gradeGroups);

      let formativePlan = {
        hours: fillShape2(gradeGroups, () => 0),
        subjects: [],
        categories: formativeDefaultCategory !== undefined ? [formativeDefaultCategory] : [],
      }

      Vue.set(this.project.tabs, this.project.tabs.length, {
        id: useGlobalGradeId(),
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
