/**
 * Orgination - 组织架构维护
 * @date: 2018-6-19
 * @author: WH <heng.wei@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React from 'react';
import { Tabs } from 'hzero-ui';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Bind } from 'lodash-decorators';
import { isUndefined } from 'lodash';
import { openTab } from 'utils/menuTab';
import querystring from 'querystring';

import { Button as PermissionButton } from 'components/Permission';

import cacheComponent from 'components/CacheComponent';
import { Header, Content } from 'components/Page';

import ExcelExport from 'components/ExcelExport';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import CommonImport from 'hzero-front/lib/components/Import';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import { HZERO_PLATFORM } from 'utils/config';

import LazyTree from './LazyTree';
import LineData from './LineData';
import styles from './index.less';

const TABENUM = {
  lazyTree: 'lazy-tree',
  lineData: 'line-data',
};

@withCustomize({
  unitCode: [
    'SPFM.ORGANIZATION.HEADER_BTN',
    'SPFM.ORGANIZATION.LIST_TREE',
    'SPFM.ORGANIZATION.LIST_PAGING',
    'SPFM.ORGANIZATION.EDIT_FORM',
  ],
})
@connect(mapStateToProps, mapDispatchToProps)
@formatterCollections({ code: ['hpfm.organization', 'entity.organization', 'hpfm.common'] })
@cacheComponent({ cacheKey: '/hpfm/hr/org/company/index' })
export default class Organization extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // tab
      curTab: TABENUM.lazyTree,
      sortType: 'asc',
      sortColumn: 'orderSeq',
    };
  }

  lineTableRef;

  componentDidMount() {
    const { fetchOrgInfo } = this.props;
    fetchOrgInfo();
  }

  @Bind()
  handleSortColumn(sortColumn, sortType) {
    this.setState(
      {
        sortColumn,
        sortType,
      },
      () => {
        this.queryLazyTree();
      }
    );
  }

  @Bind()
  handleTabChange(nextActiveTabKey) {
    this.setState({
      curTab: nextActiveTabKey,
    });
  }

  @Bind()
  handleImport() {
    openTab({
      key: `/hpfm/hr/org/company/SPFM.UNIT_POSITION.IMPORT`,
      title: 'hzero.common.organization.title.organizationImport',
      search: querystring.stringify({
        action: 'hzero.common.organization.title.organizationImport',
      }),
    });
  }

  @Bind()
  queryLazyTree(params = {}) {
    const { unitsQueryLazyTree } = this.props;
    const { sortType, sortColumn } = this.state;
    unitsQueryLazyTree({
      ...params,
      sort: sortType
        ? {
            columnKey: sortColumn,
            field: sortColumn,
            order: sortType,
          }
        : {},
      customizeUnitCode: 'SPFM.ORGANIZATION.LIST_TREE,SPFM.ORGANIZATION.EDIT_FORM',
    });
  }

  @Bind()
  handleSearchFormRef(lineTableRef) {
    this.lineTableRef = lineTableRef;
  }

  /**
   * 获取form数据
   */
  @Bind()
  handleGetFormValue() {
    const { curTab } = this.state;

    if (curTab === TABENUM.lazyTree) {
      return {};
    } else {
      const searchFormRef = this.lineTableRef?.searchFormRef?.current;
      const filterValues = isUndefined(searchFormRef)
        ? {}
        : filterNullValueObject(searchFormRef.props.form.getFieldsValue());
      return { ...filterValues };
    }
  }

  render() {
    const {
      treeDataSource,
      expandKeys,
      loadingExpandKeys,
      updateModelState,
      organizationId,
      saveEditData,
      forbidLine,
      enabledLine,
      saveAddData,
      push,
      fetchOrgInfoLoading,
      saveEditDataLoading,
      saveAddDataLoading,
      forbidLineLoading,
      enabledLineLoading,
      unitType,
      unitsQueryLine,
      lineDataSource,
      linePagination,
      unitsQueryLineLoading,
      groupName,
      customizeBtnGroup,
      customizeTable,
      customizeForm,
    } = this.props;
    const { curTab, sortType, sortColumn } = this.state;
    return (
      <React.Fragment>
        <Header title={intl.get('hpfm.organization.view.message.title').d('组织架构维护')}>
          {customizeBtnGroup({ code: 'SPFM.ORGANIZATION.HEADER_BTN' }, [
            <ExcelExportPro
              templateCode="HPFM_UNIT_EXPORT"
              buttonText={intl.get('hzero.common.export.new').d('(新)导出')}
              requestUrl={`${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/units/export`}
              queryParams={this.handleGetFormValue()}
              data-name="newExport"
              otherButtonProps={{
                icon: 'unarchive',
                type: 'c7n-pro',
                permissionList: [
                  {
                    code: 'hzero.organization.hr.ps.new.unit-position.list.export',
                    type: 'button',
                  },
                ],
              }}
            />,
            <CommonImport
              prefixPatch="/hpfm"
              data-name="newImport"
              businessObjectTemplateCode="SPFM.UNIT_POSITION.IMPORT"
              buttonText={intl.get('hzero.common.button.import.new').d('(新)导入')}
              buttonProps={{
                permissionList: [
                  {
                    code: `hzero.organization.hr.ps.new.unit-position.list.import`,
                    type: 'button',
                    meaning: '(新)导入',
                  },
                ],
              }}
            />,
            <ExcelExport
              requestUrl={`${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/units/export`}
              queryParams={this.handleGetFormValue()}
              data-name="export"
              otherButtonProps={{
                icon: 'unarchive',
                type: 'c7n-pro',
                permissionList: [
                  {
                    code: 'hzero.organization.hr.ps.unit-position.list.export',
                    type: 'button',
                  },
                ],
              }}
            />,
            <PermissionButton
              type="c7n-pro"
              icon="archive"
              data-name="import"
              onClick={this.handleImport}
              permissionList={[
                {
                  code: `hzero.organization.hr.ps.unit-position.list.import`,
                  type: 'button',
                  meaning: '导入',
                },
              ]}
            >
              {intl.get('hzero.common.button.import').d('导入')}
            </PermissionButton>,
          ])}
        </Header>
        <Content>
          <p className={styles['hpfm-organization-title']}>
            <span />
            {intl
              .get('hpfm.organization.view.message.tips', { name: groupName })
              .d(`当前正在为「${groupName}」集团，分配组织`)}
          </p>
          <Tabs animated={false} activeKey={curTab} onChange={this.handleTabChange}>
            <Tabs.TabPane
              key={TABENUM.lazyTree}
              tab={intl.get('hpfm.organization.view.title.lazyTree').d('树形结构')}
            >
              <LazyTree
                sortType={sortType}
                customizeH0Form={customizeForm}
                sortColumn={sortColumn}
                onSortColumn={this.handleSortColumn}
                loadData={this.queryLazyTree}
                dataSource={treeDataSource}
                expandKeys={expandKeys}
                loadingExpandKeys={loadingExpandKeys}
                updateModelState={updateModelState}
                organizationId={organizationId}
                push={push}
                saveEditData={saveEditData}
                forbidLine={forbidLine}
                enabledLine={enabledLine}
                saveAddData={saveAddData}
                fetchOrgInfoLoading={fetchOrgInfoLoading}
                saveEditDataLoading={saveEditDataLoading}
                saveAddDataLoading={saveAddDataLoading}
                forbidLineLoading={forbidLineLoading}
                enabledLineLoading={enabledLineLoading}
                unitType={unitType}
              />
            </Tabs.TabPane>
            <Tabs.TabPane
              key={TABENUM.lineData}
              tab={intl.get('hpfm.organization.view.title.lienData').d('分页结构')}
            >
              <LineData
                customizeForm={customizeForm}
                customizeTable={customizeTable}
                organizationId={organizationId}
                unitType={unitType}
                dataSource={lineDataSource}
                pagination={linePagination}
                unitsQueryLine={unitsQueryLine}
                saveEditData={saveEditData}
                saveAddData={saveAddData}
                forbidLine={forbidLine}
                enabledLine={enabledLine}
                push={push}
                onRef={this.handleSearchFormRef}
                queryLoading={unitsQueryLineLoading}
                saveEditDataLoading={saveEditDataLoading}
                forbidLineLoading={forbidLineLoading}
                enabledLineLoading={enabledLineLoading}
                saveAddDataLoading={saveAddDataLoading}
              />
            </Tabs.TabPane>
          </Tabs>
        </Content>
      </React.Fragment>
    );
  }
}

