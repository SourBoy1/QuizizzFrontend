<template>
  <div class="select-box">
    <div
      :id="labelId"
      :class="['label font-semibold text-xs mb-1 ml-1 text-dark-4', { 'sr-only': !label }]"
    >
      {{ `${label || ariaLabel} ${label ? '' : isAnItemSelected ? '(with selected value)' : '(no selected value)'}` }}
    </div>
    <div
      ref="select-box"
      v-click-outside="
        () => {
          open = false
        }
      "
      class="select"
      :class="[
        'w-full inline-flex relative',
        disabled ? 'bg-dark-5%' : '',
      ]"
    >
      <button
        v-if="isTypeButton"
        :class="[
          'flex items-center w-full cursor-pointer box-border text-left rounded-l font-semibold text-sm border-r',
          generalHeaderClasses,
          headerSubmitSize,
          'flex-1',
        ]"
        @click.stop="$emit('submit');"
      >
        <div
          :class="[
            'title w-full truncate',
            textSize,
            disabled ? 'text-dark-20%' : '',
          ]"
          aria-live="assertive"
        >
          {{ truncateLargeText(getTitleOrSubtitleOrPlaceholder()) }}
        </div>
      </button>

      <slot
        v-if="shouldShowToggleButton"
        name="button"
        aria-haspopup="listbox"
        :buttonId="buttonId"
        :arialabelledby="labelId + ' ' + buttonId"
        :ariaexpanded="open"
        :disabled="disabled"
        :toggleOpen="toggleOpen"
        :selectPrevious="selectPrevious"
        :selectNext="selectNext"
        :close="close"
      >
        <button
          v-if="shouldShowToggleButton"
          :id="buttonId"
          ref="listbox-button"
          v-tooltip="tooltipOptions"
          :data-cy="`select-box:${cypressTriggerIdentifier}`"
          class="listbox-button"
          :class="[
            'flex items-center cursor-pointer box-border text-left rounded font-semibold text-sm text-dark-3 p-4',
            isAnItemSelected ? '' : 'text-dark-5',
            isHeaderType || isTypeButton || noBorder ? '' : ' border border-dark-6',
            generalHeaderClasses,
            isTypeButton ? headerSelectBoxSize : headerClassesForSize,
            // TODO: #migration figure out a better fix
            isTypeButton ? 'flex-0' : customClasses.includes('w-') ? '' : 'w-full',
            customClasses,
          ]"
          aria-haspopup="listbox"
          :aria-labelledby="labelId + ' ' + buttonId"
          :aria-expanded="open"
          :disabled="disabled"
          @click.stop="toggleOpen"
          @keyup.up="selectPrevious"
          @keyup.down="selectNext"
          @keyup.esc="close"
        >
          <div
            v-if="!!getSelectedItemLimage()"
            class="flex mr-2 w-6 h-6 border border-dark-6"
          >
            <img
              :src="getSelectedItemLimage()"
              alt="Country Image"
              class="object-contain object-center"
            >
          </div>
          <div
            v-if="!!icon"
            :class="['flex items-center justify-center mr-2', arrowIconSize]"
            aria-hidden="true"
          >
            <FA
              :icon="icon"
              :size="iconSize"
            />
          </div>
          <div
            v-if="!!isSelectedItemHTML && type !== 'button'"
            :data-cy="`select-box-value:${cypressTriggerIdentifier}`"
            :class="[
              'title w-full flex truncate',
              textSize,
              disabled ? 'text-dark-20%' : '',
            ]"
            aria-live="assertive"
            v-html="selectedItem.title"
          />
          <div
            v-else-if="multiselect"
            :data-cy="`select-box-value:${cypressTriggerIdentifier}`"
            class="flex items-center flex-wrap"
          >
            <Tag
              v-for="(tag, index) in selectedTags"
              :key="`tag-${index}`"
              :title="getTagDisplay(tag)"
              type="secondary"
              size="xs"
              class="mr-1 mb-1"
              @delete="deleteTag(index)"
            >
              {{ getTagDisplay(tag) }}
            </Tag>
          </div>
          <div
            v-else-if="!['add', 'button'].includes(type)"
            :class="[
              'title w-full truncate',
              textSize,
              disabled ? 'text-dark-20%' : '',
            ]"
            :data-cy="`select-box-value:${cypressTriggerIdentifier}`"
            aria-live="assertive"
          >
            {{ truncateLargeText(getTitleOrSubtitleOrPlaceholder()) }}
          </div>
          <div
            :class="[
              'ml-auto flex items-center justify-center',
              arrowIconSize,
              disabled ? 'text-dark-20%' : '',
            ]"
            aria-hidden="true"
          >
            <FA
              :icon="isLoading ? 'fas fa-sync' : open ? 'fas fa-caret-up' : arrowIcon"
              :size="arrowIconSize"
              aria-hidden="true"
              :class="[{ 'animate-spin': isLoading }, arrowIconClasses]"
            />
          </div>
        </button>
      </slot>
      <ul
        ref="listbox"
        class="listbox overflow-y-auto z-30 list bg-light-3 shadow-soft-high w-full transform rounded transition-transform"
        :class="[
          listContainerClasses,
          listClassesForSize,
          customHeight ? `max-h-${customHeight}` : '',
          tall && !customHeight ? 'max-h-screen' : 'max-h-44',
          open ? 'scale-y-100' : 'scale-y-0',
          openDirection,
          { hidden: hideDropdownMenu },
        ]"
        :style="listStyles"
        :aria-labelledby="labelId"
        role="listbox"
        :activedescendant="getSelectedItemId()"
        @mousedown.stop
      >
        <li v-if="enableSearch">
          <Input
            class="p-1"
            :placeholder="truncateLargeText(getTitleOrSubtitleOrPlaceholder())"
            licon="far fa-search"
            :value="searchTerm"
            :isClearable="true"
            @input="handleSearchInput"
          />
        </li>
        <li
          v-for="(item) in filteredList"
          :id="item.id"
          :key="item.id"
          :ref="'listbox-item-' + item.index"
          v-tooltip="item.tooltipConfig"
          :data-cy="`${cypressTriggerIdentifier}:${item.value}`"
          class="option"
          :class="[
            ' hover:bg-dark-5% cursor-pointer p-2 flex',
            hasTIcon(item) ? 'justify-between' : '',
            item.index + 1 < filteredList.length ? item.index === activeItemIndex
              ? 'border-2 border-b-2 border-lilac'
              : 'border-2 border-transparent border-b-dark-5%' : '',
            stylesForListItem(item),
            !!item.isSuper ? 'bg-super-faded' : '',
          ]"
          role="option"
          @mouseenter="mouseEnterOption(item)"
          @mouseleave="mouseLeaveOption(item)"
          @mousedown="(event) => selectItem(item, event)"
        >
          <div
            v-if="!!item.licon"
            :class="['icon text-dark-1 flex items-center mr-2.5']"
          >
            <FA
              :icon="`${item.licon}`"
              :size="iconSize"
            />
          </div>

          <div
            v-if="!!item.limage"
            class="flex mr-1 w-6 h-6 border border-dark-6"
          >
            <img
              :src="item.limage"
              alt="Country Image"
              class="object-contain object-center"
            >
          </div>

          <div :class="[item.index === activeItemIndex ? 'text-lilac' : 'text-dark-2']">
            <div
              v-if="!!item.isHTML"
              :class="[
                'item-title font-semibold flex',
                listTextSize,
              ]"
              v-html="item.title"
            />
            <div
              v-else
              :class="['item-title font-semibold', listTextSize]"
            >
              {{ item.title }}
              <span
                v-if="canShowRequireLoginText(item)"
                class="text-xs font-semibold"
              ><i18n>(Requires login)</i18n></span>
            </div>
            <div
              v-if="hasSubtitle(item)"
              class="item-subtitle text-xxs text-dark-50%"
            >
              {{ item.subtitle }}
            </div>
          </div>

          <div
            v-if="!!item.ticon"
            :class="['icon text-dark-1 flex items-center']"
          >
            <FA
              :icon="`${item.ticon}`"
              :size="iconSize"
            />
          </div>

          <div
            v-if="!!item.isSuper"
            :class="['icon text-dark-1 flex items-center mx-2']"
          >
            <SuperIcon :size="iconSize" />
          </div>
          <div
            v-if="!!item.isLocked"
            :class="['icon text-dark-1 flex items-center mx-2']"
          >
            <LockIcon :size="iconSize" />
          </div>
        </li>
      </ul>
    </div>
    <div
      v-if="errorMessage"
      class="flex text-red text-xs font-semibold mt-1"
      aria-live="assertive"
    >
      <span class="w-4 h-4 flex items-center justify-center mr-0.5">
        <FA
          :size="11"
          icon="far fa-exclamation-circle"
        />
      </span>
      <span id="select-box-error-message">
        {{ errorMessage }}
      </span>
    </div>
  </div>
