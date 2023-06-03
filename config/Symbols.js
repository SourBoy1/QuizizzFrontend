import i18n from '../services/i18n';

export const KeyTable = [i18n('math'), i18n('greek'), i18n('latin'), i18n('currency'), i18n('emoji')];

export const Symbols = {
  math: [
    {
      type: 'group',
      name: i18n('Common Arithmetic & Algebra'),
      symbols: [
        {
          name: i18n('LESS THAN'),
          code: '&#x3C;',
        }, {
          name: i18n('GREATER THAN'),
          code: '&#x3E;',
        }, {
          name: i18n('LESS THAN OR EQUAL TO '),
          code: '&#x2264;',
        }, {
          name: i18n('GREATER THAN OR EQUAL TO '),
          code: '&#x2265;',
        }, {
          name: i18n('PLUS OR MINUS '),
          code: '&#xB1;',
        }, {
          name: i18n('NOT EQUALS '),
          code: '&#x2260;',
        }, {
          name: i18n('DIVISION SIGN'),
          code: '&#xF7;',
        }, {
          name: i18n('TIMES X '),
          code: '&#x00D7;',
        }, {
          name: i18n('MINUS '),
          code: '&#x2212;',
        }, {
          name: i18n('DIVISION SLASH'),
          code: '&#x2215;',
        }, {
          name: i18n('FRACTION SLASH'),
          code: '&#x2044;',
        }, {
          name: i18n('SQUARE ROOT RADICAL '),
          code: '&#x221A;',
        }, {
          name: i18n('CUBE ROOT'),
          code: '&#x221B;',
        }, {
          name: i18n('FOURTH ROOT'),
          code: '&#x221C;',
        }, {
          name: i18n('INFINITY'),
          code: '&#x221E;',
        }, {
          name: i18n('ALEF INFINITY SYMBOL '),
          code: '&#x2135;',
        }, {
          name: i18n('FUNCTION ITALIC F '),
          code: '&#x192;',
        }, {
          name: i18n('PRIME (single quote)  '),
          code: '&#x2032;',
        }, {
          name: i18n('DOUBLE PRIME (double quote) '),
          code: '&#x2033;',
        }, {
          name: i18n('TRIPLE PRIME (triple quote) '),
          code: '&#x2034;',
        }, {
          name: i18n('THEREFORE (Triangular Dots) '),
          code: '&#x2234;',
        }, {
          name: i18n(' DOT OPERATOR'),
          code: '&#x22C5',
        }, {
          name: i18n('SUPERSCRIPT TWO '),
          code: '&#xB9;',
        }, {
          name: i18n('SUPERSCRIPT TWO '),
          code: '&#xB2;',
        }, {
          name: i18n('SUPERSCRIPT THREE'),
          code: '&#xB3;',
        }, {
          name: i18n('LEFT ANGLE BRACKET'),
          code: '&#x2329;',
        }, {
          name: i18n('RIGHT ANGLE BRACKET'),
          code: '&#x232A;',
        }, {
          name: i18n('LEFT CEILING BRACKET'),
          code: '&#x2308;',
        }, {
          name: i18n('RIGHT CEILING BRACKET'),
          code: '&#x2309;',
        }, {
          name: i18n('LEFT FLOOR BRACKET'),
          code: '&#x230A;',
        }, {
          name: i18n('RIGHT FLOOR BRACKET'),
          code: '&#x230B;',
        }, {
          name: i18n('CIRCLED PLUS (Direct Sum) '),
          code: '&#x2295;',
        }, {
          name: i18n('CIRCLED TIMES (Vector Product) '),
          code: '&#x2297;',
        }, {
          code: '&#x02192;',
          name: i18n('Right arrow'),
        }, {
          code: '&#x02190;',
          name: i18n('Left Arrow'),
        }, {
          code: '&#x02194;',
          name: i18n('Double Arrow'),
        }, {
          name: i18n('Overline e.g. 3&#x0305; (insert after digit)'),
          code: '&#x0305;',
        },
      ],
    },
    {
      type: 'group',
      name: i18n('Common Greek Symbols'),
      symbols: [
        {
          code: '&#x03C0;',
          name: i18n('Greek Small Letter Pi'),
        }, {
          code: '&#x03B1;',
          name: i18n('Greek Small Letter Alpha'),
        }, {
          code: '&#x03B2;',
          name: i18n('Greek Small Letter Beta'),
        }, {
          code: '&#x0393;',
          name: i18n('Greek Capital Letter Gamma'),
        }, {
          code: '&#x03B3;',
          name: i18n('Greek Small Letter Gamma'),
        }, {
          code: '&#x0394;',
          name: i18n('Greek Capital Letter Delta'),
        }, {
          code: '&#x03B4;',
          name: i18n('Greek Small Letter Delta'),
        }, {
          code: '&#x03B5;',
          name: i18n('Greek Small Letter Epsilon'),
        }, {
          code: '&#x03B6;',
          name: i18n('Greek Small Letter Zeta'),
        }, {
          code: '&#x03B7;',
          name: i18n('Greek Small Letter Eta'),
        }, {
          code: '&#x0398;',
          name: i18n('Greek Capital Letter Theta'),
        }, {
          code: '&#x03B8;',
          name: i18n('Greek Small Letter Theta'),
        }, {
          code: '&#x03B9;',
          name: i18n('Greek Small Letter Iota'),
        }, {
          code: '&#x03BA;',
          name: i18n('Greek Small Letter Kappa'),
        }, {
          code: '&#x039B;',
          name: i18n('Greek Capital Letter Lambda'),
        }, {
          code: '&#x03BB;',
          name: i18n('Greek Small Letter Lambda'),
        }, {
          code: '&#x03BC;',
          name: i18n('Greek Small Letter Mu'),
        }, {
          code: '&#x03BD;',
          name: i18n('Greek Small Letter Nu'),
        }, {
          code: '&#x03BE;',
          name: i18n('Greek Small Letter Xi'),
        }, {
          code: '&#x03BF;',
          name: i18n('Greek Small Letter Omicron'),
        }, {
          code: '&#x03A0;',
          name: i18n('Greek Capital Letter Pi'),
        }, {
          code: '&#x03C0;',
          name: i18n('Greek Small Letter Pi'),
        }, {
          code: '&#x03C1;',
          name: i18n('Greek Small Letter Rho'),
        }, {
          code: '&#x03A3;',
          name: i18n('Greek Capital Letter Sigma'),
        }, {
          code: '&#x03C3;',
          name: i18n('Greek Small Letter Sigma'),
        }, {
          code: '&#x03C4;',
          name: i18n('Greek Small Letter Tau'),
        }, {
          code: '&#x03C5;',
          name: i18n('Greek Small Letter Upsilon'),
        }, {
          code: '&#x03A6;',
          name: i18n('Greek Capital Letter Phi'),
        }, {
          code: '&#x03C6;',
          name: i18n('Greek Small Letter Phi'),
        }, {
          code: '&#x03C7;',
          name: i18n('Greek Small Letter Chi'),
        }, {
          code: '&#x03A8;',
          name: i18n('Greek Capital Letter Psi'),
        }, {
          code: '&#x03C8;',
          name: i18n('Greek Small Letter Psi'),
        }, {
          code: '&#x03A9;',
          name: i18n('Greek Capital Letter Omega'),
        }, {
          code: '&#x03C9;',
          name: i18n('Greek Small Letter Omega'),
        },
      ],
    },
    {
      type: 'group',
      name: i18n('Superscript and Subscript'),
      symbols: [
        {
          name: i18n('SUPERSCRIPT ZERO'),
          code: '&#x2070;',
        }, {
          name: i18n('SUPERSCRIPT ONE\n        Entity Code = &sup1; '),
          code: '&#x00B9;',
        }, {
          name: i18n('SUPERSCRIPT TWO \n        Entity Code = &sup2; '),
          code: '&#x00B2;',
        }, {
          name: i18n('SUPERSCRIPT THREE \n        Entity Code = &sup3; '),
          code: '&#x00B3;',
        }, {
          name: i18n('SUPERSCRIPT FOUR'),
          code: '&#x2074;',
        }, {
          name: i18n('SUPERSCRIPT FIVE'),
          code: '&#x2075;',
        }, {
          name: i18n('SUPERSCRIPT SIX'),
          code: '&#x2076;',
        }, {
          name: i18n('SUPERSCRIPT SEVEN'),
          code: '&#x2077;',
        }, {
          name: i18n('SUPERSCRIPT EIGHT'),
          code: '&#x2078;',
        }, {
          name: i18n('SUPERSCRIPT NINE'),
          code: '&#x2079;',
        }, {
          name: i18n('SUPERSCRIPT PLUS SIGN'),
          code: '&#x207A;',
        }, {
          name: i18n('SUPERSCRIPT MINUS'),
          code: '&#x207B;',
        }, {
          name: i18n('SUPERSCRIPT EQUALS SIGN'),
          code: '&#x207C;',
        }, {
          name: i18n('SUPERSCRIPT LEFT PARENTHESIS'),
          code: '&#x207D;',
        }, {
          name: i18n('SUPERSCRIPT RIGHT PARENTHESIS'),
          code: '&#x207E;',
        }, {
          name: i18n('SUPERSCRIPT LATIN SMALL LETTER I'),
          code: '&#x2071;',
        }, {
          name: i18n('SUPERSCRIPT LATIN SMALL LETTER N'),
          code: '&#x207F;',
        }, {
          name: i18n('SUBSCRIPT ZERO'),
          code: '&#x2080;',
        }, {
          name: i18n('SUBSCRIPT ONE'),
          code: '&#x2081;',
        }, {
          name: i18n('SUBSCRIPT TWO'),
          code: '&#x2082;',
        }, {
          name: i18n('SUBSCRIPT THREE'),
          code: '&#x2083;',
        }, {
          name: i18n('SUBSCRIPT FOUR'),
          code: '&#x2084;',
        }, {
          name: i18n('SUBSCRIPT FIVE'),
          code: '&#x2085;',
        }, {
          name: i18n('SUBSCRIPT SIX'),
          code: '&#x2086;',
        }, {
          name: i18n('SUBSCRIPT SEVEN'),
          code: '&#x2087;',
        }, {
          name: i18n('SUBSCRIPT EIGHT'),
          code: '&#x2088;',
        }, {
          name: i18n('SUBSCRIPT NINE'),
          code: '&#x2089;',
        }, {
          name: i18n('SUBSCRIPT PLUS SIGN'),
          code: '&#x208A;',
        }, {
          name: i18n('SUBSCRIPT MINUS'),
          code: '&#x208B;',
        }, {
          name: i18n('SUBSCRIPT EQUALS SIGN'),
          code: '&#x208C;',
        }, {
          name: i18n('SUBSCRIPT LEFT PARENTHESIS'),
          code: '&#x208D;',
        }, {
          name: i18n('SUBSCRIPT RIGHT PARENTHESIS'),
          code: '&#x208E;',
        }, {
          name: i18n('LATIN SUBSCRIPT SMALL LETTER A'),
          code: '&#x2090;',
        }, {
          name: i18n('LATIN SUBSCRIPT SMALL LETTER E'),
          code: '&#x2091;',
        }, {
          name: i18n('LATIN SUBSCRIPT SMALL LETTER O'),
          code: '&#x2092;',
        }, {
          name: i18n('LATIN SUBSCRIPT SMALL LETTER I'),
          code: '&#x1D62;',
        }, {
          name: i18n('LATIN SUBSCRIPT SMALL LETTER R'),
          code: '&#x1D63;',
        }, {
          name: i18n('LATIN SUBSCRIPT SMALL LETTER U'),
          code: '&#x1D64;',
        }, {
          name: i18n('LATIN SUBSCRIPT SMALL LETTER V'),
          code: '&#x1D65;',
        }, {
          name: i18n('LATIN SUBSCRIPT SMALL LETTER X'),
          code: '&#x2093;',
        }, {
          name: i18n('GREEK SUBSCRIPT SMALL LETTER BETA'),
          code: '&#x1D66;',
        }, {
          name: i18n('GREEK SUBSCRIPT SMALL LETTER GAMMA'),
          code: '&#x1D67;',
        }, {
          name: i18n('GREEK SUBSCRIPT SMALL LETTER RHO'),
          code: '&#x1D68;',
        }, {
          name: i18n('GREEK SUBSCRIPT SMALL LETTER PHI'),
          code: '&#x1D69;',
        }, {
          name: i18n('GREEK SUBSCRIPT SMALL LETTER CHI'),
          code: '&#x1D6A;',
        },
      ],
    },
    {
      type: 'group',
      name: i18n('Fractions'),
      symbols: [
        {
          name: i18n('VULGAR FRACTION 1/4 '),
          code: '&#xBC;',
        }, {
          name: i18n('VULGAR FRACTION 1/2 '),
          code: '&#xBD;',
        }, {
          name: i18n('VULGAR FRACTION 3/4 '),
          code: '&#xBE;',
        }, {
          name: i18n('VULGAR FRACTION 1/3 '),
          code: '&#x2153;',
        }, {
          name: i18n('VULGAR FRACTION 2/3 '),
          code: '&#x2154;',
        }, {
          name: i18n('VULGAR FRACTION 1/5 '),
          code: '&#x2155;',
        }, {
          name: i18n('VULGAR FRACTION 2/5 '),
          code: '&#x2156;',
        }, {
          name: i18n('VULGAR FRACTION 3/5 '),
          code: '&#x2157;',
        }, {
          name: i18n('VULGAR FRACTION 4/5 '),
          code: '&#x2158;',
        }, {
          name: i18n('VULGAR FRACTION 1/6 '),
          code: '&#x2159;',
        }, {
          name: i18n('VULGAR FRACTION 5/6 '),
          code: '&#x215A;',
        }, {
          name: i18n('VULGAR FRACTION 1/8 '),
          code: '&#x215B;',
        }, {
          name: i18n('VULGAR FRACTION 3/8 '),
          code: '&#x215C;',
        }, {
          name: i18n('VULGAR FRACTION 5/8 '),
          code: '&#x215D;',
        }, {
          name: i18n('VULGAR FRACTION 7/8 '),
          code: '&#x215E;',
        },
      ],
    },
    {
      type: 'group',
      name: i18n('Common Statistics'),
      symbols: [
        {
          name: i18n('LOWER CASE MU (Mean) '),
          code: '&#x3BC;',
        }, {
          name: i18n('LOWER CASE SIGMA (Standard Deviation) '),
          code: '&#x3C3;',
        }, {
          name: i18n('LOWER CASE CHI '),
          code: '&#x3C7;',
        }, {
          name: i18n('CAPITAL SIGMA N-ARY SUMMATION'),
          code: '&#x2211;',
        }, {
          name: i18n('CAPITAL PI N-ARY PRODUCT '),
          code: '&#x220F;',
        }, {
          name: i18n('N-ARY COPRODUCT (upside down capital pi) '),
          code: '&#x2210;',
        }, {
          name: i18n('X-Bar (Average)'),
          code: 'x&#772;',
        }, {
          name: i18n('P-Hat'),
          code: 'p&#770;',
        },
      ],
    },
    {
      type: 'group',
      name: i18n('Measurement Symbols'),
      symbols: [
        {
          name: i18n('DEGREE SYMBOL '),
          code: '&#xB0;',
        }, {
          name: i18n('MICRO MU SYMBOL  '),
          code: '&#xB5;',
        }, {
          name: i18n('SINGLE PRIME (feet, degree minutes)  '),
          code: '&#x2032;',
        }, {
          name: i18n('DOUBLE PRIME (inches, degree minutes)  '),
          code: '&#x2033;',
        }, {
          name: i18n('PER MILLE (1/1000th)   '),
          code: '&#x2030;',
        },
      ],
    },
    {
      type: 'group',
      name: i18n('Calculus'),
      symbols: [
        {
          name: i18n('INTEGRAL'),
          code: '&#x222B;',
        }, {
          name: i18n('PARTIAL DIFFERENTIAL '),
          code: '&#X2202;',
        }, {
          name: i18n('INCREMENT (Difference or capital Delta)'),
          code: '&#x2206;',
        }, {
          name: i18n('NABLA (Backward Difference, Grad or upside down triangle) '),
          code: '&#x2207;',
        }, {
          name: i18n('DOUBLE INTEGRAL'),
          code: '&#x222C;',
        }, {
          name: i18n('TRIPLE INTEGRAL'),
          code: '&#x222D;',
        }, {
          name: i18n('QUADRUPLE INTEGRAL'),
          code: '&#x2A0C;',
        }, {
          name: i18n('CONTOUR INTEGRAL'),
          code: '&#x222E;',
        }, {
          name: i18n('SURFACE INTEGRAL'),
          code: '&#x222F;',
        }, {
          name: i18n('VOLUME INTEGRAL'),
          code: '&#x2230;',
        }, {
          name: i18n('CLOCKWISE INTEGRAL'),
          code: '&#x2231;',
        }, {
          name: i18n('ANTICLOCKWISE INTEGRAL'),
          code: '&#x2A11;',
        }, {
          name: i18n('CLOCKWISE CONTOUR INTEGRAL'),
          code: '&#x2232;',
        }, {
          name: i18n('ANTICLOCKWISE CONTOUR INTEGRAL'),
          code: '&#x2233;',
        },
      ],
    },
    {
      type: 'group',
      name: i18n('Letter Symbols'),
      symbols: [
        {
          name: i18n('INFINITY  (Sideways 8) '),
          code: '&#x221E;',
        }, {
          name: i18n('ALEF INFINITY SYMBOL '),
          code: '&#x2135;',
        }, {
          name: i18n('WEIERSTRASS POWER SET (Script Capital P) '),
          code: '&#x2118;',
        }, {
          name: i18n('IMAGINARY Part   (Blackletter I) '),
          code: '&#x2111;',
        }, {
          name: i18n('REAL NUMBER   (Blackletter R) '),
          code: '&#x211C;',
        }, {
          name: i18n('DOUBLE-STRUCK REAL NUMBER   (Doublestruck R) '),
          code: '&#x211D;',
        }, {
          name: i18n('COMPLEX NUMBERS   (Doublestruck C) '),
          code: '&#x2102;',
        }, {
          name: i18n('NATURAL NUMBERS (Doublestruck N) '),
          code: '&#x2115;',
        }, {
          name: i18n('PRIME NUMBERS (Doublestruck P) '),
          code: '&#x2119;',
        }, {
          name: i18n('RATIONAL NUMBERS (Doublestruck Q) '),
          code: '&#x211A;',
        }, {
          name: i18n('INTEGERS (Doublestruck Z) '),
          code: '&#x2124;',
        },
      ],
    },
    {
      type: 'group',
      name: i18n('Logic & Set Theory'),
      symbols: [
        {
          name: i18n('FOR ALL (Upside-down A) '),
          code: '&#x2200;',
        }, {
          name: i18n('COMPLEMENT (Thin C) '),
          code: '&#x2201;',
        }, {
          name: i18n('THERE EXISTS (Backwards E) '),
          code: '&#x2203;',
        }, {
          name: i18n('THERE DOES NOT EXIST (Backwards E with slash) '),
          code: '&#x2204;',
        }, {
          name: i18n('EMPTY SET (O slash) '),
          code: '&#x2205;',
        }, {
          name: i18n('NOT SYMBOL (Corner) '),
          code: '&#xAC;',
        }, {
          name: i18n('TILDE (Alternate Not Symbol) '),
          code: '--',
        }, {
          name: i18n('LOGICAL AND (Wedge or Upside down V Symbol) '),
          code: '&#x2227;',
        }, {
          name: i18n('LOGICAL OR (V Symbol) '),
          code: '&#x2228;',
        }, {
          name: i18n('XOR'),
          code: '&#x22BB;',
        }, {
          name: i18n('NAND'),
          code: '&#x22BC;',
        }, {
          name: i18n('NOR'),
          code: '&#x22BD;',
        }, {
          name: i18n('INTERSECTION (Cap or Upside Down U) '),
          code: '&#x2229;',
        }, {
          name: i18n('UNION (Cup or U Symbol) '),
          code: '&#x222A;',
        }, {
          name: i18n('ELEMENT OF '),
          code: '&#x2208;',
        }, {
          name: i18n('NOT AN ELEMENT OF'),
          code: '&#x2209;',
        }, {
          name: i18n('SMALL ELEMENT OF'),
          code: '&#x220A;',
        }, {
          name: i18n('CONTAINS AS MEMBER'),
          code: '&#x220B;',
        }, {
          name: i18n('DOES NOT CONTAIN AS MEMBER'),
          code: '&#x220C;',
        }, {
          name: i18n('SMALL CONTAINS AS MEMBER'),
          code: '&#x220D;',
        }, {
          name: i18n('SET MINUS'),
          code: '&#x2216;',
        }, {
          name: i18n('SUBSET OF (Sideways U with cap to left) '),
          code: '&#x2282;',
        }, {
          name: i18n('SUPERSET OF (Sideways U with cap to right) '),
          code: '&#x2283;',
        }, {
          name: i18n('NOT A SUBSET OF (Subset with Slash) '),
          code: '&#x2284;',
        }, {
          name: i18n('NOT A SUPERSET OF (Superset with slash) '),
          code: '&#x2285;',
        }, {
          name: i18n('SUBSET OF OR EQUAL TO (Subset with line below) '),
          code: '&#x2286;',
        }, {
          name: i18n('SUPERSET OF OR EQUAL TO (Superset with line below) '),
          code: '&#x2287;',
        }, {
          name: i18n('NEITHER A SUBSET OF NOR EQUAL TO'),
          code: '&#x2288;',
        }, {
          name: i18n('NEITHER A SUPERSET OF NOR EQUAL TO'),
          code: '&#x2289;',
        }, {
          name: i18n('SUBSET OF WITH NOT EQUAL TO'),
          code: '&#x228A;',
        }, {
          name: i18n('SUPERSET OF WITH NOT EQUAL TO'),
          code: '&#x228B;',
        }, {
          name: i18n('DIAMOND OPERATOR \n      (Possibility)'),
          code: '&#x22C4;',
        }, {
          name: i18n('ASYMPTOTICALLY EQUAL TO\n      One to one Correspondence '),
          code: '&#x2243;',
        }, {
          name: i18n('NOT ASYMPTOTICALLY EQUAL TO'),
          code: '&#x2244;',
        }, {
          name: i18n('MULTISET (U with arrow) '),
          code: '&#x228C;',
        }, {
          name: i18n('MULTISET MULTIPLICATION (U with dot in center) '),
          code: '&#x228D;',
        }, {
          name: i18n('MULTISET UNION (U with plus in center) '),
          code: '&#x228E;',
        }, {
          name: i18n('DOUBLE SUBSET'),
          code: '&#x22D0;',
        }, {
          name: i18n('DOUBLE SUPERSET'),
          code: '&#x22D1;',
        }, {
          name: i18n('DOUBLE INTERSECTION'),
          code: '&#x22D2;',
        }, {
          name: i18n('DOUBLE UNION'),
          code: '&#x22D3;',
        }, {
          name: i18n('N-ARY LOGICAL AND'),
          code: '&#x22C0;',
        }, {
          name: i18n('N-ARY LOGICAL OR'),
          code: '&#x22C1;',
        }, {
          name: i18n('N-ARY INTERSECTION/td> '),
          code: '&#x22C2;',
        }, {
          name: i18n('N-ARY UNION'),
          code: '&#x22C3;',
        }, {
          name: i18n('CURLY LOGICAL OR'),
          code: '&#x22CE;',
        }, {
          name: i18n('CURLY LOGICAL AND'),
          code: '&#x22CF;',
        }, {
          name: i18n('CIRCLED PLUS (Direct Sum) '),
          code: '&#x2295;',
        }, {
          name: i18n('CIRCLED TIMES (Vector Product) '),
          code: '&#x2297;',
        }, {
          name: i18n('CIRCLED MINUS'),
          code: '&#x2296;',
        }, {
          name: i18n('CIRCLED DIVISION SLASH'),
          code: '&#x2298;',
        }, {
          name: i18n('ELEMENT OF WITH LONG HORIZONTAL STROKE'),
          code: '&#x22F2;',
        }, {
          name: i18n('ELEMENT OF WITH VERTICAL BAR AT END OF HORIZONTAL STROKE'),
          code: '&#x22F3;',
        }, {
          name: i18n('SMALL ELEMENT OF WITH VERTICAL BAR AT END OF HORIZONTAL STROKE'),
          code: '&#x22F4;',
        }, {
          name: i18n('ELEMENT OF WITH DOT ABOVE'),
          code: '&#x22F5;',
        }, {
          name: i18n('ELEMENT OF WITH OVERBAR'),
          code: '&#x22F6;',
        }, {
          name: i18n('SMALL ELEMENT OF WITH OVERBAR'),
          code: '&#x22F7;',
        }, {
          name: i18n('ELEMENT OF WITH UNDERBAR'),
          code: '&#x22F8;',
        }, {
          name: i18n('ELEMENT OF WITH TWO HORIZONTAL STROKES'),
          code: '&#x22F9;',
        }, {
          name: i18n('CONTAINS WITH LONG HORIZONTAL STROKE'),
          code: '&#x22FA;',
        }, {
          name: i18n('CONTAINS WITH VERTICAL BAR AT END OF HORIZONTAL STROKE'),
          code: '&#x22FB;',
        }, {
          name: i18n('SMALL CONTAINS WITH VERTICAL BAR AT END OF HORIZONTAL STROKE'),
          code: '&#x22FC;',
        }, {
          name: i18n('CONTAINS WITH OVERBAR'),
          code: '&#x22FD;',
        }, {
          name: i18n('SMALL CONTAINS WITH OVERBAR'),
          code: '&#x22FE;',
        }, {
          name: i18n('NOTATION BAG MEMBERSHIP'),
          code: '&#x22FF;',
        },
      ],
    },
    {
      type: 'group',
      name: i18n('Geometric Symbols'),
      symbols: [
        {
          name: i18n('RIGHT ANGLE'),
          code: '&#x221F;',
        }, {
          name: i18n('ANGLE \n      Entity Code = &ang;'),
          code: '&#x2220;',
        }, {
          name: i18n('MEASURED ANGLE'),
          code: '&#x2221;',
        }, {
          name: i18n('SPHERICAL ANGLE'),
          code: '&#x2222;',
        }, {
          name: i18n('DIVIDES'),
          code: '&#x2223;',
        }, {
          name: i18n('DOES NOT DIVIDE'),
          code: '&#x2224;',
        }, {
          name: i18n('PARALLEL TO'),
          code: '&#x2225;',
        }, {
          name: i18n('NOT PARALLEL TO'),
          code: '&#x2226;',
        }, {
          name: i18n('RIGHT ANGLE WITH ARC'),
          code: '&#x22BE;',
        }, {
          name: i18n('RIGHT TRIANGLE'),
          code: '&#x22BF;',
        }, {
          name: i18n('UP TACK (Perpendicular) \n      Entity Code = &perp; '),
          code: '&#x22A5;',
        }, {
          name: i18n('RIGHT TACK'),
          code: '&#x22A2;',
        }, {
          name: i18n('LEFT TACK'),
          code: '&#x22A3;',
        }, {
          name: i18n('DOWN TACK'),
          code: '&#x22A4;',
        }, {
          name: i18n('THEREFORE (Triangular Dots)\n      Entity Code = &there4;'),
          code: '&#x2234;',
        }, {
          name: i18n('BECAUSE (Upside down Triangular Dots) '),
          code: '&#x2235;',
        }, {
          name: i18n('PROPORTIONAL TO\n      Entity Code = &prop;'),
          code: '&#x221D;',
        }, {
          name: i18n('END OF PROOF (solid rectangle) '),
          code: '&#x220E;',
        },
      ],
    },
    {
      type: 'group',
      name: i18n('Equivalence and Proportion'),
      symbols: [
        {
          name: i18n('NOT EQUALS '),
          code: '&#x2260;',
        }, {
          name: i18n('APPROXIMATELY EQUAL'),
          code: '&#x2245;',
        }, {
          name: i18n('ALMOST EQUAL (ASYMPTOTIC) '),
          code: '&#x2248;',
        }, {
          name: i18n('NOT ALMOST EQUAL TO'),
          code: '&#x2249;',
        }, {
          name: i18n('TILDE SIMILAR TO '),
          code: '&#x223C;',
        }, {
          name: i18n('IDENTICAL TO   (three lines) '),
          code: '&#x2261;',
        }, {
          name: i18n('NOT IDENTICAL TO'),
          code: '&#x2262;',
        }, {
          name: i18n('STRICTLY EQUIVALENT TO'),
          code: '&#x2263;',
        }, {
          name: i18n('NOT IDENTICAL TO'),
          code: '&#x2262;',
        }, {
          name: i18n('LESS-THAN OVER EQUAL TO'),
          code: '&#x2266;',
        }, {
          name: i18n('GREATER-THAN OVER EQUAL TO'),
          code: '&#x2267;',
        }, {
          name: i18n('LESS-THAN BUT NOT EQUAL TO'),
          code: '&#x2268;',
        }, {
          name: i18n('GREATER-THAN BUT NOT EQUAL TO'),
          code: '&#x2269;',
        }, {
          name: i18n('MUCH LESS-THAN'),
          code: '&#x226A;',
        }, {
          name: i18n('MUCH GREATER-THAN'),
          code: '&#x226B;',
        }, {
          name: i18n('BETWEEN'),
          code: '&#x226C;',
        }, {
          name: i18n('NOT EQUIVALENT TO'),
          code: '&#x226D;',
        }, {
          name: i18n('NOT LESS-THAN'),
          code: '&#x226E;',
        }, {
          name: i18n('NOT GREATER-THAN'),
          code: '&#x226F;',
        }, {
          name: i18n('NEITHER LESS-THAN NOR EQUAL TO'),
          code: '&#x2270;',
        }, {
          name: i18n('NEITHER GREATER-THAN NOR EQUAL TO'),
          code: '&#x2271;',
        }, {
          name: i18n('LESS-THAN OR EQUIVALENT TO'),
          code: '&#x2272;',
        }, {
          name: i18n('GREATER-THAN OR EQUIVALENT TO'),
          code: '&#x2273;',
        }, {
          name: i18n('NEITHER LESS-THAN NOR EQUIVALENT TO'),
          code: '&#x2274;',
        }, {
          name: i18n('NEITHER GREATER-THAN NOR EQUIVALENT TO'),
          code: '&#x2275;',
        }, {
          name: i18n('LESS-THAN OR GREATER-THAN'),
          code: '&#x2276;',
        }, {
          name: i18n('GREATER-THAN OR LESS-THAN'),
          code: '&#x2277;',
        }, {
          name: i18n('NEITHER LESS-THAN NOR GREATER-THAN'),
          code: '&#x2278;',
        }, {
          name: i18n('NEITHER GREATER-THAN NOR LESS-THAN'),
          code: '&#x2279;',
        }, {
          name: i18n('NOT TILDE'),
          code: '&#x2241;',
        }, {
          name: i18n('MINUS TILDE'),
          code: '&#x2242;',
        }, {
          name: i18n('ASYMPTOTICALLY EQUAL TO'),
          code: '&#x2243;',
        }, {
          name: i18n('NOT ASYMPTOTICALLY EQUAL TO'),
          code: '&#x2244;',
        }, {
          name: i18n('APPROXIMATELY BUT NOT ACTUALLY EQUAL TO'),
          code: '&#x2246;',
        }, {
          name: i18n('NEITHER APPROXIMATELY NOR ACTUALLY EQUAL TO'),
          code: '&#x2247;',
        }, {
          name: i18n('NOT ALMOST EQUAL TO'),
          code: '&#x2249;',
        }, {
          name: i18n('ALMOST EQUAL OR EQUAL TO'),
          code: '&#x224A;',
        }, {
          name: i18n('TRIPLE TILDE'),
          code: '&#x224B;',
        }, {
          name: i18n('ALL EQUAL TO'),
          code: '&#x224C;',
        },
      ],
    },
    {
      type: 'group',
      name: i18n('Other Mathematical Symbols'),
      symbols: [
        {
          name: i18n('MINUS-OR-PLUS SIGN'),
          code: '&#x2213;',
        }, {
          name: i18n('DOT PLUS'),
          code: '&#x2214;',
        }, {
          name: i18n('ASTERISK OPERATOR'),
          code: '&#x2217;',
        }, {
          name: i18n('RING OPERATOR'),
          code: '&#x2218;',
        }, {
          name: i18n('BULLET OPERATOR '),
          code: '&#x2219;',
        }, {
          name: i18n('PROPORTIONAL TO'),
          code: '&#x221D;',
        }, {
          name: i18n('RATIO'),
          code: '&#x2236;',
        }, {
          name: i18n('PROPORTION'),
          code: '&#x2237;',
        }, {
          name: i18n('DOT MINUS'),
          code: '&#x2238 ;',
        }, {
          name: i18n('EXCESS'),
          code: '&#x2239;',
        }, {
          name: i18n('GEOMETRIC PROPORTION'),
          code: '&#x223A;',
        }, {
          name: i18n('HOMOTHETIC'),
          code: '&#x223B;',
        }, {
          name: i18n('TILDE OPERATOR'),
          code: '&#x223C;',
        }, {
          name: i18n('REVERSED TILDE'),
          code: '&#x223D;',
        }, {
          name: i18n('INVERTED LAZY S'),
          code: '&#x223E;',
        }, {
          name: i18n('SINE WAVE'),
          code: '&#x223F;',
        }, {
          name: i18n('WREATH PRODUCT'),
          code: '&#x2240;',
        }, {
          name: i18n('EQUIVALENT TO'),
          code: '&#x224D;',
        }, {
          name: i18n('GEOMETRICALLY EQUIVALENT TO'),
          code: '&#x224E;',
        }, {
          name: i18n('DIFFERENCE BETWEEN'),
          code: '&#x224F;',
        }, {
          name: i18n('APPROACHES THE LIMIT'),
          code: '&#x2250;',
        }, {
          name: i18n('GEOMETRICALLY EQUAL TO'),
          code: '&#x2251;',
        }, {
          name: i18n('APPROXIMATELY EQUAL TO OR THE IMAGE OF'),
          code: '&#x2252;',
        }, {
          name: i18n('IMAGE OF OR APPROXIMATELY EQUAL TO'),
          code: '&#x2253;',
        }, {
          name: i18n('COLON EQUALS'),
          code: '&#x2254;',
        }, {
          name: i18n('EQUALS COLON'),
          code: '&#x2255;',
        }, {
          name: i18n('RING IN EQUAL TO'),
          code: '&#x2256;',
        }, {
          name: i18n('RING EQUAL TO'),
          code: '&#x2257;',
        }, {
          name: i18n('CORRESPONDS TO'),
          code: '&#x2258;',
        }, {
          name: i18n('ESTIMATES'),
          code: '&#x2259;',
        }, {
          name: i18n('EQUIANGULAR TO'),
          code: '&#x225A;',
        }, {
          name: i18n('STAR EQUALS'),
          code: '&#x225B;',
        }, {
          name: i18n('DELTA EQUAL TO'),
          code: '&#x225C;',
        }, {
          name: i18n('EQUAL TO BY DEFINITION'),
          code: '&#x225D;',
        }, {
          name: i18n('MEASURED BY'),
          code: '&#x225E;',
        }, {
          name: i18n('QUESTIONED EQUAL TO'),
          code: '&#x225F;',
        }, {
          name: i18n('PRECEDES'),
          code: '&#x227A;',
        }, {
          name: i18n('SUCCEEDS'),
          code: '&#x227B;',
        }, {
          name: i18n('PRECEDES OR EQUAL TO'),
          code: '&#x227C;',
        }, {
          name: i18n('SUCCEEDS OR EQUAL TO'),
          code: '&#x227D;',
        }, {
          name: i18n('PRECEDES OR EQUIVALENT TO'),
          code: '&#x227E;',
        }, {
          name: i18n('SUCCEEDS OR EQUIVALENT TO'),
          code: '&#x227F;',
        }, {
          name: i18n('DOES NOT PRECEDE'),
          code: '&#x2280;',
        }, {
          name: i18n('DOES NOT SUCCEED'),
          code: '&#x2281;',
        }, {
          name: i18n('SQUARE IMAGE OF'),
          code: '&#x228F;',
        }, {
          name: i18n('SQUARE ORIGINAL OF'),
          code: '&#x2290;',
        }, {
          name: i18n('SQUARE IMAGE OF OR EQUAL TO'),
          code: '&#x2291;',
        }, {
          name: i18n('SQUARE ORIGINAL OF OR EQUAL TO'),
          code: '&#x2292;',
        }, {
          name: i18n('SQUARE CAP'),
          code: '&#x2293;',
        }, {
          name: i18n('SQUARE CUP'),
          code: '&#x2294;',
        }, {
          name: i18n('CIRCLED PLUS'),
          code: '&#x2295;',
        }, {
          name: i18n('CIRCLED MINUS'),
          code: '&#x2296;',
        }, {
          name: i18n('CIRCLED TIMES'),
          code: '&#x2297;',
        }, {
          name: i18n('CIRCLED DIVISION SLASH'),
          code: '&#x2298;',
        }, {
          name: i18n('CIRCLED DOT OPERATOR'),
          code: '&#x2299;',
        }, {
          name: i18n('CIRCLED RING OPERATOR'),
          code: '&#x229A;',
        }, {
          name: i18n('CIRCLED ASTERISK OPERATOR'),
          code: '&#x229B;',
        }, {
          name: i18n('CIRCLED EQUALS'),
          code: '&#x229C;',
        }, {
          name: i18n('CIRCLED DASH'),
          code: '&#x229D;',
        }, {
          name: i18n('SQUARED PLUS'),
          code: '&#x229E;',
        }, {
          name: i18n('SQUARED MINUS'),
          code: '&#x229F;',
        }, {
          name: i18n('SQUARED TIMES'),
          code: '&#x22A0;',
        }, {
          name: i18n('SQUARED DOT OPERATOR'),
          code: '&#x22AA;',
        }, {
          name: i18n('ASSERTION'),
          code: '&#x22A6;',
        }, {
          name: i18n('MODELS'),
          code: '&#x22A7;',
        }, {
          name: i18n('TRUE'),
          code: '&#x22A8;',
        }, {
          name: i18n('FORCES'),
          code: '&#x22A9;',
        }, {
          name: i18n('TRIPLE VERTICAL BAR RIGHT TURNSTILE'),
          code: '&#x22AA;',
        }, {
          name: i18n('DOUBLE VERTICAL BAR DOUBLE RIGHT TURNSTILE'),
          code: '&#x22AB;',
        }, {
          name: i18n('DOES NOT PROVE'),
          code: '&#x22AC;',
        }, {
          name: i18n('NOT TRUE'),
          code: '&#x22AD;',
        }, {
          name: i18n('DOES NOT FORCE'),
          code: '&#x22AE;',
        }, {
          name: i18n('NEGATED DOUBLE VERTICAL BAR DOUBLE RIGHT TURNSTILE'),
          code: '&#x22AF;',
        }, {
          name: i18n('PRECEDES UNDER RELATION'),
          code: '&#x22B0;',
        }, {
          name: i18n('SUCCEEDS UNDER RELATION'),
          code: '&#x22B1;',
        }, {
          name: i18n('NORMAL SUBGROUP OF'),
          code: '&#x22B2;',
        }, {
          name: i18n('CONTAINS AS NORMAL SUBGROUP'),
          code: '&#x22B3;',
        }, {
          name: i18n('NORMAL SUBGROUP OF OR EQUAL TO'),
          code: '&#x22B4;',
        }, {
          name: i18n('CONTAINS AS NORMAL SUBGROUP OR EQUAL TO'),
          code: '&#x22B5;',
        }, {
          name: i18n('ORIGINAL OF'),
          code: '&#x22B6;',
        }, {
          name: i18n('IMAGE OF'),
          code: '&#x22B7;',
        }, {
          name: i18n('MULTIMAP'),
          code: '&#x22B8;',
        }, {
          name: i18n('HERMITIAN CONJUGATE MATRIX'),
          code: '&#x22B9;',
        }, {
          name: i18n('INTERCALATE'),
          code: '&#x22BA;',
        }, {
          name: i18n('DIAMOND OPERATOR'),
          code: '&#x22C4;',
        }, {
          name: i18n(' DOT OPERATOR'),
          code: '&#x22C5;',
        }, {
          name: i18n('STAR OPERATOR'),
          code: '&#x22C6;',
        }, {
          name: i18n('DIVISION TIMES'),
          code: '&#x22C7;',
        }, {
          name: i18n('BOWTIE'),
          code: '&#x22C8;',
        }, {
          name: i18n('LEFT NORMAL FACTOR SEMIDIRECT PRODUCT'),
          code: '&#x22C9;',
        }, {
          name: i18n('RIGHT NORMAL FACTOR SEMIDIRECT PRODUCT'),
          code: '&#x22CA;',
        }, {
          name: i18n('LEFT SEMIDIRECT PRODUCT'),
          code: '&#x22CB;',
        }, {
          name: i18n('RIGHT SEMIDIRECT PRODUCT'),
          code: '&#x22CC;',
        }, {
          name: i18n('REVERSED TILDE EQUALS'),
          code: '&#x22CD;',
        }, {
          name: i18n('PITCHFORK'),
          code: '&#x22D4;',
        }, {
          name: i18n('EQUAL AND PARALLEL TO'),
          code: '&#x22D5;',
        }, {
          name: i18n('LESS-THAN WITH DOT'),
          code: '&#x22D6;',
        }, {
          name: i18n('GREATER-THAN WITH DOT'),
          code: '&#x22D7;',
        }, {
          name: i18n('VERY MUCH LESS-THAN'),
          code: '&#x22D8;',
        }, {
          name: i18n('VERY MUCH GREATER-THAN'),
          code: '&#x22D9;',
        }, {
          name: i18n('LESS-THAN EQUAL TO OR GREATER-THAN'),
          code: '&#x22DA;',
        }, {
          name: i18n('GREATER-THAN EQUAL TO OR LESS-THAN'),
          code: '&#x22DB;',
        }, {
          name: i18n('EQUAL TO OR LESS-THAN'),
          code: '&#x22DC;',
        }, {
          name: i18n('EQUAL TO OR GREATER-THAN'),
          code: '&#x22DD;',
        }, {
          name: i18n('EQUAL TO OR PRECEDES'),
          code: '&#x22DE;',
        }, {
          name: i18n('EQUAL TO OR SUCCEEDS'),
          code: '&#x22DF;',
        }, {
          name: i18n('DOES NOT PRECEDE OR EQUAL'),
          code: '&#x22E0;',
        }, {
          name: i18n('DOES NOT SUCCEED OR EQUAL'),
          code: '&#x22E1;',
        }, {
          name: i18n('NOT SQUARE IMAGE OF OR EQUAL TO'),
          code: '&#x22E2;',
        }, {
          name: i18n('NOT SQUARE ORIGINAL OF OR EQUAL TO'),
          code: '&#x22E3;',
        }, {
          name: i18n('SQUARE IMAGE OF OR NOT EQUAL TO'),
          code: '&#x22E4;',
        }, {
          name: i18n('SQUARE ORIGINAL OF OR NOT EQUAL TO'),
          code: '&#x22E5;',
        }, {
          name: i18n('LESS-THAN BUT NOT EQUIVALENT TO'),
          code: '&#x22E6;',
        }, {
          name: i18n('GREATER-THAN BUT NOT EQUIVALENT TO'),
          code: '&#x22E7;',
        }, {
          name: i18n('PRECEDES BUT NOT EQUIVALENT TO'),
          code: '&#x22E8;',
        }, {
          name: i18n('SUCCEEDS BUT NOT EQUIVALENT TO'),
          code: '&#x22E9;',
        }, {
          name: i18n('NOT NORMAL SUBGROUP OF'),
          code: '&#x22EA;',
        }, {
          name: i18n('DOES NOT CONTAIN AS NORMAL SUBGROUP'),
          code: '&#x22EB;',
        }, {
          name: i18n('NOT NORMAL SUBGROUP OF OR EQUAL TO'),
          code: '&#x22EC;',
        }, {
          name: i18n('DOES NOT CONTAIN AS NORMAL SUBGROUP OR EQUAL'),
          code: '&#x22ED;',
        }, {
          name: i18n('VERTICAL ELLIPSIS'),
          code: '&#x22EE;',
        }, {
          name: i18n('MIDLINE HORIZONTAL ELLIPSIS'),
          code: '&#x22EF;',
        }, {
          name: i18n('UP RIGHT DIAGONAL ELLIPSIS'),
          code: '&#x22F0;',
        }, {
          name: i18n('DOWN RIGHT DIAGONAL ELLIPSIS'),
          code: '&#x22F1;',
        },
      ],
    },
  ],
  greek: [
    {
      type: 'group',
      name: i18n('Capital Letters'),
      symbols: [
        {
          code: '&#x0391;',
          name: i18n('Greek Capital Letter Alpha'),
        },
        {
          code: '&#x0392;',
          name: i18n('Greek Capital Letter Beta'),
        },
        {
          code: '&#x0393;',
          name: i18n('Greek Capital Letter Gamma'),
        },
        {
          code: '&#x0394;',
          name: i18n('Greek Capital Letter Delta'),
        },
        {
          code: '&#x0395;',
          name: i18n('Greek Capital Letter Epsilon'),
        },
        {
          code: '&#x0396;',
          name: i18n('Greek Capital Letter Zeta'),
        },
        {
          code: '&#x0397;',
          name: i18n('Greek Capital Letter Eta'),
        },
        {
          code: '&#x0398;',
          name: i18n('Greek Capital Letter Theta'),
        },
        {
          code: '&#x0399;',
          name: i18n('Greek Capital Letter Iota'),
        },
        {
          code: '&#x039A;',
          name: i18n('Greek Capital Letter Kappa'),
        },
        {
          code: '&#x039B;',
          name: i18n('Greek Capital Letter Lambda'),
        },
        {
          code: '&#x039C;',
          name: i18n('Greek Capital Letter Mu'),
        },
        {
          code: '&#x039D;',
          name: i18n('Greek Capital Letter Nu'),
        },
        {
          code: '&#x039E;',
          name: i18n('Greek Capital Letter Xi'),
        },
        {
          code: '&#x039F;',
          name: i18n('Greek Capital Letter Omicron'),
        },
        {
          code: '&#x03A0;',
          name: i18n('Greek Capital Letter Pi'),
        },
        {
          code: '&#x03A1;',
          name: i18n('Greek Capital Letter Rho'),
        },
        {
          code: '&#x03A3;',
          name: i18n('Greek Capital Letter Sigma'),
        },
        {
          code: '&#x03A4;',
          name: i18n('Greek Capital Letter Tau'),
        },
        {
          code: '&#x03A5;',
          name: i18n('Greek Capital Letter Upsilon'),
        },
        {
          code: '&#x03A6;',
          name: i18n('Greek Capital Letter Phi'),
        },
        {
          code: '&#x03A7;',
          name: i18n('Greek Capital Letter Chi'),
        },
        {
          code: '&#x03A8;',
          name: i18n('Greek Capital Letter Psi'),
        },
        {
          code: '&#x03A9;',
          name: i18n('Greek Capital Letter Omega'),
        },
      ],
    },
    {
      type: 'group',
      name: i18n('Small Letters'),
      symbols: [
        {
          code: '&#x03B1;',
          name: i18n('Greek Small Letter Alpha'),
        },
        {
          code: '&#x03B2;',
          name: i18n('Greek Small Letter Beta'),
        },
        {
          code: '&#x03B3;',
          name: i18n('Greek Small Letter Gamma'),
        },
        {
          code: '&#x03B4;',
          name: i18n('Greek Small Letter Delta'),
        },
        {
          code: '&#x03B5;',
          name: i18n('Greek Small Letter Epsilon'),
        },
        {
          code: '&#x03B6;',
          name: i18n('Greek Small Letter Zeta'),
        },
        {
          code: '&#x03B7;',
          name: i18n('Greek Small Letter Eta'),
        },
        {
          code: '&#x03B8;',
          name: i18n('Greek Small Letter Theta'),
        },
        {
          code: '&#x03B9;',
          name: i18n('Greek Small Letter Iota'),
        },
        {
          code: '&#x03BA;',
          name: i18n('Greek Small Letter Kappa'),
        },
        {
          code: '&#x03BB;',
          name: i18n('Greek Small Letter Lambda'),
        },
        {
          code: '&#x03BC;',
          name: i18n('Greek Small Letter Mu'),
        },
        {
          code: '&#x03BD;',
          name: i18n('Greek Small Letter Nu'),
        },
        {
          code: '&#x03BE;',
          name: i18n('Greek Small Letter Xi'),
        },
        {
          code: '&#x03BF;',
          name: i18n('Greek Small Letter Omicron'),
        },
        {
          code: '&#x03C0;',
          name: i18n('Greek Small Letter Pi'),
        },
        {
          code: '&#x03C1;',
          name: i18n('Greek Small Letter Rho'),
        },
        {
          code: '&#x03C2;',
          name: i18n('Greek Small Letter Final Sigma'),
        },
        {
          code: '&#x03C3;',
          name: i18n('Greek Small Letter Sigma'),
        },
        {
          code: '&#x03C4;',
          name: i18n('Greek Small Letter Tau'),
        },
        {
          code: '&#x03C5;',
          name: i18n('Greek Small Letter Upsilon'),
        },
        {
          code: '&#x03C6;',
          name: i18n('Greek Small Letter Phi'),
        },
        {
          code: '&#x03C7;',
          name: i18n('Greek Small Letter Chi'),
        },
        {
          code: '&#x03C8;',
          name: i18n('Greek Small Letter Psi'),
        },
        {
          code: '&#x03C9;',
          name: i18n('Greek Small Letter Omega'),
        },
      ],
    },
    {
      type: 'group',
      name: i18n('Other Symbols'),
      symbols: [
        {
          code: '&#x0374;',
          name: i18n('Greek Numeral Sign'),
        },
        {
          code: '&#x0375;',
          name: i18n('Greek Lower Numeral Sign'),
        },
        {
          code: '&#x037A;',
          name: i18n('Greek Ypogegrammeni'),
        },
        {
          code: '&#x037E;',
          name: i18n('Greek Question Mark'),
        },
        {
          code: '&#x0384;',
          name: i18n('Greek acute accent (tonos)'),
        },
        {
          code: '&#x03D0;',
          name: i18n('Greek Beta Symbol'),
        },
        {
          code: '&#x03D1;',
          name: i18n('Greek Theta Symbol'),
        },
        {
          code: '&#x03D5;',
          name: i18n('Greek Phi Symbol'),
        },
        {
          code: '&#x03D6;',
          name: i18n('Greek Pi Symbol'),
        },
        {
          code: '&#x03D7;',
          name: i18n('Greek Kai Symbol'),
        },
        {
          code: '&#x03D8;',
          name: i18n('Greek Letter Qoppa'),
        },
        {
          code: '&#x03D9;',
          name: i18n('Greek Small Letter Qoppa'),
        },
        {
          code: '&#x03DA;',
          name: i18n('Greek Letter Stigma (letter)'),
        },
        {
          code: '&#x03DB;',
          name: i18n('Greek Small Letter Stigma'),
        },
        {
          code: '&#x03DC;',
          name: i18n('Greek Letter Digamma'),
        },
        {
          code: '&#x03DD;',
          name: i18n('Greek Small Letter Digamma'),
        },
        {
          code: '&#x03DE;',
          name: i18n('Greek Letter Koppa'),
        },
        {
          code: '&#x03DF;',
          name: i18n('Greek Small Letter Koppa'),
        },
        {
          code: '&#x03E0;',
          name: i18n('Greek Letter Sampi'),
        },
        {
          code: '&#x03E1;',
          name: i18n('Greek Small Letter Sampi'),
        },
        {
          code: '&#x03E2;',
          name: i18n('Coptic Capital Letter Shei'),
        },
        {
          code: '&#x03E3;',
          name: i18n('Coptic Small Letter Shei'),
        },
        {
          code: '&#x03E4;',
          name: i18n('Coptic Capital Letter Fei'),
        },
        {
          code: '&#x03E5;',
          name: i18n('Coptic Small Letter Fei'),
        },
        {
          code: '&#x03E6;',
          name: i18n('Coptic Capital Letter Khei'),
        },
        {
          code: '&#x03E7;',
          name: i18n('Coptic Small Letter Khei'),
        },
        {
          code: '&#x03E8;',
          name: i18n('Coptic Capital Letter Hori'),
        },
        {
          code: '&#x03E9;',
          name: i18n('Coptic Small Letter Hori'),
        },
        {
          code: '&#x03EA;',
          name: i18n('Coptic Capital Letter Gangia'),
        },
        {
          code: '&#x03EB;',
          name: i18n('Coptic Small Letter Gangia'),
        },
        {
          code: '&#x03EC;',
          name: i18n('Coptic Capital Letter Shima'),
        },
        {
          code: '&#x03ED;',
          name: i18n('Coptic Small Letter Shima'),
        },
        {
          code: '&#x03EE;',
          name: i18n('Coptic Capital Letter Dei'),
        },
        {
          code: '&#x03EF;',
          name: i18n('Coptic Small Letter Dei'),
        },
        {
          code: '&#x03F0;',
          name: i18n('Greek Kappa Symbol'),
        },
        {
          code: '&#x03F1;',
          name: i18n('Greek Rho Symbol'),
        },
        {
          code: '&#x03F2;',
          name: i18n('Greek Lunate Sigma Symbol'),
        },
        {
          code: '&#x03F3;',
          name: i18n('Greek Letter Yot'),
        },
        {
          code: '&#x03F4;',
          name: i18n('Greek Capital Theta Symbol'),
        },
        {
          code: '&#x03F5;',
          name: i18n('Greek Lunate Epsilon Symbol'),
        },
        {
          code: '&#x03F6;',
          name: i18n('Greek Reversed Lunate Epsilon Symbol'),
        },
        {
          code: '&#x03F7;',
          name: i18n('Greek Capital Sho'),
        },
        {
          code: '&#x03F8;',
          name: i18n('Greek Small Letter Sho'),
        },
        {
          code: '&#x03F9;',
          name: i18n('Greek Capital Lunate Sigma Symbol'),
        },
        {
          code: '&#x03FA;',
          name: i18n('Greek Capital San'),
        },
        {
          code: '&#x03FB;',
          name: i18n('Greek Small Letter San'),
        },
        {
          code: '&#x1FBD;',
          name: i18n('GREEK KORONIS'),
        },
        {
          code: '&#x1FBE;',
          name: i18n('GREEK PROSGEGRAMMENI'),
        },
        {
          code: '&#x1FBF;',
          name: i18n('GREEK PSILI'),
        },
        {
          code: '&#x1FC0;',
          name: i18n('GREEK PERISPOMENI'),
        },
        {
          code: '&#x1FC1;',
          name: i18n('GREEK DIALYTIKA AND PERISPOMENI'),
        },
        {
          code: '&#x1FCD;',
          name: i18n('GREEK PSILI AND VARIA'),
        },
        {
          code: '&#x1FCE;',
          name: i18n('GREEK PSILI AND OXIA'),
        },
        {
          code: '&#x1FCF;',
          name: i18n('GREEK PSILI AND PERISPOMENI'),
        },
        {
          code: '&#x1FEF;',
          name: i18n('GREEK VARIA'),
        },
        {
          code: '&#x1FFD;',
          name: i18n('GREEK OXIA'),
        },
        {
          code: '&#x1FFE;',
          name: i18n('GREEK DASIA'),
        },
      ],
    },
  ],
  latin: [
    {
      type: 'group',
      name: i18n('Latin Letters'),
      symbols: [
        {
          code: '&#x0021;',
          name: i18n('Exclamation mark'),
        },
        {
          code: '&#x0022;',
          name: i18n('Quotation mark'),
        },
        {
          code: '&#x0023;',
          name: i18n('Number sign, Hashtag, Octothorpe, Sharp'),
        },
        {
          code: '&#x0024;',
          name: i18n('Dollar sign'),
        },
        {
          code: '&#x0025;',
          name: i18n('Percent sign'),
        },
        {
          code: '&#x0026;',
          name: i18n('Ampersand'),
        },
        {
          code: '&#x0027;',
          name: i18n('Apostrophe'),
        },
        {
          code: '&#x0028;',
          name: i18n('Left parenthesis'),
        },
        {
          code: '&#x0029;',
          name: i18n('Right parenthesis'),
        },
        {
          code: '&#x002A;',
          name: i18n('Asterisk'),
        },
        {
          code: '&#x002B;',
          name: i18n('Plus sign'),
        },
        {
          code: '&#x002C;',
          name: i18n('Comma'),
        },
        {
          code: '&#x002D;',
          name: i18n('Hyphen-minus'),
        },
        {
          code: '&#x002E;',
          name: i18n('Full stop'),
        },
        {
          code: '&#x002F;',
          name: i18n('Slash (Solidus)'),
        },
        {
          code: '&#x0030;',
          name: i18n('Digit Zero'),
        },
        {
          code: '&#x0031;',
          name: i18n('Digit One'),
        },
        {
          code: '&#x0032;',
          name: i18n('Digit Two'),
        },
        {
          code: '&#x0033;',
          name: i18n('Digit Three'),
        },
        {
          code: '&#x0034;',
          name: i18n('Digit Four'),
        },
        {
          code: '&#x0035;',
          name: i18n('Digit Five'),
        },
        {
          code: '&#x0036;',
          name: i18n('Digit Six'),
        },
        {
          code: '&#x0037;',
          name: i18n('Digit Seven'),
        },
        {
          code: '&#x0038;',
          name: i18n('Digit Eight'),
        },
        {
          code: '&#x0039;',
          name: i18n('Digit Nine'),
        },
        {
          code: '&#x003A;',
          name: i18n('Colon'),
        },
        {
          code: '&#x003B;',
          name: i18n('Semicolon'),
        },
        {
          code: '&#x003C;',
          name: i18n('Less-than sign'),
        },
        {
          code: '&#x003D;',
          name: i18n('Equal sign'),
        },
        {
          code: '&#x003E;',
          name: i18n('Greater-than sign'),
        },
        {
          code: '&#x003F;',
          name: i18n('Question mark'),
        },
        {
          code: '&#x0040;',
          name: i18n('At sign'),
        },
        {
          code: '&#x0041;',
          name: i18n('Latin Capital letter A'),
        },
        {
          code: '&#x0042;',
          name: i18n('Latin Capital letter B'),
        },
        {
          code: '&#x0043;',
          name: i18n('Latin Capital letter C'),
        },
        {
          code: '&#x0044;',
          name: i18n('Latin Capital letter D'),
        },
        {
          code: '&#x0045;',
          name: i18n('Latin Capital letter E'),
        },
        {
          code: '&#x0046;',
          name: i18n('Latin Capital letter F'),
        },
        {
          code: '&#x0047;',
          name: i18n('Latin Capital letter G'),
        },
        {
          code: '&#x0048;',
          name: i18n('Latin Capital letter H'),
        },
        {
          code: '&#x0049;',
          name: i18n('Latin Capital letter I'),
        },
        {
          code: '&#x004A;',
          name: i18n('Latin Capital letter J'),
        },
        {
          code: '&#x004B;',
          name: i18n('Latin Capital letter K'),
        },
        {
          code: '&#x004C;',
          name: i18n('Latin Capital letter L'),
        },
        {
          code: '&#x004D;',
          name: i18n('Latin Capital letter M'),
        },
        {
          code: '&#x004E;',
          name: i18n('Latin Capital letter N'),
        },
        {
          code: '&#x004F;',
          name: i18n('Latin Capital letter O'),
        },
        {
          code: '&#x0050;',
          name: i18n('Latin Capital letter P'),
        },
        {
          code: '&#x0051;',
          name: i18n('Latin Capital letter Q'),
        },
        {
          code: '&#x0052;',
          name: i18n('Latin Capital letter R'),
        },
        {
          code: '&#x0053;',
          name: i18n('Latin Capital letter S'),
        },
        {
          code: '&#x0054;',
          name: i18n('Latin Capital letter T'),
        },
        {
          code: '&#x0055;',
          name: i18n('Latin Capital letter U'),
        },
        {
          code: '&#x0056;',
          name: i18n('Latin Capital letter V'),
        },
        {
          code: '&#x0057;',
          name: i18n('Latin Capital letter W'),
        },
        {
          code: '&#x0058;',
          name: i18n('Latin Capital letter X'),
        },
        {
          code: '&#x0059;',
          name: i18n('Latin Capital letter Y'),
        },
        {
          code: '&#x005A;',
          name: i18n('Latin Capital letter Z'),
        },
        {
          code: '&#x005B;',
          name: i18n('Left Square Bracket'),
        },
        {
          code: '&#x005C;',
          name: i18n('Backslash'),
        },
        {
          code: '&#x005D;',
          name: i18n('Right Square Bracket'),
        },
        {
          code: '&#x005E;',
          name: i18n('Circumflex accent'),
        },
        {
          code: '&#x005F;',
          name: i18n('Low line'),
        },
        {
          code: '&#x0060;',
          name: i18n('Grave accent'),
        },
        {
          code: '&#x0061;',
          name: i18n('Latin Small Letter A'),
        },
        {
          code: '&#x0062;',
          name: i18n('Latin Small Letter B'),
        },
        {
          code: '&#x0063;',
          name: i18n('Latin Small Letter C'),
        },
        {
          code: '&#x0064;',
          name: i18n('Latin Small Letter D'),
        },
        {
          code: '&#x0065;',
          name: i18n('Latin Small Letter E'),
        },
        {
          code: '&#x0066;',
          name: i18n('Latin Small Letter F'),
        },
        {
          code: '&#x0067;',
          name: i18n('Latin Small Letter G'),
        },
        {
          code: '&#x0068;',
          name: i18n('Latin Small Letter H'),
        },
        {
          code: '&#x0069;',
          name: i18n('Latin Small Letter I'),
        },
        {
          code: '&#x006A;',
          name: i18n('Latin Small Letter J'),
        },
        {
          code: '&#x006B;',
          name: i18n('Latin Small Letter K'),
        },
        {
          code: '&#x006C;',
          name: i18n('Latin Small Letter L'),
        },
        {
          code: '&#x006D;',
          name: i18n('Latin Small Letter M'),
        },
        {
          code: '&#x006E;',
          name: i18n('Latin Small Letter N'),
        },
        {
          code: '&#x006F;',
          name: i18n('Latin Small Letter O'),
        },
        {
          code: '&#x0070;',
          name: i18n('Latin Small Letter P'),
        },
        {
          code: '&#x0071;',
          name: i18n('Latin Small Letter Q'),
        },
        {
          code: '&#x0072;',
          name: i18n('Latin Small Letter R'),
        },
        {
          code: '&#x0073;',
          name: i18n('Latin Small Letter S'),
        },
        {
          code: '&#x0074;',
          name: i18n('Latin Small Letter T'),
        },
        {
          code: '&#x0075;',
          name: i18n('Latin Small Letter U'),
        },
        {
          code: '&#x0076;',
          name: i18n('Latin Small Letter V'),
        },
        {
          code: '&#x0077;',
          name: i18n('Latin Small Letter W'),
        },
        {
          code: '&#x0078;',
          name: i18n('Latin Small Letter X'),
        },
        {
          code: '&#x0079;',
          name: i18n('Latin Small Letter Y'),
        },
        {
          code: '&#x007A;',
          name: i18n('Latin Small Letter Z'),
        },
        {
          code: '&#x007B;',
          name: i18n('Left Curly Bracket'),
        },
        {
          code: '&#x007C;',
          name: i18n('Vertical bar'),
        },
        {
          code: '&#x007D;',
          name: i18n('Right Curly Bracket'),
        },
        {
          code: '&#x007E;',
          name: i18n('Tilde'),
        },
        {
          code: '&#x00A1;',
          name: i18n('Inverted Exclamation Mark'),
        },
        {
          code: '&#x00A2;',
          name: i18n('Cent sign'),
        },
        {
          code: '&#x00A3;',
          name: i18n('Pound sign'),
        },
        {
          code: '&#x00A4;',
          name: i18n('Currency sign'),
        },
        {
          code: '&#x00A5;',
          name: i18n('Yen sign'),
        },
        {
          code: '&#x00A6;',
          name: i18n('Broken bar'),
        },
        {
          code: '&#x00A7;',
          name: i18n('Section sign'),
        },
        {
          code: '&#x00A8;',
          name: i18n('Diaeresis (Umlaut)'),
        },
        {
          code: '&#x00A9;',
          name: i18n('Copyright sign'),
        },
        {
          code: '&#x00AA;',
          name: i18n('Feminine Ordinal Indicator'),
        },
        {
          code: '&#x00AB;',
          name: i18n('Left-pointing double angle quotation mark'),
        },
        {
          code: '&#x00AC;',
          name: i18n('Not sign'),
        },
        {
          code: '&#x00AD;',
          name: i18n('Soft hyphen'),
        },
        {
          code: '&#x00AE;',
          name: i18n('Registered sign'),
        },
        {
          code: '&#x00AF;',
          name: i18n('Macron'),
        },
        {
          code: '&#x00B0;',
          name: i18n('Degree symbol'),
        },
        {
          code: '&#x00B1;',
          name: i18n('Plus-minus sign'),
        },
        {
          code: '&#x00B2;',
          name: i18n('Superscript two'),
        },
        {
          code: '&#x00B3;',
          name: i18n('Superscript three'),
        },
        {
          code: '&#x00B4;',
          name: i18n('Acute accent'),
        },
        {
          code: '&#x00B5;',
          name: i18n('Micro sign'),
        },
        {
          code: '&#x00B6;',
          name: i18n('Pilcrow sign'),
        },
        {
          code: '&#x00B7;',
          name: i18n('Middle dot'),
        },
        {
          code: '&#x00B8;',
          name: i18n('Cedilla'),
        },
        {
          code: '&#x00B9;',
          name: i18n('Superscript one'),
        },
        {
          code: '&#x00BA;',
          name: i18n('Masculine ordinal indicator'),
        },
        {
          code: '&#x00BB;',
          name: i18n('Right-pointing double angle quotation mark'),
        },
        {
          code: '&#x00BC;',
          name: i18n('Vulgar fraction one quarter'),
        },
        {
          code: '&#x00BD;',
          name: i18n('Vulgar fraction one half'),
        },
        {
          code: '&#x00BE;',
          name: i18n('Vulgar fraction three quarters'),
        },
        {
          code: '&#x00BF;',
          name: i18n('Inverted Question Mark'),
        },
        {
          code: '&#x00C0;',
          name: i18n('Latin Capital Letter A with grave'),
        },
        {
          code: '&#x00C1;',
          name: i18n('Latin Capital letter A with acute'),
        },
        {
          code: '&#x00C2;',
          name: i18n('Latin Capital letter A with circumflex'),
        },
        {
          code: '&#x00C3;',
          name: i18n('Latin Capital letter A with tilde'),
        },
        {
          code: '&#x00C4;',
          name: i18n('Latin Capital letter A with diaeresis'),
        },
        {
          code: '&#x00C5;',
          name: i18n('Latin Capital letter A with ring above'),
        },
        {
          code: '&#x00C6;',
          name: i18n('Latin Capital letter Æ'),
        },
        {
          code: '&#x00C7;',
          name: i18n('Latin Capital letter C with cedilla'),
        },
        {
          code: '&#x00C8;',
          name: i18n('Latin Capital letter E with grave'),
        },
        {
          code: '&#x00C9;',
          name: i18n('Latin Capital letter E with acute'),
        },
        {
          code: '&#x00CA;',
          name: i18n('Latin Capital letter E with circumflex'),
        },
        {
          code: '&#x00CB;',
          name: i18n('Latin Capital letter E with diaeresis'),
        },
        {
          code: '&#x00CC;',
          name: i18n('Latin Capital letter I with grave'),
        },
        {
          code: '&#x00CD;',
          name: i18n('Latin Capital letter I with acute'),
        },
        {
          code: '&#x00CE;',
          name: i18n('Latin Capital letter I with circumflex'),
        },
        {
          code: '&#x00CF;',
          name: i18n('Latin Capital letter I with diaeresis'),
        },
        {
          code: '&#x00D0;',
          name: i18n('Latin Capital letter Eth'),
        },
        {
          code: '&#x00D1;',
          name: i18n('Latin Capital letter N with tilde'),
        },
        {
          code: '&#x00D2;',
          name: i18n('Latin Capital letter O with grave'),
        },
        {
          code: '&#x00D3;',
          name: i18n('Latin Capital letter O with acute'),
        },
        {
          code: '&#x00D4;',
          name: i18n('Latin Capital letter O with circumflex'),
        },
        {
          code: '&#x00D5;',
          name: i18n('Latin Capital letter O with tilde'),
        },
        {
          code: '&#x00D6;',
          name: i18n('Latin Capital letter O with diaeresis'),
        },
        {
          code: '&#x00D7;',
          name: i18n('Multiplication sign'),
        },
        {
          code: '&#x00D8;',
          name: i18n('Latin Capital letter O with stroke'),
        },
        {
          code: '&#x00D9;',
          name: i18n('Latin Capital letter U with grave'),
        },
        {
          code: '&#x00DA;',
          name: i18n('Latin Capital letter U with acute'),
        },
        {
          code: '&#x00DB;',
          name: i18n('Latin Capital Letter U with circumflex'),
        },
        {
          code: '&#x00DC;',
          name: i18n('Latin Capital Letter U with diaeresis'),
        },
        {
          code: '&#x00DD;',
          name: i18n('Latin Capital Letter Y with acute'),
        },
        {
          code: '&#x00DE;',
          name: i18n('Latin Capital Letter Thorn'),
        },
        {
          code: '&#x00DF;',
          name: i18n('Latin Small Letter sharp S'),
        },
        {
          code: '&#x00E0;',
          name: i18n('Latin Small Letter A with grave'),
        },
        {
          code: '&#x00E1;',
          name: i18n('Latin Small Letter A with acute'),
        },
        {
          code: '&#x00E2;',
          name: i18n('Latin Small Letter A with circumflex'),
        },
        {
          code: '&#x00E3;',
          name: i18n('Latin Small Letter A with tilde'),
        },
        {
          code: '&#x00E4;',
          name: i18n('Latin Small Letter A with diaeresis'),
        },
        {
          code: '&#x00E5;',
          name: i18n('Latin Small Letter A with ring above'),
        },
        {
          code: '&#x00E6;',
          name: i18n('Latin Small Letter Æ'),
        },
        {
          code: '&#x00E7;',
          name: i18n('Latin Small Letter C with cedilla'),
        },
        {
          code: '&#x00E8;',
          name: i18n('Latin Small Letter E with grave'),
        },
        {
          code: '&#x00E9;',
          name: i18n('Latin Small Letter E with acute'),
        },
        {
          code: '&#x00EA;',
          name: i18n('Latin Small Letter E with circumflex'),
        },
        {
          code: '&#x00EB;',
          name: i18n('Latin Small Letter E with diaeresis'),
        },
        {
          code: '&#x00EC;',
          name: i18n('Latin Small Letter I with grave'),
        },
        {
          code: '&#x00ED;',
          name: i18n('Latin Small Letter I with acute'),
        },
        {
          code: '&#x00EE;',
          name: i18n('Latin Small Letter I with circumflex'),
        },
        {
          code: '&#x00EF;',
          name: i18n('Latin Small Letter I with diaeresis'),
        },
        {
          code: '&#x00F0;',
          name: i18n('Latin Small Letter Eth'),
        },
        {
          code: '&#x00F1;',
          name: i18n('Latin Small Letter N with tilde'),
        },
        {
          code: '&#x00F2;',
          name: i18n('Latin Small Letter O with grave'),
        },
        {
          code: '&#x00F3;',
          name: i18n('Latin Small Letter O with acute'),
        },
        {
          code: '&#x00F4;',
          name: i18n('Latin Small Letter O with circumflex'),
        },
        {
          code: '&#x00F5;',
          name: i18n('Latin Small Letter O with tilde'),
        },
        {
          code: '&#x00F6;',
          name: i18n('Latin Small Letter O with diaeresis'),
        },
        {
          code: '&#x00F7;',
          name: i18n('Division sign'),
        },
        {
          code: '&#x00F8;',
          name: i18n('Latin Small Letter O with stroke'),
        },
        {
          code: '&#x00F9;',
          name: i18n('Latin Small Letter U with grave'),
        },
        {
          code: '&#x00FA;',
          name: i18n('Latin Small Letter U with acute'),
        },
        {
          code: '&#x00FB;',
          name: i18n('Latin Small Letter U with circumflex'),
        },
        {
          code: '&#x00FC;',
          name: i18n('Latin Small Letter U with diaeresis'),
        },
        {
          code: '&#x00FD;',
          name: i18n('Latin Small Letter Y with acute'),
        },
        {
          code: '&#x00FE;',
          name: i18n('Latin Small Letter Thorn'),
        },
        {
          code: '&#x00FF;',
          name: i18n('Latin Small Letter Y with diaeresis'),
        },
        {
          code: '&#x0100;',
          name: i18n('Latin Capital Letter A with macron'),
        },
        {
          code: '&#x0101;',
          name: i18n('Latin Small Letter A with macron'),
        },
        {
          code: '&#x0102;',
          name: i18n('Latin Capital Letter A with breve'),
        },
        {
          code: '&#x0103;',
          name: i18n('Latin Small Letter A with breve'),
        },
        {
          code: '&#x0104;',
          name: i18n('Latin Capital Letter A with ogonek'),
        },
        {
          code: '&#x0105;',
          name: i18n('Latin Small Letter A with ogonek'),
        },
        {
          code: '&#x0106;',
          name: i18n('Latin Capital Letter C with acute'),
        },
        {
          code: '&#x0107;',
          name: i18n('Latin Small Letter C with acute'),
        },
        {
          code: '&#x0108;',
          name: i18n('Latin Capital Letter C with circumflex'),
        },
        {
          code: '&#x0109;',
          name: i18n('Latin Small Letter C with circumflex'),
        },
        {
          code: '&#x010A;',
          name: i18n('Latin Capital Letter C with dot above'),
        },
        {
          code: '&#x010B;',
          name: i18n('Latin Small Letter C with dot above'),
        },
        {
          code: '&#x010C;',
          name: i18n('Latin Capital Letter C with caron'),
        },
        {
          code: '&#x010D;',
          name: i18n('Latin Small Letter C with caron'),
        },
        {
          code: '&#x010E;',
          name: i18n('Latin Capital Letter D with caron'),
        },
        {
          code: '&#x010F;',
          name: i18n('Latin Small Letter D with caron'),
        },
        {
          code: '&#x0110;',
          name: i18n('Latin Capital Letter D with stroke'),
        },
        {
          code: '&#x0111;',
          name: i18n('Latin Small Letter D with stroke'),
        },
        {
          code: '&#x0112;',
          name: i18n('Latin Capital Letter E with macron'),
        },
        {
          code: '&#x0113;',
          name: i18n('Latin Small Letter E with macron'),
        },
        {
          code: '&#x0114;',
          name: i18n('Latin Capital Letter E with breve'),
        },
        {
          code: '&#x0115;',
          name: i18n('Latin Small Letter E with breve'),
        },
        {
          code: '&#x0116;',
          name: i18n('Latin Capital Letter E with dot above'),
        },
        {
          code: '&#x0117;',
          name: i18n('Latin Small Letter E with dot above'),
        },
        {
          code: '&#x0118;',
          name: i18n('Latin Capital Letter E with ogonek'),
        },
        {
          code: '&#x0119;',
          name: i18n('Latin Small Letter E with ogonek'),
        },
        {
          code: '&#x011A;',
          name: i18n('Latin Capital Letter E with caron'),
        },
        {
          code: '&#x011B;',
          name: i18n('Latin Small Letter E with caron'),
        },
        {
          code: '&#x011C;',
          name: i18n('Latin Capital Letter G with circumflex'),
        },
        {
          code: '&#x011D;',
          name: i18n('Latin Small Letter G with circumflex'),
        },
        {
          code: '&#x011E;',
          name: i18n('Latin Capital Letter G with breve'),
        },
        {
          code: '&#x011F;',
          name: i18n('Latin Small Letter G with breve'),
        },
        {
          code: '&#x0120;',
          name: i18n('Latin Capital Letter G with dot above'),
        },
        {
          code: '&#x0121;',
          name: i18n('Latin Small Letter G with dot above'),
        },
        {
          code: '&#x0122;',
          name: i18n('Latin Capital Letter G with cedilla'),
        },
        {
          code: '&#x0123;',
          name: i18n('Latin Small Letter G with cedilla'),
        },
        {
          code: '&#x0124;',
          name: i18n('Latin Capital Letter H with circumflex'),
        },
        {
          code: '&#x0125;',
          name: i18n('Latin Small Letter H with circumflex'),
        },
        {
          code: '&#x0126;',
          name: i18n('Latin Capital Letter H with stroke'),
        },
        {
          code: '&#x0127;',
          name: i18n('Latin Small Letter H with stroke'),
        },
        {
          code: '&#x0128;',
          name: i18n('Latin Capital Letter I with tilde'),
        },
        {
          code: '&#x0129;',
          name: i18n('Latin Small Letter I with tilde'),
        },
        {
          code: '&#x012A;',
          name: i18n('Latin Capital Letter I with macron'),
        },
        {
          code: '&#x012B;',
          name: i18n('Latin Small Letter I with macron'),
        },
        {
          code: '&#x012C;',
          name: i18n('Latin Capital Letter I with breve'),
        },
        {
          code: '&#x012D;',
          name: i18n('Latin Small Letter I with breve'),
        },
        {
          code: '&#x012E;',
          name: i18n('Latin Capital Letter I with ogonek'),
        },
        {
          code: '&#x012F;',
          name: i18n('Latin Small Letter I with ogonek'),
        },
        {
          code: '&#x0130;',
          name: i18n('Latin Capital Letter I with dot above'),
        },
        {
          code: '&#x0131;',
          name: i18n('Latin Small Letter dotless I'),
        },
        {
          code: '&#x0132;',
          name: i18n('Latin Capital Ligature IJ'),
        },
        {
          code: '&#x0133;',
          name: i18n('Latin Small Ligature IJ'),
        },
        {
          code: '&#x0134;',
          name: i18n('Latin Capital Letter J with circumflex'),
        },
        {
          code: '&#x0135;',
          name: i18n('Latin Small Letter J with circumflex'),
        },
        {
          code: '&#x0136;',
          name: i18n('Latin Capital Letter K with cedilla'),
        },
        {
          code: '&#x0137;',
          name: i18n('Latin Small Letter K with cedilla'),
        },
        {
          code: '&#x0138;',
          name: i18n('Latin Small Letter Kra'),
        },
        {
          code: '&#x0139;',
          name: i18n('Latin Capital Letter L with acute'),
        },
        {
          code: '&#x013A;',
          name: i18n('Latin Small Letter L with acute'),
        },
        {
          code: '&#x013B;',
          name: i18n('Latin Capital Letter L with cedilla'),
        },
        {
          code: '&#x013C;',
          name: i18n('Latin Small Letter L with cedilla'),
        },
        {
          code: '&#x013D;',
          name: i18n('Latin Capital Letter L with caron'),
        },
        {
          code: '&#x013E;',
          name: i18n('Latin Small Letter L with caron'),
        },
        {
          code: '&#x013F;',
          name: i18n('Latin Capital Letter L with middle dot'),
        },
        {
          code: '&#x0140;',
          name: i18n('Latin Small Letter L with middle dot'),
        },
        {
          code: '&#x0141;',
          name: i18n('Latin Capital Letter L with stroke'),
        },
        {
          code: '&#x0142;',
          name: i18n('Latin Small Letter L with stroke'),
        },
        {
          code: '&#x0143;',
          name: i18n('Latin Capital Letter N with acute'),
        },
        {
          code: '&#x0144;',
          name: i18n('Latin Small Letter N with acute'),
        },
        {
          code: '&#x0145;',
          name: i18n('Latin Capital Letter N with cedilla'),
        },
        {
          code: '&#x0146;',
          name: i18n('Latin Small Letter N with cedilla'),
        },
        {
          code: '&#x0147;',
          name: i18n('Latin Capital Letter N with caron'),
        },
        {
          code: '&#x0148;',
          name: i18n('Latin Small Letter N with caron'),
        },
        {
          code: '&#x0149;',
          name: i18n('Latin Small Letter N preceded by apostrophe[1]'),
        },
        {
          code: '&#x014A;',
          name: i18n('Latin Capital Letter Eng'),
        },
        {
          code: '&#x014B;',
          name: i18n('Latin Small Letter Eng'),
        },
        {
          code: '&#x014C;',
          name: i18n('Latin Capital Letter O with macron'),
        },
        {
          code: '&#x014D;',
          name: i18n('Latin Small Letter O with macron'),
        },
        {
          code: '&#x014E;',
          name: i18n('Latin Capital Letter O with breve'),
        },
        {
          code: '&#x014F;',
          name: i18n('Latin Small Letter O with breve'),
        },
        {
          code: '&#x0150;',
          name: i18n('Latin Capital Letter O with double acute'),
        },
        {
          code: '&#x0151;',
          name: i18n('Latin Small Letter O with double acute'),
        },
        {
          code: '&#x0152;',
          name: i18n('Latin Capital Ligature OE'),
        },
        {
          code: '&#x0153;',
          name: i18n('Latin Small Ligature OE'),
        },
        {
          code: '&#x0154;',
          name: i18n('Latin Capital Letter R with acute'),
        },
        {
          code: '&#x0155;',
          name: i18n('Latin Small Letter R with acute'),
        },
        {
          code: '&#x0156;',
          name: i18n('Latin Capital Letter R with cedilla'),
        },
        {
          code: '&#x0157;',
          name: i18n('Latin Small Letter R with cedilla'),
        },
        {
          code: '&#x0158;',
          name: i18n('Latin Capital Letter R with caron'),
        },
        {
          code: '&#x0159;',
          name: i18n('Latin Small Letter R with caron'),
        },
        {
          code: '&#x015A;',
          name: i18n('Latin Capital Letter S with acute'),
        },
        {
          code: '&#x015B;',
          name: i18n('Latin Small Letter S with acute'),
        },
        {
          code: '&#x015C;',
          name: i18n('Latin Capital Letter S with circumflex'),
        },
        {
          code: '&#x015D;',
          name: i18n('Latin Small Letter S with circumflex'),
        },
        {
          code: '&#x015E;',
          name: i18n('Latin Capital Letter S with cedilla'),
        },
        {
          code: '&#x015F;',
          name: i18n('Latin Small Letter S with cedilla'),
        },
        {
          code: '&#x0160;',
          name: i18n('Latin Capital Letter S with caron'),
        },
        {
          code: '&#x0161;',
          name: i18n('Latin Small Letter S with caron'),
        },
        {
          code: '&#x0162;',
          name: i18n('Latin Capital Letter T with cedilla'),
        },
        {
          code: '&#x0163;',
          name: i18n('Latin Small Letter T with cedilla'),
        },
        {
          code: '&#x0164;',
          name: i18n('Latin Capital Letter T with caron'),
        },
        {
          code: '&#x0165;',
          name: i18n('Latin Small Letter T with caron'),
        },
        {
          code: '&#x0166;',
          name: i18n('Latin Capital Letter T with stroke'),
        },
        {
          code: '&#x0167;',
          name: i18n('Latin Small Letter T with stroke'),
        },
        {
          code: '&#x0168;',
          name: i18n('Latin Capital Letter U with tilde'),
        },
        {
          code: '&#x0169;',
          name: i18n('Latin Small Letter U with tilde'),
        },
        {
          code: '&#x016A;',
          name: i18n('Latin Capital Letter U with macron'),
        },
        {
          code: '&#x016B;',
          name: i18n('Latin Small Letter U with macron'),
        },
        {
          code: '&#x016C;',
          name: i18n('Latin Capital Letter U with breve'),
        },
        {
          code: '&#x016D;',
          name: i18n('Latin Small Letter U with breve'),
        },
        {
          code: '&#x016E;',
          name: i18n('Latin Capital Letter U with ring above'),
        },
        {
          code: '&#x016F;',
          name: i18n('Latin Small Letter U with ring above'),
        },
        {
          code: '&#x0170;',
          name: i18n('Latin Capital Letter U with double acute'),
        },
        {
          code: '&#x0171;',
          name: i18n('Latin Small Letter U with double acute'),
        },
        {
          code: '&#x0172;',
          name: i18n('Latin Capital Letter U with ogonek'),
        },
        {
          code: '&#x0173;',
          name: i18n('Latin Small Letter U with ogonek'),
        },
        {
          code: '&#x0174;',
          name: i18n('Latin Capital Letter W with circumflex'),
        },
        {
          code: '&#x0175;',
          name: i18n('Latin Small Letter W with circumflex'),
        },
        {
          code: '&#x0176;',
          name: i18n('Latin Capital Letter Y with circumflex'),
        },
        {
          code: '&#x0177;',
          name: i18n('Latin Small Letter Y with circumflex'),
        },
        {
          code: '&#x0178;',
          name: i18n('Latin Capital Letter Y with diaeresis'),
        },
        {
          code: '&#x0179;',
          name: i18n('Latin Capital Letter Z with acute'),
        },
        {
          code: '&#x017A;',
          name: i18n('Latin Small Letter Z with acute'),
        },
        {
          code: '&#x017B;',
          name: i18n('Latin Capital Letter Z with dot above'),
        },
        {
          code: '&#x017C;',
          name: i18n('Latin Small Letter Z with dot above'),
        },
        {
          code: '&#x017D;',
          name: i18n('Latin Capital Letter Z with caron'),
        },
        {
          code: '&#x017E;',
          name: i18n('Latin Small Letter Z with caron'),
        },
        {
          code: '&#x017F;',
          name: i18n('Latin Small Letter long S'),
        },
        {
          code: '&#x0180;',
          name: i18n('Latin Small Letter B with stroke'),
        },
        {
          code: '&#x0181;',
          name: i18n('Latin Capital Letter B with hook'),
        },
        {
          code: '&#x0182;',
          name: i18n('Latin Capital Letter B with top bar'),
        },
        {
          code: '&#x0183;',
          name: i18n('Latin Small Letter B with top bar'),
        },
        {
          code: '&#x0184;',
          name: i18n('Latin Capital Letter Tone Six'),
        },
        {
          code: '&#x0185;',
          name: i18n('Latin Small Letter Tone Six'),
        },
        {
          code: '&#x0186;',
          name: i18n('Latin Capital Letter Open O'),
        },
        {
          code: '&#x0187;',
          name: i18n('Latin Capital Letter C with hook'),
        },
        {
          code: '&#x0188;',
          name: i18n('Latin Small Letter C with hook'),
        },
        {
          code: '&#x0189;',
          name: i18n('Latin Capital Letter African D'),
        },
        {
          code: '&#x018A;',
          name: i18n('Latin Capital Letter D with hook'),
        },
        {
          code: '&#x018B;',
          name: i18n('Latin Capital Letter D with top bar'),
        },
        {
          code: '&#x018C;',
          name: i18n('Latin Small Letter D with top bar'),
        },
        {
          code: '&#x018D;',
          name: i18n('Latin Small Letter Turned Delta'),
        },
        {
          code: '&#x018E;',
          name: i18n('Latin Capital Letter Reversed E'),
        },
        {
          code: '&#x018F;',
          name: i18n('Latin Capital Letter Schwa'),
        },
        {
          code: '&#x0190;',
          name: i18n('Latin Capital Letter Open E'),
        },
        {
          code: '&#x0191;',
          name: i18n('Latin Capital Letter F with hook'),
        },
        {
          code: '&#x0192;',
          name: i18n('Latin Small Letter F with hook'),
        },
        {
          code: '&#x0193;',
          name: i18n('Latin Capital Letter G with hook'),
        },
        {
          code: '&#x0194;',
          name: i18n('Latin Capital Letter Gamma'),
        },
        {
          code: '&#x0195;',
          name: i18n('Latin Small Letter HV'),
        },
        {
          code: '&#x0196;',
          name: i18n('Latin Capital Letter Iota'),
        },
        {
          code: '&#x0197;',
          name: i18n('Latin Capital Letter I with stroke'),
        },
        {
          code: '&#x0198;',
          name: i18n('Latin Capital Letter K with hook'),
        },
        {
          code: '&#x0199;',
          name: i18n('Latin Small Letter K with hook'),
        },
        {
          code: '&#x019A;',
          name: i18n('Latin Small Letter L with bar'),
        },
        {
          code: '&#x019B;',
          name: i18n('Latin Small Letter Lambda with stroke'),
        },
        {
          code: '&#x019C;',
          name: i18n('Latin Capital Letter Turned M'),
        },
        {
          code: '&#x019D;',
          name: i18n('Latin Capital Letter N with left hook'),
        },
        {
          code: '&#x019E;',
          name: i18n('Latin Small Letter N with long right leg'),
        },
        {
          code: '&#x019F;',
          name: i18n('Latin Capital Letter O with middle tilde'),
        },
        {
          code: '&#x01A0;',
          name: i18n('Latin Capital Letter O with horn'),
        },
        {
          code: '&#x01A1;',
          name: i18n('Latin Small Letter O with horn'),
        },
        {
          code: '&#x01A2;',
          name: i18n('Latin Capital Letter OI (= Latin Capital Letter Gha)'),
        },
        {
          code: '&#x01A3;',
          name: i18n('Latin Small Letter OI (= Latin Small Letter Gha)'),
        },
        {
          code: '&#x01A4;',
          name: i18n('Latin Capital Letter P with hook'),
        },
        {
          code: '&#x01A5;',
          name: i18n('Latin Small Letter P with hook'),
        },
        {
          code: '&#x01A6;',
          name: i18n('Latin Letter YR'),
        },
        {
          code: '&#x01A7;',
          name: i18n('Latin Capital Letter Tone Two'),
        },
        {
          code: '&#x01A8;',
          name: i18n('Latin Small Letter Tone Two'),
        },
        {
          code: '&#x01A9;',
          name: i18n('Latin Capital Letter Esh'),
        },
        {
          code: '&#x01AA;',
          name: i18n('Latin Letter Reversed Esh Loop'),
        },
        {
          code: '&#x01AB;',
          name: i18n('Latin Small Letter T with palatal hook'),
        },
        {
          code: '&#x01AC;',
          name: i18n('Latin Capital Letter T with hook'),
        },
        {
          code: '&#x01AD;',
          name: i18n('Latin Small Letter T with hook'),
        },
        {
          code: '&#x01AE;',
          name: i18n('Latin Capital Letter T with retroflex hook'),
        },
        {
          code: '&#x01AF;',
          name: i18n('Latin Capital Letter U with horn'),
        },
        {
          code: '&#x01B0;',
          name: i18n('Latin Small Letter U with horn'),
        },
        {
          code: '&#x01B1;',
          name: i18n('Latin Capital Letter Upsilon'),
        },
        {
          code: '&#x01B2;',
          name: i18n('Latin Capital Letter V with hook'),
        },
        {
          code: '&#x01B3;',
          name: i18n('Latin Capital Letter Y with hook'),
        },
        {
          code: '&#x01B4;',
          name: i18n('Latin Small Letter Y with hook'),
        },
        {
          code: '&#x01B5;',
          name: i18n('Latin Capital Letter Z with stroke'),
        },
        {
          code: '&#x01B6;',
          name: i18n('Latin Small Letter Z with stroke'),
        },
        {
          code: '&#x01B7;',
          name: i18n('Latin Capital Letter Ezh'),
        },
        {
          code: '&#x01B8;',
          name: i18n('Latin Capital Letter Ezh reversed'),
        },
        {
          code: '&#x01B9;',
          name: i18n('Latin Small Letter Ezh reversed'),
        },
        {
          code: '&#x01BA;',
          name: i18n('Latin Small Letter Ezh with tail'),
        },
        {
          code: '&#x01BB;',
          name: i18n('Latin Letter Two with stroke'),
        },
        {
          code: '&#x01BC;',
          name: i18n('Latin Capital Letter Tone Five'),
        },
        {
          code: '&#x01BD;',
          name: i18n('Latin Small Letter Tone Five'),
        },
        {
          code: '&#x01BE;',
          name: i18n('Latin Letter Inverted Glottal Stop with stroke'),
        },
        {
          code: '&#x01BF;',
          name: i18n('Latin Letter Wynn'),
        },
        {
          code: '&#x01C0;',
          name: i18n('Latin Letter Dental Click'),
        },
        {
          code: '&#x01C1;',
          name: i18n('Latin Letter Lateral Click'),
        },
        {
          code: '&#x01C2;',
          name: i18n('Latin Letter Alveolar Click'),
        },
        {
          code: '&#x01C3;',
          name: i18n('Latin Letter Retroflex Click'),
        },
        {
          code: '&#x01C4;',
          name: i18n('Latin Capital Letter DZ with caron'),
        },
        {
          code: '&#x01C5;',
          name: i18n('Latin Capital Letter D with Small Letter Z with caron'),
        },
        {
          code: '&#x01C6;',
          name: i18n('Latin Small Letter DZ with caron'),
        },
        {
          code: '&#x01C7;',
          name: i18n('Latin Capital Letter LJ'),
        },
        {
          code: '&#x01C8;',
          name: i18n('Latin Capital Letter L with Small Letter J'),
        },
        {
          code: '&#x01C9;',
          name: i18n('Latin Small Letter LJ'),
        },
        {
          code: '&#x01CA;',
          name: i18n('Latin Capital Letter NJ'),
        },
        {
          code: '&#x01CB;',
          name: i18n('Latin Capital Letter N with Small Letter J'),
        },
        {
          code: '&#x01CC;',
          name: i18n('Latin Small Letter NJ'),
        },
        {
          code: '&#x01CD;',
          name: i18n('Latin Capital Letter A with caron'),
        },
        {
          code: '&#x01CE;',
          name: i18n('Latin Small Letter A with caron'),
        },
        {
          code: '&#x01CF;',
          name: i18n('Latin Capital Letter I with caron'),
        },
        {
          code: '&#x01D0;',
          name: i18n('Latin Small Letter I with caron'),
        },
        {
          code: '&#x01D1;',
          name: i18n('Latin Capital Letter O with caron'),
        },
        {
          code: '&#x01D2;',
          name: i18n('Latin Small Letter O with caron'),
        },
        {
          code: '&#x01D3;',
          name: i18n('Latin Capital Letter U with caron'),
        },
        {
          code: '&#x01D4;',
          name: i18n('Latin Small Letter U with caron'),
        },
        {
          code: '&#x01D5;',
          name: i18n('Latin Capital Letter U with diaeresis and macron'),
        },
        {
          code: '&#x01D6;',
          name: i18n('Latin Small Letter U with diaeresis and macron'),
        },
        {
          code: '&#x01D7;',
          name: i18n('Latin Capital Letter U with diaeresis and acute'),
        },
        {
          code: '&#x01D8;',
          name: i18n('Latin Small Letter U with diaeresis and acute'),
        },
        {
          code: '&#x01D9;',
          name: i18n('Latin Capital Letter U with diaeresis and caron'),
        },
        {
          code: '&#x01DA;',
          name: i18n('Latin Small Letter U with diaeresis and caron'),
        },
        {
          code: '&#x01DB;',
          name: i18n('Latin Capital Letter U with diaeresis and grave'),
        },
        {
          code: '&#x01DC;',
          name: i18n('Latin Small Letter U with diaeresis and grave'),
        },
        {
          code: '&#x01DD;',
          name: i18n('Latin Small Letter Turned E'),
        },
        {
          code: '&#x01DE;',
          name: i18n('Latin Capital Letter A with diaeresis and macron'),
        },
        {
          code: '&#x01DF;',
          name: i18n('Latin Small Letter A with diaeresis and macron'),
        },
        {
          code: '&#x01E0;',
          name: i18n('Latin Capital Letter A with dot above and macron'),
        },
        {
          code: '&#x01E1;',
          name: i18n('Latin Small Letter A with dot above and macron'),
        },
        {
          code: '&#x01E2;',
          name: i18n('Latin Capital Letter Æ with macron'),
        },
        {
          code: '&#x01E3;',
          name: i18n('Latin Small Letter Æ with macron'),
        },
        {
          code: '&#x01E4;',
          name: i18n('Latin Capital Letter G with stroke'),
        },
        {
          code: '&#x01E5;',
          name: i18n('Latin Small Letter G with stroke'),
        },
        {
          code: '&#x01E6;',
          name: i18n('Latin Capital Letter G with caron'),
        },
        {
          code: '&#x01E7;',
          name: i18n('Latin Small Letter G with caron'),
        },
        {
          code: '&#x01E8;',
          name: i18n('Latin Capital Letter K with caron'),
        },
        {
          code: '&#x01E9;',
          name: i18n('Latin Small Letter K with caron'),
        },
        {
          code: '&#x01EA;',
          name: i18n('Latin Capital Letter O with ogonek'),
        },
        {
          code: '&#x01EB;',
          name: i18n('Latin Small Letter O with ogonek'),
        },
        {
          code: '&#x01EC;',
          name: i18n('Latin Capital Letter O with ogonek and macron'),
        },
        {
          code: '&#x01ED;',
          name: i18n('Latin Small Letter O with ogonek and macron'),
        },
        {
          code: '&#x01EE;',
          name: i18n('Latin Capital Letter Ezh with caron'),
        },
        {
          code: '&#x01EF;',
          name: i18n('Latin Small Letter Ezh with caron'),
        },
        {
          code: '&#x01F0;',
          name: i18n('Latin Small Letter J with caron'),
        },
        {
          code: '&#x01F1;',
          name: i18n('Latin Capital Letter DZ'),
        },
        {
          code: '&#x01F2;',
          name: i18n('Latin Capital Letter D with Small Letter Z'),
        },
        {
          code: '&#x01F3;',
          name: i18n('Latin Small Letter DZ'),
        },
        {
          code: '&#x01F4;',
          name: i18n('Latin Capital Letter G with acute'),
        },
        {
          code: '&#x01F5;',
          name: i18n('Latin Small Letter G with acute'),
        },
        {
          code: '&#x01F6;',
          name: i18n('Latin Capital Letter Hwair'),
        },
        {
          code: '&#x01F7;',
          name: i18n('Latin Capital Letter Wynn'),
        },
        {
          code: '&#x01F8;',
          name: i18n('Latin Capital Letter N with grave'),
        },
        {
          code: '&#x01F9;',
          name: i18n('Latin Small Letter N with grave'),
        },
        {
          code: '&#x01FA;',
          name: i18n('Latin Capital Letter A with ring above and acute'),
        },
        {
          code: '&#x01FB;',
          name: i18n('Latin Small Letter A with ring above and acute'),
        },
        {
          code: '&#x01FC;',
          name: i18n('Latin Capital Letter Æ with acute'),
        },
        {
          code: '&#x01FD;',
          name: i18n('Latin Small Letter Æ with acute'),
        },
        {
          code: '&#x01FE;',
          name: i18n('Latin Capital Letter O with stroke and acute'),
        },
        {
          code: '&#x01FF;',
          name: i18n('Latin Small Letter O with stroke and acute'),
        },
        {
          code: '&#x0200;',
          name: i18n('Latin Capital Letter A with double grave'),
        },
        {
          code: '&#x0201;',
          name: i18n('Latin Small Letter A with double grave'),
        },
        {
          code: '&#x0202;',
          name: i18n('Latin Capital Letter A with inverted breve'),
        },
        {
          code: '&#x0203;',
          name: i18n('Latin Small Letter A with inverted breve'),
        },
        {
          code: '&#x0204;',
          name: i18n('Latin Capital Letter E with double grave'),
        },
        {
          code: '&#x0205;',
          name: i18n('Latin Small Letter E with double grave'),
        },
        {
          code: '&#x0206;',
          name: i18n('Latin Capital Letter E with inverted breve'),
        },
        {
          code: '&#x0207;',
          name: i18n('Latin Small Letter E with inverted breve'),
        },
        {
          code: '&#x0208;',
          name: i18n('Latin Capital Letter I with double grave'),
        },
        {
          code: '&#x0209;',
          name: i18n('Latin Small Letter I with double grave'),
        },
        {
          code: '&#x020A;',
          name: i18n('Latin Capital Letter I with inverted breve'),
        },
        {
          code: '&#x020B;',
          name: i18n('Latin Small Letter I with inverted breve'),
        },
        {
          code: '&#x020C;',
          name: i18n('Latin Capital Letter O with double grave'),
        },
        {
          code: '&#x020D;',
          name: i18n('Latin Small Letter O with double grave'),
        },
        {
          code: '&#x020E;',
          name: i18n('Latin Capital Letter O with inverted breve'),
        },
        {
          code: '&#x020F;',
          name: i18n('Latin Small Letter O with inverted breve'),
        },
        {
          code: '&#x0210;',
          name: i18n('Latin Capital Letter R with double grave'),
        },
        {
          code: '&#x0211;',
          name: i18n('Latin Small Letter R with double grave'),
        },
        {
          code: '&#x0212;',
          name: i18n('Latin Capital Letter R with inverted breve'),
        },
        {
          code: '&#x0213;',
          name: i18n('Latin Small Letter R with inverted breve'),
        },
        {
          code: '&#x0214;',
          name: i18n('Latin Capital Letter U with double grave'),
        },
        {
          code: '&#x0215;',
          name: i18n('Latin Small Letter U with double grave'),
        },
        {
          code: '&#x0216;',
          name: i18n('Latin Capital Letter U with inverted breve'),
        },
        {
          code: '&#x0217;',
          name: i18n('Latin Small Letter U with inverted breve'),
        },
        {
          code: '&#x0218;',
          name: i18n('Latin Capital Letter S with comma below'),
        },
        {
          code: '&#x0219;',
          name: i18n('Latin Small Letter S with comma below'),
        },
        {
          code: '&#x021A;',
          name: i18n('Latin Capital Letter T with comma below'),
        },
        {
          code: '&#x021B;',
          name: i18n('Latin Small Letter T with comma below'),
        },
        {
          code: '&#x021C;',
          name: i18n('Latin Capital Letter Yogh'),
        },
        {
          code: '&#x021D;',
          name: i18n('Latin Small Letter Yogh'),
        },
        {
          code: '&#x021E;',
          name: i18n('Latin Capital Letter H with caron'),
        },
        {
          code: '&#x021F;',
          name: i18n('Latin Small Letter H with caron'),
        },
        {
          code: '&#x0220;',
          name: i18n('Latin Capital Letter N with long right leg'),
        },
        {
          code: '&#x0221;',
          name: i18n('Latin Small Letter D with curl'),
        },
        {
          code: '&#x0222;',
          name: i18n('Latin Capital Letter OU'),
        },
        {
          code: '&#x0223;',
          name: i18n('Latin Small Letter OU'),
        },
        {
          code: '&#x0224;',
          name: i18n('Latin Capital Letter Z with hook'),
        },
        {
          code: '&#x0225;',
          name: i18n('Latin Small Letter Z with hook'),
        },
        {
          code: '&#x0226;',
          name: i18n('Latin Capital Letter A with dot above'),
        },
        {
          code: '&#x0227;',
          name: i18n('Latin Small Letter A with dot above'),
        },
        {
          code: '&#x0228;',
          name: i18n('Latin Capital Letter E with cedilla'),
        },
        {
          code: '&#x0229;',
          name: i18n('Latin Small Letter E with cedilla'),
        },
        {
          code: '&#x022A;',
          name: i18n('Latin Capital Letter O with diaeresis and macron'),
        },
        {
          code: '&#x022B;',
          name: i18n('Latin Small Letter O with diaeresis and macron'),
        },
        {
          code: '&#x022C;',
          name: i18n('Latin Capital Letter O with tilde and macron'),
        },
        {
          code: '&#x022D;',
          name: i18n('Latin Small Letter O with tilde and macron'),
        },
        {
          code: '&#x022E;',
          name: i18n('Latin Capital Letter O with dot above'),
        },
        {
          code: '&#x022F;',
          name: i18n('Latin Small Letter O with dot above'),
        },
        {
          code: '&#x0230;',
          name: i18n('Latin Capital Letter O with dot above and macron'),
        },
        {
          code: '&#x0231;',
          name: i18n('Latin Small Letter O with dot above and macron'),
        },
        {
          code: '&#x0232;',
          name: i18n('Latin Capital Letter Y with macron'),
        },
        {
          code: '&#x0233;',
          name: i18n('Latin Small Letter Y with macron'),
        },
        {
          code: '&#x0234;',
          name: i18n('Latin Small Letter L with curl'),
        },
        {
          code: '&#x0235;',
          name: i18n('Latin Small Letter N with curl'),
        },
        {
          code: '&#x0236;',
          name: i18n('Latin Small Letter T with curl'),
        },
        {
          code: '&#x0237;',
          name: i18n('Latin Small Letter Dotless J'),
        },
        {
          code: '&#x0238;',
          name: i18n('Latin Small Letter DB Digraph'),
        },
        {
          code: '&#x0239;',
          name: i18n('Latin Small Letter QP Digraph'),
        },
        {
          code: '&#x023A;',
          name: i18n('Latin Capital Letter A with stroke'),
        },
        {
          code: '&#x023B;',
          name: i18n('Latin Capital Letter C with stroke'),
        },
        {
          code: '&#x023C;',
          name: i18n('Latin Small Letter C with stroke'),
        },
        {
          code: '&#x023D;',
          name: i18n('Latin Capital Letter L with bar'),
        },
        {
          code: '&#x023E;',
          name: i18n('Latin Capital Letter T with diagonal stroke'),
        },
        {
          code: '&#x023F;',
          name: i18n('Latin Small Letter S with swash tail'),
        },
        {
          code: '&#x0240;',
          name: i18n('Latin Small Letter Z with swash tail'),
        },
        {
          code: '&#x0241;',
          name: i18n('Latin Capital Letter Glottal Stop'),
        },
        {
          code: '&#x0242;',
          name: i18n('Latin Small Letter Glottal Stop'),
        },
        {
          code: '&#x0243;',
          name: i18n('Latin Capital Letter B with stroke'),
        },
        {
          code: '&#x0244;',
          name: i18n('Latin Capital Letter U bar'),
        },
        {
          code: '&#x0245;',
          name: i18n('Latin Capital Letter Turned V'),
        },
        {
          code: '&#x0246;',
          name: i18n('Latin Capital Letter E with stroke'),
        },
        {
          code: '&#x0247;',
          name: i18n('Latin Small Letter E with stroke'),
        },
        {
          code: '&#x0248;',
          name: i18n('Latin Capital Letter J with stroke'),
        },
        {
          code: '&#x0249;',
          name: i18n('Latin Small Letter J with stroke'),
        },
        {
          code: '&#x024A;',
          name: i18n('Latin Capital Letter Q with hook tail'),
        },
        {
          code: '&#x024B;',
          name: i18n('Latin Small Letter Q with hook tail'),
        },
        {
          code: '&#x024C;',
          name: i18n('Latin Capital Letter R with stroke'),
        },
        {
          code: '&#x024D;',
          name: i18n('Latin Small Letter R with stroke'),
        },
        {
          code: '&#x024E;',
          name: i18n('Latin Capital Letter Y with stroke'),
        },
        {
          code: '&#x024F;',
          name: i18n('Latin Small Letter Y with stroke'),
        },
        {
          code: '&#x1E02;',
          name: i18n('Latin Capital Letter B with dot above'),
        },
        {
          code: '&#x1E03;',
          name: i18n('Latin Small Letter B with dot above'),
        },
        {
          code: '&#x1E0A;',
          name: i18n('Latin Capital Letter D with dot above'),
        },
        {
          code: '&#x1E0B;',
          name: i18n('Latin Small Letter D with dot above'),
        },
        {
          code: '&#x1E1E;',
          name: i18n('Latin Capital Letter F with dot above'),
        },
        {
          code: '&#x1E1F;',
          name: i18n('Latin Small Letter F with dot above'),
        },
        {
          code: '&#x1E40;',
          name: i18n('Latin Capital Letter M with dot above'),
        },
        {
          code: '&#x1E41;',
          name: i18n('Latin Small Letter M with dot above'),
        },
        {
          code: '&#x1E56;',
          name: i18n('Latin Capital Letter P with dot above'),
        },
        {
          code: '&#x1E57;',
          name: i18n('Latin Small Letter P with dot above'),
        },
        {
          code: '&#x1E60;',
          name: i18n('Latin Capital Letter S with dot above'),
        },
        {
          code: '&#x1E61;',
          name: i18n('Latin Small Letter S with dot above'),
        },
        {
          code: '&#x1E6A;',
          name: i18n('Latin Capital Letter T with dot above'),
        },
        {
          code: '&#x1E6B;',
          name: i18n('Latin Small Letter T with dot above'),
        },
        {
          code: '&#x1E80;',
          name: i18n('Latin Capital Letter W with grave'),
        },
        {
          code: '&#x1E81;',
          name: i18n('Latin Small Letter W with grave'),
        },
        {
          code: '&#x1E82;',
          name: i18n('Latin Capital Letter W with acute'),
        },
        {
          code: '&#x1E83;',
          name: i18n('Latin Small Letter W with acute'),
        },
        {
          code: '&#x1E84;',
          name: i18n('Latin Capital Letter W with diaeresis'),
        },
        {
          code: '&#x1E85;',
          name: i18n('Latin Small Letter W with diaeresis'),
        },
        {
          code: '&#x1E9B;',
          name: i18n('Latin Small Letter Long S with dot above'),
        },
        {
          code: '&#x1EF2;',
          name: i18n('Latin Capital Letter Y with grave'),
        },
        {
          code: '&#x1EF3;',
          name: i18n('Latin Small Letter Y with grave'),
        },
        {
          code: '&#x0259;',
          name: i18n('Latin Small Letter Schwa'),
        },
        {
          code: '&#x027C;',
          name: i18n('Latin Small Letter R with long leg'),
        },
        {
          code: '&#x0292;',
          name: i18n('Latin Small Letter Ezh'),
        },
      ],
    },
  ],
  currency: [
    {
      type: 'group',
      name: i18n('All currencies'),
      symbols: [
        {
          code: '&#x20AC;',
          name: i18n('EURO SIGN'),
        },
        {
          code: '&#x0024;',
          name: i18n('DOLLAR SIGN'),
        },
        {
          code: '&#x00A2;',
          name: i18n('CENT SIGN'),
        },
        {
          code: '&#x20B9;',
          name: i18n('INDIAN RUPEE SIGN'),
        },
        {
          code: '&#x00A5;',
          name: i18n('YEN SIGN'),
        },
        {
          code: '&#x00A3;',
          name: i18n('POUND SIGN'),
        },
        {
          code: '&#x20A0;',
          name: i18n('EURO-CURRENCY SIGN'),
        },
        {
          code: '&#x20A1;',
          name: i18n('COLON SIGN'),
        },
        {
          code: '&#x20A2;',
          name: i18n('CRUZEIRO SIGN'),
        },
        {
          code: '&#x20A3;',
          name: i18n('FRENCH FRANC SIGN'),
        },
        {
          code: '&#x20A4;',
          name: i18n('LIRA SIGN'),
        },
        {
          code: '&#x20A5;',
          name: i18n('MILL SIGN'),
        },
        {
          code: '&#x20A6;',
          name: i18n('NAIRA SIGN'),
        },
        {
          code: '&#x20A7;',
          name: i18n('PESETA SIGN'),
        },
        {
          code: '&#x20A8;',
          name: i18n('RUPEE SIGN'),
        },
        {
          code: '&#x20A9;',
          name: i18n('WON SIGN'),
        },
        {
          code: '&#x20AA;',
          name: i18n('NEW SHEQEL SIGN'),
        },
        {
          code: '&#x20AB;',
          name: i18n('DONG SIGN'),
        },
        {
          code: '&#x20AD;',
          name: i18n('KIP SIGN'),
        },
        {
          code: '&#x20AE;',
          name: i18n('TUGRIK SIGN'),
        },
        {
          code: '&#x20AF;',
          name: i18n('DRACHMA SIGN'),
        },
        {
          code: '&#x20B0;',
          name: i18n('GERMAN PENNY SIGN'),
        },
        {
          code: '&#x20B1;',
          name: i18n('PESO SIGN'),
        },
        {
          code: '&#x20B2;',
          name: i18n('GUARANI SIGN'),
        },
        {
          code: '&#x20B3;',
          name: i18n('AUSTRAL SIGN'),
        },
        {
          code: '&#x20B4;',
          name: i18n('HRYVNIA SIGN'),
        },
        {
          code: '&#x20B5;',
          name: i18n('CEDI SIGN'),
        },
        {
          code: '&#x20B6;',
          name: i18n('LIVRE TOURNOIS SIGN'),
        },
        {
          code: '&#x20B7;',
          name: i18n('SPESMILO SIGN'),
        },
        {
          code: '&#x20B8;',
          name: i18n('TENGE SIGN'),
        },
        {
          code: '&#x20BA;',
          name: i18n('TURKISH LIRA SIGN'),
        },
        {
          code: '&#x20BB;',
          name: i18n('NORDIC MARK SIGN'),
        },
        {
          code: '&#x20BC;',
          name: i18n('MANAT SIGN'),
        },
        {
          code: '&#x20BD;',
          name: i18n('RUBLE SIGN'),
        },
        {
          code: '&#x20BE;',
          name: i18n('LARI SIGN'),
        },
      ],
    },
  ],
  emoji: [
    {
      type: 'group',
      name: i18n('All emojies'),
      symbols: [
        {
          code: '&#x1F600;',
          name: i18n('GRINNING FACE'),
        },
        {
          code: '&#x1F601;',
          name: i18n('GRINNING FACE WITH SMILING EYES'),
        },
        {
          code: '&#x1F602;',
          name: i18n('FACE WITH TEARS OF JOY'),
        },
        {
          code: '&#x1F603;',
          name: i18n('SMILING FACE WITH OPEN MOUTH'),
        },
        {
          code: '&#x1F604;',
          name: i18n('SMILING FACE WITH OPEN MOUTH AND SMILING EYES'),
        },
        {
          code: '&#x1F605;',
          name: i18n('SMILING FACE WITH OPEN MOUTH AND COLD SWEAT'),
        },
        {
          code: '&#x1F606;',
          name: i18n('SMILING FACE WITH OPEN MOUTH AND TIGHTLY-CLOSED EYES'),
        },
        {
          code: '&#x1F607;',
          name: i18n('SMILING FACE WITH HALO'),
        },
        {
          code: '&#x1F608;',
          name: i18n('SMILING FACE WITH HORNS'),
        },
        {
          code: '&#x1F609;',
          name: i18n('WINKING FACE'),
        },
        {
          code: '&#x1F60A;',
          name: i18n('SMILING FACE WITH SMILING EYES'),
        },
        {
          code: '&#x1F60B;',
          name: i18n('FACE SAVOURING DELICIOUS FOOD'),
        },
        {
          code: '&#x1F60C;',
          name: i18n('RELIEVED FACE'),
        },
        {
          code: '&#x1F60D;',
          name: i18n('SMILING FACE WITH HEART-SHAPED EYES'),
        },
        {
          code: '&#x1F60E;',
          name: i18n('SMILING FACE WITH SUNGLASSES'),
        },
        {
          code: '&#x1F60F;',
          name: i18n('SMIRKING FACE'),
        },
        {
          code: '&#x1F610;',
          name: i18n('NEUTRAL FACE'),
        },
        {
          code: '&#x1F611;',
          name: i18n('EXPRESSIONLESS FACE'),
        },
        {
          code: '&#x1F612;',
          name: i18n('UNAMUSED FACE'),
        },
        {
          code: '&#x1F613;',
          name: i18n('FACE WITH COLD SWEAT'),
        },
        {
          code: '&#x1F614;',
          name: i18n('PENSIVE FACE'),
        },
        {
          code: '&#x1F615;',
          name: i18n('CONFUSED FACE'),
        },
        {
          code: '&#x1F616;',
          name: i18n('CONFOUNDED FACE'),
        },
        {
          code: '&#x1F617;',
          name: i18n('KISSING FACE'),
        },
        {
          code: '&#x1F618;',
          name: i18n('FACE THROWING A KISS'),
        },
        {
          code: '&#x1F619;',
          name: i18n('KISSING FACE WITH SMILING EYES'),
        },
        {
          code: '&#x1F61A;',
          name: i18n('KISSING FACE WITH CLOSED EYES'),
        },
        {
          code: '&#x1F61B;',
          name: i18n('FACE WITH STUCK-OUT TONGUE'),
        },
        {
          code: '&#x1F61C;',
          name: i18n('FACE WITH STUCK-OUT TONGUE AND WINKING EYE'),
        },
        {
          code: '&#x1F61D;',
          name: i18n('FACE WITH STUCK-OUT TONGUE AND TIGHTLY-CLOSED EYES'),
        },
        {
          code: '&#x1F61E;',
          name: i18n('DISAPPOINTED FACE'),
        },
        {
          code: '&#x1F61F;',
          name: i18n('WORRIED FACE'),
        },
        {
          code: '&#x1F620;',
          name: i18n('ANGRY FACE'),
        },
        {
          code: '&#x1F621;',
          name: i18n('POUTING FACE'),
        },
        {
          code: '&#x1F622;',
          name: i18n('CRYING FACE'),
        },
        {
          code: '&#x1F623;',
          name: i18n('PERSEVERING FACE'),
        },
        {
          code: '&#x1F624;',
          name: i18n('FACE WITH LOOK OF TRIUMPH'),
        },
        {
          code: '&#x1F625;',
          name: i18n('DISAPPOINTED BUT RELIEVED FACE'),
        },
        {
          code: '&#x1F626;',
          name: i18n('FROWNING FACE WITH OPEN MOUTH'),
        },
        {
          code: '&#x1F627;',
          name: i18n('ANGUISHED FACE'),
        },
        {
          code: '&#x1F628;',
          name: i18n('FEARFUL FACE'),
        },
        {
          code: '&#x1F629;',
          name: i18n('WEARY FACE'),
        },
        {
          code: '&#x1F62A;',
          name: i18n('SLEEPY FACE'),
        },
        {
          code: '&#x1F62B;',
          name: i18n('TIRED FACE'),
        },
        {
          code: '&#x1F62C;',
          name: i18n('GRIMACING FACE'),
        },
        {
          code: '&#x1F62D;',
          name: i18n('LOUDLY CRYING FACE'),
        },
        {
          code: '&#x1F62E;',
          name: i18n('FACE WITH OPEN MOUTH'),
        },
        {
          code: '&#x1F62F;',
          name: i18n('HUSHED FACE'),
        },
        {
          code: '&#x1F630;',
          name: i18n('FACE WITH OPEN MOUTH AND COLD SWEAT'),
        },
        {
          code: '&#x1F631;',
          name: i18n('FACE SCREAMING IN FEAR'),
        },
        {
          code: '&#x1F632;',
          name: i18n('ASTONISHED FACE'),
        },
        {
          code: '&#x1F633;',
          name: i18n('FLUSHED FACE'),
        },
        {
          code: '&#x1F634;',
          name: i18n('SLEEPING FACE'),
        },
        {
          code: '&#x1F635;',
          name: i18n('DIZZY FACE'),
        },
        {
          code: '&#x1F636;',
          name: i18n('FACE WITHOUT MOUTH'),
        },
        {
          code: '&#x1F637;',
          name: i18n('FACE WITH MEDICAL MASK'),
        },
        {
          code: '&#x1F638;',
          name: i18n('GRINNING CAT FACE WITH SMILING EYES'),
        },
        {
          code: '&#x1F639;',
          name: i18n('CAT FACE WITH TEARS OF JOY'),
        },
        {
          code: '&#x1F63A;',
          name: i18n('SMILING CAT FACE WITH OPEN MOUTH'),
        },
        {
          code: '&#x1F63B;',
          name: i18n('SMILING CAT FACE WITH HEART-SHAPED EYES'),
        },
        {
          code: '&#x1F63C;',
          name: i18n('CAT FACE WITH WRY SMILE'),
        },
        {
          code: '&#x1F63D;',
          name: i18n('KISSING CAT FACE WITH CLOSED EYES'),
        },
        {
          code: '&#x1F63E;',
          name: i18n('POUTING CAT FACE'),
        },
        {
          code: '&#x1F63F;',
          name: i18n('CRYING CAT FACE'),
        },
        {
          code: '&#x1F640;',
          name: i18n('WEARY CAT FACE'),
        },
        {
          code: '&#x1F641;',
          name: i18n('SLIGHTLY FROWNING FACE'),
        },
        {
          code: '&#x1F642;',
          name: i18n('SLIGHTLY SMILING FACE'),
        },
        {
          code: '&#x1F643;',
          name: i18n('UPSIDE-DOWN FACE'),
        },
        {
          code: '&#x1F644;',
          name: i18n('FACE WITH ROLLING EYES'),
        },
        {
          code: '&#x1F645;',
          name: i18n('FACE WITH NO GOOD GESTURE'),
        },
        {
          code: '&#x1F646;',
          name: i18n('FACE WITH OK GESTURE'),
        },
        {
          code: '&#x1F647;',
          name: i18n('PERSON BOWING DEEPLY'),
        },
        {
          code: '&#x1F648;',
          name: i18n('SEE-NO-EVIL MONKEY'),
        },
        {
          code: '&#x1F649;',
          name: i18n('HEAR-NO-EVIL MONKEY'),
        },
        {
          code: '&#x1F64A;',
          name: i18n('SPEAK-NO-EVIL MONKEY'),
        },
        {
          code: '&#x1F64B;',
          name: i18n('HAPPY PERSON RAISING ONE HAND'),
        },
        {
          code: '&#x1F64C;',
          name: i18n('PERSON RAISING BOTH HANDS IN CELEBRATION'),
        },
        {
          code: '&#x1F64D;',
          name: i18n('PERSON FROWNING'),
        },
        {
          code: '&#x1F64E;',
          name: i18n('PERSON WITH POUTING FACE'),
        },
        {
          code: '&#x1F64F;',
          name: i18n('PERSON WITH FOLDED HANDS'),
        },
        {
          code: '&#x1F300;',
          name: i18n('CYCLONE'),
        },
        {
          code: '&#x1F301;',
          name: i18n('FOGGY'),
        },
        {
          code: '&#x1F302;',
          name: i18n('CLOSED UMBRELLA'),
        },
        {
          code: '&#x1F303;',
          name: i18n('NIGHT WITH STARS'),
        },
        {
          code: '&#x1F304;',
          name: i18n('SUNRISE OVER MOUNTAINS'),
        },
        {
          code: '&#x1F305;',
          name: i18n('SUNRISE'),
        },
        {
          code: '&#x1F306;',
          name: i18n('CITYSCAPE AT DUSK'),
        },
        {
          code: '&#x1F307;',
          name: i18n('SUNSET OVER BUILDINGS'),
        },
        {
          code: '&#x1F308;',
          name: i18n('RAINBOW'),
        },
        {
          code: '&#x1F309;',
          name: i18n('BRIDGE AT NIGHT'),
        },
        {
          code: '&#x1F30A;',
          name: i18n('WATER WAVE'),
        },
        {
          code: '&#x1F30B;',
          name: i18n('VOLCANO'),
        },
        {
          code: '&#x1F30C;',
          name: i18n('MILKY WAY'),
        },
        {
          code: '&#x1F30D;',
          name: i18n('EARTH GLOBE EUROPE-AFRICA'),
        },
        {
          code: '&#x1F30E;',
          name: i18n('EARTH GLOBE AMERICAS'),
        },
        {
          code: '&#x1F30F;',
          name: i18n('EARTH GLOBE ASIA-AUSTRALIA'),
        },
        {
          code: '&#x1F310;',
          name: i18n('GLOBE WITH MERIDIANS'),
        },
        {
          code: '&#x1F311;',
          name: i18n('NEW MOON SYMBOL'),
        },
        {
          code: '&#x1F312;',
          name: i18n('WAXING CRESCENT MOON SYMBOL'),
        },
        {
          code: '&#x1F313;',
          name: i18n('FIRST QUARTER MOON SYMBOL'),
        },
        {
          code: '&#x1F314;',
          name: i18n('WAXING GIBBOUS MOON SYMBOL'),
        },
        {
          code: '&#x1F315;',
          name: i18n('FULL MOON SYMBOL'),
        },
        {
          code: '&#x1F316;',
          name: i18n('WANING GIBBOUS MOON SYMBOL'),
        },
        {
          code: '&#x1F317;',
          name: i18n('LAST QUARTER MOON SYMBOL'),
        },
        {
          code: '&#x1F318;',
          name: i18n('WANING CRESCENT MOON SYMBOL'),
        },
        {
          code: '&#x1F319;',
          name: i18n('CRESCENT MOON'),
        },
        {
          code: '&#x1F31A;',
          name: i18n('NEW MOON WITH FACE'),
        },
        {
          code: '&#x1F31B;',
          name: i18n('FIRST QUARTER MOON WITH FACE'),
        },
        {
          code: '&#x1F31C;',
          name: i18n('LAST QUARTER MOON WITH FACE'),
        },
        {
          code: '&#x1F31D;',
          name: i18n('FULL MOON WITH FACE'),
        },
        {
          code: '&#x1F31E;',
          name: i18n('SUN WITH FACE'),
        },
        {
          code: '&#x1F31F;',
          name: i18n('GLOWING STAR'),
        },
        {
          code: '&#x1F320;',
          name: i18n('SHOOTING STAR'),
        },
        {
          code: '&#x1F321;',
          name: i18n('THERMOMETER'),
        },
        {
          code: '&#x1F324;',
          name: i18n('WHITE SUN WITH SMALL CLOUD'),
        },
        {
          code: '&#x1F325;',
          name: i18n('WHITE SUN BEHIND CLOUD'),
        },
        {
          code: '&#x1F326;',
          name: i18n('WHITE SUN BEHIND CLOUD WITH RAIN'),
        },
        {
          code: '&#x1F327;',
          name: i18n('CLOUD WITH RAIN'),
        },
        {
          code: '&#x1F328;',
          name: i18n('CLOUD WITH SNOW'),
        },
        {
          code: '&#x1F329;',
          name: i18n('CLOUD WITH LIGHTNING'),
        },
        {
          code: '&#x1F32A;',
          name: i18n('CLOUD WITH TORNADO'),
        },
        {
          code: '&#x1F32B;',
          name: i18n('FOG'),
        },
        {
          code: '&#x1F32C;',
          name: i18n('WIND BLOWING FACE'),
        },
        {
          code: '&#x1F32D;',
          name: i18n('HOT DOG'),
        },
        {
          code: '&#x1F32E;',
          name: i18n('TACO'),
        },
        {
          code: '&#x1F32F;',
          name: i18n('BURRITO'),
        },
        {
          code: '&#x1F330;',
          name: i18n('CHESTNUT'),
        },
        {
          code: '&#x1F331;',
          name: i18n('SEEDLING'),
        },
        {
          code: '&#x1F332;',
          name: i18n('EVERGREEN TREE'),
        },
        {
          code: '&#x1F333;',
          name: i18n('DECIDUOUS TREE'),
        },
        {
          code: '&#x1F334;',
          name: i18n('PALM TREE'),
        },
        {
          code: '&#x1F335;',
          name: i18n('CACTUS'),
        },
        {
          code: '&#x1F336;',
          name: i18n('HOT PEPPER'),
        },
        {
          code: '&#x1F337;',
          name: i18n('TULIP'),
        },
        {
          code: '&#x1F338;',
          name: i18n('CHERRY BLOSSOM'),
        },
        {
          code: '&#x1F339;',
          name: i18n('ROSE'),
        },
        {
          code: '&#x1F33A;',
          name: i18n('HIBISCUS'),
        },
        {
          code: '&#x1F33B;',
          name: i18n('SUNFLOWER'),
        },
        {
          code: '&#x1F33C;',
          name: i18n('BLOSSOM'),
        },
        {
          code: '&#x1F33D;',
          name: i18n('EAR OF MAIZE'),
        },
        {
          code: '&#x1F33E;',
          name: i18n('EAR OF RICE'),
        },
        {
          code: '&#x1F33F;',
          name: i18n('HERB'),
        },
        {
          code: '&#x1F340;',
          name: i18n('FOUR LEAF CLOVER'),
        },
        {
          code: '&#x1F341;',
          name: i18n('MAPLE LEAF'),
        },
        {
          code: '&#x1F342;',
          name: i18n('FALLEN LEAF'),
        },
        {
          code: '&#x1F343;',
          name: i18n('LEAF FLUTTERING IN WIND'),
        },
        {
          code: '&#x1F344;',
          name: i18n('MUSHROOM'),
        },
        {
          code: '&#x1F345;',
          name: i18n('TOMATO'),
        },
        {
          code: '&#x1F346;',
          name: i18n('AUBERGINE'),
        },
        {
          code: '&#x1F347;',
          name: i18n('GRAPES'),
        },
        {
          code: '&#x1F348;',
          name: i18n('MELON'),
        },
        {
          code: '&#x1F349;',
          name: i18n('WATERMELON'),
        },
        {
          code: '&#x1F34A;',
          name: i18n('TANGERINE'),
        },
        {
          code: '&#x1F34B;',
          name: i18n('LEMON'),
        },
        {
          code: '&#x1F34C;',
          name: i18n('BANANA'),
        },
        {
          code: '&#x1F34D;',
          name: i18n('PINEAPPLE'),
        },
        {
          code: '&#x1F34E;',
          name: i18n('RED APPLE'),
        },
        {
          code: '&#x1F34F;',
          name: i18n('GREEN APPLE'),
        },
        {
          code: '&#x1F350;',
          name: i18n('PEAR'),
        },
        {
          code: '&#x1F351;',
          name: i18n('PEACH'),
        },
        {
          code: '&#x1F352;',
          name: i18n('CHERRIES'),
        },
        {
          code: '&#x1F353;',
          name: i18n('STRAWBERRY'),
        },
        {
          code: '&#x1F354;',
          name: i18n('HAMBURGER'),
        },
        {
          code: '&#x1F355;',
          name: i18n('SLICE OF PIZZA'),
        },
        {
          code: '&#x1F356;',
          name: i18n('MEAT ON BONE'),
        },
        {
          code: '&#x1F357;',
          name: i18n('POULTRY LEG'),
        },
        {
          code: '&#x1F358;',
          name: i18n('RICE CRACKER'),
        },
        {
          code: '&#x1F359;',
          name: i18n('RICE BALL'),
        },
        {
          code: '&#x1F35A;',
          name: i18n('COOKED RICE'),
        },
        {
          code: '&#x1F35B;',
          name: i18n('CURRY AND RICE'),
        },
        {
          code: '&#x1F35C;',
          name: i18n('STEAMING BOWL'),
        },
        {
          code: '&#x1F35D;',
          name: i18n('SPAGHETTI'),
        },
        {
          code: '&#x1F35E;',
          name: i18n('BREAD'),
        },
        {
          code: '&#x1F35F;',
          name: i18n('FRENCH FRIES'),
        },
        {
          code: '&#x1F360;',
          name: i18n('ROASTED SWEET POTATO'),
        },
        {
          code: '&#x1F361;',
          name: i18n('DANGO'),
        },
        {
          code: '&#x1F362;',
          name: i18n('ODEN'),
        },
        {
          code: '&#x1F363;',
          name: i18n('SUSHI'),
        },
        {
          code: '&#x1F364;',
          name: i18n('FRIED SHRIMP'),
        },
        {
          code: '&#x1F365;',
          name: i18n('FISH CAKE WITH SWIRL DESIGN'),
        },
        {
          code: '&#x1F366;',
          name: i18n('SOFT ICE CREAM'),
        },
        {
          code: '&#x1F367;',
          name: i18n('SHAVED ICE'),
        },
        {
          code: '&#x1F368;',
          name: i18n('ICE CREAM'),
        },
        {
          code: '&#x1F369;',
          name: i18n('DOUGHNUT'),
        },
        {
          code: '&#x1F36A;',
          name: i18n('COOKIE'),
        },
        {
          code: '&#x1F36B;',
          name: i18n('CHOCOLATE BAR'),
        },
        {
          code: '&#x1F36C;',
          name: i18n('CANDY'),
        },
        {
          code: '&#x1F36D;',
          name: i18n('LOLLIPOP'),
        },
        {
          code: '&#x1F36E;',
          name: i18n('CUSTARD'),
        },
        {
          code: '&#x1F36F;',
          name: i18n('HONEY POT'),
        },
        {
          code: '&#x1F370;',
          name: i18n('SHORTCAKE'),
        },
        {
          code: '&#x1F371;',
          name: i18n('BENTO BOX'),
        },
        {
          code: '&#x1F372;',
          name: i18n('POT OF FOOD'),
        },
        {
          code: '&#x1F373;',
          name: i18n('COOKING'),
        },
        {
          code: '&#x1F374;',
          name: i18n('FORK AND KNIFE'),
        },
        {
          code: '&#x1F375;',
          name: i18n('TEACUP WITHOUT HANDLE'),
        },
        {
          code: '&#x1F376;',
          name: i18n('SAKE BOTTLE AND CUP'),
        },
        {
          code: '&#x1F377;',
          name: i18n('WINE GLASS'),
        },
        {
          code: '&#x1F378;',
          name: i18n('COCKTAIL GLASS'),
        },
        {
          code: '&#x1F379;',
          name: i18n('TROPICAL DRINK'),
        },
        {
          code: '&#x1F37A;',
          name: i18n('BEER MUG'),
        },
        {
          code: '&#x1F37B;',
          name: i18n('CLINKING BEER MUGS'),
        },
        {
          code: '&#x1F37C;',
          name: i18n('BABY BOTTLE'),
        },
        {
          code: '&#x1F37D;',
          name: i18n('FORK AND KNIFE WITH PLATE'),
        },
        {
          code: '&#x1F37E;',
          name: i18n('BOTTLE WITH POPPING CORK'),
        },
        {
          code: '&#x1F37F;',
          name: i18n('POPCORN'),
        },
        {
          code: '&#x1F380;',
          name: i18n('RIBBON'),
        },
        {
          code: '&#x1F381;',
          name: i18n('WRAPPED PRESENT'),
        },
        {
          code: '&#x1F382;',
          name: i18n('BIRTHDAY CAKE'),
        },
        {
          code: '&#x1F383;',
          name: i18n('JACK-O-LANTERN'),
        },
        {
          code: '&#x1F384;',
          name: i18n('CHRISTMAS TREE'),
        },
        {
          code: '&#x1F385;',
          name: i18n('FATHER CHRISTMAS'),
        },
        {
          code: '&#x1F386;',
          name: i18n('FIREWORKS'),
        },
        {
          code: '&#x1F387;',
          name: i18n('FIREWORK SPARKLER'),
        },
        {
          code: '&#x1F388;',
          name: i18n('BALLOON'),
        },
        {
          code: '&#x1F389;',
          name: i18n('PARTY POPPER'),
        },
        {
          code: '&#x1F38A;',
          name: i18n('CONFETTI BALL'),
        },
        {
          code: '&#x1F38B;',
          name: i18n('TANABATA TREE'),
        },
        {
          code: '&#x1F38C;',
          name: i18n('CROSSED FLAGS'),
        },
        {
          code: '&#x1F38D;',
          name: i18n('PINE DECORATION'),
        },
        {
          code: '&#x1F38E;',
          name: i18n('JAPANESE DOLLS'),
        },
        {
          code: '&#x1F38F;',
          name: i18n('CARP STREAMER'),
        },
        {
          code: '&#x1F390;',
          name: i18n('WIND CHIME'),
        },
        {
          code: '&#x1F391;',
          name: i18n('MOON VIEWING CEREMONY'),
        },
        {
          code: '&#x1F392;',
          name: i18n('SCHOOL SATCHEL'),
        },
        {
          code: '&#x1F393;',
          name: i18n('GRADUATION CAP'),
        },
        {
          code: '&#x1F396;',
          name: i18n('MILITARY MEDAL'),
        },
        {
          code: '&#x1F397;',
          name: i18n('REMINDER RIBBON'),
        },
        {
          code: '&#x1F399;',
          name: i18n('STUDIO MICROPHONE'),
        },
        {
          code: '&#x1F39A;',
          name: i18n('LEVEL SLIDER'),
        },
        {
          code: '&#x1F39B;',
          name: i18n('CONTROL KNOBS'),
        },
        {
          code: '&#x1F39E;',
          name: i18n('FILM FRAMES'),
        },
        {
          code: '&#x1F39F;',
          name: i18n('ADMISSION TICKETS'),
        },
        {
          code: '&#x1F3A0;',
          name: i18n('CAROUSEL HORSE'),
        },
        {
          code: '&#x1F3A1;',
          name: i18n('FERRIS WHEEL'),
        },
        {
          code: '&#x1F3A2;',
          name: i18n('ROLLER COASTER'),
        },
        {
          code: '&#x1F3A3;',
          name: i18n('FISHING POLE AND FISH'),
        },
        {
          code: '&#x1F3A4;',
          name: i18n('MICROPHONE'),
        },
        {
          code: '&#x1F3A5;',
          name: i18n('MOVIE CAMERA'),
        },
        {
          code: '&#x1F3A6;',
          name: i18n('CINEMA'),
        },
        {
          code: '&#x1F3A7;',
          name: i18n('HEADPHONE'),
        },
        {
          code: '&#x1F3A8;',
          name: i18n('ARTIST PALETTE'),
        },
        {
          code: '&#x1F3A9;',
          name: i18n('TOP HAT'),
        },
        {
          code: '&#x1F3AA;',
          name: i18n('CIRCUS TENT'),
        },
        {
          code: '&#x1F3AB;',
          name: i18n('TICKET'),
        },
        {
          code: '&#x1F3AC;',
          name: i18n('CLAPPER BOARD'),
        },
        {
          code: '&#x1F3AD;',
          name: i18n('PERFORMING ARTS'),
        },
        {
          code: '&#x1F3AE;',
          name: i18n('VIDEO GAME'),
        },
        {
          code: '&#x1F3AF;',
          name: i18n('DIRECT HIT'),
        },
        {
          code: '&#x1F3B0;',
          name: i18n('SLOT MACHINE'),
        },
        {
          code: '&#x1F3B1;',
          name: i18n('BILLIARDS'),
        },
        {
          code: '&#x1F3B2;',
          name: i18n('GAME DIE'),
        },
        {
          code: '&#x1F3B3;',
          name: i18n('BOWLING'),
        },
        {
          code: '&#x1F3B4;',
          name: i18n('FLOWER PLAYING CARDS'),
        },
        {
          code: '&#x1F3B5;',
          name: i18n('MUSICAL NOTE'),
        },
        {
          code: '&#x1F3B6;',
          name: i18n('MULTIPLE MUSICAL NOTES'),
        },
        {
          code: '&#x1F3B7;',
          name: i18n('SAXOPHONE'),
        },
        {
          code: '&#x1F3B8;',
          name: i18n('GUITAR'),
        },
        {
          code: '&#x1F3B9;',
          name: i18n('MUSICAL KEYBOARD'),
        },
        {
          code: '&#x1F3BA;',
          name: i18n('TRUMPET'),
        },
        {
          code: '&#x1F3BB;',
          name: i18n('VIOLIN'),
        },
        {
          code: '&#x1F3BC;',
          name: i18n('MUSICAL SCORE'),
        },
        {
          code: '&#x1F3BD;',
          name: i18n('RUNNING SHIRT WITH SASH'),
        },
        {
          code: '&#x1F3BE;',
          name: i18n('TENNIS RACQUET AND BALL'),
        },
        {
          code: '&#x1F3BF;',
          name: i18n('SKI AND SKI BOOT'),
        },
        {
          code: '&#x1F3C0;',
          name: i18n('BASKETBALL AND HOOP'),
        },
        {
          code: '&#x1F3C1;',
          name: i18n('CHEQUERED FLAG'),
        },
        {
          code: '&#x1F3C2;',
          name: i18n('SNOWBOARDER'),
        },
        {
          code: '&#x1F3C3;',
          name: i18n('RUNNER'),
        },
        {
          code: '&#x1F3C4;',
          name: i18n('SURFER'),
        },
        {
          code: '&#x1F3C5;',
          name: i18n('SPORTS MEDAL'),
        },
        {
          code: '&#x1F3C6;',
          name: i18n('TROPHY'),
        },
        {
          code: '&#x1F3C7;',
          name: i18n('HORSE RACING'),
        },
        {
          code: '&#x1F3C8;',
          name: i18n('AMERICAN FOOTBALL'),
        },
        {
          code: '&#x1F3C9;',
          name: i18n('RUGBY FOOTBALL'),
        },
        {
          code: '&#x1F3CA;',
          name: i18n('SWIMMER'),
        },
        {
          code: '&#x1F3CB;',
          name: i18n('WEIGHT LIFTER'),
        },
        {
          code: '&#x1F3CC;',
          name: i18n('GOLFER'),
        },
        {
          code: '&#x1F3CD;',
          name: i18n('RACING MOTORCYCLE'),
        },
        {
          code: '&#x1F3CE;',
          name: i18n('RACING CAR'),
        },
        {
          code: '&#x1F3CF;',
          name: i18n('CRICKET BAT AND BALL'),
        },
        {
          code: '&#x1F3D0;',
          name: i18n('VOLLEYBALL'),
        },
        {
          code: '&#x1F3D1;',
          name: i18n('FIELD HOCKEY STICK AND BALL'),
        },
        {
          code: '&#x1F3D2;',
          name: i18n('ICE HOCKEY STICK AND PUCK'),
        },
        {
          code: '&#x1F3D3;',
          name: i18n('TABLE TENNIS PADDLE AND BALL'),
        },
        {
          code: '&#x1F3D4;',
          name: i18n('SNOW CAPPED MOUNTAIN'),
        },
        {
          code: '&#x1F3D5;',
          name: i18n('CAMPING'),
        },
        {
          code: '&#x1F3D6;',
          name: i18n('BEACH WITH UMBRELLA'),
        },
        {
          code: '&#x1F3D7;',
          name: i18n('BUILDING CONSTRUCTION'),
        },
        {
          code: '&#x1F3D8;',
          name: i18n('HOUSE BUILDINGS'),
        },
        {
          code: '&#x1F3D9;',
          name: i18n('CITYSCAPE'),
        },
        {
          code: '&#x1F3DA;',
          name: i18n('DERELICT HOUSE BUILDING'),
        },
        {
          code: '&#x1F3DB;',
          name: i18n('CLASSICAL BUILDING'),
        },
        {
          code: '&#x1F3DC;',
          name: i18n('DESERT'),
        },
        {
          code: '&#x1F3DD;',
          name: i18n('DESERT ISLAND'),
        },
        {
          code: '&#x1F3DE;',
          name: i18n('NATIONAL PARK'),
        },
        {
          code: '&#x1F3DF;',
          name: i18n('STADIUM'),
        },
        {
          code: '&#x1F3E0;',
          name: i18n('HOUSE BUILDING'),
        },
        {
          code: '&#x1F3E1;',
          name: i18n('HOUSE WITH GARDEN'),
        },
        {
          code: '&#x1F3E2;',
          name: i18n('OFFICE BUILDING'),
        },
        {
          code: '&#x1F3E3;',
          name: i18n('JAPANESE POST OFFICE'),
        },
        {
          code: '&#x1F3E4;',
          name: i18n('EUROPEAN POST OFFICE'),
        },
        {
          code: '&#x1F3E5;',
          name: i18n('HOSPITAL'),
        },
        {
          code: '&#x1F3E6;',
          name: i18n('BANK'),
        },
        {
          code: '&#x1F3E7;',
          name: i18n('AUTOMATED TELLER MACHINE'),
        },
        {
          code: '&#x1F3E8;',
          name: i18n('HOTEL'),
        },
        {
          code: '&#x1F3E9;',
          name: i18n('LOVE HOTEL'),
        },
        {
          code: '&#x1F3EA;',
          name: i18n('CONVENIENCE STORE'),
        },
        {
          code: '&#x1F3EB;',
          name: i18n('SCHOOL'),
        },
        {
          code: '&#x1F3EC;',
          name: i18n('DEPARTMENT STORE'),
        },
        {
          code: '&#x1F3ED;',
          name: i18n('FACTORY'),
        },
        {
          code: '&#x1F3EE;',
          name: i18n('IZAKAYA LANTERN'),
        },
        {
          code: '&#x1F3EF;',
          name: i18n('JAPANESE CASTLE'),
        },
        {
          code: '&#x1F3F0;',
          name: i18n('EUROPEAN CASTLE'),
        },
        {
          code: '&#x1F3F3;',
          name: i18n('WAVING WHITE FLAG'),
        },
        {
          code: '&#x1F3F4;',
          name: i18n('WAVING BLACK FLAG'),
        },
        {
          code: '&#x1F3F5;',
          name: i18n('ROSETTE'),
        },
        {
          code: '&#x1F3F7;',
          name: i18n('LABEL'),
        },
        {
          code: '&#x1F3F8;',
          name: i18n('BADMINTON RACQUET AND SHUTTLECOCK'),
        },
        {
          code: '&#x1F3F9;',
          name: i18n('BOW AND ARROW'),
        },
        {
          code: '&#x1F3FA;',
          name: i18n('AMPHORA'),
        },
        {
          code: '&#x1F3FB;',
          name: i18n('EMOJI MODIFIER FITZPATRICK TYPE-1-2'),
        },
        {
          code: '&#x1F3FC;',
          name: i18n('EMOJI MODIFIER FITZPATRICK TYPE-3'),
        },
        {
          code: '&#x1F3FD;',
          name: i18n('EMOJI MODIFIER FITZPATRICK TYPE-4'),
        },
        {
          code: '&#x1F3FE;',
          name: i18n('EMOJI MODIFIER FITZPATRICK TYPE-5'),
        },
        {
          code: '&#x1F3FF;',
          name: i18n('EMOJI MODIFIER FITZPATRICK TYPE-6'),
        },
        {
          code: '&#x1F400;',
          name: i18n('RAT'),
        },
        {
          code: '&#x1F401;',
          name: i18n('MOUSE'),
        },
        {
          code: '&#x1F402;',
          name: i18n('OX'),
        },
        {
          code: '&#x1F403;',
          name: i18n('WATER BUFFALO'),
        },
        {
          code: '&#x1F404;',
          name: i18n('COW'),
        },
        {
          code: '&#x1F405;',
          name: i18n('TIGER'),
        },
        {
          code: '&#x1F406;',
          name: i18n('LEOPARD'),
        },
        {
          code: '&#x1F407;',
          name: i18n('RABBIT'),
        },
        {
          code: '&#x1F408;',
          name: i18n('CAT'),
        },
        {
          code: '&#x1F409;',
          name: i18n('DRAGON'),
        },
        {
          code: '&#x1F40A;',
          name: i18n('CROCODILE'),
        },
        {
          code: '&#x1F40B;',
          name: i18n('WHALE'),
        },
        {
          code: '&#x1F40C;',
          name: i18n('SNAIL'),
        },
        {
          code: '&#x1F40D;',
          name: i18n('SNAKE'),
        },
        {
          code: '&#x1F40E;',
          name: i18n('HORSE'),
        },
        {
          code: '&#x1F40F;',
          name: i18n('RAM'),
        },
        {
          code: '&#x1F410;',
          name: i18n('GOAT'),
        },
        {
          code: '&#x1F411;',
          name: i18n('SHEEP'),
        },
        {
          code: '&#x1F412;',
          name: i18n('MONKEY'),
        },
        {
          code: '&#x1F413;',
          name: i18n('ROOSTER'),
        },
        {
          code: '&#x1F414;',
          name: i18n('CHICKEN'),
        },
        {
          code: '&#x1F415;',
          name: i18n('DOG'),
        },
        {
          code: '&#x1F416;',
          name: i18n('PIG'),
        },
        {
          code: '&#x1F417;',
          name: i18n('BOAR'),
        },
        {
          code: '&#x1F418;',
          name: i18n('ELEPHANT'),
        },
        {
          code: '&#x1F419;',
          name: i18n('OCTOPUS'),
        },
        {
          code: '&#x1F41A;',
          name: i18n('SPIRAL SHELL'),
        },
        {
          code: '&#x1F41B;',
          name: i18n('BUG'),
        },
        {
          code: '&#x1F41C;',
          name: i18n('ANT'),
        },
        {
          code: '&#x1F41D;',
          name: i18n('HONEYBEE'),
        },
        {
          code: '&#x1F41E;',
          name: i18n('LADY BEETLE'),
        },
        {
          code: '&#x1F41F;',
          name: i18n('FISH'),
        },
        {
          code: '&#x1F420;',
          name: i18n('TROPICAL FISH'),
        },
        {
          code: '&#x1F421;',
          name: i18n('BLOWFISH'),
        },
        {
          code: '&#x1F422;',
          name: i18n('TURTLE'),
        },
        {
          code: '&#x1F423;',
          name: i18n('HATCHING CHICK'),
        },
        {
          code: '&#x1F424;',
          name: i18n('BABY CHICK'),
        },
        {
          code: '&#x1F425;',
          name: i18n('FRONT-FACING BABY CHICK'),
        },
        {
          code: '&#x1F426;',
          name: i18n('BIRD'),
        },
        {
          code: '&#x1F427;',
          name: i18n('PENGUIN'),
        },
        {
          code: '&#x1F428;',
          name: i18n('KOALA'),
        },
        {
          code: '&#x1F429;',
          name: i18n('POODLE'),
        },
        {
          code: '&#x1F42A;',
          name: i18n('DROMEDARY CAMEL'),
        },
        {
          code: '&#x1F42B;',
          name: i18n('BACTRIAN CAMEL'),
        },
        {
          code: '&#x1F42C;',
          name: i18n('DOLPHIN'),
        },
        {
          code: '&#x1F42D;',
          name: i18n('MOUSE FACE'),
        },
        {
          code: '&#x1F42E;',
          name: i18n('COW FACE'),
        },
        {
          code: '&#x1F42F;',
          name: i18n('TIGER FACE'),
        },
        {
          code: '&#x1F430;',
          name: i18n('RABBIT FACE'),
        },
        {
          code: '&#x1F431;',
          name: i18n('CAT FACE'),
        },
        {
          code: '&#x1F432;',
          name: i18n('DRAGON FACE'),
        },
        {
          code: '&#x1F433;',
          name: i18n('SPOUTING WHALE'),
        },
        {
          code: '&#x1F434;',
          name: i18n('HORSE FACE'),
        },
        {
          code: '&#x1F435;',
          name: i18n('MONKEY FACE'),
        },
        {
          code: '&#x1F436;',
          name: i18n('DOG FACE'),
        },
        {
          code: '&#x1F437;',
          name: i18n('PIG FACE'),
        },
        {
          code: '&#x1F438;',
          name: i18n('FROG FACE'),
        },
        {
          code: '&#x1F439;',
          name: i18n('HAMSTER FACE'),
        },
        {
          code: '&#x1F43A;',
          name: i18n('WOLF FACE'),
        },
        {
          code: '&#x1F43B;',
          name: i18n('BEAR FACE'),
        },
        {
          code: '&#x1F43C;',
          name: i18n('PANDA FACE'),
        },
        {
          code: '&#x1F43D;',
          name: i18n('PIG NOSE'),
        },
        {
          code: '&#x1F43E;',
          name: i18n('PAW PRINTS'),
        },
        {
          code: '&#x1F43F;',
          name: i18n('CHIPMUNK'),
        },
        {
          code: '&#x1F440;',
          name: i18n('EYES'),
        },
        {
          code: '&#x1F441;',
          name: i18n('EYE'),
        },
        {
          code: '&#x1F442;',
          name: i18n('EAR'),
        },
        {
          code: '&#x1F443;',
          name: i18n('NOSE'),
        },
        {
          code: '&#x1F444;',
          name: i18n('MOUTH'),
        },
        {
          code: '&#x1F445;',
          name: i18n('TONGUE'),
        },
        {
          code: '&#x1F446;',
          name: i18n('WHITE UP POINTING BACKHAND INDEX'),
        },
        {
          code: '&#x1F447;',
          name: i18n('WHITE DOWN POINTING BACKHAND INDEX'),
        },
        {
          code: '&#x1F448;',
          name: i18n('WHITE LEFT POINTING BACKHAND INDEX'),
        },
        {
          code: '&#x1F449;',
          name: i18n('WHITE RIGHT POINTING BACKHAND INDEX'),
        },
        {
          code: '&#x1F44A;',
          name: i18n('FISTED HAND SIGN'),
        },
        {
          code: '&#x1F44B;',
          name: i18n('WAVING HAND SIGN'),
        },
        {
          code: '&#x1F44C;',
          name: i18n('OK HAND SIGN'),
        },
        {
          code: '&#x1F44D;',
          name: i18n('THUMBS UP SIGN'),
        },
        {
          code: '&#x1F44E;',
          name: i18n('THUMBS DOWN SIGN'),
        },
        {
          code: '&#x1F44F;',
          name: i18n('CLAPPING HANDS SIGN'),
        },
        {
          code: '&#x1F450;',
          name: i18n('OPEN HANDS SIGN'),
        },
        {
          code: '&#x1F451;',
          name: i18n('CROWN'),
        },
        {
          code: '&#x1F452;',
          name: i18n('WOMANS HAT'),
        },
        {
          code: '&#x1F453;',
          name: i18n('EYEGLASSES'),
        },
        {
          code: '&#x1F454;',
          name: i18n('NECKTIE'),
        },
        {
          code: '&#x1F455;',
          name: i18n('T-SHIRT'),
        },
        {
          code: '&#x1F456;',
          name: i18n('JEANS'),
        },
        {
          code: '&#x1F457;',
          name: i18n('DRESS'),
        },
        {
          code: '&#x1F458;',
          name: i18n('KIMONO'),
        },
        {
          code: '&#x1F459;',
          name: i18n('BIKINI'),
        },
        {
          code: '&#x1F45A;',
          name: i18n('WOMANS CLOTHES'),
        },
        {
          code: '&#x1F45B;',
          name: i18n('PURSE'),
        },
        {
          code: '&#x1F45C;',
          name: i18n('HANDBAG'),
        },
        {
          code: '&#x1F45D;',
          name: i18n('POUCH'),
        },
        {
          code: '&#x1F45E;',
          name: i18n('MANS SHOE'),
        },
        {
          code: '&#x1F45F;',
          name: i18n('ATHLETIC SHOE'),
        },
        {
          code: '&#x1F460;',
          name: i18n('HIGH-HEELED SHOE'),
        },
        {
          code: '&#x1F461;',
          name: i18n('WOMANS SANDAL'),
        },
        {
          code: '&#x1F462;',
          name: i18n('WOMANS BOOTS'),
        },
        {
          code: '&#x1F463;',
          name: i18n('FOOTPRINTS'),
        },
        {
          code: '&#x1F464;',
          name: i18n('BUST IN SILHOUETTE'),
        },
        {
          code: '&#x1F465;',
          name: i18n('BUSTS IN SILHOUETTE'),
        },
        {
          code: '&#x1F466;',
          name: i18n('BOY'),
        },
        {
          code: '&#x1F467;',
          name: i18n('GIRL'),
        },
        {
          code: '&#x1F468;',
          name: i18n('MAN'),
        },
        {
          code: '&#x1F469;',
          name: i18n('WOMAN'),
        },
        {
          code: '&#x1F46A;',
          name: i18n('FAMILY'),
        },
        {
          code: '&#x1F46B;',
          name: i18n('MAN AND WOMAN HOLDING HANDS'),
        },
        {
          code: '&#x1F46C;',
          name: i18n('TWO MEN HOLDING HANDS'),
        },
        {
          code: '&#x1F46D;',
          name: i18n('TWO WOMEN HOLDING HANDS'),
        },
        {
          code: '&#x1F46E;',
          name: i18n('POLICE OFFICER'),
        },
        {
          code: '&#x1F46F;',
          name: i18n('WOMAN WITH BUNNY EARS'),
        },
        {
          code: '&#x1F470;',
          name: i18n('BRIDE WITH VEIL'),
        },
        {
          code: '&#x1F471;',
          name: i18n('PERSON WITH BLOND HAIR'),
        },
        {
          code: '&#x1F472;',
          name: i18n('MAN WITH GUA PI MAO'),
        },
        {
          code: '&#x1F473;',
          name: i18n('MAN WITH TURBAN'),
        },
        {
          code: '&#x1F474;',
          name: i18n('OLDER MAN'),
        },
        {
          code: '&#x1F475;',
          name: i18n('OLDER WOMAN'),
        },
        {
          code: '&#x1F476;',
          name: i18n('BABY'),
        },
        {
          code: '&#x1F477;',
          name: i18n('CONSTRUCTION WORKER'),
        },
        {
          code: '&#x1F478;',
          name: i18n('PRINCESS'),
        },
        {
          code: '&#x1F479;',
          name: i18n('JAPANESE OGRE'),
        },
        {
          code: '&#x1F47A;',
          name: i18n('JAPANESE GOBLIN'),
        },
        {
          code: '&#x1F47B;',
          name: i18n('GHOST'),
        },
        {
          code: '&#x1F47C;',
          name: i18n('BABY ANGEL'),
        },
        {
          code: '&#x1F47D;',
          name: i18n('EXTRATERRESTRIAL ALIEN'),
        },
        {
          code: '&#x1F47E;',
          name: i18n('ALIEN MONSTER'),
        },
        {
          code: '&#x1F47F;',
          name: i18n('IMP'),
        },
        {
          code: '&#x1F480;',
          name: i18n('SKULL'),
        },
        {
          code: '&#x1F481;',
          name: i18n('INFORMATION DESK PERSON'),
        },
        {
          code: '&#x1F482;',
          name: i18n('GUARDSMAN'),
        },
        {
          code: '&#x1F483;',
          name: i18n('DANCER'),
        },
        {
          code: '&#x1F484;',
          name: i18n('LIPSTICK'),
        },
        {
          code: '&#x1F485;',
          name: i18n('NAIL POLISH'),
        },
        {
          code: '&#x1F486;',
          name: i18n('FACE MASSAGE'),
        },
        {
          code: '&#x1F487;',
          name: i18n('HAIRCUT'),
        },
        {
          code: '&#x1F488;',
          name: i18n('BARBER POLE'),
        },
        {
          code: '&#x1F489;',
          name: i18n('SYRINGE'),
        },
        {
          code: '&#x1F48A;',
          name: i18n('PILL'),
        },
        {
          code: '&#x1F48B;',
          name: i18n('KISS MARK'),
        },
        {
          code: '&#x1F48C;',
          name: i18n('LOVE LETTER'),
        },
        {
          code: '&#x1F48D;',
          name: i18n('RING'),
        },
        {
          code: '&#x1F48E;',
          name: i18n('GEM STONE'),
        },
        {
          code: '&#x1F48F;',
          name: i18n('KISS'),
        },
        {
          code: '&#x1F490;',
          name: i18n('BOUQUET'),
        },
        {
          code: '&#x1F491;',
          name: i18n('COUPLE WITH HEART'),
        },
        {
          code: '&#x1F492;',
          name: i18n('WEDDING'),
        },
        {
          code: '&#x1F493;',
          name: i18n('BEATING HEART'),
        },
        {
          code: '&#x1F494;',
          name: i18n('BROKEN HEART'),
        },
        {
          code: '&#x1F495;',
          name: i18n('TWO HEARTS'),
        },
        {
          code: '&#x1F496;',
          name: i18n('SPARKLING HEART'),
        },
        {
          code: '&#x1F497;',
          name: i18n('GROWING HEART'),
        },
        {
          code: '&#x1F498;',
          name: i18n('HEART WITH ARROW'),
        },
        {
          code: '&#x1F499;',
          name: i18n('BLUE HEART'),
        },
        {
          code: '&#x1F49A;',
          name: i18n('GREEN HEART'),
        },
        {
          code: '&#x1F49B;',
          name: i18n('YELLOW HEART'),
        },
        {
          code: '&#x1F49C;',
          name: i18n('PURPLE HEART'),
        },
        {
          code: '&#x1F49D;',
          name: i18n('HEART WITH RIBBON'),
        },
        {
          code: '&#x1F49E;',
          name: i18n('REVOLVING HEARTS'),
        },
        {
          code: '&#x1F49F;',
          name: i18n('HEART DECORATION'),
        },
        {
          code: '&#x1F4A0;',
          name: i18n('DIAMOND SHAPE WITH A DOT INSIDE'),
        },
        {
          code: '&#x1F4A1;',
          name: i18n('ELECTRIC LIGHT BULB'),
        },
        {
          code: '&#x1F4A2;',
          name: i18n('ANGER SYMBOL'),
        },
        {
          code: '&#x1F4A3;',
          name: i18n('BOMB'),
        },
        {
          code: '&#x1F4A4;',
          name: i18n('SLEEPING SYMBOL'),
        },
        {
          code: '&#x1F4A5;',
          name: i18n('COLLISION SYMBOL'),
        },
        {
          code: '&#x1F4A6;',
          name: i18n('SPLASHING SWEAT SYMBOL'),
        },
        {
          code: '&#x1F4A7;',
          name: i18n('DROPLET'),
        },
        {
          code: '&#x1F4A8;',
          name: i18n('DASH SYMBOL'),
        },
        {
          code: '&#x1F4A9;',
          name: i18n('PILE OF POO'),
        },
        {
          code: '&#x1F4AA;',
          name: i18n('FLEXED BICEPS'),
        },
        {
          code: '&#x1F4AB;',
          name: i18n('DIZZY SYMBOL'),
        },
        {
          code: '&#x1F4AC;',
          name: i18n('SPEECH BALLOON'),
        },
        {
          code: '&#x1F4AD;',
          name: i18n('THOUGHT BALLOON'),
        },
        {
          code: '&#x1F4AE;',
          name: i18n('WHITE FLOWER'),
        },
        {
          code: '&#x1F4AF;',
          name: i18n('HUNDRED POINTS SYMBOL'),
        },
        {
          code: '&#x1F4B0;',
          name: i18n('MONEY BAG'),
        },
        {
          code: '&#x1F4B1;',
          name: i18n('CURRENCY EXCHANGE'),
        },
        {
          code: '&#x1F4B2;',
          name: i18n('HEAVY DOLLAR SIGN'),
        },
        {
          code: '&#x1F4B3;',
          name: i18n('CREDIT CARD'),
        },
        {
          code: '&#x1F4B4;',
          name: i18n('BANKNOTE WITH YEN SIGN'),
        },
        {
          code: '&#x1F4B5;',
          name: i18n('BANKNOTE WITH DOLLAR SIGN'),
        },
        {
          code: '&#x1F4B6;',
          name: i18n('BANKNOTE WITH EURO SIGN'),
        },
        {
          code: '&#x1F4B7;',
          name: i18n('BANKNOTE WITH POUND SIGN'),
        },
        {
          code: '&#x1F4B8;',
          name: i18n('MONEY WITH WINGS'),
        },
        {
          code: '&#x1F4B9;',
          name: i18n('CHART WITH UPWARDS TREND AND YEN SIGN'),
        },
        {
          code: '&#x1F4BA;',
          name: i18n('SEAT'),
        },
        {
          code: '&#x1F4BB;',
          name: i18n('PERSONAL COMPUTER'),
        },
        {
          code: '&#x1F4BC;',
          name: i18n('BRIEFCASE'),
        },
        {
          code: '&#x1F4BD;',
          name: i18n('MINIDISC'),
        },
        {
          code: '&#x1F4BE;',
          name: i18n('FLOPPY DISK'),
        },
        {
          code: '&#x1F4BF;',
          name: i18n('OPTICAL DISC'),
        },
        {
          code: '&#x1F4C0;',
          name: i18n('DVD'),
        },
        {
          code: '&#x1F4C1;',
          name: i18n('FILE FOLDER'),
        },
        {
          code: '&#x1F4C2;',
          name: i18n('OPEN FILE FOLDER'),
        },
        {
          code: '&#x1F4C3;',
          name: i18n('PAGE WITH CURL'),
        },
        {
          code: '&#x1F4C4;',
          name: i18n('PAGE FACING UP'),
        },
        {
          code: '&#x1F4C5;',
          name: i18n('CALENDAR'),
        },
        {
          code: '&#x1F4C6;',
          name: i18n('TEAR-OFF CALENDAR'),
        },
        {
          code: '&#x1F4C7;',
          name: i18n('CARD INDEX'),
        },
        {
          code: '&#x1F4C8;',
          name: i18n('CHART WITH UPWARDS TREND'),
        },
        {
          code: '&#x1F4C9;',
          name: i18n('CHART WITH DOWNWARDS TREND'),
        },
        {
          code: '&#x1F4CA;',
          name: i18n('BAR CHART'),
        },
        {
          code: '&#x1F4CB;',
          name: i18n('CLIPBOARD'),
        },
        {
          code: '&#x1F4CC;',
          name: i18n('PUSHPIN'),
        },
        {
          code: '&#x1F4CD;',
          name: i18n('ROUND PUSHPIN'),
        },
        {
          code: '&#x1F4CE;',
          name: i18n('PAPERCLIP'),
        },
        {
          code: '&#x1F4CF;',
          name: i18n('STRAIGHT RULER'),
        },
        {
          code: '&#x1F4D0;',
          name: i18n('TRIANGULAR RULER'),
        },
        {
          code: '&#x1F4D1;',
          name: i18n('BOOKMARK TABS'),
        },
        {
          code: '&#x1F4D2;',
          name: i18n('LEDGER'),
        },
        {
          code: '&#x1F4D3;',
          name: i18n('NOTEBOOK'),
        },
        {
          code: '&#x1F4D4;',
          name: i18n('NOTEBOOK WITH DECORATIVE COVER'),
        },
        {
          code: '&#x1F4D5;',
          name: i18n('CLOSED BOOK'),
        },
        {
          code: '&#x1F4D6;',
          name: i18n('OPEN BOOK'),
        },
        {
          code: '&#x1F4D7;',
          name: i18n('GREEN BOOK'),
        },
        {
          code: '&#x1F4D8;',
          name: i18n('BLUE BOOK'),
        },
        {
          code: '&#x1F4D9;',
          name: i18n('ORANGE BOOK'),
        },
        {
          code: '&#x1F4DA;',
          name: i18n('BOOKS'),
        },
        {
          code: '&#x1F4DB;',
          name: i18n('NAME BADGE'),
        },
        {
          code: '&#x1F4DC;',
          name: i18n('SCROLL'),
        },
        {
          code: '&#x1F4DD;',
          name: i18n('MEMO'),
        },
        {
          code: '&#x1F4DE;',
          name: i18n('TELEPHONE RECEIVER'),
        },
        {
          code: '&#x1F4DF;',
          name: i18n('PAGER'),
        },
        {
          code: '&#x1F4E0;',
          name: i18n('FAX MACHINE'),
        },
        {
          code: '&#x1F4E1;',
          name: i18n('SATELLITE ANTENNA'),
        },
        {
          code: '&#x1F4E2;',
          name: i18n('PUBLIC ADDRESS LOUDSPEAKER'),
        },
        {
          code: '&#x1F4E3;',
          name: i18n('CHEERING MEGAPHONE'),
        },
        {
          code: '&#x1F4E4;',
          name: i18n('OUTBOX TRAY'),
        },
        {
          code: '&#x1F4E5;',
          name: i18n('INBOX TRAY'),
        },
        {
          code: '&#x1F4E6;',
          name: i18n('PACKAGE'),
        },
        {
          code: '&#x1F4E7;',
          name: i18n('E-MAIL SYMBOL'),
        },
        {
          code: '&#x1F4E8;',
          name: i18n('INCOMING ENVELOPE'),
        },
        {
          code: '&#x1F4E9;',
          name: i18n('ENVELOPE WITH DOWNWARDS ARROW ABOVE'),
        },
        {
          code: '&#x1F4EA;',
          name: i18n('CLOSED MAILBOX WITH LOWERED FLAG'),
        },
        {
          code: '&#x1F4EB;',
          name: i18n('CLOSED MAILBOX WITH RAISED FLAG'),
        },
        {
          code: '&#x1F4EC;',
          name: i18n('OPEN MAILBOX WITH RAISED FLAG'),
        },
        {
          code: '&#x1F4ED;',
          name: i18n('OPEN MAILBOX WITH LOWERED FLAG'),
        },
        {
          code: '&#x1F4EE;',
          name: i18n('POSTBOX'),
        },
        {
          code: '&#x1F4EF;',
          name: i18n('POSTAL HORN'),
        },
        {
          code: '&#x1F4F0;',
          name: i18n('NEWSPAPER'),
        },
        {
          code: '&#x1F4F1;',
          name: i18n('MOBILE PHONE'),
        },
        {
          code: '&#x1F4F2;',
          name: i18n('MOBILE PHONE WITH RIGHTWARDS ARROW AT LEFT'),
        },
        {
          code: '&#x1F4F3;',
          name: i18n('VIBRATION MODE'),
        },
        {
          code: '&#x1F4F4;',
          name: i18n('MOBILE PHONE OFF'),
        },
        {
          code: '&#x1F4F5;',
          name: i18n('NO MOBILE PHONES'),
        },
        {
          code: '&#x1F4F6;',
          name: i18n('ANTENNA WITH BARS'),
        },
        {
          code: '&#x1F4F7;',
          name: i18n('CAMERA'),
        },
        {
          code: '&#x1F4F8;',
          name: i18n('CAMERA WITH FLASH'),
        },
        {
          code: '&#x1F4F9;',
          name: i18n('VIDEO CAMERA'),
        },
        {
          code: '&#x1F4FA;',
          name: i18n('TELEVISION'),
        },
        {
          code: '&#x1F4FB;',
          name: i18n('RADIO'),
        },
        {
          code: '&#x1F4FC;',
          name: i18n('VIDEOCASSETTE'),
        },
        {
          code: '&#x1F4FD;',
          name: i18n('FILM PROJECTOR'),
        },
        {
          code: '&#x1F4FF;',
          name: i18n('PRAYER BEADS'),
        },
        {
          code: '&#x1F500;',
          name: i18n('TWISTED RIGHTWARDS ARROWS'),
        },
        {
          code: '&#x1F501;',
          name: i18n('CLOCKWISE RIGHTWARDS AND LEFTWARDS OPEN CIRCLE ARROWS'),
        },
        {
          code: '&#x1F502;',
          name: i18n('CLOCKWISE RIGHTWARDS AND LEFTWARDS OPEN CIRCLE ARROWS WITH CIRCLED ONE OVERLAY'),
        },
        {
          code: '&#x1F503;',
          name: i18n('CLOCKWISE DOWNWARDS AND UPWARDS OPEN CIRCLE ARROWS'),
        },
        {
          code: '&#x1F504;',
          name: i18n('ANTICLOCKWISE DOWNWARDS AND UPWARDS OPEN CIRCLE ARROWS'),
        },
        {
          code: '&#x1F505;',
          name: i18n('LOW BRIGHTNESS SYMBOL'),
        },
        {
          code: '&#x1F506;',
          name: i18n('HIGH BRIGHTNESS SYMBOL'),
        },
        {
          code: '&#x1F507;',
          name: i18n('SPEAKER WITH CANCELLATION STROKE'),
        },
        {
          code: '&#x1F508;',
          name: i18n('SPEAKER'),
        },
        {
          code: '&#x1F509;',
          name: i18n('SPEAKER WITH ONE SOUND WAVE'),
        },
        {
          code: '&#x1F50A;',
          name: i18n('SPEAKER WITH THREE SOUND WAVES'),
        },
        {
          code: '&#x1F50B;',
          name: i18n('BATTERY'),
        },
        {
          code: '&#x1F50C;',
          name: i18n('ELECTRIC PLUG'),
        },
        {
          code: '&#x1F50D;',
          name: i18n('LEFT-POINTING MAGNIFYING GLASS'),
        },
        {
          code: '&#x1F50E;',
          name: i18n('RIGHT-POINTING MAGNIFYING GLASS'),
        },
        {
          code: '&#x1F50F;',
          name: i18n('LOCK WITH INK PEN'),
        },
        {
          code: '&#x1F510;',
          name: i18n('CLOSED LOCK WITH KEY'),
        },
        {
          code: '&#x1F511;',
          name: i18n('KEY'),
        },
        {
          code: '&#x1F512;',
          name: i18n('LOCK'),
        },
        {
          code: '&#x1F513;',
          name: i18n('OPEN LOCK'),
        },
        {
          code: '&#x1F514;',
          name: i18n('BELL'),
        },
        {
          code: '&#x1F515;',
          name: i18n('BELL WITH CANCELLATION STROKE'),
        },
        {
          code: '&#x1F516;',
          name: i18n('BOOKMARK'),
        },
        {
          code: '&#x1F517;',
          name: i18n('LINK SYMBOL'),
        },
        {
          code: '&#x1F518;',
          name: i18n('RADIO BUTTON'),
        },
        {
          code: '&#x1F519;',
          name: i18n('BACK WITH LEFTWARDS ARROW ABOVE'),
        },
        {
          code: '&#x1F51A;',
          name: i18n('END WITH LEFTWARDS ARROW ABOVE'),
        },
        {
          code: '&#x1F51B;',
          name: i18n('ON WITH EXCLAMATION MARK WITH LEFT RIGHT ARROW ABOVE'),
        },
        {
          code: '&#x1F51C;',
          name: i18n('SOON WITH RIGHTWARDS ARROW ABOVE'),
        },
        {
          code: '&#x1F51D;',
          name: i18n('TOP WITH UPWARDS ARROW ABOVE'),
        },
        {
          code: '&#x1F51E;',
          name: i18n('NO ONE UNDER EIGHTEEN SYMBOL'),
        },
        {
          code: '&#x1F51F;',
          name: i18n('KEYCAP TEN'),
        },
        {
          code: '&#x1F520;',
          name: i18n('INPUT SYMBOL FOR LATIN CAPITAL LETTERS'),
        },
        {
          code: '&#x1F521;',
          name: i18n('INPUT SYMBOL FOR LATIN SMALL LETTERS'),
        },
        {
          code: '&#x1F522;',
          name: i18n('INPUT SYMBOL FOR NUMBERS'),
        },
        {
          code: '&#x1F523;',
          name: i18n('INPUT SYMBOL FOR SYMBOLS'),
        },
        {
          code: '&#x1F524;',
          name: i18n('INPUT SYMBOL FOR LATIN LETTERS'),
        },
        {
          code: '&#x1F525;',
          name: i18n('FIRE'),
        },
        {
          code: '&#x1F526;',
          name: i18n('ELECTRIC TORCH'),
        },
        {
          code: '&#x1F527;',
          name: i18n('WRENCH'),
        },
        {
          code: '&#x1F528;',
          name: i18n('HAMMER'),
        },
        {
          code: '&#x1F529;',
          name: i18n('NUT AND BOLT'),
        },
        {
          code: '&#x1F52A;',
          name: i18n('HOCHO'),
        },
        {
          code: '&#x1F52B;',
          name: i18n('PISTOL'),
        },
        {
          code: '&#x1F52C;',
          name: i18n('MICROSCOPE'),
        },
        {
          code: '&#x1F52D;',
          name: i18n('TELESCOPE'),
        },
        {
          code: '&#x1F52E;',
          name: i18n('CRYSTAL BALL'),
        },
        {
          code: '&#x1F52F;',
          name: i18n('SIX POINTED STAR WITH MIDDLE DOT'),
        },
        {
          code: '&#x1F530;',
          name: i18n('JAPANESE SYMBOL FOR BEGINNER'),
        },
        {
          code: '&#x1F531;',
          name: i18n('TRIDENT EMBLEM'),
        },
        {
          code: '&#x1F532;',
          name: i18n('BLACK SQUARE BUTTON'),
        },
        {
          code: '&#x1F533;',
          name: i18n('WHITE SQUARE BUTTON'),
        },
        {
          code: '&#x1F534;',
          name: i18n('LARGE RED CIRCLE'),
        },
        {
          code: '&#x1F535;',
          name: i18n('LARGE BLUE CIRCLE'),
        },
        {
          code: '&#x1F536;',
          name: i18n('LARGE ORANGE DIAMOND'),
        },
        {
          code: '&#x1F537;',
          name: i18n('LARGE BLUE DIAMOND'),
        },
        {
          code: '&#x1F538;',
          name: i18n('SMALL ORANGE DIAMOND'),
        },
        {
          code: '&#x1F539;',
          name: i18n('SMALL BLUE DIAMOND'),
        },
        {
          code: '&#x1F53A;',
          name: i18n('UP-POINTING RED TRIANGLE'),
        },
        {
          code: '&#x1F53B;',
          name: i18n('DOWN-POINTING RED TRIANGLE'),
        },
        {
          code: '&#x1F53C;',
          name: i18n('UP-POINTING SMALL RED TRIANGLE'),
        },
        {
          code: '&#x1F53D;',
          name: i18n('DOWN-POINTING SMALL RED TRIANGLE'),
        },
        {
          code: '&#x1F549;',
          name: i18n('OM SYMBOL'),
        },
        {
          code: '&#x1F54A;',
          name: i18n('DOVE OF PEACE'),
        },
        {
          code: '&#x1F54B;',
          name: i18n('KAABA'),
        },
        {
          code: '&#x1F54C;',
          name: i18n('MOSQUE'),
        },
        {
          code: '&#x1F54D;',
          name: i18n('SYNAGOGUE'),
        },
        {
          code: '&#x1F54E;',
          name: i18n('MENORAH WITH NINE BRANCHES'),
        },
        {
          code: '&#x1F550;',
          name: i18n('CLOCK FACE ONE OCLOCK'),
        },
        {
          code: '&#x1F551;',
          name: i18n('CLOCK FACE TWO OCLOCK'),
        },
        {
          code: '&#x1F552;',
          name: i18n('CLOCK FACE THREE OCLOCK'),
        },
        {
          code: '&#x1F553;',
          name: i18n('CLOCK FACE FOUR OCLOCK'),
        },
        {
          code: '&#x1F554;',
          name: i18n('CLOCK FACE FIVE OCLOCK'),
        },
        {
          code: '&#x1F555;',
          name: i18n('CLOCK FACE SIX OCLOCK'),
        },
        {
          code: '&#x1F556;',
          name: i18n('CLOCK FACE SEVEN OCLOCK'),
        },
        {
          code: '&#x1F557;',
          name: i18n('CLOCK FACE EIGHT OCLOCK'),
        },
        {
          code: '&#x1F558;',
          name: i18n('CLOCK FACE NINE OCLOCK'),
        },
        {
          code: '&#x1F559;',
          name: i18n('CLOCK FACE TEN OCLOCK'),
        },
        {
          code: '&#x1F55A;',
          name: i18n('CLOCK FACE ELEVEN OCLOCK'),
        },
        {
          code: '&#x1F55B;',
          name: i18n('CLOCK FACE TWELVE OCLOCK'),
        },
        {
          code: '&#x1F55C;',
          name: i18n('CLOCK FACE ONE-THIRTY'),
        },
        {
          code: '&#x1F55D;',
          name: i18n('CLOCK FACE TWO-THIRTY'),
        },
        {
          code: '&#x1F55E;',
          name: i18n('CLOCK FACE THREE-THIRTY'),
        },
        {
          code: '&#x1F55F;',
          name: i18n('CLOCK FACE FOUR-THIRTY'),
        },
        {
          code: '&#x1F560;',
          name: i18n('CLOCK FACE FIVE-THIRTY'),
        },
        {
          code: '&#x1F561;',
          name: i18n('CLOCK FACE SIX-THIRTY'),
        },
        {
          code: '&#x1F562;',
          name: i18n('CLOCK FACE SEVEN-THIRTY'),
        },
        {
          code: '&#x1F563;',
          name: i18n('CLOCK FACE EIGHT-THIRTY'),
        },
        {
          code: '&#x1F564;',
          name: i18n('CLOCK FACE NINE-THIRTY'),
        },
        {
          code: '&#x1F565;',
          name: i18n('CLOCK FACE TEN-THIRTY'),
        },
        {
          code: '&#x1F566;',
          name: i18n('CLOCK FACE ELEVEN-THIRTY'),
        },
        {
          code: '&#x1F567;',
          name: i18n('CLOCK FACE TWELVE-THIRTY'),
        },
        {
          code: '&#x1F56F;',
          name: i18n('CANDLE'),
        },
        {
          code: '&#x1F570;',
          name: i18n('MANTELPIECE CLOCK'),
        },
        {
          code: '&#x1F573;',
          name: i18n('HOLE'),
        },
        {
          code: '&#x1F574;',
          name: i18n('MAN IN BUSINESS SUIT LEVITATING'),
        },
        {
          code: '&#x1F575;',
          name: i18n('SLEUTH OR SPY'),
        },
        {
          code: '&#x1F576;',
          name: i18n('DARK SUNGLASSES'),
        },
        {
          code: '&#x1F577;',
          name: i18n('SPIDER'),
        },
        {
          code: '&#x1F578;',
          name: i18n('SPIDER WEB'),
        },
        {
          code: '&#x1F579;',
          name: i18n('JOYSTICK'),
        },
        {
          code: '&#x1F587;',
          name: i18n('LINKED PAPERCLIPS'),
        },
        {
          code: '&#x1F58A;',
          name: i18n('LOWER LEFT BALLPOINT PEN'),
        },
        {
          code: '&#x1F58B;',
          name: i18n('LOWER LEFT FOUNTAIN PEN'),
        },
        {
          code: '&#x1F58C;',
          name: i18n('LOWER LEFT PAINTBRUSH'),
        },
        {
          code: '&#x1F58D;',
          name: i18n('LOWER LEFT CRAYON'),
        },
        {
          code: '&#x1F590;',
          name: i18n('RAISED HAND WITH FINGERS SPLAYED'),
        },
        {
          code: '&#x1F595;',
          name: i18n('REVERSED HAND WITH MIDDLE FINGER EXTENDED'),
        },
        {
          code: '&#x1F596;',
          name: i18n('RAISED HAND WITH PART BETWEEN MIDDLE AND RING FINGERS'),
        },
        {
          code: '&#x1F5A5;',
          name: i18n('DESKTOP COMPUTER'),
        },
        {
          code: '&#x1F5A8;',
          name: i18n('PRINTER'),
        },
        {
          code: '&#x1F5B1;',
          name: i18n('THREE BUTTON MOUSE'),
        },
        {
          code: '&#x1F5B2;',
          name: i18n('TRACKBALL'),
        },
        {
          code: '&#x1F5BC;',
          name: i18n('FRAME WITH PICTURE'),
        },
        {
          code: '&#x1F5C2;',
          name: i18n('CARD INDEX DIVIDERS'),
        },
        {
          code: '&#x1F5C3;',
          name: i18n('CARD FILE BOX'),
        },
        {
          code: '&#x1F5C4;',
          name: i18n('FILE CABINET'),
        },
        {
          code: '&#x1F5D1;',
          name: i18n('WASTEBASKET'),
        },
        {
          code: '&#x1F5D2;',
          name: i18n('SPIRAL NOTE PAD'),
        },
        {
          code: '&#x1F5D3;',
          name: i18n('SPIRAL CALENDAR PAD'),
        },
        {
          code: '&#x1F5DC;',
          name: i18n('COMPRESSION'),
        },
        {
          code: '&#x1F5DD;',
          name: i18n('OLD KEY'),
        },
        {
          code: '&#x1F5DE;',
          name: i18n('ROLLED-UP NEWSPAPER'),
        },
        {
          code: '&#x1F5E1;',
          name: i18n('DAGGER KNIFE'),
        },
        {
          code: '&#x1F5E3;',
          name: i18n('SPEAKING HEAD IN SILHOUETTE'),
        },
        {
          code: '&#x1F5E8;',
          name: i18n('LEFT SPEECH BUBBLE'),
        },
        {
          code: '&#x1F5EF;',
          name: i18n('RIGHT ANGER BUBBLE'),
        },
        {
          code: '&#x1F5F3;',
          name: i18n('BALLOT BOX WITH BALLOT'),
        },
        {
          code: '&#x1F5FA;',
          name: i18n('WORLD MAP'),
        },
        {
          code: '&#x1F5FB;',
          name: i18n('MOUNT FUJI'),
        },
        {
          code: '&#x1F5FC;',
          name: i18n('TOKYO TOWER'),
        },
        {
          code: '&#x1F5FD;',
          name: i18n('STATUE OF LIBERTY'),
        },
        {
          code: '&#x1F5FE;',
          name: i18n('SILHOUETTE OF JAPAN'),
        },
        {
          code: '&#x1F5FF;',
          name: i18n('MOYAI'),
        },
        {
          code: '&#x1F680;',
          name: i18n('ROCKET'),
        },
        {
          code: '&#x1F681;',
          name: i18n('HELICOPTER'),
        },
        {
          code: '&#x1F682;',
          name: i18n('STEAM LOCOMOTIVE'),
        },
        {
          code: '&#x1F683;',
          name: i18n('RAILWAY CAR'),
        },
        {
          code: '&#x1F684;',
          name: i18n('HIGH-SPEED TRAIN'),
        },
        {
          code: '&#x1F685;',
          name: i18n('HIGH-SPEED TRAIN WITH BULLET NOSE'),
        },
        {
          code: '&#x1F686;',
          name: i18n('TRAIN'),
        },
        {
          code: '&#x1F687;',
          name: i18n('METRO'),
        },
        {
          code: '&#x1F688;',
          name: i18n('LIGHT RAIL'),
        },
        {
          code: '&#x1F689;',
          name: i18n('STATION'),
        },
        {
          code: '&#x1F68A;',
          name: i18n('TRAM'),
        },
        {
          code: '&#x1F68B;',
          name: i18n('TRAM CAR'),
        },
        {
          code: '&#x1F68C;',
          name: i18n('BUS'),
        },
        {
          code: '&#x1F68D;',
          name: i18n('ONCOMING BUS'),
        },
        {
          code: '&#x1F68E;',
          name: i18n('TROLLEYBUS'),
        },
        {
          code: '&#x1F68F;',
          name: i18n('BUS STOP'),
        },
        {
          code: '&#x1F690;',
          name: i18n('MINIBUS'),
        },
        {
          code: '&#x1F691;',
          name: i18n('AMBULANCE'),
        },
        {
          code: '&#x1F692;',
          name: i18n('FIRE ENGINE'),
        },
        {
          code: '&#x1F693;',
          name: i18n('POLICE CAR'),
        },
        {
          code: '&#x1F694;',
          name: i18n('ONCOMING POLICE CAR'),
        },
        {
          code: '&#x1F695;',
          name: i18n('TAXI'),
        },
        {
          code: '&#x1F696;',
          name: i18n('ONCOMING TAXI'),
        },
        {
          code: '&#x1F697;',
          name: i18n('AUTOMOBILE'),
        },
        {
          code: '&#x1F698;',
          name: i18n('ONCOMING AUTOMOBILE'),
        },
        {
          code: '&#x1F699;',
          name: i18n('RECREATIONAL VEHICLE'),
        },
        {
          code: '&#x1F69A;',
          name: i18n('DELIVERY TRUCK'),
        },
        {
          code: '&#x1F69B;',
          name: i18n('ARTICULATED LORRY'),
        },
        {
          code: '&#x1F69C;',
          name: i18n('TRACTOR'),
        },
        {
          code: '&#x1F69D;',
          name: i18n('MONORAIL'),
        },
        {
          code: '&#x1F69E;',
          name: i18n('MOUNTAIN RAILWAY'),
        },
        {
          code: '&#x1F69F;',
          name: i18n('SUSPENSION RAILWAY'),
        },
        {
          code: '&#x1F6A0;',
          name: i18n('MOUNTAIN CABLEWAY'),
        },
        {
          code: '&#x1F6A1;',
          name: i18n('AERIAL TRAMWAY'),
        },
        {
          code: '&#x1F6A2;',
          name: i18n('SHIP'),
        },
        {
          code: '&#x1F6A3;',
          name: i18n('ROWBOAT'),
        },
        {
          code: '&#x1F6A4;',
          name: i18n('SPEEDBOAT'),
        },
        {
          code: '&#x1F6A5;',
          name: i18n('HORIZONTAL TRAFFIC LIGHT'),
        },
        {
          code: '&#x1F6A6;',
          name: i18n('VERTICAL TRAFFIC LIGHT'),
        },
        {
          code: '&#x1F6A7;',
          name: i18n('CONSTRUCTION SIGN'),
        },
        {
          code: '&#x1F6A8;',
          name: i18n('POLICE CARS REVOLVING LIGHT'),
        },
        {
          code: '&#x1F6A9;',
          name: i18n('TRIANGULAR FLAG ON POST'),
        },
        {
          code: '&#x1F6AA;',
          name: i18n('DOOR'),
        },
        {
          code: '&#x1F6AB;',
          name: i18n('NO ENTRY SIGN'),
        },
        {
          code: '&#x1F6AC;',
          name: i18n('SMOKING SYMBOL'),
        },
        {
          code: '&#x1F6AD;',
          name: i18n('NO SMOKING SYMBOL'),
        },
        {
          code: '&#x1F6AE;',
          name: i18n('PUT LITTER IN ITS PLACE SYMBOL'),
        },
        {
          code: '&#x1F6AF;',
          name: i18n('DO NOT LITTER SYMBOL'),
        },
        {
          code: '&#x1F6B0;',
          name: i18n('POTABLE WATER SYMBOL'),
        },
        {
          code: '&#x1F6B1;',
          name: i18n('NON-POTABLE WATER SYMBOL'),
        },
        {
          code: '&#x1F6B2;',
          name: i18n('BICYCLE'),
        },
        {
          code: '&#x1F6B3;',
          name: i18n('NO BICYCLES'),
        },
        {
          code: '&#x1F6B4;',
          name: i18n('BICYCLIST'),
        },
        {
          code: '&#x1F6B5;',
          name: i18n('MOUNTAIN BICYCLIST'),
        },
        {
          code: '&#x1F6B6;',
          name: i18n('PEDESTRIAN'),
        },
        {
          code: '&#x1F6B7;',
          name: i18n('NO PEDESTRIANS'),
        },
        {
          code: '&#x1F6B8;',
          name: i18n('CHILDREN CROSSING'),
        },
        {
          code: '&#x1F6B9;',
          name: i18n('MENS SYMBOL'),
        },
        {
          code: '&#x1F6BA;',
          name: i18n('WOMENS SYMBOL'),
        },
        {
          code: '&#x1F6BB;',
          name: i18n('RESTROOM'),
        },
        {
          code: '&#x1F6BC;',
          name: i18n('BABY SYMBOL'),
        },
        {
          code: '&#x1F6BD;',
          name: i18n('TOILET'),
        },
        {
          code: '&#x1F6BE;',
          name: i18n('WATER CLOSET'),
        },
        {
          code: '&#x1F6BF;',
          name: i18n('SHOWER'),
        },
        {
          code: '&#x1F6C0;',
          name: i18n('BATH'),
        },
        {
          code: '&#x1F6C1;',
          name: i18n('BATHTUB'),
        },
        {
          code: '&#x1F6C2;',
          name: i18n('PASSPORT CONTROL'),
        },
        {
          code: '&#x1F6C3;',
          name: i18n('CUSTOMS'),
        },
        {
          code: '&#x1F6C4;',
          name: i18n('BAGGAGE CLAIM'),
        },
        {
          code: '&#x1F6C5;',
          name: i18n('LEFT LUGGAGE'),
        },
        {
          code: '&#x1F6CB;',
          name: i18n('COUCH AND LAMP'),
        },
        {
          code: '&#x1F6CC;',
          name: i18n('SLEEPING ACCOMMODATION'),
        },
        {
          code: '&#x1F6CD;',
          name: i18n('SHOPPING BAGS'),
        },
        {
          code: '&#x1F6CE;',
          name: i18n('BELLHOP BELL'),
        },
        {
          code: '&#x1F6CF;',
          name: i18n('BED'),
        },
        {
          code: '&#x1F6D0;',
          name: i18n('PLACE OF WORSHIP'),
        },
        {
          code: '&#x1F6E0;',
          name: i18n('HAMMER AND WRENCH'),
        },
        {
          code: '&#x1F6E1;',
          name: i18n('SHIELD'),
        },
        {
          code: '&#x1F6E2;',
          name: i18n('OIL DRUM'),
        },
        {
          code: '&#x1F6E3;',
          name: i18n('MOTORWAY'),
        },
        {
          code: '&#x1F6E4;',
          name: i18n('RAILWAY TRACK'),
        },
        {
          code: '&#x1F6E5;',
          name: i18n('MOTOR BOAT'),
        },
        {
          code: '&#x1F6E9;',
          name: i18n('SMALL AIRPLANE'),
        },
        {
          code: '&#x1F6EB;',
          name: i18n('AIRPLANE DEPARTURE'),
        },
        {
          code: '&#x1F6EC;',
          name: i18n('AIRPLANE ARRIVING'),
        },
        {
          code: '&#x1F6F0;',
          name: i18n('SATELLITE'),
        },
        {
          code: '&#x1F6F3;',
          name: i18n('PASSENGER SHIP'),
        },
      ],
    },
  ],
};
