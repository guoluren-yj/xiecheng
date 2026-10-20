/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-02-16 21:25:38
 * @LastEditors: yanglin
 * @LastEditTime: 2024-04-02 17:39:44
 */
import React, { useContext } from 'react';
import notification from 'utils/notification';
import { Table, Select } from 'choerodon-ui/pro';

import { Store } from '../stores';
import { deleteTemplateDimensionLines } from '@/services/forecastTemplateDefService';

const FsdynamicColConfig = function FsdynamicColConfig() {
  const { fsListDs, lookupAgain } = useContext(Store);

  // 删除采购申请行
  const handleLineDelete = () => {
    const { selected } = fsListDs;
    const deleUpdateArr = selected.filter(ele => ele.get('templateDimensionId'));
    if (deleUpdateArr.length > 0) {
      const deleteLine = deleUpdateArr?.map(ele => ele.toJSONData());
      deleteTemplateDimensionLines(deleteLine).then(res => {
        if (res && !res.failed) {
          fsListDs.unSelectAll();
          fsListDs.clearCachedSelected();
          lookupAgain();
          notification.success();
        }
      });
    } else {
      fsListDs.remove(selected);
    }
  };

  const optionRenderer = ({ record }) => (
    <div style={{ width: '100%' }}>{record.get('meaning')}</div>
  );

  const lineColumns = [
    {
      name: 'dimensionCode',
      width: 150,
      editor: () => <Select name="dimensionCode" optionRenderer={optionRenderer} />,
    },
    { name: 'dimensionCodeMeaning', width: 150, editor: true },
    { name: 'dimensionValue', width: 100, editor: true },
    { name: 'dimensionSeq', width: 100, editor: true },
    // {
    //   name: 'detailFeedbackFlag',
    //   width: 150,
    //   editor: (record) =>
    //     ['SUM_BY_YEAR', 'SUM_BY_MONTH', 'SUM_BY_WEEK', 'SUM_BY_DAY'].includes(
    //       record.get('dimensionCode')?.value
    //     ),
    // },
    {
      name: 'sumWithinDimension',
      width: 150,
      editor: record => record.get('dimensionCode')?.value === 'DAY',
    },
  ];

  return (
    <Table
      dataSet={fsListDs}
      columns={lineColumns}
      buttons={[
        [
          'add',
          {
            name: 'add',
            onClick: () => {
              fsListDs.create();
            },
          },
        ],
        [
          'delete',
          {
            name: 'delete',
            onClick: () => handleLineDelete(),
          },
        ],
      ]}
    />
  );
};

export default FsdynamicColConfig;
