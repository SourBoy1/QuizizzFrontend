<template>
  <div class="flex items-center h-12">
    <div class="relative">
      <ToolbarButton
        v-tooltip.bottom="$i18n('Fill color')"
        :aria-label="$i18n('Fill Color')"
        class="relative"
        icon="fas fa-fill-drip"
        :iconStyles="{ boxShadow: `inset 0px -2px 0px ${pickedFillColor}` }"
        @clicked="toggleShapeFillColorPicker"
      />

      <ColorPicker
        v-if="shouldShowShapeFillColorPicker"
        class="top-11 w-80"
        :colorBoxSize="[30, 24]"
        :numColumns="10"
        :areColorsSpaced="true"
        :colors="pickerColors"
        :pickedColorReceived="pickedFillColor"
        :hasAutomaticColor="true"
        @pickColor="onFillColorChange"
        @blur="hideShapeFillColorPicker"
        @onAutomaticToggle="onFillColorReset"
      />
    </div>

    <div
      v-if="shouldAllowPickingBorderColor"
      class="relative"
    >
      <ToolbarButton
        v-tooltip.bottom="$i18n('Border color')"
        v-click-outside="() => shouldShowShapeBorderColorPicker = false"
        :aria-label="$i18n('Border color')"
        class="relative"
        icon="fas fa-pen"
        :iconStyles="{ boxShadow: `inset 0px -2px 0px ${pickedBorderColor}` }"
        @clicked="shouldShowShapeBorderColorPicker = !shouldShowShapeBorderColorPicker"
      />

      <ColorPicker
        v-if="shouldShowShapeBorderColorPicker"
        class="top-11 w-80"
        :colorBoxSize="[30, 24]"
        :numColumns="10"
        :areColorsSpaced="true"
        :colors="pickerColors"
        :pickedColorReceived="pickedBorderColor"
        :hasAutomaticColor="true"
        @pickColor="onBorderColorChange"
        @onAutomaticToggle="onBorderColorReset"
      />
    </div>

    <div
      v-if="shouldShowBorderEditingOptions"
      class="relative"
    >
      <button
        v-tooltip.bottom="$i18n('Border width')"
        v-click-outside="() => shouldShowBorderWidthDropdown = false"
        class="w-8 h-8 p-2.5 rounded bg-transparent text-light-3 flex flex-col relative items-center focus:outline-none focus:ring-lilac focus:ring-2 hover:bg-light-5%"
        :class="{ 'bg-purple-faded text-purple-dark hover:bg-purple-faded': shouldShowBorderWidthDropdown }"
        @mousedown.prevent
        @click.stop="toggleBorderWidthDropdown"
      >
        <div
          v-for="i in 4"
          :key="i"
          :style="getBorderWidthBtnStyles(i)"
          :class="[shouldShowBorderWidthDropdown ? 'bg-purple' : 'bg-purple-faded']"
        />
      </button>

      <Dropdown
        ref="borderWidthDropdown"
        class="absolute bottom-0 left-0 right-0 w-30"
        size="md"
        type="toolbar"
        title=""
        :shouldShowToggleButton="false"
        ariaLabel="Border Widths"
      >
        <ul
          class="p-2 py-1 overflow-x-hidden overflow-y-auto space max-h-50 "
          tabindex="0"
        >
          <button
            v-for="width in shapeBorderWidths"
            :key="width"
            class="w-full flex flex-col p-2 text-dark-3 hover:bg-dark-10% outline-none text-left h-10 rounded-md whitespace-nowrap"
            :class="{ 'bg-dark-10%': isBorderSelected(width) }"
            @click="selectBorderWidth(width)"
          >
            <span v-if="width > 0">
              {{ width }}px
            </span>
            <span v-else>
              <i18n>No Border</i18n>
            </span>
          </button>
        </ul>
      </Dropdown>
    </div>
  </div>
</template>

<script>
import get from 'lodash/get';

import { ContentSlideColors } from '~/config/SlideColors';
import { SlideShape } from '~/services/ShapesService';

