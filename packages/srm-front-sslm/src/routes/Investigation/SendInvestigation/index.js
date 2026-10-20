/*
 * SendInvestigation - 我发出的调查表
 * @date: 2018/08/08 14:07:49
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { connect } from 'dva';
import PropTypes from 'prop-types';
import { isUndefined, isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import querystring from 'querystring';
import { Modal } from 'hzero-ui';

import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import ExcelExport from 'components/ExcelExport';
import ExcelExportPro from 'components/ExcelExportPro';
import { downloadFile } from 'hzero-front/lib/services/api';
import DynamicButtons from '_components/DynamicButtons';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { Content, Header } from 'components/Page';
import { DATETIME_MIN } from 'utils/constants';
import { Button as PerButton } from 'components/Permission';
import FilterForm from './FilterForm';
import ListTable from './ListTable';

const organizationId = getCurrentOrganizationId();
const customizeUnitCode = 'SSLM.SEND_INVESTIGATION.LIST_QUERY,SSLM.SEND_INVESTIGATION.LIST_TABLE';

/**
 * 我发出的调查表页面
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} invitationList - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@connect(({ loading, sendInvestigation }) => ({
  allLoading:
    loading.effects['sendInvestigation/checkInvestigation'] ||
    loading.effects['sendInvestigation/handleCancel'] ||
    loading.effects['sendInvestigation/fetchSendList'] ||
    loading.effects['sendInvestigation/handleDetailExport'],
  sendInvestigation,
}))
@formatterCollections({
  code: ['sslm.common', 'sslm.investigationCorrelation', 'sslm.investigCorrelat'],
})
@withCustomize({
  unitCode: [
    'SSLM.SEND_INVESTIGATION.LIST_QUERY',
    'SSLM.SEND_INVESTIGATION.LIST_TABLE',
    'SSLM.SEND_INVESTIGATION.LIST_BTNGROUP',
  ],
})
export default class SendInvestigation extends Component {
  constructor(props) {
    super(props);
    const routerParam = querystring.parse(props.location.search.substr(1));
    const { partnerCompanyId, partnerCompanyName } = routerParam;
    this.state = {
      selectedRows: [],
      partnerCompanyId,
      partnerCompanyName,
    };
  }

  static propTypes = {
    dispatch: PropTypes.func,
  };

  static defaultProps = {
    dispatch: e => e,
  };

  componentDidMount() {
    const {
      location: { state: { _back } = {} },
      sendInvestigation: { pagination = {} },
    } = this.props;

    this.props.dispatch({
      type: 'sendInvestigation/init',
    });

    if (_back === -1) {
      this.handleSearch(pagination);
    } else {
      const { partnerCompanyId, partnerCompanyName } = this.state;
      const form = isUndefined(this.filterForm) ? {} : this.filterForm;
      const { setFieldsValue = () => {} } = form;
      setFieldsValue({
        partnerCompanyId,
        partnerCompanyName,
      });
      this.handleSearch();
    }
  }

  getSnapshotBeforeUpdate(prevProps, prevState) {
    const { location } = this.props;
    const routerParam = querystring.parse(location.search.substr(1));
    const { partnerCompanyId, partnerCompanyName } = routerParam;
    if (partnerCompanyId !== prevState.partnerCompanyId) {
      this.setState({
        partnerCompanyId,
        partnerCompanyName,
      });
    }
    return partnerCompanyId !== prevState.partnerCompanyId;
  }

  componentDidUpdate(preProps, preState) {
    const { partnerCompanyId, partnerCompanyName } = this.state;
    if (preState.partnerCompanyId !== partnerCompanyId) {
      const form = isUndefined(this.filterForm) ? {} : this.filterForm;
      const { setFieldsValue = () => {} } = form;
      setFieldsValue({
        partnerCompanyId,
        partnerCompanyName,
      });
      this.handleSearch();
    }
  }

  /**
   * 查询邀约汇总列表
   * @param {Object} page 查询字段
   */
  @Bind()
  handleSearch(page) {
    const { dispatch } = this.props;
    const filterValues = isUndefined(this.filterForm)
      ? {}
      : filterNullValueObject(this.filterForm.getFieldsValue());
    const { startDate, endDate } = filterValues;
    dispatch({
      type: 'sendInvestigation/fetchSendList',
      payload: {
        page,
        ...filterValues,
        startDate: startDate ? startDate.format(DATETIME_MIN) : undefined,
        endDate: endDate ? endDate.format(DATETIME_MIN) : undefined,
        customizeUnitCode,
      },
    });
  }

  /**
   * 导出参数
   * @param {Object} page 查询字段
   */
  @Bind()
  handleParams() {
    const filterValues = isUndefined(this.filterForm) ? {} : this.filterForm.getFieldsValue();
    const { startDate, endDate } = filterValues;
    const { selectedRows } = this.state;
    return filterNullValueObject({
      ...filterValues,
      startDate: startDate ? startDate.format(DATETIME_MIN) : undefined,
      endDate: endDate ? endDate.format(DATETIME_MIN) : undefined,
      investgHeaderIds: selectedRows.map(n => n.investgHeaderId),
    });
  }

  @Bind()
  onHandleToDetail({ investgHeaderId, investigateTemplateId }) {
    const search = querystring.stringify({
      investgHeaderId,
      investigateTemplateId,
    });
    this.props.history.push({
      pathname: `/sslm/investigation-send/detail`,
      search,
    });
  }

  /**
   * 选中项发生改变的回调
   */
  @Bind()
  handleSelectChang(selectedRowKeys, selectedRows) {
    this.setState({ selectedRows });
    const {
      dispatch,
      sendInvestigation: { investigationList },
    } = this.props;
    // 勾选行增加selectable属性，用于个性化获取勾选行
    const newList = investigationList.map(data => ({
      ...data,
      selectable: selectedRowKeys.includes(data.investgHeaderId),
    }));
    dispatch({
      type: 'sendInvestigation/updateState',
      payload: {
        investigationList: newList,
      },
    });
  }

  /**
   * 取消
   */
  @Bind()
  cancelCallBack() {
    const {
      dispatch,
      sendInvestigation: { pagination = {} },
    } = this.props;
    const { selectedRows } = this.state;
    dispatch({
      type: 'sendInvestigation/handleCancel',
      payload: selectedRows.map(n => n.investgHeaderId),
    }).then(response => {
      if (response) {
        this.handleSearch(pagination);
        this.setState({ selectedRows: [] });
      }
    });
  }

  /**
   * 取消按钮回调
   * sevenFlag - 调查表发布是否超过7天
   * inviteFlag - 是否是邀约调查表
   * allFlag - 是否是邀约调查表 且 调查表发布是否超过7天
   */
  @Bind()
  handleCancel() {
    const { selectedRows } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'sendInvestigation/checkInvestigation',
      payload: selectedRows.map(n => n.investgHeaderId),
    }).then(res => {
      if (res) {
        const { sevenFlag, inviteFlag, allFlag } = res;
        if (sevenFlag || inviteFlag || allFlag) {
          Modal.confirm({
            title: allFlag
              ? intl
                  .get('sslm.investigationCorrelation.view.message.allWarn')
                  .d('发布未超过七天的邀约调查表取消后，邀约将被拒绝，是否确认取消？')
              : inviteFlag
              ? intl
                  .get('sslm.investigationCorrelation.view.message.inviteWarn')
                  .d('邀约调查表取消后，该邀约将被拒绝，是否确认取消？')
              : intl
                  .get('sslm.investigationCorrelation.view.message.sevenWarn')
                  .d('调查表发布未超过七天，是否确认取消？'),
            onOk: this.cancelCallBack,
          });
        } else {
          this.cancelCallBack();
        }
      }
    });
  }

  /**
   * 详情导出
   */
  @Bind()
  handleDetailExport() {
    const { selectedRows } = this.state;
    const { dispatch } = this.props;
    const payload = selectedRows.map(n => ({
      investgHeaderId: n.investgHeaderId,
      investgNumber: n.investgNumber,
      investigateTemplateId: n.investigateTemplateId,
      templateCode: n.templateCode,
      templateName: n.templateName,
      versionNumber: n.versionNumber,
      partnerCompanyName: n.partnerCompanyName,
    }));
    dispatch({
      type: 'sendInvestigation/handleDetailExport',
      payload,
    }).then(res => {
      if (res) {
        downloadFile({ requestUrl: res });
      }
    });
  }

  render() {
    const { selectedRows } = this.state;
    const {
      sendInvestigation: {
        pagination,
        investigationList,
        inviteType,
        investigateTypes,
        investigateTemList,
        processStatusList,
      },
      allLoading,
      customizeFilterForm,
      customizeTable,
      custLoading,
      customizeBtnGroup,
    } = this.props;
    const filterProps = {
      inviteType,
      custLoading,
      customizeFilterForm,
      investigateTypes,
      investigateTemList,
      processStatusList,
      onFilterChange: this.handleSearch,
      onRef: node => {
        this.filterForm = node.props.form;
      },
    };
    const listProps = {
      pagination,
      dataSource: investigationList,
      loading: allLoading,
      selectedRows,
      custLoading,
      customizeTable,
      editLine: this.editLine,
      searchPaging: this.handleSearch,
      handleToDetail: this.onHandleToDetail,
      handleSelectChang: this.handleSelectChang,
    };

    const isCancle =
      isEmpty(selectedRows) ||
      !isEmpty(
        selectedRows.filter(
          n =>
            (n.processStatus !== 'RELEASE' && n.processStatus !== 'REJECT') ||
            (['RELEASE', 'REJECT'].includes(n.processStatus) &&
              n.mainInvestigateFlag === 0 &&
              n.mergerInvestigateFlag === 1)
        )
      );

    const buttons = [
      {
        name: 'invSendCancle',
        btnProps: {
          onClick: () => this.handleCancel(),
          icon: 'close',
          type: 'primary',
          disabled: isCancle,
          loading: allLoading,
        },
        child: intl.get('hzero.common.button.cancel').d('取消'),
      },
      {
        name: 'invSendExportPro',
        btnComp: ExcelExportPro,
        btnProps: {
          requestUrl: `${SRM_SSLM}/v1/${organizationId}/investigate/sending/export`,
          queryParams: () => this.handleParams(),
          otherButtonProps: {
            loading: allLoading,
            permissionList: [
              {
                code:
                  'srm.partner.investigation-po.my-sent-investigatation.ps.investigate.send.export.new',
                type: 'button',
                meaning: '我发出的调查表-导出',
              },
            ],
          },
          buttonText: intl.get('hzero.common.button.newExport').d('(新)导出'),
          templateCode: 'SRM_C_SRM_SSLM_INVESTG_HEADER_LIST',
        },
      },
      {
        name: 'invSendExport',
        btnComp: ExcelExport,
        btnProps: {
          requestUrl: `${SRM_SSLM}/v1/${organizationId}/investigate/sending/export`,
          queryParams: () => this.handleParams(),
          otherButtonProps: {
            icon: 'unarchive',
            type: 'c7n-pro',
            loading: allLoading,
            permissionList: [
              {
                code:
                  'srm.partner.investigation-po.my-sent-investigatation.ps.investigate.send.export.old',
                type: 'button',
                meaning: '我发出的调查表-导出',
              },
            ],
          },
        },
      },
      {
        name: 'detailExportPro',
        btnComp: PerButton,
        btnProps: {
          onClick: () => this.handleDetailExport(),
          icon: 'export',
          type: 'c7n-pro',
          loading: allLoading,
          disabled: selectedRows.length < 1,
          permissionList: [
            {
              code: 'srm.partner.investigation-po.my-sent-investigatation.button.detail.export',
              type: 'button',
              meaning: '我发出的调查表-详情导出',
            },
          ],
        },
        child: intl.get('sslm.investigationCorrelation.button.detailExport').d('详情导出'),
      },
    ];

    return (
      <React.Fragment>
        <Header
          title={intl
            .get(`sslm.investigationCorrelation.view.title.sendInvestigation`)
            .d('我发出的调查表')}
        >
          {customizeBtnGroup(
            {
              code: 'SSLM.SEND_INVESTIGATION.LIST_BTNGROUP',
              pro: true,
            },
            <DynamicButtons buttons={buttons} />
          )}
        </Header>
        <Content>
          <FilterForm {...filterProps} />
          <ListTable {...listProps} />
        </Content>
      </React.Fragment>
    );
  }
}
