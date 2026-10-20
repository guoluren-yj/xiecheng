import React from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { Row, Col, Icon } from 'choerodon-ui';
import { withRouter, Link } from 'dva/router';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_CUSTOMIZATION } from '_utils/config';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';

import styles from './Cards.less';

const prefix = `spfm.dashboard`;
const organizationId = getCurrentOrganizationId();

@formatterCollections({ code: ['spfm.dashboard', 'hwfm.common'] })
@withRouter
export default class PciAsnCheckCount extends React.Component {
  formDataDs = new DataSet({
    autoQuery: false,
    autoCreate: true,
    fields: [
      {
        name: 'pciAsnCheckWaitAssign',
        type: 'number',
      },
      {
        name: 'pciAsnCheckWaitCheck',
        type: 'number',
      },
    ],

    transport: {
      read: {
        url: `${SRM_CUSTOMIZATION}/v1/${organizationId}/pci-asn-check-dash-board-card/dashboard-clause`,
        method: 'GET',
        params: { purTag: 1 },
      },
    },
  });

  state = {
    formData: {},
  };

  componentDidMount() {
    this.formDataDs.query().then((res) => {
      this.setState({ formData: res });
    });
  }

  render() {
    const { formData } = this.state;
    return (
      <div className={styles.delivery}>
        <Row className={styles['card-row']}>
          <Icon type="test" style={{ padding: '12px 8px 10px 12px', color: '#6d7a80' }} />
          <span
            className={styles['card-title']}
            style={{ paddingLeft: '0px', position: 'relative', top: '3px' }}
          >
            {intl.get(`${prefix}.view.message.qualityTesting`).d('质检')}
          </span>
          <Row className={styles['card-content']}>
            <Col span={20}>
              <Link to="/scux/InspectionSheet" className={styles['card-entry']}>
                {intl.get(`${prefix}.model.pciAsnCheckWaitAssign`).d('待质检分配')}
              </Link>
            </Col>
            <Col span={4} className={styles['card-number']}>
              {formData.pciAsnCheckWaitAssign}
            </Col>
          </Row>
          <Row className={styles['card-content']}>
            <Col span={20}>
              <Link to="/scux/DeliverTo" className={styles['card-entry']}>
                {intl.get(`${prefix}.model.pciAsnCheckWaitCheck`).d('待质检')}
              </Link>
            </Col>
            <Col span={4} className={styles['card-number']}>
              {formData.pciAsnCheckWaitCheck}
            </Col>
          </Row>
        </Row>
      </div>
    );
  }
}
