import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { DataSet, Spin, Tooltip } from 'choerodon-ui/pro';
import { Tag, Card } from 'choerodon-ui';
import querystring from 'querystring';
import { noop, compose, isNil } from 'lodash';
import { observer } from 'mobx-react';
import classnames from 'classnames';

import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import intl from 'utils/intl';
import { getActiveTabKey } from 'utils/menuTab';
import { Header } from 'components/Page';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  getDocumentTypeName,
  // getSourceCategoryName,
  getQuotationName,
} from '@/utils/globalVariable';
// import { PRIVATE_BUCKET } from '_utils/config';
import DynamicButtons from '_components/DynamicButtons';
import remote from 'hzero-front/lib/utils/remote';
import PrintProButton from 'srm-front-boot/lib/components/PrintProButton';
import { SRM_SSRC } from '_utils/config';

import Style from '@/routes/ssrc/RFSupplierQuotation/Quotation/index.less';
import HistoryVersionListBtn from '@/routes/ssrc/RFSupplierQuotation/Quotation/Modals/HistoryVersionListBtn';
import RoundQuotationChart from '@/routes/ssrc/RFSupplierQuotation/Quotation/Modals/RoundQuotationChart';
import {
  fetchQuotationHistoryHeader,
  fetchQuotationHistoryHeaderExternal,
  fetchQuotationHistoryHeaderPurchaser,
  // fetchQuotationHistoryQuotationLine,
  // queryPrint,
  fetchQuotationHistoryHeaderExternalSupplier,
} from '@/services/supplierQutationService';
import { isText, fetchBiddingHallConfigResult } from '@/utils/utils';
import { queryEnableDoubleUnit } from '@/services/commonService';
import ChatRoomSourceLink from '@/routes/components/ChatRoomSource/ChatRoomSourceLink';
import QueryStyle from './index.less';

import BasicForm from './Page/BasicForm';
import PrequalForm from './Page/PrequalForm';
import QuotationLineTable from './Page/QuotationLineTable';
import Attachments from './Page/Attachments';

import { formDS } from './Stores/formDS';
import { quotationLineDataSet } from './Stores/quotationLineDataSet';

/**
 * 文档请查看 /src/routes/document/ssrc/pageDocument.md
 *
 * /pub/ssrc/supplier-reply/query/null?rfxHeaderId={rfxHeaderId}&pageType=SUPPLIER_DETAIL_QUERY&externalFlag=1&quotationHeaderId={quotationHeaderId}&supplierCompanyId={supplierCompanyId}&supplierId={supplierId}&historyDestroyAllFlag=${historyDestroyAllFlag}&hideTechFileFlag=${hideTechFileFlag}
 * /pub/ssrc/bid-supplier-reply/query/null?rfxHeaderId={rfxHeaderId}&pageType=SUPPLIER_DETAIL_QUERY&externalFlag=1&quotationHeaderId={quotationHeaderId}&supplierCompanyId={supplierCompanyId}&supplierId={supplierId}$historyDestroyAllFlag=${historyDestroyAllFlag}&&hideTechFileFlag=${hideTechFileFlag}
 * @search
 * rfxHeaderId
 * 可选参数
 * - quotationHeaderRecordId 当前版本id, 报价历史页面必须id
 * - quotationHeaderId 报价头id
 * - noBackFlag 不需要返回箭头 string 0|1
 * - pageType 页面类型 enum SUPPLIER_DETAIL_QUERY(报价查询) | HISTORY_VERSION(历史查询)
 * - externalFlag 0 外部/pub用本页面
 * - externalModalFlag 0 以弹窗配置
 * - supplierCompanyId,
 * - supplierId,
 * - hideTechFileFlag, 0 可选, 隐藏技术附件参数
 * - historyDestroyAllFlag 1 可选，报价历史弹框打开前是否销毁所有弹框标识
 * - roleCategory, "" | SUPPLIER | PURCHASE  string 当前页面是采购方还是供应商查看
 */
