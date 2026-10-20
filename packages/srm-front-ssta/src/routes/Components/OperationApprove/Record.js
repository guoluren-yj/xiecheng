/* eslint-disable global-require */
import React, { Component, Fragment } from 'react';
import { DataSet, Modal } from 'choerodon-ui/pro';
import { Icon, Timeline, Spin, Tooltip } from 'choerodon-ui';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { dateTimeRender } from 'utils/renderer';
import FilterBar from '_components/FilterBarTable/FilterBar';
import ExcelExportPro from 'components/ExcelExportPro';
import Styles from '@/routes/common.less';
import OrderInfoModal from './OrderInfoModal';
import { operationDS } from '../../pubDS/operationDS';
import style from './index.less';

const tenantId = getCurrentOrganizationId();
const OPERATE_STATUS = {
  NEW: {
    icon: 'add',
    // text: '新建了',
  },
  SUBMITTED: {
    icon: 'check',
    // text: '提交了',
  },
  UPDATE: {
    icon: 'mode_edit',
    // text:'修改'
  },
  SUPPLIER_TO_BE_CONFIRMED: {
    icon: 'authorize',
    // text:'供应商待确认'
  },
  SUBMITTED_FOR_APPROVAL: {
    icon: 'authorize',
    // text:'提交待审批中'
  },
  RETURNED: {
    icon: 'authorize',
    // text:'已退回'
  },
  REVOKE: {
    icon: 'authorize',
    // text:'撤销'
  },
  REVERSED: {
    icon: 'near_me-o',
    // text:'已冲销'
  },
  COMPLETED: {
    icon: 'authorize',
    // text:'已完成'
  },
  CANCEL: {
    icon: 'authorize',
    // text:'已取消'
  },
  DOC_FORWARD: {
    icon: 'call_missed_outgoing',
    // text:'单据转交'
  },
  APPROVE: {
    icon: 'authorize',
  },
  REJECT: {
    icon: 'authorize',
  },
  SYNC: {
    icon: 'sync',
  },
  SYNCHRONIZING: {
    icon: 'sync',
  },
  SYNC_FAILURE: {
    icon: 'sync',
  },
  SYNC_SUCCESS: {
    icon: 'sync',
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
      isExpandedArr: [],
    };
    /**
     * 操作记录 DataSet
     */
    this.operationDs = new DataSet(
      operationDS({
        url: `/ssta/v1/${tenantId}/charge-actions`,
        pk: 'chargeHeaderId',
        lookupCode: 'SSTA.CHARGE_ACTION_STATUS_LOV',
        isFilter: this.props.isFilter,
        lovPara: { chargeHeaderId: this.props.chargeHeaderId },
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

  async componentDidMount() {
    const { chargeHeaderId } = this.props;
    this.operationDs.setQueryParameter('chargeHeaderId', chargeHeaderId);
    this.handleSearchOperateList();
  }

  componentDidUpdate(prevProps) {
    const { tabKey } = this.props;
    if (tabKey !== prevProps.tabKey) {
      this.updateFooterBtn();
    }
  }

  handleSearchOperateList = async(fields) => {
    const params = fields?.params || {};
    // eslint-disable-next-line no-unused-expressions
    this.operationDs?.queryDataSet?.current?.reset();
    // eslint-disable-next-line no-unused-expressions
    this.operationDs?.queryDataSet?.current?.set(params);
    this.updateFooterBtn();
    const res = getResponse(await this.operationDs.query());
    this.setState({
      loading: true,
    });
    if (res && !res.failed && res.content) {
      this.setState({
        operateData: res.content,
        loading: false,
        isExpandedArr: new Array(res.content.length).fill(true),
      });
    }
  }

  updateFooterBtn = () => {
    const { modal, chargeHeaderId, isFilter } = this.props;
    if (modal && isFilter) {
      const params = this.operationDs?.queryDataSet?.current?.toData();
      modal.update({
        footer: (okBtn) => [
          okBtn,
          <ExcelExportPro
            buttonText={intl.get('hzero.common.button.export').d('导出')}
            templateCode="SRM_C_SSTA_CHARGE_ACTION_EXPORT" // 导出模板编码
            exportAsync
            otherButtonProps={{
              type: 'c7n-pro',
            }}
            requestUrl={`/ssta/v1/${getCurrentOrganizationId()}/charge-actions/charge/action/export`}
            queryParams={{
              ...params,
              chargeHeaderId,
            }}
            allBody
            method="POST"
          />,
        ],
      });
    }
  };

  /*
   * 操作记录
   */
  getColumns = () => {
    const columns = [
      {
        name: 'processUserName',
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

  getProcessUserName = (t) => {
    return t.processUserId === 0
      ? intl.get('ssta.costSheet.model.externalSystem').d('外部系统')
      : t.processUserName;
  };

  formatRemark = (t, index) => {
    const { isExpandedArr } = this.state;

    const formatExpanded = () => {
      if (isExpandedArr[index]) {
        return t.processUserId === 0 && ['APPROVED', 'RETURNED'].includes(t.processStatus) ? (
          <div className="reamks gray">
            {intl.get('ssta.costSheet.model.costSheet.approveDesc').d('审批意见')}：
            <span style={{ color: 'black' }}>{t.processRemark} </span>
          </div>
        ) : (
          <Fragment>
            <div className="reamks">
              <div className="operator gray">{this.getProcessUserName(t)}</div>
              <div className="status gray">
                {intl.get('ssta.costSheet.model.added').d('添加了')}
              </div>
              <div>
                <div className="result comment gray">
                  【
                  {['REVERSED'].includes(t.processStatus)
                    ? intl.get('ssta.costSheet.model.costSheet.reverseDesc').d('冲销说明：')
                    : ''}
                  {t.processRemark}】
                </div>
              </div>
            </div>
          </Fragment>
        );
      }
      return null;
    };
    if (t.processRemark && t.processStatus !== 'SYNCHRONIZING') {
      return (
        <Fragment>
          <Icon
            type={isExpandedArr[index] ? 'expand_more' : 'expand_less'}
            onClick={() => {
              this.setState({
                isExpandedArr: isExpandedArr.map((isExpand, i) =>
                  i === index ? !isExpand : isExpand
                ),
              });
            }}
          />
          {formatExpanded()}
        </Fragment>
      );
    }
    return null;
  };

  openOrderInfoModal = () => {
    const { chargeHeaderId, roleSource, history } = this.props;
    Modal.open({
      drawer: true,
      key: Modal.key(),
      closable: true,
      className: Styles['ssta-large-modal'],
      title: intl.get(`ssta.common.view.message.orderInfo`).d('出单细则'),
      children: (
        <OrderInfoModal chargeHeaderId={chargeHeaderId} roleSource={roleSource} history={history} />
      ),
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  };

  // 外部系统审批的审批成功/拒绝(APPROVED/RETURNED),标准单子的审批成功/拒绝(APPROVED/REJECTED),退回(RETURNED)

  render() {
    const { operateData, loading } = this.state;
    const { goWorkFlow, record, isFilter } = this.props;
    const chargeHeaderSource = record.get('chargeHeaderSource');
    return (
      <Spin spinning={loading}>
        <div className={style.operating}>
          {isFilter && (<FilterBar dataSet={[this.operationDs]} onQuery={this.handleSearchOperateList} autoQuery={false} expandable={false} />)}
          <Timeline className="operating-timeline">
            {operateData?.length > 0 &&
              operateData.map((t, index) => {
                const item = OPERATE_STATUS[t.processStatus] || {
                  icon: 'authorize',
                };
                if (t.processUserId === 0 && ['APPROVED', 'RETURNED'].includes(t.processStatus)) {
                  return (
                    <Item color={item.color || '#E5E5E5'}>
                      <Icon type={item.icon} className="small-icon" />
                      <Tooltip placement="topLeft" title={t.tenantName}>
                        <span className="operator">{this.getProcessUserName(t)}</span>
                      </Tooltip>
                      <Fragment>
                        <span className="status gray">
                          {['APPROVED'].includes(t.processStatus)
                            ? intl.get('ssta.costSheet.model.status.approveSuccess').d('审批通过')
                            : intl.get('ssta.costSheet.model.status.approveFail').d('审批失败')}
                        </span>
                        {this.formatRemark(t, index)}
                      </Fragment>

                      <div className="date gray">{dateTimeRender(t.processDate)}</div>
                      <div className="line" />
                    </Item>
                  );
                } else if (t.processStatus === 'REJECTED') {
                  return (
                    <Item color={item.color || '#E5E5E5'}>
                      <Icon type={item.icon} className="small-icon" />
                      <Tooltip placement="topLeft" title={t.tenantName}>
                        <span className="operator">{this.getProcessUserName(t)}</span>
                      </Tooltip>
                      {t.camp === 'supplier' && (
                        <span className="supply">
                          {intl.get('ssta.costSheet.model.supplier').d('供')}
                        </span>
                      )}
                      <span className="status gray">{t.processStatusMeaning}</span>
                      <span className="result expenseSheets">
                        【{intl.get('ssta.costSheet.model.expenseSheets').d('费用单')}】 ，
                        <span className="gray">
                          {intl.get('ssta.costSheet.model.approvedResult').d('审批结果为')}：
                        </span>
                        <span className="orange">
                          【{intl.get('ssta.costSheet.model.reject').d('拒绝')}】
                        </span>
                      </span>
                      {this.formatRemark(t, index)}
                      <div className="date gray">{dateTimeRender(t.processDate)}</div>
                      <div className="line" />
                    </Item>
                  );
                } else if (item) {
                  if (['APPROVE', 'REVOKE', 'REJECT'].includes(t.processStatus)) {
                    const isApprove = t.processStatus === 'APPROVE';
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
                        {this.formatRemark(t, index)}
                        <div className="date gray">{dateTimeRender(t.processDate)}</div>
                        <div className="line" />
                      </Item>
                    );
                  }
                  if (['RETURNED', 'COMPLETED', 'CANCEL'].includes(t.processStatus)) {
                    return (
                      <Item color={item.color || '#E5E5E5'}>
                        <Icon type={item.icon} className="small-icon" />
                        <Tooltip placement="topLeft" title={t.tenantName}>
                          <span className="operator">{this.getProcessUserName(t)}</span>
                        </Tooltip>
                        <span className="status gray">
                          {intl.get('ssta.costSheet.view.message.approve').d('最终审批了')}
                        </span>
                        <span className="result expenseSheets">
                          【{intl.get('ssta.costSheet.model.expenseSheets').d('费用单')}】 ，
                          <span className="gray">
                            {intl.get('ssta.costSheet.model.approvedResult').d('审批结果为')}：
                          </span>
                          <span
                            className={t.processStatus === 'COMPLETED' ? 'completed' : 'orange'}
                          >
                            【{t.processStatusMeaning}】
                          </span>
                        </span>
                        {this.formatRemark(t, index)}
                        <div className="date gray">{dateTimeRender(t.processDate)}</div>
                        <div className="line" />
                      </Item>
                    );
                  }
                  return (
                    <Item color={item.color || '#E5E5E5'}>
                      <Icon type={item.icon} className="small-icon" />
                      <Tooltip placement="topLeft" title={t.tenantName}>
                        <span className="operator">{this.getProcessUserName(t)}</span>
                      </Tooltip>
                      <Fragment>
                        {t.camp === 'supplier' && t.processUserId !== 0 && (
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
                        <span className="result expenseSheets">
                          【{intl.get('ssta.costSheet.model.expenseSheets').d('费用单')}】
                        </span>
                        {this.formatRemark(t, index)}
                      </Fragment>

                      <div className="date gray">{dateTimeRender(t.processDate)}</div>
                      {['NEW'].includes(t.processStatus) &&
                        ['REBATE'].includes(chargeHeaderSource) && (
                          <div className="order-info gray">
                            {intl
                              .get(`ssta.common.view.message.orderInfoRebateAuto`)
                              .d('返利执行自动出单，')}
                            <a onClick={this.openOrderInfoModal}>
                              {intl.get(`ssta.common.view.message.orderInfo`).d('出单细则')}
                            </a>
                          </div>
                        )}
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
