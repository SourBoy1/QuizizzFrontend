<!-- eslint-disable vuejs-accessibility/media-has-caption -->
<template>
  <div class="slide-element-display">
    <template v-if="!!element">
      <div
        class="absolute"
        :class="hasMath(element) ? 'text-6xl' : 'element-display'"
        :style="styles"
      >
        <div
          v-if="element && element.type === 'TEXT' && hasText(element)"
          class="absolute inset-0 m-3 break-words whitespace-pre-wrap text"
          v-html="getHtmlToRender(element)"
        />
        <div
          v-if="element && element.type === 'TABLE'"
          class="absolute inset-0 m-3 break-words whitespace-pre-wrap text"
          v-html="getHtmlToRender(element)"
        />
        <div
          v-if="shouldShowPlaceholder && element && element.type === 'TEXT' && !hasText(element)"
          class="placeholder"
          :class="placeholderColor"
          v-html="getPlaceholder(element)"
        />
        <div
          v-if="element && element.type && element.type.includes('SHAPE')"
          class="whitespace-pre-wrap shape-element-display"
          v-html="getHtmlToRenderForShape(element)"
        />
        <div
          v-if="element && element.type === 'MEDIA'"
          class="flex items-center justify-center w-full h-full"
        >
          <img
            v-if="get(element, 'data.media.type', '') === 'image'"
            :key="get(element, 'data.media.url', '')"
            :ref="`slideElementImage-${element._id}`"
            crossorigin="anonymous"
            :src="getSlideImageUrl(element && element.data.media.url)"
            class="w-full h-full"
            :alt="$i18n('media')"
          />

          <MediaAudio
            v-if="element && element.data.media.type === 'audio'"
            :size="correctAudioCanvasSize"
            :src="element && element.data.media.url"
          />
          <div
            v-if="get(element, 'data.media.meta.src', null) === 'google-drive'"
            class="h-full max-h-full"
          >
            <video
              controls
              playsinline
              class="max-h-full"
            >
              <source
                :src="`https://drive.google.com/uc?export=download&id=${element.data.media.video}`"
                :type="get(element, 'data.media.meta.type', 'video/mp4')"
              >
            </video>
          </div>
          <MediaYoutube
            v-else-if="get(element, 'data.media.type', null) === 'video'"
            ref="yt"
            :class="isInsideEditor ? 'pointer-events-none' : ''"
            :videoId="element && videoId"
            :start="element && videoStartTime"
            :end="element && videoEndTime"
          />
        </div>
        <SlideWebpageElement
          v-if="element && element.type === 'WEBPAGE' && !!element.data.media.url"
          :url="element && element.data.media.url"
          :embeddable="element && element.data.media.meta.embeddable"
          :title="element && element.data.media.meta.title"
        />
      </div>
    </template>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import max from 'lodash/max';
import katex from 'katex';

import { isColorDark, rgbStringToHex } from '~/services/ColorService';

import { getHtmlWithMathKatexString } from '~/utils/QuizUtils';

import { isShapeLarge } from '~/services/ShapesService';

import { colors } from '~/config/TailwindConstants';

