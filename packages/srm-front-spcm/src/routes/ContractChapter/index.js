/*
 * @Description: index.js - 协议用章
 * @Author: MJQ <jiaqi.mao@hand-china.com>
 * @Date: 2019-08-13
 * @LastEditTime: 2024-10-23 15:59:26
 */
import React, { Fragment, Component } from 'react';
import { Button } from 'hzero-ui';
import { isUndefined, isArray } from 'lodash';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { parse, stringify } from 'querystring';
// import withCustomize from 'srm-front-cuz';
import hocRemote from 'utils/remote';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import { DATETIME_MIN } from 'utils/constants';
import intl from 'utils/intl';

import AsyncPagination from '@/routes/components/AsyncPagination';
import List from './List';
import Search from './Search';
import OperationRecordDrawer from '../components/OperationRecordDrawer';
import TextComparisonModal from '../components/TextComparisonModal';

const viewMessagePrompt = 'spcm.contractSign.view.message';

@connect(({ loading = {}, contractChapter = {} }) => ({
  queryListLoading: loading.effects['contractChapter/queryList'],
  contractChapter,
}))
@hocRemote({
  code: 'SPCM_CONTRACT_CHAPTER_VIEW_LIST',
  name: 'remote', // 默认 'remote'， 如有属性冲突可以改此属性
})
@formatterCollections({
  code: [
    'spcm.contractSign',
    'spcm.common',
    'entity.company',
    'entity.supplier',
    'entity.organization',
    'spcm.contractChapter',
    'entity.roles',
  ],
})
@withCustomize({
  unitCode: ['SPCM.CONTRACT.CHAPTER.LIST', 'SPCM.CONTRACT.CHAPTER.LIST.FILTER'],
})
export default class ContractChapter extends Component {
  constructor(props) {
    super(props);
    const {
      location: { search },
    } = this.props;
    const { pcHeaderId } = parse(search.substr(1));
    this.state = {
      pcHeaderId,
      selectedRows: [],
      selectedRowKeys: [],
      operationRecordVisible: false,
      tenantId: getCurrentOrganizationId(),
    };
  }

  componentDidMount() {
    const {
      location: { state: { _back } = {} },
      contractChapter: { pagination = {} },
    } = this.props;
    if (_back === -1) {
      this.fetchList(pagination);
    } else {
      this.fetchList();
    }
    this.fetchEnum(); // 查询值集
  }

  // 组件更新完成后调用，此时可以获取数据
  componentDidUpdate(prevProps, prevState, pcHeaderId) {
    if (pcHeaderId) {
      this.fetchList();
    }
  }

