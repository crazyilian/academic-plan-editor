<template>
  <div style="display: flex; height: 100%">
    <v-btn style="width: 0; min-width: 0; padding: 0"/> <!-- crazy fix of bluring rotated text while pressing button -->
    <VerticalLine/>
    <div
        v-for="(group, i) in gradesGroups"
        :key="i"
        style="display: flex;"
    >
      <Group :group="group" class="pb-1"/>
      <VerticalLine/>
    </div>
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

