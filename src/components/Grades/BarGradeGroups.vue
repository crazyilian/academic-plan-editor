<template>
  <div style="display: flex; height: 100%; flex-direction: row-reverse">
    <v-btn style="width: 0; min-width: 0; padding: 0"/> <!-- crazy fix of bluring rotated text while pressing button -->
    <div
        v-for="(group, i) in gradeGroups"
        :key="group[0].id"
        style="display: flex"
    >
      <Group
          :group="group"
          class="pb-1"
          @highlight="setHighlight(i, ...$event)"
          @remove-group="removeGroup(i)"
      />
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
  computed: {
    groupStart() {
      return this.gradeGroups.reduce((r, group) => [...r, r[r.length - 1] + group.length], [0]);
    }
  },
  methods: {
    removeGroup(i) {
      this.$emit('remove-group', i);
    },
    setHighlight(i, j, flag) {
      this.$emit('highlight', [this.groupStart[i] + j, i, j, flag]);
    }
  }
}
</script>

<style>

</style>

