/**
 * 排查设置 DS
 * @author Felix(LQX5731@163.com)
 * @date 2026-05-13
 * @version 1.0.0
 * @lastUpdate 2026-05-28
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
      label: intl.get('sdat.supplier.view.title.public').d('机关事业单位及...'),
      defaultValue: false,
    },
    {
      name: 'gov',
      type: 'boolean',
      label: intl.get('sdat.supplier.view.title.gov').d('国资央国企及投...'),
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
      // 股权级联
      if (name === 'equity') {
        record.set('SH', value);
        record.set('HSH', value);
        record.set('branch', value);
      }
      if (name === 'SH') {
        record.set('SH_percent_greater', value);
        record.set('SH_percent_less', value);
      }
      if (name === 'HSH') {
        record.set('HSH_percent_greater', value);
        record.set('HSH_percent_less', value);
      }
      // 董监高法级联
      if (name === 'djg') {
        ['LR', 'HLR', 'DIR', 'HDIR', 'SUP', 'HSUP', 'EXE', 'HEXE', 'djg_same_name'].forEach((f) =>
          record.set(f, value)
        );
      }
      // 控制/担保级联
      if (name === 'control_guarantee') {
        ['same_controller', 'control', 'group', 'guarantee'].forEach((f) => record.set(f, value));
      }
      // 联系方式级联
      if (name === 'contact') {
        [
          'same_phone',
          'same_email',
          'same_address',
          'same_history_phone',
          'same_history_email',
          'same_history_address',
        ].forEach((f) => record.set(f, value));
      }
      // 投资机构白名单级联
      if (name === 'whitelist') {
        ['public', 'gov', 'fund', 'bank', 'financial'].forEach((f) => record.set(f, value));
      }
      // 过滤企业状态级联
      if (name === 'status') {
        ['status2', 'status3', 'status4', 'status7'].forEach((f) => record.set(f, value));
      }
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
