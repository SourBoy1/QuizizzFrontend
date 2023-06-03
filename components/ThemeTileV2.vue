<template>
  <button
    :class="['theme-tile relative flex flex-col items-center justify-center bg-cover rounded cursor-pointer overflow-hidden bg-no-repeat bg-center border-1 border-dark-10%', classes, checked ? 'border-lilac' : 'border-transparent']"
    :style="`background-image: url(${bgGif}); background-color: ${bgColor}; color: ${textColor};`"
    @click="$emit('onThemePick')"
  >
    <span
      class="text-sm"
      :style="titleStyles"
    ><i18n>Header text</i18n></span>
    <span
      class="text-tn -mt-1"
      :style="textStyles"
    ><i18n>Body text</i18n></span>
    <Checkedbox
      v-if="checked"
      accent="light"
      class="absolute top-0.5 right-0.5"
    />
    <div class="shape-colors absolute bottom-1 right-1 flex">
      <ColorTile
        class="rounded-sm"
        :width="12"
        :height="12"
        :color="largeShapeColor"
        :isStatic="true"
        @onColorPick="pickColor(color.value)"
      />
      <ColorTile
        class="rounded-sm ml-1"
        :width="12"
        :height="12"
        :color="smallShapeColor"
        :isStatic="true"
        @onColorPick="pickColor(color.value)"
      />
    </div>
  </button>
</template>

<script>
export default {
  props: {
    titleFontFamily: {
      type: String,
      default: '',
    },
    fontFamily: {
      type: String,
      default: '',
    },
    bgGif: {
      type: String,
      default: '',
    },
    bgColor: {
      type: String,
      default: '',
    },
    textColor: {
      type: String,
      default: '',
    },
    largeShapeColor: {
      type: String,
      default: '',
    },
    smallShapeColor: {
      type: String,
      default: '',
    },
    checked: {
      type: Boolean,
      default: false,
    },
    size: {
      type: String,
      default: 'md',
    },
  },
  emits: ['onThemePick'],

  computed: {
    classes() {
      let sizeClass = '';
      if (this.size === 'md') {
        sizeClass += 'w-24 md-height';
      } else if (this.size === 'lg') {
        sizeClass += 'lg-width lg-height';
      }
      return sizeClass;
    },

    titleStyles() {
      return {
        fontFamily: this.titleFontFamily,
      };
    },

    textStyles() {
      return {
        fontFamily: this.fontFamily,
      };
    },
  },
};
</script>

<style scoped>
* {
  box-sizing: border-box;
}
.lg-width {
  width: 124px;
}
.lg-height {
  height: 74px;
}
</style>
