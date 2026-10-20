import intl from 'srm-front-boot/lib/utils/intl';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { HZERO_HMDE } from '@/utils/config';
import { lowcodeOrganizationURL } from '@/utils/common';

const ExportTemplateDS = (flag, businessObjectCode?) =>
  ({
    autoQuery: false,
    autoCreate: flag,
    selection: false,
    // paging: false,
    pageSize: 10,
    queryFields: [
      {
        name: 'templateCode',
        type: 'string',
        label: intl.get('hmde.common.templateCode').d('模板编码'),
      },
      {
        name: 'templateName',
        type: 'string',
        label: intl.get('hmde.common.templateName').d('模板名称'),
      },
      {
        name: 'remark',
        type: 'string',
        label: intl.get('hmde.common.remark').d('描述'),
      },
    ],
    fields: [
      {
        name: 'templateCode',
        type: 'string',
        label: intl.get('hmde.common.templateCode').d('模板编码'),
        pattern: /^[a-zA-Z0-9_/.]*$/,
        required: true,
        defaultValue: `${businessObjectCode}_`,
      },
      {
        name: 'templateName',
        type: 'intl',
        label: intl.get('hmde.common.templateName').d('模板名称'),
        required: true,
      },
      {
        name: 'remark',
        type: 'intl',
        label: intl.get('hmde.common.remark').d('描述'),
      },
      {
        name: 'maxDataCount',
        type: 'number',
        defaultValue: 250000,
        label: intl.get('hmde.common.maxDataCount').d('导出最大条数'),
      },
      {
        name: 'fileType',
        type: 'string',
        label: intl.get('hmde.common.fileType').d('默认文件格式'),
        defaultValue: 'EXCEL2007',
        textField: 'meaning',
        valueField: 'value',
        lookupCode: 'HMDE.BUSINESS_OBJECT.EXPORT.FILE_TYPE',
      },
      {
        name: 'maxSheetCount',
        type: 'number',
        defaultValue: 5,
        label: intl.get('hmde.common.maxSheetCount').d('默认最大页数'),
      },
      {
        name: 'exportType',
        type: 'string',
        textField: 'meaning',
        valueField: 'value',
        lookupCode: 'HPFM.EXCEL_EXPORT_TYPE',
        label: intl.get('hmde.common.exportTypeObject').d('导出类型'),
        required: true,
      },
      {
        name: 'enabledFlag',
        type: 'boolean',
        label: intl.get('hmde.common.enableFlag').d('是否启用'),
        defaultValue: true,
      },
    ],
    transport: {
      read: {
        url: `${lowcodeOrganizationURL({
          route: HZERO_HMDE,
        })}/business-objects-export-templates/page`,
        method: 'GET',
      },
    },
  } as DataSetProps);

const ExportTemplateDSNew = (flag, businessObjectCode?) =>
  ({
    autoQuery: false,
    autoCreate: flag,
    selection: false,
    // paging: false,
    pageSize: 20,
    queryFields: [
      {
        name: 'templateCode',
        type: 'string',
        label: intl.get('hmde.common.templateCode').d('模板编码'),
        lock: true,
      },
      {
        name: 'templateName',
        type: 'string',
        label: intl.get('hmde.common.templateName').d('模板名称'),
        lock: true,
      },
      {
        name: 'remark',
        type: 'string',
        label: intl.get('hmde.common.remark').d('描述'),
        lock: true,
      },
    ],
    fields: [
      {
        name: 'templateCode',
        type: 'string',
        label: intl.get('hmde.common.templateCode').d('模板编码'),
        pattern: /^[a-zA-Z0-9_/.]*$/,
        required: true,
        defaultValue: `${businessObjectCode}_`,
      },
      {
        name: 'templateName',
        type: 'intl',
        label: intl.get('hmde.common.templateName').d('模板名称'),
        required: true,
      },
      {
        name: 'remark',
        type: 'intl',
        label: intl.get('hmde.common.remark').d('描述'),
      },
      {
        name: 'maxDataCount',
        type: 'number',
        defaultValue: 250000,
        label: intl.get('hmde.common.maxDataCount').d('导出最大条数'),
      },
      {
        name: 'fileType',
        type: 'string',
        label: intl.get('hmde.common.fileType').d('默认文件格式'),
        defaultValue: 'EXCEL2007',
        textField: 'meaning',
        valueField: 'value',
        lookupCode: 'HMDE.BUSINESS_OBJECT.EXPORT.FILE_TYPE',
      },
      {
        name: 'maxSheetCount',
        type: 'number',
        defaultValue: 5,
        label: intl.get('hmde.common.maxSheetCount').d('默认最大页数'),
      },
      {
        name: 'exportType',
        type: 'string',
        textField: 'meaning',
        valueField: 'value',
        lookupCode: 'HPFM.EXCEL_EXPORT_TYPE',
        label: intl.get('hmde.common.exportTypeObject').d('导出类型'),
        required: true,
      },
      {
        name: 'enabledFlag',
        type: 'boolean',
        label: intl.get('hmde.bo.model.status.enabledFlag').d('启用'),
        defaultValue: true,
      },
      {
        label: intl.get('hmde.bo.model.status.labelCode').d('模板使用方'),
        name: 'labelCode',
        type: 'string',
        lookupCode: 'AUTH_LABEL',
        help: intl.get('hmde.bo.model.status.labelCode.help').d('请根据实际模板使用方维护，采购方：内部用户(如采购员等)使用；供应方：供应商用户切换到当前租户下可使用的模板；全部：不限制，供应商和采购方都可用的模板'),
      },
    ],
    transport: {
      read: {
        url: `${lowcodeOrganizationURL({
          route: HZERO_HMDE,
        })}/business-objects-export-templates/page`,
        method: 'GET',
      },
    },
  } as any);

export { ExportTemplateDS, ExportTemplateDSNew };
