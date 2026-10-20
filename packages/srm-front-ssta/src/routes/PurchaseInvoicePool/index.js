import React, { Component, Fragment } from 'react';
import { Bind } from 'lodash-decorators';
import { Modal, DataSet, Button, Attachment, Tabs } from 'choerodon-ui/pro';
import { DATETIME_MAX, DATETIME_MIN } from 'utils/constants';

import { Icon, Popover } from 'choerodon-ui';
import { observer } from 'mobx-react';
import { isEmpty, isNil } from 'lodash';
import querystring from 'querystring';
import withProps from 'utils/withProps';
import moment from 'moment';
// import uuidv4 from 'uuid/v4';
import intl from 'utils/intl';
import { SRM_SSTA } from '_utils/config';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';

import {
  getCurrentOrganizationId,
  filterNullValueObject,
  getAttachmentUrl,
  getResponse,
} from 'utils/utils';
import { getPermissions } from '@/routes/Components';
import { Header, Content } from 'components/Page';
import notification from 'utils/notification';
import ExcelExport from 'components/ExcelExport';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
// import SearchBar from 'srm-front-boot/lib/components/SearchBarTable/SearchBar';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import DynamicButtons from '_components/DynamicButtons';
import CommonImport from 'components/Import';
import { Badge, Modal as HzModal, Tooltip } from 'hzero-ui';
import Viewer from 'react-viewer';
import { getOcrConfig } from '@/services/settlePoolServices';

import {
  cancelList,
  OCRCheck,
  OFDCheck,
  checkList,
  editUploadList,
  checkAll,
  getNumber,
  printTax,
  downloadTax,
  batchPrintDownload,
  getBusinessRules,
  getPullCnfConfig,
  invoiceAckValidate,
  invoiceAck,
  tripartDetailPull,
  syncInvoicePool,
  // getDirInvApplyDataByNum,
} from '@/services/invoicePurPoolService';
import {
  dateRangeTransform,
  formatDynamicBtns,
  transformSupplierData,
  previewPdf,
  confirmDocNegAction,
  previewFile,
  getValidationResponse,
  transformQselectDate,
} from '@/utils/utils';
import remote from 'hzero-front/lib/utils/remote';

import InvoiceRecord from '@/routes/Components/InvoiceRecord';
import PicturesWall from './OcrUpload';
import AiInvoiceUpload from '@/routes/Components/AiInvoiceUpload';
// import notification from 'utils/notification';
import { mainTableDs, mainTableCheckDs, mainTableUncheckDs } from './mainDS';
import { operationDS } from './pubDS/operationDS';
import MultiTextFilter from '../Components/MultiTextFilter';
import DynamicAlert from '../Components/DynamicAlert';
import { statusTagRender } from '../Components/StatusTag';
import { formatColumnCommand } from '../Components/ColumnBtnGroup';
import InvAttachBatchDownloadModal from '../Components/InvAttachBatchDownloadModal';
import ErrorRecord from './Components/ErrorRecord';
import TripartListPullModal from './Components/TripartListPullModal';
import Style from './Components/common.less';
import commonStyles from '@/routes/common.less';
import { openAiInvoiceRecognizeRecord } from '../Components/AiInvoiceRecognizeRecord';

const { TabPane } = Tabs;
const organizationId = getCurrentOrganizationId();

export const codesTable = {
  all: 'SSTA.PURINVOICE_POOL_LIST.ALL_GRID',
  unchecked: 'SSTA.PURINVOICE_POOL_LIST.UNCHECK_GRID',
  checked: 'SSTA.PURINVOICE_POOL_LIST.FINISHED_GRID',
  sync: 'SSTA.PURINVOICE_POOL_LIST.SYNC_GRID',
};

export const filterTable = {
  all: 'SSTA.PURINVOICE_POOL_LIST.SEARCH_BAR_ALL',
  unchecked: 'SSTA.PURINVOICE_POOL_LIST.SEARCH_BAR_CHECKED',
  checked: 'SSTA.PURINVOICE_POOL_LIST.SEARCH_BAR_UNCHECKED',
  sync: 'SSTA.PURINVOICE_POOL_LIST.SEARCH_BAR_SYNC',
};

const exportTempCodeMap = {
  all: 'SSTA_INVOICE_HEADER_PURCHASE_ALL_EXPORT',
  unchecked: 'SSTA_INVOICE_HEADER_PURCHASE_UNCHECK_EXPORT',
  checked: 'SSTA_INVOICE_HEADER_PURCHASE_FINISHED_EXPORT',
  sync: 'SSTA_INVOICE_HEADER_PURCHASE_ALL_EXPORT',
};

const exportUrlMap = {
  all: `/ssta/v1/${getCurrentOrganizationId()}/invoice-header/purchaser/excel-export/all`,
  unchecked: `/ssta/v1/${getCurrentOrganizationId()}/invoice-header/purchaser/excel-export/unchecked`,
  checked: `/ssta/v1/${getCurrentOrganizationId()}/invoice-header/purchaser/excel-export/checked`,
  sync: `/ssta/v1/${getCurrentOrganizationId()}/invoice-header/purchaser/excel-export/all`,
};

// const modalCode = {
//   HEAD_ADD: 'SSTA.PURINVOICE_POOL_LIST.HANDLE_CREATE',
//   LINE_ADD: 'SSTA.PURINVOICE_POOL_LIST.LINE_CREATE',
//   HEAD_EDIT: 'SSTA.PURINVOICE_POOL_LIST.HANDLE_EDIT',
//   LINE_EDIT: 'SSTA.PURINVOICE_POOL_LIST.HEAD_EDIT.LINE_CREATE',
// };

export const paramsMap = {
  all: { checkStatus: 'ALL' },
  unchecked: { checkStatus: 'UNCHECKED' },
  checked: { checkStatus: 'CHECKED' },
  sync: { syncStatusList: 'UNSYNCHRONIZED,SYNC_FAILURE' },
};
export const lineParamsMap = {
  all: { tab: 'ALL' },
  unchecked: { tab: 'UNCHECKED' },
  checked: { tab: 'CHECKED' },
  sync: { tab: 'SYNC' },
};
const camp = 'PURCHASER';
@remote({
  code: 'SSTA_PURCHASE_INVOICE_POOL',
  name: 'remote',
})
@withCustomize({
  unitCode: [
    'SSTA.PURINVOICE_POOL_LIST.ALL_GRID',
    'SSTA.PURINVOICE_POOL_LIST.ALL_INVOICE_POOL_FILTER',
    'SSTA.PURINVOICE_POOL_LIST.FINISHED_GRID',
    'SSTA.PURINVOICE_POOL_LIST.FINISHED_INVOICE_FILTER',
    'SSTA.PURINVOICE_POOL_LIST.UNCHECK_GRID',
    'SSTA.PURINVOICE_POOL_LIST.UNCHECK_POOL_FILTER',
    'SSTA.PURINVOICE_POOL_LIST.SYNC_GRID',
    'SSTA.PURINVOICE_POOL_LIST.HANDLE_CREATE',
    'SSTA.PURINVOICE_POOL_LIST.HANDLE_EDIT',
    'SSTA.PURINVOICE_POOL_LIST.SEARCH_BAR_ALL',
    'SSTA.PURINVOICE_POOL_LIST.HEADER_BTNS',
    'SSTA.PURINVOICE_POOL_LIST.TABS',
    'SSTA.PURINVOICE_POOL_LIST.SEARCH_BAR_CHECKED',
    'SSTA.PURINVOICE_POOL_LIST.SEARCH_BAR_UNCHECKED',
    'SSTA.PURINVOICE_POOL_LIST.LINE_CREATE',
    'SSTA.PURINVOICE_POOL_LIST.HEAD_EDIT.LINE_CREATE',
  ],
})
@formatterCollections({
  code: [
    'ssta.costSheet',
    'ssta.invoicePool',
    'hzero.common',
    'ssta.common',
    'ssta.invoiceSheet',
    'ssta.purchaseInvoicePool',
    'hzero.c7nProU',
    'hzero.c7nProUI',
    'ssta.supplySettlePool',
  ],
})
@withProps(
  () => {
    const tableDs = new DataSet(mainTableDs('all'));
    const tableCheckDs = new DataSet(mainTableCheckDs('checked'));
    const tableUnCheckDs = new DataSet(mainTableUncheckDs('unchecked'));
    const tableSyncDs = new DataSet(mainTableDs('sync'));
    return {
      tableDs,
      tableCheckDs,
      tableUnCheckDs,
      tableSyncDs,
    };
  },
  { cacheState: true }
)
@observer
class index extends Component {
  // // 修改信息-发票行录入
  // invoiceLineAddDS = new DataSet(newLineDs(modalCode.LINE_EDIT));

  // refHeight = 0;

  @Bind()
  handleMenuClick({ key, record }) {
    this[key](record);
  }

