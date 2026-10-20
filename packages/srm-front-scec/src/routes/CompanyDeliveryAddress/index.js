/**
 * CompanyDeliveryAddress -收货地址
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

const modelPrompt = 'scec.ecAcquirerAddress.model';
const viewPrompt = 'scec.companyDeliveryAddress.view.companyDeliveryAddress';
@formatterCollections({
  code: [
    'scec.ecAcquirerAddress',
    'scec.companyDeliveryAddress',
    'entity.company',
    'entity.roles',
    'scec.common',
  ],
})
@connect(({ loading, ecAcquirerAddress, companyDeliveryAddress }) => ({
  ecAcquirerAddress,
  companyDeliveryAddress,
  loading: loading.effects['companyDeliveryAddress/fetchCompanyDeliveryAddress'],
  saveLoading: loading.effects['companyDeliveryAddress/updateCompanyDeliveryAddress'],
  addLoading: loading.effects['companyDeliveryAddress/addCompanyDeliveryAddress'],
}))
export default class CompanyDeliveryAddress extends Component {
  form;

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      tableRecord: {},
      cityData: [],
      isChooseLastFlag: false, // 是否选择最深层级地址区域flag
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    this.fetchEcData();
    dispatch({
      type: 'ecAcquirerAddress/queryDefaultCity',
    }).then(res => {
      this.setState({
        cityData: res,
      });
    });
    dispatch({
      type: 'companyDeliveryAddress/fetchEcCompany',
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
      companyDeliveryAddress: { pagination = {} },
    } = this.props;
    const filterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'companyDeliveryAddress/fetchCompanyDeliveryAddress',
      payload: {
        page: isEmpty(params) ? pagination : params,
        ...filterValues,
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
    if (objectVersionNumber) {
      dispatch({
        type: 'companyDeliveryAddress/updateCompanyDeliveryAddress',
        payload: { ...data, defaultFlag: 0 },
      }).then(res => {
        if (res) {
          notification.success();
          this.fetchEcData();
          this.handleCancel();
        }
      });
    } else {
      dispatch({
        type: 'companyDeliveryAddress/addCompanyDeliveryAddress',
        payload: { ...data, defaultFlag: 0 },
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
    const { countryId, regionId } = lastOption;
    lastOption.loading = true;
    clearTimeout(this.loadCitiseTimer); // 清除定时器
    this.loadCitiseTimer = setTimeout(() => {
      dispatch({
        type: 'ecAcquirerAddress/queryCity',
        payload: { countryId, regionId },
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
      companyDeliveryAddress: { list = {}, pagination = {}, currentCompany = [] },
      loading,
      saveLoading,
      addLoading,
    } = this.props;
    const { visible, tableRecord, cityData = [], isChooseLastFlag = false } = this.state;
    const columns = [
      {
        title: intl.get(`${modelPrompt}.type`).d('类型'),
        width: 100,
        dataIndex: 'ownerTypeMeaning',
      },
      {
        title: intl.get(`${modelPrompt}.companyName`).d('公司名称'),
        width: 100,
        dataIndex: 'companyName',
      },
      {
        title: intl.get('scec.ecAcquirerAddress.entity.roles.contacts').d('联系人'),
        width: 100,
        dataIndex: 'contactName',
      },
      {
        title: intl.get('hzero.common.phone').d('手机'),
        width: 120,
        dataIndex: 'mobile',
      },
      {
        title: intl.get('hzero.common.email').d('邮箱'),
        width: 170,
        dataIndex: 'email',
      },
      {
        title: intl.get(`${modelPrompt}.regionName`).d('地址区域'),
        width: 170,
        dataIndex: 'regionName',
        render: (_, record) => {
          const regionNameList = record.rgNameList || [];
          return regionNameList.join('');
        },
      },
      {
        title: intl.get(`${modelPrompt}.address`).d('详细地址'),
        width: 150,
        dataIndex: 'address',
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        width: 80,
        dataIndex: 'enabledFlag',
        render: (_, record) => (
          <Badge
            status={record.enabledFlag ? 'success' : 'error'}
            text={
              record.enabledFlag
                ? intl.get('hzero.common.status.enable').d('启用')
                : intl.get('hzero.common.status.disable').d('禁用')
            }
          />
        ),
      },
      {
        title: intl.get('scec.common.table.column.remark').d('备注'),
        dataIndex: 'remark',
        width: 80,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 80,
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
      currentCompany,
      visible,
      saveLoading,
      addLoading,
      loading,
      tableRecord,
      cityData,
      isChooseLastFlag,
      anchor: 'right',
      onCancel: this.handleCancel,
      onHandleSave: this.handleSaveData,
      onLoadData: this.handleQueryCity,
    };
    return (
      <React.Fragment>
        <Header title={intl.get(`${viewPrompt}.comtitle`).d('公司收货地址管理')}>
          <Button type="primary" icon="plus" onClick={this.handleCreateData}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm {...filterList} />
          </div>
          <Table
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
