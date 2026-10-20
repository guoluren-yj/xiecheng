// 基本信息
import React, { useMemo, useContext } from 'react';
import { Lov } from 'choerodon-ui/pro';
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
    createFlag,
    editFlag,
  } = useContext<StoreValueType>(Store);
  const { projectStatus } = headerDs.current?.get(['projectStatus']) || {};

  const editorFlag = useMemo(() => {
    return createFlag || (['NEW', 'PUBLISH_REJECTED'].includes(projectStatus) && editFlag);
  }, [createFlag, projectStatus, editFlag]);

  const editorColumns = useMemo(() => {
    return [
      'projectNum',
      'projectName',
      {
        name: 'projectStatus',
        disabled: true,
        renderer: ({ record }) => <StatusTag value={record?.get('projectStatusMeaning')} flag color={TagColor[record?.get('projectStatus')] || 'success'} />,
      },
      { name: 'companLov', editor: Lov, disabled: true }, // 公司  供应商不能修改
      'companyNum',
      { name: 'invOrganizationLov', editor: Lov },
      { name: 'supplierCompanyLov', editor: Lov, disabled: true },
      'supplierCompanyNum',
      'hisItemFlag',
      // 'templateNum',
      // 'creationDate',
      // 'createName',
      // { name: 'remark', editor: TextArea },
    ];
  }, []);

  if (!headerDs?.current) return null;

  return (
    <EditorForm
      columns={3}
      useColon={false}
      dataSet={headerDs}
      editorFlag={editorFlag}
      editorColumns={editorColumns}
      customizeForm={customizeForm}
      customizeOptions={{ code: DetailProjectFormCode }}
      useWidthPercent
    />
  );
};


export default observer(BasicInfo);
