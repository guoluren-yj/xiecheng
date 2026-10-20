// 基本信息
import React, { useMemo, useContext } from 'react';
import { Lov, TextArea, IntlField } from 'choerodon-ui/pro';
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
    typeFlag,
    projectType,
    remoteProps,
    pubEditProjectFlag,
  } = useContext<StoreValueType>(Store);
  const { projectStatus } = headerDs.current?.get(['projectStatus']) || {};
  const isNotITEM = projectType !== 'ITEM';

  const editFlag = useMemo(() => {
    return createFlag || (['NEW', 'PUBLISH_REJECTED'].includes(projectStatus) && !typeFlag);
  }, [createFlag, projectStatus, typeFlag]);

  const editorColumns = useMemo(() => {
    const normalColumns = [
      !createFlag && 'projectNum',
      { name: 'projectName', disabled: !createFlag && !['NEW', 'PUBLISH_REJECTED'].includes(projectStatus) || !isNotITEM, editor: IntlField },
      !createFlag && {
        name: 'projectStatus',
        disabled: true,
        renderer: ({ record }) => <StatusTag renderTextFlag={editFlag} flag value={record?.get('projectStatusMeaning')} color={TagColor[record?.get('projectStatus')] || 'success'} />,
      },
      { name: 'companLov', editor: Lov, disabled: !createFlag && !['NEW', 'PUBLISH_REJECTED'].includes(projectStatus) || !isNotITEM }, // 公司  供应商不能修改 创建时可以改
      !createFlag && 'companyNum',
      { name: 'invOrganizationLov', editor: Lov, disabled: !editFlag },
      { name: 'supplierCompanyLov', editor: Lov, disabled: !createFlag && !['NEW', 'PUBLISH_REJECTED'].includes(projectStatus) || !isNotITEM },
      !createFlag && 'supplierCompanyNum',
      { name: 'templateLov', editor: Lov, disabled: !createFlag },
      // 'templateNum',
      !createFlag && 'creationDate',
      !createFlag && 'createName',
      !createFlag && { name: 'remark', editor: TextArea, disabled: !editFlag },
      !createFlag && 'hisItemFlag',
      {name: 'specification', disabled: !editFlag},
      {name: 'model', disabled: !editFlag},
    ];
    const processColumns = remoteProps
      ? remoteProps.process('SQAM_PPAPWORKBENCH_DETAIL_CUX.BASIC_COLUMNS', normalColumns, {
        headerDs,
      })
      : normalColumns;
    return processColumns;
  }, [createFlag, editFlag, projectStatus, isNotITEM, remoteProps, headerDs]);

  if (!headerDs?.current) return null;

  return (
    <EditorForm
      columns={3}
      useColon={false}
      dataSet={headerDs}
      editorFlag={editFlag || pubEditProjectFlag}
      editorColumns={editorColumns}
      customizeForm={customizeForm}
      customizeOptions={{ code: DetailProjectFormCode }}
      useWidthPercent
    />
  );
};


export default observer(BasicInfo);
