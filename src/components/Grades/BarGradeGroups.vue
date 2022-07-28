<template>
  <div style="display: flex; height: 100%">
    <VerticalLine/>
    <div
        v-for="(group, i) in gradesGroups"
        :key="i"
        style="display: flex"
        class="pb-1"
    >
      <Group :group="group"/>
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

