import React, { Fragment } from 'react';
import { Form, Spin, TextField, Output } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { Content } from 'components/Page';
import styles from './form.less';

const ReceiveInfo = (props) => {
  const { ds, customizeForm, editFlag = false } = props;

  const receiveInfoColumns = [
    {
      name: 'companyName',
      disabled: true,
    },
    {
      name: 'organizationName',
      disabled: true,
    },
    {
      name: 'shipToLocationAddress',
      disabled: true,
    },
    {
      name: 'actualReceiverName',
      disabled: true,
    },
    {
      name: 'erpAsnNum',
      disabled: true,
    },
    {
      name: 'contactInfo',
      disabled: true,
    },
  ];

  return (
    <Fragment>
      <Spin dataSet={ds}>
        <Content className={styles.info}>
          <div className={styles.title}>
            <h3 className={styles['override-h3']} id="purchaser-delivery-receiveInfo">
              {intl.get(`sinv.purchaserDelivery.view.message.title.headerDispatched`).d('收货信息')}
            </h3>
          </div>
          <div className={editFlag ? styles['content-edit'] : styles.content}>
            {customizeForm(
              {
                code: 'SINV.PURCHASER_DELIVERY.DETAIL.HEADERSHIP',
                readOnly: !editFlag,
                __force_record_to_update__: true,
              },
              <Form labelLayout={editFlag ? 'float' : 'vertical'} dataSet={ds} columns={3}>
                {receiveInfoColumns.map((res) =>
                  editFlag ? <TextField {...res} /> : <Output {...res} />
                )}
              </Form>
            )}
          </div>
        </Content>
      </Spin>
    </Fragment>
  );
};

export default ReceiveInfo;
