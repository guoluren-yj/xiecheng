import intl from 'srm-front-boot/lib/utils/intl';

// 定义维护自定义icon-picker组件前端枚举数据
export interface IChildren {
  title: string; // 字段类型标题
  value: any; // 字段类型值
  iconName: string; // 字段类型图标名称
  componentName: string; // 在fieldComponents下的组件名
  key?: any; // 唯一key
  description?: string; // 示例描述
  exampleIconName?: string; // 示例图标名称
  style?: {
    height: number | string;
    width: number | string;
  };
}
export interface IDataSource {
  tabName: string; // tab标题
  key?: string; // 唯一key
  children: IChildren[]; // 子集
}

const prefixMessage = `hmde.domainOwnBOList.view.message`;
// 基础类字段
export const baseFieldTypeEnums = [
  {
    title: intl.get(`${prefixMessage}.fieldType.textField`).d('文本'),
    value: 'TEXT_FIELD',
    iconName: 'textField.svg',
    componentName: 'CommonField',
    key: 'TEXT_FIELD',
    description: intl.get(`hmde.domainOwnBOList.fieldType.textField.help`).d('允许用户输入任何字母和数字组合'),
    exampleIconName: 'shili-text@2X.png',
    style: {
      height: 60,
      width: '100%',
    },
  },
  {
    title: intl.get(`${prefixMessage}.fieldType.textArea`).d('多行文本'),
    value: 'TEXT_AREA',
    iconName: 'textArea.svg',
    componentName: 'CommonField',
    key: 'TEXT_AREA',
    description: intl.get(`hmde.domainOwnBOList.fieldType.textArea.help`).d('允许用户输入多行文本'),
    exampleIconName: 'shili-mtext@2X.png',
    style: {
      height: 112,
      width: '100%',
    },
  },
  {
    title: intl.get(`${prefixMessage}.fieldType.numberField`).d('整数'),
    value: 'NUMBER_FIELD',
    iconName: 'numberField.svg',
    componentName: 'CommonField',
    key: 'NUMBER_FIELD',
    description: intl.get(`hmde.domainOwnBOList.fieldType.numberField.help`).d('允许用户输入整数'),
    exampleIconName: 'shili-integer@2X.png',
    style: {
      height: 60,
      width: '100%',
    },
  },
  {
    title: intl.get(`${prefixMessage}.fieldType.float`).d('浮点'),
    value: 'FLOAT',
    iconName: 'float.svg',
    componentName: 'CommonField',
    key: 'FLOAT',
    description: intl.get(`hmde.domainOwnBOList.fieldType.float.help`).d('允许用户输入浮点数'),
    exampleIconName: 'shili-integer@2X.png',
    style: {
      height: 60,
      width: '100%',
    },
  },
  {
    title: intl.get(`${prefixMessage}.fieldType.percentage`).d('百分数'),
    value: 'PERCENTAGE',
    iconName: 'percentage.svg',
    componentName: 'CommonField',
    key: 'PERCENTAGE',
    description: intl.get(`hmde.domainOwnBOList.fieldType.percentage.help`).d('允许用户输入百分数'),
    exampleIconName: 'shili-percentage@2X.png',
    style: {
      height: 60,
      width: '100%',
    },
  },
  {
    title: intl.get(`${prefixMessage}.fieldType.dateSelectionBox`).d('日期'),
    value: 'DATE_SELECTION_BOX',
    iconName: 'dateSelectionBox.svg',
    componentName: 'CommonField',
    key: 'DATE_SELECTION_BOX',
    description: intl.get(`hmde.domainOwnBOList.fieldType.dateSelectionBox.help`).d('允许用户选择日期，如：2021-07-01'),
    exampleIconName: 'shili-date@2X.png',
    style: {
      height: 372,
      width: '100%',
    },
  },
  {
    title: intl.get(`${prefixMessage}.fieldType.dateTimeSelectionBox`).d('日期时间'),
    value: 'DATETIME_SELECTION_BOX',
    iconName: 'dateTimeSelectionBox.svg',
    componentName: 'CommonField',
    key: 'DATETIME_SELECTION_BOX',
    description: intl.get(`hmde.domainOwnBOList.fieldType.dateTimeSelectionBox.help`).d('允许用户选择日期及时间，如：2021-07-01  00:00:00'),
    exampleIconName: 'shili-time@2X.png',
    style: {
      height: 643,
      width: '100%',
    },
  },
  {
    title: intl.get(`${prefixMessage}.fieldType.singleSelect`).d('下拉单选'),
    value: 'SINGLE_SELECT',
    iconName: 'singleSelect.svg',
    componentName: 'select',
    key: 'SINGLE_SELECT',
    description: intl.get(`hmde.domainOwnBOList.fieldType.singleSelect.help`).d('允许用户以下拉框形式选择值列表内的单个值'),
    exampleIconName: 'shili-Select-radio@2X.png',
    style: {
      height: 268,
      width: '100%',
    },
  },
  {
    title: intl.get(`${prefixMessage}.fieldType.multipleSelect`).d('下拉多选'),
    value: 'MULTIPLE_SELECT',
    iconName: 'multipleSelect.svg',
    componentName: 'select',
    key: 'MULTIPLE_SELECT',
    description: intl.get(`hmde.domainOwnBOList.fieldType.multipleSelect.help`).d('允许用户以下拉框形式选择值列表内的多个值'),
    exampleIconName: 'shili-Select-Checkbox@2X.png',
    style: {
      height: 318,
      width: '100%',
    },
  },
  {
    title: intl.get(`${prefixMessage}.fieldType.radio`).d('单选'),
    value: 'RADIO',
    iconName: 'radio.svg',
    componentName: 'select',
    key: 'RADIO',
    description: intl.get(`hmde.domainOwnBOList.fieldType.radio.help`).d('允许用户以单选组件形式选择单一选项'),
    exampleIconName: 'shili-radio@2X.png',
    style: {
      height: 60,
      width: '100%',
    },
  },
  {
    title: intl.get(`${prefixMessage}.fieldType.checkbox`).d('复选'),
    value: 'CHECKBOX',
    iconName: 'checkbox.svg',
    componentName: 'select',
    key: 'CHECKBOX',
    description: intl.get(`hmde.domainOwnBOList.fieldType.checkbox.help`).d('允许用户以多选组件形式选择多个选项'),
    exampleIconName: 'shili-Checkbox@2X.png',
    style: {
      height: 60,
      width: '100%',
    },
  },
  {
    title: intl.get(`${prefixMessage}.fieldType.switch`).d('开关'),
    value: 'SWITCH',
    iconName: 'switch.svg',
    componentName: 'CommonField',
    key: 'SWITCH',
    description: intl.get(`hmde.domainOwnBOList.fieldType.switch.help`).d('允许用户选择开启/关闭，对应值为true/false'),
    exampleIconName: 'shili-switch@2X.png',
    style: {
      height: 60,
      width: '100%',
    },
  },
];

