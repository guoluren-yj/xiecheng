/**
 * 我发起的8D
 * @date: 2018-11-27
 * @author: WH <heng.wei@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Bind, Throttle } from 'lodash-decorators';
import { routerRedux } from 'dva/router';
import { isUndefined, isEmpty, isArray, throttle } from 'lodash';
import { Header, Content } from 'components/Page';
import ExcelExport from 'components/ExcelExport';
import ExcelExportPro from 'components/ExcelExportPro';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import intl from 'utils/intl';
import { Form, Tooltip } from 'hzero-ui';
import remote from 'hzero-front/lib/utils/remote';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import { filterNullValueObject, getCurrentOrganizationId, getResponse } from 'utils/utils';
import DynamicButtons from '_components/DynamicButtons';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { Button as PermissionButton } from 'components/Permission';
import PrintProButton from '_components/PrintProButton';
import { SRM_SQAM } from '_utils/config';
import { parse } from 'querystring';
import FilterForm from './FilterForm';
import ListTable from './ListTable';
import AssociationModal from '../components/AssociationModal';
import AttachmentModal from './Detail/AttachmentModal';
/**
 * 我发起的8D
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} initiated8D - 数据源
 * @reactProps {!boolean} loading - 数据加载是否完成
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */
@remote({
  code: 'SQAM_INITIATED8D_LIST',
  name: 'remote',
})
@connect(({ initiated8D, loading }) => ({
  initiated8D,
  loading: loading.effects['initiated8D/fetch8D'],
  attachmenting: loading.effects['audit8D/fetchAttachment'],
  printLoading: loading.effects['initiated8D/fetchListPrint'],
  loadingAssociation: loading.effects['initiated8D/fetchAssociation'],
  copyLoading: loading.effects['initiated8D/copyQualityRectification'],
  syncLoading: loading.effects['initiated8D/syncExternalSystem'],
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
    'sqam.edProblem',
  ],
})
@withCustomize({
  unitCode: [
    'SQAM.INITIATED_8D_LIST.GRID',
    'SQAM.INITIATED_8D_LIST.FILTER',
    'SQAM.INITIATED_8D_LIST.BTNS',
  ],
})
@Form.create({ fieldNameProp: null })
export default class Initiated8D extends PureComponent {
  constructor(props) {
    super(props);
    const {
      location: { search },
    } = props;
    const routerParam = parse(search.substring(1));
    const { companyId, companyName, supplierCompanyId, supplierCompanyName, supplierId } =
      routerParam || {};
    this.state = {
      selectedRowKeys: [],
      // selectedRows: [],
      visible: false,
      problemHeaderId: null,
      purchaserAttachments: [],
      supplierAttachments: [],
      interPurchaserAttachments: [],
      attachmentVisible: false,
      routerParams: {
        ...routerParam,
        companyId: ['undefined', 'null', ''].includes(companyId) ? null : companyId,
        companyName: ['undefined', 'null', ''].includes(companyName) ? null : companyName,
        extSupplierId: ['undefined', 'null', ''].includes(supplierId) ? null : supplierId,
        supplierId: ['undefined', 'null', ''].includes(supplierId) ? null : supplierId,
        supplierCompanyId: ['undefined', 'null', ''].includes(supplierCompanyId)
          ? null
          : supplierCompanyId,
        supplierCompanyName: ['undefined', 'null', ''].includes(supplierCompanyName)
          ? null
          : supplierCompanyName,
        supplierNum: ['undefined', 'null', ''].includes(supplierCompanyId)
          ? null
          : supplierCompanyId, // form表单里用的是supplierNum字段
      },
    };
  }

  form;

