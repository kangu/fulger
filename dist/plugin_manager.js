"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PluginManager {
    constructor() {
        this.plugins = [];
    }
    loadPlugin(pluginName) {
        const plugin = require(`./plugins/${pluginName}.js`);
        // manually verify that it implements the transform interface
        if (typeof plugin.transform !== "function") {
            throw new Error(`Plugin '${pluginName}' does not have a 'transform' function.`);
        }
        this.plugins.push(plugin);
    }
    runTransformations(obj) {
        let transformedObject = obj;
        for (const plugin of this.plugins) {
            transformedObject = plugin.transform(transformedObject);
        }
        return transformedObject;
    }
}
exports.default = PluginManager;
//# sourceMappingURL=plugin_manager.js.map