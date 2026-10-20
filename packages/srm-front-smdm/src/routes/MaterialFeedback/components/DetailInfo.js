import React, { useContext, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { isFunction } from 'lodash';
import { Table, Attachment, Lov, Modal } from 'choerodon-ui/pro';

import { Store } from '../Detail/storeProvider';

const DetailInfo = function DetailInfo() {
  const context = useContext(Store);
  const {
    detailListDs,
    node,
    remotes,
    itemAuthFeeHeaderId,
    customizeTable,
    readOnly,
    pubPathFlag,
    authFeeStatusCode,
    renderApproveDetailColumns,
    location,
  } = context;

  const allowEdit = (record, field) => {
    if (readOnly) return false;

    if (record.status === 'add') {
      if (field === 'categoryId') {
        return (
          <Lov
            dataSet={detailListDs}
            name="categoryId"
            tableProps={{
              mode: 'tree',
              onRow: (row) => {
                const handleSelect = ({ dataSet, record: _record }) => {
                  if (dataSet && _record) {
                    dataSet.select(_record);
                  }
                };
                return {
                  onClick: () => handleSelect(row),
                  onDoubleClick: () => {
                    if (row?.record?.selectable) {
                      handleSelect(row);
                      record.set({
                        categoryId: row?.record?.toData(),
                      });
                      Modal.destroyAll();
                    }
                  },
                };
              },
              selectionMode: 'rowbox',
              virtual: true,
              style: { maxHeight: '500px' },
            }}
          />
        );
      } else {
        return true;
      }
    } else if (
      ['feedbackDate', 'supplierAttachmentUuid'].includes(field) &&
      ['WAIT_FEEDBACK', 'AUTHENTICATION_REJECTED', 'PREAPPROVAL_REJECTED'].includes(
        authFeeStatusCode
      )
    ) {
      return true;
    } else {
      return false;
    }
  };

  const cols = useMemo(() => {
    if (pubPathFlag && isFunction(renderApproveDetailColumns)) {
      return renderApproveDetailColumns(detailListDs, { location });
    }

    return [
      {
        name: 'feeLineNum',
        width: 150,
      },
      {
        name: 'categoryId',
        width: 200,
        editor: allowEdit,
      },
      {
        name: 'itemCode',
        width: 150,
        editor: allowEdit,
      },
      {
        name: 'itemName',
        width: 200,
        editor: allowEdit,
      },
      {
        name: 'formalItemCode',
        width: 150,
        editor: allowEdit,
      },
      {
        name: 'formalItemName',
        width: 200,
        editor: allowEdit,
      },
      {
        name: 'uomId',
        width: 200,
        editor: allowEdit,
      },
      {
        name: 'quantity',
        width: 200,
        editor: allowEdit,
      },
      {
        name: 'feedbackDate',
        width: 200,
        editor: allowEdit,
      },
      {
        name: 'neededDate',
        width: 200,
        editor: allowEdit,
      },
      {
        name: 'poNum',
        width: 150,
        editor: allowEdit,
      },
      {
        name: 'sourceNum',
        width: 200,
        editor: allowEdit,
      },
      {
        name: 'sourcePrice',
        width: 200,
        editor: allowEdit,
      },
      {
        name: 'attachmentUuid',
        width: 200,
      },
      {
        name: 'supplierAttachmentUuid',
        width: 200,
        editor: (record) => (
          <Attachment
            name="supplierAttachmentUuid"
            record={record}
            viewMode="popup"
            funcType="link"
            readOnly={!allowEdit(record, 'supplierAttachmentUuid')}
            showHistory
          />
        ),
      },
      {
        name: 'nodeAttachmentUuid',
        width: 200,
      },
      {
        name: 'certificationConclusion',
        width: 200,
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pubPathFlag, node, itemAuthFeeHeaderId, detailListDs, readOnly, authFeeStatusCode]);
  const columns = remotes
  ?remotes.process("SMDM_ITEMCAFB_REMOTE_FEEDBACK_DETAIL_INFO_COLUMNS",cols,{readOnly,context})
  : cols;

  const table = readOnly
    ? customizeTable(
        {
          code: 'SMDM_ITEM_FEEDBACK_DETAIL.DETAILINFO',
          dataSet: detailListDs,
          custLoading: false,
          lovIgnore: false,
        },
        <Table
          style={{ maxHeight: '450px' }}
          dataSet={detailListDs}
          columns={columns}
          virtualCell={false}
          buttons={[]}
        />
      )
    : customizeTable(
        {
          code: 'SMDM_ITEM_FEEDBACK_DETAIL.DETAILINFO',
          dataSet: detailListDs,
          __force_record_to_update__: true,
          custLoading: false,
          lovIgnore: false,
        },
        <Table
          style={{ maxHeight: '450px' }}
          dataSet={detailListDs}
          columns={columns}
          virtualCell={false}
          buttons={[]}
        />
      );

  return table;
};

export default observer(DetailInfo);
