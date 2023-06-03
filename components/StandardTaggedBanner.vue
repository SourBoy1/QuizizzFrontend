<template>
  <div class="mt-6">
    <div class="text-xxs text-dark-4 text-center p-2">
      <i18n>Sample Report from a Standards Tagged Quiz/Lesson</i18n>
    </div>
    <table
      class="border-collapse bg-light table-fixed"
      :class="isMobile ? 'w-95 break-all' : ''"
    >
      <thead>
        <tr>
          <th class="border border-dark-6" />
          <th
            v-for="(head, index) in tableHeader"
            :key="index"
            class="border border-dark-6 p-4 text-xxs font-semibold"
          >
            {{ head }}
          </th>
        </tr>
      </thead>
      <tbody class="text-center">
        <tr
          v-for="(data, index) in tableData"
          :key="index"
        >
          <td
            class="border border-dark-6 px-4 py-2"
            :class="isMobile ? 'text-xxs font-normal' : 'text-sm font-semibold'"
          >
            {{ data.name }}
          </td>
          <td
            class="border border-dark-6 px-4 py-2 bg-green-light  text-dark-50%"
            :class="isMobile ? 'text-xxs font-normal' : 'text-sm font-semibold'"
          >
            {{ data.firstCol }}
          </td>
          <td
            class="border border-dark-6 px-4 py-2 bg-red-light "
            :class="isMobile ? 'text-xxs font-normal' : 'text-sm font-semibold'"
          >
            <span class="text-light">{{ data.secondCol }}</span>
          </td>
          <td
            class="border border-dark-6 px-4 py-2 bg-green-light  text-dark-50%"
            :class="isMobile ? 'text-xxs font-normal' : 'text-sm font-semibold'"
          >
            {{ data.thirdCol }}
          </td>
        </tr>
      </tbody>
    </table>
    <div class="flex mt-5 px-6 border-b-1 border-dark-6">
      <div class="mt-8">
        <img
          src="https://cf.quizizz.com/image/emptystate-tagslady.png"
          width="118"
          height="118"
        />
      </div>
      <div
        class="relative bg-light rounded text-xxs w-56 h-22 p-4 ml-1"
        :class="isMobile ? 'border border-dark-5' : ''"
      >
        Hmm.. the class seems to be struggling with the <span :class="isMobile ? 'font-normal' : 'font-bold'">CCSS.MATH.8.B</span> standard. Perhaps I should teach it once more.
        <div class="absolute w-0 h-0 border-t-[13px] border-t-transparent  border-b-transparent border-r-[11px] border-r-light right-[100%] top-[56%] translate-y-[-50%]" />
      </div>
    </div>
  </div>
</template>
<script>
export default {

  props: {
    isMobile: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      tableHeader: ['CCSS.MATH.8.A', 'CCSS.MATH.8.B', 'CCSS.MATH.8.C'],
      tableData: [{
        name: this.$i18n('Alice'),
        firstCol: '90%',
        secondCol: '40%',
        thirdCol: '90%',
      },
      {
        name: this.$i18n('Stephen'),
        firstCol: '80%',
        secondCol: '20%',
        thirdCol: '90%',
      },
      {
        name: this.$i18n('James'),
        firstCol: '80%',
        secondCol: '10%',
        thirdCol: '90%',
      }],
    };
  },
};
</script>
