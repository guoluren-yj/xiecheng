/*
 * @Date: 2023-10-18 16:25:24
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { isNil, forEach } from 'lodash';
import React, { Fragment, useCallback } from 'react';
import { Modal, DataSet, Tooltip, Icon } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { observer } from 'mobx-react-lite';
import { yesOrNoRender } from 'utils/renderer';
import notification from 'utils/notification';
import CommonImport from 'components/Import';
import ExcelExportPro from 'components/ExcelExportPro';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';

import GeneralForm from '@/routes/components/GeneralForm';
import { saveScoreLevel, saveScoreReminder } from '@/services/indicatorTemplateDefineService';

import ScoreLevel from './ScoreLevel';
import ScoreReminder from './ScoreReminder';
import { getTotalPointsLevelDs, getIndicatorScoreLevelDs } from '../../stores/getScoreLevelDS';
import {
  getTotalPointsReminderDs,
  getIndicatorScoreReminderDs,
} from '../../stores/getScoreReminderDS';

const ScoreResult = observer(({ dataSet, isEdit, evalTplId, evalTplType }) => {
  // 新建指标回调
  const handleCreateIndicator = ({ selectedRows, resolve, dataSet: indicatorDs }) => {
    const newList = selectedRows.map(item => {
      const { scoreFrom, scoreTo, ...rest } = item;
      return {
        ...rest,
        indicatorScoreFrom: scoreFrom,
        indicatorScoreTo: scoreTo,
      };
    });
    forEach(newList, data => {
      indicatorDs.create(data, 0);
    });
    resolve();
  };

  // 定义评分等级
  const handleScoreLevel = useCallback(() => {
    const totalPointsDs = new DataSet(getTotalPointsLevelDs({ evalTplId }));
    const indicatorScoresDs = new DataSet(getIndicatorScoreLevelDs({ evalTplId }));
    Modal.open({
      key: Modal.key(),
      drawer: true,
      style: { width: 1090 },
      okText: isEdit
        ? intl.get(`hzero.common.button.sure`).d('确定')
        : intl.get('hzero.common.button.close').d('关闭'),
      cancelText: intl.get('hzero.common.button.close').d('关闭'),
      title: intl.get('sslm.scoreLevel.view.message.title').d('评分等级定义'),
      children: (
        <ScoreLevel
          isEdit={isEdit}
          evalTplId={evalTplId}
          evalTplType={evalTplType}
          totalPointsDs={totalPointsDs}
          indicatorScoresDs={indicatorScoresDs}
          handleCreateIndicator={handleCreateIndicator}
        />
      ),
      footer: (okBtn, cancelBtn) => {
        return (
          <div>
            {okBtn}
            {isEdit && (
              <CommonImport
                refreshButton
                prefixPatch={SRM_SSLM}
                businessObjectTemplateCode="SRM_C_SRM_SSLM_KPI_EVAL_TPL_LEVEL"
                buttonText={intl.get('hzero.common.button.import').d('导入')}
                buttonProps={{ icon: '' }}
                args={{ evalTplId }}
                successCallBack={() => {
                  totalPointsDs.query();
                  indicatorScoresDs.query();
                }}
              />
            )}
            {isEdit && (
              <ExcelExportPro
                requestUrl={`${SRM_SSLM}/v1/${getCurrentOrganizationId()}/eval-templates/${evalTplId}/export`}
                templateCode="SRM_C_SRM_SSLM_KPI_EVAL_TPL_LEVEL"
                buttonText={intl.get('hzero.common.button.export').d('导出')}
                otherButtonProps={{ icon: '' }}
              />
            )}
            {isEdit && cancelBtn}
          </div>
        );
      },
      onOk: () => {
        if (isEdit) {
          return new Promise(async resolve => {
            const validateFlag =
              (await totalPointsDs.validate()) && (await indicatorScoresDs.validate());
            if (validateFlag) {
              await saveScoreLevel({
                evalTplId,
                collectLevelList: totalPointsDs.toJSONData(),
                indLevelList: indicatorScoresDs.toJSONData(),
              }).then(response => {
                const res = getResponse(response);
                if (res) {
                  notification.success();
                  totalPointsDs.query();
                  indicatorScoresDs.query();
                }
              });
            }
            resolve(false);
          });
        }
      },
    });
  }, [isEdit, evalTplId]);

  // 分数提醒设置
  const handleScoreReminder = useCallback(() => {
    const totalPointsDs = new DataSet(getTotalPointsReminderDs({ evalTplId }));
    const indicatorScoresDs = new DataSet(getIndicatorScoreReminderDs({ evalTplId }));
    Modal.open({
      key: Modal.key(),
      drawer: true,
      style: { width: 742 },
      cancelButton: isEdit,
      okText: isEdit
        ? intl.get(`hzero.common.button.sure`).d('确定')
        : intl.get('hzero.common.button.close').d('关闭'),
      title: intl.get('sslm.indicatorTemplate.model.scoreResult.scoreReminder').d('分数提醒设置'),
      children: (
        <ScoreReminder
          isEdit={isEdit}
          evalTplId={evalTplId}
          totalPointsDs={totalPointsDs}
          indicatorScoresDs={indicatorScoresDs}
          handleCreateIndicator={handleCreateIndicator}
        />
      ),
      onOk: () => {
        return new Promise(async resolve => {
          if (isEdit) {
            const validateFlag =
              (await totalPointsDs.validate()) && (await indicatorScoresDs.validate());
            if (validateFlag) {
              saveScoreReminder({
                evalTplId,
                collectKpiEvalTplIndReminds: totalPointsDs.toJSONData(),
                indKpiEvalTplIndReminds: indicatorScoresDs.toJSONData(),
              })
                .then(response => {
                  const res = getResponse(response);
                  if (res) {
                    notification.success();
                    resolve();
                  }
                })
                .finally(() => {
                  resolve(false);
                });
            } else {
              resolve(false);
            }
          } else {
            resolve();
          }
        });
      },
    });
  }, [isEdit, evalTplId]);

  // 考评档案排名方式 - 解释说明
  const sortMethodMsg = {
    DENSE: intl
      .get(`sslm.supplierKpiIndicator.message.tooltip.dense`)
      .d('平局/并列具有相同的排名，但不会跳过下一个值，比如1,2,2,3,4'),
    STANDARD: intl
      .get(`sslm.supplierKpiIndicator.message.tooltip.standard`)
      .d('平局/并列具有相同的排名，并且跳过下一个排名值，比如1,2,2,4,5'),
  };

  // 渲染考评档案排名方式
  const renderSortMethod = ({ text, value }) => {
    return (
      <Fragment>
        {text}
        <Tooltip title={sortMethodMsg[value]}>
          <Icon
            type="help"
            style={{ fontSize: 14, color: '#868d9c', marginLeft: 8, marginTop: -3 }}
          />
        </Tooltip>
      </Fragment>
    );
  };

  const fields = [
    {
      name: 'allowCheckFlag',
      componentType: 'CHECKBOX',
      hidden: evalTplType === 'GYSKP_XC',
      renderer: ({ value }) => yesOrNoRender(value),
    },
    {
      name: 'modifyScoreRange',
      componentType: 'SELECT',
      hidden: !dataSet.current?.get('allowCheckFlag') || evalTplType === 'GYSKP_XC',
    },
    {
      name: 'evalSortMethod',
      componentType: 'SELECT',
      hidden: evalTplType === 'GYSKP_XC',
      optionRenderer: renderSortMethod,
      renderer: renderSortMethod,
    },
    {
      name: 'autoPushVendorFlag',
      componentType: 'CHECKBOX',
      hidden: evalTplType === 'GYSKP_XC',
      renderer: ({ value }) => (isNil(value) ? '-' : yesOrNoRender(value)),
    },
    {
      name: 'allowAppealFlag',
      componentType: 'CHECKBOX',
      hidden: evalTplType === 'GYSKP_XC',
      renderer: ({ value }) => (isNil(value) ? '-' : yesOrNoRender(value)),
    },
    {
      name: 'assignScoreLevel',
      isEdit: false,
      label: (
        <span style={{ fontWeight: 400 }}>
          {intl.get(`sslm.evaluationTemplate.view.button.assignScoreLevel`).d('定义评分等级')}
        </span>
      ),
      renderer: () => (
        <a onClick={handleScoreLevel} style={{ fontWeight: isEdit ? 400 : 500 }}>
          {isEdit
            ? intl.get('hzero.common.button.edit').d('编辑')
            : intl.get('hzero.common.button.view').d('查看')}
        </a>
      ),
    },
    {
      name: 'scoreReminder',
      isEdit: false,
      hidden: evalTplType === 'GYSKP_XC',
      label: (
        <span style={{ fontWeight: 400 }}>
          {intl.get('sslm.indicatorTemplate.model.scoreResult.scoreReminder').d('分数提醒设置')}
        </span>
      ),
      renderer: () => (
        <a onClick={handleScoreReminder} style={{ fontWeight: isEdit ? 400 : 500 }}>
          {isEdit
            ? intl.get('hzero.common.button.edit').d('编辑')
            : intl.get('hzero.common.button.view').d('查看')}
        </a>
      ),
    },
  ];

  return <GeneralForm dataSet={dataSet} isEdit={isEdit} fields={fields} />;
});

export default ScoreResult;
