<template>
  <div style="display: flex; height: 100%; flex-direction: row-reverse">
    <div
        v-for="(group, i) in gradeGroups"
        :key="group[0].id"
        style="display: flex"
    >
      <Group
          :last="i === gradeGroups.length - 1"
          :group="group"
          class="pb-1"
          @highlight="setHighlight(i, ...$event)"
          @remove-group="removeGroup(i)"
      />
    </div>
  </div>
</template>

<script>

import Group from "@/components/Grades/Group";

export default {
  name: "BarGradeGroups",
  components: { Group },
  props: {
    gradeGroups: { type: Array, default: () => [] }
  },
  methods: {
    removeGroup(i) {
      this.$emit('remove-group', i);
    },
    setHighlight(i, j, flag) {
      this.$emit('highlight', [i, j, flag]);
    }
  }
}
</script>

<style>

</style>

