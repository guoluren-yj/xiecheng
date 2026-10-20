/* eslint-disable no-unused-expressions */
/**
 * AddressInform - 地址信息
 * @date: 2019-10-31
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import { unionWith, isEmpty, last, isArray, isFunction } from 'lodash';
import { connect } from 'dva';
import uuidv4 from 'uuid/v4';
import { Bind } from 'lodash-decorators';
import React, { Component, Fragment } from 'react';
import { Input, Form, Button, Cascader, Icon } from 'hzero-ui';
import { getEditTableData, getResponse } from 'utils/utils';

import intl from 'utils/intl';
import Lov from 'components/Lov';
import Checkbox from 'components/Checkbox';
import EditTable from 'components/EditTable';
import TLEditor from 'components/TLEditor';
import notification from 'utils/notification';
import { yesOrNoRender } from 'utils/renderer';
import { fetchLovData } from '@/services/commonService';
import styles from './registlnform.less';

const FormItem = Form.Item;

@connect(({ enterpriseInform, loading }) => ({
  enterpriseInform,
  queryLoading: loading.effects[`enterpriseInform/queryPlatformAddress`],
  saveLoading:
    loading.effects[`enterpriseInform/saveAddressList`] ||
    loading.effects[`enterpriseInform/queryPlatformAddress`],
}))
@Form.create({ fieldNameProp: null })
export default class AddressInform extends Component {
  constructor(props) {
    super(props);
    const { supplierFlag = 1 } = props;
    this.defaultRowKey = supplierFlag === 0 ? 'comAddressReqId' : 'addressReqId';
  }

  state = {
    regionValue: {},
    cityData: [],
    record: {},
    selectedRowKeys: [], // 选中的rowKeys
    platformAddressList: [],
    addressData: {},
  };

  @Bind()
  handleQueryCityAddress(domesticFlag) {
    // 境内个人需默认带值中国
    let firstData = {};
    fetchLovData().then(lovData => {
      if (getResponse(lovData)) {
        if (lovData && isArray(lovData.content)) {
          const content = lovData.content[0] || {};
          firstData = {
            countryCode: content.countryCode,
            countryId: content.countryId,
            countryName: content.countryName,
          };
          // 新注册带出注册时的企业信息
          this.setState({ addressData: domesticFlag ? firstData : {} });
        }
      }
    });
  }

  componentDidMount() {
    const { onRef, domesticForeignRelation } = this.props;
    if (onRef) onRef(this);
    this.handlePlatformAddress();
    if (domesticForeignRelation) {
      this.handleQueryCityAddress(domesticForeignRelation);
    }
    // .then((res) => {
    //   if (res) {
    //     res.map((item) => this.ArrAdd(item[this.defaultRowKey], item.regionIds));
    //     const countryIdList = res.map((item) => item.countryId);
    //     countryIdList.forEach((countryId) => {
    //       dispatch({
    //         type: 'enterpriseInform/queryCity',
    //         payload: { countryId },
    //       }).then((cityResponse) => {
    //         dispatch({
    //           type: 'enterpriseInform/updateCityMap',
    //           payload: { countryId, cityResponse },
    //         });
    //       });
    //     });
    //   }
    // });
  }

  @Bind()
  ArrAdd(name, value) {
    const { regionValue } = this.state;
    regionValue[name] = value;
    this.setState({
      regionValue,
    });
  }

  @Bind()
  handleSelectChange(selectedRowKeys) {
    this.setState({ selectedRowKeys });
  }

  /**
   * 查询平台级地址信息
   */
  @Bind()
  handlePlatformAddress() {
    const {
      dispatch,
      changeReqId,
      companyId,
      supplierCompanyId,
      source = '',
      supplierFlag = 1,
      customizeUnitCode,
      customizeTenantId = null,
    } = this.props;
    return dispatch({
      type: 'enterpriseInform/queryPlatformAddress',
      payload: {
        changeReqId,
        companyId,
        supplierCompanyId,
        supplierFlag,
        customizeUnitCode,
        dataSource: source === 'enterprise' ? 1 : 2, // 1企业信息变更 2供应商信息变更
        customizeTenantId,
      },
    }).then(res => {
      if (res) {
        this.setState({ platformAddressList: res });
        res.map(item => this.ArrAdd(item[this.defaultRowKey], item.regionIds));
        return res;
      }
    });
  }

  /**
   * 新建
   */
  @Bind()
  handleAdd() {
    const { platformAddressList, addressData } = this.state;
    const { partnerTenantId = '-1', domesticForeignRelation } = this.props;
    const newLine =
      partnerTenantId !== '-1'
        ? {
            _status: 'create',
            [this.defaultRowKey]: uuidv4(),
            enabledFlag: 1,
            tenantId: partnerTenantId,
          }
        : { _status: 'create', [this.defaultRowKey]: uuidv4(), enabledFlag: 1 };
    const obj =
      domesticForeignRelation === 1
        ? {
            ...addressData,
          }
        : {};
    this.setState({
      platformAddressList: [{ ...newLine, ...obj }, ...platformAddressList],
    });
  }

  /**
   * 清除
   */
  @Bind()
  handleClean(record) {
    const { platformAddressList } = this.state;
    const newPlatformAddressList = platformAddressList.filter(
      n => n[this.defaultRowKey] !== record[this.defaultRowKey]
    );
    this.setState({ platformAddressList: newPlatformAddressList });
  }

  /**
   * 编辑/取消
   */
  @Bind()
  handleEdit(flag, record) {
    const { platformAddressList } = this.state;
    const newPlatformAddressList = platformAddressList.map(item => {
      if (item[this.defaultRowKey] === record[this.defaultRowKey]) {
        return { ...item, _status: flag ? 'update' : '' };
      } else {
        return item;
      }
    });
    this.setState({ platformAddressList: newPlatformAddressList });
  }

  /**
   * 返回城市列表map
   * @param {Number} countryId
   * @param {Object} cityResponse
   */
  @Bind()
  getNewDataMap(countryId, cityResponse) {
    const { dispatch } = this.props;
    dispatch({
      type: 'enterpriseInform/updateCityMap',
      payload: { countryId, cityResponse },
    });
  }

  @Bind()
  fetchProvinceCountry(value = {}, record) {
    const {
      dispatch,
      enterpriseInform: { addressList },
    } = this.props;
    const index = addressList.findIndex(
      item => item[this.defaultRowKey] === record[this.defaultRowKey]
    );
    const newAddressList = [
      ...addressList.slice(0, index),
      {
        ...addressList[index],
        countryId: value,
      },
      ...addressList.slice(index + 1),
    ];
    dispatch({
      type: 'enterpriseInform/updateState',
      payload: {
        addressList: newAddressList,
      },
    });
  }

  @Bind()
  handleCascader(record, disabledFlag = -1) {
    const { cityData = [] } = this.state;
    const countryId = record.$form.getFieldValue('countryId');
    return (
      <Cascader
        disabled={Number(disabledFlag) === 0}
        onClick={() => this.fetchProvinceCity(countryId)}
        changeOnSelect
        showSearch={false}
        style={{ width: '100%' }}
        placeholder=""
        fieldNames={{ label: 'regionName', value: 'regionId' }}
        options={cityData || []}
        onChange={(value, selectedOptions) =>
          this.handleSelectRegion(value, selectedOptions, record)
        }
        loadData={selectedOptions => this.handleQueryCity(selectedOptions)}
      >
        <Icon className={styles.registIcon} type="down" />
      </Cascader>
    );
  }

  /**
   *  查询地址列表
   */
  @Bind()
  fetchProvinceCity(value) {
    this.setState(
      {
        cityData: [],
      },
      () => {
        const { dispatch } = this.props;
        dispatch({
          type: 'enterpriseInform/queryDefaultCity',
          payload: { countryId: value },
        }).then(res => {
          this.setState({
            cityData: res,
          });
        });
      }
    );
  }

  /**
   * 选择地区拼接
   */
  @Bind()
  handleSelectRegion(value = [], selectedOptions = [], record) {
    const { regionValue } = this.state;
    const regionList = selectedOptions.map(region => {
      const { regionName } = region;
      return regionName;
    });
    const region = regionList.join('/');
    const lastRecord = last(selectedOptions);
    const { isLeaf } = lastRecord || {};
    record.$form.setFieldsValue({
      regionPathName: region,
      regionId: last(value),
      isLeaf,
    });
    this.setState({
      regionValue: {
        ...regionValue,
        [record[this.defaultRowKey]]: value,
      },
    });
  }

  /**
   * 地区级联下拉框动态加载数据
   */
  @Bind()
  handleQueryCity(selectedOptions) {
    const { dispatch } = this.props;
    const lastOption = selectedOptions[selectedOptions.length - 1] || [];
    const { countryId, regionId } = lastOption;
    lastOption.loading = true;
    dispatch({
      type: 'enterpriseInform/queryCitys',
      payload: { countryId, regionId },
    }).then(res => {
      if (res) {
        const { cityData } = this.state;
        lastOption.loading = false;
        // 是否是最后一级地区
        if (!isEmpty(res)) {
          lastOption.children = res;
        }
        this.setState({
          cityData: [...cityData],
        });
      }
    });
  }

  /**
   * 校验数据
   */
  @Bind()
  checkData() {
    const { regionValue, platformAddressList } = this.state;

    let arrListData = getEditTableData(platformAddressList);
    const isEditing = !!platformAddressList.find(
      d => d._status === 'create' || d._status === 'update'
    );
    if (isEditing && Array.isArray(arrListData) && arrListData.length === 0) {
      notification.warning({
        message: intl.get('sslm.common.view.message.addressRequiredMsg').d('地址信息填写有误'),
      });
      return;
    }
    const companyAddressList = unionWith(arrListData, platformAddressList, (value1, value2) => {
      return value1[this.defaultRowKey] === value2[this.defaultRowKey];
    });
    arrListData = arrListData.map(item => {
      const { ...newItem } = item;
      if (newItem._status === 'create') {
        delete newItem[this.defaultRowKey];
      }
      // if (isEmpty(newItem.postCode)) {
      //   newItem.postCode = null;
      // }
      // if (newItem.countryCode === 'CN') {
      if (!(newItem.regionId === '')) {
        if (!isEmpty(regionValue[item[this.defaultRowKey]])) {
          return { ...newItem, regionId: regionValue[item[this.defaultRowKey]].pop() };
        } else {
          return { ...newItem };
        }
      } else {
        return { ...newItem };
      }
    });
    if (companyAddressList.length > 0) {
      if (companyAddressList.find(item => item.enabledFlag)) {
        if (
          !(
            arrListData.length === 0 &&
            companyAddressList.find(item => item._status === 'create' || item._status === 'update')
          )
        ) {
          return arrListData;
        }
      } else {
        notification.warning({
          message: intl
            .get(`sslm.enterpriseInform.view.message.warn.mustAddressInfo`)
            .d('至少启用一条地址信息'),
        });
      }
    } else {
      return [];
    }
  }

  /**
   * 获取行内数据和状态树的合并
   * 然后判断合并数据的长度和是否修改数据
   * @memberof AddressInfo
   */
  @Bind()
  handleSave() {
    const {
      dispatch,
      companyId,
      changeReqId,
      customizeUnitCode,
      source = '',
      supplierFlag = 1,
    } = this.props;
    const comAddressReqs = this.checkData();
    if (comAddressReqs) {
      dispatch({
        type: 'enterpriseInform/saveAddressList',
        payload: {
          supplierFlag,
          companyId,
          changeReqId,
          customizeUnitCode,
          [supplierFlag === 0 ? 'comAddressReqs' : 'supAddressReqs']: comAddressReqs,
          dataSource: source === 'enterprise' ? 1 : 2, // 1企业信息变更 2供应商信息变更
        },
      }).then(data => {
        if (data) {
          notification.success();
          this.handlePlatformAddress();
        }
      });
    }
  }

  /**
   * 修改行，对查询的结果进行修改
   * @param {Obj} record
   * @memberof AddressInfo
   */
  @Bind()
  editRow(flag, record) {
    const { platformAddressList } = this.state;

    const newAddressList = platformAddressList.map(item => {
      const { ...newItem } = item;
      // if (!isArray(item.regionId)) {
      //   newItem.regionId = [newItem.regionId];
      // }
      if (item[this.defaultRowKey] === record[this.defaultRowKey]) {
        return { ...newItem, _status: flag ? 'update' : '' };
      } else {
        return newItem;
      }
    });
    this.setState({ platformAddressList: newAddressList });
  }

  /**
   * 解析个性化配置
   */
  @Bind()
  getCustConfig(custConfig = {}, customizeUnitCode) {
    const custConfigMap = {};
    const custConfigList = custConfig[customizeUnitCode]?.fields || [];
    custConfigList.forEach(element => {
      custConfigMap[element.fieldCode] = element;
    });
    return custConfigMap;
  }

  render() {
    const {
      pubEdit,
      queryLoading,
      changFlag,
      saveLoading,
      customizeTable = () => {},
      customizeUnitCode = '',
      savePermissionFlag = true,
      custConfig,
    } = this.props;
    const { platformAddressList } = this.state;
    // 获取省/市/区个性化配置
    const addressCustConfig = this.getCustConfig(custConfig, customizeUnitCode);
    const { regionPathName: { editable: regionPathNameEditable } = {} } = addressCustConfig;
    const columns = [
      {
        title: intl.get(`sslm.enterpriseInform.view.model.address.countryName`).d('国家'),
        dataIndex: 'countryId',
        width: 160,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            // 供应商改变，给相应的来源外部系统赋值
            const handleOnLovChange = (_, value) => {
              const { dispatch } = this.props;
              if (value.countryId) {
                dispatch({
                  type: 'enterpriseInform/queryCity',
                  payload: { countryId: value.countryId },
                }).then(cityResponse => {
                  this.getNewDataMap(value.countryId, cityResponse);
                });
              }
              record.$form.setFieldsValue({
                regionId: '',
                regionPathName: null,
                countryName: value?.countryName,
                countryCode: value?.countryCode,
                quickIndex: value?.quickIndex,
              });
              this.fetchProvinceCountry(value.countryId, record);
            };
            record?.$form?.getFieldDecorator('countryCode', {
              initialValue: record.countryCode,
            });
            record?.$form?.getFieldDecorator('quickIndex', {
              initialValue: record.quickIndex,
            });
            record?.$form?.getFieldDecorator('countryName', {
              initialValue: record.countryName,
            });
            return (
              <Form.Item>
                {record?.$form?.getFieldDecorator('countryId', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`sslm.enterpriseInform.view.message.address.countryName`)
                          .d('国家'),
                      }),
                    },
                  ],
                  initialValue: record.countryId,
                })(
                  <Lov
                    disabled={changFlag}
                    code="HPFM.COUNTRY"
                    onChange={handleOnLovChange}
                    textValue={record.countryName}
                    queryParams={{ enabledFlag: 1 }}
                  />
                )}
              </Form.Item>
            );
          } else {
            return record.countryName;
          }
        },
      },
      {
        title: intl.get(`sslm.enterpriseInform.view.model.address.regionPathName`).d('省/市/区'),
        dataIndex: 'regionPathName',
        width: 180,
        render: (val, record) => {
          return ['create', 'update'].includes(record._status) && !changFlag ? (
            <FormItem>
              {record.$form.getFieldDecorator('regionPathName', {
                initialValue: record.regionPathName,
                rules: [
                  {
                    validator: (_, value, cb) => {
                      const {
                        countryCode,
                        quickIndex,
                        isLeaf,
                        regionId,
                      } = record.$form.getFieldsValue();
                      if (countryCode === 'CN' || quickIndex === 'CN') {
                        if (regionId && !isLeaf) {
                          cb(
                            intl
                              .get('sslm.common.view.message.lastRegion')
                              .d('须选择填写至最末级地区')
                          );
                        } else {
                          cb();
                        }
                      }
                      cb();
                    },
                  },
                ],
              })(
                <Input
                  style={{
                    verticalAlign: 'middle',
                    position: 'relative',
                    top: '-1px',
                  }}
                  readOnly
                  disabled={changFlag || !record.$form.getFieldValue(`countryId`)}
                  addonAfter={this.handleCascader(record, regionPathNameEditable)}
                />
              )}
              {record.$form.getFieldDecorator('regionId', {
                initialValue: record.regionId,
              })}
              {record.$form.getFieldDecorator('isLeaf', {
                initialValue: true,
              })}
            </FormItem>
          ) : (
            record.regionPathName
          );
        },
      },
      {
        title: intl.get('sslm.enterpriseInform.view.model.address.businessAddress').d('经营地址'),
        dataIndex: 'addressDetail',
        width: 200,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record?.$form?.getFieldDecorator('addressDetail', {
                initialValue: val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('sslm.enterpriseInform.view.model.address.businessAddress')
                        .d('经营地址'),
                    }),
                  },
                ],
              })(
                <TLEditor
                  label={intl
                    .get('sslm.enterpriseInform.view.model.address.businessAddress')
                    .d('经营地址')}
                  field="addressDetail"
                  token={record._token}
                  disabled={changFlag}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get('sslm.enterpriseInform.view.model.address.postCode').d('邮政编码'),
        dataIndex: 'postCode',
        width: 100,
        render: (val, record) => {
          const { countryCode: itemCountryCode, quickIndex: itemQuickIndex } =
            record?.$form?.getFieldsValue() || {};
          return ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record?.$form?.getFieldDecorator('postCode', {
                initialValue: val,
                rules: [
                  {
                    required: false,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('sslm.enterpriseInform.view.model.address.postCode')
                        .d('邮政编码'),
                    }),
                  },
                  {
                    validator: (rule, value, callback) => {
                      const { countryCode, quickIndex } = record.$form.getFieldsValue();
                      if (countryCode === 'CN' || quickIndex === 'CN') {
                        const reg = /^[0-9]*$/;
                        if (value && !reg.test(value)) {
                          callback(
                            intl
                              .get(`hzero.c7nProUI.Validator.pattern_mismatch`)
                              .d('请输入有效的值')
                          );
                        } else if (value && value.length !== 6) {
                          callback(
                            intl
                              .get(`sslm.common.view.validate.atLeastSixNumber`)
                              .d('请输入6位数字')
                          );
                        }
                      }
                      // Note: 必须总是返回一个 callback，否则 validateFieldsAndScroll 无法响应
                      callback();
                    },
                  },
                ],
              })(
                <Input
                  disabled={changFlag}
                  inputChinese={false}
                  onChange={e => {
                    if (itemCountryCode === 'CN' || itemQuickIndex === 'CN') {
                      e.target.value = e.target.value.replace(/[^a-zA-Z0-9]/, '');
                      record.$form.setFieldsValue({
                        postCode: e.target.value.replace(/[^a-zA-Z0-9]/, ''),
                      });
                    }
                  }}
                />
              )}
            </FormItem>
          ) : (
            val
          );
        },
      },
      {
        title: intl.get('sslm.enterpriseInform.view.model.address.description').d('地址备注'),
        dataIndex: 'description',
        width: 200,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record?.$form?.getFieldDecorator('description', {
                initialValue: val,
              })(<Input disabled={changFlag} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get('hzero.common.status.enable').d('启用'),
        dataIndex: 'enabledFlag',
        width: 100,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record?.$form?.getFieldDecorator('enabledFlag', {
                initialValue: val,
              })(<Checkbox disabled={changFlag} />)}
            </FormItem>
          ) : (
            yesOrNoRender(val)
          ),
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'operation',
        width: 100,
        render: (_, record) => (
          <Fragment>
            {record._status === 'create' && (
              <a onClick={() => this.handleClean(record)}>
                {intl.get('hzero.common.button.clean').d('清除')}
              </a>
            )}
            {record._status === 'update' && (
              <a onClick={() => this.editRow(false, record)}>
                {intl.get('hzero.common.button.cancel').d('取消')}
              </a>
            )}
            {record._status !== 'create' && record._status !== 'update' && (
              <a
                disabled={pubEdit ? !pubEdit : changFlag || !savePermissionFlag}
                onClick={() => this.editRow(true, record)}
              >
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
            )}
          </Fragment>
        ),
      },
    ];

    return (
      <Fragment>
        <div
          style={{
            textAlign: 'right',
            paddingBottom: 16,
            display: changFlag || !savePermissionFlag ? 'none' : 'block',
          }}
        >
          <Button onClick={this.handleSave} loading={saveLoading}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button
            type="primary"
            style={{ marginLeft: 8 }}
            onClick={this.handleAdd}
            loading={saveLoading}
          >
            {intl.get(`hzero.common.button.create`).d('新建')}
          </Button>
        </div>
        {isFunction(customizeTable) ? (
          customizeTable(
            {
              code: customizeUnitCode,
              clearCache: (a, b, cb) => {
                if (a !== b) cb(a);
              },
              useNewValid: true,
            },
            <EditTable
              bordered
              rowKey={this.defaultRowKey}
              columns={columns}
              dataSource={platformAddressList}
              pagination={false}
              loading={queryLoading}
            />
          )
        ) : (
          <EditTable
            bordered
            rowKey={this.defaultRowKey}
            columns={columns}
            dataSource={platformAddressList}
            pagination={false}
            loading={queryLoading}
          />
        )}
      </Fragment>
    );
  }
}
