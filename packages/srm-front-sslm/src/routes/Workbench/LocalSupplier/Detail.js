/**
 * Detail - 本地供应商详情
 * @date: 2021-04-28
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React, { useMemo } from 'react';
import { DataSet, Form, Output, Table, Spin, SecretField } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import classnames from 'classnames';
import { TopSection, SecondSection } from '_components/Section';

import styles from '@/routes/index.less';
import C7nDynamicTable from '@/routes/components/C7nDynamicTable/index';
import PurchaseInform from './PurchaseInform';
import {
  getLocalSupplierFormDS,
  getContactDS,
  getAddressDS,
  getBankAccountDS,
  getSiteDS,
  getPurchaseHeaderDS,
  getPurchaseLineDS,
} from '../stores/localSupplierDS';

const tableMaxHeight = 430;

const Detail = ({
  record: currentRow,
  customizeTable,
  customizeForm,
  custLoading,
  getHocInstance,
}) => {
  const { data: { supplierId } = {} } = currentRow;
  const localSupplierFormDs = useMemo(() => new DataSet(getLocalSupplierFormDS(supplierId)), [
    supplierId,
  ]);
  const contactDs = useMemo(() => new DataSet(getContactDS(supplierId)), [supplierId]);
  const addressDs = useMemo(() => new DataSet(getAddressDS(supplierId)), [supplierId]);
  const bankAccountDs = useMemo(() => new DataSet(getBankAccountDS(supplierId)), [supplierId]);
  const siteDs = useMemo(() => new DataSet(getSiteDS(supplierId)), [supplierId]);
  const purchaseHeaderDs = useMemo(() => new DataSet(getPurchaseHeaderDS(supplierId)), [
    supplierId,
  ]);
  const purchaseLineDs = useMemo(() => new DataSet(getPurchaseLineDS(supplierId)), [supplierId]);

  const contactColumns = [
    {
      name: 'name',
      renderer: ({ record, name }) => (
        <SecretField readOnly displayOutput record={record} name={name} />
      ),
      width: 150,
    },
    {
      name: 'genderMeaning',
      width: 60,
    },
    {
      name: 'idTypeMeaning',
      width: 100,
    },
    {
      name: 'idNumber',
      width: 150,
      renderer: ({ record, name }) => (
        <SecretField readOnly displayOutput record={record} name={name} />
      ),
    },
    {
      name: 'contactTypeMeaning',
      width: 120,
    },
    {
      name: 'position',
      width: 120,
    },
    {
      name: 'mobilephone',
      renderer: ({ record, name }) => (
        <SecretField readOnly displayOutput record={record} name={name} />
      ),
      width: 120,
    },
    {
      name: 'mail',
      renderer: ({ record, name }) => (
        <SecretField readOnly displayOutput record={record} name={name} />
      ),
      width: 150,
    },
    {
      name: 'defaultFlag',
      width: 100,
      renderer: ({ value }) => yesOrNoRender(value),
    },
  ];

  const addressColumns = [
    {
      name: 'countryName',
      width: 150,
    },
    {
      name: 'regionName',
      width: 200,
    },
    {
      name: 'cityName',
      width: 150,
    },
    {
      name: 'address',
    },
    {
      name: 'zipCode',
      width: 120,
    },
  ];

  const bankAccountColumns = [
    {
      name: 'bankCountryCode',
      width: 130,
    },
    {
      name: 'bankCode',
      width: 120,
    },
    {
      name: 'bankName',
      width: 140,
    },
    {
      name: 'bankFirm',
      width: 150,
    },
    {
      name: 'depositBank',
      width: 140,
    },
    {
      name: 'bankAccountName',
      width: 140,
    },
    {
      name: 'bankAccountNum',
      width: 140,
      renderer: ({ name, record }) => (
        <SecretField readOnly displayOutput name={name} record={record} />
      ),
    },
    {
      name: 'intlBankAccountNum',
      width: 140,
    },
    {
      name: 'accountNatureMeaning',
      width: 140,
    },
    {
      name: 'accountPurposeMeaning',
      width: 140,
    },
    {
      name: 'currencyIdMeaning',
      width: 140,
    },
    {
      name: 'bankIdentifyCodeTypeMeaning',
      width: 120,
    },
    {
      name: 'bankIdentifyCode',
      width: 200,
    },
    {
      name: 'paymentTypeIdMeaning',
      width: 140,
    },
    {
      name: 'mainAccountFlagMeaning',
      width: 60,
    },
    {
      name: 'enabledFlag',
      width: 60,
      renderer: ({ value }) => yesOrNoRender(value),
    },
  ];

  const siteColumns = [
    {
      name: 'supplierSiteCode',
      width: 150,
    },
    {
      name: 'supplierSiteName',
    },
    {
      name: 'ouCode',
      width: 120,
    },
    {
      name: 'ouName',
      width: 150,
    },
    {
      name: 'enabledFlag',
      width: 100,
      renderer: ({ value }) => yesOrNoRender(value),
    },
  ];

  return (
    <Spin
      wrapperClassName={classnames(styles['detail-c7n-card'], styles['modal-title-crad-component'])}
      dataSet={localSupplierFormDs}
    >
      <TopSection
        code="SSLM.SUPPLIER_WORKBENCH_LOCAL.CARDS"
        getHocInstance={getHocInstance}
        className={styles['title-crad-top-section']}
      >
        <SecondSection
          title={intl
            .get('sslm.supplierWarehouse.view.warehous.supplierBaseInfo')
            .d('供应商基础信息')}
          code="supplierBaseInfo"
        >
          {customizeForm(
            {
              code: 'SSLM.SUPPLIER_WORKBENCH_LOCAL.BASE_INFO',
              readOnly: false,
            },
            <Form
              columns={3}
              labelLayout="vertical"
              dataSet={localSupplierFormDs}
              custLoading={custLoading}
              className="c7n-pro-vertical-form-display"
            >
              <Output name="supplierNum" />
              <Output name="supplierName" />
              <Output name="supplierTypeMeaning" />
              <Output name="idNum" />
              <Output name="passport" />
              <Output name="unifiedSocialCode" />
              <Output name="organizingInstitutionCode" />
              <Output name="dunsCode" />
              <Output name="businessRegistrationNumber" />
              <Output name="externalSystemName" />
              <Output
                name="enabledFlag"
                renderer={({ value }) => {
                  return yesOrNoRender(value);
                }}
              />
              <Output name="termName" />
              <Output name="paymentTypeName" />
            </Form>
          )}
        </SecondSection>
        <SecondSection
          title={intl.get('spfm.supplier.view.title.tab.contacts').d('联系人')}
          code="contact"
        >
          {customizeTable(
            {
              code: 'SSLM.SUPPLIER_WORKBENCH_LOCAL.CONTACTS',
              readOnly: true,
            },
            <Table
              dataSet={contactDs}
              columns={contactColumns}
              custLoading={custLoading}
              style={{ maxHeight: tableMaxHeight }}
            />
          )}
        </SecondSection>
        <SecondSection
          title={intl.get('spfm.supplier.view.title.tab.address').d('地址')}
          code="address"
        >
          {customizeTable(
            {
              code: 'SSLM.SUPPLIER_WORKBENCH_LOCAL.ADDRESS',
              readOnly: true,
            },
            <Table
              dataSet={addressDs}
              columns={addressColumns}
              custLoading={custLoading}
              style={{ maxHeight: tableMaxHeight }}
            />
          )}
        </SecondSection>
        <SecondSection
          title={intl.get('spfm.supplier.view.title.tab.bank').d('银行账户')}
          code="bankAccount"
        >
          {customizeTable(
            {
              code: 'SSLM.SUPPLIER_WORKBENCH_LOCAL.BANK_ACCT',
              readOnly: true,
            },
            <Table
              dataSet={bankAccountDs}
              columns={bankAccountColumns}
              custLoading={custLoading}
              style={{ maxHeight: tableMaxHeight }}
            />
          )}
        </SecondSection>
        <SecondSection
          title={intl.get('spfm.supplier.view.title.tab.sites').d('地点')}
          code="sites"
        >
          {customizeTable(
            {
              code: 'SSLM.SUPPLIER_WORKBENCH_LOCAL.SUPPLIER_SITE',
              readOnly: true,
            },
            <Table
              dataSet={siteDs}
              columns={siteColumns}
              custLoading={custLoading}
              style={{ maxHeight: tableMaxHeight }}
            />
          )}
        </SecondSection>
        <SecondSection
          code="purchaseInform"
          title={intl.get('sslm.supplierInform.view.fixCatalog.purchaseInform').d('采购/财务信息')}
        >
          <PurchaseInform
            custLoading={custLoading}
            customizeForm={customizeForm}
            customizeTable={customizeTable}
            headerDs={purchaseHeaderDs}
            lineDs={purchaseLineDs}
            tableMaxHeight={tableMaxHeight}
          />
        </SecondSection>
      </TopSection>
      <C7nDynamicTable
        targetPage="sslm_supplier_management_external_supplier"
        queryParams={{
          relationId: supplierId,
        }}
        readOnly
        tabType="card"
      />
    </Spin>
  );
};

export default Detail;
