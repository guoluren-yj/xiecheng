/**
 * 采购方评估 - 详情 - 评估信息
 * @Author: 杨一昊 yihao.yang@going-link.com
 * @Date: 2023-02-01 18:02:02
 * @Copyright (c) 2023 by ZhenYun, All Rights Reserved.
 */
import React, { Fragment, useMemo, useCallback, useState } from 'react';
import intl from 'utils/intl';
import { Popover, Tag } from 'choerodon-ui';
import { Button, Modal, DataSet, CheckBox, TextField, Icon } from 'choerodon-ui/pro';
import SearchBarTable from '_components/SearchBarTable';
import CommonImport from 'components/Import';
import ExcelExportPro from 'components/ExcelExportPro';
import { SRM_SSLM } from '_utils/config';
import { observer } from 'mobx-react-lite';
import { isEmpty, sumBy, isNil, isBoolean } from 'lodash';
import { yesOrNoRender } from 'utils/renderer';
import notification from 'utils/notification';
import { getResponse, getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

import {
  batchSaveGrader,
  saveScorer,
  weightSameJudge,
  transmitScorer,
  saveAssessmentInfo,
  batchCancel,
} from '@/services/purchaserEvaluationWorkbenchServices';
import { renderStatus } from '@/routes/components/utils';
import AttachmentModal from './AttachmentModal';
import ScoreNumber from './ScoreNumber';
import Score from './Score';
import Transfer from './Transfer';
import styles from '../index.less';
import IndicatorStatus from './IndicatorStatus';
import IndicatorMaintain from './IndicatorMaintain';
import AssignGrader from './AssignGrader'; // 分配评分人

import IndOptSelect from './IndOptSelect';
import { getScoreDs, getTransferDs, getAttachmentModalDS } from '../stores/details';

const organizationId = getCurrentOrganizationId();
let searchBarRef; // 筛选器ref

const AssessmentInfo = observer(
  ({
    remote,
    customizeTable,
    customizeCode,
    statusCustomizeCode,
    custLoading,
    dataSet,
    isEdit,
    pubEdit,
    dataSource = 'manage',
    averageFlag,
    assessmentPanelDs,
    basicInfoDs,
    evalHeaderId,
    searchCode = '',
    history,
    setLoading = () => {},
    customizeBtnGroupCode = '',
    showSelfEvaluation,
    customizeReadOnly = false,
    issuedDocumentFlag,
  }) => {
    const [allRowExpandFlag, setAllRowExpandFlag] = useState(true); // 全部展开标识

    const isDisabled = isEmpty(dataSet.selected);
    const {
      needFeedbackFlag,
      progressStatus,
      evalHeaderId: headerId,
      reportStatus,
      evalStatus,
      abandonFlag,
    } =
      dataSet?.parent?.current?.get([
        'progressStatus',
        'needFeedbackFlag',
        'evalHeaderId',
        'reportStatus',
        'evalStatus',
        'abandonFlag',
      ]) || {};

    const newIsEdit =
      dataSource !== 'manage'
        ? isEdit
        : pubEdit ||
          (isEdit &&
            ['EVAL_PREPARE', 'SUPPLIER_EVAL'].includes(progressStatus) &&
            ['NEW', 'REJECTED', 'APPROVED', 'FEEDBACK'].includes(reportStatus));

    // c7n表格全部展开-回调
    const expandAllClick = () => {
      if (dataSet) {
        dataSet.forEach(record => {
          Object.assign(record, { isExpanded: !allRowExpandFlag });
        });
      }
      setAllRowExpandFlag(!allRowExpandFlag);
    };

    // 评分人保存/批量分配评分人保存
    const handleSaveScore = async ({ batchFlag, scoreDs, record }) => {
      const flag = await scoreDs.validate();
      if (flag) {
        const scoreData = scoreDs.toJSONData().map(data => {
          return { ...data, respUserId: data.userId || data.respUserId };
        });
        if (isEmpty(scoreData)) {
          notification.warning({
            message: intl
              .get('sslm.purchaserEvaluationDetail.view.message.noScoreData')
              .d('请勾选行，已分配评分人！'),
          });
          return false;
        } else {
          const weightSum = sumBy(scoreData, i => i.respWeight);
          if (!averageFlag && weightSum !== 100) {
            notification.warning({
              message: intl
                .get('sslm.purchaserEvaluationDetail.view.message.weightSum')
                .d('请维护权重之和等于100'),
            });
            return false;
          } else {
            const batchSelectedRows = (dataSet?.selected || []).filter(selectedRecord =>
              isEmpty(selectedRecord.children)
            );
            const params = batchFlag
              ? {
                  evalLineIds: batchSelectedRows.map(i => i.get('evalLineId')),
                  siteEvalLineResps: scoreData,
                }
              : {
                  evalLineId: record?.get('evalLineId'),
                  tableValues: scoreData.map(({ evalLineRespId, ...i }) => ({
                    ...i,
                    evalLineId: record?.get('evalLineId'),
                  })),
                };
            const finalSaveFun = batchFlag ? batchSaveGrader : saveScorer;
            return finalSaveFun(params).then(res => {
              const resp = getResponse(res);
              if (resp) {
                notification.success();
                if (assessmentPanelDs) {
                  assessmentPanelDs.query();
                }
                if (dataSet) {
                  dataSet.query();
                  dataSet.unSelectAll();
                  dataSet.clearCachedSelected();
                }
                return true;
              } else {
                return false;
              }
            });
          }
        }
      } else {
        return false;
      }
    };

    // 打开评分人维护/批量分配评分人弹窗
    const handleOpenScorerModal = ({ listData = [], batchFlag, record }) => {
      const scoreDs = new DataSet(getScoreDs({ averageFlag, batchFlag, evalHeaderId: headerId }));
      if (assessmentPanelDs.dirty) {
        notification.warning({
          message: intl
            .get('sslm.purchaserEvaluationDetail.view.message.assessmentPanelTooltip')
            .d('存在评估小组有数据未保存,请先保存评估小组数据'),
        });
      } else {
        Modal.open({
          title: batchFlag
            ? intl.get('sslm.purchaserEvaluationDetail.modal.title.batchScorer').d('批量维护评分人')
            : intl.get('sslm.purchaserEvaluationDetail.modal.title.scorer').d('评分人'),
          drawer: true,
          style: { width: '742px' },
          okText: intl.get(`hzero.common.button.save`).d('保存'),
          cancelText: intl.get('hzero.common.button.cancel').d('取消'),
          onOk: () => handleSaveScore({ batchFlag, scoreDs, record }),
          okButton: newIsEdit,
          children: (
            <Score
              dataSet={scoreDs}
              dataSource={listData}
              batchFlag={batchFlag}
              newIsEdit={newIsEdit}
              averageFlag={averageFlag}
            />
          ),
        });
      }
    };

    const handleSave = async () => {
      const validateFlag = await dataSet.validate();
      if (validateFlag) {
        const siteEvalLineList = dataSet.toJSONData() || {};
        const saveHeaderData = basicInfoDs?.current.toJSONData() || {};
        saveAssessmentInfo({
          ...saveHeaderData,
          siteEvalLineList,
        }).then(res => {
          if (getResponse(res)) {
            dataSet.query();
            assessmentPanelDs.query();
          }
        });
      }
    };

    // 转交
    const handleOpenTransferModal = async () => {
      const transferDs = new DataSet(getTransferDs({ averageFlag }));
      const weightSameFlag = getResponse(
        await weightSameJudge({
          evalHeaderId,
          evalLineRespIds: dataSet.selected.map(i => i.data.evalLineRespId),
        })
      );
      Modal.open({
        title: intl.get('sslm.purchaserEvaluationDetail.button.header.transfer').d('转交'),
        drawer: true,
        style: { width: '742px' },
        children: (
          <Transfer
            dataSet={transferDs}
            averageFlag={averageFlag}
            weightSameFlag={weightSameFlag}
            currentRespWeight={dataSet.selected.map(i => i.data.respWeight)[0]}
          />
        ),
        onOk: () => {
          return new Promise(async resolve => {
            const validateFlag = await transferDs.validate();
            if (validateFlag) {
              const data = transferDs?.toJSONData();
              if (isEmpty(data)) {
                notification.warning({
                  message: intl
                    .get('sslm.siteInvestigateReport.view.message.addedAtLeastOne')
                    .d('至少新增一行数据'),
                });
                resolve(false);
              } else {
                const params = {
                  evalHeaderId,
                  evalLineRespIds: dataSet.selected.map(i => i.data.evalLineRespId),
                  siteEvalLineResps: data,
                  createMethod: 'eval_report',
                };
                transmitScorer(params)
                  .then(response => {
                    const res = getResponse(response);
                    if (isBoolean(res)) {
                      if (res === false) {
                        if (assessmentPanelDs) {
                          assessmentPanelDs.query();
                        }
                        if (dataSet) {
                          dataSet.query();
                          dataSet.unSelectAll();
                          dataSet.clearCachedSelected();
                        }
                      } else if (res === true) {
                        history.push('/sslm/purchaser-evaluation-workbench/list');
                      }
                      resolve();
                    }
                  })
                  .finally(() => {
                    resolve(false);
                  });
              }
            } else {
              resolve(false);
            }
          });
        },
      });
    };

    // 放弃评分
    const handleAbandonScore = () => {
      const selectedRows = dataSet.selected.map(record => record.toData());
      Modal.confirm({
        title: intl.get('hzero.common.message.confirm.title').d('提示'),
        children: intl
          .get('sslm.common.view.message.handleGiveUpScoreConfirm')
          .d('确认对勾选指标放弃评分？'),
        onOk: () => {
          return new Promise(resolve => {
            // 是否跨页全选
            const selectAllFlag = dataSet.isAllPageSelection;
            // 未选中的值
            const unCheckData = dataSet.unSelected.map(record => record.toData());
            // 获取查询条件
            const queryData = dataSet.queryDataSet?.current?.toJSONData();
            batchCancel({
              evalHeaderId,
              selectAllFlag: selectAllFlag ? 1 : 0,
              evalLineRespIds: selectAllFlag ? [] : selectedRows.map(i => i.evalLineRespId),
              siteEvalLineResps: selectedRows,
              unChooseEvalLineRespIds: unCheckData.map(n => n.evalLineRespId),
              ...queryData, // 查询条件
            })
              .then(response => {
                const res = getResponse(response);
                if (res) {
                  const { allCancelFlag } = res;
                  notification.success();
                  resolve();
                  if (allCancelFlag) {
                    history.push('/sslm/purchaser-evaluation-workbench/list');
                  } else {
                    dataSet.query(dataSet.currentPage, {}, false);
                  }
                }
              })
              .finally(() => {
                resolve(false);
              });
          });
        },
      });
    };

    /**
     * 指标维护
     * */
    const handleIndicatorMaintain = async () => {
      // 默认返回true,当返回false时走二开逻辑不走标准逻辑
      if (remote && remote.event) {
        const eventProps = {
          dataSet,
          basicInfoDs,
        };
        const res = await remote.event.fireEvent('cuxIndicatorMaintain', eventProps);
        if (!res) {
          return;
        }
      }
      // eslint-disable-next-line no-unused-vars
      let indicatorModal;
      // eslint-disable-next-line no-unused-vars
      let indicatorMaintain;
      // eslint-disable-next-line no-unused-vars, prefer-const
      indicatorModal = Modal.open({
        key: Modal.key(),
        title: intl
          .get('sslm.purchaserEvaluationDetail.view.button.indicatorMaintain')
          .d('指标维护'),
        style: { width: 900 },
        closable: true,
        destroyOnClose: true,
        drawer: true,
        footer: null,
        afterClose: () => {
          dataSet.query(null, null, false);
        },
        children: (
          <IndicatorMaintain
            onRef={ref => {
              indicatorMaintain = ref;
            }}
            evalHeaderId={headerId}
            modal={indicatorModal}
            infoDs={dataSet}
            custLoading={custLoading}
            customizeTable={customizeTable}
          />
        ),
      });
    };

    // 导出参数
    const handleParams = useCallback(() => {
      const queryData = dataSet.queryDataSet?.current?.toData();

      const queryParams = filterNullValueObject(queryData);
      const { __dirty, ...others } = queryParams;
      return {
        ...others,
      };
    }, []);

    // 附件上传回调
    const handleAttamentModal = useCallback((record, attCustomizeCode = '') => {
      const evalLineId = record.get('evalLineId');
      const attamentModalDs = new DataSet(getAttachmentModalDS(evalLineId, attCustomizeCode));
      Modal.open({
        key: Modal.key(),
        drawer: true,
        style: { width: 742 },
        cancelButton: false,
        okText: intl.get('hzero.common.button.close').d('关闭'),
        title: intl.get('hzero.common.upload.modal.title').d('附件'),
        children: (
          <AttachmentModal
            dataSet={attamentModalDs}
            itemLineRecord={record}
            customizeCode={attCustomizeCode}
            customizeTable={customizeTable}
            custLoading={custLoading}
          />
        ),
      });
    }, []);

    // 是树形结构的情况下才展示展开收起按钮
    const expandFlag = dataSet.some(
      record => record.get('parentId') && +record.get('parentId') !== -1
    );

    const btns = {
      score: newIsEdit
        ? [
            <Button
              name="transfer"
              icon="recover"
              onClick={handleOpenTransferModal}
              disabled={isDisabled}
              funcType="flat"
            >
              {intl.get('sslm.purchaserEvaluationDetail.button.header.transfer').d('转交')}
            </Button>,
            <Button
              name="giveUpScore"
              icon="cancel"
              funcType="flat"
              disabled={isDisabled}
              onClick={handleAbandonScore}
              style={{ display: abandonFlag ? 'inline-block' : 'none' }}
            >
              {intl.get(`sslm.common.view.button.giveUpScore`).d('放弃评分')}
            </Button>,
            <ExcelExportPro
              name="supplierRatingExport"
              allBody
              method="POST"
              buttonText={intl.get('hzero.common.button.export').d('导出')}
              templateCode="SRM_C_SRM_SSLM_REPORT_EVAL_RESP"
              queryParams={() => handleParams()}
              requestUrl={`${SRM_SSLM}/v1/${organizationId}/site-eval-lines/${headerId}/eval-report/evaluating/export`}
              otherButtonProps={{
                funcType: 'flat',
              }}
            />,
            <CommonImport
              name="supplierRatingImport"
              businessObjectTemplateCode="SSLM.BATCH_IMPORT_REPORT_EVAL_LINE_SCORE"
              prefixPatch={SRM_SSLM}
              refreshButton
              buttonText={intl.get('hzero.common.button.import').d('导入')}
              successCallBack={() => {
                dataSet.query();
              }}
              buttonProps={{
                funcType: 'flat',
              }}
              args={{ evalHeaderId: headerId, tenantId: organizationId }}
            />,
            <ExcelExportPro
              allBody
              method="POST"
              name="exportSupportCustomize"
              buttonText={intl
                .get('sslm.common.button.exportSupportCustomize')
                .d('导出(支持个性化)')}
              templateCode="SRM_C_SRM_SSLM_REPORT_EVAL_RESP_NEW"
              queryParams={() => handleParams()}
              requestUrl={`${SRM_SSLM}/v1/${organizationId}/site-eval-lines/${headerId}/eval-report/evaluating/export/new`}
              otherButtonProps={{ funcType: 'flat' }}
            />,
            <CommonImport
              refreshButton
              prefixPatch={SRM_SSLM}
              name="importSupportCustomize"
              businessObjectTemplateCode="SSLM.BATCH_IMPORT_REPORT_EVAL_LINE_SCORE_NEW"
              buttonText={intl
                .get('sslm.common.button.importSupportCustomize')
                .d('导入(支持个性化)')}
              successCallBack={() => {
                dataSet.query();
              }}
              buttonProps={{ funcType: 'flat' }}
              args={{ evalHeaderId: headerId, tenantId: organizationId }}
            />,
          ]
        : [],
      feedback: [
        newIsEdit && (
          <ExcelExportPro
            name="supSelfEvaluateExport"
            allBody
            method="POST"
            buttonText={intl.get('hzero.common.button.export').d('导出')}
            templateCode="SRM_C_SRM_SSLM_SELF_REPORT_EVAL_LINE"
            queryParams={() => handleParams()}
            requestUrl={`${SRM_SSLM}/v1/${organizationId}/site-eval-lines/${headerId}/eval-report/self-export`}
            otherButtonProps={{
              funcType: 'flat',
            }}
          />
        ),
        newIsEdit && (
          <CommonImport
            name="supSelfEvaluateImport"
            businessObjectTemplateCode="SSLM.BATCH_IMPORT_SELF_REPORT_EVAL_LINE"
            prefixPatch={SRM_SSLM}
            refreshButton
            buttonText={intl.get('hzero.common.button.import').d('导入')}
            successCallBack={() => {
              dataSet.query();
            }}
            buttonProps={{
              funcType: 'flat',
            }}
            args={{ evalHeaderId: headerId, tenantId: organizationId }}
          />
        ),
        expandFlag && (
          <Button
            name="expand"
            icon={allRowExpandFlag ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
            onClick={() => expandAllClick()}
            funcType="flat"
          >
            {allRowExpandFlag
              ? intl.get('hzero.common.button.collapseAll').d('全部收起')
              : intl.get('hzero.common.button.expandAll').d('全部展开')}
          </Button>
        ),
      ].filter(Boolean),
      manage: [
        newIsEdit && (
          <Button
            name="indicatorMaintain"
            icon="edit_note"
            onClick={handleIndicatorMaintain}
            funcType="flat"
          >
            {intl
              .get('sslm.purchaserEvaluationDetail.button.header.indexMaintenance')
              .d('指标维护')}
          </Button>
        ),
        newIsEdit && (
          <Button
            name="assignRatersInBulk"
            icon="checklist"
            onClick={() => handleOpenScorerModal({ batchFlag: 1 })}
            disabled={isDisabled}
            funcType="flat"
          >
            {intl
              .get('sslm.purchaserEvaluationDetail.button.header.assignRatersInBulk')
              .d('批量分配评分人')}
          </Button>
        ),
        newIsEdit && (
          <Button name="save" icon="save" onClick={() => handleSave()} funcType="flat">
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
        ),
        expandFlag && (
          <Button
            name="expand"
            icon={allRowExpandFlag ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
            onClick={() => expandAllClick()}
            funcType="flat"
          >
            {allRowExpandFlag
              ? intl.get('hzero.common.button.collapseAll').d('全部收起')
              : intl.get('hzero.common.button.expandAll').d('全部展开')}
          </Button>
        ),
      ].filter(Boolean),
    };
    const buttonsObj = remote
      ? remote.process('SSLM.PURCHASER_EVALUATION_WORKBENCH_DETAILS_ASSESSMENT_INFO_BTNS', btns, {
          dataSet,
          newIsEdit,
          dataSource,
        })
      : btns;

    const columns = useMemo(() => {
      switch (dataSource) {
        // 采购方评估工作台 -评估报告
        case 'manage':
          return [
            { name: 'indicatorCode', width: 200 },
            { name: 'indicatorName', width: 300 },
            { name: 'scoreTypeMeaning', width: 100 },
            { name: 'evalStandard', width: 200 },
            {
              name: 'indicatorTypeMeaning',
              width: 100,
            },
            {
              name: 'finalLevelDesc',
              width: 100,
            },
            {
              name: 'supplierEvalFlag',
              width: 150,
              renderer: ({ value, record }) => {
                return newIsEdit &&
                  needFeedbackFlag &&
                  ['NEW', 'NEW_APPROVALED'].includes(evalStatus) ? (
                  <CheckBox record={record} name="supplierEvalFlag" />
                ) : (
                  yesOrNoRender(value)
                );
              },
              hidden: !needFeedbackFlag,
            },
            {
              name: 'supplierScore',
              width: 150,
              align: 'right',
              hidden:
                !needFeedbackFlag ||
                ['EVAL_PREPARE'].includes(progressStatus) ||
                showSelfEvaluation,
            },
            {
              name: 'selfSupplierScore',
              width: 150,
              align: 'right',
              hidden: !showSelfEvaluation,
            },
            {
              name: 'selfIsStandard',
              width: 150,
              hidden: !showSelfEvaluation,
              renderer: ({ value }) => (isNil(value) ? '-' : yesOrNoRender(value)),
            },
            {
              name: 'selfIsVeto',
              width: 150,
              hidden: !showSelfEvaluation,
              renderer: ({ value }) => (isNil(value) ? '-' : yesOrNoRender(value)),
            },
            {
              name: 'selfIndOptId',
              width: 150,
              hidden: !showSelfEvaluation,
              renderer: ({ record }) => {
                const selfIndOptName = record.get('selfIndOptName');
                return selfIndOptName;
              },
            },
            {
              name: 'supplierRemarks',
              width: 150,
              hidden: !needFeedbackFlag || ['EVAL_PREPARE'].includes(progressStatus),
            },
            {
              name: 'attachmentUuid',
              width: 150,
              hidden: !needFeedbackFlag || ['EVAL_PREPARE'].includes(progressStatus),
            },
            { name: 'evalWeight', width: 100, align: 'right' },
            {
              name: 'finalScore',
              width: 100,
              hidden: !['EVAL_RESULT', 'EVAL_COMPLETE'].includes(progressStatus), // EVAL_RESULT：评估结果确认 ｜ EVAL_COMPLETE：评估完成
              align: 'right',
              renderer: ({ record }) => {
                return <ScoreNumber record={record} fieldCode="finalScore" />;
              },
            },
            {
              name: 'evalResps',
              hidden: !newIsEdit,
              width: 490,
              className: styles['eval-resps-td'],
              renderer: ({ record, name }) => {
                // 评分信息
                const { siteEvalLineResps, leafFlag, scoreType } =
                  record?.get(['siteEvalLineResps', 'leafFlag', 'scoreType']) || {};
                return scoreType === 'SYSTEM' ? (
                  intl.get('sslm.common.modal.grade.systemRate').d('系统评分')
                ) : !leafFlag ? (
                  '-'
                ) : (
                  <AssignGrader
                    name={name}
                    record={record}
                    newIsEdit={newIsEdit}
                    averageFlag={averageFlag}
                    dataSource={siteEvalLineResps}
                    assessmentPanelDs={assessmentPanelDs}
                  />
                );
              },
            },
            {
              name: 'completeFlag',
              width: 100,
              align: 'left',
              renderer: ({ value, name, record }) => {
                const { leafFlag, scoreType, evalResps = [], indicatorType } = record.get([
                  'leafFlag',
                  'scoreType',
                  'evalResps',
                  'indicatorType',
                ]);
                return !leafFlag ? (
                  renderStatus({ value, name, record })
                ) : scoreType === 'SYSTEM' ? ( // 顶级指标和系统评分不展示
                  '-'
                ) : (
                  <Popover
                    overlayClassName={styles['indicator-status-popover']}
                    content={
                      <IndicatorStatus
                        dataSource={evalResps}
                        indicatorType={indicatorType}
                        customizeTable={customizeTable}
                        customizeCode={statusCustomizeCode}
                      />
                    }
                    placement="bottomLeft"
                  >
                    <span style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      {!isNil(value)
                        ? renderStatus({ value, name, record, iconType: 'expand_more' })
                        : '-'}
                    </span>
                  </Popover>
                );
              },
            },
            {
              name: 'respRemarks',
              width: 150,
            },
            {
              name: 'summaryRatersAttachment',
              width: 150,
              renderer: ({ record }) => {
                const { respScoreAttachmentCount } = record.get(['respScoreAttachmentCount']) || {};
                const attachmentCount = respScoreAttachmentCount || 0;
                return (
                  <a onClick={() => handleAttamentModal(record)}>
                    <Icon
                      type="attach_file"
                      style={{ fontSize: 14, fontWeight: 400, marginRight: 5 }}
                    />
                    <span>{intl.get('hzero.common.upload.view').d('查看附件')}</span>
                    <span>{`(${attachmentCount})`}</span>
                  </a>
                );
              },
            },
            {
              name: 'parentIndicatorCode',
              width: 120,
            },
            {
              name: 'parentIndicatorName',
              width: 150,
            },
            {
              name: 'superIndicatorCode',
              width: 150,
            },
            {
              name: 'superIndicatorName',
              width: 150,
            },
          ];
        // 采购方评估工作台 -报告打分
        case 'score':
          return [
            {
              name: 'completeFlag',
              width: 100,
              align: 'left',
              renderer: ({ value, name, record }) => {
                const { completeFlagMeaning } = record.get(['completeFlagMeaning']);
                if (+value) {
                  return renderStatus({ value, name, record });
                } else {
                  return (
                    completeFlagMeaning && (
                      <Tag color="yellow" style={{ border: 'none' }}>
                        {completeFlagMeaning}
                      </Tag>
                    )
                  );
                }
              },
            },
            { name: 'indicatorCode', width: 200 },
            { name: 'indicatorName', width: 100 },
            { name: 'evalStandard', width: 200 },
            {
              name: 'indicatorTypeMeaning',
              width: 120,
            },
            {
              name: 'supplierEvalFlag',
              width: 150,
              renderer: ({ value }) => yesOrNoRender(value),
              hidden: !needFeedbackFlag,
            },
            {
              name: 'supplierScore',
              width: 150,
              align: 'right',
              hidden: !needFeedbackFlag || showSelfEvaluation,
            },
            {
              name: 'selfSupplierScore',
              width: 150,
              align: 'right',
              hidden: !showSelfEvaluation,
            },
            {
              name: 'selfIsStandard',
              width: 150,
              hidden: !showSelfEvaluation,
              renderer: ({ value }) => (isNil(value) ? '-' : yesOrNoRender(value)),
            },
            {
              name: 'selfIsVeto',
              width: 150,
              hidden: !showSelfEvaluation,
              renderer: ({ value }) => (isNil(value) ? '-' : yesOrNoRender(value)),
            },
            {
              name: 'selfIndOptId',
              width: 150,
              hidden: !showSelfEvaluation,
              renderer: ({ record }) => {
                const selfIndOptName = record.get('selfIndOptName');
                return selfIndOptName;
              },
            },
            { name: 'supplierRemarks', width: 150, hidden: !needFeedbackFlag },
            {
              name: 'attachmentUuid',
              width: 150,
              hidden: !needFeedbackFlag,
            },
            { name: 'respWeight', width: 150 },
            {
              name: 'score',
              width: 120,
              lock: 'right',
              className: styles['score-number-form'],
              renderer: ({ value, record }) => {
                const { completeFlag, indicatorType } = record.get([
                  'completeFlag',
                  'indicatorType',
                ]);
                const isEditFlag = newIsEdit && completeFlag !== 4 && indicatorType === 'SCORE';
                return isEditFlag ? (
                  <ScoreNumber record={record} fieldCode="score" editable={isEditFlag} />
                ) : (
                  value || '-'
                );
              },
            },
            { name: 'scoreFrom', width: 80 },
            { name: 'scoreTo', width: 80 },
            { name: 'defaultScore', align: 'right', width: 80 },
            {
              name: 'isStandard',
              width: 120,
              editor: record => {
                const { completeFlag, indicatorType } = record.get([
                  'completeFlag',
                  'indicatorType',
                ]);
                return newIsEdit && completeFlag !== 4 && indicatorType === 'TICK';
              },
              renderer: ({ value }) => (isNil(value) ? '-' : yesOrNoRender(value)),
              lock: 'right',
            },
            {
              name: 'isVeto',
              width: 120,
              editor: record => {
                const { completeFlag, indicatorType } = record.get([
                  'completeFlag',
                  'indicatorType',
                ]);
                return newIsEdit && completeFlag !== 4 && indicatorType === 'VETO';
              },
              renderer: ({ value }) => (isNil(value) ? '-' : yesOrNoRender(value)),
              lock: 'right',
            },
            {
              name: 'indOptLov',
              width: 120,
              lock: 'right',
              className: styles['eval-resps-td'],
              renderer: ({ record, name }) => {
                const { completeFlag, indOptName, indicatorType } = record.get([
                  'completeFlag',
                  'indOptName',
                  'indicatorType',
                ]);
                return newIsEdit && completeFlag !== 4 && indicatorType === 'OPT' ? (
                  <IndOptSelect name={name} record={record} />
                ) : (
                  indOptName || '-'
                );
              },
            },
            { name: 'backReason', width: 120 },
            { name: 'transformReason', width: 150 },
            {
              name: 'scoreAttachmentUuid',
              width: 150,
              editor: record => {
                const { completeFlag } = record.get(['completeFlag']);
                return newIsEdit && completeFlag !== 4;
              },
            },
            {
              name: 'respRemarks',
              width: 150,
              editor: record => {
                const { completeFlag } = record.get(['completeFlag']);
                return newIsEdit && completeFlag !== 4;
              },
            },
            {
              name: 'parentIndicatorCode',
              width: 120,
            },
            {
              name: 'parentIndicatorName',
              width: 150,
            },
            {
              name: 'superIndicatorCode',
              width: 150,
            },
            {
              name: 'superIndicatorName',
              width: 150,
            },
          ];
        // 销售方评估工作台 -评估报告
        case 'feedback':
          return [
            {
              name: 'indicatorCode',
              width: 200,
              headerStyle: { paddingLeft: dataSource !== 'score' ? 48 : 0 },
            },
            { name: 'indicatorName', width: 150 },
            { name: 'scoreTypeMeaning', width: 150 },
            { name: 'evalStandard', width: 200 },
            { name: 'supplierEvalFlag', width: 150, renderer: ({ value }) => yesOrNoRender(value) },
            {
              name: 'supplierScore',
              width: 150,
              hidden: showSelfEvaluation,
              editor: newIsEdit,
            },
            {
              name: 'selfSupplierScore',
              width: 150,
              hidden: !showSelfEvaluation,
              editor: record => {
                const { indicatorType, scoreType } = record?.get(['indicatorType', 'scoreType']);
                const editorFlag =
                  newIsEdit && (indicatorType === 'SCORE' || scoreType === 'SYSTEM');
                return editorFlag;
              },
            },
            {
              name: 'selfIsStandard',
              width: 150,
              hidden: !showSelfEvaluation,
              editor: record => {
                const { indicatorType } = record?.get(['indicatorType']);
                const editorFlag = newIsEdit && indicatorType === 'TICK';
                return editorFlag;
              },
            },
            {
              name: 'selfIsVeto',
              width: 150,
              hidden: !showSelfEvaluation,
              editor: record => {
                const { indicatorType } = record?.get(['indicatorType']);
                const editorFlag = newIsEdit && indicatorType === 'VETO';
                return editorFlag;
              },
            },
            {
              name: 'selfIndOptId',
              width: 150,
              hidden: !showSelfEvaluation,
              editor: record => {
                const { indicatorType } = record?.get(['indicatorType']);
                const editorFlag = newIsEdit && indicatorType === 'OPT';
                return editorFlag;
              },
            },
            { name: 'supplierRemarks', width: 150, editor: newIsEdit },
            {
              name: 'attachmentUuid',
              width: 150,
              editor: newIsEdit,
            },
            { name: 'scoreFrom', width: 150 },
            { name: 'scoreTo', width: 150 },
            issuedDocumentFlag && { name: 'finalScore', width: 120 },
            issuedDocumentFlag && {
              name: 'completeFlag',
              width: 100,
              align: 'left',
              renderer: ({ value, name, record }) => {
                const {
                  leafFlag,
                  scoreType,
                  evalResps = [],
                  indicatorType,
                  completeFlagMeaning,
                } = record.get([
                  'leafFlag',
                  'scoreType',
                  'evalResps',
                  'indicatorType',
                  'completeFlagMeaning',
                ]);
                return !leafFlag || scoreType === 'SYSTEM' ? ( // 顶级指标和系统评分不展示
                  '-'
                ) : (
                  <Popover
                    overlayClassName={styles['indicator-status-popover']}
                    content={
                      <IndicatorStatus
                        dataSource={evalResps}
                        indicatorType={indicatorType}
                        customizeTable={customizeTable}
                        customizeCode={statusCustomizeCode}
                      />
                    }
                    placement="bottomLeft"
                  >
                    <span style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      {+value ? (
                        <span>
                          {renderStatus({ value, name, record, iconType: 'expand_more' })}
                        </span>
                      ) : completeFlagMeaning ? (
                        <Tag color="yellow" style={{ border: 'none' }}>
                          {completeFlagMeaning}
                        </Tag>
                      ) : (
                        '-'
                      )}
                    </span>
                  </Popover>
                );
              },
            },
            issuedDocumentFlag && {
              name: 'summaryRatersAttachment',
              width: 150,
              renderer: ({ record }) => {
                const { respScoreAttachmentCount } = record.get(['respScoreAttachmentCount']) || {};
                const attachmentCount = respScoreAttachmentCount || 0;
                return (
                  <a
                    onClick={() =>
                      handleAttamentModal(
                        record,
                        'SSLM.SUPPLIER_ASSESS_DETAIL.ASSESSMENT_TABLE_PUBLISHED.ATTACHMENT'
                      )
                    }
                  >
                    <Icon
                      type="attach_file"
                      style={{ fontSize: 14, fontWeight: 400, marginRight: 5 }}
                    />
                    <span>{intl.get('hzero.common.upload.view').d('查看附件')}</span>
                    <span>{`(${attachmentCount})`}</span>
                  </a>
                );
              },
            },
          ].filter(Boolean);
        default:
          return [];
      }
    }, [dataSource, newIsEdit, needFeedbackFlag, progressStatus, showSelfEvaluation]);

    // 筛选器左侧渲染
    const renderLeftSearchBar = () => {
      return (
        <TextField
          clearButton
          style={{ width: 280 }}
          valueChangeAction="blur"
          onChange={value => {
            // eslint-disable-next-line no-unused-expressions
            dataSet.queryDataSet?.current?.set({
              indicatorCode: value,
              indicatorName: value,
            });
            dataSet.query();
          }}
          value={dataSet.queryDataSet?.current?.get('indicatorCode')}
          placeholder={intl
            .get('sslm.purchaserEvaluationDetail.view.message.estimate')
            .d('请输入评估项目代码、评估项目名称查询')}
        />
      );
    };

    // 查询
    const handleQuery = queryProps => {
      const { params } = queryProps;
      if (dataSet.queryDataSet?.current) {
        const clearParams = {}; // 清理
        const dataObj = dataSet.queryDataSet.current.toData();
        if (dataObj) {
          for (const key in dataObj) {
            if (!['indicatorCode', 'indicatorName'].includes(key)) {
              // 排除掉自定义的查询条件
              if (!Object.prototype.hasOwnProperty.call(params, key)) {
                clearParams[key] = undefined;
              }
            }
          }
        }
        dataSet.queryDataSet.current.set({
          ...params,
          ...clearParams,
        });
        dataSet.query();
      } else {
        // 解决设置默认值查询不生效问题
        searchBarRef.handleQuery(true);
      }
    };

    // 清空、重置回调
    const clearValues = () => {
      // eslint-disable-next-line no-unused-expressions
      dataSet.queryDataSet?.current.reset();
    };

    const searchBarConfigProps =
      dataSource !== 'score'
        ? {
            left: {
              render: () => renderLeftSearchBar(),
            },
            onQuery: queryProps => handleQuery(queryProps),
            onReset: () => clearValues(),
            onClear: () => clearValues(),
          }
        : {};
    const remoteColumns = remote
      ? remote.process('SSLM.PURCHASER_ASSESS_DETAIL_TABLE_COLUMNS', columns, {
          dataSet,
          dataSource,
          setLoading,
        })
      : columns;

    return (
      <Fragment>
        {customizeTable(
          {
            code: customizeCode,
            buttonCode: customizeBtnGroupCode,
            readOnly: customizeReadOnly,
          },
          <SearchBarTable
            searchCode={searchCode}
            custLoading={custLoading}
            buttons={buttonsObj[dataSource]}
            columns={remoteColumns}
            dataSet={dataSet}
            defaultRowExpanded
            showAllPageSelectionButton={dataSource === 'score'}
            {...(dataSource !== 'score' ? { mode: 'tree' } : {})}
            selectionMode={newIsEdit ? 'rowbox' : 'none'}
            virtual
            virtualCell
            searchBarRef={ref => {
              searchBarRef = ref;
            }}
            searchBarConfig={{
              autoQuery: true,
              closeFilterSelector: true,
              expandable: !isEmpty(buttonsObj[dataSource]),
              expand: !isEmpty(buttonsObj[dataSource]),
              ...searchBarConfigProps,
            }}
            style={{
              maxHeight: 464,
            }}
          />
        )}
      </Fragment>
    );
  }
);

export default AssessmentInfo;
