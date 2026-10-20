import React from 'react';
import { Modal, Form, Button, InputNumber, Table } from 'hzero-ui';
import { sum } from 'lodash';
import { Bind } from 'lodash-decorators';
import BigNumber from 'bignumber.js';
import { math } from 'choerodon-ui/dataset';
import uuid from 'uuid/v4';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { getEditTableData } from 'utils/utils';
import EditTable from 'components/EditTable';
import { isCustomNumber } from '@/utils/precision';
import { boundValidator } from '@/utils/validator';

function blurChange({ form, name, precision }) {
  let val = form.getFieldValue(name);
  if (val) {
    val = new BigNumber(val).toFixed(precision, 3);
    form.setFieldsValue({ [name]: val });
  }
  return val;
}

// import './index.less';

export default class LadderPriceModal extends React.Component {
  constructor(props) {
    super(props);
    const { line: { priceLibMatchLadderList, agreementLadders } = {} } = props;
    const editList = (priceLibMatchLadderList || agreementLadders || []).map((m, index) => ({
      ladderId: uuid(),
      ...m,
      lineNum: index + 1,
      taxPrice: m.taxPrice || m.ladderPrice,
      unitPrice: m.unitPrice || m.ladderPrice || m.taxPrice,
      _status: 'create',
    }));
    this.state = {
      loading: false,
      delLoading: false,
      saveLoading: false,
      selectedRowKeys: [],
      selectedRowRows: [],
      dataSource: editList,
      // tableChange: false,
      isRefresh: false,
    };
  }

  @Bind()
  handleAdd() {
    const { dataSource } = this.state;
    const newDataSource = [
      ...dataSource,
      {
        ladderId: uuid(),
        _status: 'create',
        lineNum: dataSource.length + 1,
      },
    ];
    this.setState({
      dataSource: newDataSource,
    });
  }

  /**
   * 删除list中部分数据
   * @param {Array} needDelList 需要删除的list
   * @param {Array} allList 总数据
   */
  @Bind()
  delArratList(needDelList, allList) {
    const newList = allList.filter((p) => !needDelList.some((i) => i.ladderId === p.ladderId));
    return newList;
  }

  @Bind()
  handleDelete() {
    const { dataSource, selectedRowKeys, selectedRowRows } = this.state;
    const { onUpdateLadder, line } = this.props;
    if (
      dataSource.length === selectedRowKeys.length ||
      dataSource[dataSource.length - 1].ladderId === selectedRowKeys[0] ||
      dataSource.length === selectedRowKeys.length
    ) {
      const newList = this.delArratList(selectedRowRows, dataSource);
      onUpdateLadder(line.agreementLineId, newList);
      this.setState({
        dataSource: newList,
        selectedRowKeys: [],
        selectedRowRows: [],
      });
    } else {
      notification.warning({
        message: intl
          .get('small.common.view.deleteLadderPriceMessage')
          .d('只能从最后一条阶梯价格开始删除'),
      });
    }
  }

