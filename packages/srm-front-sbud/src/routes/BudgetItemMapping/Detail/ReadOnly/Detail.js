import React, { useContext, useMemo } from 'react';

import intl from 'utils/intl';
import classnames from 'classnames';
import { isEmpty } from 'lodash';
import { getResponse } from 'utils/utils';
import { observer } from 'mobx-react-lite';
import notification from 'utils/notification';

import { Header, Content } from 'components/Page';
import { DataSet, Form, Table, Output } from 'choerodon-ui/pro';
import { Button } from 'components/Permission';

import { Store } from '../storeProvider';
// import { save } from '@/services/budgetItemMappingService';

import styles from '../index.less';
// 设置sbdm国际化前缀 - common - model
const commonPrompt = 'sbdm.common.model.common';

const HeaderButtons = observer(({ loading }) => {
  return (
    <Header
      title={intl.get(`${commonPrompt}.budgetItemPreDetail`).d('预算维度详情')}
      backPath="/sbud/budget-item-mapping/list"
    />
  );
});

const Detail = function Detail() {
  const { headerDs, detailListDs } = useContext(Store);

  const columns = useMemo(() => {
    return [
      {
        name: 'documentType',
      },
      {
        name: 'fieldName',
      },
      {
        name: 'fieldNameDesc',
      },
      {
        name: 'translateScene',
      },
    ];
  }, []);

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
            useColon={false}
            useWidthPercent
            labelLayout="vertical"
            labelAlign="left"
            className="c7n-pro-vertical-form-display"
          >
            <Output name="budgetItemCode" />
            <Output name="budgetItemName" />
            {/* <Output name="enabledFlag" /> */}

            <Output name="predefinedFlag" />
            <Output name="componentType" />
            {headerDs?.current?.get('componentType') !== 'TEXT' && <Output name="lovCode" />}
            <Output name="importTranslateScene" />
          </Form>
        </Content>

        <Content className="mapping--read-content">
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
            buttons={[]}
          />
        </Content>
      </div>
    </>
  );
};

export default observer(Detail);
