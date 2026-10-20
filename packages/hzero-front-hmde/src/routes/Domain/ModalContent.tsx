import React from 'react';
import { observer } from 'mobx-react-lite';
import {
  Form,
  // DataSet,
  // Lov,
  TextField,
  TextArea,
  Select,
  IconPicker,
  Switch,
  Output,
  Button,
  IntlField,
  SelectBox,
  Tooltip,
} from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import { LabelAlign } from 'choerodon-ui/pro/lib/form/enum';
import intl from 'srm-front-boot/lib/utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
// import { FuncType } from 'choerodon-ui/pro/lib/button/enum';

import ImgIcon from '@/utils/ImgIcon';

// import LovDS from './store/LovDS';
import { LabelTitleRender } from './Domain';
import styles from './index.less';

const { Option } = Select;

// const LabelTitleRender = ({ value, help }) => {
//   return (
//     <span className={styles['label-contain']}>
//       <span>
//         {value}
//         <Tooltip title={help}>
//           <Icon type="help_outline" />
//         </Tooltip>
//       </span>
//     </span>
//   );
// };

export default formatterCollections({ code: ['hmde.common', 'hmde.domain'] })(
  observer((props: any) => {
    const { dataSet } = props;

    // const lovDs = useMemo(() => new DataSet(LovDS(undefined, undefined)), []);

    return (
      <div>
        <Form dataSet={dataSet} labelAlign={LabelAlign.left}>
          <IntlField
            name="domainName"
            placeholder={intl.get('hmde.common.placeholder').d('请输入')}
            suffix={<Icon type="language" />}
          />
          <TextField
            name="domainCode"
            placeholder={intl.get('hmde.common.placeholder').d('请输入')}
          />
          <Select
            name="serviceId"
            noCache
            placeholder={intl.get('hmde.common.placeholder').d('请输入')}
            searchable
            searchMatcher={({ record, text }) => {
              return (
                record
                  ?.get('serviceCode')
                  ?.toLowerCase()
                  ?.indexOf(text?.toString()?.toLowerCase() as string) !== -1
              );
            }}
          />
          <IntlField
            colSpan={4}
            name="remark"
            placeholder={intl.get('hmde.common.placeholder').d('请输入')}
            style={{ height: '80px' }}
            suffix={<Icon type="language" />}
          />
          <IconPicker name="icon" placeholder={intl.get('hmde.common.placeholder').d('请输入')} />
        </Form>
        <div style={{ fontSize: '.18rem', fontWeight: 'bold' }}>
          {intl.get('hmde.common.view.title.advancedConfig').d('高级配置')}
        </div>
        <div className={styles['more-property-contain']}>
          <div className={styles['mode-expression']}>
            {intl.get('hmde.domain.standardObject.extensionPattern').d('标准对象扩展模式')}
          </div>
          <div className={styles['tip-contain']}>
            <div>
              <Icon type="info" />
              <span>
                {intl
                  .get('hmde.domain.standardObject.extensionPattern.tip')
                  .d('扩展模式启用且创建扩展字段后将不允许关闭，请谨慎操作')}
              </span>
            </div>
            <ImgIcon name="blue@3x.png" style={{ width: '140px', height: '28px' }} />
          </div>
          <Form
            useColon={false}
            columns={3}
            dataSet={dataSet}
            labelAlign={'left' as any}
            labelWidth={[110]}
          >
            <Switch
              name="flexFieldEnabledFlag"
              label={
                <LabelTitleRender
                  value={intl.get('hmde.domain.view.message.title.flexModel').d('弹性域模式')}
                  help={intl
                    .get('hmde.domain.view.message.title.flexModel.help')
                    .d(
                      '勾选此选项，平台标准对象预留弹性域字段，租户在标准对象上启用扩展字段进行使用'
                    )}
                />
              }
            />
            {dataSet?.current?.get('flexFieldEnabledFlag') && (
              <TextArea
                name="flexFieldRecognizeRegularExpression"
                rowSpan={2}
                colSpan={2}
                label={
                  <LabelTitleRender
                    value={intl
                      .get('hmde.domain.view.message.title.extendFieldIdentify')
                      .d('标准弹性域字段识别方法')}
                    help={intl
                      .get('hmde.domain.view.message.title.extendFieldIdentify.help')
                      .d('对象引用物理模型时自动将字段标识为扩展字段，可配置字段满足的表达式规则')}
                  />
                }
              />
            )}
            <Switch
              name="extendTableEnabledFlag"
              newLine
              label={
                <LabelTitleRender
                  value={intl.get('hmde.domain.view.message.title.extendMode').d('扩展表模式')}
                  help={intl
                    .get('hmde.domain.view.message.title.extendMode.help')
                    .d(
                      '勾选此选项，平台标准对象关联扩展物理模型，若租户在标准对象想启用扩展字段进行使用'
                    )}
                />
              }
            />
            {/* <Select name="dataSource" placeholder="请选择" /> */}
          </Form>
          <div className={styles['mode-expression']}>
            {intl.get('hmde.domain.standardObject.physicsPublishStrategy').d('业务对象发布模式')}
          </div>
          <div className={styles['tip-contain']}>
            <div>
              <Icon type="info" />
              <span>
                {intl
                  .get('hmde.domain.standardObject.physicsPublishStrategy.tip')
                  .d('扩展表模式下，黑/白名单模式不对扩展表起作用')}
              </span>
            </div>
            <ImgIcon name="blue@3x.png" style={{ width: '140px', height: '28px' }} />
          </div>
          <Form
            useColon={false}
            columns={1}
            dataSet={dataSet}
            labelAlign={'left' as any}
            labelWidth={[104, 84]}
          >
            <SelectBox name="physicsPublishStrategy" newLine>
              <Option value="VERIFY">
                {intl.get('hmde.domain.model.allowUpdate').d('白名单')}
                <Tooltip
                  placement="top"
                  title={intl
                    .get('hmde.domain.model.allowUpdateHelp')
                    .d('仅下列选择的业务对象允许更新物理模型，其它业务对象均不允许更新物理模型')}
                >
                  <Icon
                    type="help_outline"
                    style={{ fontSize: 14, marginBottom: '4px', marginLeft: '3px' }}
                  />
                </Tooltip>
              </Option>
              <Option value="SYNC">
                {intl.get('hmde.domain.model.notAllAllowUpdate').d('黑名单')}
                <Tooltip
                  placement="top"
                  title={intl
                    .get('hmde.domain.model.notAllowUpdateHelp')
                    .d('仅下列选择的业务对象不允许更新物理模型，其它业务对象均可更新物理模型')}
                >
                  <Icon
                    type="help_outline"
                    style={{ fontSize: 14, marginBottom: '4px', marginLeft: '3px' }}
                  />
                </Tooltip>
              </Option>
            </SelectBox>
            {dataSet.current?.get('physicsPublishStrategy') === 'VERIFY' ? (
              <Output
                name="allow"
                renderer={() => (
                  <Button disabled icon="settings-o">
                    {intl.get('hmde.common.button.title.configObject').d('配置对象')}
                  </Button>
                )}
              />
            ) : (
              <Output
                name="notAllow"
                renderer={() => (
                  <Button disabled icon="settings-o">
                    {intl.get('hmde.common.button.title.configObject').d('配置对象')}
                  </Button>
                )}
              />
            )}
          </Form>
        </div>
      </div>
    );
  })
);
