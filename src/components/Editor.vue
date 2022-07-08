<template>
  <div style="display: flex; height: 100%">
    <div style="height: 100%; width: 17%">
      <EditorTabs
          v-model="activeTab"
          :tabs-templates="tabsTemplates"
          :templates="templates"
          @close-tab="closeTab"
          @add-tab="addTab"
          @edit-name="editName"
      />
    </div>
    <div style="width: 83%; min-width: 0">
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
      if (this.tabsTemplates.length === 0) {
        window.ipcRenderer.messageBox({
          'type': 'warning',
          'title': 'Экспорт...',
          'message': 'Вы не можете экспортировать пустой план',
          // 'detail': '',
          'buttons': ['Ок'],
          'noLink': true,
        });
        return;
      }
      let ids = [];
      if (options.all) {
        ids = [...Array(this.$refs.editorContent.length).keys()];
      } else {
        ids = [this.activeTab];
      }
      const res = { type: options.type, data: [] }
      for (const id of ids) {
        const editorContent = this.$refs.editorContent[id];
        const generalTable = editorContent.$refs.generalTable;
        res.data.push({
          template: editorContent.template,
          obligatoryPlan: editorContent.obligatoryPlan,
          formativePlan: editorContent.formativePlan,
          weeknum: generalTable.weeknum
        })
      }
      window.ipcRenderer.exportProject(res);
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
