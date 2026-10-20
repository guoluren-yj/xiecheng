/**
 * PurchaseInform - 地点层信息
 * @date: 2019-12-13
 * @author: WXM <xiaomin.wang01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import qs from 'querystring';
import { connect } from 'dva';
import { Bind, Debounce } from 'lodash-decorators';
import React, { Component, Fragment } from 'react';
import { Input, Form, Button, Modal } from 'hzero-ui';
import { isNumber, sum, isEmpty } from 'lodash';

import uuidv4 from 'uuid/v4';
import intl from 'utils/intl';
import Lov from 'components/Lov';
import Checkbox from 'components/Checkbox';
import EditTable from 'components/EditTable';
import notification from 'utils/notification';
import { yesOrNoRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  getEditTableData,
  getCurrentOrganizationId,
  addItemToPagination,
  delItemToPagination,
} from 'utils/utils';

import styles from '@/routes/index.less';
import GlobalPhone from '@/routes/components/GlobalPhone';
import { formatInternationalTel } from '@/routes/components/utils';
import OUMessage from './OUMessage/index';

@connect(({ supplierInform, loading }) => ({
  supplierInform,
  operateLoading:
    loading.effects[`supplierInform/queryLocationInform`] ||
    loading.effects['supplierInform/saveLocationInform'],
}))
@Form.create({ fieldNameProp: null })
@formatterCollections({
  code: ['sslm.commonApplication', 'sslm.supplierInform'],
})
export default class LocationInform extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      displayName: undefined,
      modalRecord: {},
      isRefresh: false,
    };
  }

  componentDidMount() {
    const { onRef } = this.props;
    if (onRef) onRef(this);
    this.queryCode();
    this.handleLocationInform();
  }

  /**
   * 查询地点层信息
   */
  @Bind()
  handleLocationInform(page = {}) {
    const { dispatch, changeReqId } = this.props;
    dispatch({
      type: 'supplierInform/queryLocationInform',
      payload: {
        page,
        changeReqId,
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
      billPeriodMap: 'SSLM.EBS_OU_BILL_PERIOD', // 账期值集
      tenantId: getCurrentOrganizationId(),
    };
    dispatch({
      type: 'supplierInform/init',
      payload: lovCodes,
    });
  }

  // 监测数据是否变化
  @Bind()
  checkData() {
    const {
      supplierInform: { locationList = [] },
    } = this.props;
    const payloadData = getEditTableData(locationList, ['_status', 'supChangeAddId']);
    const isEdit = !!locationList.find(n => n._status === 'create' || n._status === 'update');
    if (isEdit) {
      if (!isEmpty(payloadData)) {
        return payloadData;
      } else {
        notification.warning({
          message: intl.get('sslm.common.view.message.locationRequiredMsg').d('地点层信息填写有误'),
        });
        return false;
      }
    } else {
      return [];
    }
  }

  /**
   * 批量保存数据
   */
  @Bind()
  handleSave() {
    const { dispatch } = this.props;
    const payload = this.checkData();
    if (!isEmpty(payload)) {
      dispatch({
        type: 'supplierInform/saveLocationInform',
        payload,
      }).then(res => {
        if (res) {
          notification.success();
          this.handleLocationInform();
        }
      });
    }
  }

  /**
   * 新建
   */
  @Bind()
  handleAdd() {
    const {
      dispatch,
      changeReqId,
      supplierInform: { locationList = [], locationPagination },
    } = this.props;
    dispatch({
      type: 'supplierInform/updateState',
      payload: {
        locationList: [
          {
            _status: 'create',
            supChangeAddId: uuidv4(),
            changeReqId,
            enabledFlag: 1,
          },
          ...locationList,
        ],
        locationPagination: addItemToPagination(locationList.length, locationPagination),
      },
    });
  }

  /**
   * 清除
   */
  @Bind()
  handleDeleteRow(record) {
    const {
      dispatch,
      supplierInform: { locationList = [], locationPagination },
    } = this.props;
    const newCompanyFinanceList = locationList.filter(
      n => n.supChangeAddId !== record.supChangeAddId
    );
    dispatch({
      type: 'supplierInform/updateState',
      payload: {
        locationList: newCompanyFinanceList,
        locationPagination: delItemToPagination(locationList.length, locationPagination),
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
      supplierInform: { locationList = [] },
      dispatch,
    } = this.props;
    const newFinanceList = locationList.map(item =>
      record.supChangeAddId === item.supChangeAddId ? { ...item, _status: 'update' } : item
    );
    dispatch({
      type: 'supplierInform/updateState',
      payload: { locationList: newFinanceList },
    });
  }

  /**
   * 取消编辑行
   * @param {object} record 行数据
   */
  @Bind()
  handleCancelRow(record) {
    const {
      supplierInform: { locationList = [] },
      dispatch,
    } = this.props;
    const newLocationList = locationList.map(item => {
      if (item.supChangeAddId === record.supChangeAddId) {
        const { _status, ...other } = item;
        return other;
      } else {
        return item;
      }
    });
    dispatch({
      type: 'supplierInform/updateState',
      payload: { locationList: newLocationList },
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
      supplierInform: { locationPagination = {} },
    } = this.props;
    const { visible, isRefresh } = this.state;
    this.setState({ visible: !visible, isRefresh: refresh }, () => {
      if (displayName) this.setState({ displayName, modalRecord: record });
      // 可修改modal隐藏时刷新页面
      if (visible && isRefresh) this.handleLocationInform(locationPagination);
    });
  }

  /**
   * 跳转至OU详情页面
   */
  @Bind()
  ondirectOUMessage() {
    const { history, changeReqId, companyId } = this.props;
    history.push(
      `/sslm/supplier-inform-change/ou-message?${qs.stringify({
        changeReqId,
        companyId,
      })}`
    );
  }

  /**
   * 跳转至OU详情
   */

  render() {
    const { displayName, modalRecord, visible } = this.state;
    const {
      pubEdit,
      supplierInform: {
        locationList = [],
        detailHeader = {},
        locationPagination,
        // applicationStatus = []
      },
      changFlag,
      operateLoading,
      changeReqId,
      savePermissionFlag = true,
    } = this.props;
    const {
      tenantId,
      companyId,
      spfmCompanyId,
      supplierCompanyId,
      spfmSupplierCompanyId,
      supplierTenantId,
    } = detailHeader;
    const newModalData = {
      changFlag,
      changeReqId,
      companyId,
      pubEdit,
      supplierCompanyId,
      spfmSupplierCompanyId,
      tenantId,
      spfmCompanyId,
      supplierTenantId,
      savePermissionFlag,
    };

    const disabled = changFlag || !savePermissionFlag;

    const columns = [
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.countryName').d('国家'),
        width: 150,
        align: 'left',
        dataIndex: 'countryName',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator, setFieldsValue } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('countryCode', { initialValue: record.countryCode })}
                {getFieldDecorator('countryId', {
                  initialValue: record.countryId,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`sslm.supplierInform.model.supplierInform.countryName`)
                          .d('国家'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    code="HPFM.COUNTRY"
                    disabled={disabled}
                    lovOptions={{ displayField: 'countryName', valueField: 'countryId' }}
                    textValue={record.countryName}
                    onChange={(_, lovRecord) => {
                      setFieldsValue({
                        countryCode: lovRecord.countryCode,
                        countryName: undefined,
                        regionId: undefined,
                        cityId: undefined,
                      });
                    }}
                    onClear
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
        title: intl.get('sslm.supplierInform.model.supplierInform.regionIds').d('地区'),
        width: 150,
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
                        name: intl
                          .get(`sslm.supplierInform.model.supplierInform.regionIds`)
                          .d('地区'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    code="HPFM.REGION"
                    disabled={disabled || record.$form.getFieldValue('countryCode') !== 'CN'}
                    lovOptions={{
                      displayField: 'regionName',
                      valueField: 'regionId',
                    }}
                    queryParams={{
                      countryId: record.$form.getFieldValue('countryId'),
                    }}
                    textValue={val}
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
        title: intl.get('sslm.supplierInform.model.supplierInform.city').d('城市'),
        width: 150,
        dataIndex: 'city',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('cityId', {
                  initialValue: record.cityId,
                  rules: [
                    {
                      required: record.$form.getFieldValue('countryCode') === 'CN',
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`sslm.supplierInform.model.supplierInform.city`).d('城市'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    disabled={disabled || !record.$form.getFieldValue('regionId')}
                    code="HPFM.REGION"
                    textValue={val}
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
        title: intl.get('sslm.supplierInform.model.supplierInform.addressDetail').d('详细地址'),
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
                        name: intl
                          .get(`sslm.supplierInform.model.supplierInform.addressDetail`)
                          .d('详细地址'),
                      }),
                    },
                  ],
                })(<Input disabled={disabled} />)}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl
          .get('sslm.supplierInform.model.supplierInform.supplierLocation')
          .d('供应商地点'),
        width: 140,
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
                          .get(`sslm.supplierInform.model.supplierInform.supplierLocation`)
                          .d('供应商地点'),
                      }),
                    },
                  ],
                })(
                  // <Select allowClear style={{ width: 100 }}>
                  //   {applicationStatus.map(item => (
                  //     <Select.Option key={item.value} value={item.value}>
                  //       {item.meaning}
                  //     </Select.Option>
                  //   ))}
                  // </Select>
                  <Input disabled={disabled} />
                )}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.contacts').d('联系人'),
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
                        name: intl
                          .get(`sslm.supplierInform.model.supplierInform.contacts`)
                          .d('联系人'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    code="SSLM.SUPPLIER_CONTACTS"
                    queryParams={{
                      companyId,
                      partnerCompanyId: supplierCompanyId,
                      partnerTenantId: supplierTenantId,
                      spfmPartnerCompanyId: spfmSupplierCompanyId,
                      tenantId,
                      spfmCompanyId,
                      enableFlag: 1,
                    }}
                    onChange={(_, lovRecord) => {
                      record.$form.setFieldsValue({
                        mobilephone: lovRecord.mobilephone,
                        internationalTelCode: lovRecord.internationalTelCode,
                      });
                    }}
                    disabled={disabled}
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
        title: intl.get('sslm.supplierInform.model.supplierInform.contactsMethod').d('联系方式'),
        width: 300,
        dataIndex: 'mobilephone',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('mobilephone', {
                  initialValue: val,
                })(
                  <GlobalPhone
                    disabled
                    form={record.$form}
                    initialValue={record.internationalTelCode}
                    phoneField="mobilephone"
                    telCodeField="internationalTelCode"
                  />
                )}
              </Form.Item>
            );
          } else {
            return formatInternationalTel(record.internationalTelMeaning, val);
          }
        },
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.OUMessage').d('OU层信息'),
        width: 100,
        dataIndex: 'ouMessage',
        render: (val, record) => {
          if (!['update', 'create'].includes(record._status)) {
            return (
              <a
                onClick={() => {
                  this.handleModalDisplay('OUMessageList', record, true);
                }}
              >
                {intl.get(`sslm.supplierInform.model.supplierInform.OUMessage`).d('OU层信息')}
              </a>
            );
          } else {
            return (
              <a style={{ color: 'gray' }}>
                {intl.get(`sslm.supplierInform.model.supplierInform.OUMessage`).d('OU层信息')}
              </a>
            );
          }
        },
      },
      {
        title: intl.get('hzero.common.status.enable').d('启用'),
        dataIndex: 'enabledFlag',
        width: 100,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('enabledFlag', {
                  initialValue: val,
                })(<Checkbox disabled={disabled} />)}
              </Form.Item>
            );
          } else {
            return yesOrNoRender(val);
          }
        },
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 100,
        dataIndex: 'edit',
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
                disabled={pubEdit ? !pubEdit : disabled}
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
    const scrollX = sum(columns.map(n => (isNumber(n.width) ? n.width : 150)));

    return (
      <Fragment>
        <div className={styles['table-list-btn']}>
          <Button
            onClick={this.handleSave}
            loading={operateLoading}
            style={{
              display: disabled ? 'none' : 'inline-block',
            }}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button
            type="primary"
            onClick={this.handleAdd}
            loading={operateLoading}
            style={{ display: disabled ? 'none' : 'inline-block' }}
          >
            {intl.get(`hzero.common.button.create`).d('新建')}
          </Button>
        </div>
        <EditTable
          bordered
          columns={columns}
          rowKey="supChangeAddId"
          dataSource={locationList}
          scroll={{ x: scrollX }}
          loading={operateLoading}
          pagination={locationPagination}
          onChange={this.handleLocationInform}
        />
        <Modal
          width={1000}
          footer={null}
          visible={visible}
          onCancel={this.handleModalDisplay}
          title={intl.get('sslm.supplierInform.model.supplierInform.OUMessage').d('OU层信息')}
        >
          {displayName === 'OUMessageList' && (
            <OUMessage modalRecord={modalRecord} newModalData={newModalData} />
          )}
        </Modal>
      </Fragment>
    );
  }
}
