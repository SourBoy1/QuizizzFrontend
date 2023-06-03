<template>
  <Modal
    v-if="show"
    icon="fas fa-users"
    :title="$i18n('Share an invite')"
    subtitle=""
    :button1="null"
    :button2="null"
    :dismissOnOverlayClick="true"
    :stickToBottom="isMobile"
    @close="close"
  >
    <div>
      <div class="flex items-center mb-2">
        <TagInput
          ref="emailsToShare"
          class="w-3/4"
          autocomplete="off"
          :errorOnValidationFail="$i18n('Enter a valid email')"
          :validator="$stringUtils.emailValidator"
          :placeholder="$i18n('Add people or email address')"
          :errorMessage="validationError"
          :delimiters="[' ', 'Enter', ',']"
          addTagOnBlur
          :isInFocus="isInputFocused"
          @inputFocus="isInputFocused = true"
          @inputBlur="isInputFocused = false"
          @invalidTag="handleInvalidEmail"
          @setTags="handleAddEmail"
          @input="handleTagInput"
        />
        <Button
          :title="$i18n('Share Invite')"
          class="w-1/4 min-w-max mx-2 h-11"
          :loading="loading"
          :disabled="emailsToShare.length === 0 ? true : false"
          @click="handleShareInvite"
        />
      </div>
      <a
        :href="referralLink"
        rel="noopenner noreferrer"
        target="_blank"
        class="underline text-blue ml-1 text-xs"
      >{{ referralLink }}</a>
    </div>
  </Modal>
</template>

<script>
import { mapGetters } from 'vuex';

import referralMixin from '~/mixins/referralMixin';
import MiscAPIService from '~/services/apis/MiscAPIService';

export default {
  mixins: [referralMixin],
  props: {
    referralLink: {
      type: String,
      default: null,
    },
  },

  data() {
    return {
      show: false,
      validationError: '',
      loading: false,
      emailsToShare: [],
      invalidEmailAdded: false,
      isInputFocused: false,
    };
  },

  computed: {
    ...mapGetters('root', ['deviceProps', 'serverData']),

    isMobile() {
      return this.deviceProps.type === this.$constants.DeviceTypes.PHONE;
    },

    shareTextWithLink() {
      return `${this.$i18n('Over 5 million teachers including me use #Quizizz to engage students in the classroom. Host an activity & unlock FREE Super to get unlimited access to teaching content & tools on #Quizizz')}. ${this.$i18n('Join using {$1}', [this.referralLink])}`;
    },
  },

  mounted() {
    this.$eventBus.$on('referralShareLinkModal:show', () => { this.show = true; });
  },

  beforeUnmount() {
    this.$eventBus.$off('referralShareLinkModal:show');
  },

  methods: {
    close() {
      this.show = false;
    },

    handleInvalidEmail(isInvalid) {
      this.invalidEmailAdded = isInvalid;
    },

    handleAddEmail(tags) {
      this.emailsToShare = tags;
    },

    handleTagInput(value) {
      if (this.$stringUtils.emailValidator(value)) {
        this.$refs.emailsToShare.tooltipContent = this.$i18n('Press Enter to add email');
        this.$refs.emailsToShare.triggerTooltip();
      }
    },

    async handleShareInvite() {
      if (this.emailsToShare.length === 0) {
        this.$toasts.add({
          type: this.$constants.ToastTypes.ERROR,
          icon: 'fas fa-times-circle',
          title: this.$i18n('Please enter an email'),
        });
        return;
      }

      if (this.invalidEmailAdded) {
        this.$toasts.add({
          type: this.$constants.ToastTypes.ERROR,
          icon: 'fas fa-times-circle',
          title: this.$i18n('Please enter valid emails'),
        });
        return;
      }

      this.loading = true;

      const response = await MiscAPIService.shareReferralLinkViaEmail({ emailsToShare: this.emailsToShare, link: this.referralLink });
      this.loading = false;

      this.$analytics.logEvent(this.$webEvents.REFERRAL_LINK_CLICK, {
        country: this.serverData.requestCountry,
        emailId: this.emailsToShare,
      });

      if (response.success) {
        this.$toasts.add({
          type: this.$constants.ToastTypes.SUCCESS,
          icon: 'fas fa-check-circle',
          title: this.$i18n('Invite sent'),
        });

        this.$refs.emailsToShare.clearTags();
        this.emailsToShare = [];
      } else {
        this.$toasts.add({
          type: this.$constants.ToastTypes.ERROR,
          icon: 'fas fa-times-circle',
          title: this.$i18n('Something went wrong'),
        });
      }
    },
  },
};
</script>
