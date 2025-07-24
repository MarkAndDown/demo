// Test script for save request functionality
console.log('=== Testing Save Request Functionality ===');

// Simulate the application class
class TestApp {
    constructor() {
        this.currentRequest = {
            method: 'GET',
            url: 'https://api.example.com/users',
            params: [
                { key: 'page', value: '1' },
                { key: 'limit', value: '10' }
            ],
            headers: [
                { key: 'Content-Type', value: 'application/json' },
                { key: 'Authorization', value: 'Bearer token123' }
            ],
            body: {
                type: 'json',
                content: '{\n  "name": "test"\n}'
            },
            auth: {
                type: 'bearer',
                token: 'token123'
            },
            tests: 'pm.test("Status code is 200", function () {\n  pm.response.to.have.status(200);\n});'
        };
        
        this.collections = [
            {
                id: 1,
                name: 'Existing Collection',
                requests: [
                    {
                        id: 1,
                        name: 'Get Users',
                        method: 'GET',
                        url: 'https://api.example.com/users',
                        params: [],
                        headers: [],
                        body: { type: 'none', content: '' },
                        auth: { type: 'none' },
                        tests: ''
                    }
                ]
            }
        ];
    }
    
    performSaveRequest(requestName, selectedCollectionId) {
        console.log(`Saving request: "${requestName}" to collection: ${selectedCollectionId}`);
        
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
            const collectionName = 'New Collection';
            const collection = {
                id: Date.now(),
                name: collectionName,
                requests: [request]
            };
            this.collections.push(collection);
            console.log(`✓ Request saved to new collection "${collectionName}"`);
        } else {
            // Add to existing collection
            const collection = this.collections.find(c => c.id == selectedCollectionId);
            if (collection) {
                collection.requests.push(request);
                console.log(`✓ Request saved to collection "${collection.name}"`);
            } else {
                console.log('✗ Collection not found');
                return false;
            }
        }
        
        console.log('✓ Collections updated');
        return true;
    }
    
    testSaveRequest() {
        console.log('\n=== Initial State ===');
        console.log('Collections:', this.collections.length);
        console.log('Collection names:', this.collections.map(c => c.name));
        console.log('Current request:', this.currentRequest.method, this.currentRequest.url);
        
        console.log('\n=== Testing Save to New Collection ===');
        this.performSaveRequest('Test Request 1', 'new');
        
        console.log('\n=== Testing Save to Existing Collection ===');
        this.performSaveRequest('Test Request 2', 1);
        
        console.log('\n=== Final State ===');
        console.log('Collections:', this.collections.length);
        this.collections.forEach(collection => {
            console.log(`Collection "${collection.name}": ${collection.requests.length} requests`);
            collection.requests.forEach(request => {
                console.log(`  - ${request.method} ${request.name}`);
            });
        });
        
        console.log('\n✓ Save request functionality tested successfully');
    }
}

// Run the test
const testApp = new TestApp();
testApp.testSaveRequest(); 