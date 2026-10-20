/**
 * index - 信息比对
 * @date: 2021-02-24
 * @author: lvxiaomei <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import { Row, Col } from 'choerodon-ui';
import { Collapse, Icon } from 'hzero-ui';
import { DataSet } from 'choerodon-ui/pro';
import React, { Fragment, useMemo, useState, useEffect } from 'react';

import intl from 'utils/intl';

import HeaderInfo from './HeaderInfo';
import Contact from './Contact';
import Address from './Address';
import BankAccount from './BankAccount';
import Attachment from './Attachment';
import PurchaseInform from './PurchaseInform';
import {
  getHeaderInfoDS,
  getContactDS,
  getAddressDS,
  getBankAccountDS,
  getAttachmentDS,
  getPurchaseHeaderDS,
  getPurchaseLineDS,
} from '../stores/infoCompareDS';

const { Panel } = Collapse;

const InfoCompare = ({
  customizeForm,
  customizeTable,
  custLoading,
  extSupplierReqId,
  customizeCollapse,
}) => {
  // 变更前
  const beforeHeaderInfoDs = useMemo(
    () =>
      new DataSet(
        getHeaderInfoDS({
          extSupplierReqId,
          compare: 1,
          customizeUnitCode: 'SSLM.EASY_SUPPLIER_WAREHOUSE.BASIC_INFO',
        })
      ),
    [extSupplierReqId]
  );
  const beforeContactDs = useMemo(
    () =>
      new DataSet(
        getContactDS({
          extSupplierReqId,
          compare: 1,
          customizeUnitCode: 'SSLM.EASY_SUPPLIER_WAREHOUSE.CONTACT_INFO',
        })
      ),
    [extSupplierReqId]
  );
  const beforeAddressDs = useMemo(
    () =>
      new DataSet(
        getAddressDS({
          extSupplierReqId,
          compare: 1,
          customizeUnitCode: 'SSLM.EASY_SUPPLIER_WAREHOUSE.ADDRESS_INFO',
        })
      ),
    [extSupplierReqId]
  );
  const beforeBankAccountDs = useMemo(
    () =>
      new DataSet(
        getBankAccountDS({
          extSupplierReqId,
          compare: 1,
          customizeUnitCode: 'SSLM.EASY_SUPPLIER_WAREHOUSE.BANK_ACCOUNT',
        })
      ),
    [extSupplierReqId]
  );
  const beforeAttachmentDs = useMemo(
    () =>
      new DataSet(
        getAttachmentDS({
          extSupplierReqId,
          compare: 1,
          customizeUnitCode: 'SSLM.EASY_SUPPLIER_WAREHOUSE.ATTACHMENT',
        })
      ),
    [extSupplierReqId]
  );
  const beforePurchaseHeaderDs = useMemo(
    () =>
      new DataSet(
        getPurchaseHeaderDS({
          extSupplierReqId,
          compare: 1,
          customizeUnitCode: 'SSLM.EASY_SUPPLIER_WAREHOUSE.PURCHASE_HEADER',
        })
      ),
    [extSupplierReqId]
  );
  const beforePurchaseLineDs = useMemo(
    () =>
      new DataSet(
        getPurchaseLineDS({
          extSupplierReqId,
          compare: 1,
          customizeUnitCode: 'SSLM.EASY_SUPPLIER_WAREHOUSE.PURCHASE_LINE',
        })
      ),
    [extSupplierReqId]
  );

  beforeContactDs.bind(beforeHeaderInfoDs, 'extSupplierContactReqs');
  beforeAddressDs.bind(beforeHeaderInfoDs, 'extSupplierAddressReqs');
  beforeBankAccountDs.bind(beforeHeaderInfoDs, 'extSupBkAccountReqs');
  beforeAttachmentDs.bind(beforeHeaderInfoDs, 'extSupplierAttachmentReqs');
  beforePurchaseHeaderDs.bind(beforeHeaderInfoDs, 'extSupplierPfReq');
  beforePurchaseLineDs.bind(beforeHeaderInfoDs, 'extSupplierPfLineReqs');

  // 变更后
  const afterHeaderInfoDs = useMemo(
    () =>
      new DataSet(
        getHeaderInfoDS({
          extSupplierReqId,
          compare: 2,
          customizeUnitCode: 'SSLM.EASY_SUPPLIER_WAREHOUSE.BASIC_INFO',
        })
      ),
    [extSupplierReqId]
  );
  const afterContactDs = useMemo(
    () =>
      new DataSet(
        getContactDS({
          extSupplierReqId,
          compare: 2,
          customizeUnitCode: 'SSLM.EASY_SUPPLIER_WAREHOUSE.CONTACT_INFO',
        })
      ),
    [extSupplierReqId]
  );
  const afterAddressDs = useMemo(
    () =>
      new DataSet(
        getAddressDS({
          extSupplierReqId,
          compare: 2,
          customizeUnitCode: 'SSLM.EASY_SUPPLIER_WAREHOUSE.ADDRESS_INFO',
        })
      ),
    [extSupplierReqId]
  );
  const afterBankAccountDs = useMemo(
    () =>
      new DataSet(
        getBankAccountDS({
          extSupplierReqId,
          compare: 2,
          customizeUnitCode: 'SSLM.EASY_SUPPLIER_WAREHOUSE.BANK_ACCOUNT',
        })
      ),
    [extSupplierReqId]
  );
  const afterAttachmentDs = useMemo(
    () =>
      new DataSet(
        getAttachmentDS({
          extSupplierReqId,
          compare: 2,
          customizeUnitCode: 'SSLM.EASY_SUPPLIER_WAREHOUSE.ATTACHMENT',
        })
      ),
    [extSupplierReqId]
  );

  const afterPurchaseHeaderDs = useMemo(
    () =>
      new DataSet(
        getPurchaseHeaderDS({
          extSupplierReqId,
          compare: 2,
          customizeUnitCode: 'SSLM.EASY_SUPPLIER_WAREHOUSE.PURCHASE_HEADER',
        })
      ),
    [extSupplierReqId]
  );
  const afterPurchaseLineDs = useMemo(
    () =>
      new DataSet(
        getPurchaseLineDS({
          extSupplierReqId,
          compare: 2,
          customizeUnitCode: 'SSLM.EASY_SUPPLIER_WAREHOUSE.PURCHASE_LINE',
        })
      ),
    [extSupplierReqId]
  );

  afterContactDs.bind(afterHeaderInfoDs, 'extSupplierContactReqs');
  afterAddressDs.bind(afterHeaderInfoDs, 'extSupplierAddressReqs');
  afterBankAccountDs.bind(afterHeaderInfoDs, 'extSupBkAccountReqs');
  afterAttachmentDs.bind(afterHeaderInfoDs, 'extSupplierAttachmentReqs');
  afterPurchaseHeaderDs.bind(afterHeaderInfoDs, 'extSupplierPfReq');
  afterPurchaseLineDs.bind(afterHeaderInfoDs, 'extSupplierPfLineReqs');

  useEffect(() => {
    beforeHeaderInfoDs.query();
    afterHeaderInfoDs.query();
  }, [extSupplierReqId]);

  const panelList = [
    {
      key: 'supplierBaseInfo',
      title: intl.get('sslm.supplierWarehouse.view.warehous.supplierBaseInfo').d('供应商基础信息'),
      componentList: [
        <HeaderInfo
          dataSet={beforeHeaderInfoDs}
          customizeForm={customizeForm}
          custLoading={custLoading}
        />,
        <HeaderInfo
          dataSet={afterHeaderInfoDs}
          customizeForm={customizeForm}
          custLoading={custLoading}
        />,
      ],
    },
    {
      key: 'contact',
      title: intl.get('sslm.supplierWarehouse.view.warehous.contact').d('联系人'),
      componentList: [
        <Contact
          dataSet={beforeContactDs}
          customizeTable={customizeTable}
          custLoading={custLoading}
        />,
        <Contact
          dataSet={afterContactDs}
          customizeTable={customizeTable}
          custLoading={custLoading}
        />,
      ],
    },
    {
      key: 'address',
      title: intl.get('sslm.supplierWarehouse.view.warehous.address').d('地址'),
      componentList: [
        <Address
          dataSet={beforeAddressDs}
          code="SSLM.EASY_SUPPLIER_WAREHOUSE.ADDRESS_INFO"
          customizeTable={customizeTable}
          custLoading={custLoading}
        />,
        <Address
          dataSet={afterAddressDs}
          code="SSLM.EASY_SUPPLIER_WAREHOUSE.ADDRESS_INFO"
          customizeTable={customizeTable}
          custLoading={custLoading}
        />,
      ],
    },
    {
      key: 'bankAccount',
      title: intl.get('sslm.supplierWarehouse.view.warehous.bankAccount').d('银行账户'),
      componentList: [
        <BankAccount
          dataSet={beforeBankAccountDs}
          customizeTable={customizeTable}
          custLoading={custLoading}
        />,
        <BankAccount
          dataSet={afterBankAccountDs}
          customizeTable={customizeTable}
          custLoading={custLoading}
        />,
      ],
    },
    {
      key: 'attachment',
      title: intl.get('sslm.supplierWarehouse.view.warehous.attachment').d('附件'),
      componentList: [
        <Attachment
          dataSet={beforeAttachmentDs}
          code="SSLM.EASY_SUPPLIER_WAREHOUSE.ATTACHMENT"
          customizeTable={customizeTable}
          custLoading={custLoading}
        />,
        <Attachment
          dataSet={afterAttachmentDs}
          code="SSLM.EASY_SUPPLIER_WAREHOUSE.ATTACHMENT"
          customizeTable={customizeTable}
          custLoading={custLoading}
        />,
      ],
    },
    {
      key: 'purchaseInform',
      title: intl.get('sslm.supplierInform.view.fixCatalog.purchaseInform').d('采购/财务信息'),
      componentList: [
        <PurchaseInform
          headerDs={beforePurchaseHeaderDs}
          lineDs={beforePurchaseLineDs}
          headerCode="SSLM.EASY_SUPPLIER_WAREHOUSE.PURCHASE_HEADER"
          lineCode="SSLM.EASY_SUPPLIER_WAREHOUSE.PURCHASE_LINE"
          customizeForm={customizeForm}
          customizeTable={customizeTable}
          custLoading={custLoading}
        />,
        <PurchaseInform
          headerDs={afterPurchaseHeaderDs}
          lineDs={afterPurchaseLineDs}
          headerCode="SSLM.EASY_SUPPLIER_WAREHOUSE.PURCHASE_HEADER"
          lineCode="SSLM.EASY_SUPPLIER_WAREHOUSE.PURCHASE_LINE"
          customizeForm={customizeForm}
          customizeTable={customizeTable}
          custLoading={custLoading}
        />,
      ],
    },
  ];

  const [collapseKeys, setCollapseKeys] = useState([
    'supplierBaseInfo',
    'contact',
    'address',
    'bankAccount',
    'attachment',
    'purchaseInform',
  ]);

  const renderContent = panel => {
    const { key, title, componentList = [] } = panel;
    return (
      <Row gutter={24}>
        {componentList.map(component => (
          <Col span={12}>
            <div className="ued-detail-wrapper">
              {customizeCollapse(
                {
                  code: 'SSLM.EASY_SUPPLIER_WAREHOUSE.COLLAPSE',
                },
                <Collapse activeKey={collapseKeys} onChange={keys => setCollapseKeys(keys)}>
                  <Panel
                    key={key}
                    showArrow={false}
                    header={
                      <Fragment>
                        <h3>{title}</h3>
                        <a>
                          {collapseKeys.includes(key)
                            ? intl.get('hzero.common.button.up').d('收起')
                            : intl.get('hzero.common.button.expand').d('展开')}
                          <Icon type={collapseKeys.includes(key) ? 'up' : 'down'} />
                        </a>
                      </Fragment>
                    }
                  >
                    {component}
                  </Panel>
                </Collapse>
              )}
            </div>
          </Col>
        ))}
      </Row>
    );
  };

  return (
    <Fragment>
      <Row gutter={24}>
        <Col span={12}>
          <h3 style={{ textIndent: '16px', marginBottom: '16px' }}>
            {intl.get('sslm.supplierWarehouse.model.title.updateBefore').d('变更前')}
          </h3>
        </Col>
        <Col span={12}>
          <h3 style={{ textIndent: '16px', marginBottom: '16px' }}>
            {intl.get('sslm.supplierWarehouse.model.title.updateAfter').d('变更后')}
          </h3>
        </Col>
      </Row>
      {panelList.map(panel => renderContent(panel))}
    </Fragment>
  );
};

export default InfoCompare;
