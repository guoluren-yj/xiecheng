import React, { Fragment, Component } from 'react';
import { Form } from 'hzero-ui';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Bind } from 'lodash-decorators';
import { isEmpty, isUndefined, throttle } from 'lodash';
import DynamicButtons from '_components/DynamicButtons';
import remote from 'hzero-front/lib/utils/remote';
import ExcelExportPro from 'components/ExcelExportPro';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SQAM } from '_utils/config';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';

import FilterForm from './FilterForm';
import ListTable from './ListTable';

const promptCode = 'sqam.quoteIncomingInspection';

@connect(({ createClaim, loading }) => ({
  tenantId: getCurrentOrganizationId(),
  createClaim,
  fetchingLoader: loading.effects['createClaim/fetchQuoteData'],
  createLoading: loading.effects['createClaim/createClaimByInspection'],
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
  unitCode: [
    'SQAM.CREATE_CLAIM_LIST.TRX_QUOTE_FILTER',
    'SQAM.CREATE_CLAIM_LIST.QUOTE_FILTER',
    'SQAM.CREATE_CLAIM_LIST.QUOTE_BTNS',
  ],
})
@remote({
  code: 'SQAM_CREATE_CLAIM_LIST_QUOTE_CUX',
  name: 'remote',
})
@Form.create({ fieldNameProp: null })
export default class QuoteIncomingInspection extends Component {
  /**
   * Creates an instance of IndependentAccount.
   * @param {object} props 属性
   */
  constructor(props) {
    super(props);
    const {
      match: {
        params: { backFlag },
      },
    } = props;
    /**
     * 内部状态
     */
    this.state = {
      selectedRowKeys: [], // 选中行的
      backFlag,
      selectedRows: [],
    };
  }

  form;

  componentDidMount() {
    this.handleInit();
  }

  componentDidUpdate(prevProps) {
    // 个性化完成时触发
    const custChanged = prevProps.custLoading === true && this.props.custLoading === false;
    if (custChanged) {
      this.handleSearch();
    }
  }

  @Bind()
  async handleInit() {
    const { dispatch } = this.props;

    dispatch({ type: 'createClaim/init' });
  }

  @Bind()
  handleSearch(page = {}) {
    const { dispatch, tenantId } = this.props;
    const filterValues = !isUndefined(this.form) ? this.form.getFieldsValue() : {};
    const { supplierCompanyIdStash } = filterValues;
    dispatch({
      type: 'createClaim/fetchQuoteData',
      payload: {
        tenantId,
        query: {
          fromClaimFromFlag: 1,
          page,
          ...filterValues,
          supplierCompanyId: supplierCompanyIdStash,
        },
      },
    });
  }

  /**
   * 添加选中行到状态树
   * @param {arr} selectedRowKeys
   */
  @Bind()
  handleRowChange(selectedRowKeys, selectedRows) {
    this.setState({
      selectedRowKeys,
      selectedRows,
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
    const { dispatch } = this.props;
    const { selectedRowKeys = [] } = this.state;
    dispatch({
      type: 'createClaim/createClaimByInspection',
      payload: selectedRowKeys,
    }).then((res) => {
      if (res) {
        const { formHeaderId } = res;
        notification.success();
        dispatch(
          routerRedux.push({
            pathname: `/sqam/createClaim/detail/${formHeaderId}`,
          })
        );
      }
    });
  }

  @Bind()
  getExportDetailParams() {
    const { selectedRowKeys } = this.state;
    const filterValues = isEmpty(selectedRowKeys)
      ? !isUndefined(this.form)
        ? this.form.getFieldsValue()
        : {}
      : { inspectionIds: selectedRowKeys };
    const { supplierCompanyIdStash, creationDateFrom, creationDateTo } = filterValues;
    return {
      ...filterValues,
      fromClaimFromFlag: 1,
      supplierCompanyId: supplierCompanyIdStash,
      creationDateFrom: creationDateFrom && creationDateFrom.format(DEFAULT_DATETIME_FORMAT),
      creationDateTo: creationDateTo && creationDateTo.format(DEFAULT_DATETIME_FORMAT),
    };
  }

  @Bind()
  headerBtns() {
    const { createLoading, remote: remoteProps, tenantId } = this.props;
    const { selectedRowKeys, selectedRows } = this.state;
    const allBtns = [
      {
        name: 'create',
        child: intl.get(`${promptCode}.view.button.quoteCreate`).d('引用创建'),
        btnProps: {
          type: 'primary',
          icon: 'plus',
          onClick: throttle(this.handleQuoteAndCreate, 1500, { trailing: false }),
          loading: createLoading,
          disabled: isEmpty(selectedRowKeys),
        },
      },
      {
        name: 'newExports',
        btnComp: ExcelExportPro,
        childFor: 'buttonText',
        child: !isEmpty(selectedRowKeys)
          ? intl.get('hzero.common.button.newSelectedExport').d('(新)勾选导出')
          : intl.get('hzero.common.button.newExport').d('(新)导出'),
        btnProps: {
          otherButtonProps: {
            icon: 'unarchive',
          },
          requestUrl: `${SRM_SQAM}/v1/${tenantId}/incoming-inspections/export/new?customizeUnitCode=SQAM.CREATE_CLAIM_LIST.QUOTE_FILTER,SQAM.CREATE_CLAIM_LIST.QUOTE_GRID`,
          queryParams: this.getExportDetailParams(),
          templateCode: 'SQAM_INCOMING_INSPECTION_PURCHASER_EXPORT',
          method: 'POST',
          allBody: true,
        },
      },
    ];
    const otherProps = {
      selectedRowKeys,
      handleSearch: this.handleSearch,
      selectedRows,
      handleRowChange: this.handleRowChange,
    };
    return remoteProps
      ? remoteProps.process('SQAM_CREATE_CLAIM_LIST_QUOTE_CUX_BTNS', allBtns, otherProps)
      : allBtns;
  }

  render() {
    const { selectedRowKeys, isSelectTx, backFlag } = this.state;
    const {
      tenantId,
      fetching,
      fetchingLoader,
      customizeBtnGroup,
      createClaim: { quoteTrxList, quoteTrxPage, enumMap = {} },
      form,
      customizeFilterForm,
    } = this.props;
    const { dateRangeList = [] } = enumMap;
    const filterProps = {
      tenantId,
      loading: fetching,
      onRef: this.handleBindRef,
      onSearch: this.handleSearch,
      backFlag,
      isSelectTx,
      trxLoading: fetchingLoader,
      decisionResult: this.props.createClaim.enumMap.decisionResult,
      inspectionType: this.props.createClaim.enumMap.inspectionType,
      form,
      customizeFilterForm,
      dateRangeList,
    };
    const listProps = {
      loading: fetching,
      trxLoading: fetchingLoader,
      dataSource: quoteTrxList,
      pagination: quoteTrxPage,
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
          title={intl
            .get(`${promptCode}.view.message.title.quoteIncomingInspection`)
            .d('引用检验单')}
          backPath="/sqam/createClaim/list"
        >
          {customizeBtnGroup(
            { code: 'SQAM.CREATE_CLAIM_LIST.QUOTE_BTNS', pro: true },
            <DynamicButtons buttons={this.headerBtns()} />
          )}
        </Header>
        <Content>
          <FilterForm {...filterProps} />
          <ListTable {...listProps} />
        </Content>
      </Fragment>
    );
  }
}
