/**
 * Detail - 考评档案填制详情
 * @date: 2019-01-02
 * @author: lixiaolong <xiaolong.li02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import queryString from 'querystring';
import { isUndefined, uniqBy, uniq, difference, isEmpty, isFunction, isArray } from 'lodash';
import { Row, Col, Button, Spin, Collapse, Icon, Form, Modal, Tooltip } from 'hzero-ui';
import { Button as ChoerodonButton } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { routerRedux } from 'dva/router';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import intl from 'utils/intl';
import remote from 'utils/remote';
import { SRM_SSLM } from '_utils/config';
import { dateRender, dateTimeRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import LovMulti from 'srm-front-cuz/lib/components/Customize/LovMulti/index';
import { getComponentsThemeColor } from 'hzero-front/lib/layouts/NewLayout/utils';
import { filterNullValueObject, getCurrentOrganizationId, getEditTableData } from 'utils/utils';
import { Header, Content } from 'components/Page';
import ExcelExport from 'components/ExcelExport';
import CommonImport from 'components/Import';
import { Button as PerButton } from 'components/Permission';
import notification from 'utils/notification.js';
import ExcelExportPro from 'components/ExcelExportPro';
import AttachmentModal from './AttachmentModal';
import TransmitModal from './TransmitModal'; // 转交弹框

import List from './List.js';
import Search from './Search.js';
import styles from './index.less';
import OperationLogModals from './OperationLogModals.js';

// 使用 Collapse.Panel 组件
const { Panel } = Collapse;

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
/**
 * @export
 * @class Detail
 * @extends {Component} - React.Component
 * @reactProps {Object} EvaluationArchivesFilling - 数据源
 * @reactProps {!Boolean} detailLoading - 查询详情页面数据
 * @reactProps {!Boolean} detailListLoading - 查询Modal数据
 * @reactProps {Object} pagination - 分页器
 * @reactProps {Function} [dispatch= e => e] -redux dispatch方法
 * @reactProps {boolean} activityLogLoading - 加载操作记录 modal 中 table 数据
 * @returns React.element
 */

const organizationId = getCurrentOrganizationId();

const defaultActiveKey = ['queryDetailKey'];

// @withRouter
@Form.create()
@formatterCollections({
  code: ['sslm.common', 'sslm.supplierDocManage', 'sslm.operatingRecord'],
})
@withCustomize({
  unitCode: [
    'SSLM.ARCHIVE_FILLING_DETAIL.LIST_NEW',
    'SSLM.ARCHIVE_FILLING_DETAIL.FILLING_DETAIL',
    'SSLM.ARCHIVE_FILLING_DETAIL.FILLING_SEARCH_FORM',
    'SSLM.ARCHIVE_FILLING_DETAIL.BTNS',
    'SSLM.ARCHIVE_FILLING_DETAIL.COLLAPSE',
  ],
})
@connect(({ evaluationArchivesFilling, loading, user = {} }) => {
  const { currentUser: { themeConfigVO = {} } = {} } = user;
  const {
    enableThemeConfig, // 是否开启了新主题
    colorCode, // 主题色
    fontFileId,
    componentColorList, // 组件主题列表
  } = themeConfigVO;
  let themeConfig = {};
  if (enableThemeConfig) {
    const componentsColor = getComponentsThemeColor(componentColorList, colorCode);
    themeConfig = {
      primaryColor: colorCode,
      linkColor: componentsColor['link-color'],
      anchorColor: componentsColor['anchor-primary-color'],
      fontFamily: `font-${fontFileId}`, // 字体
    };
  }
  return {
    evaluationArchivesFilling,
    user,
    allLoading:
      loading.effects['evaluationArchivesFilling/fetchDetailData'] ||
      loading.effects['evaluationArchivesFilling/saveScore'] ||
      loading.effects['evaluationArchivesFilling/submitScore'] ||
      loading.effects['evaluationArchivesFilling/handleGiveUpScore'] ||
      loading.effects['evaluationArchivesFilling/weightSameJudge'] ||
      loading.effects['evaluationArchivesFilling/transmitScorer'],
    activityLogLoading: loading.effects['evaluationArchivesFilling/fetchActivityLog'],
    tenantId: getCurrentOrganizationId(),
    ...themeConfig,
  };
})
@remote(
  {
    code: 'SSLM_EVALUATION_FILLING_DETAIL',
    name: 'fillingDetailRemote',
  },
  {
    events: {
      cuxHandleVetoChange() {},
      cuxHandleFinalScoreChange() {},
    },
  }
)
export default class Detail extends Component {
  form;

