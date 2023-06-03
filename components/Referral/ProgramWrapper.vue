<template>
  <div class="flex flex-col gap-4">
    <section
      header
      class="text-dark-3"
    >
      <section
        v-if="!isOnboardingReferee"
        class="flex"
      >
        <img
          width="55"
          src="https://cf.quizizz.com/img/super/super_image_with_glow.png"
          class="inline-block mr-4"
        />
        <p class="mt-1">
          <i18n class="text-base font-bold">
            Upgrade to
          </i18n>&nbsp;<em
            class="px-3 py-1 rounded-md bg-super text-light text-xxs"
          >{{ premiumPlanName }}</em>
          <br>
          <i18n class="mt-2 text-xs text-dark-3">
            Graduate from your basic plan
          </i18n>
        </p>
      </section>
      <section v-else>
        <p
          v
          class="text-dark-2 text-xl font-bold md:text-3xl"
        >
          {{ $i18n('{$1} has invited you to unlock free', [referrerName]) }} <em class="text-super">{{ premiumPlanName
          }}</em>
          <i18n>worth</i18n> <em class="text-super">{{ prependDollar(superPricingMonthly) }}</em>
        </p>
      </section>
    </section>
    <div
      v-if="showBenefits"
      class="flex flex-col gap-4"
    >
      <span
        v-if="showContextualBenefit"
        class="text-base font-semibold text-dark-4 w-full text-center"
        v-html="contextualBenefit"
      />
      <div class="flex flex-col gap-4">
        <ul
          ref="carousel"
          class="relative h-10 w-full overflow-hidden"
        >
          <transition
            enter-active-class="animate__animated animate__slideInRight animate__delay-500"
            leave-active-class="animate__animated animate__slideOutLeft animate__delay-300"
          >
            <li
              :key="currentBenefit.feat"
              class="benefit absolute text-center w-full text-super-dark whitespace-nowrap font-semibold bg-super-faded rounded-lg text-sm px-3 py-2"
            >
              <FA :icon="currentBenefit.iconClass" />
              <span
                class="ml-1"
                v-html="featureBenefits[currentBenefit.feat]"
              />
            </li>
          </transition>
        </ul>
        <div class="w-full flex justify-center h-max gap-1">
          <span
            v-for="(benefit, index) in filteredBenefits"
            :key="index"
            class="block rounded-50% h-2 w-2 cursor-pointer"
            :class="[carouselIndex === index ? 'bg-super' : 'border-1 border-dark-5']"
            @click.stop="switchCarousel(index)"
          />
        </div>
      </div>
    </div>
    <main class="p-4 rounded-lg bg-purple">
      <section v-if="!isOnboardingReferee">
        <h5>
          <i18n class="text-xs text-light-66%">
            Quizizz Referral Program
          </i18n>
        </h5>
        <div class="flex flex-col rounded-lg">
          <p class="text-light-3 text-xl font-bold md:text-3xl">
            <i18n>Get 30 days of free</i18n> <em class="text-super">{{ premiumPlanName }}</em>
            <i18n>worth</i18n> <em class="text-super">{{ prependDollar(superPricingMonthly) }}</em>
            <i18n>for every teacher you invite</i18n>
          </p>
          <i18n
            class="mt-2 text-xs text-light-66% md:text-sm"
            :injections="[premiumPlanName]"
          >
            You both earn free {$1} when they host an activity on Quizizz!
          </i18n>
        </div>
        <ReferralShareSheet class="my-4" />
      </section>
      <section
        v-else
        class="text-sm text-light-3"
      >
        <span v-html="refereeOnboardingHeaderLabel" />
        <ol class="mt-4 space-y-4">
          <li
            v-for="(step, index) in refereeSteps"
            :key="index"
            class="flex items-start gap-2"
          >
            <span class="flex-shrink-0 top-1 relative block bg-light-33% h-4 w-4 rounded-50%">
              <span class="relative block bg-light-3 h-2 w-2 left-0 right-0 m-auto top-1 rounded-50%" />
            </span>
            <div class="flex flex-col items-start">
              <i18n
                :injections="[index + 1]"
                class="font-bold"
              >
                Step {$1}
              </i18n>
              {{ step.text }}
            </div>
            <img
              class="flex-shrink-0 flex-grow w-60 rounded-lg"
              :src="step.image"
            />
          </li>
        </ol>
      </section>
    </main>
    <section
      v-if="!isOnboardingReferee"
      class="flex flex-col w-full gap-2"
    >
      <Button
        class="w-full  bg-super-10% text-super-dark text-sm"
        :title="superPricingLabel"
        size="sm"
        type="super-faded"
        @click.stop="onGoSuperClicked"
      />
      <div
        v-if="!isPremiumQuestionPublish"
        class="text-dark-4 text-xxs justify-center flex"
      >
        <i18n>billed annually</i18n>&nbsp;({{ prependDollar(annualPrice) }}&nbsp;<i18n>per year</i18n>)
      </div>
      <div
        v-if="isPremiumQuestionPublish"
        class="text-[#73747E] mt-2 text-center font-bold cursor-pointer text-sm"
        @click.stop="saveWithoutPremiumContent"
      >
        <i18n>Publish without these premium questions</i18n>
      </div>
    </section>
  </div>
