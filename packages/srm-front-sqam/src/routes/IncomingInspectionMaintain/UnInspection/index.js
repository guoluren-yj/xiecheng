/**
 * UnInspectionMaterials - 待质检物料
 * @date: 2020-07-17
 * @author jingshangshang <shangshang.jing@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */ 
import React from 'react';
import { Bind } from 'lodash-decorators';
import { Form, Button } from 'hzero-ui';
import { connect } from 'dva';
import { isEmpty, isUndefined, throttle } from 'lodash';

import intl from 'utils/intl';
import remotes from 'hzero-front/lib/utils/remote';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import { SRM_SPUC } from '_utils/config';
import { Header, Content } from 'components/Page'; 
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import ExcelExport from 'components/ExcelExport';
import FilterForm from './FilterForm';
import ListTable from './ListTable';

const promptCode = 'sqam.incomingInspectionQuery';
const organizationId = getCurrentOrganizationId();
@withCustomize({
  unitCode: [
    'SQAM.INCOMING_UNINSPECTION.GRID',
    'SQAM.INCOMING_UNINSPECTION.FILTER',
    'SQAM.INCOMING_UNINSPECTION.EXPORT',
  ],
})
@remotes({
  code: 'SQAM_INCOMING_INSPECTION_MAINTAIN_UNINSPECTION',
},{
  events:{
    cuxCreate:()=>{}, // 二开新建逻辑
  }
})
@connect(({ loading = {}, incomingInspectionMaintain = {} }) => ({
  fetchListLoading: loading.effects['incomingInspectionMaintain/fetchUnInspection'],
  createLoading: loading.effects['incomingInspectionMaintain/quoteAndCreate'],
  enumMap: incomingInspectionMaintain.enumMap || {},
  incomingInspectionMaintain,
}))
@formatterCollections({
  code: [
    'sqam.common',
    'sqam.incomingInspectionQuery',
    'hzero.common',
    'entity.organization',
    'entity.attachment',
    'entity.company',
    'entity.business',
    'entity.item',
    'entity.roles',
    'entity.supplier',
  ],
})
@Form.create({ fieldNameProp: null })
export default class extends React.Component {
  form;

  state = {
    selectedRowKeys: [],
    selectedRows: [],
  };

  componentDidMount() {
    this.queryFlagList();
    this.fetchList();
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'incomingInspectionMaintain/updateState',
      payload: { list: [], pagination: {} },
    });
  }

  // FilterForm绑定到这里
  @Bind()
  bindForm(form) {
    this.form = form;
  }

  /**
   * fetchlist
   */
  @Bind()
  fetchList(page = {}) {
    const { dispatch, riskAssessmentList = {} } = this.props;
    const { pagination = {} } = riskAssessmentList;
    const formValues = this.form ? this.form.getFieldsValue() : {};
    const { supplierCompanyIdStash, ...vals } = formValues;
    const searchCondition = filterNullValueObject({
      ...vals,
      supplierCompanyId: supplierCompanyIdStash,
      customizeUnitCode: 'SQAM.INCOMING_UNINSPECTION.GRID,SQAM.INCOMING_UNINSPECTION.FILTER',
    });
    dispatch({
      type: 'incomingInspectionMaintain/fetchUnInspection',
      payload: { page: { ...pagination, ...page }, ...searchCondition },
    });
  }

  @Bind()
  async handleCreate() {
    const {
      remote,
      dispatch,
      history,
      incomingInspectionMaintain: { count = 0 },
    } = this.props;
    const { selectedRows = [] } = this.state;
    // 默认返回true,当返回false时走二开逻辑不走标准逻辑
    const cuxRes = await remote.event.fireEvent('cuxCreate', {selectedRows});
    if (!cuxRes) {
      return;
    }
    dispatch({
      type: 'incomingInspectionMaintain/quoteAndCreate',
      payload: selectedRows,
    }).then((res) => {
      if (res) {
        notification.success();
        history.push(`/sqam/incoming-inspection-maintain/detail/${res.inspectionId}`);
        dispatch({
          type: 'incomingInspectionMaintain/updateState',
          payload: { count: count - selectedRows.length },
        });
      }
    });
  }

  @Bind()
  handleRowSelected(selectedRowKeys, selectedRows) {
    this.setState({
      selectedRowKeys,
      selectedRows,
    });
  }

  /**
   * 获取form数据
   */
  @Bind()
  handleGetFormValue() {
    const filterForm = this.form;
    const filterValues = isUndefined(filterForm)
      ? {}
      : filterNullValueObject(filterForm.getFieldsValue());
    return filterValues;
  }

  /**
   * 查询是否值集
   */
  @Bind()
  queryFlagList() {
    const { dispatch } = this.props;
    dispatch({ type: 'incomingInspectionMaintain/queryFlagList' });
  }

  /**
   * 导出对应tab内容
   */
  @Bind()
  requestUrl() {
    const customizeUnitCode = 'SQAM.INCOMING_UNINSPECTION.FILTER,SQAM.INCOMING_UNINSPECTION.EXPORT';
    const requestUrl = `${SRM_SPUC}/v1/${organizationId}/rcv-trx-line/for-inspection/export?customizeUnitCode=${customizeUnitCode}`;
    return requestUrl;
  }

  render() {
    const {selectedRows=[], selectedRowKeys = [] } = this.state;
    const {
      remote,
      incomingInspectionMaintain = {},
      fetchListLoading = false,
      enumMap = {},
      customizeFilterForm,
      customizeTable,
      form,
      createLoading = false,
    } = this.props;
    const { unInspectionList = [], unInspectionPage = {} } = incomingInspectionMaintain;
    const fiterProps = {
      form,
      bindForm: this.bindForm,
      handleSearch: this.fetchList,
      enumMap,
      customizeFilterForm,
    };
    const tableProps = {
      dataSource: unInspectionList,
      loading: fetchListLoading,
      pagination: unInspectionPage,
      onFetchList: this.fetchList,
      rowKey: 'rcvTrxLineId',
      rowSelection: {
        selectedRowKeys,
        onChange: this.handleRowSelected,
      },
      customizeTable,
    };
    const queryParams = (this.form && this.handleGetFormValue()) || {};
    return (
      <React.Fragment>
        <Header
          title={intl.get(`${promptCode}.view.message.title.unInspectionMaterials`).d('待质检物料')}
          backPath="/sqam/incoming-inspection-maintain/list"
        >
          <Button
            icon="plus"
            type="primary"
            onClick={throttle(this.handleCreate, 1500, { trailing: false })}
            disabled={isEmpty(selectedRowKeys)}
            loading={createLoading}
          >
            {intl.get(`${promptCode}.view.button.createInspection`).d('创建质检单')}
          </Button>
          <ExcelExport
            requestUrl={this.requestUrl()}
            otherButtonProps={{ className: 'label-btn', type: 'primary' }}
            queryParams={
              isEmpty(selectedRowKeys)
                ? queryParams
                : {
                    ...queryParams,
                    spfmRcvTrxTypeCode: `RECEIVE_DELIVER`,
                    rcvTrxLineIds: selectedRowKeys,
                  }
            }
          />
          {remote&&remote.render("SQAM_INCOMING_INSPECTION_MAINTAIN_UNINSPECTION_HEADER_BTNS",null,{
            selectedRows,
            selectedRowKeys,
            onRefresh: this.fetchList,
          })}

        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm {...fiterProps} />
          </div>
          <ListTable {...tableProps} />
        </Content>
      </React.Fragment>
    );
  }
}
