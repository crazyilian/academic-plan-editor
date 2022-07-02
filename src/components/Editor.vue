<template>
  <div style="display: flex">
    <div>
      <EditorTabs
          v-model="activeTab"
          :tabs-templates="tabsTemplates"
          :templates="templates"
          @close-tab="closeTab"
          @add-tab="addTab"
      />
    </div>
    <div style="width: 100%; min-width: 0">
      <div v-for="(template, i) in tabsTemplates" :key="i">
        <EditorContent :class="{ 'display-none': i !== activeTab }" :template="template"/>
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
      console.log('close tab', i);
    },
    addTab(i) {
      this.tabsTemplates.push(structuredClone(this.templates[i]));
    }
  }
}
</script>
