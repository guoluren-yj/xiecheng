import { injectGlobalGuides } from '../injectGuideList';
import config1 from './importAndExport';

export default function allConfig(){
  injectGlobalGuides(config1);
}