import { boot } from '../ui/boot.js';
import { MenuApp } from './MenuApp.js';

void boot(<MenuApp token={location.hash.slice(1)} />);
