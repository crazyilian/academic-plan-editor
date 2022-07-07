<template>
  <div style="display: flex">
    <div
        v-for="(grade, i) in grades"
        :key="i"
        class="pb-2"
        style="width: 48px; display: flex; align-items: flex-end; justify-content: center"
        @mouseover="highlightGrade(i, true)"
        @mouseleave="highlightGrade(i, false)"
    >
      <div class="grade-name">{{ grade.name }}</div>
    </div>
  </div>
</template>

<script>

export default {
  name: "GradeTitle",
  props: {
    grades: { type: Array, default: () => [] }
  },
  methods: {
    highlightGrade(i, flag) {
      this.$emit('highlight-grade', i, flag);
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

