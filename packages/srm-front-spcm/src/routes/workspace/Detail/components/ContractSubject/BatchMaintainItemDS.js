// 标的批量维护ds
import intl from 'utils/intl';

const BatchMaintainItemDS = (onlyReadFlag) => {
  return {
    autoQuery: false,
    autoCreate: true,
    fields: [
      {
        label: intl.get(`spcm.common.model.common.taxId`).d('税种'),
        name: 'taxIdLov',
        type: 'object',
        ignore: 'always',
        lovCode: 'SPCM.TAX',
        textField: 'taxCode',
      },
      {
        name: 'taxId',
        bind: 'taxIdLov.taxId',
      },
      {
        name: 'taxRate',
        bind: 'taxIdLov.taxRate',
      },
      {
        name: 'taxCode',
        bind: 'taxIdLov.taxCode',
      },
      {
        label: intl.get(`spcm.common.currencyCode`).d('原币币种'),
        name: 'currencyCodeLov',
        type: 'object',
        ignore: 'always',
        lovCode: 'SPCM.CURRENCY',
        textField: 'currencyCode',
        disabled: onlyReadFlag,
      },
      {
        name: 'currencyName',
        bind: 'currencyCodeLov.currencyName',
      },
      {
        name: 'currencyCode',
        bind: 'currencyCodeLov.currencyCode',
      },
      {
        label: intl.get(`spcm.common.purchaseCurrencyCode`).d('本币币种'),
        name: 'purchaseCurrencyCodeLov',
        type: 'object',
        ignore: 'always',
        lovCode: 'SPCM.CURRENCY',
        textField: 'currencyCode',
        disabled: onlyReadFlag,
      },
      {
        name: 'purchaseCurrencyName',
        bind: 'purchaseCurrencyCodeLov.currencyName',
      },
      {
        name: 'purchaseCurrencyCode',
        bind: 'purchaseCurrencyCodeLov.currencyCode',
      },
      {
        label: intl.get(`spcm.common.model.common.priceStartDate`).d('价格有效期从'),
        name: 'priceStartDate',
        type: 'date',
      },
      {
        label: intl.get(`spcm.common.model.common.priceEndDate`).d('价格有效期至'),
        name: 'priceEndDate',
        type: 'date',
      },
      {
        label: intl.get(`spcm.common.model.common.needByDate`).d('交付日期'),
        name: 'deliverDate',
        type: 'date',
      },
      {
        name: 'projectTaskId',
        label: intl.get('spcm.common.model.projectTaskName').d('项目任务名称'),
        lovCode: 'SIEC.PROJECT_TASK_TREE',
        type: 'object',
        lovPara: {
          tileTreeFlag: 1,
          businessObjectCode: 'SRM_C_SRM_SPCM_PC_HEADER',
        },
        optionsProps: {
          paging: 'server',
          idField: 'taskId',
          parentField: 'parentTaskId',
          record: {
            dynamicProps: {
              selectable: (record) => record.get('isCheck') !== false,
            },
          },
        },
      },
    ],
  };
};

export default BatchMaintainItemDS;
