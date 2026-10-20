import React from 'react';
import { Icon, Modal, DataSet } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import { realsePriceAdjustment, revokeWorkflow } from '@/services/priceAdjustmentWorkbenchService';
import { Button as PermissionButton } from 'components/Permission';
import { getResponse } from 'hzero-front/lib/utils/utils';
import { isEmpty } from 'lodash';
import notification from 'utils/notification';
import querystring from 'querystring';
import { openApproveModal } from 'srm-front-boot/lib/components/ApproveModal';
import ApproveRecordSimple from 'srm-front-boot/lib/components/ApproveRecordSimple';
import DynamicButtons from '_components/DynamicButtons';
import intl from 'utils/intl';
import C7nPrecisionInputNumber from '@/routes/components/Precision/C7nPrecisionInputNumber';
import { getPriceEditField } from '@/routes/ssrc/PriceLibraryNew/util';
import { ladderQuoteDS } from '../PriceAdjustmentWorkbench/stores/getDetailsDs';
import ModalChildren from '../PriceAdjustmentWorkbench/Detail/components/ModalChildren';
import ApplicationScope from './components/ApplicationScope';
import { scopeTableDS } from './components/stores';

const { confirm } = Modal;
// 渲染单据状态
function renderStatus({ value, name = '', record = {}, iconType = '' }) {
  const fieldCode = name.replace('Meaning', '');
  const status = record.get && record.get(fieldCode);
  const description = (record.get && record.get(`${fieldCode}Meaning`)) || value;
  const color = getTagColor(status);
  return (
    description && (
      <Tag color={color} style={{ border: 'none' }}>
        {description}
        {iconType && (
          <Icon
            type={iconType}
            style={{
              fontSize: 14,
              cursor: 'pointer',
              position: 'relative',
              margin: '-3px 0px 0 4px',
            }}
          />
        )}
      </Tag>
    )
  );
}

// 获取Tag组件color
function getTagColor(status) {
  const color = greenStatus.includes(status)
    ? 'green' // 绿色
    : redStatus.includes(status)
    ? 'red' // 红色
    : grayStatus.includes(status)
    ? 'gray' // 灰色
    : 'yellow'; // 橙色
  return color;
}

// 绿色状态集合
const greenStatus = [
  'FEEDBACK_BAK',
  'SCORED',
  'COMPLETED',
  'CONFIRMED',
  'APPROVED',
  'EFFECTED',
  'TERMINATION_CONFIRM',
  'HAVE_ALTERATION',
  'ARCHIVE',
  'APPROVE',
  'SYSTEM_COMPLETE',
  'MANUAL_COMPLETE',
  'FINAL_COLLECTED',
  'FEEDBACK',
  'UN_SOURCE',
  'OPENED',
  'POSTQUAL_CUTOFF',
  'FINISHED',
  'PUBLISHED',
  'VALIDATED',
  'REVIEWED',
  'REGISTERED',
  'PASS',
  'CERTIFICATED',
  'RELEASED',
  'COMPLETE',
  // 调查表模板生效状态为1
  1,
  '1',
  'EVALUATED',
  'AUTHENTICATION_APPROVED',
  'EARLY_TERMINATION',
  'FINAL_AUTHENTICATION_COMPLETE',
  'SUBMITTED',
  'SUPPLIER_REJECTED',
  'SUPPLEMENT_COMPLETE',
  'REISSUED',
  'CREATE',
  'SUBMIT',
  'FINISHED@WFL',
  'APPROVING@WFL',
  'FUNC_APPROVE',
  'FEEDBACK_BAK',
  'ICA_SUBMITTED',
  'PCA_SUBMITTED',
];

// 红色状态集合
const redStatus = [
  'BACK',
  'REJECTED',
  'REJECT',
  'SYSTEM_FAIL',
  'RETURNED',
  'RELEASE_REJECT',
  'CONFIRM_REJECT',
  'BACK_SCORE',
  'RELEASE_REJECTED',
  'LACK_QUOTED',
  'CHECK_REJECTED',
  'PAUSED',
  'ICA_REJECTED',
  'PCA_REJECTED',
  'CANCEL FINISH APPROVAL REJECT',
  'PUBULISH APPROVAE REJECT',
  'FAIL',
  'WFL_REJECT',
  'REG_REJECT',
  'AUTHENTICATION_REJECTED',
  'CONFIRM_REJECTED',
  'REJECTED@WFL',
  'BACK',
];

