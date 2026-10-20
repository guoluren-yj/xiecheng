/**
 * 卡片管理
 */
import React, { useEffect, useState } from 'react';
import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import { DataSet, Table, Button, useModal } from 'choerodon-ui/pro';
import { Badge } from 'choerodon-ui';
import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';
import { getResponse, getCurrentUser } from 'utils/utils';

import SortSelector from '@/components/SortSelector';
import QueryBarMore from '@/components/QueryBarMore';
import { fetchEnabledCard } from '@/services/cardManageService';

import { CardsListDS, CardDetailDS, CardHistoryDS, DistribTableDS } from './stores/cardsManageDS';

import CardEditForm from './CardEditForm';
import CardDetail from './CardDetail';

const { themeConfigVO = {} } = getCurrentUser();
const {
  colorCode = '#29BECE', // 主题色
  // componentColorList, // 组件主题列表
} = themeConfigVO;

const CardsManagement = (props) => {
  const { cardsListDS, cardDetailDS, cardHistoryDS } = props;

  const [refresh, setRefresh] = useState(false);

  const Modal = useModal();

  useEffect(() => {
    cardsListDS.setQueryParameter('sort', 'lastUpdateDate,desc');
    cardsListDS.query();
  }, []);

  useEffect(() => {
    if (refresh) {
      setRefresh(false);
    }
  }, [refresh]);

  /**
   * 新建、编辑操作
   * @param {*} record
   */
  const handleEdit = (record) => {
    const title = record
      ? intl.get('sdat.cardsManage.view.message.editCard').d('编辑卡片')
      : intl.get('sdat.cardsManage.view.message.createCard').d('新建卡片');

    const modal = Modal.open({
      title,
      drawer: true,
      closable: true,
      destroyOnClose: true,
      style: {
        width: '380px',
      },
      children: <CardEditForm localRecord={record} dataSet={cardDetailDS} />,
      onCancel: closeModal,
      footer: () => (
        <>
          <Button color="primary" onClick={handleSubmit}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button onClick={closeModal}>{intl.get('hzero.common.btn.cancel').d('取消')}</Button>
        </>
      ),
    });

    /**
     * 确认保存卡片详情
     */
    const handleSubmit = async () => {
      const isValid = await cardDetailDS.validate();
      if (isValid) {
        cardDetailDS.submit().then((res) => {
          if (getResponse(res)) {
            closeModal();
            cardsListDS.query();
          }
        });
      }
    };

    const closeModal = () => {
      cardDetailDS.data = [];
      cardDetailDS.reset();
      modal.close();
    };
  };

  /**
   * 启用禁用操作
   * @param {*} record
   */
  const handleEnabled = (record) => {
    const pageNum = cardsListDS?.currentPage ?? 0;
    if (record && record.get('cardId')) {
      record.set('loading', true);
      fetchEnabledCard({
        ...record.toData(),
        enabledFlag: record.get('enabledFlag') === 1 ? 0 : 1,
      }).then((res) => {
        record.set('loading', false);
        if (getResponse(res)) {
          cardsListDS.query(pageNum);
        }
      });
    }
  };

  /**
   * 查看详情
   * @param {*} record
   */
  const handleViewDetail = (record) => {
    const modal = Modal.open({
      title: intl.get('sdat.cardsManage.view.message.cardDetail').d('卡片详情'),
      drawer: true,
      closable: true,
      destroyOnClose: true,
      style: {
        width: '800px',
      },
      children: (
        <CardDetail localRecord={record} cardFormDS={cardDetailDS} historyDS={cardHistoryDS} />
      ),
      footer: () => (
        <>
          <Button color="primary" onClick={closeModal}>
            {intl.get('hzero.common.button.close').d('关闭')}
          </Button>
        </>
      ),
    });

    const closeModal = () => {
      cardDetailDS.data = [];
      cardDetailDS.reset();
      cardHistoryDS.data = [];
      cardHistoryDS.reset();
      modal.close();
    };
  };

  // /**
  //  * 分发租户
  //  */
  // const handleDistribution = (record) => {
  //   const modal = Modal.open({
  //     title: intl.get('sdat.cardsManage.view.message.distributionTenant').d('分发租户'),
  //     drawer: true,
  //     closable: true,
  //     destroyOnClose: true,
  //     style: {
  //       width: '800px',
  //     },
  //     children: (
  //       <DistribModal localRecord={record} distribTableDS={distribTableDS} />
  //     ),
  //     footer: () => (
  //       <>
  //         <Button color="primary" onClick={handleOk}>
  //           {intl.get('hzero.common.button.ok').d('确定')}
  //         </Button>
  //         <Button onClick={closeModal}>
  //           {intl.get('hzero.common.button.cancel').d('取消')}
  //         </Button>
  //       </>
  //     ),
  //   });

  //   const handleOk = () => {

  //   };

  //   const closeModal = () => {
  //     distribTableDS.data = [];
  //     distribTableDS.reset();
  //     modal.close();
  //   };
  // };

  const columns = () => {
    return [
      {
        name: 'code',
        width: 120,
        lock: 'left',
        renderer: ({ text, record }) => {
          return <a onClick={() => handleViewDetail(record)}>{text}</a>;
        },
      },
      { name: 'name', width: 200 },
      { name: 'type' },
      { name: 'level' },
      { name: 'groupCode' },
      { name: 'reportId', width: 200 },
      { name: 'projectId', width: 150 },
      { name: 'initSize' },
      { name: 'orderSeq' },
      {
        name: 'enabledFlag',
        align: 'left',
        width: 120,
        renderer: ({ record }) => {
          return (
            <span>
              &nbsp;&nbsp;&nbsp;&nbsp;
              <Badge dot style={{ background: record.get('enabledFlag') > 0 ? '#52c41a' : '' }} />
              &nbsp;
              {record.get('enabledFlag') > 0
                ? intl.get('sdat.cardsManage.status.hasAbled').d('已启用')
                : intl.get('sdat.cardsManage.status.hasEnabled').d('已禁用')}
            </span>
          );
        },
      },
      { name: 'lastUpdateDate', width: 180 },
      {
        name: 'operation',
        header: intl.get('hzero.common.table.column.options').d('操作'),
        width: 180,
        renderer: ({ record }) => {
          const status = record.get('enabledFlag');
          return (
            <span className="action-link">
              <a style={{ marginRight: '10px' }} onClick={() => handleEdit(record)}>
                {intl.get('sdat.cardsManage.view.button.edit').d('编辑')}
              </a>
              <Button
                funcType="link"
                style={{ color: colorCode }}
                loading={record.get('loading')}
                onClick={() => handleEnabled(record)}
              >
                {status
                  ? intl.get('hzero.common.status.disabled').d('禁用')
                  : intl.get('hzero.common.button.enabled').d('启用')}
              </Button>
              {/* {
                record.get('cardLevel') === 'TENANT' && (
                  <a style={{ marginRight: '10px' }} onClick={() => handleDistribution(record)}>
                    {intl.get('sdat.cardsManage.view.button.distribution').d('分发租户')}
                  </a>
                )
              } */}
            </span>
          );
        },
      },
    ];
  };

  /**
   * 排序字段
   */
  const fields = [
    {
      name: 'orderSeq',
      label: intl.get(`sdat.cardsManage.model.cardSort`).d('卡片排序'),
    },
    {
      name: 'lastUpdateDate',
      label: intl.get(`sdat.cardsManage.model.lastUpdateTime`).d('最后更新时间'),
    },
  ];

  const handleQuerySort = (sortFieldCode, sortType) => {
    const sort = `${sortFieldCode},${sortType?.toLowerCase() ?? ''}`;
    cardsListDS.setQueryParameter('sort', sort);
    cardsListDS.query();
  };

  const rightRender = () => {
    return (
      <div className="search-sort-area">
        <SortSelector
          sortFieldCode="lastUpdateDate"
          onSortQuery={handleQuerySort}
          fields={fields}
        />
      </div>
    );
  };

  const renderQueryBar = (prop) => {
    return <QueryBarMore renderRight={rightRender} {...prop} />;
  };

  return (
    <>
      <Header title={intl.get('sdat.cardsManage.view.header.cardsManagement').d('卡片管理')}>
        <Button color="primary" icon="add" onClick={() => handleEdit('')}>
          {intl.get('hzero.common.button.creation').d('新建')}
        </Button>
      </Header>
      <Content>
        <Table
          dataSet={cardsListDS}
          columns={columns()}
          queryBar={renderQueryBar}
          customizable
          columnDraggable
          customizedCode="SDAT-PLATFORM-CARDS-MANAGEMENT-LIST"
        />
      </Content>
    </>
  );
};

export default formatterCollections({
  code: ['sdat.cardsManage', 'srm.filterBar'],
})(
  withProps(
    () => {
      const cardsListDS = new DataSet(CardsListDS());
      const cardDetailDS = new DataSet(CardDetailDS());
      const cardHistoryDS = new DataSet(CardHistoryDS());
      const distribTableDS = new DataSet(DistribTableDS());

      return { cardsListDS, cardDetailDS, cardHistoryDS, distribTableDS };
    },
    { cacheState: true, keepOriginDataSet: true }
  )(CardsManagement)
);
