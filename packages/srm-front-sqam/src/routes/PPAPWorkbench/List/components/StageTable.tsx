import React, { useContext, useMemo, useEffect, useCallback } from 'react';
import { Button } from 'choerodon-ui/pro';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';

import intl from 'utils/intl';
import SearchBarTable from '_components/SearchBarTable';
import { Button as PermissionButton } from 'components/Permission';
import { observer } from 'mobx-react';

import StatusTag from '../../../PPAPTemplate/components/StatusTag';
import { Store } from '../stores';
import type { StoreValueType } from '../stores';
import { StageListCode, StageSearchCode, TagColor, ActiveKey } from '../../utils/type';
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

  const handleClickNum = useCallback((record) => {
    const projectHeaderId = record?.get('projectHeaderId');
    const projectType = record?.get('projectType');
    const stageNum = record?.get('stageNum');
    if (activeKey === ActiveKey.StageCheck) {
      handleToDetail(projectHeaderId, 'check', 'stage-check', stageNum, projectType);
    } else {
      handleToDetail(projectHeaderId, 'view', 'stage-all', stageNum, projectType);
    }
  }, [handleToDetail, activeKey]);

  const columns: any = useMemo(() => {
    return [
      {
        name: 'stageStatus',
        width: 120,
        renderer: ({ text, value, record }) => {
          const statusTag = <StatusTag value={text} flag color={TagColor[value] || 'success'} />;
          return remoteProps.process ? remoteProps.process('SQAM_PPAPWORKBENCH_LIST_CUX_STAGE_STATUS_RENDERER', statusTag, { text, value, record, TagColor, StatusTag }) : statusTag;
        }
      },
      {
        name: 'sequence',
        width: 100,
      },
      activeKey === ActiveKey.StageAll && {
        name: 'operate',
        width: 60,
        renderer: ({ record }) => [
          ['UNUPLOADED'].includes(record?.get('stageStatus')) && record?.get('approvalAuthFlag') === '1' && (
            <PermissionButton
              type="c7n-pro"
              funcType={FuncType.link}
              color={ButtonColor.primary}
              onClick={() => handleToDetail(record?.get('projectHeaderId'), 'check', 'stage-check', record?.get('stageNum'), record?.get('projectType'))}
              permissionList={[
              ]}
            >
              {intl.get('hzero.common.button.sstaApprove').d('审核')}
            </PermissionButton>
          ),
          ['MANUAL'].includes(record?.get('stageOpenType')) && ['NOT_STARTED'].includes(record?.get('stageStatus')) && (
            <PermissionButton
              type="c7n-pro"
              funcType={FuncType.link}
              color={ButtonColor.primary}
              onClick={() => handleToDetail(record?.get('projectHeaderId'), 'edit', 'stage-edit', record?.get('stageNum'), record?.get('projectType'))}
              permissionList={[
              ]}
            >
              {intl.get('sqam.ppap.model.btn.open').d('开启')}
            </PermissionButton>
          ),
          ['IN_PROGRESS'].includes(record?.get('stageStatus')) && ['MANUAL'].includes(record?.get('stageCloseType')) && (
            <PermissionButton
              type="c7n-pro"
              funcType={FuncType.link}
              color={ButtonColor.primary}
              onClick={() => handleToDetail(record?.get('projectHeaderId'), 'edit', 'stage-edit', record?.get('stageNum'), record?.get('projectType'))}
              permissionList={[
              ]}
            >
              {intl.get('hzero.common.btn.close').d('关闭')}
            </PermissionButton>
          ),
          ['CLOSED'].includes(record?.get('stageStatus')) && !['CLOSED'].includes(record?.get('projectStatus')) && (
            <PermissionButton
              type="c7n-pro"
              funcType={FuncType.link}
              color={ButtonColor.primary}
              onClick={() => handleToDetail(record?.get('projectHeaderId'), 'edit', 'stage-edit', record?.get('stageNum'), record?.get('projectType'))}
              permissionList={[
                {
                  code: `srm.sqam.ppap.workbench.button.stageChange`,
                  type: 'button',
                },
              ]}
            >
              {intl.get('sqam.ppap.model.btn.change').d('变更')}
            </PermissionButton>
          ),
        ].filter((v) => v),
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
            onClick={() => handleClickNum(record)}
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
  }, [handleToDetail, handleClickNum, activeKey]);

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