// 灰色状态集合
const grayStatus = [
  'EXPIRED',
  'DELETED',
  'TERMINATION',
  'CANCELLATION',
  'CANCEL',
  'DISCARDED',
  'CLOSED',
  'CANCELED',
  'CANCELLED',
  'ABANDON',
  'RETAIN',
  'UNCERTIFIED',
  'UNREGISTERED',
  'UNSTART', // 未开始
  'UN_START',
  'REGISTER',
  'DISABLED',
  'OBSOLETED',
  'UNCHANGED',
  'DELETE',
];

// 调价单发布
const handleRealse = (record, dataSet, setCount) => {
  const params = record.toData();
  confirm({
    title: intl.get('ssrc.priceAdjustmentWorkBench.view.title.info').d('提示'),
    children: intl
      .get('ssrc.priceAdjustmentWorkBench.view.title.confirmEnable')
      .d('是否确定发布？'),
    onOk() {
      return realsePriceAdjustment([params]).then(async (res) => {
        if (getResponse(res)) {
          notification.success();
          dataSet.query();
          setCount();
        }
      });
    },
  });
};

// 跳转调价单工作台详情
const handleToDetail = (history, priceAdjustmentHeaderId, type) => {
  history.push({
    pathname:
      type === 'edit'
        ? `/spc/price-adjustment-workbench/details/edit`
        : '/spc/price-adjustment-workbench/details/view',
    search: querystring.stringify({
      priceAdjustmentHeaderId,
    }),
  });
};

const getButtons = (history, record, dataSet, setCount) => [
  {
    btnComp: PermissionButton,
    name: 'edit',
    child: intl.get('hzero.common.button.edit').d('编辑'),
    btnProps: {
      funcType: 'link',
      type: 'c7n-pro',
      onClick: () => {
        handleToDetail(history, record.get('priceAdjustmentHeaderId'), 'edit');
      },
      style: { marginRight: 8 },
      permissionList: [
        {
          code: 'srm.ssrc.price.model.price-adjustment-workbench.button.list.edit',
          type: 'button',
          meaning: '调价单工作台列表编辑',
        },
      ],
    },
  },
  {
    btnComp: PermissionButton,
    name: 'publish',
    child: intl.get('hzero.common.button.realse').d('发布'),
    btnProps: {
      style: { marginRight: 8 },
      funcType: 'link',
      type: 'c7n-pro',
      onClick: () => {
        handleRealse(record, dataSet, setCount);
      },
      permissionList: [
        {
          code: 'srm.ssrc.price.model.price-adjustment-workbench.button.list.publish',
          type: 'button',
          meaning: '调价单工作台列表发布',
        },
      ],
    },
  },
];

/**
 * 审批
 */
const handleApproval = (record, dataSet, refresh) => {
  const approvalByBusKey = record.get('approvalByBusKey') || {};
  const { taskId, processInstanceId } = approvalByBusKey;
  if (taskId && processInstanceId) {
    openApproveModal({
      taskId,
      processInstanceId,
      closable: true,
      onSuccess: () => {
        refresh();
      },
    });
  }
};

/**
 * 撤销审批
 */
const handleRevoke = async (record, dataSet, refresh) => {
  Modal.confirm({
    title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
    children: intl
      .get(`ssrc.priceLibraryNew.view.message.note.revokeApprove`)
      .d('您确定要撤销审批吗？您可以在撤销后再次提交审批（注意：仅工作流审批发起人可执行撤销）'),
    onOk: async () => {
      const res = await revokeWorkflow({
        priceAdjustmentHeaderId: record.get('priceAdjustmentHeaderId'),
      });
      if (getResponse(res)) {
        notification.success();
        refresh();
      }
    },
  });
};

