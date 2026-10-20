import React from 'react';
import { Tag } from 'choerodon-ui';

import { isTenantRoleLevel } from 'utils/utils';
import intl from 'utils/intl';

import thinSvg from "../../../../../../assets/sheet/border_type_thin.svg";
import dashedSvg from "../../../../../../assets/sheet/border_type_dashed.svg";
import mediumSvg from "../../../../../../assets/sheet/border_type_meidum.svg";

import borderNone from "../../../../../../assets/sheet/borderNone.svg";
import borderAll from "../../../../../../assets/sheet/borderAll.svg";
import borderOutside from "../../../../../../assets/sheet/borderOutside.svg";
import borderLeft from "../../../../../../assets/sheet/borderLeft.svg";
import borderTop from "../../../../../../assets/sheet/borderTop.svg";
import borderRight from "../../../../../../assets/sheet/borderRight.svg";
import borderBottom from "../../../../../../assets/sheet/borderBottom.svg";
import DateFormatPicker from '../Sheet/ToolBar/Formula/component/DateFormatPicker';
import NumberFormatPicker from '../Sheet/ToolBar/Formula/component/NumberFormatPicker';

const imgBorderThin = <img src={thinSvg} alt="" />;
const imgBorderDashed = <img src={dashedSvg} alt="" />;
const imgBorderMedium = <img src={mediumSvg} alt="" />;

export const borderMap = {
    'borderNone': <img src={borderNone} alt="" />,
    'borderAll': <img src={borderAll} alt="" />,
    'borderOutside': <img src={borderOutside} alt="" />,
    'borderLeft': <img src={borderLeft} alt="" />,
    'borderTop': <img src={borderTop} alt="" />,
    'borderRight': <img src={borderRight} alt="" />,
    'borderBottom': <img src={borderBottom} alt="" />,
};
export const ToolBarDivide = '|';
export const ToolBarType = {
  BUTTON: 'button',
  TEXT: 'text',
  CUSTOME: 'custome',
  DIVIDE: 'divide',
};

