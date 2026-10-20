/**
 * 订阅配置
 * @date: 2021-06-22
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { useEffect } from 'react';
import { DataSet, Table, Button, Modal, TextField, IntlField, Lov, Form } from 'choerodon-ui/pro';
import { Badge } from 'choerodon-ui';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';
import intl from 'utils/intl';
// import { enableRender, yesOrNoRender } from 'utils/renderer';
import getSubscribeManagesDs from './store/subscribeManagesDs';

// 弹框 key
const modalKey = Modal.key();

// 表格列渲染状态
const statusMap = ['error', 'success'];

function SubscribeManages(props = {}) {
  const {
    location: { state: { _back } = {} }, // 获取返回状态，根据 _back 来判断刷新状态
  } = props;
  const { subscribeManagesDs } = props.valueDs;

  useEffect(() => {
    subscribeManagesDs.query();
  }, [_back]);

  /**
   * 上下线状态渲染
   * @param {String} v value
   * @returns
   */
  const isOffLineRender = (v) => {
    return React.createElement(Badge, {
      status: statusMap[v],
      text:
        v === 1
          ? intl.get('sdps.subscribeManages.view.status.online').d('上线')
          : intl.get('sdps.subscribeManages.view.status.offline').d('下线'),
    });
  };

  /**
   * 打开编辑框
   * @param {Object} record ds行数据
   * @param {String} title 弹框标题
   */
  const openModal = (record, title) => {
    let isCreate = true; // 是否为创建状态
    Modal.open({
      key: modalKey,
      title,
      drawer: true,
      style: {
        width: 500,
      },
      children: (
        <Form record={record} labelLayout="float">
          <div style={{ fontSize: '14px', fontWeight: '600' }}>
            {intl.get('sdps.subscribeManages.view.form.subscribe').d('填写订阅信息')}
          </div>
          <TextField name="code" />
          <IntlField name="name" />
          <div style={{ fontSize: '14px', fontWeight: '600' }}>
            {intl.get('sdps.subscribeManages.view.form.choiceCode').d('选择规则编码')}
          </div>
          <Lov name="mdCode" />
        </Form>
      ),
      onOk: async () => {
        isCreate = true;
        const valid = await subscribeManagesDs.validate();
        if (!valid) return false;
        return subscribeManagesDs.submit();
      },
      onCancel: () => {
        isCreate = false;
        subscribeManagesDs.reset();
      },
      afterClose: () => {
        if (isCreate) {
          subscribeManagesDs.query();
        }
      },
    });
  };

  /**
   * 订阅
   */
  const subscribeRule = () => {
    subscribeManagesDs.create({});
    openModal(
      subscribeManagesDs.current,
      intl.get('sdps.subscribeManages.view.form.subscribe').d('填写订阅信息')
    );
  };

  // const editSubscribeRule = (record) => {
  //   openModal(record, intl.get('sdps.subscribeManages.view.form.subscribe').d('填写订阅信息'));
  // };

  /**
   * 取消订阅
   * @param {Object} record ds行数据
   */
  const cancelSubscribe = (record) => {
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: (
        <div>
          {intl.get('sdps.subscribeManages.action.cancelSubscribe.sure').d('确定取消订阅?')}
        </div>
      ),
      onOk: () => {
        record.set('mdEnableFlag', 0);
        subscribeManagesDs
          .delete(record, false)
          .then(() => {
            subscribeManagesDs.query();
          })
          .catch(() => {
            subscribeManagesDs.query();
          });
      },
    });
  };

  // const handleSubscribeStatus = (record, status) => {
  //   Modal.confirm({
  //     title: intl.get('hzero.common.message.confirm.title').d('提示'),
  //     children:
  //       status === 1
  //         ? intl.get('sdps.subscribeManages.action.disable.sure').d('确定启用此配置?')
  //         : intl.get('sdps.subscribeManages.action.enable.sure').d('确定禁用此配置?'),
  //     onOk: () => {
  //       record.set('enableFlag', status);
  //       subscribeManagesDs.submit().then(() => {
  //         subscribeManagesDs.query();
  //       });
  //     },
  //   });
  // };

  /**
   * 表格列
   */
  const columns = [
    {
      name: 'code',
      width: 260,
      help: intl
        .get('sdps.ruleManages.view.help.tip')
        .d('此字段对应[标准指标定义]功能中的“指标编码”'),
    },
    {
      name: 'name',
      width: 160,
    },
    {
      name: 'fullPathCode',
      width: 300,
    },
    {
      name: 'mdName',
      width: 160,
    },
    {
      name: 'type',
      width: 80,
    },
    {
      name: 'mdEnableFlag',
      width: 100,
      renderer: ({ value }) => isOffLineRender(value),
    },
    // {
    //   name: 'isSub',
    //   width: 80,
    //   renderer: ({ value }) => yesOrNoRender(value),
    // },
    // {
    //   name: 'enableFlag',
    //   width: 100,
    //   renderer: ({ value }) => enableRender(value),
    // },
    {
      name: 'createdBy',
      width: 150,
    },
    {
      name: 'creationDate',
      width: 150,
    },
    {
      name: 'lastUpdatedBy',
      width: 150,
    },
    {
      name: 'lastUpdateDate',
      width: 150,
    },
    {
      name: 'action',
      width: 100,
      renderer: ({ record }) => {
        return (
          <span className="action-link">
            <a onClick={() => cancelSubscribe(record)}>
              {intl.get('sdps.subscribeManages.view.action.cancelSubscribe').d('取消订阅')}
            </a>
            {/* {record.get('isSub') === 1 && (
               <>
                 <a onClick={() => cancelSubscribe(record)}>
                   {intl.get('sdps.subscribeManages.view.action.cancelSubscribe').d('取消订阅')}
                 </a>
                 {record.get('enableFlag') === 1 ? (
                   <a onClick={() => handleSubscribeStatus(record, 0)}>
                     {intl.get('hzero.common.status.disable').d('禁用')}
                   </a>
                 ) : (
                   <>
                     <a onClick={() => handleSubscribeStatus(record, 1)}>
                       {intl.get('hzero.common.status.enable').d('启用')}
                     </a>
                     <a onClick={() => editSubscribeRule(record)}>
                       {intl.get('hzero.common.button.edit').d('编辑')}
                     </a>
                   </>
                 )}
               </>
             )} */}
          </span>
        );
      },
    },
  ];

  return (
    <React.Fragment>
      <Header title={intl.get('sdps.subscribeManages.view.header.title').d('订阅配置')}>
        <Button color="primary" onClick={subscribeRule}>
          {intl.get('sdps.subscribeManages.action.button.subscribe').d('订阅')}
        </Button>
      </Header>
      <Content>
        <Table dataSet={subscribeManagesDs} columns={columns} />
      </Content>
    </React.Fragment>
  );
}

export default formatterCollections({
  code: ['sdps.subscribeManages', 'sdps.ruleManages'],
})(
  withProps(
    () => {
      const subscribeManagesDs = new DataSet(getSubscribeManagesDs());
      const valueDs = {
        subscribeManagesDs,
      };
      return { valueDs };
    },
    { cacheState: true, keepOriginDataSet: true }
  )(SubscribeManages)
);
