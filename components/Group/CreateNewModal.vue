<template>
  <Modal
    :title="title"
    subtitle=""
    :button1="button1"
    :button2="{
      title: button2.title,
      type: button2.type,
      disabled: false,
      loading: button2.loading,
    }"
    size="md"
    titleCustomClasses="text-lg"
    :footerCustomClasses="footerCustomClasses"
    :overflowY="false"
    :dismissOnOverlayClick="true"
    :shouldCloseOnMaskClick="true"
    @close="$emit('close')"
    @button1-click="$emit('close')"
    @button2-click="handleSubmitClassDetails"
  >
    <div class="body">
      <div class="class-name mb-4">
        <div class="text-xs text-dark-60% font-semibold mb-0.5">
          <i18n>Enter Group name</i18n>
        </div>
        <div class="flex">
          <input
            id="name"
            v-model="className"
            autocomplete="off"
            type="text"
            :placeholder="getTranslatedPlaceholder"
            class="h-10 border-1 border-dark-5
                rounded rounded-tr-none rounded-br-none
                px-3 py-2"
          />
          <div
            ref="colorList"
            class="relative color-menu w-17 h-10
            rounded rounded-tl-none rounded-bl-none
            box-border border-dark-5 border-1 border-l-0
            hover:bg-dark-5%"
            @click="toggleColorList"
          >
            <div class="flex justify-center items-center w-full h-full cursor-pointer">
              <div
                class="color w-6 h-6 rounded-full mr-2.5 bg-yellow"
                :style="{ backgroundColor: selectedColor }"
              />
              <i class="fas fa-caret-down" />
            </div>
            <div
              v-click-outside="closeColorList"
              class="colors-list fixed w-46 bg-light border-1 rounded box-border border-dark-5 z-50 p-1.5"
              :class="{ show: showColorList }"
            >
              <div class="title px-2 py-1 text-center text-sm text-dark-3 font-semibold">
                <i18n>Class color code</i18n>
              </div>
              <div
                v-for="(color, ind) in colorsList"
                :key="ind"
                class="color inline-block rounded-full m-1.5 cursor-pointer"
                :style="{ backgroundColor: color }"
                @click.stop="selectColor(color)"
              />
            </div>
          </div>
        </div>
        <div
          v-if="error"
          class="text-xs p-2 text-red"
        >
          <i18n>Please enter the Group name</i18n>
        </div>
      </div>
    </div>
  </Modal>
</template>

<script>
import { mapGetters } from 'vuex';

import ClassService from '~/services/ClassService';

import Constants from '~/config/Constants';

export default {
  props: {
    action: {
      type: String,
      default: '',
    },
    classId: {
      type: String,
      default: '',
    },
  },
  emits: ['close', 'groupCreated'],

  data() {
    return {
      classObj: {},
      title: 'Title',
      error: false,
      button1: {
        title: this.$i18n('Cancel'),
        type: 'other',
      },

      footerCustomClasses: '',
      button2: {
        title: this.$i18n('Save'),
        type: 'primary',
        loading: false,
      },

      colorsList: Constants.groupColors,

      className: '',
      showColorList: false,
      selectedColor: '#3F51B5',
      parentEmail: false,
    };
  },

  computed: {
    ...mapGetters('classes', ['getClassById']),

    checkboxLabelStyles() {
      return {
        color: 'rgba(66, 66, 66, 1)',
        lineHeight: 1.375,
        fontWeight: 600,
        whiteSpace: 'pre-line',
        fontSize: '0.875rem',
      };
    },

    getTranslatedPlaceholder() {
      return this.$i18n('Try \'Sales team\' or \'All employees\'');
    },
  },

  created() {
    this.classObj = this.getClassById(this.classId) || {};
    this.assignValues();
  },

  methods: {
    assignValues() {
      switch (this.action) {
        case 'create': {
          this.title = this.$i18n('Create a new group');
          const randomIndex = Math.floor(Math.random() * this.colorsList.length);
          this.selectedColor = this.colorsList[randomIndex];
          this.button2.title = this.$i18n('Create group');
          this.button1 = {};
        }
          break;
        default:
      }
    },

    toggleColorList(ev) {
      this.showColorList = !this.showColorList;
      ev.stopPropagation();
    },

    closeColorList() {
      this.showColorList = false;
    },

    selectColor(color) {
      this.selectedColor = color;
    },

    getClassData() {
      return {
        name: this.className,
        color: this.selectedColor,
        requireParentEmail: this.parentEmail,
      };
    },

    async handleSubmitClassDetails() {
      if (!this.className) {
        this.error = true;
        return;
      }
      this.error = false;

      if (this.button2.loading) {
        return;
      }

      this.button2.loading = true;
      const data = this.getClassData();

      if (this.action === 'create') {
        const response = await ClassService.createClass(data);
        if (response) {
          this.$emit('groupCreated', response.group._id, response.group);
        }
      } else {
        await ClassService.updateClass(this.classId, data);
      }
      this.button2.loading = false;
      this.$emit('close');
    },
  },
};
</script>

<style lang="scss" scoped>
#name {
    width: calc(100% - 68px);
}

.color-menu {
  .colors-list {
    transform: scaleY(0.0001) translateX(-117px);
    transform-origin: top;
    transition: 0.1s all ease-in-out;
    opacity: 0;
    .color {
      width: 22px;
      height: 22px;
      transition: 0.1s all ease-in-out;

      &:hover {
          transform: scale(1.2);
      }
    }

    &.show {
      transform: scaleY(1) translateX(-117px);
      opacity: 1;
    }
  }
}
</style>
