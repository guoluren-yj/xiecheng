import React, { useState, useEffect } from 'react';
import { Table, Tabs } from 'choerodon-ui/pro';
import { Spin } from 'choerodon-ui';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { openTab } from 'utils/menuTab';
import { dateRender } from 'utils/renderer';
import querystring from 'querystring';
import { contractReport } from '@/services/purchaseContractViewService';
import { ReactComponent as ContractAgreementNoData } from '@/assets/contractAgreementNoData.svg';
import { renderStatus } from '@/utils/renderer';
import { statusTagRender } from '@/routes/components/StatusTag';
import styles from './index.less';

const { TabPane } = Tabs;

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
            renderer: ({ record, value }) => renderStatus(record.get('statusCode'), value, 'rc'),
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
            renderer: ({ record, value }) => renderStatus(record.get('statusCode'), value, 'rc'),
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
            renderer: ({ value, dataSet, record }) =>
              statusTagRender({ text: value, name: 'settleStatus', dataSet, record }),
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
            renderer: ({ value, dataSet, record }) =>
              statusTagRender({ text: value, name: 'settleStatus', dataSet, record }),
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
            renderer: ({ value, dataSet, record }) =>
              statusTagRender({ text: value, name: 'settleStatus', dataSet, record }),
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

  const handleData = (res) => {
    const curr2 = curr || res[0]?.documentCode;
    const findData = res?.find((item) => item.documentCode === curr2);
    setCurr(curr2);
    getcolumns(findData?.tagType);
    receivingDs.setQueryParameter('documentCode', findData.documentCode);
    receivingDs.query();
  };

  const fetchData = () => {
    contractReport(record.pcHeaderId)
      .then((res) => {
        if (getResponse(res)) {
          setDataInit(res);
          handleData(res);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (curr) {
      handleData(dataInit);
    } else {
      fetchData();
    }
  }, [curr]);

  const handleClick = (key) => {
    if (key !== curr) {
      setCurr(key);
      setColumns([]);
    }
  };

  const renderNoData = () => {
    return (
      <div className={styles['no-data-wrapper']}>
        <ContractAgreementNoData />
        <div className={styles['no-data']}>
          {intl.get('spcm.common.message.noImplementation').d('暂无执行情况')}
        </div>
      </div>
    );
  };
  const receivingTable = () => {
    return columns.length ? (
      <Table
        style={{ maxHeight: 'calc(100vh - 235px)' }}
        dataSet={receivingDs}
        columns={columns}
        border={false}
      />
    ) : (
      renderNoData()
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

  return (
    <Spin spinning={loading}>
      <Tabs
        className={styles.content}
        tabBarStyle={{ width: 158, paddingTop: 16 }}
        onChange={handleClick}
        activeKey={curr}
        tabPosition="left"
      >
        {dataInit.map((data) => (
          <TabPane
            className={styles.table}
            tab={
              <>
                <span>{data.documentName}</span>
                <span className={styles.count}>{data.documentCount || 0}</span>
              </>
            }
            key={data.documentCode}
          >
            {getTypeNumber([1, 2])}
            {receivingTable()}
          </TabPane>
        ))}
      </Tabs>
    </Spin>
  );
};

export default TableMenu;
