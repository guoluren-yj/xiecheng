import React, { useEffect, useState, useMemo } from 'react';
import { Form, Spin, Output, DataSet, Button, Table } from 'choerodon-ui/pro';

// import { observer } from 'mobx-react-lite';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import c7nModal from '@/utils/c7nModal';

import { fetchSupSaleDetail } from '../../AfterSaleManage/api';
import { afsStatusRenderer, afsProblemRenderer, orderSkuRenderer } from './renderers';
import styles from './index.less';
import LogisModal from './LogisModal';

const unitCode = ['SMODR.AFTERSALE_DETAIL.REQUEST', 'SMODR.AFTERSALE_DETAIL.ORDER', 'SMODR.AFTERSALE_DETAIL.SKUS.DETIAL'];

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
  return customizeForm(
    { code },
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
  const [data, setData] = useState({});

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

  useEffect(() => {
    initData(afsLine.afterSaleId);
  }, [afsLine.afterSaleId]);

  async function initData(afterSaleId) {
    if (!afterSaleId) return false;
    setLoading(true);
    const res = getResponse(await fetchSupSaleDetail(afterSaleId, unitCode.join(',')));
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
        afterSaleEntryApplyList,
      } = res;
      const otherInfo = afterSaleEntryList?.[0] || {};
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
      };
      afsDs.loadData([_data]);
      skuTableDs.loadData(afterSaleEntryApplyList||[]);
      setData(_data);
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
        label: intl.get('smodr.afterSaleManage.model.afterSaleNumber').d('申请单号'),
      },
      {
        name: 'afterSaleType',
        label: intl.get('smodr.afterSaleManage.model.afterSaleTypeMeaning').d('售后类型'),
        renderer: ({ record, name, text }) => (record ? record.get(`${name}Meaning`) : text),
      },
      {
        name: 'afsQuantity',
        label: intl.get('smodr.afterSaleManage.model.afsQuantity').d('售后数量'),
      },
      {
        name: 'afterSaleStatus',
        label: intl.get('smodr.afterSaleManage.model.manageStatusName').d('售后状态'),
        renderer: afsStatusRenderer,
      },
      {
        name: 'afsReason',
        label: intl.get('smodr.afterSaleManage.view.detail.reason').d('售后原因'),
        colSpan: 2,
      },
      {
        name: 'reason',
        label: intl.get('smodr.afterSaleManage.view.detail.problem').d('问题描述'),
        colSpan: 2,
        renderer: afsProblemRenderer,
      },
      {
        name: 'pickWareType',
        label: intl.get('smodr.afterSaleManage.view.detail.afsPickWareType').d('退件方式'),
        colSpan: 2,
        renderer: ({ record, name, text }) => (record ? record.get(`${name}Meaning`) : text),
      },
      {
        name: 'pickUpAddressText',
        hidden: data.pickWareType !== 'PICK_UP',
        label: intl.get('smodr.afterSaleManage.view.detail.pickupInfo').d('上门取件地址'),
        colSpan: 2,
        show: !!ds?.current?.get('pickUpAddressText'),
      },
      {
        name: 'receiptAddressText',
        label: intl.get('smodr.afterSaleManage.view.detail.personInfo').d('联系人信息'),
        colSpan: 2,
        show: !!ds?.current?.get('receiptAddressText'),
      },
      {
        name: 'supplierAddressText',
        label: intl.get('smodr.afterSaleManage.view.detail.returnAdd').d('退货地址'),
        colSpan: 2,
        show:
          ds?.current?.get('afterSaleStatus') !== 'REJECT' &&
          !!ds?.current?.get('supplierAddressText'),
      },
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
        newLine: true,
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

  const getOrderInfoFields = () => {
    const field = [
      { name: 'skuCode', label: intl.get('smodr.afterSaleManage.model.productNum').d('商品编码') },
      {
        name: 'orderCode',
        label: intl.get('smodr.afterSaleManage.model.mallPoNumber').d('商城订单编码'),
      },
      {
        name: 'srmOrderCode',
        label: intl.get('smodr.afterSaleManage.model.malSrmNum').d('采购订单号'),
      },
      {
        name: 'purchaseCompanyName',
        label: intl.get('smodr.afterSaleManage.model.purchaser').d('采购方'),
        renderer: ({ text, record }) => (
          <span>
            {record?.get('agreementType') === 'SALE'
              ? record?.get('proxySupplierCompanyName')
              : text}
          </span>
        ),
      },
    ];
    return field.filter((v) => v.show !== false);
  };

  return (
    <div className={styles['afs-container']}>
      <Spin spinning={loading}>
        <div className="afs-wrapper">
          <div className="afs-wrapper-left">
            <Card
              title={intl.get('smodr.afterSaleManage.view.detail.requestTitle').d('申请单信息')}
              className="afs-info"
            >
              <CustReadForm
                fields={getAfsInfoFields(afsDs)}
                dataSet={afsDs}
                columns={2}
                code={unitCode[0]}
                customizeForm={customizeForm}
              />
            </Card>
            <Card
              title={intl.get('smodr.afterSaleManage.view.detail.afsSku').d('售后行商品信息')}
              className="afs-info"
            >
              <Table
                dataSet={skuTableDs}
                columns={skuColumns}
                customizedCode={unitCode[2]}
              />
            </Card>
          </div>
          <Card
            title={intl.get('smodr.afterSaleManage.view.detail.orderInfoTitle').d('订单信息')}
            className="order-info"
          >
            {orderSkuRenderer(data)}
            <CustReadForm
              fields={getOrderInfoFields()}
              dataSet={afsDs}
              columns={1}
              code={unitCode[1]}
              customizeForm={customizeForm}
            />
          </Card>
        </div>
      </Spin>
    </div>
  );
}

export default withCustomize({ unitCode })(AfsDetail);
