<template>
  <div
      class="rounded edit-name-area-container"
      @mousedown="spanClick"
  >
    <div>
      <textarea
          ref="editField"
          v-model="editingValue"
          rows="1"
          style="width: 100%;"
          class="edit-name-area"
          :disabled="!editing"
          @keydown.enter="nameChange(true); buttonPress = true;"
          @keydown.esc="nameChange(false); buttonPress = true;"
          @focusout="focusOut()"
      />
    </div>
  </div>
</template>

<script>

import autosize from "autosize";

export default {
  name: "EditableText",
  props: {
    editing: { type: Boolean, default: false },
    value: { type: String, default: "" }
  },
  data() {
    return {
      editingValue: this.value,
      buttonPress: false,
    }
  },
  watch: {
    editing() {
      if (this.editing) {
        this.editingValue = this.value;
        this.$nextTick(() => this.$refs.editField.focus());
      }
    },
  },
  mounted() {
    autosize(this.$refs.editField);
  },
  methods: {
    applyVal(val) {
      this.editingValue = val;
      this.$emit('change', val);
    },
    nameChange(editFlag) {
      if (editFlag && this.editingValue !== null) {
        const newVal = this.editingValue.trim();
        if (newVal.length > 0) {
          this.applyVal(newVal);
          return;
        }
      }
      this.applyVal(this.value);
    },
    focusOut() {
      if (this.buttonPress) {
        this.buttonPress = false;
      } else {
        this.nameChange(true);
      }
    },
    spanClick() {
      if (!this.editing) {
        this.$emit('span-click');
      }
    }
  }
}
</script>

<style>

.hover-background {
  transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
}

.hover-background:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.edit-name-area-container * {
  color: inherit;
  letter-spacing: inherit;
  font: inherit;
}

.edit-name-area {
  outline: none;
  padding-left: 4px;
}

.edit-name-area-container {
  width: 100%;
  padding: 2px;
  display: flex;
  align-items: center;
}

.edit-name-area-container > div {
  display: flex;
  align-items: center;
  width: 100%;
}

.edit-name-area-container:focus-within {
  background-color: rgba(0, 0, 0, 0.13);
}

</style>
