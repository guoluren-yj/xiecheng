import React from 'react';
import { observer } from 'mobx-react-lite';
import { DataSet, Modal, Button, Table } from 'choerodon-ui/pro';
import BigNumber from 'bignumber.js';
import { math } from 'choerodon-ui/dataset';

import intl from 'utils/intl';
import notification from 'utils/notification';

import { maxSAGMMessageValidator } from '@/utils/validator';

import {
  precisionEditor,
  precisionRender,
  caculateTaxPrice,
  caculateNoTaxPrice,
} from '@/utils/precision';
import { confirm } from '@/utils/c7nModal';
// import { ladderDs } from './ds';
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
    {intl.get('small.mallProtocolManagement.view.btn.batchDelete').d('批量删除')}
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
    ds.create({ _number: _number + 1, lineNum: _number + 1 });
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
    confirm({
      content: intl.get('sagm.common.modal.confirm.content').d('是否确定删除?'),
      onOk: () => {
        ds.selected.forEach((_f) => {
          const f = _f;
          f.status = 'add';
        });
        ds.remove(ds.selected);
        _update();
      },
    });
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

const openLadderPrice = ({
  data = [],
  tax = 0,
  uomPrecision = 6,
  // isPriceRule,
  // priceIncludeTaxEditable,
  defaultPrecision = 10,
  readFields = [],
  readOnly = false,
  title = readOnly
    ? intl.get('sagm.common.model.viewLadderPriceSet').d('查看阶梯价格')
    : intl.get('sagm.common.model.ladderPriceSet').d('设置阶梯价格'),
  onSave = (e) => e,
}) => {
  const ds = new DataSet(ladderDs(readOnly));
  const ladderRef = ladderSet(ds);
  const [readField] = readFields;
  ladderRef.init(data);
  const columns = [
    {
      name: 'lineNum',
      width: 80,
      renderer: ({ record }) => record.get('_number'),
    },
    {
      name: 'ladderFrom',
      minWidth: 120,
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
      editor: (record, name) => {
        if (readOnly || name !== readField) {
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
            const taxPrice = caculateTaxPrice(unitPrice, _tax, defaultPrecision);
            record.set('taxPrice', taxPrice);
          },
        });
      },
    },
    {
      name: 'taxPrice',
      width: 160,
      renderer: readOnly ? precisionRender : undefined,
      editor: (record, name) => {
        if (readOnly || name !== readField) {
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
            const unitPrice = caculateNoTaxPrice(taxPrice, _tax, defaultPrecision);
            record.set('unitPrice', unitPrice);
          },
        });
      },
    },
  ];

  const buttons = [
    <Button icon="playlist_add" funcType="flat" color="primary" onClick={ladderRef.create}>
      {intl.get('hzero.common.button.add').d('新增')}
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
                  .get('sagm.protocolManagement.view.saveLadderPriceMessage')
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
        customizedCode="SAGM.PROTOCOL_MANAGEMENT.LADDERPRICE"
        style={{ maxHeight: 'calc(100vh - 192px)' }}
        dataSet={ds}
        columns={columns}
        buttons={readOnly ? [] : buttons}
      />
    ),
  });
};

// 阶梯价格
const ladderDs = (readOnly) => ({
  paging: false,
  selection: readOnly ? false : 'multiple',
  fields: [
    {
      name: 'lineNum',
      label: intl.get('sagm.protocolManagement.model.lineNum').d('行号'),
    },
    {
      name: 'ladderFrom',
      label: intl.get('sagm.protocolManagement.model.ladderFrom').d('数量从>='),
      required: true,
      type: 'number',
      // precision: 0,
      min: 1,
      // max: '99999999999999999999',
      // step: 1,
      validator: (value, name, record) => {
        const quantityTo = record.get('ladderTo');
        if (quantityTo && math.lte(quantityTo, value)) {
          return intl.get('sagm.protocolManagement.model.ladderFromMsg').d('数量从必须小于数量至');
        }
        if (math.gte(value, '100000000000000000000')) {
          return intl.get('sagm.common.view.maxMessage').d('值必须小于100000000000000000000');
        }
      },
    },
    {
      name: 'ladderTo',
      label: intl.get('sagm.protocolManagement.model.ladderTo').d('数量至<'),
      type: 'number',
      // precision: 0,
      // step: 1,
      // max: '99999999999999999999',
      // min: 'ladderFrom',
      validator: (value, name, record) => {
        const quantityFrom = record.get('ladderFrom');
        if (quantityFrom && value && math.gte(quantityFrom, value)) {
          return intl.get('sagm.protocolManagement.model.ladderToMsg').d('数量至必须大于数量从');
        }
        if (math.gte(value, '100000000000000000000')) {
          return intl.get('sagm.common.view.maxMessage').d('值必须小于100000000000000000000');
        }
      },
    },
    {
      name: 'unitPrice',
      type: 'number',
      label: intl.get('sagm.common.view.price.noTax').d('单价(不含税)'),
      min: 0,
      // max: '99999999999999999999',
      required: true,
      transformResponse(_, data) {
        const { unitPrice, ladderPrice } = data;
        return unitPrice || ladderPrice;
      },
      validator: maxSAGMMessageValidator,
    },
    {
      name: 'taxPrice',
      type: 'number',
      label: intl.get('sagm.common.view.price.tax').d('单价(含税)'),
      min: 0,
      // max: '99999999999999999999',
      required: true,
      transformResponse(_, data) {
        const { taxPrice, ladderPrice, taxIncludedUnitPrice } = data;
        return taxPrice || ladderPrice || taxIncludedUnitPrice;
      },
      validator: maxSAGMMessageValidator,
    },
  ],
});

export { openLadderPrice };
