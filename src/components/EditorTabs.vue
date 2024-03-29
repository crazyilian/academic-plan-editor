<template>
  <v-container class="rounded-lg pb-2 tabs-container">
    <v-btn
        v-for="(tab, i) in tabs"
        :key="tab.id"
        plain
        :class="{ 'active': i === value, 'mt-2': i !== 0}"
        :color="i === value ? 'black' : 'white'"
        class="text-none tab-button px-0 py-1"
        style="width: 100%"
        @click="$emit('input', i)"
    >
      <EditableText
          style="flex-grow: 1"
          class="ml-1"
          :value="tab.template.config.name"
          :editing="editingNameId === i"
          @change="nameChange(i, $event)"
      />
      <div class="pl-1 d-flex flex-column justify-center" @click="editName(i)">
        <v-hover v-slot="{ hover }">
          <v-icon v-if="hover" color="edit">mdi-pencil-box</v-icon>
          <v-icon v-else color="editSecondary">mdi-pencil-box-outline</v-icon>
        </v-hover>
      </div>
      <div class="pr-1 d-flex flex-column justify-center" @click.stop="askCloseTab(i)">
        <v-hover v-slot="{ hover }">
          <v-icon v-if="hover" color="error">mdi-close-circle</v-icon>
          <v-icon v-else color="errorSecondary">mdi-close-circle-outline</v-icon>
        </v-hover>
      </div>
    </v-btn>

    <v-card flat class="pa-0 add-menu-container" :class="{'pt-2': tabs.length > 0}">
      <Menu
          v-model="menuModel"
          :attrs="{'bottom': true, 'offset-y': true}"
          :data="[
                  {
                    type: 'text', name:'Выберите уровень образования',
                    data: { 'menu-title-text': true }
                  },
                  {type: 'divider' },
                  ...templates.map((template, i) => ({ type: 'value', name: template.config.title, data: i }))
                 ]"
          @choose="addTab"
      >
        <v-btn
            text
            color="#d6d6d6"
            style="text-transform: none; width: 100%"
            dark
            class="px-3"
        >
          <span class="mr-2">Создать УП</span>
          <v-icon color="create">mdi-plus</v-icon>
        </v-btn>
      </Menu>
    </v-card>
  </v-container>
</template>

<script>

import EditableText from "@/components/EditableText";
import Vue from "vue";
import Menu from "@/components/Menu";

export default {
  name: "EditorTabs",
  components: { Menu, EditableText },
  props: {
    tabs: { type: Array, default: () => [] },
    templates: { type: Array, default: () => [] },
    value: { type: Number, default: 0 },
  },
  data() {
    return {
      editingNameId: null,
      menuModel: false,
    }
  },
  methods: {
    addTab(i) {
      this.$emit('add-tab', i);
    },
    async askCloseTab(i) {
      const buttonId = await window.ipcRenderer.messageBox({
        'type': 'question',
        'title': 'Удаление...',
        'message': 'Вы уверены, что хотите удалить план?',
        'detail': `Все введённые данные по учебному плану "${this.tabs[i].template.config.name}" будут удалены.`,
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
      Vue.set(this.tabs[i].template.config, 'name', newName);
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

.add-menu-container {
  background-color: rgba(0, 0, 0, 0) !important;
  min-height: 42px;
  width: 100%;
  display: flex;
  justify-content: center;
}

/* Other */

.tabs-container {
  /*background-color: #58536b;*/
  background-color: var(--v-accent-base);
  display: flex;
  flex-direction: column;
  /*width: 250px;*/
  width: 100%;
  align-items: center;
  height: 100%;
  overflow: auto;
}

</style>
