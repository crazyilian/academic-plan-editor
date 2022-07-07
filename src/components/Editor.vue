<template>
  <div style="display: flex; height: 100%">
    <div style="height: 100%; width: 15%">
      <EditorTabs
          v-model="activeTab"
          :tabs-templates="tabsTemplates"
          :templates="templates"
          @close-tab="closeTab"
          @add-tab="addTab"
          @edit-name="editName"
      />
    </div>
    <div style="width: 85%; min-width: 0">
      <div
          v-for="(template, i) in tabsTemplates"
          :key="i"
          style="height: 100%"
          :class="{ 'display-none': i !== activeTab }"
      >
        <EditorContent ref="editorContent" :template="template"/>
      </div>
    </div>
  </div>
</template>

<script>


import EditorContent from "@/components/EditorContent";
import EditorTabs from "@/components/EditorTabs";

export default {
  name: 'Editor',
  components: { EditorTabs, EditorContent },
  props: {
    templates: { type: Array, default: () => [] }
  },
  data() {
    return {
      activeTab: 0,
      tabsTemplates: [],
    }
  },
  mounted() {
    window.ipcRenderer.handle.exportProject((event, options) => {
      if (options.all) {
        window.ipcRenderer.exportProject({
          type: options.type,
          templates: this.tabsTemplates,
          obligatoryPlan: this.$refs.editorContent.map(e => e.obligatoryPlan),
          formativePlan: this.$refs.editorContent.map(e => e.formativePlan),
          generalTable: this.$refs.editorContent.map(e => e.$refs.generalTable), // FIXME: do not pass component
        })
      }
    });
  },
  methods: {
    closeTab(i) {
      this.tabsTemplates.splice(i, 1);
      if (this.activeTab > 0 && this.activeTab >= this.tabsTemplates.length) {
        this.activeTab = this.tabsTemplates.length - 1;
      }
    },
    addTab(i) {
      this.tabsTemplates.push(structuredClone(this.templates[i]));
      this.activeTab = this.tabsTemplates.length - 1;
    },
    editName(i, name) {
      this.tabsTemplates[i].config.name = name;
    }
  }
}
</script>