  @Bind()
  handleSave() {
    const { dataSource } = this.state;
    const { line = {}, onSaveAndClose = (e) => e } = this.props;
    const {
      line: { $form, orderQuantity },
    } = this.props;
    const minQuantity = ($form && $form.getFieldValue('orderQuantity')) || orderQuantity || 1;
    if (dataSource.length === 0) {
      const newLine = JSON.parse(JSON.stringify(line));
      newLine.agreementLadders = [];
      newLine.ladderFlag = 0;
      onSaveAndClose(newLine);
      return null;
    }
    const saveData = getEditTableData(dataSource, ['ladderId', '_status']);
    if (saveData.length > 0) {
      const newLine = JSON.parse(JSON.stringify(line));
      newLine.agreementLadders = saveData;
      newLine.ladderFlag = saveData.length > 0 ? 1 : 0;
      const isRuleValidate = !saveData.some((s, i) => {
        if (saveData[i + 1]) {
          return !math.eq(s.ladderTo, saveData[i + 1].ladderFrom);
        } else {
          return false;
        }
      });
      const isMinQuantityRule = math.gte(saveData[0].ladderFrom, minQuantity);

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
      } else onSaveAndClose(newLine);
    }
  }

  /**
   * 检查表格内容值发生变化
   */
  @Bind()
  hasChangeData() {
    this.setState({
      // tableChange: true,
    });
  }

  @Bind()
  handleSelect(selectedRowKeys, selectedRowRows) {
    this.setState({
      selectedRowKeys,
      selectedRowRows,
    });
  }

  // 当前价格表格
  @Bind()
  renderEditTable() {
    const { loading, selectedRowKeys, dataSource } = this.state;
    const { priceEditable } = this.props;
    const {
      line: { $form, tax: batchTax, uomPrecision, defaultPrecision },
    } = this.props;
    const tax = ($form && $form.getFieldValue('tax')) || batchTax || 0;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.handleSelect,
    };

    const quantityPrecision = uomPrecision >= 0 ? uomPrecision : 10;
    const pricePrecision = defaultPrecision >= 0 ? defaultPrecision : 10;
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
                      const flag = isCustomNumber(ladderTo);
                      if (flag && math.gte(ladderFrom, ladderTo)) {
                        callback(
                          new Error(
                            intl
                              .get(`small.common.model.ladderFromOnlyError`)
                              .d('数量只能小于数量至')
                          )
                        );
                      } else if (math.gte(ladderFrom, '100000000000000000000')) {
                        callback(
                          new Error(
                            intl
                              .get('small.common.view.maxMessage')
                              .d('值必须小于100000000000000000000')
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
                  // max="99999999999999999999"
                  // precision={0}
                  onBlur={() => {
                    blurChange({
                      name: 'ladderFrom',
                      form: record.$form,
                      precision: quantityPrecision,
                    });
                  }}
                  style={{ width: '100%' }}
                  onChange={(ladderFrom) => {
                    if (math.lte(ladderFrom, record.$form.getFieldValue('ladderTo'))) {
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
                      const flag = isCustomNumber(ladderFrom) && isCustomNumber(ladderTo);
                      if (flag && math.gte(ladderFrom, ladderTo)) {
                        callback(
                          new Error(
                            intl
                              .get(`small.common.model.ladderToOnlyError`)
                              .d('数量至只能大于数量从')
                          )
                        );
                      } else if (math.gte(ladderTo, '100000000000000000000')) {
                        callback(
                          new Error(
                            intl
                              .get('small.common.view.maxMessage')
                              .d('值必须小于100000000000000000000')
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
                  // max="99999999999999999999"
                  // precision={0}
                  style={{ width: '100%' }}
                  onBlur={() => {
                    blurChange({
                      name: 'ladderTo',
                      form: record.$form,
                      precision: quantityPrecision,
                    });
                  }}
                  onChange={(ladderTo) => {
                    if (math.gte(ladderTo, record.$form.getFieldValue('ladderFrom'))) {
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
      // 自动计算
      {
        title: intl.get('small.common.model.noTaxPrice').d('未税单价'),
        dataIndex: 'unitPrice',
        width: 120,
        align: 'right',
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('unitPrice', {
                initialValue: record.unitPrice,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('small.common.model.noTaxPrice').d('未税单价'),
                    }),
                  },
                  {
                    validator: boundValidator,
                  },
                ],
              })(
                <InputNumber
                  min={0}
                  // max="99999999999999999999"
                  style={{ width: '100%' }}
                  disabled={priceEditable}
                  onBlur={() => {
                    const value = blurChange({
                      name: 'unitPrice',
                      form: record.$form,
                      precision: pricePrecision,
                    });
                    if (isCustomNumber(value)) {
                      // 未税单价*(1+税率) = 含税单价
                      const taxPrice = math.multipliedBy(
                        math.plus(math.multipliedBy(tax, 0.01), 1),
                        value
                      );
                      record.$form.setFieldsValue({
                        taxPrice: math.toFixed(taxPrice, pricePrecision),
                      });
                    }
                  }}
                  onChange={(value) => {
                    if (isCustomNumber(value)) {
                      // 未税单价*(1+税率) = 含税单价
                      const taxPrice = math.multipliedBy(
                        math.plus(math.multipliedBy(tax, 0.01), 1),
                        value
                      );
                      record.$form.setFieldsValue({
                        taxPrice: math.toFixed(taxPrice, pricePrecision),
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
                    validator: boundValidator,
                  },
                ],
              })(
                <InputNumber
                  min={0}
                  // max="99999999999999999999"
                  style={{ width: '100%' }}
                  disabled={!priceEditable}
                  onBlur={() => {
                    const value = blurChange({
                      name: 'taxPrice',
                      form: record.$form,
                      precision: pricePrecision,
                    });
                    if (isCustomNumber(value)) {
                      // 未税单价*(1+税率) = 含税单价
                      const unitPrice = math.div(value, math.plus(math.multipliedBy(tax, 0.01), 1));
                      record.$form.setFieldsValue({
                        unitPrice: math.toFixed(unitPrice, pricePrecision),
                      });
                    }
                  }}
                  onChange={(value) => {
                    if (isCustomNumber(value)) {
                      // 未税单价*(1+税率) = 含税单价
                      const unitPrice = math.div(value, math.plus(math.multipliedBy(tax, 0.01), 1));
                      record.$form.setFieldsValue({
                        unitPrice: math.toFixed(unitPrice, pricePrecision),
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
        onDataChange={this.hasChangeData}
        loading={loading}
        rowSelection={rowSelection}
      />
    );
  }

  @Bind()
  renderCheckTable() {
    const { dataSource } = this.state;
    const columns = [
      {
        title: intl.get('small.common.model.lineNumber').d('行号'),
        dataIndex: 'lineNum',
        width: 60,
      },
      {
        title: intl.get('small.common.model.numberFrom').d('数量从(>=)'),
        dataIndex: 'ladderFrom',
        width: 80,
      },
      {
        title: intl.get('small.common.model.numberTo').d('数量至(<)'),
        dataIndex: 'ladderTo',
        width: 80,
      },
      {
        title: intl.get('small.common.model.noTaxPrice').d('未税单价'),
        dataIndex: 'unitPrice',
        width: 120,
        align: 'right',
      },
      {
        title: intl.get('small.common.model.taxPrice').d('含税单价'),
        dataIndex: 'taxPrice',
        width: 120,
        align: 'right',
      },
    ];
    const scrollWidth = sum(columns.map((n) => n.width));
    return (
      <Table
        bordered
        className="small-table-all-space"
        scroll={{ x: scrollWidth }}
        rowKey="ladderId"
        columns={columns}
        pagination={false}
        dataSource={dataSource}
      />
    );
  }

  render() {
    const { visible, onClose, isEdit = false } = this.props;
    const { selectedRowKeys, delLoading, saveLoading, isRefresh } = this.state;
    const footer = isEdit ? (
      <React.Fragment>
        <Button
          onClick={this.handleDelete}
          disabled={selectedRowKeys.length === 0}
          loading={delLoading}
        >
          {intl.get('hzero.common.button.delete').d('删除')}
        </Button>
        <Button onClick={this.handleAdd}>{intl.get('hzero.common.button.create').d('新建')}</Button>
        <Button type="primary" onClick={this.handleSave} loading={saveLoading}>
          {intl.get('hzero.common.button.save').d('保存')}
        </Button>
      </React.Fragment>
    ) : null;
    return (
      <Modal
        visible={visible}
        width={800}
        footer={footer}
        onCancel={() => onClose(isRefresh)}
        title={intl.get('small.common.model.ladderPrice').d('阶梯价格')}
      >
        {isEdit ? this.renderEditTable() : this.renderCheckTable()}
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
}
