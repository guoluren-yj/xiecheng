import React, { useEffect, useState, useMemo } from 'react';
import { Form, Spin, Output, DataSet, Button, Table } from 'choerodon-ui/pro';
// import { observable } from 'mobx';
import { Observer, useLocalStore } from 'mobx-react-lite';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import c7nModal from '@/utils/c7nModal';

import { fetchSaleDetail } from '../../AfterSaleManage/api';
import { afsStatusRenderer, afsProblemRenderer, orderSkuRenderer } from './renderers';
import styles from './index.less';
import LogisModal from './LogisModal';

const unitCode = [
  'SMODR.AFTERSALE_DETAIL_PURCHASE.REQUEST',
  'SMODR.AFTERSALE_DETAIL_PURCHASE.ORDER',
];

const readFormProps = {
  labelLayout: 'vertical',
  className: 'c7n-pro-vertical-form-display',
};

const getClassNames = (names = {}) => {
  const _names = Object.keys(names).filter((f) => !['undefined', 'null', ''].includes(f));
  return _names.reduce((c, n) => (names[n] ? `${c} ${n}` : c), '');
};

const Card = (props) => {
  const { title, children, className, style } = props;
  return (
    <div
      className={getClassNames({ [styles['card-container']]: true, [className]: true })}
      style={style}
    >
      <div className="card-header">{title}</div>
      <div className="card-body">{children}</div>
    </div>
  );
};

const CustReadForm = (props) => {
  const { fields = [], code, customizeForm, ...otherProps } = props;
  return customizeForm ? customizeForm(
    { code },
    <Form {...readFormProps} {...otherProps}>
      {fields.map((m) => {
        return <Output {...m} />;
      })}
    </Form>
  ) : (
    <Form {...readFormProps} {...otherProps}>
      {fields.map((m) => {
        return <Output {...m} />;
      })}
    </Form>
  );
};

