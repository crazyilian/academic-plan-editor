<template>
  <div
      style="display: flex; justify-content: space-between; align-items: center; width: 100%"
      :class="{ 'error-subject': !correct }" class="subject pl-2"
  >
    <div class="pr-4 py-0 ma-0">
      <div @click="editName">
        <v-hover v-slot="{ hover }">
          <v-icon v-if="hover" color="edit">mdi-pencil-box</v-icon>
          <v-icon v-else color="editSecondary">mdi-pencil-box-outline</v-icon>
        </v-hover>
      </div>
    </div>
    <div style="display: flex; flex: 1 1 0; min-width: 0; align-items: stretch">
      <v-tooltip bottom :open-delay="500" :attach="$refs.tooltipContainer">
        <template #activator="{ on, attrs}">
          <div
              v-bind="attrs"
              style="min-width: 0; flex: 3 1 0; max-width: 300px; "
              v-on="on"
          >
            <EditableText
                ref="editableName"
                :value="newName"
                :editing="editing"
                @change="changeName"
            />
            <div ref="tooltipContainer" class="tooltip-container"/>
          </div>
        </template>
        <div class="pa-2" style="text-align: center; max-width: 200px; word-wrap: break-word;">
          {{ name }}
        </div>
      </v-tooltip>
      <Message
          container-style="flex: 3 1 0; margin-left: 24px; margin-right: 24px; min-width: 20px"
          :messages="messages"
      />
    </div>
    <ScrollSync style="display: flex" group="grades" horizontal>
      <div
          v-for="[i, group] in gradeGroups.map((g, i, s) => [s.length - i - 1, s[s.length - i - 1]])"
          :key="group[0].id"
          style="display: flex"
      >
        <div
            v-for="(grade, j) in group"
            :key="grade.id"
        >
          <Counter
              ref="counters"
              :hide="!isGoodProfile(grade)"
              :correct="Object.keys(incorrectRulesTop[i][j]).length === 0"
              :start-value="plan[i][j]"
              :max="99"
              @input="counterChange(i, j, $event)"
          />
        </div>
      </div>
    </ScrollSync>
  </div>
</template>

<script>

import Counter from "@/components/Counter";
import Message from "@/components/Table/Message";
import Vue from "vue";
import { fillShape2, isEqualProfile } from "@/gradeProcessing";
import EditableText from "@/components/EditableText";

export default {
  name: 'FormativeSubject',
  components: { EditableText, Message, Counter },
  props: {
    num: { type: Number, default: -1 },
    name: { type: String, default: "" },
    newName: { type: String, default: "" },
    gradeGroups: { type: Array, default: () => [] },
    plan: { type: Array, default: () => [] },
    profile: { type: Array, default: () => [] },
  },
  data() {
    return {
      messages: {},
      incorrectRulesTop: fillShape2(this.gradeGroups, () => ({})),
      editing: false,
      correct: true,
    }
  },
  mounted() {
    this.validate();
  },
  methods: {
    recalcCorrect() {
      this.correct = this.incorrectRulesTop.every(a => a.every(el => Object.keys(el).length === 0));
      this.$emit('set-correct', this.correct);
    },
    editName() {
      this.editing = true;
    },
    changeName(name) {
      this.editing = false;
      this.$emit('change-name', name);
    },
    isGoodProfile(grade) {
      return isEqualProfile(grade.profile, this.profile);
    },
    counterChange(i, j, value) {
      Vue.set(this.plan[i], j, value)
      this.validate();
    },
    validate() {
      this.$emit('validate');
    },
    addMessage(ruleId, groupId, message) {
      const key = JSON.stringify([ruleId, groupId]);
      if (message === undefined)
        Vue.delete(this.messages, key);
      else
        Vue.set(this.messages, key, message);
    },
    setCorrectness(val, ruleId, gradeIds) {
      for (const [groupId, gradeId] of gradeIds) {
        if (val)
          Vue.delete(this.incorrectRulesTop[groupId][gradeId], ruleId);
        else
          Vue.set(this.incorrectRulesTop[groupId][gradeId], ruleId, true);
      }
      this.recalcCorrect();
    }
  }
}
</script>

<style>

.tooltip-container .v-tooltip__content {
  left: 4px !important;
  top: 0 !important;
}

.tooltip-container {
  position: relative;
}

</style>
