import React, { useMemo } from 'react';
import { Button, DataSet, Table, IntlField } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import intl from 'srm-front-boot/lib/utils/intl';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import { observer } from 'mobx-react-lite';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { ShowValidation } from 'choerodon-ui/pro/lib/form/enum';
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import { ColumnAlign, ColumnLock } from 'choerodon-ui/pro/lib/table/enum';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import Record from 'choerodon-ui/pro/lib/data-set/Record';
import styles from './index.less';

interface IProps {
  configDs: DataSet;
  currentTenantId: any;
  currentImportId: string;
}

const Index = (props: IProps) => {
  const { configDs, currentImportId, currentTenantId } = props;
  const createSheet = async () => {
    const lastRecord = await configDs?.last();
    const index = lastRecord?.get('orderSeq') ? Number(lastRecord?.get('orderSeq')) + 1 : 1;
    configDs.create({
      businessObjectImportTemplateId: currentImportId,
      sheetIndex: index,
      sheetName: `Sheet${Number(lastRecord?.get('sheetName').substr(5, 1) || 0) + 1}`,
      tenantId: getCurrentOrganizationId(),
    });
  };

  const columns = useMemo((): ColumnProps[] => {
    return [
      {
        name: 'sheetName',
        align: ColumnAlign.center,
        renderer: ({ record }) => {
          return (
            <IntlField style={{ width: '100%' }} record={record!} name='sheetName' showValidation={ShowValidation.newLine} />
          );
        },
      },
      {
        header: intl.get('hzero.common.table.column.option').d('操作'),
        align: ColumnAlign.center,
        hidden: currentTenantId !== getCurrentOrganizationId(),
        width: 40,
        renderer: ({ record }) => {
          return (
            <Icon
              className={styles['delete-icon']}
              type='delete'
              onClick={() => {
                configDs.delete(record as Record);
              }}
            />
          );
        },
        lock: ColumnLock.right,
      },
    ];
  }, []);

  const buttons = currentTenantId === getCurrentOrganizationId() ? [
    <Button
      style={{ marginRight: 10 }}
      color={ButtonColor.default}
      icon="playlist_add"
      onClick={() => {
        createSheet();
      }}
    >
      {intl.get('hmde.boComposition.importTemplate.buttom.createSheet').d('新增页签')}
    </Button>,
  ]: undefined;

  return (
    <div>
      <Table
        dataSet={configDs}
        columns={columns}
        // rowDraggable
        buttons={buttons}
        // dragColumnAlign={DragColumnAlign.left}
        showRemovedRow={false}
        showHeader={false}
        rowHeight='auto'
      />
    </div>
  );
};

export default formatterCollections({
  code: ['hmde.boComposition', 'hmde.common', 'hzero.common'],
})(observer(Index));
