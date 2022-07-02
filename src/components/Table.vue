<template>
  <v-row justify="center" class="ma-0">
    <v-expansion-panels v-model="panels" accordion focusable multiple>
      <Category
          v-for="(category, i) in categories"
          v-bind="category"
          :id="i"
          :key="i"
          :grades="grades"
      />
    </v-expansion-panels>
  </v-row>
</template>

<script>

import Category from "@/components/Category";

export default {
  name: 'Table',
  components: { Category },
  props: {
    'categories': { type: Array, default: () => [] },
    'grades': { type: Array, default: () => [] },
  },
  data() {
    return {
      panels: [...Array(this.categories.length).keys()],
    }
  },
  mounted() {
    window.ipcRenderer.handle.collapseAll(this.collapseAll)
    window.ipcRenderer.handle.expandALl(this.expandAll)
  },
  methods: {
    expandAll() {
      this.panels = [...Array(this.categories.length).keys()];
    },
    collapseAll() {
      this.panels = [];
    },
  }
}
</script>