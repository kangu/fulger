import { IPlugin } from "../plugin_manager"

const EmailPlugin: IPlugin = {
    transform(obj: any): any {
        obj.process_by_email = true
        return obj
    }
}

module.exports = EmailPlugin
