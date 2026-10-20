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
import DocumentTable from './components/DocumentTable';
import StageTable from './components/StageTable';
import { ActiveKey, ListTabsCustCode, ListTableBtnCode } from '../utils/type';
import { formatDynamicBtns } from '../../utils';
import { transformQselectDate } from '../../../utils/utils';
// import styles from '../Detail/index.less';

const { TabPane, TabGroup } = Tabs;
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
    remoteProps,
  } = useContext(Store) as StoreValueType;

  const tableDs = dsMap[activeKey];
  const { selected } = tableDs;

  const getQueryParams = useCallback(() => {
    const queryData = tableDs.queryDataSet?.current?.toData() || {};
    return filterNullValueObject({
      ...queryData,
      ...tableDs.queryParameter,
      ...transformQselectDate(queryData, { creationDateRange: 'creationDate' }),
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
          templateCode: 'SRM_C_SQAM_ACCESS_PROJECT_HEADER_EXPORT',
          allBody: true,
          method: 'POST',
          requestUrl: `${apiPrefix}/access-project-headers/list/export`,
          queryParams: isEmpty(selected) ? getQueryParams : getSelectedKeys,
          otherButtonProps: {
            funcType: 'flat',
            permissionList: [{
              code: `srm.sqam.ppap.workbench.button.list-export`,
              type: 'button',
            }],
          },
        },
      },
    ];
    const cuxButuons = remoteProps.process ? remoteProps.process('SQAM_PPAPWORKBENCH_LIST_CUX_DOCUMENTLIST_BUTTON', btns, { activeKey, tableDs, selected, getQueryParams, getSelectedKeys }) : btns;
    return formatDynamicBtns(cuxButuons);
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

  const documentColumns = useMemo(() => {
    return [
      {
        key: ActiveKey.DocumentCheck,
        tab: intl.get(`sqam.ppap.view.title.check`).d('待审核'),
      },
      {
        key: ActiveKey.DocumentPending,
        tab: intl.get(`sqam.ppap.view.title.pending`).d('待处理'),
      },
      {
        key: ActiveKey.DocumentAll,
        tab: intl.get(`sqam.ppap.view.title.all`).d('全部'),
      },
    ];
  }, []);

  const stageColumns = useMemo(() => {
    return [
      {
        key: ActiveKey.StageCheck,
        tab: intl.get(`sqam.ppap.view.title.check`).d('待审核'),
      },
      {
        key: ActiveKey.StageAll,
        tab: intl.get(`sqam.ppap.view.title.all`).d('全部'),
      },
    ];
  }, []);

  return (
    <Fragment>
      <Header title={intl.get('sqam.ppap.view.title.ppapWorkbench').d('PPAP工作台')}>
        {customizeBtnGroup(
          { code: ListTableBtnCode, pro: true },
          <DynamicButtons unitCode={ListTableBtnCode} buttons={buttons} maxNum={5} defaultBtnType="c7n-pro" />
        )}
      </Header>
      <div>
        <Content>
          {customizeTabPane(
            {
              code: ListTabsCustCode,
              cascade: true,
            },
            <Tabs keyboard={false} activeKey={activeKey} onChange={handleTabChange}>
              <TabGroup tab={intl.get(`sqam.ppap.view.title.project`).d('项目视图')} key="project">
                {projectColumns.map(({ key, tab }) => (
                  <TabPane
                    tab={tab}
                    key={key}
                    count={dsMap[key].getState('totalCount')}
                  >
                    <ProjectTable activeKey={key} />
                  </TabPane>
                ))}
              </TabGroup>
              <TabGroup tab={intl.get(`sqam.ppap.view.title.documentdocumentView`).d('交付物视图')} key="document">
                {documentColumns.map(({ key, tab }) => (
                  <TabPane
                    tab={tab}
                    key={key}
                    count={dsMap[key].getState('totalCount')}
                  >
                    <DocumentTable activeKey={key} />
                  </TabPane>
                ))}
              </TabGroup>
              <TabGroup tab={intl.get(`sqam.ppap.view.title.stage`).d('阶段视图')} key="stage">
                {stageColumns.map(({ key, tab }) => (
                  <TabPane
                    tab={tab}
                    key={key}
                    count={dsMap[key].getState('totalCount')}
                  >
                    <StageTable activeKey={key} />
                  </TabPane>
                ))}
              </TabGroup>
            </Tabs>
          )}
        </Content>
      </div>
    </Fragment>
  );
});

const PPAPWorkbenchList = (props) => <StoreProvider {...props}><List /></StoreProvider>;

export default PPAPWorkbenchList;