  constructor(props) {
    super(props);
    const routerParam = queryString.parse(this.props.location.search.substr(1));
    const { submitUserId = '', pageReadOnly = 0 } = routerParam;
    const isPub = this.props.match.path.includes('/pub/');
    this.state = {
      pageReadOnly: !!Number(pageReadOnly), // 角色工作台跳转,需要设置页面只读
      submitUserId,
      operationVisible: false,
      modalCode: null,
      collapsed: true,
      modalVisible: false,
      selectAllFlag: false,
      weightSameFlag: true, // 判断权重是否一致
      selectedRows: [],
      selectedRowKeys: [],
      unChooseEvalDtlIds: [],
      isPub,
      transmitVisible: false,
      activeKey: defaultActiveKey,
    };
  }

  componentDidMount() {
    this.handleSearch();
  }

  @Bind()
  handSuccessCallBack() {
    const { dispatch } = this.props;
    // 导入后先清空行数据，再查询一遍数据，避免导入数据不事实刷新问题
    dispatch({
      type: 'evaluationArchivesFilling/updateState',
      payload: {
        detailLines: [],
      },
    });
    this.handleSearch();
  }

  /**
   * 请求复合查询条件的数据
   * @param {Function} dispatch - redux dispatch 方法
   * @param {?string} fields.vendor - 供应商
   * @param {?string} fields.product - 采购品类
   * @param {?string} fields.evaluation - 考评指标
   */
  @Bind()
  handleSearch(page = { pageSize: 100 }) {
    const {
      tenantId,
      dispatch,
      match: { params = {} },
    } = this.props;
    const {
      selectedRows,
      selectedRowKeys,
      selectAllFlag,
      unChooseEvalDtlIds,
      submitUserId,
      isPub,
    } = this.state;
    const rowKey = 'evalDtlId';
    let filterValues = {};
    if (!isUndefined(this.form)) {
      const formValue = this.form.getFieldsValue();
      filterValues = filterNullValueObject(formValue);
    }
    dispatch({
      type: 'evaluationArchivesFilling/fetchDetailData',
      payload: {
        tenantId,
        ...filterValues,
        page,
        pageEntryPoint: 'CUSTOMER_OWNED',
        evalHeaderId: isPub ? params.evalHeaderId : params.id,
        submitUserId: isPub ? submitUserId : '',
        code: isPub ? 'COMPLETED' : '', // 用于后端区分入口是已填制还是填制(工作流页面是已填制状态)
        customizeUnitCode:
          'SSLM.ARCHIVE_FILLING_DETAIL.FILLING_DETAIL,SSLM.ARCHIVE_FILLING_DETAIL.FILLING_SEARCH_FORM,SSLM.ARCHIVE_FILLING_DETAIL.LIST_NEW',
      },
    }).then(res => {
      if (res) {
        if (selectAllFlag) {
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
              record => unChooseEvalDtlIds.findIndex(i => i[rowKey] === record[rowKey]) === -1
            ),
            selectedRowKeys: difference(uniq(newSelectedRowKeys), unChooseEvalDtlIds),
          });
        }
      }
    });
  }

  /**
   * 明细表格折叠和展开
   * @memberof Detail
   */
  @Bind()
  handleCollapse(keys) {
    this.setState({
      activeKey: keys,
      collapsed: keys.includes('queryDetailKey'),
    });
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
   * 保存、提交单元格编辑数据
   * cb ----保存成功回调 主要用评分信息翻页时，调用保存新数据再进行翻页
   */
  @Bind()
  handleScore(isSave = true, cb) {
    const {
      evaluationArchivesFilling: { detailData, detailLines, detailLinePage },
      form: { validateFields },
      dispatch,
      tenantId,
    } = this.props;
    // const kpiEvalDetailLineDTOList = getEditTableData(detailLines).map(detailLine => {
    //   const detailLineDTOList = { ...detailLine, isStandard: detailLine.isStandard ? 1 : 0 };
    //   return detailLineDTOList;
    // });
    const kpiEvalDetailLineDTOList = getEditTableData(detailLines);
    const type = `evaluationArchivesFilling/${isSave ? 'saveScore' : 'submitScore'}`;
    const message = isSave
      ? intl.get(`sslm.common.view.message.save.success`).d(`保存成功`)
      : intl.get(`sslm.common.view.message.submit.success`).d(`提交成功`);
    // const warnMessage = intl.get(`sslm.common.view.message.score.warn`).d(`得分超出范围`);

    if (kpiEvalDetailLineDTOList.length) {
      // const newList = kpiEvalDetailLineDTOList.filter(n => n.indicatorType === 'SCORE');
      // const isError =
      //   newList.filter(
      //     ({ finalScore, scoreFrom, scoreTo }) => finalScore < scoreFrom || finalScore > scoreTo
      //   ).length > 0;
      // if (isError) {
      //   notification.warning({ message: warnMessage });
      //   return;
      // }
      validateFields(err => {
        if (!err) {
          dispatch({
            type,
            payload: {
              ...detailData,
              kpiEvalDetailLineDTOPage: {
                ...detailData.kpiEvalDetailLineDTOPage,
                content: kpiEvalDetailLineDTOList,
              },
              tenantId,
              customizeUnitCode:
                'SSLM.ARCHIVE_FILLING_DETAIL.FILLING_DETAIL,SSLM.ARCHIVE_FILLING_DETAIL.LIST_NEW',
            },
          }).then(res => {
            if (res) {
              if (!isSave) {
                notification.success({ message });
                dispatch(routerRedux.push({ pathname: '/sslm/archive-filling/list' }));
              }
              // 有cb 说明是翻页保存成功 并且调用进行翻页
              if (isFunction(cb)) {
                cb();
              } else {
                // 没有cb 说明是保存成功 刷新页面
                notification.success({ message });
                this.handleSearch(detailLinePage);
                // 保存成功，重置评分行内置表单值，解决后端保存修改值后前端未正确显示问题
                detailLines.forEach(record => {
                  if (record.$form) {
                    record.$form.resetFields();
                  }
                });
              }
            }
          });
        }
      });
    }
  }

  /**
   *  考评档案填制批量导入
   */
  @Bind()
  handleImport() {
    const {
      match: {
        params: { id },
      },
    } = this.props;
    this.props.history.push({
      pathname: `/sslm/archive-filling/comment-import/SSLM.BATCH_IMPORT_EVAL_LINE`,
      search: queryString.stringify({
        backPath: `/sslm/archive-filling/detail/${id}`,
        action: intl.get('hzero.common.title.batchImport').d('批量导入'),
        args: JSON.stringify({
          evalHeaderId: id,
        }),
      }),
    });
  }

  // /**
  //  * 符合评分标准checkbox
  //  */
  // @Bind()
  // standardChange(record, flag) {
  //   const {
  //     dispatch,
  //     evaluationArchivesFilling: { detailLines },
  //   } = this.props;
  //   const newDetailLines = [...detailLines].map(detailLine =>
  //     detailLine.evalDtlId === record.evalDtlId
  //       ? {
  //         ...detailLine,
  //         isStandard: flag ? 1 : 0,
  //       }
  //       : detailLine
  //   );
  //   dispatch({
  //     type: 'evaluationArchivesFilling/updateState',
  //     payload: {
  //       detailLines: newDetailLines,
  //     },
  //   });
  // }

  /**
   * 附件上传modal框
   */
  @Bind()
  handleAttachmentModal() {
    const { modalVisible } = this.state;
    this.setState({ modalVisible: !modalVisible });
  }

  /**
   * 放弃评分调用
   */
  @Bind()
  handleGiveUpScore() {
    const { selectedRowKeys, selectedRows, selectAllFlag, unChooseEvalDtlIds = [] } = this.state;
    const {
      dispatch,
      evaluationArchivesFilling: { detailData },
      tenantId,
    } = this.props;
    let params = {};
    const formValue = this.form.getFieldsValue();
    params = filterNullValueObject(formValue);

    if (isEmpty(selectedRowKeys)) {
      Modal.warning({
        title: intl.get('hzero.common.validation.atLeast').d('请至少选择一条数据'),
      });
    } else {
      dispatch({
        type: 'evaluationArchivesFilling/handleGiveUpScore',
        payload: {
          evalHeaderId: detailData.evalHeaderId,
          body: {
            kpiEvalDetailLineDTOS: selectedRows,
            selectAllFlag: selectAllFlag ? 1 : 0,
            unKpiEvalDetailLineDTOS: unChooseEvalDtlIds,
            ...filterNullValueObject(params),
            tenantId,
          },
        },
      }).then(res => {
        if (res) {
          this.setState({
            selectedRowKeys: [],
            selectedRows: [],
            selectAllFlag: false,
            unChooseEvalDtlIds: [],
          });
          notification.success();
          this.handleSearch();
        }
      });
    }
  }

  /**
   * handleSelectChange - 选择列表行
   * @param {object[]} selectedRows - 已选择的行
   */
  @Bind()
  handleSelectChange(selectedRowKeys, selectedRows) {
    const {
      evaluationArchivesFilling: { detailLines },
    } = this.props;
    const { unChooseEvalDtlIds, selectAllFlag } = this.state;
    if (selectAllFlag) {
      const Data = detailLines;
      // 处理全选之后取消勾选之后再次勾选
      const filterUnChooseEvalDtlIds = unChooseEvalDtlIds.filter(
        item => !selectedRows.includes(item)
      );
      // 获取当前页取消勾选的数据
      const newUnChooseEvalDtlIds = filterUnChooseEvalDtlIds.concat(difference(Data, selectedRows));
      this.setState({
        unChooseEvalDtlIds: uniq(newUnChooseEvalDtlIds),
      });
    }
    this.setState({
      selectedRows,
      selectedRowKeys,
    });
  }

  /**
   * 全选按钮处理逻辑
   */
  @Bind()
  handleSelectAll() {
    const {
      rowKey = 'evalDtlId',
      evaluationArchivesFilling: { detailLines },
    } = this.props;
    const { selectAllFlag, selectedRows, selectedRowKeys } = this.state;
    // todo: isArray(detailLines) 解决端侧报filter of undefined问题，未复现
    const newSelectedRows = !selectAllFlag
      ? selectedRows.concat(
          isArray(detailLines) ? detailLines.filter(i => i.completeFlag !== 4) : []
        )
      : [];
    const newSelectedRowKeys = !selectAllFlag
      ? selectedRowKeys.concat(newSelectedRows.map(record => record[rowKey]))
      : [];
    this.setState({
      selectAllFlag: !selectAllFlag,
      selectedRows: uniqBy(newSelectedRows, rowKey), // 去重
      selectedRowKeys: uniq(newSelectedRowKeys), // 去重
      unChooseEvalDtlIds: [],
    });
  }

  // 转交
  @Bind()
  handleTransmit() {
    const { transmitVisible, selectAllFlag, selectedRowKeys, unChooseEvalDtlIds } = this.state;
    const {
      dispatch,
      evaluationArchivesFilling: { detailData },
    } = this.props;
    const { averageFlag, evalHeaderId } = detailData;
    if (!transmitVisible && !averageFlag) {
      // 非权重式计算
      dispatch({
        type: 'evaluationArchivesFilling/weightSameJudge',
        payload: {
          evalHeaderId,
          selectAllFlag: selectAllFlag ? 1 : 0,
          evalDtlIds: selectedRowKeys,
          unChooseEvalDtlIds: unChooseEvalDtlIds.map(n => n.evalDtlId),
        },
      }).then(res => {
        if ([false, true].includes(res)) {
          this.setState({ transmitVisible: !transmitVisible, weightSameFlag: res });
        }
      });
      return;
    }
    this.setState({ transmitVisible: !transmitVisible });
  }

  // 转交弹框确认回调
  @Bind()
  handleTransmitScorer(kpiEvalDtlRespList) {
    const { selectAllFlag, selectedRowKeys, unChooseEvalDtlIds } = this.state;
    const {
      dispatch,
      evaluationArchivesFilling: { detailData },
    } = this.props;
    dispatch({
      type: 'evaluationArchivesFilling/transmitScorer',
      payload: {
        evalHeaderId: detailData.evalHeaderId,
        selectAllFlag: selectAllFlag ? 1 : 0,
        kpiEvalDtlRespList,
        evalDtlIds: selectAllFlag ? [] : selectedRowKeys,
        unChooseEvalDtlIds: unChooseEvalDtlIds.map(n => n.evalDtlId),
      },
    }).then(res => {
      if (res) {
        if (res.skipFlag) {
          // 评分行都转交出去时，返回列表页
          dispatch(routerRedux.push({ pathname: '/sslm/archive-filling/list' }));
        } else {
          this.handleSearch();
        }
        this.setState({
          selectedRows: [],
          selectedRowKeys: [],
          unChooseEvalDtlIds: [],
          transmitVisible: false,
        });
      }
    });
  }

  /**
   * 操作记录
   */
  @Bind()
  handleViewLog() {
    this.setState({
      operationVisible: true,
      modalCode: 'viewLog',
    });
  }

  /**
   * 加载 modal 数据
   * @param {string} code - 加载的 modal 标识
   * @param {?object} page - modal 的分页信息
   * @returns {object} [promise] - dispatch 之后得到的 promise 对象
   */
  @Bind()
  handleLoadModal(code = '', page = {}) {
    const {
      dispatch,
      match: { params = {} },
    } = this.props;
    const typeObj = {
      viewLog: 'evaluationArchivesFilling/fetchActivityLog',
    };
    const { isPub } = this.state;
    const dataObj = {
      viewLog: { headerId: isPub ? params.evalHeaderId : params.id },
    };
    const paramsObj = {
      viewLog: { sourceCode: 'FILLING' },
    };
    return dispatch({
      type: typeObj[code],
      payload: {
        page,
        ...dataObj[code],
        ...paramsObj[code],
      },
    });
  }

  /**
   * 关闭 modal
   */
  @Bind()
  handleCloseModal() {
    this.setState({
      operationVisible: false,
    });
  }

  // 获取导出参数
  @Bind()
  getQueryParams() {
    let params = {};
    if (!isUndefined(this.form)) {
      const formValue = this.form.getFieldsValue();
      params = filterNullValueObject(formValue);
    }
    return params;
  }

  render() {
    const {
      tenantId,
      allLoading,
      fillingDetailRemote,
      evaluationArchivesFilling: {
        detailData,
        detailLines,
        detailLinePage,
        granularity,
        modalData,
        modalPagination,
      },
      match: { params = {} },
      user,
      customizeTable,
      customizeForm,
      customizeCollapse,
      form,
      form: { getFieldDecorator },
      customizeFilterForm,
      custLoading,
      customizeBtnGroup,
      activityLogLoading,
      linkColor,
    } = this.props;
    const {
      operationVisible,
      modalCode,
      collapsed,
      modalVisible,
      selectedRows,
      selectAllFlag,
      transmitVisible,
      weightSameFlag,
      isPub,
      pageReadOnly,
      submitUserId,
      activeKey,
    } = this.state;

    // 评分状态：未评分、评分拒绝 可编辑
    const isEdit = ['UNSCORE', 'SCORE_REJECTED'].includes(detailData.scoreStatus) && !pageReadOnly;

    const rowSelection = {
      selectedRows,
      selectedRowKeys: selectedRows.map(n => n.evalDtlId),
      onChange: this.handleSelectChange,
      getCheckboxProps: record => ({
        disabled: record.completeFlag === 4, // Column configuration not to be checked
        name: record.completeFlag,
      }),
    };

    const tableProps = {
      customizeTable,
      fillingDetailRemote,
      pagination: detailLinePage,
      evalGranularity: detailData.evalGranularity,
      onChange: this.handleSearch,
      handleScore: this.handleScore,
      dataSource: detailLines,
      backReasonFlag: detailData.backReasonFlag,
      rowSelection,
      isEdit,
      // standardChange: this.standardChange,
    };
    const searchProps = {
      tenantId,
      evalGranularity: detailData.evalGranularity,
      evalHeaderId: isPub ? params.evalHeaderId : params.id,
      onRef: this.handleBindRef,
      onSearch: this.handleSearch,
      customizeFilterForm,
      custLoading,
      code: 'SSLM.ARCHIVE_FILLING_DETAIL.FILLING_SEARCH_FORM',
    };

    const evalHeaderId = isPub ? params.evalHeaderId : params.id;

    const attachmentModalProps = {
      evalHeaderId,
      uploadUserId: isPub ? submitUserId : user.currentUser.id,
      viewOnly: !isEdit,
      isVisible: modalVisible,
      onCancel: this.handleAttachmentModal,
      handleRefresh: () => this.handleSearch(),
    };

    const transmitModalProps = {
      visible: transmitVisible,
      averageFlag: detailData.averageFlag, // 是否平均式计算
      weightSameFlag, // 判断权重是否一致
      currentRespWeight: selectedRows.map(n => n.respWeight)[0], // 当前勾选行权重
      onClose: this.handleTransmit,
      onOk: this.handleTransmitScorer,
      onOkLoading: allLoading,
    };

    const modalProps = {
      granularity,
      evalHeaderId,
      visible: operationVisible,
      modalCode,
      modalData,
      modalPagination,
      onLoad: this.handleLoadModal,
      onClose: this.handleCloseModal,
      loading: activityLogLoading,
    };

    const showBtnFlag =
      !isPub && ['MANUAL_EVALUATING'].includes(detailData.evalStatus) && !pageReadOnly;

    const btnGroups = [
      showBtnFlag && (
        <Button
          icon="save"
          data-name="save"
          type="primary"
          loading={allLoading}
          onClick={() => this.handleScore(true)}
        >
          {intl.get(`hzero.common.button.save`).d('保存')}
        </Button>
      ),
      showBtnFlag && (
        <Button
          icon="check"
          loading={allLoading}
          onClick={() => this.handleScore(false)}
          data-name="submit"
        >
          {intl.get(`hzero.common.button.submit`).d('提交')}
        </Button>
      ),
      showBtnFlag && (
        <Fragment data-name="transmit">
          <Tooltip
            title={intl
              .get('sslm.supplierDocManage.view.title.transmitMsg')
              .d('转交后将无法再对所转交的数据做评分操作')}
          >
            <Button
              icon="retweet"
              data-name="transmit"
              name="transmit"
              loading={allLoading}
              disabled={isEmpty(selectedRows)}
              onClick={this.handleTransmit}
            >
              {intl.get('sslm.common.button.transmit').d('转交')}
            </Button>
          </Tooltip>
        </Fragment>
      ),
      showBtnFlag && (
        <Button
          icon="arrow-left"
          data-name="giveUpScore"
          loading={allLoading}
          onClick={this.handleGiveUpScore}
          style={{ display: detailData.abandonFlag ? 'block' : 'none' }}
        >
          {intl.get(`sslm.common.view.button.giveUpScore`).d('放弃评分')}
        </Button>
      ),
      showBtnFlag && (
        <CommonImport
          data-name="commonImport"
          businessObjectTemplateCode="SSLM.BATCH_IMPORT_EVAL_LINE"
          prefixPatch={SRM_SSLM}
          refreshButton
          buttonText={intl.get('hzero.common.button.newImport').d('(新)导入')}
          args={{ evalHeaderId }}
          successCallBack={() => {
            this.handSuccessCallBack();
          }}
          buttonProps={{
            permissionList: [
              {
                code: 'srm.partner.evaluation-manage.archive-filling.ps.eval.dtl.import.model',
                type: 'button',
                meaning: '考评档案填制明细-导入',
              },
            ],
          }}
        />
      ),
      showBtnFlag && (
        <PerButton
          icon="archive"
          type="c7n-pro"
          data-name="import"
          onClick={this.handleImport}
          permissionList={[
            {
              code: `srm.partner.evaluation-manage.archive-filling.ps.eval.dtl.import.old`,
              type: 'button',
              meaning: '考评档案填制明细-导入',
            },
          ]}
        >
          {intl.get('hzero.common.button.import').d('导入')}
        </PerButton>
      ),
      <ExcelExport
        defaultSelectAll
        data-name="export"
        queryParams={() => this.getQueryParams()}
        queryFormItem={
          <span style={{ color: 'red', float: 'right', marginRight: 200 }}>
            {intl
              .get(`sslm.common.view.message.excelExport.warn`)
              .d('（请务必勾选全部的列后导出）')}
          </span>
        }
        otherButtonProps={{
          icon: 'unarchive',
          type: 'c7n-pro',
          permissionList: [
            {
              code: 'srm.partner.evaluation-manage.archive-filling.button.filling.export',
              type: 'button',
              meaning: '考评档案填制-导出',
            },
          ],
        }}
        requestUrl={`${SRM_SSLM}/v1/${organizationId}/eval-headers/evaluation/${evalHeaderId}/detail`}
      />,
      <ExcelExportPro
        data-name="newExport"
        // allBody
        queryParams={() => this.getQueryParams()}
        requestUrl={`${SRM_SSLM}/v1/${organizationId}/eval-headers/evaluation/${evalHeaderId}/detail/new-export`}
        templateCode="SRM_C_SRM_SSLM_KPI_EVAL_HEADER_LINE_EXPORT"
        buttonText={intl.get('hzero.common.button.newExport').d('(新)导出')}
        otherButtonProps={{
          type: 'c7n-pro',
          icon: 'unarchive',
          permissionList: [
            {
              code: 'srm.partner.evaluation-manage.archive-filling.button.filling.export.new',
              type: 'button',
              meaning: '考评档案填制-新导出',
            },
          ],
        }}
      />,
      <Button
        data-name="operationRecords"
        icon="clock-circle-o"
        loading={allLoading}
        onClick={() => this.handleViewLog()}
      >
        {intl.get(`sslm.common.button.operationRecords`).d('操作记录')}
      </Button>,
    ];
    const buttons = fillingDetailRemote
      ? fillingDetailRemote.process('SSLM_EVALUATION_FILLING_DETAIL_HEADER_BUTTONS', btnGroups, {
          showBtnFlag,
          evalHeaderId,
          successCallBack: this.handSuccessCallBack,
        })
      : btnGroups;

    return (
      <Fragment>
        <Header
          title={intl.get(`sslm.common.view.title.archiveFilling`).d('考评档案填制')}
          backPath={isPub ? '' : '/sslm/archive-filling/list'}
        >
          {customizeBtnGroup(
            {
              code: 'SSLM.ARCHIVE_FILLING_DETAIL.BTNS',
            },
            buttons.filter(Boolean)
          )}
        </Header>
        <Content className={styles['sreq-detail-form']}>
          <Spin spinning={allLoading || false}>
            {customizeCollapse(
              {
                code: 'SSLM.ARCHIVE_FILLING_DETAIL.COLLAPSE',
                custDefaultActive: key => {
                  this.handleCollapse(key);
                },
              },
              <Collapse
                className="form-collapse"
                defaultActiveKey={activeKey}
                onChange={this.handleCollapse}
              >
                <Panel
                  key="queryDetailKey"
                  showArrow={false}
                  header={
                    <Fragment>
                      <h3>{intl.get(`sslm.common.view.archive.baseInfo`).d('基本信息')}</h3>
                      <a>
                        {collapsed
                          ? intl.get('hzero.common.button.up').d('收起')
                          : intl.get('hzero.common.button.expand').d('展开')}
                        {<Icon type={collapsed ? 'up' : 'down'} />}
                      </a>
                    </Fragment>
                  }
                >
                  {fillingDetailRemote?.render(
                    'SSLM_EVALUATION_FILLING_DETAIL_BASE_INFO_TIPS',
                    null,
                    {}
                  )}
                  {customizeForm(
                    {
                      code: 'SSLM.ARCHIVE_FILLING_DETAIL.FILLING_DETAIL',
                      form,
                      dataSource: detailData,
                    },
                    <Form className="ued-edit-form form-wrap">
                      <Row gutter={48} className="writable-row">
                        <Col span={8}>
                          <FormItem
                            {...formItemLayout}
                            label={intl
                              .get('sslm.supplierDocManage.model.evaluationDocManage.docCode')
                              .d('档案编码')}
                          >
                            {getFieldDecorator('evalNum', {
                              initialValue: detailData.evalNum,
                            })(<span>{detailData.evalNum}</span>)}
                          </FormItem>
                        </Col>
                        <Col span={8}>
                          <FormItem
                            {...formItemLayout}
                            label={intl.get(`sslm.common.model.archive.fileDescribe`).d('档案描述')}
                          >
                            {getFieldDecorator('evalName', {
                              initialValue: detailData.evalName,
                            })(<span>{detailData.evalName}</span>)}
                          </FormItem>
                        </Col>
                        <Col span={8}>
                          <FormItem
                            {...formItemLayout}
                            label={intl.get(`sslm.common.model.archive.status`).d('档案状态')}
                          >
                            {getFieldDecorator('evalStatusMeaning', {
                              initialValue: detailData.evalStatusMeaning,
                            })(<span>{detailData.evalStatusMeaning}</span>)}
                          </FormItem>
                        </Col>
                      </Row>
                      <Row gutter={48} className="writable-row">
                        <Col span={8}>
                          <FormItem
                            {...formItemLayout}
                            label={intl.get(`sslm.common.model.evaluation.template`).d('考评模板')}
                          >
                            {getFieldDecorator('evalTplName', {
                              initialValue: detailData.evalTplName,
                            })(<span>{detailData.evalTplName}</span>)}
                          </FormItem>
                        </Col>
                        <Col span={8}>
                          <FormItem
                            {...formItemLayout}
                            label={intl
                              .get(`sslm.common.view.archiveFilled.evaluationDimension`)
                              .d('考评维度')}
                          >
                            {getFieldDecorator('evalDimensionMeaning', {
                              initialValue: detailData.evalDimensionMeaning,
                            })(<span>{detailData.evalDimensionMeaning}</span>)}
                          </FormItem>
                        </Col>
                        <Col span={8}>
                          <FormItem
                            {...formItemLayout}
                            label={intl.get(`sslm.common.model.dimension.value`).d('维度值')}
                          >
                            {getFieldDecorator('evalDimensionValueMeaning', {
                              initialValue: detailData.evalDimensionValueMeaning,
                            })(<span>{detailData.evalDimensionValueMeaning}</span>)}
                          </FormItem>
                        </Col>
                      </Row>
                      <Row gutter={48} className="writable-row">
                        <Col span={8}>
                          <FormItem
                            {...formItemLayout}
                            label={intl.get(`sslm.common.model.evaluation.cycle`).d('考评周期')}
                          >
                            {getFieldDecorator('evalCycleMeaning', {
                              initialValue: detailData.evalCycleMeaning,
                            })(<span>{detailData.evalCycleMeaning}</span>)}
                          </FormItem>
                        </Col>
                        <Col span={8}>
                          <FormItem
                            {...formItemLayout}
                            label={intl
                              .get(`sslm.common.view.archiveFilled.evaluationCharger`)
                              .d('考评负责人')}
                          >
                            {getFieldDecorator('processUserName', {
                              initialValue: detailData.processUserName,
                            })(<span>{detailData.processUserName}</span>)}
                          </FormItem>
                        </Col>
                        <Col span={8}>
                          <FormItem
                            {...formItemLayout}
                            label={intl.get(`sslm.common.model.archive.create.time`).d('建档时间')}
                          >
                            {getFieldDecorator('creationDate', {
                              initialValue: detailData.creationDate,
                            })(<span>{dateTimeRender(detailData.creationDate)}</span>)}
                          </FormItem>
                        </Col>
                      </Row>
                      <Row gutter={48} className="writable-row">
                        <Col span={8}>
                          <FormItem
                            {...formItemLayout}
                            label={intl
                              .get(`sslm.common.model.evaluation.createdUserName`)
                              .d('创建人')}
                          >
                            {getFieldDecorator('createdUserName', {
                              initialValue: detailData.createdUserName,
                            })(<span>{detailData.createdUserName}</span>)}
                          </FormItem>
                        </Col>
                      </Row>
                      <Row gutter={48} className="writable-row">
                        <Col span={8}>
                          <FormItem
                            {...formItemLayout}
                            label={intl
                              .get(`sslm.common.model.evaluation.date.after`)
                              .d('考评日期从')}
                          >
                            {getFieldDecorator('evalDateFrom', {
                              initialValue: detailData.evalDateFrom,
                            })(<span>{dateRender(detailData.evalDateFrom)}</span>)}
                          </FormItem>
                        </Col>
                        <Col span={8}>
                          <FormItem
                            {...formItemLayout}
                            label={intl
                              .get(`sslm.common.model.evaluation.date.before`)
                              .d('考评日期至')}
                          >
                            {getFieldDecorator('evalDateTo', {
                              initialValue: detailData.evalDateTo,
                            })(<span>{dateRender(detailData.evalDateTo)}</span>)}
                          </FormItem>
                        </Col>
                        {detailData.evalTplType === 'BDKPI_EVAL' && (
                          <Col span={8}>
                            <FormItem
                              {...formItemLayout}
                              label={intl
                                .get(`sslm.supplierDocManage.model.evalDocManage.docType`)
                                .d('单据类型')}
                            >
                              {getFieldDecorator('docTypeMeaning', {
                                initialValue: detailData.docTypeMeaning,
                              })(<span>{detailData.docTypeMeaning}</span>)}
                            </FormItem>
                          </Col>
                        )}
                      </Row>
                      {detailData.evalTplType === 'BDKPI_EVAL' && (
                        <Row gutter={48} className="writable-row">
                          <Col span={8}>
                            <FormItem
                              {...formItemLayout}
                              label={intl
                                .get(`sslm.supplierDocManage.model.evalDocManage.docNum`)
                                .d('单据')}
                            >
                              {getFieldDecorator('docNum', {
                                initialValue: detailData.docNum,
                              })(
                                <LovMulti
                                  code={
                                    detailData.docType === 'YS'
                                      ? 'SSLM.KPI_EVAL.RCV_TRX_HEADER'
                                      : 'SSLM.KPI_EVAL.CONTRACT_HEAD_SUBJECT'
                                  }
                                  value={detailData.docNum}
                                  viewOnly
                                />
                              )}
                            </FormItem>
                          </Col>
                        </Row>
                      )}
                      <Row gutter={48} className="writable-row">
                        <Col span={24}>
                          <FormItem
                            {...formItemLayout}
                            label={intl.get(`sslm.common.model.evaluation.rule`).d('考评规则说明')}
                          >
                            {getFieldDecorator('evalRuleRemark', {
                              initialValue: detailData.evalRuleRemark,
                            })(<span>{detailData.evalRuleRemark}</span>)}
                          </FormItem>
                        </Col>
                      </Row>
                      <Row gutter={48} className="writable-row">
                        <Col span={24}>
                          <FormItem
                            {...formItemLayout}
                            label={intl.get(`sslm.common.model.evaluation.remark`).d('考评说明')}
                          >
                            {getFieldDecorator('remark', {
                              initialValue: detailData.remark,
                            })(<span>{detailData.remark}</span>)}
                          </FormItem>
                        </Col>
                      </Row>
                      <Row gutter={48} className="writable-row">
                        <Col span={8}>
                          <FormItem
                            {...formItemLayout}
                            label={intl
                              .get(`sslm.common.model.evaluation.appraisalAttachment`)
                              .d('考评附件')}
                          >
                            {getFieldDecorator('totalAttachment', {
                              initialValue: detailData.totalAttachment,
                            })(
                              <span>
                                {isEdit ? (
                                  <a onClick={() => this.handleAttachmentModal()}>
                                    <Icon type="upload" />
                                    {intl.get('hzero.common.upload.text').d('上传附件')}
                                  </a>
                                ) : (
                                  <a onClick={() => this.handleAttachmentModal()}>
                                    <Icon type="paper-clip" />
                                    {intl.get('hzero.common.upload.view').d('查看附件')}
                                  </a>
                                )}
                                {detailData.totalAttachment ? (
                                  <span
                                    style={{
                                      backgroundColor: linkColor || '#108ee9',
                                      height: 'auto',
                                      lineHeight: '15px',
                                      marginLeft: '4px',
                                      padding: '0 7px',
                                      fontSize: '12px',
                                      color: '#fff',
                                    }}
                                  >
                                    {detailData.totalAttachment}
                                  </span>
                                ) : null}
                              </span>
                            )}
                          </FormItem>
                        </Col>
                      </Row>
                    </Form>
                  )}
                </Panel>
              </Collapse>
            )}
            <Search {...searchProps} />
            <ChoerodonButton funcType="flat" color="primary" onClick={this.handleSelectAll}>
              {!selectAllFlag
                ? intl.get('hzero.common.button.selectAll').d('全选')
                : intl.get('sslm.supplierDocManage.view.button.unSelectAll').d('取消全选')}
            </ChoerodonButton>
            <List {...tableProps} />
            <OperationLogModals {...modalProps} />
          </Spin>
        </Content>
        {modalVisible && <AttachmentModal {...attachmentModalProps} />}
        {transmitVisible && <TransmitModal {...transmitModalProps} />}
      </Fragment>
    );
  }
}