export const getBaseFieldTypeEnums = () => [
  {
    title: intl.get(`${prefixMessage}.fieldType.textField`).d('文本'),
    value: 'TEXT_FIELD',
    iconName: 'textField.svg',
    componentName: 'CommonField',
    key: 'TEXT_FIELD',
    description: intl.get(`hmde.domainOwnBOList.fieldType.textField.help`).d('允许用户输入任何字母和数字组合'),
    exampleIconName: 'shili-text@2X.png',
    style: {
      height: 60,
      width: '100%',
    },
  },
  {
    title: intl.get(`${prefixMessage}.fieldType.textArea`).d('多行文本'),
    value: 'TEXT_AREA',
    iconName: 'textArea.svg',
    componentName: 'CommonField',
    key: 'TEXT_AREA',
    description: intl.get(`hmde.domainOwnBOList.fieldType.textArea.help`).d('允许用户输入多行文本'),
    exampleIconName: 'shili-mtext@2X.png',
    style: {
      height: 112,
      width: '100%',
    },
  },
  {
    title: intl.get(`${prefixMessage}.fieldType.numberField`).d('整数'),
    value: 'NUMBER_FIELD',
    iconName: 'numberField.svg',
    componentName: 'CommonField',
    key: 'NUMBER_FIELD',
    description: intl.get(`hmde.domainOwnBOList.fieldType.numberField.help`).d('允许用户输入整数'),
    exampleIconName: 'shili-integer@2X.png',
    style: {
      height: 60,
      width: '100%',
    },
  },
  {
    title: intl.get(`${prefixMessage}.fieldType.float`).d('浮点'),
    value: 'FLOAT',
    iconName: 'float.svg',
    componentName: 'CommonField',
    key: 'FLOAT',
    description: intl.get(`hmde.domainOwnBOList.fieldType.float.help`).d('允许用户输入浮点数'),
    exampleIconName: 'shili-integer@2X.png',
    style: {
      height: 60,
      width: '100%',
    },
  },
  {
    title: intl.get(`${prefixMessage}.fieldType.percentage`).d('百分数'),
    value: 'PERCENTAGE',
    iconName: 'percentage.svg',
    componentName: 'CommonField',
    key: 'PERCENTAGE',
    description: intl.get(`hmde.domainOwnBOList.fieldType.percentage.help`).d('允许用户输入百分数'),
    exampleIconName: 'shili-percentage@2X.png',
    style: {
      height: 60,
      width: '100%',
    },
  },
  {
    title: intl.get(`${prefixMessage}.fieldType.dateSelectionBox`).d('日期'),
    value: 'DATE_SELECTION_BOX',
    iconName: 'dateSelectionBox.svg',
    componentName: 'CommonField',
    key: 'DATE_SELECTION_BOX',
    description: intl.get(`hmde.domainOwnBOList.fieldType.dateSelectionBox.help`).d('允许用户选择日期，如：2021-07-01'),
    exampleIconName: 'shili-date@2X.png',
    style: {
      height: 372,
      width: '100%',
    },
  },
  {
    title: intl.get(`${prefixMessage}.fieldType.dateTimeSelectionBox`).d('日期时间'),
    value: 'DATETIME_SELECTION_BOX',
    iconName: 'dateTimeSelectionBox.svg',
    componentName: 'CommonField',
    key: 'DATETIME_SELECTION_BOX',
    description: intl.get(`hmde.domainOwnBOList.fieldType.dateTimeSelectionBox.help`).d('允许用户选择日期及时间，如：2021-07-01  00:00:00'),
    exampleIconName: 'shili-time@2X.png',
    style: {
      height: 643,
      width: '100%',
    },
  },
  {
    title: intl.get(`${prefixMessage}.fieldType.singleSelect`).d('下拉单选'),
    value: 'SINGLE_SELECT',
    iconName: 'singleSelect.svg',
    componentName: 'select',
    key: 'SINGLE_SELECT',
    description: intl.get(`hmde.domainOwnBOList.fieldType.singleSelect.help`).d('允许用户以下拉框形式选择值列表内的单个值'),
    exampleIconName: 'shili-Select-radio@2X.png',
    style: {
      height: 268,
      width: '100%',
    },
  },
  {
    title: intl.get(`${prefixMessage}.fieldType.multipleSelect`).d('下拉多选'),
    value: 'MULTIPLE_SELECT',
    iconName: 'multipleSelect.svg',
    componentName: 'select',
    key: 'MULTIPLE_SELECT',
    description: intl.get(`hmde.domainOwnBOList.fieldType.multipleSelect.help`).d('允许用户以下拉框形式选择值列表内的多个值'),
    exampleIconName: 'shili-Select-Checkbox@2X.png',
    style: {
      height: 318,
      width: '100%',
    },
  },
  {
    title: intl.get(`${prefixMessage}.fieldType.radio`).d('单选'),
    value: 'RADIO',
    iconName: 'radio.svg',
    componentName: 'select',
    key: 'RADIO',
    description: intl.get(`hmde.domainOwnBOList.fieldType.radio.help`).d('允许用户以单选组件形式选择单一选项'),
    exampleIconName: 'shili-radio@2X.png',
    style: {
      height: 60,
      width: '100%',
    },
  },
  {
    title: intl.get(`${prefixMessage}.fieldType.checkbox`).d('复选'),
    value: 'CHECKBOX',
    iconName: 'checkbox.svg',
    componentName: 'select',
    key: 'CHECKBOX',
    description: intl.get(`hmde.domainOwnBOList.fieldType.checkbox.help`).d('允许用户以多选组件形式选择多个选项'),
    exampleIconName: 'shili-Checkbox@2X.png',
    style: {
      height: 60,
      width: '100%',
    },
  },
  {
    title: intl.get(`${prefixMessage}.fieldType.switch`).d('开关'),
    value: 'SWITCH',
    iconName: 'switch.svg',
    componentName: 'CommonField',
    key: 'SWITCH',
    description: intl.get(`hmde.domainOwnBOList.fieldType.switch.help`).d('允许用户选择开启/关闭，对应值为true/false'),
    exampleIconName: 'shili-switch@2X.png',
    style: {
      height: 60,
      width: '100%',
    },
  },
];