  /**
   * 查询值集
   */
  @Bind()
  fetchEnum() {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractChapter/init',
    });
  }

  /**
   * 预览协议
   */
  @Bind()
  preview() {
    const { dispatch } = this.props;
    const { selectedRows = [] } = this.state;
    const pcHeaderId = selectedRows.map((item) => item.pcHeaderId);
    const companyId = selectedRows.map((item) => item.companyId);
    dispatch(
      routerRedux.push({
        pathname: `/spcm/contract-chapter/detail`,
        search: pcHeaderId ? stringify({ pcHeaderId, companyId }) : null,
        hash: 'spcm-contract-sign-detail-contract-online-edit',
      })
    );
  }

  /**
   * 处理表单中的查询条件
   * @param {Object} filterValues
   */
  handleFormQuery(filterValues) {
    const dealTime = {};
    const timeArray = ['creationDateFrom', 'creationDateTo'];
    timeArray.forEach((item) => {
      dealTime[item] = filterValues[item] ? filterValues[item].format(DATETIME_MIN) : undefined;
    });
    const { pcTypeId, ...res } = filterValues;
    return {
      ...res,
      pcTypeIds: pcTypeId,
      ...dealTime,
    };
  }

  /* 操作记录Modal */
  @Bind()
  handleModalVisibleList(modalVisible, flag, otherParams = {}) {
    this.setState({ [modalVisible]: !!flag, ...otherParams });
  }

  /* 设置选中行 */
  @Bind()
  onRowSelectChange(selectedRowKeys, selectedRows) {
    this.setState({
      selectedRows,
      selectedRowKeys,
    });
  }

  /**
   * 跳转到明细页
   * @param {String} pcHeaderId
   */
  @Bind()
  redirectDetail(pcHeaderId, companyId) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/spcm/contract-chapter/detail`,
        search: pcHeaderId ? stringify({ pcHeaderId, companyId }) : null,
      })
    );
  }

  @Bind()
  fetchList(page = {}) {
    const { tenantId } = this.state;
    const { dispatch } = this.props;
    const formValue = this.filterForm.getFieldsValue();
    const filterValues = isUndefined(this.filterForm)
      ? {}
      : filterNullValueObject({
          ...formValue,
          supplierCompanyId: formValue.supplierCompanyDeputyId,
          supplierCompanyDeputyId: null,
        });
    const handleFormValues = this.handleFormQuery(filterValues);
    dispatch({
      type: 'contractChapter/queryList',
      payload: {
        page,
        tenantId,
        ...handleFormValues,
        ...filterNullValueObject({
          asyncCountFlag: 'DEFAULT',
          oldTotalElements: page.total ? page.total : '',
        }),
        customizeUnitCode: 'SPCM.CONTRACT.CHAPTER.LIST,SPCM.CONTRACT.CHAPTER.LIST.FILTER',
      },
    });
  }

  /**
   * 控制文本对比modal显隐
   * @param {*} pcHeaderId
   */
  @Bind()
  handleControlComparison(params) {
    const { textComparisonVisible } = this.state;
    this.setState({ textComparisonVisible: !textComparisonVisible, ...params });
  }

  @Bind()
  renderButtons() {
    const { selectedRows = [] } = this.state;
    const { remote } = this.props;
    const pcKindCodeFlag = selectedRows.some((item) =>
      ['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(item.pcKindCode)
    );
    const pcKindCodeNormalFlag =
      selectedRows.filter((item) => item.pcKindCode === 'NORMAL').length === 1;
    const buttons = [
      <Button
        icon="check"
        type="primary"
        disabled={
          (isArray(selectedRows) && selectedRows.length !== 1) ||
          pcKindCodeFlag ||
          !pcKindCodeNormalFlag
        }
        onClick={this.preview}
      >
        {intl.get(`${viewMessagePrompt}.previewTheAgreement`).d('预览协议')}
      </Button>,
    ];
    return remote
      ? remote.process('SPCM_CONTRACT_CHAPTER_VIEW_LIST_HEADERBUTTONS', buttons, {
          current: this,
        })
      : buttons;
  }

  render() {
    const {
      pcHeaderId,
      operationRecordVisible,
      selectedRowKeys = [],
      textComparisonVisible,
    } = this.state;
    const {
      remote,
      queryListLoading,
      customizeFilterForm,
      customizeTable,
      contractChapter: { dataSource, pagination, enumMap = {}, paginationLoading },
    } = this.props;
    const searchProps = {
      enumMap,
      customizeFilterForm,
      onFetchList: this.fetchList,
      onRef: (node) => {
        this.filterForm = node.props.form;
      },
    };

    const listProps = {
      remote,
      pcHeaderId,
      pagination: false,
      dataSource,
      selectedRowKeys,
      customizeTable,
      onSearch: this.fetchList,
      loading: queryListLoading,
      redirectDetail: this.redirectDetail,
      onRowSelectChange: this.onRowSelectChange,
      handleModalVisibleList: this.handleModalVisibleList,
      onControlTextComparison: this.handleControlComparison,
    };

    const operationRecordProps = {
      pcHeaderId,
      visible: operationRecordVisible,
      onHandleCancel: () => this.handleModalVisibleList('operationRecordVisible', false),
    };

    const textComparisonProps = {
      pcHeaderId,
      visible: textComparisonVisible,
      onCancel: this.handleControlComparison,
    };
    return (
      <Fragment>
        <Header
          title={intl.get(`spcm.contractChapter.view.message.title.contractChapter`).d('协议用章')}
        >
          {this.renderButtons()}
        </Header>
        <Content>
          <Search {...searchProps} />
          <List {...listProps} />
          <AsyncPagination
            {...pagination}
            loading={paginationLoading}
            onCustChange={(current, pageSize) =>
              this.fetchList({ ...pagination, current, pageSize })
            }
          />
        </Content>
        <OperationRecordDrawer {...operationRecordProps} />
        {textComparisonVisible && <TextComparisonModal {...textComparisonProps} />}
      </Fragment>
    );
  }
}
