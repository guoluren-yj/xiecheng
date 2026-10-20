import React, { useMemo, useState, useEffect } from 'react';
import {
  useDataSet,
  Table,
  Spin,
  Button,
} from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { isEmpty } from 'lodash';
import { observer } from 'mobx-react-lite';
import styles from './index.less';
import { HeaderDS, TableDS } from './store';
import { commonDelete, FooterBtns } from '../utils';

const CardTitle = ({ title }) => (
  <h3 className={styles['card-sub-title']}>
    <div className={styles['card-sub-title-line']} />
    {title}
  </h3>
);

const Index = (props) => {
  const { name, bomDimensionConfigId, isEdit, modal, bomTemplateId, bomDimensionCode } = props;
  const tableDs = useDataSet(() => TableDS({ bomDimensionConfigId, conType: name, bomTemplateId, isEdit }), [bomDimensionConfigId, name, bomTemplateId, isEdit]);
  const headerDs = useDataSet(() => ({
    ...HeaderDS({ bomDimensionConfigId, bomDimensionCode, conType: name }),
    children: {
      conLineList: tableDs,
    },
  }), [bomDimensionConfigId, name]);

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (modal) {
      const { update } = modal;
      const btnProps = {
        modal,
        isEdit,
        tableDs,
        submitDs: headerDs,
      };
      update({
        footer: () => <FooterBtns {...btnProps} />,
      });
    }
  }, [tableDs, isEdit]);

  const init = async () => {
    headerDs.query();
  };

  const handleDelete = async () => {
    commonDelete(tableDs);
  };

  const columns = useMemo(
    () =>
      [
        {
          name: 'sourceFieldId',
          editor: isEdit,
          width: 150,
        },
        {
          name: 'relation',
          editor: isEdit,
          width: 150,
        },
        {
          name: 'targetValue',
          editor: isEdit,
          width: 120,
        },
      ].filter((item) => item),
    [isEdit]
  );

  const TableButtons = observer((btnProps) => {
    const { ds } = btnProps;
    const buttonCommonProps = {
      color: 'primary',
      funcType: 'flat',
    };
    return [
      <Button
        data-name="create"
        icon="playlist_add"
        disabled={ds.length === 1}
        onClick={() => { ds.create({}); }}
        {...buttonCommonProps}
      >
        {intl.get(`hzero.common.btn.add`).d('新增')}
      </Button>,
      <Button
        data-name="delete"
        icon="delete_sweep"
        disabled={isEmpty(ds.selected)}
        onClick={handleDelete}
        {...buttonCommonProps}
      >
        {intl.get(`hzero.common.button.batchdelete`).d('批量删除')}
      </Button>,
    ];
  });

  return (
    <>
      {/* <CardTitle title={intl.get('spc.bomDimConfig.view.title.conditionList').d('判断条件')} /> */}
      <Table
        customizable
        customizedCode="SPC.BOM_DIM_CONFIG.CONDITION"
        dataSet={tableDs}
        columns={columns}
        buttons={isEdit && [<TableButtons ds={tableDs} />]}
        style={{ maxHeight: 'calc(100vh - 178px)' }}
      />
    </>
  );
};

export default Index;
