/**
 *
 * @param {Object} router pass the nuxt router object
 * @param {Object} query pass the nuxt query object
 * @param {string} survicateParam pass the name of the survicate param
 */
const addSurvicateQueryParam = (router, query = {}, survicateParam) => {
  if (!query?.[survicateParam]) {
    router.push({
      query: {
        ...query,
        [survicateParam]: true,
      },
    });
  }
};

export { addSurvicateQueryParam };
