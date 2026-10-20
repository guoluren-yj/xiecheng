import React, { useContext } from 'react';
import { Table, Button } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { observer } from 'mobx-react-lite';
import { Store } from '../commonDetail/sotreProvider';
import { colorTagRender } from '../commonDetail/util';

const PurList = function PurList({
  type = 'tabs',
  purModalDs,
  custTable,
  taskReqId,
  readOnly = false,
  store,
}) {
  const {
    purListDs,
    customizeTable: storeCustTable,
    projectId,
    organizationId,
    headerDs,
    projectHeaderId,
  } = useContext(Store) || store;
  const dataSet = type === 'tabs' ? purListDs : purModalDs;
  const customizeTable = type === 'tabs' ? storeCustTable : custTable;
  const cols = [
    { name: 'cancelStatus', renderer: colorTagRender },
    { name: 'virtualLineNum' },
    {
      name: 'itemId',
      renderer: ({ record }) => record.get('itemCode'),
      editor: record =>
        !readOnly && !['CANCELED', 'CANCELING'].includes(record?.get('cancelStatus')),
    },
    {
      name: 'itemName',
      editor: record =>
        !readOnly && !['CANCELED', 'CANCELING'].includes(record?.get('cancelStatus')),
    },
    {
      name: 'categoryId',
      renderer: ({ record }) => record.get('categoryName'),
      editor: record =>
        !readOnly && !['CANCELED', 'CANCELING'].includes(record?.get('cancelStatus')),
    },
    {
      name: 'model',
      editor: record =>
        !readOnly && !['CANCELED', 'CANCELING'].includes(record?.get('cancelStatus')),
    },
    {
      name: 'specifications',
      editor: record =>
        !readOnly && !['CANCELED', 'CANCELING'].includes(record?.get('cancelStatus')),
    },
    {
      name: 'quantity',
      editor: record =>
        !readOnly && !['CANCELED', 'CANCELING'].includes(record?.get('cancelStatus')),
    },
    {
      name: 'estimatedUnitPrice',
      editor: record =>
        !readOnly && !['CANCELED', 'CANCELING'].includes(record?.get('cancelStatus')),
    },
    { name: 'estimatedLineAmount' },
    {
      name: 'unitPriceBatch',
      editor: record =>
        !readOnly && !['CANCELED', 'CANCELING'].includes(record?.get('cancelStatus')),
    },
    { name: 'taskLevel' },
    {
      name: 'taskNum',
      width: 180,
      editor: record => !readOnly && record.status === 'add',
    },
    {
      name: 'demandDate',
      editor: record =>
        !readOnly && !['CANCELED', 'CANCELING'].includes(record?.get('cancelStatus')),
    },
    {
      name: 'uomId',
      editor: record =>
        !readOnly && !['CANCELED', 'CANCELING'].includes(record?.get('cancelStatus')),
    },
    { name: 'sourceDocument' },
    {
      name: 'remark',
      editor: record =>
        !readOnly && !['CANCELED', 'CANCELING'].includes(record?.get('cancelStatus')),
    },
  ];

  const deleteCancelLine = cancelType => {
    const { selected } = dataSet;
    const { meaning } = dataSet.getField('cancelStatus').getLookupData(cancelType) || {};
    selected.forEach(e => {
      e.set({ cancelStatus: cancelType, cancelStatusMeaning: meaning || cancelType });
    });
    dataSet.unSelectAll();
  };

  const CancelBtn = observer(() => {
    // 未取消，没有purchaseItemId
    const ableFlag =
      dataSet.selected?.some(
        e => e.get('cancelStatus') !== 'UNCANCELED' || !e.get('purchaseItemId')
      ) || dataSet.selected?.length === 0;
    return (
      <Button
        onClick={() => deleteCancelLine('CANCELING')}
        icon="remove_circle"
        funcType="flat"
        type="c7n-pro"
        disabled={ableFlag}
      >
        {intl.get('hzero.common.button.cancel').d('取消')}
      </Button>
    );
  });

  const RevokeBtn = observer(() => {
    const ableFlag =
      !dataSet.selected?.every(e => e.get('cancelStatus') === 'CANCELING') ||
      dataSet.selected?.length === 0;
    return (
      <Button
        onClick={() => deleteCancelLine('UNCANCELED')}
        icon="do_not_disturb_off"
        funcType="flat"
        type="c7n-pro"
        disabled={ableFlag}
      >
        {intl.get('hzero.common.button.revolve').d('撤销取消')}
      </Button>
    );
  });

  const DeleteBtn = observer(() => {
    const ableFlag =
      dataSet.selected?.some(e => e.get('purchaseItemId')) || dataSet.selected?.length === 0;
    return (
      <Button
        onClick={() => {
          const { selected } = dataSet;
          const deleteList = selected
            ?.filter(e => e.get('purchaseItemReqId'))
            ?.map(e => e.toJSONData());
          headerDs.setState({
            deletePurList: (headerDs.getState('deletePurList') || []).concat(deleteList),
          });
          dataSet.remove(selected, true);
        }}
        icon="delete"
        funcType="flat"
        type="c7n-pro"
        disabled={ableFlag}
      >
        {intl.get('hzero.common.button.delete').d('删除')}
      </Button>
    );
  });

  return (
    <div className="content-padding">
      {type === 'tabs' && (
        <h3 className="content-title">
          {intl.get('sprm.project.title.maintainPurList').d('采购件清单维护')}
        </h3>
      )}
      {customizeTable(
        {
          code: 'SIEC.PROJECT_CHANGE.PUR_LIST',
        },
        <Table
          dataSet={dataSet}
          columns={
            type !== 'tabs' ? cols.filter(e => !['taskNum', 'taskLevel'].includes(e.name)) : cols
          }
          style={{ maxHeight: `calc(100vh - 300px)` }}
          buttons={
            readOnly
              ? null
              : headerDs?.current?.get('sourcePlatform') !== 'ERP'
              ? [
                  [
                    'add',
                    {
                      name: 'add',
                      onClick: () => {
                        dataSet.create(
                          { taskReqId, projectId, projectHeaderId, tenantId: organizationId },
                          0
                        );
                      },
                    },
                  ],
                <DeleteBtn />,
                <CancelBtn />,
                <RevokeBtn />,
                ]
              : [<CancelBtn />, <RevokeBtn />]
          }
        />
      )}
    </div>
  );
};

export default PurList;
