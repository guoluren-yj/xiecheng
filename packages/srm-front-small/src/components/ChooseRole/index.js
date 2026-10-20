import React, { useMemo, useState, useLayoutEffect, useEffect } from 'react';
import { isEmpty, compose } from 'lodash';
import classnames from 'classnames';
import { Lov, DataSet, Modal } from 'choerodon-ui/pro';

import { fetchItemPermission } from '@/services/mallHomeConfigService';
import intl from 'utils/intl';
import { getCurrentUserId } from 'utils/utils';
import remote from 'hzero-front/lib/utils/remote';
import { lovDefineAxiosConfig } from '../../utils/c7nUiConfig';
import styles from './index.less';

function ChooseRole(props) {
  const {
    onChange = e => e,
    defaultData = {},
    defaultRole = 'purchase',
    changeFlag = true, // 是否可以更改
    remote: remoteProcess,
  } = props;
  const [currentRole, setCurrentRole] = useState(defaultRole);
  const [hasPermission, setHasPermission] = useState(undefined);
  // 是否有权限 有权限才能配置集团

  useLayoutEffect(() => {
    fetchItemPermission(['srm.mall.tenant.buying-manage.mall-config.button.tenant.level']).then(
      res => {
        setHasPermission(res?.[0]?.approve);
      }
    );
  }, []);

  useLayoutEffect(() => {
    if (hasPermission === undefined) return;
    if (defaultRole === 'tenant' && !hasPermission) {
      setCurrentRole('purchase');
      changeRole('purchase');
    }
  }, [hasPermission]);

  const ds = useMemo(() => {
    const dsProps = {
      fields: [
        {
          name: 'unitLov',
          type: 'object',
          textField: 'purUnitName',
          valueField: 'purUnitId',
          lovCode: 'SMAL.DECORATION_UNIT',
        },
        {
          name: 'unitId',
          bind: 'unitLov.purUnitId',
        },
        {
          name: 'unitName',
          bind: 'unitLov.purUnitName',
        },
      ],
    };
    return remoteProcess ? new DataSet(remoteProcess.process('PROCESS_UNIT', dsProps, {lovDefineAxiosConfig})) : new DataSet(dsProps);
  }, []);

  useEffect(() => {
    ds.loadData([defaultData]);
  }, [defaultData]);

  useEffect(() => {
    setCurrentRole(defaultRole);
  }, [defaultRole]);

  const changeRole = (type, purchase = {}) => {
    if (!changeFlag) {
      Modal.confirm({
        title: intl.get('small.common.view.tips').d('提示'),
        children: intl
          .get('small.mallHomeConfig.view.change.warningdesc')
          .d('当前信息尚未保存，继续操作将导致修改数据丢失，请确认是否继续操作。'),
        onOk: () => {
          changeInfo(type, purchase);
        },
      });
      return;
    }
    changeInfo(type, purchase);
  };

  function changeInfo(type, purchase = {}) {
    setCurrentRole(type);
    onChange({ role: type, purchase });

    const storageData = window.localStorage.getItem('small-purchase-config') || '';
    window.localStorage.setItem(
      'small-purchase-config',
      JSON.stringify({
        ...(!isEmpty(storageData) ? JSON.parse(storageData) : {}),
        [getCurrentUserId()]: { role: type, purchase },
      })
    );
  }

  return (
    <div className={styles.content}>
      <div className="role-list">
        {hasPermission && (
          <div
            className={classnames(['btn', { active: currentRole === 'tenant' }])}
            onClick={() => changeRole('tenant')}
          >
            {intl.get('small.common.view.tenant').d('租户')}
          </div>
        )}
        <div
          className={classnames(['btn', { active: currentRole === 'purchase' }])}
          onClick={() => changeRole('purchase')}
        >
          {intl.get('small.common.purchasebuy.Organization').d('采买组织')}
        </div>
      </div>
      {currentRole === 'purchase' && (
        <div className="role-lov">
          <Lov
            dataSet={ds}
            name="unitLov"
            clearButton={false}
            onChange={data => {
              const lovData = data || {};
              changeRole(currentRole, {
                ...lovData,
                unitId: lovData.purUnitId,
                unitName: lovData.purUnitName,
                unitCode: lovData.purUnitCode,
              });
            }}
            placeholder={intl.get('small.common.view.pleaseChoose', {value: intl.get('small.common.purchase.buy.Organization').d('采购组织') }).d(`请选择${intl.get('small.common.purchase.buy.Organization').d('采购组织')}`)}
          />
        </div>
      )}
    </div>
  );
}

export default compose(
  remote({
    code: 'SMAll_COMPONENTS_CHOOSEROLE',
    name: 'remote',
  })
)(ChooseRole);