export default {
  props: {
    element: {
      type: Object,
      default() {
        return {};
      },
    },

    questionId: {
      type: String,
      default: '',
    },

    scaleFactor: {
      type: Number,
      default: 1,
    },

    theme: {
      type: Object,
      default: null,
    },

    shouldShowPlaceholder: {
      type: Boolean,
      default: false,
    },

    isInsideEditor: {
      type: Boolean,
      default: false,
    },

    isBackground: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      katex: null,
      transform: {
        position: {
          x: get(this.element, 'transform.position.x'),
          y: get(this.element, 'transform.position.y'),
        },
        size: {
          width: get(this.element, 'transform.size.width'),
          height: get(this.element, 'transform.size.height'),
        },
        rotation: get(this.element, 'transform.rotation'),
      },

      tableThemeColors: colors.tableThemeColors,

      svgHTML: '',
    };
  },

  computed: {
    ...mapGetters('contentEditor', ['historyCursor']),
    ...mapGetters('slideEditor', ['currentTheme']),
    positionX() {
      return get(this.transform, 'position.x');
    },
    positionY() {
      return get(this.transform, 'position.y');
    },
    elementWidth() {
      return get(this.transform, 'size.width');
    },
    elementHeight() {
      return get(this.transform, 'size.height');
    },
    correctAudioCanvasSize() {
      return Math.min(this.elementWidth, this.elementHeight) / 1.6;
    },
    placeholderColor() {
      const isPlaceholderColorLight = !isColorDark(this.currentTheme?.background?.color);
      return isPlaceholderColorLight ? 'text-dark-3' : 'text-dark-6';
    },
    shapeTextColorFromTheme() {
      let slideBackgroundColor = this.theme?.background?.color;
      slideBackgroundColor = isEmpty(slideBackgroundColor) ? this.$constants.DefaultSlideTheme.BGCOLOR : slideBackgroundColor;
      return slideBackgroundColor;
    },

    styles() {
      let titleFontFamily = this.theme?.titleFontFamily;
      titleFontFamily = titleFontFamily || this.$constants.DefaultSlideTheme.TITLE_FONT_FAMILY;
      let fontFamily = this.theme?.fontFamily;
      fontFamily = fontFamily || this.$constants.DefaultSlideTheme.FONT_FAMILY;
      let linkColor = this.theme?.shape?.smallShapeColor;
      linkColor = linkColor || this.$constants.DefaultSlideTheme.LINK_COLOR;
      return {
        '--title-font-family': titleFontFamily,
        fontFamily,
        '--defaultHeader': this.tableThemeColors.defaultTheme.HEADER,
        '--defaultCell': this.tableThemeColors.defaultTheme.CELL,
        '--linkColor': linkColor,
        left: `${this.positionX}px`,
        top: `${this.positionY}px`,
        width: `${this.transform.size.width}px`,
        height: `${this.transform.size.height}px`,
        transform: `rotate(${this.transform.rotation}deg)`,
        zIndex: this.element?.zIndex,
      };
    },

    videoId() {
      return get(this.element, 'data.media.meta.videoId', '');
    },
    videoStartTime() {
      return get(this.element, 'data.media.meta.startTime', '');
    },
    videoEndTime() {
      return get(this.element, 'data.media.meta.endTime', '');
    },
  },

  watch: {
    element: {
      handler(oldVal, newVal) {
        if (!newVal || !oldVal || !this.element) {
          return;
        }
        this.transformUpdate({ transform: newVal.transform, _id: this.element._id });
        if (this.element.type === 'MEDIA' && this.element.data.media.type === 'video' && this.$refs.yt) {
          this.$refs.yt.resize(newVal.transform.size.width, newVal.transform.size.height);
        }
      },

      deep: true,
    },

    historyCursor: {
      handler() {
        if (!this.element) {
          return;
        }
        Object.assign(this.transform, this.element.transform);
      },
    },
  },

  async created() {
    this.katex = katex;
  },

  mounted() {
    this.$eventBus.$on('elementDisplay:transformUpdate', this.transformUpdate);
  },

  beforeUnmount() {
    this.$eventBus.$off('elementDisplay:transformUpdate', this.transformUpdate);
  },

  methods: {
    get,
    getSlideImageUrl(url) {
      if (this.isInsideEditor) {
        return `${url}`;
      }

      const maxSizeUnit = max([
        this.element.transform.size.width,
        this.element.transform.size.height,
      ]);

      let size = 90;

      if (maxSizeUnit > 900) {
        size = 900;
      } else if (maxSizeUnit > 400) {
        size = 400;
      } else if (maxSizeUnit > 200) {
        size = 200;
      }

      return `${url}?w=${size}&h=${size}`;
    },

    transformUpdate({ transform, _id, svgHTML }) {
      if (this.element && (this.element._id === _id)) {
        this.transform = transform;
        this.svgHTML = svgHTML;
      }
    },

    getHtmlToRender(element) {
      let htmlString = this.getElementHtmlString(element);

      if (element.type === 'TABLE') {
        htmlString = this.getHtmlForTableWithWidth(htmlString);
      }

      if (this.hasMath(element)) {
        htmlString = this.katex ? getHtmlWithMathKatexString(htmlString, this.katex) : '';
      }

      return htmlString;
    },

    getHtmlForTableWithWidth(htmlString) {
      const div = document.createElement('div');
      div.innerHTML = htmlString;
      const th = div.querySelectorAll('th[colwidth]');
      const td = div.querySelectorAll('td[colwidth]');

      const allElementsWithColWidth = [...th, ...td];

      allElementsWithColWidth.forEach((el) => {
        const width = el.getAttribute('colwidth');
        el.setAttribute('width', width);
      });

      return div.innerHTML;
    },

    shouldSetLargeShapeColor(svgWidth, svgHeight) {
      return isShapeLarge(svgWidth, svgHeight) && !!this.isBackground;
    },

    colorShape(svgEl, svgWidth, svgHeight) {
      const shapeFillColor = get(this.theme, `shape.${this.shouldSetLargeShapeColor(svgWidth, svgHeight) ? 'largeShapeColor' : 'smallShapeColor'}`);
      svgEl.setAttribute('fill', shapeFillColor);
      svgEl.setAttribute('stroke', shapeFillColor);
    },

    getThemeShapeFillColor(svgEl, svgWidth, svgHeight) {
      const shapeFillColor = get(this.theme, `shape.${this.shouldSetLargeShapeColor(svgWidth, svgHeight) ? 'largeShapeColor' : 'smallShapeColor'}`);
      return shapeFillColor;
    },

    isShapeLight(svgEl, svgWidth, svgHeight) {
      const tiptapShapeFillColor = get(svgEl, 'style.fill') || '';
      if (tiptapShapeFillColor) {
        if (tiptapShapeFillColor.substring(0, 3) === 'rgb') {
          return !isColorDark(rgbStringToHex(tiptapShapeFillColor));
        }
        return !isColorDark(tiptapShapeFillColor);
      }
      return !isColorDark(this.getThemeShapeFillColor(svgEl, svgWidth, svgHeight));
    },

    getShapePlaceholderColorClass(svgEl, svgWidth, svgHeight) {
      return this.isShapeLight(svgEl, svgWidth, svgHeight) ? 'text-dark-3' : 'text-dark-6';
    },

    getHtmlToRenderForShape(el) {
      const storedHTML = this.getHtmlToRender(el);
      const parsedEl = new DOMParser().parseFromString(this.svgHTML || storedHTML, 'text/html');
      const svgEl = parsedEl.querySelector('svg');
      // svg dimensions are decided in the HTML string, the parent div's (`element-display` class) transform properties don't apply here
      // manually changing these so that the display layer has the correct dimensions
      const svgWidth = this.transform.size.width;
      const svgHeight = this.transform.size.height;

      this.colorShape(svgEl, svgWidth, svgHeight);

      svgEl.style.width = svgWidth;
      svgEl.style.height = svgHeight;

      // set shape text color based on theme color
      const divEl = parsedEl.querySelector('div');

      if (divEl) {
        const pEl = divEl.querySelectorAll('p');
        if (pEl) {
          pEl.forEach((p) => {
            // eslint-disable-next-line no-param-reassign
            p.style.color = this.shapeTextColorFromTheme;
          });
        }
      }

      // if (this.isInsideEditor && divEl && !divEl.innerText) {
      //   const pClass = `shape-placeholder text-center text-lg ${this.getShapePlaceholderColorClass(svgEl)}`;
      //   divEl.innerHTML = `<p class="${pClass}">Type...</p>`;
      // };

      return `<div style="position: relative;display: flex;justify-content: center;align-items: center;">
        ${svgEl.outerHTML}
        ${divEl ? divEl.outerHTML : ''}
      </div>`;
    },

    hasText(element) {
      const div = document.createElement('div');
      div.innerHTML = get(element, 'data.html', '');
      // The replace method contains the Zero Width Space Please don't mess with it.
      return !!div.innerText.trim().replace('​', '') || div.querySelector('katex');
    },

    getPlaceholder(element) {
      const el = document.createElement('div');
      el.innerHTML = get(element, 'data.html', '').toLowerCase();
      const isH1 = !!el.querySelector('h1');
      const isP = !!el.querySelector('p');

      const span = el.querySelector('span');

      if (span) {
        if (isH1) {
          el.querySelector('span').innerHTML = `${this.$i18n('Enter title here')}...`;
        } else if (isP) {
          el.querySelector('span').innerHTML = `${this.$i18n('Enter text here')}...`;
        }
      }
      return el.innerHTML;
    },

    getElementHtmlString(element) {
      return get(element, 'data.html', '');
    },

    hasMath(element) {
      if (!element) {
        return false;
      }
      const html = get(element, 'data.html', '');
      return !!html && !!html.match(/<katex/gi);
    },
  },
};
</script>

