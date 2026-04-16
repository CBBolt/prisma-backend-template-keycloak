<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Login</title>
    <link rel="stylesheet" href="${url.resourcesPath}/css/styles.css" />
    <link rel="icon" type="image/x-icon" href="${url.resourcesPath}/img/favicon.ico" />
</head>
<body>
<div class="login-container">
    <h1>My Login</h1>

    <div class="seperator"></div>

    <!-- Global error message -->
    <#if message?has_content && message.type == "error">
        <div class="error-message">
            ${message.summary}
        </div>
    </#if>

    <div class="login-form">
        <form action="${url.loginAction}" method="post" id="kc-form-login">

            <!-- Username field -->
            <div class="form-group">
                <input 
                    id="username" 
                    name="username" 
                    type="text" 
                    value="${login.username!''}" 
                    placeholder="Username"
                    class="<#if messagesPerField.existsError('username')>input-error</#if>"
                />
                <#if messagesPerField.existsError('username')>
                    <span class="field-error">
                        ${kcSanitize(messagesPerField.get('username'))?no_esc}
                    </span>
                </#if>
            </div>

            <!-- Password field -->
            <div class="form-group">
                <input 
                    id="password" 
                    name="password" 
                    type="password" 
                    placeholder="Password"
                    class="<#if messagesPerField.existsError('password')>input-error</#if>"
                />
                <#if messagesPerField.existsError('password')>
                    <span class="field-error">
                        ${kcSanitize(messagesPerField.get('password'))?no_esc}
                    </span>
                </#if>
            </div>

            <input type="submit" value="Log In"/>
        </form>
    </div>
</div>
</body>
</html>