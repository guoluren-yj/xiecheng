import React, { Component, Fragment, createRef } from 'react';
import queryString from 'querystring';
import {
  Form,
  Row,
  Col,
  Button,
  Modal,
  Drawer,
  Input,
  InputNumber,
  Select,
  Tooltip,
  Icon,
} from 'hzero-ui';
import { Modal as ChoerodonModal, Button as ChoerodonButton } from 'choerodon-ui/pro';
import { Bind, Debounce } from 'lodash-decorators';
import Upload from 'srm-front-boot/lib/components/Upload/index';
import { connect } from 'dva';
import { withRouter } from 'dva/router';
import {
  uniq,
  uniqBy,
  difference,
  isEmpty,
  isArray,
  isFunction,
  sum,
  isNumber,
  isUndefined,
  isNil,
  forEach,
} from 'lodash';
import EditTable from 'srm-front-boot/lib/components/EditTable';

import LovMulti from 'srm-front-cuz/lib/components/Customize/LovMulti/index';
import Lov from 'components/Lov';
import {
  getCurrentTenant,
  getCurrentOrganizationId,
  getEditTableData,
  filterNullValueObject,
  getResponse,
} from 'utils/utils';
import notification from 'utils/notification';
import intl from 'utils/intl';
import { SRM_SSLM, PRIVATE_BUCKET } from '_utils/config';
import { FormItem, Button as PerButton } from 'components/Permission';
import ExcelExport from 'components/ExcelExport';
import formatterCollections from 'utils/intl/formatterCollections';
import CommonImport from 'components/Import';
import ExcelExportPro from 'components/ExcelExportPro';

import styles from '@/routes/index.less';
import LovMultiple from '@/routes/components/LovMultiple';
import { initialFetch } from '@/services/evaluationDocManageService';
import InputNumberTip from '@/routes/SiteInvestigateReport/common/InputNumberTip';
import Categories from './Categories';
import NewCategories from './NewCategories'; // 参评品类重构
import AddSupplierModal from './AddSupplierModal';
import BatchMaintenanceRaters from './BatchMaintenanceRaters';
import IndicatorMaintain from './IndicatorMaintain';

const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

const customizeCodeObj = {
  scoreDetail: 'SSLM.EVALUATION_DOC_MANAGE_DETAIL.SCOREDETAILLINE',
  scoreSum: 'SSLM.EVALUATION_DOC_MANAGE_DETAIL.SCORESUMLINE',
  scoreVendor: 'SSLM.EVALUATION_DOC_MANAGE_DETAIL.SCOREVENDORLINE',
};

const { Item: HzeroFormItem } = Form;
const { Option, OptGroup } = Select;
const organizationId = getCurrentOrganizationId();

/**
 *考评档案管理详情页 各个tab 页的内容组件
 *
 * @export
 * @class TabContent
 * @extends {Component} - React.element
 * @reactProps {object} form - 表单对象
 * @returns React.element
 */
@withRouter
@formatterCollections({
  code: ['sslm.supplierDocManage'],
})
@Form.create({ fieldNameProp: null })
@connect(({ evaluationDocManage, loading }) => ({
  evaluationDocManage,
  queryEvalTplScopeSupplierListLoading:
    loading.effects['evaluationDocManage/queryEvalTplScopeSupplierList'],
  saveEvalTplScopeSupplierListLoading:
    loading.effects['evaluationDocManage/saveEvalTplScopeSupplierList'],
  deleteEvalTplScopeSupplierListLoading:
    loading.effects['evaluationDocManage/deleteEvalTplScopeSupplierList'],
  saveCoreDetailLoading: loading.effects['evaluationDocManage/saveCoreDetail'],
  saveScoreSumLoading: loading.effects['evaluationDocManage/saveScoreSum'],
  queryAllSupplierLoading: loading.effects['evaluationDocManage/queryAllSupplier'],
}))
export default class TabContent extends Component {
  state = {
    selectedRowKeys: [],
    scoreVendorModalVisible: false,
    activeRows: {},
    categoriesModalVisible: false,
    selectedRows: [],
    selectAllFlag: 0,
    unChooseEvalDtlIds: [],
    expandForm: false,
    scoreSumExpandForm: false,
    selectAllLoading: false, // 全选loading
  };

  suppliers = createRef();

  componentDidMount() {
    const { dispatch, onRef = e => e } = this.props;
    dispatch({
      type: 'evaluationDocManage/querylifeCycleStageCode',
      payload: {
        lovCode: 'SSLM.LIFE_CYCLE_STAGE',
        params: { tenantId: getCurrentOrganizationId() },
      },
    });
    dispatch({
      type: 'evaluationDocManage/querySuggestedStrategy',
    });
    onRef(this);
  }

  /**
   * 表单展开收起
   */
  @Bind()
  toggleForm() {
    const { expandForm } = this.state;
    this.setState({
      expandForm: !expandForm,
    });
  }

  /**
   * 评分汇总-表单展开收起
   */
  @Bind()
  scoreSumToggleForm() {
    const { scoreSumExpandForm } = this.state;
    this.setState({
      scoreSumExpandForm: !scoreSumExpandForm,
    });
  }

