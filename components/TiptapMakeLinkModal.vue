<template>
  <Modal
    v-if="isModalActive"
    class="tiptap-make-link-modal font-open-sans"
    icon="fas fa-link"
    :title="isLinkToEdit ? $i18n('Edit link') : $i18n('Insert link')"
    :subtitle="isLinkToEdit ? $i18n('Edit or remove link from your text') : $i18n('Link any web content into your text.')"
    dismissOnOverlayClick
    :button1="{
      title: $i18n('Cancel'),
      type: 'other',
    }"
    :button2="{
      title: $i18n('Save'),
      type: 'primary',
    }"
    :stickToBottom="isStuckToBottom"
    @button1-click="handleToggleModal"
    @button2-click="handleAddLink"
    @close="handleToggleModal"
  >
    <div class="flex items-center">
      <Input
        v-model="link"
        :aria-label="$i18n('Link for the text')"
        :label="$i18n('Link')"
        licon="far fa-link"
        :ticonSize="8"
        :ticonClasses="ticonClasses"
        :ticon="validationIcon"
        :errorMessage="errorMessage"
        :placeholder="`${$i18n('for example')}: quizizz.com`"
        :button="buttonProps"
        @buttonClick="unsetLink"
      />
    </div>
  </Modal>
</template>

<script>
import { mapGetters } from 'vuex';

export default {

  props: {
    isForQuizEditor: {
      type: Boolean,
      default: false,
    },

    showMobileLayout: {
      type: Boolean,
      default: false,
    },
  },
  emits: [],

  data() {
    return {
      isModalActive: false,
      link: '',
      isLinkToEdit: false,
      protocol: 'https://',
    };
  },

  computed: {
    ...mapGetters('root', ['isDesktop']),

    buttonProps() {
      if (!this.isLinkToEdit) {
        return null;
      }

      return {
        type: 'primary',
        title: this.$i18n('Unlink'),
      };
    },

    fullLink() {
      if (this.link?.includes('http')) {
        return this.link;
      }

      return this.protocol + this.link;
    },

    isStuckToBottom() {
      return this.showMobileLayout && !this.isDesktop;
    },

    validationIcon() {
      if (!this.link) {
        return null;
      }

      return this.errorMessage ? 'far fa-times' : 'far fa-check';
    },

    ticonClasses() {
      let classes = 'text-xs h-3 w-3 justify-center items-center text-light rounded-full ';
      if (!this.errorMessage) {
        classes += 'bg-green ';
      }

      classes += 'bg-red text-light ';

      return classes;
    },

    errorMessage() {
      if (!this.link) {
        return null;
      }

      if (!this.$stringUtils.linkValidator(this.fullLink)) {
        return this.$i18n('Please complete the link for eg: google.com');
      }

      return null;
    },
  },

  mounted() {
    this.$eventBus.$on('makeLinkModal:toggle', this.handleToggleModal);
  },

  beforeUnmount() {
    this.$eventBus.$off('makeLinkModal:toggle', this.handleToggleModal);
  },

  methods: {
    handleAddLink() {
      if (this.isForQuizEditor) {
        this.$eventBus.$emit('questionEditor:link', { command: 'set-link', link: this.fullLink });
      } else {
        this.$eventBus.$emit('slideElement:link', { command: 'set-link', link: this.fullLink });
      }

      this.handleToggleModal();
    },

    handleToggleModal(linkToEdit = '') {
      if (linkToEdit !== '') {
        this.isLinkToEdit = true;
        const splitURl = linkToEdit.split('/');
        this.protocol = `${splitURl[0]}//`;
        this.link = splitURl[2];
      }

      this.isModalActive = !this.isModalActive;

      if (!this.isModalActive) {
        this.link = '';
        this.isLinkToEdit = false;
      }
    },

    unsetLink() {
      if (this.isForQuizEditor) {
        this.$eventBus.$emit('questionEditor:link', { command: 'unset-link' });
      } else {
        this.$eventBus.$emit('slideElement:link', { command: 'unset-link' });
      }

      this.link = '';
      this.isLinkToEdit = false;
    },
  },
};
</script>

<style lang="scss" scoped>
  .font-open-sans {
    font-family: 'Open Sans', sans-serif !important;
  }
</style>
