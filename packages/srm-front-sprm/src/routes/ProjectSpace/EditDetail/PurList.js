/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2024-05-14 17:49:13
 * @LastEditors: yanglin
 * @LastEditTime: 2024-05-21 15:24:06
 */
import React, { useContext } from 'react';
import { Table } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { Store } from '../commonDetail/sotreProvider';

const PurList = function PurList({ type = 'tabs', purModalDs, taskId, store }) {
  const { purListDs, customizeTable, projectId, organizationId, headerDs } =
    useContext(Store) || store;
  const dataSet = type === 'tabs' ? purListDs : purModalDs;
  const cols = [
    { name: 'virtualLineNum' },
    {
      name: 'itemId',
      renderer: ({ record }) => record.get('itemCode'),
      editor: true,
    },
    { name: 'itemName', editor: true },
    {
      name: 'categoryId',
      editor: true,
      renderer: ({ record }) => record.get('categoryName'),
    },
    { name: 'model', editor: true },
    { name: 'specifications', editor: true },
    { name: 'quantity', editor: true },
    { name: 'estimatedUnitPrice', editor: true },
    { name: 'estimatedLineAmount' },
    { name: 'unitPriceBatch', editor: true },
    { name: 'taskLevel' },
    { name: 'taskNum', editor: true, width: 180 },
    { name: 'demandDate', editor: true },
    { name: 'uomId', editor: true },
    { name: 'sourceDocument' },
    { name: 'remark', editor: true },
  ];
  return (
    <div className="content-padding">
      {type === 'tabs' && (
        <h3 className="content-title">
          {intl.get('sprm.project.title.maintainPurList').d('采购件清单维护')}
        </h3>
      )}
      {customizeTable(
        {
          code: 'SIEC.PROJECT_EDIT.PUR_LIST',
        },
        <Table
          dataSet={dataSet}
          columns={
            type !== 'tabs' ? cols.filter(e => !['taskNum', 'taskLevel'].includes(e.name)) : cols
          }
          style={{ maxHeight: `calc(100vh - 300px)` }}
          buttons={
            headerDs?.current?.get('sourcePlatform') !== 'ERP'
              ? [
                  [
                    'add',
                    {
                      name: 'add',
                      onClick: () => {
                        dataSet.create({ taskId, projectId, tenantId: organizationId }, 0);
                      },
                    },
                  ],
                  [
                    'delete',
                    {
                      name: 'delete',
                      onClick: () => {
                        const { selected } = dataSet;
                        const deleteList = selected
                          ?.filter(e => e?.get('purchaseItemId'))
                          ?.map(e => e.toJSONData());
                        headerDs.setState({
                          deletePurList: (headerDs.getState('deletePurList') || []).concat(
                            deleteList
                          ),
                        });
                        dataSet.remove(selected, true);
                      },
                    },
                  ],
                ]
              : []
          }
        />
      )}
    </div>
  );
};

export default PurList;
