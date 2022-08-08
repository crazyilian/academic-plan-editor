<template>
  <Menu v-model="model" :data="data" @choose="chooseProfile">
    <v-btn icon color="teal" style="margin-top: 8px">
      <v-icon size="30">mdi-plus</v-icon>
    </v-btn>
  </Menu>
</template>

<script>

import { getProfileMenu, getProfileGroup } from "@/gradeProcessing";
import Menu from "@/components/Menu";

export default {
  name: "ProfileMenu",
  components: { Menu },
  props: {
    grades: { type: Array, default: () => [] },
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
      const group = getProfileGroup(this.grades, profile, true);
      this.$emit('add-group', group);
    }
  }
}
</script>

<style>


</style>
