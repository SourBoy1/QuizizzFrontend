<template>
  <Modal
    :button2="null"
    :button1="null"
    :hideHeader="true"
    :shouldCloseOnMaskClick="true"
    :zeroPadding="true"
    containerClasses="max-w-qmd super-upsell z-10 bg-super-faded border-1 border-super pl-0 pr-0 pt-0 pb-0 rounded-2xl"
    closeBtnClasses="text-dark-4"
    :stickToBottom="isMobile"
    backgroundColor="bg-super-faded"
    :showFooter="false"
    :fixedHeight="false"
    @close="close"
  >
    <div
      v-click-outside="() => onOutsideClicked()"
      class="px-6 py-4"
    >
      <ReferralExpiryTimer />
      <div v-if="isNotLoading">
        <div class="flex flex-col rounded-lg">
          <div>
            <i18n class="font-bold text-xl md:text-3xl mt-3">
              You also have
            </i18n>&nbsp;&nbsp;<em
              class="font-bold text-xl md:text-3xl mt-3 text-super"
            >{{ $i18n('3 free upgrades') }}</em>&nbsp;&nbsp;<i18n class="font-bold text-xl md:text-3xl">
              to give away
            </i18n>
          </div>
          <div
            v-if="emailIds?.length < 3"
            class="w-11/12 my-4"
          >
            <i18n class="text-dark-4 text-xs md:text-sm">
              Know someone at
            </i18n>&nbsp;<span class="font-bold text-sm">{{
              getOrgName }}</span>&nbsp;<i18n class="text-dark-4 text-xs md:text-sm">
              who might love Quizizz?
              &nbsp;&nbsp;Send them a free 1-month upgrade!
            </i18n>
          </div>
        </div>
        <div v-if="emailIds?.length < 3">
          <div class="flex items-center">
            <TagInput
              ref="emailsToShare"
              class="w-full bg-light-3"
              autocomplete="off"
              :errorOnValidationFail="$i18n('Enter a valid email')"
              :placeholder="$i18n('Invite via email address')"
              :errorMessage="''"
              :isInFocus="isInputFocused"
              :delimiters="[' ', 'Enter', ',']"
              :validator="$stringUtils.emailValidator"
              @inputFocus="isInputFocused = true"
              @inputBlur="isInputFocused = false"
              @invalidTag="handleInvalidEmail"
              @setTags="handleAddEmail"
              @input="handleTagInput"
            />
            <Button
              class="w-1/4 min-w-max mx-2 p-2 flex flex-col justify-center bg-super text-light font-semibold text-sm rounded"
              :title="$i18n('Send Gift')"
              :loading="buttonLoading"
              type="super"
              buttonClasses="h-auto py-2"
              @click.stop="handleShareInvite"
            />
          </div>
          <div
            v-if="showError && emailsToShare?.length > 0"
            class="flex bg-red-10% justify-center items-center rounded px-2 mt-4"
          >
            <div>
              <FA class="fas fa-info-circle text-red-dark" />
            </div>
            <div class="text-xs text-red pl-4 py-2">
              {{ errorMessage }}
            </div>
          </div>
          <div class="text-dark-4 w-full text-center my-1 font-normal text-sm">
            <i18n>or</i18n>
          </div>
          <button
            class="primary-btn text-super-dark"
            @click.stop="copyLink"
          >
            <FA
              icon="far fa-copy"
              :size="14"
              class="mr-2"
            />
            <i18n>Copy and share link</i18n>
          </button>
          <div class="text-dark-4 w-full text-center my-4 font-normal text-sm">
            <i18n>Invites remaining</i18n>&nbsp;:&nbsp;{{ referralCount }}
          </div>
        </div>
        <div v-if="emailIds?.length > 0">
          <div class="text-base font-bold mt-2">
            <i18n>Gifts Given</i18n> ({{ emailIds?.length }})
          </div>
          <div class="flex flex-col">
            <div
              v-for="(email, index) in emailIds"
              :key="index"
              class="text-dark-4 text-xs font-semibold mt-3"
            >
              {{ email }}
            </div>
          </div>
        </div>
        <div
          v-if="emailIds?.length >= 3"
          class="w-full flex items-center red-bg rounded mt-8"
        >
          <div>
            <img src="https://cf.quizizz.com/image/High5_Interaction_Engagement 1.png" />
          </div>
          <div class="text-center font-semibold text-light px-4">
            <i18n>You’ve successfully given away all your gift subscriptions</i18n>
          </div>
        </div>
      </div>
      <div
        v-else
        class="flex justify-center items-center p-40"
      >
        <Loader :size="40" />
      </div>
    </div>
  </Modal>
</template>

<script>
import { mapGetters } from 'vuex';

import referralMixin from '~/mixins/referralMixin';
import ReferralApiService from '~/services/apis/ReferralApiService';
import ReferralExpiryTimer from '~/components/Referral/ReferralExpiryTimer.vue';

