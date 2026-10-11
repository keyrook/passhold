import { boot } from '../ui/boot.js';
import { PromptApp } from './PromptApp.js';

void boot(<PromptApp token={location.hash.slice(1)} />);
