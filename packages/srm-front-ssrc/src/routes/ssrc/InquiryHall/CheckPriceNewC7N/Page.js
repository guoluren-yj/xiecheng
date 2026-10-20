/**
 * 新版重构核价
 */
import React, { useState, useCallback, useRef, useMemo, useEffect, useContext, memo } from 'react';
import { Badge, Divider } from 'choerodon-ui';
import classnames from 'classnames';
import querystring from 'querystring';
// import { getActiveTabKey } from 'utils/menuTab';
import { noop, isEmpty, omit, map, isNil, isObject, throttle } from 'lodash';
import { useComputed, observer } from 'mobx-react-lite';
import {
  Button,
  notification,
  Spin,
  Icon,
  Modal,
  DataSet,
  useModal,
  Tooltip,
  // useDataSet,
} from 'choerodon-ui/pro';
import PrintProButton from 'srm-front-boot/lib/components/PrintProButton';

import { getCheckPriceName, INQUIRY } from '@/utils/globalVariable';
import { HOCPriceComparison as PriceComparison } from '@/routes/ssrc/components/PriceComparison';
import BidPriceComparison from '@/routes/ssrc/components/PriceComparison/BidIndex';
import ExchangeEditModal from '@/routes/ssrc/components/ExchangeEditModals/ExchangeEditModal';
import useOperationRecordModal from '@/routes/components/OperationRecord/useModal';
import useBidAnnouncementModal from '@/routes/ssrc/components/BidAnnouncement';
import {
  querySyncData,
  saveCheckPrice,
  cleanCheckPrice,
  saveAutoData,
  submitCheckPrice,
  fetchAttachmentCount,
  // fetchNewCheckPriceUserMemory,
  // exportCheckPriceData,
  submitCheckPriceByItem,
  fetchExchangeRate,
} from '@/services/checkPriceNewService';
import {
  queryProcessAttachmentConfig,
  querySslmLifeCycleConfig,
  queryH0OrC7N,
  queryConfigurationOldRate,
} from '@/services/commonService';
import CommonImportNew from 'components/Import';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { dateFormate, getJumpRoutePrefixUrl, queryBidFileTemplateConfig } from '@/utils/utils';
import BargainRuleModal from '@/routes/ssrc/InquiryHall/CheckPrice/components/BargainRuleModal.js';
import {
  // inquiryAgain as queryInquiryAgain,
  fetchOpenBargain,
  saveExchangeEdit,
  querySupplierExchangeEdit,
} from '@/services/inquiryHallService';
// import { fetchConfigSheet } from '@/services/inquiryHallNewService';
import { fetchNewQuotationConfigSheet } from '@/services/supplierQutationService';

import intl from 'utils/intl';
import { Header } from 'components/Page';
import { SRM_SSRC } from '_utils/config';
import DynamicButtons from '_components/DynamicButtons';
import { getResponse, getEditTableData } from 'utils/utils';
import { downloadFile } from 'hzero-front/lib/services/api';
import DownloadAttachments from '@/routes/ssrc/components/DownloadAttachments';
import QuoteExchangeMainDateModal from '@/routes/ssrc/components/ExchangeEditModals/QuoteExchangeMainDateModal';
import ApplyToSection from '@/routes/ssrc/RFSupplierQuotation/Quotation/Modals/ApplyToSection.js';
import { openC7nProcessAttachmentModal } from '@/routes/components/processAttachment';
import PriceClarificationButtons from '@/routes/ssrc/InquiryHall/CheckPrice/components/PriceClarificationButtonsWrap.js';
import { ReactComponent as RoundQuotation } from '@/assets/roundQuotation.svg';
import injectGuide from 'srm-front-boot/lib/components/Guide/injectGuideList';

import FileTemplateAttachmentCheckPricePage from '@/routes/components/FileTemplateAttachmentCheckPricePage';
import ChatRoomSourceLink from '@/routes/components/ChatRoomSource/ChatRoomSourceLink';
import styles from './index.less';
import Card from './components/Card';
import ItemTable from './Tables/ItemTable';
import HeaderForm from './Header/HeaderForm';
import { PrefixCls, itemLinePageSize, GroupTableConfigEnum } from './utils/constant';
import commonStyles from './common/index.less';
import SectionPanel from './components/SectionPanel';
import { StoreContext } from './store/StoreProvider';
import { generateTreeByGroup, computedColumnCellEditable } from './Tables/helpers';
import AttachmentGroup from './Attachments/AttachmentGroup';
// import HelpMessageSection from './components/HelpMessageSection';
import BargainOnline from './components/BargainOnline';
import { returnToPretrialDS } from './store/subModel';
import { createItemDS, updateItemDS } from './store/supplementaryItemDS';
import SupplementaryItemDrawer from './components/SupplementaryItemDrawer';
import ReturnToPretrial from './components/returnToPretrial';
import SelectionModal from './components/selectionModal';

const promptCode = 'ssrc.inquiryHall';

const selectionStrategyMap = () => ({
  MAX_PRICE_WIN: intl.get('ssrc.inquiryHall.model.inquiryHall.maxPriceBidding').d('最高价中标'),
  MIN_PRICE_WIN: intl.get('ssrc.inquiryHall.model.inquiryHall.minPriceBidding').d('最低价中标'),
  FIRST_SCORE_WIN: intl
    .get('ssrc.inquiryHall.model.inquiryHall.scoreFirstBidding')
    .d('评分第一中标'),
  ITEM: intl.get(`${promptCode}.model.inquiryHall.materialDimension`).d('物料维度'),
  ALL: intl.get(`${promptCode}.model.inquiryHall.wholeSingleDimension`).d('整单维度'),
});

const { openModal } = useOperationRecordModal();

const { openBidAnnouncementModal } = useBidAnnouncementModal();

const guideConfig = () => [
  {
    // 该向导组是否启用
    enable: true,
    // 向导组编码
    code: 'CHECK_PRICE_GUIDE',
    // 向导组类型
    type: 'strong',
    // 向导组优先级，在多个向导同时满足条件时，数值大的优先显示
    priority: 1,
    // 版本，每次向导配置变更时，版本号+1，约定为数字
    version: 6,
    // 延时，在满足条件后多少毫秒显示弹窗，解决部分页面向导元素有过渡效果的问题
    delay: 1000,
    // 是否为可选步骤，当该选项为true时，向导组内的各步骤遵循哪一步满足条件哪一步显示，直到整个向导组均已被阅读过为止
    optionalSteps: false,
    steps: [
      {
        selector: '.button-group-right',
        title: intl.get('ssrc.inquiryHall.view.title.viewSwitching').d('视图切换'),
        htmlText: intl
          .get('ssrc.inquiryHall.view.message.guideTwoContent')
          .d(
            '核价提供聚合、平铺二种视图，可根据使用习惯、对比场景切换视图，聚合视图下可点击左侧按钮对表格进行展开收起。'
          ),
        placement: 'left',
      },
      {
        selector: '.quotation_table',
        title: intl.get('ssrc.inquiryHall.view.title.selectItem').d('选用物料'),
        htmlText: intl
          .get('ssrc.inquiryHall.view.message.guideThreeContent')
          .d(
            '根据按物料选用或整单选用，可在聚合表模式下直接点击物料的报价信息或供应商名称进行选用操作，其中红色印章代表被选用。'
          ),
        placement: 'top',
      },
      {
        selector: '.submit',
        title: intl.get('ssrc.inquiryHall.view.title.submitCheckPrice').d('提交核价'),
        htmlText: intl
          .get('ssrc.inquiryHall.view.message.guideFourContent')
          .d('核价员在聚合或平铺视图完成核价后，点击“提交”按钮，完成本次核价。'),
        placement: 'left',
      },
    ],
  },
];

const fieldMeaningMap = {
  item: 'ITEM',
  all: 'ALL',
  maxPriceWin: 'MAX_PRICE_WIN',
  minPriceWin: 'MIN_PRICE_WIN',
  firstScoreWin: 'FIRST_SCORE_WIN',
};

