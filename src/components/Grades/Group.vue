<template>
  <div style="display: flex;">
    <div v-for="(grade, j) in group" :key="j">
      <Grade :grade="grade"/>
    </div>
  </div>
</template>

<script>
import Grade from "@/components/Grades/Grade";

export default {
  name: "Group",
  components: { Grade },
  props: {
    group: { type: Array, default: () => [] }
  },
}
</script>

<style>

</style>
