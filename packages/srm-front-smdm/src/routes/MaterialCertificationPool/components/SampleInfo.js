import intl from 'utils/intl';
import { isEmpty } from 'lodash';
import React, { useContext, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { Table, Attachment, Lov, Modal } from 'choerodon-ui/pro';
import { Button } from 'components/Permission';

import { Store } from '../Detail/storeProvider';

const SampleInfo = function DetailInfo() {
  const {
    sampleInfoDs,
    node,
    header,
    source,
    unitCode,
    itemAuthReqHeaderId,
    customizeTable,
    readOnly,
    authReqStatusCode,
    sourcePlatform,
    pubPathFlag,
  } = useContext(Store);

  const allowEdit = (record, field) => {
    if ((String(record?.get('feedbackFlag')) === '1' && field === 'neededDate') || readOnly) {
      // eslint-disable-next-line no-unused-expressions
      record?.getField('neededDate')?.set('min', null);
    }
    if (readOnly) return false;
    if (['testingResult', 'testingInstructions', 'testingReportUuid'].includes(field)) {
      if (source === 'testResultEntry' && record.get('feedbackFlag') === 1) {
        return true;
      } else {
        return false;
      }
    }
    if (
      field === 'categoryId' &&
      (record.status === 'add' || ['REJECTED', 'PENDING'].includes(authReqStatusCode))
    ) {
      return (
        <Lov
          dataSet={sampleInfoDs}
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
    if (
      [
        'quantity',
        'neededDate',
        'attachmentUuid',
        'itemCode',
        'itemName',
        'formalItemCode',
        'formalItemName',
        'testingDepartmentId',
        'poNum',
        'purchaserRemark',
      ].includes(field) &&
      ['REJECTED', 'PENDING', 'FEEDBACK_REJECTED'].includes(authReqStatusCode)
    ) {
      return true;
    } else {
      return false;
    }
  };

  const columns = useMemo(() => {
    const testResultOherColmns =
      source === 'testResultEntry'
        ? [
            {
              name: 'testingResult',
              width: 200,
              editor: allowEdit,
            },
            {
              name: 'testingInstructions',
              width: 200,
              editor: allowEdit,
            },
            {
              name: 'testingReportUuid',
              width: 200,
              editor: allowEdit,
            },
            {
              name: 'expectedDeliveryDate',
              width: 200,
            },
            {
              name: 'sampleDeliveryMethod',
              width: 200,
            },
            {
              name: 'logisticsTrackingNum',
              width: 200,
            },
          ]
        : [];

    const allColumns = [
      {
        name: 'reqSampleNum',
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
        name: 'testingDepartmentId',
        width: 200,
        editor: allowEdit,
      },
      {
        name: 'poNum',
        width: 150,
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
        name: 'purchaserRemark',
        width: 200,
        editor: allowEdit,
      },
      ...testResultOherColmns,
    ];

    if (['PENDING', 'SUBMITTED', 'REJECTED', 'APPROVED'].includes(authReqStatusCode)) {
      return allColumns.filter((ele) => ele.name !== 'supplierAttachmentUuid');
    } else {
      return allColumns;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pubPathFlag, node, itemAuthReqHeaderId, sampleInfoDs, readOnly, source, authReqStatusCode]);

  const handleCreate = () => {
    sampleInfoDs.create(
      {
        attachmentRequiredFlag: header?.get('sampleAttachmentRequiredFlag') || 0,
        nodeAttachmentUuid: header?.get('sampleNodeAttachmentUuid'),
        supplierAttRequiredFlag: header?.get('sampleSupplierAttRequiredFlag'),
        // categoryId: header?.get('categoryId')?.categoryId,
        // categoryName: header?.get('categoryName'),
      },
      0
    );
  };

  const DeleteBtn = observer(() => {
    const { selected } = sampleInfoDs;
    return (
      <Button
        key="delete"
        name="delete"
        funcType="flat"
        icon="delete"
        color="primary"
        type="c7n-pro"
        onClick={() => {
          if (selected.some((record) => record.get('reqSampleId'))) {
            sampleInfoDs.delete(selected, {
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
            sampleInfoDs.remove(selected);
          }
        }}
        disabled={isEmpty(selected)}
      >
        {intl.get('hzero.common.button.delete').d('删除')}
      </Button>
    );
  });

  const buttons = useMemo(() => {
    if (
      !readOnly &&
      ['PENDING', 'REJECTED', 'TEST_RESULTS_TO_BE_ENTERED', 'FEEDBACK_REJECTED'].includes(
        authReqStatusCode
      )
    ) {
      return [
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
      ];
    }
    return [];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readOnly, node, sourcePlatform, authReqStatusCode, header, sampleInfoDs]);

  const table = readOnly
    ? customizeTable(
        {
          code: unitCode.split(',')[3],
          dataSet: sampleInfoDs,
          custLoading: false,
          lovIgnore: false,
        },
      <Table
        style={{ maxHeight: '450px' }}
        dataSet={sampleInfoDs}
        columns={columns}
        virtualCell={false}
        buttons={buttons}
      />
      )
    : customizeTable(
        {
          code: unitCode.split(',')[3],
          dataSet: sampleInfoDs,
          __force_record_to_update__: true,
          custLoading: false,
          lovIgnore: false,
          buttonCode: 'SMDM.ITEM_PENDING_AUTH.DETAL_SAMPLE_BTN',
        },
      <Table
        style={{ maxHeight: '450px' }}
        dataSet={sampleInfoDs}
        columns={columns}
        virtualCell={false}
        buttons={buttons}
      />
      );

  return table;
};

export default observer(SampleInfo);
