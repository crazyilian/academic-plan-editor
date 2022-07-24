<template>
  <div style="height: 100%; overflow-y: scroll;" class="pl-2 pt-0 pb-1">
    <div style="display: flex; flex-direction: column; justify-content: center" class="ma-0">
      <v-expansion-panels v-model="panels" accordion focusable multiple class="rounded-0">
        <Category
            v-for="(category, i) in categories"
            v-bind="category"
            :id="i"
            :key="i"
            ref="categories"
            :grade-groups="gradeGroups"
            :plan="plan[i]"
        />
      </v-expansion-panels>
    </div>
  </div>
</template>

<script>

import Category from "@/components/Table/Category";

export default {
  name: 'Table',
  components: { Category },
  props: {
    'categories': { type: Array, default: () => [] },
    'gradeGroups': { type: Array, default: () => [] },
    'plan': { type: Array, default: () => [] }
  },
  data() {
    return {
      panels: [...Array(this.categories.length).keys()],
    }
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
