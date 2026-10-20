import React from 'react';
import { connect } from 'dva';
import { DataSet, Table, Form, Output, Button } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { Observer } from 'mobx-react';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
// import { Value, Title } from '@/routes/components/Label';
import c7nModal from '@/utils/c7nModal';

import styles from './index.less';
import { productDs } from './ds';
import LogisModal from '../PurAfterSaleWorkBench/AfsDetail/LogisModal';
import { afsStatusRenderer, afsProblemRenderer } from '../PurAfterSaleWorkBench/AfsDetail/renderers';

const readFormProps = {
  labelLayout: 'vertical',
  className: 'c7n-pro-vertical-form-display',
};

const CustReadForm = (props) => {
  const { fields = [], code, ...otherProps } = props;
  return (
    <Form {...readFormProps} {...otherProps}>
      {fields.map((m) => {
        return <Output {...m} />;
      })}
    </Form>
  );
};

@formatterCollections({
  code: ['smodr.afterSaleOrder', 'smodr.common', 'smodr.afterSaleManage'],
})
@connect(({ afterSaleOrder, loading }) => ({
  afterSaleOrder,
  fetchAfterSaleLoading: loading.effects['afterSaleOrder/fetchAfterSaleData'],
}))
export default class AfterSaleOrder extends React.Component {
  constructor(props) {
    super(props);
    const { afterSaleCode } = props;
    this.state = { afterSaleCode };
  }

  afsDs = new DataSet();

  productDs = new DataSet(productDs());

  tableDs = new DataSet({
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
  });

  @Bind()
  handleCheckLogis(record, type) {
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
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const { afterSaleCode } = this.state;
    dispatch({
      type: 'afterSaleOrder/fetchAfterSaleData',
      payload: { afterSaleCode },
    }).then(res => {
      this.renderAfsData(res);
    });
  }

  componentWillReceiveProps(nextProps) {
    const { dispatch } = this.props;
    const { afterSaleCode } = nextProps;
    const { afterSaleCode: oldafterSaleCode } = this.state;
    if (afterSaleCode && afterSaleCode !== oldafterSaleCode) {
      dispatch({
        type: 'afterSaleOrder/fetchAfterSaleData',
        payload: {
          afterSaleCode,
        },
      }).then(res => {
        this.renderAfsData(res);
      });
    }
  }

