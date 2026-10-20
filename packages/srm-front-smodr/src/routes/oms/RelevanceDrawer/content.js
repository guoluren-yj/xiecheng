import React, { useMemo, useEffect } from 'react';
import { DataSet } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';

import RenderForm from './RenderForm';
import styles from './content.less';

const unitCode = [
  'SMODR.ORDER.ENTRY.ASSOC_PREEMPT',
  'SMODR.ORDER.ENTRY.ASSOC_DELIVERY',
  'SMODR.ORDER.ENTRY.ASSOC_RECEIVE',
  'SMODR.ORDER.ENTRY.ASSOC_STA',
];

function DrawContent(props) {
  const { data = {}, customizeForm } = props;
  const ds = useMemo(() => new DataSet(), []);

  useEffect(() => {
    ds.loadData([data]);
  }, []);

  const renderFields = (type) => {
    const fields = [
      {
        name: 'orderCode',
        label: intl.get('smodr.orderLine.model.orderCode').d('商城订单编码'),
        type: '1',
        // newLine: true,
      },
      {
        name: 'cecOrderCode',
        label: intl.get('smodr.common.model.fatherOrderCode').d('电商父订单编码'),
        show: data.orderType === 'EC',
        type: '1',
        // newLine: true,
      },
      {
        name: 'reqNum',
        label: intl.get('smodr.common.model.reqNumber').d('采购申请编码'),
        type: '1',
        colSpan: 2,
        // newLine: true,
      },
      {
        name: 'srmOrderCode',
        label: intl.get('smodr.orderLine.model.reqOrderCode').d('采购订单编码'),
        type: '1',
        // newLine: true,
      },
      {
        name: 'ecConsignmentCode',
        label: intl.get('smodr.common.model.sonOrderCode').d('电商子订单编码'),
        show: data.orderType === 'EC',
        type: '2',
      },
      {
        name: 'srmConsignmentCode',
        label: intl.get('smodr.common.model.outConsignmentCode').d('外部配送单编码'),
        type: '2',
      },
      {
        name: 'cecReceiptCode',
        label: intl.get('smodr.common.model.outReceiptCode').d('外部接收单编码'),
        type: '3',
      },
      {
        name: 'ecStatementsCode',
        label: intl.get('smodr.common.model.ecStatementsCode').d('电商对账单编码'),
        show: data.orderType === 'EC',
        type: '4',
      },
      {
        name: 'srmStatementsCode',
        label: intl.get('smodr.common.model.outStatementsCode').d('外部对账单编码'),
        type: '4',
      },
      {
        name: 'requestNum',
        label: intl.get('smodr.invoice.model.invoiceNum').d('开票申请编码'),
        type: '5',
        show: data.orderType === 'EC',
      },
      {
        name: 'applicationCode',
        label: intl.get('smodr.common.model.outInvoiceCode').d('外部开票申请编码'),
        type: '5',
        show: data.orderType === 'EC' || data.orderType === 'CATA',
      },
      {
        name: 'ecApplicationNo',
        label: intl.get('smodr.invoice.model.applicationNo').d('电商开票申请编码'),
        type: '5',
        show: data.orderType === 'EC',
      },
    ];

    return fields.filter((v) => v.type === type).filter((f) => f.show !== false);
  };
  return (
    <div className={styles['content-draw']}>
      <div className="content-title-1">
        {intl.get('smodr.common.model.yuzhanModule').d('预占模块')}
      </div>
      <div>
        <RenderForm
          fields={renderFields('1')}
          dataSet={ds}
          customizeForm={customizeForm}
          code={unitCode[0]}
          columns={1}
        />
        {/* <Title>{intl.get('smodr.orderLine.model.orderCode').d('商城订单编码')}</Title>
        <Value>{data?.orderCode}</Value>
        {data?.orderType === 'EC' && (
          <>
            <Title>{intl.get('smodr.common.model.fatherOrderCode').d('电商父订单编码')}</Title>
            <Value>{data?.cecOrderCode}</Value>
          </>
        )}
        <Title>{intl.get('smodr.common.model.reqNumber').d('采购申请编码')}</Title>
        <Value>{data?.reqNum}</Value>
        <Title>{intl.get('smodr.orderLine.model.reqOrderCode').d('采购订单编码')}</Title>
        <Value>{data?.srmOrderCode}</Value> */}
      </div>
      {data?.consignment === 1 && (
        <>
          <div className="content-title-2">
            {intl.get('smodr.common.model.peisongModule').d('配送模块')}
          </div>
          <div>
            <RenderForm
              fields={renderFields('2')}
              dataSet={ds}
              customizeForm={customizeForm}
              code={unitCode[1]}
              columns={1}
            />
            {/* {data?.orderType === 'EC' && (
              <>
                <Title>{intl.get('smodr.common.model.sonOrderCode').d('电商子订单编码')}</Title>
                <Value>{data?.ecConsignmentCode}</Value>
              </>
            )}
            <Title>{intl.get('smodr.common.model.outConsignmentCode').d('外部配送单编码')}</Title>
            <Value>{data?.srmConsignmentCode}</Value> */}
          </div>
        </>
      )}
      {data?.receive === 1 && (
        <>
          <div className="content-title-3">
            {intl.get('smodr.common.model.jieshouModule').d('接收模块')}
          </div>
          <div>
            <RenderForm
              fields={renderFields('3')}
              columns={1}
              dataSet={ds}
              customizeForm={customizeForm}
              code={unitCode[2]}
            />
            {/* <Title>{intl.get('smodr.common.model.outReceiptCode').d('外部接收单编码')}</Title>
            <Value>{data?.cecReceiptCode}</Value> */}
          </div>
        </>
      )}
      {data?.statements === 1 && (
        <>
          <div className="content-title-4">
            {intl.get('smodr.common.model.duizhangModule').d('对账模块')}
          </div>
          <div>
            <RenderForm
              fields={renderFields('4')}
              columns={1}
              dataSet={ds}
              customizeForm={customizeForm}
              code={unitCode[3]}
            />
          </div>
        </>
      )}
      {
        data.invoice === 1 && (
          <>
            <div className="content-title-4">
              {intl.get('smodr.common.model.invoiceModule').d('开票模块')}
            </div>
            <div>
              <RenderForm
                fields={renderFields('5')}
                columns={1}
                dataSet={ds}
              // customizeForm={customizeForm}
              // code={unitCode[3]}
              />
            </div>
          </>
        )
      }
    </div>
  );
}
export default withCustomize({ unitCode })(DrawContent);
