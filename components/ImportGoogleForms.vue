<template>
  <Modal
    v-if="importFormsLoading"
    :showCloseModalBtn="false"
    :title="$i18n('Importing content...')"
    :subtitle="$i18n('This might take few seconds')"
    icon="fa-solid fa-cloud-arrow-up"
  >
    <div class="flex flex-col justify-center items-center py-2 mx-auto">
      <ProgressBar
        ref="render-progress-bar"
        :maxValue="20"
        :currentValue="currentProgress"
        class="h-4"
      />
    </div>
  </Modal>
</template>

<script>

import { mapGetters } from 'vuex';

import ImportFormsMixin from '~/mixins/ImportFormsMixin';
import { loadExternalScriptDynamically } from '~/utils/Utilities';

export default {

  mixins: [ImportFormsMixin],

  computed: {
    ...mapGetters('uiManager', ['isImportFormsShowing']),
  },

  async created() {
    try {
      const response = await loadExternalScriptDynamically('https://apis.google.com/js/api.js');
      if (response.success) {
        this.importGoogleForm();
      } else {
        this.showToast({ type: this.$constants.ToastTypes.ERROR, title: this.$i18n('Please enable popups or refresh the page') });
      }
    } catch (err) {
      this.showToast({ type: this.$constants.ToastTypes.ERROR, title: this.$i18n('Please enable popups or refresh the page') });
    }
  },

  computed: {
    ...mapGetters('uiManager', ['isImportFormsShowing']),
  },

};
</script>
