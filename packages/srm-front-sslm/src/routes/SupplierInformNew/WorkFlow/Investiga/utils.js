/*
 * @Date: 2023-09-28
 * @Author: zlh
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

export const getToolTipPrefix = () =>
  intl.get('sslm.common.view.modifyBefore.toolTip').d('修改前：');

export const getDataSetProps = ({ dsProps, configName = '', readOnlyFlag = false } = {}) => {
  let props = dsProps;
  const { fields = [] } = dsProps;
  const field = {
    name: 'firmChangeBeanStateFlag',
    ignore: 'always',
    label: intl.get('sslm.common.model.common.changeType').d('变更类型'),
  };
  const newField = [...fields];
  if (readOnlyFlag) {
    newField.push(field);
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
  props = {
    ...dsProps,
    paging: false,
    fields: newField,
    transport: {
      read: readTransportProps,
    },
  };
  return props;
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
  sslmInvestgReserve5: 'firm-change-reserve5s',
  sslmInvestgReserve6: 'firm-change-reserve6s',
  sslmInvestgReserve7: 'firm-change-reserve7s',
  sslmInvestgReserve8: 'firm-change-reserve8s',
  sslmInvestgReserve9: 'firm-change-reserve9s',
  sslmInvestgReserve3: 'firm-change-reserve3s',
  sslmInvestgReserve4: 'firm-change-reserve4s',
  sslmInvestgReserve10: 'firm-change-reserve10s',
  sslmInvestgReserve11: 'firm-change-reserve11s',
  sslmInvestgReserve12: 'firm-change-reserve12s',
  sslmInvestgReserve13: 'firm-change-reserve13s',
  sslmInvestgReserve14: 'firm-change-reserve14s',
};

// 只读页面-采购方维度-调查表查询接口
export const getViewInvestgFetchUrl = {
  // 基本信息
  sslmInvestgBasic: 'enterprise-change/detail/investigate-basics',
  // 业务信息
  sslmInvestgBusiness: 'enterprise-change/detail/investigate-business',
  // 产品及服务
  // sslmInvestgProservice: 'enterprise-change/detail/investigate-proservices',
  sslmInvestgProservice: 'firmchange-req-all/query-firm-proservices',
  // 供应商分类
  sslmInvestgSupplierCate: 'enterprise-change/detail/investigate-cate',
  // 财务状况
  sslmInvestgFin: 'enterprise-change/detail/investigate-finances',
  // sslmInvestgFin: 'firmchange-req-all/query-sup-finance',
  // 分支机构
  // sslmInvestgFinBranch: 'enterprise-change/detail/investigate-finances-branchs',
  sslmInvestgFinBranch: 'firmchange-req-all/query-firm-finances-branchs',
  // 资质信息
  // sslmInvestgAuth: 'enterprise-change/detail/investigate-authes',
  sslmInvestgAuth: 'firmchange-req-all/query-firm-authes',
  // 联系人信息
  sslmInvestgContact: 'enterprise-change/detail/investigate-contacts',
  // sslmInvestgContact: 'firmchange-req-all/query-sup-contacts',
  // 地址信息
  sslmInvestgAddress: 'enterprise-change/detail/investigate-addresses',
  // sslmInvestgAddress: 'firmchange-req-all/query-sup-address',
  // 开户行信息
  sslmInvestgBankAccount: 'enterprise-change/detail/investigate-bank-accounts',
  // sslmInvestgBankAccount: 'firmchange-req-all/query-sup-bank-acc',
  // 主要客户情况
  // sslmInvestgCustomer: 'enterprise-change/detail/investigate-customers',
  sslmInvestgCustomer: 'firmchange-req-all/query-firm-customers',
  // 分供方情况
  // sslmInvestgSubSupplier: 'enterprise-change/detail/investigate-sub-suppliers',
  sslmInvestgSubSupplier: 'firmchange-req-all/query-firm-sub-suppliers',
  // 设备信息
  // sslmInvestgEquipment: 'enterprise-change/detail/investigate-equipments',
  sslmInvestgEquipment: 'firmchange-req-all/query-firm-equipments',
  // 研发能力[同]
  sslmInvestgRd: 'enterprise-change/detail/investigate-rds',
  // 生产[同]
  sslmInvestgProduce: 'enterprise-change/detail/investigate-produces',
  // 质保能力[同]
  sslmInvestgQa: 'enterprise-change/detail/investigate-qas',
  // 售后服务[同]
  sslmInvestgCustservice: 'enterprise-change/detail/investigate-custservices',
  // 附件信息
  sslmInvestgAttachment: 'enterprise-change/detail/investigate-attachments',
  // sslmInvestgAttachment: 'firmchange-req-all/query-sup-attachment',
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
};
