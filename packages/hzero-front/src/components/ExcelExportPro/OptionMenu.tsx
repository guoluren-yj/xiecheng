import React from 'react';
import { Dropdown, Modal, DataSet } from 'choerodon-ui/pro';
import { Icon, Menu } from 'choerodon-ui';
import { Action } from 'choerodon-ui/pro/lib/trigger/enum';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import RenameModal from './RenameModal';
import { ExportTemplateTypeEnum } from './util';

const OptionMenu: React.FC<any> = (props) => {
  const { onRename, data, onDelete, onChangeDefault } = props;

  const renameModal = () => {
    const formDS = new DataSet({
      fields: [
        {
          name: 'templateName',
          type: FieldType.intl,
          required: true,
          label: intl.get('hzero.common.component.excelExport.v.hd.rename.template').d('模板名称'),
          validator: (value) => {
            if (value && value.length > 31) {
              return intl.get('hzero.common.components.export.v.hd.rename.template.tooLong').d('名称不多于31个字符');
            }
            if (value && /[:\\\/?*\[\]]/.test(value)) {
              return intl.get('hzero.common.components.export.v.hd.rename.template.invalidChart').d('名称不能包含以下字符：: \\ / ? * [ 或 ]');
            }
            if (value && (value[0] === '\'' || value[value.length - 1] === '\'')) {
              return intl.get('hzero.common.components.export.v.hd.rename.template.invalidDot').d('名称不能以单引号开头或结尾');
            }
          },  
        },
      ],
      data: [{ templateName: data?.templateName }],
    });
    Modal.open({
      key: 'renameModal',
      title: intl.get('hzero.common.component.excelExport.v.hd.rename').d('保存模板'),
      children: <RenameModal dataSet={formDS} />,
      onOk: async () => {
        const flag = await formDS.validate();
        if (!flag) {
          return false;
        }
        const saveData: any = formDS.toData()[0];
        onRename(saveData?.templateName, data);
      },
      onCancel: () => {
        formDS.reset();
      },
      onClose: () => {
        formDS.reset();
      },
    });
  };

  const deleteTemplate = () => {
    Modal.open({
      key: 'deleteTemplate',
      title: intl.get('hzero.common.component.excelExport.v.hd.deleteTemplate').d('删除模板'),
      children: (
        <div>
          {intl
            .get('hzero.common.component.excelExport.v.hd.deleteTemplate.confirm')
            .d('确认删除吗？')}
        </div>
      ),
      onOk: async () => {
        onDelete(data);
      },
    });
  };

  const setDefault = () => {
    onChangeDefault(data);
  };

  const handleClickMenu = (key) => {
    switch(key) {
      case 'setDefault':
        setDefault();
        break;
      case 'rename': 
        renameModal();
        break;
      case 'delete':
        deleteTemplate();
        break;
      default:
        return;   
    }
  };

  const renderMenu = () => {
    return (
      <Menu
        // className={`${stylePrefix}-filter-option-menu`}
        onClick={({ key }) => handleClickMenu(key)}
      >
        <Menu.Item key="setDefault" hidden={!data || data.defaultFlag}>
          {intl.get('hzero.common.button.setDefaultTemplate').d('设为默认')}
        </Menu.Item>
        <Menu.Item key="rename" hidden={!data || data.templateType !== ExportTemplateTypeEnum.CUSTOM}>
          {intl.get('hzero.common.button.rename').d('重命名')}
        </Menu.Item>
        <Menu.Item key="delete" style={{ color: '#f81d22' }} hidden={!data || data.templateType !== ExportTemplateTypeEnum.CUSTOM}>
          {intl.get('hzero.common.button.delete').d('删除')}
        </Menu.Item>
      </Menu>
    );
  };

  const render = () => {
    if (!data || (data.templateType === ExportTemplateTypeEnum.PREDEFINED && data.defaultFlag)) {
      return null;
    }
    return (
      <Dropdown
        // popupClassName={classnames(`${stylePrefix}-filter-menu`, `${stylePrefix}-filter-menu-${filter.filterCode}`)}
        overlay={renderMenu}
        trigger={[Action.click]}
      // onVisibleChange={this.handleMenuVisibleChange}
      // visible={menuVisible}
      >
        <span>
          <Icon type="more_horiz" />
        </span>
      </Dropdown>
    );
  };

  return render();  
};

export default OptionMenu;
