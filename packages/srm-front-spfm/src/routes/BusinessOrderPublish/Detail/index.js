/**
 * Detail - 详细页
 * @date: 2020-2-24
 * @author: zjx <jingxi.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { DataSet, Modal as C7NModal } from 'choerodon-ui/pro';
import { Button, Spin, Modal, Form, Card, Row, Col } from 'hzero-ui';
import { Bind, throttle, debounce } from 'lodash-decorators';
import classnames from 'classnames';
import { isEmpty, isUndefined, isString, isFunction } from 'lodash';
import uuidv4 from 'uuid/v4';

import { Button as PermissionButton } from 'components/Permission';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import notification from 'utils/notification';
import {
  // getEditTableData,
  getCurrentOrganizationId,
  addItemsToPagination,
  filterNullValueObject,
  getCurrentTenant,
  getResponse,
} from 'utils/utils';
import intl from 'utils/intl';
import cuxRemote from 'hzero-front/lib/utils/remote';
import { DETAIL_CARD_TABLE_CLASSNAME, DETAIL_CARD_CLASSNAME } from 'utils/constants';
import { PUBLIC_BUCKET } from 'srm-front-boot/lib/utils/config';

import { PRIVATE_BUCKET } from '_utils/config';
import { Header, Content } from 'components/Page';
import UploadModal from 'components/Upload/index';
import DynamicButtons from '_components/DynamicButtons';
// import TinymceEditor from 'components/TinymceEditor';
import RichTextEditor from 'components/RichTextEditor';
import { queryBatchApprovaFlag } from '_utils/utils';
import { openApproveModal } from 'srm-front-boot/lib/components/ApproveModal';
import { revokeWorkFlowByKey, fetchConfig } from '@/services/businessOrderPublishService';

import BusinessOrderLine from './BusinessOrderLine';
import SupplierTable from './SupplierTable';
import OperateRecord from '../OperateRecord';

import ListDS from './listDS';

@withCustomize({
  unitCode: [
    'SPFM.PORTAL.BUSINESSORDER.PUBLISH.DETAIL.BASE',
    'SPFM.PORTAL.BUSINESSORDER.PUBLISH.DETAIL.TABLE',
    'SPFM.PORTAL.BUSINESSORDER.PUBLISH.SUPPLIER.SEACH',
    'SPFM.PORTAL.BUSINESSORDER.PUBLISH.SUPPLIER.TABLE',
    'SPFM.PORTAL.BUSINESSORDER.PUBLISH.DETAIL.HEADER.BUTTONS',
  ],
})
@cuxRemote(
  {
    code: 'SPFM_PORTAL_BUSINESSORDER', // 对应二开模块暴露的Expose的编码， 命名规范：模块编码+功能编码
    name: 'remote', // 默认 'remote'， 如有属性冲突可以改此属性
  },
  {
    process: {
      handleCuxButtons: undefined,
    },
  }
)
@Form.create({ fieldNameProp: null })
@connect(({ loading, businessOrderPublish }) => ({
  loading: loading.effects['businessOrderPublish/fetchForm'],
  fetchTableLoading: loading.effects['businessOrderPublish/fetchTable'],
  saveLoading: loading.effects['businessOrderPublish/saveBusinessOrder'],
  approveLoading: loading.effects['businessOrderPublish/approvalBusinessOrder'],
  deleteLoading: loading.effects['businessOrderPublish/deleteBusinessOrder'],
  fetchOperateLoading: loading.effects['businessOrderPublish/fetchOperate'],
  publishLoading: loading.effects['businessOrderPublish/publishBusinessOrder'],
  tenantId: getCurrentOrganizationId(),
  businessOrderPublish,
}))
@formatterCollections({
  code: [
    'spfm.businessOrder',
    'entity.supplier',
    'entity.company',
    'spfm.notice',
    'sslm.common',
    'hwfp.common',
  ],
})
export default class Detail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      disabledFlg: false,
      notificationId: '',
      attachmentUuid: uuidv4(),
      supplierContactFlag: 1,
      supplierDs: new DataSet(ListDS()),
    };
  }

  componentDidMount() {
    const {
      dispatch,
      match: { params = {} },
    } = this.props;
    const { supplierDs } = this.state;
    const { notificationId } = params;
    dispatch({
      type: 'businessOrderPublish/queryIdpValue',
    });
    this.setState(
      {
        notificationId,
      },
      () => {
        this.handleFetch(notificationId);
      }
    );
    fetchConfig({
      organizationId: getCurrentOrganizationId(),
      tenant: getCurrentTenant().tenantNum,
      tenantNum: getCurrentTenant().tenantNum,
    }).then((res) => {
      const result = getResponse(res);
      if (result) {
        if (isEmpty(result)) {
          this.setState({
            supplierContactFlag: 1,
          });
          supplierDs.setState({
            supplierContactFlag: 1,
          });
        } else {
          this.setState({
            supplierContactFlag: 0,
          });
          supplierDs.setState({
            supplierContactFlag: 0,
          });
        }
      }
    });
  }

  componentWillUnmount() {
    if (!this.props?.match?.path.includes('/pub')) {
      this.props.dispatch({
        type: 'businessOrderPublish/updateState',
        payload: {
          contentBody: '',
          orderFormData: {},
        },
      });
    }
  }

  /**
   * 查询详细页数据
   */
  @Bind()
  handleFetch(notificationId) {
    const { dispatch } = this.props;
    if (notificationId !== 'create') {
      this.fetchForm(); // 查询头表数据
    } else {
      this.setState({
        disabledFlg: false,
        disabledApproveFlg: true,
      });
      dispatch({
        type: 'businessOrderPublish/updateState',
        payload: {
          orderFormData: {
            notificationContent: '',
          },
          supplierTable: [],
          supplierPagination: {},
        },
      });
    }
  }

  /**
   * 查询页面头数据
   */
  @Bind()
  fetchForm() {
    const { notificationId, supplierDs } = this.state;
    const { dispatch } = this.props;
    this.orderForm.resetFields();
    dispatch({
      type: 'businessOrderPublish/fetchForm',
      payload: {
        notificationId,
        customizeUnitCode: 'SPFM.PORTAL.BUSINESSORDER.PUBLISH.DETAIL.BASE',
      },
    }).then((res) => {
      if (res) {
        supplierDs.setState({
          companyId: res?.companyId,
        });
        this.setState(
          {
            disabledFlg: !['NEW', 'REJECTED'].includes(res.notificationStatus),
            disabledApproveFlg: res.notificationStatus !== 'APPROVING',
          },
          () => {
            this.fetchTable(); // 查询模块表格数据
          }
        );
      }
    });
  }

  /**
   * 查询供应商行数据
   */
  @Bind()
  fetchTable(param = {}) {
    const { notificationId, supplierDs } = this.state;
    const {
      dispatch,
      businessOrderPublish: { supplierTable = [] },
    } = this.props;
    const query = isUndefined(this.tableRef)
      ? {}
      : filterNullValueObject(this.tableRef.props && this.tableRef.props.form.getFieldsValue());
    const filterData = supplierTable.filter((item) => item.editFlag === true);
    if (filterData.length > 0 && !isEmpty(param)) {
      Modal.confirm({
        title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
        content: intl
          .get(`spfm.businessOrder.view.confirm.message`)
          .d('存在未保存数据，操作将导致数据丢失，是否继续？'),
        onOk: () => {
          dispatch({
            type: 'businessOrderPublish/fetchTable',
            payload: {
              notificationId,
              page: param,
              ...query,
              customizeUnitCode: 'SPFM.PORTAL.BUSINESSORDER.PUBLISH.DETAIL.TABLE',
            },
          }).then((res) => {
            supplierDs.loadData(res?.content);
          });
        },
      });
    } else {
      dispatch({
        type: 'businessOrderPublish/fetchTable',
        payload: {
          notificationId,
          page: param,
          ...query,
          customizeUnitCode: 'SPFM.PORTAL.BUSINESSORDER.PUBLISH.DETAIL.TABLE',
        },
      }).then((res) => {
        supplierDs.loadData(res?.content);
      });
    }
  }

  /**
   * 绑定form
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.orderForm = ref.props.form;
  }

  /**
   * 绑定操作记录ref
   */
  @Bind()
  handleBindoperateRef(ref = {}) {
    this.operateRecord = ref;
  }

  /**
   * 公司值集选择
   */
  // @Bind()
  // handleCompanyChange(record = {}) {
  //   const { dispatch, businessOrderPublish = {} } = this.props;
  //   const { orderFormData = {} } = businessOrderPublish;
  //   const { companyName, companyNum, companyId } = record;
  //   if (orderFormData.companyId !== companyId) {
  //     this.tableRef.clearAll();
  //     dispatch({
  //       type: 'businessOrderPublish/updateState',
  //       payload: {
  //         orderFormData: {
  //           ...orderFormData,
  //           companyName,
  //           companyId,
  //           companyCode: companyNum,
  //         },
  //         supplierTable: [],
  //         supplierPagination: {},
  //       },
  //     });
  //   }
  // }

  // 值集带出业务实体，采购组织
  @Bind()
  fetchAutoGetParams(query, flag, record = {}) {
    const { dispatch, businessOrderPublish = {} } = this.props;
    const { orderFormData = {} } = businessOrderPublish;
    const { companyName, companyNum, companyId } = record;
    const { supplierDs } = this.state;
    dispatch({
      type: 'businessOrderPublish/fetchBringOutOrgInfo',
      payload: query,
    }).then((res) => {
      if (res) {
        const {
          ouId,
          ouName,
          purchaseOrgId,
          purchaseOrgName,
          purchaseAgentId,
          purchaseAgentName,
        } = res;
        supplierDs.setState({ companyId });
        if (flag === 'company' && orderFormData.companyId !== companyId) {
          this.tableRef.clearAll();
          dispatch({
            type: 'businessOrderPublish/updateState',
            payload: {
              orderFormData: {
                ...orderFormData,
                companyName,
                companyId,
                companyCode: companyNum,
                ouId,
                ouName,
                purchaseOrgId,
                purchaseOrgName,
                purchaseAgentId,
                purchaseAgentName,
              },
              supplierTable: [],
              supplierPagination: {},
            },
          });
        } else if (flag === 'ouId') {
          dispatch({
            type: 'businessOrderPublish/updateState',
            payload: {
              orderFormData: {
                ...orderFormData,
                ouId,
                ouName,
                purchaseOrgId,
                purchaseOrgName,
                purchaseAgentId,
                purchaseAgentName,
              },
            },
          });
        } else {
          dispatch({
            type: 'businessOrderPublish/updateState',
            payload: {
              orderFormData: {
                ...orderFormData,
                purchaseOrgId,
                purchaseOrgName,
                purchaseAgentId,
                purchaseAgentName,
              },
            },
          });
        }
      }
    });
  }

  /**
   * 供应商删除行
   */
  @Bind()
  handleClearEdit(selectRows = []) {
    const { dispatch } = this.props;
    dispatch({
      type: 'businessOrderPublish/deleteRow',
      payload: selectRows.map((n) => n.supplierCompanyId),
    });
    dispatch({
      type: 'businessOrderPublish/deleteSupplier',
      payload: { BsnesNotifyReceives: selectRows },
    }).then(() => {
      const {
        businessOrderPublish: { supplierTable = [] },
      } = this.props;
      const { supplierDs } = this.state;
      supplierDs.loadData(supplierTable);
      notification.success();
    });
  }

  /**
   * 供应商行编辑
   */
  @Bind()
  @throttle(500)
  handleInputChange(lovRecord, record) {
    const { mail, companyContactId, mobilephone, name } = lovRecord;
    const {
      dispatch,
      businessOrderPublish: { supplierTable = [] },
    } = this.props;
    const { supplierDs } = this.state;
    const newSupplierTable = supplierTable.map((n) => {
      const m = {
        ...n,
      };
      if (n.supplierCompanyId === record.supplierCompanyId) {
        return {
          ...m,
          contactId: companyContactId,
          contactName: name,
          contactPhone: mobilephone,
          contactEmail: mail,
          editFlag: true,
        };
      } else {
        return m;
      }
    });
    dispatch({
      type: 'businessOrderPublish/updateState',
      payload: {
        supplierTable: newSupplierTable,
      },
    });
    supplierDs.loadData(newSupplierTable);
  }

  /**
   * 保存表格中lov选择的数据，新建
   * @param {object} record --点击lov后对应一行的值
   * @param {boolean} flag --是否编辑
   */
  @Bind()
  saveRecordRows(record = []) {
    const {
      dispatch,
      businessOrderPublish: { supplierTable = [], supplierPagination = {} },
    } = this.props;
    const { supplierDs } = this.state;
    // 判断是否是新增的数据且判断历史数据与新增数据是否一致
    const flagList = [];
    supplierTable.forEach((e) => {
      record.forEach((ele) => {
        if (e.supplierCompanyId === ele.supplierCompanyId) {
          flagList.push(ele);
        }
      });
    });
    if (
      // isEmpty((supplierTable.content || []).filter(o => o.companyNum === record.companyNum))
      flagList.length < 1
    ) {
      const _status = 'update';
      const newSupplierTable = record.map((item) => {
        return {
          ...item,
          _status,
          editFlag: true,
        };
      });
      dispatch({
        type: 'businessOrderPublish/updateState',
        payload: {
          supplierTable: [...supplierTable, ...newSupplierTable],
          supplierPagination: addItemsToPagination(
            newSupplierTable.length,
            supplierTable.length,
            supplierPagination
          ),
        },
      });
      supplierDs.loadData([...supplierTable, ...newSupplierTable]);
    } else {
      notification.warning({
        message: intl
          .get('spfm.businessOrder.view.message.investMaintain.repetition')
          .d('不可选择已存在供应商'),
      });
    }
  }

  /**
   * 保存或发布
   */
  @Bind()
  @debounce(500)
  handleSaveOrder(type = '') {
    const { notificationId, attachmentUuid, supplierDs } = this.state;
    const {
      dispatch,
      history,
      businessOrderPublish: { orderFormData = {}, supplierTable = [], contentBody },
      remote,
    } = this.props;
    this.orderForm.validateFields(async (err, fieldsValue) => {
      if (!err) {
        const filterData = supplierTable.filter((item) => item.editFlag === true);
        const flag = await supplierDs.validate();
        if (filterData.length === 0 || flag) {
          const newTable = supplierDs.toData();
          const eventProps = {
            fieldsValue,
            supplierDs,
          };
          const result = await remote.event.fireEvent('cuxHandleSaveOrder', eventProps);
          if (!result) return;
          // 发布
          if (type === 'publish') {
            this.handPublish(fieldsValue);
          } else {
            // 保存
            dispatch({
              type: 'businessOrderPublish/saveBusinessOrder',
              payload: {
                businessNotificationDTO: {
                  ...orderFormData,
                  ...fieldsValue,
                  notificationId: notificationId === 'create' ? null : notificationId,
                  notificationContent: contentBody,
                  attachmentUuid: !this.orderForm.getFieldsValue().attachmentUuid
                    ? attachmentUuid
                    : this.orderForm.getFieldsValue().attachmentUuid,
                  receivesList: newTable,
                },
                customizeUnitCode:
                  'SPFM.PORTAL.BUSINESSORDER.PUBLISH.DETAIL.TABLE,SPFM.PORTAL.BUSINESSORDER.PUBLISH.DETAIL.BASE',
              },
            }).then((res) => {
              if (res) {
                notification.success();
                this.setState(
                  {
                    notificationId: res.notificationId,
                  },
                  () => {
                    this.fetchForm(); // 查询头表数据
                    this.fetchTable(); // 查询模块表格数据
                    history.push(`/spfm/business-order-publish/detail/${res.notificationId}`);
                  }
                );
              }
            });
          }
        }
      }
    });
  }

  /**
   * 发布
   */
  @Bind()
  handPublish(fieldsValue) {
    const {
      dispatch,
      history,
      businessOrderPublish: { orderFormData = {}, supplierTable = [], contentBody },
    } = this.props;
    const { attachmentUuid } = this.state;
    if (supplierTable.length === 0) {
      notification.warning({
        message: intl.get('spfm.businessOrder.view.message.supTableRequired').d('请添加供应商'),
      });
      return;
    }
    if (!contentBody) {
      notification.warning({
        message: intl.get('spfm.businessOrder.view.message.richEditRequired').d('请填写通知编辑'),
      });
      return;
    }
    dispatch({
      type: 'businessOrderPublish/publishBusinessOrder',
      payload: {
        businessNotificationDTOList: [
          {
            ...orderFormData,
            ...fieldsValue,
            receivesList: supplierTable,
            notificationContent: contentBody,
            attachmentUuid: !orderFormData.attachmentUuid
              ? attachmentUuid
              : orderFormData.attachmentUuid,
          },
        ],
        saveFlag: 1,
        customizeUnitCode:
          'SPFM.PORTAL.BUSINESSORDER.PUBLISH.DETAIL.TABLE,SPFM.PORTAL.BUSINESSORDER.PUBLISH.DETAIL.BASE',
      },
    }).then((res) => {
      if (res) {
        notification.success();
        history.push('/spfm/business-order-publish/list');
      }
    });
  }

  /**
   * 删除新建合未签收状态下的通知单
   */
  @Bind()
  async handleDeteleOrder() {
    const {
      dispatch,
      history,
      businessOrderPublish: { orderFormData = {} },
    } = this.props;
    let flag = true;
    // 单据状态为【未签收】，点击删除按钮时，触发二次确认弹窗
    if (orderFormData.notificationStatus === 'NOT_RECEIVE') {
      const res = await C7NModal.confirm({
        title: intl.get('hzero.common.message.confirm.title').d('提示'),
        children: intl
          .get('spfm.businessOrder.view.deleteConfirm')
          .d('当前单据已发布，删除后将无法恢复，是否确认删除'),
      });
      flag = res === 'ok';
    }
    if (!flag) return;
    dispatch({
      type: 'businessOrderPublish/deleteBusinessOrder',
      payload: {
        businessNotifications: [
          {
            ...orderFormData,
          },
        ],
      },
    }).then((res) => {
      if (res) {
        notification.success();
        history.push('/spfm/business-order-publish/list');
      }
    });
  }

  /**
   * 审批通过通知单
   */
  @Bind()
  handleApprove(type) {
    const {
      dispatch,
      history,
      businessOrderPublish: { orderFormData = {} },
    } = this.props;
    dispatch({
      type: 'businessOrderPublish/approvalBusinessOrder',
      payload: {
        type,
        businessNotifications: [
          {
            ...orderFormData,
          },
        ],
      },
    }).then((res) => {
      if (res) {
        notification.success();
        history.push('/spfm/business-order-publish/list');
      }
    });
  }

  /**
   * 监听富文本编辑
   * @param {object} dataSource - 编辑的数据
   */
  @Bind()
  onRichTextEditorChange(dataSource) {
    const { dispatch } = this.props;
    dispatch({
      type: 'businessOrderPublish/updateState',
      payload: {
        contentBody: dataSource,
      },
    });
  }

  /**
   * 操作记录
   */
  @Bind()
  handShowOperate() {
    this.operateRecord.handleOperatedModal();
  }

  /**
   * 加入全部
   */
  @Bind()
  handleAddAll() {
    const {
      dispatch,
      businessOrderPublish: { orderFormData = {}, supplierTable = [], supplierPagination },
    } = this.props;
    const { companyId } = orderFormData || {};
    const { supplierDs } = this.state;
    dispatch({
      type: 'businessOrderPublish/fetchAllSupplier',
      payload: {
        companyId,
        page: -1, // 加入全部查询不分页
      },
    }).then((res) => {
      if (res) {
        const { content } = res;
        const supplierIdList = supplierTable.map((n) => n.supplierCompanyId);
        const addRow = content
          .filter((n) => {
            return !supplierIdList.includes(n.supplierCompanyId);
          })
          .map((m) => {
            return {
              ...m,
              _status: 'update',
              editFlag: true,
            };
          });
        dispatch({
          type: 'businessOrderPublish/updateState',
          payload: {
            supplierTable: [...addRow, ...supplierTable],
            supplierPagination: addItemsToPagination(
              addRow.length,
              supplierTable.length,
              supplierPagination
            ),
          },
        });
        supplierDs.loadData([...addRow, ...supplierTable]);
      }
    });
  }

  @Bind()
  handleGetOrderFormData() {
    const {
      businessOrderPublish: {
        orderFormData = {}, // 详细页头信息
      },
    } = this.props;

    const fieldValues = isUndefined(this.orderForm)
      ? {}
      : filterNullValueObject(this.orderForm.getFieldsValue());

    return { ...orderFormData, ...fieldValues };
  }

  @Bind()
  @throttle(1000)
  handleRevoke() {
    console.log(this.props);
    const {
      history,
      businessOrderPublish: { orderFormData = {} },
    } = this.props;
    return new Promise(async (resolve) => {
      C7NModal.confirm({
        title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
        children: intl
          .get('hzero.common.view.revokeApproval.tip')
          .d('是否确认撤销审批？撤销后您仍可再次提交发起审批（仅工作流审批发起人可撤销审批）'),
        onOk: async () => {
          const res = await revokeWorkFlowByKey({ businessKey: orderFormData.workflowBusinessKey });
          if (isString(res)) {
            notification.error({
              message: intl.get('hzero.common.status.mistake').d('错误'),
              description: res,
            });
          } else if (getResponse(res)) {
            resolve(true);
            history.push('/spfm/business-order-publish/list');
          }
          resolve(false);
        },
        afterClose: () => {
          resolve(false);
        },
      });
    });
  }

  @Bind()
  @throttle(1000)
  handleWorkflowApprove() {
    const {
      history,
      businessOrderPublish: { orderFormData = {} },
    } = this.props || {};
    return new Promise(async (resolve) => {
      const res = await queryBatchApprovaFlag([orderFormData.workflowBusinessKey]);
      if (getResponse(res)) {
        openApproveModal({
          modalProps: {
            title: intl.get('hzero.common.button.approval').d('审批'),
            closable: true,
          },
          taskId: res[orderFormData.workflowBusinessKey]?.taskId,
          processInstanceId: res[orderFormData.workflowBusinessKey]?.processInstanceId,
          onSuccess: () => {
            history.push('/spfm/business-order-publish/list');
          },
        });
      }
      resolve(true);
    });
  }

  render() {
    const {
      loading = false,
      fetchTableLoading,
      saveLoading = false,
      publishLoading = false,
      approveLoading = false,
      deleteLoading,
      businessOrderPublish: {
        notificationType = [],
        notificationStatus = [],
        orderFormData = {}, // 详细页头信息
        supplierTable = [], // 详细页供应商行信息
        supplierPagination = {}, // 详细页供应商行分页
      },
      tenantId,
      dispatch,
      customizeForm,
      customizeTable,
      customizeFilterForm,
      customizeBtnGroup,
      remote,
    } = this.props;
    const { handleCuxButtons, cuxEditFlagFc, CuxDom, editorCuxFlagFc } =
      remote?.props?.process || {};
    const {
      disabledFlg,
      disabledApproveFlg,
      notificationId,
      attachmentUuid,
      supplierContactFlag,
      supplierDs,
    } = this.state;
    const filterProps = {
      tenantId,
      disabledFlg,
      notificationType,
      notificationStatus,
      onRef: this.handleBindRef,
      initData: orderFormData,
      // onCompanyChange: this.handleCompanyChange,
      fetchAutoGetParams: this.fetchAutoGetParams,
      customizeForm,
    };
    const cuxEditFlag = isFunction(cuxEditFlagFc) ? cuxEditFlagFc({ orderFormData }) : false;
    const tableProps = {
      supplierDs,
      cuxEditFlag,
      CuxDom,
      editorCuxFlagFc,
      dispatch,
      disabledFlg,
      customizeTable,
      customizeFilterForm,
      fetchTableLoading,
      supplierContactFlag,
      tableData: supplierTable,
      pagination: supplierPagination,
      onHandleFetch: this.fetchTable, // 查询供应商列表
      onCreateModule: this.handleCreateModule,
      onClearEdit: this.handleClearEdit,
      onInputChange: this.handleInputChange,
      onHandleAddAll: this.handleAddAll,
      onSaveRecordRows: this.saveRecordRows,
      onRef: (ref) => {
        this.tableRef = ref;
      },
      notificationId,
      notificationStatus,
      onHandleGetOrderFormData: this.handleGetOrderFormData,
    };
    const { orderForm } = this;
    const uploadModalProps = {
      tenantId,
      btnProps: {
        icon: 'paper-clip',
      },
      viewOnly: disabledFlg,
      btnText: disabledFlg
        ? intl.get('hzero.common.upload.view').d('查看附件')
        : intl.get(`spfm.notice.view.message.title.attachment`).d('上传附件'),
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'spfm-business-order',
      attachmentUUID: !orderForm?.getFieldsValue()?.attachmentUuid
        ? attachmentUuid
        : orderForm?.getFieldsValue().attachmentUuid,
      showFilesNumber: false,
      fileSize: 500 * 1024 * 1024,
    };
    const operateProps = {
      notificationId,
      onRef: this.handleBindoperateRef,
    };
    const staticTextProps = {
      content: orderFormData.notificationContent,
      data: orderFormData.notificationContent,
      onEditorChange: this.onRichTextEditorChange,
      bucketName: PUBLIC_BUCKET,
      bucketDirectory: 'spfm-business-order',
    };
    const that = this;
    const { path = '' } = this.props?.match || { path: '' };
    const isPathPub = path.indexOf('/pub') === 0;
    const readOnlyFlag = path.includes('/spfm/business-order-publish/detail-readOnly/');
    console.log(isPathPub, orderFormData?.workflowBusinessKey);
    const headerButtons = () => {
      const buttons = [
        {
          name: 'publish',
          noNest: true,
          btnProps: { onClick: () => this.handleSaveOrder('publish') },
          child: () => (
            <Button
              type="primary"
              icon="rocket"
              loading={publishLoading}
              hidden={disabledFlg}
              disabled={notificationId === 'create'}
            >
              {intl.get(`hzero.common.button.release`).d('发布')}
            </Button>
          ),
        },
        {
          name: 'save',
          noNest: true,
          btnProps: { onClick: this.handleSaveOrder },
          child: () => (
            <Button icon="save" loading={saveLoading} hidden={disabledFlg}>
              {intl.get(`hzero.common.button.save`).d('保存')}
            </Button>
          ),
        },
        {
          name: 'approve',
          noNest: true,
          btnProps: { onClick: () => this.handleApprove('approve') },
          child: (text) => (
            <PermissionButton
              icon="check"
              loading={approveLoading}
              hidden={disabledApproveFlg}
              permissionList={[
                {
                  code: 'srm.bg.manager.portal.business-order-publish.button.approve',
                  type: 'button',
                },
              ]}
            >
              {text || intl.get('hzero.common.view.message.title.approved').d('审批通过')}
            </PermissionButton>
          ),
        },
        {
          name: 'reject',
          noNest: true,
          btnProps: { onClick: () => this.handleApprove('reject') },
          child: (text) => (
            <PermissionButton
              icon="exclamation-circle-o"
              loading={approveLoading}
              hidden={disabledApproveFlg}
              permissionList={[
                {
                  code: 'srm.bg.manager.portal.business-order-publish.button.reject',
                  type: 'button',
                },
              ]}
            >
              {text || intl.get('hzero.common.view.message.title.reject').d('审批拒绝')}
            </PermissionButton>
          ),
        },
        {
          name: 'attachment',
          noNest: true,
          child: () => <UploadModal {...uploadModalProps} />,
        },
        {
          name: 'workFlowApprove',
          noNest: true,
          btnProps: { onClick: this.handleWorkflowApprove },
          child: (text) => (
            <PermissionButton
              icon="exclamation-circle-o"
              loading={approveLoading}
              hidden={
                isPathPub ||
                !orderFormData?.workflowBusinessKey ||
                !['WORKFLOW_APPROVING'].includes(orderFormData.notificationStatus)
              }
              permissionList={[
                {
                  code: 'srm.bg.manager.portal.business-order-publish.button.workflowApprove',
                  type: 'button',
                },
              ]}
            >
              {text || intl.get('hzero.common.button.approval').d('审批')}
            </PermissionButton>
          ),
        },
        {
          name: 'workFlowRevoke',
          noNest: true,
          btnProps: { onClick: this.handleRevoke },
          child: (text) => (
            <PermissionButton
              icon="exclamation-circle-o"
              loading={approveLoading}
              hidden={
                isPathPub ||
                !orderFormData?.workflowBusinessKey ||
                !['WORKFLOW_APPROVING'].includes(orderFormData.notificationStatus)
              }
              permissionList={[
                {
                  code: 'srm.bg.manager.portal.business-order-publish.button.revoke',
                  type: 'button',
                },
              ]}
            >
              {text || intl.get('hzero.common.button.revokeApproval').d('撤销审批')}
            </PermissionButton>
          ),
        },
        {
          name: 'delete',
          noNest: true,
          btnProps: { onClick: this.handleDeteleOrder },
          child: () => (
            <Button
              icon="delete"
              loading={deleteLoading}
              hidden={!['NEW', 'NOT_RECEIVE'].includes(orderFormData.notificationStatus)}
            >
              {intl.get('hzero.common.button.delete').d('删除')}
            </Button>
          ),
        },
        {
          name: 'operate',
          noNest: true,
          btnProps: { onClick: this.handShowOperate },
          child: () => (
            <Button icon="edit" hidden={notificationId === 'create'}>
              {intl.get(`hzero.common.button.operated`).d('操作记录')}
            </Button>
          ),
        },
      ];
      if (typeof handleCuxButtons === 'function') {
        const cuxButtons = handleCuxButtons({ that, supplierDs });
        buttons.push(cuxButtons);
      }
      return buttons;
    };
    return (
      <React.Fragment>
        <Header
          title={intl.get(`spfm.businessOrder.view.title.detail`).d('业务通知单明细')}
          backPath={readOnlyFlag ? '' : '/spfm/business-order-publish/list'}
        >
          {!readOnlyFlag &&
            customizeBtnGroup(
              {
                code: 'SPFM.PORTAL.BUSINESSORDER.PUBLISH.DETAIL.HEADER.BUTTONS',
                pro: true,
              },
              <DynamicButtons buttons={headerButtons()} />
            )}
        </Header>
        <Content>
          <Spin
            spinning={loading || saveLoading}
            wrapperClassName={classnames('ued-detail-wrapper')}
          >
            <Row gutter={48} style={{ marginTop: '-12px' }}>
              <Col span={24}>
                <Card
                  bordered={false}
                  className={DETAIL_CARD_CLASSNAME}
                  title={intl.get('spfm.businessOrder.view.message.baseInfo').d('基本信息')}
                >
                  <BusinessOrderLine {...filterProps} readOnlyFlag={readOnlyFlag} />
                </Card>
              </Col>
            </Row>
            <Row gutter={48} style={{ marginTop: '-12px' }}>
              <Col span={24}>
                <Card
                  bordered={false}
                  title={intl.get('spfm.businessOrder.view.message.selectSupplier').d('选择供应商')}
                  className={DETAIL_CARD_TABLE_CLASSNAME}
                >
                  <SupplierTable {...tableProps} readOnlyFlag={readOnlyFlag} remote={remote} />
                </Card>
              </Col>
            </Row>
            <Row gutter={48} style={{ marginTop: '-12px' }}>
              <Col span={24}>
                <Card
                  bordered={false}
                  title={intl.get('spfm.businessOrder.view.message.tinymceEditor').d('通知编辑')}
                  className={DETAIL_CARD_TABLE_CLASSNAME}
                >
                  {disabledFlg || readOnlyFlag ? (
                    <div dangerouslySetInnerHTML={{ __html: orderFormData.notificationContent }} />
                  ) : (
                    <Form.Item>
                      {orderFormData.notificationContent !== undefined && (
                        <RichTextEditor {...staticTextProps} />
                      )}
                    </Form.Item>
                  )}
                </Card>
              </Col>
            </Row>
          </Spin>
        </Content>
        <OperateRecord {...operateProps} />
      </React.Fragment>
    );
  }
}
