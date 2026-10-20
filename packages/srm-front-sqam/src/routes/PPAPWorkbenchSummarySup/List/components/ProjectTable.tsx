import React, { useContext, useMemo, useEffect, useCallback } from 'react';
import { Button } from 'choerodon-ui/pro';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { observer } from 'mobx-react';

import intl from 'utils/intl';
import SearchBarTable from '_components/SearchBarTable';
import { Button as PermissionButton } from 'components/Permission';
// import MultiTextFilter from '../../../components/MultiTextFilter';
import StatusTag from '../../../PPAPTemplate/components/StatusTag';
import { Store } from '../stores';
import type { StoreValueType } from '../stores';
// import type { ActiveKey } from '../../utils/type';
import { ProjectListCode, ProjectSearchCode, ActiveKey, TagColor } from '../../utils/type';

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
    if (activeKey === ActiveKey.ProjectProgress) {
      // 进行中
      handleToDetail(projectHeaderId, 'view');
    } else {
      handleToDetail(projectHeaderId, 'view');
    }
  }, [handleToDetail, activeKey]);

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
        width: 120,
        renderer: ({ record }) => [
          ['PUBLISH_COMFIRMING', 'CLOSE_COMFIRM_FUNCTION'].includes(record?.get('projectStatus')) && record?.get('approvalAuthFlag') === '1' && (
            <PermissionButton
              type="c7n-pro"
              funcType={FuncType.link}
              color={ButtonColor.primary}
              onClick={() => handleToDetail(record?.get('projectHeaderId'), 'check')}
              permissionList={[
              ]}
            >
              {intl.get('hzero.common.button.sstaApprove').d('审核')}
            </PermissionButton>
          ),
          ['PUBLISHED'].includes(record?.get('projectStatus')) && (
            <PermissionButton
              type="c7n-pro"
              funcType={FuncType.link}
              color={ButtonColor.primary}
              onClick={() => handleToDetail(record?.get('projectHeaderId'), 'check')}
              permissionList={[
              ]}
            >
              {intl.get('hzero.common.btn.close').d('关闭')}
            </PermissionButton>
          ),
        ].filter((v) => v),
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
      {
        name: 'createName',
      },
      {
        name: 'creationDate',
        width: 150,
      },
      {
        name: 'itemCode',
      },
    ];
  }, [handleToDetail, handleClickNum, activeKey]);
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
        />
      )}
    </div>
  );
};

export default observer(ProjectTable);
