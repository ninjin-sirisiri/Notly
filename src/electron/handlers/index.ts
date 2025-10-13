import { registerNoteHandlers } from './note-handlers';
import { registerFolderHandlers } from './folder-handlers';
import { registerTagHandlers } from './tag-handlers';
import { registerTemplateHandlers } from './template-handlers';
import { registerStatsHandlers } from './stats-handlers';
import { registerSettingsHandlers } from './settings-handlers';

export function registerAllHandlers() {
  registerNoteHandlers();
  registerFolderHandlers();
  registerTagHandlers();
  registerTemplateHandlers();
  registerStatsHandlers();
  registerSettingsHandlers();
}
