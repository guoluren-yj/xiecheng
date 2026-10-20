/*
 * @Descripttion: 寻源过程控制--专家组
 * @version:
 * @Author: yiping.liu<yiping.liu@going-link.com>
 * @Date: 2021-07-21 20:15:05
 * @LastEditors: yiping.liu
 */
import React, { useContext, useMemo } from 'react';
import { Table } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { isEmpty } from 'lodash';
import { observer } from 'mobx-react';

import { getResponse } from 'utils/utils';
import { TooltipButtonPro } from '@/routes/components/TooltipButton';
import styles from './index.less';
import { historyDiffRenderComp } from '../utils';
import Store from '../store';

const Expert = observer(() => {
  const {
    customizeTable,
    commonDs: { expertDs, consultationDs },
  } = useContext(Store);

  const columns = useMemo(
    () => [
      {
        name: 'expertLov',
        width: 150,
        editor: true,
        renderer: ({ record, dataSet }) =>
          historyDiffRenderComp(record, dataSet, 'rfExpert', 'loginName'),
      },
      {
        name: 'expertName',
        width: 200,
        renderer: ({ record, dataSet }) =>
          historyDiffRenderComp(record, dataSet, 'rfExpert', 'expertName'),
      },
      {
        name: 'expertRole',
        editor: true,
        renderer: ({ record, dataSet, text }) =>
          historyDiffRenderComp(record, dataSet, 'rfExpert', 'expertRole', text),
      },
      consultationDs?.current?.get('bidRuleType') === 'DIFF'
        ? {
            name: 'scoreCategory',
            editor: true,
            renderer: ({ record, dataSet, text }) =>
              historyDiffRenderComp(record, dataSet, 'rfExpert', 'scoreCategory', text),
          }
        : null,
      {
        name: 'expertType',
        renderer: ({ record, dataSet, text }) =>
          historyDiffRenderComp(record, dataSet, 'rfExpert', 'expertType', text),
      },
      {
        name: 'phone',
        renderer: ({ record, dataSet, text }) =>
          text ? historyDiffRenderComp(record, dataSet, 'rfExpert', 'phone', text, 'tel') : null,
      },
      {
        name: 'email',
        renderer: ({ record, value, dataSet }) =>
          value ? historyDiffRenderComp(record, dataSet, 'rfExpert', 'email') : null,
      },
    ],
    [consultationDs?.current]
  );

  const handleDeleteItem = (ds) => {
    const data = ds.selected;
    const flag = (ds.selected || []).find((i) => i.status !== 'add');
    if (!flag) ds.remove(data);
    if (flag) {
      ds.delete(data, {
        title: intl.get('ssrc.common.message.tip').d('提示'),
        children: intl
          .get('hzero.c7nProUI.DataSet.delete_selected_row_confirm')
          .d('确认删除选中行？'),
      }).then((res) => {
        const result = getResponse(res);
        if (result && result.success) {
          ds.unSelectAll();
          ds.query();
        }
      });
    }
  };

  const renderButtons = [
    'add',
    <TooltipButtonPro
      name="delete"
      icon="delete_sweep"
      disabled={isEmpty(expertDs.selected)}
      onClick={() => handleDeleteItem(expertDs)}
      help={intl.get('ssrc.common.view.message.expert-group-line.select.tip').d('请先勾选专家组')}
    >
      {intl.get(`hzero.common.button.batchDelete`).d('批量删除')}
    </TooltipButtonPro>,
    'save',
  ];

  return (
    <React.Fragment>
      <div className={styles['expert-table']}>
        {customizeTable(
          {
            code: 'SSRC.INQUIRY_HALL.RF_CONTROL.EXPERT.GROUP',
            dataSet: expertDs,
          },
          <Table buttons={renderButtons} dataSet={expertDs} columns={columns} />
        )}
      </div>
    </React.Fragment>
  );
});

export default Expert;
