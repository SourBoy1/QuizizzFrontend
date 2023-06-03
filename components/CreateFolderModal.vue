<template>
  <Modal
    :icon="'far fa-user-group'"
    :title="addToFolderModalTitle"
    :subtitle="null"
    :button1="{
      title: $i18n('Cancel'),
      type: 'other',
    }"
    :button2="{
      title: $i18n('Create'),
      loading: loadingCreateFolder,
      disabled: isBtn2Disabled,
    }"
    :shouldCloseOnEscape="true"
    :shouldSubmitOnEnter="false"
    :dismissOnOverlayClick="true"
    :stickToBottom="!isDesktop"
    @button1-click="$emit('close')"
    @button2-click="handleCreateNewFolder"
    @close="$emit('close')"
  >
    <div class="my-2">
      <div
        class="folder-details-container h-64 my-2 overflow-auto px-1"
        :class="[isFirstFolderCreation ? 'h-75' : '']"
      >
        <div
          v-if="isFirstFolderCreation"
          class="w-full my-4"
        >
          <section class="border-1 bg-dark-10% border-dark-5% rounded mt-4 pr-4">
            <div class="flex justify-between items-center w-full">
              <div class="flex">
                <div class="flex flex-col justify-center p-4">
                  <span class="font-semibold text-xs">
                    <i18n>You don’t have any teams yet. Here’s your cue to create
                      your first team!</i18n>
                  </span>
                  <span class="text-dark-4 text-[11px]">
                    <i18n v-if="$user.isCorporate">You can now share and collaborate with instructors in
                      your organization using teams</i18n>
                    <i18n v-else>You can now share and collaborate with teachers in your
                      school using teams</i18n>
                  </span>
                </div>
                <div class="banner-image-container">
                  <img
                    class="banner-image"
                    src="https://cf.quizizz.com/image/sharedFolders-quizDetails-banner-3x.png"
                    alt="Team Banner Image"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
        <Input
          data-cy="content-name-input"
          required
          :label="$i18n('Enter team name')"
          :placeholder="$user.isCorporate
            ? $i18n('Product Training')
            : $i18n('eg. Grade 8 Maths')
          "
          :value="folderName"
          :errorMessage="folderNameError"
          :maxlength="50"
          autocomplete="off"
          :showCharLimit="true"
          @input="onFolderNameInputChange"
          @blur="onFolderNameInputBlur"
        />

        <div class="mt-3">
          <label>
            <span class="font-semibold text-xs mb-1 ml-1 text-dark-4">
              {{ emailsToCollectLabel }}
            </span>
          </label>
          <TagInput
            class="w-full"
            autocomplete="off"
            :isInFocus="isInputFocused"
            :errorOnValidationFail="$i18n('Enter a valid email')"
            :validator="collaboratorValidator"
            :placeholder="$i18n('Add people via email address')"
            :errorMessage="''"
            :delimiters="[' ', 'Enter', ',']"
            :searchDropdown="computedSearchDropdown"
            :disabled="!userListLoaded"
            :emitInvalidTag="false"
            :maxTagsAllowed="15"
            @invalidTag="handleInvalidEmail"
            @setTags="handleAddEmail"
            @inputFocus="isInputFocused = true"
            @inputBlur="isInputFocused = false"
          >
            <template #invalid-input-error="{ input }">
              <div
                class="
                  bg-light-3
                  h-fit
                  list
                  mt-2
                  p-6
                  rounded
                  scale-y-100
                  shadow-soft-high
                  transform
                  transition-transform
                  w-90
                  z-on-overlay
                  absolute
                "
              >
                <div class="flex flex-col items-center justify-center">
                  <div
                    class="
                      h-10
                      w-10
                      rounded-full
                      bg-dark-6
                      flex
                      justify-center
                      items-center
                    "
                  >
                    <FA
                      icon="far fa-info-circle"
                      class="text-dark-4"
                      :size="18"
                    />
                  </div>
                  <div class="text-dark-4 font-semibold text-xs mt-3 text-center">
                    <i18n
                      v-if="$user.isCorporate"
                      :injections="[input]"
                    >
                      {$1} does not belong to your organization. You can only add
                      collaborators from your organization to a team for now.
                    </i18n>
                    <i18n
                      v-else
                      :injections="[input]"
                    >
                      {$1} does not belong to your school. You can only add
                      teachers from your school to a team for now.
                    </i18n>
                  </div>
                </div>
              </div>
            </template>
          </TagInput>
        </div>
      </div>
    </div>
  </Modal>
</template>

<script>
import { mapGetters } from 'vuex';

import QuizService from '~/services/apis/QuizService';
import OrgService from '~/services/apis/OrganizationService';
import QfwOrganizationService from '~/services/apis/QfwOrganizationService';
import Constants from '~/config/Constants';

