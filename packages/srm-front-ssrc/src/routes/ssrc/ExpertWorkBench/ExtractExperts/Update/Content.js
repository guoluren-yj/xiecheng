import React, { useMemo, useCallback, useEffect } from 'react';
import { Table, useDataSet, NumberField, Select, Spin, Lov } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import notification from 'utils/notification';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { noop, throttle, isEmpty, isNil } from 'lodash';

import CollapseForm from '_components/CollapseForm';
import { getResponse, filterNullValueObject } from 'utils/utils';
import intl from 'utils/intl';

import { TooltipButtonPro } from '@/routes/components/TooltipButton';
import { getErrors } from '@/routes/ssrc/RFSupplierQuotation/Quotation/utils/getDSError';
import { randomExtract, sendExtract, submitExtract } from '@/services/expertExtractService.js';

import TooltipBtnWrap from '../../components/TooltipBtnWrap';
import { ruleDS, tableDS } from './store';
import style from '../common.less';

export default observer(function Content(props) {
  const {
    modal,
    excludeExpertIds = [],
    sourceFrom = 'RFX',
    sourceFromId = '',
    extractOperateType = 'RFX_EDIT',
    expertReplyFlag,
    operateLoading = false,
    adjustRecordId = '',
    sourceHeaderAdjustId = '',
    expertRequirementsRule,
    extraRandomExtractPayload = {},
    customizeTable = noop,
    setOperateLoading = noop,
    submitSuccessCallBack = noop,
    customizeCollapseForm = noop,
    remote,
  } = props || {};

  const ruleDs = useDataSet(
    () =>
      ruleDS({
        sourceFrom,
        sourceFromId,
        expertReplyFlag,
        expertRequirementsRule,
      }),
    [sourceFrom, sourceFromId, expertReplyFlag, expertRequirementsRule]
  );
  const tableDs = useDataSet(
    () =>
      tableDS({
        sourceFrom,
        sourceFromId,
      }),
    []
  );

  useEffect(() => {
    setOperateLoading(
      ruleDs?.status === 'loading' || ['loading', 'submitting'].includes(tableDs?.status)
    );
  }, [ruleDs?.status, tableDs?.status]);

  const showNotification = async ({ ds, notificationItems }) => {
    const error = await ds.getValidationErrors();
    const errorMessage = getErrors({
      data: error,
      ...(notificationItems || {}),
    });
    notification.warning({
      message: <div dangerouslySetInnerHTML={{ __html: errorMessage || '' }} />,
    });
  };

  // 校验区分商务技术时专家数量
  const getValidateExpertCountFlag = ({ groupCategory = '' } = {}) => {
    const { expectBusinessQuantity, expectTechnologyQuantity } =
      ruleDs?.current?.get?.(['expectBusinessQuantity', 'expectTechnologyQuantity']) || {};
    if (
      expertRequirementsRule === 'DIFF' &&
      !isNil(expectBusinessQuantity) &&
      !isNil(expectTechnologyQuantity)
    ) {
      const totalCount = expectBusinessQuantity + expectTechnologyQuantity;
      if (totalCount === 0) {
        notification.warning({
          message: (
            <div>
              <div>{groupCategory}</div>
              <div>
                {intl
                  .get('ssrc.expertExtract.model.expert.expectQuantityCountZeroTips')
                  .d('商务/技术专家数量不能均为0')}
              </div>
            </div>
          ),
        });
        return false;
      }
      if (totalCount > 20) {
        notification.warning({
          message: (
            <div>
              <div>{groupCategory}</div>
              <div>
                {intl
                  .get('ssrc.expertExtract.model.expert.expectQuantityCountTips')
                  .d('商务/技术专家需求数量之和必须小于或等于20')}
              </div>
            </div>
          ),
        });
        return false;
      }
    }
    return true;
  };

  // 随机抽取
  const handleRandomExtract = throttle(async () => {
    setOperateLoading(true);
    // 优先校验数量
    if (
      !getValidateExpertCountFlag({
        groupCategory: intl.get('ssrc.expertExtract.view.title.extractRules').d('抽取规则'),
      })
    ) {
      setOperateLoading(false);
      return;
    }
    const flag = await ruleDs.validate();
    if (!flag) {
      await showNotification({
        ds: ruleDs,
        notificationItems: {
          groupCategory: intl.get('ssrc.expertExtract.view.title.extractRules').d('抽取规则'),
        },
      });
      setOperateLoading(false);
      return;
    }

    const params = {
      body: {
        expertReplyFlag,
        sourceFrom,
        sourceFromId,
        excludeExpertIds,
        extractOperateType,
        expertRequirementsRule,
        ...(filterNullValueObject({ adjustRecordId }) || {}),
        ...(ruleDs?.current?.toData?.() || {}),
        ...(extraRandomExtractPayload || {}),
      },
      query: {
        customizeUnitCode: 'SSRC.INQUIRY_HALL_RANDOM_EXTRACT.RULES_EDIT',
      },
    };

    return randomExtract(params)
      .then(async (res) => {
        const result = getResponse(res);
        if (result && !result.failed) {
          await ruleDs.query(); // 更新规则id
          await tableDs.query();
        }
      })
      .finally(() => setOperateLoading(false));
  }, 500);

  // 发送抽取
  const handleSendExtract = throttle(async () => {
    setOperateLoading(true);
    const flag = await tableDs.validate();
    if (!flag) {
      await showNotification({
        ds: tableDs,
        notificationItems: {
          groupFieldName: 'expertName',
          groupCategory: intl.get('ssrc.expertExtract.view.title.extractExperts').d('抽取专家'),
          primaryKey: 'extractResultId',
        },
      });
      setOperateLoading(false);
      return;
    }

    const params = {
      body: tableDs.toData(),
      query: {
        customizeUnitCode: 'SSRC.INQUIRY_HALL_RANDOM_EXTRACT.EXPERTS_EDIT',
      },
    };

    return sendExtract(params)
      .then(async (res) => {
        const result = getResponse(res);
        if (result && !result.failed) {
          // 提交成功回调
          notification.success();
          await tableDs.query();
        }
      })
      .finally(() => setOperateLoading(false));
  }, 500);

  // 推送
  modal.handleOk(async () => {
    if (!tableDs.length) return;

    setOperateLoading(true);
    const flag = await tableDs.validate();
    if (!flag) {
      await showNotification({
        ds: tableDs,
        notificationItems: {
          groupFieldName: 'expertName',
          groupCategory: intl.get('ssrc.expertExtract.view.title.extractExperts').d('抽取专家'),
          primaryKey: 'extractResultId',
        },
      });
      setOperateLoading(false);
      return false;
    }

    const params = {
      body: filterNullValueObject({
        expertExtractResults: tableDs.toData(),
        extractOperateType,
        adjustRecordId,
        sourceHeaderAdjustId,
        expertReplyFlag,
      }),
      query: {
        customizeUnitCode: 'SSRC.INQUIRY_HALL_RANDOM_EXTRACT.EXPERTS_EDIT',
      },
    };

    return submitExtract(params)
      .then((res) => {
        const result = getResponse(res);
        if (result && !result.failed) {
          // 提交成功回调
          submitSuccessCallBack();

          if (remote?.event) {
            const cuxEventResult = remote.event.fireEvent('cuxRemoteodalHandleOkLasted', {
              pageProps: props,
              tableDs,
              res,
              params,
            });
            if (cuxEventResult === false) {
              return false;
            }
          }
          return true;
        }
        return false;
      })
      .finally(() => setOperateLoading(false));
  });

  const handleDelete = () => {
    const data = tableDs.selected || [];
    tableDs.delete(data, {
      title: intl.get('ssrc.common.message.tip').d('提示'),
      children: intl.get('hzero.common.view.delete_selected_row_confirm').d('确认删除选中行？'),
    });
  };

  const getTextColor = (value) => {
    let color = 'yellow';
    switch (value) {
      case 'ATTEND':
        color = 'green';
        break;
      case 'ABSENT':
        color = 'red';
        break;
      case 'NO_REPLY':
        color = 'gray';
        break;
      case 'WAIT_REPLY':
        color = 'yellow';
        break;
      case 'WAIT_SEND':
        color = 'yellow';
        break;
      default:
        color = 'yellow';
        break;
    }
    return color;
  };

  const getColumns = useCallback(
    () => [
      {
        name: 'expertSubAccount',
        width: 100,
        lock: 'left',
      },
      {
        name: 'expertName',
        width: 110,
        lock: 'left',
      },
      {
        name: 'expertCategory',
        width: 120,
      },
      {
        name: 'expertLevel',
        width: 80,
      },
      {
        name: 'expertType',
        width: 80,
      },
      {
        name: 'replyStatus',
        width: 100,
        renderer: ({ value, text }) => {
          const color = getTextColor(value);
          return (
            <Tag color={color} style={{ border: 0 }}>
              {text}
            </Tag>
          );
        },
      },
      {
        name: 'replyContent',
        width: 200,
      },
      {
        name: 'realStatus',
        width: 130,
        editor: (record) => {
          if (record.get('realStatusDB') === 'ATTEND') {
            return (
              <Select
                name="realStatus"
                optionsFilter={(option) =>
                  !['NO_REPLY', 'WAIT_REPLY', 'WAIT_SEND'].includes(option?.get?.('value'))
                }
              />
            );
          } else {
            return false;
          }
        },
        renderer: ({ value, text }) => {
          const color = getTextColor(value);
          return (
            <Tag color={color} style={{ border: 0 }}>
              {text}
            </Tag>
          );
        },
      },
      {
        name: 'roundNumber',
        width: 80,
      },
      {
        name: 'replyStartTime',
        width: 150,
      },
      {
        name: 'replyEndTime',
        width: 150,
      },
    ],
    []
  );

  const buttons = useMemo(
    () =>
      [
        <TooltipBtnWrap
          visible={tableDs?.selected?.length > 0}
          title={intl
            .get('ssrc.expertExtract.view.button.tooltip.randomExtract')
            .d('勾选数据无法发起新的随机抽取')}
          name="randomExtract"
          btnProps={{
            icon: 'root',
            color: 'primary',
            funcType: 'flat',
            disabled: tableDs?.selected?.length > 0,
            onClick: handleRandomExtract,
          }}
        >
          {intl.get('ssrc.expertExtract.view.button.randomExtract').d('随机抽取')}
        </TooltipBtnWrap>,
        expertReplyFlag ? (
          <TooltipBtnWrap
            visible={tableDs?.selected?.length > 0}
            title={intl
              .get('ssrc.expertExtract.view.button.tooltip.sendExtract')
              .d('勾选数据无法发起抽取消息的发送')}
            name="sendExtract"
            btnProps={{
              icon: 'contact_mail',
              color: 'primary',
              funcType: 'flat',
              disabled: !tableDs?.length || tableDs?.selected?.length > 0,
              onClick: handleSendExtract,
            }}
          >
            {intl.get('ssrc.expertExtract.view.button.sendExtract').d('发送抽取')}
          </TooltipBtnWrap>
        ) : null,
        <TooltipButtonPro
          name="delete"
          icon="delete_sweep"
          disabled={isEmpty(tableDs?.selected)}
          onClick={() => handleDelete()}
          help={intl
            .get('ssrc.common.view.message.expert-group-line.select.tip')
            .d('请先勾选专家组成员')}
        >
          {intl.get(`hzero.common.button.batchDelete`).d('批量删除')}
        </TooltipButtonPro>,
      ].filter(Boolean),
    [tableDs?.selected?.length, expertReplyFlag, tableDs?.length]
  );

  return (
    <div className={style['extract-experts']}>
      <Spin spinning={operateLoading}>
        <div className={classnames('module-line', 'module-line-rule')}>
          {intl.get('ssrc.expertExtract.view.title.extractRules').d('抽取规则')}
        </div>
        {customizeCollapseForm(
          {
            code: `SSRC.INQUIRY_HALL_RANDOM_EXTRACT.RULES_EDIT`,
            dataSet: ruleDs,
          },
          <CollapseForm dataSet={ruleDs} columns={3} labelLayout="float">
            {expertRequirementsRule === 'NONE' && <NumberField name="expectQuantity" />}
            {expertRequirementsRule === 'DIFF' && <NumberField name="expectBusinessQuantity" />}
            {expertRequirementsRule === 'DIFF' && <NumberField name="expectTechnologyQuantity" />}
            <NumberField name="replyDuration" />
            <Select name="expertLevel" />
            <Select name="expertType" />
            <Lov name="countryId" />
            <Select name="provinceIds" searchable />
            <Select name="cityIds" searchable />
            <Lov name="itemCategoryList" tableProps={{ selectionMode: 'rowbox' }} />
          </CollapseForm>
        )}
        <div className={classnames('module-line', 'module-line-expert')}>
          {intl.get('ssrc.expertExtract.view.title.extractExperts').d('抽取专家')}
        </div>
        {customizeTable(
          {
            code: `SSRC.INQUIRY_HALL_RANDOM_EXTRACT.EXPERTS_EDIT`,
            buttonCode: `SSRC.INQUIRY_HALL_RANDOM_EXTRACT.BUTTONS`,
          },
          <Table
            dataSet={tableDs}
            columns={getColumns()}
            buttons={buttons}
            style={{ maxHeight: '430px' }}
          />
        )}
      </Spin>
    </div>
  );
});
