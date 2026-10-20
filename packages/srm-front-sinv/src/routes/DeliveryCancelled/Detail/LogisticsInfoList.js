/*
 * LogisticInfoList - 送货单审批详情物流信息
 * @date: 2018-12-05 10:37:28
 * @author: FQL <qilin.feng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Row, Col } from 'hzero-ui';
import intl from 'utils/intl';
import { EDIT_FORM_ROW_LAYOUT, FORM_COL_3_LAYOUT } from 'utils/constants';
import styles from './index.less';
import DisplayFormItem from '../../components/DisplayFormItem';

export default class LogisticInfoList extends PureComponent {
  render() {
    // todo
    // const {
    //   form: { getFieldDecorator },
    //   interfaceLogs: { detail },
    //   fetchLogsDetailLoading,
    // } = this.props;
    const { detailHeaderInfo = {} } = this.props;
    const {
      logisticsCompany,
      logisticsStaff,
      logisticsContactInfo,
      logisticsCost,
      expressNum,
    } = detailHeaderInfo;

    return (
      <div className={styles['detail-logistic']}>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`sinv.common.model.common.logisticsCompany`).d('物流公司')}
              value={logisticsCompany}
            />
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`sinv.common.model.common.logisticsStaff`).d('配送人员')}
              value={logisticsStaff}
            />
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`sinv.common.model.common.logisticsContactInfo`).d('联系方式')}
              value={logisticsContactInfo}
            />
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`sinv.common.model.common.logisticsCost`).d('物流费用')}
              value={logisticsCost}
            />
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`sinv.common.model.common.expressNum`).d('快递单号')}
              value={expressNum}
            />
          </Col>
        </Row>
      </div>
    );
  }
}