function AfsDetail(props) {
  const { afsLine = {}, customizeForm } = props;
  const [loading, setLoading] = useState(false);
  const store = useLocalStore(() => ({
    data: {},
    setData(newData) {
      store.data = newData;
    },
  }));

  const afsDs = useMemo(() => new DataSet(), []);
  const skuTableDs = useMemo(() => new DataSet({
    selection: false,
    paging: false,
    fields: [
      {
        name: 'skuCode',
        label: intl.get('smodr.afterSaleManage.model.productNum').d('商品编码'),
      },
      {
        name: 'skuName',
        label: intl.get('smodr.afterSaleManage.model.productName').d('商品名称'),
      },
      {
        name: 'skuTypeMeaning',
        label: intl.get('smodr.afterSaleManage.model.productType').d('商品类型'),
      },
      {
        name: 'applyQuantityMeaning',
        label: intl.get('smodr.afterSaleManage.model.afsForApplyQuantity').d('申请数量'),
      },
    ],
  }), []);
  const tableDs = useMemo(() => new DataSet({
    selection: false,
    paging: false,
    fields: [
      {
        name: 'skuCode',
        label: intl.get('smodr.afterSaleManage.model.productNum').d('商品编码'),
      },
      {
        name: 'skuName',
        label: intl.get('smodr.afterSaleManage.model.productName').d('商品名称'),
      },
      {
        name: 'skuTypeMeaning',
        label: intl.get('smodr.afterSaleManage.model.productType').d('商品类型'),
      },
      {
        name: 'afterSaleTypeMeaning',
        label: intl.get('smodr.afterSaleManage.model.realityAfterSaleTypeMeaning').d('实际售后类型'),
      },
      // {
      //   name: 'realityPickWareTypeMeaning',
      //   label: intl.get('smodr.afterSaleManage.view.detail.afsPickWareType').d('退件方式'),
      // },
      {
        name: 'realityQuantityMeaning',
        label: intl.get('smodr.afterSaleManage.model.realityAfsQuantity').d('实际售后数量'),
      },
      {
        name: 'realityRefundAmountMeaning',
        label: intl.get('smodr.afterSaleManage.model.returnAmount').d('实退金额'),
      },
    ],
  }), []);
  const skuColumns = useMemo(() => [
    {
      name: 'skuCode',
    },
    {
      name: 'skuName',
    },
    {
      name: 'skuTypeMeaning',
      width: 80,
    },
    {
      align: 'right',
      name: 'applyQuantityMeaning',
    },
  ], []);
  const columns = useMemo(() => [
    {
      name: 'skuCode',
      footer: () => <div>{intl.get('smodr.afterSaleManage.model.summation').d('合计')}</div>,
    },
    {
      name: 'skuName',
    },
    {
      name: 'skuTypeMeaning',
      width: 80,
    },
    {
      name: 'afterSaleTypeMeaning',
      width: 80,
    },
    // {
    //   name: 'realityPickWareTypeMeaning',
    // },
    {
      align: 'right',
      name: 'realityQuantityMeaning',
    },
    {
      name: 'realityRefundAmountMeaning',
      align: 'right',
      footer: () => {
        return (
          <div>{store?.data?.totalRealityRefundAmountMeaning}</div>
        );
      },
    },
  ], [store.data]);

  useEffect(() => {
    initData(afsLine.afterSaleId);
  }, [afsLine.afterSaleId]);

  async function initData(afterSaleId) {
    if (!afterSaleId) return false;
    setLoading(true);
    const res = getResponse(await fetchSaleDetail(afterSaleId, unitCode.join(',')));
    if (res) {
      const {
        pickUpAddress,
        receiptAddress,
        supplierAddress,
        afterSaleEntryList,
        afterSaleWaybillList,
        returnReasonMeaning,
        exchangeReasonMeaning,
        afterSaleType,
        afterSaleTypeMeaning,
        afterSaleEntryDetailList,
        remark,
        afterSaleEntryApplyList,
      } = res;
      const otherInfo = afterSaleEntryList?.[0] || {};
      const { afterSaleEntryExtras } = afterSaleEntryList?.[0] || {};
      const _data = {
        ...res,
        ...otherInfo,
        remark,
        afterSaleType,
        afterSaleTypeMeaning,
        afsReason: returnReasonMeaning || exchangeReasonMeaning,
        afsQuantity: otherInfo.realityQuantityMeaning || otherInfo.applyQuantityMeaning,
        afterSaleWaybillText: afterSaleWaybillList?.filter((i) => i.logisticsType === 'RETURN')?.[0]
          ?.dataSplice,
        afterSaleWaybillTextNew: afterSaleWaybillList?.filter(
          (i) => i.logisticsType === 'RENEW'
        )?.[0]?.dataSplice,
        pickUpAddressText: pickUpAddress?.returnAddress,
        receiptAddressText: receiptAddress?.returnAddress,
        supplierAddressText: supplierAddress?.returnAddress,
        skuGiveCode: afterSaleEntryExtras?.map(i => i.skuCode),
      };
      afsDs.loadData([_data]);
      tableDs.loadData(afterSaleEntryDetailList || []);
      skuTableDs.loadData(afterSaleEntryApplyList||[]);
      store.setData(_data);
    }
    setLoading(false);
  }

  const handleCheckLogis = (record, type) => {
    const recordData = record.toData();
    const logisModal = c7nModal({
      title: intl.get('smodr.deliveryOrder.model.logistics').d('查看物流详情'),
      children: <LogisModal recordData={recordData} type={type} />,
      footer: (
        <Button color="primary" onClick={() => logisModal?.close()}>
          {intl.get('smodr.afterSaleManage.model.guanbi').d('关闭')}
        </Button>
      ),
      style: { width: 742 },
    });
  };

  const getAfsInfoFields = (ds) => {
    const fields = [
      {
        name: 'afterSaleCode',
        label: intl.get('smodr.afterSaleManage.model.afterSalesNumber').d('售后申请单号'),
      },
      // {
      //   name: 'cecAfterSaleCode',
      //   label: intl.get('smodr.afterSaleManage.model.ecAfterSaleNumber').d('电商售后单号'),
      //   show: ds?.current?.get('orderTypeCode') === 'EC',
      // },
      {
        name: 'afterSaleStatus',
        label: intl.get('smodr.afterSaleManage.model.manageStatusName').d('售后状态'),
        renderer: afsStatusRenderer,
      },
      {
        name: 'afterSaleType',
        label: intl.get('smodr.afterSaleManage.model.afterSaleTypeMeaning').d('售后类型'),
        renderer: ({ record, name, text }) => (record ? record.get(`${name}Meaning`) : text),
      },
      {
        name: 'afterSaleModeMeaning',
        label: intl.get('smodr.afterSaleManage.model.afterSaleModeMeaning').d('售后方式'),
      },
      // {
      //   name: 'afsQuantity',
      //   label: intl.get('smodr.afterSaleManage.model.skuAfsQuantity').d('主品售后数量'),
      // },
      // {
      //   name: 'giftQuantity',
      //   label: intl.get('smodr.afterSaleManage.model.giftAfsQuantity').d('赠品售后数量'),
      //   show: !!ds?.current?.get('giftQuantity'),
      // },
      {
        name: 'pickWareType',
        label: intl.get('smodr.afterSaleManage.view.detail.afsPickWareType').d('退件方式'),
        renderer: ({ record, name, text }) => (record ? record.get(`${name}Meaning`) : text),
      },
      {
        name: 'afsReason',
        label: intl.get('smodr.afterSaleManage.view.detail.reason').d('售后原因'),
      },
      {
        name: 'reason',
        label: intl.get('smodr.afterSaleManage.view.detail.problem').d('问题描述'),
        colSpan: 2,
        newLine: true,
        renderer: afsProblemRenderer,
      },
      // {
      //   name: 'pickUpAddressText',
      //   hidden: store.data.pickWareType !== 'PICK_UP',
      //   label: intl.get('smodr.afterSaleManage.view.detail.pickupInfo').d('上门取件地址'),
      //   colSpan: 2,
      //   newLine: true,
      //   show: !!ds?.current?.get('pickUpAddressText'),
      // },
      // {
      //   name: 'receiptAddressText',
      //   label: intl.get('smodr.afterSaleManage.view.detail.personInfo').d('联系人信息'),
      //   colSpan: 2,
      //   newLine: true,
      //   show: !!ds?.current?.get('receiptAddressText'),
      // },
      // {
      //   name: 'supplierAddressText',
      //   label: intl.get('smodr.afterSaleManage.view.detail.returnAdd').d('退货地址'),
      //   colSpan: 2,
      //   show:
      //     ds?.current?.get('afterSaleStatus') !== 'REJECT' &&
      //     !!ds?.current?.get('supplierAddressText'),
      // },
      {
        name: 'afterSaleWaybillText',
        label: intl
          .get('smodr.afterSaleManage.view.detail.clientWayBillInfo')
          .d('客户退件运单信息'),
        colSpan: 2,
        show: !!ds?.current?.get('afterSaleWaybillText'),
        renderer: ({ record, text }) => {
          return (
            <div style={{ whiteSpace: 'nowrap' }}>
              <span>{text}</span>
              <a
                style={{ marginLeft: '16px', fontWeight: 600 }}
                onClick={() => handleCheckLogis(record, 'RETURN')}
              >
                {intl.get('smodr.common.view.logistics.information').d('查看物流信息')}
              </a>
            </div>
          );
        },
      },
      {
        name: 'afterSaleWaybillTextNew',
        label: intl
          .get('smodr.afterSaleManage.view.detail.supplierWayBillInfo')
          .d('供应商返件运单信息'),
        colSpan: 2,
        show: !!ds?.current?.get('afterSaleWaybillTextNew'),
        renderer: ({ record, text }) => {
          return (
            <div style={{ whiteSpace: 'nowrap' }}>
              <span>{text}</span>
              <a
                style={{ marginLeft: '16px', fontWeight: 600 }}
                onClick={() => handleCheckLogis(record, 'RENEW')}
              >
                {intl.get('smodr.common.view.logistics.information').d('查看物流信息')}
              </a>
            </div>
          );
        },
      },
    ];
    return fields.filter((f) => f.show !== false);
  };

  const getOrderInfoFields = (ds) => {
    const field = [
      {
        name: 'orderCode',
        label: intl.get('smodr.afterSaleManage.model.mallPoNum').d('商城订单号'),
      },
      // { name: 'skuCode', label: intl.get('smodr.afterSaleManage.model.productNum').d('商品编码') },
      {
        name: 'srmOrderCode',
        label: intl.get('smodr.afterSaleManage.model.malSrmNum').d('采购订单号'),
      },
      {
        name: 'ecConsignmentCode',
        label: intl.get('smodr.afterSaleManage.model.ecMalSrmNum').d('电商子订单号'),
        show: ds?.current?.get('orderTypeCode') === 'EC',
      },
      {
        name: 'purchaseCompanyName',
        label: intl.get('smodr.afterSaleManage.model.purchasername').d('采购方公司'),
        renderer: ({ record, value }) => {
          return (
            <>
              {record?.get('agreementType') === 'SALE' ? record?.get('proxySupplierCompanyName') : value}
            </>
          );
        },
      },
      {
        name: 'supplierCompanyName',
        label: intl.get('smodr.afterSaleManage.model.suppliername').d('供应商公司'),
      },
      // {
      //   name: 'skuGiveCode',
      //   label: intl.get('smodr.afterSaleManage.model.skuGiveCode').d('赠品编码'),
      //   renderer: ({ value }) => {
      //     return (
      //       <>
      //         {value?.map(i => <div>{i}</div>) || '-'}
      //       </>
      //     );
      //   },
      // },
    ];
    return field.filter((f) => f.show !== false);
  };

  return (
    <div className={styles['afs-container']}>
      <div className='afs-line' style={{ height: 'calc(100% - 111px)' }} />
      <Spin spinning={loading}>
        <div className="afs-wrapper">
          <div>
            <Card
              title={intl.get('smodr.afterSaleManage.view.detail.requestTitle').d('申请单信息')}
              className="afs-info"
            >
              <Observer>
                {() => (
                  <CustReadForm
                    fields={getAfsInfoFields(afsDs)}
                    dataSet={afsDs}
                    columns={3}
                    code={unitCode[0]}
                    customizeForm={customizeForm}
                  />
                )}
              </Observer>
            </Card>
            <Card
              title={intl.get('smodr.afterSaleManage.view.detail.afsSku').d('售后行商品信息')}
              className="afs-info"
            >
              <Table
                dataSet={skuTableDs}
                columns={skuColumns}
                customizedCode='SMODR.AFTER.SALE.SKUS.DETIAL'
              />
            </Card>
            {
              afsDs.current?.get('realityPickWareTypeMeaning') && (
                <Card
                  title={intl.get('smodr.afterSaleManage.view.detail.skuAfsDetail').d('商品售后实际执行明细')}
                  className="afs-sku-info"
                >
                  <div style={{ marginBottom: '18px' }}>
                    <CustReadForm
                      fields={[
                        {
                          name: 'realityPickWareTypeMeaning',
                          label: intl.get('smodr.afterSaleManage.view.detail.afsPickWareType').d('退件方式'),
                        },
                        {
                          name: 'supplierAddressText',
                          label: intl.get('smodr.afterSaleManage.view.detail.returnAdd').d('退货地址'),
                          colSpan: 2,
                          show:
                          afsDs?.current?.get('afterSaleStatus') !== 'REJECT' &&
                            !!afsDs?.current?.get('supplierAddressText'),
                        },
                      ].filter((f) => f.show !== false)}
                      dataSet={afsDs}
                      columns={3}
                    />
                  </div>
                  {afsDs.current?.get('afterSaleEntryDetailList')?.length > 0 && (
                    <Table
                      dataSet={tableDs}
                      columns={columns}
                      customizedCode='SMODR.AFTER.SALE.EXECUTE.DETIAL'
                    />
                  )}
                </Card>
              )
            }
          </div>
          <div className='order-right'>
            <Card
              title={intl.get('smodr.afterSaleManage.view.detail.orderBaseInfoTitle').d('订单基本信息')}
              className="order-info"
            >
              <CustReadForm
                fields={getOrderInfoFields(afsDs)}
                dataSet={afsDs}
                columns={1}
                code={unitCode[1]}
                customizeForm={customizeForm}
              />
            </Card>
            {/* <Card
              title={intl.get('smodr.afterSaleManage.view.detail.skuBaseInfoTitle').d('订单商品信息')}
              className="order-sku-info"
            >
              <Observer>
                {() => orderSkuRenderer(store?.data)}
              </Observer>
            </Card> */}
          </div>
        </div>
      </Spin>
    </div>
  );
}

export default withCustomize({ unitCode })(AfsDetail);
