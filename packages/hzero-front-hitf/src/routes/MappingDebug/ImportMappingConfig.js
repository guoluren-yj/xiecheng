/**
 * @author fengwanjun<wanjun.feng@hand-china.com>
 * @creationDate 2021/1/18
 * @copyright HAND ® 2021
 */
import React from 'react';
import { CodeArea, Button } from 'choerodon-ui/pro';
import { Upload } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { mappingTestImport } from '@/services/mappingDebugService';
import JSONFormatter from 'choerodon-ui/pro/lib/code-area/formatters/JSONFormatter';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import getLang from '@/langs/mappingDebugLang';
import notification from 'hzero-front/lib/utils/notification';
import { SERVICE_CONSTANT } from '@/constants/constants';

@formatterCollections({ code: ['hzero.common', getLang('PERFIX')] })
export default class ImportMappingConfig extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ...props,
      defaultJson: {},
      mappingConfigStr: '',
    };
  }

  componentDidMount() {
    this.handleUpdateModalProp();
    const defaultJson = this.getDefaultJson(this.props);
    this.setState({
      defaultJson,
      mappingConfigStr: JSON.stringify(defaultJson, null, 4),
    });
  }

  //  eslint-disable-next-line
  UNSAFE_componentWillReceiveProps(nextProps) {
    const defaultJson = this.getDefaultJson(nextProps);
    this.setState({
      ...nextProps,
      defaultJson,
      mappingConfigStr: JSON.stringify(defaultJson, null, 4),
    });
  }

  getDefaultJson(data) {
    const { dataType, script, sourceContent, targetContent, valueMappingLineConfigs } = data;
    return {
      configVO: {
        dataType,
        fieldMappingConfig: {
          transformScript: script || '%dw 2.0\noutput application/json\n---\n',
          sourceStructure: JSON.parse(sourceContent || '{}'),
          targetStructure: JSON.parse(targetContent || '{}'),
        },
        valueMappingConfig: {
          valueMappingLineConfigs: valueMappingLineConfigs || [],
        },
      },
    };
  }

  /**
   * 更新当前Modal的属性
   */
  @Bind()
  handleUpdateModalProp() {
    const { modal } = this.props;
    modal.update({
      footer: (_okBtn, cancelBtn) => (
        <div style={{ textAlign: 'right' }}>
          <Button color="primary" onClick={this.handleSave}>
            {getLang('SURE')}
          </Button>
          {cancelBtn}
        </div>
      ),
    });
  }

  /**
   * 确定
   */
  @Bind()
  handleSave() {
    const { modal } = this.props;
    const { onImportMappingConfig, mappingConfigStr } = this.state;
    const flag = onImportMappingConfig(mappingConfigStr);
    if (flag) {
      modal.close();
    }
  }

  /**
   * 导入映射配置 文件
   * @param {*} param0
   */
  @Bind()
  handleAction({ file }) {
    mappingTestImport({ file }).then((res) => {
      if (res && res.failed) {
        notification.error({
          message: res.message,
        });
      }
      if (res && !res.failed) {
        const {
          configVO: { dataType = SERVICE_CONSTANT.REST, fieldMappingConfig, valueMappingConfig },
        } = res;
        let fieldMappingCfg = {
          script: '',
          sourceContent: {},
          targetContent: {},
        };
        if (fieldMappingConfig) {
          fieldMappingCfg = {
            script: fieldMappingConfig.transformScript,
            sourceContent: fieldMappingConfig.sourceStructure,
            targetContent: fieldMappingConfig.targetStructure,
          };
        }
        const defaultJson = this.getDefaultJson({
          dataType,
          ...fieldMappingCfg,
          ...valueMappingConfig,
        });
        this.setState({
          defaultJson,
          mappingConfigStr: JSON.stringify(defaultJson, null, 4),
        });
      }
    });
  }

  render() {
    const { defaultJson } = this.state;
    return (
      <>
        <Upload
          name="file"
          accept="application/json"
          showUploadList={false}
          customRequest={this.handleAction}
        >
          <Button color="primary">{getLang('IMPORT_JSON')}</Button>
        </Upload>
        <CodeArea
          style={{ height: 400, marginTop: 10, width: '100%' }}
          value={JSON.stringify(defaultJson, null, 4)}
          formatter={JSONFormatter}
          options={{
            mode: { name: 'javascript', json: true },
            lineWrapping: true,
            styleActiveLine: true,
          }}
          onChange={(value) => {
            this.setState({ mappingConfigStr: value });
          }}
        />
      </>
    );
  }
}