export default {
  props: {
    entityId: {
      type: String,
      default: null,
    },

    entityName: {
      type: String,
      default: null,
    },

    source: {
      type: String,
      default: 'unknown',
    },

    folderList: {
      type: Array,
      default: () => [],
    },

    isFirstFolderCreation: {
      type: Boolean,
      default: false,
    },
    loadingCreateFolder: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['close', 'error', 'create'],

  data() {
    return {
      loading: {},
      folderName: '',
      folderNameError: null,
      collaboratorEmailList: [],
      isInputFocused: false,
      emailsToCollectLabel: this.$i18n('Invite collaborators'),
      tagToUserMap: {},
      searchDropdown: {
        optionType: 'userInfoList',
        enabled: true,
        dropdownTags: [],
        openDirection: 'bottom',
      },

      userListLoaded: false,

      // disabled: false,
    };
  },

  computed: {
    ...mapGetters('root', ['isDesktop']),

    // catered
    addToFolderModalTitle() {
      return this.$i18n('Create a new team');
    },

    // catered for now
    isBtn2Disabled() {
      return !!this.folderNameError;
    },

    computedSearchDropdown() {
      return {
        ...this.searchDropdown,
        openDirection: this.isDesktop ? 'bottom' : 'top',
      };
    },

    collaboratorIdList() {
      return this.collaboratorEmailList.map(
        (emailId) => this.tagToUserMap[emailId]._id,
      );
    },
  },

  async created() {
    this.userListLoaded = false;
    if (this.$user.organizationIds?.[0]) {
      await this.fetchAndSetUsersToShareQuizWith();
    }
    this.userListLoaded = true;
  },

  methods: {
    collaboratorValidator(value) {
      if (!this.$stringUtils.emailValidator(value)) {
        this.$analytics.logEvent(
          this.$webEvents.SHARED_FOLDER_ADDED_INVALID_EMAIL,
          {
            email: value,
            reason: Constants.TeamsEmailValidationError.INVALID_SYNTAX,
          },
        );
        return false;
      }

      if (!this.tagToUserMap[value]) {
        this.$analytics.logEvent(
          this.$webEvents.SHARED_FOLDER_ADDED_INVALID_EMAIL,
          {
            email: value,
            reason: Constants.TeamsEmailValidationError.ORG_MISMATCH,
          },
        );
        return false;
      }

      return true;
    },

    handleAddEmail(tags) {
      this.collaboratorEmailList = tags;
    },

    handleInvalidEmail(isInvalid) { },

    onFolderNameInputChange(value) {
      this.folderName = value;

      if (this.folderNameError) {
        this.checkInputNameError();
      }
    },

    checkInputNameError() {
      if (this.folderName.length <= 3) {
        this.folderNameError = this.$i18n('Please enter a name longer than 3 characters');
      } else {
        this.folderNameError = null;
      }

      this.$emit('error', !!this.quizNameError);
    },

    onFolderNameInputBlur() {
      this.checkInputNameError();
    },

    handleCreateNewFolder() {
      if (this.loadingCreateFolder) {
        return;
      }
      this.checkInputNameError();
      if (!this.folderNameError) {
        this.$emit('create', this.folderName, this.collaboratorIdList);
      }
    },

    async fetchAndSetUsersToShareQuizWith() {
      let teachers = [];
      let success = null;

      if (this.$user.isCorporate) {
        const res = await QfwOrganizationService.fetchOrgInfo();
        success = true;
        teachers = res?.members || [];
      } else {
        const res = await OrgService.listTeachersInOrgV2(
          this.$user.organizationIds ?? [],
        );
        success = res.success;
        teachers = res.data?.teachers || [];
      }
      if (success) {
        this.searchDropdown.dropdownTags = [];

        for (let i = 0; i < teachers.length; i++) {
          const teacher = teachers[i];
          this.tagToUserMap[
            this.$user.isCorporate ? teacher.local.email : teacher.email
          ] = teacher;
          this.searchDropdown.dropdownTags.push({
            title: this.$user.isCorporate
              ? ''
              : `${teacher.firstName} ${teacher.lastName}`,
            value: this.$user.isCorporate ? teacher.local.email : teacher.email,
            _id: teacher._id,
          });
        }
      } else {
        this.searchDropdown.dropdownTags = [];
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.folder-details-container {
  scroll-behavior: smooth;
}

.banner-image-container {
  width: 140px;
  min-height: 73px;
  position: relative;

  .banner-image {
    position: absolute;
    left: 8px;
    bottom: -1px;
  }
}

.content-modal-height {
  height: 250px;

  &.first-folder {
    height: 300px;
  }
}
</style>
