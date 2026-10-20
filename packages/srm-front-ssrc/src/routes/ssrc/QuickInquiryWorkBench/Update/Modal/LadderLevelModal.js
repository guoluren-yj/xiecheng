import React, { useEffect, useMemo } from 'react';
import { useDataSet, Table, Output } from 'choerodon-ui/pro';
import { noop, debounce } from 'lodash';
import intl from 'utils/intl';
import { observer } from 'mobx-react-lite';

import notification from 'utils/notification';
import CollapseForm from '_components/CollapseForm';

import C7nPrecisionInputNumber from '@/routes/components/Precision/C7nPrecisionInputNumber';
import { calculateBasicQty } from '@/utils/utils';
import { numberSeparatorRender } from '@/utils/renderer';

import { ladderQuotationTableDS, ladderQuotationHeaderDS } from '../store/itemLineDS';
import styles from '../common.less';

export default observer(function LadderLevelModal(props) {
  const {
    modal,
    itemRecord = {},
    customizeTable = noop,
    customizeCollapseForm = noop,
    doubleUnitFlag = false,
  } = props || {};

  const { rfqItemId = '' } = itemRecord?.get?.(['rfqItemId']) || {};

  const ladderQuotationTableDs = useDataSet(() => ladderQuotationTableDS(), []);

  const ladderQuotationHeaderDs = useDataSet(() => ladderQuotationHeaderDS(), []);

  useEffect(() => {
    ladderQuotationTableDs.setState('doubleUnitFlag', doubleUnitFlag);
    ladderQuotationTableDs.setQueryParameter('rfqItemId', rfqItemId);
    ladderQuotationHeaderDs.setQueryParameter('rfqItemId', rfqItemId);
    ladderQuotationTableDs.query();
    ladderQuotationHeaderDs.query();
  }, []);

  modal.handleOk(async () => {
    if (!(await ladderQuotationTableDs.validate())) {
      return false;
    }
    const res = await ladderQuotationTableDs.submit();
    // 校验失败，阻止弹框关闭
    return res;
  });

  // 新建
  const handleCreateLine = () => {
    const { itemId, uomId, secondaryUomId } =
      itemRecord?.get(['itemId', 'uomId', 'secondaryUomId']) || {};
    const newLine = {
      itemId: itemId?.itemId,
      secondaryUomId: secondaryUomId?.uomId,
      uomId: uomId?.uomId,
    };
    ladderQuotationTableDs.create(newLine, ladderQuotationTableDs.length);
  };

  // 删除
  const handleDeleteItem = (ds = {}) => {
    const { selected = [] } = ds || {};

    const unAddSelectedLines = selected?.filter((line) => line.status !== 'add') || [];
    if (!unAddSelectedLines?.length) {
      ds.remove(selected, 1);
      // 如果勾选的数据全部为新建的，删除完毕重排行号
      ds.forEach((item, index) => {
        if (!item) {
          return;
        }
        item.set('ladderLineNum', index + 1);
      });
    }
    const unAddAllLines = ds?.filter((line) => line.status !== 'add') || [];
    const endSelectedLine =
      unAddAllLines?.slice(unAddAllLines.length - unAddSelectedLines.length) || [];
    let matchFlag = 1;
    endSelectedLine.forEach((line) => {
      const ladderLineNum = line.get('ladderLineNum');
      const matchSelectedLine = unAddSelectedLines?.find(
        (selectedLine) => selectedLine.get('ladderLineNum') === ladderLineNum
      );
      if (!matchSelectedLine) {
        matchFlag = 0;
      }
    });

    if (!matchFlag) {
      notification.warning({
        message: intl
          .get(`ssrc.quickInquiry.model.supQuo.onlySelectedLast`)
          .d('只能从最后一行已保存行开始删除!'),
      });
      return;
    }
    ds.delete(unAddSelectedLines, {
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl
        .get('hzero.c7nProUI.DataSet.delete_selected_row_confirm')
        .d('确认删除选中行？'),
    });
  };

  // 辅助数量赋值给基本数量
  const handleLadder = debounce((value, record = {}, type = 'secondaryLadderFrom') => {
    const { itemId, uomId, secondaryUomId } = itemRecord?.get([
      'itemId',
      'uomId',
      'secondaryUomId',
    ]);
    const currentItemIdValue = itemId?.itemId;
    const currentUomIdValue = uomId?.uomId;
    const currentSecondaryUomId = secondaryUomId?.uomId;

    if (value) {
      if (doubleUnitFlag && currentItemIdValue) {
        if (currentSecondaryUomId) {
          calculateBasicQty({
            secondaryQuantity: value,
            itemId: currentItemIdValue,
            businessKey: -1,
            doublePrimaryUomId: currentUomIdValue,
            secondaryUomId: currentSecondaryUomId,
          }).then((res) => {
            record.set(type === 'secondaryLadderFrom' ? 'ladderFrom' : 'ladderTo', res ?? '');
          });
        }
      } else {
        record.set(type === 'secondaryLadderFrom' ? 'ladderFrom' : 'ladderTo', value);
      }
    } else if (value === 0) {
      record.set(type === 'secondaryLadderFrom' ? 'ladderFrom' : 'ladderTo', value);
    } else {
      record.set(type === 'secondaryLadderFrom' ? 'ladderFrom' : 'ladderTo', '');
    }
  }, 500);

  const columns = useMemo(
    () => [
      {
        name: 'ladderLineNum',
        width: 80,
      },
      {
        name: 'secondaryLadderFrom',
        width: 120,
        editor: (ladderRecord) => {
          return (
            <C7nPrecisionInputNumber
              name="secondaryLadderFrom"
              record={ladderRecord}
              uom="secondaryUomId"
              // onChange={(value) => handleLadder(value, ladderRecord, 'secondaryLadderFrom')}
              onInput={(e = null) =>
                handleLadder(e?.target?.value, ladderRecord, 'secondaryLadderFrom')
              }
            />
          );
        },
      },
      {
        name: 'secondaryLadderTo',
        width: 120,
        editor: (ladderRecord) => {
          return (
            <C7nPrecisionInputNumber
              name="secondaryLadderTo"
              record={ladderRecord}
              uom="secondaryUomId"
              // onChange={(value) => handleLadder(value, ladderRecord, 'secondaryLadderTo')
              onInput={(e = null) =>
                handleLadder(e?.target?.value, ladderRecord, 'secondaryLadderTo')
              }
            />
          );
        },
      },
      {
        name: 'ladderFrom',
        width: 120,
        hidden: !doubleUnitFlag,
      },
      {
        name: 'ladderTo',
        width: 120,
        hidden: !doubleUnitFlag,
      },
      {
        name: 'remark',
        width: 120,
        editor: true,
      },
      {
        name: 'secondaryTargetPrice',
        width: 130,
        align: 'right',
        editor: (record) => {
          return (
            <C7nPrecisionInputNumber
              name="secondaryTargetPrice"
              record={record}
              headerRecord={itemRecord}
              currency="currencyCode"
            />
          );
        },
        renderer: ({ value }) =>
          numberSeparatorRender(
            value,
            itemRecord.getState('currency_precision') ?? itemRecord.get('defaultPrecision') ?? 10
          ),
      },
      {
        name: 'targetPrice',
        width: 130,
        align: 'right',
        hidden: !doubleUnitFlag,
        renderer: ({ value }) =>
          numberSeparatorRender(
            value,
            itemRecord.getState('currency_precision') ?? itemRecord.get('defaultPrecision') ?? 10
          ),
      },
    ],
    [doubleUnitFlag, itemRecord]
  );

  const buttons = useMemo(
    () => [
      ['add', { onClick: () => handleCreateLine() }],
      ['delete', { icon: 'delete_sweep', onClick: () => handleDeleteItem(ladderQuotationTableDs) }],
    ],
    [ladderQuotationTableDs, itemRecord]
  );

  return (
    <React.Fragment>
      <h3 className={styles['ladder-sub-title']}>
        <div className={styles['ladder-sub-title-line']} />
        {intl.get('ssrc.quickInquiry.view.card.subtitle.itemInfo').d('物料信息')}
      </h3>
      {customizeCollapseForm(
        {
          code: `SSRC.QUICK_INQUIRY.EDIT.LADDER_QUOTATION_HEADER`,
          dataSet: ladderQuotationHeaderDs,
        },
        <CollapseForm
          dataSet={ladderQuotationHeaderDs}
          labelLayout="vertical"
          columns={2}
          labelAlign="left"
          className="c7n-pro-vertical-form-display"
        >
          <Output name="itemCode" />
          <Output name="itemName" />
        </CollapseForm>
      )}
      <h3 className={styles['ladder-sub-title']} style={{ marginTop: '32px' }}>
        <div className={styles['ladder-sub-title-line']} />
        {intl.get('ssrc.quickInquiry.view.card.subtitle.quotationInfo').d('报价信息')}
      </h3>
      {customizeTable(
        {
          code: 'SSRC.QUICK_INQUIRY.EDIT.LADDER_QUOTATION_LINE',
        },
        <Table
          dataSet={ladderQuotationTableDs}
          columns={columns}
          buttons={buttons}
          style={{ maxHeight: 'calc(100vh - 370px)' }}
        />
      )}
    </React.Fragment>
  );
});