const SupplierQueryNew = (props = {}) => {
  const {
    history,
    href,
    location: { pathname, search } = {},
    match: { params = {} } = {},
    customizeTable = noop,
    customizeForm = noop,
    customizeCollapseForm = noop,
    // customizeBtnGroup = noop,
    custLoading = false,
    bidFlag = 0,
    customizeBtnGroup,
    quotationRemote,
  } = props;

  const { quotationHeaderId = null, quotationHeaderRecordId = null } = params || {};
  let searchData = querystring.parse(search?.substr(1));

  // 外部以弹窗形式嵌套
  if (!history && href) {
    const modalLinkSearch = querystring.parse(href.substr(href.indexOf('?') + 1, href.length));
    const { externalModalFlag } = modalLinkSearch || {};

    if (externalModalFlag === '1') {
      searchData = modalLinkSearch;
    }
  }

  const {
    rfxHeaderId = null,
    noBackFlag = 0,
    pageType,
    quotationHeaderId: currentQuotationHeaderId = null,
    externalFlag,
    externalModalFlag,
    supplierCompanyId = null,
    supplierId = null,
    switchUrl = 0,
    roleCategory = '', // 外部是供应商/采购方打开
    hideTechFileFlag = 0,
    historyDestroyAllFlag = 1,
  } = searchData || {};
  const [loading, setLoading] = useState(0);
  const [doubleUnitFlag, setDoubleUnitFlag] = useState(false); // 判断是否开启双单位
  const [biddingHallFlag, setBiddingHallFlag] = useState(null); // 配置是否开启新竞价

  // math.params ID
  const currentPageQuotationHeaderId = useMemo(
    () =>
      quotationHeaderId && quotationHeaderId !== 'null'
        ? quotationHeaderId
        : currentQuotationHeaderId,
    [quotationHeaderId, currentQuotationHeaderId]
  );

  // 是否外部模块
  const externalModules = useMemo(
    () => externalFlag === '1' || externalFlag === 'true' || externalModalFlag === '1',
    [externalFlag, externalModalFlag, search, href]
  );

  const insertIntoModal = externalModalFlag === '1';

  const externalModulesFlag = useMemo(() => (externalModules ? 1 : 0), [externalModules]);

  const organizationId = getCurrentOrganizationId();
  const documentTypeName = getDocumentTypeName(bidFlag);
  // const categoryCode = getCategoryCode(bidFlag);
  const quotationName = getQuotationName(bidFlag);
  const activeTabKey = getActiveTabKey();

  const basicFormDS = useMemo(() => {
    const preHeaderDS = formDS({
      bidFlag,
      documentTypeName,
      quotationName,
      externalModulesFlag,
      pageType,
    });

    const headerDS = quotationRemote
      ? quotationRemote.process(
          'SSRC_SUPPLIER_QUOTATION_NEW_QUERY_PROCESS_BASIC_FORM_DS',
          preHeaderDS,
          {
            pageProps: props,
          }
        )
      : preHeaderDS;
    const headerBasicFormDS = new DataSet(headerDS);
    return headerBasicFormDS;
  }, [externalModulesFlag, search, href]);

  const quotationLineDS = useMemo(() => {
    let lineDSObject = quotationLineDataSet({
      bidFlag,
      documentTypeName,
      quotationName,
      externalModulesFlag,
      switchUrl,
      roleCategory,
      pageType,
    });

    lineDSObject = quotationRemote
      ? quotationRemote.process('SSRC_SUPPLIER_QUOTATION_NEW_QUERY_PROCESS_LINE_DS', lineDSObject, {
          bidFlag,
          ...props,
        })
      : lineDSObject;
    return new DataSet(lineDSObject);
  }, [externalModulesFlag, search, href]);

  const {
    quotationHeaderId: currentHeaderQuotationHeaderId,
    // rfxStatus,
    // secondarySourceCategoryMeaning,
    secondarySourceCategory,
    // quotationLineNumber,
    // quotationScope,
    // quotationTotalAmount = null,
    currentQuotationRound,
    // bargainStatus,
    // sealedQuotationFlag,
    lastRoundQuotationRank = null,
    roundQuotationRankFlag = null,
    lastRoundQuotationAmount = null,
    purSelectQuotationDetailFlag,
  } = basicFormDS.current
    ? basicFormDS.current.get([
        'quotationHeaderId',
        // 'rfxStatus',
        'secondarySourceCategoryMeaning',
        'secondarySourceCategory',
        'quotationLineNumber',
        'quotationScope',
        'quotationTotalAmount',
        'currentQuotationRound',
        'bargainStatus',
        // 'sealedQuotationFlag',
        'lastRoundQuotationRank',
        'roundQuotationRankFlag',
        'lastRoundQuotationAmount',
        'purSelectQuotationDetailFlag',
      ])
    : {};

  /**
   * 外部模块
   * 字段显隐逻辑新增：
    单据状态=报价中（包括自动多轮）/待开标，寻源模板 密封报价=是
    单据状态=多轮报价中
    以上2种前置条件符合时，隐藏单价相关字段：
    单价(含税)、单价(不含税)、辅助单价（含税）、辅助单价（不含税）、行金额(含税)、行金额(不含税)、阶梯报价；隐藏多轮报价中头上面的标签字段（总价排名/总价金额）
  */
  // const roundQuotation = rfxStatus === "ROUND_QUOTATION";
  // const externalHiddenField = useMemo(() => (
  //   (
  //     (rfxStatus === "IN_QUOTATION" || rfxStatus === "OPEN_BID_PENDING") && sealedQuotationFlag
  //   )
  //   || roundQuotation
  // ) && externalModules, [
  //   rfxStatus,
  //   sealedQuotationFlag,
  //   externalModules,
  // ]);

  /**
   * 暂时不需要隐藏字段了
   */
  const externalHiddenField = useMemo(() => 0, []);

  // 触发页面loading
  const toggleLoading = (loadingFlag = false) => {
    setLoading(loadingFlag);
  };

  // 查询配置表--是否启用竞价大厅
  const fetchBiddingHallConfig = async () => {
    let currentBiddingHallFlag = null;

    try {
      currentBiddingHallFlag = await fetchBiddingHallConfigResult({
        organizationId,
        groupCamp: 'PURCHASER', // 阵营。供应商方：SUPPLIER 采购方：PURCHASER
      });
      if (currentBiddingHallFlag === null) {
        return;
      }

      setBiddingHallFlag(!!currentBiddingHallFlag);
    } catch (e) {
      throw e;
    }
  };

  useEffect(() => {
    fetchBiddingHallConfig();
    initPage();
  }, [pathname, search]);

  const initPage = useCallback(() => {
    fetchHeader();
    queryLine();
  }, [fetchHeader, queryLine, externalModulesFlag]);

  const validateIdNull = (id) => {
    const nullFlag = !id || id === 'null' || id === 'undefined';
    return nullFlag;
  };

  // 外部模块，需要校验关键id
  const validateExternalModuleParams = useCallback(() => {
    if (roleCategory === 'SUPPLIER') {
      const rfxHeaderIdNull = validateIdNull(rfxHeaderId);
      const idNull =
        validateIdNull(quotationHeaderId) &&
        validateIdNull(supplierCompanyId) &&
        validateIdNull(supplierId);
      if (idNull || rfxHeaderIdNull) {
        const ErrTitle = `rfxHeaderId, quotationHeaderId or supplierCompanyId or supplierId must Is An Invalid Id, Please Check!!!`;
        throw new ReferenceError(ErrTitle);
      }
    }
  }, [href, search, params]);

  const fetchHeader = useCallback(async () => {
    if (!rfxHeaderId && !currentPageQuotationHeaderId) {
      return;
    }

    // validateExternalModuleParams();

    const unitCode = `${getCustomizeUnitCode('baseForm')},${getCustomizeUnitCode(
      'attachment'
    )},${getCustomizeUnitCode('prequalForm')}`;
    const param = {
      organizationId,
      rfxHeaderId,
      // routerFrom: 'quotationQuery',
      quotationHeaderId: currentPageQuotationHeaderId,
      quotationHeaderRecordId,
      customizeUnitCode: unitCode,
      supplierCompanyId,
      supplierId,
      externalModulesFlag, // 外部模块标识
    };
    if (Number(hideTechFileFlag) === 1) {
      Object.assign(param, { hideTechFileFlag: 1 });
    }
    let result = null;
    toggleLoading(true);
    try {
      // 外部模块调用
      if (externalModulesFlag) {
        // 外部供应商
        if (roleCategory === 'SUPPLIER') {
          result = await fetchQuotationHistoryHeaderExternalSupplier(param);
        } else {
          // 外部采购方
          result = await fetchQuotationHistoryHeaderExternal(param);
        }
      } else if (Number(switchUrl) === 2 && pageType === 'SUPPLIER_DETAIL_QUERY') {
        result = await fetchQuotationHistoryHeaderPurchaser(param);
      } else {
        result = await fetchQuotationHistoryHeader(param);
      }

      result = getResponse(result);
      toggleLoading();
      if (!result) {
        return;
      }

      queryDoubleUnit(result.tenantId);

      basicFormDS.loadData([result]);
    } catch (e) {
      throw e;
    } finally {
      toggleLoading();
    }
  }, [pathname, search, getCustomizeUnitCode, href, switchUrl, validateExternalModuleParams]);

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

  const queryLine = useCallback(
    async (otherParam = {}) => {
      if (!rfxHeaderId && !currentPageQuotationHeaderId) {
        return;
      }

      const param = {
        organizationId,
        rfxHeaderId,
        quotationHeaderId: currentPageQuotationHeaderId,
        quotationHeaderRecordId,
        customizeUnitCode: `${getCustomizeUnitCode('table')}`,
        supplierCompanyId,
        supplierId,
        externalModulesFlag, // 外部模块标识
        roleCategory,
      };
      console.log(rfxHeaderId, 'aaa');
      quotationLineDS.setQueryParameter('commonProps', {
        ...param,
        ...otherParam,
      });
      try {
        quotationLineDS.query();
      } catch (e) {
        throw e;
      }
    },
    [pathname, search, getCustomizeUnitCode, href, validateExternalModuleParams]
  );

  /**
   * 获取对应的个性化编码
   *  */
  const getCustomizeUnitCode = useCallback(
    (type = 'all') => {
      const RfxCode = {
        baseForm: 'SSRC.SUPPLIER_QUERY_NEW.APPLY_BASE',
        attachment: 'SSRC.SUPPLIER_QUERY_NEW.APPLY_ATTACHMENTS',
        prequalForm: 'SSRC.SUPPLIER_QUERY_NEW.PREQUAL_FORM',
        table: 'SSRC.SUPPLIER_QUERY_NEW.APPLY_LINE',
        history: 'SSRC.SUPPLIER_QUERY_NEW.LINE_HISTORY', // 报价行-报价历史
      };
      const BidCode = {
        baseForm: 'SSRC.SUPPLIER_QUERY_BID.APPLY_BASE_BID',
        prequalForm: 'SSRC.SUPPLIER_QUERY_NEW.PREQUAL_FORM_BID',
        attachment: 'SSRC.SUPPLIER_QUERY_BID.APPLY_ATTACHMENTS_BID',
        table: 'SSRC.SUPPLIER_QUERY_BID.APPLY_LINE_BID',
        history: 'SSRC.SUPPLIER_QUERY_BID.LINE_HISTORY_BID', // 报价行-报价历史
      };

      return !bidFlag ? RfxCode[type] : BidCode[type];
    },
    [bidFlag, pathname]
  );

  // 从基本信息中取值
  const getHeaderValue = useCallback(
    (field = null) => {
      let headerValue = null;
      if (field && basicFormDS.current) {
        headerValue = basicFormDS.current.get(field);
      }
      return headerValue;
    },
    [basicFormDS, pathname]
  );

  /**
   * 多轮报价信息
   * 仅报价查询展示
   * */
  const roundQuotationChart = useCallback(() => {
    const roundQuotationHideFlag =
      !currentQuotationRound ||
      (isNil(lastRoundQuotationRank) && isNil(lastRoundQuotationAmount)) ||
      pageType !== 'SUPPLIER_DETAIL_QUERY' ||
      externalHiddenField;
    if (roundQuotationHideFlag) {
      return '';
    }

    return (
      <RoundQuotationChart
        type="multiQuotationRound"
        bidFlag={bidFlag}
        quotationName={quotationName}
        headerDS={basicFormDS}
        organizationId={organizationId}
      />
    );
  }, [
    pageType,
    basicFormDS,
    pathname,
    quotationName,
    lastRoundQuotationRank,
    roundQuotationRankFlag,
    lastRoundQuotationAmount,
    currentQuotationRound,
    organizationId,
    bidFlag,
    externalHiddenField,
  ]);

  // 基本信息-title
  const renderBasicTitle = useCallback(() => {
    const { current } = basicFormDS || {};

    if (!current) {
      return '';
    }

    const { rfxNum, rfxTitle, secondarySourceCategoryMeaning } = current?.get([
      'rfxNum',
      'rfxTitle',
      'secondarySourceCategoryMeaning',
    ]);
    const TitleText = rfxNum && rfxTitle ? `${rfxNum}-${rfxTitle}` : rfxNum || rfxTitle;

    return (
      <div className={Style['card-title']}>
        <span
          className={Style['card-title-rfx-info']}
          style={{ display: 'inline-block', maxWidth: '85%' }}
        >
          <Tooltip title={TitleText} overlayStyle={{ minWidth: '300px' }}>
            {TitleText}
          </Tooltip>
        </span>
        <span className={Style['card-title-category']} style={{ marginRight: '0' }}>
          <Tag color="gray" style={{ border: 'none', marginRight: '0' }}>
            {secondarySourceCategoryMeaning}
          </Tag>
        </span>
        {quotationRemote
          ? quotationRemote.render(
              'SSRC_SUPPLIER_QUOTATION_NEW_QUERY_RENDER_ROUND_QUOTATION_CHART',
              roundQuotationChart(),
              { bidFlag }
            )
          : roundQuotationChart()}
      </div>
    );
  }, [
    pathname,
    search,
    basicFormDS,
    quotationRemote,
    bidFlag,
    roundQuotationChart,
    externalHiddenField,
  ]);

  // 页面返回
  const getBackpath = useCallback(() => {
    return noBackFlag === '1' || externalModules ? '' : `${activeTabKey}/list`;
  }, [noBackFlag, pathname, activeTabKey, externalModules, href]);

  // 页面头标题
  const pageTitle = useCallback(() => {
    const currentPageTitle = intl
      .get(`ssrc.queryQuotation.view.message.title.commonQuotationInquiry`, { quotationName })
      .d('{quotationName}查询');

    if (pageType === 'SUPPLIER_DETAIL_QUERY') {
      return currentPageTitle;
    }

    if (pageType === 'HISTORY_VERSION') {
      const quotationCurrentVersion = getHeaderValue('quotationCount') ?? '';

      return quotationCurrentVersion
        ? `${intl
            .get('hzero.common.components.dataAudit.version')
            .d('版本')} ${quotationCurrentVersion}`
        : '';
    }

    return currentPageTitle;
  }, [search, pageType]);

  // 报价查询头按钮
  const buttons = useMemo(() => {
    const quotationRoundFlag = basicFormDS?.current
      ? basicFormDS?.current?.get('quotationRoundFlag')
      : {};
    const isPurchase = quotationRoundFlag && Number(switchUrl) === 2;

    return [
      {
        name: 'print',
        child: intl.get(`ssrc.queryQuotation.view.message.button.print`).d('打印'),
        btnType: 'c7n-pro',
        btnComp: PrintProButton,
        hidden: externalModules || !currentHeaderQuotationHeaderId || isPurchase,
        btnProps: {
          buttonProps: {
            funcType: 'flat',
            icon: 'print',
            disabled: !currentHeaderQuotationHeaderId,
          },
          buttonText: intl.get(`ssrc.queryQuotation.view.message.button.print`).d('打印'),
          requestUrl: `${SRM_SSRC}/v1/${organizationId}/rfx/quotation/print-excel/token`,
          method: 'POST',
          data: {
            quotationHeaderId: currentHeaderQuotationHeaderId,
          },
        },
      },
      {
        name: 'historyRecord',
        btnComp: HistoryVersionListBtn,
        hidden: externalModules || isPurchase,
        btnProps: {
          funcType: 'flat',
          quotationHeaderId: currentHeaderQuotationHeaderId,
          organizationId,
          rfxHeaderId,
          currentQuotationHeaderRecordId: quotationHeaderRecordId,
          switchUrl,
          purSelectQuotationDetailFlag,
        },
      },
      secondarySourceCategory
        ? {
            name: 'chat',
            btnComp: ChatRoomSourceLink,
            btnType: 'c7n-pro',
            child: intl.get('ssrc.common.view.message.chatRecord').d('聊天记录'),
            btnProps: {
              btnType: 'c7n-pro',
              funcType: 'flat',
              readOnly: true,
              quotationHeaderId,
              roleCategory: 'SUPPLIER',
              hiddenFlag: externalModules || isPurchase,
              biddingFlag: biddingHallFlag && secondarySourceCategory === 'RFA',
            },
          }
        : null,
    ].filter(Boolean);
  }, [
    pathname,
    organizationId,
    search,
    currentHeaderQuotationHeaderId,
    basicFormDS,
    biddingHallFlag,
    secondarySourceCategory,
  ]);

  // 历史版本头按钮
  const historyHeaderButtons = useMemo(
    () => [
      {
        name: 'historyRecord',
        btnComp: HistoryVersionListBtn,
        hidden: externalModules,
        btnProps: {
          funcType: 'flat',
          quotationHeaderId: currentHeaderQuotationHeaderId,
          organizationId,
          rfxHeaderId,
          currentQuotationHeaderRecordId: quotationHeaderRecordId,
          switchUrl,
          purSelectQuotationDetailFlag,
        },
      },
    ],
    [
      pathname,
      search,
      organizationId,
      externalFlag,
      currentHeaderQuotationHeaderId,
      href,
      basicFormDS,
    ]
  );

  // 页面头按钮
  const renderButtonGroup = useCallback(() => {
    const buttonsProps = {
      basicFormDS,
      organizationId,
      quotationHeaderId,
      rfxHeaderId,
      bidFlag,
      noBackFlag,
      quotationLineDS,
    };

    if (!currentHeaderQuotationHeaderId || externalModules) {
      return '';
    }

    if (pageType === 'HISTORY_VERSION') {
      return customizeBtnGroup(
        {
          code: `SSRC.SUPPLIER_QUERY_${bidFlag ? 'BID' : 'NEW'}.QUERY_HISTORY_HEADER_BUTTON`,
          pro: true,
        },
        <DynamicButtons buttons={historyHeaderButtons} />
      );
    }

    if (pageType === 'SUPPLIER_DETAIL_QUERY') {
      const queryButtons = quotationRemote
        ? quotationRemote.process(
            'SSRC_SUPPLIER_QUOTATION_NEW_QUERY_BUTTONS_QUERY',
            buttons,
            buttonsProps
          )
        : buttons;

      return customizeBtnGroup(
        {
          code: `SSRC.SUPPLIER_QUERY_${bidFlag ? 'BID' : 'NEW'}.QUERY_DETAIL_HEADER_BUTTON`,
          pro: true,
        },
        <DynamicButtons buttons={queryButtons} />
      );
    }
  }, [
    pageType,
    basicFormDS,
    rfxHeaderId,
    quotationHeaderId,
    organizationId,
    buttons,
    noBackFlag,
    externalFlag,
    currentHeaderQuotationHeaderId,
    href,
    externalModules,
    quotationLineDS,
    biddingHallFlag,
  ]);

  /**
   * 【基本信息】 后边埋点
   */
  const cuxCardAfterBasic = useCallback(() => {
    let cuxCardDom = '';
    cuxCardDom = quotationRemote
      ? quotationRemote.process(
          'SSRC_SUPPLIER_QUOTATION_NEW_QUERY_PROCESS_CUX_AFTER_BASIC_DOM',
          cuxCardDom,
          {
            pageProps: props,
            basicFormDS,
          }
        )
      : cuxCardDom;
    return cuxCardDom;
  }, [
    href,
    search,
    pathname,
    basicFormDS,
    quotationRemote,
    quotationHeaderId,
    currentQuotationHeaderId,
    externalModulesFlag,
  ]);

  const commonCardTitleStyle = useCallback(({ title }) => {
    return <span style={{ fontWeight: 600 }}>{title}</span>;
  }, []);

  // common props
  const CommonProps = {
    basicFormDS,
    organizationId,
    rfxHeaderId,
    getCustomizeUnitCode,
    historyDestroyAllFlag,
    quotationName,
    pageType,
    quotationRemote,
    bidFlag,
    externalHiddenField,
    externalModulesFlag,
  };

  // 表单props
  const FormProps = {
    ...CommonProps,
    customizeCollapseForm,
    custLoading,
    customizeForm,
    viewOnly: true,
  };

  const quotationLineProps = {
    ...CommonProps,
    quotationLineDS,
    customizeTable,
    custLoading,
    doubleUnitFlag,
  };

  return (
    <>
      {!insertIntoModal ? (
        <Header backPath={getBackpath()} title={pageTitle()}>
          {renderButtonGroup()}
        </Header>
      ) : (
        ''
      )}

      <div className={QueryStyle['supplier-query-new']}>
        <div
          className={classnames(QueryStyle['supplier-query-new-content'], {
            [QueryStyle['supplier-query-new-content-external-module']]: externalModalFlag === '1',
          })}
        >
          <Card id="rfxBasicInfo" title={renderBasicTitle()} bordered={false}>
            <Spin spinning={loading}>
              <BasicForm {...FormProps} />
            </Spin>
          </Card>

          {cuxCardAfterBasic()}

          {basicFormDS?.current?.get('preQualificationFlag') === 1 ? (
            <Card
              id="rfxPrequalBasicInfo"
              title={commonCardTitleStyle({
                title: intl.get('ssrc.common.prequalBasicInfo').d('资格预审信息'),
              })}
              bordered={false}
            >
              <PrequalForm {...FormProps} />
            </Card>
          ) : null}
          <Card
            id="rfxQuotationLineTable"
            title={commonCardTitleStyle({
              title: intl.get('ssrc.common.quotationLineInfomations').d('报价行信息'),
            })}
            bordered={false}
          >
            <QuotationLineTable {...quotationLineProps} />
          </Card>
          <Card
            id="rfxAttachment"
            title={commonCardTitleStyle({ title: intl.get('ssrc.common.attachment').d('附件') })}
            bordered={false}
          >
            <Attachments {...FormProps} />
          </Card>
        </div>
      </div>
    </>
  );
};

