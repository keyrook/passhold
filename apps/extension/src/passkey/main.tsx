import { boot } from '../ui/boot.js';
import { PasskeyApp } from './PasskeyApp.js';

void boot(<PasskeyApp token={location.hash.slice(1)} />);
