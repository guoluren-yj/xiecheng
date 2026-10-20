/*
 * HeaderInfo - 基础信息
 * @Date: 2023-04-06 10:19:06
 * @Author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { Form } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import intl from 'utils/intl';

import FormField from '@/routes/components/FormField';
import { renderStatus } from '@/routes/components/utils';

const HeaderInfo = observer(
  ({
    dataSet,
    custLoading,
    customizeForm,
    isEdit = false,
    viewUpdate = false,
    code = '',
    cuzFieldEdit = false,
  }) => {
    const currentRecord = dataSet.current;
    const changeLevel = currentRecord && currentRecord.get('changeLevel');
    // 个性化字段可编辑
    const cuzEdit = isEdit || (!isEdit && cuzFieldEdit);
    return !viewUpdate ? (
      <div className="card-content">
        <div className="card-content-title">
          {intl.get('sslm.common.view.title.baseInfo').d('基础信息')}
        </div>
        {customizeForm(
          {
            code,
            readOnly: !cuzEdit,
          },
          <Form
            useWidthPercent
            columns={3}
            dataSet={dataSet}
            labelLayout={isEdit ? 'float' : 'vertical'}
            className={isEdit ? '' : 'c7n-pro-vertical-form-display'}
            custLoading={custLoading}
          >
            <FormField name="changeReqNumber" isEdit={isEdit} />
            <FormField name="changeLevel" isEdit={isEdit} />
            <FormField
              name="reqStatus"
              isEdit={isEdit}
              renderer={renderStatus}
              componentType="SELECT"
            />

            <FormField name="companyNum" isEdit={isEdit} />
            <FormField name="companyName" isEdit={isEdit} />
            <FormField name="createUserRealName" isEdit={isEdit} />

            <FormField name="submitDate" isEdit={isEdit} />
            <FormField name="creationDate" isEdit={isEdit} />
            <FormField
              name="partnerCompanyName"
              isEdit={isEdit}
              hidden={changeLevel === 'PLATFORM'}
            />

            <FormField
              name="partnerCompanyNum"
              isEdit={isEdit}
              hidden={changeLevel !== 'COMPANY'}
            />
            <FormField name="remark" isEdit={isEdit} componentType="TEXTAREA" newLine colSpan={2} />
            <FormField
              name="oldApprovalOpinion"
              isEdit={isEdit}
              componentType="TEXTAREA"
              newLine
              colSpan={2}
            />
          </Form>
        )}
      </div>
    ) : null;
  }
);

export default HeaderInfo;