export const ToolBarKey = {
  FORMAT: 'format',
  INSERT: 'insert',
  PAGE_SETUP: 'page_setup',
};
const fontSizeOptions = new Array(81).fill(1).map((_, index) => {
  if (index >= 5 && index <= 11 || index > 11 && index % 2 === 0) return index;
  return false;
}).filter(Boolean);
export const qrCodeDefaultConfig = { codeFormat: "QR_CODE", version: 1, level: 'L', size: 21, imageType: 12 };
export const barCodeDefaultConfig = { format: "Code128" };
export const getToolBar = (key) => {
  const toolbar = {
    [ToolBarKey.FORMAT]: [
      {
        name: 'revoke',
        type: ToolBarType.BUTTON,
        focusDisabled: true,
        title: intl.get('hrpt.reportDesign.view.button.revoke').d('撤销'),
      },
      {
        name: 'recovery',
        type: ToolBarType.BUTTON,
        focusDisabled: true,
        title: intl.get('hrpt.reportDesign.view.button.recovery').d('恢复'),
      },
      {
        name: 'formatBrush',
        type: ToolBarType.BUTTON,
        focusDisabled: true,
        title: intl.get('hrpt.reportDesign.view.button.formatBrush').d('格式刷'),
      },
      {
        name: 'clearFormat',
        type: ToolBarType.BUTTON,
        focusDisabled: true,
        title: intl.get('hrpt.reportDesign.view.button.clearFormat').d('清除格式'),
      },
      {
        name: ToolBarDivide,
        type: ToolBarType.DIVIDE,
      },
      {
        name: 'fontFormat',
        type: ToolBarType.CUSTOME,
        focusDisabled: true,
        title: intl.get('hrpt.reportDesign.view.button.fontFormat').d('格式'),
        options: getFontFormat(),
      },
      // {
      //   name: 'decimalPlaces',
      //   type: ToolBarType.CUSTOME,
      //   focusDisabled: true,
      //   options: [
      //     {
      //       value: 'add',
      //       clsName: 'sheet-icon-addDecimal',
      //       title: intl.get('hrpt.reportDesign.view.button.addDecimal').d('增加小数位数'),
      //     },
      //     {
      //       value: 'less',
      //       clsName: 'sheet-icon-lessDecimal',
      //       title: intl.get('hrpt.reportDesign.view.button.lessDecimal').d('减少小数位数'),
      //     },
      //   ],
      // },
      {
        name: ToolBarDivide,
        type: ToolBarType.DIVIDE,
      },
      {
        name: 'fontStyle',
        type: ToolBarType.CUSTOME,
        menuKey: 'ff',
        title: intl.get('hrpt.reportDesign.view.button.fontStyle').d('字体'),
        options: getFontStyle(),
        focusDisabled: true,
      },
      {
        name: 'fontSize',
        type: ToolBarType.CUSTOME,
        menuKey: 'fs',
        title: intl.get('hrpt.reportDesign.view.button.fontSize').d('字体大小'),
        options: fontSizeOptions,
        unitOptions: ['px', 'pts'],
        focusDisabled: true,
      },
      {
        name: 'fontBold',
        menuKey: 'bl',
        type: ToolBarType.BUTTON,
        title: intl.get('hrpt.reportDesign.view.button.fontBold').d('加粗'),
        focusDisabled: true,
      },
      {
        name: 'italic',
        menuKey: 'it',
        type: ToolBarType.BUTTON,
        title: intl.get('hrpt.reportDesign.view.button.italic').d('斜体'),
        focusDisabled: true,
      },
      {
        name: 'underLine',
        menuKey: 'un',
        type: ToolBarType.BUTTON,
        title: intl.get('hrpt.reportDesign.view.button.underLine').d('下划线'),
        focusDisabled: true,
      },
      {
        name: 'deleteLine',
        menuKey: 'cl',
        type: ToolBarType.BUTTON,
        title: intl.get('hrpt.reportDesign.view.button.deleteLine').d('删除线'),
        focusDisabled: true,
      },
      {
        name: 'fontColor',
        type: ToolBarType.CUSTOME,
        menuKey: 'fc',
        title: intl.get('hrpt.reportDesign.view.button.fontColor').d('字体颜色'),
        focusDisabled: true,
      },
      {
        name: ToolBarDivide,
        type: ToolBarType.DIVIDE,
      },
      {
        name: 'bgColor',
        type: ToolBarType.CUSTOME,
        menuKey: 'bg',
        focusDisabled: true,
        title: intl.get('hrpt.reportDesign.view.button.bgColor').d('填充颜色'),
      },
      {
        name: 'border',
        type: ToolBarType.CUSTOME,
        focusDisabled: true,
        title: intl.get('hrpt.reportDesign.view.button.border').d('边框'),
        options: [
          {
            text: intl.get('hrpt.reportDesign.border.borderNone').d('无边框'),
            icon: 'borderNone',
            value: 'border-none',
          },
          {
            text: intl.get('hrpt.reportDesign.border.borderAll').d('所有边框'),
            icon: 'borderAll',
            value: 'border-all',
          },
          {
            text: intl.get('hrpt.reportDesign.border.borderOutside').d('外部边框'),
            icon: 'borderOutside',
            value: 'border-outside',
          },
          // {
          //   text: intl.get('hrpt.reportDesign.border.borderOutside_blod').d('粗外边框'),
          //   icon: 'borderOutside_blod',
          //   value: 'border-outside-bold',
          // },
          {
            text: intl.get('hrpt.reportDesign.border.borderLeft').d('左侧边框'),
            icon: 'borderLeft',
            value: 'border-left',
          },
          {
            text: intl.get('hrpt.reportDesign.border.borderTop').d('顶部边框'),
            icon: 'borderTop',
            value: 'border-top',
          },
          {
            text: intl.get('hrpt.reportDesign.border.borderRight').d('右侧边框'),
            icon: 'borderRight',
            value: 'border-right',
          },
          {
            text: intl.get('hrpt.reportDesign.border.borderBottom').d('底部边框'),
            icon: 'borderBottom',
            value: 'border-bottom',
          },
        ],
      },
      {
        name: 'cellSlash',
        type: ToolBarType.CUSTOME,
        focusDisabled: true,
        title: intl.get('hrpt.reportDesign.view.button.cellSlash').d('单元格斜线'),
      },
      {
        name: ToolBarDivide,
        type: ToolBarType.DIVIDE,
      },
      {
        name: 'alignHorizontal',
        focusDisabled: true,
        type: ToolBarType.CUSTOME,
        menuKey: 'ht',
        title: intl.get('hrpt.reportDesign.view.button.alignHorizontal').d('水平对齐'),
        options: [
          {
            icon: 'alignLeft',
            value: 1,
            text: intl.get('hrpt.reportDesign.view.button.alignLeft').d('左对齐'),
          },
          {
            icon: 'alignCenter',
            value: 0,
            text: intl.get('hrpt.reportDesign.view.button.alignCenter').d('居中对齐'),
          },
          {
            icon: 'alignRight',
            value: 2,
            text: intl.get('hrpt.reportDesign.view.button.alignRight').d('右对齐'),
          },
        ],
      },
      {
        name: 'alignVertical',
        focusDisabled: true,
        type: ToolBarType.CUSTOME,
        menuKey: 'vt',
        title: intl.get('hrpt.reportDesign.view.button.alignVertical').d('垂直对齐'),
        options: [
          {
            text: intl.get('hrpt.reportDesign.alignVertical.alignTop').d('顶部对齐'),
            icon: 'alignTop',
            value: 1,
          },
          {
            text: intl.get('hrpt.reportDesign.alignVertical.alignMiddle').d('居中对齐'),
            icon: 'alignMiddle',
            value: 0,
          },
          {
            text: intl.get('hrpt.reportDesign.alignVertical.alignBottom').d('底部对齐'),
            icon: 'alignBottom',
            value: 2,
          },
        ],
      },
      {
        name: 'wordWrap',
        type: ToolBarType.BUTTON,
        title: intl.get('hrpt.reportDesign.view.button.wordWrap').d('自动换行'),
        focusDisabled: true,
        menuKey: 'tb',
        menuValue: 2,
        reportType: ["EXCEL"],
        checkStyle: "icon",
      },
      {
        name: 'cellMerge',
        type: ToolBarType.BUTTON,
        focusDisabled: true,
        title: intl.get('hrpt.reportDesign.view.button.cellMerge').d('合并单元格'),
      },
      {
        name: ToolBarDivide,
        type: ToolBarType.DIVIDE,
      },
      {
        name: 'formula',
        type: ToolBarType.CUSTOME,
        focusDisabled: true,
        title: intl.get('hrpt.reportDesign.view.button.expression').d('公式'),
      },
      {
        name: 'conditionFormat',
        type: ToolBarType.CUSTOME,
        focusDisabled: true,
        title: intl.get('hrpt.reportDesign.view.button.conditionFormat').d('条件格式'),
      },
      {
        name: ToolBarDivide,
        type: ToolBarType.DIVIDE,
      },
      {
        name: 'businessType',
        type: ToolBarType.CUSTOME,
        focusDisabled: true,
        title: intl.get('hrpt.reportDesign.view.title.businessType').d('业务类型'),
      }
    ],
    [ToolBarKey.INSERT]: [
      {
        name: 'floatPic',
        type: ToolBarType.CUSTOME,
        focusDisabled: true,
        title: intl.get('hrpt.reportDesign.view.button.floatPic').d('浮动图片'),
        reportType: 'PDF',
      },
      {
        name: 'cellPic',
        type: ToolBarType.CUSTOME,
        focusDisabled: true,
        title: intl.get('hrpt.reportDesign.view.button.cellPic').d('单元格图片'),
      },
      // {
      //   name: 'barCode',
      //   type: ToolBarType.CUSTOME,
      //   focusDisabled: true,
      //   title: intl.get('hrpt.reportDesign.view.button.barCode').d('条形码'),
      // },
      // {
      //   name: ToolBarDivide,
      //   type: ToolBarType.DIVIDE,
      // },
      // {
      //   name: 'function_sum',
      //   type: ToolBarType.TEXT,
      //   title: 'SUM',
      // },
      // {
      //   name: 'function_count',
      //   type: ToolBarType.TEXT,
      //   title: 'COUNT',
      // },
      // {
      //   name: 'function_max',
      //   type: ToolBarType.TEXT,
      //   title: 'MAX',
      // },
      // {
      //   name: 'function_min',
      //   type: ToolBarType.TEXT,
      //   title: 'MIN',
      // },
      // {
      //   name: 'function_sumif',
      //   type: ToolBarType.TEXT,
      //   title: 'SUMIF',
      // },
      {
        name: ToolBarDivide,
        type: ToolBarType.DIVIDE,
      },
      {
        name: 'insertColRow',
        focusDisabled: true,
        type: ToolBarType.CUSTOME,
        title: intl.get('hrpt.reportDesign.view.button.insertColRow').d('插入行列'),
      },
    ],
    [ToolBarKey.PAGE_SETUP]: [
      {
        name: 'paperMargin',
        focusDisabled: true,
        type: ToolBarType.CUSTOME,
        title: intl.get('hrpt.reportDesign.view.button.paperMargin').d('页边距'),
        options: {
          default: {
            top: 1.91,
            bottom: 1.91,
            left: 1.91,
            right: 1.91,
          },
          wider: {
            top: 2.54,
            bottom: 2.54,
            left: 2.54,
            right: 2.54,
          },
          narrow: {
            top: 1.91,
            bottom: 1.91,
            left: 0.64,
            right: 0.64,
          },
        },
      },
      {
        name: 'paperSize',
        focusDisabled: true,
        type: ToolBarType.CUSTOME,
        title: intl.get('hrpt.reportDesign.view.button.paperSize').d('纸张大小'),
        options: [
          {
            text: intl.get('hrpt.reportDesign.paperSize.a3').d('A3'),
            value: 'A3',
            width: 29.7,
            height: 42.0,
            desc: '(29.7 cm × 42.0 cm)',
          },
          {
            text: intl.get('hrpt.reportDesign.paperSize.a4').d('A4'),
            value: 'A4',
            width: 21.0,
            height: 29.7,
            desc: '(21.0 cm × 29.7 cm)',
          },
          {
            text: intl.get('hrpt.reportDesign.paperSize.a5').d('A5'),
            value: 'A5',
            width: 14.8,
            height: 21.0,
            desc: '(14.8 cm × 21.0 cm)',
          },
          {
            text: intl.get('hrpt.reportDesign.paperSize.b4').d('B4'),
            value: 'B4',
            width: 25.0,
            height: 35.3,
            desc: '(25.0 cm × 35.3 cm)',
          },
          {
            text: intl.get('hrpt.reportDesign.paperSize.b5').d('B5'),
            value: 'B5',
            width: 17.6,
            height: 25.0,
            desc: '(17.6 cm × 25.0 cm)',
          },
        ],
      },
      {
        name: 'paperRotation',
        type: ToolBarType.CUSTOME,
        focusDisabled: true,
        title: intl.get('hrpt.reportDesign.view.button.paperRotation').d('纸张方向'),
        options: [
          {
            text: intl.get('hrpt.reportDesign.paperRotation.horizontal').d('横向'),
            value: 'horizontal',
          },
          {
            text: intl.get('hrpt.reportDesign.paperRotation.vertical').d('纵向'),
            value: 'vertical',
          },
        ],
      },
      {
        name: 'waterMask',
        type: ToolBarType.CUSTOME,
        focusDisabled: true,
        title: intl.get('hrpt.reportDesign.view.button.waterMask').d('水印'),
        reportType: ["PDF"],
      },
      // {
      //   name: 'pageNum',
      //   type: ToolBarType.CUSTOME,
      //   focusDisabled: true,
      //   title: intl.get('hrpt.reportDesign.view.button.pageNum').d('页码'),
      // },
      // {
      //   name: 'paperHeaderAndFooter',
      //   type: ToolBarType.CUSTOME,
      //   focusDisabled: true,
      //   title: intl.get('hrpt.reportDesign.view.button.paperHeaderAndFooter').d('页眉/页脚'),
      // },
      // {
      //   name: 'background',
      //   focusDisabled: true,
      //   type: ToolBarType.CUSTOME,
      //   title: intl.get('hrpt.reportDesign.view.button.background').d('背景'),
      // },
      // {
      //   name: 'templatePrintPic',
      //   type: ToolBarType.CUSTOME,
      //   focusDisabled: true,
      //   title: intl.get('hrpt.reportDesign.view.button.templatePrintPic').d('套打图片'),
      // },
      // {
      //   name: ToolBarDivide,
      //   type: ToolBarType.DIVIDE,
      // },
      // {
      //   name: 'showGridLine',
      //   type: ToolBarType.CUSTOME,
      //   focusDisabled: true,
      //   title: intl.get('hrpt.reportDesign.view.button.showGridLine').d('显示网格线'),
      // },
      // {
      //   name: 'showRuler',
      //   type: ToolBarType.CUSTOME,
      //   focusDisabled: true,
      //   title: intl.get('hrpt.reportDesign.view.button.showRuler').d('显示标尺'),
      // },
    ],
  };
  return toolbar[key];
};

