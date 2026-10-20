import React, { useContext, useMemo, useEffect, useCallback } from 'react';
import { Button } from 'choerodon-ui/pro';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { observer } from 'mobx-react';

import SearchBarTable from '_components/SearchBarTable';
import StatusTag from '../../../PPAPTemplate/components/StatusTag';
import Process from '../../../PPAPWorkbench/List/components/Process';
import ExecuteProcess from '../../../PPAPWorkbench/List/components/ExecuteProcess';
import { Store } from '../stores';
import type { StoreValueType } from '../stores';
// import type { ActiveKey } from '../../utils/type';
import { ProjectListCode, ProjectSearchCode, ActiveKey, TagColor } from '../../utils/type';
import { dateRangeTransform } from '../../../../utils/utils';

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

  const columns: any = useMemo(() => {
    return [
      {
        name: 'projectStatus',
        width: 120,
        renderer: ({ text, value }) => (
          <StatusTag value={text} flag color={TagColor[value] || 'success'} />
        ),
      },
      {
        name: 'projectNum',
        width: 180,
        renderer: ({ value, record }) => (
          <Button
            funcType={FuncType.link}
            color={ButtonColor.primary}
            style={{ userSelect: 'text' }}
            onClick={() => handleToDetail(record?.get('projectHeaderId'), 'view', 'project-all', undefined, record?.get('projectType'))}
          >
            {value}
          </Button>
        ),
      },
      {
        name: 'projectName',
        width: 120,
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
      {
        name: 'specification',
      },
      {
        name: 'model',
      },
    ];
  }, [handleToDetail, activeKey]);

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
            editorProps: {
              projectStatus: {
                optionsFilter: (record) => !['NEW', 'CANCELED', 'PUBLISH_REJECTED', 'PUBLISH_COMFIRMING', 'PUBLISH_COMFIRM_WORKFLOW'].includes(record?.get('value')),
              },
            },
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
