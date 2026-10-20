import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';
import { isNil } from 'lodash';
import intl from 'hzero-front/lib/utils/intl';
import { HZERO_RPT } from 'hzero-front/lib/utils/config';
// import { getEnvConfig } from 'hzero-front/lib/utils/iocUtils';
import { isTenantRoleLevel, getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';

export const getFormDs = ({ reportId, disabled = false }) => {
  const disabledFlag = !isNil(reportId);
  return {
    autoQuery: false,
    autoCreate: true,
    paging: false,
    fields: [
      {
        label: intl.get('hrpt.printTemplate.report.reportCode').d('模板编码'),
        name: 'reportCode',
        required: !disabledFlag,
        disabled: disabledFlag || disabled,
      },
      {
        label: intl.get('hrpt.printTemplate.report.reportName').d('模板名称'),
        name: 'reportName',
        required: true,
        disabled: disabled,
        type: 'intl',
      },
      {
        label: intl.get('hrpt.printTemplate.model.reportDefinition.reportRemake').d('模板描述'),
        name: 'remark',
        type: 'intl',
        disabled: disabled,
      },
      {
        label: intl.get('hrpt.printTemplate.model.reportDefinition.dataset').d('数据集'),
        name: 'dataset',
        required: !disabledFlag,
        ignore: 'always',
        disabled: disabledFlag || disabled,
        type: 'object',
        lovCode: isTenantRoleLevel() ? 'HRPT.REPORT_DATASET_TENANT' : 'HRPT.REPORT_DATASET',
        lovPara: isTenantRoleLevel()
          ? {
            tenantId: getCurrentOrganizationId(),
          }
          : {},
      },
      {
        name: 'datasetId',
        bind: 'dataset.datasetId',
      },
      {
        name: 'datasetCode',
        bind: 'dataset.datasetCode',
      },
      {
        name: 'datasetName',
        bind: 'dataset.datasetName',
      },
      {
        label: intl.get('hrpt.printTemplate.model.reportDefinition.enabledStatus').d('启用状态'),
        name: 'enabledFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 1,
      },
      {
        label: intl.get('hrpt.printTemplate.model.reportDefinition.editorType').d('模板编辑器类型'),
        name: 'editorType',
        type: 'string',
        required: true,
        disabled: disabledFlag || disabled,
        defaultValue: "EXCEL",
      },
      {
        label: intl.get('hrpt.printTemplate.model.reportDefinition.reportFileType').d('模板输出文件类型'),
        name: 'reportType',
        type: 'string',
        required: true,
        disabled: disabledFlag || disabled,
        defaultValue: "PDF",
      },
      {
        label: intl.get('hrpt.printTemplate.model.reportDefinition.asyncThreshold').d('打印数据同步阈值'),
        name: 'asyncThreshold',
        type: 'number',
        precision: 0,
        step: 1,
        min: 0,
        disabled: disabled || isTenantRoleLevel(),
        help: intl.get('hrpt.printTemplate.model.reportDefinition.asyncThreshold.Help').d('打印单据行数量超出阈值，则转为异步打印，打印后PDF文件通过站内信通知'),
      },
      {
        label: intl.get('hrpt.printTemplate.model.reportDefinition.labelCode').d('模板使用方'),
        name: 'labelCode',
        type: 'string',
        lookupCode: 'AUTH_LABEL',
        required: !disabledFlag,
        disabled: disabledFlag,
        help: intl.get('hrpt.printTemplate.model.reportDefinition.labelCode.help').d('请根据实际模板使用方维护，采购方：内部用户(如采购员等)使用；供应方：供应商用户切换到当前租户下可使用的模板；全部：不限制，供应商和采购方都可用的模板'),
      },
    ],
    transport: {
      read: ({ data = {} }) => {
        const url = isTenantRoleLevel()
          ? `${HZERO_RPT}/v1/${getCurrentOrganizationId()}/print-reports/${data.reportId || reportId}`
          : `${HZERO_RPT}/v1/print-reports/${data.reportId || reportId}`;
        return {
          url,
          method: 'get',
        };
      },
    },
    events: {
      update: ({ record, name, value }) => {
        if (name === 'editorType') {
          record.set('reportType', value === 'WORD' ? 'WORD' : 'PDF');
        }
      },
      load: ({ dataSet }) => {
        if (dataSet && dataSet.current) {
          if (!dataSet.current.get("editorType")) {
            dataSet.current.init("editorType", "EXCEL");
          }
          if (!dataSet.current.get("reportType")) {
            dataSet.current.init("reportType", "PDF");
          }
        }
      },
    },
  } as DataSetProps;
};

export const getTableDs = () => {
  return {
    autoQuery: false,
    selection: false,
    paging: false,
    fields: [
      {
        label: intl.get('hrpt.printTemplate.model.reportDefinition.templateName').d('模板名称'),
        name: 'templateName',
        required: true,
      },
      {
        label: intl.get('hrpt.printTemplate.model.reportDefinition.templateRemark').d('模板描述'),
        name: 'remark',
        type: 'intl',
      },
      {
        label: intl.get('hrpt.printTemplate.model.reportDefinition.templateLang').d('语言'),
        name: 'templateLang',
        lookupCode: 'HPFM.LANGUAGE',
        required: true,
      },
      {
        label: intl.get('hrpt.printTemplate.model.reportDefinition.status').d('状态'),
        name: 'enabledFlag',
        defaultValue: 1,
      },
    ],
    transport: {
      read: ({ data = {} }) => {
        const url = isTenantRoleLevel()
          ? `${HZERO_RPT}/v1/${getCurrentOrganizationId()}/print-templates/${data.reportUuid}/by-report`
          : `${HZERO_RPT}/v1/print-templates/${data.reportUuid}/by-report`;
        return {
          url,
          method: 'get',
        };
      },
    },
  } as DataSetProps;
};
