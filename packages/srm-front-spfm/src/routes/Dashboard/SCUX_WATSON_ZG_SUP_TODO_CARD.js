import React from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { Row, Col } from 'choerodon-ui';
import { withRouter, Link } from 'dva/router';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_ADAPTOR } from '_utils/config';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';

import styles from './Cards.less';

const prefix = `spfm.dashboard`;
const organizationId = getCurrentOrganizationId();

@formatterCollections({ code: ['spfm.dashboard', 'hwfm.common'] })
@withRouter
export default class ClosedLoopManagementSupplier extends React.Component {
  formDataDs = new DataSet({
    autoQuery: false,
    autoCreate: true,
    fields: [
      {
        name: 'todoNum',
        type: 'number',
      },
      {
        name: 'rejectNum',
        type: 'number',
      },
    ],

    transport: {
      read: {
        url: `${SRM_ADAPTOR}/v1/${organizationId}/marmot-api/uJnl76kZ7qFicBcmt9z73r2es2Xb2d8e15icYB6e5K0Bk?supplierTenantId=1`,
        method: 'GET',
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
          <div className={styles['card-img']}>
            <span className={styles['card-title']}>
              {intl.get(`${prefix}.view.message.closedLoopManagementSupplier`).d('整改管理')}
            </span>
          </div>
          <Row className={styles['card-content']}>
            <Col span={20}>
              <Link
                to="/scux/closed-loop-management-supplier/list"
                className={styles['card-entry']}
              >
                {intl.get(`${prefix}.model.todo`).d('待整改单据')}
              </Link>
            </Col>
            <Col span={4} className={styles['card-number']}>
              {formData.todoNum}
            </Col>
          </Row>
          <Row className={styles['card-content']}>
            <Col span={20}>
              <Link
                to="/scux/closed-loop-management-supplier/list"
                className={styles['card-entry']}
              >
                {intl.get(`${prefix}.model.reject`).d('审批拒绝')}
              </Link>
            </Col>
            <Col span={4} className={styles['card-number']}>
              {formData.rejectNum}
            </Col>
          </Row>
        </Row>
      </div>
    );
  }
}
