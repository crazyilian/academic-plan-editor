<template>
  <div :class="{ 'counter-highlight': highlight }" class="mx-1">
    <div class="number-container">
      <span :style="{color: correct ? 'black' : 'red'}">{{ value }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: "NumberContainer",
  props: {
    value: { type: Number, default: 0 },
    highlight: { type: Boolean, default: false },
    correct: { type: Boolean, default: false }
  },
  watch: {
    value() {
      this.$emit('change');
    }
  }
}
</script>

<style>

.number-container {
  width: 40px;
  padding: 8px 0 8px 0;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom-style: solid;
  border-bottom-width: 0.9px; /* 1px or thin show 2px border. Seems like shadow or smth */
  border-bottom-color: #a0a0a0;
  transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
}

.number-container:hover {
  border-bottom-color: black;
}

</style>
