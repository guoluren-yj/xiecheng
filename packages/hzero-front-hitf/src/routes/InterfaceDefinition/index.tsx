import React, { useMemo, useCallback, useEffect } from 'react';
import { Icon } from 'choerodon-ui';
import { DataSet, Button, Menu, Dropdown, TextField, Modal } from 'choerodon-ui/pro';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { Action } from 'choerodon-ui/lib/trigger/enum';
import { SelectionMode, TableAutoHeightType } from 'choerodon-ui/pro/lib/table/enum';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column.d';
import withProps from 'hzero-front/lib/utils/withProps';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import intl from 'hzero-front/lib/utils/intl';
import notification from 'hzero-front/lib/utils/notification';

import { omit } from 'lodash';

import { Header } from 'hzero-front/lib/components/Page';

import { listTreeDS, listTableDS, modalTableDS } from '@/stores/InterfaceDefinition/InterfaceDefinitionDS';

import tagRender from '@/utils/TagRender';

import LeftTree from './LeftTree';
import Manual from './Manual';
import styles from './index.less';

const InterfaceDefinition: React.FC<any> = ({ history, tableDs }) => {
  const treeDs = useMemo(() => new DataSet(listTreeDS()), []);
  // const tableDs = useMemo(() => new DataSet(listTableDS()), []);
  const modalTableDs = useMemo(() => new DataSet(modalTableDS()), []);

  useEffect(()=>{
    tableDs.query(tableDs.currentPage);
  }, []);
  // 检索
  const handleSearch = (params) => {
    let filterValues: { interfaceCode?: string } = params;
    const { interfaceCode = '' } = filterValues;
    filterValues = omit(filterValues, ['__dirty', 'tenantLov']);
    tableDs.setQueryParameter('queryParams', {
      ...filterValues,
      interfaceName: interfaceCode,
    });
    tableDs.query();
  };

  // 选择内部接口新建
  const handleCreate = useCallback(() => {
    if (modalTableDs.selected.length > 0) {
      const record: any = modalTableDs.selected[0];
      const { serviceCode, interfaceUrl } = record.get(['serviceCode', 'interfaceUrl']);
      history.push({
        pathname: '/hitf/interface-definition/create-detail',
        state: {
          selectedData: {
            serviceCode,
            interfaceUrl,
            serviceType: 'inside',
            interfaceStandardType: 'standard',
          },
        },
      });
    } else {
      notification.warning({
        message: intl.get('hitf.common.manual.warning').d('请先选择一个接口'),
      });
      return false;
    }
  }, [modalTableDS]);

  // 外部接口新建
  const handleOutCreate = useCallback(() => {
    history.push({
      pathname: '/hitf/interface-definition/create-detail',
      state: {
        selectedData: {
          serviceType: 'external',
          interfaceStandardType: 'secondAlter',
        },
      },
    });
  }, []);

  // 编辑接口
  const handleEdit = useCallback((serviceType, interfaceId) => {
    if (serviceType === 'external') {
      history.push({
        pathname: `/hitf/interface-definition/detail/${interfaceId}`,
        state: {
          selectedData: {
            serviceType: 'external',
          },
        },
      });
    } else {
      history.push({
        pathname: `/hitf/interface-definition/detail/${interfaceId}`,
        state: {
          selectedData: {
            serviceType: 'inside',
          },
        },
      });
    }
  }, []);

  const openModal = useCallback(() => {
    Modal.open({
      title: intl.get('hitf.common.manual.modal').d('选择内部接口'),
      closable: true,
      maskClosable: true,
      destroyOnClose: true,
      drawer: true,
      children: <Manual tableDs={modalTableDs} />,
      className: styles['interface-definition-modal'],
      okText: intl.get('hzero.common.button.new').d('新建'),
      onOk: handleCreate,
    });
  }, [modalTableDs]);

  const menu = (
    <Menu>
      <Menu.Item
        key='manual'
        onClick={openModal}
      >
        <span>{intl.get('hitf.common.inner.interface').d('内部接口')}</span>
      </Menu.Item>
      <Menu.Item key='api' onClick={handleOutCreate}>
        <span>{intl.get('hitf.common.outer.interface').d('外部接口')}</span>
      </Menu.Item>
    </Menu>
  );

  const treeRender = useMemo(() => {
    return <LeftTree treeDs={treeDs} tableDs={tableDs} />;
  }, [treeDs, tableDs]);

  const columns = useMemo(
    (): ColumnProps[] => [
      {
        name: 'statusMeaning',
        width: 110,
        renderer: ({ value, record }) => {
          const status = record ? record.get('status') : '';
          return <span>{tagRender(status, value)}</span>;
        },
      },
      {
        name: 'interfaceCode',
        renderer: ({ value, record }) => {
          const { interfaceId = '', serviceType = '' } = record ? record.get(['interfaceId', 'serviceType']) : {};
          return (
            <span
              className={styles['link-span']}
              onClick={() => handleEdit(serviceType, interfaceId)}
            >
              {value}
            </span>
          );
        },
      },
      {
        name: 'interfaceName',
      },
      { name: 'tenantName' },
      { name: 'applicationTypeMeaning' },
      { name: 'interfaceTypeMeaning' },
      { name: 'interfaceStandardTypeMeaning' },
      { name: 'requestMethodMeaning' },
      { name: 'publishTypeMeaning' },
      { name: 'creationName' },
      { name: 'creationDate' },
    ],
    [],
  );

  return (
    <>
      <Header title={intl.get('hitf.interface.definition.title.header').d('接口定义')}>
        <Dropdown overlay={menu} trigger={[Action.hover]}>
          <Button
            icon='add'
            color={ButtonColor.primary}
          >
            {intl.get('hzero.common.button.creation').d('新建')}
            <Icon type='expand_more' />
          </Button>
        </Dropdown>
      </Header>
      <div className={styles['interface-definition-container']}>
        <div className={styles['interface-definition-content']}>
          <div className={styles['content-left']}>
            {treeRender}
          </div>
          <div className={styles['content-right']}>
            <SearchBarTable
              searchCode='HITF.INTERFACE.DEFINITION.FILTER'
              selectionMode={SelectionMode.none}
              columns={columns}
              dataSet={tableDs}
              cacheState
              searchBarConfig={{
                autoQuery: false,
                left: {
                  render: (_, dataSet) => {
                    return (
                      <TextField
                        clearButton
                        dataSet={dataSet}
                        name='interfaceCode'
                        placeholder={intl
                          .get('hitf.interface.definition.filter.codeAndName')
                          .d('请输入接口编码、接口名称查询')}
                        prefix={<Icon type='search' />}
                        style={{ width: '280px', margin: '0 20px 4px 0', zIndex: 0 }}
                      />
                    );
                  },
                },
                onQuery: ({ params }) => handleSearch(params),
                fieldProps: {
                  tenantId: {
                    lovPara: {
                      tenantId: undefined,
                    },
                  },
                },
              }}
              autoHeight={{ type: TableAutoHeightType.maxHeight, diff: -80 }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default React.memo(formatterCollections({
  code: ['hzero.common', 'hitf.common', 'hitf.application', 'hitf.interface'],
})(withProps(() => {
  const tableDs = new DataSet(listTableDS());
  return { tableDs };
}, {
  cacheState: true,
})(InterfaceDefinition)));

