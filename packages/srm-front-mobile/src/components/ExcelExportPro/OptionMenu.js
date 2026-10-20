import React from 'react';
import { Dropdown, Modal, DataSet } from 'choerodon-ui/pro';
import { Icon, Menu } from 'choerodon-ui';
import { Action } from 'choerodon-ui/pro/lib/trigger/enum';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import RenameModal from './RenameModal';

const OptionMenu = (props) => {
  const { onRename, data, onDelete } = props;

  const renameModal = () => {
    const formDS = new DataSet({
      fields: [
        {
          name: 'templateName',
          type: FieldType.intl,
          required: true,
          label: intl.get('hzero.common.component.excelExport.v.hd.rename.template').d('模板名称'),
        },
      ],
    });
    Modal.open({
      key: 'renameModal',
      title: intl.get('hzero.common.component.excelExport.v.hd.rename').d('保存模板'),
      children: <RenameModal dataSet={formDS} />,
      onOk: async () => {
        const saveData: any = formDS.toData()[0];
        onRename(saveData?.templateName, data.templateId);
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
        onDelete(data.userTemplateId);
      },
    });
  };

  const handleClickMenu = (key) => {
    if (key === 'rename') {
      renameModal();
    } else if (key === 'delete') {
      deleteTemplate();
    }
  };

  const renderMenu = () => {
    return (
      <Menu
        // className={`${stylePrefix}-filter-option-menu`}
        onClick={({ key }) => handleClickMenu(key)}
      >
        <Menu.Item key="rename">{intl.get('hzero.common.button.rename').d('重命名')}</Menu.Item>
        <Menu.Item key="delete" style={{ color: '#f81d22' }}>
          {intl.get('hzero.common.button.delete').d('删除')}
        </Menu.Item>
      </Menu>
    );
  };

  return (
    <Dropdown overlay={renderMenu} trigger={[Action.click]}>
      <span>
        <Icon type="more_horiz" />
      </span>
    </Dropdown>
  );
};

export default OptionMenu;
