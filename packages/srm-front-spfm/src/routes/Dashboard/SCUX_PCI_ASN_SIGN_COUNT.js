import React from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { Row, Col } from 'choerodon-ui';
import { withRouter, Link } from 'dva/router';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_CUSTOMIZATION, SRM_PLATFORM } from '_utils/config';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { isArray } from 'lodash';

import styles from './Cards.less';

const prefix = `spfm.dashboard`;
const organizationId = getCurrentOrganizationId();

@formatterCollections({ code: ['spfm.dashboard', 'hwfm.common'] })
@withRouter
export default class PciAsnSignCount extends React.Component {
  formDataDs = new DataSet({
    autoQuery: false,
    autoCreate: true,
    fields: [
      {
        name: 'pciAsnSignReceiving',
        type: 'number',
      },
      {
        name: 'pciAsnSignReject',
        type: 'number',
      },
      {
        name: 'pciAsnSignPass',
        type: 'number',
      },
      {
        name: 'pciAsnSignSubmit',
        type: 'number',
      },
      {
        name: 'pciAsnSignNew',
        type: 'number',
      },
    ],

    transport: {
      read: {
        url: `${SRM_CUSTOMIZATION}/v1/${organizationId}/pci-asn-sign-dash-board-card/dashboard-clause`,
        method: 'GET',
      },
    },
  });

  // 送货单数据
  deliveryDs = new DataSet({
    fields: [
      { name: 'menuCode', type: 'string' },
      { name: 'clauseCode', type: 'string' },
      { name: 'clauseName', type: 'string' },
      { name: 'docCount', type: 'string' },
    ],
    transport: {
      read: {
        url: `${SRM_PLATFORM}/v1/${organizationId}/dashboard_clause`,
        method: 'GET',
      },
    },
  })

  state = {
    formData: {},
    deliveryData: [],
  };

  componentDidMount() {
    this.formDataDs.query().then((res) => {
      this.setState({ formData: res });
    });
    this.deliveryDs.setQueryParameter('type', 'SupplierChangeCustomer');
    this.deliveryDs.setQueryParameter('code', 'SRM_Delivery');
    this.deliveryDs.query().then(res => {
      if (res && isArray(res)) {
        const deliveryList = res.filter(item => item.isShow === 0);
        this.setState({ deliveryData: deliveryList });
      }
    });
  }

  render() {
    const { formData } = this.state;
    return (
      <div className={styles.delivery}>
        <Row className={styles['card-row']}>
          <div className={styles['card-img']}>
            <span className={styles['card-title']}>
              {intl.get(`${prefix}.view.message.receiptSignature`).d('收货签收')}
            </span>
          </div>
          {formData.purTag !== 1 && (
            <Row className={styles['card-content']}>
              <Col span={20}>
                <Link
                  to={`/scux/receipt/list?tabKey=received&status=${
                    name === 'pciAsnSignSubmit' ? 'SUBMIT' : 'REJECT'
                  }`}
                  className={styles['card-entry']}
                >
                  {intl.get(`${prefix}.model.pciAsnSignReceiving`).d('待收货')}
                </Link>
              </Col>
              <Col span={4} className={styles['card-number']}>
                {formData.pciAsnSignReceiving}
              </Col>
            </Row>
          )}
          {formData.purTag !== 1 && (
            <Row className={styles['card-content']}>
              <Col span={20}>
                <Link
                  to="/scux/receipt/list?tabKey=myReceipt&status=REJECT"
                  className={styles['card-entry']}
                >
                  {intl.get(`${prefix}.model.pciAsnSignReject`).d('收货审批拒绝')}
                </Link>
              </Col>
              <Col span={4} className={styles['card-number']}>
                {formData.pciAsnSignReject}
              </Col>
            </Row>
          )}
          {formData.purTag !== 1 && (
            <Row className={styles['card-content']}>
              <Col span={20}>
                <Link
                  to="/scux/receipt/list?tabKey=myReceipt&status=SUBMIT"
                  className={styles['card-entry']}
                >
                  {intl.get(`${prefix}.model.pciAsnSignSubmit`).d('审批中签收单')}
                </Link>
              </Col>
              <Col span={4} className={styles['card-number']}>
                {formData.pciAsnSignSubmit}
              </Col>
            </Row>
          )}
          {formData.purTag === 1 && (
            <Row className={styles['card-content']}>
              <Col span={20}>
                <Link
                  to="/scux/receipt-supplier/list?tabKey=myReceipt&status=APPROVED&statusERP=S"
                  className={styles['card-entry']}
                >
                  {intl.get(`${prefix}.model.pciAsnSignPass`).d('待归档签收单')}
                </Link>
              </Col>
              <Col span={4} className={styles['card-number']}>
                {formData.pciAsnSignPass}
              </Col>
            </Row>
          )}
          <Row className={styles['card-content']}>
            <Col span={20}>
              <Link
                to={formData.purTag === 1 ? "/scux/receipt/list?tabKey=waitSubmit" : "/scux/receipt-supplier/list?tabKey=waitSubmit"}
                className={styles['card-entry']}
              >
                {intl.get(`${prefix}.model.pciAsnSignNew`).d('新建的收货单')}
              </Link>
            </Col>
            <Col span={4} className={styles['card-number']}>
              {formData.pciAsnSignNew}
            </Col>
          </Row>
          {
            this.state.deliveryData.map(item => (
              <Row className={styles['card-content']} key={`members-item-${item.clauseId}`}>
                <Col span={20}>
                  <Link
                    to={`${item.menuCode}${
                      item.clauseCode === 'SPFM.DELIVERY_MAINTENANCE' ? '/?deliveryOrder' : ''
                    }`}
                    className={styles['card-entry']}
                  >
                    {item.clauseName}
                  </Link>
                </Col>
                <Col span={4} className={styles['card-number']}>
                  {item.docCount}
                </Col>
              </Row>
            ))
          }
        </Row>
      </div>
    );
  }
}
