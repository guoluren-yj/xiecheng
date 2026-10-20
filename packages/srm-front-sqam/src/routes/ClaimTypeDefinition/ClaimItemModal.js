/**
 * index - 索赔单类型
 * @date: 2019-11-04
 * @author: wuting <ting.wu@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Button, Spin, Row, Col, Modal, Form } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isArray, isEmpty, omit, isUndefined, throttle } from 'lodash';
import uuid from 'uuid/v4';

import {
  getEditTableData,
  createPagination,
  addItemToPagination,
  delItemToPagination,
  filterNullValueObject,
  getCurrentOrganizationId,
} from 'utils/utils';

import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import notification from 'utils/notification';

import ItemSearch from './ItemSearch';
import ItemList from './ItemList';

const customizeUnitCodes = ['SQAM.CLAIM_TYPE_DEFINITION_LIST.ITEM_GRID'].join();

@Form.create({ fieldNameProp: null })
@connect(({ claimTypeDefinition = {} }) => ({
  claimTypeDefinition,
}))
export default class ClaimTypeDefinition extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
      pagination: {},
      selectedRowKeys: [],
      tenantId: getCurrentOrganizationId(),
    };
  }

  // 索赔项目定义列表
  @Bind()
  onFetchList(page = {}) {
    const { tenantId, dataSource = [] } = this.state;
    const { dispatch, claimTypeId } = this.props;
    const filterValues = isUndefined(this.filterForm)
      ? {}
      : filterNullValueObject(this.filterForm.getFieldsValue());
    dispatch({
      type: 'claimTypeDefinition/fetchClaimItem',
      payload: {
        page,
        tenantId,
        claimTypeId,
        ...filterValues,
        customizeUnitCode: customizeUnitCodes,
      },
    }).then(res => {
      if (res) {
        this.setState({
          dataSource: res.content.map(item => {
            return { _status: 'update', ...item };
          }),
          pagination: createPagination(res),
        });
        this.setState({ selectedRowKeys: [] });
      }
      dataSource.forEach(item => {
        item.$form.resetFields();
      });
    });
  }

  /**
   * 新建列表
   * @param {String} claimItemId
   */
  @Bind()
  newProject() {
    const { dataSource, pagination, tenantId } = this.state;
    const { claimTypeId } = this.props;
    const newDataSource = {
      tenantId,
      claimTypeId,
      enabledFlag: 1,
      _status: 'create',
      itemExplain: null,
      claimItemId: uuid(),
      claimItemDesc: null,
      claimItemNum: null,
      defaultFlag: 0,
    };
    this.setState({
      dataSource: [newDataSource, ...dataSource],
      pagination: addItemToPagination(dataSource.length, pagination),
    });
  }

  /**
   * delete - 清除勾选行
   */
  @Bind()
  onDelete() {
    const { dispatch } = this.props;
    const { selectedRowKeys, tenantId, dataSource, pagination } = this.state;
    const newDataSource = [];
    const deleteList = [];
    dataSource.forEach(item => {
      if (!selectedRowKeys.includes(item.claimItemId)) {
        newDataSource.push(item);
      } else if (item._status !== 'create') {
        deleteList.push(omit(item, ['$form']));
      }
    });
    Modal.confirm({
      title: intl.get(`sqam.claimTypeDefinition.view.message.isDelete`).d('是否删除'),
      onOk: () => {
        if (!isEmpty(deleteList)) {
          dispatch({
            type: 'claimTypeDefinition/deleteClaimItem',
            payload: {
              tenantId,
              deleteList,
              customizeUnitCode: customizeUnitCodes,
            },
          }).then(res => {
            if (res) {
              notification.success();
              this.onFetchList();
            }
          });
        } else {
          this.setState({
            dataSource: newDataSource,
            pagination: delItemToPagination(dataSource.length, pagination),
          });
        }
      },
    });
  }

  /**
   * 保存数据
   */
  @Bind()
  onSave(flag) {
    const { dispatch, onCancel } = this.props;
    const { dataSource = [] } = this.state;
    const newDataSource = [...dataSource];
    const lines = getEditTableData(newDataSource, ['_status', 'claimItemId'], { force: true });
    if (newDataSource.length === 0 || (Array.isArray(lines) && lines.length !== 0)) {
      dispatch({
        type: 'claimTypeDefinition/saveClaimItem',
        payload: { lines, customizeUnitCode: customizeUnitCodes },
      }).then(res => {
        if (res) {
          notification.success();
          this.onFetchList();
          if (flag) {
            onCancel();
          }
        }
      });
    }
  }

  /**
   * 设置选中行
   * @param {Array} selectedRowKeys
   */
  @Bind()
  onRowSelectChange(selectedRowKeys) {
    this.setState({ selectedRowKeys });
  }

  render() {
    const {
      enumMap,
      visible,
      dispatch,
      onCancel,
      itemSaveLoading,
      itemSearchLoading,
      itemDeleteLoading,
      changeDefaultFlag,
    } = this.props;
    const { selectedRowKeys = [], dataSource, pagination } = this.state;
    const searchProps = {
      pagination,
      onRef: node => {
        this.filterForm = node.props.form;
      },
      onFetchList: this.onFetchList,
    };

    const listProps = {
      enumMap,
      visible,
      dispatch,
      pagination,
      dataSource,
      selectedRowKeys,
      changeDefaultFlag,
      onSearch: this.onFetchList,
      loading: itemSearchLoading,
      onRowSelectChange: this.onRowSelectChange,
    };

    return (
      <Modal
        width={800}
        destroyOnClose
        visible={visible}
        onCancel={onCancel}
        onOk={this.onSave}
        wrapClassName="ant-modal-sidebar-right"
        transitionName="move-right"
        confirmLoading={itemSaveLoading}
      >
        <Fragment>
          <Header title={intl.get(`sqam.common.view.title.claimTypeDef`).d('索赔项目定义')}>
            <Row>
              <Col>
                <Button
                  icon="delete"
                  style={{ marginLeft: 8 }}
                  loading={itemDeleteLoading}
                  onClick={throttle(() => this.onDelete(), 1500, { trailing: false })}
                  disabled={isArray(selectedRowKeys) && isEmpty(selectedRowKeys)}
                >
                  {intl.get(`hzero.common.button.delete`).d('删除')}
                </Button>
                {/* <Button
                  onClick={() => this.onSave(true)}
                  style={{ marginLeft: 8 }}
                  loading={itemSaveLoading}
                  icon="save"
                >
                  {intl.get(`hzero.common.button.save`).d('保存')}
                </Button> */}
                <Button
                  style={{ marginLeft: 8 }}
                  onClick={throttle(() => this.newProject(), 1500, { trailing: false })}
                  type="primary"
                  icon="plus"
                >
                  {intl.get(`hzero.common.button.add`).d('新增')}
                </Button>
              </Col>
            </Row>
          </Header>
          <Content>
            <Spin spinning={false}>
              <ItemSearch {...searchProps} />
              <ItemList {...listProps} />
            </Spin>
          </Content>
        </Fragment>
      </Modal>
    );
  }
}
