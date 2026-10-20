/**
 * CustomerManagement -客户管理
 * @date: 2019-02-26
 * @author YKK <kaikai.yang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { Row, Col, Card } from 'hzero-ui';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import notification from 'utils/notification';

import styles from './Cards.less';

@connect(({ srmCards, loading }) => ({
  srmCards,
  addLoading: loading.effects['srmCards/addPurchases'],
}))
@formatterCollections({ code: ['spfm.dashboard'] })
export default class CustomerManagement extends React.Component {
  componentDidMount() {
    this.handleSearch();
  }

  /**
   * 查询客户管理
   */
  @Bind()
  handleSearch() {
    const { dispatch } = this.props;
    dispatch({
      type: 'srmCards/querySupplierReportList',
      payload: {
        type: 'Supplier',
        code: 'SRM_SupplierReport',
      },
    }).then((res) => {
      if (res) {
        dispatch({
          type: 'srmCards/updateState',
          payload: { supplierReportLoading: false },
        });
      }
    });
  }

  @Bind()
  handleLinkClick(link) {
    const { dispatch } = this.props;
    dispatch({
      type: 'srmCards/querySupplierReportLink',
      payload: {
        link,
      },
    }).then((res) => {
      if (res) {
        try {
          const response = JSON.parse(res);
          if (response.failed) {
            notification.warning({ message: response.message || response.code });
          }
        } catch (error) {
          window.open(res, '_blank', 'noopener');
        }
      }
    });
  }

  render() {
    const { name, srmCards: { supplierReportLoading, supplierReportList = [] } = {} } = this.props;
    return (
      <div className={styles.supplierManagement}>
        <Row className={styles['card-row']}>
          <div className={styles['card-img']}>
            <span className={styles['card-title']}>
              {name || intl.get(`spfm.dashboard.view.title.supplierReport`).d('供应商报表')}
            </span>
          </div>
          {supplierReportLoading === true ? (
            <Card
              loading={supplierReportLoading}
              bordered={false}
              bodyStyle={{ padding: '0 20px' }}
            />
          ) : (
            supplierReportList.map((item) => (
              <Row className={styles['card-content']} key={`members-item-${item.clauseId}`}>
                <Col span={24}>
                  <a
                    className={styles['card-entry']}
                    onClick={(e) => {
                      e.preventDefault();
                      this.handleLinkClick(item.linkAddress);
                    }}
                  >
                    {item.description}
                  </a>
                </Col>
              </Row>
            ))
          )}
        </Row>
      </div>
    );
  }
}
