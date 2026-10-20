import React, { Fragment, PureComponent } from 'react';
import { Button, Form } from 'hzero-ui';
import moment from 'moment';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Bind } from 'lodash-decorators';
import { isEmpty, isUndefined, throttle } from 'lodash';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { fetchSettingValue } from '@/services/create8DService';

import FilterForm from './FilterForm';
import ListTable from './ListTable';

const promptCode = 'sqam.quoteIncomingInspection';

@connect(({ create8D, loading }) => ({
  create8D,
  fetching: loading.effects['create8D/fetchQuoteData'],
  fetchingLoader: loading.effects['create8D/fetchTrxHeader'],
  tenantId: getCurrentOrganizationId(),
  createLoading:
    loading.effects['create8D/quoteAndCreate'] || loading.effects['create8D/trxQuoteAndCreate'],
}))
@formatterCollections({
  code: [
    'sqam.quoteIncomingInspection',
    'entity.supplier',
    'entity.item',
    'entity.company',
    'entity.organization',
    'hzero.common',
    'sqam.common',
  ],
})
@withCustomize({
  unitCode: ['SQAM.CREATE_8D_LIST.TRX_QUOTE_FILTER', 'SQAM.CREATE_8D_LIST.QUOTE_FILTER'],
})
@Form.create({ fieldNameProp: null })
export default class QuoteIncomingInspection extends PureComponent {
  /**
   * Creates an instance of IndependentAccount.
   * @param {object} props 属性
   */
  constructor(props) {
    super(props);
    const { affairFlag, backFlag } = props;
    /**
     * 内部状态
     */
    this.state = {
      selectedRowKeys: [], // 选中行的
      isSelectTx: affairFlag,
      backFlag,
      initedFlag: false,
    };
  }

  form;

  componentDidMount() {
    this.handleInit();
  }

  componentDidUpdate(prevProps, prevState) {
    // 业务规则查询完成时触发
    const initChanged = this.state.initedFlag === true && prevState.initedFlag === false;
    // 个性化完成时触发
    const custChanged = prevProps.custLoading === true && this.props.custLoading === false;
    if (initChanged && this.props.custLoading === false) {
      this.handleSearch();
    } else if (custChanged && this.state.initedFlag === true) {
      this.handleSearch();
    }
  }

  @Bind()
  async handleInit() {
    const { dispatch, tenantId } = this.props;
    const resLov = await dispatch({ type: 'create8D/fetchLov' });
    // 查询配置中心是否勾选
    const res010703 = getResponse(
      await fetchSettingValue({
        tenantId,
        settingCode: '010703',
      })
    );
    // 查询决策结果是否配置
    const resResult = await dispatch({
      type: 'create8D/fetchIncomingSearch',
      payload: { tenantId },
    });
    const allDecisionResult = resResult
      .map((item) => item.decisionResult)
      .filter((i) => !isEmpty(i))
      .join();
    const allAssessmentResult = resResult.map((item) => item.assessmentResult);
    dispatch({
      type: 'create8D/updateState',
      payload: {
        decisionResult:
          res010703.settingValue === '0' || isEmpty(allDecisionResult)
            ? resLov.decisionResult
            : resLov.decisionResult.filter((item) => allDecisionResult.includes(item.value)),
        assessmentResult:
          res010703.settingValue === '0' || isEmpty(allAssessmentResult)
            ? resLov.assessmentResult
            : resLov.assessmentResult.filter((item) => allAssessmentResult.includes(item.value)),
      },
    });
    this.setState({ initedFlag: true });
  }

