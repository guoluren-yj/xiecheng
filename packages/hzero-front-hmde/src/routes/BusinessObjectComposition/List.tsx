import { observer } from 'mobx-react-lite';
import React, { useEffect, useMemo } from 'react';
import { isNull } from 'lodash';
import intl from 'srm-front-boot/lib/utils/intl';
import { DataSet, Button, Modal } from 'choerodon-ui/pro';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { enableTagRender, yesOrNoRender } from 'hzero-front/lib/utils/renderer';
import { statusTagRender } from '@/utils/render';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { ColumnAlign, ColumnLock, TableAutoHeightType } from 'choerodon-ui/pro/lib/table/enum';
import { Header } from 'hzero-front/lib/components/Page';
import qs from 'querystring';
import { ObjectCompositionDS, ObjectCompositionListDS } from '@/stores/BusinessObjectComposition/ObjectCompositionDS';
import { PublishStatus } from '@/businessGlobalData/common';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { HZERO_HMDE } from '@/utils/config';
import { lowcodeOrganizationURL } from '@/utils/common';
import request from 'hzero-front/lib/utils/request';
import withProps from 'hzero-front/lib/utils/withProps';
import {
  getResponse,
  getCurrentOrganizationId,
  isTenantRoleLevel,
  getCurrentUser,
} from 'hzero-front/lib/utils/utils';
import FilterBarTable from 'srm-front-boot/lib/components/FilterBarTable';
import { createBoComposition, deleteBoComposition } from '@/services/businessObjectService';
import ImportButton from './ImportButton';
import ExportButton from './ExportButton';
import CreateCompositionModal from './CreateCompositionModal';
import styles from './index.less';
import sourceStore from './store';

const isTenant = isTenantRoleLevel();
const DATA_MIGRATE_ENABLE = window.$$env.HMDE_DATA_MIGRATE_ENABLE; // 环境变量，用于控制导入导出按钮是否显示

