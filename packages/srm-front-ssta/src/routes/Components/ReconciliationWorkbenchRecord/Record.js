/* eslint-disable global-require */
import React, { Component } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { Icon, Timeline, Spin, Tooltip } from 'choerodon-ui';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { dateTimeRender } from 'utils/renderer';
import FilterBar from '_components/FilterBarTable/FilterBar';
import ExcelExportPro from 'components/ExcelExportPro';

import { operationDS } from '../../pubDS/operationDS';
import style from './index.less';

const tenantId = getCurrentOrganizationId();
const OPERATE_STATUS = {
  NEW: {
    icon: 'add',
    // text: '新建了',
  },
  SUBMIT: {
    icon: 'check',
    // text: '提交了',
  },
  REVOKE: {
    icon: 'authorize',
    // text:'审批流程-撤销/终止'
  },
  APPROVE: {
    icon: 'authorize',
    // text:'审批流程-通过'
  },
  REJECT: {
    icon: 'authorize',
    // text:'审批流程-拒绝'
  },
  EC_CONFIRM: {
    icon: 'check_circle',
    // text: '"电商已确认",
  },
  RETURNED: {
    icon: 'reply',
    // text:'已退回'
  },
  RETURN: {
    icon: 'authorize',
    // text:'退回'
  },
  REVERSED: {
    icon: 'near_me-o',
    // text:'已冲销'
  },
  COMPLETED: {
    icon: 'near_me-o',
    // text:'已完成'
  },
  CANCEL: {
    icon: 'authorize',
    // text:'取消'
  },
  CONFIRM: {
    icon: 'authorize',
    // text:'确认'
  },
  CANCELING: {
    icon: 'cancel',
    // text:'取消中'
  },
  WAIT_EXTERNAL_SYSTEM_APPROVING: {
    icon: 'authorize',
    // text:'等待外部系统审批'
  },
  RECALL: {
    icon: 'reply',
    // text:'撤回'
  },
  EC_CONFIRM_FAIL: {
    icon: 'near_me-o',
    // text:'电商确认失败'
  },
  SYNC: {
    icon: 'near_me-o',
    // text:'同步'
  },
  DOC_FORWARD: {
    icon: 'call_missed_outgoing',
    // text:'单据转交'
  },
  EXTERNAL_RETURN: {
    icon: 'authorize',
  },
  EXTERNAL_CONFIRM: {
    icon: 'authorize',
  },
  SIGN: {
    icon: 'authorize',
  },
  SIGN_REJECT: {
    icon: 'authorize',
  },
  DIRECT_CANCEL: {
    icon: 'cancel',
  },
};
const { Item } = Timeline;
export default class Record extends Component {
  constructor(props) {
    super(props);
    this.state = {
      operateData: [],
    };
    /**
     * 操作记录 DataSet
     */
    this.operationDs = new DataSet(
      operationDS({
        url: `/ssta/v1/${tenantId}/bill-actions/`,
        pk: 'billHeaderId',
        urlPramas: true,
        lookupCode: 'SSTA.BILL_ACTION_STATUS',
        isFilter: this.props.isFilter,
        lovPara: { billHeaderId: this.props.billHeaderId },
      })
    );
  }

  handleNoData = () => {
    return (
      <div className="nodata_wrapper">
        <span>{intl.get('ssta.costSheet.model.noData').d('暂无数据')}</span>
      </div>
    );
  };

  componentDidMount() {
    this.init();
  }

  componentDidUpdate(prevProps) {
    const { tabKey } = this.props;
    if (tabKey !== prevProps.tabKey) {
      this.updateFooterBtn();
    }
  }

  updateFooterBtn = () => {
    const { modal, billHeaderId, isFilter } = this.props;
    if (modal && isFilter) {
      const params = this.operationDs?.queryDataSet?.current?.toData();
      modal.update({
        footer: (okBtn) => [
          okBtn,
          <ExcelExportPro
            buttonText={intl.get('hzero.common.button.export').d('导出')}
            templateCode="SRM_C_SSTA_BILL_ACTION_EXPORT" // 导出模板编码
            exportAsync
            otherButtonProps={{
              type: 'c7n-pro',
            }}
            requestUrl={`/ssta/v1/${getCurrentOrganizationId()}/bill-actions/bill/action/export`}
            queryParams={{
              ...params,
              billHeaderId,
            }}
            allBody
            method="POST"
          />,
        ],
      });
    }
  };

  init = async (fields) => {
    const { billHeaderId } = this.props;
    const params = fields?.params || {};
    // eslint-disable-next-line no-unused-expressions
    this.operationDs?.queryDataSet?.current?.reset();
    // eslint-disable-next-line no-unused-expressions
    this.operationDs?.queryDataSet?.current?.set(params);
    this.operationDs.setQueryParameter('billHeaderId', billHeaderId);
    this.updateFooterBtn();
    const res = getResponse(await this.operationDs.query());
    this.setState({
      loading: true,
    });
    if (res && !res.failed && res.content) {
      this.setState({
        operateData: res.content,
        loading: false,
      });
    }
  };

