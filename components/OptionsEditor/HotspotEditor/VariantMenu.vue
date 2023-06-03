<template>
  <div class="hotspot-variant-menu md:mt-3 bg-dark-20% rounded-lg md:border-1 border-light-20% px-3 py-4 flex flex-col gap-y-5">
    <div
      v-if="!isAnyHotspotActive"
      class="text-sm md:text-2xl font-semibold text-light-3 md:text-light-66%"
    >
      <i18n>Select the type of hotspot</i18n>
    </div>

    <div v-if="isAnyHotspotActive">
      <div
        class="flex mb-4"
      >
        <Button
          licon="fas fa-undo"
          :aria-label="$i18n('Undo')"
          type="transparent"
          :size="isForMobile ? 'xs' : 'lg'"
          @click="triggerCanvasAction('undo')"
        />
        <Button
          licon="fas fa-redo"
          type="transparent"
          :aria-label="$i18n('Redo')"
          :size="isForMobile ? 'xs' : 'lg'"
          class="ml-2"
          @click="triggerCanvasAction('redo')"
        />

        <span
          v-if="!isForMobile"
          class="ml-auto text-2xl text-light-66% font-semibold"
        >
          <i18n>Hotspot</i18n>
        </span>

        <Button
          class="ml-auto"
          licon="fal fa-trash"
          :title="$i18n('Clear all')"
          :aria-label="$i18n('Clear all hotspots')"
          type="danger-transparent"
          :size="isForMobile ? 'xs' : 'lg'"
          @click="triggerCanvasAction('clearAll')"
        />
      </div>
      <div class="flex gap-2">
        <Button
          v-tooltip="activeHotspotProps.tooltip"
          v-bind="activeHotspotProps.props"
          @click="setHotspotType(currentHotspot)"
        />
        <PopoverConfirmer
          :open="askForHotspotChangeConfirmation"
          type="warn"
          placement="top"
          trigger="manual"
          :autoHide="false"
          :content="{
            title: $i18n('Some data could be changed'),
            subTitle: $i18n('The hotspot type you’re trying to change to has a very different format. You will have to start again.'),
          }"
          :button1="{
            title: $i18n('Cancel'),
            type: 'other',
          }"
          :button2="{
            title: $i18n('Change to {$1}', [hotspotTypeToChangeTo]),
          }"
          @button1Clicked="resetConfirmation"
          @button2Clicked="changeHotspotType(hotspotTypeToChangeTo)"
        >
          <Dropdown
            ref="hotspotSelectorDropdown"
            size="lg"
            iconOnly
            iconWithSize="p-2"
            icon="fas fa-ellipsis-vertical"
            horizontalAlignment="right"
            openDirection="top"
            listWidth="w-fit"
            type="toolbar"
            :customCaretDownIconSize="18"
            :aria-label="$i18n('Change hotspot')"
          >
            <ul
              class="bg-dark-2 w-64 rounded overflow-hidden"
            >
              <li class="bg-dark-90% py-2 px-4 text-sm md:text-xl font-semibold text-light-66%">
                <i18n>Change hotspot</i18n>
              </li>
              <li
                v-for="hotspot in hotspotList"
                :key="hotspot.type"
                class="border-b-2 border-dark-2"
              >
                <button
                  v-if="!hotspot.hidden"
                  class="text-light-2 w-full text-left hover:bg-dark-80% p-2 font-semibold text-sm md:text-xl"
                  @click="setHotspotChangeIntent(hotspot.type)"
                >
                  <FA
                    :icon="hotspot.icon"
                    class="mx-2"
                    :size="isForMobile ? 12 : 18"
                  />
                  {{ hotspot.title }}
                </button>
              </li>
            </ul>
          </Dropdown>
        </PopoverConfirmer>
      </div>
    </div>
    <div
      v-else
      class="flex justify-evenly items-center gap-2"
      :class="{
        'flex-wrap': isForMobile,
      }"
    >
      <Button
        :title="$i18n('Point')"
        class="grow"
        :size="isForMobile ? 'md' : 'lg'"
        licon="fal fa-circle"
        :aria-label="$i18n('Add point hotspot')"
        :type="isCircleHotspot ? 'white' : 'transparent'"
        @click="setHotspotType($constants.HotspotTypes.CIRCLE)"
      />
      <Button
        :title="$i18n('Rectangle')"
        class="grow"
        :size="isForMobile ? 'md' : 'lg'"
        licon="fal fa-rectangle"
        :aria-label="$i18n('Add rectangle hotspot')"
        :type="isRectangleHotspot ? 'white' : 'transparent'"
        @click="setHotspotType($constants.HotspotTypes.RECTANGLE)"
      />
      <Button
        :title="$i18n('Freeform')"
        class="grow"
        :size="isForMobile ? 'md' : 'lg'"
        licon="fal fa-vector-polygon"
        :aria-label="$i18n('Add freeform hotspot')"
        :type="isFreeformHotspot ? 'white' : 'transparent'"
        @click="setHotspotType($constants.HotspotTypes.FREEFORM)"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  props: {
    isForMobile: {
      type: Boolean,
      default: false,
    },
  },
  emits: [],

  data() {
    return {
      isHotspotDropdownActive: false,
      hotspotDropdownStyles: {},

      askForHotspotChangeConfirmation: false,
      hotspotTypeToChangeTo: null,
    };
  },

  computed: {
    ...mapGetters('slideEditor', ['currentSlide']),
    ...mapGetters('uiManager', ['hotspotType', 'hotspotShowMarkAsDoneCta']),
    ...mapGetters('contentEditor', ['questionEditorDimensions', 'quizType']),

    editorScale() {
      if (this.isReadOnlyCanvas || this.isForMobile) {
        return 1;
      }

      const scale = this.questionEditorDimensions.scale ?? 1;
      return scale;
    },

    questionOptions() {
      return this.currentSlide.structure.options;
    },

    isAnyHotspotActive() {
      return Boolean(this.currentHotspot);
    },

    currentHotspot() {
      return this.questionOptions?.[0]?.geometry?.shape;
    },

    isCircleHotspot() {
      return this.hotspotType === this.$constants.HotspotTypes.CIRCLE;
    },

    isRectangleHotspot() {
      return this.hotspotType === this.$constants.HotspotTypes.RECTANGLE;
    },

    isFreeformHotspot() {
      return this.hotspotType === this.$constants.HotspotTypes.FREEFORM;
    },

    isHotspotLimitReached() {
      return this.questionOptions.length === 10;
    },

    hotspotList() {
      return [
        {
          type: this.$constants.HotspotTypes.CIRCLE,
          title: this.$i18n('Circle'),
          icon: 'fal fa-circle',
          hidden: this.currentHotspot === this.$constants.HotspotTypes.CIRCLE,
        },
        {
          type: this.$constants.HotspotTypes.RECTANGLE,
          title: this.$i18n('Rectangle'),
          icon: 'fal fa-rectangle',
          hidden: this.currentHotspot === this.$constants.HotspotTypes.RECTANGLE,
        },
        {
          type: this.$constants.HotspotTypes.FREEFORM,
          title: this.$i18n('Freeform'),
          icon: 'fal fa-vector-polygon',
          hidden: this.currentHotspot === this.$constants.HotspotTypes.FREEFORM,
        },
      ];
    },

    activeHotspotProps() {
      const buttonProps = {
        type: this.hotspotType && !this.hotspotShowMarkAsDoneCta ? 'white' : 'transparent',
        size: this.isForMobile ? 'md' : 'lg',
        class: 'grow',
      };

      const tooltip = {
        placement: 'top',
        content: '',
      };

      if (this.isHotspotLimitReached) {
        tooltip.classes = 'error-tooltip';
        tooltip.content = this.$i18n('You cannot add more than 10 hotspots');
      }

      if (this.currentHotspot === this.$constants.HotspotTypes.CIRCLE) {
        buttonProps.title = this.$i18n('Add point hotspot');
        buttonProps.licon = 'fal fa-circle';
      }

      if (this.currentHotspot === this.$constants.HotspotTypes.RECTANGLE) {
        buttonProps.title = this.$i18n('Add rectangle hotspot');
        buttonProps.licon = 'fal fa-rectangle';
      }

      if (this.currentHotspot === this.$constants.HotspotTypes.FREEFORM) {
        buttonProps.title = this.$i18n('Add freeform hotspot');
        buttonProps.licon = 'fal fa-vector-polygon';

        if (this.hotspotShowMarkAsDoneCta) {
          buttonProps.title = this.$i18n('Mark as done');
          buttonProps.licon = '';

          tooltip.triggers = [];
          tooltip.shown = true;
          tooltip.theme = 'info-tooltip';
          tooltip.content = this.$i18n('Mark as done once you finish creating the desired shape.');
        }
      }

      return {
        props: buttonProps,
        tooltip,
      };
    },
  },

  methods: {
    toggleHotspotDropdown() {
      this.isHotspotDropdownActive = !this.isHotspotDropdownActive;

      if (!this.$refs.hotspotDropdownButton || !this.isHotspotDropdownActive) {
        return;
      }

      this.$nextTick(() => {
        const {
          top, left, height, width,
        } = this.$refs.hotspotDropdownButton.getBoundingClientRect();
        const { height: dropdownHeight, width: dropdownWidth } = this.$refs.hotspotDropdown?.getBoundingClientRect() ?? {};

        if (this.isForMobile) {
          this.hotspotDropdownStyles = {
            top: `${top - dropdownHeight}px`,
            left: `${left - dropdownWidth + width}px`,
            zIndex: 100,
          };
          return;
        }

        this.hotspotDropdownStyles = {
          top: `${top - height / this.editorScale - dropdownHeight - 20}px`,
          left: `${left * this.editorScale - dropdownWidth - 10}px`,
          zIndex: 100,
        };
      });
    },

    setHotspotType(type) {
      if (this.hotspotShowMarkAsDoneCta) {
        this.$store.dispatch('uiManager/setHotspotMarkAsDoneCta', false);
        this.$store.dispatch('uiManager/setHotspotType', null);
        return;
      }

      if (this.isHotspotLimitReached) {
        return;
      }

      const eventName = this.$webEvents.getQuizEditorEvent(this.quizType, this.$webEvents.HOTSPOT_OPTION_TYPE_SELECTED);
      this.$analytics.logEvent(
        eventName,
        {
          typeSelected: type,
        },
      );

      if (type === this.hotspotType) {
        this.$store.dispatch('uiManager/setHotspotType', null);
        return;
      }

      this.$store.dispatch('uiManager/setHotspotType', type);
    },

    setHotspotChangeIntent(hotspotType) {
      this.$refs.hotspotSelectorDropdown.close();

      this.askForHotspotChangeConfirmation = true;
      this.hotspotTypeToChangeTo = hotspotType;
    },

    changeHotspotType(type) {
      this.isHotspotDropdownActive = false;
      this.triggerCanvasAction('clearAll');
      this.$store.dispatch('uiManager/setHotspotType', type);

      this.resetConfirmation();
    },

    resetConfirmation() {
      this.askForHotspotChangeConfirmation = false;
      this.hotspotTypeToChangeTo = null;
    },

    triggerCanvasAction(action) {
      this.$eventBus.$emit('hotspotCanvas:action', action);
    },
  },
};
</script>

<style lang="scss">
</style>
