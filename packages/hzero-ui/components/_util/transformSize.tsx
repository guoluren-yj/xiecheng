import { Size } from 'choerodon-ui/lib/_util/enum';

export default function transformSize(size?: string): Size | undefined {
  switch (size) {
    case 'default':
      return Size.default;
    case 'large':
      return Size.large;
    case 'small':
      return Size.small;
    default:
      return undefined;
  }
}
