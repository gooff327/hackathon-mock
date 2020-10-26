"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormatDateDirective = exports.LogDirective = void 0;
const apollo_server_1 = require("apollo-server");
const graphql_1 = require("graphql");
const utils_1 = require("./utils");
class LogDirective extends apollo_server_1.SchemaDirectiveVisitor {
    visitFieldDefinition(field, type) {
        const { resolve = graphql_1.defaultFieldResolver } = field;
        field.resolve = function (root, _a, ctx, info) {
            var { format } = _a, rest = __rest(_a, ["format"]);
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`⚡️  ${type.objectType}.${field.name}`);
                return resolve.call(this, root, rest, ctx, info);
            });
        };
    }
}
exports.LogDirective = LogDirective;
class FormatDateDirective extends apollo_server_1.SchemaDirectiveVisitor {
    visitFieldDefinition(field) {
        const { resolve = graphql_1.defaultFieldResolver } = field;
        const { format: defaultFormat } = this.args;
        field.args.push({
            name: 'format',
            type: graphql_1.GraphQLString
        });
        field.resolve = function (root, _a, ctx, info) {
            var { format } = _a, rest = __rest(_a, ["format"]);
            return __awaiter(this, void 0, void 0, function* () {
                const date = yield resolve.call(this, root, rest, ctx, info);
                return utils_1.formatDate(date, format || defaultFormat);
            });
        };
    }
}
exports.FormatDateDirective = FormatDateDirective;
//# sourceMappingURL=directive.js.map