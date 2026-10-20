import React, { useEffect, useMemo, useState } from 'react';
import { isString } from 'lodash';
import { Modal, DataSet, TextField, Tooltip } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import intl from 'srm-front-boot/lib/utils/intl';
import { observer } from 'mobx-react-lite';
import MultiLanguageModal from './MultiLanguageModal';
import styles from './index.less';

interface IProps {
  fieldName?: string;
  disabled?: boolean;
  record?: any;
  value?: any;
  setCurrentValue?: any;
  currentText?: any;
  textFieldStyle?: any;
  required?: boolean;
}

const IntlField = observer((props: IProps) => {
  const { fieldName: name, value, record, setCurrentValue, disabled, textFieldStyle, required } = props;
  const [initDefaultData, setInitDefaultData] = useState([]);
  const { language } = window.dvaApp._store.getState().global || {};
  useEffect(() => {
    const multiStr =
      sessionStorage.getItem('multiLanguageStr') !== 'undefined'
        ? (sessionStorage.getItem('multiLanguageStr') as string)
        : '[]';
    setInitDefaultData(JSON.parse(multiStr) || []);
  }, []);

  useEffect(() => {
    formDs.removeAll();
    if (isString(value)) {
      const data = {};
      data[language] = value;
      formDs.create(data);
    } else {
      formDs.create(value);
    }
  }, [value]);

  const formDs = useMemo(
    () =>
      new DataSet({
        data: [value],
        fields: initDefaultData.map<common.ObjectAny>((item: any) => ({
          name: item.code,
          type: 'string',
          label: item.description,
        })),
      }),
    [initDefaultData.length, ...Object.values(value)]
  );

  const handleModal = () => {
    Modal.open({
      title: intl.get('hmde.bo.view.title.multiLanguage').d('输入多语言信息'),
      drawer: false,
      closable: true,
      style: { width: '600px' },
      destroyOnClose: true,
      children: (
        <MultiLanguageModal initDefaultData={initDefaultData} formDs={formDs} disabled={disabled} />
      ),
      okText: intl.get('hzero.common.button.sure').d('确定'),
      onOk: () => {
        const data = {};
        const DsData = formDs.current?.toData() || {};
        initDefaultData.forEach((item: any) => {
          data[item?.code] = DsData[item?.code] || '';
        });
        record.set(name, data);
        setCurrentValue(data);
      },
    });
  };

  return (
    <div className={styles.input}>
      <TextField
        label={(
          <span>
            {intl.get('hmde.bo.field.helpText').d('帮助文本')}
            <Tooltip
              placement="top"
              title={intl
                .get('hmde.bo.field.helpText.helpText')
                .d('当用户悬停在此字段旁的问号图标时，会在表单字段下方显示该提示文本内容')}
            >
              <Icon type="help_outline" style={{ fontSize: 16 }} />
            </Tooltip>
          </span>
        )}
        disabled={disabled || false}
        required={required}
        suffix={
          <Icon
            type="language"
            onClick={() => {
              handleModal();
            }}
            className={styles['intl-filled']}
          />
        }
        value={formDs.current?.get(language) || null}
        style={{ width: '100%', ...textFieldStyle }}
        onChange={(val) => {
          const data = {};
          const DsData = formDs.current?.toData() || {};
          initDefaultData.forEach((item: any) => {
            if (item?.code === language) {
              data[item?.code] = val;
            } else {
              data[item?.code] = DsData[item?.code] || val;
            }
          });
          formDs.removeAll();
          formDs.create(data);
          record.set(name, data);
        }}
      />
    </div>
  );
});

export default IntlField;
