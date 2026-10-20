import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

const initLinesValue = [
  {
    value: 'fcstQuantity',
    meaning: '预测数量',
    orderSeq: 10,
  },
  {
    value: 'fcstAmountIncTax',
    meaning: intl.get('sprm.forecastMgt.model.common.fcstAmountIncTax').d('预测金额（含税）'),
    orderSeq: 10,
  },
  {
    value: 'fcstAmountExcTax',
    meaning: intl.get('sprm.forecastMgt.model.common.fcstAmountExcTax').d('预测金额（不含税）'),
    orderSeq: 10,
  },
  {
    value: 'feedbackQuantity',
    meaning: '供应商确认',
    orderSeq: 20,
  },
  {
    value: 'diffQiantity',
    meaning: '系统比差',
    orderSeq: 30,
  },
];

const initCols = [
  { name: 'fcstNum' },
  { name: 'lineNum' },
  { name: 'fcstStatus' },
  { name: 'supplierLov' },
  { name: 'displaySupplierName' },
  { name: 'itemId' },
  { name: 'categoryId' },
  { name: 'itemName' },
  { name: 'uomId' },
  { name: 'companyId' },
  { name: 'ouId' },
  { name: 'purchaseOrgId' },
  { name: 'purchaseAgentId' },
  { name: 'invOrganizationId' },
];

// 向导组件
const config = () => {
  return [
    {
      enable: true,
      code: 'SRPM_REQURED_EDIT',
      type: 'strong',
      // 向导组优先级，在多个向导同时满足条件时，数值大的优先显示
      priority: 2,
      version: 2,
      title: intl.get(`sprm.forecastMgt.model.common.fcstStartDate`).d('预测起始日期'),
      delay: 1000,
      // 是否为可选步骤，当该选项为true时，向导组内的各步骤遵循哪一步满足条件哪一步显示，直到整个向导组均已被阅读过为止
      optionalSteps: true,
      steps: [
        {
          selector: '.required-edit-alert',
          title: intl.get(`sprm.forecastMgt.model.common.fcstStartDate`).d('预测起始日期'),
          htmlText: `1.${intl
            .get('sprm.forecastMgt.guide.required')
            .d('避免数据量过大造成卡顿，需要先选中起始日期才会加载数据。')} <br /> 2.${intl
            .get('sprm.forecastMgt.guide.dataRender')
            .d('日期下方的绿色圆点标识该日期下面有数据。')}`,
          placement: 'auto',
        },
      ],
    },
    {
      enable: true,
      code: 'SRPM_REQURED_OFFLINE',
      type: 'strong',
      priority: 2,
      version: 1,
      title: intl.get('sprm.forecastWorkbench.button.offlineResultEntry').d('线下结果录入'),
      delay: 300,
      // 是否为可选步骤，当该选项为true时，向导组内的各步骤遵循哪一步满足条件哪一步显示，直到整个向导组均已被阅读过为止
      optionalSteps: false,
      steps: [
        {
          selector: '.offline-entry-btn',
          title: intl.get('sprm.forecastWorkbench.button.offlineResultEntry').d('线下结果录入'),
          htmlText: intl
            .get('sprm.forecastWorkbench.button.offlineResultEntryTip')
            .d('先导出预测数据填写完反馈数量后即可进行线下结果录入。'),
          placement: 'auto',
        },
      ],
    },
  ];
};

// 设置动态列字段类型
const getFieldType = fieldType => {
  switch (fieldType) {
    case 'LOV':
      return 'object';
    case 'SELECT':
      return 'string';
    case 'SWITCH':
      return 'boolean';
    case 'INPUT_NUMBER':
      return 'number';
    case 'DATE_PICKER':
      return 'date';
    default:
      return 'string';
  }
};

