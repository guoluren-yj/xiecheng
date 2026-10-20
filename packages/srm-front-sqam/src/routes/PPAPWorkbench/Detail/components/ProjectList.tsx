// 项目计划列表
import React, { Fragment, useMemo, useContext } from 'react';
import { Table, Tooltip, DateTimePicker } from 'choerodon-ui/pro';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';
import { observer } from 'mobx-react';
import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import moment from 'moment';

import yanqiImg from '@/assets/yanqi.svg';

import StatusTag from '../../../PPAPTemplate/components/StatusTag';
import { TagColor, DetailProjectStageListCode } from '../../utils/type';
import { Store } from '../stores';
import type { StoreValueType } from '../stores';
import { compareTime } from '../../../PPAPTemplate/utils/utils';


const ProjectList = () => {
  const { stageLineDs, customizeTable, headerDs, typeFlag, createFlag, itemChangeFlag, remoteProps } = useContext<StoreValueType>(Store);
  const { projectStatus } = headerDs.current?.get(['projectStatus']) || {};

  const editFlag = useMemo(() => {
    return createFlag || (['NEW', 'PUBLISH_REJECTED'].includes(projectStatus) && !typeFlag);
  }, [createFlag, projectStatus, typeFlag]);

  const columns: ColumnProps[] = useMemo(() => {
    const normalColumns = [
      {
        name: 'stageStatus',
        renderer: ({ text, record, value }) => {
          const closeDate = record?.get('closeDate');
          const flag = compareTime(closeDate);
          const statusTag = <StatusTag value={text} flag color={TagColor[value] || 'success'} icon={flag && <Tooltip title={intl.get('sqam.ppap.view.message.overTimeTips').d('当前已超过预计完成时间')}><img src={yanqiImg} alt="img" style={{ margin: '-2px 0 0 4px' }} /></Tooltip>} />;
          const statusTagRender = remoteProps.process ? remoteProps.process('SQAM_PPAPWORKBENCH_DETAIL_CUX_PROJECT_LIST_STAGE_STATUS_RENDERER', statusTag, { text, value, record, TagColor, StatusTag, flag }) : statusTag;
          return (
            <div>
              {statusTagRender}
            </div>
          );
        },
        width: 100,
      },
      {
        name: 'sequence',
        width: 60,
      },
      {
        name: 'stageNum',
      },
      {
        name: 'stageName',
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
        name: 'openExpectDate',
        editor: editFlag || itemChangeFlag,
        width: 150,
      },
      {
        name: 'closeExpectDate',
        // @ts-ignore
        editor: (editFlag || itemChangeFlag) ? <DateTimePicker defaultTime={moment('23:59:59', 'HH:mm:ss')} /> : false,
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
        name: 'projectNum',
        width: 180,
      },
      {
        name: 'documentsCompletedPercent',
        width: 110,
      },
      {
        name: 'stageApproveOpinion',
      },
      {
        name: 'stageRemark',
        editor: editFlag,
      },
      {
        name: 'supplyFlag',
        editor: editFlag,
        renderer: ({ value }) => !editFlag && yesOrNoRender(Number(value || 0)),
        width: 100,
      },
    ];
    return remoteProps ? remoteProps.process('SQAM_PPAPWORKBENCH_DETAIL_CUX_STAGE_GRID_COLUMNS', normalColumns, { editFlag, headerDs, itemChangeFlag }) : normalColumns;
  }, [
    editFlag,
    headerDs,
    remoteProps,
    itemChangeFlag,
  ]);

  return (
    <Fragment>
      {customizeTable(
        { code: DetailProjectStageListCode },
        <Table
          columns={columns}
          dataSet={stageLineDs}
          style={{ maxHeight: 430 }}
        />
      )}
    </Fragment>

  );
};

export default observer(ProjectList);
