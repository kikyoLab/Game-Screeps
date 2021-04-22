/* 在绘制控制台信息时使用的颜色 */
const colors = {
    red: '#ef9a9a',
    green: '#6b9955',
    yellow: '#c5c599',
    blue: '#8dc5e3'
};

/*  获取一些格式固定，但是在多处调用的名字 */
export const getName = {
    flagBaseCenter: (roomName) => `${roomName} center`
};

/**
 * 给指定文本添加颜色
 * @param content 要添加颜色的文本
 * @param colorName 要添加的颜色常量字符串
 * @param bolder 是否加粗
 */
export function colorful (content, colorName = null, bolder = false) {
    const colorStyle = colorName ? `color: ${colors[colorName]};` : '';
    const bolderStyle = bolder ? 'font-weight: bolder;' : '';
    return `<text style="${[colorStyle, bolderStyle].join(' ')}">${content}</text>`;
}

/**
 * 生成控制台链接
 * @param content 要显示的内容
 * @param url 要跳转到的 url
 * @param newTab 是否在新标签页打开
 */
export function createLink (content, url, newTab = true) {
    return `<a href="${url}" target="${newTab ? '_blank' : '_self'}">${content}</a>`;
}

/**
 * 给房间内添加跳转链接
 * @param roomName 添加调整链接的房间名
 * @returns 打印在控制台上后可以点击跳转的房间名
 */
export function createRoomLink (roomName) {
    return createLink(roomName, `https://screeps.com/a/#!/room/${Game.shard.name}/${roomName}`, false);
}

/**
 * 快捷生成单个常量帮助
 * @param name 常量简称
 * @param constant 常量名
 */
export function createConst (name, constant) {
    return `${colorful(name, 'green')} ${colorful(constant, 'blue')}`;
}


/**
 * 创建发送函数到控制台的调用链
 * @see https://screeps.slack.com/files/U5GS01HT8/FJGTY8VQE/console_button.php
 * @param command 要在游戏控制台执行的方法
 */
function sendCommandToConsole (command) {
    return `angular.element(document.body).injector().get('Console').sendCommand('(${command})()', 1)`;
}

/* 在控制台中创建 HTML元素的方法集合 */
export const createElement = {
    customStyle: () => {
        const style = `<style>
            input {
                background-color: #2b2b2b;
                border: none;
                border-bottom: 1px solid #888;
                padding: 3px;
                color: #ccc;
            }
            select {
                border: none;
                background-color: #2b2b2b;
                color: #ccc;
            }
            button {
                border: 1px solid #888;
                cursor: pointer;
                background-color: #2b2b2b;
                color: #ccc;
            }
        </style>`;
        return style.replace(/\n/g, '');
    },
    /**
     * 创建 input 输入框
     * @param detail 创建需要的信息
     */
    input (detail) {
        return `${detail.label || ''} <input name="${detail.name}" placeholder="${detail.placeholder || ''}"/>`;
    },

    /**
     * 创建 select 下拉框
     * @param detail 创建需要的信息
     */
    select (detail) {
        const parts = [`${detail.label || ''} <select name="${detail.name}">`];
        parts.push(...detail.options.map(option => ` <option value="${option.value}">${option.label}</option>`));
        parts.push(`</select>`);
        return parts.join('');
    },

    /**
     * 创建按钮
     * 按钮绑定的命令会在点击后发送至游戏控制台
     * @param detail 创建需要的信息
     */
    button (detail) {
        return `<button onclick="${sendCommandToConsole(detail.command)}">${detail.content}</button>`;
    },

    /**
     * 创建表单
     * @param name 表单的名称
     * @param details 表单元素列表
     * @param buttonDetail 按钮的信息
     */
    form (name, details, buttonDetail) {
        /* 创建唯一的表单名 */
        const formName = name + Game.time.toString();
        /* 添加样式和表单前标签 */
        const parts = [
            this.customStyle(),
            `<form name='${formName}'>`,
        ];
        /* 添加表单内容 */
        parts.push(...details.map(detail => {
            switch (detail.type) {
                case 'input':
                    return this.input(detail) + '    ';
                case 'select':
                    return this.select(detail) + '    ';
            }
        }));

        /**
         * 封装表单内容获取方法
         * 注意后面的 \`(${buttonDetail.command})(\${JSON.stringify(formDatas)\})\`
         * 这里之所以用 \ 把 ` 和 $ 转义了是因为要生成一个按钮点击时才会用到的模板字符串
         * 通过这个方法来把表单的内容 f=当做参数提供给 sendCommand里要执行的方法
         * 如果直接填 formDatas而不是 JSON.stringify(formDatas)会报错找不到 formdatas
         */
        const commandWarp = `(() => {
            const form = document.forms['${formName}']
            let formDatas = {}
            [${details.map(detail => `'${detail.name}'`).toString()}].map(eleName => formDatas[eleName] = form[eleName].value)
            angular.element(document.body).injector().get('Console').sendCommand(\`(${buttonDetail.command})(\${JSON.stringify(formDatas)\})\`, 1)
        })()`;
        /* 添加提交按钮 */
        parts.push(`<button type="button" onclick="${commandWarp.replace(/\n/g, ';')}">${buttonDetail.content}</button>`);
        parts.push(`</form>`);
        /* 压缩成一行 */
        return parts.join('');
    }
};