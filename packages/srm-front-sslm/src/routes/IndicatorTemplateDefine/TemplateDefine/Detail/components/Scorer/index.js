/*
 * Scorer - 评分人
 * @Date: 2023-11-15 18:08:58
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { observer } from 'mobx-react-lite';
import { isEmpty, uniqBy, isNil } from 'lodash';
import React, { Fragment, useCallback } from 'react';
import { Button, Modal, DataSet, Lov, Icon } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import CommonImport from 'components/Import';
import notification from 'utils/notification';
import { yesOrNoRender } from 'utils/renderer';
import SupplierLov from '_components/SupplierLov';
import SearchBarTable from '_components/SearchBarTable';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';

import GeneralForm from '@/routes/components/GeneralForm';
import { scorerSearchCode } from '@/routes/IndicatorTemplateDefine/TemplateDefine/Detail/utils';
import { assignScorer, raterDimensionAdd } from '@/services/indicatorTemplateDefineService';

import { getColumns } from './utils';
import AssignScorer from './AssignScorer';
import { getConfig, getAssignScorerFormDs, getAssignScorerTableDs } from '../../stores/getScorerDS';

const organizationId = getCurrentOrganizationId();

const Scorer = observer(
  ({
    isEdit,
    evalTplId,
    evalTplType,
    dataSet: [{ dataSet: scorerFormDs }, { dataSet: scorerTableDs }] = [],
  }) => {
    const { evalRespRule, respCalMethod } =
      scorerFormDs.current?.get(['evalRespRule', 'respCalMethod']) || {};
    const evalGranularity = scorerFormDs.getState('evalGranularity');

    // 分配评分人
    const handleAssignScorer = useCallback(
      (type, record) => {
        const singleAssign = type === 'edit'; // 分配评分人
        const { primaryKey } = getConfig(evalRespRule, evalTplId); // 获取不同评分规则对应的主键
        const evalDataId = record?.get(primaryKey);
        const formDs = new DataSet(getAssignScorerFormDs());
        const tableDs = new DataSet(
          getAssignScorerTableDs({ evalRespRule, evalDataId, evalTplId, respCalMethod })
        );
        if (singleAssign) {
          tableDs.query();
        }
        Modal.open({
          drawer: true,
          key: Modal.key(),
          style: { width: 742 },
          title: singleAssign
            ? intl.get('sslm.common.modal.field.assignedScore').d('分配评分人')
            : intl.get('sslm.common.button.batchEdit').d('批量编辑'),
          children: (
            <AssignScorer
              type={type}
              isEdit={isEdit}
              scorerFormDs={formDs}
              scorerTableDs={tableDs}
              respCalMethod={respCalMethod}
            />
          ),
          onOk: () => {
            return new Promise(async resolve => {
              let validateFlag;
              if (singleAssign) {
                validateFlag = await tableDs.validate();
              } else {
                validateFlag = (await formDs.validate()) && (await tableDs.validate());
              }
              if (validateFlag) {
                const kpiEvalTplRespDms = tableDs.toJSONData();
                const evalDataIds = scorerTableDs.selected.map(selectedRecord =>
                  selectedRecord.get(primaryKey)
                );
                const selectAllFlag = singleAssign ? 0 : isEmpty(evalDataIds) ? 1 : 0;
                const saveParams =
                  evalRespRule === 'INDICATOR'
                    ? {
                        evalTplId,
                        selectAllFlag,
                        evalTplIndId: evalDataId,
                        evalTplIndIds: evalDataIds,
                        evalDataType: evalRespRule,
                        evalDimension: 'RESP',
                        kpiEvalTplIndResps: kpiEvalTplRespDms,
                        ...(formDs.current?.toJSONData() || {}),
                      }
                    : {
                        evalTplId,
                        evalDataId,
                        evalDataIds,
                        selectAllFlag,
                        kpiEvalTplRespDms,
                        evalDataType: evalRespRule,
                        ...(formDs.current?.toJSONData() || {}),
                      };
                assignScorer(saveParams)
                  .then(response => {
                    const res = getResponse(response);
                    if (res) {
                      resolve();
                      scorerTableDs.query();
                    }
                  })
                  .finally(() => {
                    resolve(false);
                  });
              } else {
                resolve(false);
              }
            });
          },
          onCancel: () => {
            if (isEdit) {
              scorerTableDs.query();
            }
          },
        });
      },
      [isEdit, scorerTableDs, evalTplId, evalRespRule, respCalMethod]
    );

    // 新建供应商弹框回调
    const handleAddSupplier = async () => {
      const currentData = scorerFormDs?.current?.toData() || {};
      const { addSuppliers } = currentData;
      // 过滤重复的供应商
      const uniqData = uniqBy(addSuppliers, 'supplierCompanyNum');
      return raterDimensionAdd({
        evalTplId,
        evalRespRule,
        data: uniqData,
      })
        .then(response => {
          const res = getResponse(response);
          if (res) {
            notification.success();
            scorerTableDs.query();
            return true;
          } else {
            return false;
          }
        })
        .finally(() => {
          scorerFormDs.current.set('addSuppliers', null);
        });
    };

    // 批量新增品类/物料、评分人
    const handleBatchAdd = useCallback(
      lovDs => {
        const selectedRows = (lovDs?.selected || []).map(record => record.toData());
        if (isEmpty(selectedRows)) {
          notification.warning({
            message: intl.get('hzero.common.validation.atLeast').d('请至少选择一条数据'),
          });
          return false;
        } else {
          return new Promise(resolve => {
            raterDimensionAdd({
              evalTplId,
              evalRespRule,
              data: selectedRows,
            })
              .then(response => {
                const res = getResponse(response);
                if (res) {
                  notification.success();
                  resolve();
                  scorerTableDs.query();
                  Modal.destroyAll();
                }
              })
              .finally(() => {
                resolve(false);
              });
          });
        }
      },
      [scorerTableDs, evalRespRule, evalTplId]
    );

    const fields = [
      {
        name: 'evalRespRule',
        clearButton: false,
        componentType: 'SELECT',
        optionsFilter: record => {
          const value = record.get('value');
          if (evalTplType === 'GYSKP_XC') {
            return ['RATER', 'INDICATOR'].includes(value);
          }
          switch (evalGranularity) {
            case 'SU':
              return !['CATEGORY', 'ITEM', 'SU+CA+IN', 'SU+IT+IN'].includes(value);
            case 'SU+IT':
              return !['CATEGORY', 'SU+CA+IN'].includes(value);
            case 'SU+CA':
              return !['ITEM', 'SU+IT+IN'].includes(value);
            default:
              break;
          }
        },
      },
      {
        name: 'respCalMethod',
        componentType: 'SELECT',
      },
      {
        name: 'abandonFlag',
        componentType: 'CHECKBOX',
        hidden: respCalMethod !== 'AVERAGE',
        renderer: ({ value }) => (isNil(value) ? '-' : yesOrNoRender(value)),
      },
    ];

    const columns = getColumns({
      evalRespRule,
      isEdit,
      respCalMethod,
      onAssignScorer: handleAssignScorer,
    });

    const getButtons = useCallback(() => {
      if (isEdit) {
        const addName =
          evalRespRule === 'CATEGORY'
            ? 'addCategory'
            : evalRespRule === 'ITEM'
            ? 'addItem'
            : 'addScorer';
        const lovDs = scorerFormDs.getField(addName).getOptions(scorerFormDs.current);
        return [
          evalRespRule === 'SUPPLIER' && (
            <SupplierLov
              dataSet={scorerFormDs}
              name="addSuppliers"
              mode="button"
              clearButton={false}
              funcType="flat"
              icon="playlist_add"
              modalProps={{
                onOk: handleAddSupplier,
              }}
              queryData={{
                srmFlag: 1,
              }}
            >
              {intl.get('hzero.common.button.add').d('新增')}
            </SupplierLov>
          ),
          !['INDICATOR', 'SUPPLIER', 'SUPPLIER+INDICATOR', 'SU+CA+IN', 'SU+IT+IN'].includes(
            evalRespRule
          ) && (
            <Lov
              mode="button"
              name={addName}
              clearButton={false}
              dataSet={scorerFormDs}
              onBeforeSelect={() => false}
              modalProps={{
                // 给确认按钮加loading
                onOk: () => handleBatchAdd(lovDs),
                beforeOpen: () => {
                  if (lovDs) {
                    lovDs.unSelectAll();
                    lovDs.clearCachedSelected();
                  }
                },
              }}
            >
              <Icon type="playlist_add" style={{ fontSize: 14, marginRight: 5, fontWeight: 400 }} />
              {intl.get('hzero.common.button.add').d('新增')}
            </Lov>
          ),
          !['INDICATOR', 'SUPPLIER+INDICATOR', 'SU+CA+IN', 'SU+IT+IN'].includes(evalRespRule) &&
            'delete',
          evalRespRule !== 'RATER' && (
            <Button
              icon="mode_edit"
              disabled={isEmpty(scorerTableDs.toData())}
              onClick={() => handleAssignScorer('batchEdit')}
            >
              {isEmpty(scorerTableDs.selected)
                ? intl.get('sslm.common.button.batchEdit').d('批量编辑')
                : intl.get('sslm.common.button.selectedBatchEdit').d('勾选批量编辑')}
            </Button>
          ),
          ['INDICATOR', 'SUPPLIER+INDICATOR'].includes(evalRespRule) && (
            <CommonImport
              refreshButton
              prefixPatch={SRM_SSLM}
              buttonText={intl
                .get('spfm.supplierKpiIndicator.view.button.batchImportScorer')
                .d('批量导入评分人')}
              businessObjectTemplateCode={
                evalRespRule === 'INDICATOR'
                  ? 'SSLM.KPI_TPL_IND_RESP'
                  : 'SRM_C_SRM_SSLM_KPI_EVAL_TPL_IND_RESP_DMS_IMPORT'
              }
              args={
                evalRespRule === 'INDICATOR'
                  ? {}
                  : { evalTplId, evalRespRule, tenantId: organizationId }
              }
              successCallBack={() => {
                scorerTableDs.query();
              }}
              buttonProps={{
                type: 'c7n-pro',
                funcType: 'flat',
              }}
            />
          ),
        ].filter(Boolean);
      } else {
        return [];
      }
    }, [isEdit, evalRespRule, evalTplId, scorerTableDs]);

    return (
      <Fragment>
        <GeneralForm
          isEdit={isEdit}
          fields={fields}
          dataSet={scorerFormDs}
          style={{ marginBottom: 16 }}
        />
        {evalRespRule && (
          <SearchBarTable
            virtual
            virtualCell
            defaultRowExpanded
            dataSet={scorerTableDs}
            columns={columns}
            buttons={getButtons()}
            key={scorerSearchCode[evalRespRule]}
            searchCode={scorerSearchCode[evalRespRule]}
            selectionMode={isEdit ? 'rowbox' : 'none'}
            style={{ maxHeight: 'calc(100vh - 340px)' }}
            customizedCode="SSLM.TEMPLATE_DEFINE.SCORER_TABLE"
            mode={['INDICATOR'].includes(evalRespRule) ? 'tree' : 'list'}
            searchBarConfig={{
              autoQuery: false,
              expandable: isEdit,
              defaultExpand: false,
              closeFilterSelector: isEdit,
            }}
          />
        )}
      </Fragment>
    );
  }
);

export default Scorer;
