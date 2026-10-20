import React, { Component, Fragment } from 'react';
import { Table, Modal } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import C7nPrecisionInputNumber from '@/routes/components/Precision/C7nPrecisionInputNumber';

export default class ModalChildren extends Component {
  render() {
    const { ladderQuoteDs, isEdit, record } = this.props;

    const columns = [
      {
        name: 'ladderLineNum',
        width: 80,
      },
      {
        name: 'ladderFrom',
        width: 150,
        editor: isEdit,
      },
      {
        name: 'ladderTo',
        width: 150,
        editor: isEdit,
      },
      // {
      //   name: 'currencyCode',
      //   width: 150,
      //   editor: isEdit,
      // },
      {
        name: 'ladderPrice',
        width: 150,
        editor: (rec) => {
          return (
            isEdit && (
              <C7nPrecisionInputNumber name="ladderPrice" record={rec} currency="currencyCode" />
            )
          );
        },
      },
      {
        name: 'ladderNetPrice',
        width: 150,
        editor: (rec) => {
          return (
            isEdit && (
              <C7nPrecisionInputNumber name="ladderNetPrice" record={rec} currency="currencyCode" />
            )
          );
        },
      },
      {
        name: 'ladderPriceRemark',
        width: 150,
        editor: isEdit,
      },
    ];

    const buttons = isEdit
      ? [
          [
            'add',
            {
              onClick: () => {
                const ladderTo = ladderQuoteDs.get(ladderQuoteDs.length - 1)?.get('ladderTo');
                ladderQuoteDs.create({ ladderFrom: ladderTo });
              },
            },
          ],
          [
            'delete',
            {
              icon: 'delete_sweep',
              onClick: () => {
                let flag = false;
                ladderQuoteDs.selected.forEach((i) => {
                  if (i.status !== 'add') {
                    flag = true;
                  }
                });
                if (flag) {
                  Modal.confirm({
                    title: intl.get('hzero.common.message.confirm.title').d('提示'),
                    children: intl
                      .get(`ssrc.priceAdjustmentWorkBench.view.modal.deleteLineNotification`)
                      .d('确定要删除该行吗?'),
                    onOk: () => {
                      return new Promise(async () => {
                        await ladderQuoteDs.remove(ladderQuoteDs.selected, true);
                        record.set('priceLibLadderList', ladderQuoteDs.toData());
                        // const result = onSave();
                        // reslove(result);
                      });
                    },
                  });
                } else {
                  ladderQuoteDs.remove(ladderQuoteDs.selected, true);
                  record.set('priceLibLadderList', ladderQuoteDs.toData());
                  // onSave();
                }
              },
            },
          ],
        ]
      : null;

    return (
      <Fragment>
        <Table
          customizable
          customizedCode="SPC.PRICEADJUSTMENTWORKBENCH.LIST.DETAIL.LADDER_PRICE_TABLE"
          buttons={buttons}
          style={{ maxHeight: 'calc(100vh - 200px)' }}
          dataSet={ladderQuoteDs}
          columns={columns}
        />
      </Fragment>
    );
  }
}
