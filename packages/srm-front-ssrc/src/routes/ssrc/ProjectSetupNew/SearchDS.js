/**
 * 高级搜索查询条件DS
 */
import intl from 'utils/intl';

const promptCode = 'ssrc.projectSetup';

// 查询条件
const SearchDS = () => ({
  autoCreate: true,
  dataToJSON: 'all',
  fields: [
    {
      name: 'queryParam', // 搜索框搜索条件
    },
    {
      name: 'sourceProjectNum',
      label: intl.get(`${promptCode}.model.projectSetup.sourceProjectNum`).d('项目编号'),
      type: 'string',
    },
    {
      name: 'sourceProjectName',
      label: intl.get(`${promptCode}.model.projectSetup.sourceProjectName`).d('项目名称'),
      type: 'string',
    },
    {
      name: 'purAgent',
      label: intl.get(`${promptCode}.model.projectSetup.purAgent`).d('采购联系人'),
      type: 'string',
    },
  ],
});

export { SearchDS };
