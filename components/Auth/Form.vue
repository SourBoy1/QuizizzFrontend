<template>
  <div
    class="signup-form-container"
    data-cy="signup-section"
    :class="isModal ? '' : 'w-full md:w-fit mx-auto md:shadow-lg'"
  >
    <div
      v-if="stage === 'primary'"
      class="main"
    >
      <div
        v-if="!isDesktop"
        class="flex justify-between px-4 bg-light-2 items-center h-15"
      >
        <div
          v-if="stage === 'primary'"
          @click="getLogoRedirectionUrl()"
        >
          <img
            class="h-6"
            src="https://cf.quizizz.com/img/quizizz_logos/purple-brandmark-600x164.png"
            alt="quizizz brand logo"
            @click="$eventBus.$emit($constants.EventBus.AUTH_MODAL_HIDE)"
          />
        </div>
        <div
          v-else
          class="flex space-x-2 m-0 items-center text-lilac bg-lilac-10% w-fit rounded px-2 py-1 cursor-pointer h-fit"
          @click="resetStage"
        >
          <FA
            class="fa fa-chevron-left"
            :size="11"
          />
          <span class="text-xs font-semibold">Go back</span>
        </div>
        <div
          v-if="isLoginState"
          key="signupNudge"
          class="login-nudge font-semibold"
        >
          <i18n>Don't have an account?</i18n>
          <button
            class="login-button margin-login-nudge"
            type="button"
            @click="handleSignupRedirectionClick"
          >
            <i18n>Sign up</i18n>
          </button>
        </div>
        <div
          v-else
          key="loginNudge"
          class="login-nudge font-semibold"
        >
          <i18n>Already have an account?</i18n>
          <button
            class="login-button margin-login-nudge"
            type="button"
            @click="handleLoginRedirectionClick"
          >
            <i18n>Log in</i18n>
          </button>
        </div>
      </div>
      <div
        class="form"
        :class="isDesktop ? 'form-padding' : 'form-padding-mobile'"
      >
        <div
          v-if="!isDesktop"
          class="flex space-x-2 mb-4 items-center text-lilac bg-lilac-10% w-fit rounded px-2 py-1 cursor-pointer"
          @click="$eventBus.$emit($constants.EventBus.AUTH_MODAL_HIDE)"
        >
          <FA
            class="fa fa-chevron-left"
            :size="11"
          />
          <span class="text-xs font-semibold">
            <i18n>Go back</i18n>
          </span>
        </div>
        <div class="flex items-center justify-between w-full">
          <div class="header">
            <h1
              v-if="isLoginState"
              key="loginTitle"
              class="title"
            >
              <i18n>Log in to Quizizz</i18n>
            </h1>
            <h1
              v-else
              key="signupTitle"
              class="title"
            >
              <span v-if="title">
                {{ title }}
              </span>
              <span v-else>
                <i18n>Welcome to Quizizz</i18n>
              </span>
            </h1>
            <h2
              v-if="!isLoginState"
              class="subtitle"
            >
              <i18n>Create a free account in 2 steps</i18n>
            </h2>
          </div>
          <div />
        </div>
        <div
          v-if="primaryHierarchyList.length > 1"
          class="signup-buttons"
        >
          <button
            v-for="(item) in primaryHierarchyList"
            :key="item.signupName"
            class="button-option hoverBtnState border border-light-1 rounded"
            :data-cy="item.dataCy"
            @click="item.callbackFunction()"
          >
            <div class="flex items-center justify-between w-full md:justify-start">
              <img
                :src="item.image"
                :alt="item.alt"
                class="w-4 h-4 my-2 ml-4 mr-4 object-contain"
              />
              <span class="text-base font-semibold btn-label">
                {{ item.title }}
              </span>
              <div id="spacer" />
              <span
                v-if="isGoogleLoginInProcess"
                class="btn-loading-anim text-dark-4 ml-auto mr-4"
              >
                <i class="fas fa-spinner kr-anim-spin animate-spin text-dark" />
              </span>
              <span
                v-if="!isGoogleLoginInProcess"
                class="btn-loading-anim text-dark-5 ml-auto mr-4 font-normal hover:text-lilac"
              >
                <i class="far fa-arrow-right text-dark-5 font-normal hover:text-lilac" />
              </span>
            </div>
          </button>
          <div v-if="secondaryHierarchyList.length > 0">
            <span class="mt-4 text-dark-4 text-sm flex justify-center"><i18n>or continue with</i18n></span>
            <div class="flex flex-row justify-center mt-4 gap-4">
              <div
                v-for="(item) in secondaryHierarchyList"
                :key="item.signupName"
                class=""
              >
                <div
                  class="w-10 h-10 box-shadow-secondary-signup rounded-sm cursor-pointer"
                  @click="item.callbackFunction()"
                >
                  <img
                    :src="item.secondaryImage"
                    :alt="item.alt"
                    class="w-full h-full rounded-sm"
                    :style="{ background: item.secondaryBackground, padding: `${item.secondaryBackground === '#FFFFFF' ? '0px' : '8px'}` }"
                  />
                </div>
                <span class="capitalize text-dark-2 text-[10px] font-normal flex justify-center mt-1">{{ item.signupName }}</span>
              </div>
            </div>
          </div>
        </div>
        <div
          v-else
          class="signup-buttons"
        >
          <button
            class="button-option hoverBtnState border border-light-1 rounded"
            data-cy="continue-with-google"
            @click="handleGoogleSignup"
          >
            <div class="flex items-center justify-between w-full md:justify-start">
              <img
                src="https://cf.quizizz.com/img/logos/google-logo-1.png"
                alt="Google logo"
                class="w-4 h-4 my-2 ml-4 mr-4"
              />
              <span class="text-base font-semibold btn-label">
                <i18n>Continue with Google</i18n>
              </span>
              <div id="spacer" />
              <span
                v-if="isGoogleLoginInProcess"
                class="btn-loading-anim text-dark-4 ml-auto mr-4"
              >
                <i class="fas fa-spinner kr-anim-spin animate-spin text-dark" />
              </span>
              <span
                v-if="!isGoogleLoginInProcess"
                class="btn-loading-anim text-dark-5 ml-auto mr-4 font-normal hover:text-lilac"
              >
                <i class="far fa-arrow-right text-dark-5 font-normal hover:text-lilac" />
              </span>
            </div>
          </button>
          <button
            class="button-option hoverBtnState border border-light-1 rounded"
            data-cy="continue-with-microsoft"
            @click="handleMSSignup"
          >
            <div class="flex items-center justify-between w-full md:justify-start">
              <img
                src="https://cf.quizizz.com/img/logos/ms-logo.png"
                alt="Microsoft logo"
                class="w-4 h-4 my-2 ml-4 mr-4"
              />
              <span class="text-base font-semibold btn-label">
                <i18n>Continue with Microsoft</i18n>
              </span>
              <div id="spacer" />
              <span
                v-if="isMSLoginInProcess"
                class="btn-loading-anim text-dark-4 ml-auto mr-4"
              >
                <i class="fas fa-spinner kr-anim-spin animate-spin text-dark" />
              </span>
              <span
                v-if="!isMSLoginInProcess"
                class="btn-loading-anim text-dark-5 ml-auto mr-4 font-normal hover:text-lilac"
              >
                <i class="far fa-arrow-right text-dark-5 font-normal hover:text-lilac" />
              </span>
            </div>
          </button>
          <button
            v-if="!facebookDetailsMissing && !isGDPRCountry && !isCountryUS"
            class="button-option hoverBtnState border border-light-1 rounded"
            data-cy="continue-with-facebook"
            @click="handleFacebookSignup"
          >
            <div class="flex items-center justify-between w-full md:justify-start">
              <img
                src="https://cf.quizizz.com/image/facebook(1).png"
                alt="Microsoft logo"
                class="w-4 h-4 my-2 ml-4 mr-4"
              />
              <span class="text-base font-semibold btn-label">
                <i18n>Continue with Facebook</i18n>
              </span>
              <div id="spacer" />
              <span
                v-if="isFBLoginInProcess"
                class="btn-loading-anim text-dark-4 ml-auto mr-4"
              >
                <i class="fas fa-spinner kr-anim-spin animate-spin text-dark" />
              </span>
              <span
                v-if="!isFBLoginInProcess"
                class="btn-loading-anim text-dark-5 ml-auto mr-4 font-normal hover:text-lilac"
              >
                <i class="far fa-arrow-right text-dark-5 font-normal hover:text-lilac" />
              </span>
            </div>
          </button>
          <button
            class="email hoverBtnState shadow-sm"
            data-cy="continue-with-email"
            @click="setEmailStage"
          >
            <div class="flex items-center justify-between w-full md:justify-start">
              <FA
                :size="16"
                class="ml-4 mr-4 far fa-envelope y-2"
              />
              <span class="text-base font-semibold btn-label pt-[3px] pb-[3px]">
                <i18n>Continue with Email</i18n>
              </span>
              <div id="spacer" />
              <span class="btn-loading-anim text-dark-5 ml-auto mr-4 font-normal hover:text-lilac">
                <i class="far fa-arrow-right text-dark-5 font-normal hover:text-lilac" />
              </span>
            </div>
          </button>
          <!-- <button v-if="isNewMobileAuthFlow && isLoginState" key="loginPhone" class="email hoverBtnState shadow-sm" @click="setPhoneStage">
            <div class="flex items-center justify-between w-full md:justify-start">
              <FA :size="16" class="ml-5 mr-5 far fa-mobile y-2" />
              <span class="text-base font-semibold btn-label pt-[3px] pb-[3px]">
                <i18n>Log in via phone number</i18n>
              </span>
              <div id="spacer"></div>
              <span
                class="btn-loading-anim text-dark-5 ml-auto mr-4 font-normal hover:text-lilac"
              >
                <i class="far fa-arrow-right text-dark-5 font-normal hover:text-lilac" />
              </span>
            </div>
          </button>
          <button v-if="isNewMobileAuthFlow && !isLoginState" key="signupPhone" class="email hoverBtnState shadow-sm" @click="setPhoneStage">
            <div class="flex items-center justify-between w-full md:justify-start">
              <FA :size="16" class="ml-5 mr-5 far fa-mobile y-2" />
              <span class="text-base font-semibold btn-label pt-[3px] pb-[3px]">
                <i18n>Sign up via phone number</i18n>
              </span>
              <div id="spacer"></div>
              <span
                class="btn-loading-anim text-dark-5 ml-auto mr-4 font-normal hover:text-lilac"
              >
                <i class="far fa-arrow-right text-dark-5 font-normal hover:text-lilac" />
              </span>
            </div>
          </button> -->
          <template v-if="isNewMobileAuthFlow">
            <div
              v-if="isLoginState"
              key="loginPhone"
              class="flex justify-start w-full mt-4 ml-4"
            >
              <button
                class="flex items-center space-x-2 text-sm font-semibold text-lilac"
                data-cy="login-with-phone"
                @click="setPhoneStage"
              >
                <i18n>Log in via phone number</i18n>
                <FA
                  :size="12"
                  class="far fa-arrow-right"
                />
              </button>
            </div>
            <div
              v-else
              key="signupPhone"
              class="flex justify-start w-full mt-4 ml-4"
            >
              <button
                class="flex items-center space-x-2 text-sm font-semibold text-lilac"
                data-cy="signup-with-phone"
                @click="setPhoneStage"
              >
                <i18n>Sign up via phone number</i18n>
                <FA
                  :size="12"
                  class="far fa-arrow-right"
                />
              </button>
            </div>
          </template>
        </div>
      </div>
      <div
        v-if="!isLoginState && !showGDPRState"
        class="footer"
      >
        <div
          class="justify-center text-xs text-center text-dark-5 md:flex"
          :class="isDesktop ? 'px-10' : 'px-6'"
        >
          <i18n>By signing up, you agree to our</i18n>&nbsp;<a
            href="/tos"
            target="_blank"
            class="font-semibold underline"
            @click="tosClick"
          >
            <i18n>Terms of Service</i18n>
          </a>&nbsp; & &nbsp;<a
            href="/privacy"
            target="_blank"
            class="font-semibold underline"
            @click="privacyClick"
          >
            <i18n>Privacy Policy</i18n>
          </a>.
        </div>
      </div>
      <div
        v-if="!isLoginState && showGDPRState"
        class="footer"
      >
        <div
          class="flex mx-2 mb-2"
          :class="[isDesktop ? 'px-6' : 'px-4', animationOnToSError ? 'shake' : '']"
        >
          <Checkbox
            inputId="tos"
            :checked="isTosChecked"
            name="tos"
            :aria-label="$i18n('I have read and agree to the terms and conditions and privacy policy (Required)')"
            @change="handleTosChange"
          />
          <div
            class="text-xs cursor-pointer select-none"
            :class="termsAndConditionError ? 'text-red' : 'text-dark-5'"
          >
            <span @click="handleTosChange">
              <i18n>I have read and agree to the</i18n>
            </span>&nbsp;<a
              href="/tos"
              target="_blank"
              class="font-semibold underline"
              @click="tosClick"
            >
              <i18n>Terms of Service</i18n>
            </a> & <a
              href="/privacy"
              target="_blank"
              class="font-semibold underline"
              @click="privacyClick"
            >
              <i18n>Privacy Policy</i18n>
            </a>.
          </div>
        </div>
        <div
          class="flex mx-2"
          :class="isDesktop ? 'px-6' : 'px-4'"
        >
          <Checkbox
            inputId="comms"
            :checked="isCommsChecked"
            name="comms"
            :aria-label="$i18n('I want to receive product updates, offers and recommended content')"
            @change="handleCommsChange"
          />
          <div
            class="text-xs text-dark-5 cursor-pointer select-none"
            @click="handleCommsChange"
          >
            <i18n>I want to receive product updates, offers and recommended content</i18n>
          </div>
        </div>
      </div>
      <div
        v-if="isLoginState"
        key="signupNudge"
        class="mt-auto login-nudge"
      >
        <i18n>Don't have an account?</i18n>
        <button
          class="login-button margin-login-nudge"
          type="button"
          data-cy="signup-btn"
          @click="handleSignupRedirectionClick"
        >
          <i18n>Sign up</i18n>
        </button>
      </div>
      <div
        v-else-if="!isLoginState"
        key="loginNudge"
        class="login-nudge"
      >
        <i18n>Already have an account?</i18n>
        <button
          class="login-button margin-login-nudge"
          type="button"
          data-cy="login-btn"
          @click="handleLoginRedirectionClick"
        >
          <i18n>Log in</i18n>
        </button>
      </div>
    </div>
    <div
      v-if="stage === 'email'"
      class="h-full main"
    >
      <div
        v-if="alternateAccountType === 'google'"
        key="googleAccount"
        class="form"
        :class="isDesktop ? 'form-padding' : 'form-padding-mobile'"
      >
        <div
          v-if="isLoginState"
          class="flex items-center justify-between w-full mb-4"
        >
          <div class="header">
            <h1 class="title">
              <i18n>Log in to Quizizz</i18n>
            </h1>
            <h2
              key="accountExists"
              class="subtitle"
            >
              <i18n>You already have an account</i18n>
            </h2>
          </div>
          <div />
        </div>
        <div class="signup-buttons">
          <button
            class="button-option hoverBtnState border border-light-1 rounded"
            data-cy="continue-with-google"
            @click="handleGoogleSignup"
          >
            <div class="flex items-center justify-between w-full md:justify-start">
              <img
                src="https://cf.quizizz.com/img/logos/google-logo-1.png"
                alt="Google logo"
                class="w-4 h-4 mt-2 mb-2 ml-4"
              />
              <span class="ml-4 text-base font-semibold btn-label">
                <i18n>Continue with Google</i18n>
              </span>
              <span
                v-if="isGoogleLoginInProcess"
                class="text-center btn-loading-anim text-dark-4 ml-auto mr-4"
              >
                <i class="fas fa-spinner kr-anim-spin animate-spin text-dark" />
              </span>
              <span
                v-if="!isGoogleLoginInProcess"
                class="btn-loading-anim text-dark-5 ml-auto mr-4 font-normal hover:text-lilac my-auto"
              >
                <i class="far fa-arrow-right text-dark-5 font-normal hover:text-lilac" />
              </span>
            </div>
          </button>
          <div class="alternate-account-message">
            <i
              icon="fas fa-info-circle"
              :size="16"
              class="fas fa-info-circle text-dark-4 flex items-start mt-1 mr-2 text-base"
            />
            <div>
              <span class="warn-msg-text">{{ alternateAccountMsg }}</span>

              <span>or</span>
              <router-link
                :to="`/forgot-password?q=${encodeURIComponent($route.path)}`"
                class="underline text-lilac font-bold"
              >
                <i18n>set a password</i18n>
              </router-link>
              <span>
                <i18n>for your account</i18n>
              </span>
            </div>
          </div>
        </div>
      </div>
      <div
        v-else-if="alternateAccountType === 'microsoft'"
        key="microsoftAccount"
        class="form"
        :class="isDesktop ? 'form-padding' : 'form-padding-mobile'"
      >
        <div
          v-if="isLoginState"
          key="loginEmail"
          class="flex items-center justify-between w-full mb-4"
        >
          <div class="header">
            <h1 class="title">
              <i18n>Log in to Quizizz</i18n>
            </h1>
            <h2 class="subtitle">
              <i18n>You already have an account</i18n>
            </h2>
          </div>
          <div />
        </div>
        <div class="signup-buttons">
          <button
            class="button-option hoverBtnState border border-light-1 rounded"
            data-cy="continue-with-microsoft"
            @click="handleMSSignup"
          >
            <div class="flex items-center justify-startjustify-between w-full md:justify-start">
              <img
                src="https://cf.quizizz.com/img/logos/ms-logo.png"
                alt="Microsoft logo"
                class="w-4 h-4 mt-2 mb-2 ml-4"
              />
              <span class="ml-4 text-base font-semibold btn-label">
                <i18n>Continue with Microsoft</i18n>
              </span>
              <span
                v-if="isMSLoginInProcess"
                class="text-center btn-loading-anim text-dark-4 ml-auto mr-4"
              >
                <i class="fas fa-spinner kr-anim-spin animate-spin text-dark" />
              </span>
              <span
                v-if="!isMSLoginInProcess"
                class="btn-loading-anim text-dark-5 ml-auto mr-4 font-normal hover:text-lilac my-auto"
              >
                <i class="far fa-arrow-right text-dark-5 font-normal hover:text-lilac" />
              </span>
            </div>
          </button>
          <div class="alternate-account-message">
            <i
              icon="fas fa-info-circle"
              :size="16"
              class="fas fa-info-circle text-dark-4 flex items-start mt-1 mr-2 text-base"
            />
            <div>
              <span class="warn-msg-text">{{ alternateAccountMsg }}</span>

              <span>or</span>
              <router-link
                :to="`/forgot-password?q=${encodeURIComponent($route.path)}`"
                class="underline text-lilac font-bold"
              >
                <i18n>set a password</i18n>
              </router-link>
              <span>for your account</span>
            </div>
          </div>
        </div>
      </div>
      <div
        v-else-if="alternateAccountType === 'facebook'"
        key="facebookAccount"
        class="form"
        :class="isDesktop ? 'form-padding' : 'form-padding-mobile'"
      >
        <div
          v-if="isLoginState"
          class="flex items-center justify-between w-full mb-4"
        >
          <div class="header">
            <h1 class="title">
              <i18n>Log in to Quizizz</i18n>
            </h1>
            <h2
              key="accountExists"
              class="subtitle"
            >
              <i18n>You already have an account</i18n>
            </h2>
          </div>
          <div />
        </div>
        <div class="signup-buttons">
          <button
            class="button-option hoverBtnState border border-light-1 rounded"
            data-cy="continue-with-facebook"
            @click="handleFacebookSignup"
          >
            <div class="flex items-center justify-between w-full md:justify-start">
              <img
                src="https://cf.quizizz.com/image/facebook(1).png"
                alt="Google logo"
                class="w-4 h-4 mt-2 mb-2 ml-4"
              />
              <span class="ml-4 text-base font-semibold btn-label">
                <i18n>Continue with Facebook</i18n>
              </span>
              <span
                v-if="isFBLoginInProcess"
                class="text-center btn-loading-anim text-dark-4 ml-auto mr-4"
              >
                <i class="fas fa-spinner kr-anim-spin animate-spin text-dark" />
              </span>
              <span
                v-if="!isFBLoginInProcess"
                class="btn-loading-anim text-dark-5 ml-auto mr-4 font-normal hover:text-lilac my-auto"
              >
                <i class="far fa-arrow-right text-dark-5 font-normal hover:text-lilac" />
              </span>
            </div>
          </button>
          <div class="alternate-account-message">
            <i
              icon="fas fa-info-circle"
              :size="16"
              class="fas fa-info-circle text-dark-4 flex items-start mt-1 mr-2 text-base"
            />
            <div>
              <span class="warn-msg-text">{{ alternateAccountMsg }}</span>

              <span>or</span>
              <router-link
                :to="`/forgot-password?q=${encodeURIComponent($route.path)}`"
                class="underline text-lilac font-bold"
              >
                <i18n>set a password</i18n>
              </router-link>
              <span>
                <i18n>for your account</i18n>
              </span>
            </div>
          </div>
        </div>
      </div>
      <div
        v-else-if="alternateAccountType === 'apple'"
        key="appleAccount"
        class="form"
        :class="isDesktop ? 'form-padding' : 'form-padding-mobile'"
      >
        <div
          v-if="isLoginState"
          key="loginEmail"
          class="flex items-center justify-between w-full mb-4"
        >
          <div class="header">
            <h1 class="title">
              <i18n>Log in to Quizizz</i18n>
            </h1>
            <h2 class="subtitle">
              <i18n>You already have an account</i18n>
            </h2>
          </div>
          <div />
        </div>
        <div class="signup-buttons">
          <button
            class="button-option hoverBtnState border border-light-1 rounded"
            data-cy="continue-with-microsoft"
            @click="handleAppleSignup"
          >
            <div class="flex items-center justify-startjustify-between w-full md:justify-start">
              <img
                src="https://cf.quizizz.com/image/Shape%20(1).png"
                alt="Microsoft logo"
                class="w-4 h-4 mt-2 mb-2 ml-4"
              />
              <span class="ml-4 text-base font-semibold btn-label">
                <i18n>Continue with Apple</i18n>
              </span>
              <span
                v-if="isAppleLoginInProcess"
                class="text-center btn-loading-anim text-dark-4 ml-auto mr-4"
              >
                <i class="fas fa-spinner kr-anim-spin animate-spin text-dark" />
              </span>
              <span
                v-if="!isAppleLoginInProcess"
                class="btn-loading-anim text-dark-5 ml-auto mr-4 font-normal hover:text-lilac my-auto"
              >
                <i class="far fa-arrow-right text-dark-5 font-normal hover:text-lilac" />
              </span>
            </div>
          </button>
          <div class="alternate-account-message">
            <i
              icon="fas fa-info-circle"
              :size="16"
              class="fas fa-info-circle text-dark-4 flex items-start mt-1 mr-2 text-base"
            />
            <div>
              <span class="warn-msg-text">{{ alternateAccountMsg }}</span>

              <span>or</span>
              <router-link
                :to="`/forgot-password?q=${encodeURIComponent($route.path)}`"
                class="underline text-lilac font-bold"
              >
                <i18n>set a password</i18n>
              </router-link>
              <span>for your account</span>
            </div>
          </div>
        </div>
      </div>
      <form
        v-else
        key="emailAccount"
        @submit.prevent="(event) => handleSubmit(event, authParams)"
      >
        <div
          v-if="!isDesktop"
          class="flex justify-between px-4 bg-light-2 items-center h-15"
        >
          <div
            v-if="stage === 'primary'"
            @click="getLogoRedirectionUrl()"
          >
            <img
              class="h-8"
              src="https://cf.quizizz.com/img/quizizz_logos/purple-brandmark-600x164.png"
              alt="quizizz brand logo"
              @click="$eventBus.$emit($constants.EventBus.AUTH_MODAL_HIDE)"
            />
          </div>
          <div
            v-else
            class="flex space-x-2 m-0 items-center text-lilac bg-lilac-10% w-fit rounded px-2 py-1 cursor-pointer h-fit"
            @click="resetStage"
          >
            <FA
              class="fa fa-chevron-left"
              :size="11"
            />
            <span class="text-xs font-semibold">Go back</span>
          </div>
          <div
            v-if="isLoginState"
            key="signupNudge"
            class="login-nudge font-semibold"
          >
            <i18n>Don't have an account?</i18n>
            <button
              class="login-button margin-login-nudge"
              type="button"
              @click="handleSignupRedirectionClick"
            >
              <i18n>Sign up</i18n>
            </button>
          </div>
          <div
            v-else
            key="loginNudge"
            class="login-nudge font-semibold"
          >
            <i18n>Already have an account?</i18n>
            <button
              class="login-button margin-login-nudge"
              type="button"
              @click="handleLoginRedirectionClick"
            >
              <i18n>Log in</i18n>
            </button>
          </div>
        </div>
        <div
          class="form"
          :class="isDesktop ? 'form-padding' : 'form-padding-mobile'"
        >
          <div
            v-if="isDesktop"
            class="flex space-x-2 mb-4 items-center text-lilac bg-lilac-10% w-fit rounded px-2 py-1 cursor-pointer"
            @click="resetStage"
          >
            <FA
              class="fa fa-chevron-left"
              :size="11"
            />
            <span class="text-xs font-semibold">
              <i18n>Go back</i18n>
            </span>
          </div>
          <div
            v-if="isLoginState"
            key="loginEmail"
            class="flex items-center justify-between w-full mb-4"
          >
            <div
              v-if="!isLoginEmail"
              class="header"
            >
              <h1 class="title">
                <i18n>Continue with email</i18n>
              </h1>
              <h2
                v-if="accountExists"
                key="accountExists"
                class="subtitle"
              >
                <i18n>You already have an account</i18n>
              </h2>
            </div>
            <div
              v-if="isLoginEmail"
              class="header"
            >
              <h1 class="title">
                <i18n>Log in to Quizizz</i18n>
              </h1>
              <h2
                key="accountExists"
                class="subtitle"
              >
                <i18n>You already have an account</i18n>
              </h2>
            </div>
            <div />
          </div>
          <div
            v-else
            class="flex items-center justify-between w-full mb-4"
          >
            <h1 class="text-lg font-semibold md:text-xl text-dark-2">
              <i18n>Continue with email</i18n>
            </h1>
            <div />
          </div>
          <div
            v-if="isLoginState"
            key="loginForm"
          >
            <Input
              ref="authNameField"
              v-model="username"
              :label="$i18n('Enter email address or username')"
              class="mb-3 text-sm rounded text-dark-4"
              licon="far fa-envelope text-dark-3"
              :placeholder="$i18n('Start typing...')"
              :ticon="getAuthIcon"
              inputType="text"
              data-cy="email-input-field"
              :disabled="!isEmailModifiable"
            />
            <Input
              ref="authPassField"
              v-model="password"
              :label="$i18n('Password')"
              class="mb-3"
              licon="fas fa-asterisk"
              ticonWrapperClasses="right-6"
              placeholder="******"
              inputType="password"
              data-cy="password-field"
            />
            <div
              v-if="err"
              class="error-msg-wrapper rounded font-semibold text-red text-xs mt-3 pb-2.5 pr-4"
              data-cy="error-msg-wrapper"
            >
              {{ errMessage }}
              <div
                v-if="isUserNotFound"
                class="inline-block"
              >
                &nbsp;-&nbsp;<a
                  class="underline cursor-pointer text-blue"
                  @click="handleSignup"
                >
                  <i18n>Create an account</i18n>
                </a>
              </div>
            </div>
            <router-link
              class="forgot-pass-link hover:underline"
              :to="`/forgot-password?q=${encodeURIComponent($route.path)}`"
              data-cy="forgot-pass-link"
            >
              <span class="text-xs font-semibold text-lilac">
                <i18n>Forgot password?</i18n>
              </span>
            </router-link>
          </div>
          <Input
            v-else
            id="email"
            key="signupForm"
            v-model="email"
            :label="$i18n('Enter email address')"
            licon="far fa-envelope"
            :errorMessage="emailErrorMessage"
            placeholder="name@example.com"
            :ringInset="true"
            inputType="email"
            data-cy="email-input-field"
            :ticon="getEmailIcon"
            :disabled="!isEmailModifiable"
          />
          <Button
            v-if="isLoginState"
            :title="$i18n('Continue')"
            class="mt-4 continue-button"
            :loading="isLoginInProgress"
            :disabled="disabledLogin"
            data-cy="login-button"
            @click.prevent="(event) => handleSubmit(event, authParams)"
          />
          <button
            v-else
            key="signupButton"
            :disabled="disabled || isEmailCheckInProgress"
            class="mt-4 continue-button"
            type="submit"
            data-cy="signup-button"
          >
            <div class="flex items-center justify-start">
              <span class="ml-3 text-base font-semibold btn-label">
                <i18n>Continue</i18n>
              </span>
            </div>
          </button>
        </div>
      </form>
      <div
        v-if="isLoginState"
        key="signupNudge"
        class="mt-auto login-nudge"
      >
        <i18n>Don't have an account?</i18n>
        <button
          class="login-button margin-login-nudge"
          type="button"
          @click="handleSignupRedirectionClick"
        >
          <i18n>Sign up</i18n>
        </button>
      </div>
      <div
        v-else-if="!isLoginState"
        key="loginNudge"
        class="mt-auto login-nudge"
      >
        <i18n>Already have an account?</i18n>
        <button
          class="login-button margin-login-nudge"
          type="button"
          @click="handleLoginRedirectionClick"
        >
          <i18n>Log in</i18n>
        </button>
      </div>
    </div>
    <div
      v-if="stage === 'phone'"
      class="h-full main"
    >
      <div
        v-if="!isDesktop"
        class="flex justify-between px-4 bg-light-2 items-center h-15"
      >
        <div
          v-if="stage === 'primary'"
          @click="getLogoRedirectionUrl()"
        >
          <img
            class="h-8"
            src="https://cf.quizizz.com/img/quizizz_logos/purple-brandmark-600x164.png"
            alt="quizizz brand logo"
            @click="$eventBus.$emit($constants.EventBus.AUTH_MODAL_HIDE)"
          />
        </div>
        <div
          v-else
          class="flex space-x-2 m-0 items-center text-lilac bg-lilac-10% w-fit rounded px-2 py-1 cursor-pointer h-fit"
          @click="resetStage"
        >
          <FA
            class="fa fa-chevron-left"
            :size="11"
          />
          <span class="text-xs font-semibold">Go back</span>
        </div>
        <div
          v-if="isLoginState"
          key="signupNudge"
          class="login-nudge font-semibold"
        >
          <i18n>Don't have an account?</i18n>
          <button
            class="login-button margin-login-nudge"
            type="button"
            @click="handleSignupRedirectionClick"
          >
            <i18n>Sign up</i18n>
          </button>
        </div>
        <div
          v-else
          key="loginNudge"
          class="login-nudge font-semibold"
        >
          <i18n>Already have an account?</i18n>
          <button
            class="login-button margin-login-nudge"
            type="button"
            @click="handleLoginRedirectionClick"
          >
            <i18n>Log in</i18n>
          </button>
        </div>
      </div>
      <form
        class="form"
        :class="isDesktop ? 'form-padding' : 'form-padding-mobile'"
        @submit.prevent="(event) => handleSubmit(event, authParams)"
      >
        <div
          v-if="isDesktop"
          class="flex space-x-2 mb-4 items-center text-lilac bg-lilac-10% w-fit rounded px-2 py-1 cursor-pointer"
          @click="resetStage"
        >
          <FA
            class="fa fa-chevron-left"
            :size="11"
          />
          <span class="text-xs font-semibold">Go back</span>
        </div>
        <div class="flex items-center justify-between w-full mb-4">
          <h1
            v-if="isLoginState"
            class="text-lg font-semibold md:text-xl text-dark-2"
          >
            Log in via phone number
          </h1>
          <h1
            v-else
            class="text-lg font-semibold md:text-xl text-dark-2"
          >
            Sign up via phone number
          </h1>
          <div />
        </div>

        <div
          v-if="isLoginState"
          key="phoneNumberLoginForm"
        >
          <div class="relative flex items-center">
            <Input
              ref="authNameField"
              v-model="username"
              licon="fal fa-mobile"
              liconClasses="text-dark-3"
              :label="$i18n('Enter phone number')"
              class="mb-3"
              :placeholder="$i18n('000 000 0000')"
              :ticon="getPhoneNumberIcon"
              inputClasses="pl-9"
              :ringInset="true"
              inputType="tel"
            />
          </div>
          <Input
            ref="authPassField"
            v-model="password"
            :label="$i18n('Password')"
            class="mb-3"
            licon="fas fa-asterisk text-base"
            placeholder="******"
            inputType="password"
            data-cy="password-field"
          />
          <div
            v-if="err"
            class="error-msg-wrapper rounded font-semibold text-red text-xs mt-3 pb-2.5 pr-4"
            data-cy="error-msg-wrapper"
          >
            {{ errMessage }}
            <div
              v-if="isUserNotFound"
              class="inline-block"
            >
              &nbsp;-&nbsp;<a
                class="underline cursor-pointer text-blue"
                @click="handleSignup"
              >
                <i18n>Create an account</i18n>
              </a>
            </div>
          </div>
          <router-link
            class="forgot-pass-link hover:underline"
            :to="`/forgot-password?q=${encodeURIComponent($route.path)}`"
            data-cy="forgot-pass-link"
          >
            <span class="text-xs font-semibold text-lilac">
              <i18n>Forgot password?</i18n>
            </span>
          </router-link>
        </div>

        <div
          v-else
          key="phoneNumberSignupForm"
          class="relative flex items-center"
        >
          <Input
            v-model="phoneNumber"
            inputType="number"
            licon="fal fa-mobile"
            liconClasses="text-dark-3"
            :label="$i18n('Enter phone number')"
            :placeholder="$i18n('000 000 0000')"
            :errorMessage="phoneNumberErrorMessage"
            :ticon="getPhoneNumberIcon"
            inputClasses="pl-9"
            :ringInset="true"
          />
        </div>
        <button
          v-if="isLoginState"
          key="phoneNumberLoginButton"
          :disabled="disabledLogin"
          class="mt-4 continue-button"
          type="submit"
        >
          <div class="flex items-center justify-start">
            <span class="ml-3 text-base font-semibold btn-label">
              <i18n>Continue</i18n>
            </span>

            <span
              v-if="isLoginInProgress"
              class="flex items-center justify-center w-4 h-4 m-auto loading-icon animate-spin"
            >
              <FA
                icon="far fa-sync text-light-3"
                :size="iconSize"
              />
            </span>
          </div>
        </button>
        <button
          v-else
          key="phoneNumberSignupButton"
          :disabled="disabled || isPhoneNumberCheckInProgress"
          class="mt-4 continue-button"
          type="submit"
        >
          <div class="flex items-center justify-start">
            <span class="ml-3 text-base font-semibold btn-label">
              <i18n>Continue</i18n>
            </span>
          </div>
        </button>
      </form>
      <div
        v-if="isLoginState"
        key="signupNudge"
        class="mt-auto login-nudge"
      >
        <i18n>Don't have an account?</i18n>
        <button
          class="login-button margin-login-nudge"
          type="button"
          @click="handleSignupRedirectionClick"
        >
          <i18n>Sign up</i18n>
        </button>
      </div>
      <div
        v-else-if="!isLoginState"
        key="loginNudge"
        class="mt-auto login-nudge"
      >
        <i18n>Already have an account?</i18n>
        <button
          class="login-button margin-login-nudge"
          type="button"
          @click="handleLoginRedirectionClick"
        >
          <i18n>Log in</i18n>
        </button>
      </div>
    </div>
    <div
      class="testimonial"
      :style="{ 'background-image': `url(${signUpImage})` }"
    >
      <div>
        <div class="testimonial-written p-4">
          <div class="flex flex-col">
            <div
              v-if="testimonialOne"
              class="testimonial-quote1"
            >
              {{ testimonialOne }} &nbsp;😍
            </div>
            <div
              v-if="testimonialTwo"
              class="testimonial-quote2"
            >
              {{ testimonialTwo }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex';

import SessionStorage from '~/services/SessionStorage';
import { SignUpOptionsHierarchy } from '~/utils/Utilities';

import AuthMixin from '~/mixins/AuthMixin';

export default {

  mixins: [AuthMixin],

  props: {
    preFillAuthId: {
      type: String,
      default: '',
    },
    isModal: {
      type: Boolean,
      default: false,
    },
    isLogin: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: '',
    },
    authParams: {
      type: Object,
      default: null,
    },
  },
  emits: ['changeAuthType'],

  data() {
    return {
      redirectLogoPath: true,
      facebookDetailsMissing: false,
      testimonialOne: this.$i18n('Teachers love us'),
      testimonialTwo: this.$i18n('Join over 200 million educators and learners on Quizizz'),
      signUpOptionsDetails: {
        google: {
          signupName: 'google',
          dataCy: 'continue-with-google',
          callbackFunction: () => this.handleGoogleSignup(),
          title: this.$i18n('Continue with Google'),
          image: 'https://cf.quizizz.com/img/logos/google-logo-1.png',
          alt: 'Google logo',
          secondaryBackground: '#FFFFFF',
          secondaryImage: 'https://cf.quizizz.com/img/logos/google-logo-1.png',
        },

        classlink: {
          signupName: 'classlink',
          dataCy: 'continue-with-classlink',
          callbackFunction: () => this.handleClasslinkSignup(),
          title: this.$i18n('Continue with Classlink'),
          image: 'https://cf.quizizz.com/img/logos/classlink-logo.png',
          alt: 'Classlink logo',
          secondaryBackground: '#FFFFFF',
          secondaryImage: 'https://cf.quizizz.com/img/logos/classlink-logo.png',
        },

        microsoft: {
          signupName: 'microsoft',
          dataCy: 'continue-with-microsoft',
          callbackFunction: () => this.handleMSSignup(),
          title: this.$i18n('Continue with Microsoft'),
          image: 'https://cf.quizizz.com/img/logos/ms-logo.png',
          alt: 'Microsoft logo',
          secondaryBackground: '#FFFFFF',
          secondaryImage: 'https://cf.quizizz.com/image/Microsoft.png',
        },

        facebook: {
          signupName: 'facebook',
          dataCy: 'continue-with-facebook',
          callbackFunction: () => this.handleFacebookSignup(),
          title: this.$i18n('Continue with Facebook'),
          image: 'https://cf.quizizz.com/image/facebook(1).png',
          alt: 'Facebook logo',
          secondaryBackground: '#3D6AD6',
          secondaryImage: 'https://cf.quizizz.com/image/Facebook.png',
        },

        email: {
          signupName: 'email',
          dataCy: 'continue-with-email',
          callbackFunction: () => this.setEmailStage(),
          title: this.$i18n('Continue with Email'),
          image: 'https://cf.quizizz.com/image/envelope-regular.png',
          alt: 'email logo',
          secondaryBackground: '#FFFFFF',
          secondaryImage: 'https://cf.quizizz.com/image/Email.png',
        },

        phone: {
          signupName: 'phone',
          dataCy: 'continue-with-phone',
          callbackFunction: () => this.setPhoneStage(),
          title: this.$i18n('Continue with phone number'),
          image: 'https://cf.quizizz.com/image/icon%20(1).png',
          alt: 'phone logo',
          secondaryBackground: '#FFFFFF',
          secondaryImage: 'https://cf.quizizz.com/image/Phone.png',
        },

        apple: {
          signupName: 'apple',
          dataCy: 'continue-with-apple',
          callbackFunction: () => this.handleAppleSignup(),
          title: this.$i18n('Continue with Apple'),
          image: 'https://cf.quizizz.com/image/Shape%20(1)%20(1).png',
          alt: 'apple logo',
          secondaryBackground: ' #222222',
          secondaryImage: 'https://cf.quizizz.com/image/Apple.png',
        },
      },

      primaryHierarchyList: [],
      secondaryHierarchyList: [],
    };
  },

  computed: {
    ...mapGetters('root', ['isDesktop', 'serverData', 'isNewMobileAuthFlow']),
  },

  watch: {
    '$route.path': {
      handler(to) {
        const regexLogin = /^\/login/s;
        const regexSignup = /^\/signup/s;

        const data = SessionStorage.getItem('showFacebookButton');

        if (data !== null) {
          this.facebookDetailsMissing = true;
        }

        if (!this.$user.isLoggedIn && regexLogin.test(to)) {
          this.redirectLogoPath = false;
        } else if (!this.$user.isLoggedIn && regexSignup.test(to)) {
          if (this?.$route?.query && this.$route.query.redirectionSource === 'facebookDetailsMissing') {
            SessionStorage.setItem('showFacebookButton', true);
          }
          this.redirectLogoPath = false;
        } else {
          this.redirectLogoPath = true;
        }
      },

      immediate: true,
    },
  },

  beforeMount() {
    this.checkSessionStorageForFacebookMissingDetails();
    this.setHierarchyList();
    const { inviteeEmail } = this.$route.query;
    if (inviteeEmail) {
      this.email = inviteeEmail;
      this.isEmailModifiable = false;
    }
  },

  methods: {
    handleSignupRedirectionClick() {
      this.resetStage();
      if (!this.isModal) {
        this.$router.push({ path: '/signup', query: { ctaSource: 'signup', fromPage: this.$route.name, ...this.$route.query } });
      } else {
        this.$emit('changeAuthType', 'signup');
        this.$router.push({
          name: this.$router.name,
          query: {
            ...this.$route.query,
            ctaSource: 'signup-modal-button',
            fromPage: this.$route.name,
          },
        });
      }
    },

    handleLoginRedirectionClick() {
      this.resetStage();
      if (!this.isModal) {
        this.$router.push('/login');
      } else {
        this.$emit('changeAuthType', 'login');
      }
    },

    getLogoRedirectionUrl() {
      this.$router.push('/admin');
    },

    checkSessionStorageForFacebookMissingDetails() {
      const data = SessionStorage.getItem('showFacebookButton');

      if (data !== null) {
        if (!this.facebookDetailsMissing) {
          this.$toasts.add({
            type: this.$constants.ToastTypes.ERROR,
            icon: 'fas fa-times-circle',
            title: this.$i18n('Unable to Signup via Facebook.'),
          });
          setTimeout(() => {
            this.$toasts.add({
              type: this.$constants.ToastTypes.ERROR,
              icon: 'fas fa-times-circle',
              title: this.$i18n('Email either not associated or missing from facebook profile'),
            });
          }, 300);
        }
        this.facebookDetailsMissing = true;
      }
    },

    setHierarchyList() {
      // getting data from utils
      const priorityList = SignUpOptionsHierarchy(this.serverData.requestCountry);
      const hierarchyList = [];

      // filling the array in order with all the signup details
      priorityList.forEach((el, key) => {
        let signupDetails = this.signUpOptionsDetails?.[el] || null;

        // filtering all signup options according to the geography
        if ((this.facebookDetailsMissing || this.isGDPRCountry || this.isCountryUS) && el === 'facebook') {
          signupDetails = null;
        }
        if (!this.isNewMobileAuthFlow && el === 'phone') {
          signupDetails = null;
        }

        // adding details if that signup option is allowed in that country
        if (signupDetails) {
          hierarchyList.push(signupDetails);
        }
      });

      // dividing the signup array in two parts if signup options are more than 4 ( primary and secondary )
      if (hierarchyList.length > 4) {
        hierarchyList.forEach((el, key) => {
          if (key < 3) {
            this.primaryHierarchyList.push(el);
          } else {
            this.secondaryHierarchyList.push(el);
          }
        });
      } else {
        this.primaryHierarchyList = hierarchyList;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.signup-form-container {
    @apply h-full md:h-144 bg-light-3 rounded-lg flex;
  transition: all 0.3s ease;
  .main {
      @apply flex flex-col w-screen md:w-120;
    // height: calc(100vh - 120px);
    height: 100vh;
    @media screen and (min-width: 1025px) {
      height: auto;
    }
    .description {
        @apply hidden md:block bg-light-2 text-purple text-xs text-center py-3 rounded-t-lg;
    }
    .form {
        @apply p-4 md:p-6;
      .header {
        .title {
            @apply text-lg md:text-xl text-dark-2 font-semibold;
        }
        .subtitle {
            @apply text-sm md:text-base text-dark-4;
        }
      }
      .continue-button {
            @apply text-sm md:text-base bg-lilac text-light-3 rounded w-full flex justify-center py-2 h-10;
        &:disabled {
          @apply bg-lilac-faded cursor-not-allowed;
        }
      }
      .signup-buttons {
        @apply flex flex-col space-y-3 mt-4;

        .alternate-account-message {
          @apply px-4 py-4 mt-16 text-sm border rounded text-dark-3 border-dark-6 flex;
        }
        .button-option {
            @apply text-sm md:text-base rounded w-full flex justify-center py-2 shadow-sm;
        }
        .email {
            @apply border border-light-1 rounded text-sm md:text-base bg-light-3 text-dark-3 w-full flex justify-center py-2;
        }
      }
    }
    .footer {
      @apply mt-auto text-center text-dark-5 text-xs mb-4;
    }
    .login-nudge {
        @apply  bg-light-2 text-dark-2 py-4 flex items-center justify-center space-x-1 text-xs rounded-b-lg;
      .login-button {
        @apply bg-lilac-faded rounded px-3 py-1 text-lilac text-xs font-semibold;
      }
    }
  }
  .testimonial {
      @apply hidden md:flex w-75 h-full rounded-r-lg items-end;
    // background-image: url('https://cf.quizizz.com/image/classroom-enjoyment.png');
    .testimonial-written {
      @apply w-full bottom-0 bg-dark-80% flex items-center backdrop-blur-sm;
      .testimonial-quote1 {
        @apply justify-start pb-2 text-sm font-semibold text-light-3;
      }
      .testimonial-quote2 {
        @apply justify-start pt-0 text-sm font-semibold text-light-80%;
      }
    }
  }

}
.form-padding {
  padding: 40px !important;
}

.form-padding-mobile {
  padding: 32px 24px !important;
}

.hoverBtnState:hover {
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1) !important;
    & > div > span > i {
    color: #8854C0 !important;
  }
}

.margin-login-nudge {
  margin-left: 8px !important;
}

.shake {
  animation: shake 0.82s cubic-bezier(.36,.07,.19,.97) both;
  transform: translate3d(0, 0, 0);
}
@keyframes shake {
  10%, 90% {
    transform: translate3d(-1px, 0, 0);
  }
  20%, 80% {
    transform: translate3d(2px, 0, 0);
  }
  30%, 50%, 70% {
    transform: translate3d(-4px, 0, 0);
  }
  40%, 60% {
    transform: translate3d(4px, 0, 0);
  }
}

.box-shadow-secondary-signup {
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.084), 0px 1px 1px rgba(0, 0, 0, 0.168);
}
</style>
