import React, { useMemo, useState, useEffect } from 'react';
import { Alert } from 'choerodon-ui';
import {
  Button,
  IntlField,
  Output,
  DataSet,
  DatePicker,
  DateTimePicker,
} from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import qs from 'qs';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { flowRight } from 'lodash';
import remote from 'hzero-front/lib/utils/remote';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { Header, Content } from 'components/Page';
import FormPro from '@/components/FormPro';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';

import moment from 'moment';
import { formDS, getSkuInfoDsProps, getRuleConfigDsProps } from './store';
import { tagRender } from '../renderer';
import SkuInfo from './SkuInfo';
import RuleConfig from './RuleConfig';
import { handleCancel, handleDelete, handleCheck } from '../func';
import { centralizeSave, centralizePublish } from '../api';
import openRecords from '../openRecords';
import styles from './index.less';

function Detail(props) {
  const {
    match: { params: { status } = {} },
    location: { search },
    history,
    customizeTable,
    remote: myRemote,
  } = props;
  const { templateId } = qs.parse(search.substr(1));
  const [readOnly, setReadOnly] = useState(status === 'read');

  const executeRuleDataSet = useMemo(() => new DataSet(getRuleConfigDsProps('PERFORM')), []);
  const formDs = useMemo(() => new DataSet(formDS({templateId, executeRuleDataSet})), [templateId]);
  const skuDs = useMemo(() => new DataSet(getSkuInfoDsProps(formDs)), []);
  const publishStatus = formDs.current?.get('publishStatus');

  useEffect(() => {
    if(templateId) {
      formDs.query();
    }
  }, [templateId]);

  // 基本信息字段
  const baseInfoFields = useMemo(
    () => [
      {
        name: 'templateCode',
        label: intl.get('small.centralize.view.centralizeCode').d('拼单编码'),
      },
      {
        name: 'templateName',
        label: intl.get('small.centralize.view.centralizeName').d('拼单名称'),
        FormField: IntlField,
      },
      {
        name: 'templateDate',
        FormField: DatePicker,
      },
      { name: 'createdByName' },
      {
        name: 'creationDate',
        FormField: DateTimePicker,
      },
      {
        name: 'publishStatus',
        label: intl.get('hzero.common.status').d('状态'),
        FormField: Output,
        renderer: tagRender,
        show: readOnly,
      },
    ],
    [readOnly]
  );

  // 处理规则行数据
  const handleConditionLineList = configDataSet => {
    return configDataSet.map((record, index) => {
      const conditionLovCode = record.getField('centralizedConditionValueList').get('lovCode');
      const ruleItem = record.toData();
      return {
        ...ruleItem,
        conditionLovCode,
        conditionNumber: index + 1,
        centralizedConditionValueList:
          typeof ruleItem.conditionLineValue === 'object'
            ? ruleItem.centralizedConditionValueList.map((m, mIndex) => {
                return {
                  conditionLineValue: ruleItem.conditionLineValue[mIndex],
                  conditionLineValueMeaning: ruleItem.conditionLineValueMeaning[mIndex],
                };
              })
            : [
                {
                  conditionLineValue: ruleItem.conditionLineValue,
                  conditionLineValueMeaning: ruleItem.conditionLineValueMeaning,
                },
              ],
      };
    });
  };

  // 保存｜发布校验&参数get
  async function validateInfo(param) {
    const { type = false } = param || {};
    const baseInfoFlag = await formDs.validate();
    const {
      templateType,
      executeRuleFlag,
      executeExpression,
      centralizedConditionHeadList,
      startDate,
      endDate,
      ...baseInfo
    } = formDs.current.toJSONData();
    if (executeRuleDataSet.length < 1 && templateId && type === 'publish') {
      notification.warning({
        message: intl.get('small.centralize.view.buyerInfp').d('下单人范围'),
        description: intl.get('small.centralize.view.buyerInfpTip').d('请至少维护一条数据'),
      });
      return;
    }
    const executeFormFlag = templateId ? await executeRuleDataSet.validate() : true;
    if (baseInfoFlag && executeFormFlag) {
      const executeHead = centralizedConditionHeadList?.find(f => f.ruleType === 'PERFORM') || {};
      const params = {
        templateType,
        ...baseInfo,
        startDate: moment(startDate).format('YYYY-MM-DD 00:00:00'),
        endDate: moment(endDate).format('YYYY-MM-DD 23:59:59'),
        centralizedFixedSkuList: skuDs.toJSONData(),
        centralizedConditionHeadList: [
          {
            ...executeHead,
            ruleType: 'PERFORM',
            conditionType: 1,
            conditionExpression: executeRuleDataSet.map((r)=> r.index + 1).join(" OR "),
            deleteConditionIdList: executeRuleDataSet.getState('deleteConditionIdList'),
            centralizedConditionLineList: templateId ? handleConditionLineList(executeRuleDataSet) : null,
          },
        ],
      };
      return params;
    }
  }

  // 保存
  async function handleSave() {
    const params = await validateInfo();
    if (params) {
      const res = getResponse(await centralizeSave(params));
      if (res) {
        notification.success();
        if (!templateId && res.templateId) {
          props.history.push(`/small/centralize-manage/detail/edit?templateId=${res.templateId}`);
        } else {
          formDs.query();
          skuDs.query();
        }
      }
    }
  }

  // 发布
  async function handlePublish() {
    async function publishCallback(list) {
      const res = getResponse(await centralizePublish(templateId, list));
      if (res) {
        notification.success();
        props.history.push(`/small/centralize-manage/list`);
      }
    }
    if (readOnly) {
      await handleCheck(templateId, publishCallback);
    } else {
      const params = await validateInfo({ type: 'publish' });
      if (params) {
        const res = getResponse(await centralizeSave(params));
        if (res) {
          formDs.query();
          skuDs.query();
          await handleCheck(templateId, publishCallback);
        }
      }
    }
  }

  function callback() {
    history.push('/small/centralize-manage/list');
  }

  const buttons = [
      {
        show: !!templateId && !readOnly, // 模板已创建同时状态为未发布
        btnText: intl.get('small.common.button.handle.publish').d('发布'),
        btnProps: { color: 'primary', icon: 'publish2', onClick: () => handlePublish() },
      },
      {
        show: !readOnly && publishStatus !== 'PUBLISHED',
        btnText: intl.get('hzero.common.button.save').d('保存'),
        btnProps: {
          funcType: status === 'create' ? 'raised' : 'flat',
          color: status === 'create' ? 'primary' : 'default',
          icon: 'save',
          onClick: () => handleSave(),
        },
      },
      {
        show: readOnly && publishStatus === 'PUBLISHED',
        btnText: intl.get('small.common.button.handle.change').d('变更'),
        btnProps: { funcType: 'flat', icon: 'mode_edit', onClick: () => setReadOnly(false) },
      },
      {
        show: readOnly && publishStatus === 'NEW',
        btnText: intl.get('hzero.common.button.edit').d('编辑'),
        btnProps: { funcType: 'flat', icon: 'mode_edit', onClick: () => setReadOnly(false) },
      },
      {
        show: publishStatus === 'PUBLISHED',
        btnText: intl.get('hzero.common.button.cancel').d('取消'),
        btnProps: {
          funcType: 'flat',
          icon: 'cancel',
          onClick: () => handleCancel({ record: formDs.current, callback }),
        },
      },
      {
        show: publishStatus === 'NEW',
        btnText: intl.get('hzero.common.button.delete').d('删除'),
        btnProps: {
          funcType: 'flat',
          icon: 'delete',
          onClick: () => handleDelete({ record: formDs.current, callback }),
        },
      },
      {
        show: !!templateId,
        btnText: intl.get('small.common.model.handle.record').d('操作记录'),
        btnProps: {
          funcType: 'flat',
          icon: 'operation_service_request',
          onClick: () => openRecords(formDs.current),
        },
      },
    ]
      .filter(f => f.show !== false)
      .map(m => <Button {...m.btnProps}>{m.btnText}</Button>);

  const title = status === 'create'
    ? intl.get('small.centralize.view.create.title').d('新建拼单活动')
    : readOnly
    ? intl.get('small.centralize.view.detail.title').d('查看拼单活动')
    : publishStatus === 'PUBLISHED' ? intl.get('small.centralize.view.change.title').d('变更拼单活动') : intl.get('small.centralize.view.edit.title').d('编辑拼单活动');

  const cuxBaseInfoFields = myRemote.process('SMALL_CENTRALIZE_MANAGE_BASE_INFO_FIELDS', baseInfoFields, {formDs});

  const cardList = [
    {
      title: intl.get('small.centralize.view.baseInfo').d('基本信息'),
      content: (
        <FormPro
          dataSet={formDs}
          columns={3}
          readOnly={readOnly}
          fields={cuxBaseInfoFields}
          useWidthPercent
        />
      ),
    },
    {
      title: intl.get('small.centralize.view.skuInfo').d('商品范围'),
      show: !!templateId,
      content: <SkuInfo formDataSet={formDs} dataSet={skuDs} templateId={templateId} readOnly={readOnly} customizeTable={customizeTable} remote={myRemote} />,
      // 已发布变更时才展示
      alertMessage: formDs.current?.get('publishStatus') === 'PUBLISHED' && !readOnly && intl.get('small.centralize.view.changeWarning').d('拼单活动发布后变更，针对商品的增删无需发布操作也会立即生效，请谨慎操作。'),
    },
    {
      title: intl.get('small.centralize.view.buyerInfp').d('下单人范围'),
      show: !!templateId,
      content: (
        <RuleConfig
          formDataSet={formDs}
          configDataSet={executeRuleDataSet}
          readOnly={readOnly}
          ruleName="executeRuleFlag"
          expressionName="executeExpression"
        />
      ),
    },
  ].filter(n => n.show !== false);
  return (
    <>
      <Header title={title} backPath="/small/centralize-manage/list">
        {buttons}
      </Header>
      <Content className={styles['centralize-detail']}>
        {cardList.map(card => (
          <>
            {!!card.alertMessage && (
              <Alert
                banner
                showIcon
                closable
                iconType="info"
                type="warning"
                message={card.alertMessage}
              />
            )}
            <div className="card-wrapper">
              <div className="card-title">{card.title}</div>
              <div className="card-content">{card.content}</div>
            </div>
          </>
        ))}
      </Content>
    </>
  );
}

export default flowRight(
  withCustomize({ unitCode: ['SMCT_CENTRALIZED_TEMPLATE.DETAIL.SKU_INFO'] }),
  formatterCollections({
    code: ['small.common', 'small.centralize'],
  }),
  remote({
    code: 'SMAll_CENTRALIZE_MANAGE_DETAIL',
    name: 'remote',
  })
  // getWithProps
)(observer(Detail)) ;
