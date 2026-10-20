/*
 * @Date: 2023-09-15 11:16:50
 * @Author: zlh
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { Tabs } from 'choerodon-ui/pro';
import React, { useState } from 'react';
import { isFunction, head, isNil, isEmpty } from 'lodash';

import intl from 'utils/intl';
import ComposeTable from '@/routes/components/Investigation/Compose/ComposeTable';
import CompanyBaseInfo from '../../CompanyBaseInfo'; // 企业基本信息
import BusinessInfo from '../../BusinessInfo'; // 业务信息
import ContactPerson from '../../ContactPerson'; // 联系人信息
import AddressInfo from '../../AddressInfo'; // 地址信息
import BankAccount from '../../BankAccount'; // 银行信息
import InvoiceInfo from '../../InvoiceInfo'; // 开票信息
import FinanceInfo from '../../FinanceInfo'; // 财务信息
import PurchaseInfo from '../../PurchaseInfo'; // 采购财务信息
import AttachmentInfo from '../../AttachmentInfo'; // 附件信息
import OtherInfo from '../../OtherInfo'; // 其它信息

const { TabPane } = Tabs;

const Index = ({ commonProps }) => {
  const {
    entryBaseInfo,
    changeReqId,
    domesticForeignRelation,
    companyBaseInfo,
    companyBaseInfoDs,
    businessInfoDs,
    contactPersonDs,
    addressInfoDS,
    bankInfoDS,
    invoiceDS,
    financeDS,
    attachmentDS,
    otherInfoDs,
    purchaseLineDS,
    purchaseHeaderDS,
    customizeForm,
    customizeTable,
    customizeTabPane,
    custLoading,
    disabledObj,
    configNameList,
    isEdit = false,
    templateDsList,
    duplicateConfigList,
  } = commonProps;

  const companyOtherInfoList = [
    {
      key: 'companyBaseInfo',
      title: intl.get('sslm.enterpriseInform.view.model.companyInfo.title').d('登记信息'),
      render: () => (
        <CompanyBaseInfo
          dataSet={companyBaseInfoDs}
          isEdit={isEdit}
          disabledObj={disabledObj}
          changeReqId={changeReqId}
          custLoading={custLoading}
          customizeForm={customizeForm}
          customizeUnitCode={
            isEmpty(companyBaseInfo)
              ? ''
              : Number(domesticForeignRelation) === 0
              ? 'SSLM.SUPPLIER_ENTRY_DETAIL_CUSTOM.BASIC_INFO_OVERSEAS'
              : Number(domesticForeignRelation) === 1
              ? 'SSLM.SUPPLIER_ENTRY_DETAIL_CUSTOM.BASIC_INFO_DOMESTIC'
              : ''
          }
          licenseFormcode="SSLM.SUPPLIER_ENTRY_DETAIL_CUSTOM.BASIC_INFO_LICENSE"
        />
      ),
    },
    {
      key: 'businessInfo',
      title: intl.get('sslm.supplierEntryDetail.view.entry.businessInfo').d('基础业务信息'),
      render: () => (
        <BusinessInfo
          dataSet={businessInfoDs}
          isEdit={isEdit}
          changeReqId={changeReqId}
          personalFlag={+domesticForeignRelation === 2}
          domesticFlag={+domesticForeignRelation}
          readOnly
          customizeForm={customizeForm}
          custLoading={custLoading}
          companyBaseInfo={companyBaseInfo}
          disabledObj={disabledObj}
          customizeUnitCode="SSLM.SUPPLIER_ENTRY_DETAIL_CUSTOM.BUSINESS_INFO"
        />
      ),
      hidden: !configNameList.includes('businessInfo'),
    },
    // 有调查表展示调查表
    {
      key: 'contactPerson',
      title: intl.get('sslm.supplierEntryDetail.view.entry.contactPerson').d('联系人'),
      render: () => {
        return templateDsList.sslmInvestgContact ? (
          <ComposeTable
            dataSet={templateDsList.sslmInvestgContact}
            columns={
              (duplicateConfigList.find(i => i.configName === 'sslmInvestgContact') || {}).lines
            }
            editable={false}
            configName="sslmInvestgContact"
          />
        ) : (
          <ContactPerson
            changeReqId={changeReqId}
            dataSet={contactPersonDs}
            entryBaseInfo={entryBaseInfo}
            domesticForeignRelation={domesticForeignRelation}
            isEdit={isEdit}
            customizeTable={customizeTable}
            custLoading={custLoading}
            customizedCode="SSLM.SUPPLIER_ENTRY_DETAIL_CUSTOM.CONTACT_INFO"
            disabledObj={disabledObj}
          />
        );
      },
      hidden:
        !configNameList.includes('spfmCompanyContact') && isNil(templateDsList.sslmInvestgContact),
    },
    // 有调查表展示调查表
    {
      key: 'address',
      title: intl.get('sslm.supplierEntryDetail.view.entry.address').d('地址'),
      render: () => {
        return templateDsList.sslmInvestgAddress ? (
          <ComposeTable
            dataSet={templateDsList.sslmInvestgAddress}
            columns={
              (duplicateConfigList.find(i => i.configName === 'sslmInvestgAddress') || {}).lines
            }
            editable={false}
            configName="sslmInvestgAddress"
          />
        ) : (
          <AddressInfo
            dataSet={addressInfoDS}
            isEdit={isEdit}
            companyBaseInfo={companyBaseInfo}
            businessInfoDs={businessInfoDs}
            domesticForeignRelation={domesticForeignRelation}
            custLoading={custLoading}
            customizeTable={customizeTable}
            customizeUnitCode="SSLM.SUPPLIER_ENTRY_DETAIL_CUSTOM.ENTRY_ADDRESS_INFO"
            disabledObj={disabledObj}
          />
        );
      },
      hidden:
        !configNameList.includes('spfmCompanyAddress') && isNil(templateDsList.sslmInvestgAddress),
    },
    // 有调查表展示调查表
    {
      key: 'bankInfo',
      title: intl.get('sslm.supplierEntryDetail.view.entry.bankInfo').d('银行信息'),
      render: () => {
        return templateDsList.sslmInvestgBankAccount ? (
          <ComposeTable
            dataSet={templateDsList.sslmInvestgBankAccount}
            columns={
              (duplicateConfigList.find(i => i.configName === 'sslmInvestgBankAccount') || {}).lines
            }
            editable={false}
            configName="sslmInvestgBankAccount"
          />
        ) : (
          <BankAccount
            dataSet={bankInfoDS}
            isEdit={isEdit}
            companyBaseInfo={companyBaseInfo}
            customizeTable={customizeTable}
            custLoading={custLoading}
            customizedCode="SSLM.SUPPLIER_ENTRY_DETAIL_CUSTOM.BANK_INFO"
            disabledObj={disabledObj}
          />
        );
      },
      hidden:
        !configNameList.includes('spfmCompanyBankAccount') &&
        isNil(templateDsList.sslmInvestgBankAccount),
    },
    {
      key: 'billingInfo',
      title: intl.get('sslm.supplierEntryDetail.view.entry.billingInfo').d('开票信息'),
      render: () => (
        <InvoiceInfo
          dataSet={invoiceDS}
          isEdit={isEdit}
          custLoading={custLoading}
          customizeForm={customizeForm}
          disabledObj={disabledObj}
          customizeUnitCode="SSLM.SUPPLIER_ENTRY_DETAIL_CUSTOM.INVOICE_FORM"
        />
      ),
      hidden: !configNameList.includes('spfmCompanyInvoice'),
    },
    // 有调查表展示调查表
    {
      key: 'financialInfo',
      title: intl.get('sslm.supplierEntryDetail.view.entry.financialInfo').d('财务信息'),
      render: () => {
        return templateDsList.sslmInvestgFin ? (
          <ComposeTable
            dataSet={templateDsList.sslmInvestgFin}
            columns={(duplicateConfigList.find(i => i.configName === 'sslmInvestgFin') || {}).lines}
            editable={false}
            configName="sslmInvestgFin"
          />
        ) : (
          <FinanceInfo
            dataSet={financeDS}
            isEdit={isEdit}
            companyBaseInfo={companyBaseInfo}
            disabledObj={disabledObj}
          />
        );
      },
      hidden: !configNameList.includes('spfmCompanyFin') && isNil(templateDsList.sslmInvestgFin),
    },
    {
      key: 'purchaseInfo',
      title: intl.get('sslm.common.view.title.purchaseInfo').d('采购财务信息'),
      render: () => (
        <PurchaseInfo
          isEdit={false}
          purchaseHeaderDS={purchaseHeaderDS}
          purchaseLineDS={purchaseLineDS}
          custLoading={custLoading}
          customizeForm={customizeForm}
          customizeTable={customizeTable}
          headerCustCode="SSLM.SUPPLIER_ENTRY_DETAIL_CUSTOM.PURCHASE_HEAD"
          lineCustCode="SSLM.SUPPLIER_ENTRY_DETAIL_CUSTOM.PURCHASE_LINE"
        />
      ),
    },
    // 有调查表展示调查表
    {
      key: 'attachmentInfo',
      title: intl.get('sslm.supplierEntryDetail.view.entry.attachmentInfo').d('附件信息'),
      render: () => {
        return templateDsList.sslmInvestgAttachment ? (
          <ComposeTable
            dataSet={templateDsList.sslmInvestgAttachment}
            columns={
              (duplicateConfigList.find(i => i.configName === 'sslmInvestgAttachment') || {}).lines
            }
            editable={false}
            configName="sslmInvestgAttachment"
          />
        ) : (
          <AttachmentInfo
            dataSet={attachmentDS}
            isEdit={isEdit}
            disabledObj={disabledObj}
            custLoading={custLoading}
            customizeTable={customizeTable}
            customizeUnitCode="SSLM.SUPPLIER_ENTRY_DETAIL_CUSTOM.ATTACHMENT_INFO"
          />
        );
      },
      hidden:
        !configNameList.includes('spfmCompanyAttachment') &&
        isNil(templateDsList.sslmInvestgAttachment),
    },
    {
      key: 'otherInfo',
      title: intl.get('sslm.supplierEntryDetail.view.entry.otherInfo').d('其它信息'),
      render: () => (
        <OtherInfo
          dataSet={otherInfoDs}
          custLoading={custLoading}
          customizeForm={customizeForm}
          isEdit={isEdit}
          customizeUnitCode="SSLM.SUPPLIER_ENTRY_DETAIL_CUSTOM.OTHER_FORM"
        />
      ),
    },
  ].filter(item => !item.hidden);

  const [activeKey, setActiveKey] = useState('companyBaseInfo');

  const handleTabChange = key => {
    setActiveKey(key || (head(companyOtherInfoList) || {}).key);
  };

  return (
    <div className="card-wrap">
      <div className="enterprise-title">
        <div className="card-detail-title">
          {intl.get('sslm.common.view.title.enterpriseInfo').d('企业信息')}
        </div>
      </div>
      {customizeTabPane(
        {
          code: 'SSLM.LIFE_CYCLE.DOCUMENT_CUSTOM.TABS',
          custDefaultActive: key => handleTabChange(key || activeKey),
        },
        <Tabs tabPosition="left" activeKey={activeKey} onChange={handleTabChange}>
          {companyOtherInfoList.map(({ key, title, render }) => (
            <TabPane key={key} tab={title} forceRender={key === 'otherInfo'}>
              {/* <div className="tab-pane-content-title">{title}</div> */}
              {isFunction(render) && render()}
            </TabPane>
          ))}
        </Tabs>
      )}
    </div>
  );
};

export default Index;
