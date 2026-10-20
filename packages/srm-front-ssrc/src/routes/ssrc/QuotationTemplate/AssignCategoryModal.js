/**
 * AssignCategoryModal - 分配品类Modal
 * @date: 2019-08-16
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import React, { PureComponent } from 'react';
import { isEmpty, uniqBy, pullAllBy } from 'lodash';
import { Table, Form, Modal, Button, Row, Col, Input } from 'hzero-ui';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { filterNullValueObject } from 'utils/utils';

import styles from '@/routes/ssrc/common.less';

const promptCode = 'ssrc.quotationTemplate';

const defaultTableRowKey = 'itemCategoryId';

@Form.create({ fieldNameProp: null })
@connect(({ quotationTemplate, loading }) => ({
  quotationTemplate,
  assignCategoryLoading: loading.effects['quotationTemplate/addMaterial'],
  queryAssignCategoryLoading: loading.effects['quotationTemplate/queryAssignCategory'],
}))
export default class AssignCategoryModal extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
      selectedRows: [],
    };
  }

  componentDidMount() {
    this.handleFetchList();
  }

  /**
   * 查询行数据
   * @param {object} params - 查询参数
   */
  @Bind()
  handleFetchList() {
    const {
      dispatch,
      currentRow,
      templateId,
      form: { getFieldsValue },
    } = this.props;
    const formValues = filterNullValueObject(getFieldsValue());
    dispatch({
      type: 'quotationTemplate/queryAssignCategory',
      payload: {
        templateId,
        ...formValues,
        templateCode: currentRow.templateNum,
      },
    }).then(res => {
      const { dataSource, selectedRows } = res;
      this.setState({
        dataSource,
        selectedRows,
        defaultSelectedRowKeys: selectedRows.map(o => o[defaultTableRowKey]),
      });
    });
  }

  /**
   * 保存品类
   */
  @Bind()
  handleSave() {
    const { dispatch, templateId, quotationDimensionType, onCancel } = this.props;
    const { selectedRows = [], invertSelectedRows = [], defaultSelectedRowKeys = [] } = this.state;
    if (!isEmpty(selectedRows) || !isEmpty(invertSelectedRows)) {
      const tempDefaultSelectedRows = defaultSelectedRowKeys.map(o => ({
        [defaultTableRowKey]: o,
      }));
      const newSelectedRows = [
        ...pullAllBy([...selectedRows], tempDefaultSelectedRows, defaultTableRowKey),
        ...invertSelectedRows,
      ];

      dispatch({
        type: 'quotationTemplate/addMaterial',
        payload: {
          templateId,
          quotationDimensionType,
          quotationDimensionList: newSelectedRows,
        },
      }).then(res => {
        if (res) {
          notification.success();
          // this.handleFetchList();
          onCancel();
          this.setState({
            invertSelectedRows: [],
          });
        }
      });
    }
  }

  /**
   * 选择/取消选择某列的回调
   * @param {object} record - 选中的行
   * @param {boolean} selected - 是否选中
   */
  @Bind()
  onTableRowSelect(record, selected) {
    const { selectedRows = [], invertSelectedRows = [] } = this.state;
    let newSelectedRows = [...selectedRows];
    let newInvertSelectedRows = [...invertSelectedRows];
    function assignNewSelectedRow(rowData) {
      if (selected) {
        newSelectedRows.push({ ...rowData, deleteFlag: 0 });
        newInvertSelectedRows = newInvertSelectedRows.filter(
          o => o[defaultTableRowKey] !== rowData[defaultTableRowKey]
        );
      } else {
        newSelectedRows = newSelectedRows.filter(
          o => o[defaultTableRowKey] !== rowData[defaultTableRowKey]
        );
        newInvertSelectedRows.push({ ...rowData, deleteFlag: 1 });
      }
    }
    function batchAssignNewSelectedRows(collection = []) {
      collection.forEach(n => {
        assignNewSelectedRow(n);
        if (!isEmpty(n.children)) {
          batchAssignNewSelectedRows(n.children);
        }
      });
    }
    assignNewSelectedRow(record);
    if (!isEmpty(record.children)) {
      batchAssignNewSelectedRows(record.children);
    }
    this.setState({
      selectedRows: uniqBy(newSelectedRows, defaultTableRowKey),
      invertSelectedRows: uniqBy(newInvertSelectedRows, defaultTableRowKey),
    });
  }

  /**
   * 选择/取消选择所有列的回调
   * @param {boolean} selected - 是否选中
   * @param {object} selectedRows - 选中的行
   * @param {object} changeRows - 变化的行
   */
  @Bind()
  onTableRowSelectAll(selected, selectedRows, changeRows) {
    const { invertSelectedRows = [], defaultSelectedRowKeys = [] } = this.state;
    let newSelectedRows = [];
    if (selected) {
      newSelectedRows = selectedRows.map(o => ({
        ...o,
        deleteFlag: defaultSelectedRowKeys.some(p => p === o[defaultTableRowKey])
          ? o.deleteFlag
          : 0,
      }));
    }
    this.setState({
      selectedRows: newSelectedRows,
      invertSelectedRows: selected
        ? []
        : invertSelectedRows.concat(
            changeRows
              .filter(o => defaultSelectedRowKeys.some(p => p === o[defaultTableRowKey]))
              .map(o => ({ ...o, deleteFlag: 1 }))
          ),
    });
  }

  /**
   * 重置
   */
  @Bind()
  handleReset() {
    const {
      form: { resetFields },
    } = this.props;
    resetFields();
  }

  render() {
    const {
      assignCategoryVisible,
      onCancel,
      currentRow,
      form: { getFieldDecorator },
      assignCategoryLoading,
      queryAssignCategoryLoading,
    } = this.props;
    const { selectedRows, dataSource } = this.state;
    const rowSelection = {
      selectedRowKeys: selectedRows.map(n => n.itemCategoryId),
      onSelect: this.onTableRowSelect,
      onSelectAll: this.onTableRowSelectAll,
      getCheckboxProps: record => ({
        disabled: record && currentRow.templateStatus === 'RELEASED',
      }),
    };
    const columns = [
      {
        title: intl.get(`${promptCode}.model.category.code`).d('品类编码'),
        dataIndex: 'itemCategoryCode',
        width: 300,
      },
      {
        title: intl.get(`${promptCode}.model.category.name`).d('品类名称'),
        dataIndex: 'itemCategoryName',
      },
    ];
    return (
      <Modal
        width={720}
        onCancel={onCancel}
        footer={
          currentRow.templateStatus === 'RELEASED'
            ? null
            : [
                <Button onClick={onCancel}>
                  {intl.get('hzero.common.button.cancel').d('取消')}
                </Button>,
                <Button type="primary" onClick={this.handleSave} loading={assignCategoryLoading}>
                  {intl.get('hzero.common.button.ok').d('确定')}
                </Button>,
              ]
        }
        wrapClassName={styles['category-modal']}
        visible={assignCategoryVisible}
        title={intl.get(`${promptCode}.model.title.assignCategory`).d('分配适用品类')}
      >
        <Form>
          <Row gutter={24} style={{ marginBottom: 16 }}>
            <Col span={8}>
              <Row style={{ display: 'flex', alignItems: 'center' }}>
                <Col span={8}>{intl.get(`${promptCode}.model.category.code`).d('品类编码')}:</Col>
                <Col span={16}>
                  {getFieldDecorator('itemCategoryCode')(
                    <Input trim inputChinese={false} typeCase="upper" />
                  )}
                </Col>
              </Row>
            </Col>
            <Col span={8}>
              <Row style={{ display: 'flex', alignItems: 'center' }}>
                <Col span={8}>{intl.get(`${promptCode}.model.category.name`).d('品类名称')}:</Col>
                <Col span={16}>{getFieldDecorator('itemCategoryName')(<Input />)}</Col>
              </Row>
            </Col>
            <Col span={6}>
              <Button data-code="reset" onClick={this.handleReset} style={{ marginRight: 8 }}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button
                data-code="search"
                type="primary"
                htmlType="submit"
                onClick={this.handleFetchList}
              >
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </Col>
          </Row>
        </Form>
        <Table
          bordered
          rowKey="itemCategoryId"
          columns={columns}
          pagination={false}
          scroll={{ y: 315 }}
          dataSource={dataSource}
          rowSelection={rowSelection}
          loading={queryAssignCategoryLoading}
        />
      </Modal>
    );
  }
}
