<template>
  <Modal
    :title="null"
    :subtitle="null"
    @close="$emit('close')"
  >
    <div class="my-2">
      <div class="text-2xl font-bold">
        <i18n>Create unlimited teams with a </i18n><span class="text-super mx-2"><i18n>SCHOOLS AND DISTRICTS</i18n></span><span><i18n> Plan</i18n></span>
      </div>
      <div class="flex rounded border border-dark-6 mt-4">
        <div class="flex-1 bg-light-1 p-4 border border-t-0 border-b-0 border-l-0 border-r-1 border-dark-6">
          <div class="text-xs font-bold">
            <i18n>Current Plan</i18n>
          </div>
          <div class="mt-4">
            <span><FA
              :size="12"
              icon="far fa-check"
              class="text-dark-5 mr-1"
            /></span>
            <span class="text-xs text-dark-3"><i18n>1 team per user</i18n></span>
          </div>
          <div class="mt-2">
            <span><FA
              :size="12"
              icon="far fa-check"
              class="text-dark-5 mr-1"
            /></span>
            <span class="text-xs text-dark-3"><i18n>Upto 5 activities per team</i18n></span>
          </div>
        </div>
        <div class="flex-1 bg-super-10% p-4">
          <div class="text-xs font-bold">
            <i18n>Schools and Districts Plan</i18n>
          </div>
          <div class="mt-4">
            <span><FA
              :size="12"
              icon="far fa-infinity"
              class="text-super mr-1"
            /></span>
            <span class="text-xs text-dark-3"><i18n>Create unlimited teams</i18n></span>
          </div>
          <div class="mt-2">
            <span><FA
              :size="12"
              icon="far fa-infinity"
              class="text-super mr-1"
            /></span>
            <span class="text-xs text-dark-3"><i18n>Add unlimited activities</i18n></span>
          </div>
        </div>
      </div>
      <Button
        class="w-full my-7"
        :title="$i18n('Learn more')"
        size="xl"
        type="super"
        @click="onCTAClick"
      />
    </div>
  </Modal>
</template>

<script>
import { mapGetters } from 'vuex';

export default {

  props: {
    questionsList: {
      type: Array,
      default: () => [],
    },
    contentTypeToCreate: {
      type: String,
      default: '',
    },
    createLoading: {
      type: Boolean,
      default: false,
    },
    openInEditorLoading: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['close'],

  data() {
    return {
      tagsForEntity: [],
      errorMessage: '',
      alerts: {},
      loading: {},
      disabled: false,
    };
  },

  computed: {
    ...mapGetters('root', ['isDesktop']),

    disableBtns() {
      return this.createLoading || this.openInEditorLoading || !this.$user.isLoggedIn;
    },

  },

  methods: {
    onCTAClick() {
      this.$analytics.logEvent(this.$webEvents.SHARED_FOLDER_SND_PLAN_UPGRADE, {});
      this.$router.push('/super-pricing?feat=new-teams-button');
    },
  },

};
</script>

<style lang="scss">
.preview-card {
    border-radius: 0;
}
</style>
