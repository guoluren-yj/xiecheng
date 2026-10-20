import React, { useMemo, useCallback, useImperativeHandle } from 'react';
import { Table, Form, Output, Icon, Button } from 'choerodon-ui/pro';
import { Alert } from 'choerodon-ui';
import { noop, throttle, isNil } from 'lodash';
import { math } from 'choerodon-ui/dataset';
import { observer } from 'mobx-react-lite';

import notification from 'utils/notification';
// import { yesOrNoRender } from 'utils/renderer';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';

import C7nPrecisionInputNumber from '@/routes/components/Precision/C7nPrecisionInputNumber';
import { numberSeparatorRender } from '@/utils/renderer';
import { calculateBasicQty } from '@/utils/utils';

import Styles from '../../index.less';

const Content = (props = {}) => {
  const {
    tableLineDS,
    formDS,
    currentLineRecord,
    readOnly = false, // 只读内容
    organizationId,
    customizeTable = noop,
    customizeUnitCode = null, // 个性化编码
    customizeFlag = 0, // 是否需要个性化
    customizedCode = null, // 用户个性化编码
    doubleUnitFlag = false,
    // headerDS = {},
    onRef,
    tableRowKey,
    offlineQuoLineId,
  } = props;

  useImperativeHandle(onRef, () => {
    return {
      handleSave,
    };
  });

  // 含税单价
  const handleCurrentLadderPrice = (val, lineRecord) => {
    const precision = lineRecord.getState('currency') ?? math.dp(val);
    const taxRate = currentLineRecord.get('taxRate');

    if (!val && val !== 0) {
      lineRecord.set(doubleUnitFlag ? 'currentNetLadderPrice' : 'currentNetLadderPrice', null);
      return;
    }

    let currentNetLadderPrice = null;

    if (taxRate && taxRate !== 0) {
      currentNetLadderPrice = math.div(val, math.plus(1, math.div(taxRate, 100)));
    } else {
      currentNetLadderPrice = val;
    }

    currentNetLadderPrice =
      precision && !isNil(currentNetLadderPrice)
        ? math.toFixed(currentNetLadderPrice, precision)
        : null;

    lineRecord.set(
      doubleUnitFlag ? 'currentNetLadderSecPrice' : 'currentNetLadderPrice',
      currentNetLadderPrice
    );
  };

  // 含税单价
  const onChangeNetPrice = (val, lineRecord) => {
    if (!val && val !== 0) {
      lineRecord.set(doubleUnitFlag ? 'netSecondaryPrice' : 'netPrice', null);
      return;
    }

    const precision = lineRecord.getState('currency') ?? math.dp(val);
    const taxRate = currentLineRecord.get('taxRate');
    let currentLadderPrice = null;

    if (taxRate && taxRate !== 0) {
      currentLadderPrice = math.multipliedBy(val, math.plus(1, math.div(taxRate, 100)));
    } else {
      currentLadderPrice = val;
    }

    currentLadderPrice =
      precision && !isNil(currentLadderPrice) ? math.toFixed(currentLadderPrice, precision) : null;

    lineRecord.set(
      doubleUnitFlag ? 'currentLadderSecPrice' : 'currentLadderPrice',
      currentLadderPrice
    );
  };

  // save
  const handleSave = useCallback(async () => {
    tableLineDS.forEach((item) => {
      item.set('status', 'update');
    });
    let saveResultFlag = false;
    const validateFlag = await tableLineDS.validate();
    if (!validateFlag) {
      return saveResultFlag;
    }

    try {
      let result = await tableLineDS.submit();
      result = getResponse(result);
      if (!result || !result.success) {
        return saveResultFlag;
      }

      saveResultFlag = true;
      tableLineDS.query();
    } catch (e) {
      throw e;
    }

    return saveResultFlag;
  }, [tableLineDS]);

  // create line
  const create = useCallback(
    throttle(() => {
      const formData = currentLineRecord?.toData() || {};
      const {
        offlineLadderQuotationId,
        quotationCurrencyCode: currencyCode,
        secondaryUomId,
        uomId,
      } = formData;

      const nextTableLength = tableLineDS.length + 1;

      const lineData = {
        offlineLadderQuotationId,
        ladderFrom: null,
        ladderTo: null,
        tenantId: organizationId,
        currentLadderPrice: null,
        validLadderPrice: null,
        // validBargainPrice: null,
        rfxLadderLineNum: nextTableLength,
        currencyCode,
        secondaryUomId,
        uomId,
        offlineQuoLineId,
      };

      if (tableLineDS.length) {
        // 上一行的至作为下行的从
        const lastLineRecord = tableLineDS.get(tableLineDS.length - 1);
        const { ladderTo, secondaryLadderTo } = lastLineRecord
          ? lastLineRecord.get(['ladderTo', 'secondaryLadderTo'])
          : null;
        lineData.ladderFrom = ladderTo;
        lineData.secondaryLadderFrom = secondaryLadderTo;
      }

      tableLineDS.create(lineData, nextTableLength);
    }, 500),
    [currentLineRecord, organizationId, tableLineDS, offlineQuoLineId]
  );

  // 删除行
  const deleteLines = useCallback(async () => {
    const { selected } = tableLineDS;

    const unAddSelectedLines = selected.filter((line) => line.status !== 'add');
    if (!unAddSelectedLines?.length) {
      tableLineDS.remove(selected, 1);
      // 如果勾选的数据全部为新建的，删除完毕重排行号
      tableLineDS.forEach((record, index) => {
        if (!record) {
          return;
        }

        record.set('rfxLadderLineNum', index + 1);
      });
    }

    const unAddAllLines = tableLineDS.filter((line) => line.status !== 'add');
    const endSelectedLine = unAddAllLines.slice(unAddAllLines.length - unAddSelectedLines.length);

    let matchFlag = 1;
    endSelectedLine.forEach((line) => {
      const rfxLadderLineNum = line.get('rfxLadderLineNum');
      const matchSelectedLine = unAddSelectedLines.find(
        (selectedLine) => selectedLine.get('rfxLadderLineNum') === rfxLadderLineNum
      );
      if (!matchSelectedLine) {
        matchFlag = 0;
      }
    });

    if (!matchFlag) {
      notification.warning({
        message: intl
          .get(`ssrc.supplierQuotation.model.supQuo.onlySelectedLast`)
          .d('只能从最后一行已保存行开始删除!'),
      });
      return;
    }

    try {
      const result = await tableLineDS.delete(unAddSelectedLines, {
        title: intl.get('ssrc.common.message.tip').d('提示'),
        children: intl.get('hzero.common.view.delete_selected_row_confirm').d('确认删除选中行？'),
      });
      if (result && result?.success) {
        tableLineDS.clearCachedRecords();
        tableLineDS.unSelectAll();
        tableLineDS.clearCachedSelected();
        tableLineDS.query();
      }
    } catch (e) {
      throw e;
    }
  }, [tableLineDS, tableLineDS?.selected]);

  const renderAlert = useCallback(() => {
    return (
      <Alert
        message={
          <span style={{ color: '#3095F2' }}>
            {intl
              .get('ssrc.inquiryHall.view.ladderPriceIncludeMinMax')
              .d('阶梯价格区间包含最小采购量和需求数量！')}
          </span>
        }
        type="info"
        showIcon
        closable
        style={{
          marginLeft: '-20px',
          marginRight: '-20px',
          marginTop: '-20px',
          marginBottom: '20px',
          border: 'none',
          // alignItems: 'flex-end',
          height: '40px',
          lineHeight: '20px',
        }}
        closeText={<Icon type="close" style={{ color: '#3095f2' }} />}
      />
    );
  }, [currentLineRecord]);

  // 计算基本数量
  const handleLadder = (record, value, type = 'secondaryLadderFrom') => {
    const { itemId, uomId, secondaryUomId } = currentLineRecord?.get([
      'itemId',
      'uomId',
      'secondaryUomId',
    ]);
    const currentItemIdValue = itemId?.itemId;
    const currentUomIdValue = uomId?.uomId;
    const currentSecondaryUomId = secondaryUomId?.secondaryUomId;

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
  };

  // editable table column
  const editorColumns = useMemo(
    () =>
      [
        {
          name: 'rfxLadderLineNum',
          width: 80,
        },
        {
          name: 'secondaryLadderFrom',
          width: 140,
          hidden: !doubleUnitFlag,
          editor: (ladderRecord) => {
            return (
              <C7nPrecisionInputNumber
                name="secondaryLadderFrom"
                record={ladderRecord}
                uom="secondaryUomId"
                onChange={(value) => handleLadder(ladderRecord, value, 'secondaryLadderFrom')}
              />
            );
          },
          renderer: ({ record, value }) => {
            return numberSeparatorRender(value, record.getState('uom_precision'));
          },
        },
        {
          name: 'secondaryLadderTo',
          width: 140,
          hidden: !doubleUnitFlag,
          editor: (ladderRecord) => {
            return (
              <C7nPrecisionInputNumber
                name="secondaryLadderTo"
                record={ladderRecord}
                uom="secondaryUomId"
                onChange={(value) => handleLadder(ladderRecord, value, 'secondaryLadderTo')}
              />
            );
          },
          renderer: ({ record, value }) =>
            numberSeparatorRender(value, record.getState('uom_precision')),
        },
        {
          name: 'ladderFrom',
          width: 140,
          editor: (ladderRecord) => {
            return <C7nPrecisionInputNumber name="ladderFrom" record={ladderRecord} uom="uomId" />;
          },
          renderer: ({ record, value }) =>
            doubleUnitFlag && record.get('uomId') !== record.get('secondaryUomId')
              ? numberSeparatorRender(value)
              : numberSeparatorRender(value, record.getState('uom_precision')),
        },
        {
          name: 'ladderTo',
          width: 140,
          editor: (ladderRecord) => {
            return <C7nPrecisionInputNumber name="ladderTo" record={ladderRecord} uom="uomId" />;
          },
          renderer: ({ record, value }) =>
            doubleUnitFlag && record.get('uomId') !== record.get('secondaryUomId')
              ? numberSeparatorRender(value)
              : numberSeparatorRender(value, record.getState('uom_precision')),
        },
        {
          name: 'currentLadderSecPrice',
          width: 160,
          hidden: !doubleUnitFlag,
          editor: (ladderRecord) => {
            return (
              <C7nPrecisionInputNumber
                name="currentLadderSecPrice"
                record={ladderRecord}
                headerRecord={currentLineRecord.current}
                dataSet={tableLineDS}
                currency="currencyCode"
                onChange={(val) => handleCurrentLadderPrice(val, ladderRecord)}
              />
            );
          },
          renderer: ({ value, record }) => {
            return numberSeparatorRender(value, record.getState('currency'));
          },
        },
        {
          name: 'currentNetLadderSecPrice',
          width: 160,
          hidden: !doubleUnitFlag,
          editor: (ladderRecord) => {
            return (
              <C7nPrecisionInputNumber
                name="currentNetLadderSecPrice"
                record={ladderRecord}
                currency="currencyCode"
                headerRecord={currentLineRecord.current}
                dataSet={tableLineDS}
                onChange={(val) => onChangeNetPrice(val, ladderRecord)}
              />
            );
          },
          renderer: ({ value, record }) => {
            return numberSeparatorRender(value, record.getState('currency'));
          },
        },
        {
          name: 'currentLadderPrice',
          width: 160,
          editor: (ladderRecord) => {
            return (
              <C7nPrecisionInputNumber
                name="currentLadderPrice"
                record={ladderRecord}
                headerRecord={currentLineRecord.current}
                dataSet={tableLineDS}
                currency="currencyCode"
                onChange={(val) => handleCurrentLadderPrice(val, ladderRecord)}
              />
            );
          },
          renderer: ({ value, record }) => {
            return numberSeparatorRender(value, record.getState('currency'));
          },
        },
        {
          name: 'currentNetLadderPrice',
          width: 160,
          editor: (ladderRecord) => {
            return (
              <C7nPrecisionInputNumber
                name="currentNetLadderPrice"
                record={ladderRecord}
                type="c7n-pro"
                currency="currencyCode"
                onChange={(val) => onChangeNetPrice(val, ladderRecord)}
              />
            );
          },
          renderer: ({ value, record }) => {
            return numberSeparatorRender(value, record.getState('currency'));
          },
        },
        // { name: 'cumulativeFlag', editor: true, width: 120 },
        // {
        //   name: 'validLadderSecPrice',
        //   hidden: !doubleUnitFlag,
        //   renderer: ({ value }) => numberSeparatorRender(value),
        //   width: 160,
        // },
        // {
        //   name: 'validNetLadderSecPrice',
        //   hidden: !doubleUnitFlag,
        //   width: 140,
        //   renderer: ({ value }) => numberSeparatorRender(value),
        // },
        // {
        //   name: 'validLadderPrice',
        //   renderer: ({ value }) => numberSeparatorRender(value),
        //   width: 140,
        // },
        // {
        //   name: 'validNetLadderPrice',
        //   width: 140,
        //   renderer: ({ value }) => numberSeparatorRender(value),
        // },
        // {
        //   name: 'validBargainRemark',
        //   width: 200,
        // },
        // {
        //   name: 'remark',
        //   editor: true,
        // },
      ].filter(Boolean),
    [currentLineRecord, currentLineRecord.current, readOnly, doubleUnitFlag]
  );

  const Buttons = useMemo(
    () => [
      ['add', { onClick: create }],
      <Button icon="save" onClick={handleSave} disabled={!tableLineDS?.length}>
        {intl.get('hzero.common.button.save').d('保存')}
      </Button>,
      ['delete', { onClick: deleteLines, icon: 'delete_sweep' }],
    ],
    [create, deleteLines, handleSave, tableLineDS]
  );

  // table render
  const renderTable = useCallback(() => {
    // 表格设置 ps: 如果走个性化就不需要手动添加用户个性化
    const tableCustomizeConfig =
      customizedCode && (!customizeFlag || !customizeUnitCode)
        ? {
            customizable: true,
            customizedCode,
          }
        : {};

    const tableContent = (
      <Table
        // border
        columns={editorColumns}
        dataSet={tableLineDS}
        rowKey={tableRowKey || 'offlineLadderQuotationId'}
        buttons={readOnly ? [] : Buttons}
        {...tableCustomizeConfig}
      />
    );

    if (!customizeFlag || !customizeUnitCode) {
      return tableContent;
    }

    return <div>{customizeTable({ code: customizeUnitCode }, tableContent)}</div>;
  }, [
    readOnly,
    editorColumns,
    tableLineDS,
    tableLineDS?.selected,
    Buttons,
    currentLineRecord,
    customizeUnitCode,
    tableRowKey,
  ]);

  return (
    <div>
      {renderAlert()}
      <div>
        {/* <h3 className={Styles['item-title']}>
          <div className={Styles['item-title-symbol']} />
          {intl.get('ssrc.inquiryHall.view.card.subtitle.itemInfo').d('物料信息')}
        </h3> */}
        <Form
          dataSet={formDS}
          labelLayout="vertical"
          className="c7n-pro-vertical-form-display"
          columns={3}
        >
          <Output name="itemCode" />
          <Output name="itemName" />
          <Output name="currencyCode" />
          <Output name="taxRate" />
        </Form>
      </div>

      <div className={Styles['table-content']}>
        <h3 className={Styles['item-title']}>
          <div className={Styles['item-title-symbol']} />
          {intl.get('ssrc.inquiryHall.view.title.ladderAndPriceTitle').d('阶梯与价格')}
        </h3>
        {renderTable()}
      </div>
    </div>
  );
};

export default observer(Content);
