<template>
  <client-only>
    <div class="overflow-auto border-1 rounded-t-lg border-dark-6">
      <table class="w-full border-collapse">
        <thead>
          <tr class="border-b-1 border-dark-6">
            <td
              v-for="(columnName, columnKey, index) in data.head"
              :key="index"
              class="p-4 text-xs whitespace-nowrap text-dark-4"
              :class="[{ hidden: isId(columnKey) }]"
            >
              {{ $i18n('{$1}', [columnName]) }}
            </td>
          </tr>
        </thead>
        <tbody>
          <tr v-if="data.body.length === 0">
            <td
              colspan="4"
              class="w-full"
            >
              <div class="text-center flex items-center justify-center min-h-full h-30">
                <span class="text-xs text-dark-4">
                  <i18n>No Results Found</i18n>
                </span>
              </div>
            </td>
          </tr>
          <tr
            v-for="(item, itemIndex) in data.body"
            v-else
            :key="itemIndex"
            class="border-b-1 border-dark-6"
            :class="[selectedItem === itemIndex && isRowClickable ? 'bg-green-20%' : 'hover:bg-yellow-20%', isRowClickable ? 'cursor-pointer' : '']"
            @click="isRowClickable ? handleRowClick(item, itemIndex) : ''"
          >
            <td
              v-for="(columnName, columnKey, index) in data.head"
              :key="index"
              class="text-sm p-4 whitespace-nowrap"
              :class="[{ 'text-center align-middle hover: cursor-pointer': isIcon(columnKey) }, { hidden: isId(columnKey) }]"
            >
              <!-- Icon -->
              <span
                v-if="isIcon(columnKey)"
                @click="$emit('icon-click', item.id)"
              >
                <FA
                  :icon="cellData(item, columnKey)"
                  class="mx-auto"
                />
              </span>

              <!-- Id -->
              <template v-else-if="isId(columnKey)" />

              <!-- Radio Button -->
              <template v-else-if="isRadio(columnKey)">
                <Radio
                  v-if="isRowClickable"
                  :inputId="item.id"
                  :checked="selectedRadioButton === item.id || selectedItem === itemIndex"
                  @change="handleRowClick(item, itemIndex)"
                />
              </template>
              <!-- String -->
              <!-- Link -->
              <template v-else-if="isLink(columnKey)">
                <a
                  class="cursor-pointer underline"
                  :class="[{ 'text-blue': !isUnlinkText(cellData(item, columnKey)) }]"
                  @click="$emit('link-click', item.id, columnKey)"
                >
                  {{ cellData(item, columnKey) }}
                </a>
              </template>

              <template v-else>
                {{ cellData(item, columnKey) }}
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </client-only>
</template>

<script>

export default {
  props: {
    data: {
      type: Object,
      default: () => {},
    },
    selectedItem: {
      type: Number,
      default: -1,
    },
    isRowClickable: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['icon-click', 'link-click', 'click'],

  data() {
    return {
      selectedRadioButton: '',
    };
  },

  computed: {
  },

  methods: {
    cellData(item, columnKey) {
      return this.$i18n('{$1}', [item[columnKey]]);
    },
    isIcon(columnKey) {
      return columnKey === 'FA';
    },
    isId(columnKey) {
      return columnKey === '_id';
    },
    isRadio(columnKey) {
      return columnKey === 'Radio';
    },
    isLink(columnKey) {
      return columnKey.includes('Link');
    },
    isUnlinkText(value) {
      return value === 'Unlink';
    },
    handleRowClick(item, itemIndex) {
      this.selectedRadioButton = item.id;
      this.$emit('click', { itemId: item._id, itemIndex });
    },
  },
};
</script>

<style scoped>

</style>