function mapStateToProps({ loading, organization }) {
  const {
    lineDataSource,
    linePagination,
    treeDataSource,
    expandKeys,
    loadingExpandKeys,
    unitType,
    groupName,
  } = organization;
  return {
    unitType,
    treeDataSource,
    // lazyTreeLoading 由组件的state 存储, 应该是可以同时更新多个子组织的
    // lazyTreeLoading: loading.effects['organization/unitsQueryLazyTree'],
    saveEditDataLoading: loading.effects['organization/saveEditData'],
    saveAddDataLoading: loading.effects['organization/saveAddData'],
    forbidLineLoading: loading.effects['organization/forbidLine'],
    enabledLineLoading: loading.effects['organization/enabledLine'],
    unitsQueryLineLoading: loading.effects['organization/unitsQueryLine'],
    fetchOrgInfoLoading: loading.effects['organization/fetchOrgInfo'],
    expandKeys,
    loadingExpandKeys,
    lineDataSource,
    linePagination,
    organizationId: getCurrentOrganizationId(),
    groupName,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    fetchOrgInfo(payload) {
      return dispatch({
        type: 'organization/fetchOrgInfo',
        payload,
      });
    },
    unitsQueryLazyTree(payload) {
      return dispatch({
        type: 'organization/unitsQueryLazyTree',
        payload,
      });
    },
    saveEditData(payload) {
      return dispatch({
        type: 'organization/saveEditData',
        payload,
      });
    },
    forbidLine(payload) {
      return dispatch({
        type: 'organization/forbidLine',
        payload,
      });
    },
    enabledLine(payload) {
      return dispatch({
        type: 'organization/enabledLine',
        payload,
      });
    },
    saveAddData(payload) {
      return dispatch({
        type: 'organization/saveAddData',
        payload,
      });
    },
    unitsQueryLine(payload) {
      return dispatch({
        type: 'organization/unitsQueryLine',
        payload,
      });
    },
    updateModelState(payload) {
      return dispatch({
        type: 'organization/updateState',
        payload,
      });
    },
    push(loc) {
      dispatch(routerRedux.push(loc));
    },
  };
}
