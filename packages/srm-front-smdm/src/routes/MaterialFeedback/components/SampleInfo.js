import React, { useContext, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { Table, Attachment } from 'choerodon-ui/pro';

import { Store } from '../Detail/storeProvider';

const DetailInfo = function DetailInfo() {
  const {
    sampleInfoDs,
    node,
    itemAuthFeeHeaderId,
    customizeTable,
    readOnly,
    authFeeStatusCode,
    pubPathFlag,
  } = useContext(Store);

  const allowEdit = (record, field) => {
    if (readOnly) return false;
    if (
      String(record?.get('feedbackFlag')) === '1' &&
      record.get('testingResult') === 'QUALIFIED'
    ) {
      return false;
    }

    if (
      [
        'expectedDeliveryDate',
        'sampleDeliveryMethod',
        'logisticsTrackingNum',
        'supplierAttachmentUuid',
      ].includes(field)
    ) {
      return true;
    } else {
      return false;
    }
  };

  const columns = useMemo(() => {
    return [
      {
        name: 'feeSampleNum',
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
        name: 'expectedDeliveryDate',
        width: 200,
        editor: allowEdit,
      },
      {
        name: 'sampleDeliveryMethod',
        width: 200,
        editor: allowEdit,
      },
      {
        name: 'logisticsTrackingNum',
        width: 200,
        editor: allowEdit,
      },
      {
        name: 'testingDepartmentId',
        width: 150,
      },
      {
        name: 'poNum',
        width: 150,
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
        name: 'purchaserRemark',
        editor: allowEdit,
      },
      {
        name: 'testingResult',
        width: 200,
      },
      {
        name: 'testingInstructions',
        width: 200,
      },
      {
        name: 'testingReportUuid',
        width: 200,
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pubPathFlag, node, itemAuthFeeHeaderId, sampleInfoDs, readOnly, authFeeStatusCode]);

  const table = readOnly
    ? customizeTable(
        {
          code: 'SMDM_ITEM_FEEDBACK_DETAIL.SAMPLE',
          dataSet: sampleInfoDs,
          custLoading: false,
          lovIgnore: false,
        },
      <Table
        style={{ maxHeight: '450px' }}
        dataSet={sampleInfoDs}
        columns={columns}
        virtualCell={false}
        buttons={[]}
      />
      )
    : customizeTable(
        {
          code: 'SMDM_ITEM_FEEDBACK_DETAIL.SAMPLE',
          dataSet: sampleInfoDs,
          __force_record_to_update__: true,
          custLoading: false,
          lovIgnore: false,
        },
      <Table
        style={{ maxHeight: '450px' }}
        dataSet={sampleInfoDs}
        columns={columns}
        virtualCell={false}
        buttons={[]}
      />
      );

  return table;
};

export default observer(DetailInfo);
