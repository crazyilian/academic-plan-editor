<template>
  <v-container class="pa-4" style="min-width: 0;">
    <h3>{{ template.name }}</h3>
    <span>{{ template.description }}</span>
    <Table :categories="template.categories" :grades="template.grades"/>
  </v-container>
</template>

<script>

import Table from "@/components/Table";

export default {
  name: 'EditorContent',
  components: {
    Table
  },

  props: {
    template: { type: Object, default: () => {} }
  },

  data() {
    return {};
  },
};
</script>