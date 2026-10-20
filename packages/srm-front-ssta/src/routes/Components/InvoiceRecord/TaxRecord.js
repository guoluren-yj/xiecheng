import React, { Component } from 'react';
import { Icon, Timeline, Spin, Tooltip } from 'choerodon-ui';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { dateTimeRender } from 'utils/renderer';
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
    const { operationDs, taxCtrlLineId, taxCtrlHeaderId } = this.props;
    operationDs.setQueryParameter('taxCtrlHeaderId', taxCtrlHeaderId);
    operationDs.setQueryParameter('size', 0);
    if (taxCtrlLineId) {
      operationDs.setQueryParameter('taxCtrlLineId', taxCtrlLineId);
      operationDs.setQueryParameter('functionType', 'inventory_invoice');
    } else {
      operationDs.setQueryParameter('taxCtrlLineId', undefined);
      operationDs.setQueryParameter('functionType', 'tax_ctrl');
    }
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

  getIcon(processStatus) {
    let icon = 'check';
    if (processStatus === 'success') {
      icon = 'check';
    } else {
      icon = 'cancel';
    }
    return icon;
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
                    <Icon type={this.getIcon(t.processStatus)} />
                    <Tooltip placement="topLeft" title={t.processUserName}>
                      <span className="operator result-content">{t.processUserName}</span>
                    </Tooltip>
                    <span className='result-info' style={{ paddingLeft: '12px' }}>{intl.get('ssta.taxControl.view.title.hasUpdate').d('更新了')}</span>
                    <span className="result-content result" style={{ paddingLeft: '12px' }}>
                      【{t.functionTypeMeaning}】
                    </span>
                    <span className={`result ${t.processStatus === 'success' ? 'success' : 'orange'}`} style={{ paddingLeft: '12px' }}>
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
