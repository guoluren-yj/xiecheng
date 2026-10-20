import React from 'react';
import { observer } from 'mobx-react-lite';
import { DataSet, Modal, Button, Table } from 'choerodon-ui/pro';
import BigNumber from 'bignumber.js';
import { math } from 'choerodon-ui/dataset';

import intl from 'utils/intl';
import notification from 'utils/notification';

import { isCustomNumber } from '@/utils/precision';
import { caculateNoTaxPrice, caculateTaxPrice } from '../utils';
import { precisionEditor, precisionRender } from '../../utilsApi/precision';
import { ladderDs } from './ds';

const modalProps = {
  movable: false,
  closable: true,
  mask: true,
  maskClosable: false,
  destroyOnClose: true,
  drawer: true,
  okText: intl.get('hzero.common.button.save').d('保存'),
};

const DelBtn = observer(({ dataSet, onClick = (e) => e }) => (
  <Button
    icon="delete_sweep"
    funcType="flat"
    color="primary"
    disabled={dataSet.selected.length < 1}
    onClick={onClick}
  >
    {intl.get('smpc.product.button.batchDelete').d('批量删除')}
  </Button>
));

// 阶梯价格的几种方法
function ladderSet(ds) {
  // 初始化
  function _init(data = []) {
    const _data = data.map((d, ind) => ({ ...d, _number: ind + 1 }));
    ds.loadData(_data);
    _update();
  }
  // 新建
  function _create() {
    const data = ds.toData();
    const { _number = 0 } = data.pop() || {};
    ds.create({ _number: _number + 1 });
    _update();
  }
  // 删除
  function _delete() {
    const ladders = ds.toData();
    const selects = ds.selected.map((m) => m.toData());
    const filters = ladders.filter((f) => !selects.some((s) => s._number === f._number));
    const filterEnd = filters.pop();
    if (filterEnd && selects[0]._number - 1 !== filterEnd._number) {
      notification.warning({
        message: intl
          .get('sagm.common.view.deleteLadderPriceMessage')
          .d('只能从最后一条阶梯价格开始删除'),
      });
      return false;
    }
    ds.selected.forEach((_f) => {
      const f = _f;
      f.status = 'add';
    });
    ds.remove(ds.selected);
    _update();
  }
  // 属性更新
  function _update() {
    ds.forEach((record, ind) => {
      const field = record.getField('ladderTo');
      if (ind === ds.length - 1) {
        field.set('required', false);
      } else {
        field.set('required', true);
      }
    });
  }
  return {
    init: _init,
    create: _create,
    delete: _delete,
    update: _update,
  };
}

// 阶梯价格
export default function openLadderPrice({
  data = [],
  tax = 0,
  uomPrecision = 6,
  isPriceRule,
  priceIncludeTaxEditable,
  defaultPrecision = 10,
  readOnly = false,
  title = readOnly
    ? intl.get('smpc.product.model.viewLadderPriceSet').d('查看阶梯价格')
    : intl.get('smpc.product.model.ladderPriceSet').d('设置阶梯价格'),
  onSave = (e) => e,
}) {
  const ds = new DataSet(ladderDs(readOnly));
  const ladderRef = ladderSet(ds);
  ladderRef.init(data);
  const columns = [
    // { name: 'number', width: 80 },
    {
      name: 'ladderFrom',
      minWidth: 120,
      align: 'right',
      editor: (record) => {
        if (readOnly) {
          return false;
        }
        return precisionEditor({
          record,
          name: 'ladderFrom',
          precision: uomPrecision,
        });
      },
      renderer: readOnly ? precisionRender : undefined,
    },
    {
      name: 'ladderTo',
      minWidth: 120,
      align: 'right',
      renderer: readOnly ? precisionRender : undefined,
      editor: (record) => {
        if (readOnly) {
          return false;
        }
        return precisionEditor({
          record,
          name: 'ladderTo',
          precision: uomPrecision,
        });
      },
    },
    {
      name: 'unitPrice',
      width: 160,
      renderer: readOnly ? precisionRender : undefined,
      editor: (record) => {
        const isPriceRuleNoEdit = isPriceRule && priceIncludeTaxEditable;
        if (readOnly || isPriceRuleNoEdit) {
          return false;
        }
        return precisionEditor({
          record,
          type: 'currency',
          name: 'unitPrice',
          precision: defaultPrecision,
          onChange: (val) => {
            const unitPrice = new BigNumber(val);
            const _tax = new BigNumber(tax || 0);
            if (isCustomNumber(unitPrice)) {
              const taxPrice = caculateTaxPrice(unitPrice, _tax, defaultPrecision);
              record.set('taxPrice', taxPrice);
            }
          },
        });
      },
    },
    {
      name: 'taxPrice',
      width: 160,
      renderer: readOnly ? precisionRender : undefined,
      editor: (record) => {
        const isPriceRuleNoEdit = isPriceRule && !priceIncludeTaxEditable;
        if (readOnly || isPriceRuleNoEdit) {
          return false;
        }
        return precisionEditor({
          record,
          type: 'currency',
          name: 'taxPrice',
          precision: defaultPrecision,
          onChange: (val) => {
            const taxPrice = new BigNumber(val);
            const _tax = new BigNumber(tax || 0);
            if (isCustomNumber(taxPrice)) {
              const unitPrice = caculateNoTaxPrice(taxPrice, _tax, defaultPrecision);
              record.set('unitPrice', unitPrice);
            }
          },
        });
      },
    },
  ];

  const buttons = [
    <Button icon="playlist_add" funcType="flat" color="primary" onClick={ladderRef.create}>
      {intl.get('hzero.common.button.create').d('新建')}
    </Button>,
    <DelBtn dataSet={ds} onClick={ladderRef.delete} />,
  ];

  const otherProps = readOnly
    ? {
        okCancel: false,
        okText: intl.get('hzero.common.button.close').d('关闭'),
      }
    : {
        onOk: async () => {
          const flag = await ds.validate();
          if (flag) {
            const skuSalesLadders = ds.toData();
            const isRuleValidate = skuSalesLadders.some((s, i) => {
              if (skuSalesLadders[i + 1]) {
                return !math.eq(s.ladderTo, skuSalesLadders[i + 1].ladderFrom);
              } else {
                return false;
              }
            });
            if (isRuleValidate) {
              notification.warning({
                message: intl
                  .get('smpc.product.view.saveLadderPriceMessage')
                  .d('阶梯价格下一行的数量从必须等于上一行的数量至'),
              });
              return false;
            }
            onSave(skuSalesLadders);
          } else {
            return false;
          }
        },
      };

  Modal.open({
    title,
    ...modalProps,
    ...otherProps,
    style: { width: 742 },
    children: (
      <Table
        dataSet={ds}
        columns={columns}
        buttons={readOnly ? [] : buttons}
        customizedCode="SKU.VIEW_PRICE_LADDERS"
        style={{ maxHeight: `calc(100vh - ${readOnly ? 170 : 200}px)` }}
      />
    ),
  });
}
