import React, { useMemo, useEffect } from 'react';
import { compose } from 'lodash';
import intl from 'utils/intl';
import qs from 'qs';
import { Table, DataSet } from 'choerodon-ui/pro';
import { Collapse } from 'choerodon-ui';

import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { AFBasic } from '_components/AFCards';
// import SearchBarTable from '_components/SearchBarTable';
import FormPro from '@/components/FormPro';
// import { handlePrint } from '@/services/oms/orderDetailService';
import Image from '@/components/Image';
import { baseDs, skuDs, freightDs } from './ds';

import styles from './index.less';

const { Panel } = Collapse;
const UNIT_CODE = {
  afBasic: 'SMODR.RECEIPT.APPROVE.BASIC_INFO.TITLE',
  collapse: 'SMODR.RECEIPT.APPROVE.COLLAPSE',
  base: 'SMODR.RECEIPT.APPROVE.BASIC_INFO',
  sku: 'SMODR.RECEIPT.APPROVE.SKU_INFO',
  skuSearch: 'SMODR.RECEIPT.APPROVE.SKU_INFO.SEARCH_BAR',
  freight: 'SMODR.RECEIPT.APPROVE.FREIGHT_INFO',
};

function ReadPage(props) {
  const { onFormLoaded, customizeCommon, customizeTable, customizeCollapse, customizeForm } = props;
  const { receiptCode } = qs.parse(props.history.location.search.substr(1));
  const baseDS = useMemo(() => new DataSet(baseDs()), []);
  const skuDS = useMemo(() => new DataSet(skuDs(UNIT_CODE.sku, UNIT_CODE.skuSearch)), []);
  const freightDS = useMemo(() => new DataSet(freightDs()), []);
  const baseFields = [
    { name: 'supplierCompanyName' },
    { name: 'purchaseCompanyName' },
    { name: 'consignmentCode' },
  ];
  const productColumns = [
    {
      name: 'receiptLineNum',
      width: 100,
    },
    {
      name: 'primaryUrl',
      width: 160,
      renderer: ({ value }) => <Image value={value} />,
    },
    {
      name: 'skuName',
      width: 200,
    },
    {
      width: 200,
      name: 'skuCode',
    },
    {
      name: 'skuTypeMeaning',
      width: 160,
    },
    {
      width: 200,
      name: 'consignmentCode',
      renderer: ({ value, record }) =>
        value + (record.get('consignmentLineNum') ? `-${record.get('consignmentLineNum')}` : ''),
    },
    {
      name: 'quantityMeaning',
      align: 'right',
      width: 160,
    },
    {
      name: 'attachmentUuid',
      width: 160,
    },
  ];
  const feightColumns = [
    {
      width: 100,
      name: 'receiptLineNum',
    },
    {
      width: 160,
      name: 'extraCostTypeMeaning',
    },

    {
      name: 'skuName',
      width: 200,
    },
    {
      width: 200,
      name: 'itemCode',
    },
    {
      width: 200,
      name: 'itemName',
    },
    {
      width: 200,
      name: 'consignmentCode',
      renderer: ({ value, record }) =>
        value + (record.get('consignmentLineNum') ? `-${record.get('consignmentLineNum')}` : ''),
    },
    {
      width: 160,
      name: 'quantityMeaning',
      align: 'right',
    },
  ];

  useEffect(() => {
    initData();
  }, []);

  const initData = async () => {
    baseDS.setQueryParameter('receiptCode', receiptCode);
    skuDS.setQueryParameter('receiptCode', receiptCode);
    freightDS.setQueryParameter('receiptCode', receiptCode);
    const promiseAllArr = [baseDS.query(), skuDS.query(), freightDS.query()];
    Promise.all(promiseAllArr).then(() => {
      if (onFormLoaded && baseDS.current) {
        onFormLoaded(true);
      }
    });
  };

  //   const beforeHandlePrint = async () => {
  //     const res = await handlePrint([receiptCode]);
  //     if (res) {
  //       const file = new Blob([res], { type: 'application/pdf' });
  //       const fileUrl = URL.createObjectURL(file);
  //       const printWindow = window.open(fileUrl);
  //       if (printWindow) {
  //         printWindow.print();
  //       }
  //     }
  //   };

  return (
    <>
      <div className={styles['accept-order-wfp']}>
        {customizeCommon(
          {
            code: UNIT_CODE.afBasic,
          },
          <AFBasic
            dataSet={baseDS}
            titleField="receiptCode"
            normalFields={['createdByName', 'receiptedTime']}
            contentRemainWidth="25%"
            // contentBottomRender={() => (
            //   <Button icon="print" onClick={() => beforeHandlePrint()} funcType="flat">
            //     {intl.get('smodr.orderLine.view.print').d('打印')}
            //   </Button>
            // )}
          />
        )}
        {customizeCollapse(
          {
            code: UNIT_CODE.collapse,
          },
          <Collapse
            bordered={false}
            expandIconPosition="text-right"
            defaultActiveKey={['baseInfo', 'prodInfo', 'freInfo']}
          >
            <Panel
              header={
                <span className="header-title">
                  {intl.get('smodr.acceptOrder.view.baseInfo').d('基本信息')}
                </span>
              }
              id="BASE_INFO"
              key="baseInfo"
            >
              <FormPro
                columns={3}
                readOnly
                dataSet={baseDS}
                fields={baseFields}
                customizeCode={UNIT_CODE.base}
                customizeForm={customizeForm}
              />
            </Panel>
            <Panel
              header={
                <span className="header-title">
                  {intl.get('smodr.orderDetail.model.productInfo').d('商品信息')}
                </span>
              }
              id="PROD_INFO"
              key="prodInfo"
            >
              {customizeTable(
                { code: UNIT_CODE.sku },
                <Table
                  dataSet={skuDS}
                  columns={productColumns}
                  customizedCode={UNIT_CODE.sku}
                  style={{ maxHeight: 450 }}
                />
                    // 后续实现筛选器
                // <SearchBarTable
                //   dataSet={skuDS}
                //   columns={productColumns}
                //   searchCode={UNIT_CODE.skuSearch}
                //   customizedCode={UNIT_CODE.sku}
                //   style={{ maxHeight: 531 }}
                //   searchBarConfig={{
                //     closeFilterSelector: true,
                //     defaultExpand: true,
                //     expandable: false,
                //   }}
                // />
              )}
            </Panel>
            <Panel
              header={
                <span className="header-title">
                  {intl.get('smodr.orderDetail.model.additionInfo').d('附加费信息')}
                </span>
              }
              id="FRE_INFO"
              key="freInfo"
            >
              {customizeTable(
                { code: UNIT_CODE.freight },
                <Table
                  dataSet={freightDS}
                  columns={feightColumns}
                  customizedCode={UNIT_CODE.freight}
                  style={{ maxHeight: 450 }}
                />
              )}
            </Panel>
          </Collapse>
        )}
      </div>
    </>
  );
}

export default compose(
  formatterCollections({
    code: [
      'smodr.orderLine',
      'smodr.orderDetail',
      'smodr.acceptOrder',
      'smodr.common',
      'smodr.deliveryOrder',
    ],
  }),
  withCustomize({
    unitCode: Object.values(UNIT_CODE),
  })
)(ReadPage);
