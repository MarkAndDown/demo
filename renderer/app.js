// NB Man - Electron Version
class NBManApp {
    constructor() {
        this.currentRequest = {
            method: 'GET',
            url: '',
            params: [],
            headers: [],
            body: {
                type: 'none',
                content: ''
            },
            auth: {
                type: 'none',
                data: {}
            },
            tests: ''
        };
        
        this.collections = [];
        this.history = [];
        this.environments = {
            default: {},
            development: {
                baseUrl: 'http://localhost:3000',
                apiKey: 'dev-key-123'
            },
            staging: {
                baseUrl: 'https://staging-api.example.com',
                apiKey: 'staging-key-456'
            },
            production: {
                baseUrl: 'https://api.example.com',
                apiKey: 'prod-key-789'
            }
        };
        
        this.currentEnvironment = 'default';
        this.jsonEditor = null;
        this.testEditor = null;
        this.isRequestInProgress = false;
        
        this.init();
    }
    
    init() {
        try {
            console.log('Initializing NB Man application...');
            this.loadData();
            this.bindEvents();
            this.initCodeEditor();
            this.renderCollections();
            this.renderHistory();
            this.updateBodyContent();
            this.updateAuthContent();
            this.bindElectronEvents();
            
            // Add beforeunload event to save data when page is closed
            window.addEventListener('beforeunload', () => {
                console.log('Saving data before page unload...');
                this.saveData();
            });
            
            console.log('NB Man application initialized successfully');
        } catch (error) {
            console.error('Error during initialization:', error);
        }
    }
    
    bindElectronEvents() {
        // Bind Electron main process events
        if (window.electronAPI) {
            window.electronAPI.onNewRequest(() => {
                this.newRequest();
            });
            
            window.electronAPI.onSaveRequest(() => {
                this.saveRequest();
            });
            
            window.electronAPI.onImportCollections((event, collections) => {
                this.importCollections(collections);
            });
            
            window.electronAPI.onExportCollections((event, filePath) => {
                this.exportCollections(filePath);
            });
            
            window.electronAPI.onOpenSettings(() => {
                this.openSettings();
            });
        }
    }
    
