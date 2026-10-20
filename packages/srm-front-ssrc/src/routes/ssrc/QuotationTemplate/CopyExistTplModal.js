/**
 * CopyExistTplModal - 复制已有品类模板
 * @date: 2019-08-16
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */

import { connect } from 'dva';
import { isEmpty } from 'lodash';
import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { Modal, Form, Row, Col, Button, Input, Table } from 'hzero-ui';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { filterNullValueObject } from 'utils/utils';

import styles from '@/routes/ssrc/common.less';

const promptCode = 'ssrc.quotationTemplate';

@Form.create({ fieldNameProp: null })
@connect(({ quotationTemplate, loading }) => ({
  quotationTemplate,
  saveLoading: loading.effects['quotationTemplate/copyTemplate'],
  queryLoading: loading.effects['quotationTemplate/queryCopyData'],
}))
export default class CopyExistTplModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRows: [], // 选中项
    };
  }

  componentDidMount() {
    this.handleCopy();
  }

  /**
   * 选中项发生变化时的回调
   */
  @Bind()
  handleSelectChange(_, selectedRows) {
    this.setState({ selectedRows });
  }

  /**
   * 单击某行时的回调
   */
  @Bind()
  handleRowClick(record) {
    this.setState({
      selectedRows: [record],
    });
  }

  /**
   * 查询可复制品类／物料
   */
  @Bind()
  handleCopy(page = {}) {
    const { dispatch, templateId, form } = this.props;
    const formValues = filterNullValueObject(form.getFieldsValue());
    dispatch({
      type: 'quotationTemplate/queryCopyData',
      payload: {
        page,
        templateId,
        ...formValues,
      },
    });
  }

  /**
   * 复制模板
   */
  @Bind()
  handleAssign() {
    const { selectedRows } = this.state;
    const { dispatch, templateId, onResh, onCancel } = this.props;
    let sourceTemplateId;
    selectedRows.forEach(n => {
      sourceTemplateId = n.templateId;
    });

    if (!isEmpty(selectedRows)) {
      dispatch({
        type: 'quotationTemplate/copyTemplate',
        payload: {
          templateId,
          sourceTemplateId,
        },
      }).then(res => {
        if (res) {
          notification.success();
          onCancel();
          onResh();
        }
      });
    }
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
      onCancel,
      saveLoading,
      queryLoading,
      quotationDimension,
      copyExistTplVisible,
      form: { getFieldDecorator },
      quotationTemplate: { copyDataList, copyDataPagination },
    } = this.props;
    const { selectedRows } = this.state;
    const rowSelection = {
      type: 'radio',
      selectedRowKeys: selectedRows.map(n => n.dimensionId),
      onChange: this.handleSelectChange,
    };
    const columns = [
      {
        title:
          quotationDimension === 'ITEM'
            ? intl.get(`${promptCode}.model.assignedTempMaterial.code`).d('物料编码')
            : intl.get(`${promptCode}.model.assignedTempCategory.code`).d('品类编码'),
        dataIndex: 'itemCode',
      },
      {
        title:
          quotationDimension === 'ITEM'
            ? intl.get(`${promptCode}.model.assignedTempMaterial.name`).d('物料名称')
            : intl.get(`${promptCode}.model.assignedTempCategory.name`).d('品类名称'),
        dataIndex: 'itemName',
        width: 300,
      },
    ];
    return (
      <Modal
        width={720}
        onCancel={onCancel}
        onOk={this.handleAssign}
        confirmLoading={saveLoading}
        wrapClassName={styles['category-modal']}
        visible={copyExistTplVisible}
        title={
          quotationDimension === 'ITEM'
            ? intl.get(`${promptCode}.model.title.assignedTempMaterial`).d('已分配模板物料')
            : intl.get(`${promptCode}.model.title.assignedTempCategory`).d('已分配模板品类')
        }
      >
        <Form>
          <Row gutter={24} style={{ marginBottom: 16 }}>
            <Col span={8}>
              <Row style={{ display: 'flex', alignItems: 'center' }}>
                <Col span={8}>
                  {quotationDimension === 'ITEM'
                    ? intl.get(`${promptCode}.model.assignedTempMaterial.code`).d('物料编码')
                    : intl.get(`${promptCode}.model.assignedTempCategory.code`).d('品类编码')}
                  :
                </Col>
                <Col span={16}>
                  {getFieldDecorator('itemCode')(
                    <Input trim inputChinese={false} typeCase="upper" />
                  )}
                </Col>
              </Row>
            </Col>
            <Col span={8}>
              <Row style={{ display: 'flex', alignItems: 'center' }}>
                <Col span={8}>
                  {quotationDimension === 'ITEM'
                    ? intl.get(`${promptCode}.model.assignedTempMaterial.name`).d('物料名称')
                    : intl.get(`${promptCode}.model.assignedTempCategory.name`).d('品类名称')}
                  :
                </Col>
                <Col span={16}>{getFieldDecorator('itemName')(<Input />)}</Col>
              </Row>
            </Col>
            <Col span={6}>
              <Button data-code="reset" onClick={this.handleReset} style={{ marginRight: 8 }}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button data-code="search" type="primary" htmlType="submit" onClick={this.handleCopy}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </Col>
          </Row>
        </Form>
        <Table
          bordered
          columns={columns}
          rowKey="dimensionId"
          loading={queryLoading}
          dataSource={copyDataList}
          onChange={this.handleCopy}
          rowSelection={rowSelection}
          pagination={copyDataPagination}
          onRow={(record, index) => {
            return {
              onClick: () => this.handleRowClick(record, index),
            };
          }}
        />
      </Modal>
    );
  }
}
