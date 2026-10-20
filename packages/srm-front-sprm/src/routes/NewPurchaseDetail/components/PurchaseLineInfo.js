import React, { useContext, useMemo, useRef } from 'react';

import intl from 'utils/intl';
import { isFunction } from 'lodash';
import classnames from 'classnames';
import { observer } from 'mobx-react-lite';
import notification from 'utils/notification';
import { yesOrNoRender } from 'utils/renderer';

import { Tag } from 'choerodon-ui';
import { getResponse } from 'utils/utils';
import DocFlow from '_components/DocFlow';
import { Modal } from 'choerodon-ui/pro';
import { Button as PermissionButton } from 'components/Permission';

import { PriceModal } from '@/routes/components/priceModal';
import ViewPrimaryUrl from '@/routes/ProductImage.js';
import {
  cancelPurchase,
  fetchPurchaseLinesClose,
} from '@/services/purchaseRequisitionCancelService';
import Remark from '../components/Remark';
import PriceList from '../components/PriceList';
import { ItemCustom } from '../components/ItemCustomC7N';
import LineChangeTable from '../components/LineChangeTable';
import CustomSpecsModal from '../components/CustomSpecsModal';
import ProductSpecsModal from '../components/ProductSpecsModal';
import ExecutionBillDetail from '../components/ExecutionBillDetail';

import OutsourcingBom from '../components/OutsourcingBom';
import { renderAmount, colorRender } from '../hook';
import { Store } from '../stores';
import '../index.less';

// 设置sprm国际化前缀 - common - model
const commonPrompt = 'sprm.common.model.common';
const messagePrompt = 'sprm.purchaseRequisitionCancel.view.message';

