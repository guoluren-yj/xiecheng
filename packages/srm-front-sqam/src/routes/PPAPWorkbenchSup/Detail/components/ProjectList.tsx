// 项目计划列表
import React, { Fragment, useMemo, useContext } from 'react';
import { Table, Tooltip } from 'choerodon-ui/pro';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';
import { observer } from 'mobx-react';
import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';

import yanqiImg from '@/assets/yanqi.svg';

import { compareTime } from '../../../PPAPTemplate/utils/utils';
import StatusTag from '../../../PPAPTemplate/components/StatusTag';
import { TagColor, DetailProjectStageListCode } from '../../utils/type';
import { Store } from '../stores';
import type { StoreValueType } from '../stores';


const ProjectList = () => {
  const { stageLineDs, customizeTable, remoteProps } = useContext<StoreValueType>(Store);


  const columns: ColumnProps[] = useMemo(() => {
    return [
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
        width: 240,
      },
      {
        name: 'supplyFlag',
        renderer: ({ value }) => yesOrNoRender(Number(value || 0)),
        width: 100,
      },
    ];
  }, []);

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
