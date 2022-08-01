<template>
  <div style="display: flex; height: 100%; flex-direction: row-reverse">
    <v-btn style="width: 0; min-width: 0; padding: 0"/> <!-- crazy fix of bluring rotated text while pressing button -->
    <div
        v-for="(group, i) in gradesGroups"
        :key="i"
        style="display: flex"
    >
      <Group :group="group" class="pb-1"/>
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
    gradesGroups: { type: Array, default: () => [] }
  },
}
</script>

<style>

</style>

