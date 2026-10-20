import React, { useContext, useMemo, useEffect, useCallback } from 'react';
import { Button } from 'choerodon-ui/pro';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';

import SearchBarTable from '_components/SearchBarTable';
import { observer } from 'mobx-react';

import StatusTag from '../../../PPAPTemplate/components/StatusTag';
import { Store } from '../stores';
import type { StoreValueType } from '../stores';
import type { ActiveKey } from '../../utils/type';
import { StageListCode, StageSearchCode, TagColor } from '../../utils/type';
import { dateRangeTransform } from '../../../../utils/utils';

interface StageTableProps {
  activeKey: ActiveKey,
};

const StageTable = (props: StageTableProps) => {
  const { activeKey } = props;
  const { dsMap, customizeTable, handleRecordInit, handleToDetail, remoteProps } = useContext(Store) as StoreValueType;
  const tableDs = useMemo(() => dsMap[activeKey], [dsMap, activeKey]);

  useEffect(() => {
    handleRecordInit(activeKey);
  }, [activeKey, handleRecordInit]);

  const columns: any = useMemo(() => {
    return [
      {
        name: 'stageStatus',
        width: 120,
        renderer: ({ text, value, record }) => {
          const statusTag = <StatusTag value={text} flag color={TagColor[value] || 'success'} />;
          return remoteProps.process ? remoteProps.process('SQAM_PPAPWORKBENCH_SUP_LIST_CUX_STAGE_STATUS_RENDERER', statusTag, { text, value, record, TagColor, StatusTag }) : statusTag;
        }
      },
      {
        name: 'sequence',
        width: 100,
      },
      {
        name: 'projectNum',
        width: 200,
      },
      {
        name: 'projectName',
        width: 120,
      },
      {
        name: 'stageNum',
        width: 150,
        renderer: ({ value, record }) => (
          <Button
            funcType={FuncType.link}
            color={ButtonColor.primary}
            style={{ userSelect: 'text' }}
            onClick={() => handleToDetail(record?.get('projectHeaderId'), 'view', 'stage-all', record?.get('stageNum'), record?.get('projectType'))}
          >
            {value}
          </Button>
        ),
      },
      {
        name: 'stageName',
        width: 120,
      },
      {
        name: 'stageOpenTypeMeaning',
        width: 160,
      },
      {
        name: 'stageCloseTypeMeaning',
        width: 160,
      },
      {
        name: 'closeApproveMethodMeaning',
        width: 160,
      },
      {
        name: 'closeApproveTypeMeaning',
        width: 160,
      },
      {
        name: 'openExpectDate',
        width: 150,
      },
      {
        name: 'closeExpectDate',
        width: 150,
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
        name: 'openDate',
        width: 150,
      },
      {
        name: 'closeDate',
        width: 150,
      },
      {
        name: 'documentsCompletedPercent',
        width: 110,
      },
    ];
  }, [handleToDetail]);

  const handleFieldChange = useCallback(({ value, name, record }) => {
    if (name === 'creationDateRange') {
      record.set('creationDate', dateRangeTransform(value, true));
    }
  }, []);

  return (
    <div style={{ height: 'calc(100vh - 260px)' }}>
      {customizeTable(
        { code: StageListCode[activeKey] },
        <SearchBarTable
          cacheState
          customizable
          dataSet={tableDs}
          columns={columns}
          searchCode={StageSearchCode[activeKey]}
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

export default observer(StageTable);
