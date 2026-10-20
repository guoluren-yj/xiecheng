/**
 * 质检结果查询详情页
 * @date: 2020-4-9
 * @author: JSS <shangshang.jing@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { Spin, Collapse, Icon, Form, Tabs } from 'hzero-ui';
import { connect } from 'dva';
import classnames from 'classnames';
import { Bind, Throttle } from 'lodash-decorators';
import uuid from 'uuid/v4';
import { queryFileListOrg, queryIdpValue } from 'services/api';

import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { DETAIL_DEFAULT_CLASSNAME } from 'utils/constants';
import UploadModal from '_components/Upload';
import { createPagination, getCurrentOrganizationId } from 'utils/utils';
import OperationRecord from '@/routes/components/OperationRecord/OperationRecordCopy';
import notification from 'utils/notification';
import PrintProButton from '_components/PrintProButton';
import { Button as PermissionButton } from 'components/Permission';
import { SRM_SQAM } from '_utils/config';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import DynamicButtons from '_components/DynamicButtons';
import remote from 'hzero-front/lib/utils/remote';

import BaseInfo from './BaseInfo';
import DetectionAnalysis from './DetectionAnalysis';
import InspectionData from './InspectionData';
import DefectList from './DefectList';
import DetectionList from './DetectionList';

// import styles from './index.less';

const { Panel } = Collapse;
const { TabPane } = Tabs;
const promptCode = 'sqam.incomingInspectionQuery';
const organizationId = getCurrentOrganizationId();
const customUnitCode = [
  'SQAM.INCOMING_INSPECTION_QUERY_DETAIL.BASIC',
  'SQAM.INCOMING_INSPECTION_QUERY_DETAIL.DATA',
  'SQAM.INCOMING_INSPECTION_QUERY_DETAIL.ANALYSIS',
  'SQAM.QUALITY_RESULT_DETAIL.BTNS',
];

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
  code: 'SQAM_QUALITY_RESULT_DETAIL_CUX',
  name: 'remote',
})
@Form.create({ fieldNameProp: null })
@connect(({ loading = {}, qualityResult = {} }) => ({
  fetchDetailHeaderLoading: loading.effects['qualityResult/fetchDetailHeader'],
  fetchDetectionListLoading: loading.effects['qualityResult/fetchDetectionList'],
  fetchDefectListLoading: loading.effects['qualityResult/fetchDefectList'],
  fetchOperationRecordListLoading: loading.effects['qualityResult/fetchOperationRecordList'],
  printLoading: loading.effects['qualityResult/fetchRecordPrint'],
  detailHeader: qualityResult.detailHeader || {},
  detectionList: qualityResult.detectionList || {},
  defectList: qualityResult.defectList || {},
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
@withCustomize({
  unitCode: customUnitCode,
})
export default class Detail extends PureComponent {
  state = {
    collapseKeys: ['baseinfo', 'detectionAnalysis', 'inspectionData'],
    showTables: false,
  };

  async componentDidMount() {
    const res = await this.fetchDetailHeader();
    const lovTagsValue = await this.lovTagValues();
    this.handleOperationRecordSearch();
    const { dataSource } = res || {};
    const showTables = dataSource
      ? dataSource === 'SAP' || lovTagsValue[dataSource] === 'showdetails'
      : false;
    this.setState({
      showTables,
    });
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'qualityResult/updateState',
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
        type: 'qualityResult/fetchDetectionList',
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
        type: 'qualityResult/fetchDefectList',
        payload: { id: inspectionId, page },
      });
    }
  }

  /**
   * fetch风险评估报告详情
   */
  @Bind()
  async fetchDetailHeader() {
    const { dispatch, match } = this.props;
    const { params = {}, path = '' } = match;
    const { id } = params;
    const res = await dispatch({
      type: 'qualityResult/fetchDetailHeader',
      payload: {
        id,
        customizeUnitCode: customUnitCode.join(),
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
        type: 'qualityResult/fetchOperationRecordList',
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

  // 打印相关的逻辑
  @Bind()
  handlePrint() {
    const { dispatch, detailHeader } = this.props;
    const { inspectionId } = detailHeader;
    dispatch({
      type: 'qualityResult/fetchRecordPrint',
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

  @Bind()
  headerBtns() {
    const {
      fetchDetailHeaderLoading = false,
      detailHeader = {},
      fetchDefectListLoading = false,
      fetchDetectionListLoading = false,
      fetchOperationRecordListLoading = false,
      printLoading = false,
      remote: remoteProps,
    } = this.props;
    const { inspectionId, purchaseAttachmentUuid } = detailHeader;
    const loading =
      fetchDetailHeaderLoading ||
      fetchDefectListLoading ||
      fetchDetectionListLoading ||
      fetchOperationRecordListLoading ||
      printLoading;
    const { fileNum } = this.state;
    const allBtns = [
      {
        name: 'newPrint',
        btnComp: PrintProButton,
        childFor: 'buttonText',
        child: intl.get('sqam.common.view.button.printNew').d('新打印'),
        btnProps: {
          buttonProps: {
            disabled: !inspectionId,
            permissionList: [
              {
                code: 'srm.sqam.business.incoming-inspection.quality-result.button.printnew',
                type: 'button',
              },
            ],
          },
          requestUrl: `${SRM_SQAM}/v1/${organizationId}/incoming-inspections/list-print-new`,
          method: 'PUT',
          data: { incomingInspectionIdList: [inspectionId] },
          loading,
        },
      },
      {
        name: 'print',
        btnComp: PermissionButton,
        child: intl.get('hzero.common.button.print').d('打印'),
        btnProps: {
          loading,
          icon: 'printer',
          onClick: () => Throttle(this.handlePrint(), 2000),
          disabled: !inspectionId,
          permissionList: [
            {
              code: `srm.sqam.business.incoming-inspection.quality-result.button.print`,
              type: 'button',
            },
          ],
        },
      },
      {
        name: 'attachment',
        btnComp: UploadModal,
        btnProps: {
          viewOnly: true,
          showFilesNumber: false,
          attachmentUUID: purchaseAttachmentUuid,
          bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
          bucketDirectory: 'sqam-claim',
          btnText: `${intl.get(`entity.attachment.view`).d('附件查看')}(${fileNum || ''})`,
          btnProps: {
            icon: 'paper-clip',
            disabled: !inspectionId,
            loading,
          },
        },
      },
      {
        name: 'operate',
        child: intl.get('hzero.common.button.operating').d('操作记录'),
        btnProps: {
          loading,
          icon: 'clock-circle-o',
          type: 'primary',
          onClick: () =>
            Throttle(this.handleModalVisible('operationRecordModalVisible', true), 2000),
          disabled: !inspectionId,
        },
      },
    ];
    const otherProps = {
      detailHeader,
      fetchDetailHeader: this.fetchDetailHeader,
    };
    return remoteProps
      ? remoteProps.process('SQAM_QUALITY_RESULT_DETAIL_CUX_BTNS', allBtns, otherProps)
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
      location: { state = {} },
      customizeForm,
      customizeBtnGroup,
    } = this.props;

    const {
      collapseKeys,
      operationRecordModalVisible,
      operationRecordPagination,
      operationRecordList,
      showTables,
    } = this.state;
    const inspectionDataProps = {
      form,
      detailHeader,
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
      isWorkFlow: false,
    };
    const backPath = state.backPath || '/sqam/quality-result/list';
    return (
      <Fragment>
        <Header
          title={intl.get(`${promptCode}.view.message.title.qualityResultQuery`).d('质检结果查询')}
          backPath={backPath}
        >
          {customizeBtnGroup(
            { code: 'SQAM.QUALITY_RESULT_DETAIL.BTNS', pro: true },
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
