import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { DataSet, Spin, Modal, Button, Table } from 'choerodon-ui/pro';
import { Popover, Tag, Card } from 'choerodon-ui';
import querystring from 'querystring';
import { isEmpty, noop, throttle, compose, omit, isNumber, isArray } from 'lodash';
import { observer } from 'mobx-react';
import classnames from 'classnames';

import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import intl from 'utils/intl';
import { getActiveTabKey } from 'utils/menuTab';
import { Header } from 'components/Page';
import {
  getResponse,
  getCurrentOrganizationId,
  filterNullValueObject,
  getCurrentTenant,
} from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  getDocumentTypeName,
  // getSourceCategoryName,
  getQuotationName,
  getCategoryCode,
} from '@/utils/globalVariable';
import DynamicButtons from '_components/DynamicButtons';
import remote from 'hzero-front/lib/utils/remote';
import { SRM_SSRC } from '_utils/config';
import { openTenderPayModal } from 'srm-front-ssta/lib/utils/expose';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import notification from 'utils/notification';

import { idValidation } from '@/routes/components/Widget/dataVerification';

import SectionPanel from '@/routes/components/SectionPanel';

import {
  validationResultDS,
  sectionBiddingPromptDataSet,
} from '@/routes/ssrc/RFSupplierQuotation/Apply/Stores/validationResultDS';
import {
  fetchHeaderInParticipateNew,
  participateNew,
  abandonNew,
  quotationBatchInsertExpens,
  fetchNewQuotationConfigSheet,
  quotationInsertExpens,
} from '@/services/supplierQutationService';
import { isText } from '@/utils/utils';
import { queryEnableDoubleUnit } from '@/services/commonService';
import { fetchConfigSheet } from '@/services/inquiryHallNewService';
import { RFQTableDS } from '@/routes/ssrc/RFSupplierQuotation/RFX/RFQDS';
import Style from './index.less';

import BasicForm from './Page/BasicForm';
import PrequalForm from './Page/PrequalForm';
import QuotationLineTable from './Page/QuotationLineTable';

import abandonModal from '../Apply/Modals/Abandon/index';
import ValidationResultModal from './Modals/ValidationResultModal.js';

import { formDS } from './Stores/formDS';
import { quoteLineDS } from './Stores/quoteLineDS';

/**
 * @search
 * 可选参数 sectionFlag, projectLineSectionId
 */
