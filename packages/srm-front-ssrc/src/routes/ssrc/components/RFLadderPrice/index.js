import React, { useCallback } from 'react';
import intl from 'utils/intl';
import { noop } from 'lodash';
import { Form, Table, Output, useModal, DataSet } from 'choerodon-ui/pro';

import notification from 'utils/notification';

import C7nPrecisionInputNumber from '@/routes/components/Precision/C7nPrecisionInputNumber';
import { numberSeparatorRender } from '@/utils/renderer';
import { calculateBasicQty } from '@/utils/utils';
import styles from './index.less';

import { ladderQuotationTableDS } from './indexDS';

const LadderPrice = (props) => {
  const {
    record,
    disabled = false,
    doubleUnitFlag = false,
    sourceCategory = 'RFI',
    current,
    page = 1,
    pageSize = 10,
    onSave = noop,
    onQuery = noop,
  } = props;

  const Modal = useModal();

  // 数量计算
  const changeQty = useCallback(
    async ({ line, type, secondaryType }) => {
      // 在这个地方单独计算数量是因为精度组件会触发两次ds的update
      const secondaryQuantity = line.get(secondaryType);
      if (record.get('itemId') && doubleUnitFlag) {
        if (record.get('secondaryUomId')) {
          const res = await calculateBasicQty({
            secondaryQuantity,
            itemId: record.get('itemId'),
            businessKey: record.get('rfxLineItemId') || record.id,
            doublePrimaryUomId: record.get('uomId'),
            secondaryUomId: record.get('secondaryUomId'),
            tenantId: current?.get('tenantId'),
          });
          line.set(type, res ?? '');
        }
      } else {
        line.set(type, secondaryQuantity ?? '');
      }
    },
    [doubleUnitFlag, current]
  );

  // 阶梯报价
  const showLadderQuotation = async () => {
    // 保存供应商行
    const result = await onSave();
    if (!result) return;

    // 查询供应商行
    onQuery(page - 1, pageSize);

    const ladderQuotationTableDs = new DataSet(
      ladderQuotationTableDS({
        benchmarkPriceType: record.get('benchmarkPriceType'),
        taxRate: record.get('taxRate'),
        abandonedFlag: record.get('abandonedFlag'),
        doubleUnitFlag,
        sourceCategory,
      })
    );
    ladderQuotationTableDs.setQueryParameter('quotationLineId', record.get('quotationLineId'));
    ladderQuotationTableDs.setQueryParameter(
      'quotationLineVersionId',
      record.get('quotationLineVersionId')
    );
    ladderQuotationTableDs.query();

    const columns = [
      {
        name: 'rfLadderLineNum',
        width: 80,
      },
      doubleUnitFlag
        ? {
            name: 'secondaryLadderFrom',
            width: 120,
            editor: (_record) => {
              return (
                <C7nPrecisionInputNumber
                  name="secondaryLadderFrom"
                  headerRecord={record}
                  record={_record}
                  uom="secondaryUomId"
                  dataSet={ladderQuotationTableDs}
                  onBlur={(val) =>
                    changeQty({
                      e: val,
                      line: _record,
                      type: 'ladderFrom',
                      secondaryType: 'secondaryLadderFrom',
                    })
                  }
                />
              );
            },
            renderer: ({ value, dataSet }) =>
              numberSeparatorRender(value, dataSet.getState('uom_precision')),
          }
        : null,
      doubleUnitFlag
        ? {
            name: 'secondaryLadderTo',
            width: 120,
            editor: (_record) => {
              return (
                <C7nPrecisionInputNumber
                  name="secondaryLadderTo"
                  record={_record}
                  dataSet={ladderQuotationTableDs}
                  headerRecord={record}
                  uom="secondaryUomId"
                  onBlur={(val) =>
                    changeQty({
                      e: val,
                      line: _record,
                      type: 'ladderTo',
                      secondaryType: 'secondaryLadderTo',
                    })
                  }
                />
              );
            },
            renderer: ({ value, dataSet }) =>
              numberSeparatorRender(value, dataSet.getState('uom_precision')),
          }
        : null,
      {
        name: 'ladderFrom',
        width: 120,
        editor: (_record) => {
          return (
            <C7nPrecisionInputNumber
              name="ladderFrom"
              headerRecord={record}
              record={_record}
              dataSet={ladderQuotationTableDs}
              uom="uomId"
            />
          );
        },
        renderer: ({ value, dataSet }) =>
          doubleUnitFlag && record.get('itemId')
            ? numberSeparatorRender(value)
            : numberSeparatorRender(value, dataSet.getState('uom_precision')),
      },
      {
        name: 'ladderTo',
        width: 120,
        editor: (_record) => {
          return (
            <C7nPrecisionInputNumber
              name="ladderTo"
              headerRecord={record}
              record={_record}
              dataSet={ladderQuotationTableDs}
              uom="uomId"
            />
          );
        },
        renderer: ({ value, dataSet }) =>
          doubleUnitFlag && record.get('itemId')
            ? numberSeparatorRender(value)
            : numberSeparatorRender(value, dataSet.getState('uom_precision')),
      },
      doubleUnitFlag
        ? {
            name: 'validLadderSecondaryPrice',
            width: 120,
            editor: (_record) => {
              return (
                <C7nPrecisionInputNumber
                  name="validLadderPrice"
                  record={_record}
                  dataSet={ladderQuotationTableDs}
                  headerRecord={record}
                  currency="currencyCode"
                />
              );
            },
            renderer: ({ value, dataSet }) =>
              numberSeparatorRender(value, dataSet.getState('currency_precision')),
          }
        : null,
      doubleUnitFlag
        ? {
            name: 'validNetLadderSecPrice',
            width: 120,
            editor: (_record) => {
              return (
                <C7nPrecisionInputNumber
                  name="validNetLadderPrice"
                  record={_record}
                  dataSet={ladderQuotationTableDs}
                  headerRecord={record}
                  currency="currencyCode"
                />
              );
            },
            renderer: ({ value, dataSet }) =>
              numberSeparatorRender(value, dataSet.getState('currency_precision')),
          }
        : null,
      {
        name: 'validLadderPrice',
        width: 120,
        editor: (_record) => {
          return (
            <C7nPrecisionInputNumber
              name="validLadderPrice"
              record={_record}
              dataSet={ladderQuotationTableDs}
              headerRecord={record}
              currency="currencyCode"
            />
          );
        },
        renderer: ({ value, dataSet }) =>
          numberSeparatorRender(value, dataSet.getState('currency_precision')),
      },
      {
        name: 'validNetLadderPrice',
        width: 120,
        editor: (_record) => {
          return (
            <C7nPrecisionInputNumber
              name="validNetLadderPrice"
              record={_record}
              dataSet={ladderQuotationTableDs}
              headerRecord={record}
              currency="currencyCode"
            />
          );
        },
        renderer: ({ value, dataSet }) =>
          numberSeparatorRender(value, dataSet.getState('currency_precision')),
      },
      {
        name: 'remark',
        width: 120,
        editor: true,
      },
    ].filter(Boolean);
    // 删除
    const handleDelete = () => {
      const { selected } = ladderQuotationTableDs;

      const unAddSelectedLines = selected.filter((line) => line.status !== 'add');
      if (!unAddSelectedLines?.length) {
        ladderQuotationTableDs.remove(selected, 1);
        // 如果勾选的数据全部为新建的，删除完毕重排行号
        ladderQuotationTableDs.forEach((item, index) => {
          if (!item) {
            return;
          }
          item.set('rfLadderLineNum', index + 1);
        });
      }
      const unAddAllLines = ladderQuotationTableDs.filter((line) => line.status !== 'add');
      const endSelectedLine = unAddAllLines.slice(unAddAllLines.length - unAddSelectedLines.length);
      let matchFlag = 1;
      endSelectedLine.forEach((line) => {
        const rfLadderLineNum = line.get('rfLadderLineNum');
        const matchSelectedLine = unAddSelectedLines.find(
          (selectedLine) => selectedLine.get('rfLadderLineNum') === rfLadderLineNum
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
      ladderQuotationTableDs.delete(unAddSelectedLines, {
        title: intl.get('hzero.common.message.confirm.title').d('提示'),
        children: intl.get('hzero.common.view.delete_selected_row_confirm').d('确认删除选中行？'),
      });
    };
    const buttons = [
      [
        'add',
        {
          onClick: () => {
            ladderQuotationTableDs.create({}, ladderQuotationTableDs.length);
          },
        },
      ],
      ['delete', { onClick: handleDelete }],
    ];
    return Modal.open({
      title: intl.get('ssrc.rf.view.message.ladderQuotation').d('阶梯报价'),
      style: {
        width: 742,
      },
      drawer: true,
      onOk: async () => {
        ladderQuotationTableDs.records.forEach((item) => {
          // eslint-disable-next-line no-param-reassign
          item.status = 'update';
        });
        const flag = await ladderQuotationTableDs.validate();
        if (!flag) {
          return false;
        }
        await ladderQuotationTableDs.submit();
        onQuery(page - 1, pageSize);
      },
      okText: intl.get('hzero.common.button.save').d('保存'),
      closable: true,
      className: styles['rf-ladder-quotation-modal-wrapper'],
      children: (
        <React.Fragment>
          <h3 className={styles['ladder-sub-title']}>
            <div className={styles['ladder-sub-title-line']} />
            {intl.get('ssrc.rf.view.card.subtitle.itemInfo').d('物料信息')}
          </h3>
          <Form
            labelLayout="vertical"
            columns={2}
            labelAlign="left"
            className="c7n-pro-vertical-form-display"
          >
            <Output
              label={intl.get('ssrc.rf.model.rf.itemCode').d('物料编码')}
              value={record.get('itemCode')}
            />
            <Output
              label={intl.get('ssrc.rf.model.rf.itemName').d('物料名称')}
              value={record.get('itemName')}
            />
          </Form>
          <h3 className={styles['ladder-sub-title']}>
            <div className={styles['ladder-sub-title-line']} />
            {intl.get('ssrc.rf.view.card.subtitle.quotationInfo').d('报价信息')}
          </h3>
          <Table
            dataSet={ladderQuotationTableDs}
            columns={columns}
            buttons={buttons}
            style={{ maxHeight: 'calc(100vh - 370px)' }}
          />
        </React.Fragment>
      ),
      afterClose: () => {
        ladderQuotationTableDs.loadData([]);
      },
    });
  };

  return (
    <a onClick={() => showLadderQuotation(record)} disabled={disabled}>
      {intl.get(`ssrc.rf.view.message.button.ladderLevel`).d('阶梯报价')}
    </a>
  );
};

export default LadderPrice;
