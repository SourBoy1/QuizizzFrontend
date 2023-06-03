<template>
  <Modal
    v-if="canShow"
    :dismissOnOverlayClick="true"
    :stickToBottom="!isDesktop"
    size="lg"
    :hideHeader="true"
    @close="close"
  >
    <div class="px-10">
      <canvas
        ref="canvas"
        class="absolute w-full h-full left-0 top-0"
      />
      <div class="flex flex-col gap-6 items-center text-center">
        <div class="w-20 h-20 bg-lilac-faded rounded-50% flex items-center justify-center">
          <FA
            size="30"
            class="text-lilac text-lg block m-auto"
            icon="fas fa-trophy"
          />
        </div>
        <div class="text-dark-2 bg-light-2 border-1 border-dark-6 rounded-lg py-4 px-8 w-full">
          <i18n
            v-if="isCompleted"
            :injections="[trainerName]"
          >
            You have completed the training program conducted by {$1}
          </i18n>
          <i18n
            v-else
            :injections="[trainerName]"
          >
            You have completed the training lesson shared by {$1}
          </i18n>
        </div>
        <i18n class="text-dark-2 font-semibold text-xl">
          Host a quiz with your students & get rewarded
        </i18n>
        <div class="flex flex-row gap-4 text-dark-2 w-full">
          <div class="flex-1 bg-light-2 rounded-xl p-6">
            <div class="flex flex-col items-center gap-2 justify-around h-full max-w-40 m-auto">
              <div class="w-14 h-14 bg-yellow-faded rounded-50% flex items-center justify-center">
                <FA
                  size="20"
                  class="text-super text-lg block m-auto"
                  icon="fas fa-bolt-lightning"
                />
              </div>
              <i18n class="text-sm font-semibold">
                Free Quizizz Super for 1 month
              </i18n>
              <span
                v-if="isCompleted"
                class="text-green-dark text-xxs"
              ><FA
                icon="fas fa-check-circle"
                size="12"
              /><i18n class="ml-1">Super has been activated</i18n></span>
            </div>
          </div>
          <div class="flex-1 bg-light-2 rounded-xl p-6">
            <div class="flex flex-col items-center gap-2 justify-around h-full max-w-40 m-auto">
              <div class="w-14 h-14 bg-lilac-faded rounded-50% flex items-center justify-center">
                <FA
                  size="20"
                  class="text-lilac text-lg block m-auto"
                  icon="fas fa-file-certificate"
                />
              </div>
              <i18n class="text-sm font-semibold">
                Participation Certificate
              </i18n>
              <Button
                v-if="isCompleted"
                :title="$i18n('Download')"
                type="secondary"
                :loading="downloadingCertificate"
                @click="downloadCertificate"
              />
            </div>
          </div>
        </div>
        <Button
          v-if="!isCompleted"
          :title="$i18n('Continue')"
          type="primary"
          @click="close"
        />
        <div
          v-else
          class="text-base text-dark-2"
        >
          <i18n>Become a</i18n><em>&nbsp;<i18n class="font-extrabold text-lilac">super trainer</i18n></em>?
          <a
            class="ml-1 text-sm text-lilac relative z-1"
            href="https://quizizz.com/home/super-trainer"
            rel="noopenner noreferrer"
            target="_blank"
            :aria-label="$i18n('Learn more')"
            @click="onLearnMoreClick"
          >
            {{ $i18n('Learn more') }}
          </a>
        </div>
      </div>
    </div>
  </Modal>
</template>
<script>
import get from 'lodash/get';
import { mapGetters } from 'vuex';

import MiscAPIService from '~/services/apis/MiscAPIService';

import referralMixin from '~/mixins/referralMixin';
import UserAPIService from '~/services/apis/UserAPIService';
import { getEnvironmentEnv } from '~/utils/EnvUtils';
import { removeQueryParams } from '~/utils/Utilities';