  formatRemark = (t) => {
    if (t.processRemark && t.processStatus !== 'SYNC') {
      return (
        <div className="reamks-new">
          <span className="operator gray">{t.processUser}</span>
          <span className="status gray">{intl.get('ssta.costSheet.model.added').d('添加了')}</span>
          <span className="result gray">{t.processRemark}</span>
        </div>
      );
    }
    return null;
  };

  /*
   * 操作记录
   */
  getColumns = () => {
    const columns = [
      {
        name: 'processUser',
        width: 170,
      },
      {
        name: 'processDate',
        width: 170,
      },
      {
        name: 'processStatusMeaning',
        width: 250,
      },
      {
        name: 'processRemark',
        width: 170,
      },
    ];
    return columns;
  };

  render() {
    const { operateData, loading } = this.state;
    const { goWorkFlow, isFilter } = this.props;
    return (
      <Spin spinning={loading}>
        <div className={style.operating}>
          {isFilter && (<FilterBar dataSet={[this.operationDs]} onQuery={this.init} autoQuery={false} expandable={false} />)}
          <Timeline className="operating-timeline">
            {operateData?.length > 0 &&
              operateData.map((t) => {
                const item = OPERATE_STATUS[t.processStatus] || { icon: 'authorize' };
                if (item) {
                  if (
                    ['APPROVE', 'REVOKE', 'REJECT', 'EXTERNAL_RETURN', 'EXTERNAL_CONFIRM'].includes(
                      t.processStatus
                    )
                  ) {
                    const isApprove =
                      t.processStatus === 'APPROVE' || t.processStatus === 'EXTERNAL_CONFIRM';
                    return (
                      <Item color={isApprove ? '#47B881' : '#F56349'}>
                        <Icon type={item.icon} className="small-icon" />
                        <a
                          onClick={goWorkFlow}
                          style={{
                            color: isApprove ? '#47B881' : '#F56349',
                            marginLeft: '0.06rem',
                            fontWeight: 500,
                          }}
                        >
                          {t.processStatusMeaning}
                        </a>
                        {this.formatRemark(t)}
                        <div className="date gray">{dateTimeRender(t.processDate)}</div>
                        <div className="line" />
                      </Item>
                    );
                  }
                  if (['RETURN', 'CONFIRM', 'CANCEL'].includes(t.processStatus)) {
                    return (
                      <Item color={item.color || '#E5E5E5'}>
                        <Icon type={item.icon} className="small-icon" />
                        <Tooltip placement="topLeft" title={t.tenantName}>
                          <span className="operator">{t.processUser}</span>
                        </Tooltip>
                        {t.camp === 'supplier' && (
                          <span className="supply">
                            {intl.get('ssta.costSheet.model.supplier').d('供')}
                          </span>
                        )}
                        <span className="status gray">
                          {intl.get('ssta.costSheet.view.message.approve').d('最终审批了')}
                        </span>
                        <span className="result expenseSheets">
                          【{intl.get('ssta.costSheet.model.accountStatement').d('对账单')}】 ，
                          <span className="gray">
                            {intl.get('ssta.costSheet.model.approvedResult').d('审批结果为')}：
                          </span>
                          <span className={t.processStatus === 'CONFIRM' ? 'completed' : 'orange'}>
                            【{t.processStatusMeaning}】
                          </span>
                        </span>
                        {this.formatRemark(t)}
                        <div className="date gray">{dateTimeRender(t.processDate)}</div>
                        <div className="line" />
                      </Item>
                    );
                  }
                  return (
                    <Item color={item.color || '#E5E5E5'}>
                      <Icon type={item.icon} className="small-icon" />
                      <Tooltip placement="topLeft" title={t.tenantName}>
                        <span className="operator">{t.processUser}</span>
                      </Tooltip>
                      {t.camp === 'supplier' && (
                        <span className="supply">
                          {intl.get('ssta.costSheet.model.supplier').d('供')}
                        </span>
                      )}
                      <span className="status gray">
                        {intl
                          .get('ssta.common.view.message.alreadyOperated', {
                            operationName: t.processStatusMeaning,
                          })
                          .d('{operationName}了')}
                      </span>
                      <span className="result accountStatement">
                        【{intl.get('ssta.costSheet.model.accountStatement').d('对账单')}】
                      </span>
                      {this.formatRemark(t)}
                      <div className="date gray">{dateTimeRender(t.processDate)}</div>
                      <div className="line" />
                    </Item>
                  );
                } else {
                  return null;
                }
              })}
            {!operateData?.length && this.handleNoData()}
          </Timeline>
        </div>
      </Spin>
    );
  }
}
