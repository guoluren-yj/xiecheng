/* eslint-disable global-require */
import React, { Component } from 'react';
import { Icon, Timeline, Spin, Tooltip } from 'choerodon-ui';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { dateTimeRender } from 'utils/renderer';
import style from './index.less';

const { Item } = Timeline;
export default class Record extends Component {
  constructor(props) {
    super(props);
    this.state = {
      operateData: [],
      loading: false,
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
    const { operationDs } = this.props;
    this.setState({
      loading: true,
    });
    const res = getResponse(await operationDs.query());
    if (res && !res.failed && res.content) {
      this.setState({
        operateData: res.content,
        loading: false,
      });
    }
  }

  getIcon = (processStatus) => (processStatus === 'NEW' ? 'add' : 'autorenew');

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
                    <Icon type={this.getIcon(t.processStatus)} />
                    <Tooltip placement="topLeft" title={t.processUser}>
                      <span className="operator">{t.processUser}</span>
                    </Tooltip>
                    <span className="result" style={{ paddingLeft: '12px' }}>
                      {t.processStatusMeaning}
                    </span>
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
