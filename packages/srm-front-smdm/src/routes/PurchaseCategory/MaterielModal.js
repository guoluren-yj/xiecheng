/**
 * MaterielModal - 分类物料
 * @date: 2018-11-23
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Button, Form, Input, Row, Col, Tooltip } from 'hzero-ui';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import uuid from 'uuid/v4';

import { Content, Header } from 'components/Page';
import Lov from 'components/Lov';
import EditTable from 'components/EditTable';
import intl from 'utils/intl';
import { getEditTableData, addItemToPagination, delItemToPagination } from 'utils/utils';

@Form.create({ fieldNameProp: null })
@connect(({ loading, smdmPurchaseCategory }) => ({
  smdmPurchaseCategory,
  loading: loading.effects['smdmPurchaseCategory/fetchMateriel'],
}))
export default class MaterielModal extends PureComponent {
  state = {
    selectedRows: [],
  };

  componentDidMount() {
    const { onClearRows } = this.props;
    this.handleSearchMateriel();
    if (onClearRows) onClearRows(this.handleClearSelectedRows);
  }

  /**
   * 将selectedRows置空
   */
  @Bind()
  handleClearSelectedRows() {
    this.setState({ selectedRows: [] });
  }

  /**
   * 查询和品类关联的物料
   * @param {Object} pagination 分页参数
   */
  @Bind()
  handleSearchMateriel(pagination = {}) {
    const {
      form: { getFieldValue },
      onSearchMateriel,
    } = this.props;
    const params = {
      categoryId: getFieldValue('categoryId'),
      itemCode: getFieldValue('itemCode'),
      itemName: getFieldValue('itemName'),
      pagination,
    };
    onSearchMateriel(params);
  }

  componentWillUnmount() {
    this.props.dispatch({
      type: 'smdmPurchaseCategory/updateState',
      payload: {
        materielPagination: {},
      },
    });
  }

  /**
   * 重置查询表单
   */
  @Bind()
  handleFormReset() {
    this.props.form.resetFields();
  }

  /**
   * 保存勾选数据
   * @param {Array} selectedRowKeys 行key
   * @param {Array} selectedRows 行数据
   */
  @Bind()
  onSelectChange(selectedRowKeys, selectedRows) {
    this.setState({ selectedRows });
  }

  /**
   * 新建一行
   */
  @Bind()
  handleCreateRow() {
    const {
      dispatch,
      smdmPurchaseCategory: { materielList = [], materielPagination = {} },
    } = this.props;
    dispatch({
      type: 'smdmPurchaseCategory/updateState',
      payload: {
        materielList: [
          {
            categoryAssignId: uuid(),
            itemCode: null,
            itemName: null,
            _status: 'create',
          },
          ...materielList,
        ],
        materielPagination: addItemToPagination(materielList.length, materielPagination),
      },
    });
  }

  /**
   * 删除新建的行
   */
  @Bind()
  handleDeleteRow() {
    const {
      dispatch,
      onDelete,
      smdmPurchaseCategory: { materielList = [], materielPagination = {} },
    } = this.props;
    const { selectedRows } = this.state;
    const newSelectedRows = selectedRows.map((o) => o.categoryAssignId);
    const newMaterielList = materielList.filter(
      (o) => newSelectedRows.indexOf(o.categoryAssignId) > -1 === false
    );
    // 已保存的数据的 id
    const idList = selectedRows
      .map((o) => {
        if (o._status !== 'create') {
          return o.categoryAssignId;
        }
        return undefined;
      })
      .filter((o) => o);
    this.setState({ selectedRows: [] });
    if (!isEmpty(idList)) {
      onDelete(idList);
    } else {
      dispatch({
        type: 'smdmPurchaseCategory/updateState',
        payload: {
          materielList: newMaterielList,
          materielPagination: delItemToPagination(materielList.length, materielPagination),
        },
      });
    }
  }

  /**
   * 保存数据
   */
  @Bind()
  handleSave() {
    const {
      onSave,
      smdmPurchaseCategory: { materielList = [] },
      materielRecord: { categoryId },
    } = this.props;
    const editTableData = getEditTableData(materielList, ['categoryAssignId']);
    if (isEmpty(editTableData)) return;

    const newEditTableData = editTableData.map((item) => ({ itemId: item.itemId, categoryId }));
    // const newMaterielList = materielList.filter(o => isNumber(o.categoryAssignId));

    onSave(newEditTableData);
  }

  renderForm() {
    const {
      form: { getFieldDecorator },
      materielRecord = {},
    } = this.props;
    getFieldDecorator('categoryId', { initialValue: materielRecord.categoryId });
    return (
      <Form layout="inline">
        <Row>
          <Col span={9}>
            <Form.Item
              label={intl.get('smdm.purchaseCategory.model.category.categoryCode').d('品类代码')}
            >
              {getFieldDecorator('categoryCode', {
                initialValue: materielRecord.categoryCode,
              })(<Input disabled />)}
            </Form.Item>
          </Col>
          <Col span={9}>
            <Form.Item
              label={intl.get('smdm.purchaseCategory.model.category.categoryName').d('品类名称')}
            >
              {getFieldDecorator('categoryName', {
                initialValue: materielRecord.categoryName,
              })(<Input disabled />)}
            </Form.Item>
          </Col>
        </Row>

        <Row>
          <Col span={9}>
            <Form.Item
              label={intl.get('smdm.purchaseCategory.model.category.itemcode').d('物料代码')}
            >
              {getFieldDecorator('itemCode')(<Input inputChinese={false} />)}
            </Form.Item>
          </Col>
          <Col span={9}>
            <Form.Item
              label={intl.get('smdm.purchaseCategory.model.category.itemName').d('物料名称')}
            >
              {getFieldDecorator('itemName')(<Input />)}
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item>
              <Button onClick={this.handleFormReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button
                style={{ marginLeft: 8 }}
                type="primary"
                htmlType="submit"
                onClick={() => this.handleSearchMateriel()}
              >
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    const {
      loading,
      materielRecord: { categoryId },
      smdmPurchaseCategory: { materielList = [], materielPagination = {} },
    } = this.props;
    const { selectedRows } = this.state;
    const columns = [
      {
        title: intl.get('smdm.purchaseCategory.model.category.itemcode').d('物料代码'),
        dataIndex: 'itemCode',
        render: (text, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator, setFieldsValue } = record.$form;
            getFieldDecorator('itemId');
            return (
              <Form.Item>
                {getFieldDecorator('itemCode', {
                  initialValue: record.itemCode,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('smdm.purchaseCategory.model.category.itemcode')
                          .d('物料代码'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    code="SMDM.UNDISTRIBUTED_ITEM"
                    queryParams={{ categoryId }}
                    onChange={(_, lovRecord) => {
                      setFieldsValue({ itemName: lovRecord.itemName });
                      setFieldsValue({ itemId: lovRecord.itemId });
                    }}
                  />
                )}
              </Form.Item>
            );
          } else {
            return record.itemCode;
          }
        },
      },
      {
        title: intl.get('smdm.purchaseCategory.model.category.itemName').d('物料名称'),
        dataIndex: 'itemName',
        render: (text, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator, getFieldValue } = record.$form;
            return (
              <Form.Item>
                <Tooltip title={getFieldValue('itemName')} arrowPointAtCenter>
                  {getFieldDecorator('itemName', {
                    initialValue: record.itemName,
                  })(<Input disabled />)}
                </Tooltip>
              </Form.Item>
            );
          } else {
            return (
              <Tooltip title={text} placement="topLeft">
                {text}
              </Tooltip>
            );
          }
        },
      },
    ];
    const rowSelection = {
      // selectedRowKeys: selectedRows.map(n => n.categoryAssignId),
      onChange: this.onSelectChange,
    };
    return (
      <React.Fragment>
        <Header title={intl.get('smdm.purchaseCategory.view.message.materiel').d('分类物料')} />
        {/* </Header> */}
        <Content>
          <div className="table-list-search">{this.renderForm()}</div>
          <div style={{ backgroundColor: 'white', textAlign: 'right', paddingBottom: '16px' }}>
            <Button disabled={isEmpty(selectedRows)} onClick={this.handleDeleteRow}>
              {intl.get('hzero.common.button.delete').d('删除')}
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={this.handleSave}>
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
            <Button style={{ marginLeft: 8 }} type="primary" onClick={this.handleCreateRow}>
              {intl.get('hzero.common.button.create').d('新建')}
            </Button>
          </div>
          <EditTable
            bordered
            rowKey="categoryAssignId"
            loading={loading}
            dataSource={materielList}
            columns={columns}
            rowSelection={rowSelection}
            pagination={materielPagination}
            onChange={this.handleSearchMateriel}
          />
        </Content>
        {/* <Layout.Footer
          style={{ backgroundColor: 'white', textAlign: 'right', padding: '0 16px 16px' }}
        >
          <Button disabled={isEmpty(selectedRows)} onClick={this.handleDeleteRow}>
            {intl.get('hzero.common.button.delete').d('删除')}
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={this.handleSave}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button style={{ marginLeft: 8 }} type="primary" onClick={this.handleCreateRow}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Layout.Footer> */}
      </React.Fragment>
    );
  }
}
