/**
 * 具体审批记录 - 转交/加签 等特殊项
 */
import React from 'react';
import moment from 'moment';

import intl from 'utils/intl';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';

import FormItem from './components/FormItem';

import styles from './index.less';

const CustTaskExtItem = (props) => {
  const { item } = props;

  return (
    <div className={styles['common-record-timeline-wrap']}>
      <h4>{item.actionMeaning}</h4>
      <FormItem label={item.actionMeaning}>{item.comment}</FormItem>
      <FormItem label={intl.get('ssrc.common.model.common.date').d('日期')}>
        {item.endTime && moment(item.endTime).format(DEFAULT_DATETIME_FORMAT)}
      </FormItem>
    </div>
  );
};

export default CustTaskExtItem;
