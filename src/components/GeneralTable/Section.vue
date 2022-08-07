<template>
  <v-expansion-panel>
    <v-expansion-panel-header
        disable-icon-rotate
        class="category"
        :class="{ 'error-category': !correct }"
    >
      <div style="display: flex; justify-content: space-between; align-items: center; width: calc(100% - 24px)">
        <div style="flex-grow: 4; display: inline-block; word-wrap: break-word" class="subject-name">
          {{ name }}
        </div>
        <Message
            container-style="margin-left: 12px; margin-right: 32px; min-width: 0; width: auto; flex-grow: 1"
            :messages="messages"
        />
      </div>
      <template #actions>
        <v-icon v-if="correct" color="teal">mdi-check</v-icon>
        <v-icon v-else color="error">mdi-alert-circle</v-icon>
      </template>
    </v-expansion-panel-header>
    <v-expansion-panel-content class="section-content">
      <Summary
          v-for="(el, i) in data"
          :id="i"
          :key="gradeGroups.length + '|' + i"
          ref="summaries"
          :grade-groups="gradeGroups"
          v-bind="el"
          :error-name="errorName"
          null-available
          :oninput="oninput"
          :highlight="highlight"
          @validate="validate"
      />
    </v-expansion-panel-content>
  </v-expansion-panel>
</template>

<script>

import Message from "@/components/Table/Message";
import Summary from "@/components/GeneralTable/Summary";
import Vue from "vue";

export default {
  name: 'Section',
  components: { Summary, Message },
  props: {
    name: { type: String, default: "" },
    errorName: { type: String, default: "" },
    gradeGroups: { type: Array, default: () => [] },
    dataRaw: { type: Array, default: () => [] },
    oninput: { type: Function, default: undefined },
    highlight: { type: Array, default: () => [] }
  },
  data() {
    return {
      messages: {},
      correct: false,
      data: this.getData(),
    }
  },
  watch: {
    dataRaw() {
      this.data = this.getData();
    }
  },
  methods: {
    validate() {
      this.correct = true;
      for (const summary of this.$refs.summaries) {
        summary.messages.forEach(message => this.addMessage(...message))
        this.correct &&= summary.correct;
      }
    },
    getData() {
      const data = [];
      const valsId = [];
      let minVal = undefined;
      let maxVal = undefined;
      for (const [i, d] of this.dataRaw.entries()) {
        if (d.type === 'max') {
          data.push({ name: 'Максимум', values: d.values, edit: false })
          maxVal = d.values;
        } else if (d.type === 'min') {
          data.push({ name: 'Минимум', values: d.values, edit: false })
          minVal = d.values;
        } else {
          data.push(d);
          valsId.push(i);
        }
      }
      for (const i of valsId) {
        data[i].mins = minVal;
        data[i].maxs = maxVal;
      }
      return data;
    },
    addMessage(ruleId, groupId, message) {
      const key = JSON.stringify([ruleId, groupId]);
      if (message === undefined)
        Vue.delete(this.messages, key);
      else
        Vue.set(this.messages, key, message);
    },
  }
}
</script>

<style>

.section-content .v-expansion-panel-content__wrap {
  padding-left: 16px;
  padding-right: 8px;
}

</style>
