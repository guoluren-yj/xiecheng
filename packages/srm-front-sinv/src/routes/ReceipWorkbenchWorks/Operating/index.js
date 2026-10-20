/*
 * @Description:index
 * @Date: 2021-05-01 09:20:13
 * @author: zuoxiangyu <xiangyu.zuo@going-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import React, { Fragment, PureComponent } from 'react';
import { DataSet, Tabs } from 'choerodon-ui/pro';
import { Icon, Timeline, Spin } from 'choerodon-ui';
import { Button } from 'hzero-ui';
import { cloneDeep } from 'lodash';
import { PRIVATE_BUCKET } from '_utils/config';

import Upload from '_components/C7NUpload';
import intl from 'utils/intl';
import { dateTimeRender } from 'utils/renderer';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';

import ApproveRecord from '_components/ApproveRecord';
import { operaTableDS, appovedTableDS } from './indexDS';
import style from './index.less';

const organizationId = getCurrentOrganizationId();

const { TabPane } = Tabs;
const { Item } = Timeline;

const OPERATE_STATUS = {
  '10_NEW': {
    icon: 'add',
  },
  '20_SUBMITTED': {
    icon: 'check',
  },
  '30_REJECTED': {
    icon: 'authorize',
    color: '#F56349',
  },
  '40_FINISHED': {
    icon: 'check',
    color: '#47B881',
  },
  '50_DELETED': {
    icon: 'delete',
  },
  '60_WFL_SUBMIT': {
    icon: 'check',
  },
  '70_WFL_APPROVE': {
    icon: 'authorize',
  },
  '80_TRX_UPDATE': {
    icon: 'autorenew',
  },
  '90_TRANSFER': {
    icon: 'call_missed_outgoing',
  },
  WFL_BACK: {
    icon: 'reply',
  },
  OUT_APPROVE: {
    icon: 'authorize',
  },
  OUT_REJECTED: {
    icon: 'authorize',
    color: '#F56349',
  },
  OUT_BACK: {
    icon: 'reply',
  },
  '61_WFL_REJECTED': {
    icon: 'authorize',
    color: '#F56349',
  },
};
const modelPrompt = 'sinv.receiptWorkbench.model.receipt';
@formatterCollections({
  code: [
    'sinv.receiptWorkbench',
    'sinv.receiptExecution',
    'hzero.common',
    'entity.company',
    'sinv.common',
  ],
})
export default class Index extends PureComponent {
  constructor(props) {
    super(props);
    const { Ref = (e) => e } = props;
    // this指向List
    Ref(this);
    this.state = {
      tabKey: 'OPERAT',
      operateData: [],
      approveData: [],
      operateLoading: false,
      approveLoading: false,
    };
  }

  handleNoData = () => {
    return (
      <div className="nodata_wrapper">
        <span>{intl.get('hzero.common.components.noticeIcon.null').d('暂无数据')}</span>
      </div>
    );
  };

  /*
   * 操作记录-Modal
   */
  operaTableDs = new DataSet(operaTableDS());

  appovedTableDs = new DataSet(appovedTableDS());

  /** ************************************************ 默认事件 *********************************************************** */
  async componentDidMount() {
    console.log('子组件渲染了');
    const { operaRecord } = this.props;
    const {
      data: { rcvTrxHeaderId },
    } = operaRecord;
    this.operaTableDs.setQueryParameter('params', {
      rcvTrxHeaderId,
    });
    this.setState({ operateLoading: true });
    const res = getResponse(await this.operaTableDs.query());
    if (Array.isArray(res) && res.length > 0) {
      this.setState({
        operateData: res,
        operateLoading: false,
      });
    } else {
      this.setState({ operateLoading: false });
    }
    this.appovedTableDs.setQueryParameter('params', {
      rcvTrxHeaderId,
    });
    const res2 = getResponse(await this.appovedTableDs.query());
    if (res2 && !res2.failed && res2[0] && res2[0].historicTaskExtList.length) {
      this.setState({
        approveData: res2
          .reduce((pre, current) => [...pre, ...(current.historicTaskExtList || [])], [])
          .reverse(),
      });
    }
  }

  /** ************************************************ 事件方法 *********************************************************** */

  getApproveColor = (data) => {
    const REJECT = ['Rejected'];
    const APPROVED = ['Approved'];
    let iconColor = '#E5E5E5';
    if (data?.children?.length === 1) {
      if (REJECT.includes(data?.action)) {
        iconColor = '#F56349';
      } else if (APPROVED.includes(data?.action)) {
        iconColor = '#47B881';
      } else {
        iconColor = '#E5E5E5';
      }
    }
    return {
      iconColor,
    };
  };

  // 处理同一节点多条审批数据
  handleMultiple = (source) => {
    if (!source?.length) return [];
    const allList = source.map((s) => s.taskDefinitionKey);
    const uniqueList = [...new Set(allList)];
    return uniqueList.map((u) => {
      let unique = {};
      const list = [];
      let assigneeName;
      let startTime;
      const sameList = source.filter((m) => m.taskDefinitionKey === u);
      // unique = sameList[0].assigneeName && sameList[0].startTime 环引用：待解决
      const copy = cloneDeep(sameList[0]);
      unique = sameList.length > 1 ? { ...copy, assigneeName, startTime } : copy;
      sameList.forEach((m) => list.push(m));
      unique.children = list;
      return unique;
    });
  };

  /*
   * tab切换
   */
  tabChange = async (key) => {
    this.setState({ tabKey: key });
  };

  // 获取页底按钮
  getFooter = () => {
    const { operaCancel } = this.props;
    const closeBtn = (
      <Button onClick={operaCancel} type="primary">
        {intl.get('hzero.common.status.closed').d('关闭')}
      </Button>
    );
    // const processBtn = (
    //   <div className="process_branch">
    //     <Icon type="branch" />
    //     {intl.get(`${modelPrompt}.flowChart`).d('流程图')}
    //   </div>
    // );
    return [closeBtn];
  };

  /** ************************************************ 列表字段 *********************************************************** */
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
        width: 170,
      },
      {
        name: 'processRemark',
        width: 170,
      },
    ];
    return columns;
  };

  /*
   * 审批记录
   */
  getAppoveColumns = () => {
    const columns = [
      {
        name: 'endTime',
      },
      {
        name: 'action',
      },
      {
        name: 'name',
      },
      {
        name: 'assigneeName',
      },
      {
        name: 'comment',
      },
      {
        name: 'attachmentUuid',
        renderer: ({ record }) => (
          <Upload
            filePreview
            viewOnly
            name="attachmentUuid"
            bucketName={PRIVATE_BUCKET}
            bucketDirectory="sinv-delivery"
            tenantId={organizationId}
            record={record}
          />
        ),
      },
    ];
    return columns;
  };

  handlePush = (status) => {
    if (
      status === '70_WFL_APPROVE' ||
      status === '30_REJECTED' ||
      status === '61_WFL_REJECTED' ||
      status === 'WFL_BACK' ||
      status === 'OUT_WFL_APPROVE' ||
      status === 'OUT_WFL_REJECTED' ||
      status === 'OUT_WFL_BACK'
    ) {
      this.setState({
        tabKey: 'APPROVED',
      });
    }
  };

  /** ************************************************ 渲染 *********************************************************** */
  render() {
    const { operateData, tabKey, operateLoading = true, approveLoading = true } = this.state;
    const { approveData } = this.state;
    // approveData = this.handleMultiple(approveData);
    const Ele = () => (
      <Spin spinning={operateLoading}>
        <Timeline className="operating-timeline">
          {operateData?.length > 0 &&
            !operateLoading &&
            operateData.map((t) => {
              const item = OPERATE_STATUS[t?.processStatus];
              if (
                t?.processStatus === '30_REJECTED' ||
                t?.processStatus === '61_WFL_REJECTED' ||
                t?.processStatus === 'OUT_REJECTED'
              ) {
                return (
                  <Item color="#f56349">
                    <Icon type={item?.icon} />
                    <span
                      className="status gray reject"
                      style={{
                        cursor:
                          t?.processStatus === '61_WFL_REJECTED' ||
                          t?.processStatus === '30_REJECTED'
                            ? 'pointer'
                            : 'none',
                      }}
                      onClick={() => this.handlePush(t?.processStatus)}
                    >
                      {/* {intl.get(`${modelPrompt}.workflowApproval`).d('工作流审批')} */}
                      {t?.processStatusMeaning}
                    </span>
                    <div className="date gray">{dateTimeRender(t?.processDate)}</div>
                    <div className="line" />
                  </Item>
                );
              } else if (
                t?.processStatus === '70_WFL_APPROVE' ||
                t?.processStatus === 'OUT_APPROVE'
              ) {
                return (
                  <Item color="#47b881">
                    <Icon type={item?.icon} />
                    <span
                      className="status gray success"
                      style={{
                        cursor: t?.processStatus === '70_WFL_APPROVE' ? 'pointer' : 'none',
                      }}
                      onClick={() => this.handlePush(t?.processStatus)}
                    >
                      {/* {intl.get(`${modelPrompt}.workflow`).d('工作流')} */}
                      {t?.processStatusMeaning}
                    </span>
                    <div className="date gray">{dateTimeRender(t?.processDate)}</div>
                    <div className="line" />
                  </Item>
                );
              } else {
                return (
                  <Item color="#E5E5E5">
                    <Icon type={item?.icon || '/'} />
                    <span className="operator" onClick={() => this.handlePush(t?.processStatus)}>
                      {t?.processUserName}
                    </span>
                    <span className="status gray" onClick={() => this.handlePush(t?.processStatus)}>
                      {t?.processStatusMeaning}
                    </span>
                    <span className="result" onClick={() => this.handlePush(t?.processStatus)}>
                      {intl.get(`${modelPrompt}.TagTrxNum`).d('【收货单】')}
                    </span>
                    {t?.processRemark && (
                      <div className="remark gray">
                        <span className="status gray">{t?.processUserName}</span>
                        <span className="status gray">
                          {intl.get('sinv.common.model.common.remarked').d('备注了')}
                        </span>
                        <span className="status gray">{t?.processRemark}</span>
                      </div>
                    )}
                    <div className="date gray">{dateTimeRender(t?.processDate)}</div>
                    <div className="line" />
                  </Item>
                );
              }
            })}
          {!operateData?.length && !operateLoading && this.handleNoData()}
        </Timeline>
      </Spin>
    );
    return (
      <Fragment>
        <div className={style.operating}>
          {approveData.length !== 0 ? (
            <Tabs
              activeKey={tabKey}
              onChange={(key) => this.tabChange(key)}
              defaultActiveKey={tabKey}
            >
              <TabPane
                tab={intl.get('sinv.common.model.common.operationRecord').d('操作记录')}
                key="OPERAT"
              >
                <Ele />
              </TabPane>
              <TabPane
                tab={intl.get('sinv.receiptExecution.model.receipt.approved').d('审批记录')}
                key="APPROVED"
              >
                <Spin spinning={approveLoading}>
                  <ApproveRecord data={approveData} />
                  {!approveData?.length && this.handleNoData()}
                </Spin>
              </TabPane>
            </Tabs>
          ) : null}
          {approveData.length === 0 ? <Ele /> : null}
        </div>
      </Fragment>
    );
  }
}
