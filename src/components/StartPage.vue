<template>
  <div style="display: flex; flex-direction: column; align-items: center; width: 100%; height: 100%">
    <div class="mb-6" style="display: flex; flex-direction: column; align-items: center">
      <img :src="iconSource" alt="logo" width="80" height="80" class="mb-3">
      <h2>Редактор учебных планов</h2>
      <h5>v{{ appVersion }}</h5>
    </div>
    <div style="display: flex; flex-direction: column; align-items: center; width: 100%; min-height: 0; flex-grow: 1">
      <div style="flex: 1 1 0; max-height: 50px"/>
      <v-card class="start-page-card">
          <span class="start-page-card-title">Создать или открыть проект</span>
          <v-list style="overflow-y: auto" class="show-scrollbar">
            <v-list-item-group
                :value="projectListModel"
                color="indigo"
                @change="changeModel"
            >
              <v-list-item
                  v-for="(proj, i) in projectList"
                  :key="i"
                  class="start-page-list-item"
                  :class="{ 'start-page-list-item-disabled': !proj.valid }"
              >
                <div style="display: flex; justify-content: space-between; width: 100%">
                  <v-tooltip bottom :open-delay="500">
                    <template #activator="{ on, attrs} ">
                      <div style="display: flex" v-bind="attrs" v-on="on">
                        <div class="start-page-proj-name">
                          <span>{{ proj.name }}</span>
                        </div>
                        <v-icon class="pl-1 copy-icon" size="12" @click.stop="copyPath(i)">mdi-content-copy</v-icon>
                      </div>
                    </template>
                    <div class="pa-2" style="text-align: center; font-family: monospace">
                      {{ proj.path }}
                    </div>
                  </v-tooltip>
                  <div style="display: flex; align-items: stretch">
                    <v-tooltip v-if="!proj.valid" bottom :open-delay="500">
                      <template #activator="{ on, attrs} ">
                        <v-icon v-bind="attrs" color="error" v-on="on">mdi-alert</v-icon>
                      </template>
                      <div class="pa-2" style="text-align: center; max-width: 200px; word-wrap: break-word;">
                        Файл не найден
                      </div>
                    </v-tooltip>
                    <div style="font-size: 0.7rem; display: flex; align-items: center;" class="text--secondary px-1">
                      {{ parseDate(proj.date) }}
                    </div>
                    <div @click.stop="removeProject(i)">
                      <v-hover v-slot="{ hover }">
                        <v-icon v-if="hover" color="error">mdi-close-circle</v-icon>
                        <v-icon v-else color="errorSecondary">mdi-close-circle-outline</v-icon>
                      </v-hover>
                    </div>
                  </div>
                </div>
              </v-list-item>
            </v-list-item-group>
          </v-list>
          <v-divider class="mb-3 mt-3"/>
          <div style="display: flex; justify-content: flex-end; gap: 8px">
            <v-btn :loading="createLoading" color="createDark" dark style="text-transform: none" @click="createProject">
              Создать новый
            </v-btn>
            <v-btn :loading="openLoading" color="indigo" dark style="text-transform: none" @click="openProject">
              Открыть
            </v-btn>
          </div>
      </v-card>
    </div>
    <v-snackbar
        v-model="notificationModel"
        :timeout="2000"
    >
      Путь к файлу скопирован!
    </v-snackbar>
  </div>
</template>

<script>

export default {
  name: "StartPage",
  data() {
    return {
      openLoading: false,
      createLoading: false,
      projectList: [],
      projectListModel: undefined,
      notificationModel: false,
      appVersion: '',
      iconSource: require('@/assets/icon.png')
    }
  },
  mounted() {
    window.ipcRenderer.appInfo().then((info) => this.appVersion = info.version)
    this.updateProjectList();
  },
  methods: {
    parseDate(date) {
      return new Date(date).toLocaleString('ru-RU', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      });
    },
    createProject() {
      this.createLoading = true;
      window.ipcRenderer.createProject().then((r) => this.createLoading = r);
    },
    openProject() {
      this.openLoading = true;
      const ppath = this.projectListModel === undefined ? undefined : this.projectList[this.projectListModel].path;
      window.ipcRenderer.openProject(ppath).then((r) => {
        this.openLoading = r;
        this.updateProjectList();
      });
    },
    updateProjectList() {
      window.ipcRenderer.getProjectList().then((projectList) => {
        this.projectList = projectList;
        if (this.projectListModel !== undefined && !this.projectList[this.projectListModel].valid) {
          this.projectListModel = undefined;
        }
      });
    },
    changeModel(newModel) {
      const oldModel = this.projectListModel;
      this.projectListModel = newModel;
      if (newModel !== undefined && !this.projectList[newModel].valid) {
        this.$nextTick(() => { this.projectListModel = oldModel })
      }
    },
    copyPath(i) {
      const ppath = this.projectList[i].path;
      navigator.clipboard.writeText(ppath).then(() => { this.notificationModel = true; })
    },
    async removeProject(i) {
      const proj = this.projectList[i];
      const buttonId = await window.ipcRenderer.messageBox({
        'type': 'question',
        'title': 'Удаление...',
        'message': 'Вы уверены, что хотите удалить проект из этого списка?',
        'detail': proj.valid ? `Файл проекта "${proj.path}" не удалится.` : `Файл проекта "${proj.path}" не найден.`,
        'buttons': ['Да', 'Нет'],
        'cancelId': 1,
        'defaultId': 0,
        'noLink': true,
      });
      const remove = [true, false][buttonId];
      if (remove) {
        await window.ipcRenderer.removeFromProjectList(proj.path);
        this.updateProjectList();
      }
    }
  }
}
</script>

<style>


.start-page-card {
  width: 35%;
  min-width: 420px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 16px;
  max-height: min(420px, 100%);
  min-height: 135px;
  flex: 20 1 0;
}

.start-page-card-title {
  font-weight: 500;
  font-size: 1.1rem;
  margin-bottom: 8px;
}

.start-page-list-item {
  transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
}

.start-page-list-item:not(.v-item--active):focus:before {
  background-color: transparent;
  transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
}

.start-page-list-item-disabled {
  cursor: default !important;
  background-color: #ff00000a;
}

.start-page-list-item-disabled .start-page-proj-name {
  color: rgba(0, 0, 0, 0.6);
}

.start-page-proj-name {
  display: flex;
  align-items: center;
}

.start-page-list-item-disabled:before {
  background-color: transparent !important;
}

.start-page-list-item-disabled .v-ripple__container {
  display: none !important;
}

.copy-icon:hover {
  color: #484848;
}

.copy-icon:hover:before {
  font-weight: 600 !important;
}

.copy-icon:focus:after {
  display: none !important;
}

</style>
