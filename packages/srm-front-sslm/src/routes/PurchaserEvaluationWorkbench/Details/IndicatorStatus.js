/**
 * @Author: 杨一昊 yihao.yang@going-link.com
 * @Date: 2023-02-16 15:18:57
 * @FilePath: /srm-front-sslm/src/routes/PurchaserEvaluationWorkbench/Details/IndicatorStatus.js
 * @Copyright (c) 2023 by ZhenYun, All Rights Reserved.
 */
/*
 * @Date: 2023-02-15 09:44:27
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { Fragment, useMemo, useEffect } from 'react';
import { Table, DataSet } from 'choerodon-ui/pro';
import { renderStatus } from '@/routes/components/utils';
import { yesOrNoRender } from 'utils/renderer';
import { getIndicatorStatusDS } from '../stores/getIndicatorStatusDS';

const IndicatorStatus = ({ dataSource = [], indicatorType, customizeTable, customizeCode }) => {
  const dataSet = useMemo(() => new DataSet(getIndicatorStatusDS()), []);

  useEffect(() => {
    dataSet.loadData(dataSource);
  }, []);

  const columns = [
    {
      name: 'completeFlag',
      width: 100,
      renderer: renderStatus,
    },
    {
      name: 'realName',
      width: 100,
    },
    {
      name: 'indicatorName',
      width: 100,
    },
    {
      name: 'respWeight',
      width: 100,
      align: 'right',
    },
    {
      name: 'defaultScore',
      width: 80,
      align: 'right',
    },
    {
      name: 'isStandard',
      width: 100,
      renderer: ({ value }) => yesOrNoRender(value),
      hidden: indicatorType !== 'TICK',
    },
    {
      name: 'isVeto',
      width: 100,
      renderer: ({ value }) => yesOrNoRender(value),
      hidden: indicatorType !== 'VETO',
    },
    {
      name: 'indOptName',
      width: 100,
      hidden: indicatorType !== 'OPT',
    },
    {
      name: 'score',
      width: 60,
      align: 'right',
    },
    {
      name: 'scoreAttachmentUuid',
      width: 120,
    },
    {
      name: 'siteLocation',
      width: 120,
    },
  ];
  return (
    <Fragment>
      {customizeTable(
        {
          code: customizeCode,
        },
        <Table
          dataSet={dataSet}
          columns={columns}
          style={{ maxHeight: 400 }}
          customizable
          customizedCode="sslm-purchaser-evaluation-workbench-assessmentInfo" // 没有个性化编码用这种方式实现配置
        />
      )}
    </Fragment>
  );
};

export default IndicatorStatus;
