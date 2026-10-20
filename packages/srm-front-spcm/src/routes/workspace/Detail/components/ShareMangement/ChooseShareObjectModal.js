/**
 * 协议详情-选择共享对象
 */
import React, { useEffect, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { Button, Table, Form, TextField } from 'choerodon-ui/pro';
import intl from 'utils/intl';

const { FilterBar } = Table;

const QueryBar = (queryBarProps) => {
  const { queryDataSet, queryFieldsLimit } = queryBarProps;
  const handleQuery = useCallback(() => queryDataSet.query(), [queryDataSet]);
  const handleReset = useCallback(() => queryDataSet.reset(), [queryDataSet]);
  if (queryDataSet) {
    return (
      <>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Form columns={queryFieldsLimit} dataSet={queryDataSet} style={{ width: '40%' }}>
            <TextField
              name="roleName"
              placeholder={intl
                .get('spcm.workspace.view.textField.roleNamePlaceholder')
                .d('请输入子账户名称、子账户账号或角色查询')}
            />
          </Form>
          <Button onClick={handleReset}>{intl.get('hzero.common.button.reset').d('重置')}</Button>
          <Button color="primary" onClick={handleQuery}>
            {intl.get('hzero.common.button.search').d('查询')}
          </Button>
        </div>
        <div style={{ display: 'none' }}>
          <FilterBar {...queryBarProps} />
        </div>
      </>
    );
  }
  return null;
};

const ChooseShareObjectModal = (props) => {
  const {
    dataSet,
    refreshData = () => {},
    modal: { update, close },
  } = props;

  useEffect(() => {
    dataSet.query();
  }, []);

  const columns = [
    {
      name: 'realName',
    },
    {
      name: 'loginName',
    },
    {
      name: 'roleName',
    },
  ];

  useEffect(() => {
    updateFooter();
  }, []);

  const handleConfirm = async () => {
    dataSet.submit(true).then((res) => {
      if (res) {
        close();
        refreshData();
      }
    });
  };

  const ModalBtns = observer((btnProps) => {
    const isSelected = (btnProps.dataSet.selected || []).length !== 0;
    return [
      <Button color="primary" disabled={!isSelected} onClick={handleConfirm}>
        {intl.get('hzero.common.button.confirm').d('确定')}
      </Button>,
      <Button onClick={close}>{intl.get('hzero.common.button.cancel').d('取消')}</Button>,
    ];
  });

  const renderBar = (queryBarProps) => <QueryBar {...queryBarProps} />;

  const updateFooter = () => {
    update({
      footer: (
        <div>
          <ModalBtns dataSet={dataSet} />
        </div>
      ),
    });
  };

  const getTableRender = useCallback(() => {
    return (
      <Table
        dataSet={dataSet}
        queryFieldsLimit={1}
        queryBar={renderBar}
        columns={columns}
        style={{ maxHeight: '350px' }}
      />
    );
  });

  return getTableRender();
};

export default ChooseShareObjectModal;
