import React, { useMemo, useEffect, useState, useCallback } from 'react';
import { Icon } from 'choerodon-ui';
import { DataSet, Button, Modal, TextField } from 'choerodon-ui/pro';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column.d';
import { SelectionMode, TableAutoHeightType } from 'choerodon-ui/pro/lib/table/enum';

import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import intl from 'hzero-front/lib/utils/intl';

import { omit } from 'lodash';

import { getResponse, getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import { queryMapIdpValue } from 'hzero-front/lib/services/api';

import { Header } from 'hzero-front/lib/components/Page';
import notification from 'hzero-front/lib/utils/notification';

import { listTableDS, detailFormDS, detailInputDS, detailOutputDS } from '@/stores/InterfaceComponentLibrary';
import { saveInterfaceComponent } from '@/services/interfaceComponentLibraryService';
import tagRender from '@/utils/TagRender';
import Detail from './Detail';

import styles from './index.less';

const organizationId = getCurrentOrganizationId();

const InterfaceComponentLibrary: React.FC<any> = () => {
  const tableDs = useMemo(() => new DataSet(listTableDS()), []);
  const [selectList, setSelectList] = useState({ statusList: [], moduleTypeList: [], convertMethodList: [] });
  useEffect(() => {
    queryMapIdpValue(
      {
        fieldList: 'HITF.OPEN.FIELD_TYPE',
      }
    ).then((res) => {
      const result = getResponse(res);
      setSelectList(result);
    });
  }, []);

  const columns = useMemo(
    (): ColumnProps[] => [
      {
        name: 'enableFlag',
        width: 110,
        renderer: ({ value }) => {
          const meaning = parseInt(value, 10) ? intl.get('hzero.common.enable').d('启用') : intl.get('hzero.common.disable').d('禁用');
          return <span>{tagRender(value, meaning)}</span>;
        },
      },
      {
        name: 'moduleCode',
        renderer: ({ value, record }) => {
          const moduleHeaderId = record ? record.get('moduleHeaderId') : '';
          return (
            <span
              className={styles['link-span']}
              onClick={() => openModal('edit', moduleHeaderId)}
            >
              {value}
            </span>
          );
        },
      },
      {
        name: 'moduleName',
      },
      { name: 'moduleTypeMeaning' },
      { name: 'moduleDesc' },
    ],
    [selectList]
  );

  // 新建接口组件
  const openModal = (type, moduleHeaderId) => {
    const detailFormDs = new DataSet(detailFormDS());
    const inputDs = new DataSet(detailInputDS(moduleHeaderId));
    const outputDs = new DataSet(detailOutputDS(moduleHeaderId));
    const detailProps = {
      headerId: moduleHeaderId,
      selectList,
      detailFormDs,
      inputDs,
      outputDs,
    };
    Modal.open({
      title: type === 'create' ?
        intl.get('hitf.common.create.interface.component').d('新建接口组件') :
        intl.get('hitf.common.edit.interface.component').d('编辑接口组件'),
      closable: true,
      maskClosable: true,
      destroyOnClose: true,
      drawer: true,
      children: <Detail {...detailProps} />,
      className: styles['interface-component-modal'],
      okText: intl.get('hzero.common.button.save').d('保存'),
      onOk: () => handleSave(detailFormDs, inputDs, outputDs),
    });
  };

  // 保存接口组件
  const handleSave = useCallback(async (detailFormDs, inputDs, outputDs) => {
    const validate = await detailFormDs.validate();
    const inputValidate = await inputDs.validate();
    const outputValidate = await outputDs.validate();
    if (!validate || !inputValidate || !outputValidate) {
      return false;
    }
    const formValue = detailFormDs.toData()[0];
    const { enableFlag } = formValue;
    const inputValue = inputDs.toData();
    const outputValue = outputDs.toData();
    const moduleLineListArr: Object[] = [];
    inputValue.forEach(item => {
      moduleLineListArr.push({ fieldCategory: 'INPUT', ...item });
    });
    outputValue.forEach(item => {
      moduleLineListArr.push({ fieldCategory: 'OUTPUT', ...item });
    });
    const params = {
      tenantId: organizationId,
      ...formValue,
      enableFlag: parseInt(enableFlag, 10),
      moduleLineList: moduleLineListArr,
    };
    saveInterfaceComponent(params).then(res => {
      const result = getResponse(res);
      if (result) {
        notification.success({});
        tableDs.query();
      }
    });
  }, []);

  // 检索
  const handleSearch = (params) => {
    let filterValues: { moduleCode?: string } = params;
    const { moduleCode = '' } = filterValues;
    filterValues = omit(filterValues, ['__dirty']);
    tableDs.setQueryParameter('queryParams', {
      ...filterValues,
      moduleName: moduleCode,
    });
    tableDs.query();
  };

  return (
    <>
      <Header title={intl.get('hitf.interface.library.title.header').d('接口组件库')}>
        <Button
          icon="add"
          color={ButtonColor.primary}
          onClick={() => openModal('create', null)}
        >
          {intl.get('hzero.common.button.creation').d('新建')}
        </Button>
      </Header>
      <div className={styles['interface-component']}>
        <SearchBarTable
          searchCode="HITF.INTERFACE.COMPONENT.FILTER"
          selectionMode={SelectionMode.none}
          columns={columns}
          dataSet={tableDs}
          cacheState
          searchBarConfig={{
            left: {
              render: (_, dataSet) => {
                return (
                  <TextField
                    clearButton
                    dataSet={dataSet}
                    name="moduleCode"
                    placeholder={intl
                      .get('hitf.interface.component.filter.codeAdnName')
                      .d('请输入组件编码、组件名称查询')}
                    prefix={<Icon type="search" />}
                    style={{ width: '280px', margin: '0 20px 4px 0', zIndex: 0 }}
                  />
                );
              },
            },
            onQuery: ({ params }) => handleSearch(params),
            closeFilterSelector: true,
            expandable: false,
          }}
          autoHeight={{ type: TableAutoHeightType.maxHeight, diff: -50 }}
        />
      </div>
    </>
  );
};

export default React.memo(formatterCollections({
  code: ['hzero.common', 'hitf.common', 'hitf.application', 'hitf.interface'],
})(InterfaceComponentLibrary));

