<template>
  <div class="formation-subject">
    <div class="mr-1">
      <span>{{ id + 1 }}.</span>
    </div>
    <div
        v-if="!editing"
        style="min-width: 0; text-align: left; flex-grow: 1"
        class="pl-2"
    >
      <span>{{ name }}</span>
    </div>
    <v-text-field
        v-else
        ref="editName"
        v-model="editingName"
        :placeholder="name"
        solo
        flat
        dense
        class="edit-name-area"
        @keydown.enter="nameChange(true)"
        @keydown.esc="nameChange(false)"
        @focusout="nameChange(true)"
    />
    <div class="ml-1" @click="editName">
      <v-hover v-slot="{ hover }">
        <div style="display: flex">
          <div class="text--secondary pl-2 pr-1 icon-label">
            <span>Изменить</span>
          </div>
          <v-icon v-if="hover" color="#deca35">mdi-pencil-box</v-icon>
          <v-icon v-else color="#bebb9b">mdi-pencil-box-outline</v-icon>
        </div>
      </v-hover>
    </div>
    <div class="pr-1 pl-2" @click.stop="askRemove">
      <v-hover v-slot="{ hover }">
        <div style="display: flex">
          <div class="text--secondary pr-1 icon-label">
            <span>Удалить</span>
          </div>
          <v-icon v-if="hover" color="error">mdi-close-circle</v-icon>
          <v-icon v-else color="#b68484">mdi-close-circle-outline</v-icon>
        </div>
      </v-hover>
    </div>
  </div>
</template>

<script>
export default {
  name: "FormativeSubject",
  props: {
    id: { type: Number, default: -1 },
    editing: { type: Boolean, default: false },
    name: { type: String, default: "" },
  },
  data() {
    return {
      editingName: null,
    }
  },
  mounted() {
    if (this.editing) {
      this.editingName = "";
      this.$refs.editName.focus();
    }
  },
  methods: {
    async askRemove() {
      const buttonId = await window.ipcRenderer.messageBox({
        'type': 'question',
        'title': 'Удаление...',
        'message': 'Вы уверены, что хотите удалить предмет?',
        'detail': `Предмет из формируемой части "${this.name}" будет удалён.`,
        'buttons': ['Да', 'Нет'],
        'cancelId': 1,
        'defaultId': 0,
        'noLink': true,
      });
      const remove = [true, false][buttonId];
      if (remove) {
        this.$emit('remove-subject');
      }
    },
    editName() {
      this.$emit('edit-subject');
      this.editingName = this.name;
      this.$nextTick(() => { this.$refs.editName.focus(); })
    },
    nameChange(editFlag) {
      if (editFlag && this.editingName !== null) {
        const newName = this.editingName.trim();
        if (newName.length > 0) {
          this.$emit('change-name', newName);
        }
      }
      this.$emit('stop-editing')
      this.editingName = null;
    }
  }
}
</script>

<style>

.formation-subject {
  display: flex;
  width: 100%;
  height: auto;
  min-height: 32px;
  align-items: center;
  padding: 8px 4px;
}

.formation-subject:hover {
  transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
  background-color: #eeeeee;
}

.formation-subject .edit-name-area.theme--light.v-text-field--solo > .v-input__control > .v-input__slot {
  background-color: inherit !important;
}

.formation-subject .edit-name-area {
  font-weight: 500;
}

.formation-subject .mdi {
  font-size: 24px;
}

.icon-label {
  font-size: 11pt;
  display: flex;
  align-items: center;
}

</style>
