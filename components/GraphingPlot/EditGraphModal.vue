<template>
  <Modal
    :dismissOnOverlayClick="true"
    type="custom"
    size="custom"
    :tabindex="0"
    :stopOtherKeys="true"
    :stickToBottom="!isDesktop"
    :fullScreenOnMobile="!isDesktop"
    allowOverflowScrolling
    @close="close"
  >
    <div
      class="flex flex-col font-sans"
      :class="isDesktop ? 'w-[768px] h-[640px]' : 'w-full h-full flex-1'"
    >
      <div
        class="flex flex-row w-full gap-3"
        :class="isDesktop ? '' : 'pb-1'"
      >
        <FAwoSize class="aspect-square fas fa-chart-line h-full rounded-full bg-lilac-faded justify-center text-base text-lilac" />
        <div class="flex flex-col w-full">
          <div class="flex flex-row justify-between w-full">
            <span class="text-base text-dark-2"><i18n>Edit chart</i18n></span>
            <FAwoSize
              class="fas fa-times w-4 h-4 justify-center text-base text-dark-4 cursor-pointer hover:bg-dark-6"
              @click.native="close"
            />
          </div>
          <div class="text-xs text-dark-4 font-semibold">
            <i18n>Add points, lines, and curves. The black chart elements will show up as part of the question. Students will only have to mark the colorful chart elements as the answer.</i18n>
          </div>
        </div>
      </div>
      <div
        class="flex flex-1 items-center overflow-auto"
        :class="isDesktop ? 'flex-row justify-evenly' : 'flex-col'"
      >
        <div class="flex rounded bg-dark-5">
          <canvas
            ref="canvas"
            class="flex aspect-square rounded p-[1px]"
            :class="isDesktop ? 'h-[512px]' : 'w-full'"
          />
        </div>
        <div
          class="flex rounded-lg justify-between text-dark-2"
          :class="isDesktop ? 'bg-light-1 border-dark-6 border-1 w-44 h-[512px] flex-col' : 'flex-row w-full'"
        >
          <div
            class="flex w-full flex-col gap-2 p-2"
            :class="isDesktop ? 'w-full' : 'w-1/2'"
          >
            <div
              class="flex justify-center w-full gap-1"
              :class="isDesktop ? 'text-sm' : 'text-xs'"
            >
              <span class="button-text"><i18n>Add and remove</i18n></span>
            </div>
            <div
              class="flex gap-2"
              :class="isDesktop ? 'flex-col' : 'flex-row'"
            >
              <Button
                v-tooltip="{ content: $i18n('Add Points plot'), placement: 'right' }"
                :licon="'far fa-dot-circle ' + (isDesktop ? '' : ' m-auto ')"
                :buttonClasses="isDesktop ? '' : 'flex-auto'"
                :size="isDesktop ? 'md' : 'xs'"
                :title="isDesktop ? $i18n('Points') : ''"
                :aria-label="$i18n('Points')"
                :notCenterJustified="true"
                type="white"
                @click.native="addPlot(getPointsPlotType())"
              />
              <Button
                v-tooltip="{ content: $i18n('Add Linear plot'), placement: 'right' }"
                :licon="'far fa-horizontal-rule ' + (isDesktop ? '' : ' m-auto ')"
                :buttonClasses="isDesktop ? '' : 'flex-auto'"
                :size="isDesktop ? 'md' : 'xs'"
                :title="isDesktop ? $i18n('Linear') : ''"
                :aria-label="$i18n('Linear')"
                :notCenterJustified="true"
                type="white"
                @click.native="addPlot(getLinearPlotType())"
              />
            </div>
            <div
              class="flex gap-2"
              :class="isDesktop ? 'flex-col' : 'flex-row'"
            >
              <Button
                v-tooltip="{ content: $i18n('Add Quadratic plot'), placement: 'right' }"
                :licon="'far fa-wave-sine ' + (isDesktop ? '' : ' m-auto ')"
                :buttonClasses="isDesktop ? '' : 'flex-auto'"
                :size="isDesktop ? 'md' : 'xs'"
                :title="isDesktop ? $i18n('Quadratic') : ''"
                :aria-label="$i18n('Quadratic')"
                :notCenterJustified="true"
                type="white"
                @click.native="addPlot(getQuadraticPlotType())"
              />
              <Button
                v-tooltip="{ content: $i18n('Add Exponential plot'), placement: 'right' }"
                :licon="'far fa-superscript ' + (isDesktop ? '' : ' m-auto ')"
                :buttonClasses="isDesktop ? '' : 'flex-auto'"
                :size="isDesktop ? 'md' : 'xs'"
                :title="isDesktop ? $i18n('Exponential') : ''"
                :aria-label="$i18n('Exponential')"
                :notCenterJustified="true"
                type="white"
                @click.native="addPlot(getExponentialPlotType())"
              />
            </div>
            <Button
              v-if="!isDesktop"
              v-tooltip="{ content: $i18n('Clear all plots'), placement: 'right' }"
              licon="far fa-trash-alt"
              buttonClasses="justify-center"
              size="xs"
              :title="$i18n('Clear all')"
              :aria-label="$i18n('Clear all')"
              :notCenterJustified="true"
              :disabled="false"
              :showDisabledStyle="false"
              type="danger"
              @click.native="RemoveAllButAnswerPlots()"
            />
          </div>
          <div
            class="flex w-full flex-col gap-2 p-2"
            :class="isDesktop ? 'w-full' : 'w-1/2'"
          >
            <div
              class="flex justify-center w-full gap-1"
              :class="isDesktop ? 'text-sm' : 'text-xs'"
            >
              <span class="button-text"><i18n>Chart settings</i18n></span>
            </div>
            <Button
              v-tooltip="{ content: $i18n('Remove last added plot'), placement: 'right' }"
              licon="far fa-undo"
              :title="$i18n('Undo')"
              :size="isDesktop ? 'md' : 'xs'"
              :aria-label="$i18n('Undo')"
              :notCenterJustified="true"
              :disabled="!possibleToRemovePlot"
              :showDisabledStyle="!possibleToRemovePlot"
              type="white"
              @click.native="RemoveLastPlot()"
            />
            <!-- <Button
              v-tooltip="{content: $i18n('Add last removed plot'), placement: 'right'}"
              licon="far fa-redo"
              title="Redo"
              :aria-label="$i18n('Redo')"
              :notCenterJustified="true"
              :disabled="false"
              :showDisabledStyle="false"
              type="white"
              @click.native="AddLastRemovedPlot()"
            /> -->
            <Radio
              class="button-bg"
              :class="isDesktop ? 'pl-4 pr-1 py-1' : 'pl-2 pr-1'"
              name="1"
              :label="$i18n('10 units')"
              :size="isDesktop ? 'md' : 'xs'"
              licon="fa-game-board-simple"
              liconClasses="fas"
              :checked="getGraphScale === 1"
              :checkerToRight="true"
              titleClasses="text-dark-2 text-sm font-semibold pl-1"
              checkBgColor="lilac"
              @click.native="changeGraphScaleValue(1)"
            />
            <Radio
              class="button-bg"
              :class="isDesktop ? 'pl-4 pr-1 py-1' : 'pl-2 pr-1'"
              name="2"
              :size="isDesktop ? 'md' : 'xs'"
              :label="$i18n('20 units')"
              licon="fa-game-board"
              liconClasses="fas"
              :checked="getGraphScale === 2"
              :checkerToRight="true"
              titleClasses="text-dark-2 text-sm font-semibold pl-1"
              checkBgColor="lilac"
              @click.native="changeGraphScaleValue(2)"
            />
            <Button
              v-if="isDesktop"
              v-tooltip="{ content: $i18n('Clear all plots'), placement: 'right' }"
              licon="far fa-trash-alt"
              :title="$i18n('Clear all')"
              :aria-label="$i18n('Clear all')"
              :notCenterJustified="true"
              :disabled="false"
              :showDisabledStyle="false"
              type="danger"
              @click.native="RemoveAllButAnswerPlots()"
            />
          </div>
        </div>
      </div>
      <div
        class="flex flex-row gap-2"
        :class="isDesktop ? 'justify-end' : 'justify-evenly'"
      >
        <Button
          v-tooltip="{ content: $i18n('Cancel all the changes'), placement: 'bottom' }"
          :buttonClasses="isDesktop ? '' : 'flex-auto'"
          :size="isDesktop ? 'md' : 'xs'"
          rounded="sm"
          type="other"
          :title="$i18n('Cancel')"
          :aria-label="$i18n('Cancel')"
          @click.native="close()"
        />
        <Button
          v-tooltip="{ content: $i18n('Save all the changes'), placement: 'bottom' }"
          :buttonClasses="isDesktop ? '' : 'flex-auto'"
          :size="isDesktop ? 'md' : 'xs'"
          rounded="sm"
          type="primary"
          :title="$i18n('Save')"
          :aria-label="$i18n('Save')"
          @click.native="save()"
        />
      </div>
    </div>
  </Modal>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

