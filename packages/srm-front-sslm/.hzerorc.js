/*
 * @Date: 2026-01-12 13:44:53
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2024, Hand
 */
const source = 'src';
const dist = 'lib';

function getExposesByFiles(files) {
  return files.reduce((result, file) => {
    result[`./${dist}/${file}`] = `./${source}/${file}`;
    return result;
  }, {});
}

module.exports = {
  package: {
    initLoad: true,
    public: true,
    registerRegex: "\\/sslm\\/"
  },
  "hzeroBoot": "hzero-boot/lib/pathInfo",
  theme: require.resolve('srm-front-boot/lib/config/theme.js'),
  dllConfig: { // dllConfig 配置
    common: {
      priority: 100,
      packages: ['react', 'react-dom', 'dva', 'dva/router', 'dva/saga', 'dva/fetch', 'hzero-ui', 'choerodon-ui', 'choerodon-ui/pro', 'core-js'],
    },
    vendorsGraph: {
      packages: ['echarts', 'bizcharts', '@antv/data-set'],
    },
    vendors: {
      packages: ['lodash', 'lodash-decorators', 'react-intl-universal', 'axios', 'uuid', 'numeral', 'react-cropper', 'cropperjs',]
    }
  },
  hzeroMS: { 
    exposes: { 
      ...getExposesByFiles([
        'routes/SampleDelivery/Confirm/Detail',
        'routes/components/utils',
        'routes/components/FormField',
        'routes/components/GeneralForm',
        'routes/components/Investigation/Compare',
        'routes/components/OperationRecords',
        'services/supplierInformCompareService',
        'routes/components/MemberSupplier/EnterpriseTags',
        'models/supplierLifeConfig',
        'routes/components/DynamicTable/utils/service',
        'routes/components/DynamicTable',
        'routes/SupplierLife/Config',
        "routes/VendorEvaluationPlanWorkbench/Details",
        "models/evaluationDocManage",
        "models/evaluationArchivesFilling",
        "routes/EvaluationDocManage/Detail",
        "routes/SupplierInform/Detail",
        "models/supplierInform",
        "models/enterpriseInform",
        "models/supplierInformCompare",
        "routes/PurchaserEvaluationWorkbench/Details",
        "routes/components/AiApprove/ResultAlert",
        "routes/EnterpriseInformTenantApproval/WorkFlow",
      ]),
    },
  },
};

