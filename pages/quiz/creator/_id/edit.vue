<template>
  <div
    class="relative h-full min-h-screen quiz-editor bg-light-1"
    :class="{ 'h-screen overflow-hidden': isASlideBeingEdited }"
  >
    <template v-if="showAddMoreQuestionsModal">
      <template v-if="showQuestionsGenExp">
        <AddNewQuestionsModalExp
          :addnewquestionsIndex="addnewquestionsIndex"
          @close="showAddMoreQuestionsModal = false"
        />
      </template>
      <template v-else>
        <AddNewQuestionsModal
          :addnewquestionsIndex="addnewquestionsIndex"
          @close="showAddMoreQuestionsModal = false"
        />
      </template>
    </template>
    <QuizGenerator
      v-if="isQuizGenInProgress"
      :quizId="quizId"
      :draftId="draftId"
      :toggleQuizGenerator="toggleQuizGenerator"
      @refreshQuiz="handleRefreshQuiz"
    />
    <template v-if="isPageLoading">
      <LoadingStateQuizEditor />
      <NoResourceAccessModal v-if="showAccessNotAllowedModal" />
    </template>

    <template v-else>
      <main>
        <QuizEditorHeader
          ref="quizEditorHeader"
          v-model="showQuizPreview"
          :name="draft.name"
          :isAwaitingPublish="isAwaitingPublish"
          :isCurrentStateReorder="isCurrentStateReorder"
          :shouldShowRedirectToOldEditorButton="shouldShowRedirectToOldEditorButton"
          :isQuizPremium="isQuizPremium"
          :isASlideBeingEdited="isASlideBeingEdited"
          :hasQuestions="hasQuestions"
          @togglePublishModal="togglePublishModal"
          @togglePrecreateModal="togglePrecreateModal"
          @onRedirectToOldQuizEditor="onRedirectToOldQuizEditor"
          @toggleNoQuestionsModal="toggleNoQuestionsModal"
          @handleBack="handleBack"
          @onQuizUpdate="onQuizUpdate"
        />

        <div class="quiz-editor-inner relative flex justify-center bg-light-1">
          <div
            ref="editorContainer"
            class="editor-body relative flex flex-col items-center justify-start mb-20 w-full px-2"
            :class="[!qTypeVisibilityExp && isFlaggedCorporateUser ? 'max-w-160' : 'max-w-160', {
              'max-w-160': qTypeVisibilityExp && hasQuestions,
              'max-w-180': qTypeVisibilityExp && !hasQuestions,
              'mt-10': $user.isCorporate,
            }]"
          >
            <QuestionTypesVisibilityHeader
              v-if="qTypeVisibilityExp && (!isFlaggedCorporateUser && !hasQuestions)"
              ref="quizEditorTopContainer"
              :class="['fixed z-50 top-12 w-full max-w-180']"
              @handleOtherPlatformsImport="handleOtherPlatformsImport"
              @onSearchTeleport="onSearchTeleport"
            />

            <QuizEditorTopContainer
              v-else-if="!isFlaggedCorporateUser || (isFlaggedCorporateUser && isCurrentStateReorder)"
              ref="quizEditorTopContainer"
              :isUpdateReorderQuestionsInProgress="isUpdateReorderQuestionsInProgress"
              :currentTeleportSearchTerm="teleportSearchTerm"
              :currentState="currentState"
              :questions="sortedQuestions"
              :haveQuestionsBeenReordered="haveQuestionsBeenReordered"
              :isQuestionLimitReached="isQuestionLimitReached"
              @toggleNewQuestionList="toggleNewQuestionList"
              @onSearchTeleport="onSearchTeleport"
              @changeCurrentState="onChangeCurrentState"
              @onQuestionsReordered="onQuestionsReordered"
              @toggleQuestionLimitModal="toggleQuestionLimitModal"
            />

            <StandardTaggingSection
              v-if="showStandardTagNudge"
              :closeStandardTaggingNudge="closeStandardTaggingNudge"
              :subjectForCurriculumRecommendation="subjectForCurriculumRecommendation"
              :openStandardTagModal="openTopicTagModal"
              :saveQuestionTopicsById="saveQuestionTopicsById"
            />

            <BannerQuizEditorAiQuizCreation
              v-if="!isAIGenerated && canShowAiQuizGenerator"
              class="mb-10"
              @quizGenViaAI="openQuizGeneratorModal('banner-quiz-editor')"
            />

            <div
              v-if="shouldShowSuperQuestionBanner"
              class="w-full flex items-center justify-between mb-3 py-1.5 px-3.5 bg-yellow rounded-lg"
            >
              <div class="flex items-start">
                <SuperIcon
                  :hasBorder="false"
                  :hasBackground="false"
                  :color="'white'"
                  :size="12"
                  class="mt-1 mr-2 super-icon"
                />
                <h1 class="text-light-3">
                  <i18n :injections="[premiumLabel]">
                    Some questions in this quiz are {$1} features. Upgrade to save them in your quiz.
                  </i18n>
                </h1>
              </div>
              <div class="flex items-center">
                <Button
                  :title="getSuperUpsellCTAText"
                  titleClasses="text-light-3 bg-light-20% py-1.5 px-2 rounded"
                  buttonClasses="px-2 pr-0"
                  type="super-secondary"
                  @click="handleClickOnUpgradeToSuper"
                />
              </div>
            </div>

            <!-- Banner -->
            <BannerAIGenQuizDetails
              v-if="isAIGenerated && isFlaggedCorporateUser && canShowAiQuizGenerator"
              :questionsGenerated="questionsToShow.length"
              :documentScannedPercent="documentScannedByAIPercent"
              class="mb-4"
            />

            <div
              v-if="hasQuestions"
              class="w-full"
            >
              <div
                v-if="shouldShowBannerToUseSuperQuestions"
                class="flex items-start bg-[#FDF7EB] p-4 mb-2 rounded-lg border-1 border-dark-6"
              >
                <FA
                  icon="fas fa-lightbulb-on"
                  :size="24"
                  class="text-yellow-dark px-1 mt-1 mr-2"
                />
                <div>
                  <p class="text-[11px] text-yellow-dark font-bold">
                    <i18n :injections="[premiumLabel]">
                      TIP: TRY OUT {$1} QUESTIONS FOR FREE
                    </i18n>
                  </p>
                  <p class="text-xs">
                    <i18n :injections="[premiumLabel]">
                      Now you can try out {$1} questions while editing your quiz, and choose to upgrade your plan for
                      unlimited access
                    </i18n>
                  </p>
                </div>
              </div>

              <div
                v-if="!isCurrentStateReorder"
                class="flex justify-between"
              >
                <Lozenge
                  icon="fas fa-tasks"
                  :title="`${questionsToShow.length} ${$i18n('Questions')}`"
                />

                <Button
                  licon="fas fa-sort-alt"
                  :title="$i18n('Change Question Order')"
                  type="other"
                  size="sm"
                  :aria-label="$i18n('Reorder')"
                  @click="() => onChangeCurrentState('reorder')"
                />
              </div>
              <transition-group
                appear
                enter-active-class="animate__animated animate__fadeInDown"
                leave-active-class="animate__animated animate__fadeOutUp"
              >
                <draggable
                  v-bind="{
                    disabled: !isCurrentStateReorder,
                    animation: 150,
                    easing: 'cubic-bezier(1,0,0,1)',
                    ghostClass: 'question-details-card-ghost',
                    dragClass: 'question-details-card-drag',
                    handle: '.my-handle',
                  }"
                  key="draggable"
                  v-model="listOfQuestions"
                  item-key="_id"
                  :scroll-sensitivity="200"
                  :force-fallback="true"
                  @end="handleDragChange"
                >
                  <template #item="{ element, index }">
                    <div :key="element._id">
                      <QuestionDetailsCard
                        :ref="`questionDetailCards_${element._id}`"
                        :currentIndex="index"
                        :isSuperContent="false"
                        :question="element"
                        :questionAutoConvertVersions="autoConvertQuestionsVersionsMap[element._id]"
                        :quizHasAllMCQs="quizHasAllMCQs"
                        :autoConvertNudgeQuestionId="autoConvertNudgeQuestionId"
                        :questionIndex="getQuestionIndex(element._id)"
                        :currentState="currentState"
                        :selectedTime="questionTime(element)"
                        :selectedCorrectPoints="questionCorrectPoints(element)"
                        :questionTopics="getQuestionTopics(element._id)"
                        forPage="quiz-editor"
                        handleClass="my-handle"
                        class="rounded bg-light question-details-card"
                        :class="{ 'my-handle': isCurrentStateReorder && isDesktop, 'mt-2': index === 0 }"
                        :isQuestionLimitReached="isQuestionLimitReached"
                        :questionQuickTags="getQuickTag(questionsToShow, element)"
                        @changeCurrentState="onChangeCurrentState"
                        @questionTimeUpdated="onQuestionTimeUpdation"
                        @questionEdited="onQuestionEdit(element)"
                        @questionDuplicated="onQuestionDuplication"
                        @questionDeleted="onQuestionDeletion"
                        @questionMarksUpdated="onQuestionMarksUpdation"
                        @applyTimeToAllQuestions="onApplyTimeToAllQuestions"
                        @toggleQuestionLimitModal="toggleQuestionLimitModal"
                      />
                      <div
                        class="flex flex-col items-center justify-center w-full question-quick-add-container"
                        @mouseenter="quickAddIntentAtIndex = index"
                        @mouseleave="quickAddIntentAtIndex = -1"
                      >
                        <QuestionVerticalDivider v-if="!isCurrentStateReorder" />
                        <transition
                          v-if="showTagAllNudge && canShowTagAllNudge(index, element._id) && firstStandardTaggedQuestionIndex === element._id"
                          appear
                          enter-active-class="animate__animated animate__fadeInUp animation-duration-600"
                          leave-active-class="animate__animated animate__fadeOutDown animation-duration-200"
                        >
                          <div
                            v-if="showTagAllNudge && canShowTagAllNudge(index, element._id) && firstStandardTaggedQuestionIndex === element._id && element.standardIds[0]"
                            class="w-full p-4 border-1 rounded border-dark-10%"
                          >
                            <div class="text-xs font-semibold text-dark-2">
                              <i18n>Do all questions in this activity belong to the same standard?</i18n> <span
                                class="text-dark-4"
                              >({{ element.standardIds[0]?.short_code }})</span>
                            </div>
                            <div class="w-full flex justify-start items-center text-xs font-semibold gap-3 mt-3">
                              <Button
                                :fullHeight="true"
                                type="white"
                                :title="$i18n('Tag all at once')"
                                :buttonClasses="` ${isDesktop ? 'rounded' : 'flex-1'}`"
                                size="sm"
                                :licon="'fas fa-tags'"
                                :disabled="taggingLoader"
                                :loading="taggingLoader"
                                @click="tagAllQuestions(element.standardIds[0])"
                              />
                              <div
                                class="text-dark-4 cursor-pointer"
                                @click="closeShowTagAllNudge"
                              >
                                <i18n>
                                  Dismiss
                                </i18n>
                              </div>
                            </div>
                          </div>
                        </transition>
                        <QuestionVerticalDivider
                          v-if="(showTagAllNudge && canShowTagAllNudge(index, element._id) && firstStandardTaggedQuestionIndex === element._id && element.standardIds[0]) && (canShowTaggingNudge && showTaggingReminderNudge)"
                        />
                        <transition
                          v-if="!isCurrentStateReorder && canShowTaggingNudge && showTaggingReminderNudge"
                          appear
                          enter-active-class="animate__animated animate__fadeInUp animation-duration-300"
                          leave-active-class="animate__animated animate__fadeOutDown animation-duration-200"
                        >
                          <div
                            v-if="canShowTaggingNudge && showTaggingReminderNudge"
                            class="w-full p-4 border-1 rounded border-dark-10%"
                          >
                            <div class="text-xs font-semibold text-dark-2">
                              <i18n>
                                Consider tagging the above question with a standard to get a standards-aligned report.
                              </i18n>
                            </div>
                            <div class="w-full flex justify-start items-center text-xs font-semibold gap-3 mt-3">
                              <Button
                                :fullHeight="true"
                                type="link"
                                :title="$i18n('View Sample Report')"
                                :buttonClasses="`underline bg-transparent`"
                                size="sm"
                                @click="openStandardTagModal"
                              />
                              <div
                                class="text-dark-4 cursor-pointer"
                                @click="closeShowTaggingReminderNudge"
                              >
                                <i18n>
                                  Dismiss
                                </i18n>
                              </div>
                            </div>
                          </div>
                        </transition>
                        <div
                          v-if="!isCurrentStateReorder"
                          class="question-vertical-divider h-4 w-fit border-l-1 border-dark-10%"
                        />
                        <div
                          v-if="!isCurrentStateReorder
                            && (quickAddIntentAtIndex === index
                              || (quickAddIntentAtIndex === -1
                                && index === questionsToShow.length - 1))"
                          :class="[
                            { 'flex bg-light-2 h-18 gap-3 items-center justify-center rounded-2xl px-4': showAddQuestionsAutomaticallyBtn },
                            { 'bg-light-2': !isFlaggedCorporateUser },
                            { relative: isFlaggedCorporateUser },
                            isMobile ? 'min-w-40' : 'min-w-120',
                          ]"
                        >
                          <span
                            v-if="isFlaggedCorporateUser"
                            class="question-horizontal-divider absolute border-t-1 border-dark-10%"
                          />
                          <div
                            v-if="!isFlaggedCorporateUser"
                            class="flex gap-3 items-center justify-center"
                          >
                            <Button
                              data-cy="add-new-question-button"
                              :title="isMobile ? $i18n('New question') : $i18n('Create a new question')"
                              :aria-label="$i18n('Add a new question at {$1}', quickAddIntentAtIndex + 1)"
                              licon="far fa-plus-circle"
                              type="secondary"
                              @click="() => {
                                showNewQuestionList = true
                                addQuestionAtIndex = index
                              }"
                            />
                            <Button
                              v-if="showAddQuestionsAutomaticallyBtn"
                              :title="isMobile ? $i18n('Add questions') : $i18n('Add questions automatically')"
                              licon="fas fa-magic-wand-sparkles"
                              type="secondary"
                              @click="handleAddMoreQuestions(index)"
                            />
                          </div>
                          <div
                            v-else
                            class="flex flex-col xs:flex-row xs:gap-3 items-center xs:items-start justify-center"
                          >
                            <div class="flex flex-col items-center">
                              <span class="h-4 xs:mr-2 w-[1px] bg-dark-10%" />
                              <Button
                                :title="$i18n('Quiz Library')"
                                licon="fas fa-plus"
                                customClasses="bg-light hover:bg-dark-10% text-dark-4 py-2 !min-w-[215px] !max-w-[215px]"
                                type="custom"
                                @click="onSearchTeleport"
                              />
                            </div>

                            <div class="flex flex-col items-center">
                              <span class="h-4 w-[1px] bg-dark-10%" />
                              <Button
                                data-cy="add-new-question-button"
                                :title="$i18n('Add new question')"
                                :aria-label="$i18n('Add a new question at {$1}', quickAddIntentAtIndex + 1)"
                                licon="far fa-plus"
                                customClasses="bg-lilac-dark hover:bg-lilac text-light py-2 !min-w-[230px] !max-w-[230px]"
                                type="custom"
                                @click="() => {
                                  $analytics.logEvent($webEvents.QFW_EDITOR_ADD_NEW_QUESTION_CLICKED)
                                  showNewQuestionList = true
                                  addQuestionAtIndex = index
                                }"
                              />
                            </div>

                            <div class="flex flex-col items-center">
                              <span class="h-4 xs:ml-2 w-[1px] bg-dark-10%" />
                              <Button
                                :title="$i18n('Import')"
                                licon="fas fa-plus"
                                type="custom"
                                customClasses="bg-light hover:bg-dark-10% text-dark-4 py-2 !min-w-[215px] !max-w-[215px]"
                                @click="handleBulkImportQuestion"
                              />
                            </div>
                          </div>
                        </div>
                        <div
                          v-if="index < questionsToShow.length - 1"
                          class="question-vertical-divider h-4 w-fit border-l-1 border-dark-10%"
                        />
                      </div>
                    </div>
                  </template>
                </draggable>
              </transition-group>
            </div>
            <div
              v-else
              class="flex flex-col items-center "
              :class="{
                'max-w-195 w-full': !shouldShowPremiumWeekBanner,
              }"
            >
              <img
                v-if="shouldShowPremiumWeekBanner"
                :src="getBannerSource"
                :alt="$i18n('Premium Week Banner')"
                class="mb-6 w-full premium-week-banner-image rounded"
              />
              <h3
                v-if="!isFlaggedCorporateUser"
                class="mb-4 text-sm font-semibold text-dark-2"
              >
                <i18n>or, Create a new question</i18n>
              </h3>
              <h3
                v-else
                class="mb-4 text-sm font-semibold text-dark-2"
              >
                <i18n>Select a question type</i18n>
              </h3>

              <div
                v-if="shouldShowBannerToUseSuperQuestions"
                class="try-super-q-banner flex items-start max-w-full bg-[#FDF7EB] p-4 mx-4 md:mx-0 mb-2 rounded-lg border-1 border-dark-6"
                :class="qTypeVisibilityExp ? 'w-[110%]' : 'w-[125%]'"
              >
                <FA
                  icon="fas fa-lightbulb-on"
                  :size="24"
                  class="text-yellow-dark px-1 mt-1 mr-2"
                />
                <div>
                  <p class="text-[11px] text-yellow-dark font-bold">
                    <i18n :injections="[premiumLabel]">
                      TIP: Try {$1} questions while creating your quiz.
                    </i18n>
                  </p>
                  <p class="text-xs">
                    <i18n :injections="[premiumLabel]">
                      You will need to upgrade to save {$1} questions in your quiz.
                    </i18n>
                  </p>
                </div>
              </div>

              <QuestionTypesVisibilityList
                v-if="qTypeVisibilityExp"
                :shouldAllowUsingSuperQuestionTypes="shouldAllowUsingSuperQuestionTypes"
                source="select_q_type_list_0"
                :questionTypesFromTemplate="questionTypesFromTemplate"
                @questionTypeSelected="addNewQuestion"
                @questionTypeClickForPreview="handleQuestionTypeClickForPreview"
              />

              <QuestionTypesList
                v-else-if="!qTypeVisibilityExp"
                :shouldAllowUsingSuperQuestionTypes="shouldAllowUsingSuperQuestionTypes"
                source="select_q_type_list_0"
                @questionTypeSelected="addNewQuestion"
              />

              <div
                v-if="!isFlaggedCorporateUser && !qTypeVisibilityExp"
                class="mt-6"
              >
                <h3 class="text-center text-sm font-semibold">
                  <i18n>Have questions ready ? Let’s Import</i18n>
                </h3>
                <div
                  class="flex items-center justify-center gap-4 mt-2"
                  :class="isDesktop ? 'flex-row' : 'flex-col'"
                >
                  <Button
                    v-if="isDesktop"
                    :title="$i18n('Spreadsheet')"
                    licon="fa-solid fa-table"
                    liconClasses="text-green-dark"
                    size="md"
                    type="white"
                    @click="importSpreadsheetNoQuestionsClick"
                  />
                  <Button
                    :title="$i18n('Google Forms')"
                    licon="fa-solid fa-file-lines"
                    liconClasses="text-lilac"
                    size="md"
                    type="white"
                    @click="handleImportGoogleForms"
                  >
                    <template #badge>
                      <span class="pointer-events-none bg-red text-light-3 text-xxs font-semibold rounded-full px-2 ml-2">
                        <i18n>NEW</i18n>
                      </span>
                    </template>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <QuestionLimitBanner
            v-if="isQuestionLimitReached"
            :containerClasses="isDesktop ? ['h-8'] : ['h-18']"
            @toggleQuestionLimitModal="toggleQuestionLimitModal()"
          />

          <QuizEditorInfoAndSettings
            v-if="questionsToShow.length > 0"
            class="self-start hidden mt-6 ml-6 md:block"
            @openQuizGeneratorModal="openQuizGeneratorModal('import-options-quiz-editor')"
            @toggleImportModal="toggleImportModal"
            @togglePublishModal="togglePublishModal"
            @togglePrecreateModal="togglePrecreateModal"
            @setDefaultTime="onSettingDefaultTime"
            @setDefaultPoints="onSettingDefaultPoints"
          />
        </div>

        <transition
          class="circle"
          @before-enter="beforeEnterTeleportAnimationCircle"
          @leave="onleaveTeleportAnimationCircle"
        >
          <div
            v-if="showTeleportCircle"
            class="add-teleport-circle w-12 h-12 rounded-full fixed z-102 bg-dark-10% flex items-center justify-center"
          >
            <div class="w-8 h-8 rounded-full bg-light-2" />
          </div>
        </transition>

        <keep-alive>
          <TeleportContainer
            class="absolute top-0 z-101"
            :forPage="$constants.TeleportPageTypes.QUIZ_EDITOR"
            :contentType="$constants.ContentType.QUIZ"
            :showTeleport="showTeleport"
            :currentTeleportSearchTerm="teleportSearchTerm"
            :isAddingTeleportInProgress="isAddingTeleportInProgress"
            :isBulkAddingTeleportInProgress="isBulkAddingTeleportInProgress"
            @onTeleportSearch="updateSearchTerm"
            @closeTeleport="closeTeleport"
            @addQuestion="addNewQuestionFromTeleport"
            @addAllQuestions="addAllQuestionsFromTeleport"
          />
        </keep-alive>
      </main>

      <QuizQuestionEditor
        v-if="isDesktop && isASlideBeingEdited"
        class="w-screen z-100"
        :style="questionEditorStyles"
        :showImageUpload="showImageUpload"
        :shouldAllowUsingSuperQuestionTypes="shouldAllowUsingSuperQuestionTypes"
        @questionEditActionCompleted="onQuestionEditActionCompletion"
      />
    </template>
    <Modal
      v-if="showNewQuestionList && qTypeVisibilityExp"
      :containerClasses="containerClassesForQTypesVisibilityList"
      type="custom"
      dismissOnOverlayClick
      @close="showNewQuestionList = false"
    >
      <QuestionTypesVisibilityList
        class="rounded-lg"
        :shouldAllowUsingSuperQuestionTypes="shouldAllowUsingSuperQuestionTypes"
        source="select_q_type_modal"
        :questionTypesFromTemplate="questionTypesFromTemplate"
        :doesQuizContainsOnlyMcqQuestions="doesQuizContainsOnlyMcqQuestions"
        @questionTypeSelected="addQuestion"
        @questionTypeClickForPreview="handleQuestionTypeClickForPreview"
      />
    </Modal>

    <Modal
      v-else-if="showNewQuestionList"
      type="custom"
      size="xl"
      dismissOnOverlayClick
      @close="showNewQuestionList = false"
    >
      <QuestionTypesList
        class="rounded-lg"
        :shouldAllowUsingSuperQuestionTypes="shouldAllowUsingSuperQuestionTypes"
        source="select_q_type_modal"
        @questionTypeSelected="addQuestion"
      />
    </Modal>

    <Modal
      v-if="showStandardTaggedBanner"
      @close="showStandardTaggedBanner = false"
    >
      <div class="text-base font-semibold text-center mt-2">
        <i18n>
          Tag content with standards and get better insights from your activities
        </i18n>
      </div>
      <StandardTaggedBanner :isMobile="isMobile" />
    </Modal>

    <!--== Modals Start ==-->

    <QuestionPreview
      v-if="showQuizPreview || shouldShowQuestionPreview"
      class="fixed top-0 left-0 w-screen z-on-overlay"
      :questionsToShow="questionsForPreviewModal"
      :isPreviewForQuestionTypesVisibility="showQuestionPreviewOnQtypeVisibilityList"
      :isQuiz="true"
      :quizId="quizId"
      :initialQuestionIndex="showQuestionPreviewOnQtypeVisibilityList ? questionPreviewIndex : 0"
      @close="handleCloseQuestionPreview"
      @useTemplateClick="useTemplateClick"
    />

    <SwitchingEditorModal v-if="showSwitchingToOldQuizEditorModal" />

    <Modal
      v-if="showQuestionLimitDisclaimer"
      :title="$i18n('Adding more than 500 questions is NOT safe for you.')"
      size="lg"
      :button1="null"
      :button2="{
        title: $i18n('Thanks for protecting me'),
        type: 'primary',
        layout: isDesktop ? '' : 'full',
      }"
      :icon="`far fa-exclamation-triangle`"
      :subtitle="$i18n('A teacher once added 11,000 and their laptop ran so hot it burned a hole in their desk. The quiz was still safe with us. But at what cost?')"
      dismissOnOverlayClick
      :showCloseModalBtn="false"
      iconCustomClasses="self-center"
      @button2-click="toggleQuestionLimitModal"
    />

    <Modal
      v-if="showSaveBeforeLeaveModel"
      :icon="null"
      :title="getLeaveModalTextData('title')"
      :subtitle="getLeaveModalTextData('subtitle')"
      :button1="{
        title: $i18n('Cancel'),
        type: 'other',
      }"
      :button2="{
        title: redirectingToPricingPage ? $i18n('Proceed') : $i18n('Leave page'),
        type: 'primary',
      }"
      :shouldCloseOnEscape="true"
      :dismissOnOverlayClick="true"
      :stickToBottom="isDesktop ? false : true"
      :containerClasses="isDesktop ? '' : 'self-end'"
      @button1-click="handleEditorExitBehaviour(false)"
      @button2-click="handleEditorExitBehaviour(true)"
      @close="showSaveBeforeLeaveModel = false"
    />

    <ContentPublishModalDesktop
      v-if="showPublishModal && isDesktop"
      :forContentType="$constants.ContentType.QUIZ"
      :type="$constants.ContentType.QUIZ"
      :didClickSettings="didClickSettings"
      showMobileLayout
      @close="handlePublishModalClose"
      @onAwaitPublish="setAwaitingPublish"
      @onQuizUpdate="onQuizUpdate"
    />

    <PromptForGameModal
      v-if="showPromptForGameModal"
      :quizId="quizId"
      :quizName="draftName"
      :quizImage="draft.image"
      :subjects="draft.subjects"
      :isQuizSuper="isQuizPremium"
      :numOfQuestions="questionsToShow.length"
    />

    <ContentPublishModalMobile
      v-if="showPublishModal && !isDesktop"
      :forContentType="$constants.ContentType.QUIZ"
      :type="$constants.ContentType.QUIZ"
      :didClickSettings="didClickSettings"
      showMobileLayout
      @close="handlePublishModalClose"
      @onAwaitPublish="setAwaitingPublish"
      @onQuizUpdate="onQuizUpdate"
    />

    <ImportSpreadsheetModal
      v-if="showImportSpreadsheetModal"
      :questionImportLimit="questionsToShow ? $constants.MaxQuestionsLimit - questionsToShow.length : $constants.MaxQuestionsLimit"
      @close="toggleImportModal"
      @saveSpreadSheetQuestions="onSaveSpreadSheetQuestions"
    />

    <NewPresentationModal
      v-if="showPreCreateModal"
      :forContentType="$constants.ContentType.QUIZ"
      :savedName="draft.name"
      :savedSubjects="draft.subjects"
      @close="showPreCreateModal = false"
      @onQuizUpdate="onQuizUpdate"
    />

    <FIBSettingsModal
      v-if="isFIBSettingsModalOpen"
    />

    <ImageUploadModal
      v-if="showImageUpload"
      :title="imageUploadModalTitle || $i18n('Insert an image or a GIF')"
      :button2-title="$i18n('Save')"
      :searchTerm="imageModalSearchTerm"
      :media="imageMedia"
      :showGoogleImageSearch="true"
      showMobileLayout
      @save="imageUploadCallback"
      @close="showImageUpload = false"
      @paste="pasteUrlButtonClick"
    />

    <AudioUploadModal
      v-if="showAudioUpload"
      :media="audioMedia"
      showMobileLayout
      @save="audioUploadCallback"
      @close="showAudioUpload = false"
    />

    <InsertVideoModal
      v-if="showVideoUpload"
      :media="videoMedia"
      showMobileLayout
      @save="videoUploadCallback"
      @close="showVideoUpload = false"
    />

    <MathEditorModal
      v-if="showMathEditor"
      dismissOnOverlayClick
      :latex="mathLatex"
      showMobileLayout
      @save="mathEditorCallback"
      @close="closeMathEditorCallback"
    />

    <QuestionTagModal
      v-if="showQuestionTopicTagger"
      :existingTags="getQuestionTopics(selectedQuestionId)"
      :allUserTags="allQuestionTopics"
      :isAwaitingApiResponse="isAwaitingApiResponse"
      showMobileLayout
      @close="closeTopicTagModal"
      @save="saveQuestionTopics"
    />

    <ExportQuizToLessonModal
      v-if="showImportQuizToLessonModal"
      :isBulkImportTriggered="isBulkImportTriggered"
      @close="showImportQuizToLessonModal = false"
    />
    <DrawCanvasEditor
      v-if="shouldShowDrawCanvasEditor"
      ref="drawCanvasEditor"
      :bgImage="drawCanvasEditorImage"
      @close="shouldShowDrawCanvasEditor = false"
    />

    <Modal
      v-if="showNoQuestionsModal"
      :title="$i18n('The quiz is incomplete')"
      icon="fas fa-exclamation-triangle"
      size="md"
      :button1="{
        title: $i18n('Discard'),
        type: 'danger',
        size: 'md',
        layout: 'default',
        ariaLabel: $i18n('Discard'),
        loading: isDiscardingQuiz,
      }"
      :button2="{
        title: $i18n('Add questions'),
        type: 'primary',
        size: 'md',
        layout: 'default',
        ariaLabel: $i18n('Add questions'),
      }"
      @close="showNoQuestionsModal = false"
      @button1-click="handleDiscardQuiz"
      @button2-click="showNoQuestionsModal = false"
    >
      <div class="text-dark-4 text-sm">
        <i18n>A quiz needs to have at least one question to be saved. Do you want to add questions to your quiz?</i18n>
      </div>
    </Modal>

    <ChooseCurriculumModal
      v-if="showCurriculumSelectionModal"
      ref="curriculumSelection"
      @save="handleCurriculumSelection"
      @cancel="handleCurriculumSelection(null)"
      @close="showCurriculumSelectionModal = false"
    />

    <AutoConvertQuizContainer
      :quizViewData="questionsToShow"
      :quizId="quizId"
      :autoConvertQuestionsVersionsMap="autoConvertQuestionsVersionsMap"
      :showConvertMore="true"
      :isUserQuizOwner="isUserQuizOwner"
      @saveAutoConvertFromModal="saveAutoConvertFromModal"
    />

    <!--== Modals End ==-->

    <ConcurrentSessionsErrorModal @exit="handleRedirectToQuizPage" />
    <SchoolAndDistrictModal />

    <PeekaboosQuestionTypeEditorInfo
      v-if="shouldShowQuestionInfoInPeekaboo"
      v-bind="metadataForPeekaboo"
      @close="shouldShowQuestionInfoInPeekaboo = false"
    />
    <ImportGoogleForms v-if="isImportFormsShowing" />
    <QfwCreateFlowBulkImportModal
      v-if="showBulkImportModal"
      :closeBulkImportModal="closeBulkImportQuestionModal"
      source="quiz_editor"
      :dismissOnOverlayClick="true"
      @handleImportGoogleForms="handleImportGoogleForms"
      @toggleBulkImport="handleBulkImport"
      @importSpreadsheetNoQuestionsClick="importSpreadsheetNoQuestionsClick"
      @openQuizGeneratorModal="openQuizGeneratorModal('bulk-import-quiz-editor')"
    />
    <AiQuizGenModal
      v-if="showAIQuizGenModal && canShowAiQuizGenerator"
      :source="sourceForQuizGenModal || 'quiz-editor'"
      :quizId="quizId"
      :versionId="versionId"
      @close="handleCloseGenerateQuizClick"
    />
    <HelpButton />
  </div>
