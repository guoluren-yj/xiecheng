/*
 * index - 需求维护明细页面
 * @date: 2019-12-5
 * @author: gzq <zhiqiang.guo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { Spin, Collapse, Icon, Form, Tabs, Button, Row, Col, Input } from 'hzero-ui';
import { connect } from 'dva';
import classnames from 'classnames';
import { Bind } from 'lodash-decorators';
import { isArray, isEmpty, throttle } from 'lodash';
import uuid from 'uuid/v4';
import { routerRedux } from 'dva/router';
import { queryFileListOrg, queryIdpValue } from 'services/api';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { DETAIL_DEFAULT_CLASSNAME, EDIT_FORM_ROW_LAYOUT, FORM_COL_2_LAYOUT } from 'utils/constants';
import UploadModal from '_components/Upload';
import { createPagination } from 'utils/utils';
import OperationRecord from '@/routes/components/OperationRecord/OperationRecordCopy';

import BaseInfo from '../../components/QualityInspect/BaseInfo';
import DetectionAnalysis from '../../components/QualityInspect/DetectionAnalysis';
import InspectionData from '../../components/QualityInspect/InspectionData';
import DefectList from '../../components/QualityInspect/DefectList';
import DetectionList from '../../components/QualityInspect/DetectionList';
import styles from './index.less';

const { Panel } = Collapse;
const { TabPane } = Tabs;
const prefix = `sqam.qualityInspectApproval`;
const promptCode = 'sqam.incomingInspectionQuery';
const customUnitCode = [
  'SQAM.QUALITY_INSPECT_APPROVAL_DETAIL.DATA',
  'SQAM.INCOMING_INSPECTION_QUERY_DETAIL.ANALYSIS',
  'SQAM.INCOMING_INSPECTION_QUERY_DETAIL.BASIC',
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
@Form.create({ fieldNameProp: null })
@connect(({ loading = {}, qualityInspectApproval = {} }) => ({
  fetchDetailHeaderLoading: loading.effects['qualityInspectApproval/fetchDetailHeader'],
  fetchDetectionListLoading: loading.effects['qualityInspectApproval/fetchDetectionList'],
  fetchDefectListLoading: loading.effects['qualityInspectApproval/fetchDefectList'],
  fetchOperationRecordListLoading:
    loading.effects['qualityInspectApproval/fetchOperationRecordList'],
  approvalLoading: loading.effects['qualityInspectApproval/approval'],
  fetchApprovalRecordListLoading: loading.effects['qualityInspectApproval/fetchApprovalRecordList'],
  detailHeader: qualityInspectApproval.detailHeader || {},
  detectionList: qualityInspectApproval.detectionList || {},
  defectList: qualityInspectApproval.defectList || {},
}))
@formatterCollections({
  code: [
    'sqam.common',
    'sqam.qualityInspectApproval',
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
    fileNum: 0,
    activeKey: 'operator',
    showTables: false,
    approvalRecordList: [],
  };

  async componentDidMount() {
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

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'qualityInspectApproval/updateState',
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
    const { dispatch, match } = this.props;
    const { params = {} } = match;
    const { id } = params;
    dispatch({
      type: 'qualityInspectApproval/fetchDetectionList',
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
      type: 'qualityInspectApproval/fetchDefectList',
      payload: { id, page },
    });
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
    const { params = {} } = match;
    const { id } = params;
    const res = await dispatch({
      type: 'qualityInspectApproval/fetchDetailHeader',
      payload: { id, customizeUnitCode: customUnitCode.join() },
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
    const { dispatch, match } = this.props;
    const { params = {} } = match;
    const { id } = params;
    dispatch({
      type: 'qualityInspectApproval/fetchOperationRecordList',
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
    const businessKey = detailHeader.businessKey || res?.businessKey;
    dispatch({
      type: 'qualityInspectApproval/fetchApprovalRecordList',
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

  @Bind()
  handleApproval(approvedCode) {
    const {
      dispatch,
      detailHeader,
      form: { getFieldsValue },
    } = this.props;
    const { approvedRemark } = getFieldsValue();
    dispatch({
      type: 'qualityInspectApproval/approval',
      payload: [{ ...detailHeader, approvedRemark, approvedCode }],
    }).then((res) => {
      if (res) {
        notification.success();
        dispatch(
          routerRedux.push({
            pathname: `/sqam/quality-inspect-approval/list`,
          })
        );
      }
    });
  }

  render() {
    const {
      form,
      fetchDetailHeaderLoading = false,
      detailHeader = {},
      detectionList = {},
      defectList = {},
      approvalLoading,
      fetchDefectListLoading = false,
      fetchDetectionListLoading = false,
      fetchOperationRecordListLoading = false,
      fetchApprovalRecordListLoading = false,
      location: { state = {} },
      customizeForm,
    } = this.props;
    const {
      collapseKeys,
      operationRecordModalVisible,
      operationRecordPagination,
      operationRecordList,
      approvalRecordPagination,
      approvalRecordList,
      fileNum,
      activeKey,
      showTables,
    } = this.state;
    const inspectionDataProps = {
      code: 'SQAM.QUALITY_INSPECT_APPROVAL_DETAIL.DATA',
      customizeForm,
      form,
      detailHeader,
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
    const { inspectionId, purchaseAttachmentUuid, inspectionNum } = detailHeader;
    const uploadModalProps = {
      btnText: `${intl.get(`entity.attachment.view`).d('附件查看')}(${fileNum})`,
      btnProps: {
        icon: 'paper-clip',
        disabled: !inspectionId,
      },
      viewOnly: true,
      showFilesNumber: false,
      attachmentUUID: purchaseAttachmentUuid,
      bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
      bucketDirectory: 'sqam-claim',
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
    const backPath = state.backPath || '/sqam/quality-inspect-approval/list';
    const loading =
      approvalLoading ||
      fetchDefectListLoading ||
      fetchDetectionListLoading ||
      fetchOperationRecordListLoading ||
      fetchApprovalRecordListLoading;
    return (
      <Fragment>
        <Header
          title={`${intl.get(`${prefix}.view.title.qualityInspectApprval`).d('质量检验审批')}${
            inspectionNum || ''
          }`}
          backPath={backPath}
        >
          <Button
            icon="check"
            type="primary"
            loading={loading}
            onClick={throttle(() => this.handleApproval('APPROVED'), 1500, { trailing: false })}
          >
            {intl.get(`hzero.common.view.message.title.approved`).d('审批通过')}
          </Button>
          <Button
            icon="close"
            loading={loading}
            onClick={throttle(() => this.handleApproval('REJECTED'), 1500, { trailing: false })}
          >
            {intl.get(`hzero.common.view.message.title.reject`).d('审批拒绝')}
          </Button>
          <Button
            icon="clock-circle-o"
            loading={loading}
            disabled={!inspectionId}
            onClick={() => this.handleModalVisible('operationRecordModalVisible', true)}
          >
            {`${intl.get('sqam.common.button.approval').d('审批')}/`}
            {intl.get('hzero.common.button.operating').d('操作记录')}
          </Button>
          <UploadModal {...uploadModalProps} />
        </Header>
        <Content wrapperClassName={classnames(DETAIL_DEFAULT_CLASSNAME)}>
          <Spin spinning={fetchDetailHeaderLoading}>
            <div className="form-collapse" style={{ paddingLeft: '16px' }}>
              <Form className={styles['header-wrapper']}>
                <Row {...EDIT_FORM_ROW_LAYOUT} className={classnames('last-form-item', 'half-row')}>
                  <Col {...FORM_COL_2_LAYOUT}>
                    <Form.Item
                      label={intl
                        .get(`${prefix}.model.qualityInspectApproval.approvedRemark`)
                        .d('审批意见')}
                    >
                      {form.getFieldDecorator('approvedRemark', {
                        initialValue: detailHeader.approvedRemark,
                      })(<Input.TextArea rows={3} />)}
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </div>
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