// 待审批的按钮
const getApproalButtons = (record, dataSet, refresh) =>
  [
    record?.get('approvalByBusKey') && {
      name: 'approval',
      btnType: 'c7n-pro',
      btnProps: {
        funcType: 'link',
        type: 'c7n-pro',
        wait: 500,
        onClick: () => handleApproval(record, dataSet, refresh),
      },
      child: intl.get('ssrc.priceLibraryNew.view.button.approval').d('审批'),
    },
    record?.get('revokeByBusKeyFlag') && {
      name: 'revokeApproval',
      btnType: 'c7n-pro',
      btnProps: {
        funcType: 'link',
        type: 'c7n-pro',
        wait: 500,
        onClick: () => handleRevoke(record, dataSet, refresh),
      },
      child: intl.get('ssrc.priceLibraryNew.view.button.revokeApproval').d('撤销审批'),
    },
  ].filter(Boolean);

const getColumns = ({
  key,
  history,
  customizeBtnGroup,
  setCount,
  editPriceAdjustmentFlag,
  ruleDefinition,
  refresh,
  remote,
}) => {
  if (key === 'LINEALL') {
    return getLineColumns({ history, ruleDefinition });
  }
  const isToPublish = key === 'TOPUBLISH';
  // 编辑态且来源不是快速寻源
  const toPublishEditor = (record) =>
    editPriceAdjustmentFlag && record.get('sourceFrom') !== 'QUICK_SEARCH_SOURCE';
  return [
    !isToPublish && {
      name: 'priceAdjustmentStatus',
      width: 150,
      renderer: ({ record, value, name }) => {
        return value ? <span>{renderStatus({ value, name, record })}</span> : <span>-</span>;
      },
    },
    isToPublish && {
      name: 'poolStatus',
      width: 150,
      renderer: ({ record, value, name }) => {
        return value ? <span>{renderStatus({ value, name, record })}</span> : <span>-</span>;
      },
    },
    !isToPublish && {
      name: 'priceAdjustmentName',
      width: 150,
    },
    !isToPublish && {
      name: 'priceAdjustmentType',
      width: 150,
    },
    {
      name: 'createdBy',
      width: 150,
      renderer: ({ record }) => {
        return record.get('createdByName') || '-';
      },
    },
    {
      name: 'sourceFrom',
      width: 150,
      renderer: ({ record }) => {
        return record.get('sourceFromMeaning') || '-';
      },
    },
    {
      name: 'creationDate',
      with: 150,
    },
    key === 'ALL' && {
      name: 'option',
      width: 150,
      renderer: ({ record, dataSet }) => {
        const flag = ['NEW', 'REJECTED', 'APPROVAL'].includes(record.get('priceAdjustmentStatus'));
        const buttons =
          record.get('priceAdjustmentStatus') === 'APPROVAL'
            ? getApproalButtons(record, dataSet, refresh)
            : getButtons(history, record, dataSet, setCount);
        const btnObj = remote
          ? remote.process(
              'SSRC_PRICE_ADJUSTMENT_WORKBENCH_PAGE_ALL_OPERATIONS_BUTTONS',
              { buttons, flag },
              {
                dataSet,
                record,
                flag,
              }
            )
          : { buttons, flag };
        return btnObj?.flag && btnObj?.buttons.length
          ? customizeBtnGroup(
              {
                code: 'SPC.PRICEADJUSTMENTWORKBENCH.DETAIL.BUTTONS',
                pro: true,
              },
            <DynamicButtons buttons={btnObj?.buttons} />
            )
          : '-';
      },
    },
    key === 'APPROVAL' && {
      name: 'option',
      width: 150,
      renderer: ({ record, dataSet }) => {
        return <DynamicButtons buttons={getApproalButtons(record, dataSet, refresh)} />;
      },
    },
    ['APPROVAL', 'ALL'].includes(key) && {
      title: intl.get('ssrc.priceLibraryNew.model.library.approvalProgress').d('审批进度'),
      width: 200,
      name: 'approvalProgress',
      renderer: ({ record }) => {
        const data = record.get('approvalProcessByBusKey');
        return data ? <ApproveRecordSimple data={data} /> : '-';
      },
    },
    !isToPublish && {
      name: 'priceAdjustmentCode',
      width: 200,
      renderer: ({ record, value }) => {
        return value ? (
          <a
            onClick={() => {
              // eslint-disable-next-line no-unused-expressions
              key === 'NEW'
                ? handleToDetail(history, record.get('priceAdjustmentHeaderId'), 'edit')
                : handleToDetail(history, record.get('priceAdjustmentHeaderId'), 'view');
            }}
          >
            {value}
          </a>
        ) : (
          '-'
        );
      },
    },
    isToPublish && {
      name: 'sourceFromNum',
      width: 150,
    },
    isToPublish && {
      name: 'sourceFromLineNum',
      width: 150,
    },
    isToPublish && {
      name: 'itemCategoryId',
      width: 150,
      editor: toPublishEditor,
    },
    isToPublish && {
      name: 'supplierCompanyId',
      width: 150,
      editor: toPublishEditor,
    },
    isToPublish && {
      name: 'validDateFrom',
      width: 150,
      editor: toPublishEditor,
    },
    isToPublish && {
      name: 'validDateTo',
      width: 150,
      editor: toPublishEditor,
    },
    isToPublish && {
      name: 'ouId',
      width: 150,
      editor: toPublishEditor,
    },
    isToPublish && {
      name: 'invOrganizationId',
      width: 150,
      editor: toPublishEditor,
    },
    isToPublish && {
      name: 'purOrganizationId',
      width: 150,
      editor: toPublishEditor,
    },
    isToPublish && {
      name: 'purchaseAgentId',
      width: 150,
      editor: toPublishEditor,
    },
    isToPublish && {
      name: 'uomId',
      width: 150,
      editor: toPublishEditor,
    },
    isToPublish && {
      name: 'sourceFrom',
      width: 150,
    },
    isToPublish && {
      name: 'benchmarkPriceType',
      width: 150,
    },
    isToPublish && {
      name: 'taxIncludedPrice',
      width: 150,
      editor: (record) => {
        return (
          toPublishEditor(record) && (
            <C7nPrecisionInputNumber
              name="taxIncludedPrice"
              record={record}
              currency="currencyCode"
            />
          )
        );
      },
    },
    isToPublish && {
      name: 'netPrice',
      width: 150,
      editor: (record) => {
        return (
          toPublishEditor(record) && (
            <C7nPrecisionInputNumber name="netPrice" record={record} currency="currencyCode" />
          )
        );
      },
    },
    isToPublish && {
      name: 'ladderQuotation',
      width: 150,
      renderer: ({ record, dataSet }) => (
        <a
          onClick={() =>
            showLadderQuote({
              isEdit: toPublishEditor(record),
              ruleDefinition: dataSet.getState('ruleDefinition'),
              parentRecord: record,
            })
          }
        >
          {intl.get(`spcm.common.model.ladderQuote`).d('阶梯价格')}
        </a>
      ),
    },
    isToPublish && {
      name: 'applicationScope',
      width: 150,
      renderer: ({ record }) => (
        <a
          disabled={!record.get('priceAdjustmentPoolId')}
          onClick={() =>
            showApplicationScope(toPublishEditor(record), {
              appScopeType: 'POOL',
              priceAdjustmentLineId: record.get('priceAdjustmentPoolId'),
            })
          }
        >
          {intl.get(`ssrc.inquiryHall.view.title.applicationScope`).d('适用范围')}
        </a>
      ),
    },
    isToPublish && {
      name: 'itemId',
      width: 150,
      editor: toPublishEditor,
    },
    isToPublish && {
      name: 'companyId',
      width: 150,
      editor: toPublishEditor,
    },
    isToPublish && {
      name: 'currencyCode',
      width: 150,
      editor: toPublishEditor,
    },
    isToPublish && {
      name: 'taxId',
      width: 150,
      editor: toPublishEditor,
    },
    isToPublish && {
      name: 'exchangeRate',
      width: 150,
      editor: toPublishEditor,
    },
    isToPublish && {
      name: 'exchangeRateType',
      width: 150,
      editor: toPublishEditor,
    },
    isToPublish && {
      name: 'exchangeRateDate',
      width: 150,
      editor: toPublishEditor,
    },
    isToPublish && {
      name: 'supplierTenantId',
      width: 150,
      editor: toPublishEditor,
    },
    isToPublish && {
      name: 'priceBatchQuantity',
      width: 150,
      editor: toPublishEditor,
    },
    isToPublish && {
      name: 'supplierId',
      width: 150,
      editor: toPublishEditor,
    },
    ['APPROVED', 'ALL'].includes(key) && {
      name: 'syncPriceLibStatus',
      width: 150,
    },
  ].filter(Boolean);
};

