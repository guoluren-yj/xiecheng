import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { getCurrentOrganizationId } from 'utils/utils';

import PubDetail from '../PubDetail';
import Detail from '../Detail';

@connect(({ audit8D, loading }) => ({
  audit8D,
  loading: loading.effects['audit8D/fetch8D'],
  tenantId: getCurrentOrganizationId(),
}))
export default class Audit8D extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      showPubDetail: false,
    };
  }

  componentDidMount() {
    const { dispatch, tenantId, match } = this.props;
    const { id } = match.params;
    if (id) {
      dispatch({
        type: 'audit8D/fetch8DBasicInfo',
        payload: {
          tenantId,
          problemHeaderId: id,
        },
      }).then(() => {
        const {
          audit8D: {
            basicInfo: { problemStatus },
          },
        } = this.props;
        this.setState({
          showPubDetail: ['PUBLISHED', 'ICA_REJECTED', 'PCA_FEEDBACKING', 'PCA_REJECTED'].includes(
            problemStatus
          ),
        });
      });
    }
  }

  render() {
    const { showPubDetail } = this.state;
    return (
      <React.Fragment>
        {showPubDetail ? <PubDetail {...this.props} /> : <Detail {...this.props} />}
      </React.Fragment>
    );
  }
}