  @Bind()
  renderAfsData(res) {
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
        remark,
      } = res;
      const otherInfo = afterSaleEntryList?.[0] || {};
      const { afterSaleEntryExtras = [] } = afterSaleEntryList?.[0] || {};
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
      const list = [];
      afterSaleEntryList.forEach(i => {
        const { afterSaleEntryExtras: extras = [] } = i;
        list.push(...extras || []);
      });
      this.productDs.loadData([...afterSaleEntryList, ...list]);
      this.afsDs.loadData([_data]);
      this.tableDs.loadData(res.afterSaleEntryDetailList || []);
    }
  }

  render() {
    const { afterSaleOrder } = this.props;
    // const { orderEntryId } = this.state;
    const { afterSaleData = {} } = afterSaleOrder;
    const productColumns = [
      {
        width: 150,
        name: 'skuCode',
      },
      {
        name: 'skuName',
      },
      {
        width: 100,
        name: 'skuTypeMeaning',
      },
      {
        width: 100,
        name: 'applyQuantityMeaning',
        align: 'right',
        // renderer: ({ value, record }) => <span>{value || record.get('applyQuantityMeaning')}</span>,
      },
    ];

    const columns = [
      {
        name: 'skuCode',
        footer: () => <div>{intl.get('smodr.afterSaleManage.model.summation').d('汇总')}</div>,
      },
      {
        name: 'skuName',
      },
      {
        name: 'skuTypeMeaning',
      },
      {
        name: 'afterSaleTypeMeaning',
      },
      {
        align: 'right',
        name: 'realityQuantityMeaning',
      },
      {
        align: 'right',
        name: 'realityRefundAmountMeaning',
        footer: () => {
          return (
            <div style={{ paddingRight: 30}}>{afterSaleData?.totalRealityRefundAmountMeaning || '-'}</div>
          );
        },
      },
    ];
    const getAfsInfoFields = () => {
      const fields = [
        {
          name: 'afterSaleCode',
          label: intl.get('smodr.afterSaleOrder.model.afterSaleCode').d('商城售后单编码'),
        },
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
        //   name: 'cecAfterSaleCode',
        //   label: intl.get('smodr.afterSaleManage.model.ecAfterSaleNumber').d('电商售后单号'),
        //   show: ds?.current?.get('orderTypeCode') === 'EC',
        // },
        // {
        //   name: 'consignmentCode',
        //   label: intl.get('smodr.afterSaleOrder.model.consignmentCode').d('商城配送单编码'),
        // },
        // {
        //   name: 'orderCode',
        //   label: intl.get('smodr.afterSaleOrder.model.orderCode').d('商城订单编码'),
        // },
        // {
        //   name: 'afsQuantity',
        //   label: intl.get('smodr.afterSaleManage.model.skuAfsQuantity').d('主品售后数量'),
        // },
        // {
        //   name: 'giftQuantity',
        //   label: intl.get('smodr.afterSaleManage.model.giftAfsQuantity').d('赠品售后数量'),
        //   show: !!ds?.current?.get('giftQuantity'),
        // },
        // {
        //   name: 'pickUpAddressText',
        //   hidden: this.afsDs.current?.get('pickWareType') !== 'PICK_UP',
        //   label: intl.get('smodr.afterSaleManage.view.detail.pickupInfo').d('上门取件地址'),
        //   newLine: true,
        //   colSpan: 2,
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
        //   newLine: true,
        //   show:
        //     ds?.current?.get('afterSaleStatus') !== 'REJECT' &&
        //     !!ds?.current?.get('supplierAddressText'),
        // },
        // {
        //   name: 'afterSaleWaybillText',
        //   label: intl
        //     .get('smodr.afterSaleManage.view.detail.clientWayBillInfo')
        //     .d('客户退件运单信息'),
        //   colSpan: 2,
        //   newLine: true,
        //   show: !!ds?.current?.get('afterSaleWaybillText'),
        //   renderer: ({ record, text }) => {
        //     return (
        //       <div style={{ whiteSpace: 'nowrap' }}>
        //         <span>{text}</span>
        //         <a
        //           style={{ marginLeft: '16px', fontWeight: 600 }}
        //           onClick={() => this.handleCheckLogis(record, 'RETURN')}
        //         >
        //           {intl.get('smodr.common.view.logistics.information').d('查看物流信息')}
        //         </a>
        //       </div>
        //     );
        //   },
        // },
        // {
        //   name: 'afterSaleWaybillTextNew',
        //   label: intl
        //     .get('smodr.afterSaleManage.view.detail.supplierWayBillInfo')
        //     .d('供应商返件运单信息'),
        //   newLine: true,
        //   show: !!ds?.current?.get('afterSaleWaybillTextNew'),
        //   renderer: ({ record, text }) => {
        //     return (
        //       <div style={{ whiteSpace: 'nowrap' }}>
        //         <span>{text}</span>
        //         <a
        //           style={{ marginLeft: '16px', fontWeight: 600 }}
        //           onClick={() => this.handleCheckLogis(record, 'RENEW')}
        //         >
        //           {intl.get('smodr.common.view.logistics.information').d('查看物流信息')}
        //         </a>
        //       </div>
        //     );
        //   },
        // },
      ];
      return fields.filter((f) => f.show !== false);
    };
    return (
      <div className={styles['page-content-layout']}>
        <div className="header-line" style={{ marginTop: 0 }}>
          {intl.get('smodr.afterSaleOrder.view.baseInfo').d('基本信息')}
        </div>
        <Observer>
          {() => (
            <CustReadForm
              fields={getAfsInfoFields()}
              dataSet={this.afsDs}
              columns={3}
            />
          )}
        </Observer>
        <div className="header-line" style={{ marginTop: '32px' }}>
          {intl.get('smodr.afterSaleOrder.view.detail.skuAfsDetail').d('售后行商品信息')}
        </div>
        <Table dataSet={this.productDs} columns={productColumns} customizedCode='SMODR.DETAIL.AFS.ORDER.SKU' />
        <Observer>
          {() => {
            return (
              <>
                {this.afsDs.current?.get('realityPickWareTypeMeaning') && (
                  <>
                    <div className="header-line-other">
                      {intl.get('smodr.afterSaleManage.view.detail.skuAfsDetail').d('商品售后实际执行明细')}
                    </div>
                    <div style={{ marginBottom: '18px' }}>
                      <CustReadForm
                        fields={[
                          {
                            name: 'realityPickWareTypeMeaning',
                            label: intl.get('smodr.afterSaleManage.view.detail.afsPickWareType').d('退件方式'),
                            show: !!this.afsDs?.current?.get('realityPickWareTypeMeaning'),
                          },
                          {
                            name: 'supplierAddressText',
                            label: intl.get('smodr.afterSaleManage.view.detail.returnAdd').d('退货地址'),
                            colSpan: 1,
                            show: this.afsDs?.current?.get('afterSaleStatus') !== 'REJECT' &&
                              !!this.afsDs?.current?.get('supplierAddressText'),
                          },
                        ].filter((f) => f.show !== false)
                      }
                        dataSet={this.afsDs}
                        columns={3}
                      />
                    </div>
                    {
                      this.afsDs.current?.get('afterSaleEntryDetailList')?.length > 0 && (
                        <Table
                          dataSet={this.tableDs}
                          columns={columns}
                          customizedCode='SMODR.DETAIL.AFS.ORDER'
                        />
                      )
                    }
                  </>
                )}

              </>
            );
          }}
        </Observer>
      </div>
    );
  }
}
