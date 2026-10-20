/**
 * PurchaseInform - 采购/财务信息
 * @date: 2019-12-11
 * @author: WXM <xiaomin.wang01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import qs from 'querystring';
import { connect } from 'dva';
import React, { Component, Fragment } from 'react';
import { Bind, Debounce } from 'lodash-decorators';
import { isNumber, sum, isEmpty } from 'lodash';
import { Input, Form, Button, Modal } from 'hzero-ui';

import uuidv4 from 'uuid/v4';
import intl from 'utils/intl';
import Lov from 'components/Lov';
import Checkbox from 'components/Checkbox';
import EditTable from 'components/EditTable';
import notification from 'utils/notification';
import { yesOrNoRender } from 'utils/renderer';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  getEditTableData,
  addItemToPagination,
  delItemToPagination,
  getCurrentOrganizationId,
} from 'utils/utils';
import { Button as PermissionButton } from 'components/Permission';

import OUMessageList from '../ImportErp/Tables/OUMessageList';

@connect(({ importErp, loading }) => ({
  importErp,
  queryLoading: loading.effects[`importErp/querySuLocationInfo`],
}))
@formatterCollections({
  code: ['spfm.importErp'],
})
@Form.create({ fieldNameProp: null })
export default class SupplyCapacityInform extends Component {
  constructor(props) {
    super(props);
    const routerParam = qs.parse(props.history.location.search.substr(1));
    const {
      companyId,
      partnerCompanyId,
      partnerTenantId,
      spfmPartnerCompanyId,
      tenantId,
      spfmCompanyId,
      supplierSyncEbsId,
      syncStatus,
    } = routerParam;
    const isDisabled = syncStatus === 'PENDING';
    this.state = {
      visible: false,
      displayName: undefined,
      modalRecord: {},
      isRefresh: false,
      companyId,
      partnerCompanyId,
      partnerTenantId,
      spfmPartnerCompanyId,
      tenantId,
      spfmCompanyId,
      supplierSyncEbsId,
      isDisabled,
      selectedRowKeys: [],
      selectedRows: [],
    };
  }

  componentDidMount() {
    const { onRef } = this.props;
    if (onRef) onRef(this);
    this.handleSupplierLocation();
    this.queryCode();
  }

  /**
   * 查询供应商地址信息
   */
  @Bind()
  handleSupplierLocation() {
    const { dispatch } = this.props;
    const { supplierSyncEbsId } = this.state;
    dispatch({
      type: 'importErp/querySuLocationInfo',
      payload: {
        supplierSyncEbsId,
      },
    });
  }

  /**
   * 供应商地址值集查询
   */
  @Bind()
  queryCode() {
    const { dispatch } = this.props;
    const lovCodes = {
      applicationStatus: 'SSLM_SUPPLIER_SITE',
      tenantId: getCurrentOrganizationId(),
    };
    dispatch({
      type: 'importErp/queryCode',
      payload: lovCodes,
    });
  }

  /**
   * 新建
   */
  @Bind()
  handleCreateRow() {
    const {
      dispatch,
      importErp: { supplierLoData = [], supplierLoPagination = {} },
    } = this.props;
    const { supplierSyncEbsId } = this.state;
    dispatch({
      type: 'importErp/updateState',
      payload: {
        supplierLoData: [
          {
            supplierSyncEbsId,
            supplierSyncEbsAddrId: uuidv4(),
            enabledFlag: 1,
            tenantId: getCurrentOrganizationId(),
            _status: 'create', // 新建标记位
          },
          ...supplierLoData,
        ],
        supplierLoPagination: addItemToPagination(supplierLoData.length, supplierLoPagination),
      },
    });
  }

  /**
   * 批量保存数据
   */
  @Bind()
  handleSave() {
    const {
      dispatch,
      importErp: { supplierLoData = [] },
    } = this.props;
    const newSupplierLoData = getEditTableData(supplierLoData, [
      '_status',
      'supplierSyncEbsAddrId',
    ]);
    if (isEmpty(newSupplierLoData)) return;
    dispatch({
      type: 'importErp/saveSuLocationInfo',
      payload: newSupplierLoData,
    }).then(res => {
      if (res) {
        notification.success();
        this.handleSupplierLocation();
      }
    });
  }

  /**
   * 取消编辑行
   * @param {object} record 行数据
   */
  @Bind()
  handleCancelRow(record) {
    const {
      importErp: { supplierLoData = [] },
      dispatch,
    } = this.props;
    const newFinanceList = supplierLoData.map(item => {
      if (item.supplierSyncEbsAddrId === record.supplierSyncEbsAddrId) {
        const { _status, ...other } = item;
        return other;
      } else {
        return item;
      }
    });
    dispatch({
      type: 'importErp/updateState',
      payload: { supplierLoData: newFinanceList },
    });
  }

  /**
   * 删除新建的行
   * @param {object} record
   */
  @Bind()
  handleDeleteRow(record) {
    const {
      dispatch,
      importErp: { supplierLoData = [], supplierLoPagination = {} },
    } = this.props;
    const newFinanceList = supplierLoData.filter(
      item => item.supplierSyncEbsAddrId !== record.supplierSyncEbsAddrId
    );
    dispatch({
      type: 'importErp/updateState',
      payload: {
        supplierLoData: newFinanceList,
        supplierLoPagination: delItemToPagination(supplierLoData.length, supplierLoPagination),
      },
    });
  }

  /**
   * 批量编辑行
   * @param {object} record 每行数据
   */
  @Bind()
  handleEditRow(record) {
    const {
      importErp: { supplierLoData = [] },
      dispatch,
    } = this.props;
    const newFinanceList = supplierLoData.map(item =>
      record.supplierSyncEbsAddrId === item.supplierSyncEbsAddrId
        ? { ...item, _status: 'update' }
        : item
    );
    dispatch({
      type: 'importErp/updateState',
      payload: { supplierLoData: newFinanceList },
    });
  }

  /**
   * 控制 Modal显隐
   * @param {String} displayName 判断modal类型
   */
  @Bind()
  @Debounce(200)
  handleModalDisplay(displayName, record, refresh) {
    const {
      importErp: { supplierLoPagination = {} },
    } = this.props;
    const { visible, isRefresh } = this.state;
    this.setState({ visible: !visible, isRefresh: refresh }, () => {
      if (displayName) this.setState({ displayName, modalRecord: record });
      // 可修改modal隐藏时刷新页面
      if (visible && isRefresh) this.handleSupplierLocation(supplierLoPagination);
    });
  }

  /**
   * 勾选框处理函数
   * @param selectedRowKeys
   * @param selectedRows
   */
  @Bind()
  selectedRows(selectedRowKeys, selectedRows) {
    this.setState({
      selectedRowKeys,
      selectedRows,
    });
  }

  /**
   * 删除按钮处理逻辑
   */
  @Bind()
  @Debounce(200)
  handleDelete() {
    const { selectedRows, selectedRowKeys } = this.state;
    const createData = selectedRows.filter(item => item._status === 'create');
    if (createData.length) {
      notification.warning({
        message: intl.get('spfm.importErp.view.message.shouldSave').d('请先保存数据后再删除！'),
      });
      return false;
    }
    if (selectedRows.length) {
      Modal.confirm({
        title: intl.get('hzero.common.message.confirm.deleteChooseRecord').d('是否删除选中记录？'),
        okType: 'danger',
        onOk: () => {
          const { dispatch } = this.props;
          dispatch({
            type: 'importErp/deleteLine',
            payload: {
              supplierSyncEbsAddrId: selectedRowKeys,
            },
          }).then(res => {
            if (!(res && res.failed)) {
              notification.success();
            }
            this.setState({
              selectedRowKeys: [],
              selectedRows: [],
            });
            this.handleSupplierLocation();
          });
        },
      });
    } else {
      notification.warning({
        message: intl.get('hzero.common.notification.warning').d('请先勾选一条数据'),
      });
    }
  }

  render() {
    const {
      visible,
      displayName,
      modalRecord,
      companyId,
      partnerCompanyId,
      partnerTenantId,
      spfmPartnerCompanyId,
      tenantId,
      spfmCompanyId,
      supplierSyncEbsId,
      isDisabled,
      selectedRowKeys,
      selectedRows,
    } = this.state;

    const newModalData = {
      companyId,
      partnerCompanyId,
      partnerTenantId,
      spfmPartnerCompanyId,
      tenantId,
      spfmCompanyId,
      supplierSyncEbsId,
      isDisabled,
    };
    const {
      importErp: {
        supplierLoData = [],
        // applicationStatus = []
      },
      queryLoading,
    } = this.props;
    const isSave = supplierLoData.filter(o => o._status === 'create' || o._status === 'update');
    const param = qs.parse(location.search.substr(1));
    const deleteButtonFlag = param.syncStatus === 'PENDING' || param.syncStatus === 'SUCCESSED';
    const columns = [
      {
        title: intl.get('spfm.importErp.model.importErp.countryId').d('国家'),
        width: 150,
        dataIndex: 'countryName',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator, setFieldsValue } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('countryId', {
                  initialValue: record.countryId,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('spfm.importErp.model.importErp.countryId').d('国家'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    code="HPFM.COUNTRY"
                    lovOptions={{ displayField: 'countryName', valueField: 'countryId' }}
                    textValue={record.countryName}
                    onChange={(value, lovRecord) => {
                      setFieldsValue({
                        countryId: lovRecord.countryId,
                        countryCode: lovRecord.countryCode,
                        countryName: undefined,
                        regionId: undefined,
                        cityId: undefined,
                      });
                    }}
                  />
                )}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get('spfm.importErp.model.importErp.regionName').d('地区'),
        width: 120,
        dataIndex: 'regionName',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator, setFieldsValue } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('regionId', {
                  initialValue: record.regionId,
                  rules: [
                    {
                      required: record.$form.getFieldValue('countryCode') === 'CN',
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('spfm.importErp.model.importErp.regionName').d('地区'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    code="HPFM.REGION"
                    lovOptions={{
                      displayField: 'regionName',
                      valueField: 'regionId',
                    }}
                    disabled={record.$form.getFieldValue('countryCode') !== 'CN'}
                    textValue={val}
                    queryParams={{
                      countryId: record.$form.getFieldValue('countryId'),
                    }}
                    onChange={(value, lovRecord) => {
                      setFieldsValue({
                        regionCode: lovRecord.regionCode,
                        regionId: undefined,
                        cityId: undefined,
                      });
                    }}
                  />
                )}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get('spfm.importErp.model.importErp.cityName').d('城市'),
        width: 150,
        dataIndex: 'city',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('cityId', {
                  initialValue: record.regionId,
                  rules: [
                    {
                      required: record.$form.getFieldValue('countryCode') === 'CN',
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('spfm.importErp.model.importErp.cityName').d('城市'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    code="HPFM.REGION"
                    textValue={val}
                    disabled={
                      !record.$form.getFieldValue('countryId') ||
                      !record.$form.getFieldValue('regionId')
                    }
                    queryParams={{
                      parentRegionId: record.$form.getFieldValue('regionId'),
                    }}
                  />
                )}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get('spfm.importErp.model.importErp.address').d('详细地址'),
        width: 150,
        dataIndex: 'address',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('address', {
                  initialValue: val,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('spfm.importErp.model.importErp.address').d('详细地址'),
                      }),
                    },
                  ],
                })(<Input />)}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get('spfm.importErp.model.importErp.supplierLocation').d('供应商地点'),
        width: 200,
        dataIndex: 'supplierAddress',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('supplierAddress', {
                  initialValue: record.supplierAddress,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('spfm.importErp.model.importErp.supplierLocation')
                          .d('供应商地点'),
                      }),
                    },
                  ],
                })(
                  // <Select allowClear style={{ width: 120 }}>
                  //   {applicationStatus.map(item => (
                  //     <Select.Option key={item.value} value={item.value}>
                  //       {item.meaning}
                  //     </Select.Option>
                  //   ))}
                  // </Select>
                  <Input />
                )}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get('spfm.importErp.model.importErp.contacts').d('联系人'),
        width: 150,
        dataIndex: 'name',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('name', {
                  initialValue: record.name,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('spfm.importErp.model.importErp.contacts').d('联系人'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    code="SSLM.SUPPLIER_CONTACTS"
                    queryParams={{
                      companyId,
                      partnerCompanyId,
                      partnerTenantId,
                      spfmPartnerCompanyId,
                      tenantId,
                      spfmCompanyId,
                      enableFlag: 1,
                    }}
                    onChange={(_, lovRecord) => {
                      record.$form.setFieldsValue({
                        mobilephone: lovRecord.mobilephone,
                        mail: lovRecord.mail,
                      });
                    }}
                    textValue={val}
                    lovOptions={{
                      displayField: 'name',
                      valueField: 'name',
                    }}
                  />
                )}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get('spfm.importErp.model.importErp.contactsMethod').d('联系方式'),
        width: 150,
        dataIndex: 'mobilephone',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('mobilephone', {
                  initialValue: val,
                })(<Input disabled />)}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get('spfm.importErp.model.importErp.email').d('邮箱'),
        width: 150,
        dataIndex: 'mail',
        key: 'mail',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('mail', {
                  initialValue: val,
                })(<Input disabled />)}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get('spfm.importErp.model.importErp.OUMessage').d('OU层信息'),
        width: 100,
        dataIndex: 'OUMessage',
        render: (val, record) => {
          if (!['update', 'create'].includes(record._status)) {
            return (
              <a
                onClick={() => {
                  this.handleModalDisplay('OUMessageList', record, true);
                }}
              >
                {intl.get(`spfm.importErp.model.importErp.OUMessage`).d('OU层信息')}
              </a>
            );
          } else {
            return (
              <a style={{ color: 'gray' }}>
                {intl.get(`spfm.importErp.model.importErp.OUMessage`).d('OU层信息')}
              </a>
            );
          }
        },
      },
      {
        title: intl.get('hzero.common.status.enable').d('启用'),
        dataIndex: 'enabledFlag',
        width: 60,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('enabledFlag', {
                  initialValue: val,
                })(<Checkbox />)}
              </Form.Item>
            );
          } else {
            return yesOrNoRender(val);
          }
        },
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'edit',
        width: 75,
        render: (_, record) => (
          <span className="action-link">
            {record._status === 'create' ? (
              <a
                onClick={() => {
                  this.handleDeleteRow(record);
                }}
              >
                {intl.get('hzero.common.button.clean').d('清除')}
              </a>
            ) : record._status === 'update' ? (
              <a
                onClick={() => {
                  this.handleCancelRow(record);
                }}
              >
                {intl.get('hzero.common.button.cancel').d('取消')}
              </a>
            ) : (
              <a
                disabled={isDisabled}
                onClick={() => {
                  this.handleEditRow(record);
                }}
              >
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
            )}
          </span>
        ),
      },
    ];
    const scrollX = sum(columns.map(n => (isNumber(n.width) ? n.width : 0)));

    return (
      <Fragment>
        <Header
          backPath="/spfm/partner-list/import-erp"
          title={intl.get('spfm.importErp.view.button.supplierLocaiton').d('供应商地址')}
        >
          <Button icon="save" onClick={this.handleSave} type="primary" disabled={isEmpty(isSave)}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>

          <Button
            icon="plus"
            disabled={isDisabled}
            onClick={() => {
              this.handleCreateRow();
            }}
          >
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
          <PermissionButton
            icon="delete"
            onClick={this.handleDelete}
            disabled={deleteButtonFlag}
            permissionList={[
              {
                code: 'srm.partner.my-partner.my-partner.ps.button.ebs-add-delete',
                type: 'button',
                meaning: '供应商地址-删除',
              },
            ]}
          >
            {intl.get('hzero.common.button.delete').d('删除')}
          </PermissionButton>
        </Header>
        <Content>
          <EditTable
            bordered
            rowKey="supplierSyncEbsAddrId"
            columns={columns}
            dataSource={supplierLoData}
            scroll={{ x: scrollX }}
            loading={queryLoading}
            pagination={false}
            rowSelection={{
              selectedRowKeys,
              selectedRows,
              onChange: this.selectedRows,
            }}
          />
        </Content>
        <Modal width={1000} visible={visible} onCancel={this.handleModalDisplay} footer={null}>
          {displayName === 'OUMessageList' && (
            <OUMessageList modalRecord={modalRecord} newModalData={newModalData} />
          )}
        </Modal>
      </Fragment>
    );
  }
}
