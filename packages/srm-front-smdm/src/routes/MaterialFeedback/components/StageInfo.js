import React, { useContext, useMemo, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { isFunction } from 'lodash';
import { yesOrNoRender } from 'utils/renderer';
import { Attachment, Table } from 'choerodon-ui/pro';

import { Store } from '../Detail/storeProvider';

const StageInfo = function StageInfo() {
  const {
    stageListDs,
    customizeTable,
    readOnly,
    pubPathFlag,
    authFeeStatusCode,
    renderAttachColumns,
    renderApproveStageColumns,
  } = useContext(Store);

  const allowEdit = useCallback(
    (record, field) => {
      if (readOnly) return;

      if (record.status === 'add') {
        return true;
      } else if (
        ['supplierAttachmentUuid'].includes(field) &&
        ['WAIT_FEEDBACK', 'AUTHENTICATION_REJECTED', 'PREAPPROVAL_REJECTED','SAMPLE_DELIVERY_WAIT_FEEDBACK'].includes(
          authFeeStatusCode
        )
      ) {
        return true;
      } else {
        return false;
      }
    },
    [readOnly, authFeeStatusCode]
  );

  const columns = useMemo(() => {
    if (pubPathFlag && isFunction(renderApproveStageColumns)) {
      return renderApproveStageColumns(stageListDs);
    }

    const normalColumns = [
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
        name: 'requireUploadDate',
        width: 250,
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
    ];

    const processColumns = isFunction(renderAttachColumns)
      ? renderAttachColumns(normalColumns, { authFeeStatusCode, allowEdit })
      : normalColumns;
    return processColumns;
  }, [
    allowEdit,
    pubPathFlag,
    stageListDs,
    authFeeStatusCode,
    renderAttachColumns,
    renderApproveStageColumns,
  ]);

  const table = readOnly
    ? customizeTable(
        {
          code: 'SMDM_ITEM_FEEDBACK_DETAIL.STAGEINFO',
          dataSet: stageListDs,
          custLoading: false,
          lovIgnore: false,
        },
      <Table
        style={{ maxHeight: '450px' }}
        dataSet={stageListDs}
        columns={columns}
        virtualCell={false}
        buttons={[]}
      />
      )
    : customizeTable(
        {
          code: 'SMDM_ITEM_FEEDBACK_DETAIL.STAGEINFO',
          dataSet: stageListDs,
          __force_record_to_update__: true,
          custLoading: false,
          lovIgnore: false,
        },
      <Table
        style={{ maxHeight: '450px' }}
        dataSet={stageListDs}
        columns={columns}
        virtualCell={false}
        buttons={[]}
      />
      );

  return table;
};

export default observer(StageInfo);
