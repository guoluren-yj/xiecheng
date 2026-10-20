import React, { useMemo } from 'react';
import { Button, DataSet, Table } from 'choerodon-ui/pro';
import intl from 'srm-front-boot/lib/utils/intl';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import { observer } from 'mobx-react-lite';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import { ColumnAlign, ColumnLock } from 'choerodon-ui/pro/lib/table/enum';
import { operatorRender } from 'hzero-front/lib/utils/renderer';
import ImgIcon from '@/utils/ImgIcon';
import { Operators } from '@/businessGlobalData/common';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import Record from 'choerodon-ui/pro/lib/data-set/Record';

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
        align: ColumnAlign.left,
        editor: true,
      },
      {
        header: intl.get('hzero.common.table.column.option').d('操作'),
        align: ColumnAlign.center,
        width: 40,
        renderer: ({ record }) => {
          const operators: Operators = [
            getCurrentOrganizationId() === record?.get('tenantId') && {
              key: 'editor',
              ele: (
                <ImgIcon
                  onClick={() => {
                    configDs.delete(record as Record);
                  }}
                  name="delete_template.svg"
                  size={18}
                  style={{
                    marginTop: 2,
                    visibility: 'visible',
                    verticalAlign: 'sub',
                    cursor: 'pointer',
                  }}
                />
              ),
              len: 2,
              title: intl.get('hzero.common.button.delete').d('删除'),
            },
          ];
          return operatorRender(operators, record, { limit: 1 });
        },
        lock: ColumnLock.right,
      },
    ];
  }, []);

  return (
    <div>
      <Table
        dataSet={configDs}
        columns={columns}
        // rowDraggable
        // dragColumnAlign={DragColumnAlign.left}
        showRemovedRow={false}
        showHeader={false}
      />
      {currentTenantId === getCurrentOrganizationId() && (
        <Button
          style={{ marginRight: 10 }}
          color={ButtonColor.default}
          icon="add"
          onClick={() => {
            createSheet();
          }}
        >
          {intl.get('hmde.bo.importTemplate.buttom.createSheet').d('新增页签')}
        </Button>
      )}
    </div>
  );
};

export default formatterCollections({ code: ['hmde.bo', 'hzero.common'] })(observer(Index));