// 业务类字段
export const businessFieldTypeEnums = [
  {
    title: intl.get(`${prefixMessage}.fieldType.money`).d('金额'),
    value: 'MONEY',
    iconName: 'money.svg',
    componentName: 'CommonField',
    key: 'MONEY',
    description: '允许用户输入金额，支持千分位符号，如：99,998.88',
    exampleIconName: 'shili-money@2X.png',
    style: {
      height: 60,
      width: '100%',
    },
  },
  {
    title: intl.get(`${prefixMessage}.fieldType.phoneNumber`).d('手机号码'),
    value: 'PHONE_NUMBER',
    iconName: 'phoneNumber.svg',
    componentName: 'CommonField',
    key: 'PHONE_NUMBER',
    description: '允许用户输入手机号，如：13100000000',
    exampleIconName: 'shili-phone-number@2X.png',
    style: {
      height: 60,
      width: '100%',
    },
  },
  {
    title: intl.get(`${prefixMessage}.fieldType.mail`).d('电子邮箱'),
    value: 'EMAIL',
    iconName: 'mail.svg',
    componentName: 'CommonField',
    key: 'EMAIL',
    description: '允许用户输入电子邮箱地址，如：admin@163.com',
    exampleIconName: 'shili-mail@2X.png',
    style: {
      height: 60,
      width: '100%',
    },
  },
  {
    title: intl.get(`${prefixMessage}.fieldType.codingRules`).d('自动编号'),
    value: 'CODE_RULE',
    iconName: 'number.svg',
    componentName: 'CodingRules',
    key: 'CODE_RULE',
    description:
      '系统将根据用户自定义的编码规则格式生成序列编号，该编号对于每条新记录会自动递增，支持全局唯一或租户唯一，当前字段只读',
    exampleIconName: 'codingRule.png',
    style: {
      height: 60,
      width: '100%',
    },
  },
];

