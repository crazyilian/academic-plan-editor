<template>
  <div style="display: flex; height: 100%">
    <VerticalLine/>
    <div
        v-for="(group, i) in gradesGroups"
        :key="i"
        style="display: flex"
        class="pb-1"
    >
      <div style="display: flex; flex-direction: column; width: 100%; height: 100%; justify-content: space-between">
        <div style="display: flex; align-items: stretch; min-height: 0">
          <div
              v-for="(grade, j) in group"
              :key="j"
              class="pb-1"
              style="width: 48px; display: flex; align-items: flex-end; justify-content: center"
              @mouseover="highlightGrade(i, j, true)"
              @mouseleave="highlightGrade(i, j, false)"
          >
            <div
                class="grade-name"
                style="writing-mode: vertical-rl; transform: rotate(180deg)"
            >
              <span style="font-size: 0.8em; overflow: hidden">{{ grade.profile.join(': ') }}</span>
            </div>
          </div>
        </div>
        <div style="display: flex; align-items: stretch; height: 1rem">
          <div
              v-for="(grade, j) in group"
              :key="j"
              style="width: 48px; display: flex; align-items: flex-end; justify-content: center"
              @mouseover="highlightGrade(i, j, true)"
              @mouseleave="highlightGrade(i, j, false)"
          >
            <div class="grade-name">
              <span>{{ grade.name }}</span>
            </div>
          </div>
        </div>
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
  display: flex;
  justify-content: center;
  align-items: center;
  max-height: 100%;
}

.grade-name > span {
  height: 100%;
  max-width: 2rem;
  font-weight: bold;
}

</style>

