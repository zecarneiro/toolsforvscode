"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandsEnum = void 0;
var CommandsEnum;
(function (CommandsEnum) {
    CommandsEnum["INSTALL"] = "extensionsmanager.install";
    CommandsEnum["UNINSTALL"] = "extensionsmanager.uninstall";
    CommandsEnum["MENU"] = "extensionsmanager.menu";
    CommandsEnum["UPDATED_CONFIG"] = "extensionsmanager.updatedconfig";
    CommandsEnum["INSTALL_EXTENSION"] = "code --install-extension {0}";
    CommandsEnum["UNINSTALL_EXTENSION"] = "code --uninstall-extension {0}";
})(CommandsEnum = exports.CommandsEnum || (exports.CommandsEnum = {}));
//# sourceMappingURL=commands-enum.js.map