    bindEvents() {
        // Check if events are already bound
        if (this.eventsBound) {
            console.log('Events already bound, skipping...');
            return;
        }
        
        console.log('Binding events...');
        
        // Method selection
        document.getElementById('methodSelect').addEventListener('change', (e) => {
            this.currentRequest.method = e.target.value;
        });
        
        // URL input
        document.getElementById('urlInput').addEventListener('input', (e) => {
            this.currentRequest.url = e.target.value;
        });
        
        // Send request
        document.getElementById('sendBtn').addEventListener('click', () => {
            if (!this.isRequestInProgress) {
                this.sendRequest();
            }
        });
        
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });
        
        // Response tab switching
        document.querySelectorAll('.response-tabs .tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchResponseTab(e.target.dataset.tab);
            });
        });
        
        // Parameter management
        document.getElementById('addParamBtn').addEventListener('click', () => {
            this.addParam();
        });
        
        // Header management
        document.getElementById('addHeaderBtn').addEventListener('click', () => {
            this.addHeader();
        });
        
        // Body type switching
        document.querySelectorAll('input[name="bodyType"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.currentRequest.body.type = e.target.value;
                this.updateBodyContent();
            });
        });
        
        // Auth type switching
        document.getElementById('authTypeSelect').addEventListener('change', (e) => {
            this.currentRequest.auth.type = e.target.value;
            this.updateAuthContent();
        });
        
        // Environment selection
        document.getElementById('environmentSelect').addEventListener('change', (e) => {
            this.currentEnvironment = e.target.value;
            this.applyEnvironment();
        });
        
        // Collection management
        document.getElementById('importCollectionBtn').addEventListener('click', () => {
            console.log('Import button clicked');
            this.importCollectionFromFile();
        });
        
        document.getElementById('newCollectionBtn').addEventListener('click', () => {
            console.log('New Collection button clicked');
            this.showNewCollectionModal();
        });
        
        // Save request
        document.getElementById('saveBtn').addEventListener('click', () => {
            this.saveRequest();
        });
        
        // Duplicate request
        document.getElementById('duplicateBtn').addEventListener('click', () => {
            this.duplicateRequest();
        });
        
        // Copy response
        document.getElementById('copyResponseBtn').addEventListener('click', () => {
            this.copyResponse();
        });
        
        // Download response
        document.getElementById('downloadResponseBtn').addEventListener('click', () => {
            this.downloadResponse();
        });
        
        // Clear history
        document.getElementById('clearHistoryBtn').addEventListener('click', () => {
            this.clearHistory();
        });
        
        // Modal close
        document.querySelector('.modal-close').addEventListener('click', () => {
            this.closeModal();
        });
        
        // Click modal background to close
        document.getElementById('modal').addEventListener('click', (e) => {
            if (e.target.id === 'modal') {
                this.closeModal();
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                if (!this.isRequestInProgress) {
                    this.sendRequest();
                }
            }
        });
        
        // Mark events as bound
        this.eventsBound = true;
        console.log('Events bound successfully');
    }
    
    initCodeEditor() {
        // Initialize test script editor
        const testScript = document.getElementById('testScript');
        if (testScript && window.CodeMirror) {
            this.testEditor = CodeMirror.fromTextArea(testScript, {
                mode: 'javascript',
                theme: 'monokai',
                lineNumbers: true,
                autoCloseBrackets: true,
                matchBrackets: true,
                indentUnit: 2,
                tabSize: 2,
                lineWrapping: true
            });
            
            this.testEditor.on('change', (cm) => {
                this.currentRequest.tests = cm.getValue();
            });
        }
    }
    
    switchTab(tabName) {
        // Remove all active states
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        // Activate selected tab
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');
    }
    
    switchResponseTab(tabName) {
        // Remove all active states
        document.querySelectorAll('.response-tabs .tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelectorAll('.response-tabs .tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        // Activate selected tab
        document.querySelector(`.response-tabs [data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');
    }
    
    addParam() {
        const paramsList = document.getElementById('paramsList');
        const paramRow = document.createElement('div');
        paramRow.className = 'param-row';
        paramRow.innerHTML = `
            <input type="text" placeholder="Parameter name" class="param-key">
            <input type="text" placeholder="Parameter value" class="param-value">
            <button onclick="this.parentElement.remove()">Delete</button>
        `;
        paramsList.appendChild(paramRow);
        
        // Bind events
        paramRow.querySelector('.param-key').addEventListener('input', (e) => {
            this.updateParams();
        });
        paramRow.querySelector('.param-value').addEventListener('input', (e) => {
            this.updateParams();
        });
    }
    
    addHeader() {
        const headersList = document.getElementById('headersList');
        const headerRow = document.createElement('div');
        headerRow.className = 'header-row';
        headerRow.innerHTML = `
            <input type="text" placeholder="Header name" class="header-key">
            <input type="text" placeholder="Header value" class="header-value">
            <button onclick="this.parentElement.remove()">Delete</button>
        `;
        headersList.appendChild(headerRow);
        
        // Bind events
        headerRow.querySelector('.header-key').addEventListener('input', (e) => {
            this.updateHeaders();
        });
        headerRow.querySelector('.header-value').addEventListener('input', (e) => {
            this.updateHeaders();
        });
    }
    
    updateParams() {
        const params = [];
        document.querySelectorAll('.param-row').forEach(row => {
            const key = row.querySelector('.param-key').value.trim();
            const value = row.querySelector('.param-value').value.trim();
            if (key) {
                params.push({ key, value });
            }
        });
        this.currentRequest.params = params;
    }
    
    updateHeaders() {
        const headers = [];
        document.querySelectorAll('.header-row').forEach(row => {
            const key = row.querySelector('.header-key').value.trim();
            const value = row.querySelector('.header-value').value.trim();
            if (key) {
                headers.push({ key, value });
            }
        });
        this.currentRequest.headers = headers;
    }
    
    updateBodyContent() {
        const bodyContent = document.getElementById('bodyContent');
        const type = this.currentRequest.body.type;
        
        bodyContent.innerHTML = '';
        
        switch (type) {
            case 'json':
                const jsonTextarea = document.createElement('textarea');
                jsonTextarea.className = 'raw-input';
                jsonTextarea.placeholder = 'Enter JSON data...';
                jsonTextarea.value = this.currentRequest.body.content || '{\n  \n}';
                jsonTextarea.addEventListener('input', (e) => {
                    this.currentRequest.body.content = e.target.value;
                });
                bodyContent.appendChild(jsonTextarea);
                break;
                
            case 'form':
                const formData = document.createElement('div');
                formData.className = 'form-data';
                formData.innerHTML = `
                    <div class="form-row">
                        <input type="text" placeholder="Field name" class="form-key">
                        <input type="text" placeholder="Field value" class="form-value">
                        <button onclick="this.parentElement.remove()">Delete</button>
                    </div>
                `;
                bodyContent.appendChild(formData);
                
                // Add new row button
                const addFormRowBtn = document.createElement('button');
                addFormRowBtn.className = 'btn-secondary';
                addFormRowBtn.innerHTML = '<i class="fas fa-plus"></i> Add Field';
                addFormRowBtn.onclick = () => this.addFormRow(formData);
                bodyContent.appendChild(addFormRowBtn);
                break;
                
            case 'raw':
                const rawTextarea = document.createElement('textarea');
                rawTextarea.className = 'raw-input';
                rawTextarea.placeholder = 'Enter raw data...';
                rawTextarea.value = this.currentRequest.body.content || '';
                rawTextarea.addEventListener('input', (e) => {
                    this.currentRequest.body.content = e.target.value;
                });
                bodyContent.appendChild(rawTextarea);
                break;
        }
    }
    
    addFormRow(container) {
        const formRow = document.createElement('div');
        formRow.className = 'form-row';
        formRow.innerHTML = `
            <input type="text" placeholder="Field name" class="form-key">
            <input type="text" placeholder="Field value" class="form-value">
            <button onclick="this.parentElement.remove()">Delete</button>
        `;
        container.insertBefore(formRow, container.lastElementChild);
    }
    
    updateAuthContent() {
        const authContent = document.getElementById('authContent');
        const type = this.currentRequest.auth.type;
        
        authContent.innerHTML = '';
        
        switch (type) {
            case 'bearer':
                authContent.innerHTML = `
                    <div class="auth-field">
                        <label>Bearer Token</label>
                        <div class="token-input-group">
                            <input type="text" placeholder="Enter Bearer Token" id="bearerToken">
                            <button id="getTokenBtn" class="btn-secondary" title="Get OAuth2 Token">
                                <i class="fas fa-key"></i> Get Token
                            </button>
                        </div>
                    </div>
                    <div class="oauth2-config" style="margin-top: 15px; padding: 15px; background: #1e1e1e; border-radius: 4px; border: 1px solid #404040;">
                        <h4 style="margin-bottom: 10px; color: #ff6b35;">OAuth2 Configuration</h4>
                        <div class="auth-field">
                            <label>Token URL</label>
                            <input type="text" id="tokenUrl" placeholder="https://example.com/oauth/token">
                        </div>
                        <div class="auth-field">
                            <label>Client ID</label>
                            <input type="text" id="clientId" placeholder="Enter client ID">
                        </div>
                        <div class="auth-field">
                            <label>Client Secret</label>
                            <input type="password" id="clientSecret" placeholder="Enter client secret">
                        </div>
                        <div class="auth-field">
                            <label>Grant Type</label>
                            <input type="text" id="grantType" placeholder="client_credentials" value="client_credentials">
                        </div>
                        <div class="auth-field">
                            <label>Scope</label>
                            <input type="text" id="scope" placeholder="Enter scope (optional)">
                        </div>
                    </div>
                `;
                break;
                
            case 'basic':
                authContent.innerHTML = `
                    <div class="auth-field">
                        <label>Username</label>
                        <input type="text" placeholder="Enter username" id="basicUsername">
                    </div>
                    <div class="auth-field">
                        <label>Password</label>
                        <input type="password" placeholder="Enter password" id="basicPassword">
                    </div>
                `;
                break;
                
            case 'apiKey':
                authContent.innerHTML = `
                    <div class="auth-field">
                        <label>Key Name</label>
                        <input type="text" placeholder="e.g. X-API-Key" id="apiKeyName">
                    </div>
                    <div class="auth-field">
                        <label>Key Value</label>
                        <input type="text" placeholder="Enter API Key" id="apiKeyValue">
                    </div>
                `;
                break;
        }
        
        // Bind events
        authContent.querySelectorAll('input, select').forEach(input => {
            input.addEventListener('input', () => {
                this.updateAuth();
            });
        });
        
        // Bind get token button
        const getTokenBtn = document.getElementById('getTokenBtn');
        if (getTokenBtn) {
            getTokenBtn.addEventListener('click', () => {
                this.getOAuth2Token();
            });
        }
        
        // Load existing values
        this.loadAuthValues();
    }

    loadAuthValues() {
        const authData = this.currentRequest.auth.data;
        if (!authData) return;
        
        const type = this.currentRequest.auth.type;
        
        switch (type) {
            case 'bearer':
                const bearerTokenInput = document.getElementById('bearerToken');
                if (bearerTokenInput) {
                    bearerTokenInput.value = authData.token || '';
                }
                
                // Load OAuth2 configuration
                if (authData.oauth2) {
                    const tokenUrlInput = document.getElementById('tokenUrl');
                    const clientIdInput = document.getElementById('clientId');
                    const clientSecretInput = document.getElementById('clientSecret');
                    const grantTypeSelect = document.getElementById('grantType');
                    const scopeInput = document.getElementById('scope');
                    
                    if (tokenUrlInput) tokenUrlInput.value = authData.oauth2.tokenUrl || '';
                    if (clientIdInput) clientIdInput.value = authData.oauth2.clientId || '';
                    if (clientSecretInput) clientSecretInput.value = authData.oauth2.clientSecret || '';
                    if (grantTypeSelect) grantTypeSelect.value = authData.oauth2.grantType || 'client_credentials';
                    if (scopeInput) scopeInput.value = authData.oauth2.scope || '';
                }
                break;
                
            case 'basic':
                const basicUsernameInput = document.getElementById('basicUsername');
                const basicPasswordInput = document.getElementById('basicPassword');
                if (basicUsernameInput) basicUsernameInput.value = authData.username || '';
                if (basicPasswordInput) basicPasswordInput.value = authData.password || '';
                break;
                
            case 'apiKey':
                const apiKeyNameInput = document.getElementById('apiKeyName');
                const apiKeyValueInput = document.getElementById('apiKeyValue');
                if (apiKeyNameInput) apiKeyNameInput.value = authData.key || '';
                if (apiKeyValueInput) apiKeyValueInput.value = authData.value || '';
                break;
        }
    }

    async getOAuth2Token() {
        try {
            // Update auth data first
            this.updateAuth();
            
            const oauth2 = this.currentRequest.auth.data.oauth2;
            
            // Validate required fields
            if (!oauth2.tokenUrl) {
                this.showToast('Token URL is required', 'error');
                return;
            }
            if (!oauth2.clientId) {
                this.showToast('Client ID is required', 'error');
                return;
            }
            if (!oauth2.clientSecret) {
                this.showToast('Client Secret is required', 'error');
                return;
            }
            
            // Show loading state
            const getTokenBtn = document.getElementById('getTokenBtn');
            const originalText = getTokenBtn.innerHTML;
            getTokenBtn.innerHTML = '<div class="loading"></div> Getting Token...';
            getTokenBtn.disabled = true;
            
            // Prepare request body based on grant type
            let requestBody;
            const headers = {
                'Content-Type': 'application/x-www-form-urlencoded'
            };
            
            switch (oauth2.grantType) {
                case 'client_credentials':
                    requestBody = new URLSearchParams({
                        grant_type: 'client_credentials',
                        client_id: oauth2.clientId,
                        client_secret: oauth2.clientSecret
                    });
                    if (oauth2.scope) {
                        requestBody.append('scope', oauth2.scope);
                    }
                    break;
                    
                case 'password':
                    // For password grant, we need username and password
                    const username = prompt('Enter username:');
                    const password = prompt('Enter password:');
                    if (!username || !password) {
                        this.showToast('Username and password are required', 'error');
                        return;
                    }
                    requestBody = new URLSearchParams({
                        grant_type: 'password',
                        client_id: oauth2.clientId,
                        client_secret: oauth2.clientSecret,
                        username: username,
                        password: password
                    });
                    if (oauth2.scope) {
                        requestBody.append('scope', oauth2.scope);
                    }
                    break;
                    
                case 'authorization_code':
                    this.showToast('Authorization Code grant type is not supported yet', 'warning');
                    return;
                    
                default:
                    this.showToast('Unsupported grant type', 'error');
                    return;
            }
            
            // Make token request
            const response = await fetch(oauth2.tokenUrl, {
                method: 'POST',
                headers: headers,
                body: requestBody
            });
            
            if (!response.ok) {
                throw new Error(`Token request failed: ${response.status} ${response.statusText}`);
            }
            
            const tokenData = await response.json();
            
            if (tokenData.access_token) {
                // Update the bearer token input
                const bearerTokenInput = document.getElementById('bearerToken');
                bearerTokenInput.value = tokenData.access_token;
                
                // Update the current request auth data
                this.currentRequest.auth.data.token = tokenData.access_token;
                
                // Add token to headers automatically
                this.addTokenToHeaders(tokenData.access_token);
                
                this.showToast('Token obtained successfully', 'success');
                
                // Show token info
                console.log('Token response:', tokenData);
                if (tokenData.expires_in) {
                    const expiryDate = new Date(Date.now() + tokenData.expires_in * 1000);
                    this.showToast(`Token expires at: ${expiryDate.toLocaleString()}`, 'info');
                }
            } else {
                throw new Error('No access_token in response');
            }
            
        } catch (error) {
            console.error('Failed to get OAuth2 token:', error);
            this.showToast('Failed to get token: ' + error.message, 'error');
        } finally {
            // Restore button state
            const getTokenBtn = document.getElementById('getTokenBtn');
            if (getTokenBtn) {
                getTokenBtn.innerHTML = '<i class="fas fa-key"></i> Get Token';
                getTokenBtn.disabled = false;
            }
        }
    }

    addTokenToHeaders(token) {
        // Add Authorization header with the new token
        const headersList = document.getElementById('headersList');
        
        // Check if Authorization header already exists
        let authHeaderExists = false;
        headersList.querySelectorAll('.header-row').forEach(row => {
            const keyInput = row.querySelector('.header-key');
            if (keyInput && keyInput.value.toLowerCase() === 'authorization') {
                const valueInput = row.querySelector('.header-value');
                valueInput.value = `Bearer ${token}`;
                authHeaderExists = true;
            }
        });
        
        // If Authorization header doesn't exist, add it
        if (!authHeaderExists) {
            this.addHeader();
            const lastRow = headersList.lastElementChild;
            lastRow.querySelector('.header-key').value = 'Authorization';
            lastRow.querySelector('.header-value').value = `Bearer ${token}`;
        }
        
        // Update headers data
        this.updateHeaders();
    }
    
    updateAuth() {
        const type = this.currentRequest.auth.type;
        const data = {};
        
        switch (type) {
            case 'bearer':
                data.token = document.getElementById('bearerToken')?.value || '';
                // Save OAuth2 configuration
                data.oauth2 = {
                    tokenUrl: document.getElementById('tokenUrl')?.value || '',
                    clientId: document.getElementById('clientId')?.value || '',
                    clientSecret: document.getElementById('clientSecret')?.value || '',
                    grantType: document.getElementById('grantType')?.value || 'client_credentials',
                    scope: document.getElementById('scope')?.value || ''
                };
                break;
            case 'basic':
                data.username = document.getElementById('basicUsername')?.value || '';
                data.password = document.getElementById('basicPassword')?.value || '';
                break;
            case 'apiKey':
                data.key = document.getElementById('apiKeyName')?.value || '';
                data.value = document.getElementById('apiKeyValue')?.value || '';
                break;
        }
        
        this.currentRequest.auth.data = data;
    }
    
    async sendRequest() {
        if (this.isRequestInProgress) {
            return; // Prevent multiple simultaneous requests
        }
        this.isRequestInProgress = true;
        const sendBtn = document.getElementById('sendBtn');
        const originalText = sendBtn.innerHTML;
        const startTime = Date.now();
        try {
            // Update current request data
            this.updateParams();
            this.updateHeaders();
            this.updateAuth();
            // Build URL
            let url = this.currentRequest.url;
            if (this.currentRequest.params.length > 0) {
                const params = new URLSearchParams();
                this.currentRequest.params.forEach(param => {
                    if (param.key && param.value) {
                        params.append(param.key, param.value);
                    }
                });
                url += (url.includes('?') ? '&' : '?') + params.toString();
            }
            // Build request options
            const options = {
                method: this.currentRequest.method,
                headers: {}
            };
            // Add headers
            this.currentRequest.headers.forEach(header => {
                if (header.key && header.value) {
                    options.headers[header.key] = header.value;
                }
            });
            // Add authentication
            this.addAuthToRequest(options);
            // Add request body
            if (this.currentRequest.body.type !== 'none') {
                this.addBodyToRequest(options);
            }
            // Show loading state
            sendBtn.innerHTML = '<div class="loading"></div> Sending...';
            sendBtn.disabled = true;
            // Send request
            const response = await fetch(url, options);
            const responseTime = Date.now() - startTime;
            // Get response data
            const responseText = await response.text();
            let responseData;
            try {
                responseData = JSON.parse(responseText);
            } catch {
                responseData = responseText;
            }
            // Display response
            this.displayResponse(response, responseData, responseTime, responseText);
            // Add to history
            this.addToHistory();
            // Run tests
            this.runTests(response, responseData);
        } catch (error) {
            console.error('Request failed:', error);
            this.showToast('Request failed: ' + error.message, 'error');
        } finally {
            sendBtn.innerHTML = originalText;
            sendBtn.disabled = false;
            this.isRequestInProgress = false;
        }
    }
    
    addAuthToRequest(options) {
        const auth = this.currentRequest.auth;
        
        switch (auth.type) {
            case 'bearer':
                if (auth.data.token) {
                    options.headers['Authorization'] = `Bearer ${auth.data.token}`;
                }
                break;
            case 'basic':
                if (auth.data.username && auth.data.password) {
                    const credentials = btoa(`${auth.data.username}:${auth.data.password}`);
                    options.headers['Authorization'] = `Basic ${credentials}`;
                }
                break;
            case 'apiKey':
                if (auth.data.key && auth.data.value) {
                    options.headers[auth.data.key] = auth.data.value;
                }
                break;
        }
    }
    
    addBodyToRequest(options) {
        const body = this.currentRequest.body;
        
        switch (body.type) {
            case 'json':
                if (body.content) {
                    try {
                        options.body = JSON.stringify(JSON.parse(body.content));
                        options.headers['Content-Type'] = 'application/json';
                    } catch (error) {
                        this.showToast('JSON format error', 'error');
                        throw error;
                    }
                }
                break;
            case 'form':
                const formData = new FormData();
                document.querySelectorAll('.form-row').forEach(row => {
                    const key = row.querySelector('.form-key').value.trim();
                    const value = row.querySelector('.form-value').value.trim();
                    if (key) {
                        formData.append(key, value);
                    }
                });
                options.body = formData;
                break;
            case 'raw':
                if (body.content) {
                    options.body = body.content;
                    options.headers['Content-Type'] = 'text/plain';
                }
                break;
        }
    }
    
    displayResponse(response, data, responseTime, responseText) {
        // Update response information
        document.getElementById('responseStatus').textContent = response.status;
        document.getElementById('responseStatus').className = `status-code ${response.status >= 200 && response.status < 300 ? 'success' : response.status >= 400 ? 'error' : 'warning'}`;
        document.getElementById('responseTime').textContent = `${responseTime}ms`;
        document.getElementById('responseSize').textContent = this.formatBytes(responseText.length);
        
        // Display response body
        const responseBody = document.getElementById('responseBody');
        if (typeof data === 'object') {
            responseBody.textContent = JSON.stringify(data, null, 2);
        } else {
            responseBody.textContent = data;
        }
        
        // Display response headers
        const responseHeaders = document.getElementById('responseHeaders');
        const headersText = Array.from(response.headers.entries())
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n');
        responseHeaders.textContent = headersText;
        
        // Display Cookies
        const responseCookies = document.getElementById('responseCookies');
        const cookies = document.cookie.split(';').map(cookie => cookie.trim()).join('\n');
        responseCookies.textContent = cookies || 'No Cookies';
    }
    
    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    addToHistory() {
        const historyItem = {
            id: Date.now(),
            method: this.currentRequest.method,
            url: this.currentRequest.url,
            timestamp: new Date().toISOString()
        };
        
        this.history.unshift(historyItem);
        if (this.history.length > 50) {
            this.history = this.history.slice(0, 50);
        }
        
        this.renderHistory();
        this.saveData();
    }
    
    renderHistory() {
        const historyList = document.getElementById('historyList');
        if (!historyList) {
            console.error('historyList element not found');
            return;
        }
        
        historyList.innerHTML = '';
        
        this.history.forEach((item, index) => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.style.display = 'flex';
            historyItem.style.alignItems = 'center';
            historyItem.style.justifyContent = 'space-between';
            
            const contentDiv = document.createElement('div');
            contentDiv.style.flex = '1';
            contentDiv.style.cursor = 'pointer';
            contentDiv.innerHTML = `
                <div style="font-weight: 600; color: #667eea;">${item.method}</div>
                <div style="font-size: 0.8rem; margin-top: 2px;">${item.url}</div>
                <div style="font-size: 0.7rem; color: rgba(255,255,255,0.7); margin-top: 2px;">
                    ${new Date(item.timestamp).toLocaleString()}
                </div>
            `;
            contentDiv.onclick = () => this.loadFromHistory(item);
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-history-btn';
            deleteBtn.title = 'Delete this history item';
            deleteBtn.style.cssText = 'background: #dc3545; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 0.8rem; margin-left: 8px;';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.onclick = (e) => {
                e.stopPropagation();
                this.deleteHistoryItem(index);
            };
            
            historyItem.appendChild(contentDiv);
            historyItem.appendChild(deleteBtn);
            historyList.appendChild(historyItem);
        });
    }
    
    loadFromHistory(historyItem) {
        this.currentRequest.method = historyItem.method;
        this.currentRequest.url = historyItem.url;
        
        document.getElementById('methodSelect').value = historyItem.method;
        document.getElementById('urlInput').value = historyItem.url;
    }
    
    deleteHistoryItem(index) {
        if (confirm('Are you sure you want to delete this history item?')) {
            this.history.splice(index, 1);
            this.renderHistory();
            this.saveData();
            this.showToast('History item deleted', 'success');
        }
    }
    
    clearHistory() {
        if (confirm('Are you sure you want to clear history?')) {
            this.history = [];
            this.renderHistory();
            this.saveData();
            this.showToast('History cleared', 'success');
        }
    }
    
    runTests(response, data) {
        if (!this.currentRequest.tests) return;
        
        try {
            // Create test environment
            const testContext = {
                response: response,
                data: data,
                status: response.status,
                headers: Object.fromEntries(response.headers.entries()),
                body: data
            };
            
            // Run test script
            const testFunction = new Function('pm', 'response', 'data', this.currentRequest.tests);
            testFunction(testContext, response, data);
            
            this.showToast('Tests completed', 'success');
        } catch (error) {
            console.error('Test execution failed:', error);
            this.showToast('Test execution failed: ' + error.message, 'error');
        }
    }
    
    newRequest() {
        this.currentRequest = {
            method: 'GET',
            url: '',
            params: [],
            headers: [],
            body: {
                type: 'none',
                content: ''
            },
            auth: {
                type: 'none',
                data: {}
            },
            tests: ''
        };
        
        // Reset UI
        document.getElementById('methodSelect').value = 'GET';
        document.getElementById('urlInput').value = '';
        this.updateBodyContent();
        this.updateAuthContent();
        
        this.showToast('New request created', 'success');
    }
    
    saveRequest() {
        // Show a modal to get request name and select collection
        this.showSaveRequestModal();
    }
    
    showSaveRequestModal() {
        const requestName = this.currentRequest.url ? this.currentRequest.url.split('/').pop() || 'Untitled Request' : 'Untitled Request';
        
        let content = `
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: 600;">Request Name</label>
                <input type="text" id="requestName" value="${requestName}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
        `;
        
        if (this.collections.length > 0) {
            content += `
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: 600;">Save to Collection</label>
                    <select id="collectionSelect" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                        <option value="new">Create New Collection</option>
                        ${this.collections.map(collection => 
                            `<option value="${collection.id}">${collection.name}</option>`
                        ).join('')}
                    </select>
                </div>
            `;
        } else {
            content += `
                <div style="margin-bottom: 15px;">
                    <p style="color: #888; font-size: 0.9rem;">No collections exist. A new collection will be created.</p>
                </div>
            `;
        }
        
        content += `
            <div style="text-align: right;">
                <button id="saveRequestBtn" style="background: #ff6b35; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Save Request</button>
            </div>
        `;
        
        this.showModal('Save Request', content);
        
        // Bind events after modal is shown
        setTimeout(() => {
            const saveBtn = document.getElementById('saveRequestBtn');
            if (saveBtn) {
                saveBtn.addEventListener('click', () => {
                    this.performSaveRequest();
                });
            }
            
            // Allow Enter key to save
            const requestNameInput = document.getElementById('requestName');
            if (requestNameInput) {
                requestNameInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.performSaveRequest();
                    }
                });
            }
        }, 100);
    }
    
    performSaveRequest() {
        const requestName = document.getElementById('requestName').value.trim();
        if (!requestName) {
            this.showToast('Please enter a request name', 'error');
            return;
        }
        
        const collectionSelect = document.getElementById('collectionSelect');
        const selectedCollectionId = collectionSelect ? collectionSelect.value : 'new';
        
        // Create the request object
        const request = {
            id: Date.now(),
            name: requestName,
            method: this.currentRequest.method,
            url: this.currentRequest.url,
            params: [...this.currentRequest.params],
            headers: [...this.currentRequest.headers],
            body: { ...this.currentRequest.body },
            auth: { ...this.currentRequest.auth },
            tests: this.currentRequest.tests || ''
        };
        
        if (selectedCollectionId === 'new') {
            // Create new collection
            const collectionName = prompt('Enter collection name:') || 'New Collection';
            const collection = {
                id: Date.now(),
                name: collectionName,
                requests: [request]
            };
            this.collections.push(collection);
            this.showToast(`Request saved to new collection "${collectionName}"`, 'success');
        } else {
            // Add to existing collection
            const collection = this.collections.find(c => c.id == selectedCollectionId);
            if (collection) {
                collection.requests.push(request);
                this.showToast(`Request saved to collection "${collection.name}"`, 'success');
            } else {
                this.showToast('Collection not found', 'error');
                return;
            }
        }
        
        this.renderCollections();
        this.saveData();
        this.closeModal();
    }
    
    renderCollections() {
        const collectionsList = document.getElementById('collectionsList');
        if (!collectionsList) {
            console.error('collectionsList element not found');
            return;
        }
        
        collectionsList.innerHTML = '';
        
        this.collections.forEach(collection => {
            // Create collection header
            const collectionHeader = document.createElement('div');
            collectionHeader.className = 'collection-header';
            collectionHeader.style.display = 'flex';
            collectionHeader.style.alignItems = 'center';
            collectionHeader.style.justifyContent = 'space-between';
            
            const contentDiv = document.createElement('div');
            contentDiv.style.flex = '1';
            contentDiv.style.cursor = 'pointer';
            contentDiv.innerHTML = `
                <div style="font-weight: 600; color: #ff6b35;">
                    <i class="fas fa-folder"></i> ${collection.name}
                </div>
                <div style="font-size: 0.8rem; margin-top: 2px; color: #888;">
                    ${collection.requests ? collection.requests.length : 0} requests
                </div>
            `;
            
            const actionsDiv = document.createElement('div');
            actionsDiv.style.display = 'flex';
            actionsDiv.style.gap = '4px';
            
            // Delete collection button
            const deleteCollectionBtn = document.createElement('button');
            deleteCollectionBtn.className = 'delete-collection-btn';
            deleteCollectionBtn.title = 'Delete entire collection';
            deleteCollectionBtn.style.cssText = 'background: #dc3545; color: white; border: none; padding: 4px 6px; border-radius: 4px; cursor: pointer; font-size: 0.7rem;';
            deleteCollectionBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteCollectionBtn.onclick = (e) => {
                e.stopPropagation();
                this.deleteCollection(this.collections.indexOf(collection));
            };
            
            actionsDiv.appendChild(deleteCollectionBtn);
            collectionHeader.appendChild(contentDiv);
            collectionHeader.appendChild(actionsDiv);
            
            // Toggle collection expansion
            contentDiv.onclick = (e) => {
                e.stopPropagation();
                const requestsContainer = collectionHeader.nextElementSibling;
                if (requestsContainer.style.display === 'none') {
                    requestsContainer.style.display = 'block';
                    contentDiv.querySelector('i').className = 'fas fa-folder-open';
                } else {
                    requestsContainer.style.display = 'none';
                    contentDiv.querySelector('i').className = 'fas fa-folder';
                }
            };
            
            collectionsList.appendChild(collectionHeader);
            
            // Create requests container
            const requestsContainer = document.createElement('div');
            requestsContainer.className = 'collection-requests';
            requestsContainer.style.display = 'none';
            requestsContainer.style.marginLeft = '20px';
            requestsContainer.style.marginTop = '5px';
            
            if (collection.requests && collection.requests.length > 0) {
                collection.requests.forEach(request => {
                    const requestItem = document.createElement('div');
                    requestItem.className = 'request-item';
                    requestItem.style.padding = '8px 12px';
                    requestItem.style.marginBottom = '3px';
                    requestItem.style.background = '#2d2d2d';
                    requestItem.style.border = '1px solid #404040';
                    requestItem.style.borderRadius = '4px';
                    requestItem.style.cursor = 'pointer';
                    requestItem.style.transition = 'all 0.2s ease';
                    requestItem.style.fontSize = '0.9rem';
                    
                    requestItem.style.display = 'flex';
                    requestItem.style.alignItems = 'center';
                    requestItem.style.justifyContent = 'space-between';
                    
                    const requestContent = document.createElement('div');
                    requestContent.style.display = 'flex';
                    requestContent.style.alignItems = 'center';
                    requestContent.style.gap = '8px';
                    requestContent.style.flex = '1';
                    requestContent.style.cursor = 'pointer';
                    requestContent.innerHTML = `
                        <span style="color: #ff6b35; font-weight: 600; min-width: 40px;">${request.method}</span>
                        <span style="color: #e1e1e1;">${request.name}</span>
                    `;
                    
                    const deleteRequestBtn = document.createElement('button');
                    deleteRequestBtn.className = 'delete-request-btn';
                    deleteRequestBtn.title = 'Delete this request';
                    deleteRequestBtn.style.cssText = 'background: #dc3545; color: white; border: none; padding: 3px 6px; border-radius: 3px; cursor: pointer; font-size: 0.7rem; margin-left: 8px;';
                    deleteRequestBtn.innerHTML = '<i class="fas fa-times"></i>';
                    deleteRequestBtn.onclick = (e) => {
                        e.stopPropagation();
                        this.deleteRequestFromCollection(this.collections.indexOf(collection), collection.requests.indexOf(request));
                    };
                    
                    requestItem.appendChild(requestContent);
                    requestItem.appendChild(deleteRequestBtn);
                    
                    requestContent.onmouseenter = () => {
                        requestItem.style.background = '#404040';
                        requestItem.style.borderColor = '#ff6b35';
                    };
                    
                    requestContent.onmouseleave = () => {
                        requestItem.style.background = '#2d2d2d';
                        requestItem.style.borderColor = '#404040';
                    };
                    
                    requestContent.onclick = (e) => {
                        e.stopPropagation();
                        this.loadRequestFromCollection(request);
                    };
                    
                    requestsContainer.appendChild(requestItem);
                });
            } else {
                const noRequestsItem = document.createElement('div');
                noRequestsItem.style.padding = '8px 12px';
                noRequestsItem.style.color = '#888';
                noRequestsItem.style.fontSize = '0.8rem';
                noRequestsItem.style.fontStyle = 'italic';
                noRequestsItem.textContent = 'No requests in this collection';
                requestsContainer.appendChild(noRequestsItem);
            }
            
            collectionsList.appendChild(requestsContainer);
        });
        
        console.log('Collections rendered:', this.collections.length);
    }
    
    deleteCollection(collectionIndex) {
        if (confirm('Are you sure you want to delete this entire collection?')) {
            this.collections.splice(collectionIndex, 1);
            this.renderCollections();
            this.saveData();
            this.showToast('Collection deleted', 'success');
        }
    }
    
    deleteRequestFromCollection(collectionIndex, requestIndex) {
        if (confirm('Are you sure you want to delete this request?')) {
            this.collections[collectionIndex].requests.splice(requestIndex, 1);
            this.renderCollections();
            this.saveData();
            this.showToast('Request deleted from collection', 'success');
        }
    }
    
    loadFromCollection(collection) {
        console.log('Loading collection:', collection);
        
        // For now, just show the collection info
        // In the future, we can add a request selector
        this.showToast(`Collection "${collection.name}" selected (${collection.requests ? collection.requests.length : 0} requests)`, 'info');
    }
    
    loadRequestFromCollection(request) {
        console.log('Loading request from collection:', request);
        
        // Load the request into the current request
        this.currentRequest = { ...request };
        
        // Update UI elements
        document.getElementById('methodSelect').value = this.currentRequest.method;
        document.getElementById('urlInput').value = this.currentRequest.url;
        
        // Update body content
        this.updateBodyContent();
        
        // Update auth content
        this.updateAuthContent();
        
        // Update parameters and headers
        this.renderParams();
        this.renderHeaders();
        
        // Show success message
        this.showToast(`Request "${request.name}" loaded`, 'success');
        
        // Highlight the loaded request
        this.highlightLoadedRequest(request);
    }
    
    highlightLoadedRequest(request) {
        // Remove previous highlights
        document.querySelectorAll('.request-item').forEach(item => {
            item.style.background = '#2d2d2d';
            item.style.borderColor = '#404040';
        });
        
        // Find and highlight the current request
        document.querySelectorAll('.request-item').forEach(item => {
            const methodSpan = item.querySelector('span');
            const nameSpan = item.querySelectorAll('span')[1];
            if (methodSpan && nameSpan && 
                methodSpan.textContent === request.method && 
                nameSpan.textContent === request.name) {
                item.style.background = '#ff6b35';
                item.style.borderColor = '#ff6b35';
                item.style.color = '#fff';
            }
        });
    }
    
    renderParams() {
        const paramsList = document.getElementById('paramsList');
        paramsList.innerHTML = '';
        
        this.currentRequest.params.forEach(param => {
            this.addParam();
            const lastRow = paramsList.lastElementChild;
            lastRow.querySelector('.param-key').value = param.key;
            lastRow.querySelector('.param-value').value = param.value;
        });
    }
    
    renderHeaders() {
        const headersList = document.getElementById('headersList');
        headersList.innerHTML = '';
        
        this.currentRequest.headers.forEach(header => {
            this.addHeader();
            const lastRow = headersList.lastElementChild;
            lastRow.querySelector('.header-key').value = header.key;
            lastRow.querySelector('.header-value').value = header.value;
        });
    }
    
    duplicateRequest() {
        const newRequest = { ...this.currentRequest };
        newRequest.url = newRequest.url + '_copy';
        
        this.currentRequest = newRequest;
        document.getElementById('urlInput').value = newRequest.url;
        
        this.showToast('Request duplicated', 'success');
    }
    
    copyResponse() {
        const responseBody = document.getElementById('responseBody').textContent;
        
        if (window.electronAPI) {
            // Use Electron API to copy to clipboard
            navigator.clipboard.writeText(responseBody).then(() => {
                this.showToast('Response copied to clipboard', 'success');
            }).catch(() => {
                this.showToast('Copy failed', 'error');
            });
        } else {
            // Fallback
            const textArea = document.createElement('textarea');
            textArea.value = responseBody;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showToast('Response copied to clipboard', 'success');
        }
    }
    
    downloadResponse() {
        const responseBody = document.getElementById('responseBody').textContent;
        
        if (window.electronAPI) {
            // Use Electron API to save file
            window.electronAPI.saveFile({ content: responseBody, type: 'response' }).then(result => {
                if (result.success) {
                    this.showToast('Response downloaded', 'success');
                } else if (!result.canceled) {
                    this.showToast('Download failed: ' + result.error, 'error');
                }
            });
        } else {
            // Fallback
            const blob = new Blob([responseBody], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = 'response.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showToast('Response downloaded', 'success');
        }
    }
    
    importCollectionFromFile() {
        console.log('importCollectionFromFile called');
        if (window.electronAPI) {
            // Use Electron API to open file dialog
            window.electronAPI.openFileDialog().then(result => {
                console.log('File dialog result:', result);
                if (result.success && result.data) {
                    console.log('Importing data:', result.data);
                    this.showImportOptions(result.data);
                } else if (!result.canceled) {
                    console.error('Import failed:', result.error);
                    this.showToast('Import failed: ' + result.error, 'error');
                }
            }).catch(error => {
                console.error('File dialog error:', error);
                this.showToast('File dialog error: ' + error.message, 'error');
            });
        } else {
            // Fallback for web version
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        try {
                            const collections = JSON.parse(e.target.result);
                            console.log('Parsed collections:', collections);
                            this.showImportOptions(collections);
                        } catch (error) {
                            console.error('JSON parse error:', error);
                            this.showToast('Invalid JSON file: ' + error.message, 'error');
                        }
                    };
                    reader.onerror = (error) => {
                        console.error('File read error:', error);
                        this.showToast('File read error: ' + error.message, 'error');
                    };
                    reader.readAsText(file);
                }
            };
            input.click();
        }
    }
    
    showImportOptions(collections) {
        const hasExistingCollections = this.collections.length > 0;
        let title = 'Import Collection';
        let content = '';
        
        if (collections.info && collections.item) {
            title = `Import Postman Collection: "${collections.info.name}"`;
            content = `
                <div style="margin-bottom: 15px;">
                    <p><strong>Collection:</strong> ${collections.info.name}</p>
                    <p><strong>Requests:</strong> ${collections.item.length}</p>
                </div>
            `;
        } else if (collections.collections) {
            title = 'Import NB Man Collections';
            content = `
                <div style="margin-bottom: 15px;">
                    <p><strong>Collections:</strong> ${collections.collections.length}</p>
                </div>
            `;
        }
        
        if (hasExistingCollections) {
            content += `
                <div style="margin-bottom: 15px;">
                    <p>You have ${this.collections.length} existing collection(s). Choose import mode:</p>
                </div>
                <div style="text-align: center; margin-bottom: 15px;">
                    <button id="importAddBtn" style="background: #28a745; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-right: 10px;">Add to Existing</button>
                    <button id="importReplaceBtn" style="background: #dc3545; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Replace All</button>
                </div>
            `;
        } else {
            content += `
                <div style="text-align: center;">
                    <button id="importAddBtn" style="background: #28a745; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Import</button>
                </div>
            `;
        }
        
        this.showModal(title, content);
        
        // Bind events after modal is shown
        setTimeout(() => {
            const addBtn = document.getElementById('importAddBtn');
            const replaceBtn = document.getElementById('importReplaceBtn');
            
            if (addBtn) {
                addBtn.addEventListener('click', () => {
                    this.closeModal();
                    this.importCollections(collections, 'add');
                });
            }
            
            if (replaceBtn) {
                replaceBtn.addEventListener('click', () => {
                    this.closeModal();
                    this.importCollections(collections, 'replace');
                });
            }
        }, 100);
    }

    importCollections(collections, mode = 'add') {
        try {
            console.log('Importing collections:', collections, 'Mode:', mode);
            
            // Check if it's a Postman collection format
            if (collections.info && collections.item) {
                console.log('Detected Postman collection format');
                // Convert Postman collection to NB Man format
                const convertedCollections = this.convertPostmanCollection(collections);
                console.log('Converted collections:', convertedCollections);
                
                if (mode === 'replace') {
                    this.collections = convertedCollections;
                    this.showToast(`Postman collection "${collections.info.name}" imported (replaced existing)`, 'success');
                } else {
                    // Add to existing collections
                    this.collections = this.collections.concat(convertedCollections);
                    this.showToast(`Postman collection "${collections.info.name}" imported (added to existing)`, 'success');
                }
                
                this.renderCollections();
                this.saveData();
            } else if (collections && collections.collections) {
                console.log('Detected NB Man format');
                
                if (mode === 'replace') {
                    this.collections = collections.collections;
                    this.showToast('Collections imported (replaced existing)', 'success');
                } else {
                    // Add to existing collections
                    this.collections = this.collections.concat(collections.collections);
                    this.showToast('Collections imported (added to existing)', 'success');
                }
                
                this.renderCollections();
                this.saveData();
            } else {
                console.error('Invalid collection format:', collections);
                this.showToast('Invalid collection format', 'error');
            }
        } catch (error) {
            console.error('Import failed:', error);
            this.showToast('Import failed: ' + error.message, 'error');
        }
    }

    convertPostmanCollection(postmanCollection) {
        try {
            console.log('Converting Postman collection:', postmanCollection);
            
            const collections = [];
            
            // Create main collection
            const mainCollection = {
                id: Date.now(),
                name: postmanCollection.info.name || 'Imported Collection',
                description: postmanCollection.info.description || '',
                requests: []
            };

            // Process variables (environment variables)
            if (postmanCollection.variable) {
                console.log('Processing variables:', postmanCollection.variable);
                const envName = 'Imported Environment';
                this.environments[envName] = {
                    name: envName,
                    variables: {}
                };
                
                postmanCollection.variable.forEach(variable => {
                    this.environments[envName].variables[variable.key] = variable.value;
                });
                
                // Set as current environment
                this.currentEnvironment = envName;
            }

            // Recursively process items
            console.log('Processing items:', postmanCollection.item);
            this.processPostmanItems(postmanCollection.item, mainCollection.requests);

            collections.push(mainCollection);
            console.log('Final converted collection:', collections);
            return collections;
        } catch (error) {
            console.error('Error converting Postman collection:', error);
            throw error;
        }
    }

    processPostmanItems(items, requestsArray) {
        try {
            console.log('Processing items:', items);
            
            items.forEach((item, index) => {
                try {
                    console.log(`Processing item ${index}:`, item);
                    
                    if (item.request) {
                        // This is a request
                        console.log('Converting request:', item);
                        const request = this.convertPostmanRequest(item);
                        requestsArray.push(request);
                        console.log('Converted request:', request);
                    } else if (item.item) {
                        // This is a folder, create a sub-collection
                        console.log('Processing folder:', item);
                        const subCollection = {
                            id: Date.now() + Math.random(),
                            name: item.name || 'Unnamed Folder',
                            requests: []
                        };
                        
                        this.processPostmanItems(item.item, subCollection.requests);
                        requestsArray.push(subCollection);
                        console.log('Created sub-collection:', subCollection);
                    } else {
                        console.warn('Unknown item type:', item);
                    }
                } catch (itemError) {
                    console.error(`Error processing item ${index}:`, itemError, item);
                    // Continue processing other items
                }
            });
        } catch (error) {
            console.error('Error processing Postman items:', error);
            throw error;
        }
    }

    convertPostmanRequest(postmanItem) {
        try {
            console.log('Converting Postman request:', postmanItem);
            
            const request = postmanItem.request;
            if (!request) {
                throw new Error('No request object found in item');
            }
            
            const convertedRequest = {
                id: Date.now() + Math.random(),
                name: postmanItem.name || 'Unnamed Request',
                method: request.method || 'GET',
                url: this.buildUrlFromPostman(request.url),
                params: this.convertPostmanQueryParams(request.url),
                headers: this.convertPostmanHeaders(request.header),
                body: this.convertPostmanBody(request.body),
                auth: this.convertPostmanAuth(request.auth),
                description: request.description || ''
            };

            console.log('Converted request:', convertedRequest);
            return convertedRequest;
        } catch (error) {
            console.error('Error converting Postman request:', error, postmanItem);
            throw error;
        }
    }

    buildUrlFromPostman(urlObj) {
        if (typeof urlObj === 'string') {
            return urlObj;
        }
        
        if (urlObj.raw) {
            // Fix URL format if missing protocol
            let rawUrl = urlObj.raw;
            if (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
                // Check if it's a localhost URL
                if (rawUrl.includes('localhost') || rawUrl.includes('127.0.0.1')) {
                    rawUrl = 'http://' + rawUrl;
                } else {
                    // Default to https for external URLs
                    rawUrl = 'https://' + rawUrl;
                }
            }
            return rawUrl;
        }
        
        let url = '';
        
        // Determine protocol
        if (urlObj.protocol) {
            url += urlObj.protocol + '://';
        } else {
            // Default protocol based on host
            if (urlObj.host && (Array.isArray(urlObj.host) ? 
                urlObj.host.some(h => h.includes('localhost') || h.includes('127.0.0.1')) : 
                (urlObj.host.includes('localhost') || urlObj.host.includes('127.0.0.1')))) {
                url += 'http://';
            } else {
                url += 'https://';
            }
        }
        
        // Add host
        if (urlObj.host) {
            if (Array.isArray(urlObj.host)) {
                url += urlObj.host.join('.');
            } else {
                url += urlObj.host;
            }
        }
        
        // Add port
        if (urlObj.port) {
            url += ':' + urlObj.port;
        }
        
        // Add path
        if (urlObj.path) {
            if (Array.isArray(urlObj.path)) {
                url += '/' + urlObj.path.join('/');
            } else {
                url += '/' + urlObj.path;
            }
        }
        
        return url;
    }

    convertPostmanQueryParams(urlObj) {
        const params = [];
        
        if (urlObj.query) {
            urlObj.query.forEach(query => {
                params.push({
                    key: query.key || '',
                    value: query.value || '',
                    enabled: query.disabled !== true
                });
            });
        }
        
        return params;
    }

    convertPostmanHeaders(headers) {
        const convertedHeaders = [];
        
        if (headers) {
            headers.forEach(header => {
                convertedHeaders.push({
                    key: header.key || '',
                    value: header.value || '',
                    enabled: header.disabled !== true
                });
            });
        }
        
        return convertedHeaders;
    }

    convertPostmanBody(body) {
        if (!body) {
            return { type: 'none' };
        }
        
        switch (body.mode) {
            case 'raw':
                return {
                    type: 'raw',
                    content: body.raw || ''
                };
            case 'urlencoded':
                return {
                    type: 'form',
                    data: this.convertUrlEncodedToForm(body.urlencoded)
                };
            case 'formdata':
                return {
                    type: 'form',
                    data: this.convertFormData(body.formdata)
                };
            case 'file':
                return {
                    type: 'raw',
                    content: 'File upload not supported in NB Man'
                };
            default:
                return { type: 'none' };
        }
    }

    convertFormData(formdata) {
        const convertedData = [];
        
        if (formdata) {
            formdata.forEach(item => {
                // Skip file type items for now
                if (item.type === 'file') {
                    convertedData.push({
                        key: item.key || '',
                        value: '[File upload not supported]',
                        type: 'text',
                        enabled: item.disabled !== true
                    });
                } else {
                    convertedData.push({
                        key: item.key || '',
                        value: item.value || '',
                        type: item.type || 'text',
                        enabled: item.disabled !== true
                    });
                }
            });
        }
        
        return convertedData;
    }

    convertUrlEncodedToForm(urlencoded) {
        const formData = [];
        
        if (urlencoded) {
            urlencoded.forEach(item => {
                formData.push({
                    key: item.key || '',
                    value: item.value || '',
                    type: 'text',
                    enabled: item.disabled !== true
                });
            });
        }
        
        return formData;
    }



    convertPostmanAuth(auth) {
        if (!auth) {
            return { type: 'none' };
        }
        
        switch (auth.type) {
            case 'bearer':
                return {
                    type: 'bearer',
                    token: auth.bearer?.[0]?.value || ''
                };
            case 'basic':
                return {
                    type: 'basic',
                    username: auth.basic?.[0]?.value || '',
                    password: auth.basic?.[1]?.value || ''
                };
            case 'apikey':
                return {
                    type: 'apiKey',
                    key: auth.apikey?.[0]?.value || '',
                    value: auth.apikey?.[1]?.value || '',
                    in: auth.apikey?.[2]?.value || 'header'
                };
            default:
                return { type: 'none' };
        }
    }
    
    exportCollections(filePath) {
        const data = {
            collections: this.collections,
            environments: this.environments
        };
        
        if (window.electronAPI) {
            // Use Electron API to save file
            window.electronAPI.saveFile(data).then(result => {
                if (result.success) {
                    this.showToast('Collections exported successfully', 'success');
                } else if (!result.canceled) {
                    this.showToast('Export failed: ' + result.error, 'error');
                }
            });
        }
    }
    
    openSettings() {
        this.showModal('Settings', `
            <div style="margin-bottom: 15px;">
                <h4>Application Settings</h4>
                <p>Version: v1.0.0</p>
                <p>Platform: ${window.electronAPI ? window.electronAPI.getPlatform() : 'Web'}</p>
            </div>
            <div style="text-align: right;">
                <button onclick="nbManApp.closeModal()" style="background: #ff6b35; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Close</button>
            </div>
        `);
    }
    
    applyEnvironment() {
        const env = this.environments[this.currentEnvironment];
        if (env && env.baseUrl) {
            const urlInput = document.getElementById('urlInput');
            if (!urlInput.value.startsWith('http')) {
                urlInput.value = env.baseUrl + urlInput.value;
            }
        }
    }
    
    showNewCollectionModal() {
        console.log('showNewCollectionModal called');
        this.showModal('New Collection', `
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: 600;">Collection Name</label>
                <input type="text" id="collectionName" placeholder="Enter collection name" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            <div style="text-align: right;">
                <button id="createCollectionBtn" style="background: #ff6b35; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Create</button>
            </div>
        `);
        
        // Bind the create button event after modal is shown
        setTimeout(() => {
            const createBtn = document.getElementById('createCollectionBtn');
            if (createBtn) {
                createBtn.addEventListener('click', () => {
                    console.log('Create button clicked');
                    this.createCollection();
                });
            } else {
                console.error('Create button not found');
            }
        }, 100);
    }
    
    createCollection() {
        console.log('createCollection called');
        const nameInput = document.getElementById('collectionName');
        
        if (!nameInput) {
            console.error('collectionName input not found');
            this.showToast('Error: Input field not found', 'error');
            return;
        }
        
        const name = nameInput.value.trim();
        console.log('Collection name:', name);
        
        if (!name) {
            this.showToast('Please enter collection name', 'error');
            return;
        }
        
        const collection = {
            id: Date.now(),
            name: name,
            requests: []
        };
        
        console.log('Creating collection:', collection);
        this.collections.push(collection);
        this.renderCollections();
        this.saveData();
        this.closeModal();
        this.showToast('Collection created', 'success');
    }
    
    showModal(title, content) {
        console.log('showModal called with title:', title);
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        const modal = document.getElementById('modal');
        
        if (!modalTitle || !modalBody || !modal) {
            console.error('Modal elements not found');
            return;
        }
        
        modalTitle.textContent = title;
        modalBody.innerHTML = content;
        modal.style.display = 'block';
        console.log('Modal displayed');
    }
    
    closeModal() {
        document.getElementById('modal').style.display = 'none';
    }
    
    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type} show`;
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
    
    saveData() {
        try {
            const data = {
                collections: this.collections,
                history: this.history,
                environments: this.environments
            };
            
            const jsonData = JSON.stringify(data);
            localStorage.setItem('nbMan', jsonData);
            
            console.log('Data saved successfully');
            console.log('Collections count:', this.collections.length);
            console.log('History count:', this.history.length);
            console.log('Data size:', jsonData.length, 'bytes');
        } catch (error) {
            console.error('Failed to save data:', error);
            this.showToast('Failed to save data: ' + error.message, 'error');
        }
    }
    
    loadData() {
        try {
            const data = localStorage.getItem('nbMan');
            console.log('Loading data from localStorage...');
            
            if (data) {
                console.log('Found data in localStorage, size:', data.length, 'bytes');
                const parsed = JSON.parse(data);
                
                this.collections = parsed.collections || [];
                this.history = parsed.history || [];
                this.environments = { ...this.environments, ...parsed.environments };
                
                console.log('Data loaded successfully');
                console.log('Collections loaded:', this.collections.length);
                console.log('History loaded:', this.history.length);
                console.log('Environments loaded:', Object.keys(this.environments).length);
            } else {
                console.log('No data found in localStorage, starting fresh');
            }
        } catch (error) {
            console.error('Failed to load data:', error);
            this.showToast('Failed to load data: ' + error.message, 'error');
        }
    }
}

// Initialize application only once
if (!window.nbManApp) {
    const nbManApp = new NBManApp();
    nbManApp.init();
    
    // Global function for HTML calls
    window.nbManApp = nbManApp;
    console.log('NB Man application initialized');
} else {
    console.log('NB Man application already initialized');
} 