<template>
  <v-tooltip bottom :open-delay="500">
    <template #activator="{ on, attrs} ">
      <div
          v-bind="attrs"
          style="width: 48px; height: 100%; display: flex; flex-direction: column; padding: 2px 0; justify-content: space-between"
          v-on="on"
          @mouseover="setHighlight(true)"
          @mouseleave="setHighlight(false)"
      >
        <div class="pb-0" style="min-height: 0; flex-grow: 1">
          <div
              class="grade-name"
              style="writing-mode: vertical-rl; transform: rotate(180deg)"
          >
            <span style="font-size: 0.8em; overflow: hidden">{{ parsed.last }}</span>
          </div>
        </div>
        <div class="grade-name" style="height: 1rem">
          <span>{{ grade.name }}</span>
        </div>
      </div>
    </template>
    <div class="pa-2" style="text-align: center; max-width: 200px; word-wrap: break-word">
      {{ parsed.pretty }}
    </div>
  </v-tooltip>
</template>

<script>

import { parseProfile } from "@/gradeProcessing";

export default {
  name: "Grade",
  props: {
    grade: { type: Object, default: () => ({}) },
  },
  computed: {
    parsed() {
      return parseProfile(this.grade.profile);
    }
  },
  methods: {
    setHighlight(flag) {
      this.$emit('highlight', flag);
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
  text-align: end;
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