const ApplyComponent = (props = {}) => {
  const {
    history = {},
    location: { pathname, search },
    match: { params = {} },
    customizeTable = noop,
    customizeForm = noop,
    customizeCollapseForm = noop,
    customizeBtnGroup = noop,
    custLoading = false,
    bidFlag = false,
    quotationRemote = null,
  } = props;

  const { rfxHeaderId, supplierCompanyId } = params || {};
  const searchData = querystring.parse(search.substr(1));
  const {
    sectionFlag = 0,
    projectLineSectionId = null,
    pageType = '',
    supplierTenantId: _supplierTenantId = '',
  } = searchData;
  const supplierTenantId = isNumber(Number(_supplierTenantId))
    ? Number(_supplierTenantId)
    : _supplierTenantId;
  const [loading, setLoading] = useState(false);
  const [isBatchMaintainSection, setIsBatchMaintainSection] = useState(false); // 是否选批量操作标段
  const [doubleUnitFlag, setDoubleUnitFlag] = useState(false); // 判断是否开启双单位
  const [quotationInfos, setQuotationInfos] = useState({});
  const [serviceChargeFlag, setServiceChargeFlag] = useState(false);

  const SectionRef = useRef({});
  const AbandonRef = useRef({}); // 放弃Modalref

  const organizationId = getCurrentOrganizationId();
  const documentTypeName = getDocumentTypeName(bidFlag);
  const categoryCode = getCategoryCode(bidFlag);
  const quotationName = getQuotationName(bidFlag);
  const activeTabKey = getActiveTabKey();
  const basicFormDs = formDS({ bidFlag, documentTypeName, quotationName });
  const basicFormDS = useMemo(
    () =>
      new DataSet(
        quotationRemote
          ? quotationRemote.process('SSRC_RFSUPPLIER_QUOTATION_APPLY_BASIC_DS', basicFormDs)
          : basicFormDs
      ),
    [rfxHeaderId, supplierCompanyId, search]
  );

  const currentQuotationLineDS = useMemo(
    () =>
      quoteLineDS({
        bidFlag,
        documentTypeName,
        quotationName,
      }),
    [rfxHeaderId, supplierCompanyId, search, bidFlag]
  );

  const quotationLineDS = useMemo(
    () =>
      new DataSet(
        quotationRemote
          ? quotationRemote.process(
              'SSRC_RFSUPPLIER_QUOTATION_APPLY_QUOTATIONLINE_DS',
              currentQuotationLineDS,
              {
                pageProps: props,
              }
            )
          : currentQuotationLineDS
      ),
    [rfxHeaderId, supplierCompanyId, search, bidFlag, currentQuotationLineDS]
  );

  /**
   * 列表页，全部查询具体单据
   */
  const currentQuotationInfoDs = useMemo(
    () =>
      new DataSet(
        RFQTableDS({
          bidFlag,
          currentTable: 'all',
        })
      ),
    [rfxHeaderId, supplierCompanyId, search, bidFlag]
  );

  const validateDS = useMemo(() => new DataSet(validationResultDS()), [
    rfxHeaderId,
    supplierCompanyId,
    search,
  ]);

  const sectionBiddingPromptDS = useMemo(() => new DataSet(sectionBiddingPromptDataSet()), [
    rfxHeaderId,
    supplierCompanyId,
    search,
  ]);

  // 触发页面loading
  const toggleLoading = (loadingFlag = false) => {
    setLoading(loadingFlag);
  };

  useEffect(() => {
    initPage();
    fetchServiceChargeConfig();
  }, [rfxHeaderId, supplierCompanyId, search]);

  const {
    preQualificationFlag,
    rfxNum,
    rfxTitle,
    sourceMethod: sourceMethodPro,
    secondarySourceCategoryMeaning,
    projectLineSectionList = [],
    quotationHeaderCurrentId,
    // biddingFlag,
  } = basicFormDS.current
    ? basicFormDS.current?.get([
        'preQualificationFlag',
        'rfxNum',
        'rfxTitle',
        'sourceMethod',
        'secondarySourceCategoryMeaning',
        'projectLineSectionList',
        'quotationHeaderCurrentId',
        'biddingFlag',
      ])
    : {};

  const initPage = useCallback(() => {
    fetchHeader();
  }, [fetchHeader, pathname, search]);

  const fetchHeader = useCallback(async () => {
    if (!rfxHeaderId || !supplierCompanyId) {
      return;
    }

    const paramData = {
      organizationId,
      rfxHeaderId,
      supplierCompanyId,
      customizeUnitCode: `${getCustomizeUnitCode('baseForm')},${getCustomizeUnitCode(
        'prequalForm'
      )}`,
    };
    if (!quotationLineDS) {
      return;
    }
    quotationLineDS.setQueryParameter('commonProps', {
      ...paramData,
      customizeUnitCode: getCustomizeUnitCode('table'),
    });

    let result = null;
    toggleLoading(true);
    try {
      result = await fetchHeaderInParticipateNew(paramData);
      result = getResponse(result);
      const { tenantId } = result || {};
      if (sectionFlag && sourceMethodPro !== 'INVITE') {
        const res = await quotationBatchInsertExpens({
          sourceId: rfxHeaderId,
          expensesType: 'TENDER_FEE',
          tenantId,
          supplierTenantId,
          supplierCompanyId,
        });
        getResponse(res);
      }
      queryDoubleUnit(result?.tenantId);
      toggleLoading();
      await fetchItemLine();
      if (!result) {
        return;
      }

      basicFormDS.loadData([result]);

      await fetchCurrentQuotationInfos();
    } catch (e) {
      throw e;
    } finally {
      toggleLoading();
    }
  }, [
    organizationId,
    rfxHeaderId,
    supplierCompanyId,
    basicFormDS,
    quotationLineDS,
    getCustomizeUnitCode,
  ]);

  // 查询双单位是否开启
  const queryDoubleUnit = async (tenantId) => {
    const res = await queryEnableDoubleUnit({
      businessModule: 'RFX',
      tenantId,
    });
    if (isText(res)) {
      quotationLineDS.setState('doubleUnitFlag', !!Number(res));
      setDoubleUnitFlag(!!Number(res));
    }
  };

  /**
   * 查询配置表--是否展示标书下载节点
   *
   * 代码来源
   * src/routes/ssrc/RFSupplierQuotation/index.js
   * */
  const fetchServiceChargeConfig = async () => {
    let data = null;

    try {
      data = await fetchConfigSheet({
        organizationId,
        configCode: 'ssrc_expenses_online_payment_blacklist',
        data: {
          tenantNum: getCurrentTenant().tenantNum,
        },
      });
      data = getResponse(data);
      if (!(!isEmpty(data) && isArray(data) && data[0].id)) {
        setServiceChargeFlag(true);
      }
    } catch (e) {
      throw e;
    }
  };

  // 查询当前单据 配置表 是否使用新报价
  const newQuotationConfigSheet = async () => {
    let newQuotationFlag = false;
    idValidation(rfxHeaderId);

    const param = {
      organizationId,
      rfxHeaderId,
    };

    let result = null;
    try {
      result = await fetchNewQuotationConfigSheet(param);
      if (result !== 1 && result !== 0) {
        result = getResponse(result);
        return '-1';
      }

      if (result === 1) {
        newQuotationFlag = true;
      }
    } catch (e) {
      throw e;
    }
    return newQuotationFlag;
  };

  /**
   * 获取对应的个性化编码
   *  */
  const getCustomizeUnitCode = useCallback(
    (type = 'all') => {
      const RfxCode = {
        headerButtons: 'SSRC.SUPPLIER_REPLY_NEW.APPLY_HEADER_BUTTONS',
        detailHeaderButtons: 'SSRC.SUPPLIER_REPLY_NEW.DETAIL_APPLY_HEADER_BUTTONS',
        baseForm: 'SSRC.SUPPLIER_REPLY_NEW.APPLY_BASE',
        prequalForm: 'SSRC.SUPPLIER_REPLY_NEW.APPLY_PREQUAL',
        table: 'SSRC.SUPPLIER_REPLY_NEW.APPLY_LINE',
        abandonForm: 'SSRC.SUPPLIER_REPLY_NEW.ABANDON_QUOTATION',
        all:
          'SSRC.SUPPLIER_REPLY_NEW.APPLY_BASE,SSRC.SUPPLIER_REPLY_NEW.APPLY_PREQUAL,SSRC.SUPPLIER_REPLY_NEW.APPLY_LINE,SSRC.SUPPLIER_REPLY_NEW.ABANDON_QUOTATION',
      };
      const BidCode = {
        headerButtons: 'SSRC.SUPPLIER_REPLY_BID.APPLY_HEADER_BUTTONS_BID',
        detailHeaderButtons: 'SSRC.SUPPLIER_REPLY_BID.DETAIL_APPLY_HEADER_BUTTONS_BID',
        baseForm: 'SSRC.SUPPLIER_REPLY_BID.APPLY_BASE_BID',
        prequalForm: 'SSRC.SUPPLIER_REPLY_BID.APPLY_PREQUAL_BID',
        table: 'SSRC.SUPPLIER_REPLY_BID.APPLY_LINE_BID',
        abandonForm: 'SSRC.SUPPLIER_REPLY_BID.ABANDON_BID',
        all:
          'SSRC.SUPPLIER_REPLY_BID.APPLY_BASE_BID,SSRC.SUPPLIER_REPLY_BID.APPLY_PREQUAL_BID,SSRC.SUPPLIER_REPLY_BID.APPLY_LINE_BID,SSRC.SUPPLIER_REPLY_BID.ABANDON_BID',
      };

      return !bidFlag ? RfxCode[type] : BidCode[type];
    },
    [pathname, search, bidFlag]
  );

  // 查询物料行
  const fetchItemLine = useCallback(() => {
    quotationLineDS.query();
  }, [pathname, search, quotationLineDS]);

  /**
   * 查询当前报价单信息
   *
   * 需要把列表页的报价按钮逻辑移动到这里，需要保持统一
   */
  const fetchCurrentQuotationInfos = useCallback(async () => {
    const { current } = basicFormDS || {};
    const { quotationHeaderId } = current ? current.get(['quotationHeaderId']) : {};

    if (!rfxHeaderId || !quotationHeaderId) {
      return;
    }

    currentQuotationInfoDs.setQueryParameter('rfxHeaderIds', rfxHeaderId);
    currentQuotationInfoDs.setQueryParameter('quoBenchQueryQuotationHeaderId', quotationHeaderId);
    const currentData = await currentQuotationInfoDs.query();

    const { content } = currentData || {};

    if (isEmpty(content)) {
      return;
    }

    setQuotationInfos(content[0] || {});

    // 如果查询到大于1条数据，说明错误
    if (currentQuotationInfoDs.length > 1) {
      throw new Error(`QUERY ERROR !`);
    }
  }, [pathname, search, basicFormDS]);

  /**
   * 获取标段勾选数据
   */
  const getSelectedProjectList = () => {
    let sectionData = null;
    const { getCheckedSectionList } = SectionRef?.current || {};

    if (!isEmpty(projectLineSectionList) && typeof getCheckedSectionList === 'function') {
      sectionData = getCheckedSectionList();
    }

    return sectionData;
  };

  // 提交-数据整理,校验
  const getCurrentPageSubmitData = useCallback(
    (paramData = {}) => {
      // const bidSectionDataFlag = getBindSectionData(); // 是否有标段数据
      let sectionData = null;
      if (!isEmpty(projectLineSectionList)) {
        const { getCheckedSectionList } = SectionRef.current || {};
        sectionData = getCheckedSectionList();
      }

      const headerData = basicFormDS?.current?.toData();
      const { rfxHeaderId: currentRfxHeaderId, sourceMethod } = headerData || {};

      if (!currentRfxHeaderId || !supplierCompanyId) {
        return;
      }

      let mainData = [headerData];
      if (!isEmpty(sectionData)) {
        mainData = sectionData.map((sectionItem = {}) => {
          const {
            sourceHeaderId: sectionSourceHeaderId = null,
            sourceRoundNumber,
            sourceObjectVersionNumber,
          } = sectionItem || {};
          return {
            ...(sectionItem || {}),
            rfxHeaderId: sectionSourceHeaderId,
            roundNumber: sourceRoundNumber,
            objectVersionNumber: sourceObjectVersionNumber,
            tenantId: organizationId,
          };
        });
      }

      return {
        organizationId,
        tenantId: organizationId,
        rfxHeaderId: currentRfxHeaderId,
        supplierCompanyId,
        sourceMethod,
        customizeUnitCode: getCustomizeUnitCode('all'),
        rfxQuotationParticipateDTOS: mainData,
        ...paramData,
      };
    },
    [pathname, search, basicFormDS, projectLineSectionList?.length]
  );

  // 处理提交前校验逻辑
  const handleValidationResult = useCallback(
    (data = {}) => {
      const {
        res = {},
        confirmSubmit = noop,
        afterSuccessSubmit = noop,
        // validationStageFlag = 0, // 校验阶段标识
      } = data || {};
      const result = getResponse(res);
      if (!result || isEmpty(result)) {
        return;
      }

      const { validateResults = [], rfxQuotationHeaderCurDTOS = [] } = result;
      const selectSelectionDto = getSelectedProjectList();

      if (isEmpty(validateResults)) {
        const currentHeader = (rfxQuotationHeaderCurDTOS || []).find(
          (resultLine) => resultLine.rfxHeaderId === rfxHeaderId
        );
        afterSuccessSubmit(currentHeader, result);
        return;
      }

      if (!isEmpty(validateResults)) {
        const errorsMap = { lists: [], description: '' };
        const warningsMap = { lists: [], description: '' };
        let title = intl.get('ssrc.rf.view.title.warningInfo').d('以下验证未通过，确认发布吗？');

        validateResults.forEach((validateLine = {}) => {
          const { type } = validateLine;
          if (type === 'ERROR') {
            // 校验失败
            errorsMap.lists.push(validateLine);
          }

          if (type === 'WARNING') {
            warningsMap.lists.push(validateLine);
          }
        });

        if (errorsMap.lists.length) {
          const allErrorList = [...errorsMap.lists, ...warningsMap.lists];
          validateDS.loadData(allErrorList);
          title = intl.get('ssrc.rf.view.title.errorInfo').d('提交失败，以下内容验证不通过');
        }

        if (warningsMap.lists.length && !errorsMap.lists.length) {
          validateDS.loadData(warningsMap.lists);
        }

        Modal.open({
          key: Modal.key(),
          closable: true,
          style: {
            width: '600px',
          },
          title,
          footer: !!errorsMap.lists.length,
          children: (
            <ValidationResultModal ds={validateDS} sectionFlag={selectSelectionDto?.length > 1} />
          ),
          onOk: () => confirmSubmit(),
          onCancel: () => {
            validateDS.loadData();
            validateDS.reset();
          },
          okProps: {
            loading,
          },
        });
      }
    },
    [pathname, basicFormDS, projectLineSectionList?.length, loading]
  );

  // 调用远程参与接口
  const handleParticipate = useCallback(
    async (data = {}) => {
      if (loading) {
        return;
      }

      let result = null;
      try {
        toggleLoading(true);
        result = await participateNew(data);
        toggleLoading();

        result = getResponse(result);
      } catch (e) {
        throw e;
      } finally {
        toggleLoading();
      }

      return result;
    },
    [search, pathname, loading]
  );

  // 参与
  const onParticipate = useCallback(
    throttle(async () => {
      const data = getCurrentPageSubmitData();
      if (!data) {
        return;
      }

      // 二次提交确认
      const confirmSubmit = throttle(async (newData = {}) => {
        if (loading) {
          return;
        }

        let result = null;
        const submitInnerData = { passFlag: 1 }; // 通过passFlag确定是校验还是提交
        result = await handleParticipate({ ...data, ...submitInnerData, ...newData });
        result = getResponse(result);
        if (!result || isEmpty(result)) {
          return;
        }

        handleValidationResult({
          res: result,
          validationStageFlag: 0,
          afterSuccessSubmit: (res, allResult) => {
            successParticipate(res, allResult);
          },
        });
      }, 1000);

      let cuxFlag = true;
      if (quotationRemote?.event) {
        // 给state中设置二开的值
        cuxFlag = await quotationRemote.event.fireEvent('remoteBeforeOnParticipate', {
          data,
          pageProps: props,
          basicFormDS,
        });

        if (cuxFlag === false) {
          return false;
        }
      }

      let result = null;
      try {
        result = await handleParticipate(data);
        handleValidationResult({
          res: result,
          validationStageFlag: 1,
          confirmSubmit: (newSubmitData) => confirmSubmit(newSubmitData),
          afterSuccessSubmit: async (res, allResult) => {
            successParticipate(res, allResult);
          },
        });
      } catch (e) {
        throw e;
      }
    }, 1500),
    [
      search,
      pathname,
      basicFormDS,
      quotationLineDS,
      handleValidationResult,
      getCurrentPageSubmitData,
      successParticipate,
      handleParticipate,
      projectLineSectionList,
      loading,
    ]
  );

  const getBiddingSectionApplyPromptMessage = (item) => {
    const {
      biddingSignInFlag,
      supplierNumberPlate, // 号牌
    } = item || {};
    let confirmContent = '';

    if (!biddingSignInFlag) {
      // 未签到
      confirmContent = intl
        .get('ssrc.biddingHall.view.title.successBiddingParticipateOnlySection')
        .d('恭喜您报名成功');
      if (supplierNumberPlate) {
        confirmContent = intl
          .get('ssrc.biddingHall.view.successParticipateOpenSupplierSection', {
            supplierNumberPlate,
          })
          .d('恭喜您报名成功, 您的牌号是{supplierNumberPlate}');
      }
    }

    if (biddingSignInFlag) {
      if (supplierNumberPlate) {
        confirmContent = intl
          .get('ssrc.biddingHall.view.successSignInAndParticipateOpenSupplierSection', {
            supplierNumberPlate,
          })
          .d('恭喜您报名并签到成功, 您的牌号是{supplierNumberPlate}');
      }

      if (!supplierNumberPlate) {
        confirmContent = intl
          .get('ssrc.biddingHall.view.title.successSignInAndParticipateHiddenPlatSection')
          .d('恭喜您报名并签到成功');
      }
    }

    return confirmContent;
  };

  const sectionBiddingPromptColumns = useMemo(
    () => [
      {
        name: 'sectionNum',
        width: 100,
      },
      {
        name: 'sectionName',
        width: 100,
      },
      {
        name: 'confirmContent',
      },
    ],
    []
  );

  const handleBiddingSectionApply = async (allResult) => {
    const { rfxQuotationHeaderCurDTOS } = allResult || {};

    if (isEmpty(rfxQuotationHeaderCurDTOS)) {
      return;
    }

    const newData = rfxQuotationHeaderCurDTOS.map((item) => {
      const confirmContent = getBiddingSectionApplyPromptMessage(item);

      return {
        ...item,
        confirmContent,
      };
    });

    await sectionBiddingPromptDS.loadData(newData);

    Modal.confirm({
      title: '',
      children: (
        <div>
          <Table
            dataSet={sectionBiddingPromptDS}
            rowKey="rfxHeaderId"
            columns={sectionBiddingPromptColumns}
            pagination={false}
            border
            style={{ maxHeight: 600 }}
            virtual
          />
        </div>
      ),
      onOk: directionList,
      onClose: directionList,
      onCancel: directionList,
    });
  };

  // 参与成功
  const successParticipate = useCallback(
    async (result = {}, allResult = {}) => {
      const { jumpQuoteFlag = 0, biddingFlag: currentBiddingFlag = 0 } = result || {};
      const { rfxQuotationHeaderCurDTOS } = allResult || {};

      let cuxAfterOperateFlag = true;
      if (quotationRemote?.event) {
        // 给state中设置二开的值
        cuxAfterOperateFlag = await quotationRemote.event.fireEvent('remoteAfterOnParticipate', {
          pageProps: props,
          basicFormDS,
          result,
          allResult,
        });

        if (cuxAfterOperateFlag === false) {
          return false;
        }
      }

      const jumpQuoteList = !jumpQuoteFlag || jumpQuoteFlag === '0';
      const newBiddingHallFlag = currentBiddingFlag === 1 || currentBiddingFlag === '1';

      if (newBiddingHallFlag) {
        // 竞价大厅逻辑
        const currentSection = rfxQuotationHeaderCurDTOS?.length > 1 || sectionFlag === '1'; // 多标点直接跳列表

        if (currentSection) {
          handleBiddingSectionApply(allResult);
          return;
        }

        if (jumpQuoteList) {
          directionList();
          return;
        }

        biddingHallOperation(result);
        return;
      }

      if (jumpQuoteList) {
        directionList();
        return;
      }

      if (jumpQuoteFlag) {
        directionQuotation(result);
      }
    },
    [onParticipate, pathname]
  );

  // 放弃
  const onAbandon = useCallback(() => {
    if (!rfxHeaderId) {
      return;
    }

    abandonModal({ bidFlag, AbandonRef, abandonOk, cancelAbandon });
  }, [pathname, search, basicFormDS, projectLineSectionList, bidFlag, AbandonRef]);

  // 调用放弃接口
  const handleAbandon = useCallback(
    async (data = {}) => {
      if (loading) {
        return;
      }

      let result = null;
      try {
        toggleLoading(true);
        const submitData = {
          ...data,
          customizeUnitCodeAbandon: getCustomizeUnitCode('abandonForm'),
        };
        result = await abandonNew(submitData);
        toggleLoading();

        result = getResponse(result);
      } catch (e) {
        throw e;
      } finally {
        toggleLoading();
      }

      return result;
    },
    [pathname, search, basicFormDS, loading]
  );

  // 放弃-确定
  const abandonOk = useCallback(
    throttle(async () => {
      const abandonData = AbandonRef?.current?.formDS?.current?.toData() || {};
      if (isEmpty(omit(abandonData, '__dirty'))) {
        return false;
      }

      const data = getCurrentPageSubmitData();
      if (!data) {
        return;
      }

      // 二次提交确认
      const confirmSubmit = throttle(async (newData) => {
        let result = null;
        const submitInnerData = { passFlag: 1 }; // 通过passFlag确定是校验还是提交
        result = await handleAbandon({ ...data, ...submitInnerData, ...newData });
        result = getResponse(result);
        if (!result || isEmpty(result)) {
          return;
        }

        handleValidationResult({
          res: result,
          validationStageFlag: 0,
          afterSuccessSubmit: () => {
            directionList();
          },
        });
      }, 800);

      const submitData = {
        ...data,
        ...abandonData,
      };

      let result = null;
      try {
        result = await handleAbandon(submitData);
        handleValidationResult({
          res: result,
          validationStageFlag: 1,
          confirmSubmit: (newSubmitData) => confirmSubmit(newSubmitData),
          afterSuccessSubmit: () => {
            directionList();
          },
        });
      } catch (e) {
        throw e;
      }
    }, 1500),
    [pathname, search, basicFormDS, quotationLineDS, projectLineSectionList]
  );

  // 跳转到报价
  const directionQuotation = useCallback(
    (result = {}) => {
      const { quotationHeaderId = null } = result || {};
      if (!quotationHeaderId) {
        return;
      }
      let newSearch = {
        sectionFlag: parseInt(sectionFlag, 10) === 1 ? 1 : null,
        projectLineSectionId,
      };

      newSearch = querystring.stringify(filterNullValueObject(newSearch));

      history.push({
        pathname: `${activeTabKey}/quotation/${quotationHeaderId}`,
        search: newSearch,
      });
    },
    [pathname, search]
  );

  // 竞价大厅
  const biddingHallOperation = (result) => {
    const {
      biddingSignInFlag,
      supplierNumberPlate, // 号牌
    } = result || {};

    let confirmContent = '';

    if (!biddingSignInFlag) {
      // 未签到
      confirmContent = intl
        .get('ssrc.biddingHall.view.title.successBiddingParticipateOnly')
        .d('恭喜您报名成功, 请点击确定按钮进入竞价大厅');
      if (supplierNumberPlate) {
        confirmContent = (
          <span>
            {intl
              .get('ssrc.biddingHall.view.successParticipateOpenSupplier', { supplierNumberPlate })
              .d('恭喜您报名成功, 您的牌号是{supplierNumberPlate}, 请点击确定按钮进入竞价大厅')}
          </span>
        );
      }
    }

    if (biddingSignInFlag) {
      if (supplierNumberPlate) {
        confirmContent = (
          <span>
            {intl
              .get('ssrc.biddingHall.view.successSignInAndParticipateOpenSupplier', {
                supplierNumberPlate,
              })
              .d(
                '恭喜您报名并签到成功, 您的牌号是{supplierNumberPlate}, 请点击确定按钮进入竞价大厅'
              )}
          </span>
        );
      }

      if (!supplierNumberPlate) {
        confirmContent = intl
          .get('ssrc.biddingHall.view.title.successSignInAndParticipateHiddenPlat')
          .d('恭喜您报名并签到成功，请点击确定按钮进入竞价大厅');
      }
    }

    Modal.confirm({
      title: intl
        .get('ssrc.biddingHall.view.modal.title.confirmEnterBiddingPlace')
        .d('确认进入竞价现场'),
      children: confirmContent,
      onOk: () => directionToBiddingHall(result),
      onCancel: directionList,
    });
  };

  // 跳转到竞价大厅
  const directionToBiddingHall = throttle((data = {}) => {
    const { rfxLineSupplierId, biddingTarget } = data || {};
    const currentActiveTabKey = getActiveTabKey();

    if (!rfxLineSupplierId || !biddingTarget) {
      return;
    }

    history.push({
      pathname: `/pub${currentActiveTabKey}/bidding-hall/${rfxLineSupplierId}/${biddingTarget}`,
    });
  }, 1200);

  // 跳转到列表页
  const directionList = useCallback(
    (data = {}) => {
      const { newSearch = {} } = data || {};
      const listSearch = querystring.stringify({
        ...newSearch,
        tab: 'onGoing',
      });

      history.push({
        pathname: `${activeTabKey}/list`,
        search: listSearch,
      });
    },
    [pathname]
  );

  // 取消放弃
  const cancelAbandon = useCallback(() => {}, [pathname, search]);

  // 切换选择标段按钮
  const switchSelectionSection = useCallback(() => {
    setIsBatchMaintainSection(!isBatchMaintainSection);
    resetSectionChecked();
  }, [pathname, search, isBatchMaintainSection]);

  // 重置标段勾选逻辑
  const resetSectionChecked = () => {
    const { current = {} } = SectionRef || {};
    if (isEmpty(current)) {
      return;
    }

    const { resetItemChecked = () => {} } = current || {};
    resetItemChecked();
  };

  /**
   * 跳转报价
   *
   * 代码来源
   * src/routes/ssrc/RFSupplierQuotation/index.js
   */
  const handleAfterDirectionQuotation = async (options = {}) => {
    const { quotationFlag = 1 } = options || {};
    const { quotationHeaderId } = quotationInfos || {};

    if (!quotationHeaderId) {
      return;
    }
    const newQuotationFlag = await newQuotationConfigSheet();

    if (newQuotationFlag === '-1') {
      return;
    }

    const CURRENTACTIVETABKEY = getActiveTabKey();
    const newSearchObj = {};
    if (sectionFlag === '1' && projectLineSectionId) {
      newSearchObj.sectionFlag = sectionFlag;
      newSearchObj.projectLineSectionId = projectLineSectionId;
    }
    const strSearch = querystring.stringify(filterNullValueObject(newSearchObj));

    if (newQuotationFlag) {
      if (serviceChargeFlag) {
        const serviceChargeApiParams = [
          {
            sourceId: rfxHeaderId,
            expensesType: 'DEPOSIT',
            supplierTenantId,
            supplierCompanyId,
          },
        ];
        quotationInsertExpens(serviceChargeApiParams).then((resp) => {
          if (getResponse(resp)) {
            directionQuotation(quotationInfos);
          }
        });
      } else {
        directionQuotation(quotationInfos);
      }
      return;
    }
    history.push({
      pathname: quotationFlag
        ? `${CURRENTACTIVETABKEY}/inquiry-price/${quotationHeaderId}`
        : `${CURRENTACTIVETABKEY}/bidding-offer/${quotationHeaderId}`,
      search: strSearch,
    });
  };

  /**
   * 点击报价按钮
   * 代码来自列表页
   * src/routes/ssrc/RFSupplierQuotation/index.js
   * */
  const handleQuotation = (options = {}) => {
    const { operationType } = options || {};
    const { prequalLineStatus, bidBondFlag } = quotationInfos || {};

    if (operationType === 'QUOTATION') {
      if (prequalLineStatus === 'NEW') {
        notification.warning({
          message: intl
            .get('ssrc.supplierQuotation.view.message.notSubmitPre')
            .d('预审申请未提交，不可报价'),
        });
      } else if (bidBondFlag) {
        notification.warning({
          message: serviceChargeFlag
            ? intl
                .get('ssrc.common.view.errorOperateForQuotationBidFilePleaseConcatUsers')
                .d(
                  '报价失败，失败原因是未缴纳保证金费，请及时缴纳。若已缴纳，请联系采购方人员及时确认'
                )
            : intl
                .get('ssrc.common.view.errorOperateForQuotationBidFilePleaseConcat')
                .d('操作失败，失败原因是未缴纳保证金，请缴纳后联系采购方修改缴纳状态'),
        });
      } else {
        handleAfterDirectionQuotation({ quotationFlag: 1 });
      }
    }

    if (operationType === 'ESTIMATED') {
      if (bidBondFlag) {
        notification.warning({
          message: serviceChargeFlag
            ? intl
                .get('ssrc.common.view.errorOperateForQuotationBidFilePleaseConcatUsers')
                .d(
                  '报价失败，失败原因是未缴纳保证金费，请及时缴纳。若已缴纳，请联系采购方人员及时确认'
                )
            : intl
                .get('ssrc.common.view.errorOperateForQuotationBidFilePleaseConcat')
                .d('操作失败，失败原因是未缴纳保证金，请缴纳后联系采购方修改缴纳状态'),
        });
        return;
      }

      handleAfterDirectionQuotation({ quotationFlag: 0 });
    }
  };

  // quotation button
  const getQuotationButtons = useCallback(() => {
    const { mainOperations } = quotationInfos || {};
    if (!mainOperations?.length) {
      return '';
    }

    let operationType = '';
    mainOperations.forEach((item) => {
      const { operation } = item || {};

      if (operation === 'QUOTATION' || operation === 'ESTIMATED') {
        operationType = operation;
      }
    });

    if (!operationType) {
      return '';
    }

    const button = (
      <Button
        name="quotation"
        funcType="flat"
        onClick={() => handleQuotation({ operationType })}
        loading={loading}
        icon="publish2"
        waitType="throttle"
        wait={1200}
      >
        {bidFlag
          ? intl.get('ssrc.common.model.common.bid').d('投标')
          : intl.get('ssrc.common.model.common.quotation').d('报价')}
      </Button>
    );

    return button;
  }, [quotationInfos, loading, currentQuotationInfoDs, params, search]);

  const pageButtons = useCallback(() => {
    const headerButtons = [
      {
        name: 'participate',
        btnType: 'c7n-pro',
        btnProps: {
          onClick: onParticipate,
          loading,
          color: 'primary',
          icon: 'person_pin',
        },
        child: intl.get(`ssrc.supplierQuotation.view.message.button.participate`).d('参与'),
      },
      {
        name: 'abandon',
        btnType: 'c7n-pro',
        btnProps: {
          onClick: onAbandon,
          loading,
          icon: 'cancel',
          funcType: 'flat',
        },
        child: intl.get(`ssrc.supplierQuotation.view.message.giveUp`).d('放弃'),
      },
      {
        name: 'selectionGroup',
        btnType: 'c7n-pro',
        hidden: !isBidSectionData,
        btnProps: {
          onClick: switchSelectionSection,
          loading,

          icon: !isBatchMaintainSection ? 'auto_complete' : 'cancel',
          funcType: 'flat',
        },
        child: !isBatchMaintainSection
          ? intl.get(`ssrc.common.view.button.selectBidSectionBtn`).d('选择标段')
          : intl.get(`ssrc.common.view.button.cancelSelect`).d('取消选择'),
      },
    ].filter(Boolean);

    const remoteHeaderButtons = quotationRemote
      ? quotationRemote.process(
          'SSRC_RFSUPPLIER_QUOTATION_APPLY_PROCESS_HEADER_BUTTONS',
          headerButtons,
          {
            loading,
            rfxHeaderId,
            supplierCompanyId,
          }
        )
      : headerButtons;
    return <DynamicButtons buttons={remoteHeaderButtons} />;
  }, [
    isBidSectionData,
    isBatchMaintainSection,
    pathname,
    search,
    getBindSectionData,
    projectLineSectionList,
    loading,
    quotationRemote,
    rfxHeaderId,
    supplierCompanyId,
  ]);

  // bindref section panel
  const bindRef = useCallback(
    (ref) => {
      SectionRef.current = ref || {};
    },
    [basicFormDS]
  );

  // 定位到当前页面
  const locatedCurrentUrl = useCallback(
    (data = {}) => {
      const {
        sourceHeaderId = null,
        supplierCompanyId: currentSupplierCompanyId = null,
        projectLineSectionId: currentProjectLineSectionId = null,
      } = data || {};
      if (!sourceHeaderId || !currentSupplierCompanyId) {
        return;
      }

      const newSearch = querystring.stringify({
        ...searchData,
        // rfxHeaderId: sourceHeaderId,
        // supplierCompanyId: currentSupplierCompanyId,
        projectLineSectionId: currentProjectLineSectionId,
      });

      history.push({
        pathname: `${activeTabKey}/apply/${sourceHeaderId}/${currentSupplierCompanyId}`,
        search: newSearch,
      });
    },
    [search, pathname, activeTabKey]
  );

  // 基础信息-title
  const renderBasicTitle = useCallback(() => {
    const { current } = basicFormDS || {};

    if (!current) {
      return '';
    }

    const baseTitle = rfxNum && rfxTitle ? `${rfxNum}—${rfxTitle}` : rfxNum || rfxTitle || '';

    return (
      <div className={Style['card-title']}>
        <span style={{ verticalAlign: 'middle' }}>
          <Popover content={baseTitle}>{baseTitle}</Popover>
        </span>

        <span className={Style['card-title-category']}>
          <Tag color="gray" style={{ border: 'none' }}>
            {secondarySourceCategoryMeaning}
          </Tag>
        </span>
      </div>
    );
  }, [pathname, search, basicFormDS, rfxNum, rfxTitle]);

  // 基础信息-title
  const renderCommonHeader = useCallback(() => {
    const { current } = basicFormDS || {};

    if (!current) {
      return '';
    }

    const { tenderFeePayButtonFlag = 0 } = current.get(['tenderFeePayButtonFlag']);
    let buttons = [
      tenderFeePayButtonFlag === 1 ? (
        <Button onClick={bidFileExpensePayment} funcType="flat" name="fileFee">
          {intl.get(`ssrc.supplierQuotation.view.button.bidFileExpensePayment`).d('招标文件费缴纳')}
        </Button>
      ) : null,
      getQuotationButtons(), // quotation button
    ].filter(Boolean);

    buttons = quotationRemote
      ? quotationRemote.process(
          'SSRC_RFSUPPLIER_QUOTATION_APPLY_PROCESS_DETAIL_HEADER_BUTTONS',
          buttons,
          { basicFormDS, pageType, fetchHeader }
        )
      : buttons;

    return customizeBtnGroup(
      {
        code: getCustomizeUnitCode('detailHeaderButtons'),
        pre: false,
      },
      buttons
    );
  }, [basicFormDS, pageType, fetchHeader, getQuotationButtons, search, params]);

  const bidFileExpensePayment = useCallback(() => {
    const { current } = basicFormDS || {};

    if (!current) {
      return '';
    }

    const { bidFileExpenseNum = '' } = current.get(['bidFileExpenseNum']);
    openTenderPayModal({ tenderFeesNum: bidFileExpenseNum, dataSource: 'SOURCE' });
  }, [basicFormDS, params, quotationInfos, search]);

  // 获取标段数据
  const getBindSectionData = useCallback(() => {
    // const { isSectionListEmpty } = SectionRef?.current || {};
    // if (!isSectionListEmpty) {
    //   return false;
    // }

    // const notEmptyFlag = isSectionListEmpty();
    // return !notEmptyFlag;

    return !isEmpty(projectLineSectionList);
  }, [search, pathname, projectLineSectionList?.length, basicFormDS]);

  /**
   * 【基本信息】 后边埋点
   */
  const cuxCardAfterBasic = useCallback(() => {
    let cuxCardDom = '';
    cuxCardDom = quotationRemote
      ? quotationRemote.process(
          'SSRC_RFSUPPLIER_QUOTATION_APPLY_PROCESS_CUX_AFTER_BASIC_DOM',
          cuxCardDom,
          {
            pageProps: props,
            basicFormDS,
          }
        )
      : cuxCardDom;

    return cuxCardDom;
  }, [quotationRemote, rfxHeaderId]);

  const renderExcelExportLineButton = useCallback(() => {
    if (!quotationHeaderCurrentId) {
      return '';
    }

    const exportProps = {
      templateCode: !bidFlag
        ? 'SRM_C_SRM_SSRC_RFX_QUOTATION_CUR_DOWNLOAD_EXPORT'
        : 'SRM_C_SRM_SSRC_BID_QUOTATION_CUR_DOWNLOAD_EXPORT',
      requestUrl: `${SRM_SSRC}/v2/${organizationId}/rfx/supplier/items/quotation/lines/export?quotationHeaderCurrentId=${quotationHeaderCurrentId}`,
      queryArea: { fillerType: 'multi-sheet', async: false },
      queryParams: {
        customizeUnitCode: getCustomizeUnitCode('table'),
        quotationHeaderCurrentId,
      },
      otherButtonProps: {
        style: {
          fontSize: '12px',
          marginLeft: '8px',
        },
        funcType: 'flat',
        disabled: !quotationHeaderCurrentId,
      },
    };

    return <ExcelExportPro {...exportProps} />;
  }, [quotationHeaderCurrentId, bidFlag]);

  const isBidSectionData = getBindSectionData();

  // common props
  const CommonProps = {
    basicFormDS,
    organizationId,
    rfxHeaderId,
    supplierCompanyId,
    getCustomizeUnitCode,
    isBidSectionData,
    bidFlag,
    pageType,
  };

  // 表单props
  const FormProps = {
    ...CommonProps,
    customizeCollapseForm,
    custLoading,
    customizeForm,
    quotationRemote,
  };

  const SectionPanelProps = {
    locatedCurrentUrl,
    parentPage: {
      name: 'participation',
      queryParams: {
        sectionBatchMaintainType: 'PARTICIPATE',
        rfxHeaderId,
        supplierCompanyId,
      },
    },
    projectLineSectionId,
    paramKeys: ['sourceHeaderId', 'supplierCompanyId'],
    getWrapperClassName: ({ openedFlag = 0 }) => {
      if (openedFlag) {
        return Style['ssrc-supplier-container-new-container'];
      }
    },
    isSection: sectionFlag,
    isBatchMaintainSection,
    onRef: bindRef,
  };

  const quotationLineProps = {
    ...CommonProps,
    quotationLineDS,
    customizeTable,
    custLoading,
    doubleUnitFlag,
    quotationRemote,
  };

  const headerTitle = useMemo(() => {
    return pageType === 'detail'
      ? intl
          .get(`ssrc.inquiryHall.view.message.title.RFXDetailRFX`, {
            categoryCode,
          })
          .d('{categoryCode}明细')
      : intl
          .get(`ssrc.supplierQuotation.view.message.title.supplierApplyQuotation`)
          .d('供应商参与');
  }, [pageType]);

  return (
    <>
      <Header backPath={`${activeTabKey}/list`} title={headerTitle}>
        {pageType !== 'detail' &&
          customizeBtnGroup(
            {
              code: getCustomizeUnitCode('headerButtons'),
              pro: true,
            },
            pageButtons()
          )}
        {renderCommonHeader()}
      </Header>
      <div className={classnames(Style['supplier-apply-list-wrap'])}>
        <Spin spinning={loading} wrapperClassName={Style['supplier-apply-spin-wrapper']}>
          <SectionPanel {...SectionPanelProps}>
            <div className={Style['supplier-apply-main-content-wrap']}>
              <div className={classnames(Style['supplier-apply-wrapper'])}>
                <Card id="rfxBasicInfo" title={renderBasicTitle()} bordered={false}>
                  <BasicForm {...FormProps} />
                </Card>
                {cuxCardAfterBasic()}
                {preQualificationFlag === 1 ? (
                  <Card
                    id="rfxPrequalBasicInfo"
                    title={intl.get('ssrc.common.prequalBasicInfo').d('资格预审信息')}
                    bordered={false}
                  >
                    <PrequalForm {...FormProps} />
                  </Card>
                ) : null}
                <Card
                  id="rfxQuotationLineTable"
                  title={
                    <div>
                      <span>
                        {intl
                          .get(`ssrc.inquiryHall.model.inquiryHall.itemDetailTable`)
                          .d('物料明细表')}
                      </span>

                      <span>{renderExcelExportLineButton()}</span>
                    </div>
                  }
                  bordered={false}
                >
                  <QuotationLineTable {...quotationLineProps} />
                </Card>
              </div>
            </div>
          </SectionPanel>
        </Spin>
      </div>
    </>
  );
};