const BusinessObjectComposition = observer((props: any) => {
  const { history, boCompositionDS } = props;
  const { loginName } = getCurrentUser() || {};
  const isAdmin = loginName === 'admin';
  const allowEdit = isAdmin || isTenant || (window.$$env || {}).HMDE_ADD_FIELD === "true";

  const createCompositionDS: DataSet = useMemo(
    () => new DataSet(ObjectCompositionDS(true) as DataSetProps),
    []
  );

  const { permissionFlag, queryPermission } = React.useContext<any>(sourceStore as any).store;

  useEffect(() => {
    if (!isTenant && isNull(permissionFlag)) {
      queryPermission();
    }
  }, []);

  const handlePush = record => {
    history.push({
      pathname: `/hmde/business-object-composition/detail/${record.get('businessObjectId')}`,
      search: qs.stringify({
        masterBusinessObjectId: record.get('masterBusinessObjectId'),
        businessObjectName: record.get('businessObjectName'),
        businessObjectCombineId: record.get('businessObjectId'),
      }),
    });
  };

  const handleEnable = async id => {
    const res = await request(
      `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/business-objects/${id}/enabled`,
      {
        method: 'PUT',
      }
    );
    if (getResponse(res)) {
      boCompositionDS.query(boCompositionDS.currentPage);
    }
  };

  const handleDisable = async id => {
    const res = await request(
      `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/business-objects/${id}/disabled`,
      {
        method: 'PUT',
      }
    );
    if (getResponse(res)) {
      boCompositionDS.query(boCompositionDS.currentPage);
    }
  };

  const handleCreate = () => {
    Modal.open({
      title: intl.get('hmde.boComposition.button.create').d('新建组合业务对象'),
      drawer: true,
      closable: true,
      style: { width: '400px' },
      destroyOnClose: true,
      children: <CreateCompositionModal createCompositionDS={createCompositionDS} />,
      okText: intl.get('hzero.common.button.save').d('保存'),
      onOk: async () => {
        if (!createCompositionDS.current?.get('masterBusinessObjectId')) {
          // eslint-disable-next-line no-unused-expressions
          createCompositionDS.current?.set('masterObject', null);
        }
        const validate = await createCompositionDS.current?.validate();
        const data = createCompositionDS?.current?.toJSONData() || {};
        const { businessObjectCode, domainCode } = data;
        if (validate) {
          const res = await createBoComposition({
            body: {
              ...data,
              businessObjectCode: `${domainCode}_C_${businessObjectCode}`,
            },
          });
          if (getResponse(res)) {
            // eslint-disable-next-line no-unused-expressions
            createCompositionDS?.current?.reset();
            boCompositionDS.query();
          } else {
            return false;
          }
        } else {
          return false;
        }
      },
    });
  };

  const handleDelete = record => {
    deleteBoComposition(record.get('businessObjectId')).then(res => {
      if (getResponse(res)) {
        boCompositionDS.query(boCompositionDS.currentPage);
      }
    });
  };

  const columns = (): ColumnProps[] => [
    {
      name: 'publishStatus',
      width: 140,
      renderer: ({ value }) => statusTagRender(value),
    },
    {
      name: 'businessObjectCode',
      align: ColumnAlign.left,
      renderer: ({ value, record }) => {
        return (
          <a
            onClick={() => {
              handlePush(record);
            }}
          >
            {value}
          </a>
        );
      },
    },
    {
      name: 'businessObjectName',
      align: ColumnAlign.left,
    },
    {
      name: 'tenantName',
      align: ColumnAlign.left,
    },
    {
      name: 'masterBusinessObjectName',
      align: ColumnAlign.left,
    },
    {
      name: 'masterBusinessObjectCode',
      align: ColumnAlign.left,
    },
    {
      name: 'remark',
      align: ColumnAlign.left,
    },
    {
      name: 'standardFlag',
      align: ColumnAlign.left,
      renderer: ({ value }) => yesOrNoRender(value ? 1 : 0),
    },
    {
      name: 'enabledFlag',
      align: ColumnAlign.left,
      renderer: ({ value }) => enableTagRender(value ? 1 : 0),
    },
    {
      header: intl.get('hzero.common.table.column.option').d('操作'),
      width: 150,
      align: ColumnAlign.left,
      hidden: !isTenant && permissionFlag === false,
      lock: ColumnLock.right,
      renderer: ({ record }) => {
        const operators: any[] = [];
        if (record?.get('enabledFlag') && record.get('tenantId') === getCurrentOrganizationId()) {
          operators.push(
            <Button
              funcType={FuncType.link}
              onClick={() => {
                handleDisable(record?.get('businessObjectId'));
              }}
            >
              {intl.get('hzero.common.button.disable').d('禁用')}
            </Button>
          );
        } else if (record?.get('tenantId') === getCurrentOrganizationId()) {
          operators.push(
            <Button
              funcType={FuncType.link}
              onClick={() => {
                handleEnable(record?.get('businessObjectId'));
              }}
            >
              {intl.get('hzero.common.button.enable').d('启用')}
            </Button>
          );
        }
        if (allowEdit && record?.get('publishStatus')?.toUpperCase() === PublishStatus.UNPUBLISHED) {
          operators.push(
            <Button
              funcType={FuncType.link}
              style={{ marginRight: 8 }}
              onClick={() => {
                Modal.confirm({
                  title: intl.get('hzero.common.message.confirm.title').d('提示'),
                  children: (
                    <span>
                      {intl
                        .get('hmde.boComposition.view.message.deleteConfirm')
                        .d('请确认是否删除该组合业务对象？')}
                    </span>
                  ),
                  okText: intl.get('hzero.common.button.sure').d('确定'),
                  onOk: () => {
                    handleDelete(record);
                  },
                });
              }}
            >
              {intl.get('hzero.common.button.delete').d('删除')}
            </Button>
          );
        }
        return operators;
      },
    },
  ];

  return (
    <>
      <Header
        title={
          <div className={styles['header-title']}>
            {intl.get('hmde.boComposition.tab.title').d('组合业务对象')}
          </div>
        }
      >
        {(isTenant || permissionFlag) && allowEdit && (
          <Button
            icon="add"
            color={ButtonColor.primary}
            onClick={() => {
              handleCreate();
            }}
          >
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        )}
        {isTenant && DATA_MIGRATE_ENABLE === 'true' && (
          <>
            <ImportButton />
            <ExportButton data={boCompositionDS.selected} />
          </>
        )}
      </Header>
      <div className={styles.content}>
        <FilterBarTable
          cacheState
          dataSet={boCompositionDS}
          columns={columns()}
          filterBarConfig={{
            cacheKey: 'HMDE.BUSINESS_OBJECT_COMPOSITION.LIST',
          }}
          style={{ maxHeight: `calc(100vh - 230px)` }}
          customizable
          customizedCode='HMDE.BUSINESS_OBJECT_COMPOSITION.LIST'
        />
      </div>
    </>
  );
});

export default withProps(() => {
  const boCompositionDS = new DataSet(ObjectCompositionListDS(false));
  return {
    boCompositionDS,
  };
},
{ cacheState: true })(BusinessObjectComposition);
