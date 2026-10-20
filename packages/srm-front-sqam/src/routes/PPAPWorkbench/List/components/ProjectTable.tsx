import React, { useContext, useMemo, useEffect, useCallback } from 'react';
import { Button } from 'choerodon-ui/pro';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { observer } from 'mobx-react';

import intl from 'utils/intl';
import SearchBarTable from '_components/SearchBarTable';
import { Button as PermissionButton } from 'components/Permission';
import { getResponse } from 'utils/utils';
// import MultiTextFilter from '../../../components/MultiTextFilter';
import StatusTag from '../../../PPAPTemplate/components/StatusTag';
import Process from './Process';
import ExecuteProcess from './ExecuteProcess';
import { Store } from '../stores';
import type { StoreValueType } from '../stores';
// import type { ActiveKey } from '../../utils/type';
import { ProjectListCode, ProjectSearchCode, ActiveKey, TagColor } from '../../utils/type';
import { dateRangeTransform } from '../../../../utils/utils';
import { copyProject, reSyncProject } from '../../utils/api';
import styles from './index.less';
import { statusTagRender } from '../../../../components/StatusTag';

interface ProjectTableProps {
  activeKey: ActiveKey,
};

const ProjectTable = (props: ProjectTableProps) => {
  const { activeKey } = props;
  const { dsMap, customizeTable, handleRecordInit, handleToDetail } = useContext(Store) as StoreValueType;
  const tableDs = useMemo(() => dsMap[activeKey], [dsMap, activeKey]);

  useEffect(() => {
    handleRecordInit(activeKey);
  }, [activeKey, handleRecordInit]);

  const handleClickNum = useCallback((record) => {
    const projectHeaderId = record?.get('projectHeaderId');
    const projectType = record?.get('projectType');
    if (activeKey === ActiveKey.ProjectMaintain) {
      // 点击了可维护
      handleToDetail(projectHeaderId, 'edit', 'project-edit', undefined, projectType);
    } else if (activeKey === ActiveKey.ProjectApproval) {
      // 可审核
      handleToDetail(projectHeaderId, 'check', 'project-check', undefined, projectType);
    } else if (activeKey === ActiveKey.ProjectProgress) {
      // 进行中
      handleToDetail(projectHeaderId, 'view', 'project-all', undefined, projectType);
    } else {
      handleToDetail(projectHeaderId, 'view', 'project-all', undefined, projectType);
    }
  }, [handleToDetail, activeKey]);

  const handleCopy = useCallback(async (record) => {
    const res = getResponse(await copyProject(record?.get('projectHeaderId'), ProjectListCode[activeKey]));
    if (!res) return;
    const id = res?.projectHeaderId;
    if (id) handleToDetail(id, 'edit', 'project-edit', undefined, record?.get('projectType'));
  }, [handleToDetail, activeKey]);

  const handleReSync = useCallback(async (record) => {
    const res = getResponse(await reSyncProject(record.toJSONData()));
    if (!res) return;
    tableDs.query();
  }, [tableDs]);

  const columns: any = useMemo(() => {
    return [
      {
        name: 'projectStatus',
        width: 120,
        renderer: ({ text, value }) => (
          <StatusTag value={text} flag color={TagColor[value] || 'success'} />
        ),
      },
      activeKey === ActiveKey.ProjectAll && {
        name: 'operate',
        width: 140,
        renderer: ({ record }) => {
          const { syncStatus, projectStatus } = record?.get(['syncStatus', 'projectStatus']) || {};
          const btns = [
            ['NEW', 'PUBLISH_REJECTED'].includes(record?.get('projectStatus')) && !['ITEM'].includes(record?.get('projectType')) && (
              <PermissionButton
                type="c7n-pro"
                funcType={FuncType.link}
                color={ButtonColor.primary}
                onClick={() => handleToDetail(record?.get('projectHeaderId'), 'edit', undefined, undefined, record?.get('projectType'))}
                permissionList={[
                ]}
              >
                {intl.get('hzero.common.button.edit').d('编辑')}
              </PermissionButton>
            ),
            ['PUBLISH_COMFIRMING', 'CLOSE_COMFIRM_FUNCTION'].includes(record?.get('projectStatus')) && !['ITEM'].includes(record?.get('projectType')) && record?.get('approvalAuthFlag') === '1' && (
              <PermissionButton
                type="c7n-pro"
                funcType={FuncType.link}
                color={ButtonColor.primary}
                onClick={() => handleToDetail(record?.get('projectHeaderId'), 'check', undefined, undefined, record?.get('projectType'))}
                permissionList={[
                ]}
              >
                {intl.get('hzero.common.button.sstaApprove').d('审核')}
              </PermissionButton>
            ),
            ['PUBLISHED', 'CLOSE_REJECTED'].includes(record?.get('projectStatus')) && !['ITEM'].includes(record?.get('projectType')) && (
              <PermissionButton
                type="c7n-pro"
                funcType={FuncType.link}
                color={ButtonColor.primary}
                onClick={() => handleToDetail(record?.get('projectHeaderId'), 'check', undefined, undefined, record?.get('projectType'))}
                permissionList={[
                ]}
              >
                {intl.get('hzero.common.btn.close').d('关闭')}
              </PermissionButton>
            ),
            ['PUBLISHED', 'CLOSE_REJECTED'].includes(record?.get('projectStatus')) && (
              <PermissionButton
                type="c7n-pro"
                funcType={FuncType.link}
                color={ButtonColor.primary}
                onClick={() => handleToDetail(record?.get('projectHeaderId'), 'change', undefined, undefined, record?.get('projectType'))}
                permissionList={[
                  {
                    code: `srm.sqam.ppap.workbench.button.projectChange`,
                    type: 'button',
                  },
                ]}
              >
                {intl.get('sqam.ppap.model.btn.change').d('变更')}
              </PermissionButton>
            ),
            !['ITEM'].includes(record?.get('projectType')) && (
              <PermissionButton
                type="c7n-pro"
                funcType={FuncType.link}
                color={ButtonColor.primary}
                onClick={() => handleCopy(record)}
                permissionList={[
                    {
                      code: `srm.sqam.ppap.workbench.button.copy`,
                      type: 'button',
                    },
                  ]}
              >
                {intl.get('hzero.common.button.copy').d('复制')}
              </PermissionButton>
            ),
            ['UNSYNCHRONIZED', 'SYNC_FAILURE'].includes(syncStatus) && projectStatus === 'CLOSED' && (
              <PermissionButton
                type="c7n-pro"
                funcType={FuncType.link}
                color={ButtonColor.primary}
                onClick={() => handleReSync(record)}
                permissionList={[
                  {
                    code: `srm.sqam.ppap.workbench.button.reSync`,
                    type: 'button',
                  },
                ]}
              >
                {intl.get('hzero.common.button.sync').d('同步')}
              </PermissionButton>
            ),
          ].filter((v) => v);
          if (btns.length === 0) return null;
          return (<div className={styles['sqam-column-btn-wrapper']}>{btns}</div>);
        },
      },
      {
        name: 'projectNum',
        width: 180,
        renderer: ({ value, record }) => (
          <Button
            funcType={FuncType.link}
            color={ButtonColor.primary}
            style={{ userSelect: 'text' }}
            onClick={() => handleClickNum(record)}
          >
            {value}
          </Button>
        ),
      },
      {
        name: 'projectName',
        width: 120,
      },
      {
        name: 'companyName',
        width: 240,
      },
      {
        name: 'supplierCompanyName',
        width: 240,
      },
      activeKey === ActiveKey.ProjectAll && {
        name: 'process',
        tooltip: 'none',
        renderer: ({ record }) => (
          <Process hide={record?.get('projectStatus') === 'NEW'} stageProcess={record?.get('stageProcess')} />
        ),
        width: 350,
      },
      activeKey === ActiveKey.ProjectAll && {
        name: 'executeProcess',
        tooltip: 'none',
        renderer: ({ record }) => (
          <ExecuteProcess hide={record?.get('projectStatus') === 'NEW'} stageProcess={record?.get('stageProcess')} />
        ),
      },
      {
        name: 'itemCode',
      },
      {
        name: 'createName',
        // width: 120,
      },
      {
        name: 'creationDate',
        width: 150,
      },
      {
        name: 'specification',
      },
      {
        name: 'model',
      },
      activeKey === ActiveKey.ProjectAll && {
        name: 'alterStatus',
        width: 120,
        renderer: ({ text, value }) => value && (
          <StatusTag value={text} flag color={TagColor[value] || 'success'} />
        ),
      },
      {
        name: 'syncStatus',
        width: 150,
        renderer: statusTagRender,
      },
      {
        name: 'syncResponseMsg',
        width: 180,
      },
    ];
  }, [handleToDetail, handleClickNum, activeKey, handleCopy, handleReSync]);

  const handleFieldChange = useCallback(({ value, name, record }) => {
    if (name === 'creationDateRange') {
      record.set('creationDate', dateRangeTransform(value, true));
    }
  }, []);

  return (
    <div style={{ height: 'calc(100vh - 260px)' }}>
      {customizeTable(
        { code: ProjectListCode[activeKey] },
        <SearchBarTable
          cacheState
          customizable
          dataSet={tableDs}
          columns={columns}
          searchCode={ProjectSearchCode[activeKey]}
          style={{ maxHeight: 'calc(100% - 22px)' }}
          pagination={{ maxPageSize: 1000, pageSizeOptions: ['10', '20', '50', '100', '500', '1000'] }}
          searchBarConfig={{
            onFieldChange: handleFieldChange,
            fieldProps: {
              creationDate: {
                defaultValue: ({ record }) => dateRangeTransform(record.get('creationDateRange'), true),
                dynamicProps: {
                  disabled: ({ record }) =>
                    record.get('creationDateRange') && record.get('creationDateRange') !== 'ALL TIME',
                },
              },
            },
          }}
        />
      )}
    </div>
  );
};

export default observer(ProjectTable);
