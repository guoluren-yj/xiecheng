import React, { Component } from 'react';
import { Modal, Form, Input, Button, InputNumber } from 'hzero-ui';
import { Bind, debounce } from 'lodash-decorators';
import { isNumber, isArray, isEmpty, omit, differenceBy } from 'lodash';
import {
  tableScrollWidth,
  getCurrentOrganizationId,
  getEditTableData,
  addItemToPagination,
  delItemsToPagination,
  createPagination,
} from 'utils/utils';
import notification from 'utils/notification';
import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import EditTable from 'components/EditTable';
import Checkbox from 'components/Checkbox';
import uuid from 'uuid/v4';
import { connect } from 'dva';
import { renderThousandthNum, getDynamicLabel, conversionUpdateForH0 } from '@/utils/util';
import PrecisionInputNumber from '@/routes/components/Precision/PrecisionInputNumber';
import styles from './index.less';

// import { filterNullValueObject } from 'utils/utils';

const FormItem = Form.Item;
const viewMessagePrompt = 'spcm.common.view.message.title';

@Form.create({ fieldNameProp: null })
@connect(({ contractCommon, loading }) => ({
  ladderQuoteLoading: loading.effects['contractCommon/fetchLadderQuotation'],
  ladderQuoteDeleting: loading.effects['contractCommon/ladderQuoteLinesDelete'],
  saveLadderQuoteLoading: loading.effects['contractCommon/saveLadderQuotation'],
  contractCommon,
}))
export default class OperationLadderQuote extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tenantId: getCurrentOrganizationId(),
      dataSource: [],
      pagination: {},
      selectedRows: [],
    };
  }

  componentDidMount() {
    this.fetchLadderQuote();
  }

  /**
   * 查询阶梯报价
   */
  fetchLadderQuote(page = {}) {
    const { dispatch, quotePcSubject: { pcSubjectId } = {} } = this.props;
    dispatch({
      type: 'contractCommon/fetchLadderQuotation',
      payload: {
        pcSubjectId,
        page,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          dataSource: res.content && res.content.map((r) => ({ ...r, _status: 'update' })),
          pagination: createPagination(res),
        });
      }
    });
  }

  // 保存
  @Bind()
  saveQuote() {
    const { dataSource = [] } = this.state;
    const { dispatch, quotePcSubject: { pcSubjectId } = {} } = this.props;
    const quoteDataSource = getEditTableData(dataSource, ['lineId', '_status']);
    if (!isEmpty(quoteDataSource)) {
      dispatch({
        type: 'contractCommon/saveLadderQuotation',
        payload: {
          pcSubjectId,
          ...quoteDataSource,
        },
      }).then((res) => {
        if (res) {
          notification.success();
          this.fetchLadderQuote();
        }
      });
    }
  }

  /**
   * 新增阶梯报价
   */
  @Bind()
  addLadderQuote() {
    const { dataSource = [], tenantId, pagination } = this.state;
    const { quotePcSubject: { pcSubjectId } = {} } = this.props;

    const newItem = {
      lineId: uuid(),
      _status: 'create',
      deleteFlag: 1,
      edited: true,
      pcSubjectId,
      tenantId,
    };
    this.setState({
      dataSource: [...dataSource, newItem],
      pagination: addItemToPagination(dataSource.length, pagination),
    });
  }

  /**
   * 阶梯价格只能从最后一行删除
   */
  @Bind()
  handleDeleteLadderQuote(key, primaryKey) {
    const { dataSource = [], selectedRows = [] } = this.state;
    // 过滤出已保存数据
    const savedData = dataSource.filter((l) => l._status !== 'create');
    // 最后一行数据的序号
    const lastRowLineNum =
      savedData[savedData.length - 1] && savedData[savedData.length - 1].lineNum;

    // 已勾选的已保存数据的Key
    const selectedRowKeys = selectedRows.map((l) => l[primaryKey]).filter((l) => isNumber(l));
    // 未勾选的已保存数据
    const unSelectedRows = differenceBy(savedData, selectedRows, primaryKey);
    // 未勾选的最后一行序号
    const unSelectedRowLastLineNum = isEmpty(unSelectedRows)
      ? 0
      : unSelectedRows[unSelectedRows.length - 1].lineNum;

    if (
      isEmpty(selectedRowKeys) ||
      lastRowLineNum - selectedRowKeys.length === unSelectedRowLastLineNum
    ) {
      this.deleteLines(key, primaryKey);
    } else {
      notification.warning({
        message: intl
          .get('spcm.common.view.message.title.deleteTheLastRow')
          .d('只能从最后一行已保存行开始删除！'),
      });
    }
  }

  /**
   * handleDeleteLines - 删除阶梯价格
   */
  @Bind()
  deleteLines(key, primaryKey) {
    const actionField = `${key}LinesDelete`;
    const rowKey = primaryKey || `${key}Id`;
    const { dispatch, pcHeaderId } = this.props;
    const { dataSource = [], pagination = {}, selectedRows = [] } = this.state;
    const newDataSource = [];
    const deleteList = [];
    Modal.confirm({
      title: intl.get(`${viewMessagePrompt}.confirmDelete`).d('是否删除'),
      onOk: () => {
        const selectedRowKeys = selectedRows.map((n) => n[rowKey]);
        dataSource.forEach((item) => {
          if (!selectedRowKeys.includes(item[rowKey])) {
            newDataSource.push(item);
          } else if (item._status !== 'create') {
            deleteList.push(omit(item, ['$form']));
          }
        });
        if (!isEmpty(deleteList)) {
          const editedData = dataSource.filter((item) => item.edited);
          if (editedData.length > 0) {
            Modal.confirm({
              title: intl
                .get(`${viewMessagePrompt}.lostData`)
                .d('存在未保存数据，继续将导致数据丢失，是否继续'),
              onOk: () => {
                dispatch({
                  type: `contractCommon/${actionField}`,
                  payload: {
                    pcHeaderId,
                    body: deleteList,
                  },
                }).then((res) => {
                  if (res) {
                    if (res) {
                      this.setState({ selectedRows: [] });
                      notification.success();
                      this.fetchLadderQuote();
                    }
                  }
                });
              },
            });
          } else {
            dispatch({
              type: `contractCommon/${actionField}`,
              payload: {
                pcHeaderId,
                body: deleteList,
              },
            }).then((res) => {
              if (res) {
                if (res) {
                  this.setState({ selectedRows: [] });
                  notification.success();
                  this.fetchLadderQuote();
                }
              }
            });
          }
        } else {
          this.setState({
            dataSource: newDataSource,
            pagination: delItemsToPagination(selectedRows.length, dataSource.length, pagination),
            selectedRows: [],
          });
        }
      },
    });
  }

  /**
   * 选中行改变回调
   * @param {*} selectedRowKeys
   * @param {*} selectedRows
   */
  @Bind()
  handleChangeSelection(selectedRowKeys, selectedRows) {
    this.setState({
      selectedRows,
    });
  }

  /**
   * handleRecordChange - 监听行内修改
   * @param {Object} 行数据
   */
  @Bind()
  handleRecordChange(record) {
    const { dataSource } = this.state;
    const newDataSource = dataSource.map((item) => {
      if (item.lineId === record.lineId) {
        return {
          ...item,
          edited: true,
        };
      }
      return item;
    });
    this.setState({
      dataSource: newDataSource,
    });
  }

  /**
   * 判断区间输入是否正确
   */
  @Bind()
  handelCheckRange(value, form, field) {
    if (field === 'quantityStart') {
      const quantityEnd = form.getFieldValue('quantityEnd');
      if (value >= quantityEnd) form.setFieldsValue({ quantityStart: undefined });
    } else if (field === 'quantityEnd') {
      const quantityStart = form.getFieldValue('quantityStart');
      if (value <= quantityStart) form.setFieldsValue({ quantityEnd: undefined });
    } else if (field === 'secondaryQuantityStart') {
      const quantityEnd = form.getFieldValue('quantityEnd');
      if (value >= quantityEnd) form.setFieldsValue({ secondaryQuantityStart: undefined });
    } else if (field === 'secondaryQuantityEnd') {
      const quantityStart = form.getFieldValue('secondaryQuantityStart');
      if (value <= quantityStart) form.setFieldsValue({ secondaryQuantityEnd: undefined });
    }
  }

  @Bind()
  @debounce(800)
  handleSecondaryNumChange(value, record, field) {
    const { quotePcSubject, doubleUnitEnabled } = this.props;
    if (!(doubleUnitEnabled && quotePcSubject?.itemCode)) {
      record.$form.setFieldsValue({ [field]: value || record[field] });
    } else if (!value && value !== 0) {
      record.$form.setFieldsValue({ [field]: value });
    } else {
      conversionUpdateForH0({
        record,
        lovRecord: quotePcSubject,
        doubleUnitEnabled,
        field,
        value,
      });
    }
  }

  render() {
    const {
      ladderQuoteLoading, // 查询loading
      ladderQuoteDeleting, // 删除loading
      saveLadderQuoteLoading, // 保存loading
      hideModal,
      editable,
      maintainEditable,
      visible,
      doubleUnitEnabled,
      quotePcSubject: { priceType, currencyCode = 'CNY' } = {},
    } = this.props;
    const { dataSource = [], selectedRows = [], pagination = {} } = this.state;
    const scrollX = tableScrollWidth(column);
    const selectedRowKeys = selectedRows.map((n) => n.lineId);
    const rowSelection = {
      selectedRowKeys,
      onChange: this.handleChangeSelection,
    };
    const column = [
      {
        title: intl.get('spcm.common.model.common.orderSeq').d('序号'),
        width: 80,
        dataIndex: 'lineNum',
      },
      doubleUnitEnabled && {
        title: intl.get('spcm.common.model.quantityStart').d('数量从（>=）'),
        width: 120,
        dataIndex: 'secondaryQuantityStart',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`secondaryQuantityStart`, {
                initialValue: record.secondaryQuantityStart,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`spcm.common.model.quantityStart`).d('数量从（>=）'),
                    }),
                  },
                ],
              })(
                <InputNumber
                  min={0}
                  precision={2}
                  allowThousandth
                  onChange={(value) => {
                    this.handleRecordChange(record);
                    this.handleSecondaryNumChange(value, record, 'quantityStart');
                  }}
                  onBlur={(e) =>
                    this.handelCheckRange(+e.target.value, record.$form, 'secondaryQuantityStart')
                  }
                />
              )}
            </FormItem>
          ) : (
            renderThousandthNum(val)
          ),
      },
      {
        title: getDynamicLabel(doubleUnitEnabled, 'ladderFrom'),
        width: 120,
        dataIndex: 'quantityStart',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`quantityStart`, {
                initialValue: record.quantityStart,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: getDynamicLabel(doubleUnitEnabled, 'ladderFrom'),
                    }),
                  },
                ],
              })(
                <InputNumber
                  min={0}
                  precision={2}
                  disabled={doubleUnitEnabled}
                  allowThousandth
                  onChange={() => {
                    this.handleRecordChange(record);
                  }}
                  onBlur={(e) =>
                    this.handelCheckRange(+e.target.value, record.$form, 'quantityStart')
                  }
                />
              )}
            </FormItem>
          ) : (
            renderThousandthNum(val)
          ),
      },
      doubleUnitEnabled && {
        title: intl.get('spcm.common.model.quantityEnd').d('数量至（<）'),
        width: 120,
        dataIndex: 'secondaryQuantityEnd',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`secondaryQuantityEnd`, {
                initialValue: record.secondaryQuantityEnd,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`spcm.common.model.quantityEnd`).d('数量至（<）'),
                    }),
                  },
                ],
              })(
                <InputNumber
                  min={0}
                  precision={2}
                  allowThousandth
                  onChange={(value) => {
                    this.handleRecordChange(record);
                    this.handleSecondaryNumChange(value, record, 'quantityEnd');
                  }}
                  onBlur={(e) =>
                    this.handelCheckRange(+e.target.value, record.$form, 'secondaryQuantityEnd')
                  }
                />
              )}
            </FormItem>
          ) : (
            renderThousandthNum(val)
          ),
      },
      {
        title: getDynamicLabel(doubleUnitEnabled, 'ladderTo'),
        width: 120,
        dataIndex: 'quantityEnd',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`quantityEnd`, {
                initialValue: record.quantityEnd,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: getDynamicLabel(doubleUnitEnabled, 'ladderTo'),
                    }),
                  },
                ],
              })(
                <InputNumber
                  min={0}
                  precision={2}
                  allowThousandth
                  disabled={doubleUnitEnabled}
                  onChange={() => {
                    this.handleRecordChange(record);
                  }}
                  onBlur={(e) =>
                    this.handelCheckRange(+e.target.value, record.$form, 'quantityEnd')
                  }
                />
              )}
            </FormItem>
          ) : (
            renderThousandthNum(val)
          ),
      },
      doubleUnitEnabled && {
        title: intl.get('spcm.common.model.new.price').d('单价(含税)'),
        width: 120,
        dataIndex: 'secondaryPrice',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) &&
          (editable || maintainEditable) &&
          ['TAX_INCLUDED_PRICE', 'NONE'].includes(priceType) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`secondaryPrice`, {
                initialValue: record.secondaryPrice,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('spcm.common.model.new.price').d('单价(含税)'),
                    }),
                  },
                ],
              })(
                <PrecisionInputNumber
                  type="hzero"
                  onChange={() => {
                    this.handleRecordChange(record);
                  }}
                  currency={currencyCode}
                  style={{ width: '100%' }}
                  min={0}
                />
              )}
            </FormItem>
          ) : (
            renderThousandthNum(val)
          ),
      },
      {
        title: getDynamicLabel(doubleUnitEnabled, 'validLadderPrice'),
        width: 120,
        dataIndex: 'price',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) &&
          (editable || maintainEditable) &&
          !doubleUnitEnabled &&
          ['TAX_INCLUDED_PRICE', 'NONE'].includes(priceType) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`price`, {
                initialValue: record.price,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: getDynamicLabel(doubleUnitEnabled, 'validLadderPrice'),
                    }),
                  },
                ],
              })(
                <PrecisionInputNumber
                  type="hzero"
                  onChange={() => {
                    this.handleRecordChange(record);
                  }}
                  currency={currencyCode}
                  style={{ width: '100%' }}
                  min={0}
                />
              )}
            </FormItem>
          ) : (
            renderThousandthNum(val)
          ),
      },
      doubleUnitEnabled && {
        title: intl.get('spcm.common.model.ladderNetPrice').d('单价(不含税)'),
        width: 120,
        dataIndex: 'ladderSecondaryNetPrice',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) &&
          (editable || maintainEditable) &&
          ['NET_PRICE', 'NONE'].includes(priceType) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`ladderSecondaryNetPrice`, {
                initialValue: record.ladderSecondaryNetPrice,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`spcm.common.model.ladderNetPrice`).d('单价（不含税)'),
                    }),
                  },
                ],
              })(
                <PrecisionInputNumber
                  type="hzero"
                  onChange={() => {
                    this.handleRecordChange(record);
                  }}
                  currency={currencyCode}
                  style={{ width: '100%' }}
                  min={0}
                />
              )}
            </FormItem>
          ) : (
            renderThousandthNum(val)
          ),
      },
      {
        title: getDynamicLabel(doubleUnitEnabled, 'validNetLadderPrice'),
        width: 120,
        dataIndex: 'ladderNetPrice',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) &&
          (editable || maintainEditable) &&
          !doubleUnitEnabled &&
          ['NET_PRICE', 'NONE'].includes(priceType) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`ladderNetPrice`, {
                initialValue: record.ladderNetPrice,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: getDynamicLabel(doubleUnitEnabled, 'validNetLadderPrice'),
                    }),
                  },
                ],
              })(
                <PrecisionInputNumber
                  type="hzero"
                  onChange={() => {
                    this.handleRecordChange(record);
                  }}
                  currency={currencyCode}
                  style={{ width: '100%' }}
                  min={0}
                />
              )}
            </FormItem>
          ) : (
            renderThousandthNum(val)
          ),
      },
      {
        title: intl.get('spcm.common.model.description').d('备注'),
        width: 150,
        dataIndex: 'description',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`description`, {
                initialValue: record.description,
              })(<Input />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get('spcm.common.model.ladderAccumulation').d('是否阶梯累计'),
        width: 120,
        dataIndex: 'stepAccumulationFlag',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`stepAccumulationFlag`, {
                initialValue: record.stepAccumulationFlag,
              })(<Checkbox />)}
            </FormItem>
          ) : (
            yesOrNoRender(val)
          ),
      },
    ].filter(Boolean);
    return (
      <React.Fragment>
        <Modal
          title={intl.get(`spcm.common.model.ladderQuote`).d('阶梯价格')}
          width={1000}
          visible={visible}
          onCancel={hideModal}
          footer={null}
        >
          {(editable || maintainEditable) && (
            <div className={styles['btn-wrapper']}>
              <Button type="primary" onClick={this.addLadderQuote}>
                {intl.get(`hzero.common.button.create`).d('新建')}
              </Button>
              <Button loading={saveLadderQuoteLoading} onClick={this.saveQuote}>
                {intl.get(`hzero.common.button.save`).d('保存')}
              </Button>
              <Button
                onClick={() => this.handleDeleteLadderQuote('ladderQuote', 'lineId')}
                loading={ladderQuoteDeleting}
                disabled={isArray(selectedRowKeys) && isEmpty(selectedRowKeys)}
              >
                {intl.get(`hzero.common.button.delete`).d('删除')}
              </Button>
            </div>
          )}
          <EditTable
            columns={column}
            bordered
            loading={ladderQuoteLoading}
            dataSource={dataSource}
            pagination={pagination}
            onChange={(page) => this.fetchLadderQuote(page)}
            rowKey="lineId"
            rowSelection={editable || maintainEditable ? rowSelection : null}
            scroll={{ x: scrollX }}
            className={styles['edit-table-wrapper']}
          />
        </Modal>
      </React.Fragment>
    );
  }
}