const getLineColumns = ({ history, ruleDefinition }) => {
  return [
    {
      name: 'priceAdjustmentLineID',
      width: 150,
    },
    {
      name: 'priceAdjustmentLineNum',
      width: 150,
    },
    {
      name: 'sourceFromNum',
      width: 150,
    },
    {
      name: 'sourceFromLineNum',
      width: 150,
    },
    {
      name: 'itemCategoryId',
      width: 140,
    },
    {
      name: 'supplierCompanyId',
      width: 150,
    },
    {
      name: 'validDateFrom',
      width: 150,
    },
    {
      name: 'validDateTo',
      width: 150,
    },
    {
      name: 'ouId',
      width: 150,
    },
    {
      name: 'invOrganizationId',
      width: 150,
    },
    {
      name: 'purOrganizationId',
      width: 150,
    },
    {
      name: 'purchaseAgentId',
      width: 150,
    },
    {
      name: 'uomId',
      width: 150,
    },
    {
      name: 'sourceFrom',
      width: 150,
    },
    {
      name: 'benchmarkPriceType',
      width: 150,
    },
    {
      name: 'taxIncludedPrice',
      width: 150,
    },
    {
      name: 'netPrice',
      width: 150,
    },
    {
      name: 'ladderQuotation',
      width: 150,
      renderer: ({ record }) => (
        <a
          onClick={() => {
            showLadderQuote({
              ruleDefinition,
              isEdit: false,
              parentRecord: record,
            });
          }}
        >
          {intl.get(`spcm.common.model.ladderQuote`).d('阶梯价格')}
        </a>
      ),
    },
    {
      name: 'applicationScope',
      width: 150,
      renderer: ({ record }) => (
        <a
          disabled={!record.get('priceAdjustmentLineId')}
          onClick={() =>
            showApplicationScope(false, {
              appScopeType: 'ORDER',
              priceAdjustmentLineId: record.get('priceAdjustmentLineId'),
            })
          }
        >
          {intl.get(`ssrc.inquiryHall.view.title.applicationScope`).d('适用范围')}
        </a>
      ),
    },
    {
      name: 'itemId',
      width: 140,
    },
    {
      name: 'itemName',
      width: 140,
    },
    {
      name: 'companyId',
      width: 150,
    },
    {
      name: 'currencyCode',
      width: 150,
    },
    {
      name: 'taxId',
      width: 150,
      align: 'right',
    },
    {
      name: 'exchangeRate',
      width: 150,
    },
    {
      name: 'exchangeRateType',
      width: 150,
    },
    {
      name: 'exchangeRateDate',
      width: 150,
    },
    {
      name: 'supplierTenantId',
      width: 150,
    },
    {
      name: 'creationDate',
      width: 150,
    },
    {
      name: 'calcDetil',
      width: 150,
      title: intl.get(`spc.advancedPricingRecord.view.title.calcDetail`).d('计算明细'),
      renderer: ({ record }) => {
        const recordLineId = record.get('recordLineId');
        return (
          recordLineId && (
            <a
              onClick={() => {
                history.push({
                  pathname: `/spc/advanced-pricing-record/detail/${recordLineId}/true`,
                });
              }}
            >
              {intl.get(`spc.advancedPricingRecord.view.title.calcDetail`).d('计算明细')}
            </a>
          )
        );
      },
    },
    {
      name: 'priceBatchQuantity',
      width: 150,
    },
    {
      name: 'supplierId',
      width: 150,
    },
  ];
};

