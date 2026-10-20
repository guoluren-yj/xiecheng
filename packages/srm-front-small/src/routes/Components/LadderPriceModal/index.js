import React, { useState } from 'react';
import { Modal, Form, Button, InputNumber } from 'hzero-ui';
import { sum, round } from 'lodash';
import Big from 'big.js';
import uuid from 'uuid/v4';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { getEditTableData } from 'utils/utils';
import EditTable from 'components/EditTable';

export default function (props) {
  const { visible, line = {}, onCancel = (e) => e, onSaveAndClose = (e) => e } = props;
  const { $form } = line;
  const agreementLadders =
    ($form && $form.getFieldValue('agreementLadders')) || line.agreementLadders;
  const initList = (agreementLadders || []).map((m, index) => ({
    ladderId: uuid(),
    ...m,
    lineNum: index + 1,
    taxPrice: m.taxPrice || m.ladderPrice,
    unitPrice: m.unitPrice || m.ladderPrice || m.taxPrice,
    _status: 'create',
  }));
  const [dataSource, setDataSource] = useState(initList);
  const [selectedRows, setSelectedRows] = useState([]);

  const selectedRowKeys = selectedRows.map((i) => i.ladderId);

  const handleAdd = () => {
    const newDataSource = [
      ...dataSource,
      {
        ladderId: uuid(),
        _status: 'create',
        lineNum: dataSource.length + 1,
      },
    ];
    setDataSource(newDataSource);
  };

  const delArrayList = (needDelList, allList) => {
    const newList = allList.filter((p) => !needDelList.some((i) => i.ladderId === p.ladderId));
    return newList;
  };

  const handleDelete = () => {
    if (
      dataSource.length === selectedRowKeys.length ||
      dataSource[dataSource.length - 1].ladderId === selectedRowKeys[0] ||
      dataSource.length === selectedRowKeys.length
    ) {
      const newList = delArrayList(selectedRows, dataSource);
      setDataSource(newList);
      setSelectedRows([]);
    } else {
      notification.warning({
        message: intl
          .get('small.common.view.deleteLadderPriceMessage')
          .d('只能从最后一条阶梯价格开始删除'),
      });
    }
  };

  const handleSave = () => {
    const minQuantity = ($form && $form.getFieldValue('orderQuantity')) || 1;
    if (dataSource.length === 0) {
      const newLine = JSON.parse(JSON.stringify(line));
      newLine.agreementLadders = [];
      newLine.ladderFlag = 0;
      onSaveAndClose($form, newLine);
      return null;
    }
    const saveData = getEditTableData(dataSource, ['ladderId', '_status']);
    if (saveData.length > 0) {
      const newLine = JSON.parse(JSON.stringify(line));
      newLine.agreementLadders = saveData;
      newLine.ladderFlag = saveData.length > 0 ? 1 : 0;
      const isRuleValidate = !saveData.some((s, i) => {
        if (saveData[i + 1]) {
          return s.ladderTo !== saveData[i + 1].ladderFrom;
        } else {
          return false;
        }
      });
      const isMinQuantityRule = saveData[0].ladderFrom >= minQuantity;

      if (!isMinQuantityRule) {
        notification.warning({
          message: intl
            .get('small.common.view.ladderFromMinQuantity')
            .d('最小阶梯数量不能小于最小采购量'),
        });
        return null;
      }

      if (!isRuleValidate) {
        notification.warning({
          message: intl
            .get('small.common.view.saveLadderPriceMessage')
            .d('阶梯价格下一行的数量从必须等于上一行的数量至'),
        });
        return null;
      }
      onSaveAndClose($form, newLine);
    }
  };

  const renderEditTable = () => {
    const tax = ($form && $form.getFieldValue('tax')) || 0;
    const rowSelection = {
      selectedRowKeys,
      onChange: (_, rows) => setSelectedRows(rows),
    };
    const columns = [
      {
        title: intl.get('small.common.model.lineNumber').d('行号'),
        dataIndex: 'lineNum',
        width: 60,
      },
      {
        title: intl.get('small.common.model.numberFrom').d('数量从(>=)'),
        dataIndex: 'ladderFrom',
        width: 120,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('ladderFrom', {
                initialValue: val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('small.common.model.numberFromMsg').d('数量从'),
                    }),
                  },
                  {
                    validator: (rule, ladderFrom, callback) => {
                      const ladderTo = record.$form.getFieldValue('ladderTo');
                      const flag = ladderTo === undefined || ladderTo === null;
                      if (!flag && ladderFrom > ladderTo) {
                        callback(
                          new Error(
                            intl.get(`small.common.model.ladderFromError`).d('数量从不能大于数量至')
                          )
                        );
                      } else {
                        callback();
                      }
                    },
                  },
                ],
              })(
                <InputNumber
                  min={1}
                  max={99999999999999}
                  style={{ width: '100%' }}
                  onChange={(ladderFrom) => {
                    if (ladderFrom <= record.$form.getFieldValue('ladderTo')) {
                      record.$form.setFieldsValue({
                        ladderTo: record.$form.getFieldValue('ladderTo'),
                      });
                    }
                  }}
                />
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get('small.common.model.numberTo').d('数量至(<)'),
        dataIndex: 'ladderTo',
        width: 120,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('ladderTo', {
                initialValue: val,
                rules: [
                  {
                    required: dataSource[dataSource.length - 1].ladderId !== record.ladderId,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('small.common.model.numberToMsg').d('数量至'),
                    }),
                  },
                  {
                    validator: (rule, ladderTo, callback) => {
                      const ladderFrom = record.$form.getFieldValue('ladderFrom');
                      const flag = ladderFrom === undefined || ladderFrom === null;
                      if (!flag && ladderFrom > ladderTo) {
                        callback(
                          new Error(
                            intl.get(`small.common.model.ladderToError`).d('数量至不能小于数量从')
                          )
                        );
                      } else {
                        callback();
                      }
                    },
                  },
                ],
              })(
                <InputNumber
                  min={1}
                  max={99999999999999}
                  style={{ width: '100%' }}
                  onChange={(ladderTo) => {
                    if (ladderTo >= record.$form.getFieldValue('ladderFrom')) {
                      record.$form.setFieldsValue({
                        ladderFrom: record.$form.getFieldValue('ladderFrom'),
                      });
                    }
                  }}
                />
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      // {
      //   title: intl.get('small.common.model.noTaxPrice').d('未税单价'),
      //   dataIndex: 'unitPrice',
      //   width: 120,
      //   align: 'right',
      //   render: (val, record) =>
      //     ['update', 'create'].includes(record._status) ? (
      //       <Form.Item>
      //         {record.$form.getFieldDecorator('unitPrice', {
      //           initialValue: record.unitPrice,
      //           rules: [
      //             {
      //               required: true,
      //               message: intl.get('hzero.common.validation.notNull', {
      //                 name: intl.get('small.common.model.noTaxPrice').d('未税单价'),
      //               }),
      //             },
      //             {
      //               validator: (rule, value, callback) => {
      //                 const valueStr = String(value);
      //                 const [prev, next] = valueStr.split('.');
      //                 if (prev && prev.length > 10) {
      //                   callback(
      //                     new Error(
      //                       intl
      //                         .get(`small.common.model.pointIntLengthTen`)
      //                         .d('整数位最多不超过十位')
      //                     )
      //                   );
      //                 } else if (next && next.length > 10) {
      //                   callback(
      //                     new Error(
      //                       intl
      //                         .get(`small.common.model.pointDecimalLengthTen`)
      //                         .d('小数位最多不超过十位')
      //                     )
      //                   );
      //                 } else {
      //                   callback();
      //                 }
      //               },
      //             },
      //           ],
      //         })(
      //           <InputNumber
      //             min={0}
      //             style={{ width: '100%' }}
      //             onChange={value => {
      //               if (typeof value === 'number') {
      //                 const _unitPrice = new Big(value);
      //                 // 未税单价*(1+税率) = 含税单价
      //                 const _tax = new Big(tax);
      //                 const taxPrice = _tax
      //                   .times(0.01)
      //                   .plus(1)
      //                   .times(_unitPrice);
      //                 record.$form.setFieldsValue({ taxPrice: round(taxPrice, 10) });
      //               }
      //             }}
      //           />
      //         )}
      //       </Form.Item>
      //     ) : (
      //       val
      //     ),
      // },
      {
        title: intl.get('small.common.model.taxPrice').d('含税单价'),
        dataIndex: 'taxPrice',
        width: 120,
        align: 'right',
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('taxPrice', {
                initialValue: record.taxPrice,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('small.common.model.taxPrice').d('含税单价'),
                    }),
                  },
                  {
                    validator: (rule, value, callback) => {
                      const valueStr = String(value);
                      const [prev, next] = valueStr.split('.');
                      if (prev && prev.length > 10) {
                        callback(
                          new Error(
                            intl
                              .get(`small.common.model.pointIntLengthTen`)
                              .d('整数位最多不超过十位')
                          )
                        );
                      } else if (next && next.length > 10) {
                        callback(
                          new Error(
                            intl
                              .get(`small.common.model.pointDecimalLengthTen`)
                              .d('小数位最多不超过十位')
                          )
                        );
                      } else {
                        callback();
                      }
                    },
                  },
                ],
              })(
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  onChange={(value) => {
                    if (typeof value === 'number') {
                      const taxPrice = new Big(value);
                      // 未税单价*(1+税率) = 含税单价
                      const _tax = new Big(tax);
                      const unitPrice = taxPrice.div(_tax.times(0.01).plus(1));
                      record.$form.setFieldsValue({ unitPrice: round(unitPrice, 10) });
                    }
                  }}
                />
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
    ];
    const scrollWidth = sum(columns.map((n) => n.width));
    return (
      <EditTable
        bordered
        className="small-table-all-space"
        scroll={{ x: scrollWidth }}
        rowKey="ladderId"
        columns={columns}
        pagination={false}
        dataSource={dataSource}
        rowSelection={rowSelection}
      />
    );
  };

  const footer = (
    <React.Fragment>
      <Button onClick={handleDelete} disabled={selectedRowKeys.length === 0}>
        {intl.get('hzero.common.button.delete').d('删除')}
      </Button>
      <Button onClick={handleAdd}>{intl.get('hzero.common.button.create').d('新建')}</Button>
      <Button type="primary" onClick={handleSave}>
        {intl.get('hzero.common.button.save').d('保存')}
      </Button>
    </React.Fragment>
  );
  return (
    <Modal
      visible={visible}
      width={800}
      footer={footer}
      onCancel={() => onCancel()}
      title={intl.get('small.common.model.ladderPrice').d('阶梯价格')}
    >
      {renderEditTable()}
      <p style={{ marginTop: '24px' }}>
        {intl
          .get('small.common.view.mantainLadderPriceMessage')
          .d(
            '最后一行数量至若不维护则上限为无穷大，若维护则上限为维护的数量。一次性只能购买维护的数量范围内的商品。'
          )}
      </p>
    </Modal>
  );
}
