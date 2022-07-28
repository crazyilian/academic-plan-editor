<template>
  <v-container class="rounded-lg pb-2 tabs-container">
    <v-btn
        v-for="(template, i) in tabsTemplates"
        :key="JSON.stringify(template.config) + `;${i}`"
        plain
        :class="{ 'active': i === value, 'mt-2': i !== 0}"
        :color="i === value ? 'black' : 'white'"
        class="text-none tab-button px-0 py-1"
        style="width: 100%"
        @click="$emit('input', i)"
    >
      <EditableText
          class="ml-1"
          :value="template.config.name"
          :editing="editingNameId === i"
          @change="nameChange(i, $event)"
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

    <v-card flat class="pa-0 add-menu-container" :class="{'pt-2': tabsTemplates.length > 0}">
      <v-menu bottom offset-y>
        <template #activator="{ on, attrs }">
          <v-btn
              text
              color="#d6d6d6"
              style="text-transform: none;"
              dark
              v-bind="attrs"
              class="px-3"
              v-on="on"
          >
            <span class="mr-2">{{ ADD_STRING }}</span>
            <v-icon color="#51BB19">mdi-plus</v-icon>
          </v-btn>
        </template>

        <v-list>
          <v-list-item
              v-for="(template, i) in templates"
              :key="i"
              @click="addTab(i)"
          >
            <v-list-item-title>{{ template.config.title }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-card>
  </v-container>
</template>

<script>

import EditableText from "@/components/EditableText";
import Vue from "vue";

const ADD_STRING = "Создать УП";

export default {
  name: "EditorTabs",
  components: { EditableText },
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
    }
  },
  methods: {
    addTab(i) {
      this.$emit('add-tab', i);
    },
    async askCloseTab(i) {
      const buttonId = await window.ipcRenderer.messageBox({
        'type': 'question',
        'title': 'Закрытие...',
        'message': 'Вы уверены, что хотите закрыть план?',
        'detail': `Все введённые данные по учебному плану "${this.tabsTemplates[i].config.name}" будут удалены.`,
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
    },
    nameChange(i, newName) {
      Vue.set(this.tabsTemplates[i].config, 'name', newName);
      this.editingNameId = null;
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
  transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
  background-color: rgba(255, 255, 255, 0.08);
}

.tab-button .v-icon::after {
  display: none !important;
}

.tab-button .v-btn__content {
  white-space: break-spaces !important;
  flex: 0 1 auto !important;
  display: flex !important;
  justify-content: space-between;
  align-items: stretch;
  width: 100%;
  height: auto;
}

.tab-button {
  height: auto !important;
}

/* New Tab */

/*.add-select .mdi-menu-down::before {*/
/*  content: "\F0415"*/
/*}*/

/*.add-select .mdi-menu-down {*/
/*  color: rgb(81, 187, 25);*/
/*  caret-color: rgb(81, 187, 25);*/
/*}*/

/*.add-select > .v-input__control > .v-input__slot {*/
/*  background-color: rgba(0, 0, 0, 0) !important;*/
/*}*/

/*.add-select > .v-input__control .v-select__slot {*/
/*  display: flex;*/
/*  justify-content: center;*/
/*}*/

/*.add-select > .v-input__control .v-select__slot > .v-input__append-inner {*/
/*  margin: 0;*/
/*}*/

/*.add-select > .v-input__control > .v-input__slot:hover {*/
/*  background-color: rgba(255, 255, 255, 0.1) !important;*/
/*}*/

/*.add-select > .v-input__control > .v-input__slot {*/
/*  margin-bottom: 0 !important;*/
/*}*/

/*.add-select .v-select__selection {*/
/*  color: #bbbbbb;*/
/*  overflow: visible;*/
/*  text-overflow: clip;*/
/*  max-width: 100%;*/
/*}*/

/*.add-select .v-select__selections input {*/
/*  display: none;*/
/*}*/

/*.add-select .v-select__selections {*/
/*  flex: 0 1 auto;*/
/*}*/

/*.add-select .v-text-field__details {*/
/*  display: none;*/
/*}*/

/*.v-menu__content > .v-select-list > div:last-child {*/
/*  display: none;*/
/*}*/

.add-menu-container {
  background-color: rgba(0, 0, 0, 0) !important;
  min-height: 42px;
  width: 100%;
  display: flex;
  justify-content: center;
}

.add-menu-container button {

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

</style>
