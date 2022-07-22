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
    <div v-if="showLabel" style="font-size: 10px; width: 0; height: 0; opacity: 0.6">{{ checkbox ? 'У' : 'Б' }}</div>
    <div class="pt-2 pb-1 counter-container-inner">
      <div style="margin: 0 -4.5px -4.5px -4.5px; display: none" class="checkbox">
        <v-checkbox
            v-if="showCheckbox"
            v-model="checkbox"
            style="transform: scale(0.6);"
            class="ma-0 pa-0"
            :color="correct ? 'black' : 'error'"
            :disabled="checkboxDisabled"
        />
        <div v-else style="width: 24px"/>
      </div>
      <input
          ref="input"
          style="outline: none; text-align: center; margin-right: 1px"
          :value="stringValue"
          :placeholder="nullAvailable ? '-' : min.toString()"
          :disabled="disabled"
          @focusin="isfocused = true"
          @focusout="isfocused = false"
          @input="onNumberInput"
          @change="onNumberChange"
      >
      <div style="display: none" class="spinner">
        <Spinner
            v-if="!disabled"
            @increase="setValue(value + 1)"
            @decrease="setValue(value - 1)"
        />
        <div v-else style="width: 15px"/>
      </div>
    </div>
  </div>
</template>

<script>

import Spinner from "@/components/Spinner";

export default {
  name: 'Counter',
  components: { Spinner },
  props: {
    'id': { type: Number, default: -1 },
    'correct': { type: Boolean, default: true },
    'highlight': { type: Boolean, default: false },
    'startValue': { type: Number, default: 0 },
    'min': { type: Number, default: 0 },
    'max': { type: Number, default: 9999 },
    'nullAvailable': { type: Boolean, default: false },
    'disabled': { type: Boolean, default: false },
    'showCheckbox': { type: Boolean, default: false },
    'checkboxDefault': { type: Boolean, default: false },
    'checkboxDisabled': { type: Boolean, default: false },
    'showLabel': { type: Boolean, default: false },
  },
  data() {
    return {
      stringValue: this.startValue === null ? "" : this.startValue.toString(),
      value: this.startValue,
      isfocused: false,
      checkbox: this.checkboxDefault,
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
      inp.style.width = `calc(max(${inp.value.length}ch, 10px) + 2px)`;
    },
    onNumberInput() {
      const sval = this.$refs.input.value;
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
    reset() {
      this.setValue(this.nullAvailable ? null : this.min);
    },
    setValue(val) {
      this.$refs.input.value = val === null ? "" : val.toString();
      this.onNumberInput();
      this.onNumberChange();
    }
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

.counter-container {
  color: black;
}

.counter-error {
  color: red;
}

.counter-container input {
  color: inherit;
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

.counter-container:hover .spinner, .counter-container:hover .checkbox {
  display: block !important;
}

.counter-container .checkbox .v-input--selection-controls__ripple {
  border-radius: 0;
  transform: scale(0.4);
  opacity: 1 !important;
}

/*
.counter-error .checkbox .v-input--selection-controls__ripple {
  color: red;
}

.counter-error .checkbox i {
  color: red !important;
}

.counter-error .checkbox .v-input--is-disabled i {
  color: #d39292 !important;
}

.counter-container:not(.counter-error) .checkbox .v-input--is-disabled i {
  color: #9d9d9d !important;
}
*/

</style>
