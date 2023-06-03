<template>
  <div
    id="symbol-picker-editor"
    ref="symbol-picker-editor"
    class="symbol-picker-container z-overlay bg-light-3 border border-dark-6 rounded-lg"
    :style="positionStyles"
  >
    <section class="flex flex-col">
      <div class="w-full" />
      <div class="flex justify-end items-center pr-2 w-full h-4">
        <button
          id="slide-editor-move-content"
          ref="slide-editor-move-content"
          class="cursor-move mr-3"
          @mousedown="dragMouseDown"
        >
          <FA icon="fal fa-equals text-dark-4 text-tn" />
        </button>
        <button
          @click.stop="$emit('closeSymbolPicker')"
        >
          <FA icon="far fa-times text-dark-4 text-tn" />
        </button>
      </div>
      <ul class="list-none flex flex-row border-b border-dark-6">
        <li
          v-for="(value, key, index) in symbols"
          :key="index"
          :class="['capitalize w-15 h-8 pt-2 relative flex text-xs flex-col items-center font-semibold cursor-pointer', activeSection === key ? 'text-lilac' : 'text-dark-4']"
          @click="switchSection(key, value)"
        >
          {{ keyTableValue(key, index) }}
          <div
            v-if="activeSection === key"
            class="list-item-underline w-full h-1 bg-lilac bottom-0 absolute"
          />
        </li>
      </ul>

      <section class="overflow-y-scroll h-64 max-w-75">
        <section
          v-for="(name, index) in activeSectionSymbols"
          :key="index"
          class="grid grid-cols-6-10 gap-2 px-2.5 w-full mt-3"
        >
          <button
            v-for="(symbol, indx) in name.symbols"
            :key="indx"
            class="w-10 h-10 rounded flex items-center justify-center text-base q-shadow bg-dark-5% active:bg-dark-10% text-dark-2 hover:text-dark-3"
            :aria-label="symbol.name"
            @mouseenter="addActiveButton(symbol.code, symbol.name)"
            @mouseleave="removeActiveButton()"
            @click.stop="handleSymbolClick(symbol.code, symbol.name)"
            v-html="symbol.code"
          />
        </section>
      </section>

      <section class="h-10 max-w-75 border-t border-dark-6 flex flex-row items-center text-dark-2 text-xs font-semibold">
        <button
          v-if="activeButton.code"
          class="mx-2 rounded flex items-center text-xs justify-center q-shadow px-3 py-2 bg-dark-5% active:bg-dark-10% text-dark-2 hover:text-dark-3 font-semibold"
          :aria-label="activeButton.name"
          @click.stop
          v-html="activeButton.code"
        />
        {{ activeButton.name }}
      </section>
    </section>
  </div>
</template>

<script>

import { KeyTable, Symbols } from '~/config/Symbols';

export default {
  props: {
    target: {
      type: String,
      default: null,
    },
  },
  emits: ['closeSymbolPicker'],

  data() {
    return {
      symbols: Symbols,
      activeSection: 'greek',
      activeSectionSymbols: Symbols.greek,
      activeButton: {
        name: null,
        code: null,
      },
      dragPosition: {
        pos1: 0,
        pos2: 0,
        pos3: 0,
        pos4: 0,
      },

      positionStyles: {
        position: 'absolute',
        left: '-14rem',
      },
    };
  },

  mounted() {
    setTimeout(() => {
      if (this.target && this.$parent.$refs[this.target]) {
        const target = this.$parent.$refs[this.target];
        const pos = target.$el.getBoundingClientRect();

        this.positionStyles = {
          position: 'fixed',
          left: `${pos.left}px`,
          top: `${pos.top + pos.height + 10}px`,
        };
      }
    });
  },

  methods: {
    onMoveCallback() {
      return false;
    },
    switchSection(sectionName, sectionSymbols) {
      this.activeSection = sectionName;
      this.activeSectionSymbols = sectionSymbols;
    },

    addActiveButton(code, name) {
      this.activeButton.name = name;
      this.activeButton.code = code;
    },

    removeActiveButton() {
      this.activeButton.name = null;
      this.activeButton.code = null;
    },

    handleSymbolClick(code, name) {
      this.$eventBus.$emit('slideEditorToolbar:addSymbol', { code, name });
    },
    dragMouseDown(event) {
      const e = event || window.event;
      e.preventDefault();
      this.dragPosition.pos3 = e.clientX;
      this.dragPosition.pos4 = e.clientY;
      document.onmouseup = this.closeDragElement;
      document.onmousemove = this.elementDrag;
    },

    closeDragElement() {
      document.onmouseup = null;
      document.onmousemove = null;
    },
    elementDrag(event) {
      const e = event || window.event;
      const elmnt = this.$refs['symbol-picker-editor'];
      e.preventDefault();
      this.dragPosition.pos1 = this.dragPosition.pos3 - e.clientX;
      this.dragPosition.pos2 = this.dragPosition.pos4 - e.clientY;
      this.dragPosition.pos3 = e.clientX;
      this.dragPosition.pos4 = e.clientY;
      elmnt.style.top = `${elmnt.offsetTop - this.dragPosition.pos2}px`;
      elmnt.style.left = `${elmnt.offsetLeft - this.dragPosition.pos1}px`;
    },

    keyTableValue(key, index) {
      return KeyTable[index];
    },
  },
};
</script>

<style>
  .grid-cols-6-10 {
    grid-template-columns: repeat(6, 40px);
  }
</style>