export const getBusinessFieldTypeEnums = () => [
  {
    title: intl.get(`${prefixMessage}.fieldType.money`).d('金额'),
    value: 'MONEY',
    iconName: 'money.svg',
    componentName: 'CommonField',
    key: 'MONEY',
    description: intl.get(`hmde.domainOwnBOList.fieldType.money.help`).d('允许用户输入金额，支持千分位符号，如：99,998.88'),
    exampleIconName: 'shili-money@2X.png',
    style: {
      height: 60,
      width: '100%',
    },
  },
  {
    title: intl.get(`${prefixMessage}.fieldType.phoneNumber`).d('手机号码'),
    value: 'PHONE_NUMBER',
    iconName: 'phoneNumber.svg',
    componentName: 'CommonField',
    key: 'PHONE_NUMBER',
    description: intl.get(`hmde.domainOwnBOList.fieldType.phoneNumber.help`).d('允许用户输入手机号，如：13100000000'),
    exampleIconName: 'shili-phone-number@2X.png',
    style: {
      height: 60,
      width: '100%',
    },
  },
  {
    title: intl.get(`${prefixMessage}.fieldType.mail`).d('电子邮箱'),
    value: 'EMAIL',
    iconName: 'mail.svg',
    componentName: 'CommonField',
    key: 'EMAIL',
    description: intl.get(`hmde.domainOwnBOList.fieldType.mail.help`).d('允许用户输入电子邮箱地址，如：admin@163.com'),
    exampleIconName: 'shili-mail@2X.png',
    style: {
      height: 60,
      width: '100%',
    },
  },
  {
    title: intl.get(`${prefixMessage}.fieldType.codingRules`).d('自动编号'),
    value: 'CODE_RULE',
    iconName: 'number.svg',
    componentName: 'CodingRules',
    key: 'CODE_RULE',
    description:
      intl.get(`hmde.domainOwnBOList.fieldType.codingRules.help`)
      .d('系统将根据用户自定义的编码规则格式生成序列编号，该编号对于每条新记录会自动递增，支持全局唯一或租户唯一，当前字段只读'),
    exampleIconName: 'codingRule.png',
    style: {
      height: 60,
      width: '100%',
    },
  },
];