  constructor(props) {
    super(props);
    const { custConfig } = props;
    const routerParams = querystring.parse(location.search.substr(1));
    const { status = '', layoutType = '' } = routerParams;

    const { fields = [] } = custConfig?.['SSTA.PURINVOICE_POOL_LIST.TABS'] || {};
    const { fieldCode } = fields.find((item) => item?.defaultActive === 1) || {};
    this.state = {
      activeKey: status || props.status || fieldCode || 'all', // 当前 tab 页编码
      layoutType: layoutType || 'flat', // 'wide',
      viewVisible: false,
      invoiceModalVisible: false,
      initFlag: true, // 用来过滤页面渲染时筛选器初次查询
      ocrFileUrl: '',
      invoiceViewUrl: '',
      tenantId: getCurrentOrganizationId(),
      createPermsMap: props.createPermsMap || new Map(),
      refHeight: 0,
      sizeConfig: {},
      invoiceAckFlag: false,
      tripartPullFlag: false,
    };

    this.dsObj = {
      all: props.tableDs,
      checked: props.tableCheckDs,
      unchecked: props.tableUnCheckDs,
      sync: props.tableSyncDs,
    };
  }

  componentDidMount() {
    this.getNumber();
    this.fetchPermissions();
    this.getOcrSizeConfig();
    this.getBusinessRules();
    const { remote: remoteProps } = this.props;
    if (remoteProps && remoteProps.event) {
      remoteProps.event.fireEvent('onLoadCux', {
        handleSetState: this.handleSetState,
      });
    }
  }

  // 记录数据
  @Bind()
  handleSetState(payload) {
    this.setState(payload);
  }

  getOcrSizeConfig = async () => {
    const res = getResponse(await getOcrConfig());
    if (res) {
      const { ocrFileSize, ocrTransSize, fileType } = res;
      this.setState({
        sizeConfig: {
          ocrFileSize,
          ocrTransSize,
          fileType: isNil(fileType)
            ? undefined
            : Array.from(new Set(fileType.split(','))).join('/'),
        },
      });
    }
  };

  @Bind()
  async getBusinessRules() {
    const res = getResponse(await getPullCnfConfig());
    if (!res) return;
    this.setState({
      invoiceAckFlag: Number(res?.['SITE.SSTA.ENABLE_INVOICE_ACK']) === 1,
      tripartPullFlag: Number(res?.['SITE.SSTA.ENABLE_PULL_DATA_EXT_PLATFORM']) === 1,
    });
  }

  /**
   * 手动查询权限集
   */
  fetchPermissions = async () => {
    const res = getResponse(
      await getPermissions([
        'srm.settle-account.invoice-pool.purchase.ps.expoet',
        'srm.settle-account.invoice-pool.purchase.ps.newexport',
        'srm.settle-account.invoice-pool.purchase.ps.import',
        'srm.settle-account.invoice-pool.purchase.ps.newimport',
        'srm.settle-account.invoice-pool.purchase.ps.ofd',
        'srm.settle-account.invoice-pool.purchase.button.ai-recognize',
        'srm.settle-account.invoice-pool.purchase.button.ai-recognize-record',
        'srm.settle-account.invoice-pool.purchase.api.syncable',
        'srm.settle-account.invoice-pool.purchase.button.import-line', // Excel行导入
        'srm.settle-account.invoice-pool.purchase.button.new-import-line', // (新)Excel行导入
        'srm.settle-account.invoice-pool.purchase.button.attachBatchDownLoad',
        'srm.settle-account.invoice-pool.purchase.button.tripart-list-pull',
        'srm.settle-account.invoice-pool.purchase.button.tripart-detail-pull',
        'srm.settle-account.invoice-pool.purchase.button.invoice-ack',
        'srm.settle-account.invoice-pool.purchase.button.error-record',
      ])
    );
    if (res) {
      this.setState({ createPermsMap: res });
    }
  };

  @Bind()
  setLoading(flag) {
    const { activeKey } = this.state;
    const ds = this.dsObj[activeKey];
    ds.status = flag ? 'loading' : 'ready';
  }

  handleUpdateNew = ({ record, name }) => {
    if (['belongCompanyIdLov', 'belongSupplierCompanyIdLov'].includes(name)) {
      this.computeDateProps(record);
    }
    if (['invoiceType'].includes(name)) {
      // 发票类型发生变化，发票代码清空
      record.set('invoiceCode', record.getField('invoiceCode').get('defaultValue'));
    }
  };

  // 根据供应商和公司查询业务规则定义是否启用发票查验
  computeDateProps = async (record) => {
    const { belongCompanyId: companyId, belongSupplierCompanyId: supplierCompanyId } = record.get([
      'belongCompanyId',
      'belongSupplierCompanyId',
    ]);
    if (companyId && supplierCompanyId) {
      this.setLoading(true);
      const res = getResponse(
        await getBusinessRules({
          cnfCode: 'SITE.SSTA.ENABLE_INVOICE_CHECK',
          companyId,
          supplierCompanyId,
        })
      );
      this.setLoading(false);
      record.setState('enableCheckFlag', Boolean(res));
    } else if (record.getState('enableCheckFlag')) {
      record.setState('enableCheckFlag', false);
    }
  };

  @Bind()
  getNumber = (currentKey) => {
    if (currentKey) {
      getNumber({ ...paramsMap[currentKey], type: 'purchaser' }).then((res) => {
        this.dsObj[currentKey].setState('itemCount', res?.totalElements || 0);
      });
    } else {
      Promise.all([
        getNumber({ ...paramsMap.all, type: 'purchaser' }),
        getNumber({ ...paramsMap.checked, type: 'purchaser' }),
        getNumber({ ...paramsMap.unchecked, type: 'purchaser' }),
        getNumber({ ...paramsMap.sync, type: 'purchaser' }),
      ]).then((res) => {
        const itemCounts = {
          all: res[0] ? res[0].totalElements : 0,
          checked: res[1] ? res[1].totalElements : 0,
          unchecked: res[2] ? res[2].totalElements : 0,
          sync: res[3] ? res[3].totalElements : 0,
        };
        Object.keys(this.dsObj).forEach((key) => {
          this.dsObj[key].setState('itemCount', itemCounts[key]);
        });
      });
    }
  };

  @Bind()
  linkToDetail(record) {
    const { invoiceHeaderId } = record.data;
    const { history } = this.props;
    const { activeKey, layoutType } = this.state;
    history.push({
      pathname: '/ssta/purchase-invoice-pool/detail',
      search: querystring.stringify({
        invoiceHeaderId,
        updateFlag: 0,
        status: activeKey,
        layoutType,
      }),
    });
  }

