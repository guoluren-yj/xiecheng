/**
 * index.js - 多云环境企业信息变更菜单切换记录
 * @date: 2024-04-28
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { compose, isNil } from 'lodash';

import { DataSet, Table, Button, Spin, Modal } from 'choerodon-ui/pro';
import { Alert } from 'choerodon-ui';
import withProps from 'utils/withProps';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import { getResponse } from 'utils/utils';

import { renderStatus, tableHeight } from '@/routes/components/utils';
import { executeChangeRoleTemplate } from '@/services/multiCloudRoleTemplateService';

import { tableDS } from './stores/getIndexDS';
import styles from './index.less';

const Index = ({ tableDs }) => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    tableDs.query();
  }, []);

  const getColumns = useCallback(() => {
    return [
      {
        name: 'status',
        renderer: renderStatus,
      },
      {
        name: 'roleCode',
      },
      {
        name: 'actionTypeMeaning',
      },
      {
        name: 'creationDate',
      },
      {
        name: 'createdByMeaning',
      },
      {
        name: 'remark',
      },
    ];
  }, []);

  const handleExecute = () => {
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl
        .get('sslm.roleTemplateChange.view.message.executeTips')
        .d('请确认是否对角色模板进行调整。'),
      onOk: () => {
        const flag = window?.SSLM_CONSTANT_TEMPT_CHANGE_FLAG;
        const params = {
          newOrOldFlag: isNil(flag) ? 1 : flag,
        };
        setLoading(true);
        return executeChangeRoleTemplate(params)
          .then(res => {
            if (getResponse(res)) {
              tableDs.query();
            }
          })
          .finally(() => {
            setLoading(false);
          });
      },
    });
  };

  return (
    <Fragment>
      <Header
        title={intl
          .get('sslm.roleTemplateChange.view.title.roleTemplateChange')
          .d('多云角色模板调整')}
      >
        <Button onClick={() => handleExecute()} color="primary" icon="done_all">
          {intl.get('hzero.common.button.trigger').d('执行')}
        </Button>
      </Header>
      <Alert
        banner
        showIcon
        closable
        type="warning"
        iconType="info"
        message={intl
          .get('sslm.roleTemplateChange.view.messages.alertTips')
          .d('此功能为部分多云租户特殊处理角色模板所用，由发版负责人执行，其他人员请勿随意操作。')}
        className={styles['role-template-change-alert']}
      />
      <Content>
        <Spin spinning={loading}>
          <div style={{ height: tableHeight.hasTab }}>
            <Table
              dataSet={tableDs}
              columns={getColumns()}
              style={{ maxHeight: `calc(100% - 40px)` }}
            />
          </div>
        </Spin>
      </Content>
    </Fragment>
  );
};

export default compose(
  formatterCollections({
    code: ['sslm.common', 'sslm.roleTemplateChange'],
  }),
  withProps(
    () => {
      const tableDs = new DataSet(tableDS());
      return { tableDs };
    },
    { cacheState: true }
  )
)(Index);
