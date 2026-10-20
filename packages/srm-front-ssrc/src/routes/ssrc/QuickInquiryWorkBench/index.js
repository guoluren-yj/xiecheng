import React, { useMemo, useState, useEffect, useRef } from 'react';
import { observer } from 'mobx-react';
import {
  DataSet,
  Form,
  TextArea,
  Button,
  Icon,
  Tooltip,
  Dropdown,
  Menu,
  Modal,
} from 'choerodon-ui/pro';
import { Tabs, Spin } from 'choerodon-ui';
import { noop, compose, isEmpty, throttle } from 'lodash';

import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import intl from 'utils/intl';
import withProps from 'utils/withProps';
import remotes from 'hzero-front/lib/utils/remote';
import DynamicButtons from '_components/DynamicButtons';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';

import { ModalIndex } from '@/routes/spc/PriceAdjustmentWorkbench/Detail/index';
import commonStyles from '@/routes/ssrc/common.less';
import { IsOpenDoubleUnitHOC } from '@/utils/utils';
import {
  sendMessage,
  hold,
  fetchExecuteRule,
  executeExecutionRules,
  savePriceAdjustModal,
  cancelPriceAdjustModal,
  validateBeforeJump,
  copyQuickRfq,
  revokeRfqValidate,
  revokeRfq,
} from '@/services/quickInquiryService';
import { validateQRModal } from '@/routes/components/ConfirmModal';
import OperationRecordExport from '@/routes/components/OperationRecordExport';

import Unpublished from './Tabs/Unpublished';
import InQuotation from './Tabs/InQuotation';
import Pending from './Tabs/Pending';
import SelectApproval from './Tabs/SelectApproval';
import Finish from './Tabs/Finish';
import All from './Tabs/All';
import QuotationModal from './components/QuotationModal';
import LadderLevelModal from './components/PurLadderLevelModal/index';
import QuoLadderLevelModal from './components/QuoLadderLevelModal/index';
import ViewBatchNo from './components/ViewBatchNo/index';
import ExecuteRuleModal from './components/ExecuteRuleModal/index';
import QuotationOperation from './components/QuotationModal/QuotationOperation';
import { tableDS, reQuoteFormDS, resultExecuteRuleFormDS } from './tableDS';
import HeaderOperationRecord from './components/HeaderOperationRecord';
import styles from './index.less';

const { TabPane } = Tabs;

