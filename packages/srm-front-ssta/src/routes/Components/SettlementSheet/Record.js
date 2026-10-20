/* eslint-disable global-require */
import React, { Component } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { Icon, Timeline, Spin, Tooltip } from 'choerodon-ui';
import intl from 'utils/intl';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import FilterBar from '_components/FilterBarTable/FilterBar';
import ExcelExportPro from 'components/ExcelExportPro';
import { dateTimeRender } from 'utils/renderer';
import { recordDS as recordDs } from '@/stores/PurchaseSettleDS';
import style from './index.less';

const OPERATE_STATUS = {
  NEW: {
    icon: 'add',
    // text: '新建了',
  },
  SUBMIT: {
    icon: 'check',
    // text: '提交了',
  },
  RETURN: {
    icon: 'authorize',
    // text:'退回'
  },
  CANCEL: {
    icon: 'authorize',
    // text:'取消'
  },
  EC_INVOICING: {
    icon: 'near_me-o',
    // text:'电商开票中'
  },
  EC_INVOICE_SUCCESS: {
    icon: 'near_me-o',
    // text:'电商开票成功'
  },

  EC_INVOICE_FAIL: {
    icon: 'cancel',
    // text:'电商开票失败'
  },
  SYNCHRONIZING: {
    icon: 'near_me-o',
    // text:'同步'
  },
  CANCELING: {
    icon: 'cancel',
    // text:'取消中'
  },
  CONFIRM: {
    icon: 'authorize',
    // text:'确认'
  },
  REVOKE: {
    icon: 'authorize',
    // text:'审批流程-撤销'
  },
  APPROVE: {
    icon: 'authorize',
    // text:'审批流程-通过'
  },
  REJECT: {
    icon: 'authorize',
    // text:'	审批流程-拒绝'
  },
  WITHOUT_SYNC: {
    icon: 'person_pin_circle',
    // text:'	无需同步'
  },
  UNSYNCHRONIZED: {
    icon: 'authorize',
    // text:'未同步'
  },
  SYNC_FAILURE: {
    icon: 'authorize',
    // text:'同步失败'
  },
  SYNC_SUCCESS: {
    icon: 'authorize',
    // text:'同步成功'
  },
  ERP_RETURN: {
    icon: 'reply',
    // text:'退回'
  },
  ERP_CANCELING: {
    icon: 'reply',
    // text:'取消中'
  },
  ERP_CANCEL_FAILURE: {
    icon: 'reply',
    // text:'	取消失败'
  },
  ERP_CANCEL_SUCCESS: {
    icon: 'check_circle',
    // text:'	取消成功'
  },
  RECALL: {
    icon: 'reply',
    // text:'	撤回'
  },
  WAIT_SUPPLIER_CONFIRM: {
    icon: 'authorize',
    // text:'	等待供应商确认'
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
  }

  recordDS = new DataSet(
    recordDs({
      lookupCode: 'SSTA.SETTLE_HEADER_ACTION_STATUS',
      lovPara: { settleHeaderId: this.props.settleHeaderId },
      isFilter: this.props.isFilter,
    })
  );

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
    const { modal, isFilter, settleHeaderId } = this.props;
    if (modal && isFilter) {
      const params = this.recordDS?.queryDataSet?.current?.toData();
      modal.update({
        footer: (okBtn) => [
          okBtn,
          <ExcelExportPro
            buttonText={intl.get('hzero.common.button.export').d('导出')}
            templateCode="SRM_C_SSTA_SETTLE_HEADER_ACTION_EXPORT" // 导出模板编码
            exportAsync
            otherButtonProps={{
              type: 'c7n-pro',
            }}
            requestUrl={`/ssta/v1/${getCurrentOrganizationId()}/settle-header-actions/settle/action/export`}
            queryParams={{
              ...params,
              settleHeaderId,
            }}
            allBody
            method="POST"
          />,
        ],
      });
    }
  };

  init = async (fields) => {
    const { settleHeaderId } = this.props;
    this.recordDS.setQueryParameter('settleHeaderId', settleHeaderId);
    const params = fields?.params || {};
    // eslint-disable-next-line no-unused-expressions
    this.recordDS?.queryDataSet?.current?.reset();
    // eslint-disable-next-line no-unused-expressions
    this.recordDS?.queryDataSet?.current?.set(params);
    const res = getResponse(await this.recordDS.query());
    this.setState({
      loading: true,
    });
    if (res && !res.failed && res.content) {
      this.setState({
        operateData: res.content.reverse(),
        loading: false,
      });
    }
    this.updateFooterBtn();
  };

  formatRemark = (t) => {
    if (t.processRemark && t.processStatus !== 'SYNCHRONIZING') {
      return (
        <div className="reamks-new">
          <span className="operator gray">{t.processUser}</span>
          <span className="status gray">{intl.get('ssta.costSheet.model.added').d('添加了')}</span>
          <span className="result comment gray">{t.processRemark}</span>
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
          {isFilter && (
            <FilterBar
              dataSet={[this.recordDS]}
              onQuery={this.init}
              autoQuery={false}
              expandable={false}
            />
          )}
          <Timeline className="operating-timeline">
            {operateData?.length > 0 &&
              operateData.map((t) => {
                const item = OPERATE_STATUS[t.processStatus] || { icon: 'authorize' };
                if (['EC_INVOICE_FAIL'].includes(t.processStatus)) {
                  const reason = t.processRemark;
                  return (
                    <Item color={item.color || '#E5E5E5'}>
                      <div className="detail-flex">
                        <Icon type={item.icon} className="small-icon" />
                        <div className="flex-1">
                          <span className="operator">
                            {intl.get('ssta.costSheet.view.message.theThirdEcer').d('第三方电商')}
                          </span>
                          <span className="status gray">
                            {intl.get('ssta.costSheet.view.message.invoiceFail').d('开票失败了')}
                          </span>
                          <span className="result expenseSheets">
                            【{intl.get('ssta.costSheet.model.settlementSheet').d('结算单')}】
                          </span>
                        </div>
                      </div>
                      {reason && (
                        <div className="reamks">
                          <div style={{ marginLeft: '6px' }} className="result comment gray">
                            {intl
                              .get(`ssta.costSheet.view.message.faileReason`, { reason })
                              .d(`失败原因是{reason}`)}
                          </div>
                        </div>
                      )}
                      <div className="date-time gray">{dateTimeRender(t.processDate)}</div>
                      <div className="line" />
                    </Item>
                  );
                }
                if (
                  ['APPROVE', 'REVOKE', 'REJECT', 'EXTERNAL_RETURN', 'EXTERNAL_CONFIRM'].includes(
                    t.processStatus
                  )
                ) {
                  const isApprove =
                    t.processStatus === 'APPROVE' || t.processStatus === 'EXTERNAL_CONFIRM';
                  return (
                    <Item color={isApprove ? '#47B881' : '#F56349'}>
                      <div className="detail-flex">
                        <Icon type={item.icon} className="small-icon" />
                        <div className="flex-1">
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
                        </div>
                      </div>
                      {this.formatRemark(t)}
                      <div className="date-time gray">{dateTimeRender(t.processDate)}</div>
                      <div className="line" />
                    </Item>
                  );
                }
                if (['RETURN', 'CONFIRM', 'CANCEL'].includes(t.processStatus)) {
                  return (
                    <Item color={item.color || '#E5E5E5'}>
                      <div className="detail-flex">
                        <Icon type={item.icon} className="small-icon" />
                        <div className="flex-1">
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
                            【{intl.get('ssta.costSheet.model.settlementSheet').d('结算单')}】 ，
                            <span className="gray">
                              {intl.get('ssta.costSheet.model.approvedResult').d('审批结果为')}：
                            </span>
                            <span
                              className={t.processStatus === 'CONFIRM' ? 'completed' : 'orange'}
                            >
                              【{t.processStatusMeaning}】
                            </span>
                          </span>
                        </div>
                      </div>
                      {this.formatRemark(t)}
                      <div className="date-time gray">{dateTimeRender(t.processDate)}</div>
                      <div className="line" />
                    </Item>
                  );
                }
                return (
                  <Item color={item.color || '#E5E5E5'}>
                    <div className="detail-flex">
                      <Icon type={item.icon} className="small-icon" />
                      <div className="flex-1">
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
                        <span className="result settlementSheet">
                          【{intl.get('ssta.costSheet.model.settlementSheet').d('结算单')}】
                        </span>
                      </div>
                    </div>
                    {this.formatRemark(t)}
                    <div className="date-time gray">{dateTimeRender(t.processDate)}</div>
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
