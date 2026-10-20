/**
 * EcDeliveryAddress -收货地址
 * @date: 2019-1-25
 * @author zjx <jingxi.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { isUndefined, isEmpty } from 'lodash';
import { connect } from 'dva';
import { Button, Table, Badge } from 'hzero-ui';

import { filterNullValueObject } from 'utils/utils';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';

import { Header, Content } from 'components/Page';

import FilterForm from './FilterForm';
import Drawer from './Drawer';

@formatterCollections({
  code: ['small.ecDeliveryAddress', ' small.common'],
})
@connect(({ loading, smallEcAcquirerAddress, smallEcDeliveryAddress }) => ({
  smallEcAcquirerAddress,
  smallEcDeliveryAddress,
  loading: loading.effects['smallEcDeliveryAddress/fetchEcDeliveryAddress'],
  saveLoading: loading.effects['smallEcDeliveryAddress/updateEcDeliveryAddress'],
  addLoading: loading.effects['smallEcDeliveryAddress/addEcDeliveryAddress'],
}))
export default class EcDeliveryAddress extends Component {
  form;

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      tableRecord: {},
      cityData: [],
      isChooseLastFlag: false, // 是否选择最深层级地址区域flag
      comOrPersonRule: 1, // 1为个人0为公司
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    this.fetchEcData();
    dispatch({
      type: 'smallEcAcquirerAddress/queryDefaultCity',
      payload: {
        page: -1,
      },
    }).then(res => {
      this.setState({
        cityData: res,
      });
    });
    dispatch({
      type: 'smallEcDeliveryAddress/queryComOrPersonRuleService',
    }).then(res => {
      if (res) {
        this.setState({
          comOrPersonRule: res.settingValue,
        });
      }
    });
  }

  // 绑定表单ref
  @Bind()
  handleRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * 查询
   */
  @Bind()
  fetchEcData(params) {
    const {
      dispatch,
      smallEcDeliveryAddress: { pagination = {} },
    } = this.props;
    const filterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'smallEcDeliveryAddress/fetchEcDeliveryAddress',
      payload: {
        page: isEmpty(params) ? pagination : params,
        ...filterValues,
        belongType: 2, // 1公司2个人
      },
    });
  }

  /**
   * 保存数据
   */
  @Bind()
  handleSaveData(data = {}) {
    const { dispatch } = this.props;
    const { objectVersionNumber } = data;
    // const userId = getCurrentUserId();
    if (objectVersionNumber) {
      dispatch({
        type: 'smallEcDeliveryAddress/updateEcDeliveryAddress',
        payload: data,
      }).then(res => {
        if (res) {
          notification.success();
          this.fetchEcData();
          this.handleCancel();
        }
      });
    } else {
      dispatch({
        type: 'smallEcDeliveryAddress/addEcDeliveryAddress',
        payload: { ...data, belongType: 2 },
      }).then(res => {
        if (res) {
          notification.success();
          this.fetchEcData();
          this.handleCancel();
        }
      });
    }
  }

  // 节流时间 -为了查询是否为最后一级地区loadCity会请求两次
  loadCitiseTimer;

  /**
   * 地区级联下拉框动态加载数据
   */
  @Bind()
  handleQueryCity(selectedOptions) {
    const { dispatch } = this.props;
    const lastOption = selectedOptions[selectedOptions.length - 1] || [];
    const { countryId, regionCode } = lastOption;
    lastOption.loading = true;
    clearTimeout(this.loadCitiseTimer); // 清除定时器
    this.loadCitiseTimer = setTimeout(() => {
      dispatch({
        type: 'smallEcAcquirerAddress/queryCity',
        payload: { countryId, regionCode, page: -1 },
      }).then(res => {
        if (res) {
          const { cityData } = this.state;
          lastOption.loading = false;
          // 是否是最后一级地区
          if (!isEmpty(res)) {
            lastOption.children = res;
            this.setState({
              isChooseLastFlag: false,
            });
          } else {
            this.setState({
              isChooseLastFlag: true,
            });
          }
          this.setState({
            cityData: [...cityData],
          });
        }
      });
    }, 10);
  }

  /**
   * 新建
   */
  @Bind()
  handleCreateData() {
    this.setState({
      visible: true,
      tableRecord: {},
      isChooseLastFlag: false,
    });
  }

  /**
   * 编辑
   */
  @Bind()
  handleEditData(record = {}) {
    this.setState({
      visible: true,
      tableRecord: record,
      isChooseLastFlag: true,
    });
  }

  /**
   * 取消
   */
  @Bind()
  handleCancel() {
    this.setState({
      visible: false,
      tableRecord: {},
    });
  }

  render() {
    const {
      smallEcDeliveryAddress: { list = {}, pagination = {} },
      loading,
      saveLoading,
      addLoading,
    } = this.props;
    const {
      visible,
      tableRecord,
      cityData = [],
      isChooseLastFlag = false,
      comOrPersonRule,
    } = this.state;
    const columns = [
      {
        title: intl.get('small.common.model.contact').d('联系人'),
        width: 100,
        dataIndex: 'contactName',
      },
      {
        title: intl.get('small.common.model.phone').d('手机'),
        width: 120,
        dataIndex: 'mobile',
      },
      {
        title: intl.get('small.common.model.email').d('邮箱'),
        width: 170,
        dataIndex: 'email',
      },
      {
        title: intl.get(`small.common.model.regionArea`).d('地址区域'),
        width: 170,
        dataIndex: 'regionName',
        render: (_, record) => {
          const regionNameList = record.regionNameList || [];
          return regionNameList.join('');
        },
      },
      {
        title: intl.get(`small.common.model.detailAddress`).d('详细地址'),
        width: 150,
        dataIndex: 'address',
      },
      {
        title: intl.get('small.common.model.status').d('状态'),
        width: 80,
        dataIndex: 'enabledFlag',
        render: (_, record) => (
          <Badge
            status={record.enabledFlag ? 'success' : 'error'}
            text={
              record.enabledFlag
                ? intl.get('small.common.model.enable').d('启用')
                : intl.get('small.common.model.disable').d('禁用')
            }
          />
        ),
      },
      {
        title: intl.get('small.common.model.remark').d('备注'),
        dataIndex: 'remark',
      },
      {
        title: intl.get('small.common.model.operation').d('操作'),
        width: 100,
        fixed: 'right',
        dataIndex: 'edit',
        render: (_, record) => {
          return (
            <a
              onClick={() => {
                this.handleEditData(record);
              }}
            >
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
          );
        },
      },
    ];
    const filterList = {
      onRef: this.handleRef,
      onFetchData: this.fetchEcData,
    };
    const detailProps = {
      visible,
      saveLoading,
      addLoading,
      loading,
      tableRecord,
      cityData,
      isChooseLastFlag,
      anchor: 'right',
      comOrPersonRule,
      onCancel: this.handleCancel,
      onHandleSave: this.handleSaveData,
      onLoadData: this.handleQueryCity,
    };
    return (
      <React.Fragment>
        <Header
          title={intl.get(`small.ecDeliveryAddress.view.personDeliveryAddress`).d('个人收货地址')}
        >
          <Button type="primary" icon="plus" onClick={this.handleCreateData}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm {...filterList} />
          </div>
          <Table
            className="small-table-all-space"
            pagination={pagination}
            columns={columns}
            loading={loading}
            bordered
            dataSource={list.content}
            rowKey="addressId"
            onChange={page => this.fetchEcData(page)}
          />
        </Content>
        <Drawer {...detailProps} />
      </React.Fragment>
    );
  }
}
