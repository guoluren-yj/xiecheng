import { Tooltip, DataSet, Modal, Button, Icon } from 'choerodon-ui/pro';
import React, { useState, useImperativeHandle, useMemo, useEffect } from 'react';
import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import classnames from 'classnames';
import { isArray, isFunction } from 'lodash';
// import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
// import UploadModal from 'srm-front-boot/lib/components/Upload';
import notification from 'utils/notification';
import { Tag } from 'choerodon-ui';
import { routerRedux } from 'dva/router';
import { getCurrentOrganizationId, getResponse, getCurrentUser } from 'utils/utils';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import ReferPrice from '@/routes/components/ReferPrice';
import ReferPriceProduct from '@/routes/components/ReferPriceProduct';
import {
  saveAssignmentConfigure,
  saveSuspendConfigure,
  enable,
  queryAssignList,
} from '@/services/purchaseExecutionService';
import OperationNewRecord from '@/routes/components/OperationHistory';
import ViewFilter from '@/routes/components/ViewFilter';
import MutlTextFieldSearch from '@/routes/components/MutlTextFieldSearch';
import ChangeOrderCodeRender from '@/routes/components/ChangeOrderCodeRender';
// import urgentImg from '@/assets/icon-expedited.svg';
import SuspendModal from './../components/SuspendModal';
import PromptModal from './../components/PromptModal';
import { promptModalDs, suspendModalDs } from './assignDs';

