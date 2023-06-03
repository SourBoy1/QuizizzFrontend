<template>
  <div class="font-list-dropdown py-1">
    <div class="overflow-y-auto overflow-x-hidden font-list-dropdown-ul">
      <div>
        <p class="text-dark-4 text-xxs font-extrabold italic px-3 py-2">
          SELECT FONT
        </p>
        <div class="w-full flex relative px-3 py-2">
          <span
            class="bg-light relative z-10 text-tn text-dark-5 px-1 ml-1"
          ><i18n>Theme default</i18n></span>
          <hr class="absolute w-36 divider top-2/4 text-dark-6" />
        </div>
        <button
          :aria-label="$i18n('Automatic')"
          class="automatic flex items-center px-3 py-1.5 hover:bg-dark-5% w-full"
          @click="onFontSelected('')"
          @keyup.space="onFontSelected('')"
          @mousedown="(ev) => { ev.preventDefault() }"
        >
          <Radio
            class="mr-1"
            :checked="'' === selectedFont"
            value=""
            :unFocus="true"
            size="sm"
          />
          <div class="content text-dark-3 font-semibold">
            <i18n>Automatic</i18n>
          </div>
        </button>
      </div>
      <div class="" />
      <div class="">
        <div
          v-for="(fontType, index) in superFontsList"
          :key="index"
          tabindex="-1"
        >
          <div class="w-full flex relative px-3 py-2">
            <span
              class="bg-light relative z-10 text-tn text-dark-5 px-1 ml-1"
            >{{ fontType.name }}</span>
            <hr class="absolute w-36 divider top-2/4 text-dark-6" />
          </div>
          <button
            v-for="(font, fontIndex) in fontType.items"
            :key="fontIndex"
            :aria-label="font.value"
            class="flex items-center px-3 py-1.5 hover:bg-dark-5% w-full"
            @click="onFontSelected(font.value)"
            @keyup.space="onFontSelected(font.value)"
            @mousedown="(ev) => { ev.preventDefault() }"
          >
            <Radio
              class="mr-1"
              :checked="font.value === selectedFont"
              :value="font.value"
              :unFocus="true"
              size="sm"
            />
            <div class="content">
              <div
                class="font-family-image"
                :style="font.imgStyles"
              />
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {

  props: {
    hasAutomaticFont: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['onFontSelected'],

  data() {
    return {
      selectedFont: '',
      superFontsList: [
        {
          name: 'Display',
          items: [
            {
              imgStyles: { backgroundPosition: '0 0px' },
              value: 'Quicksand',
            },
            {
              imgStyles: { backgroundPosition: '0 -180px' },
              value: 'Lobster',
            },
            {
              imgStyles: { backgroundPosition: '0px -198px' },
              value: 'Bebas Neue',
            },
            {
              imgStyles: { backgroundPosition: '0px -216px' },
              value: 'Playfair Display',
            },
          ],
        },
        {
          name: 'Handwriting',
          items: [
            {
              imgStyles: { backgroundPosition: '0 -126px' },
              value: 'Patrick Hand',
            },
            {
              imgStyles: { backgroundPosition: '0 -144px' },
              value: 'Cookie',
            },
            {
              imgStyles: { backgroundPosition: '0 -162px' },
              value: 'Permanent Marker',
            },
          ],
        },
        {
          name: 'Serif',
          items: [
            {
              imgStyles: { backgroundPosition: '0 -72px' },
              value: 'EB Garamond',
            },
            {
              imgStyles: { backgroundPosition: '0 -90px' },
              value: 'Merriweather',
            },
            {
              imgStyles: { backgroundPosition: '0 -108px' },
              value: 'Libre Baskerville',
            },
          ],
        },
        {
          name: 'Sans Serif',
          items: [
            {
              imgStyles: { backgroundPosition: '0 -18px' },
              value: 'Open Sans',
              isSelected: false,
            },
            {
              imgStyles: { backgroundPosition: '0 -36px' },
              value: 'Roboto',
              isSelected: false,
            },
            {
              imgStyles: { backgroundPosition: '0 -54px' },
              value: 'Space Grotesk',
              isSelected: false,
            },
            {
              imgStyles: { backgroundPosition: '0 -288px' },
              value: 'Open Sans Condensed',
              isSelected: false,
            },
          ],
        },
        {
          name: 'Monospace',
          items: [
            {
              imgStyles: { backgroundPosition: '0 -234px' },
              value: 'Courier New',
              isSelected: false,
            },
            {
              imgStyles: { backgroundPosition: '0 -252px' },
              value: 'Space mono',
              isSelected: false,
            },
            {
              imgStyles: { backgroundPosition: '0 -270px' },
              value: 'Inconsolata',
              isSelected: false,
            },
          ],
        },
      ],
    };
  },

  methods: {
    onFontSelected(font) {
      this.selectedFont = font;
      this.$emit('onFontSelected', font);
    },

    setSelectedFont(font) {
      this.selectedFont = font;
    },
  },
};
</script>

<style lang="scss" scoped>
.font-list-dropdown-ul {
  max-height: 340px;
}

.divider {
  width: 136px;
}

.font-family-image {
  height: 18px;
  background-image: url(https://cf.quizizz.com/image/fonts.png);
  background-size: 100%;
  width: 116px;
}

.automatic .content {
  font-size: 13px;
}
</style>
