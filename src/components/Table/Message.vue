<template>
  <v-tooltip
      bottom
      :disabled="value.length === 0 || (value.length === 1 && !tooltipVisible)"
      :open-delay="500"
  >
    <template #activator="{ on, attrs} ">
      <div
          v-bind="attrs"
          ref="messageContainer"
          :style="containerStyle"
          class="text--secondary message-container"
          style="width: 100%"
          v-on="on"
          @mouseover="updateTooltip"
      >
        {{ value.concat([""])[0] + (value.length > 1 && !tooltipVisible ? '...' : '') }}
      </div>
    </template>
    <div style="max-width: 500px">
      <div v-if="value.length > 1" style="padding: 8px 12px 8px 8px">
        <ol>
          <li
              v-for="(msg, i) in value"
              :key="msg"
              :class="{'pt-2': i > 0}"
          >
            {{ msg }}
          </li>
        </ol>
      </div>
      <div v-else style="padding: 8px 12px 8px 12px">
        {{ value[0] }}
      </div>
    </div>
  </v-tooltip>
</template>

<script>

import errorMessages from "@/errorMessages";

export default {
  name: "Message",
  props: {
    messages: { type: Array, default: () => [] },
    containerStyle: { type: String, default: "" }
  },
  data() {
    return {
      tooltipVisible: true,
    }
  },
  computed: {
    value() {
      const res = this.messages.map((message) => errorMessages[message.key](...message.args));
      res.sort();
      return res;
    }
  },
  watch: {
    messages() { this.updateTooltip(); }
  },
  mounted() {
    this.updateTooltip();
  },
  methods: {
    updateTooltip() {
      const el = this.$refs.messageContainer;
      this.tooltipVisible = el.offsetWidth < el.scrollWidth;
    },
  }
}
</script>

<style>

.message-container {
  display: inline-block;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.v-tooltip__content {
  padding: 0 !important;
  background: rgba(97, 97, 97, 1) !important;
}

.v-tooltip__content.menuable__content__active {
  opacity: 1 !important;
}

</style>