const commonPrompt = 'sprm.common.model.common';
const organizationId = getCurrentOrganizationId();
const {
  loginName,
  id: userId = undefined,
  realName: userName = undefined,
  email = undefined,
  phone = undefined,
} = getCurrentUser();
const Index = React.forwardRef(
  (
    {
      lineDs: approvedDs,
      type,
      customizeTable,
      customizeForm,
      clearSelectAll,
      changeTabNum,
      custLoading,
      setting,
      isOldUser,
      isShowNewBid,
      oldAssignLovSetting,
      uomControl,
      remote,
      showPro,
      dispatch,
      allAssignDs,
      productPlaceConfig,
    },
    ref
  ) => {
    const [tableDisplay, setDisplayStatus] = useState('flat');
    const {
      querySubAccount = undefined,
      queryDefaultValue = undefined,
      checkAssignLines = undefined,
      cuxpromptModalDsUpdate = undefined,
      cuxInitLovQueryParams = undefined,
      cuxDisplayNumStyle = {},
      handleRenderCuxOperation = undefined,
      cuxSupplierModalCols = undefined,
      updateSupplierCb = undefined,
    } = remote?.props?.process || {};

    // 函数组件调用到子组件的函数
    useImperativeHandle(ref, () => ({
      handleAssign,
      handleEnable,
      handleSuspend,
      ref: ref.current,
    }));

    useEffect(() => {
      approvedDs.setState('actions', {
        handleAssignItem: handleAssign,
        handleEnableItem: handleEnable,
        handleSuspendItem: handleSuspend,
        handleCurrentDs: allAssignDs,
      });
    }, [type, type, setting, isOldUser, isShowNewBid, oldAssignLovSetting, uomControl, showPro]);

    // 打开操作记录
    const handleActHistory = (record) => {
      return Modal.open({
        key: Modal.key(),
        drawer: true,
        style: { width: '742px' },
        bodyStyle: { paddingTop: '20px' },
        title: intl.get(`hzero.common.button.operating`).d('操作记录'),
        children: (
          <OperationNewRecord
            prHeaderId={record.get('prHeaderId')}
            handleRenderCuxOperation={handleRenderCuxOperation}
          />
        ),
        closable: true,
        movable: false,
        destroyOnClose: true,
        onOk: () => {},
        okText: intl.get('hzero.common.status.closed').d('关闭'),
        footer: (okBtn) => okBtn,
      });
    };

    const colorRender = (value, record) => {
      if (['SUSPEND'].includes(record.get('prLineStatusCode'))) {
        return (
          <Tag
            className={classnames('c7n-tag-has-color', 'c7n-tag-yellow')}
            style={{ border: 'none' }}
          >
            {value}
          </Tag>
        );
      } else if (['ASSIGNED', 'APPROVED'].includes(record.get('prLineStatusCode'))) {
        return (
          <Tag
            className={classnames('c7n-tag-has-color', 'c7n-tag-green')}
            style={{ border: 'none' }}
          >
            {value}
          </Tag>
        );
      } else {
        return (
          <Tag
            className={classnames('c7n-tag-has-color', 'c7n-tag-yellow')}
            style={{ border: 'none' }}
          >
            {' '}
            {value}
          </Tag>
        );
      }
    };

    const columns = useMemo(() => {
      const cols = [
        {
          name: 'docInfoGroup',
          header: intl.get(`sprm.common.model.common.docInfoGroup`).d('采购申请单号信息'),
          aggregation: true,
          align: 'left',
          children: [
            {
              name: 'displayPrNum',
              width: 160,
              renderer: ({ value, record }) => (
                <div
                  className="row-agent-column"
                  style={record.get('urgentFlag') === 1 ? cuxDisplayNumStyle || {} : {}}
                >
                  {`${value}-${record.get('displayLineNum')}`}
                  {record.get('urgentFlag') === 1 ? (
                    <Tooltip title={intl.get(`${commonPrompt}.urgent`).d('申请加急')}>
                      <Icon
                        type="priority"
                        style={{ color: 'red', fontSize: '14px', paddingBottom: '5px' }}
                      />
                    </Tooltip>
                  ) : null}
                </div>
              ),
            },
            {
              name: 'prNumLink',
              width: 180,
              title: intl.get(`${commonPrompt}.prNum`).d('采购申请编号'),
              renderer: ({ record }) => {
                const menuLeafNodes =
                  window?.dvaApp?._store?.getState()?.global?.menuLeafNode || [];
                const disabledBtnFlag = menuLeafNodes.findIndex(
                  (node) => node.functionMenuCode === 'hzero.srm.requirement.prm.pr-platform'
                );
                return (
                  <Button
                    onClick={() => {
                      console.log(dispatch);
                      dispatch(
                        routerRedux.push({
                          pathname: `/sprm/purchase-platform/noerp-detail/${record.get(
                            'prHeaderId'
                          )}`,
                        })
                      );
                    }}
                    funcType="link"
                    color="primary"
                    disabled={disabledBtnFlag === -1}
                  >
                    {`${record.get('displayPrNum')}`}
                  </Button>
                );
              },
            },
            {
              name: 'prTypeName',
              width: 120,
            },
            {
              name: 'prSourcePlatform',
            },
            {
              width: 120,
              name: 'prSourcePlatform',
            },
            {
              name: 'title',
              width: 150,
            },
          ],
        },
        {
          name: 'purInfoGroup',
          header: intl.get(`sprm.common.model.common.purInfoGroup`).d('采买组织信息'),
          aggregation: true,
          align: 'left',
          children: [
            {
              name: 'companyName',
              width: 200,
            },
            {
              width: 200,
              name: 'ouName',
            },
            {
              name: 'purchaseOrgName',
              width: 200,
            },
            {
              name: 'invOrganizationName',
              width: 200,
            },
          ],
        },
        {
          name: 'createInfoGroup',
          header: intl.get(`sprm.common.model.common.createInfoGroup`).d('创建信息'),
          aggregation: true,
          align: 'left',
          children: [
            {
              width: 120,
              name: 'creatorName',
            },
            {
              name: 'prRequestedName',
              width: 120,
              renderer: ({ value, record }) =>
                record.get('prRequestedNum') ? `${record.get('prRequestedNum')}-${value}` : value,
            },
            {
              width: 120,
              name: 'unitName',
            },
            {
              width: 150,
              name: 'creationDate',
            },
            {
              name: 'requestDate',
              width: 150,
            },
          ],
        },
        {
          name: 'lineInfoGroup',
          header: intl.get(`sprm.common.model.common.lineInfoGroup`).d('行信息'),
          aggregation: true,
          align: 'left',
          width: 180,
          children: [
            {
              width: 100,
              name: 'displayLineNum',
            },
            {
              name: 'quantity',
              // renderer: ({ value, record }) => {
              //   return isNumber(record.get('uomPrecision'))
              //     ? value.toFixed(record.get('uomPrecision'))
              //     : value;
              // },
              width: 120,
            },

            {
              name: 'uomCodeAndName',
              width: 120,
            },
            {
              name: 'neededDate',
              width: 150,
            },
          ],
        },
        {
          name: 'productInfoGroup',
          header: intl.get(`sprm.common.model.common.productInfoGroup`).d('物料/商品信息'),
          aggregation: true,
          align: 'left',
          width: 180,
          children: [
            { width: 140, name: 'itemCode' },
            { width: 120, name: 'itemName' },
            {
              name: 'categoryName',
              width: 120,
            },
            // {
            //   name: 'productNum',
            //   width: 100,
            // },
            // {
            //   name: 'productName',
            //   width: 100,
            // },
            // {
            //   name: 'catalogName',
            //   width: 100,
            // },
            { name: 'productBrand', width: 100 },
            { name: 'productModel', width: 100 },
            { name: 'packingList', width: 100 },
            { name: 'itemModel', width: 120 },
            { name: 'itemSpecs', width: 120 },
          ],
        },
        {
          name: 'amountInfoGroup',
          header: intl.get(`sprm.common.model.common.amountInfoGroup`).d('单价/金额信息'),
          aggregation: true,
          width: 180,
          align: 'left',
          children: [
            {
              width: 120,
              name: 'currencyCode',
            },
            {
              name: 'taxIncludedUnitPrice',
              width: 150,
              renderer: ({ text, record }) => {
                return record.get('linePriceHiddenFlag') === 1
                  ? record.get('taxIncludedUnitPriceMeaning')
                  : text;
              },
            },
            {
              name: 'taxIncludedLineAmount',
              renderer: ({ text, record }) => {
                return record.get('linePriceHiddenFlag') === 1
                  ? record.get('taxIncludedLineAmountMeaning')
                  : text;
              },
              width: 100,
            },
            {
              name: 'referencePriceDisplayFlag',
              width: 120,
              renderer: ({ value, record }) => {
                if (
                  value === 1 &&
                  productPlaceConfig &&
                  ['ERP', 'SRM'].includes(record?.get('prSourcePlatform'))
                ) {
                  return (
                    <ReferPriceProduct
                      currentRecord={record}
                      customizeTable={customizeTable}
                      cusCode="SPRM.PURCHASE_EXECUTION.C7NLADDERPRICEMODAL"
                    />
                  );
                } else if (value === 1) {
                  return (
                    <ReferPrice
                      currentRecord={record}
                      customizeTable={customizeTable}
                      cusCode="SPRM.PURCHASE_EXECUTION.C7NLADDERPRICEMODAL"
                    />
                  );
                } else {
                  return null;
                }
              },
            },
          ],
        },
        {
          name: 'assignInfoGroup',
          header: intl.get(`sprm.common.model.common.assignInfoGroup`).d('分配信息'),
          aggregation: true,
          align: 'left',
          width: 180,
          children: [
            {
              name: 'purchaseAgentName',
              width: 120,
            },
            {
              width: 200,
              name: 'executorName',
            },
            {
              width: 150,
              name: 'assignedDate',
            },
          ],
        },
        {
          name: 'executionInfoGroup',
          header: intl.get(`sprm.common.model.common.executionInfoGroup`).d('执行信息'),
          aggregation: true,
          align: 'left',
          width: 180,
          children: [
            {
              width: 150,
              name: 'executionStrategyCode',
            },
            {
              name: 'executionStatusMeaning',
              width: 120,
            },
            {
              width: 120,
              name: 'executionHeaderBillNum',
            },
            {
              name: 'autoAssignedFlag',
              width: 80,
              renderer: ({ value }) => {
                if (value || value === 0) {
                  return (
                    <Tag
                      className={value === 1 ? 'c7n-tag-green' : 'c7n-tag-red'}
                      style={{ border: 0 }}
                    >
                      {value === 1
                        ? intl.get(`sprm.common.model.successStatus`).d('成功')
                        : intl.get(`sprm.common.model.errorStatus`).d('失败')}
                    </Tag>
                  );
                } else {
                  return null;
                }
              },
            },
            {
              width: 120,
              name: 'changeOrderCode',
              renderer: ({ value, record }) => ChangeOrderCodeRender({ record, value }),
            },
            {
              name: 'erpEditStatus',
              width: 120,
            },
          ],
        },
        {
          name: 'otherInfoGroup',
          header: intl.get(`sprm.common.model.common.otherInfoGroup`).d('其他信息'),
          aggregation: true,
          align: 'left',
          children: [
            {
              name: 'prLineStatusCodeMeaning',
              width: 100,
              renderer: ({ value, record }) => colorRender(value, record),
            },
            // {
            //   name: 'accountAssignTypeCode',
            //   width: 120,
            // },
            // {
            //   name: 'itemAbcClass',
            //   width: 180,
            // },
            {
              width: 80,
              name: 'unitPriceBatch',
              // renderer: ({ value }) => thousandBitSeparator(value),
            },
            // {
            //   width: 120,
            //   name: 'executionStrategyMeaning',
            // },
            {
              width: 120,
              name: 'taxIncludedBudgetUnitPrice',
              renderer: ({ value, record }) =>
                record.get('linePriceHiddenFlag')
                  ? record.get('taxIncludedBudgetUnitPriceMeaning')
                  : value,
            },
            {
              name: 'budgetIoFlag',
              width: 120,
              renderer: ({ value }) => yesOrNoRender(Number(value)),
              // renderer: this.isEnabledRender,
            },
            // {
            //   name: 'inventoryName',
            //   width: 120,
            // },
            {
              width: 120,
              name: 'remark',
            },
            {
              width: 120,
              name: 'attachmentUuid',
              // renderer: ({ record }) => {
              //   const {
              //     data: { attachmentUuid = null },
              //   } = record;
              //   const uploadProps = {
              //     bucketName: 'private-bucket',
              //     bucketDirectory: 'sprm-pr',
              //     btnText: intl.get('entity.attachment.viewAttachment').d('查看附件'),
              //     attachmentUUID: attachmentUuid,
              //     viewOnly: true,
              //     showFilesNumber: true,
              //     icon: false,
              //   };
              //   return <UploadModal {...uploadProps} />;
              // },
            },
            { name: 'projectNum', width: 120 },
            { name: 'projectName', width: 120 },
            {
              width: 120,
              name: 'projectCategory',
              renderer: ({ record }) => record.get('projectCategoryMeaning'),
            },
            {
              width: 120,
              name: 'wbsCode',
              type: 'string',
              renderer: ({ record }) => record.get('wbs'),
            },
            { name: 'supplierItemCode', width: 120 },
            { name: 'supplierItemName', width: 120 },
            {
              width: 100,
              name: 'operatorRecord',
              renderer: ({ record }) => (
                <a onClick={() => handleActHistory(record)}>
                  {intl.get(`hzero.common.button.operating`).d('操作记录')}
                </a>
              ),
            },
          ],
        },
        type === 'all' && {
          name: 'secondLevelStrategyCode',
          title: intl.get(`${commonPrompt}.secondLevelStrategyCode`).d('寻源链路执行规则'),
        },
        type === 'all' && {
          name: 'orderSecondLevelStrategyCode',
          title: intl.get(`${commonPrompt}.orderSecondLevelStrategyCode`).d('履约链路执行规则'),
        },
        { name: 'secondaryQuantity', width: 100 },
        { name: 'secondaryTaxInUnitPrice', width: 100 },
        {
          name: 'secondaryUomName',
          width: 100,
          renderer: ({ value, record }) => record.get('secondaryUomCodeAndName') || value,
        },
        {
          width: 120,
          name: 'projectTaskId',
        },
      ];

      const baseUomInfo =
        uomControl?.SPRM === 1
          ? []
          : ['secondaryUomName', 'secondaryTaxInUnitPrice', 'secondaryQuantity'];
      // 待分配界面 +退回原因,是否退回字段,-行状态字段
      if (type === 'approved') {
        const newCols = cols
          .concat([
            {
              width: 80,
              name: 'backToUnassignFlag',
              renderer: ({ value }) => yesOrNoRender(Number(value)),
            },
            {
              width: 180,
              name: 'backToUnassignReason',
            },
          ])
          .filter((ele) => ![...baseUomInfo].includes(ele.name));
        return remote
          ? remote.process('SPRM.PURCHASE_EXECUTION_ASSIGN_CUX_COLUMNS', newCols, {
              type,
              updateSupplierCb,
              cuxSupplierModalCols,
              productPlaceConfig,
              remote,
            })
          : newCols;
      }
      if (type !== 'all') {
        const newCols = cols.filter((ele) => ![...baseUomInfo].includes(ele.name));
        return remote
          ? remote.process('SPRM.PURCHASE_EXECUTION_ASSIGN_CUX_COLUMNS', newCols, {
              type,
              updateSupplierCb,
              cuxSupplierModalCols,
              productPlaceConfig,
              remote,
            })
          : newCols;
      }
      if (isOldUser) {
        return cols.filter(
          (ele) => !['secondLevelStrategyCode', ...baseUomInfo].includes(ele.name)
        );
      }

      return cols;
    }, [type]);

    const updateAssignInfo = () => {
      clearSelectAll(approvedDs);
      approvedDs.query();
      const cuxParams = remote
        ? remote.process('SPRM_PURCHASE_EXECUTION_ASSIGN_CUX_PARAMS', {
            erpControlFlag: 1,
            prCustomizeFilterFlag: 1,
          })
        : {};
      Promise.all([
        queryAssignList({
          prLineStatusCode: 'APPROVED',
          waitAssignRequestFlag: 1,
          ...cuxParams,
        }),
        queryAssignList({
          prLineStatusCode: 'ASSIGNED',
          ...cuxParams,
        }),
        queryAssignList({
          prLineStatusCode: 'SUSPEND',
          ...cuxParams,
        }),
      ]).then((totalCountRes) => {
        if (totalCountRes) {
          const [res1, res2, res3] = totalCountRes;
          changeTabNum({
            approvedCount: res1?.totalElements,
            assignedCount: res2?.totalElements,
            suspendCount: res3?.totalElements,
          });
        }
      });
    };

    /**
     *分配
     *
     * @memberof Assignment
     */
    const handleAssign = async () => {
      const selectedRows = approvedDs?.selected?.map((ele) => ele.toData());
      // 二开埋点校验勾选行是否必输

      if (isFunction(checkAssignLines)) {
        const flag = await checkAssignLines(approvedDs?.selected);
        if (!flag) return;
      }

      const purchaseAgentFlag = selectedRows.every(
        (ele) => ele.purchaseAgentId === selectedRows[0]?.purchaseAgentId
      );
      // 是否转单标识 transferFlag
      const allTranferList = selectedRows?.filter((ele) => ele.transferFlag === 1);
      const filterMapStrategyCode = Array.from(
        new Set(selectedRows?.map((item) => item.executionStrategyCode))
      );

      const executionStrategyCode =
        filterMapStrategyCode?.length === 1 ? filterMapStrategyCode[0] : undefined;

      const secondLevelStrategyCodeList = Array.from(
        new Set(selectedRows?.map((ele) => ele.secondLevelStrategyCode))
      );
      const secondLevelStrategyCode =
        ['ORDER', 'PROJECT_INFO'].includes(executionStrategyCode) && setting !== '1'
          ? 'NO_ACCESS'
          : secondLevelStrategyCodeList?.length > 1
          ? 'ALL'
          : secondLevelStrategyCodeList[0];
      const orderSecondLevelStrategyCodeList = Array.from(
        new Set(selectedRows?.map((ele) => ele.orderSecondLevelStrategyCode))
      );
      const orderSecondLevelStrategyCode = ['SOURCE', 'PROJECT_INFO'].includes(
        executionStrategyCode
      )
        ? 'NO_ACCESS'
        : orderSecondLevelStrategyCodeList?.length > 1
        ? 'ALL'
        : orderSecondLevelStrategyCodeList[0];
      const purchaseOrgIds = selectedRows?.some((ele) => !ele.purchaseOrgId)
        ? null
        : [...new Set(selectedRows?.map((ele) => ele.purchaseOrgId))].join(',');
      const config = {
        allTransferFlag: allTranferList.length > 0,
        orderTransferFlag: allTranferList?.some((ele) => ele.orderOccupiedQuantity),
        sourceTransferFlag: allTranferList?.some(
          (ele) => ele.sourceOccupiedQuantity || ele.pcFrameworkOccupyFlag
        ),
        purchaseOrgIds,
        setting,
        oldAssignLovSetting,
        executionStrategyCode,
        secondLevelStrategyCode,
        orderSecondLevelStrategyCode,
      };
      const promptDs = new DataSet(promptModalDs(config, cuxpromptModalDsUpdate));
      // 二开埋点：访问接口赋值弹窗信息
      if (isFunction(querySubAccount)) {
        Object.assign(promptDs, { status: 'loading' });
        querySubAccount({ purchaseOrgIds: config.purchaseOrgIds })
          .then((res) => {
            if (!getResponse(res)) return;
            const { length: len = 0 } = res?.content ?? [];
            if (len === 0 || len > 1) return;
            promptDs.current.init({
              executionStrategyCode,
              secondLevelStrategyCode,
              orderSecondLevelStrategyCode,
              currentPurchaseAgent: purchaseAgentFlag
                ? {
                    purchaseAgentId: res.content[0]?.purchaseAgentId,
                    purchaseAgentName: res.content[0]?.purchaseAgentName,
                  }
                : {},
              executedBys: [{ userName, userId, loginName, email, phone }],
            });
          })
          .finally(() => {
            Object.assign(promptDs, { status: 'ready' });
            promptDs.current.set('executedBys', [{ userName, userId, loginName, email, phone }]);
          });
      } else if (isFunction(queryDefaultValue)) {
        Object.assign(promptDs, { status: 'loading' });
        const data = getResponse(
          await queryDefaultValue({
            selectedRows,
            approvedDs,
            type,
            purchaseAgentFlag,
            executionStrategyCode,
            secondLevelStrategyCode,
            orderSecondLevelStrategyCode,
          })
        );
        if (data) {
          promptDs.current.init({
            executionStrategyCode,
            secondLevelStrategyCode,
            orderSecondLevelStrategyCode,
            // 采购员，需求执行人默认值设置
            ...data,
          });
        } else {
          return;
        }
      } else {
        promptDs.current.init({
          executionStrategyCode,
          secondLevelStrategyCode,
          orderSecondLevelStrategyCode,
          currentPurchaseAgent: purchaseAgentFlag
            ? {
                purchaseAgentId: selectedRows[0]?.purchaseAgentId,
                purchaseAgentName: selectedRows[0]?.purchaseAgentName,
              }
            : {},
        });
      }
      if (
        allTranferList?.length &&
        allTranferList.length !== selectedRows.length &&
        setting === '1'
      ) {
        const errorLine = allTranferList
          .map((ele) => `${ele.displayPrNum}-${ele.displayLineNum}`)
          .join(',');
        notification.warning({
          message: intl
            .get(`sprm.common.model.common.reMaintainEcecutionSelect`, { errorLine })
            .d(
              `采购申请行【${errorLine}】已被执行，其余申请行未被执行，无法同时执行此操作，请重新勾选。！`
            ),
        });
      } else {
        Modal.open({
          key: Modal.key(),
          title: intl.get(`sprm.purchaseRequisitionAssign.view.title.applyAssign`).d('需求分配'),
          children: (
            <PromptModal
              ds={promptDs}
              listDs={approvedDs}
              showPro={showPro}
              isOldUser={isOldUser}
              isShowNewBid={isShowNewBid}
              setting={setting}
              oldAssignLovSetting={oldAssignLovSetting}
              customizeForm={customizeForm}
              executionStrategyCode={executionStrategyCode}
            />
          ),
          drawer: true,
          closable: true,
          maskClosable: true,
          onOk: () => assignItem(promptDs),
          style: { width: '380px' },
          onCancel: () => {},
        });
      }
    };

    const assignItem = async (promptDs) => {
      const validateFlag = await promptDs.validate();
      const selectedRows = approvedDs.selected;
      if (validateFlag) {
        const data = promptDs.toData()[0] ? promptDs.toData()[0] : {};
        const {
          executedBys = [],
          purchaseAgentId,
          currentPurchaseAgent,
          executionStrategyCode,
          secondLevelStrategyCode,
          orderSecondLevelStrategyCode,
          assignedRemark,
          ...attributeObj
        } = data;
        const prLineVOS = selectedRows?.map((item) => {
          return {
            ...item.toData(),
            ...attributeObj,
            supplierList: item.get('supplierList') ? item.get('supplierList').toJS() : undefined,
            executionStrategyCode,
            // executionStrategyMeaning: data.executionStrategyMeaning,
          };
        });
        // eslint-disable-next-line no-console
        console.log(/xsxs/, data);
        saveAssignmentConfigure({
          prLineVOS,
          values: {
            currentPurchaseAgent,
            executionStrategyCode,
            assignedRemark,
            ...data,
            secondLevelStrategyCode: ['ORDER', 'PROJECT_INFO'].includes(executionStrategyCode)
              ? 'NO_ACCESS'
              : secondLevelStrategyCode,
            orderSecondLevelStrategyCode: ['SOURCE', 'PROJECT_INFO'].includes(executionStrategyCode)
              ? 'NO_ACCESS'
              : orderSecondLevelStrategyCode,
            customizeUnitCode: 'SPRM.PURCHASE_EXECUTION.NOTASSIGN.MODAL',
            executedBys: (isArray(executedBys) ? executedBys : [])?.map((ele) => ele.userId),
            executedByName: (isArray(executedBys) ? executedBys : [])?.map((ele) => ele.userName),
          },
        }).then((result) => {
          if (result && result.failed) {
            notification.error({ message: result.message });
          } else {
            notification.success();
            updateAssignInfo();
          }
        });
      } else {
        return false;
      }
    };

    const handleSuspend = async () => {
      const { checkLineSuspend } = remote?.props?.process || {};
      const cuxSuspendFlag = isFunction(checkLineSuspend)
        ? await checkLineSuspend({ approvedDs })
        : true;
      debugger;
      if (cuxSuspendFlag) {
        const suspendLineDs = new DataSet(suspendModalDs({ type: 'suspend' }));
        Modal.open({
          key: Modal.key(),
          title: intl.get(`sprm.purchaseRequisitionAssign.view.button.suspend`).d('暂挂'),
          children: <SuspendModal ds={suspendLineDs} customizeForm={customizeForm} />,
          drawer: true,
          closable: true,
          maskClosable: true,
          onOk: async () => {
            const flag = await suspendLineDs.validate();
            if (flag) {
              const values = suspendLineDs.toData()[0] ? suspendLineDs.toData()[0] : {};
              const prLineVOS = approvedDs.selected?.map((item) => {
                return {
                  ...item.toData(),
                  supplierList: item.get('supplierList')
                    ? item.get('supplierList').toJS()
                    : undefined,
                  ...values,
                  // executionStrategyMeaning: data.executionStrategyMeaning,
                };
              });
              return saveSuspendConfigure({
                prLineVOS,
                values,
              }).then((res) => {
                if (res && res.failed) {
                  notification.error({ message: res.message });
                } else {
                  notification.success();
                  updateAssignInfo();
                }
              });
            } else {
              return false;
            }
          },
          style: { width: '380px' },
          onCancel: () => {},
        });
      }
    };

    const handleEnable = () => {
      const selectedRows = approvedDs.selected?.map((item) => {
        return {
          ...item.toData(),
          supplierList: item.get('supplierList') ? item.get('supplierList').toJS() : undefined,
          // executionStrategyMeaning: data.executionStrategyMeaning,
        };
      });
      enable(selectedRows).then((res) => {
        if (res && res.failed) {
          notification.error({ message: res.message });
        } else {
          notification.success();
          updateAssignInfo();
        }
      });
    };

    const handleQuery = ({ params = {} }) => {
      const clearParams = {}; // 清理
      const { _back } = location?.state || {};
      const { customizeOrderField = undefined } = params;
      const dataObj = approvedDs.queryDataSet?.current?.toData() || {};
      if (dataObj) {
        for (const key in dataObj) {
          if (
            ![
              'multiSelectHeaderNums',
              'multiSelectHeaderAndLineNums',
              'supplierCompanyId',
              'supplierId',
            ].includes(key)
          ) {
            // 排除掉自定义的查询条件
            if (!Object.prototype.hasOwnProperty.call(params, key)) {
              clearParams[key] = undefined;
            }
          }
        }
      }

      approvedDs.setQueryParameter('customizeOrderField', customizeOrderField);
      // eslint-disable-next-line no-unused-expressions
      approvedDs.queryDataSet.current
        ? approvedDs.queryDataSet.current.set({
            ...params,
            ...clearParams,
          })
        : approvedDs.queryDataSet.loadData([
            {
              ...params,
              ...clearParams,
            },
          ]);
      if (_back === -1) {
        approvedDs.query(approvedDs.currentPage);
      } else {
        approvedDs.query();
      }
    };

    const onChangeField = ({ name, value, record }) => {
      if (name === 'tempKey') {
        // eslint-disable-next-line no-unused-expressions
        if (record.getField(name)?.get('lovCode') === 'SSLM.SUPPLIER_CHOOSE') {
          // eslint-disable-next-line no-unused-expressions
          approvedDs.queryDataSet?.current?.set({
            supplierCompanyId: value?.supplierCompanyIds,
            supplierId: value?.extSupplierIds,
          });
        } else {
          // eslint-disable-next-line no-unused-expressions
          approvedDs.queryDataSet?.current?.set({
            supplierCompanyId: value?.supplierCompanyId,
            supplierId: value?.supplierId,
          });
        }
      } else if (!value) {
        // eslint-disable-next-line no-unused-expressions
        approvedDs.queryDataSet?.current?.set({ [name]: undefined });
      }
    };

    const resetQueryDs = () => {
      // eslint-disable-next-line no-unused-expressions
      approvedDs.queryDataSet?.current?.reset();
    };

    useEffect(() => {
      window.purchaseExecutionUpdateAssignInfo = updateAssignInfo;
      return () => {
        window.purchaseExecutionUpdateAssignInfo = undefined;
      };
    }, []);

    const cuxLovParams = isFunction(cuxInitLovQueryParams) ? cuxInitLovQueryParams({ type }) : {};
    const { initAssignPageSize = ['10', '20', '50', '100', '200'] } = remote?.props?.process || {};
    return (
      <div style={{ height: 'calc(100vh - 254px)' }}>
        {customizeTable(
          {
            code: 'SPRM.PURCHASE_EXECUTION.NOTASSIGN.LIST', // 必传，和unitCode一一对应
            dataSet: approvedDs,
            custLoading,
          },
          <SearchBarTable
            style={{ maxHeight: 'calc(100% - 22px)' }}
            aggregation={tableDisplay !== 'flat'}
            searchCode="SPRM.PURCHASE_EXECUTION.NOTASSIGN.FILTER"
            dataSet={approvedDs}
            columns={columns}
            cacheKey={type}
            ref={ref}
            cacheState
            virtual
            virtualSpin
            virtualCell
            pagination={{
              pageSizeOptions: initAssignPageSize || ['10', '20', '50', '100', '200'],
            }}
            searchBarConfig={{
              right: {
                render: () => (
                  <ViewFilter tableDisplay={tableDisplay} setDisplayStatus={setDisplayStatus} />
                ),
              },
              left: {
                render: () => (
                  <MutlTextFieldSearch
                    name="multiSelectHeaderAndLineNums"
                    dataSet={approvedDs}
                    placeholder={intl
                      .get('sprm.common.modal.enterPrNumOrLineNum')
                      .d('请输入采购申请单号-行号')}
                  />
                ),
              },
              editorProps: {
                executionStrategyCode: {
                  optionsFilter: (options) =>
                    isOldUser
                      ? options.data.value !== 'BEFORE_SOURCE_AFTER_ORDER' &&
                        options.data.value !== 'SOURCE_AND_ORDER'
                      : true,
                },
                secondLevelStrategyCode: {
                  optionsFilter: (options) => {
                    return isShowNewBid ? true : options.data.value !== 'SOURCE_BID_NEW';
                  },
                },
                prLineStatusCode: {
                  optionsFilter: (options) => {
                    if (type === 'approved') {
                      return options.data.value === 'APPROVED';
                    }
                    if (type === 'suspend') {
                      return options.data.value === 'SUSPEND';
                    }
                    if (type === 'assigned') {
                      return options.data.value === 'ASSIGNED';
                    }
                    return options.data.value !== 'CLOSED';
                  },
                },
              },
              fieldProps: {
                ...cuxLovParams,
                tempKey: { lovPara: { tenantId: organizationId } },
                executorBys: { lovPara: { tenantId: organizationId } },
              },
              onQuery: handleQuery,
              onClear: resetQueryDs,
              onReset: resetQueryDs,
              onFieldChange: onChangeField,
            }}
            onAggregationChange={(_aggregation) => setDisplayStatus(_aggregation)}
          />
        )}
      </div>
    );
  }
);

export default Index;
