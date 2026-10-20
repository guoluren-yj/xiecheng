import React from 'react';
import { Tooltip, Modal } from 'choerodon-ui/pro';
import { getCurrentOrganizationId, getCurrentUser } from 'utils/utils';
import intl from 'utils/intl';
import moment from 'moment';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { getEnvConfig } from 'utils/iocUtils';
import { SRM_SPC } from '_utils/config';
import { lovDefineAxiosConfig } from '_utils/c7nUiConfig';
import { formatTreeData } from './utils';

const { HZERO_IAM } = getEnvConfig();

const organizationId = getCurrentOrganizationId();

const listLineDS = () => ({
  // autoQuery: true,
  selection: false,
  primaryKey: 'templateId',
  idField: 'templateId',
  parentField: 'parentId',
  expandField: 'expand',
  paging: 'server',
  pageSize: 20,
  // table表单显示的字段
  fields: [
    {
      name: 'templateStatus',
      type: 'string',
      label: intl.get('hzero.common.status').d('状态'),
    },
    {
      name: 'templateCode',
      type: 'string',
      required: true,
      label: intl.get('ssrc.priceLibDimension.model.dimension.priceLibCode').d('价格库编码'),
      validator: (value, _, record) => {
        const reg = /[a-z\u4e00-\u9fa5]/g;
        if (reg.test(record.get('templateCode'))) {
          return intl
            .get('ssrc.priceLibDimension.priceLibCode.validation.notLowercase')
            .d('价格库编码不能为中文和小写英文字母');
        }
        return true;
      },
    },
    {
      name: 'templateName',
      type: 'intl',
      required: true,
      label: intl.get('ssrc.priceLibDimension.model.dimension.priceLibName').d('价格库名称'),
    },
    {
      name: 'templateType',
      type: 'string',
      // required: true,
      label: intl.get('ssrc.priceLibDimension.model.dimension.priceLibType').d('价格库类型'),
      lookupCode: 'SSRC.PRICE_LIB_TEMPLATE_TYPE',
    },
    {
      name: 'remark',
      type: 'intl',
      label: intl.get('hzero.common.remark').d('备注'),
    },

    {
      name: 'dimensionManage',
      type: 'string',
      label: intl.get('ssrc.priceLibDimension.model.dimension.dimensionManage').d('维度管理'),
    },
    {
      name: 'realName',
      type: 'string',
      defaultValue: getCurrentUser().realName,
      label: intl.get('ssrc.priceLibDimension.model.dimension.realName').d('创建人'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('ssrc.priceLibDimension.model.dimension.creationDate').d('创建时间'),
      // transformRequest: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
    },
    {
      name: 'versionNum',
      type: 'number',
      label: intl.get('ssrc.priceLibDimension.model.dimension.versionNum').d('版本'),
    },
    {
      name: 'edit',
      type: 'string',
      label: intl.get('hzero.common.action').d('操作'),
    },
  ],

  // 查询表单字段
  // queryFields: [
  //   {
  //     name: 'codeOrName',
  //     type: 'string',
  //     label: intl
  //       .get('ssrc.priceLibDimension.model.dimension.priceCodeOrName')
  //       .d('价格库编码/名称'),
  //     labelWidth: 150,
  //     format: 'uppercase',
  //   },
  //   {
  //     name: 'templateType',
  //     type: 'string',
  //     label: intl.get('ssrc.priceLibDimension.model.dimension.priceLibType').d('价格库类型'),
  //     lookupCode: 'SSRC.PRICE_LIB_TEMPLATE_TYPE',
  //   },
  // ],
  queryParameter: {
    customizeUnitCode: 'SSRC.PRICE_LIBRARY_DIMENSION.LIST.FILTER',
  },
  transport: {
    read: {
      url: `${SRM_SPC}/v1/${organizationId}/price-lib-templates/list`,
      method: 'GET',
      transformResponse: (data) => {
        return formatTreeData(data, 'templateId', 'templateStatus');
      },
    },
    submit: (val) => {
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-lib-templates`,
        data: val.data,
        method: 'POST',
      };
    },
  },
});

// 价格视图配置
const viewConfigDS = () => ({
  primaryKey: 'viewConfId',
  pageSize: 20,
  fields: [
    {
      name: 'lineNum',
      type: 'number',
      step: 1,
      min: 0,
      label: intl.get('ssrc.priceLibDimension.model.dimension.lineNum').d('序号'),
    },
    {
      name: 'viewCode',
      type: 'string',
      required: true,
      label: intl.get('ssrc.priceLibDimension.model.dimension.viewCode').d('价格视图编码'),
      validator: (value, _, record) => {
        const reg = /[\u4e00-\u9fa5]/gm;
        if (reg.test(record.get('viewCode'))) {
          return intl
            .get('ssrc.priceLibDimension.viewCode.validation.notChinese')
            .d('价格视图编码不能为中文');
        }
        return true;
      },
    },
    {
      name: 'viewName',
      type: 'string',
      required: true,
      label: intl.get('ssrc.priceLibDimension.model.dimension.viewName').d('价格视图名称'),
    },
    {
      name: 'viewIndicesLov',
      type: 'object',
      label: intl.get('ssrc.priceLibDimension.model.dimension.viewIndices').d('视图索引'),
      lovCode: 'SSRC.PRICE_LIB_INDEX_DIM',
      ignore: 'always',
      multiple: true,
      required: true,
      dynamicProps: {
        lovPara: ({ dataSet }) => ({ templateId: dataSet.queryParameter.templateId }),
      },
    },
    {
      name: 'viewIndices',
      type: 'string',
      bind: 'viewIndicesLov.dimensionCode',
      multiple: ',',
    },
    {
      name: 'viewIndexNames',
      type: 'string',
      bind: 'viewIndicesLov.dimensionName',
      multiple: ',',
    },
    {
      name: 'viewRuleCode',
      type: 'string',
      required: true,
      label: intl.get('ssrc.priceLibDimension.model.dimension.viewRuleCode').d('视图规则名称'),
      lookupCode: 'SSRC.PRICE_LIB_VIEW_RULE',
    },
    {
      name: 'invalidFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      label: intl.get('ssrc.priceLibDimension.model.dimension.invalidFlag').d('更新后失效原价格'),
      dynamicProps: {
        disabled: ({ record, dataSet }) =>
          record?.get('viewRuleCode') === 'MONTH_AVG_PRICE' ||
          (dataSet?.toData()?.some((n) => n.invalidFlag) && !record?.get('invalidFlag')),
      },
    },
  ],

  // 查询表单字段
  queryFields: [
    {
      name: 'lineNum',
      sortFlag: true,
      display: false,
      label: intl.get('ssrc.priceLibDimension.model.dimension.lineNum').d('序号'),
    },
    {
      name: 'viewCode',
      type: 'string',
      label: intl.get('ssrc.priceLibDimension.model.dimension.viewCode').d('价格视图编码'),
      labelWidth: 120,
      display: true,
    },
    {
      name: 'viewName',
      type: 'string',
      label: intl.get('ssrc.priceLibDimension.model.dimension.viewName').d('价格视图名称'),
      labelWidth: 120,
      display: true,
    },
  ],

  events: {
    load: ({ dataSet }) => {
      dataSet.forEach((record) => {
        if (record.data.viewConfId || record.data.viewConfId === 0) {
          Object.assign(record, { selectable: false });
        }
      });
    },
    update: ({ name, value, record }) => {
      if (name === 'viewRuleCode') {
        if (value === 'MONTH_AVG_PRICE' && record.get('invalidFlag')) {
          record.set('invalidFlag', 0);
        }
      }
      if (name === 'invalidFlag' && value) {
        Modal.confirm({
          title: intl.get('hzero.common.message.confirm.title').d('提示'),
          children: (
            <span style={{ fontSize: '12px' }}>
              {intl
                .get('ssrc.priceLibDimension.view.message.info.invalidFlag')
                .d(
                  '价格视图的数据被更新时，将不可逆的失效当前被更新数据关联的原价格库数据，请谨慎操作！'
                )}
            </span>
          ),
          onCancel: () => {
            record.set('invalidFlag', 0);
          },
        });
      }
    },
  },

  transport: {
    read: ({ data }) => {
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-lib-view-confs`,
        method: 'GET',
        data,
      };
    },

    submit: ({ data, dataSet }) => {
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-lib-view-confs`,
        data: data.map((item) => ({ ...item, templateId: dataSet.queryParameter.templateId })),
        method: 'POST',
      };
    },
  },
});

// 到期预警DS配置项
const warningDS = () => ({
  primaryKey: 'templateId',
  paging: false,

  fields: [
    {
      name: 'expireWarningFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      label: intl.get('ssrc.priceLibDimension.model.dimension.expirationWarning').d('到期预警'),
      dynamicProps: {
        disabled: ({ record }) => {
          if (record.get('templateStatus') === 'RELEASED') {
            // 已发布状态, 只读
            return true;
          } else {
            return false;
          }
        },
      },
    },
    {
      name: 'warningDays',
      type: 'number',
      step: 1,
      min: 0,
      defaultValue: 30,
      label: intl.get('ssrc.priceLibDimension.model.dimension.expirationDays').d('提前预警天数'),
      dynamicProps: {
        required: ({ record }) => {
          if (record.get('expireWarningFlag')) {
            return true;
          } else {
            return false;
          }
        },
        disabled: ({ record }) => {
          if (record.get('expireWarningFlag') && record.get('templateStatus') !== 'RELEASED') {
            return false;
          } else {
            return true;
          }
        },
      },
    },
    {
      name: 'warningNoticeFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      label: intl
        .get('ssrc.priceLibDimension.model.dimension.openWarningNotice')
        .d('开启到期消息提醒'),
      dynamicProps: {
        disabled: ({ record }) => {
          if (record.get('expireWarningFlag') && record.get('templateStatus') !== 'RELEASED') {
            return false;
          } else {
            return true;
          }
        },
      },
    },
    {
      name: 'warningHighlightFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl
        .get('ssrc.priceLibDimension.model.dimension.warningHighlightTip')
        .d('查询界面高亮提示'),
      disabled: true,
    },
    {
      name: 'warningNoticeMethod',
      type: 'string',
      lookupCode: 'SSRC.PRICE_LIB_NOTICE_METHOD',
      multiple: true,
      label: intl
        .get('ssrc.priceLibDimension.model.dimension.warningNoticeMethod')
        .d('消息发送方式'),
      dynamicProps: {
        disabled: ({ record }) => {
          if (
            record.get('expireWarningFlag') &&
            record.get('warningNoticeFlag') &&
            record.get('templateStatus') !== 'RELEASED'
          ) {
            return false;
          } else {
            return true;
          }
        },
        required: ({ record }) => {
          if (record.get('warningNoticeFlag') && record.get('templateStatus') !== 'RELEASED') {
            return true;
          } else {
            return false;
          }
        },
      },
      transformRequest: (val) => val && val.toString(),
      transformResponse: (val) => val && val.split(','),
    },
    {
      name: 'warningTime',
      type: 'time',
      label: (
        <Tooltip
          placement="right"
          title={intl
            .get('ssrc.priceLibDimension.model.dimension.warningTime')
            .d('消息发送时间(h)')}
        >
          {intl.get('ssrc.priceLibDimension.model.dimension.warningTime').d('消息发送时间(h)')}
        </Tooltip>
      ),
      format: 'HH',
      defaultValue: moment('09', 'HH'),
      transformRequest: (val) => {
        if (val === null || val === undefined) {
          return null;
        }
        const hours = new Date(val).getHours();
        return hours < 10 ? `0${hours}:00` : `${hours}:00`;
      },
      transformResponse: (val) => (val === null ? null : moment(val, 'HH')),
      dynamicProps: {
        disabled: ({ record }) => {
          if (
            record.get('expireWarningFlag') &&
            record.get('warningNoticeFlag') &&
            record.get('templateStatus') !== 'RELEASED'
          ) {
            return false;
          } else {
            return true;
          }
        },
        required: ({ record }) => {
          if (record.get('warningNoticeFlag') && record.get('templateStatus') !== 'RELEASED') {
            return true;
          } else {
            return false;
          }
        },
      },
    },
    {
      name: 'warningNoticeFrequency',
      type: 'string',
      lookupCode: 'SSRC.PRICE_LIB_NOTICE_FREQUENCY',
      label: (
        <Tooltip
          placement="right"
          title={intl
            .get('ssrc.priceLibDimension.model.dimension.warningNotFreq')
            .d('到期提醒消息发送频率')}
        >
          {intl
            .get('ssrc.priceLibDimension.model.dimension.warningNotFreq')
            .d('到期提醒消息发送频率')}
        </Tooltip>
      ),
      dynamicProps: {
        disabled: ({ record }) => {
          if (
            record.get('expireWarningFlag') &&
            record.get('warningNoticeFlag') &&
            record.get('templateStatus') !== 'RELEASED'
          ) {
            return false;
          } else {
            return true;
          }
        },
        required: ({ record }) => {
          if (record.get('warningNoticeFlag') && record.get('templateStatus') !== 'RELEASED') {
            return true;
          } else {
            return false;
          }
        },
      },
    },
    {
      name: 'messageReceiver',
      type: 'string',
      lookupCode: 'SPC.EXPIRE_MESSAGE_RECEIVER_TYPE',
      multiple: true,
      label: intl
        .get('ssrc.priceLibDimension.model.dimension.warningNoticeReceiver')
        .d('消息接收者'),
      transformRequest: (val) => val && val.toString(),
      transformResponse: (val) => val && val.split(','),
      dynamicProps: {
        disabled: ({ record }) => {
          if (
            record.get('expireWarningFlag') &&
            record.get('warningNoticeFlag') &&
            record.get('templateStatus') !== 'RELEASED'
          ) {
            return false;
          } else {
            return true;
          }
        },
        required: ({ record }) => {
          if (record.get('warningNoticeFlag') && record.get('templateStatus') !== 'RELEASED') {
            return true;
          } else {
            return false;
          }
        },
      },
    },
    {
      name: 'warningNoticeReceiverLov',
      type: 'object',
      lovCode: 'HIAM.TENANT.USER',
      lovPara: {
        organizationId,
      },
      textField: 'realName',
      valueField: 'id',
      label: intl.get('ssrc.priceLibDimension.model.dimension.selectReceiver').d('选择接收人'),
      multiple: true,
      dynamicProps: {
        required: ({ record }) => {
          if (
            record.get('messageReceiver').includes('assigner') &&
            record.get('templateStatus') !== 'RELEASED'
          ) {
            return true;
          } else {
            return false;
          }
        },
        disabled: ({ record }) => {
          if (
            record.get('expireWarningFlag') &&
            record.get('warningNoticeFlag') &&
            record.get('templateStatus') !== 'RELEASED'
          ) {
            return false;
          } else {
            return true;
          }
        },
      },
    },
    {
      name: 'realName',
      type: 'string',
      bind: 'warningNoticeReceiverLov.loginName',
      multiple: ',',
    },
    {
      name: 'warningNoticeReceiver',
      type: 'string',
      bind: 'warningNoticeReceiverLov.id',
      multiple: ',',
    },
    {
      name: 'receiverMeaning',
      type: 'string',
      bind: 'warningNoticeReceiverLov.realName',
      multiple: ',',
    },
  ],

  transport: {
    read: ({ data }) => {
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-lib-templates/detail`,
        method: 'GET',
        data: { ...data, customizeUnitCode: 'SSRC.PRICE_LIB_NEW.EXPIRATIONWARNING' },
      };
    },

    submit: ({ data }) => {
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-lib-templates`,
        data,
        params: {
          customizeUnitCode: 'SSRC.PRICE_LIB_NEW.EXPIRATIONWARNING',
        },
        method: 'POST',
      };
    },
  },
});

const menuDS = () => ({
  primaryKey: 'viewConfId',
  fields: [
    {
      name: 'menuCode',
      type: 'string',
      required: true,
      label: intl.get('ssrc.priceLibDimension.model.dimension.menuCode').d('菜单编码'),
      validator: (value, _, record) => {
        const reg = /[a-z\u4e00-\u9fa5]/g;
        if (reg.test(record.get('menuCode'))) {
          return intl
            .get('ssrc.priceLibDimension.menuCode.validation.notLowercase')
            .d('菜单编码不能为中文和小写英文字母');
        }
        return true;
      },
    },
    {
      name: 'menuName',
      type: 'intl',
      required: true,
      label: intl.get('ssrc.priceLibDimension.model.dimension.menuName').d('菜单名称'),
    },
    {
      name: 'parentMenuIdLov',
      type: 'object',
      label: intl.get('ssrc.priceLibDimension.model.dimension.parentMenuIdLov').d('所属目录'),
      lovCode: 'HPFM.FUNCTION.SELECT',
      ignore: 'always',
      required: true,
      textField: 'name',
      valueField: 'code',
      dynamicProps: {
        lovPara: ({ record }) => {
          return {
            tenantId: record.get('tenantId'),
            groupCode: record.get('groupCode'),
          };
        },
      },
      lovDefineAxiosConfig: (lovCode) => {
        const lovConfig = lovDefineAxiosConfig(lovCode);
        return {
          ...lovConfig,
          transformResponse: [
            ...lovConfig.transformResponse,
            (data) => {
              return {
                ...data,
                dataSetProps: {
                  paging: false,
                  childrenField: 'childFunctions',
                  parentField: 'parentCode',
                  idField: 'code',
                },
              };
            },
          ],
        };
      },
      lovQueryAxiosConfig: (lovCode, _, { data }) => {
        return {
          url: `${HZERO_IAM}/v1/${organizationId}/function/parent/list`,
          method: 'GET',
          data: { lovCode, ...data },
        };
      },
    },
    {
      name: 'parentMenuId',
      type: 'string',
      bind: 'parentMenuIdLov.id',
    },
    {
      name: 'parentMenuCode',
      type: 'string',
      bind: 'parentMenuIdLov.code',
    },
  ],

  transport: {
    submit: ({ data }) => {
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-lib-templates/price-menu`,
        data: data[0],
        method: 'POST',
      };
    },
  },
});

export { listLineDS, viewConfigDS, warningDS, menuDS };
