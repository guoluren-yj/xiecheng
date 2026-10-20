import React from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { Row, Col } from 'choerodon-ui';
import { withRouter } from 'dva/router';
import { getCurrentOrganizationId } from 'utils/utils';
import Upload from 'srm-front-boot/lib/components/Upload';
import { SRM_SCUX_2, PRIVATE_BUCKET } from '_utils/config';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';

import styles from './Cards.less';

const prefix = `spfm.dashboard`;
const organizationId = getCurrentOrganizationId();

@formatterCollections({ code: ['spfm.dashboard', 'hwfm.common'] })
@withRouter
export default class GroupCard extends React.Component {
  tableDataDs = new DataSet({
    autoQuery: false,
    autoCreate: true,
    fields: [],

    transport: {
      read: {
        url: `${SRM_SCUX_2}/v1/${organizationId}/wbjt-group-data-managements/dashboard-clause`,
        method: 'GET',
      },
    },
  });

  state = {
    lineData: [],
  };

  componentDidMount() {
    this.tableDataDs.query().then((res) => {
      this.setState({ lineData: res });
    });
  }

  render() {
    const { lineData } = this.state;
    return (
      <div className={styles.contract}>
        <Row className={styles['card-row']}>
          <div className={styles['card-img']}>
            <span className={styles['card-title']}>
              {intl.get(`${prefix}.view.message.trainingMaterials`).d('培训资料')}
            </span>
          </div>
          {lineData.map((item) => (
            <Row className={styles['card-content']}>
              <Col span={8}>
                <span className={styles['card-entry']}>{item.title}</span>
              </Col>
              <Col span={16} className={styles['card-number']}>
                <Upload
                  bucketName={PRIVATE_BUCKET}
                  bucketDirectory="ssrc-expert-header"
                  attachmentUUID={item.attachmentUrl}
                  viewOnly
                  icon="download"
                />
              </Col>
            </Row>
          ))}
        </Row>
      </div>
    );
  }
}
