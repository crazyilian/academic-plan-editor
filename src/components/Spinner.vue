<template>
  <div
      style="display: flex; flex-direction: column; height: 15px; width: 15px; justify-content: center;"
      @mousedown="startLong"
      @mouseup="stopLong"
      @mouseleave="stopLong"
  >
    <div class="spin-button" @mouseenter="channel = 'increase'">
      <v-icon>mdi-triangle</v-icon>
    </div>
    <div class="spin-button rot180" @mouseenter="channel = 'decrease'">
      <v-icon>mdi-triangle</v-icon>
    </div>
  </div>
</template>

<script>
export default {
  name: "Spinner",
  data() {
    return {
      longpress: undefined,
      channel: undefined,
    }
  },
  methods: {
    startLong() {
      this.stopLong();
      this.$emit(this.channel);
      this.longpress = setTimeout(() => {
        this.longpress = setInterval(() => this.$emit(this.channel), 50);
      }, 500);
    },
    stopLong() {
      clearTimeout(this.longpress);
      clearInterval(this.longpress);
    },
  }
}
</script>

<style>

.spin-button {
  height: 50%;
  width: 100%;
  display: flex;
  align-items: center;
  background-color: #ececec;
}

.spin-button:hover {
  background-color: #cbcbcb;
}

.spin-button > i {
  transform: scaleY(0.2) scaleX(0.4);
  color: #777 !important;
  width: 100%;
}

.spin-button.rot180 > i {
  transform: scaleY(0.2) scaleX(0.4) rotate(180deg);
}

</style>
