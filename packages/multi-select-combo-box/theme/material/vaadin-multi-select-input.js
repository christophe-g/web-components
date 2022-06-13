import { inputFieldShared } from '@vaadin/vaadin-material-styles/mixins/input-field-shared.js';
import { registerStyles } from '@vaadin/vaadin-themable-mixin/vaadin-themable-mixin.js';

registerStyles('vaadin-multi-select-input', inputFieldShared, {
  moduleId: 'material-text-field-styles',
});

import '../../src/vaadin-multi-select-input.js';