const hocComponent = (NewComponent, options = {}) => {
  const { bidFlag = false } = options || {};
  const RfxUnitCode = [
    'SSRC.SUPPLIER_REPLY_NEW.APPLY_HEADER_BUTTONS', // 头部按钮
    'SSRC.SUPPLIER_REPLY_NEW.DETAIL_APPLY_HEADER_BUTTONS', // 明细-头按钮组
    'SSRC.SUPPLIER_REPLY_NEW.APPLY_BASE', // 基础信息
    'SSRC.SUPPLIER_REPLY_NEW.APPLY_PREQUAL', // 资格预审
    'SSRC.SUPPLIER_REPLY_NEW.APPLY_LINE', // 物料明细-table
  ];

  const BidUnitCode = [
    'SSRC.SUPPLIER_REPLY_BID.APPLY_HEADER_BUTTONS_BID', // 头部按钮
    'SSRC.SUPPLIER_REPLY_BID.DETAIL_APPLY_HEADER_BUTTONS_BID', // 明细-头按钮组
    'SSRC.SUPPLIER_REPLY_BID.APPLY_BASE_BID', // 基础信息-BID
    'SSRC.SUPPLIER_REPLY_BID.APPLY_PREQUAL_BID', // 资格预审-BID
    'SSRC.SUPPLIER_REPLY_BID.APPLY_LINE_BID', // 物料明细-table
  ];

  const CurrentUnitCode = !bidFlag ? RfxUnitCode : BidUnitCode;

  return compose(
    formatterCollections({
      code: [
        'ssrc.supplierQuotation',
        'ssrc.bidHall',
        'ssrc.common',
        'ssrc.inquiryHall',
        'ssrc.offlineResultEntry',
        'ssrc.rf',
        'ssrc.biddingHall',
        'scux.ssrc',
      ],
    }),
    withCustomize({
      unitCode: CurrentUnitCode,
    }),
    remote(
      {
        code: 'SSRC_RFSUPPLIER_QUOTATION_APPLY',
        name: 'quotationRemote',
      },
      {
        events: {
          remoteBeforeOnParticipate() {},
          remoteAfterOnParticipate() {},
        },
      }
    )
  )(observer(NewComponent));
};

export default hocComponent(ApplyComponent);
export { hocComponent, ApplyComponent };
