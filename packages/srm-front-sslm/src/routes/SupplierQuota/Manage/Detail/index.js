/**
 * Detail - 供应商配额管理-详情
 * @date: 2020-06-15
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import moment from 'moment';
import { connect } from 'dva';
import { isEmpty, uniqBy } from 'lodash';
import { Bind } from 'lodash-decorators';
import React, { Component, Fragment } from 'react';
import { Form, Spin } from 'hzero-ui';

import intl from 'utils/intl';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import notification from 'utils/notification';
import { getEditTableData } from 'utils/utils';
import { Header, Content } from 'components/Page';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';
import { Button as PermissionButton } from 'components/Permission';
import DynamicButtons from '_components/DynamicButtons';
import remote from 'hzero-front/lib/utils/remote';

import HeaderInfo from './HeaderInfo';
import AsignTable from './AsignTable';

const customizeUnitCode = 'SSLM.SUPPLIER_QUOTA_MANAGE.HEADER,SSLM.SUPPLIER_QUOTA_MANAGE.LINE';

@formatterCollections({
  code: ['sslm.supplierQuotaManage'],
})
@connect(({ supplierQuota, loading }) => ({
  supplierQuota,
  saveLoading: loading.effects['supplierQuota/allSave'],
  releaseLoading: loading.effects['supplierQuota/handleRelease'],
  headerInfoLoading: loading.effects['supplierQuota/fetchHeaderInfo'],
  quotaAsignLoading: loading.effects['supplierQuota/fetchQuotaAsign'],
  saveQuotaLoading: loading.effects['supplierQuota/saveQuotaAsign'],
  deleteQuotaLoading: loading.effects['supplierQuota/deleteQuotaAsign'],
}))
@Form.create({ fieldNameProp: null })
@withCustomize({
  unitCode: [
    'SSLM.SUPPLIER_QUOTA_MANAGE.HEADER',
    'SSLM.SUPPLIER_QUOTA_MANAGE.LINE',
    'SSLM.SUPPLIER_QUOTA_MANAGE.LINE_BTNGROUP',
    'SSLM.SUPPLIER_QUOTA_MANAGE.HEADER_BTNGROUP',
  ],
})
@remote({
  code: 'SSLM_SUPPLIER_QUOTA_MANAGE_DETAIL',
  name: 'supQuotaManageRemote',
})
export default class Detail extends Component {
  constructor(props) {
    super(props);
    const { match: { params: { quotaHeaderId, evalStatus } = {} } = {} } = this.props;
    this.state = {
      evalStatus,
      quotaHeaderId,
      quotaAsignList: [], // 配额分配列表
      companyId: null,
    };
  }

  componentDidMount() {
    const { quotaHeaderId } = this.state;
    this.init();
    if (quotaHeaderId) {
      this.handleHeaderInfo();
      this.handleQuotaAsign();
    }
  }

  /**
   * 值集查询
   */
  @Bind()
  init() {
    const { dispatch } = this.props;
    const payload = {
      controlMethodList: 'SSLM.QUOTA_CONTROL_METHOD',
      effectiveCycle: 'SSLM.QUOTA_VALID_CYCLE',
    };
    dispatch({
      type: 'supplierQuota/init',
      payload,
    });
  }

  asignTable = {}; // 配额分配

  componentWillMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'supplierQuota/updateState',
      payload: {
        headerInfo: {},
      },
    });
    this.changeState({ quotaAsignList: [] });
  }

  /**
   * 查询头信息
   */
  @Bind()
  handleHeaderInfo() {
    const { dispatch } = this.props;
    const { quotaHeaderId } = this.state;
    dispatch({
      type: 'supplierQuota/fetchHeaderInfo',
      payload: {
        quotaHeaderId,
        customizeUnitCode: 'SSLM.SUPPLIER_QUOTA_MANAGE.HEADER',
      },
    }).then(res => {
      if (res && res.companyId) {
        this.setState({ companyId: res.companyId });
      }
    });
  }

  /**
   * 改变quotaAsignList的值
   */
  @Bind()
  changeState(state = {}) {
    this.setState(state);
  }

  /**
   * 查询配额分配
   */
  @Bind()
  handleQuotaAsign() {
    const { dispatch } = this.props;
    const { quotaHeaderId } = this.state;
    dispatch({
      type: 'supplierQuota/fetchQuotaAsign',
      payload: {
        quotaHeaderId,
        customizeUnitCode: 'SSLM.SUPPLIER_QUOTA_MANAGE.LINE',
      },
    }).then(res => {
      if (res) {
        this.changeState({ quotaAsignList: res });
        if (this.asignTableRef) {
          this.asignTableRef.setState({
            selectedRows: [],
            selectedRowKeys: [],
          });
        }
      }
    });
  }

  /**
   * 删除配额分配行
   */
  @Bind()
  handleDelete(payload) {
    const { dispatch } = this.props;
    dispatch({
      type: 'supplierQuota/deleteQuotaAsign',
      payload,
    }).then(res => {
      if (res) {
        notification.success();
        this.handleQuotaAsign();
      }
    });
  }

  /**
   * 保存配额分配行
   */
  @Bind()
  handleListSave(tableValues) {
    const { dispatch } = this.props;
    const { quotaHeaderId } = this.state;
    dispatch({
      type: 'supplierQuota/saveQuotaAsign',
      payload: {
        quotaHeaderId,
        tableValues,
        customizeUnitCode: 'SSLM.SUPPLIER_QUOTA_MANAGE.LINE',
      },
    }).then(res => {
      if (res) {
        notification.success();
        this.handleQuotaAsign();
      }
    });
  }

  /**
   * 头部大保存/发布
   */
  @Bind()
  handleSaveAndRelease(flag) {
    const {
      form,
      dispatch,
      history,
      supplierQuota: { headerInfo = {} },
    } = this.props;
    const { quotaHeaderId } = this.state;
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { effectiveDateFrom: newStartDate, effectiveDateTo: newEndDate } = values;
        const effectiveDateFrom = newStartDate && moment(newStartDate).format(DATETIME_MIN);
        const effectiveDateTo = newEndDate && moment(newEndDate).format(DATETIME_MAX);
        // 获取配额分配表格数据
        const { quotaAsignList } = this.state;
        const tableValues = getEditTableData(quotaAsignList);
        // 判断数据是否有修改
        const isEditing = !!quotaAsignList.find(
          n => n._status === 'create' || n._status === 'update'
        );
        // 检测到有修改，tableValues为空，说明校验未通过
        if (isEditing && isEmpty(tableValues)) return;

        // 后端需校验	配额比是否为100 故要传整个列表
        const supplierQuotaLines = uniqBy(
          [
            ...tableValues,
            ...quotaAsignList.filter(n => n._status !== 'create'), // 过滤state中新建的数据
          ],
          'quotaLineId'
        ).map(n => {
          const { _status, $form, quotaLineId, ...rest } = n;
          if (_status === 'create') {
            return rest;
          } else {
            return { quotaLineId, ...rest };
          }
        });

        const payload = {
          ...headerInfo,
          ...values,
          effectiveDateFrom,
          effectiveDateTo,
          itemId: values.itemId ? values.itemId : null, // 当品类／物料只维护名称时，需给后端传null
          itemCategoryId: values.itemCategoryId ? values.itemCategoryId : null,
          supplierQuotaLines,
          customizeUnitCode,
        };
        const type = flag ? 'supplierQuota/allSave' : 'supplierQuota/handleRelease';
        dispatch({
          type,
          payload,
        }).then(res => {
          if (res) {
            const { quotaHeaderId: newQuotaHeaderId, evalStatus } = res;
            if (newQuotaHeaderId) {
              history.push(
                flag
                  ? `/sslm/supplier-quota-manage/detail/${newQuotaHeaderId}/${evalStatus}`
                  : `/sslm/supplier-quota-manage/list`
              );
            }
            notification.success();
            if (quotaHeaderId) {
              this.handleHeaderInfo();
              this.handleQuotaAsign();
            }
          }
        });
      }
    });
  }

  setCompanyId = companyId => {
    const { quotaAsignList, evalStatus } = this.state;
    const isEdit = evalStatus === 'NEW' || evalStatus === 'UPDATAED' || evalStatus === undefined;
    if (isEdit && Array.isArray(quotaAsignList)) {
      const newQuotaAsignList = quotaAsignList.map(item => {
        return {
          ...item,
          supplierId: null,
          supplierNum: null,
          supplierName: null,
          _status: 'update',
        };
      });
      this.setState({ quotaAsignList: newQuotaAsignList });
    }
    this.setState({ companyId });
  };

  render() {
    const {
      form,
      history,
      supplierQuota: {
        headerInfo = {},
        code: { controlMethodList = [], effectiveCycle = [] },
      },
      saveLoading,
      releaseLoading,
      headerInfoLoading,
      quotaAsignLoading,
      saveQuotaLoading,
      deleteQuotaLoading,
      customizeForm,
      customizeTable,
      customizeBtnGroup,
      supQuotaManageRemote,
    } = this.props;
    const { quotaAsignList, quotaHeaderId, evalStatus, companyId } = this.state;
    const isEdit = [undefined, 'NEW', 'UPDATAED', 'REJECTED'].includes(evalStatus);
    const headerInfoProps = {
      form,
      history,
      headerInfo,
      evalStatus,
      customizeForm,
      controlMethodList,
      effectiveCycle,
      supQuotaManageRemote,
      setCompanyId: this.setCompanyId,
    };
    const asignTableProps = {
      isEdit,
      evalStatus,
      companyId,
      customizeTable,
      quotaAsignList,
      saveQuotaLoading,
      deleteQuotaLoading,
      customizeBtnGroup,
      remote: supQuotaManageRemote,
      customizeBtnGroupCode: 'SSLM.SUPPLIER_QUOTA_MANAGE.LINE_BTNGROUP',
      onDelete: this.handleDelete,
      onSave: this.handleListSave,
      changeState: this.changeState,
      onRef: node => {
        this.asignTableRef = node;
      },
    };

    const buttons = [
      isEdit && {
        name: 'save',
        btnComp: PermissionButton,
        child: intl.get('hzero.common.button.save').d('保存'),
        btnProps: {
          type: 'c7n-pro',
          color: 'primary',
          permissionList: [
            {
              code: `srm.partner.supplier-quota-manage.manage.ps.new-detail-save`,
              type: 'button',
              meaning: '供应商配额管理详情-保存',
            },
          ],
          icon: 'save',
          loading: saveLoading || releaseLoading || headerInfoLoading || quotaAsignLoading,
          onClick: () => this.handleSaveAndRelease(true),
        },
      },
      isEdit && {
        name: 'release',
        btnComp: PermissionButton,
        child: intl.get('hzero.common.button.release').d('发布'),
        btnProps: {
          type: 'c7n-pro',
          funcType: 'flat',
          permissionList: [
            {
              code: `srm.partner.supplier-quota-manage.manage.ps.btn-detail-release`,
              type: 'button',
              meaning: '供应商配额管理详情-发布',
            },
          ],
          icon: 'rocket',
          loading: saveLoading || releaseLoading || headerInfoLoading || quotaAsignLoading,
          onClick: () => this.handleSaveAndRelease(false),
          disabled: !quotaHeaderId,
        },
      },
    ].filter(Boolean);

    return (
      <Fragment>
        <Header
          title={intl.get('sslm.supplierQuotaManage.view.title.createQuota').d('创建供应商配额')}
          backPath="/sslm/supplier-quota-manage/list"
        >
          {customizeBtnGroup(
            {
              code: 'SSLM.SUPPLIER_QUOTA_MANAGE.HEADER_BTNGROUP',
              pro: true,
            },
            <DynamicButtons buttons={buttons} defaultBtnType="c7n-pro" maxNum={5} />
          )}
        </Header>
        <Content>
          <Spin spinning={quotaHeaderId ? headerInfoLoading || quotaAsignLoading : false}>
            <HeaderInfo {...headerInfoProps} />
            {(quotaHeaderId || quotaHeaderId === 0) && <AsignTable {...asignTableProps} />}
          </Spin>
        </Content>
      </Fragment>
    );
  }
}
