export interface IPlugin {
    /* accept any object to allow chaining of multiple dependend plugins */
    transform(obj: any): any
}

class PluginManager {
    private plugins: IPlugin[]

    constructor() {
        this.plugins = []
    }

    loadPlugin(pluginName: string) {
        const plugin = require(`./plugins/${pluginName}.js`)
        // manually verify that it implements the transform interface
        if (typeof plugin.transform !== "function") {
            throw new Error(`Plugin '${pluginName}' does not have a 'transform' function.`);
        }
        this.plugins.push(plugin)
    }

    runTransformations(obj: object): object {
        let transformedObject = obj
        for (const plugin of this.plugins) {
            transformedObject = plugin.transform(transformedObject)
        }
        return transformedObject
    }
}

export default PluginManager