  // 操作记录
  @Bind()
  openOprationModal(record) {
    const { invoiceHeaderId } = record.data;
    const operationDs = new DataSet(
      operationDS({
        url: `/ssta/v1/${getCurrentOrganizationId()}/charge-actions`,
        pk: 'chargeHeaderId',
        lookupCode: 'SSTA.INVOICE_ACTION_STATUS',
        lovPara: { invoiceHeaderId },
        isFilter: true,
      })
    );
    operationDs.setQueryParameter('invoiceHeaderId', invoiceHeaderId);
    Modal.open({
      title: intl.get('hzero.common.button.operating').d('操作记录'),
      drawer: true,
      destroyOnClose: true,
      className: commonStyles['ssta-medium-modal'],
      children: (
        <InvoiceRecord
          record={record}
          invoiceHeaderId={invoiceHeaderId}
          operationDs={operationDs}
          isFilter
        />
      ),
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  }

  async handleDownload(downloadUrl) {
    if (!downloadUrl) return;
    const linkDom = document.createElement('a');
    linkDom.href = downloadUrl;
    linkDom.target = '_blank';
    linkDom.click();
  }

  // 显示Madal
  showModal = (ocrFileUrl) => {
    if (!ocrFileUrl) return;
    const { tenantId } = this.state;
    const bucketName = window.$$env.PRIVATE_BUCKET || 'private-bucket';
    const bucketDirectory = 'finance-invoice';
    const fA = ocrFileUrl.split('.');
    const fileExt = fA && fA[fA.length - 1];
    if (fileExt.toLowerCase() === 'pdf') return previewPdf(ocrFileUrl);
    this.setState({
      ocrFileUrl: getAttachmentUrl(ocrFileUrl, bucketName, tenantId, bucketDirectory),
      viewVisible: true,
    });
  };

  // 关闭Modal
  hideModal = () => {
    this.setState({
      viewVisible: false,
    });
  };

  @Bind()
  handleDownloadOfdFile(ofdFileUrl, record) {
    const associatedApplyNum = record?.get('associatedApplyNum');
    if (ofdFileUrl && associatedApplyNum) {
      const linkDom = document.createElement('a');
      linkDom.href = ofdFileUrl;
      linkDom.target = '_blank';
      linkDom.click();
      return;
    }
    return previewFile(ofdFileUrl);
  }

  hidehideInvoiceModal = () => {
    this.setState({
      invoiceModalVisible: false,
    });
  };

  @Bind()
  checkSave = async (record) => {
    const { activeKey } = this.state;
    const ds = this.dsObj[activeKey];
    this.setLoading(true);
    const res = getResponse(await checkList({ ...record.toData() }));
    this.setLoading(false);
    if (res) {
      notification.success();
    }
    ds.query();
    this.getNumber();
  };

  @Bind()
  onUploadProgress(response, attachment, record) {
    // 如果已经有了attachmentUuid不需要再调更新接口，如果没有先set一下值，然后再调更新接口
    if (!record.get('attachmentUuid')) {
      const { attachmentUUID } = attachment;
      record.set('attachmentUuid', attachmentUUID);
      this.uploadOk({}, record);
    }
  }

  @Bind()
  uploadOk(value, record) {
    const {
      invoiceHeaderId,
      objectVersionNumber,
      invoiceCode,
      invoiceNum,
      attachmentUuid,
    } = record.toData();
    editUploadList({
      attachmentUuid,
      invoiceHeaderId,
      objectVersionNumber,
      invoiceCode,
      invoiceNum,
    }).then((res) => {
      if (res?.failed) {
        notification.error({
          message: res.message,
        });
      } else {
        const { activeKey } = this.state;
        const ds = this.dsObj[activeKey];
        ds.query();
      }
    });
    // }
  }

  @Bind()
  getCommonColunmns() {
    const { activeKey, createPermsMap } = this.state;
    const commonColumns = [
      {
        name: 'statusInfo',
        title: intl
          .get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.exceptionStatus')
          .d('状态信息'),
        width: 200,
        align: 'left',
        aggregation: true,
        children: [
          {
            name: 'invoiceStatusMeaning',
            renderer: (rendererProps) =>
              statusTagRender({ ...rendererProps, name: 'invoiceStatus' }),
          },
          {
            name: 'checkStatusMeaning',
            renderer: (rendererProps) => statusTagRender({ ...rendererProps, name: 'checkStatus' }),
          },
          {
            name: 'validateMessage',
          },
          ...(activeKey === 'sync'
            ? [{ name: 'syncStatus', renderer: statusTagRender }, { name: 'syncResponseMsg' }]
            : []),
        ],
      },
      {
        name: 'operationAggregate',
        title: intl.get(`ssta.invoiceSheet.view.button.operations`).d('操作'),
        width: 250,
        align: 'left',
        aggregation: true,
        command: ({ record }) => {
          const { syncStatus, enableSyncFlag, enableCheckFlag, checkStatus, documentStatus } =
            record.get([
              'syncStatus',
              'enableSyncFlag',
              'enableCheckFlag',
              'checkStatus',
              'documentStatus',
            ]) || {};
          return [
            Number(enableCheckFlag) === 1 && (
              <Tooltip
                placement="top"
                title={intl
                  .get('ssta.common.invoiceSheet.view.button.tooltip.checkoutInfo')
                  .d('当天开具的发票建议最早于次日进行查验')}
              >
                <Button funcType="link" wait={1000} onClick={() => this.checkSave(record)}>
                  {intl.get('ssta.invoiceSheet.view.button.checkoutInfo').d('查验补全')}
                </Button>
              </Tooltip>
            ),
            documentStatus !== 'ASSOCIATED' && checkStatus !== 'SUCCESS' && (
              <Button key="edit" funcType="link" onClick={() => this.handleAction('edit', record)}>
                {intl.get('ssta.invoiceSheet.view.button.editInfo').d('修改信息')}
              </Button>
            ),
            Number(enableSyncFlag) === 1 &&
              createPermsMap.get(`srm.settle-account.invoice-pool.purchase.api.syncable`) &&
              ['all', 'sync'].includes(activeKey) &&
              ['UNSYNCHRONIZED', 'SYNC_FAILURE'].includes(syncStatus) && (
                <Button key="sync" funcType="link" onClick={() => this.handleSync(record)}>
                  {intl.get('hzero.common.button.sync').d('同步')}
                </Button>
              ),
            <Button key="operation" funcType="link" onClick={() => this.openOprationModal(record)}>
              {intl.get('ssta.invoiceSheet.view.button.operationRecord').d('操作记录')}
            </Button>,
          ];
        },
      },
      {
        name: 'keyInfo',
        title: intl
          .get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.keyinfo')
          .d('关键查验信息'),
        width: 200,
        align: 'left',
        filterFlag: 1,
        aggregation: true,
        children: [
          {
            name: 'invoiceNum',
            renderer: ({ value, record }) => (
              <a onClick={() => this.linkToDetail(record)}>{value}</a>
            ),
          },
          {
            name: 'invoiceCode',
          },
          {
            name: 'invoiceTypeMeaning',
          },
          {
            name: 'invoicingDate',
          },
          {
            name: 'checkCode',
          },
        ],
      },
      {
        name: 'otherInvoiceInfo',
        title: intl
          .get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.otherInfo')
          .d('其他票面信息'),
        width: 200,
        align: 'left',
        aggregation: true,
        children: [
          {
            name: 'supplierCompanyName',
          },
          {
            name: 'taxIncludedAmount',
          },
          {
            name: 'taxAmount',
          },
          {
            name: 'netAmount',
          },
          {
            name: 'supUnifiedSocialCode',
          },
          {
            name: 'companyName',
          },
          {
            name: 'purUnifiedSocialCode',
          },
          {
            name: 'remark',
          },
          {
            name: 'memo',
          },
        ],
      },
      {
        name: 'uploadfield',
        title: intl.get('hzero.common.button.uploadView').d('附件查看'),
        width: 120,
        align: 'left',
        aggregation: true,
        command: ({ record }) => {
          const attProps = {
            viewMode: 'popup',
            funcType: 'link',
            readOnly: true,
            value: record.get('attachmentUuid'),
            bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
          };
          return [<Attachment {...attProps} />];
        },
      },
      {
        name: 'urlfield',
        title: intl
          .get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.urlfield')
          .d('文件信息'),
        width: 120,
        align: 'left',
        aggregation: true,
        command: ({ record }) => {
          const { fileUrl, ocrFileUrl, jpgUrl, aiAttachmentUrl } =
            record.get(['fileUrl', 'ocrFileUrl', 'jpgUrl', 'aiAttachmentUrl']) || {};
          return [
            fileUrl && (
              <Button
                key="download"
                funcType="link"
                wait={1000}
                onClick={() => this.handleDownload(fileUrl)}
              >
                {intl.get('ssta.invoiceSheet.view.button.DownLoad').d('下载')}
              </Button>
            ),
            ocrFileUrl && (
              <Button key="ocr" funcType="link" onClick={() => this.showModal(ocrFileUrl)}>
                {intl.get(`ssta.costSheet.view.message.orcFile`).d('查看OCR识别文件')}
              </Button>
            ),
            aiAttachmentUrl && (
              <Button
                key="aiAttachment"
                funcType="link"
                onClick={() => this.showModal(aiAttachmentUrl)}
              >
                {intl.get('ssta.invoicePool.view.button.viewAiFile').d('查看AI识别文件')}
              </Button>
            ),
            jpgUrl && (
              <Button key="ofdToJpg" funcType="link" onClick={() => previewFile(jpgUrl)}>
                {intl
                  .get('ssta.invoiceSheet.view.button.viewOfdIdentificationFile')
                  .d('查看OFD识别文件')}
              </Button>
            ),
          ];
        },
      },
      {
        name: 'otherInfo',
        title: intl
          .get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.otherInfos')
          .d('其他信息'),
        width: 200,
        align: 'left',
        aggregation: true,
        children: [
          {
            name: 'cancelledFlagMeaning',
          },
          {
            name: 'exceptionStatusMeaning',
          },
          {
            name: 'invoiceSourceMeaning',
          },
          {
            name: 'documentStatusMeaning',
            renderer: (rendererProps) =>
              statusTagRender({ ...rendererProps, name: 'documentStatus' }),
          },
          {
            name: 'associatedDocumentNum',
            renderer: ({ record, value }) => {
              return value ? <a onClick={() => this.handleToInvSettle(record)}>{value}</a> : null;
            },
          },
        ],
      },
    ];
    return commonColumns;
  }

  // 判读是否为电票
  isElectronicInvoices = (type) => {
    if (type === '08' || type === '10') {
      return true;
    }
    return false;
  };

  @Bind()
  handleToInvSettle(record) {
    const { history } = this.props;
    const { associatedDocumentId, invoiceSource } = record.get([
      'associatedDocumentId',
      'invoiceSource',
    ]);
    if (!associatedDocumentId) return;
    const pathname = ['SRM_TENDER_FEES'].includes(invoiceSource)
      ? `/ssta/purchaser-sourcing-cost/tender/${associatedDocumentId}`
      : ['SRM_SERVER_FEES'].includes(invoiceSource)
      ? `/ssta/purchaser-sourcing-cost/service/${associatedDocumentId}`
      : `/ssta/new-purchase-settle/invoice/${associatedDocumentId}`;
    history.push({
      pathname,
      search: querystring.stringify({ type: 'view', source: 'invpool' }),
    });
  }

  // @Bind()
  // async handleToDirInvApply(value) {
  //   this.setLoading(true);
  //   const res = getResponse(await getDirInvApplyDataByNum(value));
  //   this.setLoading(false);
  //   if (res) return;
  //   const { applyHeaderId, applyNum } = res;
  //   if (!applyHeaderId) return;
  //   const baseSearch = { type: 'view', source: 'invPool', apiType: 'transform', docFlag: true };
  //   openTab({
  //     key: `/ssta/invoicing-apply/${applyHeaderId}`,
  //     title: intl.get('ssta.common.view.title.invoicingApplyDoc').d('开票申请单') + applyNum,
  //     search: querystring.stringify(baseSearch),
  //   });
  // }

  @Bind()
  getColumns() {
    const { layoutType, createPermsMap, tripartPullFlag, activeKey } = this.state;
    const { remote: remoteProps, history } = this.props;
    const ds = this.dsObj[activeKey];
    let columns = [];
    if (layoutType === 'flat') {
      // 平铺
      columns = [
        {
          name: 'invoiceStatusMeaning',
          type: 'string',
          width: 100,
          renderer: (rendererProps) => statusTagRender({ ...rendererProps, name: 'invoiceStatus' }),
        },
        {
          name: 'operation',
          width: 250,
          align: 'left',
          aggregation: false,
          command: ({ record }) => {
            const {
              lineCount,
              syncStatus,
              checkStatus,
              documentStatus,
              enableSyncFlag,
              enableCheckFlag,
            } =
              record.get([
                'lineCount',
                'syncStatus',
                'checkStatus',
                'documentStatus',
                'enableSyncFlag',
                'enableCheckFlag',
              ]) || {};
            const buttons = [
              {
                name: 'check',
                text: (
                  <Tooltip
                    placement="top"
                    title={intl
                      .get('ssta.common.invoiceSheet.view.button.tooltip.checkoutInfo')
                      .d('当天开具的发票建议最早于次日进行查验')}
                  >
                    {intl.get('ssta.invoiceSheet.view.button.checkoutInfo').d('查验补全')}
                  </Tooltip>
                ),
                onClick: () => this.checkSave(record),
                showFlag: Number(enableCheckFlag) === 1,
                wait: 1000,
              },
              {
                name: 'edit',
                text: intl.get('ssta.invoiceSheet.view.button.editInfo').d('修改信息'),
                onClick: () => this.handleAction('edit', record),
                showFlag: documentStatus !== 'ASSOCIATED' && checkStatus !== 'SUCCESS',
              },
              {
                name: 'sync',
                text: intl.get('hzero.common.button.sync').d('同步'),
                onClick: () => this.handleSync(record),
                showFlag:
                  Number(enableSyncFlag) === 1 &&
                  createPermsMap.get(`srm.settle-account.invoice-pool.purchase.api.syncable`) &&
                  ['all', 'sync'].includes(activeKey) &&
                  ['UNSYNCHRONIZED', 'SYNC_FAILURE'].includes(syncStatus),
              },
              {
                name: 'operationRecord',
                text: intl.get('ssta.invoiceSheet.view.button.operationRecord').d('操作记录'),
                onClick: () => this.openOprationModal(record),
              },
              {
                name: 'tripartDetailPull',
                text: intl
                  .get('ssta.invoiceSheet.view.button.thirdPartyInvDetailQuery')
                  .d('第三方进项发票明细查询'),
                onClick: () => this.handleTripartDetailPull([record]),
                showFlag:
                  lineCount === 0 &&
                  tripartPullFlag &&
                  createPermsMap.get(
                    `srm.settle-account.invoice-pool.purchase.button.tripart-detail-pull`
                  ),
              },
            ];
            return formatColumnCommand({ buttons });
          },
        },
        {
          name: 'invoiceNum',
          width: 150,
          renderer: ({ value, record }) => <a onClick={() => this.linkToDetail(record)}>{value}</a>,
        },
        {
          name: 'checkStatusMeaning',
          type: 'string',
          // lock: 'left',
          width: 100,
          renderer: (rendererProps) => statusTagRender({ ...rendererProps, name: 'checkStatus' }),
        },
        {
          name: 'validateMessage',
          type: 'string',
          // lock: 'left',
          width: 150,
        },

        {
          name: 'belongCompanyName',
          width: 250,
        },
        {
          name: 'belongSupplierCompanyName',
          width: 250,
        },
        {
          name: 'invoiceCode',
          width: 150,
        },
        {
          name: 'invoiceTypeMeaning',
          width: 150,
        },
        {
          name: 'invoicingDate',
          width: 150,
        },
        {
          name: 'netAmount',
          width: 150,
        },
        {
          name: 'taxAmount',
          width: 150,
        },
        {
          name: 'taxIncludedAmount',
          width: 150,
        },
        {
          name: 'checkCode',
          width: 150,
        },
        {
          name: 'remark',
          width: 150,
        },
        {
          name: 'memo',
          width: 150,
        },
        {
          name: 'supplierCompanyName',
          width: 300,
        },
        {
          name: 'supUnifiedSocialCode',
          width: 200,
        },
        {
          name: 'companyName',
          width: 200,
        },
        {
          name: 'purUnifiedSocialCode',
          width: 200,
        },
        {
          name: 'invoiceSourceMeaning',
          width: 150,
        },
        {
          name: 'checkDate',
          width: 250,
        },
        {
          name: 'fileUrl',
          width: 150,
          renderer: ({ record }) =>
            record.get('fileUrl') ? (
              <a href={record.get('fileUrl')}>
                {intl.get('ssta.invoiceSheet.view.button.DownLoad').d('下载')}
              </a>
            ) : null,
        },
        {
          name: 'attachmentUuid',
          width: 120,
          align: 'left',
          command: ({ record }) => {
            const attProps = {
              viewMode: 'popup',
              funcType: 'link',
              readOnly: true,
              value: record.get('attachmentUuid'),
              bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
              bucketDirectory: 'finance-invoice',
            };
            return [<Attachment {...attProps} />];
          },
        },
        {
          name: 'uniSee',
          width: 120,
          align: 'left',
          command: ({ record }) => {
            const ocrFileUrl = record.get('ocrFileUrl');
            return [
              ocrFileUrl && (
                <Button key="ocr" funcType="link" onClick={() => this.showModal(ocrFileUrl)}>
                  {intl.get('hzero.common.button.view').d('查看')}
                </Button>
              ),
            ];
          },
        },
        {
          name: 'aiAttachmentUrl',
          width: 120,
          align: 'left',
          command: ({ record }) => {
            const aiAttachmentUrl = record.get('aiAttachmentUrl');
            return [
              aiAttachmentUrl && (
                <Button onClick={() => this.showModal(aiAttachmentUrl)}>
                  {intl.get('hzero.common.button.view').d('查看')}
                </Button>
              ),
            ];
          },
        },
        {
          name: 'ofdFileUrl',
          width: 150,
          align: 'left',
          command: ({ record }) => {
            const { jpgUrl, ofdFileUrl } = record.get(['jpgUrl', 'ofdFileUrl']);
            return [
              ofdFileUrl && (
                <Button
                  funcType="link"
                  color="primary"
                  onClick={() => this.handleDownloadOfdFile(ofdFileUrl, record)}
                >
                  {intl.get('hzero.common.button.download').d('下载')}
                </Button>
              ),
              jpgUrl && (
                <Button funcType="link" color="primary" onClick={() => previewFile(jpgUrl)}>
                  {intl.get('ssta.invoiceSheet.view.button.preView').d('预览')}
                </Button>
              ),
            ];
          },
        },
        {
          name: 'documentStatusMeaning',
          width: 150,
          renderer: (rendererProps) =>
            statusTagRender({ ...rendererProps, name: 'documentStatus' }),
        },
        {
          name: 'associatedDocumentNum',
          width: 200,
          renderer: ({ record, value }) => {
            return value ? <a onClick={() => this.handleToInvSettle(record)}>{value}</a> : null;
          },
        },
        {
          name: 'associatedApplyNum',
          width: 180,
          // renderer: ({ value }) => {
          //   return (
          //     value && (
          //       <Button
          //         funcType="link"
          //         color="primary"
          //         style={{ userSelect: 'text' }}
          //         wait={1000}
          //         onClick={() => this.handleToDirInvApply(value)}
          //       >
          //         {value}
          //       </Button>
          //     )
          //   );
          // },
        },
        {
          name: 'cancelledFlag',
          width: 150,
          renderer: ({ record }) => {
            return (
              <Badge
                status={record.get('cancelledFlag') === '0' ? 'default' : 'error'}
                text={
                  record.get('cancelledFlag') === '0'
                    ? intl.get(`ssta.invoiceSheet.view.button.notCancelled`).d('未取消')
                    : intl.get(`ssta.invoiceSheet.view.button.cancelled`).d('已取消')
                }
              />
            );
          },
        },
        {
          name: 'exceptionStatusMeaning',
          width: 150,
        },
        {
          name: 'sumCheckTimes',
          width: 150,
        },
        {
          name: 'checkTimes',

          width: 150,
        },
        ...(activeKey === 'sync'
          ? [
              {
                name: 'syncStatus',
                width: 150,
                renderer: statusTagRender,
              },
              {
                name: 'syncResponseMsg',
                width: 200,
              },
            ]
          : []),
      ];
    } else {
      columns = [...this.getCommonColunmns('wide')];
    }
    return remoteProps
      ? remoteProps.process('SSTA_PURCHASE_INVOICE_POOL_COLUMNS', columns, {
          ds,
          layoutType,
          activeKey,
          history,
        })
      : columns;
  }

  // 点击打印
  @Bind()
  async printTax(record) {
    this.setLoading(true);
    const res = await printTax({
      invoiceHeaderId: record.get('invoiceHeaderId'),
    });
    this.setLoading(false);
    if (res) {
      const reader = new FileReader();
      reader.onload = () => {
        const content = reader.result;
        try {
          const failedInfo = JSON.parse(content);
          notification.error({
            description: failedInfo.message,
          });
        } catch (e) {
          this.openUrl(content);
        }
      };
      reader.readAsText(res);
    }
  }

  // 下载税务发票
  @Bind()
  async downloadTax(record) {
    this.setLoading(true);
    const res = await downloadTax({
      invoiceHeaderId: record.get('invoiceHeaderId'),
    });
    this.setLoading(false);
    if (res) {
      const reader = new FileReader();
      reader.onload = () => {
        const content = reader.result;
        try {
          const failedInfo = JSON.parse(content);
          notification.error({
            description: failedInfo.message,
          });
        } catch (e) {
          this.openUrl(content);
        }
      };
      reader.readAsText(res);
    }
  }

  // 点击了打印
  handlePrint = async () => {
    const { activeKey } = this.state;
    const ds = this.dsObj[activeKey];
    const list = ds.selected.map((item) => {
      return { invoiceHeaderId: item.get('invoiceHeaderId') };
    });
    this.setLoading(true);
    const res = getResponse(await batchPrintDownload(list));
    this.setLoading(false);
    if (res) {
      res.forEach((item) => {
        if (item.attributeLongtext1) {
          this.openUrl(item.attributeLongtext1);
        }
      });
    }
  };

  // 根据打印发票返回的数据打开链接
  openUrl = (content) => {
    const { tenantId } = this.state;
    const bucketName = window.$$env.PRIVATE_BUCKET || 'private-bucket';
    const bucketDirectory = 'finance-invoice';
    const url = getAttachmentUrl(content, bucketName, tenantId, bucketDirectory);
    // window.open(url);
    const link = document.createElement('a');
    // link.download = 'fpxx_1_fp.pdf';
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  @Bind()
  getExportParams() {
    const { activeKey } = this.state;
    const ds = this.dsObj[activeKey];
    const codes = codesTable[activeKey];
    const unSelect = ds.selected.length === 0;
    const filterCodes = filterTable[activeKey];
    const customizeUnitCode = [codes, filterCodes].filter((item) => item).join();
    if (unSelect) {
      const queryData = ds.queryDataSet.current?.toData() || {};
      return filterNullValueObject({
        ...queryData,
        ...transformQselectDate(queryData, { invoiceDateRange: 'invoicingDate' }),
        ...transformSupplierData(queryData?.belongSupplierCompanyId, {
          supCompanyPropCode: 'belongSupplierCompanyId',
          supPropCode: 'belongSupplierId',
        }),
        customizeUnitCode,
        ...paramsMap[activeKey],
      });
    } else {
      const invoiceHeaderIdList = ds.selected.map((item) => item.get('invoiceHeaderId')).join();
      return filterNullValueObject({
        invoiceHeaderIdList,
        customizeUnitCode,
        ...paramsMap[activeKey],
      });
    }
  }

  @Bind()
  getLineExportParams() {
    const { activeKey } = this.state;
    const ds = this.dsObj[activeKey];
    const codes = codesTable[activeKey];
    const unSelect = ds.selected.length === 0;
    const filterCodes = filterTable[activeKey];
    const exportSearchbarUnitCode = [codes, filterCodes].filter((item) => item).join();
    if (unSelect) {
      const queryData = ds.queryDataSet.current?.toData() || {};
      [
        'invoiceTypeList',
        'checkStatusList',
        'invoiceSourceList',
        'documentStatusList',
        'invoiceStatusList',
        'cancelledFlagList',
        'exceptionStatusList',
        'invoiceNumList',
        'ackInvoiceTypeList',
      ].forEach((key) => {
        const value = queryData[key];
        if (typeof value === 'string' && value.length > 0) {
          queryData[key] = value.split(',');
        }
      });
      return filterNullValueObject({
        ...queryData,
        ...transformQselectDate(queryData, { invoiceDateRange: 'invoicingDate' }),
        ...transformSupplierData(queryData?.belongSupplierCompanyId, {
          supCompanyPropCode: 'belongSupplierCompanyId',
          supPropCode: 'belongSupplierId',
        }),
        exportSearchbarUnitCode,
      });
    } else {
      const invoiceHeaderIdList = ds.selected.map((item) => item.get('invoiceHeaderId'));
      return filterNullValueObject({
        exportSearchbarUnitCode,
        invoiceHeaderIdList,
      });
    }
  }

  // 点击创建下的操作
  @Bind()
  handleQueryList = (val) => {
    const ds = this.dsObj[val];
    ds.query();
  };

  @Bind()
  addHandleOk() {
    const { activeKey } = this.state;
    const ds = this.dsObj[activeKey];
    ds.query();
  }

  @Bind()
  handleAction(action, record) {
    const { history } = this.props;
    const { activeKey, layoutType } = this.state;
    history.push({
      pathname: '/ssta/purchase-invoice-pool/detail-action',
      search: querystring.stringify(
        filterNullValueObject({
          action,
          invoiceHeaderId: record?.get('invoiceHeaderId'),
          status: activeKey,
          layoutType,
        })
      ),
    });
  }

  @Bind()
  async handleSync(record) {
    const { activeKey } = this.state;
    const ds = this.dsObj[activeKey];
    const data = record ? [record.toJSONData()] : ds.selected.map((item) => item.toJSONData());
    this.setLoading(true);
    const res = getResponse(await syncInvoicePool(data));
    this.setLoading(false);
    if (!res) return;
    notification.success();
    ds.query(undefined, undefined, false);
  }

  @Bind()
  handleExcle(type) {
    const { history } = this.props;
    const templateCode = ['IMPORT_LINE'].includes(type)
      ? 'SSTA.INVOICE_POOL'
      : 'SSTA.INVOICE_HEADER';
    history.push({
      pathname: `/ssta/purchase-invoice-pool/data-import/${templateCode}`,
      search: querystring.stringify({
        backPath: `/ssta/purchase-invoice-pool/list`,
        action: ['IMPORT_LINE'].includes(type)
          ? intl.get('ssta.common.view.button.importLine').d('Excel行导入')
          : intl.get('ssta.invoiceSheet.view.button.excelIns').d('Excel导入'),
        historyButton: false,
        args: JSON.stringify({
          // camp: lineDS.camp,
          // templateCode: 'SSTA.INVOICE_LINE_BATCH_UPDATE',
          templateCode,
          camp,

          // settleHeaderId: source === 'detail' ? settleHeaderId : activeKey,
        }),
      }),
    });
  }

  /**
   * OCR上传/OFD解析
   */
  @Bind()
  async handleUpload(okRequest) {
    if (this.picturesWallRef && this.picturesWallRef.uploadChild) {
      const { fileList } = this.picturesWallRef.uploadChild.state;
      if (isEmpty(fileList)) {
        notification.warning({
          message: intl.get(`ssta.invoiceSheet.view.button.uploadPictureIsNull`).d('上传照片为空'),
        });
        return false;
      } else {
        const fileUrlList = [];
        const fileNameList = [];
        fileList.forEach((n) => {
          const { response, name } = n;
          fileUrlList.push(response);
          fileNameList.push(name);
        });
        const res = getResponse(
          await okRequest(
            fileUrlList.filter((item) => item),
            { camp }
          )
        );
        if (!res) return false;
        // res有值代表同一批OCR识别的附件存在识别失败的，弹窗中只留识别失败的附件
        if (isNil(res) || JSON.stringify(res) === '{}') {
          notification.success();
          const { activeKey } = this.state;
          const ds = this.dsObj[activeKey];
          ds.query();
        } else {
          const errMsgList = [];
          const errFileNameList = [];
          Object.entries(res).forEach(([key, value]) => {
            errMsgList.push(`${key}:${value.desc}`);
            if (value.type !== 'warn') {
              // 上传成功但识别失败的附件，不再保留避免误删除
              errFileNameList.push(key);
            }
          });
          notification.error({
            message: errMsgList.join(','),
            duration: 10,
          });
          const successFileNameList = fileNameList.filter(
            (fileName) => !errFileNameList.includes(fileName)
          );
          const newFileList = fileList.filter((file) => errFileNameList.includes(file.name));
          this.picturesWallRef.uploadChild.setState({
            fileList: newFileList,
          });
          this.picturesWallRef.setState((prevState) => ({
            successFileNameList: prevState.successFileNameList.concat(successFileNameList),
            fileList: newFileList,
          }));
          return false;
        }
      }
    }
  }

  @Bind()
  handleCancel = async () => {
    const { activeKey } = this.state;
    const ds = this.dsObj[activeKey];
    const { selected } = ds;
    const cancelDate = selected.map((item) => item.toData());
    const confirmFlag = await confirmDocNegAction({ action: 'cancel' });
    if (!confirmFlag) return;
    this.setLoading(true);
    const res = getResponse(await cancelList(cancelDate));
    this.setLoading(false);
    if (res) {
      notification.success();
      await ds.query(undefined, undefined, false);
    }
  };

  @Bind()
  handleCheck = async () => {
    const { activeKey } = this.state;
    const ds = this.dsObj[activeKey];
    const { selected } = ds;
    const checkData = selected.map((item) => item.toData());
    this.setLoading(true);
    const res = getResponse(await checkAll(checkData));
    this.setLoading(false);
    if (!res) return;
    if (res.length === 0 || isEmpty(res)) {
      this.getNumber();
      notification.success();
    } else {
      const errorMsg = [];
      //  eslint-disable-next-line
      for (const item in res) {
        errorMsg.push(res[item].desc);
      }
      this.getNumber();
      notification.error({
        message: errorMsg.join(','),
      });
    }
    await ds.query(undefined, undefined, false);
  };

  @Bind()
  handleOcr = () => {
    const { sizeConfig } = this.state;
    const { remote: remoteProps } = this.props;
    const size = sizeConfig.ocrTransSize || 3;
    const fileType = sizeConfig.fileType || 'jpg/jpeg/png/bmp/pdf/ofd';
    const ocrChildrenProps = {
      help: intl
        .get(`ssta.common.model.verify.newMultipleUpload`, {
          size,
          fileType,
        })
        .d(`支持{fileType}格式，建议单个附件不超过{size}M,可批量上传`),
      onRef: (picRef) => {
        this.picturesWallRef = picRef;
      },
      fileSize: (sizeConfig.ocrFileSize || 10) * 1048576,
    };

    const ocrChildrenPropsNew = remoteProps
      ? remoteProps.process('SSTA_PURCHASE_INVOICE_POOL.OCR_CHILDREN', ocrChildrenProps, { size })
      : ocrChildrenProps;
    const orcModalMergeProps = remoteProps
      ? remoteProps.process(
          'SSTA_PURCHASE_INVOICE_POOL.OCR_MODAL_MERGE_PROPS',
          {},
          {
            handleUpload: this.handleUpload,
          }
        )
      : {};
    Modal.open({
      style: { width: 560 },
      className: commonStyles['ocr-upload'],
      title: (
        <Tooltip
          title={intl
            .get('ssta.invoiceSheet.view.title.recognizableSpecies')
            .d(
              '可识别的发票种类：增值税纸质专用发票、增值税电子专用发票、数电票（增值税专用发票）、数电纸质发票（增值税专用发票）、货运运输业增值税专用发票、机动车销售统一发票、增值税纸质普通发票、增值税电子普通发票、增值税普通发票（卷式）、数电票（普通发票）、数电纸质发票（普通发票）'
            )}
        >
          {intl.get(`ssta.costSheet.view.title.ocrDistinguish`).d('OCR识别')}
          <Icon type="help" />
        </Tooltip>
      ),
      children: <PicturesWall {...ocrChildrenPropsNew} />,
      okText: intl.get(`ssta.costSheet.view.title.ocrDistinguish`).d('OCR识别'),
      onOk: () => this.handleUpload(OCRCheck),
      ...orcModalMergeProps,
    });
  };

  @Bind()
  handleOfd = () => {
    Modal.open({
      title: intl.get('ssta.common.view.title.OFDUpload').d('OFD文件上传'),
      children: (
        <PicturesWall
          onRef={(picRef) => {
            this.picturesWallRef = picRef;
          }}
        />
      ),
      okText: intl.get(`ssta.common.view.button.ofdAnalysis`).d('OFD解析'),
      onOk: () => this.handleUpload(OFDCheck),
    });
  };

  @Bind()
  handleAiRecognize = () => {
    Modal.open({
      style: { width: 560 },
      className: commonStyles['ai-recognize-modal'],
      title: intl.get('ssta.common.view.title.aiRecognize').d('AI识别'),
      children: <AiInvoiceUpload />,
      okText: intl.get('ssta.common.view.title.aiRecognize').d('AI识别'),
    });
  };

  @Bind()
  handleTabChange = (val) => {
    this.setState({ activeKey: val });
    const ds = this.dsObj[val];
    ds.query(ds.currentPage);
    // 查询当前tab总数目
    this.getNumber(val);
  };

  tabBarExtraContentRender = () => {
    const { layoutType } = this.state;
    return (
      <div className={commonStyles['ssta-search-layout']}>
        <Popover content={intl.get('ssta.common.view.button.flatTableView').d('平铺表视图')}>
          <div
            className={layoutType === 'flat' ? 'isActive' : 'isNormal'}
            onClick={() => this.handleChangeMode(false)}
          >
            <Icon type="reorder" />
          </div>
        </Popover>
        <Popover content={intl.get('ssta.common.view.button.aggregateTableView').d('聚合表视图')}>
          <div
            className={layoutType !== 'flat' ? 'isActive' : 'isNormal'}
            onClick={() => this.handleChangeMode(true)}
          >
            <Icon type="view_day" />
          </div>
        </Popover>
      </div>
    );
  };

  handleChangeMode = (val) => {
    this.setState({ layoutType: val ? 'wide' : 'flat' }); // 需触发onChange获取布尔值
  };

  /**
   * 筛选器查询回调
   */
  handleQuery = ({ params }) => {
    const { activeKey, initFlag } = this.state;
    const ds = this.dsObj[activeKey];
    if (params.date_range) {
      const range = params.date_range.split(',');
      Object.assign(params, {
        invoicingDateFrom: range[0],
        invoicingDateTo: range[1],
      });
    }
    if (!ds.queryDataSet) return;
    ds.queryDataSet.loadData([
      {
        ...params,
        checkDateFrom: params.checkDateFrom
          ? moment(params.checkDateFrom).format(DATETIME_MIN)
          : null,
        checkDateTo: params.checkDateTo ? moment(params.checkDateTo).format(DATETIME_MAX) : null,
      },
    ]);
    if (initFlag) {
      ds.query(ds.currentPage).then(() => {
        this.setState({
          initFlag: false,
        });
      });
    } else {
      ds.query();
    }
  };

  /**
   * 筛选器字段更改回调
   */
  handleFieldChange = ({ value, name, record }) => {
    if (name === 'invoiceDateRange') {
      record.set('invoicingDate', dateRangeTransform(value, true));
    }
  };

  onAlertDisplayChange = ({ height }) => {
    // setState 不要放在行内函数中，会无限循环
    this.setState({ refHeight: height });
  };

  @Bind()
  tableRender = (codes, filterCodes) => {
    const { customizeTable } = this.props;
    const { tenantId, activeKey, layoutType, refHeight } = this.state;
    const ds = this.dsObj[activeKey];
    return (
      <div className={commonStyles['table-content']}>
        {customizeTable(
          {
            code: codes,
          },
          <SearchBarTable
            cacheState
            searchCode={filterCodes}
            columns={this.getColumns()}
            aggregation={layoutType === 'wide'}
            onAggregationChange={this.handleChangeMode} // 必须加，因为 TableContext会缓存聚合状态，刷新时需触发
            dataSet={ds}
            style={{ maxHeight: `calc(100vh - 260px - ${refHeight}px)` }}
            // pagination={{ pageSizeOptions: ['20', '50', '100'] }}
            searchBarConfig={{
              onQuery: this.handleQuery,
              onFieldChange: this.handleFieldChange,
              fieldProps: {
                belongSupplierCompanyId: { lovPara: { tenantId } },
                invoicingDate: {
                  defaultValue: ({ record }) =>
                    dateRangeTransform(record.get('invoicingDate'), true),
                  dynamicProps: {
                    disabled: ({ record }) =>
                      record.get('invoiceDateRange') &&
                      record.get('invoiceDateRange') !== 'ALL TIME',
                  },
                },
              },
              right: {
                render: this.tabBarExtraContentRender,
              },
              left: {
                render: (_, customizeDs) => (
                  <MultiTextFilter
                    name="invoiceNums"
                    dataSet={customizeDs}
                    placeholder={intl
                      .get('ssta.costSheet.modal.invoiceNum')
                      .d('请输入发票号码查询')}
                  />
                ),
              },
            }}
          />
        )}
      </div>
    );
  };

  @Bind()
  handleAttachBatchDownload() {
    const { activeKey } = this.state;
    const { remote: remoteProps } = this.props;
    const ds = this.dsObj[activeKey];
    const invoiceHeaderIds = ds.selected.map((item) => item.get('invoiceHeaderId'));
    Modal.open({
      style: { width: 300 },
      className: Style['ssta-settle-attachments-download-modal'],
      title: (
        <div>
          {intl.get('ssta.common.view.button.attachmentDownload').d('附件下载')}
          <div>
            {intl
              .get('ssta.common.view.button.attachmentDownloadTitleAttention')
              .d('勾选附件组可进行分组的批量下载')}
          </div>
        </div>
      ),
      children: (
        <InvAttachBatchDownloadModal
          readTransport={{
            url: `/ssta/v1/${organizationId}/invoice-header/file`,
            data: invoiceHeaderIds,
          }}
          remote={remoteProps}
          ds={ds}
        />
      ),
      okText: intl.get('ssta.invoiceSheet.view.button.DownLoad').d('下载'),
    });
  }

  @Bind()
  handleLimitTripartListPull() {
    const { activeKey } = this.state;
    const ds = this.dsObj[activeKey];
    Modal.open({
      drawer: true,
      closable: true,
      className: commonStyles['ssta-small-modal'],
      title: intl
        .get('ssta.invoiceSheet.view.button.thirdPartyInvPoolListQuery')
        .d('第三方进项发票池列表查询'),
      children: <TripartListPullModal listDs={ds} />,
    });
  }

  @Bind()
  async handleTripartDetailPull(recordList) {
    const data = recordList.map((item) => item.toJSONData());
    const res = getResponse(await tripartDetailPull(data));
    if (!res) return false;
    notification.success();
  }

  @Bind()
  async handleAckInvoice() {
    const { activeKey } = this.state;
    const ds = this.dsObj[activeKey];
    const data = ds.selected.map((record) => record.toJSONData());
    ds.status = 'loading';
    const res = getResponse(await invoiceAckValidate(data));
    ds.status = 'ready';
    return getValidationResponse(res, async () => {
      ds.status = 'loading';
      const res = getResponse(await invoiceAck(data));
      ds.status = 'ready';
      if (!res) return false;
      notification.success();
      ds.query();
    });
  }

  @Bind()
  async handleOpenErrorRecord() {
    Modal.open({
      drawer: true,
      closable: true,
      className: commonStyles['ssta-medium-modal'],
      title: intl.get('ssta.invoiceSheet.view.button.errorRecord').d('错误记录'),
      children: <ErrorRecord />,
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  }

  @Bind()
  getHeaderButtons() {
    const { createPermsMap, activeKey, invoiceAckFlag, tripartPullFlag } = this.state;
    const { remote: remoteProps } = this.props;
    const ds = this.dsObj[activeKey] || {};
    const { selected = [] } = ds;
    const loading = ds.status !== 'ready';
    const exportUrl = exportUrlMap[activeKey] || exportUrlMap.all;
    const exportTempCode = exportTempCodeMap[activeKey] || exportTempCodeMap.all;
    const cxFlag =
      selected.length === 0
        ? false
        : selected
            .map((item) => item.toData())
            .every(
              (item) =>
                (item.checkStatus === 'UNCHECK' || item.checkStatus === 'FAILED') &&
                item.documentStatus === 'NOT_ASSOCIATED' &&
                item.cancelledFlag === '0'
            );
    const cyFlag =
      selected.length === 0
        ? false
        : selected.map((item) => item.toData()).every((item) => item.enableCheckFlag === 1);
    const standardBtns = [
      {
        name: 'create',
        group: true,
        children: [
          {
            name: 'handleCreate',
            btnType: 'c7n-pro',
            child: intl.get('ssta.invoiceSheet.view.button.cancels').d('手工新建'),
            btnProps: {
              loading,
              onClick: () => this.handleAction('add'),
            },
          },
          {
            name: 'ocr',
            btnType: 'c7n-pro',
            child: intl.get(`ssta.invoiceSheet.view.button.ocrDistinguish`).d('OCR识别'),
            btnProps: {
              loading,
              onClick: this.handleOcr,
            },
          },
          createPermsMap.get(`srm.settle-account.invoice-pool.purchase.button.ai-recognize`) && {
            name: 'aiRecognize',
            btnType: 'c7n-pro',
            child: intl.get(`ssta.common.view.button.aiRecognize`).d('AI识别'),
            btnProps: {
              loading,
              onClick: this.handleAiRecognize,
            },
          },
          createPermsMap.get(`srm.settle-account.invoice-pool.purchase.ps.ofd`) && {
            name: 'ofd',
            btnType: 'c7n-pro',
            child: intl.get(`ssta.common.view.button.ofdAnalysis`).d('OFD解析'),
            btnProps: {
              loading,
              onClick: this.handleOfd,
            },
          },
          createPermsMap.get(`srm.settle-account.invoice-pool.purchase.ps.import`) && {
            name: 'exportIn',
            child: intl.get('ssta.invoiceSheet.view.button.exinto').d('Excel导入'),
            btnProps: {
              loading,
              btnType: 'c7n-pro',
              onClick: () => this.handleExcle('IMPORT'),
            },
          },
          createPermsMap.get(`srm.settle-account.invoice-pool.purchase.ps.newimport`) && {
            name: 'newExportIn',
            btnComp: CommonImport,
            childFor: 'buttonText',
            child: intl.get(`ssta.invoiceSheet.view.button.exinto1`).d('(新)Excel导入'),
            btnProps: {
              businessObjectTemplateCode: 'SSTA.INVOICE_HEADER',
              prefixPatch: '/ssta',
              successCallBack: () => this.handleQueryList(activeKey),
              args: {
                templateCode: 'SSTA.INVOICE_HEADER',
                camp,
              },
              buttonProps: {
                type: 'c7n-pro',
                icon: '',
                funcType: 'link',
                loading,
                className: commonStyles['meun-item-btn'],
              },
            },
          },
          createPermsMap.get(`srm.settle-account.invoice-pool.purchase.button.import-line`) && {
            name: 'importLine',
            child: intl.get('ssta.common.view.button.importLine').d('Excel行导入'),
            btnProps: {
              btnType: 'c7n-pro',
              loading,
              onClick: () => this.handleExcle('IMPORT_LINE'),
            },
          },
          createPermsMap.get(`srm.settle-account.invoice-pool.purchase.button.new-import-line`) && {
            name: 'newImportLine',
            btnComp: CommonImport,
            childFor: 'buttonText',
            child: intl.get(`ssta.common.view.button.newImportLine`).d('(新)Excel行导入'),
            btnProps: {
              businessObjectTemplateCode: 'SSTA.INVOICE_POOL',
              prefixPatch: '/ssta',
              successCallBack: () => this.handleQueryList(activeKey),
              args: {
                templateCode: 'SSTA.INVOICE_POOL',
                camp,
              },
              buttonProps: {
                type: 'c7n-pro',
                icon: '',
                funcType: 'link',
                loading,
                className: commonStyles['meun-item-btn'],
              },
            },
          },
        ],
        child: (
          <Button type="c7n-pro" color="primary" funcType="raised" icon="add" loading={loading}>
            {intl.get('hzero.common.button.create').d('新建')}
            <Icon type="expand_more" />
          </Button>
        ),
      },
      createPermsMap.get(`srm.settle-account.invoice-pool.purchase.api.syncable`) && {
        name: 'sync',
        child: intl.get('hzero.common.button.sync').d('同步'),
        btnProps: {
          icon: 'sync',
          onClick: () => this.handleSync(),
          loading,
          disabled:
            isEmpty(selected) ||
            selected.some(
              (item) =>
                Number(item.get('enableSyncFlag')) !== 1 ||
                !['UNSYNCHRONIZED', 'SYNC_FAILURE'].includes(item.get('syncStatus'))
            ),
          wait: 1000,
        },
      },
      createPermsMap.get(`srm.settle-account.invoice-pool.purchase.ps.expoet`) && {
        name: 'export',
        btnComp: ExcelExport,
        childFor: 'buttonText',
        child:
          selected.length === 0
            ? intl.get('hzero.common.export').d('导出')
            : intl.get('hzero.common.checkedExport').d('勾选导出'),
        btnProps: {
          otherButtonProps: {
            type: 'c7n-pro',
            funcType: 'flat',
            icon: 'unarchive',
            loading,
          },
          requestUrl: exportUrl,
          queryParams: this.getExportParams,
        },
      },
      createPermsMap.get(`srm.settle-account.invoice-pool.purchase.ps.newexport`) && {
        name: 'newExport',
        btnComp: ExcelExportPro,
        childFor: 'buttonText',
        child:
          selected.length === 0
            ? intl.get('ssta.common.button.newExport').d('(新)导出')
            : intl.get('ssta.common.button.newSelectedExport').d('(新)勾选导出'),
        btnProps: {
          otherButtonProps: {
            type: 'c7n-pro',
            funcType: 'flat',
            icon: 'unarchive',
            loading,
          },
          requestUrl: exportUrl,
          queryParams: this.getExportParams,
          templateCode: exportTempCode,
        },
      },
      createPermsMap.get(`srm.settle-account.invoice-pool.purchase.ps.newexport`) && {
        name: 'lineExport',
        btnComp: ExcelExportPro,
        childFor: 'buttonText',
        child:
          selected.length === 0
            ? intl.get('ssta.common.view.button.invLineExport').d('(发票行)导出')
            : intl.get('ssta.common.view.button.invLineSelectedExport').d('(发票行)勾选导出'),
        btnProps: {
          otherButtonProps: {
            type: 'c7n-pro',
            funcType: 'flat',
            icon: 'unarchive',
            loading,
          },
          requestUrl: `/ssta/v1/${getCurrentOrganizationId()}/invoice-line/purchaser/excel-export?${querystring.stringify(
            lineParamsMap[activeKey]
          )}`,
          queryParams: this.getLineExportParams,
          templateCode: 'SRM_C_SRM_SSTA_INVOICE_LINE_EXPORT',
          allBody: true,
          method: 'POST',
        },
      },
      createPermsMap.get(`srm.settle-account.invoice-pool.purchase.button.attachBatchDownLoad`) && {
        name: 'attachBatchDownLoad',
        child: intl.get('ssta.common.view.button.attachmentTaxBatchDownload').d('批量下载发票文件'),
        btnProps: {
          icon: 'get_app',
          onClick: this.handleAttachBatchDownload,
          loading,
          wait: 1500,
          disabled:
            !selected.length || selected.some((record) => record.get('cancelledFlag') === '1'),
        },
      },
      {
        name: 'check',
        child: (
          <Tooltip
            placement="top"
            title={intl
              .get('ssta.common.invoiceSheet.view.button.tooltip.checkoutInfo')
              .d('当天开具的发票建议最早于次日进行查验')}
          >
            {intl.get('ssta.invoiceSheet.view.button.checkAll').d('批量查验')}
          </Tooltip>
        ),
        btnProps: {
          icon: 'test',
          onClick: this.handleCheck,
          loading,
          disabled: !cyFlag,
          wait: 1000,
        },
      },
      {
        name: 'cancel',
        child: intl.get('ssta.invoiceSheet.view.button.cancsel').d('取消'),
        btnProps: {
          icon: 'cancel',
          onClick: this.handleCancel,
          loading,
          disabled: remoteProps
            ? remoteProps.process('SSTA_PURCHASE_INVOICE_POOL_HEADER_CANCEL_DISABLE', !cxFlag, {
                selected,
                cxFlag,
                state: this.state,
              })
            : !cxFlag,
          wait: 1000,
        },
      },
      createPermsMap.get(`srm.settle-account.invoice-pool.purchase.button.tripart-list-pull`) &&
        tripartPullFlag && {
          name: 'tripartListPull',
          child: intl
            .get('ssta.invoiceSheet.view.button.thirdPartyInvPoolListQuery')
            .d('第三方进项发票池列表查询'),
          btnProps: {
            icon: 'search-o',
            onClick: this.handleLimitTripartListPull,
            loading,
            wait: 1000,
          },
        },
      createPermsMap.get(`srm.settle-account.invoice-pool.purchase.button.tripart-detail-pull`) &&
        tripartPullFlag && {
          name: 'tripartDetailPull',
          child: intl
            .get('ssta.invoiceSheet.view.button.thirdPartyInvDetailQuery')
            .d('第三方进项发票明细查询'),
          btnProps: {
            icon: 'search-o',
            onClick: () => this.handleTripartDetailPull(selected),
            loading,
            disabled: isEmpty(selected) || selected.some((item) => item.get('lineCount') !== 0),
            wait: 1000,
          },
        },
      createPermsMap.get(`srm.settle-account.invoice-pool.purchase.button.invoice-ack`) &&
        invoiceAckFlag && {
          name: 'invoiceAck',
          child: intl.get('ssta.invoiceSheet.view.button.invoiceSignReceive').d('发票签收'),
          btnProps: {
            icon: 'mode_edit',
            onClick: this.handleAckInvoice,
            loading,
            disabled: isEmpty(selected),
            wait: 1000,
          },
        },
      createPermsMap.get('srm.settle-account.invoice-pool.purchase.button.ai-recognize-record') && {
        name: 'aiRecognizeRecord',
        child: intl.get('ssta.common.view.button.aiRecognizeRecord').d('AI识别记录'),
        btnProps: {
          icon: 'operation_service_request',
          loading,
          onClick: () => openAiInvoiceRecognizeRecord({ history: this.props.history }),
          wait: 1000,
        },
      },
      createPermsMap.get(`srm.settle-account.invoice-pool.purchase.button.error-record`) && {
        name: 'errorRecord',
        child: intl.get('ssta.invoiceSheet.view.button.errorRecord').d('错误记录'),
        btnProps: {
          icon: 'error_outline',
          loading,
          onClick: this.handleOpenErrorRecord,
          wait: 1000,
        },
      },
    ];
    const btns = remoteProps
      ? remoteProps.process('SSTA_PURCHASE_INVOICE_POOL_HEADER_BTNS', standardBtns, {
          listDs: ds,
          loading,
        })
      : standardBtns;
    return formatDynamicBtns(btns);
  }

  @Bind()
  getItemCount(key) {
    return this.dsObj[key].getState('itemCount') || 0;
  }

  render() {
    const {
      activeKey,
      viewVisible,
      invoiceModalVisible,
      ocrFileUrl,
      invoiceViewUrl,
      tenantId,
      createPermsMap,
    } = this.state;
    const codes = codesTable[activeKey];
    const { customizeTabPane, customizeBtnGroup } = this.props;
    const filterCodes = filterTable[activeKey];

    return (
      <Fragment>
        <Header
          title={intl.get('ssta.costSheet.view.title.purchaserInvoicePool').d('采购方发票池')}
          style={{ zIndex: 999 }}
        >
          {customizeBtnGroup(
            { code: 'SSTA.PURINVOICE_POOL_LIST.HEADER_BTNS', pro: true },
            <DynamicButtons maxNum={5} defaultBtnType="c7n-pro" buttons={this.getHeaderButtons()} />
          )}
        </Header>
        {invoiceModalVisible && (
          <HzModal
            visible={invoiceModalVisible}
            onCancel={this.hidehideInvoiceModal}
            footer={null}
            width="770px"
          >
            <img alt="" width="95%" src={invoiceViewUrl} />
          </HzModal>
        )}
        <DynamicAlert
          type="error"
          placement="content-top"
          requestUrl={`${SRM_SSTA}/v1/${tenantId}/settle-headers/invoice-check-announcement`}
          onDisplayChange={this.onAlertDisplayChange}
        />
        <Content className={`${commonStyles['ssta-list-content']}`}>
          {customizeTabPane(
            {
              code: 'SSTA.PURINVOICE_POOL_LIST.TABS',
            },
            <Tabs
              animated={false}
              activeKey={activeKey}
              // className="ssta-switch-tabs"
              onChange={this.handleTabChange}
            >
              <TabPane
                key="unchecked"
                tab={intl.get('ssta.costSheet.view.title.costSheetTable.unCheck').d('待查验')}
                count={this.getItemCount('unchecked')}
              >
                {this.tableRender(codes, filterCodes)}
              </TabPane>
              <TabPane
                key="checked"
                tab={intl.get('ssta.costSheet.view.title.costSheetTable.chceked').d('已查验')}
                count={this.getItemCount('checked')}
              >
                {this.tableRender(codes, filterCodes)}
              </TabPane>
              {createPermsMap.get(`srm.settle-account.invoice-pool.purchase.api.syncable`) && (
                <TabPane
                  key="sync"
                  tab={intl.get('ssta.costSheet.view.title.costSheetTable.syncable').d('可同步')}
                  count={this.getItemCount('sync')}
                >
                  {this.tableRender(codes, filterCodes)}
                </TabPane>
              )}
              <TabPane
                key="all"
                tab={intl.get('ssta.costSheet.view.title.costSheetTable.all').d('全部')}
                count={this.getItemCount('all')}
              >
                {this.tableRender(codes, filterCodes)}
              </TabPane>
            </Tabs>
          )}
        </Content>
        {ocrFileUrl && (
          <Viewer
            noImgDetails
            noNavbar
            scalable={false}
            changeable={false}
            visible={viewVisible}
            onClose={this.hideModal}
            downloadable
            images={[
              {
                src: ocrFileUrl,
                alt: '',
                downloadUrl: ocrFileUrl,
              },
            ]}
          />
        )}
      </Fragment>
    );
  }
}

export default index;
