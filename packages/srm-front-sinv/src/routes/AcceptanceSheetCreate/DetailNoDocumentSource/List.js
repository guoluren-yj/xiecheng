import React, { Component } from 'react';
import { sum, isNumber, isArray, omit, isEmpty, isNil } from 'lodash';
import { Button, Form, InputNumber, Input, Modal } from 'hzero-ui';
import Lov from 'components/Lov';
import { Bind } from 'lodash-decorators';
import ValueList from 'components/ValueList';
import { getCurrentOrganizationId } from 'utils/utils';
import uuid from 'uuid/v4';

import notification from 'utils/notification';
import EditTable from 'components/EditTable';
import intl from 'utils/intl';
import styles from './../index.less';

const FormItem = Form.Item;
const { confirm } = Modal;

export default class List extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = { tenantId: getCurrentOrganizationId(), options: {} };
  }

  @Bind()
  updateState(text, values, record) {
    const { onProject, dispatch } = this.props;
    if (record.$form) record.$form.resetFields('itemName');
    if (values.itemId) {
      dispatch({
        type: 'acceptanceSheetCreate/itemCategories',
        payload: { enabledFlag: 1, itemId: values.itemId },
      }).then((res) => {
        if (isArray(res) && res.length === 1) {
          const newDataSource = {
            itemId: values.itemId ? values.itemId : record.itemId,
            itemCode: text ? values.itemCode : record.itemCode,
            itemCategoryName: res[0].categoryName ? res[0].categoryName : record.itemCategoryName,
            itemCategoryId: res[0].categoryId ? res[0].categoryId : record.itemCategoryId,
            itemName: values.itemName ? values.itemName : record.itemName,
            acceptListLineId: record.acceptListLineId,
            _status: record._status,
          };
          onProject(newDataSource);
        } else {
          const newDataSource = {
            itemId: values.itemId ? values.itemId : record.itemId,
            itemCode: text ? values.itemCode : record.itemCode,
            itemName: values.itemName ? values.itemName : record.itemName,
            itemCategoryName: record.itemCategoryName,
            itemCategoryId: record.itemCategoryId,
            acceptListLineId: record.acceptListLineId,
            _status: record._status,
          };
          onProject(newDataSource);
        }
      });
    }
  }

  @Bind()
  project() {
    const { onProject } = this.props;
    const newDataSource = {
      edited: true,
      acceptListLineId: uuid(),
      _status: 'create',
    };
    onProject(newDataSource);
  }

  @Bind()
  handleDeleteLine() {
    const {
      selectedRow,
      dataSource,
      acceptListHeaderId,
      dispatch,
      onUpdateDataSource,
      onSearch,
      fetchHeader,
    } = this.props;
    const newDataSource = [];
    const acceptListLineList = [];

    if (dataSource.length > 0) {
      confirm({
        title: intl.get('sinv.acceptanceSheetCreate.message.delete').d('确认删除？'),
        okText: intl.get('hzero.common.button.sure').d('确定'),
        cancelText: intl.get('hzero.common.button.cancel').d('取消'),
        onOk: () => {
          const selectRowKeys = selectedRow.map((item) => item.acceptListLineId);
          dataSource.forEach((ele) => {
            if (!selectRowKeys.includes(ele.acceptListLineId)) {
              newDataSource.push({ ...ele });
            } else if (ele._status !== 'create') {
              acceptListLineList.push(omit(ele, ['$form']));
            }
          });
          if (!isEmpty(acceptListLineList)) {
            dispatch({
              type: 'acceptanceSheetCreate/deleteLine',
              payload: { acceptListHeaderId, acceptListLineList },
            }).then(() => {
              notification.success();
              onUpdateDataSource(newDataSource);
              onSearch();
              fetchHeader();
            });
          } else {
            onUpdateDataSource(newDataSource);
          }
        },
      });
    }
  }

  @Bind()
  changeValue(val, ele = {}) {
    this.setState({ options: ele.props });
  }

  @Bind()
  changeOption() {
    const { options = {} } = this.state;
    const { onUpdateDataSource, dataSource, selectedRow } = this.props;
    const selectRowKeys = selectedRow.map((item) => item.acceptListLineId);
    const newDataSource = dataSource.map((ele) => {
      if (selectRowKeys.includes(ele.acceptListLineId)) {
        if (ele.$form) ele.$form.resetFields('acceptOpinionCode', 'acceptOpinionCodeMeaning');
        return {
          ...ele,
          acceptOpinionCode: options.value,
          acceptOpinionCodeMeaning: options.children,
        };
      } else {
        return ele;
      }
    });

    onUpdateDataSource(newDataSource);
  }

  /**
   * showUomText - unitCodeIsShow为1 显示code/name,为0 显示name,不存在则按旧逻辑显示
   * @param {object} record - 单条数据
   */

  @Bind()
  showUomText(record) {
    const { uomName, uomCode, unitCodeIsShow } = record;
    let text = uomName && uomCode ? uomName : `${uomCode}/${uomName}`;
    if (!isNil(unitCodeIsShow)) {
      text = unitCodeIsShow === '1' && uomCode && uomName ? `${uomCode}/${uomName}` : uomName;
    }
    return text;
  }

  render() {
    const {
      onSearch,
      selectedRowKeys = [],
      onSelectRow,
      dataSource = [],
      pagination = {},
      fetchListsLoading,
      customizeTable,
    } = this.props;
    const { tenantId, options = {} } = this.state;
    const columns = [
      {
        title: intl.get(`sinv.acceptanceSheetCreate.model.lineNum`).d('序号'),
        dataIndex: 'lineNum',
        width: 100,
      },
      {
        title: intl.get(`sinv.acceptanceSheetCreate.model.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 150,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`itemId`, {
                initialValue: record.itemId,
              })(
                <Lov
                  code="SPUC.ACCEPT_ITEM"
                  textField="itemCode"
                  textValue={record.itemCode}
                  queryParams={{ tenantId }}
                  onChange={(text, values) => {
                    this.updateState(text, values, record);
                  }}
                  lovOptions={{ displayField: 'itemCode' }}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`sinv.acceptanceSheetCreate.model.itemName`).d('物料名称'),
        dataIndex: 'itemName',
        width: 150,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`itemName`, {
                initialValue: record.itemName,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`sinv.acceptanceSheetCreate.model.itemName`).d('物料名称'),
                    }),
                  },
                ],
              })(<Input initialValue={record.itemName} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`sinv.acceptanceSheetCreate.model.categoryName`).d('物料品类'),
        dataIndex: 'categoryId',
        width: 150,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`itemCategoryId`, {
                initialValue: record.itemCategoryId,
              })(
                <Lov
                  code="SPUC.ACCEPT.ITEM_CATEGORY"
                  textValue={record.itemCategoryName}
                  queryParams={{ tenantId }}
                  lovOptions={{ displayField: 'categoryName' }}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`sinv.acceptanceSheetCreate.model.uomName`).d('单位'),
        dataIndex: 'uomId',
        width: 150,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`uomId`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`sinv.acceptanceSheetCreate.model.uomName`).d('单位'),
                    }),
                  },
                ],
                initialValue: record.uomId,
              })(
                <Lov
                  code="SPRM.UOM"
                  textValue={this.showUomText(record)}
                  queryParams={{ tenantId }}
                  lovOptions={{
                    valueField: 'uomId',
                    displayField:
                      !isNil(record.unitCodeIsShow) && record.unitCodeIsShow === '1'
                        ? null
                        : 'uomName',
                  }}
                />
              )}
            </FormItem>
          ) : (
            this.showUomText(record)
          ),
      },
      {
        title: intl.get(`sinv.acceptanceSheetCreate.model.acceptQuantity`).d('本次验收数量'),
        width: 120,
        dataIndex: 'acceptQuantity',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`acceptQuantity`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`sinv.acceptanceSheetCreate.model.acceptQuantity`)
                        .d('本次验收数量'),
                    }),
                  },
                ],
                initialValue: record.acceptQuantity,
              })(<InputNumber min={0} allowThousandth precision={record.uomPrecision} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`sinv.acceptanceSheetCreate.model.acceptOpinion`).d('验收意见'),
        width: 150,
        dataIndex: 'acceptOpinionCode',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`acceptOpinionCode`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`sinv.acceptanceSheetCreate.model.acceptOpinion`)
                        .d('验收意见'),
                    }),
                  },
                ],
                initialValue: record.acceptOpinionCode,
              })(
                <ValueList
                  lovCode="SPUC.ACCEPT_OPINION"
                  style={{ width: 120 }}
                  allowClear
                  textValue={record.acceptOpinionCodeMeaning}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
    ];
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    return (
      <React.Fragment>
        <div className={styles['table-control-group']}>
          <ValueList
            lovCode="SPUC.ACCEPT_OPINION"
            style={{ width: 120 }}
            onChange={this.changeValue}
            value={options.children ? options.children : ''}
            allowClear
          />
          <Button
            onClick={this.changeOption}
            disabled={selectedRowKeys.length === 0 && isArray(selectedRowKeys)}
          >
            {intl
              .get(`sinv.acceptanceSheetCreate.model.acceptManyOpinionCode`)
              .d('批量选择验收意见')}
          </Button>
          <Button
            disabled={selectedRowKeys.length === 0 && isArray(selectedRowKeys)}
            onClick={this.handleDeleteLine}
          >
            {intl.get(`hzero.common.button.delete`).d('删除')}
          </Button>
          <Button style={{ marginLeft: 8 }} type="primary" onClick={this.project}>
            {intl.get(`sinv.acceptanceSheetType.button.create`).d('新建')}
          </Button>
        </div>
        {customizeTable(
          {
            code: 'SINV.ACCEPTANCE_CREATE_DETAIL.LINE',
          },
          <EditTable
            bordered
            columns={columns}
            rowSelection={{
              selectedRowKeys,
              onChange: onSelectRow,
            }}
            rowKey="acceptListLineId"
            dataSource={dataSource}
            pagination={pagination}
            onChange={onSearch}
            scroll={{ x: scrollX }}
            loading={fetchListsLoading}
          />
        )}
      </React.Fragment>
    );
  }
}
