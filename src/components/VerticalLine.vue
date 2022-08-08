<template>
  <div
      style="border-left: 1px solid gray; width: 0; height: 100%"
      :style="{ 'margin-left': right ? '0' : '-1px', 'margin-right': right ? '-1px' : '0'}"
  />
</template>

<script>
export default {
  name: "VerticalLine",
  props: {
    right: { type: Boolean, default: false }
  }
}
</script>

