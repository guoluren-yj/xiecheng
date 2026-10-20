import React, { useContext, useMemo, useCallback } from 'react';
import intl from 'utils/intl';
import { observer } from 'mobx-react-lite';
import { Attachment, Table } from 'choerodon-ui/pro';
import { isFunction, isEmpty } from 'lodash';
import { yesOrNoRender } from 'utils/renderer';
import { Button } from 'components/Permission';

import { Store } from '../Detail/storeProvider';

const StageInfo = function StageInfo() {
  const {
    stageListDs,
    node,
    source,
    unitCode,
    customizeTable,
    readOnly,
    isFirstNode,
    authReqStatusCode,
    pubPathFlag,
    renderAttachColumns,
    renderApproveStageColumns,
  } = useContext(Store);

  const viewFlag = readOnly || source === 'testResultEntry';

  const allowEdit = useCallback(
    (record, field) => {
      if (viewFlag) return false;
      if (record.status === 'add') {
        return true;
      } else if (
        [
          'requireUploadDate',
          'attachmentUuid',
          'requiredFlag', // 采购方附件必传需支持个性化可编辑，通过disabled控制编辑
          'supplierAttRequiredFlag', // 供应商附件必传需支持个性化可编辑，通过disabled控制编辑
        ].includes(field)
      ) {
        return true;
      } else {
        return false;
      }
    },
    [viewFlag]
  );

  const columns = useMemo(() => {
    if (pubPathFlag && isFunction(renderApproveStageColumns)) {
      return renderApproveStageColumns(stageListDs);
    }
    let normalColumns = [];
    const allColumns = [
      {
        name: 'attachmentCode',
        width: 250,
        editor: allowEdit,
      },
      {
        name: 'attachmentName',
        width: 250,
        editor: allowEdit,
      },
      {
        name: 'requiredFlag',
        width: 200,
        editor: allowEdit,
        renderer: ({ value }) => yesOrNoRender(Number(value)),
      },
      {
        name: 'supplierAttRequiredFlag',
        width: 200,
        editor: allowEdit,
        renderer: ({ value }) => yesOrNoRender(Number(value)),
      },
      {
        name: 'requireUploadDate',
        width: 250,
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
    ];

    if (
      ['PENDING', 'SUBMITTED', 'REJECTED', 'APPROVED', 'FEEDBACK_REJECTED'].includes(
        authReqStatusCode
      )
    ) {
      normalColumns = allColumns.filter((ele) => ele.name !== 'supplierAttachmentUuid');
    } else {
      normalColumns = allColumns;
    }
    const processColumns = isFunction(renderAttachColumns)
      ? renderAttachColumns(normalColumns, { allowEdit, authReqStatusCode })
      : normalColumns;
    return processColumns;
  }, [
    allowEdit,
    pubPathFlag,
    stageListDs,
    authReqStatusCode,
    renderAttachColumns,
    renderApproveStageColumns,
  ]);

  const DeleteBtn = observer(() => {
    const { selected } = stageListDs;
    return (
      <Button
        key="delete"
        name="delete"
        funcType="flat"
        icon="delete"
        color="primary"
        type="c7n-pro"
        onClick={() => {
          if (selected.some((record) => record.get('itemAuthReqHeaderAttId'))) {
            stageListDs.delete(selected, {
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
            stageListDs.remove(selected);
          }
        }}
        disabled={isEmpty(selected)}
      >
        {intl.get('hzero.common.button.delete').d('删除')}
      </Button>
    );
  });

  const buttons = useMemo(() => {
    if (!readOnly && ['PENDING', 'REJECTED', 'FEEDBACK_REJECTED'].includes(authReqStatusCode)) {
      return ['add', <DeleteBtn name="delete" />];
    }
    return [];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readOnly, isFirstNode, node, authReqStatusCode, stageListDs]);

  const table = readOnly
    ? customizeTable(
        {
          code: unitCode.split(',')[2],
          dataSet: stageListDs,
          custLoading: false,
          lovIgnore: false,
        },
      <Table
        style={{ maxHeight: '450px' }}
        dataSet={stageListDs}
        columns={columns}
        virtualCell={false}
        buttons={buttons}
      />
      )
    : customizeTable(
        {
          code: unitCode.split(',')[2],
          dataSet: stageListDs,
          __force_record_to_update__: true,
          custLoading: false,
          lovIgnore: false,
          buttonCode: 'SMDM.ITEM_PENDING_AUTH.DETAIL_STAGE_BTN',
        },
      <Table
        style={{ maxHeight: '450px' }}
        dataSet={stageListDs}
        columns={columns}
        virtualCell={false}
        buttons={buttons}
      />
      );

  return table;
};

export default observer(StageInfo);
