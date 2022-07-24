<template>
  <div
      class="rounded edit-name-area-container"
      @click="spanClick"
  >
    <v-textarea
        ref="editField"
        v-model="editingValue"
        :disabled="!editing"
        :placeholder="value"
        solo
        auto-grow
        flat
        rows="1"
        dense
        class="edit-name-area"
        color="black"
        :style="{ 'background-color': editing ? '#eaeaea' : 'rgba(0, 0, 0, 0)'}"
        @keydown.enter="nameChange(true); buttonPress = true;"
        @keydown.esc="nameChange(false); buttonPress = true;"
        @focusout="focusOut()"
    />
  </div>
</template>

<script>
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
    }
  },
  methods: {
    nameChange(editFlag) {
      if (editFlag && this.editingValue !== null) {
        const newVal = this.editingValue.trim();
        if (newVal.length > 0) {
          this.$emit('change', newVal);
          return;
        }
      }
      this.$emit('change', this.value);
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

.edit-name-area > .v-input__control .v-select__slot {
  display: flex;
  justify-content: center;
}

.edit-name-area > .v-input__control .v-select__slot > .v-input__append-inner {
  margin: 0;
}

.edit-name-area .v-text-field__details {
  display: none;
}

.edit-name-area > .v-input__control > .v-input__slot {
  margin-bottom: 0 !important;
  height: 100%;
  padding: 0 6px !important;
  background-color: rgba(0, 0, 0, 0) !important;
  transition: none !important;
}

.edit-name-area {
  height: 100%;
  font: inherit !important;
  letter-spacing: inherit !important;
}

.edit-name-area > .v-input__control {
  min-height: 0 !important;
  height: 100%;
}

.edit-name-area textarea, .edit-name-area input {
  padding: 0 !important;
  letter-spacing: inherit !important;
  color: inherit !important;
}

.edit-name-area.v-input--is-disabled {
  color: inherit !important;
}

.edit-name-area-container {
  width: 100%;
  margin-left: 2px;
}

.hover-background {
  transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
}

.hover-background:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.edit-name-area.v-textarea.v-text-field--enclosed .v-text-field__slot {
  margin: 0 !important;
}

</style>
