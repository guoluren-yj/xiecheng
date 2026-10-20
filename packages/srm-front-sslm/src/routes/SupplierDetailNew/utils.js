/*
 * @Date: 2023-08-16 14:43:43
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { isEmpty, map, sortBy, forEach } from 'lodash';

import intl from 'utils/intl';
import PositionAnchor from '_components/PositionAnchor';

import RegistrationInfo from './EnterpriseBasicInfo/components/RegistrationInfo'; // 登记信息
import BusinessInfo from './EnterpriseBasicInfo/components/BusinessInfo'; // 业务信息
import Contact from './EnterpriseBasicInfo/components/Contact'; // 联系人
import Address from './EnterpriseBasicInfo/components/Address'; // 地址
import BankAccount from './EnterpriseBasicInfo/components/BankAccount'; // 银行账户
import InvoiceInfo from './EnterpriseBasicInfo/components/InvoiceInfo'; // 开票信息
import Financial from './EnterpriseBasicInfo/components/Financial'; // 财务状况
import SupplierClassify from './EnterpriseBasicInfo/components/SupplierClassify'; // 供应商分类
import SupplyAbility from './EnterpriseBasicInfo/components/SupplyAbility'; // 供货能力清单
import PurchaseInfo from './EnterpriseBasicInfo/components/PurchaseInfo'; // 采购财务信息
import OtherInfo from './EnterpriseBasicInfo/components/OtherInfo'; // 其他信息
import Attachment from './EnterpriseBasicInfo/components/Attachment'; // 附件信息

const { Link } = PositionAnchor;

// 企业基础信息 tab汇总
export const getEnterpriseBasicInfoTab = () => {
  return [
    {
      key: 'basic',
      lable: intl.get('sslm.supplierDetail.view.message.title.registrationInfo').d('登记信息'),
      component: RegistrationInfo,
    },
    {
      key: 'business',
      lable: intl.get('sslm.supplierDetail.view.message.basicBusinessInfo').d('基础业务信息'),
      component: BusinessInfo,
    },
    {
      key: 'supplierContact',
      lable: intl.get('sslm.supplierDetail.view.message.title.supplierContact').d('联系人'),
      component: Contact,
    },
    {
      key: 'supplierAddress',
      lable: intl.get('sslm.supplierDetail.view.title.supplierAddress').d('地址'),
      component: Address,
    },
    {
      key: 'supplierBankAccount',
      lable: intl.get('sslm.supplierDetail.view.message.bankInfo').d('银行信息'),
      component: BankAccount,
    },
    {
      key: 'invoice',
      lable: intl.get('sslm.supplierDetail.view.message.invoiceInfo').d('开票信息'),
      component: InvoiceInfo,
    },
    {
      key: 'financeList',
      lable: intl.get('sslm.supplierDetail.view.message.financialStatus').d('财务状况'),
      component: Financial,
    },
    {
      key: 'attachmentList',
      lable: intl.get('sslm.supplierDetail.model.supplierDetail.attachmentMessage').d('附件信息'),
      component: Attachment,
    },
    {
      key: 'supplierClassify',
      lable: intl.get('sslm.supplierDetail.view.message.title.supplierClass').d('供应商分类'),
      component: SupplierClassify,
    },
    {
      key: 'supplierAbility',
      lable: intl
        .get('sslm.supplierDetail.view.message.title.supplyCapacityList')
        .d('供货能力清单'),
      component: SupplyAbility,
    },
    {
      key: 'purchaseList',
      lable: intl.get('sslm.supplierDetail.view.message.title.purchaseList').d('采购/财务信息'),
      component: PurchaseInfo,
    },
    {
      key: 'otherInfo',
      lable: intl.get('sslm.supplierDetail.view.message.otherInfo').d('其他信息'),
      component: OtherInfo,
    },
  ];
};

// 获取【企业基础信息】和【补充信息】导航页签
export const getPositionList = ({ custConfig, configList, modelTableConfig }) => {
  // 【企业基础信息】导航页签
  const enterpriseCustFields = sortBy(
    (custConfig['SSLM.SUPPLIER_360_PAGE_ENTERPRISE.TABS'] || {}).fields || [],
    ['seq']
  );
  const enterpriseCustFieldVisible = enterpriseCustFields.filter(field => field.visible !== 0);
  const enterpriseBasicInfoTab = getEnterpriseBasicInfoTab();
  const enterpriseNewList = [];
  forEach(enterpriseCustFieldVisible, custField => {
    const currentItem = enterpriseBasicInfoTab.find(
      enterpriseItem => enterpriseItem.key === custField.fieldCode
    );
    if (!isEmpty(currentItem)) {
      enterpriseNewList.push(currentItem);
    } else {
      enterpriseNewList.push(custField);
    }
  });
  const newEnterpriseList = enterpriseNewList.map(item => ({
    href: item.key || item.fieldCode,
    title: item.lable || item.fieldName,
  }));
  // 模型表页签
  const modelTableList = map(modelTableConfig, config => ({
    href: config.tableCode,
    title: config.tableName,
  }));
  // 【企业基础信息】、模型表页签合并
  const enterpriseList = newEnterpriseList.concat(modelTableList);
  // 【补充信息】导航页签
  const investigList = map(configList, config => ({
    href: config.configName,
    title: config.configDescription,
  }));
  // 最终需展示的list
  const positionList = [
    {
      href: 'riskProfile',
      title: intl.get('sslm.common.view.title.riskProfile').d('风险档案'),
    },
    {
      href: 'lifeCycleCourse',
      title: intl.get('sslm.supplierDetail.view.title.lifeCycleCourse').d('供应商生命周期历程'),
    },
    {
      href: 'enterpriseBasicInfo',
      title: intl.get('sslm.supplierDetail.view.title.enterpriseBasicInfo').d('企业基础信息'),
      children: enterpriseList,
    },
    {
      href: 'supplementaryInfo',
      title: intl.get('sslm.supplierDetail.view.title.supplementaryInfo').d('补充信息'),
      children: investigList,
    },
  ];
  return { investigList, enterpriseList, positionList };
};

// 渲染定位轴
export const renderPositionLink = ({
  custConfig,
  configList = [],
  modelTableConfig,
  onAnchorClick,
  setAnchorRef,
}) => {
  const { positionList } = getPositionList({ custConfig, configList, modelTableConfig });
  return (
    <PositionAnchor
      bounds={100}
      onClick={onAnchorClick}
      style={{ maxHeight: 'calc(100vh - 340px)' }}
      getContainer={() => document.getElementById('supplierDetailWrap')}
      onRef={ref => {
        setAnchorRef(ref);
      }}
    >
      {positionList.map(link => {
        const { children } = link;
        return isEmpty(children) ? (
          <Link href={`#${link.href}`} title={link.title} />
        ) : (
          <Link href={`#${link.href}`} title={link.title}>
            {children.map(child => {
              return <Link href={`#${child.href}`} title={child.title} />;
            })}
          </Link>
        );
      })}
    </PositionAnchor>
  );
};
