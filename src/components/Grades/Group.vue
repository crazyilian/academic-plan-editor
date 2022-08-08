<template>
  <div
      style="display: flex; flex-direction: column"
      class="group"
      :class="{'group-editing': editing}"
      :style="{width: `${48 * group.length}px`}"
  >
    <div class="group-button-container noselect">
      <div class="group-button-container-wrapper">
        <div class="group-remove-button" @click.stop="askCloseGroup">
          <div class="group-button-wrapper">
            <span>Удалить</span>
          </div>
        </div>
        <div v-if="iscustom" class="group-edit-button" @click.stop="editGroupName">
          <div class="group-button-wrapper">
            <span>Изменить</span>
          </div>
        </div>
        <div v-if="iscustom" class="group-save-button" @click.stop="saveGroupName">
          <div class="group-button-wrapper">
            <span>Сохранить</span>
          </div>
        </div>
        <v-btn style="width: 0; min-width: 0; padding: 0; height: 0; min-height: 0"/>
        <!-- crazy fix of bluring rotated text while pressing button -->
      </div>
    </div>
    <div style="display: flex; flex-grow: 1; min-height: 0">
      <VerticalLine v-if="last" right/>
      <div v-if="!editing" style="display: flex; min-height: 0; width: 100%">
        <div v-for="(grade, j) in group" :key="grade.id">
          <Grade
              :grade="grade"
              @highlight="setHighlight(j, $event)"
          />
        </div>
      </div>
      <EditableText
          v-else
          style="border-radius: 0 !important"
          class="editable-profile-name"
          :value="parsed.pretty"
          :editing="editing"
          @change="saveGroupName"
      />
      <VerticalLine/>
    </div>
  </div>
</template>

<script>
import Grade from "@/components/Grades/Grade";
import VerticalLine from "@/components/VerticalLine";
import { getGroupProfile, parseProfile } from "@/gradeProcessing";
import EditableText from "@/components/EditableText";
import Vue from "vue";

export default {
  name: "Group",
  components: { EditableText, VerticalLine, Grade },
  props: {
    last: { type: Boolean, default: false },
    group: { type: Array, default: () => [] },
  },
  data() {
    return {
      iscustom: getGroupProfile(this.group).length === 3,
      editing: false,
    }
  },
  computed: {
    parsed() {
      return parseProfile(getGroupProfile(this.group));
    }
  },
  methods: {
    async askCloseGroup() {
      const min = this.group[0].name;
      const max = this.group.slice(-1)[0].name;
      const profile = parseProfile(getGroupProfile(this.group)).pretty;
      const buttonId = await window.ipcRenderer.messageBox({
        'type': 'question',
        'title': 'Удаление...',
        'message': "Вы уверены, что хотите удалить классы?",
        'detail': `Классы ${min}-${max} профиля "${profile}" будут удалены из плана.`,
        'buttons': ['Да', 'Нет'],
        'cancelId': 1,
        'defaultId': 1,
        'noLink': true,
      });
      const remove = [true, false][buttonId];
      if (remove) {
        this.$emit('remove-group');
      }
    },
    setHighlight(j, flag) {
      this.$emit('highlight', [j, flag]);
    },
    editGroupName() {
      this.editing = true;
    },
    saveGroupName(val) {
      this.group.forEach((grade) => Vue.set(grade.profile, 2, val));
      this.editing = false;
    }
  }
}
</script>

<style>

.group-button-container {
  font-size: 10px;
  font-weight: 500;
  margin-left: -1px;
  width: calc(100% + 1px);
}

.group-button-container-wrapper {
  width: 100%;
  height: 15px;
  display: flex;
}

.group-remove-button, .group-edit-button, .group-save-button {
  display: none;
  height: 100%;
  flex: 1 1 0;
  min-width: 0;
}

.group-button-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
  cursor: pointer;
  overflow: hidden;
}

.group-button-wrapper:hover {
  background-color: rgba(0, 0, 0, 0.08);
}

.group-button-wrapper:active {
  background-color: rgba(0, 0, 0, 0.3);
}

.group-remove-button {
  background-color: var(--v-errorLight-base);
}

.group-edit-button {
  background-color: var(--v-edit-base);
}

.group-save-button {
  background-color: var(--v-createLight-base);
}

.group:hover .group-remove-button, .group:hover .group-edit-button {
  display: block;
}

.group-editing .group-remove-button, .group-editing .group-edit-button {
  display: none !important;
}

.group .group-save-button {
  display: none !important;
}

.group-editing .group-save-button {
  display: block !important;
}

.editable-profile-name {
  width: 100%;
  height: 100%;
  font-size: 0.8rem;
  font-weight: 500;
  overflow: scroll;
}

</style>
