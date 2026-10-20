import React, { useEffect, useState } from 'react';
import { Table, Spin, Tooltip } from 'hzero-ui';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import styles from './index.less';

const ExpertScoreModal = React.memo((props) => {
  const { dispatch, expertScoreTypeMeaning, openBidOrderMeaning, rfxHeaderId } = props;

  const businessFirstIcon = (
    <span className={styles['expertScoring-Icon']}>
      {intl.get('ssrc.expertScoring.view.table.businessFirst').d('商务No.1')}
    </span>
  );
  const techFirstIcon = (
    <span className={styles['expertScoring-Icon']}>
      {intl.get('ssrc.expertScoring.view.table.techFirst').d('技术NO.1')}
    </span>
  );
  const BUSINESS_TECHNOLOGY = (
    <Tooltip
      title={intl
        .get('ssrc.expertScoring.view.table.businessAndTechFirstTip')
        .d('商务分No.1和技术分NO.1')}
    >
      <span className={styles['expertScoring-Icon']}>
        {intl.get('ssrc.expertScoring.view.table.businessAndTechFirst').d('商&技NO.1')}
      </span>
    </Tooltip>
  );

  const [state, setState] = useState({
    data: [],
    spinning: true,
  });
  const [columns, setColumns] = useState([
    {
      title: intl.get('ssrc.inquiryHall.model.inquiryHall.supplierName').d('供应商名称'),
      dataIndex: 'supplierCompanyName',
      minWidth: 300,
      render: (value, record) => {
        let icon;
        if (record.oneTeam === 'TECHNOLOGY') {
          icon = techFirstIcon;
        } else if (record.oneTeam === 'BUSINESS') {
          icon = businessFirstIcon;
        } else if (record.oneTeam === 'BUSINESS_TECHNOLOGY') {
          icon = BUSINESS_TECHNOLOGY;
        }
        return (
          <div>
            <div className={styles['expertScoring-supplierCompanyName']}>
              {record.supplierCompanyName}
            </div>
            {!record.otherTeam && icon}
          </div>
        );
      },
    },
    {
      title: intl.get('ssrc.inquiryHall.model.inquiryHall.summary').d('汇总'),
      width: 100,
      key: 'Summary',
      fixed: 'right',
      dataIndex: 'score',
      sorter: (a, b) => a.score - b.score,
    },
  ]);

  useEffect(() => {
    dispatch({
      type: 'inquiryHall/fetchCheckPriceExpertScore',
      payload: { rfxHeaderId },
    }).then((res) => {
      if (res && !isEmpty(res) && Array.isArray(res)) {
        const index = columns.findIndex((item) => item.key === 'supplierCompanyName');
        // 存在商务技术组的情况
        if (res[0]?.otherTeam && Array.isArray(res[0]?.otherTeam)) {
          const otherArray =
            res[0]?.otherTeam?.map((item, myIndex) => ({
              title: item.expertName,
              key: `other${myIndex}`,
              minWidth: 70,
              render: (value, record) => {
                const myIndex1 = record?.otherTeam.findIndex(
                  (x) => x.expertName === item.expertName
                );
                return record.otherTeam[myIndex1].sumIndicScore;
              },
            })) || [];
          columns.splice(index, 0, {
            title: intl
              .get('ssrc.inquiryHall.model.inquiryHall.businessTechnologyTeam')
              .d('商务技术组'),
            key: 'businessTechnologyTeam',
            children: otherArray,
          });
          setColumns(columns);
        }
        // 存在商务组和技术组的情况
        else {
          const myColumn = [
            {
              title: intl.get('ssrc.inquiryHall.model.inquiryHall.businessTeam').d('商务组'),
              key: 'bussinessGroup',
            },
            {
              title: intl.get('ssrc.inquiryHall.model.inquiryHall.technologyTeam').d('技术组'),
              key: 'technologyTeam',
            },
          ];
          const businessArray =
            res[0]?.busTeam?.map((item, myIndex) => ({
              title: item.expertName,
              key: `business${myIndex}`,
              minWidth: 70,
              render: (value, record) => {
                const myIndex1 = record?.busTeam.findIndex((x) => x.expertName === item.expertName);
                return record.busTeam[myIndex1].sumIndicScore;
              },
            })) || [];
          const techArray =
            res[0]?.teachTeam?.map((item, myIndex) => ({
              title: item.expertName,
              key: `tech${myIndex}`,
              minWidth: 70,
              render: (value, record) => {
                const myIndex1 = record?.teachTeam.findIndex(
                  (x) => x.expertName === item.expertName
                );
                return record.teachTeam[myIndex1].sumIndicScore;
              },
            })) || [];
          columns.splice(index, 0, ...myColumn);
          columns.forEach((item) => {
            if (item.key === 'bussinessGroup') {
              // eslint-disable-next-line no-param-reassign
              item.children = businessArray;
            } else if (item.key === 'technologyTeam') {
              // eslint-disable-next-line no-param-reassign
              item.children = techArray;
            }
          });
          setColumns(columns);
        }
        setState({ ...state, data: res, spinning: false });
      } else {
        setState({ ...state, spinning: false });
      }
    });
  }, []);

  return (
    <Spin spinning={state.spinning}>
      <div>
        <header className={styles['expertScoring-header']}>
          <span>
            {`${intl
              .get('ssrc.inquiryHall.view.checkPrice.scoreType')
              .d('评分方式')}：${expertScoreTypeMeaning}`}
          </span>
          <span>
            {`${intl
              .get('ssrc.inquiryHall.view.checkPrice.bidEvaluationType')
              .d('评标步置')}：${openBidOrderMeaning}`}
          </span>
        </header>
        <Table columns={columns || []} bordered dataSource={state.data || []} pagination={false} />
      </div>
    </Spin>
  );
});

export default formatterCollections({
  code: ['ssrc.inquiryHall', 'ssrc.expertScoring'],
})(ExpertScoreModal);
