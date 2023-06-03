import defaultsDeep from 'lodash/defaultsDeep';

export default function GrapherPlot(values) {
  return defaultsDeep(values, {
    plotId: '',
    data: {},
    type: 'Linear',
    equation: 'y = x',
  });
}