// 高级类字段
export const seniorFieldTypeEnums = [
  {
    title: intl.get(`${prefixMessage}.fieldType.appendix`).d('附件'),
    value: 'APPENDIX',
    iconName: 'appendix.svg',
    componentName: 'CommonField',
    key: 'APPENDIX',
    description: '允许用户上传任何图片、音频、视频、文档等类型的附件',
    exampleIconName: 'shili-enclosure@2X.png',
    style: {
      height: 60,
      width: '100%',
    },
  },
  // {
  //   title: intl.get(`${prefixMessage}.fieldType.link`).d('超链接'),
  //   value: 'LINK',
  //   iconName: 'link.svg',
  //   componentName: 'CommonField',
  //   key: 'LINK',
  //   description: '允许用户输入任何有效的网址',
  //   exampleIconName: 'shili-Hyperlinks@2X.png',
  //   style: {
  //     height: 60,
  //     width: '100%',
  //   },
  // },
  {
    title: intl.get(`${prefixMessage}.fieldType.formula`).d('公式'),
    value: 'FORMULA',
    iconName: 'formula.svg',
    componentName: 'formula',
    key: 'FORMULA',
    description: '允许用户定义公式，返回公式执行结果，如：薪资=固定薪资-税额',
    exampleIconName: 'shili-formula@2X.png',
    style: {
      height: 60,
      width: '100%',
    },
  },
];

export const getSeniorFieldTypeEnums = () => [
  {
    title: intl.get(`${prefixMessage}.fieldType.appendix`).d('附件'),
    value: 'APPENDIX',
    iconName: 'appendix.svg',
    componentName: 'CommonField',
    key: 'APPENDIX',
    description: intl.get(`hmde.domainOwnBOList.fieldType.appendix.help`).d('允许用户上传任何图片、音频、视频、文档等类型的附件'),
    exampleIconName: 'shili-enclosure@2X.png',
    style: {
      height: 60,
      width: '100%',
    },
  },
  // {
  //   title: intl.get(`${prefixMessage}.fieldType.link`).d('超链接'),
  //   value: 'LINK',
  //   iconName: 'link.svg',
  //   componentName: 'CommonField',
  //   key: 'LINK',
  //   description: '允许用户输入任何有效的网址',
  //   exampleIconName: 'shili-Hyperlinks@2X.png',
  //   style: {
  //     height: 60,
  //     width: '100%',
  //   },
  // },
  {
    title: intl.get(`${prefixMessage}.fieldType.formula`).d('公式'),
    value: 'FORMULA',
    iconName: 'formula.svg',
    componentName: 'formula',
    key: 'FORMULA',
    description: intl.get(`hmde.domainOwnBOList.fieldType.formula.help`).d('允许用户定义公式，返回公式执行结果，如：薪资=固定薪资-税额'),
    exampleIconName: 'shili-formula@2X.png',
    style: {
      height: 60,
      width: '100%',
    },
  },
];

export const relationFieldTypeEnums = [
  {
    title: intl.get(`${prefixMessage}.fieldType.linkRelation`).d('关联关系'),
    value: 'LINK_RELATION',
    iconName: 'linkRelation.svg',
    componentName: 'CommonField',
    key: 'LINK_RELATION',
    description:
      '建立当前对象与目标对象的关联关系，例如：合同关联合同类型对象，当用户删除“关联业务对象”合同类型某一条记录时，系统将自动提醒存在相关联的合同记录，不允许用户删除该关联业务对象的记录',
    exampleIconName: 'shili-relation@2X.png',
    style: {
      height: 60,
      width: '100%',
    },
  },
  {
    title: intl.get(`${prefixMessage}.fieldType.masterRelation`).d('从主关系'),
    value: 'MASTER_RELATION',
    iconName: 'masterRelation.svg',
    componentName: 'CommonField',
    key: 'MASTER_RELATION',
    description:
      '建立当前对象与目标对象的从主关系，例如：合同明细(从)关联合同对象(主)，当用户删除“父业务对象”合同某一条记录时，系统将删除所有与之对应的“从对象”合同明细的记录',
    exampleIconName: 'shili-congzhu@2X.png',
    style: {
      height: 60,
      width: '100%',
    },
  },
  // {
  //   title: intl.get(`${prefixMessage}.fieldType.reference_field`).d('引用字段'),
  //   value: 'REFERENCE_FIELD',
  //   iconName: 'reference_field.svg',
  //   componentName: 'CommonField',
  //   key: 'REFERENCE_FIELD',
  //   description:
  //     '当前对象已建立关联或从主关系的对象，引用其目标对象中的字段，可用于在当前对象上展示关联字段以外的其他字段',
  //   exampleIconName: 'shili-quote@2X.png',
  //   style: {
  //     height: 60,
  //     width: '100%',
  //   },
  // },
];

