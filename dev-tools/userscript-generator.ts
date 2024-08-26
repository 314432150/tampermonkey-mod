import open from "open";
import { startHttpServer } from "./server";
import toolConfig from "./tool-config.json" assert { type: "json" };

/**
 * 生成UserScript元数据注释模块
 *
 * 提供了一系列用于自动生成UserScript元数据注释的方法，
 * 包括生成 [@require] 注释以引用第三方CDN库、
 * 生成 [@icon] 注释以获取favicon图标链接以及
 * 生成整个UserScript的注释部分
 */

/**
 * 定义一个 UserScript 对象，用于描述用户脚本的元数据。
 */
export type UserScriptHeader = {
    // 用户脚本名称
    name: string;
    // 用户脚本命名空间
    namespace: string;
    // 版权声明
    copyright: string;
    // 用户脚本版本号
    version: string;
    // 用户脚本描述
    description: string;
    // 用户脚本图标
    icon: string;
    // 用户脚本高分辨率图标
    icon64: string;
    // 授予脚本的权限
    grant: string[];
    // 用户脚本作者
    author: string;
    // 用户脚本主页
    homepage: string;
    // 揭示脚本是否包含广告、追踪等特性
    antifeature: string[];
    // 用户脚本的应用范围
    include: string[];
    // 用户脚本的匹配规则
    match: string[];
    // 用户脚本的排除规则
    exclude: string[];
    // 用户脚本的运行时机
    "run-at": string;
    // 指定沙箱环境
    sandbox: "js" | "raw" | "dom" | "";
    // 用户脚本依赖的外部资源
    require: string[];
    // 预加载的资源
    resource: string[];
    // 允许脚本连接的域名
    connect: string[];
    // 禁止在 iframe 中运行脚本
    noframes: boolean;
    // 更新检查的 URL
    updateURL: string;
    // 下载更新的 URL
    downloadURL: string;
    // 支持和反馈的 URL
    supportURL: string;
    // 使用 webRequest 规则
    webRequest: string;
    // 是否解除包装直接注入脚本
    unwrap: boolean;
};

/**
 * 根据依赖项生成 [@require] 注释, 转换为第三方cdn库链接
 * @param {string[]} requires 依赖项列表
 * @returns 生成的 [@require] 注释字符串
 */
export function generateCdnRequires(requires: string[]) {
    return requires.map((requirement) => {
        const [pkg, version] = requirement.split("@");
        const url = `https://cdn.jsdelivr.net/npm/${pkg}${
            version ? `@${version}` : ""
        }`;
        return url;
    });
}

/**
 * 根据域名生成 [@icon] 注释,转换为favicon链接
 * @param {string} domain 域名
 * @returns 生成的 [@icon] 注释字符串
 */
export function generateIcon(domain: string) {
    return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
}

/**
 * 生成UserScript的注释部分
 * @param {UserScriptHeader} userScript - 用户脚本对象
 * @returns {string} - 返回生成的用户脚本注释字符串
 */
export function generateUserScriptComments(userScript: UserScriptHeader) {
    // 检查用户脚本对象是否初始化
    if (!userScript) {
        throw new Error("UserScript 未初始化");
    }

    // 生成注释
    let comments = "";
    // 根据最长的键长度对齐输出
    const keyLength =
        Math.max(...Object.keys(userScript).map((key) => key.length)) + 10;

    // 添加注释头
    comments += "// ==UserScript==\n";

    // 添加注释内容

    for (const [key, value] of Object.entries(userScript)) {
        // 处理非空数组
        if (Array.isArray(value) && value.length > 0) {
            // 遍历数组中的每个项
            value.forEach((item) => {
                // 如果项是字符串且非空，将其添加到注释中
                if (typeof item === "string" && item.trim() !== "") {
                    comments += `// @${key.padEnd(keyLength)} ${item}\n`;
                }
            });
        }
        // 如果value是非空字符串，直接添加到注释中
        else if (typeof value === "string" && value.trim() !== "") {
            comments += `// @${key.padEnd(keyLength)} ${value}\n`;
        }
        // 如果value是布尔值且为true，添加一个无内容的注释条目
        else if (typeof value === "boolean" && value === true) {
            comments += `// @${key.padEnd(keyLength)}\n`;
        }
    }

    // 添加注释尾
    comments += "// ==/UserScript==\n";

    // 返回注释
    return comments;
}

/**
 * 安装用户脚本
 * @param {string} file 用户脚本文件名
 */
export function installUserScript(file: string) {
    // 启动 HTTP 服务器
    startHttpServer();

    // 构建 URL
    const { host, port } = toolConfig.server;
    const url = `http://${host}:${port}/${file}`;

    // 在浏览器中打开 URL
    open(url);
    console.log(`正在打开浏览器安装: ${url}`);
}