const tableButton = () => {
  const {
    headerDs,
    listDs,
    source,
    prHeaderId,
    isNewCancelTeant,
    prSourcePlatform,
    commonUpdate,
    customizeForm,
    backViodPageFlag,
    isOldUser,
    pubPathFlag,
    cuxHandleLineBtns,
    handleCuxLineCancelClose,
    remote,
    handleOperationModal,
    code: workflowFormCode,
  } = useContext(Store);

  const remarkRef = useRef({});

  const handleCancelClose = (type) => {
    const { selected } = listDs;
    if (selected && selected.length === 0) {
      notification.error({
        message: intl.get(`hzero.common.validation.atLeast`).d('请至少选择一条数据'),
      });
      return;
    }

    const lineCancelCloseFunc = () => {
      const { handleCancelProps } = remote?.props?.process || {};
      Modal.open({
        key: Modal.key(),
        title:
          type === 'cancelledRemark'
            ? intl.get(`sprm.purchaseRequisitionCancel.view.message.cancelReason`).d('取消原因')
            : intl.get(`sprm.purchaseRequisitionCancel.view.message.closeReason`).d('关闭原因'),
        children: (
          <Remark
            isOldUser={isOldUser}
            prHeaderId={prHeaderId}
            ref={remarkRef}
            required
            customizeForm={customizeForm}
            params={{ prLineIds: selected.map((e) => e.get('prLineId')), prHeaderId }}
            btnType={type}
            cusCode={
              type === 'cancelledRemark'
                ? 'SPRM.PURCHASE_PLAFORM.CANCELMODAL'
                : 'SPRM.PURCHASE_PLAFORM.CLOSEMODAL'
            }
            remarkLabel={
              type === 'cancelledRemark'
                ? intl.get(`sprm.purchaseRequisitionCancel.view.message.cancelReason`).d('取消原因')
                : intl.get(`sprm.purchaseRequisitionCancel.view.message.closeReason`).d('关闭原因')
            }
          />
        ),
        closable: true,
        movable: false,
        drawer: true,
        destroyOnClose: true,
        onCancel: () => {},
        onOk: async () => {
          const remarkCurrent = remarkRef.current.saveCurrentData();
          const validateFlag = await remarkCurrent.validate();
          if (validateFlag) {
            const [{ cancelRemark, cancelledRemark, ...other }] = remarkCurrent.toData();

            const operationType = type === 'cancelledRemark' ? 'CANCEL' : 'CLOSE';
            // 工作流审批提交前的弹窗表单
            const resp = await handleOperationModal({
              code: `SPRM.PURCHASE_PLAFORM_CANCEL.OPERATION_${operationType}_FORM`,
              operationType,
              body: {
                prHeaderId,
                prLineList: selected.map((s) => s.toData()),
              },
              handleOk: (data) => {
                other.customWorkFlowParam = data;
              },
            });
            if (!resp) return false;

            const cuxCancelProps = isFunction(handleCancelProps)
              ? handleCancelProps({ btnType: type, ...other })
              : {};
            if (type === 'cancelledRemark') {
              cancelPurchase(
                selected?.map((ele) => {
                  return { ...ele.toJSONData(), cancelledRemark, ...other, ...cuxCancelProps };
                })
              ).then((result) => {
                const res = getResponse(result);
                if (res && !res.failed) {
                  commonUpdate();
                }
              });
            } else {
              fetchPurchaseLinesClose(
                selected?.map((ele) => {
                  return {
                    ...ele.toJSONData(),
                    closedRemark: cancelRemark || cancelledRemark,
                    ...other,
                  };
                })
              ).then((result) => {
                const res = getResponse(result);
                if (res && !res.failed) {
                  const { successCounts, failedCounts } = res;
                  notification.success({
                    message: intl
                      .get(`${messagePrompt}.successAndfailed`, { successCounts, failedCounts })
                      .d(`成功了${successCounts}条，失败了${failedCounts}条`),
                  });
                  commonUpdate();
                }
              });
            }
          } else {
            return false;
          }
        },
        footer: (okBtn, cancelBtn) => (
          <div>
            {okBtn}
            {cancelBtn}
          </div>
        ),
        style: { width: type === 'closedRemark' ? '742px' : '380px' },
      });
    };

    if (isFunction(handleCuxLineCancelClose)) {
      handleCuxLineCancelClose(selected, type, lineCancelCloseFunc);
    } else {
      lineCancelCloseFunc();
    }
  };

  const btns = [];

  const CancelBtn = observer(() => {
    const { current } = headerDs;
    const { selected } = listDs;
    const disableFlag = useMemo(() => {
      return (
        current?.get('cancelStatusCode') === 'CANCELLEDING' ||
        selected.length === 0 ||
        (isNewCancelTeant
          ? selected.some((ele) => ele.get('prLineCancelledFlag') !== 1)
          : !selected.every((ele) =>
              ['APPROVED', 'ASSIGNED', 'SUSPEND'].includes(ele.get('prLineStatusCode'))
            ))
      );
    }, [current, isNewCancelTeant, selected]);
    return (
      <PermissionButton
        onClick={() => handleCancelClose('cancelledRemark')}
        disabled={disableFlag}
        icon="cancel"
        key="cancel"
        name="cancel"
        funcType="flat"
        type="c7n-pro"
        color="primary"
        permissionList={[
          {
            code: `hzero.srm.requirement.prm.pr-platform.ps.control-line-cancel`,
            type: 'button',
            meaning: '取消',
          },
        ]}
      >
        {intl.get(`hzero.common.button.cancel`).d('取消')}
      </PermissionButton>
    );
  });

  const CloseBtn = observer(() => {
    const { selected } = listDs;
    const disableFlag = useMemo(() => {
      return selected.length === 0 || selected.some((ele) => ele.get('prLineClosedFlag') !== 1);
    }, [selected]);
    return (
      <PermissionButton
        onClick={() => handleCancelClose('closedRemark')}
        disabled={disableFlag}
        icon="not_interested"
        key="close"
        name="close"
        funcType="flat"
        color="primary"
        type="c7n-pro"
        permissionList={[
          {
            code: `hzero.srm.requirement.prm.pr-platform.ps.control-line-close`,
            type: 'button',
            meaning: '关闭',
          },
        ]}
      >
        {intl.get(`hzero.common.button.close`).d('关闭')}
      </PermissionButton>
    );
  });

  btns.push(
    ['SRM', 'ERP', 'SHOP', 'CATALOGUE'].includes(prSourcePlatform) && <CancelBtn name="cancel" />,
    headerDs.current?.get('prStatusCode') === 'APPROVED' &&
      isNewCancelTeant &&
      ['SRM', 'ERP', 'SHOP', 'CATALOGUE'].includes(prSourcePlatform) && <CloseBtn name="close" />
  );

  const processBtns = isFunction(cuxHandleLineBtns) ? cuxHandleLineBtns(btns, {}) : btns;
  const cuxBtns = remote
    ? remote.process('SPRM_PURCHASE_PLAFORM_LINE_BTNS', [], {
        workflowFormCode,
        listDs,
        headerDs,
      })
    : [];

  return source === 'inquery' &&
    headerDs.current?.get('prStatusCode') !== 'PENDING' &&
    headerDs.current?.get('changedFlag') === 0 &&
    !backViodPageFlag &&
    pubPathFlag &&
    headerDs?.current?.get('prStatusCode') !== 'WORKFLOW_APPROVAL'
    ? processBtns
    : cuxBtns;
};

