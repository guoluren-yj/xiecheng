/**
 * Query - 专家信息查询
 * @date: 2019-01-21
 * @author: YKK <kaikai.yang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Header, Content } from 'components/Page';
import ExcelExportNew from 'hzero-front/lib/components/ExcelExportPro';
import ExcelExport from 'components/ExcelExport';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { isUndefined, isFunction } from 'lodash';
import { Bind } from 'lodash-decorators';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import remoteHoc from 'hzero-front/lib/utils/remote';

import QueryForm from './QueryForm';
import MaintenanceTable from '../Components/MaintenanceTable';
import { getCustomizeUnitCode } from '../utils/utils';

@remoteHoc({
  code: 'SSRC_EXPERT_QUERY',
  name: 'remote',
})
@withCustomize({
  unitCode: [
    'SSRC.EXPERT_INFO_LIST.HEADER_BUTTON',
    getCustomizeUnitCode('expertQueryTableList'), // 专家信息查询列表页
  ],
})
@connect(({ expert, loading }) => ({
  expert,
  loading: loading.effects['expert/queryAll'],
}))
@formatterCollections({ code: ['ssrc.expert', 'hzero.common', 'scux.ssrc'] })
export default class Query extends PureComponent {
  componentDidMount() {
    const {
      expert: { queryPagination = {} },
    } = this.props;
    const page = queryPagination;
    this.queryAll(page);
    this.queryValueCode();
  }

  /**
   * 批量查询值集
   */
  @Bind()
  queryValueCode() {
    const { dispatch, remote } = this.props;
    // 协鑫埋点，查询租户值集
    const { handleQueryCode = undefined } = remote?.props?.process || {};
    let payload = {
      expertTypeList: 'SSRC.EXPERT_TYPE', // 专家类型
      expertCategoryList: 'SSRC.EXPERT_CATEGORY', // 专家类别
      expertReqList: 'SSRC.EXPERT_REQ_STATUS', // 单据状态
      enabledStatus: 'HPFM.ENABLED_FLAG', // 启用状态
    };
    if(isFunction(handleQueryCode)){
      payload = handleQueryCode(payload, {...this.props});
    }
    dispatch({
      type: 'expert/queryValueCode',
      payload,
    });
  }

  /**
   * 查询数据
   * @param {Object} pageData 页面信息数据
   */
  @Bind()
  queryAll(pageData = {}) {
    const { dispatch, remote } = this.props;
    const filterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    let searchData = {
      ...filterValues,
    };
    // cdp-104985 协鑫埋点处理，必填项校验
    const { handleValidate = undefined,  handleSearchData = undefined } = remote?.props?.process || {};
    if(isFunction(handleValidate) && handleValidate(this.form, {...this})) return;
    // 协鑫埋点处理，多选下拉值集查询条件
    if(isFunction(handleSearchData)){
      searchData = handleSearchData(searchData, {...this.props}) || {};
    }
    dispatch({
      type: 'expert/queryAll',
      payload: {
        page: pageData,
        fuzzyQueryFlag: 0,
        customizeUnitCode: getCustomizeUnitCode('expertQueryTableList'),
        ...searchData,
      },
    });
  }

  /**
   * 点击查询按钮事件
   */
  @Bind()
  onQueryExpert(queryData = {}) {
    this.queryAll(queryData);
  }

  /**
   * 分页改变事件
   * @param {Object} pagination 分页信息
   */
  @Bind()
  handleStandardTableChange(pagination = {}) {
    this.queryAll(pagination);
  }

  /**
   *
   * @param {object} ref - FilterForm子组件对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * 获取form数据
   */
  @Bind()
  handleGetFormValue() {
    const { form } = this;
    const formValues = isUndefined(form) ? {} : filterNullValueObject(form.getFieldsValue());
    const filterValues = {
      ...formValues,
    };
    return filterValues;
  }

  @Bind()
  getHeaderButtons() {
    const { remote } = this.props;
    const buttons = [
      <ExcelExport
        requestUrl={`/ssrc/v1/${getCurrentOrganizationId()}/expert/excel`}
        queryParams={this.handleGetFormValue()}
        name="export"
      />,
      <ExcelExportNew
        templateCode="SSRC_EXPERT"
        requestUrl={`/ssrc/v1/${getCurrentOrganizationId()}/expert/excel`}
        queryParams={this.handleGetFormValue()}
        icon="unarchive"
        otherButtonProps={{
          permissionList: [
            {
              code: `${this.props.match.path}.button.batch-export-new`,
              type: 'button',
              meaning:
                intl.get('ssrc.expert.view.message.title.expertInfoQuery').d('专家信息查询') -
                intl.get('hzero.common.button.priceExportNew').d('(新)批量导出'),
            },
          ],
        }}
        name="newExport"
      />,
    ];
    return remote
      ? remote.process('SSRC_EXPERT_QUERY_PROCESS_HEADER_BUTTONS', buttons, {
          exportQueryParams: this.handleGetFormValue(),
        })
      : buttons;
  }

  render() {
    const {
      loading,
      expert: {
        queryList = {},
        queryPagination = {},
        code: { expertTypeList = [], expertCategoryList = [], enabledStatus = [] },
      },
      customizeBtnGroup = () => {},
      remote,
      customizeTable,
    } = this.props;
    const formProps = {
      expertTypeList,
      expertCategoryList,
      onQueryExpert: this.onQueryExpert,
      onRef: this.handleBindRef,
      enabledStatus,
      remote,
      lovList: this.props.expert?.code || {}, // 所有独立值集查询结果
    };
    const queryTable = {
      remote,
      type: 'query',
      loading,
      expertList: queryList,
      expertPagination: queryPagination,
      customizeTable,
      customizeUnitCode: getCustomizeUnitCode('expertQueryTableList'),
      onQueryAll: this.queryAll,
      onTableChange: this.handleStandardTableChange,
    };
    return (
      <React.Fragment>
        <Header
          title={intl.get('ssrc.expert.view.message.title.expertInfoQuery').d('专家信息查询')}
        >
          {customizeBtnGroup(
            { code: 'SSRC.EXPERT_INFO_LIST.HEADER_BUTTON' },
            this.getHeaderButtons()
          )}
        </Header>
        <Content>
          <div className="table-list-search">
            <QueryForm {...formProps} />
          </div>
          <MaintenanceTable {...queryTable} />
        </Content>
      </React.Fragment>
    );
  }
}