  onCell() {
    return {
      style: {
        overflow: 'hidden',
        maxWidth: 180,
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
      onClick: e => {
        const { target } = e;
        if (target.style.whiteSpace === 'normal') {
          target.style.whiteSpace = 'nowrap';
        } else {
          target.style.whiteSpace = 'normal';
        }
      },
    };
  }

  /**
   * 提示系统评分评分状态信息
   * @param {*} record - 行数据
   */
  inCompleteMessage(record = {}) {
    Modal.info({
      title: intl
        .get(`sslm.supplierDocManage.model.docManage.systemCalculateFailed`)
        .d('系统计算失败'),
      content: <p>{record.processRemark}</p>,
    });
  }

  /**
   * 获得columns
   */
  @Bind()
  getColumns() {
    const {
      granularity,
      tabKey,
      openModal,
      docStatus,
      basicInfo,
      isPub,
      isEdit,
      evaluationDocManage: { suggestedStrategy },
      openParamVauleModal = () => {},
      averageFlag,
      docManageRemote,
      tableData,
      dispatch,
    } = this.props;
    const {
      evalStatus,
      checkDetailFlag = false,
      checkCollectFlag = false,
      checkLevelFlag = false,
      availableFlag = false,
    } = basicInfo;
    const liftStageFlag = [
      'FINAL_COLLECTED',
      'REJECTED',
      'APPROVING',
      'BACK_SCORE',
      'PUBLISHED',
      'COMPLETED',
    ].includes(evalStatus);
    const colsObj = {
      scoreDetail: [
        {
          title: intl.get(`sslm.supplierDocManage.model.docManage.venderCode`).d('供应商编码'),
          dataIndex: 'supplierNum',
          width: 182,
          fixed: 'left',
        },
        {
          title: intl.get(`sslm.supplierDocManage.model.docManage.venderName`).d('供应商名称'),
          dataIndex: 'supplierName',
          width: 182,
          fixed: 'left',
          render: val => (
            <Tooltip title={val} placement="topLeft">
              {val}
            </Tooltip>
          ),
        },
        {
          title: intl
            .get(`sslm.supplierDocManage.model.docManage.erpVenderCode`)
            .d('erp供应商编码'),
          dataIndex: 'erpSupplierNum',
          width: 182,
        },
        {
          title: intl
            .get(`sslm.supplierDocManage.model.docManage.erpVenderName`)
            .d('erp供应商名称'),
          dataIndex: 'erpSupplierName',
          width: 182,
        },
        {
          title: intl.get(`sslm.supplierDocManage.model.docManage.indicatorCode`).d('指标编码'),
          dataIndex: 'indicatorCode',
          width: 182,
          fixed: 'left',
        },
        {
          title: intl.get(`sslm.supplierDocManage.model.docManage.indicatorName`).d('指标描述'),
          dataIndex: 'indicatorName',
          width: 120,
          onCell: this.onCell,
          fixed: 'left',
        },
        {
          title: intl.get(`sslm.supplierDocManage.model.docManage.evaluationWay`).d('评分方式'),
          dataIndex: 'scoreTypeMeaning',
          width: 120,
        },
        {
          title: intl
            .get(`sslm.supplierDocManage.model.docManage.evaluationStandard`)
            .d('评分标准'),
          dataIndex: 'evalStandard',
          width: 120,
          onCell: this.onCell,
        },
        {
          title: intl.get(`sslm.supplierDocManage.model.docManage.scoreWeight`).d('权重'),
          dataIndex: 'evalWeight',
          width: 120,
        },
        {
          title: intl.get(`sslm.supplierDocManage.model.docManage.indicatorType`).d('指标类型'),
          dataIndex: 'indicatorTypeMeaning',
          width: 100,
        },
        {
          title: intl.get(`sslm.supplierDocManage.model.docManage.evaluationPerson`).d('评分人'),
          dataIndex: 'evaluationPerson',
          width: 120,
          render: (val, record) => {
            if (record.scoreType === 'MANUAL') {
              // 欧瑞康src-26776二开埋点
              const respUserNameCollect = docManageRemote
                ? docManageRemote.process(
                    'SSLM.EVALUATION_DOC_MANAGE_DETAIL_SCORE_DETAIL_USERNAMECOLLECT',
                    record.respUserNameCollect,
                    { basicInfo }
                  )
                : record.respUserNameCollect;
              const errorWeightFlag = docManageRemote
                ? docManageRemote.process(
                    'SSLM.EVALUATION_DOC_MANAGE_DETAIL_SCORE_DETAIL_ERRORWEIGHT',
                    record.errorWeightFlag,
                    { basicInfo }
                  )
                : record.errorWeightFlag;
              if (averageFlag) {
                // 平均式计算
                return respUserNameCollect ? (
                  <a onClick={() => openModal('evaluationPerson', record)}>
                    {intl
                      .get(`sslm.supplierDocManage.model.docManage.evaluationPersonInfo`)
                      .d('评分人信息')}
                  </a>
                ) : (
                  <Tooltip
                    title={intl
                      .get('sslm.supplierDocManage.model.tooltip.averageScorer')
                      .d('评分人信息有误，请维护评分人')}
                  >
                    <a
                      onClick={() => openModal('evaluationPerson', record)}
                      style={{ color: '#F56349' }}
                    >
                      {intl
                        .get(`sslm.supplierDocManage.model.docManage.evaluationPersonInfo`)
                        .d('评分人信息')}
                    </a>
                  </Tooltip>
                );
              } else {
                // 非平均式计算
                return respUserNameCollect && errorWeightFlag ? (
                  <a onClick={() => openModal('evaluationPerson', record)}>
                    {intl
                      .get(`sslm.supplierDocManage.model.docManage.evaluationPersonInfo`)
                      .d('评分人信息')}
                  </a>
                ) : (
                  <Tooltip
                    title={intl
                      .get('sslm.supplierDocManage.model.tooltip.scorer')
                      .d('评分人信息有误，请维护评分人且评分权重之和为100')}
                  >
                    <a
                      onClick={() => openModal('evaluationPerson', record)}
                      style={{ color: '#F56349' }}
                    >
                      {intl
                        .get(`sslm.supplierDocManage.model.docManage.evaluationPersonInfo`)
                        .d('评分人信息')}
                    </a>
                  </Tooltip>
                );
              }
            } else if (record.scoreType === 'SYSTEM') {
              return intl.get(`sslm.supplierDocManage.model.docManage.systemEval`).d('系统评分');
            }
            // if (record.scoreType !== 'SYSTEM') {
            //   // 手工评分
            //   if (!record.childrenCount) {
            //     // 最下级指标
            //     if (averageFlag) {
            //       // 平均式计算
            //       return record.respUserNameCollect ? (
            //         <a onClick={() => this.openScorer(record)}>
            //           {intl.get('sslm.siteInvestigateReport.modal.mange.scorer').d('评分人')}
            //         </a>
            //       ) : (
            //         <Tooltip
            //           title={intl
            //             .get('sslm.siteInvestigateReport.model.tooltip.averageScorer')
            //             .d('评分人信息有误，请维护评分人')}
            //         >
            //           <a onClick={() => this.openScorer(record)} style={{ color: '#F56349' }}>
            //             {intl.get('sslm.siteInvestigateReport.modal.mange.scorer').d('评分人')}
            //           </a>
            //         </Tooltip>
            //       );
            //     } else {
            //       // 非平均式计算
            //       return record.respUserNameCollect && record.errorWeightFlag ? (
            //         <a onClick={() => this.openScorer(record)}>
            //           {intl.get('sslm.siteInvestigateReport.modal.mange.scorer').d('评分人')}
            //         </a>
            //       ) : (
            //         <Tooltip
            //           title={intl
            //             .get('sslm.siteInvestigateReport.model.tooltip.scorer')
            //             .d('评分人信息有误，请维护评分人且评分权重之和为100')}
            //         >
            //           <a onClick={() => this.openScorer(record)} style={{ color: '#F56349' }}>
            //             {intl.get('sslm.siteInvestigateReport.modal.mange.scorer').d('评分人')}
            //           </a>
            //         </Tooltip>
            //       );
            //     }
            //   } else {
            //     return null;
            //   }
            // }
          },
        },
        {
          title: intl.get(`sslm.supplierDocManage.model.docManage.evaluationStatus`).d('评分状态'),
          dataIndex: 'completeFlag',
          width: 120,
          render: (_val, record) => {
            if (['NEW_REJECTED', 'NEW'].includes(docStatus)) {
              return intl.get(`sslm.supplierDocManage.model.docManage.unScore`).d('尚未进行评分');
            }
            if (record.scoreType === 'SYSTEM') {
              if (record.processStatus === 'COMPLETE') {
                return (
                  <a onClick={() => openParamVauleModal(record)}>{record.processStatusMeaning}</a>
                );
              } else {
                return record.processStatusMeaning;
              }
            } else {
              return (
                <a onClick={() => openModal('evaluationStatus', record)}>
                  {/* {val === 1
                    ? intl.get(`sslm.supplierDocManage.model.docManage.complete`).d('完成')
                    : val === 2
                    ? intl.get(`sslm.supplierDocManage.model.docManage.back`).d('退回')
                    : intl.get(`sslm.supplierDocManage.model.docManage.incomplete`).d('未完成')} */}
                  {record.completeFlagMeaning}
                </a>
              );
            }
          },
        },
        {
          title: intl.get('sslm.supplierDocManage.model.docManage.processRemark').d('系统计算说明'),
          dataIndex: 'processRemark',
          width: 130,
        },
        {
          title: intl.get(`sslm.supplierDocManage.model.docManage.score`).d('得分'),
          dataIndex: 'finalScore',
          width: 100,
          render: (text, record) => {
            const val = docManageRemote
              ? docManageRemote.process(
                  'SSLM.EVALUATION_DOC_MANAGE_DETAIL_SCORE_DETAIL_SCORE',
                  text,
                  {
                    headerInfo: basicInfo,
                    record,
                  }
                )
              : text;
            const { checkDetailScore, indicatorType } = record;
            const showTipFlag = isNil(checkDetailScore);
            if (tabKey === 'scoreDetail' && checkDetailFlag && !showTipFlag) {
              return indicatorType === 'VETO' ? '-' : val;
            } else {
              const { kpiEvalTplIndRemind } = record;
              const { remindDesc } = kpiEvalTplIndRemind || {};
              const showIcon = !isNil(val) && !isEmpty(kpiEvalTplIndRemind);
              return (
                <Tooltip title={isEmpty(kpiEvalTplIndRemind) ? '' : remindDesc}>
                  <span style={isEmpty(kpiEvalTplIndRemind) ? {} : { color: '#F05434' }}>
                    {indicatorType === 'VETO' ? '-' : val}
                  </span>
                  {showIcon && (
                    <Icon
                      style={{ margin: '10px 5px', color: '#F05434' }}
                      type="exclamation-circle"
                    />
                  )}
                </Tooltip>
              );
            }
          },
        },
        {
          title: intl
            .get(`sslm.supplierDocManage.model.docManage.indicatorLevelCode`)
            .d('指标等级'),
          dataIndex: 'indicatorLevelCode',
          width: 100,
        },
        {
          title: intl.get(`sslm.supplierDocManage.model.docManage.scoreFrom`).d('分值从'),
          dataIndex: 'scoreFrom',
          width: 100,
        },
        {
          title: intl.get(`sslm.supplierDocManage.model.docManage.scoreTo`).d('分值至'),
          dataIndex: 'scoreTo',
          width: 100,
        },
        {
          title: intl.get(`sslm.supplierDocManage.model.docManage.scoreDefault`).d('缺省分值'),
          dataIndex: 'defaultScore',
          width: 100,
        },
        {
          title: intl
            .get(`sslm.supplierDocManage.model.docManage.feedbackDescription`)
            .d('反馈说明'),
          dataIndex: 'respRemarks',
          onCell: this.onCell,
          width: 120,
        },
      ],
      scoreSum: [
        {
          title: intl.get(`sslm.supplierDocManage.model.docManage.venderCode`).d('供应商编码'),
          dataIndex: 'supplierNum',
          fixed: 'left',
          width: 225,
        },
        {
          title: intl.get(`sslm.supplierDocManage.model.docManage.venderName`).d('供应商名称'),
          dataIndex: 'supplierName',
          fixed: 'left',
          width: 225,
          render: val => (
            <Tooltip title={val} placement="topLeft">
              {val}
            </Tooltip>
          ),
        },
        {
          title: intl
            .get(`sslm.supplierDocManage.model.docManage.erpVenderCode`)
            .d('erp供应商编码'),
          dataIndex: 'erpSupplierNum',
          width: 225,
        },
        {
          title: intl
            .get(`sslm.supplierDocManage.model.docManage.erpVenderName`)
            .d('erp供应商名称'),
          dataIndex: 'erpSupplierName',
          width: 225,
        },
        {
          title: intl.get(`sslm.supplierDocManage.model.docManage.sumScore`).d('汇总得分'),
          dataIndex: 'lineScore',
          width: 100,
          render: (text, record) => {
            const val = docManageRemote
              ? docManageRemote.process('SSLM.EVALUATION_DOC_MANAGE_DETAIL_SCORE_SUM_SCORE', text, {
                  headerInfo: basicInfo,
                  record,
                })
              : text;
            return <a onClick={() => openModal('sumScore', record)}>{val}</a>;
          },
        },
        {
          title: intl.get(`sslm.supplierDocManage.model.docManage.suggestedStrategy`).d('建议策略'),
          width: 170,
          dataIndex: 'suggestStrategiesMeaning',
          render: (val, record) => {
            return (docStatus === 'FINAL_COLLECTED' || docStatus === 'REJECTED') &&
              !isPub &&
              isEdit ? (
              <HzeroFormItem>
                {record.$form &&
                  record.$form.getFieldDecorator(`suggestStrategies`, {
                    initialValue: record.suggestStrategies,
                  })(
                    <Select style={{ width: '100%' }}>
                      {suggestedStrategy.map(item => (
                        <Select.Option value={item.value} key={item.value}>
                          {item.meaning}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
              </HzeroFormItem>
            ) : (
              (docStatus !== 'MANUAL_EVALUATING' && (
                <Tooltip title={val} placement="topLeft">
                  {val}
                </Tooltip>
              )) ||
                null
            );
          },
        },
        {
          title: intl.get(`sslm.supplierDocManage.model.docManage.grade`).d('等级'),
          dataIndex: 'levelCode',
          width: 100,
          render: val => (
            <Tooltip title={val} placement="topLeft">
              {val}
            </Tooltip>
          ),
        },
        {
          title: intl
            .get(`sslm.supplierDocManage.model.docManage.confirmSupplierUuidView`)
            .d('供应商附件查看'),
          dataIndex: 'confirmSupplierUuid',
          width: 100,
          render: (_val, record) => {
            return (
              <Upload
                bucketName={PRIVATE_BUCKET}
                bucketDirectory="sslm-evaluation"
                attachmentUUID={record.confirmSupplierUuid}
                viewOnly
              />
            );
          },
        },
        {
          title: intl.get(`sslm.supplierDocManage.model.docManage.rank`).d('考评排名'),
          dataIndex: 'rankNum',
          width: 100,
          sorter: true,
          render: val => (docStatus !== 'MANUAL_EVALUATING' && val) || null,
        },
      ],
      scoreVendor: [
        {
          title: intl.get(`sslm.supplierDocManage.model.docManage.venderCode`).d('供应商编码'),
          dataIndex: 'supplierNum',
          width: 660,
        },
        {
          title: intl.get(`sslm.supplierDocManage.model.docManage.venderName`).d('供应商名称'),
          dataIndex: 'supplierName',
          width: 670,
          render: val => (
            <Tooltip title={val} placement="topLeft">
              {val}
            </Tooltip>
          ),
        },
        {
          title: intl.get(`sslm.supplierDocManage.view.docManage.categoryName`).d('参评品类'),
          dataIndex: 'categoryName',
          render: (val, record) => (
            <a onClick={() => this.handleCategoriesModal(record)}>
              {intl.get(`sslm.supplierDocManage.view.docManage.categoryName`).d('参评品类')}
            </a>
          ),
          width: 660,
        },
      ],
    };
    if ((tabKey === 'scoreDetail' || tabKey === 'scoreSum') && granularity === 'SU+CA') {
      // 如果考评粒度为供应商加品类，则添加采购品类列
      colsObj[tabKey].splice(
        colsObj[tabKey].findIndex(item => item.dataIndex === 'supplierName') + 1,
        0,
        {
          title: intl.get(`sslm.supplierDocManage.view.docManage.categoryName`).d('参评品类'),
          dataIndex: 'categoryName',
          width: 160,
          render: val => (
            <Tooltip title={val} placement="topLeft">
              {val}
            </Tooltip>
          ),
        }
      );
    }
    if ((tabKey === 'scoreDetail' || tabKey === 'scoreSum') && granularity === 'SU+IT') {
      colsObj[tabKey].splice(
        colsObj[tabKey].findIndex(item => item.dataIndex === 'supplierName') + 1,
        0,
        {
          title: intl.get(`sslm.supplierDocManage.view.docManage.itemName`).d('参评物料'),
          dataIndex: 'itemName',
          width: 160,
          render: val => (
            <Tooltip title={val} placement="topLeft">
              {val}
            </Tooltip>
          ),
        }
      );
    }
    if (tabKey === 'scoreVendor' && granularity === 'SU+IT') {
      colsObj[tabKey].splice(2, 1, {
        title: intl.get(`sslm.supplierDocManage.view.docManage.materialName`).d('参评物料'),
        dataIndex: 'itemName',
        width: 660,
        render: (val, record) => (
          <a onClick={() => this.openAddCAITModal(record)}>
            {intl.get(`sslm.supplierDocManage.view.docManage.materialName`).d('参评物料')}
          </a>
        ),
      });
    }
    if (tabKey === 'scoreVendor' && granularity === 'SU') {
      colsObj[tabKey].splice(2, 1);
      // return [
      //   {
      //     title: intl.get(`sslm.supplierDocManage.model.docManage.venderCode`).d('供应商编码'),
      //     dataIndex: 'supplierNum',
      //     width: 660,
      //   },
      //   {
      //     title: intl.get(`sslm.supplierDocManage.model.docManage.venderName`).d('供应商名称'),
      //     dataIndex: 'supplierName',
      //     width: 670,
      //     render: val => (
      //       <Tooltip title={val} placement="topLeft">
      //         {val}
      //       </Tooltip>
      //     ),
      //   },
      // ];
    }
    if (tabKey === 'scoreDetail' && checkDetailFlag) {
      colsObj.scoreDetail.splice(
        colsObj.scoreDetail.findIndex(item => item.dataIndex === 'finalScore') + 1,
        0,
        {
          title: intl
            .get(`sslm.supplierDocManage.model.docManage.checkDetailScore`)
            .d('校准明细得分'),
          dataIndex: 'checkDetailScore',
          width: 200,
          render: (val, record) => {
            const { kpiEvalTplIndRemind } = record;
            const { remindDesc } = kpiEvalTplIndRemind || {};
            const showTipFlag = !isNil(val);
            const showIcon = showTipFlag && !isEmpty(kpiEvalTplIndRemind);
            const isEditFlag =
              (docStatus === 'FINAL_COLLECTED' || docStatus === 'REJECTED') && !isPub && isEdit;
            return +record.completeFlag === 1 ? (
              isEditFlag ? (
                showTipFlag ? (
                  <HzeroFormItem style={{ width: '85%' }}>
                    {record.$form &&
                      record.$form.getFieldDecorator(`checkDetailScore`, {
                        initialValue: record.checkDetailScore,
                      })(
                        <InputNumberTip
                          isInput
                          value={val}
                          showIcon={showIcon}
                          tooltipFlag={!isEmpty(kpiEvalTplIndRemind)}
                          tooltipTitle={remindDesc}
                          style={showIcon ? { width: '100%', color: '#F05434' } : { width: '100%' }}
                          step={0.01}
                        />
                      )}
                  </HzeroFormItem>
                ) : (
                  <HzeroFormItem style={{ width: '85%' }}>
                    {record.$form &&
                      record.$form.getFieldDecorator(`checkDetailScore`, {
                        initialValue: record.checkDetailScore,
                      })(<InputNumber style={{ width: '100%' }} step={0.01} />)}
                  </HzeroFormItem>
                )
              ) : (
                val
              )
            ) : null;
          },
        },
        {
          title: intl.get(`sslm.supplierDocManage.model.docManage.dtlRemark`).d('说明'),
          width: 170,
          dataIndex: 'dtlRemark',
          render: (val, record) => {
            return (docStatus === 'FINAL_COLLECTED' || docStatus === 'REJECTED') &&
              !isPub &&
              isEdit ? (
              <HzeroFormItem>
                {record.$form &&
                  record.$form.getFieldDecorator(`dtlRemark`, {
                    initialValue: record.dtlRemark,
                  })(<Input />)}
              </HzeroFormItem>
            ) : (
              val
            );
          },
        }
      );
    }
    if (tabKey === 'scoreDetail' && checkLevelFlag) {
      colsObj.scoreDetail.splice(
        colsObj.scoreDetail.findIndex(item => item.dataIndex === 'indicatorLevelCode') + 1,
        0,
        {
          title: intl
            .get(`sslm.supplierDocManage.model.docManage.checkLevelIndDesc`)
            .d('校准指标等级'),
          dataIndex: 'checkLevelDesc',
          width: 170,
          render: (val, record) => {
            return +record.completeFlag === 1 ? (
              (docStatus === 'FINAL_COLLECTED' || docStatus === 'REJECTED') && !isPub && isEdit ? (
                <HzeroFormItem>
                  {record.$form &&
                    record.$form.getFieldDecorator(`checkLevelDesc`, {
                      initialValue: record.checkLevelDesc,
                    })(<Input />)}
                </HzeroFormItem>
              ) : (
                val
              )
            ) : null;
          },
        }
      );
    }
    if (tabKey === 'scoreSum' && checkCollectFlag) {
      colsObj.scoreSum.splice(
        colsObj.scoreSum.findIndex(item => item.dataIndex === 'lineScore') + 1,
        0,
        {
          title: intl.get('sslm.supplierDocManage.model.docManage.checkCollectScore').d('校准得分'),
          dataIndex: 'checkCollectScore',
          width: 170,
          render: (val, record) => {
            return (docStatus === 'FINAL_COLLECTED' || docStatus === 'REJECTED') &&
              !isPub &&
              isEdit ? (
              <HzeroFormItem>
                {record.$form &&
                  record.$form.getFieldDecorator(`checkCollectScore`, {
                    initialValue: record.checkCollectScore,
                  })(<InputNumber style={{ width: '100%' }} step={0.01} />)}
              </HzeroFormItem>
            ) : (
              val
            );
          },
        },
        {
          title: intl.get(`sslm.supplierDocManage.model.docManage.lineEntityRemark`).d('说明'),
          width: 170,
          dataIndex: 'lineEntityRemark',
          render: (val, record) => {
            return (docStatus === 'FINAL_COLLECTED' || docStatus === 'REJECTED') &&
              !isPub &&
              isEdit ? (
              <HzeroFormItem>
                {record.$form &&
                  record.$form.getFieldDecorator(`lineEntityRemark`, {
                    initialValue: record.lineEntityRemark,
                  })(<Input />)}
              </HzeroFormItem>
            ) : (
              val
            );
          },
        }
      );
    }
    if (tabKey === 'scoreSum' && checkLevelFlag) {
      colsObj.scoreSum.splice(
        colsObj.scoreSum.findIndex(item => item.dataIndex === 'levelCode') + 1,
        0,
        {
          title: intl.get(`sslm.supplierDocManage.model.docManage.checkLevelDesc`).d('校准等级'),
          dataIndex: 'checkLevelDesc',
          width: 170,
          render: (val, record) => {
            return (docStatus === 'FINAL_COLLECTED' || docStatus === 'REJECTED') &&
              !isPub &&
              isEdit ? (
              <HzeroFormItem>
                {record.$form &&
                  record.$form.getFieldDecorator(`checkLevelDesc`, {
                    initialValue: record.checkLevelDesc,
                  })(<Input />)}
              </HzeroFormItem>
            ) : (
              val
            );
          },
        }
      );
    }
    if (tabKey === 'scoreSum' && availableFlag && liftStageFlag) {
      colsObj.scoreSum.splice(6, 0, {
        title: intl.get('sslm.supplierDocManage.model.docManage.liftStage').d('升降级阶段'),
        dataIndex: 'toStageDescription',
        width: 170,
        render: val => (
          <Fragment>
            {val ? (
              <Tooltip
                title={intl
                  .get('sslm.supplierDocManage.model.docManage.downTo', {
                    name: val,
                  })
                  .d(`根据评分等级，供应商将至${val}阶段`)}
              >
                {intl
                  .get('sslm.supplierDocManage.model.docManage.downTo', {
                    name: val,
                  })
                  .d(`根据评分等级，供应商将至${val}阶段`)}
              </Tooltip>
            ) : (
              <Tooltip
                title={intl
                  .get('sslm.supplierDocManage.model.docManage.KeepCurrent')
                  .d('根据评分等级，供应商将保持原有生命周期阶段')}
              >
                {intl
                  .get('sslm.supplierDocManage.model.docManage.KeepCurrent')
                  .d('根据评分等级，供应商将保持原有生命周期阶段')}
              </Tooltip>
            )}
          </Fragment>
        ),
      });
    }
    if (
      tabKey === 'scoreSum' &&
      ['COMPLETED', 'PUBLISHED', 'APPEALING', 'PARTIAL_PUBLISHED', 'SUPPLIER_CONFIRMED'].includes(
        docStatus
      )
    ) {
      colsObj.scoreSum.unshift({
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'lineStatusMeaning',
        width: 80,
      });
    }
    // 参评供应商表格字段埋点
    if (docManageRemote) {
      const remoteRowProps = {
        tabKey,
        dataSource: tableData,
        isEdit,
        evalStatus,
        dispatch,
      };
      const remoteRowColumns =
        (docManageRemote &&
          docManageRemote.process(
            'SSLM.EVALUATION_DOC_MANAGE_DETAIL_SCORE_VENDOR_ROW',
            [],
            remoteRowProps
          )) ||
        [];
      if (!isEmpty(remoteRowColumns)) {
        forEach(remoteRowColumns, column => {
          colsObj[tabKey].push(column);
        });
      }
    }
    return colsObj[tabKey];
  }

  /**
   * 查询表单组件
   * @returns React.element
   */
  @Bind()
  getSearchForm() {
    const {
      granularity,
      tabKey,
      evalHeaderId,
      form,
      docStatus,
      form: { getFieldDecorator },
      evaluationDocManage: { processValue = [], dtlValue = [], lineStatus = [] },
      customizeFilterForm,
      custLoading,
      scoreDetailCode = '',
      scoreSumCode = '',
    } = this.props;

    const { expandForm, scoreSumExpandForm } = this.state;

    const lovProps = {
      tenantId: getCurrentTenant().tenantId,
      evalHeaderId,
    };
    if (tabKey === 'scoreDetail') {
      return customizeFilterForm(
        {
          code: scoreDetailCode, // 单元编码，必传
          form,
          expand: expandForm, // 控制查询表单收起展开状态的参数
        },
        <Form
          layout="inline"
          className="more-fields-form"
          style={{ marginBottom: 10 }}
          custLoading={custLoading}
        >
          <Row gutter={24}>
            <Col span={18}>
              <Row>
                <Col span={8}>
                  <Form.Item
                    label={intl.get(`sslm.supplierDocManage.model.docManage.vendor`).d('供应商')}
                    {...formLayout}
                  >
                    {getFieldDecorator('supplierIdList')(
                      <LovMultiple code="SSLM.KPI_DTL_SELECT_SUPPLIER" queryParams={lovProps} />
                    )}
                  </Form.Item>
                </Col>
                {/*  如果考评粒度为供应商加品类，则有采购品类输入框 */}
                {granularity === 'SU+CA' && (
                  <Col span={8}>
                    <Form.Item
                      label={intl
                        .get(`sslm.supplierDocManage.model.docManage.purchaseProduct`)
                        .d('采购品类')}
                      {...formLayout}
                    >
                      {getFieldDecorator('categoryIds')(
                        <LovMulti code="SSLM.KPI_DTL_CATEGORY" queryParams={lovProps} />
                      )}
                    </Form.Item>
                  </Col>
                )}
                {granularity === 'SU+IT' && (
                  <Col span={8}>
                    <Form.Item
                      label={intl.get(`sslm.supplierDocManage.model.docManage.itemName`).d('物料')}
                      {...formLayout}
                    >
                      {getFieldDecorator('itemIds')(
                        <LovMulti code="SSLM.KPI_DTL_ITEM" queryParams={lovProps} />
                      )}
                    </Form.Item>
                  </Col>
                )}
                <Col span={8}>
                  <Form.Item
                    label={intl
                      .get(`sslm.supplierDocManage.model.docManage.evaluationIndicators`)
                      .d('考评指标')}
                    {...formLayout}
                  >
                    {getFieldDecorator('indicatorIds')(
                      <LovMultiple
                        isCascade
                        code="SSLM.KPI_DTL_INDICATOR_TREE"
                        queryParams={lovProps}
                        textField="indicatorName"
                        parentRowKey="parentId"
                      />
                    )}
                  </Form.Item>
                </Col>
              </Row>
              <Row style={{ display: expandForm ? 'block' : 'none' }}>
                <Col span={8}>
                  <Form.Item
                    label={intl
                      .get(`sslm.supplierDocManage.model.docManage.evaluationStatus`)
                      .d('评分状态')}
                    {...formLayout}
                  >
                    {getFieldDecorator('completeFlag')(
                      <Select allowClear>
                        <OptGroup
                          label={intl
                            .get(`sslm.supplierDocManage.model.docManage.systemEval`)
                            .d('系统评分')}
                        >
                          {processValue.map(item => (
                            <Option value={item.value}>{item.meaning}</Option>
                          ))}
                        </OptGroup>
                        <OptGroup
                          label={intl
                            .get(`sslm.supplierDocManage.model.docManage.manualScoring`)
                            .d('手工评分')}
                        >
                          {dtlValue.map(item => (
                            <Option value={item.value}>{item.meaning}</Option>
                          ))}
                        </OptGroup>
                      </Select>
                    )}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={intl
                      .get(`sslm.supplierDocManage.model.docManage.lineScoreFrom`)
                      .d('得分从')}
                    {...formLayout}
                  >
                    {getFieldDecorator('finalScoreFrom')(<Input inputChinese={false} />)}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={intl
                      .get(`sslm.supplierDocManage.model.docManage.lineScoreTo`)
                      .d('得分至')}
                    {...formLayout}
                  >
                    {getFieldDecorator('finalScoreTo')(<Input inputChinese={false} />)}
                  </Form.Item>
                </Col>
              </Row>
              <Row>
                <Col span={8}>
                  <Form.Item
                    label={intl.get('sslm.common.view.supplier.class').d('供应商分类')}
                    {...formLayout}
                  >
                    {getFieldDecorator('supplierCategoryIds')(
                      <LovMultiple
                        isCascade // 是否级联勾选
                        textField="categoryDescription"
                        code="SSLM.SUPPLIER_CATEGORY_TREE"
                        queryParams={{ tenantId: organizationId }}
                        parentRowKey="parentCategoryId"
                      />
                    )}
                  </Form.Item>
                </Col>
              </Row>
            </Col>
            <Col span={6} className="search-btn-more">
              <Form.Item>
                <Button onClick={this.toggleForm}>
                  {expandForm
                    ? intl.get('hzero.common.button.collected').d('收起查询')
                    : intl.get(`hzero.common.button.viewMore`).d('更多查询')}
                </Button>
                <Button data-code="reset" onClick={this.handleReset}>
                  {intl.get('hzero.common.button.reset').d('重置')}
                </Button>
                <Button
                  data-code="search"
                  type="primary"
                  htmlType="submit"
                  onClick={this.handleSearch}
                >
                  {intl.get('hzero.common.status.search').d('查询')}
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      );
    } else if (tabKey === 'scoreSum') {
      return customizeFilterForm(
        {
          code: scoreSumCode, // 单元编码，必传
          form,
          expand: scoreSumExpandForm, // 控制查询表单收起展开状态的参数
        },
        <Form
          layout="inline"
          className="more-fields-form"
          style={{ marginBottom: 10 }}
          custLoading={custLoading}
        >
          <Row gutter={24}>
            <Col span={18}>
              <Row type="flex">
                <Col span={8}>
                  <Form.Item
                    label={intl.get(`sslm.supplierDocManage.model.docManage.vendor`).d('供应商')}
                    {...formLayout}
                  >
                    {getFieldDecorator('supplierId')(
                      <Lov
                        code="SSLM.KPI_DTL_SUPPLIER"
                        queryParams={lovProps}
                        ref={node => {
                          this.lovRef_4 = node;
                        }}
                        onChange={(_, lovRecord) => {
                          this.lovRef_4.state.text = lovRecord.erpSupplierName
                            ? lovRecord.erpSupplierName
                            : lovRecord.companyName;
                        }}
                      />
                    )}
                  </Form.Item>
                </Col>
                {granularity === 'SU+CA' && (
                  <Col span={8}>
                    <Form.Item
                      label={intl
                        .get(`sslm.supplierDocManage.model.docManage.purchaseProduct`)
                        .d('采购品类')}
                      {...formLayout}
                    >
                      {getFieldDecorator('categoryIds')(
                        <LovMulti code="SSLM.KPI_DTL_CATEGORY" queryParams={lovProps} />
                      )}
                    </Form.Item>
                  </Col>
                )}
                {granularity === 'SU+IT' && (
                  <Col span={8}>
                    <Form.Item
                      label={intl.get(`sslm.supplierDocManage.model.docManage.itemName`).d('物料')}
                      {...formLayout}
                    >
                      {getFieldDecorator('itemIds')(
                        <LovMulti code="SSLM.KPI_DTL_ITEM" queryParams={lovProps} />
                      )}
                    </Form.Item>
                  </Col>
                )}
                <Col span={8}>
                  <Form.Item
                    label={intl
                      .get(`sslm.supplierDocManage.model.docManage.lineScoreFrom`)
                      .d('得分从')}
                    {...formLayout}
                  >
                    {getFieldDecorator('lineScoreFrom')(<Input inputChinese={false} />)}
                  </Form.Item>
                </Col>
              </Row>
              <Row style={{ display: scoreSumExpandForm ? 'block' : 'none' }}>
                <Col span={8}>
                  <Form.Item
                    label={intl
                      .get(`sslm.supplierDocManage.model.docManage.lineScoreTo`)
                      .d('得分至')}
                    {...formLayout}
                  >
                    {getFieldDecorator('lineScoreTo')(<Input inputChinese={false} />)}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={intl.get('sslm.common.view.supplier.class').d('供应商分类')}
                    {...formLayout}
                  >
                    {getFieldDecorator('supplierCategoryIds')(
                      <LovMultiple
                        isCascade // 是否级联勾选
                        textField="categoryDescription"
                        code="SSLM.SUPPLIER_CATEGORY_TREE"
                        queryParams={{ tenantId: organizationId }}
                        parentRowKey="parentCategoryId"
                      />
                    )}
                  </Form.Item>
                </Col>
                {['COMPLETED', 'PUBLISHED', 'APPEALING', 'PARTIAL_PUBLISHED'].includes(
                  docStatus
                ) && (
                  <Col span={8}>
                    <Form.Item label={intl.get('hzero.common.status').d('状态')} {...formLayout}>
                      {getFieldDecorator('lineStatus')(
                        <Select allowClear>
                          {lineStatus.map(n => (
                            <Option value={n.value} key={n.value}>
                              {n.meaning}
                            </Option>
                          ))}
                        </Select>
                      )}
                    </Form.Item>
                  </Col>
                )}
                <Col span={8}>
                  <Form.Item
                    label={intl.get(`sslm.supplierDocManage.model.docManage.grade`).d('等级')}
                    {...formLayout}
                  >
                    {getFieldDecorator('levelCode')(<Input />)}
                  </Form.Item>
                </Col>
              </Row>
            </Col>
            <Col span={6} className="search-btn-more">
              <Form.Item>
                <Button onClick={this.scoreSumToggleForm}>
                  {scoreSumExpandForm
                    ? intl.get('hzero.common.button.collected').d('收起查询')
                    : intl.get(`hzero.common.button.viewMore`).d('更多查询')}
                </Button>
                <Button data-code="reset" onClick={this.handleReset}>
                  {intl.get('hzero.common.button.reset').d('重置')}
                </Button>
                <Button
                  // style={{ marginRight: 18 }}
                  data-code="search"
                  type="primary"
                  htmlType="submit"
                  onClick={this.handleSearch}
                >
                  {intl.get('hzero.common.status.search').d('查询')}
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      );
    } else if (tabKey === 'scoreVendor') {
      if (granularity === 'SU+CA') {
        // 如果考评粒度为供应商加品类，则有采购品类输入框
        return (
          <Form layout="inline" className="more-fields-form" style={{ marginBottom: 10 }}>
            <Row type="flex" gutter={10}>
              <Col span={18}>
                <Row type="flex">
                  <Col span={8}>
                    <Form.Item
                      label={intl.get(`sslm.supplierDocManage.model.docManage.vendor`).d('供应商')}
                      {...formLayout}
                    >
                      {getFieldDecorator('supplierId')(
                        <Lov
                          code="SSLM.KPI_DTL_SUPPLIER"
                          queryParams={lovProps}
                          ref={node => {
                            this.lovRef_4 = node;
                          }}
                          onChange={(_, lovRecord) => {
                            this.lovRef_4.state.text = lovRecord.erpSupplierName
                              ? lovRecord.erpSupplierName
                              : lovRecord.companyName;
                          }}
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl
                        .get(`sslm.supplierDocManage.model.docManage.purchaseProduct`)
                        .d('采购品类')}
                      {...formLayout}
                    >
                      {getFieldDecorator('categoryIds')(
                        <LovMulti code="SSLM.KPI_DTL_CATEGORY" queryParams={lovProps} />
                      )}
                    </Form.Item>
                  </Col>
                </Row>
              </Col>
              <Col span={4} className="search-btn-more">
                <FormItem>
                  <Button data-code="reset" onClick={this.handleReset}>
                    {intl.get('hzero.common.button.reset').d('重置')}
                  </Button>
                  <Button
                    // style={{ marginRight: 18 }}
                    data-code="search"
                    type="primary"
                    htmlType="submit"
                    onClick={this.handleSearch}
                  >
                    {intl.get('hzero.common.status.search').d('查询')}
                  </Button>
                </FormItem>
              </Col>
            </Row>
          </Form>
        );
      } else if (granularity === 'SU+IT') {
        return (
          <Form layout="inline" className="more-fields-form" style={{ marginBottom: 10 }}>
            <Row type="flex" gutter={10}>
              <Col span={18}>
                <Row type="flex">
                  <Col span={8}>
                    <Form.Item
                      label={intl.get(`sslm.supplierDocManage.model.docManage.vendor`).d('供应商')}
                      {...formLayout}
                    >
                      {getFieldDecorator('supplierId')(
                        <Lov
                          code="SSLM.KPI_DTL_SUPPLIER"
                          queryParams={lovProps}
                          ref={node => {
                            this.lovRef_5 = node;
                          }}
                          onChange={(_, lovRecord) => {
                            this.lovRef_5.state.text = lovRecord.erpSupplierName
                              ? lovRecord.erpSupplierName
                              : lovRecord.companyName;
                          }}
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl.get(`sslm.supplierDocManage.model.docManage.itemName`).d('物料')}
                      {...formLayout}
                    >
                      {getFieldDecorator('itemIds')(
                        <LovMulti code="SSLM.KPI_DTL_ITEM" queryParams={lovProps} />
                      )}
                    </Form.Item>
                  </Col>
                </Row>
              </Col>
              <Col span={4} className="search-btn-more">
                <FormItem>
                  <Button data-code="reset" onClick={this.handleReset}>
                    {intl.get('hzero.common.button.reset').d('重置')}
                  </Button>
                  <Button
                    // style={{ marginRight: 18 }}
                    data-code="search"
                    type="primary"
                    htmlType="submit"
                    onClick={this.handleSearch}
                  >
                    {intl.get('hzero.common.status.search').d('查询')}
                  </Button>
                </FormItem>
              </Col>
            </Row>
          </Form>
        );
      } else if (granularity === 'SU') {
        // 如果考评粒度为仅供应商
        return (
          <Form layout="inline" className="more-fields-form" style={{ marginBottom: 10 }}>
            <Row type="flex" gutter={10}>
              <Col span={18}>
                <Row type="flex">
                  <Col span={8}>
                    <Form.Item
                      label={intl.get(`sslm.supplierDocManage.model.docManage.vendor`).d('供应商')}
                      {...formLayout}
                    >
                      {getFieldDecorator('supplierId')(
                        <Lov
                          code="SSLM.KPI_DTL_SUPPLIER"
                          queryParams={lovProps}
                          ref={node => {
                            this.lovRef_6 = node;
                          }}
                          onChange={(_, lovRecord) => {
                            this.lovRef_6.state.text = lovRecord.erpSupplierName
                              ? lovRecord.erpSupplierName
                              : lovRecord.companyName;
                          }}
                        />
                      )}
                    </Form.Item>
                  </Col>
                </Row>
              </Col>
              <Col span={4} className="search-btn-more">
                <FormItem>
                  <Button data-code="reset" onClick={this.handleReset}>
                    {intl.get('hzero.common.button.reset').d('重置')}
                  </Button>
                  <Button
                    // style={{ marginRight: 18 }}
                    data-code="search"
                    type="primary"
                    htmlType="submit"
                    onClick={this.handleSearch}
                  >
                    {intl.get('hzero.common.status.search').d('查询')}
                  </Button>
                </FormItem>
              </Col>
            </Row>
          </Form>
        );
      }
    }
  }

  @Bind()
  getScrollX(columns) {
    const { tabKey } = this.props;
    const xObj = {
      scoreDetail: {
        x: sum(columns.map(n => (isNumber(n.width) ? n.width : 150))) + 150,
        y: 353.4,
      },
      scoreSum: { x: sum(columns.map(n => (isNumber(n.width) ? n.width : 150))) + 150, y: 353.4 },
      scoreVendor: {
        x: sum(columns.map(n => (isNumber(n.width) ? n.width : 150))),
        y: 353.4,
      },
    };
    return xObj[tabKey];
  }

  // 查询
  @Bind()
  searchData(page = {}, flag = true, sorter) {
    const {
      form,
      onSearch,
      tabKey,
      rowKey,
      evaluationDocManage: {
        processValue = [], // 系统评分值集
        dtlValue = [], // 手工评分值集
      },
    } = this.props;
    const { selectedRows, selectedRowKeys, selectAllFlag, unChooseEvalDtlIds } = this.state;
    form.validateFields(async (err, values) => {
      if (!err && onSearch) {
        const value = values;
        const { completeFlag } = value;
        //  当选择系统评分的数据时需要修改字段名为processStatus
        if (processValue.find(i => i.value === completeFlag)) {
          value.scoreType = 'SYSTEM';
          value.processStatus = completeFlag;
          value.completeFlag = null;
        } else if (dtlValue.find(i => i.value === completeFlag)) {
          value.scoreType = 'MANUAL';
          value.processStatus = null;
        }
        const { supplierIdList, indicatorIds, ...other } = value;
        const newSupplierIdList = isArray(supplierIdList)
          ? supplierIdList
          : supplierIdList
          ? supplierIdList.split(',')
          : supplierIdList;
        onSearch(
          {
            ...other,
            supplierIdList: newSupplierIdList,
            page,
            sortOrder: sorter && sorter.order,
            indicatorIds: indicatorIds ? indicatorIds.split(',') : null,
          },
          tabKey
        ).then(res => {
          if (tabKey === 'scoreDetail') {
            if (flag) {
              this.setState({
                selectAllFlag: 0,
                selectedRows: [],
                selectedRowKeys: [],
                unChooseEvalDtlIds: [],
              });
            } else if (selectAllFlag === 1 && res) {
              const tableData = res.kpiEvalDetailLineDTOPage || {};
              const scoreDetail = tableData.content || [];
              const newSelectedRows = selectedRows.concat(
                scoreDetail.filter(record => record.scoreType === 'MANUAL')
              );
              const newSelectedRowKeys = selectedRowKeys.concat(
                newSelectedRows.map(record => record[rowKey])
              );
              this.setState({
                selectedRows: uniqBy(newSelectedRows, rowKey).filter(
                  record => !unChooseEvalDtlIds.includes(record[rowKey])
                ),
                selectedRowKeys: difference(uniq(newSelectedRowKeys), unChooseEvalDtlIds),
              });
            }
          }
          if (tabKey === 'scoreVendor') {
            this.setState({
              selectedRows: [],
              selectedRowKeys: [],
              activeRows: {},
            });
          }
          if (tabKey === 'scoreSum') {
            this.setState({
              selectedRows: [],
              selectedRowKeys: [],
            });
          }
        });
      }
    });
  }

  /**
   * 查询请求
   * @param {object} page - 分页信息
   */
  @Bind()
  handleSearch(page = {}, flag = true, sorter) {
    const { selectedScoreVendor } = this.state;
    // 查询前判断参评供应商新增需先保存
    if (selectedScoreVendor) {
      Modal.confirm({
        title: intl
          .get('sslm.common.view.message.continueSearch')
          .d('有数据未保存，是否继续查询？'),
        onOk: () => {
          this.setState({
            selectedScoreVendor: false,
          });
          this.searchData(page, flag, sorter);
        },
        onCancel: () => {
          const { dispatch, pagination } = this.props;
          dispatch({
            type: 'evaluationDocManage/updateState',
            payload: {
              scoreVendorPagination: pagination,
            },
          });
        },
      });
    } else {
      this.searchData(page, flag, sorter);
    }
  }

  /**
   * 重置查询表单
   */
  @Bind()
  handleReset() {
    const { form } = this.props;
    form.resetFields();
  }

  /**
   * 参评供应商行保存按钮处理逻辑
   */
  @Bind()
  @Debounce(500)
  handleScoreVendorSave() {
    const { tableData = [], dispatch, evalHeaderId, granularity, handleRefresh } = this.props;
    const requestBody = getEditTableData(tableData);
    const errMessage = [];
    if (requestBody.length === 0) {
      notification.warning({
        message: intl
          .get('sslm.supplierDocManage.view.message.noSaveData')
          .d('您暂无需要保存的数据！'),
      });
      return false;
    }
    if (granularity !== 'SU') {
      let flag = true;
      for (const key in requestBody) {
        if (Object.prototype.hasOwnProperty.call(requestBody, key)) {
          const { categoryVOS, itemVOS } = requestBody[key];
          const Data = granularity === 'SU+CA' ? categoryVOS : itemVOS;
          if (granularity === 'SU+CA') {
            if (!(Array.isArray(Data) && Data.length)) {
              errMessage.push(requestBody[key].supplierName);
              flag = false;
              break;
            }
          } else if (!(Array.isArray(Data) && !isEmpty(Data.filter(item => item.insertFlag)))) {
            errMessage.push(requestBody[key].supplierName);
            flag = false;
            break;
          }
        }
      }
      if (!flag) {
        const errMsg = `[${errMessage.join(',')}]`;
        notification.error({
          message:
            granularity === 'SU+CA'
              ? errMsg +
                intl
                  .get('sslm.supplierDocManage.view.message.noCategoryVos')
                  .d('参评品类不能为空！')
              : errMsg +
                intl.get('sslm.supplierDocManage.view.message.noItemVos').d('参评物料不能为空！'),
        });
        return false;
      }
    }

    const bodyParams = (requestBody && requestBody.map(e => ({ ...e, evalHeaderId }))) || [];

    const params = {
      headerId: evalHeaderId,
      body: bodyParams,
    };
    dispatch({
      type: 'evaluationDocManage/saveEvalTplScopeSupplierList',
      payload: {
        ...params,
        customizeUnitCode: 'SSLM.EVALUATION_DOC_MANAGE_DETAIL.SCOREVENDORLINE',
      },
    }).then(res => {
      if (res) {
        notification.success({
          message: intl.get('hzero.common.notification.success.save').d('保存成功'),
        });
        this.setState({
          selectedRowKeys: [],
          activeRows: {},
          selectedRows: [],
          selectedScoreVendor: false,
        });
        handleRefresh();
      }
    });
  }

  /**
   * 参评供应商行删除按钮处理逻辑
   */
  @Bind()
  @Debounce(500)
  handleScoreVendorDelete() {
    // 判断是否有增加的供应商
    const { selectedScoreVendor } = this.state;
    if (selectedScoreVendor) {
      Modal.confirm({
        title: intl
          .get('sslm.common.view.message.continueDelete')
          .d('有数据未保存，是否继续删除？'),
        onOk: () => {
          Modal.confirm({
            title: intl.get('sslm.supplierDocManage.view.message.deleteConfirm').d('确认删除？'),
            onOk: async () => {
              const { selectedRows } = this.state;
              const { dispatch, evalHeaderId, handleRefresh } = this.props;
              const params = {
                headerId: evalHeaderId,
                body: selectedRows,
              };
              const res = await dispatch({
                type: 'evaluationDocManage/deleteEvalTplScopeSupplierList',
                payload: params,
              });
              if (res) {
                notification.success({
                  message: intl.get('hzero.common.notification.success.delete').d('删除成功'),
                });
                this.setState({ selectedRowKeys: [], activeRows: {}, selectedRows: [] });
              }
              this.setState({
                selectedScoreVendor: false,
              });
              handleRefresh();
            },
          });
        },
      });
    } else {
      Modal.confirm({
        title: intl.get('sslm.supplierDocManage.view.message.deleteConfirm').d('确认删除？'),
        onOk: async () => {
          const { selectedRows } = this.state;
          const { dispatch, evalHeaderId, handleRefresh } = this.props;
          const params = {
            headerId: evalHeaderId,
            body: selectedRows,
          };
          const res = await dispatch({
            type: 'evaluationDocManage/deleteEvalTplScopeSupplierList',
            payload: params,
          });
          if (res) {
            notification.success({
              message: intl.get('hzero.common.notification.success.delete').d('删除成功'),
            });
            this.setState({ selectedRowKeys: [], activeRows: {}, selectedRows: [] });
          }
          handleRefresh();
        },
      });
    }
  }

  /**
   *详情页评分汇总导入
   */
  @Bind()
  handleScoreSumImport() {
    const {
      history,
      match: {
        params: { tplId, headerId },
      },
      basicInfo: { evalHeaderId, tenantId, evalGranularity },
    } = this.props;
    history.push({
      pathname: '/sslm/evaluation-doc-manage/comment-import/SSLM.KPI_CALC',
      search: queryString.stringify({
        backPath: `/sslm/evaluation-doc-manage/detail/${tplId}/${headerId}`,
        action: intl
          .get('sslm.supplierDocManage.model.evalDocManage.scoreSumImport')
          .d('评分汇总导入'),
        args: JSON.stringify({
          evalHeaderId,
          tenantId,
          evalGranularity,
        }),
      }),
    });
  }

  /**
   * 参评供应商行新增按钮处理逻辑
   */
  @Bind()
  @Debounce(500)
  handleScoreVendorAdd() {
    this.setState({ scoreVendorModalVisible: true });
  }

  /**
   * 勾选参评供应商行数据事件处理函数
   * @param selectedRowKeys
   */
  @Bind()
  handleSelectChange(selectedRowKeys = [], selectedRows) {
    const { tabKey, tableData, rowKey, handleScoreSumSelected } = this.props;
    const { unChooseEvalDtlIds, selectAllFlag } = this.state;
    if (tabKey === 'scoreDetail' && selectAllFlag === 1) {
      const Data = tableData
        .filter(record => record.scoreType === 'MANUAL')
        .map(record => record[rowKey]);
      // 处理全选之后取消勾选之后再次勾选
      const filterUnChooseEvalDtlIds = unChooseEvalDtlIds.filter(
        item => !selectedRowKeys.includes(item)
      );
      // 获取当前页取消勾选的数据
      const newUnChooseEvalDtlIds = filterUnChooseEvalDtlIds.concat(
        difference(Data, selectedRowKeys)
      );
      this.setState({
        unChooseEvalDtlIds: uniq(newUnChooseEvalDtlIds),
      });
    }
    this.setState({ selectedRowKeys, selectedRows });
    if (isFunction(handleScoreSumSelected)) {
      handleScoreSumSelected(!isEmpty(selectedRows));
    }
  }

  /**
   * 参评供应商行新增弹窗确定处理逻辑
   */
  @Bind()
  @Debounce(500)
  handleScoreVendorModalOk() {
    if (this.suppliers.current) {
      const {
        state: { selectedRows = [], selectAllFlag = 0, unChooseCompanyNums = [] },
        search = {},
      } = this.suppliers.current;
      const { form: { getFieldsValue = () => {} } = {} } = (search || {}).props;
      const { dispatch, granularity, evalHeaderId, clearProperties } = this.props;
      // 全选从后端取数据
      if (selectAllFlag) {
        const params = getFieldsValue();
        const { stageIds } = params;
        const payload = {
          selectAllFlag,
          unChooseCompanyNums,
          ...params,
          stageIds: isArray(stageIds) ? stageIds.join() : stageIds,
          evalHeaderId,
          customizeUnitCode:
            'SSLM.EVALUATION_DOC_MANAGE_DETAIL.SCOREVENDOR_ADDMODAL,SSLM.EVALUATION_DOC_MANAGE_DETAIL.SCOREVENDOR_FILTER',
        };
        dispatch({
          type: 'evaluationDocManage/queryAllSupplier',
          payload,
        }).then(res => {
          if (res) {
            this.setState({
              selectedScoreVendor: true,
            });
            dispatch({
              type: 'evaluationDocManage/addTableData',
              payload: res.map(item => {
                const { supplierCompanyId, companyNum, companyName, ...rest } = item;
                return {
                  ...rest,
                  supplierId: supplierCompanyId,
                  supplierNum: companyNum,
                  supplierName: companyName,
                  categoryName:
                    granularity === 'SU+CA'
                      ? intl
                          .get(`sslm.supplierDocManage.model.docManage.purchaseProduct`)
                          .d('采购品类')
                      : intl.get(`sslm.supplierDocManage.model.docManage.itemName`).d('物料'),
                  _status: 'create',
                };
              }),
            });
            this.setState({ scoreVendorModalVisible: false });
            // 参评供应商 - 关闭新增弹窗时 清掉个性化缓存的form
            if (isFunction(clearProperties)) {
              clearProperties('SSLM.EVALUATION_DOC_MANAGE_DETAIL.SCOREVENDOR_FILTER');
            }
          }
        });
      } else {
        // 不点全选数据从前端获取
        // selectedRows不为空，说明有新增参评供应商
        if (!isEmpty(selectedRows)) {
          this.setState({
            selectedScoreVendor: true,
          });
        }
        dispatch({
          type: 'evaluationDocManage/addTableData',
          payload: selectedRows.map(item => {
            const { supplierCompanyId, companyNum, companyName, ...rest } = item;
            return {
              ...rest,
              supplierId: supplierCompanyId,
              supplierNum: companyNum,
              supplierName: companyName,
              categoryName:
                granularity === 'SU+CA'
                  ? intl.get(`sslm.supplierDocManage.model.docManage.purchaseProduct`).d('采购品类')
                  : intl.get(`sslm.supplierDocManage.model.docManage.itemName`).d('物料'),
              _status: 'create',
            };
          }),
        });
        this.setState({ scoreVendorModalVisible: false });
        // 参评供应商 - 关闭新增弹窗时 清掉个性化缓存的form
        if (isFunction(clearProperties)) {
          clearProperties('SSLM.EVALUATION_DOC_MANAGE_DETAIL.SCOREVENDOR_FILTER');
        }
      }
    }
  }

  /**
   * 参评供应商行新增弹窗取消处理逻辑
   */
  @Bind()
  @Debounce(500)
  handleScoreVendorModalCancel() {
    // 参评供应商 - 关闭新增弹窗时 清掉个性化缓存的form
    const { clearProperties } = this.props;

    if (isFunction(clearProperties)) {
      clearProperties('SSLM.EVALUATION_DOC_MANAGE_DETAIL.SCOREVENDOR_FILTER');
    }

    this.setState({ scoreVendorModalVisible: false });
  }

  /**
   * 获取供应商数据
   * @param params
   * @param cb
   * @returns {*}
   */
  @Bind()
  fetchEvalTplScopeSupplierList(params, cb = e => e) {
    const { dispatch, evalTplId, evalHeaderId } = this.props;
    return dispatch({
      type: 'evaluationDocManage/queryEvalTplScopeSupplierList',
      templateId: evalTplId,
      params: {
        ...params,
        evalHeaderId,
      },
    }).then(res => {
      if (res) {
        cb(res);
      }
    });
  }

  /**
   * 开启新增物料/品类弹窗
   * @param record
   */
  @Bind()
  @Debounce(500)
  openAddCAITModal(record) {
    const selectedCategories = this.getSelectedDatas() || {};
    let selectedItemKeyData = [];
    let selectedItemData = [];
    let unSelectedItemKeyData = [];
    let itemSelectedFlag = false;
    if (selectedCategories[`${record.supplierId}`]) {
      selectedItemKeyData = selectedCategories[`${record.supplierId}`].itemKeySelected;
      selectedItemData = selectedCategories[`${record.supplierId}`].itemSelected;
      unSelectedItemKeyData = selectedCategories[`${record.supplierId}`].itemKeyUnSelected;
      itemSelectedFlag = selectedCategories[`${record.supplierId}`].itemSelectFlag;
    }
    this.handleFetchEvalTplScopeCategoryList({ supplierId: record.supplierId }).then(res => {
      const { selectedRows, selectedRowKeys: resSelectedRowKeys } = res;
      if (this.categoriesNode) {
        this.categoriesNode.setState({
          selectedData: resSelectedRowKeys,
          selectedRows: itemSelectedFlag ? selectedItemData : selectedRows,
          selectedRowKeys: itemSelectedFlag ? selectedItemKeyData : resSelectedRowKeys,
          unSelectedRowKeys: unSelectedItemKeyData,
        });
      }
    });
    this.setState({
      categoriesModalVisible: true,
      activeRows: record,
    });
  }

  /**
   * 获取编辑行，参评品类和物料的已选择数据
   * @returns
   */
  @Bind()
  getSelectedDatas() {
    const { tableData = [], granularity } = this.props;
    const editLineDatas = getEditTableData(tableData);
    const lineEditData = {};
    if (granularity !== 'SU') {
      if (editLineDatas.length > 0) {
        for (const key in editLineDatas) {
          if (Object.prototype.hasOwnProperty.call(editLineDatas, key)) {
            const { categoryVOS = [], itemVOS = [], supplierId } = editLineDatas[key];
            if (granularity === 'SU+CA') {
              if (categoryVOS.length > 0) {
                const categoryKeyVOSList = categoryVOS.map(e => e.categoryId);
                lineEditData[`${supplierId}`] = {
                  categoryKeySelected: categoryKeyVOSList,
                  categorySelected: categoryVOS,
                  categorySelectFlag: true,
                };
              } else {
                lineEditData[`${supplierId}`] = {
                  categorySelectFlag: true,
                };
              }
            } else {
              // eslint-disable-next-line no-lonely-if
              if (itemVOS.length > 0) {
                const itemVOSKeyList = itemVOS.filter(e => e.insertFlag === 1).map(e => e.itemId);
                const itemVOSKeyListUnselect = itemVOS
                  .filter(e => e.insertFlag === 0)
                  .map(e => e.itemId);
                const itemVOSList = itemVOS.filter(e => e.insertFlag === 1);
                const itemVOSListUnselect = itemVOS.filter(e => e.insertFlag === 0);
                lineEditData[`${supplierId}`] = {
                  itemKeySelected: itemVOSKeyList,
                  itemSelected: itemVOSList,
                  itemKeyUnSelected: itemVOSKeyListUnselect,
                  itemUnSelected: itemVOSListUnselect,
                  itemSelectFlag: true,
                };
              } else {
                lineEditData[`${supplierId}`] = {
                  itemSelectFlag: true,
                };
              }
            }
          }
        }
      }
    }
    return lineEditData;
  }

  @Bind()
  handleCategoriesModal(record) {
    const { evalHeaderId, dispatch, docStatus, isBdkpiEvalFlag = false, docType } = this.props;
    // 考评模板类型判断 判断是否是 业务单据考评类型,单据类型=协议
    const curIsBdkpiEvalFlag = ['XY'].includes(docType) ? false : isBdkpiEvalFlag;
    const { supplierId } = record;
    const selectedCategories = this.getSelectedDatas() || {};
    const { categoryKeySelected: selectedData = [], categorySelectFlag = false } =
      selectedCategories[`${supplierId}`] || {};
    ChoerodonModal.open({
      title: intl.get(`sslm.supplierDocManage.view.title.category`).d('参评品类定义'),
      key: ChoerodonModal.key(),
      drawer: true,
      style: { width: 750 },
      okCancel: ['NEW_REJECTED', 'NEW'].includes(docStatus),
      children: (
        <NewCategories
          selectedData={selectedData}
          categorySelectFlag={categorySelectFlag}
          evalHeaderId={evalHeaderId}
          supplierId={supplierId}
          onRef={ds => {
            this.categoriesDs = ds;
          }}
          docStatus={docStatus}
          isBdkpiEvalFlag={curIsBdkpiEvalFlag}
        />
      ),
      onOk: () => {
        const selectedRows = this.categoriesDs.toJSONData();
        dispatch({
          type: 'evaluationDocManage/updateTableData',
          payload: {
            data: selectedRows,
            activeRows: record,
            granularity: 'SU+CA',
          },
        });
      },
    });
  }

  /**
   * 添加物料、品类弹窗确定按钮处理逻辑
   */
  @Bind()
  @Debounce(500)
  handleCategoriesModalOk(data) {
    const { dispatch, granularity } = this.props;
    const { activeRows } = this.state;
    dispatch({
      type: 'evaluationDocManage/updateTableData',
      payload: {
        data,
        activeRows,
        granularity,
      },
    });
    this.setState({ categoriesModalVisible: false });
  }

  /**
   * 添加物料、品类弹窗取消按钮处理逻辑
   */
  @Bind()
  @Debounce(500)
  handleCategoriesModalCancel() {
    this.setState({ categoriesModalVisible: false });
  }

  /**
   * 获取品类、物料信息
   */
  @Bind()
  handleFetchEvalTplScopeCategoryList(params) {
    const { dispatch, evalHeaderId, granularity } = this.props;
    if (granularity === 'SU+CA') {
      return dispatch({
        type: 'evaluationDocManage/queryEvalTplScopeCategoryList',
        payload: {
          ...params,
          headerId: evalHeaderId,
          hzeroUIFlag: 1,
          businessObjectCode: 'SRM_C_SRM_SSLM_KPI_EVAL',
        },
      });
    } else {
      return dispatch({
        type: 'evaluationDocManage/queryScopeItemList',
        payload: {
          ...params,
          headerId: evalHeaderId,
        },
      });
    }
  }

  /**
   * 保存评分明细
   */
  @Bind()
  @Debounce(500)
  handleScoreDetailSave() {
    const { tableData = [], dispatch } = this.props;
    const data = getEditTableData(tableData);
    const Data = [];
    data.forEach(record => {
      const { dtlObjectVersionNumber, objectVersionNumber, ...others } = record;
      Data.push({
        ...others,
        objectVersionNumber: dtlObjectVersionNumber,
      });
    });
    if (Data.length) {
      dispatch({
        type: 'evaluationDocManage/saveCoreDetail',
        payload: {
          data: Data,
          customizeUnitCode: 'SSLM.EVALUATION_DOC_MANAGE_DETAIL.SCOREDETAILLINE',
        },
      }).then(res => {
        if (res) {
          notification.success({
            message: intl.get('hzero.common.notification.success.save').d('保存成功'),
          });
        }
        const { handleRefresh } = this.props;
        handleRefresh();
      });
    } else {
      notification.warning({
        message: intl
          .get('sslm.supplierDocManage.view.saveWaring.noDataSave')
          .d('暂无需要保存的数据！'),
      });
    }
  }

  /**
   * 保存评分汇总信息
   */
  @Bind()
  @Debounce(500)
  handleScoreSumSave() {
    const { tableData = [], dispatch } = this.props;
    const Data = getEditTableData(tableData);
    if (Data.length) {
      dispatch({
        type: 'evaluationDocManage/saveScoreSum',
        payload: {
          data: Data,
          customizeUnitCode: 'SSLM.EVALUATION_DOC_MANAGE_DETAIL.SCORESUMLINE',
        },
      }).then(res => {
        if (res) {
          notification.success({
            message: intl.get('hzero.common.notification.success.save').d('保存成功'),
          });
        }
        const { handleRefresh } = this.props;
        handleRefresh();
        this.setState({
          selectedRows: [],
          selectedRowKeys: [],
        });
      });
    } else {
      notification.warning({
        message: intl
          .get('sslm.supplierDocManage.view.saveWaring.noDataSave')
          .d('暂无需要保存的数据！'),
      });
    }
  }

  @Bind()
  handleBatchMaintenanceRaters() {
    const { selectedRowKeys, selectAllFlag, unChooseEvalDtlIds } = this.state;
    const {
      evalHeaderId,
      handleRefresh,
      form: { getFieldsValue },
      averageFlag,
      customizeTable,
    } = this.props;
    const { indicatorIds, supplierIdList, ...filterFormFields } = getFieldsValue();
    const newSupplierIdList = isArray(supplierIdList)
      ? supplierIdList
      : supplierIdList
      ? supplierIdList.split(',')
      : supplierIdList;
    const query = {
      customizeUnitCode: 'SSLM.EVALUATION_DOC_MANAGE_DETAIL.HEADER',
      indicatorIds: indicatorIds ? indicatorIds.split(',') : null,
      supplierIdList: newSupplierIdList,
      ...filterFormFields,
    };
    this.modal = ChoerodonModal.open({
      key: ChoerodonModal.key(),
      closable: true,
      movable: true,
      maskClosable: true,
      destroyOnClose: true,
      keyboardClosable: true,
      style: { width: 900 },
      footer: null,
      title: intl
        .get('sslm.supplierDocManage.view.button.batchMaintenanceRaters')
        .d('批量维护评分人'),
      children: (
        <BatchMaintenanceRaters
          unChooseEvalDtlIds={unChooseEvalDtlIds}
          selectAllFlag={selectAllFlag}
          query={query}
          evalHeaderId={evalHeaderId}
          handleRefresh={handleRefresh}
          selectedRowKeys={selectedRowKeys}
          modal={this.modal}
          averageFlag={averageFlag}
          customizeTable={customizeTable}
        />
      ),
    });
  }

  /**
   * 评分人导入按钮处理逻辑
   * */
  @Bind()
  handleEvaluationPersonImport() {
    const {
      history,
      match: {
        params: { tplId, headerId },
      },
      basicInfo: { evalHeaderId, tenantId, evalGranularity },
    } = this.props;
    history.push({
      pathname: '/sslm/evaluation-doc-manage/comment-import/SSLM.BATCH_IMPORT_EVAL_USER',
      search: queryString.stringify({
        backPath: `/sslm/evaluation-doc-manage/detail/${tplId}/${headerId}`,
        action: intl
          .get('sslm.supplierDocManage.view.action.evaluationPersonImport')
          .d('评分人导入'),
        args: JSON.stringify({
          evalHeaderId,
          tenantId,
          evalGranularity,
        }),
      }),
    });
  }

  /**
   * 指标维护
   * */
  @Bind()
  handleIndicatorMaintain() {
    const { evalHeaderId } = this.props;
    this.indicatorModal = ChoerodonModal.open({
      key: ChoerodonModal.key(),
      title: intl.get('sslm.supplierDocManage.view.button.indicatorMaintain').d('指标维护'),
      style: { width: 900 },
      closable: true,
      destroyOnClose: true,
      drawer: true,
      footer: null,
      afterClose: () => {
        this.handleSearch();
      },
      children: (
        <IndicatorMaintain
          onRef={ref => {
            this.indicatorMaintain = ref;
          }}
          evalHeaderId={evalHeaderId}
          modal={this.indicatorModal}
        />
      ),
    });
  }

  /**
   * 参评供应商导入按钮处理逻辑
   * */
  @Bind()
  supplierImport() {
    const {
      history,
      match: {
        params: { tplId, headerId },
      },
      basicInfo: { evalHeaderId, tenantId, evalGranularity },
    } = this.props;
    history.push({
      pathname: '/sslm/evaluation-doc-manage/comment-import/SSLM.BATCH_IMPORT_EVAL_SUP',
      search: queryString.stringify({
        backPath: `/sslm/evaluation-doc-manage/detail/${tplId}/${headerId}`,
        action: intl.get('sslm.supplierDocManage.view.action.supplierImport').d('参评供应商导入'),
        args: JSON.stringify({
          evalHeaderId,
          tenantId,
          evalGranularity,
        }),
      }),
    });
  }

  /**
   * 全选按钮处理逻辑
   */
  @Bind()
  handleSelectAll() {
    const { tabKey, rowKey, evalHeaderId, form } = this.props;
    const { selectAllFlag, selectedRows, selectedRowKeys } = this.state;
    if (tabKey === 'scoreDetail') {
      if (selectAllFlag === 0) {
        this.setState({ selectAllLoading: true });
        const { supplierIdList, indicatorIds, ...filterFormFields } = form.getFieldsValue() || {};
        const newSupplierIdList = isArray(supplierIdList)
          ? supplierIdList
          : supplierIdList
          ? supplierIdList.split(',')
          : supplierIdList;
        initialFetch({
          page: 0,
          size: 0,
          headerId: evalHeaderId,
          supplierIdList: newSupplierIdList,
          indicatorIds: indicatorIds ? indicatorIds.split(',') : null,
          ...filterFormFields,
        })
          .then(response => {
            const res = getResponse(response);
            if (res) {
              const allData = res.kpiEvalDetailLineDTOPage?.content || [];
              const newSelectedRows = selectedRows.concat(
                allData.filter(record => record.scoreType === 'MANUAL')
              );
              const newSelectedRowKeys = selectedRowKeys.concat(
                newSelectedRows.map(record => record[rowKey])
              );
              this.setState({
                selectAllFlag: 1,
                selectedRows: uniqBy(newSelectedRows, rowKey), // 去重
                selectedRowKeys: uniq(newSelectedRowKeys), // 去重
                unChooseEvalDtlIds: [],
              });
            }
          })
          .finally(() => {
            this.setState({ selectAllLoading: false });
          });
      } else {
        this.setState({
          selectAllFlag: 0,
          selectedRows: [],
          selectedRowKeys: [],
          unChooseEvalDtlIds: [],
        });
      }
    }
  }

  /**
   * 获取导出参数
   */
  @Bind()
  handleParams() {
    const { form } = this.props;
    const { indicatorIds, supplierIdList, ...filterFormFields } = form?.getFieldsValue() || {};
    const newSupplierIdList = isArray(supplierIdList)
      ? supplierIdList
      : supplierIdList
      ? supplierIdList.split(',')
      : supplierIdList;
    const filterValues = isUndefined(form)
      ? {}
      : filterNullValueObject({
          indicatorIds: indicatorIds ? indicatorIds.split(',') : null,
          supplierIdList: newSupplierIdList,
          ...filterFormFields,
        });
    return filterNullValueObject({
      ...filterValues,
    });
  }

  render() {
    const {
      isPub,
      isEdit,
      basicForm,
      tableData = [],
      loading,
      pagination,
      tabKey,
      granularity,
      evaluationDocManage: { code },
      docStatus,
      rowKey,
      basicInfo: { checkDetailFlag = false, tenantId, evalGranularity, checkLevelFlag } = {},
      saveCoreDetailLoading,
      saveScoreSumLoading,
      queryEvalTplScopeSupplierListLoading,
      saveEvalTplScopeSupplierListLoading,
      deleteEvalTplScopeSupplierListLoading,
      evalHeaderId,
      customizeTable,
      customizeFilterForm = () => {},
      custLoading = false,
      queryAllSupplierLoading,
      clearProperties,
      indicatorVisableFlag = false,
      isBdkpiEvalFlag = false,
      docManageRemote,
      basicInfo,
      customizeBtnGroup,
    } = this.props;

    const {
      selectedRowKeys,
      selectedRows,
      scoreVendorModalVisible,
      categoriesModalVisible,
      activeRows,
      selectAllFlag,
      selectAllLoading,
    } = this.state;

    const showSaveDetailButton =
      (checkDetailFlag || checkLevelFlag) &&
      (docStatus === 'FINAL_COLLECTED' || docStatus === 'REJECTED');
    const showCollectButton = docStatus === 'FINAL_COLLECTED' || docStatus === 'REJECTED';
    // 欧瑞康src-26776二开埋点
    const showImportAndBatchButton = docManageRemote
      ? docManageRemote.process(
          'SSLM.EVALUATION_DOC_MANAGE_DETAIL_SCOREDETAIL_BUTTON',
          ['NEW_REJECTED', 'NEW'].includes(docStatus),
          { basicInfo }
        )
      : ['NEW_REJECTED', 'NEW'].includes(docStatus);

    let flag = true;
    for (const value of tableData) {
      if (value._status) {
        flag = false;
        break;
      }
    }
    const button = [
      <Button
        data-name="delete"
        loading={deleteEvalTplScopeSupplierListLoading}
        disabled={!selectedRowKeys.length || isBdkpiEvalFlag}
        onClick={this.handleScoreVendorDelete}
      >
        {intl.get('hzero.common.button.delete').d('删除')}
      </Button>,
      <Button
        data-name="save"
        loading={saveEvalTplScopeSupplierListLoading}
        disabled={flag || isBdkpiEvalFlag}
        onClick={this.handleScoreVendorSave}
      >
        {intl.get(`hzero.common.button.save`).d('保存')}
      </Button>,
      <Button
        data-name="add"
        type="primary"
        disabled={isBdkpiEvalFlag}
        onClick={this.handleScoreVendorAdd}
        loading={custLoading}
      >
        {intl.get('hzero.common.button.add').d('新增')}
      </Button>,
    ];
    const scoreVendorParams = {
      that: this,
    };
    const remoteButtons =
      docManageRemote &&
      docManageRemote.process(
        'SSLM.EVALUATION_DOC_MANAGE_SCORE_VENDOR_BTN',
        button,
        scoreVendorParams
      );
    const Buttons = remoteButtons || button;
    const buttonGroup = showImportAndBatchButton ? Buttons : [];
    // 参评供应商button
    const scoreVendorButtons = [
      <ExcelExportPro
        data-name="scoreVendorExportPro"
        allBody
        method="POST"
        queryParams={this.handleParams()}
        requestUrl={`${SRM_SSLM}/v1/${organizationId}/eval-headers/eval-suppliers-dis/${evalHeaderId}/new-export`}
        templateCode="SRM_C_SRM_SSLM_KPI_EVAL_HEADER_SUPPLIER_SCOPE_EXPORT"
        buttonText={intl.get('hzero.common.button.newExport').d('(新)导出')}
        otherButtonProps={{
          permissionList: [
            {
              code: 'srm.partner.evaluation-manage.eval-doc.button.supplier-scope.export',
              type: 'button',
              meaning: '考评档案管理-参评供应商-新导出',
            },
          ],
        }}
      />,
      <PerButton
        data-name="import"
        onClick={this.supplierImport}
        disabled={isBdkpiEvalFlag}
        hidden={!showImportAndBatchButton}
        permissionList={[
          {
            code: `srm.partner.evaluation-manage.eval-doc.ps.eval.sup.import.old`,
            type: 'button',
            meaning: '参评供应商-导入',
          },
        ]}
      >
        {intl.get('hzero.common.button.import').d('导入')}
      </PerButton>,
      <CommonImport
        data-name="commonImport"
        businessObjectTemplateCode="SSLM.BATCH_IMPORT_EVAL_SUP"
        prefixPatch={SRM_SSLM}
        refreshButton
        buttonText={intl.get('hzero.common.button.newImport').d('(新)导入')}
        buttonProps={{
          icon: '',
          type: 'h0',
          style: { marginRight: 8 },
          hidden: !showImportAndBatchButton,
          permissionList: [
            {
              code: 'srm.partner.evaluation-manage.eval-doc.ps.eval.sup.import.model',
              type: 'button',
              meaning: '参评供应商-导入',
            },
          ],
          disabled: isBdkpiEvalFlag,
        }}
        args={{ evalHeaderId, tenantId, evalGranularity, createPage: 'EVAL' }}
        successCallBack={() => {
          const { handleRefresh } = this.props;
          handleRefresh();
        }}
      />,
      ...buttonGroup,
    ];
    const canShow = tabKey === 'scoreVendor';
    const isScoreDetail =
      tabKey === 'scoreDetail' &&
      (docStatus === 'FINAL_COLLECTED' ||
        docStatus === 'REJECTED' ||
        docStatus === 'NEW' ||
        docStatus === 'NEW_REJECTED') &&
      !isPub &&
      isEdit;
    const isScoreSum =
      tabKey === 'scoreSum' &&
      [
        'FINAL_COLLECTED',
        'REJECTED',
        'APPROVING',
        'COMPLETED',
        'PUBLISHED',
        'PARTIAL_PUBLISHED',
        'APPEALING',
        'SUPPLIER_CONFIRMED',
      ].includes(docStatus) &&
      !isPub &&
      isEdit;
    const rowSelection = {
      selectedRowKeys,
      selectedRows,
      onChange: this.handleSelectChange,
    };
    const editTableProp = {
      loading,
      pagination,
      bordered: true,
      rowKey,
      dataSource: tableData,
      columns: this.getColumns(),
      scroll: this.getScrollX(this.getColumns()),
      onChange: (page, filters, sorter) => this.handleSearch(page, false, sorter),
    };
    const remoteRowSelectionFlag = docManageRemote
      ? docManageRemote.process(
          'SSLM.EVALUATION_DOC_MANAGE_DETAIL_SCORE_VENDOR_TABLE_ROW_SELECTION_FLAG',
          false,
          { _this: this }
        )
      : false;
    if (
      (canShow && ['NEW_REJECTED', 'NEW'].includes(docStatus) && !isPub && isEdit) ||
      remoteRowSelectionFlag
    ) {
      // 参评供应商
      editTableProp.rowSelection = rowSelection;
    } else if (isScoreDetail) {
      editTableProp.rowSelection = {
        // 评分明细
        ...rowSelection,
        // 仅手工评分可勾选
        getCheckboxProps: record => ({
          disabled: record.scoreType !== 'MANUAL',
        }),
      };
    } else if (isScoreSum) {
      // 汇总评分
      editTableProp.rowSelection = rowSelection;
    } else if (docStatus === 'REJECTED') {
      editTableProp.rowSelection = rowSelection;
    } else {
      delete editTableProp.rowSelection;
    }
    const suppliersProps = {
      basicForm,
      tableData,
      granularity,
      ref: this.suppliers,
      fetchList: this.fetchEvalTplScopeSupplierList,
      loading: queryEvalTplScopeSupplierListLoading,
      lifeCycleStageCode: code['SSLM.LIFE_CYCLE_STAGE'],
      customizeTable,
      customizeFilterForm,
      clearProperties,
      docManageRemote,
      basicInfo,
    };

    const categoriesProps = {
      isPub,
      granularity,
      docStatus,
      visible: categoriesModalVisible,
      onOk: this.handleCategoriesModalOk,
      onCancel: this.handleCategoriesModalCancel,
      width: 750,
      fetchList: this.handleFetchEvalTplScopeCategoryList,
      activeRows,
      onRef: node => {
        this.categoriesNode = node;
      },
    };

    // 评分汇总埋点参数
    const scoreSumBtnProps = {
      basicInfo,
    };
    // const isDisabled = docStatus === 'FINAL_COLLECTED';
    return (
      <Fragment>
        <div className="detail-quick-location">
          {this.getSearchForm()}
          {tabKey === 'scoreDetail' && !isPub && isEdit ? (
            <div className={styles['scoreDetail-list-btn']}>
              <div>
                {docStatus === 'FINAL_COLLECTED' ||
                docStatus === 'REJECTED' ||
                docStatus === 'NEW_REJECTED' ||
                docStatus === 'NEW' ? (
                  <ChoerodonButton
                    funcType="flat"
                    loading={selectAllLoading}
                    color="primary"
                    onClick={this.handleSelectAll}
                  >
                    {selectAllFlag === 0
                      ? intl.get('hzero.common.button.selectAll').d('全选')
                      : intl.get('sslm.supplierDocManage.view.button.unSelectAll').d('取消全选')}
                  </ChoerodonButton>
                ) : null}
              </div>
              <div className={styles['table-list-btn']}>
                <ExcelExportPro
                  data-name="scoreDetailExportPro"
                  allBody
                  method="POST"
                  requestUrl={`${SRM_SSLM}/v1/${organizationId}/eval-dtl-resps/${evalHeaderId}/export`}
                  queryParams={this.handleParams()}
                  templateCode="SRM_C_SRM_SSLM_KPI_EVAL_HEADER_DTL_RESP_EXPORT"
                  buttonText={intl
                    .get('sslm.supplierDocManage.view.action.evaluationPersonExport')
                    .d('新评分人导出')}
                  otherButtonProps={{
                    type: 'h0',
                    funcType: 'flat',
                    icon: 'unarchive',
                  }}
                />
                {showImportAndBatchButton ? (
                  <>
                    <PerButton
                      onClick={this.handleEvaluationPersonImport}
                      permissionList={[
                        {
                          code: `srm.partner.evaluation-manage.eval-doc.ps.eval.user.import.old`,
                          type: 'button',
                          meaning: '评分明细-评分人导入',
                        },
                      ]}
                    >
                      {intl
                        .get('sslm.supplierDocManage.view.action.evaluationPersonImport')
                        .d('评分人导入')}
                    </PerButton>
                    <CommonImport
                      data-name="commonImport"
                      businessObjectTemplateCode="SSLM.BATCH_IMPORT_EVAL_USER"
                      prefixPatch={SRM_SSLM}
                      refreshButton
                      buttonText={intl
                        .get('sslm.supplierDocManage.view.action.newEvaluationPersonImport')
                        .d('(新)评分人导入')}
                      buttonProps={{
                        icon: '',
                        type: 'h0',
                        permissionList: [
                          {
                            code:
                              'srm.partner.evaluation-manage.eval-doc.ps.eval.user.import.model',
                            type: 'button',
                            meaning: '评分明细-评分人导入',
                          },
                        ],
                      }}
                      args={{ evalHeaderId, tenantId, evalGranularity }}
                      successCallBack={() => {
                        this.handleSearch();
                      }}
                    />
                  </>
                ) : null}
                {showSaveDetailButton ? (
                  <Button
                    type="primary"
                    loading={saveCoreDetailLoading}
                    onClick={this.handleScoreDetailSave}
                  >
                    {intl.get(`hzero.common.button.save`).d('保存')}
                  </Button>
                ) : null}
                {showImportAndBatchButton ? (
                  <Button
                    onClick={this.handleBatchMaintenanceRaters}
                    disabled={selectedRowKeys.length === 0}
                  >
                    {intl
                      .get('sslm.supplierDocManage.view.button.batchMaintenanceRaters')
                      .d('批量维护评分人')}
                  </Button>
                ) : null}
                {['NEW_REJECTED', 'NEW'].includes(docStatus) && indicatorVisableFlag ? (
                  <PerButton
                    disabled={isBdkpiEvalFlag}
                    onClick={this.handleIndicatorMaintain}
                    permissionList={[
                      {
                        code: `srm.partner.evaluation-manage.eval-doc.api.indicator`,
                        type: 'button',
                        meaning: '评分明细-指标维护',
                      },
                    ]}
                  >
                    {intl.get('sslm.supplierDocManage.view.button.indicatorMaintain').d('指标维护')}
                  </PerButton>
                ) : null}
              </div>
            </div>
          ) : null}
          {tabKey === 'scoreSum' && !isPub && isEdit ? (
            <div className={styles['table-list-btn']}>
              {/* 欧瑞康src-26776二开埋点 */}
              {docManageRemote ? (
                docManageRemote.render(
                  'SSLM.EVALUATION_DOC_MANAGE_DETAIL_SCORE_SUM_IMPORT_OLD',
                  <PerButton
                    onClick={this.handleScoreSumImport}
                    disabled={!showCollectButton}
                    permissionList={[
                      {
                        code: `srm.partner.evaluation-manage.eval-doc.ps.eval.calc.import.old`,
                        type: 'button',
                        meaning: '评分汇总-导入',
                      },
                    ]}
                  >
                    {intl.get('hzero.common.button.import').d('导入')}
                  </PerButton>,
                  {
                    basicInfo,
                  }
                )
              ) : (
                <PerButton
                  onClick={this.handleScoreSumImport}
                  disabled={!showCollectButton}
                  permissionList={[
                    {
                      code: `srm.partner.evaluation-manage.eval-doc.ps.eval.calc.import.old`,
                      type: 'button',
                      meaning: '评分汇总-导入',
                    },
                  ]}
                >
                  {intl.get('hzero.common.button.import').d('导入')}
                </PerButton>
              )}
              <ExcelExport
                requestUrl={`${SRM_SSLM}/v1/${organizationId}/eval-headers/eval-lines/${evalHeaderId}/export`}
                otherButtonProps={{
                  icon: '',
                  permissionList: [
                    {
                      code: 'srm.partner.evaluation-manage.eval-doc.button.sum.export.old',
                      type: 'button',
                      meaning: '考评档案管理-评分汇总导出按钮(旧)',
                    },
                  ],
                }}
              />
              {/* 欧瑞康src-26776二开埋点 */}
              {docManageRemote ? (
                docManageRemote.render(
                  'SSLM.EVALUATION_DOC_MANAGE_DETAIL_SCORE_SUM_IMPORT_NEW',
                  <CommonImport
                    data-name="commonImport"
                    businessObjectTemplateCode="SSLM.KPI_CALC"
                    prefixPatch={SRM_SSLM}
                    refreshButton
                    buttonText={intl.get('hzero.common.button.newImport').d('(新)导入')}
                    buttonProps={{
                      icon: '',
                      type: 'h0',
                      disabled: !showCollectButton,
                      permissionList: [
                        {
                          code: 'srm.partner.evaluation-manage.eval-doc.ps.eval.calc.import.model',
                          type: 'button',
                          meaning: '评分汇总-导入',
                        },
                      ],
                    }}
                    args={{ evalHeaderId, tenantId, evalGranularity }}
                    successCallBack={() => {
                      const { handleRefresh } = this.props;
                      handleRefresh();
                    }}
                  />,
                  {
                    basicInfo,
                  }
                )
              ) : (
                <CommonImport
                  data-name="commonImport"
                  businessObjectTemplateCode="SSLM.KPI_CALC"
                  prefixPatch={SRM_SSLM}
                  refreshButton
                  buttonText={intl.get('hzero.common.button.newImport').d('(新)导入')}
                  buttonProps={{
                    icon: '',
                    type: 'h0',
                    disabled: !showCollectButton,
                    permissionList: [
                      {
                        code: 'srm.partner.evaluation-manage.eval-doc.ps.eval.calc.import.model',
                        type: 'button',
                        meaning: '评分汇总-导入',
                      },
                    ],
                  }}
                  args={{ evalHeaderId, tenantId, evalGranularity }}
                  successCallBack={() => {
                    const { handleRefresh } = this.props;
                    handleRefresh();
                  }}
                />
              )}
              <ExcelExportPro
                requestUrl={`${SRM_SSLM}/v1/${organizationId}/eval-headers/eval-lines/${evalHeaderId}/new-export`}
                templateCode="SRM_C_SRM_SSLM_KPI_EVAL_HEADER_SUM_EXPORT"
                buttonText={intl.get('hzero.common.button.newExport').d('(新)导出')}
                otherButtonProps={{
                  permissionList: [
                    {
                      code: 'srm.partner.evaluation-manage.eval-doc.button.sum.export',
                      type: 'button',
                      meaning: '考评档案管理-评分汇总-新导出',
                    },
                  ],
                }}
              />
              {/* 欧瑞康src-26776二开埋点 */}
              {showCollectButton ? (
                docManageRemote ? (
                  docManageRemote.render(
                    'SSLM.EVALUATION_DOC_MANAGE_DETAIL_SCORE_SUM_SAVE',
                    <Button
                      type="primary"
                      loading={saveScoreSumLoading}
                      onClick={this.handleScoreSumSave}
                    >
                      {intl.get(`hzero.common.button.save`).d('保存')}
                    </Button>,
                    { basicInfo }
                  )
                ) : (
                  <Button
                    type="primary"
                    loading={saveScoreSumLoading}
                    onClick={this.handleScoreSumSave}
                  >
                    {intl.get(`hzero.common.button.save`).d('保存')}
                  </Button>
                )
              ) : null}
              {docManageRemote &&
                docManageRemote.render(
                  'SSLM.EVALUATION_DOC_MANAGE_DETAIL_SCORE_SUM_BTN_RENDER',
                  <></>,
                  scoreSumBtnProps
                )}
            </div>
          ) : null}
          {tabKey === 'scoreVendor' && !isPub && isEdit ? (
            <div className={styles['table-list-btn']}>
              {customizeBtnGroup(
                {
                  code: 'SSLM.EVALUATION_DOC_MANAGE_DETAIL.SCOREVENDOR_BTN',
                },
                [...scoreVendorButtons]
              )}
            </div>
          ) : null}
          {docManageRemote
            ? docManageRemote.process('SSLM.EVALUATION_DOC_MANAGE_DETAIL_TABLE_BTNS', null, {
                _this: this,
              })
            : null}
        </div>
        {customizeTable({ code: customizeCodeObj[tabKey] }, <EditTable {...editTableProp} />)}
        <Drawer
          closable
          maskClosable
          destroyOnClose
          title={intl.get(`sslm.supplierDocManage.view.title.addSupplier`).d('添加供应商')}
          visible={scoreVendorModalVisible}
          onClose={this.handleScoreVendorModalCancel}
          width={750}
        >
          <AddSupplierModal {...suppliersProps} />
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              width: '100%',
              borderTop: '1px solid #e8e8e8',
              padding: '10px 16px',
              textAlign: 'right',
              left: 0,
              background: '#fff',
              borderRadius: '0 0 4px 4px',
            }}
          >
            <Button
              style={{
                marginRight: 8,
              }}
              onClick={this.handleScoreVendorModalCancel}
            >
              {intl.get('hzero.common.view.button.cancel').d('取消')}
            </Button>
            {!isPub && isEdit && (
              <Button
                onClick={this.handleScoreVendorModalOk}
                type="primary"
                loading={queryAllSupplierLoading || false}
              >
                {intl.get('hzero.common.button.sure').d('确定')}
              </Button>
            )}
          </div>
        </Drawer>
        {categoriesModalVisible && <Categories {...categoriesProps} />}
      </Fragment>
    );
  }
}