const hocComponent = (NewComponent, options = {}) => {
  const { bidFlag = false } = options || {};
  const unitCodes = !bidFlag
    ? [
        // RFX - SSRC.SUPPLIER_QUERY_NEW
        'SSRC.SUPPLIER_QUERY_NEW.APPLY_BASE', // 基本信息
        'SSRC.SUPPLIER_QUERY_NEW.PREQUAL_FORM', // 资格预审
        'SSRC.SUPPLIER_QUERY_NEW.APPLY_ATTACHMENTS', // 附件
        'SSRC.SUPPLIER_QUERY_NEW.APPLY_LINE', // 报价行信息
        'SSRC.SUPPLIER_QUERY_NEW.LINE_HISTORY', // 报价行-报价历史
        'SSRC.SUPPLIER_QUERY_NEW.QUERY_DETAIL_HEADER_BUTTON', // 报价查询头部按钮
        'SSRC.SUPPLIER_QUERY_NEW.QUERY_HISTORY_HEADER_BUTTON', // 报价历史头部按钮
      ]
    : [
        // BID - SSRC.SUPPLIER_QUERY_BID
        'SSRC.SUPPLIER_QUERY_BID.APPLY_BASE_BID', // 基本信息
        'SSRC.SUPPLIER_QUERY_BID.PREQUAL_FORM_BID', // 资格预审
        'SSRC.SUPPLIER_QUERY_BID.APPLY_ATTACHMENTS_BID', // 附件
        'SSRC.SUPPLIER_QUERY_BID.APPLY_LINE_BID', // 报价行信息
        'SSRC.SUPPLIER_QUERY_BID.LINE_HISTORY_BID', // 报价行-报价历史
        'SSRC.SUPPLIER_QUERY_BID.QUERY_DETAIL_HEADER_BUTTON', // 报价查询头部按钮
        'SSRC.SUPPLIER_QUERY_BID.QUERY_HISTORY_HEADER_BUTTON', // 报价历史头部按钮
      ];

  return compose(
    formatterCollections({
      code: [
        'ssrc.supplierQuotation',
        'ssrc.supplierquotation',
        'ssrc.bidHall',
        'ssrc.common',
        'ssrc.inquiryHall',
        'ssrc.offlineResultEntry',
        'ssrc.rf',
        'ssrc.queryQuotation',
        'scux.ssrc',
      ],
    }),
    withCustomize({
      unitCode: unitCodes,
    }),
    remote({
      code: 'SSRC_SUPPLIER_QUOTATION_NEW_QUERY',
      name: 'quotationRemote',
    })
  )(observer(NewComponent));
};

export default hocComponent(SupplierQueryNew);
export { hocComponent, SupplierQueryNew };
