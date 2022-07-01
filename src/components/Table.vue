<template>
  <v-row justify="center">
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
  data: () => ({
    panels: [],
    categories: [
      {
        'name': 'Естественные науки',
        'subjects': [
          {
            'name': 'Физика',
            'required': false,
          },
          {
            'name': 'Химия',
            'required': false,
          },
          {
            'name': 'Биология',
            'required': false,
          },
          {
            'name': 'Астрономия',
            'required': true,
          },
        ]
      },
      {
        'name': 'Родной язык и родная литература',
        'subjects': [
          {
            'name': 'Родной язык',
            'required': false,
          },
          {
            'name': 'Родная литература',
            'required': false,
          }
        ]
      }
    ],
    grades: [
      {
        name: '10',
        description: 'Профиль*-универсальный'
      },
      {
        name: '11',
        description: 'Профиль-универсальный'
      }
    ]
  }),
  mounted() {
    window.ipcRenderer.on('expandAll', this.expandAll);
    window.ipcRenderer.on('collapseAll', this.collapseAll);
    this.expandAll();
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