import intl from 'srm-front-boot/lib/utils/intl';
// import { DataSet } from 'choerodon-ui/pro';
// import { DataSetSelection } from 'choerodon-ui/pro/lib/data-set/enum';
import { HZERO_HMDE } from '@/utils/config';
import { lowcodeOrganizationURL } from '@/utils/common';

const ImportTemplateDS = (businessObjectId, flag, businessObjectCode?) =>
  ({
    autoQuery: false,
    autoCreate: flag,
    selection: false,
    paging: true,
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
        label: intl.get('hmde.common.templateDescription').d('描述'),
        lock: true,
      },
      // {
      //   name: 'nameCondition',
      //   type: 'string',
      //   label: intl.get('hmde.template.nameCondition').d('模板名称或编码'),
      //   labelWidth: '120',
      // },
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
        name: 'templateCategory',
        type: 'string',
        required: true,
        textField: 'meaning',
        valueField: 'value',
        label: intl.get('hmde.common.templateCategory').d('模板类型'),
        lookupCode: 'HMDE.BUSINESS_OBJECT.IMPORT.TEMPLATE_TYPE',
        defaultValue: 'COMMON',
      },
      {
        name: 'importMaxSize',
        label: intl.get('hmde.common.importMaxSize').d('最大导入数量'),
        min: 1,
        step: 1,
        max: 50000,
      },
      {
        name: 'businessObjectImportTemplateId',
        type: 'string',
      },
    ],
    transport: {
      read: {
        url: `${lowcodeOrganizationURL({
          route: HZERO_HMDE,
        })}/business-object-import-templates/${businessObjectId}/page`,
        method: 'get',
      },
    },
  } as any);

const ImportTemplateDSNew = (businessObjectId, flag, businessObjectCode?) =>
  ({
    autoQuery: false,
    autoCreate: flag,
    selection: false,
    paging: true,
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
        label: intl.get('hmde.common.templateDescription').d('描述'),
        lock: true,
      },
      // {
      //   name: 'nameCondition',
      //   type: 'string',
      //   label: intl.get('hmde.template.nameCondition').d('模板名称或编码'),
      //   labelWidth: '120',
      // },
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
        name: 'templateCategory',
        type: 'string',
        required: true,
        textField: 'meaning',
        valueField: 'value',
        label: intl.get('hmde.common.templateCategory').d('模板类型'),
        lookupCode: 'HMDE.BUSINESS_OBJECT.IMPORT.TEMPLATE_TYPE',
        defaultValue: 'COMMON',
      },
      {
        name: 'importMaxSize',
        label: intl.get('hmde.common.importMaxSize').d('最大导入数量'),
        min: 1,
        step: 1,
        max: 50000,
      },
      {
        name: 'businessObjectImportTemplateId',
        type: 'string',
      },
      {
        name: 'sceneCode',
        label: intl.get('hmde.boComposition.importTemplate.senceCode').d('场景编码'),
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
        })}/business-object-import-templates/${businessObjectId}/page`,
        method: 'get',
      },
    },
  } as any);


export { ImportTemplateDS, ImportTemplateDSNew };