export default {
  components: { ReferralExpiryTimer },
  mixins: [referralMixin],
  emits: ['close'],
  data() {
    return {
      isInputFocused: false,
      showError: false,
      emailsToShare: [],
      emailIds: [],
      showInput: false,
      isNotLoading: true,
      buttonLoading: false,
      campaignId: this.$constants.CAMPAIGN_ID_SUPER_PLAN_REFER,
      errorMessage: '',
      referralLink: null,
    };
  },

  computed: {
    ...mapGetters('root', ['deviceProps', 'isDesktop', 'isMobile']),

    hasTrialLeft() {
      return this.$user.trialDaysLeft > 1;
    },

    getOrgName() {
      return this.$user.organizationName;
    },

    referralCount() {
      return this.$constants.MAX_INDI_PLAN_REFER - this.emailIds?.length;
    },
  },

  mounted() {
    this.isNotLoading = false;
    this.getCampaignList();
    this.getLink();
  },

  methods: {
    onOutsideClicked(ev) {
      ev.preventDefault();
      ev.stopPropagation();
      this.close();
    },

    show() {
      this.shouldShow = true;
      this.$analytics.logEvent(this.$webEvents.INDIVIDUAL_REFERRAL_STATS_MODAL_SHOWN, {
        campaignId: this.$constants.CAMPAIGN_ID_SUPER_PLAN_REFER,
      });
    },

    handleInvalidEmail(isInvalid) {
      this.invalidEmailAdded = isInvalid;
    },

    async getLink() {
      if (!this.referralLink) {
        this.isLoading = true;
        const Link = await this.getLinkForReferBasic();
        this.referralLink = Link.data.inviteLink;
        this.isNotLoading = true;
      }

      this.isLoading = false;
      return this.referralLink;
    },

    async copyLink() {
      await this.getLink();
      this.$clipboard.copy(this.referralLink);
      this.$analytics.logEvent(this.$webEvents.INDIVIDUAL_REFERRAL_COPY_CLICK, {
        campaignId: this.$constants.CAMPAIGN_ID_SUPER_PLAN_REFER,
      });

      this.$toasts.add({
        type: this.$constants.ToastTypes.SUCCESS,
        icon: 'fas fa-check-circle',
        title: this.$i18n('Link copied! Share/paste it on your favourite tool.'),
      });
    },

    handleAddEmail(tags) {
      this.emailsToShare = tags;
      this.showError = false;
    },

    handleTagInput(value) {
      if (this.$stringUtils.emailValidator(value)) {
        this.$refs.emailsToShare.tooltipContent = this.$i18n('Press Enter to add email');
        this.$refs.emailsToShare.triggerTooltip();
      }
    },

    async handleShareInvite() {
      if (this.emailsToShare?.length === 0) {
        this.$toasts.add({
          type: this.$constants.ToastTypes.ERROR,
          icon: 'fas fa-times-circle',
          title: this.$i18n('Please enter an email'),
        });
        return;
      }

      if (this.emailsToShare?.length > (this.$constants.MAX_INDI_PLAN_REFER - this.emailIds?.length)) {
        const emailCount = this.$constants.MAX_INDI_PLAN_REFER - this.emailIds?.length;
        this.$toasts.add({
          type: this.$constants.ToastTypes.ERROR,
          icon: 'fas fa-times-circle',
          title: this.$i18n('You can send only {$1} gift now', [emailCount]),
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

      this.buttonLoading = true;

      const response = await this.getLinkForReferBasic(this.emailsToShare);
      if (response.success) {
        this.showError = false;
        this.$analytics.logEvent(this.$webEvents.INDIVIDUAL_REFERRAL_MAIL_SUCCESS, {
          emails: this.emailsToShare,
          campaignId: this.$constants.CAMPAIGN_ID_SUPER_PLAN_REFER,
        });
        this.$toasts.add({
          type: this.$constants.ToastTypes.SUCCESS,
          icon: 'fas fa-check-circle',
          title: this.$i18n('Invite sent'),
        });

        this.$refs.emailsToShare.clearTags();
        this.emailsToShare = [];
        this.getCampaignList();
      } else {
        this.showError = true;
        this.errorMessage = response.message;
        this.$analytics.logEvent(this.$webEvents.INDIVIDUAL_REFERRAL_MAIL_FAIL, {
          emails: this.emailsToShare,
          campaignId: this.$constants.CAMPAIGN_ID_SUPER_PLAN_REFER,
        });
        this.$toasts.add({
          type: this.$constants.ToastTypes.ERROR,
          icon: 'fas fa-times-circle',
          title: this.$i18n('Something went wrong'),
        });
      }

      this.buttonLoading = false;
    },

    async getCampaignList() {
      const campaigns = await ReferralApiService.getCampaigns();
      let referredEmail = [];
      const currentCampaign = campaigns.filter((cmp) => cmp.id === this.campaignId);
      if (currentCampaign[0]?.meta?.refereeDetails.length === 0 && currentCampaign[0]?.meta?.referredEmails.length !== 0) {
        this.emailIds = currentCampaign[0]?.meta?.referredEmails || [];
      } else if (currentCampaign[0]?.meta?.refereeDetails.length !== 0 && currentCampaign[0]?.meta?.referredEmails.length === 0) {
        this.emailIds = currentCampaign[0]?.meta?.refereeDetails || [];
        this.emailIds = this.emailIds.map((data) => data.email);
      } else {
        this.emailIds = currentCampaign[0]?.meta?.refereeDetails || [];
        referredEmail = this.emailIds.map((data) => data.referralEmail);
        this.emailIds = this.emailIds.map((data) => data.email);
        if (this.referralCount > 0) {
          currentCampaign[0]?.meta?.referredEmails.forEach((email) => {
            if (!referredEmail.includes(email)) {
              this.emailIds.push(email);
            }
          });
        }
      }
      this.showInput = this.emailIds?.length < this.$constants.MAX_INDI_PLAN_REFER;
    },

    close() {
      this.$emit('close');
    },
  },
};
</script>

<style scoped lang="scss">.primary-btn {
  @apply w-full bg-super-20% rounded-lg text-super font-semibold h-10 mb-2 text-base;
}

.red-bg {
  background-color: #E33E4E;
}</style>
