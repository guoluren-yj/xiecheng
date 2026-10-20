import React, { useMemo, useCallback, useImperativeHandle } from 'react';
import { Table, Form, Output, Icon } from 'choerodon-ui/pro';
import { Alert } from 'choerodon-ui';
import { noop, throttle, isNil } from 'lodash';
import { math } from 'choerodon-ui/dataset';
import { observer } from 'mobx-react-lite';

import notification from 'utils/notification';
// import { yesOrNoRender } from 'utils/renderer';
import intl from 'utils/intl';

import C7nPrecisionInputNumber from '@/routes/components/Precision/C7nPrecisionInputNumber';
import { numberSeparatorRender } from '@/utils/renderer';
import { calculateBasicQty } from '@/utils/utils';

import Styles from '../index.less';

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
    doubleUnitFlag = false,
    headerDS = {},
    diyLadderQuotationFlag = 0,
    onRef,
    tableRowKey,
    tenantId,
  } = props;

  useImperativeHandle(onRef, () => {
    return {
      handleSave,
    };
  });

  const { existBargainedFlag = 0 } = headerDS?.current
    ? headerDS.current.get(['existBargainedFlag'])
    : {};

  // 含税单价
  const handleCurrentLadderPrice = (val, lineRecord) => {
    const taxRate = currentLineRecord.get('taxRate');
    if (!val && val !== 0) {
      lineRecord.set(doubleUnitFlag ? 'currentNetLadderPrice' : 'currentNetLadderPrice', null);
      return;
    }

    const precision = lineRecord.getState('currency') ?? math.dp(val);
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

    const saveResult = await tableLineDS.submit();

    return saveResult;
  }, [tableLineDS]);

  // create line
  const create = useCallback(
    throttle(() => {
      const formData = currentLineRecord?.toData() || {};
      const { quotationLineCurrentId, currencyCode, secondaryUomId, uomId } = formData;

      const nextTableLength = tableLineDS.length + 1;

      const lineData = {
        quotationLineCurrentId,
        ladderFrom: null,
        ladderTo: null,
        currentLadderPrice: null,
        validLadderPrice: null,
        validBargainPrice: null,
        rfxLadderLineNum: nextTableLength,
        currencyCode,
        secondaryUomId,
        uomId,
        tenantId,
        organizationId,
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
    }, 1500),
    [currentLineRecord, organizationId, tableLineDS, tenantId]
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
        // TODO：执行完删除操作后，手动清除ds缓存；后续看框架内部删除机制对于新增状态数据是不是有特殊处理
        tableLineDS.clearCachedRecords();
        tableLineDS.unSelectAll();
        tableLineDS.clearCachedSelected();
        tableLineDS.query();
      }
    } catch (e) {
      throw e;
    }
  }, [tableLineDS]);

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
    if (value) {
      if (doubleUnitFlag && itemId) {
        if (secondaryUomId) {
          calculateBasicQty({
            secondaryQuantity: value,
            itemId,
            businessKey: -1,
            doublePrimaryUomId: uomId,
            secondaryUomId,
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
                queryPrecisionParams={{
                  purTenantId: tenantId,
                }}
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
                queryPrecisionParams={{
                  purTenantId: tenantId,
                }}
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
            return (
              <C7nPrecisionInputNumber
                name="ladderFrom"
                record={ladderRecord}
                uom="uomId"
                queryPrecisionParams={{ purTenantId: tenantId }}
              />
            );
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
            return (
              <C7nPrecisionInputNumber
                name="ladderTo"
                record={ladderRecord}
                uom="uomId"
                queryPrecisionParams={{ purTenantId: tenantId }}
              />
            );
          },
          renderer: ({ record, value }) =>
            doubleUnitFlag && record.get('uomId') !== record.get('secondaryUomId')
              ? numberSeparatorRender(value)
              : numberSeparatorRender(value, record.getState('uom_precision')),
        },
        {
          name: 'currentLadderSecPrice',
          width: 140,
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
                queryPrecisionParams={{
                  purTenantId: tenantId,
                }}
              />
            );
          },
          renderer: ({ dataSet, value }) =>
            numberSeparatorRender(value, dataSet.getState('currency_precision')),
        },
        {
          name: 'currentNetLadderSecPrice',
          width: 140,
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
                queryPrecisionParams={{
                  purTenantId: tenantId,
                }}
              />
            );
          },
          renderer: ({ dataSet, value }) =>
            numberSeparatorRender(value, dataSet.getState('currency_precision')),
        },
        {
          name: 'currentLadderPrice',
          width: 140,
          editor: (ladderRecord) => {
            return (
              <C7nPrecisionInputNumber
                name="currentLadderPrice"
                record={ladderRecord}
                headerRecord={currentLineRecord.current}
                dataSet={tableLineDS}
                currency="currencyCode"
                onChange={(val) => handleCurrentLadderPrice(val, ladderRecord)}
                queryPrecisionParams={{
                  purTenantId: tenantId,
                }}
              />
            );
          },
          renderer: ({ value, dataSet }) =>
            numberSeparatorRender(value, dataSet.getState('currency_precision')),
        },
        {
          name: 'currentNetLadderPrice',
          width: 140,
          editor: (ladderRecord) => {
            return (
              <C7nPrecisionInputNumber
                name="currentNetLadderPrice"
                record={ladderRecord}
                headerRecord={currentLineRecord.current}
                dataSet={tableLineDS}
                currency="currencyCode"
                onChange={(val) => onChangeNetPrice(val, ladderRecord)}
                queryPrecisionParams={{
                  purTenantId: tenantId,
                }}
              />
            );
          },
          renderer: ({ value, dataSet }) =>
            numberSeparatorRender(value, dataSet.getState('currency_precision')),
        },
        { name: 'cumulativeFlag', editor: true, width: 120 },
        {
          name: 'validLadderSecPrice',
          hidden: !doubleUnitFlag,
          renderer: ({ value }) => numberSeparatorRender(value),
          width: 160,
          align: 'right',
        },
        {
          name: 'validNetLadderSecPrice',
          hidden: !doubleUnitFlag,
          width: 160,
          align: 'right',
          renderer: ({ value }) => numberSeparatorRender(value),
        },
        {
          name: 'validLadderPrice',
          renderer: ({ value }) => numberSeparatorRender(value),
          width: 160,
          align: 'right',
        },
        {
          name: 'validNetLadderPrice',
          width: 160,
          align: 'right',
          renderer: ({ value }) => numberSeparatorRender(value),
        },
        {
          name: 'validBargainPrice',
          width: 160,
          hidden: !existBargainedFlag,
          renderer: ({ value }) => numberSeparatorRender(value),
        },
        {
          name: 'validBargainRemark',
          width: 200,
          hidden: !existBargainedFlag,
        },
        {
          name: 'remark',
          editor: false,
        },
      ].filter(Boolean),
    [
      currentLineRecord,
      currentLineRecord.current,
      existBargainedFlag,
      readOnly,
      doubleUnitFlag,
      diyLadderQuotationFlag,
      tenantId,
    ]
  );

  const Buttons = useMemo(
    () => [
      ['add', { onClick: create }],
      // <Button icon="save" onClick={handleSave}>
      //   {intl.get('hzero.common.button.save').d('保存')}
      // </Button>,
      ['delete', { onClick: deleteLines }],
    ],
    [create, deleteLines]
  );

  // table render
  const renderTable = useCallback(() => {
    const tableContent = (
      <Table
        // border
        columns={editorColumns}
        dataSet={tableLineDS}
        rowKey={tableRowKey || readOnly ? 'rfxLadderLineNum' : 'ladderQuotationCurrentId'}
        buttons={readOnly || !diyLadderQuotationFlag ? [] : Buttons}
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
    Buttons,
    currentLineRecord,
    customizeUnitCode,
    tableRowKey,
  ]);

  return (
    <div>
      {renderAlert()}
      <div className={Styles['form-content-common-wrap']}>
        {/* <h3 className={Styles['item-title']}>
          <div className={Styles['item-title-symbol']} />
          {intl.get('ssrc.inquiryHall.view.card.subtitle.itemInfo').d('物料信息')}
        </h3> */}

        <Form
          dataSet={formDS}
          // labelLayout="float"
          columns={3}
          labelLayout="vertical"
          className="c7n-pro-vertical-form-display"
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
