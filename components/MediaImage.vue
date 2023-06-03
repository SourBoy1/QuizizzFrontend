<template>
  <div ref="mediaImageContainer">
    <VImage
      :containerClasses="['vi-image w-full h-full', `object-${objectFit} ${imgClass}`, {
        'bg-light': isImageTransparent,
      }]"
      :imgObj="{ src: getImageURl, error: 'https://cf.quizizz.com/img/logos/new/logo_placeholder_sm.png' }"
      :options="{
        alt,
        fitClass: `object-${objectFit}`,
      }"
    />
  </div>
</template>

<script>

import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';

import { mapGetters } from 'vuex';

import { enumProps } from '~/config/Atoms';

import { attachParamForImage } from '~/utils/ImageParamUtils.js';

export default {

  props: {
    src: {
      type: String,
      default: '',
    },
    imgClass: {
      type: String,
      default: '',
    },
    objectFit: {
      type: String,
      default: 'contain',
      validator: (val) => enumProps.MediaImage.objectFit.includes(val),
    },

    alt: {
      type: String,
      default: 'Quiz image',
    },
  },

  data() {
    return {
      isImageTransparent: false,
      mediaImageContainerRef: null,
    };
  },

  computed: {
    ...mapGetters('root', ['deviceProps']),

    isImageDimensionFlagEnabled() {
      return this.$featureFlags.isEnabled(this.$constants.FeatureFlagsTypes.IMAGE_DIMENSIONS);
    },

    getImageURl() {
      if (this.isImageDimensionFlagEnabled) {
        let url = this.src;
        if (!url) {
          url = 'https://cf.quizizz.com/img/logos/new/logo_placeholder_sm.png';
        }

        const options = {
          deviceType: this.deviceProps.type,
        };

        if (this.mediaImageContainerRef) {
          options.dimToCheckAgainst = this.mediaImageContainerRef.getBoundingClientRect()?.width;
          return attachParamForImage(url, options);
        }
        return 'https://cf.quizizz.com/img/logos/new/logo_placeholder_sm.png';
      }
      let url = this.src;
      if (!url) {
        url = 'https://cf.quizizz.com/img/logos/new/logo_placeholder_sm.png';
      }
      const options = {
        deviceType: this.deviceProps.type,
      };
      if (!isEmpty(get(this.$refs, 'mediaImageContainer.$el', ''))) {
        options.dimToCheckAgainst = this.$refs.mediaImageContainer.$el.getBoundingClientRect().width;
      }
      return attachParamForImage(url, options);
    },
  },

  mounted() {
    this.checkIfImageHasTransparancy();
    this.mediaImageContainerRef = this.$refs.mediaImageContainer;
  },

  methods: {
    checkIfImageHasTransparancy() {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = this.getImageURl;
      img.onload = onLoadImage.bind(this);

      function onLoadImage(e) {
        const img = e.target;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;

        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const { data } = imgData;

        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] < 255) {
            this.isImageTransparent = true;
            break;
          }
        }
      }
    },
  },
};
</script>

<style lang="scss" scoped>

.canvas-element {
  opacity: 0;
}
</style>
