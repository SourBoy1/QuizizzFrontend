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
      title: $i18n('Add'),
      loading: loadingAddEntity,
      disabled: isBtn2Disabled,
    }"
    :shouldCloseOnEscape="true"
    :shouldSubmitOnEnter="false"
    :dismissOnOverlayClick="true"
    :stickToBottom="!isDesktop"
    @button1-click="$emit('close')"
    @button2-click="handleAddToFolders()"
    @close="$emit('close')"
  >
    <section
      v-if="shouldShowLimitExceedBanner"
      class="bg-violet-faded rounded mt-4"
    >
      <div class="flex w-full">
        <div class="flex flex-col pl-3 pr-1 pt-4">
          <FA class="fas fa-exclamation-triangle text-violet-light" />
        </div>
        <div class="flex flex-col justify-center pl-2 pr-4 py-4">
          <span class="font-semibold text-dark-2 text-xs">
            <i18n>{{ quizCountsExceedsBannerTitle }}</i18n>
          </span>
          <div class="text-dark-4 text-[11px]">
            <i18n>
              Use teams to their fullest. Add more than 5 quizzes/lessons to a team with the Schools and Districts
              plan.
            </i18n>
            <span
              class="text-violet font-semibold cursor-pointer"
              @click="handleLearnMore"
            >
              <i18n>Learn More</i18n>
            </span>
          </div>
        </div>
      </div>
    </section>
    <div class="my-2">
      <div
        v-if="loadingFolders"
        class="w-full flex justify-center my-8"
      >
        <Loader :size="18" />
      </div>
      <div
        v-else
        class="folders-container content-modal-height my-2 overflow-auto "
      >
        <button
          v-for="folder in folderList"
          :id="`folder${folder._id}`"
          :key="folder._id"
          :aria-label="$i18n('Save quiz to {$1} team', [folder.name])"
          class="flex items-center py-2 px-1 hover:bg-dark-6 w-full even:bg-light-2"
          @click.stop.prevent="handleFolderSelection(folder._id, folder.name)"
        >
          <Checkbox
            size="md"
            checkBgColor="lilac"
            :disabled="isEntityAlreadyInFolder(folder._id)"
            :name="folder._id"
            :checked="isEntityAlreadyInFolder(folder._id) || isFolderSelected(folder._id)"
            :aria-label="$i18n('{$1} team', [folder.name])"
          />
          <div class="text-sm font-semibold mx-1 max-w-full truncate">
            {{ folder.name }}
          </div>
        </button>
      </div>
      <div
        v-if="folderList.length > 0"
        class="w-full h-0.5 my-6 bg-dark-6"
      />

      <Button
        id="create-new-folder"
        key="create-new-folder"
        type="link"
        :aria-label="$i18n('Create a new team')"
        class="flex items-center py-2 px-1"
        ticon="far fa-chevron-right"
        :title="$i18n('Create a new team')"
        @click.stop.prevent="handleCreateNewFolder()"
      />
    </div>
    <SfUpsellModal
      v-if="showSfUpsellModal"
      @close="toggleUpsell"
    />
  </Modal>
</template>

<script>
import { mapGetters } from 'vuex';

import { OpenSnDPlansPage } from '~/utils/Redirection';
import { shouldShowSharedFolderUpsells } from '~/utils/ExperimentUtils';
import { getAccountType } from '~/utils/UserUtils';

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
    loadingAddEntity: {
      type: Boolean,
      default: false,
    },
    folderMap: {
      type: Object,
      default: () => ({}),
    },

    loadingFolders: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['close', 'createNew', 'add'],

  data() {
    return {
      selectedFolderMap: {},
      tagsForEntity: [],
      errorMessage: '',
      showSfUpsellModal: false,
      loading: {},
    };
  },

  computed: {
    ...mapGetters('root', ['isDesktop']),

    folderList() {
      return Object.values(this.folderMap);
    },

    addToFolderModalTitle() {
      return this.$i18n('Share {$1} {$2}', [this.entityName, this.$user.isCorporate ? 'to a folder' : 'with a Team']);
    },

    isBasicUser() {
      return getAccountType(this.$user) === this.$constants.AccountTypes.BASIC;
    },

    isSuperUser() {
      return getAccountType(this.$user) === this.$constants.AccountTypes.SUPER;
    },

    isBtn2Disabled() {
      return this.selectedFolderIds.length === 0 || this.loadingFolders || this.shouldShowLimitExceedBanner;
    },

    selectedFolderIds() {
      return Object.entries(this.selectedFolderMap).filter(([_key, value]) => value).map(([key, _value]) => (key));
    },

    numOfSelectedFoldersWithLimitExceed() {
      return this.folderList.filter((folder) => this.isFolderSelected(folder._id) && folder.contentMetrics.sharedQuizzes > 4).length;
    },

    quizCountsExceedsBannerTitle() {
      return `${this.numOfSelectedFoldersWithLimitExceed === 1 ? this.$i18n('This team has reached its content limit.') : this.$i18n('Some teams have reached their limit.')}`;
    },

    shouldShowLimitExceedBanner() {
      return shouldShowSharedFolderUpsells() && this.numOfSelectedFoldersWithLimitExceed > 0;
    },

  },

  created() {

  },

  methods: {

    handleLearnMore() {
      this.$analytics.logEvent(this.$webEvents.SHARED_FOLDER_CLICKED_LEARN_MORE);
      OpenSnDPlansPage('sharedFolder');
    },

    isFolderSelected(folderId) {
      return !!this.selectedFolderMap[folderId];
    },

    isEntityAlreadyInFolder(folderId) {
      const folder = this.folderList.find((folder) => folderId === folder._id);
      return !!folder.permsForQuizzes[this.entityId].length;
    },

    handleFolderSelection(folderId) {
      if (this.isEntityAlreadyInFolder(folderId)) {
        return;
      }

      this.selectedFolderMap = {
        ...this.selectedFolderMap,
        [folderId]: !this.selectedFolderMap[folderId],
      };

      if (this.shouldShowLimitExceedBanner) {
        this.$analytics.logEvent(this.$webEvents.SHARED_FOLDER_ADDED_TO_FULL_FOLDER, {
          quizId: this.entityId,
          folderIds: this.selectedFolderIds,
        });
      }
    },

    toggleUpsell() {
      this.showSfUpsellModal = false;
    },

    handleCreateNewFolder() {
      if (this.folderList.length >= 1 && (this.isBasicUser || this.isSuperUser)) {
        this.showSfUpsellModal = true;
      } else {
        this.$emit('createNew');
      }
      // alert('creating new folder, emit close with continue');
    },

    handleAddToFolders() {
      this.$emit('add', this.selectedFolderIds);
    },
  },
};
</script>

<style lang="scss" scoped>
.folders-container {
  scroll-behavior: smooth;
}

.content-modal-height {
  height: 150px;
}
</style>
