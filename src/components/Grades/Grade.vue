<template>
  <div
      style="width: 48px; height: 100%; display: flex; flex-direction: column; padding: 2px 0; justify-content: space-between"
      @mouseover="highlightGrade(true)"
      @mouseleave="highlightGrade(false)"
  >
    <div class="pb-0" style="min-height: 0">
      <v-tooltip bottom :open-delay="500">
        <template #activator="{ on, attrs} ">
          <div
              v-bind="attrs" class="grade-name"
              style="writing-mode: vertical-rl; transform: rotate(180deg)"
              v-on="on"
          >
            <span style="font-size: 0.8em; overflow: hidden">{{ grade.profile.filter(s => s).slice(-1)[0] }}</span>
          </div>
        </template>
        <div class="pa-2" style="text-align: center; max-width: 200px; word-wrap: break-word">
          {{ grade.profile.filter((v) => v.length > 0).join(': ') }}
        </div>
      </v-tooltip>
    </div>
    <div class="grade-name" style="height: 1rem">
      <span>{{ grade.name }}</span>
    </div>
  </div>
</template>

<script>
import Vue from "vue";

export default {
  name: "Grade",
  props: {
    grade: { type: Object, default: () => ({}) }
  },
  methods: {
    highlightGrade(flag) {
      Vue.set(this.grade, 'highlight', flag);
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