export const getRelationFieldTypeEnums = () => [
  {
    title: intl.get(`${prefixMessage}.fieldType.linkRelation`).d('关联关系'),
    value: 'LINK_RELATION',
    iconName: 'linkRelation.svg',
    componentName: 'CommonField',
    key: 'LINK_RELATION',
    description:
      intl.get(`hmde.domainOwnBOList.fieldType.linkRelation.help`)
      .d('建立当前对象与目标对象的关联关系，例如：合同关联合同类型对象，当用户删除“关联业务对象”合同类型某一条记录时，系统将自动提醒存在相关联的合同记录，不允许用户删除该关联业务对象的记录'),
    exampleIconName: 'shili-relation@2X.png',
    style: {
      height: 60,
      width: '100%',
    },
  },
  {
    title: intl.get(`${prefixMessage}.fieldType.masterRelation`).d('从主关系'),
    value: 'MASTER_RELATION',
    iconName: 'masterRelation.svg',
    componentName: 'CommonField',
    key: 'MASTER_RELATION',
    description:
      intl.get(`hmde.domainOwnBOList.fieldType.masterRelation.help`)
      .d('建立当前对象与目标对象的从主关系，例如：合同明细(从)关联合同对象(主)，当用户删除“父业务对象”合同某一条记录时，系统将删除所有与之对应的“从对象”合同明细的记录'),
    exampleIconName: 'shili-congzhu@2X.png',
    style: {
      height: 60,
      width: '100%',
    },
  },
  // {
  //   title: intl.get(`${prefixMessage}.fieldType.reference_field`).d('引用字段'),
  //   value: 'REFERENCE_FIELD',
  //   iconName: 'reference_field.svg',
  //   componentName: 'CommonField',
  //   key: 'REFERENCE_FIELD',
  //   description:
  //     '当前对象已建立关联或从主关系的对象，引用其目标对象中的字段，可用于在当前对象上展示关联字段以外的其他字段',
  //   exampleIconName: 'shili-quote@2X.png',
  //   style: {
  //     height: 60,
  //     width: '100%',
  //   },
  // },
];

export const getFieldsEnums = () => {
  return [
    ...getBaseFieldTypeEnums(),
    ...getBusinessFieldTypeEnums(),
    ...getSeniorFieldTypeEnums(),
    ...getRelationFieldTypeEnums(),
  ];
};

export const fieldsEnums = [
  ...baseFieldTypeEnums,
  ...businessFieldTypeEnums,
  ...seniorFieldTypeEnums,
  ...relationFieldTypeEnums,
];
export const dataSource = [
  {
    tabName: '基础类',
    key: 'basic',
    children: baseFieldTypeEnums,
  },
  {
    tabName: '业务类',
    key: 'business',
    children: businessFieldTypeEnums,
  },
  {
    tabName: '高级类',
    key: 'senior',
    children: seniorFieldTypeEnums,
  },
  {
    tabName: '关系类',
    key: 'relation',
    children: relationFieldTypeEnums,
  },
];

export const getDataSource = () => {
  return [
    {
      tabName: intl.get('hmde.common.tabName.basic').d('基础类'),
      key: 'basic',
      children: getBaseFieldTypeEnums(),
    },
    {
      tabName: intl.get('hmde.common.tabName.business').d('业务类'),
      key: 'business',
      children: getBusinessFieldTypeEnums(),
    },
    {
      tabName: intl.get('hmde.common.tabName.senior').d('高级类'),
      key: 'senior',
      children: getSeniorFieldTypeEnums(),
    },
    {
      tabName: intl.get('hmde.common.tabName.relation').d('关系类'),
      key: 'relation',
      children: getRelationFieldTypeEnums(),
    },
  ];
};