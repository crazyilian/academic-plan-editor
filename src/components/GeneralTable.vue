<template>
  <div class="rounded-lg pb-2 mx-3 general-table">value {{ plan }}</div>
</template>

<script>

export default {
  name: "GeneralTable",
  props: {
    plan: { type: Array, default: () => [] }
  },
  data() {
    return {}
  },
}
</script>

<style>

.general-table {
  /*border-style: solid;*/
  background-color: #fff3b4;
  width: 100%;
  height: 100%;
}

</style>
