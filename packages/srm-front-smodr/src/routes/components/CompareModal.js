import React, { useMemo, useRef, useEffect, useState } from 'react';
import { DataSet, Button, Table, Form, Output, Icon } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import * as echarts from 'echarts';
import { isEmpty } from 'lodash';

import c7nModal from '@/utils/c7nModal';
import intl from 'utils/intl';
import SecondCard from '@/routes/components/SecondCard';
import { fetchAICompareService } from '@/services/oms/orderDetailService';

const BaseInfo = observer((props) => {
  const { data } = props;
  const baseDS = useMemo(() => new DataSet({
    fields: [
      { name: 'unitName', label: intl.get('smodr.orderDetail.model.purchaseOrg').d('采购组织') },
      { name: 'fullAddress', label: intl.get('smodr.orderDetail.model.address').d('收货地址') },
    ],
  }), []);

  useEffect(() => {
    baseDS.loadData([data]);
  }, [data]);

  return (
      <SecondCard title={intl.get('smodr.orderDetail.view.baseInfo').d('基本信息')} offsetTop={0}>
        <Form
          dataSet={baseDS}
          useWidthPercent
          className="c7n-pro-vertical-form-display"
          labelLayout="vertical"
          columns={3}
        >
          <Output name="unitName" />
          <Output name="fullAddress" />
        </Form>
      </SecondCard>
  );
});

const OrderRecord = observer((props) => {
  const { data } = props;
  const orderRecordDS = useMemo(() => new DataSet({
    selection: false,
    fields: [
      {
        name: 'buyerName',
        label: intl.get('smodr.orderDetail.model.buyerName').d('购买人'),
      },
      {
        name: 'unitName',
        label: intl.get('smodr.orderDetail.model.unitName').d('部门'),
      },
      {
        name: 'skuName',
        label: intl.get('smodr.orderDetail.model.skuName').d('下单商品'),
      },
      {
        name: 'creationDate',
        label: intl.get('smodr.orderDetail.model.creationDate').d('下单日期'),
      },
      {
        name: 'quantity',
        type: 'number',
        label: intl.get('smodr.orderDetail.model.quantity').d('下单数量'),
      },
      {
        name: 'unitPrice',
        type: 'number',
        label: intl.get('smodr.orderDetail.model.unitPrice').d('价格'),
      },
      {
        name: 'entryAmount',
        type: 'number',
        label: intl.get('smodr.orderDetail.model.entryAmount').d('金额'),
      },
    ],
  }), []);
  const columns = [
    {name: 'buyerName'},
    {name: 'unitName'},
    {name: 'skuName'},
    {name: 'creationDate'},
    {name: 'quantity'},
    {name: 'unitPrice'},
    {name: 'entryAmount'},
  ];

  useEffect(() => {
    orderRecordDS.loadData(data);
  }, [data]);
  return (
    <SecondCard title={intl.get('smodr.orderDetail.view.orderRecord').d('下单记录')}>
      <Table
        dataSet={orderRecordDS}
        columns={columns}
        customizedCode='APPLY_WORKBENCH.COMPARE_ORDER_RECORD'
      />
    </SecondCard>
  );
});

