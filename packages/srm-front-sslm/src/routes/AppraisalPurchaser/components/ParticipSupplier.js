/*
 * ParticipSupplier - 参评供应商
 * @Date: 2023-11-06 16:49:29
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { uniqBy, isEmpty } from 'lodash';
import { observer } from 'mobx-react-lite';
import { Alert } from 'choerodon-ui';
import { DataSet, Icon, Lov, Button, Modal } from 'choerodon-ui/pro';
import React, { Fragment, useCallback, useEffect, useState } from 'react';

import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import CommonImport from 'components/Import';
import notification from 'utils/notification';
import SupplierLov from '_components/SupplierLov';
import ExcelExportPro from 'components/ExcelExportPro';
import SearchBarTable from '_components/SearchBarTable';
import { getResponse, getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

import GeneralForm from '@/routes/components/GeneralForm';
import { addSuppliers, batchAssignItemOrCategory } from '@/services/appraisalPurchaserService';

import styles from '../styles.less';
import { getBatchEditDs } from '../stores/getParticipSupplierDS';

const organizationId = getCurrentOrganizationId();

const ParticipSupplier = observer(
  ({
    remote,
    isEdit,
    dataSet,
    basicDs,
    searchCode,
    sourceKey,
    wfParams = {},
    custLoading,
    readOnlyFlag,
    evalHeaderId,
    customizeTable,
    evalGranularity,
    appraisalPersonDs,
    customizeUnitCode,
  }) => {
    const {
      stageIds,
      categoryIds,
      evalTplType,
      trxLineFlags,
      evalDimension,
      evalDimensionValue,
      cancelAutoWriteFlag,
      evalDimensionValueChangeFlag,
    } =
      basicDs.current?.get([
        'stageIds',
        'categoryIds',
        'evalTplType',
        'trxLineFlags',
        'evalDimension',
        'evalDimensionValue',
        'cancelAutoWriteFlag',
        'evalDimensionValueChangeFlag',
      ]) || {};

    // 业务单据评价类型
    const isBdkpiEvalFlag = evalTplType === 'BDKPI_EVAL';
    const [searBarParams, setSearBarParams] = useState({});

    useEffect(() => {
      basicDs.setState('supplierloading', true);
      const queryParams = {
        ...wfParams,
        customizeUnitCode: [
          'SSLM.APPRAISAL_PURCHASER_DETAIL.PARTICIP_SUPPLIER_SEARCH',
          customizeUnitCode,
        ].join(),
      };
      dataSet.setQueryParameter('queryParams', queryParams);
      dataSet.query().finally(() => {
        basicDs.setState('supplierloading', false);
      });
      handleFetchSearchBarParams();
    }, [evalHeaderId, JSON.stringify(wfParams)]);

    const handleFetchSearchBarParams = async () => {
      const searParams = remote
        ? await remote.process('SSLM.APPRAISAL_PURCHASER_DETAIL.PARTICIP_SUPPLIER_SEARCH_BAR_PROPS')
        : {};
      setSearBarParams(searParams);
    };

    // 选择供应商弹框确认回调
    const saveRecordRows = batchEditDs => {
      const currentData = batchEditDs.current.toData() || {};
      const { addSupplier } = currentData;
      // 过滤重复的供应商
      const uniqData = uniqBy(addSupplier, 'supplierCompanyNum');
      const data = uniqData.map(item => {
        const { supplierCompanyId } = item;
        return {
          ...item,
          supplierId: supplierCompanyId,
        };
      });
      const newData = remote
        ? remote.process('SSLM_APPRAISAL_PURCHASER_DETAIL_PARTICIP_SUPPLIER_ADD_SUPPLIER', data)
        : data;
      return addSuppliers({
        data: newData,
        evalHeaderId,
      })
        .then(response => {
          const res = getResponse(response);
          if (res) {
            notification.success();
            dataSet.query();
            appraisalPersonDs.query(); // 查询评分人
            return true;
          } else {
            return false;
          }
        })
        .finally(() => {
          batchEditDs.current.set({ addSupplier: null });
        });
    };

    // 批量分配品类、物料
    const batchAssign = lovDs => {
      const selectedRows = (lovDs?.selected || []).map(record => record.toData());
      if (isEmpty(selectedRows)) {
        notification.warning({
          message: intl.get('hzero.common.validation.atLeast').d('请至少选择一条数据'),
        });
        return false;
      } else {
        const suppliersSelected = dataSet.selected.map(record => record.toData());
        return new Promise(resolve => {
          batchAssignItemOrCategory({
            evalHeaderId,
            selectAllFlag: isEmpty(suppliersSelected) ? 1 : 0,
            itemOrCategoryVOS: selectedRows,
            kpiEvalLines: suppliersSelected,
          })
            .then(response => {
              const res = getResponse(response);
              if (res) {
                notification.success();
                resolve();
                dataSet.query(dataSet.currentPage, {}, false);
                appraisalPersonDs.query(); // 查询评分人
                Modal.destroyAll(); // 关闭弹框
              }
            })
            .finally(() => {
              resolve(false);
            });
        });
      }
    };

    // 批量删除
    const handleDelete = () => {
      dataSet.delete(dataSet.selected).then(response => {
        if (response && response.success) {
          appraisalPersonDs.query(); // 查询评分人
        }
      });
    };

    // 获取导出参数
    const getQueryParams = () => {
      const queryParams = dataSet?.queryDataSet?.current?.toData() || {};
      return filterNullValueObject(queryParams);
    };

    const getButtons = () => {
      const commonBtns = [
        <ExcelExportPro
          queryParams={() => getQueryParams()}
          requestUrl={`${SRM_SSLM}/v1/${organizationId}/eval-line/eval-manage/${evalHeaderId}/export`}
          templateCode="SRM_C_SRM_SSLM_KPI_EVAL_HEADER_SUPPLIER_SCOPE_EXPORT"
          buttonText={intl.get('hzero.common.button.export').d('导出')}
          otherButtonProps={{
            type: 'c7n-pro',
            funcType: 'flat',
            permissionList: [
              {
                code: 'srm.partner.evaluation-manage.appraisal-purchaser.button.eval-manage-export',
                type: 'button',
                meaning: '参评供应商-导出',
              },
            ],
          }}
        />,
      ];
      if (isEdit) {
        // 批量编辑ds
        const batchEditDsProps = remote
          ? remote.process(
              'SSLM_APPRAISAL_PURCHASER_DETAIL_BATCH_ASSIGN_ITEM_OR_CATEGORY_DS_PROPS',
              getBatchEditDs()
            )
          : getBatchEditDs();
        const batchEditDs = new DataSet(batchEditDsProps);
        const isSelected = isEmpty(dataSet.selected);
        const addName = evalGranularity === 'SU+CA' ? 'addCategory' : 'addItem';
        const addLabel =
          evalGranularity === 'SU+CA'
            ? isSelected
              ? intl.get('sslm.common.model.batch.assignCategory').d('批量分配品类')
              : intl.get('sslm.common.model.selectBatch.assignCategory').d('勾选批量分配品类')
            : isSelected
            ? intl.get('sslm.common.model.batch.assignItem').d('全选批量分配物料')
            : intl.get('sslm.common.model.selectBatch.assignItem').d('勾选批量分配物料');
        const lovDs = batchEditDs.getField(addName).getOptions(batchEditDs.current);
        const otherSupplierLovParams = cancelAutoWriteFlag
          ? {
              stageIds: stageIds.join(),
              querySupplierCategoryIds: (categoryIds || []).map(n => n.categoryId).join(),
            }
          : {};
        const remoteParams =
          remote?.process('SSLM_APPRAISAL_PURCHASER_DETAIL_SUPPLIER_LOV_PARAMS', {}, { basicDs }) ||
          {};
        return [
          <SupplierLov
            dataSet={batchEditDs}
            mode="button"
            name="addSupplier"
            funcType="flat"
            icon="playlist_add"
            clearButton={false}
            hidden={isBdkpiEvalFlag}
            modalProps={{
              onOk: () => saveRecordRows(batchEditDs),
            }}
            searchBarProps={searBarParams}
            queryData={{
              srmFlag: 1,
              companyId: evalDimension === 'COMPANY' ? evalDimensionValue?.companyId : null,
              ...otherSupplierLovParams,
              ...remoteParams,
            }}
          >
            {intl.get(`sslm.supplierDocManage.view.title.addSupplier`).d('添加供应商')}
          </SupplierLov>,
          <Lov
            mode="button"
            name={addName}
            clearButton={false}
            dataSet={batchEditDs}
            hidden={evalGranularity === 'SU'}
            onBeforeSelect={() => false} // 弹框不关闭
            tableProps={{
              virtual: true,
              virtualCell: true,
            }}
            modalProps={{
              // 给确认按钮加loading
              onOk: () => batchAssign(lovDs),
              beforeOpen: () => {
                if (lovDs) {
                  lovDs.unSelectAll();
                  lovDs.clearCachedSelected();
                }
              },
            }}
          >
            <Icon type="mode_edit" style={{ fontSize: 14, marginRight: 5, fontWeight: 400 }} />
            {addLabel}
          </Lov>,
          <Button
            icon="delete_sweep"
            onClick={handleDelete}
            disabled={isEmpty(dataSet.selected)}
            style={{ display: isBdkpiEvalFlag ? 'none' : 'inline-block' }}
          >
            {intl.get('hzero.common.button.delete').d('删除')}
          </Button>,
          <CommonImport
            refreshButton
            prefixPatch={SRM_SSLM}
            businessObjectTemplateCode="SSLM.BATCH_IMPORT_EVAL_SUP"
            buttonText={intl.get('hzero.common.button.import').d('导入')}
            args={{ evalHeaderId, evalGranularity, tenantId: organizationId, createPage: 'ASSESS' }}
            successCallBack={() => {
              dataSet.query();
              appraisalPersonDs.query(); // 查询评分人
            }}
            buttonProps={{
              type: 'c7n-pro',
              funcType: 'flat',
              hidden: isBdkpiEvalFlag,
              permissionList: [
                {
                  code:
                    'srm.partner.evaluation-manage.appraisal-purchaser.button.eval-manage-import',
                  type: 'button',
                  meaning: '参评供应商-导入',
                },
              ],
            }}
          />,
          ...commonBtns,
        ];
      } else {
        return [...commonBtns];
      }
    };

    const fields = [
      {
        name: 'trxLineFlags',
        maxTagCount: 2,
        componentType: 'SELECT',
      },
      {
        name: 'inventoryTimes',
        componentType: 'NUMBERFIELD',
        hidden: !trxLineFlags.includes('1'),
      },
      {
        name: 'cooperationDays',
        componentType: 'NUMBERFIELD',
        hidden: !trxLineFlags.includes('2'),
      },
      {
        name: 'categoryIds',
        componentType: 'LOV',
        hidden: !trxLineFlags.includes('3'),
      },
      {
        name: 'itemCategoryIds',
        componentType: 'LOV',
        hidden: !trxLineFlags.includes('4'),
      },
      {
        name: 'stageIds',
        componentType: 'SELECT',
        hidden: !trxLineFlags.includes('5'),
      },
      {
        name: 'deliveryTimes',
        componentType: 'NUMBERFIELD',
        hidden: !trxLineFlags.includes('6'),
      },
      {
        name: 'purchaseAgentIds',
        componentType: 'LOV',
        hidden: !trxLineFlags.includes('7'),
      },
    ];

    const columns = [
      {
        name: 'supplierNum',
      },
      {
        name: 'supplierName',
      },
      ['SU+CA', 'SU+IT'].includes(evalGranularity) && {
        name: 'itemOrCategoryVOS',
        editor: isEdit && (
          <Lov
            searchFieldInPopup
            name="itemOrCategoryVOS"
            onOption={({ record: optionRecord }) => {
              return {
                disabled: optionRecord.get('isCheck') === false,
              };
            }}
            tableProps={{
              virtual: true,
              virtualCell: true,
            }}
          />
        ),
      },
    ];

    // 查询条件参数
    const getFieldProps = useCallback(
      () => ({
        supplierId: {
          lovPara: { evalHeaderId },
        },
      }),
      []
    );

    return (
      <Fragment>
        {evalDimensionValueChangeFlag && (
          <Alert
            closable
            showIcon
            type="info"
            className={styles['supplier-alert']}
            message={intl
              .get('sslm.appraisalPurchaser.model.alert.companyChangeMsg')
              .d('您变更了公司信息，请及时操作保存更新信息，参评供应商范围将以变更后的公司为准')}
          />
        )}
        <GeneralForm
          isEdit={isEdit}
          fields={fields}
          dataSet={basicDs}
          style={{ marginBottom: 16 }}
        />
        {customizeTable(
          {
            code: customizeUnitCode,
            readOnly: readOnlyFlag,
          },
          <SearchBarTable
            dataSet={dataSet}
            columns={
              remote
                ? remote.process(
                    'SSLM_APPRAISAL_PURCHASER_DETAIL_PROCESS_PARTICIPATING_SUPPLIER_COLUMNS',
                    columns,
                    { isEdit }
                  )
                : columns
            }
            buttons={getButtons()}
            searchCode={searchCode}
            custLoading={custLoading}
            selectionMode={isEdit ? 'rowbox' : 'none'}
            style={{ maxHeight: sourceKey === 'VIEW_DETAIL' ? 300 : 500 }}
            searchBarConfig={{
              autoQuery: false,
              defaultExpand: false,
              closeFilterSelector: true,
              fieldProps: getFieldProps(),
            }}
          />
        )}
      </Fragment>
    );
  }
);

export default ParticipSupplier;