const showLadderQuote = (props) => {
  const { isEdit = false, parentRecord, ruleDefinition = [] } = props;
  const { priceLibLadderList = [], taxRate, currencyCode = {} } = parentRecord.get([
    'priceLibLadderList',
    'taxRate',
    'currencyCode',
  ]);
  const editField = getPriceEditField(parentRecord, ruleDefinition);
  const ladderQuoteDs = new DataSet(
    ladderQuoteDS({ isEdit, editField, currencyCode, parentTaxRate: taxRate })
  );
  priceLibLadderList.forEach((item) => {
    ladderQuoteDs.create({
      ...item,
    });
  });
  const modalChildrenProps = {
    isEdit,
    ladderQuoteDs,
    record: parentRecord,
  };

  const isViewProps = !isEdit && {
    okButton: false,
    cancelText: intl.get('hzero.common.button.close').d('关闭'),
    cancelProps: {
      color: 'primary',
    },
  };

  Modal.open({
    closable: true,
    movable: false,
    drawer: true,
    key: Modal.key(),
    title: intl.get(`spcm.common.model.ladderQuote`).d('阶梯价格'),
    style: {
      width: 1090,
    },
    onOk: async () => {
      const flag = await getResponse(ladderQuoteDs.validate());
      if (flag) {
        const allData = ladderQuoteDs.toData();
        const validateFlag = handleValidateLadderQuote(allData);
        if (!validateFlag) {
          // 报错
          notification.error({
            description: intl
              .get('ssrc.priceAdjustmentWorkBench.view.message.ladderFormatError')
              .d('阶梯价维护格式错误，请重新检查'),
          });
          return false;
        }
        parentRecord.set('priceLibLadderList', ladderQuoteDs.toData());
        return;
      }
      return false;
    },
    children: <ModalChildren {...modalChildrenProps} />,
    // footer: null,
    ...isViewProps,
  });
};

