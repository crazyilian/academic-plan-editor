<template>
  <div style="display: flex">
    <VerticalLine/>
    <div
        v-for="(group, i) in gradesGroups"
        :key="i"
        style="display: flex; align-items: stretch"
    >
      <div
          v-for="(grade, j) in group"
          :key="j"
          class="pb-2"
          style="width: 48px; display: flex; align-items: flex-end; justify-content: center"
          @mouseover="highlightGrade(i, j, true)"
          @mouseleave="highlightGrade(i, j, false)"
      >
        <div class="grade-name">{{ grade.name }}</div>
      </div>
      <VerticalLine/>
    </div>
  </div>
</template>

<script>

import VerticalLine from "@/components/VerticalLine";

export default {
  name: "GradeTitle",
  components: { VerticalLine },
  props: {
    gradesGroups: { type: Array, default: () => [] }
  },
  methods: {
    highlightGrade(i, j, flag) {
      this.$emit('highlight-grade', i, j, flag);
    }
  }
}
</script>

<style>

.grade-name {
  font-weight: bold;
  font-size: 11pt;
  word-wrap: break-word;
  white-space: pre-line;
  text-align: center;
  width: 100%;
}

</style>

