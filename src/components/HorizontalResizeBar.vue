<template>
  <div class="horizontal-resize-bar-container">
    <div
        class="horizontal-resize-bar noselect"
        @mousedown="dragStart($event)"
    >
      <span style="margin-top: -1.5px; transform: scaleX(15)">-</span>
      <span style="margin-top: -0.5px; transform: scaleX(10)">=</span>
    </div>
  </div>
</template>

<script>
export default {
  name: "HorizontalResizeBar",
  props: {
    shift: { type: Number, default: 0 },
    min: { type: Number, default: 40 },
    max: { type: Number, default: 230 },
  },
  data() {
    return {
      isDragging: false,
    }
  },
  mounted() {
    window.addEventListener('mouseup', this.dragEnd)
    window.addEventListener('mousemove', this.dragging)
  },
  unmounted() {
    window.removeEventListener('mouseup', this.dragEnd, false)
    window.removeEventListener('mousemove', this.dragging, false)
  },
  methods: {
    dragStart() {
      this.isDragging = true
    },
    dragEnd() {
      this.isDragging = false
    },
    dragging(e) {
      if (this.isDragging) {
        const val = Math.max(Math.min(e.pageY + this.shift, this.max), this.min);
        this.$emit('input', val);
      }
    },
  }
}
</script>
<style>
.horizontal-resize-bar {
  height: 4px;
  cursor: ns-resize;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #bebebe;
  border: solid gray thin;
  transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
}

.horizontal-resize-bar-container {
  height: 8px;
  min-height: 8px;
  margin-top: -4px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.horizontal-resize-bar-container:hover .horizontal-resize-bar {
  height: 8px;
}

.horizontal-resize-bar span {
  font-size: 0.5em;
}

.horizontal-resize-bar span:nth-child(2) {
  display: none;
}

.horizontal-resize-bar-container:hover .horizontal-resize-bar span:nth-child(2) {
  display: block;
}

.horizontal-resize-bar-container:hover .horizontal-resize-bar span:nth-child(1) {
  display: none;
}

.noselect {
  -webkit-touch-callout: none; /* iOS Safari */
  -webkit-user-select: none; /* Safari */
  -khtml-user-select: none; /* Konqueror HTML */
  -moz-user-select: none; /* Old versions of Firefox */
  -ms-user-select: none; /* Internet Explorer/Edge */
  user-select: none; /* Chrome, Edge, Opera and Firefox */
}

</style>

