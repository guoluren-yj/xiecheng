/**
 * Maintenance - 专家信息维护(管理员)
 * @date: 2019-01-21
 * @author: YKK <kaikai.yang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import remotes from 'hzero-front/lib/utils/remote';
import DynamicButtons from '_components/DynamicButtons';
import formatterCollections from 'utils/intl/formatterCollections';
import { isUndefined } from 'lodash';
import { Bind } from 'lodash-decorators';
import { filterNullValueObject } from 'utils/utils';
import WithCustomizeH0 from 'srm-front-cuz/lib/h0Customize';

import QueryForm from './QueryForm';
import MaintenanceTable from '../Components/MaintenanceTable';
import { getCustomizeUnitCode } from '../utils/utils';

const promptCode = 'ssrc.expert';

@WithCustomizeH0({
  unitCode: [
    getCustomizeUnitCode('manageAdmTableList'), // 专家信息维护（管理员）- 列表
  ],
})
@remotes({
  code: 'SSRC_EXPERT_MAINTENACE',
  name: 'remote',
})
@connect(({ expert, loading }) => ({
  expert,
  loading: loading.effects['expert/queryMaintenace'],
}))
@formatterCollections({ code: ['ssrc.expert'] })
export default class Maintenance extends PureComponent {
  state = {
    selectedRows: [],
    selectedRowKeys: [],
  };

  componentDidMount() {
    const {
      expert: { maintenacePagination = {} },
    } = this.props;
    const page = maintenacePagination;
    this.queryMaintenace(page);
    this.queryValueCode();
  }

  /**
   * 批量查询值集
   */
  @Bind()
  queryValueCode() {
    const { dispatch } = this.props;
    dispatch({
      type: 'expert/queryValueCode',
      payload: {
        expertTypeList: 'SSRC.EXPERT_TYPE', // 专家类型
        expertCategoryList: 'SSRC.EXPERT_CATEGORY', // 专家类别
        expertReqList: 'SSRC.EXPERT_REQ_STATUS', // 单据状态
        enabledStatus: 'HPFM.ENABLED_FLAG', // 启用状态
      },
    });
  }

  /**
   * 查询数据
   * @param {Object} pageData 页面信息数据
   */
  @Bind()
  queryMaintenace(pageData = {}) {
    const { dispatch } = this.props;
    const filterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    const searchData = {
      ...filterValues,
    };
    dispatch({
      type: 'expert/queryMaintenace',
      payload: {
        page: pageData,
        customizeUnitCode: getCustomizeUnitCode('manageAdmTableList'),
        ...searchData,
      },
    });
  }

  /**
   * 点击查询按钮事件
   */
  @Bind()
  onQueryExpert(queryData = {}) {
    this.queryMaintenace(queryData);
  }

  /**
   * 勾选行切换 - 中信期货 二开引用随意改动勿动
   */
  @Bind()
  handleRowSelectChange(selectedRowKeys = [], selectedRows = []) {
    this.setState({
      selectedRows,
      selectedRowKeys,
    });
  }

  @Bind()
  getButtons() {
    const _buttons = [];
    const { remote } = this.props;
    return remote
      ? remote.process('SSRC_EXPERT_MAINTENACE_PROCESS_HEADER_BUTTONS', _buttons, {
          that: this,
          queryMaintenace: this.queryMaintenace,
        })
      : _buttons;
  }

  /**
   * 分页改变事件
   * @param {Object} pagination 分页信息
   */
  @Bind()
  handleStandardTableChange(pagination = {}) {
    this.queryMaintenace(pagination);
  }

  /**
   *
   * @param {object} ref - FilterForm子组件对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  render() {
    const {
      remote,
      loading,
      expert: {
        maintenaceList = {},
        maintenacePagination = {},
        code: { expertTypeList = [], expertCategoryList = [], enabledStatus = [] },
      },
      customizeTable,
    } = this.props;

    const { selectedRowKeys, selectedRows } = this.state;

    const formProps = {
      expertTypeList,
      expertCategoryList,
      onQueryExpert: this.onQueryExpert,
      onRef: this.handleBindRef,
      enabledStatus,
    };

    const rowSelection = remote
      ? remote.process('SSRC_EXPERT_MAINTENACE_PROCESS_ROW_SELECTION', null, {
          that: this,
          selectedRows,
          selectedRowKeys,
          onChange: this.handleRowSelectChange,
        })
      : null;

    const maintenaceTable = {
      type: 'maintenace',
      loading,
      rowSelection,
      expertList: maintenaceList,
      expertPagination: maintenacePagination,
      customizeTable,
      customizeUnitCode: getCustomizeUnitCode('manageAdmTableList'),
      onTableChange: this.handleStandardTableChange,
    };
    return (
      <React.Fragment>
        <Header
          title={intl.get(`${promptCode}.view.message.title.admin`).d('专家信息维护(管理员)')}
        >
          <DynamicButtons buttons={this.getButtons()} />
        </Header>
        <Content>
          <div className="table-list-search">
            <QueryForm {...formProps} />
          </div>
          <MaintenanceTable {...maintenaceTable} />
        </Content>
      </React.Fragment>
    );
  }
}