export const FirstFontColor = [
  'rgba(255, 255, 255, 1)',
  'rgba(0, 0, 0, 1)',
  'rgba(255, 0, 0, 1)',
  'rgba(255, 153, 0, 1)',
  'rgba(255, 255, 0, 1)',
  'rgba(152, 250, 28, 1)',
  'rgba(108, 222, 255, 1)',
  'rgba(64, 62, 214, 1)',
  'rgba(237, 65, 253, 1)',
];

export const SecondFontColor = [
  'rgba(233, 233, 233, 1)',
  'rgba(123, 123, 123, 1)',
  'rgba(255, 200, 184, 1)',
  'rgba(255, 225, 178, 1)',
  'rgba(255, 242, 204, 1)',
  'rgba(217, 234, 211, 1)',
  'rgba(223, 248, 255, 1)',
  'rgba(207, 199, 244, 1)',
  'rgba(254, 228, 255, 1)',

  'rgba(217, 217, 217, 1)',
  'rgba(92, 92, 92, 1)',
  'rgba(233, 152, 153, 1)',
  'rgba(255, 184, 77, 1)',
  'rgba(255, 229, 154, 1)',
  'rgba(172, 219, 126, 1)',
  'rgba(133, 212, 230, 1)',
  'rgba(140, 123, 232, 1)',
  'rgba(238, 147, 246. 1)',

  'rgba(196, 196, 196, 1)',
  'rgba(51, 51, 51, 1)',
  'rgba(224, 102, 102, 1)',
  'rgba(251, 141, 0, 1)',
  'rgba(255, 217, 102, 1)',
  'rgba(135, 193, 32, 1)',
  'rgba(76, 194, 238, 1)',
  'rgba(63, 73, 185, 1)',
  'rgba(208, 65, 225, 1)',

  'rgba(157, 157, 157, 1)',
  'rgba(38, 38, 38, 1)',
  'rgba(204, 0, 0, 1)',
  'rgba(231, 82, 0, 1)',
  'rgba(255, 183, 0, 1)',
  'rgba(103, 143, 0, 1)',
  'rgba(1, 136, 251, 1)',
  'rgba(39, 65, 177, 1)',
  'rgba(164, 25, 211, 1)',
];

export const setRecentlyFontColor = (key, value) => {
  localStorage.setItem(key, value);
};

export const getRecentlyFontColor = (key) => {
  const fontColor = localStorage.getItem(key);
  if (!fontColor) {
    return [];
  }
  return fontColor.split('|');
};

export const getFontStyle = () => [
  {
    text: intl.get('hrpt.common.fontFamily.sourceHanSans').d('思源黑体'),
    value: 6,
  },
  {
    text: intl.get('hrpt.common.fontFamily.sourceHanSerif').d('思源宋体'),
    value: 5,
  },
  {
    text: 'Times New Roman',
    value: 0,
  },
  {
    text: 'Source Sans 3',
    value: 13,
  }
];

