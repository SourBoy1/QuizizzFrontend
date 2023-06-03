<template>
  <div class="collapsible-container">
    <div
      class="collapsible-header bg-purple-faded text-purple cursor-pointer"
      @click.stop="setCollapsibleType()"
    >
      <span>{{ type === 'engineering' ? 'Dev Tools' : 'Support Dashboard' }}</span>
      <span>
        <i
          v-if="type === expanded"
          class="fa fa-caret-up"
          style="font-size: 12px"
        />
        <i
          v-else
          class="fa fa-caret-down"
          style="font-size: 12px"
        />
      </span>
    </div>
    <div v-if="type === expanded">
      <div
        v-if="type === 'support'"
        class="collapsable-body"
      >
        <a
          class="nav-tab"
          href="/aid/user"
        >
          Search by User
        </a>
        <a
          class="nav-tab"
          href="/aid/searchReport"
        >
          Search by Report
        </a>
        <a
          class="nav-tab"
          href="/aid/searchQuiz"
        >
          Search by Quiz
        </a>
        <a
          class="nav-tab"
          href="/aid/bulkActions"
        >
          Bulk Actions
        </a>
        <a
          class="nav-tab"
          href="/aid/organisation"
        >
          Organisation
        </a>
        <a
          class="nav-tab"
          href="/aid/district"
        >
          District
        </a>
        <router-link
          class="nav-tab"
          to="/qdash/contests"
        >
          Contests
        </router-link>
        <!--<a class="nav-tab" to="/aid/subscription">Subscriptions</a>-->
      </div>
      <div
        v-if="type === 'engineering'"
        class="collapsable-body"
      >
        <a
          class="nav-tab"
          href="/aid/uploadAsset"
        >
          Upload Asset
        </a>
        <a
          class="nav-tab"
          href="/aid/deploy-webflow"
        >
          Deploy Webflow
        </a>
      </div>
    </div>
  </div>
</template>

<script>
export default {

  props: {
    type: {
      type: String,
      default: () => (''),
    },
    expanded: {
      type: String,
      default: () => (''),
    },
  },
  emits: ['setCollapsibleType'],

  methods: {
    setCollapsibleType(index) {
      this.$emit('setCollapsibleType', this.type);
    },
  },
};
</script>

<style lang="scss" scoped>
.collapsable-body {
  display: flex;
  flex-direction: column;
  margin-left: 20px;
}

.collapsible-header {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px 0 10px;
  font-weight: bold;
  font-size: 16px;
  box-shadow: 0px 0px 34px -8px rgba(0, 0, 0, 0.75);
  border: 1px solid #222;
  height: 40px;
}

.collapsible-container {
  width: 100%;
}

.nav-tab {
  margin: 0px 12px;
  color: #FFFFFF;
  text-decoration: none;
  font-size: 15px;
  line-height: 24px;
  font-weight: normal;
  opacity: 0.8;
  padding: 10px 0 10px 0;

  &.router-link-active {
    font-weight: bold;
    opacity: 1;
  }
}

</style>
