/*
 * @Date: 2022-08-03 09:59:32
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */

import React from 'react';
import { Spin } from 'choerodon-ui/pro';
import classnames from 'classnames';

import intl from 'utils/intl';
import { TopSection, SecondSection } from '_components/Section';

import styles from '@/routes/index.less';
import C7nDynamicTable from '@/routes/components/C7nDynamicTable/index';
import HeaderInfo from './Detail/HeaderInfo';
import Contact from './Detail/Contact';
import Address from './Detail/Address';
import BankAccount from './Detail/BankAccount';
import Attachment from './Detail/Attachment';
import PurchaseInform from './Detail/PurchaseInform';

const HistoryChildren = ({
  headerInfoDs,
  contactDs,
  addressDs,
  bankAccountDs,
  attachmentDs,
  customizeTable,
  customizeForm,
  custLoading,
  extSupplierReqId,
  purchaseHeaderDs,
  purchaseLineDs,
  getHocInstance,
}) => {
  return (
    <Spin
      wrapperClassName={classnames(styles['detail-c7n-card'], styles['modal-title-crad-component'])}
      dataSet={headerInfoDs}
    >
      <TopSection
        code="SSLM.EASY_SUPPLIER_WAREHOUSE.CARDS"
        getHocInstance={getHocInstance}
        className={styles['title-crad-top-section']}
      >
        <SecondSection
          title={intl
            .get('sslm.supplierWarehouse.view.warehous.supplierBaseInfo')
            .d('供应商基础信息')}
          code="supplierBaseInfo"
        >
          <HeaderInfo
            type="history"
            dataSet={headerInfoDs}
            isEdit={false}
            customizeForm={customizeForm}
            custLoading={custLoading}
          />
        </SecondSection>
        <SecondSection
          title={intl.get('sslm.supplierWarehouse.view.warehous.contact').d('联系人')}
          code="contact"
        >
          <Contact
            dataSet={contactDs}
            isEdit={false}
            code="SSLM.EASY_SUPPLIER_WAREHOUSE.CONTACT_INFO"
            customizeTable={customizeTable}
            custLoading={custLoading}
          />
        </SecondSection>
        <SecondSection
          title={intl.get('sslm.supplierWarehouse.view.warehous.address').d('地址')}
          code="address"
        >
          <Address
            dataSet={addressDs}
            isEdit={false}
            code="SSLM.EASY_SUPPLIER_WAREHOUSE.ADDRESS_INFO"
            customizeTable={customizeTable}
            custLoading={custLoading}
          />
        </SecondSection>
        <SecondSection
          title={intl.get('sslm.supplierWarehouse.view.warehous.bankAccount').d('银行账户')}
          code="bankAccount"
        >
          <BankAccount
            dataSet={bankAccountDs}
            isEdit={false}
            code="SSLM.EASY_SUPPLIER_WAREHOUSE.BANK_ACCOUNT"
            customizeTable={customizeTable}
            custLoading={custLoading}
          />
        </SecondSection>
        <SecondSection
          title={intl.get('sslm.supplierWarehouse.view.warehous.attachment').d('附件')}
          code="attachment"
        >
          <Attachment
            dataSet={attachmentDs}
            isEdit={false}
            code="SSLM.EASY_SUPPLIER_WAREHOUSE.ATTACHMENT"
            customizeTable={customizeTable}
            custLoading={custLoading}
          />
        </SecondSection>
        <SecondSection
          title={intl.get('sslm.supplierInform.view.fixCatalog.purchaseInform').d('采购/财务信息')}
          code="purchaseInform"
        >
          <PurchaseInform
            headerDs={purchaseHeaderDs}
            lineDs={purchaseLineDs}
            isEdit={false}
            headerCode="SSLM.EASY_SUPPLIER_WAREHOUSE.PURCHASE_HEADER"
            lineCode="SSLM.EASY_SUPPLIER_WAREHOUSE.PURCHASE_LINE"
            customizeForm={customizeForm}
            customizeTable={customizeTable}
            custLoading={custLoading}
            type="history"
          />
        </SecondSection>
      </TopSection>
      <C7nDynamicTable
        targetPage="sslm_external_supplier_req"
        queryParams={{
          relationId: extSupplierReqId,
        }}
        readOnly
        tabType="card"
      />
    </Spin>
  );
};

export default HistoryChildren;
