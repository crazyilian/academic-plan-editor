<template>
  <div
      class="mx-1 counter-container"
      :class="{
                'counter-highlight': highlight,
                'counter-focused': isfocused,
                'counter-error': !correct,
                'counter-disabled': disabled
              }"
      @click="$refs.input.focus()"
  >
    <div class="pt-2 pb-1 counter-container-inner">
      <input
          ref="input"
          style="outline: none; text-align: center;"
          :value="stringValue"
          :placeholder="nullAvailable ? '-' : min.toString()"
          :disabled="disabled"
          @focusin="isfocused = true"
          @focusout="isfocused = false"
          @input="onNumberInput"
          @change="onNumberChange"
      >
    </div>
  </div>
</template>

<script>

export default {
  name: 'Counter',
  components: {},
  props: {
    'id': { type: Number, default: -1 },
    'correct': { type: Boolean, default: true },
    'highlight': { type: Boolean, default: false },
    'startValue': { type: Number, default: 0 },
    'min': { type: Number, default: 0 },
    'max': { type: Number, default: 9999 },
    'nullAvailable': { type: Boolean, default: false },
    'disabled': { type: Boolean, default: false }
  },
  data() {
    return {
      stringValue: this.startValue === null ? "" : this.startValue.toString(),
      value: this.startValue,
      isfocused: false,
    }
  },
  watch: {
    stringValue() {
      this.adjustWidth();
    }
  },
  mounted() {
    this.adjustWidth();
  },
  methods: {
    adjustWidth() {
      const inp = this.$refs.input;
      inp.style.width = `max(${inp.value.length}ch, 20px)`;
    },
    onNumberInput() {
      const sval = this.$refs.input.value;
      console.log('input', sval);
      if (sval === "") {
        this.value = this.nullAvailable ? null : this.min;
        this.stringValue = sval;
        this.update();
        return;
      }
      if (!/^\d+$/.test(sval)) {
        this.$refs.input.value = this.stringValue;
        return;
      }
      let val = parseInt(sval);
      if (val > this.max) {
        val = this.max;
      }
      this.value = val;
      this.stringValue = val.toString();
      this.$refs.input.value = this.stringValue;
      this.update();
    },
    onNumberChange() {
      const sval = this.$refs.input.value;
      let val = parseInt(sval);
      if ((sval === "" && !this.nullAvailable) || val < this.min) {
        val = this.min;
        this.value = val;
        this.stringValue = val.toString();
        this.$refs.input.value = this.stringValue;
        this.update();
      }
    },
    update() {
      this.$emit('input');
    },
  }
}
</script>

<style>

.counter-container {
  width: 40px;
  min-width: 40px;
  height: 32px;
  border-bottom: solid thin #b6b6b6;
}

.counter-container input::-webkit-input-placeholder {
  color: #b6b6b6;
}

.counter-container:not(.counter-disabled):hover {
  border-color: black
}

.counter-error {
  border-color: #ff9f9f;
}

.counter-error:not(.counter-disabled):hover {
  border-color: red;
}

.counter-container input {
  color: black;
}

.counter-error input {
  color: red;
}

.counter-error input::-webkit-input-placeholder {
  color: #ff9f9f;
}

.counter-container-inner {
  width: 100%;
  height: 29px;
  display: flex;
  align-items: center;
  justify-content: center
}

.counter-container:after {
  border-bottom: solid medium black;
  transform: scaleX(0);
  transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
  display: block;
  content: '';
}

.counter-error:after {
  border-color: red;
}

.counter-focused:after {
  transform: scaleX(1);
}

.counter-highlight {
  background-color: #f5f5aa !important;
}

</style>
