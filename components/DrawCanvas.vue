<template>
  <div
    class="bg-center bg-no-repeat bg-contain rounded-lg svg-container bg-light-3 shrink-1 grow-0"
    :style="`background-image: url(${bgImage})`"
    @mousedown="handleMouseDown"
    @mousemove="handleMouseMove"
    @mouseup="handleMouseUp"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleMouseUp"
  >
    <svg
      ref="svg"
      viewBox="0 0 640 640"
      xmlns="http://www.w3.org/2000/svg"
      :width="width"
      :height="height"
    >
      <path
        v-for="path in paths"
        :id="path._id"
        :key="path._id"
        :d="path.path"
        :stroke-width="path.meta.lineWidth"
        :stroke="highlightedPath === path._id ? 'yellow' : path.meta.color"
        stroke-linejoin="round"
        stroke-linecap="round"
        :opacity="path.meta.opacity"
        fill="transparent"
        @mouseenter="highlightPath(path._id)"
        @mouseleave="clearHightlightedPath(path._id)"
        @touchstart="highlightPath(path._id)"
        @touchend="clearPath(path._id)"
      />
    </svg>
  </div>
</template>

<script>
import { nanoid } from 'nanoid';
import cloneDeep from 'lodash/cloneDeep';

import simplifySVGPath from '~/utils/SimplifySvgPath.js';

