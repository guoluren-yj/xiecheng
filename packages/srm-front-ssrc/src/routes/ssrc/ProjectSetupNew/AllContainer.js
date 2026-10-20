/**
 * 全部table容器
 * @date: 2021-02-02
 * @author: Goxu<xu.pan01@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2021, Hand
 */
import React, { PureComponent } from 'react';
import { Table, Button, Modal } from 'choerodon-ui/pro';
import { Popover } from 'choerodon-ui';
import { isArray } from 'lodash';
import intl from 'utils/intl';
import { getTableFixSelfAdaptStyle } from '@/utils/utils';
import StatusTag from '@/routes/components/StatusTag';
import ApproveRecordSimple from '_components/ApproveRecordSimple';

import MultiLinePopover from './Components/MultiLinePopover';
import SyncStatusModal from './SyncStatusModal';
// import styles from './index.less';
import {
  renderProjectSetupStatusTag,
  // renderSourceProjectField,
  // renderCompanyField,
  // renderCreationField,
  renderImplementationField,
  renderBiddingInfoField,
  renderRateStar,
  // approveExecutiveRender,
  renderCloseFieldInfo,
} from './helpers';

import { renderAction } from './renderAction';

const promptCode = 'ssrc.projectSetup';

export default class Container extends PureComponent {
  constructor(props) {
    super(props);
    if (props.getRef) {
      props.getRef(this);
    }
  }

  state = {
    aggregation: true,
  };

  /**
   * 获取布局通用列
   * @param {*} layoutType - 布局类别
   */
  getCommonColunmns(layoutType) {
    const { aggregation } = this.state;
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
      handleFuncMap,
      rfTemplateDs,
      isBid,
      tabKey,
      remote,
      workFlowMenuPermissionMap = {},
      match,
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
        width: aggregation ? 110 : 240,
        align: 'left',
        tooltip: 'none',
        command: ({ record }) =>
          renderAction(
            {
              record,
              match,
              aggregation,
              handleFuncMap,
              permissionFlagMap,
              layoutType,
              rfTemplateDs,
              tabKey,
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
            width: 160,
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
        width: 220,
        // minWidth: 200,
        align: 'left',
        tooltip: 'none',
        renderer: ({ record }) => {
          const { dataSet } = record;
          const simpleApprovalHistoryData = dataSet?.getState('simpleApprovalHistoryData') || {};
          const { sourceProjectStatus, finishingRate, subjectMatterRule } = record.toData();
          switch (sourceProjectStatus) {
            case 'FINISHED':
              return !aggregation && subjectMatterRule === 'PACK' ? (
                <Popover content={renderBiddingInfoField(record)}>
                  <a>{intl.get('hzero.common.button.view').d('查看')}</a>
                </Popover>
              ) : (
                renderBiddingInfoField(record)
              );
            case 'NEW':
              return renderRateStar(finishingRate);
            case 'APPROVED':
            case 'REFUSE':
              return renderImplementationField(record, undefined, remote);
            case 'APPROVING': // 审批中
            case 'CHANGE_APPROVING': // 变更审批中
            case 'CHANGE_REFUSE': // 变更审批拒绝
              return (
                <ApproveRecordSimple data={simpleApprovalHistoryData[record.get('businessKey')]} />
              );
            case 'CLOSED': // 关闭
              return !aggregation ? (
                <Popover content={renderCloseFieldInfo(record)}>
                  <a>{intl.get('hzero.common.button.view').d('查看')}</a>
                </Popover>
              ) : (
                renderCloseFieldInfo(record)
              );
            default:
              return aggregation || record.toData().headerDTOList?.length === 1 ? (
                renderImplementationField(record)
              ) : (
                <Popover content={renderImplementationField(record, true)}>
                  <a>{intl.get('hzero.common.button.view').d('查看')}</a>
                </Popover>
              );
          }
        },
      },
      {
        name: 'sourceDate',
        width: 160,
        minWidth: 160,
        renderer: ({ record }) => {
          const sourceProjectStatus = record.get('sourceProjectStatus');
          if (sourceProjectStatus === 'FINISHED') {
            return record.get('finishedDate');
          } else {
            return record.get('sourceDate');
          }
        },
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
            width: 180,
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
            width: 160,
          },
          {
            name: 'createdByName',
            width: 100,
          },
          {
            name: 'createUnitName',
            width: 150,
          },
        ],
      },
      {
        name: 'syncStatusFlag',
        width: 120,
        renderer: ({ value, record }) => {
          return [0, 1].includes(value) ? (
            <Button funcType="link" onClick={() => this.openSyncStutusModal(record)}>
              <StatusTag
                text={
                  value === 1
                    ? intl.get(`ssrc.projectSetup.view.message.syncSuccess`).d('成功')
                    : intl.get(`ssrc.projectSetup.view.message.syncFail`).d('失败')
                }
                color={value === 0 ? 'error' : 'success'}
                icon="wysiwyg"
              />
            </Button>
          ) : null;
        },
      },
    ];
    const remoteColumns = remote
      ? remote.process('SSRC_PROJECT_SETUP_NEW_ALLCONTAINER_COLUMNS', commonColumns, {
          tabKey,
          layoutType,
          aggregation,
        })
      : commonColumns;
    return remoteColumns;
  }

  getColumns() {
    const commonColunmns = this.getCommonColunmns();
    return commonColunmns;
  }

  /**
   * 导出状态弹窗
   */
  openSyncStutusModal = (record) => {
    const { dataSet } = this.props;
    const sourceHeaderId = record.get('sourceProjectId');

    Modal.open({
      key: Modal.key(),
      title: intl.get(`ssrc.projectSetup.view.title.syncStatus`).d('同步状态'),
      children: <SyncStatusModal sourceHeaderId={sourceHeaderId} />,
      style: { width: '1090px' },
      drawer: true,
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
      onClose: () => {
        dataSet.query(dataSet.currentPage);
      },
    });
  };

  /**
   * 渲染分标段执行情况
   */
  renderSectionInfo(record) {
    return (
      <MultiLinePopover
        lineConfig={{
          labelName: 'sectionName',
          valueName: 'rfxStatusMeaning',
        }}
        record={record}
      />
    );
  }

  /**
   * 渲染不分标段执行情况
   */
  rendeSectionrNoneInfo(record) {
    const { headerDTOList = [] } = record.toData();
    return (
      isArray(headerDTOList) &&
      headerDTOList[0] && (
        <div>
          <span>{headerDTOList[0].sourceTitle}</span>
          <span>{headerDTOList[0].rfxStatusMeaning}</span>
        </div>
      )
    );
  }

  handleAggregationChange = (aggregation, handleChangeFlag) => {
    if (handleChangeFlag) {
      const { cancelAggregationChange } = this.props;
      cancelAggregationChange();
    }
    this.setState({ aggregation });
  };

  render() {
    const { dataSet, customizeTable } = this.props;
    const { aggregation } = this.state;
    return customizeTable(
      {
        code: `SSRC.PROJECT_SETUP.NEW_LIST.ALL`,
      },
      <Table
        customizable
        queryBar="none"
        customizedCode="aggregation"
        // style={{ maxHeight: `calc(100vh - 400px)` }}
        dataSet={dataSet}
        aggregation={aggregation}
        columns={this.getColumns()}
        onAggregationChange={(props) => this.handleAggregationChange(props, true)}
        style={getTableFixSelfAdaptStyle(true)?.tableMaxHeight}
      />
    );
  }
}
