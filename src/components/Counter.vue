<template>
  <v-container class="pa-0 mx-1" style="width: 40px; min-width: 40px">
    <v-text-field
        ref="input"
        v-model="stringValue"
        class="py-0 counter-field"
        :class="{'error-counter': !correct}"
        hide-details
        single-line
        type="number"
        :min="min"
        :max="max"
        :color="!correct ? 'red' : 'black'"
        @input="onNumberInput"
        @change="onNumberChange"
        @focus="$event.target.select()"
    />
  </v-container>
</template>

<script>

export default {
  name: 'Counter',
  components: {},
  props: {
    'id': { type: Number, default: -1 },
    'correct': { type: Boolean, default: true }
  },
  data: () => ({
    min: 0,
    max: 99,
    stringValue: "0",
    value: 0
  }),
  methods: {
    onNumberInput() {
      let newStringValue = this.stringValue;
      this.value = Number(this.stringValue)
      if (this.value > this.max) {
        this.value = this.max;
        newStringValue = this.max.toString();
      }
      if (this.value < this.min) {
        this.value = this.min;
        newStringValue = this.min.toString();
      }
      this.$nextTick(() => {this.stringValue = newStringValue;})
      this.update();
    },
    onNumberChange() {
      this.stringValue = this.value.toString();
    },
    reset() {
      this.stringValue = "0";
      this.onNumberInput();
    },
    update() {
      this.$emit('input');
    },
  }
}
</script>

<style>

.counter-field input {
  text-align: right;
}

.counter-field input:hover {
  text-align: center;
}

.counter-field input:focus {
  text-align: center;
}

.counter-field.error-counter input {
  color: red !important;
}

.error-counter {
  color: red !important;
}

</style>