/*
 * InnerControl - 内部价格屏蔽控制
 * @date: 2018-11-07
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent, Fragment } from 'react';
import { Table, Form, Button, Row, Col, Input } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { sum, isNumber, differenceBy, isArray } from 'lodash';

import Lov from 'components/Lov';
import MultiLov from '@/routes/ConfigServer/components/MultiLov';
import Checkbox from 'components/Checkbox';
// import PropTypes from 'prop-types';
import intl from 'utils/intl';

import styles from './index.less';

const FormItem = Form.Item;
@Form.create({ fieldNameProp: null })
// @formatterCollections({ code: 'sslm.referenceTemplate' })
export default class InnerControl extends PureComponent {
  componentDidMount() {
    const { handleSearchInner, onRef } = this.props;
    if (handleSearchInner) {
      handleSearchInner();
    }
    if (onRef) {
      onRef(this);
    }
  }

  /**
   * 改变状态树对应key的值
   * @param {String} dataIndex
   * @param {String} value
   * @param {Object} record
   */
  @Bind()
  handleChangeColumn(dataIndex, value, record) {
    if (this.props.handleChangeColumn) {
      this.props.handleChangeColumn(dataIndex, value, record);
    }
  }

  /**
   * 新建内部控制
   * @param {Number} investigateTemplateId
   */
  @Bind()
  handleCreate() {
    const { handleCreate } = this.props;
    if (handleCreate) {
      handleCreate();
    }
  }

  /**
   * 内部控制保存
   */
  @Bind()
  handleSave() {
    const {
      handleSave,
      form: { validateFields },
    } = this.props;
    if (handleSave) {
      validateFields((errs, values) => {
        if (!errs) {
          handleSave(values);
        }
      });
    }
  }

  /**
   * 保存内部控制
   */
  @Bind()
  handleDelete() {
    const { handleDeleteInner } = this.props;
    if (handleDeleteInner) {
      handleDeleteInner();
    }
  }

  /**
   * 分配组织
   * @param {Object} record
   */
  @Bind()
  allocateOrg(record) {
    const { searchShieldOrg, dispatch } = this.props;
    dispatch({
      type: 'configServer/updateState',
      payload: { leftCurrentRow: record.shieldId },
    });
    searchShieldOrg({ organizationId: record.tenantId, shieldId: record.shieldId });
  }

  /**
   * 分配品类
   * @param {Object} record
   */
  @Bind()
  allocateCategory(record) {
    const { searchShieldCategory, dispatch } = this.props;
    dispatch({
      type: 'configServer/updateState',
      payload: { leftCurrentRow: record.shieldId },
    });
    searchShieldCategory({ organizationId: record.tenantId, shieldId: record.shieldId });
  }

  /**
   * 角色Lov修改带出其他信息
   * @param {*} value
   * @param {*} lovRecord
   * @param {*} record
   */
  @Bind()
  handleLovOnChange(value, lovRecord, record) {
    const {
      form: { setFieldsValue },
    } = this.props;
    const code = lovRecord.code.includes('/')
      ? lovRecord.code.substring(lovRecord.code.lastIndexOf('/') + 1)
      : lovRecord.code;
    setFieldsValue({ [`${record.shieldId}.roleCode`]: code });
  }

  /**
   * 新建品类权限
   * @param {Array} selectedRows 多选Lov勾选行
   */
  @Bind()
  newCategoryPer(selectedRows) {
    const { dispatch, innerControlList, shieldId } = this.props;
    dispatch({
      type: 'configServer/updateState',
      payload: {
        innerControlList: innerControlList.map((i) => {
          if (i.shieldId === shieldId) {
            return { ...i, categoryList: selectedRows };
          }
          return i;
        }),
      },
    });
  }

  /**
   * 删除品类权限
   * @param {Array} selectedRows 已选分配品类勾选行
   */
  @Bind()
  deleteCategoryPer() {
    const { dispatch, innerControlList, shieldId, categorySelectRows = [] } = this.props;
    dispatch({
      type: 'configServer/updateState',
      payload: {
        innerControlList: innerControlList.map((i) => {
          if (i.shieldId === shieldId && isArray(i.categoryList)) {
            return {
              ...i,
              categoryList: differenceBy(i.categoryList, categorySelectRows, ['categoryId']),
              categorySelectRows: [],
            };
          }
          return i;
        }),
      },
    });
  }

  render() {
    const {
      shieldId,
      loading,
      lodingCategory,
      loadingInnerList,
      deletingInner,
      savingInner,
      innerControlList,
      innerControlListPagination,
      innerRowSelection,
      orgRowSelection,
      categoryRowSelection,
      handleSearchInner,
      leftCurrentRow,
      organizationList = [],
      form: { getFieldDecorator },
      rightTableType,
    } = this.props;
    const categoryList = innerControlList.find((i) => i.shieldId === shieldId)?.categoryList || [];
    const columns = [
      {
        title: intl.get(`spfm.configServer.model.purchaser.roleName`).d('角色名称'),
        dataIndex: 'roleName',
        width: 200,
        render: (val, record) =>
          record.isNew ? (
            <FormItem>
              {getFieldDecorator(`${record.shieldId}.roleName`, {
                initialValue: record.roleName,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`spfm.configServer.model.purchaser.roleName`).d('角色名称'),
                    }),
                  },
                ],
              })(
                <Lov
                  code="HIAM.TENANT.ROLE"
                  onChange={(value, lovRecord) => this.handleLovOnChange(value, lovRecord, record)}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`spfm.configServer.model.purchaser.roleCode`).d('角色编码'),
        dataIndex: 'roleCode',
        width: 150,
        render: (val, record) =>
          record.isNew ? (
            <FormItem>
              {getFieldDecorator(`${record.shieldId}.roleCode`, {
                initialValue: record.roleCode,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`spfm.configServer.model.purchaser.roleCode`).d('角色编码'),
                    }),
                  },
                ],
              })(<Input disabled />)}
            </FormItem>
          ) : val.includes('/') ? (
            val.substring(val.lastIndexOf('/') + 1)
          ) : (
            val
          ),
      },
      {
        title: intl.get(`spfm.configServer.model.purchaser.detailedControlFlag`).d('精细控制'),
        dataIndex: 'detailedControlFlag',
        width: 80,
        render: (val, record) => (
          <Checkbox
            checked={val === 1 ? 1 : 0}
            onChange={(e) =>
              this.handleChangeColumn('detailedControlFlag', e.target.checked, record)
            }
          />
        ),
      },
      {
        title: intl.get(`spfm.configServer.model.purchaser.allocateOrg`).d('分配组织'),
        width: 100,
        render: (val, record) => (
          <React.Fragment>
            {record.detailedControlFlag === 1 && !record.isNew && (
              <a onClick={() => this.allocateOrg(record)}>
                {intl.get(`spfm.configServer.model.purchaser.allocateOrg`).d('分配组织')}
              </a>
            )}
          </React.Fragment>
        ),
      },
      {
        title: intl.get(`spfm.configServer.model.purchaser.allocateCategory`).d('分配品类'),
        width: 100,
        render: (val, record) => (
          <React.Fragment>
            {record.detailedControlFlag === 1 && !record.isNew && (
              <a onClick={() => this.allocateCategory(record)}>
                {intl.get(`spfm.configServer.model.purchaser.allocateCategory`).d('分配品类')}
              </a>
            )}
          </React.Fragment>
        ),
      },
    ];
    const leftScrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    const columnsRight = [
      {
        title: intl.get(`spfm.configServer.model.purchaser.orgName`).d('公司/业务单元'),
        dataIndex: 'orgName',
        width: 200,
      },
      {
        title: intl.get(`spfm.configServer.model.purchaser.orgCode`).d('代码'),
        dataIndex: 'orgCode',
        width: 100,
      },
    ];
    const columnsCategory = [
      {
        title: intl.get(`spfm.configServer.model.purchaser.categoryCode`).d('品类代码'),
        dataIndex: 'categoryCode',
        width: 200,
      },
      {
        title: intl.get(`spfm.configServer.model.purchaser.categoryName`).d('品类名称'),
        dataIndex: 'categoryName',
        width: 100,
      },
    ];
    return (
      <Fragment>
        <div className={styles['inner-header']}>
          <Row style={{ marginTop: 16, marginBottom: 16 }}>
            <Col>
              <Button style={{ float: 'right' }} type="primary" onClick={this.handleCreate}>
                {intl.get('hzero.common.button.create').d('新建')}
              </Button>
              <Button
                style={{ marginRight: 8, float: 'right' }}
                onClick={this.handleSave}
                loading={savingInner || loadingInnerList}
              >
                {intl.get('hzero.common.button.save').d('保存')}
              </Button>
              <Button
                style={{ marginRight: 8, float: 'right' }}
                onClick={this.handleDelete}
                loading={deletingInner}
              >
                {intl.get('hzero.common.button.delete').d('删除')}
              </Button>
            </Col>
          </Row>
          {rightTableType === 'category' && (
            <Row style={{ marginTop: 16, marginBottom: 16 }}>
              <Col>
                <Button style={{ float: 'right' }} type="primary" onClick={this.deleteCategoryPer}>
                  {intl.get('spfm.configServer.view.button.deleteCategoryPer').d('删除品类权限')}
                </Button>
                <MultiLov
                  style={{ marginRight: 8, float: 'right' }}
                  isButton
                  code="SPRM.ITEM_CATEGOR"
                  onOk={this.newCategoryPer}
                  value={categoryList.map((i) => i.categoryId)}
                >
                  {intl.get('spfm.configServer.view.button.newCategoryPer').d('新建品类权限')}
                </MultiLov>
              </Col>
            </Row>
          )}
        </div>
        <Row gutter={24}>
          <Col span={14} className={styles['input-table']}>
            <Table
              loading={loadingInnerList}
              rowKey="shieldId"
              bordered
              columns={columns}
              dataSource={innerControlList}
              pagination={innerControlListPagination}
              onChange={handleSearchInner}
              rowSelection={innerRowSelection}
              scroll={{ x: leftScrollX, y: 300 }}
              rowClassName={(record) =>
                record.shieldId === leftCurrentRow ? styles.currencyRowActive : styles.currencyRow
              }
            />
          </Col>
          <Col span={10} className={styles['input-table']}>
            {rightTableType === 'org' ? (
              <Table
                bordered
                loading={loading}
                rowKey="id"
                columns={columnsRight}
                dataSource={organizationList}
                pagination={false}
                rowSelection={orgRowSelection}
                scroll={{ y: 300 }}
              />
            ) : (
              <Table
                bordered
                loading={lodingCategory}
                rowKey="categoryId"
                columns={columnsCategory}
                dataSource={categoryList}
                pagination={false}
                rowSelection={categoryRowSelection}
                scroll={{ y: 300 }}
              />
            )}
          </Col>
        </Row>
      </Fragment>
    );
  }
}
