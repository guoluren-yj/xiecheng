import React, { Fragment, useContext, useMemo, useCallback } from 'react';
import { Tabs } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';
import { observer } from 'mobx-react';

import intl from 'utils/intl';
import { SRM_SQAM } from '_utils/config';
import { Header, Content } from 'components/Page';
import ExcelExportPro from 'components/ExcelExportPro';
import DynamicButtons from "srm-front-boot/lib/components/DynamicButtons";
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';

import type { StoreValueType } from './stores';
import StoreProvider, { Store } from './stores';
import ProjectTable from './components/ProjectTable';
import { ActiveKey, ListTabsCustCode, ListTableBtnCode } from '../utils/type';
import { formatDynamicBtns } from '../../utils';

const { TabPane } = Tabs;
const organizationId = getCurrentOrganizationId();
const apiPrefix = `${SRM_SQAM}/v1/${organizationId}`;

const List = observer(() => {
  const {
    dsMap,
    activeKey,
    handleTabChange,
    customizeTabPane,
    customizeBtnGroup,
    handleToDetail,
  } = useContext(Store) as StoreValueType;

  const tableDs = dsMap[activeKey];
  const { selected } = tableDs;

  const getQueryParams = useCallback(() => {
    const queryData = tableDs.queryDataSet?.current?.toData() || {};
    return filterNullValueObject({
      ...queryData,
      ...tableDs.queryParameter,
    });
  }, [tableDs]);

  const getSelectedKeys = useCallback(() => {
    const { props: { primaryKey }, queryParameter } = tableDs;
    return {
      ...queryParameter,
      [`${primaryKey}s`]: selected.map((record) => record.get(primaryKey)),
    };
  }, [tableDs, selected]);

  const buttons = useMemo(() => {
    const btns = [
      {
        name: 'create',
        child: intl.get('hzero.common.button.create').d('新建'),
        btnProps: {
          type: 'c7n-pro',
          icon: 'add',
          color: 'primary',
          onClick: () => handleToDetail('create', 'create'),
        },
      },
      activeKey === ActiveKey.ProjectAll && {
        name: 'export',
        btnComp: ExcelExportPro,
        childFor: 'buttonText',
        child: isEmpty(selected)
          ? intl.get(`hzero.common.button.export`).d('导出')
          : intl.get(`hzero.common.button.exportSelect`).d('勾选导出'),
        btnProps: {
          templateCode: 'SRM_C_SQAM_ACCESS_PROJECT_HEADER_SUM_EXPORT',
          allBody: true,
          method: 'POST',
          requestUrl: `${apiPrefix}/access-project-headers/sum/list/export`,
          queryParams: isEmpty(selected) ? getQueryParams : getSelectedKeys,
          otherButtonProps: {
            funcType: 'flat',
            permissionList: [{
              code: `srm.sqam.ppap.summary.workbench.button.list-export`,
              type: 'button',
            }],
          },
        },
      },
    ];
    return formatDynamicBtns(btns);
  }, [
    selected,
    activeKey,
    handleToDetail,
    getQueryParams,
    getSelectedKeys,
  ]);

  const projectColumns = useMemo(() => {
    return [
      {
        key: ActiveKey.ProjectMaintain,
        tab: intl.get(`sqam.ppap.view.title.notStart`).d('可维护'),
      },
      {
        key: ActiveKey.ProjectApproval,
        tab: intl.get(`sqam.ppap.view.title.check`).d('待审核'),
      },
      {
        key: ActiveKey.ProjectProgress,
        tab: intl.get(`sqam.ppap.view.title.progress`).d('进行中'),
      },
      {
        key: ActiveKey.ProjectAll,
        tab: intl.get(`sqam.ppap.view.title.all`).d('全部'),
      },
    ];
  }, []);

  return (
    <Fragment>
      <Header title={intl.get('sqam.ppap.view.title.ppapWorkbenchSummary').d('PPAP汇总工作台')}>
        {customizeBtnGroup(
          { code: ListTableBtnCode, pro: true },
          <DynamicButtons buttons={buttons} maxNum={5} defaultBtnType="c7n-pro" />
        )}
      </Header>
      <Content>
        {customizeTabPane(
          {
            code: ListTabsCustCode,
            cascade: true,
          },
          <Tabs activeKey={activeKey} onChange={handleTabChange}>
            <Tabs.TabGroup key="project">
              {projectColumns.map(({ key, tab }) => (
                <TabPane
                  tab={tab}
                  key={key}
                  count={dsMap[key].getState('totalCount')}
                >
                  <ProjectTable activeKey={key} />
                </TabPane>
              ))}
            </Tabs.TabGroup>
          </Tabs>
        )}
      </Content>
    </Fragment>
  );
});

const PPAPWorkbenchList = (props) => <StoreProvider {...props}><List /></StoreProvider>;

export default PPAPWorkbenchList;