const PurchaseLineInfo = function PurchaseLineInfo({ code, remote, buttonCode }) {
  const { handleOnRow, cuxHandleColumns } = remote?.props?.process || {};
  const defaultOnRow = () => ({});
  const {
    isOldUser,
    source,
    prSourcePlatform,
    customizeTable,
    uomControl,
    pubPathFlag,
    headerDs,
    listDs,
    docLinkFlag,
    location,
    docLinkControl,
    code: workflowFormCode,
    prHeaderId,
    cuxLineRef,
  } = useContext(Store);

  const viewPrimaryUrl = ({ record }) => {
    Modal.open({
      key: Modal.key(),
      drawer: true,
      style: { width: '380px' },
      children: <ViewPrimaryUrl currentPrLineId={record?.get('prLineId')} />,
    });
  };

  const lineColumns = useMemo(() => {
    let allCols = [
      {
        name: 'displayLineNum',
        width: 100,
      },
      {
        name: 'docFlow',
        width: 100,
        hidden: !docLinkControl,
        renderer: ({ record }) =>
          docLinkFlag && Number(docLinkFlag) ? null : (
            <div style={{ height: '100%', display: 'flex' }}>
              <DocFlow
                tableName="sprm_pr_line"
                tablePk={record.get('prLineId')}
                buttonType="button"
              />
            </div>
          ),
      },
      {
        name: 'prLineStatusCodeMeaning',
        width: 100,
        renderer: ({ value, record }) => {
          return colorRender(record.get('prLineStatusCode'), value);
        },
      },
      {
        name: 'invOrganizationIdLov',
        width: 200,
      },
      { name: 'productNum', width: 100 },
      { name: 'productName', width: 200 },
      {
        name: 'primaryUrl',
        width: 100,
        renderer: ({ record }) => (
          <a onClick={() => viewPrimaryUrl({ record })}>
            {intl.get('sprm.common.model.view.primaryUrl').d('查看主图')}
          </a>
        ),
      },
      { name: 'thirdSkuCode', width: 100 },
      { name: 'thirdSkuName', width: 100 },
      { name: 'productBrand', width: 100 },
      { name: 'productModel', width: 100 },
      { name: 'packingList', width: 100 },
      {
        name: 'itemCodeLov',
        width: 100,
      },
      {
        name: 'itemName',
        width: 200,
      },
      {
        name: 'customMadeFlag',
        width: 100,
        renderer: ({ value }) => yesOrNoRender(Number(value)),
      },
      {
        name: 'customAttributeList',
        width: 100,
        renderer: ({ record }) =>
          record.get('customMadeFlag') === 1 ? <ItemCustom record={record} disabled /> : null,
      },
      { name: 'itemModel', width: 100 },
      { name: 'itemSpecs', width: 100 },
      {
        name: 'categoryName',
        width: 100,
      },
      { name: 'catalogName', width: 100 },
      { name: 'neededDate', width: 100 },
      {
        name: 'outsourcingBomFlag',
        width: 150,
        renderer: ({ value }) => yesOrNoRender(Number(value)),
      },
      {
        name: 'outsourcingBom',
        width: 150,
        renderer: ({ record }) =>
          record?.get('outsourcingBomFlag') ? (
            <OutsourcingBom
              record={record}
              headerDs={headerDs}
              readOnly
              customizeTable={customizeTable}
              custCode="SPRM.PURCHASE_PLAFORM_QUERY.OUTSOURCINGBOM"
            />
          ) : null,
      },
      {
        name: 'quantity',
        type: 'number',
        width: 100,
      },
      {
        name: 'orderExcessRuleCode',
        width: 100,
      },
      {
        name: 'sourceExcessRuleCode',
        width: 100,
      },
      {
        name: 'contractExcessRuleCode',
        width: 100,
      },
      {
        name: 'sourceDisposableExcessFlag',
        width: 100,
      },
      {
        name: 'sourceOccupiedQuantity',
        type: 'number',
        width: 100,
        // title: intl.get(`${commonPrompt}.sourceOccupiedQuantity`).d('寻源占用数量'),
      },
      {
        name: 'orderOccupiedQuantity',
        type: 'number',
        width: 100,
        // title: intl.get(`${commonPrompt}.orderOccupiedQuantity`).d('订单占用数量'),
      },
      {
        name: 'changeOrderFailCount',
        type: 'number',
        width: 100,
      },
      {
        name: 'restSourceQuantity',
        type: 'number',
        width: 100,
        // title: intl.get(`${commonPrompt}.restSourceQuantity`).d('寻源剩余可下单数量'),
      },
      {
        name: 'restPoQuantity',
        type: 'number',
        width: 100,
        // title: intl.get(`${commonPrompt}.orderRestPoQuantity`).d('订单剩余可下单数量'),
      },
      {
        name: 'secondLevelStrategyCode',
        title: intl.get(`${commonPrompt}.secondLevelStrategyCode`).d('寻源链路执行规则'),
      },
      {
        name: 'orderExecuteStatus',
        width: 100,
        renderer: ({ value, record }) =>
          colorRender(value, record.get('orderExecuteStatusMeaning')),
      },
      {
        name: 'sourceExecuteStatus',
        width: 100,
        renderer: ({ value, record }) =>
          colorRender(value, record.get('sourceExecuteStatusMeaning')),
      },
      {
        name: 'closeQuantity',
        width: 100,
      },
      {
        name: 'sourceCloseQuantity',
        width: 100,
      },
      {
        name: 'currentCloseQuantity',
        width: 100,
      },
      {
        name: 'currentSourceCloseQuantity',
        width: 100,
      },
      {
        name: 'downsStreamQuantity',
        width: 100,
      },
      {
        name: 'sourceDownsStreamQuantity',
        width: 100,
      },
      // {
      //   name: 'uomPrecision',
      //   type: 'number',
      // },
      { name: 'uomName', width: 100, renderer: ({ record }) => record.get('uomCodeAndName') },
      // { name: 'secondaryUomId', width: 100 },
      // { name: 'secondaryQuantity', width: 100 },
      {
        name: 'secondaryUomId',
        width: 100,
        renderer: ({ record }) => record.get('secondaryUomCodeAndName'),
      },
      { name: 'secondaryQuantity', width: 100 },
      { name: 'secondaryTaxInUnitPrice', width: 100 },
      // 税率,税种
      {
        name: 'currencyCode',
        width: 100,
      },
      {
        name: 'taxIncludedUnitPrice',
        width: 100,
        renderer: renderAmount,
      },
      {
        name: 'lastPurPrice',
        width: 100,
        renderer: ({ record }) => (
          <PriceModal
            {...{
              item: record.toData(),
            }}
          />
        ),
      },
      {
        name: 'unitPriceBatch',
        width: 100,
      },
      {
        name: 'taxIncludedLineAmount',
        width: 100,
        align: 'right',
        renderer: renderAmount,
      },
      {
        name: 'executionBillDetail',
        width: 100,
        renderer: ({ record }) => (
          <ExecutionBillDetail record={record} customizeTable={customizeTable} />
        ),
      },
      {
        name: 'localCurrencyNoTaxSum',
        width: 100,
        align: 'right',
        renderer: renderAmount,
      },
      {
        name: 'localCurrencyNoTaxUnit',
        width: 100,
        align: 'right',
        renderer: renderAmount,
      },
      {
        name: 'localCurrencyTaxSum',
        width: 100,
        align: 'right',
        renderer: renderAmount,
      },
      {
        name: 'localCurrencyTaxUnit',
        width: 100,
        align: 'right',
        renderer: renderAmount,
      },
      {
        name: 'prRequestedName',
        width: 100,
        renderer: ({ record }) =>
          record.get('prRequestedNum') && record.get('prRequestedName')
            ? `${record.get('prRequestedNum')} - ${record.get('prRequestedName')}`
            : record.get('prRequestedName'),
      },
      {
        name: 'supplierCompanyIdLov',
        width: 100,
        renderer: ({ record }) => record.get('supplierName') || record.get('supplierCompanyName'),
      },
      {
        name: 'supplierList',
        width: 100,
      },
      {
        name: 'purchaseAgentName',
        width: 100,
      },
      {
        name: 'executorName',
        width: 100,
      },
      {
        name: 'accountSubjectName',
        width: 100,
      },
      {
        name: 'costName',
        width: 100,
      },
      {
        name: 'expBearDep',
        width: 100,
      },
      {
        name: 'projectNum',
        width: 100,
      },
      {
        name: 'projectName',
        width: 100,
      },
      {
        name: 'projectCategoryMeaning',
        width: 100,
      },
      {
        name: 'wbsCode',
        width: 100,
      },
      {
        name: 'taxIncludedBudgetUnitPrice',
        width: 100,
        align: 'right',
        renderer: renderAmount,
      },
      {
        name: 'budgetIoFlag',
        width: 100,
        renderer: ({ value }) => yesOrNoRender(Number(value)),
      },
      {
        name: 'budgetAccountName',
        width: 100,
      },
      {
        name: 'pcNum',
        width: 100,
      },
      {
        name: 'receiveAddress',
        width: 100,
      },
      {
        name: 'receiveContactName',
        width: 100,
      },
      {
        name: 'receiveTelNum',
        width: 120,
        renderer: ({ value, record }) =>
          value ? `${record?.get('internationalTelCode') || ''} ${value}` : '',
      },
      {
        name: 'defaultOrderingAddressId',
        width: 120,
      },
      {
        name: 'defaultContactPerson',
        width: 120,
      },
      {
        name: 'defaultContactPhone',
        width: 120,
      },
      {
        name: 'lineFreight',
        width: 100,
        align: 'right',
        renderer: renderAmount,
      },
      {
        name: 'remark',
        width: 100,
      },
      {
        name: 'mallLineNum',
        width: 100,
      },
      {
        name: 'occupiedQuantity',
        width: 100,
      },
      {
        name: 'changeQuantity',
        width: 100,
      },
      {
        name: 'productSpecsJson',
        width: 100,
        renderer: ({ value }) => {
          return <ProductSpecsModal value={value} />;
        },
      },
      {
        name: 'priceList', // 比价单
        width: 100,
        // eslint-disable-next-line no-unused-vars
        renderer: ({ record }) => {
          return <PriceList record={record} />;
        },
      },
      {
        name: 'budgetOccupyFlag',
        width: 100,
      },
      {
        name: 'attachmentUuid',
        width: 100,
      },
      {
        name: 'changeAttachmentUuid',
        width: 100,
      },
      { name: 'projectTaskId', width: 100 },
    ];
    if (isFunction(cuxHandleColumns)) {
      allCols = cuxHandleColumns({ allCols, location, headerDs, workflowFormCode });
    }
    if (headerDs?.current?.get('rpSourceFlag') === 1) {
      allCols.push({ name: 'rpSourceNum', width: 100 });
    }
    const baseUomInfo =
      uomControl === 1 ? [] : ['secondaryUomId', 'secondaryTaxInUnitPrice', 'secondaryQuantity'];
    // 对所有来源都适用的过滤
    if (isOldUser) {
      allCols = allCols.filter(
        (item) =>
          ![
            'sourceExecuteStatus',
            'sourceOccupiedQuantity',
            'orderExecuteStatus',
            'restSourceQuantity',
            'orderOccupiedQuantity',
            'restPoQuantity',
            'secondLevelStrategyCode',
            ...baseUomInfo,
          ].includes(item.name)
      );
    }

    // E-COMMERCE
    if (prSourcePlatform === 'E-COMMERCE') {
      if (!isOldUser) {
        const newAllCols = allCols
          .concat([
            {
              name: 'skuType',
              width: 100,
            },
            {
              name: 'customUomName',
              width: 100,
            },
            {
              name: 'customQuantity',
              width: 100,
            },
            {
              name: 'packageQuantity',
              width: 100,
            },
            {
              name: 'customSpecsJson',
              renderer: ({ value }) => {
                return <CustomSpecsModal value={value} />;
              },
            },
          ])
          .filter(
            (ele) =>
              ![
                'receiveAddress',
                'defaultContactPhone',
                'defaultContactPerson',
                'defaultOrderingAddressId',
                'receiveContactName',
                'receiveTelNum',
                'customMadeFlag',
                'customAttributeList',
                'changeQuantity',
                'sourceOccupiedQuantity',
                'restSourceQuantity',
                'sourceExecuteStatus',
                'orderExcessRuleCode',
                'sourceExcessRuleCode',
                'contractExcessRuleCode',
                'sourceDisposableExcessFlag',
                ...baseUomInfo,
              ].includes(ele.name)
          );
        return isFunction(cuxHandleColumns)
          ? cuxHandleColumns({ allCols: newAllCols, location, headerDs, workflowFormCode })
          : newAllCols;
      } else {
        const newAllCols = allCols
          .concat([
            {
              name: 'skuType',
              width: 100,
            },
            {
              name: 'customUomName',
              width: 100,
            },
            {
              name: 'customQuantity',
              width: 100,
            },
            {
              name: 'packageQuantity',
              width: 100,
            },
            {
              name: 'customSpecsJson',
              renderer: ({ value }) => {
                return <CustomSpecsModal value={value} />;
              },
            },
          ])
          .filter(
            (ele) =>
              ![
                'receiveAddress',
                'receiveContactName',
                'receiveTelNum',
                'defaultContactPhone',
                'defaultContactPerson',
                'defaultOrderingAddressId',
                'customMadeFlag',
                'customAttributeList',
                'changeQuantity',
                'orderExcessRuleCode',
                'sourceExcessRuleCode',
                'contractExcessRuleCode',
                'sourceDisposableExcessFlag',
                ...baseUomInfo,
              ].includes(ele.name)
          );
        return isFunction(cuxHandleColumns)
          ? cuxHandleColumns({ allCols: newAllCols, location, headerDs, workflowFormCode })
          : newAllCols;
      }
    }

    if (source === 'inquery' && ['SRM', 'SHOP', 'ERP', 'CATALOGUE'].includes(prSourcePlatform)) {
      allCols.push({
        name: 'operable',
        renderer: ({ record }) => {
          return record.get('prLineCancelledFlag') === 1 || record.get('prLineClosedFlag') === 1 ? (
            <span>
              {record.get('prLineCancelledFlag') === 1 ? (
                <Tag className={classnames('c7n-tag-yellow')} style={{ border: 0 }}>
                  {intl.get(`${commonPrompt}.cancellable`).d('可取消')}
                </Tag>
              ) : null}
              {record.get('prLineClosedFlag') === 1 ? (
                <Tag className={classnames('c7n-tag-yellow')} style={{ border: 0 }}>
                  {intl.get(`${commonPrompt}.closable`).d('可关闭')}
                </Tag>
              ) : null}
            </span>
          ) : null;
        },
      });
    }

    // CATALOGUE
    if (prSourcePlatform === 'CATALOGUE') {
      if (!isOldUser) {
        const newAllCols = allCols
          .concat([
            {
              name: 'skuType',
              width: 100,
            },
            {
              name: 'customUomName',
              width: 100,
            },
            {
              name: 'customQuantity',
              width: 100,
            },
            {
              name: 'packageQuantity',
              width: 100,
            },
            {
              name: 'customSpecsJson',
              renderer: ({ value }) => {
                return <CustomSpecsModal value={value} />;
              },
            },
          ])
          .filter(
            (item) =>
              ![
                'customMadeFlag',
                'customAttributeList',
                'changeQuantity',
                'sourceOccupiedQuantity',
                'restSourceQuantity',
                'sourceExecuteStatus',
                'orderExcessRuleCode',
                'sourceExcessRuleCode',
                'contractExcessRuleCode',
                'sourceDisposableExcessFlag',
                ...baseUomInfo,
              ].includes(item.name)
          );
        return isFunction(cuxHandleColumns)
          ? cuxHandleColumns({ allCols: newAllCols, location, headerDs, workflowFormCode })
          : newAllCols;
      } else {
        const newAllCols = allCols
          .concat([
            {
              name: 'skuType',
              width: 100,
            },
            {
              name: 'customUomName',
              width: 100,
            },
            {
              name: 'customQuantity',
              width: 100,
            },
            {
              name: 'packageQuantity',
              width: 100,
            },
            {
              name: 'customSpecsJson',
              renderer: ({ value }) => {
                return <CustomSpecsModal value={value} />;
              },
            },
          ])
          .filter(
            (item) =>
              ![
                'customMadeFlag',
                'customAttributeList',
                'changeQuantity',
                'orderExcessRuleCode',
                'sourceExcessRuleCode',
                'contractExcessRuleCode',
                'sourceDisposableExcessFlag',
                ...baseUomInfo,
              ].includes(item.name)
          );
        return isFunction(cuxHandleColumns)
          ? cuxHandleColumns({ allCols: newAllCols, location, headerDs, workflowFormCode })
          : newAllCols;
      }
    }

    // SHOP
    if (prSourcePlatform === 'SHOP') {
      const newAllCols = allCols.filter(
        (ele) =>
          ![
            'productNum',
            'productName',
            'primaryUrl',
            'thirdSkuCode',
            'thirdSkuName',
            'productBrand',
            'productModel',
            'packingList',
            'catalogName',
            'productSpecsJson',
            'customMadeFlag',
            'customAttributeList',
            'changeQuantity',
            ...baseUomInfo,
          ].includes(ele.name)
      );
      return isFunction(cuxHandleColumns)
        ? cuxHandleColumns({ allCols: newAllCols, location, headerDs, workflowFormCode })
        : newAllCols;
    }

    // SRM OR ERP
    if (['SRM', 'ERP', undefined, null].includes(prSourcePlatform)) {
      const newAllCols = allCols.filter(
        (ele) =>
          ![
            'mallLineNum',
            'productNum',
            'productName',
            'primaryUrl',
            'thirdSkuCode',
            'thirdSkuName',
            'productBrand',
            'productModel',
            'packingList',
            'catalogName',
            'productSpecsJson',
            ...baseUomInfo,
          ].includes(ele.name)
      );
      return isFunction(cuxHandleColumns)
        ? cuxHandleColumns({ allCols: newAllCols, location, headerDs, workflowFormCode })
        : newAllCols;
    }
    return isFunction(cuxHandleColumns)
      ? cuxHandleColumns({ allCols, location, headerDs, workflowFormCode })
      : allCols;
  }, [prSourcePlatform, isOldUser, customizeTable, workflowFormCode]);

  const table = (
    <LineChangeTable
      code={code}
      buttonCode={buttonCode}
      columns={lineColumns}
      buttons={tableButton()}
      onRow={handleOnRow || defaultOnRow}
      selectionMode={
        pubPathFlag && headerDs?.current?.get('prStatusCode') !== 'WORKFLOW_APPROVAL'
          ? 'rowbox'
          : 'none'
      }
    />
  );

  const remoteRender = remote
    ? remote.render('SPRM_PURCHASE_PLAFORM_LINE_REMOTE_RENDER', <></>, {
        headerDs,
        listDs,
        location,
      })
    : null;

  const remoteRenderBottom = remote
    ? remote.render('SPRM_PURCHASE_PLAFORM_LINE_COMPONENT_REMOTE_RENDER_BOTTOM', <></>, {
        headerDs,
        listDs,
        prHeaderId,
        cuxLineRef,
        location,
      })
    : null;

  return (
    <>
      {remoteRender}
      {table}
      {remoteRenderBottom}
    </>
  );
};

export default PurchaseLineInfo;