import STPContent from '~/config/STPContent';

export default {
  mixins: [referralMixin],
  emits: ['close'],

  data() {
    return {
      campaignData: null,
      canShow: false,
      downloadingCertificate: false,
    };
  },

  computed: {
    ...mapGetters('root', ['isDesktop', 'serverData']),

    trainerName() {
      const referrerUserMetaData = this.campaignData?.meta?.referrerUserMetaData;
      return referrerUserMetaData ? [referrerUserMetaData.title, referrerUserMetaData.firstName, referrerUserMetaData.lastName].join(' ').trim() : '';
    },

    status() {
      return this.campaignData?.meta?.status;
    },

    isCompleted() {
      return this.status === 'rewarded';
    },
  },

  async created() {
    if (this.$user.isLoggedIn) {
      this.campaignData = await this.getReferralCampaign(this.$constants.ReferralCampaigns.QUIZIZZ_SUPER_TRAINEE_CAMPAIGN);

      this.$nextTick(() => {
        this.checkAndShowModal();
      });
    }
  },

  methods: {
    async downloadCertificate() {
      this.downloadingCertificate = true;
      this.$analytics.logEvent(this.$webEvents.STP_TRAINEE_CERTIFICATE);
      const response = await MiscAPIService.getGenericCertification({ category: 'stp', type: 'stp_trainee' });
      this.downloadingCertificate = false;
      if (response.data?.success) {
        const { certificateURL } = response.data.data;
        if (certificateURL) {
          setTimeout(() => { // Workaround for Safari mobile and other browsers blocking popups on async context
            window.open(certificateURL, '_blank');
          });
        }
      } else {
        this.$toasts.add({
          type: this.$constants.ToastTypes.ERROR,
          icon: 'fas fa-times-circle',
          title: this.$i18n('Something went wrong while downloading the certificate'),
        });
      }
    },

    async checkAndShowModal() {
      const environment = getEnvironmentEnv();
      const traineeLessonId = STPContent.trainee[environment](this.serverData.requestCountry);
      const isTraineeLessonViewed = this.$route.query?.contentViewed === traineeLessonId;
      this.canShow = isTraineeLessonViewed && this.campaignData?.meta?.referrerUserId;
      if (this.canShow) {
        this.$analytics.logEvent(this.$webEvents.STP_TRAINEE_LESSON_VIEWED, { quizId: traineeLessonId });
      }

      if (isTraineeLessonViewed) {
        removeQueryParams(this.$router, ['contentViewed', 'incomplete']);
      }

      if (this.isCompleted) {
        const modalStatus = get(this.$user, 'userStore.events.modalsShown', {});

        if (!modalStatus.stpTraineeCompleted) {
          this.$analytics.logEvent(this.$webEvents.STP_TRAINEE_REWARDED);
          this.canShow = true;
          const payload = {
            _id: this.$user.id,
            modalsShown: {
              ...modalStatus,
              stpTraineeCompleted: true,
            },
          };

          await UserAPIService.updateUserEvents(payload);
        }

        if (this.canShow) {
          this.showConfettiOnModal();
        }
      }
    },

    showConfettiOnModal() {
      this.$confetti.start({
        particles: [
          {
            type: 'rect',
          },
        ],
        defaultSize: 2,
        defaultDropRate: 2,
        particlesPerFrame: 1,
        canvasElement: this.$refs.canvas,
      });

      setTimeout(() => {
        this.$confetti.stop();
      }, 2000);
    },

    onLearnMoreClick() {
      this.$analytics.logEvent(this.$webEvents.STP_TRAINEE_LEARN_MORE);
    },

    getCenterSpanStyles() {
      return {
        left: '50%',
        'word-break': 'break-all',
        'text-align': 'center',
        transform: 'translateX(-50%)',
      };
    },

    close() {
      this.canShow = false;
      this.$emit('close');
    },
  },
};
</script>
