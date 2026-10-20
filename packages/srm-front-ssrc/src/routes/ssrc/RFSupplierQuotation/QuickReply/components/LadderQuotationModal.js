import React, { useMemo, useCallback, useEffect, Fragment } from 'react';
import { Card } from 'choerodon-ui';
import { useDataSet, Table, Spin } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import { DETAIL_CARD_CLASSNAME } from 'utils/constants';
import intl from 'utils/intl';
// import notification from 'utils/notification';

import EditForm from '@/routes/ssrc/components/EditorForm';
// import { getSelectedNegActConfirmMsg } from '@/routes/ssrc/utils/render';
import C7nPrecisionInputNumber from '@/routes/components/Precision/C7nPrecisionInputNumber';
// import { calculateBasicQty } from '@/utils/utils';
import { ladderItemFormDS, ladderLineDS } from '../store/mainDS';
import { LadderSourceStatus, QRLadderLineCodes, QRLadderHeaderCode } from '../store/enum';

const LadderQuotationModal = (props) => {
  const {
    type = 'view',
    modal,
    caclRule,
    // headRecord,
    source = 'header',
    record: historyRecord,
    headData,
    rfqQuotationId,
    doubleUnitFlag,
    customizeTable,
    customizeForm,
  } = props;
  const { targetPriceType } = headData;
  const isEditFlag = type === 'edit'; // edit | view
  const isHeader = source === 'header';
  const sourceType = `${source.toUpperCase()}_${type.toUpperCase()}`;
  const params = isHeader
    ? isEditFlag
      ? {
          rfqQuotationCurrentId: historyRecord?.get('rfqQuotationCurrentId'),
        }
      : { rfqQuotationId }
    : {
        rfqQuotationRecordId: historyRecord?.get('rfqQuotationRecordId'),
      };

  const ladderItemFormDs = useDataSet(() => ladderItemFormDS(rfqQuotationId), [rfqQuotationId]); // 物料信息
  const ladderLineDs = useDataSet(
    () =>
      ladderLineDS({
        params,
        caclRule,
        headData,
        headRecord: historyRecord,
        sourceStatus: LadderSourceStatus[sourceType],
        targetPriceType,
        customizeUnitCode: QRLadderLineCodes[sourceType],
      }),
    [source, type, targetPriceType]
  ); // 报价信息
  // const { selected } = ladderLineDs;

  const handleOk = useCallback(async () => {
    // 1.校验行信息
    const validateFlag = await ladderLineDs.validate();

    if (!validateFlag) return false;
    // 2.提交

    const res = await ladderLineDs.submit();
    return res;
  }, [ladderLineDs]);

  useEffect(() => {
    modal.handleOk(handleOk);
  }, [handleOk, modal]);

  const editorFormColumns = useMemo(() => ['itemCode', 'itemName'], []);

  // 计算基本数量
  // const handleLadder = (record, value, feildType = 'secondaryLadderFrom') => {
  //   const { itemId, uomId, secondaryUomId } =
  //     ladderItemFormDs?.current?.get(['itemId', 'uomId', 'secondaryUomId']) || {};
  //   if (value) {
  //     if (doubleUnitFlag && itemId) {
  //       if (secondaryUomId) {
  //         calculateBasicQty({
  //           secondaryQuantity: value,
  //           itemId,
  //           businessKey: -1,
  //           doublePrimaryUomId: uomId,
  //           secondaryUomId,
  //         }).then(res => {
  //           record.set(feildType === 'secondaryLadderFrom' ? 'ladderFrom' : 'ladderTo', res ?? '');
  //         });
  //       }
  //     } else {
  //       record.set(feildType === 'secondaryLadderFrom' ? 'ladderFrom' : 'ladderTo', value);
  //     }
  //   } else if (value === 0) {
  //     record.set(feildType === 'secondaryLadderFrom' ? 'ladderFrom' : 'ladderTo', value);
  //   } else {
  //     record.set(feildType === 'secondaryLadderFrom' ? 'ladderFrom' : 'ladderTo', '');
  //   }
  // };

  const renderPrice = useCallback(
    (name, record) => {
      return isEditFlag ? (
        <C7nPrecisionInputNumber
          name={name}
          record={record}
          headerRecord={ladderItemFormDs.current}
          currency="currencyCode"
          omitZeroFlag
        />
      ) : (
        false
      );
    },
    [isEditFlag, ladderItemFormDs.current]
  );

  // const renderQuantity = useCallback(
  //   (name, record) => {
  //     return isEditFlag ? (
  //       <C7nPrecisionInputNumber
  //         name={name}
  //         record={record}
  //         headerRecord={ladderItemFormDs.current}
  //         uom="secondaryUomId"
  //         onChange={value => handleLadder(record, value, name)}
  //         omitZeroFlag
  //       />
  //     ) : (
  //       false
  //     );
  //   },
  //   [isEditFlag, ladderItemFormDs.current, handleLadder]
  // );

  const columns = useMemo(() => {
    return [
      { name: 'ladderLineNum', width: 120 },
      {
        name: 'secondaryLadderFrom',
        width: 120,
        // editor: record => renderQuantity('secondaryLadderFrom', record),
      },
      {
        name: 'secondaryLadderTo',
        width: 120,
        // editor: record => renderQuantity('secondaryLadderTo', record),
      },
      {
        name: 'ladderFrom',
        width: 120,
        editor: false,
        hidden: !doubleUnitFlag,
      },
      {
        name: 'ladderTo',
        width: 120,
        editor: false,
        hidden: !doubleUnitFlag,
      },
      {
        name: 'ladderSecPrice',
        width: 120,
        editor: (record) => renderPrice('ladderSecPrice', record),
      },
      {
        name: 'ladderPrice',
        width: 120,
        editor: false,
        hidden: !doubleUnitFlag,
      },
      {
        name: 'netLadderSecPrice',
        width: 120,
        editor: (record) => renderPrice('netLadderSecPrice', record),
      },
      {
        name: 'netLadderPrice',
        width: 120,
        editor: false,
        hidden: !doubleUnitFlag,
      },
      { name: 'remark', editor: false },
    ];
  }, [isEditFlag, doubleUnitFlag, renderPrice]);

  const cardList = useMemo(
    () => [
      {
        title: intl.get('ssrc.quickInquiry.quickReply.view.message.title.itemInfo').d('物料信息'),
        content: (
          <EditForm
            columns={3}
            useColon={false}
            dataSet={ladderItemFormDs}
            editorFlag={false}
            editorColumns={editorFormColumns}
            customizeOptions={{ code: QRLadderHeaderCode }}
            customizeForm={customizeForm}
          />
        ),
      },
      {
        title: intl
          .get('ssrc.quickInquiry.quickReply.view.message.title.quotationInfo')
          .d('报价信息'),
        content: customizeTable(
          { code: QRLadderLineCodes[`HEADER_${type.toUpperCase()}`] },
          <Table
            dataSet={ladderLineDs}
            columns={columns}
            selectionMode="none"
            style={{ maxHeight: 'calc(100vh - 370px)' }}
          />
        ),
      },
    ],
    [
      isEditFlag,
      editorFormColumns,
      columns,
      ladderLineDs,
      ladderItemFormDs,
      customizeTable,
      customizeForm,
      type,
    ]
  );
  if (!ladderItemFormDs) return <Spin />;
  return (
    <Fragment>
      {cardList.map(({ title, content }) => (
        <Card bordered={false} className={DETAIL_CARD_CLASSNAME} title={title}>
          {content}
        </Card>
      ))}
    </Fragment>
  );
};

export default observer(LadderQuotationModal);
