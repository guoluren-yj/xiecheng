import React, { useMemo, useState, useEffect } from 'react';
import { observer } from 'mobx-react';
import { useDataSet, useModal, Form, Select, TextArea } from 'choerodon-ui/pro';
import { Tabs } from 'choerodon-ui';
import { noop, compose } from 'lodash';
import querystring from 'querystring';

import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import intl from 'utils/intl';
import DynamicButtons from '_components/DynamicButtons';
import ToBeReplied from './Tabs/ToBeReplied';
import Replied from './Tabs/Replied';
import All from './Tabs/All';
import { toBeRepliedDS, repliedDS, allDS, replyFormDS } from './lineDs';
import styles from './index.less';

const { TabPane } = Tabs;

const Index = (props) => {
  const {
    customizeBtnGroup = noop,
    customizeTabPane = noop,
    customizeTable = noop,
    custConfig = {},
  } = props || {};

  const routerParams = querystring.parse(location?.search?.substr?.(1)) || {};

  const { activityTabKey: tabKey } = routerParams || {};

  const toBeRepliedDs = useDataSet(() => toBeRepliedDS(), []);
  const repliedDs = useDataSet(() => repliedDS(), []);
  const allDs = useDataSet(() => allDS(), []);
  const replyFormDs = useDataSet(() => replyFormDS(), []);

  const [activityTabKey, setActivityTabKey] = useState('toBeReplied');
  const modal = useModal();

  useEffect(() => {
    handleCustTabKey();
  }, []);

  useEffect(() => {
    if (tabKey) {
      setActivityTabKey(tabKey || 'toBeReplied');
    }
  }, [tabKey]);

  const handleCustTabKey = () => {
    const activeConfig = custConfig?.['SSRC.EXPERT_REPLY.LIST.TABS']?.fields?.find?.(
      (item) => item.defaultActive === 1
    );
    setActivityTabKey(tabKey || activeConfig?.fieldCode || 'toBeReplied');
  };

  const changeTabs = (key) => {
    setActivityTabKey(key);
    switch (key) {
      case 'toBeReplied':
        toBeRepliedDs.query();
        break;
      case 'replied':
        repliedDs.query();
        break;
      case 'all':
        allDs.query();
        break;
      default:
        break;
    }
  };

  const handleReply = ({ currentRecord, batchEditFlag = false }) => {
    let extractResultIdList = [];
    let sourceFromNum;
    // 批量回复
    if (batchEditFlag) {
      extractResultIdList =
        toBeRepliedDs?.selected?.map?.((item) => item.get('extractResultId')) || [];
    } else {
      extractResultIdList = [currentRecord?.get?.('extractResultId')];
      sourceFromNum = currentRecord?.get?.('sourceFromNum');
    }
    replyFormDs.create({ extractResultIdList, sourceFromNum });
    return modal.open({
      title: batchEditFlag
        ? intl.get('ssrc.expertWorkBench.view.title.batchReplyTitle').d('批量回复')
        : intl
            .get('ssrc.expertWorkBench.view.title.replyTitle', {
              sourceFromNum: currentRecord?.get?.('sourceFromNum'),
            })
            .d(`回复-{sourceFromNum}`),
      destroyOnClose: true,
      drawer: true,
      style: {
        width: '380px',
      },
      children: (
        <Form dataSet={replyFormDs} columns={1} labelLayout="float">
          <Select name="replyStatus" />
          <TextArea name="replyContent" autoSize={{ minRows: 2 }} resize />
        </Form>
      ),
      onOk: async () => {
        const res = await replyFormDs.submit();
        if (res) {
          if (batchEditFlag) {
            // 清除缓存记录
            toBeRepliedDs.unSelectAll();
            toBeRepliedDs.clearCachedSelected();
          }
          // 查询
          toBeRepliedDs.query();
        }
        // 校验失败，阻止弹框关闭
        return res;
      },
      afterClose: () => {
        // eslint-disable-next-line no-unused-expressions
        replyFormDs?.reset?.();
      },
    });
  };

  const buttons = useMemo(() => {
    return [
      activityTabKey === 'toBeReplied'
        ? {
            name: 'batchReply',
            btnType: 'c7n-pro',
            btnProps: {
              icon: 'record_test',
              color: 'primary',
              onClick: () => handleReply({ batchEditFlag: true }),
              disabled: !toBeRepliedDs?.selected?.length,
            },
            child: intl.get('ssrc.expertWorkBench.view.button.batchReply').d('批量回复'),
          }
        : null,
    ].filter(Boolean);
  }, [activityTabKey, toBeRepliedDs?.selected?.length]);

  const commonProps = {
    customizeTable,
  };

  const toBeRepliedProps = {
    ...(commonProps || {}),
    dataSet: toBeRepliedDs,
    handleReply,
  };

  const repliedProps = {
    ...(commonProps || {}),
    dataSet: repliedDs,
  };

  const allProps = {
    ...(commonProps || {}),
    dataSet: allDs,
  };

  return (
    <>
      <Header
        title={intl.get('ssrc.expertWorkBench.view.message.title.expertWorkBench').d('专家回复')}
      >
        {customizeBtnGroup(
          {
            code: 'SSRC.EXPERT_REPLY.LIST.HEADER_BUTTONS',
            pro: true,
          },
          <DynamicButtons buttons={buttons} />
        )}
      </Header>
      <Content>
        {customizeTabPane(
          {
            code: 'SSRC.EXPERT_REPLY.LIST.TABS',
          },
          <Tabs
            activeKey={activityTabKey}
            onChange={changeTabs}
            className={styles['c7n-tabs-style']}
          >
            <TabPane
              tab={intl.get('ssrc.expertWorkBench.view.tab.toBeReplied').d('待回复')}
              key="toBeReplied"
            >
              <ToBeReplied {...toBeRepliedProps} />
            </TabPane>
            <TabPane
              tab={intl.get('ssrc.expertWorkBench.view.tab.replied').d('已回复')}
              key="replied"
            >
              <Replied {...repliedProps} />
            </TabPane>
            <TabPane tab={intl.get('ssrc.expertWorkBench.view.tab.all').d('全部')} key="all">
              <All {...allProps} />
            </TabPane>
          </Tabs>
        )}
      </Content>
    </>
  );
};

export default compose(
  WithCustomizeC7N({
    unitCode: [
      `SSRC.EXPERT_REPLY.LIST.HEADER_BUTTONS`, // 头部按钮组
      `SSRC.EXPERT_REPLY.LIST.TABS`, // 标签页
      `SSRC.EXPERT_REPLY.LIST.TO_BE_REPLIED`, // 表格-待回复
      `SSRC.EXPERT_REPLY.LIST.REPLIED`, // 表格-已回复
      `SSRC.EXPERT_REPLY.LIST.ALL`, // 表格-全部
      `SSRC.EXPERT_REPLY.LIST.TO_BE_REPLIED_FILTER`, // 筛选器-待回复
      `SSRC.EXPERT_REPLY.LIST.REPLIED_FILTER`, // 筛选器-待回复
      `SSRC.EXPERT_REPLY.LIST.ALL_FILTER`, // 筛选器-待回复
    ],
  }),
  formatterCollections({
    code: ['ssrc.expertWorkBench', 'hzero.common'],
  })
)(observer(Index));