import cloneDeep from 'lodash/cloneDeep';

import FAwoSize from '~/components/FAwoSize.vue';
import QuestionEditorGraphMixin from '~/mixins/questionEditorGraphMixin';
import QLogger from '~/services/QLogger';

export default {

  components: {
    FAwoSize,
  },

  mixins: [QuestionEditorGraphMixin],

  data() {
    return {
      canvas: null,
      graphId: '',
      graphData: {},
    };
  },

  computed: {
    ...mapGetters({
      getGrapher: 'root/getGrapher',
      isDesktop: 'root/isDesktop',
      getNonInteractivePlots: 'slideEditor/getNonInteractivePlots',
      getAnswerPlot: 'slideEditor/getAnswerPlot',
      getGraphScale: 'slideEditor/getGraphScale',
      isEditorForPresentationContent: 'contentEditor/isEditorForPresentationContent',
      quizId: 'contentEditor/quizId',
    }),

    possibleToRemovePlot() {
      return this.graphData?.plots?.length > 1;
    },
  },

  mounted() {
    this.$analytics.logEvent(this.$webEvents.EDIT_GRAPH_MODAL_OPENED_EDITOR, {
      quizId: this.quizId,
    });
    this.canvas = this.$refs.canvas;
    const newSetup = this.getGraphScale === 1 ? this.getGrapher.Default10Graph : this.getGrapher.Default20Graph;
    this.graphId = this.getGrapher.Creator.setupNewCanvas(this, this.canvas, {
      ...newSetup,
      onBroadcastUpdate: this.onBroadcastUpdate.bind(this),
      isMobile: !this.isDesktop,
    });
    this.setupInitialState();
  },

  beforeUnmount() {
    this.setEditGraphModalOpen(false);
    this.getGrapher.Creator.removeCanvas(this.graphId);
  },

  methods: {
    ...mapActions({
      setEditGraphModalOpen: 'slideEditor/setEditGraphModalOpen',
      setNonInteractivePlots: 'slideEditor/setNonInteractivePlots',
      setGraphScale: 'slideEditor/setGraphScale',
      updateGraphDataIntoQuestion: 'slideEditor/updateGraphDataIntoQuestion',
    }),

    onBroadcastUpdate(data) {
      this.graphData = data;
    },

    close() {
      this.$analytics.logEvent(this.$webEvents.EDIT_GRAPH_MODAL_CLOSED_EDITOR, {
        quizId: this.quizId,
      });
      this.setEditGraphModalOpen(false);
    },

    save() {
      const nonInteractivePlots = this.graphData.plots.filter((plot) => plot.plotId !== this.getAnswerPlot.plotId);
      const plotCountsForAnalytics = nonInteractivePlots.reduce((acc, plot) => {
        if (acc[plot.type]) {
          acc[plot.type] += 1;
        } else {
          acc[plot.type] = 1;
        }
        return acc;
      }, {});
      this.$analytics.logEvent(this.$webEvents.EDIT_GRAPH_MODAL_SAVED_EDITOR, {
        quizId: this.quizId,
        ...plotCountsForAnalytics,
      });
      this.setNonInteractivePlots(nonInteractivePlots);
      if (this.isEditorForPresentationContent) {
        this.updateGraphDataIntoQuestion(true);
      }
      this.close();
    },

    addPlot(plotType) {
      this.addPlotInternal(this.graphId, plotType, true, null, '', 1, '#000000');
    },

    RemoveLastPlot() {
      const plotIdToRemove = this.graphData.plots[this.graphData.plots.length - 1].plotId;
      if (plotIdToRemove !== this.getAnswerPlot.plotId) {
        this.getGrapher.Creator.removePlot(this.graphId, plotIdToRemove);
      }
    },

    AddLastRemovedPlot() {
      // TODO Rohit
      QLogger.error('Not Yet Implemented');
    },

    RemoveAllButAnswerPlots() {
      this.graphData.plots.forEach((plot) => {
        if (plot.plotId !== this.getAnswerPlot.plotId) {
          this.getGrapher.Creator.removePlot(this.graphId, plot.plotId);
        }
      });
    },

    setupInitialState() {
      this.addPlotInternal(this.graphId, this.getAnswerPlot.type, false, this.getAnswerPlot.data, this.getAnswerPlot.plotId, 0.5);
      this.getNonInteractivePlots.forEach((plot) => {
        this.addPlotInternal(this.graphId, plot.type, true, plot.data, plot.plotId, 1, '#000000');
      });
    },

    changeGraphScaleValue(val) {
      if (this.getGraphScale !== val) {
        // change graph style
        const graphData = cloneDeep(this.graphData);
        graphData.plots = graphData.plots.filter((plot) => plot.plotId !== this.getAnswerPlot.plotId);
        const newSetup = val === 1 ? this.getGrapher.Default10Graph : this.getGrapher.Default20Graph;
        this.getGrapher.Creator.removeCanvas(this.graphId);
        this.graphId = this.getGrapher.Creator.setupNewCanvas(this, this.canvas, {
          ...newSetup,
          onBroadcastUpdate: this.onBroadcastUpdate.bind(this),
          isMobile: !this.isDesktop,
        });
        this.addPlotInternal(this.graphId, this.getAnswerPlot.type, false, this.getAnswerPlot.data, this.getAnswerPlot.plotId, 0.5);
        graphData.plots.forEach((plot) => {
          this.addPlotInternal(this.graphId, plot.type, true, plot.data, plot.plotId, 1, '#000000');
        });

        this.setGraphScale(val);
        if (this.isEditorForPresentationContent) {
          this.updateGraphDataIntoQuestion(true);
        }
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.button-bg{
  @apply flex flex-row bg-light-3 rounded gap-1 cursor-pointer
}

.button-icon{
  @apply justify-center
}

.button-text{
  @apply flex flex-wrap content-center
}

</style>
