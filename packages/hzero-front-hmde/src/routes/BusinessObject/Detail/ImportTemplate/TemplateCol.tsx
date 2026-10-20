import React, { useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import intl from 'srm-front-boot/lib/utils/intl';
import { DataSet, Table, Button, Modal } from 'choerodon-ui/pro';
import notification from 'hzero-front/lib/utils/notification';
import { getResponse, getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import { observer } from 'mobx-react-lite';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { ColumnAlign } from 'choerodon-ui/pro/lib/table/enum';
import { Buttons } from 'choerodon-ui/pro/lib/table/Table';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { TemplateColDS } from '@/stores/BusinessObject/TemplateColDS';
import { treeDS } from '@/stores/BusinessObjectComposition/ImportTemplateFieldsDS';
import { deleteTemplateCol, saveSheetPage } from '@/services/businessObjectService';
import ImportSelectModal from './ImportSelectModal';

interface IProps {
  data?: any;
  businessObjectId: string;
  currentImportId: string;
  tenantId: any;
  refAll?: any;
  sheetDS: DataSet;
  businessObjectImportTemplateSheetId: string;
  [x: string]: any;
}

const TemplateCol = (props: IProps) => {
  const {
    businessObjectId,
    businessObjectImportTemplateSheetId,
    refAll,
    currentImportId,
    tenantId,
    sheetDS,
  } = props;
  refAll[businessObjectImportTemplateSheetId] = useRef();
  const templateColListDS: DataSet = useMemo(
    () => new DataSet(TemplateColDS(true, businessObjectImportTemplateSheetId) as DataSetProps),
    []
  );
  const fieldTreeDS: DataSet = useMemo(() => new DataSet(treeDS()), []);
  useEffect(() => {
    if (businessObjectImportTemplateSheetId) {
      templateColListDS.query();
    }
  }, []);

  useImperativeHandle(refAll[businessObjectImportTemplateSheetId], () => ({
    templateColListDS,
    businessObjectImportTemplateSheetId,
  }));

  // const handleCreateField = () => {
  //   Modal.open({
  //     title: intl.get('hmde.bo.exportTemplate.button.selectField').d('字段选择'),
  //     drawer: false,
  //     closable: true,
  //     style: { width: '800px' },
  //     destroyOnClose: true,
  //     children: (
  //       <ImportSelectModal
  //         currentImportId={currentImportId}
  //         businessObjectId={businessObjectId}
  //         id={businessObjectImportTemplateSheetId}
  //         templateColListDS={templateColListDS}
  //         fieldTreeDS={fieldTreeDS}
  //         tenantId={tenantId}
  //       />
  //     ),
  //     okText: intl.get('hzero.common.button.sure').d('确定'),
  //     onOk: async () => {
  //       const lastRecord = await templateColListDS?.last();
  //       let index = lastRecord?.get('orderSeq')
  //         ? 10 * Math.floor(Number(lastRecord?.get('orderSeq')) / 10)
  //         : 0;
  //       const data = fieldTreeDS?.selected.map(item => {
  //         index += 10;
  //         return {
  //           ...item?.toJSONData(),
  //           businessObjectImportTemplateSheetId,
  //           fieldName: item?.get('businessObjectFieldName'),
  //           orderSeq: index,
  //           requiredFlag: false,
  //           translatableFlag: false,
  //           enabledFlag: true,
  //           validatableFlag: false,
  //           tenantId: getCurrentOrganizationId(),
  //         };
  //       });
  //       const record = sheetDS?.filter(sheet => {
  //         return (
  //           sheet?.get('businessObjectImportTemplateSheetId') ===
  //           businessObjectImportTemplateSheetId
  //         );
  //       })[0];
  //       const body = [{ ...record?.toJSONData(), importTemplateColumns: data }];
  //       saveSheetPage({
  //         body,
  //       }).then(res => {
  //         if (getResponse(res)) {
  //           templateColListDS.query();
  //           sheetDS.query();
  //         }
  //       });
  //     },
  //   });
  // };

  // const handleDelete = () => {
  //   // eslint-disable-next-line no-unused-expressions
  //   templateColListDS.selected.length &&
  //     deleteTemplateCol({
  //       body: templateColListDS.selected.map(item => {
  //         return {
  //           businessObjectImportTemplateColId: item.get('businessObjectImportTemplateColId'),
  //         };
  //       }),
  //     }).then(res => {
  //       if (getResponse(res)) {
  //         notification.success({
  //           message: intl.get('hmde.common.status.success').d('成功'),
  //           description: intl.get('hzero.common.notification.success.delete').d('删除成功'),
  //           placement: 'bottomRight',
  //         });
  //         templateColListDS.query();
  //       } else {
  //         templateColListDS.query();
  //       }
  //     });
  // };

  const columns = useMemo((): ColumnProps[] => {
    return [
      {
        name: 'orderSeq',
        align: ColumnAlign.left,
        // editor: true,
      },
      {
        name: 'fieldName',
        align: ColumnAlign.left,
      },
      {
        name: 'displayName',
        align: ColumnAlign.left,
        // editor: record => record?.get('tenantId') === getCurrentOrganizationId(),
      },
      {
        name: 'businessObjectFieldCode',
        align: ColumnAlign.left,
      },
      {
        name: 'aliasName',
        align: ColumnAlign.left,
        // editor: record => record?.get('tenantId') === getCurrentOrganizationId(),
      },
      {
        name: 'businessObjectName',
        align: ColumnAlign.left,
      },
      {
        name: 'sampleData',
        align: ColumnAlign.left,
        // editor: true,
      },
      {
        name: 'remark',
        align: ColumnAlign.left,
        // editor: true,
      },
      {
        name: 'requiredFlag',
        align: ColumnAlign.left,
        // editor: true,
      },
      {
        name: 'translatableFlag',
        align: ColumnAlign.left,
        // editor: true,
      },
      {
        name: 'enabledFlag',
        align: ColumnAlign.left,
        // editor: true,
      },
      {
        name: 'validatableFlag',
        align: ColumnAlign.left,
        // editor: true,
      },
    ];
  }, []);

  // const DeleteButtons = (dataSet: any) => {
  //   const deleteArray = dataSet.selected.map(item => {
  //     return item.get('tenantId') === getCurrentOrganizationId();
  //   });
  //   const isDisabled = dataSet.selected.length === 0 || deleteArray.includes(false);
  //   return (
  //     <Button
  //       icon="delete"
  //       disabled={isDisabled}
  //       onClick={() => {
  //         Modal.confirm({
  //           children: (
  //             <span>
  //               {intl.get('hzero.common.button.releaseConfirm').d('是否确认删除选中字段？')}
  //             </span>
  //           ),
  //           okText: intl.get('hzero.common.button.sure').d('确定'),
  //           onOk: async () => handleDelete(),
  //         });
  //       }}
  //     >
  //       {intl.get('hzero.common.button.delete').d('删除')}
  //     </Button>
  //   );
  // };

  // const buttons = () => {
  //   const arr = [
  //     <Button
  //       icon="add"
  //       onClick={() => {
  //         handleCreateField();
  //       }}
  //     >
  //       {intl.get('hmde.bo.exportTemplate.button.createField').d('新增字段')}
  //     </Button>,
  //     DeleteButtons(templateColListDS),
  //   ] as Buttons[];
  //   return arr;
  // };

  return (
    <Table
      dataSet={templateColListDS as DataSet}
      columns={columns}
    // buttons={buttons()}
    />
  );
};

export default formatterCollections({ code: ['hmde.bo', 'hmde.common', 'hzero.common'] })(
  observer(TemplateCol)
);
