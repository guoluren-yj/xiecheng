/* eslint-disable no-unused-vars */
/*
 * @Descripttion: 业务对象管理页面
 * @Date: 2021-08-04 13:39:58
 * @Author: ZHIJIAN.XU@HAND-CHINA.COM
 * @version: 0.0.1
 * @copyright: Copyright (c) 2021, Hand
 */
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { isEmpty, forEach, isObject, isNull } from 'lodash';
import { Header, Content } from 'hzero-front/lib/components/Page';
import request from 'hzero-front/lib/utils/request';
// import { API_HOST } from 'hzero-front/lib/utils/config';
import { getResponse, isTenantRoleLevel, getCurrentUser } from 'hzero-front/lib/utils/utils';
import intl from 'srm-front-boot/lib/utils/intl';
import { enableTagRender } from 'hzero-front/lib/utils/renderer';
import withProps from 'hzero-front/lib/utils/withProps';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import { observer } from 'mobx-react-lite';
import { DataSet, Button, Modal } from 'choerodon-ui/pro';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { ColumnAlign, ColumnLock, TableAutoHeightType } from 'choerodon-ui/pro/lib/table/enum';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { Popconfirm } from 'choerodon-ui';
import FilterBarTable from 'srm-front-boot/lib/components/FilterBarTable';

import { statusTagRender } from '@/utils/render';
import { DomainDS } from '@/stores/Domain/DomainDS';
import BusinessObjectDataSet from '@/stores/BusinessObject/BusinessObjectDS';
import { PublishStatus, SourceType } from '@/businessGlobalData/common';
import { queryIntlDataService } from '@/services/businessObjectService';

// TODO:提测前删除
import { HZERO_HMDE } from '@/utils/config';
import { lowcodeOrganizationURL } from '@/utils/common';

import styles from './index.less';
import CreateBOModal from './CreateBOModal';
import sourceStore from '../store';

interface IDomainItem extends Object {
  domainId: string;
  domainCode: string;
  domainName: string;
  icon: string;
  serviceCode: string;
  sourceType?: SourceType;
  extendTableEnabledFlag?: SourceType;
}

const isTenant = isTenantRoleLevel();
let cacheDsValue; // 右侧 ds 查询条件缓存

