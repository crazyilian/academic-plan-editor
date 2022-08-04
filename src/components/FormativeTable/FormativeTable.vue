<template>
  <div style="height: 100%; overflow-y: scroll;" class="pl-2 pb-1 show-scrollbar">
    <div style="display: flex; flex-direction: column; justify-content: center" class="ma-0">
      <v-expansion-panels :value="panels" accordion focusable multiple class="rounded-0" @change="modelChange">
        <FormativeCategory
            v-for="(category, i) in plan.categories"
            :key="category.profile.toString()"
            :grade-groups="gradeGroups"
            v-bind="category"
            @validate="validate(i, $event)"
        />
        <FormativeLastCategory :grade-groups="gradeGroups" :plan="plan"/>
      </v-expansion-panels>
    </div>
  </div>
</template>

<script>

import FormativeLastCategory from "@/components/FormativeTable/FormativeLastCategory";
import FormativeCategory from "@/components/FormativeTable/FormativeCategory";

export default {
  name: 'FormativeTable',
  components: { FormativeCategory, FormativeLastCategory },
  props: {
    gradeGroups: { type: Array, default: () => [] },
    plan: { type: Object, default: () => ({}) },
    rules: { type: Array, default: () => [] }
  },
  data() {
    return {
      panels: [...Array(this.plan.categories.length + 1).keys()],
      changeShapeFlag: false,
    }
  },
  watch: {
    plan: {
      handler() {
        this.panels = [...Array(this.plan.categories.length + 1).keys()];
        this.changeShapeFlag = true;
        this.$nextTick(() => this.changeShapeFlag = false);
      },
      deep: true
    },
  },
  methods: {
    modelChange(newPanels) {
      if (!this.changeShapeFlag) {
        this.panels = newPanels;
        return;
      }
      this.panels = structuredClone(this.panels);
      this.changeShapeFlag = false;
    },
    validate(i, j) {
      console.log('validate', i, j);
    },
  }
}
</script>
<style>

</style>
