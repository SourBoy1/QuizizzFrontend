import { nanoid } from 'nanoid';

const themes = {
  basicThemes: [
    {
      titleFontFamily: 'Quicksand',
      fontFamily: 'Quicksand',
      bgColor: '#FFFFFF',
      textColor: '#5D2057',
      largeShapeColor: '#F2F2F2',
      smallShapeColor: '#9A4292',
      linkColor: '#9A4292',
    },

    {
      titleFontFamily: 'Quicksand',
      fontFamily: 'Quicksand',
      bgColor: '#381535',
      textColor: '#FFFFFF',
      largeShapeColor: '#5D2057',
      smallShapeColor: '#EFA929',
      linkColor: '#EFA929',
    },
  ],

  craftedThemes: [
    {
      titleFontFamily: 'Merriweather',
      fontFamily: 'Quicksand',
      bgColor: '#FDF8F8',
      textColor: '#0E1D24',
      largeShapeColor: '#DCE1E6',
      smallShapeColor: '#DE7584',
    },

    {
      titleFontFamily: 'Quicksand',
      fontFamily: 'Roboto',
      bgColor: '#493A55',
      textColor: '#F7EDEA',
      largeShapeColor: '#BF617A',
      smallShapeColor: '#F7A790',
    },

    {
      titleFontFamily: 'Merriweather',
      fontFamily: 'Roboto',
      bgColor: '#EFEDE3',
      textColor: '#002637',
      largeShapeColor: '#D0CCA8',
      smallShapeColor: '#34827A',
    },

    {
      titleFontFamily: 'Playfair Display',
      fontFamily: 'Quicksand',
      bgColor: '#18526B',
      textColor: '#FDFEEE',
      largeShapeColor: '#387592',
      smallShapeColor: '#FFA7A8',
    },

    {
      titleFontFamily: 'Playfair Display',
      fontFamily: 'Roboto',
      bgColor: '#FFFFFF',
      textColor: '#172037',
      largeShapeColor: '#DCED97',
      smallShapeColor: '#1C47DF',
    },

    {
      titleFontFamily: 'Quicksand',
      fontFamily: 'Roboto',
      bgColor: '#222931',
      textColor: '#E8E8E8',
      largeShapeColor: '#375268',
      smallShapeColor: '#FB565A',
    },

    {
      titleFontFamily: 'Playfair Display',
      fontFamily: 'Roboto',
      bgColor: '#FFFFFF',
      textColor: '#33627E',
      largeShapeColor: '#F4EDA7',
      smallShapeColor: '#DC79CC',
    },

    {
      titleFontFamily: 'Bebas Neue',
      fontFamily: 'Quicksand',
      bgColor: '#4C413C',
      textColor: '#EFEFEF',
      largeShapeColor: '#AB5E5F',
      smallShapeColor: '#FFC173',
    },

    {
      titleFontFamily: 'Bebas Neue',
      fontFamily: 'Space Grotesk',
      bgColor: '#FFFAE2',
      textColor: '#26361A',
      largeShapeColor: '#EAC6A6',
      smallShapeColor: '#C36D31',
    },

    {
      titleFontFamily: 'Merriweather',
      fontFamily: 'Open Sans',
      bgColor: '#191C21',
      textColor: '#FFFFFF',
      largeShapeColor: '#36608C',
      smallShapeColor: '#CED664',
    },

    {
      titleFontFamily: 'Bebas Neue',
      fontFamily: 'Space Grotesk',
      bgColor: '#F4F2ED',
      textColor: '#3E2F3F',
      largeShapeColor: '#EFCBC8',
      smallShapeColor: '#D8486F',
    },

    {
      titleFontFamily: 'Merriweather',
      fontFamily: 'Quicksand',
      bgColor: '#2E3467',
      textColor: '#F5F1A6',
      largeShapeColor: '#272727',
      smallShapeColor: '#DA9BD4',
    },

    {
      titleFontFamily: 'Quicksand',
      fontFamily: 'Roboto',
      bgColor: '#FFFFFF',
      textColor: '#2F3141',
      largeShapeColor: '#D7E3D7',
      smallShapeColor: '#E1895E',
    },

    {
      titleFontFamily: 'Merriweather',
      fontFamily: 'Roboto',
      bgColor: '#364553',
      textColor: '#FEFBF6',
      largeShapeColor: '#E96E7D',
      smallShapeColor: '#A1B899',
    },

    {
      titleFontFamily: 'Playfair Display',
      fontFamily: 'Quicksand',
      bgColor: '#D36340',
      textColor: '#FEFBF6',
      largeShapeColor: '#3D746E',
      smallShapeColor: '#F7E250',
    },

    {
      titleFontFamily: 'Playfair Display',
      fontFamily: 'Roboto',
      bgColor: '#2A323F',
      textColor: '#FEFBF6',
      largeShapeColor: '#E07554',
      smallShapeColor: '#F4B740',
    },

    {
      titleFontFamily: 'Bebas Neue',
      fontFamily: 'Quicksand',
      bgColor: '#E96E7D',
      textColor: '#FEFBF6',
      largeShapeColor: '#4DAAB6',
      smallShapeColor: '#06202B',
    },

    {
      titleFontFamily: 'Bebas Neue',
      fontFamily: 'Space Grotesk',
      bgColor: '#4DAAB6',
      textColor: '#FEFBF6',
      largeShapeColor: '#E96E7D',
      smallShapeColor: '#173845',
    },

    {
      titleFontFamily: 'Quicksand',
      fontFamily: 'Open Sans',
      bgColor: '#F8D476',
      textColor: '#272727',
      largeShapeColor: '#F19F58',
      smallShapeColor: '#45565F',
    },

    {
      titleFontFamily: 'Playfair Display',
      fontFamily: 'Space Grotesk',
      bgColor: '#50636D',
      textColor: '#FFEAB5',
      largeShapeColor: '#F98928',
      smallShapeColor: '#FFFFFF',
    },

    {
      titleFontFamily: 'Quicksand',
      fontFamily: 'Roboto',
      bgColor: '#EDF0F1',
      textColor: '#303D4E',
      largeShapeColor: '#5396D6',
      smallShapeColor: '#DC7150',
    },

    {
      titleFontFamily: 'Merriweather',
      fontFamily: 'Quicksand',
      bgColor: '#24548E',
      textColor: '#FEFBF6',
      largeShapeColor: '#303D4E',
      smallShapeColor: '#F8B49F',
    },
  ],

  animatedThemes: [

    {
      titleFontFamily: 'Quicksand',
      fontFamily: 'Quicksand',
      textColor: '#FFFFFF',
      largeShapeColor: '#3D746E',
      smallShapeColor: '#F7E250',
      bgImage: 'https://cf.quizizz.com/img/presentation/themes/jpg/1080/1_1_red_1080p.jpg',
      bgVideo: 'https://cf.quizizz.com/img/presentation/themes/mp4/1_1_red_720p.mp4',
      bgGif: 'https://cf.quizizz.com/img/presentation/themes/gif/1_1_red.gif',
    },

    {
      titleFontFamily: 'Quicksand',
      fontFamily: 'Quicksand',
      textColor: '#FFFFFF',
      largeShapeColor: '#E96E7D',
      smallShapeColor: '#173845',
      bgImage: 'https://cf.quizizz.com/img/presentation/themes/jpg/1080/1_2_green_1080p.jpg',
      bgVideo: 'https://cf.quizizz.com/img/presentation/themes/mp4/1_2_green_720p.mp4',
      bgGif: 'https://cf.quizizz.com/img/presentation/themes/gif/1_2_green.gif',
    },

    {
      titleFontFamily: 'Quicksand',
      fontFamily: 'Quicksand',
      textColor: '#FFFFFF',
      largeShapeColor: '#E96E7D',
      smallShapeColor: '#173845',
      bgImage: 'https://cf.quizizz.com/img/presentation/themes/jpg/1080/1_3_blue_1080p.jpg',
      bgVideo: 'https://cf.quizizz.com/img/presentation/themes/mp4/1_3_blue_720p.mp4',
      bgGif: 'https://cf.quizizz.com/img/presentation/themes/gif/1_3_blue.gif',
    },

    {
      titleFontFamily: 'Quicksand',
      fontFamily: 'Quicksand',
      textColor: '#070A0E',
      largeShapeColor: '#F19F58',
      smallShapeColor: '#45565F',
      bgImage: 'https://cf.quizizz.com/img/presentation/themes/jpg/1080/1_4_yellow_1080p.jpg',
      bgVideo: 'https://cf.quizizz.com/img/presentation/themes/mp4/1_4_yellow_720p.mp4',
      bgGif: 'https://cf.quizizz.com/img/presentation/themes/gif/1_4_yellow.gif',
    },

    {
      titleFontFamily: 'Merriweather',
      fontFamily: 'Open Sans',
      textColor: '#FFFFFF',
      largeShapeColor: '#E96E7D',
      smallShapeColor: '#A1B899',
      bgImage: 'https://cf.quizizz.com/img/presentation/themes/jpg/1080/2_1_audi_1080p.jpg',
      bgVideo: 'https://cf.quizizz.com/img/presentation/themes/mp4/2_1_audi_720p.mp4',
      bgGif: 'https://cf.quizizz.com/img/presentation/themes/gif/2_1_audi.gif',
    },

    {
      titleFontFamily: 'Merriweather',
      fontFamily: 'Open Sans',
      textColor: '#FFFFFF',
      largeShapeColor: '#36608C',
      smallShapeColor: '#CED664',
      bgImage: 'https://cf.quizizz.com/img/presentation/themes/jpg/1080/2_2_map_1080p.jpg',
      bgVideo: 'https://cf.quizizz.com/img/presentation/themes/mp4/2_2_map_720p.mp4',
      bgGif: 'https://cf.quizizz.com/img/presentation/themes/gif/2_2_map.gif',
    },

    {
      titleFontFamily: 'Quicksand',
      fontFamily: 'Roboto',
      textColor: '#FFFFFF',
      largeShapeColor: '#36608C',
      smallShapeColor: '#CED664',
      bgImage: 'https://cf.quizizz.com/img/presentation/themes/jpg/1080/2_3_plexus_1080p.jpg',
      bgVideo: 'https://cf.quizizz.com/img/presentation/themes/mp4/2_3_plexus_720p.mp4',
      bgGif: 'https://cf.quizizz.com/img/presentation/themes/gif/2_3_plexus.gif',
    },

    {
      titleFontFamily: 'Quicksand',
      fontFamily: 'Roboto',
      textColor: '#070A0E',
      largeShapeColor: '#5396D6',
      smallShapeColor: '#DC7150',
      bgImage: 'https://cf.quizizz.com/img/presentation/themes/jpg/1080/2_4_light_1080p.jpg',
      bgVideo: 'https://cf.quizizz.com/img/presentation/themes/mp4/2_4_light_720p.mp4',
      bgGif: 'https://cf.quizizz.com/img/presentation/themes/gif/2_4_light.gif',
    },

    {
      titleFontFamily: 'Merriweather',
      fontFamily: 'Quicksand',
      textColor: '#FFFFFF',
      largeShapeColor: '#272727',
      smallShapeColor: '#DA9BD4',
      bgImage: 'https://cf.quizizz.com/img/presentation/themes/jpg/1080/3_2_energy_1080p.jpg',
      bgVideo: 'https://cf.quizizz.com/img/presentation/themes/mp4/3_2_energy_720p.mp4',
      bgGif: 'https://cf.quizizz.com/img/presentation/themes/gif/3_2_energy.gif',
    },

    {
      titleFontFamily: 'Merriweather',
      fontFamily: 'Roboto',
      textColor: '#FFFFFF',
      largeShapeColor: '#E96E7D',
      smallShapeColor: '#A1B899',
      bgImage: 'https://cf.quizizz.com/img/presentation/themes/jpg/1080/3_3_stars_1080p.jpg',
      bgVideo: 'https://cf.quizizz.com/img/presentation/themes/mp4/3_3_stars_720p.mp4',
      bgGif: 'https://cf.quizizz.com/img/presentation/themes/gif/3_3_stars.gif',
    },

    {
      titleFontFamily: 'Quicksand',
      fontFamily: 'Roboto',
      textColor: '#070A0E',
      largeShapeColor: '#D7E3D7',
      smallShapeColor: '#E1895E',
      bgImage: 'https://cf.quizizz.com/img/presentation/themes/jpg/1080/3_4_jungle_1080p.jpg',
      bgVideo: 'https://cf.quizizz.com/img/presentation/themes/mp4/3_4_jungle_720p.mp4',
      bgGif: 'https://cf.quizizz.com/img/presentation/themes/gif/3_4_jungle.gif',
    },

    {
      titleFontFamily: 'Merriweather',
      fontFamily: 'Roboto',
      textColor: '#FFFFFF',
      largeShapeColor: '#E07554',
      smallShapeColor: '#F4B740',
      bgImage: 'https://cf.quizizz.com/img/presentation/themes/jpg/1080/3_5_mountain_1080p.jpg',
      bgVideo: 'https://cf.quizizz.com/img/presentation/themes/mp4/3_5_mountain_720p.mp4',
      bgGif: 'https://cf.quizizz.com/img/presentation/themes/gif/3_5_mountain.gif',
    },
  ],
};

function addId(theme) {
  theme.id = nanoid(6);
  return theme;
}

themes.basicThemes = themes.basicThemes.map(addId);
themes.craftedThemes = themes.craftedThemes.map(addId);
themes.animatedThemes = themes.animatedThemes.map(addId);

export default themes;