const Index = (props) => {
  const {
    customizeBtnGroup = noop,
    customizeTabPane = noop,
    customizeForm = noop,
    customizeTable = noop,
    customizeCollapseForm = noop,
    tableDsMap = {},
    tableDisplayMap = {},
    activeKeyTab = {},
    doubleUnitFlag = false,
    history,
    remote,
  } = props || {};

  const { unpublishedDs, inQuotationDs, pendingDs, selectApprovalDs, finishDs, allDs } =
    tableDsMap || {};

  // 报价弹框实例ref
  const quotationModalRef = useRef(null);

  // 报价弹框内容ref
  const quotationModalContentRef = useRef(null);

  // 调价单弹框内容ref
  const priceAdjustmentModalRef = useRef(null);

  // 查看批次弹框实例ref
  const batchNoModalRef = useRef(null);

  // 操作记录ref
  const operationRecordRef = useRef({});

  // 操作记录head,ref
  const operationRecordHeadRef = useRef({});

  // 默认走缓存tabKey (ps: 个性化如若设置激活tab 则不生效)
  const [activeKey, setActiveKey] = useState(activeKeyTab?.key || 'pending');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initTotalCount();
  }, []);

  // 初始化totalCount数据 只查询数量 渲染数量 不查询具体数据
  const initTotalCount = () => {
    unpublishedDs.query(unpublishedDs?.currentPage, { onlyCountFlag: 'Y' });
    inQuotationDs.query(inQuotationDs?.currentPage, { onlyCountFlag: 'Y' });
    pendingDs.query(pendingDs?.currentPage, { onlyCountFlag: 'Y' });
    selectApprovalDs.query(selectApprovalDs?.currentPage, { onlyCountFlag: 'Y' });
    finishDs.query(finishDs?.currentPage, { onlyCountFlag: 'Y' });
    allDs.query(allDs?.currentPage, { onlyCountFlag: 'Y' });
  };

  // 切换标签页
  const changeTabs = (key) => {
    setActiveKey(key);
    // eslint-disable-next-line no-param-reassign
    activeKeyTab.key = key;

    // 初始化筛选器查询 后切换tab标签手动查询
    // 防止 tab 第一次加载时筛选器内部自执行的查询和此处手动调用查询冲突，此处需判断 dataSet 的 queryStatus 标识，标识未 ready 时表示筛选器内部自治县查询已执行过，可以手动调用查询了
    if (tableDsMap[`${key}Ds`]?.getState('queryStatus') === 'ready') {
      // eslint-disable-next-line no-unused-expressions
      tableDsMap[`${key}Ds`]?.query(tableDsMap[`${key}Ds`]?.currentPage);
    }
  };

  // 改变平铺或聚合 修改props中aggregation值 记录缓存值
  const changeAggregation = (key = '', value = false) => {
    tableDisplayMap[key].isAggregation = value;
  };

  // 数据操作后(选用 重新报价 暂挂等)-查询
  // 带上分页参数 缓存
  const allSearch = () => {
    // eslint-disable-next-line no-unused-expressions
    tableDsMap[`${activeKey}Ds`]?.query(tableDsMap[`${activeKey}Ds`]?.currentPage);
  };

  // 新建跳转
  const handleCreate = () => {
    history.push({
      pathname: `/ssrc/quick-inquiry-workbench/create`,
    });
  };

  // (维护 || 明细)跳转
  const handleJumpDetail = async (record = {}) => {
    const { quotationStatus, rfqHeaderId } = record.get(['rfqHeaderId', 'quotationStatus']);
    // 待发布 跳转编辑页
    if (quotationStatus === 'PENDING') {
      const res = await validateBeforeJump({
        rfqHeaderId,
        customizeUnitCode: 'SSRC.QUICK_INQUIRY.EDIT.BASE_HEADER_FORM',
      });
      if (getResponse(res)) {
        const { rfqStatus } = res || {};
        if (rfqStatus === 'DELETED') {
          // 校验单据是否不存在  单据已经删除，提示报错 刷新列表
          notification.error({
            description: intl
              .get('ssrc.quickInquiry.view.quickInquiry.delete.docTipMsg')
              .d('单据已被删除。'),
          });
          history.push({
            pathname: `/ssrc/quick-inquiry-workbench/list`,
          });
        } else {
          history.push({
            pathname: `/ssrc/quick-inquiry-workbench/update/${rfqHeaderId}`,
          });
        }
      }
    } else {
      // 其他状态 查看批次弹框
      showBatchNo(record);
    }
  };

  // 批次复制
  const handleCopy = (record) => {
    if (isEmpty(record)) return;
    const { rfqHeaderId } = record.get(['rfqHeaderId']) || {};
    return copyQuickRfq({ rfqHeaderId }).then((res) => {
      const result = getResponse(res);
      if (result) {
        if (batchNoModalRef.current) batchNoModalRef.current.close();
        history.push({
          pathname: `/ssrc/quick-inquiry-workbench/update/${result?.rfqHeaderId}`,
        });
      }
    });
  };

  // 查看批次
  const showBatchNo = (record = {}) => {
    if (isEmpty(record)) return;
    const { batchNo } = record.get(['batchNo']) || {};
    batchNoModalRef.current = Modal.open({
      key: 'quick-inquiry-view-batch-no',
      title: `${intl.get('ssrc.quickInquiry.view.message.viewBatchNo').d('查看批次')}-${batchNo}`,
      destroyOnClose: true,
      style: {
        width: 1090,
      },
      drawer: true,
      children: (
        <ViewBatchNo
          lineRecord={record}
          doubleUnitFlag={doubleUnitFlag}
          customizeTable={customizeTable}
          onShowQuoLadderLevelModal={showQuoLadderLevel}
        />
      ),
      footer: () => {
        return [
          <Button color="primary" onClick={() => batchNoModalRef?.current?.close()}>
            {intl.get('hzero.common.button.close').d('关闭')}
          </Button>,
          <Button onClick={() => handleCopy(record)}>
            {intl.get('hzero.common.button.copy').d('复制')}
          </Button>,
          <HeaderOperationRecord
            headerRecord={record}
            handleOperationRef={operationRecordHeadRef}
          />,
        ];
      },
    });
  };

  // 埋点显示查看调价单还是创建调价单标识
  const remoteShowPriceAdjustmentModal = (record = {}) => {
    if (remote?.event) {
      return remote.event.fireEvent('remoteShowPriceAdjustmentModal', {
        record,
        handleOpenPriceAdjustmentModal,
      });
    }
    return true;
  };

  // 查看调价单
  const showPriceAdjustmentModal = async (record = {}) => {
    if (isEmpty(record)) return;
    const flag = await remoteShowPriceAdjustmentModal(record);
    if (!flag) return;
    const { priceAdjustId } = record.get(['priceAdjustId']) || {};
    const params = {
      priceAdjustmentHeaderId: priceAdjustId,
      isModal: true,
      showHeader: false,
      basicEditFlag: false, // 基础信息是否可编辑
      lineEditFlag: false, // 行是否可编辑
    };
    Modal.open({
      title: intl.get('ssrc.quickInquiry.view.message.viewPriceAdjustment').d('查看调价单'),
      key: 'view-price-adjustment',
      drawer: true,
      style: { width: 1090 },
      destroyOnClose: true,
      children: <ModalIndex extraParams={params} />,
      okButton: false,
      cancelProps: {
        color: 'primary',
      },
      cancelText: intl.get(`hzero.common.button.close`).d('关闭'),
    });
  };

  // 报价中-发送提醒
  const handleSendMessage = ({ currentRecord = {}, batchEditFlag = false }) => {
    let rfqQuotationDTOList = [];
    // 批量
    if (batchEditFlag) {
      rfqQuotationDTOList = inQuotationDs?.selected?.map((n) => n.toData()) || [];
    } else {
      rfqQuotationDTOList = [currentRecord?.toData() || {}];
    }

    setLoading(true);
    return sendMessage({ rfqQuotationDTOList })
      .then((res) => {
        const result = getResponse(res);
        if (result) {
          if (batchEditFlag) {
            // 清除缓存记录
            inQuotationDs.unSelectAll();
            inQuotationDs.clearCachedSelected();
          }
          // 查询
          inQuotationDs.query(inQuotationDs.currentPage);
        }
      })
      .finally(() => setLoading(false));
  };

  // 选用-(操作FromModal 查看报价弹框按钮)
  const handleChooseFromModal = ({ currentRecord = {}, operatingType = 'SELECT' }) => {
    const rfqQuotationIds = [currentRecord?.get?.('rfqQuotationId')];
    const params = {
      rfqQuotationIds,
      cnfCode: 'SITE.SSRC.QUICK_RFQ_SELECT_APPROVE_METHOD',
      operatingType,
    };
    // 获取执行规则
    return fetchExecuteRule(params).then((res) => {
      const result = getResponse(res);
      if (result) {
        const { resultExecuteRule = null, defaultRule = null } = result;
        const param = {
          rfqQuotationIds,
          operatingType,
          rfqItemId: currentRecord?.get?.('rfqItemId'),
        };
        // 手工选择 弹出侧弹框
        if (resultExecuteRule === 'MANUAL') {
          return handleOpenExecuteRuleModalFromModal({ ...param, defaultRule });
        } else if (resultExecuteRule === 'ADJUST_PRICE') {
          // 创建调价单 弹出侧弹框
          return handleExecuteExecutionRulesFromModal({
            ...param,
            formData: { resultExecuteRule },
          }).then((_res) => {
            if (_res) {
              // 关闭查看报价弹框
              if (quotationModalRef.current) quotationModalRef.current.close();
              notification.success();
              allSearch();
              // 打开调价单弹框
              handleOpenPriceAdjustmentModal(_res);
            }
          });
        } else if (['PENDING_POOL', 'SELF'].includes(resultExecuteRule)) {
          // 转待办池 || 自审批
          return handleExecuteExecutionRulesFromModal({
            ...param,
            formData: { resultExecuteRule },
          }).then((_res) => {
            if (_res) {
              // 关闭查看报价弹框
              if (quotationModalRef.current) quotationModalRef.current.close();
              notification.success();
              allSearch();
            }
          });
        }
      }
    });
  };

  // 手工选择-弹框
  const handleOpenExecuteRuleModalFromModal = ({
    rfqQuotationIds = [],
    defaultRule = null,
    operatingType = 'SELECT',
    rfqItemId,
  }) => {
    const resultExecuteRuleFormDs = new DataSet(resultExecuteRuleFormDS({ rfqQuotationIds }));
    // 创建默认值
    resultExecuteRuleFormDs.create({ resultExecuteRule: defaultRule });
    return Modal.open({
      key: 'quick-inquiry-execute-rule',
      title: intl.get('ssrc.quickInquiry.view.message.chooseExecuteRule').d('选用执行规则'),
      destroyOnClose: true,
      style: {
        width: 380,
      },
      drawer: true,
      bodyStyle: { padding: 0 },
      children: <ExecuteRuleModal dataSet={resultExecuteRuleFormDs} />,
      onOk: () =>
        handleExecuteRuleModalFromModalOk({
          ds: resultExecuteRuleFormDs,
          rfqQuotationIds,
          operatingType,
          rfqItemId,
        }),
      afterClose: () => {
        // eslint-disable-next-line no-unused-expressions
        resultExecuteRuleFormDs?.reset?.();
      },
    });
  };

  // 手工创建弹框确认
  const handleExecuteRuleModalFromModalOk = async ({
    ds,
    rfqQuotationIds = [],
    operatingType = 'SELECT',
    rfqItemId,
  }) => {
    const validate = await ds.validate();
    if (!validate) return false;

    const params = {
      cnfCode: 'SITE.SSRC.QUICK_RFQ_SELECT_APPROVE_METHOD',
      operatingType,
      rfqQuotationIds,
      rfqItemId,
      ...(ds?.current?.toData() || {}),
    };
    return executeExecutionRules(params).then((res) => {
      const result = getResponse(res);
      if (result) {
        notification.success();
        const { resultExecuteRule = null } = result;
        // 关闭查看报价弹框
        if (quotationModalRef.current) quotationModalRef.current.close();
        if (resultExecuteRule === 'ADJUST_PRICE') {
          handleOpenPriceAdjustmentModal(result);
          allSearch();
        }
        return result;
      } else {
        return false;
      }
    });
  };

  // 转代办池-执行
  // 选用-(操作FromModal 查看报价弹框按钮)
  const handleExecuteExecutionRulesFromModal = async (param = {}) => {
    const { formData = {}, ...others } = param || {};
    const params = {
      cnfCode: 'SITE.SSRC.QUICK_RFQ_SELECT_APPROVE_METHOD',
      ...(others || {}),
      ...(formData || {}),
    };
    return executeExecutionRules(params).then((res) => {
      const result = getResponse(res);
      if (result) {
        return result;
      } else {
        return false;
      }
    });
  };

  // 选用- 操作FromList列表(待处理 ｜ 全部), 触发节点：表格行上 | 头按钮批量选用, triggerField: 触发字段 - 暂且提供给司顺二开使用
  const handleChooseFromList = ({ currentRecord, batchEditFlag = false, triggerField }) => {
    let rfqQuotationIds = [];
    // 批量
    if (batchEditFlag) {
      rfqQuotationIds = pendingDs?.selected?.map?.((item) => item.get('rfqQuotationId')) || [];
    } else {
      rfqQuotationIds = [currentRecord?.get?.('rfqQuotationId')];
    }
    setLoading(true);
    const params = {
      rfqQuotationIds,
      cnfCode: 'SITE.SSRC.QUICK_RFQ_SELECT_APPROVE_METHOD',
      operatingType: 'SELECT',
    };
    // 获取执行规则
    return fetchExecuteRule(params)
      .then(async (res) => {
        const result = getResponse(res);
        if (result) {
          const { resultExecuteRule = null, defaultRule = null } = result;
          const param = {
            rfqQuotationIds,
            batchEditFlag,
          };
          // 手工选择 弹出侧弹框
          if (resultExecuteRule === 'MANUAL') {
            return handleOpenRuleModalFromList({ ...param, defaultRule });
          } else if (resultExecuteRule === 'ADJUST_PRICE') {
            const handleAdjustPrice = () =>
              handleExecuteRulesFromList({ ...param, formData: { resultExecuteRule } }).then(
                (_res) => {
                  if (_res) {
                    notification.success();
                    allSearch();
                    // 打开调价单弹框
                    handleOpenPriceAdjustmentModal(_res);
                  }
                }
              );
            // 覆写调价单处理逻辑埋点
            const remoteFunc = remote?.process(
              'SSRC_QUICK_INQUIRY_WORKBENCH_LIST_SELECTION_PRICE_ADJUST',
              handleAdjustPrice,
              { currentRecord, handleOpenPriceAdjustmentModal, triggerField }
            );
            if (remoteFunc && typeof remoteFunc === 'function') return remoteFunc();
            // 创建调价单 弹出侧弹框
            return handleAdjustPrice();
          } else if (['PENDING_POOL', 'SELF'].includes(resultExecuteRule)) {
            // 转待办池 || 自审批
            return handleExecuteRulesFromList({ ...param, formData: { resultExecuteRule } }).then(
              (_res) => {
                if (_res) {
                  notification.success();
                  allSearch();
                }
              }
            );
          }
        }
      })
      .finally(() => setLoading(false));
  };

  // 手工选择-弹框-(操作FromList 列表(待处理 || 全部)表格行上 || 头按钮批量选用)
  const handleOpenRuleModalFromList = ({
    rfqQuotationIds = [],
    batchEditFlag = false,
    defaultRule = null,
  }) => {
    const resultExecuteRuleFormDs = new DataSet(resultExecuteRuleFormDS());
    // 创建默认值
    resultExecuteRuleFormDs.create({ resultExecuteRule: defaultRule });
    return Modal.open({
      key: 'quick-inquiry-execute-rule',
      title: intl.get('ssrc.quickInquiry.view.message.chooseExecuteRule').d('选用执行规则'),
      destroyOnClose: true,
      style: {
        width: 380,
      },
      drawer: true,
      bodyStyle: { padding: 0 },
      children: (
        <ExecuteRuleModal dataSet={resultExecuteRuleFormDs} batchEditFlag={batchEditFlag} />
      ),
      onOk: () =>
        handleExecuteRuleModalFromListOk({
          ds: resultExecuteRuleFormDs,
          rfqQuotationIds,
          batchEditFlag,
        }),
      afterClose: () => {
        // eslint-disable-next-line no-unused-expressions
        resultExecuteRuleFormDs?.reset?.();
      },
    });
  };

  const handleExecuteRuleModalFromListOk = async ({
    ds,
    rfqQuotationIds = [],
    batchEditFlag = false,
  }) => {
    const validate = await ds.validate();
    if (!validate) return false;

    const params = {
      cnfCode: 'SITE.SSRC.QUICK_RFQ_SELECT_APPROVE_METHOD',
      operatingType: 'SELECT',
      rfqQuotationIds,
      ...(ds?.current?.toData() || {}),
    };
    return executeExecutionRules(params).then((res) => {
      const result = getResponse(res);
      if (result) {
        const { resultExecuteRule = null } = result;
        if (resultExecuteRule === 'ADJUST_PRICE') handleOpenPriceAdjustmentModal(result);
        if (batchEditFlag) {
          // 清除缓存记录
          pendingDs.unSelectAll();
          pendingDs.clearCachedSelected();
        }
        notification.success();
        allSearch();
        return result;
      } else {
        return false;
      }
    });
  };

  // 创建调价单-弹框
  const handleOpenPriceAdjustmentModal = (param = {}) => {
    const { priceAdjustId, autoPublishFlag = 0 } = param || {};
    // 调价单自动发布时，不弹出调价单创建的侧弹框
    if (Number(autoPublishFlag)) return;
    const params = {
      priceAdjustmentHeaderId: priceAdjustId,
      isModal: true,
      showHeader: false,
      basicEditFlag: true, // 基础信息是否可编辑
      lineEditFlag: false, // 行是否可编辑
    };
    const remoteModalProps = remote
      ? remote.process(
          'SSRC_QUICK_INQUIRY_WORKBENCH_LIST_PROCESS_PRICE_ADJUSTMENT_MODAL_PROPS',
          {},
          param
        )
      : {};
    Modal.open({
      title: intl.get('ssrc.quickInquiry.view.message.createPriceAdjustment').d('创建调价单'),
      key: 'create-price-adjustment',
      drawer: true,
      style: { width: 1090 },
      destroyOnClose: true,
      keyboardClosable: false,
      children: <ModalIndex ref={priceAdjustmentModalRef} extraParams={params} />,
      onOk: () => handleOkPriceAdjustModal(param),
      onCancel: () => handleCancelPriceAdjustModal(),
      ...(remoteModalProps || {}),
    });
  };

  // 创建调价单确定回调
  const handleOkPriceAdjustModal = async (param) => {
    const { BasicInfoDs } = priceAdjustmentModalRef?.current || {};
    if (!BasicInfoDs) return false;
    const params = {
      customizeUnitCode: 'SPC.PRICEADJUSTMENTWORKBENCH.DETAIL.HEADER_FORM', // 调价单表单个性化单元编码
      ...(BasicInfoDs?.current?.toJSONData() || {}),
    };
    const basicInfoFlag = await BasicInfoDs.validate();
    if (!basicInfoFlag) return false;
    const publish = () =>
      savePriceAdjustModal(params).then((res) => {
        const result = getResponse(res);
        if (result) {
          notification.success();
          allSearch();
          return result;
        } else {
          return false;
        }
      });
    // 司顺二开覆写发布逻辑
    const remoteFunc = remote
      ? remote?.process(
          'SSRC_QUICK_INQUIRY_WORKBENCH_LIST_MODAL.PRICE_ADJUST_MODAL_ON_OK',
          publish,
          { param, allSearch, params }
        )
      : publish;
    if (remoteFunc && typeof remoteFunc === 'function') return remoteFunc();
    return publish();
  };

  // 创建调价单取消回调
  const handleCancelPriceAdjustModal = () => {
    const { BasicInfoDs } = priceAdjustmentModalRef?.current || {};
    const params = [
      {
        priceAdjustmentHeaderId: BasicInfoDs?.current?.get('priceAdjustmentHeaderId'),
        cancelFlag: 1,
      },
    ];
    return cancelPriceAdjustModal(params).then((res) => {
      const result = getResponse(res);
      if (result) {
        notification.success();
        allSearch();
        return result;
      } else {
        return false;
      }
    });
  };

  // (转代办池 || 手工选用)-执行-(操作FromList 列表(待处理 || 全部)表格行上 || 头按钮批量选用)
  const handleExecuteRulesFromList = ({
    rfqQuotationIds = [],
    batchEditFlag = false,
    formData = {},
  }) => {
    const params = {
      cnfCode: 'SITE.SSRC.QUICK_RFQ_SELECT_APPROVE_METHOD',
      operatingType: 'SELECT',
      rfqQuotationIds,
      ...(formData || {}),
    };
    return executeExecutionRules(params).then((res) => {
      const result = getResponse(res);
      if (result) {
        if (batchEditFlag) {
          // 清除缓存记录
          pendingDs.unSelectAll();
          pendingDs.clearCachedSelected();
        }
        return result;
      } else {
        return false;
      }
    });
  };

  // 待处理-重新报价(待处理、全部页签行重新报价 || 头批量重新报价 ||来源查看报价弹框重新报价)
  const handleReQuote = ({ currentRecord = {}, batchEditFlag = false, from = '' }) => {
    const reQuoteFormDs = new DataSet(
      reQuoteFormDS({ customizeUnitCode: 'SSRC.QUICK_INQUIRY.LIST.RE_QUOTE_FORM' })
    );

    let rfqQuotationDTOList = [];
    // 批量
    if (batchEditFlag) {
      rfqQuotationDTOList = pendingDs?.selected?.map((n) => n.toData()) || [];
    } else {
      rfqQuotationDTOList = [currentRecord?.toData() || {}];
    }

    // 涉及报价弹框二开埋点参数
    const remoteQuoteProps = {
      batchEditFlag,
      rfqQuotationDTOList,
      formDs: reQuoteFormDs,
    };

    // 弹框打开前事件
    const handleBeforeOpen = async () => {
      if (remote?.event) {
        await remote.event.fireEvent('beforeOpenReQuoteModal', remoteQuoteProps);
      }
    };

    // 初始化数据
    const initReQuoteData = remote?.process(
      'SSRC_QUICK_INQUIRY_WORKBENCH_LIST_MODAL.QUOTE_FROM.INIT_REQUOTE_DATA',
      {
        rfqQuotationDTOList,
        currencyCode: null,
      },
      remoteQuoteProps
    );
    reQuoteFormDs.create(initReQuoteData);

    const ReQuteForm = observer(() => {
      const standardFields = [<TextArea name="returnRemark" autoSize={{ minRows: 3 }} resize />];
      const getFields = () =>
        remote?.process(
          'SSRC_QUICK_INQUIRY_WORKBENCH_LIST_MODAL.QUOTE_FROM.FIELDS',
          standardFields,
          remoteQuoteProps
        );
      return customizeForm(
        {
          code: 'SSRC.QUICK_INQUIRY.LIST.RE_QUOTE_FORM',
          dataSet: reQuoteFormDs,
        },
        <Form dataSet={reQuoteFormDs} columns={1} labelLayout="float">
          {getFields()}
        </Form>
      );
    });
    return Modal.open({
      title: intl.get(`ssrc.quickInquiry.view.button.reQuote`).d('重新报价'),
      destroyOnClose: true,
      drawer: true,
      style: {
        width: '380px',
      },
      beforeOpen: handleBeforeOpen,
      children: <ReQuteForm />,
      onOk: async () => {
        // 新增前置埋点校验
        if (remote?.event) {
          const remoteFlag = await remote.event.fireEvent(
            'beforeReoteFormSubmit',
            remoteQuoteProps
          );
          if (!remoteFlag) return false;
        }
        const res = await reQuoteFormDs.submit();
        if (res) {
          // 批量编辑操作重新报价
          if (batchEditFlag) {
            // 清除缓存记录
            pendingDs.unSelectAll();
            pendingDs.clearCachedSelected();
          }
          // 来源查看报价弹框；重新报价后关闭查看报价弹框和重新报价弹框再刷新列表
          if (from === 'quotation-modal') {
            if (quotationModalRef.current) quotationModalRef.current.close();
          }
          allSearch();
        }
        // 校验失败，阻止弹框关闭
        return res;
      },
      afterClose: () => {
        // eslint-disable-next-line no-unused-expressions
        reQuoteFormDs?.reset?.();
      },
    });
  };

  // (报价中 || 待处理)-暂挂
  const handleHold = ({ currentRecord = {}, batchEditFlag = false }) => {
    let rfqQuotationDTOList = [];
    // 批量
    if (batchEditFlag) {
      rfqQuotationDTOList = tableDsMap[`${activeKey}Ds`]?.selected?.map((n) => n.toData()) || [];
    } else {
      rfqQuotationDTOList = [currentRecord?.toData() || {}];
    }

    setLoading(true);
    return hold({ rfqQuotationDTOList })
      .then((res) => {
        const result = getResponse(res);
        if (result) {
          if (batchEditFlag) {
            // 清除缓存记录
            // eslint-disable-next-line no-unused-expressions
            tableDsMap[`${activeKey}Ds`]?.unSelectAll();
            // eslint-disable-next-line no-unused-expressions
            tableDsMap[`${activeKey}Ds`]?.clearCachedSelected();
          }
          notification.success();
          allSearch();
        }
      })
      .finally(() => setLoading(false));
  };

  // 列表-操作记录
  const handleOperationRecords = ({ currentRecord = {} }) => {
    // 获取最新rfqQuotationId
    const rfqQuotationId = currentRecord?.get('rfqQuotationId');
    return Modal.open({
      drawer: true,
      key: 'quick-inquiry-operation-records',
      title: intl
        .get('ssrc.quickInquiry.quickReply.view.message.title.operationRecord')
        .d('操作记录'),
      className: commonStyles['ssrc-medium-modal'],
      children: (
        <QuotationOperation
          rfqQuotationId={rfqQuotationId}
          handleOperationRef={operationRecordRef}
        />
      ),
      okCancel: false,
      destroyOnClose: true,
      okText: intl.get('hzero.common.button.close').d('关闭'),
      footer: (okBtn) => {
        return (
          <>
            {okBtn}
            <OperationRecordExport
              sourceId={rfqQuotationId}
              type="QUICK_RFQ_LINE"
              operationRef={operationRecordRef}
            />
          </>
        );
      },
    });
  };

  // 列表-撤销
  const handleRevokeRecord = throttle(async ({ currentRecord = {} }) => {
    const rfqHeaderId = currentRecord?.get('rfqHeaderId');

    // 校验成功回调
    const warningOk = async () => {
      await revokeRfq({ rfqHeaderId }).then((res) => {
        if (getResponse(res)) {
          notification.success();
          history.push({
            pathname: `/ssrc/quick-inquiry-workbench/update/${rfqHeaderId}`,
          });
        }
      });
    };

    try {
      const validateRes = getResponse(await revokeRfqValidate({ rfqHeaderId }));
      // 校验信息
      validateQRModal({
        response: validateRes,
        successCallBack: warningOk,
        warningOk,
      });
    } catch (e) {
      throw e;
    }
  }, 1200);

  // 具体对应操作
  const handleCurrentOperation = (record = {}, operateItem = {}) => {
    const { operation = '' } = operateItem || {};
    switch (operation) {
      case 'VIEW_QUOTE':
        handleViewQuotationModal(record); // 查看报价
        break;
      case 'SEND_REMINDERS': // 发送提醒
        handleSendMessage({ currentRecord: record });
        break;
      case 'SELECTION': // 选用
        handleChooseFromList({ currentRecord: record });
        break;
      case 'REQUOTES': // 重新报价
        handleReQuote({ currentRecord: record });
        break;
      case 'PENDING': // 暂挂
        handleHold({ currentRecord: record });
        break;
      case 'OPERATION_RECORDS': // 操作记录
        handleOperationRecords({ currentRecord: record });
        break;
      case 'REVOKE': // 撤销
        handleRevokeRecord({ currentRecord: record });
        break;
      default:
        break;
    }
  };

  // 展示主要操作
  const displayMainAction = (record = {}, list = []) => {
    return (
      <div className={styles.mainAction}>
        {list?.length > 0
          ? list.map((item) => {
              return (
                <div className={styles['display-main-action']}>
                  <Button
                    funcType="link"
                    disabled={item.controllerType === 'disabled'}
                    onClick={() => handleCurrentOperation(record, item)}
                  >
                    {item.operationMeaning}
                  </Button>
                </div>
              );
            })
          : '-'}
      </div>
    );
  };

  // 展示更多操作
  const displayMoreAction = (record = {}, list = []) => {
    return (
      <Menu>
        {list?.length &&
          list.map((item) => {
            return (
              <Menu.Item
                className={styles.dropdownMoreOperate}
                onClick={() => handleCurrentOperation(record, item)}
                disabled={item.controllerType === 'disabled'}
              >
                {<a>{item.operationMeaning}</a>}
              </Menu.Item>
            );
          })}
      </Menu>
    );
  };

  // 展示更多操作描述
  const renderMoreLink = () => {
    return (
      <Button funcType="link" className={styles['quick-inquiry-more-link']}>
        {intl.get('ssrc.quickInquiry.model.quickInquiry.moreAction').d('更多')}
        <Icon type="expand_more" />
      </Button>
    );
  };

  /**
   * 最终需要展示的操作
   * @param {*} main 主操作
   * @param {*} more 更多操作
   * @returns VNode
   */
  const renderOperate = ({ record = {} }, aggregation) => {
    const { mainOperations = [], moreOperations = [] } =
      record?.get(['mainOperations', 'moreOperations']) || {};
    if (aggregation) {
      return (
        <>
          <div>{displayMainAction(record, mainOperations)}</div>
          {moreOperations?.length ? (
            <Dropdown
              overlay={displayMoreAction(record, moreOperations)}
              trigger={['click', 'hover']}
              placement="bottomLeft"
            >
              {renderMoreLink(record)}
            </Dropdown>
          ) : null}
        </>
      );
    } else {
      return (
        <div className={styles.action}>
          <div> {displayMainAction(record, mainOperations)} </div>
          {moreOperations?.length ? (
            <Dropdown
              overlay={displayMoreAction(record, moreOperations)}
              trigger={['click', 'hover']}
              placement="bottomLeft"
            >
              {renderMoreLink(record)}
            </Dropdown>
          ) : null}
        </div>
      );
    }
  };

  // 获取未勾选行数据 按钮气泡提示
  const getUnSelectedLineToolTips = () => {
    return intl.get('ssrc.quickInquiry.view.button.tooltip.select').d('请先勾选数据。');
  };

  // 渲染 发送提醒 提示语句
  const renderSendMessageTooltip = () => {
    // 未勾选数据 || 勾选数据在30分钟内 TODO
    const selectedLength = inQuotationDs?.selected?.length === 0;
    const invalidFlag = inQuotationDs?.selected?.some?.((item) => item.get('invalidFlag'));
    if (selectedLength) {
      return getUnSelectedLineToolTips();
    }

    if (invalidFlag) {
      return intl
        .get('ssrc.quickInquiry.view.button.tooltip.selectChoose')
        .d('勾选的数据存在无法发送提醒的行。');
    }

    return null;
  };

  // 获取查看报价底部按钮组
  const getQuotationModalFooter = ({ record }) => {
    const { quotationStatus = '' } = record?.get(['quotationStatus']) || {};
    const chooseFlag = ['QUOTED_OR_CONFIRM', 'QUOTED_OR_SELECT_FAIL'].includes(quotationStatus);
    const reQuoteFlag = ['QUOTED_OR_CONFIRM', 'QUOTED_OR_SELECT_FAIL', 'ABANDONED'].includes(
      quotationStatus
    );
    const buttons = [
      {
        name: 'operation',
        btnType: 'c7n-pro',
        btnProps: {
          onClick: () => quotationModalContentRef?.current?.handleOperation(),
        },
        child: intl.get('ssrc.quickInquiry.quickReply.view.button.operation').d('操作记录'),
      },
      {
        name: 'reQuote',
        btnType: 'c7n-pro',
        btnProps: {
          onClick: () => handleReQuote({ currentRecord: record, from: 'quotation-modal' }),
        },
        hidden: !reQuoteFlag,
        child: intl.get(`ssrc.quickInquiry.view.button.reQuote`).d('重新报价'),
      },
      {
        name: 'close',
        btnType: 'c7n-pro',
        btnProps: {
          color: chooseFlag ? 'default' : 'primary',
          onClick: () => quotationModalRef?.current?.close(),
        },
        child: intl.get('hzero.common.button.close').d('关闭'),
      },
      {
        name: 'chooseGroup',
        group: true,
        hidden: !chooseFlag,
        child: (fieldName = '') => (
          <Button name="chooseGroup">
            {fieldName || intl.get(`ssrc.quickInquiry.view.button.choose`).d('选用')}
            <Icon type="expand_more" />
          </Button>
        ),
        btnProps: {
          color: 'primary',
        },
        children: [
          {
            name: 'choose',
            btnType: 'c7n-pro',
            btnProps: {
              onClick: () => handleChooseFromModal({ currentRecord: record }),
              funcType: 'link',
            },
            child: intl.get(`ssrc.quickInquiry.view.button.choose`).d('选用'),
          },
          {
            name: 'chooseAndPending',
            btnType: 'c7n-pro',
            noNest: true,
            btnProps: {
              onClick: () =>
                handleChooseFromModal({ currentRecord: record, operatingType: 'SELECT_PENDING' }),
            },
            child: (fieldName = '') => (
              // help 暂不支持个性化(个性化配置气泡不生效)，个性化支持覆盖按钮名称节点
              <Button
                name="chooseAndPending"
                help={intl
                  .get('ssrc.quickInquiry.view.message.chooseAndPending.tips')
                  .d('其他行指当前批次下该物料其他供应商的报价行')}
                className={styles['quick-inquiry-choose-btn']}
              >
                {fieldName ||
                  intl.get(`ssrc.quickInquiry.view.button.chooseAndPending`).d('选用并暂挂其他行')}
              </Button>
            ),
          },
        ],
      },
    ];
    return buttons;
  };

  // 查看报价
  const handleViewQuotationModal = (record = {}) => {
    quotationModalRef.current = Modal.open({
      drawer: true,
      key: Modal.key(),
      className: commonStyles['ssrc-large-modal'],
      title: intl
        .get('ssrc.quickInquiry.quickReply.view.message.title.viewQuotation')
        .d('查看报价'),
      children: (
        <QuotationModal
          lineRecord={record}
          doubleUnitFlag={doubleUnitFlag}
          customizeTable={customizeTable}
          customizeCollapseForm={customizeCollapseForm}
          onShowQuoLadderLevelModal={showQuoLadderLevel}
          getQuotationModalFooter={getQuotationModalFooter}
          quotationModalContentRef={quotationModalContentRef}
          customizeBtnGroup={customizeBtnGroup}
          remote={remote}
        />
      ),
      footer: () => {
        return customizeBtnGroup(
          {
            code: 'SSRC.QUICK_INQUIRY.LIST.VIEW_QUOTE.BOTTOM_BUTTONS',
            pro: true,
          },
          <DynamicButtons buttons={getQuotationModalFooter({ record })} />
        );
      },
    });
  };

  // 查看未发布页签阶梯报价
  const showLadderLevel = (record = {}) => {
    if (isEmpty(record)) return;
    return Modal.open({
      key: 'quick-inquiry-ladder',
      title: intl.get('ssrc.quickInquiry.view.message.ladderQuotation').d('阶梯报价'),
      destroyOnClose: true,
      style: {
        width: 742,
      },
      drawer: true,
      okCancel: false,
      className: styles['quick-ladder-quotation-modal-wrapper'],
      okText: intl.get('hzero.common.button.close').d('关闭'),
      children: (
        <LadderLevelModal
          lineRecord={record}
          doubleUnitFlag={doubleUnitFlag}
          customizeTable={customizeTable}
          customizeCollapseForm={customizeCollapseForm}
        />
      ),
    });
  };

  // 查看其他页签阶梯报价
  const showQuoLadderLevel = (record = {}) => {
    if (isEmpty(record)) return;
    return Modal.open({
      key: 'quick-inquiry-ladder-quote',
      title: intl.get('ssrc.quickInquiry.view.message.ladderQuotation').d('阶梯报价'),
      destroyOnClose: true,
      style: {
        width: 742,
      },
      drawer: true,
      okCancel: false,
      className: styles['quick-ladder-quotation-modal-wrapper'],
      okText: intl.get('hzero.common.button.close').d('关闭'),
      children: (
        <QuoLadderLevelModal
          lineRecord={record}
          doubleUnitFlag={doubleUnitFlag}
          customizeTable={customizeTable}
          customizeCollapseForm={customizeCollapseForm}
        />
      ),
    });
  };

  // 获取未发布页签导出查询参数
  const getUnPublishedExportParams = () => {
    return {
      customizeUnitCode:
        'SSRC.QUICK_INQUIRY.LIST.UN_PUBLISHED_FILTER,SSRC.QUICK_INQUIRY.LIST.UN_PUBLISHED',
      ...(unpublishedDs.queryDataSet?.toData?.()?.[0] || {}),
    };
  };

  // 获取全部页签导出查询参数
  const getAllExportParams = () => {
    return {
      customizeUnitCode: 'SSRC.QUICK_INQUIRY.LIST.ALL_FILTER,SSRC.QUICK_INQUIRY.LIST.ALL',
      ...(allDs.queryDataSet?.toData?.()?.[0] || {}),
    };
  };

  const buttons = useMemo(() => {
    const sourceButtons = [
      {
        name: 'create',
        btnType: 'c7n-pro',
        btnProps: {
          icon: 'add',
          color: 'primary',
          onClick: handleCreate,
        },
        child: intl.get('hzero.common.button.create').d('新建'),
      },
      {
        name: 'batchOperate',
        group: true,
        hidden: ['unpublished', 'selectApproval', 'finish', 'all'].includes(activeKey),
        child: (fieldName = '') => (
          <Button name="batchOperate" icon="checklist" funcType="flat">
            {fieldName || intl.get('ssrc.quickInquiry.view.button.batchOperate').d('批量操作')}
            <Icon type="expand_more" />
          </Button>
        ),
        children: [
          {
            name: 'sendMessage',
            btnType: 'c7n-pro',
            hidden: [
              'unpublished',
              'inQuotation',
              'pending',
              'selectApproval',
              'finish',
              'all',
            ].includes(activeKey),
            btnProps: {
              onClick: () => handleSendMessage({ batchEditFlag: true }),
              // 未勾选数据 || 勾选数据在30分钟内 TODO
              disabled:
                inQuotationDs?.selected?.length === 0 ||
                inQuotationDs?.selected?.some?.((item) => item.get('invalidFlag')),
            },
            child: (fieldName = '') => (
              <Tooltip title={renderSendMessageTooltip()}>
                {fieldName || intl.get(`ssrc.quickInquiry.view.button.sendMessage`).d('发送提醒')}
              </Tooltip>
            ),
          },
          {
            name: 'choose',
            btnType: 'c7n-pro',
            hidden: ['unpublished', 'inQuotation', 'selectApproval', 'finish', 'all'].includes(
              activeKey
            ),
            btnProps: {
              onClick: () => handleChooseFromList({ batchEditFlag: true }),
              disabled: pendingDs?.selected?.length === 0,
            },
            child: (fieldName = '') => (
              <Tooltip
                title={pendingDs?.selected?.length === 0 ? getUnSelectedLineToolTips() : null}
              >
                {fieldName || intl.get(`ssrc.quickInquiry.view.button.choose`).d('选用')}
              </Tooltip>
            ),
          },
          {
            name: 'reQuote',
            btnType: 'c7n-pro',
            hidden: ['unpublished', 'inQuotation', 'selectApproval', 'finish', 'all'].includes(
              activeKey
            ),
            btnProps: {
              onClick: () => handleReQuote({ batchEditFlag: true }),
              disabled: pendingDs?.selected?.length === 0,
            },
            child: (fieldName = '') => (
              <Tooltip
                title={pendingDs?.selected?.length === 0 ? getUnSelectedLineToolTips() : null}
              >
                {fieldName || intl.get(`ssrc.quickInquiry.view.button.reQuote`).d('重新报价')}
              </Tooltip>
            ),
          },
          {
            name: 'hold',
            btnType: 'c7n-pro',
            hidden: ['unpublished', 'selectApproval', 'finish', 'all'].includes(activeKey),
            btnProps: {
              onClick: () => handleHold({ batchEditFlag: true }),
              disabled: tableDsMap[`${activeKey}Ds`]?.selected?.length === 0,
            },
            child: (fieldName = '') => (
              <Tooltip
                title={
                  tableDsMap[`${activeKey}Ds`]?.selected?.length === 0
                    ? getUnSelectedLineToolTips()
                    : null
                }
              >
                {fieldName || intl.get(`ssrc.quickInquiry.view.button.hold`).d('暂挂')}
              </Tooltip>
            ),
          },
        ],
      },
      {
        name: 'unPublishedExport',
        hidden: ['inQuotation', 'pending', 'selectApproval', 'finish', 'all'].includes(activeKey), // 未发布页签
        btnComp: ExcelExportPro,
        btnProps: {
          templateCode: 'SRM_C_SSRC_QUICK_RFQ_HEADER_UNPUBLISHED',
          name: 'unPublishedExport',
          requestUrl: `/ssrc/v1/${getCurrentOrganizationId()}/purchase/quick-rfq-quotations/list/export-unpublished`,
          method: 'GET',
          queryParams: getUnPublishedExportParams,
          otherButtonProps: {
            type: 'c7n-pro',
            funcType: 'flat',
          },
        },
      },
      {
        name: 'allExport',
        hidden: ['unpublished', 'inQuotation', 'pending', 'selectApproval', 'finish'].includes(
          activeKey
        ), // 全部页签
        btnComp: ExcelExportPro,
        btnProps: {
          templateCode: 'SRM_C_SSRC_QUICK_RFQ_HEADER_PUBLISHED',
          name: 'allExport',
          requestUrl: `/ssrc/v1/${getCurrentOrganizationId()}/purchase/quick-rfq-quotations/list/export-published`,
          method: 'GET',
          queryParams: getAllExportParams,
          otherButtonProps: {
            type: 'c7n-pro',
            funcType: 'flat',
          },
        },
      },
    ].filter(Boolean);
    const remoteButtons = remote
      ? remote.process('SSRC_QUICK_INQUIRY_WORKBENCH_LIST_PROCESS_HEADER_BUTTONS', sourceButtons, {
          unpublishedDs,
          activeKey,
          inQuotationDs,
          pendingDs,
          selectApprovalDs,
          finishDs,
          allDs,
          pageProps: props,
        })
      : buttons;
    return remoteButtons;
  }, [
    activeKey,
    inQuotationDs,
    inQuotationDs?.selected?.length,
    pendingDs?.selected?.length,
    pendingDs,
    unpublishedDs,
    allDs,
    getUnPublishedExportParams,
    getAllExportParams,
    tableDsMap[`${activeKey}Ds`],
    remote,
    selectApprovalDs,
    finishDs,
  ]);

  const commonProps = {
    remote,
    customizeTable,
    tableDisplayMap,
    doubleUnitFlag,
    renderOperate,
    handleChooseFromList,
    onHandleJumpDetail: handleJumpDetail,
    onChangeAggregation: changeAggregation,
  };

  const unpublishedProps = {
    ...(commonProps || {}),
    dataSet: unpublishedDs,
    onShowLadderLevelModal: showLadderLevel,
  };

  const inQuotationProps = {
    ...(commonProps || {}),
    dataSet: inQuotationDs,
    onShowQuoLadderLevelModal: showQuoLadderLevel,
  };

  const pendingProps = {
    ...(commonProps || {}),
    dataSet: pendingDs,
    onShowQuoLadderLevelModal: showQuoLadderLevel,
  };

  const selectApprovalProps = {
    ...(commonProps || {}),
    dataSet: selectApprovalDs,
    onShowQuoLadderLevelModal: showQuoLadderLevel,
    onShowPriceAdjustmentModal: showPriceAdjustmentModal,
  };

  const finishProps = {
    ...(commonProps || {}),
    dataSet: finishDs,
    onShowQuoLadderLevelModal: showQuoLadderLevel,
    onShowPriceAdjustmentModal: showPriceAdjustmentModal,
  };

  const allProps = {
    ...(commonProps || {}),
    dataSet: allDs,
    onShowQuoLadderLevelModal: showQuoLadderLevel,
    onShowPriceAdjustmentModal: showPriceAdjustmentModal,
  };

  return (
    <>
      <Header
        title={intl.get('ssrc.quickInquiry.view.message.title.expertWorkBench').d('快速询价工作台')}
      >
        {customizeBtnGroup(
          {
            code: 'SSRC.QUICK_INQUIRY.LIST.HEADER_BUTTONS',
            pro: true,
          },
          <DynamicButtons buttons={buttons} />
        )}
      </Header>
      <Content>
        <Spin spinning={loading}>
          {customizeTabPane(
            {
              code: 'SSRC.QUICK_INQUIRY.LIST.TABS',
            },
            <Tabs
              activeKey={activeKey}
              onChange={changeTabs}
              className={styles['quick-inquiry-tabs']}
              animated={false}
            >
              <TabPane
                tab={intl.get('ssrc.quickInquiry.view.tab.unpublished').d('未发布')}
                key="unpublished"
                overflowCount={99}
                count={unpublishedDs?.totalCount}
              >
                <Unpublished {...unpublishedProps} />
              </TabPane>
              <TabPane
                tab={intl.get('ssrc.quickInquiry.view.tab.inQuotation').d('报价中')}
                key="inQuotation"
                overflowCount={99}
                count={inQuotationDs?.totalCount}
              >
                <InQuotation {...inQuotationProps} />
              </TabPane>
              <TabPane
                tab={intl.get('ssrc.quickInquiry.view.tab.pending').d('待处理')}
                key="pending"
                overflowCount={99}
                count={pendingDs?.totalCount}
              >
                <Pending {...pendingProps} />
              </TabPane>
              <TabPane
                tab={intl.get('ssrc.quickInquiry.view.tab.selectApproval').d('选用审批')}
                key="selectApproval"
                overflowCount={99}
                count={selectApprovalDs?.totalCount}
              >
                <SelectApproval {...selectApprovalProps} />
              </TabPane>
              <TabPane
                tab={intl.get('ssrc.quickInquiry.view.tab.finish').d('完成')}
                key="finish"
                overflowCount={99}
                count={finishDs?.totalCount}
              >
                <Finish {...finishProps} />
              </TabPane>
              <TabPane
                tab={intl.get('ssrc.quickInquiry.view.tab.all').d('全部')}
                key="all"
                overflowCount={99}
                count={allDs?.totalCount}
              >
                <All {...allProps} />
              </TabPane>
            </Tabs>
          )}
        </Spin>
      </Content>
    </>
  );
};

