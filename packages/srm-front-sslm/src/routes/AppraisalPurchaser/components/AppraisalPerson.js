/*
 * AppraisalPerson - 评分人
 * @Date: 2023-11-06 16:49:29
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { isEmpty } from 'lodash';
import { observer } from 'mobx-react-lite';
import React, { Fragment, useCallback, useEffect } from 'react';
import { DataSet, Form, Button, Lov, Icon, Modal } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import notification from 'utils/notification';
import CommonImport from 'components/Import';
import ExcelExportPro from 'components/ExcelExportPro';
import SearchBarTable from '_components/SearchBarTable';
import { getResponse, getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

import FormField from '@/routes/components/FormField';
import { addScorer, assignScorer } from '@/services/appraisalPurchaserService';

import { scorerSearchCode } from './utils';
import AssignScorer from './AssignScorer';
import { getBasicDs } from '../stores/getBasicDS';
import { getAssignScorerTableDs } from '../stores/getAppraisalPersonDS';

const organizationId = getCurrentOrganizationId();

const AppraisalPerson = observer(
  ({
    remote,
    isEdit,
    dataSet,
    basicDs,
    sourceKey,
    evalHeaderId,
    evalGranularity,
    onRefresh,
    setLoading,
  }) => {
    const { evalStatus, evalRespRule, respCalMethod } = basicDs.current?.get([
      'evalStatus',
      'evalRespRule',
      'respCalMethod',
    ]);

    useEffect(() => {
      if (evalRespRule) {
        basicDs.setState('personLoading', true);
        dataSet.setQueryParameter('customizeUnitCode', scorerSearchCode[evalRespRule]);
        dataSet.query().finally(() => {
          basicDs.setState('personLoading', false);
        });
      }
    }, [evalRespRule, evalHeaderId]);

    // 分配评分人
    const handleAssignScorer = useCallback(
      (type, record) => {
        const singleAssign = type === 'edit'; // 分配评分人
        const primaryKey = evalRespRule === 'RATER' ? 'headerRespDmsId' : 'evalDataId';
        const evalDataId = record?.get(primaryKey);
        const formDs = new DataSet(getBasicDs());
        const tableDs = new DataSet(
          getAssignScorerTableDs({
            evalDataId,
            evalRespRule,
            evalHeaderId,
            respCalMethod,
          })
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
                const evalDataIds = dataSet.selected.map(selectedRecord =>
                  selectedRecord.get(primaryKey)
                );
                const selectAllFlag = singleAssign ? 0 : isEmpty(evalDataIds) ? 1 : 0;
                const saveParams = {
                  evalDataId,
                  evalDataIds,
                  evalRespRule,
                  evalHeaderId,
                  selectAllFlag,
                  ...(formDs.current?.toJSONData() || {}),
                  kpiEvalHeaderRespDmsList: kpiEvalTplRespDms,
                };
                assignScorer(saveParams)
                  .then(response => {
                    const res = getResponse(response);
                    if (res) {
                      resolve();
                      dataSet.query();
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
              dataSet.query();
            }
          },
        });
      },
      [isEdit, dataSet, evalRespRule, respCalMethod, evalHeaderId]
    );

    // 批量新增评分人
    const handleBatchAdd = useCallback(
      lovDs => {
        const selectedRows = (lovDs?.selected || []).map(record => record.toData());
        if (isEmpty(selectedRows)) {
          notification.warning({
            message: intl.get('hzero.common.validation.atLeast').d('请至少选择一条数据'),
          });
          return false;
        } else {
          const newList = selectedRows.map(item => {
            const { userId, userName, loginName, ...others } = item;
            return {
              ...others,
              respUserId: userId,
              respUserName: userName,
              respLoginName: loginName,
            };
          });
          return new Promise(resolve => {
            addScorer({
              evalHeaderId,
              evalRespRule,
              kpiEvalHeaderRespDmsList: newList,
            })
              .then(response => {
                const res = getResponse(response);
                if (res) {
                  notification.success();
                  resolve();
                  dataSet.query();
                  Modal.destroyAll();
                }
              })
              .finally(() => {
                resolve(false);
              });
          });
        }
      },
      [evalHeaderId, evalRespRule]
    );

    // 评分人规则改变的回调
    const handleRuleChange = useCallback(
      value => {
        if (value === evalRespRule) {
          // 防止切换时也查询上个维度
          dataSet.query();
        }
      },
      [evalRespRule]
    );

    // 获取导出参数
    const getQueryParams = () => {
      const queryParams = dataSet?.queryDataSet?.current?.toData() || {};
      return filterNullValueObject(queryParams);
    };

    const getButtons = () => {
      const commonBtns = [
        <ExcelExportPro
          queryParams={() => getQueryParams()}
          requestUrl={`${SRM_SSLM}/v1/${organizationId}/kpi-eval-header-datas/eval-manage/indicator/${evalRespRule}/${evalHeaderId}/export`}
          templateCode="SRM_C_SRM_SSLM_KPI_EVAL_HEADER_RESP_USER_EXPORT"
          buttonText={intl.get('hzero.common.button.export').d('导出')}
          otherButtonProps={{
            type: 'c7n-pro',
            funcType: 'flat',
            permissionList: [
              {
                code: 'srm.partner.evaluation-manage.appraisal-purchaser.button.eval-resp-export',
                type: 'button',
                meaning: '评分人-导出',
              },
            ],
          }}
        />,
      ];
      if (isEdit) {
        const addScorerDs = new DataSet(getBasicDs());
        const lovDs = addScorerDs.getField('addScorer').getOptions(addScorerDs.current);
        return [
          evalRespRule !== 'RATER' && (
            <Button icon="mode_edit" onClick={() => handleAssignScorer('batchEdit')}>
              {isEmpty(dataSet.selected)
                ? intl.get('sslm.common.button.batchEdit').d('批量编辑')
                : intl.get('sslm.common.button.selectedBatchEdit').d('勾选批量编辑')}
            </Button>
          ),
          evalRespRule === 'RATER' && (
            <Lov
              mode="button"
              name="addScorer"
              clearButton={false}
              dataSet={addScorerDs}
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
          evalRespRule === 'RATER' && 'delete',
          <CommonImport
            refreshButton
            prefixPatch={SRM_SSLM}
            businessObjectTemplateCode="SSLM.BATCH_IMPORT_EVAL_USER_C7N"
            buttonText={intl.get('hzero.common.button.import').d('导入')}
            args={{ evalHeaderId, evalRespRule, tenantId: organizationId }}
            successCallBack={() => {
              dataSet.query();
            }}
            buttonProps={{
              type: 'c7n-pro',
              funcType: 'flat',
              permissionList: [
                {
                  code: 'srm.partner.evaluation-manage.appraisal-purchaser.button.eval-resp-import',
                  type: 'button',
                  meaning: '评分人-导入',
                },
              ],
            }}
          />,
          ...commonBtns,
        ].filter(Boolean);
      } else {
        return [...commonBtns];
      }
    };
    const remoteBtnProps = {
      basicDs,
      evalStatus,
      evalHeaderId,
      evalRespRule,
      onRefresh,
      setLoading,
    };
    const buttons = remote
      ? remote.process(
          'SSLM_APPRAISAL_PURCHASER_DETAIL_PERSON_TABLE_BUTTONS',
          getButtons(),
          remoteBtnProps
        )
      : getButtons();

    const getColumns = () => {
      switch (evalRespRule) {
        case 'RATER': // 评分人规则为评分人时，只展示评分人
          return [
            {
              name: 'respLoginName',
            },
            {
              name: 'respUserName',
            },
            {
              name: 'respWeight',
              editor: isEdit,
              hidden: respCalMethod === 'AVERAGE',
            },
          ];
        default:
          return [
            // 供应商
            {
              name: 'supplierCompanyNum',
              width: 120,
              hidden: !['SUPPLIER', 'SUPPLIER+INDICATOR', 'SU+CA+IN', 'SU+IT+IN'].includes(
                evalRespRule
              ),
            },
            {
              name: 'supplierCompanyName',
              width: 200,
              hidden: !['SUPPLIER', 'SUPPLIER+INDICATOR', 'SU+CA+IN', 'SU+IT+IN'].includes(
                evalRespRule
              ),
            },
            // 品类
            {
              name: 'categoryCode',
              width: 120,
              hidden: !['CATEGORY', 'SU+CA+IN'].includes(evalRespRule),
            },
            {
              name: 'categoryName',
              width: 200,
              hidden: !['CATEGORY', 'SU+CA+IN'].includes(evalRespRule),
            },
            // 物料
            {
              name: 'itemCode',
              width: 120,
              hidden: !['ITEM', 'SU+IT+IN'].includes(evalRespRule),
            },
            {
              name: 'itemName',
              width: 200,
              hidden: !['ITEM', 'SU+IT+IN'].includes(evalRespRule),
            },
            // 指标
            {
              name: 'indicatorCode',
              width: 160,
              headerStyle: ['INDICATOR'].includes(evalRespRule) ? { paddingLeft: 48 } : {},
              hidden: !['INDICATOR', 'SUPPLIER+INDICATOR', 'SU+CA+IN', 'SU+IT+IN'].includes(
                evalRespRule
              ),
            },
            {
              name: 'indicatorName',
              width: 200,
              hidden: !['INDICATOR', 'SUPPLIER+INDICATOR', 'SU+CA+IN', 'SU+IT+IN'].includes(
                evalRespRule
              ),
            },
            // 分配规则
            {
              name: 'assignRule',
              width: 120,
              editor: record => !record.get('children') && isEdit,
            },
            {
              name: 'assignedScore',
              width: 100,
              hidden: !isEdit,
              renderer: ({ record }) =>
                record.get('children') ? (
                  '-'
                ) : (
                  <Button funcType="link" onClick={() => handleAssignScorer('edit', record)}>
                    {intl.get('sslm.common.model.message.assign').d('分配')}
                  </Button>
                ),
            },
            {
              name: 'scorer',
              width: 200,
            },
          ].filter(col => !col.hidden); // 过滤一遍，否则个性化设置会展示全量字段
      }
    };
    const remoteColumnsProps = {
      evalRespRule,
    };
    const columns = remote
      ? remote.process(
          'SSLM_APPRAISAL_PURCHASER_DETAIL_PERSON_COLUMNS',
          getColumns(),
          remoteColumnsProps
        )
      : getColumns();

    return (
      <Fragment>
        <Form
          columns={3}
          useWidthPercent
          dataSet={basicDs}
          style={{ marginBottom: 16 }}
          labelLayout={isEdit ? 'float' : 'vertical'}
          className={isEdit ? '' : 'c7n-pro-vertical-form-display'}
        >
          <FormField
            name="evalRespRule"
            isEdit={isEdit}
            clearButton={false}
            componentType="SELECT"
            onChange={handleRuleChange}
            optionsFilter={record => {
              const value = record.get('value');
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
            }}
          />
        </Form>
        {evalRespRule && (
          <SearchBarTable
            dataSet={dataSet}
            defaultRowExpanded
            buttons={buttons}
            columns={columns}
            key={scorerSearchCode[evalRespRule]}
            searchCode={scorerSearchCode[evalRespRule]}
            selectionMode={isEdit ? 'rowbox' : 'none'}
            mode={evalRespRule === 'INDICATOR' ? 'tree' : 'list'}
            style={{ maxHeight: sourceKey === 'VIEW_DETAIL' ? 300 : 500 }}
            customizedCode="SSLM.APPRAISAL_PURCHASER.APPRAISAL_PERSON_TABLE"
            searchBarConfig={{
              autoQuery: false,
              defaultExpand: false,
              closeFilterSelector: true,
            }}
          />
        )}
      </Fragment>
    );
  }
);

export default AppraisalPerson;