export default {

  props: {
    shapeData: {
      type: Object,
      default: () => {},
    },
  },
  emits: ['shapeBorderWidthChange', 'shapeFillColorChange', 'shapeBorderColorChange'],

  data() {
    return {
      shouldShowShapeFillColorPicker: false,
      pickedFillColor: '',
      shouldShowShapeBorderColorPicker: false,
      pickedBorderColor: '',
      shouldShowBorderWidthDropdown: false,
      borderWidth: this.$constants.DefaultShapeProperties.BORDER_WIDTH,
      shape: null,
    };
  },

  computed: {
    pickerColors() {
      return ContentSlideColors;
    },

    shapeBorderWidths() {
      if (this.shape?.shapeType === 'ARROW_2D') {
        return [1, 2, 3, 4, 6, 8, 12];
      }

      return [0, 1, 2, 3, 4, 6, 8, 12];
    },

    shouldAllowPickingBorderColor() {
      if (!this.shape) {
        return false;
      }

      return (this.shape.shouldShowBorderEditingOptions() && !this.shape.shouldUpdateBorderColorOnFillColorChange());
    },

    shouldShowBorderEditingOptions() {
      if (!this.shape) {
        return false;
      }

      return this.shape.shouldShowBorderEditingOptions();
    },
  },

  watch: {
    shapeData(newVal) {
      const html = get(newVal, 'data.html', '');
      this.shape = SlideShape.fromSVGHTMLContent(html);
    },
  },

  mounted() {
    this.$eventBus.$on('slideElement:updateShapeFillColorToolbar', this.handleShapeFillColorUpdate);
    this.$eventBus.$on('slideElement:updateShapeBorderColorToolbar', this.handleShapeBorderColorUpdate);
    this.$eventBus.$on('slideElement:updateShapeBorderWidthToolbar', this.handleShapeBorderWidthUpdate);
    this.$eventBus.$on('color-picker:open', this.showShapeFillColorPicker);
    this.$eventBus.$on('color-picker:close', this.hideShapeFillColorPicker);
    this.initShapeService();
  },

  beforeUnmount() {
    this.$eventBus.$off('slideElement:updateShapeFillColorToolbar', this.handleShapeFillColorUpdate);
    this.$eventBus.$off('slideElement:updateShapeBorderColorToolbar', this.handleShapeBorderColorUpdate);
    this.$eventBus.$off('slideElement:updateShapeBorderWidthToolbar', this.handleShapeBorderWidthUpdate);
    this.$eventBus.$off('color-picker:open', this.showShapeFillColorPicker);
    this.$eventBus.$off('color-picker:close', this.hideShapeFillColorPicker);
  },

  methods: {
    onFillColorReset(checked) {
      if (checked) {
        this.pickedFillColor = '';
        this.onFillColorChange('');
      }
    },

    onBorderColorReset(checked) {
      if (checked) {
        this.pickedBorderColor = '';
        this.onBorderColorChange('');
      }
    },

    hideShapeFillColorPicker() {
      this.shouldShowShapeFillColorPicker = false;
    },
    showShapeFillColorPicker() {
      this.shouldShowShapeFillColorPicker = true;
    },
    toggleShapeFillColorPicker() {
      this.shouldShowShapeFillColorPicker = !this.shouldShowShapeFillColorPicker;
    },
    initShapeService() {
      const html = get(this.shapeData, 'data.html', '');
      this.shape = SlideShape.fromSVGHTMLContent(html);
    },

    isBorderSelected(width) {
      return this.borderWidth === width;
    },

    toggleBorderWidthDropdown() {
      this.shouldShowBorderWidthDropdown = !this.shouldShowBorderWidthDropdown;

      if (this.shouldShowBorderWidthDropdown) {
        setTimeout(() => {
          this.$refs.borderWidthDropdown.toggleOpen();
        });
      }
    },

    getBorderWidthBtnStyles(i) {
      const baseHeight = 0.5;
      const styles = {
        height: `${baseHeight * i}px`,
        width: '100%',
      };

      if (i !== 4) {
        styles['margin-bottom'] = '2px';
      }
      return styles;
    },

    handleShapeFillColorUpdate({ color }) {
      this.pickedFillColor = color;
    },

    handleShapeBorderColorUpdate({ color }) {
      if (this.shape.shouldUpdateBorderColorOnFillColorChange()) {
        this.pickedFillColor = color;
      }

      this.pickedBorderColor = color;
    },

    handleShapeBorderWidthUpdate({ width }) {
      this.borderWidth = width;
    },

    selectBorderWidth(width) {
      this.$emit('shapeBorderWidthChange', width);
      this.borderWidth = width;
    },

    onFillColorChange(color) {
      this.$emit('shapeFillColorChange', color);
      this.pickedFillColor = color;
    },

    onBorderColorChange(color) {
      this.$emit('shapeBorderColorChange', color);
      this.pickedBorderColor = color;
    },
  },
};
</script>
