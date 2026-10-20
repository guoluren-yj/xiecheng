/**
 * index - 索赔单类型
 * @date: 2019-11-04
 * @author: wuting <ting.wu@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Button, Spin, Form, Modal } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isArray, isEmpty, omit, isUndefined, throttle } from 'lodash';
import uuid from 'uuid/v4';
import formatterCollections from 'utils/intl/formatterCollections';

import {
  addItemToPagination,
  delItemToPagination,
  getEditTableData,
  getCurrentOrganizationId,
  filterNullValueObject,
} from 'utils/utils';

import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import notification from 'utils/notification';

import ClaimTypeSearch from './ClaimTypeSearch';
import ClaimTypeList from './ClaimTypeList';
import ClaimItemModal from './ClaimItemModal';

@Form.create({ fieldNameProp: null })
@connect(({ loading = {}, claimTypeDefinition = {} }) => ({
  saveLoading: loading.effects['claimTypeDefinition/saveClaimType'],
  searchLoading: loading.effects['claimTypeDefinition/fetchClaimType'],
  deleteLoading: loading.effects['claimTypeDefinition/deleteClaimType'],
  itemSaveLoading: loading.effects['claimTypeDefinition/saveClaimItem'],
  itemSearchLoading: loading.effects['claimTypeDefinition/fetchClaimItem'],
  itemDeleteLoading: loading.effects['claimTypeDefinition/deleteClaimItem'],
  claimTypeDefinition,
}))
@formatterCollections({
  code: [
    'sqam.common',
    'sqam.claimTypeDefinition',
    'hzero.common',
    'entity.business',
    'entity.supplier',
    'entity.item',
    'entity.company',
    'entity.organization',
    'entity.roles',
  ],
})
export default class ClaimTypeDefinition extends Component {
  constructor(props) {
    super(props);
    this.state = {
      claimTypeId: null,
      visible: false,
      selectedRowKeys: [],
      tenantId: getCurrentOrganizationId(),
    };
  }

  // 索赔项目定义列表
  @Bind()
  onFetchList() {
    const { tenantId } = this.state;
    const {
      dispatch,
      claimTypeDefinition: { dataSource },
    } = this.props;
    const filterValues = isUndefined(this.filterForm)
      ? {}
      : filterNullValueObject(this.filterForm.getFieldsValue());
    dispatch({
      type: 'claimTypeDefinition/fetchClaimType',
      payload: {
        tenantId,
        ...filterValues,
      },
    }).then(() => {
      dataSource.forEach((item) => {
        item.$form.resetFields();
      });
      this.setState({ selectedRowKeys: [] });
    });
  }

  /**
   * 查询值集
   */
  @Bind()
  fetchEnum() {
    const { dispatch } = this.props;
    dispatch({
      type: 'claimTypeDefinition/init',
    });
  }

  componentDidMount() {
    this.fetchEnum(); // 查询值集
  }

  /**
   * 新建列表
   * @param {String} claimTypeId
   */
  @Bind()
  newProject() {
    const {
      dispatch,
      claimTypeDefinition: { dataSource, pagination },
    } = this.props;
    const newDataSource = {
      typeNum: null,
      typeDesc: null,
      enabledFlag: 1,
      typeRemark: null,
      autoConfirmFlag: 0,
      _status: 'create',
      claimTypeId: uuid(),
      defaultFlag: 0,
    };
    dispatch({
      type: 'claimTypeDefinition/updateState',
      payload: {
        dataSource: [newDataSource, ...dataSource],
        pagination: addItemToPagination(dataSource.length, pagination),
      },
    });
  }

  /**
   * delete - 清除勾选行
   */
  @Bind()
  onDelete() {
    const {
      dispatch,
      claimTypeDefinition: { dataSource = [], pagination = {} },
    } = this.props;
    const { selectedRowKeys, tenantId } = this.state;
    const newDataSource = [];
    const deleteList = [];
    dataSource.forEach((item) => {
      if (!selectedRowKeys.includes(item.claimTypeId)) {
        newDataSource.push(item);
      } else if (item._status !== 'create') {
        deleteList.push(omit(item, ['$form']));
      }
    });
    Modal.confirm({
      title: intl.get(`sqam.claimTypeDefinition.view.message.isClean`).d('是否清除？'),
      onOk: () => {
        if (!isEmpty(deleteList)) {
          dispatch({
            type: 'claimTypeDefinition/deleteClaimType',
            payload: { tenantId, deleteList },
          }).then((res) => {
            if (res) {
              notification.success();
              this.onFetchList();
            }
          });
        } else {
          dispatch({
            type: 'claimTypeDefinition/updateState',
            payload: {
              dataSource: newDataSource,
              pagination: delItemToPagination(dataSource.length, pagination),
            },
          });
        }
        this.setState({ selectedRowKeys: [] });
      },
    });
  }

  /**
   * 保存数据
   */
  @Bind()
  onSave() {
    const { claimTypeDefinition, dispatch } = this.props;
    const { dataSource = [] } = claimTypeDefinition;
    const newDataSource = [...dataSource];
    const lines = getEditTableData(newDataSource, ['_status', 'claimTypeId'], { force: true });
    if (newDataSource.length === 0 || (Array.isArray(lines) && lines.length !== 0)) {
      dispatch({
        type: 'claimTypeDefinition/saveClaimType',
        payload: lines,
      }).then((res) => {
        if (res) {
          notification.success();
          this.onFetchList();
        }
      });
    }
  }

  @Bind()
  changeDefaultFlag(record, dataSource, id) {
    dataSource.forEach((item) => {
      if (item[id] === record[id]) {
        item.$form.setFieldsValue({ defaultFlag: 1 });
      } else {
        item.$form.setFieldsValue({ defaultFlag: 0 });
      }
    });
  }

  @Bind()
  setId(record) {
    this.setState({ claimTypeId: record.claimTypeId });
  }

  /**
   * 显示modal框
   */
  @Bind()
  showModal() {
    this.setState({ visible: true });
  }

  /**
   * 隐藏modal框
   */
  @Bind()
  hideModal() {
    this.setState({ visible: false });
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
      dispatch,
      saveLoading,
      searchLoading,
      deleteLoading,
      itemSaveLoading,
      itemSearchLoading,
      itemDeleteLoading,
      claimTypeDefinition,
    } = this.props;
    const { visible, selectedRowKeys, claimTypeId } = this.state;
    const { dataSource, enumMap = {} } = claimTypeDefinition;
    const isLoading = saveLoading || searchLoading || deleteLoading || itemDeleteLoading || itemDeleteLoading || itemSearchLoading;
    const searchProps = {
      onRef: (node) => {
        this.filterForm = node.props.form;
      },
      onFetchList: this.onFetchList,
    };

    const listProps = {
      visible,
      dispatch,
      dataSource,
      selectedRowKeys,
      setId: this.setId,
      loading: searchLoading,
      showModal: this.showModal,
      onRowSelectChange: this.onRowSelectChange,
      changeDefaultFlag: this.changeDefaultFlag,
    };

    const modalProps = {
      enumMap,
      visible,
      claimTypeId,
      itemSaveLoading,
      itemSearchLoading,
      itemDeleteLoading,
      showModal: this.showModal,
      onCancel: this.hideModal,
      changeDefaultFlag: this.changeDefaultFlag,
    };

    return (
      <Fragment>
        <Header title={intl.get(`sqam.common.model.claimType`).d('索赔类型')}>
          <Button onClick={throttle(() => this.newProject(), 1500, { trailing: false })} type="primary" icon="plus" loading={isLoading}>
            {intl.get(`hzero.common.button.add`).d('新增')}
          </Button>
          <Button onClick={throttle(this.onSave, 1500, { trailing: false })} loading={isLoading} icon="save">
            {intl.get(`hzero.common.button.save`).d('保存')}
          </Button>
          <Button
            icon="delete"
            loading={isLoading}
            onClick={throttle(() => this.onDelete(), 1500, { trailing: false })}
            disabled={isArray(selectedRowKeys) && isEmpty(selectedRowKeys)}
          >
            {intl.get(`hzero.common.button.clean`).d('清除')}
          </Button>
        </Header>
        <Content>
          <Spin spinning={false}>
            <ClaimTypeSearch {...searchProps} />
            <ClaimTypeList {...listProps} />
          </Spin>
        </Content>
        {visible && <ClaimItemModal {...modalProps} />}
      </Fragment>
    );
  }
}
