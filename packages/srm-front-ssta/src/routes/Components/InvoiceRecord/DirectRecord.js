import React, { Component } from 'react';
import { Icon, Timeline, Spin, Tooltip } from 'choerodon-ui';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { dateTimeRender } from 'utils/renderer';
import style from './index.less';

const { Item } = Timeline;

const OPERATE_STATUS = {
  NEW: 'add',
  SUBMIT: 'check',
  REVOKE: 'near_me-o',
  APPROVE: 'check',
  REJECT: 'person_pin_circle',
  EC_CONFIRM: 'check_circle',
  RETURNED: 'reply',
  RETURN: 'reply',
  REVERSED: 'near_me-o',
  COMPLETED: 'near_me-o',
  CANCEL: 'cancel',
  CONFIRM: 'check',
  CANCELING: 'cancel',
  WAIT_EXTERNAL_SYSTEM_APPROVING: 'authorize',
  RECALL: 'reply',
  EC_CONFIRM_FAIL: 'near_me-o',
  SYNC: 'near_me-o',
  DOC_FORWARD: 'call_missed_outgoing',
  UPDATE: 'sync',
};
export default class OperationApprove extends Component {
  constructor(props) {
    super(props);
    this.state = {
      operateData: [],
    };
  }

  handleNoData = () => {
    return (
      <div className="nodata_wrapper">
        <span>{intl.get('hzero.common.components.noticeIcon.null').d('暂无数据')}</span>
      </div>
    );
  };

  async componentDidMount() {
    const { operationDs, commodityId, mappingId, recordFlag } = this.props;
    operationDs.setQueryParameter('size', 0);
    if (recordFlag) {
      operationDs.setQueryParameter('commodityId', commodityId);
    } else {
      operationDs.setQueryParameter('mappingId', mappingId);
    }
    const res = getResponse(await operationDs.query());
    this.setState({
      loading: true,
    });
    if (res && !res.failed && res.content) {
      this.setState({
        operateData: res.content,
      });
    }
    this.setState({
      loading: false,
    });
  }

  getIcon(processStatus) {
    return OPERATE_STATUS[processStatus];
  }

  /**
   * render
   */
  render() {
    const { operateData, loading } = this.state;
    return (
      <Spin spinning={loading}>
        <div className={style.operating}>
          <Timeline className="operating-timeline">
            {operateData?.length > 0 &&
              operateData.map((t) => {
                return (
                  <Item color="#E5E5E5">
                    <Icon type={this.getIcon(t.processStatus)} className="small-icon" />
                    <Tooltip placement="topLeft" title={t.processUser}>
                      <span className="operator result-content">{t.processUser}</span>
                    </Tooltip>
                    {/* <span className='result-info' style={{ paddingLeft: '12px' }}>{t.processStatusMeaning}</span> */}
                    <span className="result-content" style={{ paddingLeft: '12px' }}>
                      {t.processStatusMeaning}
                    </span>
                    {/* <span className={`result ${t.processStatus === 'success' ? 'success' : 'orange'}`} style={{ paddingLeft: '12px' }}>
                      {t.processStatusMeaning}
                    </span> */}
                    {t.processRemark && (
                      <div className="reamks">
                        <div className="status gray">
                          {intl
                            .get('hzero.common.components.operationAudit.operationRemark')
                            .d('操作说明')}
                          :
                        </div>
                        <div>
                          <div className="result comment">{t.processRemark}</div>
                        </div>
                      </div>
                    )}
                    <div className="date gray">{dateTimeRender(t.processDate)}</div>
                    <div className="line" />
                  </Item>
                );
              })}
            {!operateData?.length && this.handleNoData()}
          </Timeline>
        </div>
      </Spin>
    );
  }
}
