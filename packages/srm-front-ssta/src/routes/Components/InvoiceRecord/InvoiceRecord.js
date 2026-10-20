import React, { Component } from 'react';
import { Icon, Timeline, Spin, Tooltip } from 'choerodon-ui';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import style from './index.less';

const { Item } = Timeline;

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
    const { operationDs, ruleNum } = this.props;
    operationDs.setQueryParameter('ruleNum', ruleNum);
    operationDs.setQueryParameter('size', 0);
    const res = getResponse(await operationDs.query());
    this.setState({
      loading: true,
    });
    if (res && !res.failed && res.content) {
      this.setState({
        operateData: res.content,
        loading: false,
      });
    }
  }

  getIcon() {
    const icon = 'flag-o';
    return icon;
  }

  /**
   * render
   */
  render() {
    const { operateData, loading } = this.state;
    const { checkHistoryVersion } = this.props;
    return (
      <Spin spinning={loading}>
        <div className={style.operating}>
          <Timeline className="operating-timeline">
            {operateData?.length > 0 &&
              operateData.map((t) => {
                return (
                  <Item color="#E5E5E5">
                    <Icon type={this.getIcon(t.processStatus)} />
                    <Tooltip placement="topLeft" title={t.createdBy}>
                      <span className="operator result-content">
                        {t.updateUserName || t.createUserName}
                      </span>
                    </Tooltip>
                    <span className="result-info" style={{ paddingLeft: '12px' }}>
                      {intl.get('ssta.invoiceRule.model.invoiceRule.publish').d('发布了')}
                    </span>
                    <span className="result-content result" style={{ paddingLeft: '12px' }}>
                      【{intl.get('ssta.invoiceRule.model.invoiceRule.version').d('开票规则版本')}{' '}
                      {t.versionNumber}】
                    </span>
                    <a
                      onClick={() => {
                        checkHistoryVersion(t);
                      }}
                    >
                      {intl.get('hzero.common.status.detail').d('查看详情')}
                    </a>
                    <div className="date gray">{t.creationDate}</div>
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
