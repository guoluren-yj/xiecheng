/**
 * 排查设置 DS
 * @author Felix(LQX5731@163.com)
 * @date 2026-05-13
 * @version 1.0.0
 * @lastUpdate 2026-05-13
 */
import intl from 'utils/intl';

const SettingDS = () => ({
  autoCreate: true,
  fields: [
    // 股权
    {
      name: 'equity',
      type: 'boolean',
      label: intl.get('sdat.supplier.view.title.equity').d('股权'),
      defaultValue: true,
    },
    {
      name: 'SH',
      type: 'boolean',
      label: intl.get('sdat.supplier.view.title.shareholder').d('股东'),
      defaultValue: true,
    },
    {
      name: 'stake_threshold',
      type: 'number',
      label: intl.get('sdat.supplier.view.title.stakeThreshold').d('股比节点'),
      defaultValue: 10,
      min: 0,
      max: 100,
      step: 0.01,
      dynamicProps: {
        disabled: ({ record }) => !record.get('SH'),
      },
    },
    {
      name: 'SH_percent_greater',
      type: 'boolean',
      defaultValue: true,
      dynamicProps: {
        disabled: ({ record }) => !record.get('SH'),
        label: ({ record }) =>
          intl.get('sdat.supplier.view.title.shPercentGreater', {
            threshold: record.get('stake_threshold'),
          }),
      },
      validator: (value, name, record) => {
        if (record.get('SH') && !value && !record.get('SH_percent_less')) {
          return intl.get('sdat.supplier.view.validate.atLeastOne').d('请至少勾选一个子维度');
        }
        return true;
      },
    },
    {
      name: 'SH_percent_less',
      type: 'boolean',
      defaultValue: true,
      dynamicProps: {
        disabled: ({ record }) => !record.get('SH'),
        label: ({ record }) =>
          intl.get('sdat.supplier.view.title.shPercentLess', {
            threshold: record.get('stake_threshold'),
          }),
      },
      validator: (value, name, record) => {
        if (record.get('SH') && !value && !record.get('SH_percent_greater')) {
          return intl.get('sdat.supplier.view.validate.atLeastOne').d('请至少勾选一个子维度');
        }
        return true;
      },
    },
    {
      name: 'HSH',
      type: 'boolean',
      label: intl.get('sdat.supplier.view.title.hisShareholder').d('历史股东'),
      defaultValue: true,
    },
    {
      name: 'stake_threshold_history',
      type: 'number',
      label: intl.get('sdat.supplier.view.title.stakeThresholdHistory').d('股比节点'),
      defaultValue: 10,
      min: 0,
      max: 100,
      step: 0.01,
      dynamicProps: {
        disabled: ({ record }) => !record.get('HSH'),
      },
    },
    {
      name: 'HSH_percent_greater',
      type: 'boolean',
      defaultValue: true,
      dynamicProps: {
        disabled: ({ record }) => !record.get('HSH'),
        label: ({ record }) =>
          intl
            .get('sdat.supplier.view.title.hshPercentGreater', {
              threshold: record.get('stake_threshold_history'),
            })
            .d(`股比 > ${record.get('stake_threshold_history')}%`),
      },
      validator: (value, name, record) => {
        if (record.get('HSH') && !value && !record.get('HSH_percent_less')) {
          return intl.get('sdat.supplier.view.validate.atLeastOne').d('请至少勾选一个子维度');
        }
        return true;
      },
    },
    {
      name: 'HSH_percent_less',
      type: 'boolean',
      defaultValue: true,
      dynamicProps: {
        disabled: ({ record }) => !record.get('HSH'),
        label: ({ record }) =>
          intl
            .get('sdat.supplier.view.title.hshPercentLess', {
              threshold: record.get('stake_threshold_history'),
            })
            .d(`股比 < ${record.get('stake_threshold_history')}%或为空时`),
      },
      validator: (value, name, record) => {
        if (record.get('HSH') && !value && !record.get('HSH_percent_greater')) {
          return intl.get('sdat.supplier.view.validate.atLeastOne').d('请至少勾选一个子维度');
        }
        return true;
      },
    },
    {
      name: 'branch',
      type: 'boolean',
      label: intl.get('sdat.supplier.view.title.branch').d('分支机构'),
      defaultValue: true,
    },
    // 董监高法
    {
      name: 'djg',
      type: 'boolean',
      label: intl.get('sdat.supplier.view.title.djg').d('董监高法'),
      defaultValue: true,
    },
    {
      name: 'LR',
      type: 'boolean',
      label: intl.get('sdat.supplier.view.title.lr').d('法定代表人'),
      defaultValue: true,
    },
    {
      name: 'HLR',
      type: 'boolean',
      label: intl.get('sdat.supplier.view.title.hlr').d('历史法人'),
      defaultValue: true,
    },
    {
      name: 'DIR',
      type: 'boolean',
      label: intl.get('sdat.supplier.view.title.dir').d('董事'),
      defaultValue: true,
    },
    {
      name: 'HDIR',
      type: 'boolean',
      label: intl.get('sdat.supplier.view.title.hdir').d('历史董事'),
      defaultValue: true,
    },
    {
      name: 'SUP',
      type: 'boolean',
      label: intl.get('sdat.supplier.view.title.sup').d('监事'),
      defaultValue: true,
    },
    {
      name: 'HSUP',
      type: 'boolean',
      label: intl.get('sdat.supplier.view.title.hsup').d('历史监事'),
      defaultValue: true,
    },
    {
      name: 'EXE',
      type: 'boolean',
      label: intl.get('sdat.supplier.view.title.exe').d('高管'),
      defaultValue: true,
    },
    {
      name: 'HEXE',
      type: 'boolean',
      label: intl.get('sdat.supplier.view.title.hexe').d('历史高管'),
      defaultValue: true,
    },
    {
      name: 'djg_same_name',
      type: 'boolean',
      label: intl.get('sdat.supplier.view.title.djgSameName').d('董监高法姓名重名'),
      defaultValue: true,
    },
    // 控制/担保
    {
      name: 'control_guarantee',
      type: 'boolean',
      label: intl.get('sdat.supplier.view.title.controlGuarantee').d('控制/担保'),
      defaultValue: false,
    },
    {
      name: 'same_controller',
      type: 'boolean',
      label: intl.get('sdat.supplier.view.title.sameController').d('相同控制人'),
      defaultValue: false,
    },
    {
      name: 'control',
      type: 'boolean',
      label: intl.get('sdat.supplier.view.title.control').d('控制关系'),
      defaultValue: false,
    },
    {
      name: 'group',
      type: 'boolean',
      label: intl.get('sdat.supplier.view.title.group').d('相同集团'),
      defaultValue: false,
    },
    {
      name: 'guarantee',
      type: 'boolean',
      label: intl.get('sdat.supplier.view.title.guarantee').d('担保关系'),
      defaultValue: false,
    },
    // 联系方式
    {
      name: 'contact',
      type: 'boolean',
      label: intl.get('sdat.supplier.view.title.contact').d('联系方式'),
      defaultValue: true,
    },
    {
      name: 'same_phone',
      type: 'boolean',
      label: intl.get('sdat.supplier.view.title.samePhone').d('相同电话'),
      defaultValue: true,
    },
    {
      name: 'same_email',
      type: 'boolean',
      label: intl.get('sdat.supplier.view.title.sameEmail').d('相同邮箱'),
      defaultValue: true,
    },
    {
      name: 'same_address',
      type: 'boolean',
      label: intl.get('sdat.supplier.view.title.sameAddress').d('相同经营地址'),
      defaultValue: true,
    },
    {
      name: 'same_history_phone',
      type: 'boolean',
      label: intl.get('sdat.supplier.view.title.sameHistoryPhone').d('历史相同电话'),
      defaultValue: true,
    },
    {
      name: 'same_history_email',
      type: 'boolean',
      label: intl.get('sdat.supplier.view.title.sameHistoryEmail').d('历史相同邮箱'),
      defaultValue: true,
    },
    {
      name: 'same_history_address',
      type: 'boolean',
      label: intl.get('sdat.supplier.view.title.sameHistoryAddress').d('历史相同经营地址'),
      defaultValue: true,
    },
    // 投资机构白名单
    {
      name: 'whitelist',
      type: 'boolean',
      label: intl.get('sdat.supplier.view.title.whitelist').d('投资机构白名单'),
      defaultValue: false,
    },
    {
      name: 'public',
      type: 'boolean',
      label: intl.get('sdat.supplier.view.title.public').d('机关事业单位及投资企业'),
      defaultValue: false,
    },
    {
      name: 'gov',
      type: 'boolean',
      label: intl.get('sdat.supplier.view.title.gov').d('国资央国企及投资企业'),
      defaultValue: false,
    },
    {
      name: 'fund',
      type: 'boolean',
      label: intl.get('sdat.supplier.view.title.fund').d('公募基金'),
      defaultValue: false,
    },
    {
      name: 'bank',
      type: 'boolean',
      label: intl.get('sdat.supplier.view.title.bank').d('银行机构'),
      defaultValue: false,
    },
    {
      name: 'financial',
      type: 'boolean',
      label: intl.get('sdat.supplier.view.title.financial').d('其他金融机构'),
      defaultValue: false,
    },
    // 过滤企业状态
    {
      name: 'status',
      type: 'boolean',
      label: intl.get('sdat.supplier.view.title.status').d('过滤企业状态'),
      defaultValue: false,
    },
    {
      name: 'status2',
      type: 'boolean',
      label: intl.get('sdat.supplier.view.title.status2').d('注销'),
      defaultValue: false,
    },
    {
      name: 'status3',
      type: 'boolean',
      label: intl.get('sdat.supplier.view.title.status3').d('吊销'),
      defaultValue: false,
    },
    {
      name: 'status4',
      type: 'boolean',
      label: intl.get('sdat.supplier.view.title.status4').d('撤销'),
      defaultValue: false,
    },
    {
      name: 'status7',
      type: 'boolean',
      label: intl.get('sdat.supplier.view.title.status7').d('清算中'),
      defaultValue: false,
    },
  ],
  events: {
    update: ({ record, name, value }) => {
      /**
       * 父字段到子字段的级联映射。
       * @type {Record<string, string[]>}
       */
      const PARENT_CHILDREN_MAP = {
        equity: ['SH', 'HSH', 'branch'],
        SH: ['SH_percent_greater', 'SH_percent_less'],
        HSH: ['HSH_percent_greater', 'HSH_percent_less'],
        djg: ['LR', 'HLR', 'DIR', 'HDIR', 'SUP', 'HSUP', 'EXE', 'HEXE', 'djg_same_name'],
        control_guarantee: ['same_controller', 'control', 'group', 'guarantee'],
        contact: [
          'same_phone',
          'same_email',
          'same_address',
          'same_history_phone',
          'same_history_email',
          'same_history_address',
        ],
        whitelist: ['public', 'gov', 'fund', 'bank', 'financial'],
        status: ['status2', 'status3', 'status4', 'status7'],
      };

      /**
       * 子字段到父字段的反向映射。
       * @type {Record<string, { parent: string, siblings: string[] }>}
       */
      const CHILD_PARENT_MAP = {
        SH: { parent: 'equity', siblings: ['SH', 'HSH', 'branch'] },
        HSH: { parent: 'equity', siblings: ['SH', 'HSH', 'branch'] },
        branch: { parent: 'equity', siblings: ['SH', 'HSH', 'branch'] },
        SH_percent_greater: { parent: 'SH', siblings: ['SH_percent_greater', 'SH_percent_less'] },
        SH_percent_less: { parent: 'SH', siblings: ['SH_percent_greater', 'SH_percent_less'] },
        HSH_percent_greater: {
          parent: 'HSH',
          siblings: ['HSH_percent_greater', 'HSH_percent_less'],
        },
        HSH_percent_less: { parent: 'HSH', siblings: ['HSH_percent_greater', 'HSH_percent_less'] },
        LR: {
          parent: 'djg',
          siblings: ['LR', 'HLR', 'DIR', 'HDIR', 'SUP', 'HSUP', 'EXE', 'HEXE', 'djg_same_name'],
        },
        HLR: {
          parent: 'djg',
          siblings: ['LR', 'HLR', 'DIR', 'HDIR', 'SUP', 'HSUP', 'EXE', 'HEXE', 'djg_same_name'],
        },
        DIR: {
          parent: 'djg',
          siblings: ['LR', 'HLR', 'DIR', 'HDIR', 'SUP', 'HSUP', 'EXE', 'HEXE', 'djg_same_name'],
        },
        HDIR: {
          parent: 'djg',
          siblings: ['LR', 'HLR', 'DIR', 'HDIR', 'SUP', 'HSUP', 'EXE', 'HEXE', 'djg_same_name'],
        },
        SUP: {
          parent: 'djg',
          siblings: ['LR', 'HLR', 'DIR', 'HDIR', 'SUP', 'HSUP', 'EXE', 'HEXE', 'djg_same_name'],
        },
        HSUP: {
          parent: 'djg',
          siblings: ['LR', 'HLR', 'DIR', 'HDIR', 'SUP', 'HSUP', 'EXE', 'HEXE', 'djg_same_name'],
        },
        EXE: {
          parent: 'djg',
          siblings: ['LR', 'HLR', 'DIR', 'HDIR', 'SUP', 'HSUP', 'EXE', 'HEXE', 'djg_same_name'],
        },
        HEXE: {
          parent: 'djg',
          siblings: ['LR', 'HLR', 'DIR', 'HDIR', 'SUP', 'HSUP', 'EXE', 'HEXE', 'djg_same_name'],
        },
        djg_same_name: {
          parent: 'djg',
          siblings: ['LR', 'HLR', 'DIR', 'HDIR', 'SUP', 'HSUP', 'EXE', 'HEXE', 'djg_same_name'],
        },
        same_controller: {
          parent: 'control_guarantee',
          siblings: ['same_controller', 'control', 'group', 'guarantee'],
        },
        control: {
          parent: 'control_guarantee',
          siblings: ['same_controller', 'control', 'group', 'guarantee'],
        },
        group: {
          parent: 'control_guarantee',
          siblings: ['same_controller', 'control', 'group', 'guarantee'],
        },
        guarantee: {
          parent: 'control_guarantee',
          siblings: ['same_controller', 'control', 'group', 'guarantee'],
        },
        same_phone: {
          parent: 'contact',
          siblings: [
            'same_phone',
            'same_email',
            'same_address',
            'same_history_phone',
            'same_history_email',
            'same_history_address',
          ],
        },
        same_email: {
          parent: 'contact',
          siblings: [
            'same_phone',
            'same_email',
            'same_address',
            'same_history_phone',
            'same_history_email',
            'same_history_address',
          ],
        },
        same_address: {
          parent: 'contact',
          siblings: [
            'same_phone',
            'same_email',
            'same_address',
            'same_history_phone',
            'same_history_email',
            'same_history_address',
          ],
        },
        same_history_phone: {
          parent: 'contact',
          siblings: [
            'same_phone',
            'same_email',
            'same_address',
            'same_history_phone',
            'same_history_email',
            'same_history_address',
          ],
        },
        same_history_email: {
          parent: 'contact',
          siblings: [
            'same_phone',
            'same_email',
            'same_address',
            'same_history_phone',
            'same_history_email',
            'same_history_address',
          ],
        },
        same_history_address: {
          parent: 'contact',
          siblings: [
            'same_phone',
            'same_email',
            'same_address',
            'same_history_phone',
            'same_history_email',
            'same_history_address',
          ],
        },
        public: { parent: 'whitelist', siblings: ['public', 'gov', 'fund', 'bank', 'financial'] },
        gov: { parent: 'whitelist', siblings: ['public', 'gov', 'fund', 'bank', 'financial'] },
        fund: { parent: 'whitelist', siblings: ['public', 'gov', 'fund', 'bank', 'financial'] },
        bank: { parent: 'whitelist', siblings: ['public', 'gov', 'fund', 'bank', 'financial'] },
        financial: {
          parent: 'whitelist',
          siblings: ['public', 'gov', 'fund', 'bank', 'financial'],
        },
        status2: { parent: 'status', siblings: ['status2', 'status3', 'status4', 'status7'] },
        status3: { parent: 'status', siblings: ['status2', 'status3', 'status4', 'status7'] },
        status4: { parent: 'status', siblings: ['status2', 'status3', 'status4', 'status7'] },
        status7: { parent: 'status', siblings: ['status2', 'status3', 'status4', 'status7'] },
      };

      /**
       * 执行父→子级联，并标记级联来源以防止循环触发。
       * @param {string} parentField 父字段名
       * @param {*} val 要设置的值
       */
      const cascadeToChildren = (parentField, val) => {
        const children = PARENT_CHILDREN_MAP[parentField];
        if (!children) return;
        record.set('_cascadingSource', parentField);
        children.forEach((f) => record.set(f, val));
        record.set('_cascadingSource', null);
      };

      /**
       * 根据兄弟节点的选中状态同步父节点（仅用户手动操作时生效）。
       */
      const syncParentFromChildren = () => {
        const childConfig = CHILD_PARENT_MAP[name];
        if (!childConfig) return;
        const cascadingFrom = record.get('_cascadingSource');
        if (cascadingFrom === childConfig.parent || cascadingFrom === name) return;
        const allSelected = childConfig.siblings.every((f) => record.get(f));
        if (record.get(childConfig.parent) !== allSelected) {
          record.set('_cascadingSource', 'childToParent');
          record.set(childConfig.parent, allSelected);
          record.set('_cascadingSource', null);
        }
      };

      // 父→子级联（排除子→父反向触发导致的回弹）
      if (PARENT_CHILDREN_MAP[name] && record.get('_cascadingSource') !== 'childToParent') {
        cascadeToChildren(name, value);
      }

      // 子→父反向级联（排除程序自动触发的循环）
      syncParentFromChildren();

      // 触发校验
      if (
        [
          'SH_percent_greater',
          'SH_percent_less',
          'HSH_percent_greater',
          'HSH_percent_less',
        ].includes(name)
      ) {
        record.validate();
      }
    },
  },
});

export { SettingDS };
