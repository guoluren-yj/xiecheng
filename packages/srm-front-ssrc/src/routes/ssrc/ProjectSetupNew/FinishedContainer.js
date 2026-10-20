/**
 * 完成状态table容器
 * @date: 2021-01-27
 * @author: Goku<xu.pan01@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2021, Hand
 */
import React, { PureComponent } from 'react';
import { Table } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { Popover } from 'choerodon-ui';
import { getTableFixSelfAdaptStyle } from '@/utils/utils';

// import styles from './index.less';
import {
  renderProjectSetupStatusTag,
  // renderSourceProjectField,
  // renderCompanyField,
  // renderCreationField,
  renderBiddingInfoField,
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

  getCommonColunmns() {
    const { match, handleFuncMap, rfTemplateDs, isBid } = this.props;
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
        width: 110,
        name: 'action',
        // minWidth: 140,
        align: 'left',
        tooltip: 'none',
        command: ({ record }) =>
          renderAction(
            {
              record,
              match,
              handleFuncMap,
              aggregation,
              permissionFlagMap,
              rfTemplateDs,
              projectOldUIFlag,
            },
            onRef
          ),
        // renderer: ({ record }) =>
        //   renderAction({ record, match, handleFuncMap, permissionFlagMap }, onRef),
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
        name: 'biddingInfo',
        width: 400,
        minWidth: 400,
        align: 'left',
        tooltip: 'none',
        // command: ({ record }) => renderBiddingInfoField(record),
        renderer: ({ record }) =>
          aggregation
            ? renderBiddingInfoField(record)
            : renderBiddingInfoField(record) && (
            <Popover content={renderBiddingInfoField(record)}>
              <a>{intl.get('hzero.common.button.view').d('查看')}</a>
            </Popover>
              ),
      },
      {
        name: 'finishedDate',
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
        // renderer: ({ record }) => renderCompanyField(record),
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
      },
    ];
    return commonColumns;
  }

  getColumns() {
    const commonColunmns = this.getCommonColunmns();
    return commonColunmns;
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
        code: `SSRC.PROJECT_SETUP.NEW_LIST.FINISHED`,
      },
      <Table
        customizable
        customizedCode="aggregation"
        queryBar="none"
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
