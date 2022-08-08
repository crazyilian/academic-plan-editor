<template>
  <div style="display: flex; height: 100%">
    <div
        v-for="([i, group], revi) in gradeGroups.map((g, i, s) => [s.length - i - 1, s[s.length - i - 1]])"
        :key="group[0].id"
        style="display: flex"
    >
      <Group
          ref="groups"
          :last="i === gradeGroups.length - 1"
          :group="group"
          class="pb-1"
          @highlight="setHighlight(revi, ...$event)"
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

