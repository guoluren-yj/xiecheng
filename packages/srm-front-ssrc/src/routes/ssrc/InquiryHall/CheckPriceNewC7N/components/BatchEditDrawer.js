/**
 * 批量编辑
 */
import React from 'react';
import { Form, NumberField, TextArea, CheckBox } from 'choerodon-ui/pro';
import { noop } from 'lodash';

import intl from 'utils/intl';

import HelpMessageSection from './HelpMessageSection';

import styles from './index.less';

export default function BatchEditDrawer(props) {
  const {
    dataSet,
    customizeForm = noop,
    checkWay,
    bidFlag,
    custLoading,
    dimensionCode,
    doubleUnitFlag,
  } = props;
  const sectionProps = {
    className: styles['help-message-section-wrap'],
    leftIcon: 'help',
    helpMessage: intl
      .get('ssrc.inquiryHall.view.message.partDataEditTips')
      .d('对勾选的数据进行批量编辑'),
  };

  return (
    <div className={styles['batch-edit-drawer-container']}>
      <HelpMessageSection {...sectionProps} />
      {customizeForm(
        {
          code: bidFlag
            ? 'SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.BATCH'
            : 'SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.BATCH',
          dataSet,
        },
        <Form labelLayout="float" dataSet={dataSet} custLoading={custLoading}>
          <CheckBox name="suggestedFlag" />
          {doubleUnitFlag && checkWay === 'quantity' && dimensionCode === 'ITEM' ? (
            <NumberField name="allottedSecondaryQuantity" />
          ) : (
            <NumberField
              name={
                checkWay === 'quantity' && dimensionCode === 'ITEM'
                  ? 'allottedQuantity'
                  : 'allottedRatio'
              }
            />
          )}
          <TextArea name="suggestedRemark" resize="both" />
        </Form>
      )}
    </div>
  );
}
