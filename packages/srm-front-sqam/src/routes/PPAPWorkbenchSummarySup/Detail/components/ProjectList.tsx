// 项目计划列表
import React, { Fragment, useMemo, useContext } from 'react';
import { Table, Tooltip } from 'choerodon-ui/pro';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';
import { observer } from 'mobx-react';
import intl from 'utils/intl';

import yanqiImg from '@/assets/yanqi.svg';

import { compareTime } from '../../../PPAPTemplate/utils/utils';
import StatusTag from '../../../PPAPTemplate/components/StatusTag';
import { TagColor, DetailProjectStageListCode } from '../../utils/type';
import { Store } from '../stores';
import type { StoreValueType } from '../stores';


const ProjectList = () => {
  const { stageLineDs, customizeTable } = useContext<StoreValueType>(Store);
  // const { projectStatus } = headerDs.current?.get(['projectStatus']) || {};

  // const editorFlag = useMemo(() => {
  //   return createFlag || (['NEW', 'PUBLISH_REJECTED'].includes(projectStatus) && !editFlag);
  // }, [createFlag, projectStatus, editFlag]);

  const columns: ColumnProps[] = useMemo(() => {
    return [
      {
        name: 'stageStatus',
        renderer: ({ text, record, value }) => {
          const closeDate = record?.get('closeDate');
          const flag = compareTime(closeDate);
          return (
            <div>
              <StatusTag value={text} flag color={TagColor[value] || 'success'} icon={flag && <Tooltip title={intl.get('sqam.ppap.view.message.overTimeTips').d('当前已超过预计完成时间')}><img src={yanqiImg} alt="img" style={{ margin: '-2px 0 0 4px' }} /></Tooltip>} />
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
        // editor: editorFlag,
        width: 150,
      },
      {
        name: 'closeExpectDate',
        // editor: editorFlag,
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
        // editor: editorFlag,
        width: 240,
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
