/**
 * RateTypeOrg - 汇率类型定义(租户级)
 * @date: 2018-7-9
 * @author: geekrainy <chao.zheng02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Button, Table } from 'hzero-ui';
import { Header, Content } from 'components/Page';
import { Bind, debounce } from 'lodash-decorators';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { enableRender } from 'utils/renderer';
import notification from 'utils/notification';
import FilterForm from './FilterForm';

@connect(({ rateTypeOrg, loading }) => ({
  rateTypeOrg,
  loading: loading.effects['rateTypeOrg/queryRateTypeTenant'],
  saving: loading.effects['rateTypeOrg/updateRateTypeTenant'],
  tenantId: getCurrentOrganizationId(),
}))
@formatterCollections({
  code: 'smdm.rateTypeOrg',
})
export default class RateTypeOrg extends Component {
  constructor(props) {
    super(props);
    this.filterForm = {}; // 查询表单引用对象
  }

  componentDidMount() {
    const {
      dispatch,
      rateTypeOrg: { pagination = {} },
    } = this.props;

    dispatch({
      type: 'rateTypeOrg/init',
    }).then(() => {
      this.handleSearch(pagination);
    });
  }

  /**
   * 查询汇率类型列表
   * @param {Object} pagination - 查询参数对象
   */
  @Bind()
  handleSearch(page = {}) {
    const { dispatch, tenantId } = this.props;
    const values = this.filterForm.props.form.getFieldsValue();

    dispatch({
      type: 'rateTypeOrg/queryRateTypeTenant',
      payload: {
        tenantId,
        page,
        ...values,
      },
    });
  }

  /**
   *
   * @param {object} ref - FilterForm子组件对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.filterForm = ref;
  }

  /**
   * 保存汇率类型
   * @param {Object} record - 租户级汇率类型行数据
   */
  @Bind()
  handleSave(record) {
    const {
      dispatch,
      tenantId,
      rateTypeOrg: { pagination = {} },
    } = this.props;

    dispatch({
      type: 'rateTypeOrg/updateRateTypeTenant',
      payload: {
        list: {
          ...record,
          enabledFlag: !record.enabledFlag ? 1 : 0,
        },
        tenantId,
      },
    }).then((response) => {
      if (response) {
        notification.success();
        this.handleSearch(pagination);
      }
    });
  }

  /**
   * 引用云级汇率类型
   */
  @Bind()
  @debounce(500)
  handlePull() {
    const { dispatch, tenantId } = this.props;
    dispatch({
      type: 'rateTypeOrg/pullPlatformRateType',
      payload: tenantId,
    }).then(() => {
      notification.success();
      this.handleSearch();
    });
  }

  render() {
    const {
      loading,
      rateTypeOrg: {
        rateMethodList = [],
        enabledList = [],
        tenantRateTypeList = {},
        pagination = {},
      },
    } = this.props;
    const filterProps = {
      rateMethodList,
      enabledList,
      onSearch: this.handleSearch,
      onRef: this.handleBindRef,
    };
    const columns = [
      {
        title: intl.get('smdm.rateTypeOrg.model.rateType.typeCode').d('类型编码'),
        width: 200,
        align: 'left',
        dataIndex: 'typeCode',
      },
      {
        title: intl.get('smdm.rateTypeOrg.model.rateType.typeName').d('类型名称'),
        align: 'left',
        dataIndex: 'typeName',
      },
      {
        title: intl.get('smdm.rateTypeOrg.model.rateType.rateMethodCode').d('方式'),
        width: 150,
        align: 'left',
        dataIndex: 'rateMethodCode',
        render: (_, record) => record.rateMethodMeaning,
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        align: 'left',
        width: 100,
        dataIndex: 'enabledFlag',
        render: (val) => ['0', 0, '1', 1].includes(val) ? enableRender(Number(val)) : val,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        align: 'left',
        width: 100,
        render: (_, record) => {
          return (
            <span>
              <a
                onClick={() => {
                  this.handleSave(record);
                }}
              >
                {record.enabledFlag
                  ? intl.get('hzero.common.status.disable').d('禁用')
                  : intl.get('hzero.common.status.enable').d('启用')}
              </a>
            </span>
          );
        },
      },
    ];

    return (
      <React.Fragment>
        <Header title={intl.get('smdm.rateTypeOrg.view.title.rateType').d('汇率类型定义')}>
          <Button icon="fork" type="primary" onClick={this.handlePull}>
            {intl.get('smdm.rateTypeOrg.view.button.quote').d('引用云级数据')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm {...filterProps} />
          </div>
          <Table
            bordered
            rowKey="rateTypeId"
            loading={loading}
            dataSource={tenantRateTypeList.content}
            columns={columns}
            onChange={this.handleSearch}
            pagination={pagination}
          />
        </Content>
      </React.Fragment>
    );
  }
}
