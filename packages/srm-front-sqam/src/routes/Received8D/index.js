/**
 * 我收到的8D
 * @date: 2018-11-27
 * @author: WH <heng.wei@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { routerRedux } from 'dva/router';
import { isUndefined, isEmpty } from 'lodash';
import { Header, Content } from 'components/Page';
import ExcelExport from 'components/ExcelExport';
import ExcelExportPro from 'components/ExcelExportPro';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import {
  filterNullValueObject,
  getCurrentOrganizationId,
  getUserOrganizationId,
  getResponse,
} from 'utils/utils';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import FilterForm from './FilterForm';
import ListTable from './ListTable';
import AssociationModal from '../components/AssociationModal';
import AttachmentModal from './Detail/AttachmentModal';

/**
 * 我发起的8D
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} received8D - 数据源
 * @reactProps {!boolean} loading - 数据加载是否完成
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */
@withCustomize({
  unitCode: ['SQAM.RECEIVED_8D_LIST.GRID', 'SQAM.RECEIVED_8D_LIST.FILTER'],
})
@connect(({ received8D, loading }) => ({
  received8D,
  loading: loading.effects['received8D/fetch8D'],
  attachmenting: loading.effects['audit8D/fetchAttachment'],
  loadingAssociation: loading.effects['received8D/fetchAssociation'],
  tenantId: getCurrentOrganizationId(),
}))
@formatterCollections({
  code: [
    'sqam.common',
    'entity.supplier',
    'entity.item',
    'entity.company',
    'entity.organization',
    'entity.roles',
    'entity.customer',
    'entity.attachment',
    'hzero.common',
  ],
})
export default class Received8D extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      problemHeaderId: null,
      purchaserAttachments: [],
      supplierAttachments: [],
      attachmentVisible: false,
    };
  }

  form;

  /**
   * componentDidMount 生命周期函数
   * render()执行后获取页面数据
   */
  componentDidMount() {
    const {
      dispatch,
      received8D: { pagination = {} },
      location: { state: { _back } = {} },
    } = this.props;
    // 校验是否从详情页返回
    const page = isUndefined(_back) ? {} : pagination;
    this.handleSearch(page);
    dispatch({ type: 'received8D/fetchLov' });
  }

  /**
   * 传递表单对象
   * @param {object} ref - FilterForm对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * 页面查询
   * @param {object} fields - 查询参数
   */
  @Bind()
  handleSearch(fields = {}) {
    const { dispatch, tenantId } = this.props;
    // 此处应该对查询参数中的数据做转换(eg: 表示时间的字段)
    let filterValues = {};
    if (!isUndefined(this.form)) {
      const formValue = this.form.getFieldsValue();
      const { itemCodeParam, itemCode, ...others } = formValue;
      const values = {
        ...others,
        itemCode: itemCodeParam || itemCode, // 已存在itemCode值集查询，使用itemCodeParam
        publishedTimeAfter:
          formValue.publishedTimeAfter && formValue.publishedTimeAfter.format(DATETIME_MIN),
        publishedTimeBefore:
          formValue.publishedTimeBefore && formValue.publishedTimeBefore.format(DATETIME_MAX),
        problemStatusCodeParamList: formValue?.problemStatus,
      };
      filterValues = filterNullValueObject(values);
    }
    if (filterValues?.problemStatus) {
      delete filterValues?.problemStatus;
    }
    dispatch({
      type: 'received8D/fetch8D',
      payload: {
        tenantId,
        page: isEmpty(fields) ? {} : fields,
        pageEntryPoint: 'SUPPLIER_RCV',
        supplierTenantId: getUserOrganizationId(),
        ...filterValues,
      },
    });
  }

  /**
   * 明细维护
   * @param {!object} record - 8D对象
   */
  @Bind()
  handleEdit8D(record = {}) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/sqam/received8D/detail/${record.problemHeaderId}`,
      })
    );
  }

  /**
   * 获取form数据
   */
  @Bind()
  handleGetFormValue() {
    let filterValues = {};
    if (!isUndefined(this.form)) {
      const formValue = this.form.getFieldsValue();
      const values = {
        ...formValue,
        publishedTimeAfter:
          formValue.publishedTimeAfter && formValue.publishedTimeAfter.format(DATETIME_MIN),
        publishedTimeBefore:
          formValue.publishedTimeBefore && formValue.publishedTimeBefore.format(DATETIME_MAX),
        problemStatusCodeParamList: formValue?.problemStatus,
      };
      filterValues = filterNullValueObject(values);
    }
    if (filterValues?.problemStatus) {
      delete filterValues?.problemStatus;
    }
    return {
      ...filterValues,
      customizeUnitCode: ['SQAM.RECEIVED_8D_LIST.GRID', 'SQAM.RECEIVED_8D_LIST.FILTER'].join(),
    };
  }

  @Bind()
  showModal(problemHeaderId) {
    this.setState({ visible: true, problemHeaderId });
  }

  @Bind()
  hideModal() {
    this.setState({ visible: false });
  }

  /**
   * 关联8d查询
   */
  @Bind()
  fetchAssociation() {
    const { dispatch } = this.props;
    const { problemHeaderId } = this.state;
    dispatch({
      type: 'received8D/fetchAssociation',
      payload: { problemHeaderId },
    });
  }

  /**
   * 附件查看
   */
  @Bind()
  handleAttachmentOption(record) {
    const { dispatch } = this.props;
    if (record.attachmentUuid) {
      dispatch({
        type: 'received8D/fetchAttachment',
        payload: {
          bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
          directory: 'sqam-ed-att',
          attachmentUUID: record.attachmentUuid,
        },
      }).then((res) => {
        if (!getResponse(res)) return;
        this.setState({
          purchaserAttachments: res.map((item, index) => ({
            uid: index,
            name: item.fileName,
            type: item.fileType,
            status: 'done',
            size: item.fileSize,
            response: item.fileUrl,
          })),
        });
      });
    }
    if (record.supplierAttachmentUuid) {
      dispatch({
        type: 'received8D/fetchAttachment',
        payload: {
          bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
          directory: 'sqam-ed-supplieratt',
          attachmentUUID: record.supplierAttachmentUuid,
        },
      }).then((res) => {
        if (!getResponse(res)) return;
        this.setState({
          supplierAttachments: res.map((item, index) => ({
            uid: index,
            name: item.fileName,
            type: item.fileType,
            status: 'done',
            size: item.fileSize,
            response: item.fileUrl,
          })),
        });
      });
    }
    this.setState({ attachmentVisible: true });
  }

  /**
   * 隐藏附件Modal
   */
  @Bind()
  handleAttachmentModalHidden() {
    this.setState({
      attachmentVisible: false,
      purchaserAttachments: [],
      supplierAttachments: [],
    });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      loading,
      tenantId,
      dispatch,
      received8D: {
        list = [],
        pagination = {},
        issueType = [],
        status = [],
        significance = [],
        urgency = [],
        rectifyTypeCode = [],

        associationList,
      },
      attachmenting,
      customizeTable,
      customizeFilterForm,
      loadingAssociation,
    } = this.props;
    const {
      visible,
      attachmentVisible = false,
      purchaserAttachments = [],
      supplierAttachments = [],
    } = this.state;
    const includeStatus = [
      'PUBLISHED',
      'ICA_SUBMITTED',
      'ICA_REJECTED',
      'PCA_FEEDBACKING',
      'PCA_SUBMITTED',
      'PCA_REJECTED',
      'COMPLETED',
      'CANCELLED',
      'VALIDATED',
      'TRACK_APPROVING',
    ];
    const attachmentProps = {
      tenantId,
      purchaserAttachments,
      supplierAttachments,
      bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
      loading: attachmenting,
      visible: attachmentVisible,
      onCancel: this.handleAttachmentModalHidden,
    };
    const filterProps = {
      issueType,
      status: status.filter((item) => includeStatus.includes(item.value)),
      significance,
      urgency,
      rectifyTypeCode,
      tenantId,
      customizeFilterForm,
      onSearch: this.handleSearch,
      onRef: this.handleBindRef,
    };
    const listProps = {
      loading,
      pagination,
      dataSource: list,
      customizeTable,
      showModal: this.showModal,
      onChange: this.handleSearch,
      onDetail: this.handleEdit8D,
      onAttachmentOption: this.handleAttachmentOption,
    };
    const modalProps = {
      visible,
      dispatch,
      associationList,
      loadingAssociation,
      supplier: true,
      onCancel: this.hideModal,
      fetchAssociation: this.fetchAssociation,
    };
    return (
      <React.Fragment>
        <Header
          title={intl
            .get('sqam.common.view.message.title.qualityRectification.received')
            .d('我收到的质量整改报告')}
        >
          <ExcelExportPro
            requestUrl={`/sqam/v1/${tenantId}/problem-headers/export-supplier/new`}
            otherButtonProps={{
              icon: 'unarchive',
              type: 'c7n-pro',
              funcType: 'flat',
              style: {
                border: '0.01rem solid rgba(0, 0, 0, 0.2)',
              },
              permissionList: [
                {
                  code: `srm.sqam.business.problem.8d.recevied.ps.newexport`,
                  type: 'button',
                },
              ],
            }}
            queryParams={this.handleGetFormValue()}
            buttonText={intl.get('hzero.common.button.newExport').d('(新)导出')}
            templateCode="SQAM_ED_PROBLEM_HEADER_SUPPLIER_EXPORT"
            method="POST"
            allBody
          />
          <ExcelExport
            requestUrl={`/sqam/v1/${tenantId}/problem-headers/export-supplier`}
            otherButtonProps={{
              icon: 'unarchive',
              type: 'c7n-pro',
              funcType: 'flat',
              style: {
                border: '0.01rem solid rgba(0, 0, 0, 0.2)',
              },
              permissionList: [
                {
                  code: `srm.sqam.business.problem.8d.recevied.ps.export`,
                  type: 'button',
                },
              ],
            }}
            queryParams={this.handleGetFormValue()}
            method="POST"
            allBody
          />
        </Header>
        <Content>
          <FilterForm {...filterProps} />
          <ListTable {...listProps} />
          {visible && <AssociationModal {...modalProps} />}
          {attachmentVisible && <AttachmentModal {...attachmentProps} />}
        </Content>
      </React.Fragment>
    );
  }
}