const handleFieldList = ({ fields, needFeedback, predictionDimensionCnf }) => {
  const supplierFields = fields.filter(
    i =>
      [
        'supplierId',
        'supplierCode',
        'supplierName',
        'supplierTenantId',
        'supplierCompanyId',
        'supplierCompanyNum',
        'supplierCompanyCode',
        'supplierCompanyName',
      ].includes(i.fieldCode) && i.required
  );
  // 虚拟自定义字段
  if (fields.every(e => e.fcstFieldType !== 'CUSTOMIZE')) {
    if (needFeedback === 1) {
      fields.push({
        fieldCode: 'fcrtType',
        fieldType: 'INPUT',
        editable: 0,
        fieldName: intl.get(`hzero.common.model.common.entryCategory`).d('类别'),
        showFieldFlag: 1,
        lovInfo: {},
        required: 0,
      });
    }
    fields.push(
      {
        fieldCode: 'dynamicCol',
        fieldType: 'INPUT',
        editable: 0,
        showFieldFlag: 1,
        lovInfo: {},
        required: 0,
      },
      predictionDimensionCnf === 'QUANTITY'
        ? {
            fieldCode: 'sumQiantity',
            fieldType: 'INPUT',
            editable: 0,
            type: 'number',
            fieldName: intl.get(`sprm.forecastMgt.model.common.sumQiantity`).d('预测总量'),
            showFieldFlag: 1,
            lovInfo: {},
            required: 0,
          }
        : {
            fieldCode: 'sumAmount',
            fieldType: 'INPUT',
            editable: 0,
            type: 'number',
            fieldName: intl.get(`sprm.forecastMgt.model.common.sumAmount`).d('预测总额'),
            showFieldFlag: 1,
            lovInfo: {},
            required: 0,
          },
      {
        fieldCode: 'actionLine',
        fieldType: 'INPUT',
        editable: 0,
        fieldName: intl.get(`sprm.forecastMgt.model.common.action`).d('操作记录'),
        showFieldFlag: 1,
        lovInfo: {},
        required: 0,
      }
    );
    fields.splice(fields.findIndex(e => e.fieldCode === 'itemId'), 0, {
      fieldCode: 'itemName',
      fieldName: intl.get(`sprm.forecastMgt.model.common.itemId`).d('物料名称'),
      fieldType: 'INPUT',
      editable: 0,
      showFieldFlag: 1,
    });
  }

  const allFields = [];
  // 供应商字段的位置
  const supplierIndex = fields.findIndex(e =>
    [
      'supplierId',
      'supplierCode',
      'supplierName',
      'supplierTenantId',
      'supplierCompanyId',
      'supplierCompanyNum',
      'supplierCompanyCode',
      'supplierCompanyName',
    ].includes(e.fieldCode)
  );
  fields.forEach((element, index) => {
    if (
      [
        'supplierId',
        'supplierCode',
        'supplierName',
        'supplierTenantId',
        'supplierCompanyId',
        'supplierCompanyNum',
        'supplierCompanyCode',
        'supplierCompanyName',
      ].includes(element.fieldCode) &&
      index === supplierIndex
    ) {
      allFields.push(
        {
          fieldCode: 'supplierLov',
          fieldType: 'LOV',
          editable: supplierFields.some(i => i.editable) ? 1 : 0,
          showFieldFlag: supplierFields.some(i => i.showFieldFlag) ? 1 : 0,
          fixed: supplierFields.find(ele => ele.fieldCode === 'supplierId')?.fixed,
          width: supplierFields.find(ele => ele.fieldCode === 'supplierId')?.width,
          lovInfo: {},
          lovPara: { tenantId: getCurrentOrganizationId() },
          dynamicProps: {
            textField: ({ record }) =>
              record.get('supplierCode') ? 'supplierNum' : 'supplierCompanyNum',
          },
          lovCode: 'SPRM.SUPPLIER',
          fieldName: intl.get(`sprm.forecastMgt.model.common.supplierLov`).d('供应商'),
          required: supplierFields.some(i => i.required),
        },
        {
          fieldCode: 'displaySupplierName',
          fixed: fields.find(ele => ele.fieldCode === 'supplierName')?.fixed,
          width: fields.find(ele => ele.fieldCode === 'supplierName')?.width,
          showFieldFlag: fields.some(i => i.showFieldFlag) ? 1 : 0,
          lovInfo: {},
          fieldName: intl.get(`sprm.forecastMgt.model.common.displaySupplierName`).d('供应商名称'),
        }
      );
    } else if (
      ![
        'supplierId',
        'supplierCode',
        'supplierName',
        'supplierTenantId',
        'supplierCompanyId',
        'supplierCompanyNum',
        'supplierCompanyCode',
        'supplierCompanyName',
      ].includes(element.fieldCode) &&
      element.showFieldFlag
    ) {
      allFields.push(element);
    }
  });
  return allFields;
};

export { initLinesValue, config, getFieldType, handleFieldList, initCols };