// // 校验阶梯价格下一行"数量从"应该比上一行"数量至"大
const handleValidateLadderQuote = (data = []) => {
  if (!isEmpty(data)) {
    let maxNumber = 0;
    const result = data.some((i, index) => {
      const { ladderFrom, ladderTo } = i;
      if (index === 0) {
        maxNumber = ladderTo;
        return false;
      } else {
        // 下一行"数量从"比上一行"数量至"小，结束循环，报错提示
        const flag = ladderFrom < maxNumber;
        if (flag) {
          return true;
        }
        maxNumber = ladderTo;
        return false;
      }
    });
    return !result;
  }
  return true;
};

const tempDelete = async (dataSet, primaryKey, paramName) => {
  const { selected } = dataSet;
  const newAddRows = [];
  const existedRows = [];
  selected.forEach((ele) => {
    if (ele.get(primaryKey)) {
      ele.reset();
      existedRows.push(ele);
    } else {
      ele.restore();
      newAddRows.push(ele);
    }
  });
  // 删除本地数据
  dataSet.remove(newAddRows);

  // 删除数据缓存
  if (!isEmpty(existedRows)) {
    // 获取上次之前的删除行
    const cacheDeleteLines = dataSet.getState('deleteLines');
    const deleteLines = cacheDeleteLines ? existedRows.concat([...cacheDeleteLines]) : existedRows;
    const deleteLineIds = deleteLines.map((item) => item.get(primaryKey));

    dataSet.remove(existedRows, true);
    dataSet.setQueryParameter(paramName, deleteLineIds.join(','));
    dataSet.query({}, { [paramName]: deleteLineIds.join(',') }, true);

    dataSet.setState('deleteLines', [...deleteLines]);
  }
};

/**
 * 展示适用范围
 */
const showApplicationScope = (isEdit, param) => {
  const scopeTableDs = new DataSet(scopeTableDS(isEdit));
  const scopeProps = {
    isEdit,
    tableDs: scopeTableDs,
    ...param,
  };
  const notEditProps = {
    okCancel: false,
    title: intl.get('ssrc.priceLibraryNew.view.title.viewScope').d('查看适用范围'),
    okText: intl.get('hzero.common.button.close').d('关闭'),
  };

  // 打开弹框
  Modal.open({
    key: Modal.key(),
    title: intl.get('ssrc.priceLibraryNew.view.title.maintenanceScope').d('编辑适用范围'),
    drawer: true,
    style: {
      width: '742px',
    },
    children: <ApplicationScope {...scopeProps} />,
    bodyStyle: { padding: 0 },
    ...(isEdit ? {} : notEditProps),
  });
};

export {
  getColumns,
  showLadderQuote,
  renderStatus,
  handleToDetail,
  tempDelete,
  showApplicationScope,
};
