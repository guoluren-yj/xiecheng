import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { Form, Button, Table, Modal, Tabs, Row, Col, Input } from 'hzero-ui';
import { connect } from 'dva';
import { isUndefined, isEmpty } from 'lodash';

import intl from 'utils/intl';
import { filterNullValueObject } from 'utils/utils';

import style from './index.less';

const FormItem = Form.Item;
const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
const modelPrompt = 'scec.ecMaterielMapping.model';

@Form.create({ fieldNameProp: null })
@connect(({ ecMaterielMapping }) => ({
  ecMaterielMapping,
}))
export default class MappingModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      row: [],
      tabKey: '1',
    };
  }

  @Bind()
  fetchMateriel(params) {
    const {
      dispatch,
      invOrganizationId,
      ecMaterielMapping: { materielPagination },
    } = this.props;
    const filterValues = isUndefined(this.props.form)
      ? {}
      : filterNullValueObject(this.props.form.getFieldsValue());
    dispatch({
      type: 'ecMaterielMapping/fetchMaterielCode',
      payload: {
        ...filterValues,
        page: isEmpty(params) ? materielPagination : params,
        invOrganizationId,
      },
    });
  }

  @Bind()
  fetchCategory() {
    const { dispatch } = this.props;
    const filterValues = isUndefined(this.props.form)
      ? {}
      : filterNullValueObject(this.props.form.getFieldsValue());
    dispatch({
      type: 'ecMaterielMapping/fetchCategoryCode',
      payload: {
        ...filterValues,
      },
    });
  }

  @Bind()
  rowSelectChange(params, callBack = e => e) {
    this.setState(
      {
        row: params.rows,
      },
      () => callBack()
    );
  }

  @Bind()
  handleOk() {
    const { selectedRows } = this.props;
    const { tabKey, row } = this.state;
    const isMaterielMapping = selectedRows.some(i => i.itemId !== null);
    const isCategoryMapping = selectedRows.some(i => i.categoryId !== null);
    if (row.length > 0) {
      if (tabKey === '1') {
        if (isCategoryMapping) {
          Modal.confirm({
            title: intl
              .get('scec.ecMaterielMapping.view.warning.materielMapsTitle')
              .d('批量物料映射?'),
            content: intl
              .get('scec.ecMaterielMapping.view.warning.materielMapping')
              .d('部分数据已映射到品类，确定要批量映射吗？'),
            onOk: () => {
              this.handleBatchMapping();
            },
          });
          return;
        }
        this.handleBatchMapping();
      } else {
        if (isMaterielMapping) {
          Modal.confirm({
            title: intl
              .get('scec.ecMaterielMapping.view.warning.categoryMapsTitle')
              .d('批量品类映射?'),
            content: intl
              .get('scec.ecMaterielMapping.view.warning.categoryMapping')
              .d('部分数据已映射到物料，确定要批量映射吗？'),
            onOk: () => {
              this.handleBatchMapping();
            },
          });
          return;
        }
        this.handleBatchMapping();
      }
    } else {
      Modal.warning({
        title: intl.get(`scec.ecMaterielMapping.view.authority.selectMsg`).d('请至少选择一条数据'),
        okText: intl.get(`scec.ecMaterielMapping.view.authority.know`).d('知道了'),
        zIndex: 10000,
      });
    }
  }

  @Bind()
  handleBatchMapping() {
    const { selectedRows, handleSetMap } = this.props;
    const { row, tabKey } = this.state;
    const modalRow = [...row];
    if (tabKey === '1') {
      const mapsRows = selectedRows.map(i => ({
        ...i,
        categoryId: undefined,
        categoryName: undefined,
        itemName: modalRow[0].itemName,
        itemId: modalRow[0].itemId,
      }));
      handleSetMap(mapsRows);
    } else {
      const cagegoryMap = selectedRows.map(i => ({
        ...i,
        itemName: undefined,
        itemId: undefined,
        categoryId: modalRow[0].categoryId,
        categoryName: modalRow[0].partnercategoryName,
      }));
      handleSetMap(cagegoryMap);
    }
    this.setState({ row: [], tabKey: '1' });
  }

  @Bind()
  handleCancel() {
    this.props.toggleModal();
    this.setState({
      row: [],
      tabKey: '1',
    });
  }

  @Bind()
  tabChange(key) {
    this.setState({
      tabKey: key,
      row: [],
    });
    this.props.form.resetFields();
  }

  render() {
    const {
      form: { getFieldDecorator },
      ecMaterielMapping: { materielList, categoryList, materielPagination },
      visible,
      modalMaterielLoading,
      modalCategoryLoading,
    } = this.props;
    const { row, tabKey } = this.state;
    const materielColumns = [
      {
        title: intl.get(`${modelPrompt}.itemId`).d('物料编码'),
        width: 210,
        dataIndex: 'itemCode',
      },
      {
        title: intl.get(`${modelPrompt}.itemName`).d('物料名称'),
        width: 210,
        dataIndex: 'itemName',
      },
    ];
    const categoryColumns = [
      {
        title: intl.get(`${modelPrompt}.categoryCode`).d('品类编码'),
        width: 210,
        dataIndex: 'categoryCode',
      },
      {
        title: intl.get(`${modelPrompt}.categoryName`).d('品类名称'),
        width: 210,
        dataIndex: 'categoryName',
      },
    ];
    const rowSelection = {
      type: 'radio',
      selectedRowKeys: tabKey === '1' ? row.map(n => n.itemId) : row.map(n => n.categoryId),
      onChange: (key, rows) => this.rowSelectChange({ key, rows }),
    };
    return (
      <Modal
        visible={visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        destroyOnClose
        className={style['mapping-modal']}
      >
        <Tabs
          animated={false}
          onChange={this.tabChange}
          defaultActiveKey="1"
          tabBarStyle={{ marginTop: '-16px' }}
        >
          <Tabs.TabPane tab={intl.get(`${modelPrompt}.materielMapping`).d('物料编码映射')} key="1">
            <Row gutter={12}>
              <Col span={8}>
                <FormItem label={intl.get(`${modelPrompt}.itemId`).d('物料编码')} {...formLayout}>
                  {getFieldDecorator('itemCode')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label={intl.get(`${modelPrompt}.itemName`).d('物料名称')} {...formLayout}>
                  {getFieldDecorator('itemName')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8} className="search-btn-more">
                <FormItem>
                  <Button onClick={() => this.props.form.resetFields()}>
                    {intl.get('hzero.common.button.reset').d('重置')}
                  </Button>
                  <Button type="primary" htmlType="submit" onClick={this.fetchMateriel}>
                    {intl.get('hzero.common.button.search').d('查询')}
                  </Button>
                </FormItem>
              </Col>
            </Row>
            <Table
              bordered
              rowKey="itemId"
              loading={modalMaterielLoading}
              columns={materielColumns}
              dataSource={materielList}
              rowSelection={rowSelection}
              pagination={materielPagination}
              onRow={record => ({
                onClick: () => this.rowSelectChange({ rows: [record] }),
                onDoubleClick: () =>
                  this.rowSelectChange({ rows: [record] }, () => this.handleOk()),
              })}
              onChange={page => this.fetchMateriel(page)}
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab={intl.get(`${modelPrompt}.categoryMapping`).d('采购品类映射')} key="2">
            <Row gutter={12}>
              <Col span={8}>
                <FormItem
                  label={intl.get(`${modelPrompt}.categoryCode`).d('品类编码')}
                  {...formLayout}
                >
                  {getFieldDecorator('categoryCode')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`${modelPrompt}.categoryName`).d('品类名称')}
                  {...formLayout}
                >
                  {getFieldDecorator('categoryName')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8} className="search-btn-more">
                <FormItem>
                  <Button onClick={() => this.props.form.resetFields()}>
                    {intl.get('hzero.common.button.reset').d('重置')}
                  </Button>
                  <Button type="primary" htmlType="submit" onClick={this.fetchCategory}>
                    {intl.get('hzero.common.button.search').d('查询')}
                  </Button>
                </FormItem>
              </Col>
            </Row>
            <Table
              bordered
              rowKey="categoryId"
              loading={modalCategoryLoading}
              dataSource={categoryList}
              columns={categoryColumns}
              rowSelection={rowSelection}
              pagination={false}
              onRow={record => ({
                onClick: () => this.rowSelectChange({ rows: [record] }),
                onDoubleClick: () =>
                  this.rowSelectChange({ rows: [record] }, () => this.handleOk()),
              })}
              onChange={page => this.fetchCategory(page)}
            />
          </Tabs.TabPane>
        </Tabs>
      </Modal>
    );
  }
}