</template>

<route lang="yaml">
  meta:
    middleware: auth
</route>

<script>
import { mapGetters, mapActions } from 'vuex';
import isEmpty from 'lodash/isEmpty';
import isBoolean from 'lodash/isBoolean';
import pickBy from 'lodash/pickBy';
import values from 'lodash/values';
import get from 'lodash/get';
import countBy from 'lodash/countBy';
import isString from 'lodash/isString';
import includes from 'lodash/includes';
import cloneDeep from 'lodash/cloneDeep';
import once from 'lodash/once';

import assignIn from 'lodash/assignIn';

import draggable from 'vuedraggable';

import dayjs from 'dayjs';

import ObjectId from 'bson-objectid';

import { getStandardsSubjectForRecommendation } from '~/utils/StandardsCollection';
import { ContentDefaultName } from '~/config/DefaultCopies';

import QLogger from '~/services/QLogger';

import HotjarService, { HotjarEvents } from '~/services/HotjarService';

import { handleFocusRings, stopHandlingFocusRings } from '~/services/FocusRingsService';

import QuizService from '~/services/apis/QuizService';
import UserAPIService from '~/services/apis/UserAPIService';
import Constants from '~/config/Constants';
import Fonts from '~/config/Fonts';
import ResourcePermissionsService from '~/services/apis/ResourcePermissionService';
import NewSlideService from '~/services/NewSlideService';
import Question from '~/models/Question';
import Media from '~/models/Media';
import { asyncDelay } from '~/services/PausableTimers';
import FontService from '~/services/FontService';
import {
  getQuestionDefaultMarks, getQuestionTypes, redirectOnLeavingEditor, isQuestionTypeSuperType, getSubjectFromPreferencesOrUserData, getVariantNameForSuperQuestionsUsed, isWordCloudQuestion,
} from '~/utils/QuizUtils';
import LocalStorage from '~/services/LocalStorage';

