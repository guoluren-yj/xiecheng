/*
 * @Date: 2023-08-25 11:12:39
 * @Author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { SRM_SSLM, SRM_PLATFORM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { isEmpty, forEach, isArray, isFunction } from 'lodash';
import { DataSet } from 'choerodon-ui/pro';

import {
  PERSONALIZE_COINCIDE_TABS,
  renderStatus,
  getFieldHiddenProps,
  handleCompareRender,
} from '@/routes/components/utils';
import { dealConfigData } from '@/routes/components/Investigation/utils';
import { getInvestigationDS as getEditDS } from '@/routes/components/Investigation/stores/getInvestigationDS';
import { getInvestigationDS as getViewDS } from '@/routes/components/Investigation/Compare/stores/getInvestigationDS';

const organizationId = getCurrentOrganizationId();

// 明细头标题
export const getHeaderTitle = status => {
  switch (status) {
    case 'edit':
      return intl
        .get('sslm.enterpriseInform.view.title.editApplication')
        .d('编辑企业信息变更申请单');
    default:
      return intl
        .get('sslm.enterpriseInform.view.title.viewApplication')
        .d('查看企业信息变更申请单');
  }
};

export const getToolTipPrefix = () =>
  intl.get('sslm.common.view.modifyBefore.toolTip').d('修改前：');

// 主要身份
export const businessTypeMap = () => [
  { text: intl.get('spfm.enterprise.view.message.purchase').d('我要采购'), value: 'purchase' },
  { text: intl.get('spfm.enterprise.view.message.sale').d('我要销售'), value: 'sale' },
];

// 经营性质
export const serviceTypeMap = () => [
  {
    text: intl.get('spfm.enterprise.view.message.manufacturer').d('制造商'),
    value: 'manufacturer',
  },
  { text: intl.get('spfm.enterprise.view.message.trader').d('贸易商'), value: 'trader' },
  { text: intl.get('spfm.enterprise.view.message.servicer').d('服务商'), value: 'servicer' },
  { text: intl.get('spfm.enterprise.view.message.agent').d('代理商'), value: 'agent' },
  {
    text: intl.get('spfm.certificationApproval.model.detailForm.integration').d('集成商'),
    value: 'integration',
  },
  {
    text: intl.get('spfm.certificationApproval.model.detailForm.contractor').d('承包商'),
    value: 'contractor',
  },
  {
    text: intl.get('spfm.certificationApproval.model.detailForm.dealer').d('经销商'),
    value: 'dealer',
  },
];

// 处理查看页面标红接口
export const getReadTransport = (param = {}) => {
  const { key, dataSet, code = '', operateType = null } = param;
  const { changeReqId, partnerTenantId, changeLevel, companyId, newFirmChangeInsertFlag } =
    dataSet.getState('dsState') || {};
  const wfParams = dataSet.getState('wfParams') || {}; // 工作流审批参数
  const isAllPlatform = partnerTenantId === '-1' || changeLevel === 'PLATFORM';
  const url = isAllPlatform
    ? `${SRM_PLATFORM}/v1/${`${organizationId}/`}${getPlatformFetchUrl[key]}`
    : `${SRM_SSLM}/v1/${`${organizationId}/`}${getPurchaserFetchUrl[key]}`;
  return {
    url,
    method: 'GET',
    params: {},
    data: {
      changeReqId,
      dataSource: 1,
      customizeUnitCode: isAllPlatform ? null : code,
      customizeTenantId: isAllPlatform ? null : partnerTenantId,
      changeType: operateType || null,
      partnerTenantId,
      purchaseTenantId: partnerTenantId,
      // 平台维度单据额外参数
      companyId: isAllPlatform ? companyId : null,
      newFirmChangeInsertFlag:
        !isAllPlatform &&
        ['contactInfo', 'addressInfo', 'bankInfo', 'financeInfo', 'attachmentInfo'].includes(key)
          ? newFirmChangeInsertFlag
          : undefined, // 对应变更采购方的重合页签需要这个参数
      ...wfParams,
      desensitize: false,
    },
  };
};

// 重新组装ds属性
export const getDataSetProps = ({ dsProps, configName = '', readOnlyFlag = false } = {}) => {
  let props = dsProps;
  const { fields = [] } = dsProps;
  let newField = fields;
  // src-52225【司顺】调查表带出的联系人银行不能编辑
  switch (configName) {
    case 'sslmInvestgContact':
    case 'sslmInvestgBankAccount':
      newField = [
        // editFlag处理新增行数据表格小保存不刷新数据，导致未拿到后端返回的editFlag，导致字段不可编辑
        {
          name: 'editFlag',
          defaultValue: 1,
        },
        ...fields.map(field => {
          const { name, computedProps = {}, computedProps: { disabled } = {} } = field;
          if (['name', 'bankAccountNum'].includes(name)) {
            return {
              ...field,
              computedProps: {
                ...computedProps,
                disabled: ({ record, ...rest }) => {
                  const editFlag = !+record.get('editFlag');
                  if (editFlag && record.status !== 'add') {
                    return true;
                  } else if (isFunction(disabled)) {
                    return disabled({ record, ...rest });
                  } else {
                    return disabled;
                  }
                },
              },
            };
          }
          return field;
        }),
      ];
      break;
    default:
      break;
  }
  const readTransportProps = ({ data: { queryParam = {} } = {} }) => {
    const interfaceName = !readOnlyFlag
      ? getEditInvestgFetchUrl[configName]
      : getViewInvestgFetchUrl[configName];
    const url = `${SRM_SSLM}/v1/${`${organizationId}/`}${interfaceName}`;
    return interfaceName
      ? {
          url,
          method: 'GET',
          data: { ...queryParam },
        }
      : {};
  };
  const submitTransportProps = () => {
    const interfaceName = getInvestgSaveUrls[configName];
    return interfaceName
      ? {
          url: `${SRM_SSLM}/v1/${`${organizationId}/`}${interfaceName}`,
          method: 'POST',
        }
      : {};
  };
  const deleteTransportProps = () => {
    const interfaceName = getInvestgDeleteUrls[configName];
    return interfaceName
      ? {
          url: `${SRM_SSLM}/v1/${`${organizationId}/`}${interfaceName}`,
          method: 'DELETE',
        }
      : {};
  };
  props = {
    ...dsProps,
    paging: false,
    fields: newField,
    transport: {
      read: readTransportProps,
      submit: submitTransportProps,
      destroy: deleteTransportProps,
    },
  };
  return props;
};

// 只读页面-平台维度单据-标准页签查询接口
const getPlatformFetchUrl = {
  basicInfo: 'com-basic-req/compare-company-basic',
  businessInfo: 'com-business-req/compare-company-business',
  contactInfo: 'firm-change-compare/contacts-compare',
  addressInfo: 'firm-change-compare/address-compare',
  bankInfo: 'firm-change-compare/bank-acc-compare',
  invoiceInfo: 'com-invoice-reqs/compare',
  financeInfo: 'firm-change-compare/finace-compare',
  attachmentInfo: 'firm-change-compare/attachment-compare',
};

// 只读页面-采购方维度-标准页签查询接口
const getPurchaserFetchUrl = {
  basicInfo: 'firmchange-req-all/query-sup-basic',
  businessInfo: 'firmchange-req-all/query-sup-bussiness',
  contactInfo: 'firmchange-req-all/query-sup-contacts',
  addressInfo: 'firmchange-req-all/query-sup-address',
  bankInfo: 'firmchange-req-all/query-sup-bank-acc',
  invoiceInfo: 'firmchange-req-all/query-sup-invoice',
  financeInfo: 'firmchange-req-all/query-sup-finance',
  attachmentInfo: 'firmchange-req-all/query-sup-attachment',
  changeCate: 'firmchange-req-all/query-sup-cate',
  changeOtherInfo: 'firmchange-req-all/query-sup-other',
};

// 编辑页面-采购方维度-调查表查询接口
export const getEditInvestgFetchUrl = {
  sslmInvestgBasic: 'firm-change-basics/detail',
  sslmInvestgBusiness: 'firm-change-businesss/detail',
  sslmInvestgProservice: 'firm-change-proservices',
  sslmInvestgFinBranch: 'firm-change-fin-branchs/list',
  sslmInvestgAuth: 'firm-change-auths',
  sslmInvestgCustomer: 'firm-change-customers',
  sslmInvestgSubSupplier: 'firm-change-sub-sups',
  sslmInvestgEquipment: 'firm-change-equipments',
  sslmInvestgRd: 'firm-change-rds/detail',
  sslmInvestgProduce: 'firm-change-produces/detail',
  sslmInvestgQa: 'firm-change-qas/detail',
  sslmInvestgCustservice: 'firm-change-custsers/detail',
  sslmInvestgReserve1: 'firm-change-reserve1s',
  sslmInvestgReserve2: 'firm-change-reserve2s',
  sslmInvestgReserve3: 'firm-change-reserve3s',
  sslmInvestgReserve4: 'firm-change-reserve4s',
  sslmInvestgReserve5: 'firm-change-reserve5s',
  sslmInvestgReserve6: 'firm-change-reserve6s',
  sslmInvestgReserve7: 'firm-change-reserve7s',
  sslmInvestgReserve8: 'firm-change-reserve8s',
  sslmInvestgReserve9: 'firm-change-reserve9s',
  sslmInvestgReserve10: 'firm-change-reserve10s',
  sslmInvestgReserve11: 'firm-change-reserve11s',
  sslmInvestgReserve12: 'firm-change-reserve12s',
  sslmInvestgReserve13: 'firm-change-reserve13s',
  sslmInvestgReserve14: 'firm-change-reserve14s',
  // 调查表重合页签
  sslmInvestgContact: 'firm-change-contacts',
  sslmInvestgAddress: 'firm-change-addresss/firm-change-address',
  sslmInvestgBankAccount: 'firm-change-bk-accounts/firm-change-bk-account',
  sslmInvestgFin: 'firm-change-fins',
  sslmInvestgAttachment: 'firm-change-attachments',
};

// 只读页面-采购方维度-调查表查询接口
export const getViewInvestgFetchUrl = {
  sslmInvestgBasic: 'enterprise-change/detail/investigate-basics',
  sslmInvestgBusiness: 'enterprise-change/detail/investigate-business',
  // 产品及服务
  sslmInvestgProservice: 'firmchange-req-all/query-firm-proservices',
  // 分支机构
  sslmInvestgFinBranch: 'firmchange-req-all/query-firm-finances-branchs',
  // 资质信息
  sslmInvestgAuth: 'firmchange-req-all/query-firm-authes',
  // 主要客户情况
  sslmInvestgCustomer: 'firmchange-req-all/query-firm-customers',
  // 分供方情况
  sslmInvestgSubSupplier: 'firmchange-req-all/query-firm-sub-suppliers',
  // 设备信息
  sslmInvestgEquipment: 'firmchange-req-all/query-firm-equipments',
  // 研发能力
  sslmInvestgRd: 'enterprise-change/detail/investigate-rds',
  // 生产
  sslmInvestgProduce: 'enterprise-change/detail/investigate-produces',
  // 质保能力
  sslmInvestgQa: 'enterprise-change/detail/investigate-qas',
  // 售后服务
  sslmInvestgCustservice: 'enterprise-change/detail/investigate-custservices',
  //  预留表格
  sslmInvestgReserve1: 'firmchange-req-all/query-firm-reserve1',
  sslmInvestgReserve2: 'firmchange-req-all/query-firm-reserve2',
  sslmInvestgReserve5: 'firmchange-req-all/query-firm-reserve5',
  sslmInvestgReserve6: 'firmchange-req-all/query-firm-reserve6',
  sslmInvestgReserve7: 'firmchange-req-all/query-firm-reserve7',
  sslmInvestgReserve8: 'firmchange-req-all/query-firm-reserve8',
  sslmInvestgReserve9: 'firmchange-req-all/query-firm-reserve9',
  //  预留表单
  sslmInvestgReserve3: 'enterprise-change/detail/investigate-reserve3',
  sslmInvestgReserve4: 'enterprise-change/detail/investigate-reserve4',
  sslmInvestgReserve10: 'enterprise-change/detail/investigate-reserve10',
  sslmInvestgReserve11: 'enterprise-change/detail/investigate-reserve11',
  sslmInvestgReserve12: 'enterprise-change/detail/investigate-reserve12',
  sslmInvestgReserve13: 'enterprise-change/detail/investigate-reserve13',
  sslmInvestgReserve14: 'enterprise-change/detail/investigate-reserve14',
  // 调查表重合页签
  sslmInvestgContact: 'firmchange-req-all/query-firm-contacts',
  sslmInvestgAddress: 'firmchange-req-all/query-firm-address',
  sslmInvestgBankAccount: 'firmchange-req-all/query-firm-bank-acc',
  sslmInvestgFin: 'firmchange-req-all/query-firm-finances',
  sslmInvestgAttachment: 'firmchange-req-all/query-firm-attachment',
};

// 保存调查表接口配置表
export const getInvestgSaveUrls = {
  sslmInvestgContact: 'firm-change-contacts/firm-change-contact-save', // 联系人信息
  sslmInvestgAddress: 'firm-change-addresss/firm-change-address-save', // 地址信息
  sslmInvestgFin: 'firm-change-fins/save-firm-change-Fin', // 近三年财务状况
  sslmInvestgAttachment: 'firm-change-attachments/save-firm-change-attachment', // 附件信息
  sslmInvestgBankAccount: 'firm-change-bk-accounts/save-firm-change-bk-account', // 开户行信息
  sslmInvestgFinBranch: 'firm-change-fin-branchs/save-firm-change-finbranch', // 分支机构
  sslmInvestgProservice: 'firm-change-proservices/save-firm-change-proservice', // 产品及服务
  sslmInvestgAuth: 'firm-change-auths/save-firm-change-auth', // 资质信息
  sslmInvestgCustomer: 'firm-change-customers/save-firm-change-customer', // 主要客户情况
  sslmInvestgSubSupplier: 'firm-change-sub-sups/save-firm-change-sub-sup', // 分供方情况
  sslmInvestgEquipment: 'firm-change-equipments/save-firm-change-equipment', // 设备信息
  sslmInvestgReserve1: 'firm-change-reserve1s/save-firm-change-reserve1', // 预留表格页签1
  sslmInvestgReserve2: 'firm-change-reserve2s/save-firm-change-reserve2', // 预留表格页签2
  sslmInvestgReserve5: 'firm-change-reserve5s/save-firm-change-reserve5', // 预留表格页签3
  sslmInvestgReserve6: 'firm-change-reserve6s/save-firm-change-reserve6', // 预留表格页签4
  sslmInvestgReserve7: 'firm-change-reserve7s/save-firm-change-reserve7', // 预留表格页签5
  sslmInvestgReserve8: 'firm-change-reserve8s/save-firm-change-reserve8', // 预留表格页签6
  sslmInvestgReserve9: 'firm-change-reserve9s/save-firm-change-reserve9', // 预留表格页签7
};

// 删除调查表数据接口配置
export const getInvestgDeleteUrls = {
  sslmInvestgFinBranch: 'firm-change-fin-branchs/delete', // 分支机构
  sslmInvestgProservice: 'firm-change-proservices/delete', // 产品及服务
  sslmInvestgAuth: 'firm-change-auths/delete', // 资质信息
  sslmInvestgCustomer: 'firm-change-customers/delete', // 主要客户情况
  sslmInvestgSubSupplier: 'firm-change-sub-sups/delete', // 分供方情况
  sslmInvestgEquipment: 'firm-change-equipments/delete', // 设备信息
  sslmInvestgReserve1: 'firm-change-reserve1s/delete', // 预留表格页签1
  sslmInvestgReserve2: 'firm-change-reserve2s/delete', // 预留表格页签2
  sslmInvestgReserve5: 'firm-change-reserve5s/delete', // 预留表格页签3
  sslmInvestgReserve6: 'firm-change-reserve6s/delete', // 预留表格页签4
  sslmInvestgReserve7: 'firm-change-reserve7s/delete', // 预留表格页签5
  sslmInvestgReserve8: 'firm-change-reserve8s/delete', // 预留表格页签6
  sslmInvestgReserve9: 'firm-change-reserve9s/delete', // 预留表格页签7
  sslmInvestgAttachment: 'firm-change-attachments/delete', // 附件信息
  sslmInvestgFin: 'firm-change-fins/delete', // 近三年财务状况
  sslmInvestgContact: 'firm-change-contacts/delete', // 联系人
  sslmInvestgAddress: 'firm-change-addresss/delete', // 地址
  sslmInvestgBankAccount: 'firm-change-bk-accounts/delete', // 银行
};

// 调查表配置处理
export const getInvestgProps = ({ remote, temptConfig = {}, queryParam = {}, editable = true }) => {
  if (isEmpty(temptConfig)) {
    return {};
  }
  const { configList: newConfigList = [] } = dealConfigData(temptConfig) || {};
  // 处理只读时多一列变更类型字段
  let finalConfigList = newConfigList;
  if (!editable) {
    finalConfigList = newConfigList.map(item => {
      const { lines } = item;
      const newLine = [...lines];
      newLine.unshift({
        componentType: 'SELECT',
        fieldCode: 'firmChangeBeanStateFlag',
        renderer: renderStatus,
        fieldType: 'cuz',
        fieldDescription: intl.get('sslm.common.model.common.changeType').d('变更类型'),
        props: [],
      });
      return {
        ...item,
        lines: newLine,
      };
    });
  }
  const configNameList = finalConfigList
    .filter(i => PERSONALIZE_COINCIDE_TABS.includes(i.configName))
    .map(i => i.configName);
  const coincideTemptConfig = finalConfigList.filter(i =>
    PERSONALIZE_COINCIDE_TABS.includes(i.configName)
  );
  const allInvestgProps = handleDataSet({
    remote,
    config: coincideTemptConfig,
    queryParam,
    editable,
  });
  const { dsList, componentProps } = allInvestgProps;
  return { allInvestgDs: dsList, configNameList, componentProps };
};

// 生成所有的ds
const handleDataSet = ({ remote, config, queryParam = {}, editable }) => {
  const dsList = {};
  const componentProps = {};
  if (isArray(config)) {
    forEach(config, item => {
      const { configName } = item;
      const { dataSet } = dealDataSet({ remote, config: item, queryParam, editable }) || {};
      dsList[configName] = dataSet;
      componentProps[configName] = getInvestgComponentProps({ config: item, dataSet });
    });
  }
  return { dsList, componentProps };
};

// 根据配置生成单个DataSet
const dealDataSet = ({ remote, config, editable = true, queryParam = {} }) => {
  const { configName } = config;
  if (configName) {
    const dsProps = editable
      ? getEditDS({ config, allowDeleteAllLineFlag: false })
      : getViewDS(config);
    // 处理数据
    const newDsProps = getDataSetProps({ dsProps, configName, readOnlyFlag: !editable });
    const remoteDsProps = remote
      ? remote.process('SSLM_ENTERPRISE_INFO_NEW_DETAIL_INVESTG_DS_PROPS', newDsProps, {
          configName,
          editable,
        })
      : newDsProps;
    const dataSet = new DataSet(remoteDsProps);
    dataSet.setQueryParameter('queryParam', queryParam);
    return { dataSet };
  }
};

export const getInvestgComponentProps = ({ config = {} }) => {
  const { configName, lines, remark } = config;
  return {
    remark,
    columns: lines,
    source: 'enterpriseInform',
    pageSource: 'enterpriseInform',
    configName,
    organizationId,
  };
};

// 处理字段渲染
export const getRenderFieldProps = ({
  currentRecord,
  fieldName,
  fieldType,
  displayField,
  fieldValue,
  hidden,
}) => {
  const hiddenProps = getFieldHiddenProps({ record: currentRecord, name: fieldName, hidden });
  return {
    hidden: { ...hiddenProps },
    renderer: ({ value, record, name, renderType, renderDisplayField }) =>
      handleCompareRender({
        value: fieldValue || value,
        record,
        name: fieldName || name,
        type: renderType || fieldType,
        displayField: renderDisplayField || displayField,
        toolTipPrefix: getToolTipPrefix(),
      }),
  };
};
