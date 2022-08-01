<template>
  <Menu v-model="model" :data="data" @choose="chooseProfile">
    <v-btn icon color="teal">
      <v-icon size="30">mdi-plus</v-icon>
    </v-btn>
  </Menu>
</template>

<script>

import { getProfileMenu, getProfileGroup } from "@/gradeProcessing";
import Menu from "@/components/Menu";
import Vue from "vue";

export default {
  name: "ProfileMenu",
  components: { Menu },
  props: {
    grades: { type: Array, default: () => [] },
    gradeGroups: { type: Array, default: () => [] },
    obligatoryPlan: { type: Array, default: () => [] },
    formativePlan: { type: Object, default: () => ({}) },
  },
  data() {
    return {
      data: [
        {
          type: 'text', name: 'Выберите профиль класса',
          data: { 'menu-title-text': true }
        },
        { type: 'divider' },
        ...getProfileMenu(this.grades)
      ],
      model: false,
    }
  },
  methods: {
    chooseProfile(profile) {
      const group = getProfileGroup(this.grades, profile);
      const n = this.gradeGroups.length;
      Vue.set(this.gradeGroups, n, group);
      this.obligatoryPlan.forEach((category) => category.forEach((subject) => {
        Vue.set(subject, n, Array(group.length).fill(null).map(() => ({ value: 0, advanced: false })))
      }))
      Vue.set(this.formativePlan.hours, n, Array(group.length).fill(0));
    }
  }
}
</script>

<style>


</style>
