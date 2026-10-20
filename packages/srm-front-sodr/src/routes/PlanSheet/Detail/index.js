/**
 * index - 计划单维护
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
import { getEditTableData } from 'utils/utils';
import intl from 'utils/intl';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { DETAIL_DEFAULT_CLASSNAME, DATETIME_MIN } from 'utils/constants';
import { SRM_SPUC } from '_utils/config';
import CommonImport from 'hzero-front/lib/components/Import';
import { stringify } from 'querystring';
import OrderHeaderForm from './OrderHeaderForm';
import List from './List';
import { BUCKET_NAME } from '@/routes/components/utils/constant';
import styles from './index.less';
import OperationRecord from '../../components/PlantOperationRecord/OperationRecord';
import Attachment from '../../components/PlantAttachment/Attachment';

// 折叠面板组件初始化
const { Panel } = Collapse;

@Form.create({ fieldNameProp: null })
@connect(({ loading, planSheet }) => ({
  queryPlanHeaderLoading: loading.effects['planSheet/queryPlanDetailHeader'],
  queryPlanLineLoading: loading.effects['planSheet/queryPlanDetailLine'],
  queryPlanSaveLoading: loading.effects['planSheet/savePlan'],
  queryPlanReleaseLoading: loading.effects['planSheet/deleteDetailPlan'],
  queryPlanDeleteLoading: loading.effects['planSheet/releaseDetailPlan'],
  queryPlanOperateLoading: loading.effects['planSheet/queryDetailHeader'],
  planSheet,
}))
@formatterCollections({
  code: [
    'sodr.planSheet',
    'sodr.common',
    'entity.company',
    'entity.attachment',
    'entity.order',
    'item.order',
    'entity.item',
    'ssrc.inquiryHall',
  ],
})
export default class Detail extends PureComponent {
  form;

  constructor(props) {
    super(props);
    this.state = {
      operationRecordModalVisible: false, // 操作记录模态框
      collapseKeys: ['orderHeaderInfo'],
      attachmentUUID: null,
      fileVisible: false,
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
      type: 'planSheet/batchCode',
    });
  }

  /**
   * 计划单的批量导入
   */
  @Bind()
  handleImport() {
    const { match } = this.props;
    // openTab({
    //   key: '/sodr/plan-sheet-update/data-import/SSCH.SCHEDULE_LINE_DETAIL',
    //   path: '/sodr/plan-sheet-update/data-import/SSCH.SCHEDULE_LINE_DETAIL',
    //   title: intl.get('hzero.common.viewtitle.batchImport').d('批量导入'),
    //   search: queryString.stringify({
    //     backPath: `/sodr/plan-sheet/detail/${match.params.id}`,
    //     sync: true,
    //   }),
    // });
    const option = {
      pathname: '/sodr/plan-sheet/data-import/SSCH.SCHEDULE_LINE_DETAIL',
      search: stringify({
        action: intl.get('hzero.common.viewtitle.batchImport').d('批量导入'),
        backPath: `/sodr/plan-sheet/detail/${match.params.id}`,
      }),
    };
    this.props.history.push(option);
  }

  /**
   * 行内校验
   * @param {Array} [dataSource=[]] 数据源
   * @param {Array} [excludeKeys=[]] 排除的字段
   * @param {Object} [property={}] 校验API的options
   */
  @Bind()
  validateEditTableDataSource(dataSource = [], excludeKeys = [], property = {}) {
    if (dataSource.length === 0) {
      return Promise.resolve(dataSource);
    }
    return new Promise((resolve, reject) => {
      const validateDataSource = getEditTableData(dataSource, excludeKeys, property);
      if (validateDataSource.length === 0) {
        reject();
      } else {
        resolve(validateDataSource);
      }
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
      type: 'planSheet/queryPlanDetailHeader',
      payload: {
        planHeaderId: params.id,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          attachmentUUID: res.attachmentUuid,
        });
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
      type: 'planSheet/queryPlanDetailLine',
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

  /**
   * 保存/发布计划单
   * submitFlag: false
   */
  @Bind()
  handleSaveOrRelease(submitFlag = false) {
    const modelName = submitFlag ? 'releaseDetailPlan' : 'savePlan';
    if (submitFlag) {
      Modal.confirm({
        title: intl
          .get(`sodr.planSheet.view.message.title.confirmReleasePlan`)
          .d('是否确认发布计划单'),
        okText: intl.get('hzero.common.button.sure').d('确定'),
        cancelText: intl.get('hzero.common.button.cancel').d('取消'),
        onOk: () => {
          this.handleValidateSaveOrRelease(submitFlag, modelName);
        },
      });
    } else {
      this.handleValidateSaveOrRelease(submitFlag, modelName);
    }
  }

  /**
   * 校验保存/发布计划单
   * submitFlag: false
   */
  @Bind()
  handleValidateSaveOrRelease(submitFlag, modelName) {
    const { planSheet, dispatch, form, history } = this.props;
    const { planDetailHeader = {}, planDetailList } = planSheet;
    let flag = false;
    form.validateFields((errs, values) => {
      if (!errs) {
        // 存在计划周期 头 行 保存
        if (planDetailHeader.planningCycle) {
          const validDataSource = planDetailList.map((item) => {
            const { scheduleDetailList = [] } = item;
            let validateNum = 0;
            const scheduleList = scheduleDetailList.map((elementItem, index) => {
              if (item[`key${index + 1}`] === 0 || item[`key${index + 1}`]) {
                validateNum = item[`key${index + 1}`] + validateNum;
              } else {
                validateNum =
                  (elementItem.planQuantity ? elementItem.planQuantity : 0) + validateNum;
              }
              return {
                ...elementItem,
                planQuantity: item[`key${index + 1}`] || elementItem.planQuantity,
              };
            });
            if (item.planQuantity === validateNum) {
              return { ...item, scheduleDetailList: scheduleList };
            } else {
              flag = true;
              return item;
            }
          });
          if (flag) {
            notification.warning({
              message: intl
                .get(`sodr.common.view.title.planSheet.writeNum`)
                .d('当前行数量不匹配,请重新填写!'),
            });
          } else {
            dispatch({
              type: `planSheet/${modelName}`,
              payload: {
                ...planDetailHeader,
                ...values,
                planStartDate: values.planStartDate
                  ? values.planStartDate.format(DATETIME_MIN)
                  : planDetailHeader.planStartDate,
                scheduleLines: validDataSource,
              },
            }).then((res) => {
              if (res) {
                notification.success();
                if (submitFlag) {
                  history.push({ pathname: '/sodr/plan-sheet/list' });
                } else {
                  this.queryPlanDetailHeader();
                }
              }
            });
          }
        } else {
          dispatch({
            type: 'planSheet/savePlan',
            payload: {
              ...planDetailHeader,
              ...values,
              planStartDate: values.planStartDate
                ? values.planStartDate.format(DATETIME_MIN)
                : undefined,
            },
          }).then((res) => {
            if (res) {
              notification.success();
              this.queryPlanDetailHeader();
            }
          });
        }
      }
    });
  }

  /**
   *删除计划单
   */
  @Bind()
  handleDelete() {
    const { planSheet, dispatch, history } = this.props;
    const { planDetailHeader = {} } = planSheet;
    Modal.confirm({
      title: intl
        .get(`sodr.planSheet.view.message.title.confirmDeletePlan`)
        .d('是否确认删除计划单'),
      okText: intl.get('hzero.common.button.sure').d('确定'),
      cancelText: intl.get('hzero.common.button.cancel').d('取消'),
      onOk: () => {
        dispatch({
          type: 'planSheet/deleteDetailPlan',
          payload: {
            ...planDetailHeader,
          },
        }).then((res) => {
          if (res) {
            notification.success();
            history.push({ pathname: '/sodr/plan-sheet/list' });
          }
        });
      },
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

  /**
   * 删除附件
   * @param {Object} payload
   * @param {String} payload.attachmentUUID 附件uuid
   * @param {string} payload.bucketName 桶名
   * @param {string} payload.urls 要删除附件的url
   * @returns Promise
   */
  @Bind()
  removeAttachment(payload) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'planSheetCommon/removeFile',
      payload,
    });
  }

  /**
   * fetchUuidBindHeader - 首次加载附件组件时判断该头是否有Uuid，没有就去请求一个并绑定
   */
  @Bind()
  fetchUuidBindHeader() {
    const { planSheet } = this.props;
    const { planDetailHeader = {} } = planSheet;
    const { attachmentUuid } = planDetailHeader;
    if (!attachmentUuid) {
      // 后台传过来的attachmentUuid不存在 则 新获取 uuid
      this.fetchUUID();
    } else {
      this.setState({
        fileVisible: true,
      });
    }
  }

  /**
   * 获取UUID  并将获得的uuid存入数据库
   */
  @Bind()
  fetchUUID() {
    const { dispatch, match = {}, planSheet } = this.props;
    const { params } = match;
    const { planDetailHeader = {} } = planSheet;
    dispatch({
      type: 'planSheetCommon/getAttachmentuuid',
    }).then((res) => {
      if (res) {
        this.setState({
          attachmentUUID: res.content,
          fileVisible: true,
        });
        dispatch({
          type: 'planSheetCommon/saveAttachmentUUID',
          payload: {
            planHeaderId: params.id,
            attachmentUuid: res.content,
            objectVersionNumber: planDetailHeader.objectVersionNumber,
          },
        }).then((response) => {
          if (response) {
            this.queryPlanDetailHeader();
          }
        });
      }
    });
  }

  @Bind()
  openUploadModal() {
    this.fetchUuidBindHeader();
  }

  /**
   * hideAttachment - 关闭附件弹窗
   */
  @Bind()
  hideAttachment() {
    this.setState({ fileVisible: false });
  }

  render() {
    const {
      planSheet,
      queryPlanHeaderLoading,
      queryPlanLineLoading,
      queryPlanSaveLoading,
      queryPlanReleaseLoading,
      queryPlanDeleteLoading,
      form,
      dispatch,
      match,
    } = this.props;
    const {
      collapseKeys = [],
      operationRecordModalVisible,
      attachmentUUID,
      fileVisible,
    } = this.state;
    const { planDetailHeader = {}, planDetailList = [], planCycle = [] } = planSheet;

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
      dispatch,
      loading: queryPlanLineLoading,
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
      attachmentUUID, // 采购方uuid
      supplierAttachmentUuid: planDetailHeader.supplierAttachmentUuid, // 供应商uuid
      onFetchPurchaserAttachmentList: this.fetchPurchaserAttachmentList,
      onFetchSupplierAttachmentList: this.fetchSupplierAttachmentList,
      onRemoveAttachment: this.removeAttachment,
      // loading: queryFileListOrgLoading, // 加载状态
      loading: false,
      bucketName: BUCKET_NAME,
      bucketDirectory: 'sodr-order',
      // onBindUuidToHeader: this.fetchUuidBindHeader, // 绑定uuid到头
    };
    return (
      <div>
        <Header
          title={intl.get(`sodr.common.view.message.title.plantUpdate`).d('计划单维护')}
          backPath="/sodr/plan-sheet/list"
        >
          <Button
            icon="save"
            type="primary"
            loading={queryPlanSaveLoading}
            onClick={() => this.handleSaveOrRelease(false)}
            disabled={queryPlanSaveLoading || queryPlanHeaderLoading || queryPlanLineLoading}
          >
            {intl.get(`hzero.common.button.save`).d('保存')}
          </Button>
          <Button
            icon="rocket"
            loading={queryPlanReleaseLoading}
            disabled={!planDetailHeader.planningCycle}
            onClick={() => this.handleSaveOrRelease(true)}
          >
            {intl.get(`hzero.common.button.release`).d('发布')}
          </Button>
          <Button icon="delete" loading={queryPlanDeleteLoading} onClick={this.handleDelete}>
            {planDetailHeader.planStatus === 'NEW'
              ? intl.get(`hzero.common.button.delete`).d('删除')
              : intl.get(`sodr.common.button.cancel`).d('废弃')}
          </Button>
          <CommonImport
            businessObjectTemplateCode="SSCH.SCHEDULE_LINE_DETAIL"
            prefixPatch={SRM_SPUC}
            refreshButton
            buttonText={intl.get(`hzero.common.button.newImport`).d('(新)导入')}
            successCallBack={() => this.this.queryPlanDetailLine()} // 导入成功的回调
            buttonProps={{
              disabled: !planDetailHeader.planningCycle,
              permissionList: [
                {
                  code: 'srm.po-admin.plan.scheduling.creation.ps.button.newimport',
                  type: 'c7n-pro',
                  meaning: '计划单创建-新版导入',
                },
              ],
            }}
            // args={{ tenantId }} // 上传参数
          />
          <Button onClick={this.handleImport} disabled={!planDetailHeader.planningCycle}>
            {intl.get('sodr.planSheet.button.planImport').d('批量导入填写')}
          </Button>
          <Button onClick={this.openUploadModal} icon="paper-clip">
            {intl.get('entity.attachment.tag').d('附件')}
          </Button>
          {fileVisible && <Attachment {...attachmentProps} />}
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