  @Bind()
  handleSearch(page = {}) {
    const { dispatch, tenantId, create8D, backFlag, nodeConfigId } = this.props;
    const { isSelectTx } = this.state;

    const filterValues = !isUndefined(this.form) ? this.form.getFieldsValue() : {};
    const {
      trxDateStart,
      trxDateEnd,
      decisionResult,
      creationDateFrom,
      creationDateTo,
      supplierCompanyIdStash,
      ...values
    } = filterValues;
    const decisionResults = (create8D.decisionResult || []).map((item) => item.value);
    const assessmentResults = (create8D.assessmentResult || []).map((item) => item.value);
    if (!isSelectTx) {
      dispatch({
        type: 'create8D/fetchQuoteData',
        payload: {
          tenantId,
          query: {
            page,
            ...values,
            decisionResults: decisionResult ? [decisionResult] : decisionResults,
            assessmentResults,
            createProblemFlag: 1,
            supplierCompanyId: supplierCompanyIdStash,
            creationDateFrom: creationDateFrom && moment(creationDateFrom).format(DATETIME_MIN),
            creationDateTo: creationDateTo && moment(creationDateTo).format(DATETIME_MAX),
            customizeUnitCode: 'SQAM.CREATE_8D_LIST.QUOTE_FILTER,SQAM.CREATE_8D_LIST.QUOTE_GRID',
          },
        },
      });
    } else {
      dispatch({
        type: 'create8D/fetchTrxHeader',
        payload: {
          tenantId,
          query: {
            page,
            ...values,
            edProblemIgnoreFlag: 1,
            withOutAuthFlag: 1,
            nodeConfigId,
            returnedFlag: backFlag || undefined,
            supplierCompanyId: supplierCompanyIdStash,
            trxDateStart: trxDateStart && moment(trxDateStart).format(DATETIME_MIN),
            trxDateEnd: trxDateEnd && moment(trxDateEnd).format(DATETIME_MAX),
            customizeUnitCode:
              'SQAM.CREATE_8D_LIST.TRX_QUOTE_FILTER,SQAM.CREATE_8D_LIST.TRX_QUOTE_LIST',
          },
        },
      });
    }
  }

  /**
   * 添加选中行到状态树
   * @param {arr} selectedRowKeys
   */
  @Bind()
  handleRowChange(selectedRowKeys) {
    this.setState({
      selectedRowKeys,
    });
  }

  /**
   * 传递表单参数
   * @param {object} ref - FilterForm对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  @Bind()
  handleQuoteAndCreate() {
    const { dispatch, tenantId } = this.props;
    const { selectedRowKeys = [], isSelectTx } = this.state;
    if (!isSelectTx) {
      dispatch({
        type: 'create8D/quoteAndCreate',
        payload: {
          tenantId,
          body: { inspectionIds: selectedRowKeys.join() },
        },
      }).then((res) => {
        if (res) {
          const { problemHeaderId } = res;
          notification.success();
          dispatch(
            routerRedux.push({
              pathname: `/sqam/create8D/detail/${problemHeaderId}`,
            })
          );
        }
      });
    } else {
      dispatch({
        type: 'create8D/trxQuoteAndCreate',
        payload: {
          tenantId,
          body: { rcvTrxLineIds: selectedRowKeys.join() },
        },
      }).then((res) => {
        if (res) {
          const { problemHeaderId } = res;
          notification.success();
          dispatch(
            routerRedux.push({
              pathname: `/sqam/create8D/detail/${problemHeaderId}`,
            })
          );
        }
      });
    }
  }

  render() {
    const { selectedRowKeys, isSelectTx, backFlag } = this.state;
    const {
      tenantId,
      fetching,
      fetchingLoader,
      createLoading,
      create8D: {
        quoteList,
        quotePage,
        decisionResult,
        quoteTrxList,
        quoteTrxPage,
        dateRangeList,
        flagList,
      },
      form,
      customizeFilterForm,
    } = this.props;
    const loading = fetching || fetchingLoader || createLoading;
    const filterProps = {
      tenantId,
      decisionResult,
      loading: fetching,
      onRef: this.handleBindRef,
      onSearch: this.handleSearch,
      backFlag,
      isSelectTx,
      trxLoading: fetchingLoader,
      form,
      customizeFilterForm,
      dateRangeList,
      flagList,
    };
    const listProps = {
      loading: fetching,
      trxLoading: fetchingLoader,
      dataSource: quoteList,
      pagination: quotePage,
      dataTrxSource: quoteTrxList,
      paginationTrx: quoteTrxPage,
      onSearch: this.handleSearch,
      rowSelection: {
        selectedRowKeys,
        onChange: this.handleRowChange,
      },
      isSelectTx,
    };
    return (
      <Fragment>
        <Header
          title={
            isSelectTx
              ? intl.get(`sqam.common.view.message.createincomingaffair`).d('引用质检事务创建')
              : intl
                  .get(`${promptCode}.view.message.title.quoteIncomingInspection`)
                  .d('引用检验单创建')
          }
          backPath="/sqam/create8D/list"
        >
          <Button
            type="primary"
            icon="plus"
            onClick={throttle(this.handleQuoteAndCreate, 1500, { trailing: false })}
            disabled={isEmpty(selectedRowKeys)}
            loading={loading}
          >
            {intl.get(`${promptCode}.view.button.quoteCreate`).d('引用创建')}
          </Button>
        </Header>
        <Content>
          <FilterForm {...filterProps} />
          <ListTable {...listProps} />
        </Content>
      </Fragment>
    );
  }
}
