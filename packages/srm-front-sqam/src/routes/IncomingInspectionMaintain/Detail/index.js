/*
 * index - 需求维护明细页面
 * @date: 2019-12-5
 * @author: gzq <zhiqiang.guo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { Spin, Collapse, Icon, Form, Tabs, Button, Modal } from 'hzero-ui';
import { connect } from 'dva';
import moment from 'moment';
import classnames from 'classnames';
import { Bind } from 'lodash-decorators';
import { isEmpty, isArray, throttle } from 'lodash';
import uuid from 'uuid/v4';
import { queryFileListOrg, queryIdpValue } from 'services/api';
import { Button as PermissionButton } from 'components/Permission';
import { getActiveTabKey, refreshTab } from 'utils/menuTab';

import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import formatterCollections from 'utils/intl/formatterCollections';
import { DETAIL_DEFAULT_CLASSNAME, DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import UploadModal from '_components/Upload';
import { createPagination } from 'utils/utils';
import OperationRecord from '@/routes/components/OperationRecord/OperationRecordCopy';
import notification from 'utils/notification';

import BaseInfo from './BaseInfo';
import DetectionAnalysis from './DetectionAnalysis';
import InspectionData from './InspectionData';
import DefectList from './DefectList';
import DetectionList from './DetectionList';

// import styles from './index.less';

const { Panel } = Collapse;
const { TabPane } = Tabs;
const promptCode = 'sqam.incomingInspectionQuery';

/**
 * Detail - 业务组件 - 送货单创建明细
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {!Object} [incomingInspectionQuery={}] - 数据源
 * @reactProps {!Object} [loading={}] - 岗位信息加载是否完成
 * @reactProps {!Object} [loading.effect={}] - 岗位信息加载是否完成
 * @reactProps {boolean} [getHeaderAttachmentUuidLoading=false] - 获取附件uuid处理中
 * @reactProps {boolean} [deleteDetailLinesLoading=false] - 删除明细行处理中
 * @reactProps {boolean} [submitDeliveryLoading=false] - 提交送货单处理中
 * @reactProps {boolean} [deleteDeliveryLoading=false] - 删除送货单处理中
 * @reactProps {boolean} [queryCreateListLoading=false] - 查询可创建行处理中
 * @reactProps {boolean} [queryMaintenanceListLoading=false] - 查询可维护行处理中
 * @reactProps {boolean} [queryDetailHeaderLoading=false] - 查询明细头处理中
 * @reactProps {boolean} [queryDetailListLoading=false] - 查询明细行处理中
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */
@withCustomize({
  unitCode: [
    'SQAM.INCOMING_INSPECTION_CREATE_DETAIL.BASIC',
    'SQAM.INCOMING_INSPECTION_CREATE_DETAIL.ANALYSIS',
    'SQAM.INCOMING_INSPECTION_CREATE_DETAIL.DATA',
    'SQAM.INCOMING_INSPECTION_CREATE_DETAIL.COLLAPSE',
  ],
})
@Form.create({ fieldNameProp: null })
@connect(({ loading = {}, incomingInspectionMaintain = {} }) => ({
  fetchDetailHeaderLoading: loading.effects['incomingInspectionMaintain/fetchDetailHeader'],
  fetchDetectionListLoading: loading.effects['incomingInspectionMaintain/fetchDetectionList'],
  fetchDefectListLoading: loading.effects['incomingInspectionMaintain/fetchDefectList'],
  fetchOperationRecordListLoading:
    loading.effects['incomingInspectionMaintain/fetchOperationRecordList'],
  fetchApprovalRecordListLoading:
    loading.effects['incomingInspectionMaintain/fetchApprovalRecordList'],
  fetchSaveLoading: loading.effects['incomingInspectionMaintain/fetchSave'],
  fetchSubmitLoading: loading.effects['incomingInspectionMaintain/submitData'],
  fetchDeleteLoading: loading.effects['incomingInspectionMaintain/deleteData'],
  fetchBarCodeLoading: loading.effects['incomingInspectionMaintain/barCode'],
  detailHeader: incomingInspectionMaintain.detailHeader || {},
  detectionList: incomingInspectionMaintain.detectionList || {},
  defectList: incomingInspectionMaintain.defectList || {},
  enumMap: incomingInspectionMaintain.enumMap,
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
export default class Detail extends PureComponent {
  state = {
    collapseKeys: ['baseinfo', 'detectionAnalysis', 'inspectionData'],
    fileNum: 0,
    activeKey: 'operator',
    showTables: false,
    approvalRecordList: [],
  };

  async componentDidMount() {
    const { match, dispatch } = this.props;
    const { params = {} } = match;
    const { id } = params;
    if (id !== 'create') {
      const lovTagsValue = await this.lovTagValues();
      const res = await this.fetchDetailHeader();
      this.handleApprovalRecordSearch(res);
      this.handleOperationRecordSearch();
      const { dataSource } = res || {};
      const showTables = dataSource
        ? dataSource === 'SAP' || lovTagsValue[dataSource] === 'showdetails'
        : false;
      this.setState({
        showTables,
      });
    }
    dispatch({
      type: 'incomingInspectionMaintain/fetchEnum',
    });
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'incomingInspectionMaintain/updateState',
      payload: {
        detailHeader: {},
        detectionList: { list: [], pagination: {} },
        defectList: { list: [], pagination: {} },
      },
    });
  }

  @Bind()
  async lovTagValues() {
    const res = await queryIdpValue('SQAM.INSPECTION_SOURCE');
    const lovObj = {};
    if (res) {
      res.forEach((elem) => {
        const { value, tag } = elem;
        lovObj[value] = tag;
      });
    }
    return lovObj;
  }

  @Bind()
  handleTabKey = (key) => {
    this.setState({ activeKey: key });
  };

  /**
   * fetchDetectionList - 查询检测细项列表
   * @param {object} params - 查询条件
   */
  @Bind()
  fetchDetectionList(page) {
    const { dispatch, match } = this.props;
    const { params = {} } = match;
    const { id } = params;
    dispatch({
      type: 'incomingInspectionMaintain/fetchDetectionList',
      payload: { id, page },
    });
  }

  /**
   * fetchDefectList - 查询缺陷细项列表
   * @param {object} params - 查询条件
   */
  @Bind()
  fetchDefectList(page) {
    const { dispatch, match } = this.props;
    const { params = {} } = match;
    const { id } = params;
    dispatch({
      type: 'incomingInspectionMaintain/fetchDefectList',
      payload: { id, page },
    });
  }

  /**
   * fetch风险评估报告详情
   */
  @Bind()
  async fetchDetailHeader() {
    const { dispatch, match } = this.props;
    const { params = {} } = match;
    const { id } = params;
    const res = await dispatch({
      type: 'incomingInspectionMaintain/fetchDetailHeader',
      payload: {
        id,
        customizeUnitCode:
          'SQAM.INCOMING_INSPECTION_CREATE_DETAIL.BASIC,SQAM.INCOMING_INSPECTION_CREATE_DETAIL.DATA,SQAM.INCOMING_INSPECTION_CREATE_DETAIL.ANALYSIS',
      },
    });
    if (res) {
      this.fetchFileNum();
    }
    return res;
  }

  @Bind()
  fetchFileNum() {
    const { detailHeader = {} } = this.props;
    const { purchaseAttachmentUuid } = detailHeader;
    queryFileListOrg({
      attachmentUUID: purchaseAttachmentUuid || uuid(),
      bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
      bucketDirectory: 'sqam-claim',
    }).then((res) => {
      if (res) {
        this.setState({
          fileNum: res.length,
        });
      }
    });
  }

  /**
   * onCollapseChange - 折叠面板onChange
   * @param {Array<string>} collapseKeys - Panels key
   */
  @Bind()
  onCollapseChange(collapseKeys) {
    this.setState({
      collapseKeys,
    });
  }

  @Bind()
  handleModalVisible(flag, val) {
    this.setState({ [flag]: val });
    if (flag === 'operationRecordModalVisible' && !val) {
      this.setState({ activeKey: 'operator' });
    }
  }

  /**
   * afterOpenHeaderUploadModal - 头附件弹窗打开后判断是否获取uuid
   * @param {!Array<object>} attachmentUuid - 附件uuid
   */
  @Bind()
  afterOpenUploadModal(attachmentUuidArg) {
    const { detailHeader = {} } = this.props;
    const { purchaseAttachmentUuid } = detailHeader;
    if (isEmpty(purchaseAttachmentUuid)) {
      this.bindHeaderAttachmentUuid(attachmentUuidArg);
    }
  }

  /**
   * bindHeaderAttachmentUuid - 绑定头附件id
   * @param {!string} attachmentUuid - 附件uuid返回值
   */
  @Bind()
  bindHeaderAttachmentUuid(attachmentUuidArg) {
    const { dispatch, detailHeader } = this.props;
    const { inspectionId } = detailHeader;
    dispatch({
      type: 'incomingInspectionMaintain/fetchSaveAttachmentUuid',
      payload: { inspectionId, purchaseAttachmentUuid: attachmentUuidArg },
    }).then((res) => {
      if (res) {
        this.fetchDetailHeader();
      }
    });
  }

  /**
   * 查询操作记录列表
   * @param {Object} fields 查询字段
   */
  @Bind()
  handleOperationRecordSearch(page = {}) {
    const { dispatch, match } = this.props;
    const { params = {} } = match;
    const { id } = params;
    dispatch({
      type: 'incomingInspectionMaintain/fetchOperationRecordList',
      payload: {
        inspectionId: id,
        page,
      },
    }).then((result) => {
      if (result) {
        this.setState({
          operationRecordList: result.content,
          operationRecordPagination: createPagination(result),
        });
      }
    });
  }

  /**
   * 查询审批记录列表
   * @param {Object} fields 查询字段
   */
  @Bind()
  handleApprovalRecordSearch(res) {
    const { dispatch, detailHeader } = this.props;
    const businessKey = detailHeader?.businessKey || res?.businessKey;
    if (!businessKey) return;
    dispatch({
      type: 'incomingInspectionMaintain/fetchApprovalRecordList',
      payload: {
        businessKey,
      },
    }).then((result) => {
      if (isArray(result) && !isEmpty(result)) {
        this.setState({
          approvalRecordList: result
            .map((item) => item.historicTaskExtList)
            .flat()
            .reverse(),
          // approvalRecordPagination: createPagination(result),
        });
      }
    });
  }

  /**
   * 保存
   */
  @Bind()
  handleSave() {
    const { dispatch, form, detailHeader, history } = this.props;
    form.validateFields((err, value) => {
      if (err) return;
      const { startDate, endDate, inspectionState, supplierCompanyIdStash, ...vals } = value;
      const newStartDate = startDate ? moment(startDate).format(DATETIME_MIN) : null;
      const newEndDate = endDate ? moment(endDate).format(DATETIME_MAX) : null;
      dispatch({
        type: 'incomingInspectionMaintain/fetchSave',
        payload: {
          ...detailHeader,
          ...vals,
          startDate: newStartDate,
          endDate: newEndDate,
          inspectionState: inspectionState || 'UNTREATED',
          supplierCompanyId: supplierCompanyIdStash,
          checkAttachmentUuid: detailHeader.checkAttachmentUuid,
          customizeUnitCode:
            'SQAM.INCOMING_INSPECTION_CREATE_DETAIL.BASIC,SQAM.INCOMING_INSPECTION_CREATE_DETAIL.DATA,SQAM.INCOMING_INSPECTION_CREATE_DETAIL.ANALYSIS',
        },
      }).then((res) => {
        if (res) {
          const { inspectionId } = res;
          notification.success();
          refreshTab(getActiveTabKey());
          history.push(`/sqam/incoming-inspection-maintain/detail/${inspectionId}`);
        }
      });
    });
  }

  @Bind()
  handleSubmit() {
    const { dispatch, form, detailHeader, history } = this.props;
    form.validateFields((err, value) => {
      if (err) return;
      const { startDate, endDate, supplierCompanyIdStash, ...vals } = value;
      const newStartDate = startDate ? moment(startDate).format(DATETIME_MIN) : null;
      const newEndDate = endDate ? moment(endDate).format(DATETIME_MAX) : null;
      Modal.confirm({
        title: intl.get(`sqam.common.view.message.confirm.submitFlag`).d('是否确认提交'),
        onOk: () => {
          dispatch({
            type: 'incomingInspectionMaintain/submitData',
            payload: [
              {
                ...detailHeader,
                ...vals,
                startDate: newStartDate,
                endDate: newEndDate,
                supplierCompanyId: supplierCompanyIdStash,
                customizeUnitCode:
                  'SQAM.INCOMING_INSPECTION_CREATE_DETAIL.BASIC,SQAM.INCOMING_INSPECTION_CREATE_DETAIL.DATA,SQAM.INCOMING_INSPECTION_CREATE_DETAIL.ANALYSIS',
                checkAttachmentUuid: detailHeader.checkAttachmentUuid,
              },
            ],
          }).then((res) => {
            if (res) {
              notification.success();
              history.push(`/sqam/incoming-inspection-maintain/list`);
            }
          });
        },
      });
    });
  }

  @Bind()
  handleDelete() {
    const { dispatch, detailHeader, history } = this.props;
    Modal.confirm({
      title: intl.get(`sqam.common.view.message.confirm.deleteFlag`).d('是否确认删除'),
      onOk: () => {
        dispatch({
          type: 'incomingInspectionMaintain/deleteData',
          payload: {
            customizeUnitCode:
              'SQAM.INCOMING_INSPECTION_CREATE_DETAIL.BASIC,SQAM.INCOMING_INSPECTION_CREATE_DETAIL.DATA,SQAM.INCOMING_INSPECTION_CREATE_DETAIL.ANALYSIS',
            ...detailHeader,
          },
        }).then((res) => {
          if (res) {
            notification.success();
            history.push(`/sqam/incoming-inspection-maintain/list`);
          }
        });
      },
    });
  }

  @Bind()
  seeCode() {
    const { dispatch, detailHeader } = this.props;
    const { itemCode } = detailHeader;
    dispatch({
      type: 'incomingInspectionMaintain/barCode',
      payload: {
        itemCode,
      },
    }).then((res) => {
      if (res) {
        const file = new Blob([res], { type: 'application/PNG' });
        // const fileURL = URL.createObjectURL(file);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
          const base64data = reader.result;
          const img = new Image();
          img.src = base64data;
          img.width = 300;
          img.style.position = 'absolute';
          img.style.top = '0';
          img.style.left = '0';
          img.style.right = '0';
          img.style.bottom = '0';
          img.style.margin = ' auto';
          const newWin = window.open('', '_blank');
          if (newWin) {
            newWin.document.write(img.outerHTML);
            newWin.document.title = intl.get('sqam.common.model.inspection.barCode').d('条形码');
          }
        };
      }
    });
  }

  @Bind()
  setModelDetailHeader(json) {
    const { dispatch, detailHeader } = this.props;
    dispatch({
      type: 'incomingInspectionMaintain/updateState',
      payload: { detailHeader: { ...detailHeader, ...json } },
    });
  }

  render() {
    const {
      match,
      form,
      fetchDetailHeaderLoading = false,
      detailHeader = {},
      detectionList = {},
      defectList = {},
      enumMap,
      fetchDefectListLoading = false,
      fetchDetectionListLoading = false,
      fetchOperationRecordListLoading = false,
      fetchApprovalRecordListLoading = false,
      fetchSaveLoading = false,
      fetchSubmitLoading = false,
      fetchDeleteLoading = false,
      fetchBarCodeLoading = false,
      customizeForm,
      customizeCollapse,
    } = this.props;
    const { params = {} } = match;
    const { id } = params;
    const {
      collapseKeys,
      operationRecordModalVisible,
      operationRecordPagination,
      approvalRecordPagination,
      operationRecordList,
      approvalRecordList,
      fileNum,
      activeKey,
      showTables,
    } = this.state;
    const createFlag = id === 'create';
    const quoteFlag = detailHeader.dataSource === 'REFERENCE';
    const inspectionDataProps = {
      form,
      detailHeader,
      quoteFlag,
      setModelDetailHeader: this.setModelDetailHeader,
      customizeForm,
    };
    const baseInfoProps = {
      form,
      detailHeader,
      enumMap,
      createFlag,
      quoteFlag,
      setModelDetailHeader: this.setModelDetailHeader,
      customizeForm,
    };
    const detectionAnalysisProps = {
      form,
      detailHeader,
      enumMap,
      setModelDetailHeader: this.setModelDetailHeader,
      customizeForm,
    };
    const detectionListProps = {
      fetchList: this.fetchDetectionList,
      detectionList,
      fetchListLoading: fetchDetectionListLoading,
      id,
    };
    const defectListProps = {
      fetchList: this.fetchDefectList,
      defectList,
      fetchListLoading: fetchDefectListLoading,
      id,
    };
    const { inspectionId, purchaseAttachmentUuid, inspectionState } = detailHeader;
    const uploadModalProps = {
      btnText: `${intl.get(`entity.attachment.view`).d('附件查看')}(${fileNum})`,
      btnProps: {
        icon: 'upload',
        disabled: !inspectionId,
      },
      showFilesNumber: false,
      attachmentUUID: purchaseAttachmentUuid,
      afterOpenUploadModal: (attachmentUuid) => this.afterOpenUploadModal(attachmentUuid),
      bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
      bucketDirectory: 'sqam-claim',
      uploadSuccess: this.fetchDetailHeader,
      removeCallback: this.fetchDetailHeader,
    };
    const operationRecordProps = {
      pagination: operationRecordPagination,
      approvalPagination: approvalRecordPagination,
      dataSource: operationRecordList,
      approvalDataSource: approvalRecordList,
      visible: operationRecordModalVisible,
      loading: fetchOperationRecordListLoading,
      approvalLoading: fetchApprovalRecordListLoading,
      handleOperationRecordSearch: this.handleOperationRecordSearch,
      handleApprovalRecordSearch: this.handleApprovalRecordSearch,
      hideModal: () => this.handleModalVisible('operationRecordModalVisible', false),
      activeKey,
      handleTabKey: this.handleTabKey,
    };
    const loading =
      fetchSaveLoading || fetchSubmitLoading || fetchDeleteLoading || fetchBarCodeLoading;
    return (
      <Fragment>
        <Header
          title={intl
            .get(`${promptCode}.view.message.title.qualityInspectionMaintain`)
            .d('质量检验单维护')}
          backPath="/sqam/incoming-inspection-maintain/list"
        >
          {(createFlag || inspectionState === 'UNTREATED') && (
            <Button
              icon="save"
              type="primary"
              loading={loading}
              onClick={throttle(this.handleSave, 1500, { trailing: false })}
            >
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
          )}
          {(createFlag || inspectionState === 'UNTREATED') && (
            <Button
              icon="submit"
              loading={loading}
              onClick={throttle(this.handleSubmit, 1500, { trailing: false })}
            >
              {intl.get('hzero.common.button.submit').d('提交')}
            </Button>
          )}
          {inspectionState === 'UNTREATED' && (
            <PermissionButton
              icon="delete"
              onClick={throttle(this.handleDelete, 1500, { trailing: false })}
              loading={loading}
              permissionList={[
                {
                  code: `srm.sqam.business.incoming-inspection.incoming-inspection-maintain.ps.detail.delete`,
                  type: 'button',
                },
              ]}
            >
              {intl.get('hzero.common.button.delete').d('删除')}
            </PermissionButton>
          )}
          <UploadModal {...uploadModalProps} />
          <Button
            disabled={!inspectionId}
            icon="clock-circle-o"
            onClick={() => this.handleModalVisible('operationRecordModalVisible', true)}
          >
            {`${intl.get('sqam.common.button.approval').d('审批')}/`}
            {intl.get('hzero.common.button.operating').d('操作记录')}
          </Button>
          <PermissionButton
            disabled={!inspectionId}
            loading={loading}
            onClick={throttle(this.seeCode, 1500, { trailing: false })}
            permissionList={[
              {
                code: `srm.sqam.business.incoming-inspection.incoming-inspection-maintain.ps.detail.viewcode`,
                type: 'button',
              },
            ]}
          >
            {intl.get('hzero.common.button.viewCode').d('查看条形码')}
          </PermissionButton>
        </Header>
        <Content wrapperClassName={classnames(DETAIL_DEFAULT_CLASSNAME)}>
          <Spin spinning={fetchDetailHeaderLoading}>
            {customizeCollapse(
              {
                code: 'SQAM.INCOMING_INSPECTION_CREATE_DETAIL.COLLAPSE',
              },
              <Collapse
                forceRender
                className="form-collapse"
                defaultActiveKey={collapseKeys}
                onChange={this.onCollapseChange}
              >
                <Panel
                  showArrow={false}
                  forceRender
                  header={
                    <Fragment>
                      <h3>{intl.get(`${promptCode}.view.message.title.baseinfo`).d('基本信息')}</h3>
                      <a>
                        {collapseKeys.includes('baseinfo')
                          ? intl.get(`hzero.common.button.up`).d('收起')
                          : intl.get(`hzero.common.button.expand`).d('展开')}
                      </a>
                      <Icon type={collapseKeys.includes('baseinfo') ? 'up' : 'down'} />
                    </Fragment>
                  }
                  key="baseinfo"
                >
                  <BaseInfo {...baseInfoProps} />
                </Panel>
                <Panel
                  showArrow={false}
                  forceRender
                  header={
                    <Fragment>
                      <h3>
                        {intl.get(`${promptCode}.view.message.title.inspectionData`).d('检验数据')}
                      </h3>
                      <a>
                        {collapseKeys.includes('detectionAnalysis')
                          ? intl.get(`hzero.common.button.up`).d('收起')
                          : intl.get(`hzero.common.button.expand`).d('展开')}
                      </a>
                      <Icon type={collapseKeys.includes('detectionAnalysis') ? 'up' : 'down'} />
                    </Fragment>
                  }
                  key="detectionAnalysis"
                >
                  <InspectionData {...inspectionDataProps} />
                </Panel>
                <Panel
                  showArrow={false}
                  forceRender
                  header={
                    <Fragment>
                      <h3>
                        {intl
                          .get(`${promptCode}.view.message.title.detectionAnalysis`)
                          .d('检测分析')}
                      </h3>
                      <a>
                        {collapseKeys.includes('inspectionData')
                          ? intl.get(`hzero.common.button.up`).d('收起')
                          : intl.get(`hzero.common.button.expand`).d('展开')}
                      </a>
                      <Icon type={collapseKeys.includes('inspectionData') ? 'up' : 'down'} />
                    </Fragment>
                  }
                  key="inspectionData"
                >
                  <DetectionAnalysis {...detectionAnalysisProps} />
                </Panel>
              </Collapse>
            )}
          </Spin>
          {showTables && (
            <Tabs animated={false}>
              <TabPane
                tab={intl
                  .get(`${promptCode}.view.message.title.detectionDetailedItems`)
                  .d('检测细项')}
                key="1"
              >
                <DetectionList {...detectionListProps} />
              </TabPane>
              <TabPane
                tab={intl.get(`${promptCode}.view.message.title.DefectsItems`).d('缺陷细项')}
                key="2"
              >
                <DefectList {...defectListProps} />
              </TabPane>
            </Tabs>
          )}
          {operationRecordModalVisible && <OperationRecord {...operationRecordProps} />}
        </Content>
      </Fragment>
    );
  }
}
