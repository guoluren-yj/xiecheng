import { DataSet } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { runInAction } from "mobx";

import fontBoldSvg from '@/assets/sheet/fontBold.svg';
import italicSvg from '@/assets/sheet/italic.svg';
import deleteLineSvg from '@/assets/sheet/deleteLine.svg';
import underLineSvg from '@/assets/sheet/underLine.svg';

export const CUSTOM_FONT_ATTRIBUTE = [
  { key: 'bold', icon: fontBoldSvg },
  { key: 'italic', icon: italicSvg },
  { key: 'deleteLine', icon: deleteLineSvg },
  { key: 'underLine', icon: underLineSvg },
];

export function getFormatValueType() {
  return [{ value: 'min', meaning: intl.get('hrpt.reportDesign.option.minValue').d('最小值') },
    { value: 'max', meaning: intl.get('hrpt.reportDesign.option.maxValue').d('最大值') },
    { value: 'gt', meaning: intl.get('hrpt.reportDesign.option.biggerThan').d('大于') },
    { value: 'lt', meaning: intl.get('hrpt.reportDesign.option.lessThan').d('小于') },
    { value: 'eq', meaning: intl.get('hrpt.reportDesign.option.equal').d('等于') },
    { value: 'neq', meaning: intl.get('hrpt.reportDesign.option.noEuqal').d('不等于') },
    { value: 'gte', meaning: intl.get('hrpt.reportDesign.option.biggerOrEqual').d('大于或等于') },
    { value: 'lte', meaning: intl.get('hrpt.reportDesign.option.lessOrEqual').d('小于或等于') },
    { value: 'with', meaning: intl.get('hrpt.reportDesign.option.stringInclude').d('文本包含') },
    { value: 'notWith', meaning: intl.get('hrpt.reportDesign.option.stringNotInclude').d('文本不包含') },
    { value: '=', meaning: intl.get('hrpt.reportDesign.option.stringEqual').d('文本等于') },
    { value: 'null', meaning: intl.get('hrpt.reportDesign.option.nullCell').d('单元格为空') },
    { value: 'notNull', meaning: intl.get('hrpt.reportDesign.option.notNullCell').d('单元格有内容') }];
}

export function getFormatOptions() {
  return {
    1: {
      meaning: intl
        .get('hrpt.reportDesign.view.option.redBackgroundAndRedText')
        .d('淡红色填充+深红色文本'),
      style: {
        fc: 'rgb(222, 50, 44)',
        bg: 'rgb(255, 233, 232)',
      },
      showStyle: {
        color: 'rgb(222, 50, 44)',
        backgroundColor: 'rgb(255, 233, 232)',
      },
    },
    2: {
      meaning: intl
        .get('hrpt.reportDesign.view.option.yellowBackgroundAndYellowText')
        .d('淡黄色填充+深黄色文本'),
      style: { fc: 'rgb(191, 113, 29)', bg: 'rgb(254, 251, 198)' },
      showStyle: {
        color: 'rgb(191, 113, 29)',
        backgroundColor: 'rgb(254, 251, 198)',
      },
    },
    3: {
      meaning: intl
        .get('hrpt.reportDesign.view.option.greenBackgroundAndGreenText')
        .d('淡绿色填充+深绿色文本'),
      style: { fc: 'rgb(0, 170, 91)', bg: 'rgb(238, 252, 222)' },
      showStyle: {
        color: 'rgb(0, 170, 91)',
        backgroundColor: 'rgb(238, 252, 222)',
      },
    },
    4: {
      meaning: intl
        .get('hrpt.reportDesign.view.option.greyBackgroundAndGreyText')
        .d('淡灰色填充+深灰色文本'),
      style: { fc: 'rgb(194, 194, 194)', bg: 'rgb(245, 245, 245)' },
      showStyle: {
        color: 'rgb(194, 194, 194)',
        backgroundColor: 'rgb(245, 245, 245)',
      },
    },
    5: {
      meaning: intl.get('hrpt.reportDesign.view.option.redText').d('红色文本'),
      style: { fc: 'rgb(222, 50, 44)' },
      showStyle: {
        color: 'rgb(222, 50, 44)',
        border: '1px solid rgb(245, 245, 245)',
      },
    },
    // 6: {
    //   meaning: intl.get('hrpt.reportDesign.view.option.greyTextAndDeleteLine').d('灰色文本+删除线'),
    //   style: {
    //     fc: 'rgb(194, 194, 194)',
    //     textDecoration: 'line-through',
    //   },
    //   showStyle: {
    //     color: 'rgb(222, 50, 44)',
    //     border: '1px solid rgb(245, 245, 245)',
    //   },
    // },
    custom: {
      meaning: intl.get('hrpt.reportDesign.view.option.customFormatPreview').d('自定义格式预览'),
      style: {},
      showStyle: {
        border: '1px solid rgb(245, 245, 245)',
      },
    },
  };
}

