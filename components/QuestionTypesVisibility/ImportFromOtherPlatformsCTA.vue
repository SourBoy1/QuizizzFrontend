<template>
  <div class="relative">
    <Dropdown
      type="custom"
      customClasses="flex justify-center flex-1 h-[31px] bg-dark-5%"
      centerAligned
      :title="getDropdownTitle"
      :openDirection="'bottom'"
    >
      <ul class="w-full flex flex-col min-h-31 h-full bg-light-1 px-2">
        <li class="flex flex-1 mt-2">
          <Button
            buttonClasses="!justify-start flex-1"
            type="white"
            :title="$i18n('Spreadsheet')"
            licon="fas fa-table-cells-large"
            liconClasses="text-brand-b"
            size="md"
            @click="handleOtherPlatformsClick('spreadsheet')"
          />
        </li>
        <li class="flex flex-1">
          <Button
            buttonClasses="!justify-start flex-1"
            type="white"
            :title="$i18n('Google Forms')"
            licon="fas fa-file-spreadsheet"
            liconClasses="text-lilac"
            size="md"
            @click="handleOtherPlatformsClick('googleForm')"
          />
        </li>
      </ul>
    </Dropdown>
  </div>
</template>

<script>
export default {
  props: {
    isDesktop: {
      type: Boolean,
      default: true,
    },

    isTablet: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['handleOtherPlatformsImport'],

  data() {
    return {
      showOtherPlatforms: false,
    };
  },

  computed: {
    isDesktopOrTablet() {
      return this.isDesktop || this.isTablet;
    },

    getDropdownTitle() {
      return this.isDesktopOrTablet ? this.$i18n('Import questions from other platforms') : this.$i18n('Import questions');
    },
  },

  methods: {
    handleOtherPlatformsClick(platform) {
      this.$emit('handleOtherPlatformsImport', platform);
    },
  },

};
</script>

<style lang="scss" scoped>
</style>