export default compose(
  IsOpenDoubleUnitHOC(),
  WithCustomizeC7N({
    unitCode: [
      `SSRC.QUICK_INQUIRY.LIST.HEADER_BUTTONS`, // 头部按钮组
      `SSRC.QUICK_INQUIRY.LIST.TABS`, // 标签页
      `SSRC.QUICK_INQUIRY.LIST.UN_PUBLISHED`, // 表格-未发布
      `SSRC.QUICK_INQUIRY.LIST.IN_QUOTATION`, // 表格-报价中
      `SSRC.QUICK_INQUIRY.LIST.PENDING`, // 表格-待处理
      `SSRC.QUICK_INQUIRY.LIST.SELECT_APPROVAL`, // 表格-选用审批
      `SSRC.QUICK_INQUIRY.LIST.FINISH`, // 表格-完成
      `SSRC.QUICK_INQUIRY.LIST.ALL`, // 表格-全部
      `SSRC.QUICK_INQUIRY.LIST.UN_PUBLISHED_FILTER`, // 筛选器-未发布
      `SSRC.QUICK_INQUIRY.LIST.IN_QUOTATION_FILTER`, // 筛选器-报价中
      `SSRC.QUICK_INQUIRY.LIST.PENDING_FILTER`, // 筛选器-待处理
      `SSRC.QUICK_INQUIRY.LIST.SELECT_APPROVAL_FILTER`, // 筛选器-选用审批
      `SSRC.QUICK_INQUIRY.LIST.FINISH_FILTER`, // 筛选器-完成
      `SSRC.QUICK_INQUIRY.LIST.ALL_FILTER`, // 筛选器-全部
      'SSRC.QUICK_INQUIRY.LIST.LADDER_QUOTATION_HEADER', // 待发布-阶梯报价头-表单
      `SSRC.QUICK_INQUIRY.LIST.LADDER_QUOTATION`, // 待发布-阶梯报价行-表格
      'SSRC.QUICK_INQUIRY.LIST.QUO_LADDER_QUOTATION_HEADER', // 其他tab标签页表格/查看报价/查看批次-阶梯报价头-表单
      `SSRC.QUICK_INQUIRY.LIST.QUO_LADDER_QUOTATION`, // 其他tab标签页表格/查看报价/查看批次-阶梯报价行-表格
      'SSRC.QUICK_INQUIRY.LIST.VIEW_BATCH_NO_LINE_FILTER', // 筛选器-查看批次
      `SSRC.QUICK_INQUIRY.LIST.VIEW_BATCH_NO_LINE`, // 查看批次-表格
      'SSRC.QUICK_INQUIRY.LIST.VIEW_QUOTE.SUPPLIER_FORM', // 查看报价-供应商信息-表单
      'SSRC.QUICK_INQUIRY.LIST.VIEW_QUOTE.QUOTE_FORM', // 查看报价-报价信息-表单
      'SSRC.QUICK_INQUIRY.LIST.VIEW_QUOTE.QUOTE_LINES', // 查看报价-关联报价行-表格
      'SSRC.QUICK_INQUIRY.LIST.VIEW_QUOTE.BOTTOM_BUTTONS', // 查看报价-底部按钮组-按钮组
      'SSRC.QUICK_INQUIRY.LIST.RE_QUOTE_FORM', // 重新报价
    ],
  }),
  formatterCollections({
    code: ['ssrc.quickInquiry', 'hzero.common', 'ssrc.common', 'scux.ssrc'],
  }),
  remotes(
    {
      code: 'SSRC_QUICK_INQUIRY_WORKBENCH_LIST',
      name: 'remote',
    },
    {
      events: {
        async beforeReoteFormSubmit() {
          return true;
        },
        beforeOpenReQuoteModal() {},
        remoteShowPriceAdjustmentModal() {
          return true;
        },
      },
    }
  ),
  withProps(
    (props) => {
      // 缓存tab标签页 进入快速询价工作台 默认待处理页签
      const activeKeyTab = { key: 'pending' };
      const { remote } = props || {};

      // 缓存dataset
      const unpublishedDs = new DataSet(
        tableDS({
          module: 'PENDING',
          selection: false,
          customizeUnitCode: 'SSRC.QUICK_INQUIRY.LIST.UN_PUBLISHED',
          filterCode: 'SSRC.QUICK_INQUIRY.LIST.UN_PUBLISHED_FILTER',
          remote,
        })
      );
      const inQuotationDs = new DataSet(
        tableDS({
          module: 'IN_QUOTATION',
          selection: 'multiple',
          customizeUnitCode: 'SSRC.QUICK_INQUIRY.LIST.IN_QUOTATION',
          filterCode: 'SSRC.QUICK_INQUIRY.LIST.IN_QUOTATION_FILTER',
        })
      );
      const pendingDs = new DataSet(
        tableDS({
          module: 'CONFIRM',
          selection: 'multiple',
          customizeUnitCode: 'SSRC.QUICK_INQUIRY.LIST.PENDING',
          filterCode: 'SSRC.QUICK_INQUIRY.LIST.PENDING_FILTER',
        })
      );
      const selectApprovalDs = new DataSet(
        tableDS({
          module: 'SELECT_APPROVING',
          selection: false,
          customizeUnitCode: 'SSRC.QUICK_INQUIRY.LIST.SELECT_APPROVAL',
          filterCode: 'SSRC.QUICK_INQUIRY.LIST.SELECT_APPROVAL_FILTER',
        })
      );
      const finishDs = new DataSet(
        tableDS({
          module: 'FINISHED',
          selection: false,
          customizeUnitCode: 'SSRC.QUICK_INQUIRY.LIST.FINISH',
          filterCode: 'SSRC.QUICK_INQUIRY.LIST.FINISH_FILTER',
        })
      );
      const allDs = new DataSet(
        tableDS({
          module: 'ALL',
          selection: false,
          customizeUnitCode: 'SSRC.QUICK_INQUIRY.LIST.ALL',
          filterCode: 'SSRC.QUICK_INQUIRY.LIST.ALL_FILTER',
        })
      );
      // 缓存表格视图，默认为平铺视图

      const tableDisplayMap = {
        unpublished: { isAggregation: false },
        inQuotation: { isAggregation: false },
        pending: { isAggregation: false },
        selectApproval: { isAggregation: false },
        finish: { isAggregation: false },
        all: { isAggregation: false },
      };
      return {
        activeKeyTab,
        tableDsMap: {
          unpublishedDs,
          inQuotationDs,
          pendingDs,
          selectApprovalDs,
          finishDs,
          allDs,
        },
        tableDisplayMap,
      };
    },
    { cacheState: true }
  )
)(observer(Index));
