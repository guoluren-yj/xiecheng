/**
 * AssignMaterialModal - 分配物料Modal
 * @date: 2019-08-16
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */

import { connect } from 'dva';
import { isUndefined } from 'lodash';
import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import notification from 'utils/notification';
import { Modal, Row, Col, Button, Spin } from 'hzero-ui';

import intl from 'utils/intl';
import { filterNullValueObject } from 'utils/utils';

import AssignedTable from './AssignedTable';
import UndistributedTable from './UndistributedTable';

const promptCode = 'ssrc.quotationTemplate';

@connect(({ quotationTemplate, loading }) => ({
  quotationTemplate,
  queryAssignedLoading: loading.effects['quotationTemplate/queryAssignedMaterial'],
  queryUndistributedLoading: loading.effects['quotationTemplate/queryUndistributedMaterial'],
}))
export default class AssignMaterialModal extends Component {
  assignedTable; // 已分配table

  undistributedTable; // 未分配table

  constructor(props) {
    super(props);
    this.state = {
      disabledLeft: true,
      disabledRight: true,
    };
  }

  componentDidMount() {
    this.handleUndistributedMaterial();
    this.handleAssignedMaterial();
  }

  /**
   * 绑定assignedTable
   */
  @Bind()
  handleBindAssignedTable(assignedTableRef = {}) {
    this.assignedTable = assignedTableRef;
  }

  /**
   * 绑定undistributedTable
   */
  @Bind()
  handleBindUndistributedTable(undistributedTableRef = {}) {
    this.undistributedTable = undistributedTableRef;
  }

  @Bind()
  getFather() {
    return this;
  }

  /**
   * 查询可分配物料
   */
  @Bind()
  handleUndistributedMaterial(page = {}) {
    const { dispatch, templateId, currentRow } = this.props;
    const formValues = isUndefined(this.undistributedTable)
      ? {}
      : filterNullValueObject(this.undistributedTable.props.form.getFieldsValue());
    dispatch({
      type: 'quotationTemplate/queryUndistributedMaterial',
      payload: {
        page,
        templateId,
        ...formValues,
        templateCode: currentRow.templateNum,
      },
    });
  }

  /**
   * 查询已分配物料
   */
  @Bind()
  handleAssignedMaterial(page = {}) {
    const { dispatch, templateId } = this.props;
    const formValues = isUndefined(this.assignedTable)
      ? {}
      : filterNullValueObject(this.assignedTable.props.form.getFieldsValue());
    dispatch({
      type: 'quotationTemplate/queryAssignedMaterial',
      payload: {
        page,
        templateId,
        ...formValues,
      },
    });
  }

  /**
   * 数据刷新
   */
  @Bind()
  refresh() {
    this.assignedTable.state.selectedRowKeys = [];
    this.undistributedTable.state.selectedRowKeys = [];
    this.handleUndistributedMaterial();
    this.handleAssignedMaterial();
    this.setState({
      disabledLeft: true,
      disabledRight: true,
    });
  }

  /**
   * 从左至右（新增物料）
   */
  @Bind()
  handleAdd() {
    const { dispatch, templateId, quotationDimensionType } = this.props;

    const rowKey = this.undistributedTable.state.selectedRowKeys;
    const quotationDimensionList = rowKey.map(n => ({ itemCategoryId: n }));

    dispatch({
      type: 'quotationTemplate/addMaterial',
      payload: {
        templateId,
        quotationDimensionList,
        quotationDimensionType,
      },
    }).then(res => {
      if (res) {
        notification.success();
        this.refresh();
      }
    });
  }

  /**
   * 从右至左（删除物料）
   */
  @Bind()
  handleDelete() {
    const { dispatch } = this.props;
    const rowKey = this.assignedTable.state.selectedRowKeys;
    const quotationDimensionList = rowKey.map(n => ({ dimensionId: n }));
    dispatch({
      type: 'quotationTemplate/deleteMaterial',
      payload: quotationDimensionList,
    }).then(res => {
      if (res) {
        notification.success();
        this.refresh();
      }
    });
  }

  render() {
    const { disabledLeft, disabledRight } = this.state;
    const {
      onCancel,
      currentRow,
      assignMaterialVisible,
      quotationTemplate: {
        undistributedMaterialList,
        undistributedMaterialPagination,
        assignedMaterialList,
        assignedMaterialPagination,
      },
      queryAssignedLoading,
      queryUndistributedLoading,
    } = this.props;
    const assignedTableProps = {
      currentRow,
      assignedMaterialList,
      assignedMaterialPagination,
      onRef: this.handleBindAssignedTable,
      onSearch: this.handleAssignedMaterial,
      onChange: this.handleAssignedMaterial,
      getFather: this.getFather,
    };
    const undistributedTableProps = {
      currentRow,
      undistributedMaterialList,
      undistributedMaterialPagination,
      onRef: this.handleBindUndistributedTable,
      onSearch: this.handleUndistributedMaterial,
      onChange: this.handleUndistributedMaterial,
      getFather: this.getFather,
    };
    return (
      <Modal
        width={1300}
        footer={null}
        bodyStyle={{ paddingTop: 16 }}
        onCancel={onCancel}
        visible={assignMaterialVisible}
        title={intl.get(`${promptCode}.model.title.assignMaterial`).d('分配适用物料')}
      >
        <Spin spinning={queryUndistributedLoading || queryAssignedLoading}>
          <Row gutter={24} style={{ display: 'flex' }}>
            <Col span={11}>
              <UndistributedTable {...undistributedTableProps} />
            </Col>
            <Col
              span={2}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <div style={{ position: 'absolute', width: '100%', textAlign: 'center' }}>
                <Button
                  type="primary"
                  icon="left"
                  disabled={currentRow.templateStatus === 'RELEASED' || disabledLeft}
                  onClick={this.handleDelete}
                />
              </div>
              <div
                style={{ position: 'absolute', width: '100%', textAlign: 'center', marginTop: 36 }}
              >
                <Button
                  type="primary"
                  icon="right"
                  disabled={currentRow.templateStatus === 'RELEASED' || disabledRight}
                  onClick={this.handleAdd}
                />
              </div>
            </Col>
            <Col span={11}>
              <AssignedTable {...assignedTableProps} />
            </Col>
          </Row>
        </Spin>
      </Modal>
    );
  }
}
