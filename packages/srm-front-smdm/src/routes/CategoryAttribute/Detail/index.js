import React, { Fragment, useState, useEffect, useMemo } from 'react'; // useEffect
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { observer } from 'mobx-react-lite';

import { compose, isArray, isEmpty } from 'lodash';
import { Header, Content } from 'components/Page';
import { Tooltip, DataSet, Modal, Tabs, Spin } from 'choerodon-ui/pro';
import { Button } from 'components/Permission';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
// import withProps from 'utils/withProps';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { fetchDetail, saveAttributeTemplate } from '@/services/categoryAttributeService';
import { baseInfoDS, templateLineDS } from '../stores/detailDs';
import BaseInfo from './BaseInfo';
import TemplateAttribute from './TemplateAttribute';
import OperationRecord from '../components/OperationHistory';

import styles from '../index.less';

// 设置sbdm国际化前缀 - common - model
const commonPrompt = 'smdm.common.model.common';

const { TabPane } = Tabs;

const TabTitle = ({ title }) => {
  return (
    <>
      <Tooltip title={title}>
        <div className={styles.tabTitle}> {title} </div>
      </Tooltip>
    </>
  );
};

const Index = ({ dispatch, match }) => {
  const [templateId, setTemplateId] = useState(match.params?.id);

  const baseInfoDs = useMemo(() => new DataSet(baseInfoDS({ templateId })), [templateId]);

  const templateLineDs = useMemo(() => new DataSet(templateLineDS({ templateId })), [templateId]);

  const [headInfo, setHeadInfo] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (templateId && templateId !== 'new') {
      commonUpdate(templateId);
    }
  }, [templateId]);

  // // update头行信息
  const commonUpdate = (curBudgetTemplateId) => {
    setLoading(true);
    fetchDetail(curBudgetTemplateId)
      .then(async (res) => {
        if (getResponse(res)) {
          setHeadInfo(res);
          baseInfoDs.loadData([
            {
              ...res,
            },
          ]);
          await templateLineDs.query();
        }
      })
      .finally(() => {
        setTimeout(() => {
          setLoading(false);
        }, 100);
      });
  };

  // 获取基本信息
  const getBaseInfo = async () => {
    const errorMessage = [];
    const baseFlag = await baseInfoDs.validate();

    if (baseFlag) {
      return {
        ...baseInfoDs.toJSONData()[0],
      };
    } else {
      errorMessage.push(intl.get(`${commonPrompt}.baseAttribute`).d('基本属性'));
      return errorMessage;
    }
  };

  // 获取模版属性
  const getTemplateAttributeInfo = async () => {
    const errorMessage = [];
    const templateLineFlag = await templateLineDs.validate();

    if (templateLineFlag) {
      return {
        categoryAttrTemplateProperties: templateLineDs.toJSONData(),
      };
    } else {
      errorMessage.push(intl.get(`${commonPrompt}.templateAttribute`).d('模版属性'));
      return errorMessage;
    }
  };

  // 获取所有信息
  const getAllInfo = async () => {
    const errorTipMsg = [];
    const baseInfo = await getBaseInfo();
    const templateAttributeInfo = await getTemplateAttributeInfo();

    if (isArray(baseInfo)) errorTipMsg.push(...baseInfo);

    if (isArray(templateAttributeInfo)) errorTipMsg.push(...templateAttributeInfo);

    if (errorTipMsg.length === 0) {
      return {
        ...headInfo,
        ...baseInfo,
        ...templateAttributeInfo,
      };
    } else {
      const allErrorMsg = [];
      const baseError = await baseInfoDs.current?.getValidationErrors();
      const langUnit = intl.get(`${commonPrompt}.unit`).d('单元');

      if (!isEmpty(baseError)) {
        const baseErrorMsg = [];
        const requiredFields = [];
        baseError.forEach((ele) => {
          const item = ele.errors.toJS()[0];
          if (item.ruleName === 'valueMissing') {
            requiredFields.push(`【${item.injectionOptions.label}】`);
          } else {
            baseErrorMsg.push(item.validationMessage);
          }
        });
        if (!isEmpty(requiredFields)) {
          baseErrorMsg.unshift(
            intl
              .get(`${commonPrompt}.valueMissing`, { label: requiredFields.join('、') })
              .d(`${requiredFields.join('、')}为必填，请输入后保存。`)
          );
        }
        allErrorMsg.push(`【${baseInfo[0]}】${langUnit}: ${baseErrorMsg.join('')}`);
      }

      notification.error({
        message: `${allErrorMsg.join(';')}`,
      });

      return null;
    }
  };

  // 保存
  const handleSave = async () => {
    const allInfo = await getAllInfo();
    if (allInfo) {
      setLoading(true);
      const res = getResponse(
        await saveAttributeTemplate({
          ...allInfo,
        })
      );

      if (res) {
        notification.success();
        if (templateId === 'new') {
          setTemplateId(res.templateId);
          dispatch(
            routerRedux.push({
              pathname: `/smdm/category-attribute/detail/${res.templateId}`,
            })
          );
        } else {
          commonUpdate(templateId);
        }
      } else {
        setLoading(false);
      }
    }
  };

  // 打开操作记录
  const handleActHistory = () => {
    return Modal.open({
      key: Modal.key(),
      drawer: true,
      style: { width: '742px' },
      bodyStyle: { paddingTop: '20px' },
      title: intl.get(`hzero.common.button.operating`).d('操作记录'),
      children: <OperationRecord templateId={templateId} />,
      closable: true,
      movable: false,
      destroyOnClose: true,
      onOk: () => {},
      okText: intl.get('hzero.common.status.closed').d('关闭'),
      footer: (okBtn) => okBtn,
    });
  };

  const HeaderBtn = observer(() => {
    const headerButtons = [
      <Button
        onClick={() => handleSave()}
        type="c7n-pro"
        icon="save"
        funcType="flat"
        disabled={loading}
        style={{ marginRight: '0.1rem' }}
      >
        {intl.get(`hzero.common.button.save`).d('保存')}
      </Button>,
    ];

    if (templateId && templateId !== 'new') {
      headerButtons.push(
        <Button
          onClick={() => handleActHistory()}
          type="c7n-pro"
          icon="assignment"
          funcType="flat"
          disabled={loading}
        >
          {intl.get('hzero.common.button.operationRecords').d('操作记录')}
        </Button>
      );
    }

    return headerButtons;
  });

  return (
    <Fragment>
      <Header
        backPath="/smdm/category-attribute/list"
        title={intl.get(`${commonPrompt}.attributeTemplateMange`).d('属性模版管理')}
      >
        <HeaderBtn />
      </Header>
      <Content className={styles['config-page-content']}>
        <Spin spinning={loading || false}>
          <Tabs keyboard={false} className="config-vertical-tabs" tabPosition="left">
            <TabPane
              tab={<TabTitle title={intl.get(`${commonPrompt}.baseInfo`).d('基本信息')} />}
              key="baseInfo"
            >
              <BaseInfo baseInfoDs={baseInfoDs} templateId={templateId} />
            </TabPane>
            <TabPane
              tab={<TabTitle title={intl.get(`${commonPrompt}.templateAttribute`).d('模版属性')} />}
              key="templateAttribute"
            >
              <TemplateAttribute templateLineDs={templateLineDs} templateId={templateId} />
            </TabPane>
          </Tabs>
        </Spin>
      </Content>
    </Fragment>
  );
};

export default compose(
  connect(),
  formatterCollections({
    code: ['smdm.common'],
  })
)(Index);
