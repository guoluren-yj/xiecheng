import React, { Fragment, useMemo, useRef } from 'react';
import { Table, Button, useDataSet, Modal } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { yesOrNoRender } from 'utils/renderer';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import BudgetItemDetail from '@/routes/components/BudgetItemDetail';
import notification from 'utils/notification';
import { save } from '@/services/budgetItemPreService';
import TableDs from './store/indexDs';

// import styles from './index.less';
// 设置sbdm国际化前缀 - common - model
const commonPrompt = 'sbdm.common.model.common';

const Index = function Index() {
  const tableDs = useDataSet(() => TableDs(), []);

  const detailRef = useRef(null);

  const handleSave = () => {
    return new Promise(async (resolve) => {
      const detailInfo = await detailRef.current?.getDetailInfo();

      if (detailInfo) {
        save({
          ...detailInfo,
        }).then((res) => {
          if (getResponse(res)) {
            notification.success();
            tableDs.query();
            resolve();
          } else {
            resolve(false);
          }
        });
        // .finally(() => {
        //   resolve();
        // });
      } else {
        resolve(false);
      }
    });
  };

  const openModal = (record) => {
    let title = intl.get(`${commonPrompt}.creatBudgetItem`).d('新建预算维度');
    let formData = {
      enabledFlag: 1,
      predefinedFlag: 1,
    };
    if (record) {
      title = intl.get(`${commonPrompt}.editBudgetItemPre`).d('编辑预算维度');
      formData = record.toData();
    }

    Modal.open({
      key: Modal.key(),
      drawer: true,
      style: { width: '1090px' },
      // bodyStyle: { paddingTop: '20px' },
      title,
      children: (
        <>
          <BudgetItemDetail formData={formData} ref={detailRef} />
        </>
      ),
      closable: true,
      movable: false,
      destroyOnClose: true,
      onOk: handleSave,
      onCancel: () => {},
    });
  };

  const columns = useMemo(() => {
    return [
      {
        name: 'budgetItemCode',
        width: 200,
        renderer: ({ value, record }) => <a onClick={() => openModal(record)}>{value}</a>,
      },
      {
        name: 'budgetItemName',
        width: 300,
      },
      {
        name: 'enabledFlag',
        width: 250,
        renderer: ({ value }) => yesOrNoRender(Number(value)),
      },
      {
        name: 'componentType',
        width: 250,
      },
      {
        name: 'lovCode',
        width: 350,
      },
      {
        name: 'importTranslateSceneDescription',
        width: 350,
      },
    ];
  });

  return (
    <Fragment>
      <Header title={intl.get(`${commonPrompt}.budgetItemPre`).d('预算维度预定义')}>
        <Button type="c7n-pro" color="primary" icon="add" onClick={() => openModal()}>
          {intl.get(`hzero.common.button.create`).d('新建')}
        </Button>
      </Header>
      <Content>
        <Table dataSet={tableDs} columns={columns} queryFieldsLimit={3} />
      </Content>
    </Fragment>
  );
};

export default formatterCollections({
  code: ['sbdm.common'],
})(Index);
