import React, { useContext, useMemo } from 'react';

import intl from 'utils/intl';
import classnames from 'classnames';
import { isEmpty } from 'lodash';
import { getResponse } from 'utils/utils';
import { observer } from 'mobx-react-lite';
import notification from 'utils/notification';

import { Header, Content } from 'components/Page';
import { Spin, DataSet, Form, Table, TextField, IntlField, Select, Lov } from 'choerodon-ui/pro';
import { Button } from 'components/Permission';

import { Store } from '../storeProvider';
import { save } from '@/services/budgetItemMappingService';

import styles from '../index.less';
// 设置sbdm国际化前缀 - common - model
const commonPrompt = 'sbdm.common.model.common';

const HeaderButtons = observer(({ loading }) => {
  const {
    history,
    location,
    readOnly,
    budgetItemId,
    header,
    headerDs,
    detailListDs,
    commonUpdate,
    handleGetInfo,
  } = useContext(Store);

  // 保存
  const handleSave = async () => {
    const dataInfo = await handleGetInfo();
    if (dataInfo) {
      return new Promise(resolve => {
        save({
          ...dataInfo,
        })
          .then(res => {
            if (getResponse(res)) {
              notification.success();
              history.push('/sbud/budget-item-mapping/list');
            }
          })
          .finally(() => {
            setTimeout(() => {
              resolve();
            }, 50);
          });
      });
    }
  };

  return (
    <Header
      title={
        budgetItemId !== 'new'
          ? intl.get(`${commonPrompt}.editBudgetItemPre`).d('编辑预算维度')
          : intl.get(`${commonPrompt}.creatBudgetItem`).d('新建预算维度')
      }
      backPath="/sbud/budget-item-mapping/list"
    >
      <Button
        onClick={() => handleSave()}
        type="c7n-pro"
        icon="save"
        color="primary"
        funcType="raised"
      >
        {intl.get(`hzero.common.button.save`).d('保存')}
      </Button>
    </Header>
  );
});

const Detail = function Detail() {
  const { headerDs, detailListDs } = useContext(Store);

  const columns = useMemo(() => {
    return [
      {
        name: 'documentType',
        editor: true,
      },
      {
        name: 'fieldName',
        editor: true,
      },
      {
        name: 'fieldNameDesc',
        editor: true,
      },
      {
        name: 'translateScene',
        editor: true,
      },
    ];
  }, []);

  const DeleteBtn = observer(() => {
    const { selected } = detailListDs;
    return (
      <Button
        key="delete"
        funcType="flat"
        icon="delete_sweep"
        color="primary"
        type="c7n-pro"
        onClick={() => {
          if (selected.every(record => !record.get('budgetItemId'))) {
            detailListDs.remove(selected);
          } else {
            detailListDs.delete(selected, {
              title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
              children: (
                <div>
                  {intl
                    .get('hzero.c7nProUI.DataSet.delete_selected_row_confirm')
                    .d('确认删除选中行？')}
                </div>
              ),
            });
          }
        }}
        disabled={isEmpty(selected)}
      >
        {intl.get('hzero.common.button.batchDelete').d('批量删除')}
      </Button>
    );
  });

  const buttons = useMemo(() => {
    return ['add', <DeleteBtn />];
  }, [detailListDs]);

  return (
    <>
      <HeaderButtons />
      <div className={classnames(styles['new-detail-content'])}>
        <Content>
          <h3 className="content-title">{intl.get(`${commonPrompt}.baseInfo`).d('基本信息')}</h3>

          <Form
            dataSet={headerDs}
            showLines={6}
            columns={3}
            labelLayout="float"
            useColon={false}
            useWidthPercent
          >
            <TextField name="budgetItemCode" />
            <IntlField name="budgetItemName" />
            {/* <Select name="enabledFlag" /> */}

            <Select name="predefinedFlag" />
            <Select name="componentType" />
            {headerDs?.current?.get('componentType') !== 'TEXT' && <Lov name="lovCode" />}
            <Lov name="importTranslateScene" />
          </Form>
        </Content>

        <Content className="mapping-content">
          <h3 className="content-title">
            {intl.get(`${commonPrompt}.mappingRelation`).d('映射关系')}
          </h3>
          <Table
            style={{ maxHeight: '420px' }}
            // virtual
            // virtualCell
            customizable
            customizedCode={'SBUD_BUDGETITEM_MAPPING'}
            dataSet={detailListDs}
            columns={columns}
            buttons={buttons}
          />
        </Content>
      </div>
    </>
  );
};

export default observer(Detail);