export const getFontFormat = () => {
  return [
    // {
    //   text: intl.get('hrpt.reportDesign.format.general').d('常规'),
    //   value: 'General',
    //   example: '',
    //   type: 'General',
    //   info: intl
    //     .get('hrpt.reportDesign.format.general.info')
    //     .d('常规单元格格式不包含任何特定的数字格式。'),
    // },
    {
      text: intl.get('hrpt.reportDesign.format.text').d('文本'),
      value: 'General',
      example: '',
      type: 'text',
      info: intl
        .get('hrpt.reportDesign.format.text.info')
        .d('在文本单元格格式中，数字作为文本处理。单元格显示的内容与输入的内容完全一致。'),
    },
    { text: '', value: 'split', example: '' },
    {
      text: intl.get('hrpt.reportDesign.format.number').d('数值'),
      value: '##0.00',
      example: '1000.12',
      type: 'number',
      info: intl
        .get('hrpt.reportDesign.format.number.info')
        .d('数字格式一般用于显示一般数字。货币则提供特殊格式的货币值。'),
    },
    {
      text: intl.get('hrpt.reportDesign.format.percentage').d('百分比'),
      value: '#0.00%',
      example: '12.21%',
      type: 'percentage',
      info: intl
        .get('hrpt.reportDesign.format.number.info')
        .d('百分百格式将单元格中数值乘以100，并以百分数形式显示。'),
    },
    {
      text: intl.get('hrpt.reportDesign.format.scientificNotation').d('科学记数'),
      value: '0.00E+00',
      type: 'scientificNotation',
      example: '1.01E+5',
    },
    { text: '', value: 'split', example: '' },
    // { text: '会计', value: '¥(0.00)', example: '¥(1200.09)' },
    // { "text": "财务", "value": "(#.####)", "example": "(1200.09)" },
    // { text: '万元', value: 'w', example: '1亿2000万2500' },
    {
      text: intl.get('hrpt.reportDesign.format.rmb').d('人民币'),
      value: '¥0.00',
      type: 'rmb',
      example: '¥1200.09',
    },
    {
      text: intl.get('hrpt.reportDesign.format.dollar').d('美元'),
      value: '$0.00',
      type: 'dollar',
      example: '$1200.09',
    },
    // { "text": "货币整数", "value": "¥####", "example": "¥1200" },
    // { text: '万元2位小数', value: 'w0.00', example: '2万2500.55' },
    { text: '', value: 'split', example: '' },
    {
      text: intl.get('hrpt.reportDesign.format.date').d('日期'),
      value: 'yyyy-MM-dd',
      type: 'date',
      example: '2017-11-29',
      options: [
        {
          value: 'yyyy-MM-dd',
          text: intl.get('hrpt.reportDesign.format.date.format1').d('1930-08-05'),
          example: '2017-11-29',
          type: 'date',
        },
        {
          value: 'yyyy/MM/dd',
          text: intl.get('hrpt.reportDesign.format.date.format2').d('1930/08/05'),
          example: '1930/08/05',
          type: 'date',
        },
        { value: 'yyyy-MM', example: '2017-11', type: 'date', text: '1930-08' },
        { value: 'yyyy/MM', example: '2017/11', type: 'date', text: '1930/08' },
        { value: 'yyyyMMdd', example: '20171130', type: 'date', text: '19300805' },
        { value: 'dd-MM-yyyy', example: '30-11-2017', type: 'date', text: '05-08-1930' },
        { value: 'MM-dd', example: '11-29', type: 'date', text: '11-29' },
        { value: 'MM/dd', example: '11/29', type: 'date', text: '11/29' },
        { value: 'MM/dd/yyyy', example: '08/05/1930', type: 'date', text: '08/05/1930' },
        { value: 'yy/MM/dd', example: '30/08/05', type: 'date', text: '30/08/05' },
        { value: 'yy-MM-dd', example: '30-08-05', type: 'date', text: '30-08-05' },
        { value: 'yy/MM', example: '30/08', type: 'date', text: '30/08' },
        { value: 'yy-MM', example: '30-08', type: 'date', text: '30-08' },
        { value: 'dd/MM/yyyy', example: '05-08-1930', type: 'date', text: '05-08-1930' },
        { value: 'dd-MMM-yyyy', example: '05-Aug-1930', type: 'date', text: '05-Aug-1930' },
        { value: 'dd/MMM/yyyy', example: '05/Aug/1930', type: 'date', text: '05/Aug/1930' },
        // {
        //   value: 'yyyy"年"M"月"d"日"',
        //   text: intl.get('hrpt.reportDesign.format.date.format3').d('1930年8月5日'),
        //   type: 'date',
        // },
      ],
    },
    {
      text: intl.get('hrpt.reportDesign.format.time').d('时间'),
      value: 'HH:mm:ss',
      example: '3:00',
      type: 'time',
      options: [
        {
          value: 'HH:mm:ss',
          text: intl.get('hrpt.reportDesign.format.time.format1').d('10:23:59'),
          example: '10:23:59',
          type: 'time',
        },
        {
          value: 'HH:mm',
          text: intl.get('hrpt.reportDesign.format.time.format2').d('10:23'),
          example: '10:23',
          type: 'time',
        },
      ],
    },
    // { text: '时间24H', value: 'hh:mm', example: '15:00' },
    {
      text: intl.get('hrpt.reportDesign.format.dateTime').d('日期时间'),
      value: 'yyyy-MM-dd HH:mm:ss',
      example: '2017-11-29 3:00',
      type: 'dateTime',
      options: [
        {
          value: 'yyyy-MM-dd HH:mm:ss',
          text: '2020-07-29 10:23:59',
          example: '2020-07-29 10:23:59',
          type: 'dateTime',
        },
        {
          value: 'yyyy-MM-dd HH:mm',
          text: '2020-07-29 10:23',
          example: '2020-07-29 10:23',
          type: 'dateTime',
        },
        {
          value: 'dd-MM-yyyy HH:mm:ss',
          text: '29-07-2020 10:23:59',
          example: '29-07-2020 10:23:59',
          type: 'dateTime',
        },
        {
          value: 'dd-MM-yyyy HH:mm',
          text: '29-07-2020 10:23',
          example: '29-07-2020 10:23',
          type: 'dateTime',
        },
        {
          value: 'dd/MM/yyyy HH:mm:ss',
          text: '29/07/2020 10:23:59',
          example: '29/07/2020 10:23:59',
          type: 'dateTime',
        },
        {
          value: 'dd/MM/yyyy HH:mm',
          text: '29/07/2020 10:23',
          example: '29/07/2020 10:23',
          type: 'dateTime',
        },
        {
          value: 'dd-MMM-yyyy HH:mm:ss',
          text: '20-Jul-2020 10:23:59',
          example: '20-Jul-2020 10:23:59',
          type: 'dateTime',
        },
        {
          value: 'dd-MMM-yyyy HH:mm',
          text: '20-Jul-2020 10:23',
          example: '20-Jul-2020 10:23',
          type: 'dateTime',
        },
        {
          value: 'dd/MMM/yyyy HH:mm:ss',
          text: '20/Jul/2020 10:23:59',
          example: '20/Jul/2020 10:23:59',
          type: 'dateTime',
        },
        {
          value: 'dd/MMM/yyyy HH:mm',
          text: '20/Jul/2020 10:23',
          example: '20/Jul/2020 10:23',
          type: 'dateTime',
        },
      ],
    },
    // {
    //   text: '日期时间24H',
    //   value: 'yyyy-MM-dd hh:mm',
    //   example: '2017-11-29 15:00',
    // },
    // { text: '', value: 'split', example: '' },
    {
      text: intl.get('hrpt.reportDesign.format.fmtOtherSelf').d('自定义格式'),
      value: 'fmtOtherSelf',
      type: "fmtOtherSelf",
      // example: 'more',
    },
  ];
};

export const borderStyleData = [
  {
    value: '1',
    example: '',
    img: imgBorderThin,
  },
  {
    value: '2',
    example: '',
    img: imgBorderDashed,
  },
  {
    value: '20',
    example: '',
    img: imgBorderMedium,
  },
];

export const PageNumPattern = [
  '=PAGENUM("currentNum")',
  '=PAGENUM("-currentNum-")',
  '=PAGENUM("第currentNum页")',
  '=PAGENUM("第currentNum页 共countNum页")',
  '=PAGENUM("第currentNum页/共countNum页")',
];