  /**
   * componentDidMount 生命周期函数
   * render()执行后获取页面数据
   */
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: 'initiated8D/fetchLov' });
    window.addEventListener('message', this.handleEvent);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.custLoading && !this.props.custLoading) {
      const {
        initiated8D: { pagination = {} },
        location: { state: { _back } = {} },
      } = this.props;
      // 校验是否从详情页返回
      const page = isUndefined(_back) ? {} : pagination;
      this.handleSearch(page);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('message', this.handleEvent);
  }

  @Bind()
  handleEvent(e) {
    const { origin } = e;
    if (origin !== window.location.origin) return;
    const { type, payload } = e.data;
    if (type === '/sqam/initiated8D/list' && payload === 'updateList') {
      const {
        initiated8D: { pagination = {} },
      } = this.props;
      this.handleSearch(pagination);
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
      const values = {
        ...formValue,
        createTimeAfter:
          formValue.createTimeAfter && formValue.createTimeAfter.format(DATETIME_MIN),
        createTimeBefore:
          formValue.createTimeBefore && formValue.createTimeBefore.format(DATETIME_MAX),
        publishedTimeAfter:
          formValue.publishedTimeAfter && formValue.publishedTimeAfter.format(DATETIME_MIN),
        publishedTimeBefore:
          formValue.publishedTimeBefore && formValue.publishedTimeBefore.format(DATETIME_MAX),
        problemStatusCodeParamList: formValue?.problemStatus,
        includeDelete: 1,
      };
      filterValues = filterNullValueObject(values);
    }
    if (filterValues?.problemStatus) {
      delete filterValues?.problemStatus;
    }
    dispatch({
      type: 'initiated8D/fetch8D',
      payload: {
        tenantId,
        page: isEmpty(fields) ? {} : fields,
        pageEntryPoint: 'CUSTOMER_OWNED',
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
        pathname: `/sqam/initiated8D/detail/${record.problemHeaderId}`,
      })
    );
  }

  /**
   * 获取form数据
   */
  @Bind()
  handleGetFormValue() {
    // 复制查询字段处理逻辑
    let filterValues = {};
    if (!isUndefined(this.form)) {
      const formValue = this.form.getFieldsValue();
      const values = {
        ...formValue,
        createTimeAfter:
          formValue.createTimeAfter && formValue.createTimeAfter.format(DATETIME_MIN),
        createTimeBefore:
          formValue.createTimeBefore && formValue.createTimeBefore.format(DATETIME_MAX),
        publishedTimeAfter:
          formValue.publishedTimeAfter && formValue.publishedTimeAfter.format(DATETIME_MIN),
        publishedTimeBefore:
          formValue.publishedTimeBefore && formValue.publishedTimeBefore.format(DATETIME_MAX),
        problemStatusCodeParamList: formValue?.problemStatus,
        includeDelete: 1,
      };
      filterValues = filterNullValueObject(values);
    }
    if (filterValues?.problemStatus) {
      delete filterValues?.problemStatus;
    }
    return filterValues;
  }

  @Bind()
  handleProblemSync(selectedRowKeys) {
    const { dispatch } = this.props;
    // 组装一波参数，再也不用加字段
    const param = selectedRowKeys.map((x) => {
      return {
        problemHeaderId: x,
      };
    });
    dispatch({
      type: 'initiated8D/syncExternalSystem',
      payload: param,
    }).then(() => {
      // 刷新一波页面
      this.handleSearch();
    });
  }

  // 打印相关的逻辑
  @Bind()
  handlePrint() {
    const { dispatch } = this.props;
    const { selectedRowKeys } = this.state;
    dispatch({
      type: 'initiated8D/fetchListPrint',
      payload: selectedRowKeys,
    }).then((res) => {
      if (!res) return;
      const reader = new FileReader();
      reader.onload = () => {
        const content = reader.result;
        try {
          const failedInfo = JSON.parse(content);
          notification.error({
            description: failedInfo.message,
          });
        } catch (e) {
          const file = new Blob([res], { type: 'application/pdf' });
          const fileURL = URL.createObjectURL(file);
          const printWindow = window.open(fileURL);
          if (printWindow?.print) {
            printWindow.print();
          }
        }
      };
      reader.readAsText(res);
    });
  }

  /**
   * 数据行选择操作
   */
  @Bind()
  handleSelectRow(selectedRowKeys) {
    this.setState({ selectedRowKeys });
    const { dispatch } = this.props;
    dispatch({
      type: 'initiated8D/updateState',
      payload: {
        selectedRowKeys8D: selectedRowKeys,
      },
    });
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
      type: 'initiated8D/fetchAssociation',
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
        type: 'initiated8D/fetchAttachment',
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
        type: 'initiated8D/fetchAttachment',
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
        type: 'initiated8D/fetchAttachment',
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
  async handleCopy(record) {
    const { dispatch, history } = this.props;
    const res = await dispatch({
      type: 'initiated8D/copyQualityRectification',
      payload: record,
    });
    if (res && res.problemHeaderId) {
      history.push({
        pathname: `/sqam/create8D/detail/${res.problemHeaderId}`,
      });
    }
  }

  @Bind()
  headerBtns(customizeUnitCode, queryParams) {
    const {
      tenantId,
      printLoading,
      initiated8D: { pagination = {} },
      loading,
      loadingAssociation,
      copyLoading,
      syncLoading,
      remote: remoteProps,
    } = this.props;
    const { selectedRowKeys = [] } = this.state;
    const isLoading = loading || loadingAssociation || copyLoading || syncLoading || printLoading;
    const otherProps = {
      isLoading,
      selectedRowKeys,
      queryParams,
      that: this,
    };
    const allBtns = [
      {
        name: 'print',
        btnComp: PermissionButton,
        child: intl.get('hzero.common.button.printSelect').d('勾选打印'),
        btnProps: {
          icon: 'printer',
          disabled: !selectedRowKeys || !selectedRowKeys[0],
          onClick: () => Throttle(this.handlePrint(), 2000),
          loading: isLoading,
          permissionList: [
            {
              code: 'srm.sqam.business.problem.manage.initiated.button.print',
              type: 'button',
            },
          ],
        },
      },
      {
        name: 'newprint',
        btnComp: PrintProButton,
        childFor: 'buttonText',
        btnProps: {
          buttonText: intl.get('sqam.common.view.button.printNew').d('新打印'),
          buttonProps: {
            disabled: !selectedRowKeys || !selectedRowKeys[0],
            permissionList: [
              {
                code: 'srm.sqam.business.problem.manage.initiated.button.printnew',
                type: 'button',
              },
            ],
          },
          requestUrl: `${SRM_SQAM}/v1/${tenantId}/problem-headers/list-print-new`,
          method: 'PUT',
          data: { edProblemHeaderIdList: selectedRowKeys },
          successCallBack: () => this.handleSearch(pagination),
          loading: isLoading,
        },
      },
      {
        name: 'export',
        btnComp: ExcelExport,
        childFor: 'buttonText',
        child: intl.get(`hzero.common.button.export`).d('导出'),
        btnProps: {
          otherButtonProps: {
            icon: 'unarchive',
            type: 'c7n-pro',
            funcType: 'flat',
            style: {
              border: '0.01rem solid rgba(0, 0, 0, 0.2)',
            },
            permissionList: [
              {
                code: `srm.sqam.business.problem.manage.initiated.ps.export`,
                type: 'button',
              },
            ],
            loading: isLoading,
          },
          requestUrl: `/sqam/v1/${tenantId}/problem-headers/export-customer?customizeUnitCode=${customizeUnitCode}`,
          method: 'POST',
          allBody: true,
          queryParams: isEmpty(selectedRowKeys)
            ? queryParams
            : { ...queryParams, headerIds: selectedRowKeys },
        },
      },
      {
        name: 'newExport',
        btnComp: ExcelExportPro,
        childFor: 'buttonText',
        child: !isEmpty(selectedRowKeys)
          ? intl.get('hzero.common.button.newSelectedExport').d('(新)勾选导出')
          : intl.get('hzero.common.button.newExport').d('(新)导出'),
        btnProps: {
          otherButtonProps: {
            icon: 'unarchive',
            type: 'c7n-pro',
            funcType: 'flat',
            style: {
              border: '0.01rem solid rgba(0, 0, 0, 0.2)',
            },
            permissionList: [
              {
                code: `srm.sqam.business.problem.manage.initiated.ps.newexport`,
                type: 'button',
              },
            ],
            loading: isLoading,
          },
          requestUrl: `/sqam/v1/${tenantId}/problem-headers/export-customer/new?customizeUnitCode=${customizeUnitCode}`,
          method: 'POST',
          allBody: true,
          queryParams: isEmpty(selectedRowKeys)
            ? queryParams
            : { ...queryParams, headerIds: selectedRowKeys },
          templateCode: 'SQAM_ED_PROBLEM_HEADER_PURCHASER_EXPORT',
        },
      },
    ];
    return remoteProps
      ? remoteProps.process('SQAM_INITIATED_8D_LIST_BTNS', allBtns, otherProps)
      : allBtns;
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      visible,
      problemHeaderId,
      attachmentVisible = false,
      purchaserAttachments = [],
      supplierAttachments = [],
      interPurchaserAttachments = [],
      selectedRowKeys = [],
      routerParams,
    } = this.state;
    const {
      loading,
      tenantId,
      dispatch,
      remote: remoteProps,
      copyLoading,
      initiated8D: {
        list = [],
        pagination = {},
        issueType = [],
        status = [],
        urgency = [],
        rectifyTypeCode = [],
        significance = [],
        problemSource = [],
        validateType = [],
        associationList,
      },
      attachmenting,
      syncLoading,
      customizeTable,
      customizeFilterForm,
      loadingAssociation,
      form,
      customizeBtnGroup,
    } = this.props;
    const filterProps = {
      form,
      issueType,
      status,
      urgency,
      rectifyTypeCode,
      significance,
      problemSource,
      tenantId,
      validateType,
      onSearch: this.handleSearch,
      onRef: this.handleBindRef,
      customizeFilterForm,
      routerParams,
    };
    const listProps = {
      tenantId,
      remote: remoteProps,
      loading: loading || copyLoading,
      pagination,
      selectedRowKeys,
      dataSource: list,
      onCopy: this.handleCopy,
      showModal: this.showModal,
      onChange: this.handleSearch,
      onDetail: this.handleEdit8D,
      customizeTable,
      onAttachmentOption: this.handleAttachmentOption,
      onSelectRow: this.handleSelectRow,
    };
    const modalProps = {
      dispatch,
      visible,
      onCancel: this.hideModal,
      problemHeaderId,
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
    const queryParams = (this.form && this.handleGetFormValue()) || {};
    const customizeUnitCode = 'SQAM.INITIATED_8D_LIST.FILTER,SQAM.INITIATED_8D_LIST.GRID';
    return (
      <React.Fragment>
        <Header
          title={intl
            .get('sqam.common.view.message.title.qualityRectification.initiated')
            .d('我发起的质量整改报告')}
        >
          <Tooltip
            placement="left"
            title={intl
              .get('sqam.edProblem.sync.external.sync')
              .d(
                '是否同步成功请查看单据同步状态与同步消息，若触发同步后状态仍未同步，则此单据未通过同步校验'
              )}
          >
            <PermissionButton
              icon="sync"
              disabled={isArray(selectedRowKeys) && isEmpty(selectedRowKeys)}
              loading={syncLoading}
              onClick={throttle(
                () => {
                  this.handleProblemSync(selectedRowKeys);
                },
                1500,
                { trailing: false }
              )}
              permissionList={[
                {
                  code: `srm.sqam.business.problem.manage.initiated.button.sync`,
                  type: 'button',
                },
              ]}
            >
              {intl.get(`hzero.common.button.sync`).d('同步')}
            </PermissionButton>
          </Tooltip>
          {customizeBtnGroup(
            { code: 'SQAM.INITIATED_8D_LIST.BTNS', pro: true },
            <DynamicButtons buttons={this.headerBtns(customizeUnitCode, queryParams)} />
          )}
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
