import React, { Fragment, useMemo, createContext, useState } from 'react';
import {
  Button,
  Form,
  Attachment,
  CheckBox,
  IntlField,
  Select,
  DataSet,
  TextField,
} from 'choerodon-ui/pro';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import { compose } from 'lodash';
import { observer } from 'mobx-react';

import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
// import notification from 'utils/notification';
import { getResponse } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';

import { formDS } from './indexDS';
import styles from './index.less';

const promptCode = 'ssrc.quotationTemplate';

const TemplateIdContext = createContext();

const Index = (props) => {
  const { history, customizeForm, customizeBtnGroup } = props;

  const [loading, setLoading] = useState(false);
  // const templateHeaderRef = useRef();

  const formDs = useMemo(() => new DataSet(formDS()), []);

  // 大保存
  const handleSave = async () => {
    const { current } = formDs || {};
    if (!current) {
      return;
    }

    current.setState('status', 'update');

    // const templateNumField = formDs.getField('templateNum');
    // const templateNumFieldValidateResult = templateNumField.isValid(current); // 单据校验 templateNum

    await formDs.validate();
    // if (!templateNumFieldValidateResult) {
    //   return false;
    // }

    setLoading(true);
    let res = await formDs.forceSubmit();
    setLoading(false);
    res = getResponse(res);
    if (!res) {
      return;
    }

    const { content = [] } = res || {};
    const [result] = content || [];
    const { templateId } = result || {};
    if (!templateId) {
      return;
    }

    history.push({
      pathname: `/ssrc/new-quotation-template/detail/${templateId}`,
    });
  };

  return (
    <Fragment>
      <Header
        title={intl.get(`${promptCode}.model.title.createTemplate`).d('新建报价模板')}
        backPath="/ssrc/new-quotation-template/list"
      >
        {customizeBtnGroup(
          {
            code: 'SSRC.QUOTATIONTEMPLATE_UPDATE.HEADER_BUTTONS',
          },
          [
            <Button
              name="save"
              icon="save"
              color="primary"
              waitType="debounce"
              wait={300}
              onClick={handleSave}
              loading={loading}
              // disabled={templateHeaderRef.current?.templateStatus === 'RELEASED'}
            >
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>,
          ]
        )}
      </Header>
      <Content className={styles['content-warp']}>
        <div className={styles['basic-info-warp']}>
          <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: '600' }}>
            {intl.get(`${promptCode}.model.template.basicInfo`).d('基础信息')}
          </h3>
          {customizeForm(
            {
              code: 'SSRC.QUOTATIONTEMPLATE_UPDATE.BASE_FORM',
              dataSet: formDs,
              afterCustomizeDs: (_, ds) => {
                if (!ds.current) {
                  ds.create({}, 0);
                }
              },
            },
            <Form dataSet={formDs} columns={3} labelLayout="float" useWidthPercent>
              <TextField name="templateNum" restrict={/[^a-zA-Z0-9]/g} />
              <IntlField name="templateName" />
              <Select name="templateDimension" />
              <Select name="moduleRule" showHelp="tooltip" />
              <CheckBox name="allowCreateFlag" />
              <CheckBox name="attachmentNeedFlag" />
              <CheckBox name="allowPurCreateFlag" />
              <Attachment name="attachmentUuid" viewMode="popup" style={{ maxWidth: '100%' }} />
            </Form>
          )}
        </div>
      </Content>
    </Fragment>
  );
};

export { TemplateIdContext };
export default compose(
  formatterCollections({ code: ['ssrc.quotationTemplate', 'ssrc.inquiryHall', 'sscux.ssrc'] }),
  observer,
  WithCustomizeC7N({
    unitCode: [
      'SSRC.QUOTATIONTEMPLATE_UPDATE.HEADER_BUTTONS',
      'SSRC.QUOTATIONTEMPLATE_UPDATE.BASE_FORM',
    ],
  })
)(Index);