export const getFormulaList = () => {
  return [
    {
      code: 'common',
      text: intl.get('hrpt.reportDesign.formula.common').d('常用'),
      children: [
        {
          code: 'LINE_NUM',
          text: 'LINE_NUM',
          expression: 'LINE_NUM()',
          desc: intl.get('hrpt.reportDesign.formula.lineNum.desc').d('自动生成行号'),
          supportNestFunc: [],
          example: undefined,
          exampleResult: undefined,
        },
        {
          code: 'USE_LINE_FIELD',
          text: 'USE_LINE_FIELD',
          expression: intl
            .get('hrpt.reportDesign.formula.useLineField.expression')
            .d('USE_LINE_FIELD(字段)'),
          desc: intl.get('hrpt.reportDesign.formula.useLineField.desc').d('指定行字段进行赋值'),
          supportNestFunc: [],
          paramList: [
            {
              name: 'param1',
              label: intl.get('hrpt.reportDesign.formula.findBy.lineField').d('行字段'),
              required: true,
              index: 1,
              type: 'formField', // 只能选字段
              onlyLineField: true, // 只能选字段
              onlyChildLineField: true,
            },
          ],
        },
        {
          code: 'LOV_TRANSLATE',
          text: 'LOV_TRANSLATE',
          expression: intl
            .get('hrpt.reportDesign.formula.lovTranslate.expression')
            .d('LOV_TRANSLATE(值集编码, 需要翻译的字段, 语言编码)'),
          desc: intl
            .get('hrpt.reportDesign.formula.lovTranslate.desc')
            .d('值集翻译，最后一个参数（语言编码如 zh_CN ）可选，不指定语言编码，获取默认当前语言'),
          supportNestFunc: ['USE_LINE_FIELD'],
          paramList: [
            {
              name: 'param1',
              label: intl.get('hrpt.reportDesign.formula.lovTranslate.lovCode').d('值集编码'),
              required: true,
              index: 1,
              type: 'component', // 只能填固定值
              componentProps: {
                lovCode: isTenantRoleLevel()
                  ? 'HPFM.LOV.LOV_DETAIL_CODE.ORG'
                  : 'HPFM.LOV.LOV_DETAIL_CODE',
                valueField: 'lovCode',
              },
            },
            {
              name: 'param2',
              label: intl
                .get('hrpt.reportDesign.formula.lovTranslate.translateField')
                .d('需要翻译的字段'),
              required: true,
              index: 2,
              type: 'formField', // 只能选字段
            },
            {
              name: 'param3',
              label: intl.get('hrpt.reportDesign.formula.lovTranslate.languageCode').d('语言编码'),
              required: false,
              index: 3,
              type: 'component', // 只能填固定值
              componentProps: {
                lovCode: 'HPFM.LANGUAGE',
                valueField: 'code',
              },
            },
          ],
          example: "LOV_TRANSLATE('HPFM.EMPLOYEE', 'NAME', 'zh_CN')",
          exampleResult: '张三',
        },
        {
          code: 'PRINTER',
          text: 'PRINTER',
          expression: 'PRINTER()',
          desc: intl.get('hrpt.reportDesign.formula.printer.desc').d('显示为当前打印操作人的子账户编码以及名称'),
          supportNestFunc: [],
          example: "PRINTER()",
          exampleResult: '张三(10001)',
        },
      ],
    },
    {
      code: 'text',
      text: intl.get('hrpt.reportDesign.formula.text').d('文本'),
      children: [
        {
          code: 'CONCAT',
          text: 'CONCAT',
          expression: 'CONCAT(文本1, [文本2...])',
          desc: intl.get('hrpt.reportDesign.formula.concat.desc').d('文本拼接'),
          supportNestFunc: ["LINE_NUM", "USE_LINE_FIELD", "LOV_TRANSLATE", "CONCAT",
            "TRIM_LEADING_ZERO", "TRIM_TRAILING_ZERO", "RMB_UPPER", "RMB_UPPER_JIAO", "VND_UPPER", "NOW", "TIME_ZONE", "TIME_ZONE_CONVERSION", "PRINTER", "NUMERIC_FORMAT", "DATE_FORMAT"],
          paramList: [
            {
              name: 'param1',
              label: intl.get('hrpt.reportDesign.formula.concat.text').d('文本'),
              required: true,
              index: 1,
            },
            {
              name: 'param2',
              label: intl.get('hrpt.reportDesign.formula.concat.text').d('文本'),
              required: true,
              index: 2,
            },
          ],
          paramListFormat: {
            // eslint-disable-next-line no-template-curly-in-string
            name: 'param${number}',
            label: intl.get('hrpt.reportDesign.formula.concat.text').d('文本'),
            required: true,
          },
          dynamicParamList: true, // 参数个数不定长
          example: 'CONCAT("在线", "编辑")',
          exampleResult: '在线编辑',
        },
        {
          code: 'TRIM_LEADING_ZERO',
          text: 'TRIM_LEADING_ZERO',
          expression: 'TRIM_LEADING_ZERO(文本1)',
          desc: intl.get('hrpt.reportDesign.formula.trimLeadingZero.desc').d('去除前导零'),
          supportNestFunc: ["USE_LINE_FIELD", "LOV_TRANSLATE", "CONCAT", "NUMERIC_FORMAT"],
          paramList: [
            {
              name: 'param1',
              label: intl.get('hrpt.reportDesign.formula.concat.text').d('文本'),
              required: true,
              index: 1,
            },
          ],
          example: 'TRIM_LEADING_ZERO("00123")',
          exampleResult: '123',
        },
        {
          code: 'TRIM_TRAILING_ZERO',
          text: 'TRIM_TRAILING_ZERO',
          expression: 'TRIM_TRAILING_ZERO(文本1)',
          desc: intl.get('hrpt.reportDesign.formula.trimTrailingZero.desc').d('去除后置零'),
          supportNestFunc: ["USE_LINE_FIELD", "LOV_TRANSLATE", "CONCAT"],
          paramList: [
            {
              name: 'param1',
              label: intl.get('hrpt.reportDesign.formula.concat.text').d('文本'),
              required: true,
              index: 1,
            },
          ],
          example: 'TRIM_TRAILING_ZERO("123.4500")',
          exampleResult: '123.45',
        },
      ],
    },
    {
      code: 'money',
      text: intl.get('hrpt.reportDesign.formula.money').d('金额'),
      children: [
        {
          code: 'RMB_UPPER',
          text: 'RMB_UPPER',
          expression: 'RMB_UPPER(金额)',
          desc: intl.get('hrpt.reportDesign.formula.money.rmbUpper').d('金额转大写'),
          supportNestFunc: ["USE_LINE_FIELD", "CONCAT", "TRIM_LEADING_ZERO", "TRIM_TRAILING_ZERO", "TOTAL", "NUMERIC_FORMAT"],
          paramList: [{ name: 'money', label: '金额', required: true, index: 1 }],
          example: 'RMB_UPPER(168899)',
          exampleResult: '壹拾陆万捌仟捌佰玖拾玖元整',
        },
        {
          code: 'RMB_UPPER_JIAO',
          text: 'RMB_UPPER_JIAO',
          expression: 'RMB_UPPER_JIAO(金额)',
          desc: intl.get('hrpt.reportDesign.formula.money.rmbUpperJiao').d('人民币金额转大写，取整至角位(即元、角均可接整)'),
          supportNestFunc: ["USE_LINE_FIELD", "CONCAT", "TRIM_LEADING_ZERO", "TRIM_TRAILING_ZERO", "TOTAL", "NUMERIC_FORMAT"],
          paramList: [{ name: 'money', label: '金额', required: true, index: 1 }],
          example: 'RMB_UPPER_JIAO(1200.20)',
          exampleResult: '壹仟贰佰元贰角整',
        },
        {
          code: 'VND_UPPER',
          text: 'VND_UPPER',
          expression: 'VND_UPPER(金额)',
          desc: intl.get('hrpt.reportDesign.formula.money.vndUpper').d('越南金额转大写'),
          supportNestFunc: ["USE_LINE_FIELD", "CONCAT", "TRIM_LEADING_ZERO", "TRIM_TRAILING_ZERO", "TOTAL", "NUMERIC_FORMAT"],
          paramList: [{ name: 'money', label: '金额', required: true, index: 1 }],
          example: 'VND_UPPER(168899)',
          exampleResult: 'MỘT TRĂM SÁU MƯƠI TÁM NGHÌN TÁM TRĂM CHÍN MƯƠI CHÍN ĐỒNG',
        },
      ],
    },
    {
      code: 'dateAndTime',
      text: intl.get('hrpt.reportDesign.formula.dateAndTime').d('日期与时间'),
      children: [
        {
          code: 'NOW',
          text: 'NOW',
          expression: 'NOW()',
          desc: intl.get('hrpt.reportDesign.formula.dateAndTime.now').d('返回当前日期和时间'),
          supportNestFunc: [],
          example: 'NOW()',
          exampleResult: '2022-01-20 10:20:30',
        },
        {
          code: 'TIME_ZONE',
          text: 'TIME_ZONE',
          expression: 'TIME_ZONE()',
          supportNestFunc: [],
          desc: intl.get('hrpt.reportDesign.formula.dateAndTime.timeZone').d('添加时区标识'),
          example: 'TIME_ZONE()',
          exampleResult: intl.get('hrpt.reportDesign.formula.dateAndTime.timeZone.example').d('(UTC+02:00)布鲁塞尔、哥本哈根、马德里、巴黎'),
        },
        {
          code: 'TIME_ZONE_CONVERSION',
          text: 'TIME_ZONE_CONVERSION',
          expression: 'TIME_ZONE_CONVERSION()',
          paramList: [
            {
              name: 'param1',
              label: intl.get('hrpt.reportDataSet.model.reportDataSet.field').d('字段'),
              required: true,
              index: 1,
              type: 'formField', // 只能选字段
            },
          ],
          supportNestFunc: ["USE_LINE_FIELD"],
          desc: intl.get('hrpt.reportDesign.formula.dateAndTime.timeZoneConversion').d('时间参数进行时区转换'),
          example: `TIME_ZONE_CONVERSION(${intl.get('hzero.common.date.creation').d("创建时间")})`,
          exampleResult: "2024-01-01 12:00:00",
        },
        {
          code: 'DATE_FORMAT',
          text: 'DATE_FORMAT',
          expression: intl.get('hrpt.reportDesign.formula.dateFormat.expression').d('DATE_FORMAT(日期时间, 日期时间格式)'),
          paramList: [
            {
              name: 'param1',
              label: intl.get('hrpt.reportDataSet.model.reportDataSet.field').d('字段'),
              required: true,
              index: 1,
              type: 'formField', // 只能选字段
            },
            {
              name: 'param2',
              label: intl.get('hrpt.reportDesign.formula.dateAndTime.dateFormat.format').d('选择日期格式'),
              required: true,
              index: 1,
              type: 'custome',
              dataType: 'date',
              customeRender: props => <DateFormatPicker {...props} />,
            },
          ],
          supportNestFunc: ["USE_LINE_FIELD", "NOW"],
          desc: intl.get('hrpt.reportDesign.formula.dateAndTime.dateFormat').d('设置日期、日期时间字段格式'),
          example: `DATE_FORMAT(${intl.get('hzero.common.date.creation').d("创建时间")}, "yyyy-mm-dd")`,
          exampleResult: "2024-01-01",
        },
      ],
    },
    {
      code: 'number',
      text: intl.get('hrpt.reportDesign.formula.number').d('数值'),
      children: [
        {
          code: 'PAGE_TOTAL',
          text: 'PAGE_TOTAL',
          expression: intl.get('hrpt.reportDesign.formula.groupSum.expression').d('PAGE_TOTAL(小记字段)'),
          desc: intl.get('hrpt.reportDesign.formula.groupSum.desc').d('按页小计。仅允许使用在顶部/底部固定区域内，可按数值字段所在循环块的固定行数在每页'),
          supportNestFunc: [],
          example: "PAGE_TOTAL(得分)",
          exampleResult: '125',
          paramList: [
            {
              name: 'param1',
              label: intl.get('hrpt.reportDesign.formula.groupSum.scope').d('小记字段'),
              required: true,
              index: 1,
              type: 'formField',
              onlyLineField: true,
              fieldFilter: ({ record }) => {
                const { businessType, dataType } = record;
                if (["QUANTITY", "TAX_RATE", "AMOUNT", "AMOUNT_HUNDRED_THOUSAND", "AMOUNT_MILLION"].includes(businessType)) return true;
                if (["BIGINT", "INT", "SMALLINT", "MEDIUMINT", "TINYINT", "DOUBLE", "DECIMAL", "FLOAT"].includes(dataType)) return true;
                return false;
              },
            },
          ],
        },
        {
          code: 'TOTAL',
          text: 'TOTAL',
          expression: intl.get('hrpt.reportDesign.formula.total.expression').d('TOTAL(汇总数值字段)'),
          desc: intl.get('hrpt.reportDesign.formula.total.desc').d('汇总行数值类字段值'),
          supportNestFunc: [],
          example: "TOTAL(行数量)",
          exampleResult: '354.00',
          paramList: [
            {
              name: 'param1',
              label: intl.get('hrpt.reportDesign.formula.total.scope').d('汇总数值字段'),
              required: true,
              index: 1,
              type: 'formField',
              onlyLineField: true,
              fieldFilter: ({ record, sheetData }) => {
                if (!sheetData || !sheetData.length) {
                  return false;
                }
                const target = sheetData.find(cell => cell && cell.extra && cell.extra.code === record.code);
                if (!target) {
                  return false;
                }
                const { businessType, dataType } = record;
                if (["QUANTITY", "TAX_RATE", "AMOUNT", "AMOUNT_HUNDRED_THOUSAND", "AMOUNT_MILLION"].includes(businessType)) return true;
                if (["BIGINT", "INT", "SMALLINT", "MEDIUMINT", "TINYINT", "DOUBLE", "DECIMAL", "FLOAT"].includes(dataType)) return true;
                return false;
              },
            },
          ],
        },
        {
          code: 'NUMERIC_FORMAT',
          text: 'NUMERIC_FORMAT',
          expression: intl.get('hrpt.reportDesign.formula.numeric_format.expression').d('NUMERIC_FORMAT(数值, 设置数值类字段格式)'),
          desc: intl.get('hrpt.reportDesign.formula.numeric_format.desc').d('设置数值类字段格式'),
          supportNestFunc: ["USE_LINE_FIELD"],
          example: intl.get('hrpt.reportDesign.formula.numeric_format.example').d(`NUMERIC_FORMAT(“1200”，“小数位数:3，千分位:是”)`),
          exampleResult: '1,200.000',
          paramList: [
            {
              name: 'param1',
              label: intl.get('hrpt.reportDataSet.model.reportDataSet.field').d('字段'),
              required: true,
              index: 1,
              type: 'formField', // 只能选字段
            },
            {
              name: 'param2',
              label: intl.get('hrpt.reportDesign.formula.numeric_format.format').d('设置数值格式'),
              required: true,
              index: 1,
              type: 'custome',
              dataType: 'number',
              customeRender: props => <NumberFormatPicker {...props} />
            },
          ],
        },
      ],
    }
  ];
};

