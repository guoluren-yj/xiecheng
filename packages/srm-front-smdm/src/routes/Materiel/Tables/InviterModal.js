/**
 * MultiSelectModal -lov多选框 邀请方
 * @date: 2020-4-29
 * @author: yanglin <lin.yang05@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Bind } from 'lodash-decorators';
import { Form, Input, Table, Modal, Row, Button, Col, List, Icon, Tooltip } from 'hzero-ui';
import { isUndefined } from 'lodash';

import { createPagination, filterNullValueObject } from 'utils/utils';
import intl from 'utils/intl';
import styles from '../index.less';

const FormItem = Form.Item;
const ListItem = List.Item;

const formItemLayout = {
  labelCol: {
    sm: { span: 8 },
  },
  wrapperCol: {
    sm: { span: 14 },
  },
};

@Form.create({ fieldNameProp: null })
export default class InviterModal extends PureComponent {
  state = {
    data: {},
    selectedChildRows: [],
    selectedRowKeys: [],
    loading: false,
  };

  componentDidMount() {
    this.fetchInviterData();
  }

  @Bind()
  fetchInviterData(page = {}) {
    this.setState({ loading: true });
    const { fetchData, queryParams, form } = this.props;
    const fieldValues = isUndefined(form) ? {} : filterNullValueObject(form.getFieldsValue());
    fetchData({
      page,
      ...queryParams,
      ...fieldValues,
    }).then((res) => {
      if (res) {
        this.setState({ data: res, loading: false });
      }
    });
  }

  @Bind()
  handleRowSelect(selectedRowKeys, selectedChild, rowSelect) {
    if (rowSelect) {
      const includeFlag = selectedRowKeys.indexOf(rowSelect.categoryId);
      if (includeFlag >= 0) {
        selectedRowKeys.splice(includeFlag, 1);
        selectedChild.splice(includeFlag, 1);
      } else {
        selectedRowKeys.push(rowSelect.categoryId);
        selectedChild.push(rowSelect);
      }
    }
    const rowIds = selectedChild.map((ele) => ele.categoryId);
    const { selectedChildRows = [] } = this.state;
    const newRows = selectedChildRows.filter(
      (obj) => selectedRowKeys.findIndex((ele) => obj.categoryId === ele) !== -1
    );
    const dataSource = newRows.filter((ele) => !rowIds.includes(ele.categoryId));
    this.setState({
      selectedRowKeys,
      selectedChildRows: [...dataSource, ...selectedChild],
    });
  }

  @Bind()
  onSaveRecord() {
    const { triggerChange } = this.props;
    const { selectedChildRows = [] } = this.state;
    if (selectedChildRows.length > 0) {
      triggerChange(selectedChildRows);
      this.cancelModal();
    }
  }

  @Bind()
  handleCurrentRowSelect(record) {
    const { selectedRowKeys = [], selectedChildRows = [] } = this.state;
    this.handleRowSelect(
      JSON.parse(JSON.stringify(selectedRowKeys)),
      JSON.parse(JSON.stringify(selectedChildRows)),
      record
    );
  }

  /**
   * 关闭弹窗
   */
  @Bind()
  cancelModal() {
    const { handleCancelModal } = this.props;
    handleCancelModal();
  }

  /**
   * 弹窗确定
   */
  @Bind()
  handleSaveRecord() {
    this.onSaveRecord();
  }

  @Bind()
  resetSearchDate() {
    const { form } = this.props;
    form.resetFields();
  }

  @Bind()
  renderItem(item) {
    return (
      <ListItem style={{ height: '35px', display: 'inline-block', border: 'none' }}>
        <span
          style={{
            padding: '5px',
            paddingTop: 0,
            paddingButton: 0,
            overflow: 'hidden',
          }}
        >
          {item.companyName}
          <Icon
            type="close-circle"
            theme="filled"
            className={styles.close}
            onClick={() => this.handleCurrentRowSelect(item)}
          />
        </span>
      </ListItem>
    );
  }

  render() {
    const {
      inviterVisble,
      form: { getFieldDecorator },
      // canSelectParentRows,
      categoryLevelControl,
    } = this.props;
    const { data, loading = false, selectedRowKeys } = this.state;
    const queryFields = [
      {
        field: 'categoryCode',
        label: intl.get(`smdm.materiel.view.message.categoriesModal.categoryCode`).d('类别编码'),
      },
      {
        field: 'categoryName',
        label: intl.get('smdm.materiel.view.message.categoriesModal.categoryName').d('类别名称'),
      },
    ];
    const fieldsColumn = [
      {
        title: intl.get(`smdm.materiel.view.message.categoriesModal.categoryCode`).d('类别编码'),
        dataIndex: 'categoryCode',
        width: 150,
      },
      {
        title: intl.get('smdm.materiel.view.message.categoriesModal.categoryName').d('类别名称'),
        dataIndex: 'categoryName',
        width: 150,
        render: (val) => (
          <Tooltip title={val || ''} placement="top">
            {val}
          </Tooltip>
        ),
      },
    ];
    // 查询条件
    const span = queryFields.length <= 1 ? 24 : 12;
    const queryCondition = queryFields.map((queryItem) => {
      return (
        <Col span={span} key={queryItem.field}>
          <FormItem {...formItemLayout} label={queryItem.label}>
            {getFieldDecorator(queryItem.field)(<Input onPressEnter={this.fetchInviterData} />)}
          </FormItem>
        </Col>
      );
    });

    return (
      <Modal
        destroyOnClose
        width={700}
        visible={inviterVisble}
        onCancel={this.cancelModal}
        onOk={this.handleSaveRecord}
        title={intl.get('smdm.materiel.view.message.categoriesModal.category').d('品类')}
        wrapClassName="lov-modal"
      >
        <React.Fragment>
          <div style={{ display: 'flex', marginBottom: '5px', marginTop: '5px' }}>
            <Row style={{ flex: 'auto' }}>{queryCondition}</Row>
            <div style={{ width: '80px', padding: '5px 0 0 15px' }}>
              <Button onClick={this.resetSearchDate}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
            </div>
            <div style={{ width: '80px', padding: '5px 0 0 15px' }}>
              <Button type="primary" onClick={() => this.fetchInviterData()}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </div>
          </div>
          <Table
            dataSource={data.content}
            pagination={createPagination(data)}
            columns={fieldsColumn}
            loading={loading}
            onChange={this.fetchInviterData}
            rowKey="categoryId"
            rowSelection={{
              selectedRowKeys,
              onChange: this.handleRowSelect,
              getCheckboxProps: (record) => ({
                disabled: categoryLevelControl && record?.hasChild && record?.hasChild !== '0',
                // name: record.name,
              }),
            }}
            onRow={(record) => ({
              onClick: () =>
                categoryLevelControl && record?.hasChild && record?.hasChild !== '0'
                  ? null
                  : this.handleCurrentRowSelect(record),
            })}
            bordered
          />
        </React.Fragment>
      </Modal>
    );
  }
}
