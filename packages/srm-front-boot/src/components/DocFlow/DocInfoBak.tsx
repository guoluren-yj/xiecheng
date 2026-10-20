/**
 * DocInfo
 * 单据流单据信息
 * @date: 2021-09-08
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { useEffect, useState } from 'react';
import { Tabs, Timeline, Collapse } from 'choerodon-ui';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import classnames from 'classnames';
import { Form, DataSet, Output, Spin } from 'choerodon-ui/pro';

import { getResponse } from 'utils/utils';
import intl from 'utils/intl';
import { queryNodeDoc, queryNodeProcess, queryNodeCnfAction } from './docFlowService';

const { TabPane } = Tabs;
const { Item } = Timeline;
const { Panel } = Collapse;

// FlowChart interface
interface FlowInfoProps {
  nodeDataId: string;
  nodeTypeName: string;
  currentOrganizationId: number;
  authorityMap: {
    OVERVIEW: boolean;
    PROGRESS: boolean;
    CONFIG_INFORMATION: boolean;
  };
}

// Overview Option Interface
interface OverviewOptionInterface {
  fieldCode: string;
  fieldValue: string;
  fieldMeaning: string;
}


// Process Data Interface
interface ProcessDataInterface {
  BEGIN?: any[];
  FINISH?: any[];
  PROCESS?: any[];
}

// ProcessList Data Interface
interface ProcessListDataInterface {
  fieldMeaning: string;
  oldValue: string;
  newValue: string;
}

// Process Step Data Interface
interface ProcessStepDataInterface {
  operator: string;
  actionDescription: string;
  createDate: string;
  list: ProcessListDataInterface[];
}

// Action Data Interface
interface ActionDataInterface {
  cnfName: string;
  strategyType: string;
  cnfDescription?: string;
  actionDescription: string;
  createDate: string;
  link ?:string;
  versionNumber?: number;
  settleConfigNum ?:string;
  actionValue?: {
    isTile: boolean;
    actionDescription: object[] | string[] | string;
  }
}

function FlowInfo(props: FlowInfoProps) {
  const { nodeDataId, currentOrganizationId, nodeTypeName, authorityMap } = props;
  const [docOverviewHeader, setDocOverviewHeader] = useState({});
  const [docOverviewLine, setDocOverviewLine] = useState({});
  const [overViewLoading, handleOverViewLoading] = useState(true);
  const [processData, setProcessData] = useState({});
  const [processLoading, handleProcessLoading] = useState(true);
  const [currentTabKey, changeCurrentTabKey] = useState('doc-overview');
  const [actionData, setActionData] = useState([]);
  const [actionLoading, handleActionLoading] = useState(true);
  // 处理当前 tab 页面是否请求成功
  const [succeedTab, setSucceedTab] = useState({
    'doc-overview': true, // 初始状态设置为 true 防止二次调用，当第一次进入后查询失败，置为 false。再次切换tab页时候，进行处理
    'doc-process': false,
    'doc-action': false,
  });

  // 关键配置与策略 strategyType 对应描述类型
  // const strategyTypeMap = {
  //   CONFIG_CENTER: {
  //     desc: intl.get('component.docFlow.view.strategyType.configCenter').d('配置中心'),
  //     code: 'config-center',
  //     color: 'blue',
  //   },
  //   POLICY_TEMPLATE: {
  //     desc: intl.get('component.docFlow.view.strategyType.policeTemplate').d('策略模板'),
  //     code: 'police-template',
  //     color: 'yellow',
  //   },
  //   CNF: {
  //     desc: intl.get('component.docFlow.view.strategyType.cnf').d('业务规则'),
  //     code: 'cnf',
  //     color: 'green',
  //   },
  // };

  const strategyTypeMap = {
    SSTA_CONFIG: {
      desc: intl.get('component.docFlow.view.strategyType.sstaConfig').d('结算策略'),
      code: 'ssta-config',
      color: 'blue',
    },
    SOURCE_CONFIG: {
      desc: intl.get('component.docFlow.view.strategyType.sourceConfig').d('寻源模板策略'),
      code: 'source-config',
      color: 'yellow',
    },
    CNF: {
      desc: intl.get('component.docFlow.view.strategyType.cnf').d('业务规则定义'),
      code: 'cnf',
      color: 'green',
    },
  };

  /**
   * 查询单据概览
   * @param id nodeDataId
   * @param tenantId currentOrganizationId
   */
   const queryOverviewInfo = (id, tenantId) => {
    queryNodeDoc({
      nodeDataId: id,
      currentOrganizationId: tenantId,
    })
      .then((res) => {
        if (getResponse(res)) {
          setDocOverviewHeader(getDsOption(res.header));
          setDocOverviewLine(getDsOption(res.line));
          setSucceedTab({
            ...succeedTab,
            'doc-overview': true,
          });
        } else {
          setSucceedTab({
            ...succeedTab,
            'doc-overview': false,
          });
        }
      })
      .finally(() => handleOverViewLoading(false));
  };

  /**
   * 查询处理进度
   * @param id nodeDataId
   * @param tenantId currentOrganizationId
   */
  const queryProcessInfo = (id, tenantId) => {
    queryNodeProcess({
      nodeDataId: id,
      currentOrganizationId: tenantId,
    })
      .then((res) => {
        if (getResponse(res)) {
          setProcessData(res);
          setSucceedTab({
            ...succeedTab,
            'doc-process': true,
          });
        }
      })
      .finally(() => handleProcessLoading(false));
  };

  /**
   * 查询关键配置与策略
   * @param id nodeDataId
   * @param tenantId currentOrganizationId
   */
  const queryActionInfo = (id, tenantId) => {
    queryNodeCnfAction({
      nodeDataId: id,
      currentOrganizationId: tenantId,
    })
      .then((res) => {
        if (getResponse(res)) {
          setActionData(res);
          setSucceedTab({
            ...succeedTab,
            'doc-action': true,
          });
        }
      })
      .finally(() => handleActionLoading(false));
  };

  useEffect(() => {
    queryOverviewInfo(nodeDataId, currentOrganizationId);
  }, [nodeDataId, currentOrganizationId]);

  /**
   *  succeedTab判断是否已经查询成功，如果失败再次打开tab会进行数据查询
   */
  useEffect(
    () => {
      if (!succeedTab[currentTabKey]) {
        switch (currentTabKey) {
          case 'doc-overview':
            queryOverviewInfo(nodeDataId, currentOrganizationId);
            break;
          case 'doc-process':
            queryProcessInfo(nodeDataId, currentOrganizationId);
            break;
          case 'doc-action':
            queryActionInfo(nodeDataId, currentOrganizationId);
            break;
          default:
            break;
        }
      }
    },
    [currentTabKey, nodeDataId, currentOrganizationId]
  );

  /**
   * 切换tab
   * @param key tabKey
   */
  const onTabChange = (key) => {
    changeCurrentTabKey(key);
  };

  /**
   * 组装Ds数据
   * @param data 单据概览接口数据
   * @returns
   */
  const getDsOption = (data: OverviewOptionInterface[]) => {
    const dsData = {};
    data.forEach((d) => {
      dsData[d.fieldCode] = d.fieldValue;
    });
    return {
      fields: data.map((f) => {
        return {
          name: f.fieldCode,
          type: 'string',
          label: f.fieldMeaning,
        };
      }),
      data: [dsData],
    };
  };

  /**
   * 处理进度
   * @param processList 处理进度列表数据
   * @returns
   */
  const getProcessStep = (processList: ProcessStepDataInterface[] = []) => {
    return processList.map((pl) => (
      <Item color='#E5E5E5'>
        <Collapse bordered={false} defaultActiveKey={['0']}>
          <Panel
            key="1"
            showArrow={!!(pl.list && pl.list.length > 0)}
            disabled={!(pl.list && pl.list.length > 0)}
            header={
              <>
                <div className="step-title">
                  <span className="operator">{pl.operator}</span>
                  <span className="action-description">{pl.actionDescription}</span>
                  <span className="doc-type">【{nodeTypeName}】</span>
                </div>
                <div className="step-date">{pl.createDate}</div>
              </>
            }
          >
            {pl.list &&
              pl.list.length > 0 &&
              pl.list.map((li) => (
                <div className="step-content">
                  <span>{pl.operator}</span>
                  <span className="span-keywords">
                    {intl.get('component.docFlow.view.action.process.target').d('将')}
                  </span>
                  <span>【{li.fieldMeaning}】</span>
                  <span className="span-keywords">
                    {intl.get('component.docFlow.view.action.process.from').d('由')}
                  </span>
                  <span>【{li.oldValue}】</span>
                  <span className="span-keywords">
                    {intl.get('component.docFlow.view.action.process.to').d('改成')}
                  </span>
                  <span>【{li.newValue}】</span>
                </div>
              ))}
          </Panel>
        </Collapse>
      </Item>
    ));
  };

  /**
   * 渲染处理进度
   * @param data 接口数据
   * @returns
   */
  const renderProcess = (data: ProcessDataInterface) => {
    const { BEGIN = [], FINISH = [], PROCESS = [] } = data;
    return (
      <>
        {
          FINISH && FINISH.length > 0 && (
            <Collapse bordered={false} defaultActiveKey={['1']}>
              <Panel
                key="1"
                header={
                  <div className="doc-flow-modal-panel-title">
                    <span>
                      {intl.get('component.docFlow.view.collapse.process.finish').d('处理完成')}
                    </span>
                  </div>
                }
              >
                <div className="parent-level-step">
                  <Timeline>
                    {getProcessStep(FINISH)}
                  </Timeline>
                </div>
              </Panel>
            </Collapse>
          )
        }
        {
          PROCESS && PROCESS.length > 0 && (
            <Collapse bordered={false} defaultActiveKey={['1']}>
              <Panel
                key="1"
                header={
                  <div className="doc-flow-modal-panel-title">
                    <span>
                      {intl.get('component.docFlow.view.collapse.process.processing').d('处理中')}
                    </span>
                  </div>
                }
              >
                <div className="parent-level-step">
                  <Timeline>
                    {getProcessStep(PROCESS)}
                  </Timeline>
                </div>
              </Panel>
            </Collapse>
          )
        }
        {
          BEGIN && BEGIN.length > 0 && (
            <Collapse bordered={false} defaultActiveKey={['1']}>
              <Panel
                key="1"
                header={
                  <div className="doc-flow-modal-panel-title">
                    <span>
                      {intl.get('component.docFlow.view.collapse.process.begin').d('开始处理')}
                    </span>
                  </div>
                }
              >
                <div className="parent-level-step">
                  <Timeline>
                    {getProcessStep(BEGIN)}
                  </Timeline>
                </div>
              </Panel>
            </Collapse>
          )
        }
      </>
    );
  };

  /**
   * 渲染执行规则描述
   * @param actionValue 执行规则描述数据
   * @returns
   */
  const renderActionDescription = ( actionValue ) => {
    const { isTile, actionDescription } = actionValue;
    if(isTile) {
      return (
        <div>
          {
            actionDescription.map((desc: Object) => {
              return (
                <div className='action-content-description'>
                  <span>{Object.keys(desc)[0]}: </span>
                  <span>{Object.values(desc)[0]}</span>
                </div>
              );
            })
          }
        </div>
      );
    } else {
      return <span className='action-content-description'>{typeof(actionDescription) === 'string' ? actionDescription : actionDescription.join(' ')}</span>;
    }
  };

  /**
   * 渲染关键配置与策略
   * @param data 接口数据
   * @returns
   */
  const renderAction = (data: ActionDataInterface[] = []) => {
    return data.map((d) => {
      return (
        <Collapse bordered={false} defaultActiveKey={['1']}>
          <Panel
            key="1"
            header={
              <div className="doc-flow-modal-panel-title">
                <span>{d.cnfName}</span>
                <span
                  className={classnames(
                    'action-panel-title',
                    `action-panel-title-${strategyTypeMap[d.strategyType].color}`
                  )}
                >
                  {strategyTypeMap[d.strategyType].desc || ''}
                </span>
              </div>
            }
          >
            <div className="action-content">
              {
                 d.strategyType === 'SSTA_CONFIG' ? (
                   <>
                     <div>
                       <span className="action-content-title">
                         {intl.get('component.docFlow.view.collapse.action.settleConfigNum').d('策略编码')}
                       </span>
                       <a href={d.link} target='_blank' className='action-content-description'>{d.settleConfigNum}</a>
                     </div>
                     <div>
                       <span className="action-content-title">
                         {intl.get('component.docFlow.view.collapse.action.versionNumber').d('策略版本')}
                       </span>
                       <span className='action-content-description'>{d.versionNumber}</span>
                     </div>
                   </>
                 ) : (
                   <>
                     <div>
                       <span className="action-content-title">
                         {intl.get('component.docFlow.view.collapse.action.cnfDescription').d('策略描述')}
                       </span>
                       <span className='action-content-description'>{d.cnfDescription}</span>
                     </div>
                     <div className='action-content-rule-desc'>
                       <span className="action-content-title">
                         {intl
                          .get('component.docFlow.view.collapse.action.actionDescription')
                          .d('执行规则')}
                       </span>
                       {
                        renderActionDescription(d.actionValue)
                      }
                     </div>
                   </>
                 )
              }
              <div>
                <span className="action-content-title">
                  {intl.get('component.docFlow.view.collapse.action.createDate').d('执行时间')}
                </span>
                <span className='action-content-description'>{d.createDate}</span>
              </div>
            </div>
          </Panel>
        </Collapse>
      );
    });
  };

  /**
   * 生产Ds表单样式
   * @param formConfig 表单配置数据
   * @returns
   */
   const renderDocOverviewForm = (formConfig) => {
    return formConfig && formConfig.fields && formConfig.fields.map((field) => {
      return <Output name={field.name} colSpan={1} />;
    });
  };

  return (
    <div className="doc-flow-info-modal">
      <Tabs onChange={onTabChange}>
        {
          authorityMap.OVERVIEW && (
            <TabPane
              tab={intl.get('component.docFlow.view.docInfo.tab.docOverview').d('单据概览')}
              key="doc-overview"
              className="doc-overview-tabPane"
            >
              <Spin spinning={overViewLoading}>
                <Collapse bordered={false} defaultActiveKey={['1']}>
                  <Panel
                    key="1"
                    header={
                      <div className="doc-flow-modal-panel-title">
                        <span>
                          {intl.get('component.docFlow.view.collapse.docOverview.header').d('头信息')}
                        </span>
                      </div>
                    }
                  >
                    <Form
                      dataSet={new DataSet(docOverviewHeader)}
                      labelLayout={LabelLayout.vertical}
                      columns={2}
                      className="c7n-pro-vertical-form-display"
                    >
                      {renderDocOverviewForm(docOverviewHeader)}
                    </Form>
                  </Panel>
                </Collapse>
                <Collapse bordered={false} defaultActiveKey={['1']}>
                  <Panel
                    key="1"
                    header={
                      <div className="doc-flow-modal-panel-title">
                        <span>
                          {intl.get('component.docFlow.view.collapse.docOverview.line').d('行信息')}
                        </span>
                      </div>
                    }
                  >
                    <Form
                      dataSet={new DataSet(docOverviewLine)}
                      labelLayout={LabelLayout.vertical}
                      columns={2}
                      className="c7n-pro-vertical-form-display"
                    >
                      {renderDocOverviewForm(docOverviewLine)}
                    </Form>
                  </Panel>
                </Collapse>
              </Spin>
            </TabPane>
          )
        }
        {
          authorityMap.PROGRESS && (
            <TabPane
              tab={intl.get('component.docFlow.view.docInfo.tab.docProcess').d('处理进度')}
              key="doc-process"
              className="doc-process-tabPane"
            >
              <Spin spinning={processLoading}>
                {processLoading && <div style={{marginTop: 150}} />}
                {renderProcess(processData)}
              </Spin>
            </TabPane>
          )
        }
        {
          authorityMap.CONFIG_INFORMATION && (
            <TabPane
              tab={intl.get('component.docFlow.view.docInfo.tab.docAction').d('关键配置与策略')}
              key="doc-action"
              className="doc-action-tabPane"
            >
              <Spin spinning={actionLoading}>
                {actionLoading && <div style={{marginTop: 150}} />}
                {renderAction(actionData)}
              </Spin>
            </TabPane>
          )
        }
      </Tabs>
    </div>
  );
}

export default FlowInfo;
