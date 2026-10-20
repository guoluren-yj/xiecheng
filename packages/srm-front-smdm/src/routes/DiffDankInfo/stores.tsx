/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { SRM_MDM } from '_utils/config';
import type { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
// import { FieldType, FieldIgnore } from 'choerodon-ui/pro/lib/data-set/enum';
import { DataSetSelection, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import type { AxiosRequestConfig } from 'axios';

import intl from 'utils/intl';

const tableDS: () => DataSetProps = () => ({
  primaryKey: 'id',
  autoQuery: true,
  selection: DataSetSelection.multiple,
  queryFields: [
    {
      name: 'unanimousFlag',
      type: FieldType.string,
      lookupCode: 'SMDM.BANK_ENTRY_UNANIMOUS_FLAG',
      label: intl.get('hzero.common.model.common.compareResult').d('对比结果'),
    },
    {
      name: 'bankName',
      type: FieldType.string,
      label: intl.get('smdm.bank.model.bank.bankName').d('总行名称'),
    },
    {
      name: 'bankFirm',
      type: FieldType.string,
      label: intl.get('smdm.bank.model.bank.bankFirm').d('联行行号'),
    },
    {
      name: 'bankBranchName',
      type: FieldType.string,
      label: intl.get('smdm.bank.model.bank.branchBankName').d('分行名称'),
    },
    {
      name: 'syncFlag',
      type: FieldType.string,
      lookupCode: 'HPFM.FLAG',
      label: intl.get('hzero.common.model.common.syncFlag').d('是否已同步'),
    },
    {
      name: 'tenantId',
      type: FieldType.object,
      lovCode: 'HPFM.TENANT',
      transformRequest: (value) => value?.tenantId,
      label: intl.get('hzero.common.model.common.tenanted').d('所属租户'),
    },
    {
      name: 'platformExistFlag',
      type: FieldType.string,
      lookupCode: 'HPFM.FLAG',
      label: intl.get('hzero.common.model.common.platformExistFlag').d('系统是否存在'),
    },
  ],
  fields: [
    {
      name: 'unanimousFlag',
      type: FieldType.string,
      label: intl.get('hzero.common.model.common.compareResult').d('对比结果'),
    },
    {
      name: 'bankCode',
      type: FieldType.string,
    },
    {
      name: 'bankName',
      type: FieldType.string,
      label: intl.get('smdm.bank.model.bank.bankName').d('总行名称'),
    },
    {
      name: 'bankFirm',
      type: FieldType.string,
      label: intl.get('smdm.bank.model.bank.bankFirm').d('联行行号'),
    },
    {
      name: 'bankBranchCode',
      type: FieldType.string,
    },
    {
      name: 'bankBranchName',
      type: FieldType.string,
      label: intl.get('smdm.bank.model.bank.branchBankName').d('分行名称'),
    },
    {
      name: 'platformExistFlag',
      type: FieldType.string,
      label: intl.get('hzero.common.model.common.platformExistFlag').d('系统是否存在'),
    },
    {
      name: 'tenantName',
      type: FieldType.string,
      label: intl.get('hzero.common.model.common.tenanted').d('所属租户'),
    },
    {
      name: 'syncFlag',
      type: FieldType.string,
      label: intl.get('hzero.common.model.common.syncFlag').d('是否已同步'),
    },
  ],
  record: {
    dynamicProps: {
      selectable: (record) => String(record.get('unanimousFlag')) === '1',
    },
  },
  transport: {
    read: ({ data, params }): AxiosRequestConfig => {
      return {
        url: `${SRM_MDM}/v1/bank-external-entry`,
        method: 'GET',
        data: { ...data, ...params },
      };
    }
  },
});

const diffInfoListDS: () => DataSetProps = () => ({
  primaryKey: 'inconsistentField',
  autoQuery: false,
  selection: DataSetSelection.multiple,
  fields: [
    {
      name: 'bankFirm',
      type: FieldType.string,
      label: intl.get('smdm.bank.model.bank.bankFirm').d('联行行号'),
    },
    {
      name: 'platformExistFlag',
      type: FieldType.string,
      label: intl.get('hzero.common.model.common.platformExistFlag').d('系统是否存在'),
    },
    {
      name: 'inconsistentFieldMeaning',
      type: FieldType.string,
      label: intl.get('hzero.common.model.common.inconsistentField').d('差异字段'),
    },
    {
      name: 'externalValue',
      type: FieldType.string,
      label: intl.get('smdm.bank.model.bank.externalValue').d('接口银行信息'),
    },
    {
      name: 'platformValue',
      type: FieldType.string,
      label: intl.get('smdm.bank.model.bank.platformValue').d('系统银行信息'),
    },
  ],
});

const bankListDS: () => DataSetProps = () => ({
  primaryKey: 'bankId',
  autoQuery: true,
  selection: DataSetSelection.single,
  queryFields: [
    {
      name: 'bankCode',
      type: FieldType.string,
      label: intl.get('hpfm.bank.model.bank.bankCode').d('银行代码'),
    },
    {
      name: 'bankName',
      type: FieldType.string,
      label: intl.get('hpfm.bank.model.bank.bankName').d('银行名称'),
    },
    {
      name: 'bankTypeCode',
      type: FieldType.string,
      lookupCode: 'HPFM.BANK_TYPE',
      label: intl.get('hpfm.bank.model.bank.bankType').d('银行类型'),
    },
  ],
  fields: [
    {
      name: 'bankCode',
      type: FieldType.string,
      label: intl.get('hpfm.bank.model.bank.bankCode').d('银行代码'),
    },
    {
      name: 'bankName',
      type: FieldType.string,
      label: intl.get('hpfm.bank.model.bank.bankName').d('银行名称'),
    },
    {
      name: 'bankTypeMeaning',
      type: FieldType.string,
      label: intl.get('hpfm.bank.model.bank.bankType').d('银行类型'),
    },
  ],
  transport: {
    read: ({ data, params }): AxiosRequestConfig => {
      return {
        url: `${SRM_MDM}/v1/platform/banks?enabledFlag=1`,
        method: 'GET',
        data: { ...data, ...params },
      };
    }
  },
});

export { tableDS, diffInfoListDS, bankListDS };
