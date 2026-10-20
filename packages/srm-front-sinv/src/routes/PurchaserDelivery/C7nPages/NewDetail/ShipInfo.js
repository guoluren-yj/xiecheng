import React, { Fragment } from 'react';
import { Form, Spin, TextArea, TextField, Output } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { Content } from 'components/Page';
import { showBigNumber } from '@/routes/components/utils';
import { yesOrNoRender } from 'utils/renderer';
import styles from './form.less';

const ShipInfo = (props) => {
  const { ds, customizeForm, editFlag = false } = props;

  const shipColumns = [
    {
      name: 'asnNum',
      disabled: true,
    },
    {
      name: 'asnTypeCodeMeaning',
      disabled: true,
    },
    {
      name: 'supplierCompanyName',
      disabled: true,
    },
    {
      name: 'immedShippedFlag',
      disabled: true,
      renderer: ({ value }) => yesOrNoRender(+value),
    },
    {
      name: 'supplierSiteName',
      disabled: true,
    },
    {
      name: 'shipDate',
      disabled: true,
    },
    {
      name: 'expectedArriveDate',
      disabled: true,
    },
    {
      name: 'totalQuantity',
      disabled: true,
      renderer: ({ value, record }) => showBigNumber(value, record && record.get('uomPrecision')),
    },
    {
      name: 'transportType',
      disabled: true,
    },
    {
      name: 'buyerRemark',
      newLine: editFlag,
      resize: 'both',
      colSpan: 2,
      autoSize: { minRows: 2, maxRows: 8 },
      fieldType: 'TextArea',
    },
    {
      name: 'remark',
      disabled: true,
      newLine: editFlag,
      resize: 'both',
      colSpan: 2,
      autoSize: { minRows: 2, maxRows: 8 },
      fieldType: 'TextArea',
    },
  ];

  return (
    <Fragment>
      <Spin dataSet={ds}>
        <Content className={styles.info}>
          <div className={styles.title}>
            <h3 className={styles['override-h3']} id="purchaser-delivery-shipInfo">
              {intl.get(`sinv.purchaserDelivery.view.message.title.orderHeaderShip`).d('发货信息')}
            </h3>
          </div>
          <div className={editFlag ? styles['content-edit'] : styles.content}>
            {customizeForm(
              {
                code: 'SINV.PURCHASER_DELIVERY.DETAIL.HEADER',
                readOnly: !editFlag,
                __force_record_to_update__: true,
              },
              <Form labelLayout={editFlag ? 'float' : 'vertical'} dataSet={ds} columns={3}>
                {shipColumns.map((res) => {
                  if (res.fieldType === 'TextArea') {
                    return editFlag ? <TextArea {...res} /> : <Output {...res} />;
                  } else {
                    return editFlag ? <TextField {...res} /> : <Output {...res} />;
                  }
                })}
              </Form>
            )}
          </div>
        </Content>
      </Spin>
    </Fragment>
  );
};

export default ShipInfo;
