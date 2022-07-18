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
      Vue.set(this.project.tabs, this.project.tabs.length, {
        template: structuredClone(this.templates[i]),
        obligatoryPlan: [],
        formativePlan: {},
        weeknum: [],
      })
      this.activeTab = this.project.tabs.length - 1;
    },
  }
}
</script>
