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
    <EditableText
        :value="newName"
        :editing="editing"
        style="min-width: 0; width: 35%;"
        @change="changeName"
    />
    <Message
        container-style="width: 65%; margin-left: 24px; margin-right: 24px; min-width: 20px"
        :messages="messages"
    />
    <div style="display: flex; flex-direction: row-reverse">
      <div v-for="(group, i) in gradeGroups" :key="group[0].id" style="display: flex">
        <div
            v-for="(grade, j) in group"
            :key="grade.id"
        >
          <Counter
              v-if="isGoodProfile(grade)"
              ref="counters"
              :correct="countersCorrectTop[i][j]"
              :highlight="highlight[i][j]"
              :start-value="plan[i][j]"
              :max="99"
              @input="counterChange(i, j, $event)"
          />
          <div v-else style="width: 48px"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import Counter from "@/components/Counter";
import Message from "@/components/Table/Message";
import Vue from "vue";
import { fillShape2, isEqual } from "@/gradeProcessing";
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
    highlight: { type: Array, default: () => [] },
  },
  data() {
    return {
      messages: [],
      countersCorrectTop: fillShape2(this.gradeGroups, () => true),
      incorrectCntTop: 0,
      editing: false,
    }
  },
  computed: {
    correct() {
      return this.incorrectCntTop === 0;
    }
  },
  mounted() {
    this.validate();
  },
  methods: {
    editName() {
      this.editing = true;
    },
    changeName(name) {
      this.editing = false;
      this.$emit('change-name', name);
    },
    isGoodProfile(grade) {
      return isEqual(grade.profile, this.profile);
    },
    counterChange(i, j, value) {
      Vue.set(this.plan[i], j, value)
      this.validate();
    },
    validate() {
      this.messages = [];
      this.$emit('validate');
    },
    addMessages(...messages) {
      this.$nextTick(() => {
        this.messages.push(...messages);
      })
    },
    setCorrectness(val, ...gradeIds) {
      for (const [groupId, gradeId] of gradeIds) {
        if (this.countersCorrectTop[groupId][gradeId] !== val) {
          this.$nextTick(() => {
            Vue.set(this.countersCorrectTop[groupId], gradeId, val);
            this.incorrectCntTop += val ? -1 : +1;
          })
        }
      }
    }
  }
}
</script>

<style>

</style>
