/**
 * @Description: 供应商评估计划工作台-详情页 - 评估计划行
 * @Author: 杨一昊 yihao.yang@going-link.com
 * @Date: 2022-12-07 11:08:20
 * @Copyright (c) 2022 by ZhenYun, All Rights Reserved.
 */
import React, { Fragment, useMemo, useEffect, useCallback, useState } from 'react';
import { isEmpty, isObject } from 'lodash';
import SearchBarTable from '_components/SearchBarTable';
import { Button, DataSet, Modal, Lov } from 'choerodon-ui/pro';
import { SRM_SSLM } from '_utils/config';
import CommonImport from 'components/Import';
import { observer } from 'mobx-react-lite';
import { getResponse, filterNullValueObject } from 'utils/utils';
import intl from 'utils/intl';
import notification from 'utils/notification';
import SupplierLov from '_components/SupplierLov';
import { renderStatus } from '@/routes/components/utils';
import { handleGetSteps, cancelPlanLines } from '@/services/purchaserEvaluationWorkbenchServices';
import BatchAllocation from './BatchAllocation';
import { getPlanLinesDs } from '../stores/detailsDs';
import { ProgressStep } from '../utils';
import { readOnlyRenderer, handleExtTextRenderIntercept } from './utils';

const PlanLines = observer(
  ({
    isPub,
    remote,
    basicInfoDs,
    isEdit,
    dataSet,
    custLoading,
    handleSearch,
    handleSave,
    customizeTable,
    evalPlanHeaderId,
    onSearchBarRef,
  }) => {
    const [progressList, setProgressList] = useState([]); // 评估进度-进度条
    const {
      groupFlag,
      planTypeCode,
      preciseFlag,
      companyId: curCompanyId,
      supplierSelfAssessmentFlag,
    } =
      basicInfoDs?.current?.get([
        'groupFlag',
        'planTypeCode',
        'preciseFlag',
        'companyId',
        'supplierSelfAssessmentFlag',
      ]) || {};
    const isGroup = +groupFlag;
    const companyId = isObject(curCompanyId) ? curCompanyId.companyId : curCompanyId;

    const supplierModalDs = new DataSet({
      autoCreate: true,
      fields: [
        {
          name: 'selectedField',
          type: 'object',
          lovCode: 'SSLM.SUPPLIER', // 固定值, 不可更改
          multiple: true,
        },
      ],
    });

    // 添加供应商
    const handleAddSupplier = () => {
      // 新弹窗
      const currentData = supplierModalDs.current.toData();
      const { selectedField } = currentData;
      (selectedField || []).forEach(item => {
        const {
          supplierCompanyNum,
          supplierCompanyName,
          supplierCompanyId,
          supplierId,
          supplierNum,
          supplierName,
          mail,
          mobilephone,
          name,
          internationalTelCode,
          addressDetail,
          supplierTenantId,
        } = item;
        const otherInfo = remote
          ? remote.process('SSLM_VENDOR_EVALUATION_PLAN_WORKBENCH_ADD_SUPPLIER', {}, item)
          : {};
        dataSet.create(
          {
            supplierCompanyName: supplierCompanyName || supplierName,
            supplierCompanyNum,
            supplierCompanyId,
            supplierId,
            supplierNum,
            supplierName,
            email: mail,
            internationalTelCode,
            telephone: mobilephone,
            supplierContacts: name,
            supplierAddress: addressDetail,
            supplierTenantId,
            ...otherInfo,
          },
          0
        );
      });

      supplierModalDs.current.set('selectedField', undefined);
    };

    const modalProps = {
      dataSet: supplierModalDs,
      name: 'selectedField',
      mode: 'button',
      clearButton: false,
      color: 'primary',
      modalProps: {
        onOk: handleAddSupplier,
      },
      queryData: {
        srmFlag: !supplierSelfAssessmentFlag ? undefined : supplierSelfAssessmentFlag,
        companyId,
      },
    };

    // 复制
    const handleCopy = () => {
      if (dataSet.selected) {
        dataSet.selected.forEach(record => {
          const {
            evalPlanLineId,
            lineNumber,
            evalStatus,
            evalStatusMeaning,
            lineTypeCode,
            lineTypeCodeMeaning,
            executeStatus,
            executeStatusMeaning,
            _status,
            ...others
          } = record?.toData() || {};
          dataSet.create({ ...others, _status: 'create' }, 0);
          dataSet.unSelectAll();
          dataSet.clearCachedSelected();
        });
      }
    };

    // 批量添加其它信息
    const handleBatchAdd = (batchDs, isAll = false) => {
      // 批量新增
      const selectLines = dataSet?.selected;
      const catchSelectLines = [];
      // eslint-disable-next-line no-unused-expressions
      dataSet?.selected.forEach(({ data }) => {
        catchSelectLines.push({ ...data });
      });
      const batchData = batchDs?.map(({ data }) => (isAll ? data : filterNullValueObject(data)));
      let flag = true;
      batchData.forEach(({ internationalTelCode, ...item }) => {
        if (flag) {
          // flag 为true 第一次，做set更新操作
          selectLines.forEach(record => {
            record.set({ ...item });
          });
          flag = false;
        } else {
          //  flag 为false,后续做新增操作
          catchSelectLines.forEach(
            ({ evalPlanLineId, lineNumber, evalStatus, evalStatusMeaning, _status, ...others }) => {
              dataSet.create({ ...others, ...item, _status: 'create' }, 0);
            }
          );
        }
      });
      dataSet.unSelectAll();
      dataSet.clearCachedSelected();
      return handleSave();
    };

    // 打开批量分配其它信息弹窗
    const handleOpenBatchAllocation = () => {
      // 点击批量分配供应商 初始化 Ds
      const batchDs = new DataSet(getPlanLinesDs(+preciseFlag, true, companyId));
      Modal.open({
        title: intl
          .get('sslm.vendorEvaluationPlanDetail.button.header.batchAllocation')
          .d('批量分配其它信息'),
        drawer: true,
        style: { width: 1090 },
        cancelText: intl.get('hzero.common.button.cancel').d('取消'),
        children: (
          <BatchAllocation dataSet={batchDs} isGroup={isGroup} customizeTable={customizeTable} />
        ),
        footer: (okBtn, cancelBtn, modal) => (
          <div>
            <Button
              color="primary"
              onClick={() => {
                handleBatchAdd(batchDs);
                modal.close();
              }}
              help={intl
                .get('sslm.vendorEvaluationPlanDetail.button.tooltip.batchLocationOkBtn')
                .d('仅批量更新和分配您填写的内容到计划明细行')}
            >
              {intl.get('hzero.common.button.ok').d('确定')}
            </Button>
            <Button
              onClick={() => {
                handleBatchAdd(batchDs, true);
                modal.close();
              }}
              help={intl
                .get('sslm.vendorEvaluationPlanDetail.button.tooltip.batchAllLocationOkBtn')
                .d('本页面填写/未填写的内容会全量更新和分配到计划明细行')}
            >
              {intl.get('sslm.vendorEvaluationPlanDetail.button.title.updateAll').d('全量更新')}
            </Button>
            {cancelBtn}
          </div>
        ),
      });
    };

    // 取消
    const handleCancel = () => {
      Modal.confirm({
        title: intl.get('hzero.common.message.confirm.title').d('提示'),
        children: intl.get('sslm.common.view.message.cancelConfirmMsg').d('确认取消？'),
        onOk: () => {
          return new Promise(resolve => {
            const selectedRows = dataSet.selected.map(record => record.toData());
            cancelPlanLines(selectedRows)
              .then(response => {
                const res = getResponse(response);
                if (res) {
                  notification.success();
                  dataSet.query(dataSet.currentPage, {}, false);
                  resolve();
                }
              })
              .finally(() => {
                resolve(false);
              });
          });
        },
      });
    };

    // 删除
    const handleDelete = () => {
      dataSet.delete(dataSet.selected);
    };

    // 表格行编辑逻辑
    const getLineEdit = record => {
      const { evalStatus, executeStatus } = record?.get(['evalStatus', 'executeStatus']) || {};
      if (isEdit && planTypeCode === 'PLAN_UPDATE') {
        return isEdit && ['NEW', 'REJECT'].includes(evalStatus);
      }
      return isEdit && evalStatus !== 'CANCELLED' && executeStatus !== 'EVAL_CANCEL';
    };

    const editColumns = useMemo(
      () => [
        {
          name: 'lineNumber',
          width: 50,
        },
        {
          name: 'evalStatus',
          width: 100,
          hidden: isEdit,
          editor: getLineEdit,
          componentType: 'SELECT',
        },
        {
          name: 'executeStatus',
          width: 120,
          hidden: isEdit,
          renderer: renderStatus,
        },
        {
          name: 'lineTypeCode',
          width: 140,
          editor: getLineEdit,
          componentType: 'SELECT',
        },
        {
          name: 'progressStatusMeaning',
          width: 120,
          hidden: isEdit,
          renderer: ({ value, record }) => {
            return value && <ProgressStep record={record} progressList={progressList} />;
          },
        },
        {
          name: 'finalScore',
          width: 100,
          hidden: isEdit,
        },
        {
          name: 'resultsFlagMeaning',
          width: 100,
          hidden: isEdit,
        },
        {
          name: 'grade',
          width: 120,
          hidden: isEdit,
        },
        {
          name: 'approveDate',
          width: 140,
          hidden: isEdit,
        },
        {
          name: 'ouId',
          width: 150,
          hidden: isGroup,
          editor: getLineEdit,
          componentType: 'LOV',
          displayField: 'ouName',
        },
        {
          name: 'invOrganizationId',
          width: 150,
          hidden: isGroup,
          editor: getLineEdit,
          componentType: 'LOV',
          displayField: 'invOrganizationName',
        },
        {
          name: 'inventoryId',
          width: 150,
          hidden: isGroup,
          editor: getLineEdit,
          componentType: 'LOV',
          displayField: 'inventoryName',
        },
        {
          name: 'supplierCompanyId',
          width: 200,
          editor: getLineEdit,
          componentType: 'LOV',
          displayField: 'supplierCompanyName',
        },
        { name: 'supplierCompanyNum', width: 120 },
        { name: 'supplierNum', width: 120 },
        { name: 'supplierCategoryName', width: 200 },
        {
          name: 'categoryCode',
          width: 150,
          displayField: 'categoryCode',
          editor: curRecord =>
            getLineEdit(curRecord) && (
              <Lov
                name="categoryCode"
                searchFieldInPopup
                onOption={({ record: optionRecord }) => {
                  return {
                    disabled: optionRecord.get('isCheck') === false,
                  };
                }}
                tableProps={{
                  alwaysShowRowBox: true,
                  selectionMode: 'rowbox',
                  onRow: ({ record }) => {
                    const nodeProps = {};
                    if (record.get('hasChild') === '0') {
                      nodeProps.isLeaf = true;
                    }
                    return nodeProps;
                  },
                }}
              />
            ),
        },
        { name: 'categoryName', width: 150, editor: getLineEdit },
        {
          name: 'itemId',
          width: 150,
          editor: getLineEdit,
          componentType: 'LOV',
          displayField: 'itemCode',
        },
        { name: 'itemName', width: 150, editor: getLineEdit },
        {
          name: 'evalPlanStrategyId',
          width: 150,
          editor: getLineEdit,
          componentType: 'LOV',
          displayField: 'strategyName',
        },
        { name: 'investigationType', width: 150, editor: getLineEdit, componentType: 'SELECT' },
        {
          name: 'evalPrincipalId',
          width: 150,
          editor: getLineEdit,
          componentType: 'LOV',
          displayField: 'evalPrincipalName',
        },
        { name: 'planMonth', width: 150, editor: getLineEdit, componentType: 'MONTHPICKER' },
        { name: 'planDateFrom', width: 120, editor: getLineEdit, componentType: 'DATEPICKER' },
        { name: 'planDateTo', width: 120, editor: getLineEdit, componentType: 'DATEPICKER' },
        { name: 'supplierContacts', width: 150, editor: getLineEdit },
        { name: 'telephone', width: 200, editor: getLineEdit },
        { name: 'email', width: 150, editor: getLineEdit },
        { name: 'supplierAddress', width: 150 },
        { name: 'evalRemark', width: 150, editor: getLineEdit },
      ],
      [isGroup, isEdit, progressList]
    );
    const viewColumns = useMemo(
      () =>
        editColumns.map(col => ({
          renderer: props => {
            if (col.name === 'evalStatus') {
              return renderStatus(props);
            }
            return readOnlyRenderer({ ...props, ...col, remote, isPub });
          },
          ...col,
        })),
      [editColumns, remote, isPub]
    );
    const finColumns = useMemo(() => (isEdit ? editColumns : viewColumns), [
      isEdit,
      editColumns,
      viewColumns,
    ]);

    const getButtons = () => {
      if (isEdit) {
        // 未勾选
        const selectedEmpty = isEmpty(dataSet.selected);
        // 【取消】禁用逻辑
        const cancelFlag =
          selectedEmpty ||
          !isEmpty(
            dataSet.selected.filter(record => {
              const { evalStatus, lineTypeCode } = record.get(['evalStatus', 'lineTypeCode']) || {};
              return !(['NEW', 'REJECT'].includes(evalStatus) && lineTypeCode === 'PLAN_UPDATE');
            })
          );
        // 【删除】禁用逻辑
        const deleteFlag =
          selectedEmpty ||
          !isEmpty(
            dataSet.selected.filter(record => {
              const { evalStatus, lineTypeCode } = record.get(['evalStatus', 'lineTypeCode']) || {};
              return !(['NEW', 'REJECT'].includes(evalStatus) && lineTypeCode === 'PLAN_NEW');
            })
          );
        // 【批量分配其它信息】禁用逻辑
        const batchAllocationFlag =
          selectedEmpty ||
          !isEmpty(
            dataSet.selected.filter(record => !['NEW', 'REJECT'].includes(record.get('evalStatus')))
          );
        return [
          <SupplierLov icon="playlist_add" funcType="flat" {...modalProps}>
            {intl.get('sslm.vendorEvaluationPlanDetail.button.header.addSupplier').d('添加供应商')}
          </SupplierLov>,
          <Button
            name="copy"
            icon="auto_complete"
            onClick={handleCopy}
            disabled={selectedEmpty}
            funcType="flat"
          >
            {intl.get('sslm.vendorEvaluationPlanDetail.button.header.copy').d('复制')}
          </Button>,
          <Button
            name="batchAllocation"
            icon="checklist"
            onClick={handleOpenBatchAllocation}
            disabled={batchAllocationFlag}
            funcType="flat"
          >
            {intl
              .get('sslm.vendorEvaluationPlanDetail.button.header.batchAllocation')
              .d('批量分配其它信息')}
          </Button>,
          <Button name="delete" icon="delete_sweep" onClick={handleDelete} disabled={deleteFlag}>
            {intl.get('hzero.common.button.delete').d('删除')}
          </Button>,
          planTypeCode === 'PLAN_UPDATE' && (
            <Button name="cancel" icon="cancel" disabled={cancelFlag} onClick={handleCancel}>
              {intl.get('hzero.common.button.cancel').d('取消')}
            </Button>
          ),
          <CommonImport
            name="commonImport"
            businessObjectTemplateCode="EXCEL_SSLM_BATCH_EVAL_PLAN_IMPORT"
            prefixPatch={SRM_SSLM}
            refreshButton
            buttonText={intl.get('hzero.common.button.import').d('导入')}
            args={{ evalPlanHeaderId }}
            successCallBack={() => {
              handleSearch();
            }}
            buttonProps={{
              funcType: 'flat',
              permissionList: [
                {
                  code: 'srm.partner.vendor-evaluation-plan-workbench.button.import',
                  type: 'button',
                  meaning: '供应商评估计划行-导入',
                },
              ],
            }}
          />,
        ];
      } else {
        return [];
      }
    };

    const getStepList = useCallback(() => {
      handleGetSteps().then(response => {
        const res = getResponse(response);
        if (res) {
          setProgressList(res);
        }
      });
    }, []);

    useEffect(() => {
      getStepList();
    }, []);

    return (
      <Fragment>
        {customizeTable(
          {
            code: 'SSLM.SUP_PLAN_WORKBENCH_DETAIL.DETAIL_TABLE',
            buttonCode: 'SSLM.SUP_PLAN_WORKBENCH_DETAIL.DETAIL_TABLE_BTNS',
            readOnly: !isEdit && !isPub, // 工作流页面不做管控，大全工作流可编辑个性化字段
            extTextRenderIntercept: (props, node) =>
              handleExtTextRenderIntercept({ ...props, remote, isPub }, node),
          },
          <SearchBarTable
            searchCode="SSLM.SUP_PLAN_WORKBENCH_DETAIL.LINE_NEW"
            custLoading={custLoading}
            buttons={getButtons()}
            columns={finColumns}
            dataSet={dataSet}
            border={false}
            selectionMode={isEdit ? 'rowbox' : 'none'}
            searchBarRef={ref => {
              if (onSearchBarRef) {
                onSearchBarRef(ref);
              }
            }}
            searchBarConfig={{
              autoQuery: true,
              closeFilterSelector: true,
              expandable: isEdit,
              expand: !isEdit,
              onQuery: handleSearch,
              fieldProps: {
                supplierIdCombine: {
                  valueField: 'supplierCompanyId',
                  transformRequest: value => {
                    const params = value?.map(({ supplierCompanyId, supplierId, ...others }) => {
                      return {
                        ...others,
                        supplierCompanyId: supplierCompanyId || supplierId,
                        supplierId,
                      };
                    });
                    return params;
                  },
                },
              },
            }}
            style={{
              maxHeight: 554,
            }}
          />
        )}
      </Fragment>
    );
  }
);

export default PlanLines;
