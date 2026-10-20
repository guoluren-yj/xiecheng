/*
 * @Description:
 * @Version: 2.0
 * @Autor: wangmiao
 * @Date: 2021-07-09 17:34:01
 * @LastEditors: yiping.liu
 * @LastEditTime: 2024-10-24 15:01:25
 */

const source = 'src';
const dist = 'lib';

function getExposesByFiles(files) {
  return files.reduce((result, file) => {
    result[`./${dist}/${file}`] = `./${source}/${file}`;
    return result;
  }, {});
}

// 增加hwfp
module.exports = {
  package: {
    initLoad: true,
    public: true,
    registerRegex: '\\/ssrc|scux|spc\\/',
  },
  hzeroBoot: 'hzero-boot/lib/pathInfo',
  // webpackConfig: (config, webpackConfigType) => { // webpack 配置修改
  //   // console.log(webpackConfigType); // string webpack配置类型: 'dll' | 'base' | 'ms' ;
  //   if (webpackConfigType !== 'dll') {
  //   return config;
  // },
  webpackConfig: (config, webpackConfigType) => {
    // console.log(webpackConfigType); // string webpack配置类型: 'dll' | 'base' | 'ms' ;

    if (webpackConfigType !== 'dll') {
      // 查找并修改 fork-ts-checker-webpack-plugin 配置
      const tsCheckerPlugin = config.plugins.find(
        plugin => plugin.constructor && plugin.constructor.name === 'ForkTsCheckerWebpackPlugin'
      );

      if (tsCheckerPlugin) {
        // 方法1: 直接设置 memoryLimit
        tsCheckerPlugin.options.memoryLimit = 8192;

        // 或者方法2: 确保 typescript 配置存在并设置 memoryLimit
        if (!tsCheckerPlugin.options.typescript) {
          tsCheckerPlugin.options.typescript = {};
        }
        tsCheckerPlugin.options.typescript.memoryLimit = 8192;

        console.log('已设置 TypeScript 内存限制为 28GB');
      }
    }

    return config;
  },
  // alias: {}, // webpack alias 配置, alias 的值可以是 string 表示指向配置文件
  // theme: {}, // less 变量配置, theme 的值可以是 string 表示指向配置文件
  // hzeroBoot: 'hzero-boot/lib/pathInfo', // hzero入口文件信息配置
  theme: require.resolve('srm-front-boot/lib/config/theme.js'),
  dllConfig: {
    // dllConfig 配置
    common: {
      priority: 100,
      packages: ['react', 'react-dom', 'dva', 'dva/router', 'dva/saga', 'dva/fetch', 'core-js'],
    },
    vendorsGraph: {
      packages: ['echarts', 'bizcharts', '@antv/data-set'],
    },
    vendors: {
      packages: [
        'lodash',
        'lodash-decorators',
        'react-intl-universal',
        'axios',
        'uuid',
        'numeral',
        'react-cropper',
        'cropperjs',
      ],
    },
  },
  hzeroMS: {
    exposes: {
      ...getExposesByFiles([
        // model
        'models/inquiryHall',
        'models/priceComparison',
        'models/quotationDetail',
        'models/supplierQuotation',
        'models/supplierQuotationCommon',
        'models/importExcel',
        'models/bidHall',
        'models/commonModel',
        'models/expertScoring',
        'models/newBidHall',
        'models/bargainExpert',
        'models/bargainInquiryHall',
        'models/bargain',
        'models/bargainBidHall',
        'models/inquiryHallNew',
        'models/inquiryHallBid',
        'models/inquiryHallNewPub',
        'models/quotationController',
        'models/offlineResultEntryInquiry',
        // utils
        'utils/SsrcRegx',
        'utils/globalVariable',
        'utils/utils',
        'utils/renderer',
        'utils/constants',
        'utils/common',
        // routes
        'routes/himp/CommonImportNew',
        'routes/ssrc/InquiryHall/SrcDetail',
        'routes/ssrc/InquiryHall/SrcDetail/workFlowIndex',
        'routes/ssrc/InquiryHall/CheckPrice',
        'routes/ssrc/InquiryHall/CheckPrice/indexBid',
        'routes/ssrc/InquiryHall/CheckPriceApproval/BidIndex',
        'routes/ssrc/InquiryHall/CheckPriceApproval',
        'routes/ssrc/InquiryHall/CheckPriceApproval/workFlowIndex',
        'routes/ssrc/InquiryHall/CheckPriceApproval/standardCompEnhancerCreator',
        'routes/ssrc/InquiryHall/CheckPriceApprovalC7n/BidIndex',
        'routes/ssrc/InquiryHall/CheckPriceApprovalC7n',
        'routes/ssrc/InquiryHall/CheckPriceApprovalC7n/standardCompEnhancerCreator',
        'routes/ssrc/InquiryHall/CheckPrice/standardCompEnhancerCreator',
        'routes/ssrc/InquiryHall/CheckPrice/Tabs/SupplierLineList',
        'routes/ssrc/InquiryHall/EvaluationProcManage',
        'routes/ssrc/InquiryHall/RoundQuotation',
        'routes/ssrc/InquiryHallNew/BidOperationBid',
        'routes/ssrc/InquiryHallNew',
        'routes/ssrc/InquiryHallNew/utils',
        'routes/ssrc/InquiryHallNew/index.less',
        'routes/ssrc/InquiryHallNew/standardCompEnhancerCreator',
        'routes/ssrc/InquiryHallNew/OperationBid',
        'routes/ssrc/InquiryHallNew/Update',
        'routes/ssrc/InquiryHallNew/Update/Components',
        'routes/ssrc/InquiryHallNew/Update/BulkAddSupplierModal',
        'routes/ssrc/InquiryHall/ApplyToInquiry',
        'routes/sbid/BidHall/BidEvaluationProcManage',
        'routes/ssrc/Expert/Query/Detail',
        'routes/ssrc/InquiryHall/ApplyToInquiry/CreateModal',
        'routes/ssrc/InquiryHall/Bargain/Entry/indexExpert',
        'routes/ssrc/InquiryHall/Bargain/Entry/indexInquiryHall',
        'routes/ssrc/InquiryHall/Bargain/Entry/indexBid',
        'routes/ssrc/InquiryHall/RoundQuotation/indexInquiryHall',
        'routes/ssrc/InquiryHall/RoundQuotation/indexBidHall',
        'routes/ssrc/InquiryHall/Bargain',
        'routes/ssrc/InquiryHall/Bargain/All',
        'routes/ssrc/InquiryHall/Bargain/AllOffLine',
        'routes/ssrc/InquiryHall/Bargain/AllDS',
        'routes/ssrc/InquiryHall/CheckPrice/Tabs/AllQuoteLine',
        'routes/ssrc/InquiryHall/CheckPriceApproval/ItemLineList',
        'routes/ssrc/InquiryHall/CheckPriceApproval/ItemLineTable',
        'routes/ssrc/InquiryHall/CheckPriceApproval/QuoteLineTable',
        'routes/ssrc/InquiryHall/CheckPriceApproval/SupplierLineList',
        'routes/ssrc/InquiryHall/CheckPriceApproval/SupplierLineTable',
        'routes/ssrc/InquiryHall/CheckPriceApprovalNewC7n/workflowIndex',
        'routes/ssrc/InquiryHall/Update/RemarkModal',
        'routes/ssrc/QuotationController/NewDetail/RemarkModal',
        'routes/ssrc/QuotationController/NewDetail/utils',
        'routes/ssrc/InquiryHall/Detail/CheckPrice',
        'routes/ssrc/InquiryHallNew/QuotationChangeRecords',
        'routes/ssrc/InquiryHallNew/rfComponents/Card',
        'routes/ssrc/PriceLibraryNew/OperationRecord',
        'routes/ssrc/PriceLibraryNew/util',
        'routes/ssrc/PriceLibraryNew/lineDS',
        'routes/ssrc/PriceLibraryNew/ApplicationScope',
        'routes/ssrc/RFSupplierQuotation/newDetail/rfComponent/Card',
        // routes/ssrc/components
        'routes/ssrc/components/PriceComparison',
        'routes/ssrc/components/Icons',
        'routes/ssrc/components/Attachment',
        'routes/ssrc/components/DownloadAttachments',
        'routes/ssrc/components/LadderLevelDoubleUnit',
        'routes/ssrc/components/PriceCharts',
        'routes/ssrc/components/ApplicationOrganization/Detail',
        'routes/ssrc/components/PriceComparison/BidIndex',
        'routes/ssrc/components/BidAnnouncement',
        'routes/ssrc/components/CountDown',

        // routes/share
        'routes/share/RoundQuotationAllTable',
        'routes/share/RoundQuotationAllTable/SupplierQuotation',
        // routes/sbid
        'routes/sbid/BidHall/BidEvaluationProcManage',
        'routes/ssrc/QueryQuotation/Detail/FeedBackBarginHistoryModal',


        // routes/components
        'routes/components/SectionPanel/Detail',
        'routes/components/OperationRecord',
        'routes/components/QuotationDetail/QuotationDetail',
        'routes/components/Precision/PrecisionInputNumber',
        'routes/components/Precision/C7nPrecisionInputNumber',
        'routes/components/processAttachment',
        'routes/components/ConfirmModal',
        'routes/components/CombineComponent',
        'routes/components/IPCoincidenceRate',
        'routes/components/QuotationDetailNew/Detail',
        'routes/components/SupplierQuotationAttachment',
        'routes/components/SvgIcon',
        'routes/components/EditorOnline',
        'routes/components/ExcelExport',
        'routes/components/OperationRecord/useModal',
        'routes/himp/CommonImportNew',
        'routes/components/PopoverButton',
        'routes/components/SearchBar',
        'routes/components/DynamicComponent',
        'routes/components/NoDataContent',
        'routes/components/SectionPanel/Detail',
        'routes/components/Widget/dataVerification',
        'routes/components/IPDetails',
        'routes/components/FileTemplateAttachmentCheckPricePage',
        'routes/components/SupplierQuotationAttachment/RenderFileTotalCount',
        'routes/components/IPCoincidenceRate/index',

        // services
        'services/inquiryHallNewService',
        'services/commonService',
        'services/editorOnlineService',
        'services/supplierQutationService',
        'services/checkPriceNewService',
        'services/expertScoringService',
        'services/inquiryHallService',
        'services/priceLibraryNewService',
        'services/projectSetupService',
        'services/quotationDetailNewService',
        'services/bargainService',
        'services/offlineResultEntryService',

        // assets
        'assets/eliminate.svg',
        'assets/supplier-icon.svg',
        'assets/arrow-down-g.svg',
        'assets/no-quotation-detail.svg',
        'assets/companyIpRate-red.svg',
        'assets/candidate.svg',
        'assets/d-attachment.svg',
        'assets/supplier-inline-valid.svg',
        'assets/supplier-inline-invalid.svg',
        'assets/supplier-icon-grey.svg',
        'assets/attachment-grey.svg',
        'assets/companyIpRate-grey.svg',
        'assets/supplier-processAddInvalid.svg',
        'assets/supplier-processAdd.svg',
        'assets/biddingHall/supplier-ban-quotation.svg',
        'assets/biddingHall/supplier-no-supplement-price.svg',
        'assets/warn-icon.svg',


        //less
        'routes/ssrc/InquiryHall/Bargain/index.less',
        'routes/ssrc/common.less',
        'routes/ssrc/InquiryHall/Detail/index.less',
        'routes/components/QuotationDetailNew/index.less',
      ]),
    },
    remotePackages: ['srm-front-ssta', 'srm-front-mobile', 'srm-front-sbud', 'hzero-front-hrpt'],
  },
};
