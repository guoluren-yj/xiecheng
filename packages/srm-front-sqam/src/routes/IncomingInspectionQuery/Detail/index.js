/*
 * index - 需求维护明细页面
 * @date: 2019-12-5
 * @author: gzq <zhiqiang.guo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { Spin, Collapse, Icon, Form, Tabs } from 'hzero-ui';
import { connect } from 'dva';
import classnames from 'classnames';
import { Bind } from 'lodash-decorators';
import { isArray, isEmpty, throttle } from 'lodash';
import uuid from 'uuid/v4';
import { queryFileListOrg, queryIdpValue } from 'services/api';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import DynamicButtons from '_components/DynamicButtons';
import remote from 'hzero-front/lib/utils/remote';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { DETAIL_DEFAULT_CLASSNAME } from 'utils/constants';
import UploadModal from '_components/Upload';
import { createPagination, getResponse, filterNullValueObject } from 'utils/utils';
import { Button as PermissionButton } from 'components/Permission';
import notification from 'utils/notification';
import OperationRecord from '@/routes/components/OperationRecord/OperationRecordCopy';

import BaseInfo from '../../components/QualityInspect/BaseInfo';
import OtherInfo from '../../components/QualityInspect/OtherInfo';
import DetectionAnalysis from '../../components/QualityInspect/DetectionAnalysis';
import InspectionData from '../../components/QualityInspect/InspectionData';
import DefectList from '../../components/QualityInspect/DefectList';
import DetectionList from '../../components/QualityInspect/DetectionList';
import CancelDrawer from './CancelDrawer';

const { Panel } = Collapse;
const { TabPane } = Tabs;
const promptCode = 'sqam.incomingInspectionQuery';
const customizeUnitCode = [
  'SQAM.INCOMING_INSPECTION_QUERY_DETAIL.DATA',
  'SQAM.INCOMING_INSPECTION_QUERY_DETAIL.CANCEL',
  'SQAM.INCOMING_INSPECTION_QUERY_DETAIL.ANALYSIS',
  'SQAM.INCOMING_INSPECTION_QUERY_DETAIL.BASIC',
  'SQAM.INCOMING_INSPECTION_QUERY_DETAIL.BTNS',
];
const otherCustomizeCode = {
  EXPERIMENTAL: 'SQAM.INCOMING_INSPECTION_QUERY_DETAIL.OTHERONE',
  ASSEMBLY: 'SQAM.INCOMING_INSPECTION_QUERY_DETAIL.OTHERTWO',
  INSPECTION: 'SQAM.INCOMING_INSPECTION_QUERY_DETAIL.OTHERTHREE',
};
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
@remote({
  code: 'SQAM_INCOMING_INSPECTION_QUERY_DETAIL_CUX',
  name: 'remote',
})
@withCustomize({
  unitCode: [...customizeUnitCode, ...Object.values(otherCustomizeCode)],
})
@Form.create({ fieldNameProp: null })
@connect(({ loading = {}, incomingInspectionQuery = {} }) => ({
  fetchDetailHeaderLoading: loading.effects['incomingInspectionQuery/fetchDetailHeader'],
  fetchDetectionListLoading: loading.effects['incomingInspectionQuery/fetchDetectionList'],
  fetchDefectListLoading: loading.effects['incomingInspectionQuery/fetchDefectList'],
  fetchOperationRecordListLoading:
    loading.effects['incomingInspectionQuery/fetchOperationRecordList'],
  fetchApprovalRecordListLoading:
    loading.effects['incomingInspectionQuery/fetchApprovalRecordList'],
  fetchOtherLoading: loading.effects['incomingInspectionQuery/fetchOtherList'],
  cancelLoading: loading.effects['incomingInspectionQuery/fetchCancel'],
  detailHeader: incomingInspectionQuery.detailHeader || {},
  detectionList: incomingInspectionQuery.detectionList || {},
  defectList: incomingInspectionQuery.defectList || {},
  EXPERIMENTALList: incomingInspectionQuery.EXPERIMENTALList || {},
  ASSEMBLYList: incomingInspectionQuery.ASSEMBLYList || {},
  INSPECTIONList: incomingInspectionQuery.INSPECTIONList || {},
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
    'himp.commentImport',
  ],
})
export default class Detail extends PureComponent {
  state = {
    collapseKeys: ['baseinfo', 'detectionAnalysis', 'inspectionData'],
    fileNum: 0,
    activeKey: 'operator',
    showTables: false,
    cancelVisible: false,
    approvalRecordList: [],
  };

  async componentDidMount() {
    const res = await this.fetchDetailHeader();
    const lovTagsValue = await this.lovTagValues();
    this.handleApprovalRecordSearch(res);
    this.handleOperationRecordSearch();
    const { dataSource } = res || {};
    const showTables = dataSource
      ? dataSource === 'SAP' || lovTagsValue[dataSource] === 'showdetails'
      : false;
    this.setState({
      showTables,
    });
    this.searchOtherInfoList('EXPERIMENTAL');
    this.searchOtherInfoList('ASSEMBLY');
    this.searchOtherInfoList('INSPECTION');
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'incomingInspectionQuery/updateState',
      payload: {
        detailHeader: {},
        detectionList: { list: [], pagination: {} },
        defectList: { list: [], pagination: {} },
      },
    });
  }

  @Bind()
  searchOtherInfoList(queryType, page = {}) {
    const { dispatch, match = {} } = this.props;
    const { params = {} } = match;
    const { id } = params;
    if (id) {
      dispatch({
        type: 'incomingInspectionQuery/fetchOtherList',
        payload: { id, page, queryType, customizeUnitCode: otherCustomizeCode[queryType] },
      });
    }
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

  /**
   * fetchDetectionList - 查询检测细项列表
   * @param {object} params - 查询条件
   */
  @Bind()
  fetchDetectionList(page) {
    const { dispatch, detailHeader = {} } = this.props;
    const { inspectionId } = detailHeader;
    if (inspectionId) {
      dispatch({
        type: 'incomingInspectionQuery/fetchDetectionList',
        payload: { id: inspectionId, page },
      });
    }
  }

  /**
   * fetchDefectList - 查询缺陷细项列表
   * @param {object} params - 查询条件
   */
  @Bind()
  fetchDefectList(page) {
    const { dispatch, detailHeader = {} } = this.props;
    const { inspectionId } = detailHeader;
    if (inspectionId) {
      dispatch({
        type: 'incomingInspectionQuery/fetchDefectList',
        payload: { id: inspectionId, page },
      });
    }
  }

  @Bind()
  handleTabKey = (key) => {
    this.setState({ activeKey: key });
  };

  /**
   * fetch风险评估报告详情
   */
  @Bind()
  async fetchDetailHeader() {
    const { dispatch, match } = this.props;
    const { params = {}, path = '' } = match;
    const { id } = params;

    const res = await dispatch({
      type: 'incomingInspectionQuery/fetchDetailHeader',
      payload: {
        id,
        customizeUnitCode: customizeUnitCode.join(),
        pathSource: path,
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
   * 查询操作记录列表
   * @param {Object} fields 查询字段
   */
  @Bind()
  handleOperationRecordSearch(page = {}) {
    const { dispatch, detailHeader = {} } = this.props;
    const { inspectionId } = detailHeader;
    if (inspectionId) {
      dispatch({
        type: 'incomingInspectionQuery/fetchOperationRecordList',
        payload: {
          inspectionId,
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
  }

  /**
   * 查询审批记录列表
   * @param {Object} fields 查询字段
   */
  @Bind()
  handleApprovalRecordSearch(res) {
    const { dispatch, detailHeader } = this.props;
    const businessKey = detailHeader.businessKey || res?.businessKey;
    if (businessKey) {
      dispatch({
        type: 'incomingInspectionQuery/fetchApprovalRecordList',
        payload: {
          businessKey,
          // page,
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
  }

  // 打印相关的逻辑
  @Bind()
  handlePrint() {
    const { dispatch, detailHeader } = this.props;
    const { inspectionId } = detailHeader;
    dispatch({
      type: 'incomingInspectionQuery/fetchRecordPrint',
      payload: { inspectionId },
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

  // 取消操作
  @Bind()
  handleCancel(flag = false, cancelForm) {
    // eslint-disable-next-line react/no-unused-state
    this.setState({ cancelVisible: flag });
    if (!flag) {
      cancelForm.resetFields();
    }
  }

  @Bind()
  confirmCancel(cancelForm) {
    const { dispatch, detailHeader } = this.props;
    const customizeUnitCodes = [
      ...customizeUnitCode,
      'SQAM.INCOMING_INSPECTION_QUERY_DETAIL.CANCEL',
    ];
    cancelForm.validateFields((err, values) => {
      const IncomingInspectionDetailDTO = filterNullValueObject({ ...detailHeader, ...values });
      if (!err) {
        dispatch({
          type: 'incomingInspectionQuery/fetchCancel',
          payload: {
            IncomingInspectionDetailDTO,
            customizeUnitCode: customizeUnitCodes.join(),
          },
        }).then((res) => {
          if (getResponse(res)) {
            notification.success();
            this.fetchDetailHeader();
            this.handleCancel(false, cancelForm);
          }
        });
      }
    });
  }

  @Bind()
  headerBtns() {
    const { loading, detailHeader = {}, remote: remoteProps } = this.props;
    const { inspectionId, purchaseAttachmentUuid, inspectionState } = detailHeader;
    const { fileNum } = this.state;

    const allBtns = [
      ['PROCESSED'].includes(inspectionState) && {
        name: 'cancel',
        btnComp: PermissionButton,
        child: intl.get('hzero.common.button.cancel').d('取消'),
        btnProps: {
          loading,
          icon: 'close',
          onClick: throttle(() => this.handleCancel(true), 1500, { trailing: false }),
          disabled: !inspectionId,
          permissionList: [
            {
              code: `srm.sqam.business.incoming-inspection.incoming-inspection-query.ps.detail.cancel`,
              type: 'button',
            },
          ],
        },
      },
      {
        name: 'attachment',
        btnComp: UploadModal,
        btnProps: {
          icon: 'paper-clip',
          viewOnly: true,
          showFilesNumber: false,
          attachmentUUID: purchaseAttachmentUuid,
          bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
          bucketDirectory: 'sqam-claim',
          btnText: `${intl.get(`entity.attachment.view`).d('附件查看')}(${fileNum})`,
          btnProps: {
            icon: 'upload',
            disabled: !inspectionId,
            loading,
          },
        },
      },
      {
        name: 'operate',
        child: `${intl.get('sqam.common.button.approval').d('审批')}/${intl
          .get('hzero.common.button.operating')
          .d('操作记录')}`,
        btnProps: {
          loading,
          icon: 'clock-circle-o',
          type: 'primary',
          onClick: throttle(
            () => this.handleModalVisible('operationRecordModalVisible', true),
            1500,
            {
              trailing: false,
            }
          ),
          disabled: !inspectionId,
        },
      },
    ];
    const otherProps = {
      detailHeader,
      fetchDetailHeader: this.fetchDetailHeader,
    };
    return remoteProps
      ? remoteProps.process('SQAM_INCOMING_INSPECTION_QUERY_DETAIL_CUX_BTNS', allBtns, otherProps)
      : allBtns;
  }

  render() {
    const {
      form,
      fetchDetailHeaderLoading = false,
      detailHeader = {},
      detectionList = {},
      defectList = {},
      fetchDefectListLoading = false,
      fetchDetectionListLoading = false,
      fetchOperationRecordListLoading = false,
      fetchApprovalRecordListLoading = false,
      fetchOtherLoading = false,
      location: { state = {} },
      customizeForm,
      cancelLoading = false,
      customizeTable,
      EXPERIMENTALList,
      ASSEMBLYList,
      INSPECTIONList,
      customizeBtnGroup,
    } = this.props;
    const loading =
      fetchDetailHeaderLoading ||
      fetchDefectListLoading ||
      fetchDetectionListLoading ||
      fetchOperationRecordListLoading ||
      fetchApprovalRecordListLoading ||
      cancelLoading ||
      fetchOtherLoading;
    const {
      collapseKeys,
      operationRecordModalVisible,
      operationRecordPagination,
      operationRecordList,
      approvalRecordPagination,
      approvalRecordList,
      activeKey,
      showTables,
      cancelVisible,
    } = this.state;
    const inspectionDataProps = {
      form,
      detailHeader,
      code: 'SQAM.INCOMING_INSPECTION_QUERY_DETAIL.DATA',
      customizeForm,
    };
    const baseInfoProps = {
      form,
      detailHeader,
      customizeForm,
    };
    const detectionAnalysisProps = {
      form,
      detailHeader,
      customizeForm,
    };
    const detectionListProps = {
      fetchList: this.fetchDetectionList,
      detectionList,
      fetchListLoading: fetchDetectionListLoading,
    };
    const defectListProps = {
      fetchList: this.fetchDefectList,
      defectList,
      fetchListLoading: fetchDefectListLoading,
    };
    const operationRecordProps = {
      pagination: operationRecordPagination,
      dataSource: operationRecordList,
      visible: operationRecordModalVisible,
      loading: fetchOperationRecordListLoading,
      handleOperationRecordSearch: this.handleOperationRecordSearch,
      hideModal: () => this.handleModalVisible('operationRecordModalVisible', false),
      approvalPagination: approvalRecordPagination,
      approvalDataSource: approvalRecordList,
      approvalLoading: fetchApprovalRecordListLoading,
      handleApprovalRecordSearch: this.handleApprovalRecordSearch,
      activeKey,
      handleTabKey: this.handleTabKey,
    };
    const backPath = state.backPath || '/sqam/incoming-inspection-query/list';

    const cancelProps = {
      visible: cancelVisible,
      customizeForm,
      onHideDrawer: this.handleCancel,
      onConfirm: this.confirmCancel,
      cancelLoading,
    };
    const showOtherOneFlag = EXPERIMENTALList?.pagination?.total > 0;
    const showOtherTwoFlag = ASSEMBLYList?.pagination?.total > 0;
    const showOtherThreeFlag = INSPECTIONList?.pagination?.total > 0;
    // 其他信息1
    const otherOneProps = {
      customizeTable,
      dataSource: EXPERIMENTALList,
      handleSearch: this.searchOtherInfoList,
      queryType: 'EXPERIMENTAL',
      loading,
      code: otherCustomizeCode.EXPERIMENTAL,
    };
    // 其他信息2
    const otherTwoProps = {
      customizeTable,
      dataSource: ASSEMBLYList,
      handleSearch: this.searchOtherInfoList,
      queryType: 'ASSEMBLY',
      loading,
      code: otherCustomizeCode.ASSEMBLY,
    };
    const otherThreeProps = {
      customizeTable,
      dataSource: INSPECTIONList,
      handleSearch: this.searchOtherInfoList,
      queryType: 'INSPECTION',
      loading,
      code: otherCustomizeCode.INSPECTION,
    };
    return (
      <Fragment>
        <Header
          title={intl
            .get(`${promptCode}.view.message.title.qualityInspectionQuery`)
            .d('质量检验单查询')}
          backPath={backPath}
        >
          {customizeBtnGroup(
            { code: 'SQAM.INCOMING_INSPECTION_QUERY_DETAIL.BTNS', pro: true },
            <DynamicButtons buttons={this.headerBtns()} />
          )}
        </Header>
        <Content wrapperClassName={classnames(DETAIL_DEFAULT_CLASSNAME)}>
          <Spin spinning={fetchDetailHeaderLoading}>
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
                      {intl.get(`${promptCode}.view.message.title.detectionAnalysis`).d('检测分析')}
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
          </Spin>
          {(showTables || showOtherOneFlag || showOtherTwoFlag || showOtherTwoFlag) && (
            <Tabs animated={false}>
              {showTables && (
                <TabPane
                  tab={intl
                    .get(`${promptCode}.view.message.title.detectionDetailedItems`)
                    .d('检测细项')}
                  key="1"
                >
                  <DetectionList {...detectionListProps} />
                </TabPane>
              )}
              {showTables && (
                <TabPane
                  tab={intl.get(`${promptCode}.view.message.title.DefectsItems`).d('缺陷细项')}
                  key="2"
                >
                  <DefectList {...defectListProps} />
                </TabPane>
              )}
              {showOtherOneFlag && (
                <TabPane
                  tab={intl.get(`sqam.common.view.message.title.otherFirst`).d('其他明细信息1')}
                  key="3"
                >
                  <OtherInfo {...otherOneProps} />
                </TabPane>
              )}
              {showOtherTwoFlag && (
                <TabPane
                  tab={intl.get(`sqam.common.view.message.title.otherSecond`).d('其他明细信息2')}
                  key="4"
                >
                  <OtherInfo {...otherTwoProps} />
                </TabPane>
              )}
              {showOtherThreeFlag && (
                <TabPane
                  tab={intl.get(`sqam.common.view.message.title.otherThird`).d('其他明细信息3')}
                  key="5"
                >
                  <OtherInfo {...otherThreeProps} />
                </TabPane>
              )}
            </Tabs>
          )}
          {operationRecordModalVisible && <OperationRecord {...operationRecordProps} />}
        </Content>
        <CancelDrawer {...cancelProps} />
      </Fragment>
    );
  }
}
