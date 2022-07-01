<template>
  <v-container class="pa-4">
    <Table v-if="templates.length > 0" :categories="templates[0].categories" :grades="templates[0].grades"/>
  </v-container>
</template>

<script>

import Table from "@/components/Table";

export default {
  name: 'Editor',
  components: {
    Table
  },
  data() {
    return {
      templates: []
    }
  },
  mounted() {
    window.ipcRenderer.getTemplates().then((templates) => { this.templates = templates; });
  }
}
</script>
