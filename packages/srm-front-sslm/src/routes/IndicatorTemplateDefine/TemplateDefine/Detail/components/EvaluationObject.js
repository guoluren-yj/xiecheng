/*
 * @Date: 2023-10-18 16:25:24
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { uniqBy, isEmpty } from 'lodash';
import { observer } from 'mobx-react-lite';
import React, { useEffect } from 'react';
import { Table, Lov, Icon, DataSet, Modal } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { SRM_SSLM } from '_utils/config';
import CommonImport from 'components/Import';
import notification from 'utils/notification';
import SupplierLov from '_components/SupplierLov';
import { TopSection, SecondSection } from '_components/Section';

import GeneralForm from '@/routes/components/GeneralForm';
import {
  saveEvaluatedSupplier,
  batchAssignItemOrCategory,
} from '@/services/indicatorTemplateDefineService';
import { getBatchEditDs } from '../stores/getEvaluationObjectDS';

const EvaluationObject = observer(
  ({
    remote,
    isEdit,
    evalTplId,
    evalTplType,
    onRefresh,
    dataSet: [{ dataSet: evaluationObjectDs }, { dataSet: suppliersDs }] = [],
  }) => {
    const { evalGranularity, trxLineFlags = [] } =
      evaluationObjectDs?.current?.get(['evalGranularity', 'trxLineFlags']) || {};

    useEffect(() => {
      suppliersDs.setState('evalGranularity', evalGranularity);
    }, [evalGranularity]);

    // 考评颗粒度改变的回调
    const handleGranularityChange = () => {
      // 颗粒度改变清空品类、物料
      suppliersDs.records.forEach(record => {
        record.set({ kpiEvalTplScopeDtlList: [] });
      });
    };

    // 选择供应商弹框确认回调
    const saveRecordRows = () => {
      const selectedField = evaluationObjectDs.current?.get('selectedField');
      // 过滤重复的供应商
      const uniqData = uniqBy(selectedField, 'supplierCompanyNum');
      return saveEvaluatedSupplier(evalTplId, {
        kpiEvalTplScopeList: uniqData,
      })
        .then(response => {
          const res = getResponse(response);
          if (res) {
            notification.success();
            suppliersDs.query();
            return true;
          } else {
            return false;
          }
        })
        .finally(() => {
          evaluationObjectDs.current.set('selectedField', null);
        });
    };

    // 参评供应商展示逻辑
    const showSupplierFlag = trxLineFlags.includes('0') && evalTplType !== 'BDKPI_EVAL';

    const supplierLovProps = {
      dataSet: evaluationObjectDs,
      name: 'selectedField',
      mode: 'button',
      clearButton: false,
      funcType: 'flat',
      icon: 'playlist_add',
      modalProps: {
        onOk: saveRecordRows,
      },
      queryData: {
        srmFlag: 1,
      },
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
        const suppliersSelected = suppliersDs.selected.map(record => record.toData());
        return new Promise(resolve => {
          batchAssignItemOrCategory({
            evalTplId,
            evalGranularity,
            selectAllFlag: isEmpty(suppliersSelected) ? 1 : 0,
            itemOrCategoryVOS: selectedRows,
            kpiEvalTplScopes: suppliersSelected,
          })
            .then(response => {
              const res = getResponse(response);
              if (res) {
                notification.success();
                resolve();
                onRefresh();
                suppliersDs.query(suppliersDs.currentPage, {}, false);
                Modal.destroyAll();
              }
            })
            .finally(() => {
              resolve(false);
            });
        });
      }
    };

    const getButtons = () => {
      if (isEdit) {
        const batchEditDsProps = remote
          ? remote.process(
              'SSLM.INDICATORTEMPLATEDEFINE.DETAIL_BATCH_ASSIGN_ITEM_OR_CATEGORY_DS_PROPS',
              getBatchEditDs()
            )
          : getBatchEditDs();
        const batchEditDs = new DataSet(batchEditDsProps);
        const isSelected = isEmpty(suppliersDs.selected);
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
        return [
          <SupplierLov {...supplierLovProps}>
            {intl.get(`sslm.supplierDocManage.view.title.addSupplier`).d('添加供应商')}
          </SupplierLov>,
          <Lov
            mode="button"
            name={addName}
            clearButton={false}
            dataSet={batchEditDs}
            hidden={evalGranularity === 'SU'}
            onBeforeSelect={() => false}
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
          <CommonImport
            refreshButton
            prefixPatch={SRM_SSLM}
            businessObjectTemplateCode="SRM_C_SRM_SSLM_KPI_EVAL_TPL_IND_OBJECT_IMPORT"
            buttonText={intl.get('hzero.common.button.import').d('导入')}
            args={{ evalTplId, evalGranularity }}
            buttonProps={{
              funcType: 'flat',
              permissionList: [
                {
                  code: 'srm.partner.indicator-template-definition.button.object-import',
                  type: 'button',
                  meaning: '参评供应商-导入',
                },
              ],
            }}
            successCallBack={() => {
              suppliersDs.query();
            }}
          />,
          'delete',
        ];
      } else {
        return [];
      }
    };
    const btns = getButtons();
    const buttons = remote
      ? remote.process('SSLM.INDICATORTEMPLATEDEFINE.DETAIL_EVALUATION_OBJECT_TABLE_BTNS', btns, {
          isEdit,
          evalTplId,
          suppliersDs,
          evaluationObjectDs,
          onRefresh,
        })
      : btns;

    const cols = [
      {
        name: 'companyNum',
      },
      {
        name: 'companyName',
      },
      ['SU+CA', 'SU+IT'].includes(evalGranularity) && {
        name: 'kpiEvalTplScopeDtlList',
        editor: isEdit && (
          <Lov
            searchFieldInPopup
            name="kpiEvalTplScopeDtlList"
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
    ].filter(Boolean);
    const columns = remote
      ? remote.process(
          'SSLM.INDICATORTEMPLATEDEFINE.DETAIL_EVALUATION_OBJECT_TABLE_COLUMNS',
          cols,
          {
            isEdit,
            evalTplId,
            suppliersDs,
            evaluationObjectDs,
          }
        )
      : cols;

    // 考评对象
    const fields = [
      {
        name: 'evalGranularity',
        componentType: 'SELECT',
        onChange: handleGranularityChange,
      },
      {
        name: 'trxLineFlags',
        maxTagCount: 2,
        componentType: 'SELECT',
        hidden: ['BDKPI_EVAL'].includes(evalTplType),
        onOption: ({ record }) => {
          const value = record.get('value');
          if (trxLineFlags.includes('0')) {
            return {
              disabled: value !== '0',
            };
          }
        },
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
        searchFieldInPopup: true,
        onOption: ({ record: optionRecord }) => {
          return {
            disabled: +optionRecord.get('hasChild'),
          };
        },
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
      {
        name: 'cancelAutoWriteFlag',
        componentType: 'SELECT',
        hidden: !['3', '5', '3,5', '5,3'].includes(trxLineFlags.toString()),
      },
    ];

    return (
      <TopSection>
        <SecondSection
          title={intl.get('sslm.common.model.archive.evaluation.object').d('考评对象')}
        >
          <GeneralForm
            isEdit={isEdit}
            fields={fields}
            dataSet={evaluationObjectDs}
            style={{ marginBottom: 32 }}
          />
        </SecondSection>
        {showSupplierFlag && (
          <SecondSection
            title={intl
              .get(`sslm.supplierDocManage.model.evalDocManage.scoreVendor`)
              .d('参评供应商')}
          >
            <Table
              columns={columns}
              dataSet={suppliersDs}
              buttons={buttons}
              style={{ maxHeight: 'calc(100vh - 420px)' }}
              selectionMode={isEdit ? 'rowbox' : 'none'}
              customizedCode="SSLM.TEMPLATE_DEFINE.PARTICIPATING_SUPPLIERS"
            />
          </SecondSection>
        )}
      </TopSection>
    );
  }
);

export default EvaluationObject;