export const getDataTypeMeaning = (dataType = '') => {
  const typeMeaningObj = {
    NUMBER: intl.get('hrpt.reportDesign.dataType.number').d('数字'),
    DECIMAL: intl.get('hrpt.reportDesign.dataType.number').d('数字'),
    BIGINT: intl.get('hrpt.reportDesign.dataType.number').d('数字'),
    DATETIME: intl.get('hrpt.reportDesign.dataType.dateTime').d('日期时间'),
    DATE: intl.get('hrpt.reportDesign.dataType.date').d('日期'),
    TIME: intl.get('hrpt.reportDesign.dataType.Time').d('时间'),
    VARCHAR: intl.get('hrpt.reportDesign.dataType.string').d('文本'),
    LONGTEXT: intl.get('hrpt.reportDesign.dataType.string').d('文本'),
  };
  return typeMeaningObj[dataType.toUpperCase()] || typeMeaningObj.VARCHAR;
};

export const renderDataType = (dataType) => {
  let color = '#f50';
  switch (dataType) {
    case 'NUMBER':
    case 'DECIMAL':
    case 'BIGINT':
      color = 'blue';
      break;
    case 'DATETIME':
      color = 'magenta';
      break;
    case 'DATE':
      color = 'volcano';
      break;
    case 'TIME':
      color = 'yellow';
      break;
    case 'VARCHAR':
    case 'LONGTEXT':
    default:
      color = 'green';
      break;
  }
  return <Tag color={color}>{getDataTypeMeaning(dataType)}</Tag>;
};

export const getContextFields = () => {
  return [
    {
      text: intl.get('hpfm.customize.common.organizationId').d('采购方租户'),
      value: 'organizationId',
      dataType: 'VARCHAR',
    },
    {
      text: intl.get('hpfm.customize.common.tenantId').d('供应商租户'),
      value: 'tenantId',
      dataType: 'VARCHAR',
    },
    {
      text: intl.get('hpfm.customize.common.loginName').d('登录名'),
      value: 'loginName',
      dataType: 'VARCHAR',
    },
    {
      text: intl.get('hpfm.customize.common.realName').d('账户名'),
      value: 'realName',
      dataType: 'VARCHAR',
    },
  ];
};

