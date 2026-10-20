/* eslint-disable react/jsx-indent */
import intl from 'utils/intl';
import moment from 'moment';
import { isFunction, isEmpty } from 'lodash';
import React, { useContext, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { Table, Attachment, Lov, Modal } from 'choerodon-ui/pro';
import { Button } from 'components/Permission';

import { Store } from '../Detail/storeProvider';

const DetailInfo = function DetailInfo() {
  const contextValue = useContext(Store);
  const {
    detailListDs,
    sampleInfoDs,
    node,
    header,
    unitCode,
    remote,
    itemAuthReqHeaderId,
    customizeTable,
    readOnly,
    isFirstNode,
    authReqStatusCode,
    sourcePlatform,
    source,
    pubPathFlag,
    testingResultEnterFlag,
    renderApproveDetailColumns,
    location,
  } = contextValue;

  const allowEdit = (record, field) => {
    if (readOnly) return false;
    if (field === 'certificationConclusion' && source === 'testResultEntry') {
      return true;
    }
    if (source === 'testResultEntry') return false;
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
    }
    if (record.status === 'add') {
      return true;
    }
    if (['quantity', 'uomId', 'neededDate', 'attachmentUuid', 'formalItemCode'].includes(field)) {
      return true;
    }
    if (isFirstNode) {
      if (
        ['poNum', 'sourceNum', 'sourcePrice', 'categoryId', 'itemCode', 'itemName'].includes(field)
      ) {
        return true;
      }
    }
    // if (record.get('itemCode') && ['itemName'].includes(field)) {
    //   return true;
    // } else {
    //   return false;
    // }
    return false;
  };
 
  const cols = useMemo(() => {
    if (
      (pubPathFlag ||
        source === 'certified' ||
        ['AUTHENTICATION_REJECTED', 'APPROVED'].includes(authReqStatusCode)) &&
      isFunction(renderApproveDetailColumns)
    ) {
      return renderApproveDetailColumns(detailListDs, { source, authReqStatusCode, location, readOnly });
    }

    const allColumns = [
      {
        name: 'reqLineNum',
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
        editor: (record) => (
          <Attachment
            name="attachmentUuid"
            record={record}
            viewMode="popup"
            funcType="link"
            readOnly={!allowEdit(record, 'attachmentUuid')}
            showHistory
          />
        ),
      },
      {
        name: 'supplierAttachmentUuid',
        width: 200,
      },
      {
        name: 'nodeAttachmentUuid',
        width: 200,
      },
      {
        name: 'certificationConclusion',
        width: 200,
        editor: allowEdit,
      },
    ];

    if (
      ['PENDING', 'SUBMITTED', 'REJECTED', 'APPROVED', 'FEEDBACK_REJECTED'].includes(
        authReqStatusCode
      )
    ) {
      return allColumns.filter((ele) => ele.name !== 'supplierAttachmentUuid');
    } else {
      return allColumns;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    pubPathFlag,
    node,
    isFirstNode,
    itemAuthReqHeaderId,
    detailListDs,
    readOnly,
    authReqStatusCode,
  ]);

  const columns =remote?remote.process("SMDM_ITEMCA_REMOTE_DETAIL_INFO_COLUMNS",cols,contextValue):cols;

  const handleCreate = () => {
    detailListDs.create(
      {
        attachmentRequiredFlag: header?.get('lineAttachmentRequiredFlag') || 0,
        nodeAttachmentUuid: header?.get('lineNodeAttachmentUuid'),
        supplierAttRequiredFlag: header?.get('supplierAttRequiredFlag'),
        categoryId: header?.get('categoryId')?.categoryId,
        categoryName: header?.get('categoryName'),
      },
      0
    );
  };

  const DeleteBtn = observer(() => {
    const { selected } = detailListDs;
    return (
      <Button
        key="delete"
        name="delete"
        funcType="flat"
        icon="delete"
        color="primary"
        type="c7n-pro"
        onClick={() => {
          if (selected.some((record) => record.get('itemAuthReqLineId'))) {
            detailListDs.delete(selected, {
              title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
              children: (
                <div>
                  {intl
                    .get('hzero.c7nProUI.DataSet.delete_selected_row_confirm')
                    .d('确认删除选中行？')}
                </div>
              ),
            });
          } else {
            detailListDs.remove(selected);
          }
        }}
        disabled={isEmpty(selected)}
      >
        {intl.get('hzero.common.button.delete').d('删除')}
      </Button>
    );
  });

  const CreateSampleLine = observer(() => {
    const { selected } = detailListDs;
    return (
      <Button
        key="createSampleLine"
        name="createSampleLine"
        funcType="flat"
        icon="playlist_add"
        color="primary"
        type="c7n-pro"
        onClick={() => {
          selected.forEach((record) => {
            const {
              categoryId,
              categoryName,
              itemCode,
              itemName,
              formalItemCode,
              formalItemId,
              formalItemName,
              quantity,
              neededDate,
            } = record.get([
              'categoryId',
              'categoryName',
              'itemCode',
              'itemName',
              'formalItemCode',
              'formalItemId',
              'formalItemName',
              'quantity',
              'neededDate',
            ]);
            sampleInfoDs.create(
              {
                attachmentRequiredFlag: header?.get('sampleAttachmentRequiredFlag') || 0,
                nodeAttachmentUuid: header?.get('sampleNodeAttachmentUuid'),
                supplierAttRequiredFlag: header?.get('sampleSupplierAttRequiredFlag'),
                categoryId: categoryId?.categoryId,
                categoryName,
                itemCode,
                itemName,
                formalItemCode: formalItemCode?.itemCode,
                formalItemId,
                formalItemName,
                quantity,
                neededDate:
                  neededDate && neededDate.isAfter(moment(moment().format('YYYY-MM-DD')))
                    ? neededDate
                    : undefined,
              },
              0
            );
          });
        }}
        disabled={isEmpty(selected)}
      >
        {intl.get(`smdm.common.model.common.referenceSampleInfo`).d('引用至样品信息')}
      </Button>
    );
  });

  const buttons = useMemo(() => {
    const otherBtns = testingResultEnterFlag ? [<CreateSampleLine name="createSampleLine" />] : [];

    const buttonArr = [];
    if (
      !readOnly &&
      isFirstNode &&
      ['PENDING', 'REJECTED', 'FEEDBACK_REJECTED'].includes(authReqStatusCode)
    ) {
      if (sourcePlatform === 'SRM') {
        buttonArr.push(
          ...[
            <Button
              key="create"
              name="create"
              funcType="flat"
              icon="playlist_add"
              color="primary"
              type="c7n-pro"
              onClick={() => handleCreate()}
            >
              {intl.get('hzero.common.button.add').d('新增')}
            </Button>,
            <DeleteBtn name="delete" />,
          ]
        );
      } else {
        buttonArr.push(...[<DeleteBtn name="delete" />]);
      }
    }

    if (
      !readOnly &&
      (['PENDING', 'REJECTED'].includes(authReqStatusCode) || source === 'testResultEntry')
    ) {
      buttonArr.push(...otherBtns);
    }

    return buttonArr;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    readOnly,
    node,
    source,
    sourcePlatform,
    isFirstNode,
    authReqStatusCode,
    testingResultEnterFlag,
    header,
    detailListDs,
  ]);

  const table = readOnly
    ? customizeTable(
        {
          code: unitCode.split(',')[1],
          dataSet: detailListDs,
          custLoading: false,
          lovIgnore: false,
        }, 
        <Table
          style={{ maxHeight: '450px' }}
          dataSet={detailListDs}
          columns={columns}
          virtualCell={false}
          buttons={buttons}
        />
      )
    : customizeTable(
        {
          code: unitCode.split(',')[1],
          dataSet: detailListDs,
          __force_record_to_update__: true,
          custLoading: false,
          lovIgnore: false,
          buttonCode: 'SMDM.ITEM_PENDING_AUTH.DETAIL_LINE_BTN',
        },
        <Table
          style={{ maxHeight: '450px' }}
          dataSet={detailListDs}
          columns={columns}
          virtualCell={false}
          buttons={buttons}
        />
      );

  return table;
};

export default observer(DetailInfo);
