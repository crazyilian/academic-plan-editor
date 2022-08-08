<template>
  <div style="height: 100%; display: flex; flex-direction: column">
    <ScrollSync horizontal :class="{'show-scrollbar': showScrollbar}" group="grades" style="height: 8px">
      <div :style="{width: `${gradesNum * 48}px`}" style="height: 1px"/>
    </ScrollSync>
    <ScrollSync
        style="display: flex; height: calc(100% - 8px);"
        group="grades"
        horizontal
    >
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
    </ScrollSync>
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
  data() {
    return {
      showScrollbar: false,
    }
  },
  computed: {
    gradesNum() {
      return this.gradeGroups.reduce((r, g) => r + g.length, 0);
    }
  },
  mounted() {
    this.resizeWindow();
  },
  created() {
    window.addEventListener("resize", this.resizeWindow);
  },
  destroyed() {
    window.removeEventListener("resize", this.resizeWindow);
  },
  methods: {
    resizeWindow() {
      this.showScrollbar = this.gradesNum * 48 > window.innerWidth * 0.45;
    },
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

.scroll-sync-container {
  max-width: 45vw;
  overflow-x: scroll;
  overflow-y: hidden;
}

.scroll-sync-container::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.scroll-sync-container::-webkit-scrollbar-thumb {
  border-radius: 4px;
  border: 2px solid #e7e7e7;
}

</style>