export default {
  props: {
    width: {
      type: Number,
      default: 400,
    },
    height: {
      type: Number,
      default: 400,
    },
    lineWidth: {
      type: Number,
      default: 2,
    },
    color: {
      type: String,
      default: '#000',
    },
    opacity: {
      type: Number,
      default: 1,
    },
    currentTool: {
      type: String,
      default: 'pen',
    },
    bgImage: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      drawing: false,
      currentPathId: '',
      currentPath: null,
      currentPathString: '',
      currentPathStringArray: [],
      fullSimplifiedPathString: '',
      paths: [],
      historyStack: [],
      historyCursor: -1,
      pathSimplifyOptions: {
        tolerance: 50,
        precision: 1,
      },
      svgBoundingClientRect: null,
      highlightedPath: '',
    };
  },

  computed: {
    scaleX() {
      return 640 / this.width;
    },

    scaleY() {
      return 640 / this.height;
    },
  },

  mounted() {
    this.svgBoundingClientRect = this.$refs.svg.getBoundingClientRect();
  },

  methods: {
    handleMouseDown(ev) {
      if (this.currentTool === 'pen') {
        this.drawing = true;
        this.createPath({ x: ev.offsetX * this.scaleX, y: ev.offsetY * this.scaleY });
      } else if (this.currentTool === 'eraser') {
        if (this.highlightedPath) {
          this.clearPath(this.highlightedPath);
          this.highlightedPath = '';
        }
      }
    },

    handleTouchStart(ev) {
      if (this.currentTool === 'pen') {
        this.drawing = true;
        const touch = ev.changedTouches[0];
        const offsetX = touch.clientX - this.svgBoundingClientRect.left;
        const offsetY = touch.clientY - this.svgBoundingClientRect.top;
        this.createPath({ x: offsetX * this.scaleX, y: offsetY * this.scaleY });
      }
      ev.preventDefault();
    },

    handleMouseMove(ev) {
      if (this.drawing) {
        this.concatToPath({ x: ev.offsetX * this.scaleX, y: ev.offsetY * this.scaleY });
      }
    },

    handleTouchMove(ev) {
      if (this.drawing) {
        const touch = ev.changedTouches[0];
        const offsetX = touch.clientX - this.svgBoundingClientRect.left;
        const offsetY = touch.clientY - this.svgBoundingClientRect.top;
        this.concatToPath({ x: offsetX * this.scaleX, y: offsetY * this.scaleY });
        ev.preventDefault();
      }
    },

    handleMouseUp() {
      if (this.drawing) {
        this.pushHistory({
          op: 'create',
          path: cloneDeep(this.currentPath),
        });
        this.simplifyCurrentPath();
        this.currentPathString = '';
        this.drawing = false;
        this.currentPath = null;
        this.currentPathId = '';
        this.fullSimplifiedPathString = '';
      }
    },

    createPath({ x, y }) {
      const _id = nanoid(6);
      const path = {
        _id,
        path: `M ${x} ${y}`,
        pathArray: [[x, y]],
        meta: {
          lineWidth: this.lineWidth,
          color: this.color,
          opacity: this.opacity,
        },
      };

      this.paths.push(path);
      this.currentPathString = path.path;
      this.currentPathStringArray = [[x, y]];
      this.currentPath = path;
      this.currentPathId = path._id;
    },

    concatToPath({ x, y }) {
      this.currentPath.path += ` L ${x} ${y}`;
      this.currentPath.pathArray.push([x, y]);
      this.currentPathString += `L ${x} ${y}`;
      this.currentPathStringArray.push([x, y]);
    },

    undoClear() {
      this.paths = this.historyStack.pop().reverse();
    },

    pushHistory(operation) {
      this.historyCursor += 1;
      this.historyStack[this.historyCursor] = operation;
      if (this.historyStack.length > this.historyCursor + 1) {
        this.historyStack.splice(this.historyCursor + 1);
      }
    },

    undo() {
      if (this.historyCursor >= 0) {
        const operation = this.historyStack[this.historyCursor];
        if (operation.op === 'create') {
          this.removePath(operation.path._id);
        } else if (operation.op === 'delete') {
          this.paths.push(operation.path);
        } else if (operation.op === 'clear') {
          this.paths = operation.paths;
        }
        this.historyCursor -= 1;
      }
    },

    redo() {
      if (this.historyCursor < this.historyStack.length - 1) {
        this.historyCursor += 1;
        const operation = this.historyStack[this.historyCursor];
        if (operation.op === 'create') {
          this.paths.push(operation.path);
        } else if (operation.op === 'delete') {
          this.removePath(operation.path._id);
        } else if (operation.op === 'clear') {
          this.paths = [];
        }
      }
    },

    clear() {
      this.pushHistory({
        op: 'clear',
        paths: cloneDeep([...this.paths]),
      });
      this.paths = [];
    },

    simplifyCurrentPath() {
      if (!this.currentPathStringArray[1]) { return; }
      this.currentPathString = simplifySVGPath(this.currentPathStringArray, this.pathSimplifyOptions);
      if (this.fullSimplifiedPathString) {
        this.currentPathString = this.currentPathString.replace('M', 'L');
      }
      this.fullSimplifiedPathString += this.currentPathString;
      this.currentPath.path = this.fullSimplifiedPathString;
    },

    getEvents() {
      if (this.drawing) {
        this.simplifyCurrentPath();
      }
      this.currentPathString = '';
      this.currentPathStringArray = [];
      const { events } = this;
      this.events = [];

      return events;
    },

    highlightPath(_id) {
      if (this.currentTool === 'eraser') {
        this.highlightedPath = _id;
      }
    },

    clearHightlightedPath(_id) {
      if (this.currentTool === 'eraser' && this.highlightedPath === _id) {
        this.highlightedPath = '';
      }
    },

    removePath(_id) {
      const index = this.paths.findIndex((item) => item._id === _id);
      this.paths.splice(index, 1);
    },

    clearPath(_id) {
      if (this.currentTool === 'eraser') {
        this.pushHistory({
          op: 'delete',
          path: cloneDeep(this.paths.find((item) => item._id === _id)),
        });
        this.removePath(_id);
        this.highlightedPath = '';
      }
    },

    getSVG() {
      return `
        <svg xmlns="http://www.w3.org/2000/svg" width="${this.width}" height="${this.height}">
          ${
  this.paths.map((path) => `
                <path
                  id="${path._id}"
                  d="${path.path}"
                  stroke-width="${path.meta.lineWidth}"
                  stroke="${path.meta.color}"
                  stroke-linejoin="round"
                  stroke-linecap="round"
                  fill="transparent">
                </path>`).join('')
}
        </svg>
      `.trim();
    },
  },
};
</script>

<style>
  path {
    pointer-events: fill;
  }
</style>