<style lang="scss">
.element-display {
  /* font-family: Quicksand, OpenSans, Arial, sans-serif; */
  box-sizing: border-box;

  .text {
    word-wrap: break-word;
    white-space: break-spaces;
    -webkit-font-variant-ligatures: none;
    font-variant-ligatures: none;
    font-feature-settings: "liga" 0;
  }

  h1 {
    padding: 0;
  }

  p {
    padding: 0;
  }

  ul {
    margin-left: 2em;
    list-style: disc;
    font-size: 32px;
    li {
      ul {
        list-style: circle;
        li {
          ul {
            list-style: square;
          }
        }
      }
    }
  }

  ol {
    margin-left: 2em;
    list-style: decimal;
    font-size: 32px;
    li {
      ol {
        list-style: lower-alpha;
        li {
          ol {
            list-style: lower-roman;
          }
        }
      }
    }
  }

  span {
    line-height: 1.5em;
    &[data-title='true'] {
      font-family: var(--title-font-family);
    }
  }

  li {
    p {
      padding: 0;
      min-height: 1.5em;

      span[style="font-size: 8px"] {
        position: relative;
        top: -8px;
        line-height: 1.5em;
      }

      span[style="font-size: 10px"] {
        position: relative;
        top: -6px;
        line-height: 1.5em;
      }

      span[style="font-size: 12px"] {
        position: relative;
        top: -5px;
        line-height: 1.5em;
      }

      span[style="font-size: 14px"] {
        position: relative;
        top: -5px;
        line-height: 1.5em;
      }

      span[style="font-size: 18px"] {
        position: relative;
        top: -4px;
        line-height: 1.5em;
      }

      span[style="font-size: 24px"] {
        position: relative;
        top: -2px;
        line-height: 1.5em;
      }

      span[style="font-size: 48px"] {
        position: relative;
        top: 4px;
        line-height: 1.5em;
      }

      span[style="font-size: 60px"] {
        position: relative;
        top: 8px;
        line-height: 1.5em;
      }

      span[style="font-size: 72px"] {
        position: relative;
        top: 12px;
        line-height: 1.5em;
      }

      span[style="font-size: 96px"] {
        position: relative;
        top: 20px;
        line-height: 1.5em;
      }

      span[style="font-size: 144px"] {
        position: relative;
        top: 32px;
        line-height: 1.5em;
      }
    }
  }

  h1 br {
    font-size: 48px;
  }

  h1 {
    &:empty {
      font-size: 48px;
    }
    span {
      font-size: 48px;
    }
  }

  p {
    span {
      font-size: 32px;
    }
  }

  p br {
    font-size: 32px;
  }

  .placeholder {
    h1 {
      font-size: 48px;
      margin: 12px;
      font-weight: bold;
    }

    p {
      font-size: 32px;
      margin: 12px;
    }
  }

  table{
    border-collapse: collapse;
     table-layout: fixed;
     width: 100%;
     margin: 0;
     overflow: hidden;
     td, th {
         min-width: 1em;
         border: 2px solid #cdcdcd;
         padding: 3px 5px;
         vertical-align: top;
         box-sizing: border-box;
         position: relative;
         > * {
             margin-bottom: 0;
        }
        .katex-html {
          background: rgba(9, 9, 9, 0.5);
        }
    }
     th {
         font-weight: bold;
         text-align: left;
    }
     .selectedCell:after {
         z-index: 2;
         position: absolute;
         content: "";
         left: 0;
         right: 0;
         top: 0;
         bottom: 0;
         background: rgba(200, 200, 255, 0.4);
         pointer-events: none;
    }
     .column-resize-handle {
         position: absolute;
         right: -2px;
         top: 0;
         bottom: -2px;
         width: 4px;
         background-color: #adf;
         pointer-events: none;
    }
  }

  .default-table-theme{
     th{
         background-color: var(--defaultHeader);
    }
     td{
         background-color: var(--defaultCell);
    }
}
 .cyan-table-theme{
     th{
         background-color: #2D9DA6;
    }
     td{
         background-color: #D9F7ED;
    }
}
 .blue-table-theme{
     th{
         background-color: #2d70ae;
    }
     td{
         background-color: #d6e5f5;
    }
}
 .rose-table-theme{
     th{
         background-color: #d5546d;
    }
     td{
         background-color: #f7d4da;
    }
}
 .yellow-table-theme{
     th{
         background-color: #efa929;
    }
     td{
         background-color: #fdedcf;
    }
}
 .violet-table-theme{
     th{
         background-color: #8854C0;
    }
     td{
         background-color: #000000;
    }
}
 .tableWrapper {
     overflow-x: auto;
}
 .resize-cursor {
     cursor: col-resize;
}

}

.link-style {
  color: var(--linkColor);
  text-decoration: underline;
  cursor: pointer;
}

// Fix for the vanilla katex css
.katex-display {
  display: inline-block !important;
  margin: 0 !important;
  .katex-html {
    padding: 0.25rem;
  }
}

u {
  span {
    text-decoration: underline;
  }
}

</style>
