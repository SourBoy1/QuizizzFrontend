<template>
  <div
    class="absolute left-0 border rounded-lg color-palette z-overlay bg-light-3 border-dark-6"
    :style="containerStyles"
    @mousedown="(ev) => { ev.preventDefault() }"
    @click.stop
  >
    <Checkbox
      v-if="hasAutomaticColor"
      :inputId="getUUID()"
      class="pb-2 text-dark-90%"
      :label="$i18n('Automatic (based on theme)')"
      name="checkboxes"
      size="md"
      :checked="isColorAutomatic"
      :disabled="isColorAutomatic"
      @change="onAutomaticToggle"
    />
    <div
      class="grid"
      :class="[
        gridColumnClass,
        colorGridSpacingClass,
        { 'rounded overflow-hidden': !doColorBoxesHaveSpacing },
      ]"
    >
      <ColorTile
        v-for="(color, index) in colors"
        :key="index"
        :hoverEffect="doColorBoxesHaveSpacing ? 'border' : 'scale'"
        :checked="equalsHex(pickedColor, color.value)"
        :color="color.value"
        :aria-label="color.name"
        :class="{ 'rounded shadow hover:border-lilac': doColorBoxesHaveSpacing }"
        :height="colorBoxSize[1]"
        @onColorPick="pickColor(color.value)"
      />
    </div>
    <label
      v-if="showColorValueInput"
      :for="rgbInput"
      class="text-sm text-dark-3"
    ><i18n> Enter the color code</i18n></label>
    <div
      v-if="showColorValueInput"
      class="bg-dark-10% rounded p-0.5 pl-2.5 flex mt-2 h-8 text-dark-3 text-sm"
    >
      #
      <div class="pl-2.5 w-full h-full">
        <input
          :id="rgbInput"
          :value="rgbStringToHex(pickedColor).replace('#', '')"
          class="w-full h-full p-2 text-sm text-dark-3"
          type="text"
          @input="handleColorValueInput"
        />
      </div>
    </div>
  </div>
</template>

<script>
import isEmpty from 'lodash/isEmpty';
import isNaN from 'lodash/isNaN';

import { hexToRGB, rgbStringToHex } from '~/services/ColorService.js';
import { getUUID } from '~/services/UIDService.js';

export default {
  props: {
    colors: {
      type: Array,
      default: () => ([]),
    },

    pickedColorReceived: {
      type: String,
      default: '#D92635',
    },

    numColumns: {
      type: Number,
      default: 10,
    },

    /**
     * This corresponds to the size of the color box in px as [width, height]
     */
    colorBoxSize: {
      type: Array,
      default: () => ([30, 24]),
    },

    /**
     * Corresponds to a `gap` class like `gap-1`
     */
    colorGridSpacingClass: {
      type: String,
      default: '',
    },

    hasAutomaticColor: {
      type: Boolean,
      default: false,
    },

    showColorValueInput: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['pickColor', 'onAutomaticToggle'],

  data() {
    return {
      pickedColor: '',
      rgbInput: getUUID(),
    };
  },

  computed: {
    gridColumnClass() {
      return `grid-cols-${this.numColumns}`;
    },

    doColorBoxesHaveSpacing() {
      return !isEmpty(this.colorGridSpacingClass);
    },

    containerStyles() {
      const containerPadding = 12;
      let width = (2 * containerPadding) + (this.colorBoxSize[0] * this.numColumns);

      if (this.doColorBoxesHaveSpacing) {
        const spacing = parseFloat(this.colorGridSpacingClass.replace('gap-', ''));

        if (!isNaN(spacing)) {
          width += (spacing * 4) * (this.numColumns - 1);
        }
      }

      return {
        padding: `${containerPadding}px`,
        width: `${width}px`,
      };
    },

    isColorAutomatic() {
      if (!this.pickedColor) {
        return true;
      }
      const colorValues = this.colors?.map((color) => color.value) || [];
      return !(colorValues.includes(this.pickedColor) || colorValues.includes(rgbStringToHex(this.pickedColor)));
    },
  },

  created() {
    this.pickedColor = this.pickedColorReceived;
  },

  methods: {
    getUUID() {
      return getUUID();
    },

    pickColor(color) {
      this.pickedColor = color;
      this.$emit('pickColor', hexToRGB(color));
    },

    equalsHex(color, hex) {
      return color === hex || color === hexToRGB(hex);
    },

    rgbStringToHex,

    onAutomaticToggle(checked) {
      this.$emit('onAutomaticToggle', checked);
    },

    handleColorValueInput(ev) {
      const colorRegex = /^#[0-9A-F]{6}$/i;
      const colorString = `#${ev.target.value}`;

      if (colorRegex.test(colorString)) {
        this.$emit('pickColor', hexToRGB(colorString));
      }
    },
  },
};
</script>
