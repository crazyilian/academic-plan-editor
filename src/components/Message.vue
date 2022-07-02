<template>
  <v-tooltip bottom :disabled="messages.length === 0 || (messages.length === 1 && !tooltipVisible)">
    <template #activator="{ on, attrs }">
      <div
          v-bind="attrs"
          ref="messageContainer"
          :style="containerStyle"
          class="text--secondary message-container mx-1"
          style="width: 100%"
          v-on="on"
          @mouseover="updateTooltip"
      >
        {{ messages.concat([""])[0] }}
      </div>
    </template>
    <div style="max-width: 500px">
      <div v-if="messages.length > 1" style="padding: 8px 12px 8px 8px">
        <ol>
          <li
              v-for="(msg, i) in messages"
              :key="i" style=""
          >
            {{ msg }}
          </li>
        </ol>
      </div>
      <div v-else style="padding: 8px 12px 8px 12px">{{ messages[0] }}</div>
    </div>
  </v-tooltip>
</template>

<script>
export default {
  name: "Message",
  props: {
    'messages': { type: Array, default: () => [] },
    'containerStyle': { type: String, default: "" }
  },
  data() {
    return {
      tooltipVisible: true,
    }
  },
  methods: {
    updateTooltip() {
      const el = this.$refs.messageContainer;
      this.tooltipVisible = el.offsetWidth < el.scrollWidth;
    }
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