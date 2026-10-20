/**
 * 进行中table容器
 * @date: 2021-02-02
 * @author: Goxu<xu.pan01@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2021, Hand
 */
import React, { PureComponent } from 'react';
import { Table } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { Popover, Collapse } from 'choerodon-ui';
import { noop } from 'lodash';
import classnames from 'classnames';

import ApproveRecordSimple from '_components/ApproveRecordSimple';

import intl from 'utils/intl';

import styles from './index.less';
import {
  renderProjectSetupStatusTag,
  // renderSourceProjectField,
  // renderCompanyField,
  // renderCreationField,
  renderImplementationField,
  // approveExecutiveRender,
} from './helpers';

import { renderAction } from './renderAction';

const promptCode = 'ssrc.projectSetup';
const { Panel } = Collapse;

export default class Container extends PureComponent {
  constructor(props) {
    super(props);
    if (props.getRef) {
      props.getRef(this);
    }
  }

  state = {
    aggregation1: true,
    aggregation2: true,
  };

  /**
   * 获取布局通用列
   * @param {*} layoutType - 布局类别
   */
  getCommonColunmns(content) {
    const { match, handleFuncMap, rfTemplateDs, isBid, workFlowMenuPermissionMap } = this.props;
    const { aggregation1, aggregation2 } = this.state;
    const {
      onRef,
      changePermissionCode,
      createRfxPermissionCode,
      manageRfxPermissionCode,
      approveDetailPermissionCode,
      approvePermissionCode,
      draftPermissionCode,
      maintainPermissionCode,
      copyPermissionCode,
      projectClosePermissionCode,
      sourceResultPermissionCode,
      viewVersionPermissionCode,
      projectOldUIFlag,
    } = this.props;
    const permissionFlagMap = {
      changePermissionCode,
      createRfxPermissionCode,
      manageRfxPermissionCode,
      approveDetailPermissionCode,
      approvePermissionCode,
      draftPermissionCode,
      maintainPermissionCode,
      copyPermissionCode,
      projectClosePermissionCode,
      sourceResultPermissionCode,
      viewVersionPermissionCode,
    };
    const commonColumns = [
      {
        name: 'sourceProjectStatus',
        width: 100,
        renderer: ({ value, record }) => renderProjectSetupStatusTag(value, record),
      },
      {
        name: 'action',
        width:
          (content === 'waiting' ? aggregation1 : aggregation2) || content === 'approve'
            ? 120
            : 240,
        // minWidth: 160,
        align: 'left',
        tooltip: 'none',
        command: ({ record }) =>
          renderAction(
            {
              record,
              match,
              handleFuncMap,
              permissionFlagMap,
              rfTemplateDs,
              workFlowMenuPermissionMap,
              projectOldUIFlag,
            },
            onRef
          ),
        // renderer: ({ record }) =>
        //   renderAction({ record, match, handleFuncMap, permissionFlagMap, layoutType }, onRef),
      },
      {
        key: 'sourceProjectObj',
        width: 220,
        align: 'left',
        aggregation: true,
        header: intl.get(`${promptCode}.model.projectSetup.sourceProjectInfo`).d('寻源项目信息'),
        // filterFlag: 1,
        aggregationLimit: 4,
        children: [
          {
            name: 'sourceProjectNum',
            width: 160,
            renderer: ({ record }) => (
              <Popover placement="topLeft" content={record.get('sourceProjectNum')}>
                <a onClick={() => handleFuncMap.sourceProjectNum(record)}>
                  {record.get('sourceProjectNum')}
                </a>
              </Popover>
            ),
          },
          {
            name: 'sourceProjectName',
            width: 150,
          },
          {
            name: 'sourceCategoryMeaning',
            width: 100,
            renderer: ({ record }) =>
              isBid
                ? record.get('secondarySourceCategoryMeaning')
                : record.get('sourceCategoryMeaning'),
          },
          {
            name: 'sourceMethodMeaning',
            width: 100,
          },
        ],
      },
      {
        name: 'implementation',
        width: 240,
        tooltip: 'none',
        renderer: ({ record }) => {
          const { remote } = this.props;
          const { sourceProjectStatus, businessKey } = record.toData();
          const { dataSet } = record;
          const simpleApprovalHistoryData = dataSet?.getState('simpleApprovalHistoryData') || {};
          // // 若存在 businessKey, 且符合以下状态 则优先展示平台组件
          switch (sourceProjectStatus) {
            case 'APPROVING': // 审批中
            case 'CHANGE_APPROVING': // 变更审批中
            case 'CHANGE_REFUSE': // 变更审批拒绝
              return <ApproveRecordSimple data={simpleApprovalHistoryData[businessKey]} />;
            default:
              return (content === 'waiting' ? aggregation1 : aggregation2) ? (
                renderImplementationField(record, undefined, remote)
              ) : record.toData().headerDTOList?.length > 1 ? (
                <Popover content={renderImplementationField(record, true, remote)}>
                  <a>{intl.get('hzero.common.button.view').d('查看')}</a>
                </Popover>
              ) : (
                renderImplementationField(record, undefined, remote)
              );
          }
        },
      },
      {
        name: 'sourceDate',
        width: 200,
        minWidth: 200,
      },
      {
        key: 'companyNameObj',
        header: intl.get(`${promptCode}.model.projectSetup.organizationInfo`).d('组织信息'),
        width: 220,
        align: 'left',
        aggregation: true,
        aggregationLimit: 4,
        children: [
          {
            name: 'companyName',
            width: 200,
          },
          {
            name: 'purOrganizationName',
            width: 200,
          },
        ],
      },
      {
        key: 'creationInfoObj',
        header: intl.get(`${promptCode}.model.projectSetup.creationInfo`).d('创建信息'),
        width: 220,
        align: 'left',
        aggregation: true,
        aggregationLimit: 4,
        // filterFlag: 1,
        children: [
          {
            name: 'creationDate',
            width: 150,
          },
          {
            name: 'createdByName',
          },
          {
            name: 'createUnitName',
          },
        ],
        // renderer: ({ record }) => renderCreationField(record),
      },
    ];
    return commonColumns;
  }

