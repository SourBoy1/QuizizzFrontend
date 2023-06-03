<template>
  <div
    class="w-screen absolute"
  >
    <SaveEntityToFolderModal
      v-if="showSaveEntityToFolderModal"
      :entityName="entityNameToAddToFolder"
      :entityId="entityIdToAddToFolder"
      :folderMap="folderMap"
      :loadingFolders="folderLoaders.folders"
      :loadingAddEntity="folderLoaders.addEntity"
      @add="handleAddEntityToTeams"
      @close="toggleSaveEntityToFolderModal"
      @createNew="handleCreateNewClick"
    />

    <EntitySavedSuccessModal
      v-if="showEntitySavedSuccessModal"
      :title="savedEntitySuccessModalTitle"
      @close="handleEntitySavedSuccessModalClose"
      @viewFolder="handleViewFolderFromSuccess"
    />

    <CreateFolderModal
      v-if="showCreateFolderModal"
      :loadingCreateFolder="folderLoaders.createFolder"
      :isFirstFolderCreation="isFirstFolderCreation"
      @close="toggleCreateFolderModal"
      @create="createFolder"
    />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

import Constants from '~/config/Constants';

import TeamService from '~/services/apis/TeamsAPIService';

export default {
  data() {
    return {
      showShareToFolderModalSet: false,

      // toggle states for multiple modals
      showSaveEntityToFolderModal: false,
      showEntitySavedSuccessModal: false,
      showCreateFolderModal: false,

      // to track the flow and reuse as state
      isFirstFolderCreation: false,
      entityIdToAddToFolder: null,
      entityNameToAddToFolder: null,

      sharedFolderCreatedModalData: {},
      folderMap: {},

      // loaders
      folderLoaders: {
        createFolder: false,
        addEntity: false,
        folders: false,
      },

      entity: null,

      triggerSource: null,
    };
  },

  computed: {
    ...mapGetters('teams', ['getTeamById']),
  },

  created() {
    this.$eventBus.$on('triggerShareToFolderFlow', this.triggerShareToFolderFlow);
  },

  beforeUnmount() {
    this.$eventBus.$off('triggerShareToFolderFlow', this.triggerShareToFolderFlow);
  },

  methods: {
    ...mapActions('root', ['setUser']),
    ...mapActions('teams', ['setTeams', 'setTeam', 'setTeamMembers']),

    triggerShareToFolderFlow({ entity, type }) {
      this.entity = entity;
      this.triggerSource = type;
      this.$analytics.logEvent(this.$webEvents.SHARED_FOLDER_ADD_TO_FOLDER, {
        quizId: this.entity._id,
        source: this.triggerSource,
      });
      this.addToShareFolder();
    },

    toggleSaveEntityToFolderModal() {
      this.showSaveEntityToFolderModal = !this.showSaveEntityToFolderModal;
    },

    toggleCreateFolderModal(isFirstFolderCreation = false) {
      this.showCreateFolderModal = !this.showCreateFolderModal;
      this.isFirstFolderCreation = isFirstFolderCreation;
    },

    async fetchFolders() {
      this.folderLoaders = { ...this.folderLoaders, folders: true };
      this.folderMap = {};
      const { teams } = await TeamService.getUserTeams(this.entityIdToAddToFolder);
      if (teams) {
        this.folderMap = teams;
        this.setTeams(Object.values(teams));
      } else {
        this.toastSomethingWentWrong(this.$i18n('Could not fetch your teams!'));
      }
      this.folderLoaders = { ...this.folderLoaders, folders: false };
    },

    addToShareFolder() {
      const foldersExist = this.$user.teamIds?.length > 0;
      this.entityNameToAddToFolder = this.entity.info.name;
      this.entityIdToAddToFolder = this.entity._id;
      if (foldersExist) {
        this.fetchFolders();
        this.toggleSaveEntityToFolderModal();
      } else {
        this.toggleCreateFolderModal(true);
      }
    },

    async handleAddEntityToTeams(teamIds) {
      this.folderLoaders = { ...this.folderLoaders, addEntity: true };
      const result = await TeamService.addContentToManyTeams(teamIds, this.entityIdToAddToFolder);

      if (result) {
        const updatedTeams = teamIds.map((teamId) => this.getTeamById(teamId));
        updatedTeams.forEach((team) => {
          this.setTeam({
            ...team,
            contentMetrics: {
              sharedQuizzes: (team.contentMetrics?.sharedQuizzes || 0) + 1,
            },
          });
        });
        this.$analytics.logEvent(this.$webEvents.SHARED_FOLDER_ADD_QUIZ_TO_EXISTING_FOLDER, {
          folderIds: teamIds,
          quizId: this.entityIdToAddToFolder,
          source: this.triggerSource,
        });
        this.folderLoaders = { ...this.folderLoaders, addEntity: false };
        this.toggleSaveEntityToFolderModal();
        setTimeout(() => {
          this.savedEntitySuccessModalTitle = this.$i18n('Quiz shared with {$1}{$2}', [
            this.folderMap[teamIds[0]].name,
            (teamIds.length > 1 ? this.$i18n(' and {$1} other {$2}', [teamIds.length - 1, teamIds.length > 2 ? this.$i18n('teams') : this.$i18n('team')]) : '')]);
          this.toggleEntitySavedSuccessModal({
            teamId: teamIds[0],
          });
        }, 500);
      }
    },

    handleEntitySavedSuccessModalClose() {
      this.savedEntitySuccessModalTitle = '';
      this.toggleEntitySavedSuccessModal();
    },

    handleCreateNewClick() {
      this.toggleSaveEntityToFolderModal();
      setTimeout(() => {
        this.toggleCreateFolderModal();
      }, 500);
    },

    toggleEntitySavedSuccessModal(args) {
      if (args?.teamId) {
        this.sharedFolderCreatedModalData = {
          teamId: args.teamId,
        };
      }
      this.showEntitySavedSuccessModal = !this.showEntitySavedSuccessModal;
    },

    async addMembersToTeam(teamId, membersList, skipCache = false) {
      if (!membersList.length) {
        return 'success';
      }
      return TeamService.addMembersToTeam(teamId, membersList, skipCache);
    },

    async addEntityToTeam(teamId, entityId, skipCache = false) {
      return TeamService.addContentToTeam(teamId, entityId, skipCache);
    },

    async createFolder(folderName, collaboratorList) {
      this.folderLoaders = { ...this.folderLoaders, createFolder: true };

      const team = await TeamService.createTeam({ name: folderName });
      const { _id: teamId } = team;
      // on succcess
      if (teamId) {
        this.setTeam(team);
        const updatedUser = {
          ...this.$user.userStore,
        };

        updatedUser.teamIds = [...this.$user.teamIds, teamId];

        this.setUser(updatedUser);
        this.$user.teamIds = updatedUser.teamIds;

        const [addMembersResult, addEntityResult] = await Promise.allSettled([
          this.addMembersToTeam(teamId, collaboratorList, true),
          this.addEntityToTeam(teamId, this.entityIdToAddToFolder, true),
        ]);

        this.triggerSharedFolderEvent({
          teamId,
          collaboratorList,
          quizId: this.entityIdToAddToFolder,
        });

        if (addEntityResult.value) {
          setTimeout(() => {
            this.savedEntitySuccessModalTitle = this.$i18n('Quiz shared with {$1}', [folderName]);
            this.toggleEntitySavedSuccessModal({
              teamId,
            });
          }, 500);
        } else {
          this.toastSomethingWentWrong(this.$i18n('Could not add the quiz!'));
        }
        if (!addMembersResult.value) {
          this.toastSomethingWentWrong(this.$i18n('Could not add collaborators!'));
        } else if (addMembersResult.value !== 'success') {
          this.setTeamMembers({ teamId, members: addMembersResult.value.members });
        }

        this.toggleCreateFolderModal();
      } else {
        this.toastSomethingWentWrong(this.$i18n('Could not create team!'));
      }
      this.folderLoaders = { ...this.folderLoaders, createFolder: false };
    },

    triggerSharedFolderEvent({ teamId, collaboratorList, quizId }) {
      this.$analytics.logEvent(this.$webEvents.SHARED_FOLDER_CREATED_SHARED_FOLDER_SUCCESSFULLY, {
        folderId: teamId,
        collaborators: collaboratorList,
        source: this.triggerSource,
      });

      this.$analytics.logEvent(this.$webEvents.SHARED_FOLDER_ADD_QUIZ_TO_NEW_FOLDER, {
        folderId: teamId,
        quizId,
        collaboratorList,
        source: this.triggerSource,
      });

      if (collaboratorList?.length > 0) {
        this.$analytics.logEvent(this.$webEvents.SHARED_FOLDER_ADDED_MORE_COLLABORATORS, {
          collaborators: collaboratorList,
          teamId,
          source: this.triggerSource,
        });
      }
    },

    handleViewFolderFromSuccess() {
      this.$analytics.logEvent(this.$webEvents.SHARED_FOLDER_VIEW_FOLDER_CLICKED, {
        folderId: this.sharedFolderCreatedModalData.teamId,
        source: this.triggerSource,
      });
      this.$router.push(`/admin/private?teamId=${this.sharedFolderCreatedModalData.teamId}`);
      this.handleEntitySavedSuccessModalClose();
    },

    toastSomethingWentWrong(instruction = null) {
      this.$toasts.add({
        type: Constants.ToastTypes.ERROR,
        icon: 'fas fa-times-circle',
        title: instruction ?? this.$i18n('Something went wrong.'),
      });
    },

  },
};
</script>