import { hasFeatureAccess } from '~/services/SubscriptionService';

import { getEnvironmentEnv } from '~/utils/EnvUtils';
import URLS from '~/config/BaseURLs';

import QuizGenerator from '~/components/QuizGenerator/index.vue';
import AddNewQuestionsModal from '~/components/QuizGenerator/AddNewQuestionsModal.vue';
import AddNewQuestionsModalExp from '~/components/QuizGenerator/AddNewQuestionsModalExp.vue';
import FIBSettingsModal from '~/components/FIBSettingsModal.vue';

import { getStateNameInUs } from '~/config/StatesInUS';
import QuestionVerticalDivider from '~/components/QuestionVerticalDivider.vue';

import QuestionTypesVisibilityHeader from '~/components/QuestionTypesVisibility/Header.vue';
import QuestionTypesVisibilityList from '~/components/QuestionTypesVisibility/List.vue';

import PromptForGameModal from '~/components/ContentPublishModal/PromptForGameModal.vue';

import { isNotPremiumWeek } from '~/utils/FreeweekUtils';

import templateQuiz from '~/components/QuestionTypesVisibility/templateQuiz';
import referralMixin from '~/mixins/referralMixin';

const QUESTION_INDEX_TO_SHOW_NUDGE_AFTER = 2;