  getColumns(content) {
    const { remote } = this.props;
    const commonColunmns = this.getCommonColunmns(content);

    const columns = remote ? remote.process(
      'SSRC_PROJECT_SETUP_NEW_PROCESS_ONGOING_COMMON_COLUMNS',
      commonColunmns,
      { content, that: this }
    ) : commonColunmns;

    return columns;
  }

  /**
   * 创建寻源
   */
  @Bind()
  handleCreateRfx() {}

  // 改变所有子表格聚合或平铺
  handleAllAggregationChange = (aggregation) => {
    this.handleAggregationChange1(aggregation);
    this.handleAggregationChange2(aggregation);
  };

  handleAggregationChange1 = (aggregation, handleChangeFlag) => {
    if (handleChangeFlag) {
      const { cancelAggregationChange } = this.props;
      cancelAggregationChange();
    }
    this.setState({ aggregation1: aggregation });
  };

  handleAggregationChange2 = (aggregation, handleChangeFlag) => {
    if (handleChangeFlag) {
      const { cancelAggregationChange } = this.props;
      cancelAggregationChange();
    }
    this.setState({ aggregation2: aggregation });
  };

  render() {
    const {
      waitingDS,
      pendingDS,
      customizeTable,
      onGoingCollapseKey = [],
      changeOnGoingCollapseKey = noop,
    } = this.props;
    const { aggregation1, aggregation2 } = this.state;

    return (
      <div>
        <Collapse
          defaultActiveKey={onGoingCollapseKey}
          ghost
          trigger="icon"
          expandIconPosition="text-right"
          onChange={changeOnGoingCollapseKey}
        >
          <Panel
            header={
              <div className={styles['collapse-sub-title-wapper']}>
                <span
                  className={classnames(styles['sub-title'], styles['sub-title-collapse-title'])}
                >
                  <span style={{ backgroundColor: '#F99100' }} />
                  <span>{intl.get(`${promptCode}.view.message.waiting`).d('待处理')}</span>
                </span>
              </div>
            }
            key="pending"
            forceRender
            className={styles['ssrc-collapse-panel-wrap']}
          >
            {customizeTable(
              {
                code: `SSRC.PROJECT_SETUP.NEW_LIST.PENDING`,
              },
              <Table
                customizable
                queryBar="none"
                customizedCode="aggregation"
                aggregation={aggregation1}
                dataSet={waitingDS}
                style={{ maxHeight: 450 }}
                columns={this.getColumns('waiting')}
                onAggregationChange={(props) => this.handleAggregationChange1(props, true)}
              />
            )}
          </Panel>
          <Panel
            key="approving"
            header={
              <div className={styles['collapse-sub-title-wapper']}>
                <span className={classnames(styles.approving, styles['sub-title-collapse-title'])}>
                  <span style={{ backgroundColor: '#00AC68' }} />
                  <span>{intl.get(`${promptCode}.view.message.approving`).d('待审批')}</span>
                </span>
              </div>
            }
            forceRender
            className={styles['ssrc-collapse-panel-wrap']}
          >
            {customizeTable(
              {
                code: `SSRC.PROJECT_SETUP.NEW_LIST.PENDING_APPROVAL`,
              },
              <Table
                customizable
                queryBar="none"
                style={{ maxHeight: 450 }}
                customizedCode="aggregation"
                aggregation={aggregation2}
                dataSet={pendingDS}
                columns={this.getColumns('approve')}
                onAggregationChange={(props) => this.handleAggregationChange2(props, true)}
              />
            )}
          </Panel>
        </Collapse>
      </div>
    );
  }
}
