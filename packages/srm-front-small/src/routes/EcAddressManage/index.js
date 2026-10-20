/**
 * EcAddressManage -电商平台地址管理
 * @date: 2019-11-21
 * @author fujie <jie.fu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Button, Form, Input, Checkbox, Modal, Icon } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';
import { connect } from 'dva';
import uuid from 'uuid/v4';

import TLEditor from 'components/TLEditor';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { enableRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import { getEditTableData, addItemToPagination, delItemToPagination } from 'utils/utils';

import { Content, Header } from 'components/Page';
import EditTable from 'components/EditTable';
import TreeList from './TreeList';
import styles from './index.less';

const FormItem = Form.Item;

@connect(({ loading, ecAddressManage }) => ({
  ecAddressManage,
  loading: loading.effects['ecAddressManage/fetchAddressList'],
  saveLoading: loading.effects['ecAddressManage/saveAddress'],
}))
@formatterCollections({ code: ['small.ecAddressManage', 'small.common'] })
export default class EcAddressManage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      regionLevel: 1, // 地址等级
      addressInfo: {}, // 当前父级地址
      rowKey: 'regionId',
      expandedKey: [],
    };
  }

  componentDidMount() {
    this.fetchCountryList();
    // this.fetchAllList();
    this.fetchEcAddressManageList();
  }

  /**
   * 查询国家
   */
  @Bind()
  fetchCountryList() {
    const { dispatch } = this.props;
    dispatch({
      type: 'ecAddressManage/fetchCountryList',
    });
  }

  /**
   * 查询所有地址
   */
  @Bind()
  fetchAllList() {
    const { dispatch } = this.props;
    return dispatch({
      type: 'ecAddressManage/fetchAllList',
      payload: { page: -1 },
    });
  }

  /**
   * 查询地址列表
   * @param {Object} params
   * @param {Object} item
   */
  @Bind()
  fetchEcAddressManageList(params = { page: {} }, item) {
    if (item) {
      this.setState({
        addressInfo: item,
        regionLevel: item.regionLevel + 1,
      });
    }
    const {
      addressInfo: { regionCode },
      regionLevel,
    } = this.state;
    const { dispatch } = this.props;
    return dispatch({
      type: 'ecAddressManage/fetchAddressList',
      payload: regionLevel === 1 || item?.countryFlag ? { ...params } : { regionCode, ...params },
    });
  }

  /**
   * 查询父级地址
   */
  @Bind()
  fetchParentAddress() {
    const {
      addressInfo: { countryId, parentRegionCode },
      regionLevel,
    } = this.state;
    const { dispatch } = this.props;
    if (regionLevel !== 1) {
      dispatch({
        type: 'ecAddressManage/fetchParent',
        payload: { regionCode: parentRegionCode },
      }).then((res) => {
        this.setState(
          {
            addressInfo: res,
          },
          () => this.fetchEcAddressManageList()
        );
      });
    } else {
      this.fetchEcAddressManageList({ countryId });
    }
  }

  /**
   * 查看/新建下级
   * @param {Object} record - 行数据
   * @param {Number} isCreate - 是否新建
   */
  @Bind()
  nextToLevel(record, isCreate, e) {
    if (e) {
      e.stopPropagation();
    }
    this.setState(
      {
        regionLevel: this.state.regionLevel + 1,
        addressInfo: record,
      },
      () => {
        this.fetchEcAddressManageList().then(() => {
          if (isCreate) {
            this.handleAddAddress();
          }
        });
      }
    );
  }

  /**
   * 返回上一级
   */
  @Bind()
  backToLevel() {
    const {
      expandedKey,
      addressInfo: { regionCode },
    } = this.state;
    this.setState(
      {
        regionLevel: this.state.regionLevel - 1,
        expandedKey: expandedKey.filter((i) => i !== regionCode),
      },
      () => this.fetchParentAddress()
    );
  }

  /**
   * 新建地址
   */
  @Bind()
  handleAddAddress() {
    const {
      dispatch,
      ecAddressManage: { addressList = [], addressPagination = {} },
    } = this.props;
    dispatch({
      type: 'ecAddressManage/updateState',
      payload: {
        addressList: [
          {
            regionId: uuid(),
            enabledFlag: 1,
            _status: 'create',
          },
          ...addressList,
        ],
        addressPagination: addItemToPagination(addressList.length, addressPagination),
      },
    });
  }

  /**
   * 编辑地址
   * @param {Object} record - 地址行数据
   */
  @Bind()
  handleEdit(e, record) {
    e.stopPropagation();
    const {
      dispatch,
      ecAddressManage: { addressList = [] },
    } = this.props;
    const { rowKey } = this.state;
    const newDataList = addressList.map((item) =>
      record[rowKey] === item[rowKey] ? { ...item, _status: 'update' } : item
    );
    dispatch({
      type: 'ecAddressManage/updateState',
      payload: { addressList: newDataList },
    });
  }

  /**
   * 删除
   * @param {Object} record - 地址行数据
   */
  @Bind()
  handleDelete(e, record) {
    e.stopPropagation();
    const {
      dispatch,
      ecAddressManage: { addressList = [], addressPagination },
    } = this.props;
    const { rowKey } = this.state;
    const newDataList = addressList.filter((item) => item[rowKey] !== record[rowKey]);
    dispatch({
      type: 'ecAddressManage/updateState',
      payload: {
        addressList: newDataList,
        addressPagination: delItemToPagination(addressList.length, addressPagination),
      },
    });
  }

  /**
   * 取消编辑
   * @param {Object} record - 地址行数据
   */
  @Bind()
  handleCancel(e, record) {
    e.stopPropagation();
    const {
      dispatch,
      ecAddressManage: { addressList = [] },
    } = this.props;
    const { rowKey } = this.state;
    const newDataList = addressList.map((item) => {
      if (item[rowKey] === record[rowKey]) {
        const { _status, ...other } = item;
        return other;
      } else {
        return item;
      }
    });
    dispatch({
      type: 'ecAddressManage/updateState',
      payload: { addressList: newDataList },
    });
  }

  /**
   * 保存
   */
  @Bind()
  handleSave() {
    const {
      dispatch,
      ecAddressManage: { addressList = [], addressPagination = {} },
    } = this.props;
    const {
      regionLevel,
      addressInfo: { countryId, regionCode },
    } = this.state;
    const createData = getEditTableData(
      addressList.filter((a) => a._status === 'create'),
      ['regionId']
    ).map((i) => {
      return {
        ...i,
        regionLevel,
        countryId,
        parentRegionCode: regionLevel === 1 ? null : regionCode, // 一级地址无父级
      };
    });
    const updateData = getEditTableData(
      addressList.filter((a) => a._status === 'update'),
      ['regionId']
    );
    const arr = [];
    if (!isEmpty(createData)) {
      arr.push(
        dispatch({
          type: 'ecAddressManage/saveAddress',
          payload: createData,
        })
      );
    }
    if (!isEmpty(updateData)) {
      arr.push(
        dispatch({
          type: 'ecAddressManage/updateAddress',
          payload: updateData,
        })
      );
    }
    if (arr.length > 0) {
      Promise.all(arr).then((res) => {
        if (res) {
          notification.success();
          this.fetchEcAddressManageList({ ...addressPagination, countryId });
        }
      });
    }
  }

  /**
   * 启用/禁用地址
   */
  @Bind()
  handleDisable(e, record) {
    e.stopPropagation();
    if (record.enabledFlag === 0) {
      Modal.confirm({
        title: intl.get('small.ecAddressManage.view.confirm.enabledTitle').d('确认启用地址?'),
        content: intl
          .get('small.ecAddressManage.view.confirm.enabledContent')
          .d('启用该地址，则启用该地址及其所有下级地址'),
        onOk: () => {
          this.setPermissionSetEnable(record);
        },
      });
    } else {
      Modal.confirm({
        title: intl.get('small.ecAddressManage.view.confirm.disabledTitle').d('确认禁用地址?'),
        content: intl
          .get('small.ecAddressManage.view.confirm.disabledContent')
          .d('禁用该地址，将禁用该地址及其所有下级地址'),
        onOk: () => {
          this.setPermissionSetEnable(record);
        },
      });
    }
  }

  /**
   * 启用禁用接口
   */
  @Bind()
  setPermissionSetEnable(record) {
    const { dispatch } = this.props;
    const {
      addressInfo: { countryId },
    } = this.state;
    dispatch({
      type: 'ecAddressManage/setPermissionSetEnable',
      payload: {
        regionId: record.regionId,
        status: !record.enabledFlag,
      },
    }).then((res) => {
      if (res) {
        this.fetchEcAddressManageList({ countryId });
      }
    });
  }

  /**
   * 商品-表格内容改变
   */
  @Bind()
  changeTableData() {
    const {
      dispatch,
      ecAddressManage: { addrLineChange = false },
    } = this.props;
    if (!addrLineChange) {
      dispatch({
        type: 'ecAddressManage/updateState',
        payload: {
          addrLineChange: true,
        },
      });
    }
  }

  /**
   * 行内编辑表格change事件
   * @param {分页} page
   */
  @Bind()
  handleTableChange(page = {}) {
    const {
      dispatch,
      ecAddressManage: { addrLineChange = false },
    } = this.props;
    const {
      addressInfo: { countryId },
    } = this.state;
    if (addrLineChange) {
      Modal.confirm({
        title: intl
          .get(`small.ecAddressManage.view.saveFirstBeforeChange`)
          .d('切换分页前请先保存数据！'),
        onOk: () => {
          this.setState({});
        },
        onCancel: () => {
          this.fetchEcAddressManageList({ page, countryId });
          dispatch({
            type: 'ecAddressManage/updateState',
            payload: {
              addrLineChange: false,
            },
          });
        },
      });
    } else {
      this.fetchEcAddressManageList({ page, countryId });
    }
  }

  /**
   * 表格行事件
   * @param {Object} record - 行数据
   */
  @Bind()
  onRow(record) {
    if (!record.isLeaf && !record._status) {
      return {
        onClick: () => {
          this.nextToLevel(record, 0);
          const keyList = new Set([...this.state.expandedKey, record.regionCode]);
          this.setState({
            expandedKey: Array.from(keyList),
          });
        },
        className: 'address-row-handle',
      };
    } else {
      return {
        className: 'address-row',
      };
    }
  }

  /**
   * 地址导航栏展开收起
   * @param {Array} key = 展开的key
   */
  @Bind()
  onSelectChange(key) {
    this.setState({ expandedKey: key });
  }

  render() {
    const {
      ecAddressManage: { addressList, allList, addressPagination = {} },
      loading,
      saveLoading,
    } = this.props;
    const { regionLevel, addressInfo, expandedKey } = this.state;
    const isAddressSave =
      addressList && addressList.filter((i) => i._status === 'create' || i._status === 'update');
    const columns = [
      {
        title: intl.get(`small.ecAddressManage.model.EC.regionCode`).d('地址编码'),
        width: 120,
        align: 'center',
        dataIndex: 'regionCode',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`regionCode`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`small.ecAddressManage.model.EC.regionCode`).d('地址编码'),
                    }),
                  },
                ],
                initialValue: record.regionCode,
              })(<Input />)}
            </FormItem>
          ) : (
            <div style={!record.isLeaf ? { color: '#29BECE' } : {}}>{val}</div>
          ),
      },
      {
        title: intl.get(`small.ecAddressManage.model.EC.regionName`).d('地址名称'),
        dataIndex: 'regionName',
        width: 200,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`regionName`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`small.ecAddressManage.model.EC.regionName`).d('地址名称'),
                    }),
                  },
                ],
                initialValue: record.regionName,
              })(
                <TLEditor
                  label={intl.get(`small.ecAddressManage.model.EC.regionName`).d('地址名称')}
                  field="regionName"
                  token={record._token}
                />
              )}
            </FormItem>
          ) : (
            <div style={!record.isLeaf ? { color: '#29BECE' } : {}}>{val}</div>
          ),
      },
      {
        title: intl.get(`small.ecAddressManage.model.EC.regionLevel`).d('区域等级'),
        width: 75,
        align: 'center',
        dataIndex: 'regionLevel',
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        width: 75,
        align: 'center',
        dataIndex: 'enabledFlag',
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('enabledFlag', {
                initialValue: val,
              })(<Checkbox checkedValue={1} />)}
            </Form.Item>
          ) : (
            enableRender(val)
          ),
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'operator',
        width: 180,
        align: 'center',
        render: (_, record) => {
          const { _status } = record;
          const isEdit = ['update', 'create'].includes(_status);
          return (
            <span className="action-link">
              <a disabled={isEdit} onClick={(e) => this.handleDisable(e, record)}>
                {record.enabledFlag
                  ? intl.get('hzero.common.status.disable').d('禁用')
                  : intl.get('hzero.common.status.enable').d('启用')}
              </a>
              <a
                disabled={regionLevel === 4 || isEdit}
                onClick={(e) => this.nextToLevel(record, 1, e)}
              >
                {intl.get(`small.ecAddressManage.model.EC.createNext`).d('新建下级')}
              </a>
              {_status === 'create' ? (
                <a onClick={(e) => this.handleDelete(e, record)}>
                  {intl.get('hzero.common.button.clean').d('清除')}
                </a>
              ) : _status === 'update' ? (
                <a onClick={(e) => this.handleCancel(e, record)}>
                  {intl.get('hzero.common.button.cancel').d('取消')}
                </a>
              ) : (
                <a onClick={(e) => this.handleEdit(e, record)}>
                  {intl.get('hzero.common.button.edit').d('编辑')}
                </a>
              )}
            </span>
          );
        },
      },
    ];

    return (
      <React.Fragment>
        <Header title={intl.get(`small.ecAddressManage.EC.address.management`).d('电商地址管理')} />
        <Content>
          <div className={styles['address-container']}>
            <div className="address-navigation">
              <p className="address-nav-title">
                {intl.get(`small.ecAddressManage.view.EC.address.navigation`).d('地址导航')}
              </p>
              <div className="address-tree">
                <TreeList
                  allList={allList}
                  setKey={(key) => {
                    this.setState({
                      expandedKey: [...this.state.expandedKey, ...key],
                    });
                  }}
                  fetchList={this.fetchEcAddressManageList}
                  expandedKey={expandedKey}
                  selectedKey={[addressInfo.regionCode]}
                  onSelectChange={this.onSelectChange}
                  regionLevel={regionLevel}
                />
              </div>
            </div>
            <div className="address-table">
              <div className="table-header">
                {regionLevel === 1 ? (
                  <span className="table-title">
                    {intl.get(`small.ecAddressManage.view.EC.allAddress`).d('全部地址')}
                  </span>
                ) : (
                  <span className="table-title table-back" onClick={this.backToLevel}>
                    <Icon type="rollback" style={{ marginRight: '10px' }} />
                    {addressInfo.regionName}
                  </span>
                )}
                <div className="table-btn">
                  <Button
                    icon="save"
                    type="primary"
                    loading={saveLoading}
                    disabled={isEmpty(isAddressSave)}
                    onClick={this.handleSave}
                  >
                    {intl.get('hzero.common.button.save').d('保存')}
                  </Button>
                  <Button icon="plus" onClick={this.handleAddAddress}>
                    {intl.get('hzero.common.button.create').d('新建')}
                  </Button>
                </div>
              </div>
              <EditTable
                bordered
                loading={loading}
                rowKey="regionId"
                dataSource={addressList}
                columns={columns}
                pagination={addressPagination}
                onRow={(record) => this.onRow(record)}
                onChange={this.handleTableChange}
                onDataChange={this.changeTableData}
              />
            </div>
          </div>
        </Content>
      </React.Fragment>
    );
  }
}
