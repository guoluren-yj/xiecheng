// 改造自定义C7nPopover
import React, { useState, useCallback } from 'react';
import { Icon, Spin, Modal } from 'choerodon-ui/pro';
import { Popover, Tag, Steps } from 'choerodon-ui';
import { getResponse } from 'utils/utils';
import intl from 'utils/intl';
import { fetchModal } from '@/services/ReceipWorkbenchService';
import ExpIndex from './ThingReceipts/components/expIndex';
import ImportModal from './ThingReceipts/components/importModal';
import RelationIndex from './components/AssociatedDocuments/relationIndex';
import { queryReceiveTransactionDetails } from '@/services/purchaseReceiptRecordService';
import styles from './ThingReceipts/components/expIndex.less';
import './index.less';

const { Step } = Steps;

const C7nPopover = (props) => {
  const { record = {} } = props;
  const [executeStatusContent, setExecuteStatusContent] = useState([]);
  const [loading, setLoading] = useState(false);
  const iconStyle = {
    fontSize: 12,
    lineHeight: '18px',
    paddingLeft: '5px',
  };
  const modalClickList = useCallback((re) => {
    const { sourceHeaderNum, sourceLineNum, strategyHeaderId, rcvTrxLineId } = re;
    setLoading(true);
    fetchModal({ sourceHeaderNum, sourceLineNum, strategyHeaderId, rcvTrxLineId }).then((res) => {
      if (getResponse(res) && Array.isArray(res) && res.length) {
        setExecuteStatusContent([...res]);
        setLoading(false);
      } else {
        setExecuteStatusContent([
          { nodeConfigName: props.record.nodeConfigName, quantity: props.record.quantity },
        ]);
        setLoading(false);
      }
    });
  }, []);

  return (
    <Popover
      overlayClassName="wrapPop"
      // overlayStyle={{ fontSize: '18px' }}
      content={
        <Spin spinning={loading} size="small">
          <Steps direction="vertical">
            {(executeStatusContent || []).map((item) => {
              return (
                // <p style={{ marginBottom: 0 }}>
                //   <Badge status="success" />
                //   {item.nodeConfigName}
                //   {`(${item.quantity})`}
                // </p>
                // <Step title={item.nodeConfigName} description={<div style={{ float: 'right' }}>{item.quantity}</div>} />
                <Step
                  status={item.quantity ? 'finish' : 'wait'}
                  title={
                    <>
                      <span style={{ fontSize: '0.12rem', lineHeight: '0.18rem' }}>
                        {item.nodeConfigName}
                      </span>
                      <span
                        style={{
                          fontSize: '0.12rem',
                          float: 'right',
                          marginLeft: '0.4rem',
                          color: '#1d2129',
                        }}
                      >
                        {item.quantity}
                      </span>
                    </>
                  }
                />
              );
            })}
          </Steps>
        </Spin>
      }
      placement="rightTop"
      trigger="hover"
    >
      <Icon type="call_split" style={iconStyle} onMouseEnter={() => modalClickList(record)} />
    </Popover>
  );
};

// 封装通用c7nModal
const c7nModal = (modalProps = {}) => {
  return Modal.open({
    movable: false,
    closable: true,
    mask: true,
    maskClosable: false,
    destroyOnClose: true,
    drawer: true,
    ...modalProps,
  });
};

// 显示流程框
const setShow = (record) => {
  const { fromOrderTypeName = '-', sourceHeaderNum = '-', sourceLineNum = '-' } = record.get([
    'fromOrderTypeName',
    'sourceHeaderNum',
    'sourceLineNum',
  ]);
  c7nModal({
    style: { width: 1090 },
    okCancel: false,
    className: styles['exp-modal'],
    okText: intl.get('hzero.common.button.close').d('关闭'),
    title: (
      <span>
        {`${intl
          .get('sinv.receiptWorkbench.model.view.title.rcvTypeDetail')
          .d('收货状态详情')}【${fromOrderTypeName}】`}
        {`${sourceHeaderNum || ''}-${sourceLineNum}`}
      </span>
    ),
    children: <ExpIndex dataGather={record} />,
  });
};

