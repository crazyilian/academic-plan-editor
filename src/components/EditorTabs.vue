<template>
  <v-container
      class="rounded-lg pb-2"
      style="background-color: #58536b; display: flex; flex-direction: column;  width: 250px; align-items: center"
  >
    <v-btn
        v-for="(template, i) in tabsTemplates"
        :key="i"
        plain
        :class="{ 'active': i === value, 'mt-2': i !== 0}"
        :color="i === value ? 'black' : 'white'"
        class="text-none tab-button pa-2 pr-0"
        style="width: 100%"
        @click="$emit('input', i)"
    >
          <span style="width: 100%; min-width: 0; text-align: left">
            {{ template.name }}
          </span>
      <div class="px-1" @click.stop="$emit('close-tab', i)">
        <v-hover v-slot="{ hover }" style="color: #b68484">
          <v-icon v-if="hover" color="error">mdi-close-circle</v-icon>
          <v-icon v-else color="#b68484">mdi-close-circle-outline</v-icon>
        </v-hover>
      </div>
    </v-btn>

    <v-card
        flat class="pa-0 pl-2" :class="{'pt-2': tabsTemplates.length > 0}"
        style="background-color: rgba(0, 0, 0, 0)"
    >
      <v-select
          v-model="addSelector"
          :items="templates.map(e => e.name).concat([ADD_STRING])"
          color="#51bb19"
          dense
          solo
          flat
          class="add-select"
      />
    </v-card>
  </v-container>
</template>

<script>

const ADD_STRING = "Добавить";

export default {
  name: "EditorTabs",
  props: {
    tabsTemplates: { type: Array, default: () => [] },
    templates: { type: Array, default: () => [] },
    value: { type: Number, default: 0 },
  },
  data() {
    return {
      ADD_STRING: ADD_STRING,
      addSelector: ADD_STRING,
    }
  },
  watch: {
    addSelector(newVal) {
      if (newVal === ADD_STRING)
        return;
      this.$nextTick(() => { this.addSelector = ADD_STRING });
      const templateIndex = this.templates.findIndex(e => e.name === newVal);
      this.$emit('add-tab', templateIndex);
    }
  },
}
</script>

<style>

.tab-button.v-btn--plain.active {
  background-color: white !important;
}

.tab-button.v-btn--plain.active .v-ripple__container {
  display: none !important;
}

.tab-button.v-btn--plain .v-btn__content {
  opacity: 1 !important;
}

.tab-button.v-btn--plain {
  background-color: rgba(255, 255, 255, 0);
}

.tab-button.v-btn--plain:hover:not(.active) {
  background-color: rgba(255, 255, 255, 0.1);
}

.tab-button .v-icon::after {
  display: none !important;
}

.tab-button .v-btn__content {
  white-space: break-spaces !important;
  flex: 0 1 auto !important;
  display: flex !important;
  justify-content: space-between;
  width: 100%;
  height: auto;
}

.add-select .mdi-menu-down::before {
  content: "\F0415"
}

.add-select .mdi-menu-down {
  color: rgb(81, 187, 25);
  caret-color: rgb(81, 187, 25);
}

.add-select > .v-input__control > .v-input__slot {
  background-color: rgba(0, 0, 0, 0) !important;
}
.add-select > .v-input__control  .v-select__slot {
  display: flex;
  justify-content: center;
}
.add-select > .v-input__control  .v-select__slot > .v-input__append-inner {
  margin: 0;
}

.add-select > .v-input__control > .v-input__slot:hover {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

.add-select .v-select__selection {
  color: #bbbbbb;
  overflow: visible;
  text-overflow: clip;
  max-width: 100%;
}
.add-select .v-select__selections input {
  display: none;
}

.add-select .v-select__selections {
  flex: 0 1 auto;
}

.add-select .v-text-field__details {
  display: none;
}

.v-menu__content > .v-select-list > div:last-child {
  display: none;
}


</style>