export const getSpecialValueList = () => {
  return [
    {
      value: '\n',
      name: 'newLine',
      title: intl.get('hrpt.reportDesign.view.title.newLineChart').d('换行符'),
    },
  ];
};

export const systemCodes = {
  MERGE_CELL_IMPLICT_FIXED: window.luckysheet && window.luckysheet.MERGE_CELL_IMPLICT_FIXED || 0b10000001,
  PIC_LIMIT_JPG_OR_PNG: window.luckysheet && window.luckysheet.PIC_LIMIT_JPG_OR_PNG || 0b10000010,
  MERGE_CELL_IMPLICT_REPEART_TITLE: window.luckysheet && window.luckysheet.MERGE_CELL_IMPLICT_REPEART_TITLE || 0b10000011,
  MERGE_CELL_IMPLICT_TOTAL_RANGE: window.luckysheet && window.luckysheet.MERGE_CELL_IMPLICT_TOTAL_RANGE || 0b10000111,
};

export const BLOCK_COLOR = [
  'rgba(242, 85, 53, 1)',
  'rgba(58, 180, 69, 1)',
  'rgba(25, 132, 247, 1)',
  'rgba(62, 78, 179, 1)',
  'rgba(47, 116, 182, 1)',
];

export const getFieldSvg = (type, fillStyle) => {
  switch (type) {
    case 'header':
      return (
        <svg
          t="1656568546672"
          className="icon"
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          p-id="2209"
          width="14"
          height="14"
          fill={fillStyle}
        >
          <path
            d="M512 0c-215.808 0-448 65.056-448 208l0 608c0 142.88 232.192 208 448 208s448-65.12 448-208l0-608c0-142.944-232.256-208-448-208zM896 816c0 79.488-171.936 144-384 144-212.096 0-384-64.512-384-144l0-119.552c66.112 68.128 225.6 103.552 384 103.552s317.888-35.424 384-103.552l0 119.552zM896 624l-0.128 0c0 0.32 0.128 0.672 0.128 0.992 0 79.008-171.936 143.008-384 143.008s-384-64-384-143.008c0-0.32 0.128-0.672 0.128-0.992l-0.128 0 0-119.552c66.112 68.128 225.6 103.552 384 103.552s317.888-35.424 384-103.552l0 119.552zM896 432l-0.128 0c0 0.32 0.128 0.672 0.128 0.992 0 79.008-171.936 143.008-384 143.008s-384-64-384-143.008c0-0.32 0.128-0.672 0.128-0.992l-0.128 0 0-109.952c83.872 63.904 237.6 93.952 384 93.952s300.128-30.048 384-93.952l0 109.952zM512 352c-212.096 0-384-64.512-384-144 0-79.552 171.904-144 384-144 212.064 0 384 64.448 384 144 0 79.488-171.936 144-384 144zM768 832c0-17.664 14.336-32 32-32s32 14.336 32 32c0 17.664-14.336 32-32 32s-32-14.336-32-32zM768 640c0-17.664 14.336-32 32-32s32 14.336 32 32c0 17.664-14.336 32-32 32s-32-14.336-32-32zM768 448c0-17.664 14.336-32 32-32s32 14.336 32 32c0 17.664-14.336 32-32 32s-32-14.336-32-32z"
            p-id="2210"
          />
        </svg>
      );
    case 'object':
      return (
        <svg
          t="1657704581914"
          className="icon"
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          p-id="4587"
          width="14"
          height="14"
        >
          <path
            d="M341.333333 725.333333 42.666667 725.333333c-25.6 0-42.666667-17.066667-42.666667-42.666667L0 42.666667c0-25.6 17.066667-42.666667 42.666667-42.666667l640 0c25.6 0 42.666667 17.066667 42.666667 42.666667l0 298.666667c0 25.6-17.066667 42.666667-42.666667 42.666667s-42.666667-17.066667-42.666667-42.666667L640 85.333333 85.333333 85.333333l0 554.666667 256 0c25.6 0 42.666667 17.066667 42.666667 42.666667S366.933333 725.333333 341.333333 725.333333z"
            p-id="4588"
          />
          <path
            d="M981.333333 1024 341.333333 1024c-25.6 0-42.666667-17.066667-42.666667-42.666667L298.666667 341.333333c0-25.6 17.066667-42.666667 42.666667-42.666667l640 0c25.6 0 42.666667 17.066667 42.666667 42.666667l0 640C1024 1006.933333 1006.933333 1024 981.333333 1024zM384 938.666667l554.666667 0L938.666667 384 384 384 384 938.666667z"
            p-id="4589"
          />
        </svg>
      );
    case 'NUMBER':
    case 'DECIMAL':
    case 'BIGINT':
      return (
        <svg
          t="1656571487875"
          className="icon"
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          p-id="9270"
          width="14"
          height="14"
          fill={fillStyle}
        >
          <path
            d="M159.926857 689.426286h130.724572l-39.003429 193.718857c-0.859429 4.278857-1.28 9.435429-1.28 13.714286 0 20.992 14.555429 32.566857 34.706286 32.566857 20.571429 0 35.565714-11.154286 39.862857-32.146286l41.984-207.853714h202.715428L530.651429 883.145143c-1.28 4.278857-1.700571 9.435429-1.700572 13.714286 0 20.992 14.573714 32.566857 35.145143 32.566857s35.565714-11.154286 39.862857-32.146286L645.485714 689.426286h152.996572c23.570286 0 39.862857-17.133714 39.862857-40.283429 0-18.852571-12.854857-34.285714-32.146286-34.285714h-145.298286L706.377143 388.571429h149.997714c23.588571 0 39.862857-17.152 39.862857-40.283429 0-18.852571-12.854857-34.285714-32.146285-34.285714h-142.72l35.145142-172.726857c0.420571-2.56 1.28-8.137143 1.28-13.714286 0-20.992-14.994286-32.987429-35.565714-32.987429-23.990857 0-34.706286 13.275429-39.003428 33.426286l-37.705143 186.002286H442.788571l35.145143-172.726857c0.420571-2.56 1.28-8.137143 1.28-13.714286 0-20.992-15.433143-32.987429-35.565714-32.987429-24.429714 0-35.584 13.275429-39.442286 33.426286l-37.705143 186.002286h-140.580571c-23.570286 0-39.862857 17.993143-39.862857 41.563428 0 19.291429 12.873143 33.005714 32.164571 33.005715h133.284572l-45.44 226.285714h-138.422857c-23.588571 0-39.862857 17.993143-39.862858 41.563428 0 19.291429 12.854857 33.005714 32.146286 33.005715z m221.988572-74.569143l45.878857-226.285714H630.491429l-45.842286 226.285714z"
            p-id="9271"
          />
        </svg>
      );
    case 'date':
    case 'DATE':
      return (
        <svg
          t="1656571411155"
          className="icon"
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          p-id="7360"
          width="14"
          height="14"
          fill={fillStyle}
        >
          <path
            d="M128 384v512h768V192h-128v32q0 14.016-8.992 23.008T736 256t-23.008-8.992T704 224V192H320v32q0 14.016-8.992 23.008T288 256t-23.008-8.992T256 224V192H128v128h768v64H128z m192-256h384V96q0-14.016 8.992-23.008T736 64t23.008 8.992T768 96v32h160q14.016 0 23.008 8.992T960 160v768q0 14.016-8.992 23.008T928 960H96q-14.016 0-23.008-8.992T64 928V160q0-14.016 8.992-23.008T96 128h160V96q0-14.016 8.992-23.008T288 64t23.008 8.992T320 96v32zM288 512h64q14.016 0 23.008 8.992T384 544t-8.992 23.008T352 576H288q-14.016 0-23.008-8.992T256 544t8.992-23.008T288 512z m0 192h64q14.016 0 23.008 8.992T384 736t-8.992 23.008T352 768H288q-14.016 0-23.008-8.992T256 736t8.992-23.008T288 704z m192-192h64q14.016 0 23.008 8.992T576 544t-8.992 23.008T544 576h-64q-14.016 0-23.008-8.992T448 544t8.992-23.008T480 512z m0 192h64q14.016 0 23.008 8.992T576 736t-8.992 23.008T544 768h-64q-14.016 0-23.008-8.992T448 736t8.992-23.008T480 704z m192-192h64q14.016 0 23.008 8.992T768 544t-8.992 23.008T736 576h-64q-14.016 0-23.008-8.992T640 544t8.992-23.008T672 512z m0 192h64q14.016 0 23.008 8.992T768 736t-8.992 23.008T736 768h-64q-14.016 0-23.008-8.992T640 736t8.992-23.008T672 704z"
            p-id="7361"
          />
        </svg>
      );
    case 'DATETIME':
      return (
        <svg
          t="1662626842483"
          className="icon"
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          p-id="2252"
          width="14"
          height="14"
          fill={fillStyle}
        >
          <path
            d="M464 928H176A96 96 0 0 1 80 832V384h768v64a32 32 0 0 0 64 0V256a160 160 0 0 0-160-160h-64v-64a32 32 0 0 0-64 0v64h-320v-64a32 32 0 0 0-64 0v64h-64A160 160 0 0 0 16 256v576a160 160 0 0 0 160 160H464a32 32 0 0 0 0-64zM80 256a96 96 0 0 1 96-96h64v64a32 32 0 0 0 64 0v-64h320v64a32 32 0 0 0 64 0v-64h64A96 96 0 0 1 848 256v64H80z"
            p-id="2253"
          />
          <path
            d="M336 832a32 32 0 0 0 32-32v-320A32 32 0 0 0 336 448H272a32 32 0 0 0 0 64h32v288a32 32 0 0 0 32 32zM752 512a256 256 0 1 0 256 256 256 256 0 0 0-256-256z m0 448a192 192 0 1 1 192-192 192 192 0 0 1-192 192z"
            p-id="2254"
          />
          <path
            d="M784 730.88v-58.88a32 32 0 0 0-64 0v64a32.64 32.64 0 0 0 5.76 17.28 30.08 30.08 0 0 0 8.96 18.56l90.24 90.24a32 32 0 0 0 45.44 0 32 32 0 0 0 0-44.8z"
            p-id="2255"
          />
        </svg>
      );
    case 'TIME':
    case 'time':
      return (
        <svg
          t="1662626894507"
          className="icon"
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          p-id="3217"
          width="14"
          height="14"
          fill={fillStyle}
        >
          <path
            d="M949.638897 509.757936c0-241.799068-196.006116-437.805184-437.805184-437.805184-241.800092 0-437.806207 196.006116-437.806207 437.805184 0 241.811348 196.006116 437.817464 437.806207 437.817464 99.262748 0 190.149734-33.771151 263.59242-89.425705 3.015683-3.421936 4.999874-7.789407 4.999874-12.698207 0-10.717086-8.692986-19.407002-19.408025-19.407002-5.562692 0-10.513448 2.207271-14.048971 5.944386l-0.246617 0c-65.719794 48.358381-146.610102 77.313853-234.459916 77.313853-218.947618 0-396.469754-177.544649-396.469754-396.482033 0-218.97013 177.522136-396.470777 396.469754-396.470777 218.969107 0 396.469754 177.500647 396.469754 396.470777 0 66.865897-15.692401 129.814578-44.962028 185.110975l0 0.325411c-0.538259 1.845021-1.12359 3.645017-1.12359 5.627161 0 10.719132 8.688893 19.407002 19.407002 19.407002 8.353248 0 15.331173-5.357008 18.055215-12.742209l0 0.135076C931.289993 650.424676 949.638897 582.250994 949.638897 509.757936zM506.813373 276.017404c0-11.527544-9.367345-20.892843-20.917402-20.892843-11.527544 0-20.892843 9.365298-20.892843 20.892843l0 248.508887c0 0-2.520403 42.010813 41.786709 41.785685L731.994971 566.311976c0.068562 0 0.156566 0.045025 0.228197 0.045025 11.546987 0 20.914332-9.364275 20.914332-20.891819s-9.367345-20.892843-20.892843-20.938891L506.79086 524.526291 506.79086 276.153504C506.79086 276.108478 506.813373 276.06243 506.813373 276.017404z"
            p-id="3218"
          />
        </svg>
      );
    case 'VARCHAR':
    case 'LONGTEXT':
    default:
      return (
        <svg
          t="1656571312279"
          className="icon"
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          p-id="4534"
          width="14"
          height="14"
          fill={fillStyle}
        >
          <path
            d="M853.333333 1024 170.666667 1024c-93.866667 0-170.666667-76.8-170.666667-170.666667L0 170.666667c0-93.866667 76.8-170.666667 170.666667-170.666667l682.666667 0c93.866667 0 170.666667 76.8 170.666667 170.666667l0 682.666667C1024 947.2 947.2 1024 853.333333 1024zM170.666667 85.333333C123.733333 85.333333 85.333333 123.733333 85.333333 170.666667l0 682.666667c0 46.933333 38.4 85.333333 85.333333 85.333333l682.666667 0c46.933333 0 85.333333-38.4 85.333333-85.333333L938.666667 170.666667c0-46.933333-38.4-85.333333-85.333333-85.333333L170.666667 85.333333z"
            p-id="4535"
          />
          <path
            d="M725.333333 341.333333 298.666667 341.333333C273.066667 341.333333 256 324.266667 256 298.666667s17.066667-42.666667 42.666667-42.666667l426.666667 0c25.6 0 42.666667 17.066667 42.666667 42.666667S750.933333 341.333333 725.333333 341.333333z"
            p-id="4536"
          />
          <path
            d="M298.666667 384C273.066667 384 256 366.933333 256 341.333333L256 298.666667c0-25.6 17.066667-42.666667 42.666667-42.666667s42.666667 17.066667 42.666667 42.666667l0 42.666667C341.333333 366.933333 324.266667 384 298.666667 384z"
            p-id="4537"
          />
          <path
            d="M725.333333 384c-25.6 0-42.666667-17.066667-42.666667-42.666667L682.666667 298.666667c0-25.6 17.066667-42.666667 42.666667-42.666667s42.666667 17.066667 42.666667 42.666667l0 42.666667C768 366.933333 750.933333 384 725.333333 384z"
            p-id="4538"
          />
          <path
            d="M512 768c-25.6 0-42.666667-17.066667-42.666667-42.666667L469.333333 298.666667c0-25.6 17.066667-42.666667 42.666667-42.666667s42.666667 17.066667 42.666667 42.666667l0 426.666667C554.666667 750.933333 537.6 768 512 768z"
            p-id="4539"
          />
          <path
            d="M554.666667 768l-85.333333 0c-25.6 0-42.666667-17.066667-42.666667-42.666667s17.066667-42.666667 42.666667-42.666667l85.333333 0c25.6 0 42.666667 17.066667 42.666667 42.666667S580.266667 768 554.666667 768z"
            p-id="4540"
          />
        </svg>
      );
  }
};