</template>

<script>
import isEmpty from 'lodash/isEmpty';
import debounce from 'lodash/debounce';

import { getUUID } from '~/services/UIDService.js';
import QLogger from '~/services/QLogger';
import { hasFeatureAccess } from '~/services/SubscriptionService';

import { enumProps } from '~/config/Atoms';

/**
 * @param {String} size xs, sm, md-s, md, lg
 * @param {String} list -
 *                       i. title - Not required if the list box has only a subtitle
 *                      ii. subtitle - Not required if the list box has only a title
 *                     iii. ticon - trailing Icon
 *                      iv. licon - leading Icon
 *                       v. value - Value for every option
 *                      vi. isHTML - If title has html
 *                     vii. isSuper - If the options is super
 *                    viii. forSuper - For super props in case the user is not super for a super option
 *                      ix. tooltipConfig - To show tooltip on select box options
 * @param {String} type - header, add(?), default, button (i.e button with a dropdown list)
 * @param {String} value - Specifies the value (default), index, title, or subtitle of the selected item
 * @param {String} selectBy - Can be 'value' (default), 'index', 'title', 'subtitle'
 * @param {String} noBorder - If the textBox should not have a border
 *
 */
let scrollPageTimeout; let
  superUpsellTimeout;

export default {
  props: {
    autoPosition: {
      type: Boolean,
      default: true,
    },
    cypressTriggerIdentifier: {
      type: String,
      default: '',
    },
    isSettingParticipantAttempt: {
      type: Boolean,
      default: false,
    },
    shouldShowToggleButton: {
      type: Boolean,
      default: true,
    },
    label: {
      type: String,
      default: '',
    },
    ariaLabel: {
      type: String,
      default: '',
    },
    list: {
      type: Array,
      default: () => [],
    },
    multiselect: {
      type: Boolean,
      default: false,
    },
    customHeight: {
      type: String,
      default: '',
    },
    scrollListToItem: {
      type: Number,
      default: null,
    },
    existingTags: {
      type: Array,
      default: () => [],
    },
    value: {
      type: [Boolean, Number, String],
      default: null,
    },
    modelValue: {
      type: [Boolean, Number, String],
      default: null,
    },
    selectBy: {
      type: String,
      default: 'value',
      validator: (val) => enumProps.SelectBox.selectBy.includes(val),
    },

    listTextSize: {
      type: String,
      default: 'text-sm',
    },

    icon: {
      type: String,
      default: '',
    },

    arrowIcon: {
      type: String,
      default: 'fas fa-caret-down',
    },

    arrowIconClasses: {
      type: String,
      default: 'text-dark-3',
    },

    placeholder: {
      type: String,
      default: 'Select',
    },
    size: {
      type: String,
      default: 'md',
      validator: (val) => enumProps.SelectBox.size.includes(val),
    },

    type: {
      type: String,
      default: 'default',
      validator: (val) => enumProps.SelectBox.type.includes(val),
    },

    noBorder: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    errorMessage: {
      type: String,
      default: '',
    },
    divider: {
      type: Boolean,
      default: false,
    },
    direction: {
      type: String,
      default: 'bottom',
      validator: (val) => enumProps.SelectBox.direction.includes(val),
    },

    listContainerClasses: {
      type: String,
      default: '',
    },

    customClasses: {
      type: String,
      default: '',
    },
    tooltip: {
      type: Object,
      default: () => ({}),
    },
    tall: {
      type: Boolean,
      default: false,
    },
    isLoading: {
      type: Boolean,
      default: false,
    },

    minListWidth: {
      type: Number,
      default: -1,
    },

    maxListWidth: {
      type: String,
      default: 'auto',
    },

    showFixedPositionList: { // TODO: this is a temporary prop. Needs to be removed once the list position issue is fixed.
      type: Boolean,
      default: true,
    },
    hideDropdownMenu: {
      type: Boolean,
      default: false,
    },
    preventDefaultBehaviourAfterSelection: {
      type: Boolean,
      default: false,
    },
    customIconSize: {
      type: Number,
      default: null,
    },
    truncateLength: {
      type: Number,
      default: 23,
    },
    shouldAllowUsingSuperQuestionTypes: {
      type: Boolean,
      default: false,
    },
    enableSearch: {
      type: Boolean,
      default: false,
    },
    forceClose: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue', 'submit', 'search', 'mouseenter', 'mouseleave', 'close', 'open', 'input', 'setTags', 'super-option-selected'],

  data() {
    return {
      listWithIds: this.list?.map((item, index) => ({
        id: this.getUUID(),
        index,
        ...item,
      })),

      open: false,
      hoverIndex: -1,
      labelId: this.getUUID(),
      buttonId: this.getUUID(),
      persistedUUID: '',
      selectedTags: [],
      listStyles: { position: 'absolute' },
      collisionDirection: null,
      searchTerm: '',
    };
  },

  computed: {
    finalValue() {
      return this.modelValue ?? this.value;
    },

    listDirection() {
      if (this.collisionDirection) {
        return this.collisionDirection;
      }

      return this.direction;
    },

    filteredList() {
      const sanitizedSearchTerm = this.searchTerm?.trim()?.toLowerCase();
      if (!sanitizedSearchTerm) {
        return this.listWithIds;
      }
      return this.listWithIds.filter((item) => {
        const { title, subtitle } = item;
        return [title ?? '', subtitle ?? '']
          .join(' ')
          .trim()
          .toLowerCase()
          .includes(sanitizedSearchTerm);
      });
    },

    openDirection() {
      if (this.autoPosition) {
        return this.listDirection === 'top' ? 'origin-bottom' : 'origin-top';
      }

      return this.listDirection === 'top' ? 'origin-bottom bottom-full' : 'origin-top';
    },

    tooltipOptions() {
      let options = {};
      if (this.hasTooltip) {
        options = this.tooltip;
        options.triggers = ['hover'];
      }
      return options;
    },

    hasTooltip() {
      return !isEmpty(this.tooltip);
    },
    selectedItem() {
      return this.listWithIds.find(
        (listItem) => listItem[this.selectBy] === this.finalValue,
      );
    },

    isSelectedItemHTML() {
      if (!this.selectedItem) {
        return false;
      }

      return !!this.selectedItem.isHTML;
    },

    isHeaderType() {
      return this.type === 'header';
    },
    isAddType() {
      return this.type === 'add';
    },
    isTypeButton() {
      return this.type === 'button';
    },
    isAnItemSelected() {
      if (!this.selectedItem) {
        return false;
      }
      return Boolean(Object.keys(this.selectedItem).length);
    },

    activeItemIndex() {
      if (!this.isAnItemSelected) {
        return -1;
      }
      const index = this.listWithIds.findIndex(
        (listItem) => listItem.id === this.selectedItem.id,
      );
      return index;
    },

    generalHeaderClasses() {
      if (this.isHeaderType) {
        return 'rounded-tr-lg rounded-br-lg bg-transparent text-light-3 border-light-3 placeholder-light-3';
      }

      let classes = '';

      classes
        += ' rounded bg-light-3 placeholder-dark-5 focus:ring-2 focus:ring-lilac';

      if (this.isAddType) {
        classes = 'bg-lilac rounded-lg text-light-3';
        return classes;
      } if (this.isTypeButton) {
        classes = 'bg-lilac text-light-3';
        return classes;
      }

      if (!this.noBorder) {
        classes += 'border border-solid border-dark-6';
      }

      if (this.customClasses) {
        return classes;
      }

      classes = 'text-dark-2';

      return classes;
    },

    headerClassesForSize() {
      let classes = '';

      switch (this.size) {
        case 'lg+1':
          classes = 'pl-2 pr-1 py-3 h-11';
          break;
        case 'lg':
          classes = 'pl-2 pr-1 py-3 h-10';
          break;
        case 'md':
          classes = 'pl-2 pr-1 py-2 h-10';
          break;
        case 'md-s':
          classes = 'pl-3 pr-1 py-1 h-8';
          break;
        case 'sm':
          classes = 'pl-2 pr-1 py-2 h-8';
          break;
        case 'xs':
          classes = 'pl-2 pr-1 py-1 h-8';
          break;

        default:
      }

      return classes;
    },

    headerSubmitSize() {
      let classes = '';
      switch (this.size) {
        case 'lg+1':
          classes = 'px-2 py-3 h-11';
          break;
        case 'lg':
          classes = 'px-2 py-3 h-10';
          break;
        case 'md':
          classes = 'px-2 py-2 h-10';
          break;
        case 'md-s':
          classes = 'px-3 py-1 h-8';
          break;
        case 'sm':
          classes = 'px-2 py-2 h-8';
          break;
        case 'xs':
          classes = 'px-2 py-1 h-8';
          break;

        default:
      }
      return classes;
    },

    headerSelectBoxSize() {
      let classes = '';
      switch (this.size) {
        case 'lg+1':
          classes = 'px-0.5 py-3 h-11';
          break;
        case 'lg':
          classes = 'px-0.5 py-3 h-10';
          break;
        case 'md':
          classes = 'px-0.5 py-2 h-10';
          break;
        case 'md-s':
          classes = 'px-0.5 py-1 h-8';
          break;
        case 'sm':
          classes = 'px-0.5 py-2 h-8';
          break;
        case 'xs':
          classes = 'px-0.5 py-1 h-8';
          break;

        default:
      }
      return classes;
    },

    iconSize() {
      if (this.customIconSize) {
        return this.customIconSize;
      }
      switch (this.size) {
        case 'lg+1':
        case 'lg':
        case 'md':
        case 'md-s':
          return 12;

        case 'sm':
        case 'xs':
          return 11;

        default:
      }

      return 12;
    },

    textSize() {
      switch (this.size) {
        case 'lg+1':
        case 'lg':
        case 'md':
        case 'md-s':
          return 'text-sm';

        case 'sm':
          return 'text-sm';
        case 'xs':
          return 'text-xs';

        default:
      }

      return 'text-sm';
    },

    arrowIconSize() {
      switch (this.size) {
        case 'lg+1':
        case 'lg':
        case 'md':
        case 'md-s':
          return 'w-6 h-6';

        case 'sm':
        case 'xs':
          return 'w-4 h-4';

        default:
      }

      return 'w-6 h-6';
    },

    listClassesForSize() {
      switch (this.size) {
        case 'lg+1':
        case 'lg':
        case 'md':
        case 'md-s':
          return 'mt-10';

        case 'sm':
        case 'xs':
          return 'mt-8';

        default:
      }
      return 'mt-10';
    },
  },

  watch: {
    open: {
      immediate: true,
      handler(isOpen) {
        if (this.autoPosition && isOpen) {
          const target = this.$refs['select-box'];

          if (target) {
            const targetDimensions = target.getBoundingClientRect();
            let direction = {
              top: `${targetDimensions.y}px`,
              left: `${targetDimensions.x}px`,
            };

            const listboxMaxHeight = 176;

            let listWidth = targetDimensions.width;

            if (this.minListWidth > -1) {
              listWidth = Math.max(listWidth, this.minListWidth);
            }

            if (window.innerWidth < targetDimensions.x + listWidth) {
              direction = {
                left: `${targetDimensions.x - listWidth + targetDimensions.width}px`,
              };
            }

            if (window.innerHeight < targetDimensions.y + targetDimensions.height + listboxMaxHeight) {
              if (direction.top) {
                direction = {
                  bottom: `${window.innerHeight - targetDimensions.y}px`,
                };
              } else {
                direction = {
                  ...direction,
                  bottom: `${window.innerHeight - targetDimensions.y}px`,
                };
              }
              this.collisionDirection = 'top';
            }

            this.listStyles = {
              position: 'fixed',
              ...direction,
              width: `${listWidth}px`,
            };
          }
        }
      },
    },

    list: {
      handler(newList) {
        this.listWithIds = newList?.map((item, index) => {
          item.id = this.getUUID();
          item.index = index;
          return item;
        });
      },

      deep: true,
    },

    forceClose: {
      immediate: true,
      // to be used to close existing dropdown while opening another
      handler(current) {
        if (current) {
          this.open = false;
        }
      },
    },
  },

  created() {
    if (this.multiselect) {
      this.selectedTags = this.existingTags;
    }

    this.debouncedAPISearch = debounce(function emitSearchInout(data) { this.$emit('search', data); }, 500);
  },

  beforeUnmount() {
    scrollPageTimeout && clearTimeout(scrollPageTimeout);
    superUpsellTimeout && clearTimeout(superUpsellTimeout);
  },

  mounted() {
    window.addEventListener(
      'keydown',
      this.stopPageScroll,
      false,
    );
  },

  methods: {
    hasSubtitle(item) {
      return !isEmpty(item.subtitle);
    },

    canShowRequireLoginText(item) {
      return this.isSettingParticipantAttempt && item.value !== 0 && (this.hoverIndex === item.index || item.index === this.activeItemIndex);
    },

    mouseEnterOption(item) {
      this.hoverIndex = item.index;
      this.$emit('mouseenter', item);
    },

    mouseLeaveOption(item) {
      this.hoverIndex = -1;
      this.$emit('mouseleave', item);
    },

    shouldShowDivider(listItem) {
      return this.divider && listItem.index !== this.listWithIds.length - 1;
    },

    handleSearchInput(value) {
      this.searchTerm = value;
      this.debouncedAPISearch(value);
    },

    isListItemSelected(listItem) {
      if (this.multiselect) {
        for (const tag of this.selectedTags) {
          if (tag === listItem.value) {
            return true;
          }
        }

        return false;
      }

      return listItem.index === this.activeItemIndex;
    },

    stylesForListItem(listItem) {
      if (!this.isListItemSelected(listItem)) {
        return `hover:bg-dark-5% ${this.shouldShowDivider(listItem) ? 'border-b-2 border-dark-5%' : 'border-2 border-transparent'} `;
      }

      return `bg-lilac-faded text-lilac border-lilac-faded ${this.shouldShowDivider(listItem) ? 'border-b-2' : 'border-2'} `;
    },

    stopPageScroll(e) {
      if (
        document.activeElement
          && document.activeElement.className
          && document.activeElement.className.includes('listbox-button')
          && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)
      ) {
        e.preventDefault();
      }
    },

    scrollPageToFitOpenedListbox() {
      const self = this;
      const { listbox } = self.$refs;
      const rect = listbox?.getBoundingClientRect();
      if (rect.bottom > window.innerHeight) {
        document.documentElement.scrollTop = document.documentElement.scrollTop
            + rect.bottom
            - window.innerHeight;
      }
    },

    scrollListbox() {
      const self = this;
      const list = self.$refs.listbox;
      if (!list) {
        return;
      }
      const { activeItemIndex } = self;
      const item = self.$refs[`listbox-item-${activeItemIndex}`][0];
      if (!item) {
        return;
      }
      const listTop = list.scrollTop;
      const listBottom = listTop + list.offsetHeight;
      const itemTop = listTop
          + item.getBoundingClientRect().top
          - list.getBoundingClientRect().top;
      const itemBottom = itemTop + item.offsetHeight;
      if (itemTop < listTop) {
        list.scrollTop = itemTop;
      } else if (itemBottom > listBottom) {
        list.scrollTop = itemBottom - list.offsetHeight;
      }
    },

    scrollToIdxOnToggleOpen() {
      const self = this;
      const list = self.$refs.listbox;
      if (!list) {
        return;
      }
      const item = self.$refs[`listbox-item-${14}`][0];
      if (!item) {
        return;
      }
      const listTop = list.scrollTop;
      const listBottom = listTop + list.offsetHeight;
      const itemTop = listTop
          + item.getBoundingClientRect().top
          - list.getBoundingClientRect().top;
      const itemBottom = itemTop + item.offsetHeight;
      if (itemTop < listTop) {
        list.scrollTop = itemTop;
      } else if (itemBottom > listBottom) {
        list.scrollTop = itemBottom - list.offsetHeight;
      }
    },

    close() {
      this.open = false;
      this.$emit('close');
    },

    toggleOpen() {
      this.open = !this.open;

      if (this.scrollListToItem) {
        this.scrollToItem();
      }

      if (this.open) {
        // The elements of the share quiz modal were inide scrollable div & so the dropdown was
        // being hidden inside the scrollable div. Added this conditional check for that.
        if (this.showFixedPositionList) { this.setListStyle(); }

        this.$emit('open');
        scrollPageTimeout = setTimeout(this.scrollPageToFitOpenedListbox, 150);
      } else {
        this.$emit('close');
      }
    },

    setListStyle() {
      const btnDropDown = this.$refs['listbox-button'];
      const listHolder = this.$refs.listbox;

      // calculating the position of the droppdown button & placing the list according to it.
      // Also, calculating the width of the button & specifying the minWidth of the list.
      listHolder.style.position = 'fixed';
      listHolder.style.minWidth = `${btnDropDown ? btnDropDown.offsetWidth : '220'}px`;
      listHolder.style.maxWidth = this.maxListWidth;
      listHolder.style.width = 'auto';

      const elePos = btnDropDown?.getBoundingClientRect();
      if (elePos && !this.autoPosition) {
        listHolder.style.top = `${elePos.top}px`;
        listHolder.style.left = `${elePos.left}px`;
      }
    },

    hasTIcon(item) {
      return !isEmpty(item.ticon);
    },

    getUUID() {
      return getUUID();
    },

    emitInput(item) {
      this.$emit('update:modelValue', item);
      this.$emit('input', item);
    },

    selectItem(item, event) {
      if (this.preventDefaultBehaviourAfterSelection) {
        event.preventDefault();
      }
      if (!item || item.isLocked) { return {}; }

      if (this.multiselect) {
        this.selectedTags = [...this.selectedTags, item.value];

        this.$emit('setTags', this.selectedTags);
      }

      if (item.isSuper && !hasFeatureAccess(item.forSuper.feat) && !this.shouldAllowUsingSuperQuestionTypes) {
        const options = {};

        if (!isEmpty(item.forSuper.feat)) {
          options.feat = item.forSuper.feat;
        }

        if (!isEmpty(item.forSuper.variant)) {
          options.variant = item.forSuper.variant;
        }

        const { type } = item.forSuper;
        /**
         * Added delay to avoid the click on overlay
         * The upsell will open after the user has finished selecting an option
         */
        superUpsellTimeout = setTimeout(() => {
          this.$eventBus.$emit('superUpsell:show', { type, options });
          this.$emit('super-option-selected');
        }, 200);
        return;
      }

      this.open = false;
      this.emitInput(item[this.selectBy]);
    },

    selectPrevious(event) {
      if (!this.open) {
        return;
      }
      let selectedItem;
      if (this.activeItemIndex === 0) {
        selectedItem = this.list[this.list.length - 1];
      } else {
        selectedItem = this.list[this.activeItemIndex - 1];
      }
      this.emitInput(selectedItem[this.selectBy]);
      setTimeout(this.scrollListbox, 60);
      event.preventDefault();
    },

    selectNext(event) {
      if (!this.open) {
        return;
      }
      let selectedItem;
      if (this.activeItemIndex === this.list.length - 1) {
        selectedItem = this.list[0];
      } else {
        selectedItem = this.list[this.activeItemIndex + 1];
      }
      if (!selectedItem) {
        return;
      }
      this.emitInput(selectedItem[this.selectBy]);
      setTimeout(this.scrollListbox, 60);
      event.preventDefault();
    },

    scrollToItem() {
      setTimeout(this.scrollToIdxOnToggleOpen, 100);
    },

    getSelectedItemId() {
      if (!this.isAnItemSelected) {
        return -1;
      }
      return this.listWithIds[this.activeItemIndex].id;
    },

    getSelectedItemLimage() {
      if (this.isAnItemSelected) {
        return this.listWithIds[this.activeItemIndex].limage;
      }
      return false;
    },

    getTitleOrSubtitleOrPlaceholder() {
      if (!this.isAnItemSelected) {
        return this.placeholder;
      }
      return this.selectedItem.title || this.selectedItem.subtitle || this.placeholder;
    },

    deleteTag(index) {
      const newTags = [...this.selectedTags.slice(0, index), ...this.selectedTags.slice(index + 1)];

      this.selectedTags = newTags;
      this.$emit('setTags', newTags);
    },

    getTagDisplay(selected) {
      for (const tag of this.list) {
        if (selected === tag.value) {
          return tag.title;
        }
      }

      return null;
    },

    truncateLargeText(str) {
      return this.$stringUtils.truncateLongStrings(str, this.truncateLength, this.isAnItemSelected);
    },
  },
};
</script>