const Page = () => {
  const {
    path,
    match,
    onLoad,
    history,
    bidFlag,
    pubFlag,
    isSection,
    sourceKey,
    detailFlag,
    custConfig,
    routerParams,
    onFormLoaded,
    organizationId,
    customizeBtnGroup,
    commonDs: { headerDs, shareDs, itemDs, wholePackageDs, scoreDs },
    routeParams: { rfxHeaderId },
    pubRouterAddParams = () => {},
    customizeTable = noop,
    remote,
    isTechExpertFlag = false,
  } = useContext(StoreContext);
  const itemLineRef = useRef(null);
  // const [showFlag, setShowFlag] = useState(true); // 是否展示帮助提示信息
  const [saveOrSubmitLoading, setSaveOrSubmitLoading] = useState(false);
  // const [priceComparisonModalVisible, setPriceComparisonModalVisible] = useState(false); // 比价助手
  const [sectionFlag, setSectionFlag] = useState(false); // 真实可靠的标段flag
  const [onlineBargainVisible, setOnlineBargainVisible] = useState(false); // 线上议价
  const [saveExchangeEditLoading, setSaveExchangeEditLoading] = useState(false); // 汇率编辑loading
  const [exchangeEditContentModalVisible, setExchangeEditContentModalVisible] = useState(false); // 汇率编辑 contnet visible
  const [exchangeEditModalVisible, setExchangeEditModalVisible] = useState(false); // 汇率编辑 visible
  const [processAttachmentNewUIFlag, setProcessAttachmentNewUIFlag] = useState(false); // 是否使用新过程附件下载
  const [attachemntCount, setAttachemntCount] = useState('');
  const [attachmentNewUILoading, setAttachmentNewUILoading] = useState(true); // 过程附件下载loading
  const [dimensionCode, setDimensionCode] = useState(null); // 选用维度
  const [processVisible, setProcessVisible] = useState(false);
  const [newQuotationFlag, setNewQuotationFlag] = useState(0); // 启用新报价标识
  const [exchangConfigLoading, setExchangConfigLoading] = useState(true); // 汇率编辑配置表是否查完
  const [showExchangeEdit, setShowExchangeEdit] = useState(false);
  const [checkItemLineHigh, setCheckItemLineHigh] = useState(false);
  const [strategyVisible, setStrategyVisible] = useState(false);
  const [initFlag, setInitFlag] = useState(false);
  const [checkQuotationLineHigh, setCheckQuotationLineHigh] = useState(false);
  const [sslmLifeCycleFlag, setSslmLifeCycleFlag] = useState(false);
  const [exchangeEditSupplierList, setExchangeEditSupplierList] = useState([]);
  const [bargainNewFlag, setBargainNewFlag] = useState(false);
  const [timestamp, setTimestamp] = useState(''); // 风险关系时间戳
  const [fileTemplateManageFlag, setFileTemplateManageFlag] = useState(0); // 招标文件tab
  const [useNewRateFlag, setUseNewRateFlag] = useState(0); // 是否使用老重合率标识

  const activeTabKey = useMemo(() => getJumpRoutePrefixUrl(location.pathname), []);

  const { current: headerCurrent } = headerDs;

  const sourceCategory = headerCurrent && headerCurrent.get('sourceCategory');
  const diyLadderQuotationFlag = headerCurrent && headerCurrent.get('diyLadderQuotationFlag');
  const checkSelectionDimension = headerCurrent && headerCurrent.get('checkSelectionDimension');

  const modal = useModal();
  const itemTableRef = useRef(null);
  const scoreTableRef = useRef(null);
  const stdCol = useRef([]);
  const extCol = useRef([]);
  const viceStdCol = useRef([]);
  const viceExtCol = useRef([]);
  const mainExtCol = useRef([]);
  const mainStdCol = useRef([]);
  const curAggregation = useRef(null);
  const criteriaConfig = useRef([]);
  const dimensionConfig = useRef([]);
  const defaultCriteria = useRef(null);
  const defaultDimension = useRef(null);
  const itemGroupTableConfig = useRef({ itemTableGroupPageSize: itemLinePageSize }); // 聚合表配置项
  const attachmentTableRef = useRef({});

  const { itemTableGroupPageSize } = itemGroupTableConfig.current || {};

  useEffect(() => {
    fetchConfigAssemble();
    dimensionConfig.current =
      custConfig[
        bidFlag
          ? 'SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.SELECT_DIMENSION'
          : 'SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.SELECT_DIMENSION'
      ]?.fields;

    criteriaConfig.current =
      custConfig[
        bidFlag
          ? 'SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.SELECTIONCRITERIA'
          : 'SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.SELECTIONCRITERIA'
      ]?.fields;

    defaultCriteria.current =
      fieldMeaningMap[
        criteriaConfig.current?.filter((item) => item.defaultActive === 1)[0]?.fieldCode
      ];

    defaultDimension.current =
      fieldMeaningMap[
        dimensionConfig.current?.filter((item) => item.defaultActive === 1)[0]?.fieldCode
      ];

    handeleSearchQuerySourceExchangeRateConfig();
    handeleSearchProcessAttachmentConfig();
    newQuotationConfigSheet();
    // newCheckLineHighConfigSheet();
    injectGuide(`${activeTabKey}/check-price/:rfxId`, guideConfig);
    querySslmLifeCycleConfigConfigSheet();
    queryFileTemplateManageSheetConfig();
    fetchUseOldRate();
    if (onLoad) {
      onLoad({
        submit: workFlowApproval,
      });
      if (onFormLoaded && typeof onFormLoaded === 'function') {
        onFormLoaded(true);
      }
      return () => {
        document.body.style.cursor = '';
      };
    }
  }, [rfxHeaderId]);

  const workFlowApproval = (approveResult) => {
    return new Promise((resolve, reject) => {
      if (approveResult === 'Approved') {
        if (
          remote &&
          (typeof remote?.process
            ?.SSRC_CHECK_PRICE_NEW_C7N_PROCESS_SUBMIT_SUPPLEMENTARYITEM_WORKFLOW === 'function' ||
            typeof remote?.props?.process
              ?.SSRC_CHECK_PRICE_NEW_C7N_PROCESS_SUBMIT_SUPPLEMENTARYITEM_WORKFLOW === 'function')
        ) {
          remote.process('SSRC_CHECK_PRICE_NEW_C7N_PROCESS_SUBMIT_SUPPLEMENTARYITEM_WORKFLOW', {
            headerDs,
            shareDs,
            itemDs,
            wholePackageDs,
            dimensionCode,
            resolve,
            reject,
            getLinedata,
          });
          return;
        }
        resolve();
      }
      resolve();
    });
  };

  // 查询重合率配置表
  const fetchUseOldRate = async () => {
    const res = await queryConfigurationOldRate();
    if (getResponse(res)) {
      if (!isEmpty(res) && res[0]?.whiteFlag === '0') {
        setUseNewRateFlag(0);
      } else {
        setUseNewRateFlag(1);
      }
    }
  };

  const queryAttachmentCount = async (newCheckFlag) => {
    const result = getResponse(
      await fetchAttachmentCount({ rfxHeaderId, newCheckFlag: newCheckFlag ? 1 : 0 })
    );
    if (result) {
      setAttachemntCount(Number(result?.fileCount || 0) > 99 ? '99+' : result?.fileCount);
    }
  };

  // 查询招标文件模板管理配置
  const queryFileTemplateManageSheetConfig = async () => {
    const flag = await queryBidFileTemplateConfig();
    setFileTemplateManageFlag(flag);
  };

  // 查询当前单据 配置表 是否使用新报价
  const newQuotationConfigSheet = async () => {
    let newQuotationValueFlag = false;
    if (!rfxHeaderId) {
      return;
    }

    const param = {
      organizationId,
      rfxHeaderId,
    };

    let result = null;
    try {
      result = await fetchNewQuotationConfigSheet(param);
      result = getResponse(result);

      if (result === 1) {
        newQuotationValueFlag = 1;
        setNewQuotationFlag(newQuotationValueFlag);
      }
    } catch (e) {
      throw e;
    }

    return newQuotationValueFlag;
  };

  // 查询当前单据 配置表 是否使用新360
  const querySslmLifeCycleConfigConfigSheet = async () => {
    try {
      const result = getResponse(await querySslmLifeCycleConfig());

      if (result) {
        setSslmLifeCycleFlag(!!result?.length);
      }
    } catch (e) {
      throw e;
    }
  };

  /**
   * 查询过程下载附件配置表
   */
  const handeleSearchProcessAttachmentConfig = async () => {
    try {
      const result = getResponse(await queryProcessAttachmentConfig());
      if (result) {
        setProcessAttachmentNewUIFlag(!result?.length);
        queryAttachmentCount(!result?.length);
      }
    } finally {
      setAttachmentNewUILoading(false);
    }
  };

  /**
   * 查询使用新汇率编辑配置表
   */
  const handeleSearchQuerySourceExchangeRateConfig = async () => {
    try {
      if (!pubFlag && !detailFlag) {
        const res = getResponse(
          // auto-save
          await fetchExchangeRate({
            sourceHeaderId: rfxHeaderId,
            checkSelectionDimension: defaultDimension.current,
            checkRecommendationStrategyDetail: defaultCriteria.current,
          })
        );
        if (res) {
          if (res.autoExchangeRateFlag === 0) {
            setShowExchangeEdit(true);
          }
        }
      }
    } finally {
      headerDs.query();
      handleQuerySyncData();
      setExchangConfigLoading(false);
    }
  };

  // const newCheckLineHighConfigSheet = async () => {
  //   let newQuotationValueFlag = false;
  //   if (!rfxHeaderId) {
  //     return;
  //   }

  //   const params = {
  //     organizationId,
  //     configCode: 'ssrc_new_check_line_high_config',
  //     data: {
  //       tenantNum: getCurrentTenant().tenantNum,
  //     },
  //   };

  //   let result = null;
  //   try {
  //     result = await fetchConfigSheet(params);
  //     result = getResponse(result);

  //     if (!isEmpty(result) && isArray(result)) {
  //       newQuotationValueFlag = result;
  //       setCheckItemLineHigh(result[0]?.item);
  //       setCheckQuotationLineHigh(result[0]?.quotation);
  //     }
  //   } catch (e) {
  //     throw e;
  //   }

  //   return newQuotationValueFlag;
  // };

  const currentConfigCategoryValue = (option = {}) => {
    const { category, item } = option || {};
    const { function: configCategory, value1 = null, whiteFlag = '0' } = item || {};

    let value = '';
    const readAble = configCategory === category && value1 && !isNaN(value1) && whiteFlag === '1';
    if (readAble) {
      value = value1;
    }
    return value;
  };

  // 查询是否启用c7n版功能
  const fetchConfigAssemble = async () => {
    const res = await queryH0OrC7N();
    if (!isEmpty(res)) {
      let newBargain = false;
      let itemLineGroupTablePageSize = '';
      let checkItemLineHighValue = '';
      let checkQuotationLineHighValue = '';

      res.forEach((item) => {
        const { function: configCategory, whiteFlag = '0', value1 = null } = item || {};
        if (configCategory === GroupTableConfigEnum.bargain && whiteFlag === '1') {
          newBargain = true;
        }

        if (currentConfigCategoryValue({ category: GroupTableConfigEnum.itemPageSize, item })) {
          itemLineGroupTablePageSize = value1;
        }

        if (
          currentConfigCategoryValue({ category: GroupTableConfigEnum.checkItemLineHigh, item })
        ) {
          checkItemLineHighValue = value1;
        }

        if (
          currentConfigCategoryValue({
            category: GroupTableConfigEnum.checkQuotationLineHigh,
            item,
          })
        ) {
          checkQuotationLineHighValue = value1;
        }
      });

      setBargainNewFlag(newBargain);

      if (itemLineGroupTablePageSize) {
        cacheItemPosition.current.end = itemLineGroupTablePageSize;
        itemGroupTableConfig.current.itemTableGroupPageSize = itemLineGroupTablePageSize;
      }
      if (checkItemLineHighValue) {
        setCheckItemLineHigh(checkItemLineHighValue);
      }
      if (checkQuotationLineHighValue) {
        setCheckQuotationLineHigh(checkQuotationLineHighValue);
      }
    }
  };

  // 通用校验
  const validatePreInterface = useCallback(async () => {
    return new Promise(async (resolve) => {
      // const { dimensionCode } = itemLineRef.current || {};
      const curDimensionCode = dimensionCode || shareDs.getState('dimensionCode');
      const currentDimensionDs = curDimensionCode === 'ITEM' ? itemDs : wholePackageDs;
      const promises = [];
      const extColColName = extCol.current.map((item) => item.name);
      const viceExtColName = viceExtCol.current.map((item) => item.name);
      const mainExtColName = mainExtCol.current.map((item) => item.name);
      // 手动判断字段级校验
      currentDimensionDs.forEach((record) => {
        if (curAggregation.current ? computedColumnCellEditable(record) : !record.disabled) {
          currentDimensionDs.fields.forEach((field) => {
            if (field.get('required', record)) {
              if (curAggregation.current === false) {
                if (
                  (curDimensionCode === 'ITEM' && viceExtColName.includes(field.name)) ||
                  (curDimensionCode !== 'ITEM' &&
                    [...extColColName, ...mainExtColName].includes(field.name))
                ) {
                  return;
                }
              } else if (curDimensionCode !== 'ITEM' && !record.get('isGroupRecord')) {
                return;
              }
              promises.push(field.checkValidity(record));
            }
          });
        }
      });
      const attachmentTableValidate = validateAttachmentListTableDS();

      // 表格的校验结果
      const validateFlags = await Promise.all([
        headerDs.validate(),
        attachmentTableValidate,
        ...promises,
      ]);
      if (validateFlags.some((flag) => !flag)) {
        console.log('error', currentDimensionDs.getValidationErrors());
        notification.error({
          message: intl.get(`${promptCode}.message.validation.requiredInput`).d('请填写必填项！'),
        });
        resolve(false);
      }
      resolve(true);
    });
  }, [itemDs, wholePackageDs, itemLineRef, dimensionCode, shareDs.getState('dimensionCode')]);

  /**
   * 查询异步数据
   */
  const handleQuerySyncData = useCallback(async () => {
    const res = getResponse(
      await querySyncData({
        rfxHeaderId,
        checkSelectionDimension: shareDs.getState('dimensionCode'),
        checkRecommendationStrategyDetail: shareDs.getState('checkRecommendationStrategyDetail'),
        ...pubRouterAddParams(),
      })
    );
    if (res) {
      shareDs.setState('suggestSupplierCount', res.suggestSupplierCount);
      shareDs.setState('qutationSupplierSize', res.qutationSupplierSize);
      shareDs.setState('totalPrice', res.totalPrice);
      shareDs.setState('allItemCount', res.allItemCount);
      shareDs.setState('checkRecommendationFlag', res.checkRecommendationFlag);
    }
  }, [
    rfxHeaderId,
    shareDs.getState('dimensionCode'),
    shareDs.getState('checkRecommendationStrategyDetail'),
  ]);

  // 附件表格 字段类型个性化，表格列个性化 个性化在组件内部，外部使用只能固定
  const getAttachmentLineTableAndColumnsCustomizeUnitCode = () => {
    let code =
      'SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.ATTACHMENT_TABLE_COLUMNS,SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.ATTACHMENT_TABLE';

    if (bidFlag) {
      code =
        'SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.ATTACHMENT_TABLE_COLUMNS,SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.ATTACHMENT_TABLE';
    }

    return code;
  };

  const refreshAttachmentListTable = () => {
    if (fileTemplateManageFlag !== 1) {
      return;
    }

    const { lineDS } = attachmentTableRef.current || {};

    if (lineDS) {
      lineDS.query();
    }
  };

  // 附件表格数据校验
  const getAttachmentListTableData = () => {
    const { getAttachmentListData } = attachmentTableRef.current || {};

    if (fileTemplateManageFlag !== 1) {
      return;
    }

    if (!getAttachmentListData) {
      return;
    }

    const attachmentLineList = getAttachmentListData() || [];

    return attachmentLineList;
  };

  // 附件表格数据校验
  const validateAttachmentListTableDS = async () => {
    if (fileTemplateManageFlag !== 1) {
      return true;
    }

    const { validateAttachmentListTable } = attachmentTableRef.current || {};

    if (!validateAttachmentListTable) {
      return true;
    }

    const attachmentTableValidate = await validateAttachmentListTable();

    return attachmentTableValidate;
  };

  // 获取主要行数据
  const getLinedata = useCallback(
    (ds) => {
      // const { dimensionCode } = itemLineRef.current || {};
      const curDimensionCode = dimensionCode || shareDs.getState('dimensionCode');
      const currentDimensionDs = ds || (curDimensionCode === 'ITEM' ? itemDs : wholePackageDs);
      return currentDimensionDs.toJSONData().map((recordData) => ({
        ...recordData,
        allottedRatio: shareDs.getState('checkWay') === 'ratio' ? recordData.allottedRatio : null,
        allottedQuantity:
          shareDs.getState('checkWay') === 'quantity' ? recordData.allottedQuantity : null,
        allottedSecondaryQuantity:
          shareDs.getState('checkWay') === 'quantity' ? recordData.allottedSecondaryQuantity : null,
        customizeFieldDirty: recordData.customizeFieldDirty,
      }));
    },
    [
      itemLineRef,
      itemDs,
      wholePackageDs,
      shareDs.getState('checkWay'),
      dimensionCode,
      shareDs.getState('dimensionCode'),
    ]
  );

  /**
   * 补充物料弹窗
   * footer bottons
   *
   */
  const supplementaryItemDrawerFooterButton = (okBtn, cancelBtn, options = {}) => {
    const { supplementaryItemDs, createItemFlag } = options || {};
    let buttons = [
      okBtn,
      <Button
        type="primary"
        onClick={() => supplementaryItemDs.forceSubmit()}
        loading={pageLoading}
      >
        {intl.get('ssrc.inquiryHall.model.inquiryHall.onlySaveButton').d('仅保存')}
      </Button>,
      cancelBtn,
    ];

    buttons = remote
      ? remote.process(
          'SSRC_CHECK_PRICE_NEW_C7N_PROCESS_SUBMIT_SUPPLEMENTARYITEM_FOOTER_BUTTON',
          buttons,
          {
            supplementaryItemDs,
            bidFlag,
            rfxHeaderId,
            setSaveOrSubmitLoading,
            createItemFlag,
            pageLoading,
            getLinedata,
          }
        )
      : buttons;

    buttons = buttons || [];
    buttons = buttons.filter(Boolean);

    return <>{buttons}</>;
  };

  // 返回promise控制loading
  const handleSubmit = useCallback(
    async (type, paramData) => {
      // 'ALL' 全部标段 ‘PORTION’ 部分标段 ‘current’ 当前标段
      const curDimensionCode = dimensionCode || shareDs.getState('dimensionCode');
      try {
        const beforeValite = await validatePreInterface();
        if (!beforeValite) {
          return;
        }
        const projectLineSectionList =
          type === 'ALL'
            ? getSectionListData()
            : type === 'PORTION'
            ? paramData.sectionCheckedList
            : [];
        const sourceCheckedId =
          type === 'ALL'
            ? getSectionListData()[0]?.sourceHeaderId
            : type === 'PORTION'
            ? paramData.sectionCheckedList[0]?.sourceHeaderId
            : '';
        // const dimensionCode = shareDs.getState('dimensionCode');
        // 打开物料弹窗
        const openItemModal = (createItemConfig) => {
          const { createItemFlag, rfxHeaderIds, checkValue = {} } = createItemConfig || {};
          const { notSuggestNoCodeItem = [] } = checkValue || {};
          const title =
            createItemFlag === 1
              ? intl.get(`${promptCode}.view.title.createItem`).d('创建物料')
              : intl.get(`${promptCode}.view.modalTitle.updateMaterial`).d('补充物料');
          const supplementaryItemDs = new DataSet(
            (createItemFlag === 1 ? createItemDS : updateItemDS)({
              createItemFlag,
              headerDs,
              notSuggestRfxLineIds: notSuggestNoCodeItem,
            })
          );
          supplementaryItemDs.setQueryParameter(
            'customizeUnitCode',
            `SSRC.${
              sourceKey === 'INQUIRY' ? sourceKey : 'NEW_BID'
            }_HALL_CHECK_PRICE_NEW.ITEM_FILTER_BAR,SSRC.${
              sourceKey === 'INQUIRY' ? sourceKey : 'NEW_BID'
            }_HALL_CHECK_PRICE_NEW.ITEM_LINE_ADD`
          );
          supplementaryItemDs.setQueryParameter('sectionHeaderId', sourceCheckedId || rfxHeaderId);
          supplementaryItemDs.query();
          const batchImportProps = ({ sectionHeaderId }) => ({
            buttonText: intl.get(`${promptCode}.view.excelImport`).d('Excel导入'),
            businessObjectTemplateCode: 'SSRC.RFX_CHECK_CREATE_ITEM.IMPORT',
            prefixPatch: SRM_SSRC,
            tenantId: organizationId,
            args: {
              tenantId: organizationId,
              organizationId,
              rfxHeaderId: sectionHeaderId,
              templateCode: 'SSRC.RFX_CHECK_CREATE_ITEM.IMPORT',
              fromExport: true,
            },
            auto: true,
            refreshButton: true,
            action: title,
            customeImportTemplate: {
              templateCode: 'SRM_C_SRM_SSRC_RFX_CHECK_CREATE_ITEM_DOWNLOAD_EXPORT',
              requestUrl: `${SRM_SSRC}/v1/${organizationId}/rfx/check/create-item/template/export`,
              queryParams: {
                tenantId: organizationId,
                organizationId,
                rfxHeaderId: sectionHeaderId,
                customizeUnitCode: `SSRC.${
                  sourceKey === 'INQUIRY' ? sourceKey : 'NEW_BID'
                }_HALL_CHECK_PRICE_NEW.ITEM_LINE_ADD`,
              },
              queryArea: { fillerType: 'multi-sheet', async: false },
            },
            successCallBack: () => {
              supplementaryItemDs.reset();
              supplementaryItemDs.query();
            },
          });
          const drawerProps = {
            createItemFlag,
            rfxHeaderId: sourceCheckedId || rfxHeaderId,
            rfxHeaderIds,
            // sectionFlag,
            projectLineSectionList,
            dataSet: supplementaryItemDs,
            batchImportProps,
            sourceKey: sourceKey === 'INQUIRY' ? sourceKey : 'NEW_BID',
            customizeTable,
            pageLoading,
          };
          Modal.open({
            key: Modal.key(),
            drawer: true,
            style: {
              width: 1000,
            },
            title,
            children: <SupplementaryItemDrawer {...drawerProps} />,
            okProps: {
              loading: pageLoading,
            },
            onClose: () => {
              setSaveOrSubmitLoading(false);
            },
            onOk: async () => {
              const itemValidateFlag = await supplementaryItemDs.validate();
              if (!itemValidateFlag) return false;
              const rfxLineItemList = (supplementaryItemDs || []).map((record) => {
                return {
                  ...record.toData(),
                  checkFlag: Number(record.isSelected),
                };
              });
              const cachedModifiedData = (supplementaryItemDs?.cachedModified || []).map(
                (record) => {
                  return {
                    ...record.toData(),
                    checkFlag: Number(record.isSelected),
                  };
                }
              );
              const res = getResponse(
                await onSubmitCallback({
                  rfxLineItemList: [...rfxLineItemList, ...cachedModifiedData],
                  supplementaryItemFlag: 1,
                })
              );
              setSaveOrSubmitLoading(false);
              if (!res) {
                return false;
              }
              if (!res?.failed) {
                notification.success({
                  message: intl
                    .get(`${promptCode}.model.inquiryHall.checkPriceSubmitSuccess`, {
                      checkPriceName: getCheckPriceName(bidFlag),
                    })
                    .d('{checkPriceName}提交成功'),
                });
              }
              history.push(`${activeTabKey}/list`);
            },
            footer: (okBtn, cancelBtn) =>
              supplementaryItemDrawerFooterButton(okBtn, cancelBtn, {
                supplementaryItemDs,
                createItemFlag,
              }),
          });
        };

        // 整合提交
        const onSubmitCallback = async (custParams = {}) => {
          setSaveOrSubmitLoading(true);
          const headerData = headerDs.current && headerDs.current.toData();
          const linesData = getLinedata();
          const attachmentLineList = getAttachmentListTableData();
          const { supplementaryItemFlag, ...others } = custParams || {};
          const AttachmentListCode = getAttachmentLineTableAndColumnsCustomizeUnitCode() || '';
          let unitCode = bidFlag
            ? 'SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.QUOTATION_DETAIL,SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.SUPPLIER_DETAIL,SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.OTHER,SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.ITEM_DETAIL,SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.BASE_INFO,SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.ATTACHMENT'
            : 'SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.QUOTATION_DETAIL,SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.SUPPLIER_DETAIL,SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.OTHER,SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.ITEM_DETAIL,SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.BASE_INFO,SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.ATTACHMENT';
          if (AttachmentListCode) {
            unitCode = `${unitCode},${AttachmentListCode}`;
          }

          let params = Object.assign({
            rfxHeaderId,
            checkHeaderDTO: headerData,
            projectLineSectionList,
            checkSelectionDimension: curDimensionCode,
            attachmentLineList,
            customizeUnitCode: unitCode,
            ...others,
          });
          if (curDimensionCode === 'ITEM') {
            params = {
              ...params,
              checkQuotationLineDTOS: linesData,
            };
          } else {
            const checkSupplierDTOList = generateTreeByGroup(
              linesData,
              'supplierCompanyId',
              [
                'allSelectFlag',
                'allAllottedRatio',
                'allSuggestedRemark',
                'rfxLineSupplierId',
                'rankTeam',
                'supplierCompanyId',
                'quotationHeaderId',
              ],
              'quotationLineList'
            );
            params = {
              ...params,
              checkSupplierDTOList:
                curAggregation.current !== false ? checkSupplierDTOList : linesData,
            };
          }

          params = remote
            ? await remote.process('SSRC_CHECK_PRICE_NEW_C7N_PROCESS_SUBMIT_PARAMS', params, {
                type,
                bidFlag,
                headerDs,
                itemDs,
                wholePackageDs,
                shareDs,
                scoreDs,
                curDimensionCode,
              })
            : params;
          params = params || {};

          return getResponse(
            supplementaryItemFlag
              ? await submitCheckPriceByItem(params)
              : await submitCheckPrice(params)
          );
        };

        const finallySubmit = async () => {
          const result = await onSubmitCallback();
          if (result) {
            const confirmMessageMap = omit(result, 'creatItem');
            const createOrUpdateItemFlag = Object.prototype.hasOwnProperty.call(
              result,
              'creatItem'
            ); // 创建/补充物料
            if (isEmpty(result)) {
              // 直接提交
              if (!result?.failed) {
                notification.success({
                  message: intl
                    .get(`${promptCode}.model.inquiryHall.checkPriceSubmitSuccess`, {
                      checkPriceName: getCheckPriceName(bidFlag),
                    })
                    .d('{checkPriceName}提交成功'),
                });
              }
              history.push(`${activeTabKey}/list`);
            } else if (Object.keys(result).length === 1 && createOrUpdateItemFlag) {
              // 补充物料
              openItemModal(result && result.creatItem);
            } else if (['ERROR', 'error'].includes(result.type)) {
              // 普通报错
              setSaveOrSubmitLoading(false);
              Modal.error({
                children: (
                  <div>
                    {map(Object.values(confirmMessageMap), (value, index) => {
                      return <div>{`${index + 1}、${value && value.message}`}</div>;
                    })}
                  </div>
                ),
              });
            } else {
              // 报错集合
              const errorNode = [];
              let errorObj = null;
              Object.values(confirmMessageMap).forEach((value, index) => {
                if (errorObj || !value) {
                  return;
                }
                if (value.type === 'ERROR') {
                  errorObj = value;
                  return;
                }
                errorNode.push(
                  <div>
                    {`${index + 1}、${
                      value.allSource
                        ? `${intl.get('ssrc.inquiryHall.view.title.sectionBiding').d('标段')}【${
                            value.allSource
                          }】:`
                        : ''
                    }${value.message}`}
                  </div>
                );
              });

              if (errorObj) {
                Modal.error({
                  children: errorObj.message,
                });
              } else {
                Modal.confirm({
                  title: intl.get(`ssrc.common.message.tips`).d('提示'),
                  children: (
                    <div>
                      <span>
                        {intl
                          .get(`${promptCode}.message.confirm.checkPriceOfSubmitTips`, {
                            checkPriceName: getCheckPriceName(bidFlag),
                          })
                          .d('存在以下问题,请确认是否继续提交{checkPriceName}？')}
                      </span>
                      {errorNode}
                    </div>
                  ),
                  onOk: () => {
                    if (createOrUpdateItemFlag) {
                      openItemModal(result && result.creatItem);
                    } else {
                      // 无需补充物料, 直接提交
                      onSubmitCallback({
                        checkPassFlag: 1,
                      }).then((res) => {
                        if (!res) {
                          setSaveOrSubmitLoading(false);
                          return false;
                        }
                        if (!res?.failed) {
                          notification.success({
                            message: intl
                              .get(`${promptCode}.model.inquiryHall.checkPriceSubmitSuccess`, {
                                checkPriceName: getCheckPriceName(bidFlag),
                              })
                              .d('{checkPriceName}提交成功'),
                          });
                        }
                        history.push(`${activeTabKey}/list`);
                      });
                    }
                  },
                });
              }
            }
          }
        };
        if (remote?.event) {
          const eventProps = {
            bidFlag,
            headerDs,
            shareDs,
            itemDs,
            wholePackageDs,
            curDimensionCode,
            projectLineSectionList,
            handleSave,
            finallySubmit,
            getLinedata,
          };
          await remote.event.fireEvent('beforeSubmit', eventProps);
        } else {
          await finallySubmit();
        }
      } finally {
        setSaveOrSubmitLoading(false);
      }
    },
    [
      headerDs,
      itemDs,
      wholePackageDs,
      rfxHeaderId,
      getLinedata,
      dimensionCode,
      sourceKey,
      remote,
      pageLoading,
      exchangConfigLoading,
      headerDs.status,
      saveOrSubmitLoading,
      setSaveOrSubmitLoading,
    ]
  );

  const cacheItemIds = useRef({});
  const cacheItemPosition = useRef({ start: 0, end: itemTableGroupPageSize });

  const clearCache = useCallback(() => {
    const { current } = itemTableRef;
    // 清除勾选
    if (current) {
      const groupInfo = itemTableRef.current.getHeaderGroups();
      if (shareDs.getState('dimensionCode') === 'ITEM') {
        groupInfo.forEach((group) => {
          group.setState('colAllSelected', false);
          group.totalRecords.forEach((record) => {
            record.setState('cellSelected', false);
          });
        });
      } else {
        groupInfo.forEach((group) => {
          group.setState('colAllSelected', false);
        });
      }
    }
    cacheItemIds.current = {};
    cacheItemPosition.current = {
      start: 0,
      end: itemTableGroupPageSize,
    };
    shareDs.setState('quotationHeaderIds', []);
    shareDs.setState('rfxLineItemIds', []);
    shareDs.setState('editQuotationLines', []);
    shareDs.setState('editQuotationLinesKeys', []);
    shareDs.setState('removeQuotationHeaderIds', []);
    shareDs.setState('removeRfxLineItemIds', []);
    shareDs.setState('allSelectFlag', false);
    shareDs.setState('itemUnSelectArr', []);
    shareDs.setState('wholeUnSelectArr', []);
  }, [shareDs.getState('dimensionCode'), itemDs, wholePackageDs, itemTableGroupPageSize]);

  /**
   * 保存
   * @param {String} saveType - 保存类型 `changeDimension`: 切换维度， sectionSave: 标段保存, saveAutoData 自动-》 o, object 普通保存
   * @param {Boolean} refreshFlag 是否保存完进行更新
   * @param {String} value - 选用模式[弃用]
   * @param {List} rfxHeaderIds 批量保存ids
   * @param {*} saveFlag 是否需要保存
   */
  const handleSave = useCallback(
    async (saveType, refreshFlag = true, value, rfxHeaderIds = [], saveFlag = false) => {
      const curDimensionCode = dimensionCode || shareDs.getState('dimensionCode');
      return new Promise(async (resolve) => {
        try {
          const { queryItemLines = noop } = itemLineRef.current || {};
          // 这里只有大保存需要校验，标段切换校验在beforeOpenSection中
          // const beforevalidate = typeof saveType === 'string' || (await validatePreInterface());
          // if (!beforevalidate) {
          //   return resolve(true);
          // }
          setSaveOrSubmitLoading(true);
          const headerData = headerDs.current && headerDs.current.toData();
          const linesData = getLinedata() || [];
          const attachmentLineList = getAttachmentListTableData();
          const AttachmentListCode = getAttachmentLineTableAndColumnsCustomizeUnitCode() || '';
          let unitCode = bidFlag
            ? 'SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.QUOTATION_DETAIL,SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.SUPPLIER_DETAIL,SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.OTHER,SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.ITEM_DETAIL,SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.BASE_INFO,SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.ATTACHMENT'
            : 'SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.QUOTATION_DETAIL,SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.SUPPLIER_DETAIL,SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.OTHER,SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.ITEM_DETAIL,SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.BASE_INFO,SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.ATTACHMENT';
          if (AttachmentListCode) {
            unitCode = `${unitCode},${AttachmentListCode}`;
          }

          let params = {
            rfxHeaderId,
            rfxHeaderIds,
            checkHeaderDTO: headerData,
            checkSelectionDimension: curDimensionCode,
            attachmentLineList,
            customizeUnitCode: unitCode,
          };
          if (curDimensionCode === 'ITEM') {
            params = {
              ...params,
              checkQuotationLineDTOS: linesData,
            };
          } else {
            const checkSupplierDTOList = generateTreeByGroup(
              linesData,
              'supplierCompanyId',
              [
                'allSelectFlag',
                'allAllottedRatio',
                'allSuggestedRemark',
                'rfxLineSupplierId',
                'rankTeam',
                'supplierCompanyId',
                'quotationHeaderId',
              ],
              'quotationLineList'
            );
            params = {
              ...params,
              checkSupplierDTOList:
                curAggregation.current !== false ? checkSupplierDTOList : linesData,
            };
          }

          params = remote
            ? await remote.process('SSRC_CHECK_PRICE_NEW_C7N_PROCESS_SAVE_PARAMS', params, {
                saveType,
                bidFlag,
                headerDs,
                itemDs,
                wholePackageDs,
                shareDs,
                scoreDs,
              })
            : params;
          params = params || {};

          let result = {};
          if (saveType === 'saveAutoData') {
            result = await saveAutoData({
              ...params,
              checkSelectionDimension: shareDs.getState('checkSelectionDimension'),
              checkRecommendationStrategyDetail: shareDs.getState(
                'checkRecommendationStrategyDetail'
              ),
            }); // 推荐保存
          } else if (saveType === 'changeDimension') {
            result = await cleanCheckPrice(params);
          } else if (saveType === 'sectionSave' || isObject(saveType)) {
            result = await saveCheckPrice(params);
          }
          result = getResponse(result);
          if (result && !result?.failed && saveFlag) {
            notification.success({
              message: !bidFlag
                ? intl.get(`${promptCode}.model.inquiryHall.checkSaveSuccess`).d('核价保存成功')
                : intl.get(`${promptCode}.model.inquiryHall.checkBidSaveSuccess`).d('定标保存成功'),
            });
          }

          refreshAttachmentListTable();
          if (saveType !== 'sectionSave' && result && refreshFlag) {
            headerDs.query();
            if (saveType !== 'changeDimension') {
              queryItemLines({ refreshFlag: true, saveType });
            }
          }
          if (result) {
            clearCache();
            resolve(true);
          } else {
            resolve(false);
          }
        } catch (error) {
          resolve(false);
          throw error;
        } finally {
          if (refreshFlag && saveType !== 'changeDimension') {
            handleQuerySyncData();
            queryAttachmentCount(processAttachmentNewUIFlag);
          }
          setSaveOrSubmitLoading(false);
          setTimestamp(Date.now());
        }
      });
    },
    [
      headerDs,
      itemDs,
      wholePackageDs,
      shareDs.getState('editQuotationLines'),
      rfxHeaderId,
      clearCache,
      getLinedata,
      dimensionCode,
    ]
  );

  const changeStrategyVisible = () => {
    setStrategyVisible(!strategyVisible);
  };

  const pageLoading = useComputed(() => {
    return saveOrSubmitLoading || headerDs.status !== 'ready' || exchangConfigLoading;
  }, [saveOrSubmitLoading, headerDs, itemDs, wholePackageDs, exchangConfigLoading]);

  const handleEnter = (e, name) => {
    if (e.target.scrollWidth > e.target.clientWidth) {
      Tooltip.show(e.target, {
        title: name,
        placement: 'leftTop',
      });
    }
  };

  const handleLeave = () => {
    Tooltip.hide();
  };

  const rightRender = useCallback(() => {
    const selectionModalProps = {
      changeStrategyVisible,
      bidFlag,
      shareDs,
      headerDs,
      custConfig,
      handleSave,
      setInitFlag,
      rfxHeaderId,
      criteriaConfig,
      dimensionConfig,
      defaultCriteria,
      defaultDimension,
      checkSelectionDimension,
      setSaveOrSubmitLoading,
    };

    return (
      <Spin spinning={pageLoading}>
        <div className={styles.title}>
          <div
            className="check-price-title"
            onMouseEnter={(e) => handleEnter(e, getCheckPriceName(bidFlag))}
            onMouseLeave={handleLeave}
          >
            {getCheckPriceName(bidFlag)}
          </div>
          <Divider type="vertical" />

          <div className="section-container">
            <div
              className="label"
              onClick={changeStrategyVisible}
              onMouseEnter={(e) =>
                handleEnter(
                  e,
                  intl.get(`${promptCode}.model.inquiryHall.selectionStrategy`).d('选用策略')
                )
              }
              onMouseLeave={handleLeave}
            >
              {intl.get(`${promptCode}.model.inquiryHall.selectionStrategy`).d('选用策略')}
            </div>
            {selectionStrategyMap()[shareDs.current.get('checkRecommendationStrategyDetail')] && (
              <div
                className="detail"
                onClick={changeStrategyVisible}
                onMouseEnter={(e) =>
                  handleEnter(
                    e,
                    `${
                      selectionStrategyMap()[
                        shareDs.current.get('checkRecommendationStrategyDetail')
                      ]
                    }-${selectionStrategyMap()[shareDs.current.get('checkSelectionDimension')]}`
                  )
                }
                onMouseLeave={handleLeave}
              >
                {`${
                  selectionStrategyMap()[shareDs.current.get('checkRecommendationStrategyDetail')]
                }-${selectionStrategyMap()[shareDs.current.get('checkSelectionDimension')]}`}
              </div>
            )}
            <div onClick={changeStrategyVisible} style={{ marginTop: '-1px' }}>
              <Icon type={strategyVisible ? 'expand_less' : 'expand_more'} />
            </div>
            <div className="selecion-modal" style={strategyVisible ? {} : { display: 'none' }}>
              {headerDs.current && <SelectionModal {...selectionModalProps} />}
            </div>
          </div>
        </div>
      </Spin>
    );
  }, [
    strategyVisible,
    custConfig,
    shareDs,
    headerDs,
    handleSave,
    pageLoading,
    rfxHeaderId,
    checkSelectionDimension,
  ]);

  const backPath = useMemo(() => {
    return `${activeTabKey}/list`;
  }, []);

  let returnToPretrialDs = {};

  /**
   * 退回至初审确认
   */
  const submitReturnToPretrial = useCallback(
    throttle(async () => {
      const validate = await returnToPretrialDs.validate();
      if (validate) {
        const res = await returnToPretrialDs.submit();
        if (res) {
          history.push(`${activeTabKey}/list`);
        }
      }
    }, 500),
    [returnToPretrialDs]
  );

  /**
   * 点击退回至初审
   */
  const returnToPretrial = useCallback(
    throttle(() => {
      const objectVersionNumber = headerCurrent?.get('objectVersionNumber');
      returnToPretrialDs = new DataSet(returnToPretrialDS({ objectVersionNumber, rfxHeaderId }));
      modal.open({
        destroyOnClose: true,
        closable: true,
        title: intl.get('ssrc.inquiryHall.view.message.title.returnToPretrial').d('退回至初审'),
        style: { width: '500px' },
        children: <ReturnToPretrial dataSet={returnToPretrialDs} />,
        onOk: submitReturnToPretrial,
      });
    }, 500),
    [headerCurrent, rfxHeaderId]
  );

  /**
   * 打开操作记录
   */
  const handleShowOperationRecordModal = useCallback(
    throttle(() => {
      openModal({
        rfxHeaderId,
      });
    }, 500),
    [rfxHeaderId]
  );

  const dealDataState = (data = []) => {
    // 处理行 处理字段为update
    let config = [];
    if (Array.isArray(data) && data.length > 0) {
      config = data.map((item) => {
        return {
          ...item,
          _status: 'update',
        };
      });
    }
    return config;
  };

  /**
   * 查询汇率编辑表格数据
   */
  const handleQuerySupplierExchangeEdit = useCallback(
    async (data = {}) => {
      const res = getResponse(
        await querySupplierExchangeEdit({
          ...data,
          organizationId,
          sourceHeaderId: rfxHeaderId,
          sourceFrom: 'RFX',
        })
      );
      if (res) {
        setExchangeEditSupplierList(dealDataState(res));
      }
      return res;
    },
    [rfxHeaderId]
  );

  /**
   * 关闭汇率编辑弹框
   */
  const cancelExchangeEdit = useCallback(() => {
    setExchangeEditModalVisible(false);
    setExchangeEditSupplierList([]);
  }, []);

  /**
   * 打开汇率编辑-引用汇率主数据弹框
   */
  const quoteExchangeMainData = useCallback(() => {
    setExchangeEditContentModalVisible(true);
  }, []);

  /**
   *  打开汇率编辑-引用汇率主数据弹框-ref
   */
  const exchangeRateRef = useRef(null);

  /**
   * 获取汇率编辑-引用汇率主数据弹框-ref
   */
  const handleExchangeMainRef = useCallback((vnode) => {
    exchangeRateRef.current = vnode;
  }, []);

  /**
   * 汇率编辑-引用汇率主数据弹框-确认
   */
  const quoteExchangeMainDataOk = useCallback(
    throttle(() => {
      if (!exchangeRateRef.current) {
        return;
      }

      const {
        props: {
          form: { validateFields },
        },
      } = exchangeRateRef.current;

      validateFields((err, values = {}) => {
        if (err || isEmpty(exchangeEditSupplierList)) {
          return;
        }
        setExchangeEditSupplierList([]);
        const rateDate = dateFormate(values.rateDate, DEFAULT_DATE_FORMAT);
        handleQuerySupplierExchangeEdit({
          rateTypeCode: values.rateTypeCode,
          rateDate,
        });
        quoteExchangeMainDataCancel();
      });
    }, 500),
    [exchangeEditSupplierList]
  );

  /**
   * 汇率编辑-引用汇率主数据弹框-关闭
   */
  const quoteExchangeMainDataCancel = useCallback(() => {
    setExchangeEditContentModalVisible(false);
  }, []);

  // 汇率编辑-引用汇率主数据弹窗
  const ExchangeQuoteProps = useMemo(() => {
    return {
      organizationId,
      exchangeEditContentModalVisible,
      quoteExchangeMainDataOk,
      quoteExchangeMainDataCancel,
      onRef: handleExchangeMainRef,
    };
  }, [exchangeEditContentModalVisible]);

  const handleSaveExchangeEdit = useCallback(async () => {
    try {
      setSaveExchangeEditLoading(true);
      const newParams = getEditTableData(exchangeEditSupplierList, []);
      const { queryItemLines = noop } = itemLineRef.current || {};
      const res = getResponse(await saveExchangeEdit({ newParams, rfxHeaderId, organizationId }));
      if (res) {
        cancelExchangeEdit();
        await headerDs.query();
        handleQuerySyncData();
        queryItemLines({ refreshFlag: true });
      }
    } finally {
      setSaveExchangeEditLoading(false);
    }
  }, [rfxHeaderId, headerDs, exchangeEditSupplierList]);

  /**
   * 点击汇率编辑
   */
  const exchangeEdit = useCallback(
    throttle(() => {
      return handleQuerySupplierExchangeEdit().then((res) => {
        if (res) {
          setExchangeEditModalVisible(true);
        }
      });
    }, 500),
    [handleQuerySupplierExchangeEdit]
  );

  // 汇率编辑入参
  const ExchangeEditProps = useMemo(() => {
    return {
      exchangeEditModalVisible,
      cancelExchangeEdit,
      quoteExchangeMainData,
      saveExchangeEditLoading,
      saveExchangeEdit: handleSaveExchangeEdit,
      exchangeEditSupplierList,
      querySupplierExchangeEdit: handleQuerySupplierExchangeEdit,
    };
  }, [
    exchangeEditModalVisible,
    cancelExchangeEdit,
    quoteExchangeMainData,
    exchangeEditSupplierList,
    querySupplierExchangeEdit,
  ]);

  // 价格澄清入参
  const PriceButtonProps = {
    match,
    history,
    sourceFrom: 'RFX',
    sourceHeaderId: rfxHeaderId,
    organizationId,
    className: styles.noBtn,
    buttonPermission: false,
    getRouterParams: routerParams,
    bidFlag,
    basicInfoDs: headerDs,
  };

  /**
   * 议价方式弹框ref
   */
  const bargainRuleModalRef = useRef(null);

  // 给议价弹框设置loading
  const setOpenBargainLoading = (flag = false) => {
    if (bargainRuleModalRef.current) {
      bargainRuleModalRef.current.setState({
        openBargainLoading: flag,
      });
    }
  };

  /**
   * 跳转到议价
   */
  const openBargainModal = useCallback(
    throttle(async () => {
      if (isNil(headerCurrent)) {
        return;
      }

      const { subjectMatterRule, projectLineSectionId, bargainStatus, bargainOfflineFlag = false } =
        headerCurrent?.get([
          'subjectMatterRule',
          'projectLineSectionId',
          'bargainStatus',
          'bargainOfflineFlag',
        ]) || {};
      const bargainTimeFinished = isBargainFinished();

      const getFieldValue = bargainRuleModalRef.current
        ? bargainRuleModalRef.current.props?.form?.getFieldValue
        : () => {};

      const pathname = `${activeTabKey}/${bargainNewFlag ? 'new-' : ''}rfx-bargain/${rfxHeaderId}`;

      let sectionSearch = {}; // 分标段增加路由参数
      if (subjectMatterRule === 'PACK') {
        sectionSearch = {
          sectionFlag: subjectMatterRule === 'PACK' ? 1 : 0,
          projectLineSectionId,
        };
      }

      const search = querystring.stringify({
        sourceStatus: 'checkPrice',
        ...sectionSearch,
      });

      const jumpRouter = async () => {
        if (remote?.event) {
          const eventProps = {
            rfxHeaderId,
            dimensionCode,
            itemDs,
            wholePackageDs,
            itemTableRef,
            curAggregation,
            shareDs,
            bidFlag,
            headerCurrent,
            getLinedata,
          };
          await remote.event.fireEvent('beforeBargainEvent', eventProps);
        }
        setOpenBargainLoading();
        history.push({
          pathname,
          search,
        });
      };

      setOpenBargainLoading(true);

      const bargainServiceFlag = remote
        ? remote.process('SSRC_CHECK_PRICE_NEW_C7N_PROCESS_BARGAIN_SERVICE_FLAG', true, {
            headerCurrent,
          })
        : true;
      if (
        (!['BARGAINING_OFFLINE', 'BARGAINING_ONLINE'].includes(bargainStatus) ||
          bargainTimeFinished) &&
        bargainServiceFlag
      ) {
        const res = getResponse(
          await fetchOpenBargain({
            organizationId,
            rfxHeaderId,
            bargainMethod: bargainOfflineFlag === 0 ? 'ONLINE' : getFieldValue('sourceType'),
          })
        );
        if (res) {
          jumpRouter();
        }
        setOpenBargainLoading();
        return res;
      } else {
        jumpRouter();
      }
    }, 500),
    [
      headerCurrent,
      activeTabKey,
      rfxHeaderId,
      dimensionCode,
      itemDs,
      wholePackageDs,
      curAggregation,
      shareDs,
      getLinedata,
      bargainNewFlag,
    ]
  );

  // 判断议价是否时间结束
  const isBargainFinished = () => {
    const { currentDateTime = null, bargainEndDate = null } = headerCurrent
      ? headerCurrent?.get(['currentDateTime', 'bargainEndDate'])
      : {};

    const bargainTimeFinished =
      !isNil(bargainEndDate) && !isNil(currentDateTime) && bargainEndDate < currentDateTime;
    return bargainTimeFinished;
  };

  /**
   * 点击议价按钮
   */
  const handleBargainOnline = useCallback(
    throttle(() => {
      if (isNil(headerCurrent)) {
        return;
      }
      const { bargainOfflineFlag = 0, bargainStatus = null } =
        headerCurrent?.get(['bargainOfflineFlag', 'bargainStatus']) || {};
      const bargainTimeFinished = isBargainFinished();

      if (
        ['INITIATE', 'BARGAIN_ONLINE', 'BARGAIN_OFFLINE'].includes(bargainStatus) ||
        bargainTimeFinished
      ) {
        if (bargainOfflineFlag) {
          setOnlineBargainVisible(true);
        } else {
          return openBargainModal();
        }
      } else {
        return openBargainModal();
      }
    }, 500),
    [headerCurrent, bargainNewFlag]
  );

  const hideBargainModal = useCallback(() => {
    setOnlineBargainVisible(false);
  }, []);

  /**
   * 点击多轮报价按钮
   */
  const handleRoundQuotation = useCallback(
    throttle(() => {
      const pathname = `${activeTabKey}/round-quotation/${rfxHeaderId}`;
      const { projectLineSectionId } = routerParams;
      const search = querystring.stringify({
        projectLineSectionId,
      });
      history.push({ pathname, search });
    }, 500),
    [routerParams, rfxHeaderId, activeTabKey]
  );

  const refreShData = useCallback(() => {
    const { queryItemLines = noop } = itemLineRef.current || {};
    headerDs.query();
    handleQuerySyncData();
    queryItemLines({ refreshFlag: true });
  }, [itemLineRef.current, headerDs]);

  /**
   * 批量导入参数
   */
  const importProps = useMemo(
    () => ({
      businessObjectTemplateCode: 'SSRC.RFX_CHECK_PRICE.IMPORT',
      prefixPatch: SRM_SSRC,
      tenantId: organizationId,
      args: {
        tenantId: organizationId,
        organizationId,
        rfxHeaderId,
        templateCode: 'SSRC.RFX_CHECK_PRICE.IMPORT',
      },
      buttonText: intl.get(`ssrc.common.button.batchImport`).d('批量导入'),
      backPath: undefined,
      auto: true,
      refreshButton: true,
      action: 'hzero.common.title.batchImport',
      modalProps: {
        onClose: refreShData,
      },
      customeImportTemplate: {
        templateCode: 'SRM_C_SRM_SSRC_RFX_HEADER_RFX_CHECK_PRICE',
        requestUrl: `${SRM_SSRC}/v2/${organizationId}/rfx/check/quotation/lines/export?rfxHeaderId=${rfxHeaderId}`,
        queryParams: { rfxHeaderId },
        queryArea: { fillerType: 'single-sheet', async: false },
      },
    }),
    [rfxHeaderId]
  );

  // 完全可以写到组件里面，不理解加这个功能的开发是怎么想的
  const downloadAll = useCallback(() => {
    const api = `${SRM_SSRC}/v1/${organizationId}/rfx/${rfxHeaderId}/process-attachment/download-all`;
    downloadFile({ requestUrl: api });
  }, [rfxHeaderId]);

  const openH0ProcessAttachmentModal = useCallback(() => {
    setProcessVisible(true);
  }, []);

  const onCancel = useCallback(() => {
    setProcessVisible(false);
  }, []);

  // 过程附件下载
  const DownloadAttachmentsProps = useMemo(() => {
    return {
      rfxHeaderId,
      processVisible,
      downloadAll,
      onCancel,
      organizationId,
    };
  }, [rfxHeaderId, processVisible]);

  // 比价助手
  const priceComparisonProps = {
    sourceCategory,
    diyLadderQuotationFlag,
    rfxId: rfxHeaderId,
    // showPriceComparison: false,
    // visible: priceComparisonModalVisible,
    // onHideModal: useCallback(() => {
    //   setPriceComparisonModalVisible(false);
    // }, []),
    pubRouterAddParams,
  };

  // 渲染比价助手 函数式-方便埋点
  const renderPriceComparisonModal = () => {
    modal.open({
      destroyOnClose: true,
      closable: true,
      title: intl.get(`ssrc.inquiryHall.view.message.button.priceAssistant`).d('比价助手'),
      style: { width: '80%' },
      drawer: true,
      footer: null,
      children:
        sourceKey === INQUIRY ? (
          <PriceComparison {...priceComparisonProps} />
        ) : (
          <BidPriceComparison {...priceComparisonProps} />
        ),
    });
  };

  // 唱标
  const handleBidAnnouncement = () => {
    openBidAnnouncementModal({
      rfxHeaderId,
    });
  };

  /**
   * 普通头部按钮组配置
   */
  const getButtons = useMemo(() => {
    const {
      multiCurrencyFlag,
      expertScoreType,
      bargainRule,
      bargainClosedFlag,
      roundQuotationRule,
      roundHeaderStatus,
      roundQuotationEndDate,
      pretrialFlag,
      enableBidAnnouncementFlag,
    } =
      headerCurrent?.get([
        'pretrialFlag',
        'multiCurrencyFlag',
        'expertScoreType',
        'bargainRule',
        'bargainClosedFlag',
        'roundQuotationRule',
        'roundHeaderStatus',
        'roundQuotationEndDate',
        'enableBidAnnouncementFlag',
      ]) || {};
    // 采购员工作台
    // const roleworkbenchFlag = getActiveTabKey().indexOf('/swbh/role-workbench') > -1;

    const btns = [
      {
        name: bidFlag ? 'bidSubmit' : 'checkSubmit',
        child: intl.get('hzero.common.button.submit').d('提交'),
        btnType: 'c7n-pro',
        hidden: sectionFlag,
        btnProps: {
          icon: 'check',
          color: 'primary',
          funcType: 'raised',
          className: 'submit',
          loading: pageLoading,
          onClick: handleSubmit,
          disabled:
            roundHeaderStatus === 'ROUND_CHECKING' && new Date(roundQuotationEndDate) > new Date(),
          waitType: 'throttle',
          wait: 500,
        },
      },
      {
        name: bidFlag ? 'bidSave' : 'checkSave',
        child: intl.get('hzero.common.button.save').d('保存'),
        btnType: 'c7n-pro',
        btnProps: {
          icon: 'save',
          color: 'default',
          funcType: 'flat',
          onClick: () => handleSave({}, undefined, undefined, undefined, true),
          loading: pageLoading,
          waitType: 'throttle',
          wait: 500,
        },
      },
      {
        name: 'startRoundQuotation',
        hidden: !['CHECK', 'AUTO_CHECK'].includes(roundQuotationRule),
        child: (
          <span>
            <span className={styles.icon}>
              <RoundQuotation />
            </span>
            {intl.get(`ssrc.inquiryHall.view.button.startRundQuotation`).d('发起多轮报价')}
          </span>
        ),
        btnType: 'c7n-pro',
        btnProps: {
          funcType: 'flat',
          onClick: handleRoundQuotation,
          disabled: roundHeaderStatus === 'CLOSED' || bargainClosedFlag === 0,
          tooltip: 'none',
          loading: pageLoading,
        },
      },
      {
        name: 'bargainOnline',
        btnType: 'c7n-pro',
        btnComp: BargainOnline,
        hidden: !['CHECK', 'ALL'].includes(bargainRule),
        btnProps: {
          onClick: handleBargainOnline,
          funcType: 'flat',
          disabled:
            roundHeaderStatus === 'ROUND_CHECKING' && new Date(roundQuotationEndDate) > new Date(),
          loading: pageLoading,
        },
      },
      {
        name: 'priceComparisonAssistant',
        child: intl.get(`ssrc.inquiryHall.view.message.button.priceAssistant`).d('比价助手'),
        btnType: 'c7n-pro',
        // hidden: roleworkbenchFlag,
        btnProps: {
          type: 'default',
          icon: 'manage_accounts',
          funcType: 'flat',
          onClick: renderPriceComparisonModal,
          loading: pageLoading,
        },
      },
      {
        name: 'dropdownBtnListNew',
        group: true,
        child: (
          <div>
            <Icon type="more_horiz" />
          </div>
        ),
        children: [
          {
            name: 'returnToPretrial',
            hidden: !pretrialFlag,
            child: (
              <span>
                <Icon type="reply" />
                {intl.get(`ssrc.inquiryHall.view.message.button.returnToPretrial`).d('退回至初审')}
              </span>
            ),
            btnProps: {
              className: styles.noBtn,
              onClick: returnToPretrial,
              loading: pageLoading,
            },
          },
          {
            name: 'priceClear',
            btnComp: PriceClarificationButtons,
            btnProps: {
              ...PriceButtonProps,
            },
          },
          {
            name: 'exchangeEdit',
            hidden: !(multiCurrencyFlag && expertScoreType === 'NONE') || !showExchangeEdit,
            child: (
              <span>
                <Icon type="edit_note" />
                {intl.get('ssrc.inquiryHall.view.button.exchangeEdit').d('汇率编辑')}
              </span>
            ),
            btnProps: {
              funcType: 'flat',
              className: styles.noBtn,
              onClick: exchangeEdit,
            },
          },
          {
            name: 'batchImport',
            btnComp: CommonImportNew,
            btnProps: {
              name: 'batchImport',
              ...importProps,
              buttonProps: {
                className: styles.noBtn,
                funcType: 'flat',
                disabled: shareDs.getState('dimensionCode') === 'ALL',
                permissionList: [
                  {
                    code: `${path}.button.batchimportnew`
                      .replace(/^\//g, '')
                      .replace(/\//g, '.')
                      .replace(/:/g, '-')
                      .replace('rfxId', 'rfxid'),
                    type: 'button',
                    meaning: `${intl.get('ssrc.common.view.new').d('新')})${intl
                      .get(`ssrc.common.button.batchImport`)
                      .d('批量导入')}`,
                  },
                ],
              },
            },
          },
          {
            name: 'export',
            // child: intl.get(`${promptCode}.view.button.export`).d('导出'),
            btnComp: PrintProButton,
            btnProps: {
              requestUrl: `${SRM_SSRC}/v2/${organizationId}/rfx/check/print-excel/token`,
              method: 'GET',
              outType: 'EXCEL',
              params: () => getPrintParams(),
              buttonText: intl.get(`${promptCode}.view.button.export`).d('导出'),
              buttonProps: {
                type: 'c7n-pro',
                funcType: 'flat',
                className: styles.noBtn,
                color: 'default',
                icon: 'unarchive',
                permissionList: [
                  {
                    code: 'ssrc-inquiry-hall.check-price-approval.button.exportnew'.toLowerCase(),
                    type: 'button',
                    meaning: `${
                      intl.get(`ssrc.inquiryHall.view.message.button.checkPrice`).d('核价') -
                      intl.get(`ssrc.common.button.exportNew`).d('导出(新)')
                    }`,
                  },
                ],
              },
            },
          },
          {
            name: 'downloadAttachment',
            hidden: newQuotationFlag,
            child: (
              <Badge count={attachemntCount} overflowCount={attachemntCount} size="small">
                <span>
                  <Icon type="get_app" />
                  {intl.get('hzero.common.button.open').d('过程附件下载')}
                </span>
              </Badge>
            ),
            btnProps: {
              className: styles.noBtn,
              loading: attachmentNewUILoading,
              funcType: 'flat',
              // icon: 'get_app',
              tooltip: 'none',
              onClick: processAttachmentNewUIFlag
                ? openC7nProcessAttachmentModal({ rfxHeaderId })
                : openH0ProcessAttachmentModal,
            },
          },
          {
            name: 'operationRecord',
            btnType: 'c7n-pro',
            child: (
              <span>
                <Icon type="operation_service_request" />
                {intl.get(`ssrc.inquiryHall.view.message.button.record`).d('操作记录')}
              </span>
            ),
            btnProps: {
              funcType: 'flat',
              className: styles.noBtn,
              onClick: handleShowOperationRecordModal,
            },
          },
          !isNil(enableBidAnnouncementFlag) && enableBidAnnouncementFlag
            ? {
                name: 'bidAnnouncement',
                btnType: 'c7n-pro',
                child: () => (
                  <span>
                    <Icon type="volume_up-o" />
                    {intl.get('ssrc.common.model.common.bidAnnouncement').d('唱标')}
                  </span>
                ),
                btnProps: {
                  className: styles.noBtn,
                  funcType: 'flat',
                  onClick: handleBidAnnouncement,
                },
              }
            : null,
          {
            name: 'chat',
            btnComp: ChatRoomSourceLink,
            child: intl.get('ssrc.common.view.message.chatRecord').d('聊天记录'),
            btnProps: {
              btnType: 'c7n-pro',
              funcType: 'flat',
              rfxHeaderId,
            },
          },
        ].filter(Boolean),
      },
    ].filter(Boolean);

    const buttonsPropsCux = {
      headerDs,
      pageLoading,
      rfxHeaderId,
      bidFlag,
      setSaveOrSubmitLoading,
    };

    const buttons = remote
      ? remote.process('SSRC_CHECK_PRICE_NEW_C7N_PROCESS_BUTTONS', btns, buttonsPropsCux)
      : btns;

    return buttons;
  }, [
    pageLoading,
    headerCurrent,
    rfxHeaderId,
    bidFlag,
    sectionFlag,
    attachemntCount,
    shareDs.getState('dimensionCode'),
    processAttachmentNewUIFlag,
    attachmentNewUILoading,
  ]);

  const getPrintParams = useCallback(() => {
    return { rfxHeaderId, showType: curAggregation.current ? 'GROUP' : 'TILE' };
  }, [rfxHeaderId, curAggregation.current]);

  // 审批按钮组
  const getApprovalButtons = useMemo(() => {
    const currentButtons = [
      {
        name: 'export',
        btnComp: PrintProButton,
        btnProps: {
          requestUrl: `${SRM_SSRC}/v2/${organizationId}/rfx/check/print-excel/token`,
          method: 'GET',
          outType: 'EXCEL',
          params: () => getPrintParams(),
          buttonText: intl.get(`${promptCode}.view.button.export`).d('导出'),
          buttonProps: {
            type: 'c7n-pro',
            funcType: 'flat',
            color: 'default',
            icon: 'unarchive',
            permissionList: [
              {
                code: 'ssrc-inquiry-hall.check-price-approval.button.exportnew'.toLowerCase(),
                type: 'button',
                meaning: `${
                  intl.get(`ssrc.inquiryHall.view.message.button.checkPrice`).d('核价') -
                  intl.get(`ssrc.common.button.exportNew`).d('导出(新)')
                }`,
              },
            ],
          },
        },
      },
      {
        name: 'operationRecord',
        btnType: 'c7n-pro',
        child: intl.get(`ssrc.inquiryHall.view.message.button.record`).d('操作记录'),
        btnProps: {
          funcType: 'flat',
          icon: 'operation_service_request',
          onClick: handleShowOperationRecordModal,
        },
      },
      {
        name: 'priceComparisonAssistant',
        child: intl.get(`ssrc.inquiryHall.view.message.button.priceAssistant`).d('比价助手'),
        btnType: 'c7n-pro',
        btnProps: {
          type: 'default',
          icon: 'manage_accounts',
          funcType: 'flat',
          onClick: renderPriceComparisonModal,
        },
      },
      {
        name: 'downloadAttachment',
        hidden: newQuotationFlag,
        child: (
          <Badge
            count={attachemntCount}
            overflowCount={attachemntCount}
            size="small"
            offset={[2, 2]}
          >
            <span>{intl.get('hzero.common.button.open').d('过程附件下载')}</span>
          </Badge>
        ),
        btnType: 'c7n-pro',
        btnProps: {
          loading: attachmentNewUILoading,
          funcType: 'flat',
          icon: 'get_app',
          onClick: processAttachmentNewUIFlag
            ? openC7nProcessAttachmentModal({ rfxHeaderId })
            : openH0ProcessAttachmentModal,
        },
      },
    ];

    const cuxProps = {
      headerDs,
      pageLoading,
      setSaveOrSubmitLoading,
    };
    const approvalButtons = remote
      ? remote.process(
          'SSRC_CHECK_PRICE_NEW_C7N_PROCESS_BUTTONS_APPROVAL_HEADER_BUTTONS',
          currentButtons,
          cuxProps
        )
      : currentButtons;
    return approvalButtons;
  }, [
    headerCurrent,
    attachmentNewUILoading,
    processAttachmentNewUIFlag,
    rfxHeaderId,
    attachemntCount,
    newQuotationFlag,
    remote,
    pageLoading,
  ]);

  /**
   * 标段ref
   */
  const SectionPanelRef = useRef(null);
  const getSectionRef = useCallback((ref) => {
    SectionPanelRef.current = ref;
  }, []);

  /**
   * 查询标段信息
   */
  const getSectionListData = useCallback(() => {
    if (SectionPanelRef.current) {
      return SectionPanelRef.current.state.sectionList;
    }
  }, [SectionPanelRef]);

  /**
   * 切换标段后的处理回调
   * @param {*} curRfxHeaderId 最新标段的rfxHeaderId
   * @param {*} saveFlag 是否需要保存
   */
  const afterOpenSection = async (curRfxHeaderId, saveFlag) => {
    let res = true;
    if (saveFlag) {
      res = await handleSave('sectionSave');
    }
    if (res) {
      // const { dimensionCode } = itemLineRef.current || {};
      const currentDimensionDs = dimensionCode === 'ITEM' ? itemDs : wholePackageDs;
      currentDimensionDs.loadData([]);
      headerDs.loadData([]);
      const search = querystring.stringify({
        ...routerParams,
      });
      history.replace({
        pathname: `${activeTabKey}/check-price/${curRfxHeaderId}`,
        search,
      });
    }
  };

  /**
   * 判断是否存在多个标段
   */
  const judgeChooseSectionButton = useCallback((flag) => {
    shareDs.setState('sectionFlag', flag);
    setSectionFlag(flag);
  }, []);

  /**
   * 获取议价方式弹框ref
   */
  const handleGeneratorRef = useCallback((vnode) => {
    bargainRuleModalRef.current = vnode;
  }, []);

  /**
   * 渲染议价方式弹框render
   */
  const bargainRuleModal = useCallback(() => {
    const modalProps = {
      sourceType: shareDs.getState('sourceType'),
      visible: onlineBargainVisible,
      onRef: handleGeneratorRef,
      hideBargainModal,
      openBargainModal,
      remote,
    };
    return <BargainRuleModal {...modalProps} />;
  }, [
    onlineBargainVisible,
    handleGeneratorRef,
    hideBargainModal,
    openBargainModal,
    shareDs.getState('sourceType'),
    bargainNewFlag,
    remote,
  ]);

  /**
   * 标段props
   */
  const SectionPanelProps = useMemo(
    () => ({
      bidFlag,
      isSection,
      parentPage: {
        name: 'checkPrice',
        queryParams: {
          rfxHeaderId,
          rfxStatus: 'CHECK_PENDING',
        },
      },
      queryParams: {
        rfxHeaderId,
        rfxStatus: 'CHECK_PENDING',
      },
      sourceKey,
      onRef: getSectionRef,
      beforeOpenSection: validatePreInterface,
      afterOpenSection,
      switchNotification: intl
        .get('ssrc.inquiryHall.model.inquiryHall.requiredItemsNotFilledIn')
        .d('有必填项未填，无法保存当前页面信息，是否确认切换页面?'),
      judgeChooseSectionButton,
    }),
    [
      bidFlag,
      isSection,
      rfxHeaderId,
      sourceKey,
      getSectionRef,
      validatePreInterface,
      afterOpenSection,
      judgeChooseSectionButton,
    ]
  );

  /**
   * 多标段 - 头部按钮组配置
   */
  const sectionButtons = useMemo(
    () => [
      {
        name: 'submitSection', // 多标段提交
        group: true,
        child: () => {
          return (
            <Button icon="check" color="primary" loading={pageLoading}>
              {intl.get('hzero.common.button.submit').d('提交')}
              <Icon type="expand_more" />
            </Button>
          );
        },
        children: [
          {
            name: 'submitCurrentSection',
            child: intl.get(`ssrc.common.view.button.submitCurrentSection`).d('提交当前标段'),
            btnProps: {
              type: 'default',
              loading: pageLoading,
              onClick: () => handleSubmit('CURRENT'),
            },
          },
          {
            name: 'submitAllSection',
            child: intl.get(`ssrc.common.view.button.submitAllSections`).d('提交全部标段'),
            btnProps: {
              type: 'default',
              loading: pageLoading,
              onClick: () => handleSubmit('ALL'),
            },
          },
          {
            name: 'submitPortionSection',
            btnComp: ApplyToSection,
            btnProps: {
              type: 'default',
              loading: pageLoading,
              title: intl
                .get(`ssrc.common.view.button.submitPortionBatchSection`)
                .d('批量提交标段'),
              submitQuotationSection: handleSubmit,
              types: 'PORTION',
              getSectionListData,
            },
          },
        ],
      },
    ],
    [pageLoading, handleSubmit, getSectionListData]
  );
  /**
   * 多标段 - 头部按钮组
   */
  const renderSectionHeader = () => {
    return customizeBtnGroup(
      {
        code: 'XXX', // 预留个性化，也许以后要加
        pro: true,
        btnType: 'c7n-pro',
      },
      <DynamicButtons buttons={sectionButtons} />
    );
  };

  /**
   * 普通头部按钮组
   */
  const renderHeaderButton = () => {
    return customizeBtnGroup(
      {
        code: bidFlag
          ? 'SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.HEAD_BUTTONS'
          : 'SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.HEAD_BUTTONS',
        pro: true,
        btnType: 'c7n-pro',
      },
      <DynamicButtons buttons={getButtons} />
    );
  };

  const renderApprovalHeaderButton = useCallback(() => {
    return customizeBtnGroup(
      {
        code: bidFlag
          ? 'SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.HEADER_COLLAPSE_BUTTONS'
          : 'SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.HEADER_COLLAPSE_BUTTONS',
        pro: true,
        btnType: 'c7n-pro',
      },
      <DynamicButtons buttons={getApprovalButtons} />
    );
  }, [getApprovalButtons, pageLoading]);

  const itemLineProps = useMemo(
    () => ({
      itemLineRef,
      sectionFlag,
      getLinedata,
      clearCache,
      onSave: handleSave,
      renderHeaderButton,
      handleQuerySyncData,
      itemTableRef,
      scoreTableRef,
      cacheItemIds,
      cacheItemPosition,
      stdCol,
      extCol,
      viceStdCol,
      viceExtCol,
      mainExtCol,
      mainStdCol,
      curAggregation,
      pubRouterAddParams,
      newQuotationFlag,
      checkItemLineHigh,
      dimensionCode,
      setDimensionCode,
      checkQuotationLineHigh,
      sslmLifeCycleFlag,
      remote,
      itemGroupTableConfig,
      timestamp,
      useNewRateFlag,
      isTechExpertFlag,
    }),
    [
      sectionFlag,
      handleSave,
      getLinedata,
      renderHeaderButton,
      handleQuerySyncData,
      clearCache,
      dimensionCode,
      remote,
      itemGroupTableConfig,
      timestamp,
      useNewRateFlag,
      isTechExpertFlag,
    ]
  );

  const handleAttachmentTableRef = (node) => {
    attachmentTableRef.current = node;
  };

  const fileProps = {
    customizeTable,
    customizeBtnGroup,
    headerDS: headerDs,
    fileTemplateManageFlag,
    rfxHeaderId,
    editorFlag: !pubFlag && !detailFlag ? 1 : 0,
    bidFlag,
    onRef: handleAttachmentTableRef,
    unitCodeSymbol: 'newUpdateOrApproval', // 个性化标识
  };

  /**
   * 主要内容content-render
   */
  const renderContent = useCallback(
    () => (
      <div
        className={classnames(
          styles[`${PrefixCls}-page-content`],
          !pubFlag && detailFlag ? styles.readOnly : commonStyles['common-container'],
          sectionFlag && styles['section-content']
        )}
      >
        <Spin spinning={pageLoading}>
          {/* {!detailFlag ? <HelpMessageSection {...sectionProps} /> : ''} */}
          {(initFlag || detailFlag) && !exchangConfigLoading && shareDs.getState('userMemo') && (
            <Card detailFlag={!pubFlag && detailFlag}>
              <ItemTable {...itemLineProps} />
            </Card>
          )}
          <Card
            detailFlag={!pubFlag && detailFlag}
            title={intl.get(`${promptCode}.view.message.title.basicInfo`).d('基础信息')}
          >
            <HeaderForm />
          </Card>
          <Card
            detailFlag={!pubFlag && detailFlag}
            title={intl.get(`${promptCode}.view.message.title.attachment`).d('附件')}
          >
            {fileTemplateManageFlag !== 1 ? (
              <AttachmentGroup />
            ) : (
              <FileTemplateAttachmentCheckPricePage {...fileProps} />
            )}
          </Card>
        </Spin>
      </div>
    ),
    [itemLineProps, shareDs, pageLoading, sectionFlag, initFlag, exchangConfigLoading, timestamp]
  );

  return (
    <div className={styles['new-checkPrice-container']}>
      {pubFlag && (
        <Header title={getCheckPriceName(bidFlag)}>
          {sectionFlag ? '' : renderApprovalHeaderButton()}
        </Header>
      )}
      {!detailFlag && (
        <Header backPath={backPath} title={rightRender()}>
          {sectionFlag ? renderSectionHeader() : renderHeaderButton()}
        </Header>
      )}
      {detailFlag || !isSection ? (
        renderContent()
      ) : (
        <SectionPanel {...SectionPanelProps}>{renderContent()}</SectionPanel>
      )}
      {/* {priceComparisonModalVisible && renderPriceComparisonModal()} */}
      {/* 议价弹框 */}
      {onlineBargainVisible && bargainRuleModal()}
      {/** 汇率编辑modal */}
      {exchangeEditModalVisible && <ExchangeEditModal {...ExchangeEditProps} />}
      {/** 引用汇率编辑modal */}
      {exchangeEditContentModalVisible && <QuoteExchangeMainDateModal {...ExchangeQuoteProps} />}
      {/* 过程附件下载 */}
      {processVisible && <DownloadAttachments {...DownloadAttachmentsProps} />}
    </div>
  );
};

export default memo(observer(Page));
