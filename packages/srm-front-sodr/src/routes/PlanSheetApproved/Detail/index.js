/**
 * index - 计划单审批
 * @date: 2019-12-11
 * @author: lichao <chao.li03@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { Button, Spin, Collapse, Icon, Form, Modal } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import classnames from 'classnames';

import { Header, Content } from 'components/Page';
import ExcelExport from 'components/ExcelExport';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SPUC } from '_utils/config';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { DETAIL_DEFAULT_CLASSNAME } from 'utils/constants';
import OrderHeaderForm from './OrderHeaderForm';
import List from './List';
import { BUCKET_NAME } from '@/routes/components/utils/constant';
import styles from './index.less';
import OperationRecord from '../../components/PlantOperationRecord/OperationRecord';
import Attachment from './Attachment';

// 折叠面板组件初始化
const { Panel } = Collapse;

@Form.create({ fieldNameProp: null })
@connect(({ loading, planSheetApproved, planSheetCommon }) => ({
  queryPlanHeaderLoading: loading.effects['planSheetApproved/queryPlanDetailHeader'],
  queryPlanLineLoading: loading.effects['planSheetApproved/queryPlanDetailLine'],
  queryPlanApprovedLoading: loading.effects['planSheetApproved/approvedPlan'],
  queryPlanDeleteLoading: loading.effects['planSheetApproved/cancelPlan'],
  planSheetApproved,
  planSheetCommon,
}))
@formatterCollections({
  code: [
    'sodr.planSheetApproved',
    'sodr.common',
    'entity.company',
    'entity.attachment',
    'entity.order',
    'item.order',
    'entity.item',
  ],
})
export default class Detail extends PureComponent {
  form;

  constructor(props) {
    super(props);

    this.state = {
      organizationId: getCurrentOrganizationId(),
      operationRecordModalVisible: false, // 操作记录模态框
      collapseKeys: ['orderHeaderInfo'],
    };
  }

  /**
   * componentDidMount 生命周期函数
   * render后请求页面数据
   */
  componentDidMount() {
    this.batchCode();
    this.queryPlanDetailHeader();
  }

  /**
   * 打开操作记录模态框
   */
  @Bind()
  openOperationRecord() {
    this.setState({
      operationRecordModalVisible: true,
    });
  }

  /**
   * hideOperationRecord - 关闭操作记录弹窗
   */
  @Bind()
  hideOperationRecord() {
    this.setState({ operationRecordModalVisible: false });
  }

  /**
   * batchCode - 查询值集
   */
  batchCode() {
    const { dispatch } = this.props;
    dispatch({
      type: 'planSheetApproved/batchCode',
    });
  }

  /**
   * fetchDetailHeader - 查询头明细数据 queryPlanDetailHeader
   */
  @Bind()
  queryPlanDetailHeader() {
    const { dispatch, match = {} } = this.props;
    const { params } = match;
    dispatch({
      type: 'planSheetApproved/queryPlanDetailHeader',
      payload: {
        planHeaderId: params.id,
      },
    }).then((res) => {
      if (res) {
        // 存在计划排期
        if (res.planningCycle) {
          this.queryPlanDetailLine();
        }
      }
    });
  }

  /**
   * queryPlanDetailLine - 查询行明细数据
   * @param {object} params - 查询条件
   */
  @Bind()
  queryPlanDetailLine() {
    const { dispatch, match = {} } = this.props;
    const { params } = match;
    dispatch({
      type: 'planSheetApproved/queryPlanDetailLine',
      payload: { planHeaderId: params.id },
    });
  }

  /**
   * onCollapseChange - 折叠面板onChange
   * @param {string} collapseKeys - Panels key
   */
  @Bind()
  onCollapseChange(collapseKeys) {
    this.setState({
      collapseKeys,
    });
  }

  @Bind()
  renderDataSource(dataSource = []) {
    if (dataSource.length > 0) {
      const planDataSource = dataSource.map((item) => {
        let elementValue = {};
        const { scheduleDetailList = [], ...otherItem } = item;
        scheduleDetailList.forEach((elementItem) => {
          elementValue = {
            ...elementValue,
            [`key${elementItem.key}`]: elementItem.planQuantity,
          };
        });
        return {
          ...otherItem,
          ...elementValue,
        };
      });
      return planDataSource;
    } else {
      return [];
    }
  }

  /**
   *修改审批计划单
   */
  @Bind()
  handleApproved() {
    const { dispatch, history, match } = this.props;
    Modal.confirm({
      title: intl
        .get(`sodr.planSheet.view.message.title.confirmUpdatePlan`)
        .d('是否确认修改计划单'),
      okText: intl.get('hzero.common.button.sure').d('确定'),
      cancelText: intl.get('hzero.common.button.cancel').d('取消'),
      onOk: () => {
        dispatch({
          type: 'planSheetApproved/approvedPlan',
          payload: [Number(match.params.id)],
        }).then((res) => {
          if (res) {
            notification.success();
            history.push({ pathname: '/sodr/plan-sheet-approved/list' });
          }
        });
      },
    });
  }

  /**
   *废弃计划单
   */
  @Bind()
  handleDelete() {
    const { dispatch, history, match } = this.props;
    Modal.confirm({
      title: intl
        .get(`sodr.planSheet.view.message.title.confirmDiscardPlan`)
        .d('是否确认废弃计划单'),
      okText: intl.get('hzero.common.button.sure').d('确定'),
      cancelText: intl.get('hzero.common.button.cancel').d('取消'),
      onOk: () => {
        dispatch({
          type: 'planSheetApproved/cancelPlan',
          payload: [Number(match.params.id)],
        }).then((res) => {
          if (res) {
            notification.success();
            history.push({ pathname: '/sodr/plan-sheet-approved/list' });
          }
        });
      },
    });
  }

  /**
   * 查询采购方附件列表
   * @param {Object} payload
   * @param {String} payload.attachmentUUID 附件uuid
   * @param {string} payload.bucketName 桶名
   * @returns Promise
   */
  @Bind()
  fetchPurchaserAttachmentList(payload) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'planSheetCommon/queryFileListOrg',
      payload,
    });
  }

  /**
   * 查询供应商附件列表
   * @param {Object} payload
   * @param {String} payload.attachmentUUID 附件uuid
   * @param {string} payload.bucketName 桶名
   * @returns Promise
   */
  @Bind()
  fetchSupplierAttachmentList(payload) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'planSheetCommon/queryFileListOrg',
      payload,
    });
  }

  @Bind()
  openUploadModal() {
    this.setState({ visible: true });
  }

  /**
   * hideAttachment - 关闭附件弹窗
   */
  @Bind()
  hideAttachment() {
    this.setState({ visible: false });
  }

  render() {
    const {
      planSheetApproved,
      queryPlanHeaderLoading,
      queryPlanLineLoading,
      queryPlanApprovedLoading,
      queryPlanDeleteLoading,
      form,
      dispatch,
      match,
    } = this.props;
    const { collapseKeys = [], operationRecordModalVisible, organizationId, visible } = this.state;
    const { planDetailHeader = {}, planDetailList = [], planCycle = [] } = planSheetApproved;

    const orderHeaderFormProps = {
      ref: (node) => {
        this.orderHeaderForm = node;
      },
      dataSource: planDetailHeader,
      planCycle,
      form,
    };
    const listProps = {
      dataSource: planDetailList,
      planDetailHeader,
      loading: queryPlanLineLoading,
      dispatch,
      renderEditTable: this.renderEditTable,
      renderDataSource: this.renderDataSource,
    };
    const operationRecordProps = {
      dispatch,
      id: match.params.id,
      visible: operationRecordModalVisible,
      hideModal: this.hideOperationRecord,
    };

    const attachmentProps = {
      hideAttachment: this.hideAttachment,
      attachmentUUID: planDetailHeader.attachmentUuid, // 采购方uuid
      supplierAttachmentUuid: planDetailHeader.supplierAttachmentUuid, // 供应商uuid
      onFetchPurchaserAttachmentList: this.fetchPurchaserAttachmentList,
      onFetchSupplierAttachmentList: this.fetchSupplierAttachmentList,
      // loading: queryFileListOrgLoading, // 加载状态
      loading: false,
      bucketName: BUCKET_NAME,
      bucketDirectory: 'sodr-order',
      // onBindUuidToHeader: this.fetchUuidBindHeader, // 绑定uuid到头
    };

    const primaryExportBtnProps = {
      icon: 'export',
    };
    return (
      <div>
        <Header
          title={intl.get(`sodr.common.view.message.title.plantApproved`).d('计划单审批')}
          backPath="/sodr/plan-sheet-approved/list"
        >
          <Button icon="edit" loading={queryPlanApprovedLoading} onClick={this.handleApproved}>
            {intl.get(`sodr.common.view.button.plantEdit`).d('修改计划单')}
          </Button>
          <Button icon="delete" loading={queryPlanDeleteLoading} onClick={this.handleDelete}>
            {intl.get(`sodr.common.view.button.cancel`).d('废弃')}
          </Button>
          <ExcelExport
            otherButtonProps={primaryExportBtnProps}
            requestUrl={`${SRM_SPUC}/v1/${organizationId}/schedule-line/${match.params.id}/schedule-line/export`}
          />
          <Button onClick={this.openUploadModal} icon="paper-clip">
            {intl.get('entity.attachment.tag').d('附件')}
          </Button>
          {visible && <Attachment {...attachmentProps} />}
          <Button icon="clock-circle-o" onClick={this.openOperationRecord}>
            {intl.get(`sodr.common.view.button.operationRecord`).d('操作记录')}
          </Button>
        </Header>
        <Content>
          <Spin
            spinning={queryPlanHeaderLoading || queryPlanLineLoading || false}
            wrapperClassName={classnames(
              DETAIL_DEFAULT_CLASSNAME,
              styles['received-send-order-detail']
            )}
          >
            <Collapse
              className="form-collapse"
              defaultActiveKey={['orderHeaderInfo']}
              onChange={this.onCollapseChange}
            >
              <Panel
                showArrow={false}
                header={
                  <Fragment>
                    <h3>{intl.get(`sodr.common.view.message.baseInfo`).d('基本信息')}</h3>
                    <a>
                      {collapseKeys.includes('orderHeaderInfo')
                        ? intl.get('hzero.common.button.up').d('收起')
                        : intl.get('hzero.common.button.expand').d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('orderHeaderInfo') ? 'up' : 'down'} />
                  </Fragment>
                }
                key="orderHeaderInfo"
              >
                <OrderHeaderForm {...orderHeaderFormProps} />
              </Panel>
            </Collapse>
            {planDetailHeader.planningCycle && <List {...listProps} />}
          </Spin>
        </Content>
        {operationRecordModalVisible && <OperationRecord {...operationRecordProps} />}
      </div>
    );
  }
}
