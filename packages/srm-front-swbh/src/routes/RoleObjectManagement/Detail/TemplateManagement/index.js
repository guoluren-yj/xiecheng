/*
 * @Description: file content
 * @Author: jiwei.liu01@hand-china.com
 * @Date: 2022-05-01 11:14:38
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */
import React, { useEffect, useMemo, useRef } from 'react';
import { Table, Button, Modal } from 'choerodon-ui/pro';
import { ColumnLock, ColumnAlign } from 'choerodon-ui/pro/lib/table/enum';
import { operatorRender, yesOrNoRender } from 'hzero-front/lib/utils/renderer';
import intl from 'srm-front-boot/lib/utils/intl';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import { observer } from 'mobx-react-lite';
import qs from 'querystring';
import { getResponse } from 'hzero-front/lib/utils/utils';
import { createTemplate } from '@/services/roleObjectService';
import CreateTemplateModal from './CreateTemplateModal';

const TemplateManagement = (props) => {
  const {
    templateDs,
    combineCode, // 对象编码
    docObjectId, // 主键ID
    history,
    combineName, // 对象名称
    combineId, // 对象编码ID
  } = props;
  const templateRef = useRef();
  useEffect(() => {
    templateDs.setQueryParameter('combineCode', combineCode);
    templateDs.query();
  }, []);

  const handleCreate = () => {
    Modal.open({
      title: intl.get('swbh.roManagement.templateManaget.button.creatTemplateManaget').d('新建模板管理'),
      style: { width: '600px' },
      drawer: false,
      closable: true,
      destroyOnClose: true,
      children: <CreateTemplateModal templateRef={templateRef} combineId={combineId} />,
      okText: intl.get('hzero.common.button.sure').d('确定'),
      onOk: async () => {
        const createFormDs = templateRef.current?.formDs;
        const validate = await createFormDs?.current?.validate();
        if (validate) {
          const formValues = createFormDs?.toData()?.[0] || {};
          const res = await createTemplate({
            body: {
              combineCode,
              ...formValues,
            },
          });
          if (getResponse(res)) {
            // eslint-disable-next-line no-unused-expressions
            createFormDs.current?.reset();
            templateDs.query();
          } else {
            return false;
          }
        } else {
          return false;
        }
      },
    });
  };

  const columns = useMemo(() => {
    return [
      {
        name: 'relBusinessObjectName',
        align: ColumnAlign.left,
      },
      {
        name: 'relBusinessObjectCode',
        align: ColumnAlign.left,
      },
      {
        name: 'mainTableFlag',
        align: ColumnAlign.center,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        header: intl.get('hzero.common.table.column.option').d('操作'),
        align: ColumnAlign.left,
        width: 200,
        renderer: ({ record }) => {
          const operators = [
            {
              key: 'field',
              ele: (
                <a
                  onClick={() => {
                    history.push({
                      pathname: `/swbh/role-object-management/template/field`,
                      search: qs.stringify({
                        combineId,
                        docObjectId,
                        combineName,
                        docObjectRelId: record?.get('docObjectRelId'),
                        combineCode: record?.get('combineCode'),
                        tenantId: record?.get('tenantId'),
                      }),
                    });
                  }}
                >
                  {intl.get('swbh.roManagement.templateManaget.button.selectField').d('字段选择')}
                </a>
              ),
              len: 6,
              title: intl.get('swbh.roManagement.templateManaget.button.selectField').d('字段选择'),
            },
          ];
          return operatorRender(operators, record, { limit: 1 });
        },
        lock: ColumnLock.right,
      },
    ];
  }, []);

  const buttons = [
    <Button icon="add" onClick={handleCreate}>
      {intl.get('hzero.common.button.create').d('新建')}
    </Button>,
  ];

  return (
    <div style={{ height: '100%' }}>
      <Table dataSet={templateDs} columns={columns} buttons={buttons} />
    </div>
  );
};

export default formatterCollections({
  code: ['swbh.roManagement', 'swbh.common', 'hzero.common'],
})(observer(TemplateManagement));
