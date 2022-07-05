<template>
  <div style="display: flex; height: 100%">
    <div style="height: 100%; width: 16%">
      <EditorTabs
          v-model="activeTab"
          :tabs-templates="tabsTemplates"
          :templates="templates"
          @close-tab="closeTab"
          @add-tab="addTab"
          @edit-name="editName"
      />
    </div>
    <div style="width: 84%; min-width: 0">
      <div
          v-for="(template, i) in tabsTemplates"
          :key="i"
          style="height: 100%"
          :class="{ 'display-none': i !== activeTab }"
      >
        <EditorContent :template="template"/>
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
      this.tabsTemplates[i].name = name;
    }
  }
}
</script>
