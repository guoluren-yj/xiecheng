/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-02-16 21:25:38
 * @LastEditors: yanglin
 * @LastEditTime: 2024-04-02 17:37:17
 */
import React, { useContext } from 'react';
import notification from 'utils/notification';
import { Table, Select, Modal } from 'choerodon-ui/pro';
import intl from 'utils/intl';

import { Store } from '../stores';
import { deleteTemplateDimensionLines } from '@/services/forecastTemplateDefOrgService';

// const { TableRow } = Table;
const FsdynamicColConfig = function FsdynamicColConfig() {
  const { fsListDs, lookupAgain, changeFlag } = useContext(Store);

  // 删除采购申请行
  const handleLineDelete = () => {
    const { selected } = fsListDs;
    const deleUpdateArr = selected.filter((ele) => ele.get('templateDimensionId'));
    if (deleUpdateArr.length > 0) {
      Modal.confirm({
        title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
        children: (
          <div>
            {intl.get('hzero.c7nProUI.DataSet.delete_selected_row_confirm').d('确认删除选中行？')}
          </div>
        ),
        onOk: async () => {
          const deleteLine = deleUpdateArr.map((ele) => ele.toJSONData());
          await deleteTemplateDimensionLines(deleteLine).then((res) => {
            if (res && !res.failed) {
              fsListDs.unSelectAll();
              fsListDs.clearCachedSelected();
              lookupAgain();
              notification.success();
            }
          });
        },
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
      width: 250,
      editor: () =>
        !changeFlag ? <Select name="dimensionCode" optionRenderer={optionRenderer} /> : false,
    },
    { name: 'dimensionCodeMeaning', width: 200, editor: !changeFlag },
    { name: 'dimensionValue', width: 150, editor: !changeFlag },
    { name: 'dimensionSeq', width: 150, editor: true },
    {
      name: 'sumWithinDimension',
      width: 150,
      editor: (record) => record.get('dimensionCode')?.value === 'DAY',
    },
  ];

  // const renderDragRow = (props) => {
  //   // eslint-disable-next-line no-param-reassign
  //   delete props.dragColumnAlign;
  //   return <TableRow {...props} />;
  // };

  return (
    <Table
      dataSet={fsListDs}
      columns={lineColumns}
      customizedCode="sprm_forcast_temp_tenant_fsdynamicCol"
      selectionMode={!changeFlag ? 'rowbox' : 'none'}
      buttons={
        !changeFlag
          ? [
              [
                'add',
                {
                  name: 'add',
                  onClick: () => {
                    fsListDs.create({ fieldType: 'EXPAND' });
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
            ]
          : []
      }
    />
  );
};

export default FsdynamicColConfig;
