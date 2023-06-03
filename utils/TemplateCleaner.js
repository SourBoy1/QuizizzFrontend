import cloneDeep from 'lodash/cloneDeep';

import { nanoid } from 'nanoid';

import themes from '~/config/ThemesForSlidesWithShapes';
import { isShapeLarge } from '~/services/ShapesService';

const width = (element) => element.transform?.size?.width;

const height = (element) => element.transform?.size?.height;

const defaultTheme = themes.basicThemes[0];
export const getInitialTheme = () => ({
  id: defaultTheme.id,
  titleFontFamily: defaultTheme.titleFontFamily,
  fontFamily: defaultTheme.fontFamily,
  fontColor: {
    text: defaultTheme.textColor,
  },
  background: {
    color: defaultTheme.bgColor,
    image: '',
    video: '',
  },
  shape: {
    largeShapeColor: defaultTheme.largeShapeColor,
    smallShapeColor: defaultTheme.smallShapeColor,
  },
});

const cleanHTML = (html) => {
  let cleanHTML = html;
  const strokeWidthStyles = html.match(/stroke-width:.*?;/g);
  const strokeStyles = html.match(/stroke:.*?;/g);
  const fillStyles = html.match(/fill:.*?;/g);
  const strokes = html.match(/stroke=.*?".*?"/g);
  const fills = html.match(/fill=.*?".*?"/g);
  const fontFamilyStyles = html.match(/font-family:.*?;/g);
  // const fontSizeStyles = html.match(/font-size:.*?px/g);

  const listOfHitsAndMisses = [strokeWidthStyles, strokeStyles, fillStyles, strokes, fills, fontFamilyStyles];
  const listOfHits = listOfHitsAndMisses.filter((matches) => !!matches && matches.length);
  let combinedHits = [];
  listOfHits.forEach((hits) => {
    combinedHits = combinedHits.concat(hits);
  });
  combinedHits.forEach((hit) => {
    cleanHTML = cleanHTML.replace(hit, '');
  });
  return cleanHTML;
};

export const cleanTemplate = (template) => {
  const cleanTemplate = cloneDeep(template);
  delete cleanTemplate.parent;
  delete cleanTemplate.createdAt;
  delete cleanTemplate.updated;
  delete cleanTemplate.edited;
  cleanTemplate._id = nanoid(6);
  if (cleanTemplate.structure) {
    cleanTemplate.structure.theme = getInitialTheme;
  }
  cleanTemplate.elements = cleanTemplate?.structure?.elements?.map((ele) => {
    if (ele.type === 'SHAPE2D' && isShapeLarge(width(ele), height(ele))) {
      ele.isBackground = true;
    }
    ele._id = nanoid(6);

    if (ele?.data?.html) {
      ele.data.html = cleanHTML(ele.data.html);
    }
    return ele;
  });
  return cleanTemplate;
};

export const getCleanSlideTypesAndTemplates = (slideTypesAndTemplates) => {
  const cleanSlideTypesAndTemplates = cloneDeep(slideTypesAndTemplates);
  return cleanSlideTypesAndTemplates?.map((slideTypeAndTemplates) => {
    slideTypeAndTemplates.templates = slideTypeAndTemplates.templates.map((template) => cleanTemplate(template));
    return slideTypeAndTemplates;
  });
};
