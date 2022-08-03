<template>
  <div style="display: flex; height: 100%; flex-direction: row-reverse">
    <v-btn style="width: 0; min-width: 0; padding: 0"/> <!-- crazy fix of bluring rotated text while pressing button -->
    <div
        v-for="(group, i) in gradeGroups"
        :key="i"
        style="display: flex"
    >
      <Group :group="group" class="pb-1" @remove-group="removeGroup(i)"/>
      <VerticalLine/>
    </div>
    <VerticalLine/>
  </div>
</template>

<script>

import VerticalLine from "@/components/VerticalLine";
import Group from "@/components/Grades/Group";

export default {
  name: "BarGradeGroups",
  components: { Group, VerticalLine },
  props: {
    gradeGroups: { type: Array, default: () => [] }
  },
  methods: {
    removeGroup(i) {
      this.$emit('remove-group', i);
    }
  }
}
</script>

<style>

</style>

