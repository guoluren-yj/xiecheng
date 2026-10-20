/**
 * 8D 审核
 * @date: 2018-11-26
 * @author: WH <heng.wei@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { routerRedux } from 'dva/router';
import { stringify } from 'querystring';
import { isUndefined, isEmpty } from 'lodash';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { DEFAULT_DATETIME_FORMAT, DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import { filterNullValueObject, getCurrentOrganizationId, getResponse } from 'utils/utils';
import ExcelExportPro from 'components/ExcelExportPro';
import { SRM_SQAM } from '_utils/config';
import FilterForm from './FilterForm';
import ListTable from './ListTable';
import AssociationModal from '../components/AssociationModal';
import AttachmentModal from './PubDetail/AttachmentModal';

/**
 * 8D 审核入口
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} audit8D - 数据源
 * @reactProps {!boolean} loading - 数据加载是否完成
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */

const unitCode = ['SQAM.AUDIT_8D_LIST.GRID', 'SQAM.AUDIT_8D_LIST.QUERY_FORM'];

@connect(({ audit8D, loading }) => ({
  audit8D,
  loading: loading.effects['audit8D/fetch8D'],
  loadingAssociation: loading.effects['audit8D/fetchAssociation'],
  attachmenting: loading.effects['audit8D/fetchAttachment'],
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
    'entity.attachment',
    'hzero.common',
  ],
})
@withCustomize({
  unitCode,
})
export default class Audit8D extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      problemHeaderId: null,
      purchaserAttachments: [],
      supplierAttachments: [],
      interPurchaserAttachments: [],
      attachmentVisible: false,
      selectedRowKeys: [],
    };
  }

  form;

  /**
   * componentDidMount 生命周期函数
   * render()执行后获取页面数据
   */
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: 'audit8D/fetchLov' });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.custLoading && !this.props.custLoading) {
      const {
        audit8D: { pagination = {} },
        location: { state: { _back } = {} },
      } = this.props;
      // 校验是否从详情页返回
      this.handleSearch(isUndefined(_back) ? {} : pagination);
    }
  }

  /**
   * 传递表单对象
   * @param {object} ref - FilterForm对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  // 格式化查询参数
  @Bind()
  foramtSearchParams() {
    let filterValues = {};
    if (!isUndefined(this.form)) {
      const formValue = this.form.getFieldsValue();
      const values = {
        ...formValue,
        icaDemandDateAfter:
          formValue.icaDemandDateAfter &&
          formValue.icaDemandDateAfter.format(DEFAULT_DATETIME_FORMAT),
        icaDemandDateBefore:
          formValue.icaDemandDateBefore &&
          formValue.icaDemandDateBefore.format(DEFAULT_DATETIME_FORMAT),
        pcaDemandDateAfter:
          formValue.pcaDemandDateAfter && formValue.pcaDemandDateAfter.format(DATETIME_MIN),
        pcaDemandDateBefore:
          formValue.pcaDemandDateBefore && formValue.pcaDemandDateBefore.format(DATETIME_MAX),
        problemStatusCodeParamList: formValue?.problemStatus,
      };
      filterValues = filterNullValueObject(values);
    }

    if (filterValues?.problemStatus) {
      delete filterValues?.problemStatus;
    }
    return filterValues;
  }

  /**
   * 页面查询
   * @param {object} fields - 查询参数
   */
  @Bind()
  handleSearch(fields = {}) {
    const { dispatch, tenantId } = this.props;
    // 此处应该对查询参数中的数据做转换(eg: 表示时间的字段)
    const filterValues = this.foramtSearchParams();
    dispatch({
      type: 'audit8D/fetch8D',
      payload: {
        tenantId,
        page: isEmpty(fields) ? {} : fields,
        pageEntryPoint: 'CUSTOMER_APPROVE',
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
    if (
      ['PUBLISHED', 'ICA_REJECTED', 'PCA_FEEDBACKING', 'PCA_REJECTED'].includes(
        record.problemStatus
      )
    ) {
      dispatch(
        routerRedux.push({
          pathname: `/sqam/audit8D/pub-detail/${record.problemHeaderId}`,
          search: stringify({ from: 'audit8D', hide: true }),
        })
      );
      return;
    }
    dispatch(
      routerRedux.push({
        pathname: `/sqam/audit8D/detail/${record.problemHeaderId}`,
      })
    );
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
      type: 'audit8D/fetchAssociation',
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
        type: 'audit8D/fetchAttachment',
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
        type: 'audit8D/fetchAttachment',
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
    if (record.attachmentInterUuid) {
      dispatch({
        type: 'audit8D/fetchAttachment',
        payload: {
          bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
          directory: 'sqam-ed-inter-att',
          attachmentUUID: record.attachmentInterUuid,
        },
      }).then((res) => {
        if (!getResponse(res)) return;
        this.setState({
          interPurchaserAttachments: res.map((item, index) => ({
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
      interPurchaserAttachments: [],
    });
  }

  @Bind()
  handleSelectRow(selectedRowKeys) {
    this.setState({ selectedRowKeys });
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
      audit8D: {
        list = [],
        pagination = {},
        status = [],
        issueType = [],
        significance = [],
        urgency = [],
        rectifyTypeCode = [],
        associationList,
      },
      attachmenting,
      customizeTable,
      customizeForm,
      loadingAssociation,
    } = this.props;
    const {
      visible,
      attachmentVisible = false,
      purchaserAttachments = [],
      supplierAttachments = [],
      interPurchaserAttachments = [],
      selectedRowKeys,
    } = this.state;
    const filterProps = {
      status,
      issueType,
      significance,
      urgency,
      rectifyTypeCode,
      tenantId,
      customizeForm,
      onRef: this.handleBindRef,
      onSearch: this.handleSearch,
    };
    const listProps = {
      loading,
      dispatch,
      pagination,
      dataSource: list,
      customizeTable,
      showModal: this.showModal,
      onChange: this.handleSearch,
      onDetail: this.handleEdit8D,
      onAttachmentOption: this.handleAttachmentOption,
      onSelectRow: this.handleSelectRow,
      selectedRowKeys,
    };
    const modalProps = {
      visible,
      dispatch,
      onCancel: this.hideModal,
      associationList,
      loadingAssociation,
      fetchAssociation: this.fetchAssociation,
    };
    const attachmentProps = {
      tenantId,
      purchaserAttachments,
      supplierAttachments,
      interPurchaserAttachments,
      bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
      loading: attachmenting,
      visible: attachmentVisible,
      onCancel: this.handleAttachmentModalHidden,
    };
    const exportParams = this.foramtSearchParams();
    return (
      <React.Fragment>
        <Header
          title={intl
            .get('sqam.common.view.message.title.qualityRectification.audit')
            .d('质量整改报告审核')}
        >
          <ExcelExportPro
            requestUrl={`${SRM_SQAM}/v1/${tenantId}/problem-headers/export-approve/new`}
            otherButtonProps={{
              className: 'label-btn',
              icon: 'unarchive',
              color: 'primary',
              permissionList: [
                {
                  code: `srm.sqam.business.problem.manage.audit.button.newExport`,
                  type: 'button',
                },
              ],
            }}
            queryParams={{
              ...exportParams,
              customizeUnitCode: unitCode.join(),
              headerIds: isEmpty(selectedRowKeys) ? undefined : selectedRowKeys,
            }}
            buttonText={
              !isEmpty(selectedRowKeys)
                ? intl.get('hzero.common.button.newSelectedExport').d('(新)勾选导出')
                : intl.get('hzero.common.button.newExport').d('(新)导出')
            }
            templateCode="SQAM_ED_PROBLEM_HEADER_PURCHASER_APPROVE_EXPORT"
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
