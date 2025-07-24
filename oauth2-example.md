# OAuth2 配置示例

## 测试 OAuth2 Token 获取功能

### 1. 基本配置
在 NB Man 的 Auth 标签页中，选择 "Bearer Token" 类型，然后配置以下信息：

**Token URL**: `https://example.com/oauth/token`
**Client ID**: `your_client_id`
**Client Secret**: `your_client_secret`
**Grant Type**: `client_credentials`
**Scope**: `read write` (可选)

### 2. 常见 OAuth2 服务配置

#### GitHub OAuth2
- **Token URL**: `https://github.com/login/oauth/access_token`
- **Grant Type**: `authorization_code` (需要额外配置)

#### Google OAuth2
- **Token URL**: `https://oauth2.googleapis.com/token`
- **Grant Type**: `client_credentials`

#### 自定义服务
- **Token URL**: `https://your-api.com/oauth/token`
- **Grant Type**: `client_credentials` 或 `password`

### 3. 使用步骤

1. 在 Auth 标签页选择 "Bearer Token"
2. 填写 OAuth2 配置信息
3. 点击 "Get Token" 按钮
4. 系统会自动获取 token 并添加到 Authorization header
5. 发送请求时会自动使用获取到的 token

### 4. 支持的 Grant Types

- **client_credentials**: 客户端凭据模式
- **password**: 密码模式 (需要用户名和密码)
- **authorization_code**: 授权码模式 (暂不支持)

### 5. 注意事项

- Token URL 必须是完整的 HTTPS URL
- Client ID 和 Client Secret 必须正确
- 某些服务可能需要特定的 scope
- Token 会自动添加到请求头中 