// sourceStatusCode渲染
const colorRender = ({ record }) => {
  const value = record.get('sourceStatusCode');
  const { data } = record;
  if (['TAKE_FINISH'].includes(value)) {
    // 绿色 成功、已完成
    return (
      <Tag color="green" style={{ border: 'none', height: '70px', lineHeight: '18px' }}>
        <span onClick={() => setShow(record)}>{record.get('sourceStatusMeaning')}</span>
        <C7nPopover record={data} />
      </Tag>
    );
  } else if (['WAIT_TAKE', 'TAKE_DOING'].includes(value)) {
    // 橙色：过程中
    return (
      <Tag color="orange" style={{ border: 'none' }}>
        <span onClick={() => setShow(record)}>{record.get('sourceStatusMeaning')}</span>
        <C7nPopover record={data} />
      </Tag>
    );
  } else if (['NOT_START', 'ALL_TAKE_FINISH'].includes(value)) {
    //  灰色 结束、未开始
    return (
      <Tag color="gray" style={{ border: 'none' }}>
        <span onClick={() => setShow(record)}>{record.get('sourceStatusMeaning')}</span>
        <C7nPopover record={data} />
      </Tag>
    );
  } else {
    // 红色:警告
    return <>-</>;
  }
};

// 渲染是否打印
const printRender = ({ value, record }) => {
  const printTimes = record.get('printTimes');
  const pointStyle = {
    width: '6px',
    height: '6px',
    backgroundColor: '#ccc',
    borderRadius: '50%',
    display: 'inline-block',
    marginRight: '5px',
  };
  const lightStyle = {
    backgroundColor: '#3AB445',
  };
  const printstyle = value ? { ...pointStyle, ...lightStyle } : pointStyle;
  const text = value
    ? `${intl.get('sinv.receiptWorkbench.model.view.printed').d('已打印')}(${printTimes})`
    : intl.get('sinv.receiptWorkbench.model.view.noPrinted').d('未打印');
  return (
    <div>
      <div style={printstyle} />
      {text}
    </div>
  );
};

/**
 * fetchReceiveTransactionDetails - 获取列表数据
 * @param {Object} payload - 查询参数
 */
const fetchReceiveTransactionDetails = (page = {}, id) => {
  return queryReceiveTransactionDetails({
    page,
    rcvTrxLineId: id,
  });
};

// 已收货-导出状态
const operaClick = (record) => {
  const { rcvTrxLineId, rcvTrxHeaderId } = record?.data || {};
  c7nModal({
    style: { width: 742 },
    okCancel: false,
    okText: intl.get('hzero.common.button.close').d('关闭'),
    title: intl.get(`sinv.common.view.title.detailStatus`).d('状态明细'),
    children: (
      <ImportModal
        id={rcvTrxLineId}
        headerId={rcvTrxHeaderId}
        fetchDataSource={() => fetchReceiveTransactionDetails}
      />
    ),
  });
};

// 关联单据信息-打开
const handleOpenRelation = (record) => {
  c7nModal({
    style: { width: '1090px' },
    okCancel: false,
    bodyStyle: { padding: 0 },
    okText: intl.get('hzero.common.button.close').d('关闭'),
    title: intl.get('sinv.receiptExecution.model.receipt.associatedNum').d('关联单据信息'),
    children: <RelationIndex dataGather={record} />,
  });
};

// 状态颜色渲染
const rcvStatusRender = ({ record }) => {
  const value = record.get('rcvStatusCode');
  if (['20_SUBMITTED'].includes(value)) {
    // 绿色
    return (
      <div>
        <Tag color="green" style={{ border: 'none', height: '70px', lineHeight: '18px' }}>
          {record.get('rcvStatusCodeMeaning')}
        </Tag>
      </div>
    );
  } else if (['10_NEW'].includes(value)) {
    // 橘色
    return (
      <div>
        <Tag color="orange" style={{ border: 'none' }}>
          {record.get('rcvStatusCodeMeaning')}
        </Tag>
      </div>
    );
  } else {
    //  红色
    return (
      <div>
        <Tag color="red" style={{ border: 'none' }}>
          {record.get('rcvStatusCodeMeaning')}
        </Tag>
      </div>
    );
  }
};

export {
  c7nModal,
  C7nPopover,
  colorRender,
  printRender,
  operaClick,
  handleOpenRelation,
  rcvStatusRender,
};
