const selectStore = [
  {
    code: 'select-single',
    text: '下拉单选',
  },
  {
    code: 'select-multiple',
    text: '下拉多选',
  },
  {
    code: 'single',
    text: '单选',
  },
  {
    code: 'multiple',
    text: '复选',
  },
  {
    code: 'expression',
    text: '公式',
  },
  {
    code: 'switch',
    text: '开关',
  },
  {
    code: 'text',
    text: '文本',
  },
  {
    code: 'text-multiple',
    text: '多行文本',
  },
  {
    code: 'int',
    text: '整数',
  },
  {
    code: 'float',
    text: '浮点数',
  },
  {
    code: 'percentage',
    text: '百分数',
  },
  {
    code: 'phone',
    text: '手机号码',
  },
  {
    code: 'amount',
    text: '金额',
  },
  {
    code: 'date',
    text: '日期',
  },
  {
    code: 'dateTime',
    text: '日期时间',
  },
  {
    code: 'email',
    text: '电子邮件',
  },
  {
    code: 'accessory',
    text: '附件',
  },
  {
    code: 'link',
    text: '超链接',
  },
  {
    code: 'master-slave-relation',
    text: '从主关系',
  },
  {
    code: 'association',
    text: '关联关系',
  },
  {
    code: 'reference-fields',
    text: '引用字段',
  },
];

// 所有类型都通用
const commonFieldsLv1 = ['bo_field_name', 'bo_field_code'];
// 某些类型通用
const commonFieldsLv2 = ['required_flag', 'readonly'];
const commonFieldsLv3 = ['field_description', 'default_value'];

const fieldMap = new Map([
  ['singleSelect', [...commonFieldsLv1, 'default_value', ...commonFieldsLv2]],
  ['multipleSelect', [...commonFieldsLv1, 'default_value', ...commonFieldsLv2]],
  ['radio', [...commonFieldsLv1, ...commonFieldsLv2]],
  ['checkbox', [...commonFieldsLv1, ...commonFieldsLv2]],
  ['formula', [...commonFieldsLv1, 'remark']],
  ['switch', [...commonFieldsLv1, 'remark']],
  ['textField', [...commonFieldsLv1, ...commonFieldsLv3, 'max_length', ...commonFieldsLv2]],
  ['textArea', [...commonFieldsLv1, ...commonFieldsLv3, 'max_length', ...commonFieldsLv2]],
  ['numberField', [...commonFieldsLv1, ...commonFieldsLv3, 'max_length', ...commonFieldsLv2]],
  [
    'float',
    [
      ...commonFieldsLv1,
      ...commonFieldsLv3,
      'integer_maxlength',
      'decimal_maxlength',
      ...commonFieldsLv2,
    ],
  ],
  [
    'percentage',
    [
      ...commonFieldsLv1,
      ...commonFieldsLv3,
      'integer_maxlength',
      'decimal_maxlength',
      ...commonFieldsLv2,
    ],
  ],
  ['phone', [...commonFieldsLv1, ...commonFieldsLv3, 'area_code', ...commonFieldsLv2]],
  [
    'amount',
    [
      ...commonFieldsLv1,
      ...commonFieldsLv3,
      'integer_maxlength',
      'decimal_maxlength',
      'thousands',
      ...commonFieldsLv2,
    ],
  ],
  [
    'dateSelectionBox',
    [
      ...commonFieldsLv1,
      ...commonFieldsLv3,
      'help_text',
      'remark',
      'display_format',
      'default_value',
    ],
  ],
  [
    'dateTimeSelectionBox',
    [...commonFieldsLv1, ...commonFieldsLv3, 'help_text', 'remark', 'max_length', 'default_value'],
  ],
  [
    'email',
    [...commonFieldsLv1, ...commonFieldsLv3, 'file_type', 'multiple', 'file_limit', 'max_upload'],
  ],
  ['accessory', [...commonFieldsLv1, ...commonFieldsLv3, 'max_length', ...commonFieldsLv2]],
  ['link', [...commonFieldsLv1, ...commonFieldsLv3, 'max_length', 'default_value']],
  [
    'master-slave-relation',
    [...commonFieldsLv1, ...commonFieldsLv3, 'master_bo_id', 'required_flag'],
  ],
  ['association', [...commonFieldsLv1, ...commonFieldsLv3, 'master_bo_id', 'required_flag']],
  [
    'reference-fields',
    [...commonFieldsLv1, ...commonFieldsLv3, 'master_bo_id', 'ref_bo_field_id', 'required_flag'],
  ],
]);

export { selectStore, fieldMap };
