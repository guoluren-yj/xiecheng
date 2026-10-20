// 基本信息
import React, { useMemo, useContext } from 'react';
import { Lov, IntlField } from 'choerodon-ui/pro';
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
      !createFlag && 'projectNum',
      { name: 'projectName', disabled: !createFlag && !['NEW'].includes(projectStatus), editor: IntlField },
      !createFlag && {
        name: 'projectStatus',
        disabled: true,
        renderer: ({ record }) => <StatusTag renderTextFlag={editFlag} flag value={record?.get('projectStatusMeaning')} color={TagColor[record?.get('projectStatus')] || 'success'} />,
      },
      { name: 'companLov', editor: Lov, disabled: !createFlag }, // 公司  供应商不能修改
      !createFlag && 'companyNum',
      { name: 'invOrganizationLov', editor: Lov },
      { name: 'supplierCompanyLov', editor: Lov, disabled: !createFlag },
      !createFlag && 'supplierCompanyNum',
      { name: 'templateLov', editor: Lov, disabled: !createFlag },
      !createFlag && 'hisItemFlag',
      // 'templateNum',
      // 'creationDate',
      // 'createName',
      // { name: 'remark', editor: TextArea },
    ];
  }, [createFlag, projectStatus, editFlag]);

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