export function transformStyle(style) {
  const newStyle = {};
  for (const attr in style) {
    const value = style[attr];
    switch (attr) {
      case 'bold':
        if (value === 1) {
          newStyle.fontWeight = 'bold';
        }
        break;
      case 'italic':
        if (value === 1) {
          newStyle.fontStyle = 'italic';
        }
        break;
      case 'deleteLine':
        if (value !== 1) {
          break;
        }
        if (newStyle.textDecoration) {
          newStyle.textDecoration += ' line-through';
        } else {
          newStyle.textDecoration = 'line-through';
        }
        break;
      case 'underLine':
        if (value !== 1) {
          break;
        }
        if (newStyle.textDecoration) {
          newStyle.textDecoration += ' underLine';
        } else {
          newStyle.textDecoration = 'underLine';
        }
        break;
      case 'fc':
        newStyle.color = value;
        break;
      case 'bg':
        newStyle.backgroundColor = value;
        break;
      default:
        break;
    }
  }
  return newStyle;
}

export function getEditorFormDs() {
  return {
    autoCreate: true,
    events: {
      update: ({ name, record }) => {
        runInAction(() => {
          if (name === "type") {
            record.init("valueType", undefined);
            record.init("targetValue", undefined);
          } else if (name === 'valueType') {
            record.init('targetValue', undefined);
          } else if (name === 'variable') {
            record.init("valueType", undefined);
            record.init("targetValue", undefined);
          }
        });
      },
    },
    fields: [
      {
        name: 'range',
        readOnly: true,
        // pattern: /^[A-Z][A-Z0-9:]+$/, // 正则校验
        // validator: (value, name, record) => {
        //   if (!/^[A-Z][A-Z0-9:]+$/.test(value)) {
        //     return intl
        //       .get('hrpt.reportDesign.view.message.rangeNotValid')
        //       .d('请输入有效的应用范围,如”A2:D6“');
        //   }
        // },
      },
      {
        name: "type",
        required: true,
        defaultValue: 'number',
        placeholder: intl.get('hrpt.reportDesign.view.message.pleaseSelect').d('请选择'),
        options: new DataSet({
          selection: "single",
          paging: false,
          data: [
            {
              value: 'number',
              meaning: intl.get('hrpt.reportDesign.option.numberType').d('数值类'),
            },
            {
              value: 'string',
              meaning: intl.get('hrpt.reportDesign.option.stringType').d('文本类'),
            },
          ],
        }),
      },
      {
        name: 'variable',
        type: 'object',
        required: true,
      },
      {
        name: 'valueType',
        required: true,
        computedProps: {
          options: ({ record }) => {
            let data = [];
            switch(record ? record.get('type') : "number") {
              case "number":
                data.push(
                  { value: 'min', meaning: intl.get('hrpt.reportDesign.option.minValue').d('最小值') },
                  { value: 'max', meaning: intl.get('hrpt.reportDesign.option.maxValue').d('最大值') },
                  { value: 'gt', meaning: intl.get('hrpt.reportDesign.option.biggerThan').d('大于') },
                  { value: 'lt', meaning: intl.get('hrpt.reportDesign.option.lessThan').d('小于') },
                  { value: 'eq', meaning: intl.get('hrpt.reportDesign.option.equal').d('等于') },
                  { value: 'neq', meaning: intl.get('hrpt.reportDesign.option.noEuqal').d('不等于') },
                  { value: 'gte', meaning: intl.get('hrpt.reportDesign.option.biggerOrEqual').d('大于或等于') },
                  { value: 'lte', meaning: intl.get('hrpt.reportDesign.option.lessOrEqual').d('小于或等于') }
                );
                break;
              case "string":
                data.push(
                  { value: 'with', meaning: intl.get('hrpt.reportDesign.option.stringInclude').d('文本包含') },
                  { value: 'notWith', meaning: intl.get('hrpt.reportDesign.option.stringNotInclude').d('文本不包含') },
                  { value: '=', meaning: intl.get('hrpt.reportDesign.option.stringEqual').d('文本等于') },
                  { value: 'null', meaning: intl.get('hrpt.reportDesign.option.nullCell').d('单元格为空') },
                  { value: 'notNull', meaning: intl.get('hrpt.reportDesign.option.notNullCell').d('单元格有内容') },
                );
                break;
            }
            return new DataSet({
              selection: 'single',
              paging: false,
              data,
            });
          },
        },
      },
      {
        name: 'targetValue',
        computedProps: {
          required: ({ record }) => {
            return !['null', 'notNull', 'min', 'max'].includes(record ? record.get('valueType') : undefined);
          },
          type: ({ record }) => {
            return record ? record.get('type') : "number";
          },
          placeholder: ({ record }) => {
            switch (record ? record.get('type') : "number") {
              case 'number':
                return intl.get('hrpt.reportDesign.option.number').d('数值');
              case 'string':
                return intl.get('hrpt.reportDesign.option.string').d('文本');
              default:
                return undefined;
            }
          },
        },
      },
      {
        name: 'showAs',
        // required: true,
      },
    ],
  };
}