export default {
  components: {
    draggable,
    QuestionVerticalDivider,
    QuizGenerator,
    AddNewQuestionsModal,
    AddNewQuestionsModalExp,
    PromptForGameModal,
    QuestionTypesVisibilityList,
    QuestionTypesVisibilityHeader,
    FIBSettingsModal,
  },

  mixins: [referralMixin],

  beforeRouteLeave(to, from, next) {
    // resetting the filters for quiz gen modal
    this.setQuizGenFilters({
      updateCopyOfFilters: true,
      value: {
        topic: '',
        subject: '',
        grade: '',
        difficulty: 'easy',
        numberOfQuestions: 5,
        language: '',
      },
    });
    next();
  },

  data() {
    return {
      listOfQuestions: [],
      zendeskInitTimeout: null,
      showSaveBeforeLeaveModel: false,
      showNewQuestionList: false,
      showImportSpreadsheetModal: false,
      showPreCreateModal: false,
      isAwaitingPublish: false,
      showPublishModal: false,
      didClickSettings: false,
      isAwaitingApiResponse: false,
      loading: false,
      showAccessNotAllowedModal: false,
      currentState: 'edit',
      reorderQuestionsList: [],
      haveQuestionsBeenReordered: false,
      showQuestionTopicTagger: false,
      selectedQuestionId: '',
      isUpdateReorderQuestionsInProgress: false,
      showQuizPreview: false,

      /** Teleport related data */
      teleportSearchTerm: '',
      showTeleportCircle: false,
      showTeleport: false,
      teleportQuestionData: null,
      shouldAddMultipleTeleportQuestions: false,
      teleportAnimationCircleEndTimeout: '',
      hideTeleportAnimationCircleTimeout: '',
      isAddingTeleportInProgress: false,
      isBulkAddingTeleportInProgress: false,
      teleportAnimationCicle: {
        start: [],
        end: [],
      },

      isPageLoading: false,
      questionEditorStyles: {},

      imageMedia: Media(),
      showImageUpload: false,
      isPasteUrlEnabled: false,
      imageUploadCallback: null,
      imageModalSearchTerm: '',
      imageUploadModalTitle: '',

      audioMedia: Media(),
      showAudioUpload: false,
      audioUploadCallback: null,

      videoMedia: Media(),
      showVideoUpload: false,
      videoUploadCallback: null,

      mathLatex: null,
      showMathEditor: false,
      mathEditorCallback: null,
      closeMathEditorCallback: null,

      showImportQuizToLessonModal: false,
      isBulkImportTriggered: false,

      questionTypes: getQuestionTypes(),
      showOptOutModal: false,
      showSwitchingToOldQuizEditorModal: false,
      showSwitchingModalTimeOut: null,

      shouldShowDrawCanvasEditor: false,
      drawCanvasEditorImage: '',
      showNoQuestionsModal: false,

      askForExitConfirmation: false,
      isDiscardingQuiz: false,
      showCurriculumSelectionModal: false,
      isQuestionLimitReached: false,
      showQuestionLimitDisclaimer: false,
      overrideRouteGuard: false,

      isLeavingFromEditorAllowed: false,
      shouldAllowUsingSuperQuestionTypes: true,
      containsSuperQuestions: false,
      redirectingToPricingPage: false,
      // quick add config
      quickAddIntentAtIndex: -1,
      addQuestionAtIndex: -1,

      // coming soon config
      shouldShowQuestionInfoInPeekaboo: false,
      metadataForPeekaboo: {},

      // data for quiz generator
      showQuizGen: true,
      quizGenData: {
        topic: '',
        subject: '',
        grade: '',
        language: '',
        numberOfQuestions: 10,
      },

      addnewquestionsIndex: -1,

      showAddMoreQuestionsModal: false,

      // Tag all questions
      showStandardTagNudge: false,
      subjectForCurriculumRecommendation: '',
      firstStandardTaggedQuestionIndex: -1,
      isAnyQuestionNotTagged: -1,
      showTagAllNudge: true,
      showTaggingReminderNudge: true,
      taggingLoader: false,
      showStandardTaggedBanner: false,
      showStandardTagAllReminder: false,
      // qfw bulk import questions
      showBulkImportModal: false,

      // under feature flag creation-to-game
      showPromptForGameModal: false,

      // under feature flag q-types-visibility
      showQuestionPreviewOnQtypeVisibilityList: false,
      questionToShowPreview: [],
      questionTypesFromTemplate: [],
      questionPreviewIndex: -1,

      showTagAllReminderEvent: null,
      showAIQuizGenModal: false,
      sourceForQuizGenModal: null,

      autoConvertQuestionsVersionsMap: {},
      autoConvertQuestionsResponse: [],
      quizHasAllMCQs: false,
    };
  },

  head() {
    return {
      title: this.pageTitle,
      meta: [{
        name: 'robots',
        content: 'noindex',
        hid: 'noIndexMetaRobots',
      }],

      script: [
        {
          src: 'https://apis.google.com/js/api.js',
        },
      ],
    };
  },

  computed: {
    ...mapGetters('currentQuiz', ['quizSubjects', 'quizGrades', 'currentQuiz', 'draftQuestions', 'publishedQuestions', 'permissions']),
    ...mapGetters('root', ['deviceProps', 'isDesktop', 'isMobile', 'isGoogleWidgetTranslated', 'googleWebsiteTranslatedLanguage', 'serverData']),
    ...mapGetters('contentEditor', ['quiz', 'quizType', 'quizId', 'selectedSlide', 'sortedQuestions', 'hasQuestions', 'draft', 'draftId', 'getDraftPreferences', 'hasDirtySlides', 'quizLockData', 'dirtySlides', 'getQuestionById', 'questionDraftKey', 'getQuestionIndexById', 'allQuestionTopics', 'publishedVersionDate', 'versionId', 'IsDraftVersionStale', 'showCurriculumSelection', 'getCurriculum', 'standardIdsForQuestionIds', 'quizPreferences', 'getSubjects', 'isAIGenerated', 'documentScannedByAIPercent', 'aiGenerationType']),
    ...mapGetters('slideEditor', ['isASlideBeingEdited', 'currentSlide', 'questionTopics']),
    ...mapGetters('products', ['isEligibleForTrial']),
    ...mapGetters('uiManager', ['isImportFormsShowing', 'shouldShowQuestionPreview', 'isFIBSettingsModalOpen']),

    draftName() {
      return this.draft?.name;
    },

    qTypeVisibilityExp1() {
      return this.$featureFlags.getFeatureValue(this.$constants.FeatureFlagsTypes.QTYPE_VISIBILITY) === 'explore_variant';
    },

    qTypeVisibilityExp2() {
      return this.$featureFlags.getFeatureValue(this.$constants.FeatureFlagsTypes.QTYPE_VISIBILITY) === 'search_variant';
    },

    qTypeVisibilityExp() {
      return this.qTypeVisibilityExp1 || this.qTypeVisibilityExp2;
    },

    showAddQuestionsAutomaticallyBtn() {
      return !this.isFlaggedCorporateUser;
    },

    isQuizGenInProgress() {
      return this.showQuizGen && !this.isDesktop && this.$featureFlags.isEnabled(this.$constants.FeatureFlagsTypes.SHOW_QUIZ_GEN_MOBILE) && !this.hasQuestions && this.$route.query.source === 'quizGenMobile';
    },

    shouldShowPremiumWeekBanner() {
      return this.isDesktop && !isNotPremiumWeek();
    },

    getBannerSource() {
      return this.isUserInTexas ? 'https://cf.quizizz.com/img/banners/banner-editor-staar.png' : 'https://cf.quizizz.com/image/premium_question_week_banner_desktop_v5.png';
    },

    getCreatorId() {
      return get(this.quiz, 'createdBy.id', get(this.quiz, 'createdBy._id', ''));
    },

    isUserQuizOwner() {
      return this.getCreatorId === this.$user.id;
    },

    isUserCoEditor() {
      if (!this.$user.isLoggedIn) {
        return false;
      }

      // Handling Write Access for Org_user Access type used for QFW
      const orgUsersPermissions = get(
        this.permissions,
        'orgUsersPermissions',
        null,
      );

      if (orgUsersPermissions && orgUsersPermissions.length) {
        const orgUserPermission = orgUsersPermissions.find((permission) => permission.accessorId === `${this.$user.id}:${this.$user.paidOrganization}`);
        if (orgUserPermission && orgUserPermission.permissionsList.includes('WRITE')) {
          return true;
        }
      }

      if (this.permissions) {
        return get(
          this.permissions,
          `userPermissions.${this.$user.id}.permissions`,
          [],
        ).includes('WRITE');
      }

      return false;
    },

    wasUserCreatedBeforeNewEditorDate() {
      const { createdAt } = this.$user;
      return dayjs(createdAt).isBefore(dayjs(Constants.MIN_USER_CREATION_DATE_FOR_NEW_EDITOR));
    },

    premiumLabel() {
      return this.showIndividualPlan ? this.$i18n('PREMIUM') : this.$i18n('SUPER');
    },

    canShowNewQuizEditor() {
      const localStorageVal = LocalStorage.getItem('sNewQE');

      if (isBoolean(localStorageVal)) {
        return localStorageVal === true;
      }

      return !this.wasUserCreatedBeforeNewEditorDate;
    },

    showQuestionsGenExp() {
      return this.$featureFlags.isEnabled(this.$constants.FeatureFlagsTypes.AUTO_QUESTIONS_GENERATOR);
    },

    canShowAiQuizGenerator() {
      if (this.isMobile) {
        return false;
      }
      if (this.sortedQuestions.length === 0) {
        return false;
      }
      return this.$featureFlags.isEnabled(this.$constants.FeatureFlagsTypes.AI_QUIZ_GENERATOR);
    },

    canShowTaggingNudge() {
      if (!this.$user.isPartOfAnOrganization) {
        return false;
      }
      if (this.checkStandardAdoptionInLocalStorage(this.currentQuiz._id, 'showTaggingReminderNudge')) {
        return false;
      }

      if (this.sortedQuestions.length === 1) {
        this.showTagAllReminderEvent();
        if (this.sortedQuestions[0].standardIds.length > 0) {
          return false;
        }
      }
      return this.sortedQuestions.length === 1;
    },

    isUserInTexas() {
      return this.serverData?.region?.includes('TX') ?? false;
    },

    shouldShowRedirectToOldEditorButton() {
      return this.wasUserCreatedBeforeNewEditorDate && !this.isASlideBeingEdited;
    },

    pageTitle() {
      return 'Quizizz Creator';
    },

    questionTypesList() {
      const questionTypes = pickBy(this.questionTypes, (val, key) => (key !== this.$constants.QuestionTypes.MSQ));

      if (this.isDesktop) {
        questionTypes.SLIDE = {
          type: 'SLIDE',
          title: this.$i18n('Slide'),
        };
      }

      return questionTypes;
    },

    questionsToShow() {
      if (this.isCurrentStateReorder) {
        return this.reorderQuestionsList?.map(({ originalIndex }) => this.sortedQuestions[originalIndex]);
      }

      if (this.shouldShowQuestionPreview) {
        return [this.currentSlide];
      }

      return this.sortedQuestions;
    },

    questionsForPreviewModal() {
      if (this.questionToShowPreview.length > 0 && this.showQuestionPreviewOnQtypeVisibilityList) {
        return this.questionToShowPreview;
      }

      return this.questionsToShow;
    },

    isCurrentStateReorder() {
      return this.currentState === 'reorder';
    },

    deviceDiscriminator() {
      return values(this.deviceProps).join('');
    },

    isSuperUser() {
      return this.$user.isSuper;
    },

    isCorporateUser() {
      return this.$user.isCorporate;
    },

    isFlaggedCorporateUser() {
      if (this.isCorporateUser) {
        return this.$featureFlags.isEnabled(this.$constants.FeatureFlagsTypes.QFW_CREATE_FLOW);
      }
      return false;
    },

    isUserPaidOrg() {
      return !!this.$user.paidOrganization;
    },

    shouldShowSuperQuestionBanner() {
      if (!isNotPremiumWeek() && this.isUserQuizOwner) {
        return false;
      }
      if (!this.shouldAllowUsingSuperQuestionTypes) {
        return false;
      }
      if (!this.isQuizPremium) {
        return false;
      }
      if (this.isSuperUser) {
        return false;
      }
      if (this.isCorporateUser) {
        return false;
      }
      return true;
    },

    isQuizPremium() {
      if (this.getSuperQuestionsUsed().length) {
        return true;
      }
      if (this.getAudioVideoQuestionsUsed().length) {
        return true;
      }
      if (this.getAudioVideoExplanationsUsed().length) {
        return true;
      }
      return false;
    },

    isQuizPublishable() {
      const { name, subjects, grade } = this.draft;
      if (this.isCorporateUser) {
        return Boolean(name) && name !== ContentDefaultName.QUIZ_NAME;
      }
      if (this.hasQuestions && Boolean(name) && name !== ContentDefaultName.QUIZ_NAME && subjects.length > 0 && grade.length > 0) {
        return true;
      }
      return false;
    },

    showIndividualPlan() {
      return this.$featureFlags.isEnabled(this.$constants.FeatureFlagsTypes.SHOW_INDIVIDUAL_PLAN);
    },

    getSuperUpsellCTAText() {
      if (this.showIndividualPlan) {
        return this.$i18n('Upgrade now');
      }
      if (this.isEligibleForTrial) {
        return this.$i18n('Get free Super trial');
      }
      return this.$i18n('Upgrade to Super');
    },

    shouldShowBannerToUseSuperQuestions() {
      let res = true;
      if (!isNotPremiumWeek() && this.isUserQuizOwner) {
        res = false;
      }
      if (this.isSuperUser) {
        res = false;
      }
      if (this.isCorporateUser) {
        res = false;
      }
      if (this.getSuperQuestionsUsed().length) {
        res = false;
      }
      if (this.getAudioVideoQuestionsUsed().length) {
        res = false;
      }
      if (this.getAudioVideoExplanationsUsed().length) {
        res = false;
      }
      return res;
    },

    getSelectedSubjectPreference() {
      return this.getSubjects()[0] || getSubjectFromPreferencesOrUserData(this.$user)[0] || '';
    },

    areAllQuestionsTagged() {
      let numberOfUntaggedQuestions = 0;
      this.sortedQuestions?.forEach((question) => {
        if (question.standardIds?.length === 0) {
          numberOfUntaggedQuestions += 1;
        }
      });

      return numberOfUntaggedQuestions === 0;
    },

    doesQuizContainsOnlyMcqQuestions() {
      const mcqQuestionTypes = this.sortedQuestions?.filter((question) => question.type === 'MCQ');
      if (mcqQuestionTypes?.length >= 3 && mcqQuestionTypes?.length === this.sortedQuestions?.length) {
        return true;
      }
      return false;
    },

    containerClassesForQTypesVisibilityList() {
      if (this.isMobile) { return 'overflow-y-auto px-0.5'; }
      return 'p-0';
    },

    isAutoConvertModalEnabled() {
      if (!this.$user.isLoggedIn) {
        return false;
      }

      return this.$featureFlags.isEnabled(this.$constants.FeatureFlagsTypes.AUTO_CONVERT_QUESTION_TYPES_QUIZ_PAGE)
        && this.$featureFlags.isEnabled(this.$constants.FeatureFlagsTypes.SHOW_AUTO_CONVERT_MODAL);
    },

    autoConvertNudgeQuestionId() {
      const questionToNudgeAfter = this.questionsToShow
        .find((question, index) => (
          this.autoConvertQuestionsVersionsMap[question._id]?.length
          && index > QUESTION_INDEX_TO_SHOW_NUDGE_AFTER
        ));
      return questionToNudgeAfter ? questionToNudgeAfter._id : -1;
    },

  },

  watch: {
    currentState(newVal, oldVal) {
      if (newVal === 'reorder') {
        this.reorderQuestionsList = this.sortedQuestions?.map((question) => ({
          originalIndex: question.index,
        }));
      }
    },

    hasDirtySlides(newVal) {
      window.isQuizCreatorDirty = true;
    },

    isPageLoading(newVal, oldVal) {
      if (newVal === false) {
        setTimeout(this.setQuestionEditorStyles.bind(this), 100);
        setTimeout(this.setQuestionEditorStyles.bind(this), 750);

        this.$nextTick(() => {
          // if the question id is present in the query params, open the question editor
          const questionIdToOpen = this.$route.query?.[this.$constants.EditorQueryParameters.OPEN_QUESTION_EDITOR];
          if (questionIdToOpen) {
            const question = this.sortedQuestions.find((question) => question._id === questionIdToOpen);
            if (question) {
              this.onQuestionEdit(question, -1, { shouldReplaceURL: true });
              return;
            }
          }

          // open a fresh question editor for the question type intended
          const questionTypeIntented = this.$route.query?.[this.$constants.EditorQueryParameters.OPEN_NEW_QUESTION_TYPE];
          if (questionTypeIntented) {
            this.addNewQuestion({ type: questionTypeIntented });
          }
        });
      }
    },

    deviceDiscriminator() {
      this.setQuestionEditorStyles();
    },

    IsDraftVersionStale(newVal) {
      this.$eventBus.$emit('quizVersion:staleDraft', newVal);
    },

    questionsToShow(currentList) {
      this.listOfQuestions = currentList;

      if (this.questionsToShow.length >= this.$constants.MaxQuestionsLimit) {
        this.isQuestionLimitReached = true;
      }
      if (this.isQuizPremium) {
        this.containsSuperQuestions = true;
      } else {
        this.containsSuperQuestions = false;
      }
      this.quizHasAllMCQs = this.questionsToShow.every((item) => item.type === Constants.QuestionTypes.MCQ);
    },

    autoConvertQuestionsResponse() {
      this.autoConvertQuestionsVersionsMap = this.autoConvertQuestionsResponse.reduce((map, { sourceQuestionId, targetQuestions }) => {
        if (targetQuestions.length > 0) {
          const sourceQuestion = this.questionsToShow.find(({ _id }) => _id === sourceQuestionId);
          if (sourceQuestion) {
            map[sourceQuestion._id] = [...targetQuestions, sourceQuestion];
          }
        }
        return map;
      }, {});
    },

    isASlideBeingEdited(isBeingEdited) {
      if (isBeingEdited) {
        this.shouldShowQuestionInfoInPeekaboo = false;
        this.$store.dispatch('root/setHelpButtonOffset', { y: 40 });
        this.$store.dispatch('root/setHelpButtonTheme', 'dark');
        this.$store.dispatch('root/setHelpButtonZIndex', 9999);
      } else {
        this.$store.dispatch('root/setHelpButtonOffset', { y: 0 });
        this.$store.dispatch('root/setHelpButtonTheme', 'light');
        this.$store.dispatch('root/setHelpButtonZIndex', 9);
      }

      if (!isBeingEdited && this.metadataForPeekaboo?.showActionCenter) {
        this.shouldShowQuestionInfoInPeekaboo = false;
      }
    },

    draftName(newVal) {
      this.teleportSearchTerm = newVal;
    },

    showQuizGen(newVal) {
      if (!newVal) {
        this.quizGenData.topic = this.draft.name;
      }
    },
  },

  async created() {
    if (!this.$user.isLoggedIn) {
      window.location = '/login';
      return;
    }

    try {
      this.isPageLoading = true;
      let quiz;
      let convertedQuestions;
      if (this.isAutoConvertModalEnabled) {
        const response = await QuizService.getQuiz(this.$route.params.id, null, true);
        quiz = response?.quiz ?? response;
        convertedQuestions = response?.convertedQuestions ?? [];
      } else {
        quiz = await QuizService.getQuiz(this.$route.params.id);
      }

      if (quiz.type === Constants.ContentType.PRESENTATION) {
        this.$router.push(`/presentation/${quiz._id}/edit`);
        return;
      }

      const isAllowed = await this.checkUserPermissions(quiz);

      if (!isAllowed) {
        return;
      }

      if (!quiz.draft) {
        quiz = await QuizService.makeQuizEditableAgain(this.$route.params.id);
      }

      if (this.isAutoConvertModalEnabled) {
        this.autoConvertQuestionsResponse = convertedQuestions;
      }

      this.$store.dispatch('contentEditor/setQuiz', { quiz, editorForContentType: Constants.ContentType.QUIZ, quizWithoutDrafts: false });
      if (this.qTypeVisibilityExp1) {
        // this is to show questions preview on qtype visibility explore CTA
        const previewQuestions = templateQuiz.questions;
        this.questionToShowPreview = previewQuestions.filter((question) => {
          if (question.type === Constants.QuestionTypes.MCQ && question.structure.settings.hasCorrectAnswer === false) {
            return true;
          } if (question.type === Constants.QuestionTypes.MSQ) {
            return false;
          }
          return true;
        });

        this.questionTypesFromTemplate = Array.from(new Set(previewQuestions.reduce((acc, question) => {
          if (question.type === Constants.QuestionTypes.MCQ && question.structure.settings.hasCorrectAnswer === false) {
            acc.push(Constants.QuestionTypes.POLL);
          } else if (question.type === Constants.QuestionTypes.MSQ) {
            return acc;
          } else {
            acc.push(question.type);
          }
          return acc;
        }, [])));
      }

      // if quiz has default name then set subject
      // else set quiz name)
      if (quiz.draft?.name === ContentDefaultName.QUIZ_NAME) {
        this.teleportSearchTerm = this.getSelectedSubjectPreference;
        this.quizGenData.topic = '';
      } else {
        this.teleportSearchTerm = quiz.draft?.name;
        this.quizGenData.topic = quiz.draft?.name;
      }
      this.quizGenData.subject = this.getSelectedSubjectPreference || '';
      this.quizGenData.grade = String(this.draft?.grade[0]) || '0';
      this.quizGenData.language = this.draft?.lang || 'English';
      this.setQuizGenFilters({
        updateAllValues: true,
        filter: null,
        value: {
          topic: this.quizGenData.topic, subject: this.quizGenData.subject, grade: this.quizGenData.grade, language: this.quizGenData.language,
        },
      });
    } catch (err) {
      QLogger.error(err);
      this.$toasts.add({
        type: Constants.ToastTypes.ERROR,
        title: this.$i18n('OOPS! something went wrong with this page!'),
        time: 5000,
      });
      this.$router.push('/admin');
    } finally {
      if (!this.serverData?.region) {
        const result = await fetch(`${URLS.API_SERVER[getEnvironmentEnv()]}/_geo/location`);
        const data = await result.json();
        if (data?.data?.region) {
          this.$store.dispatch('root/setUserRegion', data?.data?.region);
        }
      }

      if (this.canShowStandardTaggingForAllQuestions()) {
        this.showStandardTagNudge = true;
      }
      this.isPageLoading = false;
    }

    this.questionEditorStyles = { width: this.deviceProps.width, height: this.deviceProps.height };

    FontService.loadFont(Fonts.Quicksand);
  },

  mounted() {
    // events
    this.$analytics.logEvent(this.$webEvents.QUIZ_EDITOR_OPENED, {
      quizId: this.quizId && this.quizId.length ? this.quizId : this.$route.params.id,
    });
    this.showTagAllReminderEvent = once(() => {
      this.$analytics.logEvent(this.$webEvents.STANDARD_TAG_ALL_REMINDER_SHOWN, {
        userId: this.$user.userStore.id,
        quizId: this.quizId,
      });
    });

    this.listOfQuestions = this.questionsToShow;

    handleFocusRings(window);

    this.$eventBus.$on('editor:createNewQuestion', this.addNewQuestion);

    this.$eventBus.$on('presentationEditor:showImageUpload', this.presentationEditor_showImageUpload);
    this.$eventBus.$on('presentationEditor:showAudioUpload', this.presentationEditor_showAudioUpload);
    this.$eventBus.$on('presentationEditor:showVideoUpload', this.presentationEditor_showVideoUpload);
    this.$eventBus.$on('presentationEditor:showMathEditor', this.presentationEditor_showMathEditor);
    this.$eventBus.$on('presentationEditor:publishModalImageSearch', this.presentationEditor_publishModalImageSearch);
    this.$eventBus.$on('mathRenderEle:clicked', this.mathRenderEle_clicked);
    this.$eventBus.$on('questionToolbar:openTopicTagModal', this.openTopicTagModal);
    this.$eventBus.$on('questionToolbar:onQuickTagClick', this.onQuickTagClick);
    this.$eventBus.$on('questionEditor:toggleQuestionTypeInfoPeekaboo', this.toggleQuestionTypeInfoPeekaboo);
    this.$eventBus.$on('presentationEditor:showDrawCanvasEditor', this.showDrawCanvasEditor);
    this.$eventBus.$on('continueWithoutSuperQuestions', this.continueWithoutSuperQuestions);
    this.$eventBus.$on('redirect_to_pricing_page', this.onRedirectingToPricingPage);
    this.$eventBus.$on('editor:promptGameModal', this.togglePromptGameModal);

    document.documentElement.addEventListener('keydown', this.handleOnDocumentKeydown);

    this.sortedQuestions?.forEach((question) => {
      if (question.standardIds?.length > 0) {
        this.firstStandardTaggedQuestion = question._id;
      }
    });

    if (this.$route.query?.importFromSheet) {
      this.importSpreadsheetNoQuestionsClick();
      const { query } = this.$route;
      delete query.importFromSheet;
      this.$router.replace(this.$route.path, query);
    }

    window.addEventListener('paste', this.handleGlobalImageUpload);
  },

  beforeUnmount() {
    stopHandlingFocusRings();
    // Since now editor for mobile will be on separate page, so we don't want to run below logic on mobile
    this.isDesktop && this.$store.dispatch('contentEditor/selectSlideById', '');

    this.showSwitchingModalTimeOut && clearTimeout(this.showSwitchingModalTimeOut);

    this.$eventBus.$off('presentationEditor:showImageUpload', this.presentationEditor_showImageUpload);
    this.$eventBus.$off('presentationEditor:showVideoUpload', this.presentationEditor_showVideoUpload);
    this.$eventBus.$off('presentationEditor:showAudioUpload', this.presentationEditor_showAudioUpload);
    this.$eventBus.$off('presentationEditor:showMathEditor', this.presentationEditor_showMathEditor);
    this.$eventBus.$off('presentationEditor:publishModalImageSearch', this.presentationEditor_publishModalImageSearch);
    this.$eventBus.$off('mathRenderEle:clicked', this.mathRenderEle_clicked);
    this.$eventBus.$off('questionToolbar:openTopicTagModal', this.openTopicTagModal);
    this.$eventBus.$off('questionToolbar:onQuickTagClick', this.onQuickTagClick);
    this.$eventBus.$off('questionEditor:toggleQuestionTypeInfoPeekaboo', this.toggleQuestionTypeInfoPeekaboo);
    this.$eventBus.$off('presentationEditor:showDrawCanvasEditor', this.showDrawCanvasEditor);
    this.$eventBus.$off('continueWithoutSuperQuestions', this.continueWithoutSuperQuestions);
    this.$eventBus.$off('redirect_to_pricing_page', this.onRedirectingToPricingPage);
    this.$eventBus.$off('editor:createNewQuestion', this.addNewQuestion);
    this.$eventBus.$off('editor:promptGameModal', this.togglePromptGameModal);

    this.$store.dispatch('root/setHelpButtonOffset', { x: 0, y: 0 });
    this.$store.dispatch('root/setHelpButtonTheme', 'light');

    window.removeEventListener('paste', this.handleGlobalImageUpload);
  },

  methods: {
    toggleNewQuestionList() {
      this.showNewQuestionList = !this.showNewQuestionList;
    },

    handleCloseGenerateQuizClick() {
      this.showAIQuizGenModal = false;
    },

    openQuizGeneratorModal(source) {
      this.sourceForQuizGenModal = source;
      this.showAIQuizGenModal = true;
      this.showBulkImportModal = false;
    },

    handleCloseQuestionPreview() {
      this.showQuestionPreviewOnQtypeVisibilityList = false;
      this.showQuizPreview = false;
      this.toggleQuestionPreviewOnEditor({
        shouldShowQuestionPreview: false,
      });
    },

    useTemplateClick(currentQuestion) {
      this.$analytics.logEvent(this.$webEvents.QTYPE_VISIBILITY_USE_TEMPLATE_BTN_CLICKED, {
        quizId: this.quizId,
        questionType: currentQuestion.type,
      });
      const _currentQuestion = Question(currentQuestion);
      this.$store.dispatch('slideEditor/setSlide', { slide: _currentQuestion });
      const _id = ObjectId().toHexString();
      this.$store.dispatch('slideEditor/updateQuestionId', { id: _id });
      this.showQuizPreview = false;
      this.showNewQuestionList = false;
      this.showQuestionPreviewOnQtypeVisibilityList = false;
    },

    handleQuestionTypeClickForPreview(index) {
      this.questionPreviewIndex = index;
      this.showQuestionPreviewOnQtypeVisibilityList = true;
      this.showQuizPreview = true;
    },

    handleOtherPlatformsImport(platform) {
      switch (platform) {
        case 'spreadsheet':
          this.importSpreadsheetNoQuestionsClick();
          break;
        case 'googleForm':
          this.handleImportGoogleForms();
          break;
        default:
          break;
      }
    },

    ...mapActions({
      toggleQuestionPreviewOnEditor: 'uiManager/toggleQuestionPreviewOnEditor',
      setQuizGenFilters: 'contentEditor/setQuizGenFilters',
    }),

    async handleGlobalImageUpload(pasteEvent) {
      const item = pasteEvent.clipboardData.items[0];

      if (!item) {
        return;
      }

      if (item.type.includes('image')) {
        const eventName = this.$webEvents.getQuizEditorEvent(this.quizType, this.$webEvents.EDITOR_IMAGE_PASTE_INTENT);
        this.$analytics.logEvent(
          eventName,
          {
            quizId: this.quizId,
          },
        );
      }

      const isMediaPastingEnabled = [this.$constants.QuestionTypes.DND_IMAGE, this.$constants.QuestionTypes.HOTSPOT].includes(this.currentSlide?.type);
      if (!isMediaPastingEnabled) {
        return;
      }

      if (item.type.includes('image')) {
        const blob = item.getAsFile();

        if (this.$fileUpload.doesFileExceed5MB(blob)) {
          this.$toasts.add({
            type: this.$constants.ToastTypes.ERROR,
            icon: 'fas fa-times-circle',
            title: this.$i18n('File size should not exceed 5MB'),
          });
          return;
        }

        this.$store.dispatch('contentEditor/setClipboardState', {
          loading: true,
        });

        try {
          const response = await this.$fileUpload.uploadFileToS3(blob, {
            destination: this.$constants.ImageUploadTypes.QUIZZES,
          });

          if (response) {
            this.$store.dispatch('contentEditor/setClipboardState', {
              loading: false,
              url: response,
            });
          }
        } catch (error) {
          this.$toasts.add({
            type: this.$constants.ToastTypes.ERROR,
            icon: 'fas fa-times-circle',
            title: this.$i18n('Upload failed. Please try again.'),
          });
        }
      }
    },

    handleBulkImportQuestion() {
      if (this.isFlaggedCorporateUser) {
        this.$analytics.logEvent(this.$webEvents.QFW_EDITOR_IMPORT_CLICKED);
      }
      this.showBulkImportModal = true;
    },

    togglePromptGameModal() {
      this.showPromptForGameModal = !this.showPromptForGameModal;
      this.showPublishModal = false;
    },

    handleBulkImport() {
      this.showBulkImportModal = false;
      this.isBulkImportTriggered = true;
      this.showImportQuizToLessonModal = true;
    },

    closeBulkImportQuestionModal() {
      this.showBulkImportModal = false;
    },

    handleAddMoreQuestions(index) {
      this.$store.dispatch('analyticsManager/addBreadcrumb', 'Q:AutoAdd');
      this.addnewquestionsIndex = index;
      this.showAddMoreQuestionsModal = true;

      this.$analytics.logEvent(this.$webEvents.QUIZ_GEN_ADD_QUESTIONS_AUTOMATICALLY_BTN_CLICKED, {
        quizId: this.quizId,
      });
    },

    toggleQuizGenerator({ shouldShow }) {
      this.showQuizGen = shouldShow;
    },
    closeStandardTaggingNudge() {
      this.updateStandardAdoptionInLocalStorage(this.currentQuiz._id, 'showStandardTagNudge');
      this.showStandardTagNudge = false;
    },
    closeShowTagAllNudge() {
      this.$analytics.logEvent(this.$webEvents.STANDARD_TAG_ALL_OTHER_QUESTION_DISMISS_CLICKED, {
        userId: this.$user.userStore.id,
        quizId: this.quizId,
      });
      this.updateStandardAdoptionInLocalStorage(this.currentQuiz._id, 'showTagAllNudge');
      this.showTagAllNudge = false;
    },

    closeShowTaggingReminderNudge() {
      this.$analytics.logEvent(this.$webEvents.STANDARD_TAG_ALL_REMINDER_DISMISS_CLICKED, {
        userId: this.$user.userStore.id,
        quizId: this.quizId,
      });
      this.updateStandardAdoptionInLocalStorage(this.currentQuiz._id, 'showTaggingReminderNudge');
      this.showTaggingReminderNudge = false;
    },

    updateStandardAdoptionInLocalStorage(quizId, dismissedNudgeName) {
      const dismissedStandarsAdoptionNudges = LocalStorage.getItem('standardsAdoptionNudgesState');
      const timeStamp = this.$dayjs();
      if (!dismissedStandarsAdoptionNudges) {
        const standardsNudgesStatus = {};
        standardsNudgesStatus[quizId] = [{ [dismissedNudgeName]: timeStamp }];
        LocalStorage.setItem('standardsAdoptionNudgesState', standardsNudgesStatus);
      } else {
        const standardsNudgesStatus = dismissedStandarsAdoptionNudges;
        if (standardsNudgesStatus[quizId]) {
          let dismissedNudgeNameAlreadyPresent = false;
          standardsNudgesStatus[quizId].forEach((data) => {
            if (data[dismissedNudgeName]) {
              dismissedNudgeNameAlreadyPresent = true;
            }
          });
          if (dismissedNudgeNameAlreadyPresent) {
            return;
          }
          standardsNudgesStatus[quizId] = [...standardsNudgesStatus[quizId], { [dismissedNudgeName]: timeStamp }];
        } else {
          standardsNudgesStatus[quizId] = [{ [dismissedNudgeName]: timeStamp }];
        }
        LocalStorage.setItem('standardsAdoptionNudgesState', standardsNudgesStatus);
      }
    },

    checkStandardAdoptionInLocalStorage(quizId, nudgeName) {
      const dismissedStandarsAdoptionNudges = LocalStorage.getItem('standardsAdoptionNudgesState');
      if (!dismissedStandarsAdoptionNudges) {
        return false;
      }
      const questionKeyData = dismissedStandarsAdoptionNudges[quizId];
      if (!questionKeyData) {
        return false;
      }

      let isNudgeDismissed = false;
      const updatedQuestionKeyData = questionKeyData.filter((nudgeState, index) => {
        if (nudgeState[nudgeName]) {
          isNudgeDismissed = true;
          const nudgeStateData = nudgeState[nudgeName];
          const dateNow = this.$dayjs();
          const dayDiffrence = dateNow.diff(nudgeStateData, 'day');
          isNudgeDismissed = dayDiffrence < 30;
        }
        return true;
      });
      dismissedStandarsAdoptionNudges[quizId] = updatedQuestionKeyData;
      LocalStorage.setItem('standardsAdoptionNudgesState', dismissedStandarsAdoptionNudges);
      return isNudgeDismissed;
    },

    openStandardTagModal() {
      this.$analytics.logEvent(this.$webEvents.STANDARD_TAG_ALL_REMINDER_VIEW_SAMPLE_CLICKED, {
        userId: this.$user.userStore.id,
        quizId: this.quizId,
      });
      this.showStandardTaggedBanner = true;
    },

    canShowStandardTaggingForAllQuestions() {
      if (this.checkStandardAdoptionInLocalStorage(this.currentQuiz._id, 'showStandardTagNudge')) {
        return false;
      }
      if (!this.$user.isPartOfAnOrganization) {
        return false;
      }

      if (!this.$user.paidOrganizations || this.$user.paidOrganizations.length === 0) {
        return false;
      }

      const paidOrgInfo = this.$user.userStore.paidOrganizations[0];

      const subject = getStandardsSubjectForRecommendation(this.quizSubjects, paidOrgInfo.state);
      const validStates = ['Arkansas',
        'Colorado',
        'Connecticut',
        'District of Columbia',
        'Delaware',
        'Hawaii',
        'Idaho',
        'Illinois',
        'Iowa',
        'Kentucky',
        'Maine',
        'Maryland',
        'Michigan',
        'Montana',
        'Nevada',
        'New Hampshire',
        'New Mexico',
        'North Carolina',
        'Ohio',
        'Oregon',
        'Rhode Island',
        'South Dakota',
        'Tennessee',
        'Utah',
        'Vermont',
        'Washington',
        'West Virginia',
        'Wisconsin',
        'Wyoming',
        'Texas',
        'New York',
        'Virginia',
        'Georgia',
        'California'];
      if (!paidOrgInfo || subject.length === 0) {
        return false;
      }

      if (!(validStates.includes(getStateNameInUs(paidOrgInfo.state)))) {
        return false;
      }

      let isAnyQuestionTagged = false;
      this.sortedQuestions.forEach((question) => {
        if (question.standardIds?.length > 0) {
          isAnyQuestionTagged = true;
        }
      });

      if (this.sortedQuestions.length <= 1) {
        return false;
      }
      let isValidGrade = false;
      const quizGradesList = new Set(this.quizGrades);
      if (quizGradesList.size > 1) {
        return false;
      }
      quizGradesList?.forEach((grade) => {
        const validGrades = [1, 2, 3, 4, 5, 6, 7, 8];
        if (validGrades.includes(grade)) {
          isValidGrade = true;
        }
        if (getStateNameInUs(paidOrgInfo.state) === 'Texas' && grade === 9) {
          isValidGrade = true;
        }
      });
      if (!isAnyQuestionTagged && subject.length > 0 && isValidGrade) {
        this.$analytics.logEvent(this.$webEvents.STANDARD_TAG_ALL_NUDGE_SHOWN, {
          userId: this.$user.userStore.id,
          quizId: this.quizId,
          state: getStateNameInUs(paidOrgInfo.state),
          subject,
        });
      }
      return !isAnyQuestionTagged && subject.length > 0 && isValidGrade;
    },

    tagAllLogEvent(topic) {
      let numberOfQuestionsTagged = 0;
      let numberOfUntaggedQuestions = 0;
      this.sortedQuestions?.forEach((question) => {
        let isThisQuestionAlreadyTaggedWithThisTopic = false;
        if (question.standardIds?.length === 0) {
          numberOfUntaggedQuestions += 1;
        }
        question.standardIds?.forEach((standard) => {
          if (standard.id === topic.id) {
            isThisQuestionAlreadyTaggedWithThisTopic = true;
          }
        });
        if (!isThisQuestionAlreadyTaggedWithThisTopic) {
          numberOfQuestionsTagged += 1;
        }
      });
      this.$analytics.logEvent(this.$webEvents.STANDARD_TAG_ALL_OTHER_QUESTION_TAG_ALL_CLICKED, {
        userId: this.$user.userStore.id,
        quizId: this.quizId,
        short_code: topic.short_code,
        topicId: topic._id,
        questions: this.sortedQuestions?.map((question) => question._id),
        numberOfQuestionsTagged,
        numberOfUntaggedQuestions,
      });
    },

    tagAllQuestions(topic) {
      this.tagAllLogEvent(topic);

      this.sortedQuestions?.forEach((question) => {
        const topicForTagging = topic;
        topicForTagging.id = question._id;
        topicForTagging.topic = topicForTagging.short_code;
        this.taggingLoader = true;
        this.allQuestionsTagged = false;
        let isThisQuestionAlreadyTaggedWithThisTopic = false;
        question.standardIds?.forEach((standard) => {
          if (standard.id === topic.id) {
            isThisQuestionAlreadyTaggedWithThisTopic = true;
          }
        });
        const endLoading = () => {
          this.taggingLoader = false;
          this.allQuestionsTagged = true;
          this.showTagAllNudge = false;
        };

        if (!isThisQuestionAlreadyTaggedWithThisTopic) {
          setTimeout(() => {
            this.saveQuestionTopicsById(question._id, [topic.short_code], [topic], endLoading);
          }, 200);
        }
      });
    },

    canShowTagAllNudge(index, questionId) {
      if (this.areAllQuestionsTagged) {
        return false;
      }
      if (!this.$user.isPartOfAnOrganization) {
        return false;
      }
      if (this.checkStandardAdoptionInLocalStorage(this.currentQuiz._id, 'showTagAllNudge')) {
        return false;
      }
      if (this.sortedQuestions.length < 3) {
        return false;
      }
      if (!this.sortedQuestions[index].standardIds[0] && this.isAnyQuestionNotTagged === -1) {
        this.isAnyQuestionNotTagged = questionId;
        return false;
      }
      if (this.sortedQuestions[index].standardIds[0] && this.firstStandardTaggedQuestionIndex === -1) {
        this.firstStandardTaggedQuestionIndex = questionId;
      }

      return this.firstStandardTaggedQuestionIndex !== -1 && this.isAnyQuestionNotTagged !== -1;
    },

    redirectOnPublish() {
      const { query } = this.$route;

      redirectOnLeavingEditor(query, `/admin/quiz/${this.quizId}`, this.$router, this.$store);
    },

    async handlePublishQuiz(quizId = this.quizId, draftId = this.draftId, shouldNotRedirect = false) {
      if (!quizId || !draftId) {
        return;
      }
      const response = await QuizService.publish(quizId, draftId);

      if (!response.success) {
        this.$toasts.add({
          type: this.$constants.ToastTypes.ERROR,
          icon: 'fas fa-times-circle',
          title: this.$i18n('Something went wrong while publishing this quiz!'),
        });
        return;
      }

      this.$toasts.add({
        type: this.$constants.ToastTypes.SUCCESS,
        icon: 'fas fa-check-circle',
        title: this.$i18n('Quiz published successfully!'),
      });

      if (shouldNotRedirect) {
        // resetting quiz editor state after publishing
        this.$store.dispatch('contentEditor/resetQuiz');
        return;
      }

      this.redirectOnPublish();
    },

    getValues(questionTypesList) {
      return values(questionTypesList);
    },
    handleEditorExitBehaviour(isUserLeaving = true) {
      this.isLeavingFromEditorAllowed = isUserLeaving;
      if (isUserLeaving) {
        if (this.redirectingToPricingPage) {
          this.redirectingToPricingPage = false;
          this.$router.push(`/super-pricing?backto=${encodeURIComponent(this.$route.path)}&redirectTo=${encodeURIComponent(this.$route.path)}&variant=${encodeURIComponent(this.$constants.SuperUpsellTypes.UPGRADE_TO_PUBLISH_QUIZ_WITH_SUPER_QUESTIONS)}&source=${encodeURIComponent('questionEditor')}&feat=superQuestionPassiveNudge_quizEditor`);
          return;
        }
        this.$router.push('/admin/private');
        return;
      }

      this.showSaveBeforeLeaveModel = false;
    },

    onSaveDraftClick() {
      const { query } = this.$route;
      this.showSaveBeforeLeaveModel = false;
      const quizDetails = {
        name: this.draft.name,
        id: this.quiz._id,
      };

      this.overrideRouteGuard = true;
      this.$store.dispatch('contentEditor/resetQuiz');
      this.$store.dispatch('currentQuiz/resetQuiz');
      this.$router.push({ path: `/admin/quiz/${quizDetails.id}/${this.$urlUtils.toSlug(quizDetails.name || '')}`, query });
    },

    importSpreadsheetNoQuestionsClick() {
      const eventName = this.$webEvents.getQuizEditorEvent(this.quizType, this.$webEvents.IMPORT_SPREADSHEET_BTN);
      const params = {
        quizId: this.quizId,
        buttonType: 'no questions button',
      };

      if (this.isFlaggedCorporateUser) {
        params.source = 'quizEditor';
      }

      this.$analytics.logEvent(eventName, params);

      this.toggleImportModal();
    },

    pasteUrlButtonClick(isPasteUrlEnabled) {
      if (isPasteUrlEnabled) {
        this.imageUploadModalTitle = this.$i18n('Paste URL to an image');
      } else {
        this.imageUploadModalTitle = '';
      }

      this.isPasteUrlEnabled = isPasteUrlEnabled;
    },

    addQuestion({ type }) {
      this.$store.dispatch('analyticsManager/addQuestionInstanceEnrichmentData');
      const eventName = this.$webEvents.getQuizEditorEvent(this.quiz.type, this.$webEvents.EDITOR_QUESTION_CREATE);
      const afterIndex = this.addQuestionAtIndex;
      this.showNewQuestionList = false;
      this.$analytics.logEvent(
        eventName,
        {
          draftId: this.draft._id,
          questionType: type,
          quizId: this.quizId,
          source: 'select_q_type_icon',
          screen: 'quizEditor',
          atIndex: afterIndex,
          isPremium: this.isQuestionTypeSuperType(type),
        },
      );

      if (type === this.$constants.QuestionTypes.MATCH || type === this.$constants.QuestionTypes.REORDER) {
        HotjarService.triggerEvent(HotjarEvents.HOTJAR_MATCH_REORDER_CREATE);
      }

      if (type === this.$constants.QuestionTypes.DRAGNDROP || type === this.$constants.QuestionTypes.DROPDOWN) {
        HotjarService.triggerEvent(HotjarEvents.HOTJAR_DND_CREATE);
      }

      if (type === this.$constants.QuestionTypes.EQUATION) {
        this.$router.push({ query: { question_type: 'math_response' } });
        HotjarService.triggerEvent(HotjarEvents.HOTJAR_MATH_RESPONSE_CREATE);
      }

      this.addNewQuestion({ type, afterIndex });
    },

    isQuestionTypeSuperType(questionType) {
      return isQuestionTypeSuperType(questionType);
    },

    onQuestionAddMobile() {
      if (this.isQuestionLimitReached) {
        this.toggleQuestionLimitModal();
        return;
      }
      this.showNewQuestionList = true;
    },

    async handleDiscardQuiz(quizId = this.quizId, shouldNotRedirect = false) {
      if (!quizId) {
        return;
      }

      this.isDiscardingQuiz = true;

      const response = await QuizService.deleteQuiz(quizId);

      // reset quiz editor state post deletion
      this.$store.dispatch('contentEditor/resetQuiz');

      if (response.success) {
        this.isDiscardingQuiz = false;
        this.askForExitConfirmation = false;

        const { query } = this.$route;
        this.overrideRouteGuard = true;

        if (!shouldNotRedirect) {
          redirectOnLeavingEditor(query, '/admin', this.$router, this.$store);
        }

        this.$toasts.add({
          type: Constants.ToastTypes.ERROR,
          title: this.$i18n('The quiz has been deleted since it had no questions'),
        });
      }
    },

    handleWarningModalClose() {
      this.showNoQuestionsModal = false;
    },

    onRedirectToOldQuizEditor(source = '', showSwitchingModal = true, quizId = this.quizId) {
      const params = {};

      LocalStorage.setItem('sNewQE', false);

      if (source) {
        params.source = source;
      }

      this.$analytics.logEvent(this.$webEvents.GO_BACK_TO_OLD_EDITOR, params);

      if (!showSwitchingModal) {
        window.location = `/quiz/${quizId}/edit?from=newEditor`;
      } else {
        this.showSwitchingToOldQuizEditorModal = true;

        this.showSwitchingModalTimeOut = setTimeout(() => {
          this.showSwitchingToOldQuizEditorModal = false;

          window.location = `/quiz/${quizId}/edit?from=newEditor`;
        }, 1000);
      }
    },

    handleConcurrentSessions(isPublishing = false) {
      if (!this.draft) {
        return;
      }

      const editorSessionData = JSON.parse(localStorage.getItem('qEdSe') ?? '{}');

      const session = editorSessionData[this.quizId];

      if (session && session.id !== this.draft._id) {
        if (this.$dayjs(this.draft.createdAt).isBefore(session.editedAt)) {
          return;
        }
      }

      editorSessionData[this.quizId] = {
        id: isPublishing ? null : this.draft._id,
        editedAt: isPublishing ? this.$dayjs() : this.draft.createdAt,
      };

      // cleaning sessions which are older than 10 days
      const sessionIds = Object.keys(editorSessionData);
      for (const sessionId of sessionIds) {
        if (this.$dayjs(editorSessionData[sessionId].editedAt).isBefore(this.$dayjs().subtract(10, 'days'))) {
          delete editorSessionData[sessionId];
        }
      }

      localStorage.setItem('qEdSe', JSON.stringify(editorSessionData));
    },

    checkAndRedirectToQuizEditor(quizId) {
      const isOnMobileDevice = this.deviceProps.type === this.$constants.DeviceTypes.PHONE;

      if (isOnMobileDevice && this.canShowNewQuizEditor) {
        this.onRedirectToOldQuizEditor('mobileForced', false, quizId);

        return;
      }

      if (!this.canShowNewQuizEditor) {
        // window.location.href = `/quiz/${quizId}/edit`;
      }
    },

    handlePublishModalClose() {
      this.showPublishModal = false;
      this.imageModalSearchTerm = '';
      this.imageUploadModalTitle = '';
    },

    getQuestionTopics(questionId) {
      const question = this.getQuestionById(questionId);

      if (this.isASlideBeingEdited) {
        return this.currentSlide.topics;
      }

      if (!question) {
        return this.questionTopics || [];
      }

      return question.topics;
    },

    getQuickTag(questions, currentQuestion) {
      let quickTagArray = [];
      questions.forEach((question) => question.topics.forEach((q) => quickTagArray.push(q)));
      quickTagArray = [...new Set(quickTagArray)];
      quickTagArray = quickTagArray.filter((q) => !currentQuestion.topics.includes(q));
      return quickTagArray;
    },

    async saveQuestionTopics(topics, standards = []) {
      if (this.isASlideBeingEdited) {
        this.$store.dispatch('slideEditor/updateQuestionTopics', { topics });
      } else {
        try {
          await this.updateQuestion(this.selectedQuestionId, { topics }, standards);
        } catch (error) {
        }
      }

      this.$eventBus.$emit('questionEditor:addQuestionTopics', { questionId: this.selectedQuestionId, topics });
      if (topics?.length > 0) {
        this.$analytics.logEvent(this.$webEvents.STANDARD_TAGGED, {});
      } else {
        this.$analytics.logEvent(this.$webEvents.NO_STANDARD_TAGGED, {});
      }

      this.closeTopicTagModal();
    },

    async saveQuestionTopicsById(questionId, topics, standards = [], endCall) {
      if (this.isASlideBeingEdited) {
        this.$store.dispatch('slideEditor/updateQuestionTopics', { topics });
      } else {
        try {
          await this.updateQuestion(questionId, { topics }, standards);
        } catch (error) {
          QLogger.error('Error saving topic tags', error);
        }
      }

      this.$eventBus.$emit('questionEditor:addQuestionTopics', { questionId: this.selectedQuestionId, topics });
      if (topics?.length > 0) {
        this.$analytics.logEvent(this.$webEvents.STANDARD_TAGGED, {});
      } else {
        this.$analytics.logEvent(this.$webEvents.NO_STANDARD_TAGGED, {});
      }
      endCall();
    },

    closeTopicTagModal() {
      this.selectedQuestionId = '';
      this.showQuestionTopicTagger = false;
    },

    openTopicTagModal(qid) {
      if (!hasFeatureAccess(this.$constants.FeatureTypes.TOPIC_TAGS) && !this.isCorporateUser) {
        this.$eventBus.$emit('sndUpsell:open', {
          feat: this.$constants.FeatureTypes.TOPIC_TAGS,
          media: {
            img: 'https://cf.quizizz.com/img/presentation/standards_overview.gif',
          },
        });
        return;
      }

      if (this.isUserPaidOrg && this.showCurriculumSelection && !(get(this.$user, 'preferences.curriculum.default', null) || get(this.$user, 'preferences.curriculum.org', null)) && !this.getCurriculum) {
        this.showCurriculumSelectionModal = true;
        return;
      }

      this.selectedQuestionId = qid;
      this.showQuestionTopicTagger = true;
    },

    async onQuickTagClick(topic, endCall) {
      await this.updateQuestion(topic.id, { topics: [topic.topic], qTag: true });
      endCall();
    },

    getQuestionIndex(qid) {
      return this.sortedQuestions?.findIndex((q) => q._id === qid);
    },

    handleDragChange({ oldIndex, newIndex }) {
      const newList = [];

      if (oldIndex < newIndex) {
        this.moveCardDownward({
          newList, oldList: this.reorderQuestionsList, oldIndex, newIndex,
        });
      } else {
        this.moveCardUpward({
          newList, oldList: this.reorderQuestionsList, oldIndex, newIndex,
        });
      }

      this.haveQuestionsBeenReordered = true;
      this.reorderQuestionsList = newList;
    },

    moveCardDownward({
      newList, oldList, oldIndex, newIndex,
    }) {
      for (let i = 0; i < oldIndex; i++) {
        newList[i] = oldList[i];
      }

      for (let j = oldIndex + 1; j <= newIndex; j++) {
        newList[j - 1] = oldList[j];
      }

      newList[newIndex] = oldList[oldIndex];

      for (let k = newIndex + 1; k < oldList.length; k++) {
        newList[k] = oldList[k];
      }
    },

    moveCardUpward({
      newList, oldList, oldIndex, newIndex,
    }) {
      for (let i = 0; i < newIndex; i++) {
        newList[i] = oldList[i];
      }

      newList[newIndex] = oldList[oldIndex];

      for (let j = newIndex; j < oldIndex; j++) {
        newList[j + 1] = oldList[j];
      }

      for (let k = oldIndex + 1; k < oldList.length; k++) {
        newList[k] = oldList[k];
      }
    },

    onChangeCurrentState(state) {
      this.currentState = state;
    },

    async onQuestionsReordered() {
      const reorderList = this.reorderQuestionsList?.map((pos, index) => ({ ...pos, currentIndex: index }));
      const quesAtSamePositionCount = countBy(reorderList, ({ originalIndex, currentIndex }) => originalIndex === currentIndex);
      const didNoQuestionChangePosition = quesAtSamePositionCount.true === this.questionsToShow.length;
      const moveToEditState = () => {
        this.isUpdateReorderQuestionsInProgress = false;
        this.currentState = 'edit';
        this.reorderQuestionsList = [];
      };

      if (didNoQuestionChangePosition) {
        moveToEditState();
        return;
      }

      this.isUpdateReorderQuestionsInProgress = true;

      const questionIds = this.questionsToShow.map((q) => q._id);
      const oldQuestionIds = this.sortedQuestions.map((q) => q._id);

      const eventName = this.$webEvents.getQuizEditorEvent(Constants.ContentType.QUIZ, this.$webEvents.EDITOR_REORDER_SAVE);
      this.$analytics.logEvent(eventName, {
        quizId: this.quizId,
        versionId: this.versionId,
        questionIds,
        oldQuestionIds,
        diff: oldQuestionIds.length - questionIds.length,
      });

      await this.$store.dispatch('contentEditor/reorderQuizQuestions', this.questionsToShow);

      moveToEditState();
    },

    questionTime(question) {
      return question.time;
    },

    questionCorrectPoints(question) {
      return getQuestionDefaultMarks(question);
    },

    async onQuizUpdate() {
      this.showPreCreateModal = false;
      this.loading = true;
      let quiz = await QuizService.getQuiz(this.$route.params.id);

      if (!quiz.draft) {
        quiz = await QuizService.makeQuizEditableAgain(this.$route.params.id);
      }

      this.$store.dispatch('contentEditor/setQuiz', { quiz, editorForContentType: Constants.ContentType.QUIZ });

      this.loading = false;
    },

    toggleImportModal() {
      this.showImportSpreadsheetModal = !this.showImportSpreadsheetModal;
    },

    toggleQuestionLimitModal() {
      this.showQuestionLimitDisclaimer = !this.showQuestionLimitDisclaimer;
    },

    togglePrecreateModal() {
      this.showPreCreateModal = !this.showPreCreateModal;
    },
    /**
     * If the search term in updated in teleport view, then it is updated here as well so that the input in
     * addNewSlide also has the same term
     */
    updateSearchTerm(term) {
      this.teleportSearchTerm = term;
    },

    setAwaitingPublish(isAwaitingPublish) {
      const eventName = this.$webEvents.SAVE_QUIZ;
      this.$analytics.logEvent(eventName, {
        userId: this.$user.id,
        quizId: this.$route.params.id,
        isQuizPremium: this.isQuizPremium,
      });
      if (this.$user.occupation === 'corporate_teacher') {
        HotjarService.triggerEvent(HotjarEvents.QFW_SAVE_QUIZ);
      }
      this.isAwaitingPublish = isAwaitingPublish;
    },

    togglePublishModal(didClickSettings) {
      const questionTypesWithCount = this.getSuperQuestionTypesUsed().map((questionType) => {
        let count = 0;
        this.questionsToShow.forEach((question) => {
          if (question.type === questionType) {
            count += 1;
          }
        });
        return {
          type: questionType,
          count,
        };
      });
      this.didClickSettings = didClickSettings;

      if (this.shouldShowSuperQuestionBanner) {
        const upsellParams = {
          type: this.$constants.SuperUpsellTypes.UPGRADE_TO_PUBLISH_QUIZ_WITH_SUPER_QUESTIONS,
          options: {
            feat: this.$constants.FeatureTypes.SUPER_QUESTION_SAVE_MODAL,
            isQuizPremium: this.isQuizPremium,
            featureInfo: this.getSuperQuestionTypesFeatureInfo(),
            variant: getVariantNameForSuperQuestionsUsed(questionTypesWithCount),
          },
        };

        if (this.canPromoteReferral) {
          return this.$eventBus.$emit('superUpsellReferral:show', upsellParams);
        }
        return this.$eventBus.$emit('superUpsell:show', upsellParams);
      }

      this.showPublishModal = true;
    },

    addNewQuestionFromTeleport(data) {
      this.teleportQuestionData = data.question;
      this.shouldAddMultipleTeleportQuestions = false;
      this.isAddingTeleportInProgress = true;

      if (this.isDesktop) {
        this.startCircleAnimation(data);
        return;
      }

      this.callAddNewQuestion();
    },

    addAllQuestionsFromTeleport(data) {
      this.teleportQuestionData = data.questions;
      this.shouldAddMultipleTeleportQuestions = true;
      this.isAddingTeleportInProgress = true;
      this.isBulkAddingTeleportInProgress = true;

      if (this.isDesktop) {
        this.startCircleAnimation(data);
        return;
      }

      this.callAddNewQuestion();
    },

    async startCircleAnimation(data) {
      const { addButtonRef } = data;
      const addButtonData = addButtonRef.getBoundingClientRect();
      const topContainerRef = this.$refs.quizEditorTopContainer;

      let endTop = 146;
      let endLeft = 312;

      if (this.sortedQuestions.length === 0) {
        if (!isEmpty(topContainerRef)) {
          const topContainerData = topContainerRef.$el.getBoundingClientRect();

          endTop = topContainerData.top + topContainerData.height + 32;
          endLeft = topContainerData.left + 60;
        }
      } else {
        const lastQuestionId = this.questionsToShow[this.questionsToShow.length - 1]._id;
        const cardToScrollTo = this.$refs[`questionDetailCards_${lastQuestionId}`];

        this.$nextTick(() => {
          this.$scrollTo(cardToScrollTo.$el, 0);
        });

        const lastQuestionData = cardToScrollTo.$el.getBoundingClientRect();

        endTop = lastQuestionData.top + lastQuestionData.height - 60;
        endLeft = lastQuestionData.left + 60;
      }

      const startTop = addButtonData.top;
      const startLeft = addButtonData.left;

      this.teleportAnimationCicle.start[0] = startTop;
      this.teleportAnimationCicle.start[1] = startLeft;

      this.teleportAnimationCicle.end[0] = endTop;
      this.teleportAnimationCicle.end[1] = endLeft;

      this.showTeleportCircle = true;

      this.hideTeleportAnimationCircleTimeout = setTimeout(() => {
        this.showTeleportCircle = false;

        const url = new URL(window.location.href);
        if (!url.search.includes('teleported')) {
          url.searchParams.append('teleported', true);
          this.$router.replace(url.pathname + url.search);
        }
      }, 100);
    },

    beforeEnterTeleportAnimationCircle(el) {
      /**
       * Initial position of circle is at the position of the add button on teleport slider
      */
      el.style.top = `${this.teleportAnimationCicle.start[0]}px`;
      el.style.left = `${this.teleportAnimationCicle.start[1]}px`;
    },

    onleaveTeleportAnimationCircle(el, done) {
      /**
       * Final position of circle is at the position of the last selected slidePreview
      */
      const self = this;

      el.style.transition = 'all 0.4s ease-in-out';
      el.style.top = `${this.teleportAnimationCicle.end[0]}px`;
      el.style.left = `${this.teleportAnimationCicle.end[1]}px`;

      this.teleportAnimationCircleEndTimeout = setTimeout(async () => {
        await self.callAddNewQuestion();

        done();

        const lastQuestionId = this.questionsToShow[this.questionsToShow.length - 1]._id;
        const cardToScrollTo = this.$refs[`questionDetailCards_${lastQuestionId}`];

        self.$scrollTo(cardToScrollTo.$el);
      }, 500);
    },

    async callAddNewQuestion() {
      if (this.shouldAddMultipleTeleportQuestions) {
        const params = {};
        if (this.isGoogleWidgetTranslated) {
          params.translationLocale = this.googleWebsiteTranslatedLanguage;
        }

        const result = await this.$store.dispatch('contentEditor/createMultipleQuizQuestion', { questions: this.teleportQuestionData, params });

        if (!result.success) {
          this.$toasts.add({
            type: Constants.ToastTypes.ERROR,
            title: this.$i18n('Unable to add questions. Please try again.'),
            time: 5000,
          });
        } else {
          this.$toasts.add({
            type: Constants.ToastTypes.DEFAULT,
            title: this.$i18n('Questions added to your quiz'),
            time: 5000,
          });
        }

        this.isBulkAddingTeleportInProgress = false;
      } else {
        const params = {};
        if (this.isGoogleWidgetTranslated) {
          params.translationLocale = this.googleWebsiteTranslatedLanguage;
        }

        const result = await this.$store.dispatch('contentEditor/teleportQuizQuestion', { question: this.teleportQuestionData, params });

        if (!result.success) {
          this.$toasts.add({
            type: Constants.ToastTypes.ERROR,
            title: this.$i18n('Unable to add question. Please try again.'),
            time: 5000,
          });
        } else {
          this.$toasts.add({
            type: Constants.ToastTypes.DEFAULT,
            title: this.$i18n('Question added to your quiz'),
            time: 5000,
          });
        }
      }

      this.isAddingTeleportInProgress = false;
    },

    onSearchTeleport() {
      this.$store.dispatch('analyticsManager/addBreadcrumb', 'Q:TeleStart');
      if (this.isFlaggedCorporateUser) {
        this.$analytics.logEvent(this.$webEvents.QFW_EDITOR_QUIZ_LIBRARY_CLICKED);
        const eventName = this.$webEvents.getQuizEditorEvent(this.$constants.ContentType.QUIZ, this.$webEvents.EDITOR_TELEPORT_SEARCH);
        this.$analytics.logEvent(eventName, {
          term: this.teleportSearchTerm,
          quizId: this.quizId,
          source: 'qfw_create_flow_editor',
        });
      }
      this.showTeleport = true;
    },

    closeTeleport() {
      this.$store.dispatch('analyticsManager/addBreadcrumb', 'Q:TeleClose');
      if (this.showTeleport) {
        this.showTeleport = false;
      }
    },

    async checkUserPermissions(quiz) {
      if (isString(quiz)) {
        switch (quiz) {
          case 'user.ACCESS_NOT_ALLOWED':
            this.showAccessNotAllowedModal = true;
            break;
          default:
            this.showAccessNotAllowedModal = true;
        }

        return false;
      }

      if (!quiz) {
        this.$router.push('/404');
        return false;
      }

      const quizPerms = await ResourcePermissionsService.getPermissions({
        id: quiz._id,
        creatorId: quiz.createdBy._id,
        type: Constants.ContentType.QUIZ,
      });

      this.quizPerms = quizPerms;

      if (!quizPerms.isUserPermittedFor(this.$user, 'WRITE')) {
        this.showAccessNotAllowedModal = true;
        return false;
      }

      this.$store.dispatch('contentEditor/setQuiz', { quiz, editorForContentType: Constants.ContentType.QUIZ });

      try {
        const resp = await QuizService.acquireQuizEditingLock(quiz._id);
        if (resp === 'quiz.NOT_ALLOWED') {
          this.openCoEditBlockedModal('alreadyLocked');
          return false;
        }
      } catch (err) {
        return false;
      }

      return true;
    },

    addNewQuestion({ type = Constants.QuestionTypes.MCQ, afterIndex = this.questionsToShow.length, source = null }) {
      if (this.isQuestionLimitReached) {
        this.toggleQuestionLimitModal();
        return;
      }

      if (!this.isSuperUser) {
        const eventName = this.$webEvents.SELECT_QUESTION_TYPE;
        this.$analytics.logEvent(
          eventName,
          {
            userId: this.$user.id,
            quizId: this.quizId,
            questionType: type,
            isPremium: this.isQuestionTypeSuperType(type),
            screen: 'quizEditor',
            source,
          },
        );
      }

      if (includes(type, 'SLIDE')) {
        this.showImportQuizToLessonModal = true;

        const eventName = this.$webEvents.getQuizEditorEvent(this.quizType, this.$webEvents.QUIZ_EDITOR_ADD_SLIDE);
        this.$analytics.logEvent(eventName, {
          quizId: this.quizId,
          questionType: type,
        });
        return;
      }

      const question = NewSlideService.createQuestion(type);
      question.index = this.questionsToShow.length === 0 ? 0 : afterIndex + 1;
      // If default time is set to all questions, then update the time for the question with the default time.
      if (this.getDraftPreferences.time && question.time !== this.getDraftPreferences.time) {
        question.time = this.getDraftPreferences.time;
      }

      this.$store.dispatch('slideEditor/setSlide', { slide: question });
      !this.isDesktop && this.$router.push(`/quiz/creator/${this.quizId}/editor/${this.draft._id}`);
    },

    setQuestionEditorStyles() {
      const { quizEditorHeader } = this.$refs;

      if (!this.isDesktop) {
        this.questionEditorStyles = {};
        return;
      }

      const questionEditorStyles = {
        width: `${this.deviceProps.width}px`,
        height: `${this.deviceProps.visibleViewportHeight}px`,
      };

      if (quizEditorHeader) {
        questionEditorStyles.height = `${this.deviceProps.visibleViewportHeight - quizEditorHeader.$el.clientHeight}px`;
        questionEditorStyles.top = `${quizEditorHeader.$el.clientHeight}px`;
      }

      this.questionEditorStyles = questionEditorStyles;
    },

    onQuestionEdit(question, index, { shouldReplaceURL = false } = {}) {
      this.$store.dispatch('analyticsManager/addQuestionInstanceEnrichmentData');
      let questionType = question.type;
      if (isWordCloudQuestion(question)) {
        questionType = this.$constants.QuestionTypes.WORDCLOUD;
      }

      const eventName = this.$webEvents.EDIT_QUESTION;
      this.$analytics.logEvent(
        eventName,
        {
          userId: this.$user.id,
          quizId: this.quizId,
          questionType,
          questionId: question._id,
          isQuestionPremium: this.isQuestionTypeSuperType(question.type),
        },
      );
      this.$store.dispatch('contentEditor/selectSlideById', question._id);

      if (!this.isDesktop) {
        const query = {};

        if (question.type === Constants.QuestionTypes.EQUATION) {
          query.question_type = 'math_response';
        }

        if (shouldReplaceURL) {
          this.$router.replace({ path: `/quiz/creator/${this.quizId}/editor/${question._id}`, query });
        } else {
          this.$router.push({ path: `/quiz/creator/${this.quizId}/editor/${question._id}`, query });
        }
      }
    },

    async onQuestionDuplication(questionId, doneCallback) {
      // this function is specific here, as source and destination are cloneNodes with deep true.
      const cloneCanvases = (source, destination) => {
        // create a new canvas
        const sourceCanvas = source?.getElementsByTagName('canvas');
        if (sourceCanvas.length <= 0) {
          return;
        }
        const destinationCanvas = destination?.getElementsByTagName('canvas');

        for (let i = 0; i < sourceCanvas.length; i++) {
          const srcCanvas = sourceCanvas[i];
          const destCanvas = destinationCanvas[i];
          const context = destCanvas.getContext('2d');
          // set dimensions
          destCanvas.width = srcCanvas.width;
          destCanvas.height = srcCanvas.height;

          // apply the old canvas to the new one
          context.drawImage(srcCanvas, 0, 0);
        }
      };

      const totalQuestions = this.sortedQuestions.length;

      await this.$store.dispatch('contentEditor/duplicateSlideById', {
        id: questionId,
        atIndex: totalQuestions,
        shouldSelectSlide: false,
      });

      doneCallback();

      const lastQuestionId = this.questionsToShow[this.questionsToShow.length - 1]._id;

      await asyncDelay(500);

      const cardToScrollTo = this.$refs[`questionDetailCards_${lastQuestionId}`];
      cardToScrollTo.$el.style.opacity = 0;

      // Ghost Element
      const questionNode = this.$refs[`questionDetailCards_${questionId}`];

      const questionNodeEl = questionNode?.$el;
      const duplicatedHTML = questionNode?.$el.cloneNode(true);
      cloneCanvases(questionNodeEl, duplicatedHTML);
      const position = questionNodeEl.getBoundingClientRect();

      duplicatedHTML.classList.add('question-anim', 'transition-all', 'fixed', 'z-102');
      duplicatedHTML.style.width = `${questionNodeEl.offsetWidth}px`;
      duplicatedHTML.style.bottom = `${window.innerHeight - 226 - questionNodeEl.offsetHeight}px`;
      duplicatedHTML.style.left = `${position.left}px`;

      const body = document.querySelector('body');
      body.append(duplicatedHTML);

      await asyncDelay(50);

      // Bring ghost to last question placement on screen
      duplicatedHTML.style.bottom = '176px';

      // Open edit question view after duplicating question
      this.$scrollTo(cardToScrollTo.$el, 500);
      cardToScrollTo.$el.style.opacity = 1;
      duplicatedHTML.remove();

      this.$store.dispatch('contentEditor/selectSlideById', lastQuestionId);
      if (this.isMobile) {
        this.$router.push(`/quiz/creator/${this.quizId}/editor/${this.draft._id}`);
      }
    },

    async onQuestionDeletion(questionId, doneCallback) {
      const eventName = this.$webEvents.getQuizEditorEvent(this.quizType, this.$webEvents.EDITOR_QUESTION_DELETE);
      this.$analytics.logEvent(eventName, {
        quizId: this.quizId,
        questionType: this.quiz.type,
        questionId,
      });

      await this.$store.dispatch('contentEditor/deleteSlideById', questionId);

      doneCallback();
    },

    async saveAutoConvertFromModal({ autoConvertMap, quizViewData }) {
      const quickEditData = quizViewData
        .filter((question) => !!autoConvertMap[question._id])
        .map((question) => ({
          questionId: question._id,
          questionBody: QuizService.addDefaultMarksToQuestion(QuizService.cleanQuizQuestion(question)),
          converted: true,
        }));

      const promises = quickEditData.map(({ questionId, questionBody }) => this.$store.dispatch('contentEditor/updateQuestion', { id: questionId, question: { ...questionBody, converted: true } }));

      const result = await Promise.all(promises);
      const success = result.every(({ success }) => !!success);

      let toastData = {
        type: this.$constants.ToastTypes.ERROR,
        icon: 'fas fa-times-circle',
        title: this.$i18n('Could not save changes. Please contact support if the issue persists.'),
      };

      if (success) {
        toastData = {
          type: this.$constants.ToastTypes.SUCCESS,
          icon: 'fas fa-check-circle',
          title: this.$i18n('Saved changes successfully.'),
        };

        if (promises.length === 1) {
          this.$eventBus.$emit('autoConvertModal:showConvertMore');
          return;
        }
      }
      return this.$toasts.add(toastData);
    },

    async updateQuestion(id, updates, standards) {
      try {
        const previousQuestion = this.getQuestionById(id);
        if (!previousQuestion) {
          this.$store.dispatch('analyticsManager/addBreadcrumb', `PQNFUQ:${id}`);
        }
        this.isAwaitingApiResponse = true;
        const question = Question({ ...previousQuestion });
        if (updates.marks === 0 || updates.marks) {
          const questionStructure = cloneDeep(question.structure);
          questionStructure.marks.correct = updates.marks;
          questionStructure.marks.incorrect = 0;
          updates.structure = questionStructure;
        }

        Object.entries(updates).forEach(([key, value]) => {
          if (question[key]) {
            question[key] = value;
          }
        });

        const tempArr = [];
        question.standardIds?.forEach((std) => {
          if (question.topics.includes(std.short_code)) { tempArr.push(std._id); }
        });
        standards?.forEach((std) => tempArr.push(std._id));
        question.standardIds = tempArr;

        const stdTags = LocalStorage.getItem('standardList');
        if (stdTags?.length > 0) {
          stdTags.forEach((q) => {
            if (question.topics.includes(q.code)) {
              question.standardIds.push(q.id);
            }
          });
        }

        let allStandards = [];
        Object.keys(this.standardIdsForQuestionIds).forEach((questionId) => {
          if (id === questionId && standards) {
            allStandards = allStandards.concat(standards);
            return;
          }
          allStandards = allStandards.concat(this.standardIdsForQuestionIds[questionId] ?? []);
        });
        // logic for quick tag
        if (updates.qTag === true) {
          this.$analytics.logEvent('quick_tag_click', {});
          const questionToUpdate = { ...this.getQuestionById(id) };
          question.topics = [...questionToUpdate.topics, ...updates.topics];
          const stdArray = [];
          allStandards.forEach((std) => {
            if (question.topics.includes(std.short_code)) {
              stdArray.push(std._id);
            }
          });
          question.standardIds = stdArray;
        }
        LocalStorage.removeItem('standardList');
        const { success } = await this.$store.dispatch('contentEditor/updateQuestion', { id, question });
        this.isAwaitingApiResponse = false;
        if (!success) {
          throw new Error('Cannot update question. Please try again.');
        }
      } catch (error) { }
    },

    async onQuestionMarksUpdation(questionId, marks, endProgress) {
      try {
        const previousQuestion = this.getQuestionById(questionId);
        if (!previousQuestion) {
          this.$store.dispatch('analyticsManager/addBreadcrumb', `PQNFQMU:${questionId}`);
        }
        const question = Question({ ...previousQuestion });

        if (marks === 0 || marks) {
          const questionStructure = cloneDeep(question.structure);
          questionStructure.marks.correct = marks;
          questionStructure.marks.incorrect = 0;
          question.structure = questionStructure;
        }
        const { success } = await this.$store.dispatch('contentEditor/updateQuestion', { id: questionId, question });
        if (!success) {
          throw new Error('Cannot update question. Please try again.');
        }
      } catch (error) {
        QLogger.errorForceLogged('Marks Update Failed : ', error);
      }
      endProgress();
    },

    async onQuestionTimeUpdation(questionId, time, doneCallback, endProgress) {
      try {
        const previousQuestion = this.getQuestionById(questionId);
        if (!previousQuestion) {
          this.$store.dispatch('analyticsManager/addBreadcrumb', `PQNFTU:${questionId}`);
        }
        const question = Question({ ...previousQuestion });

        question.time = time;
        const { success } = await this.$store.dispatch('contentEditor/updateQuestion', { id: questionId, question });
        if (!success) {
          throw new Error('Cannot update question. Please try again.');
        }

        doneCallback();
      } catch (error) {
        QLogger.errorForceLogged('Time Update Failed : ', error);
      }
      endProgress();
    },

    onSettingDefaultTime(time) {
      this.$store.dispatch('contentEditor/updateAllQuestionTimesInQuiz', { time });
    },

    onSettingDefaultPoints(points) {
      this.$store.dispatch('contentEditor/updateMultipleQuestionPoints', { points });
    },

    async getAutoConvertVersions(question) {
      const { success, data } = await QuizService.getAutoConvertVersions([question]);
      if (success) {
        const { targetQuestions = [] } = data?.result?.find((item) => item.sourceQuestionId === question._id) || {};
        return targetQuestions;
      }
      return [];
    },

    async updateAutoConvertVersions(updatedQuestionId) {
      const newQuestion = this.questionsToShow.find((question) => question._id === updatedQuestionId);
      const questionAutoConvertVersions = this.autoConvertQuestionsVersionsMap[updatedQuestionId];

      if (newQuestion && newQuestion.type === 'MCQ' && !questionAutoConvertVersions) {
        const autoConvertVersions = await this.getAutoConvertVersions(newQuestion);
        if (autoConvertVersions.length) {
          this.autoConvertQuestionsVersionsMap = {
            ...this.autoConvertQuestionsVersionsMap,
            [updatedQuestionId]: autoConvertVersions.concat(newQuestion),
          };
        }
      }
    },

    async onQuestionEditActionCompletion({ action, previousQuestionId, updatedQuestionId } = {}) {
      if (action === 'save' && this.isAutoConvertModalEnabled) {
        await this.updateAutoConvertVersions(updatedQuestionId);
      }

      if (this.$refs) {
        const updatedQuestionRef = this.$refs[`questionDetailCards_${updatedQuestionId}`];
        const previousQuestionRef = this.$refs[`questionDetailCards_${previousQuestionId}`];

        const cardRef = updatedQuestionRef || previousQuestionRef;

        if (cardRef) {
          await asyncDelay(400);
          this.$nextTick(() => {
            this.$scrollTo(cardRef.$el, 50, { offset: -250 }); // offset it to try and have the card be at the center of the page
          });
        }
      }
    },

    async onApplyTimeToAllQuestions(questionId, doneCallback) {
      const question = this.getQuestionById(questionId);

      if (!question || !question.time) {
        return;
      }

      await this.$store.dispatch('contentEditor/updateAllQuestionTimesInQuiz', question);

      doneCallback();
    },

    handleImportGoogleForms() {
      this.$analytics.logEvent(
        this.$webEvents.IMPORT_GOOGLE_FORMS_BTN,
        {
          position: 'import_forms_creator_btn',
          quizId: this.$route.params?.id,
        },
      );
      this.$store.dispatch('uiManager/toggleGoogleFormsImport', { publish: false });
    },

    getQuestionButtonTooltip(type, title) {
      if (type === 'SLIDE' || type === 'SLIDEV2') {
        return this.$i18n('Add slides');
      }
      return this.$i18n('Add {$1} question', [title]);
    },

    async onSaveSpreadSheetQuestions(questions, doneCallback) {
      const { success } = await this.$store.dispatch('contentEditor/createMultipleQuizQuestion', { questions });

      doneCallback();

      if (!success) {
        this.$toasts.add({
          type: this.$constants.ToastTypes.ERROR,
          icon: 'fas fa-times-circle',
          title: this.$i18n('Something went wrong while saving spreadsheet questions'),
        });

        return;
      }

      this.toggleImportModal();
    },

    showDrawCanvasEditor(mediaURL) {
      this.drawCanvasEditorImage = mediaURL || '';
      this.shouldShowDrawCanvasEditor = true;
    },

    toggleNoQuestionsModal() {
      this.showNoQuestionsModal = true;
    },

    handleRedirectToQuizPage() {
      const { query } = this.$route;

      const eventName = this.$webEvents.INCOMPLETE_QUIZ;
      this.$analytics.logEvent(eventName, {
        userId: this.$user.id,
        quizId: this.quizId,
        action: 'exit',
      });

      redirectOnLeavingEditor(query, `/admin/quiz/${this.quizId}`, this.$router, this.$store);
    },

    handleBack() {
      /**
       * @deprecated precursor has been deprecated
       */
      // if (!this.hasQuestions) {
      //   this.handleDiscardQuiz(this.quizId);
      //   return;
      // }
      // if (this.isQuizPublishable) {
      //   this.handlePublishQuiz(this.quizId, this.draftId);
      // } else {
      const { query } = this.$route;
      redirectOnLeavingEditor(query, '/admin', this.$router, this.$store);
      // }
    },

    redirectToQuizDraft() {
      const { query } = this.$route;

      redirectOnLeavingEditor(query, `/admin/quiz/${this.quizId}`, this.$router, this.$store, false);
    },

    handleOnDocumentKeydown(ev) {
      if (this.shouldShowDrawCanvasEditor) {
        if (ev.metaKey) {
          if (ev.key === 'z') {
            this.$refs.drawCanvasEditor.handleUndo();
            ev.stopPropagation();
            ev.preventDefault();
          }

          if (ev.shiftKey) {
            if (ev.key === 'z') {
              this.$refs.drawCanvasEditor.handleRedo();
              ev.stopPropagation();
              ev.preventDefault();
            }
          }
        }
      }
    },

    async handleCurriculumSelection(curriculum) {
      this.$store.dispatch('contentEditor/setShouldShowCurriculumSelection', !!curriculum);

      if (curriculum) {
        this.$refs.curriculumSelection.setLoading(true);
        let preferences = cloneDeep(this.$user.preferences);

        if (!get(this.$user, 'preferences.curriculum.default', null)) {
          preferences = assignIn(preferences, {
            curriculum: {
              default: curriculum._id,
              selected: [curriculum._id],
            },
          });
        }

        await UserAPIService.updateInfo({
          preferences,
        });

        this.$refs.curriculumSelection.setLoading(false);
      }

      this.$store.dispatch('contentEditor/setCurriculum', curriculum);
      this.showCurriculumSelectionModal = false;
      this.showQuestionTopicTagger = true;
    },

    toggleQuestionTypeInfoPeekaboo(info) {
      if (info.featureFlag && this.$featureFlags.isDisabled(info.featureFlag)) {
        return;
      }

      if (info.closureFlag && LocalStorage.getItem(info.closureFlag)) {
        return;
      }
      if (!info.closureFlag && LocalStorage.getItem(this.$constants.LocalStorageItems.DONT_SHOW_QUESTION_TYPE_INFO_POPUP)) {
        return;
      }

      this.shouldShowQuestionInfoInPeekaboo = true;
      this.metadataForPeekaboo = info;
    },

    getLeaveModalTextData(type) {
      if (type === 'title') {
        if (this.redirectingToPricingPage) {
          return this.$i18n('You will be redirected to another page to start your subscription');
        }
        return this.$i18n('You may lose your changes if you leave this page');
      }
      if (this.redirectingToPricingPage) {
        return this.$i18n('You can choose to save this question first and then proceed to not lose your changes');
      }
      return this.$i18n('Save your changes to this question first as going away will delete the changes you may have made');
    },

    getSuperQuestionsUsed() {
      return this.questionsToShow.filter((question) => question && isQuestionTypeSuperType(question.type));
    },

    isQuestionAudioOrVideo(question) {
      const media = question.structure.query?.media;
      if (!media) {
        return false;
      }
      if (media.filter((media) => media.type === 'audio' || media.type === 'video').length) {
        return true;
      }
      return false;
    },

    getAudioVideoQuestionsUsed() {
      const audioVideoQuestionsUsed = [];
      for (const question of this.questionsToShow) {
        if (this.isQuestionAudioOrVideo(question)) {
          audioVideoQuestionsUsed.push({ ...question, subType: `${question.structure.query.media[0].type}-question` });
        }
      }
      return audioVideoQuestionsUsed;
    },

    getAudioVideoExplanationsUsed() {
      const audioVideoExplanationsUsed = [];
      for (const question of this.questionsToShow) {
        const type = question.structure?.explain?.type;
        if (['audio', 'video'].includes(type)) {
          audioVideoExplanationsUsed.push({ ...question, subType: `${type}-explanation` });
        }
      }
      return audioVideoExplanationsUsed;
    },

    getSuperQuestionTypesUsed() {
      const superQuestionTypesUsed = Array.from(
        new Set(this.getSuperQuestionsUsed().map(
          (question) => question.type,
        )),
      );

      const audioVideoQuestionsUsed = this.getAudioVideoQuestionsUsed();

      const audioVideoQuestionTypesUsed = Array.from(new Set(audioVideoQuestionsUsed.map((question) => question.subType)));

      const audioVideoExplanationsUsed = Array.from(new Set(this.getAudioVideoExplanationsUsed().map((question) => question.subType)));

      return [...superQuestionTypesUsed, ...audioVideoQuestionTypesUsed, ...audioVideoExplanationsUsed];
    },

    getSuperQuestionTypesFeatureInfo() {
      const questionTypeToFeatureInfoMap = {
        [this.$constants.QuestionTypes.MATCH]: {
          icon: 'far fa-layer-plus',
          text: this.$i18n('Match'),
          subTitle: this.$i18n('Promote critical thinking in players with Match question'),
        },

        [this.$constants.QuestionTypes.REORDER]: {
          icon: 'far fa-signal-alt',
          text: this.$i18n('Reorder'),
          subTitle: this.$i18n('Promote critical thinking in players with Reorder question'),
        },

        [this.$constants.QuestionTypes.VIDEO]: {
          icon: 'far fa-video',
          text: this.$i18n('Video Response'),
          subTitle: this.$i18n('Encourage higher order thinking with Video response'),
        },

        [this.$constants.QuestionTypes.AUDIO]: {
          icon: 'far fa-microphone-alt',
          text: this.$i18n('Audio Response'),
          subTitle: this.$i18n('Encourage higher order thinking with Audio response'),
        },

        [this.$constants.QuestionTypes.DRAGNDROP]: {
          icon: 'far fa-hand-paper',
          text: this.$i18n('Drag and drop'),
          subTitle: this.$i18n('Encourage critical thinking with easy to use drag n drop questions'),
        },

        [this.$constants.QuestionTypes.DROPDOWN]: {
          icon: 'fal fa-caret-square-down',
          text: this.$i18n('Drop down'),
          subTitle: this.$i18n('Encourage critical thinking with easy to use drop down questions'),
        },

        [this.$constants.QuestionTypes.EQUATION]: {
          icon: 'far fa-function',
          text: this.$i18n('Math Response'),
          subTitle: this.$i18n('Encourage higher order thinking with easy to use Math Response questions'),
        },

        [this.$constants.QuestionTypes.DND_IMAGE]: {
          icon: 'fal fa-message-image',
          text: this.$i18n('Labeling'),
          subTitle: this.$i18n('Engage students with media-rich questions where they can drag and drop text labels onto specific parts of an image.'),
        },

        [this.$constants.QuestionTypes.HOTSPOT]: {
          icon: 'fal fa-bullseye-pointer',
          text: this.$i18n('Hotspot'),
          subTitle: this.$i18n('Ask students to ‘spot’ what they know; whether it’s identifying cities on a map or identifying organs in human bodies.'),
        },

        [this.$constants.QuestionTypes.GRAPHING]: {
          icon: 'far fa-chart-line',
          text: this.$i18n('Graphing'),
          subTitle: this.$i18n('Challenge participants with visual graphs to help them think more critically.'),
        },

        'audio-question': {
          icon: 'far fa-microphone-alt',
          text: this.$i18n('Audio Question'),
          subTitle: this.$i18n('Engage players with audio clips in quizzes'),
        },

        'video-question': {
          icon: 'far fa-video',
          text: this.$i18n('Video Question'),
          subTitle: this.$i18n('Engage players with video clips in quizzes'),
        },

        'audio-explanation': {
          icon: 'far fa-microphone-alt',
          text: this.$i18n('Audio Explanation'),
          subTitle: this.$i18n('Engage players with audio clips in answer explanation'),
        },

        'video-explanation': {
          icon: 'far fa-video',
          text: this.$i18n('Video Explanation'),
          subTitle: this.$i18n('Engage players with video clips in answer explanation'),
        },
      };
      const superQuestionTypesUsed = this.getSuperQuestionTypesUsed();
      const featureInfo = superQuestionTypesUsed.map((questionType) => questionTypeToFeatureInfoMap[questionType]);
      return featureInfo;
    },

    handleClickOnUpgradeToSuper() {
      const questionTypesWithCount = this.getSuperQuestionTypesUsed().map((questionType) => {
        let count = 0;
        this.questionsToShow.forEach((question) => {
          if (question.type === questionType) {
            count += 1;
          }
        });
        return {
          type: questionType,
          count,
        };
      });
      const eventName = this.$webEvents.UPGRADE_TO_USE_SUPER_Q_NUDGE;
      this.$analytics.logEvent(eventName, {
        userId: this.$user.id,
        quizId: this.quizId,
        screen: 'quizEditor',
      });
      this.$router.push(`/super-pricing?backto=${encodeURIComponent(this.$route.path)}&redirectTo=${encodeURIComponent(this.$route.path)}&variant=${getVariantNameForSuperQuestionsUsed(questionTypesWithCount)}&source=${encodeURIComponent('quizEditor')}&feat=superQuestionPassiveNudge_quizEditor`);
    },

    async continueWithoutSuperQuestions() {
      const eventName = this.$webEvents.SUPER_UPSELL_MODAL_TO_USE_SUPER_Q;
      this.$analytics.logEvent(eventName, {
        userId: this.$user.id,
        quizId: this.quizId,
        action: 'publish',
      });

      const superQuestionsToRemove = this.getSuperQuestionsUsed();
      const audioVideoQuestionsToRemove = this.getAudioVideoQuestionsUsed();
      const audioVideoExplanationQuestionsToRemove = this.getAudioVideoExplanationsUsed();
      const questionsToRemove = [...superQuestionsToRemove, ...audioVideoQuestionsToRemove, ...audioVideoExplanationQuestionsToRemove];

      await Promise.all(questionsToRemove.map((question) => {
        const eventName = this.$webEvents.DELETE_QUESTION;
        this.$analytics.logEvent(eventName, {
          userId: this.$user.id,
          quizId: this.quizId,
          questionType: question.type,
          questionId: question._id,
          isQuestionPremium: this.isQuestionTypeSuperType(question.type) || this.isQuestionAudioOrVideo(question),
          action: 'auto',
        });
        return this.onQuestionDeletion(question._id, () => { });
      }));

      this.containsSuperQuestions = false;

      if (this.questionsToShow.length) {
        this.showPublishModal = true;
        return this.togglePublishModal(false);
      }
      return this.toggleNoQuestionsModal();
    },

    closeNoQuestionModal() {
      const eventName = this.$webEvents.INCOMPLETE_QUIZ;
      this.$analytics.logEvent(eventName, {
        userId: this.$user.id,
        quizId: this.quizId,
        action: 'continue_editing',
      });
      this.showNoQuestionsModal = false;
    },

    redirectTo(url) {
      const otherWindow = window.open();
      otherWindow.opener = null;
      otherWindow.location = url;
    },

    presentationEditor_showImageUpload(params) {
      const { callback, media } = params;
      this.imageMedia = media || Media();
      this.showImageUpload = true;

      this.imageUploadCallback = (mediaResult) => {
        this.showImageUpload = false;
        this.imageUploadCallback = null;

        const eventName = this.$webEvents.getQuizEditorEvent(Constants.ContentType.QUIZ, this.$webEvents.EDITOR_IMAGE_SAVE);
        this.$analytics.logEvent(
          eventName,
          {
            quizId: this.quizId,
            source: mediaResult.isGoogleSearchMode ? 'search' : 'upload',
          },
        );

        callback(mediaResult);
      };
    },

    presentationEditor_showAudioUpload(params) {
      const { callback, media } = params;
      if (!this.shouldAllowUsingSuperQuestionTypes && !this.isSuperUser && !this.isCorporateUser) {
        this.$eventBus.$emit('superUpsell:show', { type: this.$constants.SuperUpsellTypes.AUDIO, options: { feat: 'audio', openInNewTab: true } });
        return;
      }

      this.audioMedia = media || Media();
      this.showAudioUpload = true;
      this.audioUploadCallback = (mediaResult) => {
        this.showAudioUpload = false;
        this.audioUploadCallback = null;
        callback(mediaResult);
      };
    },

    presentationEditor_showVideoUpload(params) {
      const { callback, media } = params;
      if (!this.shouldAllowUsingSuperQuestionTypes && !this.isSuperUser && !this.isCorporateUser) {
        this.$eventBus.$emit('superUpsell:show', { type: this.$constants.SuperUpsellTypes.VIDEO, options: { feat: 'video', openInNewTab: true } });
        return;
      }

      this.videoMedia = media || Media();
      this.showVideoUpload = true;

      this.videoUploadCallback = (mediaResult) => {
        this.showVideoUpload = false;
        this.videoUploadCallback = null;

        const isTrimmed = !((mediaResult.meta.endTime - mediaResult.meta.startTime) === mediaResult.meta.duration);
        const eventName = this.$webEvents.getQuizEditorEvent(Constants.ContentType.QUIZ, this.$webEvents.EDITOR_VIDEO_SAVE);
        this.$analytics.logEvent(
          eventName,
          {
            quizId: this.quizId,
            source: mediaResult.isYTVideoSearchMode ? 'search' : 'upload',
            isTrimmed,
          },
        );
        callback(mediaResult);
      };
    },

    presentationEditor_showMathEditor(params) {
      const { callback, closeCallback } = params;
      this.showMathEditor = true;

      if (this.mathLatex) {
        this.mathLatex = null;
      }

      this.mathEditorCallback = (latex) => {
        this.showMathEditor = false;
        this.mathEditorCallback = null;

        callback(latex);
      };

      this.closeMathEditorCallback = () => {
        this.showMathEditor = false;
        this.closeMathEditorCallback = null;

        typeof closeCallback === 'function' && closeCallback();
      };
    },

    presentationEditor_publishModalImageSearch({ callback, searchTerm }) {
      this.imageMedia = Media();
      this.imageUploadModalTitle = this.$i18n('Insert a title image');
      this.imageModalSearchTerm = searchTerm;
      this.showImageUpload = true;
      this.imageUploadCallback = (media) => {
        this.showImageUpload = false;
        this.imageUploadCallback = null;
        this.imageUploadModalTitle = '';
        this.imageModalSearchTerm = '';
        callback(media);
      };
    },

    mathRenderEle_clicked({
      id, latex, callback = () => { }, closeCallback = () => { },
    }) {
      this.mathLatex = latex;
      this.showMathEditor = true;

      this.mathEditorCallback = (updatedLatex) => {
        this.showMathEditor = false;
        this.mathEditorCallback = null;
        this.mathLatex = null;

        if (id) {
          this.$eventBus.$emit('slideElement:updateMath', {
            id,
            latex: updatedLatex,
          });
        }

        callback(updatedLatex);
      };

      this.closeMathEditorCallback = () => {
        this.showMathEditor = false;
        this.closeMathEditorCallback = null;

        closeCallback();
      };
    },

    onRedirectingToPricingPage() {
      this.redirectingToPricingPage = true;
    },

    async handleRefreshQuiz() {
      try {
        this.isPageLoading = true;
        const quiz = await QuizService.getQuiz(this.quizId);
        this.$store.dispatch('contentEditor/setQuiz', { quiz, editorForContentType: this.$constants.ContentType.QUIZ, quizWithoutDrafts: false });
      } catch (err) {
        this.$router.replace('/admin');
      } finally {
        this.isPageLoading = false;
      }
    },

  },
};
</script>

<style lang="scss">
@import '~/assets/scss/extends.scss';

html {
  @extend %keyboard-only-focus-rings;
  @extend %disable-scroll
}

.question-details-card-ghost {
  opacity: 0;
}

.question-anim {
  box-shadow: 0px 0px 0px 9999px rgba(0, 0, 0, 0.5);
}

.quiz-editor-inner {
  $quizEditorHeaderHeight: 48px;
  height: 100%;

  @media screen and (min-width: 1025px) {
    min-height: calc(100vh - #{$quizEditorHeaderHeight});
    padding-top: $quizEditorHeaderHeight;
  }
}

.my-handle {
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
}

.quick-add-action {
  animation: quick-add-action-animation 0.2s;
}

@keyframes quick-add-action-animation {
  from {
    opacity: 0;
    transform: scale(0.9);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

.premium-week-modal-banner-image {
  position: absolute;
  top: -110px;
  left: 0;
}

.question-horizontal-divider {
  top: 0;
  left: 15.2%;
  right: 15.2%;
}
</style>
