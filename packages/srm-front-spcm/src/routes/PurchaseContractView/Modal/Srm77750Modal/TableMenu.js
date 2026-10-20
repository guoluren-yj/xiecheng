import React, { useState, useEffect } from 'react';
import { Table, Tooltip } from 'choerodon-ui/pro';
import { Menu, Spin } from 'choerodon-ui';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { openTab } from 'utils/menuTab';
import { dateRender } from 'utils/renderer';
import querystring from 'querystring';
import { contractReport } from '@/services/purchaseContractViewService';
import styles from './index.less';

const TableMenu = (props) => {
  const { record, receivingDs } = props;
  const [curr, setCurr] = useState('');
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true); // 初始化loading
  const [dataInit, setDataInit] = useState([]); // 列表数据
  const getTitle = (returnedFlag) => {
    if (curr === 'receipt') {
      return returnedFlag === 1
        ? 'hzero.common.view.message.title.detail.returnDetail'
        : 'hzero.common.view.message.title.detail.receiptDetail';
    } else {
      return 'hzero.common.view.message.title.settleDetail';
    }
  };

  // eslint-disable-next-line no-shadow
  const linkRender = ({ value, record }) => {
    if (!value) return;
    const documentUrl = record.get('documentUrl');
    const returnedFlag = record.get('returnedFlag');
    return documentUrl ? (
      <a
        onClick={() => {
          const search = querystring.parse(documentUrl.substr(documentUrl.indexOf('?') + 1));
          openTab({
            key: documentUrl,
            path: curr === 'receipt' ? documentUrl : undefined,
            title: getTitle(returnedFlag),
            search: curr !== 'receipt' ? querystring.stringify(search) : undefined,
          });
        }}
      >
        {value}
      </a>
    ) : (
      value
    );
  };
  useEffect(() => {
    const getcolumns = (tagType) => {
      // tagType没有说明 没有对应的数据tagType
      if (!tagType) {
        return setColumns([]);
      }
      if (curr === 'receipt') {
        if (tagType === 'target') {
          setColumns([
            {
              name: 'pcNumAndLineNum',
              width: 170,
            },
            {
              name: 'acceptListNumAndLineNum',
              width: 170,
              renderer: linkRender,
            },
            {
              name: 'statusCodeMeaning',
              width: 120,
            },
            {
              name: 'itemName',
            },
            {
              name: 'acceptedQuantity',
              align: 'right',
            },
            {
              name: 'quantity',
              align: 'right',
            },
            {
              name: 'acceptorName',
            },
            {
              name: 'acceptDate',
              renderer: ({ value }) => dateRender(value),
            },
          ]);
        } else {
          setColumns([
            {
              name: 'pcNumAndLineNum',
              width: 170,
            },
            {
              name: 'acceptListNumAndLineNum',
              width: 170,
              renderer: linkRender,
            },
            {
              name: 'statusCodeMeaning',
              width: 120,
            },
            {
              name: 'stageName',
            },
            {
              name: 'costQuantity',
              align: 'right',
            },
            {
              name: 'acceptCostQuantity',
              align: 'right',
            },
            {
              name: 'acceptorName',
            },
            {
              name: 'acceptDate',
              renderer: ({ value }) => dateRender(value),
            },
          ]);
        }
      }
      if (curr === 'prepayment') {
        if (tagType === 'CONTRACT_SUBJECT') {
          setColumns([
            {
              name: 'pcNumAndLineNum',
              width: 170,
            },
            {
              name: 'settleNumAndLineNum',
              width: 170,
              renderer: linkRender,
            },
            {
              name: 'settleStatusMeaning',
              width: 120,
            },
            {
              name: 'itemName',
            },
            {
              name: 'contractAmount',
              align: 'right',
            },
            {
              name: 'amount',
              align: 'right',
            },
            {
              name: 'creatorName',
            },
            {
              name: 'creationDate',
              renderer: ({ value }) => dateRender(value),
            },
          ]);
        }
        if (tagType === 'CONTRACT_STAGE') {
          setColumns([
            {
              name: 'pcNumAndLineNum',
              width: 170,
            },
            {
              name: 'settleNumAndLineNum',
              width: 170,
              renderer: linkRender,
            },
            {
              name: 'settleStatusMeaning',
              width: 150,
            },
            {
              name: 'stageName',
            },
            {
              name: 'contractAmount',
              align: 'right',
            },
            {
              name: 'amount',
              align: 'right',
            },
            {
              name: 'creatorName',
            },
            {
              name: 'creationDate',
              renderer: ({ value }) => dateRender(value),
            },
          ]);
        }
        if (tagType === 'CONTRACT') {
          setColumns([
            {
              name: 'pcNumAndLineNum',
              width: 170,
            },
            {
              name: 'settleNumAndLineNum',
              width: 170,
              renderer: linkRender,
            },
            {
              name: 'settleStatusMeaning',
              width: 120,
            },
            {
              name: 'contractAmount',
              align: 'right',
            },
            {
              name: 'amount',
              align: 'right',
            },

            {
              name: 'creatorName',
            },
            {
              name: 'creationDate',
              renderer: ({ value }) => dateRender(value),
            },
          ]);
        }
      }
    };
    const fetchData = () => {
      contractReport(record.pcHeaderId)
        .then((res) => {
          if (getResponse(res) && res) {
            setDataInit(res);
            const curr2 = curr || res[0]?.documentCode;
            const findData = res.find((item) => item.documentCode === curr2);
            setCurr(curr2);
            getcolumns(findData?.tagType);
            receivingDs.setQueryParameter('documentCode', findData.documentCode);
            receivingDs.query();
          }
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    };
    fetchData();
  }, [curr]);
  const handleClick = (e) => {
    if (e.key !== curr) {
      setCurr(e.key);
      setColumns([]);
    }
  };
  const MenuCom = (
    <Menu
      mode="inline"
      className={styles.menu}
      onClick={handleClick}
      selectedKeys={[curr]}
      style={{ height: '100%' }}
    >
      {dataInit.map((item) => {
        return (
          <Menu.Item key={item.documentCode}>
            <Tooltip
              placement="left"
              title={
                <>
                  {' '}
                  {item.documentName}
                  <span className={styles.count}>{item.documentCount || 0}</span>
                </>
              }
            >
              {item.documentName}
              <span className={styles.count}>{item.documentCount || 0}</span>
            </Tooltip>
          </Menu.Item>
        );
      })}
      {/* <Menu.Item key="1">
        {intl.get(`spcm.purchaseContractView.view.message.viewMenuReceipt`).d('收货')}
      </Menu.Item>
      <Menu.Item key="2">
        {intl.get(`spcm.purchaseContractView.view.message.viewMenuSettlement`).d('结算')}
        <span>2</span> */}
      {/* </Menu.Item> */}
    </Menu>
  );
  const receivingTable = () => {
    return columns.length ? (
      <Table
        // rowkey="approvalCode"
        // rowNumber
        dataSet={receivingDs}
        columns={columns}
        border={false}
      />
    ) : (
      <div className={styles['empty-wrapper']}>
        <span>{intl.get('hzero.common.message.data.none').d('暂无数据')}</span>
      </div>
    );
  };
  const getTypeNumber = () => {
    if (dataInit.length === 0) {
      return '';
    }
    const findData = dataInit.find((item) => item.documentCode === curr);
    // 没有tagType 说明该流程没有走到相应的位置
    if (!findData?.tagType) {
      return '';
    }
    const getIfno = () => {
      if (curr === 'receipt' && findData?.tagType === 'target') {
        return {
          name: intl.get(`spcm.common.model.common.totalExecutionQuantity`).d('总执行数量'),
          info: findData?.summaryQuantity,
        };
      }
      return {
        name: intl.get(`spcm.common.model.common.totalExecutionAmount`).d('总执行金额'),
        info: findData?.summaryAmount,
      };
    };
    const obj = {
      CONTRACT: intl.get(`spcm.common.model.common.CONTRACT2`).d('预付款-协议'),
      CONTRACT_STAGE: intl.get(`spcm.common.model.common.CONTRACTSUBJECT`).d('预付款-阶段'),
      CONTRACT_SUBJECT: intl.get(`spcm.common.model.common.CONTRACTSTAGE`).d('预付款标的'),
      target: intl.get(`spcm.common.model.common.target2`).d('标的验收'),
      stage: intl.get(`spcm.common.model.common.stage2`).d('阶段验收'),
    };
    const twoL = getIfno();
    const list = [
      {
        name: intl.get(`spcm.common.model.common.type`).d('类型'),
        info: obj[findData?.tagType],
      },
      {
        ...twoL,
      },
    ];
    return (
      <div className={styles.tableHeader}>
        {list.map((item) => {
          return (
            <div>
              <div className={styles.tableHeaderName}>{item.name}</div>
              <div className={styles.tableHeaderInfo}>{item.info}</div>
            </div>
          );
        })}
      </div>
    );
  };
  // const tableC = 1 ? receivingTable : settlementTable
  return (
    <div style={{ display: 'flex' }} className={styles.content}>
      <div style={{ width: '158px' }}>{MenuCom}</div>
      <div style={{ flex: 1 }} className={styles.table}>
        <Spin spinning={loading}>
          {getTypeNumber([1, 2])}
          {receivingTable()}
        </Spin>
      </div>
    </div>
  );
};

export default TableMenu;
