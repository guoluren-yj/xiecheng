/*
 * AddressInfoList - 企业注册-地址信息编辑
 * @date: 2018/08/07 15:11:13
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Table, DataSet, TextField, Form } from 'choerodon-ui/pro';
import { Button, Cascader, Icon } from 'hzero-ui';
import { connect } from 'dva';
import { withRouter } from 'react-router-dom';
import { isEmpty, last, isArray } from 'lodash';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
// import { enableRender } from 'utils/renderer';
import notification from 'utils/notification';
import { queryLovData } from 'services/api';
import { HZERO_PLATFORM } from 'utils/config';
import querystring from 'querystring';
import { getResponse } from 'utils/utils';
import { yesOrNoRender } from 'utils/renderer';

import addressDS from '../store/addressDS';

const NAME_SPACE = 'enterpriseAddress';
/**
 * 企业注册-地址信息编辑
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} address - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@connect((modal) => ({
  address: modal[NAME_SPACE],
  loading: modal.loading.effects[`${NAME_SPACE}/queryAddressList`],
  saving: modal.loading.effects[`${NAME_SPACE}/saveAddressList`],
}))
@withRouter
// @formatterCollections({ code: 'spfm.address' })
export default class AddressInfoList extends PureComponent {
  constructor(props) {
    super(props);
    const routerParam = querystring.parse(props.location.search.substr(1));
    const { domesticForeignRelation: domestic } = routerParam;
    const domesticForeignRelation = Number(domestic);
    const { onRef } = this.props;
    if (onRef) onRef(this);
    this.state = {
      cityData: [],
      record: {},
      addressData: {},
      domesticFlag: domesticForeignRelation,
    };
  }

  addressDS = new DataSet({
    ...addressDS(),
    autoQuery: false,
    events: {
      update: ({ record, name, value }) => {
        if (name === 'countryObj') {
          record.set('regionId', null);
          record.set('regionPathName', null);
        }
        if (name === 'defaultFlag') {
          if (value === 1) {
            record.set('enabledFlag', 1);
          }
        }
        if (name === 'internationalTelCode') {
          record.set('mobilephone', null);
        }
      },
    },
    transport: {
      destroy: ({ data }) => {
        console.log('destroy', data);
        this.remove(data);
      },
      submit: ({ dataSet, data }) => {
        if (!dataSet.destroyed.length) {
          this.handleSave(data);
        }
      },
    },
  });

  componentDidMount() {
    const { domesticFlag } = this.state;
    this.handleQueryCityAddress(domesticFlag);
    const { companyId, dispatch, company } = this.props;
    if (companyId && companyId !== 'undefined') {
      dispatch({
        type: 'enterpriseAddress/queryAddressList',
        payload: { companyId },
      }).then((res) => {
        if (res) {
          const {
            address: { addressList },
          } = this.props;
          const {
            registeredCountryCode,
            registeredCountryId,
            registeredCountryName,
            regionPathName,
            registeredRegionId,
            addressDetail,
          } = company || {};
          if (isEmpty(addressList)) {
            this.addressDS.create({
              countryObj: {
                countryId: registeredCountryId,
                countryCode: registeredCountryCode,
                countryName: registeredCountryName,
              },
              regionId: registeredRegionId,
              regionPathName,
              addressDetail,
            });
          } else {
            this.addressDS.loadData(addressList);
          }
        }
      });
    }
  }

  /**
   * 境内地址自带中国
   */
  @Bind()
  handleQueryCityAddress(domesticFlag) {
    // 境内个人需默认带值中国
    let defaultCountryCode = null;
    let defaultCountryId = null;
    let defaultCountryName = null;
    queryLovData(`${HZERO_PLATFORM}/v1/lovs/sql/data`, {
      lovCode: 'HPFM.COUNTRY',
      page: 0,
      size: 10,
      condition: 'CN',
    })
      .then((lovData) => {
        if (getResponse(lovData)) {
          if (lovData && isArray(lovData.content)) {
            const firstData = lovData.content[0];
            const { countryCode, countryId, countryName } = firstData || {};
            defaultCountryCode = countryCode;
            defaultCountryId = countryId;
            defaultCountryName = countryName;
          }
        }
      })
      .finally(() => {
        // 新注册带出注册时的企业信息
        const countryObj = {
          registeredCountryId: domesticFlag ? defaultCountryId : undefined,
          registeredCountryName: domesticFlag ? defaultCountryName : undefined,
          registeredCountryCode: domesticFlag ? defaultCountryCode : undefined,
        };
        this.setState({ addressData: countryObj });
      });
  }

  /**
   * 删除
   */
  @Bind()
  remove(deleteRows) {
    const { dispatch, companyId } = this.props;
    if (deleteRows.length > 0) {
      dispatch({
        type: `enterpriseAddress/deleteAddressList`,
        payload: {
          deleteRows,
          companyId,
        },
      }).then((response) => {
        if (response) {
          this.refresh();
          notification.success();
        }
      });
    } else {
      this.refresh();
      notification.success();
    }
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
          type: `${NAME_SPACE}/queryDefaultCity`,
          payload: { countryId: value },
        }).then((res) => {
          this.setState({
            cityData: res,
          });
        });
      }
    );
  }

  /**
   *  查询地址列表
   */
  @Bind()
  refresh() {
    const { companyId, dispatch } = this.props;
    dispatch({
      type: 'enterpriseAddress/queryAddressList',
      payload: { companyId },
    }).then(() => {
      const {
        address: { addressList },
      } = this.props;
      this.addressDS.loadData(addressList);
    });
  }

  /**
   * 获取行内数据和状态树的合并
   * 然后判断合并数据的长度和是否修改数据
   * @memberof AddressInfo
   */
  @Bind()
  async handleSave(ListData, callback) {
    const { dispatch, companyId } = this.props;
    const flag = await this.addressDS.validate();
    if (flag) {
      const arrListData = ListData.map((item) => {
        const { ...newItem } = item;
        if (isEmpty(newItem.postCode)) {
          newItem.postCode = null;
        }
        return { ...newItem };
      });
      dispatch({
        type: 'enterpriseAddress/saveAddressList',
        payload: { companyId, companyAddressList: arrListData },
      }).then((data) => {
        if (data) {
          this.refresh();
          notification.success();
          if (callback) {
            callback();
          }
        }
      });
    }
  }

  /**
   * 获取行内数据和状态树的合并
   * 然后判断合并数据的长度和是否修改数据
   * @memberof AddressInfo
   */
  @Bind()
  async saveAndNext() {
    const { callback } = this.props;
    if (this.addressDS.toData().length > 0) {
      const flag = await this.addressDS.validate();
      if (flag) {
        if (this.addressDS.created.length || this.addressDS.updated.length) {
          if (this.addressDS.toData().find((item) => item.enabledFlag)) {
            const listData = this.addressDS.toJSONData();
            this.handleSave(listData, callback);
          } else {
            notification.warning({
              message: intl
                .get(`spfm.address.view.message.warn.mustEnabledAddressInfo`)
                .d('至少启用一条地址信息'),
            });
          }
        } else if (this.addressDS.toData().find((item) => item.enabledFlag)) {
          if (callback) {
            callback();
          }
        } else {
          notification.warning({
            message: intl
              .get(`spfm.address.view.message.warn.mustEnabledAddressInfo`)
              .d('至少启用一条地址信息'),
          });
        }
      }
    } else if (callback) {
      callback();
    }
  }

  @Bind()
  handlePrevious() {
    const { previousCallback } = this.props;
    if (previousCallback) {
      previousCallback();
    }
  }

  @Bind()
  handleCascader(record) {
    const { cityData = [] } = this.state;
    return (
      <Cascader
        onClick={() => this.fetchProvinceCity(record.get('countryId'))}
        changeOnSelect
        showSearch={false}
        style={{ width: '100%' }}
        placeholder={intl.get('hzero.common.validation.requireSelect', {
          name: intl.get('spfm.enterprise.model.legal.regionIds').d('地区'),
        })}
        fieldNames={{ label: 'regionName', value: 'regionId' }}
        options={cityData || []}
        onChange={(value, selectedOptions) =>
          this.handleSelectRegion(value, selectedOptions, record)
        }
        loadData={(selectedOptions) => this.handleQueryCity(selectedOptions)}
        disabled={!record.get('countryId')}
      >
        <Icon type="down" />
      </Cascader>
    );
  }

  /**
   * 选择地区拼接
   */
  @Bind()
  handleSelectRegion(value, selectedOptions = [], record) {
    const regionList = selectedOptions.map((region) => {
      const { regionName } = region;
      return regionName;
    });
    const region = regionList.join('|');
    const regionId = last(value);
    const lastRecord = last(selectedOptions);
    const { isLeaf } = lastRecord || {};
    record.set('isLeaf', isLeaf);
    record.set('regionId', regionId);
    record.set('regionPathName', region);
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
      type: `${NAME_SPACE}/queryCitys`,
      payload: { countryId, regionId },
    }).then((res) => {
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

  render() {
    const {
      showButton = true,
      buttonText = intl.get('hzero.common.button.save').d('保存'),
      loading,
      saving,
      previousCallback,
      backBtnText = intl.get('hzero.common.button.previous').d('上一步'),
    } = this.props;
    const columns = [
      {
        name: 'countryObj',
        width: 200,
        editor: (record) => {
          return record.status === 'add' || record.getState('editing');
        },
      },
      {
        name: 'regionId',
        width: 200,
        // editor: true,
        renderer: ({ record }) => {
          if (record.status === 'add' || record.getState('editing')) {
            return (
              <Form record={record} labelLayout="none">
                <TextField
                  name="regionPathName"
                  addonAfter={this.handleCascader(record)}
                  disabled={!record.get('countryId')}
                />
              </Form>
            );
          } else {
            return record.get('regionPathName');
          }
        },
      },
      {
        name: 'addressDetail',
        width: 300,
        editor: (record) => {
          return record.status === 'add' || record.getState('editing');
        },
      },
      {
        name: 'postCode',
        width: 200,
        editor: (record) => {
          return record.status === 'add' || record.getState('editing');
        },
      },
      {
        name: 'description',
        width: 200,
        editor: (record) => {
          return record.status === 'add' || record.getState('editing');
        },
      },
      {
        name: 'enabledFlag',
        align: 'left',
        editor: (record) => {
          return record.status === 'add' || record.getState('editing');
        },
        width: 80,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'option',
        width: 180,
        renderer: ({ record }) => {
          if (record.status === 'add') {
            return (
              <a
                onClick={() => {
                  this.addressDS.remove(record);
                }}
              >
                {intl.get('hzero.common.button.delete').d('删除')}
              </a>
            );
          } else if (record.getState('editing')) {
            return (
              <a
                onClick={() => {
                  record.reset();
                  record.setState('editing', false);
                }}
              >
                {intl.get('hzero.common.button.cancel').d('取消')}
              </a>
            );
          } else {
            return (
              <a
                onClick={() => {
                  record.setState('editing', true);
                  record.set('option', 'edit');
                }}
              >
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
            );
          }
        },
      },
    ];
    const buttons = [
      [
        'add',
        {
          afterClick: () => {
            const { addressData, domesticFlag } = this.state;
            const {
              registeredCountryCode,
              registeredCountryId,
              registeredCountryName,
            } = addressData;
            const obj = {
              countryCode: registeredCountryCode,
              countryId: registeredCountryId,
              countryName: registeredCountryName,
              enabledFlag: 1,
            };
            if (domesticFlag) {
              this.addressDS.current.set(obj);
            }
          },
        },
      ],
      'save',
      'delete',
    ];
    return (
      <React.Fragment>
        <Table
          rowHeight="auto"
          loading={loading}
          buttons={buttons}
          dataSet={this.addressDS}
          columns={columns}
          pagination={false}
        />
        <div style={{ clear: 'both', marginTop: 40, textAlign: 'right' }}>
          {previousCallback && (
            <Button type="primary" ghost onClick={this.handlePrevious} style={{ marginRight: 16 }}>
              {backBtnText}
            </Button>
          )}
          {showButton && (
            <Button type="primary" onClick={this.saveAndNext} loading={saving}>
              {buttonText}
            </Button>
          )}
        </div>
      </React.Fragment>
    );
  }
}