const DomainOwnBOList = props => {
  const { boTableDs, history } = props;
  const hashDomainId = location.hash?.substr(1);
  const { permissionFlag, queryPermission } = React.useContext<any>(sourceStore as any).store;
  const { loginName } = getCurrentUser() || {};
  const isAdmin = loginName === 'admin';
  const allowEdit = isAdmin || isTenant || (window.$$env || {}).HMDE_ADD_FIELD === "true";

  const handlePush = item => {
    cacheDsValue = boTableDs.queryDataSet?.data?.[0].data;
    const { businessObjectId } = item;
    // history.push(`/hmde/business-object/detail/${id}`);
    history.push({
      pathname: `/hmde/business-object/detail/${businessObjectId}`,
      state: {
        originKey: 'fieldList',
      },
    });
  };
  const emptyDomain: IDomainItem = {} as IDomainItem;
  const [domain, setDomain] = useState<IDomainItem>(emptyDomain);

  const domainListDs = useMemo(() => new DataSet(DomainDS()), []);
  const extendTableEnabledFlagRef: any = useRef();

  useEffect(() => {
    return () => {
      const val = boTableDs.queryDataSet?.data;
      cacheDsValue = val?.[0]?.data;
    };
  }, [boTableDs]);

  useEffect(() => {
    if (cacheDsValue && isObject(cacheDsValue)) {
      setTimeout(() => {
        forEach(cacheDsValue, (value, key) => {
          // eslint-disable-next-line no-unused-expressions
          boTableDs.queryDataSet?.current?.set(key, value); // 不能通过 loadData 方式，否则重置按钮恢复初始值会改变
        });
      }, 0);
    }
  }, [boTableDs]);

  useEffect(() => {
    const init = () => {
      if (!isTenant && isNull(permissionFlag)) {
        queryPermission();
      }
      domainListDs.query(domainListDs.currentPage).then(res => {
        if (hashDomainId && Array.isArray(res)) {
          // eslint-disable-next-line eqeqeq
          const findItem = res.find(ele => ele.domainId == hashDomainId);
          setDomain(findItem || emptyDomain);
          extendTableEnabledFlagRef.current = findItem?.extendTableEnabledFlag;
        }
        if (!hashDomainId && !res?.failed) {
          setDomain(res?.[0] || emptyDomain);
          extendTableEnabledFlagRef.current = res?.[0]?.extendTableEnabledFlag;
        }
      });
    };
    init();
  }, []);

  useEffect(() => {
    if (boTableDs?.queryDataSet?.current?.reset) boTableDs.queryDataSet.current.reset(); // 切换领域重置表格搜索域
    boTableDs.setQueryParameter('domainId', domain?.domainId);
    if (domain?.domainId) boTableDs.query(boTableDs.currentPage);
    queryIntlDataService().then(res => {
      if (getResponse(res)) {
        const intlStr = JSON.stringify(
          res?.map?.(item => ({
            code: item.code,
            value: item.value,
            description: item.description,
            meaning: item.meaning,
            name: item.name,
          }))
        );
        sessionStorage.setItem('multiLanguageStr', intlStr);
      }
    });
  }, [domain?.domainId]);

  const handleEnableBO = async id => {
    const res = await request(
      // `${API_HOST}/hmde/v1/${
      //   isTenantRoleLevel() ? `${getUserOrganizationId()}/` : ''
      // }business-objects/${id}/enabled`,
      `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/business-objects/${id}/enabled`,
      {
        method: 'PUT',
      }
    );
    if (getResponse(res)) {
      boTableDs.query();
    }
  };

  const handleDisableBO = async id => {
    const res = await request(
      // `${API_HOST}/hmde/v1/${
      //   isTenantRoleLevel() ? `${getUserOrganizationId()}/` : ''
      // }business-objects/${id}/disabled`,
      `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/business-objects/${id}/disabled`,
      {
        method: 'PUT',
      }
    );
    if (getResponse(res)) {
      boTableDs.query();
    }
  };
  const handleCreateBO = () => {
    Modal.open({
      title: (
        <div className={styles['modal-title']}>
          {intl.get('hmde.bo.button.createBo').d('创建业务对象')}
        </div>
      ),
      style: { width: '66.5%' },
      contentStyle: { maxHeight: '85%', display: 'flex', flexDirection: 'column' },
      closable: true,
      border: false,
      autoCenter: true,
      okText: intl.get('hzero.common.button.save').d('保存'),
      cancelText: intl.get('hzero.common.button.cancel').d('取消'),
      okFirst: false,
      children: (
        <CreateBOModal
          dataSet={boTableDs}
          domainId={domain?.domainId}
          serviceCode={domain?.serviceCode}
          domainCode={domain?.domainCode}
          extendTableEnabledFlag={extendTableEnabledFlagRef.current}
        />
      ),
    });
  };

  const columns = (): ColumnProps[] => [
    {
      name: 'publishStatus',
      width: 140,
      renderer: ({ value }) => statusTagRender(value.toUpperCase()),
    },
    {
      name: 'businessObjectCode',
      renderer: ({ record, value }) => {
        return (
          <a style={{ verticalAlign: 'initial' }} onClick={() => handlePush(record?.toData())}>
            {value}
          </a>
        );
      },
    },
    {
      name: 'businessObjectName',
    },
    {
      name: 'sourceType',
    },
    {
      name: 'tenantName',
    },
    {
      name: 'remark',
    },
    {
      name: 'enabledFlag',
      align: ColumnAlign.center,
      renderer: ({ value }) => enableTagRender(value ? 1 : 0),
    },
    {
      header: intl.get('hzero.common.table.column.option').d('操作'),
      width: 120,
      hidden: isTenant,
      // align: ColumnAlign.center,
      lock: ColumnLock.right,
      renderer: ({ dataSet, record }) => {
        const canEdit = !isTenant || (isTenant && record?.get('sourceType') === 'TENANT');
        const operators: any[] = [];
        if (!(record?.get('sourceType') === 'PREDEFINE' && !isTenant)) {
          if (record?.get('enabledFlag')) {
            operators.push(
              <Button
                funcType={FuncType.link}
                style={{ verticalAlign: 'text-bottom' }}
                onClick={() => handleDisableBO(record?.get('businessObjectId'))}
              >
                {intl.get('hzero.common.button.disabled').d('禁用')}
              </Button>
            );
          } else {
            operators.push(
              <Button
                funcType={FuncType.link}
                style={{ verticalAlign: 'text-bottom' }}
                onClick={() => handleEnableBO(record?.get('businessObjectId'))}
              >
                {intl.get('hzero.common.button.enabled').d('启用')}
              </Button>
            );
          }
        }

        if (record?.get('publishStatus').toUpperCase() === PublishStatus.UNPUBLISHED && allowEdit) {
          operators.push(
            <Popconfirm
              title={intl.get('hzero.common.message.confirm.delete').d('是否删除此条记录？')}
              okText={intl.get('hzero.common.button.ok').d('确定')}
              cancelText={intl.get('hzero.common.button.cancel').d('取消')}
              onConfirm={() => dataSet?.delete(record, false)}
            >
              <Button funcType={FuncType.link} style={{ marginRight: 8, verticalAlign: 'text-bottom' }}>
                {intl.get('hzero.common.button.delete').d('删除')}
              </Button>
            </Popconfirm>
          );
        }
        return canEdit ? operators : [];
      },
    },
  ];

  const beforeQuery = () => {

  };

  return (
    <>
      <Header
        title={intl.get('hmde.bo.tab.title').d('业务对象')}
      >
        {!isTenant && permissionFlag && domain?.sourceType !== SourceType.PREDEFINE && allowEdit && (
          <Button
            icon="add"
            color={ButtonColor.primary}
            onClick={() => handleCreateBO()}
            disabled={isEmpty(domain)}
          >
            {intl.get('hmde.bo.button.createBo').d('创建业务对象')}
          </Button>
        )}
      </Header>
      <Content>
        <FilterBarTable
          dataSet={boTableDs}
          columns={columns()}
          filterBarConfig={{
            cacheKey: 'HMDE.BUSINESS_OJBECT.LIST',
            autoQuery: false,
          }}
          cacheState
          style={{ maxHeight: `calc(100vh - 230px)` }}
          customizable
          customizedCode='HMDE.BUSINESS_OJBECT.LIST'
        />
      </Content>
    </>
  );
};

export default formatterCollections({
  code: ['hmde.bo', 'hzero.common', 'hmde.domain', 'hmde.common', 'hmde.domainOwnBOList'],
})(withProps(() => {
  const boTableDs = new DataSet(BusinessObjectDataSet({}));
  return {
    boTableDs,
  };
},
{ cacheState: true })(observer(DomainOwnBOList)));
