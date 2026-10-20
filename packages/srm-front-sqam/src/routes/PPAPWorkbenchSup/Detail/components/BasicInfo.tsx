// 基本信息
import React, { useMemo, useContext } from 'react';
import { Lov, TextArea } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
// import intl from 'utils/intl';

import StatusTag from '../../../PPAPTemplate/components/StatusTag';
import { TagColor, DetailProjectFormCode } from '../../utils/type';
import { Store } from '../stores';
import type { StoreValueType } from '../stores';
import EditorForm from '../../../components/EditorForm';

const BasicInfo = () => {
  const {
    headerDs,
    customizeForm,
  } = useContext<StoreValueType>(Store);

  const editorColumns = useMemo(() => {
    return [
      'projectNum',
      'projectName',
      {
        name: 'projectStatus',
        disabled: true,
        renderer: ({ record }) => <StatusTag flag value={record?.get('projectStatusMeaning')} color={TagColor[record?.get('projectStatus')] || 'success'} />,
      },
      { name: 'companLov', editor: Lov, disabled: true }, // 公司  供应商不能修改
      'companyNum',
      { name: 'invOrganizationLov', editor: Lov },
      { name: 'supplierCompanyLov', editor: Lov, disabled: true },
      'supplierCompanyNum',
      'templateNum',
      'creationDate',
      'createName',
      { name: 'remark', editor: TextArea },
      'hisItemFlag',
      {name: 'specification'},
      {name: 'model'},
    ];
  }, []);

  if (!headerDs?.current) return null;

  return (
    <EditorForm
      columns={3}
      useColon={false}
      dataSet={headerDs}
      editorFlag={false}
      editorColumns={editorColumns}
      customizeForm={customizeForm}
      customizeOptions={{ code: DetailProjectFormCode }}
      useWidthPercent
    />
  );
};


export default observer(BasicInfo);
