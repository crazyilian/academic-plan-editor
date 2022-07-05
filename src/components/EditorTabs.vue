<template>
  <v-container class="rounded-lg pb-2 tabs-container">
    <v-btn
        v-for="(template, i) in tabsTemplates"
        :key="i"
        plain
        :class="{ 'active': i === value, 'mt-2': i !== 0}"
        :color="i === value ? 'black' : 'white'"
        class="text-none tab-button pa-0 py-2"
        style="width: 100%"
        @click="$emit('input', i)"
    >
      <span v-if="i !== editingNameId" style="width: 100%; min-width: 0; text-align: left" class="pl-2">
          {{ template.name }}
      </span>
      <v-text-field
          v-else
          ref="editName"
          v-model="editingName"
          :placeholder="template.name"
          solo
          flat
          dense
          class="edit-name-area"
          @keydown.enter="nameChange(true)"
          @keydown.esc="nameChange(false)"
          @focusout="nameChange(true)"
      />
      <div class="pl-1" @click="editName(i)">
        <v-hover v-slot="{ hover }">
          <v-icon v-if="hover" color="#deca35">mdi-pencil-box</v-icon>
          <v-icon v-else color="#bebb9b">mdi-pencil-box-outline</v-icon>
        </v-hover>
      </div>
      <div class="pr-1" @click.stop="askCloseTab(i)">
        <v-hover v-slot="{ hover }">
          <v-icon v-if="hover" color="error">mdi-close-circle</v-icon>
          <v-icon v-else color="#b68484">mdi-close-circle-outline</v-icon>
        </v-hover>
      </div>
    </v-btn>

    <v-card
        flat class="pa-0 pl-2" :class="{'pt-2': tabsTemplates.length > 0}"
        style="background-color: rgba(0, 0, 0, 0); min-height: 42px"
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
      editingNameId: null,
      editingName: null,
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
  methods: {
    async askCloseTab(i) {
      const buttonId = await window.ipcRenderer.messageBox({
        'type': 'question',
        'title': 'Закрытие...',
        'message': 'Вы уверены, что хотите закрыть план?',
        'detail': `Все введённые данные по учебному плану "${this.tabsTemplates[i].name}" будут удалены.`,
        'buttons': ['Да', 'Нет'],
        'cancelId': 1,
        'defaultId': 1,
        'noLink': true,
      });
      const close = [true, false][buttonId];
      if (close) {
        this.$emit('close-tab', i);
      }
    },
    editName(i) {
      this.editingNameId = i;
      this.editingName = this.tabsTemplates[i].name;
      this.$nextTick(() => { this.$refs.editName[0].focus() });
    },
    nameChange(editFlag) {
      if (editFlag && this.editingName !== null) {
        const newName = this.editingName.trim().substring(0, 250).trim();
        if (newName.length > 0) {
          this.$emit('edit-name', this.editingNameId, newName);
        }
      }
      this.editingNameId = null;
      this.editingName = null;
    }
  }
}
</script>

<style>

/* Tab Button */

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
  align-items: center;
  width: 100%;
  height: auto;
}

.tab-button {
  height: auto !important;
  min-height: 42px;
}

/* New Tab */

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

.add-select > .v-input__control .v-select__slot {
  display: flex;
  justify-content: center;
}

.add-select > .v-input__control .v-select__slot > .v-input__append-inner {
  margin: 0;
}

.add-select > .v-input__control > .v-input__slot:hover {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

.add-select > .v-input__control > .v-input__slot {
  margin-bottom: 0 !important;
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

/* Edit Name */

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
  /*background-color: rgba(255, 255, 255, 0.9) !important;*/
}

.edit-name-area {
  height: 100%;
}

.edit-name-area > .v-input__control {
  min-height: 0 !important;
  height: 100%;
}

/* Other */

.tabs-container {
  /*background-color: #58536b;*/
  background-color: #525252;
  display: flex;
  flex-direction: column;
  /*width: 250px;*/
  width: 100%;
  align-items: center;
  height: 100%;
  overflow: auto;
}

.tabs-container::-webkit-scrollbar {
  display: none;
}

</style>