const LineChart = observer((props) => {
  const { data } = props;
  const { productCompareAssignList } = data;
  const lineRef = useRef(null);
  const ids = productCompareAssignList.map((item) => item.productId);
  const [chartDTO, setChartDTO] = useState({});
  const { xAxis = [], series = [], dataList = [] } = chartDTO;

  useEffect(() => {
    fetchAICompareService(ids)
      .then((res) => {
        if(res) {
          setChartDTO(res);
        }
      });
  }, []);

  const echartsInstance = useMemo(() => {
    if (lineRef.current) {
      return echarts.init(lineRef.current);
    }
  }, [lineRef.current]);

  const option = useMemo(() => {
    if(isEmpty(chartDTO)) {
      return {};
    }
    return {
      grid: {
        left: 57,
        right: 20,
        top: 57,
        bottom: 57,
      },
      tooltip: {
        trigger: 'item',
        axisPointer: {
          type: 'none',
        },
        confine: true,
      },
      legend: {
        type: 'scroll',
        top: 10,
        itemWidth: 8,
        itemHeight: 8,
        textStyle: {
          fontSize: 12,
          height: 20,
          lineHeight: 20,
        },
        align: 'auto',
        data: series && series.map((item) => ({
          name: item.name,
          icon: 'rect',
        })),
      },
      xAxis: {
        type: 'category',
        data: xAxis,
        axisLine: {
          lineStyle: {
            color: '#E5E7EC',
          },
        },
        axisLabel: {
          color: '#191919',
        },
        axisTick: {
          show: false,
        },
      },
      yAxis: {
        type: 'value',
        axisLine: {
          lineStyle: {
            color: '#E5E7EC',
          },
        },
        axisLabel: {
          color: '#191919',
        },
        splitLine: {
          lineStyle: {
            type: 'dashed',
          },
        },
        axisTick: {
          show: false,
        },
      },
      series: series && series.map((item) => ({ ...item, type: 'line', symbolSize: 8 })),
    };
  }, [chartDTO]);

  useEffect(() => {
    if (echartsInstance) {
      echartsInstance.setOption(option);
    }
  }, [option]);

  // const title = (
  //   <div>
  //     {intl.get('smodr.orderDetail.view.priceLineChart').d('价格分析')}
  //     <Tooltip title={intl.get('smodr.orderDetail.view.priceLineChartTooltip').d('本分析依据历史下单记录呈现商品价格走势，仅作决策参考之用。')}>
  //       <Icon type="help" style={{ fontSize: '14px', marginLeft: '4px', color: '#888' }} />
  //     </Tooltip>
  //   </div>
  // );

  return (
    <>
      {/* <SecondCard title={title}>
        <div ref={lineRef} style={{ width: 'calc(100% - 16px)', height: '284px', margin: '0 auto', outline: '8px solid #f7f7f7' }} />
      </SecondCard> */}
      <OrderRecord data={dataList} />
    </>
  );
});

export default function openCompareModal(value) {
  const { productCompareAssignList = [], autoFlag, productId } = value;
  // 将主商品（productId 匹配的项）放到第一位
  const sortedProductCompareAssignList = [...productCompareAssignList].sort((a, b) => {
    if (a.productId === productId) return -1;
    if (b.productId === productId) return 1;
    return 0;
  });
  
  const AiFields = autoFlag === 2 ? [
    { name: 'similarity', label: intl.get('smodr.orderDetail.model.similarity').d('相似度') },
    { name: 'recommendReason', label: intl.get('smodr.orderDetail.model.recommendReason').d('推荐理由') },
  ] : [];
  const fields = [
    { name: 'productName', label: intl.get('smodr.orderDetail.model.skuName').d('商品名称') },
    { name: 'productCode', label: intl.get('smodr.orderDetail.model.skuCode').d('商品编码') },
    { name: 'showSupplierName', label: intl.get('smodr.orderDetail.model.supplierCompanyName').d('供应商') },
    {
      name: 'type',
      label: intl.get('smodr.orderDetail.model.sourceType').d('来源类型'),
      renderer: ({ value: val, record }) => (
        <span>
          {autoFlag === 2 && productId === record.get('productId') ? intl.get('smodr.orderDetail.model.mainProduct').d('主商品') : val === 2
            ? intl.get('smodr.orderDetail.model.termOfSale').d('同款推荐')
            : intl.get('smodr.orderDetail.model.editMode').d('手工添加')}
        </span>
      ),
    },
    ...AiFields,
    { name: 'price', width: 100, label: intl.get('smodr.orderDetail.model.price').d('单价'), type: 'number' },
  ];
  const tableDs = new DataSet({
    selection: false,
    paging: false,
    fields,
  });
  tableDs.loadData(sortedProductCompareAssignList);
  const modal = c7nModal({
    title: intl.get('smodr.orderDetail.model.competitive').d('比价单'),
    children: (
      <>
        <BaseInfo data={value} />
        <SecondCard title={intl.get('smodr.orderDetail.view.compareTable').d('同款商品列表')}>
          <Table
            dataSet={tableDs}
            columns={fields}
            style={{ maxHeight: 'calc(100vh - 160px)' }}
            customizedCode='APPLY_WORKBENCH.COMPARE_ORDER'
          />
        </SecondCard>
        {autoFlag === 2 && <LineChart data={value} />}
      </>
    ),
    style: { width: 1090 },
    footer: <Button color='primary' onClick={() => modal?.close()}>{intl.get('smodr.orderDetail.model.close').d('关闭')}</Button>,
  });
  return modal;
}