</template>
<script>
import get from 'lodash/get';
import { mapGetters } from 'vuex';

import ProductsService from '~/services/apis/Products';
import { prependDollar } from '~/utils/Utilities';

const CAROUSEL_INTERVAL_MILLIS = 3000;

export default {
  props: {
    feat: {
      type: String,
      default: null,
    },

    options: {
      type: Object,
      default: () => { },
    },

    showBenefits: {
      type: Boolean,
      default: true,
    },

    isOnboardingReferee: {
      type: Boolean,
      default: false,
    },

    referrerName: {
      type: String,
      default: null,
    },

    openPricingPage: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['continueWithoutSuperQuestions', 'close', 'buySuper'],

  data() {
    return {
      coreBenefits: [
        {
          iconClass: 'fas fa-books',
          feat: this.$constants.FeatureTypes.PREMIUM_CONTENT,
        },
        {
          iconClass: 'fas fa-lock',
          feat: this.$constants.FeatureTypes.PRIVATE_CONTENT_QUIZ,
        },
        {
          iconClass: 'fas fa-redo',
          feat: this.$constants.FeatureTypes.REOPEN_GAMES,
        },
        {
          iconClass: 'fas fa-infinity',
          feat: this.$constants.FeatureTypes.ASYNC_GAME_UNLIMITED,
        },
        {
          iconClass: 'fas fa-ad',
          feat: this.$constants.FeatureTypes.ADS_FREE,
        },
      ],

      refereeSteps: [{
        image: 'https://cf.quizizz.com/referral/ref-onboard-1.png',
        text: this.$i18n('Search for a quiz from the Quizizz library'),
      }, {
        image: 'https://cf.quizizz.com/referral/ref-onboard-2.png',
        text: this.$i18n('Host the quiz with your students'),
      }],

      plan: null,
      allPlans: null,
      carouselInterval: null,
      carouselIndex: 0,
    };
  },

  computed: {
    ...mapGetters('root', ['serverData']),

    refereeOnboardingHeaderLabel() {
      return this.$i18n('Here\'s how you can claim your free <em class="text-super font-bold">{$1}</em>', [this.premiumPlanName]);
    },

    isPremiumQuestionPublish() {
      return this.$constants.FeatureTypes.SUPER_QUESTION_SAVE_MODAL === this.feat && this.options?.showContinueButton;
    },

    featureBenefits() {
      return {
        DEFAULT: this.$i18n('Get more out of Quizizz with <em class="text-super-dark font-bold">{$1}</em>', [this.premiumPlanName]),
        [this.$constants.FeatureTypes.PREMIUM_CONTENT]: this.$i18n('Get unlimited access to <em class="text-super-dark font-bold">{$1}</em> resources', [this.premiumPlanName]),
        [this.$constants.FeatureTypes.REOPEN_GAMES]: this.$i18n('Re-open expired assignments at any time'),
        [this.$constants.FeatureTypes.MATCH_QUESTION]: this.$i18n('Encourage critical thinking with Match & Reorder'),
        [this.$constants.FeatureTypes.REORDER_QUESTION]: this.$i18n('Encourage critical thinking with Match & Reorder'),
        [this.$constants.FeatureTypes.ADS_FREE]: this.$i18n('Remove ads for you and your students'),
        [this.$constants.FeatureTypes.PRIVATE_CONTENT_QUIZ]: this.$i18n('Make your quiz private with <em class="text-super-dark font-bold">{$1}</em>', [this.premiumPlanName]),
        [this.$constants.FeatureTypes.PRIVATE_CONTENT_PRESENTATION]: this.$i18n('Make your lesson private with <em class="text-super-dark font-bold">{$1}</em>', [this.premiumPlanName]),
        [this.$constants.FeatureTypes.EDIT_RUNNING_QUESTION]: this.$i18n('Make changes to questions in a running activity'),
        [this.$constants.FeatureTypes.ASYNC_GAME_UNLIMITED]: this.$i18n('Keep assignments open for as long as you like'),
        [this.$constants.FeatureTypes.AUDIO]: this.$i18n('Add video & audio in Lessons & Quizzes'),
        [this.$constants.FeatureTypes.VIDEO]: this.$i18n('Add video & audio in Lessons & Quizzes'),
        [this.$constants.FeatureTypes.QBANK]: this.$i18n('Promote mastery with adaptive quizzes'),
        [this.$constants.FeatureTypes.SHARE_REPORT]: this.$i18n('Share your reports'),
        [this.$constants.FeatureTypes.AUDIO_QUESTION]: this.$i18n('Encourage higher order thinking with audio & video responses'),
        [this.$constants.FeatureTypes.VIDEO_QUESTION]: this.$i18n('Encourage higher order thinking with audio & video responses'),
        [this.$constants.FeatureTypes.BULK_ADD_TELEPORT]: this.$i18n('Bulk add <em class="text-super-dark font-bold">{$1}</em> questions in your quizzes & lessons', [this.premiumPlanName]),
        [this.$constants.FeatureTypes.EDIT_PREMIUM_WEEK_QUIZ]: this.$i18n('Edit your quizzes and lessons from Premium Question Week'),
        [this.$constants.FeatureTypes.SUPER_QUESTION_SAVE_MODAL]: this.$i18n('Get unlimited access to premium question types'),
      };
    },

    showContextualBenefit() {
      return this.showBenefits && !this.isOnboardingReferee;
    },

    contextualBenefit() {
      return this.featureBenefits[this.feat] || this.featureBenefits.DEFAULT;
    },

    filteredBenefits() {
      return this.coreBenefits.filter((benefit) => this.featureBenefits[benefit.feat] !== this.contextualBenefit);
    },

    currentBenefit() {
      return this.filteredBenefits[this.carouselIndex];
    },

    premiumPlanName() {
      if (this.isCountryUSA) {
        return this.$i18n('INDIVIDUAL PLAN');
      }

      return this.$i18n('SUPER');
    },

    isCountryUSA() {
      return this.serverData?.requestCountry === 'US';
    },

    planPriceDollars() {
      return get(this.plan, 'amountLabel.dollor', '');
    },

    planPriceCents() {
      return get(this.plan, 'amountLabel.cents', '');
    },

    isOfferRunning() {
      return get(this.plan, 'discounted', null);
    },

    planPrice() {
      if (this.planPriceCents) {
        return this.planPriceDollars + this.planPriceCents / 100;
      }

      return this.planPriceDollars;
    },

    discountedPlanPrice() {
      if (this.discountedPlanPriceCents) {
        return this.discountedPlanPriceDollars + this.discountedPlanPriceCents / 100;
      }

      return this.discountedPlanPriceDollars;
    },

    annualPrice() {
      return this.isOfferRunning ? this.discountedPlanPrice : this.planPrice;
    },

    superPricingMonthly() {
      return this.isOfferRunning ? this.discountedPlanPrice / 12 : this.planPrice / 12;
    },

    superPricingLabel() {
      return this.isPremiumQuestionPublish
        ? this.$i18n('or buy it for ${$1}/year', [this.annualPrice])
        : this.$i18n('or buy it for ${$1}/month', [this.superPricingMonthly]); // i18n bug when interpolation value has $1 in it
    },
  },

  async created() {
    if (!this.allPlans || !this.plan) {
      const response = await ProductsService.fetchProducts();

      let plans; let
        plan;
      if (response) {
        plans = response.plans;
        plan = response.plan;
      }

      if (plan || (plans && plans.length)) {
        this.allPlans = plans;
        this.plan = plan || plans[0];
      }
    }
  },

  mounted() {
    this.startCarouselInterval();
  },

  beforeUnmount() {
    this.clearCarouselInterval();
  },

  methods: {
    prependDollar,

    saveWithoutPremiumContent() {
      this.$eventBus.$emit('continueWithoutSuperQuestions');
      this.$emit('close');
    },

    startCarouselInterval() {
      this.clearCarouselInterval();
      this.carouselInterval = setInterval(() => {
        const carouselRef = this.$refs.carousel;
        if (!carouselRef) {
          return;
        }
        const existingIndex = this.carouselIndex;
        const isLoop = existingIndex === this.filteredBenefits.length - 1;
        this.carouselIndex = !isLoop ? existingIndex + 1 : 0;
      }, CAROUSEL_INTERVAL_MILLIS);
    },

    clearCarouselInterval() {
      clearInterval(this.carouselInterval);
    },

    switchCarousel(index) {
      this.carouselIndex = index;
      this.startCarouselInterval();
    },

    onGoSuperClicked() {
      this.$emit('buySuper');
      if (!this.openPricingPage) {
        return;
      }

      if (this.options.openInNewTab) {
        if (this.options.feat) {
          const variantText = this.options.variant ? (`&variant=${this.options.variant}`) : '';
          window.open('/super-pricing' + `?feat=${this.options.feat}${variantText}`, '_blank');
        } else {
          window.open('/super-pricing', '_blank');
        }

        this.$emit('close');
        return;
      }

      if (this.options.feat) {
        const variantText = this.options.variant ? (`&variant=${this.options.variant}`) : '';
        location = (`/super-pricing?backto=${encodeURIComponent(window.location.pathname)}&feat=${this.options.feat}${variantText}`);
      } else {
        location = (`/super-pricing?backto=${encodeURIComponent(window.location.pathname)}`);
      }
    },
  },
};
</script>
